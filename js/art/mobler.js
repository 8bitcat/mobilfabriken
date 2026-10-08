// Möblerna i pixel. Varje möbel är en sprite med ankare: golvmöbler i (mitten, golvkontakt),
// väggsaker i (mitten, överkant). Arbetsplatsens delar (bord, dator, stol) ritas för sig runt personen.
// Ljus från vänster uppe, ramper med varma högdagrar, färgad kontur – som Snabbfilen.
import { Pix, mix, mul, hash, bayer, ramp, kant, nz, qmix, tex, disc, glod, skugga, lada, golvSkugga, sprite, ritaSprite, VARM, DJUP, SKUGGA } from './kit.js';

// ======================================================================
// ARBETSPLATSEN: bord (framför personen), dator (skärmens baksida), stol (ryggen bakom personen)
// ======================================================================
const BORD = {
  fallbord: { topp: 0xa8acb8, front: 0x8a8e9a, ben: 0x5a5e6a, w: 50, tunn: true },
  trabord: { topp: 0xc69a62, front: 0xa87d50, ben: 0x6a4a30, w: 56, lada: true },
  kontorsbord: { topp: 0xe2ded6, front: 0xb8b4ac, ben: 0x6a6e7a, w: 58, lada: true, list: 0x5a5e6a },
  chefsbord: { topp: 0x7a3a2a, front: 0x5e2a1e, ben: 0x3a1a12, w: 60, lada: true, list: 0xd8b24a },
  glasbord: { topp: 0xa8e0f0, front: 0x6ab8d0, ben: 0xd8dce4, w: 60, glas: true, led: 0x4ff0ff },
  stridsstation: { topp: 0x2a2a34, front: 0x1c1c24, ben: 0x101016, w: 62, led: 0xff40c8, rgb: true },
  guldbord: { topp: 0xe8b230, front: 0xc08a1a, ben: 0x8a5a10, w: 62, lada: true, list: 0xfff0a0, guld: true },
};
export const bordBredd = (id) => (BORD[id] || BORD.fallbord).w;
// bordet: (x, y) = bordsskivans vänstra överkant
export function ritaBord(P, id, x, y) {
  const B = BORD[id] || BORD.fallbord, w = B.w, R = ramp(B.topp), RF = ramp(B.front);
  P.rect(x + 2, y + 17, w, 4, DJUP, 0.22); P.rect(x + w + 1, y + 4, 2, 13, DJUP, 0.2);   // slagskugga
  // skiva
  for (let j = 0; j < 9; j++) for (let i = 0; i < w; i++) {
    let c = j === 0 ? R.hi : j === 8 ? R.lo : B.glas ? qmix(R.hi, R.base, j / 8, x + i, y + j, 2) : hash(i >> 2, j, 17) < 0.25 ? mix(R.base, R.lo, 0.3) : R.base;
    if (B.glas && ((i * 2 - j * 3) % 24 + 24) % 24 < 2) c = mix(c, VARM, 0.4);
    if (i === 0) c = R.hi; else if (i === w - 1) c = R.lo;
    P.px(x + i, y + j, c);
  }
  P.box(x - 1, y - 1, w + 2, 11, kant(B.topp));
  // front / sarg
  const fh = B.tunn ? 3 : 6;
  for (let j = 0; j < fh; j++) for (let i = 0; i < w; i++) P.px(x + i, y + 10 + j, j === 0 ? mix(RF.base, RF.hi, 0.4) : j === fh - 1 ? RF.dk : nz(RF.base, x + i, y + j, 4, 0.05));
  if (B.list) P.hl(x, y + 10, w, B.list);
  if (B.lada) { P.rect(x + w - 17, y + 11, 13, fh - 2, RF.lo); P.box(x + w - 17, y + 11, 13, fh - 2, RF.dk); P.rect(x + w - 12, y + 12, 3, 1, B.guld ? 0xfff0a0 : 0xd8b24a); }
  if (B.led) { for (let i = 1; i < w - 1; i++) P.px(x + i, y + 10 + fh - 1, B.rgb ? [0xff40c8, 0x4ff0ff, 0xffd23f, 0x45b964][((i >> 3) % 4)] : B.led); glod(P, x + w / 2, y + 10 + fh + 1, w / 2, 3, B.rgb ? 0xb060ff : B.led, 0.25, 2); }
  // ben
  const by = y + 10 + fh, bh = 18 - fh - (B.tunn ? 0 : 0);
  for (const bx of [x + 1, x + w - 3]) { P.rect(bx, by, 2, bh - 7, B.ben); P.vl(bx, by, bh - 7, mix(B.ben, VARM, 0.2)); }
  if (B.tunn) { P.line(x + 4, by + 1, x + w - 6, by + bh - 9, B.ben); P.line(x + w - 5, by + 1, x + 5, by + bh - 9, B.ben); }
}
// skärmens baksida på bordet. (x, y) = skärmens nedre mitt (där foten står på skivan)
export function ritaDator(P, id, x, y) {
  switch (id) {
    case 'platt': return platt(P, x - 9, y - 15);
    case 'dubbel': platt(P, x - 8, y - 15); return platt(P, x + 12, y - 15);
    case 'station': { platt(P, x - 11, y - 17, 22, 13); const t = 0x2a2a34; P.rect(x + 14, y - 2, 8, 22, t); P.vl(x + 14, y - 2, 22, 0x4a4a58); P.px(x + 18, y + 2, 0x45b964); P.px(x + 18, y + 5, 0x3a8ff0); P.box(x + 13, y - 3, 10, 24, kant(t)); return; }
    case 'aiterminal': { const c = 0xe8ecf4, R = ramp(c); disc(P, x, y - 10, 11, 9, (px, py, t) => P.px(px, py, t > 0.85 ? R.lo : (px - x) + (py - y + 10) < -6 ? R.hi : R.base)); disc(P, x, y - 10, 5, 4, (px, py, t) => P.px(px, py, t > 0.7 ? 0x2ab8d8 : 0x9af4ff)); glod(P, x, y - 10, 14, 11, 0x4ff0ff, 0.22, 3); P.rect(x - 1, y - 2, 3, 3, R.lo); P.hl(x - 5, y, 11, R.dk); return; }
    default: return crt(P, x - 8, y - 14);
  }
}
function crt(P, x, y) {
  const c = 0xcfc6ae, R = ramp(c);
  P.rect(x, y, 16, 13, R.base); P.rect(x + 2, y + 2, 12, 8, R.lo);
  P.hl(x, y, 16, R.hi); P.vl(x, y, 13, R.hi); P.vl(x + 15, y, 13, R.lo); P.hl(x, y + 12, 16, R.dk);
  for (let k = 0; k < 3; k++) P.hl(x + 4, y + 4 + k * 2, 8, R.dk);
  P.box(x - 1, y - 1, 18, 15, kant(c));
  P.hl(x, y - 1, 16, 0xbfe0ff, 0.75);
  P.rect(x + 5, y + 13, 6, 2, R.dk); P.hl(x + 4, y + 14, 8, R.lo);
}
function platt(P, x, y, w = 18, h = 11) {
  const c = 0x3a3d48, R = ramp(c);
  P.rect(x, y, w, h, R.base); P.hl(x, y, w, R.hi); P.vl(x, y, h, R.hi); P.vl(x + w - 1, y, h, R.lo); P.hl(x, y + h - 1, w, R.lo);
  P.rect(x + (w >> 1) - 1, y + 4, 2, 2, R.dk); P.px(x + (w >> 1) - 1, y + 4, 0x6fe7e0);
  P.box(x - 1, y - 1, w + 2, h + 2, kant(c));
  P.rect(x + (w >> 1) - 1, y + h + 1, 2, 2, R.dk); P.hl(x + (w >> 1) - 4, y + h + 3, 8, R.dk); P.hl(x + (w >> 1) - 4, y + h + 2, 8, R.lo);
  P.hl(x, y - 1, w, 0xbfe0ff, 0.75);
}
// stolsryggen bakom personen. (x, y) = ryggens mitt-överkant
export function ritaStol(P, id, x, y) {
  const st = { kontorsstol: [0x3a3d48, 14, 8], ergostol: [0x2a2f3a, 14, 11, 'nat'], gamingstol: [0xc9323a, 14, 11, 'race'], massagestol: [0x6a4a33, 18, 14, 'puff'] }[id];
  if (!st) return;   // pallen syns inte bakom personen
  const [c, w, h, typ] = st, R = ramp(c), x0 = x - (w >> 1);
  P.rect(x0, y, w, h, R.base); P.hl(x0, y, w, R.hi); P.vl(x0, y, h, R.hi); P.vl(x0 + w - 1, y, h, R.lo); P.hl(x0, y + h - 1, w, R.lo);
  if (typ === 'nat') for (let j = 2; j < h - 1; j += 2) for (let i = 2; i < w - 2; i += 2) P.px(x0 + i, y + j, R.dk);
  if (typ === 'race') { P.rect(x0 + 2, y + 2, w - 4, 3, 0x1c1c24); P.vl(x0 + 3, y + 5, h - 7, 0x1c1c24); P.vl(x0 + w - 4, y + 5, h - 7, 0x1c1c24); P.rect(x0 + 5, y + 1, 4, 2, 0xffd23f); }
  if (typ === 'puff') { for (let j = 3; j < h; j += 4) P.hl(x0 + 1, y + j, w - 2, R.lo); P.vl(x0 + (w >> 1), y + 1, h - 2, R.lo); }
  P.box(x0 - 1, y - 1, w + 2, h + 2, kant(c));
}

