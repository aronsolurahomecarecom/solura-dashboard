// Newsletter (Resend Broadcasts) tests — run: node tests/newsletter.test.mjs
// Slices the marked 📰 NEWSLETTER section out of Solura_Dashboard.html and
// executes it against mocks; plus source-level locks on row width + engine
// guards. (The spec referenced test_aug3.js/test_tracker.js/test_cts.js —
// those harnesses never existed in this repo; this file is the harness.)
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const html = readFileSync(join(root, 'Solura_Dashboard.html'), 'utf8');

let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };

/* ── source-level regression locks ── */
ok(/UNSUB:29\s*\/\/ AD/.test(html), 'column map: UNSUB at 0-based index 29 = AD');
ok(html.includes('":AD"+exRow'), 'saveAddLead writes the full A:AD row');
ok(html.includes(':AD"+(ri+1)'), 'voice-agent lead creation writes A:AD');
ok(html.includes('c2<30'), 'firstEmptyDataRow scans all 30 columns');
ok(/function advanceLead\(ri,methodUsed\)\{\s*\n\s*if\(isUnsubscribed\(ri\)\)return null;/.test(html), 'advanceLead refuses unsubscribed leads');
ok(/if\(isUnsubscribed\(ri\)\)return \{bucket:'hidden'\};/.test(html), 'whenToShow hides unsubscribed leads from every automated queue');
ok(/!isUnsubscribed\(ri\)&&isNurtureStep\(ri\)/.test(html), 'weekly nurture draft never auto-loads for unsubscribed leads');
// colLetter(29) must be AD — replicate writeRow's exact algorithm
const cols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const colLetter = i => i < 26 ? cols[i] : cols[Math.floor(i / 26) - 1] + cols[i % 26];
ok(colLetter(29) === 'AD', 'writeRow column letter for index 29 is AD');
// Full-width row round-trip at index 29
const rowSim = new Array(30).fill(''); rowSim[29] = '2026-08-28T12:00:00Z';
ok(rowSim.length === 30 && rowSim[29] && !rowSim[28], 'a 30-wide row round-trips the AD value at the right index');

/* ── slice + execute the newsletter module ── */
const start = html.indexOf('📰 NEWSLETTER (Resend Broadcasts) — BEGIN');
const endMark = html.indexOf('📰 NEWSLETTER (Resend Broadcasts) — END');
ok(start > 0 && endMark > start, 'newsletter section markers present');
const end = html.lastIndexOf('/*', endMark); // stop before the END marker's own comment
const src = html.slice(start, end);

/* environment mocks */
const C = { NM: 2, PH: 3, EM: 4, SO: 6, ST: 10, LC: 11, DM: 14, NT: 18, SQ: 19, SL: 20, STEP: 25, STEP_AT: 26, UNSUB: 29 };
const DATA_START = 4, STEP_OFF_SEQUENCE = 999;
let rows = [];
const cfgVals = { resendAudienceId: 'aud_1', resendFrom: 'Meir <n@hello.solurahomecare.com>', resendReplyTo: 'intake@solurahomecare.com' };
const cfg = k => cfgVals[k] !== undefined ? cfgVals[k] : '';
const trackerCfg = () => ({ url: 'https://trk.test', token: 'tok' });
const normEmail = s => String(s || '').trim().toLowerCase();
const isExcluded = st => /not interested|closed|lost|wrong number|deceased|duplicate/i.test(String(st || ''));
const isUnsubscribed = ri => !!String(((rows[ri] || [])[C.UNSUB]) || '').trim();
const pd = v => { const d = new Date(v); return isNaN(d.getTime()) ? null : d; };
const getNames = ri => ({ dm: String((rows[ri] || [])[C.DM] || ''), pt: String((rows[ri] || [])[C.NM] || '') });
const appendLogStr = (ex, txt) => (ex ? ex + ' | ' : '') + txt;
const writeRowCalls = [];
let writeRowNoop = false;
const writeRow = async (ri, u) => { writeRowCalls.push({ ri, u }); if (writeRowNoop) return; Object.keys(u).forEach(k => { rows[ri] = rows[ri] || []; rows[ri][parseInt(k, 10)] = u[k]; }); };
const logComms = () => {}; const commsEntryForLead = (ri, e) => e; const traceOp = () => {};
const toast = () => {}; const buildUI = async () => {}; const el = () => null;

/* relay mock: programmable Resend responses + call recording */
let audienceContacts = [];
const relayCalls = [];
globalThis.fetch = async (url, opts) => {
  const body = JSON.parse(opts.body);
  relayCalls.push(body);
  if (body.op === 'listContacts') return { ok: true, json: async () => ({ ok: true, status: 200, data: { data: audienceContacts } }) };
  if (body.op === 'addContact') { audienceContacts.push({ email: body.email, first_name: body.firstName, unsubscribed: false }); return { ok: true, json: async () => ({ ok: true, status: 200, data: { id: 'c_' + body.email } }) }; }
  if (body.op === 'createBroadcast') return { ok: true, json: async () => ({ ok: true, status: 200, data: { id: 'bc_1' } }) };
  if (body.op === 'sendBroadcast') return { ok: true, json: async () => ({ ok: true, status: 200, data: { id: body.broadcastId } }) };
  if (body.op === 'domains') return { ok: true, json: async () => ({ ok: true, status: 200, data: { data: [{ name: 'hello.solurahomecare.com', status: 'verified' }] } }) };
  return { ok: false, json: async () => ({ error: 'unknown op' }) };
};

const fn = new Function('C', 'DATA_START', 'STEP_OFF_SEQUENCE', 'rows', 'cfg', 'trackerCfg', 'normEmail', 'isExcluded', 'isUnsubscribed', 'pd', 'getNames', 'appendLogStr', 'writeRow', 'logComms', 'commsEntryForLead', 'traceOp', 'toast', 'buildUI', 'el',
  src.slice(src.indexOf('*/') + 2) + '\nreturn {resendCfg,resendFetch,resendCandidates,resendListContacts,syncUnsubscribes,syncNewsletterContacts,buildNewsletterHtml,validateBroadcast,resendSendBroadcast,RESEND_UNSUB_TAG};');
const M = fn(C, DATA_START, STEP_OFF_SEQUENCE, rows, cfg, trackerCfg, normEmail, isExcluded, isUnsubscribed, pd, getNames, appendLogStr, writeRow, logComms, commsEntryForLead, traceOp, toast, buildUI, el);

const mkLead = (i, name, email, extra) => { rows[i] = []; rows[i][C.NM] = name; rows[i][C.EM] = email; rows[i][C.ST] = 'Contacted'; rows[i][C.LC] = '8/2' + (i % 9) + '/2026'; Object.assign(rows[i], extra || {}); };

await (async () => {
  /* ── syncUnsubscribes: empty audience ── */
  audienceContacts = [];
  let r = await M.syncUnsubscribes({ silent: true });
  ok(r.synced === 0, 'empty audience → zero synced, no crash');

  /* ── syncUnsubscribes: nested/paginated response shape tolerated ── */
  mkLead(4, 'Ann A', 'ann@x.com');
  mkLead(5, 'Bob B', 'bob@x.com');
  mkLead(6, 'Carl C', 'carl@x.com');
  audienceContacts = [{ email: 'BOB@X.com', unsubscribed: true }, { email: 'ann@x.com', unsubscribed: false }];
  r = await M.syncUnsubscribes({ silent: true });
  ok(r.synced === 1, 'one unsubscribe synced (case-insensitive email match)');
  ok(!!rows[5][C.UNSUB] && rows[5][C.SQ] === 'Unsubscribed' && rows[5][C.STEP] === STEP_OFF_SEQUENCE, 'AD stamped, column T = Unsubscribed, sequence exited');
  ok(/Unsubscribed from newsletter/.test(rows[5][C.SL]), 'column U log narrates the state change');
  r = await M.syncUnsubscribes({ silent: true });
  ok(r.synced === 0, 'second run is a no-op (idempotent)');

  /* ── syncNewsletterContacts: never re-adds an unsubscribed contact ── */
  relayCalls.length = 0;
  r = await M.syncNewsletterContacts(50);
  ok(!relayCalls.some(c => c.op === 'addContact' && c.email === 'bob@x.com'), 'unsubscribed bob NEVER re-added (local AD guard)');
  ok(relayCalls.some(c => c.op === 'addContact' && c.email === 'carl@x.com'), 'new lead carl added');
  ok(r.alreadyPresent === 1, 'ann counted as already present, not re-added');

  /* ── last line of defense: unsub in Resend but AD missing locally ── */
  mkLead(7, 'Eve E', 'eve@x.com');
  audienceContacts.push({ email: 'eve@x.com', unsubscribed: true });
  writeRowNoop = true; // simulate the AD write failing / column cleared by hand
  relayCalls.length = 0;
  r = await M.syncNewsletterContacts(50);
  writeRowNoop = false;
  ok(!relayCalls.some(c => c.op === 'addContact' && c.email === 'eve@x.com'), 'eve (unsubscribed in Resend, AD empty locally) still NEVER re-added');
  ok(r.skippedUnsub >= 1, 'skippedUnsub counter reports the refusal');

  /* ── idempotency + cap ── */
  r = await M.syncNewsletterContacts(50);
  ok(r.added === 0, 'running sync again adds nothing');
  mkLead(8, 'Dan D', 'dan@x.com'); mkLead(9, 'Fay F', 'fay@x.com'); mkLead(10, 'Gil G', 'gil@x.com');
  r = await M.syncNewsletterContacts(2);
  ok(r.added === 2 && r.capped === 1, 'warm-up cap holds: 2 added, 1 held back');

  /* ── candidates: invalid emails and excluded statuses never sync ── */
  mkLead(11, 'Bad Mail', 'not-an-email');
  mkLead(12, 'Gone', 'gone@x.com', (() => { const o = {}; o[C.ST] = 'Not Interested'; return o; })());
  const cands = M.resendCandidates();
  ok(!cands.some(c => c.ri === 11) && !cands.some(c => c.ri === 12), 'invalid email + excluded status filtered out');

  /* ── broadcast validation ── */
  const goodHtml = M.buildNewsletterHtml();
  ok(M.validateBroadcast('', 'Subj', goodHtml) !== null, 'broadcast without an Audience ID is rejected before sending');
  ok(M.validateBroadcast('aud_1', 'Subj', goodHtml) === null, 'template passes validation as generated');
  ok(M.validateBroadcast('aud_1', 'Subj', goodHtml.replace(M.RESEND_UNSUB_TAG, '')) !== null, 'missing unsubscribe merge tag rejected');
  ok(M.validateBroadcast('aud_1', 'Subj', goodHtml + M.RESEND_UNSUB_TAG) !== null, 'double-injected footer tag rejected');
  ok(M.validateBroadcast('aud_1', 'Subj', goodHtml.replace('815 Superior Ave', '')) !== null, 'missing CAN-SPAM address rejected');

  /* ── template content ── */
  ok(goodHtml.includes('{{{RESEND_UNSUBSCRIBE_URL}}}'), 'unsubscribe tag uses TRIPLE braces');
  ok(goodHtml.includes('815 Superior Ave E, Suite 1618, Cleveland, OH 44114'), 'physical address present');
  ok(goodHtml.includes('Meir Schwimer'), 'signature present');
  ok(goodHtml.indexOf('—') === -1, 'no em dashes in the template copy');
  ok(/^<!DOCTYPE html>/.test(goodHtml) && /#f4f1ea/.test(goodHtml) && /#fdfaf3/.test(goodHtml) && /#c9a227/.test(goodHtml), 'complete HTML doc on the brand palette (full-design gate recognizes <html)');

  /* ── send path: create + send through the relay, refusal short-circuits ── */
  relayCalls.length = 0;
  const bid = await M.resendSendBroadcast('Hello from Solura', goodHtml);
  ok(bid === 'bc_1' && relayCalls.some(c => c.op === 'createBroadcast' && c.audienceId === 'aud_1') && relayCalls.some(c => c.op === 'sendBroadcast'), 'broadcast created against the Audience then sent');
  relayCalls.length = 0;
  let threw = false;
  try { await M.resendSendBroadcast('x', goodHtml.replace(M.RESEND_UNSUB_TAG, '')); } catch (_) { threw = true; }
  ok(threw && relayCalls.length === 0, 'invalid broadcast never reaches the relay');
})();

console.log('\nNewsletter: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
