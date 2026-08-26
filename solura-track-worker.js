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

var VERSION = 'v2-owner';
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

export default {
  async fetch(req, env) {
    var url = new URL(req.url);
    var path = url.pathname.replace(/\/+$/, '') || '/';
    var cb = url.searchParams.get('cb') || '';
    var kv = kvOf(env);
    var ip = req.headers.get('CF-Connecting-IP') || '';

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (path === '/ping') {
      var selfCount = 0, pend = 0;
      if (kv) {
        try { selfCount = (await kv.list({ prefix: 'self:', limit: 100 })).keys.length; } catch (_) {}
        try { pend = (await kv.list({ prefix: 'ev:', limit: 100 })).keys.length; } catch (_) {}
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
        try {
          var list = await kv.list({ prefix: 'ev:', limit: 100 });
          for (var i = 0; i < list.keys.length; i++) {
            var v = await kv.get(list.keys[i].name, 'json');
            if (v && v.ts > since) out.push(v);
          }
          out.sort(function (a, b) { return a.ts - b.ts; });
        } catch (_) {}
      }
      return json({ ok: true, events: out }, 200, cb);
    }

    return json({ error: 'not found', v: VERSION }, 404);
  }
};
