// Konsollinjen: delarna en spelkonsol byggs av, 1982–2026. Samma form som telefonernas tabeller i delar.js
// (D(id, namn, år, kostnad kr/st, forskningens listpris FP, extra)), så att designern, kostnaden och betyget
// kan räkna på båda linjerna. Kritikerna mäter nio grupper. Se docs/KONSOLPLAN.md.
import { $t } from '../core/i18n.js';

const D = (id, namn, ar, kostnad, fp = 0, extra = {}) => ({ id, namn, ar, kostnad, fp, ...extra });

export const K_GRUPPER = [
  { id: 'cpu', namn: $t('PROCESSOR'), kat: 'kprocessor' },
  { id: 'grafik', namn: $t('GRAFIK'), kat: 'kgrafik' },
  { id: 'ljud', namn: $t('LJUD'), kat: 'kljud' },
  { id: 'minne', namn: $t('MINNE'), kat: 'kminne' },
  { id: 'media', namn: $t('SPELMEDIA'), kat: 'kmedia' },
  { id: 'kontroll', namn: $t('HANDKONTROLL'), kat: 'kkontroll' },
  { id: 'nat', namn: $t('UPPKOPPLING'), kat: 'knat' },
  { id: 'spar', namn: $t('SPARNING'), kat: 'kmedia' },
  { id: 'material', namn: $t('MATERIAL'), kat: 'kkropp' },
];

export const K_DELAR = {
  cpu: [D('8bit1', $t('8 BIT 1 MHZ'), 1982, 180), D('8bit3', $t('8 BIT 3 MHZ'), 1984, 240, 40), D('16bit', $t('16 BIT'), 1988, 380, 120),
    D('32bit', $t('32 BIT RISC'), 1994, 540, 260), D('64bit', $t('64 BIT'), 1996, 700, 340), D('128bit', $t('128 BIT VEKTOR'), 2000, 880, 480),
    D('3karna', $t('TRE KÄRNOR'), 2005, 1100, 650), D('8karna', $t('ÅTTA KÄRNOR'), 2013, 1300, 900), D('zen', $t('ZEN-KLASS'), 2020, 1550, 1200),
    D('nasta', $t('NÄSTA GENERATION'), 2026, 1900, 1600)],
  grafik: [D('16f', $t('16 FÄRGER'), 1982, 120), D('scroll', $t('SCROLLANDE BILD'), 1985, 170, 60), D('mode7', $t('ROTATION & ZOOM'), 1990, 260, 150),
    D('3d', $t('3D-POLYGONER'), 1994, 420, 260), D('shader', $t('SHADERS'), 2001, 600, 420), D('hd', $t('HD 720P'), 2005, 780, 600),
    D('fullhd', $t('FULL HD'), 2013, 920, 850), D('4k', $t('4K HDR'), 2016, 1100, 1000), D('ray', $t('STRÅLSPÅRNING'), 2020, 1350, 1300)],
  ljud: [D('pip', $t('PIP'), 1982, 15), D('3kan', $t('TRE KANALER'), 1982, 40, 20), D('fm', $t('FM-SYNT'), 1988, 70, 90), D('cdljud', $t('CD-LJUD'), 1994, 100, 180),
    D('surround', $t('SURROUND'), 2001, 140, 350), D('3dljud', $t('3D-LJUD'), 2020, 210, 900)],
  minne: [D('16k', $t('16 KB'), 1982, 60), D('64k', $t('64 KB'), 1982, 90, 25), D('512k', $t('512 KB'), 1988, 140, 110), D('2m', $t('2 MB'), 1994, 200, 220),
    D('32m', $t('32 MB'), 2000, 280, 400), D('512m', $t('512 MB'), 2005, 380, 600), D('8g', $t('8 GB'), 2013, 500, 900), D('16g', $t('16 GB'), 2020, 640, 1200)],
  media: [D('modul', $t('MODUL'), 1982, 60), D('disk', $t('DISKETT'), 1984, 80, 50), D('cd', $t('CD-SKIVA'), 1994, 130, 220), D('dvd', $t('DVD'), 2000, 190, 380),
    D('bluray', $t('BLU-RAY'), 2006, 310, 600), D('ladda', $t('HÅRDDISK + NEDLADDNING'), 2008, 270, 650), D('ssd', $t('SSD'), 2020, 390, 1100)],
  kontroll: [D('joystick', $t('JOYSTICK'), 1982, 45), D('styrkors', $t('STYRKORS'), 1985, 55, 50), D('6knapp', $t('SEX KNAPPAR'), 1990, 75, 130),
    D('analog', $t('ANALOG SPAK'), 1996, 100, 260), D('vibration', $t('TVÅ SPAKAR + VIBRATION'), 1997, 130, 300), D('rorelse', $t('RÖRELSE'), 2006, 170, 550),
    D('pekplatta', $t('PEKPLATTA + LJUSLIST'), 2013, 200, 850), D('haptik', $t('HAPTIK'), 2020, 250, 1150)],
  nat: [D('ingen', $t('INGEN'), 1982, 0), D('lank', $t('LÄNKKABEL'), 1989, 20, 100), D('modem', $t('MODEM'), 1999, 60, 330), D('bredband', $t('BREDBAND'), 2002, 90, 430),
    D('butik', $t('ONLINEBUTIK'), 2008, 120, 650), D('moln', $t('MOLN'), 2020, 160, 1100)],
  spar: [D('losen', $t('LÖSENORD'), 1982, 0), D('batteri', $t('BATTERI I MODULEN'), 1986, 30, 70), D('kort', $t('MINNESKORT'), 1995, 50, 230),
    D('hdd', $t('HÅRDDISK'), 2001, 120, 420), D('moln', $t('MOLNSPARNING'), 2011, 60, 700)],
  material: [D('plast', $t('PLAST'), 1982, 45, 0, { kval: 0.3 }), D('tra', $t('TRÄPANEL'), 1982, 70, 30, { kval: 0.45 }), D('matt', $t('MATT PLAST'), 1990, 60, 140, { kval: 0.5 }),
    D('genom', $t('GENOMSKINLIG'), 1998, 90, 300, { kval: 0.65 }), D('pianosvart', $t('PIANOSVART'), 2006, 130, 560, { kval: 0.8 }), D('premium', $t('PREMIUMDESIGN'), 2020, 210, 1100, { kval: 1.0 })],
};

