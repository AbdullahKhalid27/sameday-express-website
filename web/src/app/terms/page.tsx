import type { Metadata } from "next";

import { SectionShell } from "@/components/SectionShell";
import { Breadcrumbs, homeCrumb } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

/**
 * Terms & Carriage Conditions — verbatim legal copy from the static terms.html.
 * 9 numbered sections. Last updated: 2026-06-27.
 */

export const metadata: Metadata = pageMetadata({
  title: "Terms & Carriage Conditions",
  description:
    "Standard terms and carriage conditions for Same Day Express Couriers UK. Read our delivery terms, liability, and booking conditions.",
  path: "/terms",
});

interface Section {
  heading: string;
  body?: string;
  items?: string[];
}

const SECTIONS: Section[] = [
  {
    heading: "1. Booking & Acceptance",
    body:
      "A booking is confirmed and a contract is formed only when we acknowledge and accept your request by providing a booking reference number. All bookings are subject to vehicle availability and route feasibility. We reserve the right to decline any booking at our sole discretion, including where the goods are prohibited under Section 5 of these Terms or where the route is unsafe or impracticable. Quotations provided verbally or in writing are valid for 24 hours unless otherwise stated. Prices may vary if the details of the booking change after the quotation is given, including but not limited to changes in collection or delivery address, weight, dimensions, or timing.",
  },
  {
    heading: "2. Collection & Delivery",
    body:
      "We aim to collect your goods within 60 minutes of booking confirmation for same-day services within our standard coverage areas, though this is an indicative target and not a guaranteed commitment unless expressly agreed in writing. The Customer is responsible for ensuring that someone is available at the collection point to hand over the goods at the agreed time, and that someone is available at the delivery point to receive them. If collection cannot be completed due to no one being available, a failed collection charge may apply. Delivery times are estimates based on route conditions, traffic, and weather and are not guaranteed unless a specific delivery deadline is agreed in writing with a corresponding surcharge. We will make reasonable attempts to notify the Customer of any significant delays. Proof of delivery, including a signature or photographic evidence where applicable, will be provided upon request.",
  },
  {
    heading: "3. Liability & Insurance",
    body:
      "All goods carried by Same Day Express Couriers are covered by our Goods in Transit (GIT) insurance policy up to a maximum value of £20,000 per consignment. This cover applies to goods that are lost or damaged whilst in our custody and control, subject to the exclusions set out below. Our liability for loss or damage to goods is limited to the lesser of: (a) the actual value of the goods lost or damaged; (b) the cost of repair or replacement; or (c) the £20,000 GIT insurance limit per consignment. For goods exceeding this value, the Customer must declare the value at the time of booking and arrange additional insurance, which we can facilitate upon request. If the Customer fails to declare the true value of goods, our liability shall be limited to the standard GIT cover of £20,000. We shall not be liable for any indirect, consequential, or economic losses arising from late delivery, non-delivery, or damage to goods, including but not limited to loss of profits, loss of business, loss of goodwill, or penalty charges imposed by third parties. We shall not be liable for any loss or damage caused by events beyond our reasonable control, including but not limited to acts of God, severe weather, road closures, industrial action, civil commotion, terrorism, or government restrictions.",
  },
  {
    heading: "4. Your Responsibilities",
    body:
      "The Customer is responsible for ensuring that all goods are properly packaged and labelled for transport. We are not liable for damage caused by inadequate packaging. The Customer must provide accurate collection and delivery addresses, postcodes, contact names, and telephone numbers. Any additional costs incurred due to incorrect information provided by the Customer will be charged to the Customer. The Customer warrants that they are the owner of the goods or are authorised by the owner to entrust the goods to the Company for carriage. The Customer shall indemnify the Company against any claims, losses, or damages arising from the Customer's breach of this warranty.",
  },
  {
    heading: "5. Prohibited Items",
    body:
      "The following items may not be carried under any circumstances. If any prohibited items are found in a consignment, we reserve the right to refuse carriage, abandon the delivery, or return the goods at the Customer's expense, and the Customer shall be liable for any resulting costs or penalties:",
    items: [
      "Illegal substances, controlled drugs, or prescription medications not properly packaged and documented in accordance with applicable regulations.",
      "Firearms, ammunition, weapons, explosives, fireworks, or pyrotechnic devices of any kind.",
      "Hazardous materials including flammable liquids, gases, corrosives, radioactive materials, or toxic substances classified under ADR (European Agreement concerning the International Carriage of Dangerous Goods by Road).",
      "Counterfeit goods, stolen property, or any items the carriage of which would constitute a criminal offence.",
      "Live animals, unless specifically agreed in writing and with appropriate welfare arrangements in place.",
      "Human remains, except where prior written agreement has been obtained and all regulatory requirements are met.",
      "Cash, negotiable instruments, precious metals, gemstones, or items of exceptional value exceeding the declared insurance limit without prior arrangement.",
      "Any goods that are illegal to possess, transport, or deliver under the laws of England and Wales.",
    ],
  },
  {
    heading: "6. Payment Terms",
    body:
      "Payment is due at the time of booking for ad hoc customers unless a trade account has been established. Trade account holders are subject to credit terms as agreed in their trade account agreement, typically 30 days from the date of invoice. Invoices are issued upon completion of delivery or at the end of the billing period for trade account customers. We accept payment by credit card, debit card, bank transfer, and BACS. Late payments may incur interest at the rate of 8% above the Bank of England base rate, calculated on a daily basis from the due date until the date of actual payment, in accordance with the Late Payment of Commercial Debts (Interest) Act 1998. We reserve the right to suspend services to any trade account holder whose payments are overdue.",
  },
  {
    heading: "7. Cancellation & Refunds",
    body:
      "Cancellations made more than 30 minutes before the scheduled collection time will not incur a charge. Cancellations made within 30 minutes of the scheduled collection time, or after the driver has been dispatched, will incur a minimum charge equivalent to 50% of the quoted fare. If the driver has already collected the goods, the full fare will apply, plus any costs incurred for returning the goods to the collection point or onward delivery as directed by the Customer. Refunds for overcharges or service failures will be processed within 14 working days of the agreed refund amount. Refunds will be made using the same payment method as the original transaction where possible.",
  },
  {
    heading: "8. Complaints",
    body:
      "We aim to provide an excellent service at all times. If you are dissatisfied with any aspect of our service, please contact us as soon as possible and in any event within 7 days of the delivery date. Complaints can be made by telephone on 020 4568 4675 or by email to bookings@samedayexpresscouriers.co.uk. We will acknowledge your complaint within 24 hours and provide a substantive response within 14 working days. If you are not satisfied with our response, you may refer the matter to an independent dispute resolution service as directed by us at that time.",
  },
  {
    heading: "9. Governing Law",
    body:
      "These Terms shall be governed by and construed in accordance with the laws of England and Wales. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales. The United Nations Convention on Contracts for the International Carriage of Goods by Road (CMR) does not apply to domestic carriage within the United Kingdom unless expressly agreed in writing. If any provision of these Terms is found to be invalid or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The failure of the Company to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision.",
  },
];

