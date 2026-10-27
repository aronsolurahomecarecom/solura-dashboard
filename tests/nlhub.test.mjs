// 📰✍ Newsletter hub (B-1023-142): the letter is written in the WEBSITE
// composer (iframed); the dashboard mints one personal code per lead per
// send, emails the link through Resend untouched (no pixel, no click
// rewriting), and reads back who opened and who actually READ.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');

let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };

const b = html.indexOf('/* ⚡NLHUB — BEGIN');
const e = html.indexOf('/* ⚡NLHUB — END */');
if (b < 0 || e < 0) throw new Error('NLHUB markers missing');
const src = html.slice(html.indexOf('*/', b) + 2, e);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const enginesDoc = {};
const mk = new Function('escapeHtml', 'enginesDoc', 'crypto', 'leadKey', 'saveEnginesDoc',
  src + '\nreturn {NL_SITE_ORIGIN,NL_STATUS_URL,NL_STATUS_KEY,NL_HUB_KEEP,nlNewCode,nlPersonalLink,nlHubEmailHtml,nlSendsAll,nlHubStatsSummary,nlLinkForLead,nlTrackableUrl,nlCustomLinkForLead,wkVariantLinkMode,weeklyLinkHrefFor,nlReadButtonHtml};');
const N = mk(esc, enginesDoc, (await import('node:crypto')).webcrypto, (ri) => 'lead-' + ri, async () => {});

// ── codes: the spec's exact contract ──
{
  const seen = {};
  let good = true, unique = true;
  for (let i = 0; i < 200; i++) {
    const c = N.nlNewCode();
    if (!/^[a-z0-9]{12}$/.test(c)) good = false;
    if (seen[c]) unique = false;
    seen[c] = 1;
  }
  ok(good, 'codes are exactly 12 chars, a-z and 0-9 only (10-24 allowed; 12 chosen)');
  ok(unique, '200 codes, zero collisions — a NEW code every send');
  ok(N.nlPersonalLink('https://www.solurahomecare.com/newsletter/week-42', 'abc123def456') === 'https://www.solurahomecare.com/newsletter/week-42?r=abc123def456', 'personal link = edition url + ?r=code');
  ok(N.nlPersonalLink('https://x.com/n/w?v=2', 'abc123def456') === 'https://x.com/n/w?v=2&r=abc123def456', 'an edition url that already has a query gets &r=');
}

// ── the email ──
{
  const ed = { title: 'Week 42: Warm soup & old photos', description: 'A short one about small comforts.', cover_image_url: 'https://www.solurahomecare.com/img/w42.jpg' };
  const link = 'https://www.solurahomecare.com/newsletter/week-42?r=abc123def456';
  const em = N.nlHubEmailHtml(ed, 'Susan', link);
  ok(em.indexOf('Dear Susan,') > -1, 'greets by first name');
  ok(N.nlHubEmailHtml(ed, '', link).indexOf('Hello,') > -1, 'no name = a plain hello, never a blank greeting');
  ok(em.indexOf('Week 42: Warm soup &amp; old photos') > -1 && em.indexOf('A short one about small comforts.') > -1, 'title + description land, escaped');
  ok(em.indexOf('src="https://www.solurahomecare.com/img/w42.jpg"') > -1, 'cover picture rides along');
  ok(N.nlHubEmailHtml({ title: 't' }, '', link).indexOf('<img') === -1, 'no cover = no broken image tag');
  ok(em.indexOf('href="' + link + '"') > -1, 'the button carries the personal link EXACTLY (untouched, unrewritten)');
  ok(em.indexOf("Read this week's letter") > -1, 'the one button says what the spec says');
  ok(em.indexOf("This link is personal to you. Please don't forward it.") > -1, 'the personal-link footer line');
  ok(/reply with the word stop/.test(em), 'the way out is one reply (the dashboard already flags opt-out language)');
  ok(em.indexOf('815 Superior Ave E Ste 1618') > -1 && em.indexOf('License 4574HHN') > -1, 'the brand contact block closes it');
  ok(em.indexOf('—') === -1, 'no em dashes anywhere in outbound copy (brand rule)');
  const hostile = N.nlHubEmailHtml({ title: '<script>x</script>', description: '<b>y</b>' }, '<i>z</i>', link);
  ok(hostile.indexOf('<script>x</script>') === -1 && hostile.indexOf('<b>y</b>') === -1 && hostile.indexOf('<i>z</i>') === -1, 'edition fields and names are escaped');
}

