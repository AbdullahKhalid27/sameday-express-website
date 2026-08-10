import { Resend } from "resend";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

/**
 * Resend client singleton — build-safe AND hot-reload-safe.
 *
 * NOTE: resend v6 exports `Resend` as a NAMED export (not a default export),
 * hence `import { Resend } from "resend"`. The API key is read from
 * RESEND_API_KEY (see .env.example).
 *
 * ── BUILD-SAFE (the critical part) ───────────────────────────────────────
 * During `next build`, Next.js imports every route module to collect page
 * data — including API routes that import leads.ts → resend.ts. The build
 * environment does NOT have RESEND_API_KEY (it's a runtime secret on Vercel).
 * The Resend constructor THROWS "Missing API key" if no key is passed, which
 * crashes the build. Same class of bug as db.ts instantiating Prisma at
 * import time.
 *
 * Fix: detect the build phase (or missing key) and export a no-op stub that
 * does nothing. The real Resend client is only created at runtime when
 * RESEND_API_KEY is present and a request actually sends an email.
 *
 * ── HOT-RELOAD GUARD ────────────────────────────────────────────────────
 * Stash on globalThis so the instance survives Next.js hot-reload cycles.
 */
const globalForResend = globalThis as unknown as { resend: Resend | undefined };

/**
 * True when we're inside `next build` OR when RESEND_API_KEY is absent.
 * In either case, the Resend constructor would throw — so we use a stub.
 */
function shouldUseStub(): boolean {
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return true;
  if (!process.env.RESEND_API_KEY) return true;
  return false;
}

/** A no-op Resend stub used during build / when the API key is missing. */
function createStubResend(): Resend {
  // emails.send returns a resolved promise so any caller awaiting it
  // doesn't throw during build-time module evaluation.
  const stub = {
    emails: {
      send: async () => ({ data: null, error: { message: "Resend stub — no API key" } }),
    },
  };
  return stub as unknown as Resend;
}

/** Lazily create the real Resend client on first use (not at import). */
function getResend(): Resend {
  if (!globalForResend.resend) {
    globalForResend.resend = new Resend(process.env.RESEND_API_KEY);
  }
  return globalForResend.resend;
}

/**
 * What we export. During build / when RESEND_API_KEY is missing: a no-op stub.
 * At runtime with the key set: a lazy proxy that materialises the real
 * Resend client on first property access.
 */
export const resend: Resend = shouldUseStub()
  ? createStubResend()
  : (new Proxy({} as Resend, {
      get(_target, prop: string | symbol) {
        const client = getResend();
        const value = (client as unknown as Record<string | symbol, unknown>)[prop];
        return typeof value === "function" ? value.bind(client) : value;
      },
    }) as Resend);

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
