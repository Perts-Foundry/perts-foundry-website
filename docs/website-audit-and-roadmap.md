# Perts Foundry Website: Audit & Roadmap

> **Last updated:** 2026-04-03
> **Reference:** `docs/building-a-credible-solo-devops-consulting-website.md`
> **Visual research:** `docs/archive/visual-enhancement-research.md`

This document tracks every gap between the current website and a credible, launch-ready MVP for a solo DevOps consulting business. Items are prioritized and meant to be worked through over time. Mark items `[x]` as they are completed.

---

## What's Already Strong

No changes needed in these areas.

| Area | Status | Notes |
|------|--------|-------|
| Case studies | Exceeds (10 vs. 2-3 minimum) | Anonymized, specific metrics, industry identifiers, deep technical detail, consistent structure |
| Service page quality | Strong | The Problem / The Outcome / Technologies / What an Engagement Looks Like. Outcome-framed |
| Domain and email | Complete | pertsfoundry.com (.com), contact@pertsfoundry.com (domain-matched) |
| Technical infrastructure | Exceeds | SSL, Hugo on Cloudflare Workers, CDN, minification, responsive images, lazy loading |
| Security | Exceeds | CSP, X-Frame-Options, Permissions-Policy, Gitleaks in CI, AI bot blocking |
| Accessibility | Exceeds | WCAG 2.1 AA, 27-page pa11y-ci in CI, dedicated page, custom layouts for alt text |
| CI/CD validation | Exceeds | 10 automated PR checks (Vitest, Hugo build, homepage smoke test, inner page smoke test, htmltest, pa11y-ci, markdownlint, Prettier, actionlint, Gitleaks) |
| Contact process | Exceeds | Contact form (Workers + Resend + Turnstile), Cal.com scheduling link, email fallback, "What to Expect" steps, response time commitment |
| SEO fundamentals | Good | Sitemap, robots.txt, meta descriptions on all pages, proper permalinks |

---

## Critical (MVP Blockers)

These actively damage credibility or are red flags per the guide. Must fix before launch.

### C1. About page has no real person

- [x] Add professional headshot image
- [x] Add founder's real name, background, credentials (AWS SA Pro, prior AWS CSE role)
- [x] Rewrite in first-person ("I") voice
- [x] Add "Why I do this work" section ("The Foundry")
- [x] Add personal touch (interests, values)
- [x] Update `config/_default/languages.en.toml` author name to "Seth Perts"
- [x] Configure `author.image` and `author.headline` in `languages.en.toml`

**Why it matters:** The guide calls this "non-negotiable" and "the single biggest red flag that signals a shell company."

**Resolved 2026-03-27:** About page rewritten with founder bio, headshot, credentials, Results section, and "The Foundry" philosophy section.

**Files:** `content/about/index.md`, `config/_default/languages.en.toml`, new headshot image

---

### C2. Blog with one stale post hurts credibility

- [x] Set `showRecent = false` in `config/_default/params.toml`
- [x] Remove Blog from nav menu in `config/_default/menus.en.toml`
- [x] Set existing post to `draft: true` in `content/blog/placeholder-first-post/index.md`
- [ ] (Future) Write 3-5 evergreen articles when ready to re-enable

**Why it matters:** The guide states "a blog with one stale post from six months ago actively hurts your credibility more than having no blog at all."

**Resolved 2026-03-27:** Blog disabled (nav removed, post drafted, homepage recent section hidden).

**Files:** `config/_default/params.toml`, `config/_default/menus.en.toml`, `content/blog/placeholder-first-post/index.md`

---

### C3. No privacy policy

- [x] Create `content/privacy/index.md` with simple policy
- [x] Add footer menu entry in `config/_default/menus.en.toml`

**Why it matters:** Enterprise procurement teams expect a privacy policy in the footer.

**Resolved 2026-03-27:** Privacy policy added covering Cloudflare Web Analytics, no cookies, data rights, and third-party disclosure. Footer link at weight 20.

**Files:** `content/privacy/index.md`, `config/_default/menus.en.toml`

---

### C4. Cloudflare Web Analytics: enable, configure, and utilize

