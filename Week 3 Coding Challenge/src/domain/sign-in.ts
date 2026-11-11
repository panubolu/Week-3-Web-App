export type GoogleMode = "save" | "sign-in";

/**
 * Which Save my progress button is the main one.
 * After Google says the account already has saved progress, connecting it
 * again only shows the same message, so signing in becomes the main action.
 */
export function primaryGoogleMode(status: string | undefined): GoogleMode {
  return status === "already-saved" ? "sign-in" : "save";
}
