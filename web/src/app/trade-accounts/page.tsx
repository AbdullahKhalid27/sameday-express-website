import type { Metadata } from "next";

import { SectionShell } from "@/components/SectionShell";
import { Reveal } from "@/components/Reveal";
import { Card } from "@/components/Card";
import { CardGrid } from "@/components/CardGrid";
import { Breadcrumbs, homeCrumb } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { TradeAccountForm } from "@/components/TradeAccountForm";
import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Trade Accounts",
  description:
    "Open a trade account with Same Day Express Couriers. Priority dispatch, 30-day invoicing, volume pricing, dedicated account manager. Apply today.",
  path: "/trade-accounts",
});

const BENEFITS = [
  { title: "Priority Dispatch", body: "Trade account bookings go to the front of the queue. When capacity is tight, your jobs are allocated first. Your deadlines are our priority." },
  { title: "30-Day Monthly Invoicing", body: "No more paying per job at the point of booking. Receive a single consolidated invoice at the end of each month with 30-day payment terms." },
  { title: "Volume Rate Reductions", body: "As your shipment volume increases, your per-mile rates decrease. The more you ship, the more you save compared to ad hoc pricing." },
  { title: "Dedicated Dispatcher Contact", body: "Your account is assigned a dedicated dispatcher who knows your business, your routes, and your preferences. One point of contact, every time." },
  { title: "Monthly Usage Reports", body: "Receive a detailed breakdown of all shipments, costs, and delivery performance at the end of each billing period for your records and budgeting." },
  { title: "Custom SLA Options", body: "For high-volume accounts, we offer tailored service level agreements with guaranteed response times, dedicated vehicle allocation, and priority pricing tiers." },
];

const STEPS = [
  { number: "01", title: "Apply", body: "Complete the application form below. It takes less than two minutes." },
  { number: "02", title: "Approval Within 2 Hours", body: "Our commercial team reviews your application and contacts you to confirm account details and rates." },
  { number: "03", title: "Book & Ship", body: "Call your dedicated dispatcher or WhatsApp to book. Receive monthly consolidated invoices." },
];

const PRICING = [
  { band: "Standard", volume: "1 – 5", rate: "Ad hoc rates with monthly invoicing" },
  { band: "Professional", volume: "6 – 15", rate: "Reduced per-mile rates + priority dispatch" },
  { band: "Enterprise", volume: "15+", rate: "Custom SLA, volume pricing, dedicated vehicle options" },
];

const INDUSTRIES = [
  { title: "Law Firms", body: "Daily court filings, contract exchanges, and confidential document deliveries across multiple offices and courts." },
  { title: "NHS & Healthcare", body: "Regular specimen transport, pharmacy deliveries, and inter-site medical equipment moves across trust networks." },
  { title: "Engineering & Manufacturing", body: "Urgent parts delivery between sites, supplier collections, and just-in-time component shipments to keep production running." },
  { title: "Events Companies", body: "Last-minute equipment, branding materials, and critical event supplies delivered to venues on tight timelines." },
  { title: "Retail & Ecommerce", body: "Stock transfers between stores, warehouse replenishment, and urgent customer order fulfilment that cannot wait for next day." },
  { title: "Financial Services", body: "Time-sensitive document delivery between offices, client signature collections, and regulatory filing submissions." },
];