- [x] Create Cloudflare Web Analytics site in dashboard (get accountTag and token)
- [x] ~~Uncomment and populate `[analytics.cloudflare]` in `config/production/params.toml`~~ Not needed; zone-based auto-injection handles beacon delivery
- [x] Verify analytics beacon loads on production after deploy
- [x] Review Cloudflare Web Analytics dashboard features (top pages, referrers, browsers, countries, Core Web Vitals)
- [x] Establish a baseline review cadence (e.g., weekly or monthly check-in)
- [x] Identify which metrics matter most for a consulting site (page views on services/case studies, contact page visits, referral sources)

**Why it matters:** Zero visibility into whether anyone visits the site or which pages they view. Without analytics, every other marketing or content decision is guesswork.

**Resolved 2026-04-03:** Cloudflare Web Analytics enabled via zone-based auto-injection (dashboard toggle). EU visitor data excluded. No code changes required; Cloudflare's edge injects the beacon into HTML responses automatically. The commented `[analytics.cloudflare]` config in `params.toml` was removed (Blowfish has no Cloudflare analytics integration; it supports Fathom, GA, Umami, and Seline only).

**Files:** `config/production/params.toml` (comment updated), Cloudflare dashboard (Web Analytics)

---

## High Priority

Significant gaps that meaningfully weaken the site. Address soon after launch.

### H1. ~~Too many services (9 listed; guide recommends 3-5)~~ Closed

- [x] Decide on consolidation strategy: **keep all 9**. An exhaustive list is preferred over consolidation.

**Resolved 2026-04-03:** Decision made to keep all 9 services. The breadth reflects actual capability and the exhaustive listing is intentional.

---

### H2. Homepage missing key credibility elements

- [x] Add aggregate metrics from case studies
- [x] Add or duplicate the 4-step engagement process
- [x] Add certification badge images (see M2)
- [x] Configure `author.image` and `author.headline` in `languages.en.toml`
- [ ] Plan testimonial placement (add when collected)
- [x] Add JSON-LD structured data (Organization on homepage, Service on service pages; completed under M6. HowTo deferred)

**Why it matters:** The guide prescribes certification badges, testimonials, "How I Work" section, and specific metrics.

**Partially resolved 2026-03-30:** Custom multi-section homepage with metrics band ($125K+, 200+, Zero), 4-step "How We Work" process timeline, tech trust bar, services grid, featured case studies, and dual CTAs. Certification badge images added 2026-04-03 (see M2). Remaining: testimonials.

**Files:** `content/_index.md`, `data/metrics.toml`, `data/process.toml`, `data/technologies.toml`, `data/certifications.toml`, `layouts/partials/homepage/`, `assets/img/badges/`

---

### H3. Contact page lacks form and scheduling link

- [x] Add Cal.com booking link
- [x] Add contact form (Cloudflare Workers + Resend)
- [x] Update CSP for Turnstile (`challenges.cloudflare.com` in `script-src` and `frame-src`)

**Why it matters:** The guide specifies three elements: form, scheduling link, professional email. Currently only email and GitHub are offered.

**Resolved 2026-03-28:** Contact form with Turnstile CAPTCHA and Resend email delivery. Cal.com scheduling link (standalone, no Proton Calendar connection). Worker handles POST /api/contact with validation, honeypot, rate limiting, and graceful degradation when secrets are not yet configured.

**Files:** `src/worker.js`, `wrangler.toml`, `layouts/contact/simple.html`, `layouts/partials/extend-head-uncached.html`, `content/contact/index.md`, `assets/css/custom.css`, `config/_default/params.toml`

---

### H4. ~~Social media links strategy~~ Resolved

- [x] Decide on LinkedIn approach: skip LinkedIn entirely
- [x] Evaluate personal visibility and privacy tradeoffs for each option
- [x] Add chosen social links to `author.links[]` in `languages.en.toml`
- [x] Consider GitHub org link as a low-risk starting point (no personal exposure)

**Why it matters:** Enterprise procurement teams cross-reference website claims against LinkedIn and other social profiles. Social presence decisions must be weighed against personal privacy preferences.

**Resolved 2026-04-03:** Decision: GitHub org only, no LinkedIn (privacy preference). Added `{ github = "https://github.com/Perts-Foundry" }` to `author.links[]` (emits `<link rel="me">` on all pages). Removed "Other Ways to Reach Us" card from contact page: plaintext email was a spam/scraping target, and GitHub is not a contact method. Email retained only in form error fallback for graceful degradation. Cleaned up orphaned `.contact-links` CSS.

