// Spelglimtar, grupp B. Samma format som BAS i ../glimtar.js. Verktygen finns i ../pix.js.
// SUPER MARCO KART (1992), SEGO RALLY (1995), CRASH BANDIKUT (1996), SUPER MARCO 64 (1996), FICKMONSTER GUL (1998).
import { SMALL, BIG, R, P, T, TW, TK, spr, tri, mod, disc, hash, toning, fast } from '../pix.js';

// ---------- gemensamma småverktyg ----------
// fyller en polygon rad för rad med skarpa pixelkanter (platta, "lågpolygon"-ytor)
function poly(x, pts, f) {
  let y0 = Infinity, y1 = -Infinity;
  for (const [, py] of pts) { y0 = Math.min(y0, py); y1 = Math.max(y1, py); }
  x.fillStyle = f;
  for (let y = Math.ceil(y0 - 0.5); y <= Math.floor(y1 - 0.5); y++) {
    const cy = y + 0.5, xs = [];
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
      if ((ay <= cy && by > cy) || (by <= cy && ay > cy)) xs.push(ax + ((cy - ay) / (by - ay)) * (bx - ax));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) { const a = Math.round(xs[k]), b = Math.round(xs[k + 1]); if (b > a) x.fillRect(a, y, b - a, 1); }
  }
}
// sprite (strängrader) sparad i en egen duk så att den kan skalas med drawImage
const sprDuk = (nyckel, rader, pal, spegel = false) => fast('b-' + nyckel, rader[0].length, rader.length, (y) => spr(y, rader, 0, 0, pal, spegel));
// skalad duk med fötterna mitt på (cx, fot)
function skala(x, duk, cx, fot, s) {
  const w = Math.max(1, Math.round(duk.width * s)), h = Math.max(1, Math.round(duk.height * s));
  x.drawImage(duk, Math.round(cx - w / 2), Math.round(fot - h), w, h);
}
// vänsterhalvor speglas till hela, symmetriska rader
const spegla = (halvor) => halvor.map((r) => r + [...r].reverse().join(''));
const rgb = (f) => [parseInt(f.slice(1, 3), 16), parseInt(f.slice(3, 5), 16), parseInt(f.slice(5, 7), 16)];
// text med skugga ett steg ner till höger
const TS = (x, s, X, Y, f, sk = '#000000', F = SMALL) => { T(x, s, X + 1, Y + 1, sk, F); T(x, s, X, Y, f, F); };
// snurrande mynt: bredden följer cos
function mynt(x, cx, cy, r, v, ljus = '#fce890', mitt = '#f8c018', mork = '#c88800') {
  const b = Math.abs(Math.cos(v));
  for (let j = -r; j <= r; j++) {
    const hw = Math.sqrt(Math.max(0, r * r - j * j)) * Math.max(0.15, b), X = Math.round(cx - hw), w = Math.max(1, Math.round(hw * 2));
    R(x, X, cy + j, w, 1, mitt); P(x, X, cy + j, j < 0 ? ljus : mitt); P(x, X + w - 1, cy + j, mork);
  }
  if (b > 0.5 && r > 2) R(x, Math.round(cx), cy - r + 2, 1, r * 2 - 3, mork);
}

// ======================================================================
// ---------- 1992 SUPER MARCO KART (Super Mario Kart) ----------
// Mode 7: golvet räknas fram pixel för pixel med perspektiv och vridning; karten bakifrån.
const MK = { W: 160, H: 120, HOR: 38, F: 110, CH: 6, L: 640, PER: 8, RW: 9 };
const mkMitt = (v) => 26 * Math.sin((v / MK.L) * Math.PI * 4);                    // banans mittlinje: två kurvor per varv
const mkRikt = (v) => Math.atan(26 * ((Math.PI * 4) / MK.L) * Math.cos((v / MK.L) * Math.PI * 4));
const mkVav = (v) => 3 * Math.sin((v / MK.L) * Math.PI * 10);                      // karten slingrar och tar mynten
const MK_MYNT = [92, 98, 104, 110, 266, 272, 278, 520, 526, 532, 538];
const MK_PANEL = [200, 460];
const MK_FRAGA = ['.###.', '#...#', '..##.', '.....', '..#..'];
// färgerna i golvet (index i MK_PAL)
const MK_PAL = ['#8c8c98', '#84848f', '#888893', '#f8f8f8', '#101010', '#e82818', '#f0f0f0', '#70c048', '#62b23c', '#69b942', '#383838', '#f8f8f8',
  '#f8d020', '#f87818', '#e83088', '#30a0f8', '#30c050'].map(rgb);
