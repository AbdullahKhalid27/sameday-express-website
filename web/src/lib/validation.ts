import { z } from "zod";

/**
 * UK phone — mobiles (+44/07…) AND landlines (01/02/03/05/08…).
 * Mirrors the client-side PHONE_RE in QuoteWizard/ContactForm/TradeAccountForm
 * exactly, so a number the browser accepts never fails server-side.
 * Spaces, dashes and parentheses are stripped before matching.
 */
const UK_PHONE_RE =
  /^(?:(?:\+44|0)7\d{9}|(?:\+44|0)[12358]\d{8,9})$/;

const ukPhone = z
  .string()
  .trim()
  .min(1, "Phone is required")
  .refine(
    (v) => UK_PHONE_RE.test(v.replace(/[\s()+-]/g, "")),
    "Enter a valid UK phone number"
  );

/** Basic email check — Resend does final validation */
const email = z.string().trim().min(1, "Email is required").email("Enter a valid email");

/** UK postcode — basic format check */
const ukPostcode = z.string().trim().min(1, "Postcode is required");

// ── Lead (Quote Wizard) ──────────────────────────────────
export const leadSchema = z.object({
  // TEMPORARILY DISABLED: Turnstile bot-check (token optional while disabled)
  turnstileToken: z.string().optional().default(""),
  honeypot: z.string().max(0), // must be empty — bots fill it
  fullName: z.string().trim().min(1, "Name is required"),
  phone: ukPhone,
  email,
  company: z.string().trim().optional().default("N/A"),
  origin: z.string().trim().min(1, "Origin postcode is required"),
  originLat: z.coerce.number(),
  originLng: z.coerce.number(),
  destination: z.string().trim().min(1, "Destination postcode is required"),
  destLat: z.coerce.number(),
  destLng: z.coerce.number(),
  cargoWeight: z.coerce.number().min(0.1, "Weight must be positive"),
  cargoType: z.string().trim().min(1),
  selectedVehicle: z.string().trim().min(1),
  distanceMiles: z.coerce.number().min(0),
  driveDuration: z.coerce.number().min(0),
  estimatedQuote: z.object({
    miles: z.number(),
    totalMinutes: z.number(),
    basePrice: z.string(),
    mileageCost: z.string(),
    cczSurcharge: z.string(),
    subtotal: z.string(),
    vat: z.string(),
    total: z.string(),
    cczApplied: z.boolean(),
  }),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  whatsapp: z.string().trim().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

// ── Contact ──────────────────────────────────────────────
export const contactSchema = z.object({
  // TEMPORARILY DISABLED: Turnstile bot-check (token optional while disabled)
  turnstileToken: z.string().optional().default(""),
  honeypot: z.string().max(0),
  name: z.string().trim().min(1, "Name is required"),
  phone: ukPhone,
  email,
  company: z.string().trim().optional(),
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
  message: z.string().trim().optional().default(""),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

// ── Trade Account ─────────────────────────────────────────
export const tradeAccountSchema = z.object({
  // TEMPORARILY DISABLED: Turnstile bot-check (token optional while disabled)
  turnstileToken: z.string().optional().default(""),
  honeypot: z.string().max(0),
  companyName: z.string().trim().min(1, "Company name is required"),
  contactName: z.string().trim().min(1, "Contact name is required"),
  phone: ukPhone,
  email,
  estimatedWeeklyVolume: z.string().trim().min(1, "Estimated volume is required"),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export type TradeAccountInput = z.infer<typeof tradeAccountSchema>;

// ── Newsletter ────────────────────────────────────────────
export const newsletterSchema = z.object({
  email,
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

// ── Quote Attempt (abandoned funnel, no PII) ─────────────
export const quoteAttemptSchema = z.object({
  originPostcode: z.string().trim().min(1),
  originLat: z.coerce.number(),
  originLng: z.coerce.number(),
  destPostcode: z.string().trim().min(1),
  destLat: z.coerce.number(),
  destLng: z.coerce.number(),
  distanceMiles: z.coerce.number().min(0).optional(),
  vehicleId: z.string().trim().optional(),
  cargoType: z.string().trim().optional(),
  weightKg: z.coerce.number().min(0).optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export type QuoteAttemptInput = z.infer<typeof quoteAttemptSchema>;

// ── Stripe Checkout (create session from a saved quote) ──
// The client sends the leadId (from /api/lead) so the checkout route can
// load the saved Quote, build a Stripe Checkout Session, and link the
// resulting Order back to the Lead.
export const checkoutSchema = z.object({
  leadId: z.string().uuid("Invalid lead reference"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// ── Shared: Turnstile verification ────────────────────────
export interface TurnstileResult {
  ok: boolean;
  /** Cloudflare error code on failure, e.g. invalid-input-secret */
  code?: string;
}

export async function verifyTurnstile(token: string): Promise<TurnstileResult> {
  // ── TEMPORARILY DISABLED (2026-08-20) ──
  // Turnstile verification is switched off across all forms (quote, contact,
  // trade account) while we verify the database pipeline. Re-enable by
  // restoring the original body below (remove the early return and the
  // DISABLED flag).
  const TURNSTILE_DISABLED = true;
  if (TURNSTILE_DISABLED) {
    void token;
    return { ok: true };
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  // ── Dev-mode bypass ──
  // The TurnstileWidget component emits "dev-bypass" when no real site key
  // is available (or when running on localhost where Turnstile can't render).
  // We must accept this token in development, otherwise every form submission
  // fails — even though the forms themselves work perfectly.
  if (token === "dev-bypass") {
    // Expected when the deployed bundle was built without a site key.
    // Log loudly — this should never happen in production.
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[turnstile] rejected dev-bypass token in production — the browser bundle was built without NEXT_PUBLIC_TURNSTILE_SITE_KEY (redeploy needed) or the widget fell back to bypass"
      );
    }
    return { ok: process.env.NODE_ENV !== "production", code: "dev-bypass" };
  }

  // No real key configured — skip verification entirely.
  if (!secret || secret === "0x4AAAAAAAxxxxxxxxxxxxxxxxxxxxxxxx") {
    console.error(
      "[turnstile] TURNSTILE_SECRET_KEY is not set — skipping verification"
    );
    return { ok: true };
  }

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, token }),
      }
    );
    const data = await res.json();
    if (data.success !== true) {
      // Cloudflare's error-code tells us exactly what's wrong:
      //   invalid-input-secret  → wrong TURNSTILE_SECRET_KEY value
      //   timeout-or-duplicate  → token reused or older than 300s
      //   invalid-input-response→ bad/expired token or hostname/secret mismatch
      //   bad-request           → malformed request body
      const code = Array.isArray(data["error-codes"])
        ? data["error-codes"][0]
        : "unknown";
      console.error(
        "[turnstile] siteverify failed:",
        JSON.stringify({
          errorCodes: data["error-codes"],
          secretPrefix: secret.slice(0, 12) + "…",
          tokenPrefix: String(token).slice(0, 12) + "…",
        })
      );
      return { ok: false, code };
    }
    return { ok: true };
  } catch (e) {
    console.error("[turnstile] siteverify unreachable:", e);
    // If Turnstile is unreachable, fail open in development
    if (process.env.NODE_ENV === "development") return { ok: true };
    return { ok: false, code: "siteverify-unreachable" };
  }
}
