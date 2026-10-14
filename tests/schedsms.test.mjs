// 📱⏰ Scheduled texts (B-1009-120). Slices ⚡SCHEDSMS and locks the design:
// the dashboard resolves the GHL contact NOW and queues on the tracking
// worker; the worker's CRON TRIGGER sends via GoHighLevel at the due time,
// so texts go out with the laptop shut. Results flow back for the comms log.
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
const mk = new Function(src + '\nreturn {smsSchedValidate,smsQueuePayload};');
const S = mk();

// ── validation ──
{
  const base = { phone: '(216) 555-0100', msg: 'Hi Susan', hasTracker: true, dueTs: 1000000 + 120000, now: 1000000 };
  ok(S.smsSchedValidate(base) === null, 'a clean text schedules');
  ok(/phone/.test(S.smsSchedValidate({ ...base, phone: '' })), 'no phone blocked');
  ok(/Write the text/.test(S.smsSchedValidate({ ...base, msg: '  ' })), 'empty message blocked');
  ok(/tracker URL/.test(S.smsSchedValidate({ ...base, hasTracker: false })), 'no tracker configured = clear pointer to Data & analytics');
  ok(/future/.test(S.smsSchedValidate({ ...base, dueTs: base.now + 30000 })), 'past or immediate times blocked');
}

// ── queue payload ──
{
  const p = S.smsQueuePayload({ dueTs: 123, contactId: 'C1', locationId: 'L1', msg: 'x'.repeat(2000), phone: '(216) 555-0100', leadName: 'Rose Gold', ri: 7 });
  ok(p.due === 123 && p.contactId === 'C1' && p.locationId === 'L1' && p.ri === 7, 'queue record carries everything the cron needs — no lookups at 3am');
  ok(p.message.length === 1000, 'message length-capped');
}

// ── worker locks: queue + cron ──
{
  ok(/path === '\/sms\/schedule' && req\.method === 'POST'/.test(worker) && /stok !== env\.TRACK_TOKEN/.test(worker), 'queueing requires the dashboard token');
  ok(/'smsq:' \+ srec\.due \+/.test(worker), 'queue keys carry the DUE time — the cron filters by key alone');
  ok(/path === '\/sms\/list'/.test(worker) && /path === '\/sms\/cancel'/.test(worker) && /ckey\.indexOf\('smsq:'\) !== 0\) return json\(\{ error: 'bad key' \}/.test(worker), 'list + cancel, and cancel can only touch sms queue keys');
  ok(/path === '\/sms\/results'/.test(worker) && /path === '\/sms\/results\/ack'/.test(worker) && /kk2\.indexOf\('smsr:'\) === 0/.test(worker), 'results wait until the dashboard acks them');
  ok(/async scheduled\(event, env, ctx\)/.test(worker), 'the worker has a CRON handler — sending happens server-side, laptop shut');
  ok(/tsOfKey\(k\) <= now/.test(worker), 'cron sends exactly the due ones');
  ok(/services\.leadconnectorhq\.com\/conversations\/messages/.test(worker) && /Version: '2021-07-28'/.test(worker) && /env\.GHL_API_KEY/.test(worker), 'cron sends through GoHighLevel with the worker-held secret');
  ok(/GHL_API_KEY secret not set on the worker/.test(worker), 'a missing secret becomes a loud result, never a silent drop');
  ok(/rec\.attempts >= 5/.test(worker) && /give up loudly, never silently/.test(worker), 'five failed cron passes = a failure result, not an infinite retry');
  ok(/smsQueue: smsCount, hasGhlKey: !!env\.GHL_API_KEY/.test(worker), '/ping reports queue depth + whether the secret is set');
}

