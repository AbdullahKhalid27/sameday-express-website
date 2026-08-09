/**
 * generate-static-manifest.cjs
 *
 * Pre-build script: generates public/manifest.webmanifest for the static
 * export build. The src/app/manifest.ts route handler can't run under
 * `output: "export"`, so this mirrors its output as a static file.
 *
 * Usage: node scripts/generate-static-manifest.cjs
 */

const fs = require("fs");
const path = require("path");

const manifest = {
  name: "Same Day Express Couriers",
  short_name: "SDE Couriers",
  description: "UK same-day dedicated courier. Collection in 60 minutes, 24/7.",
  start_url: "/",
  display: "standalone",
  background_color: "#faf9f6",
  theme_color: "#1c2821",
  icons: [],
};

const outDir = path.resolve(__dirname, "..", "public");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "manifest.webmanifest"),
  JSON.stringify(manifest, null, 2) + "\n"
);
console.log("✅ Generated manifest.webmanifest → public/manifest.webmanifest");
