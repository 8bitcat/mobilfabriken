// Delarna en telefon byggs av. Tretton grupper som kritikerna mäter (förlagans "What critics expect"),
// plus kaross, ramar, linser, funktioner och enhetstyper. Allt som är en siffra i spelet står här.
//   kostnad = kr per tillverkad telefon · ar = uppfinningsår · fp = forskningens listpris (0 = finns från start)
// Förväntan ett år = den bästa delen i gruppen vars uppfinningsår har kommit (forskad eller inte).
import { $t } from '../core/i18n.js';

export const GRUPPER = [
  { id: 'upplosning', namn: $t('UPPLÖSNING'), kat: 'skarm' },
  { id: 'frekvens', namn: $t('BILDFREKVENS'), kat: 'skarm' },
  { id: 'skarmteknik', namn: $t('SKÄRMTEKNIK'), kat: 'skarm' },
  { id: 'selfie', namn: $t('SELFIEKAMERA'), kat: 'kamera' },
  { id: 'bakkamera', namn: $t('BAKKAMERA'), kat: 'kamera' },
  { id: 'chip', namn: $t('CHIP'), kat: 'chips' },
  { id: 'ram', namn: $t('ARBETSMINNE'), kat: 'minne' },
  { id: 'lagring', namn: $t('LAGRING'), kat: 'minne' },
  { id: 'batteri', namn: $t('BATTERI'), kat: 'batteri' },
  { id: 'nat', namn: $t('NÄT'), kat: 'nat' },
  { id: 'os', namn: $t('MJUKVARA'), kat: 'mjukvara' },
  { id: 'port', namn: $t('LADDPORT'), kat: 'portar' },
  { id: 'material', namn: $t('MATERIAL'), kat: 'kropp' },
];

const D = (id, namn, ar, kostnad, fp = 0, extra = {}) => ({ id, namn, ar, kostnad, fp, ...extra });

