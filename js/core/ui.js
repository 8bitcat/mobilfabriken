// Pixelgränssnittet: allt ritas direkt i spelets 384×216-yta, varje bildruta ("immediate mode").
// Widgetarna registrerar klickytor (hit) som pekaren testar mot den senast ritade bildrutan.
// Text ritas med bitmapstypsnitten SMALL (3×5) och BIG (5×7) ur floor-pix.js och cachas per färg.
import { SMALL, BIG, eachTextPixel, textW } from './floor-pix.js';

export const W = 384, H = 216;
// färger (Neonnatts mörka paneler + Pixelcitys guld/grön/röd)
export const F = {
  bg: 0x0b0e1c, bg2: 0x10142a, panel: 0x151b2e, panel2: 0x1b2340, panel3: 0x232c4e, hi: 0x2f3a62, lo: 0x070912, skugga: 0x05060f,
  text: 0xf1ebe0, dim: 0x8c93b4, dim2: 0x5c6487, guld: 0xffd23f, guld2: 0xe8b230, bla: 0x3a7bd5, bla2: 0x6aa6ff, gron: 0x45b964, gron2: 0x7ee09a,
  orange: 0xe07a2e, orange2: 0xf0a05a, rod: 0xc9323a, rod2: 0xff6b6b, lila: 0x8e5bd1, lila2: 0xb48cff, rosa: 0xf060b0, cyan: 0x4ff0ff, papper: 0xf1ebe0, blak: 0x17151a,
};
export const css = (c) => '#' + (c & 0xffffff).toString(16).padStart(6, '0');
export const mixa = (a, b, t) => {
  const r = (a >> 16) & 255, g = (a >> 8) & 255, bl = a & 255;
  return ((r + (((b >> 16) & 255) - r) * t) << 16) | ((g + (((b >> 8) & 255) - g) * t) << 8) | (bl + ((b & 255) - bl) * t);
};
export const ljusa = (c, t) => mixa(c, 0xffffff, t);
export const morka = (c, t) => mixa(c, 0x000000, t);

// ---------- tillstånd ----------
export const U = { ctx: null, t: 0, hits: [], forraHits: [], mus: { x: -1, y: -1, ned: false }, drag: null, mark: {}, cursor: 'default', klickat: false };
export function borja(ctx, t) { U.ctx = ctx; U.t = t; U.forraHits = U.hits; U.hits = []; U.mark = {}; U.cursor = 'default'; }
export function hit(x, y, w, h, o = {}) { U.hits.push({ x, y, w, h, ...o }); if (o.namn) U.mark[o.namn] = { x, y, w, h }; if ((o.klick || o.drag) && inne(x, y, w, h)) U.cursor = 'pointer'; }
export const markera = (namn, x, y, w, h) => { U.mark[namn] = { x, y, w, h }; };
export const inne = (x, y, w, h) => U.mus.x >= x && U.mus.x < x + w && U.mus.y >= y && U.mus.y < y + h;
const traff = (lista, x, y) => { for (let i = lista.length - 1; i >= 0; i--) { const h = lista[i]; if (x >= h.x && x < h.x + h.w && y >= h.y && y < h.y + h.h && (h.klick || h.drag || h.block)) return h; } return null; };
// närmaste knapp inom tol spelpixlar. Ligger trycket på en spärryta (en ruta ovanpå spelet) räknas bara
// knapparna som ritats efter den, alltså de som ligger ovanpå.
const nara = (lista, x, y, tol, fran) => {
  let bast = null, bd = tol + 1;
  for (let i = lista.length - 1; i > fran; i--) {
    const h = lista[i]; if (!h.klick || h.av) continue;
    const d = Math.max(h.x - x, x - (h.x + h.w - 1), h.y - y, y - (h.y + h.h - 1), 0);
    if (d <= tol && d < bd) { bd = d; bast = h; }
  }
  return bast;
};
// tol > 0 för fingrar: ett tryck som missar alla knappar tar den närmaste inom tol spelpixlar
export function pekareNer(x, y, tol = 0) {
  U.mus = { x, y, ned: true }; U.klickat = true;
  let h = traff(U.hits, x, y);
  if (tol > 0 && (!h || (!h.klick && !h.drag))) { const n = nara(U.hits, x, y, tol, h ? U.hits.lastIndexOf(h) : -1); if (n) { h = n; x = Math.max(n.x, Math.min(n.x + n.w - 1, x)); y = Math.max(n.y, Math.min(n.y + n.h - 1, y)); U.mus.x = x; U.mus.y = y; } }
  if (!h) return false;
  if (h.drag) { U.drag = h; h.drag(x, y, 'start'); }
  else if (h.klick && !h.av) { h.klick(x, y); }
  return true;
}
export function pekareFlytta(x, y) { U.mus.x = x; U.mus.y = y; if (U.drag) U.drag.drag(x, y, 'drag'); }
export function pekareUpp(x, y) { if (U.drag) { U.drag.drag(x, y, 'slut'); U.drag = null; } U.mus.ned = false; }
export function hjul(x, y, dy) { for (let i = U.hits.length - 1; i >= 0; i--) { const h = U.hits[i]; if (h.hjul && x >= h.x && x < h.x + h.w && y >= h.y && y < h.y + h.h) { h.hjul(dy); return true; } } return false; }