function mkGolv(u, v, langt, panelFarg) {
  const vv = mod(v, MK.L), d = u - mkMitt(v), ad = Math.abs(d);
  if (ad < MK.RW) {
    if (vv < 4) return (Math.floor(u) + Math.floor(vv)) & 1 ? 3 : 4;                 // mållinjen rutig
    for (const pv of MK_PANEL) {
      if (vv < pv || vv >= pv + 5 || ad < 0.6 || ad > 5.6) continue;                 // ?-plattorna på golvet
      const pu = d > 0 ? (d - 0.6) / 5 : (d + 5.6) / 5, pw = (vv - pv) / 5;
      if (pu < 0.1 || pu > 0.9 || pw < 0.1 || pw > 0.9) return 10;
      const gi = Math.floor(((pu - 0.1) / 0.8) * 5), gj = 4 - Math.floor(((pw - 0.1) / 0.8) * 5);
      return MK_FRAGA[gj] && MK_FRAGA[gj][gi] === '#' ? 11 : panelFarg;
    }
    if (langt) return 2;
    return (Math.floor(u * 0.5) + Math.floor(v * 0.5)) & 1 ? 0 : 1;
  }
  if (ad < MK.RW + 1.6) return Math.floor(v / 3) & 1 ? 6 : 5;                       // rödvita kanter
  if (langt) return 9;
  return (Math.floor(u / 4) + Math.floor(v / 4)) & 1 ? 7 : 8;
}
// karten bakifrån (vänsterhalvor som speglas), hjulens mönster rullar
function mkKart(lut, hjul) {
  const topp = ['..........RRRR', '........RRRRRR', '.......RRRRRRR', '.......rrrrrrr', '........HHHHHH', '.......SHHHHHH', '......RRRRBRRR', '.....RRRRRBRRR', '.....RRRRRBBBB'];
  const a = hjul ? 'KKkKKK' : 'KkKKKK', b = hjul ? 'KkKKKK' : 'KKkKKK';
  const botten = ['.KKKK.wwwwwwww', a + 'RRRRRRRR', b + 'RrrRRRRR', a + 'RRGGGGGG', b + 'RREEgGGG', a + 'RREEgGGG', b + 'rrrrrrrr', a + '.ggggggg', '.KKKK.........'];
  const skift = (s) => (lut > 0 ? '.' + s.slice(0, -1) : lut < 0 ? s.slice(1) + '.' : s);
  return [...spegla(topp).map(skift), ...spegla(botten)];
}
const MK_MARCO = { R: '#e02818', r: '#981008', H: '#5a2810', S: '#f8b070', B: '#2848c8', K: '#181818', k: '#686868', w: '#f0f0f0', G: '#a8a8b0', g: '#585860', E: '#e8e8f0' };
const MK_LUIGI = { ...MK_MARCO, R: '#20b030', r: '#107018' };
const MK_ROR = ['KKKKKKKKKKKKKK', 'KLLGGGGGGGGDDK', 'KLLGGGGGGGGDDK', 'KLLGGGGGGGGDDK', 'KLLGGGGGGGGDDK', 'KKKKKKKKKKKKKK', ...Array(12).fill('.KLLGGGGGGDDK.')];
const MK_ROR_PAL = { K: '#003800', L: '#98e878', G: '#20a830', D: '#087010' };
// föremålen i rutan uppe i mitten
const MK_SAKER = {
  svamp: [['....RRRR....', '..RRWWRRRR..', '.RRWWWWRRRR.', '.RRWWWWRRWR.', 'RRRRWWRRWWWR', 'RWWRRRRRWWWR', 'RWWWRRRRRWRR', '.RRRRRRRRRR.', '..CCKCCKCC..', '..CCKCCKCC..', '..CCCCCCCC..', '...CCCCCC...'], { R: '#e82818', W: '#f8f8f8', C: '#f8d8a0', K: '#202020' }],
  stjarna: [['.....YY.....', '.....YY.....', '....YYYY....', 'YYYYYYYYYYYY', '.YYYKYYKYYY.', '..YYKYYKYY..', '...YYYYYY...', '...YYYYYY...', '..YYYYYYYY..', '..YYY..YYY..', '.YY......YY.', '.Y........Y.'], { Y: '#f8d818', K: '#202020' }],
  banan: [['.......BB...', '........Y...', '........YY..', '........YY..', '.......YYY..', '......YYYY..', '.....YYYY...', '...YYYYY....', '.YYYYYY.....', 'YYYYY.......', '.Y..........', '............'], { B: '#6a4010', Y: '#f8e030' }],
  skal: [['............', '...GGGGGG...', '..GgGGGGgG..', '.GGGgGGgGGG.', '.GGGGggGGGG.', 'GgGGGggGGGgG', 'GGgGgGGgGgGG', 'WWWWWWWWWWWW', '.WWWWWWWWWW.', '..wwwwwwww..', '............', '............'], { G: '#20b030', g: '#f0f0f0', W: '#f8f8f8', w: '#c8c8c8' }],
};
let mkBild = null;
function marcoKart(x, t) {
  const { W, H, HOR, F, CH, L, PER, RW } = MK, fas = mod(t, PER), s = (fas / PER) * L;
  // karten och kameran (kameran följer vägen och halva slingrandet)
  const th = mkRikt(s), sn = Math.sin(th), cs = Math.cos(th);
  const uk = mkMitt(s) + mkVav(s), ucb = mkMitt(s) + mkVav(s) * 0.5;
  const uc = ucb - 12 * sn, vc = s - 12 * cs;
  // himlen och kullarna (vrids med kameran)
  const bak = fast('b-mk-bak', 320, HOR, (y) => {
    toning(y, 0, 0, 320, HOR, ['#4878f8', '#6890f8', '#88b0f8', '#b0d0f8']);
    for (const [cx, cy, w] of [[30, 8, 26], [120, 5, 34], [210, 10, 22], [280, 6, 30]]) { R(y, cx, cy, w, 4, '#ffffff'); R(y, cx + 4, cy - 3, w - 10, 3, '#ffffff'); R(y, cx + 2, cy + 4, w - 4, 1, '#d8e8f8'); }
    // runda gröna kullar med mörk kant
    for (let k = 0; k < 8; k++) {
      const hx = k * 40 + Math.floor(hash(k, 7) * 14), hr = 14 + Math.floor(hash(k, 8) * 10);
      for (let j = 0; j < hr; j++) { const hw = Math.round(Math.sqrt(hr * hr - (hr - j) * (hr - j)) * 1.3); R(y, hx - hw, HOR - hr + j, hw * 2, 1, j < 2 ? '#106010' : '#38a830'); P(y, hx - hw, HOR - hr + j, '#106010'); P(y, hx + hw - 1, HOR - hr + j, '#106010'); }
      R(y, hx - 6, HOR - hr + 5, 3, 2, '#68d050');
    }
    // buskraden längst bak
    for (let i = 0; i < 320; i += 6) { disc(y, i + 3, HOR - 3, 3, '#1c7a24'); P(y, i + 2, HOR - 5, '#40a848'); }
    R(y, 0, HOR - 1, 320, 1, '#105818');
  });
  const ox = Math.round(mod(th * F + 40, 320));
  x.drawImage(bak, -ox, 0); x.drawImage(bak, 320 - ox, 0);
  // golvet (Mode 7)
  if (!mkBild || mkBild.width !== W) mkBild = x.createImageData(W, H - HOR);
  const d = mkBild.data, regn = [12, 13, 14, 15, 16][Math.floor(t * 8) % 5];
  for (let y = HOR; y < H; y++) {
    const f = (CH * F) / (y - HOR + 0.5), langt = f > 140;
    for (let px = 0; px < W; px++) {
      const r = ((px + 0.5 - W / 2) * f) / F, c = MK_PAL[mkGolv(uc + r * cs + f * sn, vc - r * sn + f * cs, langt, regn)], i = ((y - HOR) * W + px) * 4;
      d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
    }
  }
  x.putImageData(mkBild, 0, HOR);
  // projektion världen → skärmen
  const proj = (u, v) => { const du = u - uc, dv = v - vc, f = du * sn + dv * cs, r = du * cs - dv * sn; return f > 1 ? { x: W / 2 + (r * F) / f, y: HOR + (CH * F) / f, s: F / f, f } : null; };
  const ritas = [];
  // rör vid sidan, mynt på vägen, rivalen
  for (const v0 of [60, 150, 330, 420, 590]) for (const sida of [-1, 1]) {
    const v = s - 14 + mod(v0 - (s - 14), L);
    const p = proj(mkMitt(v) + sida * (RW + 5 + (v0 % 3)), v); if (p) ritas.push({ f: p.f, rita: () => skala(x, sprDuk('mk-ror', MK_ROR, MK_ROR_PAL), p.x, p.y, (p.s * 2) / 14) });
  }
  const sv = mod(s, L);
  let tagna = 0;
  for (const mv of MK_MYNT) {
    if (mv <= sv) { tagna++; continue; }
    const p = proj(mkMitt(mv) + mkVav(mv), mv);
    if (p && p.f > 12.5) ritas.push({ f: p.f, rita: () => { const r = Math.max(1, Math.round(p.s * 0.55)); mynt(x, p.x, Math.round(p.y - r - p.s * 0.3), r, t * 6 + mv); } });
  }
  const vr = s + 26 + 12 * Math.sin((fas / PER) * Math.PI * 2), ur = mkMitt(vr) + 3.5 * Math.sin((fas / PER) * Math.PI * 4 + 1);
  const pr = proj(ur, vr);
  if (pr) ritas.push({ f: pr.f, rita: () => { R(x, pr.x - pr.s * 1.4, pr.y - 1, pr.s * 2.8, Math.max(1, pr.s * 0.25), 'rgba(0,0,0,0.3)'); skala(x, sprDuk('mk-luigi' + (Math.floor(t * 10) % 2), mkKart(0, Math.floor(t * 10) % 2), MK_LUIGI), pr.x, pr.y, (pr.s * 3.05) / 28); } });
  ritas.sort((a, b) => b.f - a.f).forEach((o) => o.rita());
  // svamp-turbo och stjärna enligt var på varvet vi är
  const turbo = sv > 330 && sv < 400, stjarna = sv > 560 && sv < 630;
  if (turbo) for (let i = 0; i < 10; i++) { const fy = mod(i * 23 + t * 260, H - HOR) + HOR, fx = i % 2 ? 4 + (i * 7) % 18 : W - 6 - (i * 5) % 18; R(x, fx, fy, 1, 6, '#ffffff'); }
  // spelarens kart
  const pk = proj(uk, s), kurva = mkRikt(s + 30) - th, lut = kurva > 0.05 ? 1 : kurva < -0.05 ? -1 : 0, hjul = Math.floor(t * 12) % 2;
  const kx = Math.round(pk.x), ky = Math.round(pk.y) + (Math.floor(t * 9) % 4 === 0 ? -1 : 0);
  R(x, kx - 12, Math.round(pk.y) - 1, 24, 2, 'rgba(0,0,0,0.35)');
  let pal = MK_MARCO;
  if (stjarna) { const c = ['#f8d818', '#f87818', '#e83088', '#30a0f8', '#30c050'][Math.floor(t * 14) % 5]; pal = { ...MK_MARCO, R: c, r: c, B: c }; }
  spr(x, mkKart(lut, hjul), kx - 14, ky - 18, pal);
  if (turbo) for (const s2 of [-1, 1]) { const fl = 3 + Math.floor(hash(Math.floor(t * 20), s2 + 2) * 4); R(x, kx + s2 * 5 - 1, ky - 3, 3, fl, '#f8d020'); R(x, kx + s2 * 5, ky - 3, 1, fl + 2, '#f87818'); }
  // HUD: varv och tid, föremålsrutan, mynt och placering
  const tid = fas * 3.4, sek = Math.floor(tid), hund = Math.floor((tid - sek) * 100);
  const tidS = `0'${String(sek).padStart(2, '0')}"${String(hund).padStart(2, '0')}`;
  TK(x, tidS, W - 4 - TW(tidS, SMALL), 3, '#f8f8f8', '#101010', SMALL);
  TK(x, 'VARV 3/5', 4, 3, '#f8f8f8', '#101010', SMALL);
  const BX = W / 2 - 11, BY = 2;
  R(x, BX, BY, 22, 18, '#f8f8f8'); R(x, BX + 1, BY + 1, 20, 16, '#3048a8'); R(x, BX + 2, BY + 2, 18, 14, '#101018');
  let sak = null;
  const rull = (a) => ['svamp', 'banan', 'skal', 'stjarna'][Math.floor(t * 14) % 4];
  if (sv > 202 && sv < 282) sak = rull(); else if (sv >= 282 && sv < 330) sak = 'svamp';
  else if (sv > 462 && sv < 542) sak = rull(); else if (sv >= 542 && sv < 560) sak = 'stjarna';
  if (sak) { const [rader, p] = MK_SAKER[sak]; spr(x, rader, BX + 5, BY + 3, p); }
  mynt(x, 8, H - 9, 4, 0.2);
  TK(x, '×' + String(2 + tagna).padStart(2, '0'), 15, H - 12, '#f8f8f8', '#101010', SMALL);
  TK(x, '2', W - 16, H - 19, '#f8d020', '#101010', BIG, 2);
}

