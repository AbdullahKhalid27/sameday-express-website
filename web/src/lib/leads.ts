import { prisma } from "./db";
import type { Prisma } from "@/generated/prisma/client";
import { sendAndLogEmail } from "./resend";
import { poundsToPence } from "./money";

/**
 * Belt-and-suspenders lead capture resilience.
 *
 * Strategy: DB write transaction + Resend email dispatch in parallel via Promise.allSettled.
 * Lead survives if EITHER lands:
 * - DB succeeds + email fails → lead in DB, team missed email (check EmailLog)
 * - DB fails + email succeeds → lead in dispatch inbox (raw email body)
 * - Both succeed → lead in DB + team notified
 * - Both fail → 500 error to client
 *
 * The email body contains the FULL lead data as fallback.
 */

export interface LeadCaptureResult {
  success: boolean;
  leadId?: string;
  emailSent: boolean;
  dbError?: string;
  emailError?: string;
}

export async function captureLeadWithResilience(params: {
  // DB data
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  customerCompany?: string;
  customerWhatsapp?: string;
  leadType: "QUOTE_REQUEST" | "CONTACT_ENQUIRY" | "TRADE_ACCOUNT_APPLICATION";
  leadRawData: Prisma.InputJsonValue;
  leadSource?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;

  // Quote-specific (optional)
  quoteData?: {
    originPostcode: string;
    originLat: number;
    originLng: number;
    destPostcode: string;
    destLat: number;
    destLng: number;
    distanceMiles: number;
    estimated: boolean;
    cargoType: string;
    weightKg: number;
    vehicleId: string;
    basePrice: string | number;
    mileageCost: string | number;
    cczSurcharge: string | number;
    subtotal: string | number;
    vat: string | number;
    total: string | number;
  };

  // Contact-specific (optional)
  contactData?: {
    collectionPostcode?: string;
    deliveryPostcode?: string;
    message?: string;
  };

  // Trade account-specific (optional)
  tradeData?: {
    companyName: string;
    contactName: string;
    phone: string;
    email: string;
    weeklyVolume: string;
  };

  // Email config
  emailSubject: string;
  emailHtml: string;
  emailEntityType?: string;
}) {
  // ── Dedup guard: skip only EXACT duplicate submissions in the last 5 min ──
  // Matches same customer email + same lead type + identical payload. A form
  // of one type must never hijack another: without the type/rawData filters
  // this guard used to return an old CONTACT lead's id for a new QUOTE_REQUEST
  // (same email, <5 min apart) — then /api/stripe/checkout failed with
  // "Quote not found for this lead" and the new enquiry was silently lost.
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const existingLead = await prisma.lead.findFirst({
    where: {
      customer: { email: params.customerEmail },
      type: params.leadType,
      rawData: { equals: params.leadRawData },
      createdAt: { gte: fiveMinutesAgo },
    },
    include: { customer: true },
  });
  if (existingLead) {
    return { success: true, leadId: existingLead.id, emailSent: false };
  }

  // ── Parallel: DB transaction + Email ──
  const [dbResult, emailResult] = await Promise.allSettled([
    // DB write
    (async () => {
      return await prisma.$transaction(async (tx) => {
        // 1. Upsert customer by email
        const customer = await tx.customer.upsert({
          where: { email: params.customerEmail },
          update: {
            name: params.customerName,
            phone: params.customerPhone || undefined,
            company: params.customerCompany || undefined,
            whatsapp: params.customerWhatsapp || undefined,
          },
          create: {
            email: params.customerEmail,
            name: params.customerName,
            phone: params.customerPhone || null,
            company: params.customerCompany || null,
            whatsapp: params.customerWhatsapp || null,
            source: params.leadSource || "website",
          },
        });

        // 2. Create lead
        const lead = await tx.lead.create({
          data: {
            customerId: customer.id,
            type: params.leadType,
            source: params.leadSource || "website",
            utmSource: params.utmSource || null,
            utmMedium: params.utmMedium || null,
            utmCampaign: params.utmCampaign || null,
            rawData: params.leadRawData,
          },
        });

        // 3. Create related entity based on type
        if (params.leadType === "QUOTE_REQUEST" && params.quoteData) {
          const q = params.quoteData;
          await tx.quote.create({
            data: {
              leadId: lead.id,
              customerId: customer.id,
              originPostcode: q.originPostcode,
              originLat: q.originLat,
              originLng: q.originLng,
              destPostcode: q.destPostcode,
              destLat: q.destLat,
              destLng: q.destLng,
              distanceMiles: q.distanceMiles,
              estimated: q.estimated,
              cargoType: q.cargoType,
              weightKg: q.weightKg,
              vehicleId: q.vehicleId,
              basePricePence: poundsToPence(q.basePrice),
              mileageCostPence: poundsToPence(q.mileageCost),
              cczSurchargePence: poundsToPence(q.cczSurcharge),
              subtotalPence: poundsToPence(q.subtotal),
              vatPence: poundsToPence(q.vat),
              totalPence: poundsToPence(q.total),
            },
          });
        }

        if (params.leadType === "CONTACT_ENQUIRY" && params.contactData) {
          await tx.contactEnquiry.create({
            data: {
              leadId: lead.id,
              customerId: customer.id,
              name: params.customerName,
              phone: params.customerPhone || "",
              email: params.customerEmail,
              company: params.customerCompany || null,
              collectionPostcode: params.contactData.collectionPostcode || null,
              deliveryPostcode: params.contactData.deliveryPostcode || null,
              message: params.contactData.message || "",
            },
          });
        }

        if (params.leadType === "TRADE_ACCOUNT_APPLICATION" && params.tradeData) {
          await tx.tradeAccountApplication.create({
            data: {
              leadId: lead.id,
              customerId: customer.id,
              companyName: params.tradeData.companyName,
              contactName: params.tradeData.contactName,
              phone: params.tradeData.phone,
              email: params.tradeData.email,
              weeklyVolume: params.tradeData.weeklyVolume,
            },
          });
        }

        return { leadId: lead.id, customerId: customer.id };
      });
    })(),

    // Email dispatch (parallel, independent)
    sendAndLogEmail({
      to: process.env.EMAIL_TO_TEAM || "dispatch@samedayexpresscouriers.co.uk",
      subject: params.emailSubject,
      html: params.emailHtml,
      replyTo: params.customerEmail,
      entityType: params.emailEntityType,
      entityId: undefined, // set after DB returns leadId
    }),
  ]);

  // ── Process results ──
  const result: LeadCaptureResult = { success: false, emailSent: false };

  if (dbResult.status === "fulfilled") {
    result.leadId = dbResult.value.leadId;
  } else {
    result.dbError = dbResult.reason?.message || String(dbResult.reason);
  }

  if (emailResult.status === "fulfilled" && emailResult.value.success) {
    result.emailSent = true;
  } else {
    result.emailError =
      emailResult.status === "rejected"
        ? emailResult.reason?.message || String(emailResult.reason)
        : emailResult.value?.error || "Unknown email error";
  }

  // Success if either DB or email landed
  result.success = !!(result.leadId || result.emailSent);

  return result;
}
