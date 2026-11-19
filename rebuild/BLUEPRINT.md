# Solura Lead Dashboard Rebuild Blueprint

Reviewed: the 24 test suites in `tests/`, `Solura_Dashboard.html` (build B-1118-165, ~1MB single file), `solura-track-worker.js` (v7.7), `care/index.html`, and the Referral Agent Cockpit doctrine in `CLAUDE.md`. This document is the full inventory of what exists, the target architecture on Vercel + Supabase + Twilio, what gets left behind, how data moves, the decisions only Meir can make, and the raw material for a design brief.

A note on reading section 1: KEEP means rebuild the behavior as is. REWORK means keep the capability but change how it is built. FOLD-IN means it stops being its own feature and becomes a natural property of the new platform. DROP means it exists only because of the old substrate and should not be rebuilt.

---

## 1. Complete capability inventory

### Leads & queue

| Capability | What it does | Verdict |
|---|---|---|
| Lead record, 35 columns A:AI | Name, phone, email, area, source, services, hrs/wk, est. start, status, last contact, method, next follow-up, decision maker, pay type, monthly value, agreement, notes, relationship, next suggested method, step index, step done at, nurture weekday override, mentioned conditions, unsubscribed, nurture cycle, track, trigger at, loss reason, arrived at | KEEP. This is the leads table, column for column. |
| Queue buckets | Every lead sorts into overdue / due now / later today / this week / future / active conversation / skipped / hidden, driven by engine state, follow-up dates, callback times and status | KEEP. This bucketing IS the product: who do I call now. |
| Time-gated steps | A step with a clock time waits in Later Today until its time; a per-lead callback time beats the step time; assessment and interview times gate the queue the same way | KEEP. |
| Weekday nurture due math (WEEKDUE) | A missed weekly nurture day stays overdue forever until a send actually covers the cycle; never-nurtured leads aim at the upcoming day, never a backdated debt | KEEP. Hard-won correctness (75 leads once vanished); port the pure function and its tests. |
| Lead drawer | Everything about one lead in one panel: details, email history, read activity, comms log, schedulers, invoice, presets | KEEP. The single best UI idea in the current app. |
| Lead search | Live header search filtering every lead view | KEEP. Postgres makes it better (search across notes, emails). |
| Manual add-lead panel | Full add form including the multi-select conditions picker with search; writes the full-width row; selection resets per open | KEEP. |
| Full lead editor | Edit all 15 core fields; writes only changed fields; patient name protected from blanking; status changes fire the same follow-up logic as the Update dialog | KEEP. Diff-only writes become ordinary row updates. |
| Status/source registries | Central registries feed every dropdown and suggestion input | KEEP as database rows per the doctrine: stages and sources are configuration, not code. |
| Loss reasons | Picker fires only on the transition into a lost status; presets plus a hand-typed reason; lands in one column | KEEP. Reasons become a config table. |
| Unsubscribe gate | An unsubscribed lead is refused by advanceLead, hidden from every automated queue, and never re-added to the newsletter audience, even when only Resend knows | KEEP as a structural gate in the Today query, per the doctrine. Not UI filtering. |
| Track system (A/B/C) | Router classifies who is asking (self / spouse / adult child) with confidence from relationship, surname and contact-vs-patient signals; three engine packages (13/15/19 steps); re-track control; Track B hospital/fall trigger with 2-day cooldown; Track C SLA chip; time-to-first-dial from the arrival timestamp | KEEP. The tracks are rows (engine packages), the router is server logic. |
| Stable per-lead keys (LEADKEY) | Every per-lead map keys by identity (email then phone then name) because sheet rows shift on sort; lazy migration from row keys | DROP the mechanism. A Postgres primary key is the identity. The lesson (never key by position) is already satisfied. |
| Conditions picker | Multi-select condition chips with search; stores machine keys in one column and readable labels in notes; feeds assessment prefills and engine content | KEEP. |
| Per-lead callback times | Set from Done / Responded / Update dialogs, persisted only when changed, gates the queue | KEEP. |
| Feedback pencil widget | In-app note stack for Meir to flag issues on any screen | REWORK into a simple feedback table + toast. Cheap, and it is how this product improved. |

### Sequences / engines

| Capability | What it does | Verdict |
|---|---|---|
| Engines as data | An engine is a JSON document of phases (action / daily blitz with AM-PM slots and windows / weekly / interval with custom gaps); compiled to a flat step list the lead's step index walks | KEEP, promoted to first-class tables per the doctrine: engines, steps, and assignment rules are rows, the compiler is server code. |
| Custom gap cadence | Calendar-aware gap math (month clamping, leap years), finite interval entries plus a forever sticky step, labels, per-step times | KEEP. Port the pure gap functions and tests. |
| Forever nurture + specials | Sticky perpetual step with a cycle counter; specials fire one-time or repeating on cycle counts, as replacement content or beside (an extra queued touch); mid-cycle parking | KEEP. This is the long-tail nurture engine. |
| Hard windows | A step whose window passed is skipped with a logged reason, never rolled over silently; a background sweep advances | KEEP. |
| Triggers | Event triggers (Track B hospital/fall) preempt the scheduled step, stamp trigger-at, never advance the step index, respect cooldown | KEEP. Generalize: triggers are rows too. |
| Engine assignment rules | Source-to-engine mapping with a default engine; per-lead overrides; restart sequence; setTrack re-routes with fresh anchor and log | KEEP. |
| Copy linter | Blocks urgency, scarcity, ownership claims, missed-call counting, per-track forbidden content (no respite on B, no competitor attacks on C, never screen a spouse on feelings), and em dashes in outbound copy | KEEP as server-side validation on template save. This is the brand encoded as code. |
| Engine import/export packages | .json engine packages; the solura-engine-builder skill authors them | KEEP the package format so existing packages and the skill keep working. |
| Engine starting presets | Built-in starting-point cadences in the editor | KEEP. |
| Next-suggested-method | Each step suggests a channel; send-invoice can be the planned next method and promotes the invoice button to primary, but never counts as a logged contact method | KEEP. |
| Fallback safety | Compiled fallback engines are runtime-only, never persisted; auto-advance jobs never run against fallback engines; the settings doc save refuses to shrink or wipe | FOLD-IN. These were defenses against a corruptable JSON file on OneDrive. Postgres constraints and migrations replace them; keep the spirit (jobs refuse to run on bad config). |

