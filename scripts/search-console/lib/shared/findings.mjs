// findings.mjs -- shared finding-list helpers reused by the search-console skill.
//
// Vendored from scripts/seo-review/lib/checks.mjs (sapphire-shadow-studio-theme), trimmed to the
// generic finding-list helpers the search-console skill imports: severities, the per-page key
// function, the accepted-risks matcher, the baseline differ and the exit-code policy. Everything
// crawl-specific (page evaluation, breadcrumb allow-lists, title/description bounds) stays out; this
// module imports nothing, so it holds no dependency on the seo-review-only bounds constants.
//
// A finding is { check, severity, url, detail }. `check` is a stable id: the baseline differ and
// accepted-risks matching key on it (plus the URL path), so renaming a check id orphans its
// accepted-risk entries and its baseline history. Add new ids freely; rename existing ones only with
// a matching edit to accepted-risks.json.

export const ERROR = 'ERROR';
export const WARN = 'WARN';
export const INFO = 'INFO';

/**
 * Stable per-page key: the path (query stripped) for http(s) URLs, the string
 * itself for a non-URL subject (a report id, a label, a check id).
 */
export function pathOf(url) {
  try {
    const u = new URL(url);
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.pathname;
  } catch { /* fall through */ }
  return String(url);
}

/**
 * Split findings into { fresh, accepted } against accepted-risks entries.
 * An entry matches on check id, and on URL path when the entry names one.
 * @param {Array} findings
 * @param {Array<{check:string, path?:string, note:string, accepted_on:string}>} accepted
 */
export function partitionAccepted(findings, accepted) {
  const fresh = [];
  const acceptedOut = [];
  for (const finding of findings) {
    const hit = (accepted || []).find((a) =>
      a.check === finding.check && (!a.path || a.path === pathOf(finding.url)));
    if (hit) acceptedOut.push({ ...finding, note: hit.note, accepted_on: hit.accepted_on });
    else fresh.push(finding);
  }
  return { fresh, accepted: acceptedOut };
}

/** Stable identity key for baseline diffing. */
export function findingKey(f) {
  return `${f.check}|${pathOf(f.url)}`;
}

/**
 * Diff two finding lists by identity key.
 * @returns {{added: Array, resolved: Array, unchanged: Array}}
 */
export function diffFindings(previous, current) {
  const prevKeys = new Set((previous || []).map(findingKey));
  const curKeys = new Set(current.map(findingKey));
  return {
    added: current.filter((f) => !prevKeys.has(findingKey(f))),
    resolved: (previous || []).filter((f) => !curKeys.has(findingKey(f))),
    unchanged: current.filter((f) => prevKeys.has(findingKey(f))),
  };
}

/** Exit code policy: block only on fresh ERROR findings. */
export function exitCodeFor(freshFindings) {
  return freshFindings.some((f) => f.severity === ERROR) ? 1 : 0;
}
