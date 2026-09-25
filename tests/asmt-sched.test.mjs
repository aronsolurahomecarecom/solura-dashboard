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
  src + '\nreturn {DEFAULT_ASMTSCHED_SUBJECT,DEFAULT_ASMTSCHED_TEMPLATE,asmtSchedCfg,asmtPrettyTime,fillAsmtSchedTokens,buildAssessmentIcs,icsEsc,htmlHasVisibleText,asmtTemplateUsable};');
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

// ── 🕳 never send an empty confirmation (B-0915-89) ──
// A restored engines doc can resurrect a mangled template override that
// renders as NOTHING; the send path must fall back to the built-in.
ok(A.htmlHasVisibleText('<p>Hi Karen</p>') && A.htmlHasVisibleText('plain text'), 'real content counts as visible');
ok(!A.htmlHasVisibleText('') && !A.htmlHasVisibleText('   '), 'blank is blank');
ok(!A.htmlHasVisibleText('<div><p>&nbsp;</p><table><tr><td> </td></tr></table></div>'), 'tag-only skeletons render nothing → treated as empty');
ok(!A.htmlHasVisibleText('<style>.x{color:red}</style><script>var a=1;</script>'), 'style/script bodies are not visible text');
ok(A.htmlHasVisibleText(A.DEFAULT_ASMTSCHED_TEMPLATE), 'the built-in template is definitely visible');
ok(/if\(!htmlHasVisibleText\(html\)\)\{\s*\n\s*html=fillNames\(fillAsmtSchedTokens\(DEFAULT_ASMTSCHED_TEMPLATE/.test(html), 'asBuildEmail swaps a blank-rendering template for the built-in');
ok(/usedFallback\)doneMsg\+=/.test(html) && /↺ Restore in ⚙ Settings → Email/.test(html), 'the fallback is announced with the fix path, never silent');
ok(/if\(!String\(subj\|\|''\)\.trim\(\)\)subj=/.test(html), 'a blank subject falls back too');

// ── 🚫 the blank-email hole, closed for real (B-0923-94) ──
// The old guard counted HIDDEN text: a mangled template that was only the
// display:none preheader line passed it and sent a BLANK email.
ok(!A.asmtTemplateUsable('<div style="display:none;max-height:0">Your in-home visit is confirmed for {date}.</div>'), 'THE bug: preheader-only template (hidden text) is now rejected');
ok(!A.asmtTemplateUsable('<p> </p><table><tr><td>&nbsp;</td></tr></table>'), 'tag skeletons rejected');
ok(!A.asmtTemplateUsable('<p>Hello, see you soon! This note has plenty of text but never mentions when.</p>'), 'a template that never shows the {date} is rejected (a confirmation must confirm a date)');
ok(!A.asmtTemplateUsable(''), 'empty rejected');
ok(A.asmtTemplateUsable(A.DEFAULT_ASMTSCHED_TEMPLATE), 'the built-in passes its own bar');
ok(A.asmtTemplateUsable('<p>Dear {dm}, the visit for {pt} is confirmed for {date} at {time}, at {location}, with {assessor}. Reply anytime.</p>'), 'a sane custom template passes');
CFG = { asmtSchedTemplate: '<div style="display:none">Your in-home visit is confirmed for {date}.</div>' };
{
  const cfg9 = A.asmtSchedCfg();
  ok(cfg9.template === A.DEFAULT_ASMTSCHED_TEMPLATE && cfg9.overrideRejected === true, 'a broken saved override NEVER wins — the built-in sends, flagged');
}
CFG = { asmtSchedTemplate: '<p>Visit for {pt} confirmed {date} at {time}, {location}, with {assessor}. Call anytime.</p>' };
ok(A.asmtSchedCfg().template.indexOf('confirmed {date}') > -1 && !A.asmtSchedCfg().overrideRejected, 'a healthy custom override still wins');
CFG = {};
ok(/asmtTemplateUsable\(storedT\)/.test(html) && /Hit ↺ Restore below and Save/.test(html), 'Settings shows a red border + explanation on a broken saved template');
ok(/var usedFallback=!!ac\.overrideRejected;/.test(html), 'the send path counts a rejected override as a fallback (announced in the toast)');

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
// MERGED design (B-0915-89): ONE email — the confirmation carries the .ics;
// Meir's event has NO attendees so Exchange never sends a second email.
{
  const sv = html.slice(html.indexOf('async function asSave'), html.indexOf('async function asSave') + 12000);
  ok(/if\(isVirtual&&!customLink\)\{ev\.isOnlineMeeting=true;ev\.onlineMeetingProvider='teamsForBusiness';\}/.test(sv), 'blank virtual location auto-creates a TEAMS meeting via the event (no new permission)');
  ok(sv.indexOf('ev.attendees') === -1 && sv.indexOf('attendees=[{') === -1, 'ONE email, ONE event: the lead is never an event attendee (no bare second invite, no duplicate calendar entry)');
  ok(/if\(wantCal&&wantEmail\)\{/.test(sv) && /contentType:'text\/calendar'/.test(sv), 'the .ics rides the branded email for BOTH modes — it IS the invite (Gmail event card up top)');
  ok(/joinUrl=\(ej\.onlineMeeting&&ej\.onlineMeeting\.joinUrl\)\|\|''/.test(sv), 'the Teams join link is read back from the created event');
  ok(/var finalLoc=isVirtual\?\(customLink\|\|joinUrl\):f\.location;/.test(sv), 'his own pasted link wins; Teams is the default');
  ok(/must be a meeting LINK \(https:/.test(sv), 'virtual with a non-link location is refused with guidance');
  ok(/Could not create the Teams meeting/.test(sv), 'auto-Teams failure aborts loudly BEFORE anything is written');
  ok(/calendar event skipped — sign out and back in once to enable it/.test(sv), 'a missing Calendars scope degrades gracefully');
  {
    const vics = A.buildAssessmentIcs({ date: '2026-10-01', time: '10:00', location: 'https://teams.microsoft.com/l/x/1', assessor: 'Meir Schwimer' }, { to: 'k@x.com', duration: 90 });
    ok(vics.ics.indexOf('URL:https://teams.microsoft.com/l/x/1') > -1 && vics.ics.indexOf('video visit') > -1, 'virtual invites carry the join link as URL + say video visit');
  }
}
ok(/id="as-virtual"/.test(html) && /💻 Virtual visit/.test(html), 'the Virtual toggle sits next to the location line');
ok(/Paste a meeting link \(https:/.test(html), 'toggling swaps the location placeholder to link mode');
ok(/Join the video visit<\/a>/.test(html), 'a link location renders as a Join line in the email, not a raw URL');
{
  const vf = A.fillAsmtSchedTokens('<p>{location}</p>', { date: '2026-09-30', location: 'https://teams.microsoft.com/l/meetup-join/xyz' });
  ok(vf.indexOf('href="https://teams.microsoft.com/l/meetup-join/xyz"') > -1 && vf.indexOf('Join the video visit') > -1, 'meeting-link location becomes a clickable Join link');
  ok(A.fillAsmtSchedTokens('<p>{location}</p>', { date: '2026-09-30', location: '123 Superior Ave' }).indexOf('123 Superior Ave') > -1, 'street addresses render as plain text, as before');
}
ok(/id="as-cal" checked/.test(html) && /id="as-dur"/.test(html), 'invite toggle (default on) + duration picker in the modal');
ok(/value="90" selected/.test(html) && /el\('as-dur'\)\)el\('as-dur'\)\.value='90';/.test(html), 'default assessment length is 90 minutes everywhere');
{
  const d90 = A.buildAssessmentIcs({ date: '2026-10-01', time: '10:00' }, { to: 'k@x.com' });
  const p9 = n => (n < 10 ? '0' : '') + n;
  const utc9 = d => d.getUTCFullYear() + p9(d.getUTCMonth() + 1) + p9(d.getUTCDate()) + 'T' + p9(d.getUTCHours()) + p9(d.getUTCMinutes()) + p9(d.getUTCSeconds()) + 'Z';
  ok(d90.ics.indexOf('DTEND:' + utc9(new Date(new Date('2026-10-01T10:00:00').getTime() + 90 * 60000))) > -1, 'unspecified duration builds a 90-minute invite');
}
ok(/one email; they tap Add to calendar/.test(html), 'modal label describes the merged single-email behavior');

// ── conditions on the add-lead form (B-0911-83) ──
ok(/id="al-cond-grid"/.test(html) && /id="al-cond-search"/.test(html), 'add-lead form carries the conditions picker + search');
ok(/serializeConditionList\(_alConds\), \/\/ AC/.test(html), 'picked conditions land in column AC on save');
ok(/_alConds=\[\];\s*\n\s*var acs=el\('al-cond-search'\)/.test(html), 'selection resets every time the form opens');
ok(/_alConds\.indexOf\(c\.k\)>-1\|\|\(q&&match\(c\)\)/.test(html), 'long-tail conditions surface via search and never vanish once selected');

// ── ↺ template restore (B-0914-84) ──
ok((html.match(/data-action="st-restore-tpl"/g) || []).length === 2, 'restore buttons on BOTH the assessment and invoice templates');
ok(/\[\['asmtSchedSubject',DEFAULT_ASMTSCHED_SUBJECT\],\['asmtSchedTemplate',DEFAULT_ASMTSCHED_TEMPLATE\]\]/.test(html), 'assessment restore clears the override and refills with the built-in');
ok(/setCfg\(p\[0\],''\)/.test(html) && /stMarkDirty\(\)/.test(html), 'restore stages a blank override so the built-in wins at send time');

// ── 🏥 in-assessment: age auto-calc + repeated-question prefill (B-0916-90) ──
{
  const pb = html.indexOf('/* ⚡ASMT-PREFILL — BEGIN');
  const pe = html.indexOf('/* ⚡ASMT-PREFILL — END */');
  ok(pb > -1 && pe > -1, 'ASMT-PREFILL markers present');
  const psrc = html.slice(html.indexOf('*/', pb) + 2, pe);
  const st = { data: {}, pre: {} };
  const mkP = new Function('localToday', 'asmtState', 'asmtGet',
    psrc + '\nreturn {asmtAgeFromDob,ASMT_PREFILL,asmtApplyPrefills};');
  const P = mkP(() => new Date(2026, 8, 16), st, k => st.data[k] || '');
  ok(P.asmtAgeFromDob('1941-09-16') === '85' && P.asmtAgeFromDob('1941-09-17') === '84', 'age exact around the birthday (85 on the day, 84 the day before it)');
  ok(P.asmtAgeFromDob('1950-01-01') === '76' && P.asmtAgeFromDob('') === '' && P.asmtAgeFromDob('junk') === '', 'age math + junk-in-nothing-out');
  st.data = { dob: '1941-06-01', primary_language: 'Yiddish', food_prefs: 'Kosher only', ec1_name: 'Karen Gold', ec1_rel: 'Daughter', visit_date_label: '2026-09-16', client_full_legal: 'Miriam Gold', legal_docs: ['Healthcare Power of Attorney'], sleep_pattern: ['Wakes frequently'], sleep_notes: 'worse after 2am' };
  st.pre = {};
  const sec = { fields: [
    { t: 'text', k: 'age' }, { t: 'text', k: 'home_languages' }, { t: 'textarea', k: 'dietary_prefs' },
    { t: 'text', k: 'primary_caregiver' }, { t: 'text', k: 'poa_name' }, { t: 'text', k: 'client_signed_name' },
    { t: 'text', k: 'client_sign_date' }, { t: 'text', k: 'sleep_issues' }, { t: 'text', k: 'client_relationship' }
  ]};
  P.asmtApplyPrefills(sec);
  ok(st.data.age === '85' && st.pre.age === true, 'age prefills from DOB, marked auto-filled');
  ok(st.data.home_languages === 'Yiddish' && st.data.dietary_prefs === 'Kosher only', 'language + dietary answers carry forward');
  ok(st.data.primary_caregiver === 'Karen Gold (Daughter)', 'caregiver composite = contact name (relationship)');
  ok(st.data.poa_name === 'Karen Gold', 'POA name fills ONLY because POA was checked in legal docs');
  ok(st.data.client_signed_name === 'Miriam Gold' && st.data.client_sign_date === '2026-09-16' && st.data.client_relationship === 'Daughter', 'signature page pre-signed with earlier answers');
  ok(st.data.sleep_issues === 'Wakes frequently · worse after 2am', 'sleep issues merge the concern pattern + notes');
  st.data.home_languages = 'English and Yiddish';
  P.asmtApplyPrefills(sec);
  ok(st.data.home_languages === 'English and Yiddish', 'a typed answer is NEVER overwritten by a prefill');
  const st2 = { data: { legal_docs: ['Neither / Unknown'], ec1_name: 'Karen' }, pre: {} };
  const P2 = mkP(() => new Date(2026, 8, 16), st2, k => st2.data[k] || '');
  P2.asmtApplyPrefills({ fields: [{ t: 'text', k: 'poa_name' }] });
  ok(!st2.data.poa_name, 'no POA checked → poa_name stays empty');
}
ok(/if\(k==='dob'\)\{/.test(html) && /asmtAgeFromDob\(e\.target\.value\)/.test(html), 'typing a DOB live-fills the age field');
ok(/AUTO-FILLED<\/span>/.test(html) && /edit freely/.test(html), 'auto-filled fields visibly tagged and editable');
ok(/delete asmtState\.pre\[k\];/.test(html), 'editing clears the auto-filled mark');
ok(/attachLinks\.push\(\{name:fileObj\.name,url:attachUrl\}\)/.test(html), 'uploaded docs keep their OneDrive links');
ok(/Uploaded documents:/.test(html) && /asmtSendIntakeEmail\(leadName,summary,docUrl,attachLinks\)/.test(html), 'doc links ride the finished-assessment email');
ok(/cfg\('asmtIntakeTo'\)\|\|''\)\.trim\(\)\|\|'intake@solurahomecare\.com'/.test(html) && /data-cfg="asmtIntakeTo"/.test(html), 'intake recipient editable in Settings, sensible default');

// ── 🔁 reschedule (B-0925-96) ──
{
  const cf = { date: '2026-09-30', time: '14:00', location: '123 Superior Ave', assessor: 'Meir Schwimer', notes: '' };
  const first = A.buildAssessmentIcs(cf, { to: 'k@x.com', duration: 60 });
  ok(first.ics.indexOf('SEQUENCE:0') > -1 && !!first.uid, 'first invite carries SEQUENCE:0 and returns its UID');
  const moved = A.buildAssessmentIcs({ ...cf, date: '2026-10-02', time: '10:00' }, { to: 'k@x.com', duration: 60, uid: first.uid, sequence: 1 });
  ok(moved.ics.indexOf('UID:' + first.uid) > -1 && moved.ics.indexOf('SEQUENCE:1') > -1, 'reschedule reuses the UID with SEQUENCE:1 — calendars REPLACE the old slot');
  const sv = html.slice(html.indexOf('async function asSave'), html.indexOf('async function asSave') + 14000);
  ok(/var isResched=!!\(prevA&&prevA\.date\);/.test(sv), 'an existing booking makes the save a reschedule');
  ok(/method:'PATCH'/.test(sv), 'same-mode reschedule MOVES the existing event (PATCH) — Teams link + participant survive');
  ok(/function reconstructBooking\(ri\)/.test(html) && /followUpTimes\(\)\[String\(ri\)\]\|\|''/.test(html) && /\(enginesDoc\.assessors\|\|\{\}\)\[String\(ri\)\]/.test(html), 'reconstruction pulls date from NF, time from the queue gate, assessor from the handoff');
  ok(/var prevA=bookingFor\(ri\);/.test(html), 'the scheduler prefills from stored OR reconstructed bookings');
  ok(/method:'DELETE'/.test(sv) && /Mode flipped/.test(sv), 'mode flip retires the old event before creating the new one');
  ok(/em\.subject='Rescheduled: '\+em\.subject;/.test(sv), 'reschedule email subject says Rescheduled');
  ok(/This visit has a new time\.<\/b> It was '\+escapeHtml\(prevWhen\)/.test(sv), 'a banner above the email names the OLD time — never reads as a fresh booking');
  ok(/var prevA=bookingFor\(ri\)\|\|null;/.test(sv), 'reschedule detection uses the stored record OR the sheet reconstruction');
  ok(/\/me\/calendarView\?startDateTime=/.test(sv) && /so it MOVES instead of stacking a duplicate/.test(sv), 'pre-tracking bookings find their event on the old date by subject match');
  ok(/var sameMode=isResched&&moveId&&/.test(sv), 'a found event moves exactly like a tracked one');
  ok(/Assessment RESCHEDULED — was '\+prevWhen\+' → now '\+when/.test(sv), 'sheet note records old time → new time');
  ok(/outcome:isResched\?'assessment-rescheduled':'assessment-scheduled'/.test(sv), 'Comms Log distinguishes reschedules');
  ok(/schedAssessments\(\)\[String\(ri\)\]=\{date:f\.date/.test(sv), 'the booking is remembered (synced doc) for the NEXT reschedule');
  ok(/uid:\(prevA&&prevA\.icsUid\)\|\|null,sequence:icsSeqUsed/.test(sv), '.ics reschedules reuse the UID with a bumped sequence');
}
ok(/id="as-resched-note"/.test(html) && /Rescheduling\.<\/b> Currently:/.test(html), 'the scheduler shows the current booking when reopening');
ok(/sb\.textContent='🔁 Reschedule & notify';/.test(html), 'the save button renames itself in reschedule mode');
ok(/data-action="open-asmt-sched" data-ri="'\+ri\+'" title="Reschedule the assessment/.test(html), '🔁 button rides every Assessment Scheduled lead row');

// ── source-level locks on the flow ──
ok(/id="modal-asmt-sched"/.test(html) && /data-action="as-save"/.test(html) && /data-action="as-preview"/.test(html), 'logger modal with Save & Send + Preview');
ok(/data-action="open-asmt-sched" data-ri/.test(html), '📅 launch button rides the Responded/Update dialog footer');
ok(/u\[C\.ST\]='Assessment Scheduled'/.test(html), 'save stamps the status that unlocks 🏥 Start Assessment');
ok(/u\[C\.NF\]=f\.date/.test(html), 'Follow-Up moves to the assessment date');
ok(/followUpTimes\(\)\[String\(ri\)\]=f\.time/.test(html), 'assessment time gates the due-now queue');
ok(/'assessment-scheduled'/.test(html), 'Comms Log row written with its own outcome');
ok(/Saved to the sheet, but the email failed/.test(html), 'email failure after a successful sheet write says exactly that');
ok(/data-cfg="asmtSchedSubject"/.test(html) && /data-cfg="asmtSchedTemplate"/.test(html), 'subject + template editable in Settings → Email');
ok(/asmtSchedSubject"\],\[data-cfg="asmtSchedTemplate"/.test(html.replace(/\s+/g, '')) || /data-cfg="asmtSchedTemplate"\]'\)/.test(html), 'settings boxes prefill with the built-in as starting point');
ok(!/trackingPixelHtml[\s\S]{0,400}asSave/.test(html.slice(html.indexOf('async function asSave'))), 'confirmation email carries NO tracking pixel');

console.log('\nAssessment scheduler: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
