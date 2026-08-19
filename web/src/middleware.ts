import { NextResponse, type NextRequest } from "next/server";
import { LRUCache } from "lru-cache";

/**
 * Rate-limiting middleware for all /api/* routes.
 *
 * ── Why ─────────────────────────────────────────────────────────────────
 * The 5 API routes accept public submissions. Without throttling, a script
 * can flood the database (NewsletterSubscriber is the softest target — no
 * Turnstile, email-only). This middleware caps requests per IP.
 *
 * ── Limits (per IP, sliding window via TTL) ─────────────────────────────
 *   - PII forms (/api/lead, /api/contact, /api/trade-account): 20 req / 10 min
 *     These are high-value and Turnstile-protected, but still capped.
 *   - Newsletter (/api/newsletter): 10 req / 10 min
 *     No Turnstile → most abuse-prone. Strictest cap.
 *   - Quote-attempt (/api/quote-attempt): 60 req / 10 min
 *     Debounced client-side but a malicious client could spam.
 *   - Health check (/api/health): unlimited (monitoring hits it)
 *   - Admin (/api/admin/*): handled by admin auth, not rate-limited here
 *
 * ── Caveat ──────────────────────────────────────────────────────────────
 * lru-cache is in-memory. On Vercel serverless, each instance has its own
 * counter — a truly determined attacker behind a rotating IP farm could
 * partially bypass this. For production-grade protection, add Cloudflare's
 * edge rate limiting or Upstash Redis. This middleware stops the 99% case
 * (naive scripts, curl loops) and is the right first step.
 */

// ── Rate-limit buckets ──────────────────────────────────────────────────
// One LRUCache per route-config, keyed by IP. TTL = window; max = requests
// allowed in that window. When the IP count exceeds max, reject with 429.

interface LimitConfig {
  max: number;
  ttl: number; // milliseconds
}

const ROUTE_LIMITS: Record<string, LimitConfig> = {
  "/api/lead": { max: 20, ttl: 10 * 60 * 1000 }, // 20 per 10 min
  "/api/contact": { max: 20, ttl: 10 * 60 * 1000 },
  "/api/trade-account": { max: 20, ttl: 10 * 60 * 1000 },
  "/api/newsletter": { max: 10, ttl: 10 * 60 * 1000 }, // strictest — no Turnstile
  "/api/quote-attempt": { max: 60, ttl: 10 * 60 * 1000 },
};

// A single shared cache across all routes, keyed by `${route}:${ip}`.
// This keeps memory bounded (one pool, max 1000 entries ≈ worst-case IPs).
const ipCache = new LRUCache<string, number>({
  max: 1000,
  ttl: 10 * 60 * 1000, // 10 minutes — matches the longest window
});

/** Extract the client IP from standard proxy headers, falling back to a stub. */
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only rate-limit the configured routes. /api/health and /api/admin/* are
  // excluded (health is for monitoring; admin has its own auth gate).
  const config = ROUTE_LIMITS[pathname];
  if (!config) {
    return NextResponse.next();
  }

  const ip = getClientIp(req);
  const cacheKey = `${pathname}:${ip}`;
  const current = ipCache.get(cacheKey) ?? 0;

  if (current >= config.max) {
    return NextResponse.json(
      {
        error: "Too many requests. Please wait a few minutes and try again.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(config.ttl / 1000)),
        },
      }
    );
  }

  ipCache.set(cacheKey, current + 1);
  return NextResponse.next();
}

export const config = {
  // Run on all API routes; the middleware body decides whether to limit.
  matcher: ["/api/:path*"],
};
