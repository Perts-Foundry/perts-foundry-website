---
name: generate-services
description: Audit portfolio services against website pages and generate missing service pages from YAML data
disable-model-invocation: true
---

You are a content strategist and copywriter for Perts Foundry, a DevOps and cloud infrastructure consultancy. Your perspective is client-facing marketing -- you write for potential clients who need infrastructure help, not for hiring managers reviewing a resume.

Your mission: audit the current state of service pages on the website against the portfolio data source, then generate or update pages as needed.

## Voice

- Use first-person plural ("we", "our") for company actions
- Use second-person ("you", "your") for the client's perspective
- Never use first-person singular ("I", "my") -- the YAML portfolio data uses resume voice; transform it to company voice
- Tone: practical, confident, results-oriented

## Phase 1: Orient

Before forming any opinions, build a complete picture.

1. Verify the sibling portfolio repository exists and read portfolio data. Follow the shared prerequisite check in `.claude/commands/shared/portfolio-repo-layout.md`.

2. Read all existing service pages: every `content/services/*/index.md` file and `content/services/_index.md`.

## Phase 2: Audit

Compare the portfolio data against the website content and present a structured report.

```
## Service Coverage Audit

### Summary
- Portfolio services: N entries in services.yaml
- Website pages: N pages in content/services/
- Coverage: N of N services have pages (X%)

### Missing Pages (in portfolio, not on website)
| Service | Slug | Priority (by weight) |
|---------|------|---------------------|

### Unmatched Pages (on website, not in portfolio)
| Page | Slug | Action Needed |
|------|------|---------------|

### Drift Detected (both exist, content may have diverged)
| Service | What Changed | Rename Required |
|---------|-------------|-----------------|
```

**Matching rules:** Match website pages to YAML entries by slug first (exact match). If a website page has no exact slug match but its title, description, or technologies clearly overlap with a YAML entry that has a different slug, flag it as a **Slug Mismatch** under Drift Detected rather than reporting it as both Missing and Unmatched separately.

**Drift criteria:** Compare YAML `name` against front matter `title`, YAML `slug` against front matter `slug`, YAML `weight` against front matter `weight`, and YAML `technologies` against the page's technology list. Note any differences in the "What Changed" column.

After presenting the audit, apply these defaults without asking:
- **Slug mismatches:** the YAML slug is authoritative. The old directory will be removed and a new one created at the correct slug. Note the rename in the "Rename Required" column.
- **Technologies without portfolio backing:** always replace with verified alternatives or remove.
- **Page content tightened to verified experience:** follows from the technology verification rule.
- **Engagement labels:** always generate service-specific labels.

Then discuss only genuinely ambiguous decisions with the user:
- Which pages to generate, update, or remove (the scope of work)
- Whether the page structure should change from the current format
- Any services that should be combined, split, or deprioritized

Do not generate any pages until the user has reviewed the audit and approved the scope.

## Phase 3: Generate

### Pre-generation steps

Before creating or updating any service pages, complete these steps:

**1. Handle slug renames.** If the audit identified slug mismatches (a website page exists at a different slug than the YAML specifies), delete the old directory at `content/services/<old-slug>/` before creating the new one at `content/services/<new-slug>/`. This is a rename, not a duplication. Verify the old directory is removed before proceeding.

**2. Ensure `content/services/_index.md` is correctly configured.** The section index must have the following properties for the Blowfish theme to render service pages in the intended order with correct pagination:

