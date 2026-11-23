// Robot som spelar konsolspelets första varv precis som ett barn: NYTT BOLAG → KONSOLFABRIKEN → namn → STARTA, och
// sedan hela handledningen 1982 (bygg → anställ Vera och Lykke → designa konsolen → hårdvaran och PANG! → lansera →
// showen och reklamfilmen → KONSOLER → STUDIOS och första avtalet → forska TRE KANALER) med riktiga klick på de
// namngivna knapparna. Roboten följer Mio: varje steg kontrollerar att hon pekar på knappen (A.mioMal) innan den
// trycks. Skärmbilder i tools/out/konsol-*.png.
//   node tools/konsol-spela-test.mjs [--port N]     → slutar med ✓/✗-rad
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
const portArg = process.argv.indexOf('--port');
await new Promise((r) => srv.listen(portArg > 0 ? +process.argv[portArg + 1] : 0, '127.0.0.1', r));
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
const bild = async (namn) => { await page.locator('#spel').screenshot({ path: path.join(root, 'tools', 'out', `konsol-${String(++nr).padStart(2, '0')}-${namn}.png`) }); };
const kontroller = [];
const ok = (v, t) => { kontroller.push([v, t]); console.log((v ? '  ✓ ' : '  ✗ ') + t); return v; };
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
// läget i spelet och i handledningen (rubriken på steget Mio står på)
const lage = () => page.evaluate(async () => {
  const A = window.__A, G = A.G; if (!G) return { scen: A.scenNamn };
  const H = await import('/js/scener/handledning.js'), s = H.stegFor(G)[G.handledning.steg], pr = G.projekt[0];
  return { scen: A.scenNamn, dag: G.dag, lage: G.lage, fart: G.fart, bord: G.kontor.bord.filter(Boolean).length, roller: G.personal.map((p) => p.roll), projekt: G.projekt.map((p) => p.status),
    fas: pr?.fas, linje: pr?.design.linje, packin: pr?.design.packin?.titel, spelKval: pr?.spelKval ?? 0, produkter: G.produkter.length, veckor: G.produkter[0]?.veckor.length ?? 0,
    salda: G.bolag.totaltSalda, hemma: Math.round(G.produkter[0]?.installerade || 0), forfragningar: G.k?.forfragningar.length ?? 0, avtal: G.flaggor.avtal || 0,
    studiospel: (G.k?.spel || []).filter((x) => !x.egen).map((x) => x.titel), forsk: [...G.forskning.pagar.map((p) => p.nod), ...G.forskning.klara],
    steg: G.handledning.steg, av: G.handledning.av, klar: G.handledning.klar, rubrik: (typeof s?.rubrik === 'function' ? s.rubrik(A) : s?.rubrik) || null, mio: A.mioMal || null };
});
// Mio ska peka på knappen: vänta tills hon gör det, kontrollera och tryck
async function mio(namn, timeout = 6000) {
  const t0 = Date.now(); let pekar = null;
  while (Date.now() - t0 < timeout) { pekar = await page.evaluate(() => window.__A.mioMal || null); if (pekar === namn) break; await vanta(100); }
  ok(pekar === namn, `Mio pekar på ${namn}` + (pekar === namn ? '' : ` (pekar på ${pekar})`));
  return klicka(namn);
}
const steg = async () => (await lage()).rubrik;
// väntar (högst några sekunder) tills Mio står på steget med rubriken
async function vantaSteg(rubrik, timeout = 4000) {
  const t0 = Date.now(); let r = null;
  while (Date.now() - t0 < timeout) { r = await steg(); if (r === rubrik) return true; await vanta(100); }
  return false;
}
// Väntar på ett villkor medan tiden går. Studiornas kort (SENARE) och andra kort med OK stängs på vägen;
// kortet BYGGET ÄR KLART (TILL LANSERINGEN) låter roboten vara – det är nästa steg.
let studiokort = 0;
async function medanTidenGar(villkor, timeout = 120000, arg = null) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    if (await page.evaluate(villkor, arg)) return true;
    const kort = await page.evaluate(() => { const m = window.__U.mark; return m['stor-forfragan'] ? 'studio' : m['stor-lansera'] ? 'klar' : m['stor-ok'] ? 'ok' : null; });
    if (kort === 'studio') { if (!studiokort++) await bild('studiokortet'); await klicka('stor-senare'); }
    else if (kort === 'ok') await klicka('stor-ok');
    await vanta(150);
  }
  throw new Error('tiden tog slut (' + villkor.toString().slice(0, 90) + ')');
}