### Email

| Capability | What it does | Verdict |
|---|---|---|
| 1:1 send via Microsoft Graph | Browser-held OAuth (PKCE), sends as Meir, replies thread into the real mailbox | REWORK: same capability, server-side tokens. See section 2 for the Graph vs Resend decision. |
| Email design shell | Every outbound lead email rides the branded shell (linen, cream card, gold and navy, Georgia, signature photo, license and address footer); one decision point (shellWillApply) with auto/override/suppress states and a per-send Wrap chip | KEEP exactly. One server-owned decision function. |
| Raw-HTML paste mode | Pasting a complete design skips the shell explicitly | KEEP. |
| Sender identity profiles | {sendername} and {senderphoto} tokens fill from the signed-in account's profile; profiles live in shared config; tokenless shells swap against marker images chosen by clicking | KEEP, simplified: a profiles table keyed by auth user. The marker-image gymnastics mostly disappear once shells use tokens. |
| Preset emails | Reusable emails assigned by stage / sequence / source (any-axis match), folded preset bar in the composer, one click fills subject and body with all tokens resolved | KEEP. |
| Prefills / lead facts | General facts (bill rate, license) plus per-lead overrides answer {tokens} in any template; pinned per-client invoice rates | KEEP as a lead_facts table plus tenant settings. |
| Name tokens (FILLNAMES) | {dm}, {pt}, {rel} and the inverse-relationship token (daughter becomes your parent) with dialect normalization | KEEP. Port the inverse-relationship map verbatim. |
| PDF templates | Upload a PDF, click-to-place token fields (percent coords, y-flip), per-lead generation via pdf-lib, auto-attach; a failed PDF never blocks the email | KEEP. Files move to Supabase Storage. |
| Scheduled email | Handed to Exchange with PR_DEFERRED_SEND_TIME so it sends with the laptop shut; validation (no replies, no inline images, size caps); verify-and-clean on the standing poll; cancel from Settings; receipts ride along | REWORK: a due_at on the messages table plus a server job. The Exchange trick dies with the browser-only constraint. Reply scheduling becomes possible (it was blocked before). |
| Read receipts (pixel) | Pixel per send, doc-link redirects for attachments and guide links, open events polled from the worker | REWORK: tracking endpoints become Next.js routes on our own domain writing straight to Postgres; Resend webhooks add opens/clicks/bounces for Resend-routed mail. |
| Self-open filtering | Worker learns owner IPs from authenticated polling and discounts own opens; pixel-free copy filed into Sent Items while the tracked original is retired; replies never get a pixel | FOLD-IN. Server-side sends mean our own devices never load the pixel from a Sent copy we control; keep a simple own-IP/user-agent discount on the tracking route, delete the Sent-Items scrubbing machinery. |
| Lead mail history | Full per-mailbox history by sender, merged with the live 48h cache, deduped, newest first, replyable from any depth, filter-to-search fallback | REWORK: messages table fed by Graph delta sync (or inbound webhooks), so history is local, instant and shared by both users. |
| Unread surfacing / Email tab | Leads with unread inbound float in a strip; Email tab lists them; expanding never auto-marks read; explicit mark-all-read; scheduled sends and receipts shown per row, resolved by address not row number | KEEP. This is the Replies screen. |
| Deliverability watch | Bounce and spam-block detection surfaced in the UI | KEEP via provider webhooks (Resend) and Graph NDR parsing. |
| Weekly nurture draft | The weekly letter auto-loads for nurture-step leads (never unsubscribed ones), 📰 layout mode swaps the composer (send via Resend up top, forced Outlook send below), one-click blank start | KEEP. |
| Large attachments | Graph upload sessions for big files; OneDrive share-link uploader for oversize | FOLD-IN: Supabase Storage links and normal attachment limits. |
| Send-on-approval | Nothing ever auto-sends; agents draft, a human clicks send | KEEP. Compliance guardrail, non-negotiable. |

### SMS / Voice

| Capability | What it does | Verdict |
|---|---|---|
| SMS send via GoHighLevel | Contact resolver (phone then email, loud 401/403 failures), send, length caps | DROP GHL. Twilio Messaging replaces it; the resolver disappears (our own table is the contact store). |
| Scheduled texts, GHL native | scheduledTimestamp in UTC seconds, GHL delivers with the laptop shut; verify-and-clean on the poll; pending list and cancel in Settings; self-test | REWORK: scheduled_messages rows plus the server job; Twilio sends at due time. Same UX (schedule button in the SMS modal, pending list, cancel). |
| Worker SMS queue + cron | Legacy KV queue kept for rollback | DROP. |
| No cold SMS (TCPA) | SMS only after a reply or recorded consent; consent recorded by the intake form with version | KEEP as a structural gate: no SMS send unless the lead has a consent record or an inbound text. Per the doctrine, the gate is data, not UI. |
| Voice agent bridge | Mirror of phone-to-context pushed to solura-voice-worker for Retell/Vapi, writebacks polled and applied (notes, status, comms), deterministic A/B/C variant from phone digits, DNC set both local and worker-side | REWORK: fold the lookup/writeback endpoints into Next.js API routes reading Postgres directly. Never deployed in production, so rebuild it thin and only when wanted. The DNC set becomes a column plus a gate. |
| Call scripts | APFM, generic and active-conversation scripts shown beside the dial action | KEEP, as rows (script content is configuration). |
| Click-to-call | tel: dialing from the queue row | REWORK: Twilio Voice. Browser softphone (Voice JS SDK) with call recording and automatic call logging into touches; every call becomes a logged touch without Meir typing. |
| Manual call logging | Done / Responded / Update dialogs log outcome, method, next step | KEEP. One tap commits and names its consequence (the toast already does this; keep server-owned consequence strings per the doctrine). |

