import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { finishRun, acceptedRiskProblems } from '../lib/report.mjs';
import { evaluateCapture } from '../lib/checks.mjs';
import { loadLatest, saveRun } from '../lib/baseline.mjs';
import { baseCapture, healthyOpts, readFixture, notReady, NOW, PREINDEX_NOW, ORIGIN } from './harness.mjs';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'search-console-report-'));
after(() => fs.rmSync(tmp, { recursive: true, force: true }));
let n = 0;
const freshDir = () => path.join(tmp, `state-${n++}`);

/** Run finishRun and capture both the exit code and the printed output. */
function finish(findings, capture, opts) {
  const lines = [];
  const exitCode = finishRun(findings, capture, { log: (l) => lines.push(l), now: NOW, home: tmp, ...opts });
  return { exitCode, text: lines.join('\n'), lines };
}
const jsonOf = (r) => JSON.parse(r.lines[r.lines.length - 1]);
const later = (minutes) => new Date(NOW.getTime() + minutes * 60_000);

/** Adds a second, generically-typed enhancement item to test the multi-item metrics logic. */
const withSecondItem = (mutate) => (r) => {
  r.enhancements.items.push({ type: 'Review snippets', valid: 2, invalid: 0, warning: 0 });
  mutate(r);
};

test('every valid run is saved with per-report status, even an all-not-ready one', () => {
  const dir = freshDir();
  const capture = readFixture('capture-preindex.json');
  const findings = evaluateCapture(capture, { sitemapCount: 17, now: PREINDEX_NOW });
  const r = finish(findings, capture, { dir, now: PREINDEX_NOW });
  assert.equal(r.exitCode, 0);
  const run = loadLatest(dir, 'audit');
  assert.equal(run.report_status.performance, 'not-ready');
  assert.equal(run.report_status.https, 'not-present');
  assert.equal(run.report_status.settings, 'ok');
  assert.equal(run.meta.nonce, capture.nonce);
  assert.match(r.text, /saved run -> ~\//, 'the saved path is printed with HOME collapsed');
});

test('not-ready reports are listed as not compared, with their findings', () => {
  const capture = readFixture('capture-preindex.json');
  const findings = evaluateCapture(capture, { sitemapCount: 17, now: PREINDEX_NOW });
  const out = jsonOf(finish(findings, capture, { dir: freshDir(), json: true, now: PREINDEX_NOW }));
  const reasons = Object.fromEntries(out.notCompared.map((x) => [x.report, x.reason]));
  assert.equal(reasons.performance, 'not-ready');
  assert.equal(reasons.enhancements, 'not-present');
  const https = out.notCompared.find((x) => x.report === 'https');
  assert.ok(https.findings.some((f) => f.check === 'https-no-data'));
});

test('a second run of the same capture reports every finding unchanged', () => {
  const dir = freshDir();
  const capture = readFixture('capture-problems.json');
  const findings = evaluateCapture(capture, healthyOpts());
  const first = jsonOf(finish(findings, capture, { dir, json: true }));
  assert.equal(first.added.length, findings.length);
  const second = jsonOf(finish(findings, capture, { dir, json: true, now: later(1) }));
  assert.equal(second.added.length, 0);
  assert.equal(second.resolved.length, 0);
  assert.equal(second.unchanged.length, findings.length);
});

test('a finding that goes away is resolved', () => {
  const dir = freshDir();
  const c = baseCapture();
  c.reports.cwv.mobile.poor = 3;
  finish(evaluateCapture(c, healthyOpts()), c, { dir });
  const healthy = baseCapture();
  const out = jsonOf(finish(evaluateCapture(healthy, healthyOpts()), healthy, { dir, json: true, now: later(1) }));
  assert.deepEqual(out.resolved.map((f) => f.check), ['cwv-poor']);
});

test('a report returning to not-ready does not resolve its findings', () => {
  const dir = freshDir();
  const c = baseCapture();
  c.reports.cwv.mobile.poor = 3;
  finish(evaluateCapture(c, healthyOpts()), c, { dir });
  const next = baseCapture();
  next.reports.cwv = notReady('cwv');
  const out = jsonOf(finish(evaluateCapture(next, healthyOpts()), next, { dir, json: true, now: later(1) }));
  assert.ok(!out.resolved.some((f) => f.check === 'cwv-poor'));
  assert.ok(out.notCompared.some((x) => x.report === 'cwv' && x.reason === 'not-ready'));
});

test('an insights run does not poison the next audit diff', () => {
  const dir = freshDir();
  const audit = baseCapture();
  audit.reports.links.top_linking_sites = 0;
  finish(evaluateCapture(audit, healthyOpts()), audit, { dir });

  const insights = normalisedInsights();
  finish(evaluateCapture(insights, { sitemapState: 'skipped', now: NOW }), insights, { dir, now: later(1) });

  const again = jsonOf(finish(evaluateCapture(audit, healthyOpts()), audit, { dir, json: true, now: later(2) }));
  assert.ok(again.unchanged.some((f) => f.check === 'links-none'));
  assert.deepEqual(again.added, []);
});

function normalisedInsights() {
  const c = readFixture('capture-insights.json');
  // Already-normalised equivalents of the transcription strings, so this test does not depend on
  // the normaliser.
  const p = c.reports.performance;
  p.search_type = 'Search type: Web';
  p.totals = { clicks: 3, impressions: 120, ctr: 0.025, position: 8.1 };
  p.queries.rows = [
    { query: 'perts foundry', clicks: 3, impressions: 60, ctr: 0.05, position: 1.5 },
    { query: 'kubernetes consulting', clicks: 0, impressions: 60, ctr: 0, position: 9.2 },
  ];
  p.pages.rows = [
    { url: `${ORIGIN}/`, clicks: 3, impressions: 60, ctr: 0.05, position: 1.5 },
    { url: `${ORIGIN}/blog/infrastructure-as-code/`, clicks: 0, impressions: 60, ctr: 0, position: 9.2 },
  ];
  p.countries.rows = [{ country: 'United States', clicks: 3, impressions: 110, ctr: 0.0273, position: 8 }];
  p.devices = {
    desktop: { clicks: 1, impressions: 40, ctr: 0.025, position: 7 },
    mobile: { clicks: 2, impressions: 80, ctr: 0.025, position: 8.6 },
    tablet: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
  };
  for (const [id, rep] of Object.entries(c.reports)) rep.report = id;
  return c;
}

test('metric deltas for period-matched runs', () => {
  const dir = freshDir();
  const a = baseCapture();
  finish(evaluateCapture(a, healthyOpts()), a, { dir });
  const b = baseCapture();
  b.reports.performance.totals = { clicks: 50, impressions: 2500, ctr: 0.02, position: 11 };
  b.reports['indexing-pages'].indexed = 15;
  const out = jsonOf(finish(evaluateCapture(b, healthyOpts()), b, { dir, json: true, now: later(1) }));
  assert.equal(out.metrics.delta.impressions, 500);
  assert.equal(out.metrics.delta.clicks, -10);
  assert.equal(out.metrics.delta.indexed, -2);
  assert.equal(out.metrics.delta.discovered, 0);
  assert.equal(out.metrics.previous.impressions, 2000);
});

test('a period mismatch leaves performance and its metrics uncompared', () => {
  const dir = freshDir();
  const a = baseCapture();
  a.reports.performance.pages.rows[0].position = 8; // one perf finding to carry forward
  finish(evaluateCapture(a, healthyOpts()), a, { dir });
  const b = baseCapture();
  b.reports.performance.period = '3mo';
  const findings = evaluateCapture(b, { ...healthyOpts(), previousPeriod: '28d' });
  assert.ok(findings.some((f) => f.check === 'period-mismatch'));
  const out = jsonOf(finish(findings, b, { dir, json: true, now: later(1) }));
  assert.ok(out.notCompared.some((x) => x.report === 'performance' && x.reason === 'period-mismatch'));
  assert.ok(!out.resolved.some((f) => f.check === 'perf-position-opportunity'), 'a different period is not a resolution');
  assert.equal(out.metrics.delta.impressions, null);
  assert.equal(out.metrics.delta.indexed, 0, 'other metrics still compare');
});

test('METRICS prints the keys added after the port; against an older baseline they are not compared', () => {
  const dir = freshDir();
  const capture = baseCapture();
  // The site has no video pages, so the healthy fixture's videos report is not-present; give this
  // run a real one so its current value is non-null and worth diffing against an older baseline.
  capture.reports.videos = { captured_at: capture.captured_at, report: 'videos', status: 'ok', indexed: 4, not_indexed: 1 };
  // A baseline written before the new keys existed: every report ok, only the original metrics.
  const reportStatus = Object.fromEntries(Object.keys(capture.reports).map((id) => [id, 'ok']));
  saveRun(dir, {
    mode: 'audit', now: new Date(NOW.getTime() - 60_000), reportStatus, period: '28d', findings: [],
    metrics: { clicks: 40, impressions: 2000, indexed: 16, not_indexed: 1, discovered: 17 },
  });
  const r = finish(evaluateCapture(capture, healthyOpts()), capture, { dir });
  for (const key of ['unread', 'enhancement_warning', 'enhancement_invalid', 'videos_indexed', 'videos_not_indexed']) {
    assert.match(r.text, new RegExp(`^  ${key}: \\d+ \\(not compared\\)$`, 'm'), key);
  }
  assert.match(r.text, /^ {2}impressions: 2000 \(\+0\)$/m);
});

test('enhancement_warning is a sum only when every item shows a figure; a report not ok is n/a', () => {
  const metricsOf = (mutate) => {
    const c = baseCapture();
    mutate(c.reports);
    return jsonOf(finish(evaluateCapture(c, healthyOpts()), c, { dir: freshDir(), json: true })).metrics.current;
  };
  assert.equal(metricsOf(withSecondItem((r) => { r.enhancements.items[0].warning = 2; r.enhancements.items[1].warning = 3; })).enhancement_warning, 5);
  assert.equal(metricsOf(withSecondItem((r) => { r.enhancements.items[0].warning = 2; r.enhancements.items[1].warning = null; })).enhancement_warning, null,
    'a partial sum would compare as a drop');
  assert.equal(metricsOf((r) => { r.enhancements.items[0].warning = null; }).enhancement_warning, null);
  assert.equal(metricsOf((r) => { r.enhancements.items[0].invalid = 1; }).enhancement_invalid, 1);
  const m = metricsOf((r) => { r.videos = notReady('videos'); r.messages.unread = 1; });
  assert.equal(m.videos_indexed, null);
  assert.equal(m.unread, 1);
  const c = baseCapture();
  c.reports.videos = notReady('videos');
  assert.match(finish(evaluateCapture(c, healthyOpts()), c, { dir: freshDir() }).text, /^ {2}videos_indexed: n\/a$/m);
});

test('the new metrics compare when both runs carry them; a figure going unshown is not a drop', () => {
  const dir = freshDir();
  const videosOk = (n) => ({ captured_at: NOW.toISOString(), report: 'videos', status: 'ok', indexed: 1, not_indexed: n });
  const a = baseCapture();
  a.reports.videos = videosOk(0);
  withSecondItem((r) => { r.enhancements.items[0].warning = 2; r.enhancements.items[1].warning = 3; })(a.reports);
  finish(evaluateCapture(a, healthyOpts()), a, { dir });
  const b = baseCapture();
  b.reports.messages.unread = 1;
  withSecondItem((r) => { r.enhancements.items[0].warning = 2; r.enhancements.items[1].warning = null; })(b.reports);
  b.reports.videos = videosOk(1);
  const out = jsonOf(finish(evaluateCapture(b, healthyOpts()), b, { dir, json: true, now: later(1) }));
  assert.equal(out.metrics.delta.unread, 1);
  assert.equal(out.metrics.delta.videos_not_indexed, 1);
  assert.equal(out.metrics.delta.enhancement_invalid, 0);
  assert.equal(out.metrics.current.enhancement_warning, null);
  assert.equal(out.metrics.delta.enhancement_warning, null);
});

test('a finding whose detail changed between runs is unchanged, not new', () => {
  const dir = freshDir();
  const a = baseCapture();
  a.reports.enhancements.items[0].warning = 2;
  finish(evaluateCapture(a, healthyOpts()), a, { dir });
  const b = baseCapture();
  Object.assign(b.reports.enhancements.items[0], { warning: 2, issues: [{ label: "Missing field 'name'", items: 2, level: 'warning' }] });
  const out = jsonOf(finish(evaluateCapture(b, healthyOpts()), b, { dir, json: true, now: later(1) }));
  assert.ok(!out.added.some((f) => f.check === 'enhancement-warning'));
  assert.ok(out.unchanged.some((f) => f.check === 'enhancement-warning'));
});

test('--json emits exactly the documented shape', () => {
  const capture = baseCapture();
  const out = jsonOf(finish(evaluateCapture(capture, healthyOpts()), capture, { dir: freshDir(), json: true }));
  assert.deepEqual(Object.keys(out).sort(), ['accepted', 'added', 'exitCode', 'fresh', 'metrics', 'notCompared', 'resolved', 'unchanged']);
  assert.deepEqual(Object.keys(out.metrics).sort(), ['current', 'delta', 'previous']);
});

test('exit contract: fresh ERROR 1, WARN only 0, accepted ERROR 0', () => {
  const err = baseCapture();
  err.reports['security-manual'].manual_actions = 'present';
  const errFindings = evaluateCapture(err, healthyOpts());
  assert.equal(finish(errFindings, err, { dir: freshDir() }).exitCode, 1);

  const dir = freshDir();
  finish(errFindings, err, { dir });
  assert.equal(finish(errFindings, err, { dir, now: later(1) }).exitCode, 1, 'an unchanged ERROR still blocks');

  const warn = baseCapture();
  warn.reports.cwv.mobile.poor = 2;
  assert.equal(finish(evaluateCapture(warn, healthyOpts()), warn, { dir: freshDir() }).exitCode, 0);

  const accepted = [{ check: 'manual-action', path: null, note: 'synthetic', accepted_on: '2026-12-01' }];
  const r = finish(errFindings, err, { dir: freshDir(), acceptedRisks: accepted, full: true });
  assert.equal(r.exitCode, 0);
  assert.match(r.text, /ACCEPTED RISKS/);
});

test('--no-save writes nothing', () => {
  const dir = freshDir();
  const capture = baseCapture();
  finish(evaluateCapture(capture, healthyOpts()), capture, { dir, noSave: true });
  assert.equal(fs.existsSync(dir), false);
});

test('the text report names the summary, sections and exit line', () => {
  const capture = readFixture('capture-problems.json');
  const r = finish(evaluateCapture(capture, healthyOpts()), capture, { dir: freshDir(), meta: { capture: '~/state/capture.json' } });
  assert.match(r.text, /^search-console audit \| property sc-domain:pertsfoundry.com/m);
  assert.match(r.text, /^summary: \d+ ERROR, \d+ WARN, \d+ INFO/m);
  assert.match(r.text, /^NEW:/m);
  assert.match(r.text, /^METRICS:/m);
  assert.match(r.text, /^exit 1 /m);
  assert.match(r.text, /^capture: ~\/state\/capture.json$/m);
});

test('accepted-risk subjects are checked for every subject kind', () => {
  const entry = (check, p) => [{ check, path: p, note: 'synthetic', accepted_on: '2026-12-01' }];
  const ok = [
    ['index-reason-soft-404', 'soft-404'], ['index-reason-soft-404', '/about/'], ['removal-active', 'removal-active'],
    ['removal-active', '/about/'], ['association-missing', 'merchant-center'], ['secondary-domain-redirect', 'brand-alias.example'],
    ['capture-invalid', '/nonce'], ['surface-new', 'nav:Shopping'], ['enhancement-invalid', 'Breadcrumbs'],
  ];
  const bad = [
    ['index-reason-soft-404', 'soft404'], ['removal-active', 'about'], ['association-missing', 'search-ads'],
    ['secondary-domain-redirect', 'https://brand-alias.example/'], ['capture-invalid', 'nonce'], ['surface-new', '/about'],
    ['enhancement-invalid', '/services/x'],
  ];
  for (const [check, p] of ok) assert.deepEqual(acceptedRiskProblems(entry(check, p)), [], `${check} ${p}`);
  for (const [check, p] of bad) assert.equal(acceptedRiskProblems(entry(check, p)).length, 1, `${check} ${p}`);
});

test('accepted risks are summarised in one line without --full', () => {
  const err = baseCapture();
  err.reports['security-manual'].manual_actions = 'present';
  const accepted = [{ check: 'manual-action', path: null, note: 'synthetic', accepted_on: '2026-12-01' }];
  const r = finish(evaluateCapture(err, healthyOpts()), err, { dir: freshDir(), acceptedRisks: accepted });
  assert.match(r.text, /\(1 accepted risk\(s\) suppressed; run with --full to see them\)/);
  assert.doesNotMatch(r.text, /ACCEPTED RISKS/);
});

test('a risk with a subject suppresses only that subject, end to end', () => {
  const risk = (check, p) => [{ check, path: p, note: 'synthetic', accepted_on: '2026-12-01' }];
  const cwv = baseCapture();
  cwv.reports.cwv.mobile.poor = 2;
  cwv.reports.cwv.desktop.poor = 1;
  const cwvOut = jsonOf(finish(evaluateCapture(cwv, healthyOpts()), cwv, { dir: freshDir(), json: true, acceptedRisks: risk('cwv-poor', 'mobile') }));
  assert.deepEqual(cwvOut.accepted.filter((f) => f.check === 'cwv-poor').map((f) => f.url), ['mobile']);
  assert.deepEqual(cwvOut.fresh.filter((f) => f.check === 'cwv-poor').map((f) => f.url), ['desktop']);

  const page = baseCapture();
  page.reports.removals.temporary_active = 2;
  page.reports.removals.temporary_urls = [`${ORIGIN}/about/`, `${ORIGIN}/contact/`];
  const pageOut = jsonOf(finish(evaluateCapture(page, healthyOpts()), page, { dir: freshDir(), json: true, acceptedRisks: risk('removal-active', '/about/') }));
  assert.deepEqual(pageOut.accepted.map((f) => new URL(f.url).pathname), ['/about/']);
  assert.ok(pageOut.fresh.some((f) => f.check === 'removal-active' && f.url.endsWith('/contact/')));
});
