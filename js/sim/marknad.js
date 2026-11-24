// Marknaden: kritikernas snitt, rimligt pris, efterfrågan per vecka, rivalernas nya modeller och världshändelser.
//   Efterfrågan/vecka = BAS(år) × TÄCKNING × ENHET × 2^((betyg − snitt)/2) × (rimligt/pris)^1,5 × RYKTE × BUZZ × DELNING × HÄNDELSER
//   BAS = 100 köpare/vecka 2007, +20 % per år
//   rimligt pris = 1 740 kr × 1,06^år × (1 + 0,25 × (betyg − snitt)) × enhetens prisfaktor (golv 15 %)
//   BUZZ = 0,977^(vecka−1) + hype × 0,90^(vecka−1) (+ viral och prissänkning)
// Kalibrerat mot förlagan: Pixel Phone 1 (6,3 / 2 120 kr) får ~22 köpare första veckan och 71 % buzz vecka 15.
// Konsolerna (docs/KONSOLPLAN.md) har en egen marknad från 1982:
//   BAS = 60 × 1,09^(år − 1982) · rimligt = 1 990 kr × 1,03^(år − 1982) × (1 + 0,25 × (betyg − snitt))
//   snitt = 6,2 → 7,4 (1982 → 2012) · BUZZ klingar av 0,7 % i veckan (en konsol säljer i åratal)
//   × BIBLIOTEK = 0,5 + spelens dragkraft (tak 3): utan spel säljer konsolen hälften
import { RIVALER, REGIONER, HANDELSER } from '../data/varld.js';
import { K_HANDELSER } from '../data/konsol-varld.js';
import { enhetAv } from '../data/delar.js';
import { kEnhetAv, kNivaAv } from '../data/konsol.js';
import { arKonsolEnhet } from '../data/linjer.js';
import { arsdel, arAv, dagForAr, dagIAret, slump, slumpInt, klamp, kr, dec, datumAv } from './bas.js';
import { nyhet, signal, arKonsolSpel, prisniva } from './spel.js';
import { $t } from '../core/i18n.js';

const tSnitt = (dag) => 6.2 + klamp((arsdel(dag) - 2007) / 13, 0, 1) * 1.0;
export const kSnitt = (dag) => 6.2 + klamp((arsdel(dag) - 1982) / 30, 0, 1) * 1.2;
// linje: 'telefon' (förval) eller 'konsol'
export const snitt = (dag, linje) => (linje === 'konsol' ? kSnitt(dag) : tSnitt(dag));
export const marknadspris = (dag) => 1740 * Math.pow(1.06, Math.max(0, arsdel(dag) - 2007));
export const bas = (dag) => 100 * Math.pow(1.2, Math.max(0, arsdel(dag) - 2007));
export const kMarknadspris = (dag) => 1990 * Math.pow(1.03, Math.max(0, arsdel(dag) - 1982));
export const kBas = (dag) => 60 * Math.pow(1.09, Math.max(0, arsdel(dag) - 1982));
// golv 15 %: ett betyg mer än fyra under snittet gav annars negativt pris → NaN i hela försäljningen.
// enhet: en laptop med samma betyg är värd mer än en telefon (ENHETER.pris i data/delar.js). Rivalerna är telefoner.
// Konsolernas enheter (hem, ficka, hybrid, vr) räknas på konsolmarknaden.
export const rimligtPris = (dag, betyg, enhet = 'telefon') => (arKonsolEnhet(enhet)
  ? kMarknadspris(dag) * Math.max(0.15, 1 + 0.25 * (betyg - kSnitt(dag))) * kEnhetAv(enhet).pris
  : marknadspris(dag) * Math.max(0.15, 1 + 0.25 * (betyg - tSnitt(dag))) * enhetAv(enhet).pris);
export const tackning = (G) => G.marknad.regioner.reduce((s, id) => s + (REGIONER.find((r) => r.id === id)?.andel || 0), 0);
export const prisFaktor = (rimligt, pris) => { const f = Math.pow(Math.max(0, rimligt) / Math.max(1, pris), 1.5); return Number.isFinite(f) ? klamp(f, 0.15, 2.5) : 0.15; };
// vad en ny marknad kostar (BOLAGET → MARKNADER): i konsolspelet lägre innan 2007
export const regionPris = (G, r) => Math.round(r.pris * prisniva(G) / 10_000) * 10_000;

