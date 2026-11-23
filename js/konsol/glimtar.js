// Spelglimtar för konsolläget: korta animerade klipp av kända spel (med egna parodinamn) som visas i
// reklamfilmer, på TV:n i vardagsrummet och i spelbiblioteket. Varje glimt ritar sig i sin egen
// upplösning – äldre eror i grövre pixlar – och förstoras av den som visar den (hela steg, inga suddiga pixlar).
//   GLIMTAR: [{ id, titel, forebild, ar, studio, w, h, rita(ctx, t) }]   t = sekunder
//   glimtBild(id, t) → canvas i glimtens upplösning med bildrutan för tiden t
import { SMALL, BIG, R, P, T, TW, TK, spr, tri, mod, disc, hash, toning, fast } from './pix.js';
import { GLIMTAR as G_A } from './glimtar/a.js';
import { GLIMTAR as G_B } from './glimtar/b.js';
import { GLIMTAR as G_C } from './glimtar/c.js';
import { GLIMTAR as G_D } from './glimtar/d.js';
import { GLIMTAR as G_E } from './glimtar/e.js';
import { GLIMTAR as G_F } from './glimtar/f.js';
import { GLIMTAR as G_MOBIL } from './glimtar/mobil.js';

// ---------- 1982 PANG! (Pong) – ert eget första spel ----------
function pang(x, t) {
  const V = '#e8f4e8';
  R(x, 0, 0, 64, 48, '#050805');
  for (let y = 2; y < 46; y += 4) R(x, 31, y, 2, 2, '#4a5a4a');
  const bx = 5 + tri(t * 0.9) * 52, by = 3 + tri(t * 1.31 + 0.3) * 41;
  const vl = Math.max(2, Math.min(37, by - 4 + Math.sin(t * 2.1) * 3)), hr = Math.max(2, Math.min(37, by - 4 - Math.sin(t * 1.7) * 4));
  R(x, 3, vl, 2, 9, V); R(x, 59, hr, 2, 9, V);
  R(x, bx, by, 2, 2, '#ffffff');
  const p = Math.floor(t / 2.25);
  T(x, String(p % 10), 23, 5, V, BIG); T(x, String((p + 3) % 10), 37, 5, V, BIG);
}

// ---------- 1982 PAC-MUNCH (Pac-Man) ----------
const PM_BLOCK = [[9, 9, 20, 10], [35, 9, 26, 10], [67, 9, 20, 10], [9, 29, 20, 13], [67, 29, 20, 13], [9, 52, 20, 10], [35, 52, 26, 10], [67, 52, 20, 10]];
function pacMunch(x, t) {
  const VAGG = '#2121de', PRICK = '#ffb8ae';
  const bak = fast('pac', 96, 72, (y) => {
    R(y, 0, 0, 96, 72, '#000000');
    const ruta = (X, Y, W, H, f) => { R(y, X + 1, Y, W - 2, 1, f); R(y, X + 1, Y + H - 1, W - 2, 1, f); R(y, X, Y + 1, 1, H - 2, f); R(y, X + W - 1, Y + 1, 1, H - 2, f); };
    ruta(1, 1, 94, 70, VAGG); ruta(3, 3, 90, 66, VAGG);
    for (const [X, Y, W, H] of PM_BLOCK) { ruta(X, Y, W, H, VAGG); if (H > 6) ruta(X + 2, Y + 2, W - 4, H - 4, VAGG); }
    // spökhuset med rosa dörr
    ruta(36, 30, 24, 11, VAGG); R(y, 45, 30, 6, 1, '#ffb8de');
    // tunnlar ut ur vänster och höger kant
    R(y, 0, 44, 4, 6, '#000000'); R(y, 92, 44, 4, 6, '#000000');
  });
  x.drawImage(bak, 0, 0);
  // prickar i gångarna (de på nedre raden äts upp bakom Pac)
  const pacX = mod(t * 26, 116) - 10;
  for (let X = 7; X < 90; X += 4) {
    P(x, X, 24, PRICK); P(x, X, 47, PRICK);
    if (X > pacX + 3 || pacX < 0) P(x, X, 47, PRICK); else R(x, X, 47, 1, 1, '#000000');
  }
  for (let Y = 7; Y < 66; Y += 4) { P(x, 6, Y, PRICK); P(x, 89, Y, PRICK); P(x, 32, Y, PRICK); P(x, 64, Y, PRICK); }
  if (Math.floor(t * 4) % 2) for (const [X, Y] of [[5, 6], [88, 6], [5, 63], [88, 63]]) R(x, X, Y, 3, 3, PRICK);
  // Pac: gul med mun som öppnas och stängs
  const mun = Math.abs(Math.sin(t * 14)) * 0.85;
  disc(x, Math.round(pacX), 47, 4, '#ffff00', (i, j) => i > 0 && Math.abs(Math.atan2(j, i)) < mun);
  // spöket efter
  const gx = Math.round(pacX - 18), gy = 47, fot = Math.floor(t * 8) % 2;
  for (let j = -4; j <= 0; j++) for (let i = -4; i <= 4; i++) if (i * i + j * j <= 18) P(x, gx + i, gy + j, '#ff0000');
  R(x, gx - 4, gy, 9, 3, '#ff0000');
  for (let i = 0; i < 9; i++) if ((i + fot) % 3 !== 0) P(x, gx - 4 + i, gy + 3, '#ff0000');
  R(x, gx - 3, gy - 3, 3, 3, '#ffffff'); R(x, gx + 1, gy - 3, 3, 3, '#ffffff'); R(x, gx - 1, gy - 2, 1, 2, '#2121de'); R(x, gx + 3, gy - 2, 1, 2, '#2121de');
}

