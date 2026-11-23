// Spelglimtar, grupp D. Samma format som BAS i ../glimtar.js. Verktygen finns i ../pix.js.
import { SMALL, BIG, R, P, T, TW, TK, spr, tri, mod, disc, hash, toning, fast } from '../pix.js';

// tjock linje av små rutor (armar, ben, nätet)
const linje = (x, ax, ay, bx, by, w, f) => {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay))));
  for (let i = 0; i <= n; i++) R(x, ax + ((bx - ax) * i) / n - w / 2 + 0.5, ay + ((by - ay) * i) / n - w / 2 + 0.5, w, w, f);
};
// fylld ellips (bläckfläckar, skuggor)
const ellips = (x, cx, cy, rx, ry, f) => {
  const n = Math.ceil(ry);
  for (let j = -n; j <= n; j++) { const w = rx * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry + 0.25))); if (w >= 0.5) R(x, cx - w, cy + j, w * 2, 1, f); }
};

// ---------- 2008 LILLA STORA PLANETEN (LittleBigPlanet) ----------
// Världen är 352 px lång och upprepar sig var 8:e sekund. Säckpojken står still i bild på x 60, världen rullar.
const LBP_W = 176, LBP_H = 99, LBP_L = 352, LBP_P = 8, LBP_SX = 60;
// säckpojkens väg: [från x, till x, fot-y från, fot-y till, hopphöjd]
const LBP_VAG = [[0, 104, 80, 80, 0], [104, 128, 80, 64, 12], [128, 160, 64, 64, 0], [160, 204, 64, 50, 14], [204, 236, 50, 50, 0], [236, 284, 50, 80, 8], [284, 352, 80, 80, 0]];
const LBP_BUBBLOR = [[40, 68], [52, 66], [108, 62], [116, 54], [124, 50], [212, 38], [222, 36], [232, 38], [300, 68], [312, 66], [324, 68]];
const PAPP = ['#f0d29c', '#d4a066', '#b07c46', '#7e5430'];
const FILT = ['#8cca58', '#62a83c', '#437e28', '#b4e080'];
function lbpFot(wx) {
  for (const [a, b, y0, y1, h] of LBP_VAG) if (wx >= a && wx < b) { const p = (wx - a) / (b - a); return { y: y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * h, luft: h > 0 }; }
  return { y: 80, luft: false };
}
// säckpojken: stickad säckvävsdocka med stort runt huvud och dragkedja. X = mitt, Y = fötterna
function sackpojke(x, X, Y, fas, luft) {
  const B = '#c99c68', M = '#9e7242', L = '#e8c692', S = '#6a4626';
  X = Math.round(X); Y = Math.round(Y);
  const steg = luft ? 0 : Math.sin(fas * Math.PI * 2);
  const arm = (sx, vx, vy, f) => { linje(x, X + sx, Y - 10, X + sx + vx, Y - 10 + vy, 2, f); disc(x, Math.round(X + sx + vx), Math.round(Y - 10 + vy), 1, f); };
  // bakre arm och ben
  if (luft) arm(-4, -4, -7, M); else arm(-4, -2 - steg * 3, 4, M);
  R(x, X - 4 + Math.round(steg * 2), Y - 5, 3, 5, M);
  // kroppen (säcken) med söm och dragkedja
  R(x, X - 4, Y - 12, 9, 8, B); R(x, X - 5, Y - 11, 11, 6, B); R(x, X + 3, Y - 11, 2, 7, M); R(x, X - 4, Y - 5, 9, 1, M); R(x, X - 5, Y - 10, 1, 4, L);
  for (let i = 0; i < 4; i++) P(x, X - 3 + i * 2, Y - 5, S);
  R(x, X, Y - 12, 1, 5, '#c4c8d0'); R(x, X - 1, Y - 12, 3, 2, '#eef0f4'); P(x, X, Y - 7, '#8a8e98');
  // främre ben och arm
  R(x, X + 1 - Math.round(steg * 2), Y - 5, 3, 5, B); R(x, X + 1 - Math.round(steg * 2), Y - 1, 3, 1, M);
  if (luft) arm(4, 4, -7, B); else arm(4, 2 + steg * 3, 4, B);
  // huvudet: stort och runt, skuggat, med säckvävsprickar
  const hx = X + 1, hy = Y - 19;
  disc(x, hx, hy, 7, B);
  for (let j = -7; j <= 7; j++) for (let i = -7; i <= 7; i++) {
    const d = i * i + j * j; if (d > 53) continue;
    if (d > 26 && i + j > 4) P(x, hx + i, hy + j, M); else if (d > 20 && i + j < -6) P(x, hx + i, hy + j, L); else if (hash(i + 7, j + 31) < 0.1) P(x, hx + i, hy + j, M);
  }
  // sömmen runt ansiktet
  for (let a = 0; a < 11; a++) { const v = 1.8 + a * 0.26; if (a % 2 === 0) P(x, hx + Math.round(Math.cos(v) * 6), hy + Math.round(Math.sin(v) * 6), S); }
  // knappögon och leende
  R(x, hx, hy - 2, 2, 4, '#1e140c'); R(x, hx + 4, hy - 2, 2, 4, '#1e140c'); P(x, hx, hy - 2, '#ffffff'); P(x, hx + 4, hy - 2, '#ffffff');
  P(x, hx, hy + 3, '#5a3418'); R(x, hx + 1, hy + 4, 4, 1, '#5a3418'); P(x, hx + 5, hy + 3, '#5a3418');
}
function lillaStora(x, t) {
  const W = LBP_W, H = LBP_H, L = LBP_L, ph = mod(t, LBP_P), cam = (ph / LBP_P) * L;
  // himmel med filtsol och bomullsmoln (statisk)
  x.drawImage(fast('lbp-himmel', W, H, (y) => {
    toning(y, 0, 0, W, 72, ['#78c0ea', '#a2d6ee', '#cfe9e0', '#f2e4b4']);
    disc(y, 152, 16, 9, '#ffd23a'); disc(y, 152, 16, 7, '#ffe068');
    for (let a = 0; a < 20; a++) if (a % 2) { const v = (a / 20) * Math.PI * 2; P(y, 152 + Math.round(Math.cos(v) * 8), 16 + Math.round(Math.sin(v) * 8), '#c89a20'); }
    for (const [cx, cy] of [[30, 14], [96, 22]]) { for (const [dx, dy, r] of [[0, 0, 5], [7, -3, 6], [14, 0, 5], [7, 2, 5]]) disc(y, cx + dx, cy + dy, r, '#ffffff'); R(y, cx - 3, cy + 4, 21, 2, '#dfe8ee'); }
  }), 0, 0);
  // filtkullar längst bak (rullar i kvarts fart)
  const kullar = fast('lbp-kullar', 88, H, (y) => {
    for (let i = 0; i < 88; i++) {
      const top = Math.round(50 + 6 * Math.sin((i / 88) * Math.PI * 2) + 3 * Math.sin((i / 44) * Math.PI * 2 + 1));
      R(y, i, top, 1, H - top, FILT[0]); if (i % 4 < 2) P(y, i, top + 2, FILT[3]); P(y, i, top, FILT[1]);
    }
  });
  for (let k = 0; k < 3; k++) x.drawImage(kullar, Math.round(k * 88 - mod(cam * 0.25, 88)), 0);
  // träd av papp och filt, blommor och vimpelband (halv fart)
  const mitt = fast('lbp-mitt', 176, H, (y) => {
    for (const tx of [30, 118]) {
      R(y, tx - 3, 40, 7, 40, PAPP[2]); for (let j = 40; j < 80; j += 2) P(y, tx - 1 + ((j / 2) % 2), j, PAPP[3]); R(y, tx + 3, 40, 1, 40, PAPP[3]);
      disc(y, tx, 32, 14, FILT[2]); disc(y, tx - 1, 31, 13, FILT[1]); disc(y, tx - 4, 27, 7, FILT[0]);
      for (let a = 0; a < 40; a++) if (a % 2) { const v = (a / 40) * Math.PI * 2; P(y, tx - 1 + Math.round(Math.cos(v) * 11), 31 + Math.round(Math.sin(v) * 11), FILT[3]); }
    }
    for (const [fx, fh, f] of [[66, 16, '#f070a0'], [78, 12, '#ffb030'], [150, 14, '#a070f0']]) { R(y, fx, 80 - fh, 1, fh, FILT[2]); disc(y, fx, 80 - fh, 3, f); P(y, fx, 80 - fh, '#ffe060'); }
    // vimpelbandet hänger mellan två stolpar
    for (let i = 0; i < 176; i++) { const yy = Math.round(9 + Math.sin(((i % 88) / 88) * Math.PI) * 6); P(y, i, yy, '#fff4dc'); if (i % 11 === 3) { const f = ['#e84848', '#ffd23a', '#3a9aff', '#5ac040'][(i / 11 | 0) % 4]; for (let j = 0; j < 6; j++) R(y, i - 2 + j / 2, yy + 1 + j, 5 - j, 1, f); } }
  });
  for (let k = 0; k < 2; k++) x.drawImage(mitt, Math.round(k * 176 - mod(cam * 0.5, 176)), 0);
  // världens saker ritas i skärmkoordinater; sx(wx) tar närmaste kopia av världen
  const sx = (wx) => Math.round(mod(wx - cam + 80, L) - 80);
  // marken: pappskiva med filtgräs och vågig wellpapp i kanten
  R(x, 0, 78, W, 3, PAPP[0]); R(x, 0, 81, W, 2, '#e2b87a');
  for (let i = 0; i < W; i++) {
    const wx = cam + i, fy = 89 + Math.round(2.5 * Math.sin((wx * Math.PI) / 4));
    for (let j = 83; j < 96; j++) P(x, i, j, j === fy || j === fy + 1 ? PAPP[3] : j < fy ? '#c08c52' : '#a87644');
    if (mod(Math.floor(wx), 6) < 3) { const g = mod(Math.floor(wx), 6); P(x, i, 77 - (g === 1 ? 1 : 0), FILT[1]); P(x, i, 78, FILT[0]); }
  }
  R(x, 0, 96, W, 1, '#d6aa6a'); R(x, 0, 97, W, 2, PAPP[3]);
  // pappkartongen med tejp och klistermärke
  const bx = sx(120);
  if (bx > -44 && bx < W) {
    R(x, bx, 62, 40, 3, PAPP[0]); R(x, bx, 65, 40, 15, PAPP[1]); R(x, bx, 65, 40, 1, PAPP[2]); R(x, bx + 39, 62, 1, 18, PAPP[3]); R(x, bx, 62, 1, 18, PAPP[2]);
    R(x, bx + 17, 62, 6, 9, 'rgba(240,226,170,0.75)');
    disc(x, bx + 10, 72, 4, '#ffffff'); disc(x, bx + 10, 72, 3, '#ffd23a'); P(x, bx + 9, 71, '#3a2a10'); P(x, bx + 11, 71, '#3a2a10'); R(x, bx + 9, 73, 3, 1, '#3a2a10');
    for (let i = 0; i < 5; i++) { P(x, bx + 30, 70 + i, '#ffffff'); P(x, bx + 28 + i, 72, '#ffffff'); } P(x, bx + 30, 72, '#e84848');
  }
  // svampen som flyter (hänger i två trådar) och sjunker när någon står på den
  const sackW = mod(cam + LBP_SX, L), pa = sackW >= 204 && sackW < 236 ? 1 : 0, spx = sx(196);
  if (spx > -46 && spx < W) {
    const top = 50 + pa;
    R(x, spx + 4, 0, 1, top, '#efe6d2'); R(x, spx + 39, 0, 1, top, '#efe6d2');
    R(x, spx + 1, top, 42, 7 - pa, '#f4d43c'); R(x, spx, top + 1, 44, 5 - pa, '#f4d43c'); R(x, spx + 1, top, 42, 1, '#fff08a'); R(x, spx + 1, top + 6 - pa, 42, 1, '#b08a18');
    for (let i = 0; i < 14; i++) { const hx = spx + 3 + Math.floor(hash(i, 70) * 38), hy = top + 2 + Math.floor(hash(i, 71) * (3 - pa)); R(x, hx, hy, 2, 1, '#c8a020'); P(x, hx, hy + 1, '#e0bc30'); }
  }
  // klistermärket som pekaren sätter dit (finns bara efter stämpeln i det här varvet)
  if (ph >= 2) {
    const X = Math.round(216 - cam), Y = 89, k = Math.min(1, (ph - 2) / 0.25), r = Math.round(5 * k);
    if (X > -8 && r > 0) { const st = (rr, f) => { for (let a = 0; a < 5; a++) { const v = -Math.PI / 2 + (a * Math.PI * 2) / 5; linje(x, X, Y, X + Math.cos(v) * rr, Y + Math.sin(v) * rr, 2, f); } disc(x, X, Y, Math.max(1, rr - 3), f); }; st(r + 1, '#ffffff'); st(r, '#ffc820'); }
  }
  // poängbubblorna: tas när säckpojken passerar och visar +10
  const sackU = cam + LBP_SX;
  let tagna = 0;
  LBP_BUBBLOR.forEach(([wx, wy], i) => {
    const d = mod(wx - sackW, L);
    if ((wx < LBP_SX ? wx + L : wx) < sackU) tagna++;
    if (d >= L - 64) { if (d >= L - 7) { const k = (L - d) / 7; TK(x, '+10', Math.round(sx(wx) - 5), Math.round(wy - 5 - k * 6), '#ffffff', '#3a6ad8', SMALL); } return; }
    const X = sx(wx), Y = Math.round(wy + Math.sin(t * 3 + i) * 1.5);
    if (X < -4 || X > W + 4) return;
    disc(x, X, Y, 3, 'rgba(190,232,255,0.45)');
    for (let j = -3; j <= 3; j++) for (let k = -3; k <= 3; k++) { const dd = j * j + k * k; if (dd >= 6 && dd <= 11) P(x, X + k, Y + j, '#eaf8ff'); }
    P(x, X - 1, Y - 1, '#ffffff'); P(x, X + 1, Y + 1, '#9ad0ff');
  });
  // säckpojken springer, hoppar upp på kartongen och svampen
  const fot = lbpFot(sackW);
  sackpojke(x, LBP_SX, fot.y, t * 2.2, fot.luft);
  // pekaren i spelarens färg: svävar bredvid, flyger bort och stämplar en stjärna
  let cx = LBP_SX + 16 + Math.sin(t * 2) * 2, cy = fot.y - 32 + Math.cos(t * 2.6) * 2;
  if (ph > 1 && ph < 3) { const p = ph < 2 ? (ph - 1) : 1 - (ph - 2.2) / 0.8, e = Math.max(0, Math.min(1, p)), q = e * e * (3 - 2 * e); cx += (128 - cx) * q; cy += (89 - cy) * q; }
  const stamp = ph >= 2 && ph < 2.3 ? (ph - 2) / 0.3 : 0, rr = 5 - Math.sin(stamp * Math.PI) * 2;
  for (let a = 0; a < 32; a++) { const v = (a / 32) * Math.PI * 2; P(x, Math.round(cx + Math.cos(v) * rr), Math.round(cy + Math.sin(v) * rr), '#2a7ae8'); P(x, Math.round(cx + Math.cos(v) * (rr - 1)), Math.round(cy + Math.sin(v) * (rr - 1)), '#a8d4ff'); }
  R(x, cx - 0.5, cy - 0.5, 2, 2, '#ffffff');
  if (stamp > 0) { const ry = 6 + stamp * 8; for (let a = 0; a < 24; a++) { const v = (a / 24) * Math.PI * 2; if (a % 2) P(x, Math.round(cx + Math.cos(v) * ry), Math.round(cy + Math.sin(v) * ry), '#ffffff'); } }
  // poängen uppe till vänster med spelarens färg
  const poang = String(1000 + 10 * (Math.floor(t / LBP_P) * LBP_BUBBLOR.length + tagna));
  R(x, 3, 3, 14 + TW(poang, BIG), 11, 'rgba(40,24,10,0.55)'); disc(x, 9, 8, 3, '#2a7ae8'); disc(x, 9, 8, 2, '#c99c68'); P(x, 8, 7, '#1e140c'); P(x, 10, 7, '#1e140c');
  T(x, poang, 15, 5, '#ffffff', BIG);
}

