// 🛡 Self-open kill tests (B-0902-70): no copy in Meir's mailbox may hold a
// live pixel. Slices the ⚡SELF-OPEN region and drives it with a Graph mock.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');

let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };

const b = html.indexOf('/* ⚡SELF-OPEN — BEGIN');
const e = html.indexOf('/* ⚡SELF-OPEN — END */');
if (b < 0 || e < 0) throw new Error('SELF-OPEN markers missing');
const src = html.slice(html.indexOf('*/', b) + 2, e); // the BEGIN marker and banner share one comment block

function build(gfetchMock) {
  const traces = [], toasts = [];
  const mk = new Function('gfetch', 'GR', 'traceOp', 'toast', 'escapeHtml', 'setTimeout',
    src + '\nreturn {stripTrackingFromHtml,saveCleanSentCopy,scrubSentCopy};');
  const api = mk(gfetchMock, 'https://graph.microsoft.com/v1.0',
    t => traces.push(t), t => toasts.push(t),
    s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
    (fn) => fn()); // instant timers — the scrub's 4s…60s waits collapse
  return { api, traces, toasts };
}

const PX = '<img src="https://falling-rain.workers.dev/px?d=eyJyIjo1fQ%3D%3D" width="1" height="1" style="width:1px;height:1px;border:0;opacity:0" alt="">';
const DOC = 'https://falling-rain.workers.dev/doc?u=https%3A%2F%2F1drv.ms%2Fx%2Fabc&d=eyJpIjoibTEifQ';

// ── stripTrackingFromHtml ──
{
  const { api } = build(async () => ({ ok: true, json: async () => ({}) }));
  const body = '<html><body><p>Hi {dm}</p><a href="' + DOC + '">Weekly update</a>' + PX + '</body></html>';
  const clean = api.stripTrackingFromHtml(body);
  ok(clean.indexOf('/px?d=') === -1, 'pixel img removed');
  ok(clean.indexOf('/doc?u=') === -1, 'doc redirect removed');
  ok(clean.indexOf('https://1drv.ms/x/abc') > -1, 'doc link restored to its original target');
  ok(clean.indexOf('<p>Hi {dm}</p>') > -1, 'content untouched');
  const amp = api.stripTrackingFromHtml('<a href="' + DOC.replace('&d=', '&amp;d=') + '">x</a>');
  ok(amp.indexOf('https://1drv.ms/x/abc') > -1 && amp.indexOf('/doc?u=') === -1, 'survives &amp;-encoded hrefs (Exchange rewriting)');
  ok(api.stripTrackingFromHtml('<p>plain</p>') === '<p>plain</p>', 'untracked body passes through unchanged');
}

// ── saveCleanSentCopy ──
{
  const calls = [];
  const { api, toasts } = build(async (url, opts) => {
    calls.push({ url, body: opts && opts.body ? JSON.parse(opts.body) : null });
    return { ok: true, status: 201, json: async () => ({}) };
  });
  await api.saveCleanSentCopy('Subj', 'lead@x.com', '<p>hey</p>' + PX, [{ name: 'a.pdf' }], ['Big.pdf']);
  ok(calls.length === 1 && calls[0].url.indexOf('/me/mailFolders/sentitems/messages') > -1, 'clean copy POSTs into Sent Items');
  const m = calls[0].body;
  ok(m.body.content.indexOf('/px?d=') === -1, 'clean copy holds NO pixel');
  ok(m.singleValueExtendedProperties[0].id === 'Integer 0x0E07' && m.singleValueExtendedProperties[0].value === '1', 'PR_MESSAGE_FLAGS=1 — files as sent, not draft');
  ok(m.attachments.length === 1, 'small attachments ride the copy');
  ok(m.body.content.indexOf('Big.pdf') > -1, 'large files listed in the footer note');
  ok(toasts.length === 0, 'no warning on success');
}
{
  const { api, toasts, traces } = build(async () => ({ ok: false, status: 403, json: async () => ({ error: { message: 'nope' } }) }));
  const r = await api.saveCleanSentCopy('S', 'x@y.com', '<p>x</p>', [], []);
  ok(r === false && toasts.some(t => t.indexOf('email itself sent fine') > -1), 'copy failure is loud but non-fatal');
  ok(traces.some(t => t.kind === 'clean-sent-copy-FAIL'), 'failure traced');
}