// ---------- 1985 SUPER MARCO BROS. (Super Mario Bros.) ----------
const MARCO = [
  '...RRRRR....',
  '..RRRRRRRRR.',
  '..BBBSSBS...',
  '.BSBSSSBSSS.',
  '.BSBBSSSBSSS',
  '.BBSSSSBBBB.',
  '...SSSSSSS..',
  '..RROORR....',
  '.RRROORROR..',
  'RRRROOOORRRR',
  'SSROYOOYORSS',
  'SSSOOOOOOSSS',
  'SSOOOOOOOOSS',
];
const MARCO_BEN = [['..OOO..OOO..', '.BBB....BBB.', 'BBBB....BBBB'], ['.OOO....OOO.', 'BBB......BBB', 'BB........BB']];
const MARCO_PAL = { R: '#d82800', B: '#6a3810', S: '#fcb070', O: '#2850d8', Y: '#fce020' };
const SVAMPIS = [
  '.....NNNNNN.....',
  '...NNNNNNNNNN...',
  '..NNNNNNNNNNNN..',
  '.NNKKNNNNNNKKNN.',
  '.NNWKKNNNNKKWNN.',
  'NNNWKWNNNNWKWNNN',
  'NNNWWWNNNNWWWNNN',
  'NNNNNNNNNNNNNNNN',
  '.NNNNTTTTTTNNNN.',
  '....TTTTTTTT....',
  '....TTTTTTTT....',
];
const SVAMPIS_FOT = [['..KKKTTTTTTKKK..', '.KKKKK....KKKKK.', '..KKK......KKK..'], ['...KKKTTTTKKK...', '..KKKKK..KKKKK..', '...KKK....KKK...']];
const SVAMPIS_PAL = { N: '#b05020', K: '#101010', W: '#fcfcfc', T: '#fcd8a8' };
function marco(x, t) {
  const W = 128, MARK = 64, VARLD = 384, cx = t * 42, mx = cx + 32;
  R(x, 0, 0, W, 96, '#5c94fc');
  // kullar och moln i parallax
  for (let k = -1; k < 3; k++) {
    const hx = Math.round(k * 160 - mod(cx * 0.5, 160)) + 20;
    for (let j = 0; j < 22; j++) { const hw = Math.round(Math.sqrt(Math.max(0, 22 * 22 - (22 - j) * (22 - j))) * 1.4); R(x, hx - hw, MARK - 22 + j, hw * 2, 1, '#00a800'); P(x, hx - hw, MARK - 22 + j, '#005000'); P(x, hx + hw - 1, MARK - 22 + j, '#005000'); }
    R(x, hx - 4, MARK - 14, 2, 4, '#005000'); R(x, hx + 4, MARK - 12, 2, 4, '#005000');
    const mxp = Math.round(k * 140 - mod(cx * 0.3, 140)) + 70;
    for (const [dx, dy, r] of [[0, 0, 5], [8, -3, 6], [16, 0, 5]]) disc(x, mxp + dx, 14 + dy, r, '#fcfcfc');
    R(x, mxp - 3, 18, 22, 2, '#fcfcfc'); R(x, mxp - 3, 20, 22, 1, '#3cbcfc');
  }
  // marken
  // marken: stenblock med ljus överkant och en spricka (inte tegel – teglet sitter i luften)
  for (let gx = -mod(cx, 16); gx < W; gx += 16) for (const gy of [MARK, MARK + 16]) {
    R(x, gx, gy, 16, 16, '#c84c0c'); R(x, gx, gy, 15, 1, '#fcbcb0'); R(x, gx, gy + 1, 1, 14, '#fcbcb0');
    R(x, gx + 15, gy, 1, 16, '#000000'); R(x, gx, gy + 15, 16, 1, '#000000');
    R(x, gx + 9, gy + 1, 1, 6, '#000000'); R(x, gx + 10, gy + 7, 5, 1, '#000000'); R(x, gx + 10, gy + 1, 1, 6, '#fcbcb0');
    R(x, gx + 1, gy + 10, 5, 1, '#000000'); R(x, gx + 6, gy + 11, 1, 4, '#000000'); R(x, gx + 7, gy + 11, 1, 4, '#fcbcb0');
  }
  const sx = (wx) => Math.round(wx - mod(cx, VARLD) + (wx < mod(cx, VARLD) - 64 ? VARLD : 0));
  // block: tegel ? tegel
  const fasJ = mod(mx, VARLD), studs = fasJ > 118 && fasJ < 132 ? -3 : 0, anvand = fasJ > 120 && fasJ < 300;
  for (const [bx, typ] of [[112, 't'], [128, 'q'], [144, 't']]) {
    const X = sx(bx), Y = 16 + (typ === 'q' ? studs : 0);
    if (X < -16 || X > W) continue;
    if (typ === 't') { R(x, X, Y, 16, 16, '#c84c0c'); for (const ry of [0, 4, 8, 12]) R(x, X, Y + ry, 16, 1, '#000000'); for (let ry = 0; ry < 4; ry++) R(x, X + (ry % 2 ? 4 : 10), Y + ry * 4, 1, 4, '#000000'); R(x, X, Y + 1, 16, 1, '#fcbcb0'); }
    else {
      R(x, X, Y, 16, 16, anvand ? '#a05828' : '#fc9838'); R(x, X, Y, 16, 1, anvand ? '#c87848' : '#fcd8a8'); R(x, X + 15, Y, 1, 16, '#000000'); R(x, X, Y + 15, 16, 1, '#000000');
      for (const [rx, ry] of [[2, 2], [12, 2], [2, 12], [12, 12]]) P(x, X + rx, Y + ry, '#000000');
      if (!anvand) { T(x, '?', X + 5, Y + 4, '#6a3810', BIG); T(x, '?', X + 4, Y + 4, '#fcfcfc', BIG); }
    }
  }
  // myntet som studsar upp ur ?-blocket
  if (fasJ > 120 && fasJ < 150) { const p = (fasJ - 120) / 30, X = sx(128) + 5, Y = 10 - Math.sin(p * Math.PI) * 18, bw = Math.max(1, Math.round(Math.abs(Math.cos(t * 12)) * 6)); R(x, X + 3 - bw / 2, Y, bw, 12, '#fcbc3c'); R(x, X + 3 - bw / 2, Y, 1, 12, '#fce890'); }
  // röret
  const rx = sx(272);
  if (rx > -32 && rx < W) {
    R(x, rx + 2, MARK - 26, 28, 26, '#00a800'); R(x, rx + 5, MARK - 26, 3, 26, '#80d010'); R(x, rx + 10, MARK - 26, 1, 26, '#80d010'); R(x, rx + 24, MARK - 26, 4, 26, '#006800');
    R(x, rx + 2, MARK - 26, 1, 26, '#000000'); R(x, rx + 29, MARK - 26, 1, 26, '#000000');
    R(x, rx, MARK - 38, 32, 13, '#00a800'); R(x, rx + 3, MARK - 37, 3, 11, '#80d010'); R(x, rx + 8, MARK - 37, 1, 11, '#80d010'); R(x, rx + 26, MARK - 37, 4, 11, '#006800');
    R(x, rx, MARK - 38, 32, 1, '#000000'); R(x, rx, MARK - 26, 32, 1, '#000000'); R(x, rx, MARK - 38, 1, 13, '#000000'); R(x, rx + 31, MARK - 38, 1, 13, '#000000');
  }
  // svampisen som patrullerar
  const svx = sx(200 + Math.sin(t * 0.8) * 10);
  if (svx > -16 && svx < W) { spr(x, SVAMPIS, svx, MARK - 14, SVAMPIS_PAL); spr(x, SVAMPIS_FOT[Math.floor(t * 5) % 2], svx, MARK - 3, SVAMPIS_PAL); }
  // Marco: springer och hoppar mot blocket, över svampisen och över röret
  let hopp = 0;
  for (const [a, b, h] of [[96, 128, 30], [182, 222, 26], [246, 318, 44]]) if (fasJ > a && fasJ < b) hopp = Math.sin(((fasJ - a) / (b - a)) * Math.PI) * h;
  if (fasJ > 128 && fasJ < 132) hopp = Math.min(hopp, 30);
  const my = MARK - 16 - Math.round(hopp), ben = hopp > 1 ? 1 : Math.floor(t * 9) % 2;
  spr(x, MARCO, 32, my, MARCO_PAL); spr(x, MARCO_BEN[ben], 32, my + 13, MARCO_PAL);
  T(x, 'PIPO', 4, 4, '#000000'); T(x, 'PIPO', 3, 3, '#fcfcfc');
  T(x, 'BANA 1-1', W - 4 - TW('BANA 1-1') + 1, 4, '#000000'); T(x, 'BANA 1-1', W - 4 - TW('BANA 1-1'), 3, '#fcfcfc');
}

