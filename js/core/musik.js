// MUSIKEN – Carl 2026-11-25: "kan du lägga in musik i spelet, och ljud så det blir kul att spela".
// Komponeras i realtid med WebAudio (inga ljudfiler, inga rättigheter). Två saker styr:
//   • EPOKEN (spelåret): 80-tal = 8-bit (pulsvåg, triangelbas, brustrummor), 90-tal = 16-bit (filtrerad såg, trummor),
//     00-tal = pop (pluck-arpeggio, pad), 10-tal och framåt = synthwave (pad, sågbas, arpeggio). Startsidan följer appen.
//   • STÄMNINGEN (skärmen): tema (startsidan, menyn) · arbete (kontoret, designern, forskningen …, lugnare och glesare)
//     · fest (lanseringen, showen, reklamfilmen – fulla trummor).
// Varje låt är 8 takter: ett motiv på fyra steg följer ackorden (AABA-form), basen och trummorna efter epoken, och en
// seedad slump gör att samma epok och stämning alltid låter likadant. Byte sker mjukt (uttoning).
// Av/på: MENY → MUSIK (localStorage mobilfabriken.musik, gäller alla bolag). LJUD av stänger också musiken.
import { hamtaAc, ljudPa } from './ljud.js';
import { APPLAGE } from './applage.js';

const KEY = 'mobilfabriken.musik';
let pa = (() => { try { return localStorage.getItem(KEY) !== '0'; } catch { return true; } })();
export const musikPa = () => pa;
export function sattMusik(v) { pa = !!v; try { localStorage.setItem(KEY, pa ? '1' : '0'); } catch { /* ok */ } if (!pa) tona(0); }

const SKALA = [0, 2, 4, 5, 7, 9, 11];
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const ton = (rot, steg) => rot + SKALA[((steg % 7) + 7) % 7] + 12 * Math.floor(steg / 7);   // skalsteg → MIDI
const ackord = (rot, grad) => [ton(rot, grad), ton(rot, grad + 2), ton(rot, grad + 4)];
function rng(seed) { let s = seed | 0; return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), s | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------- epoker och stämningar ----------
const EPOKER = {
  e80: { tempo: 138, rot: 60, lead: 'puls', bas: 'tri', trummor: 'brus', pad: false, arp: false },
  e90: { tempo: 122, rot: 62, lead: 'saag', bas: 'fyrkant', trummor: 'full', pad: false, arp: true },
  e00: { tempo: 112, rot: 57, lead: 'pluck', bas: 'tri', trummor: 'full', pad: true, arp: true },
  e10: { tempo: 100, rot: 55, lead: 'puls', bas: 'saag', trummor: 'synth', pad: true, arp: true },
};
const PROG = {
  tema: [0, 4, 5, 3, 0, 4, 3, 4],       // I V vi IV I V IV V
  arbete: [0, 5, 3, 4, 0, 5, 1, 4],     // I vi IV V I vi ii V
  fest: [0, 4, 5, 3, 0, 4, 5, 4],
};
export function epokFor(ar) { return ar < 1990 ? 'e80' : ar < 2000 ? 'e90' : ar < 2010 ? 'e00' : 'e10'; }
export function stamningFor(scen) {
  if (scen === 'start' || scen === 'meny' || scen === 'butik') return 'tema';
  if (scen === 'show' || scen === 'lansering' || scen === 'reklam') return 'fest';
  return 'arbete';
}