// ── scrubSentCopy: finds the tracked copy, replaces it, retires it ──
{
  const calls = [];
  const pxFrag = '/px?d=eyJyIjo1fQ%3D%3D';
  const { api, traces } = build(async (url, opts) => {
    calls.push({ url, method: (opts && opts.method) || 'GET', body: opts && opts.body ? JSON.parse(opts.body) : null });
    if (url.indexOf('$orderby') > -1) return { ok: true, json: async () => ({ value: [
      { id: 'other', subject: 'Different' }, { id: 'target', subject: 'Subj' }] }) };
    if (url.indexOf("/me/messages/target?") > -1) return { ok: true, json: async () => ({ body: { content: '<p>x</p><img src="https://w/px?d=eyJyIjo1fQ%3D%3D">' } }) };
    if ((opts || {}).method === 'DELETE') return { ok: true, status: 204, json: async () => ({}) };
    return { ok: true, status: 201, json: async () => ({}) };
  });
  await api.scrubSentCopy(pxFrag, 'Subj', 'lead@x.com', '<p>x</p>' + PX, [], []);
  ok(!calls.some(c => c.url.indexOf('/me/messages/other?') > -1), 'only subject-matched candidates get their body fetched');
  const posted = calls.find(c => c.url.indexOf('sentitems/messages') > -1 && c.method === 'POST');
  const del = calls.find(c => c.method === 'DELETE');
  ok(!!posted && posted.body.body.content.indexOf('/px?d=') === -1, 'replacement copy is pixel-free');
  ok(!!del && del.url.indexOf('/me/messages/target') > -1, 'tracked original moved to Deleted Items');
  ok(calls.indexOf(posted) < calls.indexOf(del), 'clean copy lands BEFORE the original is retired (record never lost)');
  ok(traces.some(t => t.kind === 'sent-scrub' && t.removed === true), 'scrub traced');
}
{
  const { api, traces } = build(async (url) => ({ ok: true, json: async () => ({ value: [] }) }));
  await api.scrubSentCopy('/px?d=zzz', 'S', 'x@y.com', '<p>x</p>', [], []);
  ok(traces.some(t => t.kind === 'sent-scrub-miss'), 'never-found copy gives up quietly after retries');
  const { api: api2 } = build(async () => { throw new Error('net down'); });
  await api2.scrubSentCopy('/px?d=zzz', 'S', 'x@y.com', '<p>x</p>', [], []); // must not throw
  ok(true, 'network failures inside the scrub never escape');
}

// ── source-level locks on the send paths ──
{
  ok(/var _trkPx=_emailReplyTo\?'':trackingPixelHtml/.test(html), 'replies get NO pixel');
  ok(/var _tracked=!!_trkPx\|\|bodyHtml\.indexOf\('\/doc\?u='\)>-1;/.test(html), 'fast path detects tracked sends');
  ok(/saveToSentItems:!_tracked/.test(html), 'fast path: tracked sends do NOT auto-save the pixel copy');
  ok(/if\(_tracked\)saveCleanSentCopy\(subj,toAddr,bodyHtml,message\.attachments\)/.test(html), 'fast path files the pixel-free copy');
  ok(/if\(!_emailReplyTo&&_trkPx\)\{\s*\n\s*var _pxFrag/.test(html), 'draft path scrubs its auto-saved copy');
  ok(html.indexOf("saveToSentItems:true})") === -1 || !/sendMail',\{method:'POST',body:JSON\.stringify\(\{message:message,saveToSentItems:true\}\)/.test(html), 'no tracked send path still hard-codes saveToSentItems:true');
}

console.log('\nSelf-open kill: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
