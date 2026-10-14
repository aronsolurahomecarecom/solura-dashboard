// 📉 Form funnel (B-1014-137): the intake form sends anonymous fill pulses
// (session id, furthest step, last field touched) to the worker; the
// dashboard turns them into a funnel — started vs finished per link — and
// a quit list naming the exact step and field where each person stopped.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');
const worker = readFileSync(join(here, '..', 'solura-track-worker.js'), 'utf8');
const form = readFileSync(join(here, '..', 'care', 'index.html'), 'utf8');

let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };

const b = html.indexOf('/* ⚡FORMDROP — BEGIN');
const e = html.indexOf('/* ⚡FORMDROP — END */');
if (b < 0 || e < 0) throw new Error('FORMDROP markers missing');
const src = html.slice(html.indexOf('*/', b) + 2, e);
// Stand-ins for the link registry the slice leans on
const LINKS = { abc123: { platform: 'Facebook', method: 'ad' } };
const mk = new Function('intakeLinkByCode', 'intakeSourceString',
  src + '\nreturn {formSpotLabel,formDropClassify,formDropStats,formDropSrcLabel,formDropDur,FORM_DROP_ACTIVE_MS};');
const F = mk(
  (code) => LINKS[code] || null,
  (l) => l.method ? (l.platform + ' · ' + l.method) : l.platform
);

// ── spot labels: field keys become plain words ──
{
  ok(F.formSpotLabel('zip') === 'ZIP code' && F.formSpotLabel('recipient') === 'Who needs care', 'form field keys map to readable spots');
  ok(F.formSpotLabel('phone') === 'Phone number' && F.formSpotLabel('refclient') === "Client's name", 'step-3 and referral fields covered');
  ok(F.formSpotLabel('') === 'the first screen', 'a start with no field yet reads naturally');
  ok(F.formSpotLabel('mystery') === 'mystery', 'an unknown key passes through instead of erroring');
}

// ── classification: done / still filling / quit ──
{
  const now = 10_000_000_000;
  ok(F.formDropClassify({ done: true, lastAt: 0 }, now) === 'done', 'a finished session is done no matter how old');
  ok(F.formDropClassify({ lastAt: now - 5 * 60 * 1000 }, now) === 'active', 'touched 5 minutes ago = still filling, not a quit');
  ok(F.formDropClassify({ lastAt: now - 31 * 60 * 1000 }, now) === 'abandoned', '31 quiet minutes = they quit');
  ok(F.FORM_DROP_ACTIVE_MS === 30 * 60 * 1000, 'the still-filling window is 30 minutes');
}

// ── the funnel math ──
{
  const now = 10_000_000_000;
  const old = now - 60 * 60 * 1000;
  const fills = [
    { sid: 'a1', code: 'abc123', done: true, firstAt: old, lastAt: old + 120000, step: 3, last: 'done' },
    { sid: 'a2', code: 'abc123', firstAt: old, lastAt: old + 90000, step: 2, last: 'zip' },
    { sid: 'a3', code: 'abc123', firstAt: now - 600000, lastAt: now - 60000, step: 1, last: 'needs' },
    { sid: 'b1', code: '', firstAt: old, lastAt: old + 30000, step: 1, last: 'recipient' },
    { sid: 'x', code: 'abc123' }, // no sid? has sid — counts; a null guard case below
    null
  ];
  const st = F.formDropStats(fills, now);
  ok(st.total === 5 && st.done === 1 && st.active === 1 && st.abandoned === 3, 'totals: 5 started, 1 finished, 1 still filling, 3 quit');
  ok(st.bySrc['abc123'].starts === 4 && st.bySrc['abc123'].done === 1, 'per-link funnel counts');
  ok(st.bySrc['(direct)'].starts === 1, 'a pulse without a code groups as direct');
  ok(st.srcOrder[0] === 'abc123', 'links sort by volume');
  ok(st.drops.length === 3 && st.drops[0].sid === 'a2', 'the quit list exists and is newest-first');
  ok(F.formDropStats([], now).total === 0, 'empty input stays calm');
}

// ── source labels on the funnel ──
{
  ok(F.formDropSrcLabel('abc123') === 'Facebook · ad', 'a known link shows its platform and method');
  ok(F.formDropSrcLabel('CG-XYZ12') === 'Caregiver referral', 'caregiver-shared codes label without being in the registry');
  ok(/Deleted link gone99/.test(F.formDropSrcLabel('gone99')), 'a deleted link still names its code');
  ok(/Direct/.test(F.formDropSrcLabel('')), 'no code reads as direct');
}

// ── durations read like a human wrote them ──
{
  ok(F.formDropDur(30000) === '30s' && F.formDropDur(95000) === '1m 35s', 'seconds and minutes');
  ok(F.formDropDur(2 * 3600000 + 5 * 60000) === '2h 5m', 'hours');
  ok(F.formDropDur(0) === '' && F.formDropDur(-5) === '', 'zero and negative stay blank');
}