// en låt: 8 takter × 16 sextondelar → listor med noter per steg
function komponera(epok, stamning) {
  const E = EPOKER[epok], R = rng((epok.charCodeAt(1) * 977) + stamning.length * 131 + (stamning === 'fest' ? 7 : 0));
  const prog = PROG[stamning], rot = E.rot, steg = 128;
  const lead = new Array(steg).fill(null), bas = new Array(steg).fill(null), pad = new Array(steg).fill(null), arp = new Array(steg).fill(null);
  const trum = new Array(steg).fill(0);   // bitar: 1 kick, 2 virvel, 4 hihat
  // motivet: rytm (vilka åttondelar som spelar) och kontur (index i ackordet, 0–4 = skalsteg ovanför grundtonen)
  const rytmer = stamning === 'arbete' ? [[1, 0, 1, 0, 1, 1, 0, 0], [1, 0, 0, 1, 0, 1, 0, 0], [1, 1, 0, 1, 0, 0, 1, 0]] : [[1, 0, 1, 1, 0, 1, 1, 0], [1, 1, 0, 1, 1, 0, 1, 1], [1, 0, 1, 0, 1, 1, 1, 0]];
  const motivA = { rytm: rytmer[Math.floor(R() * rytmer.length)], kontur: Array.from({ length: 8 }, () => Math.floor(R() * 5)) };
  const motivB = { rytm: rytmer[Math.floor(R() * rytmer.length)], kontur: Array.from({ length: 8 }, () => Math.floor(R() * 5) + 1) };
  const form = [motivA, motivA, motivB, motivA];   // AABA, två takter per del
  for (let t = 0; t < 8; t++) {
    const grad = prog[t], ack = ackord(rot, grad), s0 = t * 16;
    const motiv = form[Math.floor(t / 2)], andra = t % 2 === 1;
    // melodin: på slag = ackordton, mellan = skalsteg; sista takten i varje del landar på grundtonen
    const glesa = stamning === 'arbete' && (t === 2 || t === 6);   // arbetsmusiken andas: två takter utan melodi
    for (let i = 0; i < 8; i++) {
      if (!motiv.rytm[i] || glesa) continue;
      let k = motiv.kontur[i] + (andra && i >= 4 ? 1 : 0);
      const pa1 = i % 2 === 0;
      let not = pa1 ? ack[k % 3] + 12 * Math.floor(k / 3) : ton(rot, grad + k);
      if ((t === 3 || t === 7) && i >= 6) not = ack[0] + 12;
      while (not > 86) not -= 12;   // inte gällt: melodin håller sig under ungefär D6
      while (not < 62) not += 12;
      lead[s0 + i * 2] = { not, len: motiv.rytm[i + 1] ? 2 : 4 };
    }
    // basen
    for (let i = 0; i < 16; i++) {
      const b = ack[0] - 24;
      if (E.bas === 'tri' && epok === 'e80') { if (i % 2 === 0) bas[s0 + i] = { not: i % 4 === 0 ? b : b + 12, len: 2 }; }
      else if (epok === 'e90') { if (i % 4 === 0) bas[s0 + i] = { not: i % 8 === 0 ? b : ack[2] - 24, len: 3 }; }
      else if (epok === 'e00') { if (i === 0 || i === 6 || i === 8 || i === 14) bas[s0 + i] = { not: b, len: 2 }; }
      else if (i % 2 === 0) bas[s0 + i] = { not: b, len: 2 };
    }
    // pad och arpeggio
    if (E.pad) pad[s0] = { ack: ack.map((n) => n), len: 16 };
    if (E.arp && stamning !== 'tema') for (let i = 0; i < 16; i += 2) arp[s0 + i] = { not: ack[(i / 2) % 3] + (i >= 8 ? 12 : 0), len: 1 };
    // trummorna
    for (let i = 0; i < 16; i++) {
      let b = 0;
      if (stamning !== 'arbete' || epok !== 'e80') { if (i === 0 || i === 8 || (stamning === 'fest' && (i === 6 || i === 10))) b |= 1; }
      if (i === 4 || i === 12) b |= stamning === 'arbete' && epok === 'e80' ? 0 : 2;
      if (i % 2 === 0 || (stamning === 'fest' && i % 2 === 1 && epok !== 'e80')) b |= 4;
      if (stamning === 'arbete' && i % 4 !== 0) b &= ~4;
      trum[s0 + i] = b;
    }
    if (t === 7 && stamning !== 'arbete') for (let i = 12; i < 16; i++) trum[s0 + i] |= 2;   // trumfill före varvet
  }
  return { E, epok, stamning, steg, lead, bas, pad, arp, trum, sek: 60 / E.tempo / 4 };
}

