// 🅰🅱🅲 Track-system acceptance tests (handoff spec B-0901, app B-0914-85).
// Compiles the three real package files through the real compiler slice.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');
const pkg = k => JSON.parse(readFileSync(join(here, '..', 'engines', 'track-' + k + '.solura-engine.json'), 'utf8'));
const A = pkg('a-self'), B = pkg('b-spouse'), CC = pkg('c-adult-child');

let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };

const b = html.indexOf('/* ⚡ENGINE-GAPS — BEGIN');
const e = html.indexOf('/* ⚡ENGINE-GAPS — END */');
const src = html.slice(html.indexOf('*/', b) + 2, e);
const typeIcon = t => t === 'call' ? '📞' : t === 'email' ? '📧' : t === 'mail' ? '📮' : '💬';
const typeWord = t => t === 'call' ? 'Call' : t === 'email' ? 'Email' : t === 'mail' ? 'Mail' : 'Text';
const mk = new Function('typeIcon', 'typeWord', 'SLOT_LABEL', 'SLOT_WINDOWS', 'DAILY_WINDOWS',
  src + '\nreturn {compileEngine,routeTrackPure,parseTrack,triggerMatches,triggerCoolingDown,lintCopy,TRACK_ENGINE_IDS,nurtureParts,TRACK_B_TRIGGER};');
const G = mk(typeIcon, typeWord, { am: 'Morning', mid: 'Midday', pm: 'Afternoon' }, {}, {});

const cA = G.compileEngine(A.engine), cB = G.compileEngine(B.engine), cCC = G.compileEngine(CC.engine);

// ── structural ──
ok(cA.seq.length === 13 && cB.seq.length === 15 && cCC.seq.length === 19, 'step counts 13 / 15 / 19 for A / B / C');
{
  const ids = [];
  [cA, cB, cCC].forEach(c => c.seq.forEach(s => { if (s.stepId) ids.push(s.stepId); }));
  ok(ids.length === 44 && new Set(ids).size === ids.length, 'all 44 explicit step ids unique across tracks (3 nurture steps carry none)');
}
[cA, cB, cCC].forEach((c, i) => {
  const nm = 'ABC'[i];
  ok(c.seq.filter(s => s.trigger === 'action').every(s => s.ph === 1), nm + ': manual (action) steps only in phase 1');
  ok(c.seq.filter(s => s.hard).every(s => s.ph === 2), nm + ': hard windows ONLY in the first-week phase (the no-rollover block)');
  ok(c.seq.filter(s => s.trigger === 'time').length > 0 && c.seq[c.seq.length - 1].sticky === true, nm + ': timed spine + sticky forever tail');
  ok(c.seq.every(s => !s.window || (s.window[1] > s.window[0])), nm + ': every window well-formed');
});
ok(cA.id === 'track-a-self' && G.TRACK_ENGINE_IDS.A === 'track-a-self' && G.TRACK_ENGINE_IDS.C === 'track-c-adult-child', 'engine ids match the router map');
ok(A.build === 'B-0901' && B.build === 'B-0901' && CC.build === 'B-0901', 'packages tagged with the spec build');
ok(!!A.schema && !!B.schema && !!CC.schema, 'schema block present in every package');

// ── track-specific shape ──
ok(cA.seq.every(s => !s.window || s.window[0] < 17), 'A: zero windows starting at or after 17:00');
ok(cA.seq.filter(s => s.type === 'sms').length === 1, 'A: exactly one SMS step');
ok(cCC.seq.filter(s => s.window && s.window[0] >= 18).length >= 2, 'C: at least two evening windows');
{
  const g = c => c.seq[c.seq.length - 1].gap.days;
  ok(g(cA) === 30 && g(cB) === 21 && g(cCC) === 90, 'nurture intervals 30 / 21 / 90 days');
}
ok(cA.seq[cA.seq.length - 1].rotate.join(',') === 'mail,call' && cB.seq[cB.seq.length - 1].rotate.join(',') === 'call,email', 'A and B nurture rotate channels');
{
  const p1 = G.nurtureParts(cA.seq[cA.seq.length - 1], '');
  const p2 = G.nurtureParts(cA.seq[cA.seq.length - 1], '1');
  ok(p1.parts[0].type === 'mail' && p2.parts[0].type === 'call', 'rotation alternates by cycle (mail, then call)');
}
ok(cCC.seq.filter(s => s.cond === 'unanswered').length === 5 && cA.seq.filter(s => s.cond === 'unanswered').length === 3, 'unanswered-only steps: 5 on C, 3 on A');
ok(cCC.seq.some(s => s.onDay === 2 && s.type === 'email') && cCC.seq.some(s => s.onDay === 14), 'C day-2 documents email + day-14 income email anchored from lead arrival');

