// Spelglimtar, grupp F. Samma format som BAS i ../glimtar.js. Verktygen finns i ../pix.js.
import { SMALL, BIG, R, P, T, TW, TK, spr, tri, mod, disc, hash, toning, fast } from '../pix.js';

// fylld ellips (bordsskivor, skuggor, öar)
const ellips = (x, cx, cy, rx, ry, f) => {
  for (let j = -ry; j <= ry; j++) { const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (j * j) / Math.max(1, ry * ry)))); R(x, cx - hw, cy + j, hw * 2 + 1, 1, f); }
};
// text med tjock kontur (tjock pixlar åt alla håll)
const kontur = (x, s, X, Y, f, kant, F = BIG, k = 1, tjock = 1) => {
  for (let dy = -tjock; dy <= tjock; dy++) for (let dx = -tjock; dx <= tjock; dx++) if (dx || dy) T(x, s, X + dx, Y + dy, kant, F, k);
  T(x, s, X, Y, f, F, k);
};
// text i färgband uppifrån och ner (spelens guldsiffror)
const bandText = (x, s, X, Y, farger, F, k) => {
  const h = F.h * k, n = farger.length;
  farger.forEach((f, i) => { x.save(); x.beginPath(); x.rect(X - 2, Y + Math.floor((i * h) / n), 400, Math.ceil(h / n) + (i === n - 1 ? 4 : 0)); x.clip(); T(x, s, X, Y, f, F, k); x.restore(); });
};

