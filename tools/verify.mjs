// Provkör allt innan ett släpp: simuleringen (Node), balansroboten, roboten som spelar första varvet med
// riktiga klick, skärmbilder av alla scener utan konsolfel, och mobilformatet (iPhone 13 mini liggande).
//   node tools/verify.mjs        → sista raden ✓ eller ✗ (läs raden, inte bara slutkoden)
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const kor = (skript, args = [], timeout = 600000) => {
  try { return { ok: true, ut: execFileSync(process.execPath, [path.join(root, 'tools', skript), ...args], { cwd: root, encoding: 'utf8', timeout }) }; }
  catch (e) { return { ok: false, ut: String(e.stdout || '') + String(e.stderr || '') }; }
};
const resultat = [];
const steg = (namn, r, kontroll) => { const ok = r.ok && (!kontroll || kontroll(r.ut)); resultat.push([namn, ok]); console.log((ok ? '✓ ' : '✗ ') + namn); if (!ok) console.log(r.ut.split('\n').slice(-12).join('\n')); };

steg('sim-test (första telefonen mot förlagan)', kor('sim-test.mjs'), (u) => /✓ sim-test/.test(u));
steg('balansrobot 2007–2026 (ingen kör fast)', kor('sim-ai.mjs', ['3']), (u) => !/lån \d{4}/.test(u.split('SAMMANFATTNING')[1] || '') && /HK 20\d\d/.test(u));
steg('spela-test (handledningen med riktiga klick)', kor('spela-test.mjs'), (u) => /✓ spela-test/.test(u));
// alla scener ska rita utan konsolfel
const scener = [
  ['start', ''],
  ['kontor', "nyttTestspel(); forstaTelefonen(); dagar(5); A.G.ko = []; A.go('kontor');"],
  ['design', "nyttTestspel(); A.go('design', { steg: 12 });"],
  ['personal', "nyttTestspel(); A.go('personal');"],
  ['bygg', "nyttTestspel(); A.go('bygg');"],
  ['forskning', "nyttTestspel(); A.go('forskning', { nod: 'funk-gps' });"],
  ['telefoner', "nyttTestspel(); forstaTelefonen(); dagar(25); proj.lansera(A.G, A.G.projekt[0].id, 'ingen'); dagar(60); A.G.ko = []; A.go('telefoner');"],
  ['nyheter', "nyttTestspel(); dagar(100); A.G.ko = []; A.go('nyheter');"],
  ['bolaget', "nyttTestspel(); dagar(100); A.G.ko = []; A.go('bolaget');"],
  ['meny', "nyttTestspel(); A.go('meny');"],
  ['gavor', "nyttTestspel(); A.go('gavor');"],
];
for (const [namn, kod] of scener) steg('scen ' + namn, kor('snap.mjs', ['verify-' + namn, kod], 120000), (u) => { const j = JSON.parse(u.slice(0, u.lastIndexOf('}') + 1)); return j.resultat.ok !== false && !j.fel.length; });
// mobil: iPhone 13 mini liggande (812×375 CSS-pixlar, 3× skärm) – hela spelbilden ska synas
steg('mobil iPhone 13 mini liggande', kor('snap.mjs', ['verify-mobil', "nyttTestspel(); A.go('kontor');", '--w', '812', '--h', '375', '--dpr', '3']), (u) => { const j = JSON.parse(u.slice(0, u.lastIndexOf('}') + 1)); return !j.fel.length; });
const dåliga = resultat.filter(([, ok]) => !ok).length;
console.log(dåliga ? `✗ verify: ${dåliga} av ${resultat.length} steg misslyckades` : `✓ verify: alla ${resultat.length} steg gröna`);
process.exit(dåliga ? 1 : 0);
