// Konsolernas forskningsträd 1982–2026, byggt ur tabellerna i konsol.js på samma sätt som telefonernas
// (data/noder.js). Noden TELEFONAVDELNINGEN (k-mobil) öppnar telefongrenen: i konsolspelet är alla telefonnoder
// låsta tills den är forskad (sim/forskning.js).
import { $t } from '../core/i18n.js';
import { APPLAGE } from '../core/applage.js';
import { K_GRUPPER, K_DELAR, K_KAROSSER, K_ENHETER, K_FUNKTIONER } from './konsol.js';

export const K_KATEGORIER = [
  { id: 'kprocessor', namn: $t('PROCESSOR'), farg: 0xe8484e },
  { id: 'kgrafik', namn: $t('GRAFIK'), farg: 0x3a8ff0 },
  { id: 'kljud', namn: $t('LJUD'), farg: 0x8878f0 },
  { id: 'kminne', namn: $t('MINNE'), farg: 0xa070f0 },
  { id: 'kmedia', namn: $t('MEDIA & SPARNING'), farg: 0xf0962e },
  { id: 'kkontroll', namn: $t('HANDKONTROLL'), farg: 0x45c864 },
  { id: 'knat', namn: $t('UPPKOPPLING'), farg: 0x2ac8c8 },
  { id: 'kkropp', namn: $t('KROPP & DESIGN'), farg: 0xf0d040 },
  { id: 'kfunk', namn: $t('FUNKTIONER'), farg: 0x40d8a0 },
  { id: 'kenheter', namn: $t('ENHETER'), farg: 0xe8e8f0 },
  { id: 'kmobil', namn: $t('MOBIL'), farg: 0xf060b0 },
];

const RADNAMN = { cpu: $t('PROCESSOR'), grafik: $t('GRAFIK'), ljud: $t('LJUD'), minne: $t('ARBETSMINNE'), media: $t('SPELMEDIA'), kontroll: $t('HANDKONTROLL'), nat: $t('UPPKOPPLING'), spar: $t('SPARNING'), material: $t('MATERIAL') };

function bygg() {
  const ut = [];
  const rad = (kat, radnamn, lista, lasUpp, kedja = true, krav = null) => {
    let foreg = null;
    for (const d of lista) {
      if (!d.fp) { foreg = null; continue; }   // finns från start: ingen nod
      const l = lasUpp(d), f = [];
      if (kedja && foreg) f.push(foreg);
      if (krav) { const k = krav(d); if (k) f.push(k); }
      ut.push({ id: l.nyckel, linje: 'konsol', kat, rad: radnamn, namn: d.namn, ar: d.ar, fp: d.fp, foreg: f, lasUpp: l });
      foreg = l.nyckel;
    }
  };
  for (const g of K_GRUPPER) rad(g.kat, RADNAMN[g.id], K_DELAR[g.id], (d) => ({ typ: 'kdel', linje: 'konsol', grupp: g.id, id: d.id, nyckel: `kdel-${g.id}-${d.id}` }));
  rad('kenheter', $t('NYA ENHETER'), K_ENHETER, (d) => ({ typ: 'kenhet', linje: 'konsol', id: d.id, nyckel: `kenhet-${d.id}` }), false);
  // karosserna: en rad per enhetstyp; karossen kräver att enheten är forskad
  for (const e of K_ENHETER) {
    const lista = K_KAROSSER.filter((k) => k.enhet === e.id);
    rad('kkropp', e.id === 'hem' ? $t('KAROSSER') : $t`KAROSSER ${e.namn}`, lista, (d) => ({ typ: 'kkaross', linje: 'konsol', id: d.id, nyckel: `kkaross-${d.id}` }), false,
      () => (e.fp ? `kenhet-${e.id}` : null));
  }
  rad('kfunk', $t('FUNKTIONER'), K_FUNKTIONER, (d) => ({ typ: 'kfunk', linje: 'konsol', id: d.id, nyckel: `kfunk-${d.id}` }), false);
  // telefonavdelningen: kräver fickkonsol, pekskärm och trådlöst nät. Finns inte i appen Console Empire (bara konsoler,
  // Carl 2026-11-25: två appar med ren delning) – utan noden öppnas telefonerna aldrig.
  if (APPLAGE !== 'konsol') ut.push({ id: 'k-mobil', linje: 'konsol', kat: 'kmobil', rad: $t('TELEFONER'), namn: $t('TELEFONAVDELNINGEN'), ar: 2007, fp: 300, kostnadKr: 2_000_000,
    foreg: ['kenhet-ficka', 'kfunk-pekskarm', 'kfunk-wifi'], lasUpp: { typ: 'mobil', linje: 'konsol', id: 'mobil', nyckel: 'k-mobil' } });
  return ut;
}

export const K_NODER = bygg();
