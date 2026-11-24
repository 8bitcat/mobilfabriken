// Spelglimtar, grupp A. Samma format som BAS i ../glimtar.js. Verktygen finns i ../pix.js.
import { SMALL, BIG, R, P, T, TW, TK, spr, tri, mod, disc, hash, toning, fast } from '../pix.js';
import { $t } from '../../core/i18n.js';

// ---------- 1980 SPACE INVADÖRS (Space Invaders) ----------
// Arkadens färgfilm: röd remsa upptill (tefatet), vita invaderare i mitten, grönt nertill (bunkrar och kanonen).
const INV_BLACK = '#000000', INV_VIT = '#f0f0f0', INV_GRON = '#20f040', INV_ROD = '#ff2828';
// tre sorters invaderare, två bildrutor var (benen växlar för varje marschsteg)
const BLAEKA = [['...##...', '..####..', '.######.', '##.##.##', '########', '..#..#..', '.#.##.#.', '#.#..#.#'],
  ['...##...', '..####..', '.######.', '##.##.##', '########', '.#.##.#.', '#......#', '.#....#.']];
const KRABBA = [['..#.....#..', '...#...#...', '..#######..', '.##.###.##.', '###########', '#.#######.#', '#.#.....#.#', '...##.##...'],
  ['..#.....#..', '#..#...#..#', '#.#######.#', '###.###.###', '###########', '.#########.', '..#.....#..', '.#.......#.']];
const BLAFISK = [['....####....', '.##########.', '############', '###..##..###', '############', '...##..##...', '..##.##.##..', '##........##'],
  ['....####....', '.##########.', '############', '###..##..###', '############', '..###..###..', '.##..##..##.', '..##....##..']];
const POFF = ['....#...#....', '.#...#.#...#.', '..#.......#..', '...#.....#...', '##.........##', '...#.....#...', '..#.#...#.#..', '.#...#.#...#.'];
const KANON = ['......#......', '.....###.....', '.....###.....', '.###########.', '#############', '#############', '#############', '#############'];
const TEFAT = ['.....######.....', '...##########...', '..############..', '.##.##.##.##.##.', '################', '..###..##..###..', '...#........#...'];
const BUNKER = ['....##############....', '...################...', '..##################..', '.####################.', '######################', '######################',
  '######################', '######################', '######################', '######################', '######################', '######################',
  '#######........#######', '######..........######', '#####............#####', '#####............#####'];