// ======================================================================
// ---------- 1995 SEGO RALLY (Sega Rally Championship) ----------
// klassisk pseudo-3D-väg: rader i perspektiv, kurvan skjuter vägen i sidled; bilen sladdar på grus.
const SR = { W: 160, H: 120, HOR: 46, PER: 8, FART: 70, LOOP: 560 };
function srTall(y) {
  const g = '#1e6a2a', l = '#2e8a3a', m = '#164e20', b = '#5a3a1a';
  for (let j = 0; j < 5; j++) { const w = 4 + j * 3, Y = 2 + j * 6; for (let k = 0; k < 8; k++) { const hw = Math.round((w * (k + 1)) / 8); R(y, 10 - hw, Y + k, hw * 2, 1, k < 2 ? l : g); P(y, 10 - hw, Y + k, l); P(y, 10 + hw - 1, Y + k, m); } }
  R(y, 9, 34, 2, 6, b); R(y, 9, 34, 1, 6, '#7a5a2a');
}
function rallyBil(x, cx, by, a) {
  // a: −1…1 hur mycket bilens sida syns (bilen sladdar); bakdelen alltid mot kameran
  const sw = Math.round(Math.abs(a) * 16), rw = 34 - Math.round(Math.abs(a) * 6), dir = a >= 0 ? 1 : -1;
  const L = Math.round(cx - (rw + sw) / 2), xr = dir > 0 ? L : L + sw, yT = by - 19;
  const VIT = '#f0f0f4', VSK = '#c4c4d0', GLAS = '#24345a', NAVY = '#18286a', LJB = '#38a0e8', ROD = '#e02020';
  // sidan (längs bilen, stiger mot horisonten)
  for (let i = 0; i < sw; i++) {
    const X = dir > 0 ? xr + rw + i : xr - 1 - i, lyft = Math.round(i * 0.35);
    if (i < sw - 2) R(x, X, yT + 2 - lyft, 1, 4, i % 5 === 4 ? VIT : GLAS);
    R(x, X, yT + 6 - lyft, 1, 3, VIT); R(x, X, yT + 9 - lyft, 1, 1, NAVY); R(x, X, yT + 10 - lyft, 1, 1, LJB); R(x, X, yT + 11 - lyft, 1, 1, ROD);
    R(x, X, yT + 12 - lyft, 1, 3, VSK);
  }
  if (sw > 4) {
    const bak = dir > 0 ? xr + rw + 3 : xr - 4, fram = dir > 0 ? xr + rw + sw - 4 : xr - sw + 3;
    disc(x, bak, by - 3, 3, '#141418'); P(x, bak, by - 3, '#8a8a90');
    if (sw > 10) { const ly = Math.round((sw - 4) * 0.35); disc(x, fram, by - 3 - ly, 3, '#141418'); P(x, fram, by - 3 - ly, '#8a8a90'); }
  }
  // bakdelen: vinge, bakruta, baklucka med Martini-ränder, lampor, nummerplåt
  R(x, xr + 2, yT, rw - 4, 1, VIT); R(x, xr + 2, yT + 1, rw - 4, 1, VSK);
  R(x, xr + 4, yT + 2, rw - 8, 4, VIT); R(x, xr + 7, yT + 2, rw - 14, 4, GLAS); R(x, xr + 8, yT + 2, 4, 1, '#6a88b8');
  R(x, xr + 1, yT + 6, rw - 2, 3, VIT); R(x, xr, yT + 7, rw, 2, VIT);
  R(x, xr, yT + 9, rw, 1, NAVY); R(x, xr, yT + 10, rw, 1, LJB); R(x, xr, yT + 11, rw, 1, ROD);
  for (const lx of [xr + 1, xr + rw - 5]) { R(x, lx, yT + 7, 4, 2, '#f03030'); R(x, lx, yT + 7, 4, 1, '#ff9090'); }
  R(x, xr, yT + 12, rw, 2, VSK); R(x, xr + Math.round(rw / 2) - 5, yT + 12, 10, 3, '#f8f0a0'); R(x, xr + Math.round(rw / 2) - 3, yT + 13, 6, 1, '#404040');
  R(x, xr, yT + 14, rw, 2, '#202024');
  for (const hx of [xr - 1, xr + rw - 3]) { R(x, hx, yT + 13, 4, 6, '#141418'); R(x, hx + 1, yT + 14, 2, 1, '#4a4a50'); }
  R(x, xr + 3, yT + 15, 3, 4, '#0c0c0e'); R(x, xr + rw - 6, yT + 15, 3, 4, '#0c0c0e');
  P(x, xr + 8, yT + 16, '#9a9aa0'); P(x, xr + 9, yT + 16, '#5a5a60');
}
function segoRally(x, t) {
  const { W, H, HOR, PER, FART, LOOP } = SR, fas = mod(t, PER), s = fas * FART;
  const bend = Math.sin((fas / PER) * Math.PI * 2), sladd = Math.sin((fas / PER) * Math.PI * 2 - 0.6);
  const lat = -0.18 * bend;                                                    // bilen skär kurvan
  // himmel, berg och skogsbryn (skjuts i sidled av kurvan)
  const bak = fast('b-sr-bak', 260, HOR, (y) => {
    toning(y, 0, 0, 260, HOR, ['#2e6ad8', '#4a86e8', '#78aaf0', '#a8ccf4']);
    for (const [cx, cy, w] of [[20, 8, 30], [100, 4, 40], [190, 10, 26]]) { R(y, cx, cy, w, 4, '#ffffff'); R(y, cx + 5, cy - 3, w - 12, 3, '#ffffff'); R(y, cx, cy + 4, w, 1, '#d8e4f4'); }
    for (let i = 0; i < 260; i++) { const h = 10 + Math.round(Math.sin(i / 17) * 5 + Math.sin(i / 7 + 1) * 2); R(y, i, HOR - h, 1, h, '#7888b0'); if (h > 13) R(y, i, HOR - h, 1, 2, '#e8ecf8'); }
    for (let i = 0; i < 260; i += 3) { const h = 4 + Math.floor(hash(i, 3) * 4); R(y, i, HOR - h, 3, h, '#1a5a2a'); P(y, i + 1, HOR - h - 1, '#1a5a2a'); }
  });
  const ox = Math.round(mod(-bend * 26 + 60, 260));
  x.drawImage(bak, -ox, 0); x.drawImage(bak, 260 - ox, 0);
  // vägen rad för rad
  const cxs = (p) => W / 2 + bend * 70 * (1 - p) * (1 - p) - lat * 62 * p, hw = (p) => 62 * p;
  for (let y = HOR; y < H; y++) {
    const p = (y - HOR + 1) / (H - HOR), z = 1 / p, w = s + z * 30, rand = Math.floor(w / 14) & 1;
    const c = cxs(p), b = hw(p), v = b * 1.22;
    R(x, 0, y, W, 1, rand ? '#4a8a30' : '#3e7c28');
    R(x, c - v * 1.6, y, v * 3.2, 1, rand ? '#5c9c3a' : '#4e8e32');
    R(x, c - v, y, v * 2, 1, rand ? '#b89060' : '#a88050');                    // grusvallen
    R(x, c - b, y, b * 2, 1, rand ? '#d0a870' : '#c49c64');                    // grusvägen
    for (const sp of [-0.42, 0.42]) R(x, c + sp * b - b * 0.07, y, Math.max(1, b * 0.14), 1, rand ? '#b08858' : '#a47c4c');   // hjulspåren
    const wi = Math.floor(w * 1.5);
    for (let k = 0; k < 4; k++) { const h = hash(wi, k); P(x, c - b + h * b * 2, y, k % 2 ? '#e8c890' : '#8a6a40'); }
  }
  // träd och checkpoint-portalen sorterade på djup
  const ritas = [];
  for (let i = 0; i < 20; i++) for (const sida of [-1, 1]) {
    const wr = mod(i * 28 + (sida > 0 ? 14 : 0) - s, LOOP), z = wr / 30 + 0.35; if (z < 0.6) continue;
    const p = 1 / z; if (p < 0.035 || p > 1.6) continue;
    const lx = sida * (1.45 + hash(i, sida + 5) * 0.9);
    ritas.push({ z, rita: () => skala(x, fast('b-sr-tall', 20, 40, srTall), cxs(p) + lx * hw(p), HOR + p * (H - HOR), p * 2.6) });
  }
  const zc = mod(280 - s, LOOP) / 30 + 0.35;
  if (zc > 0.6) {
    const p = 1 / zc, gy = HOR + p * (H - HOR), c = cxs(p), b = hw(p) * 1.25, topp = gy - p * 70;
    ritas.push({ z: zc, rita: () => {
      for (const sida of [-1, 1]) R(x, c + sida * b - Math.max(1, p * 3) / 2, topp, Math.max(1, p * 3), gy - topp, '#d8d8d8');
      const ban = fast('b-sr-ban', 72, 13, (y) => { R(y, 0, 0, 72, 13, '#d81818'); R(y, 0, 0, 72, 1, '#ff6060'); R(y, 0, 12, 72, 1, '#900808'); T(y, 'CHECK POINT', 3, 3, '#ffffff', BIG); });
      x.drawImage(ban, Math.round(c - b), Math.round(topp), Math.max(2, Math.round(b * 2)), Math.max(1, Math.round(p * 16)));
    } });
  }
  ritas.sort((a, b) => b.z - a.z).forEach((o) => o.rita());
  // bilen och dammet
  const bx = W / 2 + Math.round(sladd * 5), by = H - 8 + (Math.floor(t * 15) % 3 === 0 ? -1 : 0), vinkel = sladd * 0.9;
  for (let k = 0; k < 16; k++) {
    const liv = mod(t * 1.4 + k / 16, 1), sida = k % 2 ? 1 : -1;
    const px = bx + sida * 14 - vinkel * liv * 34 + sida * liv * 8 + (hash(k, 1) - 0.5) * 12 * liv, py = by - 1 - liv * 16 + hash(k, 2) * 3;
    disc(x, Math.round(px), Math.round(py), Math.round(2 + liv * 6), `rgba(222,190,138,${(0.6 * (1 - liv)).toFixed(2)})`);
  }
  R(x, bx - 17, by, 34, 2, 'rgba(40,24,8,0.35)');
  rallyBil(x, bx, by, vinkel);
  // HUD: TIME mitt upptill, position, varvräknare och fartmätare
  const tid = Math.ceil(40 - fas + (fas > 4 ? 8 : 0));
  TS(x, 'TIME', W / 2 - TW('TIME') / 2, 2, '#f8f8f8');
  const ts = String(tid), tw = TW(ts, BIG, 2);
  TK(x, ts, W / 2 - tw / 2, 9, '#f8d000', '#401800', BIG, 2);
  TS(x, 'POS', 4, 3, '#f8f8f8'); TK(x, '3', 18, 3, '#f8d000', '#401800', BIG);
  TS(x, '/15', 25, 5, '#f8f8f8');
  TS(x, 'LAP 1/3', W - 4 - TW('LAP 1/3'), 3, '#f8f8f8');
  if (fas > 4 && fas < 5.3 && Math.floor(fas * 6) % 2 === 0) { const c = 'CHECK POINT!', cw = TW(c, BIG); TK(x, c, W / 2 - cw / 2, 40, '#f8f8f8', '#c01010', BIG); TS(x, 'EXTENDED TIME', W / 2 - TW('EXTENDED TIME') / 2, 50, '#f8d000'); }
  // fartmätaren: halvcirkel med visare och siffror
  const MX = W - 20, MY = H - 4, varv = 0.55 + Math.sin(t * 2.3) * 0.2 + Math.abs(sladd) * 0.15;
  for (let a = 0; a <= 20; a++) { const v = Math.PI + (a / 20) * Math.PI; P(x, MX + Math.cos(v) * 15, MY + Math.sin(v) * 15, a > 16 ? '#f03030' : '#f8f8f8'); if (a % 5 === 0) P(x, MX + Math.cos(v) * 13, MY + Math.sin(v) * 13, '#f8f8f8'); }
  const nv = Math.PI + varv * Math.PI; for (let i = 0; i < 13; i++) P(x, MX + Math.cos(nv) * i, MY + Math.sin(nv) * i, '#f8a000');
  const fart = String(118 + Math.round(Math.sin(t * 1.7) * 14 + Math.abs(bend) * 10));
  TS(x, fart, MX - 30 - TW(fart), H - 12, '#f8f8f8'); TS(x, 'KM/H', MX - 30 - TW('KM/H'), H - 6, '#a8c8f8');
}

