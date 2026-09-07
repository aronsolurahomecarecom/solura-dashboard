---
name: solura-invoice-template
description: Author invoice email templates for the Solura lead dashboard's billing feature (⚙ Settings → Invoicing). Use this whenever the user asks to build, redesign, rewrite, or fix the invoice email, an invoice template, a billing email, or a payment-request design for the Solura dashboard — even if they just describe the look they want ("make the invoice more modern", "add a payment-instructions box"). The output is one HTML snippet pasted into the Settings → Invoicing template box, plus optionally a subject line.
---

# Solura Invoice Template Builder

The Solura dashboard sends invoices to on-service home-care clients from the
shared mailbox **billing@solurahomecare.com**. Meir fills a short form
(invoice #, service period, hours, rate, discounts, due date, notes) and the
dashboard pours those values into ONE editable HTML template. Your job:
produce that template so it pastes cleanly into **⚙ Settings → Invoicing →
Invoice template** and renders correctly in Outlook/Gmail.

## Output format

Emit a single HTML fragment (no ```html fence needed, but fine if used). It
becomes the ENTIRE email body — no wrapper is added around it. Optionally
also give a subject line for the subject box.

## The tokens — the form fills these

| Token | Becomes | Notes |
|---|---|---|
| `{invno}` | INV-1001 | auto-numbered per send |
| `{period}` | Sep 1, 2026 – Sep 7, 2026 | pretty date range |
| `{from}` / `{to}` | Sep 1, 2026 | period ends individually |
| `{hours}` | 32 | as typed |
| `{rate}` | $30.00 | auto money-formatted |
| `{subtotal}` | $960.00 | hours × rate |
| `{discountrow}` | table rows | see below — THE discount mechanism |
| `{discount}` | $146.00 | total of all discounts (rarely needed) |
| `{amount}` | $814.00 | amount due after discounts |
| `{due}` | Sep 21, 2026 | pretty due date |
| `{date}` | issue date | pretty |
| `{notes}` | a styled notes block | see below |
| `{dm}` `{pt}` `{rel}` `{ptrel}` | Karen / Miriam / daughter / parent | per-client name fills with safe fallbacks |

Two tokens are **self-contained blocks that vanish when empty** — never wrap
them in your own labels or rows:

- `{discountrow}` emits complete `<tr>` rows (a Subtotal row plus one labeled
  row per discount, amounts shown negative). Place it INSIDE your main table,
  on its own line **between the rate row and the amount-due row**. When no
  discount is given it renders as nothing — the invoice must look complete
  without it.
- `{notes}` emits a finished highlighted box (already labeled "Notes",
  HTML-escaped, line breaks preserved) or nothing. Place it between the table
  and the closing text. Don't add your own "Notes:" heading.

Money tokens arrive pre-formatted (`$1,234.50`) — don't add `$` signs around
them. Date tokens arrive pretty — don't re-format.

## Hard rules (violations break real invoices)

- **Email-safe HTML only**: inline `style=""` on every element, table-based
  layout for anything structural, max-width ~640px, no `<style>` blocks, no
  external CSS, no JavaScript, no web fonts (system/Georgia stacks only),
  no remote images (there's no reliable image host — build the header from
  colored divs and text, not a logo `<img>`).
- Include `{amount}` and `{due}` — an invoice without the amount due and due
  date is not an invoice. `{invno}` strongly recommended.
- Keep `{discountrow}` inside a `<table>` — it emits `<tr>` elements and will
  render broken anywhere else. If your design has no table, wrap the money
  summary in one.
- Never hard-code an amount, client name, or date — everything variable comes
  from a token.
- The template must read correctly when OPTIONAL tokens are empty: no
  discount, no notes, missing `{pt}` (fills "your loved one").

## House style (deviate only when asked)

- Brand colors: deep green `#1f4d3a` (header, accents), warm cream
  `#f6f1e6` / `#fffdf8` (panels), border `#e4ddcf`, text `#2a2a28`.
- Georgia/serif voice, warm and personal — this goes to a family paying for
  a parent's care, not a corporation. Open with `Dear {dm},` and a thank-you
  line mentioning `{pt}`; close warmly ("With gratitude") with a reply-or-call
  line: (216) 770-4886.
- Footer identity: Solura Home Care · Licensed Ohio Home Care · License
  4574HHN · (216) 770-4886.
- The money table: label column shaded cream + bold, value column plain;
  Amount due row slightly larger and bold.

## Worked example (this is the built-in default — a safe starting skeleton)

```html
<div style="max-width:640px;margin:0 auto;font-family:Georgia,'Times New Roman',serif;color:#2a2a28">
  <div style="background:#1f4d3a;color:#fff;padding:26px 30px;border-radius:10px 10px 0 0">
    <div style="font-size:21px;font-weight:700">Solura Home Care</div>
    <div style="font-size:12px;opacity:.85;margin-top:4px">Licensed Ohio Home Care · License 4574HHN · (216) 770-4886</div>
  </div>
  <div style="border:1px solid #ddd;border-top:none;padding:26px 30px;border-radius:0 0 10px 10px;background:#fffdf8">
    <div style="font-size:17px;font-weight:700">Invoice {invno}</div>
    <div style="font-size:12.5px;color:#777;margin-bottom:18px">Issued {date}</div>
    <p style="font-size:14px;line-height:1.55">Dear {dm},</p>
    <p style="font-size:14px;line-height:1.55">Thank you for trusting Solura with {pt}'s care. Here is the invoice for services provided.</p>
    <table style="width:100%;border-collapse:collapse;font-size:13.5px;margin-bottom:18px">
      <tr><td style="padding:9px 12px;border:1px solid #e4ddcf;background:#f6f1e6;font-weight:700;width:45%">Service period</td><td style="padding:9px 12px;border:1px solid #e4ddcf">{period}</td></tr>
      <tr><td style="padding:9px 12px;border:1px solid #e4ddcf;background:#f6f1e6;font-weight:700">Hours of care</td><td style="padding:9px 12px;border:1px solid #e4ddcf">{hours}</td></tr>
      <tr><td style="padding:9px 12px;border:1px solid #e4ddcf;background:#f6f1e6;font-weight:700">Hourly rate</td><td style="padding:9px 12px;border:1px solid #e4ddcf">{rate}</td></tr>
      {discountrow}
      <tr><td style="padding:9px 12px;border:1px solid #e4ddcf;background:#f6f1e6;font-weight:700;font-size:15px">Amount due</td><td style="padding:9px 12px;border:1px solid #e4ddcf;font-weight:700;font-size:15px">{amount}</td></tr>
      <tr><td style="padding:9px 12px;border:1px solid #e4ddcf;background:#f6f1e6;font-weight:700">Due date</td><td style="padding:9px 12px;border:1px solid #e4ddcf">{due}</td></tr>
    </table>
    {notes}
    <p style="font-size:13.5px;line-height:1.55;margin-top:18px">Questions about this invoice? Just reply to this email or call (216) 770-4886.</p>
    <p style="font-size:13.5px;margin-top:14px">With gratitude,<br><b>Solura Home Care — Billing</b></p>
  </div>
</div>
```

Default subject: `Invoice {invno} — Solura Home Care ({period})` — subjects
take the same tokens.

## Common requests and how to satisfy them

- **Payment instructions** (Zelle, check, portal link): add a cream panel
  between `{notes}` and the closing text with the details the user gives you.
  Never invent payment details.
- **A different tone/brand**: restyle freely but keep the hard rules —
  tokens, email-safe HTML, complete-when-optional-tokens-empty.
- **Itemized services**: the form only captures hours × rate. Extra line
  items belong in the notes (or ask the user if they want the dashboard
  changed — that's a code request, not a template).

## Checklist before handing over

- [ ] `{amount}` and `{due}` present; `{discountrow}` on its own line inside
      the money table; `{notes}` present outside it.
- [ ] Every style inline; no images, scripts, or `<style>` blocks.
- [ ] Reads correctly with no discounts and no notes.
- [ ] No hard-coded names, amounts, or dates.
- [ ] Told the user: paste into ⚙ Settings → Invoicing → Invoice template
      (and subject into the subject box), hit the Save bar, then 👁 Preview
      on any invoice to check it. Clearing the box restores the built-in.
