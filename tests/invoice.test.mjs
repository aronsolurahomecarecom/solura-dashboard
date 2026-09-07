// 🧾 Invoicing tests (B-0907-75): template fill, money/date formatting,
// notes block, defaults, and the send-path wiring (shared-mailbox from).
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

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cfgStore = {};
const mk = new Function('cfg', 'lc', 'escapeHtml',
  src + '\nreturn {DEFAULT_INVOICE_FROM,DEFAULT_INVOICE_SUBJECT,DEFAULT_INVOICE_TEMPLATE,invoiceCfg,isOnService,fmtMoney,invPrettyDate,fillInvoiceTokens,resolveDiscount,resolveDiscounts,hhaNameMatch,hhaParseDate,hhaParseHours,parseHhaSheet,sumHhaHours};');
const I = mk(k => cfgStore[k], v => String(v || '').toLowerCase().trim(), esc);

// ── status gate ──
ok(I.isOnService('On Service') && I.isOnService('on service — 20h/wk'), 'On Service status detected (exact and annotated)');
ok(!I.isOnService('Active Conversation') && !I.isOnService('Assessment Scheduled') && !I.isOnService(''), 'other statuses show no invoice button');

// ── formatting ──
ok(I.fmtMoney('1234.5') === '$1,234.50' && I.fmtMoney('30') === '$30.00', 'money formats with cents and thousands');
ok(I.fmtMoney('$1,200') === '$1,200.00', 'already-dollared input re-parses cleanly');
ok(I.fmtMoney('varies') === 'varies' && I.fmtMoney('') === '', 'free text and blank pass through');
ok(I.invPrettyDate('2026-09-01') === 'Sep 1, 2026' && I.invPrettyDate('TBD') === 'TBD', 'ISO dates prettify; anything else passes through');

// ── config defaults ──
ok(I.invoiceCfg().from === 'billing@solurahomecare.com', 'billing mailbox default');
ok(I.invoiceCfg().template === I.DEFAULT_INVOICE_TEMPLATE, 'blank config → built-in template');
cfgStore.invoiceTemplate = '<p>custom {invno}</p>'; cfgStore.billingFrom = 'pay@x.com';
ok(I.invoiceCfg().template === '<p>custom {invno}</p>' && I.invoiceCfg().from === 'pay@x.com', 'settings overrides win');
delete cfgStore.invoiceTemplate; delete cfgStore.billingFrom;

// ── template fill ──
const F = { invno: 'INV-1001', from: '2026-09-01', to: '2026-09-07', hours: '32', rate: '30', amount: '960', due: '2026-09-21', notes: 'Two extra weekend shifts\nas discussed.', date: '2026-09-07' };
const out = I.fillInvoiceTokens(I.DEFAULT_INVOICE_TEMPLATE, F);
ok(out.indexOf('INV-1001') > -1, 'invoice number lands');
ok(out.indexOf('Sep 1, 2026 – Sep 7, 2026') > -1, 'period renders as a pretty range');
ok(out.indexOf('$30.00') > -1 && out.indexOf('$960.00') > -1, 'rate + amount formatted as money');
ok(out.indexOf('Sep 21, 2026') > -1, 'due date pretty');
ok(out.indexOf('Two extra weekend shifts<br>as discussed.') > -1 && out.indexOf('<b>Notes</b>') > -1, 'notes become a styled block with line breaks');
ok(out.indexOf('{') === out.indexOf('{dm}'), 'no unfilled invoice tokens remain (only the name tokens for fillNames)');
const noNotes = I.fillInvoiceTokens(I.DEFAULT_INVOICE_TEMPLATE, Object.assign({}, F, { notes: '' }));
ok(noNotes.indexOf('Notes') === -1 && noNotes.indexOf('{notes}') === -1, 'blank notes: the block vanishes entirely');
const evil = I.fillInvoiceTokens('<div>{notes}</div>', Object.assign({}, F, { notes: '<script>alert(1)</script>' }));
ok(evil.indexOf('<script>') === -1 && evil.indexOf('&lt;script&gt;') > -1, 'notes are HTML-escaped (no injection into the email)');

