// Kontoret i pixel: rummet (vägg + golv efter vald typ), platserna för bord/golv/väggsaker per kontorsnivå
// och den fasta rekvisitan (garageporten, verktygstavlan, fönstret, ljusslingan). Rummet målas en gång och cachas.
import { Pix, mix, mul, hash, bayer, ramp, kant, nz, qmix, tex, disc, glod, VARM, DJUP, SKUGGA } from './kit.js';

export const TAK = 14, VAGG_BOTTEN = 92, GOLV_SLUT = 202;
const W = 384;

// platserna per nivå: bord = arbetsplats (x = bordets vänsterkant, fy = personens fötter),
// golv = (x = mitt, fy = golvkontakt), vagg = (x = mitt, y = överkant). bredd/hojd = världens storlek
// (större kontor går att panorera; panelen nertill täcker de understa 40 pixlarna).
export function layout(niva) {
  switch (niva) {
    case 'garage': return {
      bredd: W, hojd: 202,
      bord: [{ x: 34, fy: 128 }, { x: 150, fy: 128 }],
      golv: [{ x: 14, fy: 106 }, { x: 118, fy: 102 }, { x: 250, fy: 118 }, { x: 338, fy: 150 }],
      vagg: [{ x: 132, y: 30 }, { x: 196, y: 24 }, { x: 258, y: 30 }],
      port: { x: 298, w: 82 }, fonster: [{ x: 62, y: 28, w: 34, h: 26 }], verktyg: { x: 10, y: 38 },
    };
    case 'litet': return rader(W, 2, 3, 8, 4);
    case 'vaning': return rader(W, 3, 4, 12, 5);
    case 'studio': return rader(448, 4, 5, 16, 7);
    default: return rader(576, 4, 8, 18, 9);
  }
}
const STEG_X = 66, RAD_Y = 44, FORSTA = 130;
function rader(bredd, nRader, perRad, nGolv, nVagg) {
  const bord = [];
  const x0 = Math.round((bredd - perRad * STEG_X) / 2) + 2;
  for (let r = 0; r < nRader; r++) for (let k = 0; k < perRad; k++) bord.push({ x: x0 + k * STEG_X, fy: FORSTA + r * RAD_Y });
  const golv = [];
  for (let r = 0; r < nRader && golv.length < nGolv; r++) { golv.push({ x: 14, fy: FORSTA - 6 + r * RAD_Y }); if (golv.length < nGolv) golv.push({ x: bredd - 14, fy: FORSTA - 6 + r * RAD_Y }); }
  const kvar = nGolv - golv.length;
  for (let i = 0; i < kvar; i++) golv.push({ x: Math.round(34 + (i + 0.5) * (bredd - 68) / kvar), fy: 102 });
  const vagg = []; for (let i = 0; i < nVagg; i++) vagg.push({ x: Math.round(56 + (i + 0.5) * (bredd - 112) / nVagg), y: 24 + (i % 2) * 5 });
  const hojd = Math.max(202, FORSTA + (nRader - 1) * RAD_Y + 62);
  return { bredd, hojd, bord, golv, vagg, fonster: [{ x: 12, y: 28, w: 28, h: 26 }, { x: bredd - 40, y: 28, w: 28, h: 26 }] };
}

