// REKLAMFILMEN – ett spelsläpp (eller en ny konsol) som tv-reklam, ungefär åtta sekunder (docs/KONSOLPLAN.md):
//   1. vardagsrummet: barnen i soffan spelar, glimten går på tv:n och konsolen står på mattan (rummet följer eran:
//      träteve och brun soffa på 80-talet, platt-tv med LED-list från 2006)
//   2. spelet i helbild, förstorat i hela steg
//   3. slutbilden: glimten på en tv, titeln glider in, studion, stjärnorna, "NU TILL <KONSOL>!" och konsolen i hörnet
// En konsollansering: vardagsrummet (tv:n visar spelet i lådan eller konsolens startbild) och slutbilden med konsolen,
// sloganen och priset. Tiden står still. Ett tryck, ESC, ENTER eller mellanslag hoppar över.
//   A.go('reklam', { spel: id i G.k.spel, tillbaka, tillbakaOpts })   – ett spel (titel/glimt/konsol går också att ge)
//   A.go('reklam', { konsol: produktens id, tillbaka, tillbakaOpts }) – en konsollansering
// Härifrån hämtar också STUDIOS och notiserna tv-rutan: tvTyp (eran), tvRam (höljet), glimtRuta (glimten eller
// titelkortet, inpassat) och tvGlas (bildrörets linjer).
import { U, F, W, H, rect, ram, text, knapp, ikon, tw, kapa, radbryt, mixa, ljusa, morka, SMALL, BIG } from '../core/ui.js';
import { Pix, hash, bayer, mix, mul } from '../core/floor-pix.js';
import { ramp, kant, tex, lada, glod } from '../art/kit.js';
import { drawPerson, makeLook } from '../core/people.js';
import { GLIMT, glimtBild } from '../konsol/glimtar.js';
import { visaKonsol, ritaKonsol2D } from '../konsol/konsol-vy.js';
import { konsolTel } from '../sim/design.js';
import { studioAv, spelPris } from '../sim/konsol.js';
import { arAv, kr, dec } from '../sim/bas.js';
import { $t } from '../core/i18n.js';

