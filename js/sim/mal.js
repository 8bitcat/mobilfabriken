// De 28 målen (förlagans "GOAL n OF 28" med kontantbelöning). Ett i taget visas i kontoret.
import { NOD } from '../data/noder.js';
import { kontorsVarden } from './kontor.js';
import { tackning, bas, kBas } from './marknad.js';
import { modellVinst } from './projekt.js';
import { intakt, signal, nyhet, arKonsolSpel } from './spel.js';
import { kr } from './bas.js';
import { $t } from '../core/i18n.js';

const salda = (G) => G.bolag.totaltSalda;
// en produkts sålda per vecka under de senaste n kalenderveckorna – en nedlagd telefon räknas bara
// för de veckor av perioden då den fortfarande såldes (marknadsandelen, bolagets värde)
export function senasteVeckor(G, p, n) {
  const kvar = p.aktiv ? n : Math.max(0, n - Math.floor((G.dag - (p.nedlagdDag ?? G.dag)) / 7));
  return kvar ? p.veckor.slice(-kvar) : [];   // OBS slice(-0) ger hela listan
}
// Sparningar från 0.1.x saknar flaggan kopteNyMobel. Årsstatistiken visar ändå om bolaget någon gång har
// betalat för en möbel (kategorin 'mobler' blir minus: ett köp kostar hela priset, en såld möbel ger halva
// tillbaka) – då har barnet redan köpt möbler och ska inte behöva göra det igen för att komma förbi mål 5.
const harBetaltMobler = (G) => Object.values(G.stat?.ar || {}).some((s) => (s?.per?.mobler || 0) < 0);
const andel = (G) => {
  // sålda senaste 4 veckorna / (16 × bas) ≈ marknadsandel i den del av världen man säljer i (samma bas som efterfrågan)
  const s = G.produkter.reduce((sum, p) => sum + senasteVeckor(G, p, 4).reduce((a, b) => a + b, 0), 0);
  return s / (16 * bas(G.dag) * Math.max(0.3, tackning(G)));
};
export const MAL = [
  { nr: 1, text: $t('STÄLL UT 2 BORD'), belopp: 20_000, klart: (G) => G.kontor.bord.filter(Boolean).length >= 2 },
  { nr: 2, text: $t('ANSTÄLL 2 PERSONER'), belopp: 30_000, klart: (G) => G.personal.length >= 2 },
  { nr: 3, text: $t('DESIGNA EN TELEFON'), belopp: 50_000, klart: (G) => G.projekt.length > 0 || G.produkter.length > 0 },
  { nr: 4, text: $t('LANSERA DIN FÖRSTA TELEFON'), belopp: 80_000, klart: (G) => G.bolag.lanseringar >= 1 },
  // klart vid första BETALDA möbeln (gratisfällborden i mål 1 och möbler ur förrådet räknas inte).
  { nr: 5, text: $t('KÖP NYA KONTORSMÖBLER'), belopp: 100_000, klart: (G) => !!G.flaggor.kopteNyMobel || harBetaltMobler(G) },
  { nr: 6, text: $t('FORSKA FRAM EN TEKNIK'), belopp: 120_000, klart: (G) => G.forskning.klara.length >= 1 },
  { nr: 7, text: $t('SÄLJ 100 TELEFONER'), belopp: 150_000, klart: (G) => salda(G) >= 100 },
  { nr: 8, text: $t('FÅ MINST 6,5 I BETYG'), belopp: 200_000, klart: (G) => G.bolag.bastaBetyg >= 6.5 },
  { nr: 9, text: $t('TJÄNA IN FABRIKEN'), belopp: 250_000, klart: (G) => G.produkter.some((p) => modellVinst(p) >= 0) },
  { nr: 10, text: $t('LANSERA TELEFON NUMMER 2'), belopp: 300_000, klart: (G) => G.bolag.lanseringar >= 2 },
  { nr: 11, text: $t('KÖR EN REKLAMKAMPANJ'), belopp: 400_000, klart: (G) => G.produkter.some((p) => p.kampanj !== 'ingen') },
  { nr: 12, text: $t('SÄLJ 1 000 TELEFONER'), belopp: 500_000, klart: (G) => salda(G) >= 1000 },
  { nr: 13, text: $t('TRIVSEL ★★'), belopp: 500_000, klart: (G) => kontorsVarden(G).trivselStj >= 2 },
  { nr: 14, text: $t('FLYTTA TILL ETT LITET KONTOR'), belopp: 800_000, klart: (G) => G.kontor.niva !== 'garage' },
  { nr: 15, text: $t('ANSTÄLL NÅGON MED ★★'), belopp: 600_000, klart: (G) => G.personal.some((p) => p.stjarnor >= 2) },
  { nr: 16, text: $t('FÅ MINST 7,5 I BETYG'), belopp: 1_000_000, klart: (G) => G.bolag.bastaBetyg >= 7.5 },
  { nr: 17, text: $t('BÖRJA SÄLJA I EUROPA'), belopp: 1_500_000, klart: (G) => G.marknad.regioner.includes('europa') },
  { nr: 18, text: $t('LANSERA EN SURFPLATTA'), belopp: 2_000_000, klart: (G) => G.bolag.enhetstyper.includes('platta') },
  { nr: 19, text: $t('10 % MARKNADSANDEL'), belopp: 2_500_000, klart: (G) => andel(G) >= 0.1 },
  { nr: 20, text: $t('FORSKA FRAM 25 TEKNIKER'), belopp: 3_000_000, klart: (G) => G.forskning.klara.length >= 25 },
  { nr: 21, text: $t('FLYTTA TILL EN KONTORSVÅNING'), belopp: 4_000_000, klart: (G) => ['vaning', 'studio', 'hk'].includes(G.kontor.niva) },
  { nr: 22, text: $t('BYGG ETT EGET OPERATIVSYSTEM'), belopp: 6_000_000, klart: (G) => G.forskning.klara.includes('del-os-eget') },
  { nr: 23, text: $t('LANSERA EN SMARTKLOCKA'), belopp: 8_000_000, klart: (G) => G.bolag.enhetstyper.includes('klocka') },
  { nr: 24, text: $t('FÅ MINST 9,0 I BETYG'), belopp: 10_000_000, klart: (G) => G.bolag.bastaBetyg >= 9 },
  { nr: 25, text: $t('FLYTTA TILL EN STUDIO'), belopp: 15_000_000, klart: (G) => ['studio', 'hk'].includes(G.kontor.niva) },
  { nr: 26, text: $t('SÄLJ I HELA VÄRLDEN'), belopp: 25_000_000, klart: (G) => G.marknad.regioner.length >= 4 },
  { nr: 27, text: $t('FORSKA FRAM 100 TEKNIKER'), belopp: 40_000_000, klart: (G) => G.forskning.klara.length >= 100 },
  { nr: 28, text: $t('FLYTTA TILL ETT HUVUDKONTOR'), belopp: 100_000_000, klart: (G) => G.kontor.niva === 'hk' },
];
// Konsolspelets 28 mål (1982 →): samma trappa som telefonernas, med studios, spel och telefonavdelningen.
const konsoler = (G) => G.produkter.filter((p) => p.design.linje === 'konsol');
const slappta = (G) => (G.k?.spel || []).filter((s) => s.status === 'ute' || s.status === 'slut');
const kAndel = (G) => {
  const s = konsoler(G).reduce((sum, p) => sum + senasteVeckor(G, p, 4).reduce((a, b) => a + b, 0), 0);
  return s / (16 * kBas(G.dag) * Math.max(0.3, tackning(G)));
};
export const K_MAL = [
  { nr: 1, text: $t('STÄLL UT 2 BORD'), belopp: 20_000, klart: (G) => G.kontor.bord.filter(Boolean).length >= 2 },
  { nr: 2, text: $t('ANSTÄLL 2 PERSONER'), belopp: 30_000, klart: (G) => G.personal.length >= 2 },
  { nr: 3, text: $t('DESIGNA EN SPELKONSOL'), belopp: 50_000, klart: (G) => G.projekt.some((p) => p.design.linje === 'konsol') || konsoler(G).length > 0 },
  { nr: 4, text: $t('LANSERA DIN FÖRSTA KONSOL'), belopp: 80_000, klart: (G) => konsoler(G).length >= 1 },
  { nr: 5, text: $t('KÖP NYA KONTORSMÖBLER'), belopp: 100_000, klart: (G) => !!G.flaggor.kopteNyMobel || harBetaltMobler(G) },
  { nr: 6, text: $t('FORSKA FRAM EN TEKNIK'), belopp: 120_000, klart: (G) => G.forskning.klara.length >= 1 },
  { nr: 7, text: $t('SÄLJ 100 KONSOLER'), belopp: 150_000, klart: (G) => salda(G) >= 100 },
  { nr: 8, text: $t('SÄG JA TILL EN SPELSTUDIO'), belopp: 200_000, klart: (G) => (G.flaggor.avtal || 0) >= 1 },
  { nr: 9, text: $t('TJÄNA IN FABRIKEN'), belopp: 250_000, klart: (G) => G.produkter.some((p) => modellVinst(p) >= 0) },
  { nr: 10, text: $t('FÅ MINST 6,5 I BETYG'), belopp: 300_000, klart: (G) => G.bolag.bastaBetyg >= 6.5 },
  { nr: 11, text: $t('SLÄPP 3 SPEL TILL DINA KONSOLER'), belopp: 300_000, klart: (G) => slappta(G).length >= 3 },
  { nr: 12, text: $t('SÄLJ 1 000 KONSOLER'), belopp: 400_000, klart: (G) => salda(G) >= 1000 },
  { nr: 13, text: $t('TRIVSEL ★★'), belopp: 500_000, klart: (G) => kontorsVarden(G).trivselStj >= 2 },
  { nr: 14, text: $t('FLYTTA TILL ETT LITET KONTOR'), belopp: 800_000, klart: (G) => G.kontor.niva !== 'garage' },
  { nr: 15, text: $t('GÖR ETT EGET SPEL TILL'), belopp: 600_000, klart: (G) => (G.flaggor.egetSpel || 0) >= 1 },
  { nr: 16, text: $t('FÅ ETT ★★★★-SPEL'), belopp: 1_000_000, klart: (G) => slappta(G).some((s) => s.stj >= 4) },
  { nr: 17, text: $t('BÖRJA SÄLJA I EUROPA'), belopp: 1_500_000, klart: (G) => G.marknad.regioner.includes('europa') },
  { nr: 18, text: $t('LANSERA EN FICKKONSOL'), belopp: 2_000_000, klart: (G) => G.bolag.enhetstyper.includes('ficka') },
  { nr: 19, text: $t('FÅ ETT ★★★★★-SPEL'), belopp: 2_500_000, klart: (G) => slappta(G).some((s) => s.stj >= 5) },
  { nr: 20, text: $t('FORSKA FRAM 25 TEKNIKER'), belopp: 3_000_000, klart: (G) => G.forskning.klara.length >= 25 },
  { nr: 21, text: $t('FLYTTA TILL EN KONTORSVÅNING'), belopp: 4_000_000, klart: (G) => ['vaning', 'studio', 'hk'].includes(G.kontor.niva) },
  { nr: 22, text: $t('LANSERA EN KONSOL MED CD'), belopp: 6_000_000, klart: (G) => konsoler(G).some((p) => ['cd', 'dvd', 'bluray', 'ladda', 'ssd'].includes(p.design.val.media)) },
  { nr: 23, text: $t('10 % MARKNADSANDEL'), belopp: 8_000_000, klart: (G) => kAndel(G) >= 0.1 },
  { nr: 24, text: $t('FÅ MINST 9,0 I BETYG'), belopp: 10_000_000, klart: (G) => G.bolag.bastaBetyg >= 9 },
  { nr: 25, text: $t('FLYTTA TILL EN STUDIO'), belopp: 15_000_000, klart: (G) => ['studio', 'hk'].includes(G.kontor.niva) },
  { nr: 26, text: $t('SÄLJ I HELA VÄRLDEN'), belopp: 25_000_000, klart: (G) => G.marknad.regioner.length >= 4 },
  { nr: 27, text: $t('ÖPPNA TELEFONAVDELNINGEN'), belopp: 40_000_000, klart: (G) => !!G.flaggor.mobil },
  { nr: 28, text: $t('FLYTTA TILL ETT HUVUDKONTOR'), belopp: 100_000_000, klart: (G) => G.kontor.niva === 'hk' },
];
export const malLista = (G) => (arKonsolSpel(G) ? K_MAL : MAL);
export const nastaMal = (G) => malLista(G).find((m) => !G.mal.klara.includes(m.nr)) || null;
export const marknadsandel = (G) => (arKonsolSpel(G) ? kAndel(G) : andel(G));

