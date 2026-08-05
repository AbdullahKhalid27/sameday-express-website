import { notFound } from "next/navigation";

import { ServicePage, servicePageMetadata } from "@/components/ServicePage";
import { getService } from "@/lib/services";
import { faqJsonLd } from "@/lib/seo";
import type { Metadata } from "next";

/**
 * Service landing pages — /services/{slug}.
 *
 * Handles the services that live under /services/ (medical-courier,
 * legal-courier). The two flagship services (same-day-courier and
 * aog-aviation-courier) have dedicated flat routes at the root, so they are
 * explicitly excluded here to avoid duplicate-content URLs.
 *
 * Pre-rendered at build time via generateStaticParams (SSG).
 */

// Slugs served by this nested route. The two root-route services are omitted.
const NESTED_SERVICE_SLUGS = ["medical-courier", "legal-courier"];

export function generateStaticParams() {
  return NESTED_SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return servicePageMetadata(service);
}

export default async function ServiceRoutePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  return <ServicePage service={service} />;
}
