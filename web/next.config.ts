import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Default Next.js server runtime. Required for API routes, Server Actions,
  // middleware, ISR, <Image> optimization, sitemap.ts, robots.ts and dynamic
  // OG images. Do NOT re-enable `output: "export"` — it breaks all of the
  // above and gates the entire backend phase.
  // When deploying inside a minimal Docker container, use Next's built-in
  // `output: "standalone"` instead (enable here only when setting up Phase 6).
};

export default nextConfig;
