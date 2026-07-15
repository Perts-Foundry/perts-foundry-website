# Perts Foundry Website

[![Hugo](https://img.shields.io/badge/Hugo-0.157.0%20extended-ff4088)](https://gohugo.io/)
[![Blowfish](https://img.shields.io/badge/Blowfish-v2.100.0-1d4ed8)](https://blowfish.page/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-f38020)](https://workers.cloudflare.com/)

Source code for [pertsfoundry.com](https://pertsfoundry.com), the portfolio and credibility site for Perts Foundry LLC, a DevOps, Cloud Engineering, and Automation consultancy.

It is a Hugo static site (Blowfish theme) served from Cloudflare Workers. Everything is static HTML except a single serverless endpoint, `POST /api/contact`, which validates contact submissions, checks a Cloudflare Turnstile challenge, rate-limits, and relays the message via Resend. The content (case studies, blog posts, service and small-business pages) is the product; the engineering scaffolding around it (CI gates, accessibility enforcement, scheduled publishing) is a working sample of the consultancy's own practices.

**Status:** Live in production at <https://pertsfoundry.com>, maintained on `main`.

## At a glance

| | |
|---|---|
| **What** | Marketing and portfolio website for a DevOps / Cloud / Automation consultancy |
| **Stack** | Hugo 0.157.0 (extended) + Blowfish v2 theme, Cloudflare Worker (`src/worker.js`), Resend, Cloudflare Turnstile |
| **Content** | 15 blog posts, 12 case studies, 10 service pages, 4 small-business pages (each a Hugo page bundle) |
| **Build** | `hugo --gc --minify --cleanDestinationDir` (matches CI) |
| **Tests** | 43 Worker tests via Vitest (`npx vitest run`) |
| **CI** | 11 validation checks gate every PR (see [Validation suite](#validation-suite)) |
| **Deploy** | Comment `deploy` on a green PR (not automatic on merge); see [Deployment](#deployment) |
| **License** | Code MIT, content CC BY 4.0 |

## Who this is for

There are two readers, in two lanes:

- **Evaluators** (prospective clients, hiring managers, peer engineers) judging engineering quality. Read the sections above and [Architecture](#architecture), then skip the rest.
- **Maintainers and collaborators** running the site locally, adding content, running checks, and deploying. Start at [Prerequisites](#prerequisites).

For the exhaustive project spec (conventions, template overrides, homepage internals, CSS module map, git workflow rules), see [CLAUDE.md](CLAUDE.md). This README orients and links; CLAUDE.md is the deep reference.

## Architecture

Hugo compiles the content in `content/` plus the Blowfish theme into static HTML under `public/`. A Cloudflare Worker (`src/worker.js`) sits in front of those assets: it intercepts `POST /api/contact` and serves everything else straight from the build output.

```
request
  ├── /api/contact  ─→  Worker: validate → Turnstile → rate-limit → Resend → JSON
  └── anything else ─→  env.ASSETS.fetch()  (static HTML/CSS/JS from public/)
```

`wrangler.toml` wires this up: `main = "src/worker.js"`, the `ASSETS` binding serves `./public`, and `run_worker_first = ["/api/*"]` routes only API paths through Worker code first. Full deep dive in [CLAUDE.md](CLAUDE.md).

## Prerequisites

| Tool | Version | Why |
|------|---------|-----|
| Hugo | 0.157.0, **extended** build | Site build; pinned in `.hugo-version`. The extended build is required (SCSS/asset pipeline). |
| Go | 1.22 | Fetches the Blowfish theme, which is imported as a Hugo Module. |
| Node.js | 22 | Worker tests, linting, local Worker dev. |
| npm | bundled with Node 22 | Installs dev dependencies (`npm ci`). |

Optional, only needed to reproduce the full CI check run locally: `wrangler` (run via `npx`), `htmltest`, `gitleaks`, `actionlint`. CI installs these itself; see [Validation suite](#validation-suite).

## Quick start

```bash
git clone https://github.com/Perts-Foundry/perts-foundry-website.git
cd perts-foundry-website
npm ci
hugo server
```

Open <http://localhost:1313/>. The site renders with live reload on every save. That is the first win for content work; no Worker, no secrets, no build step required.

Production build (identical to the command CI runs):

```bash
hugo --gc --minify --cleanDestinationDir
```

## The contact API

`POST /api/contact` is the only piece of server logic. It accepts a JSON body and always responds with JSON.

Request:

```bash
curl -X POST http://localhost:8787/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Hello from the contact form.",
    "cf-turnstile-response": "<turnstile-token>"
  }'
```

Success (`200`):

```json
{ "success": true }
```

Validation error (`400`, first failing field only):

```json
{ "error": "Email format is invalid." }
```

> Calling this endpoint with valid input and a real Turnstile token sends an email through Resend and consumes one of the caller's 5 hourly requests. Use synthetic data (`test@example.com`) when exercising it; never paste a real submission into a test, commit, or issue.

### Request fields

| Field | Required | Limit | Notes |
|-------|----------|-------|-------|
| `name` | yes | <= 200 chars | Rejected if it contains CR/LF (header-injection guard). |
| `email` | yes | <= 254 chars | Must match a basic email pattern; rejected if it contains CR/LF. |
| `message` | yes | <= 5000 chars | |
| `cf-turnstile-response` | yes | token | Cloudflare Turnstile token; verified server-side before fields are checked. |
| `website` | no | honeypot | If present and truthy, the Worker returns `200 {"success":true}` without sending anything. |

The raw request body is capped at 4000 bytes. Rate limit is 5 requests per hour per client IP. The limit is in-memory per Worker isolate (it resets when the isolate is evicted and is not shared across edge locations), so Turnstile is the primary bot defense; durable rate limiting belongs in Cloudflare WAF.

### Response status codes

| Status | Meaning |
|--------|---------|
| `200` | Message sent (or honeypot tripped). |
| `400` | Invalid JSON, missing Turnstile token, or a field validation failure. |
| `403` | Turnstile verification failed. |
| `405` | Method other than POST. |
| `413` | Request body larger than 4000 bytes. |
| `429` | Rate limit exceeded (more than 5 requests/hour from one IP). |
| `500` | Turnstile or Resend call errored. |
| `503` | Worker secrets not configured (see below). |

## Worker secrets

The Worker needs two secrets in production. They are never stored in the repo; set them with Wrangler:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
```

| Secret | Purpose |
|--------|---------|
| `RESEND_API_KEY` | Resend API key for email delivery. |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key for server-side challenge verification. |

If either secret is unset, `/api/contact` returns `503` with a fallback message. The Turnstile **site** key is public, not a secret, and lives in `config/_default/params.toml` as `turnstileSiteKey`.

## Local Worker development

The Worker serves `./public`, so build the site first, then run it:

```bash
hugo --gc --minify --cleanDestinationDir
npx wrangler dev
```

Run the Worker test suite (43 tests, via `@cloudflare/vitest-pool-workers`):

```bash
npx vitest run
```

## Validation suite

Every PR runs 11 checks (`.github/workflows/validate.yml`). All must pass before a PR can deploy and merge. The checks also run on push to a PR, and can be re-triggered by commenting `validate` on the PR.

| Check | Tool | What it guards |
|-------|------|----------------|
| Worker unit tests | `vitest` | The 43 contact-API tests. |
| Site compilation | `hugo` | The production build succeeds. |
| Homepage smoke test | shell `grep` | Section IDs, carousel DOM IDs, data bindings, and section order in `public/index.html`. |
| Inner page smoke test | shell `grep` | Tech tags on every case study, numbered steps on every service and small-business page, cert badges on the about page, stagger attributes on list pages. |
| Link & image validation | `htmltest` | Internal links and image references in `public/`. |
| Accessibility | `pa11y-ci` | WCAG 2.1 AA via axe-core against the built site. |
| Secret detection | `gitleaks` | Known secret patterns across full git history. |
| Verified secrets | `trufflehog` | Live, verified credentials across git history (`--only-verified`). |
| Markdown style | `markdownlint` | Content markdown style. |
| Code formatting | `prettier` | Formatting of content, workflow YAML, and Worker/script JS. |
| Workflow validation | `actionlint` | GitHub Actions workflow files. |

To run individual checks locally, see the command-by-command list in [CLAUDE.md](CLAUDE.md) (PR Validation Checks section).

## Deployment

Deployment is **not** automatic on merge. There are three paths:

- **Manual deploy.** A collaborator with write access comments `deploy` on a green PR (`deploy.yml`). The workflow builds and deploys to Cloudflare, then merges the PR.
- **Dependabot auto-deploy.** Dependabot PRs that pass all checks deploy and merge automatically (`dependabot-auto-deploy.yml`), with documented refusal conditions (unverified signature, workflow-file changes, major-version bumps without a label, and others). No `deploy` comment needed.
- **Scheduled rebuild.** A cron job rebuilds from `main` on the 1st and 15th of each month at 9 AM ET (`scheduled-deploy.yml`) to publish posts whose `publishDate` has passed.

Deploys spend on Cloudflare Workers and send live email through Resend. Full rules, refusal conditions, and branch-protection caveats are in the Git Workflow section of [CLAUDE.md](CLAUDE.md).

## Content authoring

Content lives under `content/` as page bundles (a directory containing `index.md`, plus a `featured.jpg` in most sections). Scaffold new pages from the archetypes:

```bash
hugo new content blog/<slug>/index.md          # uses archetypes/blog.md
hugo new content case-studies/<slug>/index.md  # uses archetypes/case-studies.md
```

Front matter uses YAML delimiters. Blog and case-study pages need a `featured.jpg`; case studies, services, and small-business pages use a `weight` field for ordering. Detailed conventions (tags, permalinks, scheduled publishing, cross-linking policy, shortcodes) are in [CLAUDE.md](CLAUDE.md).

## Project structure

```
config/      Hugo config (hugo.toml, params.toml, menus) + production/development overrides
content/     Markdown content: about, blog, case-studies, services, small-business, contact, legal pages
data/        Structured TOML (metrics, technologies, certifications, process) for the homepage
assets/css/  9 numbered CSS modules in modules/, loaded in order via a head.html override
layouts/     Hugo layout overrides, shortcodes, homepage sub-partials
static/      Favicons, images, manifest
src/         Cloudflare Worker (worker.js) + tests (worker.test.js)
scripts/     Dev utilities (generate-og.js: regenerates the 1200x630 OG image via sharp)
archetypes/  Content templates for new pages
wrangler.toml  Cloudflare Workers config
.github/workflows/  validate, deploy, dependabot-auto-deploy, scheduled-deploy
```

This is a condensed router. The authoritative, fully annotated structure is in [CLAUDE.md](CLAUDE.md).

## Development commands

```bash
hugo server                                 # live-reload dev server (port 1313)
hugo --gc --minify --cleanDestinationDir    # production build
npx vitest run                              # Worker tests
npx wrangler dev                            # local Worker (build first)
npx markdownlint-cli2 "content/**/*.md"     # markdown lint
npx prettier --check "content/**/*.md" "src/**/*.js"  # format check
node scripts/generate-og.js                 # regenerate the OG social preview image
```

## Troubleshooting

- **Hugo build fails on SCSS/asset pipeline.** You are likely running the standard Hugo binary. This site requires the **extended** build of Hugo 0.157.0.
- **Theme not found / module fetch errors.** Blowfish is a Hugo Module; Go 1.22 must be installed and on `PATH` so Hugo can fetch it.
- **`htmltest`, `pa11y-ci`, or the smoke tests find nothing.** They run against `public/`. Run the production build first so the output exists.
- **Turnstile shows duplicate widgets on the contact page.** The widget uses explicit render mode on purpose; do not switch it to implicit (auto) render. See the contact-page notes in [CLAUDE.md](CLAUDE.md).

## Security

See [SECURITY.md](SECURITY.md) for the vulnerability reporting process.

This repository is public. Keep secrets out of it: secret values never belong in source (only the secret variable names and `wrangler secret put`), and contact-form submissions in examples or tests must be synthetic.

## License

- **Code** (templates, Worker, scripts, CSS, workflows): [MIT](LICENSE)
- **Content** (case studies, blog posts, service and small-business pages, data, images): [CC BY 4.0](LICENSE-CONTENT)

Maintained by [Perts Foundry LLC](https://pertsfoundry.com).
