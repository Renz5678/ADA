/**
 * Sliding-window IP rate limiter backed by an abstract Redis-like store.
 *
 * Design:
 *  - Uses a Redis INCR + EXPIRE pattern.  On the first request in a window
 *    INCR creates the key and EXPIRE sets the TTL; on subsequent requests
 *    within the same window INCR just increments.
 *  - The store interface is minimal and matchable by @upstash/redis as well
 *    as a plain mock object in tests — no concrete import here.
 *
 * This is a pure function module with no side-effects at module load time,
 * making it straightforward to unit-test without a real Redis connection.
 */

export interface RateLimitStore {
  /** Atomically increment the key and return the new value. */
  incr(key: string): Promise<number>;
  /**
   * Set a TTL on a key (seconds).  Should be a no-op if the key already has
   * a TTL (i.e. only set expiry on the first call per window).
   * Using NX (Only set the expiry if it does not already exist).
   */
  expire(key: string, seconds: number, option?: 'NX' | 'XX' | 'GT' | 'LT'): Promise<number | boolean>;
}

export interface RateLimitResult {
  /** Whether the request is within the allowed limit. */
  allowed: boolean;
  /** How many requests have been made in the current window (after this one). */
  current: number;
  /** Maximum requests allowed per window. */
  limit: number;
}

/**
 * Check and increment the rate-limit counter for a given identifier (IP).
 *
 * @param store  A Redis-compatible store (real Upstash client or mock).
 * @param key    Identifier for the rate-limit bucket, e.g. `rl:127.0.0.1`.
 * @param limit  Maximum number of requests allowed per window.
 * @param windowSeconds  Duration of the sliding window in seconds.
 */
export async function checkRateLimit(
  store: RateLimitStore,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const current = await store.incr(key);

  // Only set the TTL on the first increment so the window is fixed from
  // the first request.  NX means "only set expire if key has no TTL yet."
  if (current === 1) {
    await store.expire(key, windowSeconds, 'NX');
  }

  return {
    allowed: current <= limit,
    current,
    limit,
  };
}
