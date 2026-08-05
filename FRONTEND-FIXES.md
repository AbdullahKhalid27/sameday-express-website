# FRONTEND FIXES — Master Implementation Checklist

**Generated:** 2026-08-05
**Scope:** `web/` Next.js 15 app only (backend phase comes after).
**Sources used (actually read, not claimed):**
- `AgriciDaniel/claude-seo` — cloned, read: cwv-thresholds.md, eeat-framework.md, schema-types.md, quality-gates.md, local-seo-signals.md, local-schema-types.md, seo-plan/SKILL.md
- `aaron-he-zhu/seo-geo-claude-skills` v9.9.12 — cloned, read: geo-content-optimizer, entity-optimizer, on-page-seo-auditor, technical-seo-checker, internal-linking-optimizer
- `Bhanunamikaze/Agentic-SEO-Skill` — cloned, read: seo-aeo.md, full skill map, 13 operational rules, scoring weights
- `nextlevelbuilder/ui-ux-pro-max-skill` — cloned, read: design/SKILL.md, design-system, ui-styling
- Static `index.html` — read: all 4 `@keyframes`, navbar CSS, footer HTML, fleet section, robots.txt, sitemap.xml

**Decisions locked:**
- City URLs → **flat** (`/same-day-courier-london`, not `/locations/...`). Matches static site, preserves SEO equity.
- FAQPage schema → **keep** (retired for Google rich results May 7 2026, but harmless; ChatGPT/Perplexity still parse it).
- Color scheme → **do not change** (forest/ivory/brass stays).
- Fleet photos → **keep 2 photos temporarily** (motorcycle.jpg + van.jpg × 7). Marked as placeholder.

---

## Architectural Map — where things live

> **Read this BEFORE touching any file.** This map exists so future agents can
> locate the right file in seconds without scanning the full codebase.

### Stack

| Layer | Tech | Key config |
|---|---|---|
| Framework | Next.js 15 (App Router) | `web/next.config.ts` |
| Styling | Tailwind CSS v4 (CSS-first theme) | `web/src/app/globals.css` |
| Language | TypeScript (strict) | `web/tsconfig.json` |
| Deployment | Vercel (default) | no `output: "export"` — server runtime required |
| Package manager | npm | `web/package.json` |
| Icons | Custom `Icon` component (inline SVGs) | `web/src/components/Icon.tsx` |

### Route Map (`web/src/app/`)

```
app/
├── layout.tsx                          # Root layout — mounts <SiteHeader>, <SiteFooter>, <MobileStickyBar>, <CookieBanner>
├── page.tsx                            # Homepage (hero, fleet, services, quote wizard, trust bar)
├── not-found.tsx                       # Custom 404
├── error.tsx                           # Error boundary
├── globals.css                         # Tailwind v4 @theme + @layer base/components/utilities + @keyframes
│
├── robots.ts                           # P0-5 — /robots.txt route handler (AI-bot allowlist)
├── sitemap.ts                          # P0-4 — /sitemap.xml route handler (all routes)
├── manifest.ts                         # P0-6 — /manifest.webmanifest route handler
│
├── about/page.tsx                      # Static about page
├── contact/page.tsx                    # Contact page + ContactForm + hub links to city pages
├── faq/page.tsx                        # FAQ page (all service/city FAQs aggregated?)
├── fleet/page.tsx                      # Fleet page (vehicle cards + FleetGrid)
├── trade-accounts/page.tsx             # Trade accounts page + TradeAccountForm
├── blog/page.tsx                       # Blog index (card grid of POSTS)
├── blog/[slug]/page.tsx                # Blog post route (generateStaticParams from POSTS)
│
├── same-day-courier/page.tsx           # ★ Flat service route — flagship service
├── aog-aviation-courier/page.tsx      # ★ Flat service route — AOG aviation
│
├── services/[slug]/page.tsx            # Nested service route — ONLY medical-courier + legal-courier
│                                      #   (same-day-courier & aog are flat at root; see servicePath() in services.ts)
│
├── same-day-courier-london/page.tsx    # ★ Flat city route (thin wrapper → <CityPage>)
├── same-day-courier-manchester/page.tsx
├── same-day-courier-birmingham/page.tsx
├── same-day-courier-bristol/page.tsx
├── same-day-courier-leeds/page.tsx
├── same-day-courier-glasgow/page.tsx
├── same-day-courier-edinburgh/page.tsx
├── same-day-courier-liverpool/page.tsx
│
├── cookie-policy/page.tsx              # Legal page
├── privacy-policy/page.tsx             # Legal page
├── terms/page.tsx                      # Legal page (T&C)
└── sitemap/page.tsx                    # Human-readable sitemap page (/sitemap) — NOT the XML sitemap
```

**Route conventions:**
- ★ Flat routes at root are thin wrappers: they import a shared template component (`<CityPage>`, `<ServicePage>`) and pass a single slug constant. No dynamic `[slug]` at root — avoids catch-all shadowing.
- `services/[slug]` is restricted to `NESTED_SERVICE_SLUGS = ["medical-courier", "legal-courier"]`. Do NOT add same-day-courier or aog here — they have root folders.
- City slugs come from `CITIES` in `lib/cities.ts`. Service slugs come from `SERVICES` in `lib/services.ts`. Blog slugs come from `POSTS` in `lib/posts.ts`.
- All pages use `generateStaticParams` (SSG) — no server-rendered pages yet.

