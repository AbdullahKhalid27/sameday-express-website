import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";

/**
 * robots.txt — served at /robots.txt by Next.js.
 *
 * Strategy:
 *  - Default: allow everything except private/transactional paths (/api/,
 *    any thank-you/confirmation routes we add later).
 *  - Explicitly allow the major AI answer-engine crawlers. Brand mentions
 *    across AI surfaces are a meaningful visibility channel, so we opt IN
 *    rather than rely on the catch-all `*` rule.
 *
 * Requires the Next.js server runtime (P0-1 removed `output: "export"`).
 */

const PRIVATE_PATHS = ["/api/", "/thank-you", "/thank-you/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      // Explicit AI-bot allow (these are sometimes blocked by default).
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },
    ],
    sitemap: `${SITE.domain}/sitemap.xml`,
    host: SITE.domain,
  };
}
