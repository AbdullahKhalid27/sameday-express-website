# PROGRESS.md — SameDay Express Couriers Website 2.0

> **Full context document for AI agents.** Read this entirely before working on this project. It contains the complete history, architecture, decisions, and roadmap. Last updated: 2026-07-23.

---

## 1. PROJECT OVERVIEW

### What is this?
A **UK same-day courier company website** for "Same Day Express Couriers Ltd." The live, production site is built in **vanilla HTML/CSS/JS** (no framework, no build step, no dependencies). There is also an early-stage **Next.js 15 / React 19 rebuild** in the `web/` folder that is out of scope — do NOT touch it unless explicitly asked.

### Business details
- **Legal name:** Same Day Express Couriers Ltd (registered England & Wales)
- **Domain:** `samedayexpresscouriers.co.uk` (NOT yet connected — currently testing locally)
- **Phone:** `020 4568 4675` (tel: `+442045684675`)
- **Email:** `bookings@samedayexpresscouriers.co.uk`
- **WhatsApp:** `wa.me/442045684675`
- **Core promise:** "Collect in 60 Minutes" — nationwide same-day dedicated courier, no hubs, no multi-drop
- **Insurance:** £20,000 goods-in-transit (GIT) on every job
- **Drivers:** DBS-vetted
- **Operating model:** Nationwide, NO single depot — drivers positioned across UK hubs
- **⚠️ IMPORTANT — What they do NOT offer:** Live GPS tracking / real-time tracking / tracking links. All such claims were removed for ASA/CMA compliance. They offer: signed digital proof of delivery (POD), driver + vehicle details on dispatch, telephone status updates.

### Tech stack
- **Static HTML** — 22 self-contained `.html` files at root + `blog/`, each with inline `<style>` and inline `<script>`. No external CSS/JS files. No CDN dependencies. No npm/build step.
- **Fonts:** Google Fonts (Outfit for headings, DM Sans for body) via `<link>`
- **Icons:** All inline SVG (no icon fonts, no image assets except `assets/og-image.jpg`)
- **JS:** Vanilla, all inline at bottom of each file. No jQuery, no GSAP, no AOS, no libraries.
- **APIs used:** postcodes.io (postcode autocomplete/validation, no key needed), Google Maps Distance Matrix API (real road distance, requires key)

### File inventory (24 tracked files, excluding `web/`)
```
index.html                          — Homepage (~3000+ lines)
about.html, contact.html, faq.html  — Core pages
trade-accounts.html                 — Trade/custom account applications
same-day-courier.html               — Pillar service page
aog-aviation-courier.html           — AOG/aviation service page
medical-courier.html                — Medical/pharma service page
legal-courier.html                  — Legal document service page
same-day-courier-{london,manchester,birmingham,bristol,leeds,glasgow}.html  — 6 city/SEO pages
privacy-policy.html, terms.html, sitemap.html  — Legal/utility
blog/index.html + 3 posts           — Blog
robots.txt, sitemap.xml             — SEO infrastructure
assets/og-image.jpg                 — Social share image (only static asset)
```

### The `web/` folder (Next.js — DO NOT TOUCH)
Contains an early-stage Next.js 15 / React 19 / Tailwind v4 rebuild. Has shared design tokens in `web/src/app/globals.css`, layout components (SiteHeader, SiteFooter, MobileStickyBar), and `lib/site.ts` (single source of truth for brand/nav/contact). Only a design-system demo page exists — no real content. Out of scope for all work.

---

## 2. DESIGN SYSTEM

### Color palette — "Deep Premium British Logistics"
Defined as CSS custom properties in every page's `:root`:
```
--forest-dark: #121c17   (darkest bg)
--forest: #1c2821         (primary dark / text)
--forest-light: #2d3d34   (mid-green surfaces)
--brass: #9c805c          (decorative accent — FAILS AA for text)
--brass-dark: #7d6547     (AA-pass accent text, 5.21:1 on ivory)
--brass-bright: #bda685   (light accent on dark surfaces)
--ivory: #faf9f6          (page background)
--ivory-deep: #eeebe3     (subtle light section bg)
--warm-stone: #e0dacd     (borders)
--text-main: #1c2821      (body text, 14.51:1 on ivory)
--text-muted: #52625a     (secondary text, ~6.3:1 — was #64736b, darkened in Part S)
--text-light: #a4b2aa     (decorative only, fails AA)
--success: #227845        (phone CTA, confirmations)
--danger: #b33939         (validation errors)
```
**Rule:** brass and brass-bright must NEVER be used for body text — only `brass-dark`. (Documented in Next.js globals.css; applies to static site too.)

