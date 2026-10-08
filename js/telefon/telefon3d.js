// telefon3d.js — telefonen som riktig pixel-3D-modell i realtid.
// Ortografisk projektion av en rundad låda, egen scanline-fyllning utan kantutjämning,
// 4-tons ramp med Bayer-dither på sidorna, dekaler (skärm, kameraö, märke) via invers uv-mappning
// och sel-out-kontur i mörk färgad ton. Alla parametrar kan ändras varje bildruta (reglage).
import { mix, mul, bayer, hash, hex, BIG } from '../core/floor-pix.js';

// ljuset: vänster-uppe men mest framifrån, så att framsidan behåller sin färg i trekvartsvy
const WARM = 0xfff4e0, SHADOW = 0x2a1f3a, L = norm([-0.4, 0.55, 0.75]);
export const YTOR = [['klassisk', 'KLASSISK'], ['matt', 'MJUK MATT'], ['kolfiber', 'KOLFIBER'], ['borstad', 'BORSTAD METALL']];
export const VYER = { fram: [0, 0.22], bak: [Math.PI, 0.22], sida: [Math.PI / 2, 0.22], under: [0.3, -1.1] };
export const STANDARD = {
  bredd: 0.72, hojd: 1.5, djup: 0.11, radie: 0.12, ram: 0.06, haka: 0.16,
  kameraStorlek: 0.2, kameror: 1, kropp: '#ebebee', glas: '#1d2a44', kamera: '#3a6bc2', marke: 'M', yta: 'klassisk',
};

function norm(v) { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
const lum = (c) => (((c >> 16) & 255) * 0.3 + ((c >> 8) & 255) * 0.59 + (c & 255) * 0.11) / 255;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// signerat avstånd till rundad rektangel (halvmått hw, hh, radie r) – negativt inuti
function sdRect(u, v, hw, hh, r) {
  const qx = Math.abs(u) - hw + r, qy = Math.abs(v) - hh + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

// fyra toner för kroppen, beroende på yta
function ramp(c, yta) {
  if (yta === 'matt') return [mix(c, WARM, 0.14), c, mix(mul(c, 0.84), SHADOW, 0.1), mix(mul(c, 0.66), SHADOW, 0.22)];
  return [mix(c, WARM, 0.32), c, mix(mul(c, 0.76), SHADOW, 0.12), mix(mul(c, 0.52), SHADOW, 0.3)];
}
function band(v, x, y, dither) {
  const t = v + (dither ? (bayer(x, y) - 0.5) * 0.1 : 0);
  return t > 0.74 ? 0 : t > 0.46 ? 1 : t > 0.24 ? 2 : 3;
}

// omkretsen av en rundad rektangel, moturs, k segment per hörn
function perimeter(w, h, r, k = 5) {
  const hw = w / 2, hh = h / 2; r = Math.min(r, hw, hh);
  const pts = [], corners = [[hw - r, hh - r, 0], [-hw + r, hh - r, Math.PI / 2], [-hw + r, -hh + r, Math.PI], [hw - r, -hh + r, Math.PI * 1.5]];
  for (const [cx, cy, a0] of corners) for (let i = 0; i <= k; i++) { const a = a0 + (i / k) * Math.PI / 2; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  return pts;
}
function rotor(yaw, pitch) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  return (v) => { const x = v[0] * cy + v[2] * sy, z = -v[0] * sy + v[2] * cy, y = v[1]; return [x, y * cp - z * sp, y * sp + z * cp]; };
}
// scanline-fyllning med pixelcentrum-regeln: varje pixel tillhör exakt en yta, inga hål och ingen kantutjämning
function fillPoly(pts, fn) {
  let minY = Infinity, maxY = -Infinity;
  for (const p of pts) { if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1]; }
  const xs = [];
  for (let y = Math.ceil(minY - 0.5), y1 = Math.floor(maxY - 0.5); y <= y1; y++) {
    const yc = y + 0.5; xs.length = 0;
    for (let i = 0, n = pts.length; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n];
      if ((p[1] <= yc && q[1] > yc) || (q[1] <= yc && p[1] > yc)) xs.push(p[0] + (yc - p[1]) * (q[0] - p[0]) / (q[1] - p[1]));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.ceil(xs[i] - 0.5), xb = Math.floor(xs[i + 1] - 0.5); x <= xb; x++) fn(x, y);
  }
}