### Component Map (`web/src/components/`)

```
components/
├── SiteHeader.tsx          # "use client" — nav bar, mobile menu toggle, PRIMARY_NAV links
├── SiteFooter.tsx          # FOOTER_LINKS + LEGAL_LINKS, company reg details (some "[pending]")
├── MobileStickyBar.tsx     # "use client" — fixed bottom WhatsApp + Call (z-40, hidden until cookie consent set)
├── CookieBanner.tsx        # "use client" — fixed bottom consent banner (z-50, reads useCookieConsent)
│
├── CityPage.tsx            # Server — city landing template; consumes CityData from lib/cities.ts
├── ServicePage.tsx         # Server — service landing template; consumes ServiceData from lib/services.ts
├── Breadcrumbs.tsx         # Server — visible trail + BreadcrumbList JSON-LD (relative URLs → fix in P0-8)
├── JsonLd.tsx              # Server — generic <script type="application/ld+json"> renderer
│
├── CityLinksBar.tsx        # Server — cross-links to other city pages (excludes current)
├── DispatchMap.tsx         # Server — SVG UK map with hub dots and route corridors
├── FleetGrid.tsx           # Server — vehicle grid with stock photos
├── TrustBar.tsx            # Server — trust signal badges
│
├── ContactForm.tsx         # "use client" — contact form (fake success → fix in P0-9)
├── TradeAccountForm.tsx    # "use client" — trade account application (fake success → fix in P0-9)
├── NewsletterForm.tsx      # "use client" — newsletter signup (fake success → fix in P0-9)
├── QuoteWizard.tsx         # "use client" — multi-step quote wizard (stub submitLead → fix in P0-9)
│
├── SectionShell.tsx        # Server — layout wrapper (dark/ivory variant, optional label, spacing)
├── Card.tsx                # Server — styled card container
├── CardGrid.tsx            # Server — responsive grid for Card children
├── CTASection.tsx          # Server — call-to-action block with quote link
├── PageHeader.tsx          # Server — reusable page header (title + subtitle)
├── Button.tsx              # Server — styled button component
├── Icon.tsx                # Server — SVG icon library (WhatsApp, Phone, Close, etc.)
└── Reveal.tsx              # Server — scroll-triggered fade-in wrapper (IntersectionObserver)
```

**Component conventions:**
- `"use client"` is used ONLY when the component has interactivity (useState, useEffect, event handlers). Everything else is a server component.
- Templates (`CityPage`, `ServicePage`) are server components. Their route wrappers (`page.tsx`) handle `generateMetadata` + `generateStaticParams`.

### Data Lib Map (`web/src/lib/`)

```
lib/
├── site.ts                 # SITE object (name, domain, phone, email, whatsapp) + PRIMARY_NAV, FOOTER_LINKS, LEGAL_LINKS
├── cities.ts               # CITIES[] — 8 CityData records (slug, cityName, routeChips, postcodes, FAQ, etc.) + getCity()
├── services.ts             # SERVICES[] — 4 ServiceData records (sections, pricing, FAQ) + getService() + servicePath()
├── posts.ts                # POSTS[] — 3 BlogPost records (slug, title, excerpt, date) + getPost()
├── fleet.ts                # Fleet vehicle data (FleetData[])
├── quote.ts                # Quote wizard step/field data
├── postcode.ts             # UK postcode utilities
├── cn.ts                   # Class name merger utility
├── seo.ts                  # pageMetadata(), organizationJsonLd(), localBusinessJsonLd(), serviceJsonLd(), faqJsonLd(), websiteJsonLd()
│
├── useCookieConsent.ts     # "use client" hook — shared consent state (localStorage + window event sync)
├── useBodyScrollLock.ts    # "use client" hook — prevents body scroll when mobile menu is open
└── useFocusTrap.ts         # "use client" hook — keyboard focus trap for modals/menus
```

**Lib conventions:**
- `site.ts` is the single source of truth for business data (phone, email, domain). Import `SITE` from here — never hardcode contact info anywhere else.
- `seo.ts` generates all `Metadata` and JSON-LD. Service/city page components call `servicePageMetadata()` / `cityPageMetadata()` which delegate to `pageMetadata()`.
- `servicePath(slug)` in `services.ts` returns the correct public URL per service (root vs `/services/`). Use this everywhere — never hardcode `/services/${slug}`.
- All data arrays (`CITIES`, `SERVICES`, `POSTS`) are the canonical source. Route `generateStaticParams` must match these arrays.

### Static Assets (`web/public/`)

```
public/
├── fleet/
│   ├── motorcycle.jpg       # Motorcycle stock photo (shared across all fleet cards)
│   └── van.jpg              # Van stock photo (shared across all fleet cards — placeholder, same image for all)
├── og-image.jpg             # ★ MISSING — needs to be copied from assets/og-image.jpg (P0-7)
├── icon-192.png             # ★ MISSING — PWA icon (P0-6)
├── icon-512.png             # ★ MISSING — PWA icon (P0-6)
├── file.svg, globe.svg, next.svg, vercel.svg, window.svg  # Default Next.js assets (remove later?)
```

