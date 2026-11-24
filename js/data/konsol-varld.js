// Konsolvärlden: rivalkonsolerna på riktiga årtal, studiorna, spelen de kan göra till din konsol och
// konsolmarknadens händelser. Namnen är parodier (docs/KONSOLPLAN.md).
import { $t } from '../core/i18n.js';

// Rivalkonsoler. ar/dag = lansering i Europa (dag på året), offset = betyg mot årets snitt, prisF = pris mot
// rimligt pris, liv = år den säljer, modell = 3D-modellen i js/konsol/ (för nyheter, museum och reklam).
export const K_RIVALER = [
  { id: 'ataro', namn: $t('ORBITEK 2800'), bolag: $t('ORBITEK'), ar: 1980, dag: 200, enhet: 'hem', offset: -0.4, prisF: 0.8, liv: 6, modell: 'konsol-ataro' },
  { id: 'kommodor', namn: $t('DATATRON 64'), bolag: $t('DATATRON'), ar: 1982, dag: 240, enhet: 'hem', offset: 0.3, prisF: 1.3, liv: 10, modell: 'konsol-hemdator' },
  { id: 'koleko', namn: $t('LUMA VISION'), bolag: $t('LUMA'), ar: 1982, dag: 280, enhet: 'hem', offset: 0.2, prisF: 1.0, liv: 3, modell: 'konsol-koleko' },
  { id: 'nes', namn: $t('TENKO 8'), bolag: $t('TENKO'), ar: 1986, dag: 250, enhet: 'hem', offset: 0.8, prisF: 0.95, liv: 9, modell: 'konsol-lada' },
  { id: 'mastersystem', namn: $t('TORA SYSTEM 8'), bolag: $t('TORA'), ar: 1987, dag: 150, enhet: 'hem', offset: 0.3, prisF: 0.9, liv: 6, modell: 'konsol-mastersystem' },
  { id: 'gameboj', namn: $t('TENKO POCKET'), bolag: $t('TENKO'), ar: 1989, dag: 270, enhet: 'ficka', offset: 0.6, prisF: 0.85, liv: 10, modell: 'konsol-ficka' },
  { id: 'megadrive', namn: $t('TORA MEGA 16'), bolag: $t('TORA'), ar: 1990, dag: 330, enhet: 'hem', offset: 0.5, prisF: 0.95, liv: 7, modell: 'konsol-megadrive' },
  { id: 'snes', namn: $t('SUPER TENKO'), bolag: $t('TENKO'), ar: 1992, dag: 100, enhet: 'hem', offset: 0.8, prisF: 1.0, liv: 7, modell: 'konsol-snes' },
  { id: 'playstatio', namn: $t('HOSHI NOVA'), bolag: $t('HOSHI'), ar: 1995, dag: 270, enhet: 'hem', offset: 0.9, prisF: 0.95, liv: 9, modell: 'konsol-skiva' },
  { id: 'saturnus', namn: $t('TORA ORBIT'), bolag: $t('TORA'), ar: 1995, dag: 190, enhet: 'hem', offset: 0.1, prisF: 1.1, liv: 4, modell: 'konsol-saturnus' },
  { id: 'n64', namn: $t('TENKO 64'), bolag: $t('TENKO'), ar: 1997, dag: 60, enhet: 'hem', offset: 0.7, prisF: 1.0, liv: 6, modell: 'konsol-n64' },
  { id: 'gbc', namn: $t('TENKO POCKET COLOR'), bolag: $t('TENKO'), ar: 1998, dag: 320, enhet: 'ficka', offset: 0.5, prisF: 0.8, liv: 5, modell: 'konsol-gbc' },
  { id: 'dromcast', namn: $t('TORA VORTEX'), bolag: $t('TORA'), ar: 1999, dag: 286, enhet: 'hem', offset: 0.6, prisF: 0.9, liv: 3, modell: 'konsol-dromcast' },
  { id: 'ps2', namn: $t('HOSHI NOVA 2'), bolag: $t('HOSHI'), ar: 2000, dag: 328, enhet: 'hem', offset: 1.0, prisF: 1.0, liv: 12, modell: 'konsol-torn00' },
  { id: 'xlada', namn: $t('AXIOM X'), bolag: $t('AXIOM'), ar: 2002, dag: 73, enhet: 'hem', offset: 0.7, prisF: 1.05, liv: 5, modell: 'konsol-xlada' },
  { id: 'gamekub', namn: $t('TENKO KUB'), bolag: $t('TENKO'), ar: 2002, dag: 123, enhet: 'hem', offset: 0.5, prisF: 0.85, liv: 5, modell: 'konsol-gamekub' },
  { id: 'ds', namn: $t('TENKO DUO'), bolag: $t('TENKO'), ar: 2005, dag: 70, enhet: 'ficka', offset: 0.8, prisF: 0.8, liv: 8, modell: 'konsol-ds' },
  { id: 'x360', namn: $t('AXIOM X2'), bolag: $t('AXIOM'), ar: 2005, dag: 335, enhet: 'hem', offset: 0.9, prisF: 1.05, liv: 9, modell: 'konsol-x360' },
  { id: 'vi', namn: $t('TENKO VIVA'), bolag: $t('TENKO'), ar: 2006, dag: 342, enhet: 'hem', offset: 0.6, prisF: 0.75, liv: 7, modell: 'konsol-smal' },
  { id: 'ps3', namn: $t('HOSHI NOVA 3'), bolag: $t('HOSHI'), ar: 2007, dag: 82, enhet: 'hem', offset: 0.7, prisF: 1.35, liv: 9, modell: 'konsol-ps3' },
  { id: 'viu', namn: $t('TENKO VIVA U'), bolag: $t('TENKO'), ar: 2012, dag: 334, enhet: 'hem', offset: 0.1, prisF: 0.9, liv: 5, modell: 'konsol-viu' },
  { id: 'ps4', namn: $t('HOSHI NOVA 4'), bolag: $t('HOSHI'), ar: 2013, dag: 332, enhet: 'hem', offset: 1.0, prisF: 1.0, liv: 8, modell: 'konsol-ps4' },
  { id: 'xladaett', namn: $t('AXIOM X3'), bolag: $t('AXIOM'), ar: 2013, dag: 325, enhet: 'hem', offset: 0.5, prisF: 1.1, liv: 7, modell: 'konsol-xladaett' },
  { id: 'svitsch', namn: $t('TENKO SNAP'), bolag: $t('TENKO'), ar: 2017, dag: 61, enhet: 'hybrid', offset: 1.0, prisF: 0.95, liv: 8, modell: 'konsol-hybrid' },
  { id: 'kvest', namn: $t('PANORAMA VR'), bolag: $t('PANORAMA'), ar: 2019, dag: 140, enhet: 'vr', offset: 0.4, prisF: 0.9, liv: 5, modell: 'konsol-kvest' },
  { id: 'ps5', namn: $t('HOSHI NOVA 5'), bolag: $t('HOSHI'), ar: 2020, dag: 323, enhet: 'hem', offset: 1.0, prisF: 1.0, liv: 7, modell: 'konsol-torn20' },
  { id: 'seriex', namn: $t('AXIOM X4'), bolag: $t('AXIOM'), ar: 2020, dag: 314, enhet: 'hem', offset: 0.8, prisF: 1.0, liv: 7, modell: 'konsol-seriex' },
  { id: 'angdack', namn: $t('FORGE GO'), bolag: $t('FORGE'), ar: 2022, dag: 55, enhet: 'ficka', offset: 0.6, prisF: 1.0, liv: 5, modell: 'konsol-angdack' },
  { id: 'svitsch2', namn: $t('TENKO SNAP 2'), bolag: $t('TENKO'), ar: 2025, dag: 155, enhet: 'hybrid', offset: 1.0, prisF: 1.0, liv: 6, modell: 'konsol-svitsch2' },
];

