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

import { SITE } from "@/lib/site";
import { FLEET, FLEET_ORDER } from "@/lib/fleet";
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
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brass-border bg-forest/40 px-3 py-1.5 text-xs font-medium text-brass-bright">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-success"
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
      <DispatchMapSection />

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
        variant="ivory-deep"
        spacing="lg"
        label="The Same Day Express fleet"
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
        <div className="mt-12">
          <CardGrid cols={3}>
            {FLEET_ORDER.map((id, i) => {
              const v = FLEET[id];
              return (
                <Reveal key={id} delay={i * 70} className="h-full">
                  <Card as="li" className="h-full">
                    <h3 className="font-heading text-lg font-bold">{v.name}</h3>
                    <p className="mt-2 text-sm text-text-muted">
                      {v.display.card}
                    </p>
                    <ul className="mt-4 space-y-1.5 text-sm">
                      <li className="flex justify-between gap-2">
                        <span className="text-text-muted">Payload Limit:</span>
                        <span className="font-semibold">
                          {v.maxWeight.toLocaleString()} KG
                        </span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-text-muted">Max Volume:</span>
                        <span className="font-semibold text-right">
                          {v.display.volume}
                        </span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-text-muted">
                          Typical Use Case:
                        </span>
                        <span className="font-semibold text-right">
                          {v.display.useCase}
                        </span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span className="text-text-muted">Est. Cost:</span>
                        <span className="font-semibold">{v.display.costLine}</span>
                      </li>
                    </ul>
                    <div className="mt-4 border-t border-border-subtle pt-4">
                      <Button href="#quote" variant="ghost" size="sm">
                        Select &amp; Quote
                      </Button>
                    </div>
                  </Card>
                </Reveal>
              );
            })}
          </CardGrid>
        </div>
      </SectionShell>

      {/* ═══════ SERVICES ═══════ */}
      <SectionShell
        variant="ivory"
        spacing="lg"
        label="Specialist courier services"
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
            <Button href="/trade-accounts" variant="secondary" className="border-forest/25 text-forest hover:bg-forest-muted">
              Open a Trade Account
            </Button>
          </div>
        </div>
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
            <Card as="li">
              <h3 className="font-heading text-lg font-bold">
                How quickly can you collect?
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                A dedicated vehicle is dispatched within 60 minutes of your call
                or online booking, nationwide, 24/7. Central postcodes often see
                collection in 30–45 minutes.
              </p>
            </Card>
            <Card as="li">
              <h3 className="font-heading text-lg font-bold">
                How much does it cost?
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                Pricing runs from £25 base + £1.00/mile for a motorcycle up to
                £75 + £2.10/mile for a Luton van. Use the quote calculator above
                for an instant estimate.
              </p>
            </Card>
            <Card as="li">
              <h3 className="font-heading text-lg font-bold">
                Is my delivery insured?
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                Yes. Every job carries £20,000 goods-in-transit insurance as
                standard, with DBS-vetted drivers and a signed digital proof of
                delivery on completion.
              </p>
            </Card>
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
 * Live dispatch coverage map — the flagship inline SVG.
 * Ports the static site's dispatch-map section verbatim: the stylised UK
 * landmass, route arcs, primary hubs (pulsing) and secondary coverage points.
 */
