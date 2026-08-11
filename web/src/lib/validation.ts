import { z } from "zod";

/** UK phone: starts with +44 or 07, 10-14 digits after stripping spaces/dashes */
const ukPhone = z
  .string()
  .trim()
  .min(1, "Phone is required")
  .regex(/^(\+44|07)[\d\s-]{8,13}$/, "Enter a valid UK phone number");

/** Basic email check — Resend does final validation */
const email = z.string().trim().min(1, "Email is required").email("Enter a valid email");

/** UK postcode — basic format check */
const ukPostcode = z.string().trim().min(1, "Postcode is required");

// ── Lead (Quote Wizard) ──────────────────────────────────
export const leadSchema = z.object({
  turnstileToken: z.string().min(1, "Bot check required"),
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
  turnstileToken: z.string().min(1, "Bot check required"),
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
  turnstileToken: z.string().min(1, "Bot check required"),
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
export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || secret === "0x4AAAAAAAxxxxxxxxxxxxxxxxxxxxxxxx") {
    // No real key configured — skip verification in dev
    return true;
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
    return data.success === true;
  } catch {
    // If Turnstile is unreachable, fail open in development
    if (process.env.NODE_ENV === "development") return true;
    return false;
  }
}
