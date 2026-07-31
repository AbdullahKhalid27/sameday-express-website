import { ServicePage, servicePageMetadata } from "@/components/ServicePage";
import { getService } from "@/lib/services";
import type { Metadata } from "next";

/**
 * /aog-aviation-courier — flat route (matches ARCHITECTURE.md + static reference).
 * Thin wrapper over the shared <ServicePage> template; all copy lives in
 * lib/services.ts. Pre-rendered at build time (SSG).
 */

const SLUG = "aog-aviation-courier";

export function generateMetadata(): Metadata {
  const service = getService(SLUG);
  if (!service) return {};
  return servicePageMetadata(service);
}

export default function Page() {
  const service = getService(SLUG)!;
  return <ServicePage service={service} />;
}