// ---------- instrumenten ----------
let ut = null, pulsVag = null, brus = null;
function utgang(ac) {
  if (ut) return ut;
  ut = ac.createGain(); ut.gain.value = 0;
  // lite eko gör 8-biten mjukare
  const eko = ac.createDelay(1), aterkopp = ac.createGain(), ekoVol = ac.createGain();
  eko.delayTime.value = 0.28; aterkopp.gain.value = 0.25; ekoVol.gain.value = 0.18;
  ut.connect(ac.destination); ut.connect(eko); eko.connect(aterkopp).connect(eko); eko.connect(ekoVol).connect(ac.destination);
  return ut;
}
function puls(ac) {
  if (!pulsVag) { const n = 32, re = new Float32Array(n), im = new Float32Array(n); for (let k = 1; k < n; k++) im[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25); pulsVag = ac.createPeriodicWave(re, im); }
  return pulsVag;
}
function osc(ac, typ, f, t, len, vol, o = {}) {
  const s = ac.createOscillator(), g = ac.createGain();
  if (typ === 'puls') s.setPeriodicWave(puls(ac)); else s.type = typ === 'saag' ? 'sawtooth' : typ === 'fyrkant' ? 'square' : typ === 'tri' ? 'triangle' : typ;
  s.frequency.setValueAtTime(f, t);
  if (o.detune) s.detune.value = o.detune;
  let kedja = s;
  if (o.lp) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(o.lp, t); if (o.lpSlut) fl.frequency.exponentialRampToValueAtTime(o.lpSlut, t + len); kedja.connect(fl); kedja = fl; }
  const a = o.attack ?? 0.005, r = o.release ?? 0.05;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + a);
  if (o.pluck) g.gain.exponentialRampToValueAtTime(0.0001, t + len + r);
  else { g.gain.setValueAtTime(vol, t + Math.max(a, len - r)); g.gain.linearRampToValueAtTime(0, t + len + r); }
  kedja.connect(g).connect(ut); s.start(t); s.stop(t + len + r + 0.05);
}
function trumma(ac, typ, t) {
  if (!brus) { brus = ac.createBuffer(1, ac.sampleRate / 2, ac.sampleRate); const d = brus.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  if (typ === 'kick') {
    const s = ac.createOscillator(), g = ac.createGain();
    s.frequency.setValueAtTime(140, t); s.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(0.32, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    s.connect(g).connect(ut); s.start(t); s.stop(t + 0.2); return;
  }
  const b = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  b.buffer = brus; f.type = typ === 'hat' ? 'highpass' : 'bandpass'; f.frequency.value = typ === 'hat' ? 7000 : 1800; f.Q.value = typ === 'hat' ? 0.7 : 0.8;
  const len = typ === 'hat' ? 0.035 : 0.14, vol = typ === 'hat' ? 0.06 : 0.16;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
  b.connect(f).connect(g).connect(ut); b.start(t); b.stop(t + len + 0.02);
}
function spelaSteg(ac, L, i, t) {
  const E = L.E, s = L.sek, arbete = L.stamning === 'arbete';
  const lv = arbete ? 0.045 : 0.06;
  const l = L.lead[i];
  if (l) {
    if (E.lead === 'puls') osc(ac, 'puls', hz(l.not), t, l.len * s, lv);
    else if (E.lead === 'saag') osc(ac, 'saag', hz(l.not), t, l.len * s, lv * 0.8, { lp: 2600, detune: 6 });
    else osc(ac, 'tri', hz(l.not), t, l.len * s * 1.6, lv * 1.3, { pluck: true });
  }
  const b = L.bas[i];
  if (b) osc(ac, E.bas, hz(b.not), t, b.len * s, E.bas === 'saag' ? 0.05 : 0.09, E.bas === 'saag' || E.bas === 'fyrkant' ? { lp: 700 } : {});
  const p = L.pad[i];
  if (p) for (const n of p.ack) { osc(ac, 'saag', hz(n), t, p.len * s, 0.012, { lp: 1100, detune: -8, attack: 0.3, release: 0.4 }); osc(ac, 'saag', hz(n), t, p.len * s, 0.012, { lp: 1100, detune: 8, attack: 0.3, release: 0.4 }); }
  const a = L.arp[i];
  if (a && !arbete) osc(ac, 'fyrkant', hz(a.not), t, a.len * s, 0.018, { lp: 3000, pluck: true });
  const d = L.trum[i];
  if (d & 1) trumma(ac, 'kick', t);
  if (d & 2) trumma(ac, E.trummor === 'brus' ? 'virvel' : 'virvel', t);
  if (d & 4) trumma(ac, 'hat', t);
}

// ---------- spelaren ----------
let lat = null, steg = 0, nasta = 0, timer = null, onskad = null, volym = 0;
function tona(mal, sek = 0.4) {
  const ac = hamtaAc(); if (!ac || !ut) return;
  volym = mal; ut.gain.cancelScheduledValues(ac.currentTime); ut.gain.setValueAtTime(ut.gain.value, ac.currentTime); ut.gain.linearRampToValueAtTime(mal, ac.currentTime + sek);
}
function tick() {
  const ac = hamtaAc(); if (!ac || !lat) return;
  if (!pa || !ljudPa()) { nasta = ac.currentTime + 0.05; return; }   // av: inga noter alls (sparar batteri)
  while (nasta < ac.currentTime + 0.12) {
    if (nasta < ac.currentTime - 0.2) nasta = ac.currentTime + 0.02;   // fliken låg i bakgrunden: hoppa fram
    spelaSteg(ac, lat, steg % lat.steg, nasta);
    nasta += lat.sek; steg++;
    // byt låt vid en taktgräns när något annat önskas
    if (onskad && steg % 16 === 0) { lat = onskad; onskad = null; steg = 0; tona(lat.stamning === 'arbete' ? 0.5 : 0.65, 0.6); }
  }
}
// anropas varje bildruta från main.js: väljer epok och stämning efter spelläget
let senast = '';
export function uppdateraMusik(A) {
  const ac = hamtaAc();
  if (!ac || ac.state !== 'running') return;
  const ska = pa && ljudPa() && !A.test;
  utgang(ac);
  if (!ska) { if (volym > 0) tona(0, 0.3); return; }
  const ar = A.G ? new Date(Date.UTC(2007, 0, 1) + Math.floor(A.G.dag) * 864e5).getUTCFullYear() : APPLAGE === 'telefon' ? 2007 : 1982;
  const epok = epokFor(ar), stamning = stamningFor(A.scenNamn), nyckel = epok + '/' + stamning;
  if (nyckel !== senast) {
    senast = nyckel;
    const L = komponera(epok, stamning);
    if (!lat) { lat = L; steg = 0; nasta = ac.currentTime + 0.05; }
    else onskad = L;
  }
  if (!timer) timer = setInterval(tick, 25);
  if (volym === 0 && !onskad) tona(lat.stamning === 'arbete' ? 0.5 : 0.65, 1.2);
}
// för tester: låtens noter utan att spela dem
export const _komponera = komponera;
