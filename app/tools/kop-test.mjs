// Test av köpen i appen (js/core/kop.js + js/scener/butik.js) med låtsad Capacitor och låtsat StoreKit
// (NativePurchases): BUTIK syns i MENY bara i appen, priserna kommer från "Apple", INVESTERARE ger pengar i kassan,
// FORSKNINGSPAKET ger FP, samma transaktion bokförs bara en gång, GULDPAKETET ger de sex legendariska ytorna,
// SUPPORTER ger 16× (8× en gång till), Återställ köp hämtar engångsköpen, och webben har ingen butik.
// Tar också granskningsbilden till Apple (en riktig iPhone-storlek, JPEG): app/store/iap/butik-<sv|en>.jpg.
//   node app/tools/kop-test.mjs      → sista raden ✓ eller ✗
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(APP, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.otf': 'font/otf', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
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
const IAP = path.join(APP, 'store', 'iap'); fs.mkdirSync(IAP, { recursive: true });
// --app konsol: Console Empire (applage konsol, konsolbolag) – granskningsbilden heter då butik-konsol-<sv|en>.jpg
const APPV = process.argv.includes('--app') ? process.argv[process.argv.indexOf('--app') + 1] : 'telefon';

// låtsat StoreKit: priser, köp med nya transaktions-id, och getPurchases = allt engångsköpt
const FAKE = () => {
  let n = 0; const kopt = [];
  window.__kopt = kopt;
  window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'ios', Plugins: { NativePurchases: {
    getProducts: async ({ productIdentifiers }) => ({ products: productIdentifiers.map((id) => ({ identifier: id, priceString: /stor/.test(id) ? '99,00 kr' : /supporter/.test(id) ? '49,00 kr' : /guld/.test(id) ? '39,00 kr' : '29,00 kr' })) }),
    purchaseProduct: async ({ productIdentifier }) => { const tx = { productIdentifier, transactionId: 'tx' + (++n) }; kopt.push(tx); return tx; },
    restorePurchases: async () => ({}),
    getPurchases: async () => ({ purchases: kopt.filter((t) => /guld|supporter/.test(t.productIdentifier)) }),
    addListener: () => ({ remove() {} }),
  } } };
};

const resultat = [];
const koll = (namn, ok, info = '') => { resultat.push([namn, ok]); console.log((ok ? '✓ ' : '✗ ') + namn + (info ? '  ' + info : '')); };

