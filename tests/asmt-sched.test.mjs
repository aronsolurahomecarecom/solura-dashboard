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
  src + '\nreturn {DEFAULT_ASMTSCHED_SUBJECT,DEFAULT_ASMTSCHED_TEMPLATE,asmtSchedCfg,asmtPrettyTime,fillAsmtSchedTokens,buildAssessmentIcs,icsEsc};');
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

// ── brand parity with Meir's lead emails (B-0911-81) ──
{
  const T = A.DEFAULT_ASMTSCHED_TEMPLATE;
  ok(T.indexOf('#f5f0e8') > -1 && T.indexOf('#faf8f4') > -1, 'warm linen background + cream card (never white)');
  ok(T.indexOf('#C59B4E') > -1 && T.indexOf('#1f3d57') > -1 && T.indexOf('#64A3D1') > -1, 'gold, deep navy, and brand blue all present');
  ok(T.indexOf('solurahomecare.com/wp-content/uploads/2026/01/Solura.png') > -1, 'current logo URL (not the old GitHub one)');
  ok(T.indexOf('meir.jpg') > -1 && T.indexOf('&bull; &bull; &bull;') > -1, 'signature photo + gold dot divider');
  ok(T.indexOf('line-height:2') > -1 && T.indexOf('Georgia') > -1, 'Georgia at double line-height, reads like a letter');
  ok(T.indexOf('License 4574HHN') > -1 && T.indexOf('815 Superior Ave E Ste 1618') > -1 && T.indexOf('www.solurahomecare.com') > -1, 'navy footer: license, address (never service areas), website');
  ok(T.indexOf('—') === -1 && T.indexOf('—') === -1, 'NO em dashes anywhere in the copy (hard brand rule)');
  ok(!/limited|act now|hurry|spots/i.test(T), 'no urgency or scarcity language');
  ok(T.indexOf('reply to this email or call (216) 770-4886') > -1, 'soft reply-or-call close, no sales CTA');
  const filled = A.fillAsmtSchedTokens(T, f);
  ok(filled.indexOf('Your assessor:</strong> Meir Schwimer') > -1, 'assessor named in the visit box');
  ok(filled.indexOf('A few notes for the visit') > -1 && filled.indexOf('#f2efe8') > -1, 'notes render as the brand highlight box');
}
// ── assessor handoff: scheduler → assessment form ──
ok(/enginesDoc\.assessors\[String\(ri\)\]=f\.assessor/.test(html), 'scheduler saves the assessor per lead (synced doc)');
ok(/\(enginesDoc\.assessors\|\|\{\}\)\[String\(ri\)\]/.test(html), 'openAssessment reads the scheduled assessor');
ok(/assessor:schedAssessor,\s*\n\s*assessor_signed_name:schedAssessor/.test(html), 'form prefills BOTH assessor fields from the scheduled name');

// ── 📆 calendar invite (B-0911-82) ──
{
  const cf = { date: '2026-09-15', time: '14:30', location: '123 Superior Ave, Cleveland', assessor: 'Meir Schwimer', notes: 'Dog on premises' };
  const built = A.buildAssessmentIcs(cf, { to: 'karen@x.com', attendeeName: 'Karen Gold', duration: 90 });
  const ics = built.ics;
  ok(ics.indexOf('BEGIN:VCALENDAR') === 0 && ics.indexOf('METHOD:REQUEST') > -1 && ics.indexOf('END:VCALENDAR') > -1, 'valid VCALENDAR with METHOD:REQUEST (shows Accept in mail clients)');
  const expStart = new Date('2026-09-15T14:30:00');
  const p = n => (n < 10 ? '0' : '') + n;
  const utc = d => d.getUTCFullYear() + p(d.getUTCMonth() + 1) + p(d.getUTCDate()) + 'T' + p(d.getUTCHours()) + p(d.getUTCMinutes()) + p(d.getUTCSeconds()) + 'Z';
  ok(ics.indexOf('DTSTART:' + utc(expStart)) > -1, 'start converts local → UTC correctly');
  ok(ics.indexOf('DTEND:' + utc(new Date(expStart.getTime() + 90 * 60000))) > -1, 'end honors the chosen duration (90 min)');
  ok(ics.indexOf('LOCATION:123 Superior Ave\\, Cleveland') > -1, 'commas escaped per RFC 5545');
  ok(ics.indexOf('ORGANIZER;CN=Meir Schwimer:mailto:meir@solurahomecare.com') > -1, 'organizer is Meir');
  ok(ics.indexOf('ATTENDEE;CN=Karen Gold;RSVP=TRUE:mailto:karen@x.com') > -1, 'family attendee with RSVP');
  ok(ics.indexOf('TRIGGER:-PT60M') > -1, '1-hour reminder alarm included');
  ok(ics.indexOf('Dog on premises') > -1, 'notes ride the description');
  ok(built.fileName === 'Solura_Assessment_20260915.ics', 'file named by date');
  const noTo = A.buildAssessmentIcs(cf, { duration: 60 });
  ok(noTo.ics.indexOf('ATTENDEE') === -1, 'no attendee line without a valid email');
  ok(A.buildAssessmentIcs({ date: 'garbage' }, {}) === null, 'unparseable date → null, never a broken invite');
  ok(A.icsEsc('a;b,c\nd') === 'a\\;b\\,c\\nd', 'escaping covers ; , and newlines');
}
ok(/Calendars\.ReadWrite offline_access/.test(html) && (html.match(/Calendars\.ReadWrite/g) || []).length === 2, 'Calendars.ReadWrite added to BOTH the login and refresh scopes');
ok(/gfetch\(GR\+'\/me\/events',\{method:'POST'/.test(html), 'native Outlook event created via Graph');
ok(/attendees=\[\{emailAddress:\{address:em\.to/.test(html), 'family added as attendee → Exchange sends the real invite');
ok(/contentType:'text\/calendar'/.test(html), 'fallback .ics attaches to the confirmation email');
ok(/sign out and back in once to enable full Outlook invites/.test(html), 'fallback explains how to unlock native invites');
ok(/id="as-cal" checked/.test(html) && /id="as-dur"/.test(html), 'invite toggle (default on) + duration picker in the modal');

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