// mål klaras i ordning (förlagan visar ett i taget) – men flera kan bockas av samma dag
export function kollaMal(G) {
  for (let i = 0; i < 28; i++) {
    const m = nastaMal(G); if (!m || !m.klart(G)) return;
    G.mal.klara.push(m.nr);
    intakt(G, m.belopp, 'mal');
    nyhet(G, 'DU', $t`MÅL ${m.nr} AV 28 KLART: ${m.text}. BELÖNING ${kr(m.belopp)}.`);
    signal(G, 'mal', { nr: m.nr, text: m.text, belopp: m.belopp, konfetti: true, ljud: 'mal' });
  }
}
// utmärkelser: kosmetiska bedrifter (konsolspelet har några egna, se K_UTMARKELSER)
export const UTMARKELSER = [
  { id: 'hej', namn: $t('HEJ VÄRLDEN'), text: $t('LANSERA DIN FÖRSTA TELEFON'), klart: (G) => G.bolag.lanseringar >= 1 },
  { id: 'tusen', namn: $t('TUSENKLUBBEN'), text: $t('SÄLJ 1 000 TELEFONER'), klart: (G) => G.bolag.totaltSalda >= 1000 },
  { id: 'miljon', namn: $t('MILJONEN'), text: $t('SÄLJ 1 000 000 TELEFONER'), klart: (G) => G.bolag.totaltSalda >= 1e6 },
  { id: 'nia', namn: $t('NIOAN'), text: $t('FÅ 9,0 ELLER MER'), klart: (G) => G.bolag.bastaBetyg >= 9 },
  { id: 'tia', namn: $t('PERFEKT TIA'), text: $t('FÅ 10,0'), klart: (G) => G.bolag.bastaBetyg >= 10 },
  { id: 'flopp', namn: $t('TOMATEN'), text: $t('FLOPPA MED UNDER 5,0'), klart: (G) => G.produkter.some((p) => p.betyg < 5) },
  { id: 'labb', namn: $t('LABBRÅTTAN'), text: $t('FORSKA FRAM 50 TEKNIKER'), klart: (G) => G.forskning.klara.length >= 50 },
  { id: 'allt', namn: $t('ALLT VETANDE'), text: $t('FORSKA FRAM ALLA 144 TEKNIKER'), klart: (G) => G.forskning.klara.length >= 144 },
  { id: 'fem', namn: $t('FAMILJEN'), text: $t('LANSERA FEM OLIKA SORTERS ENHETER'), klart: (G) => G.bolag.enhetstyper.length >= 5 },
];
export const K_UTMARKELSER = [
  { id: 'pang', namn: $t('PANG!'), text: $t('LANSERA DIN FÖRSTA KONSOL'), klart: (G) => konsoler(G).length >= 1 },
  { id: 'tusen', namn: $t('TUSENKLUBBEN'), text: $t('SÄLJ 1 000 KONSOLER'), klart: (G) => G.bolag.totaltSalda >= 1000 },
  { id: 'miljon', namn: $t('MILJONEN'), text: $t('SÄLJ 1 000 000 KONSOLER'), klart: (G) => G.bolag.totaltSalda >= 1e6 },
  { id: 'nia', namn: $t('NIOAN'), text: $t('FÅ 9,0 ELLER MER'), klart: (G) => G.bolag.bastaBetyg >= 9 },
  { id: 'tia', namn: $t('PERFEKT TIA'), text: $t('FÅ 10,0'), klart: (G) => G.bolag.bastaBetyg >= 10 },
  { id: 'flopp', namn: $t('TOMATEN'), text: $t('FLOPPA MED UNDER 5,0'), klart: (G) => G.produkter.some((p) => p.betyg < 5) },
  { id: 'bibliotek', namn: $t('BIBLIOTEKARIEN'), text: $t('20 SPEL TILL DINA KONSOLER'), klart: (G) => slappta(G).length >= 20 },
  { id: 'exklusiv', namn: $t('BARA HOS OSS'), text: $t('SLÄPP ETT EXKLUSIVT SPEL'), klart: (G) => slappta(G).some((s) => s.exklusiv) },
  { id: 'labb', namn: $t('LABBRÅTTAN'), text: $t('FORSKA FRAM 50 TEKNIKER'), klart: (G) => G.forskning.klara.length >= 50 },
  { id: 'fem', namn: $t('FAMILJEN'), text: $t('LANSERA FEM OLIKA SORTERS ENHETER'), klart: (G) => G.bolag.enhetstyper.length >= 5 },
  { id: 'gta', namn: $t('SISTA SPELET'), text: $t('FÅ BILTJUVEN VI'), klart: (G) => slappta(G).some((s) => s.final) },
];
export const utmarkelseLista = (G) => (arKonsolSpel(G) ? K_UTMARKELSER : UTMARKELSER);
export function kollaUtmarkelser(G) {
  for (const u of utmarkelseLista(G)) if (!G.mal.utmarkelser.includes(u.id) && u.klart(G)) {
    G.mal.utmarkelser.push(u.id);
    nyhet(G, 'DU', $t`${G.bolag.namn} FICK UTMÄRKELSEN "${u.namn}".`);
    signal(G, 'toast', { text: $t`UTMÄRKELSE: ${u.namn}`, farg: 'guld' });
  }
}
export { NOD };
