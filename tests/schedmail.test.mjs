// ⏰ Scheduled emails (B-1009-118). Slices ⚡SCHEDMAIL and locks the core
// promise: the email is handed to EXCHANGE with PR_DEFERRED_SEND_TIME, so
// Microsoft sends it at the set time even with the laptop shut. No client
// poller does the sending; the dashboard only verifies and manages.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');

let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };

const b = html.indexOf('/* ⚡SCHEDMAIL — BEGIN');
const e = html.indexOf('/* ⚡SCHEDMAIL — END */');
if (b < 0 || e < 0) throw new Error('SCHEDMAIL markers missing');
const src = html.slice(html.indexOf('*/', b) + 2, e);

const enginesDoc = { config: {} };
const mk = new Function('enginesDoc',
  src + '\nreturn {scheduledEmails,schedDeferredProp,schedValidate,schedDraftPayload,schedPastDue};');
const S = mk(enginesDoc);

// ── the deferred-delivery property ──
{
  const p = S.schedDeferredProp(Date.UTC(2026, 9, 10, 13, 0, 0));
  ok(p.id === 'SystemTime 0x3FEF', 'PR_DEFERRED_SEND_TIME — the same MAPI property Outlook delay-delivery uses');
  ok(p.value === '2026-10-10T13:00:00.000Z', 'due time rides as UTC ISO');
}

// ── draft payload ──
{
  const msg = S.schedDraftPayload({ to: 'fam@x.com', subj: 'Checking in', bodyHtml: '<p>Hi</p>', dueTs: Date.UTC(2026, 9, 10, 13, 0, 0),
    atts: [{ name: 'a.pdf', type: 'application/pdf', dataBase64: 'QQ==' }] });
  ok(msg.toRecipients[0].emailAddress.address === 'fam@x.com' && msg.body.contentType === 'HTML', 'message shape for Graph');
  ok(msg.singleValueExtendedProperties[0].id === 'SystemTime 0x3FEF', 'the deferred property rides the draft');
  ok(msg.attachments.length === 1 && msg.attachments[0]['@odata.type'] === '#microsoft.graph.fileAttachment', 'small attachments ride along');
  ok(!('attachments' in S.schedDraftPayload({ to: 'a@b.c', subj: 's', bodyHtml: 'x', dueTs: 1, atts: [] })), 'no attachments key when empty');
}

// ── validation ──
{
  const base = { to: 'a@b.c', subj: 'S', bodyText: 'hi', reply: false, hasInline: false, hasLarge: false, attsBytes: 0, dueTs: 1000000 + 120000, now: 1000000 };
  ok(S.schedValidate(base) === null, 'a clean compose schedules');
  ok(/recipient/.test(S.schedValidate({ ...base, to: '' })), 'no recipient blocked');
  ok(/subject/.test(S.schedValidate({ ...base, subj: ' ' })), 'empty subject blocked');
  ok(/body is empty/.test(S.schedValidate({ ...base, bodyText: '  ' })), 'empty body blocked');
  ok(/Replies cannot/.test(S.schedValidate({ ...base, reply: true })), 'reply mode blocked (threading cannot defer yet)');
  ok(/inline images/.test(S.schedValidate({ ...base, hasInline: true })), 'inline-image emails blocked');
  ok(/Big attachments/.test(S.schedValidate({ ...base, hasLarge: true })), 'large attachments blocked');
  ok(/Big attachments/.test(S.schedValidate({ ...base, attsBytes: 4 * 1024 * 1024 })), 'over ~3MB total blocked');
  ok(/future/.test(S.schedValidate({ ...base, dueTs: base.now + 30000 })), 'past or immediate times blocked');
}

// ── past-due grace + store ──
{
  const now = 10 * 60 * 1000;
  const due = S.schedPastDue([{ dueAt: now - 3 * 60 * 1000 }, { dueAt: now - 60 * 1000 }, { dueAt: now + 60 * 1000 }], now);
  ok(due.length === 1 && due[0].dueAt === now - 3 * 60 * 1000, 'only records 2+ minutes past due get verified (Exchange is not to-the-second)');
  ok(Array.isArray(S.scheduledEmails()) && S.scheduledEmails() === enginesDoc.config.scheduledEmails, 'the queue lives in the synced, overwrite-guarded config');
}

