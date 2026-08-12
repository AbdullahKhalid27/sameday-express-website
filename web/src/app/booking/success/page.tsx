import type { Metadata } from "next";
import { stripe } from "@/lib/stripe";
import { SectionShell } from "@/components/SectionShell";
import { Breadcrumbs, homeCrumb } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { CTASection } from "@/components/CTASection";
import { Reveal } from "@/components/Reveal";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Payment Confirmed",
  description:
    "Your Same Day Express payment has been confirmed. A driver will be allocated within 15 minutes.",
  path: "/booking/success",
});

async function getSessionDetails(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
    return session;
  } catch {
    return null;
  }
}

/** Format pence → "£XX.XX" */
function formatPence(amount: number | null | undefined) {
  if (amount == null) return "—";
  return `£${(amount / 100).toFixed(2)}`;
}

/* ── Page ────────────────────────────────────────────────────────── */

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const sessionId = params.session_id;
  const session = sessionId ? await getSessionDetails(sessionId) : null;

  const customerEmail =
    session?.customer_details?.email ?? null;
  const amountTotal = session?.amount_total;
  const orderRef = session?.metadata?.orderNumber ?? null;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-forest-dark py-14 text-ivory md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            onDark
            items={[homeCrumb(), { label: "Booking" }, { label: "Payment Confirmed" }]}
          />
          <h1 className="mt-6 text-3xl font-bold sm:text-4xl md:text-5xl">
            Payment Confirmed
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ivory/75">
            Your payment has been received. Our dispatch team is allocating a
            driver now — you&rsquo;ll receive confirmation within 15 minutes.
          </p>
        </div>
      </section>

      {/* ── Success icon + summary ────────────────────────────── */}
      <SectionShell variant="ivory" spacing="md" label="Booking confirmation">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            {/* Green check icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 text-success"
                aria-hidden
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
              Thank you for your booking
            </h2>

            <p className="mt-3 text-text-muted">
              {session
                ? "Your payment was successful and your booking is being processed. Below is a summary of your transaction."
                : "Your payment was successful. We could not load the full session details, but your booking is confirmed — our team will be in touch shortly."}
            </p>
          </div>
        </Reveal>

        {/* ── Order details card ──────────────────────────────── */}
        {session && (
          <Reveal delay={150}>
            <div className="mx-auto mt-10 max-w-xl rounded-lg border border-brass-border bg-white p-6 sm:p-8">
              <p className="font-heading text-sm font-bold uppercase tracking-widest text-brass-dark">
                {orderRef ? `Order ${orderRef}` : "Payment Summary"}
              </p>

              <dl className="mt-5 divide-y divide-stone-200">
                <div className="flex justify-between py-2.5">
                  <dt className="text-sm text-text-muted">Status</dt>
                  <dd className="text-sm font-semibold text-success">Paid</dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt className="text-sm text-text-muted">Amount</dt>
                  <dd className="text-sm font-semibold">
                    {formatPence(amountTotal)}
                  </dd>
                </div>
                {customerEmail && (
                  <div className="flex justify-between py-2.5">
                    <dt className="text-sm text-text-muted">Email</dt>
                    <dd className="text-sm font-semibold">{customerEmail}</dd>
                  </div>
                )}
                {sessionId && (
                  <div className="flex justify-between py-2.5">
                    <dt className="text-sm text-text-muted">Session ID</dt>
                    <dd className="text-sm font-mono text-text-muted">
                      {sessionId.slice(0, 16)}&hellip;
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </Reveal>
        )}
      </SectionShell>

      {/* ── Next steps ───────────────────────────────────────── */}
      <SectionShell variant="ivory-deep" spacing="md" label="Next steps">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-heading text-sm font-bold uppercase tracking-widest text-brass-dark">
              What happens next
            </p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Driver allocation in progress
            </h2>
            <ul className="mt-6 space-y-4 text-left">
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-bold text-ivory">
                  1
                </span>
                <span className="text-text-muted">
                  Our dispatch desk reviews your booking and matches the nearest
                  available driver.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-bold text-ivory">
                  2
                </span>
                <span className="text-text-muted">
                  You&rsquo;ll receive a confirmation message with driver name,
                  vehicle details, and live tracking.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-bold text-ivory">
                  3
                </span>
                <span className="text-text-muted">
                  After delivery, a signed proof of delivery is emailed to you
                  automatically.
                </span>
              </li>
            </ul>
          </div>
        </Reveal>
      </SectionShell>

      {/* ── Contact fallback ──────────────────────────────────── */}
      <SectionShell variant="ivory" spacing="sm" label="Need help?">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-text-muted">
              If you have any questions about your booking or need to make
              changes, contact our 24/7 dispatch desk directly.
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                variant="primary"
                size="md"
                href={`tel:${SITE.phoneHref}`}
              >
                {SITE.phoneDisplay}
              </Button>
              <Button variant="ghost" size="md" href="/contact">
                Contact Us
              </Button>
            </div>
          </div>
        </Reveal>
      </SectionShell>

      <CTASection
        title="Need Another Same Day Delivery?"
        body="Our drivers are on standby 24/7. Book your next urgent delivery now."
        quoteHref="/#quote"
      />
    </>
  );
}
