# PROJECT-MEMORY.md — SameDay Express Couriers Website 2.0

> **The definitive context document for AI agents and humans.** Read this entirely
> before working on this project. It supersedes `PROGRESS.md` (which covers only the
> legacy static-site era, July 2026, and wrongly says "don't touch web/" — `web/` is
> now the entire project).
>
> Last updated: 2026-08-22 (SEO pass: blog posts written, FAQ/fleet data
> aligned, sitemap fix, X-Robots-Tag for previews).

---

## 1. PROJECT OVERVIEW

### What is this?
A UK same-day courier company website for **Same Day Express Couriers Ltd**. Two eras:

1. **Legacy static site** (root folder) — 22 self-contained vanilla HTML/CSS/JS pages.
   **Untracked in git since `dd71d11`. Dead weight on disk. Do not edit.**
2. **`web/` folder — THE PROJECT.** Next.js 15.5 App Router app: ~25 marketing pages,
   full lead-capture pipeline (Neon Postgres + Prisma), Stripe payments, and an admin
   CRM dashboard. This is where all work happens.

### Business details
- **Legal name:** Same Day Express Couriers Ltd (registered England & Wales)
- **Domain:** `samedayexpresscouriers.co.uk` — **NOT YET CONNECTED** (site runs locally / Vercel previews)
- **Phone:** `020 4568 4675` (tel: `+442045684675`) · **WhatsApp:** `wa.me/442045684675`
- **Email:** `bookings@samedayexpresscouriers.co.uk`
- **Core promise:** "Collect in 60 Minutes" — nationwide same-day dedicated courier, no hubs, no multi-drop
- **Insurance:** £20,000 goods-in-transit on every job · **Drivers:** DBS-vetted
- **Operating model:** Nationwide, NO single depot — drivers positioned across UK hubs
- **⚠️ COMPLIANCE — NEVER claim:** live GPS tracking / real-time tracking / tracking links.
  81 false claims were purged from the static site for ASA/CMA safety. The honest offer:
  signed digital POD, driver + vehicle details on dispatch, telephone status updates.

### Repo
- **URL:** `https://github.com/AbdullahKhalid27/sameday-express-website`
- **Branch:** `main` (default). One stale remote branch: `feat/prompt2-neon-migration`.
- **Git user:** Abdullahkhalid27

---

## 2. TECH STACK (`web/`)

| Layer | Choice |
|---|---|
| Framework | Next.js 15.5 App Router, Turbopack for dev (`next dev --turbopack`) |
| UI | React 19.2, Tailwind CSS 4, clsx, recharts (admin charts) |
| Language | TypeScript 5 |
| Database | Neon PostgreSQL (pooled URL via PgBouncer) + Prisma 7.9 with `@prisma/adapter-pg` + `pg` |
| Validation | Zod 4 (every API route) |
| Email | Resend (team notifications) |
| Payments | Stripe (checkout + webhook) |
| Bot protection | Cloudflare Turnstile (`@marsidev/react-turnstile`) — **CURRENTLY DISABLED, see §6** |
| Rate limiting | lru-cache (per-IP, in API routes) |
| Client generation | Prisma client output in `src/generated` |

**Key scripts (`web/package.json`):** `dev`, `build`, `start`, `db:generate`, `db:push`,
`db:migrate`, `db:deploy`, `db:studio`, `db:seed` (tsx), `db:reset`, and
`postinstall: prisma generate`.

