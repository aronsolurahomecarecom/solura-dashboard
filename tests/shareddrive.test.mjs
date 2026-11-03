// 👥 Shared-sheet support (B-1102-152): an employee's account doesn't HOLD
// the workbook — it's shared with her, so it lives in the owner's drive.
// The finder falls back to "Shared with me", every workbook call rides a
// drive-aware base, and the settings doc must be the owner's shared file
// too or all saves stay blocked (a private config would split state).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');

let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };

// ── the drive-aware base ──
{
  ok(/var DRIVE_BASE='\/me\/drive';/.test(html), "DRIVE_BASE defaults to the signed-in account's own drive");
  const viaBase = (html.match(/DRIVE_BASE\+'\/items\/'\+fid/g) || []).length + (html.match(/DRIVE_BASE\+"\/items\/"\+fid/g) || []).length;
  ok(viaBase >= 12, 'every workbook call rides DRIVE_BASE (' + viaBase + ' call sites)');
  ok(!/\/me\/drive\/items\/'\+fid/.test(html) && !/\/me\/drive\/items\/"\+fid/.test(html), 'NO workbook call still hardcodes /me/drive — shared mode would silently miss it');
}

// ── the finder: own drive first, then Shared with me ──
{
  const ld = html.slice(html.indexOf('async function loadData'), html.indexOf('async function loadTemplates'));
  ok(/fid=f\.id;DRIVE_BASE='\/me\/drive';_sharedMode=false;/.test(ld), 'a sheet in the own drive behaves exactly as before');
  ok(/gfetch\(GR\+'\/me\/drive\/sharedWithMe'\)/.test(ld), 'missing from the own drive = look under Shared with me');
  ok(/x\.name===FN&&x\.remoteItem&&x\.remoteItem\.parentReference/.test(ld), 'the shared entry must carry the remote item (owner drive + id)');
  ok(/fid=sf\.remoteItem\.id;/.test(ld) && /DRIVE_BASE='\/drives\/'\+sf\.remoteItem\.parentReference\.driveId;/.test(ld) && /_sharedMode=true;/.test(ld), "a shared sheet switches every call to the OWNER's drive");
  ok(/Share → Can edit/.test(ld) && /opened once in OneDrive/.test(ld), 'the not-found error tells the owner exactly what to do');
}

// ── the settings doc follows the same rule ──
{
  ok(/function engUrl\(op\)\{/.test(html) && /ENG_ID\?GR\+'\/drives\/'\+ENG_DRIVE\+'\/items\/'\+ENG_ID\+'\/'\+op/.test(html) && /:GR\+'\/me\/drive\/root:\/'\+ENGINE_FILE\+':\/'\+op;/.test(html), 'engUrl: owner-item address when shared, the classic own-root path otherwise');
  ok((html.match(/engUrl\('content'\)/g) || []).length === 2 && /engUrl\('createUploadSession'\)/.test(html), 'load, save AND the chunked upload all go through it');
  ok(!/\/me\/drive\/root:\/'\+ENGINE_FILE\+':\/content/.test(html.replace(/function engUrl[\s\S]*?\n\}/, '')), 'no engines call bypasses engUrl');
  const led = html.slice(html.indexOf('async function resolveSharedEnginesDoc'), html.indexOf('/* ⚡PERF-ENGSAVE — BEGIN'));
  ok(/if\(!_sharedMode\|\|ENG_ID\)return;/.test(led), 'the shared lookup only runs in shared mode, once');
  ok(/x\.name===ENGINE_FILE&&x\.remoteItem/.test(led), 'it finds the owner\'s Solura_Engines.json under Shared with me');
  ok(/if\(_sharedMode&&!ENG_ID\)\{/.test(led) && /ALL settings\/engine saves are blocked/.test(led), 'shared sheet + unshared config = loud, read-only — never a silently split config');
  ok(led.indexOf('_enginesDocLoaded=true') > led.indexOf('if(_sharedMode&&!ENG_ID){'), 'the blocked branch returns before the loaded flag — the save guard holds');
}

// ── sign-in copy ──
ok(/in your OneDrive, or shared with you/.test(html), 'the sign-in screen says shared sheets work');

console.log('\nShared drive: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