### Newsletter (Resend broadcasts + website letters)

| Capability | What it does | Verdict |
|---|---|---|
| Contacts sync to Resend | Unsubscribes flow back (case-insensitive) into the lead record, exit the sequence, log the change, idempotent, never re-adds an opted-out contact from either side | KEEP. Server-side calls replace the worker relay. |
| Audience rules | Nurture-phase leads only by default; off-sequence toggle; per-stage overrides; invalid emails and excluded statuses filtered | KEEP as rows. |
| Warm-up scheduler | 14-day ramping daily quotas capped at 90/day, engagement-sorted pool, weekly sends held for leads due warm-up that schedule-week | KEEP. |
| A/B split broadcast | Deterministic hash split, same contact always lands in the same group, refuses one-variant / empty / warm-up-active / over-cap sends, per-variant counts, winner in Batches & A/B | KEEP. |
| Template validation | Unsubscribe merge tag (triple braces, exactly once), CAN-SPAM address, signature, no em dashes, full-doc wrapping of plain drafts | KEEP as server-side validation before any broadcast. |
| Newsletter hub (NLHUB) | The letter is written in the website composer (iframed, Supabase documents table); dashboard mints one fresh 12-char personal code per lead per send, sends untouched links through Resend (no pixel, no rewriting), and reads back opened vs actually READ (time plus scroll) via the website's newsletter_status RPC | KEEP. Integrate with the website's Supabase project directly; this already is the target architecture. |
| Read cards | Pasted guide or edition links render a rich card (cover, title, summary, guide labeling) with the personal link on every element; cover token removed rather than shipped broken; https-only covers | KEEP. |
| Per-lead read activity (NLREADS) | Drawer shows what each lead opened and read, doc opens counted on each email line, 60-day polling window, 20-minute throttle, check-on-open | KEEP. Polling thins out once reads live in the same Postgres. |
| Edition picker | Pull latest / pick from published newsletters, letters and guides; adopt flows all share one path | KEEP. |

### Intake & funnel

| Capability | What it does | Verdict |
|---|---|---|
| Public intake form (/care/) | Three steps with progress bar, tap-card answers, multi-select condition chips (keys plus labels), loved-one vs self branching, professional referral variant with organization, job-seeker redirect to the hiring form, ZIP soft check, honeypot, compressed photos, noindex, brand voice with no em dashes | KEEP. Becomes a route in the Next.js app (solurahomecare.com/care), same design. |
| Submit-is-consent | No checkbox; small print under the button records consent v2 with frequency, rates and STOP language | KEEP. Store the consent version and timestamp on the lead; this is the TCPA foundation. |
| Intake links registry | Anonymous 6-char codes per platform and method, short URLs, instant create, per-link notes, grouped listing, copy button | KEEP as an intake_links table. |
| Source attribution | The Source cell is derived from the link (platform · method); deleted links still resolve to a real string | KEEP. |
| Worker KV queue + poll + ack | Form posts to the worker, dashboard polls, imports exactly once, acks delete; outsiders never touch the sheet | FOLD-IN. The form posts to a Next.js API route that inserts the lead in one transaction. The whole queue, poller, ack and seen-guard apparatus disappears. |
| Lead creation from intake | Full-width row: status New, due today, conditions keys to the engine column, readable labels to notes, track routed on ingest, arrival stamped to the second | KEEP as a server-side insert path shared with add-lead. |
| Form funnel (FORMDROP) | Anonymous fill pulses (session id, furthest step, last field, done; never a typed value) via sendBeacon; funnel per link (started / finished / still filling / quit), quit list naming the exact step and field, 30-minute active window, history kept forever | KEEP. form_sessions table, written by the same API route. |

### Invoicing

| Capability | What it does | Verdict |
|---|---|---|
| Invoice builder | Gated on On Service status; number counter, service period, hours, rate, amount with live recalc, due date, notes block, template tokens with full escaping | KEEP, backed by an invoices table (today an invoice exists only as a sent email). |
| Discounts | Flat and percent, stacked (each percent against subtotal), labeled lines, subtotal and net rows, junk-proof parsing | KEEP. |
| Deposit mode | Toggle swaps to the security-deposit template, DEP- numbering on the same counter, deposit terms field, service-only fields hidden and stripped from sends | KEEP. |
| How-to-pay block | Zelle to the billing mailbox with hosted QR, standing invoice-number-in-the-note line, optional per-send pay-by-card link that renders a button; fits inside the invoice card; {payment} token placement | KEEP. Payment processor choice is an open decision (section 5). |
| Shared billing mailbox | Sends as billing@ via Mail.Send.Shared, Send-As denial explained in plain language, pixel-free copy filed as billing@ | KEEP capability; implementation follows the email decision. |
| HHAeXchange hours import | Parses exported XLSX: header found past preamble on any sheet, name matching (Last-First, case, middle initials), period filtering, H:MM and Excel-time and decimal durations, Billed Hours over OT/TT, rate derivation only into an empty field, no-match diagnosis naming what it saw | KEEP. Pure functions, port with tests. |
| Pinned rates | 📌 pins a per-client rate; openInvoice prefills pinned or general rate | KEEP (lead_facts). |
| Invoice receipts + log | Invoice sends carry a pixel, land in the comms log, advance the counter; opens stamp the comms row | KEEP via the new tracking routes. |
| Attachments | Picker chips, size guard with guidance, attachments ride the send and the clean copy | KEEP via Supabase Storage. |

