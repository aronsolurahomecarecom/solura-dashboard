/* ─── Solura Voice Bridge — Cloudflare Worker ────────────────────────────
 * The integration surface between the voice platform (Retell AI / Vapi)
 * and the Solura lead dashboard, per Integration Spec v2.
 *
 * Platform-facing (Bearer VOICE_AGENT_API_KEY):
 *   POST /api/voice/lookup     phone in → lead context out (or found:false)
 *   POST /api/voice/writeback  call result in → queued for the dashboard;
 *                              idempotent on call_id (retries update, never duplicate)
 *
 * Dashboard-facing (DASH_TOKEN, same pattern as the tracking worker):
 *   POST /sync      dashboard pushes the full lead mirror + DNC adds
 *   GET  /pending   dashboard polls queued writebacks (JSONP via ?cb=)
 *   POST /ack       dashboard confirms applied writebacks → dequeued
 *   GET  /ping      health probe (JSONP via ?cb=)
 *
 * Storage (KV binding: VOICE_KV) — shaped for the free-tier write budget:
 *   leads_mirror   ONE value: {"<10digits>": {lookup context}, ...}
 *                  (one KV write per sync, not one per lead)
 *   dnc_list       ONE value: {"<10digits>": ts, ...}  internal suppression
 *   wbq:<ts>:<id>  queued writeback payload (deleted on ack, 60-day TTL net)
 *   wb:<call_id>   idempotency pointer → its wbq: queue key (60-day TTL)
 *
 * Secrets (wrangler secret put):
 *   VOICE_AGENT_API_KEY  bearer token the voice platform sends
 *   DASH_TOKEN           token the dashboard sends
 *
 * Deploy: see Voice_Agent_Setup.md next to this file.
 * ─────────────────────────────────────────────────────────────────────── */

var VERSION = 'voice-1';
var QUEUE_TTL = 60 * 24 * 3600; // seconds — safety net if acks never come

var CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Max-Age': '86400'
};

function json(obj, status, cb) {
  // JSONP (?cb=) rides a <script> tag past fetch-blocking AV shields —
  // same compatibility trick the tracking worker uses.
  if (cb) {
    return new Response(cb + '(' + JSON.stringify(obj) + ')', {
      status: 200,
      headers: Object.assign({ 'Content-Type': 'application/javascript' }, CORS)
    });
  }
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({ 'Content-Type': 'application/json' }, CORS)
  });
}

// Last 10 digits — normalizes +1 (216) 555-0142 / 12165550142 / 216.555.0142
// to the same key. US-centric on purpose; that's the service area.
function normPhone(s) {
  var d = String(s == null ? '' : s).replace(/\D/g, '');
  return d.length > 10 ? d.slice(-10) : d;
}

function bearerOk(req, env) {
  var h = req.headers.get('Authorization') || '';
  var m = h.match(/^Bearer\s+(.+)$/i);
  return !!(m && env.VOICE_AGENT_API_KEY && m[1].trim() === env.VOICE_AGENT_API_KEY);
}

function dashOk(tokenParam, body, env) {
  var t = String(tokenParam || (body && body.token) || '');
  return !!(env.DASH_TOKEN && t === env.DASH_TOKEN);
}

async function readJson(req) {
  try { return await req.json(); } catch (_) { return null; }
}

async function getMirror(env) {
  try { return (await env.VOICE_KV.get('leads_mirror', 'json')) || {}; }
  catch (_) { return {}; }
}
async function getDnc(env) {
  try { return (await env.VOICE_KV.get('dnc_list', 'json')) || {}; }
  catch (_) { return {}; }
}