// ---------- tv-rutan (delas med STUDIOS och notiserna) ----------
// Eran avgör tv:n: träteve (–1989), svart plastteve (90-talet), silverteve (2000–2005), platt-tv (2006–).
export const tvTyp = (ar) => (ar < 1990 ? 'tra' : ar < 2000 ? 'gra' : ar < 2006 ? 'silver' : 'platt');
// skärmens storlek för en tv-ruta som ska rymmas i bredden b: 4:3 på bildrören, 16:9 på platt-tv:n
export const tvSkarm = (typ, b) => (typ === 'platt' ? { w: b, h: Math.round(b * 9 / 16) } : { w: b, h: Math.round(b * 3 / 4) });
// höljets kanter runt skärmen (rattpanelen till höger på bildrören; platt-tv:n står på en fot)
export const tvKant = (typ) => (typ === 'platt' ? { l: 3, t: 3, r: 3, b: 3, fot: 5 } : { l: 5, t: 5, r: 14, b: 6, fot: 2 });
const TV_FARG = { tra: [0x7a4c2a, 0x231a16, 0xc8c0ac], gra: [0x34343e, 0x121218, 0x4a4a56], silver: [0xa4a8b2, 0x2a2c34, 0x7c808c], platt: [0x18181e, 0x08080c, 0x2a2a34] };
function ratt(x, y, c) {
  rect(x + 1, y, 3, 1, ljusa(c, 0.3)); rect(x, y + 1, 5, 3, c); rect(x + 1, y + 4, 3, 1, morka(c, 0.35));
  rect(x + 1, y + 1, 1, 1, ljusa(c, 0.5)); rect(x + 2, y + 2, 1, 2, morka(c, 0.55));
}
// höljet runt skärmen (x, y, w, h) – ritas före bilden. o.fot = false: väggmonterad platt-tv (ingen fot)
export function tvRam(typ, x, y, w, h, o = {}) {
  const k = tvKant(typ), X = x - k.l, Y = y - k.t, B = w + k.l + k.r, Hh = h + k.t + k.b;
  const [bas, insida, panel] = TV_FARG[typ] || TV_FARG.gra;
  if (o.skugga !== false) rect(X + 2, Y + 2, B, Hh, F.skugga);
  rect(X, Y, B, Hh, bas);
  if (typ === 'tra') for (let j = 2; j < Hh - 2; j += 3) rect(X + 1, Y + j, B - 2, 1, (j / 3) % 2 ? morka(bas, 0.1) : ljusa(bas, 0.05));   // ådringen
  rect(X, Y, B, 1, ljusa(bas, 0.3)); rect(X, Y + 1, 1, Hh - 1, ljusa(bas, 0.15));
  rect(X, Y + Hh - 1, B, 1, morka(bas, 0.4)); rect(X + B - 1, Y + 1, 1, Hh - 1, morka(bas, 0.3));
  ram(x - 1, y - 1, w + 2, h + 2, insida);
  if (typ === 'platt') {
    rect(x - 1, y + h + 1, w + 2, 1, ljusa(bas, 0.12));   // underkantens glans
    if (o.fot !== false) { rect(x + Math.floor(w / 2) - 3, Y + Hh, 6, 3, morka(bas, 0.1)); rect(x + Math.floor(w / 2) - 12, Y + Hh + 3, 24, 2, ljusa(bas, 0.15)); }
    return;
  }
  // rattpanelen: två rattar och högtalargaller
  const px = x + w + 3, pw = k.r - 5;
  rect(px, y, pw, h, panel); rect(px, y, pw, 1, ljusa(panel, 0.25)); rect(px, y + h - 1, pw, 1, morka(panel, 0.3));
  if (h >= 24) { ratt(px + 2, y + 3, typ === 'tra' ? 0x8a8478 : 0xb8bcc8); ratt(px + 2, y + 10, typ === 'tra' ? 0x8a8478 : 0xb8bcc8); }
  for (let j = y + 18; j < y + h - 2; j += 2) rect(px + 1, j, pw - 2, 1, morka(panel, 0.35));
  // benen
  rect(X + 4, Y + Hh, 3, 2, morka(bas, 0.45)); rect(X + B - 7, Y + Hh, 3, 2, morka(bas, 0.45));
}
// bildrörets linjer och glas ovanpå bilden (platt-tv:n får bara en svag reflex)
export function tvGlas(typ, x, y, w, h) {
  const ctx = U.ctx;
  if (typ !== 'platt') {
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    for (let j = y + 1; j < y + h; j += 2) ctx.fillRect(x, j, w, 1);
    // runda hörn på bildröret
    const c = TV_FARG[typ][1];
    rect(x, y, 2, 1, c); rect(x, y + 1, 1, 1, c); rect(x + w - 2, y, 2, 1, c); rect(x + w - 1, y + 1, 1, 1, c);
    rect(x, y + h - 1, 2, 1, c); rect(x, y + h - 2, 1, 1, c); rect(x + w - 2, y + h - 1, 2, 1, c); rect(x + w - 1, y + h - 2, 1, 1, c);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  for (let i = 0; i < Math.min(w, h) / 3; i++) ctx.fillRect(x + 3 + i, y + 2 + Math.floor(i / 2), 1, 1);
}
// En hel tv med glimten: höljet runt skärmen (x, y, w, h), bilden och glaset.
export function tvMedGlimt(typ, x, y, w, h, id, titel, studio, t, o = {}) {
  tvRam(typ, x, y, w, h, o);
  glimtRuta(U.ctx, id, titel, studio, t, x, y, w, h);
  tvGlas(typ, x, y, w, h);
}

// Glimten (eller titelkortet när spelet saknar glimt) inpassad i rutan på svart botten. Förstoras i hela steg; en
// miniatyr förminskas utjämnat så att den inte tappar varannan pixelrad (bollen i PANG! är 2 px).
// Returnerar bildens ruta.
export function glimtRuta(ctx, id, titel, studio, t, x, y, w, h) {
  const g = id && GLIMT[id];
  if (!g) { titelkort(titel, studio, t, x, y, w, h); return { x, y, w, h }; }   // färgerna följer titeln: samma kort överallt
  rect(x, y, w, h, 0x050608);
  const s = Math.min(w / g.w, h / g.h), k = s >= 1 ? Math.floor(s) : s;
  const dw = Math.round(g.w * k), dh = Math.round(g.h * k), dx = x + Math.floor((w - dw) / 2), dy = y + Math.floor((h - dh) / 2);
  const bild = glimtBild(id, t), sm = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = k < 1;
  if (k < 1) ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bild, dx, dy, dw, dh);
  ctx.imageSmoothingEnabled = sm;
  return { x: dx, y: dy, w: dw, h: dh };
}

// Titelkortet: spelets startskärm för spel som inte har någon glimt än. Färgerna följer spelets id, titeln
// ritas så stort som får plats (högst tre rader), under den studion och ett blinkande TRYCK START.
const KORTFARG = [[0x1a1050, 0x8a2a6a, 0xffd23f], [0x081c3a, 0x1a7a8a, 0xffe08a], [0x2a0c08, 0xc0501a, 0xfff0b0], [0x062a14, 0x3a9a3a, 0xf8f0a0],
  [0x2a0618, 0xc02a4a, 0xffe0f0], [0x10102e, 0x5a5ac0, 0xb0f0ff], [0x1a0a2a, 0x6a2aa8, 0x7ef0d0], [0x202008, 0x8a7a1a, 0xffffff]];