// ---------- 2015 BLÄCKKLATT (Splatoon) ----------
// Sidovy snett ovanifrån: golvet går från y 60 (längst bort) till 108. Rullen målar ett orange stråk i djupled 87–101.
const BK_W = 192, BK_H = 108, BK_P = 8, BK_L = 240, BK_V = 30, BK_X = 64, BK_RULLE = 98;
const ORA = { b: '#ff7410', l: '#ffb24a', s: '#c44a00' }, LIL = { b: '#7a2ee6', l: '#b47aff', s: '#47169a' };
// fläckar på golvet: [världens x, y, radie, färg]
const BK_FLACK = [[10, 70, 7, 'L'], [46, 92, 9, 'L'], [0, 76, 8, 'L'], [218, 76, 6, 'L'], [78, 104, 6, 'L'], [120, 69, 8, 'L'], [150, 94, 10, 'L'], [186, 88, 7, 'L'], [104, 84, 5, 'L'], [30, 64, 5, 'O'], [168, 66, 6, 'O'], [134, 105, 5, 'O'], [200, 102, 6, 'L']];
const BLACKFISK = [
  '....l.....',
  '...lbb....',
  '..lbbbb...',
  '.lbbbbbb..',
  'lbbbbbbbbs',
  'bbbbbbbbss',
  '..bwwbww..',
  '..bwkbwk..',
  '..bbbbbb..',
  '..b.bb.b..',
  '.b..bb..b.',
];
const IKON = ['..b..', '.bbb.', 'bbbbb', 'bwbwb', 'bbbbb', 'b.b.b'];
function klatt(x, X, Y, r, F, s) {
  ellips(x, X + 0.5, Y + 1, r, r * 0.55, F.s);
  ellips(x, X, Y, r, r * 0.55, F.b);
  for (let i = 0; i < 6; i++) {
    const a = hash(s, i) * 6.28, d = r * (0.85 + hash(s, i + 9) * 0.55), rr = 1 + hash(s, i + 20) * r * 0.32;
    ellips(x, Math.round(X + Math.cos(a) * d), Math.round(Y + Math.sin(a) * d * 0.55), rr, rr * 0.6, F.b);
  }
  R(x, X - r * 0.55, Y - r * 0.3, Math.max(1, r * 0.5), 1, F.l); P(x, X - r * 0.6 - 1, Y - r * 0.3, '#ffffff');
}
// bläckling (orange lag) i sidovy, vänd åt höger. X = mitt, Y = fötterna
function blackling(x, X, Y, fas) {
  const HY = '#f6d0ac', HYs = '#d8a482', SV = '#1c1c24', steg = Math.sin(fas * Math.PI * 2);
  // bläcktanken på ryggen
  R(x, X - 10, Y - 24, 6, 13, '#a8c8d4'); R(x, X - 9, Y - 23, 4, 11, '#e2f6fc'); R(x, X - 9, Y - 19, 4, 7, ORA.b); R(x, X - 9, Y - 19, 1, 7, ORA.l); R(x, X - 10, Y - 26, 6, 2, '#7a7e88');
  // bakre ben
  const ben = (o, f) => { linje(x, X - 1, Y - 11, X - 1 + o, Y - 3, 3, f); R(x, X - 2 + o, Y - 3, 6, 2, '#f4f4f4'); R(x, X - 2 + o, Y - 1, 6, 1, ORA.b); };
  ben(-Math.round(steg * 3), HYs);
  // shorts och tröja
  R(x, X - 4, Y - 14, 8, 4, '#2a2a3a');
  R(x, X - 4, Y - 22, 8, 9, '#f4f4f4'); R(x, X + 3, Y - 22, 1, 9, '#c8c8d2'); R(x, X - 4, Y - 18, 8, 2, ORA.b); R(x, X - 5, Y - 22, 2, 5, SV);
  ben(Math.round(steg * 3), HY);
  // halsen och huvudet
  R(x, X - 1, Y - 24, 3, 2, HY);
  const hx = X, hy = Y - 31;
  disc(x, hx, hy, 7, HY);
  // tentakelhår: en mössa över toppen och bakhuvudet med mörk kant, luggen spetsar ner mot ögat
  const har = (i, j) => i * i + j * j <= 53 && (j <= -3 || (i <= -1 && j <= 4) || (j <= -2 && i <= 4));
  for (let j = -8; j <= 8; j++) for (let i = -8; i <= 8; i++) {
    if (!har(i, j)) continue;
    const kant = !har(i - 1, j) || !har(i, j - 1) || !har(i, j + 1);
    P(x, hx + i, hy + j, kant && j > -6 ? ORA.s : (i + j < -7) ? ORA.l : ORA.b);
  }
  R(x, hx + 4, hy - 3, 3, 1, ORA.b); P(x, hx + 5, hy - 2, ORA.b); P(x, hx + 6, hy - 2, ORA.s);
  // två långa tentakler hänger bak över axlarna, med sugkoppar och böjda spetsar
  for (const [ox, len, d] of [[-5, 15, 0], [-2, 12, 1.3]]) for (let j = 0; j < len; j++) {
    const xx = Math.round(hx + ox - Math.sin(j / 3.5 + fas * 0.8 + d) * 1.3 - (j > len - 4 ? (j - len + 4) * 0.7 : 0)), yy = hy + 3 + j;
    R(x, xx - 1, yy, 3, 1, ORA.b); P(x, xx - 1, yy, ORA.s); if (j % 3 === 1) P(x, xx + 1, yy, '#ffd6a6');
  }
  for (let i = 0; i < 4; i++) P(x, hx - 7 - (i > 1 ? 1 : 0), hy - 1 + i, ORA.s);
  // örat och den svarta ögonmasken med stort öga
  P(x, hx - 1, hy + 1, HYs); P(x, hx - 2, hy + 2, HYs); P(x, hx - 1, hy + 2, HY);
  for (let i = 0; i <= 7; i++) R(x, hx + i, hy - 1 - (i > 5 ? 0 : 1), 1, i > 5 ? 2 : 4, SV);
  R(x, hx + 3, hy - 2, 3, 3, '#ffffff'); R(x, hx + 4, hy - 1, 2, 2, '#e05a00'); P(x, hx + 5, hy - 1, '#101010');
  P(x, hx + 6, hy + 3, '#a04030');
  // armarna håller rullens skaft
  linje(x, X + 1, Y - 20, X + 7, Y - 16, 2, HY); linje(x, X - 1, Y - 19, X + 5, Y - 15, 2, HYs);
}
function blackklatt(x, t) {
  const W = BK_W, H = BK_H, L = BK_L, ph = mod(t, BK_P), cam = ph * BK_V;
  // himmel och avlägsna tornet (statiskt)
  x.drawImage(fast('bk-himmel', W, 60, (y) => {
    toning(y, 0, 0, W, 60, ['#38bcf0', '#62ccf4', '#9ee0f8', '#d4f2fc']);
    R(y, 150, 6, 6, 50, '#c8d8e8'); R(y, 146, 4, 14, 4, '#e8f0f8'); R(y, 148, 2, 10, 2, '#ff70b0'); R(y, 152, 0, 2, 2, '#e8f0f8');
  }), 0, 0);
  // staden i halv fart: pastellhus och en skylt med bläckfisk
  const stad = fast('bk-stad', 120, 60, (y) => {
    const hus = [[0, 18, 26, '#f0e0f4'], [20, 14, 34, '#d6ecf4'], [36, 22, 22, '#fde6c8'], [60, 16, 30, '#e4f4dc'], [78, 24, 18, '#f4dce4'], [104, 16, 28, '#dce4f8']];
    for (const [hx, hw, hh, f] of hus) {
      R(y, hx, 60 - hh, hw, hh, f); R(y, hx + hw - 2, 60 - hh, 2, hh, 'rgba(0,0,0,0.08)');
      for (let wy = 60 - hh + 3; wy < 56; wy += 5) for (let wx = hx + 2; wx < hx + hw - 3; wx += 4) R(y, wx, wy, 2, 3, '#8ab4d0');
    }
    R(y, 40, 22, 20, 12, '#ff3c8c'); R(y, 41, 23, 18, 10, '#2a2a3a'); spr(y, IKON, 44, 25, { b: '#7aff3c', w: '#2a2a3a' }); spr(y, IKON, 51, 25, { b: '#ff7410', w: '#2a2a3a' });
    R(y, 49, 34, 2, 6, '#6a6a78');
  });
  for (let k = 0; k < 3; k++) x.drawImage(stad, Math.round(k * 120 - mod(cam * 0.5, 120)), 0);
  // muren längst bort med gul kant och svarta varningsränder
  R(x, 0, 46, W, 14, '#b4b8c2'); R(x, 0, 46, W, 4, '#f8d020');
  for (let i = -8; i < W + 8; i++) { const wx = i + cam; if (mod(Math.floor(wx), 8) < 4) for (let j = 0; j < 4; j++) P(x, i - j, 46 + j, '#1c1c24'); }
  R(x, 0, 50, W, 1, '#8a8e98'); for (let i = -mod(cam, 30); i < W; i += 30) R(x, i, 51, 1, 9, '#9a9ea8');
  // golvet: betongplattor med sneda fogar
  R(x, 0, 60, W, H - 60, '#a2a8b2'); R(x, 0, 60, W, 2, '#8a909a');
  for (const fy of [72, 86, 101]) R(x, 0, fy, W, 1, '#8e949e');
  for (let k = -2; k < 12; k++) { const bx = k * 24 - mod(cam, 24); for (let y = 62; y < H; y++) P(x, Math.round(bx + (y - 108) * 0.5), y, '#8e949e'); }
  // bläck på muren och golvet (lila först, orange lag ovanpå)
  const sx = (wx) => mod(wx - cam + 30, L) - 30;
  // stänk på muren: oregelbundna klickar med rinnande droppar
  const murklatt = (X, Y, r, F, s) => {
    disc(x, X, Y, r, F.b);
    for (let i = 0; i < 5; i++) { const a = hash(s, i) * 6.28, d = r + 1 + hash(s, i + 5) * 2; disc(x, Math.round(X + Math.cos(a) * d), Math.round(Y + Math.sin(a) * d * 0.8), hash(s, i + 9) < 0.5 ? 1 : 0, F.b); }
    for (let i = 0; i < 2; i++) { const dx = Math.round((hash(s, i + 20) - 0.5) * r * 1.4), len = 2 + Math.floor(hash(s, i + 30) * 4); R(x, X + dx, Y + r - 1, 1, len, F.b); P(x, X + dx, Y + r - 1 + len, F.s); }
    P(x, X - 1, Y - 1, F.l); P(x, X - 2, Y, F.l);
  };
  for (const [wx, wy, r] of [[60, 53, 4], [170, 52, 3], [120, 55, 3]]) murklatt(sx(wx), wy, r, LIL, wx);
  for (const [wx, wy, r] of [[16, 54, 3], [210, 53, 3]]) murklatt(sx(wx), wy, r, ORA, wx);
  BK_FLACK.forEach(([wx, wy, r, f], i) => klatt(x, sx(wx), wy, r, f === 'O' ? ORA : LIL, i + 3));
  // rullens orange stråk ända bakifrån fram till rullen
  for (let y = 87; y <= 101; y++) {
    const xe = Math.round(BK_RULLE - 0.5 * (101 - y) - 3);
    for (let i = 0; i < xe; i++) {
      const kant = y === 87 || y === 101, h = hash(mod(Math.floor((i + cam) / 2), L / 2), y);
      if (kant && h < 0.45) continue;
      P(x, i, y, y >= 99 ? ORA.s : y === 89 && mod(Math.floor((i + cam) / 3), 5) < 3 ? ORA.l : ORA.b);
    }
  }
  for (let i = 0; i < 12; i++) { const X = mod(i * 23 - cam, L) - 20; if (X < BK_RULLE - 12) P(x, X, 90 + (i % 3) * 3, '#ffffff'); }
  // en lagkamrat simmar som bläckfisk i stråket, hoppar upp och dyker ner igen
  if (ph < 2.4) {
    const X = Math.round(-10 + ph * 22);
    for (let k = 1; k < 6; k++) { P(x, X - k * 2, 94 - k, ORA.l); P(x, X - k * 2, 94 + k * 0.6, ORA.l); }
    R(x, X - 1, 93, 5, 2, ORA.s); R(x, X, 92, 3, 1, ORA.s); P(x, X + 1, 92, '#ffffff'); P(x, X + 3, 92, '#ffffff');
    if (Math.floor(t * 8) % 2) { P(x, X + 3, 90, ORA.l); P(x, X - 2, 89, ORA.b); }
  } else if (ph < 3.2) {
    const p = (ph - 2.4) / 0.8, X = Math.round(43 + p * 4), Y = Math.round(84 - Math.sin(p * Math.PI) * 26);
    spr(x, BLACKFISK, X - 5, Y, { l: ORA.l, b: ORA.b, s: ORA.s, w: '#ffffff', k: '#101010' });
    if (p < 0.25 || p > 0.8) for (let i = 0; i < 5; i++) P(x, X - 4 + i * 2, 90 - Math.round(hash(i, Math.floor(t * 10)) * 5), ORA.l);
  }
  // en lila bläckfisk hoppar ur sin fläck längre bort
  if (ph > 3 && ph < 4.1) {
    const p = (ph - 3) / 1.1, X = Math.round(sx(0) - p * 20), Y = Math.round(70 - Math.sin(p * Math.PI) * 30);
    spr(x, BLACKFISK, X - 5, Y, { l: LIL.l, b: LIL.b, s: LIL.s, w: '#ffffff', k: '#101010' });
    if (p < 0.2 || p > 0.85) for (let i = 0; i < 5; i++) P(x, X - 4 + i * 2, 76 - Math.round(hash(i + 5, Math.floor(t * 10)) * 6), LIL.l);
  }
  // bläcklingen med rullen
  blackling(x, BK_X, 97, t * 1.8);
  // rullen: skaft från händerna, ram och en tjock orange cylinder som ligger i djupled
  linje(x, BK_X + 7, 81, BK_RULLE - 4, 89, 2, '#2a2a30'); linje(x, BK_RULLE - 4, 89, BK_RULLE - 4, 85, 2, '#b8bcc6'); linje(x, BK_RULLE - 4, 85, BK_RULLE - 12, 84, 2, '#b8bcc6');
  ellips(x, BK_RULLE - 9.5, 85, 5, 2, '#8a8e98');
  for (let y = 85; y <= 102; y++) {
    const x0 = Math.round(BK_RULLE - 0.5 * (102 - y) - 6), prick = mod(y * 3 + Math.floor(t * 20), 7) === 0;
    R(x, x0, y, 11, 1, ORA.b); R(x, x0, y, 2, 1, ORA.s); R(x, x0 + 9, y, 2, 1, ORA.s); R(x, x0 + 3, y, 2, 1, ORA.l); if (prick) P(x, x0 + 6, y, ORA.s);
  }
  ellips(x, BK_RULLE - 0.5, 102, 5.5, 2, '#d4d8e2'); ellips(x, BK_RULLE - 0.5, 102, 3, 1, '#9a9ea8'); P(x, BK_RULLE - 1, 102, '#4a4e58');
  for (let i = 0; i < 4; i++) P(x, BK_RULLE + 6 + i, 98 - i * 3 + (Math.floor(t * 12 + i) % 2), ORA.l);
  // överst: tiden, lagens bläckfiskikoner och hur mycket av golvet varje lag har målat
  const kvar = 167 - Math.floor(ph), tid = `${Math.floor(kvar / 60)}:${String(kvar % 60).padStart(2, '0')}`;
  R(x, 83, 2, 26, 11, '#24242e'); R(x, 84, 1, 24, 1, '#24242e'); T(x, tid, 96 - TW(tid, BIG) / 2, 4, '#ffffff', BIG);
  for (let i = 0; i < 4; i++) { disc(x, 52 + i * 8, 7, 3, '#24242e'); spr(x, IKON, 50 + i * 8, 4, { b: ORA.b, w: '#ffffff' }); disc(x, 117 + i * 8, 7, 3, '#24242e'); spr(x, IKON, 115 + i * 8, 4, { b: LIL.b, w: '#ffffff' }); }
  const andel = 0.45 + (ph / BK_P) * 0.1, delning = Math.round(52 + andel * 88);
  R(x, 51, 14, 90, 4, '#24242e'); R(x, 52, 15, delning - 52, 2, ORA.b); R(x, delning, 15, 140 - delning, 2, LIL.b); P(x, delning, 14, '#ffffff'); P(x, delning, 17, '#ffffff');
  R(x, 32, 13, 17, 7, '#24242e'); R(x, 143, 13, 17, 7, '#24242e');
  T(x, `${Math.round(andel * 100)}%`, 34, 14, ORA.l); T(x, `${100 - Math.round(andel * 100)}%`, 145, 14, LIL.l);
}

