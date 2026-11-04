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

// ── the finder: own drive first, then Shared with me — folders included ──
{
  const ld = html.slice(html.indexOf('async function loadData'), html.indexOf('async function loadTemplates'));
  ok(/fid=f\.id;DRIVE_BASE='\/me\/drive';_sharedMode=false;/.test(ld), 'a sheet in the own drive behaves exactly as before (search covers EVERY folder)');
  ok(/var sf=await findInShared\(FN\);/.test(ld), 'missing from the own drive = findInShared');
  ok(/fid=sf\.id;/.test(ld) && /DRIVE_BASE='\/drives\/'\+sf\.driveId;/.test(ld) && /_sharedMode=true;/.test(ld), "a shared sheet switches every call to the OWNER's drive");
  ok(/inside a shared folder/.test(ld) && /never opened in OneDrive/.test(ld), 'the not-found error covers shared folders and the unopened-invite case');

  const fis = html.slice(html.indexOf('async function findInShared'), html.indexOf('async function loadData'));
  ok(/sameName\(x\.name,name\)&&x\.remoteItem&&x\.remoteItem\.parentReference/.test(fis), 'directly shared files are found first, case-insensitively');
  ok(/it\.remoteItem&&it\.remoteItem\.folder/.test(fis) && /\/drives\/'\+dId\+'\/items\/'\+it\.remoteItem\.id\+"\/search\(q='/.test(fis), "shared FOLDERS get searched inside, in the owner's drive — a file in a shared folder is never invisible");
  ok(/sharedWithMe\?allowexternal=true/.test(fis), 'items shared from outside the organization are surfaced too');
  ok(/_swmNames=items\.map/.test(fis), 'what Shared-with-me listed is kept for the diagnostics');
  ok(/function sameName\(a,b\)\{return String\(a\|\|''\)\.trim\(\)\.toLowerCase\(\)===String\(b\|\|''\)\.trim\(\)\.toLowerCase\(\);\}/.test(html), 'name matching ignores case and stray spaces everywhere');
  ok((html.match(/sameName\(x\.name,FN\)/g) || []).length >= 1 && (html.match(/sameName\(x\.name,ENGINE_FILE\)/g) || []).length >= 2, 'the workbook and engines lookups all use it');
}

