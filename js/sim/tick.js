// Dag-ticken – allt som händer under en speldag, i den här ordningen:
//  1 dag++ · 2 världshändelser · 3 forskning · 4 FP-inkomst · 5 löner · 6 bygget · 7–9 partier, försäljning, veckoslut
//  10 rivaler · 11 moral · 12 den 1:a (månadsrapport, kandidater, låneränta) · 13 nyår · 14 mål · 15 nödlån
import { arAv, forstaIManaden, nyarsdag, kr, dec, manadText } from './bas.js';
import { betala, signal, nyhet, lana, NODLAN, SALJ_AR } from './spel.js';
import { handelserDag, rivalerDag, snitt, rimligtPris } from './marknad.js';
import { dagligForskning } from './forskning.js';
import { fpPerDag, lonPerManad, dagligMoral, manadsKandidater } from './personal.js';
import { dagligtBygge, dagligForsaljning } from './projekt.js';
import { kollaMal, kollaUtmarkelser } from './mal.js';

export { NODLAN };
const NODLAN_KORT = 30;   // NÖDLÅN-kortet (helskärm + paus) högst var 30:e dag – däremellan räcker en toast

export function dagTick(G) {
  if (!lagade.has(G)) lagaSpel(G);
  G.dag++;
  handelserDag(G);
  dagligForskning(G);
  G.bolag.fp += fpPerDag(G);
  if (G.personal.length) betala(G, lonPerManad(G) / 30, 'loner');
  dagligtBygge(G);
  dagligForsaljning(G);
  rivalerDag(G);
  dagligMoral(G);
  if (forstaIManaden(G.dag)) manad(G);
  if (nyarsdag(G.dag)) nyar(G);
  kollaMal(G);
  kollaUtmarkelser(G);
  if (G.dag % 7 === 0) { G.stat.kassa.push([G.dag, Math.round(G.bolag.kassa)]); if (G.stat.kassa.length > 1100) G.stat.kassa.shift(); }
  if (G.bolag.kassa < 0) nodlan(G);
}

// Nödlånet: kassa < 0 → banken lånar ut 500 000 kr (flera på en gång om det behövs, så att kassan blir plus).
// Första gången och sedan högst var 30:e dag kommer kortet med paus och förklaring; annars en toast.
function nodlan(G) {
  const belopp = Math.ceil(-G.bolag.kassa / NODLAN) * NODLAN;
  lana(G, belopp);
  const forra = G.flaggor.nodlanDag;
  if (forra == null || G.dag - forra >= NODLAN_KORT) {
    G.flaggor.nodlanDag = G.dag;
    const lon = lonPerManad(G);
    const varfor = lon ? `LÖNERNA ÄR ${kr(lon)} I MÅNADEN. SÄLJ FLER TELEFONER ELLER HA FÄRRE ANSTÄLLDA.` : 'SÄLJ FLER TELEFONER.';
    signal(G, 'stor', { rubrik: 'NÖDLÅN', text: `KASSAN TOG SLUT. BANKEN LÅNADE ER ${kr(belopp)} (10 % RÄNTA OM ÅRET). ${varfor} BETALA TILLBAKA I BOLAGET NÄR DET GÅR BÄTTRE.`, paus: true });
  } else signal(G, 'toast', { text: `NYTT NÖDLÅN +${kr(belopp, true)} · LÅN TOTALT ${kr(G.lan, true)}`, farg: 'rod' });
}

