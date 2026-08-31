/* ─── Solura Open Tracker — Worker v2 ("owner-aware") ────────────────────
 * Drop-in replacement for the original tracking worker. Same URL, same
 * TRACK_TOKEN secret, same KV — paste this over the old code and Deploy.
 *
 * WHY v2: opening your OWN sent email (Outlook Sent Items, or reading a
 * lead's reply that quotes your message) loads the pixel and falsely
 * counted as the LEAD opening it. v2 learns the "owner's" networks from
 * the dashboard's own authenticated /events polling — every device that
 * runs the dashboard registers its IP automatically — and records pixel
 * or doc hits from those IPs as SELF-opens, excluded from /events.
 * Limitation: reading mail on a network where the dashboard never runs
 * (e.g. phone on LTE) isn't filtered; open the dashboard there once to
 * teach it.
 *
 * Routes (contract identical to v1, as consumed by the dashboard):
 *   GET /px?d=<b64 {r,e,s,i}>       1x1 gif; records an open event
 *   GET /doc?u=<url>&d=<b64 meta>   302 redirect; records a doc_open
 *   GET /events?since=<ts>&token=&cb=   queued events (JSONP-capable)
 *   GET /ping?cb=                   {ok,v,hasToken,hasKV,selfOpens}
 *
 * KV keys: ev:<ts>:<rand> = event JSON (7-day TTL) · self:<ts>:<rand> =
 * filtered self-open (3-day TTL, diagnostics) · owner_ips = {ip: lastSeen}
 * ─────────────────────────────────────────────────────────────────────── */

var VERSION = '6.3-owner'; // 6.3: /resend gains the sendEmail op (per-lead
// weekly-newsletter sends routed through Resend). 6.1: paginated listing — v6.0 listed only the
// OLDEST 100 keys (lexicographic = chronological), so once 100+ events
// accumulated in the 7-day window, NEW events could never be returned.
// 6.2: /resend relay — Resend's API sends no CORS headers, so the browser
// dashboard cannot call it directly. This is a NARROW allowlisted relay
// (contacts sync, domain check, broadcast create/send), NOT unsubscribe
// infrastructure — Resend hosts and owns the entire unsubscribe flow.
// Requires a second secret: RESEND_API_KEY. Auth: same TRACK_TOKEN.
var EV_TTL = 7 * 24 * 3600;
var SELF_TTL = 3 * 24 * 3600;
var OWNER_TTL_MS = 45 * 24 * 3600 * 1000; // forget an owner IP after 45 quiet days

var GIF = Uint8Array.from(atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), function (c) { return c.charCodeAt(0); });

var CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function kvOf(env) {
  // Binding name varies by install — find the first KV-shaped binding.
  if (env.TRACK_KV) return env.TRACK_KV;
  if (env.KV) return env.KV;
  for (var k in env) {
    var v = env[k];
    if (v && typeof v.get === 'function' && typeof v.put === 'function' && typeof v.list === 'function') return v;
  }
  return null;
}

function json(obj, status, cb) {
  if (cb) {
    return new Response(cb + '(' + JSON.stringify(obj) + ')', {
      status: 200, headers: Object.assign({ 'Content-Type': 'application/javascript' }, CORS)
    });
  }
  return new Response(JSON.stringify(obj), {
    status: status || 200, headers: Object.assign({ 'Content-Type': 'application/json' }, CORS)
  });
}

async function readJson(req) {
  try { return await req.json(); } catch (_) { return null; }
}

function decodeMeta(d) {
  try { return JSON.parse(decodeURIComponent(escape(atob(String(d || ''))))); }
  catch (_) { try { return JSON.parse(atob(String(d || ''))); } catch (_2) { return {}; } }
}

async function getOwners(kv) {
  try { return (await kv.get('owner_ips', 'json')) || {}; } catch (_) { return {}; }
}

async function recordEvent(kv, isSelf, ev) {
  var key = (isSelf ? 'self:' : 'ev:') + ev.ts + ':' + Math.random().toString(36).slice(2, 8);
  await kv.put(key, JSON.stringify(ev), { expirationTtl: isSelf ? SELF_TTL : EV_TTL });
}