try {
  // ---------- startskärmen: NYTT BOLAG → KONSOLFABRIKEN → namn → STARTA ----------
  await vanta(600); await bild('start');
  await klicka('start-nytt'); await vanta(200); await bild('startval');
  await klicka('start-konsol'); await klicka('start-namnfalt');
  await page.keyboard.type('Robotkonsol AB'); await page.keyboard.press('Enter');
  await klicka('start-skapa'); await vanta(400); await bild('valkomst');
  let L = await lage();
  ok(L.scen === 'kontor' && L.lage === 'konsol', 'nytt konsolbolag startar i kontoret');
  ok(await page.evaluate(() => window.__A.G.dag === window.__A.G.startDag && new Date(Date.UTC(2007, 0, 1) + window.__A.G.dag * 864e5).getUTCFullYear() === 1982), 'datumet är 1 januari 1982');
  ok(L.steg === 0 && !L.av, 'välkomstrutan visas (tiden står still)');
  await klicka('handledning-start');

  // ---------- BYGG ----------
  await mio('flik-bygg'); await bild('bygg');
  await mio('mobel-fallbord'); await mio('plats-bord-0'); await mio('plats-bord-1');
  ok((await lage()).bord === 2, 'två fällbord står i garaget');
  await mio('bygg-klar');

  // ---------- TEAM: Vera (forskare) och Lykke (spelutvecklare) ----------
  await mio('flik-personal'); await vanta(200); await bild('personal');
  await mio('anstall-0'); await mio('anstall-0');
  L = await lage();
  ok(L.roller.includes('forskare') && L.roller.includes('spelutvecklare'), `Vera och Lykke är anställda (${L.roller.join(', ')})`);

  // ---------- DESIGN ----------
  await mio('flik-design'); await vanta(300); await bild('design');
  ok((await steg()) === 'DIN FÖRSTA KONSOL', 'Mio säger DIN FÖRSTA KONSOL i designern');
  await mio('design-hoppa'); await vanta(200); await bild('granskning');
  await mio('design-starta'); await vanta(300);
  L = await lage();
  ok(L.projekt[0] === 'bygger' && L.linje === 'konsol' && L.scen === 'kontor', 'konsolbygget startar och man hamnar i kontoret');
  ok(L.packin === 'PANG!', `PANG! ligger i lådan (${L.packin})`);

  // ---------- LANSERA: spola fram, hårdvaran, sedan PANG! ----------
  ok((await steg()) === 'SPOLA FRAM TIDEN', 'Mio säger SPOLA FRAM TIDEN');
  await vanta(300); await bild('spola');
  await mio('fart-4');
  await medanTidenGar(async () => { const H = await import('/js/scener/handledning.js'), G = window.__A.G; return H.stegFor(G)[G.handledning.steg]?.rubrik === 'FÖRST HÅRDVARAN'; }, 10000);
  ok(true, 'steget FÖRST HÅRDVARAN (blå och röda prickar)');
  await vanta(1500); await bild('hardvaran');
  await medanTidenGar(() => window.__A.G.projekt[0]?.fas === 'mjukvara' || window.__A.G.projekt[0]?.status === 'klar');
  await vanta(150);
  L = await lage();
  ok(L.fas === 'mjukvara' && L.projekt[0] === 'bygger', 'hårdvaran är klar – Lykke gör PANG!');
  ok(L.rubrik === 'SEDAN PANG!', `Mio förklarar spelet i lådan (${L.rubrik})`);
  await vanta(1200); await bild('pang');
  await klicka('fart-8');
  // bygget klart: kortet "PIXELBOX 1 ÄR KLAR!" stoppar tiden och har TILL LANSERINGEN
  await medanTidenGar(() => window.__A.G.projekt[0]?.status === 'klar' && !!window.__U.mark['stor-lansera']);
  L = await lage();
  ok(L.spelKval > 0, `PANG! fick gröna prickar (${L.spelKval})`);
  ok(L.rubrik === 'LANSERA!', 'Mio säger LANSERA!');
  await vanta(300); await bild('klar');
  await klicka('stor-lansera'); await vanta(300); await bild('lanseringsdag');
  await mio('lansera'); await vanta(500);
  ok((await lage()).produkter === 1, 'konsolen är lanserad');

  // ---------- SHOWEN och reklamfilmen ----------
  await vanta(2500); await bild('show');
  await page.keyboard.press('Space'); await vanta(400); await bild('show-slut');
  ok(await page.evaluate(() => window.__A.mioMal === 'show-klar' && !window.__A.mioRuta), 'i showen pekar Mio bara på TILL KONTORET (ingen ruta)');
  await klicka('show-reklam'); await vanta(1800); await bild('reklamfilm');
  L = await lage();
  ok(L.scen === 'reklam' && L.rubrik === 'SHOWEN' && await page.evaluate(() => !window.__A.mioRuta && !window.__A.mioMal), 'reklamfilmen spelas utan Mio (steget väntar)');
  await klicka('reklam-hoppa'); await vantaSteg('FÖRSTA VECKAN');
  L = await lage();
  ok(L.scen === 'kontor' && L.rubrik === 'FÖRSTA VECKAN', `efter filmen: kontoret och FÖRSTA VECKAN (${L.scen}, ${L.rubrik})`);

  // ---------- FÖRSTA VECKAN i KONSOLER ----------
  await mio('flik-telefoner'); await vanta(300);
  if ((await lage()).fart === 0) await mio('fart-1');
  await klicka('fart-8');
  await medanTidenGar(() => window.__A.G.produkter[0].veckor.length >= 1 && window.__A.scenNamn === 'telefoner');
  await vanta(200); await bild('konsoler');
  L = await lage();
  ok(L.salda > 0 && L.hemma > 0, `konsolen säljer (${L.salda} sålda, ${L.hemma} hemma första veckan)`);

  // ---------- STUDIOS: första förfrågan och JA ----------
  await medanTidenGar(async () => { const H = await import('/js/scener/handledning.js'), G = window.__A.G; return H.stegFor(G)[G.handledning.steg]?.kap === 'STUDIOS'; }, 10000);
  ok(true, 'kapitlet STUDIOS börjar');
  // vänta på en förfrågan (kortet SENARE stängs) – studiorna knackar på den 1:a varje månad
  await medanTidenGar(() => window.__A.G.k.forfragningar.length > 0 && !window.__U.mark['stor-forfragan']);
  ok(studiokort > 0, `en studio knackade på med ett stort kort (${studiokort} kort)`);
  // lugnare fart, så att nästa månads kort inte hinner komma mitt i svaret
  await klicka('fart-1'); await vanta(200);
  // från KONSOLER pekar Mio på fliken STUDIOS (i kontoret på den blinkande knappen) – barnet följer henne
  const vart = await page.evaluate(() => window.__A.mioMal);
  ok(vart === 'flik-studios' || vart === 'kontor-studios', `Mio pekar på vägen till STUDIOS (${vart})`);
  await bild('studios-vagen');
  await mio(vart); await vanta(300); await bild('studios');
  ok((await steg()) === 'SÄG JA!', 'Mio säger SÄG JA! i STUDIOS');
  await mio('studios-ja-0'); await vanta(400); await bild('avtal');
  L = await lage();
  ok(L.avtal >= 1 && L.studiospel.length >= 1, `första avtalet: ${L.studiospel.join(', ')}`);
  ok(L.rubrik === 'UPPFINN NY TEKNIK', 'nästa kapitel: VÄX');

  // ---------- VÄX: forska TRE KANALER ----------
  await mio('flik-forskning'); await vanta(300);
  await mio('redo-kdel-ljud-3kan'); await mio('starta-forskning'); await vanta(300); await bild('forskning');
  L = await lage();
  ok(L.forsk.includes('kdel-ljud-3kan'), 'forskningen i TRE KANALER är startad');
  ok(L.klar === true, 'handledningen är klar (17 av 17)');

  // spara och ladda om – pausa först, annars hinner dagen gå mellan läsningen och sparningen
  const sparadDag = await page.evaluate(() => { window.__A.pausa(); window.__A.spara(); return window.__A.G.dag; });
  await page.reload(); await page.waitForFunction(() => window.__A && window.__A.scen, null, { timeout: 15000 }); await vanta(400);
  await bild('start-igen');
  await klicka('start-fortsatt'); await vanta(300);
  const L2 = await lage();
  ok(L2.lage === 'konsol' && L2.produkter === 1 && L2.dag === sparadDag && L2.avtal >= 1, `sparningen laddas som konsolbolag med samma dag, konsol och avtal (dag ${L2.dag} = ${sparadDag})`);
  await bild('laddat');
} catch (e) { fel.push(String(e.stack || e)); }

await browser.close(); srv.close();
for (const f of fel) console.log('  ! ' + f.split('\n')[0]);
const dåliga = kontroller.filter(([v]) => !v).length + fel.length;
console.log(dåliga ? `✗ konsol-spela-test: ${dåliga} fel` : `✓ konsol-spela-test: konsolhandledningen 1982 går att spela med riktiga klick till första avtalet (${kontroller.length} kontroller)`);
process.exit(dåliga ? 1 : 0);
