# Open Questions Research: Decision Guide

> **Archived:** 2026-04-03. All 8 decisions resolved and implemented. Remaining action items tracked in `docs/website-audit-and-roadmap.md`.

> **Researched:** 2026-03-26
> **Purpose:** Deep dives into every open-ended decision from the website audit. Review each section and choose your preferred path.

---

## Table of Contents

1. [Contact Form Provider](#1-contact-form-provider)
2. [Scheduling Tool](#2-scheduling-tool)
3. [Word Count Bug and Missing Descriptions Fix](#3-word-count-bug-and-missing-descriptions-fix)
4. [Hero Background Approach](#4-hero-background-approach)
5. [Custom Homepage Layout](#5-custom-homepage-layout)
6. [Blog Re-enablement Strategy](#6-blog-re-enablement-strategy)
7. [Structured Data / JSON-LD](#7-structured-data--json-ld)
8. [Open Graph Images](#8-open-graph-images)

---

## 1. Contact Form Provider

The site's CSP currently sets `form-action 'self'` and `connect-src 'self'`, which blocks HTML form POSTs and fetch requests to external domains. Every third-party form service requires loosening one of these.

### Option A: Cloudflare Workers + Resend (Recommended)

Form POSTs to a same-origin `/api/contact` path. A Worker script validates input, verifies a Cloudflare Turnstile token, and calls Resend's API server-side to deliver the email.

| Attribute | Detail |
|-----------|--------|
| Free tier | Workers: 100K requests/day. Resend: 100 emails/day (3,000/month) |
| Ongoing cost | $0 within free tiers |
| CSP changes | **None.** Form posts to `'self'`, email API call is server-side |
| Spam protection | Cloudflare Turnstile (free, privacy-respecting, invisible in most cases) + server-side honeypot + rate limiting |
| Privacy | Data never leaves your infrastructure (Cloudflare + Resend) |
| UX control | Full. Custom success page, AJAX, error handling |
| Branding | None (it is your site) |
| Complexity | Medium. ~50-80 lines of Worker code, Resend account, `wrangler secret put RESEND_API_KEY` |

**Implementation:** Add a `src/worker.js` entry point in `wrangler.toml` alongside the existing `[assets]` config. Use `run_worker_first = ["/api/*"]` to route only API paths through the Worker; static assets continue serving normally. Cloudflare has an [official tutorial](https://developers.cloudflare.com/workers/tutorials/send-emails-with-resend/) for this exact pattern.

**Why this wins:** Zero CSP changes, no third-party data sharing, no external branding, complete control. The site is already on Workers, so the infrastructure cost is zero.

### Option B: Formspark (Runner-up)

Form action points to `https://submit-form.com/{form_id}`.

| Attribute | Detail |
|-----------|--------|
| Free tier | 250 total submissions (one-time trial, not per month) |
| Ongoing cost | $25 one-time for 50,000 submissions (no expiration) |
| CSP changes | `form-action 'self' https://submit-form.com` or `connect-src 'self' https://submit-form.com` (AJAX) |
| Spam protection | Honeypot, reCAPTCHA, hCaptcha, Botpoison |
| Privacy | Third-party stores data |
| UX control | Limited. Default thank-you page; custom redirect or AJAX for same-page |
| Complexity | Very low. HTML form with external action URL |

**Why consider it:** Fastest implementation. One-time $25 could last years for a consulting site. Good if you want to avoid writing any Worker code.

### Option C: Formspree

Similar to Formspark. 50 submissions/month free. $10+/month for more. CSP changes required. reCAPTCHA + honeypot spam protection. Formspree branding on free tier thank-you page.

### Option D: Basin

100 submissions/month free. $5-8/month paid. Most comprehensive spam protection (AI-powered, Turnstile support, email validation, geo filtering). CSP changes required.

### Not Recommended: mailto: form

Requires configured desktop email client. Inconsistent browser behavior. No server-side validation or storage. Poor UX. The existing mailto link on the contact page is already better than a mailto form.

### Decision Summary

| If you want... | Choose |
|----------------|--------|
| Best privacy, no CSP changes, full control | **Workers + Resend** |
| Fastest implementation, lowest effort | **Formspark** ($25 one-time) |
| Best spam protection out of the box | **Basin** |
| Cheapest third-party option | **Formspree** (50/month free) |

---

## 2. Scheduling Tool

### The CSP Problem with Embedding

Every scheduling tool requires significant CSP loosening to embed (iframe, widget JS, connect-src, style-src additions across multiple domains). The current strict CSP is a security asset worth preserving.

**Recommendation: Do not embed.** Use a direct external link instead. A "Schedule a 30-minute intro call" button linking to the provider's domain requires zero CSP changes and works perfectly.

### Tool Comparison (link-out approach)

| Tool | Free Tier | Ongoing Cost | Dark Mode | Self-Hostable | Notes |
|------|-----------|-------------|-----------|---------------|-------|
| **Cal.com** | Unlimited events + bookings, 1 user | $0 (solo) | Yes | Yes (AGPL open-source) | Most generous free tier. Open-source aligns with DevOps credibility. |
| **Calendly** | 1 event type, 1 calendar | $10-12/month | No | No | Industry standard, most recognized name |
| **TidyCal** | Basic scheduling | $29 one-time (lifetime) | No | No | Best value if you need paid features |
| **SavvyCal** | Polling only (scheduling requires $12+/mo) | $12-20/month | No | No | Not practical on free tier |

### Decision Summary

| If you want... | Choose |
|----------------|--------|
| Best free tier, open-source credibility | **Cal.com** |
| Most recognized name, simplest setup | **Calendly** (but pay $10/mo for more than 1 event type) |
| One-time payment, no recurring cost | **TidyCal** ($29 lifetime) |

---

## 3. Word Count Bug and Missing Descriptions Fix

### Bug: Word Counts on Listing Cards

**Root cause:** Blowfish v2.100.0 defaults `article.showWordCount = true`. The project's `params.toml` does not override this. The cascade in `_index.md` files sets `showReadingTime: false` but not `showWordCount`.

**Template chain:** `article-link/simple.html` calls `article-meta/basic.html`, which checks `.Site.Params.article.showWordCount` and renders via `meta/word-count.html`, producing `<span>289 words</span>`.

#### Fix Options

| Option | Change | Scope | Effort |
|--------|--------|-------|--------|
| **A: Config override (recommended)** | Add `showWordCount = false` to `[article]` in `config/_default/params.toml` | Global, all pages | One line |
| B: Cascade override | Add `showWordCount: false` to cascade in `services/_index.md` and `case-studies/_index.md` | Per-section | Two files |
| C: CSS hide | Target the metadata `<span>` element with `display: none` | Visual only, still in HTML | Fragile selector |

**Recommended: Option A.** A single line addition:

```toml
[article]
  showWordCount = false    # <-- add this line
```

### Bug: Descriptions Not Showing on Listing Cards

**Root cause:** Blowfish's `article-link/simple.html` only renders `.Summary` (auto-generated from content body), not `.Description` (the front matter field). The template checks `showSummary` but there is no built-in option for descriptions.

Every service and case study has a `description` field in front matter that is used for SEO meta tags but never displayed on listing cards.

#### Fix Options

| Option | Approach | Effort | Tradeoff |
|--------|----------|--------|----------|
| **A: Template override (recommended)** | Add 3 lines to `article-link/simple.html` to fall back to `.Description` | Small template change | Minimal; extends existing behavior |
| B: Use `summary` field instead | Add `summary:` to all 19 front matter files, enable `showSummary = true` in config | 19 file edits + config | Duplicates text between `description` and `summary` |
| C: New config option | Override template with a custom `showDescription` param | Template + config | Over-engineered for this use case |

**Recommended: Option A.** Add a 3-line `{{ else if }}` block to the existing `article-link/simple.html` override:

```diff
  {{ if .Params.showSummary | default (site.Params.list.showSummary | default false) }}
    <div class="article-link__summary prose dark:prose-invert max-w-fit mt-1 line-clamp-6">
      {{ .Summary | plainify }}
    </div>
+ {{ else if .Description }}
+   <div class="article-link__summary prose dark:prose-invert max-w-fit mt-1 line-clamp-6">
+     {{ .Description | plainify }}
+   </div>
  {{ end }}
```

This way: if `showSummary` is enabled, show the content summary. Otherwise, if a `description` exists in front matter, show that. Falls back to nothing if neither is available.

---

## 4. Hero Background Approach

> **Resolved 2026-03-30:** Text-only hero initially chosen. **Superseded 2026-04-01:** An animated CSS gradient mesh background (`heroGradientShift` keyframes, paused off-screen via IntersectionObserver) was added during the visual overhaul. The hero card has rounded corners and side margins, with the gradient providing subtle visual interest while keeping typography as the primary focus.

### Comparison Matrix

| Approach | Visual Impact | Performance | Mobile | Complexity | Brand Fit | Accessibility | Total /30 |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| CSS Grid Animation | 3 | 5 | 5 | 5 | 4 | 5 | **27** |
| CSS Gradient Mesh | 3 | 5 | 5 | 5 | 2 | 5 | **25** |
| Static Image + Ken Burns | 2 | 5 | 5 | 5 | 2 | 5 | **24** |
| tsParticles Network | 4 | 3 | 3 | 3 | 5 | 4 | **22** |
| Three.js Globe | 5 | 2 | 2 | 1 | 3 | 3 | **16** |
| Video Background | 4 | 2 | 2 | 3 | 3 | 1 | **15** |

### Option A: CSS Geometric Grid (Highest Overall Score)

A dark background with faint blue grid lines and small glowing dots at intersections. Grid slowly drifts diagonally. Evokes circuit boards, network topology, infrastructure schematics.

**Pros:** Pure CSS (0 dependencies, 0 JS), excellent performance (compositor-only), perfect mobile, good infrastructure brand fit, trivial to implement in `custom.css`.

**Cons:** Subtle. Not as eye-catching as particles. Some might find it too understated.

**Best as:** Base layer. Can be combined with a gradient mesh underneath for color richness, giving you grid structure + color depth in pure CSS.

### Option B: tsParticles Network (Strongest Brand Metaphor)

Nodes connected by lines on a canvas. The "network graph" visual is the single best metaphor for an infrastructure consultancy (nodes = servers, lines = connections).

**Important:** particles.js is dead (abandoned 2018, known vulnerabilities). Use **tsParticles** (actively maintained successor, v3.x, ~50-60KB for the slim bundle).

**Pros:** Most memorable, strongest brand metaphor, interactive (grab-on-hover), respects `prefers-reduced-motion` natively. Bundle is lighter than the current 448KB background image.

**Cons:** JavaScript dependency (~50-60KB), canvas is main-thread (needs particle count tuning: 60 desktop, 30 mobile), battery usage on mobile, needs IntersectionObserver to pause when off-screen.

### Option C: CSS Gradient Mesh (Pure CSS Alternative)

Slowly shifting blue/violet gradient wash. Like a deep-space nebula. Premium feel.

**Pros:** Pure CSS, zero dependencies, excellent performance, beautiful with the blue/violet palette.

**Cons:** Generic "modern design" feel. Does not inherently say "infrastructure." Works better as a complement to the grid than as a standalone.

### Option D: Keep Static Image + Add CSS Effects

Ken Burns effect (slow zoom/pan) on the existing background image. Lowest effort.

```css
#background-image {
  animation: kenBurns 25s ease-in-out infinite alternate;
}
@keyframes kenBurns {
  from { transform: scale(1.0) translate(0, 0); }
  to   { transform: scale(1.08) translate(-1%, -1%); }
}
```

**Pros:** 5 lines of CSS, works with existing image, zero risk.

**Cons:** Visitors may not notice. Does not differentiate from default Blowfish sites.

### Options to Avoid

- **Three.js/WebGL:** 150KB+ payload, poor mobile performance, overkill for a 7-page consulting site.
- **Video background:** Multi-MB download, accessibility problems (WCAG requires pause mechanism), pa11y will flag it, Harvard's design system explicitly prohibits autoplaying hero videos as of 2025.

### What Top Sites Actually Do (2025-2026 Trend)

Typography-first heroes are dominant. Bold headlines, intentional whitespace, minimal decoration. When animation exists, it is slow and ambient. The hero's job is to communicate, not to dazzle. Stripe's gradient mesh is the gold standard of "beautiful but not distracting."

### Decision Summary

| If you want... | Choose |
|----------------|--------|
| Best overall balance (performance + brand + effort) | **CSS Grid** (Option A), optionally layered with gradient mesh |
| Maximum brand impact and memorability | **tsParticles Network** (Option B) |
| Zero risk, minimal change | **Ken Burns on static image** (Option D) |
| Pure visual richness, no "techy" requirement | **CSS Gradient Mesh** (Option C) |

---

## 5. Custom Homepage Layout

> **Resolved 2026-03-30:** "Conversion-Focused Storyteller" layout implemented. **Updated 2026-04-02:** Visual overhaul reduced to 7 sections (problem statement merged into hero). Current layout: Hero (animated gradient bg, inline problem statement), Tech Bar (SVG icon carousel), Metrics Band (animated counters), Services Grid (image card carousel, all services), Featured Cases (carousel, all case studies by weight), Process Timeline (Discover, Build, Scale, Own with gradient beam), Final CTA. See `layouts/partials/home/custom.html` and `layouts/partials/homepage/`.

### Research Finding: Text-Only Heroes Outperform Image Heroes

Minimalist text-focused heroes with bold typography show up to 20% better conversion in A/B tests than full-page image heroes. Reasons: faster load (LCP > 2.5s increases bounce by 32%), generic images communicate little, strong copy outperforms "corporate polish."

### Recommended Layout: "Conversion-Focused Storyteller"

This follows the research-backed B2B consulting conversion flow: problem, solution, proof, action.

| # | Section | Content |
|---|---------|---------|
| 1 | **Hero** | Animated gradient bg, bold headline ("Build. Scale. Own."), subheadline, inline problem statement, dual CTAs. |
| 2 | **Tech Bar** | SVG icon carousel (8 per page, paginated), "Core technologies in our toolkit" label. |
| 3 | **Metrics Band** | 3 animated stat counters: "$125K+", "200+", "Zero". Dark band with gradient text. |
| 4 | **Services Grid** | All services as image card carousel (4 per page), "View all services" link. |
| 5 | **Featured Cases** | All case studies as image card carousel (4 per page), "View all case studies" link. |
| 6 | **Process Timeline** | 4-step horizontal timeline (Discover, Build, Scale, Own) with gradient beam connector. |
| 7 | **Final CTA** | "Ready to forge ahead?" + contact CTA, gradient border card with pulsing glow. |

**Implementation:** Set `homepage.layout = "custom"` in `params.toml`, create `layouts/partials/home/custom.html` with Tailwind utility classes. All content already exists in the site; it just needs to be surfaced on the homepage.

### Alternative: "Minimal Authority"

Stripped-down, understated. Better if you want the site to feel professional rather than "marketing-forward."

| # | Section | Content |
|---|---------|---------|
| 1 | **Hero** | Large headline + 2 lines + single CTA ("Get in Touch") |
| 2 | **Brief Intro** | 2-3 sentences from About page |
| 3 | **Services List** | Simple linked list (not cards) |
| 4 | **Case Studies** | 3 text links with metric prefix (e.g., "[$125K saved] Cloud Cost Optimization") |
| 5 | **Final CTA** | Email link + "30-minute intro call" |

**Tradeoff:** Works for warm referral traffic. Less effective for cold organic visitors who need the full proof-and-credibility sequence.

### Alternative: "Portfolio-Led"

Leads with proof. Good fit given 10 strong case studies.

| # | Section | Content |
|---|---------|---------|
| 1 | **Hero** | Outcomes-first headline ("We've saved clients $125K+ and shipped zero-downtime migrations") + CTA |
| 2 | **Case Study Grid** | 4-6 case study cards (the main content of the page) |
| 3 | **Tech Trust Bar** | Technology logos |
| 4 | **Services Summary** | Brief linked list |
| 5 | **Final CTA** | Contact with process expectation |

**Tradeoff:** Strong for technical audiences. Less effective for visitors who need the problem framed first.

### CTA Language

Research says "Book a Call" / "Let's Talk" outperforms "Contact Us" because it sets a clear expectation (a conversation, not a sales pitch). Make the contact CTA visually primary, portfolio CTA secondary.

---

## 6. Blog Re-enablement Strategy

### Key Finding: Rename to "Insights"

For a small evergreen collection (3-5 articles), "Insights" frames the content as intentionally curated rather than a neglected blog. Major consulting firms (Bain, McKinsey, Deloitte) use "Insights" for exactly this reason.

Switch to "Blog" once publishing regularly (10+ articles, monthly cadence).

### Dates: Hide Initially, Show "Last Updated" Later

- With only 3-5 articles: hide dates to avoid the "wrote a few posts and stopped" signal.
- Once publishing regularly: show "Last updated" (not "Published") dates. Signals content is maintained without revealing cadence.

### Minimum Articles Before Re-enabling: 3-5

Three excellent articles signal more competence than twelve mediocre ones. Each should be 1,000+ words and demonstrate genuine expertise.

### Proposed Article Topics (Priority Order)

#### 1. "The Real Cost of Click-Ops: Why Console-Managed Infrastructure Becomes Your Most Expensive Technical Debt"

Reworked/expanded version of the existing placeholder post. Repositioned for a business audience (cost and risk) rather than purely technical.

- **Audience:** Engineering managers and CTOs at Series A-C startups
- **SEO:** "Infrastructure as code benefits," "technical debt infrastructure"
- **Lead angle:** Links to the IaC service page
- **Why:** Directly maps to a service you sell

#### 2. "What a Cloud Cost Audit Actually Finds: Lessons from $500K+ in Identified Savings"

Composite "lessons learned" drawing from the FinOps case study. Five most common sources of cloud waste.

- **Audience:** Engineering leaders and finance teams evaluating FinOps
- **SEO:** "Cloud cost optimization," "reduce AWS/GCP spend" (high-intent commercial queries)
- **Lead angle:** Each "common finding" naturally leads to wanting an audit
- **Why:** FinOps is a high-dollar-value service; one lead from this article has strong ROI

#### 3. "Choosing Between EKS, GKE, and Self-Managed Kubernetes: A Decision Framework"

Goes beyond feature matrices to address organizational and operational considerations.

- **Audience:** Platform engineers and engineering managers
- **SEO:** "EKS vs GKE" has strong search volume; most existing results are superficial
- **Lead angle:** Positions you as having hands-on experience with both platforms
- **Why:** Tool comparison content is the highest-volume DevOps search category

#### 4. "Zero-Downtime Infrastructure Changes: Patterns We Use and Why They Matter"

Engineering patterns behind zero-downtime migrations, drawing from the two zero-downtime case studies.

- **Audience:** Senior engineers planning risky infrastructure changes
- **SEO:** "Zero downtime deployment," "blue-green infrastructure"
- **Lead angle:** Teams planning risky changes are the audience most likely to hire a consultant
- **Why:** Gets bookmarked and shared in engineering Slack channels

#### 5. "The Four-Phase Infrastructure Engagement: How We Partner with Engineering Teams"

Transparently explains how engagements work. Not a sales page; a genuine methodology explanation.

- **Audience:** Leaders considering hiring a DevOps consultant
- **SEO:** "How to hire a DevOps consultant" (lower volume but high intent)
- **Lead angle:** Reduces buyer anxiety by explaining what happens
- **Why:** Can be sent directly to prospects evaluating an engagement

---

## 7. Structured Data / JSON-LD

### What Blowfish Already Provides

- **Homepage:** `WebSite` schema (title, description, publisher)
- **All other pages:** `Article` schema (headline, description, dates, tags, author)
- **Breadcrumbs:** `BreadcrumbList` schema (available but currently disabled)

### What to Add

#### 1. Enable Breadcrumb Structured Data

Add one line to `config/_default/params.toml`:

```toml
enableStructuredBreadcrumbs = true
```

Google renders breadcrumbs in search results, replacing raw URLs with readable navigation trails. The site's permalink structure (`/services/:slug/`, `/case-studies/:slug/`) matches content paths, so the generated data will be valid.

#### 2. Add ProfessionalService Schema to Homepage

Create `layouts/partials/extend-head.html`:

```html
{{- if .IsHome }}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "{{ site.Title }}",
  "url": {{ site.Home.Permalink }},
  "description": "{{ site.Home.Description | safeJS }}",
  "logo": {
    "@type": "ImageObject",
    "url": "{{ "img/logo/perts-foundry-square-dark-1024.png" | absURL }}"
  },
  "email": "contact@pertsfoundry.com",
  "sameAs": [
    "https://github.com/Perts-Foundry"
  ],
  "knowsAbout": [
    "DevOps", "Cloud Infrastructure", "CI/CD", "Kubernetes",
    "Terraform", "AWS", "GCP", "Infrastructure as Code"
  ]
}
</script>
{{- end }}
```

The `{{- if .IsHome }}` guard ensures this only appears on the homepage, not conflicting with the per-page `Article` schema Blowfish generates.

### What NOT to Add

- **`aggregateRating` / `review`:** Google explicitly penalizes self-reviews.
- **`LocalBusiness`:** Requires a physical `address` field. A remote consultancy gains nothing.
- **Per-service `Service` schema:** Google has no rich result type for `Service`. No visible search benefit.

### Validation

- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Schema.org Validator:** https://validator.schema.org/
- **Google Search Console:** "Enhancements" section shows issues after crawling

---

## 8. Open Graph Images

### What Blowfish Already Does

Hugo's internal OG templates find images in page bundles and output `og:image` tags. Every service and case study has `featured.jpg`, so those pages already have OG images. The homepage, About, Contact, and listing pages have no images and currently generate no `og:image` tag.

### What to Add

#### 1. Create a Default OG Image

Design a 1200x630px branded image (Perts Foundry logo + tagline on dark background matching site colors). Place at `assets/img/og-default.jpg`.

#### 2. Configure in params.toml

```toml
defaultSocialImage = "img/og-default.jpg"
```

Blowfish's fallback logic will use this for any page without its own `featured.*` image.

### Generation Approach

**Manual creation (recommended).** Use Figma or Canva. For ~20 pages where most already have featured images, dynamic generation is overkill. Create one branded default image.

### Twitter Cards

No separate configuration needed. Hugo automatically selects `summary_large_image` when an image is available. Once `defaultSocialImage` is configured, all pages get the large image card format.

### Testing

- **Before deploy:** Inspect `public/index.html` for `og:image` and `twitter:image` meta tags
- **After deploy:** Facebook Sharing Debugger, LinkedIn Post Inspector, opengraph.xyz
