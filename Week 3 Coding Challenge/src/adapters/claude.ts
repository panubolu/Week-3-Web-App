// The only code that talks to Claude (ADR-0011).
// Callers send instructions, the member's text and the reply format they need,
// and get back either a checked reply or a plain reason why Claude couldn't help.
// On any failure the caller shows its own server-built reply, so buttons keep working.

import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";

/** Claude must answer within this time, or the member gets the plain reply. */
export const CLAUDE_TIMEOUT_MS = 10_000;
const DEFAULT_MODEL = "claude-opus-5-5";
const DEFAULT_MAX_TOKENS = 4000;

export type ClaudeRequest<T> = {
  /** Short label for the logs, such as "typed-answer". Never message text. */
  purpose: string;
  /** Instructions and rules. The member's text never goes here. */
  system: string;
  /** The member's own words, sent as data in the user turn. */
  message: string;
  /** The reply format Claude must follow (JSON Schema). */
  jsonSchema: Record<string, unknown>;
  /** The same format as a Zod schema, used to check the reply. */
  validate: z.ZodType<T>;
  maxTokens?: number;
};

export type ClaudeFailure = "not_configured" | "timeout" | "refusal" | "bad_format" | "unavailable";

export type ClaudeResult<T> = { ok: true; data: T } | { ok: false; reason: ClaudeFailure };

/** One model call, reduced to what the rules below need. */
export type ModelReply = { stopReason: string | null; text: string; model: string };

export type CallModel = (input: {
  system: string;
  message: string;
  jsonSchema: Record<string, unknown>;
  maxTokens: number;
}) => Promise<ModelReply>;

export class ClaudeTimeoutError extends Error {}
export class ClaudeUnavailableError extends Error {}

function logCall(purpose: string, outcome: string, startedAt: number, model?: string) {
  // Timing and outcome only, never the member's text (T-14).
  const ms = Math.round(performance.now() - startedAt);
  console.info(`Claude ${purpose}: ${outcome} in ${ms}ms${model ? ` (${model})` : ""}`);
}

function readReply<T>(reply: ModelReply, validate: z.ZodType<T>): T | null {
  try {
    const checked = validate.safeParse(JSON.parse(reply.text));
    return checked.success ? checked.data : null;
  } catch {
    return null;
  }
}

/**
 * The rules for one Claude request, with the model call passed in, so tests
 * can use a fake Claude that costs nothing.
 * - A timeout or an error stops right away: no retry, plain reply.
 * - A refusal is checked before the reply is read.
 * - A reply in the wrong format is retried once.
 */
export async function askWith<T>(callModel: CallModel, request: ClaudeRequest<T>): Promise<ClaudeResult<T>> {
  const input = {
    system: request.system,
    message: request.message,
    jsonSchema: request.jsonSchema,
    maxTokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
  };

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const startedAt = performance.now();
    let reply: ModelReply;
    try {
      reply = await callModel(input);
    } catch (error) {
      if (error instanceof ClaudeTimeoutError) {
        logCall(request.purpose, "timeout", startedAt);
        return { ok: false, reason: "timeout" };
      }
      logCall(request.purpose, `unavailable (${error instanceof Error ? error.message : "error"})`, startedAt);
      return { ok: false, reason: "unavailable" };
    }

    if (reply.stopReason === "refusal") {
      logCall(request.purpose, "refusal", startedAt, reply.model);
      return { ok: false, reason: "refusal" };
    }

    const data = reply.stopReason === "end_turn" ? readReply(reply, request.validate) : null;
    if (data !== null) {
      logCall(request.purpose, attempt === 1 ? "ok" : "ok on retry", startedAt, reply.model);
      return { ok: true, data };
    }
    logCall(request.purpose, `bad format (stop: ${reply.stopReason}), attempt ${attempt}`, startedAt, reply.model);
  }
  return { ok: false, reason: "bad_format" };
}

let realCaller: CallModel | null | undefined;

/** Builds the real model call once. Returns null when no API key is set. */
function getRealCaller(): CallModel | null {
  if (realCaller !== undefined) return realCaller;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    realCaller = null;
    return realCaller;
  }

  // Our own limit: 10 seconds and no automatic retries (ADR-0009).
  const client = new Anthropic({ apiKey, timeout: CLAUDE_TIMEOUT_MS, maxRetries: 0 });
  const model = process.env.CLAUDE_MODEL || DEFAULT_MODEL;

  realCaller = async ({ system, message, jsonSchema, maxTokens }) => {
    try {
      const response = await client.beta.messages.create({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: message }],
        // Structured outputs keep the reply in a fixed format. Effort starts
        // low, as ADR-0011 says; thinking can't be turned off on Opus 5.5.
        output_config: { effort: "low", format: { type: "json_schema", schema: jsonSchema } },
        // If Claude declines, Anthropic retries on a suitable model in the
        // same call. Models without fallbacks simply keep the refusal.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      });
      const text = response.content
        .map((block) => (block.type === "text" ? block.text : ""))
        .join("");
      return { stopReason: response.stop_reason, text, model: response.model };
    } catch (error) {
      if (error instanceof Anthropic.APIConnectionTimeoutError) throw new ClaudeTimeoutError();
      if (error instanceof Anthropic.APIError) {
        throw new ClaudeUnavailableError(`status ${error.status ?? "none"}`);
      }
      throw new ClaudeUnavailableError("connection");
    }
  };
  return realCaller;
}

/** Asks Claude for a reply in a fixed format. Never throws. */
export async function askClaude<T>(request: ClaudeRequest<T>): Promise<ClaudeResult<T>> {
  const caller = getRealCaller();
  if (!caller) {
    console.warn(`Claude ${request.purpose}: not configured (no ANTHROPIC_API_KEY)`);
    return { ok: false, reason: "not_configured" };
  }
  return askWith(caller, request);
}
