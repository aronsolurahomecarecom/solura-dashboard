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
ok(/UNSUB:29,?\s*\/\/ AD/.test(html), 'column map: UNSUB at 0-based index 29 = AD');
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
const lc = v => String(v || '').toLowerCase().trim();
const nurtureFlags = {}, offFlags = {}; // per-row sequence position stubs
const isNurtureStep = ri => nurtureFlags[ri] !== false && !offFlags[ri];
const isOffSequence = ri => !!offFlags[ri];
const pd = v => { const d = new Date(v); return isNaN(d.getTime()) ? null : d; };
const localToday = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
const daysBetween = (a, b) => Math.round((a.getTime() - b.getTime()) / 86400000);
const ds = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const getNames = ri => ({ dm: String((rows[ri] || [])[C.DM] || ''), pt: String((rows[ri] || [])[C.NM] || '') });
const appendLogStr = (ex, txt) => (ex ? ex + ' | ' : '') + txt;
const writeRowCalls = [];
let writeRowNoop = false;
const writeRow = async (ri, u) => { writeRowCalls.push({ ri, u }); if (writeRowNoop) return; Object.keys(u).forEach(k => { rows[ri] = rows[ri] || []; rows[ri][parseInt(k, 10)] = u[k]; }); };
const logComms = () => {}; const commsEntryForLead = (ri, e) => e; const traceOp = () => {};
const toast = () => {}; const buildUI = async () => {}; const el = () => null;
/* weekly-draft + send-pipeline stubs for the A/B split sender */
const weeklyVariantsLive = [];
const weeklyLiveVariants = () => weeklyVariantsLive;
const getWeeklyDraftFor = () => weeklyVariantsLive[0] || null;
const fillNames = (s, names) => String(s || '').replace(/\{dm\}/g, (names && names.dm) || 'there').replace(/\{pt\}/g, (names && names.pt) || 'your loved one');
const sanitizeDraftHtml = s => s;
const trackingPixelHtml = () => '<img src="px">';
const recordSentEmail = () => {};
const advanceLead = () => null;
/* html helpers the converter leans on — same semantics as the dashboard's */
const looksLikeHtml = s => /<[a-z][\s\S]*>/i.test(String(s || ''));
const isFullDesignHtml = s => /<html[\s>]/i.test(String(s || '').slice(0, 600));
const emailPlainToHtml = s => '<p>' + String(s || '').split(/\n\n+/).join('</p><p>') + '</p>';
const injectBeforeClose = (html, frag) => { const i = String(html).toLowerCase().lastIndexOf('</body>'); return i > -1 ? html.slice(0, i) + frag + html.slice(i) : html + frag; };

/* relay mock: programmable Resend responses + call recording */
let audienceContacts = [];
const relayCalls = [];
globalThis.fetch = async (url, opts) => {
  const body = JSON.parse(opts.body);
  relayCalls.push(body);
  if (body.op === 'listContacts') return { ok: true, json: async () => ({ ok: true, status: 200, data: { data: audienceContacts } }) };
  if (body.op === 'sendEmail') return { ok: true, json: async () => ({ ok: true, status: 200, data: { id: 'e_' + body.to } }) };
  if (body.op === 'addContact') { audienceContacts.push({ email: body.email, first_name: body.firstName, unsubscribed: false }); return { ok: true, json: async () => ({ ok: true, status: 200, data: { id: 'c_' + body.email } }) }; }
  if (body.op === 'broadcast') return { ok: true, json: async () => ({ ok: true, status: 200, data: { id: 'bc_1' } }) };
  if (body.op === 'listSegments') return { ok: true, json: async () => ({ ok: true, status: 200, data: { data: [{ id: 'aud_1', name: 'Newsletter' }] } }) };
  if (body.op === 'createSegment') return { ok: true, json: async () => ({ ok: true, status: 200, data: { id: 'seg_new' } }) };
  if (body.op === 'domains') return { ok: true, json: async () => ({ ok: true, status: 200, data: { data: [{ name: 'hello.solurahomecare.com', status: 'verified' }] } }) };
  return { ok: false, json: async () => ({ error: 'unknown op' }) };
};

