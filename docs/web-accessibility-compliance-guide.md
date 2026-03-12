# Web Accessibility Compliance Guide

## Purpose

This document is a comprehensive reference for web accessibility compliance, covering
the legal landscape, technical requirements, common pitfalls, Hugo/Blowfish-specific
concerns, and practical compliance strategies. It is informed by research across
government sources, legal blogs, court filings, community forums (Reddit, Hacker News),
disability advocacy organizations, and industry reports.

**Last updated:** March 2026

---

## Table of Contents

1. [Legal Landscape](#1-legal-landscape)
2. [Major Lawsuits and Settlements](#2-major-lawsuits-and-settlements)
3. [Lawsuit Statistics and Trends](#3-lawsuit-statistics-and-trends)
4. [WCAG Technical Requirements](#4-wcag-technical-requirements)
5. [Most Common Technical Failures](#5-most-common-technical-failures)
6. [Hugo and Blowfish-Specific Concerns](#6-hugo-and-blowfish-specific-concerns)
7. [Testing Tools and Methods](#7-testing-tools-and-methods)
8. [Common Gotchas](#8-common-gotchas)
9. [Compliance Strategies](#9-compliance-strategies)
10. [Accessibility Overlays — Why to Avoid Them](#10-accessibility-overlays--why-to-avoid-them)
11. [Business Case Beyond Legal](#11-business-case-beyond-legal)
12. [Remediation Approach](#12-remediation-approach)
13. [Community Perspectives](#13-community-perspectives)
14. [Action Items for This Project](#14-action-items-for-this-project)
15. [Sources](#15-sources)

---

## 1. Legal Landscape

### US Federal: ADA Title III

The Americans with Disabilities Act (1990) Title III prohibits discrimination in "places
of public accommodation." Courts are split on whether websites qualify:

- **Ninth Circuit and Third Circuit** accept a "nexus" standard: websites connected to a
  physical place of business are covered.
- **Eleventh Circuit** (Gil v. Winn-Dixie, 2021) held websites are NOT places of public
  accommodation, but this opinion was **vacated in January 2022**, leaving the question
  unresolved in that circuit.
- **Most other circuits** have allowed ADA claims against websites to proceed, especially
  when tied to a physical business.

There is no single federal statute explicitly requiring website accessibility. Courts
have interpreted existing disability law to apply, and the DOJ has reinforced this
through rulemaking and enforcement.

### US Federal: Section 508

Section 508 of the Rehabilitation Act requires **federal agencies** to make their
electronic and information technology accessible. Updated in 2017 to harmonize with
WCAG 2.0 Level AA. Applies to government websites, software, internal tools, and
electronic documents. Does not directly apply to private businesses, but federal
contractors may be subject to Section 508 requirements.

### DOJ Web Accessibility Rule (2024)

The DOJ finalized a rule on **April 24, 2024** requiring state and local governments to
meet **WCAG 2.1 Level AA** — the first time the DOJ codified a specific technical
standard for ADA web compliance.

**Compliance deadlines:**

- **April 24, 2026**: Entities with populations of 50,000+
- **April 26, 2027**: Entities with populations under 50,000

**2025-2026 developments:** In September 2025, the DOJ published notice of intent to
"reconsider whether some regulatory provisions could be made less costly." On February
13, 2026, the DOJ submitted a revised rule to OIRA as an Interim Final Rule (which can
modify regulations without public comment). The specific changes have not been made
public. As of March 2026, the April 24, 2026 deadline remains legally in effect but its
future is uncertain.

### State Laws

**California Unruh Civil Rights Act:**

- Allows minimum **$4,000 statutory damages per violation**
- Unlike federal ADA (injunctive relief only), Unruh provides monetary damages, making
  it far more attractive to plaintiffs
- Applies to virtual businesses without a brick-and-mortar location
- Courts require WCAG 2.0 Level AA compliance

**New York:**

- Senate Bill 3114A (signed December 2023, effective June 2024) requires state agencies
  to conform to WCAG 2.2
- The NY State Human Rights Law also prohibits disability discrimination in public
  accommodations
- Number one state for ADA website lawsuits: 1,564 federal filings in 2024 alone
- NY courts accept cases against any website visited by a NY resident regardless of
  where the company is located

### International Laws

**European Accessibility Act (EAA):**

- **Effective June 28, 2025** across all 27 EU member states
- Scope: e-commerce, banking, transport, telecommunications, digital services
- Applies to any business with 10+ staff and turnover above EUR 2 million that trades in
  the EU, including non-EU companies
- Standard: EN 301 549 (incorporates WCAG 2.1 Level AA)
- Penalties vary by country: Germany up to EUR 100,000/violation; France up to EUR 75,000
  or 4% of annual revenue; Spain EUR 5,000-300,000

**UK Equality Act 2010:**

- Requires "reasonable adjustments" for disabled access, explicitly including websites
- Section 20 imposes a **proactive, anticipatory** duty — organizations must address
  accessibility before receiving complaints
- No organizations have been successfully prosecuted specifically for website
  accessibility, but cases have been settled out of court

**Canada Accessible Canada Act (ACA):**

- In force since July 11, 2019 for federally regulated entities
- Standard: WCAG 2.1 Level AA
- 2025 amendments added specific web/mobile/digital document requirements; compliance
  milestones begin December 2027
- Penalties: up to **$250,000 per violation**

**Australia Disability Discrimination Act (DDA) 1992:**

- Landmark case: Maguire v. SOCOG (2000) — blind user complained the Sydney Olympics
  website was inaccessible; Human Rights Commission found unlawful discrimination and
  awarded AU$20,000 in damages
- WCAG guidelines adopted as the benchmark standard

---

## 2. Major Lawsuits and Settlements

### Domino's Pizza v. Robles

- **Filed 2016** by Guillermo Robles (blind), who could not order pizza via website/app
  using screen reader
- **Ninth Circuit**: Ruled ADA applies to websites connected to physical locations
- **Supreme Court (Oct 2019)**: Denied certiorari, letting the ruling stand — landmark
  moment establishing ADA applies to digital content
- **District Court (June 2021)**: Summary judgment for Robles; Domino's violated
  California's Unruh Act; ordered WCAG 2.0 compliance; $4,000 in Unruh penalties
- **Settlement (June 2022)**: Confidential terms after six years of litigation

### National Federation of the Blind v. Target

- **Filed February 2006** in California; NFB alleged Target's website lacked alt text,
  was incompatible with screen readers, and could not be navigated via keyboard
- **Settlement (August 2008)**: **$6 million** to the class; attorney's fees of
  **$3.7 million**; Target agreed to make its website accessible
- First precedent regarding website accessibility for commercial websites

### Gil v. Winn-Dixie

- **District Court (June 2017)**: Found Winn-Dixie's website violated ADA Title III;
  ordered WCAG 2.0 compliance, a public accessibility policy, and employee training
- **Eleventh Circuit reversal (April 2021)**: Websites are NOT "places of public
  accommodation" under Title III — created a significant circuit split
- **Vacated January 2022**: The Eleventh Circuit vacated its own panel opinion

### Fashion Nova — Alcazar v. Fashion Nova Inc.

- Settlement of **$5.15 million** for class action by blind users
- Class members may receive up to $4,000 per household
- Agreed to achieve "substantial conformance" with WCAG 2.1
- **February 2026**: DOJ filed a Statement of Interest opposing the settlement as
  insufficient, arguing it lacked compliance monitoring or enforcement mechanisms

### Other Notable Cases

- **Beyonce (Parkwood Entertainment, Jan 2019)**: Blind users could not buy concert
  tickets; cited missing alt text, inaccessible menus, keyboard navigation failures
- **Nike (June 2023)**: Sued over poor color contrast and screen reader incompatibility
- **Netflix**: Faced claims over missing captions in streaming content

---

## 3. Lawsuit Statistics and Trends

### Annual Lawsuit Numbers (Federal + State Courts)

| Year | Approximate Total |
|------|-------------------|
| 2020 | 3,503 |
| 2021 | 4,011 |
| 2022 | 4,035 |
| 2023 | 4,630 |
| 2024 | 4,187 |
| 2025 | 5,000+ (some trackers report 8,667) |

Since 2018, more than **25,000 lawsuits** have been filed. H1 2025 saw a 37% surge
year-over-year.

### Most-Sued Industries

1. **E-commerce/retail**: 69% of all lawsuits in H1 2025
2. **Fashion/Apparel**: 1,121 lawsuits (35.16%) in 2024
3. **Restaurants/Food/Beverages**: 758 lawsuits (23.78%)
4. **Beauty/Skincare**: 250 lawsuits
5. **Medical/Health**: 159 lawsuits

By platform: custom-coded sites (1,332 lawsuits / 41.78%), Shopify (1,014 / 31.81%),
WordPress (603), Magento (100).

### Geographic Distribution (H1 2025)

1. New York: 637 cases
2. Florida: 487 cases (nearly doubled from 2024)
3. California: 380 cases
4. Illinois: 237 cases (up 745% from 28 in 2024)

### Serial Plaintiff / "Drive-By" Lawsuits

- One individual filed lawsuits against **312 businesses** since 2022
- Just **31 plaintiffs and 16 law firms** were responsible for half of all lawsuits in 2025
- **Stein Saks, PLLC** was the most active firm in 2024 with **428 lawsuits** filed
- The top 15 firms filed **2,766 lawsuits** (86.76% of all 2024 filings)
- **40% of federal ADA Title III filings** are now pro se (self-represented), with
  plaintiffs using AI tools to draft complaints and identify violations

### Most Common WCAG Violations Cited in Lawsuits

1. Missing alternative text on images
2. Insufficient color contrast (84% of top sites fail)
3. Missing form input labels (48.6% of sites)
4. Lack of keyboard navigation
5. Empty or ambiguous links
6. Missing page titles
7. Improper heading structure
8. Inaccessible CAPTCHA
9. Missing video captions/transcripts

### Cost of Settlements vs. Cost of Remediation

| Scenario | Cost |
|----------|------|
| Demand letter settlement | $3,000-$15,000 |
| Small business lawsuit settlement | $5,000-$20,000 |
| Mid-range settlement | up to $75,000 |
| Total cost including remediation | ~$25,000 ($10K settlement + $5-15K audit/fix) |
| Major class actions | $5-6 million (Target: $6M; Fashion Nova: $5.15M) |
| **Proactive audit and remediation** | **$5,000-$15,000** |

**Proactive remediation is almost always cheaper than litigation.** Small businesses with
under $500,000 revenue are sued most frequently. 64% of 2025 lawsuits targeted companies
with annual revenues under $25 million.

---

## 4. WCAG Technical Requirements

WCAG is organized around four principles: **POUR** (Perceivable, Operable,
Understandable, Robust). Courts and regulators reference **WCAG 2.1 Level AA** as the
standard. WCAG 2.2 (October 2023) is backward compatible and the forward-looking target.

### Principle 1: Perceivable

**Level A:**

- **1.1.1 Non-text Content** — All images have text alternatives
- **1.2.1-1.2.3 Time-based Media** — Captions for audio, descriptions for video
- **1.3.1 Info and Relationships** — Structure conveyed visually is also in the DOM
  (headings, lists, tables, form labels)
- **1.3.2 Meaningful Sequence** — Reading order is correct in the DOM
- **1.4.1 Use of Color** — Color is not the sole means of conveying information

**Level AA:**

- **1.3.4 Orientation** — Content not restricted to a single display orientation
- **1.3.5 Identify Input Purpose** — Inputs have autocomplete attributes where applicable
- **1.4.3 Contrast (Minimum)** — 4.5:1 for normal text, 3:1 for large text (18pt/14pt bold)
- **1.4.4 Resize Text** — Text resizable to 200% without loss of functionality
- **1.4.10 Reflow** — Content reflows at 320px width without horizontal scrolling
- **1.4.11 Non-text Contrast** — UI components and graphics have 3:1 contrast ratio
- **1.4.12 Text Spacing** — No loss when users adjust line/letter/word spacing
- **1.4.13 Content on Hover or Focus** — Tooltips are dismissible, hoverable, persistent

### Principle 2: Operable

**Level A:**

- **2.1.1 Keyboard** — All functionality available via keyboard
- **2.1.2 No Keyboard Trap** — Focus can always be moved away
- **2.2.2 Pause, Stop, Hide** — Auto-playing content can be controlled
- **2.3.1 Three Flashes** — Nothing flashes more than 3 times/second
- **2.4.1 Bypass Blocks** — Skip navigation mechanism
- **2.4.2 Page Titled** — Descriptive page titles
- **2.4.3 Focus Order** — Logical focus order
- **2.4.4 Link Purpose** — Link purpose determinable from text or context

**Level AA:**

- **2.4.5 Multiple Ways** — More than one way to find a page (nav, search, sitemap)
- **2.4.6 Headings and Labels** — Descriptive headings and labels
- **2.4.7 Focus Visible** — Keyboard focus indicator is visible
- **2.4.11 Focus Not Obscured (Minimum)** — (WCAG 2.2) Focused element not entirely
  hidden by sticky headers/footers
- **2.5.3 Label in Name** — Visible label text included in accessible name
- **2.5.7 Dragging Movements** — (WCAG 2.2) Single-pointer alternative to drag
- **2.5.8 Target Size (Minimum)** — (WCAG 2.2) 24x24 CSS pixel minimum

### Principle 3: Understandable

**Level A:**

- **3.1.1 Language of Page** — `lang` attribute on `<html>`
- **3.2.1 On Focus** — No unexpected context changes on focus
- **3.3.1 Error Identification** — Errors detected and described
- **3.3.2 Labels or Instructions** — Labels provided for user input

**Level AA:**

- **3.1.2 Language of Parts** — `lang` attributes on passages in other languages
- **3.2.3 Consistent Navigation** — Navigation consistent across pages
- **3.3.3 Error Suggestion** — Corrective suggestions when known
- **3.3.8 Accessible Authentication (Minimum)** — (WCAG 2.2) No cognitive function
  tests required for login; allow paste/password managers/WebAuthn

### Principle 4: Robust

- **4.1.2 Name, Role, Value** (A) — All UI components have accessible name, role, state
- **4.1.3 Status Messages** (AA) — Status messages announced without receiving focus
  (via `role="status"` or `aria-live`)

### WCAG 2.2 Additions Summary

New in WCAG 2.2 (October 2023): Focus Not Obscured (2.4.11), Dragging Movements (2.5.7),
Target Size Minimum (2.5.8), Consistent Help (3.2.6), Redundant Entry (3.3.7),
Accessible Authentication (3.3.8). **4.1.1 Parsing** was deprecated (modern browsers
handle malformed markup). Courts still primarily reference 2.1, but meeting 2.2 AA also
satisfies 2.1 AA. Expect regulatory adoption of 2.2 in the 2026-2028 timeframe.

---

## 5. Most Common Technical Failures

### Missing Alt Text (1.1.1)

- ~55% of home pages have images without alt text
- Common mistakes: missing `alt` attribute entirely, `alt="image"`, `alt="IMG_3847.jpg"`
- Decorative images should have `alt=""` (empty), not a missing alt attribute
- Linked images need alt text describing the destination, not the image appearance

### Poor Color Contrast (1.4.3, 1.4.11)

- The single most common failure: ~83% of home pages
- Common culprits: light gray text on white, placeholder text, text over images without
  sufficient overlay
- Both light and dark modes must independently meet ratios

### Missing Form Labels (1.3.1, 3.3.2)

- ~50% of form inputs lack proper labels
- **Placeholder text is NOT a label** — it disappears on input, has poor contrast, is not
  universally announced by screen readers
- Labels must be programmatically associated: `<label for="id">`, `aria-label`,
  `aria-labelledby`, or wrapping `<label>`
- Groups of related inputs need `<fieldset>` and `<legend>`

### Keyboard Navigation Issues (2.1.1, 2.4.7)

- All interactive elements must be keyboard accessible (Tab, Shift+Tab, Enter, Space,
  Arrow keys)
- Focus must be visible — never apply `outline: none` without an alternative focus style
- Keyboard traps: modals without an escape mechanism
- Custom components (dropdowns, sliders, tabs) often lack keyboard support entirely
- `tabindex` values greater than 0 create unpredictable focus order; use only `0` or `-1`

### ARIA Misuse

The first rule of ARIA: **don't use ARIA if native HTML can do the job.**

- `role="button"` on a `<div>` instead of using `<button>` — missing keyboard handling
- `aria-label` conflicting with visible text (violates 2.5.3 Label in Name)
- `aria-hidden="true"` on visible, meaningful content
- Missing required ARIA properties (e.g., `role="checkbox"` without `aria-checked`)
- Incorrect `aria-live` — too many announcements or wrong politeness settings

### Focus Management Problems

- Modals: focus should move in on open, return to trigger on close
- Deletion: focus should move to a logical next element, not reset to page top
- Off-screen content receiving focus (hidden menus, collapsed accordions still focusable)

---

## 6. Hugo and Blowfish-Specific Concerns

### Hugo Image Handling

**Figure shortcode bugs:**

- Hugo's figure shortcode historically set `alt` text to the caption when no explicit
  `alt` was provided, causing screen readers to read the same text twice
- Hugo's figure shortcode **ignores empty `alt=""` attributes**, meaning the `alt`
  attribute is omitted entirely from the output `<img>`. This is significant because
  `alt=""` explicitly marks an image as decorative (telling screen readers to skip it),
  while a missing `alt` causes screen readers to read the filename
- **Workaround**: Override the shortcode in `layouts/shortcodes/figure.html`

**Image render hooks:**

- Hugo's image render hooks allow customizing how `![alt](src)` renders to HTML
- Best practice: use `.PlainText` and pipe alt text through `plainify` so screen readers
  receive clean text without Markdown formatting

### Hugo Goldmark Renderer

- Produces semantic HTML by default (good foundation)
- Auto-generated `id` attributes on headings enable anchor links and TOC navigation
- Custom attribute support (`{.class}` syntax) allows adding ARIA attributes in Markdown

### Blowfish Theme: What It Does Well

- **Skip to content link**: Keyboard/screen reader users can bypass navigation
- **ARIA attributes**: Navigation links, dark mode switcher, search modal (`role="dialog"`,
  `aria-modal="true"`), SVG icons (`aria-hidden="true"`, `focusable="false"`)
- **Semantic HTML**: `<header>`, `<main id="main-content">`, `<nav>`, `<footer>`, proper
  heading hierarchy
- **Language attribute**: `<html lang="en">` set from Hugo config
- **Dark mode with user control**: Appearance switcher labeled with `aria-label`
- **Focus states**: Tailwind-based focus visible styles

### Blowfish Theme: Known Gaps and Risks

1. **Color contrast not verified**: No documented evidence of WCAG AA contrast ratio
   testing across built-in color schemes. The changelog mentions past "contrast
   adjustments," suggesting issues were found and patched ad-hoc.

2. **Search accessibility**: Fuse.js renders results dynamically in the DOM. There is no
   documented ARIA live region implementation for announcing results to screen readers.

3. **Mobile navigation**: No documented evidence of `aria-expanded`, `aria-controls`, or
   focus trapping on the hamburger menu. Must be verified by inspecting theme templates.

4. **No accessibility issues tracked**: The Blowfish GitHub repo has no "accessibility" or
   "a11y" label and no accessibility-specific issues filed. This suggests accessibility
   has not been a focus of community testing.

### Current Site Assessment

**Strengths (from layout inspection):**

- `layouts/partials/article-link/simple.html`: Featured image alt text set to page title
- `layouts/partials/home/background.html`: Decorative images correctly use `alt=""`;
  author image has descriptive alt; social links have `aria-label` and `title`
- `layouts/_default/_markup/render-link.html`: External links get `target="_blank"` with
  `rel="noopener noreferrer"`
- `config/_default/hugo.toml`: `languageCode = "en-us"` properly configured

**Gaps:**

- No accessibility statement page on the site
- No automated accessibility testing in CI (only htmltest for links/images)
- Content archetypes don't include alt text guidance or reminders
- Custom color schemes (`perts-forge-blue.css`, `perts-ember.css`,
  `perts-violet-forge.css`) have not been contrast-tested

### Static Site Advantages for Accessibility

- **Fast loading**: No server-side processing; screen readers can parse the DOM sooner
- **Simple DOM**: Consistent structure without JavaScript hydration issues
- **No JS dependency for content**: All content in initial HTML payload
- **Stable URLs**: Each page has a unique, bookmarkable URL

### Static Site Disadvantages

- **Limited dynamic ARIA**: Cannot natively update `aria-live` regions without JavaScript
- **No server-side personalization**: Can't serve different content based on user prefs
  without client-side JS/CSS
- **Form handling**: Third-party services required, and their accessibility varies
- **Client-side search**: Fuse.js/Lunr.js require JS and typically lack screen reader
  announcements

### Cloudflare Workers Considerations

- **CSP headers**: Overly restrictive CSP can block inline styles needed for focus
  indicators or skip-link visibility. Ensure CSP permits any inline styles/scripts needed
  for accessibility features.
- **Performance**: Edge CDN serving reduces latency, directly benefiting assistive
  technology users (faster DOM availability)
- **Caching**: No negative effects on assistive technology from CDN caching

---

## 7. Testing Tools and Methods

### Automated Tools

| Tool | Type | Notes |
|------|------|-------|
| **axe DevTools** (Deque) | Browser extension + npm | Industry standard engine; CI-ready via `@axe-core/cli` |
| **Lighthouse** | Chrome DevTools + CI | Powered by axe-core; score can be misleading (100 ≠ accessible) |
| **WAVE** (WebAIM) | Browser extension + API | Visual overlay showing errors on the page |
| **pa11y / pa11y-ci** | Node.js CLI | Open source; good for CI/CD; tests multiple URLs |
| **IBM Equal Access** | Browser extension | Rule set mapped to WCAG criteria |
| **Accessibility Insights** (Microsoft) | Browser extension | FastPass (automated) + Assessment (guided manual) |

### What Automated Tools Catch (and Miss)

Automated tools detect approximately **30-57% of WCAG issues** (varies by tool; Deque
claims ~57% with axe). They reliably detect:

- Missing alt attributes (not alt text quality)
- Color contrast violations (solid backgrounds only; struggles with gradients/images)
- Missing form labels
- Missing `lang` attribute
- Duplicate IDs, empty links/buttons, missing document title
- Basic ARIA validation

They **cannot** detect:

- Whether alt text is meaningful and accurate
- Whether focus order is logical
- Whether custom components are keyboard operable
- Whether ARIA usage is semantically correct
- Whether content makes sense when linearized
- Whether captions are accurate
- Cognitive accessibility issues

### Manual Testing Checklist

**Keyboard-only navigation:**

1. Put mouse aside; use only Tab, Shift+Tab, Enter, Space, Escape, Arrow keys
2. Verify all interactive elements are reachable and operable
3. Check focus is always visible
4. Check focus order matches visual/logical order
5. Open/close modals and check focus management
6. Navigate through forms and submit them
7. Check for keyboard traps

**Screen reader testing:**

- **NVDA** (free, Windows) — pair with Firefox or Chrome
- **JAWS** (paid, Windows) — pair with Chrome or Edge
- **VoiceOver** (built-in, macOS/iOS) — pair with Safari
- Test: reading order, link/button announcements, form labels, landmarks, heading
  navigation, live regions, table navigation

**Visual inspection:**

- Zoom to 200% — check for content loss/overlap
- Set viewport to 320px wide — check reflow
- Override text spacing per 1.4.12 — check for clipping
- Check with Windows High Contrast Mode / forced colors
- Verify dark mode contrast independently from light mode

### Recommended Testing Cadence

- **Automated scans:** On every build/PR (CI integration)
- **Manual keyboard + screen reader:** Every major feature/release
- **Full audit:** Annually or after significant redesigns

---

## 8. Common Gotchas

### Decorative vs. Informative Images

- **Decorative**: Visual flourish, redundant icon next to text → `alt=""`
- **Informative**: Conveys information not available elsewhere → descriptive alt text
- **Functional**: Image is a link/button → alt describes the action/destination
- **Complex**: Charts/infographics → short alt + longer text alternative

Common mistake: making all images decorative, or giving decorative images alt text like
"decorative line."

### Custom Components vs. Native HTML

Native `<button>`, `<a>`, `<select>`, `<input>`, `<dialog>` come with keyboard handling,
roles, and states for free. Custom `<div onclick>` requires manually implementing `role`,
`tabindex="0"`, keyboard handlers, `aria-expanded`, etc. The effort to make a custom
component accessible usually exceeds styling a native element. If you must use custom
components, follow the WAI-ARIA Authoring Practices Guide (APG) patterns.

### Third-Party Widgets

- **Chat widgets** (Intercom, Drift, Zendesk): Often have significant accessibility issues
- **Social embeds** (Twitter/X, Instagram, YouTube): Varying quality; iframes may lack titles
- **reCAPTCHA**: Historically problematic; v3 (invisible) is better; always provide
  alternative contact method
- **Maps** (Google Maps embeds): Keyboard navigation issues; provide text-based directions
- **You are responsible for third-party content on your site**

### Cookie Consent Banners

- Must be keyboard accessible and navigable
- "Reject all" should be as easy to reach as "Accept all"
- Must meet contrast requirements
- After dismissal, focus should return to a logical place
- A surprising number of consent management platforms have accessibility failures

### Dark Mode and Color Contrast

- Both light and dark modes must independently meet 4.5:1 contrast ratios
- Colors that pass in light mode may fail in dark mode (and vice versa)
- `prefers-color-scheme` media query should be respected
- System-level forced colors (Windows High Contrast Mode) override your colors — test
  that content remains visible
- Semi-transparent overlays and background images complicate contrast checking

### Responsive Design

- Content must reflow without horizontal scrolling at 320px CSS width (1.4.10)
- Touch targets need adequate size on mobile (24x24 minimum per WCAG 2.2 AA)
- Sticky headers/footers can obscure focused elements at certain breakpoints (2.4.11)
- Hover-based navigation needs tap/keyboard alternatives on mobile
- Zoom to 400% effectively tests small viewport behavior on desktop

### PDF Documents

- A site can be fully accessible but fail if it links to inaccessible PDFs
- Always provide an HTML alternative when possible
- If PDFs are necessary: use tagged PDFs, check reading order, add alt text, mark
  decorative elements as artifacts
- Test with PAC (PDF Accessibility Checker) and screen readers
- Common gotcha: auto-generated invoices, reports, and legal documents are rarely accessible

---

## 9. Compliance Strategies

### Accessibility Statement

Every site should have an accessibility statement page that includes:

- Conformance level claimed (e.g., "We aim to conform to WCAG 2.1 Level AA")
- Known limitations and alternatives
- Contact information for accessibility feedback
- Date of last review
- Commitment to ongoing improvement

**Legal benefits:** Demonstrates good faith. While a statement alone does not prevent
lawsuits, it can support a "good faith effort" defense and may reduce settlement amounts
by 40-60% when combined with documented remediation efforts.

**Placement:** Link in the site footer, accessible from every page.

### VPAT (Voluntary Product Accessibility Template)

- A document reporting how well a product conforms to accessibility standards
- Required by many government procurement processes
- Not typically required for content websites, but demonstrates commitment
- Format: ITIC VPAT 2.5 (maps to WCAG 2.2, EN 301 549, Section 508)

### Ongoing Monitoring vs. One-Time Audit

A one-time audit is a starting point, not a solution. Accessibility regresses with every
new feature, content update, or dependency change.

**Recommended approach:**

- Automated testing in CI (catches regressions on every PR)
- Quarterly manual testing (keyboard + screen reader)
- Annual professional audit (if budget allows)
- Accessibility review as part of content publishing workflow

### Professional Audit Costs

- Small/medium sites: $1,500-$5,500
- Large/complex sites: $10,000+
- Ongoing monitoring services: $500-$2,000/month

### Prioritization Framework

When remediating, fix issues in this order:

1. **Critical barriers**: Issues that completely block access (keyboard traps, missing
   skip nav, content only available via mouse, missing form labels)
2. **Serious barriers**: Issues that make tasks very difficult (poor contrast, missing
   alt text on informative images, confusing focus order)
3. **Moderate issues**: Issues that cause inconvenience (inconsistent navigation, missing
   error suggestions, heading hierarchy problems)
4. **Minor issues**: Best practice improvements (target sizes, text spacing, decorative
   image alt text cleanup)

### CI/CD Integration

Add automated accessibility testing to your build pipeline:

- **pa11y-ci**: Run against built Hugo output in CI
- **axe-core**: Integrate with Playwright/Puppeteer for component-level testing
- **Lighthouse CI**: Accessibility scoring with thresholds

---

## 10. Accessibility Overlays — Why to Avoid Them

Accessibility overlays (AccessiBe, UserWay, AudioEye, etc.) are JavaScript widgets that
claim to automatically fix accessibility issues. **The disability community and
accessibility professionals overwhelmingly oppose them.**

### Why Overlays Don't Work

- Automated tools detect only 30-57% of issues; overlays can only attempt to fix what
  they can detect
- They add a JavaScript layer that can interfere with screen readers
- They create a separate, often degraded experience for disabled users
- They cannot fix structural HTML issues (heading hierarchy, form labels, semantic markup)
- They cannot provide meaningful alt text for images

### Legal Risk

- **FTC fined AccessiBe $1 million (January 2025)** for misrepresenting its tool's
  ability to make websites WCAG-compliant
- **UserWay class-action lawsuit (July 2024)**: Bloomsybox.com alleges misleading
  compliance claims; they were sued for accessibility violations just six months after
  installing UserWay's overlay
- In 2024, **25% of all accessibility lawsuits (1,023 cases) cited overlays as barriers**,
  not solutions
- Installing an overlay has **not** been accepted by any court as a defense against ADA
  claims

### Community Position

- The **Overlay Fact Sheet** has been signed by 800+ accessibility professionals
- The National Federation of the Blind has publicly opposed overlays
- The refrain: "Nothing about us without us" — overlays are developed without meaningful
  input from disabled users

---

## 11. Business Case Beyond Legal

### SEO Benefits

Accessibility improvements directly improve SEO:

- Proper heading hierarchy helps search engines understand content structure
- Alt text makes images indexable
- Semantic HTML improves crawlability
- Page speed (a byproduct of accessibility work) is a ranking factor
- 73% of sites that improved accessibility saw measurable traffic increases

### Market Size

- Over 1 billion people globally live with some form of disability
- The disability market controls **$13 trillion** in disposable income
- 15-20% of any population has a disability

### Mobile and Accessibility Overlap

Many accessibility improvements directly improve mobile experience:

- Touch target sizes
- Reflow and responsive design
- Readable text without zooming
- Keyboard/focus management (benefits tablet keyboard users)

### Conversion Impact

Studies show 8-12% improvement in conversion rates after accessibility improvements, due
to clearer forms, better navigation, and faster page loads.

---

## 12. Remediation Approach

### Court Expectations

- Courts typically expect **12-24 months** for substantial remediation
- A documented, phased approach is accepted
- Showing continuous progress matters more than immediate perfection

### Phased Approach

**Phase 1 (Immediate — weeks):**

- Add accessibility statement page
- Fix critical barriers: skip navigation, keyboard traps, missing lang attribute
- Add automated testing to CI
- Audit and fix color contrast in all color schemes

**Phase 2 (Short-term — 1-3 months):**

- Verify and fix all image alt text
- Test and fix keyboard navigation for all interactive elements
- Audit mobile menu accessibility (aria-expanded, focus trapping)
- Test search functionality with screen readers
- Fix any form accessibility issues

**Phase 3 (Medium-term — 3-6 months):**

- Comprehensive screen reader testing
- Document content authoring accessibility guidelines
- Test all third-party widgets
- Address WCAG 2.2 new criteria (target sizes, focus not obscured)
- Consider professional audit

**Ongoing:**

- Automated testing on every PR
- Accessibility review as part of content publishing
- Annual review and update of accessibility statement
- Stay current with WCAG updates and legal developments

### Good Faith Documentation

- Keep records of accessibility testing, remediation efforts, and timeline
- Maintain a public accessibility statement with contact info
- Respond promptly to accessibility complaints
- Document investment in accessibility training and tools
- This documentation can reduce settlements 40-60% and demonstrates commitment

---

## 13. Community Perspectives

### What Screen Reader Users Actually Struggle With Most

From WebAIM surveys and community forums:

1. **CAPTCHA** — ranked as the #1 most problematic item for over a decade
2. **Unexpected screen changes** — page updates without warning
3. **Ambiguous links** — "click here," "read more," "learn more" without context
4. **Missing alt text** — especially on functional images (buttons, links)
5. **Inaccessible search** — results not announced, filters not keyboard-operable
6. **Keyboard inaccessibility** — the single fastest way to make a site unusable

### "Technically Compliant but Unusable"

A recurring theme in disability communities: sites can pass automated audits but still be
unusable. Examples:

- Alt text present but meaningless ("image1.jpg", "photo", "icon")
- Form labels present but confusing ("Field 1", "Enter data")
- Skip navigation present but broken (link goes nowhere)
- ARIA present but incorrect (worse than no ARIA at all)

**The goal is not just compliance — it's usability.**

### What Actually Matters (Community Consensus)

1. **Semantic HTML first** — this alone resolves a huge percentage of issues
2. **Keyboard access** — if it works with a keyboard, it works with most assistive tech
3. **Clear, descriptive content** — good writing is accessible writing
4. **Test with real users** — no amount of automated testing replaces a screen reader user
   navigating your site

---

## 14. Action Items for This Project

Based on the site audit and research, here are specific action items ordered by priority:

### Critical (Do Now)

- [ ] **Add automated accessibility testing to CI**: Add pa11y-ci or axe-core testing
      against the built Hugo output in the validate workflow
- [ ] **Audit color contrast**: Test all three color schemes (`perts-forge-blue`,
      `perts-ember`, `perts-violet-forge`) in both light and dark modes against WCAG AA
      ratios (4.5:1 for text, 3:1 for large text and UI components)
- [ ] **Add an accessibility statement page**: Create a content page at `/accessibility/`
      with conformance commitment, contact info, and feedback mechanism; link from footer

### High Priority (Soon)

- [ ] **Verify mobile menu accessibility**: Inspect Blowfish's hamburger menu templates
      for `aria-expanded`, `aria-controls`, focus trapping, and Escape key support
- [ ] **Test search with screen reader**: Verify Fuse.js search results are announced;
      if not, add `aria-live` region for search result announcements
- [ ] **Verify Hugo figure shortcode behavior**: Check if Blowfish's override of the
      figure shortcode correctly handles `alt=""` for decorative images
- [ ] **Test keyboard navigation end-to-end**: Navigate entire site with keyboard only;
      verify all interactive elements are reachable and focus is visible

### Medium Priority (Next Quarter)

- [ ] **Add alt text guidance to archetypes**: Add comments in `blog.md` and
      `case-studies.md` reminding authors to provide meaningful alt text
- [ ] **Check sticky header focus obscuring**: With the `fixed-fill-blur` header layout,
      verify focused elements are not hidden behind the sticky header (WCAG 2.2 2.4.11)
- [ ] **Test with NVDA or VoiceOver**: Full screen reader walkthrough of all page types
- [ ] **Review third-party content**: Audit any embedded widgets, iframes, or external
      scripts for accessibility

### Low Priority (Ongoing)

- [ ] **Document content authoring guidelines**: Write internal guidelines for accessible
      content creation (alt text, heading hierarchy, link text, etc.)
- [ ] **Monitor legal developments**: Track DOJ rule changes and WCAG 2.2 adoption
- [ ] **Consider annual professional audit**: Budget for external accessibility audit

---

## 15. Sources

### Legal and Regulatory

- [ADA Title III Blog - Federal Lawsuit Filings 2024](https://www.adatitleiii.com/2025/04/federal-court-website-accessibility-lawsuit-filings-continue-to-decrease-in-2024/)
- [ADA Title III Blog - 2025 Mid-Year Rebound](https://www.adatitleiii.com/2025/09/2025-mid-year-report-ada-title-iii-federal-lawsuit-numbers-continue-to-rebound/)
- [EcomBack 2024 Annual Report](https://www.ecomback.com/annual-2024-ada-website-accessibility-lawsuit-report)
- [EcomBack 2025 Mid-Year Report](https://www.ecomback.com/ada-website-lawsuits-recap-report/2025-mid-year-ada-website-lawsuit-report)
- [Accessibility.Works 2024 Lawsuit Trends](https://www.accessibility.works/blog/ada-lawsuit-trends-statistics-2024-summary/)
- [UsableNet ADA Lawsuit Tracker](https://info.usablenet.com/ada-website-compliance-lawsuit-tracker)
- [DOJ Fact Sheet - Web Accessibility Rule](https://www.ada.gov/resources/2024-03-08-web-rule/)
- [DOJ to Revisit ADA Title II/III](https://www.pivotalaccessibility.com/2025/11/doj-to-revisit-ada-title-ii-and-iii-and-what-it-means-for-digital-accessibility/)
- [Converge Accessibility - DOJ Rule in Danger](https://convergeaccessibility.com/2025/06/02/doj-web-accessibility-rule-in-danger/)

### Case Law

- [CNBC - Supreme Court Domino's Decision](https://www.cnbc.com/2019/10/07/dominos-supreme-court.html)
- [BOIA - Domino's Settlement](https://www.boia.org/blog/the-robles-v.-dominos-settlement-and-why-it-matters)
- [ADA Title III Blog - Robles v. Domino's Settlement](https://www.adatitleiii.com/2022/06/robles-v-dominos-settles-after-six-years-of-litigation/)
- [ADA Title III Blog - Winn-Dixie Reversal](https://www.adatitleiii.com/2021/04/eleventh-circuit-says-winn-dixies-inaccessible-website-does-not-violate-the-ada/)
- [Holland & Knight - Winn-Dixie Vacatur](https://www.hklaw.com/en/insights/publications/2022/01/11th-circuit-vacates-opinion-holding-that-websites-are-not-ada-public)
- [W3C - Target Case Study](https://www.w3.org/WAI/business-case/archive/target-case-study)
- [BOIA - Fashion Nova Settlement](https://www.boia.org/blog/fashion-nova-settles-web-accessibility-lawsuit-for-5.15-million)
- [DOJ Opposes Fashion Nova Settlement](https://www.justice.gov/opa/pr/department-justice-opposes-unfair-class-action-settlement-involving-accessibility-website)

### Technical Standards

- [W3C WCAG 2.1](https://www.w3.org/TR/WCAG21/)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM - WebAIM Million Annual Report](https://webaim.org/projects/million/)
- [WebAIM Semantic Structure Guide](https://webaim.org/techniques/semanticstructure/)

### Hugo and Blowfish

- [Hugo figure shortcode alt text issue (GitHub #8852)](https://github.com/gohugoio/hugo/issues/8852)
- [Hugo Discourse - figure shortcode empty alt attributes](https://discourse.gohugo.io/t/figure-shortcode-ignore-empty-alt-attributes/42426)
- [Hugo image render hooks documentation](https://gohugo.io/render-hooks/images/)
- [Hugo markup configuration (Goldmark)](https://gohugo.io/configuration/markup/)
- [Blowfish theme GitHub repository](https://github.com/nunocoracao/blowfish)
- [Blowfish configuration docs](https://blowfish.page/docs/configuration/)

### Industry and Community

- [Accessible.org - Settlement Amounts](https://accessible.org/ada-website-compliance-lawsuit-settlement-amounts/)
- [Accessible.org - 2026 Predictions](https://accessible.org/2026-ada-website-compliance-lawsuits-ai/)
- [Accessibility.Works - AI Fueling Lawsuits](https://www.accessibility.works/blog/ai-generated-accessibility-ada-lawsuits-diy/)
- [BOIA - WCAG Violations in Lawsuits](https://www.boia.org/blog/5-web-accessibility-barriers-frequently-cited-in-ada-lawsuits)
- [Overlay Fact Sheet](https://overlayfactsheet.com/)
- [Smashing Magazine - CAPTCHA Accessibility](https://www.smashingmagazine.com/2025/11/accessibility-problem-authentication-methods-captcha/)
- [Lainey Feingold - UserWay Overlay Lawsuit](https://www.lflegal.com/2025/02/userway-overlay-lawsuit/)

### Deployment

- [Cloudflare Workers Security Headers](https://developers.cloudflare.com/workers/examples/security-headers/)
- [MDN ARIA Landmark Roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/landmark_role)