// ======================================================================
// GOLVMÖBLER (ankare = mitt, golvkontakt)
// ======================================================================
const GOLV = {
  krukvaxt: [14, 22, (P, ax, ay) => { kruka(P, ax, ay, 10, 8, 0xb86a3a); bladverk(P, ax, ay - 12, [[0, 0, 5], [-4, 3, 4], [4, 3, 4], [0, -4, 3]]); }],
  hogvaxt: [16, 34, (P, ax, ay) => { kruka(P, ax, ay, 10, 9, 0xe8e3d6); P.vl(ax, ay - 20, 12, 0x5a3a1a); bladverk(P, ax, ay - 20, [[0, -6, 5], [-4, -1, 4], [4, -1, 4], [0, 4, 4], [-3, -10, 3], [3, -10, 3]]); }],
  palm: [26, 44, (P, ax, ay) => {
    kruka(P, ax, ay, 12, 9, 0xc87a40);
    for (let j = 0; j < 22; j++) { const x = ax + Math.round(Math.sin(j * 0.15) * 1.5); P.px(x, ay - 9 - j, j % 3 ? 0x8a5a30 : 0x6a4020); P.px(x + 1, ay - 9 - j, 0x5a3a1a); }
    const tx = ax + 1, ty = ay - 32;
    for (const [dx, dy] of [[-11, 2], [-9, -4], [-3, -8], [4, -8], [10, -4], [11, 3], [0, -10]]) { P.line(tx, ty, tx + dx, ty + dy, 0x2f8f46); P.line(tx, ty + 1, tx + dx, ty + dy + 1, 0x1d5a2c); P.px(tx + dx, ty + dy, 0x6fcf6a); }
  }],
  bonsai: [22, 22, (P, ax, ay) => {
    lada(P, ax - 9, ay - 8, 18, 6, 2, 0x2a2f48);
    kruka(P, ax, ay - 8, 14, 4, 0x2a3a6a);
    P.line(ax - 1, ay - 12, ax + 3, ay - 17, 0x6a4020); P.line(ax + 3, ay - 17, ax - 2, ay - 20, 0x6a4020);
    bladverk(P, ax, ay - 19, [[-4, 0, 4], [3, -2, 4], [5, 2, 3]]); P.px(ax - 5, ay - 21, 0xf0a0c0); P.px(ax + 4, ay - 23, 0xf0a0c0);
  }],
  inomhustrad: [34, 52, (P, ax, ay) => { kruka(P, ax, ay, 16, 10, 0x2a2a34); P.rect(ax - 1, ay - 26, 3, 16, 0x6a4020); P.vl(ax - 1, ay - 26, 16, 0x8a5a30); bladverk(P, ax, ay - 34, [[0, -6, 8], [-8, 0, 7], [8, 0, 7], [0, 5, 7], [-5, -10, 5], [6, -9, 5]]); }],
  kristalltrad: [32, 50, (P, ax, ay) => {
    lada(P, ax - 8, ay - 6, 16, 5, 1, 0x3a3a48);
    glod(P, ax, ay - 26, 16, 20, 0xb8a0f0, 0.3, 3);
    P.line(ax, ay - 6, ax, ay - 30, 0xd8dce4);
    for (const [dx, dy, r] of [[0, -36, 5], [-7, -28, 4], [7, -29, 4], [-4, -20, 3], [5, -19, 3], [0, -43, 3]]) disc(P, ax + dx, ay + dy, r, r, (x, y, t) => P.px(x, y, t > 0.75 ? 0x8a70d0 : (x - ax - dx) + (y - ay - dy) < -1 ? 0xf4f0ff : 0xc8b8f8));
  }],
  vattenautomat: [12, 30, (P, ax, ay) => { lada(P, ax - 5, ay - 18, 10, 16, 2, 0xe8e8ee); disc(P, ax, ay - 23, 5, 6, (x, y, t) => P.px(x, y, t > 0.8 ? 0x2a7ab8 : (x - ax) < -1 ? 0xb8e8ff : 0x6ac0f0)); P.rect(ax - 2, ay - 11, 4, 2, 0x3a8ff0); P.px(ax - 1, ay - 10, 0xc9323a); golvSkugga(P, ax - 5, ay, 10, 2); }],
  kaffe: [30, 24, (P, ax, ay) => { lada(P, ax - 14, ay - 14, 28, 12, 3, 0x8a6a4a); lada(P, ax - 10, ay - 24, 10, 9, 1, 0x2a2a34); P.rect(ax - 8, ay - 19, 6, 3, 0x6a6e7a); P.px(ax - 5, ay - 21, 0xc9323a); for (let i = 0; i < 3; i++) { P.rect(ax + 3 + i * 4, ay - 18, 3, 3, 0xf4f1ea); P.px(ax + 3 + i * 4, ay - 18, 0xfff); } P.rect(ax + 4, ay - 22, 7, 3, 0x6a4a33); golvSkugga(P, ax - 14, ay, 28, 2); }],
  soffa: [46, 22, (P, ax, ay) => {
    const c = 0x3a5a9a, R = ramp(c), x = ax - 21;
    lada(P, x, ay - 18, 42, 8, 3, c);                              // rygg
    lada(P, x + 3, ay - 9, 36, 5, 2, mix(c, VARM, 0.08));             // sits
    lada(P, x - 2, ay - 12, 6, 10, 2, mul(c, 0.9)); lada(P, x + 38, ay - 12, 6, 10, 2, mul(c, 0.85)); // armstöd
    P.rect(x + 20, ay - 15, 8, 6, 0xe07a2e); P.box(x + 20, ay - 15, 8, 6, kant(0xe07a2e)); P.hl(x + 21, ay - 14, 6, 0xf0a05a); // kudde
    P.px(x + 2, ay - 1, R.dk); P.px(x + 39, ay - 1, R.dk); golvSkugga(P, x, ay, 42, 2);
  }],
  bokhylla: [26, 38, (P, ax, ay) => {
    const c = 0x8a5a30, x = ax - 12; lada(P, x, ay - 36, 24, 34, 2, c);
    const farger = [0xc9323a, 0x3a7bd5, 0x45b964, 0xe8b230, 0x8e5bd1, 0xe8e3d6, 0x2aa39a];
    for (let r = 0; r < 4; r++) { const yy = ay - 33 + r * 8; P.hl(x + 1, yy + 7, 22, ramp(c).dk); let bx = x + 2; while (bx < x + 21) { const bw = 2 + Math.floor(hash(bx, r, 3) * 2), bh = 5 + Math.floor(hash(bx, r, 4) * 2); const fc = farger[Math.floor(hash(bx, r, 5) * farger.length)]; P.rect(bx, yy + 7 - bh, bw, bh, fc); P.vl(bx, yy + 7 - bh, bh, mix(fc, VARM, 0.3)); bx += bw + (hash(bx, r, 6) > 0.8 ? 2 : 0); } }
    golvSkugga(P, x, ay, 24, 2);
  }],
  arkad: [20, 38, (P, ax, ay) => {
    const c = 0x5a2a8a, x = ax - 8; lada(P, x, ay - 34, 16, 32, 2, c);
    P.rect(x + 2, ay - 29, 12, 9, 0x101820); for (let i = 0; i < 4; i++) P.px(x + 4 + i * 2, ay - 26 + (i % 2), [0xffd23f, 0x4ff0ff, 0xff40c8, 0x45b964][i]);
    glod(P, ax, ay - 25, 10, 8, 0x4ff0ff, 0.2, 2);
    P.rect(x + 1, ay - 18, 14, 4, 0x3a1a5a); P.px(x + 5, ay - 17, 0xc9323a); P.px(x + 9, ay - 17, 0xffd23f); P.px(x + 11, ay - 17, 0x3a8ff0);
    P.rect(x + 2, ay - 33, 12, 2, 0xff40c8); golvSkugga(P, x, ay, 16, 2);
  }],
  varuautomat: [24, 40, (P, ax, ay) => {
    const c = 0xc9323a, x = ax - 10; lada(P, x, ay - 38, 20, 36, 2, c);
    P.rect(x + 2, ay - 34, 11, 24, 0x1a2a3a);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) P.rect(x + 3 + k * 4, ay - 33 + r * 6, 2, 4, [0xffd23f, 0x45b964, 0x3a8ff0, 0xf0a0c0][(r + k) % 4]);
    P.rect(x + 15, ay - 30, 3, 6, 0xe8e3d6); P.rect(x + 3, ay - 8, 10, 3, 0x2a1a1a); golvSkugga(P, x, ay, 20, 2);
  }],
  biljard: [48, 22, (P, ax, ay) => {
    const x = ax - 22; lada(P, x, ay - 16, 44, 7, 6, 0x6a3a1a);
    for (let j = 1; j < 5; j++) for (let i = 2; i < 42; i++) P.px(x + i, ay - 16 + j, nz(0x2f8f46, x + i, j, 3, 0.06));
    for (const [px, py] of [[2, 1], [21, 1], [41, 1], [2, 4], [21, 4], [41, 4]]) P.px(x + px, ay - 16 + py, 0x101010);
    P.px(x + 12, ay - 13, 0xffffff); P.px(x + 28, ay - 14, 0xc9323a); P.px(x + 30, ay - 13, 0xffd23f); P.line(x + 4, ay - 18, x + 13, ay - 14, 0xd8b88a);
    P.rect(x + 2, ay - 3, 3, 3, 0x4a2a12); P.rect(x + 39, ay - 3, 3, 3, 0x4a2a12); golvSkugga(P, x, ay, 44, 2);
  }],
  golvlampa: [12, 38, (P, ax, ay) => { glod(P, ax, ay - 30, 10, 9, 0xfff0c0, 0.35, 3); P.rect(ax - 3, ay - 2, 7, 2, 0x2a2a34); P.vl(ax, ay - 30, 28, 0x3a3a48); disc(P, ax, ay - 32, 5, 4, (x, y, t) => P.px(x, y, y > ay - 32 ? 0xf8e8b8 : t > 0.7 ? 0xd8c890 : 0xfff4d8)); P.hl(ax - 4, ay - 29, 9, 0xc8b070); }],
  baglampa: [28, 40, (P, ax, ay) => {
    disc(P, ax - 6, ay - 2, 5, 2, (x, y) => P.px(x, y, 0xd8dce4)); P.line(ax - 6, ay - 3, ax - 4, ay - 26, 0xb8bcc8); P.line(ax - 4, ay - 26, ax + 4, ay - 34, 0xb8bcc8); P.line(ax + 4, ay - 34, ax + 10, ay - 30, 0xb8bcc8);
    disc(P, ax + 10, ay - 27, 5, 4, (x, y, t) => P.px(x, y, y > ay - 27 ? 0xfff4d8 : t > 0.7 ? 0x8a8e9a : 0xe8ecf4)); glod(P, ax + 10, ay - 14, 12, 14, 0xfff0c0, 0.25, 3);
  }],
  ledpelare: [14, 48, (P, ax, ay) => { glod(P, ax, ay - 22, 9, 24, 0x4ff0ff, 0.25, 3); lada(P, ax - 3, ay - 44, 6, 42, 1, 0x6ab8d0); for (let j = 0; j < 40; j += 2) P.hl(ax - 2, ay - 43 + j, 4, j % 4 ? 0xbff8ff : 0x4ff0ff); P.rect(ax - 4, ay - 2, 8, 2, 0x2a2a34); }],
  matta: [48, 10, (P, ax, ay) => { for (let j = 0; j < 7; j++) for (let i = 0; i < 44; i++) { const k = i < 2 || i > 41 || j === 0 || j === 6; P.px(ax - 22 + i + Math.floor(j / 3), ay - 8 + j, k ? 0xe8b230 : nz((i + j) % 6 < 3 ? 0xa8442a : 0x8a3020, i, j, 7, 0.05)); } }],
  lyxmatta: [54, 12, (P, ax, ay) => { for (let j = 0; j < 9; j++) for (let i = 0; i < 50; i++) { const k = i < 3 || i > 46 || j < 1 || j > 7; const m = ((i - 25) ** 2 / 400 + (j - 4) ** 2 / 12) < 1; P.px(ax - 25 + i + Math.floor(j / 3), ay - 10 + j, k ? 0xffd23f : m ? (hash(i >> 1, j, 3) > 0.5 ? 0x3a3a8a : 0x2a2a6a) : nz(0x1d2a5a, i, j, 9, 0.06)); } }],
  arkivskap: [16, 28, (P, ax, ay) => { const x = ax - 7; const R = lada(P, x, ay - 26, 14, 24, 2, 0x8a8e9a); for (let k = 0; k < 3; k++) { P.hl(x, ay - 17 + k * 8 - 6, 14, R.dk); P.rect(x + 5, ay - 20 + k * 8, 4, 1, 0xd8dce4); } golvSkugga(P, x, ay, 14, 2); }],
  jordglob: [14, 26, (P, ax, ay) => { disc(P, ax, ay - 1, 5, 2, (x, y) => P.px(x, y, 0x6a4020)); P.vl(ax, ay - 8, 7, 0x8a5a30); disc(P, ax, ay - 15, 6, 6, (x, y, t) => P.px(x, y, t > 0.82 ? 0x1a4a8a : hash(x - ax >> 1, y - ay >> 1, 7) > 0.55 ? ((x - ax) + (y - ay + 15) < 0 ? 0x6fcf6a : 0x2f8f46) : ((x - ax) + (y - ay + 15) < -2 ? 0x6ab0f0 : 0x2a7ab8))); P.line(ax + 6, ay - 22, ax + 7, ay - 10, 0xd8b24a); }],
  telefonmonter: [18, 32, (P, ax, ay) => { lada(P, ax - 7, ay - 14, 14, 12, 2, 0xe8e8ee); glod(P, ax, ay - 22, 9, 10, 0xbfe0ff, 0.3, 3); P.rect(ax - 3, ay - 28, 6, 11, 0x222228); P.rect(ax - 2, ay - 27, 4, 8, 0x3a8ff0); P.px(ax - 2, ay - 27, 0x9af4ff); P.box(ax - 4, ay - 29, 8, 13, kant(0x222228)); }],
  skulptur: [22, 38, (P, ax, ay) => { lada(P, ax - 8, ay - 10, 16, 8, 2, 0x8a8e9a); disc(P, ax - 2, ay - 18, 5, 6, (x, y, t) => P.px(x, y, t > 0.8 ? 0x6a2a8a : (x - ax) < -3 ? 0xe8a0f0 : 0xb860d8)); disc(P, ax + 3, ay - 27, 4, 5, (x, y, t) => P.px(x, y, t > 0.8 ? 0x8a5a10 : (x - ax) < 2 ? 0xffe080 : 0xe8b230)); P.line(ax - 4, ay - 33, ax + 5, ay - 35, 0x3a8ff0); P.px(ax - 5, ay - 34, 0x9ac8ff); }],
  guldtelefon: [18, 34, (P, ax, ay) => { lada(P, ax - 7, ay - 12, 14, 10, 2, 0x2a2a34); glod(P, ax, ay - 22, 11, 12, 0xffd23f, 0.35, 3); const R = ramp(0xe8b230); P.rect(ax - 4, ay - 30, 8, 15, R.base); P.vl(ax - 4, ay - 30, 15, R.hi); P.vl(ax + 3, ay - 30, 15, R.lo); P.rect(ax - 3, ay - 28, 6, 9, 0x2a1a08); P.px(ax - 2, ay - 27, 0xfff0a0); P.box(ax - 5, ay - 31, 10, 17, kant(0xe8b230)); }],
  // labbet
  testbank: [38, 24, (P, ax, ay) => {
    const x = ax - 17; lada(P, x, ay - 14, 34, 4, 3, 0xd8dce4); P.rect(x + 1, ay - 7, 2, 7, 0x6a6e7a); P.rect(x + 31, ay - 7, 2, 7, 0x6a6e7a);
    P.rect(x + 3, ay - 20, 8, 6, 0x2a2a34); P.rect(x + 4, ay - 19, 6, 3, 0x45b964); for (let i = 0; i < 6; i++) P.px(x + 4 + i, ay - 18 + (i % 3 === 0 ? -1 : 0), 0xc8f0c8);
    P.rect(x + 14, ay - 18, 3, 4, 0x3a8ff0); P.rect(x + 19, ay - 19, 4, 5, 0x222228); P.px(x + 20, ay - 18, 0x4ff0ff); P.rect(x + 25, ay - 17, 6, 3, 0x2f8f46); for (let i = 0; i < 3; i++) P.px(x + 26 + i * 2, ay - 16, 0xffd23f);
    golvSkugga(P, x, ay, 34, 2);
  }],
  serverrack: [20, 42, (P, ax, ay) => {
    const x = ax - 8; lada(P, x, ay - 40, 16, 38, 2, 0x2a2a34);
    for (let k = 0; k < 8; k++) { const yy = ay - 36 + k * 4; P.hl(x + 1, yy + 3, 14, 0x1a1a22); for (let i = 0; i < 4; i++) P.px(x + 3 + i * 3, yy + 1, (k + i) % 3 === 0 ? 0x45b964 : (k * i) % 5 === 1 ? 0xffd23f : 0x2a5a2a); }
    golvSkugga(P, x, ay, 16, 2);
  }],
  skrivarlabb: [26, 32, (P, ax, ay) => {
    const x = ax - 11; lada(P, x, ay - 28, 22, 26, 2, 0xe8e8ee);
    P.rect(x + 3, ay - 24, 16, 14, 0x9ad8f0); P.box(x + 3, ay - 24, 16, 14, 0x6a8a9a); P.rect(x + 8, ay - 16, 6, 6, 0xe07a2e); P.hl(x + 8, ay - 16, 6, 0xf0a05a); P.hl(x + 5, ay - 22, 12, 0x2a2a34);
    glod(P, ax, ay - 18, 10, 8, 0x4ff0ff, 0.2, 2); P.px(x + 18, ay - 6, 0x45b964); golvSkugga(P, x, ay, 22, 2);
  }],
  robotarm: [26, 34, (P, ax, ay) => {
    lada(P, ax - 9, ay - 8, 18, 6, 2, 0x3a3a48); const c = 0xe07a2e, R = ramp(c);
    P.rect(ax - 3, ay - 12, 6, 4, R.base); P.line(ax, ay - 12, ax - 5, ay - 24, R.lo); P.line(ax + 1, ay - 12, ax - 4, ay - 24, R.base); P.line(ax - 5, ay - 25, ax + 6, ay - 30, R.base); P.line(ax - 4, ay - 24, ax + 7, ay - 29, R.hi);
    disc(P, ax - 5, ay - 25, 2, 2, (x, y) => P.px(x, y, 0x2a2a34)); P.rect(ax + 6, ay - 31, 4, 3, 0x6a6e7a); P.px(ax + 9, ay - 28, 0xd8dce4); P.px(ax + 7, ay - 28, 0xd8dce4);
  }],
  superdator: [36, 46, (P, ax, ay) => {
    for (let k = 0; k < 3; k++) { const x = ax - 16 + k * 11; lada(P, x, ay - 42, 10, 40, 2, 0x1a1a22); for (let j = 0; j < 36; j += 3) P.px(x + 2 + (j % 6 === 0 ? 0 : 5), ay - 39 + j, 0x4ff0ff); P.vl(x + 4, ay - 38, 34, 0x4ff0ff, 0.6); }
    glod(P, ax, ay - 22, 20, 22, 0x4ff0ff, 0.18, 3); golvSkugga(P, ax - 16, ay, 32, 2);
  }],
  kvantdator: [28, 48, (P, ax, ay) => {
    glod(P, ax, ay - 24, 14, 22, 0xffd23f, 0.22, 3); lada(P, ax - 9, ay - 6, 18, 4, 2, 0x3a3a48);
    for (let k = 0; k < 5; k++) { const yy = ay - 12 - k * 8, w = 18 - k * 3; disc(P, ax, yy, w / 2, 2, (x, y, t) => P.px(x, y, t > 0.8 ? 0x8a5a10 : (x - ax) < 0 ? 0xffe080 : 0xe8b230)); P.vl(ax - (w >> 2), yy, 8, 0xd8b24a); P.vl(ax + (w >> 2), yy, 8, 0xc08a1a); }
    P.vl(ax, ay - 46, 8, 0xd8dce4); P.px(ax, ay - 47, 0x9af4ff);
  }],
};
function kruka(P, ax, ay, w, h, c) {
  const R = ramp(c), x = ax - (w >> 1);
  for (let j = 0; j < h; j++) { const ins = Math.floor(j / 4); for (let i = ins; i < w - ins; i++) P.px(x + i, ay - h + j, i === ins ? R.hi : i === w - ins - 1 ? R.lo : j === 0 ? R.hi : nz(R.base, x + i, j, 3, 0.05)); }
  P.rect(x - 1, ay - h - 2, w + 2, 2, mix(c, VARM, 0.1)); P.hl(x - 1, ay - h - 2, w + 2, R.hi); P.box(x - 2, ay - h - 3, w + 4, 4, kant(c));
  P.rect(x + 2, ay, w - 2, 2, DJUP, 0.22);
}
function bladverk(P, ax, ay, klumpar) {
  for (const [dx, dy, r] of klumpar) disc(P, ax + dx, ay + dy, r, r - 1, (x, y, t) => P.px(x, y, t > 0.82 ? 0x1d5a2c : (x - ax - dx) + (y - ay - dy) < -1 ? 0x6fcf6a : hash(x, y, 9) > 0.8 ? 0x3aa050 : 0x2f8f46));
}

