// Forskningen: noder kostar FP och tar dagar. Ny teknik är dyr i början och blir billigare varje år.
//   pris = listpris × 0,88^(år − uppfinningsår), golv 30 %   ·   tid = 14 + 0,16 × listpris dagar (tak 150) / forskning ×
//   (GPS 27 FP → 18 dagar, RoboOS 62 FP → 24 dagar, som förlagan)
// En nod går att forska när året har kommit och föregångaren är klar. Antal samtidiga = kontorets labbspår.
import { NODER, NOD } from '../data/noder.js';
import { DELAR, KAROSSER, RAMAR, LINSER, FUNKTIONER, ENHETER } from '../data/delar.js';
import { kontorAv } from '../data/varld.js';
import { arAv, arsdel, klamp } from './bas.js';
import { signal, nyhet } from './spel.js';
import { kontorsVarden } from './kontor.js';

export function fpPris(G, nod) {
  const ar = arsdel(G.dag);
  const f = ar <= nod.ar ? 1 : Math.max(0.3, Math.pow(0.88, ar - nod.ar));
  return Math.max(1, Math.round(nod.fp * f));
}
export function dagar(G, nod) { return Math.max(3, Math.round(Math.min(150, 14 + 0.16 * nod.fp) / kontorsVarden(G).forskning)); }
export const labbspar = (G) => kontorAv(G.kontor.niva).labb;

// tillstånd: 'klar' | 'pagar' | 'redo' | 'uppfinns' (året inte kommit) | 'last' (föregångaren saknas)
export function status(G, nod) {
  if (G.forskning.klara.includes(nod.id)) return 'klar';
  if (G.forskning.pagar.some((p) => p.nod === nod.id)) return 'pagar';
  if (nod.foreg.some((f) => !G.forskning.klara.includes(f))) return 'last';
  if (arAv(G.dag) < nod.ar) return 'uppfinns';
  return 'redo';
}
export const redo = (G) => NODER.filter((n) => status(G, n) === 'redo');
export function starta(G, nodId) {
  const n = NOD[nodId]; if (!n) return { ok: false, fel: 'FINNS INTE' };
  const st = status(G, n);
  if (st !== 'redo') return { ok: false, fel: { klar: 'REDAN FORSKAD', pagar: 'PÅGÅR REDAN', last: 'FORSKA FÖREGÅNGAREN FÖRST', uppfinns: 'UPPFINNS ' + n.ar }[st] };
  if (G.forskning.pagar.length >= labbspar(G)) return { ok: false, fel: labbspar(G) > 1 ? 'ALLA LABBSPÅR ÄR UPPTAGNA' : 'LABBET FORSKAR REDAN PÅ NÅGOT' };
  const pris = fpPris(G, n);
  if (G.bolag.fp < pris) return { ok: false, fel: 'FÖR LITE FORSKNINGSPOÄNG' };
  G.bolag.fp -= pris;
  const t = dagar(G, n);
  G.forskning.pagar.push({ nod: n.id, dagarKvar: t, totalt: t, startDag: G.dag });
  G.flaggor.startatForskning = true;
  return { ok: true };
}
export function dagligForskning(G) {
  for (const p of [...G.forskning.pagar]) {
    p.dagarKvar--;
    if (p.dagarKvar > 0) continue;
    G.forskning.pagar = G.forskning.pagar.filter((x) => x !== p);
    G.forskning.klara.push(p.nod);
    const n = NOD[p.nod];
    nyhet(G, 'DU', `${G.bolag.namn} HAR FORSKAT FRAM ${n.namn}.`);
    // autopaus (SPELDESIGN §2.1) ska alltid synas: ett kort med OK som bygget klart och nödlånet,
    // inte en banner som försvinner medan tiden står still. Utan autopaus räcker bannern.
    const vad = vadLasesUpp(n);
    if (G.installningar.autopaus) signal(G, 'stor', { rubrik: 'NY TEKNIK!', text: vad ? `${n.namn}: ${vad}${/[.!]$/.test(vad) ? '' : '.'}` : `${n.namn}.`, paus: true, ljud: 'forskning' });
    else signal(G, 'banner', { text: vad ? `NY TEKNIK: ${n.namn} – ${vad}` : `NY TEKNIK: ${n.namn}`, farg: 'bla', ljud: 'forskning' });
  }
}
export function vadLasesUpp(n) {
  const u = n.lasUpp;
  switch (u.typ) {
    case 'del': { const d = DELAR[u.grupp].find((x) => x.id === u.id); return `NY DEL I DESIGNERN (${d.kostnad} KR/ST)`; }
    case 'kaross': return 'NY KAROSS I DESIGNERN';
    case 'ram': return 'TUNNARE RAMAR I DESIGNERN';
    case 'lins': return 'EN LINS TILL PÅ BAKSIDAN';
    case 'funktion': return 'NY FUNKTION (+0,1 I BETYG)';
    case 'enhet': return 'NY ENHETSTYP!';
    case 'enhetsteknik': return 'NY TEKNIK FÖR ' + ENHETER.find((e) => e.id === u.enhet).namn;
    default: return '';
  }
}
export function leddTill(n) { return NODER.filter((x) => x.foreg.includes(n.id)); }
export const antalKlara = (G) => G.forskning.klara.length;
export { NODER, NOD, klamp, KAROSSER, RAMAR, LINSER, FUNKTIONER };