function DispatchMapSection() {
  const primaryHubs = [
    { x: 110, y: 70, label: "Glasgow", delay: 0 },
    { x: 150, y: 108, label: "Manchester", delay: 1 },
    { x: 172, y: 112, label: "Leeds", delay: 2 },
    { x: 150, y: 200, label: "Birmingham", delay: 3 },
    { x: 130, y: 232, label: "Bristol", delay: 1 },
    { x: 196, y: 252, label: "London", delay: 0 },
  ];
  const secondaryHubs: {
    x: number;
    y: number;
    label: string;
    anchor: "start" | "middle" | "end";
    dx: number;
    dy: number;
  }[] = [
    { x: 138, y: 58, label: "Edinburgh", anchor: "middle", dx: 0, dy: -8 },
    { x: 128, y: 120, label: "Liverpool", anchor: "end", dx: -8, dy: 2 },
    { x: 170, y: 80, label: "Newcastle", anchor: "middle", dx: 0, dy: -8 },
    { x: 170, y: 150, label: "Nottingham", anchor: "start", dx: 8, dy: 2 },
    { x: 108, y: 258, label: "Cardiff", anchor: "end", dx: -8, dy: 2 },
    { x: 156, y: 278, label: "Southampton", anchor: "middle", dx: 0, dy: 12 },
    { x: 176, y: 232, label: "Reading", anchor: "start", dx: 8, dy: 2 },
  ];

  return (
    <section
      aria-label="Same-day courier network coverage across the UK"
      className="bg-forest-dark py-16 text-ivory md:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <p className="font-heading text-sm font-bold uppercase tracking-widest text-brass-bright">
            Nationwide Network
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Drivers positioned across the UK,{" "}
            <span className="text-brass-bright">right now.</span>
          </h2>
          <p className="mt-4 text-ivory/75">
            A dedicated vehicle isn&rsquo;t dispatched from a single depot — our
            drivers are already positioned in major hubs nationwide, which is how
            we collect within 60 minutes. The map shows the coverage backbone
            that powers every same-day run.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: "var(--color-brass-bright)" }}
              />
              Primary hub
            </span>
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: "rgba(189,166,133,0.45)" }}
              />
              Regular coverage
            </span>
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: "rgba(156,128,92,0.4)" }}
              />
              On-demand nationwide
            </span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <svg
            viewBox="0 0 260 360"
            role="img"
            aria-label="Stylized map of the United Kingdom showing same-day courier coverage hubs nationwide"
            className="h-auto w-full"
          >
            {/* GB landmass */}
            <path
              fill="rgba(189,166,133,0.12)"
              stroke="rgba(189,166,133,0.35)"
              strokeWidth="1"
              d="M150 18 C172 20 186 36 184 56 C196 58 204 72 200 88 C212 92 214 110 206 122 C216 132 212 150 200 156 C206 170 200 186 188 190 L182 214 C186 230 178 246 164 248 C160 262 166 278 156 290 C150 306 134 312 124 304 C116 316 100 314 96 300 C84 302 74 292 78 280 C66 278 60 264 68 252 C56 246 52 230 62 220 C54 208 58 192 70 188 C62 172 68 156 82 152 C74 136 82 120 96 118 C90 100 98 84 112 82 C104 64 116 46 132 44 C134 28 142 18 150 18 Z"
            />
            <path
              fill="rgba(189,166,133,0.12)"
              stroke="rgba(189,166,133,0.35)"
              strokeWidth="1"
              opacity="0.7"
              d="M40 196 C52 192 64 200 62 214 C58 226 44 230 34 222 C28 212 32 200 40 196 Z"
            />

            {/* Route corridors */}
            <g
              fill="none"
              stroke="rgba(189,166,133,0.3)"
              strokeWidth="0.8"
              strokeDasharray="3 3"
            >
              <path d="M110 70 Q150 150 196 252" />
              <path d="M150 108 Q175 180 196 252" />
              <path d="M150 108 Q130 90 110 70" />
              <path d="M150 200 Q175 225 196 252" />
              <path d="M130 232 Q165 245 196 252" />
              <path d="M172 112 Q190 120 200 88" />
            </g>

            {/* Secondary hubs */}
            {secondaryHubs.map((h) => (
              <g key={h.label} fill="rgba(189,166,133,0.5)">
                <circle cx={h.x} cy={h.y} r="2.2" />
                <text
                  x={h.x + h.dx}
                  y={h.y + h.dy}
                  textAnchor={h.anchor}
                  fontSize="6"
                  fill="rgba(189,166,133,0.6)"
                >
                  {h.label}
                </text>
              </g>
            ))}

            {/* Primary hubs */}
            {primaryHubs.map((h) => (
              <g key={h.label}>
                <circle
                  cx={h.x}
                  cy={h.y}
                  r="3"
                  fill="rgba(189,166,133,0.25)"
                />
                <circle
                  cx={h.x}
                  cy={h.y}
                  r="3.2"
                  fill="none"
                  stroke="var(--color-brass-bright)"
                  strokeWidth="1"
                />
                <circle cx={h.x} cy={h.y} r="1.4" fill="var(--color-brass-bright)" />
                <text
                  x={h.x}
                  y={h.y - 10}
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="600"
                  fill="var(--color-ivory)"
                >
                  {h.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}
