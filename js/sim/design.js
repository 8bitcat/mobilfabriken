// En telefondesign: vad den består av, vad den kostar att tillverka och hur kritikerna bedömer den.
// Betyget = 10 × (0,60 × TEKNIK + 0,20 × DESIGN + 0,20 × PUTS) − 0,1 × buggar + 0,1 × funktioner (max +1).
//   TEKNIK = de 13 delarna mot årets förväntan (i nivå 1,0 · ett steg under 0,5 · två+ under 0,2 · över 1,2)
//   DESIGN = 0,4 × karossens fräschhet + 0,3 × materialet + 0,3 × ytan
//   PUTS   = kvalitetsprickar under bygget / kvalitetsmålet
// Kalibrerat mot förlagan: en 2007-telefon med standarddelar, 5 prickar och 2 buggar får ~6,2.
import { GRUPPER, DELAR, KAROSSER, YTOR, RAMAR, LINSER, FUNKTIONER, ENHETER, STANDARD_VAL, delAv, nivaAv, enhetAv } from '../data/delar.js';
import { NOD } from '../data/noder.js';
import { arAv, klamp } from './bas.js';

// ---------- vad finns att välja ----------
const nyckel = { del: (g, id) => `del-${g}-${id}`, kaross: (id) => `kaross-${id}`, ram: (id) => `ram-${id}`, lins: (id) => `lins-${id}`, funk: (id) => `funk-${id}`, enhet: (id) => `enhet-${id}` };
export const forskad = (G, nodId) => !NOD[nodId] || G.forskning.klara.includes(nodId);
export const harDel = (G, g, id) => { const d = delAv(g, id); return !!d && (!d.fp || forskad(G, nyckel.del(g, id))); };
export const harKaross = (G, id) => { const k = KAROSSER.find((x) => x.id === id); return !!k && (!k.fp || forskad(G, nyckel.kaross(id))); };
export const harRam = (G, id) => { const r = RAMAR.find((x) => x.id === id); return !!r && (!r.fp || forskad(G, nyckel.ram(id))); };
export const harFunktion = (G, id) => forskad(G, nyckel.funk(id));
export const harEnhet = (G, id) => { const e = ENHETER.find((x) => x.id === id); return !!e && (!e.fp || forskad(G, nyckel.enhet(id))); };
export const antalLinserTillatna = (G) => 1 + Math.min(3, LINSER.filter((l) => forskad(G, nyckel.lins(l.id))).length);
export const minRam = (G) => Math.min(...RAMAR.filter((r) => harRam(G, r.id)).map((r) => r.min));
export const nodForDel = (g, id) => NOD[nyckel.del(g, id)] || null;

// ---------- ny design ----------
let lopnr = 0;
export function nyDesign(G, bas = null) {
  const d = bas ? JSON.parse(JSON.stringify(bas)) : {
    enhet: 'telefon', kaross: 'krom', val: { ...STANDARD_VAL },
    form: { bredd: 0.69, hojd: 1.09, djup: 0.11, radie: 0.1, ram: 0.06, haka: 0.14, kameraStorlek: 0.2 },
    selfie: true, hemknapp: true, linser: 1, funktioner: [],
    farg: '#ebebee', glas: '#1d2a44', kamera: '#3a6bc2', yta: 'klassisk', marke: (G.bolag.initial || 'M'),
    pris: 2120, namn: '',
  };
  d.id = 'd' + G.dag + '-' + (++lopnr) + '-' + Math.floor(Math.random() * 1e6).toString(36);
  return d;
}

