// 📖 Lead reads: personal links sent to a lead are checked against the website,
// and the lead drawer shows what each lead opened and read.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'Solura_Dashboard.html'), 'utf8');
let PASS = 0, FAIL = 0;
const ok = (c, n) => { if (c) PASS++; else { FAIL++; console.error('  ✗ FAIL: ' + n); } };
const a = html.indexOf('/* ⚡NLREADS — BEGIN'), z = html.indexOf('/* ⚡NLREADS — END */');
ok(a > 0 && z > a, 'read tracking block present');
const src = html.slice(a, z);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const now = Date.now();
const enginesDoc = {
  config: { nlMeta: { 'home-safety': { title: 'Fall-proofing the home' } } },
  nlAdhoc: {
    L1: [{ code: 'aaaaaaaaaaa1', slug: 'home-safety', at: now - 864e5 }, { code: 'bbbbbbbbbbb2', slug: 'holiday-visit-signs', at: now - 2 * 864e5 }, { code: 'ccccccccccc3', slug: 'x', at: now - 3 * 864e5 }],
    L2: [{ code: 'ddddddddddd4', slug: 'old', at: now - 90 * 864e5 }]
  }
};
const sends = [{ slug: 'weekly', title: 'This week', sentAt: now - 5 * 864e5, lastPoll: now,
  recipients: [{ k: 'L1', code: 'eeeeeeeeeee5' }, { k: 'L9', code: 'fffffffffff6' }],
  stats: { eeeeeeeeeee5: { code: 'eeeeeeeeeee5', slug: 'weekly', first_open_at: new Date(now - 4 * 864e5).toISOString(), last_open_at: new Date(now - 4 * 864e5).toISOString(), opens: 1 } } }];
let sentBodies = [], saved = 0, drawerRi = 7;
const fetchStub = async (url, opt) => {
  sentBodies.push(JSON.parse(opt.body));
  return { ok: true, json: async () => [
    { code: 'aaaaaaaaaaa1', slug: 'home-safety', first_open_at: new Date(now - 3600e3).toISOString(), last_open_at: new Date(now - 3600e3).toISOString(), read_at: new Date(now - 3500e3).toISOString(), opens: 2, seconds: 95, max_scroll: 82 },
    { code: 'bbbbbbbbbbb2', slug: 'holiday-visit-signs', first_open_at: new Date(now - 7200e3).toISOString(), last_open_at: new Date(now - 7200e3).toISOString(), read_at: null, opens: 1, seconds: 3, max_scroll: 5 }
  ] };
};
const N = new Function('enginesDoc', 'escapeHtml', 'leadKey', 'nlSendsAll', 'nlHubPoll', 'nlHubFmtSecs', 'saveEnginesDoc', 'fetch', 'NL_STATUS_URL', 'NL_STATUS_KEY', 'document', 'drawerRi',
  src + '\nreturn {nlLeadCodes,nlReadsPoll,nlReadsPollLead,nlLeadReads,renderLeadReadsFor,nlTitleForSlug};')(
  enginesDoc, esc, ri => (ri === 7 ? 'L1' : ri === 8 ? 'L2' : 'L3'), () => sends, async () => {}, s => Math.round(s) + 's',
  () => { saved++; return Promise.resolve(); }, fetchStub, 'U', 'K', { getElementById: () => null }, drawerRi);

