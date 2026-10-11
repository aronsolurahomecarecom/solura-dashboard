// 🤝 Interview scheduler (B-1011-126). Slices ⚡INTSCHED: the lead
// interviews US — branded confirmation + .ics invite, quiet Outlook event
// (never an attendee), booking memory for reschedules, and the save SETS
// THE STAGE to Interview Scheduled.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');

let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };

const b = html.indexOf('/* ⚡INTSCHED — BEGIN');
const e = html.indexOf('/* ⚡INTSCHED — END */');
if (b < 0 || e < 0) throw new Error('INTSCHED markers missing');
const src = html.slice(html.indexOf('*/', b) + 2, e);

// ── stubs: only what the pure parts touch ──
const enginesDoc = {};
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mk = new Function('enginesDoc', 'escapeHtml', 'invPrettyDate', 'asmtPrettyTime', 'el',
  src + '\nreturn {interviews,intEmailHtml,intFields};');
const I = mk(enginesDoc, esc, (d) => 'Friday, October 17', (t) => '2:00 PM', () => null);

// ── the booking store ──
ok(I.interviews() === enginesDoc.interviews && typeof I.interviews() === 'object', 'bookings live in the synced, overwrite-guarded config');

// ── the confirmation email ──
{
  const f = { date: '2026-10-17', time: '14:00', location: "Rose's home on Lee Rd", notes: 'Ask us anything about overnight care' };
  const em = I.intEmailHtml(f, false);
  ok(/interview with Solura Home Care, Friday, October 17/.test(em.subject), 'subject names the day');
  ok(/A time to ask us anything/.test(em.html) && /you interview us/.test(em.html), 'the framing is THEIR interview of US');
  ok(/\{dm\}/.test(em.html) && /\{pt\}/.test(em.html), 'name tokens fill per lead at save');
  ok(/Friday, October 17 at 2:00 PM/.test(em.html) && /Rose&#39;s home on Lee Rd|Rose's home on Lee Rd/.test(em.html.replace(/&#?\w+;/g, "'")), 'when + where ride the card');
  ok(/Ask us anything about overnight care/.test(em.html), 'notes ride the card');
  ok(/No forms and no commitments/.test(em.html), 'no-pressure promise, per the brand');
  ok(/Warmly,<br>Meir Schwimer/.test(em.html) && /License 4574HHN/.test(em.html) && /815 Superior Ave E Ste 1618/.test(em.html) && /\(216\) 770-4886/.test(em.html), 'signature + contact block correct');
  ok(/#f5f0e8/.test(em.html) && /#faf8f4/.test(em.html) && /#C59B4E/.test(em.html) && /Georgia/.test(em.html), 'linen/cream/gold Georgia brand shell');
  ok(em.html.indexOf('—') === -1 && em.subject.indexOf('—') === -1, 'no em dashes in outbound copy');
  const noNotes = I.intEmailHtml({ date: '2026-10-17', time: '14:00', location: 'x', notes: '' }, false);
  ok(noNotes.html.indexOf('<b style="color:#1f3d57">Notes:</b>') === -1, 'empty notes = no empty Notes row');
  const virt = I.intEmailHtml({ date: '2026-10-17', time: '14:00', location: 'https://teams.microsoft.com/j/123', notes: '' }, true);
  ok(/Join the call/.test(virt.html) && /https:\/\/teams\.microsoft\.com\/j\/123/.test(virt.html), 'virtual: gold Join button carries the link');
  ok(/video interview with Solura/.test(virt.subject), 'virtual subject says video');
}

// ── source locks: the save flow ──
{
  const sv = src.slice(src.indexOf('async function intSave'));
  ok(/u\[C\.ST\]='Interview Scheduled';/.test(sv) && /u\[C\.NF\]=f\.date;/.test(sv), 'THE STAGE IS SET: status Interview Scheduled, follow-up on the interview date');
  ok(/followUpTimes\(\)\[String\(ri\)\]=f\.time/.test(sv), 'the interview time gates the queue like assessments do');
  ok(!/attendees/.test(sv), 'ONE email, ONE event: the lead is never an attendee');
  ok(/isOnlineMeeting=true;ev\.onlineMeetingProvider='teamsForBusiness'/.test(sv), 'virtual + blank location auto-creates a Teams meeting');
  ok(/uid:\(prev&&prev\.icsUid\)\|\|null,sequence:icsSeqUsed/.test(sv) && /\(\(prev&&prev\.icsSeq\)\|\|0\)\+1/.test(sv), 'reschedules reuse the UID with a bumped SEQUENCE so calendars replace the slot');
  ok(/em\.subject='Rescheduled: '\+em\.subject/.test(sv) && /This interview has a new time/.test(sv), 'a reschedule reads as one, never as a fresh booking');
  ok(/sameMode/.test(sv) && /method:'PATCH'/.test(sv), 'same-mode reschedules MOVE the existing event (Teams link survives)');
  ok(/outcome:isResched\?'interview-rescheduled':'interview-scheduled'/.test(sv), 'comms log records which one happened');
  ok(/stage set to Interview Scheduled/.test(sv), 'the toast names the consequence');
  ok(/interviews\(\)\[String\(ri\)\]=\{date:f\.date/.test(sv), 'the booking is remembered — the next open is a reschedule');
}

// ── source locks: wiring ──
{
  ok(/id="modal-int-sched"/.test(html) && /data-action="int-save"/.test(html), 'scheduler modal with save');
  ok(/data-action="open-int-sched" data-ri="'\+ri\+'"/.test(html), '🤝 Interview rides the Responded/Update dialog footer');
  ok(/'interview scheduled'/.test(html) && /'Interview Scheduled'/.test(html), 'the stage exists in ACTIVE_ST (bucketing) and STATUS_OPTS (dropdowns)');
  ok(/t&&t\.id==='int-virtual'/.test(html), 'the virtual toggle swaps the location line like the assessment one');
  ok(/openIntSched\(riI\)/.test(html) && /closeModal\('modal-log-action'\)/.test(html), 'opens from the Update dialog, closing it first');
}

console.log('\nInterview scheduler: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