### Root-level Assets (`assets/`)

```
assets/
└── og-image.jpg             # Source OG image — needs copying to web/public/og-image.jpg (P0-7)
```

### Key Relationships (which component uses which data)

```
layout.tsx
  ├── SiteHeader       ← PRIMARY_NAV (site.ts)
  ├── SiteFooter       ← FOOTER_LINKS, LEGAL_LINKS (site.ts)
  ├── MobileStickyBar  ← SITE.whatsappHref, SITE.phoneHref (site.ts) + useCookieConsent
  └── CookieBanner     ← useCookieConsent (lib/useCookieConsent.ts)

page.tsx (homepage)
  ├── FleetGrid        ← fleet.ts
  ├── QuoteWizard      ← quote.ts
  └── TrustBar         ← (inline data)

[same-day-courier-{city}]/page.tsx  (×8)
  └── CityPage         ← CityData (cities.ts) → cityPageMetadata (seo.ts)

[same-day-courier | aog-aviation-courier]/page.tsx  (×2)
  └── ServicePage      ← ServiceData (services.ts) → servicePageMetadata (seo.ts)

services/[slug]/page.tsx  (×2: medical-courier, legal-courier only)
  └── ServicePage      ← ServiceData (services.ts) → servicePageMetadata (seo.ts)

blog/[slug]/page.tsx
  └── BlogPost         ← POSTS (posts.ts)
```

### Design Tokens (Tailwind v4 CSS variables)

Defined in `globals.css` `@theme` block. Color palette:
- **Forest** (primary dark): `--color-forest`, `forest-dark`, `forest-light`
- **Ivory** (light surface): `--color-ivory`, `ivory-deep`
- **Brass** (accent): `--color-brass`, `brass-dark`, `brass-bright`, `brass-muted`, `brass-border`
- **Text**: `--color-text`, `text-muted`, `text-light`
- **Border**: `--color-border`, `border-subtle`
- **Warm stone**: `--color-warm-stone` (MobileStickyBar divider)

Font families: `font-heading` (serif/brand), `font-body` (sans-serif/UI).

---

## P0 — Ship-blockers (broken UX, broken SEO, illegal, or backend-impossible)

### P0-1 ☑ Remove `output: "export"` from next.config.ts
**File:** `web/next.config.ts:6`
**Source:** Agentic-SEO-Skill rule #6 (mobile-first), technical-seo-checker (sitemap.ts/robots.ts require server runtime)
**Why:** Static export blocks API routes, Server Actions, Stripe, middleware, ISR, `<Image>` optimization, `sitemap.ts`, `robots.ts`, dynamic OG images. Every backend goal is gated on this.
**Change:**
```ts
// DELETE this line:
output: "export",
```
Replace with nothing (default Next server mode). Deploy to Vercel.
**Verify:** `npm run build` succeeds without "export" mode; `/.next/server/app` exists.

---

### P0-2 ☑ Move city routes from `/locations/[slug]` to flat `/same-day-courier-[slug]`
**Files:**
- Move `web/src/app/locations/[slug]/page.tsx` → `web/src/app/same-day-courier/[slug]/page.tsx`? **No** — flat means 8 separate route folders OR a single dynamic route at root.
- **Best approach:** Create `web/src/app/[city]/page.tsx` as a catch-all that matches only city slugs (using `generateStaticParams` from `CITIES`). This gives URLs like `/same-day-courier-london` without polluting the root with 8 folders.
- Update `web/src/lib/site.ts:50-57` — footer links already point to flat URLs, so they'll start working.
- Update `web/src/components/CityPage.tsx:27` — `cityPageMetadata` path changes from `/locations/${slug}` to `/${slug}`.
- Update `web/src/components/Breadcrumbs.tsx:59` — city breadcrumb "Locations" href → `/sitemap` (already correct) or remove the intermediate crumb.
- Update `web/src/components/CityLinksBar.tsx` — verify cross-links use flat URLs.
**Source:** aaron-he-zhu internal-linking-optimizer (subdirectory > subdomain for link equity; flat URL = shortest crawl path), claude-seo quality-gates (URL structure audit).
**Verify:** Footer "London" link resolves to `/same-day-courier-london` and renders the London page. All 8 cities work.

---

### P0-3 ☑ Wire the CookieBanner (currently 100% inert)
**File:** `web/src/components/CookieBanner.tsx`
**Source:** claude-seo eeat-framework (Trustworthiness: "privacy policy and terms of service"), Agentic-SEO rule (GDPR/PECR compliance).
**Current bug:** All 3 buttons (Accept/Decline/Close) have no `onClick`. Banner shows forever on every page. Overlaps mobile sticky bar.
**Changes:**
1. Add `"use client"` + `useState` for `consent` (`null | "accepted" | "declined"`).
2. On mount, read `localStorage.getItem("sde_consent")`. If set, don't render.
3. Accept → `localStorage.setItem("sde_consent","accepted")` + dispatch event to load GA4 (future). Hide banner.
4. Decline → `localStorage.setItem("sde_consent","declined")`. Hide banner.
5. Close (×) → treat as Decline.
6. **Z-index fix:** when banner is visible, hide the `MobileStickyBar` OR bump banner above it. Simplest: banner `z-50`, sticky bar `z-40` (already correct) BUT add `pb-20 md:pb-0` to banner container so it sits *above* the sticky bar on mobile, OR dismiss sticky bar while consent is unset.
**Verify:** Click Accept → banner disappears, doesn't reappear on refresh. Same for Decline and Close.

