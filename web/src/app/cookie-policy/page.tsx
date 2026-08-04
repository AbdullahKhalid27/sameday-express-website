import type { Metadata } from "next";

import { SectionShell } from "@/components/SectionShell";
import { Breadcrumbs, homeCrumb } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

/**
 * Cookie Policy — standalone page (not just the banner).
 * Details all cookie categories, marks analytics as "not yet active".
 * Last updated: 2026-08-01.
 */

export const metadata: Metadata = pageMetadata({
  title: "Cookie Policy",
  description:
    "Cookie policy for Same Day Express Couriers. Learn about the cookies we use, why we use them, and how to manage or withdraw your consent.",
  path: "/cookie-policy",
});

interface Section {
  heading: string;
  body?: string;
  items?: { label?: string; text: string }[];
}

const SECTIONS: Section[] = [
  {
    heading: "1. What Are Cookies?",
    body:
      "Cookies are small text files placed on your device by the websites you visit. They are widely used to make websites work more efficiently and to provide information to site owners. Cookies allow a website to remember your actions and preferences over a period of time, so you don't have to re-enter them every time you visit the site or browse from one page to another. This policy explains the specific cookies we use, why we use them, and the choices you have.",
  },
  {
    heading: "2. Strictly Necessary Cookies",
    body:
      "These cookies are essential for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as filling in the quote wizard or logging in to a trade account. You can set your browser to block or alert you about these cookies, but some parts of the site will not then work.",
    items: [
      { label: "Session cookies:", text: "Temporary cookies that expire when you close your browser. They maintain your state within the quote wizard so your progress is not lost as you move between steps." },
      { label: "CSRF token:", text: "A security cookie that protects against Cross-Site Request Forgery attacks on form submissions, ensuring that data is sent only from our website." },
      { label: "Cookie consent preference:", text: "Remembers your choice regarding the cookie consent banner so you are not prompted again on every visit." },
    ],
  },
  {
    heading: "3. Analytics Cookies — Not Yet Active",
    body:
      "We plan to introduce analytics cookies after launch to help us understand how visitors interact with our website, which pages are most useful, and where we can improve. These are NOT YET ACTIVE — no analytics cookies are currently set on this site. When analytics are enabled (planned for our Phase 8 backend work), this section will be updated with the specific cookies set. At that point we expect to use:",
    items: [
      { label: "Google Analytics 4 (GA4):", text: "Aggregated, anonymised data on page views, session duration, and traffic sources. GA4 uses cookie IDs to distinguish unique users. No personally identifiable data is collected. [Not yet active]" },
      { label: "Microsoft Clarity:", text: "Heatmapping and session-recording analytics to help us understand how users navigate and where they encounter friction. All recordings are anonymised and mask personally identifiable input. [Not yet active]" },
    ],
  },
  {
    heading: "4. Functional Cookies",
    body:
      "These cookies enable enhanced functionality and personalisation, such as remembering your preferences and form entries. If you do not allow these cookies, some of these features may not work correctly. We may use functional cookies in the future to remember details such as your preferred vehicle type or previously entered routes within the quote wizard.",
  },
  {
    heading: "5. How to Manage Cookies in Your Browser",
    body:
      "You can control and delete cookies through your browser settings. The links below take you to the official guidance for each major browser. Note that disabling strictly necessary cookies will impact the functionality of this website.",
    items: [
      { label: "Google Chrome:", text: "Settings → Privacy and security → Cookies and other site data." },
      { label: "Safari (macOS/iOS):", text: "Preferences → Privacy → Manage cookies and website data." },
      { label: "Mozilla Firefox:", text: "Settings → Privacy & Security → Cookies and Site Data." },
      { label: "Microsoft Edge:", text: "Settings → Cookies and site permissions → Manage and delete cookies." },
    ],
  },
  {
    heading: "6. How to Withdraw Consent",
    body:
      "Once analytics cookies are activated, you will be able to withdraw or update your consent at any time by clicking the cookie preferences link in our website footer or by clearing the consent cookie in your browser. Withdrawing consent will not affect the lawfulness of any processing carried out before the withdrawal. Strictly necessary cookies cannot be withdrawn as they are required for the website to operate. Until analytics go live, the cookie consent banner on this site serves as a notice only — no tracking cookies are set regardless of your choice.",
  },
  {
    heading: "7. Third-Party Services",
    body:
      "Some services we use (such as the Google Maps Distance Matrix API for quote calculations) may set their own cookies or collect data independently under their own privacy policies. We recommend reviewing the privacy policies of these third parties directly. We do not control the cookie practices of third-party domains.",
  },
  {
    heading: "8. Changes to This Cookie Policy",
    body:
      "We may update this Cookie Policy from time to time to reflect changes in technology, legal requirements, or our use of cookies — particularly when analytics cookies are activated. Any changes will be posted on this page with an updated \"Last updated\" date. We encourage you to review this policy periodically.",
  },
  {
    heading: "9. Contact Us",
    body:
      "If you have any questions about our use of cookies or this Cookie Policy, please contact us using the details below.",
  },
];

export default function CookiePolicyPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Cookie Policy",
          description: metadata.description as string,
          url: `${SITE.domain}/cookie-policy`,
        }}
      />

      {/* Hero */}
      <section className="bg-forest-dark py-14 text-ivory md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs onDark items={[homeCrumb(), { label: "Cookie Policy" }]} />
          <h1 className="mt-6 text-3xl font-bold sm:text-4xl md:text-5xl">
            Cookie Policy
          </h1>
          <p className="mt-3 text-sm text-ivory/55">Last updated: 2026-08-01</p>
        </div>
      </section>

      {/* Body */}
      <SectionShell variant="ivory" spacing="lg" label="Cookie Policy">
        <div className="mx-auto max-w-3xl">
          <p className="mb-8 leading-relaxed text-text-muted">
            Same Day Express Couriers Ltd (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
            &ldquo;our&rdquo;) is committed to being transparent about how we use
            cookies and similar technologies on our website at
            samedayexpresscouriers.co.uk. This Cookie Policy should be read
            alongside our <a href="/privacy-policy" className="text-brass-dark hover:underline">Privacy Policy</a>,
            which explains how we handle your personal data more broadly.
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
