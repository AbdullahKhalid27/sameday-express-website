import type { Metadata } from "next";
import { SITE } from "./site";

/**
 * Per-page metadata + structured-data (JSON-LD) generators.
 *
 * Faithful port of the static site's <head> schema objects. The static site
 * duplicated these ~20 times; here they are built once and composed per route.
 *
 * BreadcrumbList is NOT here — the <Breadcrumbs> component already emits it
 * inline, co-located with the visible trail.
 */

/* ───────────────────────────  Metadata  ─────────────────────────── */

interface PageMetaInput {
  /** Page title (the "| Same Day Express Couriers" suffix is added by the template). */
  title: string;
  /** Meta description (also reused for og:description). */
  description: string;
  /** Path beginning with "/", e.g. "/services/medical-courier". Used for canonical + og:url. */
  path: string;
  /** og:type. Defaults to "website". */
  type?: string;
  /** Optional OG image override (absolute URL). Defaults to the shared og-image. */
  ogImage?: string;
}

const DEFAULT_OG_IMAGE = `${SITE.domain}/og-image.jpg`;

export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  ogImage = DEFAULT_OG_IMAGE,
}: PageMetaInput): Metadata {
  const url = `${SITE.domain}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      type: type as "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: SITE.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/* ───────────────────────────  JSON-LD  ─────────────────────────── */

/** A {name, href} pair for breadcrumb / FAQ builders. */
export type Crumb = { name: string; href: string };

/**
 * Organization + LocalBusiness. Ported from the homepage JSON-LD block.
 * Used on the homepage and any route needing NAP business details.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${SITE.domain}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    // P4-1: real registration numbers — taxID (VAT) + Companies House identifier.
    taxID: SITE.vatNo,
    identifier: {
      "@type": "PropertyValue",
      name: "Companies House Company Number",
      value: SITE.companyRegNo,
    },
    url: SITE.domain,
    logo: DEFAULT_OG_IMAGE,
    image: DEFAULT_OG_IMAGE,
    telephone: SITE.phoneHref,
    email: SITE.email,
    description:
      "UK same-day dedicated courier service. Nationwide 60-minute collection. DBS vetted drivers, £20,000 goods-in-transit insurance, signed proof of delivery.",
    foundingDate: "2020",
    areaServed: "United Kingdom",
    priceRange: "££",
    geo: {
      "@type": "GeoCoordinates",
      latitude: 51.5074,
      longitude: -0.1278,
    },
    address: { "@type": "PostalAddress", addressCountry: "GB" },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE.phoneHref,
      contactType: "sales",
      areaServed: "GB",
      availableLanguage: ["English"],
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
    sameAs: ["https://twitter.com/sdecouriers"],
  };
}

/** WebSite + SearchAction. Homepage-only. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.domain,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.domain}/?s={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * LocalBusiness scoped to a city (for city pages). Includes PostalAddress
 * with addressRegion so Google can tie the listing to the location.
 */
export function localBusinessJsonLd(city: string, region: string) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${SITE.name}`,
    description: `Same-day courier service in ${city}. 60-minute collection, direct dedicated delivery.`,
    telephone: SITE.phoneHref,
    email: SITE.email,
    url: SITE.domain,
    areaServed: { "@type": "City", name: city },
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      addressRegion: region,
      addressCountry: "GB",
    },
  };
}

/**
 * Service schema. `areaServed` lists the cities the service covers —
 * all 8 hub cities (P2-7), passed in by the caller from CITIES.
 */
export function serviceJsonLd(input: {
  name: string;
  description: string;
  path: string;
  cities: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: `${SITE.domain}${input.path}`,
    provider: { "@type": "Organization", name: SITE.name },
    areaServed: input.cities.map((c) => ({ "@type": "City", name: c })),
    // P2-2: Offer with indicative price range. Matches fleet.ts base prices
    // (motorcycle £35 → Luton £80, excluding mileage and VAT).
    offers: {
      "@type": "Offer",
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      url: `${SITE.domain}${input.path}`,
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "GBP",
        minPrice: 35,
        maxPrice: 80,
      },
    },
  };
}

/**
 * Speakable specification for voice/AEO (P2-4). Targets the `.answer-block`
 * paragraph rendered in the hero of Service and City pages — the concise
 * "what is this / where" answer voice assistants should read aloud.
 */
export function speakableJsonLd(path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: `${SITE.domain}${path}`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".answer-block"],
    },
  };
}

/**
 * FAQPage schema from a list of Q&A pairs. Used on the homepage teaser,
 * the FAQ page, service pages, and city pages — wherever FAQ items appear.
 */
export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