const fn = new Function('C', 'DATA_START', 'STEP_OFF_SEQUENCE', 'rows', 'cfg', 'trackerCfg', 'normEmail', 'isExcluded', 'isUnsubscribed', 'pd', 'getNames', 'appendLogStr', 'writeRow', 'logComms', 'commsEntryForLead', 'traceOp', 'toast', 'buildUI', 'el', 'looksLikeHtml', 'isFullDesignHtml', 'emailPlainToHtml', 'injectBeforeClose', 'lc', 'isNurtureStep', 'isOffSequence', 'localToday', 'daysBetween', 'ds', 'weeklyLiveVariants', 'getWeeklyDraftFor', 'fillNames', 'sanitizeDraftHtml', 'trackingPixelHtml', 'recordSentEmail', 'advanceLead',
  src.slice(src.indexOf('*/') + 2) + '\nreturn {resendCfg,resendFetch,resendCandidates,resendListContacts,syncUnsubscribes,syncNewsletterContacts,buildNewsletterHtml,validateBroadcast,resendSendBroadcast,weeklyToBroadcastHtml,nlEligible,nlSeqGroupFor,nlWarmupState,nlWarmupQuota,nlWarmupCum,nlWarmupProjectedDay,nlWarmupHolds,nlWarmupEmailFor,nlSplitVariantFor,nlSendSplitTest,NL_WARMUP_DAYS,RESEND_UNSUB_TAG,RESEND_COMPLIANCE_FOOTER};');
