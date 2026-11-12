export type GoogleMode = "save" | "sign-in";

/**
 * Asks Google to show its account chooser every time, instead of silently
 * reusing whichever Google account the browser last used. Without it, people
 * who share a computer or have two Google accounts can't pick the right one
 * (found during the two-account check, T-06 and T-07).
 */
export const GOOGLE_QUERY_PARAMS = { prompt: "select_account" } as const;

/**
 * Which Save my progress button is the main one.
 * After Google says the account already has saved progress, connecting it
 * again only shows the same message, so signing in becomes the main action.
 */
export function primaryGoogleMode(status: string | undefined): GoogleMode {
  return status === "already-saved" ? "sign-in" : "save";
}
