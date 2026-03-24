# Portfolio Data Integration — Architecture Proposal

This document evaluates architectural options for integrating the `professional-portfolio-source` repository into the Perts Foundry website. It covers data import mechanisms, consumption patterns, hybrid combinations, and a recommended approach with implementation details.

## Overview

### Problem

The Perts Foundry website currently maintains content in two disconnected ways:

1. **Manually-written markdown pages** in `content/` — services, case studies, about page
2. **Structured YAML data** in the `professional-portfolio-source` repo — the single source of truth for all professional portfolio content

This creates duplication and drift. Adding a new consulting service requires editing YAML in the portfolio repo _and_ creating a markdown page in the website repo. The same data that feeds resume generation (via `resume-curator`) should feed the website directly.

### Goals

- **Single source of truth** — edit portfolio data once, have it appear on the website and in resumes
- **No manual content duplication** — pages that map to portfolio data should be generated, not hand-written
- **Clean separation of concerns** — the portfolio repo remains pure data; the website owns rendering
- **Local dev parity** — `hugo server` works locally without CI-specific workarounds
- **Minimal new tooling** — leverage what both repos already use (Hugo Modules, Go, GitHub Actions)

### Current State

**Website (`perts-foundry-website`)**:

- Hugo 0.157.0 with Blowfish v2.100.0 theme (imported via Hugo Module)
- Content sections: blog (1 post), services (9 pages), case studies (0 pages, section page only), about, contact, accessibility
- Empty `data/` directory (only `.gitkeep`)
- No data templates, shortcodes, or structured data consumption in layouts
- Deployed to Cloudflare Workers via wrangler

**Portfolio source (`professional-portfolio-source`)**:

- 14 YAML data files in `data/` with corresponding JSON Schema validation in `schema/`
- ~52 entries across all sections, ~895 lines of YAML total
- Already has `go.mod` for Hugo Module import
- Architecture doc already describes mounting `data/` → `data/portfolio/`
- Consumed by `resume-curator` for PDF generation

---

## Portfolio Data Source

### Content Sections

| Section | File | Type | Entries | Key Fields |
|---------|------|------|---------|------------|
| **Basics** | `basics.yaml` | object | 1 | name, contact, location, profiles, summary |
| **Work** | `work.yaml` | array | 6 | id, name, position, startDate, tagged highlights, technologies |
| **Education** | `education.yaml` | array | 1 | id, institution, area, courses, honors |
| **Skills** | `skills.yaml` | array | 14 | id, name, level, keywords, tags |
| **Certificates** | `certificates.yaml` | array | 14 | id, name, date, type, issuer, tags |
| **Projects** | `projects.yaml` | array | 5 | id, name, description, highlights, keywords, roles |
| **Publications** | `publications.yaml` | array | 1 | id, name, type (blog/talk/paper/presentation), publisher |
| **Volunteer** | `volunteer.yaml` | array | 1 | id, organization, position, tagged highlights |
| **Languages** | `languages.yaml` | array | 1 | id, language, fluency |
| **Interests** | `interests.yaml` | object | 1 | hobbies (name, description), fun_facts |
| **Awards** | `awards.yaml` | array | 0 | id, title, date, awarder, summary |
| **References** | `references.yaml` | array | 0 | id, name, company, role, reference text |
| **Services** | `services.yaml` | array | 9 | id, name, slug, summary, description, technologies, weight |
| **Engagements** | `engagements.yaml` | array | 0 | id, name, client, industry, challenge, result, metrics, slug |

### Schema Architecture

All schemas use JSON Schema draft-07 with shared type definitions in `definitions.schema.json`:

- **`id`** — kebab-case string (`^[a-z0-9][a-z0-9-]*$`) for stable cross-referencing
- **`tagged_highlight`** — `{id, text, tags, resume_variants, technologies}` — the core extension over JSON Resume
- **`metric`** — `{label, before, after}` for measurable engagement outcomes
- **`resume_variants`** — `["general", "devops", "security"]` for multi-profile filtering
- **`tags`** and **`technologies`** — string arrays for categorization and filtering

The schema extends JSON Resume v1.0.0 with two custom sections (`services`, `engagements`), tagged highlight objects (replacing plain strings), and `id` fields on all entries.

---

## Integration Pattern Options

### Option 1: Hugo Modules (Data Mount)

Import the portfolio repo as a Hugo Module and mount its `data/` directory into the website's data namespace.

**Configuration:**

```toml
# config/_default/module.toml
[[imports]]
  path = "github.com/nunocoracao/blowfish/v2"

[[imports]]
  path = "github.com/Perts-Foundry/professional-portfolio-source"
  [[imports.mounts]]
    source = "data"
    target = "data/portfolio"
```