// Walk the ENTIRE keyspace for a prefix (KV list pages at 1000/keys call).
// The timestamp lives IN the key, so freshness filtering needs zero gets.
async function listAllKeys(kv, prefix) {
  var names = [], cursor;
  do {
    var res = await kv.list(cursor ? { prefix: prefix, limit: 1000, cursor: cursor } : { prefix: prefix, limit: 1000 });
    for (var i = 0; i < res.keys.length; i++) names.push(res.keys[i].name);
    cursor = res.list_complete ? null : res.cursor;
  } while (cursor);
  return names;
}
function tsOfKey(k) { return parseInt(String(k).split(':')[1], 10) || 0; }

// Newest events for a prefix with ts > since — key-level filtering first,
// values fetched only for what will actually be returned.
async function freshEvents(kv, prefix, since, cap) {
  var names = await listAllKeys(kv, prefix);
  var fresh = names.filter(function (k) { return tsOfKey(k) > since; });
  fresh.sort(function (a, b) { return tsOfKey(a) - tsOfKey(b); });
  if (fresh.length > cap) fresh = fresh.slice(fresh.length - cap);
  var out = [];
  for (var i = 0; i < fresh.length; i++) {
    var v = await kv.get(fresh[i], 'json');
    if (v) out.push(v);
  }
  out.sort(function (a, b) { return a.ts - b.ts; });
  return out;
}