**Files:** `config/_default/languages.en.toml`, `layouts/contact/simple.html`, `assets/css/custom.css`

---

## Medium Priority

Strengthen positioning. Address in subsequent iterations.

### M1. HSTS max-age is 300 seconds (should be 31536000)

- [x] Change `max-age=300` to `max-age=31536000` in `static/_headers`
- [x] Add `preload` directive
- [x] Migrate security headers from `static/_headers` to Terraform Transform Rules

**Resolved 2026-03-27:** HSTS set to `max-age=31536000; includeSubDomains; preload`.

**Updated 2026-04-03:** Discovered that `static/_headers` was never applied by Workers Static Assets (verified via Cloudflare Access service token bypass). All security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-Content-Type-Options, X-XSS-Protection) and path-specific Cache-Control rules migrated to Cloudflare HTTP Response Header Modification Transform Rules, codified in Terraform in the [infrastructure repo](https://github.com/Perts-Foundry/infrastructure). The `static/_headers` file was removed. CSP `connect-src` updated to include `https://cloudflareinsights.com` for analytics beacon data reporting.

**Files:** `cloudflare.tf` in infrastructure repo (`cloudflare_ruleset.com_response_headers`)

---

### M2. ~~No certification badges displayed visually~~ Resolved

- [x] Source badge images (AWS SA Pro, Terraform, etc.)
- [x] Add to homepage and About page
- [x] Consider reusable Hugo shortcode/partial

**Resolved 2026-04-03:** Official Credly badge images (AWS SA Professional, AWS SA Associate, Terraform Associate) displayed on both the homepage (new certifications section between metrics and services) and the about page. Images stored in `assets/img/badges/` for Hugo image processing. A shared partial (`layouts/partials/certification-badges.html`) is called by both a `certification-badges` shortcode (about page) and the homepage section partial. Data driven from `data/certifications.toml`.

**Files:** `assets/img/badges/*.png`, `data/certifications.toml`, `layouts/partials/certification-badges.html`, `layouts/shortcodes/certification-badges.html`, `layouts/partials/homepage/certifications.html`, `layouts/partials/home/custom.html`, `content/about/index.md`, `assets/css/custom.css`

---

### M3. "We" vs "I" voice not using recommended hybrid

- [ ] Switch About page to first-person (addressed by C1)

Resolved by the About page rewrite. "We" on other pages reads as professional company voice once a real person is identified on About.

---

### M4. Homepage "Recent" section has misleading "Show More" destination

- [x] Set `showRecent = false` and change `showMoreLinkDest` to `/case-studies/`

**Resolved 2026-03-27:** Recent section disabled (`showRecent = false`), `showMoreLink = false`, destination changed to `/case-studies`.

**Files:** `config/_default/params.toml`

---

### M5. ~~22 pages suppress `color-contrast` in pa11y-ci~~ Partially resolved

- [x] Identify which failures come from shared Blowfish theme components (nav, footer, hero) vs. custom CSS
- [x] Fix theme-level contrast issues centrally (shared component overrides)
- [ ] Remove `"ignore": ["color-contrast"]` from pages as they pass

**Partially resolved 2026-04-03:** Real contrast issues fixed in CSS: `.tech-bar-heading` (`neutral-500` to `neutral-400`/`600`), `.px-2.text-primary-500` middot separators (new `!important` override to `primary-400`/`700`), numbered-steps circles (semi-transparent to opaque composited colors), `background-color` fallbacks on gradient-border buttons and tech labels. `hideElements` cleaned: removed `.px-2.text-primary-500` (now CSS-fixed); retained `svg text` (SVG internals), `.inline-block.rtl:rotate-180` (pagination arrows, axe indeterminate), `.homepage-hero-sub` (gradient-clipped text). 5 pages unsuppressed (services listing, blog listing, case studies listing, contact, privacy). 22 pages still suppress `color-contrast` but all remaining failures are `needsFurtherReview` false positives from axe-core's inability to resolve backgrounds through Blowfish's TOC flex layout, not real contrast failures.

**Files:** `.pa11yci`, `assets/css/custom.css`

---

### M6. SEO optimization audit

- [x] Audit current meta descriptions across all pages for keyword targeting and length (150-160 chars)
- [x] Review page titles for keyword placement and consistency
- [x] Add Organization JSON-LD schema to homepage and Service JSON-LD to service pages
- [x] Set `defaultSocialImage` in `params.toml` so all pages have OG images when shared (supersedes L2)
- [x] Regenerate homepage OG image (current `og-homepage.png` shows old "Ship faster..." tagline instead of "Build. Scale. Own.")
- [x] Review internal linking strategy (do service pages link to relevant case studies and vice versa?)
- [ ] Set up Google Search Console (verify via DNS TXT, submit sitemap)
- [ ] Evaluate whether page load performance (Core Web Vitals) needs attention via PageSpeed Insights
- [ ] Consider adding `alt` text audit for all images across the site
- [x] Add FAQ sections to service pages (3-5 questions each) with FAQPage JSON-LD
- [ ] Write 2-3 technical blog posts extracted from case study material (re-enable blog when ready)
- [x] Expand service page content to 500+ words (FAQ sections push all pages to ~700+ words)
- [x] Add DNS-prefetch hints for external domains (challenges.cloudflare.com, cal.com)
- [x] Enable Blowfish `showRelatedContent` for tag-based cross-linking between services and case studies

**Partially resolved 2026-04-03:** Meta descriptions audited and fixed (4 short descriptions expanded, 4 long case study descriptions trimmed). Service page titles updated to include "Consulting" keyword. Tags added to all 9 service pages. Organization JSON-LD added to homepage, Service JSON-LD added to all service pages via `extend-head-uncached.html`. `defaultSocialImage` set to logo fallback. Internal cross-links added between all 9 service pages and 10 case studies (bidirectional). Single site-wide OG image regenerated 2026-04-04 via `scripts/generate-og.js` (1200x630, logo + "Build. Scale. Own." tagline) at `assets/img/og-default.png`.

**Updated 2026-04-04:** FAQ sections with FAQPage JSON-LD added to all 9 service pages (3-4 questions each, consulting-oriented buyer questions). FAQ shortcode (`{{< faqs >}}`) uses native `<details>/<summary>` accordion. DNS-prefetch hints added for cal.com and challenges.cloudflare.com. Related content enabled (`showRelatedContent = true`, `relatedContentLimit = 3`) for tag-based cross-linking. Remaining: Google Search Console setup, blog posts.

**Files:** Content front matter across `content/`, `config/_default/params.toml`, `layouts/partials/extend-head-uncached.html`, `layouts/shortcodes/faqs.html`, `assets/css/custom.css`, `assets/img/og-default.png`

---

### M7. Review AI-related marketing and messaging

- [ ] Audit all content pages for AI/automation messaging and positioning
- [ ] Evaluate whether current AI references align with market positioning and target audience expectations
- [ ] Review service descriptions for AI/ML-adjacent language (DevOps automation, intelligent pipelines, etc.)
- [ ] Decide on desired AI narrative: lean into it, keep it neutral, or minimize it
- [ ] Update copy across affected pages based on the decision
- [ ] Ensure consistency of AI messaging between homepage, services, case studies, and about page

**Why it matters:** AI positioning in the DevOps/cloud consulting space is evolving rapidly. The messaging should reflect a deliberate strategy rather than inherited phrasing from initial content creation.

**Files:** `content/` (multiple pages), `content/_index.md` (homepage front matter)

---

## Low Priority / Nice-to-Have

### L1. No structured data / JSON-LD

- [x] Enable breadcrumb structured data (`enableStructuredBreadcrumbs = true`)
- [x] Add Organization schema via `layouts/partials/extend-head-uncached.html` (completed under M6)

### L2. ~~No custom Open Graph images~~ Resolved

- [x] Set `defaultSocialImage` fallback in `params.toml` (superseded by M6; uses logo as interim)
- [x] Create proper 1200x630px default OG image for link previews

**Resolved 2026-04-04:** Single branded 1200x630 OG image (logo + "Build. Scale. Own." tagline on dark gradient) used site-wide. `scripts/generate-og.js` generates `assets/img/og-default.png`, served by Blowfish's `defaultSocialImage` fallback via `resources.Get`. Homepage `images` front matter removed (was redundant with the fallback and caused duplicate `og:image` tags).

**Files:** `assets/img/og-default.png`, `scripts/generate-og.js`

### L3. Blog post directory naming

- [ ] Rename `content/blog/placeholder-first-post/` to `content/blog/infrastructure-as-code/`

### L4. Self-authored quote on About page

- [ ] Remove, attribute as personal philosophy, or replace with real testimonial (addressed by C1)

### L5. No testimonials

- [ ] Collect real testimonials from clients
- [ ] Plan placement on homepage and About page

### L6. Review CSS light mode override organization

- [ ] Revisit `assets/css/custom.css` structure if file exceeds ~500 lines

Currently ~45 `html:not(.dark)` light mode rules are co-located with their dark mode counterparts throughout the file (~1,860 lines). The file has significantly exceeded the ~500-line threshold. Consider splitting into separate files (`_homepage.css`, `_contact.css`, `_global.css`) via Hugo `resources.Concat` if it grows further.

**Files:** `assets/css/custom.css`

### L7. pa11y-ci runs only in dark mode

- [ ] Add a second pa11y-ci pass that toggles to light mode before checking
- [ ] Use pa11y's `actions` feature to run `document.documentElement.classList.remove('dark')` before each URL check

The site defaults to dark mode, so pa11y-ci only validates dark mode contrast and accessibility. Light mode has zero automated coverage. Consider testing at least the contact page, homepage, and one service/case study page in light mode initially.

**Files:** `.pa11yci`, `.github/workflows/validate.yml`

### L8. ~~Investigate pa11y `hideElements` suppression~~ Resolved

- [x] Determine what `.px-2.text-primary-500` and `.inline-block.rtl\:rotate-180` target
- [x] If issues are color-contrast only, switch to per-page `ignore` rules instead of global `hideElements`

**Resolved 2026-04-03:** `.px-2.text-primary-500` targeted Blowfish article-meta middot separators (6 vendor partials). Fixed via CSS override with `!important` and removed from `hideElements`. `.inline-block.rtl:rotate-180` targeted pagination arrows; retained in `hideElements` because axe-core returns indeterminate results (not a real contrast failure). Added `.homepage-hero-sub` (gradient-clipped text, genuinely untestable). Current `hideElements`: `svg text, .inline-block.rtl:rotate-180, .homepage-hero-sub`.

**Files:** `.pa11yci`, `assets/css/custom.css`

---

## Visual Bugs (from live dev server review)

### V-Bug-1. Word counts display on service and case study listing cards

- [x] Hide word count metadata ("289 words") from listing cards

**Details:** `showReadingTime: false` in the cascade does not prevent word count from appearing in the `article-link/simple.html` template. "289 words" next to "Cloud Infrastructure" is developer metadata that should not be visible to consulting prospects.

**Resolved 2026-03-27:** Added `showWordCount = false` to `[article]` in `config/_default/params.toml`.

**Files:** `config/_default/params.toml`

---

### V-Bug-2. Services and case studies listing cards show no descriptions

- [x] Surface front matter `description` field on listing cards

Every service and case study has a `description` in front matter, but only titles (and word counts) render on listing pages. Visitors must click through each item to learn what it covers.

**Resolved 2026-03-27:** Added `{{ else if .Description }}` fallback block to `article-link/simple.html` template override. Descriptions now render on all 9 service and 10 case study listing cards.

**Files:** `layouts/partials/article-link/simple.html`

---

## Visual Enhancement Roadmap

See `docs/archive/visual-enhancement-research.md` for detailed research with techniques, implementation guidance, and browser support.

### Tier 1: Quick Wins (CSS-only)

- [x] **V1. Micro-interactions** on cards, buttons, links (hover lift, shadow, scale, glow)
- [x] **V2. Dark mode glow accents** using blue/violet palette (box-shadow, gradient borders)
- [x] **V3. Fluid typography** for hero headings (`clamp()`)
- [x] **V4. Fix word count display** on listing pages (V-Bug-1 above)

### Tier 2: Medium Effort (CSS + minimal JS)

- [x] **V5. Scroll-reveal animations** (IntersectionObserver + CSS transitions, `data-reveal` and `data-reveal-stagger` attributes)
- [x] **V6. Technology logo wall** (text pill trust bar; CSS marquee with SVG logos deferred)
- [x] **V7. Animated metric counters** (easeOutCubic counter with `data-counter`/`data-target` attributes)
- [x] **V8. Process timeline** ("How We Work" 4-step grid with icons and numbered steps)
- [x] **V9. Custom homepage layout** (Blowfish `custom` layout, 8-section landing page)
- [ ] **V10. Glassmorphism service cards** (`backdrop-filter: blur()`)

### Tier 3: Differentiation

- [x] **V11. Animated hero background** (CSS gradient mesh with `heroGradientShift` keyframes, paused off-screen via IntersectionObserver)
- [x] **V12. Enhanced case study presentation** (partially complete: scroll reveals, metadata card, table styling implemented; animated metrics deferred)
- [ ] **V13. Section-specific color theming** (repurpose existing Forge Blue/Ember/Violet schemes)
- [ ] **V14. SVG technology icon animations** (draw-on effects triggered on scroll)

### Tier 4: Ambitious

- [ ] **V15. 3D particle network hero** (Three.js, interactive on mouse)
- [ ] **V16. Full scrollytelling homepage** (GSAP ScrollTrigger, pinned sections)
- [ ] **V17. Kinetic typography** (staggered word/letter reveals on hero)

---

## MVP Summary

The minimum changes to pass the "is this person legit?" test:

| # | Change | Impact | Effort |
|---|--------|--------|--------|
| 1 | Rewrite About page (C1) | "Anonymous company" to "real consultant" | Medium |
| 2 | Disable blog (C2) | Removes active credibility damage | Low |
| 3 | Add privacy policy (C3) | Closes procurement checklist gap | Low |
| 4 | Enable analytics (C4) | Enables measuring effectiveness | Low |
| 5 | Decide on social links strategy (H4) | Enables cross-referencing (if pursued) | Medium |
| 6 | HSTS max-age to 1 year (M1) | Security header fix | Trivial |

---

## Post-Launch Tasks

Tasks to complete after removing Cloudflare Access and making the site public.

### Security

- [ ] Submit `pertsfoundry.com` to [hstspreload.org](https://hstspreload.org/) for HSTS preload list inclusion (currently eligible; `preload` directive is set)
- [ ] Monitor browser console for CSP violations during the first week of public traffic (especially contact page with Turnstile and analytics beacon)
- [ ] Verify `/api/contact` responses include security headers from Transform Rules (not just static asset responses)

### Analytics

- [ ] Confirm Cloudflare Web Analytics dashboard shows traffic from public visitors (not just authenticated Access sessions)
- [ ] Identify baseline metrics for consulting site KPIs: service/case study page views, contact page visits, referral sources

### SEO

- [ ] Set up Google Search Console: verify pertsfoundry.com via DNS TXT record, submit sitemap, request indexing of key pages
- [ ] Run PageSpeed Insights on pertsfoundry.com and confirm Core Web Vitals are green
- [x] Regenerate homepage OG image with current "Build. Scale. Own." tagline (current `og-homepage.png` shows old tagline)

### Monitoring & Uptime

- [ ] Investigate liveness probes / synthetic monitoring for the production site. Goal: automated checks that verify key site functionality (homepage loads, contact form POST endpoint responds, static assets serve correctly) and notify when something is down or broken. Options to evaluate: Cloudflare Health Checks, Uptime Robot, Checkly, GitHub Actions on a cron schedule, or a custom Cloudflare Worker on a scheduled trigger. Should cover at minimum: homepage HTTP 200, `/api/contact` POST returns expected error (missing fields), and one case study page loads.

---

## Verification Checklist

After implementing changes:

- [ ] Run full validation: `hugo --gc --minify --cleanDestinationDir && htmltest`
- [ ] Run markdownlint: `npx markdownlint-cli2 "content/**/*.md"`
- [ ] Run Prettier: `npx prettier --check "content/**/*.md" ".github/**/*.yml"`
- [ ] Start local server and review every modified page
- [ ] Verify new pages in navigation and footer
- [ ] Run accessibility checks: `npx serve public -l 8080 & npx pa11y-ci`
- [x] Validate security headers parse correctly (migrated to Terraform Transform Rules; verify after `terraform apply`)
- [ ] Confirm OG metadata in page source
- [x] Verify analytics beacon loads on production deploy
