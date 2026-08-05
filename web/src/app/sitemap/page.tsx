import type { Metadata } from "next";

import { SectionShell } from "@/components/SectionShell";
import { Breadcrumbs, homeCrumb } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { pageMetadata } from "@/lib/seo";

/**
 * Sitemap page — links to all routes. Updated to point to the new Next.js
 * route structure (nested /services/* and /locations/* URLs).
 */

export const metadata: Metadata = pageMetadata({
  title: "Website Sitemap",
  description:
    "Browse all pages on the Same Day Express Couriers website. Find our service pages, location coverage, and legal information.",
  path: "/sitemap",
});

const GROUPS = [
  {
    heading: "Main Pages",
    items: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Trade Accounts", href: "/trade-accounts" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    heading: "Services",
    items: [
      { label: "Same Day Courier", href: "/services/same-day-courier" },
      { label: "AOG Aviation Courier", href: "/services/aog-aviation-courier" },
      { label: "Medical Courier", href: "/services/medical-courier" },
      { label: "Legal Courier", href: "/services/legal-courier" },
    ],
  },
  {
    heading: "Locations",
    items: [
      { label: "London", href: "/same-day-courier-london" },
      { label: "Manchester", href: "/same-day-courier-manchester" },
      { label: "Birmingham", href: "/same-day-courier-birmingham" },
      { label: "Bristol", href: "/same-day-courier-bristol" },
      { label: "Leeds", href: "/same-day-courier-leeds" },
      { label: "Glasgow", href: "/same-day-courier-glasgow" },
      { label: "Edinburgh", href: "/same-day-courier-edinburgh" },
      { label: "Liverpool", href: "/same-day-courier-liverpool" },
    ],
  },
  {
    heading: "Legal",
    items: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Carriage Conditions", href: "/terms" },
      { label: "Sitemap", href: "/sitemap" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <>
      <section className="bg-forest-dark py-14 text-ivory md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs onDark items={[homeCrumb(), { label: "Sitemap" }]} />
          <h1 className="mt-6 text-3xl font-bold sm:text-4xl md:text-5xl">
            Website Sitemap
          </h1>
          <p className="mt-4 max-w-xl text-ivory/75">
            Browse all pages on the Same Day Express Couriers website.
          </p>
        </div>
      </section>

      <SectionShell variant="ivory" spacing="lg" label="Sitemap">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-10 sm:grid-cols-2">
            {GROUPS.map((group) => (
              <div key={group.heading}>
                <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-widest text-brass-dark">
                  {group.heading}
                </h2>
                <ul className="space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="text-sm text-forest transition-colors hover:text-brass-dark"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <CTASection />
    </>
  );
}
