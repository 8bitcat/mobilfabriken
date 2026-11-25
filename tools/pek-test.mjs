// Pekskärmen (Carl 2026-11-25: "trycker man på en gren så går det inte scrolla"): ett drag som börjar på en gren i
// forskningsträdet skrollar trädet och väljer inte grenen; ett stilla tryck väljer den; listan REDO ATT FORSKA går att dra.
// Riktiga PointerEvents med pointerType 'touch' på spelets canvas.   node tools/pek-test.mjs → sista raden ✓/✗
import { createRequire } from 'node:module';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.otf': 'font/otf', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((req, res) => { const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname.replace(/^\/$/, '/index.html'))); if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const { chromium } = createRequire('D:/Qisy/QISYFrontend/QISYFrontend-1/package.json')('playwright');
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ viewport: { width: 874, height: 402 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
const fel = []; p.on('pageerror', (e) => fel.push(e.message));
await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?test`);
await p.waitForFunction(() => window.__A && window.__A.scen, null, { timeout: 30000 });
const r = await p.evaluate(async () => {
  const A = window.__A, sim = await import('/js/sim/spel.js'), pers = await import('/js/sim/personal.js'), tick = await import('/js/sim/tick.js');
  const G = sim.nyttSpel({ namn: 'X AB', seed: 2, lage: 'telefon' }); pers.startKandidater(G); G.handledning.av = true; A.G = G;
  for (let i = 0; i < 400; i++) tick.dagTick(G); G.ko = [];
  A.go('forskning');
  const bild = async () => { for (let q = 0; q < 3; q++) await new Promise((r) => requestAnimationFrame(r)); };
  await bild();
  const cv = document.getElementById('c'), rc = cv.getBoundingClientRect();
  const sk = (gx, gy) => [rc.left + gx / 384 * rc.width, rc.top + gy / 216 * rc.height];
  const pe = (typ, gx, gy) => { const [x, y] = sk(gx, gy); cv.dispatchEvent(new PointerEvent(typ, { pointerId: 7, pointerType: 'touch', clientX: x, clientY: y, bubbles: true, isPrimary: true })); };
  const dra = async (x0, y0, x1, y1) => { pe('pointerdown', x0, y0); await bild(); for (let i = 1; i <= 6; i++) { pe('pointermove', x0 + (x1 - x0) * i / 6, y0 + (y1 - y0) * i / 6); await bild(); } pe('pointerup', x1, y1); await bild(); await bild(); };
  // en gren i trädet som syns
  const noder = Object.entries(window.__U.mark).filter(([n, m]) => n.startsWith('nod-') && m.y > 40 && m.y < 130 && m.x > 210 && m.x < 340);
  if (!noder.length) return { fel: 'ingen gren syns' };
  const [namn, m0] = noder[0];
  await dra(m0.x + 10, m0.y + 6, m0.x + 10, m0.y - 40);   // dra uppåt från grenen
  const m1 = window.__U.mark[namn];
  const flyttad = !m1 || m1.y !== m0.y;
  // inget valt efter draget: detaljrutan (y > 146 i trädet) har ingen START-knapp
  const valdEfterDrag = Object.keys(window.__U.mark).some((n) => /^detalj-|forskning-starta|starta-/.test(n));
  // stilla tryck på en synlig gren väljer den
  const syns = Object.entries(window.__U.mark).filter(([n, m]) => n.startsWith('nod-') && m.y > 30 && m.y < 140 && m.x > 210 && m.x < 340)[0];
  pe('pointerdown', syns[1].x + 8, syns[1].y + 6); await bild(); pe('pointerup', syns[1].x + 8, syns[1].y + 6); await bild(); await bild();
  const marker = Object.keys(window.__U.mark);
  return { namn, flyttad, valdEfterDrag, efterTryck: marker.filter((n) => /^detalj-|starta-forskning/.test(n)).slice(0, 5) };
});
await p.screenshot({ path: path.join(root, 'tools', 'out', 'pek-test.png') });
await b.close(); srv.close();
const koll = [['drag från en gren skrollar trädet', r.flyttad], ['draget väljer inte grenen', !r.valdEfterDrag], ['ett stilla tryck väljer grenen', (r.efterTryck || []).length > 0], ['inga fel', !fel.length && !r.fel]];
for (const [n, ok] of koll) console.log((ok ? '✓ ' : '✗ ') + n);
console.log(JSON.stringify(r).slice(0, 300), fel.slice(0, 2).join(' | '));
const ok = koll.every(([, o]) => o);
console.log(ok ? '✓ pek-test' : '✗ pek-test');
process.exit(ok ? 0 : 1);
