# Perts Foundry Website: Audit & Roadmap

> **Last audited:** 2026-04-03
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
| CI/CD validation | Exceeds | 9 automated PR checks (Vitest, Hugo build, homepage smoke test, htmltest, pa11y-ci, markdownlint, Prettier, actionlint, Gitleaks) |
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

- [ ] Create Cloudflare Web Analytics site in dashboard (get accountTag and token)
- [ ] Uncomment and populate `[analytics.cloudflare]` in `config/production/params.toml`
- [ ] Verify analytics beacon loads on production after deploy
- [ ] Review Cloudflare Web Analytics dashboard features (top pages, referrers, browsers, countries, Core Web Vitals)
- [ ] Establish a baseline review cadence (e.g., weekly or monthly check-in)
- [ ] Identify which metrics matter most for a consulting site (page views on services/case studies, contact page visits, referral sources)

**Why it matters:** Zero visibility into whether anyone visits the site or which pages they view. Without analytics, every other marketing or content decision is guesswork. CSP already allows `https://static.cloudflareinsights.com`.

**Files:** `config/production/params.toml`

---

## High Priority

Significant gaps that meaningfully weaken the site. Address soon after launch.

### H1. Too many services (9 listed; guide recommends 3-5)

- [ ] Decide on consolidation strategy (current decision: keep all 9 for now)

Nine services dilutes positioning and raises questions about solo expertise breadth. Possible future grouping:

| Consolidated Service | Merges |
|---------------------|--------|
| Cloud Infrastructure and IaC | Cloud Infrastructure + Infrastructure as Code |
| CI/CD and Automation | Stays as-is |
| Kubernetes and Containers | Stays as-is, absorbs container migration |
| Security and Compliance | DevSecOps (renamed) |
| Cloud Operations | FinOps + Incident Response + Cloud Migration |

Agile Coaching is the strongest cut candidate (furthest from DevOps core).

**Files:** `content/services/`, `.pa11yci`

---

### H2. Homepage missing key credibility elements

- [x] Add aggregate metrics from case studies
- [x] Add or duplicate the 3-step engagement process
- [ ] Add certification badge images below hero
- [x] Configure `author.image` and `author.headline` in `languages.en.toml`
- [ ] Plan testimonial placement (add when collected)
- [ ] Add JSON-LD structured data (Organization, Service, HowTo schemas) for SEO rich snippets

**Why it matters:** The guide prescribes certification badges, testimonials, "How I Work" section, and specific metrics.

**Partially resolved 2026-03-30:** Custom multi-section homepage with metrics band ($125K+, 200+, Zero), 4-step "How We Work" process timeline, tech trust bar, services grid, featured case studies, and dual CTAs. Remaining: certification badge images, testimonials.

**Files:** `content/_index.md`, `data/metrics.toml`, `data/process.toml`, `data/technologies.toml`, `layouts/partials/homepage/`, certification badge images

---

### H3. Contact page lacks form and scheduling link

- [x] Add Cal.com booking link
- [x] Add contact form (Cloudflare Workers + Resend)
- [x] Update CSP for Turnstile (`challenges.cloudflare.com` in `script-src` and `frame-src`)

**Why it matters:** The guide specifies three elements: form, scheduling link, professional email. Currently only email and GitHub are offered.

**Resolved 2026-03-28:** Contact form with Turnstile CAPTCHA and Resend email delivery. Cal.com scheduling link (standalone, no Proton Calendar connection). Worker handles POST /api/contact with validation, honeypot, rate limiting, and graceful degradation when secrets are not yet configured.

**Files:** `src/worker.js`, `wrangler.toml`, `layouts/contact/simple.html`, `layouts/partials/extend-head-uncached.html`, `content/contact/index.md`, `static/_headers`, `assets/css/custom.css`, `config/_default/params.toml`

---

### H4. Social media links strategy

- [ ] Decide on LinkedIn approach: create a Perts Foundry company page, reactivate personal profile, or skip LinkedIn entirely
- [ ] Evaluate overemployment visibility risk for each option
- [ ] If proceeding with LinkedIn: create page/profile, ensure messaging matches website
- [ ] Add chosen social links to `author.links[]` in `languages.en.toml`
- [ ] Add social links to the Contact page
- [ ] Consider GitHub org link as a low-risk starting point (no personal exposure)

**Why it matters:** Enterprise procurement teams cross-reference website claims against LinkedIn and other social profiles. However, social presence decisions must be weighed against overemployment visibility concerns.

