import { NextResponse } from "next/server";
import { z } from "zod";
import { answerQuestion } from "@/actions/answer-question";
import { answerTyped } from "@/actions/answer-typed";
import { TYPED_MAX } from "@/domain/typed-answer";

const requestSchema = z.discriminatedUnion("type", [
  z.strictObject({
    type: z.literal("answer"),
    field: z.enum(["goal", "experience", "availability"]),
    value: z.string().min(1).max(50),
  }),
  z.strictObject({ type: z.literal("finish") }),
  // A typed answer. Length is checked separately for a clearer message.
  z.strictObject({ type: z.literal("text"), text: z.string() }),
]);

const BUTTONS_STILL_WORK = "You can still choose one of the options above.";

const refusals = {
  no_session: {
    status: 401,
    message: "Your session has ended. Please refresh the page to continue.",
  },
  conflict: {
    status: 409,
    message: "This changed in another tab. Please reload to see the latest.",
  },
  not_allowed: {
    status: 409,
    message: "That step isn't available right now. Please answer the current question.",
  },
  invalid_value: {
    status: 400,
    message: "Please choose one of the options shown.",
  },
  too_long: {
    status: 400,
    message: `Please keep your answer under ${TYPED_MAX} characters.`,
  },
  empty: {
    status: 400,
    message: "Please type an answer first, or choose one of the options.",
  },
  unclear: {
    status: 422,
    message: `I didn't quite catch that. Could you say it another way? ${BUTTONS_STILL_WORK}`,
  },
  limited: {
    status: 429,
    message: `You've reached the typing limit for now. You can try typing again in about an hour. ${BUTTONS_STILL_WORK}`,
  },
  claude_unavailable: {
    status: 503,
    message: `I couldn't understand typed answers just now. ${BUTTONS_STILL_WORK}`,
  },
} as const;

type Refusal = keyof typeof refusals;

function refuse(reason: Refusal) {
  const refusal = refusals[reason];
  // Security log: the reason only, never the request body or who sent it.
  if (reason !== "unclear") console.warn(`Chat refused: ${reason}`);
  return NextResponse.json({ error: reason, message: refusal.message }, { status: refusal.status });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    console.warn("Chat refused: invalid_request");
    return NextResponse.json(
      { error: "invalid_request", message: refusals.invalid_value.message },
      { status: 400 },
    );
  }

  try {
    let result;
    if (parsed.data.type === "text") {
      const text = parsed.data.text.trim();
      if (!text) return refuse("empty");
      if (text.length > TYPED_MAX) return refuse("too_long");
      result = await answerTyped(text);
    } else {
      result = await answerQuestion(parsed.data);
    }

    if (result.status === "ok") return NextResponse.json(result.view);
    return refuse(result.status);
  } catch (error) {
    // Details stay in server logs. The browser gets a plain message.
    console.error("Answer failed:", error);
    return NextResponse.json(
      {
        error: "unavailable",
        message:
          "We couldn't save your answer just now. Your earlier answers are safe. Please try again.",
      },
      { status: 503 },
    );
  }
}
