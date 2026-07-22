/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tests for src/middleware.ts — the wiring layer.
 *
 * These tests call the actual exported middleware() function with a mocked
 * NextRequest and assert the full HTTP behaviour:
 *
 *   Bot detection:
 *     - Returns 403 for known bad bot UAs (curl, python-requests, no UA)
 *     - Passes through for Googlebot and normal browser UAs
 *
 *   Rate limiting (429):
 *     - Returns 429 when checkRateLimit reports not allowed
 *     - 429 response carries X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After
 *
 *   Pass-through:
 *     - Calls NextResponse.next() when both checks pass
 *     - Pass-through response carries X-RateLimit-Limit / X-RateLimit-Remaining headers
 *
 *   Fail-open:
 *     - Passes through when checkRateLimit throws
 *     - Logs the distinct [RATE_LIMIT_STORE_UNAVAILABLE] tag
 *
 *   IP key derivation:
 *     - Uses first IP from x-forwarded-for
 *     - Falls back to x-real-ip
 *
 * The Redis client and checkRateLimit are mocked; no real network calls are made.
 */

// ---------------------------------------------------------------------------
// next/server mock — must be before any import of middleware
// ---------------------------------------------------------------------------
jest.mock('next/server', () => {
  // A minimal NextResponse shape that records what the middleware sets on it
  function MockNextResponse(
    body: string | null,
    init?: { status?: number; headers?: Record<string, string> }
  ) {
    return {
      _type: 'NextResponse',
      status: init?.status ?? 200,
      body,
      _initHeaders: init?.headers ?? {},
      headers: {
        _store: {} as Record<string, string>,
        set(k: string, v: string) { this._store[k] = v; },
        get(k: string) { return (init?.headers ?? {})[k] ?? this._store[k] ?? null; },
      },
    };
  }

  MockNextResponse.next = jest.fn(() => ({
    _type: 'NextResponseNext',
    status: 200,
    headers: {
      _store: {} as Record<string, string>,
      set: jest.fn(function(this: { _store: Record<string, string> }, k: string, v: string) {
        this._store[k] = v;
      }),
      get: jest.fn(function(this: { _store: Record<string, string> }, k: string) {
        return this._store[k] ?? null;
      }),
    },
  }));

  return { NextResponse: MockNextResponse };
});

// ---------------------------------------------------------------------------
// @upstash/redis mock — constructor must succeed so getRedis() returns a client
// ---------------------------------------------------------------------------
const mockRedisInstance = { incr: jest.fn(), expire: jest.fn() };
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn(() => mockRedisInstance),
}));