This makes all portfolio data accessible as `hugo.Data.portfolio.<section>` in Go templates. (Note: `.Site.Data` was deprecated in Hugo v0.156.0; `hugo.Data` is the replacement and works in all template contexts including content adapters.)

**Update workflow:**

```bash
# Pull latest portfolio data
hugo mod get -u github.com/Perts-Foundry/professional-portfolio-source

# Pin to specific commit
hugo mod get github.com/Perts-Foundry/professional-portfolio-source@abc1234
```

**Prerequisites:**

- Go installed locally and in CI
- `GOPRIVATE=github.com/Perts-Foundry/*` in shell environment
- GitHub token with repo scope for private module access in CI

**Pros:**

- Both repos already use Hugo Modules — zero new tooling
- `go.mod`/`go.sum` provide reproducible, pinned builds
- Data merges seamlessly into Hugo's namespace
- Lazy loading optimizes build time
- Official Hugo-recommended approach for external dependencies
- Can mount any of Hugo's 7 component types (content, data, layouts, assets, static, i18n, archetypes)

**Cons:**

- Requires Go installation (not just Git)
- Module files are hidden in `GOPATH`, not visible in project directory
- Dependabot is incompatible with Go modules (Renovate is the alternative)
- Private repo access requires `GOPRIVATE` env var and token configuration

**Community verdict:** Officially recommended by bep (Hugo creator) for multi-repo content. The Hugo discourse shows him directly endorsing modules: _"you can import any number of repositories and mount the source folders anywhere you want."_ Power users favor this approach.

---

### Option 2: Git Submodules

Add the portfolio repo as a Git submodule, then use Hugo mounts to map the contents.

**Configuration:**

```bash
git submodule add -b main \
  https://github.com/Perts-Foundry/professional-portfolio-source.git \
  data-source
```

```toml
# config/_default/module.toml (mount from submodule path)
# In split config, the module. prefix is stripped
[[mounts]]
  source = "data-source/data"
  target = "data/portfolio"
```

**CI integration:**

```yaml
- uses: actions/checkout@v4
  with:
    submodules: recursive
# Or for guaranteed latest:
- run: git submodule update --init --recursive --remote
```

**Pros:**

- No Go required — pure Git
- Files are visible in project tree — easy to inspect and debug
- Familiar to most developers
- Works with any Git hosting platform

**Cons:**

- Tracks commit hashes, not branches — easy to get stale references
- Manual `git submodule update --remote` needed to pull changes
- Detached HEAD state issues if not configured with `-b main`
- CI requires explicit submodule initialization steps
- `.gitmodules`, `.git/config` leave traces in multiple places
- Elio Struyf documented that initial `submodules: true` in CI failed to fetch latest changes, requiring workarounds

**Community verdict:** Works but described as "not a tidy affair" by multiple Hugo community authors. Dr. Mowinckel migrated _from_ Hugo Modules _to_ submodules for a community project where contributor onboarding mattered more than automation — but recommended modules for single-maintainer projects. The Hugo community increasingly treats modules as the successor.

---

### Option 3: CI/CD Multi-Repo Checkout

Check out both repositories in GitHub Actions and copy data files before building.

**Configuration:**

```yaml
# .github/workflows/deploy.yml
jobs:
  build:
    steps:
      - uses: actions/checkout@v4
        with:
          path: site

      - uses: actions/checkout@v4
        with:
          repository: Perts-Foundry/professional-portfolio-source
          path: portfolio
          token: ${{ secrets.PORTFOLIO_TOKEN }}

      - run: cp -r portfolio/data/ site/data/portfolio/
      - run: cd site && hugo --gc --minify
```

**Pros:**

- Maximum flexibility — works with any data source (APIs, databases, other repos)
- No Hugo-specific tooling required for the data fetch step
- Can validate or transform data before Hugo sees it
- Token-based auth for private repos is straightforward

**Cons:**

- Build logic lives in CI config, not in Hugo — **local dev doesn't work without mimicking the fetch**
- `hugo server` locally requires manually copying data or maintaining a separate script
- Network failures during build can break deployments
- Data not version-controlled alongside the site (unless committed after copy)
- Adds workflow maintenance burden

**Community verdict:** A pragmatic "glue" approach used when Hugo-native solutions don't fit. The Contentful blog documents this pattern extensively for headless CMS integration. Not recommended when you own both repos and can use modules.

---

### Option 4: `resources.GetRemote` (Runtime Fetch)

Fetch data from a remote URL at build time within Hugo templates.

**Usage:**

```go-html-template
{{ $url := "https://raw.githubusercontent.com/Perts-Foundry/professional-portfolio-source/main/data/work.yaml" }}
{{ with try (resources.GetRemote $url) }}
  {{ with .Value }}
    {{ $work := . | transform.Unmarshal }}
    {{ range $work }}
      <h3>{{ .position }} at {{ .name }}</h3>
    {{ end }}
  {{ end }}
{{ end }}
```

