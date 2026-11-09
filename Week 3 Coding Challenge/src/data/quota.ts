import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Counts one Claude call for the signed-in person, or says no (T-17).
 * The database function takes the person from the secure session, never
 * from the request, and enforces the hourly and daily limits.
 * Throws if the check can't run, so the caller never calls Claude by mistake.
 */
export async function consumeChatQuota(client: SupabaseClient) {
  const { data, error } = await client.rpc("consume_chat_quota");
  if (error) throw new Error(`Could not check the usage limit: ${error.code}`);
  return data === true;
}