export default {
  async fetch(req, env) {
    var url = new URL(req.url);
    var path = url.pathname.replace(/\/+$/, '') || '/';
    var cb = url.searchParams.get('cb') || '';
    var kv = kvOf(env);
    var ip = req.headers.get('CF-Connecting-IP') || '';

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (path === '/') {
      return new Response('solura-track ok v' + VERSION, { headers: Object.assign({ 'Content-Type': 'text/plain' }, CORS) });
    }

    if (path === '/ping') {
      var selfCount = 0, pend = 0;
      if (kv) {
        try { selfCount = (await listAllKeys(kv, 'self:')).length; } catch (_) {}
        try { pend = (await listAllKeys(kv, 'ev:')).length; } catch (_) {}
      }
      return json({ ok: true, v: VERSION, hasToken: !!env.TRACK_TOKEN, hasKV: !!kv, events: pend, selfOpens: selfCount }, 200, cb);
    }

    /* ── pixel ── */
    if (path === '/px') {
      if (kv) {
        var m = decodeMeta(url.searchParams.get('d'));
        var owners = await getOwners(kv);
        var isSelf = !!(ip && owners[ip] && (Date.now() - owners[ip]) < OWNER_TTL_MS);
        var ev = { ts: Date.now(), id: 'px-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
          type: 'open', r: m.r || '', e: m.e || '', s: m.s || '', i: m.i || '' };
        try { await recordEvent(kv, isSelf, ev); } catch (_) {}
      }
      return new Response(GIF, { headers: Object.assign({
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }, CORS) });
    }

    /* ── tracked doc redirect ── */
    if (path === '/doc') {
      var target = url.searchParams.get('u') || '';
      if (!/^https:\/\//i.test(target)) return json({ error: 'bad target' }, 400);
      if (kv) {
        var m2 = decodeMeta(url.searchParams.get('d'));
        var owners2 = await getOwners(kv);
        var isSelf2 = !!(ip && owners2[ip] && (Date.now() - owners2[ip]) < OWNER_TTL_MS);
        var ev2 = { ts: Date.now(), id: 'doc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
          type: 'doc_open', target: target.slice(0, 300),
          r: m2.r || '', e: m2.e || '', s: m2.s || '', i: m2.i || '' };
        try { await recordEvent(kv, isSelf2, ev2); } catch (_) {}
      }
      return Response.redirect(target, 302);
    }

    /* ── dashboard poll (authenticated) — ALSO how owner IPs are learned ── */
    if (path === '/events') {
      var token = url.searchParams.get('token') || '';
      if (!env.TRACK_TOKEN || token !== env.TRACK_TOKEN) return json({ error: 'unauthorized' }, 401, cb);
      var since = parseInt(url.searchParams.get('since'), 10) || 0;
      var out = [];
      if (kv) {
        // Learn/refresh this device's IP as an OWNER network (throttled write)
        if (ip) {
          try {
            var owners3 = await getOwners(kv);
            if (!owners3[ip] || (Date.now() - owners3[ip]) > 6 * 3600 * 1000) {
              owners3[ip] = Date.now();
              // prune stale owners while we're here
              Object.keys(owners3).forEach(function (k) { if (Date.now() - owners3[k] > OWNER_TTL_MS) delete owners3[k]; });
              await kv.put('owner_ips', JSON.stringify(owners3));
            }
          } catch (_) {}
        }
        try { out = await freshEvents(kv, 'ev:', since, 200); } catch (_) {}
      }
      // Filtered self-opens ride along VISIBLY (separate stream, ignored by
      // v1-era dashboards) — so "my own open didn't count" is verifiable
      // instead of looking like tracking silently died.
      var selfOut = [];
      if (kv) {
        try { selfOut = await freshEvents(kv, 'self:', since, 30); } catch (_) {}
      }
      return json({ ok: true, events: out, self: selfOut }, 200, cb);
    }

    /* ── Resend relay (dashboard-only, token-authed, op allowlist) ── */
    if (path === '/resend' && req.method === 'POST') {
      var rb = await readJson(req);
      var rtok = url.searchParams.get('token') || (rb && rb.token) || '';
      if (!env.TRACK_TOKEN || rtok !== env.TRACK_TOKEN) return json({ error: 'unauthorized' }, 401);
      if (!env.RESEND_API_KEY) return json({ error: 'RESEND_API_KEY secret not set on the worker — add it in Cloudflare → Worker → Settings → Variables' }, 500);
      if (!rb || !rb.op) return json({ error: 'op required' }, 400);
      var RA = 'https://api.resend.com';
      var call = null;
      if (rb.op === 'domains') call = { m: 'GET', u: RA + '/domains' };
      else if (rb.op === 'listContacts' && rb.audienceId) {
        call = { m: 'GET', u: RA + '/audiences/' + encodeURIComponent(rb.audienceId) + '/contacts' };
      } else if (rb.op === 'addContact' && rb.audienceId && rb.email) {
        call = { m: 'POST', u: RA + '/audiences/' + encodeURIComponent(rb.audienceId) + '/contacts',
          b: { email: rb.email, first_name: rb.firstName || '', unsubscribed: false } };
      } else if (rb.op === 'createBroadcast' && rb.audienceId && rb.subject && rb.html) {
        call = { m: 'POST', u: RA + '/broadcasts',
          b: { audience_id: rb.audienceId, from: rb.from || '', subject: rb.subject, html: rb.html, reply_to: rb.replyTo || undefined } };
      } else if (rb.op === 'sendBroadcast' && rb.broadcastId) {
        call = { m: 'POST', u: RA + '/broadcasts/' + encodeURIComponent(rb.broadcastId) + '/send', b: {} };
      } else if (rb.op === 'sendEmail' && rb.to && rb.subject && rb.html) {
        // Per-lead weekly-newsletter send (the same draft, routed through
        // Resend instead of Graph). Still NOT unsubscribe infrastructure.
        call = { m: 'POST', u: RA + '/emails', b: {
          from: rb.from || '', to: [rb.to], subject: rb.subject, html: rb.html,
          reply_to: rb.replyTo || undefined,
          attachments: (rb.attachments && rb.attachments.length) ? rb.attachments : undefined } };
      }
      if (!call) return json({ error: 'unknown or incomplete op' }, 400);
      try {
        var rr = await fetch(call.u, {
          method: call.m,
          headers: { 'Authorization': 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
          body: call.b ? JSON.stringify(call.b) : undefined
        });
        var rj = await rr.json().catch(function () { return {}; });
        return json({ ok: rr.ok, status: rr.status, data: rj }, 200);
      } catch (e) {
        return json({ error: 'relay fetch failed: ' + (e && e.message || 'network') }, 502);
      }
    }

    return json({ error: 'not found', v: VERSION }, 404);
  }
};