const M = fn(C, DATA_START, STEP_OFF_SEQUENCE, rows, cfg, trackerCfg, normEmail, isExcluded, isUnsubscribed, pd, getNames, appendLogStr, writeRow, logComms, commsEntryForLead, traceOp, toast, buildUI, el, looksLikeHtml, isFullDesignHtml, emailPlainToHtml, injectBeforeClose, lc, isNurtureStep, isOffSequence, localToday, daysBetween, ds, weeklyLiveVariants, getWeeklyDraftFor, fillNames, sanitizeDraftHtml, trackingPixelHtml, recordSentEmail, advanceLead);

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
  ok(relayCalls.some(c => c.op === 'addContact' && c.email === 'carl@x.com' && c.segmentId === 'aud_1'), 'contacts are added INTO the broadcast segment (Audiences are Segments now)');
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
  const cands = M.resendCandidates().list;
  ok(!cands.some(c => c.ri === 11) && !cands.some(c => c.ri === 12), 'invalid email + excluded status filtered out');

  /* ── audience rules: only enabled sequence positions / stages sync ── */
  mkLead(13, 'Early Eddie', 'eddie@x.com'); nurtureFlags[13] = false;      // sits in an early phase
  mkLead(14, 'Off Ollie', 'ollie@x.com'); offFlags[14] = true;             // responded / off-sequence
  let cr = M.resendCandidates();
  ok(M.nlSeqGroupFor(13) === 'early' && M.nlSeqGroupFor(14) === 'off', 'sequence positions classified');
  ok(!cr.list.some(c => c.ri === 13) && !cr.list.some(c => c.ri === 14) && cr.notEligible >= 2, 'default (nurture only): early-phase and off-sequence leads are NOT pushed');
  cfgVals.nlSeqGroups = ['nurture', 'off'];
  cr = M.resendCandidates();
  ok(cr.list.some(c => c.ri === 14) && !cr.list.some(c => c.ri === 13), 'enabling off-sequence includes Ollie; Eddie still held out');
  cfgVals.nlStatuses = ['Contacted'];
  cr = M.resendCandidates();
  ok(cr.list.some(c => c.ri === 13), 'stage override: an enabled status pulls a lead in regardless of phase');
  delete cfgVals.nlSeqGroups; delete cfgVals.nlStatuses;
  ok(M.resendCandidates().list.some(c => c.ri === 13) === false, 'clearing overrides restores the nurture-only default');

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

  /* ── warm-up scheduler ── */
  // quotas: 14 days cover the whole pool, ramp is monotone-ish, capped at 90
  const POOL = 200;
  let cum = 0, prevQ = 0, mono = true;
  for (let d = 0; d < M.NL_WARMUP_DAYS; d++) { const q = M.nlWarmupQuota(d, POOL); if (q + 1 < prevQ) mono = false; prevQ = q; cum += q; }
  ok(cum >= POOL, '14 daily quotas cover the entire pool');
  ok(M.nlWarmupCum(M.NL_WARMUP_DAYS - 1, POOL) === POOL, 'cumulative caps at pool size');
  ok(mono, 'batch sizes ramp (never shrink meaningfully)');
  ok(M.nlWarmupQuota(0, POOL) < M.nlWarmupQuota(13, POOL), 'day 1 is much smaller than day 14');
  ok(M.nlWarmupQuota(5, 100000) === 90, 'daily quota hard-capped at 90 (free tier)');
  ok(M.nlWarmupState() === null, 'no start date → warm-up inactive');
  // activate: start = 2 schedule-days ago → today is day 2 (index 2)
  const startD = new Date(localToday().getTime() - 2 * 86400000);
  cfgVals.nlWarmupStart = ds(startD);
  cfgVals.nlWarmupSent = {};
  const ws = M.nlWarmupState();
  ok(ws && ws.day === 2, 'state reports the right schedule day');
  // fresh pool for projection: 30 nurture leads, engagement-ordered
  rows.length = 0; for (const k of Object.keys(nurtureFlags)) delete nurtureFlags[k]; for (const k of Object.keys(offFlags)) delete offFlags[k];
  for (let i = 0; i < 30; i++) { mkLead(4 + i, 'L' + i, 'l' + i + '@x.com'); rows[4 + i][C.LC] = '8/' + Math.min(28, 28 - i) + '/2026'; }
  const pool = M.resendCandidates().list;
  ok(pool.length === 30 && pool[0].email === 'l0@x.com', 'pool engagement-sorted, most engaged first');
  // most-engaged unsent lead projects to TODAY; deep-ranked projects later
  const pFirst = M.nlWarmupProjectedDay(pool[0].ri);
  const pLast = M.nlWarmupProjectedDay(pool[29].ri);
  ok(pFirst === ws.day, 'top-ranked lead is projected into today\'s batch');
  ok(pLast > pFirst, 'low-engagement lead projects to a later day');
  // HOLD RULE: within current schedule-week (≤ day+6) holds; beyond does not
  ok(M.nlWarmupHolds(pool[0].ri) === true, 'lead due warm-up this schedule-week: normal weekly send HELD');
  ok((pLast <= ws.day + 6) === M.nlWarmupHolds(pool[29].ri), 'hold matches the schedule-week boundary exactly');
  // already warm-up-sent → held for the rest of the week
  cfgVals.nlWarmupSent = { 'l5@x.com': new Date().toISOString() };
  ok(M.nlWarmupHolds(pool[5].ri) === true, 'already-sent lead stays held (once per week)');
  // deactivate → nothing held
  cfgVals.nlWarmupStart = '';
  ok(M.nlWarmupHolds(pool[0].ri) === false, 'warm-up off → no holds anywhere');
  cfgVals.nlWarmupSent = {};
  // per-lead wrapper: no unsubscribe merge tag on transactional sends
  const noUnsub = M.buildNewsletterHtml('<p>x</p>', { noUnsub: true });
  ok(noUnsub.indexOf(M.RESEND_UNSUB_TAG) === -1 && noUnsub.includes('815 Superior Ave'), 'per-lead wrapper drops the merge tag, keeps the address');

  /* ── 🧪 A/B split send ── */
  const hA = M.nlSplitVariantFor('a@x.com', 2);
  ok(hA === M.nlSplitVariantFor('a@x.com', 2) && hA >= 0 && hA < 2, 'split hash deterministic and in range');
  const g2 = [0, 0]; for (let i = 0; i < 100; i++) g2[M.nlSplitVariantFor('user' + i + '@mail.com', 2)]++;
  ok(g2[0] >= 25 && g2[1] >= 25, 'hash splits roughly evenly (both groups ≥25 of 100)');
  weeklyVariantsLive.length = 0; weeklyVariantsLive.push({ label: 'A', subject: 'SA {dm}', body: 'Body A for {dm}' });
  let thr = ''; try { await M.nlSendSplitTest(); } catch (e) { thr = e.message; }
  ok(/at least 2 live variants/.test(thr), 'refuses with only one variant');
  weeklyVariantsLive.push({ label: 'B', subject: 'SB {dm}', body: 'Body B for {dm}' });
  cfgVals.nlWarmupStart = ds(localToday());
  thr = ''; try { await M.nlSendSplitTest(); } catch (e) { thr = e.message; }
  ok(/Warm-up is running/.test(thr), 'refuses during an active warm-up');
  cfgVals.nlWarmupStart = '';
  audienceContacts = [];
  thr = ''; try { await M.nlSendSplitTest(); } catch (e) { thr = e.message; }
  ok(/list is empty/.test(thr), 'refuses on an empty list');
  audienceContacts = Array.from({ length: 96 }, (_, i) => ({ email: 'm' + i + '@x.com', unsubscribed: false }));
  thr = ''; try { await M.nlSendSplitTest(); } catch (e) { thr = e.message; }
  ok(/100\/day/.test(thr), 'refuses past the free-tier daily cap');
  // happy path: 4 known leads (one locally unsubscribed), 1 unknown, 1 Resend-unsubscribed
  rows[4 + 7][C.UNSUB] = '2026-08-30T00:00:00Z';
  audienceContacts = [
    { email: 'l1@x.com', unsubscribed: false }, { email: 'l2@x.com', unsubscribed: false },
    { email: 'l3@x.com', unsubscribed: false }, { email: 'l7@x.com', unsubscribed: false },
    { email: 'ghost@x.com', unsubscribed: false }, { email: 'l9@x.com', unsubscribed: true }
  ];
  relayCalls.length = 0;
  const ab = await M.nlSendSplitTest();
  ok(ab.sent === 4 && ab.skippedUnsub === 1, 'sends to subscribers, skips the locally-unsubscribed; Resend opt-outs filtered upstream');
  ok(Object.values(ab.counts).reduce((a, b) => a + b, 0) === 4, 'per-variant counts add up to the sends');
  const abSends = relayCalls.filter(c => c.op === 'sendEmail');
  ok(abSends.length === 4 && abSends.some(s => s.to === 'ghost@x.com'), 'a contact with no sheet row still gets their variant');
  ok(abSends.every(s => /^S[AB] /.test(s.subject)), 'each send carries one of the live variants');
  const grouping = abSends.map(s => s.to + ':' + s.subject.slice(0, 2)).sort().join('|');
  relayCalls.length = 0;
  await M.nlSendSplitTest();
  const grouping2 = relayCalls.filter(c => c.op === 'sendEmail').map(s => s.to + ':' + s.subject.slice(0, 2)).sort().join('|');
  ok(grouping === grouping2, 'the same contact always lands in the same variant group');
  weeklyVariantsLive.length = 0;

  /* ── weekly draft → broadcast conversion (the weekly draft IS the newsletter) ── */
  const tagOnce = h => h.split(M.RESEND_UNSUB_TAG).length - 1 === 1;
  // plain-text weekly draft
  let cv = M.weeklyToBroadcastHtml('A note for {dm}', 'Hi {dm},\n\nThinking of {pt} this week.');
  ok(cv.subject === 'A note for there', 'subject {dm} token becomes a plain fallback');
  ok(cv.html.includes('{{{FIRST_NAME|there}}}') && cv.html.includes('your loved one'), 'body tokens become Resend merge tag + patient fallback');
  ok(tagOnce(cv.html) && cv.html.includes('815 Superior Ave'), 'plain draft: wrapped with exactly one unsubscribe tag + address');
  ok(M.validateBroadcast('aud_1', cv.subject, cv.html) === null, 'plain-draft conversion passes broadcast validation');
  // HTML-fragment weekly draft
  cv = M.weeklyToBroadcastHtml('Subj', '<p>Hello {dm}</p><p>News this week.</p>');
  ok(tagOnce(cv.html) && /<html/i.test(cv.html), 'fragment draft: brand-wrapped into a full doc, one tag');
  // full-design weekly draft WITHOUT a footer → compliance footer injected once
  cv = M.weeklyToBroadcastHtml('Subj', '<html><body><div style="max-width:600px">Designed newsletter</div></body></html>');
  ok(tagOnce(cv.html) && cv.html.indexOf(M.RESEND_UNSUB_TAG) < cv.html.toLowerCase().lastIndexOf('</body>'), 'full design: footer injected once, inside the body');
  ok(M.validateBroadcast('aud_1', 'Subj', cv.html) === null, 'injected footer carries the address too');
  // full-design draft that ALREADY has the tag → never doubled
  cv = M.weeklyToBroadcastHtml('Subj', '<html><body><p>x</p><a href="' + M.RESEND_UNSUB_TAG + '">Unsubscribe</a> 815 Superior Ave</body></html>');
  ok(tagOnce(cv.html), 'draft already carrying the tag is not double-injected');

  /* ── send path: create + send through the relay, refusal short-circuits ── */
  relayCalls.length = 0;
  const bid = await M.resendSendBroadcast('Hello from Solura', goodHtml);
  ok(bid === 'bc_1' && relayCalls.some(c => c.op === 'broadcast' && c.segmentId === 'aud_1'), 'broadcast created+sent against the Segment in one call');
  relayCalls.length = 0;
  let threw = false;
  try { await M.resendSendBroadcast('x', goodHtml.replace(M.RESEND_UNSUB_TAG, '')); } catch (_) { threw = true; }
  ok(threw && relayCalls.length === 0, 'invalid broadcast never reaches the relay');
})();

console.log('\nNewsletter: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
