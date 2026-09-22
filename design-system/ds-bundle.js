/* @ds-bundle: {"format":4,"namespace":"SoluraHomeCareDesignSystem_6c6eb0","components":[{"name":"Button","sourcePath":"components/Button/Button.jsx"},{"name":"StageBadge","sourcePath":"components/StageBadge/StageBadge.jsx"},{"name":"StatCard","sourcePath":"components/StatCard/StatCard.jsx"},{"name":"TempBadge","sourcePath":"components/TempBadge/TempBadge.jsx"}],"sourceHashes":{"components/Button/Button.jsx":"050edd9461dc","components/StageBadge/StageBadge.jsx":"a9a8ad4782f4","components/StatCard/StatCard.jsx":"68fc93767d8b","components/TempBadge/TempBadge.jsx":"257478053951","slides/deck-stage.js":"0de1efd241e5","ui_kits/mobile-app/icons.jsx":"56f23e7c2ee6","ui_kits/mobile-app/ios-frame.jsx":"39f3a091d97d","ui_kits/mobile-app/screens.jsx":"975a9060cc0b","ui_kits/web-app/ContactRecord.jsx":"7da011169bbb","ui_kits/web-app/Dashboard.jsx":"c86f70bf5d0a","ui_kits/web-app/Pipeline.jsx":"4ad44db96613","ui_kits/web-app/SequenceQueue.jsx":"f03bd4e7c268","ui_kits/web-app/Sidebar.jsx":"6e47a0ecfbc6","ui_kits/web-app/TopBar.jsx":"93167aed4762","ui_kits/web-app/app.jsx":"330904115e70","ui_kits/web-app/data.jsx":"503418ac5f14","ui_kits/web-app/icons.jsx":"56f23e7c2ee6","ui_kits/web-app/ui.jsx":"0814ecb8ee1d"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SoluraHomeCareDesignSystem_6c6eb0 = window.SoluraHomeCareDesignSystem_6c6eb0 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/Button/Button.jsx
try { (() => {
const V = {
  primary: {
    background: 'var(--brand)',
    color: '#fff',
    border: '1px solid transparent',
    boxShadow: 'var(--shadow-xs)'
  },
  accent: {
    background: 'var(--accent)',
    color: '#fff',
    border: '1px solid transparent',
    boxShadow: 'var(--shadow-xs)'
  },
  secondary: {
    background: 'var(--bg-surface)',
    color: 'var(--fg-1)',
    border: '1px solid var(--border-2)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--brand)',
    border: '1px solid transparent'
  },
  danger: {
    background: 'var(--danger)',
    color: '#fff',
    border: '1px solid transparent'
  }
};
const S = {
  sm: {
    padding: '6px 12px',
    fontSize: 'var(--text-sm)'
  },
  md: {
    padding: '9px 16px',
    fontSize: 'var(--text-base)'
  },
  lg: {
    padding: '12px 22px',
    fontSize: 'var(--text-md)'
  }
};
function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
  style = {},
  title,
  type = 'button'
}) {
  const base = {
    fontFamily: 'var(--font-sans)',
    fontWeight: 'var(--weight-semibold)',
    lineHeight: 1,
    borderRadius: 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    transition: 'background var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)'
  };
  const look = disabled ? {
    background: 'var(--neutral-200)',
    color: 'var(--fg-4)',
    border: '1px solid transparent',
    boxShadow: 'none'
  } : V[variant] || V.primary;
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    title: title,
    disabled: disabled,
    onClick: onClick,
    style: {
      ...base,
      ...(S[size] || S.md),
      ...look,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Button/Button.jsx", error: String((e && e.message) || e) }); }

// components/StageBadge/StageBadge.jsx
try { (() => {
const STAGES = {
  New: {
    bg: 'var(--brand-subtle)',
    fg: 'var(--brand-subtle-fg)'
  },
  Contacted: {
    bg: 'var(--violet-50)',
    fg: 'var(--violet-700)'
  },
  Assessment: {
    bg: 'var(--gold-50)',
    fg: 'var(--gold-700)'
  },
  Proposal: {
    bg: 'var(--blue-50)',
    fg: 'var(--blue-700)'
  },
  Placed: {
    bg: 'var(--green-50)',
    fg: 'var(--green-700)'
  },
  Lost: {
    bg: 'var(--neutral-100)',
    fg: 'var(--fg-3)'
  }
};
function StageBadge({
  stage = 'New',
  style = {}
}) {
  const c = STAGES[stage] || STAGES.New;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      background: c.bg,
      color: c.fg,
      borderRadius: 'var(--radius-sm)',
      padding: '3px 9px',
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--weight-semibold)',
      fontSize: 'var(--text-xs)',
      letterSpacing: '0.01em',
      lineHeight: 1.3,
      ...style
    }
  }, stage);
}
Object.assign(__ds_scope, { StageBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/StageBadge/StageBadge.jsx", error: String((e && e.message) || e) }); }

// components/StatCard/StatCard.jsx
try { (() => {
function StatCard({
  label,
  value,
  delta,
  deltaUp = true,
  accent = 'var(--brand)',
  footnote,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-1)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      padding: 'var(--space-5)',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      minWidth: 170,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: accent
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--fg-3)'
    }
  }, label)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-3xl)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--fg-1)',
      fontVariantNumeric: 'tabular-nums',
      lineHeight: 1.05
    }
  }, value), delta ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      color: deltaUp ? 'var(--success)' : 'var(--danger)'
    }
  }, (deltaUp ? '\u2191 ' : '\u2193 ') + delta) : null), footnote ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      color: 'var(--fg-4)'
    }
  }, footnote) : null);
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/StatCard/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/TempBadge/TempBadge.jsx
try { (() => {
const TEMPS = {
  hot: {
    label: 'Hot',
    bg: 'var(--temp-hot-bg)',
    fg: 'var(--red-700)',
    dot: 'var(--temp-hot)'
  },
  warm: {
    label: 'Warm',
    bg: 'var(--temp-warm-bg)',
    fg: 'var(--gold-700)',
    dot: 'var(--temp-warm)'
  },
  cool: {
    label: 'Cool',
    bg: 'var(--temp-cool-bg)',
    fg: 'var(--blue-700)',
    dot: 'var(--temp-cool)'
  },
  cold: {
    label: 'Cold',
    bg: 'var(--temp-cold-bg)',
    fg: 'var(--fg-3)',
    dot: 'var(--temp-cold)'
  }
};
function TempBadge({
  temp = 'warm',
  size = 'md',
  label,
  style = {}
}) {
  const t = TEMPS[temp] || TEMPS.warm;
  const sm = size === 'sm';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: t.bg,
      color: t.fg,
      borderRadius: 'var(--radius-pill)',
      padding: sm ? '3px 9px' : '4px 11px',
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--weight-semibold)',
      fontSize: sm ? 'var(--text-xs)' : 'var(--text-sm)',
      lineHeight: 1.2,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: sm ? 6 : 7,
      height: sm ? 6 : 7,
      borderRadius: '50%',
      background: t.dot
    }
  }), label || t.label);
}
Object.assign(__ds_scope, { TempBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/TempBadge/TempBadge.jsx", error: String((e && e.message) || e) }); }

// slides/deck-stage.js
try { (() => {
/* BEGIN USAGE */
/**
 * <deck-stage> — reusable web component for HTML decks.
 *
 * Handles:
 *  (a) speaker notes — reads <script type="application/json" id="speaker-notes">
 *      and posts {slideIndexChanged: N} to the parent window on nav.
 *  (b) keyboard navigation — ←/→, PgUp/PgDn, Space, Home/End, number keys.
 *      On touch devices, tapping the left/right half of the stage goes
 *      prev/next — taps on links, buttons and other interactive slide
 *      content are left alone.
 *  (c) press R to reset to slide 0 (with a tasteful keyboard hint).
 *  (d) bottom-center overlay showing slide count + hints, fades out on idle.
 *  (e) auto-scaling — inner canvas is a fixed design size (default 1920×1080)
 *      scaled with `transform: scale()` to fit the viewport, letterboxed.
 *      Set the `noscale` attribute to render at authored size (1:1) — the
 *      PPTX exporter sets this so its DOM capture sees unscaled geometry.
 *  (f) print — `@media print` lays every slide out as its own page at the
 *      design size, so the browser's Print → Save as PDF produces a clean
 *      one-page-per-slide PDF with no extra setup.
 *  (g) thumbnail rail — resizable left-hand column of per-slide thumbnails
 *      (static clones). Click to navigate; ↑/↓ with a thumbnail focused to
 *      step between slides; drag to reorder; right-click for
 *      Skip / Move up / Move down / Delete (opens a Cancel/Delete confirm
 *      dialog). Drag the rail's right edge to resize; width persists to
 *      localStorage. Skipped slides carry `data-deck-skip`, are dimmed in
 *      the rail, omitted from prev/next navigation, and hidden at print.
 *      The rail is suppressed in presenting mode, in the host's Preview
 *      mode (ViewerMode='none'), on `noscale`, on narrow viewports
 *      (≤640px), and via the `no-rail` attribute. Rail mutations dispatch
 *      a `deckchange`
 *      CustomEvent on the element: detail = {action, from, to, slide}.
 *
 * Slides are HIDDEN, not unmounted. Non-active slides stay in the DOM with
 * `visibility: hidden` + `opacity: 0`, so their state (videos, iframes,
 * form inputs, React trees) is preserved across navigation.
 *
 * Lifecycle event — the component dispatches a `slidechange` CustomEvent on
 * itself whenever the active slide changes (including the initial mount).
 * The event bubbles and composes out of shadow DOM, so you can listen on
 * the <deck-stage> element or on document:
 *
 *   document.querySelector('deck-stage').addEventListener('slidechange', (e) => {
 *     e.detail.index         // new 0-based index
 *     e.detail.previousIndex // previous index, or -1 on init
 *     e.detail.total         // total slide count
 *     e.detail.slide         // the new active slide element
 *     e.detail.previousSlide // the prior slide element, or null on init
 *     e.detail.reason        // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
 *   });
 *
 * Persistence: none at the deck level. The host app keeps the current slide
 * in its own URL (?slide=) and re-delivers it via location.hash on load, so a
 * bare load with no hash always starts at slide 1.
 *
 * Usage:
 *   <style>deck-stage:not(:defined){visibility:hidden}</style>
 *   <deck-stage width="1920" height="1080">
 *     <section data-label="Title">...</section>
 *     <section data-label="Agenda">...</section>
 *   </deck-stage>
 *   <script src="deck-stage.js"></script>
 *
 * The :not(:defined) rule prevents a flash of the first slide at its
 * authored styles before this script runs and attaches the shadow root.
 *
 * Slides are the direct element children of <deck-stage>. Each slide is
 * automatically tagged with:
 *   - data-screen-label="NN Label"   (1-indexed, for comment flow)
 *   - data-om-validate="no_overflowing_text,no_overlapping_text,slide_sized_text"
 *
 * Speaker notes stay in sync because the component posts {slideIndexChanged: N}
 * to the parent — just include the #speaker-notes script tag if asked for notes.
 *
 * Authoring guidance:
 *   - Write slide bodies as static HTML inside <deck-stage>, with sizing via
 *     CSS custom properties in a <style> block rather than JS constants.
 *     Static slide markup is what lets the user click a heading in edit mode
 *     and retype it directly; a slide rendered through <script type="text/babel">,
 *     React, or a loop over a JS array has to round-trip every tweak through a
 *     chat message instead. Reach for script-generated slides only when the
 *     content genuinely needs interactive behaviour static HTML can't express.
 *   - Do NOT set position/inset/width/height on the slide <section> elements —
 *     the component absolutely positions every slotted child for you.
 */
/* END USAGE */