// ---------- väggar ----------
function vagg(P, typ, x0, x1) {
  for (let y = TAK; y < VAGG_BOTTEN - 3; y++) for (let x = x0; x < x1; x++) {
    let c;
    switch (typ) {
      case 'puts': c = nz(0xd8cfc0, x, y, 3, 0.04, 0.2); break;
      case 'panel': { const lx = x % 12; c = lx === 0 ? 0x6a4a30 : nz(lx < 2 ? 0xb08060 : 0x9a6a48, x, y >> 2, 5, 0.05); break; }
      case 'kakel': { const lx = x % 10, ly = (y - TAK) % 8; c = lx === 0 || ly === 0 ? 0xb8b8c0 : (lx === 1 || ly === 1) ? 0xffffff : nz(0xeeeef2, x, y, 6, 0.02); break; }
      case 'glasvagg': { const lx = x % 48; c = lx < 2 ? 0x8a8e9a : qmix(0x9ac8f0, 0xd8ecf8, (y - TAK) / 60, x, y, 3); if (lx >= 2 && y > 56 && hash(x >> 3, 0, 4) * 30 > 92 - y) c = mix(0x6a7a9a, c, 0.3); break; }
      case 'betongvagg': c = nz(0x8a8a90, x, y, 7, 0.06, 0.2); if (y === VAGG_BOTTEN - 8) c = 0x4ff0ff; break;
      default: { // tegel
        const row = y >> 2, off = (row & 1) ? 4 : 0, lx = (x + off) & 7, ly = y & 3;
        if (ly === 0 || lx === 0) c = nz(0xcdb9a6, x, y, 9, 0.05, 0.15);
        else { const h = hash((x + off) >> 3, row, 3); c = h < 0.3 ? mul(0xa8694f, 0.9) : h < 0.62 ? 0xa8694f : mix(0xa8694f, VARM, 0.08); if (h > 0.965) c = mul(0xa8694f, 0.72); if (ly === 1) c = mix(c, VARM, 0.1); if (lx === 7) c = mul(c, 0.88); }
      }
    }
    c = qmix(mul(c, 0.82), c, (y - TAK) / 30, x, y, 3);
    P.px(x, y, c);
  }
  if (typ === 'betongvagg') glod(P, (x0 + x1) / 2, VAGG_BOTTEN - 8, (x1 - x0) / 2, 4, 0x4ff0ff, 0.25, 2);
  P.hl(x0, VAGG_BOTTEN - 3, x1 - x0, 0x8a7a70); P.hl(x0, VAGG_BOTTEN - 2, x1 - x0, 0x5a4a44); P.hl(x0, VAGG_BOTTEN - 1, x1 - x0, 0x3a2e30);
}
// ---------- golv ----------
function golv(P, typ, x0, x1, y1 = GOLV_SLUT) {
  for (let y = VAGG_BOTTEN; y < y1; y++) for (let x = x0; x < x1; x++) {
    const d = y - VAGG_BOTTEN; let c;
    switch (typ) {
      case 'klinker': { const lx = x % 16, ly = d % 12; c = lx === 0 || ly === 0 ? 0x9a9488 : nz(0xd8d0c0, x, y, 2, 0.04); break; }
      case 'schack': { const t = ((x >> 4) + (d >> 3)) & 1; c = nz(t ? 0x2a2a30 : 0xe8e4dc, x, y, 2, 0.04); break; }
      case 'stal': { c = nz(0x8a8e98, x, y, 2, 0.04); if (((x + d * 2) % 8 === 0 && d % 6 < 2)) c = 0xb8bcc8; break; }
      case 'grasmatta': c = hash(x, y, 4) > 0.5 ? 0x3aa050 : hash(x, y, 5) > 0.5 ? 0x2f8f46 : 0x4ab85a; break;
      case 'parkett': { const ly = d % 6, lx = (x + (Math.floor(d / 6) % 2) * 20) % 40; c = ly === 0 || lx === 0 ? 0x6a4428 : nz(hash(Math.floor((x + (Math.floor(d / 6) % 2) * 20) / 40), Math.floor(d / 6), 3) > 0.5 ? 0xb07a48 : 0xa06a3a, x, y, 5, 0.05); break; }
      case 'marmor': { c = nz(0xeae6e0, x, y, 3, 0.03); if (hash(x >> 1, (y + x) >> 2, 6) > 0.97) c = 0xa8a4a0; if ((x % 32 === 0) || d % 24 === 0) c = 0xc8c4bc; break; }
      case 'neongolv': { c = nz(0x16162a, x, y, 3, 0.05); if (x % 24 === 0 || d % 16 === 0) c = (x + d) % 48 < 24 ? 0x6a2a8a : 0x2a6a8a; break; }
      default: { // betong
        const tx = Math.floor(x / 24), ty = Math.floor(d / 16), lx = x - tx * 24, ly = d - ty * 16, th = hash(tx, ty, 1);
        c = th < 0.33 ? mul(0x80828a, 0.95) : th < 0.66 ? 0x80828a : mul(0x80828a, 1.05); c = nz(c, x, y, 2, 0.05, 0.1);
        if (lx === 0 || ly === 0) c = mul(c, 0.86); else if (lx === 1 || ly === 1) c = mix(c, VARM, 0.1);
      }
    }
    if (d < 4 && bayer(x, y) < (4 - d) / 5) c = mix(c, DJUP, 0.25);
    P.px(x, y, c);
  }
}