// ======================================================================
// VÄGGSAKER (ankare = mitt, överkant)
// ======================================================================
const VAGG = {
  whiteboard: [44, 30, (P, ax, ay) => {
    const x = ax - 21, y = ay; P.rect(x + 2, y + 2, 42, 26, DJUP, 0.18); tex(P, x, y, 42, 26, 0xf4f4f6, 16, 0.025, 0.08);
    P.box(x, y, 42, 26, 0xb8bcc8); P.hl(x, y, 42, 0xd8dce4); P.vl(x, y, 26, 0xd8dce4); P.hl(x, y + 25, 42, 0x8a8e9a);
    P.box(x + 5, y + 5, 8, 15, 0x3a7bd5); P.rect(x + 7, y + 8, 4, 8, 0x8ab8f0); P.hl(x + 16, y + 7, 12, 0x3a7bd5); P.hl(x + 16, y + 10, 9, 0x3a7bd5); P.hl(x + 16, y + 13, 14, 0x3a7bd5);
    P.line(x + 16, y + 21, x + 22, y + 17, 0x45b964); P.line(x + 22, y + 17, x + 27, y + 19, 0x45b964); P.line(x + 27, y + 19, x + 36, y + 9, 0x45b964); P.px(x + 35, y + 9, 0x45b964); P.px(x + 36, y + 10, 0x45b964);
    P.rect(x + 4, y + 26, 34, 2, 0x9a9eaa); P.hl(x + 8, y + 25, 4, 0xc9323a); P.hl(x + 14, y + 25, 4, 0x3a7bd5);
  }],
  tavla: [26, 20, (P, ax, ay) => {
    const x = ax - 11, y = ay + 1; P.rect(x + 2, y + 2, 22, 16, DJUP, 0.18); P.box(x, y, 22, 16, 0x8a5a30); P.box(x + 1, y + 1, 20, 14, 0xc69a62);
    for (let j = 0; j < 12; j++) for (let i = 0; i < 18; i++) P.px(x + 2 + i, y + 2 + j, j < 6 ? qmix(0x6aaee6, 0xf0c8a0, j / 6, x + i, y + j, 3) : j < 8 ? 0x3a6a8a : qmix(0x2f8f46, 0x1d5a2c, (j - 8) / 4, x + i, y + j, 2));
    disc(P, x + 14, y + 5, 2, 2, (px, py) => P.px(px, py, 0xfff4e0));
  }],
  neonskylt: [56, 18, (P, ax, ay) => {
    const x = ax - 26, y = ay + 2; glod(P, ax, y + 6, 30, 11, 0xff40c8, 0.3, 3);
    P.rect(x, y, 52, 13, 0x14102a); P.box(x, y, 52, 13, 0xff40c8); P.box(x + 1, y + 1, 50, 11, 0x8a2a6a);
    // "MOBIL" i neonrör
    const t = ['#...#..##..###..#.#....', '##.##.#..#.#..#.#.#....', '#.#.#.#..#.###..#.#....', '#...#.#..#.#..#.#.#....', '#...#..##..###..#.####.'];
    for (let j = 0; j < 5; j++) for (let i = 0; i < 23; i++) if (t[j][i] === '#') { P.px(x + 4 + i * 2, y + 4 + j, 0xffd8f4); P.px(x + 5 + i * 2, y + 4 + j, 0xff40c8); }
  }],
  kristallkrona: [34, 26, (P, ax, ay) => {
    P.vl(ax, ay, 6, 0xd8b24a); glod(P, ax, ay + 14, 18, 12, 0xfff0c0, 0.3, 3);
    disc(P, ax, ay + 9, 12, 3, (x, y, t) => P.px(x, y, t > 0.7 ? 0x8a5a10 : 0xe8b230));
    for (let i = -10; i <= 10; i += 3) { const l = 6 + ((i + 10) % 6); for (let j = 0; j < l; j++) P.px(ax + i, ay + 11 + j, j % 2 ? 0xf4f0ff : 0xc8d8f8); P.px(ax + i, ay + 11 + l, 0xffffff); }
  }],
};

const ALLA = { ...GOLV, ...VAGG };
export const harSprite = (id) => !!ALLA[id];
export function mobelSprite(id) {
  const d = ALLA[id]; if (!d) return null;
  const [w, h, rita] = d, golv = !!GOLV[id];
  // ankare: golv = (mitt, botten), vägg = (mitt, topp)
  return sprite('m-' + id, w + 4, h + 4, Math.round((w + 4) / 2), golv ? h + 1 : 1, rita);
}
export function ritaMobel(ctx, id, x, y) { const s = mobelSprite(id); if (s) ritaSprite(ctx, s, x, y); return s; }
// liten ikon för katalogkortet (spriten nedskalad till rutan, utan att sudda: hela pixlar)
export function mobelIkon(id) { return mobelSprite(id); }
export const MOBELSTORLEK = (id) => { const d = ALLA[id]; return d ? { w: d[0], h: d[1] } : { w: 16, h: 16 }; };
