/**
 * Lightweight client error reporting — structured console + optional future sinks.
 * Never throws; safe to call from catch blocks.
 */
export function reportClientError(
  source: string,
  error: unknown,
  meta?: Record<string, unknown>,
): void {
  const message = error instanceof Error ? error.message : String(error);
  const payload = {
    source,
    message,
    meta: meta ?? {},
    at: new Date().toISOString(),
  };
  // Structured log for browser tooling / future Sentry wiring
  console.error("[SchoolFlow]", payload);
}
