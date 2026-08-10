import { NextRequest, NextResponse } from "next/server";
import { quoteAttemptSchema } from "@/lib/validation";
import { prisma } from "@/lib/db";

/**
 * POST /api/quote-attempt
 *
 * Captures abandoned funnels — users who entered origin + destination
 * postcodes in the QuoteWizard but never submitted their contact details.
 * Fires client-side after a 3-second debounce once both postcodes are set.
 *
 * IMPORTANT: This endpoint receives NO PII. No name, no email, no phone.
 * Just postcode data, coordinates, and UTM params. Because there's no PII
 * and the volume is high, there is:
 *   - No Turnstile (low-risk, no PII)
 *   - No team email (too noisy)
 *   - No customer/lead creation (user hasn't identified themselves)
 *
 * Use this data for: popular-route analysis, retargeting audiences, and
 * conversion-funnel auditing. A QuoteAttempt can later be linked to a Lead
 * via the `convertedToLeadId` FK if the same session converts.
 *
 * Failure mode: analytics, not critical. DB errors are logged server-side
 * but NEVER surfaced to the client — the user must not see a broken quote
 * flow because an analytics insert failed.
 *
 * Status codes:
 *   200 — row inserted (or silently swallowed on DB error — still 200)
 *   400 — validation failure (missing/invalid postcodes or coords)
 *   405 — non-POST method
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

  // ── 2. Zod validation (quoteAttemptSchema) ──
  // Postcodes required, coords required (coerced to numbers), the rest
  // optional. A validation failure here means the client sent malformed
  // data — surface a 400 so the client can correct it.
  const parsed = quoteAttemptSchema.safeParse(body);
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

  // ── 3. Insert QuoteAttempt row ──
  // QuoteAttempt.distanceMiles is Int? in the schema, but quoteAttemptSchema
  // allows a coerced float (Haversine can return e.g. 190.4). Round to the
  // nearest int at this boundary so the insert doesn't fail the column type.
  // weightKg has the same consideration.
  try {
    const attempt = await prisma.quoteAttempt.create({
      data: {
        originPostcode: d.originPostcode,
        originLat: d.originLat,
        originLng: d.originLng,
        destPostcode: d.destPostcode,
        destLat: d.destLat,
        destLng: d.destLng,
        distanceMiles:
          d.distanceMiles != null ? Math.round(d.distanceMiles) : null,
        vehicleId: d.vehicleId ?? null,
        cargoType: d.cargoType ?? null,
        weightKg: d.weightKg != null ? Math.round(d.weightKg) : null,
        utmSource: d.utmSource ?? null,
        utmMedium: d.utmMedium ?? null,
        utmCampaign: d.utmCampaign ?? null,
      },
    });

    return NextResponse.json(
      { success: true, id: attempt.id },
      { status: 200 }
    );
  } catch (error) {
    // ── 4. Silent failure ──
    // This is analytics, not critical path. Log server-side for debugging
    // but return 200 to the client — the user must never see their quote
    // flow break because an analytics row didn't insert.
    console.error("[/api/quote-attempt] DB error (swallowed):", error);
    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  }
}