// ======================================================================
// ---------- 1996 CRASH BANDIKUT (Crash Bandicoot) ----------
// djungelstigen i pseudo-3D: Crash springer mot kameran, lådor och frukt kommer underifrån och glider bort mot honom.
const CB = { W: 160, H: 120, HOR: 40, PER: 6, VZ: 2.1, ZC: 1 / 0.6 };
const CB_SAKER = [
  { typ: 'fraga', tid: 1.4, lat: -0.42 }, { typ: 'frukt', tid: 2.25, lat: 0 }, { typ: 'frukt', tid: 2.45, lat: 0.04 }, { typ: 'frukt', tid: 2.65, lat: 0.08 },
  { typ: 'lada', tid: 3.7, lat: 0.42 }, { typ: 'frukt', tid: 4.6, lat: 0.22 }, { typ: 'frukt', tid: 4.8, lat: 0.16 }, { typ: 'frukt', tid: 5.0, lat: 0.1 },
];
const CB_FRUKT = ['...gg...', '..RRRR..', '.RYYRRR.', 'RYYRRRRr', 'RYRRRRRr', 'RRRRRRrr', '.RRRRrr.', '..rrrr..'];
const CB_FRUKT_PAL = { R: '#f05018', Y: '#f8b830', r: '#a02810', g: '#3a7020' };
function cbLada(y, fraga) {
  const kant = '#5a2c10', ljus = fraga ? '#c07830' : '#e8a858', mork = fraga ? '#8a4c18' : '#b87830';
  R(y, 0, 0, 16, 16, kant); R(y, 1, 1, 14, 14, ljus); R(y, 3, 3, 10, 10, mork);
  for (const i of [5, 8, 11]) R(y, i, 3, 1, 10, fraga ? '#7a4010' : '#a06828');
  R(y, 1, 1, 14, 1, '#f8d098'); R(y, 1, 1, 1, 14, '#f8d098');
  for (const [a, b] of [[2, 2], [13, 2], [2, 13], [13, 13]]) P(y, a, b, '#3a1a08');
  if (fraga) { T(y, '?', 6, 4, '#3a1a08', BIG); T(y, '?', 5, 4, '#f8e8a0', BIG); }
}
// Crash framifrån: springer mot kameran (steg 0–1), eller snurrar
function crash(x, cx, fy, t, snurr) {
  const OR = '#f07a18', ORM = '#c05410', TAN = '#f8cc88', JE = '#3458c0', JEM = '#22388a', SKO = '#d82828', HAND = '#8a4a20';
  const steg = (t * 3.4) % 1, sv = Math.sin(steg * Math.PI * 2), studs = Math.round(Math.abs(Math.cos(steg * Math.PI * 2)) * 2);
  const hy = fy - 34 - studs;
  if (snurr) {
    // virvelvinden: band i hans färger som roterar
    for (let j = 0; j < 30; j++) {
      const bw = Math.round(9 + Math.sin((j / 30) * Math.PI) * 7), Y = fy - 30 + j;
      for (let i = -bw; i < bw; i++) {
        const v = mod(i / bw + t * 9 + j * 0.05, 1);
        P(x, cx + i, Y, j > 24 ? (v < 0.5 ? SKO : '#f8f8f8') : j > 15 ? (v < 0.6 ? JE : JEM) : v < 0.5 ? OR : v < 0.75 ? TAN : ORM);
      }
    }
    for (const s of [-1, 1]) for (let j = 0; j < 4; j++) R(x, cx + s * (18 + j * 2), fy - 24 + j * 6, 1, 4, '#f8f8f8');
    for (let i = 0; i < 3; i++) R(x, cx - 3 + i * 2 + Math.round(Math.sin(t * 40 + i) * 3), fy - 34 + i, 2, 4, '#7a2a08');
    return;
  }
  // ben: det ena kommer mot kameran (större, lägre), det andra bakåt
  for (const s of [-1, 1]) {
    const fram = s * sv > 0, lx = cx + s * 4, ly = fy - 13;
    const fot = fram ? fy + 1 : fy - 5;
    R(x, lx - 2, ly, 4, fot - ly - 2, s * sv > 0 ? JE : JEM);
    const fw = fram ? 7 : 5;
    R(x, lx - fw / 2, fot - 3, fw, 3, SKO); R(x, lx - fw / 2, fot - 1, fw, 1, '#f8f8f8'); P(x, lx, fot - 3, '#f8f8f8');
  }
  // byxorna och kroppen
  R(x, cx - 6, fy - 17, 12, 5, JE); R(x, cx - 6, fy - 17, 12, 1, JEM);
  R(x, cx - 5, fy - 26, 10, 9, OR); R(x, cx + 2, fy - 26, 3, 9, ORM); R(x, cx - 3, fy - 24, 5, 5, TAN);
  // armar som pendlar
  for (const s of [-1, 1]) {
    const fram = s * sv < 0, ax = cx + s * 6, ay = fy - 25;
    const hx = ax + s * (fram ? 3 : 2), hyy = fram ? fy - 15 : fy - 22;
    for (let i = 0; i <= 4; i++) R(x, ax + ((hx - ax) * i) / 4 - 1, ay + ((hyy - ay) * i) / 4, 2, 2, OR);
    disc(x, hx, hyy + 1, fram ? 3 : 2, HAND);
  }
  // huvudet: öron, hårtofs, ansikte med nos, ögon och flin
  for (const s of [-1, 1]) { for (let i = 0; i < 5; i++) R(x, cx + s * (6 + i) - (s < 0 ? 1 : 0), hy + 3 - i, 2, 3, i > 3 ? ORM : OR); }
  for (const [dx, h] of [[-2, 4], [0, 6], [2, 4]]) R(x, cx + dx, hy - h + 1, 2, h, ORM);
  disc(x, cx, hy + 6, 7, OR); R(x, cx + 3, hy + 2, 3, 8, ORM);
  disc(x, cx, hy + 10, 5, TAN); R(x, cx - 5, hy + 9, 11, 4, TAN);
  for (const s of [-1, 1]) { R(x, cx + s * 3 - 2, hy + 2, 4, 5, '#f8f8f8'); R(x, cx + s * 3 - (s < 0 ? 0 : 1), hy + 3, 2, 3, '#2a9a3a'); P(x, cx + s * 3 - (s < 0 ? 0 : 1), hy + 4, '#101010'); R(x, cx + s * 3 - 2, hy + 1, 4, 1, '#3a1a08'); }
  R(x, cx - 1, hy + 7, 3, 2, '#101010');
  R(x, cx - 4, hy + 10, 9, 3, '#5a1008'); R(x, cx - 3, hy + 10, 7, 1, '#f8f8f8'); P(x, cx - 5, hy + 9, '#5a1008'); P(x, cx + 5, hy + 9, '#5a1008');
}
function cbVaxt(y, typ) {
  if (typ === 0) {        // stor ormbunke
    for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.42; for (let i = 0; i < 16; i++) { const X = 16 + Math.cos(a) * i * 1.1, Y = 30 + Math.sin(a) * i * 1.4 + (i * i) / 30; R(y, X - 1, Y, i < 12 ? 3 : 2, 2, k % 2 ? '#2a8a2a' : '#3aa83a'); P(y, X, Y, '#70d050'); } }
  } else if (typ === 1) { // palm
    for (let j = 0; j < 40; j++) R(y, 15 + Math.round(Math.sin(j / 12) * 2), 59 - j, 3, 1, j % 4 ? '#8a6030' : '#6a4420');
    for (let k = 0; k < 6; k++) { const a = Math.PI + (k / 5) * Math.PI; for (let i = 0; i < 14; i++) R(y, 16 + Math.cos(a) * i, 20 + Math.sin(a) * i * 0.5 + (i * i) / 18, 2, 2, k % 2 ? '#1e7a2a' : '#2e9a36'); }
  } else {                // totem i sten
    R(y, 8, 14, 16, 26, '#7a7a6a'); R(y, 8, 14, 3, 26, '#9a9a88'); R(y, 21, 14, 3, 26, '#5a5a4e');
    R(y, 11, 18, 4, 4, '#2a2a22'); R(y, 17, 18, 4, 4, '#2a2a22'); R(y, 12, 28, 8, 5, '#2a2a22'); R(y, 13, 29, 6, 1, '#d8d8c0');
    R(y, 6, 10, 20, 4, '#3a8a2a'); R(y, 10, 8, 12, 2, '#4aa83a');
  }
}
function crashBandikut(x, t) {
  const { W, H, HOR, PER, VZ, ZC } = CB, fas = mod(t, PER);
  const sving = Math.sin((fas / PER) * Math.PI * 2);
  const cxs = (p) => W / 2 + sving * 22 * (1 - Math.min(1, p)) * (1 - Math.min(1, p)), hw = (p) => p * 54;
  // djungeln bakom: himmelsglipor, kronor och stammar
  const BW = W + 12, bak = fast('b-cb-bak', BW, HOR + 6, (y) => {
    toning(y, 0, 0, BW, HOR + 6, ['#a8e0f8', '#c8f0f8', '#e8f8e0']);
    for (let i = 0; i < 28; i++) { const X = hash(i, 1) * BW, r = 6 + hash(i, 2) * 10, Y = hash(i, 3) * 20; disc(y, X, Y, r, i % 3 ? '#1a6a2a' : '#0e4a1e'); }
    for (let i = 0; i < 10; i++) { const X = 8 + i * 18 + hash(i, 4) * 6; R(y, X, 10, 3, HOR, '#4a3a20'); R(y, X, 10, 1, HOR, '#6a5430'); }
    for (let i = 0; i < 44; i++) { const X = hash(i, 5) * BW, r = 4 + hash(i, 6) * 6; disc(y, X, HOR - 2 + hash(i, 7) * 6, r, i % 2 ? '#2a8a2a' : '#1e7020'); }
    for (let i = 0; i < 30; i++) P(y, hash(i, 8) * BW, HOR - 4 + hash(i, 9) * 8, '#7ad060');
  });
  x.drawImage(bak, Math.round(sving * 5) - 6, 0);
  // marken rad för rad: snår, kantstenar och stigen
  for (let y = HOR + 4; y < H; y++) {
    const p = (y - HOR) / (H - HOR), z = 1 / p, w = z * 10 + fas * VZ * 10, rand = Math.floor(w / 3) & 1, c = cxs(p), b = hw(p);
    R(x, 0, y, W, 1, rand ? '#2a7a24' : '#24701e');
    R(x, c - b * 1.25, y, b * 2.5, 1, rand ? '#8a8a78' : '#7a7a6a');
    R(x, c - b, y, b * 2, 1, rand ? '#c89458' : '#bc884c');
    const wi = Math.floor(w * 2);
    for (let k = 0; k < 3; k++) P(x, c - b + hash(wi, k) * b * 2, y, k ? '#a87040' : '#e0b070');
  }
  // allt på stigen (lådor, frukt) och vid sidan (växter) sorterat på djup
  const ritas = [], djup = (tid) => { const dt = mod(fas - tid + PER / 2, PER) - PER / 2; return { dt, z: ZC + dt * VZ }; };
  for (let j = 0; j < 12; j++) for (const sida of [-1, 1]) {
    const { z } = djup(j * 0.5 + (sida > 0 ? 0.25 : 0)); if (z < 0.55) continue;
    const p = 1 / z, typ = (j + (sida > 0 ? 1 : 0)) % 3, lx = sida * (1.5 + hash(j, sida + 3) * 0.5);
    ritas.push({ z, rita: () => skala(x, fast('b-cb-vaxt' + typ, 32, typ === 1 ? 60 : 40, (y) => cbVaxt(y, typ)), cxs(p) + lx * hw(p), HOR + p * (H - HOR), p * (typ === 1 ? 2.4 : 1.7)) });
  }
  let frukter = 0, snurr = false;
  const crashLat = (() => { let l = 0; for (const o of CB_SAKER) if (o.typ !== 'frukt') { const dt = fas - o.tid; l += o.lat * Math.max(0, 1 - Math.abs(dt + 0.1) / 0.6); } return Math.max(-0.45, Math.min(0.45, l * 1.4)); })();
  const pc = 1 / ZC, crashX = Math.round(cxs(pc) + crashLat * hw(pc)), crashY = Math.round(HOR + pc * (H - HOR));
  for (const o of CB_SAKER) {
    const { dt, z } = djup(o.tid);
    if (o.typ === 'frukt') {
      if (dt >= 0 && dt < PER / 2) { frukter++; if (dt < 0.35) { const k = dt / 0.35; ritas.push({ z: 0, rita: () => spr(x, CB_FRUKT, Math.round(crashX + (8 - crashX) * k), Math.round(crashY - 30 + (4 - crashY + 30) * k), CB_FRUKT_PAL) }); } continue; }
      if (z < 0.55) continue;
      const p = 1 / z;
      ritas.push({ z, rita: () => skala(x, sprDuk('cb-frukt', CB_FRUKT, CB_FRUKT_PAL), cxs(p) + o.lat * hw(p), HOR + p * (H - HOR) - p * 22 + Math.sin(t * 5 + o.tid) * 1.5 * p, p * 1.5) });
      continue;
    }
    if (dt > -0.14 && dt < 0.3) snurr = true;
    if (dt < 0) {
      if (z < 0.55) continue;
      const p = 1 / z;
      ritas.push({ z, rita: () => skala(x, fast('b-cb-lada' + o.typ, 16, 16, (y) => cbLada(y, o.typ === 'fraga')), cxs(p) + o.lat * hw(p), HOR + p * (H - HOR), p * 1.7) });
    } else if (dt < 0.7) {
      // lådan går sönder: brädor flyger och en frukt studsar upp ur frågelådan
      const lx = cxs(pc) + o.lat * hw(pc), ly = crashY - 8;
      ritas.push({ z: ZC - 0.01, rita: () => {
        for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2 + 0.3, v = 30 + hash(i, 9) * 20, bx = lx + Math.cos(a) * v * dt, by = ly + Math.sin(a) * v * dt * 0.6 - 30 * dt + 90 * dt * dt; R(x, bx, by, i % 2 ? 4 : 2, i % 2 ? 2 : 4, i % 3 ? '#e8a858' : '#8a4c18'); }
        if (o.typ === 'fraga' && dt < 0.5) spr(x, CB_FRUKT, Math.round(lx - 4), Math.round(ly - 6 - dt * 40), CB_FRUKT_PAL);
      } });
      if (o.typ === 'fraga' && dt > 0.25) frukter++;
    } else if (o.typ === 'fraga') frukter++;
  }
  ritas.push({ z: ZC, rita: () => { R(x, crashX - 8, crashY - 1, 16, 2, 'rgba(0,0,0,0.25)'); crash(x, crashX, crashY, t, snurr); } });
  ritas.sort((a, b) => b.z - a.z).forEach((o) => o.rita());
  // HUD: frukter uppe till vänster, liv uppe till höger
  spr(x, CB_FRUKT, 4, 3, CB_FRUKT_PAL);
  TK(x, String(12 + frukter), 15, 3, '#f8e070', '#5a2008', BIG);
  disc(x, W - 22, 8, 5, '#f07a18'); R(x, W - 25, 9, 7, 3, '#f8cc88'); R(x, W - 25, 6, 2, 2, '#f8f8f8'); R(x, W - 21, 6, 2, 2, '#f8f8f8'); R(x, W - 24, 11, 5, 1, '#5a1008');
  TK(x, '4', W - 12, 3, '#f8e070', '#5a2008', BIG);
}

