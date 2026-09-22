// extract.mjs -- sitemap XML extractors used by the search-console skill. No I/O.
//
// Vendored from scripts/seo-review/lib/extract.mjs (sapphire-shadow-studio-theme), trimmed to the
// two sitemap parsers the search-console skill imports.

/**
 * All <loc> URLs from a sitemap (index or child). Tolerant of malformed
 * entries; skips them.
 * @returns {string[]} absolute URLs as printed in the sitemap
 */
export function parseSitemapLocs(xml) {
  if (!xml) return [];
  const out = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) out.push(m[1]);
  return out;
}

/** Child sitemap URLs from a sitemap index (any type, not just products). */
export function parseSitemapChildren(xml) {
  return parseSitemapLocs(xml).filter((u) => /\/sitemap_[a-z]+_\d+\.xml/.test(u));
}
