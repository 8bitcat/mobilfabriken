// Forskningsträdet 2007–2026: varje nod låser upp något (en del, en kaross, en ram, en lins, en funktion,
// en enhetstyp eller en enhetsteknik). Byggs ur tabellerna i delar.js plus enheternas egna tekniker.
// En nod går att forska när dess år har kommit OCH föregångaren i samma rad är forskad.
import { GRUPPER, DELAR, KAROSSER, RAMAR, LINSER, FUNKTIONER, ENHETER } from './delar.js';

// Kategorierna i trädets vänsterspalt (färg = förlagans färgkod)
export const KATEGORIER = [
  { id: 'skarm', namn: 'SKÄRM', farg: 0x3a8ff0 },
  { id: 'kamera', namn: 'KAMERA', farg: 0xf0962e },
  { id: 'chips', namn: 'CHIPS', farg: 0xe8484e },
  { id: 'minne', namn: 'MINNE', farg: 0xa070f0 },
  { id: 'batteri', namn: 'BATTERI', farg: 0x45c864 },
  { id: 'nat', namn: 'NÄT', farg: 0x2ac8c8 },
  { id: 'mjukvara', namn: 'MJUKVARA', farg: 0xf060b0 },
  { id: 'portar', namn: 'PORTAR', farg: 0xc8c050 },
  { id: 'kropp', namn: 'KROPP', farg: 0xb89070 },
  { id: 'design', namn: 'DESIGN', farg: 0xf0d040 },
  { id: 'funktioner', namn: 'FUNKTIONER', farg: 0x40d8a0 },
  { id: 'enheter', namn: 'ENHETER', farg: 0xe8e8f0 },
  { id: 'wearables', namn: 'KLOCKOR', farg: 0xf05050 },
  { id: 'ljud', namn: 'LJUD', farg: 0x8878f0 },
  { id: 'laptops', namn: 'LAPTOPS', farg: 0x60a0e0 },
];