const INV_RAD = [BLAEKA, KRABBA, KRABBA, BLAFISK, BLAFISK], INV_POANG = [30, 20, 20, 10, 10];
const INV_P = 10.2, INV_STEG = 0.2, INV_SVEP = 12, INV_KOL = 7, INV_DX = 14, INV_DY = 12, INV_TOPP = 28;
// skotten: [tid då skottet träffar, kolumn, rad] – alltid den nedersta levande i kolumnen
const INV_SKOTT = [[2.3, 3, 4], [3.3, 4, 4], [4.5, 2, 4], [5.6, 4, 3], [6.7, 1, 4], [7.8, 5, 4], [8.9, 3, 3]];
// formationen marscherar i steg: höger tolv steg, ett steg ner, vänster tolv, ner … (vågen ritas in först)
function invForm(tt) {
  const s = Math.max(0, Math.floor((tt - 1.3) / INV_STEG)), varv = Math.floor(s / (INV_SVEP + 1)), i = s % (INV_SVEP + 1);
  const ner = Math.min(2, varv + (i === INV_SVEP ? 1 : 0)), pos = i === INV_SVEP ? INV_SVEP : i;
  return { ox: 4 + 2 * (varv % 2 ? INV_SVEP - pos : pos), oy: ner * 4, bild: s % 2 };
}
const invX = (f, k, rad) => f.ox + k * INV_DX + (rad === 0 ? 3 : rad < 3 ? 1 : 0), invY = (f, rad) => INV_TOPP + f.oy + rad * INV_DY;
function invaders(x, t) {
  const W = 128, H = 128, tt = mod(t, INV_P), BY = 94, KY = 112;
  const bak = fast('invaders', W, H, (y) => {
    R(y, 0, 0, W, H, INV_BLACK);
    // bunkrarna med lite gamla skador
    for (let b = 0; b < 4; b++) {
      const X = 9 + b * 30;
      spr(y, BUNKER, X, BY, { '#': INV_GRON });
      for (let k = 0; k < 7; k++) { const hx = X + Math.floor(hash(b, k) * 20), hy = BY + (k < 4 ? 0 : Math.floor(hash(k, b) * 4)); R(y, hx, hy, 2, k < 4 ? 2 : 1, INV_BLACK); }
    }
    // marklinjen och reservkanonerna
    R(y, 0, H - 9, W, 1, INV_GRON);
    for (const kx of [14, 30]) spr(y, KANON, kx, H - 7, { '#': INV_GRON });
    T(y, '3', 5, H - 6, INV_VIT); T(y, $t('KREDIT 00'), W - 4 - TW($t('KREDIT 00')), H - 6, INV_VIT);
    T(y, $t('POÄNG<1>'), 4, 2, INV_VIT); T(y, $t('REKORD'), 52, 2, INV_VIT); T(y, $t('POÄNG<2>'), W - 4 - TW($t('POÄNG<2>')), 2, INV_VIT);
    T(y, '0000', W - 4 - TW($t('POÄNG<2>')) + 8, 10, INV_VIT);
  });
  x.drawImage(bak, 0, 0);
  const f = invForm(tt);
  // poängen: vad som skjutits ner hittills i vågen
  let poang = 0; for (const [ts, , rad] of INV_SKOTT) if (tt >= ts) poang += INV_POANG[rad];
  T(x, String(1180 + poang).padStart(4, '0'), 12, 10, INV_VIT); T(x, '7650', 56, 10, INV_VIT);
  // invaderarna – i början av vågen ritas de in en i taget nerifrån, precis som i arkaden
  const synliga = Math.floor(tt / (1.25 / 35));
  for (let rad = 0; rad < 5; rad++) for (let k = 0; k < INV_KOL; k++) {
    if ((4 - rad) * INV_KOL + k >= synliga) continue;
    const skott = INV_SKOTT.find(([, kk, rr]) => kk === k && rr === rad);
    if (skott && tt >= skott[0] + 0.25) continue;
    const ff = skott && tt >= skott[0] ? invForm(skott[0]) : f;
    if (skott && tt >= skott[0]) { spr(x, POFF, invX(ff, k, 3) - 1, invY(ff, rad), { '#': INV_VIT }); continue; }
    spr(x, INV_RAD[rad][f.bild], invX(f, k, rad), invY(f, rad), { '#': INV_VIT });
  }
  // laserkanonen glider till nästa mål och skjuter
  const mal = INV_SKOTT.map(([ts, k]) => [ts - 0.32, invX(invForm(ts), k, 3)]);
  let kx = mal[0][1];
  for (let i = 0; i < mal.length; i++) {
    const [t0, x0] = mal[i], [t1, x1] = mal[(i + 1) % mal.length], t1b = i + 1 < mal.length ? t1 : t1 + INV_P;
    if (tt >= t0 && tt < t1b) { const p = Math.min(1, Math.max(0, (tt - t0 - 0.15) / (t1b - t0 - 0.5))); kx = x0 + (x1 - x0) * (p * p * (3 - 2 * p)); }
    if (i === 0 && tt < t0) { const [ta, xa] = mal[mal.length - 1], p = Math.min(1, Math.max(0, (tt + INV_P - ta - 0.15) / (t0 + INV_P - ta - 0.5))); kx = xa + (x0 - xa) * (p * p * (3 - 2 * p)); }
  }
  spr(x, KANON, Math.round(kx), KY, { '#': INV_GRON });
  // skottet: ett vitt streck uppåt från kanonen
  for (const [ts, k, rad] of INV_SKOTT) {
    const d = ts - tt; if (d < 0 || d > 0.32) continue;
    const y0 = KY - 4, y1 = invY(invForm(ts), rad) + 6, ly = y1 + (y0 - y1) * (d / 0.32);
    R(x, Math.round(invX(invForm(ts), k, 3) + 6), Math.round(ly), 1, 4, INV_VIT);
  }
  // invaderarnas bomber: sicksack som faller ner mot bunkrarna
  for (const [ts, k, rad] of [[3.0, 0, 2], [5.0, 6, 1], [7.4, 2, 3], [9.4, 5, 2]]) {
    const d = tt - ts; if (d < 0) continue;
    const ff = invForm(ts), bx = invX(ff, k, 3) + 5, by = invY(ff, rad) + 9 + d * 46;
    const stopp = mod(bx - 9, 30) < 22 ? BY - 3 : H - 16;   // bunkern tar emot, annars marken
    if (by > stopp) { if (by < stopp + 5) R(x, bx - 1, stopp + 1, 3, 2, INV_VIT); continue; }
    for (let j = 0; j < 7; j++) P(x, bx + ((j + Math.floor(t * 12)) % 4 === 1 ? 1 : (j + Math.floor(t * 12)) % 4 === 3 ? -1 : 0), by + j, INV_VIT);
  }
  // tefatet korsar överst (rött genom färgfilmen)
  const ut = tt - 3.6;
  if (ut > 0 && ut < 4.4) spr(x, TEFAT, Math.round(-16 + ut * 33), 18, { '#': INV_ROD });
}