### Scheduling

| Capability | What it does | Verdict |
|---|---|---|
| Assessment scheduler | Logger modal with Save & Send and Preview; save sets the status that unlocks Start Assessment, moves follow-up to the visit date, gates the queue by visit time, logs comms with its own outcome | KEEP. |
| Branded confirmation + .ics | RFC 5545 invite (METHOD:REQUEST, organizer Meir, RSVP attendee, 1-hour alarm, 90-minute default); the .ics rides the branded email and IS the invite; one email, one event, the lead is never a Graph event attendee | KEEP. This threading of email + calendar is subtle and correct. |
| Virtual visits | Toggle swaps location to link mode; blank location auto-creates a Teams meeting and reads back the join link; pasted links win; non-link locations refused with guidance | KEEP. Teams depends on keeping Microsoft; otherwise substitute a meet link field. |
| Reschedules | Same UID with bumped SEQUENCE so calendars replace the slot; same-mode reschedule moves the existing Graph event (Teams link survives); mode flip retires and recreates; banner names the old time; sheet note and comms log distinguish reschedules; bookings remembered by stable key; pre-tracking bookings found by subject match | KEEP. bookings table replaces the config map. |
| Cancellations | METHOD:CANCEL invite clears the slot, no alarm, warm no-pressure email, lead reverts to active conversation due today, calendar event deleted, email failure never blocks the cancel | KEEP. |
| Interview scheduler | The lead interviews us: branded confirmation + .ics, quiet own-calendar event, stage set to Interview Scheduled, same reschedule machinery | KEEP. |
| Assessment form | In-app form with prefills: age from DOB (live), language and dietary carried forward, caregiver composite, POA only when checked, sleep-issues merge, pre-signed signature page; auto-filled fields tagged, editable, never overwrite typed answers; uploaded docs keep links and ride the finished-assessment email to an editable intake recipient | KEEP. Docs move to Supabase Storage; the finished email stays. |

### Analytics

| Capability | What it does | Verdict |
|---|---|---|
| Comms log | Every send, open, call, reply and state change appended to a log sheet (18 columns) as the durable cross-device record | KEEP as the touches table, append-only with an insert-only trigger per the doctrine. This is the one table everything reads. |
| Analytics hub | Reads the whole comms log and renders channels, engines, opens, replies | KEEP, as SQL over touches. |
| Batches & A/B | Variant-stamped sends aggregate per variant, winner called at 3+ sends | KEEP. |
| Diagnostic report (🩺) | One click classifies EVERY lead through the real queue logic, names each hidden lead with its reason, reports which settings doc loaded from where, who is signed in and what scopes were granted | KEEP the lead-classification half; it is the best support tool in the app. The drive/scope half dies with OneDrive. |
| Operation traces | In-browser black-box recorder of operations for debugging | FOLD-IN: server logs plus Sentry (or Vercel observability). |
| Form funnel analytics | See Intake section | KEEP. |
| Newsletter read analytics | Opened vs read with time and scroll, averages over readers only | KEEP. |

### Multi-user

| Capability | What it does | Verdict |
|---|---|---|
| LIVESYNC | 60s polling of OneDrive eTag stamps; a changed stamp triggers a full reload, deferred while this browser is mid-work (open modal, dirty settings, 90s self-write cooldown) | DROP. Supabase Realtime (Postgres changes) pushes row-level updates in about a second with no reload and no defer dance. The one idea to keep: never yank state out from under an open editing modal. |
| Shared-drive support | Workbook found in Shared-with-me, drive-aware API base, shared settings doc requirement, duplicate-doc detection with newest-wins, local-to-shared heal, share-link rescue form, Files.ReadWrite.All scope diagnostics | DROP entirely. RLS on a shared Postgres database replaces all of it. |
| Per-account identity | Signed-in account learned from Graph; per-account sender profiles in shared config | KEEP as Supabase Auth users + profiles. |
| Overwrite guards | Engines-doc wipe protection, shrink refusal, skip-unchanged saves | FOLD-IN: transactions and row-level writes make the failure mode impossible. |

### Settings / branding

| Capability | What it does | Verdict |
|---|---|---|
| Settings panel | Engines editor, Email (templates, shell, sender profiles), Invoicing tab, Intake links + funnel, Scheduled emails/texts lists with cancel, Newsletter, Claude training, diagnostics | KEEP, reorganized as app routes. All values become settings rows / config tables. |
| Template restores | Restore buttons stage a blank override so the built-in wins; broken saved templates never win (red border, flagged fallback at send) | KEEP. Built-in defaults in code, overrides in rows, validation on save. |
| Brand system | Linen background, cream card, gold + navy, Georgia at double line-height, signature photo, license 4574HHN and address footer, no em dashes in outbound copy, no urgency or scarcity, signed Meir Schwimer, never implies ownership | KEEP, enforced by the copy linter server-side. Tokens come from design-system/colors_and_type.css by name. |
| Build watcher | Page refetches itself past the Pages CDN every 10 minutes and shows a reload banner on a new BUILD constant | DROP. Vercel deployments; at most a soft "new version" toast from a build id endpoint. |
| PWA (manifest + sw.js) | Installable shell | REWORK or drop; Next.js can keep a manifest cheaply. Decide late. |
| Claude API key handling | localStorage first, shared config second, written to both | DROP. Key lives in server env only. |