// Studiorna. relation börjar på 0 (−3 … +3): bra avtal och hits höjer, avbrutna eller giriga avtal sänker.
export const STUDIOS = [
  { id: 'taitoo', namn: $t('ARCADIA'), forebild: 'Taito' }, { id: 'namko', namn: $t('MIRAI'), forebild: 'Namco' },
  { id: 'activizion', namn: $t('ACTION LABS'), forebild: 'Activision' }, { id: 'elorga', namn: $t('SOYUZ SOFT'), forebild: 'Elorg' },
  { id: 'svamp', namn: $t('SVAMPSTUDION'), forebild: 'Nintendos egna team' }, { id: 'sego', namn: $t('TORA GAMES'), forebild: 'Sega' },
  { id: 'kapkom', namn: $t('KATANA WORKS'), forebild: 'Capcom' }, { id: 'sonnyteam', namn: $t('BLUE DASH'), forebild: 'Sonic Team' },
  { id: 'idmjuk', namn: $t('DELTA LABS'), forebild: 'id Software' }, { id: 'stygga', namn: $t('GRAY WOLF'), forebild: 'Naughty Dog' },
  { id: 'karn', namn: $t('KERNEL'), forebild: 'Core Design' }, { id: 'square', namn: $t('QUADRA'), forebild: 'Square Enix' },
  { id: 'polyfoni', namn: $t('OCTAVE'), forebild: 'Polyphony Digital' }, { id: 'spelfreak', namn: $t('CRITTER LAB'), forebild: 'Game Freak' },
  { id: 'konamo', namn: $t('KOMET'), forebild: 'Konami' }, { id: 'bungo', namn: $t('ORBITAL'), forebild: 'Bungie' },
  { id: 'rockstjarna', namn: $t('ASFALT'), forebild: 'Rockstar' }, { id: 'ubisofft', namn: $t('ATLAS'), forebild: 'Ubisoft' },
  { id: 'molekyl', namn: $t('DOODLE'), forebild: 'Media Molecule' }, { id: 'mojang', namn: $t('BLOCKSMITH'), forebild: 'Mojang' },
  { id: 'bethesta', namn: $t('NORTHSTAR'), forebild: 'Bethesda' }, { id: 'konster', namn: $t('PRISMA'), forebild: 'Electronic Arts' },
  { id: 'episka', namn: $t('TITAN'), forebild: 'Epic Games' }, { id: 'insomniak', namn: $t('NIGHT OWL'), forebild: 'Insomniac' },
  { id: 'sallsynt', namn: $t('ULTRA'), forebild: 'Rare' }, { id: 'innerslott', namn: $t('LITTLE SHIP'), forebild: 'Innersloth' },
  { id: 'takt', namn: $t('RHYTHM BOX'), forebild: 'Beat Games' }, { id: 'lekplatsen', namn: $t('OPEN ROAD'), forebild: 'Playground Games' },
  { id: 'fromspel', namn: $t('ASHEN'), forebild: 'FromSoftware' }, { id: 'lekteamet', namn: $t('TOYBOX'), forebild: 'Team Asobi' },
];
export const studioAv = (id) => STUDIOS.find((s) => s.id === id) || { id, namn: String(id).toUpperCase(), forebild: '' };