// ---------- 2018 BLAND OSS (Among Us) ----------
// besättningen: bönformad kropp med visir och ryggsäck, vänd åt höger (speglas åt vänster)
// K kontur, B kropp, S skugga, V visir, W visirets glans, D visirets skugga
const BONA = [
  '.....KKKKK....',
  '....KBBBBBK...',
  '...KBBBBBBBK..',
  '...KBBBBKKKKK.',
  '.KKKBBBKVVVWWK',
  'KSSKBBBKVVVVWK',
  'KSSKBBBKDVVVVK',
  'KSSKBBBBKDDDDK',
  'KSSKBBBBBKKKK.',
  'KSSKBBBBBBBK..',
  '.KKKBBBBBBBK..',
  '...KSBBBBBBK..',
];
const BONA_BEN = [
  ['...KSBBBBBBK..', '...KSSBKBBBK..', '...KSSK.KBBK..', '...KKKK.KKKK..'],
  ['...KSBBBBBBK..', '..KSSBK.KBBBK.', '..KSSK..KBBK..', '..KKKK..KKKK..'],
];
// minibesättning (husdjuret som följer efter)
const MINI = ['..KKKK..', '.KBBBBK.', 'KKBBKKKK', 'KSKBKVWK', 'KSKBKDDK', 'KSKBBKK.', '.KKBBBK.', '..KBKBK.', '..KK.KK.'];
const BESATTNING = { rod: ['#c51111', '#7a0838'], cyan: ['#38fedc', '#24a8be'], lime: ['#50ef39', '#15a742'], gul: ['#f6f657', '#c38823'], rosa: ['#ed54ba', '#ab2bad'] };
const bonaPal = ([B, S]) => ({ K: '#101018', B, S, V: '#95cadc', W: '#e8f8ff', D: '#4c86a6' });
// rita en besättningsmedlem med fötterna på (cx, fy)
function bona(x, cx, fy, farg, vanster, steg, namn, hatt) {
  const pal = bonaPal(BESATTNING[farg]), X = Math.round(cx - 7), Y = Math.round(fy - 16) - (steg ? 1 : 0);
  ellips(x, Math.round(cx), Math.round(fy), 6, 1, 'rgba(20,24,40,0.35)');
  spr(x, BONA, X, Y, pal, vanster); spr(x, BONA_BEN[steg ? 1 : 0], X, Y + 12, pal, vanster);
  // grodd-hatten: ett litet skott på huvudet
  if (hatt) { const hx = X + (vanster ? 6 : 7); R(x, hx, Y - 3, 1, 3, '#2a8a2a'); R(x, hx - 2, Y - 4, 2, 2, '#5cd04a'); R(x, hx + 1, Y - 5, 2, 2, '#5cd04a'); P(x, hx - 2, Y - 4, '#9af07a'); P(x, hx + 2, Y - 5, '#9af07a'); }
  if (namn) TK(x, namn, Math.round(cx - TW(namn) / 2), Y - (hatt ? 12 : 8), '#ffffff', '#101018', SMALL);
}
function blandOss(x, t) {
  const W = 192, H = 108, PER = 8, f = mod(t, PER) / PER;
  const bak = fast('f-blandoss', W, H, (y) => {
    // golvet i kafeterian: stora blågrå plattor i rutnät, varannan lite mörkare, med nitar i hörnen
    R(y, 0, 24, W, H - 24, '#9ba8ba');
    for (let ty = 24; ty < H; ty += 14) for (let tx = 0; tx < W; tx += 16) {
      R(y, tx, ty, 16, 14, (tx / 16 + (ty - 24) / 14) % 2 ? '#a5b1c2' : '#96a3b5'); R(y, tx, ty, 16, 1, '#bcc6d4'); R(y, tx, ty, 1, 14, '#b2bccb');
      R(y, tx + 15, ty, 1, 14, '#76829a'); R(y, tx, ty + 13, 16, 1, '#76829a');
      P(y, tx + 2, ty + 2, '#7c889c'); P(y, tx + 13, ty + 2, '#7c889c'); P(y, tx + 2, ty + 11, '#7c889c'); P(y, tx + 13, ty + 11, '#7c889c');
    }
    // väggen längst bak: paneler, list och mörk överkant
    R(y, 0, 0, W, 3, '#141824'); R(y, 0, 3, W, 18, '#6c7892'); R(y, 0, 3, W, 1, '#8a96ae'); R(y, 0, 9, W, 1, '#7e8aa4');
    for (let px = 0; px < W; px += 24) { R(y, px, 3, 1, 18, '#525c74'); R(y, px + 1, 3, 1, 18, '#7e8aa4'); }
    R(y, 0, 21, W, 3, '#454e64'); R(y, 0, 21, W, 1, '#98a4ba'); R(y, 0, 24, W, 2, 'rgba(30,36,56,0.35)');
    // fönstret ut mot rymden
    R(y, 104, 4, 32, 14, '#3a4258'); R(y, 106, 5, 28, 12, '#070a18'); R(y, 106, 5, 28, 1, '#1a2040');
    disc(y, 128, 12, 3, '#d87a3a'); R(y, 126, 10, 2, 1, '#f0a868'); R(y, 125, 12, 7, 1, 'rgba(255,220,180,0.35)');
    // dörröppningen till korridoren till höger, med varningsränder på golvet
    R(y, 170, 0, 22, 24, '#121622'); R(y, 168, 0, 2, 24, '#3a4258'); R(y, 170, 3, 22, 1, '#1e2436');
    for (let i = 0; i < 26; i += 4) { R(y, 168 + i, 24, 2, 4, '#f0c420'); R(y, 170 + i, 24, 2, 4, '#1a1a1a'); }
    R(y, 168, 28, 24, 1, '#5a6478');
    // sladdpanelen på väggen (uppdraget som pågår)
    R(y, 143, 5, 18, 14, '#3a4050'); R(y, 144, 6, 16, 12, '#c8a020'); R(y, 145, 7, 14, 10, '#2a2c38'); R(y, 144, 6, 16, 1, '#f0d050');
    // ventilen i golvet
    R(y, 52, 62, 16, 9, '#4a5264'); R(y, 53, 63, 14, 7, '#2a3040'); for (let i = 0; i < 4; i++) R(y, 54, 64 + i * 2, 12, 1, '#6a7488'); R(y, 52, 70, 16, 1, '#c0c8d6');
  });
  x.drawImage(bak, 0, 0);
  // stjärnorna i fönstret blinkar
  for (let i = 0; i < 9; i++) { const sx = 107 + Math.floor(hash(i, 1) * 26), sy = 6 + Math.floor(hash(i, 2) * 10); if (Math.abs(sx - 128) < 5 && Math.abs(sy - 12) < 5) continue; P(x, sx, sy, Math.floor(t * 3 + i * 1.7) % 4 ? '#ffffff' : '#5a6aa0'); }
  // sladdarna i panelen kopplas ihop en i taget, sedan nollställs uppdraget
  const SLADD = ['#e02020', '#2050e0', '#f0e020', '#e040c0'], TILL = [2, 0, 3, 1], klara = f > 0.88 ? 0 : Math.max(0, Math.min(4, Math.floor((f - 0.06) / 0.13) + 1));
  SLADD.forEach((c, i) => {
    R(x, 145, 8 + i * 2.4, 2, 1, c); R(x, 157, 8 + TILL[i] * 2.4, 2, 1, SLADD[TILL.indexOf(i)]);
    if (i < klara) { const y0 = 8 + i * 2.4, y1 = 8 + TILL[i] * 2.4; for (let k = 0; k <= 10; k++) P(x, 147 + k, y0 + ((y1 - y0) * k) / 10, c); }
  });
  P(x, 159, 17, klara >= 4 ? (Math.floor(t * 6) % 2 ? '#40ff40' : '#108010') : '#802020');
  // nödmötesbordet och två vanliga bord med pallar (ritas tillsammans med besättningen i djupordning)
  const saker = [];
  const pall = (px, py) => { ellips(x, px, py + 2, 4, 2, '#3e4656'); ellips(x, px, py, 4, 2, '#7a8498'); R(x, px - 2, py - 1, 3, 1, '#9aa4b6'); };
  const bord = (bx, by, knapp) => saker.push([by, () => {
    ellips(x, bx, by + 6, 20, 4, 'rgba(30,36,56,0.3)');
    for (const [sx, sy] of [[-13, -10], [13, -10]]) pall(bx + sx, by + sy);
    for (const [sx, sy] of [[-25, -1], [25, -1]]) pall(bx + sx, by + sy);
    ellips(x, bx, by + 3, 18, 8, '#5c6878'); ellips(x, bx, by, 18, 8, '#c9d2de'); ellips(x, bx, by - 1, 15, 6, '#dbe2ec'); R(x, bx - 12, by - 6, 10, 1, '#f2f6fa');
    for (const [sx, sy] of [[-13, 10], [13, 10]]) pall(bx + sx, by + sy);
    if (knapp) {
      ellips(x, bx, by, 7, 3, '#3a3e4a'); ellips(x, bx, by - 1, 5, 2, '#9a1010'); ellips(x, bx, by - 2, 4, 2, Math.floor(t * 2) % 2 ? '#ff2a2a' : '#e01818'); P(x, bx - 2, by - 3, '#ffb0b0');
      for (let a = 0; a < 14; a++) { const v = Math.PI + (a / 13) * Math.PI; P(x, bx + Math.cos(v) * 6, by - 1 + Math.sin(v) * 6, a % 3 ? 'rgba(220,245,255,0.75)' : '#ffffff'); }
    }
  }]);
  bord(96, 56, true); bord(34, 88, false); bord(148, 80, false);
  // besättningen: röd går åt höger med sitt husdjur, cyan och gul åt vänster, lime gör uppdraget
  const gang = (fas) => (Math.floor(t * 7 + fas) % 2) === 1;
  const rx = -12 + f * 216;
  saker.push([75, () => bona(x, rx, 75, 'rod', false, gang(0), 'OLLE')]);
  saker.push([77, () => { const mx = rx - 17, st = gang(1); ellips(x, Math.round(mx), 77, 4, 1, 'rgba(20,24,40,0.35)'); spr(x, MINI, Math.round(mx) - 4, 68 - (st ? 1 : 0), bonaPal(BESATTNING.rosa)); }]);
  const cx = 204 - mod(f + 0.35, 1) * 216; saker.push([101, () => bona(x, cx, 101, 'cyan', true, gang(0.5), 'SAGA', true)]);
  const gx = 204 - mod(f + 0.8, 1) * 216; saker.push([41, () => bona(x, gx, 41, 'gul', true, gang(0.3), 'ELLA')]);
  const jobbar = klara < 4 || f > 0.88;
  saker.push([33, () => bona(x, 136, 33, 'lime', false, jobbar && Math.floor(t * 3) % 2 === 1, 'MAJA')]);
  saker.sort((a, b) => a[0] - b[0]).forEach(([, rita]) => rita());
  // uppdraget klart
  if (f > 0.62 && f < 0.82) { const s = 'KLART!'; TK(x, s, 146 - TW(s, BIG) / 2, 30 - Math.round((f - 0.62) * 30), '#5cff5c', '#0a3a0a', BIG); }
  // uppdragsmätaren uppe till vänster
  R(x, 2, 2, 100, 10, '#101014'); R(x, 3, 3, 98, 8, '#3c3c44'); R(x, 3, 3, 59, 8, '#3cc83c'); R(x, 3, 3, 59, 1, '#7af06a'); R(x, 3, 10, 59, 1, '#22902a');
  const glans = Math.round(mod(t * 30, 120)) - 10; if (glans < 59) R(x, 3 + Math.max(0, glans), 4, Math.min(4, 59 - Math.max(0, glans)), 6, 'rgba(255,255,255,0.35)');
  T(x, 'TOTALA UPPDRAG KLARA', 6, 5, '#101014'); T(x, 'TOTALA UPPDRAG KLARA', 5, 4, '#ffffff');
  // uppdragslistan
  R(x, 2, 14, 74, 15, 'rgba(10,12,20,0.82)');
  T(x, 'KAFÉ: SLADDAR 1/3', 4, 16, klara >= 4 ? '#5cff5c' : '#ffe43a'); T(x, 'NAV: STYR KURSEN', 4, 23, '#ffffff');
  // karta och inställningar uppe till höger
  R(x, 166, 3, 12, 10, '#101018'); R(x, 167, 4, 10, 8, '#ffffff'); R(x, 170, 4, 1, 8, '#9aa4b4'); R(x, 173, 4, 1, 8, '#9aa4b4'); P(x, 168, 6, '#e02020');
  disc(x, 183, 8, 5, '#101018'); disc(x, 183, 8, 4, '#ffffff'); for (const [dx, dy] of [[0, -5], [5, 0], [0, 5], [-5, 0]]) R(x, 183 + dx - (dx ? 0 : 1), 8 + dy - (dy ? 0 : 1), dx ? 1 : 3, dy ? 1 : 3, '#ffffff'); disc(x, 183, 8, 1, '#101018');
  // ANVÄND-knappen nere till höger: en vit hand
  const ux = 168, uy = 78;
  R(x, ux - 1, uy - 1, 20, 21, 'rgba(10,12,20,0.4)');
  R(x, ux + 4, uy + 8, 11, 9, '#101018'); R(x, ux + 5, uy + 9, 9, 7, '#ffffff');
  for (let i = 0; i < 4; i++) { const fh = [6, 8, 7, 5][i]; R(x, ux + 4 + i * 3 - 0, uy + 9 - fh, 3, fh + 1, '#101018'); R(x, ux + 5 + i * 3, uy + 10 - fh, 1 + (i < 3 ? 1 : 0), fh, '#ffffff'); }
  R(x, ux + 1, uy + 9, 4, 5, '#101018'); R(x, ux + 2, uy + 10, 3, 3, '#ffffff');
  R(x, ux + 5, uy + 17, 9, 2, '#101018');
  TK(x, 'ANVÄND', ux + 9 - Math.round(TW('ANVÄND') / 2), uy + 22, '#ffffff', '#101018', SMALL);
}