// Lagar sparningar från 0.1.x där ett negativt rimligt pris gav NaN (JSON sparar NaN som null) i lager,
// sålda och veckorna. Körs en gång per laddat spel (första dagen); Spara.ladda får gärna anropa den direkt.
// Lager + sålda = tillverkade gäller alltid, så det som saknas räknas fram ur det andra. Saknas båda räknas
// veckorna som gick att läsa som sålda och resten som lager – under NaN-veckorna kom inga pengar in.
const lagade = new WeakSet();
export function lagaSpel(G) {
  if (!G || lagade.has(G)) return G;
  lagade.add(G);
  const ok = Number.isFinite, tal = (v) => (ok(v) ? Math.max(0, v) : 0);
  let summa = 0;
  for (const p of G.produkter || []) {
    for (const k of ['missade', 'veckaNu', 'forraVeckan', 'tillverkade']) p[k] = tal(p[k]);
    p.veckor = Array.isArray(p.veckor) ? p.veckor.map(tal) : [];
    if (!ok(p.salda) || !ok(p.lager)) {
      if (ok(p.lager)) p.salda = p.tillverkade - p.lager;
      else if (ok(p.salda)) p.lager = p.aktiv ? p.tillverkade - p.salda : 0;
      else { p.salda = Math.min(p.tillverkade, p.veckor.reduce((a, b) => a + b, 0)); p.lager = p.aktiv ? p.tillverkade - p.salda : 0; }
    }
    p.salda = tal(p.salda); p.lager = tal(p.lager);
    if (!ok(p.intakt)) p.intakt = p.salda * (p.pris || 0);
    // rimligt pris vid lanseringen (taket i andraPris) – nu med enhetens prisfaktor
    if (p.design && Number.isFinite(p.betyg)) p.rimligt = Math.round(rimligtPris(p.lanseradDag, p.betyg, p.design.enhet));
    summa += p.salda;
  }
  if (G.bolag && !(Number.isFinite(G.bolag.totaltSalda) && G.bolag.totaltSalda >= summa)) G.bolag.totaltSalda = summa;
  return G;
}

function manad(G) {
  manadsKandidater(G);
  if (G.lan > 0) betala(G, G.lan * 0.1 / 12, 'ranta');
  // månadsrapport (förra månaden)
  const a = arAv(G.dag - 1), s = G.stat.ar[a] || { intakt: 0, kostnad: 0 };
  const forra = G.stat.manad || { intakt: 0, kostnad: 0 };
  const m = { intakt: s.intakt - (forra.ar === a ? forra.intakt : 0), kostnad: s.kostnad - (forra.ar === a ? forra.kostnad : 0) };
  G.stat.manad = { ar: a, intakt: s.intakt, kostnad: s.kostnad };
  if (G.dag > 1 && (m.intakt || m.kostnad)) signal(G, 'toast', { text: `${manadText(G.dag - 1)}: ${m.intakt - m.kostnad >= 0 ? '+' : ''}${kr(m.intakt - m.kostnad)}`, farg: m.intakt >= m.kostnad ? 'gron' : 'rod', ljud: 'mynt' });
}

function nyar(G) {
  const a = arAv(G.dag) - 1, s = G.stat.ar[a] || { intakt: 0, kostnad: 0 };
  const basta = [...G.produkter].filter((p) => arAv(p.lanseradDag) === a).sort((x, y) => y.betyg - x.betyg)[0];
  // 1 jan 2027 (tills Slutgalan finns): rapporten säger att bolaget nu går att sälja
  const salj = a + 1 === SALJ_AR;
  G.flaggor.nyarsrapport = { ar: a, intakt: s.intakt, kostnad: s.kostnad, vinst: s.intakt - s.kostnad, basta: basta ? { namn: basta.namn, betyg: basta.betyg } : null, snitt: snitt(G.dag), salj };
  nyhet(G, 'VÄRLD', `GOTT NYTT ${a + 1}! KRITIKERNA HÖJER KRAVEN – SNITTET ÄR NU ${dec(snitt(G.dag))}.`);
  if (salj) nyhet(G, 'DU', `${SALJ_AR - 2007} ÅR I BRANSCHEN! NU KAN DU SÄLJA ${G.bolag.namn} (BOLAGET > SÄLJ BOLAGET) ELLER SPELA VIDARE.`);
  signal(G, 'nyar', { ar: a + 1, paus: true });
}

// kör n dagar i ett svep (tester och "hoppa fram")
export function koraDagar(G, n) { for (let i = 0; i < n; i++) dagTick(G); }
