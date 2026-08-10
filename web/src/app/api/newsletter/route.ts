import { NextRequest, NextResponse } from "next/server";
import { newsletterSchema } from "@/lib/validation";
import { prisma } from "@/lib/db";

/**
 * POST /api/newsletter
 *
 * Backend for NewsletterForm.tsx (footer signup). Lightweight by design —
 * no Turnstile, no honeypot, no customer/lead creation, no email to the team
 * (signups are too high-volume to be worth inbox noise). This route only
 * upserts the NewsletterSubscriber table.
 *
 * Upsert semantics:
 *   - New email           → create with subscribed = true
 *   - Existing + subscribed=true   → no-op (idempotent resubscribe)
 *   - Existing + subscribed=false  → resubscribe (flip back to true,
 *     clear unsubscribedAt). This handles users who previously unsubscribed
 *     and later sign up again.
 *
 * Status codes:
 *   200 — subscribed (newly or re-)
 *   400 — validation failure (bad email)
 *   405 — non-POST method
 *   500 — DB error (unexpected — surfaced to the client here since unlike
 *         quote-attempt, a failed newsletter signup is user-visible)
 */

// ── Method guard ───────────────────────────────────────────
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function POST(request: NextRequest) {
  // ── 1. Parse body ──
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // ── 2. Zod validation (newsletterSchema — email + optional UTM) ──
  // No honeypot/Turnstile on newsletter — it's low-risk and we want zero
  // friction. Zod's email() is the only input check.
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }
  const { email } = parsed.data;

  // ── 3. Upsert NewsletterSubscriber ──
  // upsert() handles all three cases atomically:
  //   - not found  → create with subscribed=true
  //   - found      → reset to subscribed=true, clear unsubscribedAt
  //                 (covers the resubscribe-after-unsubscribe case, and is
  //                  a harmless no-op when already subscribed)
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {
        subscribed: true,
        unsubscribedAt: null,
      },
      create: {
        email,
        subscribed: true,
        source: "footer",
      },
    });

    return NextResponse.json({ success: true, email }, { status: 200 });
  } catch (error) {
    console.error("[/api/newsletter] DB error:", error);
    return NextResponse.json(
      { error: "We couldn't save your subscription. Please try again." },
      { status: 500 }
    );
  }
}
