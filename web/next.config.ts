import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Default Next.js server runtime. Required for API routes, Server Actions,
  // middleware, ISR, <Image> optimization, sitemap.ts, robots.ts and dynamic
  // OG images. Do NOT re-enable `output: "export"` by default — it breaks all
  // of the above and gates the entire backend phase.
  // When deploying inside a minimal Docker container, use Next's built-in
  // `output: "standalone"` instead (enable here only when setting up Phase 6).
  //
  // GitHub Actions sets NEXT_OUTPUT_EXPORT=true to produce a static build
  // for GitHub Pages. Vercel builds never set this, so server features stay on.
  ...(process.env.NEXT_OUTPUT_EXPORT === "true" && {
    output: "export",
    images: { unoptimized: true },
  }),

  // ── Security headers ──────────────────────────────────────────────────
  // Standard production hardening. Applies to all routes (pages + API).
  async headers() {
    // Non-production deployments (Vercel previews, the GitHub Pages static
    // export) must never appear in search results alongside the production
    // domain. Canonical tags are the first layer; this header is the second.
    // Indexable: Vercel production builds and self-hosted `next build && next
    // start` (no VERCEL_ENV set). Evaluated at build time, matching where the
    // deployment runs.
    const isNonProductionDeployment =
      (process.env.VERCEL_ENV !== undefined &&
        process.env.VERCEL_ENV !== "production") ||
      process.env.NEXT_OUTPUT_EXPORT === "true";

    const securityHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ];

    return [
      {
        source: "/:path*",
        headers: isNonProductionDeployment
          ? [
              ...securityHeaders,
              { key: "X-Robots-Tag", value: "noindex, nofollow" },
            ]
          : securityHeaders,
      },
    ];
  },
};

export default nextConfig;
