// Balanstest: en robot spelar 2007–2026 med en enkel men rimlig strategi och skriver ut året för året.
//   node tools/sim-ai.mjs [antal frön] [--snal]   (--snal = spelar försiktigt, utan reklam och möbelköp)
// Målet: ingen kör fast, kontoren nås i lagom takt (litet ~2009, våning ~2012, studio ~2017, HK ~2023),
// betygen stiger och spelet blir aldrig "vunnet" för tidigt.
import { nyttSpel } from '../js/sim/spel.js';
import { placera, kontorsVarden, flytta, kravUppfyllt, lastOk } from '../js/sim/kontor.js';
import { startKandidater, anstall, ledigaBord, omrull, teamfest, sparka, kanTrana, trana } from '../js/sim/personal.js';
import { nyDesign, styckkostnad, harDel, harKaross, harFunktion, harEnhet, antalLinserTillatna, minRam, minDjup, betyg as betygAv, forvantan } from '../js/sim/design.js';
import { startaUtveckling, lanseringsKalkyl, lansera, laggNer, pagaendeBygg, andraPris, bliViral, kanViral, uppdatering } from '../js/sim/projekt.js';
import { redo, starta, fpPris, labbspar } from '../js/sim/forskning.js';
import { rimligtPris, snitt, veckoEfterfragan, tackning } from '../js/sim/marknad.js';
import { dagTick } from '../js/sim/tick.js';
import { GRUPPER, DELAR, KAROSSER, FUNKTIONER, ENHETER } from '../js/data/delar.js';
import { KATALOG, MOBEL } from '../js/data/katalog.js';
import { KONTOR, REGIONER, KAMPANJER } from '../js/data/varld.js';
import { arAv, kr, dec } from '../js/sim/bas.js';

