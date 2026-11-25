// Förbereder en ny iOS-app så långt det går utan klick (Carl 2026-11-25: "automatisera hela skapandet av app id
// profiles osv"). Kan köras om hur många gånger som helst – det som redan finns lämnas.
//   node app/tools/ny-app.mjs --bundle io.eightbitcat.mobilfabriken --namn "Smartphone Empire" [--repo <git-url>]
//   1. App ID (bundle-id) hos Apple – skapas via App Store Connect API om det saknas.
//   2. Codemagic-appen för repot – läggs till via Codemagic API om den saknas, och den hemliga variabeln
//      CERTIFICATE_PRIVATE_KEY (grupp apple_signing) läggs på den. Bygget skapar sedan profilen själv
//      (codemagic.yaml: app-store-connect fetch-signing-files --create), så inget "Fetch profiles" behövs.
//   3. Appen i App Store Connect – finns ingen API för att skapa den: skriptet skriver exakt vad Carl ska fylla i
//      under New App, och när appen finns skriver det ut Apple ID (till codemagic.yaml APP_STORE_APPLE_ID).
// Nycklar: App Store Connect-nyckeln "Codemagic" (Downloads/AuthKey_94H7H2CY53.p8), Codemagic-token
// (.secrets/codemagic.txt), distributionsnyckeln (.secrets/apple-dist-8bitcat.key, certifikat XVHF37T5LZ).
// Inget hemligt skrivs ut.
import fs from 'fs';
import crypto from 'crypto';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const BUNDLE = opt('bundle'), NAMN = opt('namn'), REPO = opt('repo', 'https://github.com/8bitcat/mobilfabriken.git');
if (!BUNDLE || !NAMN) { console.log('använd: --bundle <id> --namn "<namn>" [--repo <git-url>]'); process.exit(1); }

// ---------- App Store Connect ----------
const ISS = '08e19ca3-bbeb-4a09-8096-06f1e3eb6e4b', KID = '94H7H2CY53';
const p8 = fs.readFileSync('C:/Users/palss/Downloads/AuthKey_94H7H2CY53.p8', 'utf8');
const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
const jwt = () => { const now = Math.floor(Date.now() / 1000); const h = b64({ alg: 'ES256', kid: KID, typ: 'JWT' }), p = b64({ iss: ISS, iat: now, exp: now + 600, aud: 'appstoreconnect-v1' }); return `${h}.${p}.${crypto.sign('sha256', Buffer.from(`${h}.${p}`), { key: p8, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`; };
async function asc(method, p, body) {
  const r = await fetch('https://api.appstoreconnect.apple.com' + p, { method, headers: { Authorization: `Bearer ${jwt()}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); if (!r.ok) throw new Error(`${method} ${p} → ${r.status}: ${t.slice(0, 400)}`); return t ? JSON.parse(t) : null;
}
let bid = (await asc('GET', `/v1/bundleIds?filter[identifier]=${BUNDLE}`)).data.find((d) => d.attributes.identifier === BUNDLE);
if (bid) console.log(`✓ App ID finns: ${BUNDLE} (${bid.id})`);
else { bid = (await asc('POST', '/v1/bundleIds', { data: { type: 'bundleIds', attributes: { identifier: BUNDLE, name: NAMN, platform: 'UNIVERSAL' } } })).data; console.log(`+ App ID skapat: ${BUNDLE} (${bid.id})`); }

// ---------- Codemagic ----------
const T = fs.readFileSync('C:/Users/palss/.secrets/codemagic.txt', 'utf8').replace(/[\r\n\s]/g, '');
async function cm(method, p, body) {
  const r = await fetch('https://api.codemagic.io' + p, { method, headers: { 'x-auth-token': T, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); if (!r.ok) throw new Error(`Codemagic ${method} ${p} → ${r.status}: ${t.slice(0, 300)}`); return t ? JSON.parse(t) : null;
}
const norm = (u) => String(u || '').replace(/\.git$/, '').toLowerCase();
let app = ((await cm('GET', '/apps')).applications || []).find((a) => norm(a.repository?.htmlUrl) === norm(REPO));
if (app) console.log(`✓ Codemagic-appen finns: ${app.appName} (${app._id})`);
else { const j = await cm('POST', '/apps', { repositoryUrl: REPO }); app = j.application || j; console.log(`+ Codemagic-appen tillagd: ${app._id}`); }
const vars = await cm('GET', `/apps/${app._id}/variables`);
if ((vars || []).some((v) => v.key === 'CERTIFICATE_PRIVATE_KEY')) console.log('✓ CERTIFICATE_PRIVATE_KEY finns (apple_signing)');
else {
  await cm('POST', `/apps/${app._id}/variables`, { key: 'CERTIFICATE_PRIVATE_KEY', value: fs.readFileSync('C:/Users/palss/.secrets/apple-dist-8bitcat.key', 'utf8'), group: 'apple_signing', secure: true });
  console.log('+ CERTIFICATE_PRIVATE_KEY lagd som hemlig variabel (apple_signing)');
}

// ---------- appen i App Store Connect ----------
const a = (await asc('GET', `/v1/apps?filter[bundleId]=${BUNDLE}`)).data.find((x) => x.attributes.bundleId === BUNDLE);
if (a) console.log(`✓ Appen finns i App Store Connect: ${a.attributes.name} – Apple ID ${a.id} (codemagic.yaml APP_STORE_APPLE_ID)`);
else console.log(`\nKVAR FÖR CARL (inget API finns): App Store Connect → My Apps → ＋ → New App\n  Platforms: iOS · Name: ${NAMN} · Primary Language: English (U.S.) · Bundle ID: ${BUNDLE} · SKU: ${BUNDLE.split('.').pop()} · Full Access\n  Kör sedan skriptet igen för Apple ID.`);
