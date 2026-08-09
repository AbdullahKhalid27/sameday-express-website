/**
 * generate-static-robots.cjs
 *
 * Pre-build script: generates public/robots.txt from the same data used by
 * src/app/robots.ts. Runs in CI before the static export build (which can't
 * use server-side route handlers).
 *
 * Usage: node scripts/generate-static-robots.cjs
 */

const fs = require("fs");
const path = require("path");

// ── Mirror of src/lib/site.ts ────────────────────────────────────────────
const SITE_DOMAIN = "https://samedayexpresscouriers.co.uk";

// ── Same logic as src/app/robots.ts ─────────────────────────────────────
const txt =
  `User-agent: *\n` +
  `Allow: /\n` +
  `Disallow: /api/\n` +
  `Disallow: /thank-you\n` +
  `Disallow: /thank-you/\n` +
  `\n` +
  `User-agent: GPTBot\n` +
  `Allow: /\n` +
  `\n` +
  `User-agent: OAI-SearchBot\n` +
  `Allow: /\n` +
  `\n` +
  `User-agent: ClaudeBot\n` +
  `Allow: /\n` +
  `\n` +
  `User-agent: PerplexityBot\n` +
  `Allow: /\n` +
  `\n` +
  `User-agent: Bytespider\n` +
  `Allow: /\n` +
  `\n` +
  `Sitemap: ${SITE_DOMAIN}/sitemap.xml\n` +
  `Host: ${SITE_DOMAIN}\n`;

const outDir = path.resolve(__dirname, "..", "public");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "robots.txt"), txt);
console.log("✅ Generated robots.txt → public/robots.txt");