// ======================================================================
// ---------- 1996 SUPER MARCO 64 (Super Mario 64) ----------
// slottet med rött tak och glasmålningen, vallgraven och bron; rörmokaren trippelhoppar, stjärnan svävar.
const M64_MARCO = {
  spring: [
    ['.....RRRRR......', '....RRRRRRRRR...', '....RRRRRWWRRR..', '...rrrrrrrrrrrr.', '...HHHSSSKS.....', '..HHSHSSSKSSS...', '..HHSSSSSSSNNN..', '...HSSSSSMMMMM..', '....SSSSSSSS....', '....RRRBRRR.....', '...RRRBBBRRRWW..', '..WWRBBYBBRRWW..', '..WWRBBBBBB.....', '....BBBBBBB.....', '....BBBbBBBB....', '...BBBb..bBBB...', '..BBBb....bBBO..', '.OOOO......OOOO.', '.OOOO......OOO..'],
    ['.....RRRRR......', '....RRRRRRRRR...', '....RRRRRWWRRR..', '...rrrrrrrrrrrr.', '...HHHSSSKS.....', '..HHSHSSSKSSS...', '..HHSSSSSSSNNN..', '...HSSSSSMMMMM..', '....SSSSSSSS....', '....RRRBRRR.....', '...RRRBBBRRR....', '...RRBBYBBRWW...', '...WWBBBBBBWW...', '...WWBBBBBB.....', '....BBBBBBB.....', '....BBBbBBB.....', '.....BBBBBB.....', '.....OOOOOO.....', '....OOOO.OOO....'],
  ],
  hopp: ['.WW.............', '.WWRRRRR........', '..RRRRRRRRR.....', '..RRRRRRRWWRR...', '..rrrrrrrrrrrr..', '..RHHSSSKS......', '..RHSHSSKSSS....', '...HSSSSSSSNNN..', '...HSSSSSMMMMM..', '....SSSSSSSS....', '....RRBBRR......', '....RBBYBBRRWW..', '....BBBBBBRRWW..', '....BBBBBBB.....', '...BBBB.BBBB....', '..BBBb...bBBB...', '.OOOO.....OOOO..', '.OOO.......OOO..'],
  pal: { R: '#e02020', r: '#a01010', W: '#f8f8f8', H: '#6a3010', S: '#f8b888', K: '#203090', N: '#e89070', M: '#202020', B: '#2850e0', b: '#1a38a8', Y: '#f8e040', O: '#7a3a10' },
};
function m64Stjarna(x, cx, cy, r, v) {
  const b = Math.cos(v), sk = Math.max(0.12, Math.abs(b)), pts = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; pts.push([cx + Math.cos(a) * rr * sk, cy + Math.sin(a) * rr]); }
  poly(x, pts, '#f8c818');
  poly(x, pts.map(([px, py]) => [cx + (px - cx) * 0.6, cy + (py - cy) * 0.6 - 1]), '#fce860');
  if (b > 0.35) { R(x, cx - Math.round(2 * sk) - 1, cy - 2, 1, 3, '#101010'); R(x, cx + Math.round(2 * sk), cy - 2, 1, 3, '#101010'); }
}
function m64Slott(y) {
  const W = 160;
  toning(y, 0, 0, W, 62, ['#3a78e8', '#5890f0', '#80b0f8', '#b0d4f8']);
  // låga berg och kullar längst bak (platta ytor)
  poly(y, [[0, 58], [18, 40], [40, 56]], '#6aa848'); poly(y, [[18, 40], [40, 56], [26, 58]], '#4e8a38');
  poly(y, [[110, 58], [140, 36], [160, 50], [160, 60]], '#6aa848'); poly(y, [[140, 36], [160, 50], [160, 60], [146, 60]], '#4e8a38');
  poly(y, [[34, 60], [60, 46], [100, 46], [126, 60]], '#5a9a40');
  // slottets huvudbyggnad
  const VAGG = '#f0e4c0', VSK = '#d0c098', VMK = '#b0a078', TAK = '#e02818', TSK = '#a81810';
  R(y, 44, 34, 72, 32, VAGG); R(y, 98, 34, 18, 32, VSK); R(y, 44, 64, 72, 2, VMK);
  for (let i = 44; i < 116; i += 6) R(y, i, 31, 4, 3, i >= 98 ? VSK : VAGG);
  // sidotornen (tre fasetter) med koniska tak
  const torn = (X, w, top, bot) => {
    const f = w / 3; R(y, X, top, f, bot - top, VAGG); R(y, X + f, top, f, bot - top, VSK); R(y, X + 2 * f, top, w - 2 * f, bot - top, VMK);
    poly(y, [[X - 2, top], [X + w / 2, top - w * 1.3], [X + w / 2, top]], TAK); poly(y, [[X + w / 2, top], [X + w / 2, top - w * 1.3], [X + w + 2, top]], TSK);
    R(y, X + w / 2 - 1, top + 6, 2, 4, '#3a2a40');
  };
  torn(32, 12, 30, 66); torn(116, 12, 30, 66); torn(50, 10, 22, 34); torn(100, 10, 22, 34);
  // mittornet med högt tak och flagga
  R(y, 68, 14, 24, 20, VAGG); R(y, 84, 14, 8, 20, VSK); for (let i = 68; i < 92; i += 5) R(y, i, 12, 3, 2, VAGG);
  poly(y, [[64, 12], [80, -2], [80, 12]], TAK); poly(y, [[80, -2], [96, 12], [80, 12]], TSK);
  R(y, 79, 18, 3, 6, '#3a2a40'); R(y, 73, 20, 2, 4, '#3a2a40'); R(y, 86, 20, 2, 4, '#3a2a40');
  // glasmålningen ovanför porten: rund, färgglad (prinsessan i rosa och gult)
  for (let j = -7; j <= 7; j++) for (let i = -7; i <= 7; i++) {
    const d2 = i * i + j * j; if (d2 > 52) continue;
    let f = d2 > 38 ? '#f8f0d0' : '#4a3a9a';
    if (d2 <= 38) { const a = Math.atan2(j, i); f = ['#f070b0', '#f8d040', '#60b0f0', '#f070b0', '#78d060', '#f8d040'][Math.floor((a + Math.PI) / (Math.PI / 3)) % 6]; }
    if (d2 <= 10) f = j < 0 ? '#f8d040' : '#f8c0a0';
    if (d2 <= 38 && (i === 0 || j === 0)) f = '#3a2a5a';
    P(y, 80 + i, 44 + j, f);
  }
  // porten
  R(y, 74, 54, 12, 12, '#5a3418'); disc(y, 80, 55, 6, '#5a3418'); R(y, 75, 56, 10, 10, '#7a4a20'); R(y, 79, 52, 2, 14, '#5a3418');
  for (const wx of [56, 102]) { R(y, wx, 46, 4, 6, '#3a2a40'); disc(y, wx + 2, 46, 2, '#3a2a40'); }
  // vallgraven och gräset
  R(y, 0, 66, W, 10, '#2858d0'); R(y, 0, 66, W, 1, '#1838a0');
  R(y, 0, 76, W, 44, '#48b030');
  for (const [a, b, c, f] of [[[0, 76], [40, 76], [0, 100], '#58c038'], [[40, 76], [70, 120], [0, 120], '#40a028'], [[120, 76], [160, 76], [160, 110], '#58c038'], [[90, 120], [160, 110], [160, 120], '#3c9a26'], [[60, 90], [110, 96], [80, 120], '#50b834']]) poly(y, [a, b, c], f);
  // bron: plankor i perspektiv med räcken
  poly(y, [[73, 66], [87, 66], [96, 84], [64, 84]], '#c88848');
  for (let j = 66; j < 84; j += 3) { const p = (j - 66) / 18, l = 73 - p * 9, r = 87 + p * 9; R(y, l, j, r - l, 1, '#9a6030'); }
  poly(y, [[72, 66], [74, 66], [65, 84], [62, 84]], '#7a4a20'); poly(y, [[86, 66], [88, 66], [98, 84], [95, 84]], '#7a4a20');
  // runda träd (ljus sida mot vänster)
  for (const [tx, ty, r] of [[14, 92, 9], [146, 88, 8]]) {
    R(y, tx - 1, ty, 3, 14, '#6a4020'); disc(y, tx, ty - 4, r, '#2a8a2a'); disc(y, tx - 2, ty - 6, r - 3, '#3aa83a'); disc(y, tx - 3, ty - 8, r - 6, '#58c848');
  }
}
function marco64(x, t) {
  const W = 160, H = 120, PER = 6, fas = mod(t, PER);
  x.drawImage(fast('b-m64', W, H, m64Slott), 0, 0);
  // moln som driver och vattnet som glittrar
  for (const [cx, cy, w] of [[20, 10, 26], [96, 18, 30], [150, 6, 22]]) { const X = mod(cx + t * 3, W + 40) - 30; poly(x, [[X, cy + 4], [X + 6, cy - 2], [X + w - 6, cy - 3], [X + w, cy + 4]], '#ffffff'); R(x, X + 2, cy + 4, w - 4, 1, '#d8e8f8'); }
  for (let i = 0; i < 12; i++) { const X = mod(i * 29 + t * 8, W), Y = 68 + (i * 3) % 7; if (X > 70 && X < 90) continue; R(x, X, Y, 4 + (i % 3), 1, Math.floor(t * 3 + i) % 2 ? '#80b0f8' : '#4878e0'); }
  // mynt i en båge vid vänstra tornet
  for (let i = 0; i < 4; i++) mynt(x, 30 + i * 8, 80 - Math.round(Math.sin(i * 0.9) * 3), 3, t * 5 + i * 0.6, '#fff8a0', '#f8d020', '#c89810');
  // stjärnan svävar och snurrar med gnistor
  const sx = 128, sy = 62 + Math.round(Math.sin(t * 2.2) * 2);
  m64Stjarna(x, sx, sy, 9, t * 2.4);
  for (let i = 0; i < 4; i++) { const a = t * 2 + (i * Math.PI) / 2, rr = 12 + Math.sin(t * 5 + i) * 2; if (Math.floor(t * 6 + i) % 3) P(x, sx + Math.cos(a) * rr, sy + Math.sin(a) * rr * 0.7, '#fffff0'); }
  // rörmokaren springer in från vänster och trippelhoppar
  const mx = -20 + (fas / PER) * 200, mark = 106;
  let hojd = 0, flip = 0, iLuften = false;
  for (const [a, b, h] of [[0.2, 0.33, 10], [0.36, 0.52, 18], [0.55, 0.8, 34]]) { const f = fas / PER; if (f > a && f < b) { const k = (f - a) / (b - a); hojd = Math.sin(k * Math.PI) * h; iLuften = true; if (h > 30) flip = k; } }
  const my = Math.round(mark - hojd);
  R(x, Math.round(mx) - 5, mark - 1, 10, 2, 'rgba(0,40,0,0.35)');
  const rader = iLuften ? M64_MARCO.hopp : M64_MARCO.spring[Math.floor(t * 10) % 2];
  if (flip > 0.1 && flip < 0.9) {
    const duk = sprDuk('m64-hopp', M64_MARCO.hopp, M64_MARCO.pal);
    x.save(); x.translate(Math.round(mx), my - 9); x.rotate(flip * Math.PI * 2); x.drawImage(duk, -8, -9); x.restore();
  } else spr(x, rader, Math.round(mx) - 8, my - rader.length, M64_MARCO.pal);
  if (flip > 0.25 && flip < 0.75) { TK(x, 'YAHOO!', Math.round(mx) - 14, my - 34, '#f8f8f8', '#c01818', SMALL); }
  // HUD: liv, mynt och stjärnor
  disc(x, 9, 8, 4, '#f8b888'); R(x, 5, 3, 9, 3, '#e02020'); R(x, 7, 9, 5, 1, '#202020');
  TK(x, '×4', 16, 4, '#f8f8f8', '#202020', BIG);
  mynt(x, 64, 8, 4, 0.3, '#fff8a0', '#f8d020', '#c89810'); TK(x, '×12', 71, 4, '#f8f8f8', '#202020', BIG);
  T(x, '★', 116, 4, '#202020', BIG); T(x, '★', 117, 5, '#202020', BIG); T(x, '★', 116, 4, '#f8d020', BIG);
  TK(x, '×7', 124, 4, '#f8f8f8', '#202020', BIG);
}

