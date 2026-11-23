// En design (telefon eller spelkonsol): vad den består av, vad den kostar att tillverka och hur kritikerna bedömer den.
// Betyget = 10 × (0,60 × TEKNIK + 0,20 × DESIGN + 0,20 × PUTS) − 0,1 × buggar + 0,1 × funktioner (max +1).
//   TEKNIK = linjens delar mot årets förväntan (i nivå 1,0 · ett steg under 0,5 · två+ under 0,2 · över 1,2)
//   DESIGN = 0,4 × karossens fräschhet + 0,3 × materialet + 0,3 × ytan
//   PUTS   = kvalitetsprickar under bygget / kvalitetsmålet
// Kalibrerat mot förlagan: en 2007-telefon med standarddelar, 5 prickar och 2 buggar får ~6,2.
// Linjen (d.linje, data/linjer.js) väljer tabellerna: telefonens 13 delgrupper eller konsolens 9.
import { RAMAR, LINSER, delAv as tDelAv } from '../data/delar.js';
import { linjeAv } from '../data/linjer.js';
import { EGNA_SPEL } from '../data/konsol-varld.js';
import { NOD } from '../data/noder.js';
import { arAv, klamp } from './bas.js';

// ---------- vad finns att välja ----------
const nyckel = { ram: (id) => `ram-${id}`, lins: (id) => `lins-${id}` };
export const forskad = (G, nodId) => !NOD[nodId] || G.forskning.klara.includes(nodId);
// L = linjens id ('telefon' om den saknas)
export const harDel = (G, g, id, L) => { const Li = linjeAv(L), d = Li.delAv(g, id); return !!d && (!d.fp || forskad(G, `${Li.nyckel.del}-${g}-${id}`)); };
export const harKaross = (G, id, L) => { const Li = linjeAv(L), k = Li.KAROSSER.find((x) => x.id === id); return !!k && (!k.fp || forskad(G, `${Li.nyckel.kaross}-${id}`)); };
export const harRam = (G, id) => { const r = RAMAR.find((x) => x.id === id); return !!r && (!r.fp || forskad(G, nyckel.ram(id))); };
export const harFunktion = (G, id, L) => forskad(G, `${linjeAv(L).nyckel.funk}-${id}`);
export const harEnhet = (G, id, L) => { const Li = linjeAv(L), e = Li.ENHETER.find((x) => x.id === id); return !!e && (!e.fp || forskad(G, `${Li.nyckel.enhet}-${id}`)); };
export const antalLinserTillatna = (G) => 1 + Math.min(3, LINSER.filter((l) => forskad(G, nyckel.lins(l.id))).length);
export const minRam = (G) => Math.min(...RAMAR.filter((r) => harRam(G, r.id)).map((r) => r.min));
export const nodForDel = (g, id, L) => NOD[`${linjeAv(L).nyckel.del}-${g}-${id}`] || null;
export const arKonsol = (d) => d?.linje === 'konsol';

// ---------- ny design ----------
let lopnr = 0;
export function nyDesign(G, bas = null, linje = 'telefon') {
  const d = bas ? JSON.parse(JSON.stringify(bas)) : linje === 'konsol' ? nyKonsol(G) : {
    enhet: 'telefon', kaross: 'krom', val: { ...linjeAv('telefon').STANDARD_VAL },
    form: { bredd: 0.69, hojd: 1.09, djup: 0.11, radie: 0.1, ram: 0.06, haka: 0.14, kameraStorlek: 0.2 },
    selfie: true, hemknapp: true, linser: 1, funktioner: [],
    farg: '#ebebee', glas: '#1d2a44', kamera: '#3a6bc2', yta: 'klassisk', marke: (G.bolag.initial || 'M'),
    pris: 2120, namn: '',
  };
  d.id = 'd' + G.dag + '-' + (++lopnr) + '-' + Math.floor(Math.random() * 1e6).toString(36);
  return d;
}
// En konsol: delar, kaross (= 3D-modellen), färg och yta, och ett eget spel som följer med i lådan (PANG! först).
function nyKonsol(G) {
  return {
    linje: 'konsol', enhet: 'hem', kaross: 'trapanel', val: { ...linjeAv('konsol').STANDARD_VAL }, funktioner: [],
    farg: null, yta: 'klassisk', marke: (G.bolag.initial || 'M'),   // farg null = formens egna färger
    packin: forstaPackin(G),   // null = ingen mjukvarufas, konsolen säljs utan eget spel
    pris: 1990, namn: '',
  };
}
// nästa egna spel som går att lägga i lådan: årets första som bolaget inte redan gjort (PANG! 1982)
export function packinLediga(G) {
  const a = arAv(G.dag), gjorda = new Set((G.k?.spel || []).filter((s) => s.egen).map((s) => s.egetId));
  for (const pr of G.projekt) if (pr.design?.packin) gjorda.add(pr.design.packin.id);
  return EGNA_SPEL.filter((e) => e.ar <= a && !gjorda.has(e.id));
}
const forstaPackin = (G) => { const e = packinLediga(G)[0]; return e ? { id: e.id, titel: e.titel, glimt: e.glimt || null } : null; };

