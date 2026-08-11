import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { checkoutSchema } from "@/lib/validation";

/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout Session from a saved Quote.
 *
 * Flow:
 *   1. Client submits the lead → /api/lead returns { leadId }
 *   2. User clicks "Pay Now" on Step 4
 *   3. Client POSTs { leadId } here
 *   4. We load the Lead + Quote + Customer from the DB
 *   5. We create a Stripe Checkout Session with the quote total
 *   6. Client redirects to session.url (Stripe-hosted payment page)
 *   7. On payment, Stripe fires the webhook → /api/stripe/webhook
 *   8. Webhook creates the Order + Payment rows
 *
 * The Checkout Session metadata carries leadId so the webhook can link
 * the resulting Order back to the Lead.
 *
 * Money: the Quote table stores integer pence. Stripe expects integer
 * pence too (amount_subtotal). No conversion needed — we pass pence
 * straight through.
 */

export async function POST(req: Request) {
  // ── 1. Parse + validate body ──
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { leadId } = parsed.data;

  // ── 2. Load the Lead + Quote + Customer ──
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      quote: true,
      customer: true,
    },
  });

  if (!lead || !lead.quote) {
    return NextResponse.json(
      { error: "Quote not found for this lead." },
      { status: 404 }
    );
  }

  const { quote, customer } = lead;

  // ── 3. Check Stripe is configured ──
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Payment gateway not configured." },
      { status: 503 }
    );
  }

  // ── 4. Create the Checkout Session ──
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customer.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: quote.totalPence, // already integer pence
            product_data: {
              name: `Same-day courier: ${quote.originPostcode} → ${quote.destPostcode}`,
              description: `${quote.cargoType}, ${quote.weightKg}kg, ${quote.distanceMiles} miles — ${quote.vehicleId}`,
              // Stripe requires a non-empty metadata-friendly product.
            },
          },
        },
      ],
      metadata: {
        leadId: lead.id,
        customerId: customer.id,
        quoteId: quote.id,
        vehicleId: quote.vehicleId,
        origin: quote.originPostcode,
        destination: quote.destPostcode,
      },
      success_url: `${siteUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/booking/cancelled`,
      // Stripe sends these events to our webhook endpoint.
      // We listen for checkout.session.completed + payment_intent.succeeded.
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("[stripe/checkout] Failed to create session:", error);
    return NextResponse.json(
      { error: "Could not start payment. Please call us to book." },
      { status: 500 }
    );
  }
}

// Reject non-POST methods.
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
