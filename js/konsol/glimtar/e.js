// Spelglimtar, grupp E: TJUVARNAS HAV (Sea of Thieves), TAKTSABEL (Beat Saber), FORSA HORISONT 5 (Forza Horizon 5).
// Samma format som BAS i ../glimtar.js. Verktygen finns i ../pix.js. Alla slingar räknar med f = 0..1 genom slingan,
// och allt som rör sig går ett helt antal varv per slinga så att den börjar om sömlöst.
import { SMALL, BIG, R, P, T, TW, TK, spr, tri, mod, disc, hash, toning, fast } from '../pix.js';

// rak linje pixel för pixel
const linje = (x, x0, y0, x1, y1, f) => { const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))); for (let i = 0; i <= n; i++) P(x, x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, f); };

// ---------- 2018 TJUVARNAS HAV (Sea of Thieves) ----------
const TH_SKALLE = [   // dödskallemolnet över fortet, ritas i dubbel storlek
  '....######....',
  '..##########..',
  '.############.',
  '##############',
  '###...##...###',
  '##....##....##',
  '###...##...###',
  '######..######',
  '.############.',
  '..##.##.##.#..',
  '...########...',
];
const TH_EMBLEM = ['.#####.', '#######', '#..#..#', '#######', '.##.##.', '..###..'];   // skallen på storseglet
const TH_NOT = ['.##', '.#.', '.#.', '##.', '##.'];
const TH_VAG = [   // vågornas färger från fjärran till nära: [kropp, ljus kam]
  ['#1c7488', '#2a8c9a'], ['#1e7e90', '#2e98a2'], ['#2088a0', '#38a6ac'], ['#2294a4', '#42b4b4'], ['#24a0a8', '#4cc2bc'],
  ['#28acac', '#58cec2'], ['#2cb8b0', '#66d8c8'], ['#30c2b4', '#74e0ce'], ['#36ccb8', '#84e8d4'], ['#3cd4bc', '#94f0da'],
];
function thPalm(y, px, py, s) {
  for (let j = 0; j < 11; j++) P(y, px + Math.round((s * j * j) / 36), py - j, j % 3 ? '#5a3a24' : '#4a2e1c');
  const tx = px + Math.round((s * 100) / 36), ty = py - 11;
  for (const [dx, dy] of [[-6, 3], [-5, -1], [-1, -3], [3, -2], [6, 2], [3, 3], [-3, 2]]) for (let i = 1; i <= 5; i++) P(y, tx + Math.round((dx * i) / 5), ty + Math.round((dy * i) / 5 + (i * i) / 10), i < 3 ? '#2e6a36' : '#3a823e');
}
function thPirat(x, px, py, rock, hatt) {
  if (hatt) { R(x, px - 2, py + 1, 5, 1, '#16121a'); R(x, px - 1, py, 3, 1, '#16121a'); }
  else { R(x, px - 1, py + 1, 3, 1, '#c8282c'); P(x, px + 2, py + 2, '#c8282c'); }
  R(x, px - 1, py + 2, 3, 2, '#f0b48a'); P(x, px, py + 3, '#7a4422'); P(x, px + 1, py + 2, '#2a1a14');
  for (let j = 0; j < 3; j++) R(x, px - 1, py + 4 + j, 3, 1, j % 2 ? rock : '#ece4d4');
  R(x, px - 1, py + 7, 3, 2, '#3a3050'); P(x, px - 1, py + 9, '#1a1414'); P(x, px + 1, py + 9, '#1a1414');
}
function thSkepp(x, sx, sy, f, v) {
  const TRA = '#7a4426', MORK = '#552c16', MAST = '#5a3418', GULD = '#e8b040', SEGEL = '#1c1c26', VIT = '#ece4d0';
  // tågvirket bakom seglen
  linje(x, sx + 1, sy - 66, sx - 29, sy - 17, '#3a2418'); linje(x, sx + 1, sy - 66, sx + 41, sy - 15, '#3a2418');
  // masten med utkiken
  R(x, sx, sy - 70, 2, 61, MAST); R(x, sx - 2, sy - 67, 6, 3, '#6a3c1e'); R(x, sx - 2, sy - 67, 6, 1, '#8a5228');
  // flaggan i toppen fladdrar framåt
  for (let i = 0; i < 10; i++) { const w = Math.round(Math.sin(v * 3 - i * 0.7)); R(x, sx + 2 + i, sy - 75 + w, 1, 5 - Math.floor(i / 4), '#141418'); }
  P(x, sx + 4, sy - 74 + Math.round(Math.sin(v * 3 - 1.4)), VIT); P(x, sx + 5, sy - 74 + Math.round(Math.sin(v * 3 - 2.1)), VIT);
  // förseglet: triangel från masttoppen ner till bogsprötet
  for (let yy = sy - 60; yy <= sy - 16; yy++) {
    const p = (yy - (sy - 60)) / 44, lx = sx + 3 + Math.round(p * 3), rx = sx + 3 + Math.round(p * 37 + Math.sin(p * Math.PI) * 3);
    R(x, lx, yy, rx - lx, 1, '#262634'); P(x, rx - 1, yy, '#3c3c4e');
  }
  // storseglet buktar i vinden
  R(x, sx - 18, sy - 57, 40, 2, MAST);
  for (let j = 0; j < 34; j++) {
    const b = Math.sin((j / 33) * Math.PI) * 5 + Math.sin(v * 2 + j * 0.25) * 0.6, yy = sy - 55 + j, sid = Math.max(0, j - 30);
    const lx = sx - 16 + Math.round(b * 0.4) + sid, rx = sx + 20 + Math.round(b) - sid;
    R(x, lx, yy, rx - lx, 1, SEGEL);
    P(x, lx, yy, '#3a3a4c'); P(x, lx + Math.round((rx - lx) * 0.3), yy, '#121218'); P(x, lx + Math.round((rx - lx) * 0.72), yy, '#121218');
    if (j === 33) R(x, lx, yy, rx - lx, 1, '#3a3a48');
  }
  spr(x, TH_EMBLEM, sx + 1 + Math.round(Math.sin(v * 2 + 4) * 0.6), sy - 44, { '#': VIT });
  // toppseglet
  R(x, sx - 12, sy - 64, 28, 1, MAST);
  for (let j = 0; j < 6; j++) { const rx = sx + 13 + Math.round(Math.sin((j / 5) * Math.PI) * 2); R(x, sx - 10, sy - 63 + j, rx - sx + 10, 1, SEGEL); P(x, sx - 10, sy - 63 + j, '#3a3a4c'); }
  // bogsprötet
  linje(x, sx + 27, sy - 9, sx + 42, sy - 15, MAST); linje(x, sx + 27, sy - 8, sx + 42, sy - 14, MORK);
  // skrovet: aktern högre med fönster, bogen sticker ut framåt
  for (let j = 0; j < 10; j++) {
    const yy = sy - 9 + j, lx = sx - 28 + (j > 4 ? Math.round((j - 4) * 1.6) : 0), rx = sx + 30 - Math.round(j * 0.9);
    R(x, lx, yy, rx - lx, 1, j === 0 ? '#5a3018' : j === 2 ? GULD : j > 7 ? '#3e2212' : j % 3 === 0 ? MORK : TRA);
    P(x, lx, yy, '#3a1e10');
  }
  for (let j = 0; j < 6; j++) { const yy = sy - 15 + j; R(x, sx - 31 + Math.floor(j / 3), yy, 18, 1, j === 0 ? '#5a3018' : j === 4 ? GULD : TRA); }
  R(x, sx - 31, sy - 17, 18, 1, '#6a3c1e'); for (let i = 0; i < 18; i += 3) P(x, sx - 31 + i, sy - 16, '#6a3c1e');
  R(x, sx - 13, sy - 12, 41, 1, '#6a3c1e'); for (let i = 0; i < 40; i += 4) P(x, sx - 13 + i, sy - 11, '#6a3c1e');
  for (const wx of [-28, -23, -18]) { R(x, sx + wx, sy - 13, 2, 2, '#ffd870'); P(x, sx + wx, sy - 13, '#fff4c0'); }
  // lyktan i aktern flimrar
  const fl = Math.floor(f * 24) % 3;
  R(x, sx - 33, sy - 21, 2, 3, fl ? '#ffd060' : '#ffe8a0'); P(x, sx - 33, sy - 22, '#2a1a10');
  for (const [dx, dy] of [[-1, 0], [2, 0], [0, -1], [1, 3]]) P(x, sx - 33 + dx, sy - 21 + dy, 'rgba(255,210,120,0.45)');
  // skattkistan på däck
  R(x, sx - 9, sy - 13, 6, 3, '#7a4a20'); R(x, sx - 9, sy - 14, 6, 1, '#a0682c'); R(x, sx - 9, sy - 12, 6, 1, GULD); P(x, sx - 6, sy - 15, Math.floor(f * 12) % 2 ? '#fff4a0' : '#ffd84a');
  // ratten och piraten som styr
  const a = Math.sin(v) * 0.8;
  for (let k = 0; k < 4; k++) { const vv = a + (k * Math.PI) / 4; P(x, sx - 17 + Math.cos(vv) * 3, sy - 20 + Math.sin(vv) * 3, '#8a5228'); P(x, sx - 17 - Math.cos(vv) * 3, sy - 20 - Math.sin(vv) * 3, '#8a5228'); P(x, sx - 17 + Math.cos(vv) * 4.4, sy - 20 + Math.sin(vv) * 4.4, '#6a3c1e'); P(x, sx - 17 - Math.cos(vv) * 4.4, sy - 20 - Math.sin(vv) * 4.4, '#6a3c1e'); }
  P(x, sx - 17, sy - 20, GULD); R(x, sx - 17, sy - 16, 1, 1, MAST);
  thPirat(x, sx - 22, sy - 25, '#c83030', true); P(x, sx - 20, sy - 21, '#f0b48a');
  // piraten vid bogen spelar dragspel, noterna stiger
  thPirat(x, sx + 15, sy - 19, '#2a60b0', false);
  const dw = 3 + Math.round(Math.sin(v * 6) * 1.5);
  R(x, sx + 13 - dw, sy - 15, dw, 3, '#a83030'); for (let i = 0; i < dw; i += 2) P(x, sx + 13 - dw + i, sy - 14, '#e8d8a0');
  for (let i = 0; i < 3; i++) {
    const a2 = mod(f * 3 + i / 3, 1); if (a2 > 0.9) continue;
    spr(x, TH_NOT, sx + 9 + Math.round(Math.sin(a2 * 6 + i) * 3) - Math.round(a2 * 6), sy - 24 - Math.round(a2 * 26), { '#': a2 > 0.6 ? '#e8d890' : '#fff4b0' });
  }
}
function thVag(x, k, v) {
  const W = 192, yk = 52 + Math.round(58 * (k / 10) ** 1.6), a = 0.6 + k * 0.5, lam = 10 + k * 7, tj = 1 + Math.floor(k * 0.5), m = (k % 2) + 1, [kr, lj] = TH_VAG[k];
  for (let i = 0; i < W; i++) {
    const s = Math.sin((i * Math.PI * 2) / lam + v * m + k * 1.9), s2 = Math.sin((i * Math.PI * 2) / (lam * 0.47) - v * 2 + k), c = Math.round(yk + a * (s + 0.35 * s2));
    R(x, i, c, 1, tj + 2, kr); P(x, i, c, lj);
    if (k > 2) P(x, i, c + 1, lj);
    if (s < -0.72) { P(x, i, c, '#e4fff6'); if (k > 4 && s < -0.86) P(x, i, c - 1, '#e4fff6'); }
  }
}
function tjuvarnasHav(x, t) {
  const W = 192, H = 108, HOR = 50, PER = 6, f = mod(t, PER) / PER, v = f * Math.PI * 2, fr = Math.floor(f * 36);
  const bak = fast('tjuvhav', W, H, (y) => {
    toning(y, 0, 0, W, HOR, ['#2a2a74', '#46388a', '#7e4894', '#c85a80', '#f08a62', '#ffbc72', '#ffe0a0']);
    // solen vid horisonten med glorior
    disc(y, 132, HOR, 20, 'rgba(255,214,150,0.22)'); disc(y, 132, HOR, 14, 'rgba(255,232,170,0.35)');
    disc(y, 132, HOR, 10, '#ffe7a6'); disc(y, 132, HOR, 8, '#fff6d4');
    // moln med rosa underkant från solnedgången
    for (const [cx, cy, s] of [[72, 14, 1], [162, 20, 0.8], [104, 33, 0.6]]) {
      const delar = [[0, 2, 5], [7, -1, 6], [15, 1, 5], [21, 3, 4], [-6, 4, 3]];
      for (const [dx, dy, r] of delar) disc(y, Math.round(cx + dx * s), Math.round(cy + dy * s + 1), Math.round(r * s), '#e48a94');
      for (const [dx, dy, r] of delar) disc(y, Math.round(cx + dx * s), Math.round(cy + dy * s - 1), Math.round(r * s), '#fbd2c4');
    }
    // dödskallemolnet: spelets tecken på att ett fort ska intas
    TH_SKALLE.forEach((rad, j) => { for (let i = 0; i < rad.length; i++) if (rad[i] === '#') R(y, 12 + i * 2, 8 + j * 2, 2, 2, j > 7 ? '#86caa8' : '#b2ecd0'); });
    // havet
    toning(y, 0, HOR, W, H - HOR, ['#16607a', '#1a7c8c', '#20999e', '#28b4ae', '#34c8b8']);
    // öar vid horisonten: sandstrand, grön kulle, palmer och fortet under skallen
    const o = (cx, w, h) => { for (let j = 0; j < h; j++) { const hw = Math.round(w * Math.sqrt(1 - (j / h) ** 2)); R(y, cx - hw, HOR - j, hw * 2, 1, j < 2 ? '#f0cc8a' : j < 4 ? '#5c9a48' : '#4a8440'); } };
    o(28, 24, 9); o(178, 12, 5); o(92, 6, 3);
    R(y, 22, HOR - 15, 12, 7, '#6a6478'); R(y, 20, HOR - 18, 4, 10, '#5a5468'); R(y, 32, HOR - 18, 4, 10, '#5a5468');
    for (const bx of [20, 22, 32, 34]) P(y, bx, HOR - 19, '#5a5468'); R(y, 27, HOR - 12, 2, 4, '#2a2430');
    thPalm(y, 8, HOR - 5, 1); thPalm(y, 44, HOR - 6, -1); thPalm(y, 174, HOR - 4, 1); thPalm(y, 182, HOR - 3, -1);
  });
  x.drawImage(bak, 0, 0);
  for (let k = 0; k < 7; k++) thVag(x, k, v);
  // solens glitter på vattnet
  for (let j = 0; j < 11; j++) {
    const Y = HOR + 2 + j * 2 + Math.floor((j * j) / 10), w = 12 - j;
    for (let k = 0; k < 3; k++) { const h = hash(j * 7 + k, fr); if (h < 0.45) continue; R(x, 132 - w + Math.floor(hash(k, j + fr * 3) * w * 2), Y, 2 + Math.floor(h * 4), 1, h > 0.82 ? '#fff6d0' : '#ffd890'); }
  }
  // skeppet guppar
  const sx = 92, sy = 84 + Math.round(Math.sin(v * 2) * 1.2);
  thSkepp(x, sx, sy, f, v);
  // skum längs vattenlinjen, kölvatten bakåt och stänk vid bogen
  for (let i = 0; i < 52; i++) if (hash(i, fr) > 0.35) P(x, sx - 28 + i, sy + (hash(i, fr + 1) > 0.5 ? 0 : 1), '#e8fff8');
  for (let i = 0; i < 24; i++) { const wx = sx - 30 - mod(i * 3 + f * 72, 72); P(x, wx, sy + 1 + (i % 2), i % 3 ? '#c8f8ec' : '#e8fff8'); }
  for (let i = 0; i < 8; i++) { const a = mod(f * 8 + i / 8, 1); P(x, sx + 25 + a * 9 + (i % 3), sy - 1 - a * 7 + a * a * 9, '#f0fffa'); }
  for (let k = 7; k < 10; k++) thVag(x, k, v);
  // måsar
  for (let i = 0; i < 3; i++) {
    const gx = mod(f * (W + 40) * (i === 1 ? 2 : 1) + i * 70, W + 40) - 20, gy = 22 + i * 7 + Math.round(Math.sin(v * 3 + i) * 2), upp = Math.floor(f * 48 + i) % 2;
    spr(x, upp ? ['##...##', '..#.#..', '...#...'] : ['.......', '.##.##.', '#..#..#'], Math.round(gx), gy, { '#': '#fff8f0' });
  }
}

