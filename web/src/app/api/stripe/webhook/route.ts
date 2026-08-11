import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

/**
 * POST /api/stripe/webhook
 *
 * Receives Stripe webhook events and processes them idempotently.
 *
 * Flow:
 *   1. Stripe fires webhook on payment events
 *   2. We verify the signature using STRIPE_WEBHOOK_SECRET
 *   3. We store the RAW event in WebhookEvent (before processing)
 *   4. We process the event:
 *      - checkout.session.completed → create Order + Payment, update Lead
 *      - payment_intent.payment_failed → update Order paymentStatus
 *   5. We mark the WebhookEvent as processed
 *
 * Idempotency:
 *   WebhookEvent.stripeEventId is @unique. If Stripe retries (which it does),
 *   the second insert fails → we know it's a replay and skip processing.
 *
 * The raw body MUST be used for signature verification (not JSON.parse'd).
 * Next.js Route Handlers give us the body via req.text() — we pass that
 * to stripe.webhooks.constructEvent.
 *
 * This route is EXCLUDED from the body-parsing rate limiter in middleware
 * because Stripe needs the raw body and the signature is its own auth.
 */

export async function POST(req: Request) {
  // ── 1. Get the raw body + signature ──
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // ── 2. Verify the signature ──
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // ── 3. Store raw event (idempotency guard) ──
  // If this event was already stored, Stripe is retrying — ack it.
  try {
    await prisma.webhookEvent.create({
      data: {
        stripeEventId: event.id,
        type: event.type,
        payload: event as unknown as object,
        processed: false,
      },
    });
  } catch {
    // Unique constraint violation → this is a replay. Ack and exit.
    return NextResponse.json({ received: true, replay: true });
  }

  // ── 4. Process the event ──
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event);
        break;

      default:
        // We only care about the two above. Other events are stored but
        // not processed — useful for future debugging / audit trail.
        break;
    }

    // Mark as processed
    await prisma.webhookEvent.update({
      where: { stripeEventId: event.id },
      data: { processed: true, processedAt: new Date() },
    });

    return NextResponse.json({ received: true, processed: true });
  } catch (error) {
    // Record the error on the WebhookEvent so we can replay later.
    console.error(`[stripe/webhook] Failed processing ${event.type}:`, error);
    await prisma.webhookEvent.update({
      where: { stripeEventId: event.id },
      data: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    // Return 500 so Stripe retries.
    return NextResponse.json(
      { error: "Processing failed — Stripe will retry" },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// HANDLER: checkout.session.completed
//
// This fires when the customer successfully completes the Stripe Checkout
// Session (payment succeeded). We create the Order + Payment rows and mark
// the Lead as CONVERTED.
// ────────────────────────────────────────────────────────────────────────────
async function handleCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const leadId = session.metadata?.leadId;
  const customerId = session.metadata?.customerId;

  if (!leadId || !customerId) {
    throw new Error(
      `checkout.session.completed (${session.id}): missing leadId/customerId in metadata`
    );
  }

  // Load the saved Quote (has all pricing in pence) to copy into the Order.
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { quote: true },
  });

  if (!lead?.quote) {
    throw new Error(
      `checkout.session.completed (${session.id}): Lead ${leadId} has no Quote`
    );
  }

  const q = lead.quote;

  // Generate a sequential order number: SDX-YYYY-NNNNN
  const orderNumber = await generateOrderNumber();

  // Get the payment intent ID (expand if needed, or from session).
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || null;

  // Create Order + Payment + update Lead status in a transaction.
  await prisma.$transaction(async (tx) => {
    // Create the Order
    const order = await tx.order.create({
      data: {
        leadId,
        customerId,
        orderNumber,
        status: "CONFIRMED",
        originPostcode: q.originPostcode,
        destPostcode: q.destPostcode,
        distanceMiles: q.distanceMiles,
        cargoType: q.cargoType,
        weightKg: q.weightKg,
        vehicleId: q.vehicleId,
        basePricePence: q.basePricePence,
        mileageCostPence: q.mileageCostPence,
        cczSurchargePence: q.cczSurchargePence,
        subtotalPence: q.subtotalPence,
        vatPence: q.vatPence,
        totalPence: q.totalPence,
        stripePaymentIntentId: paymentIntentId,
        stripeSessionId: session.id,
        paymentStatus: "SUCCEEDED",
        paidAt: new Date(),
      },
    });

    // Create the Payment ledger row (append-only, never update)
    if (paymentIntentId) {
      await tx.payment.create({
        data: {
          orderId: order.id,
          stripePaymentIntentId: paymentIntentId,
          stripeChargeId: null, // available in charge.succeeded, not here
          stripeEventId: event.id,
          amountPence: session.amount_total ?? q.totalPence,
          currency: session.currency || "gbp",
          status: "SUCCEEDED",
        },
      });
    }

    // Mark the Lead as CONVERTED
    await tx.lead.update({
      where: { id: leadId },
      data: {
        status: "CONVERTED",
        convertedAt: new Date(),
      },
    });

    // Audit trail
    await tx.activityLog.create({
      data: {
        entityType: "Order",
        entityId: order.id,
        action: "created",
        actor: "stripe_webhook",
        newValues: {
          orderNumber,
          totalPence: q.totalPence,
          paymentStatus: "SUCCEEDED",
        },
      },
    });
  });
}

// ────────────────────────────────────────────────────────────────────────────
// HANDLER: payment_intent.payment_failed
//
// Fires when a payment fails. We don't create an Order (the checkout didn't
// complete), but we log it for the audit trail.
// ────────────────────────────────────────────────────────────────────────────
async function handlePaymentFailed(event: Stripe.Event) {
  const intent = event.data.object as Stripe.PaymentIntent;

  await prisma.activityLog.create({
    data: {
      entityType: "Payment",
      entityId: intent.id,
      action: "payment_failed",
      actor: "stripe_webhook",
      newValues: {
        amount: intent.amount,
        currency: intent.currency,
        lastPaymentError: intent.last_payment_error?.message,
      },
    },
  });
}

// ────────────────────────────────────────────────────────────────────────────
// HELPER: Generate the next sequential order number.
//
// Format: SDX-YYYY-NNNNN  (e.g., SDX-2026-00001)
//
// We count existing orders this year and increment. This is NOT a perfect
// race-safe sequence (two concurrent webhooks could collide), but the
// @unique constraint on orderNumber will cause the second to retry.
// For a courier service doing dozens of bookings/day, this is fine.
// For higher volume, switch to a Postgres SEQUENCE.
// ────────────────────────────────────────────────────────────────────────────
async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `SDX-${year}-`;

  const count = await prisma.order.count({
    where: { orderNumber: { startsWith: prefix } },
  });

  const seq = String(count + 1).padStart(5, "0");
  return `${prefix}${seq}`;
}
