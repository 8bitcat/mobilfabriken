// Balanstest för konsolspelet: en robot spelar 1982–2026 och skriver ut året för året (docs/KONSOLPLAN.md).
//   node tools/konsol-ai.mjs [antal frön] [--snal] [--tyst]
// Målet: ingen kör fast, kontoren nås i lagom takt, studiorna kommer med bättre spel när konsolerna blir bättre,
// ★★★★★-spel går att få men inte alla, telefonavdelningen öppnar kring 2007–2010.
import { nyttSpel } from '../js/sim/spel.js';
import { placera, flytta, kravUppfyllt, lastOk, flyttPris } from '../js/sim/kontor.js';
import { startKandidater, anstall, ledigaBord, omrull, teamfest, sparka, kanTrana, trana } from '../js/sim/personal.js';
import { nyDesign, harDel, harKaross, harFunktion, harEnhet, antalLinserTillatna, minRam, minDjup, betyg as betygAv, packinLediga } from '../js/sim/design.js';
import { startaUtveckling, lanseringsKalkyl, lansera, laggNer, pagaendeBygg, uppdatering, kampanjer } from '../js/sim/projekt.js';
import { redo, starta, fpPris, labbspar, krPris } from '../js/sim/forskning.js';
import { rimligtPris, snitt, tackning, regionPris, veckoEfterfragan } from '../js/sim/marknad.js';
import { svara, startaEgetSpel, egnaSpelLediga, egetPagar, klararKrav, spelutvecklare, installeradBas, exklusivPris, lanaUtvecklare, lanbaraStudios, lanePris, spelPa, egnaKonsoler } from '../js/sim/konsol.js';
import { dagTick } from '../js/sim/tick.js';
import { linjeAv } from '../js/data/linjer.js';
import { spelAv } from '../js/data/konsol-varld.js';
import { KATALOG, MOBEL } from '../js/data/katalog.js';
import { KONTOR, REGIONER } from '../js/data/varld.js';
import { arAv, kr, dec } from '../js/sim/bas.js';