### AI features

| Capability | What it does | Verdict |
|---|---|---|
| Claude email writer | Drafts branded emails from lead context, trained on a voice corpus of emails Meir actually sent, strict JSON reply contract, fixed model and temperature | KEEP; move to a server route with the key in env. The voice corpus becomes rows refreshed from the messages table. |
| Tweak loop | Meir's note travels back WITH the current draft; Claude revises in place, never from scratch; result re-applies through the same sanitize/adapt/declaw pipeline; a tweaked draft still counts as a Claude draft (shell wraps it) | KEEP exactly. The single pipeline (one decision point for wrapping) is the design to preserve. |
| Declaw pipeline | Claude's full-document HTML is stripped to its message (scaffolding, hidden preheaders, hidden spans) so the shell stays the only design | KEEP. |
| Claude-drafted PDFs | Claude doc HTML rendered as a real branded PDF and attached | KEEP (server-side rendering makes this easier). |
| Voice-agent AI calls | Retell/Vapi integration, built but never deployed | REWORK thin, build last (see SMS/Voice). |

---

## 2. Target architecture

### Shape

One Next.js (App Router, TypeScript, Tailwind) app on Vercel, one Supabase project (Postgres + Auth + RLS + Realtime + Storage), Twilio for voice and SMS, Resend for newsletter and system email, Anthropic API server-side for drafting. The public intake form and the dashboard are the same app: `/care` is public, `/app/*` requires auth. The website (www.solurahomecare.com), its composer and the `documents` table stay where they are; the dashboard talks to them as it does today (publishable key reads, `newsletter_status` RPC), ideally consolidated into the same Supabase project so reads are plain joins.

```
app/
  (public)/care/            intake form (steps, pulses, submit)
  (app)/today/              the morning queue
  (app)/leads/[id]/         lead panel (drawer becomes a page/panel)
  (app)/replies/            unread + email tab
  (app)/compose/            composer (modal route from queue + lead)
  (app)/invoices/
  (app)/newsletter/
  (app)/analytics/
  (app)/settings/           engines, templates, links, profiles, scheduled
  api/track/px, /track/doc  pixel + doc redirect (replaces the worker)
  api/intake, /intake/pulse form submit + fill pulses
  api/jobs/tick             the 5-minute job runner (Vercel Cron)
  api/twilio/*              voice + SMS webhooks
  api/ai/draft, /ai/tweak   Claude routes (key in env)
  api/graph/*               Graph send/sync routes (if Outlook kept)
```

### Schema sketch

Per the doctrine: `tenant_id` on every table and `owner_id` on lead-scoped tables from the first migration, even though v1 runs single-tenant with two users. Append-only `touches` with a trigger that blocks UPDATE and DELETE; corrections are new touches.

- **tenants** (id, name) and **profiles** (id = auth.uid, tenant_id, display_name, sender_name, sender_photo_url, role)
- **leads** (id, tenant_id, owner_id, lead_no, created_at, arrived_at, name, phone, email, area, source_id, services, hrs_per_week, est_start, status_id, decision_maker, relationship, pay_type, monthly_value, agreement_signed, notes, conditions text[], unsubscribed_at, dnc boolean, loss_reason_id, consent_version, consent_at)
- **enrollments** (id, lead_id, engine_id, step_idx, step_done_at, anchor_at, nurture_weekday, nurture_cycle, track, track_confidence, trigger_at, callback_at, next_method, status) : the sequence state that today lives in columns T-AI
- **touches** (id, tenant_id, owner_id, lead_id, at, direction, channel, outcome_id, subject, body_ref, message_id, engine_id, step_id, variant, meta jsonb) : append-only; every send, open, call, reply, state change
- **engines** (id, tenant_id, name, package jsonb, version) plus **engine_rules** (source match to engine id, default flag) and **outcomes** (id, label, consequence text) : one tap commits and the server owns the consequence sentence
- **messages** (id, tenant_id, lead_id, direction, channel email|sms, provider graph|resend|twilio, provider_id, thread_key, from_addr, to_addr, subject, html, status, due_at, sent_at, opened_at, read_receipt jsonb) : live sends, scheduled sends (due_at in the future), and synced inbound history in one table
- **calls** (id, lead_id, twilio_sid, direction, duration, recording_url, outcome_id, at)
- **invoices** (id, tenant_id, lead_id, number, kind service|deposit, period_start, period_end, hours, rate, subtotal, discounts jsonb, amount, due_date, notes, payment_link, sent_message_id, status)
- **bookings** (id, lead_id, kind assessment|interview, starts_at, duration_min, mode in_person|virtual, location, join_url, assessor, ics_uid, ics_sequence, graph_event_id, cancelled_at)
- **intake_links** (id, tenant_id, code, platform, method, notes, created_at) and **form_sessions** (sid, link_code, first_at, last_at, furthest_step, last_field, done) and **intake_submissions** (raw payload jsonb, lead_id, at) for the audit trail
- **newsletter_sends** (id, edition_slug, title, sent_at, stats jsonb) and **newsletter_codes** (code, lead_id, send_id, slug, created_at) : personal links, joinable to the website's read data
- **templates / presets / prefacts / scripts / settings** : presets with assignment axes, lead_facts (lead_id nullable for general facts), call scripts, invoice and scheduler templates with built-in fallbacks in code, a settings key/value table for the rest
- **events_import** : the one-time landing zone for migrated sheet history

### RLS

Two users, one tenant. Every policy is `tenant_id = auth.jwt tenant` and authenticated role. Both users see and edit everything (that matches how they work today); `owner_id` records who did it rather than restricting. Public routes (`/api/intake`, `/api/track/*`, `/api/intake/pulse`) go through server routes using the service key with the same guards the worker had: honeypot, length caps, name-plus-contact gate, session-id regex. The public form never holds a database credential, exactly as it never held a Graph token.