// ---------- fast rekvisita ----------
function windowPane(P, x, y, w, h) {
  const fr = 0xe8e3d6; P.rect(x, y, w, h, fr);
  const gx = x + 2, gy = y + 2, gw = w - 4, gh = h - 4;
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
    let c = qmix(0x6aaee6, 0xd8ecf2, j / gh, gx + i, gy + j, 4);
    if (j > gh * 0.25 && hash(i >> 2, j >> 1, 7) > 0.94) c = 0xf6f8fb;
    const b = (((i * 2 - j * 3) % 40) + 40) % 40; if (b < 3) c = mix(c, VARM, 0.28);
    P.px(gx + i, gy + j, c);
  }
  P.vl(gx + (gw >> 1) - 1, gy, gh, fr); P.hl(gx, gy + (gh >> 1) - 1, gw, fr);
  P.hl(x, y, w, VARM); P.vl(x, y, h, VARM); P.hl(x, y + h - 1, w, 0xb8b0a0); P.vl(x + w - 1, y, h, 0xb8b0a0); P.box(x - 1, y - 1, w + 2, h + 2, 0x6a5e58);
  P.rect(x - 3, y + h + 1, w + 6, 2, 0xd8d0c0); P.hl(x - 3, y + h + 1, w + 6, VARM); P.hl(x - 3, y + h + 3, w + 6, 0x6a5e58);
}
function sunPatch(P, x, y, w, len) { for (let j = 0; j < len; j++) { const lvl = 0.95 * (1 - j / len), ox = Math.floor(j * 0.5); for (let i = 0; i < w; i++) if (bayer(x + ox + i, y + j) < lvl) P.px(x + ox + i, y + j, 0xfff6dc, 0.14); } }
function garageDoor(P, x, y, w, h) {
  const R = ramp(0x8a919e), ph = 10;
  P.rect(x - 3, y - 3, w + 6, h + 3, 0x4a4650); P.hl(x - 3, y - 3, w + 6, 0x6a6670); P.vl(x - 3, y - 3, h + 3, 0x6a6670);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const ly = j % ph; let col = ly === 0 ? R.hi : ly === ph - 2 ? R.lo : ly === ph - 1 ? R.dk : nz(R.base, x + i, y + j, 15, 0.04, 0.1);
    if (i < 2) col = mix(col, VARM, 0.12); else if (i >= w - 2) col = mul(col, 0.84);
    P.px(x + i, y + j, col);
  }
  for (let k = 0; k < 4; k++) { const px = x + 4 + k * 19, py = y + ph + 2; for (let j = 0; j < 6; j++) for (let i = 0; i < 15; i++) P.px(px + i, py + j, (((i * 2 - j * 3) % 20) + 20) % 20 < 2 ? 0x7a8498 : qmix(0x3a4258, 0x5a6478, j / 6, px + i, py + j, 3)); P.box(px - 1, py - 1, 17, 8, R.dk); }
  P.rect(x + (w >> 1) - 5, y + h - 7, 10, 3, R.dk); P.hl(x + (w >> 1) - 5, y + h - 7, 10, 0xd0d4dc);
  P.hl(x, y + h - 1, w, 0x2a2430);
}
function toolBoard(P, x, y) {
  const w = 42, h = 26;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { let c = nz(0xc9a878, x + i, y + j, 8, 0.05, 0.1); if (i % 3 === 1 && j % 3 === 1) c = mul(c, 0.7); P.px(x + i, y + j, c); }
  P.box(x, y, w, h, 0x6a4a30); P.hl(x + 1, y + 1, w - 2, 0xe8cc98);
  P.vl(x + 7, y + 9, 9, 0x8a5a30); P.rect(x + 5, y + 6, 6, 3, 0x8a8f9a); P.hl(x + 5, y + 6, 6, 0xc4c8d0);
  P.vl(x + 15, y + 8, 10, 0xa0a4ae); P.rect(x + 14, y + 5, 4, 3, 0xa0a4ae);
  P.vl(x + 22, y + 6, 4, 0xc9323a); P.vl(x + 22, y + 10, 6, 0xb8bcc4);
  P.rect(x + 26, y + 20, 13, 3, 0xe8b230); P.rect(x + 31, y + 20, 3, 3, 0x45b964);
  P.rect(x + 28, y + 6, 6, 6, 0x9aa0ad); P.rect(x + 30, y + 8, 2, 2, 0xc9a878);
  P.rect(x + 2, y + h, w, 2, DJUP, 0.18);
}
function stringLights(P, bredd) {
  const n = Math.ceil(bredd / 96), pts = []; for (let i = 0; i <= n; i++) pts.push([i * 96, TAK + 2 + (i % 2) * 5]);
  for (let s = 0; s < n; s++) P.line(pts[s][0], pts[s][1], pts[s + 1][0], pts[s + 1][1], 0x2a2430);
  const cols = [0xfff4e0, 0xffd23f, 0x45b964, 0xf0a0c0];
  for (let k = 0; k < bredd / 16; k++) {
    const x = 8 + k * 16, seg = Math.min(n - 1, Math.floor(x / 96)), t = (x - pts[seg][0]) / 96, y = Math.round(pts[seg][1] + (pts[seg + 1][1] - pts[seg][1]) * t) + 1, c = cols[k % 4];
    glod(P, x + 1, y + 2, 4, 3, c, 0.28, 2); P.px(x, y, 0x3a3f50); P.px(x + 1, y, 0x3a3f50); P.rect(x, y + 1, 2, 2, c); P.px(x, y + 1, mix(c, 0xffffff, 0.5));
  }
}
function kartonger(P) {
  const box = (x, y, w, h, c) => { const R = ramp(c); P.rect(x, y, w, h, R.base); P.rect(x, y, w, 2, R.hi); P.vl(x, y, h, R.hi); P.vl(x + w - 1, y, h, R.lo); P.hl(x, y + h - 1, w, R.lo); P.vl(x + (w >> 1), y, h, 0xd9c9a0); P.box(x - 1, y - 1, w + 2, h + 2, R.dk); };
  box(306, 100, 22, 16, 0xb58a5a); box(310, 86, 18, 14, 0xa87d50); P.rect(306, 116, 22, 3, DJUP, 0.2);
}