export const DELAR = {
  upplosning: [D('240p', $t('240P'), 2007, 60), D('320p', $t('320P'), 2007, 140), D('480p', $t('480P'), 2009, 220, 95), D('540p', $t('540P'), 2011, 300, 276),
    D('720p', $t('720P'), 2012, 380, 403), D('1080p', $t('1080P'), 2013, 480, 556), D('1440p', $t('1440P'), 2015, 600, 798), D('4k', $t('4K'), 2017, 760, 1100)],
  frekvens: [D('30hz', $t('30 HZ'), 2007, 20), D('60hz', $t('60 HZ'), 2007, 60, 62), D('90hz', $t('90 HZ'), 2018, 110, 520), D('120hz', $t('120 HZ'), 2020, 160, 690), D('144hz', $t('144 HZ'), 2022, 210, 900)],
  skarmteknik: [D('tn', $t('TN LCD'), 2007, 40), D('ips', $t('IPS LCD'), 2010, 90, 120), D('oled', $t('OLED'), 2012, 180, 219), D('amoled', $t('AMOLED'), 2015, 260, 408),
    D('ltpo', $t('LTPO OLED'), 2021, 360, 820)],
  selfie: [D('03mp', $t('0,3 MP'), 2007, 10), D('2mp', $t('2 MP'), 2010, 40, 110), D('5mp', $t('5 MP'), 2012, 70, 219), D('8mp', $t('8 MP'), 2014, 110, 375),
    D('12mp', $t('12 MP'), 2018, 160, 560), D('32mp', $t('32 MP'), 2022, 220, 900)],
  bakkamera: [D('13mp', $t('1,3 MP'), 2007, 20), D('2mp', $t('2 MP'), 2007, 60), D('5mp', $t('5 MP'), 2008, 110, 75), D('8mp', $t('8 MP'), 2011, 170, 276),
    D('12mp', $t('12 MP'), 2014, 240, 490), D('48mp', $t('48 MP'), 2019, 340, 760), D('108mp', $t('108 MP'), 2022, 460, 980), D('200mp', $t('200 MP'), 2024, 580, 1180)],
  chip: [D('400', $t('1 KÄRNA 400 MHZ'), 2007, 120), D('1ghz', $t('1 KÄRNA 1 GHZ'), 2008, 200, 80), D('dual', $t('DUBBELKÄRNA'), 2011, 300, 195),
    D('quad', $t('FYRKÄRNA'), 2013, 420, 342), D('octa', $t('ÅTTAKÄRNA'), 2015, 560, 533), D('octaai', $t('ÅTTAKÄRNA + AI'), 2018, 720, 824),
    D('3nm', $t('3 NM FLAGGSKEPP'), 2022, 950, 1250), D('2nm', $t('2 NM FLAGGSKEPP'), 2025, 1150, 1500)],
  ram: [D('128', $t('128 MB'), 2007, 40), D('256', $t('256 MB'), 2007, 80, 62), D('512', $t('512 MB'), 2010, 130, 172), D('1g', $t('1 GB'), 2012, 190, 309),
    D('2g', $t('2 GB'), 2014, 260, 490), D('4g', $t('4 GB'), 2016, 340, 717), D('8g', $t('8 GB'), 2019, 430, 1057), D('12g', $t('12 GB'), 2021, 520, 1392),
    D('16g', $t('16 GB'), 2023, 620, 1778)],
  lagring: [D('2g', $t('2 GB'), 2007, 30), D('4g', $t('4 GB'), 2007, 60), D('8g', $t('8 GB'), 2008, 100, 70), D('16g', $t('16 GB'), 2011, 150, 276),
    D('32g', $t('32 GB'), 2013, 210, 447), D('64g', $t('64 GB'), 2015, 280, 663), D('128g', $t('128 GB'), 2017, 360, 927), D('256g', $t('256 GB'), 2019, 450, 1240),
    D('512g', $t('512 GB'), 2021, 560, 1603), D('1t', $t('1 TB'), 2023, 700, 2018), D('2t', $t('2 TB'), 2026, 880, 2400)],
  batteri: [D('1000', $t('1 000 MAH'), 2007, 30, 0, { mah: 1000 }), D('1500', $t('1 500 MAH'), 2007, 60, 62, { mah: 1500 }), D('2000', $t('2 000 MAH'), 2009, 90, 148, { mah: 2000 }),
    D('3000', $t('3 000 MAH'), 2013, 140, 342, { mah: 3000 }), D('4000', $t('4 000 MAH'), 2016, 200, 576, { mah: 4000 }), D('5000', $t('5 000 MAH'), 2019, 270, 878, { mah: 5000 }),
    D('6000', $t('6 000 MAH SI-C'), 2023, 360, 1315, { mah: 6000 })],
  nat: [D('2g', $t('2G'), 2007, 30), D('3g', $t('3G'), 2007, 70, 62), D('4g', $t('4G LTE'), 2012, 150, 219), D('5g', $t('5G'), 2019, 280, 540), D('5ga', $t('5G ADVANCED'), 2024, 360, 1100)],
  os: [D('enkel', $t('ENKELT OS'), 2007, 20), D('robo', $t('ROBOOS (LICENS)'), 2007, 90, 62), D('roboapp', $t('ROBOOS + APPBUTIK'), 2009, 140, 148),
    D('eget', $t('EGET OS'), 2014, 200, 375), D('egetai', $t('EGET OS + AI'), 2022, 300, 835)],
  port: [D('mini', $t('MINI USB'), 2007, 5), D('micro', $t('MICRO USB'), 2007, 15, 62), D('usbc', $t('USB-C'), 2016, 40, 312), D('usbc32', $t('USB-C 3.2'), 2020, 70, 573), D('usb4', $t('USB4'), 2025, 100, 900)],
  material: [D('plast', $t('PLAST'), 2007, 30, 0, { kval: 0.3, glans: 'plast' }), D('poly', $t('POLYKARBONAT'), 2008, 50, 70, { kval: 0.45 }),
    D('alu', $t('ALUMINIUM'), 2012, 110, 219, { kval: 0.65 }), D('glas', $t('GLAS & METALL'), 2015, 180, 408, { kval: 0.85 }), D('titan', $t('TITAN'), 2022, 300, 835, { kval: 1.0 })],
};