**Note:** `getJSON` and `getCSV` were deprecated in Hugo v0.123.0 and removed in a subsequent release. The current approach is `resources.GetRemote` + `transform.Unmarshal`. The `try` function used above is also a recent Hugo addition available on 0.157.0.

**Pros:**

- No module system or submodule setup needed
- Resources are cached to disk automatically
- Configurable timeout, headers, and HTTP methods
- Useful for truly external APIs you don't control

**Cons:**

- Adds network dependency to every uncached build
- Private repo access requires auth tokens in URLs or Hugo security config
- Slower than local data access — each section requires a separate HTTP request
- Caching can serve stale data across rebuilds
- 14 separate fetches for 14 data files adds latency

**Community verdict:** Appropriate for external APIs. Overkill when you own both repos and can mount data locally via modules. The Kubernetes project migrated from `getJSON` to `resources.GetRemote` for their external data, but they fetch from public APIs — not sibling repos.

---

## Data Consumption Patterns

Once data is imported into Hugo (via any method above), there are two fundamentally different ways to consume it.

### Pattern A: Data Files + Template Partials

Use `hugo.Data.portfolio.*` in Go templates to render data within existing manually-written pages. Data supplements pages but does not create them.

**Example partial:**

```go-html-template
{{/* layouts/partials/portfolio/work-timeline.html */}}
{{ range hugo.Data.portfolio.work }}
  <div class="work-entry">
    <h3>{{ .position }} at {{ .name }}</h3>
    <p class="dates">
      {{ .startDate }} – {{ with .endDate }}{{ . }}{{ else }}Present{{ end }}
    </p>
    {{ if .highlights }}
      <ul>
        {{ range .highlights }}
          <li>{{ .text }}</li>
        {{ end }}
      </ul>
    {{ end }}
  </div>
{{ end }}
```

**Used in a page:**

```go-html-template
{{/* layouts/about/single.html or via shortcode in about/index.md */}}
{{ partial "portfolio/work-timeline.html" . }}
```

**Pros:**

- Simplest approach — just templates reading data
- Works with Hugo's built-in data system, no new concepts
- Good for sections that appear _within_ a page (skills on about, testimonials on homepage)

**Cons:**

- Cannot generate standalone pages from data
- Services and case studies still need manually-created markdown files
- Adding a new service requires both a YAML entry _and_ a content page

**Best suited for:** About page content (basics, work history, education, skills, certificates, interests, volunteer, languages, awards), homepage elements (testimonials, skill highlights), sidebar widgets, footer contact info.

---

### Pattern B: Content Adapters (Page Generation)

Use `_content.gotmpl` files to generate full Hugo pages from data at build time. Introduced in Hugo v0.126.0 after six years of feature requests. This site runs Hugo 0.157.0, well past the requirement.

**Example — generating service pages:**

```go-html-template
{{/* content/services/_content.gotmpl */}}
{{ range hugo.Data.portfolio.services }}
  {{ $content := dict "mediaType" "text/markdown" "value" .description }}
  {{ $page := dict
    "content" $content
    "kind" "page"
    "path" .slug
    "title" .name
    "params" (dict
      "description" .summary
      "summary" .summary
      "technologies" .technologies
      "tags" .tags
      "weight" .weight
    )
  }}
  {{ $.AddPage $page }}
{{ end }}
```

**Example — generating case study pages:**

```go-html-template
{{/* content/case-studies/_content.gotmpl */}}
{{ range hugo.Data.portfolio.engagements }}
  {{ if .published }}
    {{ $content := dict "mediaType" "text/markdown" "value" .description }}
    {{ $page := dict
      "content" $content
      "kind" "page"
      "path" .slug
      "title" .name
      "params" (dict
        "description" .result
        "client" .client
        "industry" .industry
        "challenge" .challenge
        "result" .result
        "metrics" .metrics
        "technologies" .technologies
        "tags" .tags
        "weight" .weight
      )
    }}
    {{ $.AddPage $page }}
  {{ end }}
{{ end }}
```

Pages created by content adapters are first-class Hugo pages — they support taxonomies, front matter params, list/single layouts, RSS, and all other Hugo page features.

**Performance:** Hugo maintainer Joe Mooring demonstrated 20,000 pages generated from a 49MB JSON file in seconds, with linear scaling. The ~52 entries in the portfolio repo are trivial.

**Pros:**

- Pages generated entirely from data — no duplicate markdown files needed
- First-class Hugo pages with full taxonomy, routing, and layout support
- Official, actively maintained Hugo feature
- Exceptional build performance
- Works with local data, asset files, and remote APIs

**Cons:**