// ---------- 2019 TAKTSABEL (Beat Saber) ----------
const TS_FARG = [
  { bas: '#e01c3c', ljus: '#ff7a90', mork: '#6a0818', glod: '#ff3050' },
  { bas: '#1a6aff', ljus: '#8ab8ff', mork: '#0a2468', glod: '#3c8cff' },
];
const TS_NOTER = [   // [träfftid i slingan (s), fil, rad, färg 0 = röd 1 = blå, huggriktning n/u/v/h]
  [0.25, -0.5, 0, 0, 'n'], [0.25, 0.5, 0, 1, 'n'], [0.85, -1.5, 1, 0, 'v'], [1.2, 1.5, 1, 1, 'h'],
  [1.75, -0.5, 2, 0, 'u'], [2.05, 0.5, 2, 1, 'u'], [2.6, -1.5, 0, 0, 'n'], [2.6, 1.5, 0, 1, 'n'], [3.2, 0.5, 1, 1, 'h'], [3.5, -0.5, 1, 0, 'v'],
];
const TS_RIKT = { n: [0, 1], u: [0, -1], v: [-1, 0], h: [1, 0] };
const TS = { W: 192, H: 108, VX: 96, VY: 44, F: 64, ZH: 1.7, FART: 13, PER: 4 };
const tsSkarm = (lane, rad, z) => [TS.VX + (lane * 0.6 * TS.F) / z, TS.VY + ((1 - (0.3 + rad * 0.5)) * TS.F) / z, (0.46 * TS.F) / z];
function tsKloss(x, cx, cy, s, c, rikt) {
  const n = Math.max(1, Math.round(s)), X0 = Math.round(cx - n / 2), Y0 = Math.round(cy - n / 2);
  if (n <= 2) { R(x, X0, Y0, n, n, c.glod); return; }
  R(x, X0 - 1, Y0 - 1, n + 2, n + 2, 'rgba(255,255,255,0.08)');
  R(x, X0, Y0, n, n, c.mork); R(x, X0 + 1, Y0 + 1, n - 2, n - 2, c.bas); R(x, X0 + 1, Y0 + 1, n - 2, 1, c.ljus); R(x, X0 + 1, Y0 + 1, 1, n - 2, c.ljus);
  // vit pil (fylld kil) mot huggriktningen
  const a = Math.max(1, Math.floor(n * 0.2)), [dx, dy] = TS_RIKT[rikt], ox = Math.round(cx + dx * n * 0.14), oy = Math.round(cy + dy * n * 0.14);
  for (let i = 0; i <= a; i++) for (let k = -(a - i); k <= a - i; k++) {
    const u = k, w = i - a / 2;   // u längs kilens bas, w mot spetsen
    P(x, ox + (dy !== 0 ? u : w * dx), oy + (dy !== 0 ? w * dy : u), '#ffffff');
  }
}
// halva klossen efter hugget: rektangel med glödande snittkant
function tsHalva(x, X, Y, w, h, c, kant, tona) {
  w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h)); X = Math.round(X); Y = Math.round(Y);
  R(x, X, Y, w, h, tona ? c.mork : c.bas); if (!tona && w > 2 && h > 2) { R(x, X, Y, w, 1, c.ljus); }
  if (kant === 'v') R(x, X, Y, 1, h, '#ffffff'); if (kant === 'h') R(x, X + w - 1, Y, 1, h, '#ffffff');
  if (kant === 'u') R(x, X, Y, w, 1, '#ffffff'); if (kant === 'n') R(x, X, Y + h - 1, w, 1, '#ffffff');
}
// sabeln från handen (under bildkanten) längs (dx, dy), len pixlar lång: glöd, kärna och fäste
function tsBlad(x, hx, hy, dx, dy, len, c, svag) {
  if (svag) { for (let i = 14; i < len; i += 1) P(x, hx + dx * i, hy + dy * i, c.mork); return; }
  for (let i = 12; i < len; i++) R(x, hx + dx * i - 1, hy + dy * i - 1, 4, 4, c.mork);
  for (let i = 12; i < len; i++) R(x, hx + dx * i, hy + dy * i, 2, 2, c.glod);
  for (let i = 12; i < len; i += 1) P(x, hx + dx * i + 0.5, hy + dy * i + 0.5, c.ljus);
  for (let i = 0; i < 13; i++) R(x, hx + dx * i, hy + dy * i, 3, 3, i % 4 ? '#3a3a44' : '#7a7a88');   // fästet
}
function taktsabel(x, t) {
  const { W, H, VX, VY, F, ZH, FART, PER } = TS, tt = mod(t, PER), v = (tt / PER) * Math.PI * 2, slag = 1 - mod(tt, 0.5) / 0.5;
  const bak = fast('taktsabel', W, H, (y) => {
    R(y, 0, 0, W, H, '#04040c');
    toning(y, 0, VY, W, H - VY, ['#06061a', '#0b0b24', '#121230']);
    // golvets rutnät i perspektiv
    for (let k = -9; k <= 9; k++) for (let j = 1; j < H - VY; j++) P(y, VX + ((k * j) / (H - VY)) * 26, VY + j, '#15153a');
    for (let z = 1.4; z < 30; z *= 1.35) R(y, 0, VY + F / z, W, 1, '#121234');
    // banan där klossarna kommer
    for (let j = 1; j < H - VY; j++) { const p = j / (H - VY), hw = p * 50; R(y, VX - hw, VY + j, hw * 2, 1, '#090914'); P(y, VX - hw, VY + j, '#3a4878'); P(y, VX + hw, VY + j, '#3a4878'); }
    // korridorens ramar bakåt, svagt röda till vänster och blå till höger
    for (const z of [3, 5, 8, 13, 21]) {
      const hw = (1.9 * F) / z, top = VY - (1.7 * F) / z, bot = VY + F / z;
      R(y, VX - hw, top, hw, 1, '#2a0a1c'); R(y, VX, top, hw, 1, '#0a1a3c'); R(y, VX - hw, top, 1, bot - top, '#2a0a1c'); R(y, VX + hw, top, 1, bot - top, '#0a1a3c');
    }
  });
  x.drawImage(bak, 0, 0);
  // lasrar längst bort som sveper i takt: röda från vänster vägg, blå från höger
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) {
    const c = TS_FARG[s < 0 ? 0 : 1], x0 = VX + s * (34 + i * 10), y0 = VY - 2, vv = -Math.PI / 2 + s * (0.35 + i * 0.22 + Math.sin(v * 2 + i * 1.7) * 0.28);
    const ljus = slag > 0.55 && (i + Math.floor(tt * 2)) % 2 === 0;
    for (let j = 2; j < 130; j += ljus ? 1 : 2) { const px = x0 + Math.cos(vv) * j, py = y0 + Math.sin(vv) * j; if (py < -1) break; P(x, px, py, ljus ? c.glod : c.mork); }
  }
  // neonlister längs golvet blinkar i takten
  for (let j = 1; j < H - VY; j++) { const p = j / (H - VY); P(x, VX - p * 96, VY + j, slag > 0.5 ? '#ff3050' : '#a01830'); P(x, VX + p * 96, VY + j, slag > 0.5 ? '#3c8cff' : '#1c4cb0'); P(x, VX - p * 96, VY - j * 0.9, '#801028'); P(x, VX + p * 96, VY - j * 0.9, '#183a90'); }
  // loggan längst bort: TAKT i rött och SABEL i blått neon, E:et flimrar som i originalet
  const LOGO = [{ mork: '#3a0614', glod: '#c8183a' }, { mork: '#0a1a50', glod: '#2a64d8' }];
  const neon = (s, X, Y, c, k = 2) => { for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) T(x, s, X + dx, Y + dy, c.mork, BIG, k); T(x, s, X, Y, c.glod, BIG, k); };
  const tw = TW('TAKT', BIG, 2), sw = TW('SABEL', BIG, 2);
  neon('TAKT', VX - tw / 2, 3, LOGO[0]);
  const sx0 = VX - sw / 2, ex = sx0 + TW('SAB', BIG, 2) + 2, flimmer = mod(tt, 2) > 1.55 && Math.floor(tt * 20) % 2;
  neon('SAB', sx0, 20, LOGO[1]); neon('L', ex + TW('E', BIG, 2) + 2, 20, LOGO[1]);
  if (!flimmer) neon('E', ex, 20, LOGO[1]); else T(x, 'E', ex, 20, '#101838', BIG, 2);
  // klossarna: närmar sig, huggs itu och flyger isär
  const lista = TS_NOTER.map(([tid, lane, rad, fg, rikt]) => ({ tau: mod(tt - tid + PER / 2, PER) - PER / 2, lane, rad, c: TS_FARG[fg], fg, rikt }));
  const z = (n) => (n.tau < 0 ? ZH - n.tau * FART : ZH - n.tau * 1.5);
  lista.filter((n) => n.tau < 0.34 && z(n) < 26).sort((a, b) => z(b) - z(a)).forEach((n) => {
    const [cx, cy, s] = tsSkarm(n.lane, n.rad, z(n));
    if (n.tau < 0) { tsKloss(x, cx, cy, s, n.c, n.rikt); return; }
    const sep = n.tau * 50, fall = n.tau * n.tau * 160, tona = n.tau > 0.2, lod = n.rikt === 'n' || n.rikt === 'u';
    if (lod) { tsHalva(x, cx - s / 2 - sep, cy - s / 2 + fall, s / 2, s, n.c, tona ? '' : 'h', tona); tsHalva(x, cx + sep, cy - s / 2 + fall, s / 2, s, n.c, tona ? '' : 'v', tona); }
    else { tsHalva(x, cx - s / 2 + sep * 0.3, cy - s / 2 - sep + fall, s, s / 2, n.c, tona ? '' : 'n', tona); tsHalva(x, cx - s / 2 + sep * 0.3, cy + sep + fall, s, s / 2, n.c, tona ? '' : 'u', tona); }
    // gnistor och poäng
    const [hx, hy] = tsSkarm(n.lane, n.rad, ZH), [rx, ry] = TS_RIKT[n.rikt];
    if (n.tau < 0.3) for (let i = 0; i < 8; i++) { const sp = (i - 3.5) * 0.35; P(x, hx + (rx + -ry * sp) * n.tau * 110, hy + (ry + rx * sp) * n.tau * 110 + n.tau * n.tau * 120, i % 2 ? n.c.ljus : '#ffffff'); }
    T(x, '+115', hx - 7, hy - 14 - n.tau * 30, n.tau < 0.3 ? '#ffffff' : '#8a8aa8');
  });
  // sablarna: röd i vänster hand, blå i höger. De sveper genom klossen i pilens riktning.
  for (const fg of [0, 1]) {
    const c = TS_FARG[fg], hand = fg ? [130, 118] : [62, 118], vila = fg ? [146, 46] : [46, 46];
    // spetsen: vilar snett uppåt-utåt, sveper genom närmaste kloss av samma färg i pilens riktning
    const spets = (dt) => {
      let bast = null;
      for (const n of lista) if (n.fg === fg) { const tau = n.tau - dt; if (!bast || Math.abs(tau) < Math.abs(bast.tau)) bast = { ...n, tau }; }
      let w = Math.max(0, 1 - Math.abs(bast.tau) / 0.3); w = w * w * (3 - 2 * w);
      const [bx, by] = tsSkarm(bast.lane, bast.rad, ZH), [rx, ry] = TS_RIKT[bast.rikt], d = Math.max(-1, Math.min(1, bast.tau / 0.08)) * 22;
      return [[vila[0] + (bx + rx * d - vila[0]) * w, vila[1] + (by + ry * d - vila[1]) * w + Math.sin(v * 2 + fg * 2) * 3], w];
    };
    const blad = (p, svag) => { const dx = p[0] - hand[0], dy = p[1] - hand[1], l = Math.hypot(dx, dy) || 1; tsBlad(x, hand[0], hand[1], dx / l, dy / l, l + 14, c, svag); };
    const [nu, w] = spets(0);
    if (w > 0.25) for (const dt of [0.06, 0.03]) blad(spets(dt)[0], true);
    blad(nu, false);
  }
  // HUD: kombo till vänster, poäng och multiplikator till höger, energi nertill
  const blixt = lista.some((n) => n.tau >= 0 && n.tau < 0.12);
  T(x, 'KOMBO', 10, 64, '#8a90c0'); T(x, '128', 10, 71, blixt ? '#ffffff' : '#c8ccf0', BIG);
  const po = '41 290', pw = TW(po, BIG); T(x, po, W - 10 - pw, 64, '#ffffff', BIG);
  const mx = W - 22, my = 86;
  for (let a = 0; a < 40; a++) { const vv = -Math.PI / 2 + (a / 40) * Math.PI * 2; P(x, mx + Math.cos(vv) * 8, my + Math.sin(vv) * 8, a / 40 < 0.3 + 0.6 * (tt / PER) ? '#ffffff' : '#3a3a58'); }
  T(x, '×8', mx - 4, my - 2, '#ffffff');
  R(x, 72, 103, 48, 3, '#1c1c30'); R(x, 73, 104, 34, 1, '#e8ecff');
}