// modellparametrar för 3D/pixel-telefonen
export function telAv(d) {
  const KAROSSER = linjeAv('telefon').KAROSSER;
  const kaross = KAROSSER.find((k) => k.id === d.kaross) || KAROSSER[0];
  return {
    bredd: d.form.bredd, hojd: d.form.hojd, djup: d.form.djup, radie: d.form.radie ?? kaross.radie, ram: d.form.ram,
    haka: d.hemknapp ? Math.max(d.form.haka, 0.12) : Math.max(d.form.ram, Math.min(d.form.haka, 0.08)),
    kameraStorlek: d.form.kameraStorlek, kameror: d.val.bakkamera === 'ingen' ? 0 : d.linser, selfie: d.selfie,
    kropp: d.farg, glas: d.glas, kamera: d.kamera, marke: d.marke || 'M', yta: d.yta, enhet: d.enhet,
  };
}
// konsolens 3D-modell: js/konsol/konsol-gl.js registrerar formerna i telefonstudion (BYGGARE) under sitt modell-id,
// så Vy3d.visa(rect, konsolTel(d)) visar konsolen. kropp = null ger formens originalfärger.
export function konsolTel(d) {
  const L = linjeAv('konsol'), k = L.KAROSSER.find((x) => x.id === d.kaross) || L.KAROSSER[0];
  return { enhet: k.modell, kropp: d.farg || null, yta: d.yta || 'klassisk', marke: d.marke || 'M' };
}
// skärmens diagonal i tum (modellenhet 1 = 10 cm)
export function tum(d) {
  const t = telAv(d), w = t.bredd - 2 * t.ram, h = t.hojd - 2 * t.ram - 0.07 - t.haka;
  return Math.max(1, Math.hypot(w, h) * 100 / 25.4);
}

// ---------- kostnad ----------
// Ny teknik är dyr i början och blir billigare: en dels styckpris sjunker 8 % per år efter uppfinningsåret (golv 35 %).
export const prisNu = (del, ar) => Math.round(del.kostnad * Math.max(0.35, Math.pow(0.92, Math.max(0, ar - del.ar))));
export function styckkostnad(G, d, effekter = {}) {
  const L = linjeAv(d), konsol = L.id === 'konsol';
  let sum = 0; const ar = G ? arAv(G.dag) : L.startAr;
  for (const g of L.GRUPPER) {
    if (!konsol && g.id === 'selfie' && !d.selfie) continue;
    const del = L.delAv(g.id, d.val[g.id]); if (!del) continue;
    sum += prisNu(del, ar) * (!konsol && g.id === 'bakkamera' ? 1 + 0.5 * Math.max(0, d.linser - 1) : 1);
  }
  sum += prisNu(L.KAROSSER.find((k) => k.id === d.kaross) || L.KAROSSER[0], ar);
  sum += (L.YTOR.find((y) => y.id === d.yta) || { kostnad: 0 }).kostnad;
  for (const f of d.funktioner) { const fu = L.FUNKTIONER.find((x) => x.id === f); if (fu) sum += prisNu(fu, ar); }
  if (!konsol) {
    if (d.hemknapp) sum += 15;
    // ramar tunnare än standard kostar som den tunnaste ramtekniken man använder
    const ramTeknik = [...RAMAR].reverse().find((r) => d.form.ram <= r.min + 1e-6 && r.kostnad);
    if (ramTeknik) sum += ramTeknik.kostnad;
    // större skärm än 3,7" kostar 6 kr per tiondels tum
    sum += Math.max(0, Math.round((tum(d) - 3.7) * 10)) * 6;
  }
  // andra enheter än telefonen/hemkonsolen: samma delar men mer eller mindre av dem (ENHETER.kostnad)
  sum *= L.enhetAv(d.enhet).kostnad;
  return Math.round(sum * (effekter.styck || 1));
}
// minsta tjocklek som batteriet kräver: 1,1 cm för 1 000 mAh, +0,1 cm per 500 mAh (bara telefonlinjen har en form)
export const minDjup = (d) => { if (arKonsol(d)) return 0; const b = tDelAv('batteri', d.val.batteri); return 0.11 + Math.max(0, ((b?.mah || 1000) - 1000) / 500) * 0.01 - (d.kaross === 'lufttunn' ? 0.02 : 0); };

