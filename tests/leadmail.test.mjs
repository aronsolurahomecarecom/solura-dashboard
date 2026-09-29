// 📧 Lead mail tests (B-0929-102). Slices the ⚡LEADMAIL region and drives
// it against a stubbed Graph: full per-lead history, merge/dedupe, the
// filter→search fallback, the Email tab ordering, and unread surfacing.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');

let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };

const b = html.indexOf('/* ⚡LEADMAIL — BEGIN');
const e = html.indexOf('/* ⚡LEADMAIL — END */');
if (b < 0 || e < 0) throw new Error('LEADMAIL markers missing');
const src = html.slice(html.indexOf('*/', b) + 2, e);

// ── stub environment ──
const C = { NM: 0, DM: 1, EM: 5, ST: 12 };
const DATA_START = 1;
const rows = [
  ['HEADER'],
  ['Miriam Gold', 'Sarah Gold', , , , 'sarah@example.com'],
  ['Joe Levin', '', , , , 'joe@example.com'],
  ['No Email', '', , , , ''],
];
const inboundEmailCache = {
  'sarah@example.com': [
    { id: 'live1', subject: 'Re: checking in', fromAddr: 'sarah@example.com', fromName: 'Sarah', receivedTs: 1770000000000, receivedAt: '', preview: 'live', webLink: '', isRead: false },
  ],
};
const readTsByEmail = { 'sarah@example.com': 1000, 'joe@example.com': 99999 };
const env = {
  normEmail: (s) => String(s || '').trim().toLowerCase(),
  inboundEmailCache, rows, C, DATA_START,
  inboxLastReadTs: (em) => readTsByEmail[String(em || '').toLowerCase()] || 0,
  unreadCountFor: (em) => {
    const e2 = String(em || '').toLowerCase();
    const rt = readTsByEmail[e2] || 0;
    return (inboundEmailCache[e2] || []).filter((m) => m.receivedTs > rt).length;
  },
  inboundFor: (ri) => inboundEmailCache[String((rows[ri] || [])[C.EM] || '').toLowerCase()] || [],
  escapeHtml: (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
  el: () => null,
  fetchInboundFullBody: async (x) => x,
  showErr: () => {},
  GR: 'https://graph.test',
  gfetchCalls: [],
};
env.gfetch = async (url) => {
  env.gfetchCalls.push(url);
  if (env.gfetchMode === 'filter-rejected' && url.indexOf('%24filter') < 0 && url.indexOf('$filter') < 0) {
    // search fallback succeeds
    return { ok: true, json: async () => ({ value: env.gfetchPayload || [] }) };
  }
  if (env.gfetchMode === 'filter-rejected') return { ok: false, status: 400 };
  return { ok: true, json: async () => ({ value: env.gfetchPayload || [] }) };
};

const names = ['normEmail', 'inboundEmailCache', 'rows', 'C', 'DATA_START', 'inboxLastReadTs',
  'unreadCountFor', 'inboundFor', 'escapeHtml', 'el', 'fetchInboundFullBody', 'showErr', 'GR', 'gfetch'];
const mk = new Function(...names,
  src + '\nreturn {mailEntryFromGraph,mergeMailLists,mailboxOrder,mailDomId,fetchLeadEmailHistory,leadMailCached,findMailEntry,leadsWithUnread,leadMailCardHtml,renderInboundFor:typeof renderInboundFor==="function"?renderInboundFor:null};');
const L = mk(...names.map((n) => env[n]));

// ── mailEntryFromGraph ──
{
  const en = L.mailEntryFromGraph({
    id: 'AAMk=xyz/1+2', subject: 'Hello', receivedDateTime: '2025-03-01T14:00:00Z',
    from: { emailAddress: { address: 'Sarah@Example.com', name: 'Sarah G' } },
    bodyPreview: 'hi there', webLink: 'https://outlook.example/x', isRead: false,
  });
  ok(en.fromAddr === 'Sarah@Example.com' && en.fromName === 'Sarah G' && en.receivedTs > 0, 'graph message maps to a cache-shaped entry');
  ok(L.mailEntryFromGraph({ id: 'x' }).subject === '(no subject)', 'subjectless mail still labeled');
  ok(L.mailDomId('AAMk=xyz/1+2') === 'AAMkxyz12', 'graph ids sanitize to safe element ids');
}

// ── mergeMailLists ──
{
  const m = L.mergeMailLists(
    [{ id: 'a', receivedTs: 10 }, { id: 'b', receivedTs: 30 }],
    [{ id: 'a', receivedTs: 10 }, { id: 'c', receivedTs: 20 }]
  );
  ok(m.length === 3 && m[0].id === 'b' && m[1].id === 'c' && m[2].id === 'a', 'merge dedupes by id and sorts newest first');
}

// ── mailboxOrder: unread leads float, then newest first ──
{
  const items = [
    { unread: 0, latestTs: 900 },
    { unread: 2, latestTs: 100 },
    { unread: 0, latestTs: 500 },
    { unread: 1, latestTs: 300 },
  ].sort(L.mailboxOrder);
  ok(items[0].unread > 0 && items[1].unread > 0 && items[0].latestTs === 300, 'unread leads first, newest of them on top');
  ok(items[2].latestTs === 900 && items[3].latestTs === 500, 'read leads follow by latest message');
}

// ── fetchLeadEmailHistory: full history, merged with the live cache ──
{
  env.gfetchMode = 'ok';
  env.gfetchPayload = [
    { id: 'old1', subject: 'From January', receivedDateTime: '2025-01-05T10:00:00Z', from: { emailAddress: { address: 'sarah@example.com', name: 'Sarah' } }, bodyPreview: 'way back' },
    { id: 'stranger', subject: 'spoof', receivedDateTime: '2025-01-06T10:00:00Z', from: { emailAddress: { address: 'other@x.com' } } },
  ];
  const msgs = await L.fetchLeadEmailHistory('Sarah@Example.com');
  ok(env.gfetchCalls.length === 1 && /from%2FemailAddress%2Faddress%20eq/.test(env.gfetchCalls[0]), 'history queries the WHOLE mailbox by sender (no date floor)');
  ok(msgs.some((m) => m.id === 'old1') && msgs.some((m) => m.id === 'live1'), 'old mail and the live 48h cache merge into one history');
  ok(!msgs.some((m) => m.id === 'stranger'), 'messages from other senders never leak into a lead history');
  ok(msgs[0].id === 'live1', 'merged history is newest first');
  const again = await L.fetchLeadEmailHistory('sarah@example.com');
  ok(env.gfetchCalls.length === 1 && again.length === msgs.length, 'second open within 5 min serves the cache — no refetch');
  ok(L.leadMailCached('sarah@example.com').length === msgs.length, 'history lands in the session cache');
}

// ── filter→search fallback ──
{
  env.gfetchCalls.length = 0;
  env.gfetchMode = 'filter-rejected';
  env.gfetchPayload = [
    { id: 'j1', subject: 'Hi', receivedDateTime: '2025-02-01T10:00:00Z', from: { emailAddress: { address: 'joe@example.com' } }, bodyPreview: '' },
  ];
  const msgs = await L.fetchLeadEmailHistory('joe@example.com');
  ok(env.gfetchCalls.length === 2 && /%24search|\$search/.test(env.gfetchCalls[1]), 'a rejected from-filter falls back to KQL $search');
  ok(msgs.length === 1 && msgs[0].id === 'j1', 'fallback still returns their history');
}

// ── findMailEntry reaches both caches ──
{
  ok(L.findMailEntry(1, 'live1') && L.findMailEntry(1, 'live1').id === 'live1', 'reply target found in the live cache');
  ok(L.findMailEntry(1, 'old1') && L.findMailEntry(1, 'old1').id === 'old1', 'reply target found in fetched HISTORY too — old mail is replyable');
  ok(L.findMailEntry(1, 'nope') === null, 'unknown id returns null, never throws');
}

// ── leadsWithUnread: surfacing ──
{
  const u = L.leadsWithUnread();
  ok(u.length === 1 && u[0].ri === 1 && u[0].n === 1, 'only leads with unread inbound surface (read leads stay put)');
}

// ── message card: replyable + unread stays visible ──
{
  const card = L.leadMailCardHtml(1, { id: 'old1', subject: 'From January', fromAddr: 'sarah@example.com', fromName: 'Sarah', receivedTs: 2000, preview: 'way back', webLink: 'https://o' }, 1000);
  ok(/data-action="reply-inbound"/.test(card) && /data-mid="old1"/.test(card), 'every history message carries a Reply button');
  ok(/● /.test(card), 'unread messages keep their ● marker inside the fold');
  ok(/lead-mail-full/.test(card), 'full-message expand available per message');
  const read = L.leadMailCardHtml(1, { id: 'old1', subject: 'x', fromAddr: 'a', receivedTs: 500, preview: '' }, 1000);
  ok(!/● /.test(read), 'read messages carry no unread marker');
}

// ── source-level locks on the wiring ──
ok(/id="btn-mailbox"/.test(html) && /data-action="open-mailbox"/.test(html), '📧 Email tab button lives in the header');
ok(/id="modal-mailbox"/.test(html) && /id="mailbox-list"/.test(html), 'Email tab modal exists');
ok(/id="reply-surface"/.test(html) && /data-action="surface-lead"/.test(html), 'unread leads surface in a strip above the buckets');
ok(/var entry=findMailEntry\(rri,mid\)/.test(html), 'the reply handler reaches history messages, not just the 48h cache');
ok(/data-action="toggle-lead-mail"/.test(html) && /id="lead-mail-fold-'\+ri\+'" style="display:none"/.test(html), 'drawer emails are folded into an expandable, collapsed by default');
const exp = html.slice(html.indexOf('async function expandLeadMail'), html.indexOf('async function openMailbox'));
ok(exp.length > 0 && !/markInboxRead/.test(exp), 'expanding NEVER auto-marks read — unread behaves like till now');
ok(/data-action="mark-inbox-read"/.test(exp), 'the explicit Mark-all-as-read button rides the fold when unread exists');
ok(/try\{renderReplySurface\(\);\}catch\(_\)\{\}/.test(html.slice(html.indexOf('async function pollInboundMail'), html.indexOf('/* ─── Deliverability watch'))), 'each inbound poll re-surfaces leads who wrote');
ok(/var bmx=el\('btn-mailbox'\);if\(bmx\)bmx\.style\.display='inline-block';/.test(html), 'the Email tab button shows after sign-in');
ok(/case 'surface-lead':[\s\S]{0,180}_leadMailOpen\['lead-mail-fold-'\+ri\]=true;openDrawer\(ri\)/.test(html), 'clicking a surfaced lead opens them with their emails expanded');
ok(/if\(_leadMailOpen\['lead-mail-fold-'\+ri\]\)expandLeadMail\(ri/.test(html), 'a drawer re-render restores an open email fold instead of collapsing it');

console.log('\nLead mail: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
