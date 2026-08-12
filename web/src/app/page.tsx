import type { Metadata } from "next";

import { SectionShell } from "@/components/SectionShell";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { CardGrid } from "@/components/CardGrid";
import { CTASection } from "@/components/CTASection";
import { JsonLd } from "@/components/JsonLd";
import { QuoteWizard } from "@/components/QuoteWizard";
import { TradeAccountForm } from "@/components/TradeAccountForm";
import { DispatchMap } from "@/components/DispatchMap";
import { FleetGrid } from "@/components/FleetGrid";

import { SITE } from "@/lib/site";
import {
  organizationJsonLd,
  websiteJsonLd,
  faqJsonLd,
  pageMetadata,
} from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title:
    "Same Day Express Couriers | Nationwide Urgent Delivery | Collect in 60 Mins",
  description:
    "UK's premier same-day courier service. Nationwide collection in 60 minutes. Fully insured with £20k goods-in-transit cover, DBS vetted drivers, and signed proof of delivery.",
  path: "/",
});

const HOME_FAQ = [
  {
    question: "How quickly can Same Day Express Couriers collect?",
    answer:
      "We collect within 60 minutes of booking, nationwide. Drivers are pre-positioned across the UK for immediate dispatch.",
  },
  {
    question: "How much does a same day courier cost in the UK?",
    answer:
      "Pricing starts from £25 + £1.00/mile for motorcycle, up to £75 + £2.10/mile for a Luton van. Use our online quote calculator for an instant price based on your route and cargo.",
  },
  {
    question: "Are your drivers DBS checked and insured?",
    answer:
      "Yes. All drivers carry DBS background checks and £20,000 goods-in-transit insurance as standard on every job.",
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[organizationJsonLd(), websiteJsonLd(), faqJsonLd(HOME_FAQ)]}
      />

      {/* ═══════ HERO ═══════ */}
      <section
        id="home"
        aria-label="Same-day courier — collect in 60 minutes"
        className="relative overflow-hidden bg-forest-dark text-ivory"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 80% 0%, rgba(156,128,92,0.18), transparent 70%)",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-28 lg:px-8">
          <div className="hero-stagger">
            <span className="inline-flex items-center gap-2 rounded-full border border-brass-border bg-forest/40 px-3 py-1.5 text-xs font-medium text-brass-bright">
              <span
                aria-hidden
                className="animate-live h-1.5 w-1.5 rounded-full bg-success"
              />
              Drivers active &amp; ready nationwide
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-[1.1] sm:text-5xl">
              Same-Day Dedicated Delivery.{" "}
              <span className="text-brass-bright">Collect in 60 Mins.</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg text-ivory/75">
              UK&rsquo;s premier urgent transport network. Direct vehicle
              dispatch, vetted drivers, and signed proof of delivery on
              completion. No hubs, no multi-drop delays.
            </p>

            <div className="mt-8 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { n: "60m", l: "Response Time" },
                { n: "£20k", l: "GIT Insurance" },
                { n: "24/7", l: "Dispatch Desk" },
                { n: "100%", l: "Direct Fleet" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-md border border-forest-highlight bg-forest/30 p-3 text-center"
                >
                  <div className="font-heading text-2xl font-bold text-brass-bright">
                    {s.n}
                  </div>
                  <div className="mt-0.5 text-xs text-ivory/60">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                href={`tel:${SITE.phoneHref}`}
                variant="primary"
                size="lg"
              >
                Call {SITE.phoneDisplay}
              </Button>
              <Button href="#quote" variant="ghost" size="lg" className="text-ivory hover:bg-forest/40">
                Get an Instant Quote
              </Button>
            </div>
          </div>

          {/* Quote wizard */}
          <div id="quote" className="scroll-mt-24">
            <QuoteWizard />
          </div>
        </div>
      </section>

      {/* ═══════ TRUST STRIP ═══════ */}
      <div className="border-y border-border-subtle bg-ivory-deep">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-7 gap-y-2 px-4 py-4 text-sm font-medium text-text-muted sm:px-6 lg:px-8">
          <span>Collect in 60 mins</span>
          <span aria-hidden className="text-text-light">
            •
          </span>
          <span>£20k insured</span>
          <span aria-hidden className="text-text-light">
            •
          </span>
          <span>DBS-vetted drivers</span>
          <span aria-hidden className="text-text-light">
            •
          </span>
          <span>24/7 dispatch desk</span>
        </div>
      </div>

      {/* ═══════ DISPATCH MAP ═══════ */}
      <DispatchMap />

      {/* ═══════ HOW IT WORKS ═══════ */}
      <SectionShell
        variant="ivory"
        spacing="lg"
        label="How same-day courier booking works in four steps"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-heading text-sm font-bold uppercase tracking-widest text-brass-dark">
            From call to delivery
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Booked in minutes.{" "}
            <span className="text-brass-dark">Collected in 60.</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              n: "01",
              t: "Book or Call",
              d: "Use the quote wizard above or ring our 24/7 dispatch desk with your route and cargo.",
            },
            {
              n: "02",
              t: "Driver Dispatched",
              d: "A dedicated vehicle is allocated from the nearest hub — no waiting on a shared route.",
            },
            {
              n: "03",
              t: "Signed POD on Delivery",
              d: "Your goods travel direct to the delivery point, with a signed proof of delivery on completion.",
            },
            {
              n: "04",
              t: "Delivered & Signed",
              d: "Digital proof of delivery on completion. Fully insured and chain-of-custody verified.",
            },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 80}>
              <Card className="h-full">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-brass-muted font-heading text-base font-bold text-brass-dark">
                  {s.n}
                </div>
                <h3 className="font-heading text-lg font-bold">{s.t}</h3>
                <p className="mt-2 text-sm text-text-muted">{s.d}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      {/* ═══════ FLEET ═══════ */}
      <SectionShell
        id="fleet"
        variant="ivory-deep"
        spacing="lg"
        label="The Same Day Express fleet"
        className="scroll-mt-24"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-heading text-sm font-bold uppercase tracking-widest text-brass-dark">
            Logistics Infrastructure
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            The Same Day Express Fleet
          </h2>
          <p className="mt-4 text-text-muted">
            Fully operational, secure, and direct courier vehicles positioned
            nationwide to handle any payload size or urgency.
          </p>
        </div>
        <FleetGrid />
      </SectionShell>

      {/* ═══════ SERVICES ═══════ */}
      <SectionShell
        id="services"
        variant="ivory"
        spacing="lg"
        label="Specialist courier services"
        className="scroll-mt-24"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-heading text-sm font-bold uppercase tracking-widest text-brass-dark">
            What We Do
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Specialist Courier Services
          </h2>
          <p className="mt-4 text-text-muted">
            Our operational network is customized to meet strict deadline
            constraints, secure chain of custody, and fragile cargo demands.
          </p>
        </div>
        <div className="mt-12">
          <CardGrid cols={2}>
            <ServiceCard
              title="Same Day Courier"
              desc="Your parcel collected within 60 minutes and driven direct — no hubs, no consolidation. Nationwide, 24/7."
              href="/services/same-day-courier"
            />
            <ServiceCard
              title="AOG & Aviation"
              desc="Grounded aircraft? A driver collects your part within 60 minutes and drives straight to the airport. Airside-experienced."
              href="/services/aog-aviation-courier"
            />
            <ServiceCard
              title="Medical & Pharma"
              desc="Specimens and pharma moved under strict chain-of-custody. DBS-vetted drivers, temperature-controlled, signed POD."
              href="/services/medical-courier"
            />
            <ServiceCard
              title="Legal Document Courier"
              desc="Court filings, contracts, and confidential briefs delivered direct and signed. Chain-of-custody verified on every run."
              href="/services/legal-courier"
            />
          </CardGrid>
        </div>
      </SectionShell>

      {/* ═══════ REVIEWS — honest "launching soon" banner ═══════ */}
      <SectionShell
        variant="ivory-deep"
        spacing="lg"
        label="Customer feedback"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-heading text-sm font-bold uppercase tracking-widest text-brass-dark">
            Customer Proof
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Verified UK Business Feedback
          </h2>
          <p className="mt-4 text-text-muted">
            We dispatch daily for hundreds of trade and urgent users. Here&rsquo;s
            what they say about our response times and secure network.
          </p>
        </div>
        <Reveal>
          <div className="mx-auto mt-10 max-w-2xl rounded-lg border border-brass-border bg-brass-muted p-8 text-center sm:p-12">
            <span className="inline-block rounded-full border border-brass-border bg-white/60 px-4 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-brass-dark">
              Reviews Launching Soon
            </span>
            <h3 className="mt-6 font-heading text-2xl font-bold">
              Our Verified Customer Feedback Programme Is In Setup
            </h3>
            <p className="mt-4 text-text-muted">
              Same Day Express Couriers is building a verified review profile,
              collected directly from our trade, legal, medical and aviation
              clients after each completed same-day delivery. We do not publish
              ratings we cannot stand behind — every review here will be tied to a
              real, dispatched job with confirmed proof of delivery.
            </p>
            <p className="mt-3 text-text-muted">
              If you have used our same-day courier service and would like to
              share your experience, or you are a business looking to set up a
              trade account, we would value your feedback.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button href="#quote" variant="primary">
                Get a Same-Day Quote
              </Button>
              <Button href="/trade-accounts" variant="ghost" className="border border-forest/30 bg-forest/5 hover:bg-forest/10">
                Open a Trade Account
              </Button>
            </div>
          </div>
        </Reveal>
      </SectionShell>

      {/* ═══════ TRADE ACCOUNTS ═══════ */}
      <SectionShell
        variant="forest-dark"
        spacing="lg"
        label="Trade accounts for regular corporate shippers"
      >
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="font-heading text-sm font-bold uppercase tracking-widest text-brass-bright">
              Commercial Accounts
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Trade Accounts for Regular Corporate Shippers
            </h2>
            <p className="mt-4 text-ivory/75">
              If your company dispatches multiple urgent packages weekly, you
              can streamline logistics and lower costs with a commercial trade
              account.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                {
                  t: "Priority Nationwide Dispatch",
                  d: "First-line response even during peak traffic conditions.",
                },
                {
                  t: "Flexible 30-Day Invoicing",
                  d: "Consolidate billing on monthly net terms.",
                },
                {
                  t: "Volume Pricing Adjustments",
                  d: "Reduced base charges and mileage pricing coefficients.",
                },
                {
                  t: "Dedicated Support Contact",
                  d: "Direct phone line straight to a senior dispatch controller.",
                },
              ].map((b) => (
                <li key={b.t} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-brass-muted text-sm font-bold text-brass-bright"
                  >
                    ✓
                  </span>
                  <div>
                    <p className="font-semibold text-ivory">{b.t}</p>
                    <p className="text-sm text-ivory/65">{b.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div id="trade-application" className="scroll-mt-24 rounded-lg bg-ivory p-6 text-forest sm:p-8">
            <h3 className="font-heading text-xl font-bold">
              Apply for a Trade Account
            </h3>
            <p className="mt-2 text-sm text-text-muted">
              Complete the contact request below. A senior manager will respond
              within 2 business hours.
            </p>
            <div className="mt-6">
              <TradeAccountForm />
            </div>
          </div>
        </div>
      </SectionShell>

      {/* ═══════ FAQ TEASER ═══════ */}
      <SectionShell variant="ivory" spacing="lg" label="Common questions">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-heading text-sm font-bold uppercase tracking-widest text-brass-dark">
            Common Questions
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Answers Before You Book
          </h2>
        </div>
        <div className="mt-12">
          <CardGrid cols={3}>
            <Reveal as="li" className="h-full" delay={0}>
              <Card className="h-full">
                <h3 className="font-heading text-lg font-bold">
                  How quickly can you collect?
                </h3>
                <p className="mt-2 text-sm text-text-muted">
                  A dedicated vehicle is dispatched within 60 minutes of your call
                  or online booking, nationwide, 24/7. Central postcodes often see
                  collection in 30–45 minutes.
                </p>
              </Card>
            </Reveal>
            <Reveal as="li" className="h-full" delay={80}>
              <Card className="h-full">
                <h3 className="font-heading text-lg font-bold">
                  How much does it cost?
                </h3>
                <p className="mt-2 text-sm text-text-muted">
                  Pricing runs from £25 base + £1.00/mile for a motorcycle up to
                  £75 + £2.10/mile for a Luton van. Use the quote calculator above
                  for an instant estimate.
                </p>
              </Card>
            </Reveal>
            <Reveal as="li" className="h-full" delay={160}>
              <Card className="h-full">
                <h3 className="font-heading text-lg font-bold">
                  Is my delivery insured?
                </h3>
                <p className="mt-2 text-sm text-text-muted">
                  Yes. Every job carries £20,000 goods-in-transit insurance as
                  standard, with DBS-vetted drivers and a signed digital proof of
                  delivery on completion.
                </p>
              </Card>
            </Reveal>
          </CardGrid>
        </div>
        <div className="mt-8 text-center">
          <Button href="/faq" variant="ghost">
            See all FAQs →
          </Button>
        </div>
      </SectionShell>

      {/* ═══════ CTA ═══════ */}
      <CTASection />
    </>
  );
}

/* ─────────────────────────  Local components  ───────────────────────── */

function ServiceCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Reveal className="h-full">
      <Card as="li" className="h-full">
        <h3 className="font-heading text-xl font-bold">{title}</h3>
        <p className="mt-2 text-sm text-text-muted">{desc}</p>
        <div className="mt-4 border-t border-border-subtle pt-4">
          <Button href={href} variant="ghost" size="sm">
            Learn More →
          </Button>
        </div>
      </Card>
    </Reveal>
  );
}

/**
 * Live dispatch coverage map — now lives in its own component:
 * @see web/src/components/DispatchMap.tsx
 */