// ---------- 1989 TETRIX på fickkonsolen (Tetris på Game Boy) ----------
const GB = ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'];
function tetrix(x, t) {
  R(x, 0, 0, 80, 72, GB[3]);
  const FX = 8, FY = 4, C = 4;
  // tegelväggar runt planen
  for (let y = 0; y < 72; y += 4) for (const wx of [FX - 6, FX + 40 + 1]) { R(x, wx, y, 5, 4, GB[1]); R(x, wx, y + 3, 5, 1, GB[0]); P(x, wx + (y % 8 ? 1 : 3), y, GB[0]); }
  const fas = mod(t, 5.2);
  const block = (cx, cy, nyans = 1) => { const X = FX + cx * C, Y = FY + cy * C; R(x, X, Y, C, C, GB[0]); R(x, X + 1, Y + 1, C - 2, C - 2, GB[nyans + 1] || GB[2]); };
  // stapeln: fyra fulla rader utom kolumn 7, plus lite ojämnt ovanpå
  const TOPP = [[0, 11], [1, 11], [2, 10], [2, 11], [3, 11], [8, 11], [9, 10], [9, 11], [4, 10]];
  const rensad = fas > 3.7;
  if (!rensad) {
    for (let r = 12; r < 16; r++) for (let k = 0; k < 10; k++) if (k !== 7) block(k, r, fas > 3.1 && Math.floor(fas * 10) % 2 ? 2 : (k + r) % 3 ? 0 : 1);
    for (const [k, r] of TOPP) block(k, r, 1);
  } else for (const [k, r] of TOPP) block(k, r + 4, 1);
  // den långa biten faller ner i hålet
  if (!rensad) { const steg = Math.min(12, Math.floor(fas / 0.24)); for (let i = 0; i < 4; i++) block(7, steg + i, fas > 3.1 && Math.floor(fas * 10) % 2 ? 2 : 0); }
  // högerpanelen
  const PX = 52;
  R(x, PX, 4, 26, 64, GB[2]); R(x, PX, 4, 26, 1, GB[0]); R(x, PX, 67, 26, 1, GB[0]);
  T(x, 'POÄNG', PX + 3, 8, GB[0]); T(x, String(rensad ? 1240 : 40).padStart(5, '0'), PX + 3, 16, GB[0]);
  T(x, 'RADER', PX + 3, 26, GB[0]); T(x, rensad ? '4' : '0', PX + 3, 34, GB[0]);
  T(x, 'NÄSTA', PX + 3, 44, GB[0]); R(x, PX + 4, 51, 18, 13, GB[3]);
  for (const [k, r] of [[0, 0], [1, 0], [1, 1], [2, 1]]) { const X = PX + 6 + k * 4, Y = 54 + r * 4; R(x, X, Y, 4, 4, GB[0]); R(x, X + 1, Y + 1, 2, 2, GB[1]); }
  if (fas > 3.7 && fas < 4.8) { R(x, FX + 2, 26, 36, 11, GB[0]); T(x, 'BLOCKFALL!', FX + 6, 29, GB[3]); }
}