### Typography
- **Headings:** Outfit (300-800), bold geometric sans
- **Body:** DM Sans (300-700, optical sizing)
- **Base font-size:** 17px (raised from 16px in Part S for readability)
- **Body line-height:** 1.6-1.7
- Loaded via Google Fonts `<link>`

### Layout
- `.container` max-width: **1280px**, padding `0 1.5rem`
- Sections: `padding: 5rem 0` desktop, `3rem 0` mobile
- Border-radius: 4-6px throughout (sharp, industrial feel)
- Shadows: `--shadow-sm/md/lg` with `rgba(28,40,33,...)` tints
- Default transition: `all 0.25s cubic-bezier(0.4, 0, 0.2, 1)` — BUT navbar now uses targeted `box-shadow, border-color` transition only (Part F3)

---

## 3. COMPLETE WORK HISTORY (20 commits)

### Round 1 — Design system, SEO & creative foundation

**Part B — Accessibility & consistency (commit 1bea2a6):**
- Standardized container max-width to 1280px across all 22 pages (homepage was 1280px, all others were 1200px)
- Added `@media (prefers-reduced-motion: reduce)` to every page — kills all animations for users who request it
- Added `:focus-visible` brass outlines to all interactive elements on every page
- Converted 4 homepage industry cards from `<div onclick>` to semantic `<button>` with `aria-labels`

**Part A — SEO hardening (commit 88e0988):**
- Sitemap: removed `<changefreq>` and `<priority>` (Google ignores both), kept accurate `<lastmod>`
- robots.txt: explicitly allowed GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot (AI visibility)
- Service schema upgrade on all 4 service pages: added `serviceType`, structured `areaServed` (6 cities as City objects), `provider` referencing `@id`, and `url`
- Homepage Organization schema: added `@id` anchor (`#organization`), `logo`, `image`, `contactPoint`, E.164 telephone

**Part C — Creative & animation (commits eeffd3c, af26352, 8f2de64):**
- **Live Dispatch Network Map** (flagship feature): stylized inline-SVG UK map with 6 primary hub dots (Glasgow, Manchester, Leeds, Birmingham, Bristol, London) + 7 secondary coverage points (Edinburgh, Liverpool, Newcastle, Nottingham, Cardiff, Southampton, Reading), animated pulse-rings, dashed route corridors. Section `id="coverage-map"`.
- **Count-up stat animations:** hero stats (60m/£20k/100%) animate 0→value via IntersectionObserver + easeOutCubic
- **Magnetic + glow buttons:** `.magnetic-btn` class with cursor-following radial glow (`--mx/--my` CSS vars) + 4px magnetic pull. On header "Book Online" + CTA "Call" buttons.
- **Staggered card entrances:** `[data-reveal-stagger]` on fleet/services/reviews grids, 60ms stagger fade-up on viewport entry
- **Scroll-drawn timeline:** 4-step "How it works" (Book→Dispatch→Track→Delivered), connecting line draws itself + nodes pop in on scroll. Section `id` not set.
- **Fleet vehicle silhouettes:** replaced 5 wrong/placeholder icons with accurate SVG vehicle outlines (motorcycle, small van, medium van, large LWB, Luton)
- **Carbon estimate:** `co2PerMile` factor per FLEET vehicle, shows kg CO₂ in quote summary
- **City-specific hero motifs:** each of 6 city pages gets a unique decorative SVG skyline (London: Shard/Gherkin/London Eye; Manchester: mills/Beetham Tower; Birmingham: BT Tower/Rotunda; Bristol: Clifton Bridge; Leeds: Bridgewater Place; Glasgow: Armadillo/Hydro) + localized route chips

### Round 2 — Compliance & performance

**Part D — CRITICAL COMPLIANCE (commit 4f138ff):**
- Removed **81 false "live GPS tracking / real-time tracking" claims** across all 22 files. ASA/CMA misleading-advertising risk.
- Replaced with truthful messaging: signed POD, driver + vehicle details on dispatch, direct delivery, telephone updates
- Fixed: index.html (meta, JSON-LD, og, hero lead, timeline step, stat label, map branding), all 4 service pages, all 6 city pages, contact FAQ tease, faq.html Q&A, footer CTAs (~20 pages), blog posts
- Map section rebranded "Live Network" → "Nationwide Network", "drivers positioned right now" → "Drivers positioned across the UK"

