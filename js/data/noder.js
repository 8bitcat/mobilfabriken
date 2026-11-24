// Forskningsträdet 2007–2026: varje nod låser upp något (en del, en kaross, en ram, en lins, en funktion,
// en enhetstyp eller en enhetsteknik). Byggs ur tabellerna i delar.js plus enheternas egna tekniker.
// En nod går att forska när dess år har kommit OCH föregångaren i samma rad är forskad.
import { $t } from '../core/i18n.js';
import { GRUPPER, DELAR, KAROSSER, RAMAR, LINSER, FUNKTIONER, ENHETER } from './delar.js';
import { K_NODER, K_KATEGORIER } from './konsol-noder.js';

// Kategorierna i trädets vänsterspalt (färg = förlagans färgkod)
export const KATEGORIER = [
  { id: 'skarm', namn: $t('SKÄRM'), farg: 0x3a8ff0 },
  { id: 'kamera', namn: $t('KAMERA'), farg: 0xf0962e },
  { id: 'chips', namn: $t('CHIPS'), farg: 0xe8484e },
  { id: 'minne', namn: $t('MINNE'), farg: 0xa070f0 },
  { id: 'batteri', namn: $t('BATTERI'), farg: 0x45c864 },
  { id: 'nat', namn: $t('NÄT'), farg: 0x2ac8c8 },
  { id: 'mjukvara', namn: $t('MJUKVARA'), farg: 0xf060b0 },
  { id: 'portar', namn: $t('PORTAR'), farg: 0xc8c050 },
  { id: 'kropp', namn: $t('KROPP'), farg: 0xb89070 },
  { id: 'design', namn: $t('DESIGN'), farg: 0xf0d040 },
  { id: 'funktioner', namn: $t('FUNKTIONER'), farg: 0x40d8a0 },
  { id: 'enheter', namn: $t('ENHETER'), farg: 0xe8e8f0 },
  { id: 'wearables', namn: $t('KLOCKOR'), farg: 0xf05050 },
  { id: 'ljud', namn: $t('LJUD'), farg: 0x8878f0 },
  { id: 'laptops', namn: $t('LAPTOPS'), farg: 0x60a0e0 },
];

// Enheternas egna tekniker (räknas som funktioner för den enhetstypen när de är forskade)
const ET = (id, namn, ar, fp, enhet, rad) => ({ id, namn, ar, fp, enhet, rad });
const ENHETSTEKNIK = [
  ET('klockskarm-oled', $t('OLED'), 2015, 177, 'klocka', $t('KLOCKSKÄRM')), ET('klockskarm-aod', $t('ALLTID PÅ-OLED'), 2019, 382, 'klocka', $t('KLOCKSKÄRM')), ET('klockskarm-micro', $t('MICROLED'), 2023, 672, 'klocka', $t('KLOCKSKÄRM')),
  ET('halsa-puls', $t('PULSMÄTARE'), 2015, 177, 'klocka', $t('HÄLSOSENSORER')), ET('halsa-ekg', $t('EKG'), 2018, 359, 'klocka', $t('HÄLSOSENSORER')), ET('halsa-syre', $t('SYREMÄTNING'), 2020, 573, 'klocka', $t('HÄLSOSENSORER')), ET('halsa-tryck', $t('BLODTRYCK'), 2023, 878, 'klocka', $t('HÄLSOSENSORER')),
  ET('klockchip-s3', $t('KLOCKCHIP S3'), 2017, 206, 'klocka', $t('KLOCKCHIP')), ET('klockchip-s6', $t('KLOCKCHIP S6'), 2020, 406, 'klocka', $t('KLOCKCHIP')), ET('klockchip-s9', $t('KLOCKCHIP S9 + AI'), 2023, 672, 'klocka', $t('KLOCKCHIP')),
  ET('drivare-11', $t('EGEN 11 MM-DRIVARE'), 2018, 221, 'horlurar', $t('LJUDDRIVARE')), ET('drivare-hifi', $t('HI-FI DUBBELDRIVARE'), 2020, 406, 'horlurar', $t('LJUDDRIVARE')), ET('drivare-lossless', $t('FÖRLUSTFRITT LJUD'), 2023, 672, 'horlurar', $t('LJUDDRIVARE')),
  ET('anc', $t('BRUSREDUCERING'), 2019, 102, 'horlurar', $t('BRUSREDUCERING')), ET('anc-adaptiv', $t('ADAPTIV BRUSREDUCERING'), 2021, 264, 'horlurar', $t('BRUSREDUCERING')),
  ET('lurbatt-6', $t('6 TIMMARS BATTERI'), 2018, 221, 'horlurar', $t('HÖRLURSBATTERI')), ET('lurbatt-8', $t('8 TIMMARS BATTERI'), 2020, 406, 'horlurar', $t('HÖRLURSBATTERI')), ET('lurbatt-10', $t('10 TIMMARS BATTERI'), 2022, 639, 'horlurar', $t('HÖRLURSBATTERI')),
  ET('bt-50', $t('BLUETOOTH 5.0'), 2017, 206, 'horlurar', $t('BLUETOOTH')), ET('bt-52', $t('BLUETOOTH 5.2'), 2020, 406, 'horlurar', $t('BLUETOOTH')), ET('bt-54', $t('BLUETOOTH 5.4'), 2023, 672, 'horlurar', $t('BLUETOOTH')),
  ET('tangent-sax', $t('SAXTANGENTBORD'), 2016, 312, 'laptop', $t('TANGENTBORD')), ET('tangent-lag', $t('LÅGPROFILTANGENTER'), 2020, 573, 'laptop', $t('TANGENTBORD')),
  ET('styr-force', $t('TRYCKKÄNSLIG STYRPLATTA'), 2015, 289, 'laptop', $t('STYRPLATTA')), ET('styr-haptik', $t('JÄTTEHAPTIK'), 2021, 606, 'laptop', $t('STYRPLATTA')),
  ET('gang-droppe', $t('DROPPGÅNGJÄRN'), 2021, 264, 'vikbar', $t('GÅNGJÄRN')), ET('gang-veckfri', $t('VECKFRI SKÄRM'), 2023, 476, 'vikbar', $t('GÅNGJÄRN')),
];
const ENHETSKAT = { klocka: 'wearables', horlurar: 'ljud', laptop: 'laptops', vikbar: 'kropp' };