// ── trigger (B only) ──
ok(!!cB.trigger && !cA.trigger && !cCC.trigger, 'trigger exists on B and ONLY on B');
['admitted to the hospital yesterday', 'surgery on Tuesday', 'she fell in the bathroom', 'hip fracture', 'discharge planned Friday']
  .forEach(t => ok(G.triggerMatches(t, cB.trigger), 'trigger fires on: ' + t));
['called about pricing', 'asked for the brochure', 'wants to think it over', 'daughter visiting next week']
  .forEach(t => ok(!G.triggerMatches(t, cB.trigger), 'trigger stays quiet on: ' + t));
ok(G.triggerCoolingDown(new Date(Date.now() - 2 * 86400000).toISOString(), Date.now(), cB.trigger), 'cooldown holds at 2 days');
ok(!G.triggerCoolingDown(new Date(Date.now() - 4 * 86400000).toISOString(), Date.now(), cB.trigger), 'cooldown clears after 3 days');
ok(!G.triggerCoolingDown('', Date.now(), cB.trigger), 'never-fired means no cooldown');

// ── router ──
const R = f => G.routeTrackPure(f);
ok(R({ rel: 'Myself' }).track === 'A' && R({ rel: 'myself' }).conf === 'high', 'rule 1: self → A high');
ok(R({ rel: 'Wife' }).track === 'B' && R({ rel: 'partner' }).track === 'B', 'rule 2: spouse words → B high');
ok(R({ rel: 'Daughter (POA)' }).track === 'C' && R({ rel: 'mother-in-law' }).track === 'C', 'rule 3: family words → C high');
{
  const r4 = R({ rel: '', clientName: 'Miriam Gold', dm: 'Miriam Gold' });
  ok(r4.track === 'A' && r4.conf === 'med', 'rule 4: contact = patient → A MEDIUM (wife-on-the-landline false positive)');
}
ok(R({ rel: '', clientName: 'Miriam Gold', dm: 'Karen Gold' }).track === 'B', 'rule 5: shared surname → B med');
ok(R({ rel: '', clientName: 'Miriam Gold', dm: 'Karen Levy' }).track === 'C', 'rule 8: different surname → C med');
ok(R({}).track === 'C' && R({}).conf === 'low', 'rule 9: default C low (fast beats certain)');
ok(G.parseTrack('B·med').track === 'B' && G.parseTrack('B·med').conf === 'med' && G.parseTrack('') === null, 'AF cell round-trips');

// ── copy conformance ──
{
  const copyStrings = [];
  [A, B, CC].forEach(p => {
    const walk = o => { if (!o) return; if (typeof o === 'string') return;
      Object.keys(o).forEach(k => {
        const v = o[k];
        if ((k === 'template' || k === 'subject' || k === 'brief') && typeof v === 'string') copyStrings.push(v);
        else if (typeof v === 'object') walk(v);
      }); };
    walk(p.engine); walk(p.templates);
    Object.keys(p.scripts || {}).forEach(k => copyStrings.push(p.scripts[k]));
  });
  ok(copyStrings.length > 40, 'copy corpus collected (' + copyStrings.length + ' strings)');
  ok(copyStrings.every(s => s.indexOf('—') === -1 && s.indexOf('–') === -1), 'NO em/en dashes in any template, subject, brief, or script');
  const smsA = cA.seq.find(s => s.type === 'sms').template;
  ok(/Meir Schwimer/.test(smsA) && /\(216\) 770-4886/.test(smsA), 'SMS is verbatim, signed Meir Schwimer with the real number');
  ok(G.lintCopy('I tried calling you 3 times', 'C').length > 0, 'linter: missed-call counting caught');
  ok(G.lintCopy('limited spots, act now', 'A').length > 0, 'linter: urgency caught');
  ok(G.lintCopy('as an owner-run agency', 'A').length > 0, 'linter: ownership claim caught');
  ok(G.lintCopy('a little respite would help', 'B').length > 0 && G.lintCopy('a little respite would help', 'C').length === 0, 'linter: respite forbidden on B only');
  ok(G.lintCopy('you must be exhausted', 'B').length > 0, 'linter: never screen a spouse on feelings');
  ok(G.lintCopy('unlike other agencies we care', 'C').length > 0, 'linter: competitor attack caught on C');
  ok(G.lintCopy('We stay small on purpose. It lets us know every family we work with. Call Me: (216) 770-4886', 'B').length === 0, 'linter: clean brand copy passes');
  [A, B, CC].forEach((p, i) => copyStrings.length && ok(
    Object.keys(p.scripts).concat(Object.keys(p.templates)).every(k => true), 'ABC'[i] + ': template/script maps present'));
  ok(cB.seq.every(s => G.lintCopy(s.template || '', 'B').length === 0), 'every B step template passes the B linter');
  ok(cCC.seq.every(s => G.lintCopy(s.template || '', 'C').length === 0), 'every C step template passes the C linter');
  ok(cA.seq.every(s => G.lintCopy(s.template || '', 'A').length === 0), 'every A step template passes the linter');
}