// ---------- 1991 SONNY THE HEDGEHOG (Sonic the Hedgehog) ----------
function sonny(x, t) {
  const W = 128, H = 90, cx = t * 150, MARK = 64;
  toning(x, 0, 0, W, 36, ['#2048d0', '#3c6ce8', '#6c98f8', '#a8c8ff']);
  // hav med glitter
  R(x, 0, 36, W, 14, '#2850c8'); for (let i = 0; i < 18; i++) { const gx = mod(i * 37 - cx * 0.15, W), gy = 38 + (i * 5) % 11; R(x, gx, gy, 3 + (i % 3), 1, Math.floor(t * 6 + i) % 3 ? '#88b0ff' : '#ffffff'); }
  // bakre kullar (rutiga) i parallax
  for (let k = -1; k < 4; k++) { const hx = k * 48 - mod(cx * 0.35, 48); R(x, hx, 46, 40, 6, '#208020'); R(x, hx + 4, 44, 32, 2, '#208020'); for (let i = 0; i < 40; i += 4) R(x, hx + i, 48 + ((i / 4) % 2) * 2, 2, 2, '#106010'); }
  // loopen i bakgrunden
  const lx = Math.round(200 - mod(cx * 0.7, 320));
  for (let a = 0; a < 64; a++) { const v = (a / 64) * Math.PI * 2; for (let r = 16; r < 22; r++) P(x, lx + Math.cos(v) * r, 36 + Math.sin(v) * r, (Math.floor(a / 4) + Math.floor(r / 3)) % 2 ? '#c06020' : '#8c3c10'); }
  // marken: gräs och rutigt brunt
  for (let gx = -mod(cx, 8); gx < W; gx += 8) for (let gy = MARK; gy < H; gy += 8) R(x, gx, gy, 8, 8, ((Math.floor((gx + cx) / 8) + gy / 8) % 2) ? '#c06020' : '#8c3c10');
  R(x, 0, MARK - 3, W, 4, '#40c040'); for (let gx = -mod(cx, 6); gx < W; gx += 6) { R(x, gx, MARK - 5, 2, 2, '#40c040'); R(x, gx + 3, MARK + 1, 2, 2, '#208020'); }
  // palmer
  for (let k = -1; k < 3; k++) {
    const px = Math.round(k * 90 - mod(cx * 0.9, 90)) + 60;
    for (let j = 0; j < 22; j++) R(x, px + Math.round(Math.sin(j / 7) * 2), MARK - 4 - j, 3, 1, j % 3 ? '#a06030' : '#704018');
    for (const [dx, dy] of [[-8, 2], [-5, -1], [0, -2], [5, -1], [8, 2]]) R(x, px + dx - 2, MARK - 27 + dy, 7, 2, '#20a020');
  }
  // ringar som tas när Sonny passerar
  const sonX = 40;
  for (let i = 0; i < 12; i++) {
    const wx = i * 34 + 60, X = Math.round(wx - mod(cx, 408) + (wx < mod(cx, 408) - 20 ? 408 : 0)), Y = MARK - 16 - Math.round(Math.sin(i * 0.9) * 8);
    if (X < sonX + 4 && X > sonX - 30) continue;
    // ringen vrider sig: full bredd 7, kanten blir en streck när den står på högkant
    const bw = Math.max(1, Math.round(Math.abs(Math.cos(t * 6 + i)) * 7)), X0 = Math.round(X + 3.5 - bw / 2);
    if (bw <= 2) R(x, X0, Y, bw, 7, '#f8c000');
    else { R(x, X0 + 1, Y, bw - 2, 1, '#fff0a0'); R(x, X0 + 1, Y + 6, bw - 2, 1, '#c89000'); R(x, X0, Y + 1, 1, 5, '#f8c000'); R(x, X0 + bw - 1, Y + 1, 1, 5, '#c89000'); if (bw > 4) { P(x, X0 + 1, Y + 1, '#f8c000'); P(x, X0 + bw - 2, Y + 5, '#c89000'); } }
  }
  // Sonny i spinnboll med fartstreck
  const sy = MARK - 8 - Math.round(Math.abs(Math.sin(t * 2.2)) * 10);
  for (let i = 1; i < 5; i++) R(x, sonX - 9 - i * 6, sy - 3 + i, 5, 1, '#9cc8ff');
  // taggarna bakåt, sedan bollen som snurrar
  for (const [dy, l] of [[-4, 5], [0, 6], [4, 5]]) for (let i = 0; i < l; i++) R(x, sonX - 6 - i, sy + dy + Math.round((i * dy) / 8), 2, Math.max(1, 3 - Math.floor(i / 2)), '#1030a0');
  disc(x, sonX, sy, 7, '#1848d0');
  const v = t * 30;
  for (let i = 0; i < 3; i++) { const a = v + (i * Math.PI * 2) / 3; for (let r = 1; r < 7; r++) P(x, sonX + Math.cos(a + r * 0.35) * r, sy + Math.sin(a + r * 0.35) * r, '#5c8cf8'); }
  R(x, sonX + 1, sy - 4, 2, 1, '#e8f0ff'); P(x, sonX + 3, sy - 3, '#e8f0ff');
  T(x, 'RINGAR 23', 4, 4, '#000040'); T(x, 'RINGAR 23', 3, 3, '#f8e000');
}