export default {
  async fetch(req, env) {
    var url = new URL(req.url);
    var path = url.pathname.replace(/\/+$/, '') || '/';
    var cb = url.searchParams.get('cb') || '';

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    /* ── health ── */
    if (path === '/ping') {
      var pending = 0;
      try { pending = (await env.VOICE_KV.list({ prefix: 'wbq:', limit: 100 })).keys.length; } catch (_) {}
      var mirror = await getMirror(env);
      return json({
        ok: true, v: VERSION,
        hasToken: !!env.VOICE_AGENT_API_KEY,
        hasDash: !!env.DASH_TOKEN,
        hasKV: !!env.VOICE_KV,
        leads: Object.keys(mirror).length,
        pending: pending
      }, 200, cb);
    }

    /* ── platform: lead lookup ── */
    if (path === '/api/voice/lookup' && req.method === 'POST') {
      if (!bearerOk(req, env)) return json({ error: 'unauthorized' }, 401);
      var b = await readJson(req);
      if (!b || !b.phone) return json({ error: 'phone required' }, 400);
      var key = normPhone(b.phone);
      if (key.length < 7) return json({ found: false });
      var leads = await getMirror(env);
      var dnc = await getDnc(env);
      var lead = leads[key];
      if (!lead) {
        // Unknown caller, but still honor suppression
        return json(dnc[key] ? { found: false, opt_out: true } : { found: false });
      }
      var out = Object.assign({ found: true }, lead);
      if (dnc[key]) out.opt_out = true; // DNC always wins over the mirror
      return json(out);
    }

    /* ── platform: post-call writeback ── */
    if (path === '/api/voice/writeback' && req.method === 'POST') {
      if (!bearerOk(req, env)) return json({ error: 'unauthorized' }, 401);
      var wb = await readJson(req);
      if (!wb || !wb.call_id) return json({ error: 'call_id required' }, 400);
      var callId = String(wb.call_id).slice(0, 120);
      wb.received_at = new Date().toISOString();

      // Opt-out is a hard gate — record it server-side immediately, even if
      // the dashboard doesn't poll for hours.
      if (wb.opt_out === true) {
        var p10 = normPhone(wb.phone);
        if (p10) {
          var dnc2 = await getDnc(env);
          if (!dnc2[p10]) {
            dnc2[p10] = Date.now();
            await env.VOICE_KV.put('dnc_list', JSON.stringify(dnc2));
          }
        }
      }

      // Idempotency: a retried call_id updates its existing queue entry.
      var existingKey = await env.VOICE_KV.get('wb:' + callId);
      var qKey = existingKey || ('wbq:' + Date.now() + ':' + callId);
      await env.VOICE_KV.put(qKey, JSON.stringify(wb), { expirationTtl: QUEUE_TTL });
      if (!existingKey) {
        await env.VOICE_KV.put('wb:' + callId, qKey, { expirationTtl: QUEUE_TTL });
      }
      return json({ ok: true, lead_id: wb.lead_id || null, updated: true });
    }

    /* ── dashboard: push lead mirror + DNC adds ── */
    if (path === '/sync' && req.method === 'POST') {
      var sb = await readJson(req);
      if (!dashOk(url.searchParams.get('token'), sb, env)) return json({ error: 'unauthorized' }, 401);
      if (!sb || typeof sb.leads !== 'object') return json({ error: 'leads object required' }, 400);
      // Full replace: the dashboard owns the mirror. {"<10digits>": {...}, ...}
      await env.VOICE_KV.put('leads_mirror', JSON.stringify(sb.leads));
      var added = 0;
      if (Array.isArray(sb.dnc) && sb.dnc.length) {
        var dnc3 = await getDnc(env);
        sb.dnc.forEach(function (p) {
          var k = normPhone(p);
          if (k && !dnc3[k]) { dnc3[k] = Date.now(); added++; }
        });
        if (added) await env.VOICE_KV.put('dnc_list', JSON.stringify(dnc3));
      }
      return json({ ok: true, leads: Object.keys(sb.leads).length, dncAdded: added });
    }

    /* ── dashboard: poll queued writebacks ── */
    if (path === '/pending') {
      if (!dashOk(url.searchParams.get('token'), null, env)) return json({ error: 'unauthorized' }, 401, cb);
      var out2 = [];
      try {
        var list = await env.VOICE_KV.list({ prefix: 'wbq:', limit: 50 });
        for (var i = 0; i < list.keys.length; i++) {
          var k2 = list.keys[i].name;
          var v = await env.VOICE_KV.get(k2, 'json');
          if (v) out2.push({ qkey: k2, wb: v });
        }
      } catch (_) {}
      return json({ ok: true, events: out2 }, 200, cb);
    }

    /* ── dashboard: ack applied writebacks ── */
    if (path === '/ack' && req.method === 'POST') {
      var ab = await readJson(req);
      if (!dashOk(url.searchParams.get('token'), ab, env)) return json({ error: 'unauthorized' }, 401);
      var keys = (ab && ab.keys) || [];
      var removed = 0;
      for (var j = 0; j < keys.length; j++) {
        var qk = String(keys[j]);
        if (qk.indexOf('wbq:') !== 0) continue; // only queue keys are deletable
        try { await env.VOICE_KV.delete(qk); removed++; } catch (_) {}
      }
      return json({ ok: true, removed: removed });
    }

    return json({ error: 'not found', v: VERSION }, 404);
  }
};
