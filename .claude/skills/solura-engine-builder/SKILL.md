---
name: solura-engine-builder
description: Author sequence-engine packages (JSON) for the Solura lead dashboard — the outreach cadences that drive calls, texts, and emails to home-care leads. Use this whenever the user asks to build, write, design, or export an engine, a sequence, an outreach cadence, a follow-up track, a nurture plan, or an "engine package" for the Solura dashboard, or wants a JSON file to import under Settings → Sequence engines — even if they just describe the cadence in words ("call twice a day for a week then weekly texts"). Also use it to review or fix an engine JSON that fails to import.
---

# Solura Engine Builder

An **engine** is the JSON definition of an outreach sequence in the Solura lead
dashboard. The dashboard compiles it into a flat list of steps (call/text/email
actions) and walks each lead through them. Your job: produce a JSON package that
imports cleanly under ⚙ Settings → Sequence engines → 📥 Import package.

## Output format

Emit a single JSON document (a ```json fence is fine — the importer strips it):

```json
{
  "format": "solura-engine",
  "formatVersion": 1,
  "engine": {
    "id": "gentle-referral",
    "name": "Gentle Referral Nurture",
    "phases": [ ... ]
  }
}
```

- `id`: kebab-case, short, unique-ish (the importer de-duplicates with a `-2`
  suffix if taken). `name`: what the user sees.
- Suggest saving as `<id>.solura-engine.json`.
- Never wrap the engine in prose mid-JSON; put commentary before or after the fence.

## Phases — the heart of the engine

`phases` is an ordered array. Each phase has a `name` and a `cadence`, which is
one of exactly four kinds. The dashboard compiles phases in order into a single
step list, so sequence = the phases top to bottom.

### 1. `action` — manual steps, done one at a time

Steps the human completes and marks Done; the next step becomes due per the
follow-up date. Use for first-contact bursts and re-engagement moments.

```json
{ "name": "First Contact", "cadence": "action", "steps": [
  { "icon": "💬", "text": "Intro text — notify calling in 5 min", "type": "sms" },
  { "icon": "📞", "text": "First call", "type": "call" },
  { "icon": "💬", "text": "Missed you text", "type": "sms", "template": "" }
]}
```

- `type` must be `"call"`, `"sms"`, or `"email"`. `text` is the action label the
  user reads — write it as an instruction ("Second call attempt"), not marketing
  copy. `icon` is a single emoji (📞 💬 📧 fit the house style). `template` is an
  optional prewritten message body.

### 2. `daily` — an N-day blitz with time slots

Automatic scheduling: every day for `days` days, each active slot produces one
step. Use the **slots form** (preferred):

```json
{ "name": "Two-Week Blitz", "cadence": "daily", "daily": {
  "days": 14,
  "slots": {
    "am":  { "pattern": ["call"] },
    "pm":  { "pattern": ["call", "sms", "email"] }
  }
}}
```

- Slots: `am`, `mid`, `pm` — include only the ones you want; **at least one slot
  with a non-empty `pattern` is required** or the engine refuses to compile.
- `pattern` cycles by day: `["call","sms"]` means day 1 call, day 2 sms, day 3
  call… This is how you vary the channel without writing 14 steps.
- Pattern entries must be `call`/`sms`/`email` only. Time windows are built in —
  don't add them.
- (A legacy form `{"days":10,"amType":"call","pmMode":"alternate"}` also
  compiles, but write the slots form for anything new.)

### 3. `weekly` — check-ins, or the forever nurture

Two shapes:

**Fixed check-ins** (weeks are counted from when the lead entered the sequence):

```json
{ "name": "Weekly Check-ins", "cadence": "weekly", "weekly": { "entries": [
  { "week": 2, "type": "sms" },
  { "week": 4, "type": "sms" },
  { "week": 6, "type": "call", "text": "Week 6 check-in call" }
]}}
```

`entries` must be non-empty. `text` is optional per entry.

**Perpetual nurture** — the sticky last phase that never ends (the lead gets one
touch per interval, forever, until they respond or are closed):

```json
{ "name": "Long-term Nurture", "cadence": "weekly", "weekly": {
  "forever": true, "type": "sms", "text": "Long-term nurture — weekly",
  "intervalWeeks": 1
}}
```

`intervalWeeks: 2` = every other week. This forever-phase is also the population
that receives the weekly newsletter — most engines should end with one.

### 4. `interval` — custom gaps: days, weeks, months, years, freely combined

When weekly granularity isn't enough — long tails, quarterly touches, an
anniversary call. Each entry waits its own gap, **counted from when the
previous step was completed**. Gaps combine units freely, and months/years
use real calendar dates (Jan 31 + 1 month lands on Feb 28).

```json
{ "name": "Long Tail", "cadence": "interval", "interval": { "entries": [
  { "after": { "weeks": 2, "days": 3 }, "type": "sms", "template": "..." },
  { "after": { "months": 1 }, "type": "email", "subject": "...", "template": "..." },
  { "after": { "years": 1 }, "type": "call", "text": "Anniversary check-in" }
]}}
```

- `after` takes any mix of `years` / `months` / `weeks` / `days`; at least one
  must be non-zero or the engine refuses to compile.
- Entry fields mirror weekly entries: `type` (call/sms/email), optional `text`
  label, `template`, and `subject` for email.

**Forever at a custom gap** — the sticky nurture generalized (monthly email
forever, quarterly call forever):

```json
{ "name": "Quarterly Nurture", "cadence": "interval", "interval": {
  "forever": true, "every": { "months": 3 }, "type": "email",
  "subject": "...", "template": "..."
}}
```

A sticky `interval` phase behaves exactly like the weekly forever phase (ends
the engine, receives the newsletter) — prefer it whenever the interval is
better said in months than weeks.

**Special touches inside a forever phase** — extra steps layered into the
perpetual nurture. Each fires on a chosen touch number (optionally repeating)
and plays either `"replace"` (instead of the regular touch that cycle) or
`"beside"` (an additional step the same day, queued right after the regular
touch is done). Works on both `weekly` and `interval` forever phases:

```json
{ "name": "Nurture", "cadence": "interval", "interval": {
  "forever": true, "every": { "weeks": 1 }, "type": "sms", "template": "...",
  "specials": [
    { "on": 3, "repeatEvery": 3, "mode": "replace", "type": "email",
      "text": "Quarterly value email", "subject": "...", "template": "..." },
    { "on": 6, "repeatEvery": 0, "mode": "beside", "type": "call",
      "text": "Milestone check-in call", "time": "14:00" }
  ]
}}
```

`on` = first touch number it plays (1-based); `repeatEvery` = 0 for one-time,
N to repeat every N touches after; each special takes its own `type`, `text`,
`template`, `subject` (email), and `time`.

## Design conventions (why the house engines look the way they do)

The proven Solura shape is: **grab attention fast, persist briefly, then fade to
patient nurture.** Concretely:

1. an `action` first-contact phase (text-then-call within minutes wins APFM leads),
2. a `daily` blitz of 5–14 days while the lead is hot,
3. `weekly` check-ins as interest cools,
4. optionally a small `action` re-engagement moment (call + voicemail text),
5. a `forever` weekly nurture to close out — leads park here indefinitely.

Deviate deliberately: a gentle referral engine might skip the blitz entirely; an
email-first professional engine might use `email` patterns throughout. Keep each
engine a **single track** — A/B testing happens by building two engines and
rotating a lead source across them in the dashboard, not by branching inside one.

## Templates live ON the steps

Step templates are the LIVE message source — the dashboard pre-fills the SMS and
email composers from the current step's `template` (there is no separate
templates editor). So a good engine ships with its messages:

- `action` steps: `template` per step; email-type steps ALSO take a `subject`
  field (`{"type":"email","subject":"Care for {pt}","template":"Hi {dm}, …"}`).
- `daily` phases: one phase-level `"template"` inside `daily` — it rides every
  step of the blitz; add a `"subject"` alongside it when the pattern includes
  email.
- `weekly` entries and the `forever` nurture: `template` per entry / phase, plus
  `subject` when the type is email.
- Always use the dedicated `subject` field for email content. (A legacy
  `Subject: …` first line inside the template still parses, but don't write new
  engines that way.)
- Templates may use `{dm}` (decision-maker first name), `{pt}` (patient first
  name), and `{rel}` (the decision-maker's relationship to the patient,
  lowercased — "daughter", "son", "spouse") — filled per lead with safe
  fallbacks ("there" / "your loved one" / "loved one"). `{rel}` reads best
  mid-sentence: "caring for your {rel}" → "caring for your mother".
- Any `action` step, `weekly` entry/forever phase, or `interval` entry/forever
  phase may carry a `time` field (`"time": "14:30"`, 24-hour HH:MM): on its due
  day the step waits in "Later Today" until that clock time. Omit it for
  anytime-that-day steps. Daily-blitz phases have built-in windows instead.
- Calls don't send anything, but a template on a call step is shown as the
  suggested voicemail/talking line — worth writing for key calls.

## Hard rules (violations make the import fail)

- Every phase: a `cadence` of exactly `action`, `daily`, `weekly`, or `interval`.
- `daily` + slots: at least one slot with a non-empty pattern.
- `weekly` without `forever`: non-empty `entries`.
- `interval`: every entry's `after` (and a forever phase's `every`) must have at
  least one non-zero unit.
- Step/pattern types: only `call`, `sms`, `email`.
- The engine must compile to at least one step — no empty `phases`.
- Changing a phase structure on an engine that already has leads shifts what
  their saved position means; for edits to a live engine, prefer adding phases
  at the END, and say so to the user.

## Checklist before handing over

- [ ] Valid JSON (no trailing commas, no comments).
- [ ] Wrapper present (`format: "solura-engine"`).
- [ ] Every phase passes the hard rules above.
- [ ] Ends with a `forever` weekly phase unless the user said otherwise.
- [ ] Step texts read as instructions to the caller, not messages to the lead
      (message copy belongs in `template`).
- [ ] Told the user: import it under ⚙ Settings → Sequence engines → 📥 Import
      package, then route a source or stage to it on the engine's card.

## Complete worked example

A gentle track for referral leads — light first touch, no blitz, biweekly forever:

```json
{
  "format": "solura-engine",
  "formatVersion": 1,
  "engine": {
    "id": "gentle-referral",
    "name": "Gentle Referral Nurture",
    "phases": [
      { "name": "Welcome", "cadence": "action", "steps": [
        { "icon": "💬", "text": "Warm welcome text", "type": "sms",
          "template": "Hi {dm}, this is Meir from Solura Home Care — thank you for thinking of us for {pt}. No rush at all; I'm here when you're ready." },
        { "icon": "📞", "text": "Welcome call (2 days later)", "type": "call" }
      ]},
      { "name": "Light Touch", "cadence": "daily", "daily": {
        "days": 3, "slots": { "am": { "pattern": ["sms", "call", "email"] } }
      }},
      { "name": "Slow Nurture", "cadence": "weekly", "weekly": {
        "forever": true, "type": "sms", "text": "Every-other-week check-in",
        "intervalWeeks": 2
      }}
    ]
  }
}
```