**Part F — Performance (commit a0760a9):**
- **F1:** Throttled + passivized scroll listener on all 22 pages (was firing 60×/sec unthrottled, main cause of slow navbar). Wrapped in `requestAnimationFrame` with ticking guard, registered `{ passive: true }`, cached navbar element.
- **F2:** Removed `backdrop-filter: blur(16px)` from navbar on all 22 pages (most expensive CSS property, repaints on every scroll). Replaced with solid translucent `rgba(250,249,246,0.97)`.
- **F3:** Replaced `transition: var(--transition)` (= `all`) on navbar with targeted `box-shadow, border-color` transition.
- **F4:** Stabilized dispatch map — slowed hub-pulse 2.6s→3.8s, route-dash 18s→30s, removed 2 jittery `<animateMotion>` moving courier dots, dimmed route arcs (opacity 0.35→0.22)
- **F5:** Added 7 secondary coverage cities to the map (Edinburgh, Liverpool, Newcastle, Nottingham, Cardiff, Southampton, Reading) as muted static points
- **F6:** Killed infinite shimmer on trade-accounts.html (was `animation: shimmer 3s infinite`, now hover-only 0.8s sweep)

### Round 3 — Navbar redesign & content

**Part G — Navbar redesign (commit 2ccd8f5):**
- Redesigned navbar to premium minimal, unified across all 22 pages
- Reduced to 7 links (removed Trust, merged Services+Sectors→Services): Home, Fleet, Services, Custom, About, FAQ, Contact
- Logo refined (38px forest mark, brass border, brass-dark subtitle)
- Links: uppercase 0.82rem, 0.07em tracking, 2rem gap, centered, brass underline animates width on hover
- Phone demoted from loud green pill → quiet icon-link
- ONE primary "Book Online" button (forest bg, brass border, 6px radius)
- Breakpoint unified at 1024px site-wide
- Homepage keeps slide-in overlay mobile nav; inner pages keep dropdown panel

**Part N+J — Services merge (commit 61e668a, then b36e965):**
- Merged Services + Sectors into ONE section
- 6 service cards, each with TWO buttons: "Get a Quote" (scrolls to wizard + pre-fills) and "Learn More" (links to dedicated service page)
- Deleted the green "Who We Serve" (`#industries`) section entirely + its CSS

**Part E — Ticker replacement (commit 180e1f1):**
- Removed fake "Luton Van dispatched... 2 mins ago" ticker (ASA risk)
- Replaced with honest trust strip: 4 value-props with icons + newsletter signup
- `subscribeNewsletter()` updated to handle both footer + strip inputs

**Part M — AEO answer blocks (commit db8ee1c):**
- Added 25-50 word answer-block intros after H1 on all 4 service pages + 6 city pages
- Definition pattern loaded with specific numbers (60-minute collection, £20k insurance, DBS-vetted)
- Tactic from `geo-content-optimizer` skill (aaron-marketing-skills repo)

**Parts I, K1, K2, L1, K3 (commit 26f37eb, aac5349):**
- Footer "Coverage Hubs" → "Special Coverage" + "View coverage map ↑" link
- Contact page: blank iframe → branded SVG coverage map
- Sticky floating WhatsApp button on all 22 pages
- FAQ teaser section on homepage

### Round 4 — Bug fixes, readability, Maps

**Part P — Critical bug fixes (commit 9796e89):**
- Logo `href="/"` → `href="index.html"` (was opening C:\ directory listing on local file)
- "View coverage map" link: `#industries` → `#coverage-map` (added id to map section)
- Contact map: misleading London-only Google embed → branded SVG coverage map

**Part Q — Navbar renames (commit 93f41a4):**
- "Our Fleet" → "Fleet", "Trade Accounts" → "Custom" across all 22 pages

**Part R — Services merge v2 (commit b36e965):**
- 6 service cards each with "Get a Quote" + "Learn More" buttons
- Deleted green sectors section + dead CSS
- Card copy rewritten in customer-benefit voice

**Part S — Readability overhaul (commits e569255, 5442a1a):**
- S1: Fixed invisible step numbers — `.step-number` was `var(--brass-border)` (1.31:1 contrast) → `var(--brass-bright)` (6.5:1)
- S2: Darkened `--text-muted` from `#64736b` (4.74:1) → `#52625a` (~6.3:1) on 19 pages
- S3: Raised base font 16px → 17px, bumped 0.9rem component sizes to 1rem
- S4: Collapsed 120-postcode-tag grids into grouped districts (6-8 clean cards), removed redundant "Services Available" grids from city pages
- S5: Rewrote city intros in customer-benefit voice ("Your parcel leaves..." not "We dispatch..."), killed AI-slop openers

