// ⚡ Performance-layer tests (B-0902-68): workbook session reuse, batched
// writeRow, optimistic saveEp, engines-doc skip-unchanged. Slices the marked
// regions out of Solura_Dashboard.html and runs them against a fetch mock.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');

let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };

function slice(tag) {
  const b = html.indexOf(`/* ⚡PERF-${tag} — BEGIN`);
  const e = html.indexOf(`/* ⚡PERF-${tag} — END */`);
  if (b < 0 || e < 0) throw new Error('marker missing: ' + tag);
  return html.slice(html.indexOf('*/', b) + 2, e);
}

const GR = 'https://graph.microsoft.com/v1.0';

// ══ A. gfetch + workbook session ══════════════════════════════════════════
{
  const calls = [];
  let sessionCounter = 0;
  let killSession = null; // set to a session id to make calls carrying it 404
  const fetchMock = async (url, opts) => {
    opts = opts || {}; const h = opts.headers || {};
    calls.push({ url, method: opts.method || 'GET', headers: { ...h } });
    if (url.includes('createSession')) {
      sessionCounter++;
      return { ok: true, status: 200, json: async () => ({ id: 'sess-' + sessionCounter }) };
    }
    if (h['workbook-session-id'] && h['workbook-session-id'] === killSession) {
      return { ok: false, status: 404, json: async () => ({ error: { message: 'session gone' } }) };
    }
    return { ok: true, status: 200, json: async () => ({}) };
  };
  const mk = new Function('GR', 'tok', 'fid', 'fetch', 'refreshToken',
    slice('GFETCH') + '\nreturn {gfetch,ensureWorkbookSession,_kill:function(){_wbSessionId=null;}};');
  const g = mk(GR, 'tok-abc', 'file-1', fetchMock, async () => false);

  const wbUrl = GR + "/me/drive/items/file-1/workbook/worksheets/Lead%20Tracker/range(address='C5')";
  let r = await g.gfetch(wbUrl, { method: 'PATCH', body: '{}' });
  ok(r.ok, 'workbook call succeeds');
  ok(calls.some(c => c.url.includes('createSession')), 'first workbook call mints a session');
  const patch1 = calls.find(c => c.url === wbUrl);
  ok(patch1 && patch1.headers['workbook-session-id'] === 'sess-1', 'workbook call carries workbook-session-id');

  calls.length = 0;
  await g.gfetch(wbUrl, { method: 'PATCH', body: '{}' });
  ok(!calls.some(c => c.url.includes('createSession')), 'session is REUSED — no second createSession');
  ok(calls.length === 1, 'second workbook call is exactly one round trip');

  calls.length = 0;
  await g.gfetch(GR + '/me/sendMail', { method: 'POST', body: '{}' });
  ok(!calls[0].headers['workbook-session-id'], 'non-workbook call gets NO session header');

  // Expired session self-heal: 404 with header → retried sessionless, session dropped
  killSession = 'sess-1';
  calls.length = 0;
  r = await g.gfetch(wbUrl, { method: 'PATCH', body: '{}' });
  ok(r.ok, 'expired session: call still succeeds');
  ok(calls.length === 2 && !calls[1].headers['workbook-session-id'], 'expired session: retried once WITHOUT the header');
  killSession = null;
  calls.length = 0;
  await g.gfetch(wbUrl, { method: 'PATCH', body: '{}' });
  ok(calls.some(c => c.url.includes('createSession')), 'a fresh session is minted after expiry');
}

// ══ B. writeRow batching ══════════════════════════════════════════════════
function makeWriteRow(fetchLog, opts = {}) {
  const gfetchStub = async (url, o) => {
    o = o || {};
    fetchLog.push({ url, method: o.method, body: o.body ? JSON.parse(o.body) : null });
    if (url.endsWith('/$batch')) {
      if (opts.failBatch) return { ok: false, status: 500, json: async () => ({}) };
      const reqs = JSON.parse(o.body).requests;
      return { ok: true, status: 200, json: async () => ({ responses: reqs.map(q => ({ id: q.id, status: 200 })) }) };
    }
    return { ok: true, status: 200, json: async () => ({}) };
  };
  const rows = opts.rows || [];
  const mk = new Function('GR', 'fid', 'gfetch', 'rows', 'ensureWorkbookSession',
    slice('WRITEROW') + '\nreturn {writeRow,colLetter,rows};');
  return mk(GR, 'file-1', gfetchStub, rows, async () => opts.sid ?? 'sess-9');
}