const args = process.argv.slice(2), N = +(args.find((a) => /^\d+$/.test(a)) || 3), snal = args.includes('--snal'), tyst = args.includes('--tyst');
let rnd = () => 0.5;
const fro = (s) => { let a = s >>> 0; rnd = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

const K = linjeAv('konsol'), T = linjeAv('telefon');
function bastaKonsol(G) {
  const ar = arAv(G.dag), d = nyDesign(G, null, 'konsol');
  for (const g of K.GRUPPER) { const lista = K.DELAR[g.id].filter((x) => harDel(G, g.id, x.id, 'konsol')); d.val[g.id] = lista[lista.length - 1].id; }
  // ny sorts konsol (ficka, hybrid, vr) ibland, annars hemkonsol
  const ny = K.ENHETER.find((e) => e.id !== 'hem' && harEnhet(G, e.id, 'konsol') && !G.bolag.enhetstyper.includes(e.id));
  if (ny && egnaKonsoler(G).some((p) => p.aktiv) && rnd() < 0.6) d.enhet = ny.id;
  const k = K.KAROSSER.filter((x) => x.enhet === d.enhet && harKaross(G, x.id, 'konsol'));
  d.kaross = k[k.length - 1].id;
  d.funktioner = K.FUNKTIONER.filter((f) => harFunktion(G, f.id, 'konsol')).map((f) => f.id);
  d.yta = ar >= 2000 ? 'borstad' : ar >= 1990 ? 'matt' : 'klassisk';
  const pl = packinLediga(G).filter((e) => klararKrav(d, e.kraver));
  d.packin = pl.length ? { id: pl[0].id, titel: pl[0].titel, glimt: pl[0].glimt || null } : null;
  const b = betygAv(G, d, ar, 8, 12, 1).betyg;
  d.pris = Math.round(rimligtPris(G.dag, b, d.enhet) * 1.0 / 10) * 10;
  d.namn = (d.enhet === 'hem' ? 'PIXELBOX ' : d.enhet.toUpperCase() + ' ') + (egnaKonsoler(G).length + 1);
  return d;
}
function bastaTelefon(G) {
  const ar = arAv(G.dag), d = nyDesign(G, null);
  for (const g of T.GRUPPER) { const lista = T.DELAR[g.id].filter((x) => harDel(G, g.id, x.id)); d.val[g.id] = lista[lista.length - 1].id; }
  const k = T.KAROSSER.filter((x) => harKaross(G, x.id)); d.kaross = k[k.length - 1].id;
  d.funktioner = T.FUNKTIONER.filter((f) => harFunktion(G, f.id)).map((f) => f.id);
  d.linser = antalLinserTillatna(G); d.form.ram = minRam(G); d.form.djup = minDjup(d); d.hemknapp = ar < 2012;
  d.yta = ar >= 2012 ? 'borstad' : 'matt';
  const b = betygAv(G, d, ar, 9, 13, 1).betyg;
  d.pris = Math.round(rimligtPris(G.dag, b, d.enhet) * 1.05 / 10) * 10;
  d.namn = 'PIXELFON ' + (G.produkter.filter((p) => p.design.linje !== 'konsol').length + 1);
  return d;
}
function moblera(G) {
  const k = G.kontor;
  k.bord.forEach((b, i) => { if (!b && G.bolag.kassa > 400_000) placera(G, { typ: 'bord', i }, 'fallbord'); });
  if (snal) return;
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
    const antal = (r) => G.personal.filter((p) => p.roll === r).length;
    const f = antal('forskare'), u = antal('spelutvecklare'), b = antal('buggfixare');
    const vill = u < Math.max(1, Math.round(G.personal.length / 4)) ? 'spelutvecklare' : f <= b * 1.5 ? 'forskare' : 'buggfixare';
    const k = [...G.kandidater].sort((a, c) => c.stjarnor - a.stjarnor).find((x) => x.roll === vill) || [...G.kandidater].sort((a, c) => c.stjarnor - a.stjarnor)[0];
    if (!k) { if (!omrull(G).ok) break; continue; }
    if (G.bolag.kassa < k.lon * 6) break;
    anstall(G, k.id);
  }
  if (!snal && G.moral < 45 && G.bolag.kassa > 2e6) teamfest(G);
  if (!snal) for (const p of G.personal) if (kanTrana(G, p) && G.bolag.kassa > p.lon * 20) trana(G, p.id);
  if (!snal && G.dag % 91 === 0) { const svag = [...G.personal].sort((a, b) => a.stjarnor - b.stjarnor)[0], bast = [...G.kandidater].sort((a, b) => b.stjarnor - a.stjarnor)[0]; if (svag && bast && bast.stjarnor >= svag.stjarnor + 2 && G.bolag.kassa > bast.lon * 24) { sparka(G, svag.id); anstall(G, bast.id); } }
}
// telefonavdelningens väg: fickkonsol, pekskärm, trådlöst nät, sedan k-mobil
const MOBILVAG = new Set(['kenhet-ficka', 'kfunk-pekskarm', 'kfunk-wifi', 'k-mobil', 'kfunk-bakat', 'kfunk-tradlos']);
function forska(G) {
  while (G.forskning.pagar.length < labbspar(G)) {
    const r = redo(G).filter((n) => fpPris(G, n) <= G.bolag.fp && krPris(G, n) * 2 < G.bolag.kassa);
    if (!r.length) return;
    const ar = arAv(G.dag);
    r.sort((a, b) => (MOBILVAG.has(b.id)) - (MOBILVAG.has(a.id)) || (b.ar === ar) - (a.ar === ar) || (b.lasUpp.typ === 'kdel' || b.lasUpp.typ === 'del') - (a.lasUpp.typ === 'kdel' || a.lasUpp.typ === 'del') || fpPris(G, a) - fpPris(G, b));
    if (!starta(G, r[0].id).ok) return;
  }
}
function expandera(G) {
  for (const r of REGIONER) { const pris = regionPris(G, r); if (!G.marknad.regioner.includes(r.id) && G.bolag.rykte >= (r.rykteMin || 0) && G.bolag.kassa > pris * 2.5 + 1e6) { G.bolag.kassa -= pris; G.marknad.regioner.push(r.id); } }
  const i = KONTOR.findIndex((k) => k.id === G.kontor.niva), nasta = KONTOR[i + 1];
  if (nasta && kravUppfyllt(G, nasta.id) && G.bolag.kassa > flyttPris(G, nasta.id) * 1.6 + 1e6) flytta(G, nasta.id);
}
function studios(G, logg) {
  for (const f of [...G.k.forfragningar]) {
    const s = spelAv(f.spel), bib = spelPa(G, f.konsol).length;
    if (s.stj <= 2 && bib >= 4) { svara(G, f.id, 'nej'); logg.nej++; continue; }
    if (s.stj >= 5 && !snal && G.bolag.kassa > exklusivPris(G, s.stj) * 3 + 2e6) { if (svara(G, f.id, 'exklusivt').ok) { logg.exkl++; continue; } }
    if (s.stj >= 3 && !snal && rnd() < 0.3) { const r = svara(G, f.id, 'forhandla', { licens: 0.16 }); if (r.nej) logg.forlorade++; continue; }
    svara(G, f.id, 'ja');
  }
}