// ── discounts (B-0907-76) ──
ok(I.resolveDiscount('50', 960).amt === 50 && I.resolveDiscount('50', 960).label === '', 'flat $50 discount');
ok(I.resolveDiscount('$1,000', 5000).amt === 1000, 'dollar-formatted flat discount parses');
ok(I.resolveDiscount('10%', 960).amt === 96 && I.resolveDiscount('10%', 960).label === '10%', 'percent resolves against subtotal, keeps its label');
ok(I.resolveDiscount('2.5%', 1000).amt === 25, 'fractional percent');
ok(I.resolveDiscount('', 960).amt === 0 && I.resolveDiscount('free', 960).amt === 0 && I.resolveDiscount('-20', 960).amt === 0, 'blank / junk / negative → no discount');
{
  const FD = Object.assign({}, F, { discount: '10%', amount: '864' });
  const d1 = I.fillInvoiceTokens(I.DEFAULT_INVOICE_TEMPLATE, FD);
  ok(d1.indexOf('Subtotal') > -1 && d1.indexOf('$960.00') > -1, 'discount invoice shows the subtotal line');
  ok(d1.indexOf('Discount (10%)') > -1 && d1.indexOf('−$96.00') > -1, 'discount line labeled with the percent, shown negative');
  ok(d1.indexOf('$864.00') > -1, 'amount due reflects the discount');
  const d0 = I.fillInvoiceTokens(I.DEFAULT_INVOICE_TEMPLATE, F);
  ok(d0.indexOf('Subtotal') === -1 && d0.indexOf('Discount') === -1 && d0.indexOf('{discountrow}') === -1, 'no discount → rows vanish, no leftover token');
  const custom = I.fillInvoiceTokens('<p>{subtotal} minus {discount} = {amount}</p>', Object.assign({}, F, { discount: '60', amount: '900' }));
  ok(custom === '<p>$960.00 minus $60.00 = $900.00</p>', 'granular {subtotal}/{discount} tokens work in custom templates');
}
// ── multiple discounts + attachments (B-0907-77) ──
{
  const multi = I.resolveDiscounts([{ label: 'Veteran', value: '10%' }, { label: 'Referral credit', value: '50' }, { label: 'junk', value: 'nope' }], 960);
  ok(multi.total === 146 && multi.items.length === 2, 'discounts stack (10% of 960 + $50 = $146), junk skipped');
  ok(multi.items[0].label === 'Veteran' && multi.items[0].pct === '10%', 'labels and percent tags survive');
  ok(I.resolveDiscounts([{ value: '10%' }, { value: '5%' }], 1000).total === 150, 'each percent resolves against the SUBTOTAL (10%+5% = 15%)');
  ok(I.resolveDiscounts([], 960).total === 0 && I.resolveDiscounts(null, 960).total === 0, 'empty list → zero');
  const dm = I.fillInvoiceTokens(I.DEFAULT_INVOICE_TEMPLATE, Object.assign({}, F, {
    discounts: [{ label: 'Veteran', value: '10%' }, { label: '', value: '50' }], amount: '814' }));
  ok(dm.indexOf('Veteran (10%)') > -1 && dm.indexOf('−$96.00') > -1, 'labeled percent discount gets its own invoice line');
  ok(dm.indexOf('>Discount<') > -1 && dm.indexOf('−$50.00') > -1, 'unlabeled discount falls back to plain Discount line');
  ok(dm.indexOf('Subtotal') > -1 && dm.indexOf('$960.00') > -1 && dm.indexOf('$814.00') > -1, 'subtotal + net amount both shown');
  const dEvil = I.fillInvoiceTokens('<div>{discountrow}</div>', Object.assign({}, F, { discounts: [{ label: '<img onerror=x>', value: '5' }] }));
  ok(dEvil.indexOf('<img') === -1 && dEvil.indexOf('&lt;img') > -1, 'discount labels are HTML-escaped');
  ok(I.fillInvoiceTokens('<p>{discount}</p>', Object.assign({}, F, { discount: '60' })).indexOf('$60.00') > -1, 'legacy single-string discount still fills');
}
ok(/id="inv-discounts"/.test(html) && /inv-add-disc/.test(html) && /inv-del-disc/.test(html), 'discount list UI wired (add/remove rows)');
ok(/inv-disc-val/.test(html) && /invRecalcAmount\(\)/.test(html), 'discount rows feed the live amount recalc');
ok(/resolveDiscounts\(f\.discounts,n\)/.test(html), 'send-time amount fallback subtracts ALL discounts');
ok(/id="inv-file"/.test(html) && /inv-attach/.test(html) && /inv-del-att/.test(html), 'attachment picker wired (add/remove chips)');
ok(/payload\.message\.attachments=_invAtts\.map/.test(html), 'attachments ride the invoice send as fileAttachments');
ok(/under ~2\.5 MB total/.test(html), 'oversize attachments refused with guidance before sending');
ok(/_invAtts=\[\];_invDiscounts=\[\];/.test(html) && /_invDiscounts=\[\];_invAtts=\[\];/.test(html), 'state resets on open AND after send');

