import type { Metadata } from "next";

import { SectionShell } from "./SectionShell";
import { Reveal } from "./Reveal";
import { Card } from "./Card";
import { CardGrid } from "./CardGrid";
import { Breadcrumbs, homeCrumb } from "./Breadcrumbs";
import { CTASection } from "./CTASection";
import { JsonLd } from "./JsonLd";

import type { ServiceData, ServiceSection } from "@/lib/services";
import { servicePath } from "@/lib/services";
import { serviceJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";

/**
 * Service landing page template — renders any of the 4 service pages from a
 * ServiceData record. All copy comes from lib/services.ts (verbatim from the
 * static site). Handles every section kind via the <Section> dispatcher.
 */

export function servicePageMetadata(service: ServiceData): Metadata {
  // Gather FAQ items for FAQPage schema (if any FAQ section exists).
  const faqs = service.sections
    .filter((s): s is Extract<ServiceSection, { kind: "faq" }> => s.kind === "faq")
    .flatMap((s) => s.faqItems);

  return pageMetadata({
    title: service.h1,
    description: service.metaDescription,
    path: servicePath(service.slug),
  });
  // JSON-LD is emitted separately in the component (needs both Service + FAQ).
}

export function ServicePage({ service }: { service: ServiceData }) {
  const faqs = service.sections
    .filter((s): s is Extract<ServiceSection, { kind: "faq" }> => s.kind === "faq")
    .flatMap((s) => s.faqItems);

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd({
            name: service.h1.split(" — ")[0] ?? service.h1,
            description: service.metaDescription,
            path: servicePath(service.slug),
            cities: ["London", "Manchester", "Birmingham", "Bristol", "Leeds", "Glasgow"],
          }),
          ...(faqs.length > 0 ? [faqJsonLd(faqs)] : []),
        ]}
      />

      {/* ── Hero with breadcrumb + AEO answer block ── */}
      <section
        aria-label={service.h1}
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
              ...service.breadcrumb.slice(1).map((label, i, arr) => ({
                label,
                href: i < arr.length - 1 ? "/services" : undefined,
              })),
            ]}
          />
          <h1 className="mt-6 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            {service.h1}
          </h1>
          <p className="mt-6 max-w-2xl rounded-lg border border-brass-border bg-brass-muted p-4 text-sm leading-relaxed text-ivory/85">
            {service.answerBlock}
          </p>
        </div>
      </section>

      {/* ── Sections (data-driven) ── */}
      {service.sections.map((section, i) => (
        <Section key={i} section={section} />
      ))}

      {/* ── CTA ── */}
      <CTASection title={service.cta.h2} body={service.cta.body} quoteHref="/#quote" />
    </>
  );
}

/* ─────────────  Section dispatcher  ───────────── */

function Section({ section }: { section: ServiceSection }) {
  const variant = section.variant;
  const heading = section.kind === "faq" ? section.h2 : "h2" in section ? section.h2 : null;

  return (
    <SectionShell
      variant={variant === "dark" ? "forest-dark" : "ivory"}
      spacing="md"
      label={heading ?? undefined}
    >
      <SectionContent section={section} variant={variant} />
    </SectionShell>
  );
}