// ---------- 2006 VI SPORT bowling (Wii Sports) ----------
function viSport(x, t) {
  const W = 160, H = 90, fas = mod(t, 5.4);
  toning(x, 0, 0, W, 34, ['#d8eefc', '#bfe2f8', '#a8d4f2']);
  R(x, 0, 30, W, 4, '#7aa8d0');
  // banan i perspektiv
  for (let y = 34; y < H; y++) {
    const p = (y - 34) / (H - 34), hw = 12 + p * 44, mx = W / 2;
    R(x, mx - hw - 6 - p * 4, y, 6 + p * 4, 1, '#9aa4b0');
    R(x, mx + hw, y, 6 + p * 4, 1, '#9aa4b0');
    R(x, mx - hw, y, hw * 2, 1, (y % 6 < 3) ? '#ecc890' : '#e4bc80');
    for (const s of [-0.5, 0, 0.5]) P(x, mx + s * hw, y, '#d8a868');
  }
  // käglor (tio i triangel) – flyger iväg när klotet träffar
  const traff = fas > 2.9, flyg = Math.max(0, fas - 2.9);
  const KAGLA = [[0, 0], [-1, 1], [1, 1], [-2, 2], [0, 2], [2, 2], [-3, 3], [-1, 3], [1, 3], [3, 3]];
  KAGLA.slice().reverse().forEach(([k, r], i) => {
    let X = W / 2 + k * 3.2, Y = 32 - r * 2.2;
    if (traff) { X += k * flyg * 22 + Math.sin(i * 7) * flyg * 10; Y -= Math.max(0, 12 * flyg - flyg * flyg * 9) - flyg * 4; }
    if (traff && flyg > 1.6) return;
    R(x, X, Y, 2, 5, '#ffffff'); R(x, X, Y + 1, 2, 1, '#e02030'); P(x, X, Y - 1, '#ffffff');
  });
  // klotet rullar bort mot käglorna
  if (fas > 1 && fas < 3.1) {
    const p = Math.min(1, (fas - 1) / 1.9), y = H - 8 - p * (H - 44), r = Math.round(5 - p * 3.4), bx = W / 2 + Math.sin(p * 3) * 6 * (1 - p);
    disc(x, Math.round(bx), Math.round(y), Math.max(1, r), '#2858d8'); P(x, Math.round(bx) - 1, Math.round(y) - 1, '#9cc0ff');
  }
  // figuren (stort runt huvud) som svingar armen
  const fx = 34, fy = 60;
  R(x, fx - 6, fy + 2, 12, 16, '#e05050'); R(x, fx - 6, fy + 18, 5, 10, '#3a4a6a'); R(x, fx + 1, fy + 18, 5, 10, '#3a4a6a');
  disc(x, fx, fy - 6, 8, '#f8d0a8'); R(x, fx - 8, fy - 15, 16, 5, '#5a3820'); R(x, fx - 8, fy - 11, 3, 4, '#5a3820'); R(x, fx + 5, fy - 11, 3, 4, '#5a3820');
  R(x, fx - 4, fy - 7, 2, 3, '#202020'); R(x, fx + 2, fy - 7, 2, 3, '#202020'); R(x, fx - 2, fy - 1, 5, 1, '#c05040'); P(x, fx - 3, fy - 2, '#c05040'); P(x, fx + 3, fy - 2, '#c05040');
  const sving = fas < 1 ? -1.2 + fas * 2.6 : 1.4;
  for (let i = 0; i < 12; i++) R(x, fx + 6 + Math.sin(sving) * i, fy + 4 + Math.cos(sving) * i, 3, 2, '#f8d0a8');
  if (fas < 1) disc(x, Math.round(fx + 7 + Math.sin(sving) * 13), Math.round(fy + 5 + Math.cos(sving) * 13), 4, '#2858d8');
  // poängrutor överst
  for (let i = 0; i < 10; i++) { R(x, 6 + i * 15, 3, 14, 9, '#ffffff'); R(x, 6 + i * 15, 3, 14, 1, '#8ab0d8'); R(x, 6 + i * 15, 3, 1, 9, '#8ab0d8'); }
  T(x, 'X', 10, 5, '#2050c0'); T(x, '9', 25, 5, '#2050c0');
  if (fas > 3.4 && fas < 5.2) { const s = 'STRIKE!', w = TW(s, BIG, 2); TK(x, s, W / 2 - w / 2, 40, '#ffd800', '#c02040', BIG, 2); }
}