// Enheternas egna tekniker (räknas som funktioner för den enhetstypen när de är forskade)
const ET = (id, namn, ar, fp, enhet, rad) => ({ id, namn, ar, fp, enhet, rad });
const ENHETSTEKNIK = [
  ET('klockskarm-oled', 'OLED', 2015, 177, 'klocka', 'KLOCKSKÄRM'), ET('klockskarm-aod', 'ALLTID PÅ-OLED', 2019, 382, 'klocka', 'KLOCKSKÄRM'), ET('klockskarm-micro', 'MICROLED', 2023, 672, 'klocka', 'KLOCKSKÄRM'),
  ET('halsa-puls', 'PULSMÄTARE', 2015, 177, 'klocka', 'HÄLSOSENSORER'), ET('halsa-ekg', 'EKG', 2018, 359, 'klocka', 'HÄLSOSENSORER'), ET('halsa-syre', 'SYREMÄTNING', 2020, 573, 'klocka', 'HÄLSOSENSORER'), ET('halsa-tryck', 'BLODTRYCK', 2023, 878, 'klocka', 'HÄLSOSENSORER'),
  ET('klockchip-s3', 'KLOCKCHIP S3', 2017, 206, 'klocka', 'KLOCKCHIP'), ET('klockchip-s6', 'KLOCKCHIP S6', 2020, 406, 'klocka', 'KLOCKCHIP'), ET('klockchip-s9', 'KLOCKCHIP S9 + AI', 2023, 672, 'klocka', 'KLOCKCHIP'),
  ET('drivare-11', 'EGEN 11 MM-DRIVARE', 2018, 221, 'horlurar', 'LJUDDRIVARE'), ET('drivare-hifi', 'HI-FI DUBBELDRIVARE', 2020, 406, 'horlurar', 'LJUDDRIVARE'), ET('drivare-lossless', 'FÖRLUSTFRITT LJUD', 2023, 672, 'horlurar', 'LJUDDRIVARE'),
  ET('anc', 'BRUSREDUCERING', 2019, 102, 'horlurar', 'BRUSREDUCERING'), ET('anc-adaptiv', 'ADAPTIV BRUSREDUCERING', 2021, 264, 'horlurar', 'BRUSREDUCERING'),
  ET('lurbatt-6', '6 TIMMARS BATTERI', 2018, 221, 'horlurar', 'HÖRLURSBATTERI'), ET('lurbatt-8', '8 TIMMARS BATTERI', 2020, 406, 'horlurar', 'HÖRLURSBATTERI'), ET('lurbatt-10', '10 TIMMARS BATTERI', 2022, 639, 'horlurar', 'HÖRLURSBATTERI'),
  ET('bt-50', 'BLUETOOTH 5.0', 2017, 206, 'horlurar', 'BLUETOOTH'), ET('bt-52', 'BLUETOOTH 5.2', 2020, 406, 'horlurar', 'BLUETOOTH'), ET('bt-54', 'BLUETOOTH 5.4', 2023, 672, 'horlurar', 'BLUETOOTH'),
  ET('tangent-sax', 'SAXTANGENTBORD', 2016, 312, 'laptop', 'TANGENTBORD'), ET('tangent-lag', 'LÅGPROFILTANGENTER', 2020, 573, 'laptop', 'TANGENTBORD'),
  ET('styr-force', 'TRYCKKÄNSLIG STYRPLATTA', 2015, 289, 'laptop', 'STYRPLATTA'), ET('styr-haptik', 'JÄTTEHAPTIK', 2021, 606, 'laptop', 'STYRPLATTA'),
  ET('gang-droppe', 'DROPPGÅNGJÄRN', 2021, 264, 'vikbar', 'GÅNGJÄRN'), ET('gang-veckfri', 'VECKFRI SKÄRM', 2023, 476, 'vikbar', 'GÅNGJÄRN'),
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
  const radNamn = { upplosning: 'UPPLÖSNING', frekvens: 'BILDFREKVENS', skarmteknik: 'SKÄRMTEKNIK', selfie: 'SELFIEKAMERA', bakkamera: 'BAKKAMERA', chip: 'PROCESSOR',
    ram: 'ARBETSMINNE', lagring: 'LAGRING', batteri: 'BATTERI', nat: 'NÄT', os: 'OPERATIVSYSTEM', port: 'LADDPORT', material: 'MATERIAL' };
  for (const g of GRUPPER) rad(g.kat, radNamn[g.id], DELAR[g.id], (d) => ({ typ: 'del', grupp: g.id, id: d.id, nyckel: `del-${g.id}-${d.id}` }));
  rad('kamera', 'EXTRA LINSER', LINSER, (d) => ({ typ: 'lins', id: d.id, nyckel: `lins-${d.id}` }));
  rad('design', 'RAMAR', RAMAR, (d) => ({ typ: 'ram', id: d.id, nyckel: `ram-${d.id}` }));
  rad('design', 'KAROSS', KAROSSER, (d) => ({ typ: 'kaross', id: d.id, nyckel: `kaross-${d.id}` }), false);
  rad('funktioner', 'FUNKTIONER', [...FUNKTIONER].sort((a, b) => a.ar - b.ar).slice(0, 8), (d) => ({ typ: 'funktion', id: d.id, nyckel: `funk-${d.id}` }), false);
  rad('funktioner', 'FLER FUNKTIONER', [...FUNKTIONER].sort((a, b) => a.ar - b.ar).slice(8), (d) => ({ typ: 'funktion', id: d.id, nyckel: `funk-${d.id}` }), false);
  rad('enheter', 'NYA ENHETER', ENHETER, (d) => ({ typ: 'enhet', id: d.id, nyckel: `enhet-${d.id}` }), false);
  // enhetsteknikerna kräver att enheten är forskad, och föregående teknik i samma rad
  const perRad = new Map();
  for (const t of ENHETSTEKNIK) {
    const key = t.enhet + t.rad, foreg = perRad.get(key);
    ut.push({ id: `et-${t.id}`, kat: ENHETSKAT[t.enhet], rad: t.rad, namn: t.namn, ar: t.ar, fp: t.fp, foreg: [foreg || `enhet-${t.enhet}`], lasUpp: { typ: 'enhetsteknik', enhet: t.enhet, id: t.id, nyckel: `et-${t.id}` } });
    perRad.set(key, `et-${t.id}`);
  }
  return ut;
}

export const NODER = bygg();
export const NOD = Object.fromEntries(NODER.map((n) => [n.id, n]));
// raderna i trädet i visningsordning: [{ kat, rad }]
export const RADER = (() => {
  const seen = new Set(), ut = [];
  for (const k of KATEGORIER) for (const n of NODER) if (n.kat === k.id && !seen.has(n.kat + n.rad)) { seen.add(n.kat + n.rad); ut.push({ kat: k.id, rad: n.rad }); }
  return ut;
})();
export const katAv = (id) => KATEGORIER.find((k) => k.id === id);