export default function TermsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-forest-dark py-14 text-ivory md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            onDark
            items={[homeCrumb(), { label: "Terms & Carriage Conditions" }]}
          />
          <h1 className="mt-6 text-3xl font-bold sm:text-4xl md:text-5xl">
            Terms &amp; Carriage Conditions
          </h1>
          <p className="mt-3 text-sm text-ivory/55">Last updated: 2026-06-27</p>
        </div>
      </section>

      {/* Body */}
      <SectionShell variant="ivory" spacing="lg" label="Terms & Carriage Conditions">
        <div className="mx-auto max-w-3xl">
          <p className="mb-8 leading-relaxed text-text-muted">
            These Terms and Carriage Conditions (&ldquo;Terms&rdquo;) apply to
            all courier and logistics services provided by Same Day Express
            Couriers Ltd (&ldquo;the Company&rdquo;, &ldquo;we&rdquo;,
            &ldquo;us&rdquo;, &ldquo;our&rdquo;) to the person or entity booking
            the service (&ldquo;the Customer&rdquo;, &ldquo;you&rdquo;,
            &ldquo;your&rdquo;). By booking a courier service with us, whether by
            telephone, email, website form, or WhatsApp, you agree to be bound by
            these Terms in their entirety. These Terms constitute the entire
            agreement between you and the Company and supersede any prior
            discussions, representations, or agreements relating to the services.
          </p>

          {SECTIONS.map((section) => (
            <div key={section.heading} className="mb-8">
              <h2 className="font-heading text-xl font-bold text-forest">
                {section.heading}
              </h2>
              {section.body && (
                <p className="mt-3 leading-relaxed text-text-muted">
                  {section.body}
                </p>
              )}
              {section.items && (
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  {section.items.map((item, i) => (
                    <li key={i} className="leading-relaxed text-text-muted">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Contact block */}
          <div className="mt-8 rounded-lg border border-border-subtle bg-ivory-deep p-6">
            <p className="font-heading text-lg font-bold text-forest">
              {SITE.legalName}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-text-muted">
              <li>
                Phone:{" "}
                <a href={`tel:${SITE.phoneHref}`} className="text-brass-dark hover:underline">
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                Email:{" "}
                <a href={`mailto:${SITE.email}`} className="text-brass-dark hover:underline">
                  {SITE.email}
                </a>
              </li>
              <li>Address: London, United Kingdom</li>
              <li>Website: samedayexpresscouriers.co.uk</li>
            </ul>
          </div>
        </div>
      </SectionShell>

      <CTASection
        title="Need a Courier? We're Ready to Dispatch."
        body="Urgent delivery? Call us now for a same-day quote or book online in seconds."
        quoteHref="/#quote"
      />
    </>
  );
}
