// Spelglimtar för telefonerna (app-butiken). Samma format som BAS i ../glimtar.js. Godiskross och
// Tunnelbanesurfarna är stående, som på en telefon; Arga fåglar ligger.
import { SMALL, BIG, R, P, T, TW, TK, spr, tri, mod, disc, hash, toning, fast } from '../pix.js';
import { $t } from '../../core/i18n.js';

// ---------- 2009 ARGA FÅGLAR (Angry Birds) ----------
const FAGEL = [
  '....KK.......',
  '...KRRKK.....',
  '..KRRRRRK....',
  '.KRRRRRRRK...',
  'KRRKKRRKKRK..',
  'KRWBKRRWBKRK.',
  'KRRRRYYRRRRK.',
  'KRRRYYYYRRRKK',
  'KRWWRYYRWWRRK',
  '.KWWWWWWWWRK.',
  '..KWWWWWWRK..',
  '...KKKKKKK...',
];
const FAGEL_PAL = { K: '#2a1010', R: '#e0302c', W: '#f4e4d0', B: '#101010', Y: '#f8b818' };
const GRIS = [
  '...KKKKK...',
  '.KKGGGGGKK.',
  'KGGGGGGGGGK',
  'KGWBGGGWBGK',
  'KGGGLLLGGGK',
  'KGGLDLDLGGK',
  'KGGGLLLGGGK',
  '.KGGGGGGGK.',
  '..KKKKKKK..',
];
const GRIS_PAL = { K: '#1e4010', G: '#7cc840', W: '#ffffff', B: '#101010', L: '#a4e060', D: '#2e5a18' };
function argaFaglar(x, t) {
  const W = 192, H = 108, MARK = 92, fas = mod(t, 5.6);
  x.drawImage(fast('arga', W, H, (y) => {
    toning(y, 0, 0, W, MARK, ['#8ed0f2', '#a8dcf6', '#c4e8fa', '#dcf2fc']);
    for (let i = 0; i < W; i++) { const h = 14 + Math.round(Math.sin(i / 23) * 5 + Math.sin(i / 9) * 2); R(y, i, MARK - h, 1, h, '#a8d890'); }
    for (const [cx, cw] of [[30, 26], [118, 34]]) { R(y, cx, 14, cw, 6, '#ffffff'); R(y, cx + 5, 10, cw - 12, 4, '#ffffff'); }
    R(y, 0, MARK, W, 3, '#5cb82c'); R(y, 0, MARK + 3, W, H - MARK - 3, '#8a5a2c'); for (let i = 0; i < W; i += 7) R(y, i + (i % 3), MARK + 6 + (i % 5), 3, 1, '#6a4420');
    // kullen med slangbellan
    for (let j = 0; j < 8; j++) R(y, 18 - j * 1.5, MARK - j, 26 + j * 3, 1, '#5cb82c');
    R(y, 28, MARK - 30, 4, 22, '#7a4a20'); R(y, 23, MARK - 36, 3, 9, '#7a4a20'); R(y, 33, MARK - 36, 3, 9, '#7a4a20'); R(y, 26, MARK - 29, 8, 3, '#7a4a20');
    R(y, 29, MARK - 30, 1, 22, '#a06a34');
  }), 0, 0);
  // gummibandet och fågeln: dras bakåt, flyger i en båge, studsar sedan ner
  const start = [29, MARK - 38], mal = [150, MARK - 30];
  let fx, fy;
  if (fas < 0.7) { const d = Math.min(1, fas / 0.5) * 9; fx = start[0] - d; fy = start[1] + d * 0.5; }
  else if (fas < 2.1) { const p = (fas - 0.7) / 1.4; fx = start[0] + (mal[0] - start[0]) * p; fy = start[1] + (mal[1] - start[1]) * p - Math.sin(p * Math.PI) * 46; }
  else { const p = Math.min(1, (fas - 2.1) / 1.2); fx = mal[0] - 8 * p; fy = mal[1] + (MARK - 12 - mal[1]) * p; }
  if (fas < 0.75) { x.fillStyle = '#3a1a0a'; for (const ax of [24, 34]) for (let i = 0; i <= 8; i++) R(x, ax + (fx + 6 - ax) * (i / 8), MARK - 34 + (fy + 6 - (MARK - 34)) * (i / 8), 1, 1, '#3a1a0a'); }
  // prickarna efter flygturen
  if (fas > 0.8 && fas < 5) for (let i = 1; i < 12; i++) { const p = i / 12; if (0.7 + p * 1.4 > Math.min(fas, 2.1)) break; R(x, start[0] + (mal[0] - start[0]) * p + 6, start[1] + (mal[1] - start[1]) * p - Math.sin(p * Math.PI) * 46 + 6, i % 2 ? 2 : 1, i % 2 ? 2 : 1, '#ffffff'); }
  // bygget: trä, sten och is – välter efter träffen
  const traff = fas > 2.05, v = traff ? Math.min(1, (fas - 2.05) / 0.9) : 0;
  const block = (bx, by, bw, bh, typ, dx = 0, dy = 0) => {
    const f = { tra: ['#d0965a', '#9a6430'], sten: ['#a8a8b0', '#6a6a74'], is: ['#bfe6fa', '#7ab8d8'] }[typ];
    R(x, bx + dx, by + dy, bw, bh, f[0]); R(x, bx + dx, by + dy + bh - 1, bw, 1, f[1]); R(x, bx + dx + bw - 1, by + dy, 1, bh, f[1]);
    if (typ === 'tra') for (let i = 3; i < Math.max(bw, bh); i += 5) bw > bh ? P(x, bx + dx + i, by + dy + 1, f[1]) : P(x, bx + dx + 1, by + dy + i, f[1]);
  };
  block(140, MARK - 22, 4, 22, 'tra'); block(168, MARK - 22, 4, 22, 'tra'); block(140, MARK - 26, 32, 4, 'tra', v * 10, v * 18);
  block(146, MARK - 10, 20, 10, 'sten'); block(150, MARK - 40, 4, 14, 'is', v * -6, v * 20); block(160, MARK - 40, 4, 14, 'is', v * 14, v * 22);
  block(148, MARK - 44, 18, 4, 'tra', v * 16, v * 32);
  // grisarna: den på toppen försvinner i ett moln vid träffen
  spr(x, GRIS, 151, MARK - 21, GRIS_PAL);
  if (!traff) spr(x, GRIS, 152, MARK - 35, GRIS_PAL);
  else if (fas < 2.9) { const r = Math.round(3 + v * 6); disc(x, 157, MARK - 31, r, '#ffffff'); disc(x, 152, MARK - 33, r - 2, '#f0f0f0'); disc(x, 162, MARK - 28, r - 3, '#f8f8f8'); }
  spr(x, FAGEL, Math.round(fx), Math.round(fy), FAGEL_PAL);
  // poäng och stjärnor
  const poang = traff ? Math.min(25450, Math.round(12000 + v * 13450)) : 12000;
  TK(x, String(poang), W - 6 - TW(String(poang), BIG), 5, '#ffffff', '#202020', BIG);
  for (let i = 0; i < 3; i++) { const X = 6 + i * 9; R(x, X + 2, 4, 3, 3, '#e0302c'); R(x, X + 1, 5, 5, 3, '#e0302c'); P(x, X + 2, 5, '#f4e4d0'); }
  if (fas > 3.6) for (let i = 0; i < 3; i++) if (fas > 3.6 + i * 0.35) { const X = 74 + i * 16, Y = 30 - (i === 1 ? 4 : 0); R(x, X + 4, Y, 3, 3, '#ffd800'); R(x, X, Y + 3, 11, 3, '#ffd800'); R(x, X + 2, Y + 6, 7, 3, '#ffd800'); R(x, X + 1, Y + 9, 3, 2, '#ffd800'); R(x, X + 7, Y + 9, 3, 2, '#ffd800'); R(x, X + 4, Y + 1, 1, 6, '#fff4a0'); }
}

