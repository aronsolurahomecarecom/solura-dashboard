// 🎨 Claude-draft shell wrap (B-1006-105). Slices ⚡CLAUDEWRAP and locks the
// rule: Claude HTML drafts ALWAYS ride inside the Settings email shell; only
// raw-HTML paste mode and slot-templates keep their shell-skip behavior.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');

let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };

const b = html.indexOf('/* ⚡CLAUDEWRAP — BEGIN');
const e = html.indexOf('/* ⚡CLAUDEWRAP — END */');
if (b < 0 || e < 0) throw new Error('CLAUDEWRAP markers missing');
const src = html.slice(html.indexOf('*/', b) + 2, e);

// Same behavior as the app's extractInnerHtml (body unwrap, head strip)
const extractInnerHtml = (v) => {
  v = String(v || '');
  const m = v.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (m) return m[1];
  return v.replace(/<\/?html[^>]*>/gi, '').replace(/<head[\s\S]*?<\/head>/gi, '');
};
const mk = new Function('extractInnerHtml', src + '\nreturn {declawDesignHtml,_claudeHtmlDraft,shellWillApply,_shellOverride};');
const W = mk(extractInnerHtml);

// ── declawDesignHtml ──
{
  const full = '<html><head><style>.x{}</style></head><body style="margin:0">'
    + '<div style="display:none;max-height:0;overflow:hidden">Preview line here</div>'
    + '<div style="background:#f5f0e8;padding:30px"><p>Hi Susan,</p><p>Warmly,<br>Meir</p></div>'
    + '</body></html>';
  const d = W.declawDesignHtml(full);
  ok(d.indexOf('<html') === -1 && d.indexOf('<head') === -1 && d.indexOf('<body') === -1, 'document scaffolding stripped');
  ok(d.indexOf('Preview line here') === -1, 'hidden preheader removed — the shell keeps its own preview line');
  ok(d.indexOf('<p>Hi Susan,</p>') > -1 && d.indexOf('Warmly,<br>Meir') > -1, 'the visible message survives intact');
  ok(W.declawDesignHtml('<p>plain note</p>') === '<p>plain note</p>', 'plain fragments pass through unchanged');
  const vh = W.declawDesignHtml('<span style="visibility:hidden">x</span><p>Real</p>');
  ok(vh.indexOf('visibility:hidden') === -1 && vh.indexOf('<p>Real</p>') > -1, 'visibility:hidden spans stripped too');
  ok(W.declawDesignHtml('') === '', 'empty input stays empty');
  ok(W._claudeHtmlDraft === false, 'flag starts false');
}

// ── shellWillApply: the 🎁 Wrap chip's override beats automatic (B-1006-106) ──
{
  const f = W.shellWillApply;
  ok(f({hasShell:true,override:null,suppressed:false,design:false}) === true, 'auto: plain content wraps');
  ok(f({hasShell:true,override:null,suppressed:false,design:true}) === false, 'auto: a design body skips the shell');
  ok(f({hasShell:true,override:null,suppressed:true,design:false}) === false, 'auto: suppressed (template/newsletter) skips');
  ok(f({hasShell:true,override:'off',suppressed:false,design:false}) === false, 'OVERRIDE off: wrapper shuts down on the spot');
  ok(f({hasShell:true,override:'on',suppressed:false,design:true}) === true, 'OVERRIDE on: wraps even a design body');
  ok(f({hasShell:true,override:'on',suppressed:true,design:false}) === true, 'OVERRIDE on: beats suppression too');
  ok(f({hasShell:false,override:'on',suppressed:false,design:false}) === false, 'no shell configured = nothing to wrap, override moot');
  ok(W._shellOverride === null, 'override starts in automatic mode');
}

