// 🔑 Stable per-lead keys (B-1012-130). Slices ⚡LEADKEY: every per-lead map
// in the synced engines doc (followUpTimes, engineOverrides, assessors,
// assessments, interviews, leadFacts) keys by the lead's IDENTITY (email →
// phone → name) instead of the row number, because rows shift when the
// sheet is sorted or a row is inserted/deleted — the same staleness that
// B-1012-129 fixed for sent-email attribution. Legacy String(ri) entries
// migrate lazily on first read.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');

let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };

const b = html.indexOf('/* ⚡LEADKEY — BEGIN');
const e = html.indexOf('/* ⚡LEADKEY — END */');
if (b < 0 || e < 0) throw new Error('LEADKEY markers missing');
const src = html.slice(html.indexOf('*/', b) + 2, e);

// ── stubs: a fake sheet the key derives from ──
const rows = [];
const C = { NM: 2, PH: 3, EM: 4, DM: 14 };
const mk = new Function('rows', 'C',
  src + '\nreturn {leadKey,leadMapGet,leadMapSet,leadMapDelete};');
const L = mk(rows, C);

// ── key derivation: email → phone → name → legacy row ──
rows[5] = []; rows[5][C.EM] = '  Karen@Family.COM '; rows[5][C.PH] = '(216) 555-0100'; rows[5][C.NM] = 'Rose Gold';
ok(L.leadKey(5) === 'em:karen@family.com', 'email is the first identity — trimmed + lowercased, and it beats the phone');
rows[6] = []; rows[6][C.PH] = '+1 (216) 555-0188'; rows[6][C.NM] = 'Saul Berg';
ok(L.leadKey(6) === 'ph:2165550188', 'no email → phone: digits only, last 10 (country code dropped, like the voice worker)');
rows[7] = []; rows[7][C.NM] = '  Miriam   Gold ';
ok(L.leadKey(7) === 'nm:miriam gold', 'no email or phone → client name, case- and whitespace-insensitive');
rows[8] = []; rows[8][C.DM] = 'Levi Stein';
ok(L.leadKey(8) === 'nm:levi stein', 'no client name → decision maker fills in');
ok(L.leadKey(9) === '9', 'empty row (or sheet not loaded yet) → legacy row key, no fake identity');

// ── THE RULE: a sort cannot repoint stored values ──
{
  const times = {};
  L.leadMapSet(times, 5, '14:30');
  rows[11] = rows[5]; rows[5] = []; // "sort": Karen moves from row 5 to row 11
  ok(L.leadMapGet(times, 11) === '14:30', 'THE RULE: the value follows the LEAD through a sort, not the row number');
  ok(L.leadMapGet(times, 5) === undefined, 'whatever now sits at the old row inherits nothing');
  rows[5] = rows[11]; rows[11] = undefined; // put the sheet back
}

// ── lazy migration of legacy String(ri) entries ──
{
  const m = { '6': 'track-b' };
  ok(L.leadMapGet(m, 6) === 'track-b', 'a legacy ri-keyed entry still reads');
  ok(m['ph:2165550188'] === 'track-b' && !('6' in m), 'the first read MOVES it onto the stable key — one-time conversion using the current row');
}
{
  const m = { '6': 'old', 'ph:2165550188': 'new' };
  ok(L.leadMapGet(m, 6) === 'new' && m['6'] === 'old', 'an existing stable key wins; the unattributable legacy entry is left alone, never merged over it');
}
{
  const m = { '9': 'kept' };
  ok(L.leadMapGet(m, 9) === 'kept' && m['9'] === 'kept' && Object.keys(m).length === 1, 'an identity-less row keeps the legacy key — a pre-load migration can never strand the entry');
}

// ── writes and deletes retire the legacy key ──
{
  const m = { '6': 'old' };
  L.leadMapSet(m, 6, 'new');
  ok(m['ph:2165550188'] === 'new' && !('6' in m), 'a write lands on the stable key and the legacy key dies with it');
  L.leadMapDelete(m, 6);
  ok(Object.keys(m).length === 0, 'delete clears the stable AND the legacy key');
}

// ── migration persists ──
ok(/queueLeadKeyMigrationSave\(\)/.test(src) && /saveEnginesDoc\(\)\.catch/.test(src), 'a lazy migration schedules a debounced doc save so a later sort cannot replay it against shifted rows');
ok(/normalizations are inlined and[\s\S]{0,20}FROZEN/.test(html), 'the normalizations are marked frozen — these strings persist as keys in the synced doc');

// ── wiring locks: every per-lead map routes through the helpers ──
ok(/leadMapGet\(engineOverrides\(\),ri\)/.test(html) && /leadMapSet\(engineOverrides\(\),ri,engId\)/.test(html) && /leadMapSet\(ovs,ri,engId\)/.test(html) && /leadMapDelete\(ovs,ri\)/.test(html), 'engine overrides: reads, writes (setTrack/restart/add-lead/intake) and the clear all use the stable key');
ok(/leadMapGet\(followUpTimes\(\),ri\)/.test(html) && /leadMapSet\(followUpTimes\(\),ri,f\.time\)/.test(html) && /if\(ftv\)leadMapSet\(fMap,ri,ftv\);else leadMapDelete\(fMap,ri\);/.test(html), 'callback times: queue gate, schedulers, and the edit panel all use the stable key');
ok(/leadMapGet\(schedAssessments\(\),ri\)/.test(html) && /leadMapSet\(schedAssessments\(\),ri,\{date:f\.date/.test(html) && /leadMapDelete\(schedAssessments\(\),ri\)/.test(html), 'assessment bookings: read, remember, and cancel use the stable key');
ok(/leadMapGet\(interviews\(\),ri\)/.test(html) && /leadMapSet\(interviews\(\),ri,\{date:f\.date/.test(html), 'interview bookings use the stable key');
ok(/function assessors\(\)\{enginesDoc\.assessors=enginesDoc\.assessors\|\|\{\};/.test(html) && /leadMapGet\(assessors\(\),ri\)/.test(html) && /leadMapSet\(assessors\(\),ri,f\.assessor\)/.test(html), 'assessors: scheduler write and assessment-form read use the stable key');
ok(/leadMapGet\(leadFactsAll\(\),ri\)/.test(html) && /leadMapSet\(lf,ri9,facts9\)/.test(html), 'lead facts (prefills + pinned invoice rates) use the stable key');
ok(!/(engineOverrides\(\)|followUpTimes\(\)|schedAssessments\(\)|interviews\(\)|leadFactsAll\(\)|enginesDoc\.assessors|enginesDoc\.leadFacts)\[String\((ri|i)\d?\)\]/.test(html), 'NO per-lead map is indexed by raw String(ri) anywhere anymore');

console.log('\nLead keys: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
