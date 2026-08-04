import type { Metadata } from "next";

import { SectionShell } from "@/components/SectionShell";
import { Breadcrumbs, homeCrumb } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

/**
 * FAQ page — 6 categories, 20 Q&A items, native <details> accordion.
 * All copy transcribed verbatim from the static faq.html.
 */

export const metadata: Metadata = pageMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers to the most common questions about same day courier services in the UK. Pricing, collection times, insurance, tracking, medical deliveries and more.",
  path: "/faq",
});

const FAQ_CATEGORIES: { title: string; items: { question: string; answer: string }[] }[] = [
  {
    title: "Booking & Collection",
    items: [
      { question: "How quickly can you collect my parcel?", answer: "We collect within 60 minutes of your confirmed booking, nationwide. Our drivers are positioned across the UK at all times, ready for immediate dispatch. For most major UK cities, collection is typically within 30-45 minutes." },
      { question: "How do I book a same day courier?", answer: "You can book instantly via our online quote form, by calling 020 4568 4675, or by WhatsApp. Our dispatch desk operates 24/7. Once booked, you'll receive driver and vehicle details within minutes." },
      { question: "Can I book a same day courier at night or on weekends?", answer: "Yes. We operate 24 hours a day, 7 days a week, 365 days a year — including bank holidays. Urgent deliveries don't follow business hours, and neither do we." },
      { question: "How much does a same day courier cost in the UK?", answer: "Pricing depends on distance, vehicle type, and cargo. As a guide: motorcycle starts from £25 + £1.00/mile, small vans from £35 + £1.20/mile, up to Luton vans from £75 + £2.10/mile. Use our online quote calculator for an instant price." },
      { question: "Do I need to package my goods before collection?", answer: "Yes. Items should be adequately packaged for transit. Our drivers cannot be held responsible for damage caused by inadequate packaging. For fragile or specialist cargo, contact us and we'll advise on appropriate packaging requirements." },
    ],
  },
  {
    title: "Insurance & Security",
    items: [
      { question: "What goods-in-transit insurance do you carry?", answer: "Every driver in our network carries £20,000 goods-in-transit (GIT) insurance as standard. This covers your consignment from collection to delivery. For higher-value items, please inform us at the time of booking." },
      { question: "Are your drivers DBS checked?", answer: "Yes. All drivers in our network are DBS (Disclosure and Barring Service) background-checked. This is mandatory for all drivers — particularly important for medical, legal, and sensitive document deliveries." },
      { question: "How do I know my delivery has been completed?", answer: "Yes. Every job includes signed proof of delivery. You will receive driver and vehicle details on dispatch, plus a signed digital proof of delivery on completion." },
      { question: "Do you provide proof of delivery?", answer: "Yes. A digital proof of delivery (POD) with timestamp and recipient signature is provided for every job. This is sent to your email address upon completion." },
    ],
  },
  {
    title: "Services & Cargo",
    items: [
      { question: "What types of goods can you deliver?", answer: "We handle documents, parcels, pallets, medical specimens, legal papers, IT hardware, industrial parts, and more. We deliver anything from a single envelope via motorcycle to multi-pallet loads via Luton van with tail lift." },
      { question: "Can you deliver medical samples and pharmaceutical goods?", answer: "Yes. We have experience with NHS supply chains, pharmacy deliveries, laboratory specimen transport, and cold-chain pharmaceutical goods. Our vetted drivers maintain chain of custody throughout." },
      { question: "Can you deliver legal documents and court filings?", answer: "Yes. We specialise in time-critical legal document delivery including court filings, original contracts, deed transfers, and signed agreements. Direct hand delivery with digital POD and timestamp." },
      { question: "What is an AOG courier and do you handle them?", answer: "AOG stands for Aircraft on Ground — a critical aviation emergency requiring urgent parts delivery to prevent aircraft downtime. We handle AOG runs to all major UK airports with airside-cleared drivers and immediate dispatch." },
      { question: "Do you deliver outside the UK?", answer: "We currently specialise in UK domestic same-day delivery. For international shipments, please contact us and we will advise on the best available solution." },
    ],
  },
  {
    title: "Vehicles & Capacity",
    items: [
      { question: "What vehicles do you have available?", answer: "Our fleet includes motorcycles (up to 20kg), small vans (up to 600kg), medium vans (up to 900kg), large vans LWB (up to 1,200kg), and Luton vans with tail lifts (up to 1,000kg with 4m load space). Select the right vehicle using our online quote form." },
      { question: "Can you carry pallets?", answer: "Yes. Our large vans carry 2-3 standard pallets and our Luton vans with powered tail lifts handle heavy pallet loads. For bulk pallet freight, use our commercial freight booking option." },
    ],
  },
  {
    title: "Business Accounts",
    items: [
      { question: "Do you offer accounts for regular business users?", answer: "Yes. Our Trade Account programme offers priority dispatch, 30-day monthly invoicing, volume pricing, and a dedicated dispatcher contact. Apply via our Trade Accounts page or call 020 4568 4675." },
      { question: "Can you integrate with our existing logistics platform?", answer: "Contact our commercial team to discuss integration options. We support custom SLAs for corporate clients with regular dispatch requirements." },
    ],
  },
  {
    title: "Coverage",
    items: [
      { question: "Which areas of the UK do you cover?", answer: "We cover the entire UK mainland including London, Birmingham, Manchester, Leeds, Bristol, Glasgow, Edinburgh, Cardiff, and all surrounding regions. No area is too remote — our nationwide driver network ensures coverage everywhere." },
      { question: "How long does a same day delivery take?", answer: "Transit time depends on distance. A London-to-Birmingham run typically takes 2-2.5 hours door to door. London to Manchester is approximately 3-4 hours. Our drivers travel direct — no stops, no hubs, no delays." },
    ],
  },
];

const ALL_FAQS = FAQ_CATEGORIES.flatMap((c) => c.items);

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(ALL_FAQS)} />

      {/* Hero */}
      <section
        aria-label="Frequently Asked Questions"
        className="bg-forest-dark py-14 text-ivory md:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            onDark
            items={[homeCrumb(), { label: "FAQ" }]}
          />
          <h1 className="mt-6 text-3xl font-bold sm:text-4xl md:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-ivory/75">
            Have a question? Find your answer below or call us:{" "}
            <a href={`tel:${SITE.phoneHref}`} className="font-semibold text-brass-bright hover:underline">
              {SITE.phoneDisplay}
            </a>
          </p>
        </div>
      </section>

      {/* Accordion */}
      <SectionShell variant="ivory" spacing="lg" label="FAQ accordion">
        <div className="mx-auto max-w-3xl">
          {FAQ_CATEGORIES.map((cat) => (
            <div key={cat.title} className="mb-8 last:mb-0">
              <h2 className="mb-3 border-b border-brass-border pb-2 font-heading text-sm font-bold uppercase tracking-wider text-brass-dark">
                {cat.title}
              </h2>
              <div className="space-y-2.5">
                {cat.items.map((faq) => (
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
          ))}
        </div>
      </SectionShell>

      <CTASection
        title="Still have a question?"
        body="Our dispatch team is available 24/7. Call us, WhatsApp us, or get an instant online quote."
        quoteHref="/#quote"
      />
    </>
  );
}