// ---------- 2021 FORSA HORISONT 5 (Forza Horizon 5) ----------
const FH_SAKER = [   // vägkantens saker: [plats längs vägen 0..40, sida i halva vägbredder från mitten, typ]
  [2, -1.7, 'kaktus'], [5, 1.45, 'flagga'], [8, -1.45, 'flagga'], [11, 1.9, 'kaktus'], [14, -2.3, 'kaktus'], [17, 1.45, 'flagga'],
  [20, 0, 'bage'], [23, -1.6, 'kaktus'], [26, 1.7, 'kaktus'], [29, -1.45, 'flagga'], [32, 2.2, 'kaktus'], [35, -1.9, 'kaktus'], [38, 1.45, 'flagga'],
];
const FH_FLAGG = ['#ff2e8e', '#ff8a1e', '#22c4e8'];
function fhKaktus(x, X, Y, sc) {
  const h = Math.round(60 * sc), w = Math.max(1, Math.round(6 * sc));
  if (h < 3) { R(x, X, Y - h, 1, h, '#4a7a40'); return; }
  const stam = (sx, sy, sw, sh) => { R(x, sx, sy, sw, sh, '#3a8044'); if (sw > 2) R(x, sx + sw - Math.max(1, Math.round(sw / 3)), sy, Math.max(1, Math.round(sw / 3)), sh, '#7ab85a'); };
  stam(X - w / 2, Y - h, w, h);
  const aw = Math.max(1, Math.round(w * 0.7));
  stam(X - w / 2 - w * 1.2, Y - h * 0.62, w * 1.2, aw); stam(X - w / 2 - w * 1.2, Y - h * 0.82, aw, h * 0.22);
  stam(X + w / 2, Y - h * 0.48, w, aw); stam(X + w / 2 + w - aw, Y - h * 0.72, aw, h * 0.26);
  R(x, X - w / 2, Y - 1, w * 2, 1, 'rgba(60,30,30,0.35)');
}
function fhFlagga(x, X, Y, sc, i, v) {
  const h = Math.round(64 * sc), fw = Math.max(1, Math.round(10 * sc)), fh = Math.round(h * 0.68);
  R(x, X, Y - h, Math.max(1, Math.round(sc * 1.5)), h, '#e4e0e8');
  for (let j = 0; j < fh; j++) {
    const p = j / Math.max(1, fh), b = Math.round(Math.sin(p * Math.PI) * fw * 0.25 + Math.sin(v * 6 + p * 4) * sc * 1.5), w = Math.max(1, Math.round(fw * (1 - p * 0.35)) + b);
    R(x, X + 1, Y - h + 1 + j, w, 1, FH_FLAGG[i % 3]); if (j % 6 === 2 && fw > 4) R(x, X + 1, Y - h + 1 + j, w, 1, '#ffffff');
  }
}
function fhBage(x, cx, Y, half, sc) {
  const ah = Math.round(54 * sc), pw = Math.max(1, Math.round(5 * sc)), bt = Math.max(1, Math.round(12 * sc)), lx = cx - half * 1.2, rx = cx + half * 1.2;
  for (const px of [lx - pw, rx]) { R(x, px, Y - ah, pw, ah, '#d81e78'); if (pw > 2) R(x, px, Y - ah, 1, ah, '#ff7ab8'); }
  R(x, lx - pw, Y - ah - bt, rx - lx + pw * 2, bt, '#ff2e8e'); R(x, lx - pw, Y - ah - bt, rx - lx + pw * 2, Math.max(1, Math.round(bt / 4)), '#ff9a2e');
  R(x, lx - pw, Y - ah - 1, rx - lx + pw * 2, 1, '#8a0c48');
  if (bt >= 7) { const s = 'HORISONT', w = TW(s); T(x, s, cx - w / 2, Y - ah - bt + Math.round(bt / 2) - 1, '#ffffff'); }
  if (bt >= 3) for (let i = lx; i < rx; i += Math.max(3, bt)) P(x, i, Y - ah - 1, '#fff0a0');
}
function forsa(x, t) {
  const W = 192, H = 108, HOR = 46, PER = 5, f = mod(t, PER) / PER, v = f * Math.PI * 2;
  const L = 40, fard = f * L * 3;                       // tre varv av vägkanten per slinga
  const kurva = Math.sin(v) * 0.9 + Math.sin(v * 2 + 1) * 0.3;
  const bak = fast('forsa', W + 64, H, (y) => {
    toning(y, 0, 0, W + 64, HOR, ['#3c4aa8', '#6a5aac', '#b46a96', '#e88a78', '#ffb470', '#ffd890', '#ffe8b8']);
    // solen lågt över bergen
    disc(y, 190, 33, 20, 'rgba(255,230,170,0.2)'); disc(y, 190, 33, 13, 'rgba(255,240,190,0.4)'); disc(y, 190, 33, 7, '#fff8dc');
    // avlägsna berg i lila dis
    for (let i = 0; i < W + 64; i++) { const h = Math.round(9 + 5 * Math.sin(i / 23) + 3 * Math.sin(i / 9 + 1)); R(y, i, HOR - h, 1, h, '#a8708e'); }
    // vulkanen med rökplym
    for (let j = 0; j < 28; j++) { const hw = 3 + Math.round(j * 1.55); R(y, 70 - hw, HOR - 28 + j, hw * 2, 1, '#8a5a78'); R(y, 70, HOR - 28 + j, hw, 1, '#b8707a'); }
    R(y, 67, HOR - 28, 6, 1, '#5a3a58');
    for (let i = 0; i < 9; i++) disc(y, 72 + i * 3, HOR - 31 - i * 2, 2 + Math.floor(i / 3), 'rgba(230,200,190,0.5)');
    // platåberg närmare, solsidan till höger
    for (const [mx, mw, mh] of [[150, 30, 16], [26, 22, 12], [228, 26, 14]]) {
      for (let j = 0; j < mh; j++) { const hw = Math.round(mw / 2 + j * 0.6); R(y, mx - hw, HOR - mh + j, hw * 2, 1, '#b4604a'); R(y, mx + Math.round(hw * 0.3), HOR - mh + j, Math.round(hw * 0.7), 1, '#d88458'); }
      R(y, mx - mw / 2, HOR - mh, mw, 1, '#f0a868');
    }
    // djungelkullar längst ut till höger
    for (let i = 200; i < W + 64; i++) { const h = Math.round(6 + 4 * Math.sin(i / 7) + 2 * Math.sin(i / 3)); R(y, i, HOR - h, 1, h, i % 3 ? '#4a7a44' : '#5a8a4a'); }
    R(y, 0, HOR - 1, W + 64, 1, '#f0c890');
  });
  const bx = -32 - Math.round(kurva * 22); x.drawImage(bak, bx, 0);
  // vägen i perspektiv: ränder som rusar mot kameran, röd-vita kantstenar, streckad mittlinje
  const mitt = (p) => 96 + kurva * (1 - p) * (1 - p) * 80, halv = (p) => 1 + p * 84;
  for (let y = HOR; y < H; y++) {
    const p = (y - HOR + 0.5) / (H - HOR), d = 1 / p, c = mitt(p), hw = halv(p), kw = Math.max(1, hw * 0.07), band = Math.floor((d + fard) / 4) & 1, dis = p < 0.09;
    R(x, 0, y, W, 1, dis ? '#ecbc84' : band ? '#e4ac6c' : '#d89e60');
    R(x, c - hw - kw, y, (hw + kw) * 2, 1, dis ? '#c89a84' : band ? '#e83a4a' : '#f2ece2');
    R(x, c - hw, y, hw * 2, 1, dis ? '#8a7476' : band ? '#6c5c62' : '#64545a');
    if (!dis && Math.floor((d + fard) / 2) & 1) { const dw = Math.max(1, Math.round(p * 3)); R(x, c - dw / 2, y, dw, 1, '#f4e2a8'); }
  }
  // vägkantens kaktusar, festivalflaggor och festivalbågen
  FH_SAKER.map(([s, sida, typ], i) => ({ d: mod(s - fard, L), sida, typ, i })).filter((o) => o.d > 1.15).sort((a, b) => b.d - a.d).forEach((o) => {
    const p = 1 / o.d, Y = HOR + p * (H - HOR), c = mitt(p), X = Math.round(c + o.sida * halv(p));
    if (o.typ === 'kaktus') fhKaktus(x, X, Math.round(Y), p);
    else if (o.typ === 'flagga') fhFlagga(x, X, Math.round(Y), p, o.i, v);
    else fhBage(x, c, Math.round(Y), halv(p), p);
  });
  // bilen bakifrån, lutar lite i kurvan
  const cx = 96 - Math.round(kurva * 5), y0 = 77 + Math.round(Math.sin(v * 30) * 0.5), hjul = Math.floor(f * 60) % 3;
  // dammet från bakhjulen
  for (const s of [-1, 1]) for (let i = 0; i < 12; i++) {
    const a = mod(f * 10 + i / 12, 1), px = cx + s * (21 + a * 24 + hash(i, s + 3) * 6), py = y0 + 24 - a * 12 - hash(i, 7) * 3;
    disc(x, Math.round(px), Math.round(py), Math.round(1 + a * 3), `rgba(240,210,160,${(0.75 - a * 0.7).toFixed(2)})`);
  }
  R(x, cx - 27, y0 + 24, 54, 2, 'rgba(40,20,20,0.4)');
  for (const s of [-1, 1]) { const hx = s < 0 ? cx - 25 : cx + 18; R(x, hx, y0 + 13, 7, 11, '#141418'); for (let r = 0; r < 11; r++) if ((r + hjul) % 3 === 0) R(x, hx + 1, y0 + 13 + r, 5, 1, '#2c2c36'); }
  R(x, cx - 22, y0, 44, 2, '#18181e'); R(x, cx - 22, y0, 44, 1, '#3a3a46'); R(x, cx - 12, y0 + 2, 2, 3, '#18181e'); R(x, cx + 10, y0 + 2, 2, 3, '#18181e');
  for (let j = 0; j < 7; j++) { const hw = 13 + Math.round(j * 0.8); R(x, cx - hw, y0 + 3 + j, hw * 2, 1, '#1e56d0'); if (j > 0 && j < 6) R(x, cx - hw + 2, y0 + 3 + j, hw * 2 - 4, 1, '#1a2234'); }
  linje(x, cx - 8, y0 + 4, cx - 12, y0 + 8, '#4a5e88'); linje(x, cx - 6, y0 + 4, cx - 10, y0 + 8, '#3a4a70');
  R(x, cx - 21, y0 + 9, 4, 2, '#1e56d0'); R(x, cx + 17, y0 + 9, 4, 2, '#1e56d0');
  for (let j = 0; j < 10; j++) { const hw = j < 2 ? 22 : 24; R(x, cx - hw, y0 + 10 + j, hw * 2, 1, j === 0 ? '#7ab4ff' : j > 7 ? '#1a48b0' : '#2a68e8'); }
  for (const s of [-1, 1]) { const lx = s < 0 ? cx - 22 : cx + 11; R(x, lx, y0 + 12, 11, 3, '#ff2638'); R(x, lx + 1, y0 + 12, 9, 1, '#ffb4bc'); }
  R(x, cx - 11, y0 + 13, 22, 1, '#a01020');
  R(x, cx - 6, y0 + 15, 12, 4, '#f0f0f0'); R(x, cx - 4, y0 + 16, 3, 2, '#2a2a3a'); R(x, cx + 1, y0 + 16, 3, 2, '#2a2a3a');
  R(x, cx - 20, y0 + 20, 40, 3, '#121216'); for (let i = -16; i <= 16; i += 4) R(x, cx + i, y0 + 20, 1, 3, '#2a2a32');
  for (const s of [-1, 1]) { disc(x, cx + s * 6, y0 + 21, 2, '#9a9aa4'); P(x, cx + s * 6, y0 + 21, '#202024'); }
  // HUD: hastighetsmätaren nere till höger
  const hx = 171, hy = 89, varv = 0.72 + Math.sin(v * 4) * 0.08, fart = 214 + Math.round(Math.sin(v * 2) * 4);
  disc(x, hx, hy, 16, 'rgba(12,10,24,0.6)');
  for (let a = 0; a <= 60; a++) { const p = a / 60, vv = Math.PI * 0.75 + p * Math.PI * 1.5; if (p <= varv) { P(x, hx + Math.cos(vv) * 13, hy + Math.sin(vv) * 13, p > 0.82 ? '#ff3a3a' : '#ff8a1e'); P(x, hx + Math.cos(vv) * 12, hy + Math.sin(vv) * 12, p > 0.82 ? '#ff3a3a' : '#ff8a1e'); } if (a % 6 === 0) P(x, hx + Math.cos(vv) * 15, hy + Math.sin(vv) * 15, p > 0.8 ? '#ff5050' : '#ffffff'); }
  const fs = String(fart); T(x, fs, hx - TW(fs, BIG) / 2, hy - 4, '#ffffff', BIG); T(x, 'KM/H', hx - TW('KM/H') / 2, hy + 5, '#c8c8d8'); T(x, '6', hx - 1, hy - 11, '#ff9a2e');
  // kartan nere till vänster: vägen och den rosa färdvägen
  const kx = 22, ky = 89;
  disc(x, kx, ky, 15, 'rgba(14,18,30,0.62)');
  for (let j = -13; j <= 13; j++) { const ox = Math.round(kurva * ((13 - j) / 26) ** 2 * 10); P(x, kx + ox, ky + j, '#ff4ab0'); P(x, kx + ox + 1, ky + j, '#ff4ab0'); }
  for (let i = -12; i <= 12; i++) P(x, kx + i, ky + 6 - Math.round(Math.abs(i) * 0.3), '#8a8aa0');
  R(x, kx, ky - 2, 1, 1, '#ffffff'); R(x, kx - 1, ky - 1, 3, 1, '#ffffff'); R(x, kx - 2, ky, 5, 1, '#ffffff');
  // skicklighetskedjan när bilen driftar i kurvan
  if (f > 0.12 && f < 0.6) { const s = 'DRIFT!', w = TW(s, BIG); TK(x, s, 96 - w / 2, 6, '#ffd040', '#b0186a', BIG); const p2 = '+' + (300 + Math.floor((f - 0.12) * 2000)) * 5; T(x, p2, 96 - TW(p2) / 2, 16, '#ffffff'); }
}

export const GLIMTAR = [
  { id: 'tjuvarnashav', titel: 'TJUVARNAS HAV', forebild: 'Sea of Thieves', ar: 2018, studio: 'SÄLLSYNT', w: 192, h: 108, rita: tjuvarnasHav },
  { id: 'taktsabel', titel: 'TAKTSABEL', forebild: 'Beat Saber', ar: 2019, studio: 'TAKTSPELEN', w: 192, h: 108, rita: taktsabel },
  { id: 'forsa', titel: 'FORSA HORISONT 5', forebild: 'Forza Horizon 5', ar: 2021, studio: 'LEKPLATSEN', w: 192, h: 108, rita: forsa },
];