// Karosser = årets mode. Fräschheten sjunker 16 % per år efter att karossen uppfanns.
// radie/djup = hur modellen ser ut (påverkar 3D och pixel), kostnad kr/st.
export const KAROSSER = [
  D('krom', $t('KROMPLATTA'), 2007, 40, 0, { radie: 0.1, info: $t('BLANK PLATTA MED KROMKANT') }),
  D('glans', $t('GLANSKURVA'), 2008, 45, 70, { radie: 0.14, info: $t('MJUKT RUNDAD BAKSIDA') }),
  D('mjuk', $t('MJUKT GREPP'), 2009, 50, 28, { radie: 0.16, info: $t('GUMMERAD, SKÖN I HANDEN') }),
  D('smorgas', $t('GLASSMÖRGÅS'), 2010, 70, 74, { radie: 0.09, info: $t('GLAS FRAM OCH BAK') }),
  D('kontur', $t('KONTUR'), 2011, 75, 84, { radie: 0.13, info: $t('TUNNARE MOT KANTERNA') }),
  D('fas', $t('FASAD UNIBODY'), 2012, 85, 94, { radie: 0.08, info: $t('FRÄST UR ETT STYCKE') }),
  D('polyuni', $t('POLY UNIBODY'), 2013, 80, 169, { radie: 0.12, info: $t('FÄRGAD RAKT IGENOM') }),
  D('rundmetall', $t('RUNDAD METALL'), 2014, 95, 186, { radie: 0.15, info: $t('SVEPANDE METALLRYGG') }),
  D('kantglas', $t('KANTGLAS'), 2015, 105, 202, { radie: 0.13, info: $t('SKÄRMEN VIKER RUNT KANTEN') }),
  D('plan', $t('PLAN KANT'), 2017, 115, 524, { radie: 0.1, info: $t('RAKA SIDOR IGEN') }),
  D('polerad', $t('POLERAD PLAN'), 2018, 125, 554, { radie: 0.11, info: $t('SPEGELBLANKA SIDOR') }),
  D('flytande', $t('FLYTANDE Ö'), 2020, 140, 727, { radie: 0.12, info: $t('KAMERAÖN SVÄVAR') }),
  D('titanplan', $t('TITANPLAN'), 2021, 155, 765, { radie: 0.1, info: $t('BORSTAD TITANRAM') }),
  D('keramisk', $t('KERAMISK SLIM'), 2023, 170, 803, { radie: 0.12, info: $t('KERAMIK, 7 MM') }),
  D('lufttunn', $t('LUFTTUNN'), 2024, 185, 1011, { radie: 0.11, info: $t('TUNNAST NÅGONSIN') }),
  D('somlos', $t('SÖMLÖST GLAS'), 2025, 200, 1056, { radie: 0.14, info: $t('INGA SKARVAR ALLS') }),
];

// Ytor (färg & märke). kval = designvärde i betyget. Legendariska ytor kommer ur gåvor/bedrifter.
export const YTOR = [
  { id: 'klassisk', namn: $t('KLASSISK'), kostnad: 0, kval: 0.2, info: $t('STANDARDYTAN') },
  { id: 'matt', namn: $t('MJUK MATT'), kostnad: 40, kval: 0.4, info: $t('SLÄT UTAN REFLEXER') },
  { id: 'borstad', namn: $t('BORSTAD METALL'), kostnad: 90, kval: 0.6, info: $t('RIKTAD METALLGLANS') },
  { id: 'kolfiber', namn: $t('KOLFIBER'), kostnad: 120, kval: 0.75, info: $t('MÖRKT VÄVT MÖNSTER') },
];
export const LEGENDARISKA = [
  { id: 'guld', namn: $t('GULD'), farg: '#e8b230' }, { id: 'holo', namn: $t('HOLO'), farg: '#b8a0f0' }, { id: 'neon', namn: $t('NEON'), farg: '#4ff0ff' },
  { id: 'galax', namn: $t('GALAX'), farg: '#3a2a8a' }, { id: 'lava', namn: $t('LAVA'), farg: '#e0482a' }, { id: 'krom', namn: $t('KROM'), farg: '#d8dce4' },
];

// Ramar runt skärmen: tunnare ramar kräver forskning. min = minsta skärmram (modellenheter, 0,01 = 1 mm).
// Varje ny nivå man faktiskt använder räknas som en funktion (+0,1 i betyget).
export const RAMAR = [
  D('standard', $t('STANDARDRAM'), 2007, 0, 0, { min: 0.06 }),
  D('smalare', $t('SMALARE RAMAR'), 2008, 10, 70, { min: 0.045 }),
  D('tunna', $t('TUNNA RAMAR'), 2014, 25, 375, { min: 0.03 }),
  D('kant', $t('KANT TILL KANT'), 2017, 45, 771, { min: 0.015 }),
  D('hal', $t('HÅLKAMERA'), 2018, 60, 619, { min: 0.01 }),
  D('underskarm', $t('KAMERA UNDER SKÄRMEN'), 2023, 90, 1200, { min: 0.008 }),
];