- `.Site.Pages` is not available inside `_content.gotmpl` (site not fully initialized during adapter execution)
- Page path collisions during concurrent processing produce indeterminate results
- Relatively new feature (2024) — less community documentation than older patterns
- Generated pages cannot have co-located page bundle resources (images must come from `static/` or `assets/`)

**Best suited for:** Services (from `services.yaml`), case studies (from `engagements.yaml`), projects (from `projects.yaml`), publications (from `publications.yaml`).

---

## Hybrid Architectures

The import mechanism and consumption pattern are independent choices. Combining them yields three viable architectures.

### Hybrid A: Modules + Templates Only

```
portfolio repo ──[Hugo Module mount]──→ data/portfolio/*
                                              │
                                    ┌─────────┴─────────┐
                                    ▼                   ▼
                            Go template partials   Existing markdown pages
                            (skills, work history)  (manually maintained)
```

- **Import**: Hugo Module
- **Consumption**: Template partials only — no page generation
- **Services/Case Studies**: Manually-written markdown pages, enriched with data partials
- **Complexity**: Low
- **Limitation**: Adding a service still requires editing both repos

### Hybrid B: Modules + Content Adapters

```
portfolio repo ──[Hugo Module mount]──→ data/portfolio/*
                                              │
                              ┌───────────────┼───────────────┐
                              ▼               ▼               ▼
                     _content.gotmpl    _content.gotmpl    Go template partials
                     (services/)        (case-studies/)    (about, homepage)
                              │               │
                              ▼               ▼
                     Generated pages    Generated pages
                     from services.yaml from engagements.yaml
```

- **Import**: Hugo Module
- **Page-generating sections**: Content adapters create pages from `services.yaml`, `engagements.yaml`, `projects.yaml`
- **Supplemental sections**: Template partials render `basics`, `work`, `skills`, `certificates`, `interests` within existing pages
- **Blog**: Remains manually-written markdown — creative content doesn't belong in structured data
- **Complexity**: Medium
- **Advantage**: Edit YAML once → page appears on website AND in resume. Single source of truth achieved.

### Hybrid C: Modules + Adapters + Remote Fetch

Same as Hybrid B, plus `resources.GetRemote` for data that lives outside the portfolio repo.

- **Import**: Hugo Module for portfolio data
- **Remote fetch**: GitHub API for live repo stats, Credly API for certification badge status, etc.
- **Complexity**: High
- **When needed**: Only if you want to pull live data from third-party APIs at build time. Not needed for the initial integration.

---

## Recommended Architecture: Hybrid B

Hybrid B (Hugo Modules + Content Adapters) is the recommended approach. Here is the justification:

| Factor | Assessment |
|--------|-----------|
| Both repos already use Hugo Modules | Zero new tooling — Blowfish is already imported this way |
| Hugo 0.157.0 supports content adapters | Well past the 0.126.0 requirement |
| Portfolio repo already has `go.mod` | Ready for module import with no changes |
| Architecture doc already describes the mount | Pre-designed integration path (`data/` → `data/portfolio/`) |
| Services/engagements have `slug` and `weight` | Perfect fields for page generation and ordering |
| Dataset is small (~895 lines) | No performance concerns whatsoever |
| Single maintainer | Module complexity justified by automation gains |
| Data feeds multiple consumers | resume-curator + website from same YAML source |

### Why not the others?

- **Hybrid A** retains content duplication — the whole point is eliminating it
- **Hybrid C** adds complexity for a future need that doesn't exist yet — can be added incrementally later
- **Git Submodules** add friction for a single-maintainer project that already uses Go modules
- **CI/CD copy** breaks local dev parity — `hugo server` wouldn't work without a separate fetch script
- **Remote fetch** adds network dependency to builds and is slower than local data access

---

## Data Mapping

How each portfolio section maps to its website consumption pattern:

| Portfolio Section | Website Location | Pattern | Notes |
|-------------------|-----------------|---------|-------|
| `services.yaml` | `/services/<slug>/` | **Content adapter** | Replaces manually-written service pages |
| `engagements.yaml` | `/case-studies/<slug>/` | **Content adapter** | Replaces manually-written case study pages |
| `projects.yaml` | `/projects/<slug>/` | **Content adapter** | New section — personal/open-source projects |
| `basics.yaml` | About page, footer, contact | **Template partial** | Name, summary, profiles, contact info |
| `work.yaml` | About page (experience section) | **Template partial** | Employment timeline with highlights |
| `education.yaml` | About page | **Template partial** | Degree, institution, honors |
| `skills.yaml` | About page, services pages | **Template partial** | Technology badges / skill grid |
| `certificates.yaml` | About page (credentials) | **Template partial** | Professional certs and courses |
| `interests.yaml` | About page | **Template partial** | Hobbies and fun facts for personality |
| `publications.yaml` | Blog index or dedicated section | **Template partial** | Talks, papers, presentations |
| `volunteer.yaml` | About page | **Template partial** | Community involvement |
| `references.yaml` | Homepage or case studies | **Template partial** | Testimonial quotes |
| `awards.yaml` | About page | **Template partial** | Recognition and honors |
| `languages.yaml` | About page | **Template partial** | Spoken languages |
| Blog posts | `/blog/<slug>/` | **Manual markdown** | Creative content, not structured data |