// ── source locks: the flow ──
{
  ok(/id="email-sched-btn" data-action="sched-email-open"/.test(html) && /id="sched-panel"/.test(html), '🕒 Schedule button + date/time panel in the composer');
  const flow = html.slice(html.indexOf('async function schedScheduleFromComposer'), html.indexOf('async function schedCancel'));
  ok(/\/me\/messages',\{method:'POST'/.test(flow) && /\/send',\{method:'POST'\}/.test(flow), 'draft is created and SENT immediately — Exchange holds it, not the browser');
  ok(/var trk=trackSystemEmail\(ri,to,subj,bodyHtml,'scheduled'\)/.test(flow) && /bodyHtml=trk\.html/.test(flow), 'READ RECEIPTS: the pixel rides scheduled sends like any live send');
  ok(/sendId:trk\.id,px:pxFrag/.test(flow) && /trk\.record\(logComms\(/.test(flow), 'the receipt record + pixel fragment persist with the queue entry');
  ok(/shellWillApply\(/.test(flow) && /applyEmailShell\(bodyHtml,ri\)/.test(flow), 'the brand wrap decision matches a live send');
  ok(/advanceLead\(ri,'Email'\)/.test(flow) && /outcome:'scheduled-send'/.test(flow), 'scheduling advances the sequence and logs the comms entry');
  ok(/even if your laptop is off/.test(flow), 'the toast names the consequence plainly');
  const cancel = html.slice(html.indexOf('async function schedCancel'), html.indexOf('async function schedScrubSentCopy'));
  ok(/\{method:'DELETE'\}/.test(cancel) && /r\.status===404/.test(cancel), 'cancel deletes from the Outbox; an already-sent one is reported, not errored');
  const scrub = html.slice(html.indexOf('async function schedScrubSentCopy'), html.indexOf('var _schedChecking'));
  ok(/body\.indexOf\(rec\.px\)===-1\)continue/.test(scrub), 'the Sent copy is found by ITS OWN pixel fragment — never a lookalike');
  ok(/saveCleanSentCopy\(rec\.subj,rec\.to,body,atts,null\)/.test(scrub) && /if\(okCopy\)/.test(scrub), 'pixel-free copy filed FIRST; the original is retired only on success');
  ok(/\/attachments\?\$select=name,contentType,contentBytes/.test(scrub), 'attachments ride the clean copy');
  const check = html.slice(html.indexOf('async function schedCheckPastDue'), html.indexOf('/* ⚡SCHEDMAIL — END */'));
  ok(/r\.status===404/.test(check) && /went out/.test(check) && /rec\.stuck=true/.test(check), 'past-due check: gone = sent and cleaned; still present = flagged stuck');
  ok(/schedScrubSentCopy\(rec\); \/\/ receipts stay real/.test(check), 'confirming a send immediately de-pixels its Sent copy');
  ok(/schedCheckPastDue\(\)\.catch\(function\(\)\{\}\); \/\/ ⏰ confirm Exchange sent what was due/.test(html), 'verification rides the standing poll');
  ok(/data-sec="schedmail"/.test(html) && /id="st-sec-schedmail"/.test(html) && /renderSchedMail\(\);\}catch/.test(html), 'Scheduled emails section in Settings, rendered on open');
  ok(/data-action="schedmail-del"/.test(html), 'each scheduled email can be cancelled from the list');
  ok(/Read receipts included/.test(html) && !/carry no read receipt/.test(html), 'the UI says receipts are IN, and the old caveat is gone');
  ok(/scheduled:'⏰ scheduled'/.test(html), 'scheduled sends get their own chip in the sent-emails list');
  const mbx = html.slice(html.indexOf('async function openMailbox'), html.indexOf('function renderMailboxList'));
  ok(/scheduledEmails\(\)\.forEach/.test(mbx) && /⏰ sends '\+when9/.test(mbx.replace(/\\u23f0/g, '⏰')) || /sends '\+when9/.test(mbx), '📧 Email tab: pending scheduled emails surface their lead with the send time');
  ok(/rec\.kind!=='scheduled'\)return;/.test(mbx) && /not opened yet/.test(mbx) && /opened'\+/.test(mbx), '📧 Email tab: sent scheduled emails show their read-receipt status on the row');
  ok(/if\(haveRi\[ri9\]\)return; \/\/ lead already listed via inbound/.test(mbx), 'leads with inbound mail are not duplicated — their fold already shows receipts');
}

console.log('\nScheduled mail: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
