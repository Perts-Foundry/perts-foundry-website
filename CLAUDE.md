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

## PR Validation Checks

All six checks must pass before a PR can merge. Run these locally before pushing:

### 1. Hugo Build
```bash
hugo --gc --minify --cleanDestinationDir
```

### 2. htmltest (link/image validation)
Runs against the `public/` build output. Config: `.htmltest.yml`.
Only checks internal links — external URLs are skipped.
```bash
htmltest
```

### 3. markdownlint
Lints all content markdown. Config: `.markdownlint-cli2.jsonc`.
Disabled rules: MD041 (first-line heading), MD013 (line length), MD033 (inline HTML).
```bash
npx markdownlint-cli2 "content/**/*.md"
```

### 4. Prettier
Checks formatting of content markdown and workflow YAML. Config: `.prettierrc.toml`.
```bash
npx prettier --check "content/**/*.md" ".github/**/*.yml"
```

### 5. actionlint
Validates GitHub Actions workflow files.
```bash
actionlint
```

### 6. Gitleaks (secret detection)
Scans the full git history for leaked secrets.
```bash
gitleaks git --log-opts="--all" --no-banner
```

## Project Structure

```
config/_default/     # Hugo config (hugo.toml, params.toml, menus, etc.)
config/production/   # Production overrides
config/development/  # Development overrides
content/             # Markdown content (about, blog, case-studies, contact, services)
layouts/             # Custom Hugo layout overrides
static/              # Static assets and security headers
archetypes/          # Content templates (blog.md, case-studies.md)
.github/workflows/   # CI: validate.yml (PR checks), deploy.yml (manual deploy)
```

## Content Conventions

- New blog posts: `hugo new content blog/<slug>/index.md` (uses `archetypes/blog.md`)
- New case studies: `hugo new content case-studies/<slug>/index.md` (uses `archetypes/case-studies.md`)
- Content files live under `content/` as page bundles (directory with `index.md`)
- Front matter uses YAML delimiters (`---`)
- All new content starts as `draft: true`

## Code Style

- Prettier with `proseWrap = "preserve"` — do not reflow markdown paragraphs
- Markdown must pass markdownlint (inline HTML is allowed, no line-length limit)
- TOML for all Hugo configuration
- Never commit secrets or credentials — Gitleaks scans the full history

## Infrastructure

All infrastructure changes (DNS, Workers config, R2 buckets, etc.) must be codified in Terraform in the [Perts-Foundry/infrastructure](https://github.com/Perts-Foundry/infrastructure) repo. Never make manual infrastructure changes — always create a PR in that repo instead.

## Git Workflow

- Main branch: `main`
- Feature branches merge via PR after all validation checks pass
- Deployment is manual via workflow dispatch (not automatic on merge)