**Part H — Google Maps Distance Matrix (commit 499436d):**
- `calculateTransitQuote()` now async — calls Google Distance Matrix API for real road miles + drive time
- Caches results per postcode-pair (`_distanceCache`)
- Graceful fallback: if API fails/missing, uses improved Haversine (1.3x road factor)
- Split into `renderQuoteResult()` (real data), `renderQuoteResultHaversine()` (fallback), `buildWhatsAppLink()`
- Fixed `recommendVehicle()` bug: >1200kg now shows "Call us for specialist vehicle" instead of recommending unusable large_van
- Weight input max capped at 1200
- **API key at line 1970 of index.html** — currently returns REQUEST_DENIED because user hasn't enabled Distance Matrix API in Google Cloud yet (they just enabled it; key needs restriction)

**Part T — Security pass:**
- API key documented with restriction strategy in code comments
- Audit found: no leaked file paths, no hosting hints, no TODO/FIXME comments, no hardcoded secrets (the `token` vars in postcode autocomplete are JS race-condition counters, not auth tokens)
- No code changes needed beyond the documentation already added

---

## 4. THE QUOTE WIZARD (index.html)

The standout feature. A 4-step calculator in the hero section (`#quote-container`):

1. **Route Selection:** Two postcode inputs with postcodes.io autocomplete + validation. `fetchPostcodeSuggestions()` and `fetchPostcodeDetails()` with race-condition guards (`suggestionTokens`, `validationTokens`).
2. **Cargo & Vehicle:** Weight input (1-1200kg) + cargo type dropdown. `recommendVehicle()` auto-recommends based on weight + cargo type. `renderVehicleSelector()` renders vehicle tiles, disables those below capacity.
3. **Contact:** Name, phone (UK regex validation), email, company.
4. **Quote Reveal:** Shows distance, duration, vehicle, price, CO₂ estimate, insurance, + WhatsApp deep link + call button.

**Key config (index.html ~line 1960-1975):**
```js
const GOOGLE_SHEETS_WEBHOOK_URL = "";  // EMPTY — forms transmit nothing yet
const GOOGLE_MAPS_API_KEY = "AIzaSy...";  // Key present, needs restriction
const POSTCODES_API_BASE = "https://api.postcodes.io/postcodes";
```

**⚠️ The webhook URL is empty** — forms (quote wizard, contact, trade, newsletter) show fake success states but transmit nothing. This is the biggest known gap. User deferred database/backend/email to a later phase.

---

## 5. REPOSITORIES & SKILLS USED

### Repositories researched for inspiration
| Repo | URL | What we took from it |
|---|---|---|
| **ui-ux-pro-max-skill** | github.com/nextlevelbuilder/ui-ux-pro-max-skill | Motion duration tiers (150ms micro / 300ms standard / 500ms emphasis), named easing curves, 4px spacing grid, `prefers-reduced-motion` mandatory, WCAG AA minimum |
| **nexu-io/open-design** | github.com/nexu-io/open-design | Linear reference: one bold accent on restrained base, ultra-minimal motion, dark-mode precision. Lesson: brass should be used sparingly, only for CTAs/active states |
| **aaron-marketing-skills** | github.com/aaron-he-zhu/aaron-marketing-skills | `geo-content-optimizer` (AEO answer blocks — applied), `serp-markup-builder` (schema validation), `technical-seo-checker` (9-step baseline). Ignored the 120-skill "operating system" — agency bloat. |
| **AgricIDaniel/claude-seo** | github.com/AgricIDaniel/claude-seo | 25 sub-skills covering technical/content/schema/local SEO. Confirmed our Swap Test approach, Service schema pattern, title-tag rules. |
| **dietrichgebert/ponytail** | github.com/dietrichgebert/ponytail | Code minimalism discipline: "trust-boundary validation, security, accessibility are never on the chopping block." Applied to our security pass. |
| **GeoCommunity Top 10 SEO Skills** | thegeocommunity.com/.../top-10-seo-skills-github-stars | Ranked SEO skill repos. Confirmed our stack is ideal (static HTML = easiest SEO). Key finding: Google retired FAQ rich results 2026-05-07 for non-gov/health sites. |

