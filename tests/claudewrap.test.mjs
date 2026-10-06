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
const mk = new Function('extractInnerHtml', src + '\nreturn {declawDesignHtml,_claudeHtmlDraft};');
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
  ok(/_shellSuppressed=false;\s*\n\s*_claudeHtmlDraft=false;/.test(html), 'opening the composer clears the Claude-draft flag');
}

console.log('\nClaude wrap: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