// ── form locks: the pulses themselves ──
{
  ok(/sendBeacon\(WORKER\+'\/fpulse'/.test(form), 'the form pulses via sendBeacon — it survives the tab closing');
  ok(/keepalive:true/.test(form), 'the fetch fallback uses keepalive for the same reason');
  const bodyLine = form.match(/var body=JSON\.stringify\(\{[^}]*\}\);/);
  ok(bodyLine && /sid:tp\.sid,code:CODE,step:tp\.step,last:tp\.last,done:tp\.done/.test(bodyLine[0]), 'a pulse carries ONLY sid, code, step, last, done — never a typed value');
  ok(/sessionStorage\.setItem\('solura_fill_sid'/.test(form), 'the session id survives a mid-fill reload');
  ok(/tpTouch\(key\);/.test(form), 'tapping an answer card counts as starting the form');
  ok(/'i-zip':'zip'/.test(form) && /'i-phone':'phone'/.test(form) && /'i-refclient':'refclient'/.test(form), 'typed fields map to spot keys via focusin');
  ok(/tpSend\(\); \/\/ the "someone started" ping, sent right away/.test(form), 'the FIRST interaction pulses immediately');
  ok(/document\.addEventListener\('visibilitychange'/.test(form) && /window\.addEventListener\('pagehide'/.test(form), 'hiding or closing the tab flushes the pulse — that IS the quit signal');
  ok(/if\(n>tp\.step\)\{tp\.step=n;tpSend\(\);\}/.test(form), 'reaching a new step pulses as a checkpoint');
  ok(/setInterval\(function\(\)\{if\(tp\.dirty\)tpSend\(\);\},20000\);/.test(form), 'a 20s tick covers long quiet stretches');
  ok(/payload\.sid=tp\.sid;/.test(form), 'the submission carries its session id');
  ok(/tp\.done=true;tp\.last='done';tpSend\(\);/.test(form), 'a successful submit closes the session as finished');
}

// ── worker locks: /fpulse + /fpulse/list ──
{
  ok(/path === '\/fpulse' && req\.method === 'POST'/.test(worker), 'the public pulse endpoint exists');
  ok(/FP_SID = \/\^\[a-z0-9\]\{8,20\}\$\//.test(worker) && /if \(!FP_SID\.test\(fpsid\)\) return json\(\{ ok: true \}, 200\);/.test(worker), 'bad session ids get a cheerful ok and no write — bots learn nothing');
  ok(/if \(fstep > \(frec\.step \|\| 0\)\) frec\.step = Math\.min\(fstep, 3\);/.test(worker), 'the furthest step is sticky and capped');
  ok(/if \(fb\.done\) frec\.done = true;/.test(worker), 'done is sticky — a late pulse cannot un-finish a session');
  ok(/'fp:' \+ fpsid/.test(worker) && /expirationTtl: FP_TTL/.test(worker) && /FP_TTL = 30 \* 24 \* 3600/.test(worker), 'one record per session, 30-day TTL');
  ok(/path === '\/fpulse\/list'/.test(worker) && /fltok !== env\.TRACK_TOKEN\) return json\(\{ error: 'unauthorized' \}, 401/.test(worker), 'the list endpoint needs the dashboard token');
  ok(/fdone\.done = true; fdone\.lastAt = Date\.now\(\);/.test(worker), 'a real submission closes its fill session even if the done pulse never lands');
  ok(/fills: fillCount/.test(worker), '/ping reports the session count');
  ok(/7\.6-fill-pulse/.test(worker), 'worker version bumped');
}

// ── dashboard locks: the funnel panel ──
{
  ok(/data-action="formdrop-refresh"/.test(html) && /case 'formdrop-refresh': loadFormDrop\(\); break;/.test(html), 'refresh button wired');
  ok(/loadFormDrop\(\);\}catch\(_\)\{\} \/\/ 📉 the funnel loads itself with Settings/.test(html), 'the funnel loads automatically when Settings opens');
  ok(/\/fpulse\/list\?token='\+encodeURIComponent\(tc\.token\)/.test(html), 'the dashboard reads the token-gated list');
  ok(/needs v7\.6\+/.test(html), 'a 404 names the fix: redeploy the worker');
  ok(/id="formdrop-out"/.test(html) && /📉 Form funnel/.test(html), 'the panel lives under Intake links in Settings');
  ok(/Where people quit/.test(html) && /stopped at <b style="color:var\(--red\)">/.test(html), 'each quit names its exact spot, in red');
  ok(/still filling/.test(html), 'active sessions are shown, not miscounted as quits');
}

console.log('\nForm funnel: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