// ---------- 1981 DONKEY KONGO (Donkey Kong) ----------
// Röda balkar som lutar åt varannat håll, ljusblå stegar, apan uppe till vänster som rullar tunnor,
// damen överst som ropar på hjälp och snickaren i röd keps som hoppar över tunnorna och klättrar.
const DK_BALK = '#f0285a', DK_STEGE = '#40d8f0';
// balkarna: [x0, x1, y(x)] där y är ovankanten och lutningen går i trappsteg som i arkaden
const DK_BALKAR = [
  [56, 96, () => 26],                                                   // damens plattform
  [0, 112, (x) => 46 + (x < 72 ? 0 : Math.floor((x - 72) / 8))],        // apans balk, lutar ner åt höger
  [14, 128, (x) => 68 + Math.floor((128 - x) / 16)],                    // lutar ner åt vänster
  [0, 114, (x) => 90 + Math.floor(x / 16)],                             // lutar ner åt höger
  [0, 128, (x) => 116 - (x < 64 ? 0 : Math.floor((x - 64) / 16))],      // nedersta, stiger åt höger
];
const dkY = (n, x) => DK_BALKAR[n][2](Math.max(DK_BALKAR[n][0], Math.min(DK_BALKAR[n][1] - 1, x)));
// stegarna: [x, balken ovanför, balken under, trasig]
const DK_STEGAR = [[84, 0, 1, false], [100, 1, 2, false], [40, 1, 2, true], [30, 2, 3, false], [70, 2, 3, true], [76, 3, 4, false], [104, 3, 4, true]];
// tunnans väg: [sekunder, typ, balk/från, …]. Tio sekunder per varv, fyra tunnor i rad med 2,5 sekunders mellanrum.
const DK_VAG = [[1.8, 'rull', 1, 36, 109], [0.35, 'fall', 1, 2, 109, 116], [2.3, 'rull', 2, 116, 10], [0.35, 'fall', 2, 3, 10, 4],
  [2.3, 'rull', 3, 4, 110], [0.35, 'fall', 3, 4, 110, 116], [2.0, 'rull', 4, 116, 12], [0.55, 'in']];
function dkTunna(pt) {
  for (const s of DK_VAG) {
    if (pt >= s[0]) { pt -= s[0]; continue; }
    const p = pt / s[0];
    if (s[1] === 'rull') { const bx = s[3] + (s[4] - s[3]) * p; return { x: bx, y: dkY(s[2], bx + 3) - 7, v: (s[4] > s[3] ? 1 : -1) * bx }; }
    if (s[1] === 'fall') { const bx = s[4] + (s[5] - s[4]) * p, y0 = dkY(s[2], s[4] + 3) - 7, y1 = dkY(s[3], s[5] + 3) - 7; return { x: bx, y: y0 + (y1 - y0) * p * p - Math.sin(p * Math.PI) * 3, v: bx * (s[5] > s[4] ? 1 : -1) }; }
    return null;
  }
  return null;
}
// snickaren (9×10), åt höger; benen byts mellan två bilder
const SNICK = ['...RRR...', '..RRRRRR.', '..HHSKS..', '.HSHSSSS.', '.HHSSMMM.', '..SSSSS..', '.BRBBRB..', 'BBRRRRBB.'];
const SNICK_BEN = [['..RR.RR..', '.HH...HH.'], ['...RRR...', '...HHH...']];
const SNICK_KLATTER = [['...RRR...', '.SRRRRRS.', '.SHHHHHS.', '.BHHHHHB.', '..HHHHH..', '..BRRRB..', '.BBRRRBB.', '..RRRRR..', '..RR.RR..', '.HH...HH.'],
  ['.S.RRR.S.', '.BRRRRRB.', '..HHHHH..', '..BHHHB..', '..HHHHH..', '..BRRRB..', '..BRRRB..', '..RRRRR..', '..RR.RR..', '..HH.HH..']];
