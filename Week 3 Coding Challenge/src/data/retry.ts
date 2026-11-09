/** How long one database call may take before it counts as failed. */
export const DATABASE_TIMEOUT_MS = 8000;

/**
 * Runs a database write, and tries once more if it fails (Architecture Step 8).
 * A second failure goes to the caller, which shows a friendly message.
 */
export async function withOneRetry<T>(work: () => Promise<T>, waitMs = 250): Promise<T> {
  try {
    return await work();
  } catch (error) {
    console.warn("Database write failed, retrying once:", error);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return work();
  }
}

/** Adds a time limit to every database request, keeping any signal it already has. */
export function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const timeout = AbortSignal.timeout(DATABASE_TIMEOUT_MS);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  return fetch(input, { ...init, signal });
}