// Enhetstyper för konsoler. bas = marknadens storlek mot hemkonsolen, kostnad/pris = faktor på styckkostnad och rimligt pris.
export const K_ENHETER = [
  { id: 'hem', namn: $t('HEMKONSOL'), ar: 1982, fp: 0, bas: 1, fabrik: 1, kostnad: 1, pris: 1, kvalMal: 10, info: $t('KOPPLAS TILL TV:N HEMMA') },
  { id: 'ficka', namn: $t('FICKKONSOL'), ar: 1989, fp: 150, bas: 0.6, fabrik: 0.8, kostnad: 0.6, pris: 0.6, kvalMal: 9, info: $t('SPELA VAR SOM HELST') },
  { id: 'hybrid', namn: $t('HYBRID'), ar: 2017, fp: 900, bas: 0.8, fabrik: 1.2, kostnad: 1.2, pris: 1.1, kvalMal: 14, info: $t('BÅDE HEMMA OCH I FICKAN') },
  { id: 'vr', namn: $t('VR-GLASÖGON'), ar: 2019, fp: 1000, bas: 0.3, fabrik: 1.1, kostnad: 1.0, pris: 0.9, kvalMal: 13, info: $t('SPELET RUNT OMKRING DIG') },
];
export const kEnhetAv = (id) => K_ENHETER.find((e) => e.id === id) || K_ENHETER[0];

