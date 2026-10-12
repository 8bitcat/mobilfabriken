// Spelets tillstånd G: ett vanligt JSON-objekt som sparas rakt av. Här skapas det och här finns
// pengaflödet (alla in- och utbetalningar går genom betala/intakt så att årsstatistiken stämmer),
// händelsekön till gränssnittet (toast, banner, autopaus) och nyheterna.
import { RIVALER, KONTOR } from '../data/varld.js';
import { arAv, datumText, slump, klamp, kr } from './bas.js';

export const SPAR_VERSION = 1;
// Slutgalan (SPELDESIGN §2.12): bolaget går att sälja från 1 januari detta år (BOLAGET → SÄLJ BOLAGET)
export const SALJ_AR = 2027;
export const START_KASSA = 2_000_000;
export const START_FP = 20;

export const PLATSER = { garage: { golv: 4, vagg: 3 }, litet: { golv: 8, vagg: 4 }, vaning: { golv: 12, vagg: 5 }, studio: { golv: 16, vagg: 7 }, hk: { golv: 18, vagg: 9 } };

export function nyttSpel({ namn = 'MIKROVÅG MOBIL', initial = null, seed = null, arv = null } = {}) {
  namn = String(namn || 'MITT BOLAG').toUpperCase().slice(0, 22);
  const G = {
    version: SPAR_VERSION, id: 'b' + Date.now().toString(36), skapad: Date.now(),
    rng: (seed ?? Math.floor(Math.random() * 2 ** 31)) | 0,
    dag: 0, fart: 1,
    bolag: { namn, initial: (initial || namn.replace(/[^A-ZÅÄÖ0-9]/g, '')[0] || 'M').toUpperCase(), kassa: START_KASSA, fp: START_FP, rykte: 1.0,
      lanseringar: 0, totaltSalda: 0, bastaBetyg: 0, enhetstyper: [] },
    kontor: { niva: 'garage', bord: [null, null], golv: [null, null, null, null], vagg: [null, null, null], golvtyp: 'betong', vaggtyp: 'tegel', forrad: [] },
    personal: [], kandidater: [], omrullDag: -99, moral: 50, fest: 0,
    koncept: [], projekt: [], produkter: [],
    forskning: { klara: [], pagar: [] },
    marknad: { regioner: ['norden'], rivaler: [], handelser: [] },
    nyheter: [], mal: { klara: [], utmarkelser: [] },
    stat: { ar: {}, kassa: [[0, START_KASSA]], vecka: [] },
    lan: 0, inventarie: { influencer: 0, direktbygge: 0 }, legendariska: [],
    handledning: { steg: 0, klar: false, av: false },
    installningar: { autopaus: true, telefon: '3d', snabbt: false, ljud: true },
    ko: [], flaggor: {},
  };
  if (arv) {
    const n = klamp(Math.floor(+arv.saldaBolag || 0), 0, 5);
    G.arv = { ...arv, saldaBolag: n };
    G.bolag.kassa = Math.round(START_KASSA * (1 + 0.1 * n)); G.legendariska = [...(arv.ytor || [])];
  }
  // rivalerna börjar med fjolårets modell (generation 1, lanserad 2006)
  const rival = (id, R, egen) => G.marknad.rivaler.push({ id, ...(egen ? { egen: R } : {}), gen: 1, betyg: Math.round((6.0 + R.offset) * 10) / 10, pris: Math.round(1640 * R.prisF / 10) * 10, lanseradDag: R.dag - 365, nastaDag: R.dag });
  for (const r of RIVALER) rival(r.id, r, false);
  // dina sålda bolag blir rivaler (SPELDESIGN §2.12): lika bra som de var, mot snittet
  arvRivaler(arv, namn).forEach((R, i) => rival('arv' + (i + 1), R, true));
  nyhet(G, 'DU', `DU GRUNDADE ${G.bolag.namn} I ETT GARAGE. DAGS ATT RITA DIN FÖRSTA TELEFON!`);
  return G;
}
const ARV_FARGER = [0x8e5bd1, 0xf060b0, 0xe07a2e, 0x4ff0ff, 0x7ee09a];
export function arvRivaler(arv, nyttNamn = '') {
  const unika = new Map();
  for (const b of arv?.gamlaBolag || []) if (b && b.namn && String(b.namn).toUpperCase() !== nyttNamn) unika.set(String(b.namn).toUpperCase(), b);
  return [...unika.values()].slice(-5).map((b, i) => {
    const bolag = String(b.namn).toUpperCase().slice(0, 22);
    return { bolag, modell: (bolag.split(' ')[0] || 'GARAGE').slice(0, 12) + ' PHONE', offset: Math.round(klamp((+b.betyg || 6.2) - 6.5, -1, 1) * 10) / 10,
      prisF: 1, dag: 140 + i * 30, farg: ARV_FARGER[i % ARV_FARGER.length], karaktar: 'DITT GAMLA BOLAG' };
  });
}

// ---------- pengar ----------
function arStat(G) { const a = arAv(G.dag); return (G.stat.ar[a] ||= { intakt: 0, kostnad: 0, per: {} }); }
export function betala(G, belopp, kategori) {
  belopp = Math.round(belopp); if (!belopp) return;
  G.bolag.kassa -= belopp; const s = arStat(G); s.kostnad += belopp; s.per[kategori] = (s.per[kategori] || 0) - belopp;
}
export function intakt(G, belopp, kategori) {
  belopp = Math.round(belopp); if (!belopp) return;
  G.bolag.kassa += belopp; const s = arStat(G); s.intakt += belopp; s.per[kategori] = (s.per[kategori] || 0) + belopp;
}
export const harRad = (G, belopp) => G.bolag.kassa >= belopp;
// Banklån: pengarna kommer in i kassan men är ingen intäkt (och återbetalningen ingen kostnad) – bara räntan
// (10 %/år, dras den 1:a i tick.js) räknas i årets resultat. Nödlånet (kassa < 0) och LÅNA på lanseringsdagen.
export const NODLAN = 500_000;
export function lana(G, belopp = NODLAN, text = null) {
  belopp = Math.round(belopp); if (!(belopp > 0)) return { ok: false };
  G.lan += belopp; G.bolag.kassa += belopp;
  nyhet(G, 'DU', text || `BANKEN LÅNAR ${G.bolag.namn} ${kr(belopp)}. RÄNTAN ÄR 10 % OM ÅRET.`);
  return { ok: true, belopp };
}

// ---------- gränssnittets händelsekö ----------
// typ: 'toast' (liten ruta), 'banner' (blå rad överst), 'stor' (helskärmskort), 'konfetti'
export function signal(G, typ, data = {}) {
  G.ko.push({ typ, dag: G.dag, ...data });
  if (data.paus && G.installningar.autopaus) G.flaggor.autopaus = true;
  if (G.ko.length > 40) G.ko.splice(0, G.ko.length - 40);
}
export function nyhet(G, typ, text) {
  G.nyheter.unshift({ dag: G.dag, typ, text });
  if (G.nyheter.length > 150) G.nyheter.length = 150;
}
export const datum = (G) => datumText(G.dag);
export const ar = (G) => arAv(G.dag);
export const kontorNiva = (G) => KONTOR.find((k) => k.id === G.kontor.niva) || KONTOR[0];
export const r01 = (G) => slump(G);
export { klamp };