// ---------- rita ----------
export function rect(x, y, w, h, c) { if (w <= 0 || h <= 0) return; U.ctx.fillStyle = css(c); U.ctx.fillRect(x | 0, y | 0, w | 0, h | 0); }
export function ram(x, y, w, h, c) { rect(x, y, w, 1, c); rect(x, y + h - 1, w, 1, c); rect(x, y + 1, 1, h - 2, c); rect(x + w - 1, y + 1, 1, h - 2, c); }
export function prick(x, y, c) { rect(x, y, 1, 1, c); }
// halvgenomskinlig mörkning (modaler) – ditherad för att hålla pixelkornet
export function morkna(x, y, w, h, nivå = 0.5) { U.ctx.fillStyle = `rgba(5,6,15,${nivå})`; U.ctx.fillRect(x, y, w, h); }

// ---------- text ----------
const CACHE = new Map();
export const tw = (s, Fn = SMALL, k = 1) => textW(Fn, String(s), k);
function textBild(s, Fn, c, k) {
  const key = (Fn === BIG ? 'B' : 'S') + k + '|' + c + '|' + s;
  let b = CACHE.get(key);
  if (!b) {
    if (CACHE.size > 1500) CACHE.clear();
    const w = Math.max(1, tw(s, Fn, k)), h = (Fn.h + 4) * k;
    b = document.createElement('canvas'); b.width = w; b.height = h;
    const x = b.getContext('2d'); x.fillStyle = css(c);
    eachTextPixel(Fn, s, 0, 2 * k, k, (px, py) => x.fillRect(px, py, 1, 1));
    CACHE.set(key, b);
  }
  return b;
}
// o: { F: BIG|SMALL, k: skala, just: 'v'|'c'|'h', skugga: färg }
export function text(s, x, y, c = F.text, o = {}) {
  s = String(s ?? ''); if (!s) return 0;
  const Fn = o.F || SMALL, k = o.k || 1, w = tw(s, Fn, k);
  if (o.just === 'c') x = Math.round(x - w / 2); else if (o.just === 'h') x = Math.round(x - w);
  if (o.skugga != null) U.ctx.drawImage(textBild(s, Fn, o.skugga, k), x + k, y - 2 * k + k);
  U.ctx.drawImage(textBild(s, Fn, c, k), x, y - 2 * k);
  return w;
}
export const textB = (s, x, y, c = F.text, o = {}) => text(s, x, y, c, { F: BIG, ...o });
// radbrytning på ord
export function radbryt(s, maxW, Fn = SMALL, k = 1) {
  const ut = [];
  for (const stycke of String(s).split('\n')) {
    let rad = '';
    for (const ord of stycke.split(' ')) {
      const prov = rad ? rad + ' ' + ord : ord;
      if (tw(prov, Fn, k) > maxW && rad) { ut.push(rad); rad = ord; } else rad = prov;
    }
    ut.push(rad);
  }
  return ut;
}
export function stycke(s, x, y, maxW, c = F.dim, o = {}) {
  const rader = radbryt(s, maxW, o.F || SMALL, o.k || 1), rh = o.rad || ((o.F || SMALL).h + 2) * (o.k || 1);
  rader.forEach((r, i) => text(r, x, y + i * rh, c, o));
  return rader.length * rh;
}
// förkorta så att texten ryms
export function kapa(s, maxW, Fn = SMALL) { s = String(s); if (tw(s, Fn) <= maxW) return s; while (s.length > 1 && tw(s + '…', Fn) > maxW) s = s.slice(0, -1); return s + '…'; }

