// 📑 Preset emails + 🔤 prefills tests (B-0922-92). Slices the ⚡PRESETS
// region and drives it against a stub enginesDoc.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');

let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };

const b = html.indexOf('/* ⚡PRESETS — BEGIN');
const e = html.indexOf('/* ⚡PRESETS — END */');
if (b < 0 || e < 0) throw new Error('PRESETS markers missing');
const src = html.slice(html.indexOf('*/', b) + 2, e);
const doc = { config: {}, engines: [] };
const mk = new Function('enginesDoc',
  src + '\nreturn {emailPresets,emailFacts,leadFactsAll,leadFact,fillFacts,presetMatch,splitCommaList};');
const P = mk(doc);

// ── prefills: general + per-lead override ──
P.emailFacts().billRate = '30';
P.emailFacts().license = '4574HHN';
ok(P.leadFact(7, 'billRate') === '30', 'general prefill answers for any lead');
P.leadFactsAll()['7'] = { billRate: '35' };
ok(P.leadFact(7, 'billRate') === '35' && P.leadFact(8, 'billRate') === '30', 'per-lead value wins for THAT lead only');
ok(P.leadFact(7, 'nope') === '', 'unknown key → empty, never undefined');
ok(P.fillFacts('Rate is {billRate}/hr, license {license}', 7) === 'Rate is 35/hr, license 4574HHN', 'tokens fill with the lead-specific value');
ok(P.fillFacts('Rate is {billRate}/hr', 8) === 'Rate is 30/hr', 'other leads get the general value');
ok(P.fillFacts('Hi {dm}, rate {billRate}', 8) === 'Hi {dm}, rate 30', 'unknown braces ({dm}) left alone for fillNames');
ok(P.fillFacts('no tokens here', null) === 'no tokens here', 'no-lead fill works on general facts only');

// ── preset matching ──
const ctx = { status: 'On Service', source: 'A Place for Mom', engineId: 'track-c-adult-child', engineName: 'Track C — Adult Child' };
ok(P.presetMatch({}, ctx) && P.presetMatch({ statuses: [], engines: [], sources: [] }, ctx), 'empty assignment = general, shows for everyone');
ok(P.presetMatch({ statuses: ['on service'] }, ctx), 'stage match, case-insensitive');
ok(P.presetMatch({ engines: ['Track C'] }, ctx), 'sequence matches by NAME contains');
ok(P.presetMatch({ engines: ['track-c-adult-child'] }, ctx), 'sequence matches by id too');
ok(P.presetMatch({ sources: ['place for mom'] }, ctx), 'source contains-match');
ok(!P.presetMatch({ statuses: ['Cold'] }, ctx), 'non-matching stage-only preset hidden');
ok(P.presetMatch({ statuses: ['Cold'], sources: ['APFM', 'place for mom'] }, ctx), 'ANY axis matching is enough');
ok(!P.presetMatch({ statuses: ['Cold'] }, { status: '' }), 'blank lead status never matches an assigned preset');
ok(JSON.stringify(P.splitCommaList(' Cold , On Service ,,')) === '["Cold","On Service"]', 'comma lists trimmed and cleaned');

// ── wiring locks ──
ok(/id="email-presets-wrap"/.test(html) && /data-action="toggle-email-presets"/.test(html), 'folded 📑 bar lives in the composer');
ok(/renderEmailPresetsBar\(ri\);/.test(html), 'bar renders per lead on composer open');
ok(/list\.style\.display='none'; \/\/ folded by default/.test(html), 'bar starts folded');
ok(/function insertEmailPreset\(pid\)/.test(html) && /fillNames\(fillFacts\(p\.subject\|\|'',ri\),names\)/.test(html), 'clicking a preset fills subject+body with all tokens resolved');
ok(/id="modal-ep"/.test(html) && /data-action="ep-save"/.test(html) && /data-action="ep-del"/.test(html) && /data-action="ep-new"/.test(html), 'create / edit / delete presets from Settings');
ok(/id="ep-status-list"/.test(html) && /allStatuses\(\)/.test(html), 'assignment inputs suggest from the central registries');
ok(/id="ef-key"/.test(html) && /data-action="ef-add"/.test(html) && /data-action="ef-del"/.test(html), 'general prefills add/remove in Settings');
ok(/data-action="inv-pin-rate"/.test(html) && /\.billRate=rv;/.test(html), '📌 on the invoice pins the rate per client');
ok(/leadFact\(ri,'billRate'\)/.test(html), 'openInvoice auto-fills the pinned (or general) rate');
ok(/renderEmailPresetSettings\(\);\}catch\(_\)\{\}/.test(html), 'Settings render wired');
ok(/enginesDoc\.emailPresets/.test(html) && /enginesDoc\.leadFacts/.test(html), 'presets + lead facts live in the synced, overwrite-guarded doc');

console.log('\nPresets: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