const args = process.argv.slice(2), N = +(args.find((a) => /^\d+$/.test(a)) || 3), snal = args.includes('--snal');
// robotens egna val slumpas med ett frö per körning (mulberry32), så att två körningar går att jämföra
let rnd = () => 0.5;
const fro = (s) => { let a = s >>> 0; rnd = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

function basta(G) {
  const ar = arAv(G.dag), d = nyDesign(G, null);
  for (const g of GRUPPER) { const lista = DELAR[g.id].filter((x) => harDel(G, g.id, x.id)); d.val[g.id] = lista[lista.length - 1].id; }
  const k = KAROSSER.filter((x) => harKaross(G, x.id)); d.kaross = k[k.length - 1].id;
  d.funktioner = FUNKTIONER.filter((f) => harFunktion(G, f.id)).map((f) => f.id);
  d.linser = antalLinserTillatna(G); d.form.ram = minRam(G); d.form.djup = minDjup(d); d.hemknapp = ar < 2012;
  d.yta = ar >= 2012 ? 'borstad' : ar >= 2009 ? 'matt' : 'klassisk';
  // ny enhetstyp om den finns och vi inte har sålt den än
  const ny = ENHETER.find((e) => e.id !== 'telefon' && harEnhet(G, e.id) && !G.bolag.enhetstyper.includes(e.id));
  if (ny && G.produkter.filter((p) => p.aktiv).length >= 1 && rnd() < 0.5) d.enhet = ny.id;
  const b = betygAv(G, d, ar, 9, 13, 1).betyg;
  d.pris = Math.round(rimligtPris(G.dag, b, d.enhet) * 1.05 / 10) * 10;   // rimligt pris för enheten (en laptop är värd mer)
  d.namn = (d.enhet === 'telefon' ? 'PIXEL PHONE ' : d.enhet.toUpperCase() + ' ') + (G.bolag.lanseringar + 1);
  return d;
}
function moblera(G) {
  const k = G.kontor;
  k.bord.forEach((b, i) => { if (!b && G.bolag.kassa > 400_000) placera(G, { typ: 'bord', i }, 'fallbord'); });
  if (snal) return;
  // uppgradera arbetsplatser och lägg till trivsel/labb när det finns pengar över
  const rik = (pris) => G.bolag.kassa > pris * 6 + 1_000_000;
  for (let i = 0; i < k.bord.length; i++) {
    const b = k.bord[i]; if (!b) continue;
    for (const [del, kat] of [['bord', 'bord'], ['dator', 'datorer'], ['stol', 'stolar']]) {
      const nu = MOBEL[b[del]], battre = KATALOG.filter((m) => m.kat === kat && lastOk(G, m) && m.stj > nu.stj).sort((a, c) => a.pris - c.pris)[0];
      if (battre && rik(battre.pris)) placera(G, { typ: 'bord', i }, battre.id);
    }
  }
  for (const [typ, kats] of [['golv', ['labb', 'trivsel', 'vaxter', 'lampor', 'dekor']], ['vagg', ['trivsel', 'lampor', 'dekor']]]) {
    k[typ].forEach((id, i) => {
      const nu = id ? MOBEL[id] : null;
      const kand = KATALOG.filter((m) => kats.includes(m.kat) && m.plats === typ && lastOk(G, m) && (!nu || m.stj > nu.stj) && (m.bonus.trivsel || m.bonus.buggfix)).sort((a, c) => (c.bonus.buggfix || 0) * 30 + (c.bonus.trivsel || 0) - ((a.bonus.buggfix || 0) * 30 + (a.bonus.trivsel || 0)));
      const m = kand.find((x) => rik(x.pris)); if (m) placera(G, { typ, i }, m.id);
    });
  }
}
function personal(G) {
  let n = 0;
  while (ledigaBord(G).length && n++ < 40) {
    const forsk = G.personal.filter((p) => p.roll === 'forskare').length, bugg = G.personal.length - forsk;
    const vill = forsk <= bugg * 1.5 ? 'forskare' : 'buggfixare';
    const k = [...G.kandidater].sort((a, b) => b.stjarnor - a.stjarnor).find((x) => x.roll === vill) || [...G.kandidater].sort((a, b) => b.stjarnor - a.stjarnor)[0];
    if (!k) { if (!omrull(G).ok) break; continue; }
    if (G.bolag.kassa < k.lon * 6) break;
    anstall(G, k.id);
  }
  if (!snal && G.moral < 45 && G.bolag.kassa > 2e6) teamfest(G);
  if (!snal) for (const p of G.personal) if (kanTrana(G, p) && G.bolag.kassa > p.lon * 20) trana(G, p.id);
  // byt ut en ★-nybörjare mot en bättre kandidat när kontoret tillåter det
  if (!snal && G.dag % 91 === 0) { const svag = [...G.personal].sort((a, b) => a.stjarnor - b.stjarnor)[0], bast = [...G.kandidater].sort((a, b) => b.stjarnor - a.stjarnor)[0]; if (svag && bast && bast.stjarnor >= svag.stjarnor + 2 && G.bolag.kassa > bast.lon * 24) { sparka(G, svag.id); anstall(G, bast.id); } }
}
function forska(G) {
  while (G.forskning.pagar.length < labbspar(G)) {
    const r = redo(G).filter((n) => fpPris(G, n) <= G.bolag.fp);
    if (!r.length) return;
    const ar = arAv(G.dag);
    r.sort((a, b) => (b.ar === ar) - (a.ar === ar) || (b.lasUpp.typ === 'del') - (a.lasUpp.typ === 'del') || fpPris(G, a) - fpPris(G, b));
    if (!starta(G, r[0].id).ok) return;
  }
}
function expandera(G) {
  for (const r of REGIONER) if (!G.marknad.regioner.includes(r.id) && G.bolag.rykte >= (r.rykteMin || 0) && G.bolag.kassa > r.pris * 2.5 + 1e6) { G.bolag.kassa -= r.pris; G.marknad.regioner.push(r.id); }
  const i = KONTOR.findIndex((k) => k.id === G.kontor.niva), nasta = KONTOR[i + 1];
  if (nasta && kravUppfyllt(G, nasta.id) && G.bolag.kassa > nasta.pris * 1.6 + 1e6) flytta(G, nasta.id);
}

const sammanfattning = [];
for (let seed = 1; seed <= N; seed++) {
  const G = nyttSpel({ namn: 'ROBOTBOLAGET', seed: seed * 101 }); G.installningar.autopaus = false; fro(seed * 7919);
  startKandidater(G);
  const rader = [], milstolpar = {};
  let minKassa = Infinity, lanAr = null, forraAr = 2007;
  while (arAv(G.dag) <= 2026) {
    if (G.dag % 7 === 0) { moblera(G); personal(G); forska(G); expandera(G); }
    // ny telefon när inget byggs och (ingen till salu eller den nyaste är äldre än 10 månader)
    const aktiva = G.produkter.filter((p) => p.aktiv), nyast = aktiva[aktiva.length - 1];
    if (!pagaendeBygg(G).length && !G.projekt.some((p) => p.status === 'klar') && G.personal.length && (!nyast || G.dag - nyast.lanseradDag > 300)) startaUtveckling(G, basta(G));
    for (const pr of G.projekt.filter((p) => p.status === 'klar')) {
      let bast = 'ingen', bv = 0;
      if (!snal) for (const k of KAMPANJER) { const kal = lanseringsKalkyl(G, pr.id, k.id); if (kal.kvar > 1e6 && kal.reklamVinst > bv && !(k.tackningMin && tackning(G) < k.tackningMin)) { bv = kal.reklamVinst; bast = k.id; } }
      const r = lansera(G, pr.id, bast);
      if (r.ok) { for (const p of G.produkter) if (p.aktiv && p !== r.produkt && p.design.enhet === r.produkt.design.enhet) laggNer(G, p.id); }
    }
    for (const p of G.produkter) if (p.aktiv && p.buggar && G.bolag.fp > p.buggar * 30 + 50) uppdatering(G, p.id);
    for (const p of G.produkter) if (!snal && p.aktiv && kanViral(G, p) && G.bolag.fp > 150) bliViral(G, p.id);
    dagTick(G);
    minKassa = Math.min(minKassa, G.bolag.kassa);
    if (G.lan && !lanAr) lanAr = arAv(G.dag);
    for (const k of KONTOR) if (G.kontor.niva === k.id && !milstolpar[k.id]) milstolpar[k.id] = arAv(G.dag);
    const a = arAv(G.dag);
    if (a !== forraAr) {
      const s = G.stat.ar[forraAr] || { intakt: 0, kostnad: 0 };
      const lans = G.produkter.filter((p) => p.ar === forraAr || arAv(p.lanseradDag) === forraAr);
      rader.push({ ar: forraAr, kassa: G.bolag.kassa, resultat: s.intakt - s.kostnad, betyg: lans.map((p) => dec(p.betyg, 1)).join(' '), snitt: dec(snitt(G.dag - 1), 1), kontor: G.kontor.niva, folk: G.personal.length, tek: G.forskning.klara.length, marknad: Math.round(tackning(G) * 100), salda: G.bolag.totaltSalda, rykte: dec(G.bolag.rykte, 2), mal: G.mal.klara.length, enheter: G.bolag.enhetstyper.length });
      forraAr = a;
    }
  }
  if (seed === 1) {
    console.log(`\nFRÖ ${seed}${snal ? ' (snål)' : ''}: år · kassa · årets resultat · lanserade betyg (snitt) · kontor · folk · tekniker · marknad · sålda totalt · rykte · mål · enhetstyper`);
    for (const r of rader) console.log(`  ${r.ar}  ${kr(r.kassa).padStart(14)}  ${kr(r.resultat).padStart(14)}  ${(r.betyg || '-').padEnd(12)} (${r.snitt})  ${r.kontor.padEnd(7)} ${String(r.folk).padStart(2)} folk  ${String(r.tek).padStart(3)} tek  ${String(r.marknad).padStart(3)} %  ${String(r.salda).padStart(9)}  ${r.rykte}  ${String(r.mal).padStart(2)} mål  ${r.enheter} enh`);
  }
  sammanfattning.push({ seed, slutKassa: G.bolag.kassa, minKassa, lanAr, milstolpar, tek: G.forskning.klara.length, mal: G.mal.klara.length, basta: G.bolag.bastaBetyg, salda: G.bolag.totaltSalda });
}
console.log('\nSAMMANFATTNING');
for (const s of sammanfattning) console.log(`  frö ${s.seed}: slutkassa ${kr(s.slutKassa)} · lägsta kassa ${kr(s.minKassa)} · lån ${s.lanAr || 'aldrig'} · litet ${s.milstolpar.litet || '-'} · våning ${s.milstolpar.vaning || '-'} · studio ${s.milstolpar.studio || '-'} · HK ${s.milstolpar.hk || '-'} · tekniker ${s.tek} · mål ${s.mal} · bästa ${dec(s.basta, 1)} · sålda ${s.salda}`);