const SNICK_PAL = { R: '#f02828', B: '#3050f8', S: '#ffb080', H: '#7a3a10', K: '#101010', M: '#5a2408' };
// damen (8×13) med rosa klänning; armen vinkar
const DAM = ['..OOO...', '.OOOOO..', '.OSKSO..', '.OSSSO..', 'OOSSS...', '.PPPPP..', 'PPPWPPP.', '.PPPPP..', '.PPPPP..', 'PPPPPPP.', 'PPPPPPP.', '.S...S..', 'WW...WW.'];
const DAM_PAL = { O: '#f08020', S: '#ffc8a0', K: '#101010', P: '#ff58b8', W: '#ffffff' };
// apans kropp utan armar (22×20); armarna ritas för sig beroende på vad den gör
const APA = [
  '.......DDDDDDDD.......', '......DFFFFFFFFD......', '.....DFFFFFFFFFFD.....', '....DFFSSSFFSSSFFD....', '....DFSWKSSSSKWSFD....',
  '....DFSSSSSSSSSSFD....', '...DFFSSSKSSKSSSFFD...', '..DFFFFSSSSSSSSFFFFD..', '.DFFFFFSMMMMMMSFFFFFD.', '.DFFFFFFSSSSSSFFFFFFD.',
  '.DFFFFSSSSSSSSSSFFFFD.', '..DFFSSSSSSSSSSSSFFD..', '..DFFSSSSSSSSSSSSFFD..', '...DFSSSSSSSSSSSSFD...', '....DFFFFFFFFFFFFD....',
  '.....DFFFFFFFFFFD.....', '....DFFFD..DFFFD......', '...DFFFFD..DFFFFD.....', '..DSSSSD....DSSSSD....', '..DDDDD......DDDDD....'];