// ---------- förväntan och betyg ----------
export function forvantan(grupp, ar, L) {
  const lista = linjeAv(L).DELAR[grupp] || []; let e = 0;
  lista.forEach((d, i) => { if (d.ar <= ar) e = Math.max(e, i); });
  return e;
}
const tekPoang = (diff) => (diff >= 1 ? 1.2 : diff === 0 ? 1.0 : diff === -1 ? 0.5 : 0.2);
export function teknik(d, ar, effekter = {}) {
  const L = linjeAv(d), konsol = L.id === 'konsol';
  let sum = 0, vikt = 0; const per = [];
  for (const g of L.GRUPPER) {
    let niva = L.nivaAv(g.id, d.val[g.id]);
    if (!konsol && g.id === 'selfie' && !d.selfie) niva = -1;
    // händelsernas vikter (APPBUTIKSFEBERN, SELFIEVÅGEN) gäller telefonernas delgrupper
    const e = forvantan(g.id, ar, L.id), p = tekPoang(niva - e), w = (!konsol && effekter.vikt && effekter.vikt[g.id]) || 1;
    sum += p * w; vikt += w; per.push({ grupp: g.id, namn: g.namn, niva, forv: e, poang: p });
  }
  return { poang: sum / vikt, per };
}
export function fraschhet(d, ar) { const L = linjeAv(d), k = L.KAROSSER.find((x) => x.id === d.kaross) || L.KAROSSER[0]; return klamp(1 - L.fraschhet * (ar - k.ar), 0, 1); }
export function designPoang(d, ar) {
  const L = linjeAv(d);
  const mat = L.delAv('material', d.val.material) || { kval: 0.3 };
  const yta = L.YTOR.find((y) => y.id === d.yta) || (d.yta && d.yta.startsWith('leg-') ? { kval: 1 } : { kval: 0.2 });
  return 0.4 * fraschhet(d, ar) + 0.3 * (mat.kval ?? 0.3) + 0.3 * yta.kval;
}
export function funktioner(G, d) {
  if (arKonsol(d)) return d.funktioner.length;
  let n = d.funktioner.length + Math.max(0, d.linser - 1);
  for (const r of RAMAR) if (r.id !== 'standard' && d.form.ram <= r.min + 1e-6) n++;
  if (G) for (const id of G.forskning.klara) if (id.startsWith('et-') && NOD[id]?.lasUpp.enhet === d.enhet) n++;
  return n;
}
export const FUNK_MAX = 1.0;   // funktionsbonusen: +0,1 per funktion, högst +1,0 (SPELDESIGN §2.7)
export function betyg(G, d, ar, kvalitet, kvalMal, buggar, effekter = {}) {
  const T = teknik(d, ar, effekter).poang, Dp = designPoang(d, ar), P = klamp(kvalitet / Math.max(1, kvalMal), 0, 1);
  const funk = Math.min(FUNK_MAX, 0.1 * funktioner(G, d));
  const b = 10 * (0.6 * T + 0.2 * Dp + 0.2 * P) - 0.1 * buggar + funk;
  return { betyg: Math.round(klamp(b, 1, 10) * 10) / 10, teknik: klamp(T / 1.2 * 1.2, 0, 1.2), design: Dp, puts: P, funk };
}
// Prylarna blir mer komplexa: telefonernas kvalitetsmål växer med ett per år efter 2007, konsolernas med ett
// vartannat år efter 1982 (en konsol 2006 är lika svår att putsa som en telefon 2007).
export const kvalitetsMal = (d, ar) => {
  const L = linjeAv(d), e = L.ENHETER.find((x) => x.id === d.enhet) || L.ENHETER[0];
  if (ar == null) ar = L.startAr;
  return e.kvalMal + (L.id === 'konsol' ? Math.floor(Math.max(0, ar - 1982) / 2) : Math.max(0, ar - 2007));
};
// antal delar över årets förväntan (gör bygget längre och buggigare – spjutspets kostar)
export function delarOver(d, ar) { const L = linjeAv(d); let n = 0; for (const g of L.GRUPPER) if (L.nivaAv(g.id, d.val[g.id]) > forvantan(g.id, ar, L.id)) n++; return n; }

// ---------- beskrivning ----------
export const designAr = (G) => arAv(G.dag);
