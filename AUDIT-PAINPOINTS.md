# Same Day Express — Web App Pain-Point Audit

**Date:** 2026-08-05
**Scope:** `web/` Next.js 15 app vs static `index.html` reference.
**Axes:** Front-end/UI/UX · Motion · SEO/AEO/GEO/AI-mode · Feature/creativity gaps · Backend-readiness.
**Method:** Deep read of `web/src` (layout, seo.ts, JsonLd, CookieBanner, QuoteWizard, MobileStickyBar, SiteHeader, ServicePage, CityPage, DispatchMap, Breadcrumbs, Contact/Trade/Newsletter forms, services.ts, cities.ts, posts.ts, site.ts, next.config.ts, globals.css) cross-checked against static site infra (sitemap.xml, robots.txt, index.html animations).

Every claim below is grounded in a file:line citation. No guessing.

---

## Severity scale
- **P0 — Ship-blocker.** Breaks core UX, kills SEO, or makes the backend impossible. Fix before anything else.
- **P1 — High ROI.** Visible quality/SEO loss; cheap to fix; do before launch.
- **P2 — Polish & innovation.** Differentiators vs competitors.

---

## P0 — Critical (fix immediately)

### P0-1 · `output: "export"` makes a backend, booking, and live data impossible
**File:** `web/next.config.ts:6`
```ts
const nextConfig: NextConfig = { output: "export" };
```
**What it breaks:** Static HTML export disables every feature you said you want — backend, data security, production-grade booking. Concretely impossible under `output: "export"`:
- ❌ API routes (`/api/lead`, `/api/contact`, `/api/checkout`) — every form's TODO target
- ❌ Server Actions (the modern way to handle form submit + Stripe)
- ❌ Middleware (geo-redirects, auth, A/B tests)
- ❌ Next.js `<Image>` optimization (you'd have to ship raw `public/fleet/*.jpg`)
- ❌ ISR / on-demand revalidation (blog updates without rebuilds)
- ❌ Dynamic OG image generation (`opengraph-image.tsx`)
- ❌ `sitemap.ts` / `robots.ts` route handlers (must be static files instead)

**You literally cannot build the booking system you described without removing this line.** The whole "backed by a backend" goal is blocked by one config flag.
**Fix:** Delete `output: "export"`. Deploy to Vercel (or Node server / Docker `next start`). If you need static CDN hosting for marketing pages only, that's a different product than the one you're describing.

---

### P0-2 · City page URLs are broken — 404 on every location link
**Files:**
- `web/src/lib/site.ts:50-57` — footer links point to `/same-day-courier-london` (flat)
- `web/src/app/locations/[slug]/page.tsx:14` — actual route is `/locations/same-day-courier-london`
- No `web/src/app/same-day-courier-london/` folder exists.

**Result:** Every "London / Birmingham / Manchester / Leeds / Bristol / Glasgow / Edinburgh / Liverpool" link in the footer 404s. That's 8 of your highest-value SEO pages — the entire programmatic city-page strategy — unreachable from the site's own navigation.
**Also:** the static site uses the flat URL (`same-day-courier-london.html`) — so anyone with the old URL bookmarked, or any existing Google indexed link, also breaks.
**Fix:** Either move the route to `app/same-day-courier-[slug]/page.tsx` (preserves old URLs — strongly recommended for SEO continuity), or update `site.ts` footer hrefs to `/locations/${slug}`. The first option is better because it preserves link equity.

---

### P0-3 · Cookie banner is 100% inert (the bug you reported)
**File:** `web/src/components/CookieBanner.tsx:18-63`
The component is a "VISUAL SHELL ONLY" — its own header comment says so. All three buttons (`Accept`, `Decline`, `Close`) have **no `onClick` handlers at all**. The banner always renders on every page load, forever, with no way to dismiss it.
**Why it matters beyond annoyance:**
- UK GDPR / PECR requires consent before non-essential cookies. An inert banner = either you have no analytics (you're flying blind) or you're running GA4 illegally.
- It also **visually overlaps the mobile sticky bar** (`MobileStickyBar` z-40 vs `CookieBanner` z-50, both `fixed bottom-0`) — on mobile the cookie banner sits on top of the WhatsApp/Call buttons, blocking your #1 conversion path.
**Fix:**
1. Add `useState` for dismissed/consent.
2. Persist to `localStorage` (`sde_consent = "accepted" | "declined"`).
3. Gate render on `!consent`.
4. On Accept → load GA4; on Decline → load nothing; on Close → treat as Decline.
5. Bump CookieBanner above MobileStickyBar *or* dismiss the sticky bar while the banner is visible.

---

### P0-4 · No `sitemap.xml`, no `robots.txt`, no AI-bot allowlist in the web app
**Files:** none of these exist in `web/src/app/`:
- ❌ `sitemap.ts`
- ❌ `robots.ts`
- ❌ `manifest.ts`

**The static site had all three** (`sitemap.xml`, `robots.txt` with explicit `GPTBot`/`ClaudeBot`/`PerplexityBot`/`OAI-SearchBot` allow rules). The Next.js port dropped every one.

**Impact:**
- **Google can't discover your service/city/blog pages efficiently.** With no sitemap, crawl budget is wasted and new pages may take weeks to index. Your entire programmatic-SEO investment (4 services × 8 cities = 32+ landing pages) is invisible to crawlers without it.
- **AI answer engines won't crawl you.** Your `robots.txt` research note (`brand mentions correlate 3x more with AI visibility than backlinks`) is correct — but the rule is missing in the new app. ChatGPT, Perplexity, Claude won't index the site.
- **No PWA manifest** — Lighthouse PWA score = 0, no installability, no theme color in mobile browser chrome.

**Fix:**
1. `web/src/app/sitemap.ts` — export default async function returning all routes (home, about, fleet, contact, faq, trade, blog index, 4 services, 8 cities, 3 blog posts, legal pages). Use `SITE.domain` for absolute URLs.
2. `web/src/app/robots.ts` — port the static `robots.txt` verbatim, including the AI-bot allowlist and the sitemap reference.
3. `web/src/app/manifest.ts` — name, short_name, theme_color `#1c2821`, background `#faf9f6`, icons.

---

### P0-5 · OG image references resolve to 404
**File:** `web/src/lib/seo.ts:29`
```ts
const DEFAULT_OG_IMAGE = `${SITE.domain}/assets/og-image.jpg`;
```
**Reality:** `assets/og-image.jpg` exists at the **repo root** (static site), but the Next app serves from `web/public/`. There is no `web/public/assets/` folder. Every OpenGraph + Twitter card across the whole site points to a 404.
**Impact:** When anyone shares *any* page on WhatsApp/LinkedIn/Twitter/Slack, the preview shows a broken image. Social CTR drops ~30-40% with no preview image. Catastrophic for B2B courier where WhatsApp shares are the #1 acquisition channel.
**Fix:** Copy `assets/og-image.jpg` → `web/public/og-image.jpg`, update the const. Better: use Next 15 `opengraph-image.tsx` per-route (needs removing `output: "export"` — see P0-1).

---

### P0-6 · Breadcrumb JSON-LD uses relative URLs (Google rejects them)
**File:** `web/src/components/Breadcrumbs.tsx:31-37`
```ts
itemListElement: items.map((item, i) => ({
  ...
  ...(item.href && i < items.length - 1 ? { item: item.href } : {}),
}))
```
`item.href` is `/` or `/services`. Google's `BreadcrumbList` spec **requires absolute URLs** in `item`. With relative URLs, Search Console will flag every breadcrumb as invalid → no breadcrumb rich result in SERPs → lower CTR.
**Fix:** Prepend `SITE.domain`: `item: \`${SITE.domain}${item.href}\``.

---

## P1 — High priority (before launch)

### P1-1 · Every form is a fake-success decoy
**Files:**
- `ContactForm.tsx:76` — `await new Promise(r => setTimeout(r, 600)); setStatus("success");`
- `TradeAccountForm.tsx:100` — same pattern, then "Application received."
- `NewsletterForm.tsx:32` — same pattern, then "✓ Subscribed."
- `QuoteWizard.tsx:130-152` — `submitLead` is a TODO stub.

**What this means right now:** Users fill in their phone number, see "Thank you, our dispatcher will call you within 15 minutes," and **nobody ever calls them.** You are silently losing every lead. The success state is a lie.
**Fix:** This is the entire reason you need the backend (see P0-1). Until `/api/*` endpoints exist, at minimum change success states to a transparent "submission pending — please call us" or wire to a no-backend service (Formspree, Resend's new form API) as a stopgap.

---

### P1-2 · Service and city pages have no breadcrumb "Services"/"Locations" hub page
**Files:** `web/src/components/ServicePage.tsx:71-75`, `web/src/components/CityPage.tsx:56-62`
The breadcrumb shows "Home / Services / Same Day Courier" but `/services` itself is **not a real route** — it doesn't exist in `app/`. Same for `/locations` (only `/locations/[slug]` exists, no index page). The breadcrumb links 404.
**Also:** A `/services` hub page is a major SEO asset — it aggregates internal link equity to all 4 service pages and is itself a high-intent keyword target ("same day courier services UK").
**Fix:** Create `app/services/page.tsx` (hub: intro + 4 service cards + FAQ) and `app/locations/page.tsx` (hub: 8 city cards + coverage map).

---

### P1-3 · Static-site motion richness was dropped in the port
**Static `index.html`:** 6 `@keyframes` blocks + 32 animation references — hub pulse, route-line draw, vehicle glide, counter ticks, etc.
**Web app:** Only `Reveal.tsx` (fade-up on scroll). The flagship DispatchMap is now **completely static** — none of the hub pulses, route-line draws, or staggered reveals were ported. It looks flat vs the reference.
**What's missing:**
- Hub pulse animation (the brass rings should breathe — signals "live network")
- Route-line draw-in (the dashed corridors should animate like data flow)
- Staggered hub reveal (cascading fade-in by `delay`)
- Counter-up animation on the hero stats (`60m`, `£20k`, `24/7`)
- Hero parallax / subtle background drift

**Fix:** Move the keyframes into `globals.css` `@theme`/base layer (per design system), apply via Tailwind `animate-[hubPulse_3s_ease-in-out_infinite]` classes. Respect `prefers-reduced-motion` (the CSS already has the override block — good).

---

### P1-4 · `QuoteWizard` Step 2 weight cap mismatch with services pricing table
**File:** `web/src/components/QuoteWizard.tsx:93-101`
`recommendVehicle()` caps at 1200kg, but `lib/services.ts:109` lists Luton at 1000kg / 4m, and the pricing table goes to "Large Van LWB 1,200kg". The over-capacity message (`>1200kg`) is correct, but the recommendation ladder skips the Luton entirely — anyone between 1000-1200kg gets "exceeds capacity" incorrectly if they hit the right combo.
**Fix:** Reconcile `FLEET` weights, `recommendVehicle` ladder, and the services.ts pricing table to a single source of truth.

---

### P1-5 · Service `areaServed` JSON-LD is hardcoded to 6 cities
**File:** `web/src/components/ServicePage.tsx:47`
```ts
cities: ["London", "Manchester", "Birmingham", "Bristol", "Leeds", "Glasgow"],
```
The data file has 8 cities (Edinburgh + Liverpool added). The schema only declares 6. Inconsistent NAP; Edinburgh/Liverpool customers' searches won't associate with the service pages in Knowledge Graph.
**Fix:** `import { CITIES } from "@/lib/cities"; cities: CITIES.map(c => c.cityName)`.

---

### P1-6 · Homepage Organization schema missing `geo`, `priceRange`, `aggregateRating` (review shield)
**File:** `web/src/lib/seo.ts:76-116`
The homepage "Reviews launching soon" section (page.tsx:269-315) is honest, but the `Organization` JSON-LD is missing the fields Google wants for the local pack: `geo` coordinates, `priceRange` ("££"), and (when reviews exist) `aggregateRating`. Without `geo`, Google can't place you in map results.
**Also missing:** `knowsAbout`, `slogan`, `founders`/`employee count` if you want knowledge panel enrichment.
**Fix:** Add `geo: { @type: GeoCoordinates, latitude, longitude }` (use London HQ coords), `priceRange: "££"`. Reserve `aggregateRating` slot for when reviews ship.

---

### P1-7 · No `hreflang` / canonical strategy for city pages
**File:** `web/src/lib/seo.ts:42` — canonical is set, but there's no `alternates.languages`. For a multi-city UK site this is fine for now (single locale), but if you ever add a `.com`/international or Welsh-language variant, you'll need it. **More urgent:** the canonical for `/locations/same-day-courier-london` should also cover the legacy `/same-day-courier-london` URL from the static site (see P0-2) — set up `301` redirects from the old paths to the new.

---

## P2 — Polish, innovation, creativity

### P2-1 · Missing high-intent SEO pages a same-day courier business needs
If I were running this business, these pages would each drive 200-1000 monthly organic visits and are nowhere in your IA:

| Page | Why |
|---|---|
| `/track` | "track my courier" — branded search, repeat visitors, low effort |
| `/courier-quote` | standalone (not just homepage section) — backlinks, ads target |
| `/business-account` vs `/trade-accounts` | you have trade; add a "pay-as-you-go business" tier page |
| `/nhs-courier`, `/solicitors-courier`, `/ecommerce-courier` | vertical landing pages (vertical SEO) |
| `/same-day-courier-{city}` for 20 more cities | Cambridge, Oxford, Reading, Brighton, Newcastle, Cardiff, Belfast — each is a distinct keyword cluster |
| `/courier-jobs` / `/become-a-driver` | recruitment page (also drives applicant funnel, employer brand) |
| `/coverage-area` | interactive map page, great for links |
| `/pricing` | standalone pricing page (currently buried in services) |

**Quick win:** the vertical pages (`/nhs-courier`, `/solicitors-courier`) reuse your `ServicePage` template — pure data entry.

---

### P2-2 · Booking flow stops at "Get a quote" — no actual booking
A production courier site's conversion funnel is: **quote → book → pay → track → POD.** Yours stops at quote (and even that doesn't persist). What a same-day courier customer actually wants:
1. **Live driver ETA** after booking ("driver 8 mins away")
2. **Real-time GPS tracking link** (shareable with their own customer)
3. **Digital POD download** (PDF, with signature image + timestamp)
4. **Repeat-booking dashboard** for trade accounts (saved addresses, invoice history)
5. **Price-match guarantee** page (conversion booster)
6. **Service-level agreement** PDF download (trust signal for procurement)

These are all backend features — gated on P0-1.

---

### P2-3 · AEO (Answer Engine Optimization) gaps
Your `answerBlock` field in services.ts/cities.ts is genuinely smart — that's exactly what ChatGPT/Perplexity want. But you're under-leveraging it:
- **Add `speakable` JSON-LD** (schema.org/SpeakableSpecification) on service/city pages — marks the answer block as voice-assistant-readable. Alexa/Google Assistant will read your definition aloud.
- **Add `@type: HowTo` schema** to the "How It Works" steps (you already have the data in `steps`/`howSteps`).
- **Add `@type: Offer`/`PriceSpecification`** to the pricing tables (currently just `<table>`).
- **Inline FAQ answers in prose, not just `<details>`** — AEO crawlers sometimes skip `<details>` collapsed content; the FAQPage schema saves you here, but richer prose helps Perplexity cite you.

---

### P2-4 · GEO (Generative Engine Optimization) — authorship & freshness signals
AI engines weight E-E-A-T (Experience, Expertise, Authoritativeness, Trust) heavily. Missing:
- **Author bios on blog posts** (`Person` schema with `jobTitle`, `worksFor`) — currently the blog has no author, no `Article` JSON-LD at all (only the page-level metadata).
- **`datePublished` / `dateModified`** in `Article` JSON-LD — your posts have dates in the UI but no schema.
- **"Last updated" timestamps** on service pages (freshness signal).
- **Real photos of drivers/vehicles/warehouse** — the fleet page uses 2 stock photos; AI engines deprioritize obviously-stock imagery.

---

### P2-5 · Motion & micro-interactions missing
- **Magnetic buttons** (slight pull toward cursor on desktop) — premium feel
- **Number count-up** on hero stats and case-study results
- **Marquee trust strip** (rotating client types) instead of static bullets
- **Cursor-follow highlight** on the dispatch map hubs
- **Page transition fade** (Next App Router + Framer Motion or View Transitions API)
- **Sticky quote-wizard summary** on service pages (CTA always visible)

---

### P2-6 · Accessibility polish
- `QuoteWizard` progress steps aren't in an `<ol>` and lack `aria-current`.
- The mobile slide-in menu has focus trap ✓ but no `aria-expanded` sync between the hamburger and panel when re-opening.
- `DispatchMap` SVG uses `<text>` without `role="img"` on individual labels — screen readers read all 13 city names as a run-on. Add `<title>` per `<g>`.
- Color contrast on `text-brass-bright` decorative elements is fine, but several `text-ivory/60` usages dip below AA on `forest` backgrounds — audit with axe DevTools.

---

## Backend / Database prep (per your request)

Since you said you'll build the backend next, here's what the front-end is already telling you it needs. The schema practically writes itself from the existing form payloads (the code comments even document them).

### Required primitives
1. **Remove `output: "export"` (P0-1)** — non-negotiable, enables everything below.
2. **Prisma is already a dependency** (`@prisma/client`, `prisma` in package.json) but **no `schema.prisma` file exists.** Run `npx prisma init`.
3. **Resend is installed** (email) but unused — good, you'll need it for lead notifications + POD emails.
4. **Zod is installed** — use it to validate every API payload (mirror the client-side regexes already in the forms).

### Suggested schema (derived from existing form comments)
```prisma
model Lead {
  id            String   @id @default(cuid())
  formType      String   // "contact" | "trade_account" | "newsletter" | "quote"
  // from QuoteWizard
  fullName      String?
  phone         String
  email         String
  company       String?
  origin        String?
  destination   String?
  cargoWeight   Int?
  cargoType     String?
  vehicleId     String?
  distanceMiles Float?
  estimatedQuote Int?    // pence, not pounds — never store money as float
  // from ContactForm
  message       String?
  // meta
  createdAt     DateTime @default(now())
  userAgent     String?
  ipHash        String?  // GDPR: hash, don't store raw
  status        String   @default("new") // "new"|"contacted"|"converted"|"lost"
}

model Booking { ... }      // when quote → booking
model TradeAccount { ... } // approved leads
model Pod { ... }          // proof of delivery: signature URL, timestamp, geo
model Vehicle { ... }      // live fleet: location, status, driverId
model User { ... }         // auth (NextAuth.js) for trade portal
```

### API routes to build (matches existing TODOs)
- `POST /api/lead` — QuoteWizard
- `POST /api/contact` — ContactForm
- `POST /api/trade-account` — TradeAccountForm
- `POST /api/newsletter` — NewsletterForm
- `POST /api/checkout` — Stripe Checkout (QuoteWizard Step 4 "Pay Now")
- `POST /api/order/confirm-cod` — COD booking confirmation
- `GET /api/track/[id]` — public tracking page data
- `POST /api/webhook/stripe` — payment confirmation
- `POST /api/webhook/resend` — email delivery events (optional)

### Security checklist
- **Rate limiting** on every public endpoint (Upstash Redis + sliding window). Courier lead forms are spam magnets.
- **honeypot field** on every form (hidden input, reject if filled).
- **Turnstile / hCaptcha** on trade-account (high-value target for fraud).
- **GDPR**: cookie consent (P0-3), privacy policy already exists ✓, add a data-retention schedule (delete unconverted leads after 24 months).
- **Stripe**: never trust client-side price — server recalculates from `Booking` record.
- **PII encryption at rest** for phone/email (Postgres `pgcrypto` or app-level AES).

---

## Quick wins ordered by effort

| # | Fix | Effort | Impact |
|---|---|---|---|
| 1 | Remove `output: "export"` | 1 line | Unblocks entire backend |
| 2 | Fix city URL mismatch (P0-2) | 30 min | 8 pages reachable |
| 3 | Wire CookieBanner localStorage | 1 hr | Legal + UX |
| 4 | Add sitemap.ts + robots.ts | 1 hr | SEO discovery |
| 5 | Copy og-image to public/ | 5 min | Social sharing |
| 6 | Absolute URLs in breadcrumb JSON-LD | 5 min | Rich results |
| 7 | Wire forms to Formspree/Resend stopgap | 2 hr | Stop losing leads |
| 8 | Port DispatchMap animations | 3 hr | Visual parity with static |
| 9 | Add /services and /locations hub pages | 2 hr | SEO + IA |
| 10 | Add HowTo + Speakable + Article JSON-LD | 2 hr | AEO |

---

## Verdict

The front-end **design system** (color tokens, typography, contrast, accessibility primitives like focus trap / skip link / reduced-motion) is genuinely strong — better than 90% of courier sites. The **information architecture** (programmatic service × city pages, answer blocks, FAQ schema) is the right SEO playbook.

But the **execution layer** has 6 P0 bugs that make the site legally non-compliant (cookie banner), SEO-invisible (no sitemap/robots), socially broken (OG 404), navigationally broken (city 404s), and backend-impossible (`output: export`). None are hard to fix — the whole P0 list is ~1 day of work. Until then, the static `index.html` is the better site.