const IKONER = [0xe07a2e, 0x45b964, 0x3a7bd5, 0xc9323a, 0xffd23f, 0x8e5bd1, 0x2aa39a, 0xf0b4c8];

/**
 * Ritar telefonen i Pix-bufferten P med mitten i (cx, cy) spelpixlar, S pixlar per modellenhet.
 * tel = parametrar (se STANDARD), yaw/pitch i radianer. Returnerar ritade gränser.
 */
export function ritaTelefon(P, cx, cy, S, tel, yaw, pitch) {
  const T = { ...STANDARD, ...tel };
  const w = T.bredd, h = T.hojd, d = T.djup, r = Math.min(T.radie, w / 2, h / 2);
  const hw = w / 2, hh = h / 2, px1 = 1 / S;
  const kropp = hex(T.kropp, 0xebebee), glas = hex(T.glas, 0x1d2a44), kam = hex(T.kamera, 0x3a6bc2);
  const R = ramp(kropp, T.yta), morkKropp = lum(kropp) < 0.45;
  const rot = rotor(yaw, pitch);
  const proj = (v) => [cx + v[0] * S, cy - v[1] * S];
  const per = perimeter(w, h, r);
  const nz = rot([0, 0, 1])[2];                           // framsidans normal mot kameran?
  const mask = new Uint8Array(P.w * P.h);
  let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
  const put = (x, y, c, typ) => {
    const xx = x - P.ox, yy = y - P.oy;
    if (xx < 0 || yy < 0 || xx >= P.w || yy >= P.h) return;
    P.px(x, y, c); mask[yy * P.w + xx] = typ;
    if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y;
  };
  const shade = (n) => clamp(0.22 + 0.78 * Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]), 0, 1);
  // invers affin uv-mappning för en plan yta med origo o och axlar au, av (modellrum)
  const uvMap = (o, au, av) => {
    const O = proj(rot(o)), U = proj(rot([o[0] + au[0], o[1] + au[1], o[2] + au[2]])), V = proj(rot([o[0] + av[0], o[1] + av[1], o[2] + av[2]]));
    const ux = U[0] - O[0], uy = U[1] - O[1], vx = V[0] - O[0], vy = V[1] - O[1], det = ux * vy - uy * vx || 1e-9;
    return (x, y) => { const px = x + 0.5 - O[0], py = y + 0.5 - O[1]; return [(px * vy - py * vx) / det, (ux * py - uy * px) / det]; };
  };
  const glossShift = Math.sin(yaw) * 0.45 + Math.sin(pitch) * 0.2;

  // ---------- framsidan ----------
  const framsida = (x, y, uv) => {
    const [u, v] = uv(x, y);
    const base = R[band(shade(rot([0, 0, 1])), x, y, false)];
    const sTop = hh - T.ram - 0.07, sBot = -hh + T.ram + T.haka, sHw = hw - T.ram, sHh = (sTop - sBot) / 2, sCy = (sTop + sBot) / 2;
    const sd = sdRect(u, v - sCy, sHw, sHh, Math.max(0.01, r - T.ram));
    let c = base;
    if (sd < 0) {
      // skärmen: mörkt glas, statusrad, appikoner, rörlig reflex
      c = glas;
      if (sd > -px1 * 1.2) c = mul(glas, 0.45);
      else {
        const sv = sTop - v;                       // avstånd från skärmens överkant
        if (sv < 0.035) c = mix(glas, WARM, 0.18);
        else if (sv > 0.05 && sHw > 0.18) {
          const cell = 0.115, iu = Math.floor((u + sHw - 0.03) / cell), iv = Math.floor((sv - 0.05) / cell);
          const fu = (u + sHw - 0.03) - iu * cell, fv = (sv - 0.05) - iv * cell;
          if (iu >= 0 && fu > 0.012 && fu < 0.092 && fv > 0.012 && fv < 0.092 && (u + sHw - 0.03 + (0.092 - fu)) < 2 * sHw && iv < 5) {
            const ic = IKONER[(iu + iv * 3) % IKONER.length];
            c = fu < 0.026 || fv < 0.026 ? mix(ic, WARM, 0.35) : fu > 0.078 || fv > 0.078 ? mul(ic, 0.72) : ic;
          }
        }
        const f = (((u - v * 0.5 + glossShift) % 0.9) + 0.9) % 0.9;
        if (f < 0.11 && (f > 0.02 && f < 0.09 || bayer(x, y) < 0.5)) c = mix(c, WARM, 0.2);
      }
    } else {
      // ramen: hörlur, frontkamera, hemknapp
      if (Math.abs(u) < 0.09 && v > hh - T.ram - 0.045 && v < hh - T.ram - 0.025) c = mix(mul(kropp, 0.4), SHADOW, 0.3);
      else if (T.selfie !== false && Math.hypot(u - 0.17, v - (hh - T.ram - 0.035)) < 0.014) c = mul(glas, 0.6);
      if (T.haka > 0.1) {
        const dh = Math.hypot(u, v - (-hh + T.ram + T.haka / 2)) - T.haka * 0.3;
        if (dh < 0) c = dh > -px1 * 1.1 ? R[3] : (u + (v - (-hh + T.ram + T.haka / 2)) < -T.haka * 0.12 ? R[0] : R[1]);
      }
    }
    put(x, y, c, 1);
  };
  // ---------- baksidan ----------
  const baksida = (x, y, uv) => {
    let [u, v] = uv(x, y); u = -u;                   // sedd bakifrån speglas u
    const n = rot([0, 0, -1]), b = band(shade(n), x, y, false);
    let c = R[b];
    if (T.yta === 'kolfiber') {
      // väv: 2×2-block av vågräta respektive lodräta strängar, alltid 3 px per cell (finare väv i högre upplösning)
      const cell = 3 / S, i = Math.floor(u / cell), j = Math.floor(v / cell);
      const blockH = ((i >> 1) + (j >> 1)) & 1, strand = blockH ? j & 1 : i & 1;
      const D0 = mix(kropp, 0x15151c, 0.78), D1 = mix(kropp, 0x7c7e94, 0.42);
      c = mul(strand ? D0 : D1, [1.15, 1, 0.84, 0.66][b]);
    } else if (T.yta === 'borstad') {
      const s = hash(Math.floor(v / 0.012), Math.floor(u / 0.3), 7);
      c = mul(c, 0.95 + s * 0.1);
    } else if (T.yta === 'matt') {
      c = mul(c, 0.97 + hash(x, y, 3) * 0.06);
    } else {
      const f = (((u * 0.8 - v * 0.4 + glossShift * 0.7) % 1) + 1) % 1;
      if (f < 0.1 && (f > 0.02 && f < 0.08 || bayer(x, y) < 0.5)) c = R[Math.max(0, b - 1)];
    }
    // kameraön uppe till vänster
    const ks = T.kameraStorlek, n_ = T.kameror <= 0 ? 0 : clamp(Math.round(T.kameror), 1, 3), pad = 0.07;
    const mw = ks, mh = ks + (Math.max(1, n_) - 1) * ks * 0.78, mcx = -hw + pad + mw / 2, mcy = hh - pad - mh / 2;
    const sd = n_ > 0 ? sdRect(u - mcx, v - mcy, mw / 2, mh / 2, ks * 0.25) : 1;
    if (sd < 0) {
      const island = mix(kropp, 0x15141c, 0.72);
      c = sd > -px1 * 1.1 ? (u - mcx + (v - mcy) < 0 ? mix(island, WARM, 0.3) : mul(island, 0.6)) : mul(island, [1.1, 1, 0.86, 0.7][b]);
      const lr = ks * 0.32;
      for (let k = 0; k < n_; k++) {
        const lcx = mcx, lcy = mcy + mh / 2 - ks * 0.5 - k * ks * 0.78, dl = Math.hypot(u - lcx, v - lcy);
        if (dl < lr) {
          c = dl > lr * 0.72 ? mix(mul(kam, 0.3), SHADOW, 0.3) : dl > lr * 0.55 ? mul(kam, 0.55) : mul(kam, 0.8);
          if (Math.hypot(u - lcx + lr * 0.3, v - lcy - lr * 0.3) < lr * 0.17) c = WARM;
        }
      }
      if (Math.hypot(u - (mcx + mw * 0.3), v - (mcy + mh / 2 - ks * 0.5 - ks * 0.3 * (n_ > 1 ? 0 : 0))) < ks * 0.07 && n_ === 1) c = 0xf6e9b8;
      if (n_ > 1 && Math.hypot(u - (mcx + mw * 0.28), v - (mcy + mh / 2 - ks * 0.9)) < ks * 0.07) c = 0xf6e9b8;
    }
    // märket: ett BIG-tecken i modellskala, mitt på ryggen
    const g = BIG[(T.marke || 'M')[0].toUpperCase()] || BIG.M;
    if (g) {
      const cell = 0.028, gw = g.w * cell, gh = g.rows.length * cell, gx = Math.floor((u + gw / 2) / cell), gy = Math.floor((-(v + 0.1) + gh / 2) / cell);
      if (gx >= 0 && gx < g.w && gy >= 0 && gy < g.rows.length && g.rows[gy][gx] === '#') c = morkKropp ? mix(kropp, WARM, 0.55) : mix(kropp, 0x2a2a30, 0.62);
    }
    put(x, y, c, 1);
  };

  if (nz > 0) { const uv = uvMap([0, 0, d / 2], [1, 0, 0], [0, 1, 0]); fillPoly(per.map((p) => proj(rot([p[0], p[1], d / 2]))), (x, y) => framsida(x, y, uv)); }
  else { const uv = uvMap([0, 0, -d / 2], [1, 0, 0], [0, 1, 0]); fillPoly(per.map((p) => proj(rot([p[0], p[1], -d / 2]))), (x, y) => baksida(x, y, uv)); }

  // ---------- sidorna ----------
  for (let i = 0, n = per.length; i < n; i++) {
    const a = per[i], b = per[(i + 1) % n];
    const ex = b[0] - a[0], ey = b[1] - a[1], len = Math.hypot(ex, ey);
    if (len < 1e-6) continue;
    const nrm = rot([ey / len, -ex / len, 0]);
    if (nrm[2] <= 0) continue;
    const v = shade(nrm);
    const quad = [proj(rot([a[0], a[1], d / 2])), proj(rot([b[0], b[1], d / 2])), proj(rot([b[0], b[1], -d / 2])), proj(rot([a[0], a[1], -d / 2]))];
    const rakHoger = a[0] > hw - 1e-6 && b[0] > hw - 1e-6, rakVanster = a[0] < -hw + 1e-6 && b[0] < -hw + 1e-6, rakBotten = a[1] < -hh + 1e-6 && b[1] < -hh + 1e-6;
    const uv = (rakHoger || rakVanster || rakBotten) ? uvMap([a[0], a[1], d / 2], [ex, ey, 0], [0, 0, -d]) : null;
    fillPoly(quad, (x, y) => {
      let bb = band(v, x, y, true), c = R[bb];
      if (uv) {
        const [t, s] = uv(x, y), my = a[1] + ey * t, mx = a[0] + ex * t;   // modellkoordinat längs kanten, s = djupled 0..1
        if (rakBotten) {
          // laddport i mitten, högtalarhål till höger
          if (Math.abs(mx) < 0.1 && s > 0.3 && s < 0.7) c = mix(mul(c, 0.45), SHADOW, 0.3);
          else if (mx > 0.17 && mx < 0.3 && s > 0.35 && s < 0.65 && Math.floor(mx / 0.03) % 2 === 0) c = mul(c, 0.6);
        } else {
          const knapp = rakHoger ? (my > 0.3 && my < 0.5) : (my > 0.1 && my < 0.25) || (my > 0.3 && my < 0.45);
          if (knapp) c = R[Math.max(0, bb - 1)];
        }
      }
      put(x, y, c, 2);
    });
  }

  // ---------- kontur (sel-out) + kant mellan glas och sida ----------
  if (bx0 === Infinity) return null;
  const W = P.w, M = (x, y) => { const xx = x - P.ox, yy = y - P.oy; return xx < 0 || yy < 0 || xx >= W || yy >= P.h ? 0 : mask[yy * W + xx]; };
  const ut = [];
  for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
    const m = M(x, y); if (!m) continue;
    const l = M(x - 1, y), rr = M(x + 1, y), u = M(x, y - 1), dn = M(x, y + 1);
    if (!l || !rr || !u || !dn) ut.push([x, y, 0]);
    else if (m === 2 && (l === 1 || rr === 1 || u === 1 || dn === 1)) ut.push([x, y, 1]);
  }
  for (const [x, y, k] of ut) { const c = P.get(x, y); P.px(x, y, k ? mul(c, 0.72) : mix(mul(c, 0.42), SHADOW, 0.45)); }
  return { x0: bx0 - 1, y0: by0 - 1, x1: bx1 + 1, y1: by1 + 1 };
}

// slagskugga på vridbordet
export function ritaSkugga(P, cx, cy, rx, ry, a = 0.5) { P.ell(cx, cy, rx, ry, SHADOW, a, 3); }