const strHash = (s) => { let n = 7; for (const c of String(s || '')) n = (n * 31 + c.charCodeAt(0)) >>> 0; return n; };
export function titelkort(titel, studio, t, x, y, w, h, fro = titel) {
  const ctx = U.ctx, n = strHash(fro), [c1, c2, tc] = KORTFARG[n % KORTFARG.length];
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  if (w < 4 || h < 4) return;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  // himmel i band (pixelkornet håller) och stjärnor som blinkar
  const band = Math.max(2, Math.round(h / 16));
  for (let j = 0; j < h; j += band) rect(x, y + j, w, band, mixa(c1, c2, Math.min(1, j / (h * 0.75))));
  const stj = Math.round(w * h / 140);
  for (let i = 0; i < stj; i++) {
    const sx = x + Math.floor(hash(i, 1, n) * w), sy = y + Math.floor(hash(i, 2, n) * h * 0.6);
    if ((hash(i, 3, n) + t * 0.6) % 1 < 0.75) rect(sx, sy, 1, 1, ljusa(c2, 0.6));
  }
  // marken: ett rutnät som rullar mot betraktaren (bara när rutan är stor nog att se det)
  if (h >= 40) {
    const hy = y + Math.round(h * 0.72);
    rect(x, hy, w, y + h - hy, morka(c1, 0.35)); rect(x, hy, w, 1, ljusa(c2, 0.35));
    const rader = 5;
    for (let r = 0; r < rader; r++) { const f = ((r + (t * 0.8) % 1) / rader) ** 2; rect(x, hy + Math.round(f * (y + h - hy)), w, 1, mixa(morka(c1, 0.35), c2, 0.5)); }
    const mx = x + w / 2;
    for (let i = -6; i <= 6; i++) { const x0 = mx + i * w / 14, x1 = mx + i * w / 3.5; for (let j = 0; j < y + h - hy; j += 1) rect(Math.round(x0 + (x1 - x0) * j / (y + h - hy)), hy + j, 1, 1, mixa(morka(c1, 0.35), c2, 0.45)); }
  }
  // titeln: så stort som ryms (BIG ×3, ×2, ×1, sedan SMALL)
  const max = w - 6, plats = h >= 40 ? h * 0.55 : h - 4;
  let Fn = SMALL, k = 1, rader = null;
  for (const [f, kk] of [[BIG, 3], [BIG, 2], [BIG, 1], [SMALL, 1]]) {
    const r = radbryt(titel || '?', max, f, kk), lh = (f.h + 3) * kk;
    if (r.length <= 3 && r.every((l) => tw(l, f, kk) <= max) && r.length * lh <= plats) { Fn = f; k = kk; rader = r; break; }
  }
  if (!rader) { const r = radbryt(titel || '?', max); rader = r.slice(0, Math.max(1, Math.floor(plats / 7))); rader[rader.length - 1] = kapa(rader.slice(rader.length - 1).concat(r.slice(rader.length)).join(' '), max); }
  const lh = (Fn.h + 3) * k, th = rader.length * lh - 3 * k;
  let ty = h >= 40 ? y + Math.round(h * 0.38 - th / 2) : y + Math.round((h - th) / 2);
  for (const r of rader) { text(r, x + w / 2, ty, tc, { F: Fn, k, just: 'c', skugga: morka(c1, 0.5) }); ty += lh; }
  if (h >= 40 && studio) text(kapa(studio, max), x + w / 2, ty + 2, ljusa(c2, 0.55), { just: 'c' });
  if (h >= 30 && Math.floor(t * 1.6) % 2 === 0) text($t('TRYCK START'), x + w / 2, y + h - (h >= 120 ? 16 : 8), 0xffffff, { just: 'c', F: h >= 120 ? BIG : SMALL });
  ctx.restore();
}

// ---------- dithrad tonig mot svart (håller pixelkornet) ----------
const MASK = [];
function svart(niva) {
  const i = Math.max(0, Math.min(16, Math.round(niva * 16)));
  if (!i) return;
  let c = MASK[i];
  if (!c) {
    c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'), d = x.createImageData(W, H);
    for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) if (bayer(xx, yy) < i / 16) d.data[(yy * W + xx) * 4 + 3] = 255;
    x.putImageData(d, 0, 0); MASK[i] = c;
  }
  U.ctx.drawImage(c, 0, 0);
}
const ease = (p) => { p = Math.max(0, Math.min(1, p)); return 1 - (1 - p) ** 3; };