### Realtime

Supabase Realtime subscriptions on leads, touches, messages and enrollments replace the 60-second stamp poll. A teammate's action updates the other screen in about a second, row-level, with no full reload. Keep the one LIVESYNC lesson: an open modal buffers incoming changes for its own lead until closed.

### Background jobs

Recommendation: **Vercel Cron hitting `/api/jobs/tick` every 5 minutes**, with all work expressed as due rows in Postgres (messages with due_at, enrollment advancement sweeps, newsletter status polls, warm-up quotas, Graph inbound sync). One codebase, one language, logs in one place, trivially testable; pg_cron would scatter logic into SQL and Supabase edge functions would split the stack. Jobs must be idempotent and claim rows with `FOR UPDATE SKIP LOCKED`, which also preserves the old system's hard-won exactly-once discipline (the ack-and-seen-guard pattern). If a job ever needs sub-minute precision, add QStash then, not now.

### Twilio

- **Numbers and compliance first**: buy (or port) a local 216 number, register the brand and an A2P 10DLC low-volume campaign before writing SMS code; approval takes days and nothing sends without it. The intake form's submit-is-consent language and STOP handling map directly onto the campaign registration.
- **Voice**: Twilio Voice JS SDK softphone in the dashboard (click a lead, talk in the browser, recording on, outcome dialog on hangup writes the touch). Fallback mode: click-to-call that rings Meir's cell first then bridges, for days he is not at the laptop. Inbound to the Twilio number rings both the browser and a forwarding number; voicemail transcription lands as a touch.
- **SMS**: two-way threads in the lead panel and Replies screen via the messages table; scheduled sends are due_at rows (Twilio also offers native scheduling; using our own job runner keeps cancel/verify logic uniform with email). The TCPA gate is structural: the send route refuses a lead with no consent record and no inbound message. STOP webhooks set unsubscribed/dnc and exit sequences, same as the Resend unsubscribe sync does today.

### Email shape

- **Newsletter and system mail: Resend**, as today, called server-side (the worker relay dies). Webhooks for opens, clicks, bounces and spam complaints feed touches and the deliverability watch.
- **1:1 lead mail: keep Microsoft Graph send, moved server-side.** Recommendation and tradeoffs: Meir's replies, history and the shared billing mailbox already live in Outlook; sending from the real mailbox keeps threading, the Sent record, and deliverability reputation of a long-lived address, and keeps the assessment/interview flows (Graph calendar events, Teams join links) on one token. The cost is keeping an Azure app registration and token refresh on the server. Moving 1:1 mail to Resend instead would simplify to one provider but breaks mailbox threading (replies land in Outlook while sends live elsewhere), orphans the shared billing mailbox, and still leaves Graph needed for calendar. So: Graph for 1:1 and calendar, Resend for everything broadcast and transactional. Inbound: a Graph delta-sync job fills messages so lead history is local, shared and instant (today every open of a lead refetches the mailbox).
- Read receipts: our own `/api/track/px` and `/api/track/doc` routes (same payload contract, so old sent emails keep working if the worker forwards), writing to touches. Self-open noise mostly disappears because the server files no tracked copy into Sent Items; keep a discount for hits from signed-in users' IPs.

### AI layer

`/api/ai/draft` and `/api/ai/tweak` server routes with ANTHROPIC_API_KEY in Vercel env. Same JSON contract, same declaw-then-shell pipeline, voice corpus maintained as rows refreshed from sent messages. Claude never sees a send button: drafts land in the composer for a human.

### Files

Supabase Storage buckets: `pdf-templates`, `generated` (per-lead PDFs, invoices), `assessment-docs`, `photos` (intake uploads). Signed URLs in emails go through `/api/track/doc` when tracking is wanted.

### Auth

Supabase Auth with **Microsoft (Azure AD) SSO** for both users: they already live in Microsoft 365, it is one button with no passwords to support, and the same consent can carry the Graph scopes the mail and calendar features need (offline_access, Mail.ReadWrite, Mail.Send, Mail.Send.Shared, Calendars.ReadWrite). Email magic links remain as the break-glass fallback.

---

## 3. What NOT to carry over

Each of these exists only because the data store was two files on OneDrive reached from a browser. Name them so nobody rebuilds them out of habit.

- **60s polling + eTag stamp sync (LIVESYNC)** with defer rules and self-write cooldowns → Supabase Realtime subscriptions.
- **Workbook sessions, batched writeRow, contiguous-run $batch math, column-letter arithmetic, full-width A:AI row writers, firstEmptyDataRow, lazy header labeling** → SQL. A row insert is a row insert.
- **Stable per-lead identity keys and their lazy migration** → primary keys and foreign keys.
- **Shared-drive finder, Shared-with-me fallback, drive-aware bases, share-link rescue form, duplicate-doc newest-wins, local-to-shared heal, Files.ReadWrite.All scope diagnostics** → RLS on one database; the whole class of "the two of us see different files" bugs is structurally gone.
- **Engines-doc wipe/shrink guards, skip-unchanged uploads, chunked uploads, read-only fallback mode** → transactions, migrations and row-level writes.
- **The Cloudflare worker's reasons to exist**, one by one: CORS relay for Resend → server-side fetch; public intake queue + poll + ack → one API route and one insert; pixel/doc tracking → Next.js routes writing Postgres; owner-IP self-open learning → unnecessary once no tracked copy sits in Sent Items; SMS cron queue → the job runner; fill pulses → API route. The worker stays deployed only as a forwarder during transition (section 4).
- **Exchange PR_DEFERRED_SEND_TIME scheduling and the pixel-scrub of Sent copies** (save clean copy, retire tracked original, subject-matched candidate fetching) → due_at rows sent by the server; the server controls what is stored where.
- **GoHighLevel entirely**: contact resolver, key rotation diagnostics, scheduledTimestamp, native holds → Twilio plus our own tables.
- **localStorage as a data tier** (Claude key, seen-guards, va_seen, throttles) → server env and Postgres; localStorage keeps only viewer conveniences.
- **CDN-cache build banners and the self-fetching build watcher** → Vercel deploys.
- **The test-slice architecture** (tests cutting marked regions out of a 1MB HTML file and evaluating them with new Function) → real modules and Vitest. The assertions themselves are the treasure: port the pure-logic suites (WEEKDUE, gap math, router rules, linter, HHA parsing, invoice math, funnel classification, warm-up quotas, A/B hashing) nearly verbatim as the regression floor of the rebuild.
- **The in-page migration code** (§7) that upgraded old sheets in place → one real migration script, run once.

