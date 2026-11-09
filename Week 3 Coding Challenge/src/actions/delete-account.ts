import "server-only";

import { deleteMyAccount } from "@/data/accounts";
import { createDataClient } from "@/data/client";

/**
 * Steps for: Delete my data
 * 1. Find who this person is from their secure cookie
 * 2. Delete their account; the database removes all their rows with it
 * 3. Clear the cookie in this browser
 */
export async function deleteAccount() {
  const client = await createDataClient();
  const { data } = await client.auth.getUser();
  if (!data.user) return "nothing" as const;

  const deleted = await deleteMyAccount(client);
  // The account is gone, so only this browser's cookie is left to clear.
  await client.auth.signOut({ scope: "local" }).catch(() => {});
  return deleted ? ("deleted" as const) : ("nothing" as const);
}