// ---------------------------------------------------------------------------
// ./lib/rateLimiter mock — we control checkRateLimit() return values per test
// ---------------------------------------------------------------------------
const mockCheckRateLimit = jest.fn();
jest.mock('../lib/rateLimiter', () => ({
  checkRateLimit: mockCheckRateLimit,
}));

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------
import { middleware } from '../middleware';
import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeRequest(opts: {
  userAgent?: string;
  xForwardedFor?: string;
  xRealIp?: string;
} = {}) {
  const h = new Map<string, string>();
  if (opts.userAgent !== undefined) h.set('user-agent', opts.userAgent);
  if (opts.xForwardedFor)           h.set('x-forwarded-for', opts.xForwardedFor);
  if (opts.xRealIp)                 h.set('x-real-ip', opts.xRealIp);
  return { headers: { get: (k: string) => h.get(k) ?? null } } as any;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  jest.clearAllMocks();

  // Restore NextResponse.next mock freshly each test
  (NextResponse as any).next = jest.fn(() => ({
    _type: 'NextResponseNext',
    status: 200,
    headers: {
      _store: {} as Record<string, string>,
      set: jest.fn(function(this: { _store: Record<string, string> }, k: string, v: string) {
        this._store[k] = v;
      }),
      get: jest.fn(function(this: { _store: Record<string, string> }, k: string) {
        return this._store[k] ?? null;
      }),
    },
  }));

  // Ensure Redis env vars are set so getRedis() returns a client
  process.env.UPSTASH_REDIS_REST_URL = 'https://fake.upstash.io';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'fake-token';
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

// ===========================================================================
// 1. Bot UA detection — regression check
// ===========================================================================
describe('middleware — bot UA detection', () => {
  it('returns 403 for curl (bad bot)', async () => {
    const res = await middleware(makeRequest({ userAgent: 'curl/7.88.1', xForwardedFor: '1.2.3.4' })) as any;
    expect(res.status).toBe(403);
    expect(JSON.parse(res.body)).toMatchObject({ error: expect.stringContaining('Access denied') });
    expect(mockCheckRateLimit).not.toHaveBeenCalled();
  });

  it('returns 403 for python-requests (bad bot)', async () => {
    const res = await middleware(makeRequest({ userAgent: 'python-requests/2.31.0', xForwardedFor: '1.2.3.4' })) as any;
    expect(res.status).toBe(403);
  });

  it('returns 403 for missing User-Agent', async () => {
    // No userAgent key at all → headers.get('user-agent') returns null → '' after ??
    const res = await middleware(makeRequest({ xForwardedFor: '1.2.3.4' })) as any;
    expect(res.status).toBe(403);
    expect(mockCheckRateLimit).not.toHaveBeenCalled();
  });

  it('allows Googlebot through (good bot exemption)', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({ allowed: true, current: 1, limit: 30 });
    const res = await middleware(makeRequest({
      userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      xForwardedFor: '66.249.66.1',
    })) as any;
    expect(res.status).not.toBe(403);
  });

  it('allows a normal browser UA through', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({ allowed: true, current: 1, limit: 30 });
    const res = await middleware(makeRequest({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      xForwardedFor: '1.2.3.4',
    })) as any;
    expect(res.status).not.toBe(403);
  });
});

// ===========================================================================
// 2. Rate limit — 429 with correct headers
// ===========================================================================
describe('middleware — rate limit exceeded (429)', () => {
  const blockedResult = { allowed: false, current: 31, limit: 30 };
  const goodUA = 'Mozilla/5.0 AppleWebKit/537.36';

  it('returns 429 when checkRateLimit reports not allowed', async () => {
    mockCheckRateLimit.mockResolvedValueOnce(blockedResult);
    const res = await middleware(makeRequest({ userAgent: goodUA, xForwardedFor: '1.2.3.4' })) as any;
    expect(res.status).toBe(429);
    expect(JSON.parse(res.body)).toMatchObject({ error: expect.stringContaining('Too many requests') });
  });

  it('sets X-RateLimit-Limit header to the configured limit', async () => {
    mockCheckRateLimit.mockResolvedValueOnce(blockedResult);
    const res = await middleware(makeRequest({ userAgent: goodUA, xForwardedFor: '1.2.3.4' })) as any;
    expect(res._initHeaders['X-RateLimit-Limit']).toBe('30');
  });

  it('sets X-RateLimit-Remaining to 0 on 429', async () => {
    mockCheckRateLimit.mockResolvedValueOnce(blockedResult);
    const res = await middleware(makeRequest({ userAgent: goodUA, xForwardedFor: '1.2.3.4' })) as any;
    expect(res._initHeaders['X-RateLimit-Remaining']).toBe('0');
  });

  it('sets Retry-After to the window duration (> 0) on 429', async () => {
    mockCheckRateLimit.mockResolvedValueOnce(blockedResult);
    const res = await middleware(makeRequest({ userAgent: goodUA, xForwardedFor: '1.2.3.4' })) as any;
    const retryAfter = Number(res._initHeaders['Retry-After']);
    expect(retryAfter).toBeGreaterThan(0);
  });
});

