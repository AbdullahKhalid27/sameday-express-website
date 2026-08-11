import type { NextRequest } from "next/server";

/**
 * Admin authentication — shared by all /api/admin/* routes and the /admin pages.
 *
 * ── How it works ────────────────────────────────────────────────────────
 * Two auth paths, both gated by the same ADMIN_API_KEY env var:
 *
 * 1. API routes (/api/admin/*): the caller sends an `x-admin-api-key` header.
 *    This is for programmatic access (scripts, integrations).
 *
 * 2. Admin UI pages (/admin/*): the user logs in via /admin/login with the
 *    ADMIN_PASSWORD. On success we set an httpOnly cookie `admin_token` whose
 *    value equals the ADMIN_API_KEY. The browser sends the cookie on every
 *    admin page load; server components verify it here.
 *
 * Both paths resolve to the same check: does the presented credential match
 * ADMIN_API_KEY? Keeping it to a single secret means one rotation point.
 *
 * ── Security notes ──────────────────────────────────────────────────────
 * - ADMIN_API_KEY should be generated via `openssl rand -hex 32`.
 * - The cookie is httpOnly + sameSite=strict so JS can't read it and it
 *   doesn't leak cross-site.
 * - This is NOT full NextAuth — it's a single-shared-secret gate. Adequate
 *   for a single-admin-operator business tool. Upgrade to NextAuth when you
 *   need multiple users with roles.
 */

/** The expected secret. Read once at module load. */
const EXPECTED_KEY = process.env.ADMIN_API_KEY;

/** True when no ADMIN_API_KEY is configured — dev-mode bypass applies. */
export function isAdminKeyConfigured(): boolean {
  return !!EXPECTED_KEY && EXPECTED_KEY.length >= 16;
}

/**
 * Check admin access from a NextRequest (works for both API routes and
 * server-component page loads). Returns true if the caller is authenticated.
 *
 * In dev with no key configured, returns true (fail-open) so you can build
 * and preview the admin UI without setting up auth first.
 */
export function isAdminAuthorized(req: NextRequest): boolean {
  // Dev fail-open: no key configured → allow. Mirrors the Turnstile pattern.
  if (!isAdminKeyConfigured()) {
    return process.env.NODE_ENV !== "production";
  }

  // Check the API-key header first (programmatic access).
  const headerKey = req.headers.get("x-admin-api-key");
  if (headerKey && headerKey === EXPECTED_KEY) return true;

  // Then check the admin_token cookie (browser UI access after login).
  const cookieKey = req.cookies.get("admin_token")?.value;
  if (cookieKey && cookieKey === EXPECTED_KEY) return true;

  return false;
}

/**
 * Constant-time string compare to prevent timing attacks on the key check.
 * (For the cookie/header comparison above we use === which is fine for a
 * 32-byte random secret, but this helper is available if you want belt-and-
 * suspenders on the login endpoint itself.)
 */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
