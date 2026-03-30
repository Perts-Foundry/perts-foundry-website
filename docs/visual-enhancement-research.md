# Visual Enhancement Research: Perts Foundry Website

> **Researched:** 2026-03-25
> **Companion doc:** `docs/website-audit-and-roadmap.md` (tracks implementation status)

Research into 2025-2026 web design trends for B2B consulting sites, with specific implementation guidance for a Hugo static site using the Blowfish v2 theme on Cloudflare Workers.

---

## Current Visual Baseline

- **Theme:** Blowfish v2 (Hugo module), built on Tailwind CSS
- **Color scheme:** `perts-forge-blue` (blue primary #3B82F6, violet secondary #8B5CF6, slate neutral)
- **Default appearance:** Dark mode, no auto-switching
- **Homepage layout:** `custom` (multi-section landing page via `layouts/partials/home/custom.html` dispatching to 8 sub-partials in `layouts/partials/homepage/`)
- **Custom CSS:** ~580 lines in `assets/css/custom.css`, organized with comment-block sections (Global, Shared Components, Homepage, Contact Page). Includes homepage card interactions, metric glow effects, fluid typography, process timeline, and light/dark mode overrides.
- **Existing customizations:** 16 layout files (home/custom.html, homepage/hero.html, homepage/tech-bar.html, homepage/problem.html, homepage/services-grid.html, homepage/metrics-band.html, homepage/featured-cases.html, homepage/process.html, homepage/final-cta.html, hero/basic.html, article-link/simple.html, extend-footer.html, render-link.html, contact/simple.html, extend-head-uncached.html, robots.txt)
- **Additional color schemes:** `perts-ember.css`, `perts-violet-forge.css` (unused, available for section theming)
- **Animation infrastructure:** `prefers-reduced-motion` already handled in `custom.css`

### Key Blowfish Customization Surfaces

- `layouts/partials/home/custom.html` (set `homepage.layout = "custom"` for full control)
- `layouts/partials/extend-head-uncached.html` (inject CSS, fonts, meta into `<head>`; project uses the uncached variant)
- `layouts/partials/extend-footer.html` (inject JS before `</body>`, already exists with commented-out scheme rotation)
- `assets/css/custom.css` (loaded after theme defaults, supports `@apply`)
- `layouts/shortcodes/` (custom visual components)
- CSS custom properties for the full color system (`--color-primary-*`, `--color-secondary-*`, `--color-neutral-*`)

---

## 1. Modern Consulting Website Design Trends

### 1a. Scroll-Triggered Animations

Content elements animate into view as users scroll. Fade-ups, slide-ins, scale reveals, and parallax layers.

**Why it works:** Creates progression and discovery. Scroll-driven storytelling increases engagement by up to 80% and time-on-site by 47% compared to static content.

**Implementation options (ascending complexity):**

| Approach | Size | Browser Support | Capability |
|----------|------|----------------|------------|
| CSS `animation-timeline: view()` | 0KB | Chrome 115+, Safari 18+ | Basic scroll-linked animations |
| Intersection Observer + CSS transitions | 0KB (~15 lines JS) | 97%+ | Reveal-on-scroll, one-time triggers |
| GSAP ScrollTrigger | ~34KB gzipped | 99%+ | Scrubbing, pinning, complex choreography |

**Recommended starting point:** Intersection Observer + CSS transitions. Lightweight, universal, respects existing `prefers-reduced-motion` handling.

```js
// ~15 lines in extend-footer.html
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
```

```css
/* In custom.css */
[data-reveal] {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
[data-reveal].revealed {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  [data-reveal] { opacity: 1; transform: none; transition: none; }
}
```

### 1b. Micro-Interactions

Subtle animations on hover, click, or focus. 200-500ms duration range.

**Why it works:** 68% of users say they are less likely to return to a site that feels "dated." Micro-interactions provide feedback that makes the interface feel alive.

**Examples for Perts Foundry:**

```css
/* Service/case study cards: lift + shadow */
.article-link { transition: transform 0.3s ease, box-shadow 0.3s ease; }
.article-link:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }

/* CTA buttons: scale + glow */
.btn-primary { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.btn-primary:hover {
  transform: scale(1.03);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
}

/* Card images: zoom within container */
.article-link img { transition: transform 0.5s ease; }
.article-link:hover img { transform: scale(1.05); }

/* Nav links: underline slide-in */
nav a { position: relative; }
nav a::after {
  content: ''; position: absolute; bottom: 0; left: 0;
  width: 0; height: 2px; background: var(--color-primary-500);
  transition: width 0.3s ease;
}
nav a:hover::after { width: 100%; }
```

### 1c. Glassmorphism

Translucent layered elements with backdrop-blur. The fixed-fill-blur header already uses this pattern.

**Technique:**

```css
.glass-card {
  background: rgba(30, 41, 59, 0.6); /* neutral-800 at 60% */
  backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.1); /* neutral-400 at 10% */
  border-radius: 12px;
}
```

**Browser support:** `backdrop-filter` has 96%+ global support.

### 1d. Dark Mode Excellence

Going beyond "inverted colors" to purposeful dark design with accent glow effects.

**Techniques specific to perts-forge-blue palette:**

```css
/* Electric blue glow on accent elements */
.glow-blue { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }

/* Violet glow for secondary accents */
.glow-violet { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }

/* Gradient border on cards */
.gradient-border {
  border: 1px solid transparent;
  background-image: linear-gradient(var(--bg), var(--bg)),
                    linear-gradient(135deg, rgba(59,130,246,0.5), rgba(139,92,246,0.5));
  background-origin: border-box;
  background-clip: padding-box, border-box;
}

/* Soft halo behind key numbers */
.metric-glow {
  text-shadow: 0 0 40px rgba(59, 130, 246, 0.5);
}
```

**Design guidance:** 20-30% more padding/margin than light mode equivalents for a premium feel. Dark backgrounds make blue (#3B82F6) and violet (#8B5CF6) pop dramatically.

### 1e. Typography

Typography as a design element: oversized hero headings, fluid sizing, variable fonts.

```css
/* Fluid hero heading */
.hero-heading {
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
}
```

### 1f. Hero Section Innovations

Moving beyond static background images:

| Approach | Complexity | Size | Effect |
|----------|-----------|------|--------|
| Animated CSS gradient mesh | Low-Medium | 0KB | Slowly shifting gradient colors |
| Particle network (particles.js) | Medium | ~28KB | Nodes + connecting lines, "infrastructure" metaphor |
| Video background | Low-Medium | Variable | Looping ambient video |
| Three.js 3D scene | High | ~150KB | Interactive 3D visualization |

**CSS gradient mesh example:**

```css
.animated-gradient {
  background: linear-gradient(-45deg, #0f172a, #1e3a5f, #1e1b4b, #0f172a);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

---

## 2. Trust-Building Visual Patterns

### 2a. Technology Logo Wall

Since client logos are restricted (anonymized), a "Technologies We Work With" marquee wall serves as both trust signal and capabilities overview.

**CSS-only infinite marquee:**

```css
.logo-marquee { overflow: hidden; white-space: nowrap; }
.logo-track {
  display: inline-flex; gap: 3rem;
  animation: marquee 30s linear infinite;
}
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
```

**Hugo shortcode approach:** Read SVG logos from a data file or directory. Duplicate the track for seamless looping.

**Technologies to include:** AWS, GCP, Terraform, Kubernetes, Docker, GitHub Actions, Jenkins, Helm, Vault, Datadog

### 2b. Animated Metric Counters

Numbers counting up from 0 when scrolled into view.

```js
// ~30 lines in extend-footer.html
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const start = performance.now();
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = el.dataset.display || target.toLocaleString();
  }
  requestAnimationFrame(update);
}
```

**Metrics to highlight:** "$125K+ annual savings", "200+ Terraform projects", "10+ enterprise engagements", "Zero downtime"

### 2c. Process Timeline

Visual engagement process: Discovery, Assessment, Implementation, Handoff.

Blowfish includes a built-in `timeline` shortcode that can be used directly. For more visual control, a custom shortcode with CSS grid, numbered steps, and connecting lines.

### 2d. Before/After Comparisons

Color-coded results tables on case study pages.

```css
/* Before column: muted/red tint */
td.before { color: rgba(248, 113, 113, 0.8); }
/* After column: accent/green tint */
td.after { color: rgba(74, 222, 128, 0.8); font-weight: 600; }
```

### 2e. Technology Stack Visualization

Interactive grid of technology icons grouped by category (Cloud, CI/CD, IaC, Monitoring).

**Hugo implementation:** Data file (`data/technologies.yaml`) with categories and items. Shortcode renders grid with hover effects linking to related case studies.

---

## 3. Blowfish-Specific Implementation Notes

### Custom Homepage

```toml
# config/_default/params.toml
[homepage]
  layout = "custom"
