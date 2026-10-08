// De 28 målen (förlagans "GOAL n OF 28" med kontantbelöning). Ett i taget visas i kontoret.
import { NOD } from '../data/noder.js';
import { kontorsVarden } from './kontor.js';
import { tackning } from './marknad.js';
import { modellVinst } from './projekt.js';
import { intakt, signal, nyhet } from './spel.js';
import { kr } from './bas.js';

const salda = (G) => G.bolag.totaltSalda;
const andel = (G) => {
  // sålda senaste 4 veckorna / (16 × bas) ≈ marknadsandel i den del av världen man säljer i
  const s = G.produkter.reduce((sum, p) => sum + p.veckor.slice(-4).reduce((a, b) => a + b, 0), 0);
  const b = 100 * Math.pow(1.25, Math.max(0, G.dag / 365.25));
  return s / (16 * b * Math.max(0.3, tackning(G)));
};
export const MAL = [
  { nr: 1, text: 'STÄLL UT 2 BORD', belopp: 20_000, klart: (G) => G.kontor.bord.filter(Boolean).length >= 2 },
  { nr: 2, text: 'ANSTÄLL 2 PERSONER', belopp: 30_000, klart: (G) => G.personal.length >= 2 },
  { nr: 3, text: 'DESIGNA EN TELEFON', belopp: 50_000, klart: (G) => G.projekt.length > 0 || G.produkter.length > 0 },
  { nr: 4, text: 'LANSERA DIN FÖRSTA TELEFON', belopp: 80_000, klart: (G) => G.bolag.lanseringar >= 1 },
  { nr: 5, text: 'KÖP NYA KONTORSMÖBLER', belopp: 100_000, klart: (G) => !!G.flaggor.kopteMobel && kontorsVarden(G).kontorStj > 1.05 },
  { nr: 6, text: 'FORSKA FRAM EN TEKNIK', belopp: 120_000, klart: (G) => G.forskning.klara.length >= 1 },
  { nr: 7, text: 'SÄLJ 100 TELEFONER', belopp: 150_000, klart: (G) => salda(G) >= 100 },
  { nr: 8, text: 'FÅ MINST 6,5 I BETYG', belopp: 200_000, klart: (G) => G.bolag.bastaBetyg >= 6.5 },
  { nr: 9, text: 'TJÄNA IN FABRIKEN', belopp: 250_000, klart: (G) => G.produkter.some((p) => modellVinst(p) >= 0) },
  { nr: 10, text: 'LANSERA TELEFON NUMMER 2', belopp: 300_000, klart: (G) => G.bolag.lanseringar >= 2 },
  { nr: 11, text: 'KÖR EN REKLAMKAMPANJ', belopp: 400_000, klart: (G) => G.produkter.some((p) => p.kampanj !== 'ingen') },
  { nr: 12, text: 'SÄLJ 1 000 TELEFONER', belopp: 500_000, klart: (G) => salda(G) >= 1000 },
  { nr: 13, text: 'TRIVSEL ★★', belopp: 500_000, klart: (G) => kontorsVarden(G).trivselStj >= 2 },
  { nr: 14, text: 'FLYTTA TILL ETT LITET KONTOR', belopp: 800_000, klart: (G) => G.kontor.niva !== 'garage' },
  { nr: 15, text: 'ANSTÄLL NÅGON MED ★★', belopp: 600_000, klart: (G) => G.personal.some((p) => p.stjarnor >= 2) },
  { nr: 16, text: 'FÅ MINST 7,5 I BETYG', belopp: 1_000_000, klart: (G) => G.bolag.bastaBetyg >= 7.5 },
  { nr: 17, text: 'BÖRJA SÄLJA I EUROPA', belopp: 1_500_000, klart: (G) => G.marknad.regioner.includes('europa') },
  { nr: 18, text: 'LANSERA EN SURFPLATTA', belopp: 2_000_000, klart: (G) => G.bolag.enhetstyper.includes('platta') },
  { nr: 19, text: '10 % MARKNADSANDEL', belopp: 2_500_000, klart: (G) => andel(G) >= 0.1 },
  { nr: 20, text: 'FORSKA FRAM 25 TEKNIKER', belopp: 3_000_000, klart: (G) => G.forskning.klara.length >= 25 },
  { nr: 21, text: 'FLYTTA TILL EN KONTORSVÅNING', belopp: 4_000_000, klart: (G) => ['vaning', 'studio', 'hk'].includes(G.kontor.niva) },
  { nr: 22, text: 'BYGG ETT EGET OPERATIVSYSTEM', belopp: 6_000_000, klart: (G) => G.forskning.klara.includes('del-os-eget') },
  { nr: 23, text: 'LANSERA EN SMARTKLOCKA', belopp: 8_000_000, klart: (G) => G.bolag.enhetstyper.includes('klocka') },
  { nr: 24, text: 'FÅ MINST 9,0 I BETYG', belopp: 10_000_000, klart: (G) => G.bolag.bastaBetyg >= 9 },
  { nr: 25, text: 'FLYTTA TILL EN STUDIO', belopp: 15_000_000, klart: (G) => ['studio', 'hk'].includes(G.kontor.niva) },
  { nr: 26, text: 'SÄLJ I HELA VÄRLDEN', belopp: 25_000_000, klart: (G) => G.marknad.regioner.length >= 4 },
  { nr: 27, text: 'FORSKA FRAM 100 TEKNIKER', belopp: 40_000_000, klart: (G) => G.forskning.klara.length >= 100 },
  { nr: 28, text: 'FLYTTA TILL ETT HUVUDKONTOR', belopp: 100_000_000, klart: (G) => G.kontor.niva === 'hk' },
];
export const nastaMal = (G) => MAL.find((m) => !G.mal.klara.includes(m.nr)) || null;
export const marknadsandel = andel;

