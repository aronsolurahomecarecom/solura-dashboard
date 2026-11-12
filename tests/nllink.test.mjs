// 🔗 Personal guide links (NLLINK): any link to solurahomecare.com/letters/<slug> or /newsletter/<slug>
// in a message filled for a lead becomes that lead's personal ?r=<code> link; {letter_link} fills with the
// hub's edition; real sends register the codes in the Newsletter hub so read-back works.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');
let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };
const cut = (a, z) => { const b = html.indexOf(a), e = html.indexOf(z); if (b < 0 || e < 0) throw new Error('markers ' + a); return html.slice(html.indexOf('*/', b) + 2, e); };
const hub = cut('/* ⚡NLHUB — BEGIN', '/* ⚡NLHUB — END */');
const link = cut('/* ⚡NLLINK — BEGIN', '/* ⚡NLLINK — END */');
const enginesDoc = { config: {} }, C = { NM: 0, DM: 1 }, rows = [['Ann Smith', 'Beth Smith'], ['Carl Jones', 'Dana Jones']];
let saves = 0, renders = 0;
const mk = new Function('escapeHtml', 'enginesDoc', 'crypto', 'rows', 'C', 'leadKey', 'saveEnginesDoc', 'renderNlHub',
  hub + link + '\nreturn {nlPersonalizeLinks,nlNoteSent,nlSendsAll,nlLeadCode,_nlPending};');
const N = mk(s => s, enginesDoc, (await import('node:crypto')).webcrypto, rows, C, ri => 'k' + ri,
  () => { saves++; return Promise.resolve(); }, () => { renders++; });
const G = 'https://www.solurahomecare.com/letters/the-folder-in-the-kitchen-drawer-20261101';
const email = '<a href="' + G + '"><img src="x"></a><a class="cardlink" href="' + G + '">T</a><a href="https://www.solurahomecare.com">site</a><a href="https://cal.com/x">c</a>';
const e0 = N.nlPersonalizeLinks(email, { ri: 0 });
const codes0 = [...e0.matchAll(/\?r=([a-z0-9]+)/g)].map(m => m[1]);
ok(codes0.length === 2, 'both guide links personalized');
ok(codes0[0] === codes0[1], 'same code for the same lead and guide');
ok(/^[a-z0-9]{14}$/.test(codes0[0]), 'code fits the website rule (10-24 a-z0-9)');
ok(e0.includes('href="https://www.solurahomecare.com"') && e0.includes('https://cal.com/x'), 'other links untouched');
ok(N.nlPersonalizeLinks(email, { ri: 0 }) === e0, 'stable: preview and send carry the same link');
const e1 = N.nlPersonalizeLinks(email, { ri: 1 });
ok(e1.match(/\?r=([a-z0-9]+)/)[1] !== codes0[0], 'different lead, different code');
ok(N.nlPersonalizeLinks(email, {}) === email, 'no lead: links left as they are');
ok(N.nlPersonalizeLinks(G + '?r=abcdefghij12', { ri: 0 }) === G + '?r=abcdefghij12', 'hub links (already personal) untouched');
ok(N.nlPersonalizeLinks(G + '?s=card', { ri: 0 }) === G + '?s=card&r=' + codes0[0], 'keeps an existing query');
ok(N.nlPersonalizeLinks('<a href="{letter_link}">x</a>', {}) === '<a href="https://www.solurahomecare.com/letters">x</a>', '{letter_link} without an edition falls back to the guides page');
enginesDoc.config.nlEdition = { slug: 'the-folder-in-the-kitchen-drawer-20261101', url: G, title: 'The folder in the kitchen drawer' };
const e2 = N.nlPersonalizeLinks('<a href="{letter_link}">x</a> <a href="{letter_link:card}">y</a>', { ri: 0 });
ok(e2.includes(G + '?r=' + codes0[0]) && e2.includes(G + '?s=card&r=' + codes0[0]), '{letter_link} and {letter_link:spot} become personal');
// sending registers the leads in the hub
N.nlNoteSent(JSON.stringify({ message: { body: { content: e0 } } }));
N.nlNoteSent({ html: e1 });
N.nlNoteSent({ html: e0 });
const L = N.nlSendsAll();
ok(L.length === 1 && L[0].adhoc && L[0].slug === 'the-folder-in-the-kitchen-drawer-20261101', 'one hub send per guide');
ok(L[0].recipients.length === 2, 'each lead listed once');
ok(L[0].recipients[0].name === 'Ann Smith' && L[0].recipients[0].k === 'k0', 'lead name and key recorded');
ok(L[0].title === 'The folder in the kitchen drawer', 'title from the picked edition');
ok(saves > 0 && renders > 0, 'saved and hub refreshed');
console.log(`\nPersonal guide links: ${PASS} passed, ${FAIL} failed`);
if (FAIL) process.exit(1);
