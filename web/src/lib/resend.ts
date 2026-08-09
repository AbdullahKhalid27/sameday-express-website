import { Resend } from "resend";

/**
 * Resend client singleton — safe for Next.js hot-reload.
 *
 * NOTE: resend v6 exports `Resend` as a NAMED export (not a default export),
 * hence `import { Resend } from "resend"`. The API key is read from
 * RESEND_API_KEY (see .env.example).
 */
const globalForResend = globalThis as unknown as { resend: Resend | undefined };

export const resend =
  globalForResend.resend ?? new Resend(process.env.RESEND_API_KEY);

if (process.env.NODE_ENV !== "production") globalForResend.resend = resend;

/** Send a transactional email via Resend and log the result to EmailLog. */
export async function sendAndLogEmail(params: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  entityType?: string;
  entityId?: string;
}) {
  // Dynamic import avoids a circular dependency between resend.ts and db.ts
  // at module-eval time. db.ts pulls in the Prisma driver adapter; importing
  // it lazily keeps the dependency graph flat for route handlers.
  const { prisma } = await import("./db");

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "bookings@samedayexpresscouriers.co.uk",
      to: params.to,
      subject: params.subject,
      html: params.html,
      replyTo: params.replyTo,
    });

    if (error) throw error;

    // Log success to EmailLog
    await prisma.emailLog.create({
      data: {
        to: params.to,
        subject: params.subject,
        resendMessageId: data?.id || null,
        status: "sent",
        entityType: params.entityType || null,
        entityId: params.entityId || null,
      },
    });

    return { success: true, messageId: data?.id };
  } catch (error) {
    // Log failure to EmailLog
    try {
      await prisma.emailLog.create({
        data: {
          to: params.to,
          subject: params.subject,
          status: "failed",
          entityType: params.entityType || null,
          entityId: params.entityId || null,
        },
      });
    } catch (_) {
      // DB log failed too — swallow, the main error is what matters
    }

    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
