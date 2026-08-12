import type { Metadata } from "next";
import { SectionShell } from "@/components/SectionShell";
import { Breadcrumbs, homeCrumb } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { CTASection } from "@/components/CTASection";
import { Reveal } from "@/components/Reveal";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Payment Cancelled",
  description:
    "Your Same Day Express payment was cancelled. You can try again or contact our 24/7 dispatch desk to book your delivery.",
  path: "/booking/cancelled",
});

export default function CancelledPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-forest-dark py-14 text-ivory md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            onDark
            items={[homeCrumb(), { label: "Booking" }, { label: "Payment Cancelled" }]}
          />
          <h1 className="mt-6 text-3xl font-bold sm:text-4xl md:text-5xl">
            Payment Cancelled
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ivory/75">
            Your payment session was cancelled and no charge was made. You can
            start a new booking or call our dispatch desk to complete your
            order.
          </p>
        </div>
      </section>

      {/* ── Cancelled icon + message ──────────────────────────── */}
      <SectionShell variant="ivory" spacing="md" label="Payment cancelled">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            {/* Warning icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-danger/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 text-danger"
                aria-hidden
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>

            <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
              No payment was taken
            </h2>
            <p className="mt-3 text-text-muted">
              Your checkout session was cancelled before the payment could
              complete. This can happen if you closed the payment window,
              pressed back, or your card was declined. Your card has not been
              charged.
            </p>
          </div>
        </Reveal>
      </SectionShell>

      {/* ── Actions ───────────────────────────────────────────── */}
      <SectionShell variant="ivory-deep" spacing="md" label="What you can do">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-heading text-sm font-bold uppercase tracking-widest text-brass-dark">
              Get your delivery booked
            </p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Try again or call us
            </h2>
            <p className="mt-4 text-text-muted">
              You can restart the quote and checkout process, or call our
              dispatch desk and we&rsquo;ll take your payment over the phone.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="primary" size="lg" href="/#quote">
                Get a New Quote
              </Button>
              <Button
                variant="accent"
                size="lg"
                href={`tel:${SITE.phoneHref}`}
              >
                Call Desk: {SITE.phoneDisplay}
              </Button>
            </div>
          </div>
        </Reveal>
      </SectionShell>

      {/* ── Reassurance ───────────────────────────────────────── */}
      <SectionShell variant="ivory" spacing="sm" label="Reassurance">
        <Reveal>
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Common reasons for cancellation
            </h2>
            <dl className="mt-6 space-y-4">
              <div>
                <dt className="font-semibold text-forest">
                  I closed the browser window
                </dt>
                <dd className="mt-1 text-sm text-text-muted">
                  No problem — simply start a new quote and your delivery will
                  be processed normally.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-forest">
                  My card was declined
                </dt>
                <dd className="mt-1 text-sm text-text-muted">
                  Try a different card or payment method, or call our dispatch
                  desk and we can take payment over the phone.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-forest">
                  I need to change the booking details
                </dt>
                <dd className="mt-1 text-sm text-text-muted">
                  Start a new quote with the updated details, or call us and
                  we&rsquo;ll adjust it manually.
                </dd>
              </div>
            </dl>
          </div>
        </Reveal>
      </SectionShell>

      <CTASection
        title="Still Need Urgent Delivery?"
        body="Our 24/7 dispatch desk is standing by. One call gets a driver en route within 60 minutes."
        quoteHref="/#quote"
      />
    </>
  );
}