---

### P0-4 ☑ Create `sitemap.ts` (currently missing — Google can't discover pages)
**File:** Create `web/src/app/sitemap.ts`
**Source:** claude-seo seo-plan (sitemap structure with quality gates), Agentic-SEO seo-sitemap agent, technical-seo-checker step 1 (crawlability).
**Why:** No sitemap = slow crawl discovery. Your 4 services × 8 cities × 3 blog posts = 15+ pages invisible to crawlers without manual discovery.
**Content:**
```ts
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { SERVICES } from "@/lib/services";
import { CITIES } from "@/lib/cities";
import { POSTS } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.domain;
  const staticRoutes = ["/", "/about", "/fleet", "/contact", "/faq", "/trade-accounts", "/sitemap", "/privacy-policy", "/terms", "/cookie-policy", "/blog"];
  const serviceRoutes = SERVICES.map(s => `/services/${s.slug}`);
  const cityRoutes = CITIES.map(c => `/${c.slug}`); // flat URLs after P0-2
  const blogRoutes = POSTS.map(p => `/blog/${p.slug}`);
  const all = [...staticRoutes, ...serviceRoutes, ...cityRoutes, ...blogRoutes];
  return all.map(url => ({
    url: `${base}${url}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: url === "/" ? 1 : url.startsWith("/same-day-courier-") ? 0.9 : 0.7,
  }));
}
```
**Verify:** `npm run build` → check `web/out/sitemap.xml` or `/sitemap.xml` route returns valid XML with all routes.

---

### P0-5 ☑ Create `robots.ts` with AI-bot allowlist (currently missing)
**File:** Create `web/src/app/robots.ts`
**Source:** claude-seo local-seo-signals (AI search impact data: ChatGPT 15.9% conversion vs Google 1.76%), Agentic-SEO rule #8 (explicit AI crawler checks), technical-seo-checker LLM-crawler-handling reference.
**Why:** The static site had this. The web app dropped it. Without it, GPTBot/ClaudeBot/PerplexityBot may be blocked by default → invisible to AI answer engines.
**Content:**
```ts
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/thank-you"] },
      // Explicit AI-bot allow (brand mentions = 3x AI visibility per Whitespark 2026)
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
```
**Verify:** `/robots.txt` returns the rules above.

---

### P0-6 ☑ Create `manifest.ts` (PWA basics — currently missing)
**File:** Create `web/src/app/manifest.ts`
**Source:** technical-seo-checker (mobile-first indexing parity), ui-ux-pro-max design-system.
**Content:**
```ts
import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Same Day Express Couriers",
    short_name: "SDE Couriers",
    description: "UK same-day dedicated courier. Collection in 60 minutes, 24/7.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f6",
    theme_color: "#1c2821",
    icons: [], // add /public/icon-192.png and icon-512.png later
  };
}
```
**Verify:** `/manifest.webmanifest` returns valid JSON.

---

### P0-7 ☑ Fix OG image (currently 404 site-wide)
**Files:**
- Copy `assets/og-image.jpg` → `web/public/og-image.jpg`
- Update `web/src/lib/seo.ts:29` — change `/assets/og-image.jpg` to `/og-image.jpg`
**Source:** on-page-seo-auditor step 8 (image optimization), claude-seo quality-gates.
**Why:** Every WhatsApp/LinkedIn/Twitter share shows a broken image. Social CTR drops 30-40% with no preview.
**Verify:** `https://samedayexpresscouriers.co.uk/og-image.jpg` returns 200.

---

### P0-8 ☑ Fix breadcrumb JSON-LD absolute URLs (Google rejects relative)
**File:** `web/src/components/Breadcrumbs.tsx:31-37`
**Source:** claude-seo schema-types validation checklist rule #6 ("URLs are absolute, not relative"), Agentic-SEO seo-schema agent.
**Change:** Prepend `SITE.domain` to `item.href`:
```ts
import { SITE } from "@/lib/site";
// ...
...(item.href && i < items.length - 1 ? { item: `${SITE.domain}${item.href}` } : {}),
```
**Verify:** View source on any service/city page → BreadcrumbList JSON-LD `item` values are full `https://...` URLs.

---

### P0-9 ☑ Stop faking form success (4 forms lie to users)
**Files:**
- `web/src/components/ContactForm.tsx:76` — remove `setTimeout(600) → setStatus("success")`. Show a transparent "Call us — form wiring pending" state OR wire to a stopgap (Formspree/Resend form API).
- `web/src/components/TradeAccountForm.tsx:100` — same.
- `web/src/components/NewsletterForm.tsx:32` — same.
- `web/src/components/QuoteWizard.tsx:130-152` — `submitLead` TODO stub.
**Source:** eeat-framework Trustworthiness ("No deceptive practices"), Agentic-SEO content-quality agent.
**Minimum fix (until backend):** Change success states to honest copy: "Thank you — to confirm your booking, please call 020 4568 4675 or message us on WhatsApp." Add the WhatsApp + call buttons to the success state so the lead isn't lost.
**Better fix:** Wire all 4 forms to Resend (already installed in package.json) via a single `/api/lead` route. This is the bridge to the backend phase.
**Verify:** Submit contact form → user sees honest message + can still reach you. No fake "dispatcher will call in 15 min."

