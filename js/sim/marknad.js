// Marknaden: kritikernas snitt, rimligt pris, efterfrågan per vecka, rivalernas nya modeller och världshändelser.
//   Efterfrågan/vecka = BAS(år) × TÄCKNING × ENHET × 2^((betyg − snitt)/2) × (rimligt/pris)^1,5 × RYKTE × BUZZ × DELNING × HÄNDELSER
//   BAS = 100 köpare/vecka 2007, +20 % per år
//   rimligt pris = 1 740 kr × 1,06^år × (1 + 0,25 × (betyg − snitt)) × enhetens prisfaktor (golv 15 %)
//   BUZZ = 0,977^(vecka−1) + hype × 0,90^(vecka−1) (+ viral och prissänkning)
// Kalibrerat mot förlagan: Pixel Phone 1 (6,3 / 2 120 kr) får ~22 köpare första veckan och 71 % buzz vecka 15.
import { RIVALER, REGIONER, HANDELSER } from '../data/varld.js';
import { enhetAv } from '../data/delar.js';
import { arsdel, arAv, dagForAr, dagIAret, slump, slumpInt, klamp, kr, dec, datumAv } from './bas.js';
import { nyhet, signal } from './spel.js';

export const snitt = (dag) => 6.2 + klamp((arsdel(dag) - 2007) / 13, 0, 1) * 1.0;
export const marknadspris = (dag) => 1740 * Math.pow(1.06, Math.max(0, arsdel(dag) - 2007));
export const bas = (dag) => 100 * Math.pow(1.2, Math.max(0, arsdel(dag) - 2007));
// golv 15 %: ett betyg mer än fyra under snittet gav annars negativt pris → NaN i hela försäljningen.
// enhet: en laptop med samma betyg är värd mer än en telefon (ENHETER.pris i data/delar.js). Rivalerna är telefoner.
export const rimligtPris = (dag, betyg, enhet = 'telefon') => marknadspris(dag) * Math.max(0.15, 1 + 0.25 * (betyg - snitt(dag))) * enhetAv(enhet).pris;
export const tackning = (G) => G.marknad.regioner.reduce((s, id) => s + (REGIONER.find((r) => r.id === id)?.andel || 0), 0);
export const prisFaktor = (rimligt, pris) => { const f = Math.pow(Math.max(0, rimligt) / Math.max(1, pris), 1.5); return Number.isFinite(f) ? klamp(f, 0.15, 2.5) : 0.15; };

export function aktivaEffekter(G) {
  const e = { efterfragan: 1, styck: 1, vikt: {}, utanHemknapp: 1, natBonus: null };
  for (const h of G.marknad.handelser) {
    const H = HANDELSER.find((x) => x.id === h.id); if (!H) continue;
    const f = H.effekt;
    if (f.efterfragan) e.efterfragan *= f.efterfragan;
    if (f.styck) e.styck *= f.styck;
    if (f.os) e.vikt.os = f.os;
    if (f.selfie) e.vikt.selfie = f.selfie;
    if (f.utanHemknapp) e.utanHemknapp = f.utanHemknapp;
    if (f.natBonus) e.natBonus = { min: f.natMin, faktor: f.natBonus };
  }
  return e;
}

export const veckaAv = (p, dag) => Math.floor((dag - p.lanseradDag) / 7) + 1;
export function buzz(p, dag) {
  const v = veckaAv(p, dag);
  let b = Math.pow(0.977, v - 1) + p.hype * Math.pow(0.9, v - 1);
  if (p.viralDag != null) b += 0.5 * Math.pow(0.9, Math.floor((dag - p.viralDag) / 7));
  if (p.prisDag != null) b += 0.1 * Math.pow(0.9, Math.floor((dag - p.prisDag) / 7));
  return b;
}
export function veckoEfterfragan(G, p, dag = G.dag, pris = p.pris) {
  const enhet = enhetAv(p.design.enhet);
  const egna = G.produkter.filter((x) => x.aktiv && x.design.enhet === p.design.enhet).length;
  const delning = 1 / (1 + 0.25 * Math.max(0, egna - 1));
  const eff = aktivaEffekter(G);
  let h = eff.efterfragan;
  if (!p.design.hemknapp) h *= eff.utanHemknapp;
  if (eff.natBonus && ['5g', '5ga'].includes(p.design.val.nat)) h *= eff.natBonus.faktor;
  const flopp = p.betyg < 5 && veckaAv(p, dag) <= 8 ? 0.5 : 1;
  const skandal = p.skandal && veckaAv(p, dag) >= 2 && veckaAv(p, dag) <= 4 && !p.uppdaterad ? 0.8 : 1;
  return bas(dag) * tackning(G) * enhet.bas * Math.pow(2, (p.betyg - snitt(dag)) / 2) * prisFaktor(rimligtPris(dag, p.betyg, enhet.id), pris)
    * G.bolag.rykte * buzz(p, dag) * delning * h * flopp * skandal;
}
// ungefärlig efterfrågan för en design som inte lanserats än (granskningen, lanseringspanelen)
export function prognos(G, design, betyg, pris, hype = 0) {
  const p = { design, betyg, pris, hype, lanseradDag: G.dag, aktiv: true };
  const ord = G.produkter; G.produkter = [...ord, p];
  const v = veckoEfterfragan(G, p, G.dag, pris);
  G.produkter = ord; return v;
}

