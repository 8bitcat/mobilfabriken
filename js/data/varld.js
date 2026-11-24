// Världen runt bolaget: rivalerna, världshändelserna, kampanjerna, regionerna, kontorsnivåerna och namnen.
import { $t } from '../core/i18n.js';

// Förlagans nio rivaler (parodierna behålls). offset = hur mycket bättre/sämre än marknadssnittet de brukar
// vara, prisF = pris jämfört med rimligt pris, dag = ungefärlig lanseringsdag på året (0 = 1 jan).
export const RIVALER = [
  { id: 'lj', bolag: $t('LUMEN'), modell: $t('OPTIMA'), offset: -0.3, prisF: 1.0, dag: 86, farg: 0xc9323a, ikon: 'lj', karaktar: $t('LANSERAR TIDIGT PÅ VÅREN') },
  { id: 'sonee', bolag: $t('HOSHI'), modell: $t('MELODI'), offset: -1.7, prisF: 0.55, dag: 169, farg: 0x2aa39a, ikon: 'sonee', karaktar: $t('MUSIK FÖRE ALLT') },
  { id: 'blueberry', bolag: $t('BRAMBLE'), modell: $t('TANGENT PRO'), offset: -0.2, prisF: 0.93, dag: 220, farg: 0x5a4ad0, ikon: 'blueberry', karaktar: $t('TANGENTBORD, ÄLSKAD AV CHEFER') },
  { id: 'palmtree', bolag: $t('KOKOS'), modell: $t('KARMA'), offset: 0.8, prisF: 1.33, dag: 227, farg: 0xe8b230, ikon: 'palmtree', karaktar: $t('SMART MEN DYR') },
  { id: 'pear', bolag: $t('KVITTEN'), modell: $t('KVITTEN ONE'), offset: 0, prisF: 1.14, dag: 233, farg: 0xd8dce4, ikon: 'pear', karaktar: $t('SNYGG, DYR OCH SKRYTER') },
  { id: 'samsong', bolag: $t('SAMBA'), modell: $t('COSMOS A'), offset: 0.7, prisF: 1.13, dag: 237, farg: 0x3a7bd5, ikon: 'samsong', karaktar: $t('KOPIERAR DIG ÅRET EFTER') },
  { id: 'nokio', bolag: $t('NORDIA'), modell: $t('ROBUST'), offset: 0.8, prisF: 1.13, dag: 250, farg: 0x2a6ad0, ikon: 'nokio', karaktar: $t('TÅLIG OCH TRÅKIG') },
  { id: 'htk', bolag: $t('HIKO'), modell: $t('WISH'), offset: -0.3, prisF: 1.02, dag: 274, farg: 0x45b964, ikon: 'htk', karaktar: $t('MITTEMELLAN') },
  { id: 'motorolla', bolag: $t('VEKTOR'), modell: $t('SLIM X'), offset: 0, prisF: 0.92, dag: 308, farg: 0xe8484e, ikon: 'motorolla', karaktar: $t('TUNN OCH BILLIG – PRISPRESSAREN') },
];

// Reklamkampanjer på lanseringsdagen. hype = extra tidig efterfrågan som klingar av 10 % per vecka.
export const KAMPANJER = [
  { id: 'ingen', namn: $t('INGEN REKLAM'), pris: 0, hype: 0, info: $t('GRUNDEFTERFRÅGAN'), farg: 0x8c93b4 },
  { id: 'natet', namn: $t('NÄTANNONSER'), pris: 600_000, hype: 0.4, info: $t('+40 % TIDIG EFTERFRÅGAN'), farg: 0x3a7bd5 },
  { id: 'tv', namn: $t('TV-KAMPANJ'), pris: 4_000_000, hype: 0.9, info: $t('+90 % TIDIG EFTERFRÅGAN'), farg: 0x8e5bd1 },
  { id: 'global', namn: $t('GLOBAL LANSERING'), pris: 15_000_000, hype: 1.8, info: $t('+180 % TIDIG EFTERFRÅGAN'), farg: 0xe8b230, tackningMin: 0.7 },
];

// Marknader. Norden från start (30 % av världen), resten köps i BOLAGET.
export const REGIONER = [
  { id: 'norden', namn: $t('NORDEN'), andel: 0.3, pris: 0 },
  { id: 'europa', namn: $t('EUROPA'), andel: 0.25, pris: 2_000_000, rykteMin: 1.0 },
  { id: 'amerika', namn: $t('AMERIKA'), andel: 0.25, pris: 8_000_000, rykteMin: 1.0 },
  { id: 'asien', namn: $t('ASIEN & ÖVRIGA'), andel: 0.2, pris: 20_000_000, rykteMin: 1.0 },
];

// Kontorsnivåerna. tak = högsta stjärnnivå hos kandidaterna, labb = parallella forskningar/byggen.
export const KONTOR = [
  { id: 'garage', namn: $t('GARAGE'), pris: 0, bord: 2, labb: 1, tak: 1, krav: null, kravText: '' },
  { id: 'litet', namn: $t('LITET KONTOR'), pris: 2_000_000, bord: 6, labb: 2, tak: 2, krav: { lanserade: 2 }, kravText: $t('2 LANSERADE MODELLER') },
  { id: 'vaning', namn: $t('KONTORSVÅNING'), pris: 15_000_000, bord: 12, labb: 3, tak: 3, krav: { salda: 50000 }, kravText: $t('50 000 SÅLDA ENHETER') },
  { id: 'studio', namn: $t('STUDIO'), pris: 80_000_000, bord: 20, labb: 4, tak: 4, krav: { enhetstyper: 3, salda: 250_000 }, kravText: $t('3 ENHETSTYPER + 250 000 SÅLDA') },
  { id: 'hk', namn: $t('HUVUDKONTOR'), pris: 400_000_000, bord: 32, labb: 6, tak: 5, krav: { mal: 26, salda: 2_000_000 }, kravText: $t('MÅL 26 + 2 MILJONER SÅLDA') },
];
export const kontorAv = (id) => KONTOR.find((k) => k.id === id) || KONTOR[0];