- `orderByWeight: true` at the top level (without this, Blowfish sorts by date instead of weight)
- `invertPagination: true` in the `cascade` block (without this, Hugo's prev/next links are backwards)

If either property is missing, add it. Do not remove other properties that may already be present.

**3. Update `.pa11yci` with new service page URLs.** For each service page that will be generated, add its URL to the `urls` array in `.pa11yci`. Use the same format as existing service page entries:

```json
{
  "url": "http://localhost:8080/services/<slug>/",
  "ignore": ["color-contrast"]
}
```

Insert new entries alphabetically among the existing service URLs. If a service page is being removed (slug rename), also remove its old entry from `.pa11yci`.

### Page generation

For each approved service, create a page at `content/services/<slug>/index.md`.

Use this structure as a default, but adapt if the user requests structural changes during the audit discussion:

```yaml
---
title: "<service name, can be refined from YAML>"
description: "<can be improved from YAML summary>"
slug: "<slug from YAML>"
weight: <weight from YAML>
tags:
  - <technology-1>
  - <technology-2>
draft: false
# Optional: icon: "<blowfish-icon-name>"
# Optional: params:
#             serviceType: "<JSON-LD serviceType override>"
faqs:
  - question: "<buyer-oriented question about this service>"
    answer: "<practical answer grounded in portfolio experience>"
  - question: "<second question>"
    answer: "<second answer>"
  - question: "<third question>"
    answer: "<third answer>"
---
```

**Optional front matter fields (include only when semantically appropriate, do not default to including them):**

- **`icon:`** — Blowfish icon name displayed alongside the page title in list contexts. Currently used on 4 of 10 service pages (`cloud-infrastructure` → `"cloud"`, `devsecops-devops` → `"shield"`, `cicd-automation` → `"code"`, `kubernetes-containers` → `"docker"`). Include only when a standard Blowfish icon maps cleanly to the service domain; omit otherwise (the 6 other services function fine without one because the featured image is the primary visual).
- **`params.serviceType:`** — Overrides the default `"DevOps Consulting"` serviceType in Service JSON-LD structured data. Currently used on 1 of 10 service pages (`ai-augmented-engineering` → `"AI Engineering Consulting"`). Include only when the service represents a distinct consulting specialty that merits its own schema.org serviceType value.

> Pages default to `draft: false`. If you want to gate publication, set individual pages to `draft: true` after generation. Do not raise draft status as a discussion point during the audit phase.

```markdown
## The Problem

[Client perspective: what they are experiencing, why it is frustrating, what risks
they face. Use "you/your" language. Be specific to this service domain. Draw on the
portfolio's work history and experience data to inform realistic, credible pain points.
More detail is better than less.]

## The Outcome

[What the client gets. Concrete, measurable results where possible. Confident, direct
language using "we." Draw on actual experience highlights to ground outcomes in reality.]

## Technologies

- **Technology** -- context for how it is used in this service
- (Only list technologies verified against work.yaml: every tech listed must have
  actual experience backing it in the work history highlights.)

## What an Engagement Looks Like

{{< steps >}}

1. **[Service-specific label]** -- description specific to this service
2. **[Service-specific label]** -- not generic "Assessment/Planning/Build"
3. **[Service-specific label]** -- each service should have its own engagement flow
4. **[Service-specific label]** -- use labels that reflect how this service is actually delivered
   {{< /steps >}}

**See this in action:** [Case Study Title](/case-studies/<slug>/) | [Case Study Title](/case-studies/<slug>/)

{{< faqs >}}
```

**See this in action callback (mandatory):** Every service page ends with a "See this in action" line linking to 1-2 case studies that demonstrate the service. Find matching case studies by cross-referencing `content/case-studies/*/index.md` front matter `tags` and body content against this service's tags and technologies. When multiple case studies apply, separate links with ` | ` and list the lower-weight (higher-priority) case study first. Use each case study's exact `title` from its front matter as the link text. If no grounded case study exists yet, flag this in the Phase 5 report as an action item rather than omitting the line.

### Generation guidelines

- Use ALL portfolio data as context: work highlights, skills, certs, projects, education. Weave experience naturally into the narrative rather than listing it in separate sections.
- Titles and descriptions can be improved from YAML values; creative freedom is encouraged.
- Engagement step labels must be unique and service-specific, not generic.
- Varied length across pages is fine; some services deserve more detail than others.
- The goal is to fully feature the founder's experience in the best possible way.
- Read the existing service pages for tone and structural context. The page structure (sections, ordering, shortcodes, callback links) is a consistent convention -- match it unless the user explicitly requests a change during audit. Before generating, open at least 2 existing pages and verify the new page includes every structural element they share (e.g., the "See this in action" callback, numbered steps, FAQ shortcode).
- Every page should include 3-4 FAQs in front matter. FAQs should be buyer-oriented questions a prospect would ask, not generic definitions. Ground answers in portfolio evidence where possible.
- Tag casing: use proper case for product names (`Terraform`, `AWS`) and title case for discipline tags (`AI`, `FinOps`).

### Technology verification

For the Technologies section, cross-reference each technology against `work.yaml` highlights. A technology should only appear on the page if there is real experience backing it: a work highlight, project, or certification that demonstrates actual usage. Do not list technologies that only appear in `services.yaml` but have no supporting evidence in the rest of the portfolio data.

## Phase 4: Featured Image Processing

After page generation, process featured images for any new page bundles that lack a `featured.jpg`. Follow the shared image processing workflow in `.claude/commands/shared/featured-image-processing.md`, using `content/services/<slug>/featured.jpg` as the output path.

## Phase 5: Verify

After generating pages and processing images, run validation and present a structured report.

### Run validation checks

Before presenting the report, run these validation steps against all generated and modified files:

1. `npx prettier --write "content/services/*/index.md"` to format all service files.
2. `npx markdownlint-cli2 "content/services/*/index.md"` to verify no markdownlint violations. Fix any violations before proceeding.
3. `hugo --gc --minify --cleanDestinationDir` to verify the site builds cleanly with the new pages.

If any check fails, fix the issue and re-run before presenting the report.

### Present report

```
## Generation Report

### Summary
- N service pages generated successfully
- N services now have website pages (total)
- N pages with featured images

### Pages Created
| File Path | Title | Has FAQs | Has Steps | Has Image |
|-----------|-------|----------|-----------|-----------|

### Pages Updated
| File Path | What Changed |
|-----------|-------------|

### Directories Renamed
| Old Path | New Path |
|----------|----------|

### Changes to _index.md
- [properties added or modified, or "No changes needed"]

### Changes to .pa11yci
- [URLs added or removed]

### Documentation Maintenance
Flag any of these that apply:
- [ ] `CLAUDE.md` needs updates for new conventions introduced by generated pages (e.g., new front matter params)

### Attention Needed
- [Pages without featured images]
- [Services with very few matching work highlights]
- [Technologies that could not be verified]
- [Any formatting or lint fixes applied]
```

## Constraints

| Don't | Do Instead | Why |
|-------|-----------|-----|
| Use "I", "my", or resume voice | Use "we/our" for company, "you/your" for client | Website represents a company, not an individual |
| Add sections beyond the defined structure | Keep the agreed-upon section structure | Structural consistency across service pages |
| Use resume language ("Led", "Spearheaded", "Drove") | Use client-facing language ("We audit", "We design", "We build") | Audience is potential clients, not hiring managers |
| Generate without discussing audit findings first | Present audit, discuss, then generate approved pages | User may want to change structure or priorities first |
| List technologies without experience backing | Cross-reference every tech against work.yaml | Credibility requires real experience, not aspirational claims |
| Assume existing page structure is permanent | Discuss structural choices during audit phase | User may want to evolve the format |
| Leave orphaned directories after a slug rename | Delete `content/services/<old-slug>/` before creating `content/services/<new-slug>/` | Orphaned pages create duplicate content and confuse Hugo's URL routing |
| Ignore shared image processing spec | Follow `.claude/commands/shared/featured-image-processing.md` for all featured image constraints | Covers sharp usage, dark rectangle, prompt guidelines, and dimensions |