const APA_PAL = { D: '#5a1c00', F: '#b44c10', S: '#f8b070', W: '#ffffff', K: '#101010', M: '#a01818' };
function dkTunnaRund(x, X, Y, v) {
  // rullande tunna sedd från gaveln: rund, med band som snurrar
  disc(x, X + 3, Y + 3, 3, '#5a2808'); disc(x, X + 3, Y + 3, 2, '#d07020');
  const a = (v / 3) % (Math.PI), c = Math.cos(a), s = Math.sin(a);
  for (let i = -2; i <= 2; i++) P(x, X + 3 + Math.round(c * i), Y + 3 + Math.round(s * i), '#6a3010');
  P(x, X + 2, Y + 1, '#f8b060');
}
function dkTunnaStaende(x, X, Y) {
  R(x, X + 1, Y, 4, 8, '#d07020'); R(x, X, Y + 1, 6, 6, '#d07020'); R(x, X, Y + 2, 6, 1, '#5a2808'); R(x, X, Y + 5, 6, 1, '#5a2808'); R(x, X + 1, Y, 4, 1, '#f8b060'); R(x, X + 1, Y + 7, 4, 1, '#5a2808');
}
function dkArm(x, ax, ay, fx, fy) {
  const n = Math.max(Math.abs(fx - ax), Math.abs(fy - ay));
  for (let i = 0; i <= n; i++) R(x, ax + ((fx - ax) * i) / n - 1, ay + ((fy - ay) * i) / n - 1, 3, 3, '#b44c10');
  R(x, fx - 2, fy - 1, 4, 3, '#f8b070'); P(x, fx - 2, fy - 1, '#5a1c00');
}
function donkey(x, t) {
  const W = 128, H = 124, P10 = 10;
  const bak = fast('donkey', W, H, (y) => {
    R(y, 0, 0, W, H, '#000000');
    // stegarna bakom balkarna
    for (const [sx, o, u, trasig] of DK_STEGAR) {
      const y0 = dkY(o, sx + 3) + 5, y1 = dkY(u, sx + 3);
      for (let j = y0; j < y1; j++) { if (trasig && j > y0 + 3 && j < y1 - 4) continue; P(y, sx, j, DK_STEGE); P(y, sx + 6, j, DK_STEGE); if ((j - y0) % 3 === 1) R(y, sx, j, 7, 1, DK_STEGE); }
    }
    // apans två höga stegar upp ur bild
    for (const sx of [38, 46]) for (let j = 14; j < 46; j++) { P(y, sx, j, DK_STEGE); P(y, sx + 6, j, DK_STEGE); if (j % 3 === 1) R(y, sx, j, 7, 1, DK_STEGE); }
    // balkarna: två räls med sicksack emellan, i trappsteg om åtta pixlar
    for (const [x0, x1, fy] of DK_BALKAR) for (let bx = x0; bx < x1; bx += 8) {
      const by = fy(bx), bw = Math.min(8, x1 - bx);
      R(y, bx, by, bw, 1, DK_BALK); R(y, bx, by + 4, bw, 1, DK_BALK);
      for (let i = 0; i < bw; i++) { const m = (bx + i) % 4; if (m === 0) P(y, bx + i, by + 1, DK_BALK); if (m === 1 || m === 3) P(y, bx + i, by + 2, DK_BALK); if (m === 2) P(y, bx + i, by + 3, DK_BALK); }
    }
    // tunnstapeln bredvid apan
    for (const [sx, sy] of [[1, 30], [7, 30], [1, 38], [7, 38]]) dkTunnaStaende(y, sx, sy);
    // oljefatet nere till vänster
    R(y, 2, 104, 13, 12, '#2848f0'); R(y, 2, 105, 13, 1, '#a0b0ff'); R(y, 2, 114, 13, 1, '#a0b0ff'); R(y, 1, 104, 15, 1, '#a0b0ff');
    T(y, $t('OIL'), 3, 107, '#ffffff');
    // poängraden, bonusrutan
    T(y, $t('1UP'), 6, 1, '#ff3030'); T(y, '000300', 2, 7, '#ffffff');
    T(y, $t('REKORD'), 42, 1, '#ff3030'); T(y, '007650', 42, 7, '#ffffff');
    T(y, 'L=01', 104, 1, '#4060ff');
    R(y, 98, 8, 28, 14, '#4060ff'); R(y, 99, 9, 26, 12, '#000000'); T(y, $t('BONUS'), 101, 10, '#ff58b8');
  });
  x.drawImage(bak, 0, 0);
  T(x, String(5000 - Math.floor(mod(t, P10) / 2.5) * 100), 104, 16, '#40d8f0');
  // damen på toppen: vinkar och ropar HJÄLP!
  const vink = Math.floor(t * 4) % 2;
  spr(x, DAM, 64, 13, DAM_PAL); if (vink) { R(x, 70, 15, 2, 1, '#ffc8a0'); P(x, 72, 14, '#ffc8a0'); } else R(x, 70, 19, 2, 1, '#ffc8a0');
  if (mod(t, 3) < 1.8) T(x, $t('HJÄLP!'), 75, 15, '#ffffff');
  // oljefatets eld – flammar upp när en tunna rullar in
  const flamma = mod(t - 1.2 - 9.45, 2.5) < 0.5;
  for (let i = 0; i < 11; i++) {
    const h = 2 + Math.round(Math.abs(Math.sin(t * 9 + i * 1.7)) * (flamma ? 7 : 3));
    R(x, 3 + i, 104 - h, 1, h, i % 3 ? '#ff4010' : '#ffd020'); P(x, 3 + i, 104 - h, '#fff080');
  }
  // apan: tar en tunna från stapeln, håller den över huvudet, lägger ner den och dunkar sig på bröstet
  const af = mod(t, 2.5), AX = 12, AY = 26;
  spr(x, APA, AX, AY, APA_PAL);
  const vA = [AX + 4, AY + 10], hA = [AX + 17, AY + 10];
  if (af < 0.45) { dkArm(x, ...vA, AX - 1, AY + 7); dkArm(x, ...hA, AX + 19, AY + 16); dkTunnaStaende(x, AX - 5, AY + 4); }
  else if (af < 0.95) { R(x, AX + 3, AY - 7, 16, 7, '#d07020'); R(x, AX + 3, AY - 7, 16, 1, '#f8b060'); R(x, AX + 7, AY - 7, 1, 7, '#5a2808'); R(x, AX + 14, AY - 7, 1, 7, '#5a2808'); dkArm(x, ...vA, AX + 4, AY - 2); dkArm(x, ...hA, AX + 18, AY - 2); }
  else if (af < 1.2) { dkArm(x, ...vA, AX + 2, AY + 15); dkTunnaRund(x, AX + 22, AY + 13, 0); dkArm(x, ...hA, AX + 23, AY + 14); }
  else { const s = Math.floor(af * 5) % 2; dkArm(x, ...vA, s ? AX + 8 : AX - 1, s ? AY + 12 : AY + 2); dkArm(x, ...hA, s ? AX + 22 : AX + 13, s ? AY + 2 : AY + 12); if (s !== Math.floor((af - 0.2) * 5) % 2) R(x, AX + 9, AY + 8, 4, 1, '#a01818'); }
  // tunnorna längs balkarna
  for (let k = 0; k < 4; k++) { const b = dkTunna(mod(t - 1.2 - k * 2.5, P10)); if (b) dkTunnaRund(x, Math.round(b.x), Math.round(b.y), b.v); }
  // snickaren: går mot stegen, hoppar över tunnorna, klättrar upp en bit och ner igen och går tillbaka
  const mf = mod(t, P10);
  let mx, my, klattrar = false, vand = false;
  if (mf < 3.4) mx = 16 + (mf / 3.4) * 60;
  else if (mf < 6.6) { mx = 76; klattrar = true; const p = mf < 5.0 ? (mf - 3.4) / 1.6 : mf < 5.4 ? 1 : 1 - (mf - 5.4) / 1.2; my = 106 - p * 17; }
  else { mx = 76 - ((mf - 6.6) / 3.4) * 60; vand = true; }
  if (!klattrar) {
    // hopp: när en tunna på nedersta balken är på väg att passera (eller just har passerat)
    let hopp = 0;
    const mxAt = (tt) => { const m = mod(tt, P10); return m < 3.4 ? 16 + (m / 3.4) * 60 : m < 6.6 ? 76 : 76 - ((m - 6.6) / 3.4) * 60; };
    const avst = (k, tt) => { const b = dkTunna(mod(tt - 1.2 - k * 2.5, P10)); return b && b.y > 100 ? b.x + 3 - (mxAt(tt) + 4) : null; };
    for (let k = 0; k < 4; k++) for (let d = -0.34; d < 0.34; d += 0.04) {
      const a = avst(k, t + d), b = avst(k, t + d + 0.04);
      if (a !== null && b !== null && a * b <= 0) hopp = Math.max(hopp, Math.cos(((d + 0.02) / 0.36) * Math.PI / 2) * 7);
    }
    my = dkY(4, Math.round(mx) + 4) - 10 - Math.round(hopp);
    spr(x, SNICK, Math.round(mx), my, SNICK_PAL, vand); spr(x, SNICK_BEN[hopp > 0.5 ? 0 : Math.floor(t * 8) % 2], Math.round(mx), my + 8, SNICK_PAL, vand);
  } else spr(x, SNICK_KLATTER[Math.floor(my / 3) % 2], 75, Math.round(my), SNICK_PAL);
}

