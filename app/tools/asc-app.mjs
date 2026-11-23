// Mobilfabriken i App Store Connect via App Store Connect API (nyckeln "Codemagic", App Manager – samma som
// snabbfilen/app/tools/asc-iap.mjs). Själva appen måste Carl skapa i App Store Connect (New App) – det finns inget
// API för det. Allt därefter fylls i här. Texterna läses ur app/appstore.md (kodblocken), så den filen är källan.
//   node app/tools/asc-app.mjs koll        finns appen? versioner, språk, bygge, pris, granskning, åldersgräns
//   node app/tools/asc-app.mjs info        App Information: kategorier, innehållsrättigheter, åldersgräns 4+, namn/undertitel/integritets-URL
//   node app/tools/asc-app.mjs version     iOS 1.0: copyright, manuell release, beskrivning, nyckelord, promo, support-/marknads-URL
//   node app/tools/asc-app.mjs bilder      skärmbilderna i app/store/skarmbilder (iPhone 6,3" → APP_IPHONE_61, iPad 13" → APP_IPAD_PRO_3GEN_129)
//   node app/tools/asc-app.mjs granskning  App Review: kontakt (kopieras från Pixelcity) + Notes
//   node app/tools/asc-app.mjs pris        gratis, alla länder
//   node app/tools/asc-app.mjs bygge       koppla senaste bygget i ASC till 1.0
//   node app/tools/asc-app.mjs allt        info + version + bilder + granskning + pris (+ bygge om det finns)
//   node app/tools/asc-app.mjs skicka      Add for Review – körs BARA när Carl sagt till
//   --bundle <id>   annan app (t.ex. io.eightbitcat.pixelcity) – bara för koll
// App Privacy ("No, we do not collect data") går inte att sätta via API:t – ett klick för Carl.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ISS = '08e19ca3-bbeb-4a09-8096-06f1e3eb6e4b', KID = '94H7H2CY53';
const KEYFILE = 'C:/Users/palss/Downloads/AuthKey_94H7H2CY53.p8';
const PIXELCITY = '6818844405';
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const BUNDLE = opt('bundle', 'io.eightbitcat.mobilfabriken');
const cmd = args.find((a) => !a.startsWith('--') && a !== opt('bundle', '')) || 'koll';

const key = fs.readFileSync(KEYFILE, 'utf8');
const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
function jwt() {
  const now = Math.floor(Date.now() / 1000);
  const h = b64({ alg: 'ES256', kid: KID, typ: 'JWT' }), p = b64({ iss: ISS, iat: now, exp: now + 1200, aud: 'appstoreconnect-v1' });
  return `${h}.${p}.${crypto.sign('sha256', Buffer.from(`${h}.${p}`), { key, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;
}
const API = 'https://api.appstoreconnect.apple.com';
async function call(method, p, body) {
  const r = await fetch(p.startsWith('http') ? p : API + p, { method, headers: { Authorization: `Bearer ${jwt()}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const txt = await r.text(); let j = null; try { j = JSON.parse(txt); } catch { /* tomt */ }
  if (!r.ok) { const e = new Error(`${method} ${p} → ${r.status}: ${txt.slice(0, 900)}`); e.status = r.status; throw e; }
  return j;
}
async function alla(p) { const out = []; let next = p; while (next) { const j = await call('GET', next); out.push(...(j.data || [])); next = j.links?.next || null; } return out; }
const tyst404 = (pr) => pr.catch((e) => { if (e.status === 404) return null; throw e; });
const rel = (type, id) => ({ data: { type, id } });

