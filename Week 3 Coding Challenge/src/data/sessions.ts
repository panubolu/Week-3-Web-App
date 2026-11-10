import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConversationState, Step } from "@/domain/conversation";
import { withOneRetry } from "./retry";

export type SessionRow = {
  id: string;
  user_id: string;
  current_step: string;
  goal: string | null;
  experience_level: string | null;
  availability: string | null;
  completed: boolean;
  miss_count: number;
  version: number;
};

export type SessionChanges = Pick<
  SessionRow,
  "current_step" | "goal" | "experience_level" | "availability" | "completed" | "miss_count"
>;

const COLUMNS =
  "id, user_id, current_step, goal, experience_level, availability, completed, miss_count, version";

/** The same session with only the miss count changed (T-19). */
export function withMissCount(session: SessionRow, missCount: number): SessionChanges {
  return {
    current_step: session.current_step,
    goal: session.goal,
    experience_level: session.experience_level,
    availability: session.availability,
    completed: session.completed,
    miss_count: missCount,
  };
}
const UNIQUE_VIOLATION = "23505";

export function toConversationState(session: SessionRow): ConversationState {
  return {
    currentStep: session.current_step as Step,
    goal: session.goal,
    experience: session.experience_level,
    availability: session.availability,
    completed: session.completed,
  };
}

export async function findSession(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("sessions")
    .select(COLUMNS)
    .eq("user_id", userId)
    .maybeSingle<SessionRow>();
  if (error) throw new Error(`Could not read session: ${error.code}`);
  return data;
}

/** Returns this person's session, creating it on their first visit. */
export async function getOrCreateSession(
  client: SupabaseClient,
  userId: string,
): Promise<SessionRow> {
  const existing = await findSession(client, userId);
  if (existing) return existing;

  const { data, error } = await client
    .from("sessions")
    .insert({ user_id: userId })
    .select(COLUMNS)
    .single<SessionRow>();

  if (data) return data;

  // Two tabs can start at once. If the other tab won, use its row.
  if (error?.code === UNIQUE_VIOLATION) {
    const winner = await findSession(client, userId);
    if (winner) return winner;
  }
  throw new Error(`Could not create session: ${error?.code ?? "unknown"}`);
}

/**
 * Saves changes only if nobody saved since this session was read.
 * Returns null when another tab got there first.
 */
export function saveSession(
  client: SupabaseClient,
  session: SessionRow,
  changes: SessionChanges,
) {
  // Safe to retry: the version check stops a write from applying twice.
  // If the first try saved but its reply was lost, the retry finds a newer
  // version and returns null, so the screen reloads the latest state.
  return withOneRetry(async () => {
    const { data, error } = await client
      .from("sessions")
      .update({ ...changes, version: session.version + 1 })
      .eq("id", session.id)
      .eq("version", session.version)
      .select(COLUMNS)
      .maybeSingle<SessionRow>();
    if (error) throw new Error(`Could not save session: ${error.code}`);
    return data;
  });
}
