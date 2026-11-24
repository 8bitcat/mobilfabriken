// Bygger app/www/ – spelet som det ligger i appen (Capacitor, iOS):
//   - index.html, manifest.webmanifest, css/, fonts/, icons/ och js/ (hela spelet, inga byggsteg)
//   - three.js läggs lokalt (app/vendor/three.min.js = samma fil som cdnjs-adressen i index.html), så att
//     appen startar utan nät och App Review aldrig ser en tom 3D-ruta
// Spelet självt ändras inte. Nya spelversioner når appen via ett nytt App Store-bygge (Codemagic).
//   node build.mjs            (körs av "npm run build" / "npm run sync" och i codemagic.yaml)
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const APP = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(APP, '..');
const WWW = path.join(APP, 'www');

// three.js 0.160.0 från cdnjs, hämtad 2026-11-23 – hashen låser filen så att inget annat kan smyga in
const THREE = { fil: path.join(APP, 'vendor', 'three.min.js'), sha256: '170c6789f43217c96b3170f4b42fafe135de7f7cd48497a4218f9757ee1d49fa' };
const cdn = /<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/0\.160\.0\/three\.min\.js" defer><\/script>/g;

const kopiera = (rel) => {
  const src = path.join(ROOT, rel), dst = path.join(WWW, rel);
  if (!fs.existsSync(src)) throw new Error(`saknas i spelet: ${rel}`);
  fs.cpSync(src, dst, { recursive: true });
};

fs.rmSync(WWW, { recursive: true, force: true });
fs.mkdirSync(WWW, { recursive: true });
for (const f of ['index.html', 'manifest.webmanifest', 'css', 'fonts', 'icons', 'js']) kopiera(f);

// three.js lokalt
const tre = fs.readFileSync(THREE.fil);
const hash = crypto.createHash('sha256').update(tre).digest('hex');
if (hash !== THREE.sha256) throw new Error(`app/vendor/three.min.js har fel hash (${hash}) – hämta om från cdnjs eller uppdatera build.mjs`);
fs.mkdirSync(path.join(WWW, 'vendor'), { recursive: true });
fs.writeFileSync(path.join(WWW, 'vendor', 'three.min.js'), tre);

// index.html: peka om cdnjs-raden – måste träffa exakt en gång
const idx = path.join(WWW, 'index.html');
let html = fs.readFileSync(idx, 'utf8');
const n = (html.match(cdn) || []).length;
if (n !== 1) throw new Error(`index.html: hittade ${n} three.js-rader från cdnjs (väntade 1) – uppdatera app/build.mjs`);
html = html.replace(cdn, '<script src="vendor/three.min.js" defer></script>');
if (/https?:\/\//.test(html.replace(/<!--[\s\S]*?-->/g, ''))) throw new Error('index.html har kvar externa adresser');
fs.writeFileSync(idx, html);

// inget i spelet får hämta något utifrån (localStorage + lokala filer är allt appen behöver) – utom
// självuppdateringen (js/core/appuppdatering.js), som hämtar nya spelversioner från GitHub
const yttre = [];
(function gå(dir) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) gå(p); else if (/\.(js|css|html)$/.test(e.name) && !p.includes('vendor') && e.name !== 'appuppdatering.js') { const t = fs.readFileSync(p, 'utf8'); for (const m of t.matchAll(/https?:\/\/[^\s'")]+/g)) if (!/^\s*\/\//.test(t.slice(t.lastIndexOf('\n', m.index) + 1, m.index))) yttre.push(`${path.relative(WWW, p)}: ${m[0]}`); } } })(WWW);
if (yttre.length) throw new Error('externa adresser i spelet:\n' + yttre.join('\n'));

const antal = (function räkna(dir) { let k = 0; for (const e of fs.readdirSync(dir, { withFileTypes: true })) k += e.isDirectory() ? räkna(path.join(dir, e.name)) : 1; return k; })(WWW);
const ver = fs.readFileSync(path.join(ROOT, 'js', 'version.js'), 'utf8').match(/VERSION = '([^']+)'/)?.[1];
console.log(`app/www: spelet v${ver} – ${antal} filer, three.js lokalt`);