// ── the funnel math: read is the real signal ──
{
  const send = { recipients: [{ code: 'a' }, { code: 'b' }, { code: 'c' }, { code: 'd' }], stats: {
    a: { read_at: '2026-10-23T10:00:00Z', seconds: 95, max_scroll: 80 },
    b: { read_at: null, seconds: 1, max_scroll: 0 },      // scanner: opened, never read
    c: { read_at: '2026-10-23T11:00:00Z', seconds: 25, max_scroll: 100 }
  } };
  const sm = N.nlHubStatsSummary(send);
  ok(sm.sent === 4 && sm.opened === 3 && sm.read === 2, '4 sent, 3 opened, 2 READ — the scanner open does not count as read');
  ok(sm.avgSeconds === 60, 'average time counts readers only');
  ok(N.nlHubStatsSummary({}).sent === 0, 'an empty send stays calm');
  ok(N.nlSendsAll() === enginesDoc.nlSends && Array.isArray(enginesDoc.nlSends), 'send history lives in the synced engines doc');
  ok(N.NL_HUB_KEEP === 30, 'history is capped');
}

// ── {link}: the per-lead fill-in, same family as {dm}/{pt} ──
{
  delete enginesDoc.config;
  ok(N.nlLinkForLead(5) === 'https://www.solurahomecare.com/newsletter', 'no edition picked = the public letters page, never a broken token');
  enginesDoc.config = { nlEdition: { slug: 'week-42', url: 'https://www.solurahomecare.com/newsletter/week-42', title: 'W42' } };
  ok(N.nlLinkForLead(null) === 'https://www.solurahomecare.com/newsletter/week-42', 'no lead in context = the edition itself, uncoded');
  const l1 = N.nlLinkForLead(5), l2 = N.nlLinkForLead(5);
  ok(/^https:\/\/www\.solurahomecare\.com\/newsletter\/week-42\?r=[a-z0-9]{12}$/.test(l1), 'with a lead: the edition url + a fresh personal code');
  ok(l1 !== l2, 'every fill mints a NEW code');
  const rec = enginesDoc.nlAdhoc['lead-5'];
  ok(Array.isArray(rec) && rec.length === 2 && rec[0].slug === 'week-42' && /^[a-z0-9]{12}$/.test(rec[0].code), 'each minted code is recorded against the lead identity');
  for (let i = 0; i < 9; i++) N.nlLinkForLead(5);
  ok(enginesDoc.nlAdhoc['lead-5'].length === 5, 'kept codes cap at the last 5 per lead');

  // The fill itself rides fillNames, next to {dm}/{pt}
  const fb = html.indexOf('/* ⚡FILLNAMES — BEGIN');
  const fe = html.indexOf('/* ⚡FILLNAMES — END */');
  const fsrc = html.slice(html.indexOf('*/', fb) + 2, fe);
  const fmk = new Function('nlLinkForLead', fsrc + '\nreturn {fillNames};');
  const F1 = fmk((ri) => 'https://www.solurahomecare.com/newsletter/week-42?r=code4lead' + ri).fillNames;
  const out1 = F1('Hi {dm}, this week\'s letter: {link} and again {{link}}.', { dm: 'Sue', pt: 'Mom', ri: 7 });
  ok(out1.indexOf('https://www.solurahomecare.com/newsletter/week-42?r=code4lead7') > -1 && out1.indexOf('{link}') === -1 && out1.indexOf('{{link}}') === -1, '{link} and {{link}} both fill with the personal link, ri passed through');
  const F0 = fmk(undefined).fillNames; // slice without the dashboard around it
  ok(F0('Read it here: {link}', { dm: 'Sue', ri: 7 }).indexOf('https://www.solurahomecare.com/newsletter') > -1, 'without the resolver the fallback page fills in — a token never ships raw');
  ok(/rel:String\(r\[C\.REL\]\|\|''\)\.trim\(\)\.toLowerCase\(\),ri:ri\}/.test(html), 'getNames carries ri so every email path has the lead in hand');
  ok(/\{link\}<\/code> \(the lead's personal link to the current newsletter edition\)/.test(html), 'the settings copy teaches the new token');
}

// ── 🔗 weekly link modes: pdf keeps SharePoint; site/custom go personal ──
{
  enginesDoc.config = { nlEdition: { slug: 'week-42', url: 'https://www.solurahomecare.com/newsletter/week-42', title: 'W42' } };
  ok(N.nlTrackableUrl('https://www.solurahomecare.com/newsletter/week-42') && N.nlTrackableUrl('https://solurahomecare.com/x'), 'our website is where read data exists');
  ok(!N.nlTrackableUrl('https://solura-my.sharepoint.com/x') && !N.nlTrackableUrl('https://example.com/a'), 'SharePoint and foreign hosts are not trackable');

  const c1 = N.nlCustomLinkForLead(9, 'https://www.solurahomecare.com/newsletter/special-edition');
  ok(/^https:\/\/www\.solurahomecare\.com\/newsletter\/special-edition\?r=[a-z0-9]{12}$/.test(c1), 'a pasted WEBSITE link gets a personal code per lead');
  ok((enginesDoc.nlAdhoc['lead-9'] || [])[0].slug === 'special-edition', 'and the code is recorded with the page it points at');
  ok(N.nlCustomLinkForLead(9, 'https://example.com/anywhere') === 'https://example.com/anywhere', 'a pasted link elsewhere is used exactly as pasted — no fake tracking');
  ok(N.nlCustomLinkForLead(9, '') === '', 'no url = no button');

  // Per-VARIANT choice, with set-level and legacy-checkbox fallbacks
  ok(N.wkVariantLinkMode({ linkMode: 'site' }, { linkMode: 'custom' }) === 'custom', "the variant's own choice wins");
  ok(N.wkVariantLinkMode({ linkMode: 'site' }, {}) === 'site', 'a variant without one inherits the set');
  ok(N.wkVariantLinkMode({ pdfAsLink: true }, {}) === 'pdf' && N.wkVariantLinkMode({}, {}) === 'none', 'the old checkbox maps to pdf; nothing set = none');

  ok(/^https:\/\/www\.solurahomecare\.com\/newsletter\/week-42\?r=[a-z0-9]{12}$/.test(N.weeklyLinkHrefFor(9, {}, { linkMode: 'site' })), "mode 'site' = this week's edition, personal per lead");
  delete enginesDoc.config;
  ok(N.weeklyLinkHrefFor(9, {}, { linkMode: 'site' }) === '', "mode 'site' with no edition picked = NO button, never a dead link");
  enginesDoc.config = { nlEdition: { slug: 'week-42', url: 'https://www.solurahomecare.com/newsletter/week-42' } };
  ok(N.weeklyLinkHrefFor(9, {}, { linkMode: 'custom', customUrl: 'https://example.com/z' }) === 'https://example.com/z', "mode 'custom' uses the variant's pasted link");
  ok(N.weeklyLinkHrefFor(9, { customUrl: 'https://example.com/set' }, { linkMode: 'custom' }) === 'https://example.com/set', 'a variant without its own url falls back to the set url');
  ok(/^https:\/\/www\.solurahomecare\.com\/newsletter\/week-42\?r=/.test(N.weeklyLinkHrefFor(9, { linkMode: 'site' }, { linkMode: 'custom', customUrl: 'https://www.solurahomecare.com/newsletter/week-42' })), 'A and B can point at DIFFERENT places in the same set');
  ok(N.weeklyLinkHrefFor(9, {}, { linkMode: 'pdf' }) === '' && N.weeklyLinkHrefFor(9, {}, {}) === '', "modes 'pdf' and 'none' leave the button to the pdf block — SharePoint path untouched");

  // Wiring: editor control, both send paths, and the untouched pdf branch
  ok(/id="wk-set-linkmode"/.test(html) && /id="wk-set-customurl"/.test(html), 'the editor has the link-mode selector + the paste-a-link field');
  ok(/THIS variant's "Read this week's letter" button/.test(html), 'the control sits with the A/B/C variant, not the set');
  ok(/if\(lm\)v\.linkMode=lm\.value\|\|'none';/.test(html) && /if\(cu\)v\.customUrl=String\(cu\.value\|\|''\)\.trim\(\);/.test(html), 'the choice saves onto the VARIANT');
  ok(/lm2\.value=wkVariantLinkMode\(set,v\);/.test(html), 'switching A/B/C tabs shows that variant\'s own choice');
  ok(/wkVariantLinkMode\(st6,vv6\)==='pdf'&&vv6\.pdf/.test(html), 'the save-time OneDrive upload keys off the per-variant mode');
  ok(/wkVariantLinkMode\(set,w\)==='pdf'&&w\.pdf\.webUrl/.test(html), 'so does the SharePoint button branch');
  ok(/siteLnk=weeklyLinkHrefFor\(ri,set,w\);/.test(html) && /nlReadButtonHtml\(siteLnk,true\)/.test(html), 'the composer apply adds the per-lead card for site/custom variants');
  ok(/typeof weeklyLinkHrefFor==='function'/.test(html) && /lkW=weeklyLinkHrefFor\(ri,setL,w\);/.test(html) && /nlReadButtonHtml\(lkW\)/.test(html), 'the automated warm-up / A-B sends pass the VARIANT and use the same card (slice-safe)');

  // The card itself: letter-like, branded, escaped, no em dashes
  const card = N.nlReadButtonHtml('https://www.solurahomecare.com/newsletter/week-42?r=abc123def456', true);
  ok(/^<div data-nllink="1"/.test(card), 'the composer card carries the dedupe mark');
  ok(!/data-nllink/.test(N.nlReadButtonHtml('https://x.com')), 'the automated card does not');
  ok(/This week's letter<\/div>/.test(card) && /A few quiet minutes of reading, written for families like yours\./.test(card), 'an eyebrow and a warm line, not a bare button');
  ok(/background:#1f3d57/.test(card) && /border-bottom:3px solid #C59B4E/.test(card) && /background:#f7f3ea/.test(card), 'brand navy button, gold underline, linen card');
  ok(card.indexOf('?r=abc123def456') > -1 && card.indexOf('—') === -1, 'the personal link lands; no em dashes in outbound copy');
  ok(N.nlReadButtonHtml('"><script>').indexOf('"><script>') === -1, 'the href is escaped');
  ok(/<a data-trkdoc="1" href="'\+escapeHtml\(w\.pdf\.webUrl\)/.test(html), 'the manual-upload SharePoint/OneDrive button works exactly as it always did');
  ok(!/nlRetireLegacyLinks/.test(html), 'the blanket legacy-link rewrite stays gone — link choice is explicit');
  ok(/wkLinkModeHint/.test(html) && /No edition picked yet/.test(html), 'the editor hint warns when site mode has no edition to point at');
}

// ── constants: the exact endpoints from the spec ──
{
  ok(N.NL_SITE_ORIGIN === 'https://www.solurahomecare.com', 'composer origin pinned');
  ok(N.NL_STATUS_URL === 'https://btmyolfxgnofrowofdnm.supabase.co/rest/v1/rpc/newsletter_status', 'status endpoint pinned');
  ok(/^sb_publishable_/.test(N.NL_STATUS_KEY), 'the key is the publishable one (safe in the browser by design)');
}

// ── wiring locks ──
{
  ok(/if\(e\.origin!==NL_SITE_ORIGIN\)return; \/\/ always check/.test(html), "the message listener trusts ONLY the website's origin");
  ok(/m\.type!=='solura:newsletter-published'&&m\.type!=='solura:newsletter-selected'/.test(html), 'both handoffs handled: fresh publish and use-for-a-send');
  ok(/enginesDoc\.config\.nlEdition=\{slug:/.test(html), 'the edition is stored in the synced config');
  ok(/id="nlcompose-frame"/.test(html) && /if\(fr&&!fr\.src\)fr\.src=NL_SITE_ORIGIN\+'\/compose'/.test(html), 'the composer iframe exists and loads only on first open');
  ok(/data-action="nlhub-compose"/.test(html) && /data-action="nlhub-send"/.test(html) && /data-action="nlhub-poll"/.test(html), 'open / send / refresh are wired');
  const sendFn = html.slice(html.indexOf('async function nlHubSend'), html.indexOf('async function nlHubPoll'));
  ok(/resendCandidates\(\)\.list/.test(sendFn), 'the audience is the SAME one the newsletter rules below define');
  ok(/var code=nlNewCode\(\);/.test(sendFn) && /nlPersonalLink\(ed\.url,code\)/.test(sendFn), 'one fresh code per recipient per send');
  ok(/resendFetch\('sendEmail'/.test(sendFn) && !/trackSystemEmail/.test(sendFn), 'sends ride Resend with NO dashboard pixel — the website measures reading');
  ok(/k:leadKey\(cd\.ri\)/.test(sendFn) && /msgId:String\(\(res&&res\.id\)\|\|''\)/.test(sendFn), 'stored per recipient: lead identity, code, Resend message id');
  ok(/outcome:'newsletter-sent'/.test(sendFn), 'each send lands in the lead comms log');
  ok(/if\(!confirm\('Send "/.test(sendFn), 'a mass send asks once, with the real count');
  const pollFn = html.slice(html.indexOf('async function nlHubPoll'), html.indexOf('function nlHubAutoPoll'));
  ok(/i\+=2000/.test(pollFn) && /p_codes:codes\.slice\(i,i\+2000\)/.test(pollFn), 'status calls chunk at 2,000 codes per the spec');
  ok(/headers:\{apikey:NL_STATUS_KEY/.test(pollFn), 'the publishable key rides as the apikey header');
  ok(/Date\.now\(\)-\(L\[0\]\.lastPoll\|\|0\)<20\*60\*1000/.test(html) && /nlHubAutoPoll\(\);\}catch\(_\)\{\} \/\/ 📰/.test(html), 'the latest send self-refreshes on the standing poll, at most every 20 minutes');
  ok(/Read is the real signal<\/b>/.test(html), 'the settings copy teaches the scanner caveat');
  ok(/opened, not read/.test(html) && /✓ read/.test(html), 'per-lead rows distinguish opened from actually read');
}

console.log('\nNewsletter hub: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
