// Spelglimtar, grupp C. Samma format som BAS i ../glimtar.js. Verktygen finns i ../pix.js.
import { SMALL, BIG, R, P, T, TW, TK, spr, tri, mod, disc, hash, toning, fast } from '../pix.js';

// ---------- egna ritverktyg ----------
const klamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const mjuk = (v) => { v = klamp(v); return v * v * (3 - 2 * v); };
// fylld polygon med skarpa kanter (udda-jämn-regeln i pixelns mitt)
function poly(x, pts, f) {
  let y0 = Infinity, y1 = -Infinity;
  for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  x.fillStyle = f;
  for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
    const yc = y + 0.5, xs = [];
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
      if ((ay <= yc) !== (by <= yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) { const a = Math.round(xs[i]), b = Math.round(xs[i + 1]); if (b > a) x.fillRect(a, y, b - a, 1); }
  }
}
// fylld ellips
function ellips(x, cx, cy, rx, ry, f) {
  for (let j = -ry; j <= ry; j++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry + 0.4)))); R(x, cx - w, cy + j, w * 2 + 1, 1, f); }
}
// streck med tjocklek b
function streck(x, x0, y0, x1, y1, f, b = 1) {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= n; i++) R(x, x0 + ((x1 - x0) * i) / n - (b - 1) / 2, y0 + ((y1 - y0) * i) / n - (b - 1) / 2, b, b, f);
}
// ring (hjul, radar): pixlar med avstånd r0..r1 från mitten
function ring(x, cx, cy, r0, r1, f) {
  const n = Math.ceil(r1);
  for (let j = -n; j <= n; j++) for (let i = -n; i <= n; i++) { const d = Math.hypot(i, j); if (d >= r0 && d <= r1) P(x, cx + i, cy + j, f); }
}
// dollartecknet finns inte i typsnittet
const DOLLAR = ['..#..', '.####', '#.#..', '.###.', '..#.#', '####.', '..#..'];
const dollar = (x, X, Y, f, k = 1) => DOLLAR.forEach((r, j) => { for (let i = 0; i < 5; i++) if (r[i] === '#') R(x, X + i * k, Y + j * k, k, k, f); });
const dollarK = (x, X, Y, f, kant, k = 1) => { for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) dollar(x, X + dx, Y + dy, kant, k); dollar(x, X, Y, f, k); };
const HJARTA = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
const hjarta = (x, X, Y, f, glans = null) => { HJARTA.forEach((r, j) => { for (let i = 0; i < 7; i++) if (r[i] === '#') P(x, X + i, Y + j, f); }); if (glans) P(x, X + 1, Y + 1, glans); };