// Spelen studiorna kan göra till din konsol. id = glimtens id om en glimt finns (js/konsol/glimtar.js), annars visas
// ett titelkort. stj = 1–5, ss = systemsäljare (folk köper konsolen för spelets skull), kraver = minsta nivå per
// delgrupp (delens id i K_DELAR), enhet = bara för en viss enhetstyp, funk = kräver en funktion.
const S = (id, titel, studio, ar, stj, o = {}) => ({ id, titel, studio, ar, stj, kraver: {}, ...o });
export const SPEL = [
  S('invaders', $t('RYMDANFALL'), 'taitoo', 1982, 2),
  S('pac', $t('GLUFS'), 'namko', 1982, 3, { ss: true }),
  S('donkey', $t('APTORNET'), 'svamp', 1982, 3),
  S('pitfell', $t('DJUNGELFALLAN'), 'activizion', 1983, 2),
  S('tetrix', $t('BLOCKFALL'), 'elorga', 1984, 3, { ficka: 2 }),
  S('marco', $t('SUPER PIPO'), 'svamp', 1985, 5, { ss: true, kraver: { kontroll: 'styrkors', grafik: 'scroll' } }),
  S('alexkidz', $t('KID KOSMO'), 'sego', 1986, 3, { kraver: { kontroll: 'styrkors' } }),
  S('zella', $t('LEGENDEN OM LYRA'), 'svamp', 1987, 4, { kraver: { kontroll: 'styrkors', spar: 'batteri' } }),
  S('megamann', $t('ROBO REX'), 'kapkom', 1988, 3, { kraver: { kontroll: 'styrkors' } }),
  S('sonny', $t('ZIPPY IGELKOTTEN'), 'sonnyteam', 1991, 5, { ss: true, kraver: { cpu: '16bit', grafik: 'scroll' } }),
  S('streetfajter', $t('GATUKAMP II'), 'kapkom', 1991, 4, { kraver: { cpu: '16bit', kontroll: '6knapp' } }),
  S('marcokart', $t('PIPO KART'), 'svamp', 1992, 4, { ss: true, kraver: { grafik: 'mode7' } }),
  S('doomsdag', $t('DEMONJAKTEN'), 'idmjuk', 1993, 4, { kraver: { cpu: '16bit' } }),
  S('segorally', $t('TORA RALLY'), 'sego', 1995, 3, { kraver: { grafik: '3d', media: 'cd' } }),
  S('crash', $t('KRASCH KOALA'), 'stygga', 1996, 4, { ss: true, kraver: { grafik: '3d', media: 'cd' } }),
  S('marco64', $t('PIPO 64'), 'svamp', 1996, 5, { ss: true, kraver: { grafik: '3d', kontroll: 'analog' } }),
  S('tombrajder', $t('GRAVJAKTEN'), 'karn', 1996, 4, { kraver: { grafik: '3d' } }),
  S('ff7', $t('SISTA SAGAN VII'), 'square', 1997, 5, { kraver: { grafik: '3d', media: 'cd' } }),
  S('granturismos', $t('GRAND PRIX SIMULATOR'), 'polyfoni', 1997, 4, { kraver: { grafik: '3d', media: 'cd' } }),
  S('fickmonster', $t('MONSTERKOMPIS GUL'), 'spelfreak', 1998, 5, { ss: true, enhet: 'ficka', kraver: { nat: 'lank' } }),
  S('zellaokarina', $t('LYRA: TIDENS HARPA'), 'svamp', 1998, 5, { kraver: { grafik: '3d', kontroll: 'analog' } }),
  S('metallgear', $t('SMYGOPERATION'), 'konamo', 1998, 4, { kraver: { grafik: '3d', media: 'cd' } }),
  S('galentaxi', $t('TURBOTAXI'), 'sego', 1999, 3, { kraver: { grafik: '3d', media: 'cd' } }),
  S('haloo', $t('GLORIA'), 'bungo', 2001, 5, { ss: true, kraver: { grafik: 'shader', kontroll: 'vibration', spar: 'hdd' } }),
  S('gta3', $t('BILTJUVEN III'), 'rockstjarna', 2001, 5, { kraver: { grafik: 'shader', media: 'dvd' } }),
  S('marcosolsken', $t('PIPO SOLSKEN'), 'svamp', 2002, 4, { kraver: { grafik: 'shader', kontroll: 'vibration' } }),
  S('callofdutty', $t('FRONTLINJEN'), 'activizion', 2003, 4, { kraver: { grafik: 'shader', media: 'dvd' } }),
  S('gtasa', $t('BILTJUVEN: SOLKUSTEN'), 'rockstjarna', 2004, 5, { ss: true, kraver: { grafik: 'shader', media: 'dvd' } }),
  S('valparna', $t('VALPARNA'), 'svamp', 2005, 4, { ss: true, enhet: 'ficka', funk: 'pekskarm' }),
  S('visport', $t('VIVA SPORT'), 'svamp', 2006, 5, { ss: true, kraver: { kontroll: 'rorelse' } }),
  S('assassinskred', $t('SKUGGKLINGAN'), 'ubisofft', 2007, 4, { kraver: { grafik: 'hd' } }),
  S('gta4', $t('BILTJUVEN IV'), 'rockstjarna', 2008, 5, { kraver: { grafik: 'hd', media: 'dvd' } }),
  S('lillastora', $t('TYGDOCKAN'), 'molekyl', 2008, 4, { kraver: { grafik: 'hd', nat: 'butik' } }),
  S('gruvkraft', $t('BLOCKRIKET'), 'mojang', 2011, 5, { ss: true, kraver: { nat: 'butik' } }),
  S('skyrimm', $t('NORDRIKET'), 'bethesta', 2011, 5, { kraver: { grafik: 'hd' } }),
  S('gta5', $t('BILTJUVEN V'), 'rockstjarna', 2013, 5, { ss: true, kraver: { grafik: 'hd', media: 'bluray' } }),
  S('fiffa', $t('PROFFSFOTBOLL 15'), 'konster', 2014, 4, { kraver: { grafik: 'fullhd', nat: 'butik' } }),
  S('blackklatt', $t('KLADDKRIGET'), 'svamp', 2015, 4, { kraver: { grafik: 'hd', nat: 'butik' } }),
  S('fortnajt', $t('BATTLE ISLAND'), 'episka', 2017, 5, { ss: true, kraver: { nat: 'butik' } }),
  S('spindel', $t('SPINDELKUNGEN'), 'insomniak', 2018, 5, { kraver: { grafik: 'fullhd' } }),
  S('tjuvarnashav', $t('PIRATHAVET'), 'sallsynt', 2018, 4, { kraver: { grafik: 'fullhd', nat: 'butik' } }),
  S('blandoss', $t('RYMDSABOTAGE'), 'innerslott', 2020, 4, { kraver: { nat: 'butik' } }),
  S('taktsabel', $t('LASERTAKT'), 'takt', 2019, 4, { enhet: 'vr' }),
  S('forsa', $t('TURBO TOUR 5'), 'lekplatsen', 2021, 5, { kraver: { grafik: '4k', media: 'ssd' } }),
  S('eldenking', $t('ASKANS KUNG'), 'fromspel', 2022, 5, { kraver: { grafik: '4k' } }),
  S('astrobotten', $t('RYMDROBOTEN'), 'lekteamet', 2024, 5, { kraver: { kontroll: 'haptik' } }),
  S('marcokartvarld', $t('PIPO KART JORDEN RUNT'), 'svamp', 2025, 5, { ss: true, kraver: { grafik: '4k' } }),
  S('gta6', $t('BILTJUVEN VI'), 'rockstjarna', 2026, 5, { ss: true, final: true, kraver: { cpu: 'zen', grafik: 'ray', media: 'ssd' } }),
];
export const spelAv = (id) => SPEL.find((s) => s.id === id) || null;

