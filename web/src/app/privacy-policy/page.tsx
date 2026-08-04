import type { Metadata } from "next";

import { SectionShell } from "@/components/SectionShell";
import { Breadcrumbs, homeCrumb } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

/**
 * Privacy Policy — verbatim legal copy from the static privacy-policy.html.
 * 11 numbered sections. Last updated: 2026-06-27.
 */

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "Privacy policy for Same Day Express Couriers. We protect your personal data in line with UK GDPR and Data Protection Act 2018.",
  path: "/privacy-policy",
});

interface Section {
  heading: string;
  body?: string;
  items?: { label?: string; text: string }[];
}

const SECTIONS: Section[] = [
  {
    heading: "1. Who We Are",
    body:
      "Same Day Express Couriers Ltd is a company registered in England and Wales. We operate as a same-day courier and urgent logistics provider, serving businesses and individuals across the United Kingdom. Our registered office is in London, United Kingdom. We are the data controller for the personal information we process in connection with our services and our website, and we are responsible for ensuring that your data is handled lawfully, fairly, and transparently.",
  },
  {
    heading: "2. What Data We Collect",
    body:
      "We collect and process the following categories of personal data depending on how you interact with us:",
    items: [
      { label: "Identity Data:", text: "Your first name, last name, and company name when you provide them via our quote form, trade account application, or when contacting us by phone or email." },
      { label: "Contact Data:", text: "Your email address, telephone number, and billing address so that we can respond to enquiries, provide quotes, confirm bookings, and deliver courier services." },
      { label: "WhatsApp Data:", text: "Your WhatsApp number if you choose to provide it for ease of dispatch communication, separate from your required contact phone number. This field is entirely optional." },
      { label: "Collection and Delivery Data:", text: "Collection addresses, delivery addresses, postcodes, and contact details for senders and recipients. This is essential for fulfilling courier bookings and providing accurate route planning." },
      { label: "Financial Data:", text: "Payment card details or bank account information when you pay for our services. We do not store full card details on our servers; payments are processed through secure third-party payment providers who are PCI DSS compliant." },
      { label: "Technical Data:", text: "Your IP address, browser type and version, time zone setting, browser plug-in types, operating system and platform, and other technology on the devices you use to access our website. We collect this data automatically using cookies and similar technologies for security, fraud prevention, and site integrity." },
      { label: "Usage Data:", text: "Information about how you use our website, including pages visited, time spent on pages, click patterns, and navigation paths. This helps us understand how visitors interact with our content and improve the user experience." },
      { label: "Marketing Data:", text: "Your preferences in receiving marketing communications from us and your communication preferences more generally, collected when you subscribe to our newsletter or opt into marketing." },
    ],
  },
  {
    heading: "3. How We Use Your Personal Data",
    body:
      "We process your personal data only where we have a lawful basis to do so. The lawful bases we rely on include: the necessity to perform a contract with you (for example, to fulfil a courier booking), compliance with a legal obligation, legitimate interests pursued by us or a third party (such as improving our services and preventing fraud), and your explicit consent where required (such as for marketing communications). Specifically, we use your data to:",
    items: [
      { text: "Process and fulfil your same-day courier bookings, including arranging collection and delivery of goods." },
      { text: "Provide accurate quotes based on the collection and delivery details you supply." },
      { text: "Communicate with you about your bookings, including real-time dispatch updates and delivery confirmations." },
      { text: "Process payments and manage your trade account if applicable." },
      { text: "Respond to your enquiries, complaints, and support requests promptly and effectively." },
      { text: "Comply with legal and regulatory obligations, including tax and transport regulations." },
      { text: "Maintain the security and integrity of our website and services." },
      { text: "Send you marketing communications where you have consented, including our Dispatch Insights newsletter." },
      { text: "Analyse website usage to improve our services, website functionality, and customer experience." },
    ],
  },
  {
    heading: "4. Who We Share Your Data With",
    body:
      "We do not sell, rent, or trade your personal data to third parties for their marketing purposes. We may share your data with carefully selected third parties only in the following circumstances, and always under appropriate data protection agreements:",
    items: [
      { label: "Courier and Logistics Partners:", text: "We share collection and delivery details with our network of DBS-vetted drivers and subcontracted courier partners solely for the purpose of fulfilling your booking. These partners are contractually obligated to handle your data in compliance with UK GDPR." },
      { label: "Stripe (Payment Processing):", text: "When you choose to pay by card, your payment is processed securely by Stripe, a PCI DSS-compliant payment provider. Stripe receives your card details and transaction data to process the charge. We never store full card details on our own systems." },
      { label: "Resend (Transactional Email):", text: "We use Resend to deliver transactional emails such as booking confirmations, proof-of-delivery notifications, and quote responses. Your email address is shared with Resend solely to send these communications." },
      { label: "Google Maps Platform (Route Calculation):", text: "When you request a quote, we use the Google Maps Distance Matrix API to calculate the road distance between your collection and delivery postcodes. Your postcode data is sent to Google to generate an accurate distance and price estimate." },
      { label: "IT Service Providers:", text: "We use trusted providers for website hosting and analytics. These providers act as data processors under strict contractual terms." },
      { label: "Legal and Regulatory Bodies:", text: "We may disclose data if required by law, court order, or regulatory authority, including HMRC, the Information Commissioner's Office (ICO), or law enforcement agencies." },
      { label: "Business Transfers:", text: "In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction, subject to continued protection under this policy." },
    ],
  },
  {
    heading: "5. International Data Transfers",
    body:
      "As a UK-based courier company serving UK customers, the vast majority of our data processing takes place within the United Kingdom and the European Economic Area. Where we use third-party services based outside the UK, we ensure that appropriate safeguards are in place, such as UK International Data Transfer Agreements or reliance on adequacy decisions, to protect your data in accordance with UK GDPR requirements.",
  },
  {
    heading: "6. Data Retention",
    body:
      "We retain your personal data only for as long as necessary to fulfil the purposes for which it was collected, including to satisfy any legal, accounting, or reporting requirements. Booking and delivery records are retained for a minimum of six years for tax and regulatory compliance purposes. Marketing consent records are retained until you withdraw your consent. You may request deletion of your data at any time, subject to our legal obligations to retain certain records.",
  },
  {
    heading: "7. Your Rights Under UK GDPR",
    body:
      "As a data subject under UK GDPR and the Data Protection Act 2018, you have the following rights regarding your personal data:",
    items: [
      { label: "Right of Access:", text: "You may request a copy of the personal data we hold about you. We will provide this within one month of your request, free of charge." },
      { label: "Right to Rectification:", text: "You may request that we correct any inaccurate or incomplete personal data we hold about you." },
      { label: "Right to Erasure:", text: "You may request the deletion of your personal data where there is no compelling reason for us to continue processing it, subject to legal retention requirements." },
      { label: "Right to Restrict Processing:", text: "You may request that we restrict the processing of your personal data in certain circumstances, such as when you contest the accuracy of the data." },
      { label: "Right to Data Portability:", text: "You may request to receive your personal data in a structured, commonly used, machine-readable format, or request that we transfer it to another data controller." },
      { label: "Right to Object:", text: "You may object to our processing of your personal data based on legitimate interests or for direct marketing purposes." },
      { label: "Right to Withdraw Consent:", text: "Where processing is based on your consent, you may withdraw that consent at any time without affecting the lawfulness of processing carried out prior to withdrawal." },
      { label: "Right to Lodge a Complaint:", text: "You have the right to lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk if you believe our processing of your data infringes your rights." },
    ],
  },
  {
    heading: "8. Cookies",
    body:
      "Our website uses cookies and similar tracking technologies to distinguish you from other users and to provide a better browsing experience. Cookies help us understand how visitors use our site, enable certain functionality, and allow us to improve our services. The cookies we use fall into the following categories:",
    items: [
      { label: "Strictly Necessary Cookies:", text: "These are required for the operation of our website, including session management and security features. They cannot be switched off." },
      { label: "Analytics Cookies:", text: "These allow us to count visits and traffic sources so we can measure and improve the performance of our site. All information collected by these cookies is aggregated and anonymised." },
      { label: "Functional Cookies:", text: "These enable enhanced functionality and personalisation, such as remembering your preferences and form entries." },
    ],
  },
  {
    heading: "9. Data Security",
    body:
      "We take the security of your personal data seriously and have implemented appropriate technical and organisational measures to protect it against unauthorised access, alteration, disclosure, or destruction. These measures include SSL encryption for data in transit, secure server infrastructure, access controls limiting data access to authorised personnel, regular security assessments, and staff training on data protection obligations. While we strive to protect your data, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.",
  },
  {
    heading: "10. Changes to This Privacy Policy",
    body:
      "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. Any changes will be posted on this page with an updated \"Last updated\" date. We encourage you to review this policy periodically. Your continued use of our website after any changes constitutes your acceptance of the revised policy.",
  },
  {
    heading: "11. Contact Us About Your Data",
    body:
      "If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your personal data, please contact us using the details below. We will respond to any data subject requests within one month as required by UK GDPR.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Privacy Policy",
          description: metadata.description as string,
          url: `${SITE.domain}/privacy-policy`,
        }}
      />

      {/* Hero */}
      <section className="bg-forest-dark py-14 text-ivory md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs onDark items={[homeCrumb(), { label: "Privacy Policy" }]} />
          <h1 className="mt-6 text-3xl font-bold sm:text-4xl md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-ivory/55">Last updated: 2026-06-27</p>
        </div>
      </section>

      {/* Body */}
      <SectionShell variant="ivory" spacing="lg" label="Privacy Policy">
        <div className="mx-auto max-w-3xl">
          <p className="mb-8 leading-relaxed text-text-muted">
            Same Day Express Couriers Ltd (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
            &ldquo;our&rdquo;) is committed to protecting and respecting your
            privacy in accordance with the UK General Data Protection Regulation
            (UK GDPR) and the Data Protection Act 2018. This Privacy Policy
            explains how we collect, use, store, and share your personal data
            when you use our website at samedayexpresscouriers.co.uk, request a
            quote, book a courier service, or otherwise interact with our
            business. We encourage you to read this policy carefully and to check
            this page periodically for changes.
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
                <ul className="mt-3 space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="leading-relaxed text-text-muted">
                      {item.label && (
                        <strong className="font-semibold text-forest">
                          {item.label}{" "}
                        </strong>
                      )}
                      {item.text}
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
              <li>ICO Registration Number: [Company details pending]</li>
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
