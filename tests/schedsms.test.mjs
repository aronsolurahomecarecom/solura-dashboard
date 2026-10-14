// 📱⏰ Scheduled texts (B-1014-136): GHL NATIVE hold-and-send. The dashboard
// resolves the contact, POSTs /conversations/messages with
// scheduledTimestamp (UTC SECONDS), and GoHighLevel delivers at the due
// time — laptop on or off, no worker, no cron. Also: the GHL-key
// consistency + no-leak guards, and the loud-auth-failure contact resolver.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');
const worker = readFileSync(join(here, '..', 'solura-track-worker.js'), 'utf8');

let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };

const b = html.indexOf('/* ⚡SCHEDSMS — BEGIN');
const e = html.indexOf('/* ⚡SCHEDSMS — END */');
if (b < 0 || e < 0) throw new Error('SCHEDSMS markers missing');
const src = html.slice(html.indexOf('*/', b) + 2, e);
const enginesDoc = { config: {} };
const mk = new Function('enginesDoc', src + '\nreturn {smsSchedValidate,smsSchedGhlPayload,scheduledSmsRecs};');
const S = mk(enginesDoc);

// ── validation ──
{
  const base = { phone: '(216) 555-0100', msg: 'Hi Susan', dueTs: 1000000 + 120000, now: 1000000 };
  ok(S.smsSchedValidate(base) === null, 'a clean text schedules');
  ok(/phone/.test(S.smsSchedValidate({ ...base, phone: '' })), 'no phone blocked');
  ok(/Write the text/.test(S.smsSchedValidate({ ...base, msg: '  ' })), 'empty message blocked');
  ok(/future/.test(S.smsSchedValidate({ ...base, dueTs: base.now + 30000 })), 'past or immediate times blocked');
}

// ── the native GHL payload ──
{
  const p = S.smsSchedGhlPayload({ dueTs: 1792008400383, contactId: 'C1', locationId: 'L1', msg: 'x'.repeat(2000) });
  ok(p.type === 'SMS' && p.contactId === 'C1' && p.locationId === 'L1', 'standard send-message shape');
  ok(p.scheduledTimestamp === 1792008400, 'scheduledTimestamp is UTC SECONDS (10 digits) — milliseconds would misfire');
  ok(String(p.scheduledTimestamp).length === 10, 'sanity: a 10-digit epoch');
  ok(p.message.length === 1000, 'message length-capped');
  ok(S.scheduledSmsRecs() === enginesDoc.config.scheduledSms, 'pending records live in the synced, overwrite-guarded config');
}

