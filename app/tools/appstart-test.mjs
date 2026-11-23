// Provstart av appens innehåll (app/www) som i Capacitor: window.Capacitor finns, iPhone-storlek, inget nät.
// Kollar att spelet startar till startmenyn, att three.js laddas lokalt, att inget hämtas utifrån och att
// Safari-tipset om hemskärmen inte visas. (Pixelcity 1.3 nekades för en hängande start – det här fångar
// inte iOS-hängningen i Capacitors native-bridge, men allt som ligger i vårt eget innehåll.)
//   node app/tools/appstart-test.mjs      → sista raden ✓ eller ✗   (kör node app/build.mjs först)
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WWW = path.join(APP, 'www');
if (!fs.existsSync(path.join(WWW, 'index.html'))) { console.log('✗ app/www saknas – kör node app/build.mjs'); process.exit(1); }
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.otf': 'font/otf', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((req, res) => {
  const p = path.join(WWW, decodeURIComponent(new URL(req.url, 'http://x').pathname.replace(/^\/$/, '/index.html')));
  if (!p.startsWith(WWW) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const bas = `http://127.0.0.1:${srv.address().port}`;
const { chromium } = createRequire('D:/Qisy/QISYFrontend/QISYFrontend-1/package.json')('playwright');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 874, height: 402 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 27_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148' });
await ctx.addInitScript(() => { window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'ios' }; });
const page = await ctx.newPage();
const fel = [], yttre = [], saknas = [];
page.on('pageerror', (e) => fel.push(String(e.message || e)));
page.on('console', (m) => { if (m.type() === 'error') fel.push(m.text()); });
page.on('request', (r) => { if (!r.url().startsWith(bas)) yttre.push(r.url()); });
page.on('response', (r) => { if (r.status() >= 400) saknas.push(`${r.status()} ${r.url().replace(bas, '')}`); });
await page.goto(`${bas}/index.html`);
let start = true;
try { await page.waitForFunction(() => window.__A && window.__A.scen && window.__A.scenNamn === 'start', null, { timeout: 15000 }); } catch { start = false; }
await page.waitForTimeout(1500);
const st = await page.evaluate(() => ({ three: typeof THREE !== 'undefined' && THREE.REVISION, scen: window.__A?.scenNamn, tips: !document.getElementById('hemskarm').classList.contains('dold'), vand: !document.getElementById('vand').classList.contains('dold'), canvas: document.getElementById('c').getBoundingClientRect().height }));
await page.screenshot({ path: path.join(APP, 'out', 'appstart.png') });
await browser.close(); srv.close();
const koll = [
  ['startmenyn kom', start && st.scen === 'start'],
  ['three.js lokalt (r' + st.three + ')', st.three === '160'],
  ['inget hämtas utifrån', !yttre.length, yttre],
  ['inga saknade filer', !saknas.length, saknas],
  ['inga fel i konsolen', !fel.length, fel],
  ['hemskärmstipset dolt', !st.tips],
  ['ingen vänd-ruta', !st.vand],
  ['spelet fyller höjden (' + Math.round(st.canvas) + ' av 402 px)', st.canvas >= 400],
];
let ok = true;
for (const [n, b, lista] of koll) { console.log((b ? '✓ ' : '✗ ') + n); if (!b) { ok = false; for (const r of lista || []) console.log('    ' + r); } }
console.log(ok ? '✓ appstart-test' : '✗ appstart-test');
process.exit(ok ? 0 : 1);
