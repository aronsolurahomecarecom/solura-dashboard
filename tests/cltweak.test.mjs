// ✨ Tweak loop (B-1012-127). Slices ⚡CLTWEAK and locks the design: Meir's
// note on Claude's OUTPUT travels back WITH the current draft, Claude
// revises in place (never from scratch), and the result re-applies through
// the same pipeline as a fresh draft.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');

let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };

const b = html.indexOf('/* ⚡CLTWEAK — BEGIN');
const e = html.indexOf('/* ⚡CLTWEAK — END */');
if (b < 0 || e < 0) throw new Error('CLTWEAK markers missing');
const src = html.slice(html.indexOf('*/', b) + 2, e);
const mk = new Function(src + '\nreturn {claudeTweakPrompt};');
const T = mk();

// ── the revision prompt ──
{
  const p = T.claudeTweakPrompt('Checking in on Rose', '<p>Hi Susan, long draft here.</p>', 'make it shorter and mention the fall');
  ok(p.indexOf('Checking in on Rose') > -1 && p.indexOf('<p>Hi Susan, long draft here.</p>') > -1, 'the CURRENT draft travels back verbatim — subject and body');
  ok(/revised, not rewritten from scratch/.test(p) && /keep everything that works/.test(p), 'Claude is told to revise in place, not start over');
  ok(/REVISION NOTE — HIGHEST PRIORITY/.test(p.replace(/—/g, '—')) && p.indexOf('make it shorter and mention the fall') > -1, "Meir's note rides loudly framed, highest priority");
  ok(/same JSON format/.test(p) && /COMPLETE revised email, not a diff/.test(p), 'the reply contract matches the generator — complete email, same JSON');
}

// ── source locks: the runtime ──
{
  const fn = html.slice(html.indexOf('async function claudeTweak'), html.indexOf('/* ─── Restart sequence'));
  ok(/var curBody=_emailRawHtml\|\|String\(bodyEl\?bodyEl\.innerHTML:''\)/.test(fn), 'tweaks whatever is ACTUALLY in the composer right now (raw mode included)');
  ok(/buildClaudeSystemPrompt\(buildClaudeSystemTraining\(\)\)/.test(fn), 'the same voice training rides the revision call');
  ok(/buildClaudeEmailContext\(ri/.test(fn) && /grounding only/.test(fn), 'lead context goes along for grounding');
  ok(/parseClaudeEmailJSON\(text\)/.test(fn), 'the reply parses through the same JSON parser as a fresh draft');
  ok(/adaptDraftFragment\(sanitizeDraftHtml\(draft\.body\)\)/.test(fn) && /declawDesignHtml\(newHtml\)/.test(fn), 'the revision re-applies through the same sanitize/adapt/declaw pipeline');
  ok(/_claudeHtmlDraft=true/.test(fn) && /updateShellToggle/.test(fn), 'a tweaked draft still counts as a Claude draft — the shell wraps it at send');
  ok(/temperature:0\.3/.test(fn) && /cfg\('claudeModel'\)\|\|'claude-sonnet-4-6'/.test(fn), 'same model + temperature as the generator');
  ok(/Nothing to tweak/.test(fn) && /Type what to change first/.test(fn), 'empty body and empty note both get gentle gates');
  ok(/finally\{\s*\n\s*if\(btn\)btn\.disabled=false/.test(fn), 'the Revise button always comes back, even on failure');
}

// ── source locks: wiring ──
{
  ok(/id="claude-tweak-bar"/.test(html) && /id="claude-tweak-input"/.test(html) && /data-action="claude-tweak"/.test(html), 'the ✨ Tweak bar lives under the body with input + Revise');
  ok(html.indexOf('id="claude-tweak-bar"') > html.indexOf('id="email-body"'), 'the bar sits right under the draft it tweaks');
  ok(/var tb0=el\('claude-tweak-bar'\);if\(tb0\)tb0\.style\.display='flex';/.test(html), 'the bar appears the moment a Claude draft lands');
  ok(/var tbR=el\('claude-tweak-bar'\);if\(tbR\)\{tbR\.style\.display='none';\}/.test(html), 'a fresh composer hides it again');
  ok(/onkeydown="if\(event\.key==='Enter'\)\{event\.preventDefault\(\);document\.getElementById\('claude-tweak-btn'\)\.click\(\);\}"/.test(html), 'Enter in the note submits the tweak');
  ok(/case 'claude-tweak':/.test(html), 'click case wired');
}

console.log('\nClaude tweak: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
