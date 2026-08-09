import { NextRequest, NextResponse } from "next/server";
import { leadSchema, verifyTurnstile } from "@/lib/validation";
import { captureLeadWithResilience } from "@/lib/leads";
import { getUtmFromHeaders } from "@/lib/utm";

/**
 * POST /api/lead
 *
 * Backend for QuoteWizard.tsx. Receives a fully-computed quote (the wizard
 * runs calculateHaversineQuote() client-side) and persists a pricing snapshot.
 * The route does NOT recalculate the quote — it stores exactly what the client
 * sent, so the Quote row is a faithful "what the customer saw" record.
 *
 * Flow:
 *   parse body → Zod (leadSchema, rejects honeypot) → Turnstile verify
 *   → captureLeadWithResilience (DB transaction ‖ Resend email, Promise.allSettled)
 *
 * Status codes:
 *   200 — DB + email both succeeded (or DB succeeded + email failed)
 *   202 — DB failed but email landed (lead is in the dispatch inbox)
 *   400 — validation failure (honeypot filled, bad phone, etc.)
 *   405 — non-POST method
 *   500 — unexpected server error
 */

// ── Method guard ───────────────────────────────────────────
// App Router route handlers export named functions per HTTP verb. Anything
// other than POST gets an explicit 405 so clients can't accidentally GET this.
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

  // ── 2. Zod validation (leadSchema) ──
  // Honeypot field must be empty — a filled honeypot means a bot. Zod rejects
  // it here (max(0)) before we ever touch the DB or pay for a Turnstile call.
  const parsed = leadSchema.safeParse(body);
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
  // Runs AFTER Zod so a filled honeypot short-circuits cheaply. Skips
  // verification entirely when no real TURNSTILE_SECRET_KEY is configured
  // (dev mode) — see verifyTurnstile() in validation.ts.
  const turnstileOk = await verifyTurnstile(d.turnstileToken);
  if (!turnstileOk) {
    return NextResponse.json(
      { error: "Bot verification failed. Please refresh and try again." },
      { status: 400 }
    );
  }

  // ── 4. UTM resolution (payload → referer fallback) ──
  // The client sends UTM captured on page load; if missing, fall back to
  // parsing the Referer header server-side.
  const headerUtm = getUtmFromHeaders(request.headers);
  const utmSource = d.utmSource || headerUtm.utmSource;
  const utmMedium = d.utmMedium || headerUtm.utmMedium;
  const utmCampaign = d.utmCampaign || headerUtm.utmCampaign;

  // ── 5. Build email HTML ──
  // The email body carries the FULL lead data so the dispatch team has a
  // complete fallback even if the DB write fails entirely.
  const emailHtml = buildLeadEmailHtml(d);

  // ── 6. Capture with resilience ──
  // captureLeadWithResilience runs the DB transaction and the Resend email
  // in parallel via Promise.allSettled. Money is converted to integer pence
  // inside that function (single conversion boundary in leads.ts).
  try {
    const result = await captureLeadWithResilience({
      customerEmail: d.email,
      customerName: d.fullName,
      customerPhone: d.phone,
      customerCompany: d.company,
      customerWhatsapp: d.whatsapp,
      leadType: "QUOTE_REQUEST",
      leadRawData: d as unknown as Record<string, unknown>,
      leadSource: "website",
      utmSource,
      utmMedium,
      utmCampaign,

      quoteData: {
        originPostcode: d.origin,
        originLat: d.originLat,
        originLng: d.originLng,
        destPostcode: d.destination,
        destLat: d.destLat,
        destLng: d.destLng,
        distanceMiles: Math.round(d.distanceMiles),
        estimated: true, // QuoteWizard uses Haversine (no Google Routes key yet)
        cargoType: d.cargoType,
        // Quote.weightKg is Int in the schema; round the decimal cargoWeight.
        weightKg: Math.round(d.cargoWeight),
        vehicleId: d.selectedVehicle,
        basePrice: d.estimatedQuote.basePrice,
        mileageCost: d.estimatedQuote.mileageCost,
        cczSurcharge: d.estimatedQuote.cczSurcharge,
        subtotal: d.estimatedQuote.subtotal,
        vat: d.estimatedQuote.vat,
        total: d.estimatedQuote.total,
      },

      emailSubject: `New quote request — ${d.origin} → ${d.destination} (£${d.estimatedQuote.total})`,
      emailHtml,
      emailEntityType: "Lead",
    });

    // ── 7. Respond based on resilience outcome ──
    // 202 = DB failed but email landed. 500 = everything failed.
    if (result.success) {
      if (!result.leadId && result.emailSent) {
        // DB write failed, but the email reached dispatch — lead is not lost.
        return NextResponse.json(
          {
            success: true,
            warning: "email_only",
            emailSent: true,
          },
          { status: 202 }
        );
      }
      // DB succeeded (leadId present). Email may or may not have landed —
      // the EmailLog table records the truth either way.
      return NextResponse.json(
        { success: true, leadId: result.leadId },
        { status: 200 }
      );
    }

    // Both DB and email failed — nothing landed.
    return NextResponse.json(
      {
        error: "We couldn't capture your request. Please call us.",
        dbError: result.dbError,
        emailError: result.emailError,
      },
      { status: 500 }
    );
  } catch (error) {
    // Unexpected throw (not a settled rejection) — last-resort guard.
    console.error("[/api/lead] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── Email HTML builder ─────────────────────────────────────
// Plain, readable HTML for the dispatch team. Carries the full payload so
// it doubles as a recovery record if the DB write fails.
function buildLeadEmailHtml(d: {
  fullName: string;
  phone: string;
  email: string;
  company?: string;
  whatsapp?: string;
  origin: string;
  destination: string;
  cargoType: string;
  selectedVehicle: string;
  distanceMiles: number;
  estimatedQuote: {
    miles: number;
    totalMinutes: number;
    basePrice: string;
    mileageCost: string;
    cczSurcharge: string;
    subtotal: string;
    vat: string;
    total: string;
    cczApplied: boolean;
  };
}): string {
  const q = d.estimatedQuote;
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
  <h2 style="margin-bottom: 8px;">New quote request</h2>
  <p style="color: #666; margin-top: 0;">Submitted via the Quote Wizard</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Name</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(d.fullName)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Phone</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(d.phone)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Email</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(d.email)}</td></tr>
    ${d.company && d.company !== "N/A" ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Company</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(d.company)}</td></tr>` : ""}
    ${d.whatsapp ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">WhatsApp</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(d.whatsapp)}</td></tr>` : ""}
  </table>

  <h3 style="margin-top: 24px;">Route</h3>
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">From</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(d.origin)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">To</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(d.destination)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Distance</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${q.miles} miles</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Vehicle</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(d.selectedVehicle)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">Cargo</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(d.cargoType)}</td></tr>
  </table>

  <h3 style="margin-top: 24px;">Quote breakdown</h3>
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">Base price</td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">£${q.basePrice}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">Mileage (${q.miles} mi)</td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">£${q.mileageCost}</td></tr>
    ${q.cczApplied ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;">Congestion Charge zone</td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">£${q.cczSurcharge}</td></tr>` : ""}
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">Subtotal</td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">£${q.subtotal}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">VAT (20%)</td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">£${q.vat}</td></tr>
    <tr style="background: #f5f5f5;"><td style="padding: 12px 8px; font-weight: 700;">Total</td><td style="padding: 12px 8px; text-align: right; font-weight: 700;">£${q.total}</td></tr>
  </table>

  <p style="color: #999; font-size: 12px; margin-top: 32px;">
    Reply directly to this email to contact the customer. This lead has also been
    saved to the SDX database.
  </p>
</div>
  `.trim();
}

/** Minimal HTML escaper to prevent injection in email body / display. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