// ---------- 2025 MARCO KART VÄRLD (Mario Kart World) ----------
const MK_W = 192, MK_H = 108, MK_HOR = 46, MK_VARV = 24;
// föremålen i rutan: svamp, banan, stjärna, mynt
const MK_SAKER = {
  svamp: [['....KKKKKK....', '..KKWWRRRRKK..', '.KWWWWRRRRRRK.', '.KWWWRRRRWWWK.', 'KRRRRRRRWWWWRK', 'KRRRRRRRRWWRRK', 'KRWWRRRRRRRRRK', 'KWWWWKKKKKKWWK', '.KKKCCCCCCKKK.', '..KCCKCCKCCK..', '..KCCKCCKCCK..', '..KCCCCCCCCK..', '...KKKKKKKK...'], { K: '#101018', R: '#e02020', W: '#ffffff', C: '#f8e0b0' }],
  banan: [['..........KK..', '.........KYK..', '........KYYK..', '.......KYYYK..', '......KYYYK...', '....KKYYYYK...', '.KKKYYYYYK....', 'KYYYYYYYK.....', '.KKYYYYK......', '...KKKK.......'], { K: '#5a3a08', Y: '#ffe030' }],
  stjarna: [['......K.......', '.....KYK......', '.....KYK......', 'KKKKKYYYKKKKK.', '.KYYYYYYYYYK..', '..KYYKYKYYK...', '...KYKYKYK....', '...KYYYYYK....', '..KYYK.KYYK...', '..KKK...KKK...'], { K: '#a06000', Y: '#ffe040' }],
  mynt: [['....KKKK....', '..KKYYYYKK..', '.KYYWYYYYYK.', '.KYWYYKYYYK.', 'KYYWYYKYYYYK', 'KYYYYYKYYYYK', 'KYYYYYKYYYYK', '.KYYYYKYYYK.', '.KYYYYYYYYK.', '..KKYYYYKK..', '....KKKK....'], { K: '#8a5a00', Y: '#ffd030', W: '#fff8c0' }],
};
// en kart bakifrån, botten mitt på (cx, by), k = skala. c = { keps, skjorta, overall, kropp, ljus, mork, har, krona }
function mkKart(x, cx, by, k, c, drift = 0, spelare = false) {
  const r = (dx, dy, w, h, f) => R(x, cx + dx * k, by + dy * k, Math.max(1, w * k), Math.max(1, h * k), f);
  const lut = Math.round(drift * 2);
  ellips(x, Math.round(cx), Math.round(by - k), Math.max(2, Math.round(24 * k)), Math.max(1, Math.round(3 * k)), 'rgba(20,20,40,0.35)');
  // bakdäcken (det yttre däcket i kurvan trycks ner en pixel)
  for (const s of [-1, 1]) {
    const dx = s < 0 ? -23 : 13, ner = spelare && Math.sign(drift) === s ? 1 : 0;
    r(dx, -13 + ner, 10, 13, '#18181c'); for (let j = 0; j < 4; j++) r(dx, -11 + j * 3 + ner, 10, 1, '#34343c'); r(dx + (s < 0 ? 1 : 7), -13 + ner, 2, 12, '#44444e');
  }
  r(-12, -11, 24, 6, '#2a2a32');
  // karossen med sidolådor, stötfångare och avgasrör
  r(-16, -19, 32, 10, c.kropp); r(-16, -19, 32, 1, c.ljus || '#ffffff'); r(-16, -10, 32, 1, c.mork || '#000000');
  r(-18, -16, 3, 7, c.kropp); r(15, -16, 3, 7, c.kropp);
  r(-11, -9, 22, 4, '#3a3a44'); r(-11, -9, 22, 1, '#60606c');
  for (const ex of [-8, 4]) { r(ex, -13, 4, 4, '#c8ccd6'); r(ex + 1, -12, 2, 2, '#202024'); }
  // föraren: tröja, hängslen, handskar, nacke och keps (eller krona)
  const o = spelare ? lut : 0;
  r(-9 + o, -32, 18, 12, c.skjorta); r(-6 + o, -32, 3, 10, c.overall); r(3 + o, -32, 3, 10, c.overall);
  r(-13 + o, -29, 4, 6, c.skjorta); r(9 + o, -29, 4, 6, c.skjorta); r(-14 + o, -24, 5, 3, '#ffffff'); r(9 + o, -24, 5, 3, '#ffffff');
  r(-8, -26, 16, 8, '#22222a'); r(-8, -26, 16, 1, '#3a3a46');
  r(-6 + o, -37, 12, 6, c.har); r(-7 + o, -36, 1, 3, '#f8c890'); r(6 + o, -36, 1, 3, '#f8c890');
  if (c.krona) { r(-7 + o, -44, 14, 8, c.har); r(-3 + o, -48, 6, 4, '#ffd020'); r(-3 + o, -50, 1, 2, '#ffd020'); r(2 + o, -50, 1, 2, '#ffd020'); r(-1 + o, -47, 2, 1, '#40a0ff'); }
  else { r(-7 + o, -44, 14, 7, c.keps); r(-6 + o, -46, 12, 2, c.keps); r(-4 + o, -47, 8, 1, c.keps); r(-4 + o, -45, 5, 1, 'rgba(255,255,255,0.45)'); r(-7 + o, -38, 14, 1, 'rgba(0,0,0,0.35)'); }
}
function marcoKart(x, t) {
  const W = MK_W, H = MK_H, HOR = MK_HOR, PER = 6, f = mod(t, PER) / PER, pos = f * MK_VARV;
  const kurva = Math.sin(f * Math.PI * 2), bgX = Math.cos(f * Math.PI * 2) * 60;
  // himlen och panoramat (berg, kullar och slottet) som glider i kurvorna
  x.drawImage(fast('f-mk-himmel', W, HOR + 2, (y) => toning(y, 0, 0, W, HOR + 2, ['#2a78e8', '#4a96f4', '#72b6fa', '#a8d8ff', '#d4f0ff'])), 0, 0);
  const pano = fast('f-mk-pano', 384, HOR + 2, (y) => {
    // moln
    for (const [mx, my, s] of [[30, 10, 1], [150, 6, 1.3], [260, 14, 0.9], [330, 4, 1.1]]) {
      for (const [dx, dy, rr] of [[0, 4, 6], [9, 0, 8], [19, 3, 7], [27, 6, 5]]) disc(y, mx + dx * s, my + dy * s, Math.round(rr * s), '#ffffff');
      R(y, mx - 5 * s, my + 8 * s, 36 * s, 3, '#ffffff'); R(y, mx - 4 * s, my + 10 * s, 34 * s, 1, '#cfe4f8');
    }
    // berg långt bort med snö på topparna
    for (let i = 0; i < 384; i++) {
      const h = 12 + Math.round(7 * Math.sin((i / 384) * Math.PI * 6) + 5 * Math.sin((i / 384) * Math.PI * 14 + 1) + 3 * Math.sin((i / 384) * Math.PI * 26));
      R(y, i, HOR + 2 - h, 1, h, '#7aa2d8'); R(y, i, HOR + 2 - h, 1, 1, '#a8c4ec');
      if (h > 20) R(y, i, HOR + 2 - h, 1, h - 19, '#f4f8ff');
    }
    // gröna kullar närmare
    for (let i = 0; i < 384; i++) {
      const h = 6 + Math.round(3 * Math.sin((i / 384) * Math.PI * 8 + 2) + 2 * Math.sin((i / 384) * Math.PI * 18));
      R(y, i, HOR + 2 - h, 1, h, '#3ea84a'); R(y, i, HOR + 2 - h, 1, 1, '#72d064');
    }
    for (let i = 0; i < 40; i++) { const tx = Math.floor(hash(i, 7) * 384), th = 3 + Math.floor(hash(i, 8) * 3); disc(y, tx, HOR - 4 - th, 2, '#2a8a3a'); }
    // slottet på kullen: vita murar, röda tak och en flagga
    const sx = 236, sy = HOR - 6;
    R(y, sx - 12, sy - 10, 24, 12, '#f2eee6'); R(y, sx - 12, sy - 10, 24, 1, '#ffffff'); R(y, sx - 2, sy - 4, 4, 6, '#8a5a3a');
    for (const [tx, th] of [[-14, 18], [12, 18], [-3, 26]]) {
      R(y, sx + tx, sy - th, 6, th, '#f2eee6'); R(y, sx + tx + 4, sy - th, 2, th, '#d8d2c8');
      for (let j = 0; j < 6; j++) R(y, sx + tx + 3 - j / 2 - 0.5, sy - th - 6 + j, j + 1, 1, '#d82828');
      P(y, sx + tx + 2, sy - th + 4, '#5a7ad8');
    }
    R(y, sx, sy - 40, 1, 8, '#404040'); R(y, sx + 1, sy - 40, 4, 3, '#ffd020');
  });
  const ox = Math.round(mod(bgX, 384));
  x.drawImage(pano, -ox, 0); x.drawImage(pano, 384 - ox, 0);
  // vägen i perspektiv: gräs, kantsten, asfalt, filstreck
  const rad = [];
  for (let y = HOR + 1; y < H; y++) {
    const s = (y - HOR) / (H - HOR), d = 1 / s, mitt = W / 2 + kurva * 70 * (1 - s) * (1 - s), hw = 6 + s * 92;
    rad[y] = { s, d, mitt, hw };
    const z = d + pos, langt = d > 9;
    R(x, 0, y, W, 1, langt ? '#52bc3a' : Math.floor(z / 0.8) % 2 ? '#5cc83e' : '#48b032');
    const kant = Math.max(1, hw * 0.07);
    R(x, mitt - hw - kant, y, hw * 2 + kant * 2, 1, langt ? '#e89a9a' : Math.floor(z / 0.4) % 2 ? '#e02828' : '#f4f4f4');
    R(x, mitt - hw, y, hw * 2, 1, langt ? '#686e7a' : Math.floor(z / 0.8) % 2 ? '#6c727e' : '#646a76');
    const lw = Math.max(1, Math.round(s * 2.5));
    R(x, mitt - hw * 0.9, y, lw, 1, '#e8e8e8'); R(x, mitt + hw * 0.9 - lw, y, lw, 1, '#e8e8e8');
    if (!langt && Math.floor(z / 0.6) % 2 === 0) for (const l of [-0.3, 0.3]) R(x, mitt + l * hw - lw / 2, y, lw, 1, '#ffffff');
  }
  // saker längs banan (träd, mynt, frågelådor) och motståndarna, ritade längst bort först
  const proj = (dz, fil) => { const s = 1 / dz, y = HOR + s * (H - HOR), q = rad[Math.min(H - 1, Math.max(HOR + 1, Math.round(y)))]; return { y, x: q.mitt + fil * q.hw, s }; };
  const saker = [];
  for (let i = 0; i < 16; i++) { const zw = i * 1.5, sida = i % 2 ? 1 : -1; saker.push({ zw, fil: sida * (1.35 + (i % 3) * 0.12), typ: 'trad' }); }
  for (let i = 0; i < 5; i++) saker.push({ zw: 3 + i * 0.6, fil: 0.45, typ: 'mynt', i });
  for (let i = 0; i < 5; i++) saker.push({ zw: 17 + i * 0.5, fil: 0, typ: 'mynt', i: i + 5 });
  for (const fil of [-0.66, -0.22, 0.22, 0.66]) saker.push({ zw: 9, fil, typ: 'lada' });
  const lista = [];
  for (const o of saker) { const dz = mod(o.zw - pos, MK_VARV); if (dz > 0.95 && dz < 18) lista.push({ ...o, dz }); }
  const FORARE = [
    { dz: 2.7 + 0.7 * Math.sin(f * Math.PI * 2 + 1), fil: 0.42 * Math.sin(f * Math.PI * 4 + 0.5), c: { keps: '#18a830', skjorta: '#18a830', overall: '#2040b0', kropp: '#18a830', ljus: '#70e070', mork: '#0a6a1a', har: '#5a3010' } },
    { dz: 5.2 + 1.2 * Math.sin(f * Math.PI * 2 + 2.5), fil: -0.42 + 0.18 * Math.sin(f * Math.PI * 4), c: { krona: true, skjorta: '#f070b0', overall: '#f070b0', kropp: '#ff8ac8', ljus: '#ffd0e8', mork: '#c04080', har: '#ffd84a' } },
    { dz: 9 + 2 * Math.sin(f * Math.PI * 2 + 4), fil: 0.3 * Math.cos(f * Math.PI * 2), c: { keps: '#f0d020', skjorta: '#f0d020', overall: '#7030a0', kropp: '#7030a0', ljus: '#b070e0', mork: '#401860', har: '#5a3010' } },
  ];
  for (const fo of FORARE) lista.push({ typ: 'forare', ...fo });
  lista.sort((a, b) => b.dz - a.dz);
  const kP = 0.82;
  for (const o of lista) {
    const p = proj(o.dz, o.fil), k = p.s;
    if (o.typ === 'trad') {
      const h = 22 * k, rr = Math.max(1, Math.round(9 * k));
      R(x, p.x - Math.max(1, 2 * k) / 2, p.y - h, Math.max(1, 3 * k), h, '#8a5a2a');
      disc(x, Math.round(p.x), Math.round(p.y - h - rr * 0.6), rr, '#2a9a3a'); if (rr > 2) disc(x, Math.round(p.x - rr * 0.3), Math.round(p.y - h - rr), Math.round(rr * 0.5), '#5cc85a');
    } else if (o.typ === 'mynt') {
      const hy = Math.max(2, Math.round(9 * k)), bw = Math.max(1, Math.round(Math.abs(Math.cos(f * Math.PI * 12 + o.i)) * 7 * k)), Y = Math.round(p.y - hy - 5 * k);
      R(x, p.x - bw / 2, Y, bw, hy, '#c88a00'); if (bw > 2) R(x, p.x - bw / 2 + 1, Y + 1, bw - 2, hy - 2, '#ffd030'); if (bw > 3) R(x, p.x - bw / 2 + 1, Y + 1, 1, hy - 3, '#fff4b0');
    } else if (o.typ === 'lada') {
      if (Math.abs(o.fil) < 0.3 && o.dz < 1.3) continue;   // spelaren kör igenom de två i mitten
      const s = Math.max(2, Math.round(15 * k)), w = Math.max(2, Math.round(s * (0.72 + 0.28 * Math.abs(Math.cos(f * Math.PI * 6))))), Y = Math.round(p.y - s - 6 * k + Math.sin(f * Math.PI * 8 + o.fil * 5) * 2 * k), X = Math.round(p.x - w / 2);
      const RB = ['#ff4040', '#ffa020', '#ffe030', '#40d040', '#40a0ff', '#b060ff'], b = Math.floor(t * 8);
      x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(X, Y, w, s);
      R(x, X, Y, w, 1, RB[b % 6]); R(x, X + w - 1, Y, 1, s, RB[(b + 1) % 6]); R(x, X, Y + s - 1, w, 1, RB[(b + 2) % 6]); R(x, X, Y, 1, s, RB[(b + 3) % 6]);
      if (s >= 9) { const q = s >= 13 ? BIG : SMALL; T(x, '?', X + Math.round(w / 2 - TW('?', q) / 2) + 1, Y + Math.round(s / 2 - q.h / 2) + 1, '#a06000', q); T(x, '?', X + Math.round(w / 2 - TW('?', q) / 2), Y + Math.round(s / 2 - q.h / 2), '#ffffff', q); }
    } else mkKart(x, p.x, p.y, k * kP * 1.15, o.c, 0, false);
  }
  // frågelådorna som spelaren kör igenom splittras i regnbågsbitar
  const lf = mod(pos - 8.0, MK_VARV);
  if (lf < 1.6) for (let i = 0; i < 14; i++) { const a = hash(i, 3) * Math.PI * 2, rr = lf * 30 * (0.5 + hash(i, 4)); R(x, W / 2 + Math.cos(a) * rr, 70 - lf * 10 + Math.sin(a) * rr * 0.6, 2, 2, ['#ff4040', '#ffa020', '#ffe030', '#40d040', '#40a0ff', '#b060ff'][i % 6]); }
  // spelaren: Marco i röd kart; driftar i kurvorna med gnistor från bakdäcken
  const drift = Math.abs(kurva) > 0.45 ? Math.sign(kurva) : 0, px = W / 2 - kurva * 8, py = H - 3;
  const boost = f > 0.05 && f < 0.17;   // svampen används: lågor ur avgasrören och fartstreck
  if (boost) for (let i = 0; i < 10; i++) { const a = hash(i, Math.floor(mod(t, PER) * 20)) * Math.PI * 2, rr = 70 + hash(i, 9) * 30; R(x, W / 2 + Math.cos(a) * rr, 54 + Math.sin(a) * rr * 0.55, 6, 1, 'rgba(255,255,255,0.7)'); }
  mkKart(x, px, py, kP, { keps: '#e02020', skjorta: '#e02020', overall: '#2848c8', kropp: '#e02020', ljus: '#ff7a6a', mork: '#901010', har: '#5a3010' }, drift, true);
  if (boost) for (const ex of [-6, 6]) { const fl = 3 + (Math.floor(t * 30) % 3) * 2; R(x, px + ex * kP - 1, py - 9 * kP, 3, fl, '#ffd040'); R(x, px + ex * kP, py - 9 * kP + fl, 1, 2, '#ff6020'); }
  if (drift) {
    const niva = Math.abs(kurva) > 0.8 ? '#ffa020' : '#4ac8ff', ram = Math.floor(mod(t, PER) * 24);
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) {
      const sx = px + s * 18 * kP + (hash(ram, i + s * 10) - 0.5 + s * 0.6) * 12, sy = py - hash(ram + 1, i + s * 10) * 9;
      R(x, sx, sy, i % 3 ? 1 : 2, i % 3 ? 1 : 2, i % 2 ? niva : '#ffffff');
    }
  }
  // HUD: föremålsrutan, mynten, varvet och placeringen
  R(x, 4, 4, 26, 26, '#101830'); R(x, 5, 5, 24, 24, '#ffffff'); R(x, 7, 7, 20, 20, '#1a2a58'); R(x, 7, 7, 20, 2, '#2a3c78');
  // svampen ligger i rutan, används, rutan står tom tills frågelådorna snurrar fram en ny
  let sak = f >= 0.46 || f <= 0.05 ? 'svamp' : null;
  if (f > 0.34 && f < 0.46) sak = ['svamp', 'banan', 'stjarna', 'mynt'][Math.floor(t * 12) % 4];
  if (sak) { const [rader, pal] = MK_SAKER[sak]; spr(x, rader, 17 - Math.ceil(rader[0].length / 2), 17 - Math.ceil(rader.length / 2), pal); }
  spr(x, MK_SAKER.mynt[0], 5, 86, MK_SAKER.mynt[1]);
  kontur(x, '×10', 19, 88, '#ffffff', '#101830', BIG);
  kontur(x, 'VARV 2/3', 5, 78, '#ffffff', '#101830', SMALL);
  const PX = 146, PY = 72;
  kontur(x, '1', PX, PY, '#7a3a00', '#101010', BIG, 4, 2);
  bandText(x, '1', PX, PY, ['#fff6a0', '#ffe040', '#ffc020', '#ff9a10'], BIG, 4);
  kontur(x, ':A', PX + 22, PY + 14, '#7a3a00', '#101010', BIG, 2, 1);
  bandText(x, ':A', PX + 22, PY + 14, ['#fff6a0', '#ffd030', '#ff9a10'], BIG, 2);
}