// modellparametrar för 3D/pixel-telefonen
export function telAv(d) {
  const kaross = KAROSSER.find((k) => k.id === d.kaross) || KAROSSER[0];
  return {
    bredd: d.form.bredd, hojd: d.form.hojd, djup: d.form.djup, radie: d.form.radie ?? kaross.radie, ram: d.form.ram,
    haka: d.hemknapp ? Math.max(d.form.haka, 0.12) : Math.max(d.form.ram, Math.min(d.form.haka, 0.08)),
    kameraStorlek: d.form.kameraStorlek, kameror: d.val.bakkamera === 'ingen' ? 0 : d.linser, selfie: d.selfie,
    kropp: d.farg, glas: d.glas, kamera: d.kamera, marke: d.marke || 'M', yta: d.yta, enhet: d.enhet,
  };
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
  let sum = 0; const ar = G ? arAv(G.dag) : 2007;
  for (const g of GRUPPER) {
    if (g.id === 'selfie' && !d.selfie) continue;
    const del = delAv(g.id, d.val[g.id]); if (!del) continue;
    sum += prisNu(del, ar) * (g.id === 'bakkamera' ? 1 + 0.5 * Math.max(0, d.linser - 1) : 1);
  }
  sum += prisNu(KAROSSER.find((k) => k.id === d.kaross) || KAROSSER[0], ar);
  sum += (YTOR.find((y) => y.id === d.yta) || { kostnad: 0 }).kostnad;
  if (d.hemknapp) sum += 15;
  for (const f of d.funktioner) { const fu = FUNKTIONER.find((x) => x.id === f); if (fu) sum += prisNu(fu, ar); }
  // ramar tunnare än standard kostar som den tunnaste ramtekniken man använder
  const ramTeknik = [...RAMAR].reverse().find((r) => d.form.ram <= r.min + 1e-6 && r.kostnad);
  if (ramTeknik) sum += ramTeknik.kostnad;
  // större skärm än 3,7" kostar 6 kr per tiondels tum
  sum += Math.max(0, Math.round((tum(d) - 3.7) * 10)) * 6;
  // andra enheter än telefonen: samma delar men mer eller mindre av dem (ENHETER.kostnad i data/delar.js)
  sum *= enhetAv(d.enhet).kostnad;
  return Math.round(sum * (effekter.styck || 1));
}
// minsta tjocklek som batteriet kräver: 1,1 cm för 1 000 mAh, +0,1 cm per 500 mAh
export const minDjup = (d) => { const b = delAv('batteri', d.val.batteri); return 0.11 + Math.max(0, ((b?.mah || 1000) - 1000) / 500) * 0.01 - (d.kaross === 'lufttunn' ? 0.02 : 0); };

// ---------- förväntan och betyg ----------
export function forvantan(grupp, ar) {
  const lista = DELAR[grupp]; let e = 0;
  lista.forEach((d, i) => { if (d.ar <= ar) e = Math.max(e, i); });
  return e;
}
const tekPoang = (diff) => (diff >= 1 ? 1.2 : diff === 0 ? 1.0 : diff === -1 ? 0.5 : 0.2);
export function teknik(d, ar, effekter = {}) {
  let sum = 0, vikt = 0; const per = [];
  for (const g of GRUPPER) {
    let niva = nivaAv(g.id, d.val[g.id]);
    if (g.id === 'selfie' && !d.selfie) niva = -1;
    const e = forvantan(g.id, ar), p = tekPoang(niva - e), w = (effekter.vikt && effekter.vikt[g.id]) || 1;
    sum += p * w; vikt += w; per.push({ grupp: g.id, namn: g.namn, niva, forv: e, poang: p });
  }
  return { poang: sum / vikt, per };
}
export function fraschhet(d, ar) { const k = KAROSSER.find((x) => x.id === d.kaross) || KAROSSER[0]; return klamp(1 - 0.16 * (ar - k.ar), 0, 1); }
export function designPoang(d, ar) {
  const mat = delAv('material', d.val.material) || { kval: 0.3 };
  const yta = YTOR.find((y) => y.id === d.yta) || (d.yta && d.yta.startsWith('leg-') ? { kval: 1 } : { kval: 0.2 });
  return 0.4 * fraschhet(d, ar) + 0.3 * (mat.kval ?? 0.3) + 0.3 * yta.kval;
}
export function funktioner(G, d) {
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
// telefonerna blir mer komplexa: kvalitetsmålet växer med ett per år efter 2007
export const kvalitetsMal = (d, ar = 2007) => (ENHETER.find((e) => e.id === d.enhet) || ENHETER[0]).kvalMal + Math.max(0, ar - 2007);
// antal delar över årets förväntan (gör bygget längre och buggigare – spjutspets kostar)
export function delarOver(d, ar) { let n = 0; for (const g of GRUPPER) if (nivaAv(g.id, d.val[g.id]) > forvantan(g.id, ar)) n++; return n; }

// ---------- beskrivning ----------
export const designAr = (G) => arAv(G.dag);
