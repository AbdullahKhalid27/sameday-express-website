/**
 * generate-static-sitemap.cjs
 *
 * Pre-build script: generates public/sitemap.xml for the static export build.
 *
 * The src/app/sitemap.ts route handler can't run under `output: "export"`, so
 * this script generates the same sitemap.xml into /public ahead of the build.
 * Route slugs are inlined here (mirroring src/lib/{services,cities,posts}.ts)
 * to avoid importing TypeScript from plain Node — if a new route is added,
 * update the slug array below.
 *
 * Usage: node scripts/generate-static-sitemap.cjs
 */

const fs = require("fs");
const path = require("path");

const SITE_DOMAIN = "https://samedayexpresscouriers.co.uk";

// --- Route data (mirrors src/lib/* data modules) ---

const ROOT_SERVICES = new Set(["same-day-courier", "aog-aviation-courier"]);

const SERVICE_SLUGS = [
  "same-day-courier",
  "aog-aviation-courier",
  "medical-courier",
  "legal-courier",
];

const CITY_SLUGS = [
  "same-day-courier-london",
  "same-day-courier-manchester",
  "same-day-courier-birmingham",
  "same-day-courier-bristol",
  "same-day-courier-leeds",
  "same-day-courier-glasgow",
  "same-day-courier-edinburgh",
  "same-day-courier-liverpool",
];

const POST_SLUGS = [
  "how-much-does-same-day-courier-cost-uk",
  "what-is-aog-courier",
  "dbs-checked-courier-drivers-uk",
];

const STATIC_ROUTES = [
  "/",
  "/about",
  "/fleet",
  "/contact",
  "/faq",
  "/trade-accounts",
  "/sitemap",
  "/privacy-policy",
  "/terms",
  "/cookie-policy",
  "/blog",
];

// --- Helpers (mirror src/lib/services.ts servicePath logic) ---

function servicePath(slug) {
  return ROOT_SERVICES.has(slug) ? `/${slug}` : `/services/${slug}`;
}

function priorityFor(url) {
  if (url === "/") return "1.0";
  if (url.startsWith("/same-day-courier-")) return "0.9";
  if (
    url === "/same-day-courier" ||
    url === "/aog-aviation-courier" ||
    url.startsWith("/services/")
  ) {
    return "0.9";
  }
  return "0.7";
}

// --- Build URL list ---

const allRoutes = [
  ...STATIC_ROUTES,
  ...SERVICE_SLUGS.map(servicePath),
  ...CITY_SLUGS.map((slug) => `/${slug}`),
  ...POST_SLUGS.map((slug) => `/blog/${slug}`),
];

const now = new Date().toISOString().split("T")[0];

const urls = allRoutes
  .map(
    (url) =>
      `  <url>\n` +
      `    <loc>${SITE_DOMAIN}${url}</loc>\n` +
      `    <lastmod>${now}</lastmod>\n` +
      `    <changefreq>weekly</changefreq>\n` +
      `    <priority>${priorityFor(url)}</priority>\n` +
      `  </url>`
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

// --- Write ---

const outDir = path.resolve(__dirname, "..", "public");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "sitemap.xml"), xml);
console.log(`✅ Generated ${allRoutes.length} sitemap entries → public/sitemap.xml`);