// Konsolmarknadens händelser (samma form som HANDELSER i varld.js; id krockar inte med telefonernas, så att
// båda listorna kan gälla samtidigt när telefonavdelningen är öppen).
export const K_HANDELSER = [
  { id: 'krasch', namn: $t('SPELKRASCHEN'), text: $t('FÖR MÅNGA DÅLIGA SPEL! FOLK SLUTAR KÖPA KONSOLER – EFTERFRÅGAN −40 % OCH STUDIOS BLIR FÖRSIKTIGA.'), vid: { ar: 1983, dag: 180 }, langd: 540, effekt: { efterfragan: 0.6, studios: 0.4 } },
  { id: 'arkad', namn: $t('ARKADFEBERN'), text: $t('ALLA SPELAR PÅ ARKADHALLEN OCH VILL SPELA HEMMA OCKSÅ. EFTERFRÅGAN +10 %.'), vid: { ar: 1982, dag: 60 }, langd: 120, effekt: { efterfragan: 1.1 } },
  { id: 'cd', namn: $t('CD-REVOLUTIONEN'), text: $t('SPELEN FLYTTAR TILL CD. KONSOLER MED CD SÄLJER 20 % MER.'), vid: { ar: 1995, dag: 30 }, langd: 365, effekt: { mediaMin: 'cd', mediaBonus: 1.2 } },
  { id: 'pirat', namn: $t('PIRATKOPIERINGEN'), text: $t('FOLK BRÄNNER KOPIOR AV SPELEN. STUDIOSPELEN SÄLJER 20 % MINDRE.'), vid: { ar: 1998, dag: 100 }, langd: 365, effekt: { spelsalj: 0.8 } },
  { id: 'kbrist', namn: $t('KOMPONENTBRIST'), text: $t('FABRIKERNA I ÖSTERN ÄR ÖVERBELASTADE. ALLA DELAR KOSTAR 20 % MER.'), slump: 0.02, langd: 42, effekt: { styck: 1.2 } },
  { id: 'pandemi', namn: $t('ALLA ÄR HEMMA'), text: $t('ALLA ÄR HEMMA OCH SPELAR. EFTERFRÅGAN +40 %.'), vid: { ar: 2020, dag: 75 }, langd: 270, effekt: { efterfragan: 1.4 } },
  { id: 'chipbrist', namn: $t('CHIPBRISTEN'), text: $t('DET FINNS INTE CHIP SÅ DET RÄCKER. TILLVERKNINGEN KOSTAR 30 % MER.'), vid: { ar: 2021, dag: 30 }, langd: 365, effekt: { styck: 1.3 } },
  { id: 'kjul', namn: $t('JULHANDELN'), text: $t('DECEMBER! ALLA ÖNSKAR SIG EN KONSOL – EFTERFRÅGAN +60 %.'), jul: true, langd: 31, effekt: { efterfragan: 1.6 } },
];