// Karosserna = konsolernas utseende. Varje kaross är en av de 3D-modeller som finns i js/konsol/ (modell = enhet-id
// i 3D-studion) och passar en enhetstyp. Fräschheten sjunker 12 % per år efter att karossen uppfanns.
export const K_KAROSSER = [
  D('brodlada', $t('BRÖDLÅDAN'), 1982, 90, 0, { modell: 'konsol-hemdator', enhet: 'hem', info: $t('TANGENTBORD I LÅDAN') }),
  D('trapanel', $t('TRÄPANELEN'), 1982, 80, 0, { modell: 'konsol-ataro', enhet: 'hem', info: $t('SVART MED TRÄFRONT') }),
  D('svartlada', $t('SVARTA LÅDAN'), 1982, 85, 30, { modell: 'konsol-koleko', enhet: 'hem', info: $t('BRUNN FÖR KONTROLLERNA') }),
  D('gralada', $t('GRÅ LÅDAN'), 1985, 90, 60, { modell: 'konsol-lada', enhet: 'hem', info: $t('LUCKA FRAM FÖR KASSETTEN') }),
  D('kil', $t('KILEN'), 1986, 95, 80, { modell: 'konsol-mastersystem', enhet: 'hem', info: $t('KANTIG OCH SVART MED RÖTT') }),
  D('rundskiva', $t('RUNDA SKIVAN'), 1988, 100, 140, { modell: 'konsol-megadrive', enhet: 'hem', info: $t('RUND SKIVA PÅ TOPPEN') }),
  D('fickform', $t('FICKFORMEN'), 1989, 60, 0, { modell: 'konsol-ficka', enhet: 'ficka', info: $t('GRÅ MED GRÖN SKÄRM') }),
  D('mjukahorn', $t('MJUKA HÖRNEN'), 1990, 105, 160, { modell: 'konsol-snes', enhet: 'hem', info: $t('RUNDAD MED FÄRGADE KNAPPAR') }),
  D('cdlada', $t('CD-LÅDAN'), 1994, 120, 220, { modell: 'konsol-skiva', enhet: 'hem', info: $t('RUND LUCKA FÖR SKIVAN') }),
  D('ovalen', $t('OVALEN'), 1994, 120, 230, { modell: 'konsol-saturnus', enhet: 'hem', info: $t('OVAL SKIVLUCKA') }),
  D('tretand', $t('TRETANDEN'), 1996, 125, 260, { modell: 'konsol-n64', enhet: 'hem', info: $t('KONTROLL MED TRE HANDTAG') }),
  D('fargficka', $t('FÄRGFICKAN'), 1998, 70, 280, { modell: 'konsol-gbc', enhet: 'ficka', info: $t('GENOMSKINLIG MED FÄRGSKÄRM') }),
  D('vitkub', $t('VITA KUBEN'), 1998, 130, 300, { modell: 'konsol-dromcast', enhet: 'hem', info: $t('LITEN, VIT OCH RUND') }),
  D('torn00', $t('TORNET'), 2000, 140, 380, { modell: 'konsol-torn00', enhet: 'hem', info: $t('STÅENDE MED RÄNDER') }),
  D('storlada', $t('STORA LÅDAN'), 2001, 145, 400, { modell: 'konsol-xlada', enhet: 'hem', info: $t('GRÖN JUVEL PÅ TOPPEN') }),
  D('kubhandtag', $t('KUBEN MED HANDTAG'), 2001, 140, 400, { modell: 'konsol-gamekub', enhet: 'hem', info: $t('BÄR DEN SOM EN VÄSKA') }),
  D('dubbelskarm', $t('DUBBELSKÄRMEN'), 2004, 90, 480, { modell: 'konsol-ds', enhet: 'ficka', info: $t('TVÅ SKÄRMAR, EN AV DEM PEK') }),
  D('konkav', $t('KONKAVEN'), 2005, 155, 520, { modell: 'konsol-x360', enhet: 'hem', info: $t('INÅTBÖJD MED LJUSRING') }),
  D('smal', $t('DEN SMALA'), 2006, 150, 560, { modell: 'konsol-smal', enhet: 'hem', info: $t('VIT, SMAL OCH STÅENDE') }),
  D('blankkurva', $t('BLANKA KURVAN'), 2006, 165, 580, { modell: 'konsol-ps3', enhet: 'hem', info: $t('PIANOSVART OCH RUNDAD') }),
  D('skarmkontroll', $t('SKÄRMKONTROLLEN'), 2012, 175, 800, { modell: 'konsol-viu', enhet: 'hem', info: $t('HANDKONTROLL MED EGEN SKÄRM') }),
  D('parallell', $t('PARALLELLOGRAMMEN'), 2013, 180, 850, { modell: 'konsol-ps4', enhet: 'hem', info: $t('SNED PLATTA MED LJUSLIST') }),
  D('vhs', $t('VIDEOLÅDAN'), 2013, 180, 850, { modell: 'konsol-xladaett', enhet: 'hem', info: $t('LÅNG OCH SVART') }),
  D('hybridform', $t('HYBRIDEN'), 2017, 160, 0, { modell: 'konsol-hybrid', enhet: 'hybrid', info: $t('SKÄRM MED LÖSA KONTROLLER') }),
  D('vrform', $t('VR-GLASÖGONEN'), 2019, 150, 0, { modell: 'konsol-kvest', enhet: 'vr', info: $t('VITA GLASÖGON MED RINGKONTROLLER') }),
  D('vingar', $t('VINGARNA'), 2020, 200, 1150, { modell: 'konsol-torn20', enhet: 'hem', info: $t('VITA VINGAR RUNT SVART KÄRNA') }),
  D('monolit', $t('MONOLITEN'), 2020, 200, 1150, { modell: 'konsol-seriex', enhet: 'hem', info: $t('SVART TORN SOM LYSER GRÖNT') }),
  D('handdator', $t('HANDDATORN'), 2022, 120, 1300, { modell: 'konsol-angdack', enhet: 'ficka', info: $t('BRED MED STYRPLATTOR') }),
  D('storhybrid', $t('STORA HYBRIDEN'), 2025, 180, 1500, { modell: 'konsol-svitsch2', enhet: 'hybrid', info: $t('STÖRRE SKÄRM, MAGNETKONTROLLER') }),
  D('nastaform', $t('NÄSTA FORM'), 2026, 230, 1600, { modell: 'konsol-nasta', enhet: 'hem', info: $t('LÅG KIL MED LILA LJUS') }),
];