// ---------- 2011 GRUVKRAFT (Minecraft) ----------
const GK_HOJD = [7, 7, 6, 6, 6, 7, 8, 8, 7, 7, 7, 6, 6, 7, 7, 8, 8, 8, 7, 7];
function gruvkraft(x, t) {
  const W = 160, H = 90, B = 8, MARK = H - 20;
  const bak = fast('gruv', W, H, (y) => {
    toning(y, 0, 0, W, H, ['#6a98f0', '#86acf6', '#a6c4fa']);
    R(y, 142, 5, 14, 14, '#f8f4c0'); R(y, 144, 7, 10, 10, '#fffff0');
    for (const [cx, cy, w] of [[14, 12, 30], [70, 6, 38]]) { R(y, cx, cy, w, 5, '#ffffff'); R(y, cx + 4, cy - 3, w - 12, 3, '#ffffff'); }
    for (let k = 0; k < GK_HOJD.length; k++) {
      const hojd = GK_HOJD[k], X = k * B;
      for (let r = 0; r < hojd; r++) {
        const Y = H - (r + 1) * B, ytan = r === hojd - 1, djup = hojd - 1 - r;
        for (let j = 0; j < B; j++) for (let i = 0; i < B; i++) {
          const h = hash(X + i, Y + j);
          let f;
          if (djup >= 3) f = h < 0.2 ? '#6a6a6a' : h < 0.75 ? '#7f7f7f' : '#939393';
          else f = h < 0.25 ? '#6c4f35' : h < 0.8 ? '#866043' : '#9b7653';
          if (ytan && (j < 2 || (j < 4 && hash(X + i, 99) < 0.45))) f = h < 0.3 ? '#4f8a28' : h < 0.8 ? '#5d9b31' : '#6fb23c';
          P(y, X + i, Y + j, f);
        }
      }
    }
    // ek: stam och lövkrona
    const tx = 3 * B, tb = H - 6 * B;
    for (let r = 0; r < 3; r++) for (let j = 0; j < B; j++) for (let i = 0; i < B; i++) P(y, tx + i, tb - (r + 1) * B + j, i % 3 === 0 ? '#4e3a22' : hash(i, j + r * 9) < 0.3 ? '#5c4428' : '#6b5233');
    for (let by = 0; by < 3; by++) for (let bx = -1; bx < 2; bx++) for (let j = 0; j < B; j++) for (let i = 0; i < B; i++) {
      const h = hash(tx + bx * B + i, tb - 5 * B + by * B + j); if (h < 0.12 || (by === 0 && bx !== 0 && h < 0.5)) continue;
      P(y, tx + bx * B + i, tb - 5 * B + by * B + j, h < 0.4 ? '#2f6a20' : h < 0.85 ? '#3d7a2b' : '#4f9238');
    }
  });
  x.drawImage(bak, 0, 0);
  const mark = (k) => H - GK_HOJD[k] * B;   // markytans y i kolumn k
  // gubben (huvud, kropp, ben – 22 hög) som hackar ett stenblock
  const gx = 9 * B + 1, gy = mark(9) - 22, sving = Math.sin(t * 9);
  R(x, gx, gy, 6, 6, '#c69c6d'); R(x, gx, gy, 6, 2, '#4a3420'); P(x, gx, gy + 2, '#4a3420'); P(x, gx + 5, gy + 2, '#4a3420');
  P(x, gx + 1, gy + 3, '#ffffff'); P(x, gx + 2, gy + 3, '#4a3ec8'); P(x, gx + 3, gy + 3, '#4a3ec8'); P(x, gx + 4, gy + 3, '#ffffff'); R(x, gx + 2, gy + 5, 2, 1, '#6a4a30');
  R(x, gx, gy + 6, 6, 8, '#00a7a7'); R(x, gx, gy + 6, 6, 1, '#20c0c0'); R(x, gx - 2, gy + 6, 2, 5, '#00a7a7'); R(x, gx - 2, gy + 11, 2, 3, '#c69c6d');
  const steg = Math.floor(t * 3) % 2;
  R(x, gx, gy + 14, 3, 7, '#3c3caa'); R(x, gx + 3, gy + 14, 3, 7, steg ? '#34349a' : '#3c3caa'); R(x, gx, gy + 21, 6, 1, '#6a6a6a');
  // armen med hackan
  const ax = gx + 5, ay = gy + 7;
  for (let i = 0; i < 5; i++) R(x, ax + Math.cos(-0.4 + sving * 0.7) * i, ay + Math.sin(-0.4 + sving * 0.7) * i, 2, 2, '#c69c6d');
  const hx = ax + Math.cos(-0.4 + sving * 0.7) * 6, hy = ay + Math.sin(-0.4 + sving * 0.7) * 6;
  R(x, hx - 2, hy - 2, 6, 2, '#8ab0b8'); R(x, hx, hy, 1, 4, '#6b5233');
  // stenblocket som spricker sönder och kommer tillbaka
  const fas = mod(t, 3), sx = 10 * B, sy = mark(10);
  if (fas < 2.4) {
    for (let j = 0; j < B; j++) for (let i = 0; i < B; i++) { const h = hash(i + 500, j); P(x, sx + i, sy + j - 8, h < 0.3 ? '#6a6a6a' : '#8a8a8a'); }
    const sp = Math.floor(fas / 0.4);
    for (let k = 0; k < sp; k++) { const a = hash(k, 3) * 6, b = hash(k, 4) * 6; R(x, sx + 1 + a, sy - 7 + b, 2, 1, '#202020'); P(x, sx + 2 + a, sy - 6 + b, '#202020'); }
  } else { const s = 1 + Math.sin(t * 8) * 1; R(x, sx + 2, sy - 4 + s, 4, 4, '#8a8a8a'); R(x, sx + 2, sy - 4 + s, 4, 1, '#a0a0a0'); }
  // smygaren står och väntar
  const cx = 16 * B, cy = mark(16) - 20;
  const gron = (X, Y, w, h, s) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const v = hash(X + i + s, Y + j); P(x, X + i, Y + j, v < 0.25 ? '#0b7a09' : v < 0.7 ? '#0da70b' : '#5fd35c'); } };
  gron(cx, cy, 8, 8, 200); gron(cx + 2, cy + 8, 4, 8, 300); gron(cx, cy + 16, 8, 4, 400);
  R(x, cx + 1, cy + 2, 2, 2, '#101010'); R(x, cx + 5, cy + 2, 2, 2, '#101010'); R(x, cx + 3, cy + 4, 2, 3, '#101010'); R(x, cx + 2, cy + 5, 1, 2, '#101010'); R(x, cx + 5, cy + 5, 1, 2, '#101010');
  R(x, cx + 3, cy + 19, 2, 1, '#101010');
  if (Math.floor(t * 1.5) % 4 === 3) R(x, cx, cy, 8, 8, 'rgba(255,255,255,0.5)');
  // hjärtan och snabbmenyn längst ner
  for (let i = 0; i < 10; i++) { const X = 30 + i * 6, Y = H - 18; R(x, X, Y + 1, 5, 2, '#d01818'); R(x, X + 1, Y, 1, 1, '#d01818'); R(x, X + 3, Y, 1, 1, '#d01818'); R(x, X + 1, Y + 3, 3, 1, '#d01818'); P(x, X + 2, Y + 4, '#d01818'); P(x, X + 1, Y + 1, '#ff8080'); }
  for (let i = 0; i < 9; i++) { const X = 26 + i * 12, Y = H - 11; R(x, X, Y, 12, 11, '#3a3a3a'); R(x, X + 1, Y + 1, 10, 9, '#8b8b8b'); }
  R(x, 25 + 1 * 12, H - 12, 14, 13, '#ffffff'); R(x, 26 + 1 * 12, H - 11, 12, 11, '#8b8b8b');
  R(x, 29, H - 8, 6, 6, '#5d9b31'); R(x, 29, H - 6, 6, 4, '#866043'); R(x, 41, H - 8, 6, 6, '#7f7f7f'); R(x, 53, H - 8, 6, 6, '#6b5233');
  R(x, 66, H - 9, 1, 7, '#6b5233'); R(x, 64, H - 9, 6, 2, '#8ab0b8');
}