// ---------- 2024 ASTROBOTTEN (Astro Bot) ----------
// lilla roboten åt höger: vitt huvud med svart visir och blå lysande ögon. K kontur, W vitt, G grå, N visir, C ögon, B blått
const ASTRO_HUVUD = [
  '....KKKKKKK....',
  '..KKWWWWWWWKK..',
  '.KWWWWWWWWWWWK.',
  'KWWWWWKKKKKKKWK',
  'KWGGWKNNNNNNNKK',
  'KGBBGKNCCNNCCNK',
  'KGBBGKNCCNNCCNK',
  'KWGGWKNCCNNCCNK',
  'KWWWWKNNNNNNNKK',
  '.KWWWWKKKKKKKWK',
  '..KKWWWWWWWWKK.',
  '....KKKKKKKK...',
];
const ASTRO_KROPP = {
  spring0: ['.....KWWWK.....', '...KKWWBWWKK...', '..KWKWWWWWKWK..', '..KWKKWWWKKWK..', '..KK.KWWWK.KK..', '....KWWKWWK....', '...KWWK.KWWK...', '..KWWK...KWWK..', '..KKK.....KKK..'],
  spring1: ['.....KWWWK.....', '....KWWBWWK....', '...KWWWWWWWK...', '...KWKWWWKWK...', '...KK.KWWK.KK..', '.....KWWWK.....', '.....KWKWK.....', '....KWWKWWK....', '....KKK.KKK....'],
  hopp: ['..KK.KWWWK.KK..', '..KWKKWBWKKWK..', '...KWKWWWKWK...', '....KKWWWKK....', '.....KWWWK.....', '....KWK.KWK....', '....KWK.KWK....', '...KWWK.KWWK...', '...KKK..KKK....'],
};
const ASTRO_PAL = { K: '#1a2236', W: '#f4f8fc', G: '#b8c6d8', N: '#0c1020', C: '#3ad8ff', B: '#2a7ae8' };
const BOT = ['..KKKKKKK..', '.KWWWWWWWK.', 'KWWWWWWWWWK', 'KWNNNNNNNWK', 'KWNCCNCCNWK', 'KWNCCNCCNWK', 'KWNNNNNNNWK', '.KWWWWWWWK.', '..KKWWWKK..', '..KWWBWWK..', '..KWWWWWK..', '...KWKWK...', '...KK.KK...'];
// räddade botar i HUD:en: bara huvudet, rakt framifrån, med stora lysande ögon och gråblå öron
const BOT_HUVUD = ['...KKKKKKK...', '.KKWWWWWWWKK.', 'KWWWWWWWWWWWK', 'KWNNNNNNNNNWK', 'GWNNCCNCCNNWG', 'GWNNCCNCCNNWG', 'GWNNCCNCCNNWG', 'KWNNNNNNNNNWK', '.KWWWWWWWWWK.', '..KKKKKKKKK..'];
// öarna i en slinga (värld 288 bred): [start, slut, toppens y]
const AB_L = 288, AB_OAR = [[0, 104, 78], [136, 214, 64], [244, 262, 72]];
function astroO(i) {
  const [a, b] = AB_OAR[i], w = b - a;
  return fast('f-astro-o' + i, w + 8, 44, (y) => {
    // flytande ö: grön topp, sandfärgad undersida som smalnar av mot en spets
    for (let c = 0; c < w + 8; c++) {
      const u = (c - 4) / w, dj = u < 0 || u > 1 ? 0 : Math.round(8 + 26 * Math.pow(Math.sin(u * Math.PI), 0.8) + (hash(c >> 2, i) - 0.5) * 5);
      if (dj > 0) for (let j = 4; j < 4 + dj; j++) P(y, c, j, j > 4 + dj - 3 ? '#a8502e' : (j + (c >> 2)) % 9 < 2 ? '#d87a44' : j < 12 ? '#f0a860' : '#e48c4c');
    }
    for (let c = 1; c < w + 7; c++) { const k = c === 1 || c === w + 6; R(y, c, k ? 2 : 0, 1, k ? 4 : 6, '#46c03a'); P(y, c, k ? 2 : 0, '#a8f070'); if (!k) { P(y, c, 1, '#8ae860'); P(y, c, 5, '#2e8a2e'); if (hash(c, i + 4) > 0.55) P(y, c, 6, '#2e8a2e'); } }
  });
}
function astroBotten(x, t) {
  const W = 192, H = 108, PER = 8, f = mod(t, PER) / PER, cam = f * AB_L, AX = 64;
  // himlen, molnen och öar långt bort (parallax som går jämnt upp i slingan)
  x.drawImage(fast('f-astro-himmel', W, H, (y) => {
    toning(y, 0, 0, W, H, ['#3aa8f4', '#5cbcfa', '#86d0fc', '#b8e6ff', '#e0f6ff']);
    disc(y, 136, 24, 12, 'rgba(255,255,230,0.35)'); disc(y, 136, 24, 8, '#fff8d8');
  }), 0, 0);
  // en randig luftballong långt bort som guppar
  const lb = Math.round(46 + Math.sin(t * Math.PI / 4) * 3);
  for (let j = -7; j <= 7; j++) { const hw = Math.round(Math.sqrt(49 - j * j) * (j > 0 ? 1 - j / 14 : 1)); for (let i = -hw; i <= hw; i++) P(x, 174 + i, lb + j, Math.floor((i + 8) / 3) % 2 ? '#ff5a6a' : '#ffe060'); }
  R(x, 172, lb + 9, 5, 4, '#a8682a'); R(x, 171, lb + 7, 1, 2, '#6a4a2a'); R(x, 177, lb + 7, 1, 2, '#6a4a2a');
  for (const [mx, my, s] of [[20, 20, 1], [96, 12, 1.3], [150, 40, 0.8]]) {
    const yb = my + Math.sin(t * Math.PI / 4 + mx) * 1.5;
    for (const [dx, dy, rr] of [[0, 3, 5], [8, 0, 7], [17, 3, 5]]) disc(x, Math.round(mx + dx * s), Math.round(yb + dy * s), Math.round(rr * s), '#ffffff');
    R(x, mx - 4 * s, yb + 6 * s, 26 * s, 2, '#ffffff'); R(x, mx - 3 * s, yb + 8 * s, 24 * s, 1, '#d0ecfc');
  }
  // bortre öar (1/3 av farten, 96 breda)
  const fjarr = mod(cam / 3, 96);
  for (let k = -1; k < 3; k++) {
    const bx = Math.round(k * 96 - fjarr + 30), by = 56 + (mod(k, 2)) * 8 + Math.round(Math.sin(t * Math.PI / 2 + k) * 1.5);
    ellips(x, bx, by, 13, 2, '#9ad8a0'); for (let j = 0; j < 8; j++) R(x, bx - 11 + j * 1.4, by + 2 + j, 22 - j * 2.8, 1, j < 3 ? '#e8b8c8' : '#d8a0b8');
    R(x, bx - 12, by - 2, 24, 2, '#7ac888');
  }
  // de stora öarna i förgrunden (följer kameran) med en hoppfjäder och botar som vinkar
  const sx = (wx) => wx - cam + AX;
  for (const off of [-AB_L, 0, AB_L]) AB_OAR.forEach(([a, b, top], i) => {
    const X = Math.round(sx(a + off)) - 4; if (X > W || X + (b - a) + 8 < 0) return;
    x.drawImage(astroO(i), X, top);
  });
  const vink = (wx, top, fas, hatt) => {
    for (const off of [-AB_L, 0, AB_L]) {
      const X = Math.round(sx(wx + off)); if (X < -12 || X > W + 4) continue;
      const hopp = fas === 'hopp' ? Math.round(Math.abs(Math.sin(t * Math.PI * 1.5)) * 4) : 0, Y = top - 13 - hopp;
      spr(x, BOT, X - 5, Y, ASTRO_PAL);
      const upp = Math.floor(t * 4) % 2;
      // vinkande arm
      if (fas === 'vinka') { R(x, X + 6, Y + 8 - (upp ? 3 : 1), 2, 3, '#1a2236'); R(x, X + 7, Y + 4 - (upp ? 2 : 0), 2, 4, '#f4f8fc'); P(x, X + 8, Y + 3 - (upp ? 2 : 0), '#1a2236'); }
      if (hatt) { for (let j = 0; j < 4; j++) R(x, X - 1 - j / 2 + 1, Y - 4 + j, j + 1, 1, j % 2 ? '#ff5a8a' : '#ffd040'); P(x, X, Y - 5, '#ffffff'); }
      if (fas === 'vinka' && Math.floor(t * 1.5) % 2) { R(x, X + 8, Y - 10, 13, 8, '#ffffff'); R(x, X + 9, Y - 3, 2, 2, '#ffffff'); T(x, 'HEJ', X + 9, Y - 8, '#2a7ae8'); }
    }
  };
  vink(196, 64, 'vinka'); vink(30, 78, 'hopp', true); vink(254, 72, 'vinka', false);
  // fjädern på ön i mitten
  for (const off of [-AB_L, 0, AB_L]) { const X = Math.round(sx(160 + off)); if (X > -10 && X < W + 4) { R(x, X - 4, 60, 9, 4, '#2a7ae8'); R(x, X - 4, 60, 9, 1, '#7ac0ff'); R(x, X - 3, 62, 7, 2, '#c0c8d8'); } }
  // Astros bana: springer på öarna och hoppar över glappen (svävar med jetstrålar i mitten av hoppet)
  const hojd = (wx) => {
    wx = mod(wx, AB_L);
    for (let i = 0; i < AB_OAR.length; i++) {
      const [a, b, top] = AB_OAR[i], [na, , ntop] = AB_OAR[(i + 1) % AB_OAR.length], nA = na + (i === AB_OAR.length - 1 ? AB_L : 0);
      if (wx >= a + 6 && wx <= b - 8) return { y: top, luft: 0 };
      const s0 = b - 8, s1 = nA + 6, w2 = wx < 6 ? wx + AB_L : wx;
      if (w2 > s0 && w2 < s1) { const p = (w2 - s0) / (s1 - s0), y = top + (ntop - top) * p - Math.sin(p * Math.PI) * 28; return { y, luft: p, sva: p > 0.35 && p < 0.7 }; }
    }
    return { y: AB_OAR[0][2], luft: 0 };
  };
  const ast = hojd(cam);
  // mynten i bågar över glappen – tas när Astro passerar och kommer tillbaka när de är utanför bild
  const MYNT = [];
  for (let i = 0; i < AB_OAR.length; i++) { const [, b] = AB_OAR[i], [na] = AB_OAR[(i + 1) % AB_OAR.length], nA = na + (i === AB_OAR.length - 1 ? AB_L : 0); for (let k = 1; k < 6; k++) { const wx = b - 8 + ((nA + 6 - (b - 8)) * k) / 6; MYNT.push([wx, hojd(wx).y - 10]); } }
  for (const wx of [30, 50, 70, 160, 176]) MYNT.push([wx, hojd(wx).y - 12]);
  for (const [wx, wy] of MYNT) {
    const sedan = mod(cam - wx, AB_L);
    for (const off of [-AB_L, 0, AB_L]) {
      const X = Math.round(sx(wx + off)); if (X < -8 || X > W + 8) continue;
      if (sedan < 80) {
        if (sedan < 14) { const r = Math.round(sedan / 2); for (const [dx, dy] of [[r, 0], [-r, 0], [0, r], [0, -r]]) P(x, X + dx, Math.round(wy) + dy, '#fff8a0'); if (sedan < 8) T(x, '+1', X - 3, Math.round(wy) - 8 - sedan, '#ffffff'); }
        continue;
      }
      // runt guldmynt som snurrar: smalnar till en kant och breddas igen
      const rx = Math.round(Math.abs(Math.cos(t * Math.PI * 1.25 + wx)) * 3.5), Y = Math.round(wy + Math.sin(t * Math.PI * 0.75 + wx) * 1);
      if (rx < 1) R(x, X, Y - 3, 1, 7, '#e8a820');
      else { ellips(x, X, Y, rx, 3, '#c88a10'); if (rx > 1) { ellips(x, X, Y, rx - 1, 2, '#ffd23a'); P(x, X - rx + 1, Y - 1, '#fff8c0'); if (rx > 2) R(x, X, Y - 1, 1, 3, '#e8a820'); } }
    }
  }
  // Astro själv
  const ay = Math.round(ast.y), ram = ast.luft ? 'hopp' : Math.floor(t * 8) % 2 ? 'spring1' : 'spring0', gung = ast.luft ? 0 : Math.floor(t * 8) % 2;
  if (ast.sva) for (const dx of [-3, 2]) { const l = 6 + Math.floor(t * 30) % 3 * 2; for (let j = 0; j < l; j++) R(x, AX + dx + 1, ay + j, 2, 1, j < 2 ? '#ffffff' : j % 2 ? '#7ae0ff' : '#3ac0ff'); }
  const Y = ay - 21 - gung;
  spr(x, ASTRO_HUVUD, AX - 7, Y, ASTRO_PAL); spr(x, ASTRO_KROPP[ram], AX - 7, Y + 12, ASTRO_PAL);
  if (Math.floor(t * 2) % 4 === 0) { R(x, AX, Y + 5, 2, 3, '#0c1020'); R(x, AX + 4, Y + 5, 2, 3, '#0c1020'); R(x, AX, Y + 7, 2, 1, '#3ad8ff'); R(x, AX + 4, Y + 7, 2, 1, '#3ad8ff'); }   // blinkar
  // HUD: mynten och räddade botar
  ellips(x, 9, 9, 5, 5, '#c88a10'); ellips(x, 9, 9, 4, 4, '#ffd23a'); R(x, 8, 6, 2, 6, '#e8a820'); P(x, 7, 6, '#fff8c0');
  kontur(x, '248', 17, 6, '#ffffff', '#1a2236', BIG);
  spr(x, BOT_HUVUD, W - 38, 5, { ...ASTRO_PAL, G: '#8aa4c8' });
  kontur(x, '12', W - 22, 6, '#ffffff', '#1a2236', BIG);
}

export const GLIMTAR = [
  { id: 'blandoss', titel: 'RYMDSABOTAGE', forebild: 'Among Us', ar: 2018, studio: 'LITTLE SHIP', w: 192, h: 108, rita: blandOss },
  { id: 'astrobotten', titel: 'RYMDROBOTEN', forebild: 'Astro Bot', ar: 2024, studio: 'TOYBOX', w: 192, h: 108, rita: astroBotten },
  { id: 'marcokartvarld', titel: 'PIPO KART JORDEN RUNT', forebild: 'Mario Kart World', ar: 2025, studio: 'SVAMPSTUDION', w: 192, h: 108, rita: marcoKart },
];
