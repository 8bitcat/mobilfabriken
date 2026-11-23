// Pixelverktyg för spelglimtarna (js/konsol/glimtar.js och js/konsol/glimtar/*.js).
import { SMALL, BIG, eachTextPixel, textW } from '../core/floor-pix.js';
export { SMALL, BIG };

// ---------- ritverktyg ----------
export const R = (x, X, Y, W, H, f) => { if (W <= 0 || H <= 0) return; x.fillStyle = f; x.fillRect(Math.round(X), Math.round(Y), Math.round(W), Math.round(H)); };
export const P = (x, X, Y, f) => { x.fillStyle = f; x.fillRect(Math.round(X), Math.round(Y), 1, 1); };
export const T = (x, s, X, Y, f, F = SMALL, k = 1) => { x.fillStyle = f; eachTextPixel(F, s, Math.round(X), Math.round(Y), k, (a, b) => x.fillRect(a, b, 1, 1)); };
export const TW = (s, F = SMALL, k = 1) => textW(F, s, k);
export const TK = (x, s, X, Y, f, kant, F = BIG, k = 1) => { for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) T(x, s, X + dx, Y + dy, kant, F, k); T(x, s, X, Y, f, F, k); };
export const spr = (x, rader, X, Y, pal, spegel = false) => {
  for (let j = 0; j < rader.length; j++) { const r = rader[j]; for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) P(x, X + (spegel ? r.length - 1 - i : i), Y + j, c); } }
};
export const tri = (v) => { const m = ((v % 2) + 2) % 2; return m < 1 ? m : 2 - m; };
export const mod = (a, b) => ((a % b) + b) % b;
export const disc = (x, cx, cy, r, f, utom) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r + r * 0.6 && !(utom && utom(i, j))) P(x, cx + i, cy + j, f); };
export const hash = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
// lodrät toning i färgband med ditherade övergångar (pixelhimmel)
export function toning(x, X, Y, W, H, farger) {
  const n = farger.length - 1;
  for (let j = 0; j < H; j++) {
    const v = (j / Math.max(1, H - 1)) * n, i = Math.min(n - 1, Math.floor(v)), f = v - i;
    if (f < 0.3) R(x, X, Y + j, W, 1, farger[i]);
    else if (f > 0.7) R(x, X, Y + j, W, 1, farger[i + 1]);
    else { R(x, X, Y + j, W, 1, farger[i]); for (let k = (j & 1); k < W; k += 2) P(x, X + k, Y + j, farger[i + 1]); }
  }
}
// statisk bakgrund som ritas en gång och sparas
const cache = new Map();
export function fast(nyckel, w, h, rita) {
  let c = cache.get(nyckel);
  if (!c) { c = document.createElement('canvas'); c.width = w; c.height = h; rita(c.getContext('2d')); cache.set(nyckel, c); }
  return c;
}