function bygg() {
  const ut = [];
  const rad = (kat, radnamn, lista, lasUpp, kedja = true) => {
    let foreg = null;
    for (const d of lista) {
      if (!d.fp) { foreg = null; continue; }                 // startdel: ingen nod
      const n = { id: lasUpp(d).nyckel, kat, rad: radnamn, namn: d.namn, ar: d.ar, fp: d.fp, foreg: kedja && foreg ? [foreg] : [], lasUpp: lasUpp(d) };
      ut.push(n); foreg = n.id;
    }
  };
  const radNamn = { upplosning: $t('UPPLÖSNING'), frekvens: $t('BILDFREKVENS'), skarmteknik: $t('SKÄRMTEKNIK'), selfie: $t('SELFIEKAMERA'), bakkamera: $t('BAKKAMERA'), chip: $t('PROCESSOR'),
    ram: $t('ARBETSMINNE'), lagring: $t('LAGRING'), batteri: $t('BATTERI'), nat: $t('NÄT'), os: $t('OPERATIVSYSTEM'), port: $t('LADDPORT'), material: $t('MATERIAL') };
  for (const g of GRUPPER) rad(g.kat, radNamn[g.id], DELAR[g.id], (d) => ({ typ: 'del', grupp: g.id, id: d.id, nyckel: `del-${g.id}-${d.id}` }));
  rad('kamera', $t('EXTRA LINSER'), LINSER, (d) => ({ typ: 'lins', id: d.id, nyckel: `lins-${d.id}` }));
  rad('design', $t('RAMAR'), RAMAR, (d) => ({ typ: 'ram', id: d.id, nyckel: `ram-${d.id}` }));
  rad('design', $t('KAROSS'), KAROSSER, (d) => ({ typ: 'kaross', id: d.id, nyckel: `kaross-${d.id}` }), false);
  rad('funktioner', $t('FUNKTIONER'), [...FUNKTIONER].sort((a, b) => a.ar - b.ar).slice(0, 8), (d) => ({ typ: 'funktion', id: d.id, nyckel: `funk-${d.id}` }), false);
  rad('funktioner', $t('FLER FUNKTIONER'), [...FUNKTIONER].sort((a, b) => a.ar - b.ar).slice(8), (d) => ({ typ: 'funktion', id: d.id, nyckel: `funk-${d.id}` }), false);
  rad('enheter', $t('NYA ENHETER'), ENHETER, (d) => ({ typ: 'enhet', id: d.id, nyckel: `enhet-${d.id}` }), false);
  // enhetsteknikerna kräver att enheten är forskad, och föregående teknik i samma rad
  const perRad = new Map();
  for (const t of ENHETSTEKNIK) {
    const key = t.enhet + t.rad, foreg = perRad.get(key);
    ut.push({ id: `et-${t.id}`, kat: ENHETSKAT[t.enhet], rad: t.rad, namn: t.namn, ar: t.ar, fp: t.fp, foreg: [foreg || `enhet-${t.enhet}`], lasUpp: { typ: 'enhetsteknik', enhet: t.enhet, id: t.id, nyckel: `et-${t.id}` } });
    perRad.set(key, `et-${t.id}`);
  }
  return ut;
}

// NODER = telefonernas 144 (som förut). Konsolernas ligger i konsol-noder.js; NOD slår upp båda, så att
// forskad(G, id) fungerar för alla delar oavsett linje.
export const NODER = bygg().map((n) => ({ ...n, linje: 'telefon' }));
export const ALLA_NODER = [...NODER, ...K_NODER];
export const NOD = Object.fromEntries(ALLA_NODER.map((n) => [n.id, n]));
// raderna i trädet i visningsordning: [{ kat, rad }]
const raderAv = (kategorier, noder) => {
  const seen = new Set(), ut = [];
  for (const k of kategorier) for (const n of noder) if (n.kat === k.id && !seen.has(n.kat + n.rad)) { seen.add(n.kat + n.rad); ut.push({ kat: k.id, rad: n.rad }); }
  return ut;
};
export const RADER = raderAv(KATEGORIER, NODER);
export const K_RADER = raderAv(K_KATEGORIER, K_NODER);
export const katAv = (id) => KATEGORIER.find((k) => k.id === id) || K_KATEGORIER.find((k) => k.id === id);
export { K_NODER, K_KATEGORIER };