// ---------- 1999 GALEN TAXI (Crazy Taxi) ----------
// Jaktkamera bakom taxin på en San Francisco-backe: gatan med viktorianska hus rusar mot krönet,
// bortom krönet ligger bukten och den röda bron. Kunden vinkar under sitt gröna $.
const GT = { W: 160, H: 120, VPY: 52, KRON: 60, F: 64, KAM: 1.6, VAG: 4, FASAD: 6.6, L: 48 };
const GT_FARG = [['#f4a8bc', '#c8809a'], ['#a8e2c8', '#7cbc9e'], ['#f8e29a', '#d0b670'], ['#a8c8f2', '#7c9ccc'], ['#f2f0e6', '#c8c4b4'], ['#f8c08e', '#d09464'], ['#c8b2ea', '#9c86c4']];
const GT_HUS = [0, 1].map((s) => {
  const ut = []; let z = 0, i = 0;
  while (z < GT.L - 0.01) { let l = 3.6 + hash(i, s + 5) * 2.4; if (z + l > GT.L - 3) l = GT.L - z; ut.push({ z, l, h: 6.4 + Math.floor(hash(i, s + 9) * 4) * 0.9, f: GT_FARG[Math.floor(hash(i, s + 13) * GT_FARG.length)] }); z += l; i++; }
  return ut;
});
function gtBak(y) {
  const { W } = GT;
  toning(y, 0, 0, W, 48, ['#2a78e6', '#4690f0', '#6eaef8', '#9ccdfe', '#c8e6ff']);
  for (const [cx, cy, w] of [[14, 12, 26], [74, 7, 20], [128, 15, 24]]) { R(y, cx, cy, w, 4, '#ffffff'); R(y, cx + 4, cy - 3, w - 10, 3, '#ffffff'); R(y, cx + 2, cy + 4, w - 4, 1, '#d8ecfc'); }
  // Marin-kullarna på andra sidan bukten
  for (let i = 0; i < W; i++) {
    const h = Math.round(4 + Math.sin(i / 13) * 2 + Math.sin(i / 6 + 1) + Math.max(0, Math.sin((i - 96) / 30)) * 3);
    R(y, i, 47 - h, 1, h + 1, i % 4 ? '#7c9a5e' : '#70905a'); P(y, i, 47 - h, '#98b474');
  }
  toning(y, 0, 47, W, 16, ['#4a8ae0', '#3474d0', '#2a66c2']);
  // Alcatraz
  R(y, 120, 52, 14, 2, '#8a8a70'); R(y, 123, 50, 8, 2, '#ece8dc'); R(y, 128, 47, 1, 3, '#ece8dc');
  // bron: två röda torn, bärkablar med hängare och däcket
  const BRO = '#d0462a', MORK = '#962e1a';
  for (let i = 0; i < W; i++) {
    const ky = i < 61 ? 25 + 24 * Math.pow((61 - i) / 61, 1.15) : i > 103 ? 25 + 24 * Math.pow((i - 103) / 57, 1.15) : 45 - 20 * Math.pow((i - 82) / 21, 2);
    if (i % 2 === 0) R(y, i, ky, 1, 49 - ky, 'rgba(208,70,42,0.45)');
    P(y, i, ky, BRO);
  }
  R(y, 0, 49, W, 2, BRO); R(y, 0, 51, W, 1, MORK);
  for (const tx of [58, 100]) {
    R(y, tx, 23, 2, 30, BRO); R(y, tx + 4, 23, 2, 30, BRO); R(y, tx + 5, 23, 1, 30, MORK); R(y, tx + 1, 23, 1, 30, MORK);
    for (const ky of [23, 29, 36, 43]) R(y, tx, ky, 6, 2, BRO);
    R(y, tx - 1, 52, 8, 2, '#8a8a8a');
  }
}
function gtTaxi(x, cx, by, d, t) {
  ellips(x, cx - Math.round(d * 7), by, 27 + Math.round(d * 7), 3, 'rgba(10,10,20,0.35)');
  // sladd: nosen pekar åt vänster, så vänstra sidan syns och framhjulet sticker ut snett framåt
  if (d > 0.05) {
    const lx = cx - 22, L = 30 * d, upp = 8 * d, fh = 11 * (1 - 0.3 * d), at = (u, dy) => [lx - L * u, by - 7 - upp * u - dy * (1 - 0.3 * d * u)];
    const [hx, hy] = at(0.74, 0);
    R(x, hx - 3, hy - 4, 7, 8, '#18181c'); R(x, hx - 2, hy - 3, 5, 1, '#3a3a42');
    poly(x, [at(0, 11), at(1, 11), at(1, 0), at(0, 0)], '#e0b012');
    poly(x, [at(0, 11), at(1, 11), at(1, 10), at(0, 10)], '#fff27a');
    poly(x, [at(0, 6), at(1, 6), at(1, 4), at(0, 4)], '#181818');
    for (let i = 0; i < 12; i++) { const [X, Y] = at((i + 0.5) / 12, 5 + (i % 2 ? 0.6 : -0.6)); P(x, X, Y, '#f8f8f8'); }
    poly(x, [at(0, 2), at(1, 2), at(1, 0), at(0, 0)], '#b88a0c');
    const [d1x, d1y] = at(0.42, 11), [d2x, d2y] = at(0.42, 1); streck(x, d1x, d1y + 1, d2x, d2y, '#a8800a');
    // kupésidan: ratten och vindrutans kant syns över dörren
    const [vx, vy] = at(0.55, 11); streck(x, vx, vy, vx + 2, vy - 8, '#c8d0d8'); R(x, vx + 3, vy - 4, 4, 2, '#2a2a2e');
    const [ax, ay] = at(1, 9); R(x, ax, ay, 2, 2, '#fff4c0');
  }
  // bakhjulen
  for (const hx of [cx - 22, cx + 16]) { R(x, hx, by - 7, 7, 7, '#18181c'); R(x, hx + 1, by - 6, 5, 1, '#3a3a42'); R(x, hx, by - 2, 7, 1, '#0a0a0c'); }
  // kupén: sätena, föraren och kunden, vindrutans krom, taxiskylten
  R(x, cx - 18, by - 31, 36, 1, '#e8eef4'); R(x, cx - 18, by - 31, 1, 11, '#c8d0d8'); R(x, cx + 17, by - 31, 1, 11, '#c8d0d8');
  R(x, cx - 17, by - 30, 34, 9, 'rgba(190,225,255,0.35)');
  disc(x, cx - 9, by - 25, 4, '#2a1a12'); R(x, cx - 13, by - 26, 9, 2, '#e8302a');      // föraren med pannband
  disc(x, cx + 9, by - 24, 4, '#f0c050'); P(x, cx + 7, by - 26, '#fff0a0');               // kunden i passagerarsätet
  R(x, cx - 16, by - 22, 13, 5, '#8a2a20'); R(x, cx + 3, by - 22, 13, 5, '#8a2a20'); R(x, cx - 16, by - 22, 13, 1, '#b04a3a'); R(x, cx + 3, by - 22, 13, 1, '#b04a3a');
  R(x, cx - 10, by - 41, 21, 9, '#141414'); R(x, cx - 9, by - 40, 19, 7, '#f8e040'); T(x, 'TAXI', cx - 7, by - 39, '#141414');
  R(x, cx - 1, by - 32, 3, 1, '#141414');
  // bakpartiet: gult med rutband, baklyktor, kromad stötfångare
  R(x, cx - 22, by - 18, 44, 11, '#f8c818'); R(x, cx - 21, by - 18, 42, 1, '#fff27a'); R(x, cx - 22, by - 17, 44, 1, '#ffe048');
  for (let i = 0; i < 22; i++) { R(x, cx - 22 + i * 2, by - 13, 2, 1, i % 2 ? '#181818' : '#f8f8f8'); R(x, cx - 22 + i * 2, by - 12, 2, 1, i % 2 ? '#f8f8f8' : '#181818'); }
  R(x, cx - 22, by - 9, 44, 2, '#c89a10');
  for (const lx of [cx - 21, cx + 17]) { R(x, lx, by - 16, 4, 3, '#e02a2a'); P(x, lx + 1, by - 16, '#ff9a8a'); }
  R(x, cx - 5, by - 16, 10, 3, '#f4f4ee'); for (let i = 0; i < 4; i++) P(x, cx - 3 + i * 2, by - 15, '#3a3a6a');
  R(x, cx - 24, by - 7, 48, 3, '#c4c8d0'); R(x, cx - 24, by - 7, 48, 1, '#f4f6fa'); R(x, cx - 24, by - 5, 48, 1, '#8a8e98');
  // däckrök när den sladdar
  if (d > 0.25) for (let k = 0; k < 7; k++) {
    const a = mod(t * 2.4 + k / 7, 1), r = Math.round(2 + a * 6), fx = cx + (k % 2 ? 18 : -20) + (k % 2 ? 1 : -1) * a * 10 + a * 8, fy = by - 3 - a * 10;
    disc(x, Math.round(fx), Math.round(fy), r, `rgba(236,236,242,${(0.75 * (1 - a) * d).toFixed(2)})`);
  }
}
function galenTaxi(x, t) {
  const { W, H, VPY, KRON, F, KAM, VAG, FASAD, L } = GT;
  const fas = mod(t, 8), kam = mod(t * 6, L), zK = (KAM * F) / (KRON - VPY);
  const d = mjuk(Math.sin(klamp((fas - 1.2) / 3.8) * Math.PI) * 1.6);   // hur mycket taxin sladdar (0..1)
  const vpx = 86 - d * 6;
  x.drawImage(fast('c-galentaxi', W, H, gtBak), 0, 0);
  // glitter på bukten och en mås
  for (let i = 0; i < 14; i++) { const gx = mod(i * 23 + Math.floor(fas * 3) * 7, W), gy = 53 + (i * 5) % 7; if ((i + Math.floor(fas * 4)) % 3 === 0) R(x, gx, gy, 2, 1, '#cfe6ff'); }
  const mx = mod(fas * 25, 200) - 20, my = 30 + Math.sin(fas * 2) * 2, vinge = Math.floor(fas * 6) % 2;
  P(x, mx, my, '#ffffff'); P(x, mx - 1, my - vinge, '#ffffff'); P(x, mx + 1, my - vinge, '#ffffff'); P(x, mx - 2, my - 1 + vinge, '#ffffff'); P(x, mx + 2, my - 1 + vinge, '#ffffff');
  // gatan i perspektiv: trottoar, kantsten, asfalt, kabelbanans spår och dubbla gula linjer (taxin kör i högra filen)
  const kx = 1.9, sx = (X, s) => vpx + (X - kx) * s;
  for (let y = KRON; y < H; y++) {
    const z = (KAM * F) / (y + 0.5 - VPY), zw = z + kam, s = F / z;
    R(x, sx(-FASAD, s), y, FASAD * 2 * s, 1, mod(zw, 1.8) < 0.16 ? '#a8a49a' : '#c6c2b8');
    R(x, sx(-VAG - 0.35, s), y, (VAG + 0.35) * 2 * s, 1, mod(zw, 6) < 1.4 ? '#e05040' : '#e4e0d6');
    R(x, sx(-VAG, s), y, VAG * 2 * s, 1, Math.floor(zw / 3) % 2 ? '#56565f' : '#5e5e68');
    const b = Math.max(1, 0.1 * s);
    for (const rx of [-2.1, -1.35, 1.35, 2.1]) R(x, sx(rx, s) - b / 2, y, b, 1, '#3c3c44');
    for (const cx of [-0.26, 0.14]) R(x, sx(cx, s), y, b, 1, '#f2ca22');
  }
  R(x, sx(-VAG, F / zK), KRON, (2 * VAG * F) / zK, 1, '#7c7c86');
  // husfasaderna längs båda trottoarerna, kolumn för kolumn
  for (const s of [-1, 1]) {
    const hus = GT_HUS[s < 0 ? 0 : 1], avst = FASAD - s * kx;
    for (let xi = 0; xi < W; xi++) {
      const dx = (xi + 0.5 - vpx) * s; if (dx <= 0) continue;
      const z = (avst * F) / dx; if (z > zK || z < 0.8) continue;
      const lok = mod(z + kam + (s > 0 ? 17 : 0), L), h = hus.find((q) => lok >= q.z && lok < q.z + q.l) || hus[hus.length - 1], i = lok - h.z;
      const sk = F / z, bot = VPY + KAM * sk, top = VPY - (h.h - KAM) * sk, [ljus, mork] = h.f;
      if (i < 0.14 || z > zK - 0.12) { R(x, xi, top, 1, bot - top, mork); continue; }   // hörnet mellan två hus
      R(x, xi, top, 1, bot - top, ljus);
      R(x, xi, top, 1, Math.max(1, 0.5 * sk), '#fbf8ee'); R(x, xi, top + 0.5 * sk, 1, Math.max(1, 0.14 * sk), mork);   // takgesimsen
      R(x, xi, VPY - (2.7 - KAM) * sk, 1, Math.max(1, 0.12 * sk), '#fbf8ee');                                           // list över bottenvåningen
      // bottenvåningen: garageport och entrédörr
      if (i > 0.5 && i < 2.4) { const a = VPY - (2.2 - KAM) * sk; R(x, xi, a, 1, bot - a, mod(i, 0.4) < 0.06 ? '#6a5c4c' : '#8a7a68'); }
      else if (i > h.l - 1.3 && i < h.l - 0.5) { const a = VPY - (2.3 - KAM) * sk; R(x, xi, a, 1, bot - a, '#5a3424'); }
      // fönstren på våningarna ovanför
      const fon = mod(i - 0.55, 1.45);
      if (i > 0.5 && i < h.l - 0.45 && fon < 0.85) for (const [y1, y2] of [[3.1, 4.7], [5.3, 6.8]]) {
        if (y2 > h.h - 0.7) continue;
        const a = VPY - (y2 - KAM) * sk, b = VPY - (y1 - KAM) * sk;
        R(x, xi, a, 1, b - a, fon < 0.14 || fon > 0.72 ? '#fbf8ee' : '#34507e');
        if (fon > 0.2 && fon < 0.4) R(x, xi, a + 1, 1, Math.max(1, (b - a) * 0.35), '#86b0e4');
        P(x, xi, a, '#fbf8ee');
      }
    }
  }
  // gatlyktor, träd och kunden – längst bort först
  const ting = [];
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) { const z = mod(k * 8 + (s > 0 ? 4 : 0) + 2 - kam, L); if (z > 1.3 && z < zK - 0.2) ting.push({ s, z, typ: k % 2 ? 'trad' : 'lykta' }); }
  const kz = mod(40 - kam, L); if (kz > 2.6 && kz < zK - 0.3) ting.push({ s: 1, z: kz, typ: 'kund' });
  ting.sort((a, b) => b.z - a.z);
  for (const o of ting) {
    const sk = F / o.z, gy = VPY + KAM * sk;
    if (o.typ === 'lykta') {
      const gx = sx(o.s * 5.6, sk), top = VPY - (4.4 - KAM) * sk, b = Math.max(1, 0.14 * sk);
      R(x, gx - b / 2, top, b, gy - top, '#2c3a34'); R(x, gx - 0.4 * sk, top, 0.8 * sk + 1, Math.max(1, 0.2 * sk), '#2c3a34'); R(x, gx - 0.2 * sk, top + 0.2 * sk, 0.4 * sk + 1, Math.max(1, 0.25 * sk), '#f8f0c0');
    } else if (o.typ === 'trad' && o.z > 3) {
      const gx = sx(o.s * 5.4, sk), b = Math.max(1, 0.18 * sk);
      R(x, gx - b / 2, VPY - (2.4 - KAM) * sk, b, gy - VPY + (2.4 - KAM) * sk, '#6a4a2a');
      const r = Math.max(2, Math.round(1.1 * sk)), ty = Math.round(VPY - (3.3 - KAM) * sk);
      disc(x, Math.round(gx), ty, r, '#3a7e36'); disc(x, Math.round(gx - r * 0.3), ty - Math.round(r * 0.3), Math.max(1, Math.round(r * 0.6)), '#58a04a');
    } else if (o.typ === 'kund') {
      // kunden vinkar på trottoaren med sitt gröna $ ovanför huvudet
      const u = sk, gx = sx(4.9, u), vink = Math.sin(t * 9);
      ellips(x, Math.round(gx), Math.round(gy), Math.max(2, Math.round(0.4 * u)), 1, 'rgba(0,0,0,0.3)');
      R(x, gx - 0.22 * u, gy - 0.85 * u, Math.max(1, 0.18 * u), 0.85 * u, '#2a3a6a'); R(x, gx + 0.04 * u, gy - 0.85 * u, Math.max(1, 0.18 * u), 0.85 * u, '#2a3a6a');
      R(x, gx - 0.27 * u, gy - 1.45 * u, Math.max(2, 0.54 * u), 0.62 * u, '#f07a2a');
      const hr = Math.max(1, Math.round(0.14 * u)), hy = Math.round(gy - 1.6 * u);
      disc(x, Math.round(gx), hy, hr, '#f0c090'); R(x, gx - hr, hy - hr, hr * 2 + 1, Math.max(1, hr * 0.6), '#4a2a18');
      streck(x, gx - 0.25 * u, gy - 1.4 * u, gx - 0.45 * u, gy - 1.95 * u, '#f0c090', Math.max(1, 0.12 * u));
      streck(x, gx + 0.25 * u, gy - 1.4 * u, gx + 0.35 * u + vink * 0.2 * u, gy - 1.98 * u, '#f0c090', Math.max(1, 0.12 * u));
      const k = o.z < 6 ? 2 : 1, studs = Math.round(Math.sin(t * 5) * 1.5);
      dollarK(x, Math.round(gx - 2.5 * k), Math.round(hy - hr - 4 - 7 * k + studs), '#3cf03c', '#0a5a0a', k);
    }
  }
  // sladdspåren och taxin
  const cx = Math.round(80 + d * 4), by = 106;
  if (d > 0.2) for (const hx of [cx - 19, cx + 19]) for (let y = by; y < H; y++) P(x, hx + Math.round((y - by) * d * 0.6), y, 'rgba(20,20,24,0.55)');
  gtTaxi(x, cx, by, d, t);
  // HUD: den gröna pilen, tiden, pengarna och kombotexten
  const a = -0.25 - d * 0.5 + Math.sin(t * 1.6) * 0.12;
  const PIL = [[0, 12], [9, 2], [4, 2], [4, -9], [-4, -9], [-4, 2], [-9, 2]];
  const pr = (dy) => PIL.map(([px, py]) => [82 + (px * Math.cos(a) - py * Math.sin(a)) * 1.5, 20 + dy - (px * Math.sin(a) + py * Math.cos(a)) * 0.72]);
  for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 4]]) poly(x, pr(oy).map(([px, py]) => [px + ox, py]), '#0a2a0a');
  for (let k = 3; k > 0; k--) poly(x, pr(k), '#1a8a1a');
  poly(x, pr(0), '#34e034'); poly(x, pr(0).slice(0, 3).concat([[82, 20]]), '#7af87a');
  const tid = String(45 - Math.floor(fas));
  TK(x, tid, 5, 5, '#ffe838', '#7a2400', BIG, 2);
  dollarK(x, W - 52, 5, '#5cff5c', '#0a4a0a'); TK(x, '1286.40', W - 44, 5, '#5cff5c', '#0a4a0a', BIG);
  if (d > 0.55) {
    const s = 'GALEN DRIFT!', w = TW(s, BIG); TK(x, s, 74 - w / 2, 54, '#ffe030', '#b81808', BIG);
    TK(x, '×' + (1 + (Math.floor(fas * 1.5) % 4)), 74 + w / 2 + 4, 54, '#ffffff', '#b81808', BIG);
  }
}