// ── the settings doc: findable ANYWHERE, same rules ──
{
  ok(/if\(ENG_ID&&ENG_DRIVE\)return GR\+'\/drives\/'\+ENG_DRIVE\+'\/items\/'\+ENG_ID\+'\/'\+op;/.test(html) && /if\(ENG_ID\)return GR\+'\/me\/drive\/items\/'\+ENG_ID\+'\/'\+op;/.test(html) && /return GR\+'\/me\/drive\/root:\/'\+ENGINE_FILE\+':\/'\+op;/.test(html), 'engUrl: found item (any drive, any folder) wins; the root path remains ONLY as the first-run create spot');
  ok((html.match(/engUrl\('content'\)/g) || []).length === 2 && /engUrl\('createUploadSession'\)/.test(html), 'load, save AND the chunked upload all go through it');
  ok(!/\/me\/drive\/root:\/'\+ENGINE_FILE\+':\/content/.test(html.replace(/function engUrl[\s\S]*?\n\}/, '')), 'no engines call bypasses engUrl');
  const led = html.slice(html.indexOf('async function resolveEnginesDocLocation'), html.indexOf('/* ⚡PERF-ENGSAVE — BEGIN'));
  ok(/if\(ENG_ID\)return;/.test(led), 'the lookup runs once');
  ok(led.indexOf('findInShared(ENGINE_FILE)') < led.indexOf("search(q='\"+encodeURIComponent(ENGINE_FILE)"), 'in shared mode the OWNER\'S shared copy is looked for FIRST — a stray local file can never silently split the config');
  ok(/return; \/\/ shared sheet \+ no reachable config = the loud block below/.test(led), 'shared mode never falls back to a local search');
  ok(/\?\$select=parentReference/.test(led) && /\/children\?\$select=name,id,parentReference/.test(led) && /sameName\(x\.name,ENGINE_FILE\)/.test(led), "last resort: the workbook's OWN folder is checked — folder shares work even when the listing lags");
  ok(/var rm=await gfetch\(GR\+'\/me\/drive\/root:\/'\+ENGINE_FILE\);/.test(led) && /if\(rm\.ok\)return; \/\/ ENG_ID stays null/.test(led), 'the OWN-drive ROOT copy stays authoritative — the search fallback runs only when the root is empty');
  ok(/sameName\(x\.name,ENGINE_FILE\)/.test(led) && /ENG_DRIVE=\(f\.parentReference&&f\.parentReference\.driveId\)\|\|null;/.test(led), 'own-drive search finds the doc in ANY folder and keeps its real location');
  ok(/lastModifiedDateTime/.test(led) && /files named '\+ENGINE_FILE\+' exist in this OneDrive/.test(led) && /Delete the stale copies/.test(led), 'duplicates: the NEWEST wins and the user is told loudly — a stale copy means wrong settings and a wrong queue');
  ok(/Settings doc found in "/.test(led), 'a non-root load is announced, never silent');
  ok(/if\(_sharedMode&&!ENG_ID\)\{/.test(led) && /ALL settings\/engine saves are blocked/.test(led) && /one folder containing both files/.test(led), 'shared sheet + unshared config = loud, read-only, with the folder option named');
  ok(/Shared-with-me currently lists: '\+_swmNames/.test(led) && /Shared-with-me is EMPTY/.test(led) && /\[v'\+BUILD\+'\]/.test(led), 'the blocked message DIAGNOSES: names what the account actually sees, or says the list is empty, and stamps the build');
  ok(led.indexOf('_enginesDocLoaded=true') > led.indexOf('if(_sharedMode&&!ENG_ID){'), 'the blocked branch returns before the loaded flag — the save guard holds');
}

// ── the diagnostic explains a hidden queue instead of leaving it a mystery ──
{
  const dg = html.slice(html.indexOf('function buildDiagnosticReport'), html.indexOf('function showDiagnosticReport'));
  ok(/QUEUE CENSUS:/.test(dg) && /whenToShowCore\(qi\)/.test(dg), 'the 🩺 report classifies EVERY lead through the real queue logic');
  ok(/UNSUBSCRIBED \(column AD is stamped\)/.test(dg) && /WARM-UP HOLD/.test(dg) && /excluded status/.test(dg) && /no current action/.test(dg), 'each hidden nurture lead is named WITH its reason');
  ok(/a running warm-up HIDES nurture leads/.test(dg), 'the warm-up state is called out as the known hider');
  ok(/engines doc: /.test(dg) && /from the root path/.test(dg), 'the report says WHICH settings doc is loaded and from where');
}

// ── sign-in copy ──
ok(/in your OneDrive, or shared with you/.test(html), 'the sign-in screen says shared sheets work');

// ── the not-found error carries EVIDENCE, not just advice ──
{
  const ld2 = html.slice(html.indexOf('async function loadData'), html.indexOf('async function loadTemplates'));
  ok(/\[v'\+BUILD\+'\] Shared-with-me answered HTTP '\+_swmStatus/.test(ld2) && /ZERO items/.test(ld2), 'the workbook error states the HTTP status and exactly what was listed');
  ok(/scopeVerdict\(\)/.test(ld2) && /share went to a DIFFERENT email/.test(ld2), 'and the scope verdict plus the different-email possibility');
  ok(/function grantedScopes\(\)/.test(html) && (html.match(/localStorage\.setItem\('granted_scopes',j\.scope\)/g) || []).length === 2, 'the granted scopes are captured from BOTH token grants (sign-in and refresh)');
  ok(/200-and-empty, not 403/.test(html), 'the code documents the trap: a lacking scope lists empty, it does not refuse');
  ok(/LACKS the shared-files permission \(Files\.ReadWrite\.All\)/.test(html) && /Need admin approval/.test(html), 'the verdict names the permission and the admin-approval path');
  ok(/sign-in: '\+\(ME\.email\|\|'\(identity not loaded\)'\)/.test(html) && /\+scopeVerdict\(\)\);/.test(html), 'the 🩺 diagnostic shows who is signed in and what was granted');
}

// ── 🔗 share-link rescue: links beat listings ──
{
  // The encoder, run for real (Graph's base64url share-id format)
  const fb = html.indexOf('function shareIdFromUrl');
  const fe = html.indexOf('async function resolveShareLink');
  const enc = new Function('btoa', html.slice(fb, fe) + '\nreturn shareIdFromUrl;')((s) => Buffer.from(s, 'binary').toString('base64'));
  const sid = enc('https://solura-my.sharepoint.com/:x:/g/personal/meir/EeAbc?e=4%2Fab');
  ok(/^u!/.test(sid) && sid.indexOf('=') === -1 && sid.indexOf('/') === -1 && sid.indexOf('+') === -1, "share ids are u! + base64url: no '=', '/' or '+' survive");
  ok(enc('not a link') === '', 'non-links refuse to encode');

  ok(/\/shares\/'\+sid\+'\/driveItem\?\$select=id,name,parentReference/.test(html), 'the resolver asks Graph to open the LINK itself — no listing involved');
  const ld3 = html.slice(html.indexOf('async function loadData'), html.indexOf('async function loadTemplates'));
  ok(/var li=linkedItems\(\),okLinked=false;/.test(ld3) && ld3.indexOf('linkedItems()') < ld3.indexOf('findInShared(FN)'), 'a remembered link is tried BEFORE the flaky listing');
  ok(/else saveLinkedItems\(\{\}\); \/\/ stale link/.test(ld3), 'a dead remembered link clears itself and the listing takes over');
  ok(/renderShareRescue\(\);\}catch\(_\)\{\} \/\/ the paste-the-link way out rides the error/.test(ld3), 'the not-found error always comes WITH the rescue form');
  const rc = html.slice(html.indexOf('async function shareRescueConnect'), html.indexOf('async function findInShared'));
  ok(/sameName\(wb\.name,FN\)/.test(rc) && /sameName\(en\.name,ENGINE_FILE\)/.test(rc), 'a pasted link is verified to open the RIGHT file before being remembered');
  ok(/if\(li9\.eng&&li9\.eng\.id\)\{ENG_ID=li9\.eng\.id;ENG_DRIVE=li9\.eng\.driveId;return;\}/.test(html), 'the settings doc rides its remembered link too');
  ok(/case 'share-rescue': shareRescueConnect\(\); break;/.test(html) && /id="rescue-wb"/.test(html) && /id="rescue-eng"/.test(html), 'the Connect-by-link form is wired');
}

// ── the permission that makes any of this possible ──
{
  ok((html.match(/email Files\.ReadWrite\.All Mail\.Send/g) || []).length === 2 && !/email Files\.ReadWrite Mail\.Send/.test(html), 'BOTH the sign-in and the token refresh request Files.ReadWrite.All — plain Files.ReadWrite cannot list shared files at all');
  ok(/r\.status===403\|\|r\.status===401\)throw new Error\('This sign-in cannot LIST shared files yet/.test(html) && /Sign out of the dashboard and sign back in/.test(html), 'a permission gap on the shared lookup is LOUD and names the fix, never a silent empty list');
}

console.log('\nShared drive: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
