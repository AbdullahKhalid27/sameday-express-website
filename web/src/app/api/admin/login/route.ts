import { NextRequest, NextResponse } from "next/server";
import { safeEqual, isAdminKeyConfigured } from "@/lib/admin-auth";

/**
 * POST /api/admin/login
 *
 * Admin login endpoint. Accepts { password } and, if it matches
 * ADMIN_PASSWORD, sets an httpOnly cookie `admin_token` = ADMIN_API_KEY.
 *
 * The browser then sends this cookie on every /admin/* page load, which
 * server components verify via isAdminAuthorized().
 */

export async function POST(request: NextRequest) {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const apiKey = process.env.ADMIN_API_KEY;

  // If auth isn't configured, we can't log in. Surface a clear error.
  if (!expectedPassword || !apiKey || !isAdminKeyConfigured()) {
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
    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 }
    );
  }

  // Set the admin_token cookie. httpOnly so client JS can't read it,
  // sameSite=strict so it doesn't leak cross-site, maxAge 7 days.
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_token", apiKey, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return res;
}