// ===========================================================================
// 3. Normal pass-through
// ===========================================================================
describe('middleware — normal pass-through', () => {
  const goodUA = 'Mozilla/5.0 AppleWebKit/537.36';

  it('calls NextResponse.next() when both checks pass', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({ allowed: true, current: 5, limit: 30 });
    await middleware(makeRequest({ userAgent: goodUA, xForwardedFor: '1.2.3.4' }));
    expect((NextResponse as any).next).toHaveBeenCalled();
  });

  it('sets X-RateLimit-Limit on the pass-through response', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({ allowed: true, current: 5, limit: 30 });
    const res = await middleware(makeRequest({ userAgent: goodUA, xForwardedFor: '1.2.3.4' })) as any;
    expect(res.headers.set).toHaveBeenCalledWith('X-RateLimit-Limit', '30');
  });

  it('sets X-RateLimit-Remaining to (limit − current) on the pass-through response', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({ allowed: true, current: 5, limit: 30 });
    const res = await middleware(makeRequest({ userAgent: goodUA, xForwardedFor: '1.2.3.4' })) as any;
    expect(res.headers.set).toHaveBeenCalledWith('X-RateLimit-Remaining', '25');
  });
});

// ===========================================================================
// 4. Redis outage — fail open + greppable log tag
// ===========================================================================
describe('middleware — Redis outage (fail open)', () => {
  const goodUA = 'Mozilla/5.0 AppleWebKit/537.36';

  it('passes the request through (does not throw or return 5xx) when checkRateLimit throws', async () => {
    mockCheckRateLimit.mockRejectedValueOnce(new Error('Connection refused'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await middleware(makeRequest({ userAgent: goodUA, xForwardedFor: '1.2.3.4' })) as any;

    expect(res.status).not.toBe(500);
    expect((NextResponse as any).next).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('logs the [RATE_LIMIT_STORE_UNAVAILABLE] tag on Redis error', async () => {
    mockCheckRateLimit.mockRejectedValueOnce(new Error('Connection refused'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await middleware(makeRequest({ userAgent: goodUA, xForwardedFor: '1.2.3.4' }));

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[RATE_LIMIT_STORE_UNAVAILABLE]'),
      expect.anything()
    );
    consoleSpy.mockRestore();
  });

  it('passes through normally (NextResponse.next) when Redis env vars are absent', async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const res = await middleware(makeRequest({ userAgent: goodUA, xForwardedFor: '1.2.3.4' })) as any;

    // Rate limiter not invoked — getRedis() returns null
    expect(mockCheckRateLimit).not.toHaveBeenCalled();
    expect((NextResponse as any).next).toHaveBeenCalled();
  });
});

// ===========================================================================
// 5. IP key derivation
// ===========================================================================
describe('middleware — IP key derivation', () => {
  const goodUA = 'Mozilla/5.0 AppleWebKit/537.36';

  it('uses the first IP from x-forwarded-for as the rate-limit key', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({ allowed: true, current: 1, limit: 30 });
    await middleware(makeRequest({ userAgent: goodUA, xForwardedFor: '203.0.113.5, 10.0.0.1' }));

    const [, key] = mockCheckRateLimit.mock.calls[0];
    expect(key).toBe('rl:203.0.113.5');
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({ allowed: true, current: 1, limit: 30 });
    await middleware(makeRequest({ userAgent: goodUA, xRealIp: '203.0.113.9' }));

    const [, key] = mockCheckRateLimit.mock.calls[0];
    expect(key).toBe('rl:203.0.113.9');
  });

  it('sanitises non-alphanumeric characters from the IP before using it as a Redis key', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({ allowed: true, current: 1, limit: 30 });
    // Include a character that must be stripped (e.g. a space injected via malformed header)
    await middleware(makeRequest({ userAgent: goodUA, xForwardedFor: '203.0.113.5 evil' }));

    const [, key] = mockCheckRateLimit.mock.calls[0];
    // The regex keeps only hex chars (a-f A-F 0-9), dots, and colons.
    // Space → _,  'v' → _,  'i' → _,  'l' → _,  'e' stays (hex).
    // So '203.0.113.5 evil' → '203.0.113.5_e___'
    expect(key).toBe('rl:203.0.113.5_e___');
  });
});