// Funktioner: +0,1 i betyget var (samma tak som telefonerna). PEKSKÄRM och TRÅDLÖST NÄT krävs för telefonavdelningen.
export const K_FUNKTIONER = [
  D('bakat', $t('BAKÅTKOMPATIBEL'), 1996, 60, 200), D('tradlos', $t('TRÅDLÖSA KONTROLLER'), 2001, 50, 300), D('pekskarm', $t('PEKSKÄRM'), 2004, 70, 400),
  D('wifi', $t('TRÅDLÖST NÄT'), 2005, 40, 450), D('trofeer', $t('TROFÉER'), 2008, 20, 500), D('kamera', $t('RÖRELSEKAMERA'), 2010, 90, 600),
  D('dela', $t('DELNINGSKNAPP'), 2013, 20, 700), D('vrstod', $t('VR-STÖD'), 2016, 80, 800),
];

// Ytor och färger delas med telefonerna (YTOR i delar.js).
export const K_STANDARD_VAL = { cpu: '8bit1', grafik: '16f', ljud: 'pip', minne: '16k', media: 'modul', kontroll: 'joystick', nat: 'ingen', spar: 'losen', material: 'plast' };

export const kDelAv = (grupp, id) => (K_DELAR[grupp] || []).find((d) => d.id === id) || null;
export const kNivaAv = (grupp, id) => (K_DELAR[grupp] || []).findIndex((d) => d.id === id);
