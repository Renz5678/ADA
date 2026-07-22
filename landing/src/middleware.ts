import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { checkRateLimit } from './lib/rateLimiter';

// ---------------------------------------------------------------------------
// Configuration — read at invocation time so env vars are always current.
// (Also avoids stale values in test environments that set env vars after
// module load.)
// ---------------------------------------------------------------------------
function getConfig() {
  return {
    limit: parseInt(process.env.RATE_LIMIT_REQUESTS ?? '30', 10),
    windowSeconds: parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS ?? '60', 10),
  };
}

// ---------------------------------------------------------------------------
// Upstash Redis client factory — resolved at invocation time.
//
// Required env vars (set in Vercel project settings):
//   UPSTASH_REDIS_REST_URL   — from Upstash console
//   UPSTASH_REDIS_REST_TOKEN — from Upstash console
//
// When either var is absent (local dev, CI without Redis) the function
// returns null and the rate limiter is skipped.  Bot-UA detection still runs.
//
// Exported as getRedis() so tests can verify the guard without side-effects.
// ---------------------------------------------------------------------------
export function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// ---------------------------------------------------------------------------
// Bot UA detection helpers
// ---------------------------------------------------------------------------
const SUSPECTED_BOT_RE = /curl|wget|python|go-http|java|postman|insomnia|scraper|spider|bot|crawl/i;
const GOOD_BOT_RE = /googlebot|bingbot|yandexbot|duckduckbot/i;

export function isMaliciousBot(userAgent: string): boolean {
  if (!userAgent) return true;
  if (SUSPECTED_BOT_RE.test(userAgent) && !GOOD_BOT_RE.test(userAgent)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
export async function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') ?? '';

  // 1. Bot UA check — runs on every request, no Redis required.
  if (isMaliciousBot(userAgent)) {
    return new NextResponse(
      JSON.stringify({ error: 'Access denied by security policies.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. Redis-backed IP rate limiting.
  //    Skip gracefully when Redis is not configured (local dev / CI).
  const redis = getRedis();
  if (redis) {
    const { limit, windowSeconds } = getConfig();

    // x-forwarded-for may contain a comma-separated list; take the first entry.
    const rawIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      '127.0.0.1';

    // Sanitise the IP so it's safe to use as a Redis key.
    const ip = rawIp.replace(/[^a-fA-F0-9.:]/g, '_');
    const key = `rl:${ip}`;

    try {
      const result = await checkRateLimit(redis, key, limit, windowSeconds);

      if (!result.allowed) {
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests. Please try again later.' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': String(result.limit),
              'X-RateLimit-Remaining': '0',
              'Retry-After': String(windowSeconds),
            },
          }
        );
      }

      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', String(result.limit));
      response.headers.set('X-RateLimit-Remaining', String(Math.max(0, result.limit - result.current)));
      return response;
    } catch (err) {
      // If Redis is unreachable, fail open so the site stays up.
      // Tagged [RATE_LIMIT_STORE_UNAVAILABLE] so it's greppable / alertable
      // separately from routine application errors in Vercel function logs.
      console.error('[RATE_LIMIT_STORE_UNAVAILABLE] Redis unreachable — rate limiting skipped, failing open:', err);
    }
  }

  return NextResponse.next();
}

// ---------------------------------------------------------------------------
// Matcher — only run on page routes.
//
// Excluded:
//   _next/static   Static assets (JS, CSS chunks) — never need rate-limiting.
//   _next/image    Next.js image optimisation service.
//   favicon.ico    Browser auto-requests; not a page hit.
//   sitemap.xml    Crawlers must be able to fetch this (SEO).
//   robots.txt     Same.
//   *.{ext}        Common public asset extensions (png, jpg, svg, …).
//
// The `api` exclusion is kept for forward-compatibility even though the
// landing has no API routes today.
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|otf|eot|css|js|map)).*)',
  ],
};
