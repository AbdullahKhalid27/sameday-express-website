import { CityPage, cityPageMetadata } from "@/components/CityPage";
import { getCity } from "@/lib/cities";
import type { Metadata } from "next";

/**
 * /same-day-courier-bristol — flat city landing route at the root.
 *
 * One of 8 explicit city route folders (FRONTEND-FIXES P0-2). Each is a thin
 * wrapper over the shared <CityPage> template; all copy lives in
 * lib/cities.ts. Pre-rendered at build time (SSG). Flat URLs match the
 * footer links and the static reference site, preserving SEO equity.
 */

const SLUG = "same-day-courier-bristol";

export function generateMetadata(): Metadata {
  const city = getCity(SLUG);
  if (!city) return {};
  return cityPageMetadata(city);
}

export default function Page() {
  const city = getCity(SLUG)!;
  return <CityPage city={city} />;
}