// ---------- 2017 FORTNAJT (Fortnite) ----------
function fortnajt(x, t) {
  const W = 160, H = 90, MARK = 70;
  toning(x, 0, 0, W, MARK, ['#3aa0f0', '#5ab4f8', '#84ccfc', '#b4e2ff']);
  for (const [cx, cy, w] of [[20, 14, 34], [104, 22, 42]]) { const X = mod(cx - t * 4, W + 60) - 30; R(x, X, cy, w, 6, '#ffffff'); R(x, X + 6, cy - 4, w - 14, 4, '#ffffff'); R(x, X, cy + 6, w, 1, '#d8eefc'); }
  // ön: kullar, träd
  R(x, 0, MARK - 10, W, 10, '#54c43c'); for (let i = 0; i < W; i += 1) R(x, i, MARK - 10 - Math.round(4 + Math.sin(i / 13) * 4), 1, 10, '#54c43c');
  for (const tx of [18, 46, 128, 148]) { R(x, tx, MARK - 20, 3, 10, '#7a4a20'); disc(x, tx + 1, MARK - 24, 7, '#2ea02a'); disc(x, tx - 1, MARK - 27, 4, '#46c03c'); }
  R(x, 0, MARK, W, H - MARK, '#3cae30'); for (let i = 0; i < W; i += 5) R(x, i + (i % 3), MARK + 3 + (i % 7), 2, 1, '#2a8c22');
  // stormen: lila vägg från vänster
  const sv = 10 + Math.sin(t * 0.7) * 3;
  for (let y = 0; y < H; y++) { const w = Math.round(sv + Math.sin(y / 6 + t * 3) * 2); R(x, 0, y, w, 1, 'rgba(140,40,220,0.55)'); P(x, w, y, '#d080ff'); }
  // stridsbussen under sin ballong
  const bx = Math.round(W + 30 - mod(t * 16 + 70, W + 80)), by = 30 + Math.round(Math.sin(t * 1.5) * 2);
  for (let j = 0; j < 16; j++) { const hw = Math.round(Math.sin((j / 16) * Math.PI * 0.95 + 0.15) * 9); for (let i = -hw; i < hw; i++) P(x, bx + 14 + i, by - 22 + j, (Math.floor((i + 20) / 3)) % 2 ? '#2a6ce0' : '#f0f4ff'); }
  R(x, bx + 8, by - 6, 1, 6, '#404040'); R(x, bx + 20, by - 6, 1, 6, '#404040');
  R(x, bx, by, 28, 10, '#2a7ae8'); R(x, bx, by, 28, 2, '#5ea4ff'); R(x, bx + 2, by + 2, 18, 4, '#cfefff'); for (let i = 0; i < 3; i++) R(x, bx + 4 + i * 6, by + 2, 1, 4, '#2a7ae8'); R(x, bx + 22, by + 2, 5, 4, '#cfefff');
  R(x, bx, by + 8, 28, 2, '#f8c000'); disc(x, bx + 6, by + 10, 2, '#202020'); disc(x, bx + 22, by + 10, 2, '#202020');
  // figuren som dansar standarddansen
  const fx = 84, fy = MARK + 8, f = Math.floor(t * 4) % 4;
  R(x, fx - 4, fy - 6, 3, 8, '#2a2a40'); R(x, fx + 1, fy - 6, 3, 8, '#2a2a40');
  if (f % 2) { R(x, fx - 6, fy - 4, 4, 3, '#2a2a40'); } else { R(x, fx + 2, fy - 4, 4, 3, '#2a2a40'); }
  R(x, fx - 5, fy - 18, 10, 12, '#f07828'); R(x, fx - 5, fy - 18, 10, 2, '#ff9a48'); R(x, fx + 4, fy - 17, 3, 8, '#4a6a30');
  disc(x, fx, fy - 23, 4, '#e8b088'); R(x, fx - 4, fy - 28, 9, 3, '#6a3818'); R(x, fx - 4, fy - 26, 2, 2, '#6a3818');
  P(x, fx - 2, fy - 23, '#202020'); P(x, fx + 2, fy - 23, '#202020'); R(x, fx - 1, fy - 20, 3, 1, '#a04030');
  const armar = [[[-9, -24], [9, -24]], [[-9, -10], [9, -10]], [[-2, -14], [2, -14]], [[-9, -24], [9, -12]]][f];
  for (const [ax, ay] of armar) { const sx = fx + Math.sign(ax) * 4, sy = fy - 16; for (let i = 0; i <= 6; i++) R(x, sx + (ax - Math.sign(ax) * 4) * i / 6, sy + (ay + 16) * i / 6, 2, 2, '#e8b088'); }
  if (mod(t, 6) > 3.5) { const s = '#1 SEGER-ROYAL', w = TW(s, BIG); TK(x, s, W / 2 - w / 2 + 6, 6, '#ffe040', '#6a1a90', BIG); }
}

