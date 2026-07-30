import { notFound } from "next/navigation";

import { CityPage, cityPageMetadata } from "@/components/CityPage";
import { CITIES, getCity } from "@/lib/cities";

/**
 * City landing pages — /locations/same-day-courier-{city}.
 *
 * One dynamic route renders all 6 city pages from lib/cities.ts data.
 * generateStaticParams pre-renders each at build time (SSG), so they serve
 * as static HTML with no runtime cost.
 */

export function generateStaticParams() {
  return CITIES.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  // params is async in Next 15.
  return params.then((p) => {
    const city = getCity(p.slug);
    if (!city) return {};
    return cityPageMetadata(city);
  });
}

export default async function CityRoutePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = getCity(slug);
  if (!city) notFound();
  return <CityPage city={city} />;
}