// ---------- vardagsrummet, ett per era ----------
const GOLV = 150;
const ERA = (ar) => (ar < 1990 ? 80 : ar < 2000 ? 90 : ar < 2006 ? 0 : 10);
const RUMSTIL = {
  80: { vagg: 0x6e4c3a, rand: 0x7a5643, golv: 0x8a5a30, matta: 0xa8502a, soffa: 0x7a4628, bank: 0x5a3418, gardin: 0xc0782a, himmel: [0x2a2a6a, 0x8a4a7a] },
  90: { vagg: 0x2c6a72, rand: 0x347882, golv: 0x5a4a74, matta: 0x2a3a8a, soffa: 0x3a4f9a, bank: 0x2a2a32, gardin: 0x8a2a6a, himmel: [0x1a2a5a, 0x5a6aaa] },
  0: { vagg: 0xcbb898, rand: 0xd4c2a2, golv: 0xb08a5e, matta: 0x8a3a3a, soffa: 0x6a6f7c, bank: 0x2a2c34, gardin: 0x6a7a5a, himmel: [0x3a5a9a, 0xe0a070] },
  10: { vagg: 0xd2d6de, rand: 0xc6cad4, golv: 0xc8aa80, matta: 0x5a6a8a, soffa: 0x4a5a7a, bank: 0xeeeef0, gardin: null, himmel: [0xc8508a, 0xf08a60] },
};
const RUM = new Map();
function rum(era) {
  if (RUM.has(era)) return RUM.get(era);
  const S = RUMSTIL[era], P = new Pix(W, H);
  // väggen med tapet
  tex(P, 0, 0, W, GOLV, S.vagg, era, 0.04);
  if (era === 80) for (let x = 0; x < W; x += 12) { P.rect(x, 0, 6, GOLV, S.rand); for (let y = 6; y < GOLV; y += 12) P.px(x + 9, y, mix(S.vagg, 0xffe0a0, 0.25)); }
  if (era === 90) for (let i = 0; i < 90; i++) { const x = Math.floor(hash(i, 1, 9) * W), y = Math.floor(hash(i, 2, 9) * (GOLV - 10)), c = [0xf060b0, 0xffd23f, 0x7ee0d0][i % 3]; P.hl(x, y, 3, c); P.px(x + (i % 2 ? 2 : 0), y + 1, c); }
  if (era === 0) { for (let x = 0; x < W; x += 3) P.vl(x, 0, GOLV, S.rand, 0.5); P.rect(150, 40, 46, 34, 0x3a2a1a); P.rect(153, 43, 40, 28, 0x6a8ab0); P.rect(153, 60, 40, 11, 0x5a8a4a); P.rect(170, 48, 6, 12, 0xf0e0a0); }
  if (era === 10) { P.dith(0, 0, W, 14, mul(S.vagg, 0.94), 0.5); }
  // fönstret: kvällshimmel genom rutan (stort fönster med stad i dag)
  const fx = era === 10 ? 16 : 26, fy = era === 10 ? 26 : 32, fw = era === 10 ? 124 : 76, fh = era === 10 ? 94 : 64;
  P.rect(fx - 3, fy - 3, fw + 6, fh + 6, era === 10 ? 0x30304a : mul(S.vagg, 0.55));
  for (let j = 0; j < fh; j++) for (let i = 0; i < fw; i++) P.px(fx + i, fy + j, mix(S.himmel[0], S.himmel[1], Math.min(1, j / fh + (bayer(i, j) - 0.5) * 0.2)));
  for (let i = 0; i < 9; i++) P.px(fx + Math.floor(hash(i, 4, era) * fw), fy + Math.floor(hash(i, 5, era) * fh * 0.4), 0xfff4d0);
  const stad = era === 10 ? 11 : 6;
  for (let i = 0; i < stad; i++) {
    const bw = Math.floor(fw / stad), bh = 10 + Math.floor(hash(i, 6, era) * fh * 0.45), bx = fx + i * bw;
    P.rect(bx, fy + fh - bh, bw - 1, bh, mix(S.himmel[0], 0x0a0a1a, 0.6));
    for (let j = fy + fh - bh + 3; j < fy + fh - 2; j += 4) for (let k = bx + 2; k < bx + bw - 3; k += 3) if (hash(k, j, era) > 0.55) P.px(k, j, 0xffe08a);
  }
  if (era !== 10) { P.vl(fx + fw / 2, fy, fh, mul(S.vagg, 0.55)); P.hl(fx, fy + fh / 2, fw, mul(S.vagg, 0.55)); }
  else { for (const dx of [41, 83]) P.vl(fx + dx, fy, fh, 0x30304a); }
  P.rect(fx - 5, fy + fh + 3, fw + 10, 3, era === 10 ? 0xf4f4f6 : mul(S.vagg, 0.7));
  if (S.gardin) for (const gx of [fx - 12, fx + fw + 2]) { tex(P, gx, fy - 6, 10, fh + 14, S.gardin, 4, 0.06); for (let i = 1; i < 10; i += 3) P.vl(gx + i, fy - 6, fh + 14, mul(S.gardin, 0.8)); }
  if (era === 90) for (let j = fy; j < fy + fh; j += 4) P.hl(fx, j, fw, 0xd8d8e0, 0.55);   // persienner
  // golvlisten och golvet
  P.rect(0, GOLV - 3, W, 3, mul(S.vagg, 0.6)); P.hl(0, GOLV - 3, W, mix(S.vagg, 0xffffff, 0.2));
  tex(P, 0, GOLV, W, H - GOLV, S.golv, era + 1, 0.05);
  if (era === 90) P.dith(0, GOLV, W, H - GOLV, mul(S.golv, 0.85), 0.25);
  else for (let y = GOLV + 6; y < H; y += 7) { P.hl(0, y, W, mul(S.golv, 0.82)); for (let x = (y * 7) % 37; x < W; x += 37) P.vl(x, y - 6, 6, mul(S.golv, 0.82)); }
  // mattan
  P.ell(196, 184, 170, 20, S.matta, 0.9, 3);
  // golvlampan (80- och 90-talet) eller växten (2000-)
  if (era === 80 || era === 90) {
    glod(P, 195, 72, 36, 30, 0xffd890, 0.18, 4);
    P.vl(195, 76, GOLV - 70, 0x2a2420); P.rect(189, GOLV + 2, 13, 3, 0x2a2420);
    for (let j = 0; j < 14; j++) P.hl(186 + Math.floor(j / 3), 62 + j, 18 - 2 * Math.floor(j / 3), mix(era === 80 ? 0xe0902a : 0xd8d0b8, 0xfff4d0, 0.2 - j / 70));
  } else {
    P.rect(186, GOLV - 18, 18, 18, era === 10 ? 0xf0f0f2 : 0x8a5a3a); P.hl(186, GOLV - 18, 18, 0xffffff, 0.3);
    for (let i = 0; i < 26; i++) { const a = -Math.PI / 2 + (hash(i, 7, era) - 0.5) * 2.4, l = 14 + hash(i, 8, era) * 18; P.line(195, GOLV - 18, 195 + Math.cos(a) * l, GOLV - 18 + Math.sin(a) * l, i % 2 ? 0x3a8a4a : 0x2a6a3a); }
  }
  // soffan (barnen sitter i den, ritas i varje bild)
  // ryggen med två kuddar, sitsens ovansida (ljus) och framsida (mörk), armstöden och benen
  const R = ramp(S.soffa);
  P.box(23, 105, 148, 61, kant(S.soffa));
  tex(P, 24, 106, 146, 38, R.base, era + 2, 0.05); P.hl(24, 106, 146, R.hi);
  for (const kx of [27, 98]) { P.rect(kx, 110, 69, 32, mix(R.base, R.hi, 0.25)); P.hl(kx, 110, 69, R.hi); P.hl(kx, 141, 69, R.lo); P.vl(kx + 68, 111, 30, R.lo); }
  P.rect(24, 142, 146, 8, mix(R.base, R.hi, 0.55)); P.hl(24, 142, 146, R.hi);
  tex(P, 24, 150, 146, 15, R.lo, era + 3, 0.05); P.hl(24, 150, 146, mul(R.lo, 0.8));
  if (era === 80) for (let x = 26; x < 168; x += 3) P.vl(x, 152, 12, mul(R.lo, 0.9));
  for (const ax of [17, 161]) { tex(P, ax, 122, 14, 43, R.base, era + 4, 0.05); P.hl(ax, 122, 14, R.hi); P.vl(ax, 123, 42, mix(R.base, R.hi, 0.4)); P.box(ax - 1, 121, 16, 45, kant(S.soffa)); }
  P.rect(21, 166, 4, 3, 0x2a1a10); P.rect(167, 166, 4, 3, 0x2a1a10);
  // tv-bänken (platt-tv:n hänger på väggen ovanför en låg bänk med LED-list)
  if (era === 10) {
    glod(P, 290, 72, 92, 54, 0x9a6aff, 0.22, 5);
    lada(P, 222, 132, 136, 14, 3, S.bank);
  } else lada(P, 222, 126, 136, 22, 4, S.bank);
  const c = P.flush(); RUM.set(era, c); return c;
}
// barnen i soffan (samma två barn i varje film)
const rng = (s) => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
let BARN = null;
const barnen = () => BARN || (BARN = [
  { ...makeLook(rng(11)), kid: true, build: 4, bag: null, hat: null, phones: false, shirt: '#3a7bd5' },
  { ...makeLook(rng(29)), kid: true, build: 4, bag: null, hat: null, phones: false, shirt: '#e0a02a' },
]);
// tv:n i rummet: bildröret på bänken eller platt-tv:n på väggen
function rumsTv(era) {
  if (era === 10) return { typ: 'platt', x: 226, y: 36, w: 128, h: 72, fot: false };
  const typ = tvTyp(era === 80 ? 1985 : era === 90 ? 1995 : 2003), k = tvKant(typ), w = 96, h = 72;
  return { typ, x: 290 - Math.round((w + k.l + k.r) / 2) + k.l, y: 126 - k.fot - k.b - h, w, h, fot: true };
}
const KONSOL_PA_GOLVET = { x: 262, y: 156 };

