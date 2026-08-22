import { NextRequest, NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import {
  safeEqual,
  isAdminKeyConfigured,
  issueAdminSessionToken,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
} from "@/lib/admin-auth";

/**
 * POST /api/admin/login
 *
 * Admin login endpoint. Accepts { password } and, if it matches
 * ADMIN_PASSWORD, sets a signed httpOnly session cookie.
 *
 * The browser then sends this cookie on every /admin/* page load, which
 * server components verify via isAdminAuthorized().
 */

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

type LoginAttempt = {
  failures: number;
  lockedUntil: number;
};

const loginAttempts = new LRUCache<string, LoginAttempt>({
  max: 10_000,
  ttl: LOCKOUT_MS,
});

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const ip = getClientIp(request);
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (attempt && attempt.lockedUntil > now) {
    const retryAfter = Math.ceil((attempt.lockedUntil - now) / 1000);
    return NextResponse.json(
      { error: "Too many failed attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  // If auth isn't configured, we can't log in. Surface a clear error.
  if (!expectedPassword || !isAdminKeyConfigured()) {
    return NextResponse.json(
      {
        error:
          "Admin auth not configured. Set ADMIN_PASSWORD and ADMIN_API_KEY in .env.local.",
      },
      { status: 503 }
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const password = body.password;
  if (!password || !safeEqual(password, expectedPassword)) {
    const nextFailures = (attempt?.failures ?? 0) + 1;
    const lockedUntil = nextFailures >= MAX_FAILED_ATTEMPTS ? now + LOCKOUT_MS : 0;
    loginAttempts.set(ip, { failures: nextFailures, lockedUntil });

    return NextResponse.json(
      { error: "Invalid password" },
      lockedUntil > now
        ? {
            status: 429,
            headers: { "Retry-After": String(Math.ceil(LOCKOUT_MS / 1000)) },
          }
        : { status: 401 }
    );
  }

  loginAttempts.delete(ip);

  const sessionToken = issueAdminSessionToken();

  // Set a signed, short-lived session cookie. httpOnly so client JS can't
  // read it, sameSite=strict so it doesn't leak cross-site.
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
  return res;
}
