// Skärmbild av en provsida i projektet: node tools/konsol-design/prov.mjs <sida relativt roten> <utfil.png> [bredd] [höjd]
//   node tools/konsol-design/prov.mjs "tools/konsol-design/glimtar-prov.html?t=1,3.3" tools/out/glimtar.png
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const [sida, ut, bredd = 1580, hojd = 900] = process.argv.slice(2);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.otf': 'font/otf', '.png': 'image/png' };
const EXTRA = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const srv = http.createServer((q, r) => {
  const p = path.join(root, decodeURIComponent(new URL(q.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const { chromium } = createRequire('D:/Qisy/QISYFrontend/QISYFrontend-1/package.json')('playwright');
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: +bredd, height: +hojd } });
const fel = []; p.on('pageerror', (e) => fel.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') fel.push(m.text()); });
await p.goto(`http://127.0.0.1:${srv.address().port}/${sida}`);
await p.waitForFunction(() => window.__klar, null, { timeout: 30000 }).catch(() => fel.push('__klar sattes aldrig'));
await p.waitForTimeout(300);
await p.screenshot({ path: path.join(root, ut), fullPage: true });
console.log(JSON.stringify({ ut, fel }));
await b.close(); srv.close();
