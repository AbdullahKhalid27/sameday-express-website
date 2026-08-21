import type { Metadata } from "next";

import { SectionShell } from "@/components/SectionShell";
import { Reveal } from "@/components/Reveal";
import { Card } from "@/components/Card";
import { CardGrid } from "@/components/CardGrid";
import { CTASection } from "@/components/CTASection";
import { Breadcrumbs, homeCrumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { DispatchMap } from "@/components/DispatchMap";

import { CITIES } from "@/lib/cities";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

/**
 * Coverage / locations hub — /locations (FRONTEND-FIXES P2-8).
 *
 * Aggregates the 8 flat city landing pages and targets
 * "courier coverage areas" style queries.
 */

export const metadata: Metadata = pageMetadata({
  title: "UK Coverage Areas",
  description:
    "Same day courier coverage across the UK: London, Manchester, Birmingham, Bristol, Leeds, Glasgow, Edinburgh, and Liverpool. 60-minute collection nationwide. Instant quote.",
  path: "/locations",
});

const COVERAGE_FAQ = [
  {
    question: "Do you only serve these 8 cities?",
    answer:
      "No. The 8 hub cities are where our drivers are pre-positioned for the fastest collections — but we collect from any UK postcode within 60 minutes and deliver nationwide, including rural Scotland, Wales, and Northern Ireland via ferry crossings.",
  },
  {
    question: "How fast can you collect outside a hub city?",
    answer:
      "Collection is within 60 minutes nationwide. On inter-city corridors (London–Birmingham–Manchester, for example) drivers are continuously repositioned, so even non-hub towns on motorway routes typically see 30–45 minute collections.",
  },
  {
    question: "Do you deliver between cities?",
    answer:
      "Yes — inter-city same-day delivery is one of our most common jobs, e.g. Manchester to London or Glasgow to Edinburgh. The vehicle stays dedicated to your consignment for the whole journey.",
  },
];

export default function LocationsHubPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(COVERAGE_FAQ)} />

      {/* ── Hero ── */}
      <section className="bg-forest-dark py-14 text-ivory md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            onDark
            items={[homeCrumb(), { label: "Coverage Areas" }]}
          />
          <h1 className="mt-6 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            UK Courier Coverage —{" "}
            <span className="text-brass-bright">Nationwide, In 60 Minutes</span>
          </h1>
          <p className="mt-6 max-w-2xl rounded-lg border border-brass-border bg-brass-muted p-4 text-sm leading-relaxed text-ivory/85">
            Same Day Express Couriers collects from any UK postcode within 60
            minutes. Our drivers are pre-positioned across 8 hub cities and
            every major motorway corridor for immediate dispatch, 24/7.
          </p>
        </div>
      </section>

      {/* ── Map ── */}
      <SectionShell variant="ivory" spacing="md" label="Dispatch network">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            The Dispatch Network
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-text-muted">
            Live hub positions and the motorway corridors our vehicles
            patrol between them. When you book, dispatch assigns the
            nearest available driver — no depot detours.
          </p>
          <div className="mt-10">
            <DispatchMap />
          </div>
        </div>
      </SectionShell>

      {/* ── City cards ── */}
      <SectionShell variant="ivory-deep" spacing="md" label="Hub cities">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Hub Cities
            </h2>
            <p className="mt-3 text-text-muted">
              Local same-day courier pages with postcodes, routes, and
              local case studies for each hub.
            </p>
          </div>
          <div className="mt-10">
            <CardGrid cols={4}>
              {CITIES.map((c, i) => (
                <Reveal key={c.slug} delay={i * 50} className="h-full">
                  <Card as="li" className="h-full text-center">
                    <h3 className="font-heading text-lg font-bold">
                      <a href={`/${c.slug}`} className="hover:text-brass-dark">
                        {c.cityName}
                      </a>
                    </h3>
                    <p className="mt-2 text-xs uppercase tracking-wide text-text-muted">
                      {c.region}
                    </p>
                  </Card>
                </Reveal>
              ))}
            </CardGrid>
          </div>
        </div>
      </SectionShell>

      {/* ── Coverage FAQ ── */}
      <SectionShell variant="ivory" spacing="md" label="Coverage FAQ">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Coverage FAQ
          </h2>
          <div className="mt-8 space-y-3">
            {COVERAGE_FAQ.map((faq) => (
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
