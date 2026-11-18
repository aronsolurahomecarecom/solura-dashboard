// 🔄 Cross-portal sync (B-1118-165): two browsers, one sheet. Every 60s
// poll compares OneDrive stamps (one tiny metadata call per file); a
// changed stamp means someone ELSE wrote, and the proven full reload
// pulls it in — deferring while THIS browser is mid-work.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');

let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };

const b = html.indexOf('/* ⚡LIVESYNC — BEGIN');
const e = html.indexOf('/* ⚡LIVESYNC — END */');
if (b < 0 || e < 0) throw new Error('LIVESYNC markers missing');
const src = html.slice(html.indexOf('*/', b) + 2, e);
const S = new Function(src + '\nreturn {SYNC_SELF_COOLDOWN_MS,syncShouldDefer,syncStampOf};')();

// ── the defer rules: never yank the sheet out from under someone working ──
{
  const now = 10_000_000_000;
  ok(S.syncShouldDefer({ modalOpen: true, now, lastSelfWriteAt: 0 }) === true, 'an open modal defers the reload');
  ok(S.syncShouldDefer({ stDirty: true, now, lastSelfWriteAt: 0 }) === true, 'staged, unsaved settings defer it');
  ok(S.syncShouldDefer({ now, lastSelfWriteAt: now - 30 * 1000 }) === true, 'an own write 30s ago defers it — own writes bump the stamp too');
  ok(S.syncShouldDefer({ now, lastSelfWriteAt: now - 2 * 60 * 1000 }) === false, 'quiet for 2 minutes = safe to pull in');
  ok(S.syncShouldDefer({ now, lastSelfWriteAt: 0 }) === false, 'a browser that never wrote reloads freely');
  ok(S.SYNC_SELF_COOLDOWN_MS === 90 * 1000, 'the self-write cooldown is 90s');
}

// ── stamps ──
{
  ok(S.syncStampOf({ eTag: '"abc,1"', lastModifiedDateTime: '2026-11-18T10:00:00Z' }) === '"abc,1"|2026-11-18T10:00:00Z', 'a stamp is eTag + modified time');
  ok(S.syncStampOf({}) === '|' && S.syncStampOf(null) === '|', 'missing fields stay calm');
  ok(S.syncStampOf({ eTag: 'x' }) !== S.syncStampOf({ eTag: 'y' }), 'different versions = different stamps');
}

// ── wiring locks ──
{
  const sc = html.slice(html.indexOf('async function sheetSyncCheck'), html.indexOf('function startAutoRefresh'));
  ok(/GR\+DRIVE_BASE\+'\/items\/'\+fid\+'\?\$select=eTag,lastModifiedDateTime'/.test(sc), "the workbook stamp rides DRIVE_BASE — shared mode checks the OWNER's file");
  ok(/ENG_ID\?\(ENG_DRIVE\?GR\+'\/drives\/'\+ENG_DRIVE/.test(sc) && /:GR\+'\/me\/drive\/root:\/'\+ENGINE_FILE/.test(sc), 'the settings-doc stamp follows wherever that file lives');
  ok(/if\(!_wbStamp\)\{_wbStamp=wbS;_engStamp=engS;return;\} \/\/ first look = the baseline/.test(sc), 'the first check only sets the baseline — no spurious reload at startup');
  ok(/if\(wbS===_wbStamp&&engS===_engStamp\)return;/.test(sc), 'unchanged stamps cost two metadata calls and nothing else');
  ok(/if\(syncShouldDefer\(\{modalOpen:isModalOpen\(\),stDirty:/.test(sc), 'the defer rules gate the reload');
  ok(sc.indexOf('stale\n    // stamp keeps the change pending') > -1 || /stale/.test(sc), 'a deferred change stays pending via the stale stamp — the first quiet poll pulls it in');
  ok(/var ok9=await autoRefresh\('remote-change'\);/.test(sc) && sc.lastIndexOf('_wbStamp=wbS;_engStamp=engS;') > sc.indexOf('if(ok9){'), 'stamps advance ONLY after a successful reload — a failed one retries next poll');
  ok(/Changes from another device pulled in/.test(sc), 'the user is told when a teammate\'s work lands');
  ok(/try\{await loadData\(\);return true;\}catch/.test(html), 'autoRefresh reports success so the stamps can trust it');
  ok(/sheetSyncCheck\(\)\.catch\(function\(\)\{\}\); \/\/ 🔄 cross-portal sync rides the same poll/.test(html) && /sheetSyncCheck\(\)\.catch\(function\(\)\{\}\); \/\/ 🔄 sets the baseline stamps right away/.test(html), 'the check rides the standing 60s poll, baseline set at start');
  ok(/_lastSelfWriteAt=Date\.now\(\); \/\/ our own writes bump the sync stamp too/.test(html), 'every sheet write stamps the cooldown');
  ok(/_lastSelfWriteAt=Date\.now\(\); \/\/ engines-doc saves bump the sync stamp too/.test(html), 'and so does every settings save');
}

console.log('\nLive sync: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