**Current state:** `author.links = []` (empty). Personal LinkedIn is hibernated. No business LinkedIn page exists. GitHub org (Perts-Foundry) is active.

**Files:** `config/_default/languages.en.toml`, `layouts/contact/simple.html`

---

## Medium Priority

Strengthen positioning. Address in subsequent iterations.

### M1. HSTS max-age is 300 seconds (should be 31536000)

- [x] Change `max-age=300` to `max-age=31536000` in `static/_headers`
- [x] Add `preload` directive

**Resolved 2026-03-27:** HSTS set to `max-age=31536000; includeSubDomains; preload`.

---

### M2. No certification badges displayed visually

- [ ] Source badge images (AWS SA Pro, Terraform, etc.)
- [ ] Add to homepage and About page
- [ ] Consider reusable Hugo shortcode/partial

Certifications are mentioned in service page text but never shown visually. Badge images are quick-scan trust signals for technical buyers.

**Files:** New images in `static/img/`, `content/_index.md`, `content/about/index.md`

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

### M5. 21 pages suppress `color-contrast` in pa11y-ci

- [ ] Identify which failures come from shared Blowfish theme components (nav, footer, hero) vs. custom CSS
- [ ] Fix theme-level contrast issues centrally (shared component overrides)
- [ ] Remove `"ignore": ["color-contrast"]` from pages as they pass

21 of 27 pages in `.pa11yci` have `color-contrast` suppressed. The contact page was fixed and unsuppressed in PR #37. Many remaining failures likely come from Blowfish theme components rather than custom CSS, so fixing shared components first would unsuppress multiple pages at once.

**Files:** `.pa11yci`, `assets/css/custom.css`

---

### M6. SEO optimization audit

- [ ] Audit current meta descriptions across all pages for keyword targeting and length (150-160 chars)
- [ ] Review page titles for keyword placement and consistency
- [ ] Add ProfessionalService JSON-LD schema to homepage (code ready in `docs/open-questions-research.md` Section 7)
- [ ] Set `defaultSocialImage` in `params.toml` so all pages have OG images when shared
- [ ] Regenerate homepage OG image (current `og-homepage.png` shows old "Ship faster..." tagline instead of "Build. Scale. Own.")
- [ ] Review internal linking strategy (do service pages link to relevant case studies and vice versa?)
- [ ] Check that `robots.txt` and `sitemap.xml` are correctly generated and submitted to Google Search Console
- [ ] Evaluate whether page load performance (Core Web Vitals) needs attention
- [ ] Consider adding `alt` text audit for all images across the site

**Why it matters:** The site has solid SEO fundamentals (sitemap, robots.txt, meta descriptions, proper permalinks, breadcrumb structured data) but has not had a dedicated optimization pass. Organic search is a primary discovery channel for consulting services.

**Files:** Content front matter across `content/`, `config/_default/params.toml`, `layouts/partials/extend-head.html` (new), `static/img/`

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
- [ ] Add ProfessionalService or Organization schema via `layouts/partials/extend-head.html`

### L2. No custom Open Graph images

- [ ] Create 1200x630px default OG image for link previews

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

### L8. Investigate pa11y `hideElements` suppression

- [ ] Determine what `.px-2.text-primary-500` and `.inline-block.rtl\:rotate-180` target
- [ ] If issues are color-contrast only, switch to per-page `ignore` rules instead of global `hideElements`

`hideElements` hides elements from ALL axe-core rules (not just contrast), meaning genuine accessibility issues on those elements are invisible to CI. `hideElements` should be reserved for elements that genuinely cannot be tested (e.g., third-party embeds).

**Files:** `.pa11yci`

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
| 5 | Add LinkedIn link (H4) | Enables cross-referencing | Low |
| 6 | HSTS max-age to 1 year (M1) | Security header fix | Trivial |

---

## Verification Checklist

After implementing changes:

- [ ] Run full validation: `hugo --gc --minify --cleanDestinationDir && htmltest`
- [ ] Run markdownlint: `npx markdownlint-cli2 "content/**/*.md"`
- [ ] Run Prettier: `npx prettier --check "content/**/*.md" ".github/**/*.yml"`
- [ ] Start local server and review every modified page
- [ ] Verify new pages in navigation and footer
- [ ] Run accessibility checks: `npx serve public -l 8080 & npx pa11y-ci`
- [ ] Validate security headers parse correctly
- [ ] Confirm OG metadata in page source
- [ ] Verify analytics beacon loads on production deploy
