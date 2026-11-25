// Forskningen: noder kostar FP och tar dagar. Ny teknik är dyr i början och blir billigare varje år.
//   pris = listpris × 0,88^(år − uppfinningsår), golv 30 %   ·   tid = 14 + 0,16 × listpris dagar (tak 150) / forskning ×
//   (GPS 27 FP → 18 dagar, RoboOS 62 FP → 24 dagar, som förlagan)
// En nod går att forska när året har kommit och föregångaren är klar. Antal samtidiga = kontorets labbspår.
// Konsolspelet (docs/KONSOLPLAN.md): konsolnoderna är öppna, telefonnoderna låsta tills TELEFONAVDELNINGEN (k-mobil)
// är forskad. Snabbstarten (telefonspelet) ser bara telefonnoderna.
import { NODER, K_NODER, ALLA_NODER, NOD } from '../data/noder.js';
import { DELAR, KAROSSER, RAMAR, LINSER, FUNKTIONER, ENHETER } from '../data/delar.js';
import { K_DELAR, K_ENHETER, K_FUNKTIONER } from '../data/konsol.js';
import { kontorAv } from '../data/varld.js';
import { arAv, arsdel, klamp, kr } from './bas.js';
import { $t } from '../core/i18n.js';
import { signal, nyhet, betala, arKonsolSpel, prisniva } from './spel.js';
import { kontorsVarden } from './kontor.js';
import { oppnaMobil } from './konsol.js';
import { APPLAGE } from '../core/applage.js';

export function fpPris(G, nod) {
  const ar = arsdel(G.dag);
  const f = ar <= nod.ar ? 1 : Math.max(0.3, Math.pow(0.88, ar - nod.ar));
  return Math.max(1, Math.round(nod.fp * f));
}
// noder som också kostar pengar (TELEFONAVDELNINGEN): en ny avdelning är ett bygge, inte bara forskning
export const krPris = (G, nod) => (nod.kostnadKr ? Math.round(nod.kostnadKr * prisniva(G) / 10_000) * 10_000 : 0);
export function dagar(G, nod) { return Math.max(3, Math.round(Math.min(150, 14 + 0.16 * nod.fp) / kontorsVarden(G).forskning)); }
export const labbspar = (G) => kontorAv(G.kontor.niva).labb;

// noderna spelaren ser: telefonspelet bara telefonernas, konsolspelet båda (telefonernas låsta tills avdelningen finns)
export const synligaNoder = (G) => (arKonsolSpel(G) ? (APPLAGE === 'konsol' ? K_NODER : [...K_NODER, ...NODER]) : NODER);
// spärren: en nod som inte hör till spelläget går inte att forska
const sparrad = (G, nod) => (arKonsolSpel(G) ? (nod.linje !== 'konsol' && !G.flaggor.mobil) : nod.linje === 'konsol');

// tillstånd: 'klar' | 'pagar' | 'redo' | 'uppfinns' (året inte kommit) | 'last' (föregångaren saknas eller spärrad)
export function status(G, nod) {
  if (G.forskning.klara.includes(nod.id)) return 'klar';
  if (G.forskning.pagar.some((p) => p.nod === nod.id)) return 'pagar';
  if (sparrad(G, nod)) return 'last';
  if (nod.foreg.some((f) => !G.forskning.klara.includes(f))) return 'last';
  if (arAv(G.dag) < nod.ar) return 'uppfinns';
  return 'redo';
}
export const redo = (G) => synligaNoder(G).filter((n) => status(G, n) === 'redo');
export function starta(G, nodId) {
  const n = NOD[nodId]; if (!n) return { ok: false, fel: $t('FINNS INTE') };
  const st = status(G, n);
  if (st !== 'redo') return { ok: false, fel: { klar: $t('REDAN FORSKAD'), pagar: $t('PÅGÅR REDAN'), last: sparrad(G, n) ? $t('KRÄVER TELEFONAVDELNINGEN') : $t('FORSKA FÖREGÅNGAREN FÖRST'), uppfinns: $t`UPPFINNS ${n.ar}` }[st] };
  if (G.forskning.pagar.length >= labbspar(G)) return { ok: false, fel: labbspar(G) > 1 ? $t('ALLA LABBSPÅR ÄR UPPTAGNA') : $t('LABBET FORSKAR REDAN PÅ NÅGOT') };
  const pris = fpPris(G, n), kronor = krPris(G, n);
  if (G.bolag.fp < pris) return { ok: false, fel: $t('FÖR LITE FORSKNINGSPOÄNG') };
  if (kronor && G.bolag.kassa < kronor) return { ok: false, fel: $t`KOSTAR ${kr(kronor)}` };
  G.bolag.fp -= pris;
  if (kronor) betala(G, kronor, 'forskning');
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
    const n = NOD[p.nod], namn = n.namn;
    nyhet(G, 'DU', $t`${G.bolag.namn} HAR FORSKAT FRAM ${namn}.`);
    if (n.lasUpp.typ === 'mobil') { oppnaMobil(G); continue; }   // eget stort kort
    // autopaus (SPELDESIGN §2.1) ska alltid synas: ett kort med OK som bygget klart och nödlånet,
    // inte en banner som försvinner medan tiden står still. Utan autopaus räcker bannern.
    const vad = vadLasesUpp(n);
    if (G.installningar.autopaus) signal(G, 'stor', { rubrik: $t('NY TEKNIK!'), text: vad ? `${namn}: ${vad}${/[.!]$/.test(vad) ? '' : '.'}` : `${namn}.`, paus: true, ljud: 'forskning' });
    else signal(G, 'banner', { text: vad ? $t`NY TEKNIK: ${namn} – ${vad}` : $t`NY TEKNIK: ${namn}`, farg: 'bla', ljud: 'forskning' });
  }
}
export function vadLasesUpp(n) {
  const u = n.lasUpp;
  switch (u.typ) {
    case 'del': { const d = DELAR[u.grupp].find((x) => x.id === u.id); return $t`NY DEL I DESIGNERN (${kr(d.kostnad)}/ST)`; }
    case 'kaross': return $t('NY KAROSS I DESIGNERN');
    case 'ram': return $t('TUNNARE RAMAR I DESIGNERN');
    case 'lins': return $t('EN LINS TILL PÅ BAKSIDAN');
    case 'funktion': return $t('NY FUNKTION (+0,1 I BETYG)');
    case 'enhet': return $t('NY ENHETSTYP!');
    case 'enhetsteknik': return $t`NY TEKNIK FÖR ${ENHETER.find((e) => e.id === u.enhet).namn}`;
    case 'kdel': { const d = K_DELAR[u.grupp].find((x) => x.id === u.id); return $t`NY KONSOLDEL I DESIGNERN (${kr(d.kostnad)}/ST)`; }
    case 'kkaross': return $t('NY KONSOLFORM I DESIGNERN');
    case 'kfunk': return $t('NY KONSOLFUNKTION (+0,1 I BETYG)');
    case 'kenhet': return $t`NY SORTS KONSOL: ${K_ENHETER.find((e) => e.id === u.id).namn}!`;
    case 'mobil': return $t('NU KAN NI GÖRA TELEFONER!');
    default: return '';
  }
}
export function leddTill(n) { return ALLA_NODER.filter((x) => x.foreg.includes(n.id)); }
export const antalKlara = (G) => G.forskning.klara.length;
export { NODER, K_NODER, ALLA_NODER, NOD, klamp, KAROSSER, RAMAR, LINSER, FUNKTIONER, K_FUNKTIONER };