### What was REJECTED (with reasons)
- **`@formkit/auto-animate` CDN** (Claude's suggestion) — rejected. Breaks the zero-dependency principle. Wizard already transitions with CSS.
- **`llms.txt`** — Google confirmed ineffective. Not added.
- **FAQ rich-result promises** — Google retired these 2026-05-07. Schema kept for AEO value only.
- **The full 120-skill aaron-marketing "operating system"** — agency bloat. Only 3 skills used.
- **Paid connectors** (DataForSEO, Ahrefs) — not needed. Free paths (GSC, PageSpeed Insights, Rich Results Test) suffice.

### How agents were used
The work was done with `Explore` subagents for research/investigation and direct edits for implementation:
- **Read-only research agents** investigated: codebase structure, broken buttons, SEO page quality, false GPS claim locations, navbar design problems, readability audit, city page word counts, quote wizard logic, contact page issues, coverage sections
- **WebFetch/WebSearch** researched: UI/UX repos, SEO skill repos, 2026 logistics design trends, competitor analysis (Royal Mail, DPD, Strider, Collect Same Day)
- All implementation was done directly (Edit/Bash tools), committed per-part

---

## 6. SEO STATUS & STRATEGY

### What's done
- **Titles:** All 50-65 chars, keyword-first, brand-last. ✅
- **JSON-LD:** Organization + LocalBusiness + Service + BreadcrumbList + FAQPage (schema only, not for SERP) on appropriate pages. ✅
- **Schema validation:** All JSON-LD parses cleanly (verified). ✅
- **Sitemap:** Clean XML, accurate lastmod, referenced in robots.txt. ✅
- **robots.txt:** Allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot). ✅
- **Canonical tags:** Self-referencing on every page. ✅
- **Heading hierarchy:** Exactly one H1 per page, no skipped levels. ✅
- **AEO answer blocks:** On all service + city pages. ✅
- **City page Swap Test:** Passes (~64% unique content per city). ✅
- **Service schema:** `serviceType`, `areaServed` (6 cities), `provider` `@id`, `url`. ✅

### SEO tools to use (all free)
- **Google Search Console** — rank/impression truth source. Submit sitemap.
- **PageSpeed Insights** — Core Web Vitals (LCP <2.5s, INP <200ms, CLS <0.1)
- **Rich Results Test** — validate JSON-LD
- **Manual incognito checks** for 6 city terms + "AOG courier"

### SEO truth: what NOT to do
- Don't promise FAQ rich snippets (retired 2026-05-07)
- Don't add `llms.txt` (Google confirmed ineffective)
- Don't chase keyword density (diminishing returns after 1-2 mentions)
- Don't use `<priority>`/`<changefreq>` in sitemap (Google ignores them)

---

## 7. PENDING & FUTURE WORK

### Immediate (blocked on user)
1. **Restrict the Google Maps API key** — In Google Cloud Console: Application restriction = HTTP referrer (`https://samedayexpresscouriers.co.uk/*` + `https://*.samedayexpresscouriers.co.uk/*`), API restriction = Distance Matrix API only. For local testing also add `http://localhost/*`. Remove localhost referrer after deployment.
2. **The current API key is EXPOSED** (was pasted in chat). User must rotate it (delete old, create new, restrict it, paste into index.html line ~1970).
3. **Distance Matrix API** was just enabled by the user but the key may still return REQUEST_DENIED until restrictions are properly set. The Haversine fallback handles this gracefully.

