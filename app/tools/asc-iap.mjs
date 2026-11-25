// Smartphone Empires köp i App Store Connect via App Store Connect API (nyckeln Codemagic, App Manager) – kopierad
// från snabbfilen/app/tools/asc-iap.mjs (Pixelcity). Spelets sida av köpen: js/core/kop.js + js/scener/butik.js.
// Nyckelfilen läses bara här för att signera anropen – den skrivs aldrig ut.
//   node asc-iap.mjs lista              vad som finns: produkter, språk, pris, tillgänglighet, bild
//   node asc-iap.mjs prispunkter        Apples prispunkter i SEK för första produkten (nära våra priser)
//   node asc-iap.mjs allt               skapa det som saknas: produkter, språk, pris, länder, bild, Review Notes
import fs from 'fs';
import crypto from 'crypto';

const ISS = '08e19ca3-bbeb-4a09-8096-06f1e3eb6e4b', KID = '94H7H2CY53', APP = '6839119728';   // Smartphone Empire
const KEYFILE = 'C:/Users/palss/Downloads/AuthKey_94H7H2CY53.p8';
const PNG = 'D:/GamesProjects/mobilfabriken/app/store/iap/butik-en.jpg';   // node app/tools/kop-test.mjs tar den (2208×1242 JPEG)
const key = fs.readFileSync(KEYFILE, 'utf8');
const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
function jwt() {
  const now = Math.floor(Date.now() / 1000);
  const h = b64({ alg: 'ES256', kid: KID, typ: 'JWT' }), p = b64({ iss: ISS, iat: now, exp: now + 1200, aud: 'appstoreconnect-v1' });
  const sig = crypto.sign('sha256', Buffer.from(`${h}.${p}`), { key, dsaEncoding: 'ieee-p1363' }).toString('base64url');
  return `${h}.${p}.${sig}`;
}
const API = 'https://api.appstoreconnect.apple.com';
async function call(method, path, body) {
  const r = await fetch(path.startsWith('http') ? path : API + path, { method, headers: { Authorization: `Bearer ${jwt()}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const txt = await r.text();
  let j = null; try { j = JSON.parse(txt); } catch { /* tomt svar */ }
  if (!r.ok) { const e = new Error(`${method} ${path} → ${r.status}: ${txt.slice(0, 700)}`); e.status = r.status; throw e; }
  return j;
}
async function alla(path) { const out = []; let next = path; while (next) { const j = await call('GET', next); out.push(...(j.data || [])); next = j.links?.next || null; } return out; }
const tyst404 = (p) => p.catch((e) => { if (e.status === 404) return null; throw e; });

const REVIEW = 'Open MENU (top right ≡) → SHOP. The shop lists the products with StoreKit prices. INVESTOR and BIG INVESTOR are consumables that add in-game cash to the company that is open; RESEARCH PACK is a consumable that adds in-game research points. The amounts are shown in the shop before purchase. GOLD PACK (non-consumable) unlocks six cosmetic legendary finishes in the phone designer for all companies. SUPPORTER (non-consumable) unlocks 16× game speed (tap the 8× speed button again). RESTORE in the same screen restores the non-consumables. Nothing is random. The shop only exists in the iOS app, never on the web version, and is only opened by the player from the menu.';
const SKU = 'io.eightbitcat.mobilfabriken.';
const LOC = { sv: 'sv', en: 'en-US' };
// namn ≤ 30, beskrivning ≤ 45 tecken. Priser i SEK (Sverige är basland), Apple väljer närmaste prispunkt.
const PRODUKTER = [
  { namn: 'Investerare', sku: SKU + 'investerare.liten', typ: 'CONSUMABLE', pris: 29, loc: {
    sv: ['Investerare', 'Pengar rakt i kassan i ditt bolag.'], en: ['Investor', 'Cash straight into your company.'] } },
  { namn: 'Stor investerare', sku: SKU + 'investerare.stor', typ: 'CONSUMABLE', pris: 99, loc: {
    sv: ['Stor investerare', 'Mycket pengar rakt i kassan.'], en: ['Big Investor', 'A lot of cash straight into your company.'] } },
  { namn: 'Forskningspaket', sku: SKU + 'forskning.paket', typ: 'CONSUMABLE', pris: 29, loc: {
    sv: ['Forskningspaket', 'Forskningspoäng till nästa uppfinning.'], en: ['Research Pack', 'Research points for your next invention.'] } },
  { namn: 'Guldpaketet', sku: SKU + 'guld', typ: 'NON_CONSUMABLE', pris: 39, loc: {
    sv: ['Guldpaketet', 'Sex legendariska ytor i alla bolag.'], en: ['Gold Pack', 'Six legendary finishes in every company.'] } },
  { namn: 'Supporter', sku: SKU + 'supporter', typ: 'NON_CONSUMABLE', pris: 49, loc: {
    sv: ['Supporter', '16× fart och ett stort tack.'], en: ['Supporter', '16× game speed and a big thank you.'] } },
];
for (const p of PRODUKTER) for (const [l, [n, d]] of Object.entries(p.loc)) { if (n.length > 30 || d.length > 45) throw new Error(`för lång text (${p.sku} ${l}): "${n}" ${n.length}/30, "${d}" ${d.length}/45`); }

const befintliga = () => alla(`/v1/apps/${APP}/inAppPurchasesV2?limit=200`);
async function status(iap) {
  const id = iap.id;
  const loc = await alla(`/v2/inAppPurchases/${id}/inAppPurchaseLocalizations?limit=50`);
  const sched = await tyst404(call('GET', `/v2/inAppPurchases/${id}/iapPriceSchedule`));
  const avail = await tyst404(call('GET', `/v2/inAppPurchases/${id}/inAppPurchaseAvailability`));
  const bild = await tyst404(call('GET', `/v2/inAppPurchases/${id}/appStoreReviewScreenshot`));
  let pris = '–', lander = '–';
  if (sched?.data) {
    const mp = await call('GET', `/v1/inAppPurchasePriceSchedules/${sched.data.id}/manualPrices?include=inAppPurchasePricePoint&limit=5`);
    const bas = await tyst404(call('GET', `/v1/inAppPurchasePriceSchedules/${sched.data.id}/baseTerritory`));
    const pp = (mp.included || []).find((x) => x.type === 'inAppPurchasePricePoints');
    pris = `${pp?.attributes?.customerPrice ?? 'satt'} (${bas?.data?.id || '?'})`;
  }
  if (avail?.data) {
    const t = await alla(`/v1/inAppPurchaseAvailabilities/${avail.data.id}/availableTerritories?limit=200`);
    lander = t.length + (avail.data.attributes.availableInNewTerritories ? '+nya' : '');
  }
  return { sku: iap.attributes.productId, namn: iap.attributes.name, typ: iap.attributes.inAppPurchaseType, state: iap.attributes.state, sprak: loc.map((l) => l.attributes.locale).sort().join(' ') || '–', pris, lander, bild: bild?.data ? (bild.data.attributes.assetDeliveryState?.state || 'finns') : '–', note: iap.attributes.reviewNote ? 'ja' : '–', id };
}

// Laddar upp en granskningsbild (jpg/png) till en produkt och väntar på Apples besked (COMPLETE eller FAILED + fel).
async function laddaUppBild(id, fil) {
  const buf = fs.readFileSync(fil), fileName = fil.split('/').pop();
  const r = await call('POST', '/v1/inAppPurchaseAppStoreReviewScreenshots', { data: { type: 'inAppPurchaseAppStoreReviewScreenshots', attributes: { fileName, fileSize: buf.length }, relationships: { inAppPurchaseV2: { data: { type: 'inAppPurchases', id } } } } });
  for (const op of r.data.attributes.uploadOperations) {
    const h = {}; for (const x of op.requestHeaders) h[x.name] = x.value;
    const u = await fetch(op.url, { method: op.method, headers: h, body: buf.subarray(op.offset, op.offset + op.length) });
    if (!u.ok) throw new Error(`uppladdningen: ${u.status} ${await u.text()}`);
  }
  await call('PATCH', `/v1/inAppPurchaseAppStoreReviewScreenshots/${r.data.id}`, { data: { type: 'inAppPurchaseAppStoreReviewScreenshots', id: r.data.id, attributes: { uploaded: true, sourceFileChecksum: crypto.createHash('md5').update(buf).digest('hex') } } });
  for (let i = 0; i < 20; i++) {
    await new Promise((res) => setTimeout(res, 3000));
    const j = await call('GET', `/v1/inAppPurchaseAppStoreReviewScreenshots/${r.data.id}`);
    const st = j.data.attributes.assetDeliveryState;
    if (st?.state === 'COMPLETE') return `COMPLETE (${fileName})`;
    if (st?.state === 'FAILED') return `FAILED ${JSON.stringify(st.errors)} (${fileName})`;
  }
  return 'väntar fortfarande';
}

const cmd = process.argv[2] || 'lista';
if (cmd === 'bild') {   // node asc-iap.mjs bild <fil> [del av produkt-ID] – byter ut (misslyckad) granskningsbild
  const fil = process.argv[3], filt = process.argv[4] || '';
  for (const iap of (await befintliga()).filter((x) => x.attributes.productId.includes(filt))) {
    const bild = await tyst404(call('GET', `/v2/inAppPurchases/${iap.id}/appStoreReviewScreenshot`));
    if (bild?.data) { await call('DELETE', `/v1/inAppPurchaseAppStoreReviewScreenshots/${bild.data.id}`); console.log(`- gammal bild borttagen (${bild.data.attributes.assetDeliveryState?.state})`); }
    console.log(iap.attributes.productId, await laddaUppBild(iap.id, fil));
  }
}
if (cmd === 'lista') {
  const list = await befintliga();
  for (const iap of list) console.log(await status(iap));
  if (!list.length) console.log('(inga produkter än)');
}
if (cmd === 'prispunkter') {
  const list = await befintliga();
  if (!list.length) throw new Error('ingen produkt att läsa prispunkter för');
  const pts = await alla(`/v2/inAppPurchases/${list[0].id}/pricePoints?filter[territory]=SWE&limit=200`);
  const pr = pts.map((p) => +p.attributes.customerPrice).sort((a, b) => a - b);
  console.log(`${pr.length} prispunkter i SEK för ${list[0].attributes.productId}. De under 150 kr:`, pr.filter((x) => x <= 150).join(', '));
}
if (cmd === 'allt') {
  const list = await befintliga();
  const terr = await alla('/v1/territories?limit=200');
  const png = fs.readFileSync(PNG), md5 = crypto.createHash('md5').update(png).digest('hex');
  for (const P of PRODUKTER) {
    let iap = list.find((x) => x.attributes.productId === P.sku);
    if (!iap) {
      const j = await call('POST', '/v2/inAppPurchases', { data: { type: 'inAppPurchases', attributes: { name: P.namn, productId: P.sku, inAppPurchaseType: P.typ, reviewNote: REVIEW }, relationships: { app: { data: { type: 'apps', id: APP } } } } });
      iap = j.data; console.log(`+ skapad: ${P.sku} (${iap.id})`);
    } else if (!iap.attributes.reviewNote) {   // (det Carl redan fyllt i rörs inte)
      await call('PATCH', `/v2/inAppPurchases/${iap.id}`, { data: { type: 'inAppPurchases', id: iap.id, attributes: { reviewNote: REVIEW } } });
      console.log(`~ Review Notes: ${P.sku}`);
    }
    const id = iap.id;
    // språken
    const har = await alla(`/v2/inAppPurchases/${id}/inAppPurchaseLocalizations?limit=50`);
    for (const [l, [name, description]] of Object.entries(P.loc)) {
      const locale = LOC[l], fin = har.find((x) => x.attributes.locale === locale);
      if (!fin) { await call('POST', '/v1/inAppPurchaseLocalizations', { data: { type: 'inAppPurchaseLocalizations', attributes: { locale, name, description }, relationships: { inAppPurchaseV2: { data: { type: 'inAppPurchases', id } } } } }); console.log(`  + ${locale}: ${name}`); }
      else if (fin.attributes.name !== name || fin.attributes.description !== description) console.log(`  (${locale} finns redan: "${fin.attributes.name}" / "${fin.attributes.description}" – lämnas)`);
    }
    // priset: Sverige som basland, Apples prispunkt närmast vårt pris
    const sched = await tyst404(call('GET', `/v2/inAppPurchases/${id}/iapPriceSchedule`));
    if (!sched?.data) {
      const pts = await alla(`/v2/inAppPurchases/${id}/pricePoints?filter[territory]=SWE&limit=200`);
      const pt = pts.map((p) => ({ id: p.id, pris: +p.attributes.customerPrice })).sort((a, b) => Math.abs(a.pris - P.pris) - Math.abs(b.pris - P.pris))[0];
      if (!pt) throw new Error(`inga prispunkter för ${P.sku}`);
      await call('POST', '/v1/inAppPurchasePriceSchedules', { data: { type: 'inAppPurchasePriceSchedules', relationships: { inAppPurchase: { data: { type: 'inAppPurchases', id } }, baseTerritory: { data: { type: 'territories', id: 'SWE' } }, manualPrices: { data: [{ type: 'inAppPurchasePrices', id: '${p0}' }] } } }, included: [{ type: 'inAppPurchasePrices', id: '${p0}', attributes: { startDate: null }, relationships: { inAppPurchasePricePoint: { data: { type: 'inAppPurchasePricePoints', id: pt.id } } } }] });
      console.log(`  + pris ${pt.pris} kr${pt.pris !== P.pris ? ` (närmaste Apple-pris till ${P.pris})` : ''}`);
    }
    // alla länder, även nya
    const avail = await tyst404(call('GET', `/v2/inAppPurchases/${id}/inAppPurchaseAvailability`));
    if (!avail?.data) { await call('POST', '/v1/inAppPurchaseAvailabilities', { data: { type: 'inAppPurchaseAvailabilities', attributes: { availableInNewTerritories: true }, relationships: { inAppPurchase: { data: { type: 'inAppPurchases', id } }, availableTerritories: { data: terr.map((t) => ({ type: 'territories', id: t.id })) } } } }); console.log(`  + ${terr.length} länder`); }
    // granskningsbilden
    const bild = await tyst404(call('GET', `/v2/inAppPurchases/${id}/appStoreReviewScreenshot`));
    if (!bild?.data) console.log('  + granskningsbild:', await laddaUppBild(id, PNG));
  }
  console.log('--- läget nu:');
  for (const iap of await befintliga()) console.log(await status(iap));
}