// ---------- 1986 ALEX KIDZ I MIRAKELVÄRLDEN (Alex Kidd in Miracle World) ----------
// Master System-paletten (bara 00/55/AA/FF per kanal): ljusblå himmel, bruna klippblock med gräs,
// gula stjärnblock som Alex slår sönder med sin stora knytnäve, pengapåsar och riskakan.
const AK = { S: '#ffaa55', s: '#aa5500', H: '#550000', K: '#000000', W: '#ffffff', R: '#ff0000', r: '#aa0000', B: '#550000', Y: '#ffff55' };
// Alex (16×17 + ben) åt höger: stort runt huvud med mörkt hår, ett jättestort öra baktill, röd overall
const ALEX = [
  '......HHHHH.....', '....HHHHHHHHH...', '...HHHHHHHHHHH..', '..HHHHHHHHHHHHH.', '..HHHHHHHSSSSHH.', '.sHHHHHSSSSWWS..',
  'sSSsHHSSSSSWKS..', 'sSssSHSSSSSWKSS.', 'sSssSSSSSSSSSSSS', 'sSSsSSSSSSSSSSS.', '.sSSSSSSSSSSrrS.', '..ssSSSSSSSSSS..',
  '....SSSSSSSSS...', '.....RRRRRRR....', '....RRRRRRRRSS..', '....rRRRRRRRSS..', '.....RRRRRRR....'];
const ALEX_BEN = [['.....RRR.RRR....', '.....RRR.RRR....', '....BBBB.BBBB...'], ['......RRRRR.....', '......RRRRR.....', '.....BBBBBB.....'],
  ['....RR....RR....', '...RR......RR...', '..BBB.......BBB.']];
