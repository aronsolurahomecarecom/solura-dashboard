// 🧾📅 System-email read receipts (B-0929-103). Slices the ⚡RECEIPTS region
// and locks the invoice / assessment / cancellation send paths: pixel in,
// kind-labeled sent record, pixel-free Sent copy, intake mail untracked.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');

let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };

const b = html.indexOf('/* ⚡RECEIPTS — BEGIN');
const e = html.indexOf('/* ⚡RECEIPTS — END */');
if (b < 0 || e < 0) throw new Error('RECEIPTS markers missing');
const src = html.slice(html.indexOf('*/', b) + 2, e);

function build(pixelOn) {
  const recorded = [];
  const mk = new Function('trackingPixelHtml', 'injectBeforeClose', 'recordSentEmail', 'escapeHtml',
    src + '\nreturn {trackSystemEmail,emailKindChip,EMAIL_KIND_LABELS};');
  const api = mk(
    (ri, to, subj, id) => pixelOn ? '<img src="https://w/px?d=' + id + '">' : '',
    (h, frag) => {
      const i = String(h).toLowerCase().lastIndexOf('</body>');
      return i > -1 ? h.slice(0, i) + frag + h.slice(i) : h + frag;
    },
    (...args) => recorded.push(args),
    (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  );
  return { api, recorded };
}

// ── trackSystemEmail with a tracker configured ──
{
  const { api, recorded } = build(true);
  const trk = api.trackSystemEmail(7, 'fam@x.com', 'Your invoice', '<html><body><p>Hi</p></body></html>', 'invoice');
  ok(/^m\d+-[a-z0-9]{5}$/.test(trk.id), 'send-id has the composer format (worker events resolve it identically)');
  ok(trk.tracked === true, 'tracked when the pixel tracker is configured');
  ok(/<p>Hi<\/p><img src="https:\/\/w\/px\?d=m/.test(trk.html) && /<\/body><\/html>$/.test(trk.html), 'pixel injected INSIDE the body, not after </html>');
  trk.record(Promise.resolve(42));
  await new Promise((r) => setTimeout(r, 10));
  ok(recorded.length === 1 && recorded[0][0] === trk.id && recorded[0][1] === 7 && recorded[0][4] === 42 && recorded[0][6] === 'invoice',
    'record chains the comms row into the sent store with the kind label');
}

// ── no tracker configured → send untouched, still recorded ──
{
  const { api, recorded } = build(false);
  const trk = api.trackSystemEmail(3, 'a@b.c', 'S', '<p>x</p>', 'assessment');
  ok(trk.tracked === false && trk.html === '<p>x</p>', 'no tracker = untouched body, no phantom tracking');
  trk.record(Promise.reject(new Error('log failed')));
  await new Promise((r) => setTimeout(r, 10));
  ok(recorded.length === 1 && recorded[0][4] === null && recorded[0][6] === 'assessment',
    'a failed comms log still records the receipt locally (null row)');
}

// ── kind chips ──
{
  const { api } = build(true);
  ok(/🧾 invoice/.test(api.emailKindChip('invoice')), 'invoice chip labeled');
  ok(/📅 assessment/.test(api.emailKindChip('assessment')), 'assessment chip labeled');
  ok(/❌ cancellation/.test(api.emailKindChip('assessment-cancel')), 'cancellation chip labeled');
  ok(api.emailKindChip('') === '', 'composer emails (no kind) get no chip');
  ok(/custom-kind/.test(api.emailKindChip('custom-kind')), 'unknown kinds still display');
}

// ── source-level locks on the three send paths ──
{
  const inv = html.slice(html.indexOf('async function invSend'), html.indexOf('function isAPFM'));
  ok(/trackSystemEmail\(_invRi,em\.to,em\.subject,em\.html,'invoice'\)/.test(inv), 'INVOICE sends carry a pixel + receipt record');
  ok(/saveToSentItems:!trk\.tracked/.test(inv), 'invoice: tracked sends never auto-save the pixel copy');
  ok(/saveCleanSentCopy\(em\.subject,em\.to,trk\.html,payload\.message\.attachments,null,em\.from\)/.test(inv), 'invoice: pixel-free copy filed AS billing@ (self-opens never count)');
  ok(/trk\.record\(logComms\(/.test(inv) && /messageId:trk\.id/.test(inv), 'invoice: opens stamp the invoice comms row');

  const asv = html.slice(html.indexOf('async function asSave'), html.indexOf('async function invSend'));
  ok(/trackSystemEmail\(ri,em\.to,em\.subject,em\.html,'assessment'\)/.test(asv), 'ASSESSMENT confirmations carry a pixel + receipt record');
  ok(/saveToSentItems:!trkA\.tracked/.test(asv) && /if\(trkA\.tracked\)saveCleanSentCopy\(em\.subject,em\.to,trkA\.html,msg9\.attachments,null\)/.test(asv), 'assessment: no self-tracking copy in Sent Items');
  ok(/if\(sent&&trkA\)trkA\.record\(_asLog\)/.test(asv), 'assessment: receipt tied to its comms row (skipped when no email sent)');

  const cnl = html.slice(html.indexOf('async function asCancel'), html.indexOf('async function asSave'));
  ok(/trackSystemEmail\(ri,to,subj9,html9,'assessment-cancel'\)/.test(cnl), 'CANCELLATION emails carry a pixel + receipt record');
  ok(/saveToSentItems:!trkC\.tracked/.test(cnl) && /if\(trkC\.tracked\)saveCleanSentCopy\(subj9,to,trkC\.html,msg9\.attachments,null\)/.test(cnl), 'cancellation: no self-tracking copy in Sent Items');
  ok(/if\(sent&&trkC\)trkC\.record\(_cnLog\)/.test(cnl), 'cancellation: receipt tied to its comms row');

  const intake = html.slice(html.indexOf('async function asmtSendIntakeEmail'), html.indexOf('async function asmtFinish'));
  ok(!/trackSystemEmail/.test(intake), 'internal intake@ summary stays UNtracked (no pixel on our own team)');
}

// ── display locks ──
{
  ok(/recordSentEmail\(id,ri,email,subj,commsRow,variant,kind\)/.test(html) && /kind:String\(kind\|\|''\)/.test(html), 'sent store persists the kind');
  ok(/emailKindChip\(rec\.kind\)/.test(html), 'the sent-emails list labels invoice / assessment sends');
  ok(/typeof renderSentEmailsFor==='function'\?renderSentEmailsFor\(ri\):''/.test(html), 'the Email tab fold shows read receipts alongside their messages');
  ok(/saveCleanSentCopy\(subj,toAddr,html,atts,largeNames,fromAddr\)/.test(html) && /if\(fromAddr\)msg\.from=\{emailAddress:\{address:fromAddr\}\}/.test(html), 'clean Sent copies can carry the shared-mailbox from');
}

console.log('\nReceipts: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