// ── ⏱ HHAeXchange export hours import (B-0907-79) ──
{
  ok(I.hhaNameMatch('Gold, Miriam', 'Miriam Gold') && I.hhaNameMatch('MIRIAM GOLD', 'Miriam Gold'), 'Last, First and case differences still match');
  ok(I.hhaNameMatch('Miriam R Gold', 'Miriam Gold'), 'middle initial in the export tolerated');
  ok(!I.hhaNameMatch('Miriam Goldberg', 'Miriam Gold') && !I.hhaNameMatch('', 'Miriam Gold'), 'different surname / blank never match');
  ok(I.hhaParseHours('4:30') === 4.5 && I.hhaParseHours('3.25') === 3.25 && I.hhaParseHours('n/a') === null, 'H:MM durations, decimals, junk');
  ok(I.hhaParseDate('9/3/2026').getDate() === 3 && I.hhaParseDate('2026-09-03').getMonth() === 8, 'both common date formats parse');
  // A realistic visit-report shape: preamble rows, then headers, mixed data
  const aoa = [
    ['Solura Home Care', '', '', ''],
    ['Visit Report 9/1/2026 - 9/30/2026', '', '', ''],
    ['Patient Name', 'Visit Date', 'Caregiver', 'Hours'],
    ['Gold, Miriam', '9/2/2026', 'A. Smith', '4:30'],
    ['Gold, Miriam', '9/4/2026', 'A. Smith', 4],
    ['Gold, Miriam', '9/20/2026', 'A. Smith', 5],
    ['Katz, David', '9/2/2026', 'B. Jones', 6],
    ['', '', '', ''],
    ['Total', '', '', 19.5]
  ];
  const parsed = I.parseHhaSheet(aoa);
  ok(parsed && parsed.rows.length === 5, 'header row found past the report preamble; blank rows skipped');
  const res = I.sumHhaHours(parsed, 'Miriam Gold', '2026-09-01', '2026-09-07');
  ok(res.visits === 2 && res.hours === 8.5, 'sums only HER visits INSIDE the service period (4:30 + 4)');
  ok(I.sumHhaHours(parsed, 'Miriam Gold', '', '').visits === 3, 'no period set → all her visits count');
  const miss = I.sumHhaHours(parsed, 'Sarah Levy', '2026-09-01', '2026-09-07');
  ok(miss.visits === 0 && miss.names.some(n => n === 'Gold, Miriam'), 'no match → names in the file surfaced for diagnosis');
  // Excel TIME-fraction column (most values < 1 → fractions of a day)
  const aoaFrac = [
    ['Client Name', 'Date', 'Duration'],
    ['Gold, Miriam', new Date(2026, 8, 2), 0.1875],
    ['Gold, Miriam', new Date(2026, 8, 3), 0.25],
    ['Gold, Miriam', new Date(2026, 8, 4), 0.5]
  ];
  const fr = I.sumHhaHours(I.parseHhaSheet(aoaFrac), 'Miriam Gold', '2026-09-01', '2026-09-07');
  ok(fr.hours === 22.5, 'Excel time cells convert (0.1875+0.25+0.5 days = 4.5+6+12 = 22.5 hours)');
  ok(I.parseHhaSheet([['just', 'random'], ['data', 1]]) === null, 'file without recognizable headers refused, not misread');
}
ok(/id="inv-hha-file"/.test(html) && /inv-hha-pull/.test(html), 'HHA pull button + file input wired on the invoice');
ok(/sumHhaHours\(parsed,patient/.test(html) && /invRecalcAmount\(\)/.test(html), 'matched hours fill the field and recalc the amount');
ok(/Names in the file:/.test(html), 'no-match case explains itself with the names it saw');

// ── send-path + UI wiring (source locks) ──
ok(/Mail\.Send\.Shared/.test(html) && (html.match(/Mail\.Send\.Shared/g) || []).length >= 2, 'Mail.Send.Shared scope requested on auth AND refresh');
ok(/from:\{emailAddress:\{address:em\.from\}\}/.test(html), 'send payload carries the billing-mailbox from override');
ok(/SendAsDenied|ErrorSendAs/.test(html), 'Send As denial gets the plain-language fix message');
ok(/outcome:'invoice-sent'/.test(html), 'invoice sends land in the Comms Log');
ok(/setCfg\('invoiceNextNo',cur9\+1\)/.test(html), 'invoice counter advances after a successful send');
ok(/isOnService\(l\.status\)/.test(html) && /data-action="open-invoice"/.test(html), 'invoice button gated on On Service leads');
ok((html.match(/\+inv;/g) || []).length === 3, 'button rides all three button-row layouts');
ok(/id="st-sec-invoicing" hidden/.test(html) && /data-cfg="invoiceTemplate"/.test(html), 'Settings → Invoicing is its own tab section (hidden until selected)');
ok(/data-sec="invoicing">🧾 Invoicing<\/button>/.test(html), 'Invoicing has its own nav button in Settings');
ok(!/trackingPixelHtml\(_invRi/.test(html) && !/_trkPx/.test(src), 'invoices carry no tracking pixel');

console.log('\nInvoicing: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
