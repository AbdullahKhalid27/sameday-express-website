import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { tradeAccountSchema, verifyTurnstile } from "@/lib/validation";
import { captureLeadWithResilience } from "@/lib/leads";
import { getUtmFromHeaders } from "@/lib/utm";

/**
 * POST /api/trade-account
 *
 * Backend for TradeAccountForm.tsx. Handles trade account applications — a
 * business submits company details, a contact, and an estimated weekly
 * shipment volume. These go into a review pipeline (TradeAccountApplication
 * has reviewedBy/reviewedAt/decisionNotes fields for later admin use).
 *
 * Flow:
 *   parse body → Zod (tradeAccountSchema, rejects honeypot) → Turnstile verify
 *   → captureLeadWithResilience (DB transaction ‖ Resend email, Promise.allSettled)
 *
 * Status codes (mirrors /api/lead and /api/contact):
 *   200 — DB landed (email may or may not have)
 *   202 — DB failed but email landed (application is in the dispatch inbox)
 *   400 — validation failure (honeypot filled, bad phone, etc.)
 *   405 — non-POST method
 *   500 — both DB and email failed
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

  // ── 2. Zod validation (tradeAccountSchema) ──
  // Honeypot must be empty — a filled honeypot means a bot. Rejected here
  // before any Turnstile call or DB write.
  const parsed = tradeAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }
  const d = parsed.data;

  // ── 3. Turnstile verification ──
  const turnstileOk = await verifyTurnstile(d.turnstileToken);
  if (!turnstileOk) {
    return NextResponse.json(
      { error: "Bot verification failed. Please refresh and try again." },
      { status: 400 }
    );
  }

  // ── 4. UTM resolution (payload → referer fallback) ──
  const headerUtm = getUtmFromHeaders(request.headers);
  const utmSource = d.utmSource || headerUtm.utmSource;
  const utmMedium = d.utmMedium || headerUtm.utmMedium;
  const utmCampaign = d.utmCampaign || headerUtm.utmCampaign;

  // ── 5. Build email HTML ──
  const emailHtml = buildTradeAccountEmailHtml(d);

  // ── 6. Capture with resilience ──
  // captureLeadWithResilience runs the DB transaction (customer upsert +
  // Lead + TradeAccountApplication child record) and the Resend email in
  // parallel. The customer is upserted with the contact name + company.
  try {
    const result = await captureLeadWithResilience({
      customerEmail: d.email,
      customerName: d.contactName,
      customerPhone: d.phone,
      customerCompany: d.companyName,
      leadType: "TRADE_ACCOUNT_APPLICATION",
      leadRawData: d as unknown as Prisma.InputJsonValue,
      leadSource: "website",
      utmSource,
      utmMedium,
      utmCampaign,

      tradeData: {
        companyName: d.companyName,
        contactName: d.contactName,
        phone: d.phone,
        email: d.email,
        // tradeAccountSchema uses estimatedWeeklyVolume; the
        // TradeAccountApplication model field is weeklyVolume. Map here.
        weeklyVolume: d.estimatedWeeklyVolume,
      },

      emailSubject: `Trade account application — ${d.companyName}`,
      emailHtml,
      emailEntityType: "Lead",
    });

    // ── 7. Respond based on resilience outcome ──
    if (result.success) {
      if (!result.leadId && result.emailSent) {
        // DB failed, email reached dispatch — application not lost.
        return NextResponse.json(
          {
            success: true,
            warning: "email_only",
            emailSent: true,
          },
          { status: 202 }
        );
      }
      return NextResponse.json(
        { success: true, leadId: result.leadId },
        { status: 200 }
      );
    }

    // Both DB and email failed — nothing landed.
    return NextResponse.json(
      {
        error: "We couldn't capture your application. Please call us.",
        dbError: result.dbError,
        emailError: result.emailError,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("[/api/trade-account] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── Email HTML builder ─────────────────────────────────────
// Readable HTML for the dispatch team carrying all application fields.
function buildTradeAccountEmailHtml(d: {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  estimatedWeeklyVolume: string;
}): string {
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
  <h2 style="margin-bottom: 8px;">New trade account application</h2>
  <p style="color: #666; margin-top: 0;">Submitted via the trade account form</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Company</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(d.companyName)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Contact name</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(d.contactName)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Phone</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(d.phone)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Email</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(d.email)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Est. weekly volume</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(d.estimatedWeeklyVolume)}</td></tr>
  </table>

  <p style="color: #999; font-size: 12px; margin-top: 32px;">
    Reply directly to this email to contact the applicant. This application has
    also been saved to the SDX database and is awaiting review.
  </p>
</div>
  `.trim();
}

/** Minimal HTML escaper to prevent injection in email body. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
