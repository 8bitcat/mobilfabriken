// App Store-skärmbilderna till Mobilfabriken: spelet körs i telefonens/plattans riktiga storlek (pekskärm →
// fyller höjden, svarta band vid sidorna) och fotas rakt av, utan rubriker.
//   iphone  6,3" liggande 2622×1206 (874×402 @3x) – "iPhone with Dynamic Island (medium display)", den enda
//           iPhone-storleken App Store Connect kräver (okt 2026)
//   ipad    13"  liggande 2752×2064 (1376×1032 @2x)
//   node app/tools/skarmbilder.mjs [iphone|ipad|alla] [--bara id,id] [--vanta ms] [--lang en]
//     → app/store/skarmbilder/<enhet>-<nr>-<id>.png
// Scenerna sätts upp med samma hjälpare som tools/snap.mjs (nyttTestspel, forstaKonsolen, lanseraKonsolen …).
// three.js renderas med SwiftShader (ingen GPU i Playwright) – därför väntetiden innan bilden tas.
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(APP, '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const LANG = opt('lang', 'sv');   // --lang en → engelska bilder i app/store/skarmbilder/en/
const OUT = path.join(APP, 'store', 'skarmbilder', ...(LANG === 'sv' ? [] : [LANG]));
const enhetVal = args.find((a) => !a.startsWith('--') && !['iphone', 'ipad', 'alla'].includes(a) === false) || 'alla';
const bara = opt('bara', '') ? opt('bara', '').split(',') : null;
const VANTA = +opt('vanta', 1800);
fs.mkdirSync(OUT, { recursive: true });

const ENHETER = {
  iphone: { vp: [874, 402], dsf: 3 },
  ipad: { vp: [1376, 1032], dsf: 2 },
};
const BILD = 'const bild = async () => { for (let q = 0; q < 2; q++) await new Promise((r) => requestAnimationFrame(r)); };';
const KB = LANG === 'en' ? 'PIXELBOX CO' : 'PIXELBOX AB', TB = LANG === 'en' ? 'MICROWAVE CO' : 'MIKROVÅG MOBIL';
const K = `nyttTestspel({ lage: 'konsol', namn: '${KB}' });`, KLANS = K + ' forstaKonsolen(); lanseraKonsolen();';
const TILL_KLAR = " let n = 0; while (A.G.projekt[0].status !== 'klar' && n++ < 300) dagar(1);";
// ordningen är ordningen i App Store (högst tio)
const SCENER = [
  ['startval', BILD + " A.go('start'); await bild(); const m = window.__U.mark['start-nytt']; const UI = await import('/js/core/ui.js'); UI.pekareNer(m.x + 2, m.y + 2); UI.pekareUpp(m.x + 2, m.y + 2);"],
  ['konsol-design', K + " A.go('design', { steg: " + opt('ksteg', 6) + " });"],
  ['show', K + ' forstaKonsolen();' + TILL_KLAR + " const r = proj.lansera(A.G, A.G.projekt[0].id, 'tv'); A.G.ko = []; A.go('show', { produkt: r.produkt.id, t: 30 });"],
  ['studios', KLANS + " dagar(40); A.G.ko = []; A.go('studios');"],
  ['reklam', KLANS + " A.G.ko = []; A.go('reklam', { konsol: A.G.produkter[0].id, t: 5 });"],
  ['kontor', K + " forstaKonsolen(); dagar(5); A.G.ko = []; A.go('kontor');"],
  ['telefon-design', `nyttTestspel({ namn: '${TB}' }); A.go('design', { steg: ${opt('tsteg', 12)} });`],
  ['forskning', K + " A.go('forskning', { nod: 'k-mobil' });"],
  ['telefoner', KLANS + " dagar(60); A.G.ko = []; A.go('telefoner');"],
];

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.otf': 'font/otf', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname.replace(/^\/$/, '/index.html')));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const bas = `http://127.0.0.1:${srv.address().port}`;
const { chromium } = createRequire('D:/Qisy/QISYFrontend/QISYFrontend-1/package.json')('playwright');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

let fel = 0;
for (const [enhet, E] of Object.entries(ENHETER)) {
  if (enhetVal !== 'alla' && enhetVal !== enhet) continue;
  let nr = 0;
  for (const [id, kod] of SCENER) {
    nr++;
    if (bara && !bara.includes(id)) continue;
    const ctx = await browser.newContext({ viewport: { width: E.vp[0], height: E.vp[1] }, deviceScaleFactor: E.dsf, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    const pagefel = [];
    page.on('pageerror', (e) => pagefel.push(String(e.message || e)));
    page.on('console', (m) => { if (m.type() === 'error' && !/deprecated with r150/.test(m.text())) pagefel.push(m.text()); });
    await page.goto(`${bas}/index.html?test${LANG === 'sv' ? '' : '&lang=' + LANG}`);
    await page.waitForFunction(() => window.__A && window.__A.scen, null, { timeout: 15000 });
    await page.waitForTimeout(400);
    const r = await page.evaluate(async (kod) => {
      const A = window.__A;
      const sim = await import('/js/sim/spel.js'), pers = await import('/js/sim/personal.js'), kont = await import('/js/sim/kontor.js'), tick = await import('/js/sim/tick.js'), des = await import('/js/sim/design.js'), proj = await import('/js/sim/projekt.js');
      const nyttTestspel = (o = {}) => { const G = sim.nyttSpel({ namn: o.namn || (o.lage === 'konsol' ? 'PIXELBOX AB' : 'MIKROVÅG MOBIL'), seed: o.seed ?? 7, lage: o.lage || 'telefon' }); pers.startKandidater(G); A.G = G; G.installningar.autopaus = false; G.handledning.av = true; kont.placera(G, { typ: 'bord', i: 0 }, 'fallbord'); kont.placera(G, { typ: 'bord', i: 1 }, 'fallbord'); pers.anstall(G, G.kandidater[0].id); pers.anstall(G, G.kandidater[0].id); return G; };
      const dagar = (n) => { for (let i = 0; i < n; i++) tick.dagTick(A.G); };
      const forstaKonsolen = () => { const d = des.nyDesign(A.G, null, 'konsol'); d.namn = 'PIXELBOX 1'; proj.startaUtveckling(A.G, d); };
      const lanseraKonsolen = (kamp = 'ingen') => { let n = 0; while (A.G.projekt[0] && A.G.projekt[0].status !== 'klar' && n++ < 300) tick.dagTick(A.G); return proj.lansera(A.G, A.G.projekt[0].id, kamp); };
      try { const f = new Function('A', 'nyttTestspel', 'dagar', 'forstaKonsolen', 'lanseraKonsolen', 'proj', 'des', 'tick', 'return (async () => {' + kod + '})()'); await f(A, nyttTestspel, dagar, forstaKonsolen, lanseraKonsolen, proj, des, tick); }
      catch (e) { return { fel: String(e.stack || e) }; }
      A.G && (A.G.fart = 0);   // stilla bild
      return { ok: true, canvas: [document.getElementById('c').width, document.getElementById('c').height, document.getElementById('c').getBoundingClientRect().height] };
    }, kod);
    await page.waitForTimeout(VANTA);
    const fil = path.join(OUT, `${enhet}-${nr}-${id}.png`);
    await page.screenshot({ path: fil, fullPage: false });
    const alla = [...(r.fel ? [r.fel] : []), ...pagefel];
    if (alla.length) fel++;
    console.log(`${alla.length ? '✗' : '✓'} ${enhet} ${nr} ${id}  canvas ${r.canvas ? r.canvas.join('×') : '?'}${alla.length ? '\n   ' + alla.join('\n   ') : ''}`);
    await ctx.close();
  }
}
await browser.close(); srv.close();
console.log(`${fel ? '✗' : '✓'} skärmbilder i ${path.relative(ROOT, OUT)}${fel ? ` – ${fel} med fel` : ''}`);
process.exit(fel ? 1 : 0);
