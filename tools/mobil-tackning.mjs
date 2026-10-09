// Mäter hur stor del av mobilskärmen spelet täcker: node tools/mobil-tackning.mjs [url] [namn]
// Liggande iPhone 13 mini (med och utan Safaris fält), större iPhone och en Android-telefon.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const url = process.argv[2] || 'https://8bitcat.github.io/mobilfabriken/';
const namn = process.argv[3] || 'mobil';
const { chromium } = createRequire('D:/Qisy/QISYFrontend/QISYFrontend-1/package.json')('playwright');
const ENHETER = [
  ['iphone13mini-safari', 812, 330, 3], ['iphone13mini-hemskarm', 812, 375, 3],
  ['iphone15-safari', 852, 353, 3], ['android', 915, 380, 2.625], ['ipad', 1180, 820, 2],
];
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
fs.mkdirSync('tools/out', { recursive: true });
const ut = [];
for (const [id, w, h, dpr] of ENHETER) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, isMobile: true, hasTouch: true });
  const fel = []; p.on('pageerror', (e) => fel.push(String(e)));
  await p.goto(url + (url.includes('?') ? '&' : '?') + 'test');
  await p.waitForFunction(() => window.__A && window.__A.scen, null, { timeout: 30000 });
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => { const c = document.querySelector('#c').getBoundingClientRect(); return { w: c.width, h: c.height }; });
  const knapp = r.h / 216 * 9;   // en vanlig knapp är ~9 spelpixlar hög
  ut.push({ id, skarm: `${w}×${h}`, spel: `${Math.round(r.w)}×${Math.round(r.h)}`, bredd: Math.round(r.w / w * 100) + ' %', hojd: Math.round(r.h / h * 100) + ' %', knappPx: Math.round(knapp), fel: fel.length });
  await p.screenshot({ path: `tools/out/${namn}-${id}.png` });
  await p.close();
}
console.table(ut);
await b.close();
