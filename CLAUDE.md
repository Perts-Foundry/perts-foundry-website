# CLAUDE.md — Perts Foundry Website

## Project Overview

Hugo static site using the Blowfish theme, deployed to Cloudflare Workers.
Hugo version is pinned in `.hugo-version` (currently `0.157.0`).

## Build Commands

```bash
# Development server
hugo server

# Production build (matches CI)
hugo --gc --minify --cleanDestinationDir
```

## Development Workflow

When making changes to templates, CSS, content, or any visual aspect of the site,
start the Hugo dev server so the user can preview changes in their browser before
committing. The server live-reloads on file changes.

To start the dev server reliably:

1. Kill any existing Hugo server: `pkill -f "hugo server" 2>/dev/null || true`
2. Start a fresh server (run in background, do NOT append `&` to the command):
   `hugo server`
3. Tell the user the preview URL (default: http://localhost:1313/)

The dev server is not needed for non-visual changes (CI config, worker code, docs).

## PR Validation Checks

All ten checks must pass before a PR can merge. Run these locally before pushing:

### 1. Vitest (Worker unit tests)
Runs the 43 Worker unit/integration tests. Config: `vitest.config.js`.
```bash
npx vitest run
```

### 2. Hugo Build
```bash
hugo --gc --minify --cleanDestinationDir
```

### 3. htmltest (link/image validation)
Runs against the `public/` build output. Config: `.htmltest.yml`.
Only checks internal links — external URLs are skipped.
```bash
htmltest
```

### 4. pa11y-ci (accessibility)
Runs WCAG 2.1 AA checks (via axe-core) against the built site. Config: `.pa11yci`.
Requires a local server on port 8080 serving `public/`.
```bash
npx serve public -l 8080 &
npx pa11y-ci
```

### 5. markdownlint
Lints all content markdown. Config: `.markdownlint-cli2.jsonc`.
Disabled rules: MD041 (first-line heading), MD013 (line length), MD033 (inline HTML).
```bash
npx markdownlint-cli2 "content/**/*.md"
```

### 6. Prettier
Checks formatting of content markdown, workflow YAML, and Worker JS. Config: `.prettierrc.toml`.
```bash
npx prettier --check "content/**/*.md" ".github/**/*.yml" "src/**/*.js" "scripts/**/*.js"
```

### 7. actionlint
Validates GitHub Actions workflow files.
```bash
actionlint
```

### 8. Gitleaks (secret detection)
Scans the full git history for leaked secrets.
```bash
gitleaks git --log-opts="--all" --no-banner
```

### 9. Homepage smoke test
Verifies 9 homepage section IDs (across 8 partials), carousel infrastructure DOM IDs, section ordering, and data bindings in the built HTML.
Runs automatically in CI after the Hugo build. To check locally after building:
```bash
hugo --gc --minify --cleanDestinationDir
for id in hero-heading problem-heading tech-bar-heading metrics-heading certs-heading services-heading cases-heading process-heading cta-heading; do
  grep -qE "id=\"?$id\"?" public/index.html && echo "OK: $id" || echo "MISSING: $id"
done
```

### 10. Inner page smoke test
Verifies structural elements on inner pages: `tech-tags` in every case study, `numbered-steps-wrapper` in every service page, `certification-badges` on the about page, and `data-reveal-stagger` on list pages.
Runs automatically in CI after the Hugo build.

## Project Structure

```
config/_default/     # Hugo config (hugo.toml, params.toml, menus, etc.)
config/production/   # Production overrides
config/development/  # Development overrides
content/             # Markdown content (about, accessibility, blog, case-studies, contact, privacy, services)
data/                # Structured TOML data files (metrics, process steps, technologies, certifications) used by homepage and about page
assets/css/          # Modular custom CSS (modules/) and color schemes (schemes/)
layouts/             # Custom Hugo layout overrides, shortcodes, and homepage sub-partials
static/              # Static assets (favicons, images, manifest)
src/                 # Cloudflare Worker source (contact form API)
scripts/             # Developer utilities (OG image generation)
wrangler.toml        # Cloudflare Workers deployment config
archetypes/          # Content templates (blog.md, case-studies.md, default.md)
docs/                # Active project documentation (audit, research, guides)
docs/archive/        # Completed/historical docs; do not reference unless explicitly asked
.claude/commands/    # Claude Code slash commands (generate-services, generate-case-studies, generate-blog)
.claude/commands/shared/  # Shared specs referenced by multiple commands (featured-image-processing, anonymization-spec, portfolio-repo-layout)
.github/workflows/   # CI: validate.yml (PR checks), deploy.yml (PR comment deploy)
```

## Documentation

Active documentation lives in `docs/`. Reference guides that inform ongoing work (credibility guide, accessibility compliance guide) remain in `docs/`. Completed plans, resolved decision docs, and superseded research live in `docs/archive/`.

Do not read or reference archived documents unless the user explicitly asks for them. They contain outdated plans, completed research, or reference material that is no longer relevant to active work. Reading them wastes context and risks acting on stale information.

## Content Conventions

- New blog posts: `hugo new content blog/<slug>/index.md` (uses `archetypes/blog.md`)
- New case studies: `hugo new content case-studies/<slug>/index.md` (uses `archetypes/case-studies.md`)
- Content files live under `content/` as page bundles (directory with `index.md`)
- Front matter uses YAML delimiters (`---`)
- Archetypes default to `draft: true` for manual authoring. The generate commands (`generate-services`, `generate-case-studies`, `generate-blog`) override to `draft: false` because content is approved interactively during their Phase 2.
- Tags use proper case (`Terraform`, `AWS`, `Kubernetes`, not `terraform`, `aws`)
- Permalinks for case studies use the `slug` field: `/case-studies/:slug/`
- Content `slug` values must match their directory name (e.g., `content/services/cloud-infrastructure/` uses `slug: "cloud-infrastructure"`). Structured breadcrumb data relies on this alignment.
- **Exception: contact page.** The contact page uses a custom template (`layouts/contact/simple.html`) that hardcodes all content in HTML for two-column layout control. The markdown file (`content/contact/index.md`) contains only front matter. Editing the contact page content requires modifying the template, not the markdown file. The layout has two cards: a contact form (left column on desktop, top on mobile) and a scheduling CTA card (right column, bottom on mobile). DOM source order matches visual order. The Turnstile CAPTCHA widget uses explicit render mode (`render=explicit` + `onloadTurnstileCallback` in `extend-head-uncached.html`) because Blowfish's DOM manipulation triggers Turnstile's MutationObserver auto-render multiple times, causing duplicate widgets. The callback renders exactly once and passes `size: 'flexible'` programmatically; the `.cf-turnstile` div in `simple.html` is a bare mount target with no `data-*` attributes. Renaming the `.cf-turnstile` class requires updating the render selector in `extend-head-uncached.html` and the CSS scaling rules in `_08_contact-page.css`. Do not revert to implicit (auto) render mode. CSS `transform: scale()` fallbacks at viewports below 500px (`assets/css/modules/_08_contact-page.css`) prevent the 300px-wide iframe from overflowing narrow screens. The email address is intentionally absent from the visible page (anti-scraping) and appears only in hidden error fallback elements.
- **Exception: homepage.** The homepage uses a custom layout (`layouts/partials/home/custom.html`) that dispatches to 8 section sub-partials in `layouts/partials/homepage/`. Section order: hero (with inline problem statement), tech bar, metrics band, certifications, services grid, featured cases, process timeline, final CTA. Content comes from 5 sources: `hero.headline`, `hero.subheadline` from `content/_index.md` front matter; the problem statement from `content/_index.md` body (rendered inline in the hero); metrics, process steps, technologies, and certifications from `data/*.toml` files; services and case studies from Hugo section queries. All case studies and services appear on the homepage via paginated carousels (sorted by weight). Services display as image cards using their `featured*` image. The `.homepage` wrapper uses `display: flex; flex-direction: column; gap: 3rem` for consistent inter-section spacing. Three carousels (tech bar, services, cases) depend on specific DOM IDs: `tech-carousel-items`, `services-carousel-grid`, `cases-carousel-grid` and their corresponding `-dots` containers. Renaming these IDs in templates will silently break carousel navigation. Each carousel uses a responsive `perPage` function in `extend-footer.html` that checks `window.innerWidth < 640` to switch between mobile and desktop item counts. This 640px threshold must stay in sync with the CSS `@media (min-width: 640px)` breakpoints that control grid column counts; changing one without the other will cause layout/pagination mismatches. Note: `perPage` is evaluated once at page load and is not recalculated on resize or orientation change.

### Custom Shortcodes

Five custom shortcodes are available for content pages:

- `{{% metric "key" %}}` -- Pulls display values from `data/metrics.toml` by key. Used on the about page for inline metric references.
- `{{< tech-tags "A, B, C" >}}` -- Comma-separated list rendered as styled pill tags. Used in all case study "Key Technologies" sections.
- `{{< steps >}}...{{< /steps >}}` -- Wraps an ordered list with numbered circle badges. Used in all service page "What an Engagement Looks Like" sections.
- `{{< certification-badges >}}` -- Renders image-based certification badges from `data/certifications.toml`. Each badge shows the Credly badge image (resized via Hugo's image pipeline) with a visible name label. Optionally links to a Credly verification URL when the `url` field is present. Used on the about page. The shortcode delegates to a shared partial (`layouts/partials/certification-badges.html`) that is also called by the homepage certifications section.
- `{{< faqs >}}` -- Renders an FAQ accordion from the page's front matter `faqs` array (objects with `question` and `answer` fields). Uses native `<details>/<summary>` HTML for accessible expand/collapse behavior. Used on all service pages. FAQPage JSON-LD schema is emitted separately in `extend-head-uncached.html` for any page with `faqs` data.

### Image alt-text conventions

The site meets WCAG 2.1 AA alt-text requirements. Follow these patterns when adding images:

- **Featured images in listing cards and hero sections**: `alt=""` (decorative). The linked card title or page `<h1>` provides the label. Used by `article-link/simple.html`, `article-link/card-related.html`, `hero/basic.html`, and homepage card partials.
- **Certification/badge images**: `alt=""` with visible text label adjacent. The visible `.certification-name` span carries the accessibility info (see `layouts/partials/certification-badges.html`).
- **Inline markdown images in content**: descriptive alt text. Example from about page: `![Headshot of Seth Perts](featured.jpg "Seth Perts, Founder of Perts Foundry")`.
- **Icon SVGs inside buttons**: `aria-label` on the parent button; icons wrapped in `aria-hidden="true"` containers (e.g., carousel prev/next controls, tech-bar icons).

`htmltest` (configured in `.htmltest.yml` with `IgnoreAltEmpty: true`) and `pa11y-ci` enforce these patterns in CI.

### Vendor Template Overrides

Five Blowfish theme templates are overridden locally. On theme upgrades, re-diff each override against the new vendor version.

| Local override | Vendor original | Modification | Base version |
|----------------|----------------|--------------|--------------|
| `layouts/partials/article-link/simple.html` | `article-link/simple.html` | Decorative alt on featured images, description fallback | v2.100.0 |
| `layouts/partials/article-link/card-related.html` | `article-link/card-related.html` | Added `alt=""` to decorative featured images for htmltest compliance | v2.100.0 |
| `layouts/_default/list.html` | `_default/list.html` | `data-reveal-stagger` attribute for scroll-reveal cascade | v2.100.0 |
| `layouts/contact/simple.html` | `_default/simple.html` | Full custom two-column contact page layout | v2.100.0 |
| `layouts/partials/head.html` | `partials/head.html` | CSS loading via explicit module enumeration over `assets/css/modules/` (search `LOCAL OVERRIDE` for the exact delta) | v2.100.0 |

### Vendor CSS Contrast Overrides

Two Blowfish Tailwind utility class combinations fail WCAG AA contrast and are overridden in `assets/css/modules/_04_shared-components.css` with `!important`. On theme upgrades, verify these class names still exist in the vendor templates.

| CSS selector | Vendor usage | Override | Base version |
|-------------|--------------|----------|--------------|
| `.px-2.text-primary-500` | Article-meta middot separators | `primary-400` dark / `primary-700` light | v2.100.0 |
| `.px-1.text-primary-500` | Breadcrumb separators | `primary-400` dark / `primary-700` light | v2.100.0 |

### CSS Module Organization

Custom CSS is split into 9 topic-scoped modules in `assets/css/modules/` and loaded via `layouts/partials/head.html` (the 5th vendor override). Modules are concatenated in explicit numeric order into a single minified + fingerprinted bundle.

| Module | Scope |
|--------|-------|
| `_01_global.css` | `:root` variables, base resets, header/footer normalization, global reduced-motion |
| `_02_typography.css` | Responsive `clamp()` heading sizes, prose sizing, hero image constraints |
| `_03_animations.css` | All `@keyframes` (heroGradientShift, ctaPulse, techItemExit, techEnterScale, dotProgress) + scroll-reveal base rules |
| `_04_shared-components.css` | Contrast overrides, `.cta`, `.numbered-steps`, headshot styling |
| `_05_homepage.css` | Hero, services carousel, metrics band, homepage layout shell |
| `_06_homepage-cards.css` | Certification badges, case cards, cases carousel, process timeline, final CTA card |
| `_07_tech-bar.css` | Tech bar carousel, item animations, tech-specific reduced-motion |
| `_08_contact-page.css` | Contact two-column layout, contact cards, Turnstile scaling, form styling |
| `_09_article-details.css` | Article-link hovers, results table, tech tags, FAQ accordion, H2 reveal |

**Where to add new CSS:**
- New homepage section → `_05_homepage.css` or `_06_homepage-cards.css` (depending on whether it's a card/timeline).
- New page-specific styles → create a new module (e.g. `_10_new-page.css`) and add it to the enumerated list in `layouts/partials/head.html`.
- New `@keyframes` → always in `_03_animations.css` (keyframe names resolve globally, so placement is independent of usage).
- Reduced-motion blocks → stay co-located with the animations they modify.
- Cross-file dependencies (e.g. `_08` and `_09` reference `[data-reveal]` from `_03`) should be documented with a header comment.

### Scroll-Reveal System

`extend-footer.html` includes an IntersectionObserver that powers scroll-triggered animations across the site. Three attribute types control the behavior:

- `data-reveal` -- Fade + slide-up (0.6s ease). Used on homepage sections. Contact cards use `data-reveal` but with the slide-up overridden to opacity-only (`.js-reveal-init .contact-card[data-reveal] { transform: none; }`) to prevent a page-level scrollbar flash during the animation.
- `data-reveal-stagger` -- Children cascade with staggered delays (0-0.5s). Used on list pages. Supports up to 10 children; items beyond 10 appear simultaneously without delay.
- `data-prose-reveal` -- Opacity-only fade (0.4s) for article H2 headings. Applied via JS at runtime, not in templates.

The `js-reveal-init` class on `<html>` gates visibility: without JS, all content remains visible. JS also bails early for users with `prefers-reduced-motion: reduce`, and a CSS `@media` query provides an independent fallback forcing all reveal elements to full opacity.

### Homepage data structure

- `data/metrics.toml` has 4 items (savings, terraform, migrations, ai-repos) displayed as the homepage metrics band and referenced inline on the about page via the `{{% metric "key" %}}` shortcode.
- `data/technologies.toml` has a single `items` array grouped into **5 visual pages of 8 items each** (40 total) for the homepage tech trust bar carousel. The `# Page N: ...` comment headers in the file are semantic groupings for humans; Hugo ignores them. Pagination is computed as `Math.ceil(items.length / perPage)` with `perPage = 8` (desktop) in `layouts/partials/extend-footer.html`. **The item count MUST remain a multiple of 8** or the visual groupings will drift across pages. `tech-bar.html` emits a Hugo `warnf` at build time when the count is not a multiple of 8, but the mobile breakpoint (`perPage = 4`) paginates differently regardless.
- `data/process.toml` has 4 items for the "How We Work" timeline.
- `data/certifications.toml` has the Credly badge entries displayed on both the homepage certifications section and the about page.

### Section ordering (services, case-studies, blog)

Both `content/services/_index.md` and `content/case-studies/_index.md` use `orderByWeight: true` with cascading display settings (`showDate: false`, `showAuthor: false`, `showReadingTime: false`, `invertPagination: true`, `showHero: true`, `heroStyle: basic`). The blog section (`content/blog/_index.md`) uses the same cascade display settings (`showDate: false`, `showAuthor: false`, `showReadingTime: false`, `showHero: true`, `heroStyle: basic`) but uses Hugo's default date-based ordering instead of `orderByWeight`, so blog posts do not need a `weight` field. New pages in these sections must include a `weight` field or they will sort unpredictably. Both sections require a `featured.jpg` in each page bundle for the hero image. Both sections should include a `tags` field listing relevant technologies (e.g., `AWS`, `Terraform`, `Kubernetes`); these populate `<meta name="keywords">` and JSON-LD keywords for SEO. Case studies use weight increments of 10 (current range 10-120 for 12 case studies) to allow future insertions. Case studies also require `params.client`, `params.industry`, `params.challenge`, and `params.result` in front matter; these render as a structured metadata card at the top of each page. Hugo merges the `params:` YAML key into `.Params` automatically. The archetype at `archetypes/case-studies.md` scaffolds these fields.

## Code Style

- Prettier with `proseWrap = "preserve"` — do not reflow markdown paragraphs
- Markdown must pass markdownlint (inline HTML is allowed, no line-length limit)
- TOML for all Hugo configuration
- Never commit secrets or credentials — Gitleaks scans the full history

## Worker (API Endpoint)

The site includes a Cloudflare Worker at `src/worker.js` that handles `POST /api/contact`.
All other requests are served as static assets via `env.ASSETS.fetch()`.

### Secrets (not in repo)

Set via `wrangler secret put`:

- `RESEND_API_KEY` -- Resend API key for email delivery
- `TURNSTILE_SECRET_KEY` -- Cloudflare Turnstile secret key for CAPTCHA verification

The Turnstile *site key* (public) is in `config/_default/params.toml` as `turnstileSiteKey`.

The `extend-head-uncached.html` partial serves multiple purposes: DNS-prefetch hints for external domains (challenges.cloudflare.com, cal.com), Turnstile explicit rendering on the contact page (the `onloadTurnstileCallback` function is the single point of widget configuration, including sitekey, theme, and size; the widget ID is stored on `window.turnstileWidgetId` for use by the form submission code in `simple.html`), and custom JSON-LD structured data (Organization schema on the homepage, Service schema on individual service pages, FAQPage schema on any page with `faqs` front matter data). This partial receives the full page context (not the cached `.Site`), so page-level conditionals like `.IsHome` and `.Section` work correctly. String values in JSON-LD use Hugo's `jsonify | safeJS` pipeline: `jsonify` produces valid JSON escaping of quotes, backslashes, and special characters, and `safeJS` marks the output as already-safe JavaScript so Hugo's `html/template` context-aware escaping does not re-escape it (without `safeJS`, Hugo detects the JSON is inside a `<script>` tag and wraps string values in literal quote characters, producing doubly-quoted output that degrades structured-data parsing). Individual service pages can override the default `serviceType` ("DevOps Consulting") in the Service JSON-LD by setting `params.serviceType` in front matter. The Organization schema's `knowsAbout` array lists expertise areas for search engines; update it when adding new service categories.

Social links are configured via `author.links` in `config/_default/languages.en.toml` using Blowfish's single-key object format: `links = [{ github = "https://github.com/Perts-Foundry" }]`. Blowfish emits `<link rel="me">` tags in the HTML head for each entry. The visible author card (with clickable icons) is controlled by `showAuthor` in `params.toml` (currently `false`). A visible GitHub icon also appears in the site footer via `menus.en.toml` using Blowfish's `pre = "github"` icon field.

### Testing

The Worker has 43 unit tests using Vitest with `@cloudflare/vitest-pool-workers`.
Config: `vitest.config.js`. Test file: `src/worker.test.js`.

```bash
npx vitest run
```

### Local development

```bash
# Content iteration (no Worker)
hugo server

# Worker testing (build Hugo first)
hugo --gc --minify --cleanDestinationDir
npx wrangler dev
```

## Infrastructure

All infrastructure changes (DNS, Workers config, R2 buckets, etc.) must be codified in Terraform in the [Perts-Foundry/infrastructure](https://github.com/Perts-Foundry/infrastructure) repo. Never make manual infrastructure changes -- always create a PR in that repo instead.

## Git Workflow

- Main branch: `main`
- Feature branches merge via PR after all validation checks pass
- Deployment is triggered by commenting `deploy` on a PR (not automatic on merge)
