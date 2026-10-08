// Skärmbild av alla sex enheter i 3D: node tools/enheter-snap.mjs [namn] [query]
//   node tools/enheter-snap.mjs bak "vinkel=3.4&pitch=0.25&yta=kolfiber&kropp=1d2a44"
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const namn = process.argv[2] || 'enheter', query = process.argv[3] || '';
const MIME = { '.html': 'text/html', '.js': 'text/javascript' };
const srv = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream', 'cache-control': 'no-store' }); fs.createReadStream(p).pipe(res);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const { chromium } = createRequire('D:/Qisy/QISYFrontend/QISYFrontend-1/package.json')('playwright');
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1180, height: 640 } });
const fel = []; p.on('pageerror', (e) => fel.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') fel.push(m.text()); });
await p.goto(`http://127.0.0.1:${srv.address().port}/tools/enheter.html?${query}`);
await p.waitForFunction(() => window.__done, null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(500);
fs.mkdirSync(path.join(root, 'tools', 'out'), { recursive: true });
await p.screenshot({ path: path.join(root, 'tools', 'out', namn + '.png') });
console.log(JSON.stringify({ fel }), 'tools/out/' + namn + '.png');
await b.close(); srv.close();