// ---------- 2001 HALOO (Halo: Combat Evolved) ----------
// Lugn mellanscen: den gröna rustningen med guldvisir står vid sin jeep och ser ut över ringvärlden,
// ringen reser sig ur horisonten och böjer av upp i himlen. Sköldmätare och rörelsedetektor syns.
const HA_GUBBE = [
  '....BBBBBBB....',
  '...BLHHLGGGB...',
  '..BLHLGGGGGDB..',
  '..BGOVVVVWWDB..',
  '..BGOVVVVVWDB..',
  '..BDGOOVVVGDB..',
  '...BDGGGGGDB...',
  '.BBBBKkkkKBBBB.',
  'BLHLGBGLGBGLGDB',
  'BLLGGBHLLBGGDDB',
  'BGGGDBGLGBDGGDB',
  '.BDDBKGGGKBDDB.',
  '.BGGBKDGDKBGDB.',
  '.BGDBKKDKKBGDB.',
  '.BkKBGGGGGBKkB.',
  '.BKKBDBBBDBKKB.',
  '..BB.BGB.BGB.B.',
  '.....BGB.BGB...',
  '....BLGB.BGDB..',
  '....BHGB.BGDB..',
  '....BGDB.BGDB..',
  '....BKKB.BKKB..',
  '....BKkB.BkKB..',
  '...BDGGB.BGGDB.',
  '...BGGDB.BDGGB.',
  '...BBBBB.BBBBB.',
];
const HA_PAL = { B: '#141a0c', D: '#38461e', G: '#55692b', L: '#738842', H: '#97ad5c', K: '#26282a', k: '#4a4c50', V: '#eca42a', W: '#fff2aa', O: '#a8600e' };
const HA_BANSHEE = ['.....MMM.....', '.PPPLLLLLPPP.', 'PPLLLLLLLLLPP', '.PP..DDD..PP.', '......D......'];
const HA_BPAL = { P: '#7a3aa6', L: '#b06ad8', D: '#3a1a5a', M: '#e8b8ff' };
function haBak(y) {
  const W = 160, H = 90;
  toning(y, 0, 0, W, 66, ['#2856ba', '#386aca', '#5486da', '#7ca4e6', '#a6c2f0', '#cedff6']);
  // ringen: ett band som reser sig ur horisonten till höger och böjer av upp ur bilden
  const CX = -36, CY = 134, RX = 182, RY = 164;
  for (let a = -0.06; a > -1.3; a -= 0.0012) {
    const px = CX + RX * Math.cos(a), py = CY + RY * Math.sin(a);
    if (py < -6) break;
    const nx = Math.cos(a) / RX, ny = Math.sin(a) / RY, nl = Math.hypot(nx, ny), ux = nx / nl, uy = ny / nl;
    const th = 4 + 10 * klamp(py / 64);
    for (let k = 0; k <= th; k += 0.5) {
      // kanterna är ringens metallväggar, mellan dem syns land, hav och moln på insidan
      const f = k < 1.2 ? '#56648e' : k > th - 1.2 ? '#7a88b4' : ['#bcd0ec', '#8eaedc', '#9cc0a4', '#dce6f4', '#7ea2d0', '#b4cc9c'][Math.floor(hash(Math.floor(a * 60), Math.floor((k / th) * 4)) * 6)];
      P(y, px + ux * k, py + uy * k, f);
    }
  }
  // lila berg långt bort
  for (let i = 0; i < W; i++) {
    const h = Math.round(53 + Math.sin(i / 19) * 5 + Math.sin(i / 7 + 1.3) * 2.5 + Math.sin(i / 3.1) * 0.8);
    R(y, i, h, 1, 72 - h, '#7262a6'); P(y, i, h, '#a094cc'); if (hash(i, 7) > 0.6) R(y, i, h + 1, 1, 2 + Math.floor(hash(i, 8) * 4), '#8676b8');
  }
  // Forerunner-bygget på berget: grå kil med blå ljuslinjer
  poly(y, [[22, 52], [30, 38], [33, 38], [41, 52]], '#a0a6b6'); poly(y, [[31, 38], [33, 38], [41, 52], [35, 52]], '#7c8294');
  R(y, 31, 30, 1, 9, '#a0a6b6'); R(y, 27, 46, 10, 1, '#60d8ff'); R(y, 29, 42, 6, 1, '#60d8ff'); P(y, 31, 30, '#90f0ff');
  // klippan till höger (vattenfallet rinner där) och kullen till vänster
  for (let i = 116; i < W; i++) {
    const top = Math.round(48 + Math.sin(i / 9) * 2 + Math.max(0, 126 - i) * 2.2);
    for (let j = top; j < 72; j++) P(y, i, j, (j - top + Math.floor(i / 5)) % 6 === 0 ? '#5a5c64' : hash(i, j) < 0.3 ? '#787a82' : '#8a8c92');
    R(y, i, top, 1, 2 + (i % 3 ? 1 : 0), '#4c8a34'); P(y, i, top, '#6aa848');
  }
  for (let i = 0; i < 64; i++) { const top = Math.round(60 + Math.pow((i - 26) / 26, 2) * 6); R(y, i, top, 1, 72 - top, '#4a8030'); P(y, i, top, '#66a242'); }
  // gräsmarken och grusvägen
  for (let j = 66; j < H; j++) for (let i = 0; i < W; i++) { const v = hash(i, j); P(y, i, j, v < 0.14 ? '#3e7a26' : v > 0.86 ? '#64aa3e' : '#4c8e30'); }
  for (let j = 76; j < 86; j++) for (let i = 14; i < 116; i++) { if (Math.abs(j - 80 - (i - 62) * 0.06) > 4 + Math.sin(i / 6)) continue; P(y, i, j, hash(i, j) < 0.3 ? '#8a7a50' : '#a08e60'); }
  for (const [bx, by, r] of [[128, 82, 4], [150, 77, 3], [118, 88, 2]]) { disc(y, bx, by, r, '#7a7c82'); disc(y, bx - 1, by - 1, Math.max(1, r - 2), '#9a9ca2'); }
  // jeepen (Warthog) från sidan, nosen åt höger – utan kanon
  y.save(); y.translate(16, 0);
  ellips(y, 38, 81, 31, 2, 'rgba(0,0,0,0.3)');
  for (const hx of [20, 55]) { disc(y, hx, 73, 8, '#18181a'); for (let k = 0; k < 12; k++) { const v = (k / 12) * Math.PI * 2; P(y, hx + Math.cos(v) * 8, 73 + Math.sin(v) * 8, '#2e2e30'); } disc(y, hx, 73, 4, '#5a5c52'); disc(y, hx, 73, 2, '#8a8c80'); P(y, hx, 73, '#3a3a34'); }
  poly(y, [[7, 67], [7, 57], [29, 57], [32, 61], [43, 61], [46, 56], [58, 57], [67, 61], [69, 66], [66, 68], [7, 68]], '#6a7838');
  poly(y, [[46, 56], [58, 57], [67, 61], [66, 62], [57, 59], [46, 58]], '#8a9a54');
  for (const hx of [20, 55]) for (let k = 0; k <= 16; k++) { const v = Math.PI + (k / 16) * Math.PI; P(y, hx + Math.cos(v) * 10, 73 + Math.sin(v) * 10, '#3e4a22'); }
  R(y, 9, 66, 56, 2, '#3e4824'); R(y, 7, 57, 22, 1, '#8a9a54'); R(y, 66, 62, 4, 5, '#2e3220'); for (let k = 0; k < 3; k++) R(y, 66 + k * 1.5, 62, 1, 5, '#4a5034');
  R(y, 66, 60, 2, 2, '#fff4c0'); P(y, 68, 63, '#fff4c0');
  for (const [sx, sy] of [[12, 60], [22, 63], [50, 60], [36, 65]]) R(y, sx, sy, 4, 2, '#55622c');
  R(y, 33, 53, 4, 8, '#34342a'); R(y, 38, 54, 4, 7, '#34342a');
  streck(y, 29, 57, 30, 47, '#3a3c36', 2); streck(y, 30, 47, 41, 47, '#3a3c36', 2); streck(y, 41, 47, 43, 57, '#3a3c36', 2); streck(y, 46, 56, 48, 50, '#6a6c64');
  R(y, 10, 55, 16, 2, '#566228'); R(y, 15, 52, 3, 4, '#3a3c36');
  y.restore();
}
function haloo(x, t) {
  const W = 160, H = 90, fas = mod(t, 7);
  x.drawImage(fast('c-haloo', W, H, haBak), 0, 0);
  // moln som glider och en Banshee som flyger förbi högt upp
  for (const [cx0, cy, w] of [[30, 14, 30], [110, 24, 22], [70, 6, 18]]) { const cx = mod(cx0 + fas * 6, W + 60) - 30; R(x, cx, cy, w, 2, 'rgba(255,255,255,0.75)'); R(x, cx + 5, cy - 1, w - 12, 1, 'rgba(255,255,255,0.6)'); }
  const bx = Math.round(W + 20 - mod(fas * 30, 210)), bY = 20 + Math.round(Math.sin(fas * 2) * 2);
  spr(x, HA_BANSHEE, bx, bY, HA_BPAL); P(x, bx + 13, bY + 2, Math.floor(t * 10) % 2 ? '#ff9aff' : '#c060ff');
  // vattenfallet från klippan
  for (let j = 50; j < 72; j++) for (let i = 141; i < 146; i++) P(x, i, j, ['#eaf6ff', '#b8dcf4', '#d0e8fc', '#9cc8ec'][mod(j - Math.floor(t * 24) + i, 4)]);
  for (let k = 0; k < 6; k++) P(x, 139 + ((k * 3 + Math.floor(t * 8)) % 9), 71 + (k % 2), '#ffffff');
  // gräset gungar
  for (let i = 0; i < 22; i++) { const gx = 4 + ((i * 37) % 152), gy = 70 + ((i * 13) % 18), v = Math.round(Math.sin(t * 2 + i) * 1); if (gx > 20 && gx < 118 && gy > 72 && gy < 86) continue; P(x, gx + v, gy - 2, '#76bc48'); P(x, gx, gy - 1, '#5ea43a'); P(x, gx + 2 + v, gy - 2, '#76bc48'); P(x, gx + 2, gy - 1, '#5ea43a'); }
  // antennen på jeepen
  streck(x, 25, 55, 24 + Math.sin(t * 3) * 1.5, 43, '#2a2c26');
  // rustningen: står lugnt vid jeepen och andas
  const gx = 98, gy = 84, andas = Math.floor(t * 1.2) % 2;
  ellips(x, gx + 7, gy, 9, 1, 'rgba(0,0,0,0.35)');
  spr(x, HA_GUBBE.slice(0, 16), gx, gy - 26 + andas, HA_PAL); spr(x, HA_GUBBE.slice(16), gx, gy - 10, HA_PAL);
  // visirets glans vandrar när huvudet vrids
  const glans = Math.floor(mod(t * 0.7, 3)); P(x, gx + 8 + glans, gy - 23 + andas, '#ffffff');
  // HUD: sköldmätaren laddas upp, livsrutor, rörelsedetektorn och kontrollpunkten
  const sk = 0.3 + 0.7 * klamp((fas - 0.8) / 3.2), full = sk >= 1 && Math.floor(t * 8) % 2;
  R(x, 102, 4, 54, 7, 'rgba(10,30,70,0.45)'); R(x, 102, 4, 54, 1, '#7ad4ff'); R(x, 102, 10, 54, 1, '#7ad4ff'); R(x, 102, 4, 1, 7, '#7ad4ff'); R(x, 155, 4, 1, 7, '#7ad4ff');
  for (let i = 0; i < 25; i++) if (i / 25 < sk) R(x, 104 + i * 2, 6, 1, 3, full ? '#d8f6ff' : '#48c0f8');
  for (let i = 0; i < 8; i++) R(x, 120 + i * 4.5, 13, 3, 2, '#5ad8ff');
  const MX = 15, MY = 75;
  disc(x, MX, MY, 12, 'rgba(14,34,80,0.55)'); ring(x, MX, MY, 11.5, 12.5, '#5ab8f0'); R(x, MX - 11, MY, 23, 1, 'rgba(90,184,240,0.5)'); R(x, MX, MY - 11, 1, 23, 'rgba(90,184,240,0.5)');
  const pr = mod(t, 1.6) / 1.6 * 12; ring(x, MX, MY, pr - 0.6, pr + 0.4, `rgba(140,220,255,${(0.8 * (1 - pr / 12)).toFixed(2)})`);
  R(x, MX - 1, MY - 1, 3, 3, '#ffe040'); R(x, MX + 5, MY - 4, 2, 2, '#ffe040');
  if (fas > 4 && fas < 6.6) { const s = 'KONTROLLPUNKT... KLAR', w = TW(s); R(x, 4, 40, w + 6, 9, 'rgba(8,20,48,0.6)'); T(x, s, 7, 42, '#9ae2ff'); }
}

