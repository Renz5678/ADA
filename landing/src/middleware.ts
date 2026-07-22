import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// A simple in-memory store for rate limiting (per Vercel Edge isolate)
// Note: This won't share state globally across all Vercel servers, 
// but it is highly effective at stopping bot floods hitting a single server.
const rateLimit = new Map<string, { count: number; lastReset: number }>();

// Configuration
const LIMIT = 30; // Max requests per window
const WINDOW_MS = 60 * 1000; // 1 minute window

export function middleware(request: NextRequest) {
  // 1. Heuristic Bot Detection
  const userAgent = request.headers.get('user-agent') || '';
  const isSuspectedBot = /curl|wget|python|go-http|java|postman|insomnia|scraper|spider|bot|crawl/i.test(userAgent);
  const isGoodBot = /googlebot|bingbot|yandexbot|duckduckbot/i.test(userAgent);

  // Block requests with no User-Agent or known malicious/generic bot signatures
  if (!userAgent || (isSuspectedBot && !isGoodBot)) {
    return new NextResponse(
      JSON.stringify({ error: "Access denied by security policies." }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. IP Rate Limiting
  // Get the IP address from Vercel headers
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
  
  const now = Date.now();
  const windowData = rateLimit.get(ip);

  if (windowData) {
    if (now - windowData.lastReset > WINDOW_MS) {
      // Window expired, reset counter
      rateLimit.set(ip, { count: 1, lastReset: now });
    } else if (windowData.count >= LIMIT) {
      // Limit exceeded, block request
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { 
          status: 429, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // Increment counter
      windowData.count++;
      rateLimit.set(ip, windowData);
    }
  } else {
    // First request from this IP
    rateLimit.set(ip, { count: 1, lastReset: now });
  }

  // Optional: Add a security header to the response to indicate it passed the middleware
  const response = NextResponse.next();
  response.headers.set('x-rate-limit-limit', LIMIT.toString());
  
  return response;
}

// Only run the middleware on actual pages and API routes, not static files (images, css, etc.)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