**Env vars (see `web/.env.example`):** `DATABASE_URL` (pooled), `DIRECT_URL` (non-pooled,
migrations only), `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO_TEAM`,
`GOOGLE_MAPS_API_KEY` (server-side only), `TURNSTILE_DISABLED` +
`NEXT_PUBLIC_TURNSTILE_DISABLED` (default "true" = disabled) +
`TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (disabled), `AUTH_SECRET`, `ADMIN_EMAIL`,
`ADMIN_PASSWORD`, `ADMIN_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_PHONE`.

---

## 3. COMPLETE WORK HISTORY (5 eras, 64 commits)

### Era 1 — Static HTML site (July 2026, `3b75e33`→`537758d`)
22 zero-dependency HTML pages. The "Parts A–S" system:
- **A:** SEO hardening — clean sitemap (no `priority`/`changefreq`), robots.txt allowing
  AI crawlers (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot), upgraded Organization/Service schema
- **B:** Accessibility — 1280px containers unified, `prefers-reduced-motion`, `:focus-visible` outlines
- **C:** Creative — SVG UK dispatch map with pulsing hubs, count-up stats, magnetic glow
  buttons, scroll-drawn timeline, fleet SVG silhouettes, per-city skyline motifs
- **D:** **COMPLIANCE CRISIS** — removed 81 false "live GPS tracking" claims across all pages
- **F:** Performance — throttled/passive scroll listeners, killed navbar `backdrop-filter`
- **G–S:** Navbar redesign, Services+Sectors merge, fake dispatch ticker removed (ASA risk),
  AEO answer blocks, readability overhaul (17px base, contrast fixes), Google Maps
  Distance Matrix integration with Haversine fallback
- **Era's biggest gap:** `GOOGLE_SHEETS_WEBHOOK_URL = ""` — forms fake-succeeded, transmitted nothing

### Era 2 — Next.js rebuild (early Aug 2026)
Phases 1–4: shared infra (`fleet.ts`, `postcode.ts`, `quote.ts`, `seo.ts`+JsonLd, Reveal),
homepage + QuoteWizard, city pages via shared `CityPage` template (**8 cities — Edinburgh
and Liverpool were added in this era**), service pages via `ServicePage` template,
marketing/legal/blog pages — all ~25 routes. Then **P0/P1 hardening** (`7bc173a`, `537758d`):
removed static export, **flat city URLs** (`/same-day-courier-london`), cookie banner,
sitemap/robots/manifest, OG image fix, breadcrumb absolute URLs, honest form states.
Legacy static HTML untracked in `dd71d11`.

### Era 3 — Database + lead pipeline (`SDX_DATABASE_PROMPTS.md`, 12 prompts)
Run IN ORDER, one at a time, per the doc. Delivered: Prisma init + singleton → full
schema → **Neon migration** with driver adapter → shared libs (`money.ts`, `resend.ts`,
`validation.ts`, `leads.ts` resilience engine, `utm.ts`) → 5 API routes
(`/api/lead`, `/api/contact`, `/api/trade-account`, `/api/newsletter`,
`/api/quote-attempt`) → all 4 forms wired (QuoteWizard, ContactForm,
TradeAccountForm, NewsletterForm).

### Era 4 — Admin portal + Stripe (mid Aug 2026)
Admin skeleton, rate limiting, security headers, `/api/health`, seed script,
**Stripe Phase 5** (checkout + webhook + `/booking/success` + `/booking/cancelled`),
admin link in navbar, Turbopack dev fix, `/sitemap`→`/site-map` route-conflict fix.

### Era 5 — Admin CRM dashboard (Aug 17–21)
UTM cookie persistence (`2165524`) → LeadNote schema + notes API (`aba27ca`) →
LeadsTable (`67844f7`) → LeadDetailPanel with notes + status stepper (`6afc9dc`) →
date-range/source filters (`50f282b`) → stale-lead alerts + stat cards (`866a3cd`) →
analytics API + recharts (`a2053a1`) → Order schema extended with driver ops
(`49933ea`) → OrdersTable with driver assignment (`72943cd`) → **bulk actions +
test-data purge (`e3d4659`)**.

### Era 6 — CI/backups + P1–P4 checklist completion (Aug 22)
- CI (`ci.yml`: build on push/PR) + weekly DB backup (`db-backup.yml`: Monday 03:00
  UTC pg_dump → 90-day artifact; needs `BACKUP_DATABASE_URL` secret) + local
  `scripts/backup-db.sh` + `BACKUPS.md` (`fb4cb17`).
- **P1/P2 SEO batch** (`97b1c18`): HeroStats count-up (reduced-motion aware);
  Offer schema on Service JSON-LD; Article JSON-LD on blog; SpeakableSpecification
  targeting `.answer-block`; `llms.txt` (note: earlier memory said skip llms.txt —
  implemented anyway per FRONTEND-FIXES P2-6, harmless); Service areaServed = all 8
  cities; `/services` + `/locations` hub pages (+ sitemap); per-city 120-160 char
  `metaDescription` fields (answerBlock is page copy, NOT a meta description);
  keyword-first short titles (42-55 chars total); `scripts/audit-meta.js` auditor.
- **P3/P4 mobile + E-E-A-T batch**: viewport + themeColor export in layout
  (P3-4); touch-target bumps to ≥44px — cookie-banner close, QuoteWizard Back,
  CityLinksBar chips, admin pagination 40px (P3-2); real Company Reg No 15548532 +
  VAT GB468246168 in `SITE`/footer/Organization taxID, ICO line dropped until
  registered (P4-1); NAP verified consistent (all from SITE) (P4-2); city-scaling
  uniqueness rule documented in §7 (P4-3).
- **P3-3 mobile test** (browser @360px + 768px): home, city, contact, locations,
  hamburger menu, admin login + dashboard + orders tab — all pass, zero horizontal
  overflow (scrollWidth 345 < 360 on every page). Evidence: `gui-test-screenshots/`
  (gitignored). P3-1 was already solved (sticky bar hidden until consent).

**Migrations (3):** `20260809211028_init`, `20260821133607_add_lead_notes`,
`20260821215104_add_order_driver_ops`.

---

## 4. CURRENT ARCHITECTURE MAP

```
Root:  legacy static HTML (untracked, dead — do not edit)
       PROJECT-MEMORY.md (this file) · PROGRESS.md (stale, static-era only)
       SDX_DATABASE_PROMPTS.md (Era-3 prompt plan — historical reference)
       AUDIT-PAINPOINTS.md · FRONTEND-FIXES.md (static-era audits)
       .github/workflows/  ← ci.yml + db-backup.yml  (UNCOMMITTED as of 2026-08-21)

