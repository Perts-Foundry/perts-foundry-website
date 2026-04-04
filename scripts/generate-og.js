/**
 * Generate OG social preview images using existing brand assets.
 *
 * Usage: node scripts/generate-og.js
 *
 * Produces:
 *   static/img/og-homepage.png  (1200x630) - Homepage social preview
 *   assets/img/og-default.png   (1200x630) - Default fallback for all other pages
 *
 * The logo PNG is composited as-is from static/img/logo/. Only the background
 * gradient and tagline text are generated; the logo is never re-rendered.
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
const LOGO_SRC = path.join(
  ROOT,
  "static/img/logo/perts-foundry-horizontal-light@2x.png",
);

// Brand-matched dark gradient with a blue glow accent
function backgroundSvg() {
  return Buffer.from(`<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f1729"/>
      <stop offset="50%" stop-color="#1a2548"/>
      <stop offset="100%" stop-color="#131b36"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="45%">
      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#3B82F6" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
</svg>`);
}

// Render text lines as an SVG overlay
function textOverlay(lines) {
  const elements = lines
    .map(
      (l) =>
        `<text x="${l.x || WIDTH / 2}" y="${l.y}" text-anchor="middle"
      font-family="Trebuchet MS, Liberation Sans, DejaVu Sans, sans-serif"
      font-weight="${l.weight || 400}" font-size="${l.size}"
      fill="${l.color}" letter-spacing="${l.spacing || 0}">${l.text}</text>`,
    )
    .join("\n  ");

  return Buffer.from(
    `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">\n  ${elements}\n</svg>`,
  );
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

async function generateHomepage() {
  const logo = await loadLogo(600);

  // Center the content block (logo + taglines) vertically, offset up for URL
  const contentHeight = logo.height + 60 + 56 + 20 + 28; // logo + gap + tagline + gap + sub
  const contentTop = Math.round((HEIGHT - contentHeight) / 2) - 20;
  const logoTop = contentTop;
  const logoLeft = Math.round((WIDTH - logo.width) / 2);
  const belowLogo = logoTop + logo.height;

  // Keep in sync with content/_index.md hero.headline / hero.subheadline
  const text = textOverlay([
    {
      y: belowLogo + 65,
      size: 56,
      weight: 800,
      color: "#FFFFFF",
      spacing: 4,
      text: "Build. Scale. Own.",
    },
    {
      y: belowLogo + 110,
      size: 28,
      weight: 500,
      color: "#60A5FA",
      spacing: 2,
      text: "Your team, extended.",
    },
    {
      y: 605,
      size: 18,
      weight: 400,
      color: "#64748B",
      spacing: 3,
      text: "pertsfoundry.com",
    },
  ]);

  await sharp(backgroundSvg())
    .composite([
      { input: logo.buffer, top: logoTop, left: logoLeft },
      { input: text, top: 0, left: 0 },
    ])
    .png()
    .toFile(path.join(ROOT, "static/img/og-homepage.png"));

  console.log("  static/img/og-homepage.png");
}

async function generateDefault() {
  const logo = await loadLogo(540);

  // Center logo + subtitle as a block
  const contentHeight = logo.height + 50 + 36;
  const contentTop = Math.round((HEIGHT - contentHeight) / 2) - 15;
  const logoTop = contentTop;
  const logoLeft = Math.round((WIDTH - logo.width) / 2);
  const belowLogo = logoTop + logo.height;

  const text = textOverlay([
    {
      y: belowLogo + 55,
      size: 36,
      weight: 600,
      color: "#FFFFFF",
      spacing: 5,
      text: "DevOps Consulting",
    },
    {
      y: 605,
      size: 18,
      weight: 400,
      color: "#64748B",
      spacing: 3,
      text: "pertsfoundry.com",
    },
  ]);

  await sharp(backgroundSvg())
    .composite([
      { input: logo.buffer, top: logoTop, left: logoLeft },
      { input: text, top: 0, left: 0 },
    ])
    .png()
    .toFile(path.join(ROOT, "assets/img/og-default.png"));

  console.log("  assets/img/og-default.png");
}

async function main() {
  console.log("Generating OG images (1200x630)...");
  await generateHomepage();
  await generateDefault();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
