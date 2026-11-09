import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Deletes the signed-in person and all their rows. The database function
 * uses only the identity in the secure cookie, never an ID from the request.
 */
export async function deleteMyAccount(client: SupabaseClient) {
  const { data, error } = await client.rpc("delete_my_account");
  if (error) throw new Error(`Could not delete account: ${error.code}`);
  return data === true;
}