### Next development phase (user's stated future goals)
1. **Database + backend** — forms currently transmit nothing. User wants a database (likely Postgres or Google Sheets webhook) to capture leads from the quote wizard, contact form, trade account form, and newsletter.
2. **Google Analytics** — not yet installed.
3. **Domain connection + deployment** — `samedayexpresscouriers.co.uk` is not yet pointed at the site. Will need hosting (Netlify/Vercel/Cloudflare Pages recommended for static). All hardcoded URLs in schema/canonicals/sitemap already reference the domain.
4. **HTTPS** — needed for the final domain.
5. **Google Business Profile** — per-location GBP listings for local SEO (claude-seo skill recommends this as #1 local pack factor).

### Known gaps (noted, not bugs)
- `GOOGLE_SHEETS_WEBHOOK_URL = ""` — forms fake success, transmit nothing
- `preFillCityRoute()` function exists but is dead code (no caller)
- `preFillSector()` function still exists but the sector cards that called it were deleted (harmless)
- The `console.log` statements in lead transmission are dev-only (note for production)
- City pages still ~3,300 raw words (includes CSS/JS/SVG); visible prose is much less after cuts
- `#industries` anchor was deleted with the sectors section — any external links to it will 404 (low risk)

---

## 8. ARCHITECTURE NOTES FOR AI AGENTS

### How the codebase is structured
- **No shared CSS/JS files.** Every HTML page is fully self-contained with its own `<style>` and `<script>`. This means: (a) design token changes must be applied per-file, (b) navbar/footer markup is duplicated across all 22 pages, (c) the `web/` Next.js folder is the eventual solution to this duplication.
- **Cross-page edits** were done with Python scripts (sed-style replacements) committed alongside the changes. These scripts were temporary and deleted after use.
- **The homepage (index.html) is the most complex file** (~3000+ lines) with the quote wizard, dispatch map, motion system, timeline, and all sections. Inner pages are ~500-1000 lines.
- **All JS is vanilla** — IntersectionObserver for reveals/count-up, fetch for postcodes.io + Google Maps, requestAnimationFrame for scroll throttling. No libraries.

### Key JS functions in index.html
- `calculateTransitQuote()` — async, calls Google Distance Matrix, caches results, falls back to Haversine
- `renderQuoteResult()` / `renderQuoteResultHaversine()` / `buildWhatsAppLink()` — quote rendering
- `recommendVehicle(weight)` — vehicle recommendation logic (fixed for >1200kg)
- `fetchPostcodeSuggestions()` / `fetchPostcodeDetails()` — postcodes.io integration
- `handleWeightChange()` / `handleCargoChange()` — step 2 handlers
- `validateStep1/2/3()` — per-step validation
- `changeStep()` / `showPane()` — wizard navigation
- `selectVehicle()` / `preFillService()` — pre-fill hooks from fleet/services sections
- `subscribeNewsletter()` / `showNewsletterSuccess()` — newsletter (footer + strip)
- Motion system IIFE: IntersectionObserver reveals, count-up, magnetic buttons

### CSS class conventions
- `.section-dark` / `.section-ivory` — background variants
- `.bg-stone` / `.bg-dark` / `.noise-bg` — additional backgrounds
- `.service-card` / `.fleet-card` / `.feature-card` / `.review-card` — card types
- `.dispatch-map-*` — coverage map section
- `.city-hero-*` — city page hero sections
- `.answer-block` — AEO answer intros
- `.wa-float` — sticky WhatsApp button
- `.trust-strip-*` — value-prop + newsletter strip
- `[data-reveal]` / `[data-reveal-stagger]` — motion system hooks
- `.magnetic-btn` — cursor-following glow buttons

---

## 9. USER PREFERENCES & COMMUNICATION STYLE

The user (Abdullah) has expressed these preferences across the conversation:
- **Ruthless honesty** — wants to know if something will hurt scalability or lead generation
- **Customer-benefit voice** — content should make the customer feel THEY are winning ("you get a loophole/deal"), not the company
- **Short, punchy content** — no walls of text, no "AI slop," no generic marketing filler
- **Premium feel** — the forest/brass/ivory palette is the brand moat vs competitors (Royal Mail, DPD, Strider)
- **No fake data** — removed all fabricated live dispatch jobs, GPS tracking claims
- **Performance matters** — flagged slow navbar, heavy animations as unacceptable
- **Vanilla stack** — no dependencies, no build step. This is intentional for simplicity.
- **Security conscious** — wants API keys protected, no exposed internals

---

## 10. QUICK REFERENCE — WHAT TO DO NEXT

If you're a new AI agent picking up this project:

1. **Read this file fully** (you just did ✅)
2. **Check `git log --oneline`** to see the 20 commits
3. **Don't touch `web/`** unless explicitly asked
4. **The API key at index.html:1970 needs rotation + restriction** — remind the user if they haven't done it
5. **Forms transmit nothing** — `GOOGLE_SHEETS_WEBHOOK_URL = ""` — this is the next big feature gap
6. **All GPS tracking claims are gone** — do NOT re-add any "live tracking" / "real-time tracking" language
7. **Static HTML means per-file edits** — use Python scripts for cross-page consistency changes
8. **Test locally** with `python -m http.server 8000` then open `http://localhost:8000`
9. **Commit per-part** with descriptive messages

---

*End of PROGRESS.md. This file should be updated whenever significant work is done.*