// Reklam på lanseringsdagen i konsolspelet. Priserna är 2007 års (som telefonernas KAMPANJER) och skalas med
// prisnivån (sim/spel.js prisniva: 40 % 1982 → 100 % 2007). fran = första året kampanjen finns.
export const K_KAMPANJER = [
  { id: 'ingen', namn: $t('INGEN REKLAM'), pris: 0, hype: 0, info: $t('GRUNDEFTERFRÅGAN'), farg: 0x8c93b4 },
  { id: 'tidning', namn: $t('ANNONSER I SPELTIDNINGAR'), pris: 400_000, hype: 0.35, info: $t('+35 % TIDIG EFTERFRÅGAN'), farg: 0x3a7bd5, fran: 1982 },
  { id: 'natet', namn: $t('NÄTANNONSER'), pris: 600_000, hype: 0.5, info: $t('+50 % TIDIG EFTERFRÅGAN'), farg: 0x2ac8c8, fran: 1998 },
  { id: 'tv', namn: $t('TV-REKLAM'), pris: 4_000_000, hype: 0.9, info: $t('+90 % TIDIG EFTERFRÅGAN'), farg: 0x8e5bd1, fran: 1982 },
  { id: 'global', namn: $t('GLOBAL LANSERING'), pris: 15_000_000, hype: 1.8, info: $t('+180 % TIDIG EFTERFRÅGAN'), farg: 0xe8b230, tackningMin: 0.7, fran: 1982 },
];