// Händelserna som kan inträffa: telefonspelet har sina, konsolspelet sina – och telefonernas (utom jul och
// komponentbrist, som konsolerna redan har) när telefonavdelningen är öppen.
export const handelseLista = (G) => (arKonsolSpel(G)
  ? (G.flaggor.mobil ? [...K_HANDELSER, ...HANDELSER.filter((h) => !h.jul && h.id !== 'brist')] : K_HANDELSER)
  : HANDELSER);
const handelseAv = (id) => HANDELSER.find((x) => x.id === id) || K_HANDELSER.find((x) => x.id === id);

export function aktivaEffekter(G) {
  const e = { efterfragan: 1, styck: 1, vikt: {}, utanHemknapp: 1, natBonus: null, studios: 1, spelsalj: 1, media: null };
  for (const h of G.marknad.handelser) {
    const H = handelseAv(h.id); if (!H) continue;
    const f = H.effekt;
    if (f.efterfragan) e.efterfragan *= f.efterfragan;
    if (f.styck) e.styck *= f.styck;
    if (f.os) e.vikt.os = f.os;
    if (f.selfie) e.vikt.selfie = f.selfie;
    if (f.utanHemknapp) e.utanHemknapp = f.utanHemknapp;
    if (f.natBonus) e.natBonus = { min: f.natMin, faktor: f.natBonus };
    if (f.studios) e.studios *= f.studios;
    if (f.spelsalj) e.spelsalj *= f.spelsalj;
    if (f.mediaBonus) e.media = { min: f.mediaMin, faktor: f.mediaBonus };
  }
  return e;
}

export const veckaAv = (p, dag) => Math.floor((dag - p.lanseradDag) / 7) + 1;
export function buzz(p, dag) {
  const v = veckaAv(p, dag);
  let b = Math.pow(p.design?.linje === 'konsol' ? 0.993 : 0.977, v - 1) + p.hype * Math.pow(0.9, v - 1);
  if (p.viralDag != null) b += 0.5 * Math.pow(0.9, Math.floor((dag - p.viralDag) / 7));
  if (p.prisDag != null) b += 0.1 * Math.pow(0.9, Math.floor((dag - p.prisDag) / 7));
  return b;
}
export function veckoEfterfragan(G, p, dag = G.dag, pris = p.pris) {
  if (p.design.linje === 'konsol') return kVeckoEfterfragan(G, p, dag, pris);
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

// ---------- konsolerna ----------
// Ett spels dragkraft: hur många fler som köper konsolen för spelets skull. Klingar av 20 % per år (golv 35 %).
const DRAG = [0, 0.1, 0.18, 0.28, 0.4, 0.55];
export function dragkraft(s, dag) {
  if (s.status !== 'ute') return 0;
  const ar = Math.max(0, (dag - s.slappDag) / 365);
  return DRAG[s.stj] * (s.ss ? 1.6 : 1) * (s.packin ? 1.3 : 1) * (s.exklusiv ? 1.5 : 1) * (s.fickaBonus || 1) * Math.max(0.35, Math.pow(0.8, ar));
}
// BIBLIOTEK = 0,5 + Σ dragkraft (tak 2,5). En bakåtkompatibel konsol får hälften av spelen på bolagets äldre
// konsoler av samma sort.
export function bibliotek(G, p, dag = G.dag) {
  if (!G.k) return 1;
  let sum = 0;
  const bakat = p.design.funktioner?.includes('bakat');
  // prognos för en konsol som inte lanserats (p.prognos = byggets id): spelet i lådan och lanseringsspelen räknas som släppta
  if (p.prognos) {
    if (p.design.packin) sum += dragkraft({ status: 'ute', slappDag: dag, stj: p.packinStj || 2, packin: true }, dag);
    for (const s of G.k.spel) if (s.konsol === p.prognos) sum += dragkraft({ ...s, status: 'ute', slappDag: dag }, dag);
  }
  for (const s of G.k.spel) {
    if (s.konsol === p.id) sum += dragkraft(s, dag);
    else if (bakat) { const q = G.produkter.find((x) => x.id === s.konsol); if (q && q !== p && q.design.enhet === p.design.enhet && q.lanseradDag < p.lanseradDag) sum += 0.5 * dragkraft(s, dag); }
  }
  return 0.5 + Math.min(2.5, sum);
}
export function kVeckoEfterfragan(G, p, dag = G.dag, pris = p.pris) {
  const enhet = kEnhetAv(p.design.enhet);
  const egna = G.produkter.filter((x) => x.aktiv && x.design.enhet === p.design.enhet).length;
  const delning = 1 / (1 + 0.25 * Math.max(0, egna - 1));
  const eff = aktivaEffekter(G);
  let h = eff.efterfragan;
  if (eff.media && kNivaAv('media', p.design.val.media) >= kNivaAv('media', eff.media.min)) h *= eff.media.faktor;
  const flopp = p.betyg < 5 && veckaAv(p, dag) <= 8 ? 0.5 : 1;
  const skandal = p.skandal && veckaAv(p, dag) >= 2 && veckaAv(p, dag) <= 4 && !p.uppdaterad ? 0.8 : 1;
  return kBas(dag) * tackning(G) * enhet.bas * Math.pow(2, (p.betyg - kSnitt(dag)) / 2) * prisFaktor(rimligtPris(dag, p.betyg, enhet.id), pris)
    * G.bolag.rykte * buzz(p, dag) * delning * bibliotek(G, p, dag) * h * flopp * skandal;
}

// ungefärlig efterfrågan för en design som inte lanserats än (granskningen, lanseringspanelen)
export function prognos(G, design, betyg, pris, hype = 0) {
  const p = { id: '?prognos', design, betyg, pris, hype, lanseradDag: G.dag, aktiv: true };
  const ord = G.produkter; G.produkter = [...ord, p];
  const v = veckoEfterfragan(G, p, G.dag, pris);
  G.produkter = ord; return v;
}

// ---------- rivalerna ----------
// Förlagans nio står i RIVALER; ett sålt bolag från arvet bär sin egen definition i r.egen (se nyttSpel).
// En rival som inte finns någonstans (gammal eller trasig sparning) blir en vanlig medelrival i stället för att krascha.
const rivalDef = (r) => RIVALER.find((x) => x.id === r.id) || r.egen
  || { bolag: String(r.id || $t('RIVALEN')).toUpperCase().slice(0, 22), modell: $t('MODELL'), offset: 0, prisF: 1, dag: 180, farg: 0x8c93b4 };
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
    const bolag = R.bolag, modell = R.modell;
    nyhet(G, 'RIVAL', $t`${bolag} SLÄPPER ${modell} ${r.gen}. KRITIKERNA GER DEN ${dec(r.betyg)}/10.`);
    signal(G, 'ticker', { text: $t`${bolag} SLÄPPER ${modell} ${r.gen} – ${dec(r.betyg)}/10` });
  }
}
export const rivalModell = (r) => { const R = rivalDef(r); return { ...R, ...r, namn: `${R.modell} ${r.gen}` }; };