export default function TradeAccountsPage() {
  return (
    <>
      <JsonLd
        data={faqJsonLd([
          {
            question: "Do you offer accounts for regular business users?",
            answer:
              "Yes. Our Trade Account programme offers priority dispatch, 30-day monthly invoicing, volume pricing, and a dedicated dispatcher contact. Apply via our Trade Accounts page or call 020 4568 4675.",
          },
        ])}
      />

      {/* Hero */}
      <section className="bg-forest-dark py-14 text-ivory md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            onDark
            items={[
              homeCrumb(),
              { label: "Services", href: "/services/same-day-courier" },
              { label: "Trade Accounts" },
            ]}
          />
          <h1 className="mt-6 max-w-3xl text-3xl font-bold sm:text-4xl md:text-5xl">
            Trade Accounts for Business Couriers
          </h1>
        </div>
      </section>

      {/* Who this is for */}
      <SectionShell variant="forest-dark" spacing="md" label="Who this is for">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold sm:text-3xl">Who This Is For</h2>
          <p className="mt-4 text-lg leading-relaxed text-ivory/80">
            Trade Accounts are designed for companies that dispatch{" "}
            <strong className="font-semibold text-brass-bright">
              five or more urgent deliveries per week
            </strong>
            . If your logistics manager, office manager, or procurement team is
            calling a courier more than once a week, you are spending too much
            time on individual bookings and too much money on ad hoc rates. A
            Same Day Express Trade Account gives you priority dispatch,
            consolidated monthly invoicing, volume-based pricing, and a dedicated
            dispatcher who already knows your routes, your cargo types, and your
            service level expectations. It is the difference between calling a
            stranger every time you need a driver and having a logistics partner
            on speed dial.
          </p>
        </div>
      </SectionShell>

      {/* Benefits */}
      <SectionShell variant="ivory" spacing="md" label="Account benefits">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Account Benefits</h2>
          <p className="mt-3 text-text-muted">
            Everything you get when you open a trade account.
          </p>
        </div>
        <div className="mt-10">
          <CardGrid cols={3}>
            {BENEFITS.map((card, i) => (
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

      {/* How it works */}
      <SectionShell variant="forest-dark" spacing="md" label="How it works">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">How It Works</h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
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

      {/* Pricing structure */}
      <SectionShell variant="ivory" spacing="md" label="Pricing structure">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Pricing Structure</h2>
          <p className="mt-3 text-text-muted">
            Volume-based pricing that rewards your shipping frequency.
          </p>
        </div>
        <div className="mt-8 overflow-hidden rounded-lg border border-border-medium">
          <table className="w-full text-sm">
            <thead className="bg-forest text-ivory">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Volume Band</th>
                <th className="px-4 py-3 text-left font-semibold">Shipments / Week</th>
                <th className="px-4 py-3 text-left font-semibold">Rate Structure</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {PRICING.map((row, i) => (
                <tr key={row.band} className={i % 2 === 0 ? "" : "bg-ivory-deep"}>
                  <td className="px-4 py-3 font-semibold text-forest">{row.band}</td>
                  <td className="px-4 py-3 text-text-muted">{row.volume}</td>
                  <td className="px-4 py-3 text-text-muted">{row.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-center text-xs text-text-muted">
          Exact rates are provided upon application approval. All bands include
          £20k GIT insurance and digital POD.
        </p>
      </SectionShell>

      {/* Industries */}
      <SectionShell variant="ivory-deep" spacing="md" label="Industries using trade accounts">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Industries Using Trade Accounts
          </h2>
        </div>
        <div className="mt-10">
          <CardGrid cols={3}>
            {INDUSTRIES.map((card, i) => (
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

      {/* Apply form */}
      <SectionShell variant="ivory" spacing="md" label="Apply for a trade account">
        <div className="grid gap-10 lg:grid-cols-2">
          <div id="trade-application" className="scroll-mt-24">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Apply for a Trade Account
            </h2>
            <p className="mt-3 text-text-muted">
              Complete the contact request below. A senior manager will respond
              within 2 business hours.
            </p>
            <div className="mt-6">
              <TradeAccountForm />
            </div>
          </div>
          <div className="flex items-center">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Apply Now or Call Our Commercial Team
              </h2>
              <p className="mt-4 text-text-muted">
                Prefer to speak to someone? Call 020 4568 4675 and ask about
                trade accounts.
              </p>
            </div>
          </div>
        </div>
      </SectionShell>

      <CTASection quoteHref="/#quote" />
    </>
  );
}
