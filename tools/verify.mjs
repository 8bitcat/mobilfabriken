// Provkör allt innan ett släpp: simuleringen (Node), balansroboten, roboten som spelar första varvet med
// riktiga klick, skärmbilder av alla scener utan konsolfel, och mobilformatet (iPhone 13 mini liggande) – för
// telefonspelet (SNABBSTART 2007) och för konsolspelet 1982 (konsolscenerna, rundturen och konsolhandledningen).
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
// konsolspelet (docs/KONSOLPLAN.md): första konsolen 1982, studiorna, egna spel, telefonavdelningen
steg('konsol-sim-test (första konsolen 1982)', kor('konsol-sim-test.mjs'), (u) => /✓ konsol-sim-test/.test(u));
steg('konsolrobot 1982–2026 (ingen kör fast)', kor('konsol-ai.mjs', ['3', '--tyst']), (u) => { const s = u.split('SAMMANFATTNING')[1] || ''; return !/lån \d{4}/.test(s) && (s.match(/HK 20\d\d/g) || []).length === 3 && (s.match(/mobil 20\d\d/g) || []).length === 3; });
// väntar två bildrutor i sidan (UI-markeringarna U.mark är då ritade)
const BILD = 'const bild = async () => { for (let q = 0; q < 2; q++) await new Promise((r) => requestAnimationFrame(r)); };';
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
// konsolspelet (G.lage 'konsol', 1982): en konsolvariant av varje scen, och STUDIOS och reklamfilmen som bara finns där
const K = "nyttTestspel({ lage: 'konsol' });", KLANS = K + ' forstaKonsolen(); lanseraKonsolen();';
const kScener = [
  ['start', BILD + " A.go('start'); await bild(); const m = window.__U.mark['start-nytt']; const UI = await import('/js/core/ui.js'); UI.pekareNer(m.x + 2, m.y + 2); UI.pekareUpp(m.x + 2, m.y + 2);"],   // startvalet
  ['kontor', K + " forstaKonsolen(); dagar(5); A.G.ko = []; A.go('kontor');"],   // bygget, hårdvaran
  ['kontor-spel', K + " forstaKonsolen(); let n = 0; while (A.G.projekt[0].fas !== 'mjukvara' && n++ < 300) dagar(1); dagar(3); A.G.ko = []; A.go('kontor');"],   // spelet i lådan
  ['design', K + " A.go('design', { steg: 13 });"],   // SPELET I LÅDAN
  ['personal', K + " A.go('personal');"],
  ['bygg', K + " A.go('bygg');"],
  ['forskning', K + " A.go('forskning', { nod: 'k-mobil' });"],
  ['telefoner', KLANS + " dagar(60); A.G.ko = []; A.go('telefoner');"],
  ['nyheter', KLANS + " dagar(100); A.G.ko = []; A.go('nyheter');"],
  ['bolaget', KLANS + " dagar(100); A.G.ko = []; A.go('bolaget');"],
  ['meny', K + " A.go('meny');"],
  ['gavor', K + " A.go('gavor');"],
  ['lansering', K + " forstaKonsolen(); let n = 0; while (A.G.projekt[0].status !== 'klar' && n++ < 300) dagar(1); A.G.ko = []; A.go('lansering', { projekt: A.G.projekt[0].id });"],
  ['show', K + " forstaKonsolen(); let n = 0; while (A.G.projekt[0].status !== 'klar' && n++ < 300) dagar(1); const r = proj.lansera(A.G, A.G.projekt[0].id, 'ingen'); A.G.ko = []; A.go('show', { produkt: r.produkt.id, t: 30 });"],
  ['studios', KLANS + " dagar(40); A.G.ko = []; A.go('studios');"],
  ['reklam', KLANS + " A.G.ko = []; A.go('reklam', { konsol: A.G.produkter[0].id, t: 5 });"],
];
for (const [namn, kod] of kScener) steg('konsolscen ' + namn, kor('snap.mjs', ['verify-k-' + namn, kod], 120000), (u) => { const j = JSON.parse(u.slice(0, u.lastIndexOf('}') + 1)); return j.resultat.ok !== false && !j.fel.length; });
// musiken (js/core/musik.js): spelar i webbläsaren, följer skärmen och epoken, MUSIK av tystar
steg('musik och ljud', kor('musik-test.mjs', [], 300000), (u) => /✓ musik-test/.test(u));
// pekskärmen: dra från en gren skrollar forskningsträdet, ett stilla tryck väljer grenen (js/core/ui.js pekare*Pek)
steg('pekskärm: dra och tryck', kor('pek-test.mjs', [], 200000), (u) => /✓ pek-test/.test(u));
// köpen i appen (js/core/kop.js, butiken) med låtsat StoreKit, och att webben inte har någon butik
steg('köp i appen (låtsat StoreKit)', kor('../app/tools/kop-test.mjs', [], 600000), (u) => /✓ kop-test/.test(u));
// ENGELSKAN (2026-11-24, docs/SPRAK.md): varje text har en översättning, och alla scener ritar utan konsolfel på engelska
steg('engelska: alla texter översatta', kor('i18n-nycklar.mjs'), (u) => /en: (\d+)\/\1 översatta/.test(u));
for (const [namn, kod] of [...scener.map(([n, k]) => ['t-' + n, k]), ...kScener.map(([n, k]) => ['k-' + n, k])]) steg('engelska ' + namn, kor('snap.mjs', ['verify-en-' + namn, kod, '--lang', 'en'], 120000), (u) => { const j = JSON.parse(u.slice(0, u.lastIndexOf('}') + 1)); return j.resultat.ok !== false && !j.fel.length; });
// konsolspelets rundtur med riktiga tryck: alla flikar i STUDIOS och BOLAGET, designerns 16 steg, museet, forskningens
// MOBIL-flik, studiokortet (SE FÖRFRÅGAN → JA) och spelsläppskortet (SE REKLAMFILMEN → HOPPA ÖVER → tillbaka)
const RUNDTUR = `${BILD}
const UI = await import('/js/core/ui.js'), fel = [];
const tryck = async (namn) => { await bild(); const m = window.__U.mark[namn]; if (!m) { fel.push('ingen knapp ' + namn + ' i ' + A.scenNamn); return false; } UI.pekareNer(m.x + m.w / 2, m.y + m.h / 2); UI.pekareUpp(m.x + m.w / 2, m.y + m.h / 2); await bild(); return true; };
const G = nyttTestspel({ lage: 'konsol' }); G.installningar.telefon = 'pixel';
// studiokortet medan konsolen byggs (studion knackar på den 1:a)
forstaKonsolen(); let n = 0; while (!G.ko.some((h) => h.typ === 'studio') && n++ < 60) dagar(1);
G.ko = G.ko.filter((h) => h.typ === 'studio'); A.go('kontor'); await bild();
await tryck('stor-forfragan'); const tillStudios = A.scenNamn === 'studios';
await tryck('studios-ja-0'); const avtal = G.flaggor.avtal || 0;
for (const f of ['bibliotek', 'egna', 'lana', 'rivaler', 'forfragningar']) await tryck('studios-flik-' + f);
lanseraKonsolen(); G.ko = [];
// designerns alla steg (FORTSÄTT genom alla 16)
A.go('design'); await bild(); let steg = 1; while (window.__U.mark['design-fortsatt'] && steg < 30) { await tryck('design-fortsatt'); steg++; }
const granskning = !!window.__U.mark['design-starta'];
A.go('bolaget'); for (const f of ['mal', 'marknader', 'kontor', 'salj', 'ekonomi']) await tryck('bolag-flik-' + f);
A.go('telefoner'); await tryck('telefoner-museet'); await tryck('telefoner-salu');
A.go('forskning'); await tryck('forskning-mobil'); await tryck('forskning-konsol');
// spelsläppskortet: ett eget spel (RYMDSKYTTEN) blir klart
kons.startaEgetSpel(G, 'rymdskytten', G.produkter[0].id); n = 0; while (!G.ko.some((h) => h.typ === 'spelslapp') && n++ < 200) dagar(1);
G.ko = G.ko.filter((h) => h.typ === 'spelslapp'); A.go('kontor'); await bild();
await tryck('stor-reklam'); const film = A.scenNamn; await tryck('reklam-hoppa'); await vanta(500);
const efter = A.scenNamn; A.go('kontor');
return { tillStudios, avtal, steg, granskning, film, efter, fel };`;
steg('konsolspelet: rundtur genom flikar, designerns 16 steg och korten', kor('snap.mjs', ['verify-k-rundtur', RUNDTUR], 240000), (u) => { const j = JSON.parse(u.slice(0, u.lastIndexOf('}') + 1)); const v = j.resultat.v || {}; console.log('  ' + JSON.stringify(j.resultat.ok === false ? j.resultat.fel : v)); return j.resultat.ok !== false && !j.fel.length && v.tillStudios && v.avtal >= 1 && v.steg === 16 && v.granskning && v.film === 'reklam' && v.efter === 'kontor' && !v.fel.length; });
steg('konsol-spela-test (handledningen 1982 med riktiga klick)', kor('konsol-spela-test.mjs'), (u) => /✓ konsol-spela-test/.test(u));
// designern (fynd 11): varje forskad del 2008–2026 går att välja – listorna rullas (hjulet) tills inget nytt dyker upp
const DELAR_NAS = `${BILD}
const UI = await import('/js/core/ui.js'), { NODER } = await import('/js/data/noder.js'), { DELAR } = await import('/js/data/delar.js'), bas = await import('/js/sim/bas.js');
const GRP = { 3: ['upplosning', 'frekvens', 'skarmteknik'], 4: ['selfie'], 5: ['bakkamera'], 6: ['chip'], 7: ['ram', 'lagring'], 8: ['batteri'], 9: ['nat', 'os'], 10: ['material', 'port'] };
const saknas = []; let delar = 0;
for (let ar = 2008; ar <= 2026; ar++) {
  const G = nyttTestspel(); G.dag = bas.dagForAr(ar) + 30; G.bolag.kassa = 1e9; G.installningar.telefon = 'pixel';
  G.forskning.klara = NODER.filter((n) => n.ar <= ar).map((n) => n.id);
  G.utkast = des.nyDesign(G);
  for (const s of Object.keys(GRP).map(Number)) {
    A.go('design', { steg: s }); await bild();
    const sett = new Set(Object.keys(window.__U.mark));
    // varje rullbar lista i högerpanelen för sig (KROPP har delarna och funktionerna i var sin lista)
    const listor = window.__U.hits.filter((h) => h.hjul && h.x >= 270 && h.y < 176).map((h) => [h.x + 10, h.y + Math.floor(h.h / 2)]);
    for (const [hx, hy] of listor) {
      let forra = '';
      for (let k = 0; k < 40; k++) { UI.hjul(hx, hy, 24); await bild(); const nu = Object.keys(window.__U.mark).sort().join(); for (const m of Object.keys(window.__U.mark)) sett.add(m); if (nu === forra) break; forra = nu; }
    }
    for (const g of GRP[s]) for (const d of DELAR[g]) if (des.harDel(G, g, d.id)) { delar++; if (!sett.has('del-' + g + '-' + d.id)) saknas.push(ar + ' ' + g + ':' + d.id); }
  }
}
A.go('kontor');
return { delar, saknas: saknas.length, exempel: saknas.slice(0, 8) };`;
steg('designern: alla forskade delar går att välja 2008–2026', kor('snap.mjs', ['verify-designer-delar', DELAR_NAS], 480000), (u) => { const j = JSON.parse(u.slice(0, u.lastIndexOf('}') + 1)); console.log('  ' + JSON.stringify(j.resultat.v || j.resultat.fel)); return j.resultat.ok !== false && !j.fel.length && j.resultat.v.delar > 0 && j.resultat.v.saknas === 0; });
// koncepthyllan (fynd 32): ett klick laddar just det konceptet, och STARTA UTVECKLING tömmer utkastet
const KONCEPT = `${BILD}
const UI = await import('/js/core/ui.js');
const tryck = async (namn) => { const m = window.__U.mark[namn]; if (!m) throw new Error('ingen knapp ' + namn); UI.pekareNer(m.x + m.w / 2, m.y + m.h / 2); UI.pekareUpp(m.x + m.w / 2, m.y + m.h / 2); await bild(); };
const G = nyttTestspel(); G.installningar.telefon = 'pixel';
const alfa = des.nyDesign(G), beta = des.nyDesign(G); alfa.namn = 'ALFA'; beta.namn = 'BETA';
G.koncept = [beta, alfa]; G.utkast = des.nyDesign(G); G.utkast.namn = 'GAMMA';
A.go('design', { steg: 12 }); await bild();
UI.pekareNer(271, 19); UI.pekareUpp(271, 19); await bild();   // KONCEPT-knappen i rubrikraden
await tryck('koncept-1');
const laddat = G.utkast && G.utkast.id === alfa.id && G.utkast.namn === 'ALFA';
await tryck('design-starta');
return { laddat, utkastEfter: G.utkast, projekt: G.projekt.map((p) => p.design.namn), hyllan: G.koncept.map((c) => c.namn) };`;
steg('koncepthyllan laddar konceptet och STARTA tömmer utkastet', kor('snap.mjs', ['verify-koncept', KONCEPT], 120000), (u) => { const j = JSON.parse(u.slice(0, u.lastIndexOf('}') + 1)); const v = j.resultat.v || {}; console.log('  ' + JSON.stringify(v.laddat != null ? v : j.resultat.fel)); return j.resultat.ok !== false && !j.fel.length && v.laddat === true && v.utkastEfter === null && v.projekt?.[0] === 'ALFA' && v.hyllan?.join() === 'BETA'; });
// mobil: iPhone 13 mini liggande (812×375 CSS-pixlar, 3× skärm) – hela spelbilden ska synas
steg('mobil iPhone 13 mini liggande', kor('snap.mjs', ['verify-mobil', "nyttTestspel(); A.go('kontor');", '--w', '812', '--h', '375', '--dpr', '3']), (u) => { const j = JSON.parse(u.slice(0, u.lastIndexOf('}') + 1)); return !j.fel.length; });
for (const [namn, kod] of [['kontor', "nyttTestspel({ lage: 'konsol' }); forstaKonsolen(); dagar(5); A.G.ko = []; A.go('kontor');"], ['studios', "nyttTestspel({ lage: 'konsol' }); forstaKonsolen(); lanseraKonsolen(); dagar(40); A.G.ko = []; A.go('studios');"]])
  steg('mobil konsolspelet ' + namn, kor('snap.mjs', ['verify-mobil-k-' + namn, kod, '--w', '812', '--h', '375', '--dpr', '3']), (u) => { const j = JSON.parse(u.slice(0, u.lastIndexOf('}') + 1)); return j.resultat.ok !== false && !j.fel.length; });
const dåliga = resultat.filter(([, ok]) => !ok).length;
console.log(dåliga ? `✗ verify: ${dåliga} av ${resultat.length} steg misslyckades` : `✓ verify: alla ${resultat.length} steg gröna`);
process.exit(dåliga ? 1 : 0);