// rummet (vägg + golv + fast rekvisita) för kontoret – cachas per nivå/golv/vägg
const RUM = new Map();
export function rum(kontor) {
  const L = layout(kontor.niva), key = kontor.niva + kontor.golvtyp + kontor.vaggtyp;
  let c = RUM.get(key); if (c) return { bild: c, L };
  const P = new Pix(L.bredd, L.hojd);
  vagg(P, kontor.vaggtyp, 0, L.bredd); golv(P, kontor.golvtyp, 0, L.bredd, L.hojd);
  stringLights(P, L.bredd);
  for (const f of L.fonster || []) { windowPane(P, f.x, f.y, f.w, f.h); sunPatch(P, f.x - 4, VAGG_BOTTEN, f.w + 10, 30); }
  if (L.verktyg) toolBoard(P, L.verktyg.x, L.verktyg.y);
  if (L.port) { garageDoor(P, L.port.x, TAK + 8, L.port.w, VAGG_BOTTEN - TAK - 11); if (kontor.niva === 'garage') kartonger(P); }
  // tejplinjen i garaget
  if (kontor.niva === 'garage') { for (let x = 8; x < 290; x++) { P.px(x, 158, nz(0xe8b230, x, 158, 5, 0.08, 0.15)); P.px(x, 159, nz(0xd49a1e, x, 159, 5, 0.08, 0.15)); } }
  c = P.flush(); RUM.set(key, c);
  return { bild: c, L };
}
export function rensaRum() { RUM.clear(); }