{
  const log = [];
  const rows = []; rows[7] = ['a', 'b'];
  const w = makeWriteRow(log, { rows });
  // scattered queue-advance shape: MT(12), NF(13), LC(11), STEP(25), STEP_AT(26), SQ(19)
  await w.writeRow(7, { 11: 'lc', 12: 'mt', 13: 'nf', 19: 'sq', 25: 5, 26: 'iso' });
  ok(log.length === 1, 'queue advance = ONE network call (was 6)');
  ok(log[0].url.endsWith('/$batch'), 'multiple runs travel via $batch');
  const reqs = log[0].body.requests;
  ok(reqs.length === 3, 'columns grouped into 3 contiguous runs (11-13, 19, 25-26)');
  ok(reqs[0].url.includes("L8:N8") && JSON.stringify(reqs[0].body.values) === '[["lc","mt","nf"]]', 'run 1 = L8:N8 with ordered values');
  ok(reqs[1].url.includes("T8") && !reqs[1].url.includes(':'), 'run 2 = single cell T8');
  ok(reqs[2].url.includes("Z8:AA8"), 'run 3 spans the AA boundary (Z8:AA8)');
  ok(reqs.every(q => q.headers['workbook-session-id'] === 'sess-9'), 'batch sub-requests carry the session id');
  ok(rows[7][12] === 'mt' && rows[7][25] === 5 && rows[7][26] === 'iso', 'local cache updated after batch');
}
{
  const log = [];
  const w = makeWriteRow(log);
  await w.writeRow(4, { 2: 'x', 3: 'y', 4: 'z' });
  ok(log.length === 1 && !log[0].url.includes('$batch'), 'fully contiguous update = one plain range PATCH, no batch');
  ok(log[0].url.includes("C5:E5") && JSON.stringify(log[0].body.values) === '[["x","y","z"]]', 'contiguous range C5:E5 with row values');
}
{
  const log = [];
  const w = makeWriteRow(log);
  await w.writeRow(9, { 29: 'yes' });
  ok(log.length === 1 && log[0].url.includes("AD10"), 'single column write hits AD10 directly');
}
{
  const log = [];
  const rows = []; rows[3] = [];
  const w = makeWriteRow(log, { failBatch: true, rows });
  await w.writeRow(3, { 2: 'x', 10: 'y' });
  const singles = log.filter(c => !c.url.includes('$batch'));
  ok(log[0].url.includes('$batch') && singles.length === 2, 'batch failure falls back to the sequential loop');
  ok(rows[3][2] === 'x' && rows[3][10] === 'y', 'fallback still updates the local cache');
}

// ══ C. saveEnginesDoc skip-unchanged ══════════════════════════════════════
{
  const puts = [];
  let applied = 0, chunked = 0;
  const gfetchStub = async (url, o) => { puts.push(url); return { ok: true, status: 200, json: async () => ({}) }; };
  const mk = new Function('GR', 'ENGINE_FILE', 'gfetch', 'enginesDoc', 'applyEnginesDoc', 'putEnginesContentChunked',
    slice('ENGSAVE') + '\nreturn {saveEnginesDoc,setDoc:function(d){enginesDoc=d;}};');
  const doc = { engines: [{ id: 'e1' }], assignments: [] };
  const s = mk(GR, 'Solura_Engines.json', gfetchStub, doc, () => { applied++; }, async () => { chunked++; });

  await s.saveEnginesDoc();
  ok(puts.length === 1 && applied === 1, 'first save uploads');
  await s.saveEnginesDoc();
  ok(puts.length === 1, 'identical resave SKIPS the upload');
  ok(applied === 2, 'skipped save still re-applies config (semantics preserved)');
  doc.assignments.push({ field: 'source', match: 'APFM', engineId: 'e1' });
  await s.saveEnginesDoc();
  ok(puts.length === 2, 'a real change uploads again');
  ok(chunked === 0, 'small doc never took the chunked path');
}

// ══ D. source-level locks ═════════════════════════════════════════════════
{
  const epStart = html.indexOf('async function saveEp(');
  const ep = html.slice(epStart, html.indexOf('\n}', html.indexOf('finally', epStart)));
  ok(epStart > -1, 'saveEp exists');
  ok(/writeRow\(ri,u\)\.catch\(/.test(ep), 'saveEp persists in the BACKGROUND (writeRow(...).catch)');
  ok(!/await writeRow\(ri,u\)/.test(ep), 'saveEp no longer blocks the UI on the sheet write');
  ok(/closeEp\(ri\);\s*toast/.test(ep.replace(/\n/g, ' ').replace(/ +/g, ' ')) || ep.indexOf('closeEp(ri);') < ep.indexOf('writeRow(ri,u).catch'), 'modal closes before the network write starts');
  ok(/loadData\(\)/.test(ep.slice(ep.indexOf('.catch'))), 'background failure reloads the sheet');
  ok(html.indexOf('workbook-session-id') > -1, 'session header wired in');
  ok(/persistChanges:true/.test(html), 'session persists changes to the file');
}

console.log('\nPerf layer: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
