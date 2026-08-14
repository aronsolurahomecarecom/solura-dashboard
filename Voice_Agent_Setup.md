# Voice Agent Setup — Solura Dashboard ↔ Retell / Vapi

The dashboard is a static page, so a tiny Cloudflare Worker (**the voice bridge**,
`solura-voice-worker.js` in this folder) sits between it and the voice platform.
This is a **second worker**, separate from your tracking worker — deploy it the same way.

```
Voice platform (Retell/Vapi) ──lookup/writeback──▶ Voice bridge worker (KV)
Dashboard ──pushes lead mirror──▶ worker          ◀──polls call results── Dashboard
```

The dashboard pushes every lead's context (name, source, city, variant, consent…)
up to the worker; the agent reads it at call start. When a call ends, the platform
posts the result to the worker; the dashboard picks it up within a minute and writes
it onto the lead — notes, status, booked consult, comms log, opt-out suppression.

---

## 1. Deploy the worker (one time, ~10 minutes)

Requires the same Cloudflare account you used for the tracking worker.

```bash
npm create cloudflare@latest solura-voice -- --type hello-world --no-deploy
```

Then, inside the new `solura-voice` folder:

1. Replace the contents of `src/index.js` with `solura-voice-worker.js` from this folder.
2. Edit `wrangler.jsonc` (or `wrangler.toml`) and add a KV binding named **VOICE_KV**:

```jsonc
{
  "name": "solura-voice",
  "main": "src/index.js",
  "compatibility_date": "2026-08-01",
  "kv_namespaces": [
    { "binding": "VOICE_KV", "id": "<paste the id from the next command>" }
  ]
}
```

3. Create the KV namespace and paste its id into the config above:

```bash
npx wrangler kv namespace create VOICE_KV
```

4. Set the two secrets (make up two long random strings — a password manager's
   generator is perfect; they are two different keys for two different callers):

```bash
npx wrangler secret put VOICE_AGENT_API_KEY
```

```bash
npx wrangler secret put DASH_TOKEN
```

   - `VOICE_AGENT_API_KEY` — given to **Retell/Vapi** (their webhook/API auth header).
   - `DASH_TOKEN` — pasted into the **dashboard's** Settings → 🎙 Voice agent.

5. Deploy:

```bash
npx wrangler deploy
```

Note the URL it prints, e.g. `https://solura-voice.<you>.workers.dev`.

## 2. Connect the dashboard (~1 minute)

Open the dashboard → ⚙ Settings → **🎙 Voice agent**:

1. Worker URL: `https://solura-voice.<you>.workers.dev`
2. Dashboard token: the `DASH_TOKEN` value
3. **Save**, then **🔌 Test connection** — you want: platform key ✓, dashboard
   token ✓, KV ✓, and "mirror synced: N leads".

From then on it's automatic: the mirror re-pushes whenever lead data changes, and
call results are polled on the same cadence as inbound email (Settings → Notifications).

## 3. Point the voice platform at the bridge

Platform-neutral; both Retell and Vapi support these as "custom functions/tools" +
a post-call webhook. All requests need header `Authorization: Bearer <VOICE_AGENT_API_KEY>`.

**Pre-call context (inbound, and to hydrate outbound):**

`POST https://solura-voice.<you>.workers.dev/api/voice/lookup`
Body: `{ "phone": "+12165550142", "direction": "inbound", "call_id": "<platform call id>" }`
Returns the spec-v2 context (`found`, `first_name`, `care_for`, `loved_one_term`,
`lead_source`, `assigned_variant`, `consent`, `opt_out`, `prior_notes`, …) —
inject these as the agent's dynamic variables.

**Post-call webhook (both directions):**

`POST https://solura-voice.<you>.workers.dev/api/voice/writeback`
Body: the spec-v2 writeback payload (`call_id`, `phone`, `outcome`, `reached`,
`captured{…}`, `consult{…}`, `opt_out`, `transcript_url`, …).
Retries are safe — a repeated `call_id` updates rather than duplicates.

**Outbound trigger (Make.com, Option 1 from the spec):** on new lead, have the
Make scenario call `/api/voice/lookup` first, and only create the platform call if
`consent.has_consent` is `true` **and** `opt_out` is `false` — those are hard gates.
Pass the returned fields (including `assigned_variant`) as the call's dynamic variables.

## 4. What the dashboard does with each call result

| Call result | Effect on the lead |
|---|---|
| Any call | 🎙 note line (outcome, captured details, transcript/recording links) + Comms Log row with the A/B/C variant |
| Live conversation (`reached: true`) | Last Contact stamped, marked **responded** → sequence pauses (manual mode) |
| `consult_booked` | Status → Assessment Scheduled; consult date lands in Next Follow-Up |
| `opt_out` / `not_interested` | Status → Not Interested; number joins the do-not-call list here **and** on the worker |
| `wrong_number` | Status → Wrong Number |
| Voicemail / no answer | Note only — the sequence keeps running |
| Unknown inbound caller | A brand-new lead row (source "Voice Agent — Inbound") with everything captured |
| `escalated_urgent` / escalation flags | ⚠ toast the next time the dashboard polls |

Statuses a human already advanced (assessment/proposal/signed/on service) are never auto-changed.

**A/B testing:** each lead's variant (A/B/C) is derived from their phone number —
stable everywhere, no setup. It rides into the agent as `assigned_variant` and comes
back on every writeback into the Comms Log's variant column, so booked-consult rate
per variant is analyzable from data you're already collecting.

## 5. Compliance notes

- Consent + opt-out are enforced in three places: mirror flags, worker DNC list
  (survives even when the dashboard is closed), and the Make/platform gate.
- Phone numbers travel only in request **bodies**, never URLs. Both endpoints are
  HTTPS + bearer-auth.
- Transcript and recording URLs are stored on the lead's notes for compliance review.