---

## P1 — Motion & Animation Port (parity with static site)

### P1-1 ▢ Port the 6 `@keyframes` from static index.html into globals.css
**File:** `web/src/app/globals.css` (add to `@theme` block or base layer)
**Source:** Direct port from static `index.html` lines (verified by reading).
**Animations to add:**
```css
@keyframes pulse-live { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.9); } }
@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
@keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes hub-pulse { 0% { r: 3; opacity: 0.8; } 100% { r: 9; opacity: 0; } }
@keyframes route-dash { to { stroke-dashoffset: -220; } }
```
**Respect reduced-motion:** The existing `@media (prefers-reduced-motion: reduce)` block in globals.css already nukes all animations to 0.001ms — good, no extra work needed.

---

### P1-2 ▢ Add navbar hover underline animation + scroll-spy active state
**File:** `web/src/components/SiteHeader.tsx`
**Source:** Static site CSS (`.nav-link::after` width:0 → width:100% on hover/active with `cubic-bezier(0.2,0.8,0.2,1)`).
**Changes:**
1. Add Tailwind `after:` pseudo-element classes to each nav `<Link>`:
   ```tsx
   className="relative rounded px-3 py-2 text-sm font-medium text-forest/80 transition-colors hover:bg-ivory-deep hover:text-forest after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-brass-dark after:transition-all after:duration-250 after:ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:after:w-full"
   ```
2. Add scroll-spy: a `useEffect` with `IntersectionObserver` watching each section (`#home`, `#fleet`, `#services`, `#quote`) and setting `activeSection` state. Apply `after:w-full text-forest` when active.
3. This requires `SiteHeader` to stay `"use client"` (it already is).
**Verify:** Hover a nav link → brass underline slides in. Scroll to Fleet section → "Fleet" nav link stays underlined.

---

### P1-3 ▢ Animate the DispatchMap (currently static SVG)
**File:** `web/src/components/DispatchMap.tsx`
**Source:** Static site `hub-pulse` + `route-dash` keyframes (P1-1 adds them to CSS).
**Changes:**
1. Add pulsing rings to primary hubs: wrap each primary hub `<circle>` group with an animated ring:
   ```tsx
   <circle cx={h.x} cy={h.y} r="3" fill="none" stroke="var(--color-brass-bright)" strokeWidth="1" className="origin-center" style={{ animation: "hub-pulse 2.5s ease-out infinite", animationDelay: `${h.delay * 0.4}s` }} />
   ```
2. Animate route corridors: add `style={{ strokeDasharray: "6 6", animation: "route-dash 8s linear infinite" }}` to the route `<path>` elements.
3. Stagger hub appearance: wrap the map in a `<Reveal>` and add `animation: fade-in 0.6s ease-out` with per-hub `animationDelay`.
**Verify:** Map hubs pulse continuously. Route lines show flowing dashes. Respects reduced-motion (CSS override handles it).

---

### P1-4 ▢ Add hero stats counter-up animation
**File:** `web/src/app/page.tsx:91-108` (the `60m`, `£20k`, `24/7`, `100%` grid)
**Source:** Static site `slide-up` keyframe pattern, ui-ux-pro-max ui-styling.
**Change:** Create a small `<Counter>` client component that animates from 0 to target on scroll-into-view using `requestAnimationFrame`. Apply to the numeric stats. `24/7` and `100%` stay as fade-in.
**Verify:** Scroll to hero → stats count up from 0.

---

### P1-5 ▢ Add "live drivers" pulse to hero badge
**File:** `web/src/app/page.tsx:72-78` (the green dot badge)
**Source:** Static site `pulse-live` + `.animate-live` class.
**Change:** Add `animate-[pulse-live_2s_ease-in-out_infinite]` to the green dot `<span>`.
**Verify:** Green dot pulses (breathes) — signals "live network."

---

## P2 — SEO / AEO / GEO / AI-Mode (the main event)