ok(N.nlLeadCodes().length === 4, 'every saved code is collected once');
await N.nlReadsPoll(true);
ok(sentBodies.length === 1 && sentBodies[0].p_codes.length === 3 && !sentBodies[0].p_codes.includes('ddddddddddd4'), 'polls only codes younger than 60 days');
ok(enginesDoc.nlReads.aaaaaaaaaaa1.read_at && saved === 1, 'results stored and saved');
await N.nlReadsPoll(false);
ok(sentBodies.length === 1, 'does not poll again within 20 minutes');
await N.nlReadsPoll(true); 
ok(saved === 1, 'no save when nothing changed');
const L = N.nlLeadReads(7);
ok(L.length === 3, 'lead email opens plus hub send opens, only opened ones');
ok(L[0].code === 'aaaaaaaaaaa1' && L[2].code === 'eeeeeeeeeee5', 'newest first');
const h = N.renderLeadReadsFor(7);
ok(h.includes('id="nl-reads-7"') && h.includes('Guides they read'), 'drawer section rendered');
ok(h.includes('Fall-proofing the home') && h.includes('✓ Read') && h.includes('82% of the page') && h.includes('opened ×2'), 'read shows title, time and scroll');
ok(h.includes('Holiday visit signs') && h.includes('not read yet'), 'open without read is shown as opened only, title from the slug');
ok(h.includes('This week'), 'hub send uses its title');
ok(h.includes('>1</span>'), 'count shows reads, not opens');
ok(N.renderLeadReadsFor(9) === '<div id="nl-reads-9"></div>', 'no links sent: empty placeholder only');
ok(N.renderLeadReadsFor(8).includes('No opens yet'), 'links sent but none opened: quiet note');
ok(N.nlTitleForSlug('care-at-home-20261112') === 'Care at home', 'date suffix trimmed from slug titles');
ok(html.includes("sentHtml+activityHtml") && !html.includes('readsHtml'), 'no separate guides section: doc counts live on each email line');
ok(html.includes("nlReadsPoll(false).catch(function(){});}catch(_){} // 📖"), 'standing poll checks reads');
ok(html.includes("nlReadsPollLead(ri).catch(function(){})"), 'opening a lead checks that lead right away');
ok(!html.includes('nlReadsPolledAt'), 'throttle is per browser tab, not shared through settings');
const before = sentBodies.length;
await N.nlReadsPollLead(7);
ok(sentBodies.length === before + 1 && sentBodies[sentBodies.length - 1].p_codes.length === 3, 'lead check asks only about that lead\'s codes');
await N.nlReadsPollLead(7);
ok(sentBodies.length === before + 1, 'lead check waits 30 seconds before asking again');
await N.nlReadsPollLead(9);
ok(sentBodies.length === before + 1, 'lead with no links: no request');
// ── 📄 doc counts on each email line ──
{
  const b = html.indexOf('// 📄 Personal guide links'), e = html.indexOf('var _trkSelfInfo=');
  const rsrc = html.slice(b, e);
  const R = new Function('escapeHtml', 'trackDocUrl', rsrc + '\nreturn {rewriteTrackedDocAnchors};')(esc, (u, m) => 'https://trk.example/doc?u=' + encodeURIComponent(u) + '&i=' + m.i);
  const card = '<a href="https://www.solurahomecare.com/letters/home-safety?r=abcdefghij12" style="x">Read</a> <a href="https://cal.com/x">Book</a> <a data-trkdoc="1" href="https://onedrive/x.pdf">PDF</a>';
  const out = R.rewriteTrackedDocAnchors(card, { i: 'm1' });
  ok(out.includes('trk.example/doc?u=' + encodeURIComponent('https://www.solurahomecare.com/letters/home-safety?r=abcdefghij12')), 'guide link goes through the doc tracker');
  ok(out.includes('href="https://cal.com/x"'), 'other links untouched');
  ok(out.includes(encodeURIComponent('https://onedrive/x.pdf')), 'PDF doc links still tracked');
  ok(R.rewriteTrackedDocAnchors('<a href="https://www.solurahomecare.com/letters/home-safety">x</a>', { i: 'm1' }).includes('href="https://www.solurahomecare.com/letters/home-safety"'), 'public link without a personal code stays as is');
}
{
  enginesDoc.nlAdhoc.L1[0].sid = undefined;
  const T = new Function('enginesDoc', 'leadKey', 'saveEnginesDoc', html.slice(html.indexOf('function nlTagCodesWithSend('), html.indexOf('/* ⚡NLREADS — END */')) + '\nreturn {nlTagCodesWithSend,nlDocForSend};')(enginesDoc, ri => (ri === 7 ? 'L1' : 'L3'), () => Promise.resolve());
  const n = T.nlTagCodesWithSend('<a href="https://www.solurahomecare.com/letters/home-safety?s=card&amp;r=aaaaaaaaaaa1">x</a>', 'mSEND', 7);
  ok(n === 1 && enginesDoc.nlAdhoc.L1[0].sid === 'mSEND', 'the code in the email is stamped with that email');
  const d = T.nlDocForSend(7, { id: 'mSEND', ts: now }, []);
  ok(d && d.opens === 2 && d.read && d.scroll === 82, 'stamped email shows doc opens and the read');
  const later = T.nlDocForSend(7, { id: 'mOTHER', ts: now - 2 * 864e5 + 60000 }, [{ ts: now - 3 * 864e5 }]);
  ok(later && later.opens === 1 && !later.read, 'older email without a stamp matches the code made just before it');
  ok(T.nlDocForSend(7, { id: 'mX', ts: now - 20 * 864e5 }, []) === null, 'no guide in that email: no doc badge');
}
console.log('\nLead reads: ' + PASS + ' passed, ' + FAIL + ' failed');
if (FAIL) process.exit(1);