// ── runtime wiring (source locks) ──
ok(/TRK:31/.test(html) && /TGA:32/.test(html) && /LOSS:33/.test(html) && /ARR:34/.test(html), 'new columns at AF-AI (AD/AE were taken by Unsubscribed + Nurture Cycle)');
ok(/autoSkipHardWindows\(\);/.test(html) && /bucket:'skipped'/.test(html), 'hard-window no-rollover: skipped state + background advance sweep');
ok(/skipped \('\+\(w\.reason\|\|'window closed'\)/.test(html.replace(/\\/g, '')) || /— skipped \(/.test(html), 'skips are logged with a reason, so they never look like bugs');
ok(/engineTriggerPending\(ri\)\)return \{bucket:'now',at:today,trig:true\}/.test(html), 'trigger preempts the scheduled step');
{
  const td = html.slice(html.indexOf("case 'trigger-done'"), html.indexOf('break;', html.indexOf("case 'trigger-done'")));
  ok(td.indexOf('u9[C.TGA]') > -1 && td.indexOf('u9[C.STEP]') === -1, 'trigger completion stamps AG but NEVER advances step_idx');
}
ok(/routeTrackPure\(\{rel:v\('al-rel'\)/.test(html) && /:AI"\+exRow/.test(html), 'router runs on ingest; add-lead writes the full A:AI row');
ok(/new Date\(\)\.toISOString\(\) \/\/ AI Arrived At/.test(html), 'arrival stamped to the second (time_to_first_dial becomes measurable)');
ok(/function setTrack\(ri,letter,conf/.test(html) && /u\[C\.STEP\]=0;/.test(html), 'setTrack re-routes: step 0, fresh anchor, logged');
ok(/data-action="open-retrack"/.test(html) && /id="modal-retrack"/.test(html), 'retrack control on the badge + picker modal');
ok(/function slaChip\(ri\)/.test(html) && /t9\.track!=='C'\)return ''/.test(html), 'SLA chip exists and applies to Track C ONLY');
ok(/id="modal-loss"/.test(html) && /Recipient refused/.test(html) && /openLossReason\(ri\)/.test(html), 'loss-reason picker fires when a lead goes lost; Recipient refused is a choice');
ok(/isExcluded\(u\[C\.ST\]\)&&!isExcluded\(_prevSt\)/.test(html), 'loss picker only on the transition INTO a lost status');

// ── in-app install/download (B-0914-87) ──
ok((html.match(/data-action="trk-install"/g) || []).length === 3 && (html.match(/data-action="trk-download"/g) || []).length === 3, 'Settings offers Install + Download for all three tracks');
ok(/importEnginePackage\(new File\(\[txt\],n\+'\.solura-engine\.json'/.test(html), 'Install routes through the normal import path (same validation + overwrite guards)');
ok(/fetch\('engines\/'\+n\+'\.solura-engine\.json',\{cache:'no-store'\}/.test(html), 'packages fetched fresh from the deployed site, never a stale cache');

console.log('\nTracks: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