// ---------- paneler och knappar ----------
export function panel(x, y, w, h, o = {}) {
  const fyll = o.fyll ?? F.panel;
  if (o.skugga !== false) rect(x + 2, y + 2, w, h, F.skugga);
  rect(x, y, w, h, fyll);
  rect(x, y, w, 1, o.hi ?? F.hi); rect(x, y, 1, h, o.hi ?? F.hi); rect(x, y + h - 1, w, 1, F.lo); rect(x + w - 1, y, 1, h, F.lo);
  if (o.kant != null) ram(x, y, w, h, o.kant);
  if (o.block !== false) hit(x, y, w, h, { block: true });
}
// pappersruta (Pixelcity) för belöningar och kvitton
export function papper(x, y, w, h) { rect(x + 2, y + 2, w, h, F.skugga); rect(x, y, w, h, F.papper); rect(x, y, w, 1, 0xfffaf0); ram(x, y, w, h, 0xb9ad94); hit(x, y, w, h, { block: true }); }
const STILAR = {
  bla: [F.bla, F.text], gron: [F.gron, F.text], orange: [F.orange, F.text], rod: [F.rod, F.text], lila: [F.lila, F.text], rosa: [0xd04898, F.text],
  guld: [F.guld2, F.blak], morkt: [F.panel3, F.text], dim: [F.panel2, F.dim], vit: [0xe8e3d6, F.blak], glas: [F.panel2, F.text],
};
// o: { stil, klick, aktiv, av, namn, ikon, F, tips }
export function knapp(x, y, w, h, etikett, o = {}) {
  const [bas, tc] = STILAR[o.aktiv ? 'guld' : o.stil || 'morkt'];
  const hov = !o.av && inne(x, y, w, h), ned = hov && U.mus.ned;
  const c = o.av ? mixa(bas, F.panel, 0.65) : hov ? ljusa(bas, 0.12) : bas;
  const dy = ned ? 1 : 0;
  if (!ned) rect(x + 1, y + 1, w, h, F.skugga);
  rect(x + dy, y + dy, w, h, c);
  rect(x + dy, y + dy, w, 1, ljusa(c, 0.3)); rect(x + dy, y + dy + h - 1, w, 1, morka(c, 0.35));
  const Fn = o.F || SMALL, th = Fn.h;
  let tx = x + dy + w / 2;
  if (o.ikon) { const iw = 8 + 2; tx += iw / 2; ikon(o.ikon, Math.round(tx - tw(etikett, Fn) / 2 - iw), y + dy + Math.floor((h - 7) / 2), o.av ? F.dim2 : tc); }
  text(etikett, tx, y + dy + Math.floor((h - th) / 2), o.av ? F.dim2 : tc, { F: Fn, just: 'c' });
  hit(x, y, w, h, { klick: o.klick, av: o.av || !o.klick, namn: o.namn, block: true });
  return w;
}
// valbart kort (designerns val, kampanjer …)
export function kort(x, y, w, h, o = {}) {
  const hov = !o.av && o.klick && inne(x, y, w, h);
  panel(x, y, w, h, { fyll: o.vald ? F.panel3 : hov ? ljusa(F.panel2, 0.06) : F.panel2, block: false });
  if (o.vald) ram(x, y, w, h, o.kant ?? F.bla2); else if (o.kant != null) ram(x, y, w, h, o.kant);
  if (o.klick && !o.av) hit(x, y, w, h, { klick: o.klick, namn: o.namn });
  else hit(x, y, w, h, { block: true, namn: o.namn });
}
export function chip(x, y, etikett, o = {}) {
  const w = (o.w ?? tw(etikett) + 8);
  knapp(x, y, w, o.h || 10, etikett, { stil: o.stil || 'dim', aktiv: o.aktiv, klick: o.klick, av: o.av });
  return w;
}
// reglage: värde min..max; cb(v) under dragning
export function reglage(x, y, w, varde, min, max, cb, o = {}) {
  const t = Math.max(0, Math.min(1, (varde - min) / (max - min))), kx = Math.round(x + 2 + t * (w - 5));
  rect(x, y + 1, w, 3, F.lo); rect(x, y + 1, kx - x, 3, o.farg ?? F.bla);
  rect(kx - 2, y - 1, 5, 7, F.guld); rect(kx - 2, y - 1, 5, 1, 0xfff0b0); rect(kx - 2, y + 5, 5, 1, F.guld2);
  hit(x - 3, y - 4, w + 6, 13, { drag: (mx) => cb(min + (max - min) * Math.max(0, Math.min(1, (mx - x - 2) / (w - 5)))), namn: o.namn });
}
export function matare(x, y, w, h, andel, c, o = {}) {
  rect(x, y, w, h, o.bak ?? F.lo);
  const fw = Math.round(Math.max(0, Math.min(1, andel)) * w);
  rect(x, y, fw, h, c); if (fw > 0 && h > 2) rect(x, y, fw, 1, ljusa(c, 0.35));
  if (o.segment) for (let i = 1; i < o.segment; i++) rect(x + Math.round((w * i) / o.segment), y, 1, h, o.bak ?? F.lo);
}
export function stjarnor(x, y, n, max = 5, c = F.guld) {
  for (let i = 0; i < max; i++) ikon('stjarna', x + i * 7, y, i < n ? c : F.dim2);
  return max * 7;
}
// skrollbar lista: rita(i, y) per rad, radH, antal, ytan; returnerar skroll-läget via o.skroll (objekt {v})
export function lista(x, y, w, h, antal, radH, ritaRad, sk) {
  const maxS = Math.max(0, antal * radH - h);
  sk.v = Math.max(0, Math.min(maxS, sk.v || 0));
  U.ctx.save(); U.ctx.beginPath(); U.ctx.rect(x, y, w, h); U.ctx.clip();
  const forsta = Math.floor(sk.v / radH);
  const hitsFore = U.hits.length, markFore = { ...U.mark };
  for (let i = forsta; i < antal && i * radH - sk.v < h; i++) ritaRad(i, y + i * radH - Math.round(sk.v));
  U.ctx.restore();
  // klickytorna klipps till listan som ritningen: en halvt synlig rad går bara att trycka på där den syns,
  // och ytor helt utanför listan tas bort. Radernas märken (robotar, handledningen) klipps likadant.
  const klipp = (r) => { const y0 = Math.max(r.y, y), y1 = Math.min(r.y + r.h, y + h); if (y1 <= y0) return false; r.y = y0; r.h = y1 - y0; return true; };
  U.hits = U.hits.filter((hh, i) => i < hitsFore || klipp(hh));
  for (const k in U.mark) if (U.mark[k] !== markFore[k] && !klipp(U.mark[k])) { if (k in markFore) U.mark[k] = markFore[k]; else delete U.mark[k]; }
  if (maxS > 0) { const th = Math.max(8, Math.round(h * h / (antal * radH))), ty = y + Math.round((h - th) * sk.v / maxS); rect(x + w - 2, y, 2, h, F.lo); rect(x + w - 2, ty, 2, th, F.hi); }
  // rullytan läggs UNDER raderna så att knapparna i raderna går att trycka på
  U.hits.splice(hitsFore, 0, { x, y, w, h, hjul: (dy) => { sk.v += dy; }, drag: maxS > 0 ? (mx, my, fas) => { if (fas === 'start') { sk.dragY = my; sk.dragV = sk.v; } else sk.v = sk.dragV - (my - sk.dragY); } : null, block: true });
  return maxS;
}

