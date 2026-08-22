import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
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
 *    ADMIN_PASSWORD. On success we set a signed httpOnly cookie
 *    `admin_session`. The browser sends the cookie on every admin page load;
 *    server components verify it here.
 *
 * API key and session token are both verified here, so admin routes can
 * safely support browser sessions and script-based API access.
 *
 * ── Security notes ──────────────────────────────────────────────────────
 * - ADMIN_API_KEY should be generated via `openssl rand -hex 32`.
 * - The cookie is httpOnly + sameSite=strict so JS can't read it and it
 *   doesn't leak cross-site.
 * - This is NOT full NextAuth — it's a single-shared-secret gate. Adequate
 *   for a single-admin-operator business tool. Upgrade to NextAuth when you
 *   need multiple users with roles.
 */

/** The expected API key. Read once at module load. */
const EXPECTED_KEY = process.env.ADMIN_API_KEY;
const SESSION_SIGNING_SECRET = process.env.ADMIN_SESSION_SECRET || EXPECTED_KEY;

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

type AdminAuthMode = "apiKey" | "session" | "devBypass";
type AdminAccessFailure =
  | { status: 401; error: "Unauthorized" }
  | { status: 403; error: "CSRF validation failed" };

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
function getSessionSignature(payloadB64: string): string {
  return createHmac("sha256", SESSION_SIGNING_SECRET || "")
    .update(payloadB64)
    .digest("base64url");
}

function parseSessionToken(token: string): { exp: number } | null {
  if (!SESSION_SIGNING_SECRET) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signatureB64] = parts;
  if (!payloadB64 || !signatureB64) return null;

  const expectedSig = getSessionSignature(payloadB64);
  if (!safeEqual(signatureB64, expectedSig)) return null;

  try {
    const payloadRaw = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payload = JSON.parse(payloadRaw) as { exp?: unknown };
    if (typeof payload.exp !== "number") return null;
    if (!Number.isFinite(payload.exp) || payload.exp <= Date.now()) return null;
    return { exp: payload.exp };
  } catch {
    return null;
  }
}

function getAuthMode(req: NextRequest): AdminAuthMode | null {
  // Dev fail-open: no key configured → allow. Mirrors the Turnstile pattern.
  if (!isAdminKeyConfigured()) {
    return process.env.NODE_ENV !== "production" ? "devBypass" : null;
  }

  // Check the API-key header first (programmatic access).
  const headerKey = req.headers.get("x-admin-api-key");
  if (headerKey && EXPECTED_KEY && safeEqual(headerKey, EXPECTED_KEY)) return "apiKey";

  // Then check the signed admin session cookie (browser UI access after login).
  const sessionToken = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (sessionToken && parseSessionToken(sessionToken)) return "session";

  return null;
}

function isCookieMutationRequest(req: NextRequest, mode: AdminAuthMode): boolean {
  if (mode !== "session") return false;
  return req.method === "POST" || req.method === "PUT" || req.method === "PATCH" || req.method === "DELETE";
}

function hasSameOrigin(req: NextRequest): boolean {
  const host = req.headers.get("host");
  if (!host) return false;

  const origin = req.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  return false;
}

export function validateAdminAccess(req: NextRequest): AdminAccessFailure | null {
  const mode = getAuthMode(req);
  if (!mode) return { status: 401, error: "Unauthorized" };

  // CSRF protection for browser-session writes. API-key calls are intended for
  // scripts/integrations and therefore do not require Origin/Referer headers.
  if (isCookieMutationRequest(req, mode) && !hasSameOrigin(req)) {
    return { status: 403, error: "CSRF validation failed" };
  }

  return null;
}

export function isAdminAuthorized(req: NextRequest): boolean {
  return getAuthMode(req) !== null;
}

export function issueAdminSessionToken(): string {
  if (!SESSION_SIGNING_SECRET) {
    throw new Error("ADMIN_SESSION_SECRET or ADMIN_API_KEY is required");
  }

  const payload = {
    sid: randomBytes(16).toString("hex"),
    exp: Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signatureB64 = getSessionSignature(payloadB64);
  return `${payloadB64}.${signatureB64}`;
}

/**
 * Constant-time string compare to prevent timing attacks on secrets
 * (password checks, API keys, and session signatures).
 */
export function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}