```

Create `layouts/partials/home/custom.html` with full HTML/Tailwind/Hugo templating. Reuse existing partials: `{{ partial "recent-articles/main.html" . }}` for article lists.

### Custom Shortcodes

Place in `layouts/shortcodes/`. Available to all content via `{{< shortcode-name >}}`.

**High-value shortcodes to build:**
- `stat-counter` (animated metric, Intersection Observer triggered)
- `tech-stack` (icon grid by category)
- `logo-wall` (infinite marquee)
- `process-timeline` (visual engagement steps)
- `glass-card` (glassmorphism styled content block)

### Asset Pipeline

Hugo Pipes can process custom JS for minification and fingerprinting:

```html
{{ $js := resources.Get "js/animations.js" | minify | fingerprint }}
<script src="{{ $js.RelPermalink }}" defer></script>
```

### Accessibility Preservation

All animations must respect `prefers-reduced-motion`. The existing handler in `custom.css` sets `animation-duration: 0.01ms !important` and `transition-duration: 0.01ms !important` for all elements. New animations should additionally use:

```css
@media (prefers-reduced-motion: reduce) {
  [data-reveal] { opacity: 1; transform: none; }
  .logo-track { animation: none; }
  .animated-gradient { animation: none; }
}
```

Interactive elements need keyboard accessibility and ARIA attributes. pa11y-ci will catch WCAG violations on every PR.

### Performance Budget

- Prefer CSS animations (`transform`, `opacity`) over JS where possible (compositor thread, never blocks main thread)
- Lazy-load heavy libraries (GSAP, Three.js) only on pages that need them
- Canvas/particle effects should pause when not visible (Intersection Observer)
- Total added JS budget recommendation: under 50KB gzipped for Tier 1-2 enhancements

### Browser Support

| Feature | Support | Progressive Enhancement |
|---------|---------|------------------------|
| `animation-timeline: view()` | Chrome 115+, Safari 18+ | `@supports` check, fallback to static |
| `backdrop-filter` | 96%+ | Already in use on header |
| CSS `@property` (counter animations) | Chrome 85+, Safari 15.4+ | Fallback to static numbers |
| `scroll-snap-type` | 95%+ | Non-critical, graceful fallback |
| Intersection Observer | 97%+ | Core of scroll-reveal strategy |

---

## 4. Prioritized Implementation Tiers

### Tier 1: Quick Wins (CSS-only, do first)

| Item | Description | Files |
|------|-------------|-------|
| Micro-interactions | Hover effects on cards, buttons, links | `assets/css/custom.css` |
| Dark glow accents | Box-shadow glows, gradient borders | `assets/css/custom.css` |
| Fluid typography | `clamp()` on hero headings | `assets/css/custom.css` |
| Fix word count display | Hide metadata on listing cards | `assets/css/custom.css` or `article-link/simple.html` |

### Tier 2: Medium Effort (CSS + minimal JS)

| Item | Description | Files |
|------|-------------|-------|
| Scroll-reveal | Intersection Observer + CSS transitions | `extend-footer.html`, `custom.css` |
| Technology logo wall | CSS marquee, SVG tech logos | New shortcode, logo images, `_index.md` |
| Animated metric counters | JS counter + Intersection Observer | New shortcode, `extend-footer.html` |
| Process timeline | "How We Work" visual flow | `_index.md` or `about/index.md`, possibly new shortcode |
| Custom homepage | Blowfish `custom` layout, sectioned page | `params.toml`, new `home/custom.html` |
| Glassmorphism cards | `backdrop-filter: blur()` on cards | `custom.css` |

### Tier 3: Differentiation

| Item | Description | Files |
|------|-------------|-------|
| Animated hero background | CSS gradient mesh or particles.js | `home/background.html` or `home/custom.html` |
| Enhanced case studies | Scroll reveals, animated metrics, colored tables | Case study layouts, `custom.css`, `extend-footer.html` |
| Section color theming | Map Forge Blue/Ember/Violet to sections | `extend-footer.html`, `custom.css` |
| SVG icon animations | Stroke draw-on effects on tech logos | New SVG files, `custom.css` |

### Tier 4: Ambitious

| Item | Description | Size Impact |
|------|-------------|-------------|
| 3D particle network hero | Three.js, interactive on mouse | ~150KB |
| Full scrollytelling homepage | GSAP ScrollTrigger, pinned sections | ~34KB |
| Kinetic typography | Staggered word/letter reveals | Custom template + JS |

---

## Sources

- [B2B Web Design Trends 2026 (Windmill Strategy)](https://www.windmillstrategy.com/top-9-b2b-web-design-trends/)
- [B2B Website Designs 2025 (Bop Design)](https://www.bopdesign.com/bop-blog/top-b2b-website-designs-2025/)
- [Web Design Trends 2026 (Figma)](https://www.figma.com/resource-library/web-design-trends/)
- [CSS Scroll-Driven Animations (Chrome Developers)](https://developer.chrome.com/docs/css-ui/scroll-driven-animations)
- [CSS Scroll-Driven Animations (WebKit)](https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/)
- [GSAP ScrollTrigger](https://gsap.com/scroll/)
- [Blowfish Advanced Customisation](https://blowfish.page/docs/advanced-customisation/)
- [Blowfish Homepage Layout](https://blowfish.page/docs/homepage-layout/)
- [Blowfish Shortcodes](https://blowfish.page/docs/shortcodes/)
- [Dark Mode Best Practices 2025](https://medium.com/@jackbrownkarmaa/dark-mode-in-web-design-best-practices-in-2025-445d8d6463a3)
- [Micro-Interactions in Web Design 2025 (Stan Vision)](https://www.stan.vision/journal/micro-interactions-2025-in-web-design)
- [particles.js](https://vincentgarreau.com/particles.js/)
- [Trust Building in B2B Website Design (UpCity)](https://upcity.com/experts/top-5-trust-building-elements-in-b2b-website-design/)
