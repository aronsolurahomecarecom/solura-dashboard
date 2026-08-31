# Newsletter via Resend Broadcasts — Setup (pairs with dashboard B-0821-52)

Only the newsletter runs on Resend. Every sequence email, care plan, and one-to-one
follow-up stays on Outlook / Microsoft Graph exactly as before.

## One-time setup (~10 minutes)

1. **Paste the updated tracking worker** (`solura-track-worker.js`, v6.2) over your
   `falling-rain-de79` worker in Cloudflare and Deploy. Resend's API blocks browser
   calls (no CORS), so the dashboard relays through the worker you already run.
   The relay is a strict allowlist: contact sync, domain check, broadcast send.
   Resend still owns the entire unsubscribe flow — the worker never touches it.

2. **Add the Resend API key as a worker secret** — Cloudflare → the worker →
   Settings → Variables and Secrets → Add → name exactly `RESEND_API_KEY`, paste the
   key scoped to `hello.solurahomecare.com`, type Secret, Deploy.
   The key never exists in the dashboard, its config, or this repo.

3. **Create the Audience in Resend** (Audiences → Create, e.g. "Solura Newsletter")
   and copy its ID.

4. **Dashboard** → ⚙ Settings → 📰 Newsletter: paste the Audience ID (From and
   Reply-To are prefilled), Save, then **Test connection**. You want:
   `Domain hello.solurahomecare.com: verified ✓` and the audience count line.

## Using it

- **Sync contacts**: keep the cap at 50 for the first sync (most recently engaged
  leads go first). Roughly double the cap every few days over 3–4 weeks — the
  audience count shown by Test connection is your send count, and the free tier
  (100/day, 3,000/month) covers the whole ramp.
- **Send**: Load the Solura template, edit the middle paragraphs, keep the footer
  (the send button refuses if the unsubscribe tag or street address is missing, if
  the tag is doubled, or if no Audience is set — that combination ships a broken
  unsubscribe).
- Unsubscribes flow back automatically on every dashboard load: column AD gets the
  timestamp, column T reads `Unsubscribed`, the lead leaves every automated queue,
  the sequence never advances them, the weekly nurture never auto-loads, and the
  voice agent's lookup reports them opted out. Manual one-to-one email stays
  possible — the composer shows a red banner so it is a deliberate choice.

## First-send acceptance (from the spec)

1. Sync, confirm contacts appear in the Resend Audience.
2. Broadcast to a test address; Gmail → Show original must show
   `dkim=pass header.d=hello.solurahomecare.com`, `spf=pass`, `dmarc=pass (p=NONE)`.
3. Gmail must render its native Unsubscribe next to the sender — if not, the
   broadcast was not attached to the Audience.
4. Click unsubscribe → reload the dashboard (or 🚫 Sync unsubscribes) → column AD
   and T update and the lead disappears from the queues.
5. Re-run contact sync → that lead is not re-added (summary shows it under
   "unsubscribed (never re-added)").
6. `node tests/newsletter.test.mjs` → green.
