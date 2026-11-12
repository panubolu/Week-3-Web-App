/**
 * Lets Delete my data tell the other screens that the member's data is gone.
 *
 * Next.js keeps pages the member has visited ready in the background, so a
 * page they return to can still hold what it showed before. Each screen
 * remembers the count it last saw; when the count has gone up, it throws
 * away what it was showing and starts fresh instead of reloading quietly.
 */
let deletions = 0;

export function markDataDeleted() {
  deletions += 1;
}

export function dataDeletions() {
  return deletions;
}