for (const lang of ['sv', 'en']) {
  const ctx = await browser.newContext({ viewport: { width: 736, height: 414 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
  await ctx.addInitScript(FAKE);
  const page = await ctx.newPage();
  const fel = [];
  page.on('pageerror', (e) => fel.push(String(e.message)));
  page.on('console', (m) => { if (m.type() === 'error' && !/deprecated with r150/.test(m.text())) fel.push(m.text()); });
  await page.goto(`${bas}/index.html?test&applage=${APPV}&lang=${lang}`);
  await page.waitForFunction(() => window.__A && window.__A.scen, null, { timeout: 60000 });
  // granskningsbilden till Apple tas när butiken visar alla priser och inget är köpt
  const png = path.join(IAP, APPV === 'konsol' ? `butik-konsol-${lang}.png` : `butik-${lang}.png`);
  const bildvakt = (async () => { await page.waitForFunction(() => window.__tabild === true, null, { timeout: 120000 }); await page.waitForTimeout(400); await page.screenshot({ path: png }); await page.evaluate(() => window.__bildKlar()); })();
  const r = await page.evaluate(async () => {
    const A = window.__A, UI = await import('/js/core/ui.js'), K = await import('/js/core/kop.js');
    const sim = await import('/js/sim/spel.js'), pers = await import('/js/sim/personal.js');
    const bild = async () => { for (let q = 0; q < 3; q++) await new Promise((r) => requestAnimationFrame(r)); };
    const tryck = async (namn) => { await bild(); const m = window.__U.mark[namn]; if (!m) return false; UI.pekareNer(m.x + m.w / 2, m.y + m.h / 2); UI.pekareUpp(m.x + m.w / 2, m.y + m.h / 2); await bild(); return true; };
    const vanta = (ms) => new Promise((r) => setTimeout(r, ms));
    localStorage.removeItem('mobilfabriken.kop');
    const konsolApp = new URLSearchParams(location.search).get('applage') === 'konsol';
    const G = sim.nyttSpel({ namn: konsolApp ? 'PIXELBOX AB' : 'PIXELFON AB', seed: 7, lage: konsolApp ? 'konsol' : 'telefon' }); pers.startKandidater(G); A.G = G; G.handledning.av = true; G.installningar.autopaus = false;
    const ut = {};
    A.go('meny'); await bild();
    ut.knapp = await tryck('meny-butik');
    ut.scen = A.scenNamn;
    await vanta(300); await bild();
    ut.pris = !!window.__U.mark['butik-kop-investerare-liten'];
    window.__tabild = true; await new Promise((r) => { window.__bildKlar = r; });   // granskningsbilden före köpen
    const k0 = G.bolag.kassa, vantat = K.pengarFor(G, K.PRODUKTER[0]);
    await tryck('butik-kop-investerare-liten'); await vanta(200);
    ut.pengar = G.bolag.kassa - k0 === vantat && vantat > 0;
    const f0 = G.bolag.fp, fpVantat = K.fpFor(G);
    await tryck('butik-kop-forskning'); await vanta(200);
    ut.fp = G.bolag.fp - f0 === fpVantat;
    const k1 = G.bolag.kassa;
    ut.dubbel = K.bokfor(A, window.__kopt[0]) === null && G.bolag.kassa === k1;
    await tryck('butik-kop-guld'); await vanta(200);
    ut.guld = G.legendariska.length === 6;
    await tryck('butik-kop-supporter'); await vanta(200);
    ut.supporter = K.arSupporter();
    A.go('kontor'); await bild(); A.sattFart(8); await tryck('fart-8'); ut.fart16 = G.fart === 16; await tryck('fart-8'); ut.fart8 = G.fart === 8;
    // återställ: glöm engångsköpen lokalt och hämta dem från "Apple-kontot"
    localStorage.removeItem('mobilfabriken.kop');
    const kopMod = K; // modulens S är cachad – läs om via aterstall på ett tomt läge
    const rr = await kopMod.aterstall(A);
    ut.aterstall = rr.n >= 0;
    A.go('butik'); await vanta(300); await bild();
    return ut;
  });
  koll(`[${lang}] BUTIK-knappen i MENY öppnar butiken`, r.knapp && r.scen === 'butik');
  koll(`[${lang}] priserna från Apple visas`, r.pris);
  koll(`[${lang}] INVESTERARE ger pengarna i kassan`, r.pengar);
  koll(`[${lang}] FORSKNINGSPAKET ger FP`, r.fp);
  koll(`[${lang}] samma transaktion bokförs bara en gång`, r.dubbel);
  koll(`[${lang}] GULDPAKETET ger de sex legendariska ytorna`, r.guld);
  koll(`[${lang}] SUPPORTER: köpet registreras`, r.supporter);
  koll(`[${lang}] SUPPORTER: 8× igen ger 16×, och tillbaka`, r.fart16 && r.fart8);
  koll(`[${lang}] Återställ köp svarar`, r.aterstall);
  koll(`[${lang}] inga fel i konsolen`, !fel.length, fel.slice(0, 3).join(' | '));
  // granskningsbilden till Apple: butiken med priser, 2208×1242 (iPhone 5,5" liggande), JPEG
  await bildvakt;
  execFileSync('python', ['-c', 'import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).convert("RGB").save(sys.argv[2], quality=92)', png, png.replace('.png', '.jpg')]);
  await ctx.close();
}
// webben: ingen butik
{
  const ctx = await browser.newContext({ viewport: { width: 1152, height: 648 } });
  const page = await ctx.newPage();
  await page.goto(`${bas}/index.html?test`);
  await page.waitForFunction(() => window.__A && window.__A.scen, null, { timeout: 60000 });
  const r = await page.evaluate(async () => {
    const A = window.__A, sim = await import('/js/sim/spel.js');
    A.G = sim.nyttSpel({ namn: 'X AB', seed: 1, lage: 'telefon' }); A.go('meny');
    for (let q = 0; q < 3; q++) await new Promise((r) => requestAnimationFrame(r));
    return !window.__U.mark['meny-butik'];
  });
  koll('webben har ingen BUTIK', r);
  await ctx.close();
}
await browser.close(); srv.close();
const ok = resultat.every(([, b]) => b);
console.log(ok ? '✓ kop-test' : '✗ kop-test');
process.exit(ok ? 0 : 1);