// mål klaras i ordning (förlagan visar ett i taget) – men flera kan bockas av samma dag
export function kollaMal(G) {
  for (let i = 0; i < 28; i++) {
    const m = nastaMal(G); if (!m || !m.klart(G)) return;
    G.mal.klara.push(m.nr);
    intakt(G, m.belopp, 'mal');
    nyhet(G, 'DU', `MÅL ${m.nr} AV 28 KLART: ${m.text}. BELÖNING ${kr(m.belopp)}.`);
    signal(G, 'mal', { nr: m.nr, text: m.text, belopp: m.belopp, konfetti: true, ljud: 'mal' });
  }
}
// utmärkelser: kosmetiska bedrifter
export const UTMARKELSER = [
  { id: 'hej', namn: 'HEJ VÄRLDEN', text: 'LANSERA DIN FÖRSTA TELEFON', klart: (G) => G.bolag.lanseringar >= 1 },
  { id: 'tusen', namn: 'TUSENKLUBBEN', text: 'SÄLJ 1 000 TELEFONER', klart: (G) => G.bolag.totaltSalda >= 1000 },
  { id: 'miljon', namn: 'MILJONEN', text: 'SÄLJ 1 000 000 TELEFONER', klart: (G) => G.bolag.totaltSalda >= 1e6 },
  { id: 'nia', namn: 'NIOAN', text: 'FÅ 9,0 ELLER MER', klart: (G) => G.bolag.bastaBetyg >= 9 },
  { id: 'tia', namn: 'PERFEKT TIA', text: 'FÅ 10,0', klart: (G) => G.bolag.bastaBetyg >= 10 },
  { id: 'flopp', namn: 'TOMATEN', text: 'FLOPPA MED UNDER 5,0', klart: (G) => G.produkter.some((p) => p.betyg < 5) },
  { id: 'labb', namn: 'LABBRÅTTAN', text: 'FORSKA FRAM 50 TEKNIKER', klart: (G) => G.forskning.klara.length >= 50 },
  { id: 'allt', namn: 'ALLT VETANDE', text: 'FORSKA FRAM ALLA 144 TEKNIKER', klart: (G) => G.forskning.klara.length >= 144 },
  { id: 'fem', namn: 'FAMILJEN', text: 'LANSERA FEM OLIKA SORTERS ENHETER', klart: (G) => G.bolag.enhetstyper.length >= 5 },
];
export function kollaUtmarkelser(G) {
  for (const u of UTMARKELSER) if (!G.mal.utmarkelser.includes(u.id) && u.klart(G)) {
    G.mal.utmarkelser.push(u.id);
    nyhet(G, 'DU', `${G.bolag.namn} FICK UTMÄRKELSEN "${u.namn}".`);
    signal(G, 'toast', { text: `UTMÄRKELSE: ${u.namn}`, farg: 'guld' });
  }
}
export { NOD };
