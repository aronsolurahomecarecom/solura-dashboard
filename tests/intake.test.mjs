// 📥 Client intake form tests (B-1007-107). Slices ⚡INTAKE and drives it
// with stubs; also locks the worker's queue endpoints and the public form.
// The core rules: outsiders never touch the sheet (form → worker KV only),
// the Source cell comes from the link (platform · method), submissions
// import exactly once, and the honeypot swallows bots.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');
const worker = readFileSync(join(here, '..', 'solura-track-worker.js'), 'utf8');
const form = readFileSync(join(here, '..', 'care', 'index.html'), 'utf8');
const stub = readFileSync(join(here, '..', 'Solura_Intake_Form.html'), 'utf8');

let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };

const b = html.indexOf('/* ⚡INTAKE — BEGIN');
const e = html.indexOf('/* ⚡INTAKE — END */');
if (b < 0 || e < 0) throw new Error('INTAKE markers missing');
const src = html.slice(html.indexOf('*/', b) + 2, e);

// ── stub environment (pure helpers only — poll/create are source-locked) ──
const enginesDoc = { config: {} };
const names = ['enginesDoc', 'routeTrackPure', 'stepLabel', 'localStorage'];
const mk = new Function(...names, src + '\nreturn {intakeLinks,makeIntakeCode,intakeUrlFor,intakeWorkerParam,intakeSourceString,intakeLinkByCode,groupIntakeLinks,intakeLeadVals};');
const I = mk(enginesDoc, () => ({ track: 'C', conf: 'high' }), () => 'Phase 1 — Day 1', { getItem: () => null, setItem: () => {} });

// ── link codes + URLs ──
{
  const code = I.makeIntakeCode('Facebook Ads!');
  ok(/^facebook-[a-z0-9]{5}$/.test(code), 'codes are platform-slug + random (readable in analytics)');
  ok(I.makeIntakeCode('???').indexOf('x-') === 0, 'symbol-only platforms still get a valid code');
  const link = { code: 'fb-abc12', platform: 'Facebook', method: 'DM' };
  const url = I.intakeUrlFor(link, { url: 'https://trk.example.workers.dev', token: 't' });
  ok(url.indexOf('https://apply.solurahomecare.com/care/?c=fb-abc12') === 0, 'short path: /care/ instead of the long filename');
  ok(url.indexOf('&w=trk.example') > -1 && url.indexOf('workers.dev') === -1, 'workers.dev shrinks to name.account — just a few characters, like the hiring links');
  ok(I.intakeWorkerParam('https://solura-track.meir-865.workers.dev') === 'solura-track', 'on OUR account only the worker NAME rides — the form assumes meir-865');
  ok(I.intakeWorkerParam('https://trk.example.workers.dev/') === 'trk.example', 'other accounts keep name.account; trailing slash tolerated');
  ok(I.intakeWorkerParam('https://track.solurahomecare.com') === 'https://track.solurahomecare.com', 'a custom domain rides whole (the form accepts both forms)');
  ok(I.intakeUrlFor(link, null).indexOf('&w=') === -1, 'no tracker configured = URL still generates (form says call us)');
  ok(/if\(wp&&wp!==INTAKE_BAKED_WORKER\)/.test(src), 'bake slot: once the worker is baked into the form, links drop w entirely');
  const short = I.intakeUrlFor(link, { url: 'https://falling-rain-de79.meir-865.workers.dev', token: 't' });
  ok(short === 'https://apply.solurahomecare.com/care/?c=fb-abc12', 'THE REAL LINK: hiring-portal short — path + code, nothing else');
  ok(/location\.replace\('\/care\/'\+location\.search\+location\.hash\)/.test(stub), 'the old long URL still works — it forwards to /care/ with the code intact');
}

// ── the Source cell ──
{
  ok(I.intakeSourceString({ platform: 'Facebook', method: 'DM' }) === 'Facebook · DM', 'source = platform · method');
  ok(I.intakeSourceString({ platform: 'Google', method: '' }) === 'Google', 'method optional — platform alone');
  ok(I.intakeSourceString(null) === 'Intake form', 'unknown/deleted link still yields a real source string');
}

// ── lookup + grouping ──
{
  enginesDoc.config.intakeLinks = [
    { id: '1', code: 'fb-1', platform: 'Facebook' },
    { id: '2', code: 'gg-1', platform: 'Google' },
    { id: '3', code: 'fb-2', platform: 'Facebook' },
  ];
  ok(I.intakeLinkByCode('gg-1').id === '2' && I.intakeLinkByCode('nope') === null, 'submissions map back to their link by code');
  const g = I.groupIntakeLinks(I.intakeLinks());
  ok(g.length === 2 && g[0].platform === 'Facebook' && g[0].links.length === 2 && g[1].platform === 'Google', 'links group by platform');
}

