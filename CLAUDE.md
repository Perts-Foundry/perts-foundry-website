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

All nine checks must pass before a PR can merge. Run these locally before pushing:

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
npx prettier --check "content/**/*.md" ".github/**/*.yml" "src/**/*.js"
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
Verifies all 8 homepage section IDs and data bindings are present in the built HTML.
Runs automatically in CI after the Hugo build. To check locally after building:
```bash
hugo --gc --minify --cleanDestinationDir
for id in hero-heading tech-bar-heading problem-heading services-heading metrics-heading cases-heading process-heading cta-heading; do
  grep -qE "id=\"?$id\"?" public/index.html && echo "OK: $id" || echo "MISSING: $id"
done
```

## Project Structure

```
config/_default/     # Hugo config (hugo.toml, params.toml, menus, etc.)
config/production/   # Production overrides
config/development/  # Development overrides
content/             # Markdown content (about, accessibility, blog, case-studies, contact, privacy, services)
data/                # Structured TOML data files (metrics, process steps, technologies) used by homepage
assets/css/          # Custom CSS overrides (custom.css) and color schemes (schemes/)
layouts/             # Custom Hugo layout overrides (includes homepage/ sub-partials)
static/              # Static assets and security headers
src/                 # Cloudflare Worker source (contact form API)
wrangler.toml        # Cloudflare Workers deployment config
archetypes/          # Content templates (blog.md, case-studies.md)
docs/                # Architecture proposals and reference guides
.claude/commands/    # Claude Code slash commands (generate-services, generate-case-studies)
.github/workflows/   # CI: validate.yml (PR checks), deploy.yml (PR comment deploy)
```

## Content Conventions

- New blog posts: `hugo new content blog/<slug>/index.md` (uses `archetypes/blog.md`)
- New case studies: `hugo new content case-studies/<slug>/index.md` (uses `archetypes/case-studies.md`)
- Content files live under `content/` as page bundles (directory with `index.md`)
- Front matter uses YAML delimiters (`---`)
- All new content starts as `draft: true`
- Tags use proper case (`Terraform`, `AWS`, `Kubernetes`, not `terraform`, `aws`)
- Permalinks for case studies use the `slug` field: `/case-studies/:slug/`
- Content `slug` values must match their directory name (e.g., `content/services/cloud-infrastructure/` uses `slug: "cloud-infrastructure"`). Structured breadcrumb data relies on this alignment.
- **Exception: contact page.** The contact page uses a custom template (`layouts/contact/simple.html`) that hardcodes all content in HTML for two-column layout control. The markdown file (`content/contact/index.md`) contains only front matter. Editing the contact page content requires modifying the template, not the markdown file.
- **Exception: homepage.** The homepage uses a custom layout (`layouts/partials/home/custom.html`) that dispatches to 8 section sub-partials in `layouts/partials/homepage/`. Content comes from 4 sources: `hero.headline` and `hero.subheadline` from `content/_index.md` front matter; the problem statement from `content/_index.md` body; metrics, process steps, and technologies from `data/*.toml` files; services and case studies from Hugo section queries. Case studies appear on the homepage only if they have `featured: true` in their front matter. Services with an `icon` field in front matter display that Blowfish icon on the homepage grid.

### Section ordering (services, case-studies)

Both `content/services/_index.md` and `content/case-studies/_index.md` use `orderByWeight: true` with cascading display settings (`showDate: false`, `showAuthor: false`, `showReadingTime: false`, `invertPagination: true`, `showHero: true`, `heroStyle: basic`). New pages in these sections must include a `weight` field or they will sort unpredictably. Both sections require a `featured.jpg` in each page bundle for the hero image. Case studies use weight increments of 10 (range 10-100) to allow future insertions.

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