// ---------- 2026 GRAND THEFT AUTOMOBIL VI (GTA VI) ----------
function gta6(x, t) {
  const W = 192, H = 108, HOR = 62;
  const bak = fast('gta6', W, H, (y) => {
    toning(y, 0, 0, W, HOR, ['#24124a', '#4a1e6e', '#8a2c80', '#d0447e', '#f4705e', '#ffa050', '#ffd27a']);
    // solen: halv, med synthwave-ränder
    for (let j = -22; j <= 0; j++) {
      const hw = Math.round(Math.sqrt(22 * 22 - j * j)), rad = HOR + j;
      if (j > -14 && (-j) % 4 === 1 + Math.floor((14 + j) / 6)) continue;
      R(y, 128 - hw, rad, hw * 2, 1, j < -12 ? '#fff0a0' : j < -6 ? '#ffd070' : '#ffa058');
    }
    // havet och solens spegling
    toning(y, 0, HOR, W, 18, ['#3a2266', '#2a1a52', '#1c1440']);
    // skyline till vänster med neonfönster
    let bx = 0;
    for (let k = 0; bx < 92; k++) {
      const bw = 8 + Math.floor(hash(k, 1) * 10), bh = 8 + Math.floor(hash(k, 2) * 15) + (bx > 50 ? Math.floor(hash(k, 5) * 10) : 0);
      R(y, bx, HOR - bh, bw, bh, '#180c2c');
      if (hash(k, 3) > 0.6) R(y, bx + bw / 2 - 1, HOR - bh - 6, 1, 6, '#180c2c');
      for (let wy = HOR - bh + 3; wy < HOR - 2; wy += 3) for (let wx = bx + 2; wx < bx + bw - 1; wx += 2) { const h = hash(wx, wy); if (h > 0.62) P(y, wx, wy, h > 0.9 ? '#4ff0ff' : h > 0.8 ? '#ff6ad0' : '#ffd890'); }
      bx += bw + 1;
    }
    // strand och väg
    R(y, 0, 80, W, 3, '#5a3456'); R(y, 0, 83, W, 15, '#26203c'); R(y, 0, 83, W, 1, '#3c3458'); R(y, 0, 97, W, 1, '#4a3c64');
    R(y, 0, 98, W, 10, '#1a1228');
  });
  x.drawImage(bak, 0, 0);
  // solens spegling glittrar på vattnet
  for (let j = 0; j < 7; j++) { const w = 26 - j * 3 + Math.round(Math.sin(t * 3 + j) * 3), Y = HOR + 2 + j * 2; R(x, 128 - w / 2 + Math.sin(t * 2 + j) * 2, Y, w, 1, j < 3 ? '#ffb060' : '#e06a6a'); }
  // vägrenen rör sig (bilen åker åt höger)
  const v = t * 90;
  for (let i = -mod(v, 24); i < W; i += 24) R(x, i, 90, 12, 1, '#e8d890');
  for (let i = -mod(v * 0.6, 14); i < W; i += 14) { R(x, i, 79, 1, 4, '#8a6a7a'); }
  R(x, 0, 79, W, 1, '#8a6a7a');
  // palmer som siluetter i förgrunden, de svajar lite
  for (let k = 0; k < 4; k++) {
    const px = Math.round(mod(k * 70 + 40 - v * 0.9, W + 80) - 40), topp = 22 + (k % 2) * 8, sw = Math.sin(t * 1.3 + k) * 1.5;
    for (let j = 0; j < 98 - topp; j++) R(x, px + Math.round(Math.sin(j / 18) * 4 + (j / (98 - topp)) * 0) , 98 - j, j < 30 ? 3 : 2, 1, '#120a20');
    const tx = px + Math.round(Math.sin((98 - topp) / 18) * 4), ty = topp;
    for (const [dx, dy] of [[-16, 8], [-12, 3], [-5, -2], [5, -2], [12, 3], [16, 8], [-8, 10], [9, 10]]) for (let i = 0; i <= 10; i++) R(x, tx + (dx + sw) * i / 10, ty + dy * i / 10 + Math.sin(i / 10 * Math.PI) * -2 * Math.sign(dy + 1), 2, 1, '#120a20');
  }
  // cabrioleten
  const cx = 70, cy = 84, hjul = Math.floor(t * 12) % 2;
  R(x, cx + 2, cy + 2, 36, 6, '#d81e3c'); R(x, cx, cy + 4, 40, 5, '#d81e3c'); R(x, cx + 2, cy + 2, 36, 1, '#ff6a7a'); R(x, cx, cy + 8, 40, 1, '#8a0c20');
  R(x, cx + 14, cy - 1, 2, 3, '#a8e0ff'); R(x, cx + 15, cy - 2, 1, 1, '#a8e0ff');
  R(x, cx + 38, cy + 4, 2, 2, '#fff4c0'); R(x, cx, cy + 4, 1, 2, '#ff3050');
  disc(x, cx + 19, cy - 1, 2, '#2a1420'); R(x, cx + 16, cy - 1, 3, 4, '#2a1420');
  disc(x, cx + 26, cy - 1, 2, '#3a2018'); R(x, cx + 25, cy - 4, 3, 1, '#3a2018');
  for (const hx of [cx + 9, cx + 31]) { disc(x, hx, cy + 9, 3, '#101010'); P(x, hx + (hjul ? 1 : -1), cy + 9 + (hjul ? -1 : 1), '#a0a0a0'); P(x, hx, cy + 9, '#c0c0c0'); }
  // logotypen: GRAND THEFT AUTOMOBIL och ett stort VI i rosa till orange
  T(x, 'BILTJUVEN', 7, 8, '#120a20'); T(x, 'BILTJUVEN', 6, 7, '#ffffff');
  T(x, 'DEL VI', 7, 15, '#120a20'); T(x, 'DEL VI', 6, 14, '#ffffff');
  const VI = ['##.......##.####', '##.......##.####', '.##.....##...##.', '.##.....##...##.', '..##...##....##.', '..##...##....##.', '...##.##.....##.', '...##.##.....##.', '....###.....####', '....###.....####'];
  const grad = ['#ff4fa0', '#ff4fa0', '#ff5a90', '#ff6a80', '#ff7a6a', '#ff8a58', '#ff9a48', '#ffb048', '#ffc850', '#ffd860'];
  for (let j = 0; j < VI.length; j++) for (let i = 0; i < VI[j].length; i++) if (VI[j][i] === '#') { for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) R(x, 6 + i * 2 + dx, 22 + j * 2 + dy, 2, 2, '#120a20'); }
  for (let j = 0; j < VI.length; j++) for (let i = 0; i < VI[j].length; i++) if (VI[j][i] === '#') R(x, 6 + i * 2, 22 + j * 2, 2, 2, grad[j]);
}

const BAS = [
  { id: 'pang', titel: 'PANG!', forebild: 'Pong', ar: 1982, studio: 'ERT EGET', w: 64, h: 48, rita: pang },
  { id: 'pac', titel: 'GLUFS', forebild: 'Pac-Man', ar: 1982, studio: 'MIRAI', w: 96, h: 72, rita: pacMunch },
  { id: 'marco', titel: 'SUPER PIPO', forebild: 'Super Mario Bros.', ar: 1985, studio: 'SVAMPSTUDION', w: 128, h: 96, rita: marco },
  { id: 'tetrix', titel: 'BLOCKFALL', forebild: 'Tetris (Game Boy)', ar: 1989, studio: 'SOYUZ SOFT', w: 80, h: 72, rita: tetrix },
  { id: 'sonny', titel: 'ZIPPY IGELKOTTEN', forebild: 'Sonic the Hedgehog', ar: 1991, studio: 'BLUE DASH', w: 128, h: 90, rita: sonny },
  { id: 'visport', titel: 'VIVA SPORT', forebild: 'Wii Sports', ar: 2006, studio: 'SVAMPSTUDION', w: 160, h: 90, rita: viSport },
  { id: 'gruvkraft', titel: 'BLOCKRIKET', forebild: 'Minecraft', ar: 2011, studio: 'BLOCKSMITH', w: 160, h: 90, rita: gruvkraft },
  { id: 'fortnajt', titel: 'BATTLE ISLAND', forebild: 'Fortnite', ar: 2017, studio: 'TITAN', w: 160, h: 90, rita: fortnajt },
  { id: 'gta6', titel: 'BILTJUVEN VI', forebild: 'GTA VI', ar: 2026, studio: 'ASFALT', w: 192, h: 108, rita: gta6 },
];
export const GLIMTAR = [...BAS, ...G_A, ...G_B, ...G_C, ...G_D, ...G_E, ...G_F, ...G_MOBIL];
export const GLIMT = Object.fromEntries(GLIMTAR.map((g) => [g.id, g]));

const duk = new Map();
export function glimtBild(id, t) {
  const g = GLIMT[id]; if (!g) return null;
  let c = duk.get(id);
  if (!c) { c = document.createElement('canvas'); c.width = g.w; c.height = g.h; duk.set(id, c); }
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  g.rita(x, t);
  return c;
}