// ── submission → sheet row ──
{
  const sub = { name: 'Susan Gold', phone: '(216) 555-0100', email: 's@x.com', pt: 'Rose Gold', rel: 'Parent', zip: '44118', notes: 'Mom needs help mornings',
    needs: 'Personal care, Memory care', timeline: 'Next few weeks', hours: 'Several hours most days', pay: 'Private pay',
    best: 'Evening', sms: 'yes (sms-v1-2026-10)', variant: 'full' };
  const link = { code: 'fb-1', platform: 'Facebook', method: 'DM' };
  const v = I.intakeLeadVals(sub, link, '10/7/2026', '2026-10-07T12:00:00.000Z');
  ok(v.length === 35, 'row spans exactly A:AI (35 columns, same as Add Lead)');
  ok(v[2] === 'Rose Gold' && v[14] === 'Susan Gold', 'patient named → client cell; the filler becomes Decision Maker');
  ok(v[6] === 'Facebook · DM', 'SOURCE CELL populated from the link: platform · method');
  ok(v[10] === 'New' && v[13] === '10/7/2026' && v[1] === '10/7/2026', 'status New, follow-up today — lands in Due Now');
  ok(v[3] === '(216) 555-0100' && v[4] === 's@x.com' && v[5] === '44118', 'phone/email/area carried');
  ok(v[7] === 'Personal care, Memory care' && v[8] === 'Several hours most days' && v[9] === 'Next few weeks' && v[15] === 'Private pay',
    'inquiry answers land in their REAL columns: Services, Hrs/Wk, Est. Start, Pay Type');
  ok(v[18].indexOf('Their words: "Mom needs help mornings"') > -1 && v[18].indexOf('Facebook · DM') > -1, 'their message lands in Notes with the source');
  ok(v[18].indexOf('Best time to reach: Evening') > -1 && v[18].indexOf('✅ SMS consent given on the form (yes (sms-v1-2026-10))') > -1,
    'best time + SMS consent (with version) recorded in Notes — the TCPA paper trail');
  ok(v[23] === 'Parent' && v[25] === 0 && v[31] === 'C·high' && v[34] === '2026-10-07T12:00:00.000Z', 'relationship, step 0, track verdict, arrival stamp');
  const solo = I.intakeLeadVals({ name: 'Joe Levin', phone: '1' }, null, '10/7/2026', 'iso');
  ok(solo[2] === 'Joe Levin' && solo[14] === '', 'no patient named → filler IS the client, no duplicate DM');
  const ref = I.intakeLeadVals({ name: 'Jordan Ellis', phone: '(216) 555-0147', pt: 'Ruth', rel: 'Client/Patient',
    org: 'Lakeshore Rehabilitation Center', needs: 'Hospital/rehab return', variant: 'referral' }, link, '10/7/2026', 'iso');
  ok(ref[2] === 'Ruth' && ref[14] === 'Jordan Ellis' && ref[18].indexOf('Referring organization: Lakeshore Rehabilitation Center') > -1
    && ref[18].indexOf('professional referral form') > -1, 'professional referrals: client is the lead, referrer is DM, org in Notes');
}

// ── worker queue locks ──
{
  ok(/path === '\/intake' && req\.method === 'POST'/.test(worker), 'worker accepts public form POSTs');
  ok(/if \(ib\.hp\) return json\(\{ ok: true \}, 200\)/.test(worker), 'honeypot submissions swallowed silently (bots think they won)');
  ok(/if \(!inm \|\| \(!iph && !iem\)\)/.test(worker), 'worker enforces name + (phone OR email) — the dashboard gate');
  ok(/'intake:' \+ sub\.ts/.test(worker) && /INTAKE_TTL/.test(worker), 'submissions queue in KV with a TTL');
  ok(/path === '\/intake\/list'/.test(worker) && /itok !== env\.TRACK_TOKEN\) return json\(\{ error: 'unauthorized' \}, 401/.test(worker), 'listing requires the dashboard token — outsiders read nothing');
  ok(/path === '\/intake\/ack'/.test(worker) && /kk\.indexOf\('intake:'\) === 0/.test(worker), 'ack deletes ONLY intake keys (tracking events untouchable)');
  ok(/'GET,POST,OPTIONS'/.test(worker), 'CORS allows the form POST');
  ok(worker.indexOf('graph.microsoft.com') === -1, 'the worker NEVER talks to the sheet — only the signed-in dashboard does');
}

