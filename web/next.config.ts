import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained build (.next/standalone) so the app can run
  // inside a minimal Docker container in Phase 6 without bundling node_modules.
  output: "export",
};

export default nextConfig;
