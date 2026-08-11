/**
 * Prisma seed script — creates minimal development data.
 *
 * Run with: npm run db:seed
 *
 * This is intentionally minimal: one admin customer + two test leads (one quote
 * request, one contact enquiry) + one newsletter subscriber. Enough to see the
 * admin dashboard populated during development without polluting prod.
 *
 * SAFE TO RE-RUN: uses upserts, so running twice won't duplicate rows.
 * Safe to delete every row before re-seeding by running: npm run db:reset
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local first.");
  }

  const adapter = new PrismaPg(connectionString);
  const prisma = new PrismaClient({ adapter });

  console.log("🌱 Seeding development data...\n");

  // ── 1. Admin/test customer ──
  const customer = await prisma.customer.upsert({
    where: { email: "test@samedayexpresscouriers.co.uk" },
    update: {},
    create: {
      email: "test@samedayexpresscouriers.co.uk",
      name: "Test Customer",
      phone: "07700900000",
      company: "SDX Test Co",
      type: "INDIVIDUAL",
      source: "seed",
    },
  });
  console.log(`✅ Customer: ${customer.id}`);

  // ── 2. Quote request lead ──
  const quoteLead = await prisma.lead.create({
    data: {
      customerId: customer.id,
      type: "QUOTE_REQUEST",
      status: "NEW",
      source: "seed",
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "same-day-courier-london",
      rawData: {
        origin: "SW1A 1AA",
        destination: "M1 1AE",
        vehicle: "Small Van",
        note: "Seeded test quote request",
      },
    },
  });
  console.log(`✅ Lead (QUOTE_REQUEST): ${quoteLead.id}`);

  // ── 3. Contact enquiry lead ──
  const contactLead = await prisma.lead.create({
    data: {
      customerId: customer.id,
      type: "CONTACT_ENQUIRY",
      status: "NEW",
      source: "seed",
      rawData: {
        message: "Seeded test contact enquiry",
      },
    },
  });
  console.log(`✅ Lead (CONTACT_ENQUIRY): ${contactLead.id}`);

  // ── 4. Newsletter subscriber ──
  const subscriber = await prisma.newsletterSubscriber.upsert({
    where: { email: "newsletter@samedayexpresscouriers.co.uk" },
    update: {},
    create: {
      email: "newsletter@samedayexpresscouriers.co.uk",
      subscribed: true,
      source: "seed",
    },
  });
  console.log(`✅ NewsletterSubscriber: ${subscriber.id}`);

  // ── 5. A quote attempt (abandoned funnel analytics) ──
  const attempt = await prisma.quoteAttempt.create({
    data: {
      originPostcode: "SW1A 1AA",
      originLat: 51.501,
      originLng: -0.1415,
      destPostcode: "M1 1AE",
      destLat: 53.48,
      destLng: -2.242,
      distanceMiles: 190,
      vehicleId: "small_van",
      cargoType: "documents",
      weightKg: 5,
      utmSource: "google",
      utmMedium: "cpc",
    },
  });
  console.log(`✅ QuoteAttempt: ${attempt.id}`);

  await prisma.$disconnect();
  console.log("\n🎉 Seed complete. 5 records created.");
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