// ---------- 2002 SUPER MARCO SOLSKEN (Super Mario Sunshine) ----------
// Torget i Delfino: Marco med vattenryggsäcken sprutar bort brun kladd så att ett mynt dyker upp.
const MS_MARCO = [
  '.....RRRRR......',
  '....RRRRRRRR....',
  '...RRRWWWRRRR...',
  '...RRWRRWRRRRRR.',
  '...rrrrrrrrrrrrr',
  '...HHSSSESS.....',
  '..HSHSSSSESSS...',
  '..HSHHSSSSHSSS..',
  '..HHSSSSHHHHH...',
  '....SSSSSSSS....',
  '....RRBRRRR.....',
  '...RRRBRRBRRR...',
  '..RRRRBBBBRRSS..',
  '..SSRBYBBYBWWW..',
  '..SSBBBBBBBWWW..',
  '...BBBBBBBBBB...',
  '...BBBB..BBBB...',
  '...bbb....bbb...',
  '..KKKK....KKKK..',
  '.KKKKK....KKKKK.',
];
const MS_PAL = { R: '#e0281c', r: '#a8180e', W: '#ffffff', B: '#2c52d8', b: '#1a3290', S: '#fcc490', H: '#5a2c0c', K: '#7a3c14', Y: '#f8d838', E: '#1a1a50' };
const MS_FLUDD = ['....NNN.', '...NNNNN', '..fNNNf.', '.FFFFFFf', 'FFwFFFFf', 'FwwFFFFf', 'FwwFFFFf', 'FFFFFFFf', 'FFfffFFf', 'ffffffff', '.ffffff.', '..f..f..'];
const MS_FPAL = { N: '#2a4a7a', F: '#e4f2fc', f: '#3a78c8', w: '#9ac8f0' };
const MS_PIANTA = ['..g.g.g..', '.ggggggg.', 'g.gg.gg.g', '..ppppp..', '.ppPpPpp.', 'ppppNpppp', 'pppppppp.', '.pPPPPPp.', '.ppppppp.', '..pp.pp..', '..dd.dd..'];
const MS_PPAL = { g: '#3aa840', p: '#4a8ae8', P: '#9ac4ff', N: '#2a5ab0', d: '#2a4a90' };
function msBak(y) {
  const W = 160, H = 90;
  toning(y, 0, 0, W, 44, ['#1a8cf0', '#34a2f6', '#5abaf8', '#8ad2fc', '#bce8fe']);
  // solen med strålar
  for (let k = 0; k < 12; k++) { const v = (k / 12) * Math.PI * 2; streck(y, 104 + Math.cos(v) * 8, 11 + Math.sin(v) * 8, 104 + Math.cos(v) * 11, 11 + Math.sin(v) * 11, '#fff2a0', 2); }
  disc(y, 104, 11, 6, '#fff6c0'); disc(y, 104, 11, 5, '#ffe868');
  for (const [cx, cy, w] of [[10, 18, 24], [60, 9, 28]]) { R(y, cx, cy, w, 4, '#ffffff'); R(y, cx + 4, cy - 3, w - 10, 3, '#ffffff'); }
  // havet och en ö långt bort
  toning(y, 0, 40, W, 16, ['#1a8ad8', '#22a0e4', '#3cb6ee']);
  for (let i = 92; i < 128; i++) { const h = Math.round(Math.sin(((i - 92) / 36) * Math.PI) * 6); R(y, i, 41 - h, 1, h + 1, '#5aa84a'); }
  // husen: vita väggar och terrakottatak
  const hus = (X, Y, w, vagg, tak) => {
    R(y, X, Y, w, 57 - Y, vagg); R(y, X - 1, Y - 3, w + 2, 3, tak); R(y, X - 1, Y - 1, w + 2, 1, '#a84a20');
    for (let fy = Y + 4; fy < 50; fy += 9) for (let fx = X + 3; fx < X + w - 4; fx += 7) { R(y, fx, fy + 1, 4, 5, '#2a4a8a'); R(y, fx + 1, fy, 2, 1, '#2a4a8a'); R(y, fx, fy + 6, 4, 1, '#d8c8a8'); }
  };
  hus(0, 22, 26, '#f6f0e2', '#e86a30'); hus(26, 30, 22, '#f8e6b0', '#d85a28'); hus(122, 26, 20, '#f2e8d8', '#e86a30'); hus(142, 32, 20, '#f8d8c0', '#d85a28');
  // klocktornet med solen i toppen
  R(y, 66, 12, 12, 45, '#f8f4ec'); R(y, 76, 12, 2, 45, '#d8d0c0'); R(y, 64, 10, 16, 3, '#e86a30'); R(y, 69, 18, 6, 8, '#2a4a8a'); R(y, 70, 17, 4, 1, '#2a4a8a');
  for (let k = 0; k < 8; k++) { const v = (k / 8) * Math.PI * 2; streck(y, 72 + Math.cos(v) * 4, 4 + Math.sin(v) * 4, 72 + Math.cos(v) * 6, 4 + Math.sin(v) * 6, '#f8a820'); }
  disc(y, 72, 4, 4, '#ffd838'); P(y, 71, 3, '#1a1a1a'); P(y, 73, 3, '#1a1a1a');
  // torgets kakel i perspektiv
  for (let j = 57; j < H; j++) for (let i = 0; i < W; i++) {
    const z = 300 / (j - 44), X = ((i - 80) * z) / 40, ruta = (Math.floor(X / 2.2) + Math.floor(z / 1.6)) & 1, fog = mod(X, 2.2) < 0.18 || mod(z, 1.6) < 0.12;
    P(y, i, j, fog ? '#dcbc90' : ruta ? '#f8e6c4' : '#f0c490');
  }
  R(y, 0, 56, W, 1, '#c89a68');
}
function msPalm(x, px, py, h, t, k) {
  for (let j = 0; j < h; j++) R(x, px + Math.round(Math.sin(j / 9) * 3), py - j, 3, 1, j % 3 ? '#a8783c' : '#7a5228');
  const tx = px + Math.round(Math.sin(h / 9) * 3) + 1, ty = py - h, sw = Math.sin(t * 1.5 + k) * 1.5;
  for (const [dx, dy] of [[-14, 6], [-10, 1], [-4, -3], [5, -3], [11, 1], [15, 6], [-7, 8], [8, 8]]) for (let i = 0; i <= 12; i++) { const f = i / 12; R(x, tx + (dx + sw) * f, ty + dy * f - Math.sin(f * Math.PI) * 3, 2, 2, i > 8 ? '#2e9a30' : '#3cb83c'); }
  disc(x, tx, ty + 1, 2, '#7a5228');
}
function marcoSolsken(x, t) {
  const W = 160, H = 90, fas = mod(t, 6);
  x.drawImage(fast('c-marcosolsken', W, H, msBak), 0, 0);
  for (let i = 0; i < 12; i++) { const gx = mod(i * 29 + Math.floor(fas * 2) * 11, W), gy = 44 + (i * 3) % 10; if ((i + Math.floor(fas * 5)) % 3 === 0) R(x, gx, gy, 2, 1, '#e0f6ff'); }
  // en Pianta promenerar över torget
  const pfx = Math.round(84 + tri(fas / 3) * 30), pfy = 48 + (Math.floor(t * 6) % 2);
  spr(x, MS_PIANTA, pfx, pfy, MS_PPAL, tri(fas / 3 + 0.5) > 0.5);
  // kladden: brun gegga med glans som krymper medan den sprutas bort, myntet dyker upp, kladden kommer tillbaka
  const kvar = fas < 5 ? 1 - klamp((fas - 0.8) / 3) : klamp((fas - 5.1) / 0.8), KX = 116, KY = 76;
  if (kvar > 0.02) {
    const rx = Math.round(18 * kvar), ry = Math.max(1, Math.round(5 * kvar));
    ellips(x, KX, KY, rx, ry, '#4a2c14'); ellips(x, KX - 2, KY - 1, Math.round(rx * 0.7), Math.max(1, ry - 1), '#6a3e1c');
    for (let k = 0; k < 5; k++) { const bx = KX - rx + Math.round(hash(k, 4) * rx * 2), byy = KY - ry + Math.round(hash(k, 5) * ry * 2); if (Math.abs(bx - KX) / Math.max(1, rx) + Math.abs(byy - KY) / Math.max(1, ry) < 0.9) R(x, bx, byy, 2, 1, '#2a1808'); }
    R(x, KX - Math.round(rx * 0.4), KY - ry + 1, Math.max(1, Math.round(rx * 0.4)), 1, '#c8864a');
    const bubbla = Math.floor(t * 3) % 3; if (rx > 6) disc(x, KX + 4 - bubbla * 3, KY - 1, 1, '#8a5a30');
  }
  // myntet när kladden är borta
  if (fas > 3.9 && fas < 4.9) { const p = (fas - 3.9) / 1, my = KY - 6 - Math.sin(p * Math.PI) * 14, bw = Math.max(1, Math.round(Math.abs(Math.cos(t * 10)) * 5)); R(x, KX - bw / 2, my - 4, bw, 8, '#f8c818'); R(x, KX - bw / 2, my - 4, 1, 8, '#fff090'); for (let k = 0; k < 4; k++) P(x, KX + Math.cos(k * 1.6 + t * 6) * 9, my + Math.sin(k * 1.6 + t * 6) * 6, '#ffffff'); }
  // Marco med vattenryggsäcken
  const MX = 46, MY = 80, spruta = fas > 0.5 && fas < 4.1;
  ellips(x, MX + 8, MY, 9, 1, 'rgba(60,30,0,0.3)');
  spr(x, MS_MARCO, MX, MY - 20, MS_PAL);
  spr(x, MS_FLUDD, MX - 3, MY - 19, MS_FPAL); R(x, MX + 4, MY - 10, 4, 1, '#3a78c8');   // vattenryggsäcken med axelremmen
  R(x, MX + 12, MY - 9, 4, 2, '#2a4a7a');   // munstycket under armen
  // vattenstrålen i en båge mot kladden, med stänk
  if (spruta) {
    const x0 = MX + 16, y0 = MY - 9, x1 = KX - 4, y1 = KY - 1;
    for (let k = 0; k <= 40; k++) { const u = k / 40, px = x0 + (x1 - x0) * u, py = y0 + (y1 - y0) * u - Math.sin(u * Math.PI) * 10; R(x, px, py, 2, 1, '#9ad8ff'); }
    for (let k = 0; k < 14; k++) { const u = mod(k / 14 + t * 2.2, 1), px = x0 + (x1 - x0) * u, py = y0 + (y1 - y0) * u - Math.sin(u * Math.PI) * 10; R(x, px, py - 1, 2, 2, '#ffffff'); }
    for (let k = 0; k < 8; k++) { const a = mod(t * 3 + k / 8, 1), v = -Math.PI / 2 + (k - 3.5) * 0.35; P(x, x1 + Math.cos(v) * a * 10, y1 + Math.sin(v) * a * 10 + a * a * 6, a < 0.5 ? '#ffffff' : '#9ad8ff'); }
  }
  // palmerna i förgrunden
  msPalm(x, 4, 88, 50, t, 0); msPalm(x, 150, 88, 46, t, 2);
  // HUD: solsymbolen, mynten, livsmätaren och vattentanken
  const sol = (X, Y) => { for (let k = 0; k < 8; k++) { const v = (k / 8) * Math.PI * 2; streck(x, X + Math.cos(v) * 4, Y + Math.sin(v) * 4, X + Math.cos(v) * 6, Y + Math.sin(v) * 6, '#f89820'); } disc(x, X, Y, 4, '#ffd828'); P(x, X - 1, Y - 1, '#1a1a1a'); P(x, X + 1, Y - 1, '#1a1a1a'); };
  sol(9, 9); T(x, '×', 17, 7, '#ffffff'); TK(x, '12', 23, 7, '#ffffff', '#1a3a8a', SMALL);
  R(x, 7, 18, 4, 6, '#f8c818'); R(x, 7, 18, 1, 6, '#fff090'); R(x, 10, 19, 1, 4, '#c89010'); T(x, '×', 17, 19, '#ffffff'); TK(x, String(fas > 4.6 ? 35 : 34), 23, 19, '#ffffff', '#1a3a8a', SMALL);
  for (let j = -9; j <= 9; j++) for (let i = -9; i <= 9; i++) { const dd = Math.hypot(i, j); if (dd > 9.4) continue; const seg = Math.floor(((Math.atan2(j, i) + Math.PI) / (Math.PI * 2)) * 8); P(x, 146 + i, 13 + j, dd > 8.4 ? '#ffffff' : dd < 4.5 ? '#ffd828' : seg % 2 ? '#3a72f0' : '#5a92ff'); }
  P(x, 145, 12, '#1a1a1a'); P(x, 147, 12, '#1a1a1a');
  const vatten = fas < 4.1 ? 1 - 0.65 * klamp((fas - 0.5) / 3.6) : 0.35 + 0.65 * klamp((fas - 4.3) / 1.4);
  R(x, 147, 62, 9, 22, '#ffffff'); R(x, 148, 63, 7, 20, '#1a3a6a'); R(x, 148, 63 + Math.round(20 * (1 - vatten)), 7, Math.round(20 * vatten), '#4aa8f8'); R(x, 149, 60, 5, 2, '#ffffff');
}