---

## 4. Migration & cutover

### Data moves

1. **Leads**: one script reads Solura_Lead_Tracker.xlsx and maps columns by the documented C map (A:AI, headers in Excel row 4, data from row 5): A Lead# → lead_no, B Date Added, C Client Name, D Phone, E Email, F Area, G Source, H Services, I Hrs/Wk, J Est. Start, K Status, L Last Contact, M Method, N Next Follow-Up, O Decision Maker, P Pay Type, Q Monthly Value, R Agreement, S Notes, T/U/V legacy sequence text (import into a legacy jsonb, do not model), W Safety, X Relationship, Y Next Suggested Method, Z step_idx, AA step_done_at, AB nurture weekday override, AC mentioned_conditions (split on commas into the array), AD Unsubscribed timestamp, AE nurture_cycle (including the "3.1" mid-cycle form), AF track ("C·high" splits into track + confidence), AG trigger_at, AH loss_reason, AI arrived_at. Z-AI and X populate enrollments; the rest populates leads.
2. **Comms log sheet** → touches (one insert per row, preserving timestamps, direction, channel, outcome, message ids, engine, opened-at).
3. **Solura_Engines.json** → engines (the engine documents), engine_rules, presets, lead_facts, pdf templates metadata, intake links, interviews/assessments/assessors maps → bookings, scheduled email/SMS queues → messages with due_at, newsletter send history → newsletter_sends/codes, config keys → settings rows. The three track packages in `engines/` import through the package importer unchanged.
4. **Worker KV**: pull `/intake/list` and `/fpulse/list` one last time; intake submissions → intake_submissions, fill sessions → form_sessions (the funnel history Meir wants kept forever).
5. Run the migration script twice: once into staging to validate counts (leads, touches per channel, engines compiled step counts 13/15/19), once at cutover.

### Overlap during transition

- Build against a snapshot copy of the sheet; the old dashboard stays the live tool until the new Today queue is trusted.
- **Cutover is a freeze, not a sync.** Do not attempt two-way sheet-to-Postgres sync; pick a quiet evening, re-run the import, and the old dashboard becomes read-only (a banner build pointing at the new URL). The sheet remains the archive.
- **Links in the wild must keep working**: already-sent emails carry worker `/px` and `/doc` URLs, and printed/posted intake links carry `/care/?c=code` on Pages. Keep the Cloudflare worker and Pages deployed in forwarding mode for 90+ days: `/doc` keeps redirecting (and POSTs the event to the new API), `/px` likewise, `/care` redirects to the new form with the code intact. The worker's last job is to retire slowly.
- GHL stays on only until A2P approval lands and the Twilio number is proven, then the key is revoked.

### Build order (sprints)

1. **Sprint 0, foundation**: Supabase project, first migration (every table above, tenant_id/owner_id from day one, touches insert-only trigger), Microsoft SSO auth, migration script run against the snapshot, Realtime wired. Definition of done: both users sign in and see every migrated lead, and a touch row cannot be updated or deleted.
2. **Sprint 1, the morning**: Today queue (buckets, time gates, WEEKDUE), lead panel, one-tap outcomes with server-owned consequence strings, manual call logging, add-lead, lead editor, search, call scripts, Twilio click-to-call (bridge mode first), touches feeding it all. This is the daily driver; Meir should live here before anything else is built.
3. **Sprint 2, email**: Graph server-side send + inbound delta sync, composer with shell/wrap pipeline, Claude draft + tweak routes, presets and prefills, name tokens, Replies screen with unread surfacing, read receipts via own tracking routes, scheduled sends via due_at.
4. **Sprint 3, intake**: /care form in-app, links registry, direct lead creation with track routing, fill pulses and the funnel view, consent recording. Flip the public DNS when stable.
5. **Sprint 4, money and visits**: invoicing (builder, discounts, deposit mode, how-to-pay, HHA import, shared mailbox send), assessment and interview schedulers with .ics/Graph events, assessment form with Storage uploads.
6. **Sprint 5, reach**: newsletter hub against the website's Supabase (codes, sends, reads), contacts sync, warm-up, A/B, analytics hub, Batches & A/B, diagnostic report.
7. **Sprint 6, messaging out**: Twilio SMS two-way (A2P should be approved by now), scheduled texts, STOP handling, browser softphone with recording, then the voice-agent bridge only if Meir still wants it.

### What stays live where

- **www.solurahomecare.com** (Vercel) stays: the composer, letters, guides, `documents` table and `newsletter_status` RPC are consumed, not rebuilt.
- **The hiring portal** stays separate on its own Supabase track; the rebuild links to it (job-seeker redirect from intake) and nothing more.
- **apply.solurahomecare.com / Pages** keeps serving until the forwarding window closes.
- **The Excel workbook** is retired to archive status at cutover; the OneDrive files are never a write target again.