// ---------- slutbildens ljusstrålar ----------
let STRALAR = null;
function stralar() {
  if (STRALAR) return STRALAR;
  const S = 460, P = new Pix(S, S), m = S / 2;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const a = Math.atan2(y - m, x - m), r = Math.hypot(x - m, y - m);
    if (Math.floor((a + Math.PI) / (Math.PI / 12)) % 2 || r < 20) continue;
    const f = Math.max(0, 1 - r / m);
    if (bayer(x, y) < 0.25 + f * 0.6) P.px(x, y, 0xffe8a0, 0.07 + f * 0.08);
  }
  STRALAR = P.flush(); return STRALAR;
}
function slutBakgrund(ctx, t, cx, cy) {
  for (let j = 0; j < H; j += 2) rect(0, j, W, 2, mixa(0x10102c, 0x2a1240, j / H));
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.12); ctx.drawImage(stralar(), -230, -230); ctx.restore();
  for (let i = 0; i < 26; i++) { const x = Math.floor(hash(i, 1, 77) * W), y = 14 + Math.floor(hash(i, 2, 77) * 186); if ((hash(i, 3, 77) + t * 0.9) % 1 < 0.3) { rect(x, y, 1, 1, 0xffffff); if ((hash(i, 4, 77) + t) % 1 < 0.15) { rect(x - 1, y, 3, 1, 0xfff4d0); rect(x, y - 1, 1, 3, 0xfff4d0); } } }
}