// ---------- 2012 GODISKROSS (Candy Crush Saga) – stående ----------
const GODIS = [
  (x, X, Y) => { R(x, X + 1, Y + 2, 6, 4, '#e02028'); R(x, X + 2, Y + 1, 4, 6, '#e02028'); P(x, X + 2, Y + 2, '#ff9a9a'); P(x, X + 3, Y + 2, '#ff9a9a'); },          // röd böna
  (x, X, Y) => { R(x, X, Y + 2, 8, 4, '#f08018'); R(x, X + 2, Y + 1, 4, 6, '#f08018'); R(x, X + 2, Y + 3, 4, 1, '#ffc070'); },                                       // orange pastill
  (x, X, Y) => { R(x, X + 3, Y, 2, 2, '#f8d020'); R(x, X + 2, Y + 2, 4, 2, '#f8d020'); R(x, X + 1, Y + 4, 6, 3, '#f8d020'); P(x, X + 3, Y + 4, '#fff4a0'); },             // gul droppe
  (x, X, Y) => { R(x, X + 1, Y + 1, 6, 6, '#30b030'); R(x, X + 2, Y + 2, 2, 2, '#90f090'); R(x, X + 1, Y + 6, 6, 1, '#1a7a1a'); },                                     // grön fyrkant
  (x, X, Y) => { disc(x, X + 4, Y + 4, 3, '#2a70e8'); P(x, X + 3, Y + 2, '#a0d0ff'); },                                                                                // blå kula
  (x, X, Y) => { for (const [a, b] of [[2, 2], [5, 2], [3, 5], [2, 5], [5, 5]]) disc(x, X + a, Y + b, 1, '#a040d0'); P(x, X + 3, Y + 3, '#e0a0ff'); },                  // lila klase
];
const BRADE0 = ['0213450', '1342102', '2405133', '3110524', '4252031', '5031240', '0124353'];
function godiskross(x, t) {
  const W = 90, H = 160, fas = mod(t, 4.4), C = 10, BX = 10, BY = 44;
  x.drawImage(fast('godis', W, H, (y) => {
    toning(y, 0, 0, W, H, ['#6a2a9a', '#9a3aa8', '#d060a8', '#f0a0c0']);
    for (let i = 0; i < 14; i++) { const cx = hash(i, 1) * W, cy = hash(i, 2) * H; disc(y, cx, cy, 2 + Math.floor(hash(i, 3) * 3), 'rgba(255,255,255,0.12)'); }
    R(y, BX - 2, BY - 2, 7 * C + 4, 7 * C + 4, 'rgba(20,20,70,0.55)');
    for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) if ((i + j) % 2) R(y, BX + i * C, BY + j * C, C, C, 'rgba(255,255,255,0.06)');
    R(y, 4, 4, W - 8, 30, '#3a1a6a'); R(y, 4, 4, W - 8, 1, '#c890ff');
  }), 0, 0);
  // brädet: rad 3 får tre gröna i rad när två godisar byter plats – de försvinner och nya faller ner
  const brade = BRADE0.map((r) => r.split('').map(Number));
  brade[3][2] = 3; brade[3][3] = 2; brade[3][4] = 3; brade[2][3] = 3;   // [2][3] grön byter med [3][3] gul
  const byt = Math.min(1, fas / 0.6), borta = fas > 1.3, fall = Math.max(0, Math.min(1, (fas - 1.3) / 0.6));
  for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) {
    let typ = brade[j][i], rad = j;
    if (i === 3 && j === 2) { rad = 2 + byt; typ = 3; } else if (i === 3 && j === 3) { rad = 3 - byt; typ = 2; }   // bytet
    const iRaden = (j === 3 && (i === 2 || i === 4)) || (i === 3 && j === 2);
    if (borta && iRaden) continue;
    if (borta && rad < 3 && i >= 2 && i <= 4) rad += fall;   // allt ovanför raden faller ett steg
    const X = BX + i * C + 1, Y = BY + rad * C + 1;
    if (fas > 0.9 && fas < 1.3 && iRaden && Math.floor(t * 16) % 2) R(x, X - 1, Y - 1, 10, 10, 'rgba(255,255,255,0.7)');
    GODIS[typ](x, X, Y);
  }
  // nya godisar faller in uppifrån
  if (borta) for (let i = 2; i <= 4; i++) GODIS[(i * 2 + 1) % 6](x, BX + i * C + 1, BY + (fall - 1) * C + 1);
  // gnistor där raden försvann
  if (fas > 1.3 && fas < 2.2) for (let k = 0; k < 10; k++) { const a = k * 0.63, r = (fas - 1.3) * 26; P(x, BX + 3.5 * C + Math.cos(a) * r, BY + 3.5 * C + Math.sin(a) * r, k % 2 ? '#ffffff' : '#ffe060'); }
  // överst: drag, poäng och mål
  T(x, $t('DRAG'), 8, 8, '#d8c0ff'); TK(x, fas > 1.3 ? '22' : '23', 8, 16, '#ffffff', '#3a1a6a', BIG);
  T(x, $t('MÅL 20 000'), W - 8 - TW($t('MÅL 20 000')), 8, '#d8c0ff');
  const p = fas > 1.3 ? 14820 : 14700; T(x, String(p), W - 8 - TW(String(p)), 16, '#ffffff');
  R(x, 30, 26, 52, 4, '#20103a'); R(x, 30, 26, Math.round(52 * p / 20000), 4, '#f0c020');
  if (fas > 1.5 && fas < 3.6) { const s = $t('LJUVLIGT!'), w = TW(s, BIG); TK(x, s, W / 2 - w / 2, 124, '#ffe040', '#a02070', BIG); }
  // förstärkare längst ner
  for (let i = 0; i < 4; i++) { const X = 10 + i * 19; R(x, X, 140, 15, 13, '#3a1a6a'); R(x, X + 1, 141, 13, 11, '#5a2a9a'); GODIS[(i + 2) % 6](x, X + 4, 143); }
}