// ---------- 2004 GRAND THEFT AUTOMOBIL: SAN ANDREAS (GTA San Andreas) ----------
// Solnedgång i Los Santos: huvudpersonen cyklar BMX längs en gata med palmer och låga hus,
// VINEWOOD-skylten på berget, radarn nere till vänster och klockan och pengarna uppe till höger.
function saBak(y) {
  const W = 160;
  toning(y, 0, 0, W, 56, ['#5a64a0', '#8a6c94', '#c0787a', '#e8945c', '#f4b056', '#f8cc6c', '#fadc90']);
  disc(y, 34, 48, 10, '#fff2b8'); disc(y, 34, 48, 8, '#fffae0');
  // centrum i diset
  let bx = 0;
  for (let k = 0; bx < 74; k++) { const bw = 6 + Math.floor(hash(k, 31) * 8), bh = 10 + Math.floor(hash(k, 32) * 22); R(y, bx, 56 - bh, bw, bh, k % 2 ? '#b8826c' : '#c8907a'); for (let wy = 58 - bh; wy < 54; wy += 3) for (let wx = bx + 1; wx < bx + bw - 1; wx += 2) if (hash(wx, wy) > 0.7) P(y, wx, wy, '#e8b090'); bx += bw + 1; }
  // Vinewood-bergen med skylten
  for (let i = 70; i < W; i++) { const h = Math.round(16 + Math.sin((i - 70) / 22) * 8 + Math.sin(i / 7) * 1.5); R(y, i, 56 - h, 1, h, '#8c7048'); P(y, i, 56 - h, '#a88a5c'); if (hash(i, 3) > 0.7) R(y, i, 57 - h, 1, 3, '#7a6040'); }
  T(y, 'VINEWOOD', 104, 37, '#5a4630'); T(y, 'VINEWOOD', 103, 36, '#f8f0e0');
  R(y, 0, 55, W, 2, '#c8a07c');
}
// knäet: hittar leden mellan höft och fot (benlängder a och b), knäet framåt
function kna(hx, hy, fx, fy, a, b) {
  let dx = fx - hx, dy = fy - hy, d = Math.hypot(dx, dy); const m = Math.min(d, a + b - 0.01); if (d > m) { fx = hx + (dx / d) * m; fy = hy + (dy / d) * m; dx = fx - hx; dy = fy - hy; d = m; }
  const p = (a * a - b * b + d * d) / (2 * d), h = Math.sqrt(Math.max(0, a * a - p * p)), px = hx + (dx / d) * p, py = hy + (dy / d) * p;
  return [px + (dy / d) * h, py - (dx / d) * h, fx, fy];
}
function sanAndreas(x, t) {
  const W = 160, H = 90, fas = mod(t, 8), s = fas * 40;   // 320 bildpunkter per varv
  x.drawImage(fast('c-gtasa', W, H, saBak), 0, 0);
  // palmerna längs gatan (halva farten)
  for (let k = -1; k < 6; k++) {
    const px = Math.round(k * 40 - mod(s * 0.5, 40)), idx = mod(k + Math.floor((s * 0.5) / 40), 4), topp = 10 + idx * 4, sw = Math.sin(t * 1.4 + idx) * 1;
    for (let j = 0; j < 62 - topp; j++) R(x, px + Math.round(Math.sin(j / 16 + idx) * 2), 62 - j, j < 12 ? 2 : 1, 1, '#4a3424');
    const tx = px + Math.round(Math.sin((62 - topp) / 16 + idx) * 2), ty = topp;
    for (const [dx, dy] of [[-10, 6], [-8, 2], [-3, -2], [3, -2], [8, 2], [10, 6], [-5, 7], [6, 7]]) for (let i = 0; i <= 8; i++) R(x, tx + ((dx + sw) * i) / 8, ty + (dy * i) / 8 - Math.sin((i / 8) * Math.PI) * 1.5, 2, 1, '#2c4224');
  }
  // husen i Ganton: låga, platta tak, galler för fönstren, staket och gräsmatta
  const HUS = [['#c8b48c', '#a8946c'], ['#a8c49c', '#88a47c'], ['#d4a284', '#b48264'], ['#b4b0c4', '#9490a4']];
  for (let k = -1; k < 3; k++) {
    const hx = Math.round(k * 80 - mod(s, 80)), idx = mod(k + Math.floor(s / 80), 4), [v, m] = HUS[idx];
    R(x, hx + 4, 46, 58, 20, v); R(x, hx + 2, 44, 62, 3, '#6a5a4a'); R(x, hx + 2, 47, 62, 1, m);
    for (const fx of [hx + 10, hx + 42]) { R(x, fx, 51, 10, 7, '#3a3440'); for (let i = 0; i < 10; i += 2) R(x, fx + i, 51, 1, 7, '#8a8a8a'); R(x, fx, 51, 10, 1, '#8a8a8a'); }
    R(x, hx + 28, 50, 8, 16, '#5a3a2a'); R(x, hx + 26, 49, 12, 1, m); R(x, hx + 26, 64, 12, 2, '#9a9088');
    R(x, hx, 62, 80, 4, '#8a9a48'); for (let i = 0; i < 80; i += 3) if (i < 24 || i > 40) P(x, hx + i, 61, '#8a8a8a');
    for (let i = 0; i < 80; i += 2) if (i < 24 || i > 40) { P(x, hx + i, 63, '#9a9a9a'); P(x, hx + i + 1, 64, '#9a9a9a'); }
  }
  // trottoar, kantsten och gatan
  R(x, 0, 66, W, 5, '#b4ac9c'); for (let i = -mod(s, 12); i < W; i += 12) R(x, i, 66, 1, 5, '#968e80');
  R(x, 0, 71, W, 1, '#dcd4c4'); R(x, 0, 72, W, 18, '#57534e');
  for (let i = 0; i < 40; i++) P(x, mod(i * 41 - s, W), 74 + (i * 7) % 15, '#4a4642');
  for (let i = -mod(s, 24); i < W; i += 24) R(x, i, 88, 10, 1, '#d8d0b8');
  // en grön lowrider parkerad vid kanten (en gång per varv)
  const bilx = Math.round(260 - mod(s, 320));
  if (bilx > -40 && bilx < W) {
    R(x, bilx + 2, 75, 36, 5, '#2a7a30'); R(x, bilx, 77, 40, 4, '#2a7a30'); R(x, bilx + 9, 71, 18, 4, '#226a28'); R(x, bilx + 11, 72, 14, 2, '#8ab8c8');
    R(x, bilx, 77, 40, 1, '#5ab060'); R(x, bilx + 2, 75, 36, 1, '#5ab060'); R(x, bilx, 80, 40, 1, '#1a4a1c');
    for (const hx of [bilx + 8, bilx + 31]) { disc(x, hx, 81, 3, '#141414'); disc(x, hx, 81, 2, '#d8d8e0'); P(x, hx, 81, '#8a8a90'); }
  }
  // BMX:en och huvudpersonen som trampar
  const BX = 64, BY = 84, rr = 5, v = t * 14, vev = t * 7;
  const hjul = (cx) => { ring(x, cx, BY - rr, rr - 1.2, rr + 0.3, '#141414'); for (let k = 0; k < 4; k++) { const a = v + (k * Math.PI) / 4; streck(x, cx - Math.cos(a) * (rr - 1), BY - rr - Math.sin(a) * (rr - 1), cx + Math.cos(a) * (rr - 1), BY - rr + Math.sin(a) * (rr - 1), '#a8a8b0'); } P(x, cx, BY - rr, '#e8e8f0'); };
  const VX = BX + 9, VY = BY - 5, HX = BX + 7, HY = BY - 13, SX = BX + 13, SY = BY - 21;
  const ped = (fasv) => [VX + Math.cos(vev + fasv) * 3, VY + Math.sin(vev + fasv) * 3];
  const ben = (fasv, byx, sko) => { const [fx, fy] = ped(fasv), [kx, ky] = kna(HX, HY, fx, fy - 1, 6.5, 6.5); streck(x, HX, HY, kx, ky, byx, 3); streck(x, kx, ky, fx, fy - 1, byx, 2); R(x, fx - 1, fy - 1, 4, 2, sko); };
  ellips(x, BX + 9, BY, 14, 1, 'rgba(0,0,0,0.35)');
  ben(Math.PI, '#2a4478', '#c8c8c8');
  hjul(BX); hjul(BX + 19);
  streck(x, BX, BY - rr, VX, VY, '#c82424'); streck(x, VX, VY, HX + 1, HY + 2, '#c82424', 2); streck(x, HX + 1, HY + 2, BX, BY - rr, '#c82424');
  streck(x, HX, HY + 1, BX + 16, BY - 12, '#c82424', 2); streck(x, VX, VY, BX + 16, BY - 12, '#c82424', 2); streck(x, BX + 16, BY - 13, BX + 19, BY - rr, '#b0b0b8');
  streck(x, BX + 16, BY - 13, BX + 16, BY - 17, '#3a3a3a'); R(x, BX + 14, BY - 18, 5, 1, '#3a3a3a');
  R(x, HX - 2, HY, 5, 1, '#1a1a1a');
  // överkroppen lutar fram: vitt linne, mörk hy, rakat huvud
  const HUD = '#5a3a24', HUD2 = '#46301e';
  streck(x, SX, SY + 1, BX + 16, BY - 17, HUD2, 2);                       // bortre armen
  poly(x, [[HX - 2, HY + 1], [HX + 3, HY + 1], [SX + 2, SY + 2], [SX - 1, SY - 1]], '#f2f2ee');
  poly(x, [[HX - 2, HY + 1], [HX - 1, HY + 1], [SX - 1, SY], [SX - 1, SY - 1]], '#c8c8c4');
  R(x, SX, SY - 3, 2, 3, HUD);
  disc(x, SX + 2, SY - 5, 3, HUD); P(x, SX + 1, SY - 7, '#7a5236'); P(x, SX + 2, SY - 7, '#7a5236'); P(x, SX + 4, SY - 5, '#1a1010'); P(x, SX + 5, SY - 4, HUD); P(x, SX, SY - 5, HUD2);
  streck(x, SX + 1, SY, SX + 3, SY + 3, HUD, 2); streck(x, SX + 3, SY + 3, BX + 16, BY - 17, HUD, 2);   // närmre armen till styret
  ben(0, '#3a5a98', '#f0f0f0');
  // HUD: radarn nere till vänster
  const RX = 18, RY = 72, Rr = 14;
  for (let j = -Rr; j <= Rr; j++) for (let i = -Rr; i <= Rr; i++) {
    if (i * i + j * j > Rr * Rr) continue;
    const wx = i + mod(s * 0.15, 20), vag = Math.abs(j) < 2 || mod(wx, 20) < 2.5 || (j < -6 && Math.abs(j + 9) < 1.5);
    P(x, RX + i, RY + j, vag ? '#a8a49a' : hash(Math.floor(wx / 4), Math.floor(j / 4)) > 0.8 ? '#5a7a4a' : '#6e7860');
  }
  ring(x, RX, RY, Rr - 0.2, Rr + 1.4, '#101010');
  disc(x, RX, RY - Rr - 1, 3, '#101010'); T(x, 'N', RX - 1, RY - Rr - 3, '#ffffff');
  poly(x, [[RX + 4, RY], [RX - 3, RY - 3], [RX - 1, RY], [RX - 3, RY + 3]], '#ffffff');
  R(x, RX + 6, RY + 6, 3, 3, '#20c040'); P(x, RX + 7, RY + 5, '#20c040');
  // klockan, hälsan och pengarna uppe till höger
  const tim = 19, min = 20 + Math.floor(fas * 2);
  const kl = `${tim}:${String(min).padStart(2, '0')}`, kw = TW(kl, BIG);
  TK(x, kl, W - 5 - kw, 4, '#e8e8e8', '#101010', BIG);
  R(x, W - 46, 14, 42, 5, '#101010'); R(x, W - 45, 15, 34, 3, '#b42828'); R(x, W - 11, 15, 6, 3, '#4a1414');
  const pengar = '00001250', pw = TW(pengar, BIG);
  TK(x, pengar, W - 5 - pw, 22, '#4a9a3a', '#101010', BIG); dollarK(x, W - 12 - pw, 22, '#4a9a3a', '#101010');
  // stadsdelens namn
  if (fas > 1 && fas < 4.6) { const z = 'GANTON', zw = TW(z, BIG); TK(x, z, W - 6 - zw, H - 13, '#f4f0e8', '#101010', BIG); }
}

