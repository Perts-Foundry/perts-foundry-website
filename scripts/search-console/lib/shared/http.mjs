// http.mjs -- anonymous fetch helper used by the search-console skill's sitemap and redirect probes.
//
// WHY node fetch, not curl: Cloudflare's bot-management fingerprinting can flag curl's TLS/HTTP
// fingerprint; node's fetch (undici) is not flagged. Vendored from scripts/seo-review/lib/http.mjs
// (sapphire-shadow-studio-theme), trimmed to fetchPage and BROWSER_HEADERS: the search-console skill
// only ever fetches public pages anonymously (the live sitemap, a redirect probe), never behind a
// password gate, so the cookie-jar authentication helpers are dropped.

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
export const BROWSER_HEADERS = {
  'user-agent': UA,
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'upgrade-insecure-requests': '1',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch a URL following redirects, with timeout and 429 backoff.
 * @returns {Promise<{status:number|null, url:string, body:string, serverTiming:string|null, headers:Headers|null}>}
 */
export async function fetchPage(url, {
  timeoutMs = 30000, backoff = [8000, 20000],
  fetchImpl = globalThis.fetch, sleepImpl = sleep,
} = {}) {
  let attempt = 0;
  while (true) {
    const headers = { ...BROWSER_HEADERS };
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    let res;
    try {
      res = await fetchImpl(url, { headers, redirect: 'follow', signal: ctl.signal });
    } catch {
      clearTimeout(timer);
      return { status: null, url, body: '', serverTiming: null, headers: null };
    } finally {
      clearTimeout(timer);
    }
    if (res.status === 429 && attempt < backoff.length) {
      await sleepImpl(backoff[attempt]);
      attempt += 1;
      continue;
    }
    let body = '';
    try { body = await res.text(); } catch { /* keep headers-only result */ }
    return {
      status: res.status,
      url: res.url || url,
      body,
      serverTiming: res.headers.get('server-timing'),
      headers: res.headers,
    };
  }
}
