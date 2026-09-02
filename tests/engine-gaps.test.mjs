// ⏱ Custom-gap cadence tests (B-0902-69): calendar gap math, the new
// 'interval' phase kind (finite entries + forever sticky), and the legacy
// weekly path staying byte-identical. Slices the ⚡ENGINE-GAPS region.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');

let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };

const b = html.indexOf('/* ⚡ENGINE-GAPS — BEGIN');
const e = html.indexOf('/* ⚡ENGINE-GAPS — END */');
if (b < 0 || e < 0) throw new Error('ENGINE-GAPS markers missing');
const src = html.slice(html.indexOf('*/', b) + 2, e);

// Stubs for compileEngine's daily-path dependencies
const typeIcon = t => t === 'call' ? '📞' : t === 'email' ? '📧' : '💬';
const typeWord = t => t === 'call' ? 'Call' : t === 'email' ? 'Email' : 'Text';
const SLOT_LABEL = { am: 'Morning', mid: 'Midday', pm: 'Afternoon' };
const SLOT_WINDOWS = { am: {}, mid: {}, pm: {} };
const DAILY_WINDOWS = { callAm: [8, 13], smsAm: [8, 17], callPm: [12, 16], smsPm: [11, 16] };

const mk = new Function('typeIcon', 'typeWord', 'SLOT_LABEL', 'SLOT_WINDOWS', 'DAILY_WINDOWS',
  src + '\nreturn {normGap,gapIsZero,addGap,gapDaysApprox,gapLabel,compileEngine};');
const G = mk(typeIcon, typeWord, SLOT_LABEL, SLOT_WINDOWS, DAILY_WINDOWS);

// ── gap math ──
const d = (y, m, dd) => new Date(y, m, dd);
const eq = (a, bb) => a.getFullYear() === bb.getFullYear() && a.getMonth() === bb.getMonth() && a.getDate() === bb.getDate();
ok(eq(G.addGap(d(2026, 0, 15), { weeks: 2, days: 3 }), d(2026, 1, 1)), 'Jan 15 + 2 wks + 3 days = Feb 1');
ok(eq(G.addGap(d(2026, 0, 31), { months: 1 }), d(2026, 1, 28)), 'Jan 31 + 1 month clamps to Feb 28 (never Mar 3)');
ok(eq(G.addGap(d(2024, 1, 29), { years: 1 }), d(2025, 1, 28)), 'Feb 29 leap + 1 year clamps to Feb 28');
ok(eq(G.addGap(d(2026, 5, 10), { months: 1, days: 5 }), d(2026, 6, 15)), 'month+day combo: Jun 10 + 1 mo + 5 d = Jul 15');
ok(eq(G.addGap(d(2026, 10, 30), { months: 3 }), d(2027, 1, 28)), 'year rollover: Nov 30 + 3 mo = Feb 28');
ok(G.gapDaysApprox({ years: 1, months: 2, weeks: 3, days: 4 }) === 365 + 60 + 21 + 4, 'approx days for backdating');
ok(G.gapIsZero({}) && G.gapIsZero({ days: 0 }) && !G.gapIsZero({ days: 1 }), 'zero-gap detection');
ok(G.gapLabel({ weeks: 2, days: 3 }) === '2 wks + 3 days', 'label: 2 wks + 3 days');
ok(G.gapLabel({ months: 1 }) === '1 mo' && G.gapLabel({ years: 1 }) === '1 yr', 'labels: 1 mo, 1 yr');

