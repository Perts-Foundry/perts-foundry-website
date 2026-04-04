#!/usr/bin/env node

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
 */

const sharp = require("sharp");
const path = require("path");

const WIDTH = 1200;
const HEIGHT = 630;
const ROOT = path.join(__dirname, "..");
const LOGO_SRC = path.join(
  ROOT,
  "static/img/logo/perts-foundry-horizontal-light@2x.png",
);

// Brand-matched dark gradient with a subtle blue glow
function backgroundSvg() {
  return Buffer.from(`<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c1222"/>
      <stop offset="50%" stop-color="#1a1545"/>
      <stop offset="100%" stop-color="#0c1222"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.08"/>
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
  const resized = await sharp(LOGO_SRC)
    .resize({ width: targetWidth })
    .toBuffer();
  const { width, height } = await sharp(resized).metadata();
  return { buffer: resized, width, height };
}

async function generateHomepage() {
  const logo = await loadLogo(480);

  // Center logo horizontally, place in upper third
  const logoTop = 140;
  const logoLeft = Math.round((WIDTH - logo.width) / 2);
  const belowLogo = logoTop + logo.height;

  const text = textOverlay([
    {
      y: belowLogo + 80,
      size: 48,
      weight: 800,
      color: "#FFFFFF",
      spacing: 3,
      text: "Build. Scale. Own.",
    },
    {
      y: belowLogo + 125,
      size: 24,
      weight: 400,
      color: "#94A3B8",
      spacing: 1,
      text: "Your team, extended.",
    },
    {
      y: 598,
      size: 16,
      weight: 400,
      color: "#475569",
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
  const logo = await loadLogo(420);

  const logoTop = 170;
  const logoLeft = Math.round((WIDTH - logo.width) / 2);
  const belowLogo = logoTop + logo.height;

  const text = textOverlay([
    {
      y: belowLogo + 70,
      size: 28,
      weight: 600,
      color: "#94A3B8",
      spacing: 4,
      text: "DevOps Consulting",
    },
    {
      y: 598,
      size: 16,
      weight: 400,
      color: "#475569",
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
  console.error("Error:", err.message);
  process.exit(1);
});
