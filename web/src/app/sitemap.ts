import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";
import { SERVICES, servicePath } from "@/lib/services";
import { CITIES } from "@/lib/cities";
import { POSTS } from "@/lib/posts";

/**
 * Sitemap — served at /sitemap.xml by Next.js.
 *
 * Lists every indexable route: static pages, the 4 service pages, the 8 city
 * landing pages (flat URLs at the root), and the blog posts.
 *
 * Requires the Next.js server runtime (P0-1 removed `output: "export"` so
 * this route handler can run).
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.domain;
  const now = new Date();

  const staticRoutes = [
    "/",
    "/about",
    "/fleet",
    "/services",
    "/locations",
    "/contact",
    "/faq",
    "/trade-accounts",
    "/site-map",
    "/privacy-policy",
    "/terms",
    "/cookie-policy",
    "/blog",
  ];

  const serviceRoutes = SERVICES.map((s) => servicePath(s.slug));
  // Flat city URLs at the root: /same-day-courier-london, etc.
  const cityRoutes = CITIES.map((c) => `/${c.slug}`);
  const blogRoutes = POSTS.map((p) => `/blog/${p.slug}`);

  const all = [...staticRoutes, ...serviceRoutes, ...cityRoutes, ...blogRoutes];

  return all.map((url) => ({
    url: `${base}${url}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: priorityFor(url),
  }));
}

/** Assign crawl priority by route type. */
function priorityFor(url: string): number {
  if (url === "/") return 1;
  // Flat city landing pages are the highest-value commercial targets.
  if (url.startsWith("/same-day-courier-")) return 0.9;
  // Service pages (root or /services/*) and the quote/commercial pages.
  if (
    url === "/same-day-courier" ||
    url === "/aog-aviation-courier" ||
    url.startsWith("/services/")
  ) {
    return 0.9;
  }
  return 0.7;
}