// Bolagets egna spel. PANG! följer med den första konsolen; resten görs av spelutvecklarna (sim/konsol.js).
// Ett eget spel får stjärnor efter hur väl det putsades och hur duktiga spelutvecklarna är.
export const EGNA_SPEL = [
  { id: 'pang', titel: $t('PANG!'), ar: 1982, glimt: 'pang' },
  { id: 'rymdskytten', titel: $t('RYMDSKYTTEN'), ar: 1982 },
  { id: 'blockbrytaren', titel: $t('BLOCKBRYTAREN'), ar: 1983 },
  { id: 'rymdstenar', titel: $t('RYMDSTENAR'), ar: 1984 },
  { id: 'masken', titel: $t('MASKEN'), ar: 1985 },
  { id: 'pixelhopparen', titel: $t('PIXELHOPPAREN'), ar: 1987, kraver: { kontroll: 'styrkors' } },
  { id: 'racerkungen', titel: $t('RACERKUNGEN'), ar: 1990 },
  { id: 'drakgrottan', titel: $t('DRAKGROTTAN'), ar: 1993, kraver: { spar: 'batteri' } },
  { id: 'kubvarlden', titel: $t('KUBLANDET 3D'), ar: 1996, kraver: { grafik: '3d' } },
  { id: 'fotbollsfeber', titel: $t('FOTBOLLSFEBER'), ar: 1999 },
  { id: 'rymdkriget', titel: $t('RYMDKRIGET ONLINE'), ar: 2003, kraver: { nat: 'bredband' } },
  { id: 'dansmattan', titel: $t('DANSMATTAN'), ar: 2006, kraver: { kontroll: 'rorelse' } },
  { id: 'panghd', titel: $t('PANG! HD'), ar: 2010, kraver: { grafik: 'hd' } },
  { id: 'byggbolaget', titel: $t('BYGGBOLAGET'), ar: 2014 },
  { id: 'robotarenan', titel: $t('ROBOTARENAN'), ar: 2019 },
  { id: 'fabriksspelet', titel: $t('FABRIKEN – SPELET'), ar: 2024 },
];
export const egetSpelAv = (id) => EGNA_SPEL.find((s) => s.id === id) || null;

// Kontorsflytten i konsolspelet (telefonernas krav står i KONTOR i varld.js). spel = släppta spel till dina konsoler.
export const K_KONTORSKRAV = {
  litet: { krav: { salda: 2000 }, kravText: $t('2 000 SÅLDA KONSOLER') },
  vaning: { krav: { salda: 50_000, spel: 5 }, kravText: $t('50 000 SÅLDA + 5 SPEL') },
  studio: { krav: { salda: 250_000, spel: 12 }, kravText: $t('250 000 SÅLDA + 12 SPEL') },
  hk: { krav: { mal: 26, salda: 2_000_000 }, kravText: $t('MÅL 26 + 2 MILJONER SÅLDA') },
};

export const K_TIDNINGAR = [
  { id: 'datormagazin', namn: $t('DATAPRESSEN'), lynne: 'saklig' },
  { id: 'superplay', namn: $t('PIXELPRESS'), lynne: 'design' },
  { id: 'gamerika', namn: $t('SPELKRITIKERN'), lynne: 'elak' },
];