// ── interval cadence compiles ──
const eng = {
  id: 'gap-test', name: 'Gap Test', phases: [
    { name: 'First Touch', cadence: 'action', steps: [{ icon: '💬', text: 'Intro text', type: 'sms' }] },
    { name: 'Long Tail', cadence: 'interval', interval: { entries: [
      { after: { weeks: 2, days: 3 }, type: 'sms', template: 'hey {dm}' },
      { after: { months: 1 }, type: 'email', subject: 'Care for {pt}', template: 'Hi {dm}' },
      { after: { years: 1 }, type: 'call', text: 'Anniversary call' }
    ]}},
    { name: 'Forever', cadence: 'interval', interval: { forever: true, every: { months: 1, weeks: 1 }, type: 'email', subject: 'S', template: 'T' } }
  ]
};
const c = G.compileEngine(eng);
ok(c.seq.length === 5, 'compiles to 5 steps (1 action + 3 timed + 1 sticky)');
const s1 = c.seq[1], s2 = c.seq[2], s3 = c.seq[3], s4 = c.seq[4];
ok(s1.cadence === 'interval' && s1.trigger === 'time' && !s1.sticky, 'entry step is a timed, non-sticky interval step');
ok(JSON.stringify(s1.gap) === JSON.stringify({ years: 0, months: 0, weeks: 2, days: 3 }), 'gap normalized onto the step');
ok(s1.text === 'Follow-up after 2 wks + 3 days', 'default label names the wait');
ok(s2.type === 'email' && s2.subject === 'Care for {pt}' && s2.template === 'Hi {dm}', 'subject + template ride the entry');
ok(s3.text === 'Anniversary call' && s3.gap.years === 1, 'custom label wins; year gap kept');
ok(s4.sticky === true && s4.gap.months === 1 && s4.gap.weeks === 1, 'forever compiles sticky with a combined gap');
ok(s4.subject === 'S' && s4.template === 'T', 'forever carries subject + template');

// ── validation ──
const bad = (phases, frag, name) => {
  try { G.compileEngine({ id: 'x', name: 'x', phases }); ok(false, name); }
  catch (err) { ok(err.message.indexOf(frag) > -1, name + ' (got: ' + err.message + ')'); }
};
bad([{ name: 'Z', cadence: 'interval', interval: { entries: [{ after: {}, type: 'sms' }] } }], 'needs a wait time', 'zero gap refused');
bad([{ name: 'Z', cadence: 'interval', interval: { entries: [] } }], 'has no entries', 'empty entries refused');
bad([{ name: 'Z', cadence: 'interval', interval: { forever: true, every: {} } }], 'non-zero repeat gap', 'forever zero gap refused');
bad([{ name: 'Z', cadence: 'interval', interval: { entries: [{ after: { days: 1 }, type: 'fax' }] } }], 'Bad type', 'unknown type refused');

// ── legacy paths untouched ──
const legacy = G.compileEngine({ id: 'l', name: 'l', phases: [
  { name: 'W', cadence: 'weekly', weekly: { entries: [{ week: 2, type: 'sms' }] } },
  { name: 'N', cadence: 'weekly', weekly: { forever: true, type: 'sms', intervalWeeks: 2 } }
]});
ok(legacy.seq[0].week === 2 && legacy.seq[0].cadence === 'weekly' && !legacy.seq[0].gap, 'weekly entries compile exactly as before (no gap field)');
ok(legacy.seq[1].sticky && legacy.seq[1].intervalWeeks === 2 && !legacy.seq[1].gap, 'weekly forever keeps intervalWeeks, no gap');

// ── source-level locks on scheduling + UI wiring ──
ok(/cadence==='interval'\)\{\s*\n\s*var doneG=getStepDoneAt/.test(html), 'whenToShow schedules interval steps from last completion + gap');
ok(/if\(cur\.gap\)\{u\[C\.NF\]=fd\(addGap\(t,cur\.gap\)\);\}/.test(html), 'sticky advance uses the gap for the next Follow-Up date');
ok(/nextAction\.cadence==='interval'&&nextAction\.gap/.test(html), 'entering a gap step stamps NF with its real due date');
ok(/step\.gap\?gapDaysApprox\(step\.gap\)/.test(html), 'fresh sticky enrollment backdates by the gap (first touch due today)');
ok(/return !!\(a&&a\.sticky\);/.test(html), 'isNurtureStep counts ANY sticky step (newsletter eligibility includes gap nurture)');
ok(html.indexOf('value="forever">♾ Forever nurture') > -1, 'Add-phase menu has a first-class Forever option');
ok(html.indexOf('value="interval">⏱ Custom gaps') > -1, 'Add-phase menu has the Custom gaps cadence');
ok(html.indexOf('ee-add-ientry') > -1 && html.indexOf('ee-del-ientry') > -1, 'interval entry add/delete handlers wired');
ok((html.match(/♾ Forever \(sticky/g) || []).length >= 2, 'Forever checkbox is ♾-labelled in both weekly and interval editors');

console.log('\nEngine gaps: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