// ======================================================================
// ---------- 1998 FICKMONSTER GUL (Pokémon Yellow på Game Boy Color) ----------
// övervärlden uppifrån: tränaren går med PIKATJU efter sig, in i högt gräs → strid med HP-staplar → smiter iväg.
const FM = { W: 160, H: 144, PER: 10.6, STEG: 0.27 };
const FM_KARTA = [
  'TTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTGGGGTTTTTTTT',
  'TT......GGGG....fTTT',
  'TT..GGGG.--.....GGTT',
  'TT..GGGG.--..ff.GGTT',
  'TT.......--.....GGTT',
  'TT.f.....--.......TT',
  'TT..hhhh.--..hhhh.TT',
  'TT..hhhh.--..hhhh.TT',
  'TT..hhhh.--..hhhh.TT',
  'TT..hhhh.--..hhhh.TT',
  'TT.......--..s....TT',
  'TT..xxxx.--.xxxxx.TT',
  'TT.......--....f..TT',
  'TT..f....--.......TT',
  'TTTTTTTTTTTTTTTTTTTT',
];
const FM_START = [9, 13], FM_VAG = ['U', 'U', 'U', 'U', 'U', 'U', 'U', 'U', 'L', 'U', 'U', 'U'];
const FMF = { mark: '#f0f0d0', mork: '#202018', gras: '#68c048', grasM: '#2a7a2a', trad: '#3a9a3a', tradM: '#1a5a1a', stam: '#8a5a2a', vag: '#e8d8a0', vagM: '#c8b070', tak: '#e04838', takM: '#901820', vagg: '#f8f8f8', vaggM: '#b8c0c8', fonster: '#68a8e8', staket: '#f8f8f8', blom: '#e84060' };
function fmKarta(y) {
  const B = 16;
  FM_KARTA.forEach((rad, j) => [...rad].forEach((c, i) => {
    const X = i * B, Y = j * B;
    R(y, X, Y, B, B, FMF.mark);
    for (let k = 0; k < 3; k++) P(y, X + 3 + k * 5, Y + 4 + ((k * 7) % 9), '#c8d8a0');
    if (c === 'T') {   // träd: rund krona med ränder, stam
      R(y, X + 6, Y + 11, 4, 5, FMF.stam); disc(y, X + 8, Y + 7, 6, FMF.tradM); disc(y, X + 8, Y + 6, 5, FMF.trad); R(y, X + 4, Y + 4, 3, 1, '#78d070'); R(y, X + 5, Y + 7, 6, 1, FMF.tradM);
    } else if (c === 'G') {   // högt gräs: täta tofsar
      R(y, X, Y, B, B, '#88d060');
      for (let r = 0; r < 2; r++) for (let k = 0; k < 2; k++) { const gx = X + k * 8, gy = Y + r * 8; R(y, gx + 1, gy + 3, 6, 4, FMF.gras); P(y, gx + 1, gy + 2, FMF.grasM); P(y, gx + 3, gy + 1, FMF.grasM); P(y, gx + 5, gy + 2, FMF.grasM); R(y, gx + 2, gy + 3, 1, 3, FMF.grasM); R(y, gx + 4, gy + 2, 1, 4, FMF.grasM); R(y, gx + 6, gy + 3, 1, 3, FMF.grasM); R(y, gx + 1, gy + 7, 6, 1, FMF.grasM); }
    } else if (c === '-') { R(y, X, Y, B, B, FMF.vag); for (let k = 0; k < 4; k++) P(y, X + 2 + k * 4, Y + ((k * 5 + j * 3) % 14) + 1, FMF.vagM); }
    else if (c === 'x') { R(y, X, Y + 6, B, 2, FMF.staket); R(y, X, Y + 10, B, 1, FMF.vaggM); R(y, X + 2, Y + 3, 3, 10, FMF.staket); R(y, X + 10, Y + 3, 3, 10, FMF.staket); R(y, X + 2, Y + 12, 3, 1, FMF.vaggM); R(y, X + 10, Y + 12, 3, 1, FMF.vaggM); }
    else if (c === 's') { R(y, X + 7, Y + 9, 2, 6, FMF.stam); R(y, X + 2, Y + 3, 12, 7, FMF.stam); R(y, X + 3, Y + 4, 10, 5, '#f8e8b0'); R(y, X + 4, Y + 5, 8, 1, FMF.stam); R(y, X + 4, Y + 7, 6, 1, FMF.stam); }
  }));
  // husen (4×4 rutor): tak med ränder, vägg, fönster och dörr
  for (const [hx, hy] of [[4, 7], [13, 7]]) {
    const X = hx * B, Y = hy * B;
    R(y, X, Y, 64, 30, FMF.tak); for (let k = 0; k < 30; k += 4) R(y, X, Y + k, 64, 1, FMF.takM); R(y, X - 2, Y + 28, 68, 3, FMF.takM);
    R(y, X + 2, Y + 31, 60, 33, FMF.vagg); R(y, X + 2, Y + 60, 60, 4, FMF.vaggM);
    for (const fx of [X + 8, X + 42]) { R(y, fx, Y + 38, 14, 10, FMF.mork); R(y, fx + 1, Y + 39, 12, 8, FMF.fonster); R(y, fx + 7, Y + 39, 1, 8, FMF.mork); }
    R(y, X + 26, Y + 44, 12, 20, FMF.mork); R(y, X + 27, Y + 45, 10, 19, '#a86a3a'); P(y, X + 35, Y + 54, '#f8d060');
  }
}
// spriterna 16×16: tränaren (röd keps) och PIKATJU, bakifrån och från sidan, två steg vardera
const FM_TRANARE = {
  upp: [
    ['.....KKKKKK.....', '....KRRRRRRK....', '...KRRRRRRRRK...', '...KRRRRRRRRK...', '...KKRRRRRRKK...', '..KHHHHHHHHHHK..', '..KHHHHHHHHHHK..', '...KHHHHHHHHK...', '..KRRKHHHHKRRK..', '.KSKRRRRRRRRKSK.', '.KSKRRWWWWRRKSK.', '..KKRRRRRRRRKK..', '...KBBBBBBBBK...', '...KBBKK.KBBK...', '...KKK...KBBK...', '.........KKK....'],
    ['.....KKKKKK.....', '....KRRRRRRK....', '...KRRRRRRRRK...', '...KRRRRRRRRK...', '...KKRRRRRRKK...', '..KHHHHHHHHHHK..', '..KHHHHHHHHHHK..', '...KHHHHHHHHK...', '..KRRKHHHHKRRK..', '.KSKRRRRRRRRKSK.', '.KSKRRWWWWRRKSK.', '..KKRRRRRRRRKK..', '...KBBBBBBBBK...', '...KBBK.KKBBK...', '...KBBK...KKK...', '....KKK.........'],
  ],
  vanster: [
    ['.....KKKKKK.....', '....KRRRRRRK....', '...KRRRRRRRRK...', '..KKKKRRRRRRK...', '..KWWKKRRRRKK...', '...KSSSHHHHHK...', '...KSKSSHHHHK...', '...KSSSSSHHK....', '....KKSSSKK.....', '...KRRRRRRRK....', '...KRRSSKRRK....', '...KRRSSKRRK....', '....KBBBBBBK....', '....KBBKKBBK....', '...KKKK.KKKK....', '................'],
    ['.....KKKKKK.....', '....KRRRRRRK....', '...KRRRRRRRRK...', '..KKKKRRRRRRK...', '..KWWKKRRRRKK...', '...KSSSHHHHHK...', '...KSKSSHHHHK...', '...KSSSSSHHK....', '....KKSSSKK.....', '...KRRRRRRRK....', '...KRRRRSSRK....', '...KRRRRSSRK....', '....KBBBBBBK....', '.....KBBBBK.....', '.....KKKKK......', '................'],
  ],
};
const FM_PIKA = {
  upp: [
    ['................', '..KK........KK..', '..KYK......KYK..', '...KYK....KYK...', '...KYYKKKKYYK...', '...KYYYYYYYYK...', '..KYYYYYYYYYYK..', '..KYYYYYYYYYYK..', '..KYYOYYYYOYYK..', '..KYYYOOOOYYYK..', '...KYYYYYYYYK.KK', '...KYYYYYYYYKKYK', '..KYYYYYYYYYYKYK', '..KYKYYYYYYKYKK.', '...KKKKKKKKKK...', '................'],
    ['................', '..KK........KK..', '..KYK......KYK..', '...KYK....KYK...', '...KYYKKKKYYK...', '...KYYYYYYYYK...', '..KYYYYYYYYYYK..', '..KYYYYYYYYYYK..', '..KYYOYYYYOYYK..', '..KYYYOOOOYYYK..', '...KYYYYYYYYKKK.', '...KYYYYYYYYKYYK', '..KYYYYYYYYYYKYK', '...KYKYYYYKYKKK.', '...KKKKKKKKKK...', '................'],
  ],
  vanster: [
    ['................', '.KK.............', '.KYK......KKK...', '..KYK....KYYYK..', '..KYYKKKKYYYYK..', '..KYYYYYYYYYYK..', '.KYYKYYYYYYYK...', '.KYRYYYYYYYYK..K', '.KYYYYYYYYYYK.KY', '..KKYYYYYYYYKKYK', '...KYYYYYYYYYYK.', '...KYYYYYYYYYK..', '...KYKYYYYKYK...', '...KKK.KKK.KK...', '................', '................'],
    ['................', '.KK.............', '.KYK......KKK...', '..KYK....KYYYK..', '..KYYKKKKYYYYK..', '..KYYYYYYYYYYK..', '.KYYKYYYYYYYK...', '.KYRYYYYYYYYK...', '.KYYYYYYYYYYKKKK', '..KKYYYYYYYYKYYK', '...KYYYYYYYYYKK.', '...KYYYYYYYYYK..', '....KYKYYKYK....', '....KKK.KKK.....', '................', '................'],
  ],
};
const FM_PAL = { K: '#181818', R: '#e83030', H: '#383838', S: '#f8b888', W: '#f8f8f8', B: '#3858c8', Y: '#f8d830', O: '#a07818' };
// stridsbilderna: RATTIS framifrån (lila råtta) och PIKATJU bakifrån
const FM_RATTIS = ['...KK.......KK...', '..KLLK.....KLLK..', '..KLPLK...KLPLK..', '...KLLKKKKKLLK...', '...KLLLLLLLLLK...', '..KLLLLLLLLLLLK..', '..KLKWKLLLKWKLK..', '..KLKKKLLLKKKLK..', '.KKLLLLLKLLLLLKK.', 'KK.KLLLLLLLLLK.KK', '...KKLLWWWLLKK...', '....KLLWKWLLK....', '...KLLLKKKLLLK...', '..KLCCCLLLCCCLK..', '..KLCCCCCCCCCLK..', '...KLLCCCCCLLK..K', '...KLLLLLLLLLK.KL', '....KLKKKKKLK.KLK', '....KKK...KKKKLK.', '.............KK..'];
const FM_PIKA_BAK = ['..K............K..', '.KK............KK.', '.KYK..........KYK.', '..KYK........KYK..', '..KYYK......KYYK..', '...KYYKKKKKKYYK...', '...KYYYYYYYYYYK...', '..KYYYYYYYYYYYYK..', '..KYYYYYYYYYYYYK..', '..KYYYYYYYYYYYYK..', '..KYYYOOOOOOYYYK..', '.KYYYYYYYYYYYYYYK.', '.KYYYYYOOOOYYYYYKKK', '.KYYYYYYYYYYYYYKYYK', '.KYYYYYYYYYYYYYKYK.', '..KYYYYYYYYYYYKYK..', '..KYYYYYYYYYYYKK...', '...KKYYYYYYYYKK....', '.....KKKKKKKK......'].map((r) => r.padEnd(19, '.'));
const FM_STRID_PAL = { K: '#181818', L: '#9a5ac8', P: '#f0a0c0', W: '#f8f8f8', C: '#f0e0b0', Y: '#f8d830', O: '#a07818' };
function fmRuta(x, X, Y, w, h) { R(x, X, Y, w, h, '#f8f8f8'); R(x, X + 1, Y + 1, w - 2, h - 2, '#181818'); R(x, X + 2, Y + 2, w - 4, h - 4, '#f8f8f8'); R(x, X + 3, Y + 3, w - 6, h - 6, '#181818'); R(x, X + 4, Y + 4, w - 8, h - 8, '#f8f8f8'); }
function fmHP(x, X, Y, andel) {
  T(x, 'HP:', X, Y, '#181818');
  R(x, X + 13, Y, 50, 5, '#181818'); R(x, X + 14, Y + 1, 48, 3, '#f8f8f8');
  R(x, X + 14, Y + 1, Math.round(48 * andel), 3, andel > 0.5 ? '#30b848' : andel > 0.2 ? '#f8c018' : '#e83030');
}
function fmText(x, rader, n) {
  fmRuta(x, 0, 96, 160, 48);
  let kvar = n;
  rader.forEach((r, i) => { const s = r.slice(0, Math.max(0, kvar)); kvar -= r.length; T(x, s, 10, 108 + i * 14, '#181818', BIG); });
  if (n > rader.join('').length + 6 && Math.floor(n / 8) % 2) { R(x, 146, 132, 5, 1, '#181818'); R(x, 147, 133, 3, 1, '#181818'); P(x, 148, 134, '#181818'); }
}
function fickmonster(x, t) {
  const { W, H, PER, STEG } = FM, fas = mod(t, PER), GA0 = 0.5, GA1 = GA0 + FM_VAG.length * STEG;
  if (fas < GA1 + 0.5) {
    // ---- övervärlden ----
    const n = Math.max(0, Math.min(FM_VAG.length, (fas - GA0) / STEG)), hel = Math.floor(n), del = n - hel;
    const pos = [[...FM_START]];
    for (const d of FM_VAG) { const [a, b] = pos[pos.length - 1]; pos.push(d === 'U' ? [a, b - 1] : d === 'L' ? [a - 1, b] : [a + 1, b]); }
    const pa = pos[hel], pb = pos[Math.min(pos.length - 1, hel + 1)], px = (pa[0] + (pb[0] - pa[0]) * del) * 16, py = (pa[1] + (pb[1] - pa[1]) * del) * 16;
    const kx = Math.round(px - 64), ky = Math.round(py - 64);
    x.drawImage(fast('b-fm-karta', 320, 256, fmKarta), -kx, -ky);
    // blommor som vajar
    FM_KARTA.forEach((rad, j) => [...rad].forEach((c, i) => { if (c !== 'f') return; const X = i * 16 - kx, Y = j * 16 - ky, v = Math.floor(t * 2.5) % 2; for (const [fx, fy] of [[3, 3], [10, 9]]) { R(x, X + fx + v, Y + fy, 3, 3, FMF.blom); P(x, X + fx + 1 + v, Y + fy + 1, '#f8f080'); R(x, X + fx + 1, Y + fy + 3, 1, 2, FMF.gras); } }));
    // PIKATJU går en ruta efter tränaren
    const n2 = Math.max(0, n - 1), h2 = Math.floor(n2), d2 = n2 - h2, qa = pos[h2], qb = pos[Math.min(pos.length - 1, h2 + 1)];
    const qx = (qa[0] + (qb[0] - qa[0]) * d2) * 16 - kx, qy = (qa[1] + (qb[1] - qa[1]) * d2) * 16 - ky;
    const riktT = FM_VAG[Math.min(FM_VAG.length - 1, hel)], riktP = n < 1 ? 'U' : FM_VAG[Math.min(FM_VAG.length - 1, h2)];
    const gar = n > 0 && n < FM_VAG.length, fotT = gar && del > 0.25 && del < 0.75 ? 1 : 0, fotP = gar && n > 1 && d2 > 0.25 && d2 < 0.75 ? 1 : 0;
    const pika = riktP === 'L' ? FM_PIKA.vanster[fotP] : FM_PIKA.upp[fotP];
    spr(x, pika, Math.round(qx), Math.round(qy) - 2, FM_PAL);
    const tr = riktT === 'L' ? FM_TRANARE.vanster[fotT] : FM_TRANARE.upp[fotT];
    spr(x, tr, 64, 60 - (fotT ? 1 : 0), FM_PAL);
    // i gräset: gräset täcker benen
    const iGras = FM_KARTA[Math.round(py / 16)] && FM_KARTA[Math.round(py / 16)][Math.round(px / 16)] === 'G';
    if (iGras && n >= FM_VAG.length - 1) { R(x, 65, 70, 14, 6, '#88d060'); for (let k = 0; k < 3; k++) { P(x, 66 + k * 5, 70, FMF.grasM); R(x, 67 + k * 5, 70, 1, 4, FMF.grasM); } }
    // in- och uttoning, och blinkningarna när ett vilt fickmonster dyker upp
    if (fas < GA0) R(x, 0, 0, W, H, `rgba(248,248,248,${(1 - fas / GA0).toFixed(2)})`);
    if (fas > GA1 + 0.05) { const k = fas - GA1 - 0.05; if (Math.floor(k * 12) % 2 === 0) R(x, 0, 0, W, H, 'rgba(24,24,24,0.75)'); for (let j = 0; j < 18; j++) if (j % 2) R(x, 0, j * 8, W * Math.min(1, k / 0.45), 8, '#181818'); else R(x, W - W * Math.min(1, k / 0.45), j * 8, W, 8, '#181818'); }
    return;
  }
  // ---- striden ----
  const b0 = GA1 + 0.5, k = fas - b0;
  R(x, 0, 0, W, H, '#f8f8f8');
  // RATTIS glider in från vänster, tränaren (sedan PIKATJU) från höger
  const in1 = Math.min(1, k / 0.6), rx = Math.round(-30 + in1 * 150);
  disc(x, rx, 52, 3, '#d8d8c8'); R(x, rx - 22, 50, 44, 4, '#d8d8c8');
  skala(x, sprDuk('fm-rattis', FM_RATTIS, FM_STRID_PAL), rx, 52 + (Math.floor(t * 3) % 2), 2);
  const T1 = 0.7, T2 = 2.4, T3 = 3.3, T4 = 4.6, T5 = 5.4;
  if (k > T1) { T(x, 'MUSKEN', 8, 4, '#181818', BIG); T(x, ':L3', 40, 13, '#181818'); fmHP(x, 16, 20, 1); R(x, 8, 27, 1, 6, '#181818'); R(x, 8, 32, 64, 1, '#181818'); P(x, 72, 31, '#181818'); }
  R(x, 8, 90, 60, 4, '#d8d8c8');
  if (k < T2) { const tx = Math.round(38 + (1 - in1) * 130 - Math.max(0, k - T2 + 0.4) * 120); skala(x, sprDuk('fm-tranare', FM_TRANARE.upp[0], FM_PAL), tx, 94, 2.5); }
  if (k >= T2) {
    const up = Math.min(1, (k - T2) / 0.3);
    x.save(); x.beginPath(); x.rect(0, 0, W, 94); x.clip();
    skala(x, sprDuk('fm-pikabak', FM_PIKA_BAK, FM_STRID_PAL), 38, Math.round(94 + (1 - up) * 40), 2.2); x.restore();
    T(x, 'VOLTIS', 86, 52, '#181818', BIG); T(x, ':L6', 120, 61, '#181818'); fmHP(x, 88, 68, 1); T(x, '20/ 20', 112, 76, '#181818', BIG);
    R(x, 151, 66, 1, 18, '#181818'); R(x, 82, 84, 70, 1, '#181818'); P(x, 82, 83, '#181818');
  }
  // textrutan: vilt fickmonster, ut med PIKATJU, menyn, och sedan smiter vi
  const skriv = (t0, rader) => fmText(x, rader, Math.floor((k - t0) * 28));
  if (k < T1) fmRuta(x, 0, 96, 160, 48);
  else if (k < T2) skriv(T1, ['EN VILD MUSKEN', 'DÖK UPP!']);
  else if (k < T3) skriv(T2, ['KÖR, VOLTIS!']);
  else if (k < T4) {
    fmRuta(x, 0, 96, 160, 48); fmRuta(x, 64, 96, 96, 48);
    const val = [['KAMP', 80, 108], ['MONST', 122, 108], ['VÄSKA', 80, 124], ['FLY', 122, 124]];
    for (const [s, X, Y] of val) T(x, s, X, Y, '#181818', BIG);
    const i = k - T3 < 0.45 ? 0 : k - T3 < 0.8 ? 1 : 3, [, cx, cy] = val[i];
    for (let j = 0; j < 4; j++) R(x, cx - 7, cy + j, j < 2 ? j + 1 : 4 - j, 1, '#181818');
    R(x, cx - 7, cy + 4, 1, 3, '#181818'); P(x, cx - 6, cy + 4, '#181818'); P(x, cx - 6, cy + 5, '#181818');
  } else skriv(T4, ['DU KOM UNDAN!']);
  if (k > T5) R(x, 0, 0, W, H, `rgba(248,248,248,${Math.min(1, (k - T5) / Math.max(0.1, PER - b0 - T5)).toFixed(2)})`);
}

export const GLIMTAR = [
  { id: 'marcokart', titel: 'PIPO KART', forebild: 'Super Mario Kart', ar: 1992, studio: 'SVAMPSTUDION', w: MK.W, h: MK.H, rita: marcoKart },
  { id: 'segorally', titel: 'TORA RALLY', forebild: 'Sega Rally Championship', ar: 1995, studio: 'TORA RACING', w: SR.W, h: SR.H, rita: segoRally },
  { id: 'crash', titel: 'KRASCH KOALA', forebild: 'Crash Bandicoot', ar: 1996, studio: 'GRAY WOLF', w: CB.W, h: CB.H, rita: crashBandikut },
  { id: 'marco64', titel: 'PIPO 64', forebild: 'Super Mario 64', ar: 1996, studio: 'SVAMPSTUDION', w: 160, h: 120, rita: marco64 },
  { id: 'fickmonster', titel: 'MONSTERKOMPIS GUL', forebild: 'Pokémon Yellow', ar: 1998, studio: 'CRITTER LAB', w: FM.W, h: FM.H, rita: fickmonster },
];