// ── dashboard locks ──
{
  ok(/id="sms-sched-btn" data-action="sms-sched-open"/.test(html) && /id="sms-sched-panel"/.test(html), '🕒 Schedule button + panel in the SMS modal');
  const flow = html.slice(html.indexOf('async function schedSmsFromComposer'), html.indexOf('var _smsResultsBusy'));
  ok(/await ghlFindOrCreateContact\(ri,clean\)/.test(flow), 'the GHL contact is resolved AT SCHEDULING time (shared with the live send)');
  ok(/\/sms\/schedule\?token=/.test(flow) && /outcome:'scheduled-sms'/.test(flow) && /advanceLead\(ri,'SMS'\)/.test(flow), 'queueing logs the comms entry and advances the sequence');
  ok(/even if your laptop is off/.test(flow), 'the toast names the consequence plainly');
  ok(/var cid=await ghlFindOrCreateContact\(ri,clean\);\s*\n\s*if\(!cid\)\{\s*\n\s*toast\('No HCG contact for \+/.test(html), 'sendSMS uses the SAME shared contact resolver, and the popup toast names the miss');
  const poll = html.slice(html.indexOf('async function pollSmsResults'), html.indexOf('async function renderSchedSms'));
  ok(/outcome:'scheduled-sms-sent'/.test(poll) && /outcome:'scheduled-sms-failed'/.test(poll) && /FAILED/.test(poll), 'sent and failed results both land in the comms log, failures loud');
  ok(/\/sms\/results\/ack\?token=/.test(poll), 'results are acked so they never double-log');
  ok(/pollSmsResults\(\)\.catch\(function\(\)\{\}\);    \/\/ 📱 collect the cron's sent\/failed texts/.test(html), 'results collection rides the standing poll');
  ok(/id="schedsms-list"/.test(html) && /data-action="schedsms-del"/.test(html), 'queued texts list + cancel in Settings');
  ok(/GHL_API_KEY<\/b> secret/.test(html) && /\*\/5 \* \* \* \*/.test(html), 'the one-time worker setup (secret + cron trigger) is spelled out in Settings');
  ok(/hasGhlKey===false/.test(html) && /texts will NOT send until you add it/.test(html), 'a missing worker secret is flagged in the queue list');
}

// ── 🔑 GHL key consistency + no-leak guard (B-1013) ──
{
  const fs = await import('node:fs');
  const root = join(here, '..');
  // ONE canonical browser-side source: localStorage ghlApiKey (+ synced
  // config fallback in the main dashboard). The worker holds its own copy
  // as the GHL_API_KEY secret. NOTHING is ever hardcoded in a public file.
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
  ok(/function GHL_KEY\(\)/.test(refDash) && /localStorage\.getItem\('ghlApiKey'\)/.test(refDash), "referral dashboard reads the SAME localStorage 'ghlApiKey' (same origin, one key)");
  ok(/No GoHighLevel API key on this browser/.test(refDash), 'referral dashboard fails loud with a pointer when the key is missing');
  ok((refDash.match(/Bearer '\+GHL_KEY\(\)/g) || []).length >= 3, 'every referral-dashboard GHL call uses the function, none a constant');

  // B-1013-131: a REJECTED key must never masquerade as "contact not found"
  const resolver = html.slice(html.indexOf('async function ghlFindOrCreateContact'), html.indexOf('/* ─── ⏰ Scheduled texts'));
  ok((resolver.match(/sr\.status===401\|\|sr\.status===403\)throw new Error\(KEY_BAD\)|r2\.status===401\|\|r2\.status===403\)throw new Error\(KEY_BAD\)|cr\.status===401\|\|cr\.status===403\)throw new Error\(KEY_BAD\)/g) || []).length === 3, 'all three GHL lookups throw loud on 401/403 — no silent fall-through to the HCG popup');
  ok(/GoHighLevel rejected the API key/.test(resolver) && /paste the NEW key in Settings/.test(resolver), 'the error says exactly what to do after a key rotation');
  ok((resolver.match(/if\(e&&e\.message===KEY_BAD\)throw e;/g) || []).length === 5, 'network hiccups stay quiet in all five lookups; only the auth failure escapes');
  ok(/GoHighLevel rejected the API key/.test(refDash) && (refDash.match(/throw new Error\(KEY_BAD\)/g) || []).length >= 3, 'the referral dashboard gets the same loud auth failure');

  // B-1013-132: a contact that exists under the EMAIL must be found — phone
  // misses were colliding on create and silently dumping to the HCG popup
  const resolver2 = html.slice(html.indexOf('async function ghlFindOrCreateContact'), html.indexOf('/* ─── ⏰ Scheduled texts'));
  ok(/search\/duplicate\?locationId='\+GHL_LOC\+'&email='/.test(resolver2) && /query='\+encodeURIComponent\(leadEm\)/.test(resolver2), 'the resolver falls back to EMAIL lookups before creating');
  ok(/cj\.meta&&cj\.meta\.contactId\)cid=cj\.meta\.contactId/.test(resolver2), "GHL's duplicate rejection names the existing contact — it gets used, not swallowed");
  ok(/_ghlMiss=String\(\(cj&&cj\.message\)/.test(resolver2) && /_ghlMiss\?\(' \('\+_ghlMiss\+'\)'\)/.test(html), 'when it still misses, the popup toast says WHY');
  ok(/search\/duplicate\?locationId='\+GHL_LOC\+'&email='/.test(refDash) && /cj\.meta\.contactId/.test(refDash), 'the referral dashboard gets the email fallback + duplicate recovery too');
}

// ── 🔌 text-scheduling self-test (B-1014-134) ──
{
  ok(/data-action="schedsms-test"/.test(html) && /async function schedSmsSelfTest/.test(html), 'one-click self-test in Settings walks the whole chain');
  const st = html.slice(html.indexOf('async function schedSmsSelfTest'), html.indexOf('async function schedSmsCancel'));
  ok(/Tracker config/.test(st) && /GHL secret/.test(st) && /Queue write/.test(st) && /Cancel/.test(st), 'it checks config, worker version + secret, a real queue write, and cleans up after itself');
  ok(/401 unauthorized/.test(st) && /TRACK_TOKEN/.test(st) && /404/.test(st), 'token mismatch and outdated worker each get named plainly');
  ok(/Cron Trigger/.test(st), 'it says the one thing it cannot prove: the cron trigger');
}

console.log('\nScheduled SMS: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