const sammanfattning = [];
for (let seed = 1; seed <= N; seed++) {
  const G = nyttSpel({ namn: 'ROBOTKONSOL', seed: seed * 101, lage: 'konsol' }); G.installningar.autopaus = false; fro(seed * 7919);
  startKandidater(G);
  const rader = [], milstolpar = {}, logg = { nej: 0, exkl: 0, forlorade: 0 };
  let minKassa = Infinity, lanAr = null, forraAr = 1982;
  while (arAv(G.dag) <= 2026) {
    if (G.dag % 7 === 0) { moblera(G); personal(G); forska(G); expandera(G); }
    studios(G, logg);
    // ny konsol när inget konsolbygge pågår och den nyaste är äldre än 2,5 år (eller ingen finns)
    const konsoler = egnaKonsoler(G).filter((p) => p.aktiv), nyast = konsoler[konsoler.length - 1];
    const byggerKonsol = G.projekt.some((p) => p.design.linje === 'konsol');
    if (!byggerKonsol && pagaendeBygg(G).length < labbspar(G) && G.personal.length && (!nyast || G.dag - nyast.lanseradDag > 900)) {
      const r = startaUtveckling(G, bastaKonsol(G));
      const pr = r.ok && G.projekt[G.projekt.length - 1], st = lanbaraStudios(G)[0];
      if (pr && st && !snal && G.bolag.kassa > lanePris(G) * 10) lanaUtvecklare(G, pr.id, st.id);
    }
    // telefoner när avdelningen är öppen: en om året
    if (G.flaggor.mobil) {
      const tel = G.produkter.filter((p) => p.aktiv && p.design.linje !== 'konsol'), nyT = tel[tel.length - 1];
      if (!G.projekt.some((p) => p.design.linje !== 'konsol') && pagaendeBygg(G).length < labbspar(G) && (!nyT || G.dag - nyT.lanseradDag > 365)) startaUtveckling(G, bastaTelefon(G));
    }
    for (const pr of G.projekt.filter((p) => p.status === 'klar')) {
      let bast = 'ingen', bv = 0;
      if (!snal) for (const k of kampanjer(G, pr.design)) { const kal = lanseringsKalkyl(G, pr.id, k.id); if (kal.kvar > 1e6 && kal.reklamVinst > bv && !(k.tackningMin && tackning(G) < k.tackningMin)) { bv = kal.reklamVinst; bast = k.id; } }
      const r = lansera(G, pr.id, bast);
      // telefoner läggs ner när en ny kommer; konsoler säljer vidare tills de är fem år eller säljer nästan inget
      if (r.ok && r.produkt.design.linje !== 'konsol') for (const p of G.produkter) if (p.aktiv && p !== r.produkt && p.design.linje !== 'konsol' && p.design.enhet === r.produkt.design.enhet) laggNer(G, p.id);
    }
    if (G.dag % 7 === 0) for (const p of egnaKonsoler(G)) if (p.aktiv && (G.dag - p.lanseradDag > 5 * 365 || (G.dag - p.lanseradDag > 365 && veckoEfterfragan(G, p) < 3))) laggNer(G, p.id);
    // egna spel
    const akt = egnaKonsoler(G).filter((p) => p.aktiv).pop();
    if (akt && spelutvecklare(G).length && !egetPagar(G)) { const e = egnaSpelLediga(G).find((x) => klararKrav(akt.design, x.kraver)); if (e) startaEgetSpel(G, e.id, akt.id); }
    for (const p of G.produkter) if (p.aktiv && p.buggar && G.bolag.fp > p.buggar * 30 + 50) uppdatering(G, p.id);
    dagTick(G);
    minKassa = Math.min(minKassa, G.bolag.kassa);
    if (G.lan && !lanAr) lanAr = arAv(G.dag);
    for (const k of KONTOR) if (G.kontor.niva === k.id && !milstolpar[k.id]) milstolpar[k.id] = arAv(G.dag);
    if (G.flaggor.mobil && !milstolpar.mobil) milstolpar.mobil = arAv(G.dag);
    const a = arAv(G.dag);
    if (a !== forraAr) {
      const s = G.stat.ar[forraAr] || { intakt: 0, kostnad: 0 };
      const lans = G.produkter.filter((p) => arAv(p.lanseradDag) === forraAr);
      const spelAret = G.k.spel.filter((x) => x.slappDag != null && arAv(x.slappDag) === forraAr);
      rader.push({ ar: forraAr, kassa: G.bolag.kassa, resultat: s.intakt - s.kostnad, spelInt: s.per.spel || 0, betyg: lans.map((p) => (p.design.linje === 'konsol' ? '' : 't') + dec(p.betyg, 1)).join(' '), snitt: dec(snitt(G.dag - 1, 'konsol'), 1), kontor: G.kontor.niva, folk: G.personal.length,
        tek: G.forskning.klara.length, marknad: Math.round(tackning(G) * 100), salda: G.bolag.totaltSalda, agare: Math.round(installeradBas(G)), spel: spelAret.map((x) => x.stj + (x.egen ? 'e' : '')).join(''), mal: G.mal.klara.length });
      forraAr = a;
    }
  }
  if (seed === 1 && !tyst) {
    console.log(`\nFRÖ ${seed}${snal ? ' (snål)' : ''}: år · kassa · årets resultat (varav spel) · lanserade betyg (snitt) · kontor · folk · tekniker · marknad · sålda · ägare · årets spel (★, e = eget) · mål`);
    for (const r of rader) console.log(`  ${r.ar}  ${kr(r.kassa, true).padStart(10)}  ${kr(r.resultat, true).padStart(10)} (${kr(r.spelInt, true).padStart(8)})  ${(r.betyg || '-').padEnd(10)} (${r.snitt})  ${r.kontor.padEnd(7)} ${String(r.folk).padStart(2)}  ${String(r.tek).padStart(3)} tek ${String(r.marknad).padStart(3)} %  ${String(r.salda).padStart(9)}  ${String(r.agare).padStart(8)}  ${(r.spel || '-').padEnd(8)} ${String(r.mal).padStart(2)} mål`);
  }
  const slappta = G.k.spel.filter((s) => s.status === 'ute' || s.status === 'slut');
  sammanfattning.push({ seed, slutKassa: G.bolag.kassa, minKassa, lanAr, milstolpar, tek: G.forskning.klara.length, mal: G.mal.klara.length, basta: G.bolag.bastaBetyg, salda: G.bolag.totaltSalda,
    spel: slappta.length, fem: slappta.filter((s) => s.stj === 5 && !s.egen).map((s) => s.id), tagna: G.k.tagna.length, gta6: slappta.some((s) => s.final), logg });
}
console.log('\nSAMMANFATTNING');
for (const s of sammanfattning) {
  console.log(`  frö ${s.seed}: slutkassa ${kr(s.slutKassa, true)} · lägsta ${kr(s.minKassa, true)} · lån ${s.lanAr || 'aldrig'} · litet ${s.milstolpar.litet || '-'} · våning ${s.milstolpar.vaning || '-'} · studio ${s.milstolpar.studio || '-'} · HK ${s.milstolpar.hk || '-'} · mobil ${s.milstolpar.mobil || '-'} · tek ${s.tek} · mål ${s.mal} · bästa ${dec(s.basta, 1)} · sålda ${s.salda}`);
  console.log(`         spel ${s.spel} (★★★★★: ${s.fem.length} – ${s.fem.join(' ')}) · till rivaler ${s.tagna} · GTA VI ${s.gta6 ? 'JA' : 'nej'} · nej ${s.logg.nej} · exklusiva ${s.logg.exkl} · förhandlat bort ${s.logg.forlorade}`);
}
