// Robot som spelar första varvet precis som ett barn: klickar sig igenom startskärmen och hela
// handledningen (bygg → anställ → designa → bygg klart → lansera → showen → telefoner → forskning)
// med riktiga klick på de namngivna knapparna. Skärmbilder i tools/out/spel-*.png.
//   node tools/spela-test.mjs [--port N]     → slutar med ✓/✗-rad
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.otf': 'font/otf', '.json': 'application/json', '.png': 'image/png' };
const srv = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname.replace(/^\/$/, '/index.html')));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const { chromium } = createRequire('D:/Qisy/QISYFrontend/QISYFrontend-1/package.json')('playwright');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1152, height: 648 } });
const fel = [], logg = [];
page.on('pageerror', (e) => fel.push(String(e.stack || e)));
page.on('console', (m) => { if (m.type() === 'error') fel.push(m.text()); });
await page.addInitScript(() => { try { if (!sessionStorage.getItem('rensat')) { localStorage.clear(); sessionStorage.setItem('rensat', '1'); } } catch { /* ok */ } });
await page.goto(`http://127.0.0.1:${srv.address().port}/index.html`);
await page.waitForFunction(() => window.__A && window.__A.scen, null, { timeout: 15000 });
fs.mkdirSync(path.join(root, 'tools', 'out'), { recursive: true });

const vanta = (ms) => page.waitForTimeout(ms);
let nr = 0;
const bild = async (namn) => { await page.locator('#spel').screenshot({ path: path.join(root, 'tools', 'out', `spel-${String(++nr).padStart(2, '0')}-${namn}.png`) }); };
// klicka på en namngiven knapp (UI-markeringen från senaste bildrutan)
async function klicka(namn, timeout = 8000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const r = await page.evaluate((n) => { const m = window.__U.mark[n]; if (!m) return null; const c = document.querySelector('#c').getBoundingClientRect(); const k = c.width / 384; return { x: c.left + (m.x + m.w / 2) * k, y: c.top + (m.y + m.h / 2) * k }; }, namn);
    if (r) { await page.mouse.click(r.x, r.y); await vanta(120); logg.push('klick ' + namn); return true; }
    await vanta(100);
  }
  throw new Error('hittade inte knappen ' + namn + ' (scen ' + await page.evaluate(() => window.__A.scenNamn) + ')');
}
const lage = () => page.evaluate(() => { const G = window.__A.G; return G ? { scen: window.__A.scenNamn, dag: G.dag, kassa: G.bolag.kassa, bord: G.kontor.bord.filter(Boolean).length, personal: G.personal.length, projekt: G.projekt.map((p) => p.status), produkter: G.produkter.length, steg: G.handledning.steg, klar: G.handledning.klar, fp: G.bolag.fp, forsk: G.forskning.pagar.length + G.forskning.klara.length, salda: G.bolag.totaltSalda } : { scen: window.__A.scenNamn }; });
const kontroller = [];
let stangKort = false;
// stäng nyårskort o.d. som stoppar tiden medan roboten väntar
setInterval(async () => { if (!stangKort) return; try { await page.evaluate(() => { const m = window.__U.mark['stor-ok']; if (m) { const c = document.querySelector('#c').getBoundingClientRect(), k = c.width / 384; const e = new PointerEvent('pointerdown', { clientX: c.left + (m.x + m.w / 2) * k, clientY: c.top + (m.y + m.h / 2) * k, bubbles: true, pointerId: 1 }); document.querySelector('#c').dispatchEvent(e); } }); } catch { /* sidan stängd */ } }, 700);
const ok = (v, t) => { kontroller.push([v, t]); console.log((v ? '  ✓ ' : '  ✗ ') + t); };

