import { notFound } from "next/navigation";

import { ServicePage, servicePageMetadata } from "@/components/ServicePage";
import { SERVICES, getService } from "@/lib/services";
import { faqJsonLd } from "@/lib/seo";
import type { Metadata } from "next";

/**
 * Service landing pages — /services/{slug}.
 * One dynamic route renders all 4 service pages from lib/services.ts data.
 * Pre-rendered at build time via generateStaticParams (SSG).
 */

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
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