// ---------- texterna ur app/appstore.md ----------
const MD = fs.readFileSync(path.join(APP, 'appstore.md'), 'utf8');
const block = (rubrik) => { const m = MD.match(new RegExp(`\\*\\*${rubrik}\\*\\*[^\\n]*\\n\`\`\`\\n([\\s\\S]*?)\\n\`\`\``)); if (!m) throw new Error(`hittar inte kodblocket efter **${rubrik}** i appstore.md`); return m[1].trim(); };
const TEXT = {
  namn: 'Mobilfabriken',
  undertitel: (MD.match(/\*\*Subtitle\*\*[^`]*`([^`]+)`/) || [])[1] || 'Konsoler, mobiler, imperium',
  integritet: 'https://8bitcat.github.io/mobilfabriken/integritet.html',
  promo: block('Promotional Text'), beskrivning: block('Description'), nyckelord: block('Keywords'),
  support: block('Support URL'), marknad: block('Marketing URL'), copyright: block('Copyright'), noter: block('Notes'),
};
const granser = [['namn', 30], ['undertitel', 30], ['promo', 170], ['beskrivning', 4000], ['nyckelord', 100], ['noter', 4000]];
for (const [k, max] of granser) if (TEXT[k].length > max) throw new Error(`${k} är ${TEXT[k].length} tecken (högst ${max})`);

// ---------- appen, info, version ----------
async function appen() {
  const j = await call('GET', `/v1/apps?filter[bundleId]=${BUNDLE}`);
  const a = (j.data || []).find((d) => d.attributes.bundleId === BUNDLE);
  if (!a) throw new Error(`Ingen app med bundle-id ${BUNDLE} i App Store Connect än – Carl: My Apps → ＋ → New App (namn Mobilfabriken, svenska, ${BUNDLE}, SKU mobilfabriken)`);
  return a;
}
async function infoAv(app) {
  const infos = await alla(`/v1/apps/${app.id}/appInfos?limit=10`);
  return infos.find((i) => /PREPARE_FOR_SUBMISSION|DEVELOPER_REJECTED|REJECTED|WAITING|READY_FOR_REVIEW/.test(i.attributes.state || i.attributes.appStoreState || '')) || infos[0];
}
async function versionAv(app) {
  const vs = await alla(`/v1/apps/${app.id}/appStoreVersions?filter[platform]=IOS&limit=10`);
  const v = vs.find((x) => /PREPARE_FOR_SUBMISSION|DEVELOPER_REJECTED|REJECTED|WAITING_FOR_REVIEW|READY_FOR_REVIEW|IN_REVIEW/.test(x.attributes.appStoreState || x.attributes.appVersionState || ''));
  if (!v) throw new Error('ingen iOS-version att fylla i (skapa 1.0 under Distribution i ASC)');
  return v;
}
const svLokal = (lista) => lista.find((l) => /^sv/.test(l.attributes.locale)) || lista[0];

// ---------- kommandon ----------
async function koll() {
  const app = await appen();
  console.log(`App: ${app.attributes.name} (${app.id}) ${app.attributes.bundleId} sku=${app.attributes.sku} språk=${app.attributes.primaryLocale} rättigheter=${app.attributes.contentRightsDeclaration}`);
  for (const i of await alla(`/v1/apps/${app.id}/appInfos?limit=10`)) {
    const inc = await call('GET', `/v1/appInfos/${i.id}?include=primaryCategory,primarySubcategoryOne,primarySubcategoryTwo,ageRatingDeclaration`);
    const kat = (inc.included || []).map((x) => `${x.type.replace('appCategories', 'kat')}:${x.id}`).join(' ');
    console.log(`  appInfo ${i.id} ${i.attributes.state || i.attributes.appStoreState}  ${kat}`);
    const ald = (inc.included || []).find((x) => x.type === 'ageRatingDeclarations');
    if (ald) console.log('    åldersgräns:', JSON.stringify(ald.attributes));
    for (const l of await alla(`/v1/appInfos/${i.id}/appInfoLocalizations`)) console.log(`    ${l.attributes.locale}: "${l.attributes.name}" / "${l.attributes.subtitle || ''}" ${l.attributes.privacyPolicyUrl || '(ingen integritets-URL)'}`);
  }
  for (const v of await alla(`/v1/apps/${app.id}/appStoreVersions?filter[platform]=IOS&limit=10`)) {
    console.log(`  version ${v.attributes.versionString} ${v.attributes.appStoreState || v.attributes.appVersionState} release=${v.attributes.releaseType} © ${v.attributes.copyright || ''}`);
    const b = await tyst404(call('GET', `/v1/appStoreVersions/${v.id}/build`));
    console.log(`    bygge: ${b?.data ? b.data.attributes.version + ' ' + b.data.attributes.processingState : 'inget'}`);
    for (const l of await alla(`/v1/appStoreVersions/${v.id}/appStoreVersionLocalizations`)) {
      const sets = await alla(`/v1/appStoreVersionLocalizations/${l.id}/appScreenshotSets`);
      const bilder = [];
      for (const s of sets) bilder.push(`${s.attributes.screenshotDisplayType}=${(await alla(`/v1/appScreenshotSets/${s.id}/appScreenshots`)).length}`);
      console.log(`    ${l.attributes.locale}: beskrivning ${(l.attributes.description || '').length} tecken, nyckelord "${l.attributes.keywords || ''}", support ${l.attributes.supportUrl || '-'}, bilder ${bilder.join(' ') || 'inga'}`);
    }
    const rd = await tyst404(call('GET', `/v1/appStoreVersions/${v.id}/appStoreReviewDetail`));
    console.log(`    granskning: ${rd?.data ? `${rd.data.attributes.contactFirstName} ${rd.data.attributes.contactLastName} ${rd.data.attributes.contactEmail} tel ${rd.data.attributes.contactPhone ? 'ja' : 'saknas'} noter ${(rd.data.attributes.notes || '').length} tecken` : 'inget'}`);
  }
  const ps = await tyst404(call('GET', `/v1/apps/${app.id}/appPriceSchedule/manualPrices?include=appPricePoint`));
  console.log(`  pris: ${ps?.data?.length ? (ps.included || []).map((p) => p.attributes.customerPrice).join(', ') : 'inget prisschema'}`);
  const av = await tyst404(call('GET', `/v2/appAvailabilities/${app.id}/territoryAvailabilities?limit=200`));
  console.log(`  länder: ${av?.data ? av.data.filter((t) => t.attributes.available).length : '?'}`);
  const builds = await alla(`/v1/builds?filter[app]=${app.id}&sort=-uploadedDate&limit=5`);
  console.log(`  byggen i ASC: ${builds.map((b) => `${b.attributes.version} ${b.attributes.processingState} ${b.attributes.uploadedDate?.slice(0, 16)}`).join(' | ') || 'inga'}`);
}

async function info() {
  const app = await appen(), i = await infoAv(app);
  await call('PATCH', `/v1/apps/${app.id}`, { data: { type: 'apps', id: app.id, attributes: { contentRightsDeclaration: 'DOES_NOT_USE_THIRD_PARTY_CONTENT' } } });
  console.log('✓ innehållsrättigheter: inget tredjepartsinnehåll');
  await call('PATCH', `/v1/appInfos/${i.id}`, { data: { type: 'appInfos', id: i.id, relationships: { primaryCategory: rel('appCategories', 'GAMES'), primarySubcategoryOne: rel('appCategories', 'GAMES_SIMULATION'), primarySubcategoryTwo: rel('appCategories', 'GAMES_STRATEGY') } } });
  console.log('✓ kategori: Games → Simulation, Strategy');
  const lok = await alla(`/v1/appInfos/${i.id}/appInfoLocalizations`);
  let sv = svLokal(lok);
  const attr = { name: TEXT.namn, subtitle: TEXT.undertitel, privacyPolicyUrl: TEXT.integritet };
  if (sv) { await call('PATCH', `/v1/appInfoLocalizations/${sv.id}`, { data: { type: 'appInfoLocalizations', id: sv.id, attributes: attr } }); console.log(`✓ ${sv.attributes.locale}: namn, undertitel, integritets-URL`); }
  else { sv = (await call('POST', '/v1/appInfoLocalizations', { data: { type: 'appInfoLocalizations', attributes: { locale: 'sv', ...attr }, relationships: { appInfo: rel('appInfos', i.id) } } })).data; console.log('✓ sv skapad: namn, undertitel, integritets-URL'); }
  // åldersgräns: allt NONE/false → 4+. Fälten läses först, så att nya fält i Apples schema också nollas.
  const ald = await call('GET', `/v1/appInfos/${i.id}/ageRatingDeclaration`);
  const a = ald.data.attributes, ny = {};
  for (const [k, v] of Object.entries(a)) {
    if (k === 'kidsAgeBand' || k === 'ageRatingOverride' || k === 'koreaAgeRatingOverride') continue;
    if (typeof v === 'boolean') ny[k] = false; else if (typeof v === 'string' && /^(NONE|INFREQUENT_OR_MILD|FREQUENT_OR_INTENSE|INFREQUENT_MILD|FREQUENT_INTENSE)$/.test(v)) ny[k] = 'NONE';
  }
  try { await call('PATCH', `/v1/ageRatingDeclarations/${ald.data.id}`, { data: { type: 'ageRatingDeclarations', id: ald.data.id, attributes: ny } }); console.log(`✓ åldersgräns: ${Object.keys(ny).length} fält satta till inget → 4+`); }
  catch (e) { console.log('✗ åldersgränsen gick inte att sätta – gör den för hand i ASC:', e.message.slice(0, 300)); }
}

async function version() {
  const app = await appen(), v = await versionAv(app);
  await call('PATCH', `/v1/appStoreVersions/${v.id}`, { data: { type: 'appStoreVersions', id: v.id, attributes: { copyright: TEXT.copyright, releaseType: 'MANUAL' } } });
  console.log(`✓ ${v.attributes.versionString}: copyright, manuell release`);
  const lok = await alla(`/v1/appStoreVersions/${v.id}/appStoreVersionLocalizations`);
  let sv = svLokal(lok);
  const attr = { description: TEXT.beskrivning, keywords: TEXT.nyckelord, promotionalText: TEXT.promo, supportUrl: TEXT.support, marketingUrl: TEXT.marknad };
  if (sv) await call('PATCH', `/v1/appStoreVersionLocalizations/${sv.id}`, { data: { type: 'appStoreVersionLocalizations', id: sv.id, attributes: attr } });
  else sv = (await call('POST', '/v1/appStoreVersionLocalizations', { data: { type: 'appStoreVersionLocalizations', attributes: { locale: 'sv', ...attr }, relationships: { appStoreVersion: rel('appStoreVersions', v.id) } } })).data;
  console.log(`✓ ${sv.attributes.locale}: beskrivning (${TEXT.beskrivning.length}), nyckelord (${TEXT.nyckelord.length}), promo (${TEXT.promo.length}), support- och marknads-URL`);
}

// ---------- skärmbilder ----------
const BILDSET = [
  { typ: 'APP_IPHONE_61', prefix: 'iphone-', mått: [2622, 1206] },
  { typ: 'APP_IPAD_PRO_3GEN_129', prefix: 'ipad-', mått: [2752, 2064] },
];
async function laddaUppBild(setId, fil) {
  const buf = fs.readFileSync(fil), fileName = path.basename(fil);
  const r = await call('POST', '/v1/appScreenshots', { data: { type: 'appScreenshots', attributes: { fileName, fileSize: buf.length }, relationships: { appScreenshotSet: rel('appScreenshotSets', setId) } } });
  for (const op of r.data.attributes.uploadOperations) {
    const h = {}; for (const x of op.requestHeaders) h[x.name] = x.value;
    const u = await fetch(op.url, { method: op.method, headers: h, body: buf.subarray(op.offset, op.offset + op.length) });
    if (!u.ok) throw new Error(`uppladdningen av ${fileName}: ${u.status} ${await u.text()}`);
  }
  await call('PATCH', `/v1/appScreenshots/${r.data.id}`, { data: { type: 'appScreenshots', id: r.data.id, attributes: { uploaded: true, sourceFileChecksum: crypto.createHash('md5').update(buf).digest('hex') } } });
  for (let i = 0; i < 30; i++) {
    await new Promise((res) => setTimeout(res, 3000));
    const st = (await call('GET', `/v1/appScreenshots/${r.data.id}`)).data.attributes.assetDeliveryState;
    if (st?.state === 'COMPLETE') return 'COMPLETE';
    if (st?.state === 'FAILED') return `FAILED ${JSON.stringify(st.errors)}`;
  }
  return 'väntar fortfarande';
}
async function bilder() {
  const app = await appen(), v = await versionAv(app);
  const sv = svLokal(await alla(`/v1/appStoreVersions/${v.id}/appStoreVersionLocalizations`));
  if (!sv) throw new Error('ingen lokalisering – kör version först');
  const mapp = path.join(APP, 'store', 'skarmbilder');
  const sets = await alla(`/v1/appStoreVersionLocalizations/${sv.id}/appScreenshotSets`);
  for (const B of BILDSET) {
    const filer = fs.readdirSync(mapp).filter((f) => f.startsWith(B.prefix) && f.endsWith('.png')).sort((a, b) => +a.split('-')[1] - +b.split('-')[1]).slice(0, 10);
    if (!filer.length) { console.log(`✗ inga ${B.prefix}*.png i app/store/skarmbilder – kör node app/tools/skarmbilder.mjs`); continue; }
    let set = sets.find((s) => s.attributes.screenshotDisplayType === B.typ);
    if (!set) set = (await call('POST', '/v1/appScreenshotSets', { data: { type: 'appScreenshotSets', attributes: { screenshotDisplayType: B.typ }, relationships: { appStoreVersionLocalization: rel('appStoreVersionLocalizations', sv.id) } } })).data;
    const gamla = await alla(`/v1/appScreenshotSets/${set.id}/appScreenshots`);
    if (gamla.length && !args.includes('--om')) { console.log(`- ${B.typ}: ${gamla.length} bilder finns redan (--om byter ut dem)`); continue; }
    for (const g of gamla) await call('DELETE', `/v1/appScreenshots/${g.id}`);
    for (const f of filer) console.log(`  ${B.typ} ${f}: ${await laddaUppBild(set.id, path.join(mapp, f))}`);
    console.log(`✓ ${B.typ}: ${filer.length} bilder`);
  }
}

// ---------- granskning, pris, bygge, skicka ----------
async function granskning() {
  const app = await appen(), v = await versionAv(app);
  // kontaktuppgifterna kopieras från Pixelcitys senaste version (samma person)
  const pv = (await alla(`/v1/apps/${PIXELCITY}/appStoreVersions?filter[platform]=IOS&limit=3`))[0];
  const prd = pv ? await tyst404(call('GET', `/v1/appStoreVersions/${pv.id}/appStoreReviewDetail`)) : null;
  const k = prd?.data?.attributes || {};
  const attr = { contactFirstName: k.contactFirstName || 'Carl', contactLastName: k.contactLastName || 'Palsson', contactEmail: k.contactEmail || 'hello@8bitcat.io', demoAccountRequired: false, notes: TEXT.noter };
  if (k.contactPhone) attr.contactPhone = k.contactPhone; else console.log('- telefonnumret lämnas inte ut av API:t – Carl fyller i Contact phone under App Review Information');
  const rd = await tyst404(call('GET', `/v1/appStoreVersions/${v.id}/appStoreReviewDetail`));
  if (rd?.data) await call('PATCH', `/v1/appStoreReviewDetails/${rd.data.id}`, { data: { type: 'appStoreReviewDetails', id: rd.data.id, attributes: attr } });
  else await call('POST', '/v1/appStoreReviewDetails', { data: { type: 'appStoreReviewDetails', attributes: attr, relationships: { appStoreVersion: rel('appStoreVersions', v.id) } } });
  console.log(`✓ granskning: ${k.contactFirstName} ${k.contactLastName}, ${k.contactEmail}, noter ${TEXT.noter.length} tecken`);
}
async function pris() {
  const app = await appen();
  const punkter = await alla(`/v1/apps/${app.id}/appPricePoints?filter[territory]=SWE&limit=200`);
  const gratis = punkter.find((p) => +p.attributes.customerPrice === 0);
  if (!gratis) throw new Error('hittar ingen gratis-prispunkt för SWE');
  await call('POST', '/v1/appPriceSchedules', { data: { type: 'appPriceSchedules', relationships: { app: rel('apps', app.id), baseTerritory: rel('territories', 'SWE'), manualPrices: { data: [{ type: 'appPrices', id: '${gratis}' }] } } }, included: [{ type: 'appPrices', id: '${gratis}', attributes: { startDate: null }, relationships: { appPricePoint: rel('appPricePoints', gratis.id) } }] });
  console.log('✓ pris: gratis (basland Sverige)');
  const terr = await alla('/v1/territories?limit=200');
  const ids = terr.map((t) => t.id);
  await call('POST', '/v2/appAvailabilities', { data: { type: 'appAvailabilities', attributes: { availableInNewTerritories: true }, relationships: { app: rel('apps', app.id), territoryAvailabilities: { data: ids.map((t) => ({ type: 'territoryAvailabilities', id: '${' + t + '}' })) } } }, included: ids.map((t) => ({ type: 'territoryAvailabilities', id: '${' + t + '}', attributes: { available: true }, relationships: { territory: rel('territories', t) } })) });
  console.log(`✓ tillgänglig i ${ids.length} länder (och nya länder automatiskt)`);
}
async function bygge() {
  const app = await appen(), v = await versionAv(app);
  const b = (await alla(`/v1/builds?filter[app]=${app.id}&sort=-uploadedDate&limit=3`)).find((x) => x.attributes.processingState === 'VALID');
  if (!b) { console.log('- inget färdigt bygge i ASC än (Codemagic → TestFlight först)'); return false; }
  await call('PATCH', `/v1/appStoreVersions/${v.id}/relationships/build`, { data: { type: 'builds', id: b.id } });
  console.log(`✓ bygge ${b.attributes.version} (${b.attributes.uploadedDate?.slice(0, 10)}) kopplat till ${v.attributes.versionString}`);
  return true;
}
async function skicka() {
  const app = await appen(), v = await versionAv(app);
  const b = await tyst404(call('GET', `/v1/appStoreVersions/${v.id}/build`));
  if (!b?.data) throw new Error('inget bygge kopplat – kör bygge först');
  const rs = (await call('POST', '/v1/reviewSubmissions', { data: { type: 'reviewSubmissions', attributes: { platform: 'IOS' }, relationships: { app: rel('apps', app.id) } } })).data;
  await call('POST', '/v1/reviewSubmissionItems', { data: { type: 'reviewSubmissionItems', relationships: { reviewSubmission: rel('reviewSubmissions', rs.id), appStoreVersion: rel('appStoreVersions', v.id) } } });
  await call('PATCH', `/v1/reviewSubmissions/${rs.id}`, { data: { type: 'reviewSubmissions', id: rs.id, attributes: { submitted: true } } });
  console.log(`✓ inskickad till App Review: ${v.attributes.versionString} med bygge ${b.data.attributes.version}`);
}

const K = { koll, info, version, bilder, granskning, pris, bygge, skicka, allt: async () => { await info(); await version(); await bilder(); await granskning(); await pris(); await bygge(); console.log('Kvar för Carl i ASC: App Privacy → "No, we do not collect data" → Publish. Sedan: node app/tools/asc-app.mjs skicka'); } };
if (!K[cmd]) { console.log('okänt kommando', cmd); process.exit(1); }
await K[cmd]();
