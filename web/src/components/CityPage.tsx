import type { Metadata } from "next";

import { SectionShell } from "./SectionShell";
import { Reveal } from "./Reveal";
import { Card } from "./Card";
import { CardGrid } from "./CardGrid";
import { CTASection } from "./CTASection";
import { Breadcrumbs, homeCrumb } from "./Breadcrumbs";
import { JsonLd } from "./JsonLd";
import { CityLinksBar } from "./CityLinksBar";

import type { CityData } from "@/lib/cities";
import { localBusinessJsonLd, speakableJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";

/**
 * City landing page template — renders any of the 6 location pages from a
 * CityData record. All copy comes from lib/cities.ts (verbatim from the
 * static site), so this component holds zero hardcoded city text.
 *
 * Section order matches the static site exactly:
 *  hero → service → postcodes → who → how-to-book → faq → CTA
 */
export function cityPageMetadata(city: CityData): Metadata {
  return pageMetadata({
    // P2-10: shorter SEO title ("Same Day Courier London" + template
    // suffix = ≤60 chars total). The visible H1 is unchanged.
    title: `Same Day Courier ${city.cityName}`,
    // P2-9: dedicated meta description (120-160 chars) — the answerBlock
    // is long-form page copy (244-294 chars) and was never meant to be
    // a meta description.
    description: city.metaDescription,
    // Flat URL at the root — e.g. /same-day-courier-london. Matches the
    // footer links and the locked "flat URL" SEO decision (FRONTEND-FIXES P0-2).
    path: `/${city.slug}`,
  });
}

export function CityPage({ city }: { city: CityData }) {
  return (
    <>
      <JsonLd
        data={[
          localBusinessJsonLd(city.cityName, city.region),
          // P2-4: voice/AEO speakable — targets the .answer-block paragraph.
          speakableJsonLd(`/${city.slug}`),
          faqJsonLd(city.faqItems),
        ]}
      />

      {/* ── City hero ── */}
      <section
        aria-label={`${city.cityName} same-day courier hero`}
        className="relative overflow-hidden bg-forest-dark py-14 text-ivory md:py-20"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 40% at 85% 10%, rgba(156,128,92,0.16), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            onDark
            items={[
              homeCrumb(),
              { label: "Locations", href: "/locations" },
              { label: `Same Day Courier ${city.cityName}` },
            ]}
          />
          <h1 className="mt-6 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            Same Day Courier {city.cityName} —{" "}
            <span className="text-brass-bright">Collection in 60 Minutes</span>
          </h1>
          <div
            aria-label={`Key routes served in and around ${city.cityName}`}
            className="mt-5 flex flex-wrap gap-2"
          >
            {city.routeChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-brass-border bg-forest/40 px-3 py-1 text-xs font-medium text-brass-bright"
              >
                {chip}
              </span>
            ))}
          </div>
          <p className="answer-block mt-6 max-w-2xl rounded-lg border border-brass-border bg-brass-muted p-4 text-sm leading-relaxed text-ivory/85">
            {city.answerBlock}
          </p>
        </div>
      </section>

      {/* ── Service intro (dark) ── */}
      <SectionShell variant="forest-dark" spacing="md" label={city.serviceH2}>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold sm:text-3xl">{city.serviceH2}</h2>
          <p className="mt-4 text-lg leading-relaxed text-ivory/80">
            {city.serviceBody}
          </p>
        </div>
      </SectionShell>

      {/* ── Postcodes we cover ── */}
      <SectionShell variant="ivory" spacing="md" label={city.postcodesH2}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{city.postcodesH2}</h2>
          <p className="mt-3 text-text-muted">{city.postcodesIntro}</p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {city.postcodeGroups.map((g) => (
            <div
              key={g.label}
              className="flex items-center justify-between rounded-md border border-border-subtle bg-white px-4 py-3"
            >
              <span className="text-sm font-medium text-forest">{g.label}</span>
              <span className="font-heading text-sm font-bold text-brass-dark">
                {g.codes}
              </span>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* ── Who we work with / who uses us ── */}
      <SectionShell
        variant={city.whoSectionVariant === "dark" ? "forest-dark" : "ivory"}
        spacing="md"
        label={city.whoH2}
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{city.whoH2}</h2>
          <p className="mt-3 text-text-muted">{city.whoIntro}</p>
          {city.whoSectionVariant === "dark" && (
            <p
              className="mt-3"
              style={{ color: "rgba(250,249,246,0.65)" }}
              aria-hidden
            />
          )}
        </div>
        <div className="mt-10">
          <CardGrid cols={3}>
            {city.whoCards.map((card, i) => (
              <Reveal key={card.title} delay={i * 60} className="h-full">
                <Card as="li" className="h-full">
                  <h3 className="font-heading text-lg font-bold">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm text-text-muted">{card.body}</p>
                </Card>
              </Reveal>
            ))}
          </CardGrid>
        </div>
      </SectionShell>

      {/* ── How to book ── */}
      <SectionShell variant="forest-dark" spacing="md" label={city.howH2}>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{city.howH2}</h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {city.howSteps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brass-muted font-heading text-lg font-bold text-brass-bright">
                {step.number}
              </div>
              <h3 className="font-heading text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm text-ivory/70">{step.body}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* ── City FAQ ── */}
      <SectionShell variant="ivory" spacing="md" label={city.faqH2}>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            {city.faqH2}
          </h2>
          <div className="mt-8 space-y-3">
            {city.faqItems.map((faq) => (
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

      {/* ── City cross-links bar (Prompt 7c) ── */}
      <CityLinksBar currentSlug={city.slug} />

      {/* ── CTA ── */}
      <CTASection title={city.ctaH2} body={city.ctaBody} quoteHref="/#quote" />
    </>
  );
}