// ── public form locks ──
{
  ok(/fetch\(WORKER\+'\/intake'/.test(form), 'form posts to the worker queue, nothing else');
  ok(form.indexOf('graph.microsoft.com') === -1 && form.indexOf('login.microsoftonline') === -1, 'form holds no Graph/auth code at all');
  ok(/id="i-website"/.test(form) && /hp:el\('i-website'\)\.value/.test(form), 'honeypot field rides every submit');
  ok(/qs\.get\('c'\)/.test(form) && /qs\.get\('w'\)/.test(form), 'form reads the link code + worker origin from the URL');
  ok(/function expandWorker/.test(form) && /\.workers\.dev/.test(form), 'the short w (name.account) expands to the full workers.dev origin');
  ok(/var WORKER_ACCOUNT='meir-865'/.test(form) && /'https:\/\/'\+w\+'\.'\+WORKER_ACCOUNT\+'\.workers\.dev'/.test(form), 'a bare worker NAME expands on our own account — links carry just a few characters');
  ok(/var WORKER_DEFAULT='https:\/\/falling-rain-de79\.meir-865\.workers\.dev'/.test(form), 'the real worker is BAKED IN — links need only ?c=code');
  ok(/expandWorker\(qs\.get\('w'\)\)\|\|WORKER_DEFAULT/.test(form), 'URL w wins, baked default is the fallback');
  ok(/if\(!phone&&!email\)return;/.test(form) && /if\(!name\)return;/.test(form), 'client-side gate backstops the worker gate');
  ok(/if\(!first\)/.test(form) && /if\(!n\)\{setErr\('e-phone',MISSING_PHONE\)/.test(form) && /n<10/.test(form), 'design validation: first name + 10-digit phone, errors clear on typing');
  ok(/\(216\) 770-4886/.test(form) && /License 4574HHN/.test(form) && /815 Superior Ave E Ste 1618/.test(form), 'brand contact block present');
  ok(form.indexOf('—') === -1, 'no em dashes anywhere in the outbound-facing form');
  ok(/name="robots" content="noindex"/.test(form), 'form stays out of search engines');
  // The board design's substance
  ok(/id="step1"/.test(form) && /id="step2"/.test(form) && /id="step3"/.test(form) && /Step '\+n\+' of 3/.test(form), 'three-step flow with a live progress bar');
  ok(/!\/\^44\[01\]\/\.test\(this\.value\)/.test(form) && /outside where we currently provide care/.test(form), 'ZIP soft check: 440xx/441xx in area, notice never blocks submit');
  ok(/id="referral"/.test(form) && /variant:'referral',org:ro/.test(form), 'professional referral branch submits its own variant with the organization');
  ok(/sms-v1-2026-10/.test(form) && /Reply STOP to opt out/.test(form), 'SMS consent checkbox carries the TCPA language + a consent version');
  ok(/Solura_Application_Form\.html\?src=GNG6XK/.test(form) && /Looking for a caregiver job\?/.test(form), 'job seekers get the Apply here link with the GNG6XK source code');
  ok(/needs:st\.needs\.join\(', '\)/.test(form) && /timeline:st\.timeline/.test(form) && /hours:st\.hours/.test(form) && /pay:st\.payment/.test(form), 'tap-card answers ride the payload as readable labels');
  ok(/\[aria-invalid="true"\] \{ border: 3px solid #9a4510/.test(form), 'error fields get the 3px border — color is never the only signal');
  ok(/images\/team-photo\.jpg/.test(form) && /images\/trust-photo\.jpg/.test(form), 'compressed photos, not the 7MB originals');
}

// ── dashboard wiring locks ──
{
  ok(/data-sec="intake"/.test(html) && /id="st-sec-intake"/.test(html), 'Intake links section lives in Settings');
  ok(/case 'intake-new':/.test(html) && /makeIntakeCode\(p\)/.test(html), 'create-link flow generates a unique code per platform');
  ok(/intakeLinks\(\)\.push\(l\);\s*\n\s*renderIntakeLinks\(\);/.test(html), 'create is INSTANT: the link renders before the background config sync');
  ok(/Link created, but syncing it failed/.test(html), 'a failed background sync is loud, not silent');
  ok(/case 'intake-copy':/.test(html) && /navigator\.clipboard\.writeText/.test(html), 'one-click URL copy');
  ok(/onchange="intakeNoteChanged\(this\)"/.test(html) && /function intakeNoteChanged/.test(html), 'internal notes editable per link, saved to the synced config');
  ok(/groupIntakeLinks\(L\)\.map/.test(html), 'the list renders grouped by platform');
  ok(/pollIntake\(\)\.catch\(function\(\)\{\}\); \/\/ 📥 intake-form submissions ride the same cadence/.test(html), 'poller runs on the standing 60s cadence');
  ok(/await fetch\(tc\.url\+'\/intake\/ack\?token='/.test(html), 'imported submissions are acked (deleted) so they never double-import');
  ok(/seen\[sub\.key\]\|\|_intakeSeen\[sub\.key\]/.test(html), 'seen-guard: a failed ack still cannot double-create on later polls');
  ok(/link\.fills=\(link\.fills\|\|0\)\+1/.test(html), 'each fill counts on its link');
  ok(/range\(address='A"\+exRow\+":AI"\+exRow\+"'\)"/.test(html.replace(/\\/g, '')) || /A"\+exRow\+":AI"\+exRow/.test(html), 'intake leads append the full A:AI row like Add Lead');
  ok(/function intakeTestConnection/.test(html) && /worker is outdated/.test(html), 'Test connection explains when the worker needs the new code');
}

console.log('\nIntake: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
