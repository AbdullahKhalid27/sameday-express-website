import type { Metadata } from "next";

import { SectionShell } from "@/components/SectionShell";
import { Card } from "@/components/Card";
import { CardGrid } from "@/components/CardGrid";
import { Breadcrumbs, homeCrumb } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { ContactForm } from "@/components/ContactForm";
import { JsonLd } from "@/components/JsonLd";
import { localBusinessJsonLd, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Contact Same Day Express Couriers for urgent same day delivery. Call 020 4568 4675 or WhatsApp. 24/7 dispatch desk. Collect anywhere in the UK within 60 minutes.",
  path: "/contact",
});

const INFO_CARDS = [
  { title: "Operating Hours", body: "24 hours / 7 days a week / 365 days a year" },
  { title: "Average Response Time", body: "Under 15 minutes for all enquiries" },
  { title: "Coverage", body: "Nationwide UK — every mainland postcode" },
  { title: "GIT Insurance", body: "£20,000 per consignment as standard" },
  { title: "Email Response", body: "Within 2 hours for non-urgent enquiries" },
];

const HUBS = ["London", "Manchester", "Birmingham", "Bristol", "Leeds", "Glasgow"];

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={localBusinessJsonLd("Nationwide UK", "United Kingdom")}
      />

      {/* Hero */}
      <section className="bg-forest-dark py-14 text-ivory md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs onDark items={[homeCrumb(), { label: "Contact Us" }]} />
          <h1 className="mt-6 text-3xl font-bold sm:text-4xl md:text-5xl">
            Contact Our Dispatch Desk
          </h1>
        </div>
      </section>

      {/* Contact methods */}
      <SectionShell variant="forest-dark" spacing="sm" label="Contact methods">
        <CardGrid cols={3}>
          <a
            href={`tel:${SITE.phoneHref}`}
            className="rounded-lg border border-brass-border bg-forest/40 p-6 text-center transition-colors hover:border-brass"
          >
            <p className="font-heading text-xl font-bold text-brass-bright tabular-nums">
              {SITE.phoneDisplay}
            </p>
            <p className="mt-1 text-sm text-ivory/65">24/7 Dispatch Line</p>
          </a>
          <a
            href={SITE.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-brass-border bg-forest/40 p-6 text-center transition-colors hover:border-brass"
          >
            <p className="font-heading text-xl font-bold text-brass-bright">
              WhatsApp Now
            </p>
            <p className="mt-1 text-sm text-ivory/65">Instant response</p>
          </a>
          <a
            href={`mailto:${SITE.email}`}
            className="rounded-lg border border-brass-border bg-forest/40 p-6 text-center transition-colors hover:border-brass"
          >
            <p className="font-heading text-base font-bold text-brass-bright break-all">
              {SITE.email}
            </p>
            <p className="mt-1 text-sm text-ivory/65">Non-urgent enquiries</p>
          </a>
        </CardGrid>
      </SectionShell>

      {/* Form + info */}
      <SectionShell variant="ivory" spacing="md" label="Request a callback">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Request a Callback</h2>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
          <div>
            <CardGrid cols={1}>
              {INFO_CARDS.map((card) => (
                <Card key={card.title} as="li" className="p-5">
                  <h3 className="font-heading text-base font-bold">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-muted">{card.body}</p>
                </Card>
              ))}
            </CardGrid>
          </div>
        </div>
      </SectionShell>

      {/* Coverage */}
      <SectionShell variant="ivory-deep" spacing="md" label="Nationwide coverage">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-heading text-sm font-bold uppercase tracking-widest text-brass-dark">
            Nationwide Coverage
          </p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            No single depot. Drivers everywhere.
          </h2>
          <p className="mt-4 text-text-muted">
            Same Day Express Couriers doesn&rsquo;t run from one warehouse —
            drivers are positioned across the UK, which is how we collect within
            60 minutes from almost anywhere. Call your nearest hub or book
            online.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {HUBS.map((hub) => (
              <a
                key={hub}
                href={`/same-day-courier-${hub.toLowerCase()}`}
                className="rounded-full border border-brass-border bg-white px-4 py-1.5 text-sm font-medium text-brass-dark hover:bg-brass-muted"
              >
                {hub}
              </a>
            ))}
          </div>
        </div>
      </SectionShell>

      {/* Quick questions */}
      <SectionShell variant="ivory" spacing="sm" label="Quick questions">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold sm:text-3xl">Quick Questions</h2>
          <dl className="mt-6 space-y-4">
            <div>
              <dt className="font-semibold text-forest">
                How quickly can you collect?
              </dt>
              <dd className="mt-1 text-sm text-text-muted">
                Within 60 minutes of booking, nationwide.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-forest">
                Do you operate 24/7?
              </dt>
              <dd className="mt-1 text-sm text-text-muted">
                Yes. Our dispatch desk is open 24 hours, 7 days a week, 365 days
                a year.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-forest">
                Do I get proof of delivery?
              </dt>
              <dd className="mt-1 text-sm text-text-muted">
                Yes. You receive driver and vehicle details on dispatch and a
                signed digital proof of delivery on completion.
              </dd>
            </div>
          </dl>
          <p className="mt-6">
            <a
              href="/faq"
              className="font-semibold text-brass-dark hover:text-brass"
            >
              See all FAQs →
            </a>
          </p>
        </div>
      </SectionShell>

      <CTASection
        title="Need Urgent Delivery? Call Now."
        body="Our dispatch team is standing by 24/7. One call gets a driver en route."
        quoteHref="/#quote"
      />
    </>
  );
}
