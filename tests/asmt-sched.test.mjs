// 📅 Assessment-scheduled logger tests (B-0911-80). The module lives inside
// the 🧾 INVOICING slice (it shares invPrettyDate), so the same slice+stubs
// serve both suites.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');

let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };

const b = html.indexOf('/* ─── 🧾 INVOICING — BEGIN');
const e = html.indexOf('/* 🧾 INVOICING — END */');
if (b < 0 || e < 0) throw new Error('INVOICING markers missing');
const src = html.slice(html.indexOf('*/', b) + 2, e);

let CFG = {};
const cfgStub = k => CFG[k];
const escapeHtml = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const mk = new Function('cfg', 'lc', 'escapeHtml',
  src + '\nreturn {DEFAULT_ASMTSCHED_SUBJECT,DEFAULT_ASMTSCHED_TEMPLATE,asmtSchedCfg,asmtPrettyTime,fillAsmtSchedTokens};');
const A = mk(cfgStub, s => String(s || '').toLowerCase(), escapeHtml);

// ── time prettifier ──
ok(A.asmtPrettyTime('14:30') === '2:30 PM' && A.asmtPrettyTime('09:05') === '9:05 AM', '24h times render as friendly AM/PM');
ok(A.asmtPrettyTime('00:15') === '12:15 AM' && A.asmtPrettyTime('12:00') === '12:00 PM', 'midnight and noon edges correct');
ok(A.asmtPrettyTime('') === '' && A.asmtPrettyTime('soonish') === 'soonish', 'blank/odd values pass through');

// ── config defaults + override ──
ok(A.asmtSchedCfg().subject === A.DEFAULT_ASMTSCHED_SUBJECT && A.asmtSchedCfg().template === A.DEFAULT_ASMTSCHED_TEMPLATE, 'blank config → built-in subject + template');
CFG = { asmtSchedSubject: 'See you {date}!', asmtSchedTemplate: '<p>{dm}, {date} {time} at {location} with {assessor}</p>{notes}' };
ok(A.asmtSchedCfg().subject === 'See you {date}!', 'custom subject wins');

// ── token filling ──
const f = { date: '2026-09-15', time: '14:30', assessor: 'Meir Schwimer', location: '123 Superior Ave', notes: 'Dog on premises\nUse side door' };
const out = A.fillAsmtSchedTokens(A.asmtSchedCfg().template, f);
ok(out.indexOf('Sep 15, 2026') > -1 && out.indexOf('2:30 PM') > -1, 'date and time pretty-filled');
ok(out.indexOf('123 Superior Ave') > -1 && out.indexOf('Meir Schwimer') > -1, 'location and assessor filled');
ok(out.indexOf('Dog on premises<br>Use side door') > -1 && out.indexOf('A few notes for the visit') > -1, 'notes render as the styled box, line breaks kept');
const noNotes = A.fillAsmtSchedTokens('X{notes}Y', { date: '2026-09-15' });
ok(noNotes === 'XY', 'empty notes vanish entirely');
const noTime = A.fillAsmtSchedTokens('<p>{time} · {location} · {assessor}</p>', { date: '2026-09-15' });
ok(noTime.indexOf('confirm the time shortly') > -1 && noTime.indexOf('Your home') > -1 && noTime.indexOf('The Solura team') > -1, 'blank time/location/assessor get graceful fallbacks');
const evil = A.fillAsmtSchedTokens('{location}{notes}', { location: '<img onerror=x>', notes: '<script>' });
ok(evil.indexOf('<img') === -1 && evil.indexOf('<script>') === -1, 'location and notes are HTML-escaped');
CFG = {};
const dflt = A.fillAsmtSchedTokens(A.DEFAULT_ASMTSCHED_TEMPLATE, f);
ok(['{date}', '{time}', '{location}', '{assessor}', '{notes}'].every(t => dflt.indexOf(t) === -1), 'built-in template has no leftover tokens');
ok(dflt.indexOf('{dm}') > -1 && dflt.indexOf('{pt}') > -1, 'name tokens survive for the fillNames pass');

// ── source-level locks on the flow ──
ok(/id="modal-asmt-sched"/.test(html) && /data-action="as-save"/.test(html) && /data-action="as-preview"/.test(html), 'logger modal with Save & Send + Preview');
ok(/data-action="open-asmt-sched" data-ri/.test(html), '📅 launch button rides the Responded/Update dialog footer');
ok(/u\[C\.ST\]='Assessment Scheduled'/.test(html), 'save stamps the status that unlocks 🏥 Start Assessment');
ok(/u\[C\.NF\]=f\.date/.test(html), 'Follow-Up moves to the assessment date');
ok(/followUpTimes\(\)\[String\(ri\)\]=f\.time/.test(html), 'assessment time gates the due-now queue');
ok(/outcome:'assessment-scheduled'/.test(html), 'Comms Log row written with its own outcome');
ok(/Saved to the sheet, but the email failed/.test(html), 'email failure after a successful sheet write says exactly that');
ok(/data-cfg="asmtSchedSubject"/.test(html) && /data-cfg="asmtSchedTemplate"/.test(html), 'subject + template editable in Settings → Email');
ok(/asmtSchedSubject"\],\[data-cfg="asmtSchedTemplate"/.test(html.replace(/\s+/g, '')) || /data-cfg="asmtSchedTemplate"\]'\)/.test(html), 'settings boxes prefill with the built-in as starting point');
ok(!/trackingPixelHtml[\s\S]{0,400}asSave/.test(html.slice(html.indexOf('async function asSave'))), 'confirmation email carries NO tracking pixel');

console.log('\nAssessment scheduler: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