// ---------- 2012 TUNNELBANESURFARNA (Subway Surfers) – stående ----------
function tunnelbana(x, t) {
  const W = 90, H = 160, HOR = 52, s0 = t * 7, MAXS = 15;
  const skala = (s) => 1 / (1 + s * 0.45), yAv = (s) => HOR + (H - HOR) * skala(s), xAv = (bana, s) => W / 2 + bana * 30 * skala(s);
  toning(x, 0, 0, W, HOR + 1, ['#58aef0', '#86c8f6', '#bfe0fa']);
  for (let i = 0; i < 7; i++) { const bh = 8 + Math.floor(hash(i, 7) * 12); R(x, i * 14 - 4, HOR - bh, 12, bh, '#a4b2c8'); }
  // väggarna: från spårets kant ut till skärmkanten, med graffitipaneler som rusar förbi
  for (let j = HOR + 1; j < H; j++) {
    const k = (j - HOR) / (H - HOR), kant = Math.round(W / 2 - 50 * k - 2);
    R(x, 0, j, Math.max(0, kant), 1, '#8c8c94'); R(x, W - Math.max(0, kant), j, Math.max(0, kant), 1, '#7c7c84');
    R(x, Math.max(0, kant), j, W - 2 * Math.max(0, kant), 1, '#a6825c');
  }
  const FARG = ['#ff4fa0', '#40d0ff', '#ffd040', '#60e060', '#b070ff'];
  for (let k = 0; k < 8; k++) {
    const s = mod(k * 2.1 - s0 * 0.9, 16.8); if (s < 0.2) continue;
    const sk = skala(s), y = yAv(s), h = 34 * sk, w = 10 * sk + 1, sida = k % 2 ? 1 : -1, X = W / 2 + sida * (52 * sk + 4) - (sida < 0 ? w : 0);
    R(x, X, y - h, w, h * 0.6, FARG[k % 5]); R(x, X + w * 0.2, y - h * 0.8, w * 0.6, h * 0.3, FARG[(k + 2) % 5]);
  }
  // syllar och räls (rullar mot spelaren)
  for (let k = 0; k < 30; k++) {
    const s = MAXS - mod(s0, 0.6) - k * 0.6; if (s < 0) continue;
    const y = Math.round(yAv(s)), sk = skala(s);
    for (const bana of [-1, 0, 1]) R(x, xAv(bana, s) - 11 * sk, y, Math.max(1, 22 * sk), Math.max(1, Math.round(2.5 * sk)), '#5a3a20');
  }
  for (const bana of [-1, 0, 1]) for (const sida of [-0.27, 0.27]) for (let j = HOR + 2; j < H; j++) {
    const sk = (j - HOR) / (H - HOR), sx = W / 2 + (bana + sida) * 30 * sk; R(x, sx, j, Math.max(1, Math.round(sk * 2)), 1, '#c8c8d0');
  }
  // tåget i vänster spår kommer närmare
  const ts = mod(16 - t * 4.5, 20) + 1.2, tk = skala(ts), ty = yAv(ts), tw = 24 * tk, th = 34 * tk, tx = xAv(-1, ts) - tw / 2;
  R(x, tx, ty - th, tw, th, '#f0a020'); R(x, tx, ty - th, tw, Math.max(1, 4 * tk), '#ffd060'); R(x, tx + tw * 0.12, ty - th * 0.82, tw * 0.76, th * 0.32, '#2a3a5a');
  R(x, tx + tw * 0.1, ty - th * 0.22, tw * 0.18, Math.max(1, 3 * tk), '#ffffa0'); R(x, tx + tw * 0.72, ty - th * 0.22, tw * 0.18, Math.max(1, 3 * tk), '#ffffa0'); R(x, tx, ty - Math.max(1, 3 * tk), tw, Math.max(1, 3 * tk), '#c07010');
  // mynt i mitten och en bom att hoppa över
  for (let k = 0; k < 7; k++) { const s = mod(9 - s0 + k * 1.3, 11); if (s < 0.5) continue; const sk = skala(s), y = yAv(s) - 9 * sk, bw = Math.max(1, Math.round(7 * sk * Math.abs(Math.cos(t * 6 + k)))); R(x, xAv(0, s) - bw / 2, y - 3 * sk, bw, Math.max(2, Math.round(7 * sk)), '#ffd020'); if (bw > 2) R(x, xAv(0, s) - bw / 2, y - 3 * sk, 1, Math.max(2, Math.round(7 * sk)), '#fff4a0'); }
  const bs = mod(12 - s0, 14);
  if (bs > 0.25) { const sk = skala(bs), y = yAv(bs), w = 26 * sk; for (let i = 0; i < 4; i++) R(x, xAv(0, bs) - w / 2 + (i * w) / 4, y - 10 * sk, w / 4 + 1, Math.max(2, Math.round(3 * sk)), i % 2 ? '#ffffff' : '#e02020'); R(x, xAv(0, bs) - w / 2, y - 10 * sk, Math.max(1, Math.round(sk * 2)), 10 * sk, '#606060'); R(x, xAv(0, bs) + w / 2 - 1, y - 10 * sk, Math.max(1, Math.round(sk * 2)), 10 * sk, '#606060'); }
  // löparen bakifrån: keps, luvtröja, hoppar när bommen är nära
  const hopp = bs < 1.6 && bs > 0.25 ? Math.sin(((1.6 - bs) / 1.35) * Math.PI) * 16 : 0;
  const lx = W / 2, ly = H - 10 - hopp, steg = Math.floor(t * 10) % 2;
  R(x, lx - 6, H - 5, 12, 2, 'rgba(0,0,0,0.25)');
  R(x, lx - 5, ly - 6, 4, 8 - steg * 3, '#2a3a8a'); R(x, lx + 1, ly - 6, 4, 5 + steg * 3, '#2a3a8a'); R(x, lx - 5, ly + 1 - steg * 3, 4, 2, '#f0f0f0'); R(x, lx + 1, ly - 2 + steg * 3, 4, 2, '#f0f0f0');
  R(x, lx - 6, ly - 19, 12, 13, '#e03a30'); R(x, lx - 6, ly - 19, 12, 2, '#ff6a50'); R(x, lx - 2, ly - 17, 4, 9, '#c82a24');
  R(x, lx - 8, ly - 17 + steg * 2, 2, 7, '#e03a30'); R(x, lx + 6, ly - 15 - steg * 2, 2, 7, '#e03a30'); R(x, lx + 6, ly - 9 - steg * 2, 2, 2, '#e8b088');
  R(x, lx - 4, ly - 27, 8, 8, '#6a3a1a'); R(x, lx - 5, ly - 28, 10, 3, '#2050c0'); R(x, lx - 2, ly - 30, 4, 2, '#2050c0'); R(x, lx - 6, ly - 23, 2, 4, '#202020'); R(x, lx + 4, ly - 23, 2, 4, '#202020'); R(x, lx - 5, ly - 25, 10, 1, '#202020');
  // poäng, mynt och multiplikator
  T(x, String(Math.floor(t * 137) % 100000).padStart(6, '0'), W - 4 - TW('000000'), 4, '#ffffff');
  R(x, W - 30, 12, 5, 5, '#ffd020'); T(x, String(120 + (Math.floor(t * 3) % 50)), W - 22, 12, '#ffd020');
  TK(x, 'X2', 5, 5, '#ffffff', '#c03030', BIG);
}

export const GLIMTAR = [
  { id: 'argafaglar', titel: $t('KATAPULTKRIGET'), forebild: 'Angry Birds', ar: 2009, studio: $t('FEATHER'), w: 192, h: 108, rita: argaFaglar },
  { id: 'godiskross', titel: $t('SOCKERSTORMEN'), forebild: 'Candy Crush Saga', ar: 2012, studio: $t('SUGARLAB'), w: 90, h: 160, rita: godiskross },
  { id: 'tunnelbana', titel: $t('TUNNELRUSH'), forebild: 'Subway Surfers', ar: 2012, studio: $t('RAILHEAD'), w: 90, h: 160, rita: tunnelbana },
];
