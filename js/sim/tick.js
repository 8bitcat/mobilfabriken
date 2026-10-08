// Dag-ticken – allt som händer under en speldag, i den här ordningen:
//  1 dag++ · 2 världshändelser · 3 forskning · 4 FP-inkomst · 5 löner · 6 bygget · 7–9 partier, försäljning, veckoslut
//  10 rivaler · 11 moral · 12 den 1:a (månadsrapport, kandidater, låneränta) · 13 nyår · 14 mål · 15 nödlån
import { arAv, forstaIManaden, nyarsdag, kr, dec, manadText } from './bas.js';
import { betala, intakt, signal, nyhet } from './spel.js';
import { handelserDag, rivalerDag, snitt } from './marknad.js';
import { dagligForskning } from './forskning.js';
import { fpPerDag, lonPerManad, dagligMoral, manadsKandidater } from './personal.js';
import { dagligtBygge, dagligForsaljning } from './projekt.js';
import { kollaMal, kollaUtmarkelser } from './mal.js';

export const NODLAN = 500_000;

export function dagTick(G) {
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
  if (G.bolag.kassa < 0) {
    G.lan += NODLAN; G.bolag.kassa += NODLAN;
    nyhet(G, 'DU', `BANKEN LÅNAR ${G.bolag.namn} ${kr(NODLAN)}. RÄNTAN ÄR 10 % OM ÅRET.`);
    signal(G, 'stor', { rubrik: 'NÖDLÅN', text: `KASSAN TOG SLUT. BANKEN LÅNADE ER ${kr(NODLAN)} – BETALA TILLBAKA I BOLAGET NÄR DET GÅR BÄTTRE.`, paus: true });
  }
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
  const basta = [...G.produkter].filter((p) => p.ar === a).sort((x, y) => y.betyg - x.betyg)[0];
  G.flaggor.nyarsrapport = { ar: a, intakt: s.intakt, kostnad: s.kostnad, vinst: s.intakt - s.kostnad, basta: basta ? { namn: basta.namn, betyg: basta.betyg } : null, snitt: snitt(G.dag) };
  nyhet(G, 'VÄRLD', `GOTT NYTT ${a + 1}! KRITIKERNA HÖJER KRAVEN – SNITTET ÄR NU ${dec(snitt(G.dag))}.`);
  signal(G, 'nyar', { ar: a + 1, paus: true });
}

// kör n dagar i ett svep (tester och "hoppa fram")
export function koraDagar(G, n) { for (let i = 0; i < n; i++) dagTick(G); }