// ---------- rivalerna ----------
// Förlagans nio står i RIVALER; ett sålt bolag från arvet bär sin egen definition i r.egen (se nyttSpel).
// En rival som inte finns någonstans (gammal eller trasig sparning) blir en vanlig medelrival i stället för att krascha.
const rivalDef = (r) => RIVALER.find((x) => x.id === r.id) || r.egen
  || { bolag: String(r.id || 'RIVALEN').toUpperCase().slice(0, 22), modell: 'MODELL', offset: 0, prisF: 1, dag: 180, farg: 0x8c93b4 };
export function rivalerDag(G) {
  for (const r of G.marknad.rivaler) {
    if (G.dag < r.nastaDag) continue;
    const R = rivalDef(r);
    r.gen++;
    const brus = arAv(G.dag) === 2007 ? 0 : (slump(G) - 0.5) * 0.6;
    r.betyg = Math.round(klamp(snitt(G.dag) + R.offset + brus, 1, 9.8) * 10) / 10;
    r.pris = Math.round(rimligtPris(G.dag, r.betyg) * R.prisF / 10) * 10;
    r.lanseradDag = G.dag;
    r.nastaDag = dagForAr(arAv(G.dag) + 1) + R.dag + slumpInt(G, -12, 12);
    nyhet(G, 'RIVAL', `${R.bolag} SLÄPPER ${R.modell} ${r.gen}. KRITIKERNA GER DEN ${dec(r.betyg)}/10.`);
    signal(G, 'ticker', { text: `${R.bolag} SLÄPPER ${R.modell} ${r.gen} – ${dec(r.betyg)}/10` });
  }
}
export const rivalModell = (r) => { const R = rivalDef(r); return { ...R, ...r, namn: `${R.modell} ${r.gen}` }; };

// ---------- världshändelser ----------
export function handelserDag(G) {
  const a = arAv(G.dag), di = dagIAret(G.dag), d = datumAv(G.dag);
  // slut
  for (const h of [...G.marknad.handelser]) if (G.dag >= h.slutDag) {
    G.marknad.handelser = G.marknad.handelser.filter((x) => x !== h);
    const H = HANDELSER.find((x) => x.id === h.id); if (H && !H.jul) nyhet(G, 'VÄRLD', `${H.namn} ÄR ÖVER.`);
  }
  const starta = (H) => {
    if (G.marknad.handelser.some((x) => x.id === H.id)) return;
    G.marknad.handelser.push({ id: H.id, startDag: G.dag, slutDag: G.dag + H.langd });
    nyhet(G, 'VÄRLD', H.text);
    signal(G, 'ticker', { text: H.namn + ': ' + H.text });
    if (!H.jul) signal(G, 'banner', { text: 'VÄRLDSHÄNDELSE: ' + H.namn, farg: 'lila' });
  };
  for (const H of HANDELSER) {
    if (H.vid && H.vid.ar === a && H.vid.dag === di) starta(H);
    if (H.jul && d.getUTCMonth() === 11 && d.getUTCDate() === 1) starta(H);
    if (H.slump && d.getUTCDate() === 15 && a >= 2008 && slump(G) < H.slump) starta(H);
  }
}
export const aktivaHandelser = (G) => G.marknad.handelser.map((h) => ({ ...h, ...HANDELSER.find((x) => x.id === h.id) }));
export { kr };