// ---------- filmen ----------
const SLOGAN = [$t('SPELA HEMMA!'), $t('HELA FAMILJEN SPELAR!'), $t('FRAMTIDEN ÄR HÄR!'), $t('NU BÖRJAR LEKEN!'), $t('SPELKVÄLL VARJE KVÄLL!'), $t('MER SPEL ÄN NÅGONSIN!')];
// vad filmen visar, ur spelets tillstånd (det som saknas tas från o)
function filmen(G, o) {
  const s = o.spel != null ? G.k?.spel.find((x) => x.id === o.spel) : null;
  const konsolId = o.konsol ?? o.produkt ?? s?.konsol;
  const p = G.produkter.find((x) => x.id === konsolId) || null, pr = p ? null : G.projekt.find((x) => x.id === konsolId) || null;
  const design = p?.design || pr?.design || null, ar = arAv(G.dag);
  const konsolNamn = p?.namn || design?.namn || $t('DIN KONSOL'), modell = design ? konsolTel(design).enhet : 'konsol-ataro';
  const bas = { konsolNamn, design, modell, ar, era: ERA(ar), bolag: G.bolag.namn };
  if (s || o.titel) {
    const glimt = s ? s.glimt : o.glimt;
    return { ...bas, typ: 'spel', titel: s?.titel || o.titel, glimt: glimt && GLIMT[glimt] ? glimt : null,
      studio: s ? (s.egen ? G.bolag.namn : studioAv(s.studio).namn) : (o.studio || ''), stj: s?.stj || o.stj || 0, exklusiv: !!s?.exklusiv, pris: spelPris(G) };
  }
  const packin = p?.packin || design?.packin || null;
  return { ...bas, typ: 'konsol', titel: konsolNamn, glimt: packin?.glimt && GLIMT[packin.glimt] ? packin.glimt : null, studio: G.bolag.namn,
    packin, pris: p?.pris ?? design?.pris ?? 0, betyg: p?.betyg ?? 0, slogan: SLOGAN[strHash(konsolNamn) % SLOGAN.length] };
}

