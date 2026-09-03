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
  src + '\nreturn {normGap,gapIsZero,addGap,gapDaysApprox,gapLabel,parseTimeStr,compileEngine,normSpecials,specialMatches,nurtureParts};');
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

// ── step times (B-0903-71) ──
ok(G.parseTimeStr('14:30') === 14.5 && G.parseTimeStr('08:05') === 8 + 5 / 60 && G.parseTimeStr('0:00') === 0, 'HH:MM parses to decimal hours');
ok(G.parseTimeStr('') === null && G.parseTimeStr('25:00') === null && G.parseTimeStr('9:75') === null && G.parseTimeStr('soon') === null, 'blank/invalid times are null');
{
  const t = G.compileEngine({ id: 't', name: 't', phases: [
    { name: 'A', cadence: 'action', steps: [{ text: 'Call', type: 'call', time: '10:30' }, { text: 'Text', type: 'sms' }] },
    { name: 'W', cadence: 'weekly', weekly: { forever: true, type: 'sms', intervalWeeks: 1, time: '15:00' } },
    { name: 'I', cadence: 'interval', interval: { entries: [{ after: { days: 3 }, type: 'call', time: '9:15' }] } }
  ]});
  ok(t.seq[0].at === 10.5 && t.seq[0].atStr === '10:30', 'action step carries its clock time');
  ok(t.seq[1].at === null && t.seq[1].atStr === '', 'timeless step stays anytime-that-day');
  ok(t.seq[2].at === 15 && t.seq[2].sticky, 'weekly forever carries a time');
  ok(t.seq[3].at === 9.25, 'interval entry carries a time');
}
ok(/function whenToShowCore\(ri\)\{/.test(html) && /var w=whenToShowCore\(ri\);/.test(html), 'whenToShow wraps the core with the time gate');
ok(/parseTimeStr\(followUpTimes\(\)\[String\(ri\)\]\)/.test(html), 'per-lead callback time beats the step time');
ok(/bucket:'later',at:new Date\(td\.getFullYear\(\)/.test(html), 'a timed step waits in Later Today until its clock time');
ok((html.match(/class="ep-fut"/g) || []).length === 3, 'callback time input present in Done, Responded, and Update dialogs');
ok(/if\(fPrev!==\(ftv\|\|''\)\)saveEnginesDoc\(\)/.test(html), 'callback time persists to the synced doc only when changed');
ok(/data-action="ee-add-step" data-pi="'\+pi\+'" data-sttype="sms"/.test(html), 'one-click typed add-step buttons (Text/Call/Email) wired');

// ── ★ special touches in sticky phases (B-0903-72) ──
ok(G.specialMatches({ on: 4, repeatEvery: 0 }, 4) && !G.specialMatches({ on: 4, repeatEvery: 0 }, 5) && !G.specialMatches({ on: 4, repeatEvery: 0 }, 3), 'one-time special fires on its touch only');
ok(G.specialMatches({ on: 2, repeatEvery: 3 }, 2) && G.specialMatches({ on: 2, repeatEvery: 3 }, 5) && G.specialMatches({ on: 2, repeatEvery: 3 }, 8) && !G.specialMatches({ on: 2, repeatEvery: 3 }, 4), 'repeating special fires on 2, 5, 8…');
{
  const eng2 = G.compileEngine({ id: 's', name: 's', phases: [
    { name: 'N', cadence: 'interval', interval: { forever: true, every: { months: 1 }, type: 'sms', template: 'regular text', specials: [
      { on: 3, repeatEvery: 3, mode: 'replace', type: 'email', text: 'Quarterly email', subject: 'Q', template: 'deep value', time: '10:00' },
      { on: 6, repeatEvery: 0, mode: 'beside', type: 'call', text: 'Half-year call' }
    ]}}
  ]});
  const stk = eng2.seq[0];
  ok(stk.sticky && stk.specials.length === 2 && stk.specials[0].mode === 'replace' && stk.specials[0].at === 10, 'specials normalized onto the sticky step');
  let p = G.nurtureParts(stk, '');
  ok(p.cycle === 1 && p.parts.length === 1 && p.parts[0] === stk && p.partsDone === 0, 'fresh lead: cycle 1, plain regular touch');
  p = G.nurtureParts(stk, '2');
  ok(p.cycle === 3 && p.parts.length === 1 && p.parts[0].special === true && p.parts[0].type === 'email' && p.parts[0].template === 'deep value', 'cycle 3: replacement special IS the touch, custom content');
  ok(p.parts[0].sticky === true && p.parts[0].gap && p.parts[0].gap.months === 1, 'replacement keeps the base scheduling (sticky + gap)');
  p = G.nurtureParts(stk, '5');
  ok(p.cycle === 6 && p.parts.length === 2 && p.parts[0].type === 'email' && p.parts[1].type === 'call', 'cycle 6: quarterly replaces AND the beside call queues after');
  p = G.nurtureParts(stk, '5.1');
  ok(p.partsDone === 1 && p.parts[p.partsDone].text === 'Half-year call', 'mid-cycle "5.1": the beside special is the due part');
  p = G.nurtureParts(stk, '5.9');
  ok(p.partsDone === p.parts.length - 1, 'over-long part index clamps (config shrank mid-cycle)');
  p = G.nurtureParts(stk, '3');
  ok(p.cycle === 4 && p.parts.length === 1 && p.parts[0] === stk, 'cycle 4: no special matches — plain regular touch');
}
{
  try { G.compileEngine({ id: 'x', name: 'x', phases: [{ name: 'Z', cadence: 'weekly', weekly: { forever: true, type: 'sms', specials: [{ on: 1, type: 'fax' }] } }] }); ok(false, 'bad special type refused'); }
  catch (err) { ok(err.message.indexOf('special touch') > -1, 'bad special type refused'); }
}
ok(/NCY:30/.test(html), 'nurture cycle counter lives in new column AE (full-width writes stop at AD)');
ok(/u\[C\.NCY\]=\(info9\.cycle-1\)\+'\.'\+\(info9\.partsDone\+1\)/.test(html), 'advanceLead parks mid-cycle when a beside special is queued');
ok(/if\(infP&&infP\.partsDone>0\)return \{bucket:'now',at:today\};/.test(html), 'queued beside special is due right now');
ok(/return inf\.parts\[inf\.partsDone\];/.test(html), 'currentAction presents the due part (composer gets special content)');
ok(html.indexOf('ee-add-special') > -1 && html.indexOf('ee-del-special') > -1, 'special-touch add/delete wired in the editor');
ok((html.match(/specialsEditorHtml\(pi,'(weekly|interval)'/g) || []).length === 2, 'specials editor present in BOTH forever panels');
ok(/writeRow\(3,hU\)/.test(html), 'AE header labeled lazily on load');

// ── {rel} placeholder (B-0903-73) ──
{
  const fb = html.indexOf('/* ⚡FILLNAMES — BEGIN');
  const fe = html.indexOf('/* ⚡FILLNAMES — END */');
  ok(fb > -1 && fe > -1, 'FILLNAMES markers present');
  const fill = new Function(html.slice(html.indexOf('*/', fb) + 2, fe) + '\nreturn fillNames;')();
  ok(fill('Hi {dm}, how is your {rel} {pt} doing?', { dm: 'Karen', pt: 'Miriam', rel: 'Mother' }) === 'Hi Karen, how is your mother Miriam doing?', '{rel} fills lowercased mid-sentence');
  ok(fill('caring for your {rel}', { dm: 'K', pt: 'M', rel: '' }) === 'caring for your loved one', 'blank relationship falls back to loved one');
  ok(fill('as her {relationship}', { dm: 'K', pt: 'M', rel: 'daughter' }) === 'as her daughter', '{relationship} dialect normalizes to {rel}');
  ok(fill('{{rel}} of {pt}', { dm: 'K', pt: 'Miriam', rel: 'son' }) === 'son of Miriam', '{{rel}} dialect normalizes too');
  ok(fill('Hi {dm} and {pt}', { dm: 'Karen', pt: 'Miriam', rel: 'daughter' }) === 'Hi Karen and Miriam', '{dm}/{pt} untouched by the rel addition');
}
ok(/rel:String\(r\[C\.REL\]\|\|''\)\.trim\(\)\.toLowerCase\(\)/.test(html), 'getNames exposes the relationship column');
ok((html.match(/\{dm\}\/\{pt\}\/\{rel\} fill/g) || []).length >= 10, 'editor hints mention {rel} everywhere templates are written');

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
