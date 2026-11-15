// 🖼 The Read card shows a real preview (picture, title, summary) when the piece's details are known,
// labels guides as guides, and falls back to the quiet text card when nothing is known.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');
let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };
const a = html.indexOf('var NL_CARD_LABEL='), z = html.indexOf('function weeklyLinkHrefFor(');
const src = html.slice(a, z);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const enginesDoc = { config: {} };
const N = new Function('escapeHtml', 'enginesDoc', 'wkVariantLinkMode', 'NL_DOCS_BASE', 'NL_STATUS_KEY', 'nlMapEdition', 'saveEnginesDoc', 'fetch',
  src + '\nreturn {nlReadButtonHtml,weeklyLinkMetaFor,nlUrlSlug,nlCardSummary};')(
  esc, enginesDoc, (set, v) => (v && v.linkMode) || 'none', 'X', 'K', d => d, () => Promise.resolve(), () => Promise.reject(new Error('offline')));
const G = 'https://www.solurahomecare.com/letters/home-safety?r=abcdefghij12';
const plain = N.nlReadButtonHtml(G, true);
ok(plain.includes("Read this week's letter") && !plain.includes('<img') && plain.includes('data-nllink="1"'), 'no details: quiet text card, marked');
const meta = { title: 'Fall-proofing the home for an aging parent', description: 'A room by room guide.', cover_image_url: 'https://btmyolfxgnofrowofdnm.supabase.co/storage/v1/object/public/images/covers/x.jpg', kind: 'guide' };
const rich = N.nlReadButtonHtml(G, false, meta);
ok(rich.includes('<img src="' + meta.cover_image_url + '"'), 'cover picture shown');
ok(rich.includes(meta.title) && rich.includes('A room by room guide.'), 'title and summary shown');
ok(rich.includes('A guide for families') && rich.includes('Read the guide') && !rich.includes("this week's letter"), 'a guide is labeled as a guide');
ok((rich.match(/href="https:\/\/www\.solurahomecare\.com\/letters\/home-safety\?r=abcdefghij12"/g) || []).length === 3, 'picture, title and button all carry the personal link');
ok(!rich.includes('data-nllink'), 'unmarked when not asked');
const nl = N.nlReadButtonHtml('https://www.solurahomecare.com/newsletter/x?r=abcdefghij12', true, { title: 'T', description: '', cover_image_url: '' });
ok(nl.includes('Read this week&#39;s letter') && !nl.includes('<img'), 'newsletter path keeps the letter wording; no picture, no img tag');
const xss = N.nlReadButtonHtml(G, false, { title: '<b>x</b>', description: '"q"', cover_image_url: 'https://a/b.jpg" onerror="1' });
ok(!xss.includes('<b>x</b>') && !xss.includes('onerror="1'), 'details are escaped');
ok(N.nlCardSummary('word '.repeat(80)).length <= 221, 'long summaries trimmed');
ok(N.nlUrlSlug('https://www.solurahomecare.com/letters/home-safety?s=card') === 'home-safety', 'slug read from a pasted guide link');
ok(N.nlUrlSlug('https://example.com/letters/x') === '', 'other sites have no slug');
enginesDoc.config.nlEdition = { title: 'E', url: 'u' };
ok(N.weeklyLinkMetaFor({}, { linkMode: 'site' }).title === 'E', 'website edition mode uses the picked edition');
enginesDoc.config.nlMeta = { 'home-safety': meta };
ok(N.weeklyLinkMetaFor({}, { linkMode: 'custom', customUrl: G }) === meta, 'pasted guide uses its looked-up details');
ok(N.weeklyLinkMetaFor({}, { linkMode: 'custom', customUrl: 'https://www.solurahomecare.com/letters/unknown' }) === null, 'unknown guide: no details yet (lookup runs in the background)');
ok(N.weeklyLinkMetaFor({}, { linkMode: 'pdf' }) === null, 'pdf mode untouched');
console.log('\nRead card preview: ' + PASS + ' passed, ' + FAIL + ' failed');
process.exit(FAIL ? 1 : 0);