export function reklam(A, o = {}) {
  const G = A.G;
  if (!G) return { tid: false, enter() { A.go('start'); }, rita() {} };
  const f = filmen(G, o), spel = f.typ === 'spel';
  // tidslinjen: rummet → (spelet i helbild) → slutbilden → tona ut
  const RUM_SLUT = spel ? 2.8 : 3.0, ZOOM = 0.4, SLUT = spel ? 5.0 : 3.0, LANGD = spel ? 8.2 : 7.4;
  let t = o.t || 0, borta = false, ljud = t >= SLUT ? 1 : 0;   // (o.t: börja mitt i filmen – skärmbilder och robotar)
  const tillbaka = () => { if (borta) return; borta = true; A.go(o.tillbaka && o.tillbaka !== 'reklam' ? o.tillbaka : 'kontor', o.tillbakaOpts || {}); };
  return {
    tid: false,
    tangent(e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { tillbaka(); return true; } return false; },
    ner() { if (t > 0.4) tillbaka(); },
    rita(ctx, dt) {
      t += dt;
      if (t >= LANGD + 0.45) { tillbaka(); return; }
      if (ljud === 0 && t >= SLUT) { A.ljud(spel ? 'klar' : 'fanfar'); ljud = 1; }
      if (t < RUM_SLUT + (spel ? ZOOM : 0)) vardagsrum(ctx, t);
      if (spel && t >= RUM_SLUT + ZOOM && t < SLUT) helbild(ctx, t);
      if (t >= SLUT) (spel ? slutSpel : slutKonsol)(ctx, t - SLUT);
      // tonas in, mellan scenerna och ut
      if (t < 0.5) svart(1 - t / 0.5);
      if (!spel && t >= SLUT && t < SLUT + 0.3) svart(1 - (t - SLUT) / 0.3);
      if (spel && t >= SLUT && t < SLUT + 0.25) svart(1 - (t - SLUT) / 0.25);
      if (t > LANGD) svart((t - LANGD) / 0.4);
      ramen(t);
    },
  };

  // 1. vardagsrummet: barnen spelar, glimten går på tv:n
  function vardagsrum(ctx, t) {
    ctx.drawImage(rum(f.era), 0, 0);
    const tv = rumsTv(f.era);
    tvRam(tv.typ, tv.x, tv.y, tv.w, tv.h, { fot: tv.fot, skugga: false });
    const bild = glimtRuta(ctx, f.glimt, f.typ === 'konsol' && !f.glimt ? f.konsolNamn : f.titel, f.studio, t, tv.x, tv.y, tv.w, tv.h);
    tvGlas(tv.typ, tv.x, tv.y, tv.w, tv.h);
    // konsolen på mattan och barnen med handkontrollerna (sladd fram till 2001)
    ritaKonsol2D(ctx, KONSOL_PA_GOLVET.x, KONSOL_PA_GOLVET.y, f.modell, 1);
    barnen().forEach((L, i) => {
      const bx = 76 + i * 46, hopp = Math.sin(t * 5.5 + i * 2.1) > 0.55 ? -1 : 0, by = 160 + hopp;
      drawPerson(ctx, bx, by, L, 'right', 5);
      const hx = bx + 5, hy = by - 15;
      rect(hx, hy, 6, 3, 0x26262c); rect(hx + 1, hy, 1, 1, 0xd03030); rect(hx + 4, hy + 1, 1, 1, 0x3060d0);
      if (f.ar < 2001) {
        // sladden hänger i en båge ner till konsolen (en pixel per steg, ingen lucka)
        const x0 = hx + 6, y0 = hy + 2, x1 = KONSOL_PA_GOLVET.x + 10 + i * 6, y1 = KONSOL_PA_GOLVET.y + 21, n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.3);
        for (let k = 0; k <= n; k++) { const p = k / n; rect(Math.round(x0 + (x1 - x0) * p), Math.round(y0 + (y1 - y0) * p + Math.sin(p * Math.PI) * 10), 1, 1, 0x18181c); }
      }
    });
    // in i tv:n: rummet mörknar och bilden växer till helbild
    if (spel && t >= RUM_SLUT) {
      const p = ease((t - RUM_SLUT) / ZOOM), mal = helRuta();
      svart(p);
      // bilden på tv:n växer rakt ut till helbilden (en kort stund i ojämn skala, sedan hela steg)
      const r = { x: Math.round(bild.x + (mal.x - bild.x) * p), y: Math.round(bild.y + (mal.y - bild.y) * p), w: Math.round(bild.w + (mal.w - bild.w) * p), h: Math.round(bild.h + (mal.h - bild.h) * p) };
      if (f.glimt) ctx.drawImage(glimtBild(f.glimt, t), r.x, r.y, r.w, r.h); else titelkort(f.titel, f.studio, t, r.x, r.y, r.w, r.h);
    }
  }
  // 2. spelet i helbild (största hela förstoringen som ryms på skärmen)
  function helRuta() {
    const g = f.glimt && GLIMT[f.glimt];
    if (!g) return { x: 0, y: 0, w: W, h: H };
    const k = Math.max(1, Math.floor(Math.min(W / g.w, H / g.h)));
    return { x: Math.floor((W - g.w * k) / 2), y: Math.floor((H - g.h * k) / 2), w: g.w * k, h: g.h * k };
  }
  function helbild(ctx, t) {
    rect(0, 0, W, H, 0x000000);
    const r = helRuta();
    glimtRuta(ctx, f.glimt, f.titel, f.studio, t, r.x, r.y, r.w, r.h);
    if (t > RUM_SLUT + ZOOM + 0.2) {
      const s = $t`SPELBILD FRÅN ${f.konsolNamn}`;
      rect(4, H - 14, tw(s) + 8, 10, 0x000000); text(s, 8, H - 12, F.text);
    }
  }
  // 3a. slutbilden för ett spel: tv:n med glimten, titeln, stjärnorna och konsolen i hörnet
  function slutSpel(ctx, u) {
    slutBakgrund(ctx, u, 110, 110);
    // tv:n glider in från vänster; skärmen = glimten i hela steg (högst 200×150)
    const g = f.glimt && GLIMT[f.glimt], typ = tvTyp(f.ar), k = tvKant(typ);
    let sw, sh;
    if (g) { const kk = Math.max(1, Math.floor(Math.min(200 / g.w, 150 / g.h))); sw = g.w * kk; sh = g.h * kk; } else ({ w: sw, h: sh } = tvSkarm(typ, typ === 'platt' ? 192 : 176));
    const tvB = sw + k.l + k.r, tvH = sh + k.t + k.b + k.fot;
    const tx = Math.round(12 + (1 - ease(u / 0.5)) * -240) + k.l, ty = Math.round(12 + (192 - tvH) / 2) + k.t;
    tvMedGlimt(typ, tx, ty, sw, sh, f.glimt, f.titel, f.studio, SLUT + u);
    // texten till höger
    const x0 = 12 + tvB + 12, cw = W - 8 - x0;
    const in_ = (start, dur = 0.4) => ease((u - start) / dur), glid = (start) => Math.round((1 - in_(start)) * 170);
    let y = 24;
    if (u > 0.1) text(kapa($t`${f.studio} PRESENTERAR`, cw), x0 + glid(0.1), y, F.lila2);
    y += 10;
    const titel = rubrikRader(f.titel, cw);
    if (u > 0.15) titel.rader.forEach((r, i) => text(r, x0 + glid(0.15 + i * 0.08), y + i * titel.lh, F.guld, { F: titel.Fn, k: titel.k, skugga: 0x3a0a2a }));
    y += titel.rader.length * titel.lh + 4;
    for (let i = 0; i < 5; i++) {
      const p = in_(0.6 + i * 0.1, 0.15); if (p <= 0) continue;
      ikon('stjarna', x0 + i * 16, y + Math.round((1 - p) * -6), i < f.stj ? F.guld : 0x4a4a6a, 2);
    }
    y += 22;
    if (f.exklusiv && u > 1.0) { const s = $t('BARA HOS OSS!'); rect(x0, y - 2, tw(s) + 8, 10, F.lila); text(s, x0 + 4, y, F.text); y += 14; }
    // NU TILL <KONSOL>! och konsolen i hörnet
    const namn = f.konsolNamn + '!', stor = tw(namn, BIG, 2) <= cw ? 2 : 1;
    if (u > 1.1) {
      const puls = Math.floor(u * 3) % 2 ? F.guld : 0xfff0a0;
      text($t('NU TILL'), x0, y, F.text);
      text(stor === 1 ? kapa(namn, cw, BIG) : namn, x0, y + 9, puls, { F: BIG, k: stor, skugga: 0x3a0a2a });
    }
    y += 9 + 9 * stor + 4;
    if (u > 1.5) text($t`I BUTIK NU · ${kr(f.pris)}`, x0, y, F.text);
    // konsolen i hörnet, under texten
    const y3d = Math.max(124, y + 10);
    if (u > 0.3 && u < LANGD - SLUT) visaKonsol({ x: W - 106, y: y3d, w: 102, h: H - 12 - y3d }, f.design || f.modell, { vy: 'auto', spin: u * 0.9, pitch: 0.3, ctx });
  }
  // 3b. slutbilden för en konsol: konsolen stor, namnet, sloganen, spelet i lådan och priset
  function slutKonsol(ctx, u) {
    slutBakgrund(ctx, u, 110, 120);
    // ljuskägla och podium under konsolen
    glodRuta(ctx, 110, 172, 90, 12);
    if (u > 0.3 && u < LANGD - SLUT) visaKonsol({ x: 20, y: 34, w: 180, h: 136 }, f.design || f.modell, { vy: 'auto', spin: u * 0.8, pitch: 0.3, ctx });
    const x0 = 214, cw = W - 8 - x0;
    const in_ = (start, dur = 0.4) => ease((u - start) / dur), glid = (start) => Math.round((1 - in_(start)) * 170);
    let y = 24;
    if (u > 0.2) text(kapa($t`${f.bolag} PRESENTERAR`, cw), x0 + glid(0.2), y, F.lila2);
    y += 10;
    const namn = rubrikRader(f.konsolNamn, cw, 3);
    if (u > 0.3) namn.rader.forEach((r, i) => text(r, x0 + glid(0.3 + i * 0.08), y + i * namn.lh, F.guld, { F: namn.Fn, k: namn.k, skugga: 0x3a0a2a }));
    y += namn.rader.length * namn.lh + 4;
    if (u > 1.0) { const r = radbryt(f.slogan, cw, BIG); r.forEach((rad, i) => text(rad, x0 + glid(1.0), y + i * 10, F.text, { F: BIG, skugga: 0x10102c })); y += r.length * 10 + 6; }
    if (f.packin && u > 1.4) {
      const sk = tvSkarm(tvTyp(f.ar), 48), typ = tvTyp(f.ar), k = tvKant(typ);
      tvMedGlimt(typ, x0 + k.l, y + k.t, sk.w, sk.h, f.glimt, f.packin.titel, f.bolag, SLUT + u);
      const tx = x0 + sk.w + k.l + k.r + 6;
      text($t('MED'), tx, y + 4, F.dim); text(kapa(f.packin.titel, W - 8 - tx), tx, y + 12, F.text); text($t('I LÅDAN!'), tx, y + 20, F.dim);
      y += sk.h + k.t + k.b + k.fot + 6;
    }
    if (u > 1.9 && f.betyg >= 7) { text($t`KRITIKERNA: ${dec(f.betyg)}/10`, x0, Math.min(y, 172), F.gron2); }
    if (u > 2.2 && f.pris) {
      const p = kr(f.pris), pw = tw(p, BIG) + 12, px = x0, py = 182;
      rect(px + 2, py + 2, pw, 13, 0x05060f); rect(px, py, pw, 13, F.rod); rect(px, py, pw, 1, ljusa(F.rod, 0.3));
      text(p, px + 6, py + 3, F.text, { F: BIG });
      text($t('I BUTIK NU'), px + pw + 6, py + 4, F.text);
    }
  }
  // svarta band, REKLAMFILM, delarna och HOPPA ÖVER
  function ramen(t) {
    const hel = spel && t >= RUM_SLUT && t < SLUT;
    if (!hel) {
      rect(0, 0, W, 12, 0x000000); rect(0, H - 12, W, 12, 0x000000);
      rect(6, 4, 3, 3, Math.floor(t * 2) % 2 ? F.rod : 0x5a1010); text($t('REKLAMFILM'), 12, 4, F.dim);
      text(String(f.ar), W - 6, 4, F.dim2, { just: 'h' });
      const delar = spel ? [[0, RUM_SLUT], [RUM_SLUT, SLUT], [SLUT, LANGD]] : [[0, SLUT], [SLUT, LANGD]];
      delar.forEach(([a, b], i) => { const x = 6 + i * 14; rect(x, H - 7, 12, 3, 0x2a2a34); rect(x, H - 7, Math.round(12 * Math.max(0, Math.min(1, (t - a) / (b - a)))), 3, F.guld2); });
    }
    knapp(W - 66, H - 11, 62, 10, $t('HOPPA ÖVER'), { stil: 'morkt', klick: tillbaka, namn: 'reklam-hoppa' });
  }
}
// rubriken så stor som ryms: BIG ×2 på högst två rader, annars BIG ×1 på högst max rader, annars SMALL
function rubrikRader(s, cw, max = 3) {
  for (const [Fn, k, n] of [[BIG, 2, 2], [BIG, 1, max], [SMALL, 1, max]]) {
    const r = radbryt(s, cw, Fn, k);
    if (r.length <= n && r.every((l) => tw(l, Fn, k) <= cw)) return { rader: r, Fn, k, lh: (Fn.h + 4) * k };
  }
  return { rader: [kapa(s, cw)], Fn: SMALL, k: 1, lh: 8 };
}
// mjuk ljuskägla under konsolen (dithrad ellips, ritas en gång)
let KAGLA = null;
function glodRuta(ctx, cx, cy, rx, ry) {
  if (!KAGLA) {
    const P = new Pix(rx * 2 + 1, ry * 2 + 1);
    for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
      const d = Math.hypot(x / rx, y / ry); if (d >= 1) continue;
      if (bayer(cx + x, cy + y) < (1 - d) * 0.8) P.px(x + rx, y + ry, d < 0.5 ? 0x5a4a8a : 0x3a2a6a);
    }
    KAGLA = P.flush();
  }
  ctx.drawImage(KAGLA, cx - rx, cy - ry);
}
