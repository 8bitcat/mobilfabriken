// Skärmbilder av spelet: node tools/snap.mjs <namn> [skript]
//   skriptet är JS som körs i sidan efter start (window.__A finns), t.ex.
//   node tools/snap.mjs kontor "nyttTestspel(); A.go('kontor')"
// Hjälpfunktioner i sidan: nyttTestspel(), dagar(n), vanta(ms) – se nedan. Skriver tools/out/<namn>.png (3×)
// och rapporterar konsolfel. --skala 1|2|3, --w/--h fönsterstorlek.
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const fria = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const namn = fria[0] || 'snap', skript = fria[1] || '';
const skala = +opt('skala', 3), vw = +opt('w', 384 * skala), vh = +opt('h', 216 * skala);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.otf': 'font/otf', '.json': 'application/json', '.png': 'image/png' };
const srv = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname.replace(/^\/$/, '/index.html')));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const { chromium } = createRequire('D:/Qisy/QISYFrontend/QISYFrontend-1/package.json')('playwright');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: +opt('dpr', 1), hasTouch: +opt('dpr', 1) > 1 });
const fel = [];
page.on('pageerror', (e) => fel.push(String(e.stack || e)));
page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/deprecated with r150/.test(m.text())) fel.push(m.type() + ': ' + m.text()); });
await page.goto(`http://127.0.0.1:${srv.address().port}/index.html?test`);
await page.waitForFunction(() => window.__A && window.__A.scen, null, { timeout: 15000 });
await page.waitForTimeout(400);
const resultat = await page.evaluate(async (kod) => {
  const A = window.__A;
  const sim = await import('/js/sim/spel.js'), pers = await import('/js/sim/personal.js'), kont = await import('/js/sim/kontor.js'), tick = await import('/js/sim/tick.js'), des = await import('/js/sim/design.js'), proj = await import('/js/sim/projekt.js'), forsk = await import('/js/sim/forskning.js');
  const vanta = (ms) => new Promise((r) => setTimeout(r, ms));
  const nyttTestspel = (o = {}) => { const G = sim.nyttSpel({ namn: o.namn || 'MIKROVÅG MOBIL', seed: o.seed ?? 7 }); pers.startKandidater(G); A.G = G; G.installningar.autopaus = false; if (!o.handledning) G.handledning.av = true; if (o.bord !== false) { kont.placera(G, { typ: 'bord', i: 0 }, 'fallbord'); kont.placera(G, { typ: 'bord', i: 1 }, 'fallbord'); } if (o.anstall !== false) { pers.anstall(G, G.kandidater[0].id); pers.anstall(G, G.kandidater[0].id); } return G; };
  const dagar = (n) => { for (let i = 0; i < n; i++) tick.dagTick(A.G); };
  const forstaTelefonen = () => { const d = des.nyDesign(A.G); d.namn = 'PIXEL PHONE 1'; proj.startaUtveckling(A.G, d); };
  try { const f = new Function('A', 'nyttTestspel', 'dagar', 'vanta', 'forstaTelefonen', 'sim', 'pers', 'kont', 'tick', 'des', 'proj', 'forsk', 'return (async () => {' + kod + '})()'); return { ok: true, v: await f(A, nyttTestspel, dagar, vanta, forstaTelefonen, sim, pers, kont, tick, des, proj, forsk) }; }
  catch (e) { return { ok: false, fel: String(e.stack || e) }; }
}, skript);
await page.waitForTimeout(+opt('vanta', 700));
fs.mkdirSync(path.join(root, 'tools', 'out'), { recursive: true });
const ut = path.join(root, 'tools', 'out', namn + '.png');
await page.locator('#spel').screenshot({ path: ut });
await browser.close(); srv.close();
console.log(JSON.stringify({ resultat, fel: fel.slice(0, 12) }, null, 1));
console.log(ut);