(() => {
  const DESIGN_W_DEFAULT = 1920;
  const DESIGN_H_DEFAULT = 1080;
  const OVERLAY_HIDE_MS = 1800;
  const VALIDATE_ATTR = 'no_overflowing_text,no_overlapping_text,slide_sized_text';
  const FINE_POINTER_MQ = matchMedia('(hover: hover) and (pointer: fine)');
  const NARROW_MQ = matchMedia('(max-width: 640px)');
  // Slide-authored controls that should keep a tap instead of it navigating.
  const INTERACTIVE_SEL = 'a[href], button, input, select, textarea, summary, label, video[controls], audio[controls], [role="button"], [onclick], [tabindex]:not([tabindex^="-"]), [contenteditable]:not([contenteditable="false" i])';
  const pad2 = n => String(n).padStart(2, '0');

  // Label precedence: data-label → data-screen-label (number stripped) → first heading → "Slide".
  const getSlideLabel = el => {
    const explicit = el.getAttribute('data-label');
    if (explicit) return explicit;
    const existing = el.getAttribute('data-screen-label');
    if (existing) return existing.replace(/^\s*\d+\s*/, '').trim() || existing;
    const h = el.querySelector('h1, h2, h3, [data-title]');
    const t = h && (h.textContent || '').trim().slice(0, 40);
    if (t) return t;
    return 'Slide';
  };
  const stylesheet = `
    :host {
      position: fixed;
      inset: 0;
      display: block;
      background: #000;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
      overflow: hidden;
      -webkit-tap-highlight-color: transparent;
    }
    /* connectedCallback holds this until document.fonts.ready (capped 2s) so
     * the first visible paint has the deck's real typography + final rail
     * layout. opacity (not visibility) so the active slide can't un-hide
     * itself via the ::slotted([data-deck-active]) visibility:visible rule.
     * Only the stage/rail hide — the black :host background stays, so the
     * iframe doesn't flash the page's default white. */
    :host([data-fonts-pending]) .stage,
    :host([data-fonts-pending]) .rail { opacity: 0; pointer-events: none; }

    .stage {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .canvas {
      position: relative;
      transform-origin: center center;
      flex-shrink: 0;
      background: #fff;
      will-change: transform;
    }

    /* Slides live in light DOM (via <slot>) so authored CSS still applies.
       We absolutely position each slotted child to stack them. */
    ::slotted(*) {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      box-sizing: border-box !important;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
    }
    ::slotted([data-deck-active]) {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
    }

    .overlay {
      position: fixed;
      left: 50%;
      bottom: 22px;
      transform: translate(-50%, 6px) scale(0.92);
      filter: blur(6px);
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      background: #000;
      color: #fff;
      border-radius: 999px;
      font-size: 12px;
      font-feature-settings: "tnum" 1;
      letter-spacing: 0.01em;
      opacity: 0;
      pointer-events: none;
      transition: opacity 260ms ease, transform 260ms cubic-bezier(.2,.8,.2,1), filter 260ms ease;
      transform-origin: center bottom;
      z-index: 2147483000;
      user-select: none;
    }
    .overlay[data-visible] {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, 0) scale(1);
      filter: blur(0);
    }

    .btn {
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
      border: 0;
      margin: 0;
      padding: 0;
      color: inherit;
      font: inherit;
      cursor: default;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      min-width: 28px;
      border-radius: 999px;
      color: rgba(255,255,255,0.72);
      transition: background 140ms ease, color 140ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    .btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
    .btn:active { background: rgba(255,255,255,0.18); }
    .btn:focus { outline: none; }
    .btn:focus-visible { outline: none; }
    .btn::-moz-focus-inner { border: 0; }
    .btn svg { width: 14px; height: 14px; display: block; }
    .btn.reset {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.02em;
      padding: 0 10px 0 12px;
      gap: 6px;
      color: rgba(255,255,255,0.72);
    }
    .btn.reset .kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      font-size: 10px;
      line-height: 1;
      color: rgba(255,255,255,0.88);
      background: rgba(255,255,255,0.12);
      border-radius: 4px;
    }

    .count {
      font-variant-numeric: tabular-nums;
      color: #fff;
      font-weight: 500;
      padding: 0 8px;
      min-width: 42px;
      text-align: center;
      font-size: 12px;
    }
    .count .sep { color: rgba(255,255,255,0.45); margin: 0 3px; font-weight: 400; }
    .count .total { color: rgba(255,255,255,0.55); }

    .divider {
      width: 1px;
      height: 14px;
      background: rgba(255,255,255,0.18);
      margin: 0 2px;
    }

    /* ── Thumbnail rail ──────────────────────────────────────────────────
       Fixed column on the left; each thumbnail is a static deep-clone of
       the light-DOM slide scaled into a 16:9 (or design-aspect) frame. The
       stage re-fits around it (see _fit); hidden during present / noscale
       / print so capture geometry and fullscreen output are unchanged. */
    .rail {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--deck-rail-w, 188px);
      background: #141414;
      border-right: 1px solid rgba(255,255,255,0.08);
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px 10px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 2147482500;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.18) transparent;
    }
    .rail::-webkit-scrollbar { width: 8px; }
    .rail::-webkit-scrollbar-track { background: transparent; margin: 2px; }
    .rail::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.18);
      border-radius: 4px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    .rail::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.28);
      border: 2px solid transparent;
      background-clip: content-box;
    }
    :host([no-rail]) .rail,
    :host([noscale]) .rail { display: none; }
    .rail[data-presenting] { display: none; }
    @media (max-width: 640px) {
      .rail, .rail-resize { display: none; }
    }
    /* User-driven show/hide (the TweaksPanel toggle) slides instead of
       popping. Transitions are gated on :host([data-rail-anim]) — set only
       for the 200ms around the toggle — so window-resize and rail-width
       drag (which also call _fit) don't lag behind the cursor. */
    .rail[data-user-hidden] { transform: translateX(-100%); }
    :host([data-rail-anim]) .rail { transition: transform 200ms cubic-bezier(.3,.7,.4,1); }
    :host([data-rail-anim]) .stage { transition: left 200ms cubic-bezier(.3,.7,.4,1); }
    :host([data-rail-anim]) .canvas { transition: transform 200ms cubic-bezier(.3,.7,.4,1); }
    /* transition shorthand replaces rather than merges — repeat the base
       .overlay opacity/transform/filter transitions so visibility changes
       during the 200ms toggle window still fade instead of popping. */
    :host([data-rail-anim]) .overlay {
      transition: margin-left 200ms cubic-bezier(.3,.7,.4,1),
                  opacity 260ms ease,
                  transform 260ms cubic-bezier(.2,.8,.2,1),
                  filter 260ms ease;
    }

    .thumb {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }
    .thumb .num {
      width: 16px;
      flex-shrink: 0;
      font-size: 11px;
      font-weight: 500;
      text-align: right;
      color: rgba(255,255,255,0.55);
      padding-top: 2px;
      font-variant-numeric: tabular-nums;
    }
    .thumb .frame {
      position: relative;
      flex: 1;
      min-width: 0;
      aspect-ratio: var(--deck-aspect);
      background: #fff;
      border-radius: 4px;
      outline: 2px solid transparent;
      outline-offset: 0;
      overflow: hidden;
      transition: outline-color 120ms ease;
    }
    .thumb:hover .frame { outline-color: rgba(255,255,255,0.25); }
    .thumb { outline: none; }
    .thumb:focus-visible .frame { outline-color: rgba(255,255,255,0.5); }
    .thumb[data-current] .num { color: #fff; }
    .thumb[data-current] .frame { outline-color: #D97757; }
    .thumb[data-dragging] { opacity: 0.35; }
    .thumb::before {
      content: '';
      position: absolute;
      left: 24px;
      right: 0;
      height: 3px;
      border-radius: 2px;
      background: #D97757;
      opacity: 0;
      pointer-events: none;
    }
    .thumb[data-drop="before"]::before { top: -8px; opacity: 1; }
    .thumb[data-drop="after"]::before { bottom: -8px; opacity: 1; }
    .thumb[data-skip] .frame { opacity: 0.35; }
    .thumb[data-skip] .frame::after {
      content: 'Skipped';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.45);
      color: #fff;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.04em;
    }

    .ctxmenu {
      position: fixed;
      min-width: 150px;
      padding: 4px;
      background: #242424;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 7px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45);
      z-index: 2147483100;
      display: none;
      font-size: 12px;
    }
    .ctxmenu[data-open] { display: block; }
    .ctxmenu button {
      display: block;
      width: 100%;
      appearance: none;
      border: 0;
      background: transparent;
      color: #e8e8e8;
      font: inherit;
      text-align: left;
      padding: 6px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
    .ctxmenu button:hover:not(:disabled) { background: rgba(255,255,255,0.08); }
    .ctxmenu button:disabled { opacity: 0.35; cursor: default; }
    .ctxmenu hr {
      border: 0;
      border-top: 1px solid rgba(255,255,255,0.1);
      margin: 4px 2px;
    }

    .rail-resize {
      position: fixed;
      left: calc(var(--deck-rail-w, 188px) - 3px);
      top: 0;
      bottom: 0;
      width: 6px;
      cursor: col-resize;
      z-index: 2147482600;
      touch-action: none;
    }
    .rail-resize:hover,
    .rail-resize[data-dragging] { background: rgba(255,255,255,0.12); }
    :host([no-rail]) .rail-resize,
    :host([noscale]) .rail-resize,
    .rail[data-presenting] + .rail-resize,
    .rail[data-user-hidden] + .rail-resize { display: none; }

    /* Delete-confirm popup — matches the SPA's ConfirmDialog layout
       (title + message body, depressed footer with Cancel / Delete). */
    .confirm-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 2147483200;
      display: none;
      align-items: center;
      justify-content: center;
    }
    .confirm-backdrop[data-open] { display: flex; }
    .confirm {
      width: 320px;
      max-width: calc(100vw - 32px);
      background: #2a2a2a;
      color: #e8e8e8;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.5);
      overflow: hidden;
      font-family: inherit;
      animation: deck-confirm-in 0.18s ease;
    }
    @keyframes deck-confirm-in {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .confirm .body { padding: 20px 20px 16px; }
    .confirm .title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .confirm .msg { font-size: 13px; line-height: 1.5; color: rgba(255,255,255,0.65); }
    .confirm .footer {
      padding: 14px 20px;
      background: #1f1f1f;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .confirm button {
      appearance: none;
      font: inherit;
      font-size: 13px;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
    }
    .confirm .cancel {
      background: transparent;
      border: 0;
      color: rgba(255,255,255,0.8);
    }
    .confirm .cancel:hover { background: rgba(255,255,255,0.08); }
    .confirm .danger {
      background: #c96442;
      border: 1px solid rgba(0,0,0,0.15);
      color: #fff;
      box-shadow: 0 1px 3px rgba(166,50,68,0.3), 0 2px 6px rgba(166,50,68,0.18);
    }
    .confirm .danger:hover { background: #b5563a; }

    /* ── Print: one page per slide, no chrome ────────────────────────────
       The screen layout stacks every slide at inset:0 inside a scaled
       canvas; for print we want them in document flow at the authored
       design size so the browser paginates one slide per sheet. The
       @page size is set from the width/height attributes via the inline
       <style id="deck-stage-print-page"> that connectedCallback injects
       into <head> (the @page at-rule has no effect inside shadow DOM). */
    @media print {
      :host {
        position: static;
        inset: auto;
        background: none;
        overflow: visible;
        color: inherit;
      }
      .stage { position: static; display: block; }
      .canvas {
        transform: none !important;
        width: auto !important;
        height: auto !important;
        background: none;
        will-change: auto;
      }
      ::slotted(*) {
        position: relative !important;
        inset: auto !important;
        width: var(--deck-design-w) !important;
        height: var(--deck-design-h) !important;
        box-sizing: border-box !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto;
        break-after: page;
        page-break-after: always;
        break-inside: avoid;
        overflow: hidden;
      }
      /* :last-child alone isn't enough once data-deck-skip hides the
         trailing slide(s) — the last *visible* slide still carries
         break-after:page and prints a blank sheet. _markLastVisible()
         maintains data-deck-last-visible on the last non-skipped slide. */
      ::slotted(*:last-child),
      ::slotted([data-deck-last-visible]) {
        break-after: auto;
        page-break-after: auto;
      }
      ::slotted([data-deck-skip]) { display: none !important; }
      .overlay, .rail, .rail-resize, .ctxmenu, .confirm-backdrop { display: none !important; }
    }
  `;
  class DeckStage extends HTMLElement {
    static get observedAttributes() {
      return ['width', 'height', 'noscale', 'no-rail'];
    }
    constructor() {
      super();
      this._root = this.attachShadow({
        mode: 'open'
      });
      this._index = 0;
      this._slides = [];
      this._notes = [];
      this._hideTimer = null;
      this._mouseIdleTimer = null;
      this._menuIndex = -1;
      this._onKey = this._onKey.bind(this);
      this._onResize = this._onResize.bind(this);
      this._onSlotChange = this._onSlotChange.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onTap = this._onTap.bind(this);
      this._onMessage = this._onMessage.bind(this);
      // Capture-phase close so a click anywhere dismisses the menu, but
      // ignore clicks that land inside the menu itself — otherwise the
      // capture handler runs before the menu's own (bubble) handler and
      // clears _menuIndex out from under it.
      this._onDocClick = e => {
        if (this._menu && e.composedPath && e.composedPath().includes(this._menu)) return;
        this._closeMenu();
      };
    }
    get designWidth() {
      return parseInt(this.getAttribute('width'), 10) || DESIGN_W_DEFAULT;
    }
    get designHeight() {
      return parseInt(this.getAttribute('height'), 10) || DESIGN_H_DEFAULT;
    }
    connectedCallback() {
      // Presenter-view popup loads deckUrl?_snthumb=...#N for its prev/cur/
      // next thumbnails — the rail has no business rendering inside those
      // (wrong scale, and it offsets the stage so the thumb shows a gutter).
      if (/[?&]_snthumb=/.test(location.search)) this.setAttribute('no-rail', '');
      this._render();
      this._loadNotes();
      this._syncPrintPageRule();
      window.addEventListener('keydown', this._onKey);
      window.addEventListener('resize', this._onResize);
      window.addEventListener('mousemove', this._onMouseMove, {
        passive: true
      });
      window.addEventListener('message', this._onMessage);
      window.addEventListener('click', this._onDocClick, true);
      this.addEventListener('click', this._onTap);
      // Initial collection + layout happens via slotchange, which fires on mount.
      this._enableRail();
      // Hold the stage hidden until webfonts are ready so the first visible
      // paint has the deck's real typography — the :not(:defined) guard in
      // the page HTML only covers custom-element upgrade, not font load.
      // Capped so a 404'd font URL can't blank the deck indefinitely.
      this.setAttribute('data-fonts-pending', '');
      const reveal = () => this.removeAttribute('data-fonts-pending');
      // rAF first: fonts.ready is a pre-resolved promise until layout has
      // resolved the slotted text's font-family and pushed a FontFace into
      // 'loading'. Reading it here in connectedCallback (parse-time) would
      // settle the race in a microtask before any font fetch starts.
      requestAnimationFrame(() => {
        Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 2000))]).then(reveal, reveal);
      });
    }
    _enableRail() {
      // Idempotent — older host builds still post __omelette_rail_enabled.
      // no-rail guard keeps the observers/stylesheet walk off the cheap path
      // for presenter-popup thumbnail iframes (up to 9 per view).
      if (this._railEnabled || this.hasAttribute('no-rail')) return;
      this._railEnabled = true;
      // Per-viewer preference — restored alongside rail width. Default on;
      // only a stored '0' (from the TweaksPanel toggle) hides it.
      this._railVisible = true;
      try {
        if (localStorage.getItem('deck-stage.railVisible') === '0') this._railVisible = false;
      } catch (e) {}
      // Live thumbnail updates: watch the light-DOM slides for content
      // edits and re-clone just the affected thumb(s), debounced. Ignore
      // the data-deck-* / data-screen-label / data-om-validate attributes
      // this component itself writes so nav and skip don't trigger
      // spurious refreshes.
      const OWN_ATTRS = /^data-(deck-|screen-label$|om-validate$)/;
      this._liveDirty = new Set();
      this._liveObserver = new MutationObserver(records => {
        for (const r of records) {
          if (r.type === 'attributes' && OWN_ATTRS.test(r.attributeName || '')) continue;
          let n = r.target;
          while (n && n.parentElement !== this) n = n.parentElement;
          if (n && this._slideSet && this._slideSet.has(n)) this._liveDirty.add(n);
        }
        if (this._liveDirty.size && !this._liveTimer) {
          this._liveTimer = setTimeout(() => {
            this._liveTimer = null;
            this._liveDirty.forEach(s => this._refreshThumb(s));
            this._liveDirty.clear();
          }, 200);
        }
      });
      this._liveObserver.observe(this, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
      });
      // Lazy thumbnail materialization — clone the slide only when its
      // frame scrolls into (or near) the rail viewport. rootMargin gives
      // ~4 thumbs of pre-load so fast scrolling doesn't flash blanks.
      this._railObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && e.target.__deckThumb) {
            this._materialize(e.target.__deckThumb);
          }
        });
      }, {
        root: this._rail,
        rootMargin: '400px 0px'
      });
      // Tweaks typically change CSS vars / attrs OUTSIDE <deck-stage>
      // (on <html>, <body>, a wrapper div, or a <style> tag), which
      // _liveObserver can't see. Re-snapshot author CSS (constructable
      // sheet is shared by reference, so one replaceSync updates every
      // thumb shadow root) and re-sync each thumb host's attrs + custom
      // properties. In-slide DOM mutations are _liveObserver's job.
      // Debounced so slider drags don't thrash.
      this._onTweakChange = () => {
        clearTimeout(this._tweakTimer);
        this._tweakTimer = setTimeout(() => {
          this._snapshotAuthorCss();
          // One getComputedStyle for the whole batch — each
          // getPropertyValue read below reuses the same computed style
          // as long as nothing invalidates layout between thumbs.
          const cs = getComputedStyle(this);
          (this._thumbs || []).forEach(t => {
            if (t.host) this._syncThumbHostAttrs(t.host, cs);
          });
        }, 120);
      };
      window.addEventListener('tweakchange', this._onTweakChange);
      this._snapshotAuthorCss();
      // Build the rail now that it's enabled — slotchange already fired,
      // so _renderRail's early-return skipped the initial build.
      this._syncRailHidden();
      this._renderRail();
      this._fit();
    }

    /** Snapshot document stylesheets into a constructable sheet that each
     *  thumbnail's nested shadow root adopts — so author CSS styles the
     *  cloned slide content without touching this component's chrome.
     *  Cross-origin sheets throw on .cssRules — skip them. Re-callable:
     *  the existing constructable sheet is reused via replaceSync so every
     *  already-adopted shadow root picks up the fresh CSS without re-adopt. */
    _snapshotAuthorCss() {
      // :root in an adopted sheet inside a shadow root matches nothing
      // (only the document root qualifies), so author rules like
      // `:root[data-voice="modern"] .serif` never reach the clones.
      // Rewrite :root → :host and mirror <html>'s data-*/class/lang onto
      // each thumb host (see _syncThumbHostAttrs) so the same selectors
      // match inside the thumbnail's shadow tree.
      const authorCss = Array.from(document.styleSheets).map(sh => {
        try {
          return Array.from(sh.cssRules).map(r => r.cssText).join('\n');
        } catch (e) {
          return '';
        }
      }).join('\n')
      // The shadow host is featureless outside the functional :host(...)
      // form, so any compound on :root — [attr], .class, #id, :pseudo —
      // must become :host(<compound>) not :host<compound>. Same for the
      // html type selector (Tailwind class-strategy dark mode emits
      // html.dark; Pico uses html[data-theme]), which has nothing to
      // match inside the thumb's shadow tree.
      .replace(/:root((?:\[[^\]]*\]|[.#][-\w]+|:[-\w]+(?:\([^)]*\))?)+)/g, ':host($1)').replace(/:root\b/g, ':host').replace(/(^|[\s,>~+(}])html((?:\[[^\]]*\]|[.#][-\w]+|:[-\w]+(?:\([^)]*\))?)+)(?![-\w])/g, '$1:host($2)').replace(/(^|[\s,>~+(}])html(?![-\w])/g, '$1:host');
      // Every custom property the author references. _syncThumbHostAttrs
      // mirrors each one's *computed* value at <deck-stage> onto the
      // thumb host so the live value wins over the :host default above
      // regardless of which ancestor the tweak wrote to (<html>, <body>,
      // a wrapper div, or the deck-stage element itself all inherit
      // down to getComputedStyle(this)).
      this._authorVars = new Set(authorCss.match(/--[\w-]+/g) || []);
      try {
        if (!this._adoptedSheet) this._adoptedSheet = new CSSStyleSheet();
        this._adoptedSheet.replaceSync(authorCss);
      } catch (e) {
        this._adoptedSheet = null;
        this._authorCss = authorCss;
      }
    }
    _syncThumbHostAttrs(host, cs) {
      const de = document.documentElement;
      // setAttribute overwrites but can't delete — an attr removed from
      // <html> (toggleAttribute off, classList emptied) would linger on
      // the host and :host([data-*]) / :host(.foo) rules would keep
      // matching. Remove stale mirrored attrs first; iterate backward
      // because removeAttribute mutates the live NamedNodeMap.
      for (let i = host.attributes.length - 1; i >= 0; i--) {
        const n = host.attributes[i].name;
        if ((n.startsWith('data-') || n === 'class' || n === 'lang') && !de.hasAttribute(n)) {
          host.removeAttribute(n);
        }
      }
      for (const a of de.attributes) {
        if (a.name.startsWith('data-') || a.name === 'class' || a.name === 'lang') {
          host.setAttribute(a.name, a.value);
        }
      }
      // The :root→:host rewrite in _snapshotAuthorCss pins each custom
      // property to its stylesheet default on the thumb host, shadowing
      // the live value that would otherwise inherit. Tweaks can write the
      // live value on any ancestor — <html>, <body>, a wrapper div, the
      // deck-stage element — so read it as the *computed* value at
      // <deck-stage> (which sees the whole inheritance chain) rather than
      // trying to guess which element the author wrote to. Inline on the
      // host beats the :host{} rule. remove-stale covers vars dropped
      // from the stylesheet between snapshots.
      const vars = this._authorVars || new Set();
      for (let i = host.style.length - 1; i >= 0; i--) {
        const p = host.style[i];
        if (p.startsWith('--') && !vars.has(p)) host.style.removeProperty(p);
      }
      const live = cs || getComputedStyle(this);
      vars.forEach(p => {
        const v = live.getPropertyValue(p);
        if (v) host.style.setProperty(p, v.trim());else host.style.removeProperty(p);
      });
    }
    disconnectedCallback() {
      window.removeEventListener('keydown', this._onKey);
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('message', this._onMessage);
      window.removeEventListener('click', this._onDocClick, true);
      this.removeEventListener('click', this._onTap);
      if (this._hideTimer) clearTimeout(this._hideTimer);
      if (this._mouseIdleTimer) clearTimeout(this._mouseIdleTimer);
      if (this._liveTimer) clearTimeout(this._liveTimer);
      if (this._tweakTimer) clearTimeout(this._tweakTimer);
      if (this._railAnimTimer) clearTimeout(this._railAnimTimer);
      if (this._scaleRaf) cancelAnimationFrame(this._scaleRaf);
      if (this._liveObserver) this._liveObserver.disconnect();
      if (this._railObserver) this._railObserver.disconnect();
      if (this._onTweakChange) window.removeEventListener('tweakchange', this._onTweakChange);
    }
    attributeChangedCallback() {
      if (this._canvas) {
        this._canvas.style.width = this.designWidth + 'px';
        this._canvas.style.height = this.designHeight + 'px';
        this._canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
        this._canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
        if (this._rail) {
          this._rail.style.setProperty('--deck-aspect', this.designWidth + '/' + this.designHeight);
        }
        this._fit();
        this._scaleThumbs();
        this._syncPrintPageRule();
      }
    }
    _render() {
      const style = document.createElement('style');
      style.textContent = stylesheet;
      const stage = document.createElement('div');
      stage.className = 'stage';
      const canvas = document.createElement('div');
      canvas.className = 'canvas';
      canvas.style.width = this.designWidth + 'px';
      canvas.style.height = this.designHeight + 'px';
      canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
      canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
      const slot = document.createElement('slot');
      slot.addEventListener('slotchange', this._onSlotChange);
      canvas.appendChild(slot);
      stage.appendChild(canvas);

      // Overlay: compact, solid black, with clickable controls.
      const overlay = document.createElement('div');
      overlay.className = 'overlay export-hidden';
      overlay.setAttribute('role', 'toolbar');
      overlay.setAttribute('aria-label', 'Deck controls');
      overlay.setAttribute('data-omelette-chrome', '');
      overlay.innerHTML = `
        <button class="btn prev" type="button" aria-label="Previous slide" title="Previous (←)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>
        </button>
        <span class="count" aria-live="polite"><span class="current">1</span><span class="sep">/</span><span class="total">1</span></span>
        <button class="btn next" type="button" aria-label="Next slide" title="Next (→)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>
        </button>
        <span class="divider"></span>
        <button class="btn reset" type="button" aria-label="Reset to first slide" title="Reset (R)">Reset<span class="kbd">R</span></button>
      `;
      overlay.querySelector('.prev').addEventListener('click', () => this._advance(-1, 'click'));
      overlay.querySelector('.next').addEventListener('click', () => this._advance(1, 'click'));
      overlay.querySelector('.reset').addEventListener('click', () => this._go(0, 'click'));

      // Thumbnail rail + context menu. Thumbnails are populated in
      // _renderRail() after _collectSlides().
      const rail = document.createElement('div');
      rail.className = 'rail export-hidden';
      rail.setAttribute('data-omelette-chrome', '');
      rail.style.setProperty('--deck-aspect', this.designWidth + '/' + this.designHeight);
      // Edge auto-scroll while dragging a thumb near the rail's top/bottom
      // so off-screen drop targets are reachable. Native dragover fires
      // continuously while the pointer is stationary, so a per-event nudge
      // (ramped by edge proximity) is enough — no rAF loop needed.
      rail.addEventListener('dragover', e => {
        if (this._dragFrom == null) return;
        const r = rail.getBoundingClientRect();
        const EDGE = 40;
        const dt = e.clientY - r.top;
        const db = r.bottom - e.clientY;
        if (dt < EDGE) rail.scrollTop -= Math.ceil((EDGE - dt) / 3);else if (db < EDGE) rail.scrollTop += Math.ceil((EDGE - db) / 3);
      });
      const menu = document.createElement('div');
      menu.className = 'ctxmenu export-hidden';
      menu.setAttribute('data-omelette-chrome', '');
      menu.innerHTML = `
        <button type="button" data-act="skip">Skip slide</button>
        <button type="button" data-act="up">Move up</button>
        <button type="button" data-act="down">Move down</button>
        <hr>
        <button type="button" data-act="delete">Delete slide</button>
      `;
      menu.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (!act) return;
        const i = this._menuIndex;
        this._closeMenu();
        if (act === 'skip') this._toggleSkip(i);else if (act === 'up') this._moveSlide(i, i - 1);else if (act === 'down') this._moveSlide(i, i + 1);else if (act === 'delete') this._openConfirm(i);
      });
      menu.addEventListener('contextmenu', e => e.preventDefault());

      // Rail resize handle — drag to set --deck-rail-w, persisted to
      // localStorage so the width survives reloads.
      const resize = document.createElement('div');
      resize.className = 'rail-resize export-hidden';
      resize.setAttribute('data-omelette-chrome', '');
      resize.addEventListener('pointerdown', e => {
        e.preventDefault();
        resize.setPointerCapture(e.pointerId);
        resize.setAttribute('data-dragging', '');
        const move = ev => this._setRailWidth(ev.clientX);
        const up = () => {
          resize.removeEventListener('pointermove', move);
          resize.removeEventListener('pointerup', up);
          resize.removeEventListener('pointercancel', up);
          resize.removeAttribute('data-dragging');
          try {
            localStorage.setItem('deck-stage.railWidth', String(this._railPx));
          } catch (err) {}
        };
        resize.addEventListener('pointermove', move);
        resize.addEventListener('pointerup', up);
        resize.addEventListener('pointercancel', up);
      });

      // Delete-confirm dialog — mirrors the SPA's ConfirmDialog layout.
      const confirm = document.createElement('div');
      confirm.className = 'confirm-backdrop export-hidden';
      confirm.setAttribute('data-omelette-chrome', '');
      confirm.innerHTML = `
        <div class="confirm" role="dialog" aria-modal="true">
          <div class="body">
            <div class="title">Delete slide?</div>
            <div class="msg">This slide will be removed from the deck.</div>
          </div>
          <div class="footer">
            <button type="button" class="cancel">Cancel</button>
            <button type="button" class="danger">Delete</button>
          </div>
        </div>
      `;
      confirm.addEventListener('click', e => {
        if (e.target === confirm) this._closeConfirm();
      });
      confirm.querySelector('.cancel').addEventListener('click', () => this._closeConfirm());
      confirm.querySelector('.danger').addEventListener('click', () => {
        const i = this._confirmIndex;
        this._closeConfirm();
        this._deleteSlide(i);
      });
      this._root.append(style, rail, resize, stage, overlay, menu, confirm);
      this._canvas = canvas;
      this._stage = stage;
      this._slot = slot;
      this._overlay = overlay;
      this._rail = rail;
      this._resize = resize;
      this._menu = menu;
      this._confirm = confirm;
      this._countEl = overlay.querySelector('.current');
      this._totalEl = overlay.querySelector('.total');

      // Restore persisted rail width.
      let rw = 188;
      try {
        const s = localStorage.getItem('deck-stage.railWidth');
        if (s) rw = parseInt(s, 10) || rw;
      } catch (err) {}
      this._setRailWidth(rw);
      this._syncRailHidden();
    }
    _setRailWidth(px) {
      const w = Math.max(120, Math.min(360, Math.round(px)));
      this._railPx = w;
      this.style.setProperty('--deck-rail-w', w + 'px');
      this._fit();
      // _scaleThumbs forces a sync layout (frame.offsetWidth) then writes
      // N transforms. During a resize drag this runs per-pointermove;
      // coalesce to one per frame.
      if (!this._scaleRaf) {
        this._scaleRaf = requestAnimationFrame(() => {
          this._scaleRaf = null;
          this._scaleThumbs();
        });
      }
    }

    /** @page must live in the document stylesheet — it's a no-op inside
     *  shadow DOM. Inject/update a single <head> style tag so the print
     *  sheet matches the design size and Save-as-PDF yields one slide per
     *  page with no margins. */
    _syncPrintPageRule() {
      const id = 'deck-stage-print-page';
      let tag = document.getElementById(id);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = id;
        document.head.appendChild(tag);
      }
      tag.textContent = '@page { size: ' + this.designWidth + 'px ' + this.designHeight + 'px; margin: 0; } ' + '@media print { html, body { margin: 0 !important; padding: 0 !important; background: none !important; overflow: visible !important; height: auto !important; } ' + '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }';
    }
    _onSlotChange() {
      // Rail mutations (delete/move) already reconcile synchronously and
      // emit slidechange with reason 'api'; skip the async slotchange that
      // would otherwise re-broadcast with reason 'init'.
      if (this._squelchSlotChange) {
        this._squelchSlotChange = false;
        return;
      }
      this._collectSlides();
      this._restoreIndex();
      this._applyIndex({
        showOverlay: false,
        broadcast: true,
        reason: 'init'
      });
      this._fit();
    }
    _collectSlides() {
      const assigned = this._slot.assignedElements({
        flatten: true
      });
      this._slides = assigned.filter(el => {
        // Skip template/style/script nodes even if someone slots them.
        const tag = el.tagName;
        return tag !== 'TEMPLATE' && tag !== 'SCRIPT' && tag !== 'STYLE';
      });
      this._slideSet = new Set(this._slides);
      this._slides.forEach((slide, i) => {
        const n = i + 1;
        slide.setAttribute('data-screen-label', `${pad2(n)} ${getSlideLabel(slide)}`);

        // Validation attribute for comment flow / auto-checks.
        if (!slide.hasAttribute('data-om-validate')) {
          slide.setAttribute('data-om-validate', VALIDATE_ATTR);
        }
        slide.setAttribute('data-deck-slide', String(i));
      });
      if (this._totalEl) this._totalEl.textContent = String(this._slides.length || 1);
      if (this._index >= this._slides.length) this._index = Math.max(0, this._slides.length - 1);
      this._markLastVisible();
      this._renderRail();
    }

    /** Tag the last non-skipped slide so print CSS can drop its
     *  break-after (see the @media print comment above — :last-child
     *  alone matches a hidden skipped slide). */
    _markLastVisible() {
      let last = null;
      this._slides.forEach(s => {
        s.removeAttribute('data-deck-last-visible');
        if (!s.hasAttribute('data-deck-skip')) last = s;
      });
      if (last) last.setAttribute('data-deck-last-visible', '');
    }
    _loadNotes() {
      const tag = document.getElementById('speaker-notes');
      if (!tag) {
        this._notes = [];
        return;
      }
      try {
        const parsed = JSON.parse(tag.textContent || '[]');
        if (Array.isArray(parsed)) this._notes = parsed;
      } catch (e) {
        console.warn('[deck-stage] Failed to parse #speaker-notes JSON:', e);
        this._notes = [];
      }
    }
    _restoreIndex() {
      // The host's ?slide= param is delivered as a #<int> hash (1-indexed) on
      // the iframe src. No hash → slide 1; the deck itself keeps no position
      // state across loads.
      const h = (location.hash || '').match(/^#(\d+)$/);
      if (h) {
        const n = parseInt(h[1], 10) - 1;
        if (n >= 0 && n < this._slides.length) this._index = n;
      }
    }
    _applyIndex({
      showOverlay = true,
      broadcast = true,
      reason = 'init'
    } = {}) {
      if (!this._slides.length) return;
      const prev = this._prevIndex == null ? -1 : this._prevIndex;
      const curr = this._index;
      // Keep the iframe's own hash in sync so an in-iframe location.reload()
      // (reload banner path in viewer-handle.ts) lands on the current slide,
      // not the stale deep-link hash from initial load.
      try {
        history.replaceState(null, '', '#' + (curr + 1));
      } catch (e) {}
      this._slides.forEach((s, i) => {
        if (i === curr) s.setAttribute('data-deck-active', '');else s.removeAttribute('data-deck-active');
      });
      if (this._countEl) this._countEl.textContent = String(curr + 1);
      // Follow-scroll on every navigation (init deep-link, keyboard, click,
      // tap, external goTo) — the only time we *don't* want the rail to
      // track current is after a rail-internal mutation, where _renderRail
      // has already restored the user's scroll position and yanking back to
      // current would undo it.
      this._syncRail(reason !== 'mutation');
      if (broadcast) {
        // (1) Legacy: host-window postMessage for speaker-notes renderers.
        try {
          window.postMessage({
            slideIndexChanged: curr,
            deckTotal: this._slides.length,
            deckSkipped: this._skippedIndices()
          }, '*');
        } catch (e) {}

        // (2) In-page CustomEvent on the <deck-stage> element itself.
        //     Bubbles and composes out of shadow DOM so slide code can listen:
        //       document.querySelector('deck-stage').addEventListener('slidechange', e => {
        //         e.detail.index, e.detail.previousIndex, e.detail.total, e.detail.slide, e.detail.reason
        //       });
        const detail = {
          index: curr,
          previousIndex: prev,
          total: this._slides.length,
          slide: this._slides[curr] || null,
          previousSlide: prev >= 0 ? this._slides[prev] || null : null,
          reason: reason // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
        };
        this.dispatchEvent(new CustomEvent('slidechange', {
          detail,
          bubbles: true,
          composed: true
        }));
      }
      this._prevIndex = curr;
      if (showOverlay) this._flashOverlay();
    }
    _flashOverlay() {
      // Host posts __omelette_presenting while in fullscreen/tab presentation
      // mode — suppress the nav footer entirely (both hover and slide-change
      // flash) so the audience sees clean slides.
      if (!this._overlay || this._presenting) return;
      this._overlay.setAttribute('data-visible', '');
      if (this._hideTimer) clearTimeout(this._hideTimer);
      this._hideTimer = setTimeout(() => {
        this._overlay.removeAttribute('data-visible');
      }, OVERLAY_HIDE_MS);
    }
    _railWidth() {
      // State-based, no offsetWidth: the first _fit() can run before the
      // rail has had layout on some load paths, and a 0 there paints the
      // slide full-width for one frame before the post-slotchange _fit()
      // corrects it.
      if (!this._railEnabled || !this._railVisible || this.hasAttribute('no-rail') || this.hasAttribute('noscale') || this._presenting || this._previewMode || NARROW_MQ.matches) return 0;
      return this._railPx || 0;
    }
    _fit() {
      if (!this._canvas) return;
      const stage = this._canvas.parentElement;
      // PPTX export sets noscale so the DOM capture sees authored-size
      // geometry — the scaled canvas is in shadow DOM, so the exporter's
      // resetTransformSelector can't reach .canvas.style.transform directly.
      if (this.hasAttribute('noscale')) {
        this._canvas.style.transform = 'none';
        if (stage) stage.style.left = '0';
        if (this._overlay) this._overlay.style.marginLeft = '0';
        return;
      }
      const rw = this._railWidth();
      if (stage) stage.style.left = rw + 'px';
      // Overlay is centred on the viewport via left:50% + translate(-50%);
      // marginLeft shifts the centre by rw/2 so it lands in the middle of
      // the [rw, innerWidth] stage region.
      if (this._overlay) this._overlay.style.marginLeft = rw / 2 + 'px';
      const vw = window.innerWidth - rw;
      const vh = window.innerHeight;
      const s = Math.min(vw / this.designWidth, vh / this.designHeight);
      this._canvas.style.transform = `scale(${s})`;
    }
    _onResize() {
      this._fit();
      // Crossing the narrow-viewport breakpoint reveals the rail — rerun the
      // thumbnail scale the same way _setRailWidth does.
      if (!this._scaleRaf) {
        this._scaleRaf = requestAnimationFrame(() => {
          this._scaleRaf = null;
          this._scaleThumbs();
        });
      }
    }
    _onMouseMove() {
      // Keep overlay visible while mouse moves; hide after idle.
      this._flashOverlay();
    }
    _onMessage(e) {
      const d = e.data;
      if (d && typeof d.__omelette_presenting === 'boolean') {
        this._presenting = d.__omelette_presenting;
        if (this._presenting && this._overlay) {
          this._overlay.removeAttribute('data-visible');
          if (this._hideTimer) clearTimeout(this._hideTimer);
        }
        this._syncRailHidden();
        this._closeMenu();
        this._closeConfirm();
        this._fit();
        this._scaleThumbs();
      }
      // Host's Preview segment (ViewerMode='none'): the rail's drag-reorder /
      // right-click skip-delete affordances are editing chrome, so hide it
      // while the user is just looking at the deck. Same hard-hide path as
      // presenting; independent of the user's _railVisible preference so
      // returning to Edit restores whatever they had.
      if (d && typeof d.__omelette_preview_mode === 'boolean') {
        if (d.__omelette_preview_mode === this._previewMode) return;
        this._previewMode = d.__omelette_preview_mode;
        this._syncRailHidden();
        this._closeMenu();
        this._closeConfirm();
        this._fit();
        this._scaleThumbs();
      }
      // Per-viewer show/hide, driven by the TweaksPanel's auto-injected
      // "Thumbnail rail" toggle (or any author script). Independent of
      // whether the Tweaks panel itself is open — closing the panel
      // doesn't change rail visibility. Persists alongside rail width.
      if (d && d.type === '__deck_rail_visible' && typeof d.on === 'boolean') {
        if (d.on === this._railVisible) return;
        this._railVisible = d.on;
        try {
          localStorage.setItem('deck-stage.railVisible', d.on ? '1' : '0');
        } catch (e) {}
        // Arm the transition, commit it, then flip state — otherwise the
        // browser coalesces both writes and nothing animates on show.
        this.setAttribute('data-rail-anim', '');
        void (this._rail && this._rail.offsetHeight);
        this._syncRailHidden();
        this._fit();
        this._scaleThumbs();
        clearTimeout(this._railAnimTimer);
        this._railAnimTimer = setTimeout(() => this.removeAttribute('data-rail-anim'), 220);
      }
      if (d && d.type === '__omelette_rail_enabled') this._enableRail();
    }
    _syncRailHidden() {
      if (!this._rail) return;
      // data-presenting is the hard hide (display:none) for flag-off,
      // presentation mode, and the host's Preview segment — instant, no
      // transition. data-user-hidden is the soft hide (translateX(-100%))
      // for the viewer's rail toggle, so show/hide slides under
      // :host([data-rail-anim]).
      const hard = !this._railEnabled || this._presenting || this._previewMode;
      if (hard) this._rail.setAttribute('data-presenting', '');else this._rail.removeAttribute('data-presenting');
      if (!this._railVisible) this._rail.setAttribute('data-user-hidden', '');else this._rail.removeAttribute('data-user-hidden');
      // translateX hide leaves thumbs (tabIndex=0) in the tab order —
      // inert keeps them unfocusable while the rail is off-screen.
      this._rail.inert = hard || !this._railVisible;
    }
    _onTap(e) {
      // Touch-only — keyboard + the overlay toolbar cover nav on desktop.
      if (FINE_POINTER_MQ.matches) return;
      // Only taps that land on the stage (slide content or letterbox); the
      // overlay / rail / menus are siblings with their own click handlers.
      const path = e.composedPath();
      if (!this._stage || !path.includes(this._stage)) return;
      // Let interactive slide content keep the tap. composedPath (not
      // e.target.closest) so we see through open shadow roots — a <button>
      // inside a slide-authored custom element retargets e.target to the
      // host but still appears in the composed path.
      if (e.defaultPrevented) return;
      for (const n of path) {
        if (n === this._stage) break;
        if (n.matches && n.matches(INTERACTIVE_SEL)) return;
      }
      e.preventDefault();
      const rw = this._railWidth();
      const mid = rw + (window.innerWidth - rw) / 2;
      this._advance(e.clientX < mid ? -1 : 1, 'tap');
    }
    _onKey(e) {
      // Ignore when the user is typing.
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      // Confirm dialog swallows nav keys while open; Escape cancels. Enter
      // is left to the focused button's native activation so Tab→Cancel
      // →Enter activates Cancel, not the window-level confirm path.
      if (this._confirm && this._confirm.hasAttribute('data-open')) {
        if (e.key === 'Escape') {
          this._closeConfirm();
          e.preventDefault();
        }
        return;
      }
      if (e.key === 'Escape' && this._menu && this._menu.hasAttribute('data-open')) {
        this._closeMenu();
        e.preventDefault();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key;
      let handled = true;
      if (key === 'ArrowRight' || key === 'PageDown' || key === ' ' || key === 'Spacebar') {
        this._advance(1, 'keyboard');
      } else if (key === 'ArrowLeft' || key === 'PageUp') {
        this._advance(-1, 'keyboard');
      } else if (key === 'Home') {
        this._go(0, 'keyboard');
      } else if (key === 'End') {
        this._go(this._slides.length - 1, 'keyboard');
      } else if (key === 'r' || key === 'R') {
        this._go(0, 'keyboard');
      } else if (/^[0-9]$/.test(key)) {
        // 1..9 jump to that slide; 0 jumps to 10.
        const n = key === '0' ? 9 : parseInt(key, 10) - 1;
        if (n < this._slides.length) this._go(n, 'keyboard');
      } else {
        handled = false;
      }
      if (handled) {
        e.preventDefault();
        this._flashOverlay();
      }
    }
    _go(i, reason = 'api') {
      if (!this._slides.length) return;
      const clamped = Math.max(0, Math.min(this._slides.length - 1, i));
      if (clamped === this._index) {
        this._flashOverlay();
        return;
      }
      this._index = clamped;
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason
      });
    }

    /** Step forward/back skipping any slide marked data-deck-skip. Falls
     *  back to _go's clamp-at-ends behaviour (flash overlay) when there's
     *  nothing further in that direction. */
    _advance(dir, reason) {
      if (!this._slides.length) return;
      let i = this._index + dir;
      while (i >= 0 && i < this._slides.length && this._slides[i].hasAttribute('data-deck-skip')) {
        i += dir;
      }
      if (i < 0 || i >= this._slides.length) {
        this._flashOverlay();
        return;
      }
      this._go(i, reason);
    }

    // ── Thumbnail rail ────────────────────────────────────────────────────
    //
    // Thumbs are keyed by slide element and reused across _renderRail()
    // calls, so a reorder/delete is an O(changed) DOM shuffle instead of an
    // O(N) teardown-and-re-clone. Each thumb starts as a lightweight shell
    // (num + empty frame); the clone is materialized lazily by an
    // IntersectionObserver when the frame scrolls into (or near) view, so
    // only visible-ish slides pay the clone + image-decode cost.

    _renderRail() {
      if (!this._rail || !this._railEnabled) {
        this._thumbs = [];
        return;
      }
      // FLIP: record each *materialized* thumb's top before the reconcile.
      // Off-screen (non-materialized) thumbs don't need the animation and
      // skipping their getBoundingClientRect saves a forced layout per
      // off-screen thumb on large decks.
      const prevTops = new Map();
      (this._thumbs || []).forEach(({
        thumb,
        slide,
        host
      }) => {
        if (host) prevTops.set(slide, thumb.getBoundingClientRect().top);
      });
      const st = this._rail.scrollTop;

      // Reconcile: reuse thumbs that already exist for a slide, create
      // shells for new slides, drop thumbs for removed slides.
      const bySlide = new Map();
      (this._thumbs || []).forEach(t => bySlide.set(t.slide, t));
      const next = [];
      this._slides.forEach(slide => {
        let t = bySlide.get(slide);
        if (t) bySlide.delete(slide);else t = this._makeThumb(slide);
        next.push(t);
      });
      // Orphans — slides removed since last render.
      bySlide.forEach(t => {
        if (this._railObserver) this._railObserver.unobserve(t.frame);
        t.thumb.remove();
      });
      // Put thumbs into document order to match _slides. insertBefore on
      // an already-correctly-placed node is a no-op, so this is cheap
      // when nothing moved.
      next.forEach((t, i) => {
        const want = t.thumb;
        const at = this._rail.children[i];
        if (at !== want) this._rail.insertBefore(want, at || null);
        t.i = i;
        t.num.textContent = String(i + 1);
        if (t.slide.hasAttribute('data-deck-skip')) t.thumb.setAttribute('data-skip', '');else t.thumb.removeAttribute('data-skip');
      });
      this._thumbs = next;
      this._rail.scrollTop = st;
      if (prevTops.size) {
        const moved = [];
        this._thumbs.forEach(({
          thumb,
          slide
        }) => {
          const old = prevTops.get(slide);
          if (old == null) return;
          const dy = old - thumb.getBoundingClientRect().top;
          if (Math.abs(dy) < 1) return;
          thumb.style.transition = 'none';
          thumb.style.transform = `translateY(${dy}px)`;
          moved.push(thumb);
        });
        if (moved.length) {
          // Commit the inverted positions before flipping the transition
          // on — otherwise the browser coalesces both style writes and
          // nothing animates.
          void this._rail.offsetHeight;
          moved.forEach(t => {
            t.style.transition = 'transform 180ms cubic-bezier(.2,.7,.3,1)';
            t.style.transform = '';
          });
          setTimeout(() => moved.forEach(t => {
            t.style.transition = '';
          }), 220);
        }
      }
      requestAnimationFrame(() => this._scaleThumbs());
      this._syncRail(false);
    }

    /** Create a lightweight thumb shell for one slide. The clone is
     *  materialized later by the IntersectionObserver. Event handlers
     *  look up the thumb's *current* index (via _thumbs.indexOf) so the
     *  same element can be reused across reorders. */
    _makeThumb(slide) {
      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      thumb.tabIndex = 0;
      const num = document.createElement('div');
      num.className = 'num';
      const frame = document.createElement('div');
      frame.className = 'frame';
      thumb.append(num, frame);
      const entry = {
        thumb,
        num,
        frame,
        slide,
        clone: null,
        host: null,
        i: -1
      };
      // entry.i is refreshed on every _renderRail reconcile pass, so
      // handlers read the thumb's current position without an O(N) scan.
      const idx = () => entry.i;
      thumb.addEventListener('click', () => this._go(idx(), 'click'));
      // ↑/↓ step through the rail when a thumb has focus. _go clamps at the
      // ends and _applyIndex→_syncRail scrolls the new current thumb into
      // view; we move focus to it (preventScroll — _syncRail already
      // scrolled) so a held key walks the whole list. stopPropagation keeps
      // this out of the window-level _onKey nav handler.
      thumb.addEventListener('keydown', e => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        e.preventDefault();
        e.stopPropagation();
        this._go(idx() + (e.key === 'ArrowDown' ? 1 : -1), 'keyboard');
        const cur = this._thumbs && this._thumbs[this._index];
        if (cur) cur.thumb.focus({
          preventScroll: true
        });
      });
      thumb.addEventListener('contextmenu', e => {
        e.preventDefault();
        this._openMenu(idx(), e.clientX, e.clientY);
      });
      thumb.draggable = true;
      thumb.addEventListener('dragstart', e => {
        this._dragFrom = idx();
        thumb.setAttribute('data-dragging', '');
        e.dataTransfer.effectAllowed = 'move';
        try {
          e.dataTransfer.setData('text/plain', String(this._dragFrom));
        } catch (err) {}
      });
      thumb.addEventListener('dragend', () => {
        thumb.removeAttribute('data-dragging');
        this._clearDrop();
        this._dragFrom = null;
      });
      thumb.addEventListener('dragover', e => {
        if (this._dragFrom == null) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const r = thumb.getBoundingClientRect();
        this._setDrop(idx(), e.clientY < r.top + r.height / 2 ? 'before' : 'after');
      });
      thumb.addEventListener('drop', e => {
        if (this._dragFrom == null) return;
        e.preventDefault();
        const i = idx();
        const r = thumb.getBoundingClientRect();
        let to = e.clientY >= r.top + r.height / 2 ? i + 1 : i;
        if (this._dragFrom < to) to--;
        const from = this._dragFrom;
        this._clearDrop();
        this._dragFrom = null;
        if (to !== from) this._moveSlide(from, to);
      });
      if (this._railObserver) this._railObserver.observe(frame);
      frame.__deckThumb = entry;
      return entry;
    }

    /** Lazily build the clone for a thumb that has scrolled into view. */
    _materialize(entry) {
      if (entry.host) return;
      const dw = this.designWidth,
        dh = this.designHeight;
      let clone = entry.slide.cloneNode(true);
      clone.removeAttribute('id');
      clone.removeAttribute('data-deck-active');
      clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      // Neuter heavy media; replace <video> with its poster so the box
      // keeps a visual. <iframe>/<audio> become empty placeholders.
      clone.querySelectorAll('iframe, audio, object, embed').forEach(el => {
        el.removeAttribute('src');
        el.removeAttribute('srcdoc');
        el.removeAttribute('data');
        el.innerHTML = '';
      });
      clone.querySelectorAll('video').forEach(el => {
        if (!el.poster) {
          el.removeAttribute('src');
          el.innerHTML = '';
          return;
        }
        const img = document.createElement('img');
        img.src = el.poster;
        img.alt = '';
        img.style.cssText = el.style.cssText + ';object-fit:cover;width:100%;height:100%;';
        img.className = el.className;
        el.replaceWith(img);
      });
      // Images: defer decode and let the browser pick the smallest
      // srcset candidate for the ~140px thumb. Same-URL clones reuse the
      // slide's decoded bitmap (URL-keyed cache), so the remaining cost
      // is paint/composite — lazy+async keeps that off the main thread.
      clone.querySelectorAll('img').forEach(el => {
        el.loading = 'lazy';
        el.decoding = 'async';
        if (el.srcset) el.sizes = (this._railPx || 188) + 'px';
      });
      // Custom elements inside the slide would have their
      // connectedCallback fire when the clone is appended. Replace them
      // with inert boxes so a component-heavy deck doesn't run N copies
      // of each component's mount logic in the rail. Children are
      // preserved so layout-wrapper elements (<my-column><h2>…</h2>)
      // still show their authored content; the querySelectorAll NodeList
      // is static, so nested custom elements in the moved subtree are
      // still visited on later iterations.
      const neuter = el => {
        const box = document.createElement('div');
        box.style.cssText = (el.getAttribute('style') || '') + ';background:rgba(0,0,0,0.06);border:1px dashed rgba(0,0,0,0.15);';
        box.className = el.className;
        // Preserve theming/i18n hooks so [data-*] / :lang() / [dir]
        // descendant selectors still match the neutered root.
        for (const a of el.attributes) {
          const n = a.name;
          if (n.startsWith('data-') || n.startsWith('aria-') || n === 'lang' || n === 'dir' || n === 'role' || n === 'title') {
            box.setAttribute(n, a.value);
          }
        }
        while (el.firstChild) box.appendChild(el.firstChild);
        return box;
      };
      // querySelectorAll('*') returns descendants only — a custom-element
      // slide root (<my-slide>…</my-slide>) would slip through and upgrade
      // on append. Swap the root first.
      if (clone.tagName.includes('-')) clone = neuter(clone);
      clone.querySelectorAll('*').forEach(el => {
        if (el.tagName.includes('-')) el.replaceWith(neuter(el));
      });
      clone.style.cssText += ';position:absolute;top:0;left:0;transform-origin:0 0;' + 'pointer-events:none;width:' + dw + 'px;height:' + dh + 'px;' + 'box-sizing:border-box;overflow:hidden;visibility:visible;opacity:1;';
      const host = document.createElement('div');
      host.style.cssText = 'position:absolute;inset:0;';
      this._syncThumbHostAttrs(host);
      const sr = host.attachShadow({
        mode: 'open'
      });
      if (this._adoptedSheet) sr.adoptedStyleSheets = [this._adoptedSheet];else {
        const st = document.createElement('style');
        st.textContent = this._authorCss || '';
        sr.appendChild(st);
      }
      sr.appendChild(clone);
      entry.frame.appendChild(host);
      entry.host = host;
      entry.clone = clone;
      if (this._thumbScale) clone.style.transform = 'scale(' + this._thumbScale + ')';
      // Once materialized the IO callback is a no-op early-return —
      // unobserve so scroll doesn't keep firing it.
      if (this._railObserver) this._railObserver.unobserve(entry.frame);
    }

    /** Re-clone a single thumb (live-update path). No-op if the thumb
     *  hasn't been materialized yet — it'll pick up current content when
     *  it scrolls into view. */
    _refreshThumb(slide) {
      const entry = (this._thumbs || []).find(t => t.slide === slide);
      if (!entry || !entry.host) return;
      entry.host.remove();
      entry.host = entry.clone = null;
      this._materialize(entry);
    }
    _scaleThumbs() {
      if (!this._thumbs || !this._thumbs.length) return;
      // Every frame is the same width; if it reads 0 the rail is
      // display:none (noscale / no-rail / presenting / print) — leave the
      // clones as-is and re-run when the rail is revealed.
      const fw = this._thumbs[0].frame.offsetWidth;
      if (!fw) return;
      this._thumbScale = fw / this.designWidth;
      this._thumbs.forEach(({
        clone
      }) => {
        if (clone) clone.style.transform = 'scale(' + this._thumbScale + ')';
      });
    }
    _setDrop(i, where) {
      // dragover fires at pointer-event rate; touch only the previous
      // and new target rather than sweeping all N thumbs.
      const t = this._thumbs && this._thumbs[i];
      if (this._dropOn && this._dropOn !== t) {
        this._dropOn.thumb.removeAttribute('data-drop');
      }
      if (t) t.thumb.setAttribute('data-drop', where);
      this._dropOn = t || null;
    }
    _clearDrop() {
      if (this._dropOn) this._dropOn.thumb.removeAttribute('data-drop');
      this._dropOn = null;
    }
    _syncRail(follow) {
      if (!this._thumbs) return;
      this._thumbs.forEach(({
        thumb
      }, i) => {
        if (i === this._index) {
          thumb.setAttribute('data-current', '');
          if (follow && typeof thumb.scrollIntoView === 'function') {
            thumb.scrollIntoView({
              block: 'nearest'
            });
          }
        } else {
          thumb.removeAttribute('data-current');
        }
      });
    }
    _openMenu(i, x, y) {
      if (!this._menu) return;
      this._menuIndex = i;
      const slide = this._slides[i];
      const skip = slide && slide.hasAttribute('data-deck-skip');
      this._menu.querySelector('[data-act="skip"]').textContent = skip ? 'Unskip slide' : 'Skip slide';
      this._menu.querySelector('[data-act="up"]').disabled = i <= 0;
      this._menu.querySelector('[data-act="down"]').disabled = i >= this._slides.length - 1;
      this._menu.querySelector('[data-act="delete"]').disabled = this._slides.length <= 1;
      // Place, then clamp to viewport after it's measurable.
      this._menu.style.left = x + 'px';
      this._menu.style.top = y + 'px';
      this._menu.setAttribute('data-open', '');
      const r = this._menu.getBoundingClientRect();
      const nx = Math.min(x, window.innerWidth - r.width - 4);
      const ny = Math.min(y, window.innerHeight - r.height - 4);
      this._menu.style.left = Math.max(4, nx) + 'px';
      this._menu.style.top = Math.max(4, ny) + 'px';
    }
    _closeMenu() {
      if (this._menu) this._menu.removeAttribute('data-open');
      this._menuIndex = -1;
    }
    _openConfirm(i) {
      if (!this._confirm) return;
      this._confirmIndex = i;
      this._confirm.querySelector('.title').textContent = 'Delete slide ' + (i + 1) + '?';
      this._confirm.setAttribute('data-open', '');
      const btn = this._confirm.querySelector('.danger');
      if (btn && btn.focus) btn.focus();
    }
    _closeConfirm() {
      if (this._confirm) this._confirm.removeAttribute('data-open');
      this._confirmIndex = -1;
    }
    _emitDeckChange(detail) {
      this.dispatchEvent(new CustomEvent('deckchange', {
        detail,
        bubbles: true,
        composed: true
      }));
    }
    _deleteSlide(i) {
      const slide = this._slides[i];
      if (!slide || this._slides.length <= 1) return;
      const wasCurrent = i === this._index;
      if (i < this._index || wasCurrent && i === this._slides.length - 1) this._index--;
      this._squelchSlotChange = true;
      slide.remove();
      this._emitDeckChange({
        action: 'delete',
        from: i,
        slide
      });
      this._collectSlides();
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason: 'mutation'
      });
    }
    _toggleSkip(i) {
      const slide = this._slides[i];
      if (!slide) return;
      const on = !slide.hasAttribute('data-deck-skip');
      if (on) slide.setAttribute('data-deck-skip', '');else slide.removeAttribute('data-deck-skip');
      if (this._thumbs && this._thumbs[i]) {
        if (on) this._thumbs[i].thumb.setAttribute('data-skip', '');else this._thumbs[i].thumb.removeAttribute('data-skip');
      }
      this._markLastVisible();
      this._emitDeckChange({
        action: on ? 'skip' : 'unskip',
        from: i,
        slide
      });
      // Re-broadcast so the presenter popup's prev/next thumbnails re-pick
      // the nearest non-skipped slide without waiting for a nav event.
      try {
        window.postMessage({
          slideIndexChanged: this._index,
          deckTotal: this._slides.length,
          deckSkipped: this._skippedIndices()
        }, '*');
      } catch (e) {}
    }
    _skippedIndices() {
      const out = [];
      for (let i = 0; i < this._slides.length; i++) {
        if (this._slides[i].hasAttribute('data-deck-skip')) out.push(i);
      }
      return out;
    }
    _moveSlide(i, j) {
      if (j < 0 || j >= this._slides.length || j === i) return;
      const slide = this._slides[i];
      const ref = j < i ? this._slides[j] : this._slides[j].nextSibling;
      // Track the active slide across the reorder so the same content
      // stays on screen.
      const cur = this._index;
      if (cur === i) this._index = j;else if (i < cur && j >= cur) this._index = cur - 1;else if (i > cur && j <= cur) this._index = cur + 1;
      this._squelchSlotChange = true;
      this.insertBefore(slide, ref);
      this._emitDeckChange({
        action: 'move',
        from: i,
        to: j,
        slide
      });
      this._collectSlides();
      this._applyIndex({
        showOverlay: false,
        broadcast: true,
        reason: 'mutation'
      });
    }

    // Public API ------------------------------------------------------------

    /** Current slide index (0-based). */
    get index() {
      return this._index;
    }
    /** Total slide count. */
    get length() {
      return this._slides.length;
    }
    /** Programmatically navigate. */
    goTo(i) {
      this._go(i, 'api');
    }
    next() {
      this._advance(1, 'api');
    }
    prev() {
      this._advance(-1, 'api');
    }
    reset() {
      this._go(0, 'api');
    }
  }
  if (!customElements.get('deck-stage')) {
    customElements.define('deck-stage', DeckStage);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "slides/deck-stage.js", error: String((e && e.message) || e) }); }

