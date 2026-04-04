/**
 * Generate the site-wide OG social preview image using existing brand assets.
 *
 * Usage: node scripts/generate-og.js
 *
 * Produces:
 *   assets/img/og-default.png  (1200x630) - Site-wide social preview
 *
 * Referenced by params.toml defaultSocialImage. Blowfish resolves it via
 * resources.Get (assets/). All pages use this as the OG fallback; pages
 * with a featured image get that image instead.
 *
 * The logo PNG is composited as-is from static/img/logo/. Only the background
 * gradient and tagline text are generated; the logo is never re-rendered.
 *
 * Design mirrors the homepage hero section: dark slate/violet gradient
 * background, white headline, and the multi-color subtitle gradient
 * (blue > purple > red > orange) from custom.css --accent-* variables.
 *
 * Font note: Text is rendered via librsvg using the system's fontconfig.
 * Trebuchet MS (the brand font) is available on Windows/WSL via Windows fonts.
 * On systems without it, Liberation Sans or DejaVu Sans are used as fallbacks,
 * which may produce slightly different letter spacing. Verify output visually
 * after generating on a new machine.
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const WIDTH = 1200;
const HEIGHT = 630;
const ROOT = path.join(__dirname, "..");
const FONT = "Trebuchet MS, Liberation Sans, DejaVu Sans, sans-serif";
const LOGO_SRC = path.join(
  ROOT,
  "static/img/logo/perts-foundry-horizontal-dark@2x.png",
);
const OUTPUT = path.join(ROOT, "assets/img/og-default.png");

// Matches the homepage .hero-gradient-bg dark mode gradient.
// Uses color-neutral-900 (#0F172A) as the base with primary-900 (blue)
// and secondary-900 (violet) as the radial glow, simulating the
// animated gradient at its mid-point.
function backgroundSvg() {
  return Buffer.from(`<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="50%" stop-color="#150F30"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#4C1D95" stop-opacity="0.35"/>
      <stop offset="40%" stop-color="#1E3A8A" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#0F172A" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
</svg>`);
}

// SVG overlay with gradient-filled subtitle text matching the homepage
// .homepage-hero-sub gradient: accent-blue > accent-purple > accent-red > accent-orange
function textOverlaySvg(headlineY, subY, urlY) {
  return Buffer.from(`<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="subGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="33%" stop-color="#7C3AED"/>
      <stop offset="66%" stop-color="#DC2626"/>
      <stop offset="100%" stop-color="#FB923C"/>
    </linearGradient>
  </defs>
  <text x="${WIDTH / 2}" y="${headlineY}" text-anchor="middle"
    font-family="${FONT}" font-weight="900" font-size="80"
    fill="#FFFFFF" letter-spacing="3">Build. Scale. Own.</text>
  <text x="${WIDTH / 2}" y="${subY}" text-anchor="middle"
    font-family="${FONT}" font-weight="700" font-size="32"
    fill="url(#subGrad)" letter-spacing="6">YOUR TEAM, EXTENDED.</text>
  <text x="${WIDTH / 2}" y="${urlY}" text-anchor="middle"
    font-family="${FONT}" font-weight="400" font-size="20"
    fill="#64748B" letter-spacing="3">pertsfoundry.com</text>
</svg>`);
}

async function loadLogo(targetWidth) {
  if (!fs.existsSync(LOGO_SRC)) {
    throw new Error(`Logo not found: ${LOGO_SRC}`);
  }
  const { data, info } = await sharp(LOGO_SRC)
    .resize({ width: targetWidth })
    .toBuffer({ resolveWithObject: true });
  return { buffer: data, width: info.width, height: info.height };
}

async function generate() {
  const logo = await loadLogo(500);

  // Layout: logo, gap, headline, gap, subtitle, with URL pinned near bottom.
  // Visually center the logo+headline+subtitle block, offset up slightly for URL.
  const gapLogoHeadline = 35;
  const headlineHeight = 62; // approximate cap-height for 80px
  const gapHeadlineSub = 16;
  const subHeight = 24; // approximate cap-height for 32px

  const contentHeight =
    logo.height + gapLogoHeadline + headlineHeight + gapHeadlineSub + subHeight;
  const contentTop = Math.round((HEIGHT - contentHeight) / 2) - 15;

  const logoTop = contentTop;
  // The icon on the left side of the horizontal logo makes it appear
  // left-of-center when mathematically centered. Nudge right so the text
  // portion of the logo aligns visually with the headline below.
  const logoLeft = Math.round((WIDTH - logo.width) / 2) + 58;

  // SVG text y = baseline. Headline baseline sits below the logo + gap.
  const headlineY = logoTop + logo.height + gapLogoHeadline + headlineHeight;
  const subY = headlineY + gapHeadlineSub + 24 + subHeight;
  const urlY = 610;

  // Keep in sync with content/_index.md hero.headline / hero.subheadline
  const text = textOverlaySvg(headlineY, subY, urlY);

  const image = await sharp(backgroundSvg())
    .composite([
      { input: logo.buffer, top: logoTop, left: logoLeft },
      { input: text, top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  await fs.promises.writeFile(OUTPUT, image);
  console.log("  " + path.relative(ROOT, OUTPUT));
}

async function main() {
  console.log("Generating OG image (1200x630)...");
  await generate();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
