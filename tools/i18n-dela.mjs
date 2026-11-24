// Delar upp nycklarna (tools/out/i18n-nycklar.json, från tools/i18n-nycklar.mjs) i översättningspaket per
// filgrupp: tools/i18n/del/<nn>-<grupp>.json = [{ i, k, f }]. Varje nyckel hamnar i ett enda paket (första filen).
//   node tools/i18n-dela.mjs            alla nycklar
//   node tools/i18n-dela.mjs --saknas   bara de som saknas i js/i18n/en.js (nya texter efter en ändring)
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
const K = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/out/i18n-nycklar.json'), 'utf8'));
const finns = process.argv.includes('--saknas') ? (await import(pathToFileURL(path.join(ROOT, 'js/i18n/en.js')).href)).default : {};
const grupp = (f) => {
  f = f.replace(/\\/g, '/');
  if (f.includes('js/data/')) return 'data';
  if (f.includes('js/konsol/')) return 'konsol';
  if (/js\/sim\/|notiser|main\.js|kontor-vy|bolaget|nyheter/.test(f)) return 'sim';
  if (/design|lansering|show|reklam|gavor/.test(f)) return 'design';
  if (/studios|telefoner|forskning|scener\/kontor|bygg/.test(f)) return 'scener';
  return 'start';
};
const seen = new Set(), del = {};
for (const [f, ks] of Object.entries(K.byFile)) for (const k of ks) {
  if (seen.has(k) || typeof finns[k] === 'string') continue;
  seen.add(k); (del[grupp(f)] ??= []).push({ k, f: f.replace(/\\/g, '/') });
}
if ((del.data?.length || 0) > 350) { const h = Math.ceil(del.data.length / 2); del.data2 = del.data.slice(h); del.data = del.data.slice(0, h); }
const DEL = path.join(ROOT, 'tools/i18n/del');
fs.rmSync(DEL, { recursive: true, force: true }); fs.mkdirSync(DEL, { recursive: true });
fs.mkdirSync(path.join(ROOT, 'tools/i18n/ut'), { recursive: true });
let n = 0;
for (const [g, lista] of Object.entries(del)) {
  const nn = String(++n).padStart(2, '0');
  fs.writeFileSync(path.join(DEL, `${nn}-${g}.json`), JSON.stringify(lista.map((x, i) => ({ i, ...x })), null, 1));
  console.log(`${nn}-${g}: ${lista.length}`);
}
console.log(`totalt ${seen.size} nycklar i ${n} paket`);