// ---------- världshändelser ----------
export function handelserDag(G) {
  const a = arAv(G.dag), di = dagIAret(G.dag), d = datumAv(G.dag), lista = handelseLista(G);
  // slut
  for (const h of [...G.marknad.handelser]) if (G.dag >= h.slutDag) {
    G.marknad.handelser = G.marknad.handelser.filter((x) => x !== h);
    const H = handelseAv(h.id); if (H && !H.jul) nyhet(G, 'VÄRLD', $t`${H.namn} ÄR ÖVER.`);
  }
  const starta = (H) => {
    if (G.marknad.handelser.some((x) => x.id === H.id)) return;
    G.marknad.handelser.push({ id: H.id, startDag: G.dag, slutDag: G.dag + H.langd });
    const namn = H.namn, text = H.text;
    nyhet(G, 'VÄRLD', text);
    signal(G, 'ticker', { text: namn + ': ' + text });
    if (!H.jul) signal(G, 'banner', { text: $t`VÄRLDSHÄNDELSE: ${namn}`, farg: 'lila' });
  };
  // slumphändelserna börjar året efter starten (telefonerna 2008, konsolerna 1983)
  const slumpFran = arKonsolSpel(G) ? 1983 : 2008;
  for (const H of lista) {
    if (H.vid && H.vid.ar === a && H.vid.dag === di) starta(H);
    if (H.jul && d.getUTCMonth() === 11 && d.getUTCDate() === 1) starta(H);
    if (H.slump && d.getUTCDate() === 15 && a >= slumpFran && slump(G) < H.slump) starta(H);
  }
}
export const aktivaHandelser = (G) => G.marknad.handelser.map((h) => ({ ...h, ...handelseAv(h.id) }));
export { kr };
