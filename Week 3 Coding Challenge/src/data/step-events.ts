import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

type StepEvent = {
  sessionId: string;
  userId: string;
  step: string;
  eventType: "answered" | "edited" | "completed";
};

/** Records progress for the KPIs. A failure here never blocks the member. */
export async function addStepEvent(client: SupabaseClient, event: StepEvent) {
  const { error } = await client.from("step_events").insert({
    session_id: event.sessionId,
    user_id: event.userId,
    step: event.step,
    event_type: event.eventType,
  });
  if (error) console.error("Step event not saved:", error.code);
}
