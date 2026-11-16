/**
 * Detects Temporal values (Temporal.Instant, Temporal.Duration, and the rest) by their
 * Symbol.toStringTag, so it works with native Temporal and polyfills alike.
 */
export function isTemporalValue(value: unknown): boolean {
  return (
    value !== null && typeof value === 'object' && /^\[object Temporal\./.test(Object.prototype.toString.call(value))
  );
}