web/:
├── prisma/            schema.prisma (16 models), seed.ts, migrations/
├── scripts/           backup-db.sh (UNCOMMITTED), generate-static-{manifest,robots,sitemap}.cjs
├── src/
│   ├── middleware.ts         security headers
│   ├── generated/            Prisma client output
│   ├── lib/                  db.ts · admin-auth.ts · leads.ts (resilience engine) ·
│   │                         validation.ts (Zod — TURNSTILE_DISABLED flag lives here) ·
│   │                         money.ts (poundsToPence) · resend.ts · utm.ts ·
│   │                         fleet.ts · quote.ts · postcode.ts · cities.ts ·
│   │                         services.ts · posts.ts · site.ts · seo.ts · stripe.ts ·
│   │                         cn.ts · useBodyScrollLock.ts · useCookieConsent.ts · useFocusTrap.ts
│   ├── app/
│   │   ├── (marketing)       ~25 pages: home, about, contact, faq, fleet, trade-accounts,
│   │   │                     8 city pages, same-day-courier pillar, services/[slug],
│   │   │                     aog-aviation-courier, blog(+[slug]), legal pages, site-map
│   │   ├── admin/            dashboard page + login page
│   │   ├── booking/          success + cancelled (Stripe redirects)
│   │   └── api/
│   │       ├── lead · contact · trade-account · newsletter · quote-attempt  (public)
│   │       ├── stripe/       checkout + webhook
│   │       ├── health
│   │       └── admin/        login · stats · analytics · leads(+[id]/notes, bulk,
│   │                         purge-test) · orders(+[id]) · drivers
│   └── components/           QuoteWizard · ContactForm · TradeAccountForm ·
│                             NewsletterForm · TurnstileWidget · admin/* (LeadsTable,
│                             LeadDetailPanel, OrdersTable, StatCards, charts/*)
```

### Database models (16)
Customer, Lead, LeadNote, Quote, QuoteAttempt, TradeAccountApplication,
ContactEnquiry, NewsletterSubscriber, Order, Driver, Payment, EmailLog, WebhookEvent,
ActivityLog + enums (CustomerType, TradeStatus, LeadType, LeadStatus, QuoteStatus,
OrderStatus, PaymentStatus).

### Hard architectural rules (from SDX_DATABASE_PROMPTS.md — still binding)
- **All database money = integer pence.** £35.00 → `3500`. Never Float/Decimal.
  One conversion point: `poundsToPence()` in `money.ts`, called only at API boundaries.
  `fleet.ts` (GBP floats) and `quote.ts` QuoteResult (formatted strings) are never modified.
- UUIDs for all IDs · soft deletes (`deletedAt`) on Customer/Lead/Order
- Lead↔Order: only Order has `leadId` (avoids dual-FK circular relation)
- Lead pipeline resilience: `captureLeadWithResilience()` = Prisma transaction
  (customer upsert + lead + child record) ∥ Resend email, joined by
  `Promise.allSettled` — success if EITHER lands. Every email → EmailLog row.
- Clients (Prisma, Resend, Stripe) are lazy/singletons so `next build` works
  without live credentials.

---

## 5. REPOSITORIES & SKILLS USED

### Repos researched (Era 1)
| Repo | What we took |
|---|---|
| `nextlevelbuilder/ui-ux-pro-max-skill` | Motion duration tiers (150/300/500ms), named easings, 4px grid, WCAG AA minimums |
| `nexu-io/open-design` | Linear-style restraint — brass accent sparingly, CTAs/active states only |
| `aaron-he-zhu/aaron-marketing-skills` | `geo-content-optimizer` (AEO answer blocks — applied), `serp-markup-builder`, `technical-seo-checker`. Rejected the 120-skill "OS" as bloat |
| `AgricIDaniel/claude-seo` | Swap Test, Service schema pattern, title-tag rules |
| `dietrichgebert/ponytail` | Minimalism discipline — security/a11y never on the chopping block |
| `prisma/skills` (official) | Locked in `web/skills-lock.json`: prisma-cli, prisma-client-api, prisma-compute, prisma-database-setup, prisma-driver-adapter-implementation |

### Rejected (with reasons)
- `@formkit/auto-animate` CDN — breaks zero-dependency principle (static era)
- `llms.txt` — Google confirmed ineffective
- FAQ rich-result promises — Google retired them 2026-05-07 (schema kept for AEO only)
- Paid SEO connectors (DataForSEO, Ahrefs) — GSC/PageSpeed/Rich Results Test suffice

### Skills / AI tooling in this workspace
- **`.zcode/skills/` — Matt Pocock engineering set (24 skills):** `ask-matt`, `grill-me`,
  `grilling`, `grill-with-docs`, `to-spec`, `to-tickets`, `triage`, `wayfinder`, `tdd`,
  `implement`, `code-review`, `diagnosing-bugs`, `domain-modeling`, `codebase-design`,
  `handoff`, `ponytail`, `prototype`, `research`, `teach`, `setup-matt-pocock-skills`,
  `improve-codebase-architecture`, `resolving-merge-conflicts`, `writing-great-skills`,
  `skill-creator`. Saved plan docs live in `.zcode/plans/`.
- **Multi-agent configs in `web/`:** `.claude/skills`, `.windsurf/skills`, `.agents/skills`
  + `skills-lock.json` — skills synced across Claude Code, Windsurf, and ZCode.

---

## 6. WHERE WE GOT STUCK (unresolved items first)

### 🔴 OPEN BLOCKERS
1. **Turnstile is DISABLED.** The saga: Turnstile broke all form submissions on
   localhost (`697e722`) → phone validation rejecting landlines + 429 rate-limit
   surfacing (`08a6fa1`) → siteverify rejections needed error-code diagnostics
   (`d83cdcd`) → **temporarily disabled to unblock DB testing (`a1d3e57`)**.
   Current state: DISABLED VIA ENV (`TURNSTILE_DISABLED` /
   `NEXT_PUBLIC_TURNSTILE_DISABLED`, default "true") — client
   (`TurnstileWidget.tsx`) and server (`validation.ts` verifyTurnstile) both
   read it. `turnstileToken` optional in every Zod schema; honeypot is the
   ONLY bot protection. **Must be re-enabled before launch.**
   To re-enable: set both flags to "false" + add real keys —
   `web/scripts/check-env.js` (runs in `npm run build` / CI) HARD-FAILS the
   production build if Turnstile is enabled with missing/placeholder keys or
   only half-enabled. Runtime backstop: enabled + missing secret now FAILS
   CLOSED in production (previously failed open). (2026-08-22)
2. **Google Maps API key still needs rotation + restriction** (pending since the
   static era): HTTP-referrer restriction to `samedayexpresscouriers.co.uk/*`,
   API restriction to Distance Matrix. Key was exposed in chat once — rotate it.
3. **⚠️ UNVERIFIED STATS on /about (2026-08-22 external review):** the stats
   strip claims "15,000+ Deliveries Completed" and "500+ Corporate Clients"
   (`web/src/app/about/page.tsx` ~line 109). If these are placeholder/
   aspirational numbers they carry the same UK Consumer Protection exposure as
   fake reviews. AWAITING CLIENT CONFIRMATION of real figures — replace or
   pull them. Also `organizationJsonLd()` in seo.ts claims foundingDate
   "2020"; company number 15548532 suggests ~2024 incorporation — confirm.
4. **UNCOMMITTED work (as of 2026-08-21):** `.github/workflows/ci.yml` (type-check +
   build on push/PR), `.github/workflows/db-backup.yml` (weekly Monday 03:00 UTC
   pg_dump → 90-day artifact; needs `BACKUP_DATABASE_URL` secret), and
   `web/scripts/backup-db.sh` (local backup). Commit them; add the secret.

### 🟡 Environment gaps
- Domain not connected; no HTTPS in production; not deployed (Vercel is the target)
- No Google Analytics; no GSC verification; no Google Business Profile
- Admin "settings" tab in the dashboard is a stub (tab exists, no content)

### Historical sticking points (resolved — keep the lessons)
- Vercel builds failing without `DATABASE_URL` → lazy Prisma client (`58186cb`),
  same for Resend (`57a7c1b`), removed incompatible Pages workflow (`bc085c1`)
- `/sitemap` reserved-route conflict → renamed to `/site-map` + Turbopack (`eaf0c87`)
- Prisma JSON cast in lead route (`34770d8`); N/A defaults + dedup guard (`0fe94e6`)
- Seed script env loading (`7766c51`)

---

## 7. STAGE ASSESSMENT — ROAD TO "KING OF LEADS"

### 🟢 LEADS — the engine is BUILT
End-to-end: 4 wired forms → Zod → Prisma transaction → Resend (parallel, allSettled).
Abandoned-funnel capture (`/api/quote-attempt`, no PII, debounced). UTM cookie
persistence across forms. Dedup guard. Quote price-freezing (snapshot at request time).
Admin CRM: leads table (filters, pagination, bulk actions), detail panel (notes, status
stepper), stale-lead alerts, stat cards, analytics charts (source/type/weekly trend),
orders with driver assignment, test-data purge.
**Missing:** real traffic (domain), GA, Turnstile re-enable, admin settings tab.

### 🟡 SEO — fully hardened, pointing at an unlaunched domain
Titles 50–65 chars keyword-first · JSON-LD everywhere (Organization, LocalBusiness,
Service, BreadcrumbList, FAQPage-for-AEO) · AEO answer blocks on service+city pages ·
8 flat-URL city pages passing the Swap Test (~64% unique content) · sitemap/robots/
manifest · canonicals · AI-crawler-friendly robots.txt.
**Missing:** deploy + domain + HTTPS, GSC verify + sitemap submit, Google Business
Profile (#1 local-pack factor), GA, Maps key restriction.

### 🟢 ARCHITECTURE — clean and documented
Money-as-pence with one conversion point · lazy clients for build safety · soft
deletes · append-only Payment ledger + WebhookEvent replay table · 3 tracked
migrations · CI + backups written (uncommitted).

### SEO truth: what NOT to do (still binding)
- Don't promise FAQ rich snippets (retired 2026-05-07)
- Don't chase keyword density
- No `<priority>`/`<changefreq>` in sitemaps
- **Never re-add live-tracking claims**

### City-page uniqueness rule (P4-3 — binding before scaling beyond 8 cities)
Current 8 city pages pass the Swap Test at ~64% unique content. Google's
doorway-page detection is a **risk above ~30 near-identical location pages**.
Before adding ANY new city (Cambridge, Oxford, Reading, etc. from the P5-5
list), each new page MUST have:
1. **≥60% unique content** — genuinely local postcodes, landmarks, routes,
   and a local case study. Never city-name string-swap on a template.
2. A dedicated 120-160 char `metaDescription` (not the shared answerBlock).
3. Local FAQ items that could only be answered for that city.
4. At least one unique internal-link context (local sector, local airport).
If a candidate city can't meet all four, it ships as a redirect to the
nearest hub city page, not as a thin page.

---

## 8. THE PLAN — WHAT'S NEXT (in order)

1. **Commit the CI + backup workflows** + add `BACKUP_DATABASE_URL` repo secret
2. **Re-enable Turnstile** — test real keys end-to-end (localhost via dev-bypass),
   then flip `TURNSTILE_DISABLED = false` in `web/src/lib/validation.ts` and make
   `turnstileToken` required again in all schemas
3. **Rotate + restrict the Google Maps API key** (referrer + API restriction)
4. **Deploy** — Vercel, connect `samedayexpresscouriers.co.uk`, HTTPS
   (`db:deploy` + `postinstall` already wired)
5. **GSC** verification + sitemap submit · **Google Business Profile** · **GA**
6. Build out the admin **settings** tab

### Deferred backlog (from SDX_DATABASE_PROMPTS.md — future phase)
- Google Routes API upgrade (real road distance server-side, replacing Haversine)
- Cash on Delivery route (`/api/order/confirm-cod`)
- Cron: mark quotes EXPIRED after 24 hours
- Coolify migration path (pg_dump Neon → restore to Coolify Postgres, swap DATABASE_URL)

---

## 9. USER PREFERENCES & COMMUNICATION STYLE (Abdullah)

- **Ruthless honesty** — wants to know if something hurts scalability or lead-gen
- **Customer-benefit voice** — "you get a loophole/deal", never corporate chest-beating
- **Short, punchy content** — no walls of text, no AI slop
- **Premium feel** — forest/brass/ivory palette is the brand moat vs Royal Mail/DPD/Strider
- **No fake data** — fabricated dispatch tickers and GPS claims were purged; keep it that way
- **Performance matters** — jank is unacceptable
- **Security conscious** — no exposed keys, no exposed internals
- **Design tokens** (still the brand): `--forest #1c2821`, `--brass-dark #7d6547`
  (AA-safe accent text — brass/brass-bright NEVER for body text), `--ivory #faf9f6`,
  headings Outfit, body DM Sans

---

## 10. QUICK REFERENCE FOR NEW AGENTS

1. **Work in `web/` only.** The root HTML files are dead legacy.
2. **Read `git log --oneline`** — commit-per-part with descriptive messages is the convention
3. **Never claim live GPS tracking** (ASA/CMA)
4. **Money = integer pence**, one conversion point (`poundsToPence()`)
5. **Turnstile is disabled** — don't be surprised; see §6 before launch
6. **Run locally:** `cd web && npm run dev` (Turbopack); DB via `npm run db:studio`
7. **Test data:** seed with `npm run db:seed`; purge via the admin purge endpoint
8. **Update this file** whenever significant work is done

---

*End of PROJECT-MEMORY.md. Maintained alongside the codebase.*


---

## 7. SEO PASS (2026-08-22, external review round 2)

Fixed in commit (this date):
- **Blog stubs → full articles.** All 3 posts in `web/src/lib/posts.ts` now
  have real bodies (typed block model: h2/p/ul/table rendered by `PostBody` in
  `blog/[slug]/page.tsx`). Pricing post grounded in the live fleet.ts rate
  card (£35/£1.00 moto → £80/£2.20 Luton), CCZ £18, VAT 20%. RULE: if fleet
  pricing changes, update the pricing post in the same commit.
- **FAQ/fleet contradictions fixed** (`web/src/app/faq/page.tsx`): small van
  600→700kg, LWB 1,200→1,000kg (XLWB is the 1,200kg one), Luton 1,000→1,200kg;
  pricing answer £25/£35/£75 → £35/£45/£80 (+£1.00/£1.20/£2.20 per mile).
- **Service schema price range fixed** (`seo.ts` serviceJsonLd): min 25/max 75
  → 35/80 to match fleet.ts base prices.
- **Sitemap bug fixed** (`sitemap.ts`): listed non-existent `/sitemap`; the
  route is `/site-map` (renamed e3d4659-era). Sitemap now: 28 URLs = 13 static
  + 4 service + 8 city + 3 blog. robots.txt verified clean (allows all but
  /api/ + thank-you; AI bots explicitly allowed).
- **X-Robots-Tag: noindex, nofollow** added in `next.config.ts` headers() for
  non-production deployments (VERCEL_ENV=preview/development or
  NEXT_OUTPUT_EXPORT=true GitHub Pages). Self-hosted prod + Vercel prod stay
  indexable. Verified via local `next start` + curl.
- **Structured data was ALREADY comprehensive** (review's "no schema" claim was
  a detection failure — verified in built HTML): homepage = Organization+
  LocalBusiness+WebSite+FAQPage; /faq = FAQPage (20 items); /about =
  Organization; city pages = LocalBusiness+Speakable+FAQPage; service pages =
  Service+Offer+Speakable+FAQPage; blog = Article + Breadcrumbs everywhere.
- **OPEN:** /about stats 15,000+/500+ awaiting client confirmation (§6 item 3).