const PASE = ['..ss...', '.sYYs..', '.YYYY..', 'YYsYYY.', 'YsssYY.', 'YYYsYY.', 'YsssYY.', '.YYYY..'];   // pengapåsen med $
const RISKAKA = ['...WW...', '..WWWW..', '.WWWWWW.', '.WWWWWW.', 'WWWWWWWW', 'WWKKKKWW', '.WKKKKW.'];
const AK_V = 240, AK_MARK = 72, AK_DAMM = [13, 14];    // världen upprepas var 240:e pixel; dammen i kolumn 13–14
function akKlippa(x, X, Y, gras) {
  // kullrig brun sten: rundade hörn, ljus kant uppe till vänster, mörk spricka
  R(x, X + 1, Y, 10, 12, '#aa5500'); R(x, X, Y + 1, 12, 10, '#aa5500');
  R(x, X + 2, Y + 1, 6, 1, '#ffaa55'); R(x, X + 1, Y + 2, 1, 5, '#ffaa55'); R(x, X + 2, Y + 2, 3, 2, '#ffaa55'); P(x, X + 8, Y + 6, '#ffaa55'); R(x, X + 7, Y + 7, 2, 1, '#ffaa55');
  R(x, X + 11, Y + 2, 1, 9, '#550000'); R(x, X + 2, Y + 11, 9, 1, '#550000'); P(x, X + 10, Y + 10, '#550000');
  P(x, X + 5, Y + 5, '#550000'); P(x, X + 6, Y + 6, '#550000'); R(x, X + 6, Y + 7, 1, 2, '#550000'); P(x, X + 3, Y + 9, '#550000');
  if (gras) { R(x, X, Y, 12, 3, '#55ff55'); for (let i = 0; i < 12; i++) P(x, X + i, Y + 3 + (i % 3 === 1 ? 1 : 0), '#00aa00'); R(x, X + 1, Y, 10, 1, '#aaffaa'); }
}
const STJARNA = ['...##...', '...##...', '########', '.######.', '..####..', '.##..##.', '.#....#.'];
function akStjarnblock(x, X, Y) {
  R(x, X, Y, 12, 12, '#ffff55'); R(x, X, Y, 12, 1, '#ffffaa'); R(x, X, Y, 1, 12, '#ffffaa'); R(x, X + 11, Y, 1, 12, '#aa5500'); R(x, X, Y + 11, 12, 1, '#aa5500');
  spr(x, STJARNA, X + 2, Y + 2, { '#': '#ff5500' });
}
function alexKidz(x, t) {
  const W = 128, H = 96, cam = t * 28, C = mod(cam, AK_V), AX = 34;
  const sx = (wx) => { let v = wx - C; if (v < -40) v += AK_V; if (v > W + 20) v -= AK_V; return Math.round(v); };
  // himmel, moln och gröna berg i parallax
  toning(x, 0, 0, W, AK_MARK + 4, ['#55aaff', '#55aaff', '#aaffff']);
  R(x, 0, AK_MARK + 4, W, H - AK_MARK - 4, '#550000');
  for (let k = -1; k < 3; k++) {
    const mx = Math.round(k * 90 - mod(cam * 0.25, 90)) + 30;
    for (const [dx, dy, r] of [[0, 0, 4], [6, -3, 5], [13, 0, 4]]) disc(x, mx + dx, 16 + dy + (k & 1) * 8, r, '#ffffff');
    R(x, mx - 3, 19 + (k & 1) * 8, 20, 2, '#ffffff'); R(x, mx - 2, 21 + (k & 1) * 8, 18, 1, '#aaffff');
  }
  // berget i fjärran (Mt. Eternal) och gröna buskkullar närmare
  for (let k = -1; k < 3; k++) {
    const bx = Math.round(k * 96 - mod(cam * 0.2, 96));
    for (let j = 0; j < 40; j++) { const hw = Math.round(j * 0.9 + (j > 8 ? Math.sin(j * 0.7) * 2 : 0)); R(x, bx + 48 - hw, AK_MARK - 40 + j, hw * 2, 1, j < 6 ? '#ffffff' : (j + Math.floor(hw / 3)) % 7 ? '#aa5555' : '#aa0055'); R(x, bx + 48 + hw - 2, AK_MARK - 40 + j, 2, 1, '#550055'); }
  }
  for (let k = -1; k < 4; k++) {
    const bx = Math.round(k * 56 - mod(cam * 0.5, 56));
    for (let j = 0; j < 12; j++) { const hw = Math.round(Math.sqrt(Math.max(0, 144 - (12 - j) * (12 - j))) * 1.6); R(x, bx + 28 - hw, AK_MARK - 12 + j, hw * 2, 1, j < 2 ? '#55ff55' : '#00aa00'); }
    for (let i = 0; i < 5; i++) P(x, bx + 18 + i * 5, AK_MARK - 6 + (i % 2) * 3, '#005500');
  }
  // marken: två rader klippblock med gräs, utom dammen
  for (let k = 0; k < AK_V / 12; k++) {
    const X = sx(k * 12); if (X < -12 || X > W) continue;
    if (AK_DAMM.includes(k)) {
      R(x, X, AK_MARK + 4, 12, H - AK_MARK - 4, '#0055ff');
      for (let i = 0; i < 12; i++) P(x, X + i, AK_MARK + 4 + (mod(i + Math.floor(t * 6), 6) < 2 ? 0 : 1), mod(i + Math.floor(t * 6), 6) < 2 ? '#ffffff' : '#55aaff');
      continue;
    }
    akKlippa(x, X, AK_MARK, true); akKlippa(x, X, AK_MARK + 12, false);
  }
  // avsatsen av klippblock, och två svävande stjärnblock längre fram
  for (const wx of [108, 120]) { const X = sx(wx); if (X > -12 && X < W) akKlippa(x, X, AK_MARK - 12, true); }
  for (const wx of [204, 216]) { const X = sx(wx); if (X > -12 && X < W) akStjarnblock(x, X, AK_MARK - 40); }
  // var Alex är i världen (fas) och hur högt han är
  const fas = mod(C + AX, AK_V);
  let hojd = 0;
  if (fas > 90 && fas < 106) { const p = (fas - 90) / 16; hojd = 12 * p + Math.sin(p * Math.PI) * 12; }
  else if (fas >= 106 && fas < 124) hojd = 12;
  else if (fas >= 124 && fas < 132) { const p = (fas - 124) / 8; hojd = 12 * (1 - p * p); }
  else if (fas > 146 && fas < 186) { const p = (fas - 146) / 40; hojd = Math.sin(p * Math.PI) * 26; }
  // stjärnblocket på marken: slås sönder när näven når det, en pengapåse dyker upp och tas.
  // rel = var blocket ligger i förhållande till Alex (positivt = framför), så att nästa varvs block står helt.
  const relTill = (wx) => mod(wx - fas + 120, AK_V) - 120;
  const rel = relTill(60), BX = AX + rel, slag = rel > 8 && rel <= 19, krossad = rel <= 13 && rel > -100;
  if (!krossad && BX > -12 && BX < W) akStjarnblock(x, BX, AK_MARK - 12);
  if (krossad && rel > -15) {
    const p = (13 - rel) / 28;
    for (const [dx, dy, vx] of [[0, 0, -1], [6, 0, 1], [0, 6, -1.4], [6, 6, 1.4]]) {
      const fx = BX + dx + vx * p * 30, fy = AK_MARK - 12 + dy - Math.sin(p * 2.2) * 20 + p * p * 30;
      R(x, fx, fy, 6, 6, '#ffff55'); R(x, fx, fy, 6, 1, '#ffffaa'); R(x, fx + 5, fy, 1, 6, '#aa5500'); P(x, fx + 2, fy + 3, '#ff5500');
    }
  }
  if (krossad && rel > 2) spr(x, PASE, BX + 3, AK_MARK - 8 - Math.min(4, (13 - rel) * 0.8), AK);
  const varv = Math.floor((cam + AX - 58) / AK_V), pengar = 20 + 20 * mod(varv + 1, 25);
  if (rel <= 2 && rel > -20) T(x, '+20', BX + 2, AK_MARK - 22 - (2 - rel) * 0.5, '#ffff55');
  // riskakan svävar över dammen och tas i hoppet
  const rr = relTill(164), RX = AX + rr;
  if (rr > 4 || rr < -100) { if (RX > -10 && RX < W) spr(x, RISKAKA, RX, AK_MARK - 36 + Math.round(Math.sin(t * 4)), AK); }
  else if (rr > -12) { const p = (4 - rr) / 16; for (let i = 0; i < 6; i++) { const a = i * 1.05 + p * 2; P(x, RX + 4 + Math.cos(a) * (3 + p * 10), AK_MARK - 32 + Math.sin(a) * (3 + p * 10), i % 2 ? '#ffffff' : '#ffff55'); } }
  // Alex själv – slaget skjuter ut armen med den jättestora näven
  const AY = AK_MARK - 20 - Math.round(hojd), luft = (fas > 90 && fas < 106) || (fas > 124 && fas < 132) || (fas > 146 && fas < 186);
  spr(x, ALEX, AX, AY, AK);
  spr(x, ALEX_BEN[luft ? 2 : Math.floor(t * 7) % 2], AX, AY + 17, AK);
  if (slag) {
    const ut = Math.min(1, (19 - rel) / 3), nx = AX + 12 + Math.round(ut * 4);
    R(x, AX + 10, AY + 14, nx - AX - 10, 3, '#ff0000');
    spr(x, ['.sssss.', 'sSSSSSs', 'sSSSSSs', 'sSSsssS', 'sSSSSSs', 'sSSsssS', 'sSSSSSs', '.sssss.'], nx, AY + 11, AK);   // knytnäven med knogarna
  }
  // poängrutan: pengapåsen och Alex-huvudet med liven
  spr(x, PASE, 4, 3, AK); TK(x, String(pengar), 12, 4, '#ffffff', '#000000', SMALL);
  spr(x, ['..HHHH..', '.HHHHHH.', 'sHHHSSS.', 'SsHSSWK.', 'SsSSSSSS', '.SSSSrr.', '..SSSS..'], W - 27, 3, AK);
  TK(x, '×3', W - 16, 4, '#ffffff', '#000000', SMALL);
}

export const GLIMTAR = [
  { id: 'invaders', titel: $t('RYMDANFALL'), forebild: 'Space Invaders', ar: 1980, studio: $t('ARCADIA'), w: 128, h: 128, rita: invaders },
  { id: 'donkey', titel: $t('APTORNET'), forebild: 'Donkey Kong', ar: 1981, studio: $t('SVAMPSTUDION'), w: 128, h: 124, rita: donkey },
  { id: 'alexkidz', titel: $t('KID KOSMO I MIRAKELLANDET'), forebild: 'Alex Kidd in Miracle World', ar: 1986, studio: $t('TORA'), w: 128, h: 96, rita: alexKidz },
];