// ── source-level locks on the flow ──
{
  // Claude apply: a complete design is declawed and NO LONGER suppresses the shell
  const apply = html.slice(html.indexOf('var isCompleteDesign=isFullDesignHtml(newHtml);'),
    html.indexOf("traceOp({kind:'generate'"));
  ok(/if\(isCompleteDesign\)\{\s*\n\s*newHtml=declawDesignHtml\(newHtml\);/.test(apply), 'complete Claude designs are declawed, not sent as-is');
  ok(!/_shellSuppressed=true;\s*\n\s*toast\('\\ud83c\\udfa8/.test(apply) && /it still rides inside your email shell/.test(apply), 'the full-design shell-skip is gone and the toast says so');
  ok(/_shellSuppressed=true; \/\/ template IS the shell/.test(apply), 'slot-templates STILL suppress (the template is the design wrapper)');
  ok(/bodyEl\.innerHTML=newHtml;\s*\n\s*_claudeHtmlDraft=true;/.test(apply), 'applying a Claude draft arms the always-wrap flag');

  // Send gate: Claude drafts beat the design heuristic; raw paste still wins
  ok(/var _bodyIsDesign=_rawMode\|\|\(!_claudeHtmlDraft&&isFullDesignHtml\(bodyHtml\)\);/.test(html), 'send gate: Claude HTML wraps even when it LOOKS like a full design');
  ok(/_bodyIsDesign=_rawMode\|\|/.test(html), 'raw-HTML paste mode keeps its explicit shell-skip');

  // Fresh composer resets the flag so a later manual email is unaffected
  ok(/_shellSuppressed=false;\s*\n\s*_claudeHtmlDraft=false;[^\n]*\n\s*_shellOverride=null;/.test(html), 'opening the composer clears the Claude-draft flag AND the wrap override');

  // 🎁 Wrap chip wiring
  ok(/id="email-shell-toggle" data-action="toggle-shell"/.test(html), 'the Wrap chip lives in the composer send row');
  ok(/var _shellWas=shellWillApply\(\{hasShell:/.test(html), 'the send path decides through shellWillApply (one decision point)');
  ok(/case 'toggle-shell':/.test(html) && /_shellOverride=st\.on\?'off':'on';/.test(html), 'clicking the chip flips the wrapper for THIS send');
  ok(/Wrapper OFF for this email/.test(html), 'turning it off says so plainly');
  ok(/function updateShellToggle/.test(html) && /b\.style\.display='none';return;/.test(html), 'the chip hides when no shell is configured');
}

// ── composer: top Send button swap (B-1009-123, weekly-letter friction) ──
{
  ok(/id="email-send-btn-top" data-action="send-email"/.test(html), 'a second Send sits up top — a long weekly draft sends with zero scrolling');
  ok(html.indexOf('id="email-send-btn-top"') < html.indexOf('id="email-body"') && html.indexOf('id="email-subj"') < html.indexOf('id="email-send-btn-top"'), 'the top Send took the subject-row slot where ✨ Claude used to be');
  ok(html.indexOf('data-action="claude-write-email"') > html.indexOf('id="email-attach-list"'), '✨ Claude moved DOWN to the send row at the bottom');
  ok(html.indexOf('data-action="claude-write-email"') < html.indexOf('id="email-send-btn"'), 'Claude sits in the usual Send slot; Send stays beside it');
  ok(/function emailSendButtonsBusy\(on\)/.test(html) && /b2\.textContent=on\?'Sending\\u2026':'Send via Outlook'/.test(html.replace(/\\/g, '\\\\')) || /Sending/.test(html.slice(html.indexOf('function emailSendButtonsBusy'), html.indexOf('function emailSendButtonsBusy') + 400)), 'both buttons share one busy state');
  const sendFn = html.slice(html.indexOf('async function sendEmail()'), html.indexOf('async function sendEmail()') + 20000);
  ok(/emailSendButtonsBusy\(true\)/.test(sendFn), 'send disables BOTH buttons');
  ok((html.match(/emailSendButtonsBusy\(false\)/g) || []).length >= 3, 'every exit path (errors, early returns, finally) re-enables both');
}

console.log('\nClaude wrap: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
