# Perts Foundry Website: Audit & Roadmap

> **Last audited:** 2026-03-25
> **Reference:** `docs/building-a-credible-solo-devops-consulting-website.md`
> **Visual research:** `docs/visual-enhancement-research.md`

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
| Accessibility | Exceeds | WCAG 2.1 AA, 26-page pa11y-ci in CI, dedicated page, custom layouts for alt text |
| CI/CD validation | Exceeds | 7 automated PR checks (Hugo build, htmltest, pa11y-ci, markdownlint, Prettier, actionlint, Gitleaks) |
| Contact process | Good | 3-step "What to Expect" section, clear response time commitment |
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
- [ ] Configure `author.image` and `author.headline` in `languages.en.toml`

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

### C4. No analytics configured

- [ ] Create Cloudflare Web Analytics site in dashboard (get accountTag and token)
- [ ] Uncomment and populate `[analytics.cloudflare]` in `config/production/params.toml`

**Why it matters:** Zero visibility into whether anyone visits the site or which pages they view. CSP already allows `https://static.cloudflareinsights.com`.

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

- [ ] Add aggregate metrics from case studies
- [ ] Add or duplicate the 3-step engagement process
- [ ] Add certification badge images below hero
- [ ] Configure `author.image` and `author.headline` in `languages.en.toml`
- [ ] Plan testimonial placement (add when collected)

**Why it matters:** The homepage is currently a tagline, two generic paragraphs, and two buttons. The author section renders empty (no image, headline, or links). The guide prescribes certification badges, testimonials, "How I Work" section, and specific metrics.

**Files:** `content/_index.md`, `config/_default/languages.en.toml`, certification badge images

---

### H3. Contact page lacks form and scheduling link

- [ ] Add Calendly or Cal.com booking link
- [ ] Add contact form (Formspree, Formspark, or Basin for static site)
- [ ] Update CSP `form-action` directive if using third-party form

**Why it matters:** The guide specifies three elements: form, scheduling link, professional email. Currently only email and GitHub are offered.

**Files:** `content/contact/index.md`, `static/_headers` (CSP if needed)

---

### H4. No LinkedIn or social links

- [ ] Add founder's LinkedIn and personal GitHub to `author.links[]` in `languages.en.toml`
- [ ] Add LinkedIn to the Contact page
- [ ] Ensure LinkedIn profile messaging is consistent with website

**Why it matters:** Enterprise procurement teams cross-reference website claims against LinkedIn.

**Files:** `config/_default/languages.en.toml`, `content/contact/index.md`

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

## Low Priority / Nice-to-Have

### L1. No structured data / JSON-LD

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

---

## Visual Bugs (from live dev server review)

### V-Bug-1. Word counts display on service and case study listing cards

- [ ] Hide word count metadata ("289 words") from listing cards via CSS or article-link partial override

**Details:** `showReadingTime: false` in the cascade does not prevent word count from appearing in the `article-link/simple.html` template. "289 words" next to "Cloud Infrastructure" is developer metadata that should not be visible to consulting prospects.

**Files:** `assets/css/custom.css` or `layouts/partials/article-link/simple.html`

---

### V-Bug-2. Services and case studies listing cards show no descriptions

- [ ] Surface front matter `description` field on listing cards

Every service and case study has a `description` in front matter, but only titles (and word counts) render on listing pages. Visitors must click through each item to learn what it covers.

**Files:** `layouts/partials/article-link/simple.html`

---

## Visual Enhancement Roadmap

See `docs/visual-enhancement-research.md` for detailed research with techniques, implementation guidance, and browser support.

### Tier 1: Quick Wins (CSS-only)

- [ ] **V1. Micro-interactions** on cards, buttons, links (hover lift, shadow, scale, glow)
- [ ] **V2. Dark mode glow accents** using blue/violet palette (box-shadow, gradient borders)
- [ ] **V3. Fluid typography** for hero headings (`clamp()`)
- [ ] **V4. Fix word count display** on listing pages (V-Bug-1 above)

### Tier 2: Medium Effort (CSS + minimal JS)

- [ ] **V5. Scroll-reveal animations** (Intersection Observer + CSS transitions, ~15 lines JS)
- [ ] **V6. Technology logo wall** (CSS marquee, AWS/GCP/Terraform/K8s logos)
- [ ] **V7. Animated metric counters** ($125K+, 200+ projects, etc.)
- [ ] **V8. Process timeline** ("How We Work" visual flow)
- [ ] **V9. Custom homepage layout** (Blowfish `custom` layout, sectioned landing page)
- [ ] **V10. Glassmorphism service cards** (`backdrop-filter: blur()`)

### Tier 3: Differentiation

- [ ] **V11. Animated hero background** (CSS gradient mesh or particle network)
- [ ] **V12. Enhanced case study presentation** (scroll reveals, animated metrics, color-coded tables)
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
