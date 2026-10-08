// Pixelstilens verktyg (som Snabbfilen/PIXELGRAFIK.md): ramper med varma högdagrar och blålila skuggor,
// färgad kontur (aldrig ren svart), brus i tre toner, ditherade toningar. Allt målas i en Pix (ImageData).
import { Pix, hash, bayer, mix, mul, hex, css } from '../core/floor-pix.js';
export { Pix, hash, bayer, mix, mul, hex, css };

export const VARM = 0xfff4e0, SKUGGA = 0x2a1f3a, DJUP = 0x1a1426;
export const cl = (v) => Math.max(0, Math.min(1, v));
export const ramp = (c) => ({ hi: mix(mul(c, 1.12), VARM, 0.12), base: c, lo: mix(mul(c, 0.74), SKUGGA, 0.12), dk: mix(mul(c, 0.5), DJUP, 0.2) });
export const kant = (c) => mix(mul(c, 0.45), SKUGGA, 0.35);
export function nz(c, x, y, s = 0, amt = 0.06, p = 0.12) { const h = hash(x, y, s); return h < p ? mul(c, 1 - amt) : h > 1 - p ? mix(c, VARM, amt) : c; }
export function qmix(a, b, t, x, y, steps = 4) { const q = Math.floor(cl(t) * steps + bayer(x, y)) / steps; return mix(a, b, cl(q)); }
export function tex(P, x, y, w, h, c, s = 0, amt = 0.05, p = 0.12) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) P.px(x + i, y + j, nz(c, x + i, y + j, s, amt, p)); }
export function disc(P, cx, cy, rx, ry, fn) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
    const t = Math.hypot((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry);
    if (t < 1) fn(x, y, t);
  }
}
export const glod = (P, cx, cy, rx, ry, c, a = 0.3, steg = 4) => P.ell(cx, cy, rx, ry, c, a, steg);
export const skugga = (P, cx, cy, rx, ry = 2) => P.ell(cx, cy, rx, ry, DJUP, 0.32, 2);

// låda i 3/4-vy: ovansida (d px hög, ljusare) + framsida (h px), kontur runt
export function lada(P, x, y, w, h, d, c, o = {}) {
  const R = ramp(c);
  for (let j = 0; j < d; j++) for (let i = 0; i < w; i++) P.px(x + i, y + j, j === 0 ? R.hi : nz(mix(R.base, R.hi, 0.45), x + i, y + j, o.s || 1, 0.04));
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    let col = o.platt ? R.base : nz(R.base, x + i, y + d + j, (o.s || 1) + 5, 0.05);
    if (i === 0) col = mix(col, VARM, 0.12); else if (i === w - 1) col = R.lo;
    if (j === h - 1) col = R.lo;
    P.px(x + i, y + d + j, col);
  }
  P.hl(x, y + d, w, R.lo);
  if (o.kontur !== false) P.box(x - 1, y - 1, w + 2, d + h + 2, kant(c));
  return R;
}
// hård slagskugga på golvet (höger-ned, ljuset kommer från vänster uppe)
export function golvSkugga(P, x, y, w, h = 3) { P.rect(x + 2, y, w, h, DJUP, 0.22); }
// cachad sprite: rita(P, ax, ay) med ankaret (ax, ay) i spriten
const CACHE = new Map();
export function sprite(nyckel, w, h, ax, ay, rita) {
  let s = CACHE.get(nyckel);
  if (!s) { const P = new Pix(w, h); rita(P, ax, ay); s = { c: P.flush(), w, h, ax, ay }; CACHE.set(nyckel, s); }
  return s;
}
export function ritaSprite(ctx, s, x, y) { ctx.drawImage(s.c, Math.round(x - s.ax), Math.round(y - s.ay)); }
