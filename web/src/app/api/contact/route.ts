import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { contactSchema, verifyTurnstile } from "@/lib/validation";
import { captureLeadWithResilience } from "@/lib/leads";
import { getUtmFromHeaders } from "@/lib/utm";

/**
 * POST /api/contact
 *
 * Backend for ContactForm.tsx. Handles general enquiries — a customer fills
 * in their details and an optional message, optionally with collection /
 * delivery postcodes. No quote is computed here (use /api/lead for that).
 *
 * Flow:
 *   parse body → Zod (contactSchema, rejects honeypot) → Turnstile verify
 *   → captureLeadWithResilience (DB transaction ‖ Resend email, Promise.allSettled)
 *
 * Status codes (mirrors /api/lead):
 *   200 — DB landed (email may or may not have)
 *   202 — DB failed but email landed (enquiry is in the dispatch inbox)
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

  // ── 2. Zod validation (contactSchema) ──
  // Honeypot must be empty — a filled honeypot means a bot. Rejected here
  // before any Turnstile call or DB write.
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    console.error(
      "[/api/contact] zod validation failed:",
      JSON.stringify(parsed.error.flatten().fieldErrors),
      "honeypot:",
      JSON.stringify((body as Record<string, unknown>)?.honeypot),
      "turnstileToken:",
      JSON.stringify((body as Record<string, unknown>)?.turnstileToken)
    );
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
  const emailHtml = buildContactEmailHtml(d);

  // ── 6. Capture with resilience ──
  // captureLeadWithResilience runs the DB transaction (customer upsert +
  // Lead + ContactEnquiry child record) and the Resend email in parallel.
  try {
    const result = await captureLeadWithResilience({
      customerEmail: d.email,
      customerName: d.name,
      customerPhone: d.phone,
      customerCompany: d.company,
      leadType: "CONTACT_ENQUIRY",
      leadRawData: d as unknown as Prisma.InputJsonValue,
      leadSource: "website",
      utmSource,
      utmMedium,
      utmCampaign,

      contactData: {
        // contactSchema uses from/to; the ContactEnquiry model uses
        // collectionPostcode/deliveryPostcode. Map them here.
        collectionPostcode: d.from,
        deliveryPostcode: d.to,
        message: d.message,
      },

      emailSubject: `New contact enquiry from ${d.name}`,
      emailHtml,
      emailEntityType: "Lead",
    });

    // ── 7. Respond based on resilience outcome ──
    if (result.success) {
      if (!result.leadId && result.emailSent) {
        // DB failed, email reached dispatch — enquiry not lost.
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
        error: "We couldn't capture your enquiry. Please call us.",
        dbError: result.dbError,
        emailError: result.emailError,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("[/api/contact] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── Email HTML builder ─────────────────────────────────────
// Readable HTML for the dispatch team carrying all submitted fields.
function buildContactEmailHtml(d: {
  name: string;
  phone: string;
  email: string;
  company?: string;
  from?: string;
  to?: string;
  message?: string;
}): string {
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
  <h2 style="margin-bottom: 8px;">New contact enquiry</h2>
  <p style="color: #666; margin-top: 0;">Submitted via the contact form</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Name</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(d.name)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Phone</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(d.phone)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Email</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(d.email)}</td></tr>
    ${d.company ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Company</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(d.company)}</td></tr>` : ""}
    ${d.from ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Collection postcode</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(d.from)}</td></tr>` : ""}
    ${d.to ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Delivery postcode</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(d.to)}</td></tr>` : ""}
  </table>

  ${d.message ? `
  <h3 style="margin-top: 24px;">Message</h3>
  <div style="background: #f9f9f9; padding: 16px; border-radius: 6px; white-space: pre-wrap;">${escapeHtml(d.message)}</div>
  ` : ""}

  <p style="color: #999; font-size: 12px; margin-top: 32px;">
    Reply directly to this email to contact the customer. This enquiry has also
    been saved to the SDX database.
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