### P2-1 ▢ Add `geo` coordinates + `priceRange` to Organization JSON-LD
**File:** `web/src/lib/seo.ts:76-116` (`organizationJsonLd()`)
**Source:** claude-seo local-schema-types (Required/Recommended properties: `geo` minimum 5 decimal places, `priceRange` under 100 chars), local-seo-signals (proximity = 55.2% of local pack variance).
**Change:** Add to the returned object:
```ts
geo: { "@type": "GeoCoordinates", latitude: 51.50744, longitude: -0.12762 }, // London approximate — replace with real HQ
priceRange: "££",
@id: `${SITE.domain}/#organization`,
```
**Verify:** Rich Results Test on homepage → Organization schema validates with geo + priceRange.

---

### P2-2 ▢ Add `Service` schema with `Offer` (pricing) to service pages
**File:** `web/src/lib/seo.ts:160-175` (`serviceJsonLd()`)
**Source:** claude-seo schema-types (`Service` + `Offer` are active/recommended), on-page-seo-auditor step 9 (page-level schema).
**Change:** Add `offers` to the Service schema:
```ts
offers: {
  "@type": "Offer",
  priceCurrency: "GBP",
  availability: "https://schema.org/InStock",
  url: `${SITE.domain}${input.path}`,
  priceSpecification: { "@type": "PriceSpecification", priceCurrency: "GBP", minPrice: 25, maxPrice: 80 },
},
```
**Verify:** Service page Rich Results Test shows Service with Offer.

---

### P2-3 ▢ Add `Article` JSON-LD to blog posts (currently missing)
**File:** `web/src/app/blog/[slug]/page.tsx`
**Source:** claude-seo schema-types (`Article`: headline, author, datePublished, dateModified, image, publisher), geo-content-optimizer (authority signals), eeat-framework (Expertise: byline + credentials).
**Change:** Add a `<JsonLd>` block:
```tsx
<JsonLd data={{
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.metaDescription,
  datePublished: post.date,
  dateModified: post.date,
  author: { "@type": "Organization", name: SITE.name, url: SITE.domain },
  publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE.domain}/og-image.jpg` } },
  mainEntityOfPage: `${SITE.domain}/blog/${post.slug}`,
}} />
```
**Later (when you have a real author):** Change `author` to `{ "@type": "Person", name: "...", jobTitle: "...", worksFor: { "@type": "Organization", name: SITE.name } }`.
**Verify:** Blog post Rich Results Test shows Article schema.

---

### P2-4 ▢ Add `speakable` schema for voice/AEO
**File:** `web/src/components/ServicePage.tsx` and `web/src/components/CityPage.tsx`
**Source:** Agentic-SEO seo-aeo (speakable schema for Google Assistant/voice), claude-seo schema-types (Speakable updated 2024).
**Change:** Wrap the `answerBlock` `<p>` in an element with class `answer-block`, then add to the JSON-LD array:
```ts
{ "@context": "https://schema.org", "@type": "SpeakableSpecification", cssSelector: [".answer-block"] }
```
Or attach `speakable` directly inside the Service/Article schema object.
**Verify:** Speakable shows in schema validator.

---

### P2-5 ▢ Expand `sameAs` for entity recognition (Knowledge Panel)
**File:** `web/src/lib/seo.ts:114` (currently only Twitter)
**Source:** entity-optimizer Step 2 (Structured Data Signals: sameAs to Wikipedia, LinkedIn, Crunchbase), geo-content-optimizer (AI entity resolution).
**Change:** Expand `sameAs` to all real profiles:
```ts
sameAs: [
  "https://twitter.com/sdecouriers",
  "https://www.linkedin.com/company/same-day-express-couriers",
  "https://www.facebook.com/samedayexpresscouriers",
  // Add when created: Wikipedia, Crunchbase, Companies House
],
```
**Verify:** sameAs array has 3+ entries pointing to live profiles.

---

### P2-6 ▢ Create `llms.txt` for AI crawlers
**File:** Create `web/public/llms.txt`
**Source:** Agentic-SEO llms_txt_checker reference, geo-content-optimizer (AI search readiness).
**Why:** AI engines (ChatGPT, Perplexity) read `llms.txt` for a machine-readable site summary. Increases citation probability.
**Content:**
```
# Same Day Express Couriers

> UK same-day dedicated courier service. Nationwide collection within 60 minutes. DBS-vetted drivers, £20,000 goods-in-transit insurance, signed proof of delivery, 24/7 dispatch.

## Services
- [Same Day Courier](https://samedayexpresscouriers.co.uk/same-day-courier)
- [AOG Aviation Courier](https://samedayexpresscouriers.co.uk/aog-aviation-courier)
- [Medical Courier](https://samedayexpresscouriers.co.uk/services/medical-courier)
- [Legal Document Courier](https://samedayexpresscouriers.co.uk/services/legal-courier)

## Coverage
- [London](https://samedayexpresscouriers.co.uk/same-day-courier-london)
- [Manchester](https://samedayexpresscouriers.co.uk/same-day-courier-manchester)
[... all 8 cities]

## Contact
- Phone: 020 4568 4675
- Email: bookings@samedayexpresscouriers.co.uk
- WhatsApp: https://wa.me/447884208718
```
**Verify:** `/llms.txt` returns 200.

---

### P2-7 ▢ Fix service `areaServed` to use all 8 cities (currently hardcoded 6)
**File:** `web/src/components/ServicePage.tsx:47`
**Source:** entity-optimizer (consistency), local-schema-types (areaServed with named cities).
**Change:**
```tsx
import { CITIES } from "@/lib/cities";
// ...
cities: CITIES.map(c => c.cityName),
```
**Verify:** Service JSON-LD `areaServed` lists 8 cities including Edinburgh + Liverpool.

---

### P2-8 ▢ Add `/services` and `/locations` hub pages (currently 404)
**Files:** Create `web/src/app/services/page.tsx` and `web/src/app/locations/page.tsx`
**Source:** internal-linking-optimizer (topic cluster link strategy, avoid orphan pages), claude-seo quality-gates (category page min 400 words).
**Why:** Breadcrumbs link to `/services` which doesn't exist. Hub pages aggregate link equity and target "same day courier services UK" / "courier coverage areas."
**Content (services hub):** Intro (400+ words) + 4 service cards + FAQ teaser + CTA.
**Content (locations hub):** Intro + 8 city cards + DispatchMap + coverage FAQ.
**Verify:** `/services` and `/locations` render without 404.

---

### P2-9 ▢ Verify all meta descriptions meet 120-160 char range
**File:** All pages via `generateMetadata`
**Source:** claude-seo quality-gates (meta description requirements: 120-160 chars, include CTA).
**Action:** Audit every `metaDescription` in services.ts, cities.ts, posts.ts. Trim or expand to hit the range. Add CTAs ("Call 020 4568 4675" where missing).
**Verify:** View source on each page → description tag is 120-160 chars.

---

### P2-10 ▢ Audit title tags for 30-60 char range + keyword placement
**File:** All page titles
**Source:** claude-seo quality-gates (title requirements).
**Action:** Check every H1/title. Ensure primary keyword near the start, brand at end. The layout.tsx template already appends "| Same Day Express Couriers" — verify the prefix stays under ~45 chars so total ≤ 60.
**Verify:** View source → `<title>` tags all 30-60 chars.

---

## P3 — Mobile Responsiveness (critical for mobile-first indexing)

### P3-1 ▢ Resolve CookieBanner vs MobileStickyBar z-index overlap
**Files:** `web/src/components/CookieBanner.tsx`, `web/src/components/MobileStickyBar.tsx`
**Source:** Agentic-SEO rule #6 (100% mobile-first indexing), ui-ux-pro-max ui-styling.
**Bug:** Both are `fixed bottom-0`. Banner (z-50) sits on top of sticky bar (z-40), blocking WhatsApp/Call buttons.
**Fix:** When consent is unset, add `hidden` to MobileStickyBar OR add bottom padding to CookieBanner equal to sticky bar height (56px). Simplest: conditionally render MobileStickyBar only after consent is set.
**Verify:** On mobile, cookie banner shows → sticky bar hidden. After consent → sticky bar appears.

---

### P3-2 ▢ Verify all touch targets ≥ 44×44px
**Files:** All interactive elements site-wide
**Source:** ui-ux-pro-max design-system (touch target standards), claude-seo cwv-thresholds (INP affected by tap target size).
**Audit:** QuoteWizard buttons, nav links, FAQ summaries, fleet "Select & Quote" buttons. Most already use `min-h-[44px]` — verify none were missed. Check the cookie banner buttons after P0-3 wiring.
**Verify:** Lighthouse mobile audit → tap targets pass.

---

### P3-3 ▢ Test all breakpoints (360px / 768px / 1024px / 1280px)
**Source:** technical-seo-checker step 4 (mobile-friendliness: viewport, layout fit, tap targets, mobile-first parity).
**Action:** At 360px (small mobile), verify: hero text doesn't overflow, quote wizard is usable, fleet grid is 1-col, service cards stack, nav hamburger works, footer stacks cleanly.
**Verify:** Chrome DevTools device toolbar at 360px, 414px, 768px, 1024px — no horizontal scroll, no overflow.

---

### P3-4 ▢ Add `viewport` meta + `theme-color`
**File:** `web/src/app/layout.tsx`
**Source:** technical-seo-checker step 4.
**Check:** Next 15 auto-injects viewport, but verify `theme-color` is set for mobile browser chrome:
```tsx
export const viewport = {
  themeColor: "#1c2821",
  width: "device-width",
  initialScale: 1,
};
```
**Verify:** Mobile browser address bar turns forest green.

---

## P4 — E-E-A-T & Content Quality (per eeat-framework)

### P4-1 ▢ Fill in company registration details (currently "[pending]")
**File:** `web/src/components/SiteFooter.tsx:109-128`
**Source:** eeat-framework Trustworthiness ("Clear contact information, transparent about who creates content"), local-seo-signals (NAP consistency).
**Bug:** Three placeholders say "[Company details pending]" for Company Reg No, VAT No, ICO Registration.
**Action:** Get the real numbers from the client. Until then, either remove the section or show "Registered in England & Wales" without the placeholder brackets.
**Verify:** No "[pending]" text anywhere on the site.

---

### P4-2 ▢ Add visible NAP (Name/Address/Phone) consistency
**Source:** local-seo-signals (NAP consistency = top 15 local pack factor), local-schema-types (telephone must match GBP and page NAP).
**Action:** Ensure phone `020 4568 4675` and email appear identically in: header, footer, contact page, Organization JSON-LD, and (eventually) Google Business Profile. Add a physical address (even if it's a registered office) to the footer and contact page.
**Verify:** Phone number is byte-identical across all locations.

---

### P4-3 ▢ Ensure no thin/doorway city pages (quality-gates warning at 30+)
**Source:** claude-seo quality-gates (location page thresholds, doorway page detection).
**Current state:** 8 city pages — well under the 30-page warning threshold. Each has unique postcodes, route chips, "who" cards, and FAQ. Good.
**Risk:** If you scale to 20+ cities (P5 innovation), each MUST have 60%+ unique content. Don't just swap the city name.
**Action:** Document the uniqueness requirement before scaling.

---

## P5 — Innovation & Feature Gaps (what a courier business should have)

### P5-1 ▢ Add standalone `/courier-quote` page (not just homepage section)
**Source:** claude-seo seo-plan (dedicated landing pages for high-intent keywords), internal-linking-optimizer (orphan page prevention).
**Why:** "same day courier quote" is a high-intent keyword. A standalone page targets it + earns backlinks + is an ads landing page.
**Content:** Reuse `<QuoteWizard>` + add quote-process FAQ + trust signals.

---

### P5-2 ▢ Add vertical landing pages
**Source:** seo-plan (content gaps vs competitors), geo-content-optimizer (topical authority).
**Pages:** `/nhs-courier`, `/solicitors-courier`, `/ecommerce-courier`, `/manufacturing-courier`.
**Why:** Each is a distinct keyword cluster + audience. Reuses `ServicePage` template — pure data entry in a new `verticals.ts` file.

---

### P5-3 ▢ Add `/track` page (placeholder for live tracking)
**Why:** "track my courier" / "sde tracking" = branded search, repeat visitors. Even a placeholder with "enter your tracking number" (wired later) captures the intent.

---

### P5-4 ▢ Add `/courier-jobs` (recruitment)
**Why:** Driver recruitment funnel + employer brand + "courier jobs UK" keyword.

---

### P5-5 ▢ Add 12+ more city pages (when content is ready)
**Cities:** Cambridge, Oxford, Reading, Brighton, Newcastle, Cardiff, Belfast, Aberdeen, Sheffield, Nottingham, Liverpool-expand, Coventry.
**Source:** quality-gates (safe at scale IF 60%+ unique content per page).
**Warning:** Do NOT launch these until each has genuinely unique local content (landmarks, specific postcodes, local case studies). Thin pages = doorway penalty risk.

---

## Implementation Order (recommended sequence)

| Phase | Tasks | Effort |
|---|---|---|
| **Phase A — Unblock** | P0-1 (remove export), P0-2 (city URLs), P0-7 (OG image) |  |
| **Phase B — Legal + SEO infra** | P0-3 (cookie banner), P0-4 (sitemap), P0-5 (robots), P0-6 (manifest), P0-8 (breadcrumb URLs) |  |
| **Phase C — Stop lying** | P0-9 (form honesty) |  |
| **Phase D — Motion** | P1-1 through P1-5 (animations) |  |
| **Phase E — SEO depth** | P2-1 through P2-10 |  |
| **Phase F — Mobile** | P3-1 through P3-4 |  |
| **Phase G — E-E-A-T** | P4-1 through P4-3 |  |
| **Phase H — Innovation** | P5-1 through P5-5 (after launch, ongoing) | Ongoing |

**Total front-end effort to launch-ready:**

---

## Sources & Provenance

Every recommendation above is traceable to a specific skill file I actually read:

| Skill / Repo | File Read | Applied To |
|---|---|---|
| AgriciDaniel/claude-seo | `cwv-thresholds.md` | P3 (INP/tap targets), motion perf |
| AgriciDaniel/claude-seo | `eeat-framework.md` | P0-9 (deceptive forms), P4 (E-E-A-T), P2-3 (author schema) |
| AgriciDaniel/claude-seo | `schema-types.md` | P0-8 (absolute URLs), P2-1 (geo), P2-2 (Offer), P2-3 (Article), P2-4 (speakable) |
| AgriciDaniel/claude-seo | `quality-gates.md` | P2-9, P2-10 (title/meta lengths), P4-3 (doorway pages), P5-5 (city scaling) |
| AgriciDaniel/claude-seo | `local-seo-signals.md` | P2-1 (geo/proximity), P4-2 (NAP), P0-5 (AI bots) |
| AgriciDaniel/claude-seo | `local-schema-types.md` | P2-1, P2-2 (LocalBusiness properties) |
| AgriciDaniel/claude-seo | `seo-plan/SKILL.md` | P5-1, P5-2 (dedicated landing pages) |
| aaron-he-zhu/seo-geo v9.9.12 | `on-page-seo-auditor` | P2-9, P2-10 (title/meta audit steps) |
| aaron-he-zhu/seo-geo v9.9.12 | `technical-seo-checker` | P0-4, P0-5 (sitemap/robots), P3-3, P3-4 (mobile) |
| aaron-he-zhu/seo-geo v9.9.12 | `internal-linking-optimizer` | P0-2 (URL equity), P2-8 (hub pages) |
| aaron-he-zhu/seo-geo v9.9.12 | `entity-optimizer` | P2-5 (sameAs), P2-7 (areaServed) |
| aaron-he-zhu/seo-geo v9.9.12 | `geo-content-optimizer` | P2-4 (speakable), P2-6 (llms.txt) |
| Bhanunamikaze/Agentic-SEO | `seo-aeo.md` | P2-4 (speakable), FAQ decision |
| Bhanunamikaze/Agentic-SEO | 13 operational rules | P0-1 (mobile-first), FAQ (rule #2), P0-5 (AI bots rule #8) |
| nextlevelbuilder/ui-ux-pro-max | `design/SKILL.md`, `design-system` | P3-1, P3-2 (touch targets), P1-4 (counter) |
| Static `index.html` | 4 `@keyframes`, navbar CSS, footer HTML | P1-1 through P1-5 (all motion ports) |