// ---------- 2018 SPINDELMANNEN (Marvel's Spider-Man) ----------
// Pendel: varje sving tar 1,6 s och flyttar 64 px; kameran följer med i snittfarten (fem svingar per varv).
const SP_W = 192, SP_H = 108, SP_P = 8, SP_TS = 1.6, SP_D = 64, SP_LR = 60, SP_AY = -6, SP_X = 84;
const SP_ROD = '#d4202c', SP_RODM = '#8a1018', SP_BLA = '#22357e', SP_VIT = '#f4f4f4';
function spindel(x, t) {
  const W = SP_W, H = SP_H, ph = mod(t, SP_P), cam = (ph / SP_TS) * SP_D;
  // himmel i gyllene timmen, solen och den disiga silhuetten (statiskt)
  x.drawImage(fast('sp-himmel', W, H, (y) => {
    toning(y, 0, 0, W, 98, ['#2c3878', '#55468a', '#94568e', '#d46a86', '#f68c68', '#ffb45c', '#ffd88c']);
    disc(y, 150, 72, 18, 'rgba(255,226,160,0.35)'); disc(y, 150, 72, 11, '#ffe6a8'); disc(y, 150, 72, 8, '#fff6d6');
    let bx = 0;
    for (let k = 0; bx < W; k++) {
      const bw = 7 + Math.floor(hash(k, 11) * 9), bh = 16 + Math.floor(hash(k, 12) * 22);
      R(y, bx, 98 - bh, bw, bh, '#b4708e'); if (hash(k, 13) > 0.6) R(y, bx + bw / 2 - 1, 98 - bh - 4, 2, 4, '#b4708e');
      bx += bw;
    }
    // det höga tornet med spira och kronan med bågar
    R(y, 52, 38, 14, 60, '#a4648a'); R(y, 54, 30, 10, 8, '#a4648a'); R(y, 56, 24, 6, 6, '#a4648a'); R(y, 58, 18, 2, 6, '#a4648a'); R(y, 58, 10, 1, 8, '#a4648a');
    R(y, 104, 44, 12, 54, '#a4648a'); for (let j = 0; j < 4; j++) R(y, 106 + j, 36 + j * 2, 8 - j * 2, 8, '#a4648a'); R(y, 109, 26, 2, 10, '#a4648a');
    for (let j = 0; j < 3; j++) R(y, 107 + j, 41 - j * 2, 6 - j * 2, 1, '#e8a4a0');
  }), 0, 0);
  // mellanhusen i halv fart, solsidan glöder
  const mitt = fast('sp-mitt', 160, H, (y) => {
    let bx = 0;
    for (let k = 0; bx < 160; k++) {
      const bw = 12 + Math.floor(hash(k, 21) * 12), top = 44 + Math.floor(hash(k, 22) * 18), w2 = Math.min(bw, 160 - bx);
      R(y, bx, top, w2, H - top, '#5a3a66'); R(y, bx + w2 - 2, top, 2, H - top, '#e48a6a'); R(y, bx, top, w2, 1, '#e48a6a');
      for (let wy = top + 3; wy < H; wy += 4) for (let wx = bx + 2; wx < bx + w2 - 3; wx += 3) { const h = hash(wx, wy); if (h > 0.5) P(y, wx, wy, h > 0.82 ? '#ffd890' : '#7a5278'); }
      bx += bw + 2;
    }
  });
  for (let k = 0; k < 3; k++) x.drawImage(mitt, Math.round(k * 160 - mod(cam * 0.5, 160)), 0);
  // de nära skyskraporna med vattentorn på taken (hel fart, världen är 320 lång)
  const nara = fast('sp-nara', 320, H, (y) => {
    for (const [bx, bw, top, torn] of [[0, 34, 40, 1], [62, 26, 58, 0], [120, 40, 34, 1], [206, 30, 50, 1], [262, 36, 44, 0]]) {
      R(y, bx, top, bw, H - top, '#2c2038'); R(y, bx + bw - 3, top, 3, H - top, '#ff9a5a'); R(y, bx + bw - 4, top, 1, H - top, '#b45a4a'); R(y, bx, top, bw, 2, '#4a3450');
      for (let wy = top + 4; wy < H; wy += 5) for (let wx = bx + 3; wx < bx + bw - 5; wx += 4) R(y, wx, wy, 2, 3, hash(wx, wy) > 0.78 ? '#ffc878' : '#3e3052');
      if (torn) { const tx = bx + 6; R(y, tx, top - 11, 9, 8, '#7a4a34'); R(y, tx, top - 9, 9, 1, '#4a2a20'); R(y, tx, top - 6, 9, 1, '#4a2a20'); R(y, tx + 8, top - 11, 1, 8, '#d88a5a');
        for (let j = 0; j < 4; j++) R(y, tx + j, top - 15 + j, 9 - j * 2, 1, '#4a2a2a'); R(y, tx + 1, top - 3, 1, 3, '#2a1a20'); R(y, tx + 7, top - 3, 1, 3, '#2a1a20'); }
    }
  });
  for (let k = 0; k < 2; k++) x.drawImage(nara, Math.round(k * 320 - mod(cam, 320)), 0);
  // gatan med gula taxibilar
  R(x, 0, 98, W, 1, '#7a5a6a'); R(x, 0, 99, W, 9, '#2a2234'); R(x, 0, 107, W, 1, '#3a3044');
  for (let i = -mod(cam, 16); i < W; i += 16) R(x, i, 103, 7, 1, '#d8c890');
  for (const [b, f] of [[0, '#f8c820'], [90, '#f8c820'], [170, '#f8c820']]) {
    const X = Math.round(mod(b + 30 * t, 240) - 24);
    R(x, X, 100, 14, 3, f); R(x, X + 3, 98, 7, 2, f); R(x, X + 4, 98, 2, 1, '#3a3050'); R(x, X + 7, 98, 2, 1, '#3a3050'); R(x, X + 5, 97, 3, 1, '#fff6c0');
    R(x, X + 13, 101, 1, 1, '#fff4c0'); P(x, X, 101, '#ff3040'); P(x, X + 2, 103, '#101010'); P(x, X + 11, 103, '#101010');
  }
  { const X = Math.round(mod(60 - 60 * t, 240) - 24); R(x, X, 104, 12, 3, '#e8e8f0'); R(x, X + 2, 102, 7, 2, '#c8c8d8'); P(x, X, 105, '#fff4c0'); P(x, X + 11, 105, '#ff3040'); }
  // duvor som flyger förbi
  for (let i = 0; i < 3; i++) { const X = Math.round(mod(170 - 30 * t + i * 9, 240) - 24), Y = 24 + i * 3 + Math.round(Math.sin(t * 2 + i)), u = Math.floor(t * 8 + i) % 2; P(x, X, Y, '#3a2a40'); P(x, X - 1, Y - u, '#3a2a40'); P(x, X + 1, Y - u, '#3a2a40'); }
  // svingen: handen följer en pendel runt fästpunkten ovanför bilden
  const fas = ph / SP_TS, i = Math.floor(fas), s = fas - i, th0 = Math.asin(SP_D / 2 / SP_LR), th = -th0 * Math.cos(Math.PI * s);
  const ankX = i * SP_D + SP_D / 2 - cam + SP_X, hx = ankX + SP_LR * Math.sin(th), hy = SP_AY + SP_LR * Math.cos(th);
  // nätet skjuts ut i början av varje sving
  const nat = Math.min(1, s / 0.08);
  linje(x, hx, hy, hx + (ankX - hx) * nat, hy + (SP_AY - hy) * nat, 1, SP_VIT);
  // kroppen hänger längs nätet: a = nedåt längs kroppen, f = framåt
  const ul = Math.hypot(ankX - hx, SP_AY - hy), a = [-(ankX - hx) / ul, -(SP_AY - hy) / ul], f = [-a[1], a[0]];
  const K = 1.45, pt = (pa, pf) => [hx + (a[0] * pa + f[0] * pf) * K, hy + (a[1] * pa + f[1] * pf) * K];
  const v = Math.sin(Math.PI * s), axel = pt(4, 0), axel2 = pt(5, 2), huvud = pt(2.6, 3.4), hoft = pt(12, -0.5);
  const kna1 = pt(16, 2.5 - v * 4), fot1 = pt(19.5, -1.5 - v * 3), kna2 = pt(15.5, -2.5 - v * 3), fot2 = pt(19.5, -6.5 - v * 2);
  const hand2 = s > 0.75 ? pt(0.5, 7) : pt(9 - v * 2, 6.5 + v);
  // bortre ben och arm
  linje(x, hoft[0], hoft[1], kna2[0], kna2[1], 3, '#16245a'); linje(x, kna2[0], kna2[1], fot2[0], fot2[1], 3, SP_RODM);
  linje(x, axel2[0], axel2[1], hand2[0], hand2[1], 2, SP_RODM); R(x, hand2[0] - 1, hand2[1] - 1, 2, 2, SP_RODM);
  // bålen: röd med blå sida och den stora vita spindeln
  linje(x, axel[0], axel[1], hoft[0], hoft[1], 6, SP_ROD);
  const bak = (p) => [p[0] - f[0] * 2.6, p[1] - f[1] * 2.6];
  { const [ax, ay] = bak(axel), [bx, by] = bak(hoft); linje(x, ax, ay, bx, by, 2, SP_BLA); }
  const sp = pt(7.5, 0.8), sv = (pa, pf) => P(x, sp[0] + a[0] * pa + f[0] * pf, sp[1] + a[1] * pa + f[1] * pf, SP_VIT);
  for (const pa of [-1.5, -0.5, 0.5, 1.5]) sv(pa, 0);
  for (const [pa, pf] of [[-2, -1.5], [-2, 1.5], [-0.5, -1.5], [-0.5, 1.5], [1, -1.5], [1, 1.5], [2.5, -1.2], [2.5, 1.2]]) sv(pa, pf);
  // främre ben (blått lår, röd stövel) och armen som håller nätet
  linje(x, hoft[0], hoft[1], kna1[0], kna1[1], 4, SP_BLA); linje(x, kna1[0], kna1[1], fot1[0], fot1[1], 3, SP_ROD);
  linje(x, axel[0], axel[1], hx, hy, 3, SP_ROD); R(x, hx - 1, hy - 1, 3, 3, SP_ROD);
  // huvudet med stora vita ögon i svart kant
  const hX = Math.round(huvud[0]), hY = Math.round(huvud[1]);
  disc(x, hX, hY, 4, SP_ROD); P(x, hX - 2, hY - 3, '#ff6a6a'); P(x, hX - 1, hY - 4, '#ff6a6a'); R(x, hX - 3, hY + 2, 2, 2, SP_RODM);
  // ögonen: vita droppar som smalnar nedåt, svart kant upptill och utåt
  R(x, hX - 2, hY - 2, 2, 1, '#101014'); P(x, hX - 3, hY - 1, '#101014'); R(x, hX - 2, hY - 1, 2, 2, SP_VIT); P(x, hX - 1, hY + 1, SP_VIT);
  R(x, hX + 1, hY - 2, 3, 1, '#101014'); P(x, hX + 4, hY - 1, '#101014'); R(x, hX + 1, hY - 1, 3, 2, SP_VIT); P(x, hX + 1, hY + 1, SP_VIT);
  // HUD: hälsa och fokus uppe till vänster, karta nere till vänster
  R(x, 4, 4, 9, 9, 'rgba(10,12,30,0.6)'); P(x, 8, 6, SP_VIT); R(x, 7, 7, 3, 3, SP_VIT); P(x, 8, 10, SP_VIT); P(x, 6, 7, SP_VIT); P(x, 10, 7, SP_VIT); P(x, 6, 10, SP_VIT); P(x, 10, 10, SP_VIT);
  R(x, 15, 5, 36, 3, 'rgba(10,12,30,0.6)'); R(x, 16, 6, 30, 1, SP_VIT);
  for (let k = 0; k < 4; k++) R(x, 15 + k * 7, 9, 6, 2, k < 3 ? '#4ad0ff' : 'rgba(10,12,30,0.6)');
  // kartan: mörk rund ruta med gator som glider förbi och spelarens pil i mitten
  const kx = 17, ky = 90, kr = 12, cs = Math.cos(0.4), sn = Math.sin(0.4);
  for (let j = -kr; j <= kr; j++) for (let k = -kr; k <= kr; k++) {
    const d = j * j + k * k; if (d > kr * kr + 3) continue;
    const u = mod(k * cs + j * sn + cam * 0.12, 14), w = mod(-k * sn + j * cs + 3, 12);
    P(x, kx + k, ky + j, d > (kr - 0.6) * (kr - 0.6) ? 'rgba(200,210,230,0.75)' : u < 2 || w < 2 ? '#4a5a7e' : (u > 6 && u < 11 && w > 5 && w < 9) ? '#1c2648' : 'rgba(12,16,36,0.85)');
  }
  for (let j = 0; j < 5; j++) R(x, kx - j / 2, ky - 3 + j, j + 1, 1, SP_VIT);
  disc(x, kx + 7, ky - 6, 1, '#ffd23a');
}

export const GLIMTAR = [
  { id: 'lillastora', titel: 'LILLA STORA PLANETEN', forebild: 'LittleBigPlanet', ar: 2008, studio: 'MEDIA MOLEKYL', w: LBP_W, h: LBP_H, rita: lillaStora },
  { id: 'blackklatt', titel: 'BLÄCKKLATT', forebild: 'Splatoon', ar: 2015, studio: 'SVAMPSTUDION', w: BK_W, h: BK_H, rita: blackklatt },
  { id: 'spindel', titel: 'SPINDELMANNEN', forebild: "Marvel's Spider-Man", ar: 2018, studio: 'INSOMNIAK', w: SP_W, h: SP_H, rita: spindel },
];
