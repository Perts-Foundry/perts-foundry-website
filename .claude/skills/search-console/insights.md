# Reading a capture into insights

`review.mjs` findings say what is true of the capture. This file turns them, and the numbers
behind them, into proposals the operator can act on. Every insight is a proposal: fixes go through
the normal PR flow, never through this skill.

## The proposal template

Every insight uses these five parts, in this order:

1. **Observation**: the numbers, from the capture, with the period and whether the tab was
   truncated.
2. **Hypothesis**: one hedged sentence ("these pages show this pattern, which may mean ...").
3. **Proposal**: what to change.
4. **Where the fix lives**: repo file, GSC UI, or the skill that owns the surface.
5. **Who applies it**: the operator by hand, or a PR.

## Recipes

**Brand vs non-brand.** Split the QUERIES tab with `BRAND_TERMS`. When every captured query is a
brand query on a property older than `BRAND_ONLY_MIN_AGE_DAYS` (60) days, `perf-brand-only` fires
and the likely gap is positioning: Google does not yet associate the site with DevOps, cloud
infrastructure and small-business IT searches. Propose homepage title and description work
(content front matter, and the fallbacks in `layouts/partials/extend-head-uncached.html`). Below
that age it is expected.

**Low click-through at a good position.** A page with at least `CTR_MIN_IMPRESSIONS` (100)
impressions, click-through under `CTR_MIN` (0.02), and an average position at or better than
`CTR_MAX_POSITION` (10) is `perf-low-ctr`. Propose a title and description rewrite for that page,
usually a service page; read its front matter directly, since the render-time fallbacks hide a
blank title or description behind generic text.

**Near the top.** A page averaging a position inside `OPPORTUNITY_POSITIONS` ([4, 15]) with at
least `OPPORTUNITY_MIN_IMPRESSIONS` (20) impressions is `perf-position-opportunity`. Propose
on-page copy for the page, or a blog topic that targets the same need, drafted through the
`generate-blog` command and cross-linked to the page per its forward-CTA policy. Describe the class
of query the page ranks for; never quote the queries.

**Sitemap pages with no impressions.** `perf-page-no-impressions` lists indexable sitemap URLs
absent from an untruncated PAGES tab; informational before `PAGE_NO_IMPRESSIONS_MIN_AGE_DAYS` (28)
days, and replaced by one `perf-impressions-below-floor` below `NOISE_FLOOR_IMPRESSIONS` (50) total
impressions. This is most often a service or case-study page still waiting on its first crawl
pass. Propose internal links from the homepage or a blog post, or a case study linking forward to
the service it supports. Check the Page indexing reasons for the same URL first: a page Google has
not indexed cannot earn impressions.

**Devices and countries.** When mobile carries most impressions, Core Web Vitals work is mobile
first (`cwv-poor` on mobile outranks desktop). When more than `COUNTRY_OUTSIDE_US_SHARE` (0.1) of
impressions come from outside the US, `perf-country-outside-us` fires: this is informational only,
a note that the audience may be shifting outside the target market, not a defect to fix by default.

**Enhancement issue labels.** `enhancement-warning` and `enhancement-invalid` name the issue rows
the report listed for Breadcrumbs. Propose the structured-data fix in
`layouts/partials/extend-head-uncached.html`, scoped to the section the issue names (services, case
studies, small-business or blog).

**Links.** Once `links-none` stops firing, propose outreach and blog distribution around the pages
that already earn links. The second brand host appearing as a referrer is the redirect working,
not a link to chase (`secondary-domain-redirect`).

**Nothing yet.** `perf-zero-impressions` on a young property is expected. Say so and stop.
`perf-impressions-below-floor` is the same signal one step later: some impressions, too few to say
anything about a single page.

## Recommended next

The report's `## Recommended next` section answers "what is your take?" before the operator has to
ask. Its rules:

- At most three items.
- Ordered by confidence that the finding is real, then by cost to act; never by predicted gain.
- Each item states the observable expected to change and the re-run window at which it would be
  visible, as a hypothesis ("if this is the cause, the noindex count should fall by the next run
  after the change").
- Each names its owner as "repo", "infrastructure repo" or "GSC UI", never a person.
- No item names a live-write action in Search Console, and none constitutes authorization: the
  section opens with "Findings are proposals; nothing here authorizes a change."
- Below `NOISE_FLOOR_IMPRESSIONS` (50) total impressions, only data-collection and correctness
  items may appear (a missing example URL, a noindex outside `NOINDEX_OK`, a structured-data
  error). Everything else goes to `## Leave alone`.

## Leave alone

`## Leave alone` lists what the data cannot yet support, so the operator does not act on noise:
performance-shaped findings below the floor, age-gated findings before their gate, and anything
whose only evidence is a count with no examples. State the re-run window once, as the earlier of
`PAGE_NO_IMPRESSIONS_MIN_AGE_DAYS` (28) days of property age or `NOISE_FLOOR_IMPRESSIONS` (50)
impressions.

## Language rules

- Every insight is a hypothesis, never a causal claim. "These pages show this pattern; consider
  this", not "this caused that".
- Name what makes attribution unreliable: a template or content deploy in the period, a new blog
  post, the property's age, a Google update window.
- Below `NOISE_FLOOR_IMPRESSIONS` (50) total impressions, write "too little data" and stop. Do not
  compute shares or trends from single digits.
- When a tab was truncated, conclusions are "top N as captured", never absolute.
- Compare periods only when `review.mjs` compared them; `period-mismatch` means the pair is not
  comparable.
- Never quote a search query into a repo file, PR body, commit message, `TODO-list.md` entry or release
  note. Queries are visitor-typed text. Describe the class ("a pricing question about a service").
- Every insight ends with where the fix lives and who applies it. Nothing here authorizes a change.