---

## 5. Open decisions for Meir

1. **1:1 email: keep Outlook/Graph sending, or move everything to Resend?** Recommendation: keep Graph for 1:1 and billing mail so replies, threading and the billing@ mailbox stay in Outlook where you already work, and use Resend for newsletter and system sends.
2. **Calling: browser softphone or phone-bridge?** Recommendation: build bridge-to-cell first (works everywhere, zero habit change) and add the browser softphone with recording in Sprint 6; you will likely end up using both.
3. **SMS number: new Twilio number or port the existing GHL number?** Recommendation: port it if leads already text that number; otherwise a fresh 216 number is faster and avoids porting downtime. Either way A2P registration starts in Sprint 0 because approval is the long pole.
4. **Card payments on invoices: which processor?** Recommendation: Stripe payment links pasted per invoice exactly like today's flow, keeping Zelle as the promoted no-fee path; full Stripe invoicing only if card volume grows.
5. **Voice agent: build the Retell/Vapi bridge into the new stack, or shelve it?** Recommendation: shelve until the Twilio foundation is live; it was never deployed, so nothing is lost by sequencing it last.
6. **Data retention: keep every fill session and touch forever?** Recommendation: yes (Postgres makes forever cheap), with one exception: set a retention window for call recordings (say 12 months) since recordings carry the most sensitive content.
7. **The employee's permissions: full partner access or a reduced role?** Recommendation: full access like today, with owner_id stamping who did what; add role restrictions only if a real need appears.
8. **Website/newsletter Supabase: merge into the new project or keep two projects?** Recommendation: one project if the website migration is cheap, so reads are joins; otherwise keep two and talk over the existing RPC, which already works.

---

## 5b. Decisions — approved by Meir, 2026-11-18

1. **Email**: Graph for 1:1 and billing, Resend for broadcast — approved, with amendments: Microsoft is a CONNECTOR (auth token managed in Settings), not the only sign-in; Google connectable too; sign-in itself is provider-agnostic (Supabase Auth: Microsoft, Google, magic link). Shared mailboxes: an individual user may send from a shared mailbox they have access to, IF the admin has allowed that specific mailbox (admin-managed allowlist in Settings).
2. **Calling**: bridge-to-cell first, softphone later — approved; Twilio work starts immediately (A2P registration is the long pole, kick it off in Sprint 0).
3. **Number**: NOT hardcoded — Settings gets a full UI for searching/choosing/buying numbers and a guided porting flow.
4. **Payments**: Stripe payment links — approved, deferred to a later phase.
5. **Voice agent**: shelved until the Twilio foundation is live — approved.
6. **Retention**: keep everything forever, INCLUDING call recordings (until further notice).
7. **Employee access**: full access — approved, plus build real admin controls (roles/permissions UI) to regulate things.
8. **Supabase**: merge projects — approved, with the explicit trajectory that the dashboard progressively becomes the ADMIN CENTER for the website (editions, documents, read data, eventually site content management live in one place).

---

## 6. Design-brief raw material

**The users.** Two non-technical operators at a small licensed home care agency in Cleveland: Meir (owner-rep, lives in this tool all day) and one employee. They are fast on the phone and warm on email; they are not fast in software. Every screen must answer a question they already have, never ask them to configure something first.

**The morning workflow.** Open the app, see who is due right now and why (the step, the hook, the last thing that happened), tap to call or text or email, log the outcome in one tap that says plainly what happens next ("Logged. Next: email Thursday."), and move to the next person. Replies and unread messages surface on their own; nothing due is ever silently forgiven, and nothing hidden is hidden without a reason the diagnostic can name.

**Core screens.**
1. **Today**: the queue in buckets (Overdue, Due now, Later today, This week), each row carrying the step, channel icon, and one-tap actions. The home screen, always.
2. **Lead panel**: one lead, everything: timeline of touches, email thread, what they read on the website, bookings, invoice state, facts, engine position, edit.
3. **Replies**: leads with unread inbound on top, scheduled sends pending, read receipts; reply inline.
4. **Composer**: subject, body, preset bar, Claude draft inline with the tweak bar under the draft, wrap chip, schedule button. Lives as an overlay so the queue is never lost.
5. **Intake**: link registry with per-link funnel (started, finished, quit at which field), and the queue of fresh submissions already turned into leads.
6. **Invoices & visits**: On Service clients, invoice builder with deposit toggle and HHA hours pull; assessment and interview scheduling with reschedule and cancel.
7. **Newsletter**: edition band (current letter, pull latest, picker), audience and warm-up state, send, then opened-vs-read results.
8. **Analytics**: channels, engines, A/B batches with winner calls, the funnel, the diagnostic "why is this lead hidden" report.
9. **Settings**: engines editor, templates with restore-to-built-in, sender profiles, links, scheduled items, in that order of likely use.

**Emotional register.** Calm, warm, unhurried. This is home care: the people on the other end are stressed families, and the operator's tool should feel like the letters it sends: linen and cream, gold and deep navy, serif warmth, generous spacing, nothing blinking, nothing urgent-colored except a genuinely overdue touch. Toasts speak in plain sentences that name the consequence. Errors are loud but kind, and always say what to do next. No em dashes in anything a family ever sees.

**What today's UI gets right and must survive.**
- One-tap actions straight from the queue row, with the outcome dialog and its consequence sentence; no confirm dialogs.
- Everything about a lead in one panel; nobody ever opens a second system to answer "what happened with this family."
- The composer with Claude drafting inline and the tweak bar that revises in place instead of starting over; the brand shell applied by the system, not by the user.
- Quiet confidence about state: the queue never lies, missed cycles stay visible, hidden leads can always explain themselves.