try {
  await vanta(600); await bild('start');
  await klicka('start-nytt'); await klicka('start-namnfalt');
  await page.keyboard.type('Robotfonen AB'); await page.keyboard.press('Enter');
  await klicka('start-skapa'); await vanta(400); await bild('valkomst');
  ok((await lage()).scen === 'kontor', 'nytt bolag startar i kontoret');
  await klicka('handledning-start');
  await klicka('flik-bygg'); await bild('bygg');
  await klicka('mobel-fallbord'); await klicka('plats-bord-0'); await klicka('plats-bord-1');
  ok((await lage()).bord === 2, 'två fällbord står i garaget');
  await klicka('bygg-klar');
  await klicka('flik-personal'); await bild('personal');
  await klicka('anstall-0'); await klicka('anstall-0');
  ok((await lage()).personal === 2, 'Vera och Lykke är anställda');
  await klicka('flik-design'); await vanta(300); await bild('design');
  await klicka('design-hoppa'); await bild('granskning');
  await klicka('design-starta'); await vanta(300);
  let L = await lage(); ok(L.projekt[0] === 'bygger' && L.scen === 'kontor', 'utvecklingen startar och man hamnar i kontoret');
  await klicka('fart-8'); await bild('bygger');
  await vanta(1500);
  console.log('  · tidsläge', JSON.stringify(await page.evaluate(async () => { const N = await import('/js/core/notiser.js'); const H = await import('/js/scener/handledning.js'); const A = window.__A; return { dag: A.G.dag, fart: A.G.fart, tid: A.tidGar(), stor: N.storOppen(), hand: H.handledningAktiv(A), scenTid: A.scen.tid, h: A.G.handledning }; })));
  // vänta tills bygget är klart – kortet "PIXEL PHONE 1 ÄR KLAR!" stoppar tiden och har en LANSERA-knapp
  await page.waitForFunction(() => window.__A.G.projekt[0]?.status === 'klar', null, { timeout: 120000 });
  await vanta(400); await bild('klar');
  await klicka('stor-lansera'); await vanta(300); await bild('lanseringsdag');
  await klicka('lansera'); await vanta(500);
  ok((await lage()).produkter === 1, 'telefonen är lanserad');
  await page.evaluate(() => { const s = window.__A.scen; }); await vanta(2500); await bild('show');
  await page.keyboard.press('Space'); await vanta(400); await bild('show-slut');
  await klicka('show-klar');
  await klicka('fart-8');
  stangKort = true;
  await page.waitForFunction(() => window.__A.G.produkter[0].veckor.length >= 1, null, { timeout: 120000 });
  await klicka('flik-telefoner'); await vanta(300); await bild('telefoner');
  L = await lage(); ok(L.salda > 0, `telefonen säljer (${L.salda} sålda första veckan)`);
  await klicka('flik-forskning'); await vanta(300);
  await klicka('redo-funk-gps'); await klicka('starta-forskning'); await vanta(300); await bild('forskning');
  L = await lage(); ok(L.forsk > 0, 'GPS-forskningen är startad');
  ok(L.klar === true, 'handledningen är klar (13 av 13)');
  // spara och ladda om – pausa först, annars hinner dagen gå mellan läsningen och sparningen (8×)
  const sparadDag = await page.evaluate(() => { window.__A.pausa(); window.__A.spara(); return window.__A.G.dag; });
  await page.reload(); await page.waitForFunction(() => window.__A && window.__A.scen, null, { timeout: 15000 }); await vanta(400);
  await klicka('start-fortsatt'); await vanta(300);
  const L2 = await lage(); ok(L2.produkter === 1 && L2.dag === sparadDag, `sparningen laddas med samma dag och telefon (dag ${L2.dag} = ${sparadDag})`);
  await bild('laddat');
} catch (e) { fel.push(String(e.stack || e)); }

await browser.close(); srv.close();
for (const f of fel) console.log('  ! ' + f.split('\n')[0]);
const dåliga = kontroller.filter(([v]) => !v).length + fel.length;
console.log(dåliga ? `✗ spela-test: ${dåliga} fel` : `✓ spela-test: hela första varvet går att spela med riktiga klick (${kontroller.length} kontroller)`);
process.exit(dåliga ? 1 : 0);
