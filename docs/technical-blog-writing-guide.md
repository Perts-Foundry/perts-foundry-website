# Technical Blog Writing Guide

> **Last updated:** 2026-04-06
> **Reference:** `docs/building-a-credible-solo-devops-consulting-website.md`
> **Roadmap items:** C2 (blog re-enablement), M6 (SEO optimization)

This document is a comprehensive reference for writing technical blog posts that build
authority, drive organic traffic, and generate consulting leads. It covers strategy,
craft, SEO, distribution, and Hugo-specific guidance for the Perts Foundry website.

---

## Table of Contents

1. [Business Case](#1-business-case)
2. [Content Strategy](#2-content-strategy)
3. [Hugo/Site-Specific Guidance](#3-hugosite-specific-guidance)
4. [Post Types That Work](#4-post-types-that-work)
5. [Writing Craft](#5-writing-craft)
6. [SEO Optimization](#6-seo-optimization)
7. [Distribution Strategy](#7-distribution-strategy)
8. [Measuring Success](#8-measuring-success)
9. [Exemplary Blogs to Study](#9-exemplary-blogs-to-study)
10. [Common Mistakes](#10-common-mistakes)
11. [Launch Plan](#11-launch-plan)
12. [Blog Post Checklist](#12-blog-post-checklist)
13. [Editorial Calendar Template](#13-editorial-calendar-template)
14. [Quick Reference Card](#14-quick-reference-card)

---

## 1. Business Case

**Purpose:** Why blog at all, backed by data. The investment case for a solo DevOps
consultant committing to regular technical content.

### The Compounding Effect

Technical blog content is one of the few marketing investments that appreciates over
time. Unlike paid ads (which stop generating leads when you stop paying) or conference
talks (which reach a fixed audience once), a well-written blog post ranks in search
results for years.

Key data points:

- **40-60%** of inbound opportunities for established consulting firms come from thought
  leadership content (Hinge Marketing)
- **13x higher ROI** for companies that publish regularly vs. sporadically (HubSpot
  analysis of 13,500+ companies)
- **3:1 average ROI** for B2B content marketing, scaling to **748%** with proper SEO
  execution
- **2.5x higher conversion rate** from long-tail keyword traffic vs. head terms
- One consultant reported organic search traffic from blog content drives **at least
  half of their annual consulting revenue** (Tsavo Neal, consultant website study)

### The Consulting Lead Funnel

For a solo DevOps consultant, the funnel works like this:

```text
Engineer searches "how to fix Atlantis rate limiting"
  -> Finds your blog post with the exact solution
    -> Sees you offer Terraform consulting (internal link)
      -> Realizes their problem is bigger than a blog post can solve
        -> Books a discovery call
```

The blog post is not the product. It is a demonstration of judgment that makes the
prospect confident you can solve their specific problem.

### Timeline to Results

| Phase | Timeframe | What Happens |
|-------|-----------|--------------|
| Habit building | Months 1-3 | Establish voice, publish first articles, no meaningful traffic yet |
| Early traction | Months 4-6 | Posts begin indexing, first comments and shares, small but growing organic traffic |
| Measurable leads | Months 6-9 | SEO compounding begins, first consulting leads attributable to blog content |
| Authority recognized | Months 12-18 | Inbound leads become predictable, content referenced by others in the space |
| Compounding returns | Months 18+ | Evergreen posts generate traffic while you sleep, blog amplifies all other business activities |

### The Risk of a Stale Blog

The credibility guide is explicit: **"A blog with one stale post from six months ago
actively hurts your credibility more than having no blog at all."** Only commit to
blogging if you can sustain at least monthly publishing. The alternative (used for
this site's launch): publish 3-5 strong evergreen articles with hidden dates, then
add to the collection over time.

---

## 2. Content Strategy

**Purpose:** Define what to write about, how often, and how to keep content fresh.

### Content Pillars

Organize all blog content under 3-5 strategic pillars tied to service areas. Every post
should ladder up to one of these pillars, reinforcing expertise over time. Search engines
recognize topical authority when multiple posts cluster around a theme.

| Pillar | Service Pages It Supports | Example Topics |
|--------|--------------------------|----------------|
| DevOps & Infrastructure | IaC, CI/CD, DevSecOps | Terraform patterns, pipeline design, security automation |
| Cloud Architecture | Cloud Infrastructure, Cloud Migration, FinOps | Multi-cloud decisions, cost optimization, migration strategies |
| AI-Augmented Engineering | AI-Augmented Engineering | AI code review tooling, AI-assisted infrastructure, adoption patterns |
| Engineering Leadership | Agile Coaching, Incident Response | Team scaling, process improvement, reliability culture |

Three to five pillars is the sweet spot. Fewer leaves gaps in coverage; more dilutes
the message and makes it harder to build depth in any single area.

### Publishing Cadence

| Phase | Cadence | Rationale |
|-------|---------|-----------|
| Launch | 3-5 articles published as a batch | Credibility guide recommends launching with a collection, not a single post |
| Post-launch | 1 article per month | Sustainable for a solo consultant; consistency matters more than frequency |
| Scaling (optional) | 2 articles per month | Only if writing does not compete with billable work |

Consistency is more important than volume. Publishing 1 post per month for 12 months
straight is far more effective than publishing 4 posts in a burst then going silent.

### Evergreen vs. Timely Content

| Type | Definition | `showDate` | Update Strategy | Examples |
|------|-----------|------------|-----------------|---------|
| Evergreen | Remains relevant for 1+ years | `false` (hide date) | Update in-place every 6 months; note tool version changes | Architecture decision guides, methodology posts, cost optimization strategies |
| Timely | Relevant to a specific moment | `true` (show date) | Do not update; write a follow-up if the landscape changes | Tool release reactions, conference takeaways, ecosystem opinion pieces |

For a solo DevOps consulting blog, target **80% evergreen, 20% timely**. Evergreen
content compounds in search value; timely content drives short-term social engagement.

### Content Freshness Strategy

Technical content decays. Tool versions change, cloud services deprecate, best practices
evolve.

- **6-month review cadence:** Revisit each published post every 6 months. Check for
  outdated version numbers, deprecated tools, and stale recommendations.
- **Update in-place** for evergreen content. Add a `showDateUpdated: true` front matter
  field when the update is substantial. Hugo renders this as "Updated on [date]" below
  the title.
- **Write a new post** when the landscape has changed so fundamentally that the original
  framing no longer applies (e.g., a major tool rewrite, a paradigm shift).
- **Version-annotate code examples:** Include the tool version in prose or code comments
  (e.g., "Tested with Terraform 1.9" or `# Requires EKS 1.29+`). This helps readers
  assess applicability and helps you identify what needs updating during reviews.

---

## 3. Hugo/Site-Specific Guidance

**Purpose:** The operational setup for creating and publishing blog posts in this Hugo
site. Read this section first when starting a new post.

### Creating a New Blog Post

```bash
hugo new content blog/<slug>/index.md
```

This generates a page bundle directory with an `index.md` file populated from the blog
archetype (`archetypes/blog.md`).

### Front Matter Template

Copy-pasteable template with all fields:

```yaml
---
title: "Your Post Title Here"
date: 2026-04-06
draft: false
description: "150-160 character description with primary keyword."
slug: "your-post-slug"
tags:
  - Terraform
  - AWS
showDate: false
---
```

Posts use `draft: false` when content has been reviewed and approved via the
`generate-blog` command's Phase 2 discussion. Posts go live on merge. The blog archetype
(`archetypes/blog.md`) defaults to `draft: true` for manual authoring; the command
overrides this to match the service and case study page convention.

### Front Matter Fields

| Field | Required | Default | Notes |
|-------|----------|---------|-------|
| `title` | Yes | Auto-generated from directory name | Keep under 60 characters; include primary keyword early |
| `date` | Yes | Auto-populated | Used for sort order; not displayed when `showDate: false` |
| `draft` | Yes | `true` (archetype) | Command-generated posts use `false`; content approved during Phase 2 |
| `description` | Yes | Empty | 150-160 characters; serves as meta description AND listing card text |
| `slug` | Yes | Directory name | Must match directory name; forms the URL `/blog/<slug>/` |
| `tags` | Yes | Empty | Use proper case (e.g., `Terraform`, not `terraform`); reuse existing tags to power related content cross-linking |
| `showDate` | No | `false` (global default) | Override to `true` for timely content; credibility guide recommends hiding dates on evergreen articles |

**Optional fields not in the archetype but available:**

| Field | Purpose |
|-------|---------|
| `showDateUpdated` | Set to `true` to display the last-modified date when updating evergreen content |
| `dateUpdated` | The date of the update (e.g., `2026-06-15`); Hugo uses this for the displayed "Updated" label. Pair with `showDateUpdated: true` |
| `weight` | Manual sort order (lower = first); only needed if `orderByWeight: true` is added to `content/blog/_index.md` |

### Date Display Inheritance

The `showDate` setting has four layers:

1. **Global:** `config/_default/params.toml` sets `showDate = false` under `[article]`
2. **Section cascade:** `content/blog/_index.md` sets `showDate: false` (along with `showAuthor: false`, `showReadingTime: false`, `showHero: true`, `heroStyle: basic`) via cascade, matching the convention used by services and case studies
3. **Archetype:** `archetypes/blog.md` reinforces `showDate: false`
4. **Per-post:** Individual posts can override with `showDate: true` for timely content. Do not include `showDate: false` in individual post front matter; the cascade handles the default

The credibility guide explicitly recommends hiding dates on evergreen articles. When
a post is timely (tool release reaction, ecosystem opinion), override with `showDate:
true` so readers can assess recency.

### Featured Images

Blog posts should include a `featured.jpg` (or `featured.png`) in the page bundle
directory. This image is used for:

- Listing card thumbnails on the `/blog/` page
- Hero section when a reader opens the post
- Open Graph preview when shared on social media

Posts without a featured image render differently on listing pages and produce a generic
social preview. Match the convention used by services and case studies.

### Markdown Constraints

Hugo's Goldmark renderer is configured with `unsafe = false` (`config/_default/markup.toml`).
This means **no raw HTML is allowed in blog content**. The renderer will silently strip
any HTML tags.

**What you cannot do:**

- `<details>` / `<summary>` toggles
- `<figure>` with captions
- Custom `<div>` wrappers or styled containers
- Inline `<style>` or `<script>` tags
- `<iframe>` embeds

**What to use instead:**

- **Expandable content:** Use the `{{</* faqs */>}}` shortcode with front matter `faqs`
  array (renders native `<details>/<summary>` accordion)
- **Styled lists:** Use the `{{</* steps */>}}` shortcode for numbered step sequences
- **Technology pills:** Use `{{</* tech-tags "Terraform, AWS, Kubernetes" */>}}`
- **Inline metrics:** Use `{{% metric "key" %}}` to pull from `data/metrics.toml`
- **Standard markdown** for everything else (tables, code blocks, images, blockquotes)

### Related Content System

The site has related content enabled:

- `showRelatedContent = true` in `config/_default/params.toml`
- `relatedContentLimit = 3` (three related items shown at the bottom of each post)
- Related content is **tag-based**: posts sharing tags with services and case studies
  will cross-link automatically

**Tag strategy for blog posts:** Reuse existing tags from service pages and case studies
(see the full tag list in [Section 14](#14-quick-reference-card)). This powers
cross-linking between blog posts, services, and case studies. A blog post tagged
`Terraform` and `AWS` will show related Terraform case studies and AWS service pages
in its "Related Content" section, and vice versa.

### Post Ordering

The blog section uses Hugo's default date-based ordering (newest first). Since
`showDate: false` hides the date from readers, the display order is controlled by the
`date` field in front matter without exposing it.

If manual ordering is needed in the future, add `orderByWeight: true` to
`content/blog/_index.md` and include `weight` fields in blog post front matter
(matching the convention used by services and case studies).

### Permalink Pattern

Blog posts resolve to: `https://pertsfoundry.com/blog/<slug>/`

Configured in `config/_default/hugo.toml` as `blog = "/blog/:slug/"`.

---

## 4. Post Types That Work

**Purpose:** Which content formats drive consulting leads, with data on what decision-makers prefer.

### Post Type Reference

| Type | Description | When to Use | Audience | Lead Potential |
|------|-------------|-------------|----------|---------------|
| **Tutorial / How-To** | Step-by-step guide with working code | Targeting a specific search query ("how to migrate from ECR to GAR") | Practitioners | Medium (solves a problem; reader may need more help) |
| **War Story / Case Study Extract** | Narrative from a real project with lessons learned | Extracting from existing case studies into a longer, more technical narrative | Mixed (practitioners + decision-makers) | High (demonstrates judgment and real experience) |
| **Opinion / Thought Leadership** | Opinionated take backed by evidence | When you have a contrarian or expert perspective on a trending topic | Decision-makers | High (positions you as a thinker, not just a doer) |
| **Comparison / Decision Guide** | Side-by-side analysis of tools or approaches | When readers face a technology choice ("ECS vs. EKS for multi-tenant workloads") | Mid-senior engineers, architects | High (reader is actively making a decision you can help with) |
| **Deep Dive / Technical Analysis** | Comprehensive exploration of one topic | When you have deep, non-obvious knowledge about a tool or pattern | Advanced practitioners | Medium (builds authority; reader is usually self-sufficient) |
| **Listicle / Roundup** | Numbered collection of tips, tools, or patterns | When covering breadth on a topic ("5 AWS cost leaks every startup ignores") | Broad | Medium (shareability is high; depth is lower) |

### What Decision-Makers Prefer

Research on executive content preferences (Edelman/LinkedIn B2B study):

- **46%** prefer case studies
- **37%** prefer shorter research-based articles
- **35%** prefer opinion pieces
- **33%** prefer interactive data tools
- **22%** prefer long research reports

For a consulting blog, the highest-ROI mix is: **war stories and case study extracts**
(prove you have done the work), **opinion pieces** (prove you have perspective), and
**comparison guides** (catch readers at decision points).

### The "Mini-Consulting Session" Test

The credibility guide says each article should feel like **"a valuable mini-consulting
session."** The test: after reading, does the reader think "this person clearly
understands my problem and has a framework for solving it"? If the answer is yes,
you have demonstrated judgment. If the reader just learned a fact, you have
demonstrated knowledge (less valuable for lead generation).

### Anonymization for War Stories and Portfolio-Sourced Content

When blog posts reference specific client work (war stories, case study extracts, or any
post grounded in portfolio experience), the same anonymization boundaries that apply to
case studies must be followed. These are defined as SPEC-1 through SPEC-6 in the
`generate-case-studies` command (`.claude/commands/generate-case-studies.md`):

- **SPEC-1:** Never name the client organization.
- **SPEC-2:** Do not disclose revenue, headcount, or other client business metrics not in
  the portfolio data.
- **SPEC-3:** Do not name specific internal tools or proprietary systems unless the
  technology is public (e.g., Snowflake, Terraform).
- **SPEC-4:** Do not reference specific teams, managers, or organizational structure by
  name.
- **SPEC-5:** Vary client descriptors across blog posts and case studies referencing the
  same client to reduce the correlation surface.
- **SPEC-6:** Do not use specific dates, quarters, or narrow time ranges. Use relative
  durations (e.g., "over the course of a quarter").

When a blog post references the same client engagement as an existing case study, evaluate
whether the combination increases the identification surface beyond what either piece
alone would reveal.

---

## 5. Writing Craft

**Purpose:** How to structure and write each post for maximum impact and readability.

### Post Structure

Every post should follow this skeleton:

1. **Hook** (first 2 sentences): State the problem or pain point. Make the reader think
   "that is exactly what I am dealing with."
2. **Context** (1-2 paragraphs): Why this problem matters, what is at stake, who faces it.
3. **Body** (the bulk): Your analysis, solution, tutorial, or argument. Use H2 sections
   with keyword-rich headings. Break into digestible chunks.
4. **Conclusion** (1-2 paragraphs): Recap the key insight. Do not just summarize. Add
   the "so what" that connects back to the reader's situation.
5. **CTA** (final paragraph): Link to a service page or the contact page. Frame it as
   the natural next step for a reader whose problem is bigger than a blog post.

### Formatting Rules

| Rule | Guideline | Why |
|------|-----------|-----|
| Paragraphs | 3-4 sentences max | Long paragraphs lose readers; web reading is scanning, not linear |
| Headings | H2 for main sections, H3 for subsections; heading every 200-300 words | Heading hierarchy powers both readability and SEO |
| Code blocks | Always include language annotation (` ```hcl `, ` ```yaml `, etc.) | Syntax highlighting aids comprehension; screen readers use language hints |
| Code completeness | Every snippet must be complete and functional | Broken code destroys credibility instantly; version-annotate with tool versions |
| Lists | Use bullet lists for 3+ related items | Scannable; break up wall-of-text patterns |
| Bold | Use for key terms and stats on first mention | Aids scanning; draws attention to important data |
| Blockquotes | Use for callouts, key takeaways, or important warnings | Visual break that signals "pay attention to this" |
| Images/diagrams | Include 1-2 per major section if they clarify the concept | Diagrams improve comprehension and shareability; use Mermaid or Draw.io |
| No em dashes | Restructure with commas, semicolons, parens, or periods | Project formatting convention |

### The Hook

The hook is the most important part of the post. It determines whether the reader
continues or bounces. Three patterns that work:

1. **Pain-point hook:** "There is a moment in every startup's life where the
   infrastructure that 'just works' starts to become the thing that holds everything
   back." (from the existing IaC draft)
2. **Counter-intuitive hook:** "The most dangerous CI/CD pipeline is the one that
   has never failed."
3. **Specific-metric hook:** "We reduced Atlantis plan failures from 15 per week to
   zero by replacing a single GitHub integration."

Avoid generic hooks like "In today's fast-paced DevOps landscape..." These signal
that nothing specific or valuable follows.

### The Answer-First Pattern

For posts targeting featured snippets (especially "how to" and "what is" queries),
put the direct answer in a concise paragraph (40-60 words) immediately after the
H2 heading that poses the question. Google extracts these paragraphs as position-zero
snippets.

Example:

```markdown
## When should you switch from CloudFormation to Terraform?

Switch when your infrastructure spans multiple cloud providers, when your team
needs a plan-before-apply workflow with human-readable diffs, or when your module
ecosystem outgrows CloudFormation's nested stack limitations. The migration cost
is front-loaded; most teams see productivity gains within two months.
```

### Storytelling with Data

Stories are **22x more memorable** than statistics alone. Marketers combining narrative
with data see a **30% increase in conversion rates**. The most effective consulting
blog posts combine both:

- **Weak:** "Terraform reduces infrastructure deployment time."
- **Strong:** "The team was deploying infrastructure changes through a manual runbook
  that took 2 hours per environment. After codifying the process in Terraform with
  Atlantis for CI/CD, the same change took 8 minutes and went through code review."

Use the Problem-Action-Result (PAR) framework for case study extracts:

- **Problem:** What was broken and why it mattered
- **Action:** What you did (this is where the judgment lives)
- **Result:** Specific, measurable outcomes

### CTAs for a Consulting Blog

Every post should end with a path to the next step. Never end with just "Thanks for
reading." Three CTA patterns:

1. **Service link:** "If [problem described in this post] sounds familiar, our
   [service name](/services/slug/) engagements start with exactly this kind of
   assessment."
2. **Contact direct:** "Working through a similar challenge? [Let's talk](/contact/)
   about what a targeted engagement looks like."
3. **Related content:** "For a deeper look at how this played out in practice, read
   our case study on [case study title](/case-studies/slug/)."

### Markdown Constraints Reminder

Since `goldmark.renderer.unsafe = false`, blog posts cannot use raw HTML. This means:

- No `<details>` toggles (use the `faqs` shortcode instead)
- No `<figure>` captions (use standard `![alt text](image.jpg "title")` syntax)
- No custom `<div>` containers
- No inline `<style>` or `<script>`

Use standard markdown and the available shortcodes (`tech-tags`, `steps`, `metric`,
`certification-badges`, `faqs`). See [Section 3](#3-hugosite-specific-guidance) for
the full list.

---

## 6. SEO Optimization

**Purpose:** On-page SEO practices and keyword strategy for technical content.

### Keyword Strategy

Technical blog posts should target **long-tail keywords** that service pages do not.
Long-tail keywords (3+ words) have **2.5x higher conversion rates** than head terms
because the searcher has a specific problem.

| Layer | Keyword Type | Example | Owned By |
|-------|-------------|---------|----------|
| Head term | 1-2 words, high volume | "Terraform consulting" | Service page |
| Mid-tail | 2-3 words, medium volume | "Terraform best practices" | Service page or blog (depends on competition) |
| Long-tail | 3+ words, lower volume, higher intent | "how to fix Atlantis rate limiting GitHub" | Blog post |

**Content cannibalization warning:** Blog posts must not compete with service pages for
the same keywords. Service pages own the primary commercial terms. Blog posts target
the specific problems, questions, and comparisons that lead readers toward those
service pages. Always link from the blog post to the relevant service page.

### Keyword Research Approach

Without paid tools, use these free methods:

1. **Google autocomplete:** Type the topic in Google and note suggested completions
2. **"People also ask" boxes:** Expand all related questions on the first SERP page
3. **Google Search Console** (once set up, per roadmap item M6): Identify queries
   where you rank 5-20 (striking distance for improvement)
4. **Reddit / Stack Overflow / HN:** Search for your topic and note the exact phrasing
   people use when describing their problem
5. **Existing case studies:** Extract the specific technical challenges described in
   your 12 case studies; these are proven pain points

### On-Page SEO Checklist

| Element | Requirement | Notes |
|---------|------------|-------|
| **Title** (`title` field) | Primary keyword in first 60 characters | Hugo uses this as the `<title>` tag and H1 |
| **Meta description** (`description` field) | 150-160 characters with primary keyword | Also used as the listing card description on `/blog/` |
| **URL** (`slug` field) | Short, keyword-rich, hyphenated | `/blog/fix-atlantis-rate-limiting/` not `/blog/how-we-fixed-the-atlantis-rate-limiting-problem-in-our-terraform-ci-cd/` |
| **H2 headings** | 5-8 per post; keyword variations in headings | Headings every 200-300 words; never skip levels (H2 then H3, not H2 then H4) |
| **Internal links** | 2-4 per 500 words | Every post links to at least 1 service page and 1 case study |
| **Alt text on images** | Descriptive for content images; `alt=""` for decorative | Follows site-wide WCAG 2.1 AA conventions (see `docs/web-accessibility-compliance-guide.md`) |
| **Code block language** | Always annotated (` ```hcl `, ` ```yaml `) | Helps search engines understand content type |

### Featured Snippets

Featured snippets capture **35% of clicks** on queries where they appear. Paragraph
snippets account for **70%** of all snippets.

To optimize for featured snippets:

1. Use an H2 heading that matches the search query (often phrased as a question)
2. Immediately follow with a concise paragraph (40-60 words) that directly answers
   the question
3. For list-based snippets, use ordered or unordered lists immediately after the heading
4. For table snippets, use a markdown table with clear headers

Google's AI Overviews now appear on **58%** of queries, sometimes displacing traditional
snippets. Counter-strategy: focus on specificity. Highly specific, experience-based
answers are harder for AI to synthesize from multiple sources.

### Word Count by Keyword Difficulty

| Keyword Difficulty | Recommended Word Count | Notes |
|-------------------|----------------------|-------|
| Low (0-30) | 800-1,500 words | Long-tail queries, niche topics |
| Medium (30-60) | 1,500-2,500 words | Competitive but targeted |
| High (60+) | 2,500+ words | Requires comprehensive coverage to compete |

For a new blog on a new domain, target low and medium difficulty keywords first. High
difficulty keywords require domain authority that takes 12+ months to build.

### Internal Linking Strategy

Internal links serve three purposes: help search engines discover and index content,
distribute page authority across the site, and guide readers toward conversion pages.

**Hub-and-spoke model:** Each content pillar (from [Section 2](#2-content-strategy))
acts as a hub. Blog posts are spokes that link to the hub (service page) and to each
other within the same pillar.

**Bidirectional linking:** When publishing a new blog post, also update 2-3 related
existing pages (case studies, service pages, or other blog posts) to link back to the
new post. Orphaned pages with no inbound internal links are difficult for Google to
discover.

### Structured Data (Future Enhancement)

The site already emits Organization JSON-LD on the homepage and Service JSON-LD on
service pages (via `layouts/partials/extend-head-uncached.html`). A natural next step
is adding **BlogPosting** or **Article** JSON-LD to blog posts.

This is flagged as a future enhancement, not a launch blocker. The implementation
would follow the same pattern as existing structured data in `extend-head-uncached.html`.

**Dependency:** Google Search Console is not yet set up (roadmap item M6). Setting it
up is the highest-priority SEO action item. It enables sitemap submission, indexing
requests, and search query data.

---

## 7. Distribution Strategy

**Purpose:** How to maximize reach of each published post beyond organic search.

### Syndication Platforms

| Platform | Audience | Strategy | Canonical URL | Timing |
|----------|----------|----------|---------------|--------|
| **Dev.to** | Developer community (broad) | Cross-post full article; high engagement rates | Supports `canonical_url` in front matter | Wait 7-10 days after publishing on pertsfoundry.com |
| **Hashnode** | Developer community (similar to Dev.to) | Cross-post full article; can map custom domain | Supports canonical URL natively | Wait 7-10 days |
| **LinkedIn Articles** | Decision-makers, hiring managers | Post a summary or key takeaway in-feed (not a link post) | N/A (use in-feed format, not external links) | Same day as syndication |
| **Hacker News** | High-impact, unpredictable | Submit only strong opinion or deep technical pieces; link directly to site | N/A (direct link) | Any time; avoid weekends |
| **Reddit** (r/devops, r/terraform, r/kubernetes, r/aws) | Practitioners in specific niches | Share as a discussion, not self-promotion; contribute the insight, link as source | N/A (direct link) | Any time; match subreddit norms |
| **DZone** | Enterprise-leaning developer community | Submit for editorial review; averages 4,000+ pageviews per article | Supports canonical URL | After 7-10 days |

### Canonical URL Protocol

Hugo automatically generates `<link rel="canonical">` tags pointing to the
pertsfoundry.com URL. When syndicating to other platforms:

1. Always set the canonical URL on the syndication platform to the pertsfoundry.com
   version
2. Wait **7-10 days** before syndicating (the site is newer; Google needs time to
   index the original first)
3. Properly attributed syndication with canonical URLs can increase reach **300-500%**
   without harming search rankings

If a post is published elsewhere first (guest post on another blog), do not republish
on pertsfoundry.com without setting the canonical URL to the original source. Duplicate
content without canonical attribution hurts both sites.

### Social Media Resource Allocation

| Platform | Allocation | Why |
|----------|-----------|-----|
| **LinkedIn** | 65-70% | Where DevOps decision-makers and hiring managers are; 80% of B2B social leads come from LinkedIn |
| **Twitter/X** | 15-20% | Developer community; good for technical discussions; developer audience is 4x larger than LinkedIn |
| **Experimental** (Bluesky, Mastodon, niche communities) | 10-15% | Hedge against platform risk; explore emerging channels |

### LinkedIn Strategy

LinkedIn penalizes external links with approximately **60% reach reduction**. Do not
post bare links to blog posts. Instead:

1. Write a **value-first LinkedIn post** (text or carousel) that delivers the key
   insight from the blog post directly in the feed
2. End with "Full technical deep-dive on my blog" (no link in the post body)
3. Add the link in the **first comment** (workaround for the algorithm penalty)
4. Alternatively, use LinkedIn's native article format for a summarized version

Frame content for LinkedIn around **business outcomes**: "reduced deployment failures
by 90%" resonates better than "here is our Atlantis config."

### Twitter/X Strategy

Frame content around **technical detail**: "Here is the Atlantis config that fixed
our rate limiting" resonates better than business-outcome framing.

Use threads for longer insights. Tag relevant tool accounts (@HashiCorp, @awscloud)
for amplification. Engage in relevant hashtags (#DevOps, #Terraform, #Kubernetes).

### Cross-Posting Etiquette

Never post identical text across platforms. Tailor the hook to each platform's audience:

- **LinkedIn:** Business outcome framing, professional tone
- **Twitter/X:** Technical detail, concise, conversational
- **Dev.to / Hashnode:** Full technical article with code
- **Reddit:** Frame as a discussion or question, not promotion

---

## 8. Measuring Success

**Purpose:** Define what "working" means and how to track it without a full analytics
stack.

### KPIs for a Solo Consulting Blog

| Metric | Tool | 6-Month Target | Why It Matters |
|--------|------|---------------|----------------|
| Organic sessions per post | Cloudflare Web Analytics | 100+ per month per evergreen post | Validates keyword targeting and SEO |
| Service page clicks from blog | Cloudflare Web Analytics (referrer paths) | 5%+ click-through rate | Validates the blog-to-service funnel |
| Contact page visits from blog | Cloudflare Web Analytics | Trending up monthly | Tracks movement toward conversion |
| Contact form submissions | Manual tracking | 1+ per quarter attributable to blog | The actual business conversion metric |
| Syndication views | Dev.to dashboard / LinkedIn analytics | 2-5x site views per post | Validates distribution strategy |
| Search impressions and clicks | Google Search Console (when set up) | Trending up monthly | Validates SEO compounding |

### Attribution Model

For a solo consulting site without a full analytics stack, attribution is
straightforward:

- **Direct traffic:** Cloudflare Web Analytics shows which pages get views and in what
  order (page path flow)
- **Referral traffic:** Which external sites send traffic (LinkedIn, Dev.to, Reddit,
  Hacker News)
- **Search traffic:** Google Search Console shows which queries drive impressions and
  clicks (when set up)
- **The conversion funnel:** Blog post -> service page -> contact page -> form
  submission or Cal.com booking

The key metric is not traffic volume. It is the **conversion chain**: does blog
traffic reach service pages, and do service page visitors reach the contact page?

### Monthly Review Checklist

- [ ] Review top 5 blog posts by page views (Cloudflare Web Analytics)
- [ ] Check referral sources for each post (which platforms drive traffic)
- [ ] Review Google Search Console queries (when available)
- [ ] Check if any blog post appears in a featured snippet (search for target keywords)
- [ ] Note which posts drive service page visits (referrer path analysis)
- [ ] Review syndication metrics (Dev.to views, LinkedIn engagement)
- [ ] Update content freshness log (which posts are due for a 6-month review)

### When to Adjust

| Signal | Diagnosis | Action |
|--------|-----------|--------|
| Post gets traffic but no service page clicks | Weak or missing CTA | Add or improve the in-post CTA linking to a service page |
| Post gets no traffic after 3 months | Keyword targeting issue | Re-evaluate the target keyword; update title and description; check if the query has search volume |
| Post gets social engagement but no search traffic | Good for authority, not for SEO | Write a search-optimized companion piece targeting the specific long-tail query |
| Post ranks on page 2 (positions 11-20) | Striking distance | Expand the post (add depth, examples, internal links); build 1-2 inbound links from syndication |
| Multiple posts on a topic, none ranking | Content cannibalization | Consolidate into a single comprehensive post; redirect the others |

---

## 9. Exemplary Blogs to Study

**Purpose:** Concrete models to learn from. Each entry explains which pattern to
extract, not just who to read.

| Author / Blog | Focus Area | What to Study | Key Pattern |
|---------------|-----------|---------------|-------------|
| **Charity Majors** (charity.wtf) | Observability, engineering leadership | Opinionated framing, personal voice, "this is what I believe and here is why" structure | Opinion pieces that challenge industry assumptions and drive discussion |
| **Julia Evans** (jvns.ca) | Systems, networking, programming | Visual explanations (zines), making complex topics accessible, deceptively short posts that teach one concept clearly | "Explain one thing clearly" posts that rank for years with minimal word count |
| **Kelsey Hightower** | Kubernetes, cloud-native infrastructure | Demonstration-as-content (live demos, repos), minimal words with maximum impact | "Show, don't tell" with working examples; identified knowledge gaps early and filled them |
| **Mitchell Hashimoto** (mitchellh.com) | Developer tools, infrastructure | Deep technical architecture posts, building authority through implementation detail | Credibility through explaining how something works under the hood |
| **Cindy Sridharan** (copyconstruct.medium.com) | Distributed systems, observability | Long-form deep dives, comprehensive reference posts that become canonical resources | "The definitive guide to X" that everyone links to; published O'Reilly book from blog authority |
| **Corey Quinn** (lastweekinaws.com) | AWS, FinOps, cloud economics | Humor as differentiator, newsletter-to-consulting pipeline, personality-driven brand | Built a consulting business on the back of a consistently entertaining newsletter |
| **Jessie Frazelle** (blog.jessfraz.com) | Containers, Linux, security | Deeply technical posts with working code, practitioner credibility | Authority through implementation detail that proves hands-on experience |

### Patterns Worth Extracting

1. **Charity Majors' authority formula:** Strong opinion + real experience + specific
   examples = content that gets shared and debated. She does not hedge; she takes a
   position and defends it.

2. **Julia Evans' accessibility principle:** Show your learning process, not just
   polished conclusions. Her daily posts narrating confusion-to-clarity resonate because
   they are honest. She measures success by conversations and impact, not page views.

3. **Kelsey Hightower's gap-filling strategy:** He noticed there were no good
   Kubernetes installation guides, so he created "Kubernetes the Hard Way." Identify
   knowledge gaps in emerging technologies early and become the reference resource.

4. **Cindy Sridharan's depth strategy:** A single comprehensive post on a topic
   (e.g., "Testing in Production") can become the canonical reference that everyone
   links to. This builds backlinks and domain authority over time.

5. **Corey Quinn's personality strategy:** Humor and a distinctive voice make technical
   content shareable. Not everyone can pull this off, but if it fits your style, it is
   a powerful differentiator in a sea of dry technical writing.

---

## 10. Common Mistakes

**Purpose:** Prevent known failure modes, especially consulting-specific pitfalls that
generic blogging advice misses.

1. **Writing for peers instead of buyers.** Technical blogs for consulting need to reach
   the person who hires you, not just fellow practitioners. Include business context
   (cost saved, time recovered, risk eliminated) alongside technical detail. A CTO does
   not care about your Terraform module structure; they care that you reduced deployment
   failures by 90%.

2. **Giving away the recipe but not the judgment.** Share your methodology and thinking
   process, not step-by-step implementation details a reader could follow themselves.
   Clients hire you for judgment (knowing which approach fits their situation), not for
   instructions. The blog post should leave the reader thinking "I understand the
   framework, but I need this person to apply it to my context."

3. **Inconsistent publishing then abandoning.** Better to publish 1 post per month
   consistently than 4 in a burst then silence. The credibility guide warns: a stale
   blog actively hurts credibility. If you cannot sustain monthly publishing, keep
   the blog hidden and publish only when you have a batch of 3+ articles.

4. **No internal links to service or case study pages.** Every post should link to at
   least 1 service page and 1 case study. Without these links, blog traffic never
   reaches your conversion pages. The blog is a lead generation tool, not a standalone
   publication.

5. **Generic topics with no unique angle.** "What is Terraform?" adds nothing to the
   internet. "Why I migrated 200+ projects to HCP Registry and what broke" adds
   everything. Your competitive advantage is real experience. Use it.

6. **Ignoring featured snippet opportunities.** For question-based queries, structure
   your answer as a concise paragraph (40-60 words) directly after the H2 that poses
   the question. This is the primary mechanism for capturing position-zero results.

7. **Not updating old posts (version drift).** Technical content decays. A post
   recommending Terraform 0.12 patterns in 2026 damages credibility. Set a 6-month
   review cadence. Version-annotate all code examples so you know what to check.

8. **Publishing without a CTA.** Every post should end with a path to the next step.
   For a consulting blog, that path always leads to a service page or the contact
   page. "Thanks for reading" is not a CTA.

9. **Perfectionism-induced paralysis.** Ship at 80% quality, then iterate. Evergreen
   content can be updated later. The perfect post stuck in drafts generates zero leads.
   Done and published beats perfect and unpublished.

10. **Neglecting the `description` front matter field.** The description serves as both
    the meta description (what Google shows in search results) and the listing card text
    on the `/blog/` page. A weak or empty description means lower click-through rates
    from search and an unhelpful listing page.

11. **Content cannibalization.** Writing blog posts that target the same keywords as
    your service pages splits Google's ranking signals between two pages. Blog posts
    should target long-tail variations, not the head terms your service pages own.

12. **Missing featured images.** Posts without a `featured.jpg` render differently on
    the blog listing page (no thumbnail, no hero) and produce generic social previews
    when shared. This is especially noticeable when blog posts appear alongside service
    and case study cards that all have images.

---

## 11. Launch Plan

**Purpose:** The specific, sequenced plan to re-enable the blog with 5 articles. This
section directly addresses roadmap item C2.

### Launch Strategy

The credibility guide recommends launching with **3-5 strong evergreen articles** with
hidden publication dates, rather than publishing a single post. Write all initial posts
before enabling the blog in navigation, then publish as a batch.

### Article 1 Status

Article 1 exists at `content/blog/infrastructure-as-code/index.md`:

- **Title:** "Why Your Startup Needs Infrastructure as Code"
- **Status:** `draft: false` (complete, ready to publish on merge)
- **Word count:** 826 words (opinion piece, within 800-1,000 target)
- **Featured image:** Present (1400x781, logo overlay applied)
- **Internal links:** IaC service page (x2, including CTA), Terraform at Scale case study

Previously the placeholder post at `placeholder-first-post/`. Directory renamed,
title fixed (em dash removed), content expanded from ~330 to 826 words with
portfolio-backed depth, featured image processed. Roadmap item L3 resolved.

### The 5-Article Slate

| # | Working Title | Post Type | Pillar | Target Keywords | Links To | Priority |
|---|---------------|-----------|--------|-----------------|----------|----------|
| 1 | Why Your Startup Needs Infrastructure as Code | Opinion | DevOps & Infrastructure | infrastructure as code startup, IaC benefits, when to adopt terraform | Service: [IaC](/services/infrastructure-as-code/), Case Study: [Terraform at Scale](/case-studies/terraform-infrastructure-at-scale/) | Complete |
| 2 | How We Eliminated CI/CD Rate Limiting by Migrating to a GitHub App | War Story | DevOps & Infrastructure | atlantis rate limiting, github app migration, terraform CI/CD | Service: [CI/CD](/services/cicd-automation/), Service: [IaC](/services/infrastructure-as-code/), Case Study: [Terraform at Scale](/case-studies/terraform-infrastructure-at-scale/) | High (rich source material) |
| 3 | CodeRabbit vs. GitHub Copilot Code Review: What We Learned Rolling Out Both | Comparison | AI-Augmented Engineering | coderabbit vs copilot, AI code review tools, automated code review | Service: [AI Engineering](/services/ai-augmented-engineering/), Case Study: [Enterprise AI Tooling](/case-studies/enterprise-ai-tooling-adoption/) | High (differentiating topic, thin competition) |
| 4 | The 5 AWS Cost Leaks Every Scaling Startup Ignores | Listicle | Cloud Architecture | AWS cost optimization, cloud cost reduction, FinOps startup | Service: [FinOps](/services/finops/), Case Study: [FinOps Savings](/case-studies/finops-cloud-cost-savings/) | Medium |
| 5 | Zero-Downtime Container Registry Migrations: A Step-by-Step Guide | Tutorial / Deep Dive | Cloud Architecture | container registry migration, ECR to GAR, zero downtime migration | Service: [Cloud Migration](/services/cloud-migration/), Case Study: [Registry Migration](/case-studies/zero-downtime-registry-migration/) | Medium |

### Content Outlines

#### Article 1: Why Your Startup Needs Infrastructure as Code

- Existing draft is solid; needs title fix, featured image, and CTA addition
- Keep the Console Trap / What IaC Gives You / When to Switch structure
- Add a CTA linking to the IaC service page
- Add an internal link to the Terraform at Scale case study
- Target word count: 800-1,000 (opinion piece, low keyword difficulty)

#### Article 2: How We Eliminated CI/CD Rate Limiting

- Extract from the Terraform at Scale case study's Atlantis rate-limiting narrative
- PAR structure: silent GitHub API failures -> root cause investigation -> GitHub App
  migration -> zero failures
- Include specific metrics (3 users/week affected -> zero post-migration)
- Technical depth: explain GitHub App vs. OAuth App token model
- Target word count: 1,500-2,000 (war story, medium keyword difficulty)

#### Article 3: CodeRabbit vs. GitHub Copilot Code Review

- Draw from AI tooling adoption case study and personal experience
- Structure: what each tool does, where each excels, where each falls short, rollout
  lessons, recommendation framework
- Include practical setup examples (not just feature comparison)
- Target word count: 2,000-2,500 (comparison guide, medium-high keyword difficulty)

#### Article 4: The 5 AWS Cost Leaks

- Extract patterns from the FinOps case study ($125K+ savings)
- Each "leak" is a standalone section: idle resources, oversized instances, missing
  reservations, data transfer costs, unused EBS volumes
- Include cost-per-month estimates for each leak type
- Target word count: 1,500-2,000 (listicle, competitive keyword space)

#### Article 5: Zero-Downtime Container Registry Migrations

- Step-by-step from the 5+ PB registry migration case study
- Technical tutorial with real migration commands and patterns
- Address the dual-write period, cutover strategy, and rollback plan
- Target word count: 2,000-2,500 (tutorial, very specific long-tail keyword)

### Recommended Sequencing

1. **Rework Article 1** (fastest; existing draft needs minor fixes)
2. **Write Article 3** (AI differentiator; thin keyword competition; positions the
   AI-Augmented Engineering pillar early)
3. **Write Article 2** (case study extract; strong narrative material from Terraform
   at Scale)
4. **Evaluate traffic and response** after 3 articles are live
5. **Write Articles 4 and 5** based on what performs (if AI content outperforms
   infrastructure content, prioritize more AI topics)
6. **Re-enable blog in navigation** once 3+ posts are live

### Tag Strategy for Launch Articles

| Article | Tags | Cross-Links With |
|---------|------|-----------------|
| 1 | Terraform, DevOps, Infrastructure | 4 service pages, 3 case studies with Terraform tag |
| 2 | Terraform, GitHub, Atlantis, CI/CD (new tag) | IaC and CI/CD service pages, Terraform case study |
| 3 | CodeRabbit, GitHub Copilot, AI, Claude, Cursor | AI service page, AI case studies |
| 4 | AWS, FinOps | FinOps service, Cloud Infrastructure service, FinOps case study |
| 5 | GCP, GCR, GAR, Containers | Cloud Migration service, Registry Migration case study |

Note: "CI/CD" would be a new tag (not currently in use). Adding it would help blog
posts about CI/CD cross-link with the CI/CD service page if that page also adds the
tag.

### Blog Re-Enablement Checklist

When 3+ articles are ready to publish:

- [x] Rename `content/blog/placeholder-first-post/` to `content/blog/infrastructure-as-code/`
- [ ] All posts have `draft: false`
- [ ] All posts have a `featured.jpg` in their page bundle
- [ ] Add Blog to nav menu in `config/_default/menus.en.toml` (weight: 30, between
  Case Studies and About)
- [ ] Optionally set `showRecent = true` in `params.toml` to surface recent posts on
  the homepage
- [ ] Run full validation suite (all 10 PR checks pass)
- [ ] Mark C2 as complete in `docs/website-audit-and-roadmap.md`
- [ ] Mark L3 as complete in `docs/website-audit-and-roadmap.md` (directory rename)

---

## 12. Blog Post Checklist

**Purpose:** Single checklist to run through before publishing any post. The most
frequently referenced section for ongoing use.

### Before Writing

- [ ] Topic aligns with a content pillar ([Section 2](#2-content-strategy))
- [ ] Target keyword identified (long-tail, not competing with service pages)
  ([Section 6](#6-seo-optimization))
- [ ] Post type selected ([Section 4](#4-post-types-that-work))
- [ ] At least 1 service page and 1 case study identified to link to
- [ ] Featured image sourced or created for the page bundle

### During Writing

- [ ] Hook in first 2 sentences (pain point, counter-intuitive, or specific metric)
  ([Section 5](#5-writing-craft))
- [ ] H2 sections with keyword-rich headings; heading every 200-300 words
- [ ] 2-4 internal links per 500 words ([Section 6](#6-seo-optimization))
- [ ] At least 1 link to a service page and 1 link to a case study
- [ ] Code examples are complete, functional, and version-annotated
- [ ] Paragraphs are 3-4 sentences max
- [ ] No em dashes (project formatting convention)
- [ ] No raw HTML (will be stripped by Goldmark; use shortcodes instead)
- [ ] CTA at the end linking to a service page or contact page
  ([Section 5](#5-writing-craft))
- [ ] Answer-first pattern used for any question-based H2 headings
  ([Section 6](#6-seo-optimization))

### Accessibility

- [ ] All content images have descriptive alt text
- [ ] Decorative images use `alt=""`
- [ ] Code blocks have language annotations (` ```hcl `, ` ```yaml `, etc.)
- [ ] Heading hierarchy is correct (H2 then H3, never skip levels)
- [ ] Link text is descriptive (not "click here")

Reference: `docs/web-accessibility-compliance-guide.md` for full WCAG 2.1 AA details.

### Front Matter

- [ ] `title`: Primary keyword in first 60 characters
- [ ] `description`: 150-160 characters with primary keyword
- [ ] `slug`: Matches directory name, URL-friendly
- [ ] `tags`: Proper case, reusing existing tags where possible
  ([Section 14](#14-quick-reference-card) has the full list)
- [ ] `draft: false` (when ready to publish)
- [ ] `showDate: false` (default for evergreen; set `true` for timely content)
- [ ] `featured.jpg` present in the page bundle directory

### Before Publishing

- [ ] `npx markdownlint-cli2 "content/**/*.md"` (markdownlint passes)
- [ ] `npx prettier --check "content/**/*.md"` (Prettier passes)
- [ ] Preview with `hugo server` (check layout, images, related content)
- [ ] `hugo --gc --minify --cleanDestinationDir && htmltest` (build and link validation)
- [ ] Related content appears at bottom of the post (verify tags produce useful cross-links)
- [ ] Featured image renders correctly on listing page and in hero section

### After Publishing

- [ ] Wait 7-10 days for Google to index the original URL
- [ ] Cross-post to Dev.to with `canonical_url` pointing to pertsfoundry.com
- [ ] Share on LinkedIn (value-first post, link in first comment)
- [ ] Submit to relevant Reddit/HN if the post warrants it
- [ ] Log post in the editorial calendar ([Section 13](#13-editorial-calendar-template))
- [ ] Update any related existing pages to include a link to the new post (bidirectional
  linking)

---

## 13. Editorial Calendar Template

**Purpose:** Simple tracking structure for planned and published posts. Update this
table as posts move through the pipeline.

### Calendar

| Month | Topic | Post Type | Pillar | Status | Target Keywords | Linked Service | Linked Case Study |
|-------|-------|-----------|--------|--------|-----------------|----------------|-------------------|
| TBD | Why Your Startup Needs IaC | Opinion | DevOps & Infra | Draft exists | infrastructure as code startup | IaC | Terraform at Scale |
| TBD | CodeRabbit vs. Copilot Code Review | Comparison | AI Engineering | Planned | coderabbit vs copilot, AI code review | AI Engineering | Enterprise AI Tooling |
| TBD | How We Eliminated CI/CD Rate Limiting | War Story | DevOps & Infra | Planned | atlantis rate limiting, github app migration | CI/CD, IaC | Terraform at Scale |
| TBD | 5 AWS Cost Leaks Startups Ignore | Listicle | Cloud Architecture | Planned | AWS cost optimization, cloud cost reduction | FinOps | FinOps Savings |
| TBD | Zero-Downtime Container Registry Migration | Tutorial | Cloud Architecture | Planned | container registry migration, zero downtime | Cloud Migration | Registry Migration |
| +1 month | (to be determined based on performance) | | | Idea | | | |
| +2 months | | | | Idea | | | |
| +3 months | | | | Idea | | | |

### Status Values

| Status | Meaning |
|--------|---------|
| Idea | Topic identified, not yet outlined |
| Planned | Outline written, ready to draft |
| Draft exists | Draft in progress or completed, not yet published |
| In review | Draft complete, undergoing review |
| Published | Live on pertsfoundry.com |
| Syndicated | Cross-posted to external platforms |

### Recommended Post-Launch Cadence

After the initial batch of 3-5 articles, publish **1 post per month**. Target the same
day of the month (e.g., first Tuesday) to build a publishing habit.

Prioritize topics based on:

1. Search demand (do people search for this?)
2. Service alignment (does this link to a high-value service page?)
3. Source material availability (do you have case study data to draw from?)
4. Keyword competition (can you realistically rank?)

---

## 14. Quick Reference Card

**Purpose:** Compressed lookup table for AI assistants and quick reference during
drafting. This section alone should provide enough context to create a properly
formatted blog post.

### Create a New Post

```bash
hugo new content blog/<slug>/index.md
```

### Blog Post Front Matter

```yaml
---
title: "Your Post Title Here"
date: 2026-04-06
draft: false
description: "150-160 character description with primary keyword."
slug: "your-post-slug"
tags:
  - Terraform
  - AWS
showDate: false
---
```

### Quick Formatting Rules

| Rule | Value |
|------|-------|
| No em dashes | Use commas, semicolons, parens, or periods instead |
| Tag casing | Proper case: `Terraform`, `AWS`, `Kubernetes` (not lowercase) |
| Meta description | 150-160 characters with primary keyword |
| `showDate` default | `false` (override to `true` for timely content only) |
| Permalink pattern | `/blog/<slug>/` |
| Markdown only | No raw HTML; `goldmark.renderer.unsafe = false` |
| Internal links | At least 1 service page + 1 case study per post |

### Existing Tags (43 total)

Tags are used for related content cross-linking. Reuse these before creating new ones.

| Tag | Tag | Tag | Tag |
|-----|-----|-----|-----|
| Agile | AI | ArgoCD | Atlantis |
| AWS | Azure | Bash | Claude |
| CloudFormation | CodeRabbit | Confluence | Containers |
| Cursor | DevOps | Docker | ECR |
| ECS | EKS | FinOps | GAR |
| GCR | GCP | GCS | GKE |
| GitHub | GitHub Actions | GitHub Copilot | HCP |
| Helm | Incident Response | Infrastructure | Jenkins |
| Jira | Jira Service Desk | Kanban | Kubernetes |
| NFS | Renovatebot | RHEL | Snyk |
| Snowflake | Terraform | Vault | |

### Service Page URLs (10)

| Service | URL |
|---------|-----|
| Agile Coaching & Process Improvement | `/services/agile-coaching/` |
| AI-Augmented Engineering | `/services/ai-augmented-engineering/` |
| CI/CD & Automation | `/services/cicd-automation/` |
| Cloud Infrastructure | `/services/cloud-infrastructure/` |
| Cloud Migration | `/services/cloud-migration/` |
| DevSecOps & DevOps | `/services/devsecops-devops/` |
| FinOps & Cloud Cost Optimization | `/services/finops/` |
| Incident Response & Reliability | `/services/incident-response/` |
| Infrastructure as Code | `/services/infrastructure-as-code/` |
| Kubernetes & Containers | `/services/kubernetes-containers/` |

### Case Study URLs (12)

| Case Study | URL |
|------------|-----|
| Led Organization-Wide Agile Adoption | `/case-studies/agile-transformation-defense/` |
| AI-Accelerated Infrastructure Delivery | `/case-studies/ai-accelerated-infrastructure-delivery/` |
| Modernized CI/CD for Defense Org | `/case-studies/cicd-modernization-defense/` |
| Deep Container Expertise, Forged at AWS | `/case-studies/container-expertise-aws/` |
| Drove the Shift from DevOps to DevSecOps | `/case-studies/devops-to-devsecops-transformation/` |
| Drove Enterprise AI Tooling Adoption | `/case-studies/enterprise-ai-tooling-adoption/` |
| Saved Over $125,000 in Cloud Spend | `/case-studies/finops-cloud-cost-savings/` |
| Led P0 Incident Resolution | `/case-studies/incident-response-leadership/` |
| Built Multi-Tenant Kubernetes Platform | `/case-studies/kubernetes-multi-tenancy-scaling/` |
| Scaled Terraform Across 200+ Projects | `/case-studies/terraform-infrastructure-at-scale/` |
| Zero-Downtime Platform Upgrades | `/case-studies/zero-downtime-platform-upgrades/` |
| 5+ PB Registry Migration | `/case-studies/zero-downtime-registry-migration/` |

### CTA Templates

Use one of these at the end of every blog post, customized to the topic:

**Service link CTA:**

```markdown
If [problem described in this post] sounds familiar, our
[service name](/services/<slug>/) engagements start with exactly this kind of
assessment.
```

**Contact direct CTA:**

```markdown
Working through a similar challenge?
[Let's talk](/contact/) about what a targeted engagement looks like.
```

**Related case study CTA:**

```markdown
For a deeper look at how this played out in practice, read our case study on
[case study title](/case-studies/<slug>/).
```

### Available Shortcodes

| Shortcode | Usage | Notes |
|-----------|-------|-------|
| `{{</* tech-tags "A, B, C" */>}}` | Comma-separated technology pill tags | Used in case studies; can be used in blog posts for technology sections |
| `{{</* steps */>}}...{{</* /steps */>}}` | Wraps an ordered list with numbered circle badges | Used in service pages; good for step-by-step blog sections |
| `{{% metric "key" %}}` | Inline metric from `data/metrics.toml` | Available keys: savings, terraform, migrations, ai-repos |
| `{{</* faqs */>}}` | FAQ accordion from front matter `faqs` array | Renders `<details>/<summary>` HTML; also emits FAQPage JSON-LD |
| `{{</* certification-badges */>}}` | Certification badge images | Typically not used in blog posts |

---

## Sources

### Business Case & ROI

- Hinge Marketing: thought leadership drives 40-60% of consulting inbound
- HubSpot (13,500+ company analysis): 13x higher ROI for regular publishers
- Tsavo Neal consultant website study: organic blog traffic drives half of annual revenue
- Consulting Success: thought leadership content for consultants

### Content Strategy & Calendar

- TopRank Marketing: content cadence best practices
- Pinckey Harmon: content pillars for consultants (3-5 pillar recommendation)
- HubSpot: optimal publishing frequency (2-4 posts/week for maximum results)

### SEO & Technical Content

- Digital Applied: featured snippets capture 35% of clicks; paragraph snippets are 70%
- Commit Agency: long-tail keywords have 2.5x higher conversion rates
- Semrush: internal linking best practices (hub-and-spoke model)
- Digital Applied: AI Overviews appear on 58% of queries (2026)

### Distribution & Syndication

- Draft.dev: developer content syndication (DZone averages 4,000+ views/article)
- Hashmeta: LinkedIn vs. Twitter/X B2B platform comparison
- SocialBee: LinkedIn algorithm 2026 (external link ~60% reach penalty)
- Ritza: Dev.to vs. Medium vs. Hashnode vs. Hackernoon comparison
- BuzzStream: syndication increases reach 300-500% with proper canonical URLs

### Writing Craft & Storytelling

- Social Targeter: stories are 22x more memorable than statistics alone
- Marketing research: storytelling increases conversion rates by 30%
- Edelman/LinkedIn: executive content preferences (46% case studies, 37% research articles)

### Influencer Blog Analysis

- charity.wtf (Charity Majors): observability, engineering leadership
- jvns.ca (Julia Evans): systems, visual explanations, learning-in-public
- github.com/kelseyhightower (Kelsey Hightower): Kubernetes, cloud-native
- mitchellh.com (Mitchell Hashimoto): developer tools, infrastructure
- copyconstruct.medium.com (Cindy Sridharan): distributed systems, observability
- lastweekinaws.com (Corey Quinn): AWS, FinOps, humor-driven brand
- blog.jessfraz.com (Jessie Frazelle): containers, Linux, security

### Credibility Guide

- `docs/building-a-credible-solo-devops-consulting-website.md`: stale blog warning,
  3-5 evergreen article recommendation, "mini-consulting session" test
