// TestFlight utan klick: en intern testgrupp "Intern" med tillgång till alla byggen, och kontoinnehavaren (Carl)
// som testare. Interna testare får nya byggen direkt, utan Apples betagranskning.
//   node app/tools/asc-testflight.mjs [--bundle io.eightbitcat.mobilfabriken]
import fs from 'fs';
import crypto from 'crypto';
const args = process.argv.slice(2);
const BUNDLE = args.includes('--bundle') ? args[args.indexOf('--bundle') + 1] : 'io.eightbitcat.mobilfabriken';
const ISS = '08e19ca3-bbeb-4a09-8096-06f1e3eb6e4b', KID = '94H7H2CY53';
const p8 = fs.readFileSync('C:/Users/palss/Downloads/AuthKey_94H7H2CY53.p8', 'utf8');
const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
const jwt = () => { const now = Math.floor(Date.now() / 1000); const h = b64({ alg: 'ES256', kid: KID, typ: 'JWT' }), p = b64({ iss: ISS, iat: now, exp: now + 600, aud: 'appstoreconnect-v1' }); return `${h}.${p}.${crypto.sign('sha256', Buffer.from(`${h}.${p}`), { key: p8, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`; };
async function asc(method, p, body) {
  const r = await fetch('https://api.appstoreconnect.apple.com' + p, { method, headers: { Authorization: `Bearer ${jwt()}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); if (!r.ok) { const e = new Error(`${method} ${p} → ${r.status}: ${t.slice(0, 400)}`); e.status = r.status; throw e; } return t ? JSON.parse(t) : null;
}
const app = (await asc('GET', `/v1/apps?filter[bundleId]=${BUNDLE}`)).data.find((a) => a.attributes.bundleId === BUNDLE);
if (!app) throw new Error('appen finns inte i App Store Connect');
let grupp = (await asc('GET', `/v1/apps/${app.id}/betaGroups?limit=50`)).data.find((g) => g.attributes.isInternalGroup);
if (grupp) console.log(`✓ intern testgrupp finns: ${grupp.attributes.name}`);
else {
  grupp = (await asc('POST', '/v1/betaGroups', { data: { type: 'betaGroups', attributes: { name: 'Intern', isInternalGroup: true, hasAccessToAllBuilds: true }, relationships: { app: { data: { type: 'apps', id: app.id } } } } })).data;
  console.log('+ intern testgrupp "Intern" skapad (alla byggen)');
}
const har = (await asc('GET', `/v1/betaGroups/${grupp.id}/betaTesters?limit=200`)).data.map((t) => (t.attributes.email || '').toLowerCase());
let users = [];
try { users = (await asc('GET', '/v1/users?limit=50')).data; } catch (e) { console.log('✗ får inte läsa användarna:', e.message.slice(0, 160)); }
// bara kontoinnehavaren (Carl) – andra användare på kontot (t.ex. CAP:s) ska inte få spelen
users = users.filter((u) => (u.attributes.roles || []).includes('ACCOUNT_HOLDER'));
for (const u of users) {
  const mail = (u.attributes.username || '').toLowerCase();
  if (!mail || har.includes(mail)) { if (mail) console.log(`✓ ${u.attributes.firstName} är redan testare`); continue; }
  try {
    await asc('POST', '/v1/betaTesters', { data: { type: 'betaTesters', attributes: { email: mail, firstName: u.attributes.firstName, lastName: u.attributes.lastName }, relationships: { betaGroups: { data: [{ type: 'betaGroups', id: grupp.id }] } } } });
    console.log(`+ ${u.attributes.firstName} ${u.attributes.lastName} är testare (internt, nya byggen direkt)`);
  } catch (e) { console.log(`✗ ${u.attributes.firstName}: ${e.message.slice(0, 200)}`); }
}
const byggen = (await asc('GET', `/v1/builds?filter[app]=${app.id}&sort=-uploadedDate&limit=3`)).data;
for (const b of byggen) console.log(`bygge ${b.attributes.version}: ${b.attributes.processingState}, export compliance: ${b.attributes.usesNonExemptEncryption === false ? 'klar (ingen kryptering)' : String(b.attributes.usesNonExemptEncryption)}`);