---

## Implementation Architecture

### Full Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│  professional-portfolio-source (GitHub)                       │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ data/                                                  │  │
│  │   basics.yaml    work.yaml      skills.yaml            │  │
│  │   education.yaml certificates.yaml projects.yaml       │  │
│  │   services.yaml  engagements.yaml  publications.yaml   │  │
│  │   volunteer.yaml interests.yaml    references.yaml     │  │
│  │   awards.yaml    languages.yaml                        │  │
│  └────────────────────────────────────────────────────────┘  │
│  go.mod → module github.com/Perts-Foundry/                   │
│           professional-portfolio-source                       │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            │  Hugo Module Import
                            │  mount: data/ → data/portfolio/
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  perts-foundry-website                                       │
│                                                              │
│  config/_default/module.toml                                 │
│    imports: [blowfish, professional-portfolio-source]         │
│                                                              │
│  hugo.Data.portfolio.services ─┐                             │
│  hugo.Data.portfolio.engagements ─┤                          │
│  hugo.Data.portfolio.projects ─┤  Content Adapters           │
│                                │  (_content.gotmpl)          │
│                                ▼                             │
│                          Generated Pages                     │
│                          /services/<slug>/                    │
│                          /case-studies/<slug>/                │
│                          /projects/<slug>/                    │
│                                                              │
│  hugo.Data.portfolio.basics ───┐                             │
│  hugo.Data.portfolio.work ─────┤                             │
│  hugo.Data.portfolio.skills ───┤  Template Partials          │
│  hugo.Data.portfolio.* ────────┤  (layouts/partials/         │
│                                 │   portfolio/*.html)        │
│                                 ▼                            │
│                          Rendered within pages               │
│                          /about/                             │
│                          / (homepage)                        │
│                          /contact/                           │
│                                                              │
│  content/blog/**  ──────────────→  Manual markdown pages     │
└──────────────────────────────────────────────────────────────┘
```

### File Structure (New/Modified)

```
perts-foundry-website/
├── config/_default/
│   └── module.toml                    # MODIFIED — add portfolio-source import
├── content/
│   ├── services/
│   │   ├── _index.md                  # KEPT — section list page
│   │   ├── _content.gotmpl            # NEW — generates pages from services.yaml
│   │   ├── cloud-infrastructure/      # REMOVED — replaced by adapter
│   │   └── cicd-pipelines/            # REMOVED — replaced by adapter
│   ├── case-studies/
│   │   ├── _index.md                  # KEPT — section list page
│   │   ├── _content.gotmpl            # NEW — generates pages from engagements.yaml
│   │   └── saas-cloud-migration/      # ALREADY REMOVED (was placeholder content)
│   ├── projects/
│   │   ├── _index.md                  # NEW — section list page
│   │   └── _content.gotmpl            # NEW — generates pages from projects.yaml
│   ├── about/
│   │   └── index.md                   # MODIFIED — uses portfolio data partials
│   └── blog/                          # UNCHANGED — manual content
├── layouts/
│   ├── partials/
│   │   └── portfolio/                 # NEW — all portfolio data partials
│   │       ├── work-timeline.html
│   │       ├── skills-grid.html
│   │       ├── education.html
│   │       ├── certificates.html
│   │       ├── interests.html
│   │       ├── testimonials.html
│   │       ├── basics-contact.html
│   │       └── publications.html
│   ├── services/
│   │   └── single.html               # NEW — layout for generated service pages
│   ├── case-studies/
│   │   └── single.html               # NEW — layout for generated case study pages
│   └── projects/
│       └── single.html               # NEW — layout for generated project pages
├── go.mod                             # MODIFIED — adds portfolio-source dependency
└── go.sum                             # MODIFIED — updated checksums
```

---

## CI/CD Considerations

### Private Module Access

Both local development and CI need access to the private portfolio repo via Go modules.

**Hugo-native `private` config (preferred):**

Hugo's module configuration supports a `private` setting that automatically sets `GOPRIVATE` during module operations. This is cleaner than requiring env vars in multiple places:

```toml
# config/_default/module.toml
private = "github.com/Perts-Foundry/*"

[[imports]]
  path = "github.com/nunocoracao/blowfish/v2"

[[imports]]
  path = "github.com/Perts-Foundry/professional-portfolio-source"
  [[imports.mounts]]
    source = "data"
    target = "data/portfolio"
```

**Local development:**

Git must be configured to use SSH or a token for `github.com/Perts-Foundry` repos. If using HTTPS:

```bash
git config --global url."https://${GITHUB_TOKEN}@github.com/Perts-Foundry/".insteadOf "https://github.com/Perts-Foundry/"
```

As a fallback (or if not using Hugo's `private` config), set `GOPRIVATE` in your shell profile:

```bash
# Add to shell profile (~/.bashrc, ~/.zshrc, or .envrc)
export GOPRIVATE="github.com/Perts-Foundry/*"
```

**CI (GitHub Actions):**

Both `validate.yml` and `deploy.yml` workflows need Go module access configured. The `PORTFOLIO_TOKEN` secret needs `repo` scope to read the private portfolio repo and must be added to the website repo's GitHub secrets.

```yaml
env:
  GOPRIVATE: github.com/Perts-Foundry/*

steps:
  - uses: actions/checkout@v4

  - name: Configure Go module access
    run: git config --global url."https://x-access-token:${{ secrets.PORTFOLIO_TOKEN }}@github.com/".insteadOf "https://github.com/"

  - name: Build
    run: hugo --gc --minify --cleanDestinationDir
```

**Offline builds with `hugo mod vendor`:**

For resilience against GitHub outages, Hugo supports vendoring module content locally. The `.gitignore` already accounts for the `_vendor/` directory:

```bash
hugo mod vendor  # Copies module files into _vendor/
```

Hugo automatically uses vendored content when `_vendor/` is present. This can be committed for fully reproducible CI builds that don't require network access.

### Cross-Repo Rebuild Trigger

When portfolio data changes, the website should rebuild. Add a dispatch workflow to the portfolio repo:

```yaml
# In professional-portfolio-source: .github/workflows/notify-website.yml
name: Notify Website
on:
  push:
    branches: [main]
    paths: ['data/**']

jobs:
  dispatch:
    runs-on: ubuntu-latest
    steps:
      - uses: peter-evans/repository-dispatch@v4
        with:
          token: ${{ secrets.WEBSITE_DISPATCH_TOKEN }}
          repository: Perts-Foundry/perts-foundry-website
          event-type: portfolio-data-updated
```

The website's deploy workflow can then listen for this event:

```yaml
# In perts-foundry-website: .github/workflows/deploy.yml
on:
  workflow_dispatch:
  repository_dispatch:
    types: [portfolio-data-updated]
```

**Important:** The dispatch-triggered build must update the module pin before building, otherwise it builds with stale data. Two approaches:

- **Auto-update (simpler):** Add `hugo mod get -u` before `hugo --gc --minify` in the deploy workflow. This always pulls the latest portfolio data at build time.
- **PR-based (safer):** The dispatch workflow creates a PR that runs `hugo mod get -u` and commits the updated `go.mod`/`go.sum`. This lets you review data changes before they hit the live site.

For the auto-update approach, the deploy workflow build step becomes:

```yaml
- name: Update portfolio data and build
  run: |
    hugo mod get -u github.com/Perts-Foundry/professional-portfolio-source
    hugo --gc --minify --cleanDestinationDir
```

**Secret management note:** This setup requires two cross-repo tokens: `WEBSITE_DISPATCH_TOKEN` in the portfolio repo and `PORTFOLIO_TOKEN` in the website repo. These are separate PATs with different scopes that must be rotated in coordination. A GitHub App installation token could serve both purposes with less operational burden.

### Module Version Pinning

The `go.mod` file pins the portfolio module to a specific commit hash. To update:

```bash
# Pull latest from main
hugo mod get -u github.com/Perts-Foundry/professional-portfolio-source

# Pin to specific commit
hugo mod get github.com/Perts-Foundry/professional-portfolio-source@abc1234

# Pin to tag (if using semantic versioning)
hugo mod get github.com/Perts-Foundry/professional-portfolio-source@v1.0.0
```

### pa11y-ci URL Maintenance

The `.pa11yci` config file contains a hardcoded list of page URLs for accessibility testing. When adapter-generated pages replace manual pages, these URLs will change and new ones will appear (e.g., 9 services instead of 2). The URL list must be updated to match the generated pages, or pa11y-ci should be switched to sitemap-based URL discovery to avoid ongoing maintenance:

```json
{
  "defaults": { "standard": "WCAG2AA" },
  "sitemap": "http://localhost:8080/sitemap.xml"
}
```

### htmltest

The htmltest configuration (`.htmltest.yml`) runs against the `public/` build output generically and does not need changes — it will automatically validate generated pages.

---

## Migration Path

Three pages currently exist as manually-written markdown that will be replaced by content adapter-generated pages. Additionally, the 9 entries in `services.yaml` will generate 9 pages — significantly expanding the services section beyond the current 2 manual pages.

### Step 1: CI/CD access (must come first)

Configure `GOPRIVATE` and `PORTFOLIO_TOKEN` in both the `validate.yml` and `deploy.yml` workflows. Without this, the Hugo Module import in Step 2 will break CI on every subsequent PR. Add the `private` setting to `module.toml`.

### Step 2: Wire up the Hugo Module import

Add the portfolio source as a module import in `module.toml`. Verify data loads locally with a test template that dumps `hugo.Data.portfolio.services`.

### Step 3: Build content adapters and custom layouts

Create `_content.gotmpl` files and corresponding `single.html` layouts together for services, case studies, and projects. These are tightly coupled — an adapter without a layout renders with Blowfish's default template, which is not what you're validating. Run the site and compare adapter-generated pages against existing manual pages side by side.

**Important:** All new templates must use `hugo.Data` (not `.Site.Data`), which was deprecated in Hugo v0.156.0. Writing deprecated code on day one would add immediate tech debt.

### Step 4: Build template partials

Create `layouts/partials/portfolio/` with partials for the about page: work timeline, skills grid, education, certificates, interests.

### Step 5: Populate prerequisite data

Before removing manual pages, ensure the portfolio data covers all existing content:

- **`engagements.yaml`** must contain at least the `saas-cloud-migration` entry with `published: true` and a matching `slug`, or the case studies section will have zero pages after migration.
- Verify that `services.yaml` entries with slugs `cloud-infrastructure` and `cicd-pipelines` exist (they already do).

### Step 6: Remove manual content pages

Once adapters are verified and data is populated, remove the manually-written pages:

- `content/services/cloud-infrastructure/index.md` (and `featured.jpg`)
- `content/services/cicd-pipelines/index.md` (and `featured.jpg`)
- `content/case-studies/saas-cloud-migration/index.md` (and `featured.jpg`) — already removed

**Note:** Running both manual and adapter-generated pages simultaneously for the same slug will cause a Hugo path collision. To compare before removing, temporarily rename the manual page slugs.

### Step 7: Update about page

Modify `content/about/index.md` to use portfolio data partials instead of static text.

### Step 8: Update pa11y-ci and cleanup

- Update `.pa11yci` URL list to match generated page URLs, or switch to sitemap-based discovery.
- The `archetypes/case-studies.md` archetype becomes vestigial once case studies are generated by adapters. Either remove it or add a comment explaining that case studies are now generated from YAML data.

### Step 9: Cross-repo dispatch

Add the `notify-website.yml` workflow to the portfolio repo so data changes trigger website rebuilds. Add the `repository_dispatch` trigger to the website's deploy workflow.

### Validation

At each step, run the full validation suite:

```bash
hugo --gc --minify --cleanDestinationDir
htmltest
npx serve public -l 8080 & npx pa11y-ci
npx markdownlint-cli2 "content/**/*.md"
npx prettier --check "content/**/*.md" ".github/**/*.yml"
```

---

## Known Limitations and Watchpoints

### Content Adapter Constraints

- **`.Site.Pages` unavailable during adapter execution** — the site is not fully initialized when adapters run. Each section's adapter must be self-contained; it cannot query pages from other sections. This is fine for this use case since each section generates from its own data file.
- **No page bundle resources** — generated pages cannot have co-located images. Hero images, diagrams, or screenshots must live in `static/img/` or `assets/img/` and be referenced by path. Alternatively, `$.AddResource` can attach resources programmatically.
- **Path collisions** — if two adapter entries produce the same `path`, the result is indeterminate. Use Hugo's `--printPathWarnings` flag to detect this. The `slug` fields in portfolio data should be unique by schema convention.

### Blowfish Theme Compatibility

- Generated pages must provide front matter fields that Blowfish expects for rendering (title, description, params). Test that article cards, list views, and single-page layouts render correctly.
- The theme's `article-link/simple.html` partial (already overridden for accessibility) may need adjustment for generated page params.
- Section `_index.md` files control list page behavior and must be retained even when individual pages are generated by adapters.
- **`cascade` propagation is unverified.** The current `_index.md` files use `cascade` settings (`showDate: false`, `showAuthor: false`, `showReadingTime: false`). Whether these cascade to adapter-generated pages (which are not file-backed children) must be tested. If cascade does not propagate, these params must be set explicitly in each adapter's `params` dict:

```go-html-template
"params" (dict
  "showDate" false
  "showAuthor" false
  "showReadingTime" false
  ...
)
```

### Draft / Published State

Content adapters don't automatically respect Hugo's `draft` concept. Implement filtering in the adapter:

- For engagements: check the `published` field before calling `$.AddPage`
- For services: all entries are published by default (no draft concept in portfolio data)
- For projects: consider adding a `published` field to the schema if needed

### Featured Image Strategy

The existing manually-written pages have co-located `featured.jpg` files as page bundle resources. Blowfish's `article-link/simple.html` partial looks for page resources matching `*feature*`, `*cover*`, `*thumbnail*` patterns to render card images. Content adapter-generated pages cannot provide these as traditional page bundle resources.

**Recommended approach: `$.AddResource` with images in `assets/`**

Store featured images in `assets/img/services/`, `assets/img/case-studies/`, etc. In the content adapter, use `$.AddResource` to attach them as page resources:

```go-html-template
{{/* content/services/_content.gotmpl */}}
{{ range hugo.Data.portfolio.services }}
  {{ $imgPath := printf "img/services/%s.jpg" .slug }}
  {{ $img := resources.Get $imgPath }}

  {{ $content := dict "mediaType" "text/markdown" "value" .description }}
  {{ $page := dict
    "content" $content
    "kind" "page"
    "path" .slug
    "title" .name
    "params" (dict
      "description" .summary
      "summary" .summary
      "technologies" .technologies
      "tags" .tags
      "weight" .weight
    )
  }}
  {{ $p := $.AddPage $page }}

  {{ with $img }}
    {{ $resource := dict "resource" . "name" "featured.jpg" }}
    {{ $.AddResource $p $resource }}
  {{ end }}
{{ end }}
```

This makes the image available as a page resource named `featured.jpg`, which Blowfish's image lookup will find. Pages without a corresponding image file in `assets/` simply won't have a featured image.

**Alternative approaches:**

- **Option B**: Mount the portfolio repo's `assets/` directory alongside data and source images from there
- **Option C**: Use external image URLs (S3, R2, CDN) referenced in the YAML data and use `resources.GetRemote` in the adapter

### RSS Feed Control

Adapter-generated pages appear in the site's RSS feed by default (configured as `home = ["HTML", "RSS", "JSON"]` in `hugo.toml`). If all 9 services and all engagements appearing in RSS is undesirable, control this in the adapter by setting `_build` params or by configuring section-level output formats in `_index.md`:

```yaml
# content/services/_index.md
cascade:
  _build:
    render: always
    list: local  # Appear in section lists but not RSS
```

### Markdown in YAML

The `description` fields in services and engagements contain markdown. Content adapters support `"mediaType": "text/markdown"` in the content dict, so Hugo will process it through its markdown renderer (Goldmark). Verify that markdown features used in descriptions (headings, lists, code blocks, links) render correctly.

### Data Staleness

The `go.sum` file pins the portfolio module to a specific commit. The website won't pick up portfolio changes automatically — either:

1. Run `hugo mod get -u` manually before building, or
2. Use the cross-repo dispatch workflow to trigger a rebuild that updates the module (see CI/CD Considerations for the auto-update vs PR-based approaches)

### Hugo API Deprecation

`.Site.Data` was deprecated in Hugo v0.156.0. This project runs Hugo 0.157.0, so `.Site.Data` currently produces deprecation warnings and will become an error in approximately 12 months. All templates — both content adapters and partials — must use `hugo.Data` instead. The `hugo.Data` global function works in all template contexts, including content adapters where the dot context is the adapter object rather than a page.

---

## Comparison Matrix

| | Hugo Modules | Git Submodules | CI/CD Copy | Remote Fetch |
|---|---|---|---|---|
| **Generates pages?** | No (mount only) | No (mount only) | No (copy only) | No (template only) |
| **Local dev works?** | Yes | Yes | Needs script | Yes (cached) |
| **Requires Go?** | Yes | No | No | No |
| **Version pinning?** | go.mod hash | Commit hash | Workflow config | Cache/URL |
| **Update mechanism** | `hugo mod get -u` | `git submodule update` | Re-run workflow | Rebuild |
| **Private repo support** | GOPRIVATE + token | SSH/HTTPS | Checkout token | URL token |
| **Hugo-idiomatic?** | Yes | Partially | No | Partially |
| **Already in use?** | Yes (Blowfish) | No | No | No |
| **Complexity** | Medium | Medium | Medium | Low |
| **Community recommendation** | Strongly recommended | Legacy approach | Pragmatic glue | External APIs only |

| | Data + Templates (Pattern A) | Content Adapters (Pattern B) |
|---|---|---|
| **Generates standalone pages?** | No | Yes |
| **Eliminates content duplication?** | No | Yes |
| **Hugo version requirement** | Any | >= 0.126.0 |
| **Learning curve** | Low (Go templates) | Medium (adapter API) |
| **Best for** | Supplemental data on existing pages | Sections driven entirely by data |

**Recommended combination: Hugo Modules (import) + Content Adapters (page-generating sections) + Template Partials (supplemental sections) = Hybrid B**
