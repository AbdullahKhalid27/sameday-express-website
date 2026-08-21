import type { Metadata } from "next";

import { SectionShell } from "@/components/SectionShell";
import { Reveal } from "@/components/Reveal";
import { Card } from "@/components/Card";
import { CardGrid } from "@/components/CardGrid";
import { CTASection } from "@/components/CTASection";
import { Breadcrumbs, homeCrumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";

import { SERVICES, servicePath } from "@/lib/services";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

/**
 * Services hub — /services (FRONTEND-FIXES P2-8).
 *
 * Aggregates the 4 service pages, targets "same day courier services UK",
 * and gives the service breadcrumbs a real parent to link to.
 */

export const metadata: Metadata = pageMetadata({
  title: "Courier Services",
  description:
    "Same day courier services UK: dedicated vehicle delivery, AOG aviation parts, medical specimen transport, and legal document couriers. Collect in 60 minutes, 24/7. Get a quote.",
  path: "/services",
});

const SERVICES_FAQ = [
  {
    question: "Which courier service do I need?",
    answer:
      "For general urgent parcels and documents, choose Same Day Courier. For aircraft parts bound for an AOG event, use AOG & Aviation. For clinical specimens, pharmaceuticals, or NHS work, use Medical Courier. For court filings, deeds, and confidential contracts, use Legal Document Courier.",
  },
  {
    question: "How fast is collection?",
    answer:
      "Every service collects within 60 minutes of booking, nationwide. The vehicle then drives direct to the delivery point — no hubs, no multi-drop sorting, no overnight holds.",
  },
  {
    question: "Are all services available 24/7?",
    answer:
      "Yes. Our dispatch desk operates around the clock, every day of the year, including bank holidays. AOG support is prioritised at all hours because grounded aircraft cost money every minute.",
  },
];

export default function ServicesHubPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(SERVICES_FAQ)} />

      {/* ── Hero + intro ── */}
      <section className="bg-forest-dark py-14 text-ivory md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            onDark
            items={[homeCrumb(), { label: "Services" }]}
          />
          <h1 className="mt-6 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            Courier Services —{" "}
            <span className="text-brass-bright">Urgent, Dedicated, UK-Wide</span>
          </h1>
          <p className="mt-6 max-w-2xl rounded-lg border border-brass-border bg-brass-muted p-4 text-sm leading-relaxed text-ivory/85">
            Four specialist same-day courier services, one standard: a
            dedicated vehicle dispatched to your door within 60 minutes,
            driven direct to the delivery point by a DBS-vetted driver with
            £20,000 goods-in-transit insurance.
          </p>
        </div>
      </section>

      {/* ── Intro copy ── */}
      <SectionShell variant="ivory" spacing="md" label="What we do">
        <div className="mx-auto max-w-3xl space-y-5 text-lg leading-relaxed text-text-muted">
          <p>
            Same Day Express Couriers operates a nationwide dedicated
            courier network built around one promise: your consignment is
            collected within 60 minutes of booking and driven{" "}
            <strong className="text-forest">direct</strong> to its
            destination. There are no sorting hubs, no consolidated loads,
            and no overnight delays — the vehicle that collects your goods
            is the vehicle that delivers them.
          </p>
          <p>
            Every job is matched to the right vehicle from our eight-strong
            fleet, from a motorcycle for a 20kg passport run to a Luton box
            van for 1,200kg of multi-pallet freight. Pricing is transparent:
            a vehicle base rate plus mileage, quoted upfront with no hidden
            surcharges. VAT receipts and signed proof of delivery are
            issued on completion of every job.
          </p>
          <p>
            Beyond general urgent delivery, we run three specialist
            divisions. Our <strong className="text-forest">AOG &amp; aviation</strong>{" "}
            teams fly parts to grounded aircraft at every major UK airport.
            Our <strong className="text-forest">medical courier</strong>{" "}
            service moves specimens, pharmaceuticals, and NHS consignments
            with cold-chain handling and chain-of-custody signatures. And
            our <strong className="text-forest">legal document</strong>{" "}
            couriers hand-deliver court filings, contracts, and deeds where
            a paper trail matters.
          </p>
          <p>
            Dispatch is staffed 24/7, 365 days a year — including bank
            holidays. Trade account customers get priority booking,
            monthly invoicing, and dedicated account support.
          </p>
        </div>
      </SectionShell>

      {/* ── Service cards ── */}
      <SectionShell variant="ivory-deep" spacing="md" label="Our services">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Four Specialist Services
            </h2>
            <p className="mt-3 text-text-muted">
              Every service: 60-minute collection, dedicated vehicle,
              DBS-vetted driver, £20k insured.
            </p>
          </div>
          <div className="mt-10">
            <CardGrid cols={2}>
              {SERVICES.map((s, i) => (
                <Reveal key={s.slug} delay={i * 60} className="h-full">
                  <Card as="li" className="h-full">
                    <h3 className="font-heading text-lg font-bold">
                      <a href={servicePath(s.slug)} className="hover:text-brass-dark">
                        {s.h1.split(" — ")[0]} →
                      </a>
                    </h3>
                    <p className="mt-2 text-sm text-text-muted">
                      {s.metaDescription}
                    </p>
                  </Card>
                </Reveal>
              ))}
            </CardGrid>
          </div>
        </div>
      </SectionShell>

      {/* ── FAQ ── */}
      <SectionShell variant="ivory" spacing="md" label="Services FAQ">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Services FAQ
          </h2>
          <div className="mt-8 space-y-3">
            {SERVICES_FAQ.map((faq) => (
              <details
                key={faq.question}
                className="faq-item group rounded-md border border-border-subtle bg-white px-5 transition-colors open:border-brass-border hover:border-brass-border"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-heading text-base font-semibold text-forest [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-text-light transition-transform duration-200 group-open:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div className="faq-content grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 ease-out group-open:grid-rows-[1fr]">
                  <div className="overflow-hidden">
                    <p className="pb-4 text-sm leading-relaxed text-text-muted">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </SectionShell>

      <CTASection />
    </>
  );
}
