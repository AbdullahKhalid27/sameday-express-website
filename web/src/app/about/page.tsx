import type { Metadata } from "next";

import { SectionShell } from "@/components/SectionShell";
import { Reveal } from "@/components/Reveal";
import { Card } from "@/components/Card";
import { CardGrid } from "@/components/CardGrid";
import { Breadcrumbs, homeCrumb } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { JsonLd } from "@/components/JsonLd";
import { organizationJsonLd, pageMetadata } from "@/lib/seo";

/**
 * About page — verbatim copy from the static about.html.
 */

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description:
    "Same Day Express Couriers is a UK-wide dedicated courier network. DBS vetted drivers, £20k goods-in-transit insurance, 60-minute nationwide collection.",
  path: "/about",
});

const WHY_CARDS = [
  { title: "DBS Vetted Drivers", body: "Every driver in our network holds a current DBS (Disclosure and Barring Service) check. Chain of custody is guaranteed from collection to delivery — essential for medical, legal, and sensitive cargo." },
  { title: "£20,000 GIT Insurance", body: "Every consignment is covered by £20,000 goods-in-transit insurance as standard. High-value items are welcome — just declare the value at booking and we can arrange additional cover." },
  { title: "60-Minute Nationwide", body: "We collect within 60 minutes of your confirmed booking, anywhere in the UK. In major cities our average is closer to 30-45 minutes. When you need it there today, every minute counts." },
  { title: "No Hubs, No Delays", body: "Your goods travel in one dedicated vehicle from collection point to delivery address. No sorting warehouses, no multi-drop consolidation, no transfers between depots. Direct means faster and safer." },
  { title: "24/7 Dispatch Desk", body: "Our booking desk operates around the clock, 365 days a year. Call at 3am on a Sunday and a real dispatcher answers. Signed proof of delivery is included on every single job we run." },
  { title: "Registered Business", body: "Same Day Express Couriers Ltd is a registered company in England and Wales. You deal with a legitimate, accountable business — not a faceless marketplace or an unvetted gig driver." },
];

const SERVICE_LINKS = [
  { title: "Same Day Courier", href: "/services/same-day-courier", body: "Urgent collection and direct delivery across the UK. Dedicated vehicle, no delays." },
  { title: "Medical Courier", href: "/services/medical-courier", body: "NHS supply chains, laboratory specimens, pharmaceuticals. DBS-vetted chain of custody." },
  { title: "Legal Document Courier", href: "/services/legal-courier", body: "Court filings, contracts, deed transfers. Direct hand delivery with digital POD." },
  { title: "AOG & Aviation Courier", href: "/services/aog-aviation-courier", body: "Aircraft on Ground emergency parts delivery. Airside-cleared drivers to all major UK airports." },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />

      {/* Hero */}
      <section className="bg-forest-dark py-14 text-ivory md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs onDark items={[homeCrumb(), { label: "About Us" }]} />
          <h1 className="mt-6 max-w-3xl text-3xl font-bold sm:text-4xl md:text-5xl">
            Who We Are — Built for Urgent UK Delivery
          </h1>
        </div>
      </section>

      {/* Mission */}
      <SectionShell variant="forest-dark" spacing="md" label="Our mission">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold sm:text-3xl">
            We Built Same Day Express for One Reason: Deadlines Matter
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ivory/80">
            Every missed delivery costs businesses real money — grounded
            aircraft, missed court filings, delayed medical samples, broken
            supply chain promises. We founded Same Day Express Couriers because
            we saw the logistics industry failing urgent customers. Multi-drop
            routes, warehouse consolidation, and indifferent drivers were the
            norm. We chose a different path:{" "}
            <strong className="font-semibold text-brass-bright">
              dedicated vehicles, direct routes, and DBS-vetted drivers
            </strong>{" "}
            who treat every consignment as critical. No hubs. No delays. No
            excuses. From a single envelope on a motorcycle to a full pallet load
            in a Luton van, every job gets a dedicated driver, signed proof of
            delivery, and our £20,000 goods-in-transit insurance as standard.
            That is our commitment, and it is why businesses across the UK trust
            us when the deadline cannot move.
          </p>
        </div>
      </SectionShell>

      {/* Why choose us */}
      <SectionShell variant="ivory" spacing="md" label="Why choose us">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Why Choose Same Day Express
          </h2>
          <p className="mt-3 text-text-muted">
            Six pillars that set us apart from every other courier network in the
            UK.
          </p>
        </div>
        <div className="mt-10">
          <CardGrid cols={3}>
            {WHY_CARDS.map((card, i) => (
              <Reveal key={card.title} delay={i * 60} className="h-full">
                <Card as="li" className="h-full">
                  <h3 className="font-heading text-lg font-bold">{card.title}</h3>
                  <p className="mt-2 text-sm text-text-muted">{card.body}</p>
                </Card>
              </Reveal>
            ))}
          </CardGrid>
        </div>
      </SectionShell>

      {/* Stats strip */}
      <section className="bg-forest-dark py-12 text-ivory">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-4 text-center sm:grid-cols-4 sm:px-6 lg:px-8">
          {[
            { n: "15,000+", l: "Deliveries Completed" },
            { n: "500+", l: "Corporate Clients" },
            { n: "£20K", l: "GIT Insurance" },
            { n: "60 Min", l: "Average Collection" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-heading text-3xl font-bold text-brass-bright sm:text-4xl">
                {s.n}
              </div>
              <div className="mt-1 text-sm text-ivory/65">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What we deliver */}
      <SectionShell variant="ivory" spacing="md" label="What we deliver">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">What We Deliver</h2>
          <p className="mt-3 text-text-muted">
            Specialist courier services for every industry and every urgency
            level.
          </p>
        </div>
        <div className="mt-10">
          <CardGrid cols={2}>
            {SERVICE_LINKS.map((card) => (
              <Card key={card.title} as="li">
                <h3 className="font-heading text-lg font-bold">
                  <a href={card.href} className="hover:text-brass-dark">
                    {card.title} →
                  </a>
                </h3>
                <p className="mt-2 text-sm text-text-muted">{card.body}</p>
              </Card>
            ))}
          </CardGrid>
        </div>
      </SectionShell>

      <CTASection
        title="Ready to Book a Same Day Courier?"
        body="Call our dispatch desk now or get an instant quote online. Drivers ready nationwide."
        quoteHref="/#quote"
      />
    </>
  );
}
