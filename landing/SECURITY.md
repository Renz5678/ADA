## Security

### Edge Middleware — Rate Limiting & Bot Detection

`src/middleware.ts` runs at the Vercel Edge on every page request (static assets, images, and metadata files are excluded from the matcher).

It performs two checks in order:

1. **Bot UA detection** — requests with no `User-Agent` or a known bad-bot signature (curl, wget, python-requests, scrapers, etc.) are blocked with a `403`. Verified good bots (Googlebot, Bingbot, Yandexbot, DuckDuckBot) are always allowed.

2. **IP rate limiting** — backed by **Upstash Redis** so the counter is shared across all Vercel Edge isolates globally. The default limit is **30 requests per 60 seconds per IP** (configurable via env vars below). Requests over the limit receive a `429` with a `Retry-After` header.

#### Required environment variables (set in Vercel project settings)

| Variable | Description |
|---|---|
| `UPSTASH_REDIS_REST_URL` | REST endpoint from your Upstash Redis database |
| `UPSTASH_REDIS_REST_TOKEN` | Bearer token from your Upstash Redis database |
| `RATE_LIMIT_REQUESTS` | (optional) Max requests per window. Default: `30` |
| `RATE_LIMIT_WINDOW_SECONDS` | (optional) Window duration in seconds. Default: `60` |

When `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are not set (e.g. local dev), the rate limiter is **skipped gracefully** — bot UA detection still runs.

#### Upstash free tier

The free tier provides 10,000 commands/day. Each page request consumes 2 commands (`INCR` + `EXPIRE` on the first request in a window, `INCR` only on subsequent ones). This is well within the free tier for a marketing landing page.

#### ⚠️ Primary DDoS defense: Vercel Edge Firewall / Attack Challenge Mode

**The middleware rate limiter is a secondary layer.** For production, the primary DDoS and bot defense must be enabled at the Vercel project level in the dashboard:

- Go to your Vercel project → **Settings → Security**.
- Enable **Attack Challenge Mode** (or **Firewall rules**) for the landing site domain.
- This operates at the network layer, before Edge Functions are even invoked, and has no invocation-cost impact.

The in-code rate limiter handles application-level throttling (fair use per IP); the Vercel Firewall handles volumetric DDoS. Both are needed.