// Extra linser på baksidan: varje forskad lins tillåter en till (max 4). +50 % kamerakostnad per extra lins.
export const LINSER = [
  D('vidvinkel', $t('VIDVINKEL'), 2016, 0, 441), D('tele', $t('TELE 2X'), 2017, 0, 474), D('djup', $t('DJUPSENSOR'), 2018, 0, 474),
  D('makro', $t('MAKRO'), 2019, 0, 706), D('periskop', $t('PERISKOP 5X'), 2020, 0, 932), D('lidar', $t('LIDAR'), 2021, 0, 932),
];

// Funktioner: väljs i steg 11 när de är forskade. +0,1 i betyget var (max +1,0 totalt för funktioner).
export const FUNKTIONER = [
  D('gps', $t('GPS'), 2007, 25, 27), D('stereo', $t('STEREOHÖGTALARE'), 2011, 30, 120), D('penna', $t('PENNSTÖD'), 2011, 30, 120),
  D('qi', $t('TRÅDLÖS LADDNING'), 2012, 45, 134), D('finger', $t('FINGERAVTRYCK'), 2013, 60, 242), D('nfc', $t('NFC-BETALNING'), 2014, 40, 265),
  D('vatten', $t('VATTENTÄT'), 2016, 50, 441), D('ansikte', $t('ANSIKTSUPPLÅSNING'), 2017, 70, 474), D('fall', $t('FALLDETEKTERING'), 2018, 30, 507),
  D('spatial', $t('SPATIALT LJUD'), 2020, 40, 749), D('sos', $t('SATELLIT-SOS'), 2022, 90, 1039),
  D('rost', $t('RÖSTASSISTENT'), 2011, 20, 150), D('ar', $t('AR-KAMERA'), 2017, 50, 500), D('uwb', $t('ULTRABREDBAND'), 2019, 35, 650), D('aiass', $t('AI-ASSISTENT'), 2023, 60, 1100),
];

// Enhetstyper. bas = marknadens storlek jämfört med telefoner, fabrik = faktor på fabrikskostnaden,
// kostnad = faktor på styckkostnaden (samma delar men mer eller mindre av dem), pris = faktor på rimligt pris
// (en laptop är värd mer än en telefon med samma betyg). pris ≈ kostnad ger telefonens marginal; de stora
// enheterna får lite mer eftersom de har högre kvalitetsmål och dyrare fabrik.
export const ENHETER = [
  { id: 'telefon', namn: $t('TELEFON'), ar: 2007, fp: 0, bas: 1, fabrik: 1, kostnad: 1, pris: 1, kvalMal: 13, info: $t('ER FÖRSTA ENHET') },
  { id: 'platta', namn: $t('SURFPLATTA'), ar: 2010, fp: 150, bas: 0.4, fabrik: 1.3, kostnad: 1.6, pris: 1.6, kvalMal: 13, info: $t('STÖRRE SKÄRM, FÖR SOFFAN') },
  { id: 'laptop', namn: $t('LAPTOP'), ar: 2012, fp: 219, bas: 0.3, fabrik: 1.8, kostnad: 2.6, pris: 2.7, kvalMal: 16, info: $t('TANGENTBORD OCH STOR SKÄRM') },
  { id: 'klocka', namn: $t('SMARTKLOCKA'), ar: 2014, fp: 375, bas: 0.5, fabrik: 0.8, kostnad: 0.7, pris: 0.7, kvalMal: 13, info: $t('TELEFONEN PÅ HANDLEDEN') },
  { id: 'horlurar', namn: $t('TRÅDLÖSA HÖRLURAR'), ar: 2016, fp: 441, bas: 0.8, fabrik: 0.6, kostnad: 0.45, pris: 0.45, kvalMal: 13, info: $t('MUSIK UTAN SLADD') },
  { id: 'vikbar', namn: $t('VIKBAR TELEFON'), ar: 2019, fp: 1057, bas: 0.2, fabrik: 2.2, kostnad: 2.0, pris: 2.1, kvalMal: 18, info: $t('SKÄRMEN GÅR ATT VIKA') },
];
export const enhetAv = (id) => ENHETER.find((e) => e.id === id) || ENHETER[0];

// Standardvalen för en ny design (en 2007-telefon som kostar 660 kr att tillverka).
export const STANDARD_VAL = {
  upplosning: '320p', frekvens: '30hz', skarmteknik: 'tn', selfie: '03mp', bakkamera: '2mp', chip: '400', ram: '128', lagring: '4g',
  batteri: '1000', nat: '2g', os: 'enkel', port: 'mini', material: 'plast',
};

export const delAv = (grupp, id) => (DELAR[grupp] || []).find((d) => d.id === id) || null;
export const nivaAv = (grupp, id) => (DELAR[grupp] || []).findIndex((d) => d.id === id);
