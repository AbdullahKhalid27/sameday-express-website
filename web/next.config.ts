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
};

export default nextConfig;