// ---------- 2005 VALPARNA (Nintendogs) ----------
// Valpen sitter i ett mysigt rum och viftar på svansen. Bollen rullar förbi och hjärtan stiger.
function vpBak(y) {
  const W = 128, H = 96;
  R(y, 0, 0, W, 60, '#f4e0c2');
  for (let i = 0; i < W; i += 8) R(y, i, 0, 1, 50, '#ead4b2');
  R(y, 0, 50, W, 10, '#e2c49c'); R(y, 0, 50, W, 1, '#fff2dc'); R(y, 0, 59, W, 1, '#b88a5c');
  // fönstret med himmel
  R(y, 12, 10, 34, 28, '#ffffff'); R(y, 14, 12, 30, 24, '#8ad0f8'); R(y, 14, 28, 30, 8, '#b4e4fc');
  R(y, 18, 16, 10, 3, '#ffffff'); R(y, 20, 14, 6, 2, '#ffffff'); disc(y, 38, 31, 5, '#6ac060'); R(y, 28, 12, 2, 24, '#ffffff'); R(y, 14, 23, 30, 2, '#ffffff');
  R(y, 10, 38, 38, 3, '#e8d0b0'); R(y, 8, 8, 4, 32, '#e86a7a'); R(y, 46, 8, 4, 32, '#e86a7a'); R(y, 6, 7, 46, 2, '#c8a07a');
  // tavla med en tass
  R(y, 92, 14, 18, 14, '#c8a07a'); R(y, 94, 16, 14, 10, '#fff8ee'); disc(y, 101, 22, 2, '#e8a0a8'); for (const [px, py] of [[98, 18], [101, 17], [104, 18]]) P(y, px, py, '#e8a0a8');
  // trägolvet i perspektiv
  for (let j = 60; j < H; j++) {
    const z = 240 / (j - 40), rad = Math.floor(z / 1.2);
    for (let i = 0; i < W; i++) { const X = ((i - 64) * z) / 30 + (rad % 2) * 1.7, fog = mod(z, 1.2) < 0.1 || mod(X, 3.4) < 0.12; P(y, i, j, fog ? '#a8743e' : hash(Math.floor(X / 3.4), rad) > 0.5 ? '#d8a468' : '#cc9a5e'); }
  }
  // matta, korg och skålar
  ellips(y, 64, 84, 42, 8, '#e87888'); ellips(y, 64, 84, 38, 6, '#f4a0aa'); ellips(y, 64, 84, 30, 4, '#e87888');
  ellips(y, 110, 68, 14, 5, '#a86a3a'); ellips(y, 110, 67, 11, 3, '#e05050'); R(y, 97, 64, 26, 2, '#c88a4a');
  ellips(y, 18, 74, 7, 2, '#3a8ae0'); R(y, 11, 72, 15, 3, '#3a8ae0'); ellips(y, 18, 72, 6, 1, '#a8e0ff');
}
function valparna(x, t) {
  const W = 128, fas = mod(t, 6);
  x.drawImage(fast('c-valparna', W, 96, vpBak), 0, 0);
  // bollen rullar fram och tillbaka på golvet och studsar
  const bp = tri(fas / 3), bx = Math.round(16 + bp * 96), bstuds = Math.round(Math.abs(Math.sin(fas * 3.2)) * 6), by = 88 - bstuds;
  ellips(x, bx, 89, 3, 1, 'rgba(80,40,10,0.3)'); disc(x, bx, by - 3, 3, '#d8f040'); R(x, bx - 2, by - 4, 1, 2, '#ffffff'); R(x, bx + 2, by - 3, 1, 2, '#ffffff'); P(x, bx - 1, by - 5, '#f8ffa0');
  // valpen: gyllene labrador som sitter och viftar
  const PX = 64, PY = 80, ljus = '#f2c88e', mell = '#dcaa6c', mork = '#b8844a', nos = '#2a1a14';
  ellips(x, PX, PY + 2, 20, 3, 'rgba(120,40,40,0.35)');
  // svansen bakom kroppen
  const sv = Math.sin(t * 14) * 0.6;
  ellips(x, PX - 11, PY - 3, 7, 5, mell); ellips(x, PX + 11, PY - 3, 7, 5, mell);
  for (let i = 0; i <= 16; i++) { const f = i / 16, a = 0.75 + sv * f + f * 0.45, X = PX + 10 + i * Math.cos(a), Y = PY - 9 - i * Math.sin(a); R(x, X - 1, Y - 1, 4, 3, mork); R(x, X - 1, Y - 1, 3, 2, i > 12 ? '#fadcae' : mell); }
  ellips(x, PX, PY - 12, 13, 13, mell); ellips(x, PX, PY - 10, 9, 10, ljus);
  for (const s of [-1, 1]) { R(x, PX + s * 5 - 2, PY - 12, 5, 12, ljus); R(x, PX + s * 5 - 2, PY - 12, 1, 12, mell); ellips(x, PX + s * 5, PY - 1, 3, 2, '#fadcae'); P(x, PX + s * 5 - 1, PY, mork); P(x, PX + s * 5 + 1, PY, mork); }
  // halsbandet med bricka
  R(x, PX - 9, PY - 24, 18, 3, '#e03040'); R(x, PX - 9, PY - 24, 18, 1, '#ff6a7a'); disc(x, PX, PY - 20, 2, '#f8d040'); P(x, PX - 1, PY - 21, '#fff4a0');
  // huvudet: stort och runt, öron som hänger, nosparti och tunga
  const lyft = Math.floor(fas * 2) % 6 === 0 ? 2 : 0, HX = PX, HY = PY - 38;
  for (const s of [-1, 1]) { poly(x, [[HX + s * 9, HY - 10 + lyft], [HX + s * 16, HY - 6 + lyft], [HX + s * 17, HY + 6], [HX + s * 12, HY + 9], [HX + s * 9, HY + 2]], mork); poly(x, [[HX + s * 10, HY - 8 + lyft], [HX + s * 15, HY - 5 + lyft], [HX + s * 15, HY + 4], [HX + s * 12, HY + 6]], mell); }
  disc(x, HX, HY, 13, ljus); ellips(x, HX, HY - 9, 9, 3, '#f8d8a4');
  ellips(x, HX, HY + 7, 8, 5, '#fadcae');
  const blink = mod(t, 3.1) < 0.14, titta = Math.round((bx - 64) / 30);
  for (const s of [-1, 1]) {
    const ex = HX + s * 6, ey = HY - 2;
    if (blink) R(x, ex - 2, ey, 4, 1, nos);
    else { ellips(x, ex, ey, 2, 3, nos); P(x, ex - 1 + titta, ey - 2, '#ffffff'); P(x, ex + titta, ey - 1, '#ffffff'); P(x, ex + 1, ey + 2, '#5a3a2a'); }
    R(x, ex - 2, ey - 5, 4, 1, mell);
  }
  ellips(x, HX, HY + 4, 3, 2, nos); P(x, HX - 1, HY + 3, '#8a7a7a');
  R(x, HX, HY + 6, 1, 2, nos); R(x, HX - 3, HY + 8, 3, 1, nos); R(x, HX + 1, HY + 8, 3, 1, nos);
  const tunga = 2 + Math.round(Math.abs(Math.sin(t * 7)) * 2);
  R(x, HX - 2, HY + 9, 4, tunga, '#f07888'); R(x, HX, HY + 9, 1, tunga - 1, '#c85868'); R(x, HX - 2, HY + 9 + tunga - 1, 4, 1, '#e86878');
  // kinderna rodnar
  R(x, HX - 10, HY + 3, 3, 1, '#f4a8a0'); R(x, HX + 8, HY + 3, 3, 1, '#f4a8a0');
  // hjärtan stiger när valpen är glad
  for (let k = 0; k < 3; k++) { const a = mod(fas / 2 + k / 3, 1); if (a > 0.85) continue; const hx = HX + 14 + k * 6 + Math.sin(a * 8 + k) * 3, hy = HY - 10 - a * 30; hjarta(x, Math.round(hx), Math.round(hy), a > 0.6 ? '#ff8aa8' : '#ff4070', '#ffc0d0'); }
  // gnistor runt valpen
  for (let k = 0; k < 4; k++) { const a = mod(t * 1.3 + k * 0.25, 1), sx = HX - 22 + ((k * 13) % 44), sy = HY - 14 + ((k * 17) % 30); if (a < 0.5) { const r = a < 0.25 ? 1 : 2; R(x, sx - r, sy, r * 2 + 1, 1, '#ffffff'); R(x, sx, sy - r, 1, r * 2 + 1, '#ffffff'); } }
  // överst: klocka och valpens namn i en vit bubbla
  R(x, 3, 3, 46, 11, '#ffffff'); R(x, 4, 2, 44, 13, '#ffffff'); R(x, 3, 13, 46, 1, '#d8c8b8');
  hjarta(x, 6, 5, '#ff4070', '#ffc0d0'); T(x, 'BUSTER', 15, 6, '#6a4a3a');
  R(x, W - 30, 3, 27, 11, '#ffffff'); R(x, W - 31, 4, 29, 9, '#ffffff'); T(x, '12:30', W - 27, 6, '#6a4a3a');
}

export const GLIMTAR = [
  { id: 'galentaxi', titel: 'TURBOTAXI', forebild: 'Crazy Taxi', ar: 1999, studio: 'TORA', w: 160, h: 120, rita: galenTaxi },
  { id: 'haloo', titel: 'GLORIA', forebild: 'Halo: Combat Evolved', ar: 2001, studio: 'ORBITAL', w: 160, h: 90, rita: haloo },
  { id: 'marcosolsken', titel: 'PIPO SOLSKEN', forebild: 'Super Mario Sunshine', ar: 2002, studio: 'SVAMPSTUDION', w: 160, h: 90, rita: marcoSolsken },
  { id: 'gtasa', titel: 'BILTJUVEN: SOLKUSTEN', forebild: 'GTA San Andreas', ar: 2004, studio: 'ASFALT', w: 160, h: 90, rita: sanAndreas },
  { id: 'valparna', titel: 'VALPARNA', forebild: 'Nintendogs', ar: 2005, studio: 'SVAMPSTUDION', w: 128, h: 96, rita: valparna },
];