// ---------- ikoner 7×7 ----------
const IK = {
  pengar: ['.#####.', '#.....#', '#..#..#', '#.###.#', '#..#..#', '#.....#', '.#####.'],
  fp: ['..###..', '.#...#.', '.#...#.', '..#.#..', '..###..', '..###..', '...#...'],
  team: ['.#...#.', '###.###', '.#...#.', '###.###', '###.###', '.......', '.......'],
  stjarna: ['...#...', '..###..', '#######', '.#####.', '..###..', '.##.##.', '.#...#.'],
  kalender: ['.#...#.', '#######', '#.....#', '#.#.#.#', '#.....#', '#.#.#.#', '#######'],
  gava: ['.#...#.', '..#.#..', '#######', '#..#..#', '#######', '#..#..#', '#######'],
  ljud: ['...#...', '..##.#.', '####..#', '####..#', '####..#', '..##.#.', '...#...'],
  tyst: ['...#...', '..##...', '####.#.', '####..#', '####.#.', '..##...', '...#...'],
  meny: ['.......', '#######', '.......', '#######', '.......', '#######', '.......'],
  paus: ['.##.##.', '.##.##.', '.##.##.', '.##.##.', '.##.##.', '.##.##.', '.......'],
  spela: ['.#.....', '.##....', '.###...', '.####..', '.###...', '.##....', '.#.....'],
  las: ['..###..', '.#...#.', '.#...#.', '#######', '###.###', '###.###', '#######'],
  bock: ['......#', '.....##', '#...##.', '##.##..', '.###...', '..#....', '.......'],
  kryss: ['#.....#', '.#...#.', '..#.#..', '...#...', '..#.#..', '.#...#.', '#.....#'],
  bugg: ['.#...#.', '..###..', '#.###.#', '.#####.', '#.###.#', '.#####.', '#..#..#'],
  plus: ['...#...', '...#...', '...#...', '#######', '...#...', '...#...', '...#...'],
  minus: ['.......', '.......', '.......', '#######', '.......', '.......', '.......'],
  hoger: ['..#....', '..##...', '#####..', '######.', '#####..', '..##...', '..#....'],
  vanster: ['....#..', '...##..', '..#####', '.######', '..#####', '...##..', '....#..'],
  telefon: ['.#####.', '.#...#.', '.#...#.', '.#...#.', '.#...#.', '.#####.', '.##.##.'],
  hus: ['...#...', '..###..', '.#####.', '#######', '.#...#.', '.#.#.#.', '.#.#.#.'],
  hammare: ['####...', '#####..', '####...', '..#....', '...#...', '....#..', '.....#.'],
  penna: ['.....##', '....###', '...###.', '..###..', '.###...', '##.....', '#......'],
  kolv: ['..###..', '..#.#..', '..#.#..', '.#...#.', '#.###.#', '#######', '.#####.'],
  tidning: ['######.', '#....##', '#.##.##', '#....##', '#.##.##', '#....##', '#######'],
  graf: ['......#', '.....##', '....#.#', '#..#..#', '##.#..#', '#.#...#', '#######'],
  globe: ['..###..', '.#.#.#.', '#######', '#..#..#', '#######', '.#.#.#.', '..###..'],
  klocka: ['..###..', '.#.#.#.', '#..#..#', '#..##.#', '#.....#', '.#...#.', '..###..'],
  prick: ['.......', '..###..', '.#####.', '.#####.', '.#####.', '..###..', '.......'],
  mega: ['.....#.', '...###.', '#####.#', '#####.#', '#####.#', '...###.', '.....#.'],
  pil_ned: ['..###..', '..###..', '..###..', '#######', '.#####.', '..###..', '...#...'],
};
export function ikon(namn, x, y, c = F.text, k = 1) {
  const r = IK[namn]; if (!r) return;
  const ctx = U.ctx; ctx.fillStyle = css(c);
  for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) if (r[j][i] === '#') ctx.fillRect(x + i * k, y + j * k, k, k);
}
export const IKONNAMN = Object.keys(IK);
export { SMALL, BIG };