// Personal: lön per månad och kraft per stjärnnivå
export const LON = { 1: [14_000, 16_500], 2: [25_000, 27_000], 3: [40_000, 44_000], 4: [65_000, 70_000], 5: [100_000, 110_000] };
export const KRAFT = { 1: 1, 2: 1.6, 3: 2.4, 4: 3.4, 5: 4.6 };
export const ROLLER = {
  forskare: { namn: $t('FORSKARE'), farg: 0x3a8ff0, info: $t('GÖR TELEFONERNA BÄTTRE (BLÅ PRICKAR) OCH TJÄNAR FORSKNINGSPOÄNG') },
  buggfixare: { namn: $t('BUGGFIXARE'), farg: 0xe8484e, info: $t('STOPPAR BUGGAR OCH LAGAR RÖDA BUGGPRICKAR') },
  // bara i konsolspelet: gör spelet i lådan (PANG! först) och bolagets egna spel (gröna prickar)
  spelutvecklare: { namn: $t('SPELUTVECKLARE'), farg: 0x45c864, info: $t('GÖR SPELEN – FÖRST PANG!, SEDAN BOLAGETS EGNA SPEL') },
};

export const FORNAMN = ['ALVA', 'ELSA', 'MAJA', 'ELLA', 'WILMA', 'SAGA', 'NORA', 'LIV', 'STINA', 'INES', 'GRETA', 'OSCAR', 'LIAM', 'NOAH',
  'HUGO', 'WILLIAM', 'ELIAS', 'LUDVIG', 'SIXTEN', 'VINCENT', 'FRANS', 'KALLE', 'BOSSE', 'AHMED', 'LEILA', 'YUSUF', 'MIRA', 'KENJI', 'AIKO',
  'MATEO', 'SOFIA', 'IVAN', 'OLGA', 'BIRGITTA', 'GUNNAR', 'SVEN', 'AGNETA', 'TILDE', 'ASTRID', 'EBBA', 'SIGGE', 'OLLE', 'TOVE', 'JUNI',
  'MELKER', 'IDA', 'KLARA', 'ARVID', 'SELMA', 'LOKE', 'HANNA', 'ADAM', 'SARA', 'NILS', 'FREJA', 'ALI', 'JOSEFIN', 'ROBIN', 'LINNEA', 'EMIL'];

// Världshändelser. vid = { ar, manad } för fasta, slump = chans per månad för återkommande.
// effekt: efterfragan (faktor), styck (faktor på tillverkningskostnad), hemknapp/selfie/os (vikt i betyg)
export const HANDELSER = [
  { id: 'pekskarm', namn: $t('PEKSKÄRMSFEBER'), text: $t('PEKSKÄRMAR ÄR DET NYA HETA. TELEFONER UTAN HEMKNAPP SÄLJER 15 % MER.'), vid: { ar: 2007, dag: 1 }, langd: 56, effekt: { utanHemknapp: 1.15 } },
  { id: 'finanskris', namn: $t('FINANSKRISEN'), text: $t('BANKERNA VACKLAR – FOLK SPARAR. ALL EFTERFRÅGAN −25 %.'), vid: { ar: 2008, dag: 258 }, langd: 84, effekt: { efterfragan: 0.75 } },
  { id: 'appfeber', namn: $t('APPBUTIKSFEBERN'), text: $t('ALLA VILL HA APPAR. ETT BRA OPERATIVSYSTEM VÄGER DUBBELT HOS KRITIKERNA.'), vid: { ar: 2009, dag: 60 }, langd: 120, effekt: { os: 2 } },
  { id: 'selfie', namn: $t('SELFIEVÅGEN'), text: $t('ALLA FOTAR SIG SJÄLVA. SELFIEKAMERAN VÄGER DUBBELT.'), vid: { ar: 2013, dag: 100 }, langd: 120, effekt: { selfie: 2 } },
  { id: '5g', namn: $t('5G-RACET'), text: $t('OPERATÖRERNA BYGGER 5G. TELEFONER MED 5G SÄLJER 20 % MER.'), vid: { ar: 2020, dag: 30 }, langd: 180, effekt: { natMin: '5g', natBonus: 1.2 } },
  { id: 'brist', namn: $t('KOMPONENTBRIST'), text: $t('FABRIKERNA I ÖSTERN ÄR ÖVERBELASTADE. ALLA DELAR KOSTAR 20 % MER.'), slump: 0.025, langd: 42, effekt: { styck: 1.2 } },
  { id: 'jul', namn: $t('JULHANDELN'), text: $t('DECEMBER! ALLA KÖPER JULKLAPPAR – EFTERFRÅGAN +30 %.'), jul: true, langd: 31, effekt: { efterfragan: 1.3 } },
];

// Tidningarna som recenserar (lanseringsshowen)
export const TIDNINGAR = [
  { id: 'mobiltidningen', namn: $t('MOBILTIDNINGEN'), lynne: 'saklig' },
  { id: 'skarm', namn: $t('SIGNALEN'), lynne: 'design' },
  { id: 'bytesize', namn: $t('BYTESIZE'), lynne: 'elak' },
];