// ── source locks: the native flow ──
{
  ok(/id="sms-sched-btn" data-action="sms-sched-open"/.test(html) && /id="sms-sched-panel"/.test(html), '🕒 Schedule button + panel in the SMS modal');
  const flow = html.slice(html.indexOf('async function schedSmsFromComposer'), html.indexOf('var _schedSmsChecking'));
  ok(/await ghlFindOrCreateContact\(ri,clean\)/.test(flow), 'the GHL contact resolves at scheduling time (shared with the live send)');
  ok(/smsSchedGhlPayload\(/.test(flow) && /GHL_BASE\+'\/conversations\/messages'/.test(flow), 'the schedule IS a GHL send with scheduledTimestamp — no worker hop');
  ok(/returned no message id/.test(flow), 'a missing message id is loud, never silently dropped');
  ok(/scheduledSmsRecs\(\)\.push\(\{id:msgId/.test(flow) && /outcome:'scheduled-sms'/.test(flow) && /advanceLead\(ri,'SMS'\)/.test(flow), 'queueing records locally, logs comms, advances the sequence');
  ok(/HomeCareGrow sends it '\+whenStr\+', even if your laptop is off/.test(flow), 'the toast names the consequence plainly');
  const chk = html.slice(html.indexOf('async function schedSmsCheckPastDue'), html.indexOf('async function schedSmsSelfTest'));
  ok(/st9==='scheduled'/.test(chk) && /rec\.stuck=true/.test(chk) && /went out/.test(chk) && /outcome:'scheduled-sms-sent'/.test(chk), 'past-due records verify against GHL: sent = cleaned + logged, still scheduled = flagged stuck');
  ok(/schedSmsCheckPastDue\(\)\.catch\(function\(\)\{\}\); \/\/ 📱 confirm GHL sent what was due/.test(html), 'verification rides the standing poll');
  const cancel = html.slice(html.indexOf('async function schedSmsCancel'), html.indexOf('async function sendSMS()'));
  ok(/\/schedule',\{method:'DELETE'/.test(cancel) && /r\.status===404/.test(cancel), "cancel uses GHL's own un-schedule endpoint; already-sent 404s are reported, not errored");
  ok(/id="schedsms-list"/.test(html) && /data-action="schedsms-del"/.test(html), 'pending texts list + cancel in Settings');
  ok(/No worker, no cron, nothing to set up/.test(html), 'the Settings copy says the worker/cron setup is gone');
  ok(!/pollSmsResults/.test(html), 'the worker-results poller is fully retired');
}

// ── self-test ──
{
  ok(/data-action="schedsms-test"/.test(html) && /async function schedSmsSelfTest/.test(html), 'one-click self-test in Settings');
  const st = html.slice(html.indexOf('async function schedSmsSelfTest'), html.indexOf('function renderSchedSms'));
  ok(/Browser GHL key/.test(st) && /GHL auth/.test(st) && /Pending scheduled texts/.test(st), 'it checks the key, a real GHL auth probe, and the pending count');
  ok(/key was REJECTED/.test(st), 'a rejected key is named plainly');
  ok(/no worker, no cron needed/.test(st), 'it states the native design');
}

// ── 🔑 GHL key consistency + no-leak guard ──
{
  const fs = await import('node:fs');
  const root = join(here, '..');
  const publicFiles = fs.readdirSync(root).filter((f) => /\.(html|js)$/i.test(f));
  const leaks = [];
  for (const f of publicFiles) {
    const t = fs.readFileSync(join(root, f), 'utf8');
    if (/pit-[0-9a-f]{4,}/i.test(t)) leaks.push(f);
  }
  ok(leaks.length === 0, 'NO file in the public repo holds a literal GHL key (found in: ' + leaks.join(', ') + ')');
  ok(/localStorage\.getItem\('ghlApiKey'\)/.test(html) && /enginesDoc\.config\.ghlApiKey/.test(html), "main dashboard reads localStorage 'ghlApiKey' with the synced-config fallback");
  ok(/localStorage\.setItem\('ghlApiKey'/.test(html) && /enginesDoc\.config\.ghlApiKey=t\.value\.trim\(\)/.test(html), 'saving the key in Settings writes BOTH sources');
  const refDash = fs.readFileSync(join(root, 'Solura_Referral_Dashboard.html'), 'utf8');
  ok(/function GHL_KEY\(\)/.test(refDash) && /localStorage\.getItem\('ghlApiKey'\)/.test(refDash), "referral dashboard reads the SAME localStorage 'ghlApiKey'");
  ok(/No GoHighLevel API key on this browser/.test(refDash), 'referral dashboard fails loud with a pointer when the key is missing');
  ok((refDash.match(/Bearer '\+GHL_KEY\(\)/g) || []).length >= 3, 'every referral-dashboard GHL call uses the function, none a constant');
  ok(/GoHighLevel rejected the API key/.test(refDash) && (refDash.match(/throw new Error\(KEY_BAD\)/g) || []).length >= 3, 'the referral dashboard keeps the loud auth failure');
}

// ── contact resolver: loud auth, email fallback, duplicate recovery ──
{
  const resolver = html.slice(html.indexOf('async function ghlFindOrCreateContact'), html.indexOf('/* ─── ⏰ Scheduled texts'));
  ok((resolver.match(/status===401\|\|\w+\.status===403\)throw new Error\(KEY_BAD\)/g) || []).length === 5, 'all five GHL lookups throw loud on 401/403');
  ok(/GoHighLevel rejected the API key/.test(resolver) && /paste the NEW key in Settings/.test(resolver), 'the error says exactly what to do after a key rotation');
  ok(/search\/duplicate\?locationId='\+GHL_LOC\+'&email='/.test(resolver) && /query='\+encodeURIComponent\(leadEm\)/.test(resolver), 'the resolver falls back to EMAIL lookups before creating');
  ok(/cj\.meta&&cj\.meta\.contactId\)cid=cj\.meta\.contactId/.test(resolver), "GHL's duplicate rejection names the existing contact — it gets used");
  ok(/_ghlMiss=String\(\(cj&&cj\.message\)/.test(resolver) && /_ghlMiss\?\(' \('\+_ghlMiss\+'\)'\)/.test(html), 'when it still misses, the popup toast says WHY');
}

// ── worker legacy (endpoints stay deployed; dashboard no longer uses them) ──
{
  ok(/path === '\/sms\/schedule' && req\.method === 'POST'/.test(worker) && /async scheduled\(event, env, ctx\)/.test(worker), 'the worker queue + cron remain intact for rollback');
  ok(/cron_last/.test(worker) && /cronLast: cronLast/.test(worker), 'the cron heartbeat stays observable via /ping');
}

console.log('\nScheduled SMS: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