function SectionContent({
  section,
  variant,
}: {
  section: ServiceSection;
  variant: "dark" | "ivory";
}) {
  const onDark = variant === "dark";
  const accentClass = onDark ? "text-brass-bright font-semibold" : "text-brass-dark font-semibold";
  const mutedClass = onDark ? "text-ivory/75" : "text-text-muted";

  switch (section.kind) {
    case "prose": {
      // Accent phrase is bolded inside the body. Simple approach: render
      // body, then if accent exists, wrap the accent substring.
      const body = section.body.includes(section.accent ?? "\0") && section.accent
        ? renderWithAccent(section.body, section.accent, accentClass)
        : <p className="mt-4 text-lg leading-relaxed {0}">{section.body}</p>;
      return (
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold sm:text-3xl">{section.h2}</h2>
          <p className={["mt-4 text-lg leading-relaxed", mutedClass].join(" ")}>
            {section.accent && section.body.includes(section.accent)
              ? renderWithAccent(section.body, section.accent, accentClass)
              : section.body}
          </p>
        </div>
      );
    }

    case "cards": {
      return (
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">{section.h2}</h2>
            {section.intro && (
              <p className={["mt-3", mutedClass].join(" ")}>{section.intro}</p>
            )}
          </div>
          <div className="mt-10">
            <CardGrid cols={3}>
              {section.cards.map((card, i) => (
                <Reveal key={card.title} delay={i * 60} className="h-full">
                  <Card as="li" className="h-full">
                    <h3 className="font-heading text-lg font-bold">{card.title}</h3>
                    <p className={["mt-2 text-sm", mutedClass].join(" ")}>{card.body}</p>
                  </Card>
                </Reveal>
              ))}
            </CardGrid>
          </div>
        </div>
      );
    }

    case "steps": {
      return (
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">{section.h2}</h2>
            {section.intro && (
              <p className={["mt-3", mutedClass].join(" ")}>{section.intro}</p>
            )}
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {section.steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brass-muted font-heading text-lg font-bold text-brass-dark">
                  {step.number}
                </div>
                <h3 className="font-heading text-lg font-bold">{step.title}</h3>
                <p className={["mt-2 text-sm", mutedClass].join(" ")}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "checklist": {
      return (
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">{section.h2}</h2>
            {section.intro && (
              <p className={["mt-3", mutedClass].join(" ")}>{section.intro}</p>
            )}
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {section.items.map((item) => (
              <li key={item.text} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-success-muted text-xs font-bold text-success"
                >
                  ✓
                </span>
                <span className="text-sm">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    case "tags": {
      return (
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{section.h2}</h2>
          {section.intro && (
            <p className={["mt-3", mutedClass].join(" ")}>{section.intro}</p>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {section.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-brass-border bg-brass-muted px-5 py-2 text-sm font-semibold text-brass-dark"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      );
    }

    case "pricing": {
      return (
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">{section.h2}</h2>
            {section.intro && (
              <p className={["mt-3", mutedClass].join(" ")}>{section.intro}</p>
            )}
          </div>
          <div className="mt-8 overflow-hidden rounded-lg border border-border-medium">
            <table className="w-full text-sm">
              <thead className="bg-forest text-ivory">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Vehicle</th>
                  <th className="px-4 py-3 text-left font-semibold">Capacity</th>
                  <th className="px-4 py-3 text-left font-semibold">Base Rate</th>
                  <th className="px-4 py-3 text-left font-semibold">Per Mile</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {section.rows.map((row, i) => (
                  <tr
                    key={row.vehicle}
                    className={i % 2 === 0 ? "" : "bg-ivory-deep"}
                  >
                    <td className="px-4 py-3 font-semibold text-forest">{row.vehicle}</td>
                    <td className="px-4 py-3 text-text-muted">{row.capacity}</td>
                    <td className="px-4 py-3 font-bold text-brass-dark">{row.baseRate}</td>
                    <td className="px-4 py-3 font-bold text-brass-dark">{row.perMile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    case "airports": {
      return (
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">{section.h2}</h2>
            {section.intro && (
              <p className={["mt-3", mutedClass].join(" ")}>{section.intro}</p>
            )}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {section.airports.map((ap) => (
              <div
                key={ap.code}
                className="rounded-md border border-border-subtle bg-white p-4 text-center"
              >
                <div className="font-heading text-xl font-bold text-brass-dark">
                  {ap.code}
                </div>
                <div className="mt-1 text-xs text-text-muted">{ap.name}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "related": {
      return (
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">{section.h2}</h2>
            {section.intro && (
              <p className={["mt-3", mutedClass].join(" ")}>{section.intro}</p>
            )}
          </div>
          <div className="mt-8">
            <CardGrid cols={3}>
              {section.cards.map((card) => (
                <Card key={card.title} as="li">
                  <h3 className="font-heading text-lg font-bold">
                    <a href={card.href} className="hover:text-brass-dark">
                      {card.title} →
                    </a>
                  </h3>
                  <p className={["mt-2 text-sm", mutedClass].join(" ")}>{card.body}</p>
                </Card>
              ))}
            </CardGrid>
          </div>
        </div>
      );
    }

    case "caseStudy": {
      return (
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">{section.h2}</h2>
          <div className="mt-8 rounded-lg border border-brass-border bg-brass-muted p-6">
            <h3 className="font-heading text-lg font-bold text-forest">
              {section.subtitle}
            </h3>
            {section.paragraphs.map((p, i) => (
              <p key={i} className={["mt-3 text-sm leading-relaxed", mutedClass].join(" ")}>
                {p}
              </p>
            ))}
            <p className="mt-3 font-bold text-success">{section.result}</p>
          </div>
        </div>
      );
    }

    case "faq": {
      return (
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">{section.h2}</h2>
          <div className="mt-8 space-y-3">
            {section.faqItems.map((faq) => (
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
      );
    }
  }
}

/**
 * Split body text around the accent phrase and bold the accent.
 * Returns an array of React nodes.
 */
function renderWithAccent(body: string, accent: string, accentClass: string): React.ReactNode {
  const idx = body.indexOf(accent);
  if (idx === -1) return body;
  return [
    body.slice(0, idx),
    <strong key="accent" className={accentClass}>
      {accent}
    </strong>,
    body.slice(idx + accent.length),
  ];
}
