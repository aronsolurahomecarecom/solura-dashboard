# Design brief: Solura Command — the lead and communications hub for Solura Home Care

Design the complete interface for a web application that replaces our current lead dashboard. It is the daily working tool of a small licensed home care agency in Cleveland. Everything below is real and already decided; your job is the design, not the scope.

## Who uses it

Two operators today, a handful later: Meir (owner-rep, lives in this tool all day) and an employee. Warm, fast on the phone, not fast in software. Every screen must answer a question they already have, never ask them to configure something first. Desktop-first (this is an all-day workstation tool), gracefully responsive down to a phone for checking replies on the go.

## What the product does

It answers one question each morning: who do I call right now, and what do I say. Leads flow in from a public intake form and manual entry; an engine of sequences schedules every touch (calls, emails, texts) across weeks and months of gentle nurture; the operator works a queue, and the system sends, tracks, and remembers everything. Phone calls, two-way texting (Twilio) and email are BUILT IN: calls happen in the app or bridge to a cell, texts are threads inside the lead's panel, emails are composed inline with an AI drafting assistant. Invoices, home-visit scheduling, a weekly newsletter with per-person read tracking, and analytics round it out. Over time this app also becomes the admin center for the agency's website.

## Emotional register — the most important section

Calm, warm, unhurried. This is home care: the people on the other end are stressed families deciding about a parent. The tool should feel like the letters it sends: linen and cream surfaces, gold and deep navy accents, serif warmth in headings, generous spacing, nothing blinking, nothing shouting. The ONLY thing allowed to look urgent is a genuinely overdue touch. Toasts speak in plain sentences that name the consequence ("Logged. Next: email Thursday."). Errors are loud but kind and always say what to do next. No em dashes anywhere in interface copy. No urgency or scarcity language, ever.

Palette to build the system from (name the tokens, use them consistently): linen background #F5F1E8, cream card #FAF8F4, deep navy #1f3d57, warm gold #C59B4E, ink #3d4348, soft gray for secondary text, a quiet green for success, one restrained red reserved for overdue and destructive. Georgia (or an equivalent warm serif) for headings and letter-like moments; a clean humanist sans for UI chrome and data.

## The screens (design all; the first three are the heart)

1. **Today** — the home screen, always. The queue in buckets: Overdue, Due now, Later today, This week. Each row: lead name, the step they are on ("Nurture letter, week 14" / "Day-2 call, morning"), channel icon, days-overdue if any, and one-tap actions (call, text, email, done, snooze). A row expands or opens the lead panel; acting never loses your place in the queue. A small strip above the queue surfaces leads with unread replies.
2. **Lead panel** — everything about one family in one place, opened from anywhere: identity and facts at top (who is asking for whom, relationship, conditions, source), then a unified timeline of every touch (calls with recordings, emails with opened/read badges, texts, notes, status changes), the live email thread and SMS thread, what they read on the website (opened vs actually read, with time), bookings, invoice state, engine position with a visible next step, and edit-in-place fields. This panel is the answer to "what happened with this family" and nobody should ever need a second system.
3. **Composer** — an overlay (the queue stays behind it): to/subject/body, a preset bar, an AI draft button that writes inline in the brand voice, a tweak bar UNDER the draft where the operator types a note and the draft revises in place, a wrap chip showing the branded email shell will apply, attachment chips, a schedule button, and one send button. Also design the SMS composer variant: short, thread context above, schedule option, character count.
4. **Calling** — a persistent slim call bar when a call is active (who, duration, mute, hang up, "log outcome" on hangup opening a one-tap outcome dialog). Also the click-to-call moment from a queue row, and the incoming-call toast.
5. **Replies** — leads with unread inbound on top, scheduled sends pending with cancel, recent read receipts; reply inline without leaving.
6. **Intake** — the link registry (per-platform links with codes, copy button, notes) each with its funnel (started, finished, quit, and exactly which field they quit at), plus fresh submissions already turned into leads.
7. **Invoices & visits** — invoice builder (service/deposit toggle, hours x rate with live math, discounts, a "how to pay" preview with Zelle QR), the HHA hours import moment, and the assessment/interview schedulers (date, time, in-person or virtual, reschedule and cancel states).
8. **Newsletter** — the current edition band (cover, title, pull-latest, pick-from-website), audience summary, send-with-personal-links, then results as opened vs READ with time and scroll.
9. **Analytics** — channels, engine performance, A/B batches with a winner call, the intake funnel, and the "why is this lead hidden" diagnostic list.
10. **Settings** — in order of likely use: engine/sequence editor (phases, cadences, a visual step list), email templates with restore-to-built-in, sender profiles (each user's name and photo used by the email shell), **Integrations** (connect Microsoft, connect Google; a mailbox picker where an admin allowlists shared mailboxes and users choose a permitted send-from), **Phone numbers** (search and choose a Twilio number by area code with a guided port-your-number flow; nothing hardcoded), intake links, scheduled items with cancel, and **Admin** (user roles and permissions, simple and readable).

## Components and states to design explicitly

The queue row (default, overdue, expanded), the one-tap outcome dialog with its consequence sentence, the consequence toast, read/open badges (sent, opened, actually-read), the timeline entry per channel, empty states for every screen (warm, instructive, never blank), loading states, the error banner (loud but kind, names the fix), the realtime moment when a teammate's action clears an item from your queue (a quiet row-exit, never a jarring reload), and presence of a second user ("Chany is on this lead" chip).

## What must survive from today's tool

One-tap actions straight from the queue with no confirm dialogs; everything about a lead in one panel; AI drafting inline with revise-in-place instead of start-over; the brand shell applied by the system, not the user; a queue that never lies (missed weeks stay visible until actually handled, and anything hidden can explain itself).

## Deliverable

A cohesive design system (tokens, type scale, components) plus full screen designs for all ten screens, desktop-first with a responsive pass on Today, Lead panel, Replies and the composers. Name every token. Keep the register: if a screen would look at home in a stock-trading app, it is wrong; if it would look at home in a warm, well-run family office, it is right.