// ui_kits/mobile-app/icons.jsx
try { (() => {
// icons.jsx — Lucide icon paths rendered as inline SVG (self-contained, no CDN).
// Stroke style: 2px rounded, currentColor. Matches the documented Lucide system.
const ICON_PATHS = {
  dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  columns: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18M15 3v18"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  mapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  sparkles: '<path d="M9.94 14.34A2 2 0 0 0 8.6 13l-5.92-1.96a.5.5 0 0 1 0-.95L8.6 8.13a2 2 0 0 0 1.34-1.34l1.96-5.92a.5.5 0 0 1 .95 0l1.96 5.92a2 2 0 0 0 1.34 1.34l5.92 1.96a.5.5 0 0 1 0 .95L17.4 13a2 2 0 0 0-1.34 1.34l-1.96 5.92a.5.5 0 0 1-.95 0z"/><path d="M19 3v4M21 5h-4"/>',
  trending: '<path d="M22 7 13.5 15.5l-5-5L2 17"/><path d="M16 7h6v6"/>',
  building: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  star: '<path d="M11.5 2.5 14 8l6 .5-4.5 4 1.5 6-5.5-3.5L6.5 18.5 8 12.5 3.5 8.5 9.5 8z"/>',
  arrowUpRight: '<path d="M7 7h10v10M7 17 17 7"/>',
  snooze: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/><path d="M3 3l3 2"/>',
  voicemail: '<circle cx="6" cy="12" r="4"/><circle cx="18" cy="12" r="4"/><path d="M6 16h12"/>',
  userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/>'
};
function Icon({
  name,
  size = 20,
  stroke = 2,
  className = '',
  style = {}
}) {
  return React.createElement('svg', {
    className,
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style,
    dangerouslySetInnerHTML: {
      __html: ICON_PATHS[name] || ''
    }
  });
}
Object.assign(window, {
  Icon,
  ICON_PATHS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile-app/icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile-app/ios-frame.jsx
try { (() => {
/* BEGIN USAGE */
// iOS.jsx — Simplified iOS 26 (Liquid Glass) device frame
// Based on the iOS 26 UI Kit + Figma status bar spec. No assets, no deps.
// Exports (to window): IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard
//
// Usage — wrap your screen content in <IOSDevice> to get the bezel, status bar
// and home indicator (props: title, dark, keyboard):
//
//   <IOSDevice title="Settings">
//     ...your screen content...
//   </IOSDevice>
//   <IOSDevice dark title="Search" keyboard>…</IOSDevice>
/* END USAGE */

// ─────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({
  dark = false,
  time = '9:41'
}) {
  const c = dark ? '#fff' : '#000';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 154,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '21px 24px 19px',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 20,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontWeight: 590,
      fontSize: 17,
      lineHeight: '22px',
      color: c
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingTop: 1,
      paddingRight: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "12",
    viewBox: "0 0 19 12"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7.5",
    width: "3.2",
    height: "4.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.8",
    y: "5",
    width: "3.2",
    height: "7",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9.6",
    y: "2.5",
    width: "3.2",
    height: "9.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14.4",
    y: "0",
    width: "3.2",
    height: "12",
    rx: "0.7",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z",
    fill: c
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "10.5",
    r: "1.5",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "27",
    height: "13",
    viewBox: "0 0 27 13"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "23",
    height: "12",
    rx: "3.5",
    stroke: c,
    strokeOpacity: "0.35",
    fill: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "9",
    rx: "2",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z",
    fill: c,
    fillOpacity: "0.4"
  }))));
}

// ─────────────────────────────────────────────────────────────
// Liquid glass pill — blur + tint + shine
// ─────────────────────────────────────────────────────────────
function IOSGlassPill({
  children,
  dark = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      minWidth: 44,
      borderRadius: 9999,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.28)' : 'rgba(255,255,255,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '0 4px'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Navigation bar — glass pills + large title
// ─────────────────────────────────────────────────────────────
function IOSNavBar({
  title = 'Title',
  dark = false,
  trailingIcon = true
}) {
  const muted = dark ? 'rgba(255,255,255,0.6)' : '#404040';
  const text = dark ? '#fff' : '#000';
  const pillIcon = content => /*#__PURE__*/React.createElement(IOSGlassPill, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, content));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      paddingTop: 62,
      paddingBottom: 10,
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }
  }, pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "20",
    viewBox: "0 0 12 20",
    fill: "none",
    style: {
      marginLeft: -1
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2L2 10l8 8",
    stroke: muted,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), trailingIcon && pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "6",
    viewBox: "0 0 22 6"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "3",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "3",
    r: "2.5",
    fill: muted
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      fontFamily: '-apple-system, system-ui',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: '41px',
      color: text,
      letterSpacing: 0.4
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// Grouped list (inset card, r:26) + row (52px)
// ─────────────────────────────────────────────────────────────
function IOSListRow({
  title,
  detail,
  icon,
  chevron = true,
  isLast = false,
  dark = false
}) {
  const text = dark ? '#fff' : '#000';
  const sec = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const ter = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const sep = dark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 52,
      padding: '0 16px',
      position: 'relative',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      letterSpacing: -0.43
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: icon,
      marginRight: 12,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      color: text
    }
  }, title), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec,
      marginRight: 6
    }
  }, detail), chevron && /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: ter,
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !isLast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: icon ? 58 : 16,
      height: 0.5,
      background: sep
    }
  }));
}
function IOSList({
  header,
  children,
  dark = false
}) {
  const hc = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? '#1C1C1E' : '#fff';
  return /*#__PURE__*/React.createElement("div", null, header && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '-apple-system, system-ui',
      fontSize: 13,
      color: hc,
      textTransform: 'uppercase',
      padding: '8px 36px 6px',
      letterSpacing: -0.08
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      borderRadius: 26,
      margin: '0 16px',
      overflow: 'hidden'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Device frame
// ─────────────────────────────────────────────────────────────
function IOSDevice({
  children,
  width = 402,
  height = 874,
  dark = false,
  title,
  keyboard = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: 48,
      overflow: 'hidden',
      position: 'relative',
      background: dark ? '#000' : '#F2F2F7',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 11,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 126,
      height: 37,
      borderRadius: 24,
      background: '#000',
      zIndex: 50
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(IOSStatusBar, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, title !== undefined && /*#__PURE__*/React.createElement(IOSNavBar, {
    title: title,
    dark: dark
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, children), keyboard && /*#__PURE__*/React.createElement(IOSKeyboard, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 60,
      height: 34,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingBottom: 8,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 139,
      height: 5,
      borderRadius: 100,
      background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'
    }
  })));
}

// ─────────────────────────────────────────────────────────────
// Keyboard — iOS 26 liquid glass
// ─────────────────────────────────────────────────────────────
function IOSKeyboard({
  dark = false
}) {
  const glyph = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const sugg = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBg = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  // special-key icons
  const icons = {
    shift: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "17",
      viewBox: "0 0 19 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z",
      fill: glyph
    })),
    del: /*#__PURE__*/React.createElement("svg", {
      width: "23",
      height: "17",
      viewBox: "0 0 23 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z",
      fill: "none",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 5l7 7M17 5l-7 7",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinecap: "round"
    })),
    ret: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "14",
      viewBox: "0 0 20 14"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 1v6H4m0 0l4-4M4 7l4 4",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  };
  const key = (content, {
    w,
    flex,
    ret,
    fs = 25,
    k
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: 42,
      borderRadius: 8.5,
      flex: flex ? 1 : undefined,
      width: w,
      minWidth: 0,
      background: ret ? '#08f' : keyBg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.075)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, "SF Compact", system-ui',
      fontSize: fs,
      fontWeight: 458,
      color: ret ? '#fff' : glyph
    }
  }, content);
  const row = (keys, pad = 0) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      justifyContent: 'center',
      padding: `0 ${pad}px`
    }
  }, keys.map(l => key(l, {
    flex: true,
    k: l
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 15,
      borderRadius: 27,
      overflow: 'hidden',
      padding: '11px 0 2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: dark ? '0 -2px 20px rgba(0,0,0,0.09)' : '0 -1px 6px rgba(0,0,0,0.018), 0 -3px 20px rgba(0,0,0,0.012)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '8px 22px 13px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, ['"The"', 'the', 'to'].map((w, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 25,
      background: '#ccc',
      opacity: 0.3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      color: sugg,
      letterSpacing: -0.43,
      lineHeight: '22px'
    }
  }, w)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13,
      padding: '0 6.5px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 20), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14.25,
      alignItems: 'center'
    }
  }, key(icons.shift, {
    w: 45,
    k: 'shift'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      flex: 1
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l, {
    flex: true,
    k: l
  }))), key(icons.del, {
    w: 45,
    k: 'del'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, key('ABC', {
    w: 92.25,
    fs: 18,
    k: 'abc'
  }), key('', {
    flex: true,
    k: 'space'
  }), key(icons.ret, {
    w: 92.25,
    ret: true,
    k: 'ret'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      width: '100%',
      position: 'relative'
    }
  }));
}
Object.assign(window, {
  IOSDevice,
  IOSStatusBar,
  IOSNavBar,
  IOSGlassPill,
  IOSList,
  IOSListRow,
  IOSKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile-app/ios-frame.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile-app/screens.jsx
try { (() => {
// screens.jsx — Solura field-rep mobile app (inside iOS frame).
const M_LEADS = [{
  id: 'SOL-4830',
  name: 'Harold & Jean Park',
  contact: 'Son · David',
  phone: '(206) 555-0198',
  temp: 'hot',
  best: 'Now',
  age: 1,
  city: 'Bellevue',
  care: 'Personal care · live-in',
  dist: '2.1 mi',
  addr: '1820 108th Ave NE'
}, {
  id: 'SOL-4821',
  name: 'Margaret Alvarez',
  contact: 'Daughter · Sofia',
  phone: '(206) 555-0142',
  temp: 'warm',
  best: '4–6pm',
  age: 5,
  city: 'Seattle',
  care: 'Companion care · 20 hrs/wk',
  dist: '5.4 mi',
  addr: '914 E Pine St'
}, {
  id: 'SOL-4711',
  name: 'Dorothy Klein',
  contact: 'Niece · Rachel',
  phone: '(253) 555-0411',
  temp: 'warm',
  best: '5pm',
  age: 7,
  city: 'Tacoma',
  care: 'Personal care · 30 hrs/wk',
  dist: '8.0 mi',
  addr: '2401 S 19th St'
}, {
  id: 'SOL-4756',
  name: 'Robert Tanaka',
  contact: 'Wife · Susan',
  phone: '(206) 555-0233',
  temp: 'cool',
  best: 'Thu 2pm',
  age: 13,
  city: 'Renton',
  care: 'Respite care',
  dist: '11.3 mi',
  addr: '330 Burnett Ave S',
  overdue: true
}];
const M_TEMP = {
  hot: {
    label: 'Hot',
    bg: 'var(--temp-hot-bg)',
    fg: 'var(--red-700)',
    dot: 'var(--temp-hot)'
  },
  warm: {
    label: 'Warm',
    bg: 'var(--temp-warm-bg)',
    fg: 'var(--gold-700)',
    dot: 'var(--temp-warm)'
  },
  cool: {
    label: 'Cool',
    bg: 'var(--temp-cool-bg)',
    fg: 'var(--blue-700)',
    dot: 'var(--temp-cool)'
  },
  cold: {
    label: 'Cold',
    bg: 'var(--temp-cold-bg)',
    fg: 'var(--neutral-600)',
    dot: 'var(--temp-cold)'
  }
};
const mInit = n => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
const M_AVC = ['var(--blue-500)', 'var(--gold-500)', 'var(--green-500)', 'var(--violet-500)'];
const mColor = n => {
  let h = 0;
  for (const c of n) h = (h * 31 + c.charCodeAt(0)) % M_AVC.length;
  return M_AVC[h];
};
function MAvatar({
  name,
  size = 44
}) {
  return React.createElement('span', {
    className: 'm-av',
    style: {
      width: size,
      height: size,
      background: mColor(name),
      fontSize: size * 0.36
    }
  }, mInit(name));
}
function MTemp({
  temp
}) {
  const t = M_TEMP[temp];
  return React.createElement('span', {
    className: 'm-temp',
    style: {
      background: t.bg,
      color: t.fg
    }
  }, React.createElement('span', {
    className: 'm-temp-dot',
    style: {
      background: t.dot
    }
  }), t.label);
}

// ---------- Today (queue) ----------
function MToday({
  onOpen,
  onLog
}) {
  return React.createElement('div', {
    className: 'm-screen'
  }, React.createElement('div', {
    className: 'm-hero'
  }, React.createElement('div', {
    className: 'm-hero-top'
  }, React.createElement('div', null, React.createElement('div', {
    className: 'm-hero-hi'
  }, 'Good morning, Marcus'), React.createElement('div', {
    className: 'm-hero-sub'
  }, '4 families to reach today')), React.createElement(MAvatar, {
    name: 'Marcus Reed',
    size: 40
  })), React.createElement('div', {
    className: 'm-sunwin'
  }, React.createElement(Icon, {
    name: 'sun',
    size: 20,
    style: {
      color: '#fff'
    }
  }), React.createElement('div', null, React.createElement('div', {
    className: 'm-sunwin-l'
  }, 'Your best window'), React.createElement('div', {
    className: 'm-sunwin-v'
  }, 'Now until 11:30am')), React.createElement('div', {
    className: 'm-sunwin-count'
  }, '2 hot'))), React.createElement('div', {
    className: 'm-listhead'
  }, 'Up next'), React.createElement('div', {
    className: 'm-list'
  }, M_LEADS.map(l => React.createElement('button', {
    key: l.id,
    className: 'm-card',
    onClick: () => onOpen(l)
  }, React.createElement('div', {
    className: 'm-card-top'
  }, React.createElement(MAvatar, {
    name: l.name,
    size: 42
  }), React.createElement('div', {
    className: 'm-card-id'
  }, React.createElement('div', {
    className: 'm-card-name'
  }, l.name), React.createElement('div', {
    className: 'm-card-contact'
  }, l.contact)), React.createElement(MTemp, {
    temp: l.temp
  })), React.createElement('div', {
    className: 'm-card-best'
  }, React.createElement(Icon, {
    name: 'sun',
    size: 14,
    style: {
      color: 'var(--gold-600)'
    }
  }), React.createElement('span', null, 'Best: ', React.createElement('b', null, l.best)), React.createElement('span', {
    className: 'm-card-dist'
  }, React.createElement(Icon, {
    name: 'mapPin',
    size: 12,
    style: {
      color: 'var(--fg-3)'
    }
  }), l.dist), l.overdue && React.createElement('span', {
    className: 'm-overdue'
  }, 'Overdue')), React.createElement('div', {
    className: 'm-card-actions'
  }, React.createElement('span', {
    className: 'm-cta m-cta-call',
    onClick: e => {
      e.stopPropagation();
      onLog(l);
    }
  }, React.createElement(Icon, {
    name: 'phone',
    size: 15
  }), 'Call'), React.createElement('span', {
    className: 'm-cta m-cta-log',
    onClick: e => {
      e.stopPropagation();
      onLog(l);
    }
  }, React.createElement(Icon, {
    name: 'check',
    size: 15
  }), 'Log'))))));
}

// ---------- Lead detail ----------
function MDetail({
  lead,
  onBack,
  onLog
}) {
  return React.createElement('div', {
    className: 'm-screen'
  }, React.createElement('div', {
    className: 'm-dhead'
  }, React.createElement('button', {
    className: 'm-back',
    onClick: onBack
  }, React.createElement(Icon, {
    name: 'chevronLeft',
    size: 20
  })), React.createElement('span', {
    className: 'm-dhead-t'
  }, 'Lead'), React.createElement(Icon, {
    name: 'more',
    size: 20,
    style: {
      color: 'var(--fg-2)'
    }
  })), React.createElement('div', {
    className: 'm-dtop'
  }, React.createElement(MAvatar, {
    name: lead.name,
    size: 64
  }), React.createElement('div', {
    className: 'm-dname'
  }, lead.name), React.createElement('div', {
    className: 'm-dsub'
  }, lead.contact + ' · ' + lead.city), React.createElement(MTemp, {
    temp: lead.temp
  })), React.createElement('div', {
    className: 'm-dbest'
  }, React.createElement(Icon, {
    name: 'sun',
    size: 18,
    style: {
      color: 'var(--gold-600)'
    }
  }), React.createElement('div', null, React.createElement('div', {
    className: 'm-dbest-l'
  }, 'Best time to reach'), React.createElement('div', {
    className: 'm-dbest-v'
  }, lead.best === 'Now' ? 'Now — call today' : lead.best)), React.createElement('div', {
    className: 'm-dbest-age'
  }, lead.age + 'd old')), React.createElement('div', {
    className: 'm-drow'
  }, React.createElement(Icon, {
    name: 'phone',
    size: 16,
    style: {
      color: 'var(--fg-3)'
    }
  }), lead.phone), React.createElement('div', {
    className: 'm-drow'
  }, React.createElement(Icon, {
    name: 'mapPin',
    size: 16,
    style: {
      color: 'var(--fg-3)'
    }
  }), lead.addr + ', ' + lead.city), React.createElement('div', {
    className: 'm-drow'
  }, React.createElement(Icon, {
    name: 'heart',
    size: 16,
    style: {
      color: 'var(--fg-3)'
    }
  }), lead.care), React.createElement('div', {
    className: 'm-dtl-title'
  }, 'Recent activity'), React.createElement('div', {
    className: 'm-dtl'
  }, [['Sun', 'Lead surfaced — best time mornings', '2d ago', 'sun'], ['You', 'Left voicemail', '3d ago', 'voicemail'], ['Sun', 'Lead created from referral', '5d ago', 'sun']].map((t, i) => React.createElement('div', {
    key: i,
    className: 'm-dtl-item'
  }, React.createElement('span', {
    className: 'm-dtl-dot' + (t[3] === 'sun' ? ' is-sun' : '')
  }, React.createElement(Icon, {
    name: t[3],
    size: 13
  })), React.createElement('div', null, React.createElement('div', {
    className: 'm-dtl-text'
  }, t[1]), React.createElement('div', {
    className: 'm-dtl-when'
  }, t[0] + ' · ' + t[2]))))), React.createElement('div', {
    className: 'm-dfooter'
  }, React.createElement('button', {
    className: 'm-bigbtn m-call',
    onClick: () => onLog(lead)
  }, React.createElement(Icon, {
    name: 'phone',
    size: 18
  }), 'Call ' + lead.contact.split('·')[0].trim()), React.createElement('button', {
    className: 'm-bigbtn m-log',
    onClick: () => onLog(lead)
  }, React.createElement(Icon, {
    name: 'check',
    size: 18
  }))));
}

// ---------- Log touch sheet ----------
function MLogSheet({
  lead,
  onClose,
  onSaved
}) {
  const [outcome, setOutcome] = React.useState(null);
  const outs = [['Connected', 'phone'], ['Voicemail', 'voicemail'], ['No answer', 'x'], ['Scheduled', 'calendar']];
  return React.createElement('div', {
    className: 'm-sheet-scrim',
    onClick: onClose
  }, React.createElement('div', {
    className: 'm-sheet',
    onClick: e => e.stopPropagation()
  }, React.createElement('div', {
    className: 'm-sheet-grab'
  }), React.createElement('div', {
    className: 'm-sheet-title'
  }, 'Log a touch'), React.createElement('div', {
    className: 'm-sheet-sub'
  }, 'with ' + lead.name), React.createElement('div', {
    className: 'm-outgrid'
  }, outs.map(([o, ic]) => React.createElement('button', {
    key: o,
    className: 'm-out' + (outcome === o ? ' is-sel' : ''),
    onClick: () => setOutcome(o)
  }, React.createElement(Icon, {
    name: ic,
    size: 18
  }), o))), React.createElement('textarea', {
    className: 'm-note',
    placeholder: 'Add a quick note…',
    rows: 3
  }), React.createElement('button', {
    className: 'm-save',
    disabled: !outcome,
    onClick: () => onSaved(lead)
  }, 'Save & snooze to next best time')));
}

// ---------- Tab bar ----------
function MTabs({
  tab,
  setTab
}) {
  const tabs = [['today', 'Today', 'dashboard'], ['route', 'Route', 'mapPin'], ['activity', 'Activity', 'clock'], ['me', 'Me', 'users']];
  return React.createElement('div', {
    className: 'm-tabs'
  }, tabs.map(([k, l, ic]) => React.createElement('button', {
    key: k,
    className: 'm-tab' + (tab === k ? ' is-active' : ''),
    onClick: () => setTab(k)
  }, React.createElement(Icon, {
    name: ic,
    size: 22
  }), React.createElement('span', null, l))));
}

// ---------- App ----------
function MApp() {
  const [lead, setLead] = React.useState(null);
  const [sheet, setSheet] = React.useState(null);
  const [tab, setTab] = React.useState('today');
  const [toast, setToast] = React.useState(null);
  const saved = l => {
    setSheet(null);
    setLead(null);
    setToast('Touch logged — ' + l.name.split(' ')[0] + ' snoozed to next best time.');
    setTimeout(() => setToast(null), 2600);
  };
  return React.createElement('div', {
    className: 'm-app'
  }, React.createElement('div', {
    className: 'm-body'
  }, lead ? React.createElement(MDetail, {
    lead,
    onBack: () => setLead(null),
    onLog: l => setSheet(l)
  }) : React.createElement(MToday, {
    onOpen: setLead,
    onLog: l => setSheet(l)
  })), !lead && React.createElement(MTabs, {
    tab,
    setTab
  }), sheet && React.createElement(MLogSheet, {
    lead: sheet,
    onClose: () => setSheet(null),
    onSaved: saved
  }), toast && React.createElement('div', {
    className: 'm-toast'
  }, React.createElement(Icon, {
    name: 'check',
    size: 15
  }), toast));
}
Object.assign(window, {
  MApp
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile-app/screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/ContactRecord.jsx
try { (() => {
// ContactRecord.jsx — lead detail drawer with touch timeline.
function ContactRecord({
  lead,
  onClose,
  onToast
}) {
  const [note, setNote] = React.useState('');
  if (!lead) return null;
  const addNote = () => {
    if (!note.trim()) return;
    onToast && onToast('Touch logged.');
    setNote('');
  };
  const TLicon = {
    call: 'phone',
    email: 'mail',
    system: 'sun',
    voicemail: 'voicemail'
  };
  return React.createElement('div', {
    className: 'sa-drawer-scrim',
    onClick: onClose
  }, React.createElement('div', {
    className: 'sa-drawer',
    onClick: e => e.stopPropagation()
  },
  // header
  React.createElement('div', {
    className: 'sa-drawer-head'
  }, React.createElement(Avatar, {
    name: lead.name,
    size: 48
  }), React.createElement('div', {
    style: {
      flex: 1
    }
  }, React.createElement('div', {
    className: 'sa-drawer-name'
  }, lead.name), React.createElement('div', {
    className: 'sa-drawer-id'
  }, '#' + lead.id + ' · ' + lead.contact)), React.createElement(TempBadge, {
    temp: lead.temp
  }), React.createElement(IconButton, {
    name: 'x',
    title: 'Close',
    onClick: onClose
  })),
  // best time strip
  React.createElement('div', {
    className: 'sa-drawer-best'
  }, React.createElement(Icon, {
    name: 'sun',
    size: 18,
    style: {
      color: 'var(--gold-600)'
    }
  }), React.createElement('div', null, React.createElement('span', {
    className: 'sa-drawer-best-label'
  }, 'Best time to reach: '), React.createElement('b', null, lead.bestTime)), React.createElement('div', {
    className: 'sa-drawer-age'
  }, 'Lead age ' + lead.age + 'd · ' + lead.touches + ' touches')),
  // actions
  React.createElement('div', {
    className: 'sa-drawer-actions'
  }, React.createElement(Button, {
    variant: 'primary',
    icon: 'phone'
  }, 'Call now'), React.createElement(Button, {
    variant: 'secondary',
    icon: 'mail'
  }, 'Email'), React.createElement(Button, {
    variant: 'secondary',
    icon: 'calendar'
  }, 'Schedule'), React.createElement(Button, {
    variant: 'ghost',
    icon: 'snooze'
  }, 'Snooze')), React.createElement('div', {
    className: 'sa-drawer-body'
  },
  // details grid
  React.createElement('div', {
    className: 'sa-detailgrid'
  }, [['Phone', lead.phone, 'phone'], ['Email', lead.email, 'mail'], ['Location', lead.city, 'mapPin'], ['Source', lead.source, 'arrowUpRight'], ['Care type', lead.care, 'heart'], ['Stage', lead.stage, 'columns']].map(([k, v, ic]) => React.createElement('div', {
    key: k,
    className: 'sa-detail'
  }, React.createElement('div', {
    className: 'sa-detail-k'
  }, React.createElement(Icon, {
    name: ic,
    size: 13,
    style: {
      color: 'var(--fg-3)'
    }
  }), k), React.createElement('div', {
    className: 'sa-detail-v'
  }, v)))),
  // add touch
  React.createElement('div', {
    className: 'sa-addtouch'
  }, React.createElement('input', {
    className: 'sa-addtouch-in',
    placeholder: 'Log a touch — what happened on this call?',
    value: note,
    onChange: e => setNote(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter') addNote();
    }
  }), React.createElement(Button, {
    variant: 'primary',
    size: 'sm',
    onClick: addNote
  }, 'Log')),
  // timeline
  React.createElement('div', {
    className: 'sa-tl-title'
  }, 'Activity'), React.createElement('div', {
    className: 'sa-timeline'
  }, TIMELINE.map(t => React.createElement('div', {
    key: t.id,
    className: 'sa-tl-item'
  }, React.createElement('div', {
    className: 'sa-tl-dot' + (t.type === 'system' ? ' is-system' : '')
  }, React.createElement(Icon, {
    name: TLicon[t.type] || 'message',
    size: 14
  })), React.createElement('div', {
    className: 'sa-tl-body'
  }, React.createElement('div', {
    className: 'sa-tl-meta'
  }, React.createElement('b', null, t.who), t.outcome && React.createElement('span', {
    className: 'sa-tl-outcome'
  }, t.outcome), React.createElement('span', {
    className: 'sa-tl-when'
  }, t.when)), React.createElement('div', {
    className: 'sa-tl-text'
  }, t.text))))))));
}
Object.assign(window, {
  ContactRecord
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/ContactRecord.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/Dashboard.jsx
try { (() => {
// Dashboard.jsx — coordinator overview.
function Dashboard({
  onGoSequence,
  onOpen,
  onToast
}) {
  const queue = sequenceQueue().filter(l => l.stage !== 'Placed' && l.stage !== 'Lost').slice(0, 4);
  return React.createElement('div', {
    className: 'sa-page'
  }, React.createElement('div', {
    className: 'sa-statgrid'
  }, React.createElement(StatCard, {
    icon: 'inbox',
    label: 'New leads today',
    value: '12',
    delta: '+3',
    deltaUp: true,
    accent: 'var(--brand)'
  }), React.createElement(StatCard, {
    icon: 'zap',
    label: 'Due for follow-up',
    value: '8',
    accent: 'var(--gold-500)'
  }), React.createElement(StatCard, {
    icon: 'heart',
    label: 'Placed this month',
    value: '14',
    delta: '+18%',
    deltaUp: true,
    accent: 'var(--green-500)'
  }), React.createElement(StatCard, {
    icon: 'clock',
    label: 'Avg. response time',
    value: '2.4h',
    delta: '-22%',
    deltaUp: true,
    accent: 'var(--violet-500)'
  })), React.createElement('div', {
    className: 'sa-dashgrid'
  }, React.createElement('div', {
    className: 'sa-card'
  }, React.createElement('div', {
    className: 'sa-card-head'
  }, React.createElement('div', {
    className: 'sa-card-title'
  }, React.createElement(Icon, {
    name: 'sun',
    size: 18,
    style: {
      color: 'var(--gold-600)'
    }
  }), "Today's focus"), React.createElement(Button, {
    variant: 'ghost',
    iconRight: 'chevronRight',
    size: 'sm',
    onClick: onGoSequence
  }, 'Open Sequence')), React.createElement('div', {
    className: 'sa-focuslist'
  }, queue.map(l => React.createElement('div', {
    key: l.id,
    className: 'sa-focusitem',
    onClick: () => onOpen(l)
  }, React.createElement(Avatar, {
    name: l.name,
    size: 34
  }), React.createElement('div', {
    className: 'sa-focusitem-main'
  }, React.createElement('div', {
    className: 'sa-focusitem-name'
  }, l.name), React.createElement('div', {
    className: 'sa-focusitem-sub'
  }, l.next)), React.createElement('div', {
    className: 'sa-focusitem-best'
  }, l.bestTime), React.createElement(TempBadge, {
    temp: l.temp,
    size: 'sm'
  }))))), React.createElement('div', {
    className: 'sa-card'
  }, React.createElement('div', {
    className: 'sa-card-head'
  }, React.createElement('div', {
    className: 'sa-card-title'
  }, React.createElement(Icon, {
    name: 'columns',
    size: 18,
    style: {
      color: 'var(--brand)'
    }
  }), 'Pipeline this week')), React.createElement('div', {
    className: 'sa-funnel'
  }, [['New', 12, 'var(--blue-400)'], ['Contacted', 9, 'var(--violet-400)'], ['Assessment', 6, 'var(--gold-400)'], ['Proposal', 4, 'var(--gold-500)'], ['Placed', 3, 'var(--green-500)']].map(([s, n, c], i) => React.createElement('div', {
    key: s,
    className: 'sa-funnel-row'
  }, React.createElement('span', {
    className: 'sa-funnel-label'
  }, s), React.createElement('div', {
    className: 'sa-funnel-track'
  }, React.createElement('div', {
    className: 'sa-funnel-bar',
    style: {
      width: n / 12 * 100 + '%',
      background: c
    }
  })), React.createElement('span', {
    className: 'sa-funnel-num'
  }, n)))), React.createElement('div', {
    className: 'sa-sourcerow'
  }, React.createElement('div', {
    className: 'sa-source-title'
  }, 'Top referral sources'), ['Hospital discharge', 'Physician referral', 'Website'].map((s, i) => React.createElement('div', {
    key: s,
    className: 'sa-source-item'
  }, React.createElement('span', {
    className: 'sa-source-dot',
    style: {
      background: ['var(--blue-500)', 'var(--gold-500)', 'var(--green-500)'][i]
    }
  }), React.createElement('span', {
    className: 'sa-source-name'
  }, s), React.createElement('span', {
    className: 'sa-source-pct'
  }, ['42%', '28%', '19%'][i])))))));
}
Object.assign(window, {
  Dashboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/Pipeline.jsx
try { (() => {
// Pipeline.jsx — kanban board by stage.
function Pipeline({
  onOpen
}) {
  const cols = ['New', 'Contacted', 'Assessment', 'Proposal', 'Placed'];
  const byStage = s => LEADS.filter(l => l.stage === s);
  // add a couple placed for the last column
  const placed = [{
    id: 'SOL-4501',
    name: 'Frances Lowe',
    care: 'Companion care',
    temp: 'warm',
    value: '$3,200/mo'
  }, {
    id: 'SOL-4488',
    name: 'George Adler',
    care: 'Personal care',
    temp: 'cool',
    value: '$5,800/mo'
  }];
  return React.createElement('div', {
    className: 'sa-page sa-page-board'
  }, React.createElement('div', {
    className: 'sa-board'
  }, cols.map(stage => {
    const items = stage === 'Placed' ? placed : byStage(stage);
    const c = STAGE_COLOR[stage];
    return React.createElement('div', {
      key: stage,
      className: 'sa-col'
    }, React.createElement('div', {
      className: 'sa-col-head'
    }, React.createElement('span', {
      className: 'sa-col-dot',
      style: {
        background: c.fg
      }
    }), React.createElement('span', {
      className: 'sa-col-name'
    }, stage), React.createElement('span', {
      className: 'sa-col-count'
    }, items.length)), React.createElement('div', {
      className: 'sa-col-body'
    }, items.map(l => React.createElement('div', {
      key: l.id,
      className: 'sa-kcard',
      onClick: () => onOpen(l)
    }, React.createElement('div', {
      className: 'sa-kcard-top'
    }, React.createElement(Avatar, {
      name: l.name,
      size: 30
    }), React.createElement('div', {
      className: 'sa-kcard-name'
    }, l.name), React.createElement(TempBadge, {
      temp: l.temp,
      size: 'sm'
    })), React.createElement('div', {
      className: 'sa-kcard-care'
    }, l.care), stage === 'Placed' ? React.createElement('div', {
      className: 'sa-kcard-foot'
    }, React.createElement(Icon, {
      name: 'heart',
      size: 13,
      style: {
        color: 'var(--green-500)'
      }
    }), React.createElement('span', {
      className: 'sa-kcard-val'
    }, l.value)) : React.createElement('div', {
      className: 'sa-kcard-foot'
    }, React.createElement(Icon, {
      name: 'clock',
      size: 13,
      style: {
        color: 'var(--fg-3)'
      }
    }), React.createElement('span', {
      className: 'sa-kcard-best'
    }, l.bestTime), l.overdue && React.createElement('span', {
      className: 'sa-overdue'
    }, 'Overdue')))), React.createElement('button', {
      className: 'sa-col-add'
    }, React.createElement(Icon, {
      name: 'plus',
      size: 15
    }), 'Add lead')));
  })));
}
Object.assign(window, {
  Pipeline
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/Pipeline.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/SequenceQueue.jsx
try { (() => {
// SequenceQueue.jsx — the signature Sequence Engine view.
// Leads surfaced by best follow-up time vs. lead age.
function SequenceQueue({
  onOpen,
  onToast
}) {
  const [done, setDone] = React.useState({});
  const queue = sequenceQueue().filter(l => !done[l.id] && l.stage !== 'Placed' && l.stage !== 'Lost');
  const focus = queue[0];
  const rest = queue.slice(1);
  const logTouch = (lead, e) => {
    e && e.stopPropagation();
    setDone(d => ({
      ...d,
      [lead.id]: true
    }));
    onToast && onToast(`Touch logged for ${lead.name.split(' ')[0]} — nudged to next best time.`);
  };
  return React.createElement('div', {
    className: 'sa-page'
  },
  // Sequence banner
  React.createElement('div', {
    className: 'sa-seqbanner'
  }, React.createElement('div', {
    className: 'sa-seqbanner-icon'
  }, React.createElement(Icon, {
    name: 'sun',
    size: 22
  })), React.createElement('div', {
    style: {
      flex: 1
    }
  }, React.createElement('div', {
    className: 'sa-seqbanner-title'
  }, `${queue.length} leads ready for a touch`), React.createElement('div', {
    className: 'sa-seqbanner-sub'
  }, 'Solura ordered your queue by the best time to reach each family today.')), React.createElement(Button, {
    variant: 'accent',
    icon: 'zap'
  }, 'Auto-dial queue')), focus && React.createElement('div', {
    className: 'sa-focuscard',
    onClick: () => onOpen(focus)
  }, React.createElement('div', {
    className: 'sa-focus-left'
  }, React.createElement('div', {
    className: 'sa-focus-eyebrow'
  }, React.createElement(Icon, {
    name: 'sparkles',
    size: 13
  }), 'Up next'), React.createElement('div', {
    className: 'sa-focus-head'
  }, React.createElement(Avatar, {
    name: focus.name,
    size: 52
  }), React.createElement('div', null, React.createElement('div', {
    className: 'sa-focus-name'
  }, focus.name), React.createElement('div', {
    className: 'sa-focus-meta'
  }, `${focus.contact} · ${focus.city}`)), React.createElement(TempBadge, {
    temp: focus.temp
  })), React.createElement('div', {
    className: 'sa-focus-care'
  }, focus.care)), React.createElement('div', {
    className: 'sa-focus-right'
  }, React.createElement('div', {
    className: 'sa-bestwin'
  }, React.createElement(Icon, {
    name: 'sun',
    size: 16,
    style: {
      color: 'var(--gold-600)'
    }
  }), React.createElement('div', null, React.createElement('div', {
    className: 'sa-bestwin-label'
  }, 'Best time to call'), React.createElement('div', {
    className: 'sa-bestwin-val'
  }, focus.bestTime))), React.createElement('div', {
    className: 'sa-focus-actions'
  }, React.createElement(Button, {
    variant: 'primary',
    icon: 'phone',
    onClick: e => {
      e.stopPropagation();
      logTouch(focus, e);
    }
  }, 'Call now'), React.createElement(Button, {
    variant: 'secondary',
    icon: 'snooze',
    onClick: e => {
      e.stopPropagation();
      logTouch(focus, e);
    }
  }, 'Snooze')))), React.createElement('div', {
    className: 'sa-queuehead'
  }, React.createElement('span', null, 'Queue'), React.createElement('span', {
    className: 'sa-queuehead-count'
  }, rest.length + ' more')), React.createElement('div', {
    className: 'sa-queue'
  }, rest.map(l => React.createElement('div', {
    key: l.id,
    className: 'sa-qrow',
    onClick: () => onOpen(l)
  }, React.createElement(Avatar, {
    name: l.name,
    size: 38
  }), React.createElement('div', {
    className: 'sa-qrow-main'
  }, React.createElement('div', {
    className: 'sa-qrow-name'
  }, l.name, l.overdue && React.createElement('span', {
    className: 'sa-overdue'
  }, 'Overdue')), React.createElement('div', {
    className: 'sa-qrow-sub'
  }, `${l.contact} · ${l.care}`)), React.createElement('div', {
    className: 'sa-qrow-best'
  }, React.createElement(Icon, {
    name: 'clock',
    size: 13,
    style: {
      color: 'var(--fg-3)'
    }
  }), l.bestTime), React.createElement(TempBadge, {
    temp: l.temp,
    size: 'sm'
  }), React.createElement('div', {
    className: 'sa-qrow-age'
  }, `${l.age}d`), React.createElement('div', {
    className: 'sa-qrow-actions'
  }, React.createElement(IconButton, {
    name: 'phone',
    title: 'Call',
    onClick: e => logTouch(l, e)
  }), React.createElement(IconButton, {
    name: 'check',
    title: 'Log touch',
    onClick: e => logTouch(l, e)
  })))), rest.length === 0 && React.createElement('div', {
    className: 'sa-empty'
  }, React.createElement(Icon, {
    name: 'heart',
    size: 30,
    style: {
      color: 'var(--green-400)'
    }
  }), React.createElement('div', {
    className: 'sa-empty-title'
  }, "You're all caught up. Nice work."), React.createElement('div', {
    className: 'sa-empty-sub'
  }, 'Solura will surface the next leads as they reach their best follow-up time.'))));
}
Object.assign(window, {
  SequenceQueue
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/SequenceQueue.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/Sidebar.jsx
try { (() => {
// Sidebar.jsx — left navigation for the Solura web app.
function Sidebar({
  view,
  setView,
  queueCount
}) {
  const nav = [{
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard'
  }, {
    key: 'sequence',
    label: 'Sequence',
    icon: 'zap',
    badge: queueCount
  }, {
    key: 'pipeline',
    label: 'Pipeline',
    icon: 'columns'
  }, {
    key: 'contacts',
    label: 'Contacts',
    icon: 'users'
  }, {
    key: 'reports',
    label: 'Reports',
    icon: 'chart'
  }];
  return React.createElement('aside', {
    className: 'sa-sidebar'
  }, React.createElement('div', {
    className: 'sa-brand'
  }, React.createElement('img', {
    src: '../../assets/logo-mark.png',
    alt: 'Solura',
    className: 'sa-brand-mark'
  }), React.createElement('div', null, React.createElement('div', {
    className: 'sa-brand-name'
  }, 'Solura'), React.createElement('div', {
    className: 'sa-brand-sub'
  }, 'Home Care'))), React.createElement('nav', {
    className: 'sa-nav'
  }, nav.map(n => React.createElement('button', {
    key: n.key,
    className: 'sa-navitem' + (view === n.key ? ' is-active' : ''),
    onClick: () => setView(n.key)
  }, React.createElement(Icon, {
    name: n.icon,
    size: 19
  }), React.createElement('span', null, n.label), n.badge ? React.createElement('span', {
    className: 'sa-nav-badge'
  }, n.badge) : null))), React.createElement('div', {
    className: 'sa-sidefoot'
  }, React.createElement('button', {
    className: 'sa-navitem'
  }, React.createElement(Icon, {
    name: 'settings',
    size: 19
  }), React.createElement('span', null, 'Settings')), React.createElement('div', {
    className: 'sa-user'
  }, React.createElement(Avatar, {
    name: 'Priya Nair',
    size: 34
  }), React.createElement('div', {
    className: 'sa-user-meta'
  }, React.createElement('div', {
    className: 'sa-user-name'
  }, 'Priya Nair'), React.createElement('div', {
    className: 'sa-user-role'
  }, 'Care coordinator')), React.createElement(Icon, {
    name: 'chevronDown',
    size: 16,
    style: {
      color: 'var(--fg-3)'
    }
  }))));
}
Object.assign(window, {
  Sidebar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/Sidebar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/TopBar.jsx
try { (() => {
// TopBar.jsx — top bar with title, search, add lead, notifications.
function TopBar({
  title,
  subtitle,
  onAdd
}) {
  return React.createElement('header', {
    className: 'sa-topbar'
  }, React.createElement('div', null, React.createElement('h1', {
    className: 'sa-topbar-title'
  }, title), subtitle && React.createElement('div', {
    className: 'sa-topbar-sub'
  }, subtitle)), React.createElement('div', {
    className: 'sa-topbar-actions'
  }, React.createElement('div', {
    className: 'sa-search'
  }, React.createElement(Icon, {
    name: 'search',
    size: 17,
    style: {
      color: 'var(--fg-3)'
    }
  }), React.createElement('input', {
    placeholder: 'Search leads, contacts…'
  })), React.createElement(IconButton, {
    name: 'bell',
    title: 'Notifications'
  }), React.createElement(Button, {
    variant: 'primary',
    icon: 'plus',
    onClick: onAdd
  }, 'Add lead')));
}
Object.assign(window, {
  TopBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/TopBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/app.jsx
try { (() => {
// app.jsx — main Solura web-app demo.
function App() {
  const [view, setView] = React.useState('sequence');
  const [open, setOpen] = React.useState(null); // lead in drawer
  const [toast, setToast] = React.useState(null);
  const toastTimer = React.useRef(null);
  const showToast = msg => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };
  const titles = {
    dashboard: ['Good afternoon, Priya', 'You have 8 leads ready for a follow-up today.'],
    sequence: ['Sequence', 'Your queue, ordered by the best time to reach each family.'],
    pipeline: ['Pipeline', 'Drag leads through stages as they progress.'],
    contacts: ['Contacts', 'Everyone in your book of business.'],
    reports: ['Reports', 'How your team is converting leads into placements.']
  };
  const [t, sub] = titles[view] || ['', ''];
  let body;
  if (view === 'dashboard') body = React.createElement(Dashboard, {
    onGoSequence: () => setView('sequence'),
    onOpen: setOpen,
    onToast: showToast
  });else if (view === 'sequence') body = React.createElement(SequenceQueue, {
    onOpen: setOpen,
    onToast: showToast
  });else if (view === 'pipeline') body = React.createElement(Pipeline, {
    onOpen: setOpen
  });else if (view === 'contacts') body = React.createElement(ContactsView, {
    onOpen: setOpen
  });else body = React.createElement(ReportsView, null);
  return React.createElement('div', {
    className: 'sa-app'
  }, React.createElement(Sidebar, {
    view,
    setView,
    queueCount: 8
  }), React.createElement('main', {
    className: 'sa-main'
  }, React.createElement(TopBar, {
    title: t,
    subtitle: sub,
    onAdd: () => showToast('New lead form would open here.')
  }), React.createElement('div', {
    className: 'sa-scroll'
  }, body)), open && React.createElement(ContactRecord, {
    lead: open,
    onClose: () => setOpen(null),
    onToast: showToast
  }), toast && React.createElement('div', {
    className: 'sa-toast'
  }, React.createElement(Icon, {
    name: 'check',
    size: 16
  }), toast));
}

// Simple contacts table view
function ContactsView({
  onOpen
}) {
  return React.createElement('div', {
    className: 'sa-page'
  }, React.createElement('div', {
    className: 'sa-table'
  }, React.createElement('div', {
    className: 'sa-tr sa-th'
  }, React.createElement('span', null, 'Name'), React.createElement('span', null, 'Care type'), React.createElement('span', null, 'Source'), React.createElement('span', null, 'Stage'), React.createElement('span', null, 'Temp'), React.createElement('span', {
    style: {
      textAlign: 'right'
    }
  }, 'Age')), LEADS.map(l => React.createElement('div', {
    key: l.id,
    className: 'sa-tr',
    onClick: () => onOpen(l)
  }, React.createElement('span', {
    className: 'sa-td-name'
  }, React.createElement(Avatar, {
    name: l.name,
    size: 32
  }), React.createElement('span', null, React.createElement('div', {
    className: 'sa-td-nm'
  }, l.name), React.createElement('div', {
    className: 'sa-td-sub'
  }, l.contact))), React.createElement('span', {
    className: 'sa-td-muted'
  }, l.care), React.createElement('span', {
    className: 'sa-td-muted'
  }, l.source), React.createElement('span', null, React.createElement(StageBadge, {
    stage: l.stage
  })), React.createElement('span', null, React.createElement(TempBadge, {
    temp: l.temp,
    size: 'sm'
  })), React.createElement('span', {
    className: 'sa-td-age'
  }, l.age + 'd')))));
}

// Simple reports view
function ReportsView() {
  const bars = [['Mon', 8], ['Tue', 12], ['Wed', 9], ['Thu', 15], ['Fri', 11], ['Sat', 5], ['Sun', 3]];
  const max = 15;
  return React.createElement('div', {
    className: 'sa-page'
  }, React.createElement('div', {
    className: 'sa-statgrid'
  }, React.createElement(StatCard, {
    icon: 'inbox',
    label: 'Leads this month',
    value: '186',
    delta: '+12%',
    deltaUp: true,
    accent: 'var(--brand)'
  }), React.createElement(StatCard, {
    icon: 'heart',
    label: 'Placement rate',
    value: '31%',
    delta: '+4pt',
    deltaUp: true,
    accent: 'var(--green-500)'
  }), React.createElement(StatCard, {
    icon: 'zap',
    label: 'Avg. touches to place',
    value: '6.2',
    accent: 'var(--gold-500)'
  }), React.createElement(StatCard, {
    icon: 'clock',
    label: 'Avg. lead age at place',
    value: '9d',
    delta: '-2d',
    deltaUp: true,
    accent: 'var(--violet-500)'
  })), React.createElement('div', {
    className: 'sa-card'
  }, React.createElement('div', {
    className: 'sa-card-head'
  }, React.createElement('div', {
    className: 'sa-card-title'
  }, React.createElement(Icon, {
    name: 'chart',
    size: 18,
    style: {
      color: 'var(--brand)'
    }
  }), 'Touches logged this week')), React.createElement('div', {
    className: 'sa-barchart'
  }, bars.map(([d, n]) => React.createElement('div', {
    key: d,
    className: 'sa-bc-col'
  }, React.createElement('div', {
    className: 'sa-bc-track'
  }, React.createElement('div', {
    className: 'sa-bc-bar',
    style: {
      height: n / max * 100 + '%'
    }
  })), React.createElement('div', {
    className: 'sa-bc-label'
  }, d))))));
}
Object.assign(window, {
  ContactsView,
  ReportsView
});
Object.assign(window, {
  App
});
const __solRoot = document.getElementById('sol-webapp-root');
if (__solRoot) ReactDOM.createRoot(__solRoot).render(React.createElement(App));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/data.jsx
try { (() => {
// data.jsx — shared fake data + helpers for the Solura web-app kit.

const TEMP = {
  hot: {
    key: 'hot',
    label: 'Hot',
    bg: 'var(--temp-hot-bg)',
    fg: 'var(--red-700)',
    dot: 'var(--temp-hot)'
  },
  warm: {
    key: 'warm',
    label: 'Warm',
    bg: 'var(--temp-warm-bg)',
    fg: 'var(--gold-700)',
    dot: 'var(--temp-warm)'
  },
  cool: {
    key: 'cool',
    label: 'Cool',
    bg: 'var(--temp-cool-bg)',
    fg: 'var(--blue-700)',
    dot: 'var(--temp-cool)'
  },
  cold: {
    key: 'cold',
    label: 'Cold',
    bg: 'var(--temp-cold-bg)',
    fg: 'var(--neutral-600)',
    dot: 'var(--temp-cold)'
  }
};
const STAGES = ['New', 'Contacted', 'Assessment', 'Proposal', 'Placed', 'Lost'];
const STAGE_COLOR = {
  New: {
    bg: 'var(--brand-subtle)',
    fg: 'var(--brand-subtle-fg)'
  },
  Contacted: {
    bg: 'var(--violet-50)',
    fg: 'var(--violet-700)'
  },
  Assessment: {
    bg: 'var(--warning-subtle)',
    fg: 'var(--warning-subtle-fg)'
  },
  Proposal: {
    bg: 'var(--accent-subtle)',
    fg: 'var(--accent-subtle-fg)'
  },
  Placed: {
    bg: 'var(--success-subtle)',
    fg: 'var(--success-subtle-fg)'
  },
  Lost: {
    bg: 'var(--danger-subtle)',
    fg: 'var(--danger-subtle-fg)'
  }
};
const AVATAR_COLORS = ['var(--blue-500)', 'var(--gold-500)', 'var(--green-500)', 'var(--violet-500)', 'var(--red-400)', 'var(--blue-700)'];
function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
function avatarColor(name) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}
const LEADS = [{
  id: 'SOL-4821',
  name: 'Margaret Alvarez',
  contact: 'Daughter · Sofia',
  phone: '(206) 555-0142',
  email: 'sofia.alvarez@email.com',
  source: 'Hospital discharge',
  stage: 'Contacted',
  temp: 'warm',
  age: 5,
  bestTime: 'Today, 4–6pm',
  city: 'Seattle, WA',
  care: 'Companion care · 20 hrs/wk',
  next: 'Call to schedule assessment',
  touches: 4,
  overdue: false
}, {
  id: 'SOL-4830',
  name: 'Harold & Jean Park',
  contact: 'Son · David',
  phone: '(206) 555-0198',
  email: 'dpark@email.com',
  source: 'Website inquiry',
  stage: 'New',
  temp: 'hot',
  age: 1,
  bestTime: 'Today, ASAP',
  city: 'Bellevue, WA',
  care: 'Personal care · live-in',
  next: 'First contact call',
  touches: 0,
  overdue: false
}, {
  id: 'SOL-4799',
  name: 'Eleanor Whitfield',
  contact: 'Self',
  phone: '(425) 555-0067',
  email: 'eleanor.w@email.com',
  source: 'Referral · Dr. Nguyen',
  stage: 'Assessment',
  temp: 'warm',
  age: 6,
  bestTime: 'Tomorrow, 10am',
  city: 'Kirkland, WA',
  care: 'Dementia care · 40 hrs/wk',
  next: 'Confirm in-home assessment',
  touches: 6,
  overdue: false
}, {
  id: 'SOL-4756',
  name: 'Robert Tanaka',
  contact: 'Wife · Susan',
  phone: '(206) 555-0233',
  email: 'susan.tanaka@email.com',
  source: 'Facebook ad',
  stage: 'Contacted',
  temp: 'cool',
  age: 13,
  bestTime: 'Thu, 2–4pm',
  city: 'Renton, WA',
  care: 'Respite care',
  next: 'Send service brochure',
  touches: 3,
  overdue: true
}, {
  id: 'SOL-4711',
  name: 'Dorothy Klein',
  contact: 'Niece · Rachel',
  phone: '(253) 555-0411',
  email: 'rachel.k@email.com',
  source: 'Senior center',
  stage: 'Proposal',
  temp: 'warm',
  age: 7,
  bestTime: 'Today, 5pm',
  city: 'Tacoma, WA',
  care: 'Personal care · 30 hrs/wk',
  next: 'Follow up on proposal',
  touches: 8,
  overdue: false
}, {
  id: 'SOL-4688',
  name: 'James McGrath',
  contact: 'Self',
  phone: '(360) 555-0529',
  email: 'jmcgrath@email.com',
  source: 'Hospital discharge',
  stage: 'Contacted',
  temp: 'hot',
  age: 2,
  bestTime: 'Today, 3pm',
  city: 'Olympia, WA',
  care: 'Post-surgery care',
  next: 'Discuss start date',
  touches: 1,
  overdue: false
}, {
  id: 'SOL-4602',
  name: 'Beatrice Coleman',
  contact: 'Son · Marcus',
  phone: '(206) 555-0744',
  email: 'marcus.c@email.com',
  source: 'Referral · former client',
  stage: 'Contacted',
  temp: 'cold',
  age: 28,
  bestTime: 'Next week',
  city: 'Shoreline, WA',
  care: 'Companion care',
  next: 'Re-engage check-in',
  touches: 5,
  overdue: false
}, {
  id: 'SOL-4590',
  name: 'Walter Brennan',
  contact: 'Daughter · Anne',
  phone: '(425) 555-0810',
  email: 'anne.b@email.com',
  source: 'Website inquiry',
  stage: 'New',
  temp: 'hot',
  age: 0,
  bestTime: 'Today, ASAP',
  city: 'Redmond, WA',
  care: 'Mobility assistance',
  next: 'First contact call',
  touches: 0,
  overdue: false
}];

// Sequence Engine: ordered by urgency (best follow-up time vs. age).
const TEMP_RANK = {
  hot: 0,
  warm: 1,
  cool: 2,
  cold: 3
};
function sequenceQueue() {
  return [...LEADS].sort((a, b) => {
    if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
    return TEMP_RANK[a.temp] - TEMP_RANK[b.temp] || a.age - b.age;
  });
}
const TIMELINE = [{
  id: 1,
  type: 'call',
  who: 'You',
  when: 'Yesterday, 3:12pm',
  text: 'Spoke with Sofia. Mom needs help mornings. Open to 20 hrs/wk. Sending info.',
  outcome: 'Connected'
}, {
  id: 2,
  type: 'email',
  who: 'You',
  when: 'Yesterday, 3:40pm',
  text: 'Sent service overview + pricing for companion care.',
  outcome: 'Sent'
}, {
  id: 3,
  type: 'system',
  who: 'Solura',
  when: '2 days ago, 9:00am',
  text: 'Sequence Engine surfaced this lead — best time to call: afternoons.',
  outcome: ''
}, {
  id: 4,
  type: 'call',
  who: 'You',
  when: '3 days ago, 11:05am',
  text: 'Left voicemail with intro and callback number.',
  outcome: 'Voicemail'
}, {
  id: 5,
  type: 'system',
  who: 'Solura',
  when: '5 days ago, 8:30am',
  text: 'Lead created from hospital discharge referral.',
  outcome: 'New lead'
}];
Object.assign(window, {
  TEMP,
  STAGES,
  STAGE_COLOR,
  LEADS,
  TIMELINE,
  sequenceQueue,
  initials,
  avatarColor
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/icons.jsx
try { (() => {
// icons.jsx — Lucide icon paths rendered as inline SVG (self-contained, no CDN).
// Stroke style: 2px rounded, currentColor. Matches the documented Lucide system.
const ICON_PATHS = {
  dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  columns: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18M15 3v18"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  mapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  sparkles: '<path d="M9.94 14.34A2 2 0 0 0 8.6 13l-5.92-1.96a.5.5 0 0 1 0-.95L8.6 8.13a2 2 0 0 0 1.34-1.34l1.96-5.92a.5.5 0 0 1 .95 0l1.96 5.92a2 2 0 0 0 1.34 1.34l5.92 1.96a.5.5 0 0 1 0 .95L17.4 13a2 2 0 0 0-1.34 1.34l-1.96 5.92a.5.5 0 0 1-.95 0z"/><path d="M19 3v4M21 5h-4"/>',
  trending: '<path d="M22 7 13.5 15.5l-5-5L2 17"/><path d="M16 7h6v6"/>',
  building: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  star: '<path d="M11.5 2.5 14 8l6 .5-4.5 4 1.5 6-5.5-3.5L6.5 18.5 8 12.5 3.5 8.5 9.5 8z"/>',
  arrowUpRight: '<path d="M7 7h10v10M7 17 17 7"/>',
  snooze: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/><path d="M3 3l3 2"/>',
  voicemail: '<circle cx="6" cy="12" r="4"/><circle cx="18" cy="12" r="4"/><path d="M6 16h12"/>',
  userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/>'
};
function Icon({
  name,
  size = 20,
  stroke = 2,
  className = '',
  style = {}
}) {
  return React.createElement('svg', {
    className,
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style,
    dangerouslySetInnerHTML: {
      __html: ICON_PATHS[name] || ''
    }
  });
}
Object.assign(window, {
  Icon,
  ICON_PATHS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/ui.jsx
try { (() => {
// ui.jsx — shared UI primitives for the Solura web-app kit.
// Components reference CSS classes defined in index.html (.sa-*).

function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  children,
  onClick,
  style = {},
  title
}) {
  const cls = `sa-btn sa-btn-${variant} sa-btn-${size}`;
  return React.createElement('button', {
    className: cls,
    onClick,
    style,
    title
  }, icon && React.createElement(Icon, {
    name: icon,
    size: size === 'sm' ? 15 : 16
  }), children && React.createElement('span', null, children), iconRight && React.createElement(Icon, {
    name: iconRight,
    size: 16
  }));
}
function IconButton({
  name,
  onClick,
  title,
  active,
  style = {}
}) {
  return React.createElement('button', {
    className: 'sa-iconbtn' + (active ? ' is-active' : ''),
    onClick,
    title,
    style
  }, React.createElement(Icon, {
    name,
    size: 18
  }));
}
function TempBadge({
  temp,
  size = 'md'
}) {
  const t = TEMP[temp];
  return React.createElement('span', {
    className: 'sa-temp',
    style: {
      background: t.bg,
      color: t.fg,
      fontSize: size === 'sm' ? 11 : 12
    }
  }, React.createElement('span', {
    className: 'sa-temp-dot',
    style: {
      background: t.dot
    }
  }), t.label);
}
function StageBadge({
  stage
}) {
  const c = STAGE_COLOR[stage];
  return React.createElement('span', {
    className: 'sa-stage',
    style: {
      background: c.bg,
      color: c.fg
    }
  }, stage);
}
function Avatar({
  name,
  size = 40
}) {
  return React.createElement('span', {
    className: 'sa-avatar',
    style: {
      width: size,
      height: size,
      background: avatarColor(name),
      fontSize: size * 0.34
    }
  }, initials(name));
}
function AvatarStack({
  names,
  max = 4,
  size = 32
}) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return React.createElement('div', {
    className: 'sa-avstack'
  }, shown.map((n, i) => React.createElement('span', {
    key: i,
    className: 'sa-avatar',
    style: {
      width: size,
      height: size,
      background: avatarColor(n),
      fontSize: size * 0.34,
      marginLeft: i ? -8 : 0,
      border: '2px solid var(--bg-surface)'
    }
  }, initials(n))), extra > 0 && React.createElement('span', {
    className: 'sa-avatar',
    style: {
      width: size,
      height: size,
      background: 'var(--neutral-400)',
      fontSize: size * 0.34,
      marginLeft: -8,
      border: '2px solid var(--bg-surface)'
    }
  }, '+' + extra));
}
function StatCard({
  icon,
  label,
  value,
  delta,
  deltaUp,
  accent = 'var(--brand)'
}) {
  return React.createElement('div', {
    className: 'sa-stat'
  }, React.createElement('div', {
    className: 'sa-stat-icon',
    style: {
      background: 'color-mix(in srgb,' + accent + ' 12%, white)',
      color: accent
    }
  }, React.createElement(Icon, {
    name: icon,
    size: 20
  })), React.createElement('div', null, React.createElement('div', {
    className: 'sa-stat-label'
  }, label), React.createElement('div', {
    className: 'sa-stat-row'
  }, React.createElement('span', {
    className: 'sa-stat-value'
  }, value), delta && React.createElement('span', {
    className: 'sa-stat-delta',
    style: {
      color: deltaUp ? 'var(--green-600)' : 'var(--red-600)'
    }
  }, React.createElement(Icon, {
    name: 'trending',
    size: 13
  }), delta))));
}
function Toggle({
  on,
  onChange
}) {
  return React.createElement('button', {
    className: 'sa-toggle' + (on ? ' is-on' : ''),
    onClick: () => onChange && onChange(!on),
    'aria-pressed': on
  }, React.createElement('span', {
    className: 'sa-toggle-knob'
  }));
}
Object.assign(window, {
  Button,
  IconButton,
  TempBadge,
  StageBadge,
  Avatar,
  AvatarStack,
  StatCard,
  Toggle
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/ui.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.StageBadge = __ds_scope.StageBadge;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.TempBadge = __ds_scope.TempBadge;

})();
