// Musiken spelas i en riktig webbläsare: startar efter första trycket, följer skärmen och epoken, inga fel,
// och MUSIK av i menyn tystar den. Räknar oscillatorer som skapas (WebAudio) i stället för att lyssna.
//   node tools/musik-test.mjs   → sista raden ✓ eller ✗
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.otf': 'font/otf', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((req, res) => { const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname.replace(/^\/$/, '/index.html'))); if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const { chromium } = createRequire('D:/Qisy/QISYFrontend/QISYFrontend-1/package.json')('playwright');
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1152, height: 648 } });
const fel = []; p.on('pageerror', (e) => fel.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/deprecated with r150/.test(m.text())) fel.push(m.text()); });
await p.addInitScript(() => { window.__osc = 0; const o = AudioContext.prototype.createOscillator; AudioContext.prototype.createOscillator = function () { window.__osc++; return o.call(this); }; });
await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`);
await p.waitForFunction(() => window.__A && window.__A.scen, null, { timeout: 30000 });
await p.mouse.click(5, 5);   // första trycket låser upp ljudet
const mat = async (ms) => { const a = await p.evaluate(() => window.__osc); await p.waitForTimeout(ms); return (await p.evaluate(() => window.__osc)) - a; };
const resultat = [];
const koll = (n, ok, info = '') => { resultat.push(ok); console.log((ok ? '✓ ' : '✗ ') + n + (info ? '  ' + info : '')); };
koll('startsidan spelar musik', (await mat(2500)) > 10);
const fore = await p.evaluate(async () => { const sim = await import('/js/sim/spel.js'), pers = await import('/js/sim/personal.js'); const G = sim.nyttSpel({ namn: 'X AB', seed: 1, lage: 'konsol' }); pers.startKandidater(G); G.handledning.av = true; window.__A.G = G; window.__A.go('kontor'); return true; });
koll('kontoret 1982 spelar (arbetsmusik)', fore && (await mat(3000)) > 5);
await p.evaluate(() => { window.__A.G.dag = 8000; window.__A.go('meny'); });
koll('menyn 2028 spelar (temat, synthwave)', (await mat(3000)) > 10);
await p.evaluate(async () => { const m = await import('/js/core/musik.js'); m.sattMusik(false); });
await p.waitForTimeout(800);
koll('MUSIK av tystar', (await mat(2000)) < 4);
await p.evaluate(async () => { const m = await import('/js/core/musik.js'); m.sattMusik(true); const l = await import('/js/core/ljud.js'); for (const n of ['knack', 'jubel', 'jingel', 'nyar', 'banner', 'flytt']) l.spela(n); });
await p.waitForTimeout(1500);
koll('inga fel i konsolen', !fel.length, fel.slice(0, 3).join(' | '));
await b.close(); srv.close();
const ok = resultat.every(Boolean);
console.log(ok ? '✓ musik-test' : '✗ musik-test');
process.exit(ok ? 0 : 1);
