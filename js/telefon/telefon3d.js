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
const shadeN = (n) => clamp(0.22 + 0.78 * Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]), 0, 1);

// baksidans kameraö och märke (telefonen, surfplattan och den vikbaras högra halva). u är speglad (sedd bakifrån),
// hw/hh = halva bredden/höjden, b = ytans ton 0..3. Returnerar färgen c med dekalerna ovanpå.
function bakDekal(c, T, kropp, kam, u, v, hw, hh, px1, b, morkKropp) {
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
    if (Math.hypot(u - (mcx + mw * 0.3), v - (mcy + mh / 2 - ks * 0.5)) < ks * 0.07 && n_ === 1) c = 0xf6e9b8;
    if (n_ > 1 && Math.hypot(u - (mcx + mw * 0.28), v - (mcy + mh / 2 - ks * 0.9)) < ks * 0.07) c = 0xf6e9b8;
  }
  return marke(c, T, kropp, u, v + 0.1, 0.028, morkKropp);
}
// märket: ett BIG-tecken i modellskala (cell = en glyfpixel) med mitten i (0, 0)
function marke(c, T, kropp, u, v, cell, morkKropp) {
  const g = BIG[(T.marke || 'M')[0].toUpperCase()] || BIG.M;
  if (!g) return c;
  const gw = g.w * cell, gh = g.rows.length * cell, gx = Math.floor((u + gw / 2) / cell), gy = Math.floor((-v + gh / 2) / cell);
  if (gx >= 0 && gx < g.w && gy >= 0 && gy < g.rows.length && g.rows[gy][gx] === '#') return morkKropp ? mix(kropp, WARM, 0.55) : mix(kropp, 0x2a2a30, 0.62);
  return c;
}

/**
 * Ritar enheten i Pix-bufferten P med mitten i (cx, cy) spelpixlar, S pixlar per modellenhet.
 * tel = parametrar (se STANDARD), yaw/pitch i radianer. Returnerar ritade gränser.
 * Telefonen och surfplattan är en rundad platta; laptop, klocka, hörlurar och den vikbara byggs av delar
 * (som i telefon-gl.js) och skalas så att de fyller samma ruta som en telefon med samma mått.
 */
export function ritaTelefon(P, cx, cy, S, tel, yaw, pitch) {
  const T = { ...STANDARD, ...tel };
  if (DELAR[T.enhet]) return ritaDelar(P, cx, cy, S, T, yaw, pitch, DELAR[T.enhet](T));
  const platta = T.enhet === 'platta';
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
          // appikonerna: telefonen har rutor på 0,115; surfplattan större rutor (fyra kolumner som i 3D)
          const f = platta ? Math.max(1, (2 * sHw) / (4.3 * 0.115)) : 1, cell = 0.115 * f, o = 0.03 * f;
          const iu = Math.floor((u + sHw - o) / cell), iv = Math.floor((sv - 0.05) / cell);
          const fu = (u + sHw - o) - iu * cell, fv = (sv - 0.05) - iv * cell;
          if (iu >= 0 && fu > 0.012 * f && fu < 0.092 * f && fv > 0.012 * f && fv < 0.092 * f && (u + sHw - o + (0.092 * f - fu)) < 2 * sHw && iv < (platta ? 6 : 5)) {
            const ic = IKONER[(iu + iv * 3) % IKONER.length];
            c = fu < 0.026 * f || fv < 0.026 * f ? mix(ic, WARM, 0.35) : fu > 0.078 * f || fv > 0.078 * f ? mul(ic, 0.72) : ic;
          }
        }
        const f = (((u - v * 0.5 + glossShift) % 0.9) + 0.9) % 0.9;
        if (f < 0.11 && (f > 0.02 && f < 0.09 || bayer(x, y) < 0.5)) c = mix(c, WARM, 0.2);
      }
    } else {
      // ramen: hörlur, frontkamera, hemknapp (surfplattan har ingen hörlur och kameran mitt i ramen)
      if (!platta && Math.abs(u) < 0.09 && v > hh - T.ram - 0.045 && v < hh - T.ram - 0.025) c = mix(mul(kropp, 0.4), SHADOW, 0.3);
      else if (T.selfie !== false && Math.hypot(u - (platta ? 0 : 0.17), v - (hh - T.ram - 0.035)) < 0.014) c = mul(glas, 0.6);
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
    // kameraön uppe till vänster och märket mitt på ryggen
    put(x, y, bakDekal(c, T, kropp, kam, u, v, hw, hh, px1, b, morkKropp), 1);
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

// ======================================================================================================
// De andra enheterna i pixel-3D: laptop med lock, klocka med armband, hörlursfodral med lurar och den
// vikbara. Varje enhet är en lista delar (samma mått som i telefon-gl.js):
//   { typ: 'platta', w, h, d, r | horn: [uppe höger, uppe vänster, nere vänster, nere höger], pos, M, farg, yta,
//     fram(u, v, b, R, x, y, px1), bak(u, v, b, R, x, y, px1), sida(lu, lv, s, b, R, px1) }   – rundad låda
//   { typ: 'kula', pos, r, farg, yta }                                                      – kula
// M vrider delen (lokal → modell), pos flyttar den. fram/bak får lokala (u, v) (bak speglad, sedd bakifrån),
// tonen b 0..3 och kroppens ramp R; null/undefined = ytans vanliga färg.
// ======================================================================================================
const rx = (a) => { const c = Math.cos(a), s = Math.sin(a); return (p) => [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; };
const ry = (a) => { const c = Math.cos(a), s = Math.sin(a); return (p) => [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]; };
const ID = (p) => p;
// omkretsen med egen radie per hörn (0 = skarpt), moturs som perimeter()
function perimeterHorn(w, h, rr, k = 5) {
  const hw = w / 2, hh = h / 2, m = Math.min(hw, hh), pts = [];
  const corners = [[hw, hh, 0], [-hw, hh, Math.PI / 2], [-hw, -hh, Math.PI], [hw, -hh, Math.PI * 1.5]];
  corners.forEach(([x, y, a0], i) => {
    const r = Math.min(rr[i], m);
    if (r < 1e-4) { pts.push([x, y]); return; }
    const ccx = x - Math.sign(x) * r, ccy = y - Math.sign(y) * r;
    for (let j = 0; j <= k; j++) { const a = a0 + (j / k) * Math.PI / 2; pts.push([ccx + r * Math.cos(a), ccy + r * Math.sin(a)]); }
  });
  return pts;
}
// skärm → (s, t) i en affin bas O + s·(U − O) + t·(V − O)
function affin(O, U, V) {
  const ux = U[0] - O[0], uy = U[1] - O[1], vx = V[0] - O[0], vy = V[1] - O[1], det = ux * vy - uy * vx || 1e-9;
  return (x, y) => { const px = x + 0.5 - O[0], py = y + 0.5 - O[1]; return [(px * vy - py * vx) / det, (ux * py - uy * px) / det]; };
}
const lagg = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
// alla hörn (eller kulans ytterpunkter) i modellrummet – för att passa in enheten i rutan
function delHorn(d) {
  if (d.typ === 'kula') return [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].map((e) => lagg(d.pos, [e[0] * d.r, e[1] * d.r, e[2] * d.r]));
  const M = d.M || ID, ut = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) ut.push(lagg(M([sx * d.w / 2, sy * d.h / 2, sz * d.d / 2]), d.pos));
  return ut;
}

function ritaDelar(P, cx, cy, S, T, yaw, pitch, delar) {
  // passa in: fotavtrycket kring rotationsaxeln och höjden över alla vinklar (storleken står still när den snurrar).
  // Rutan är telefonens (bredd × 1,6, höjd × 1,35 – så räknar vy3d S); scenernas rutor är ungefär kvadratiska.
  const alla = delar.flatMap(delHorn);
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const p of alla) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[2]); z1 = Math.max(z1, p[2]); }
  const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, cp = Math.cos(pitch), sp = Math.abs(Math.sin(pitch));
  let Rmax = 0, y0 = Infinity, y1 = -Infinity;
  for (const p of alla) { const r = Math.hypot(p[0] - mx, p[2] - mz); Rmax = Math.max(Rmax, r); y0 = Math.min(y0, p[1] * cp - r * sp); y1 = Math.max(y1, p[1] * cp + r * sp); }
  const boxW = Math.max(T.bredd * 1.6, T.hojd * 1.35 * 0.9), boxH = Math.max(T.hojd * 1.35, T.bredd * 1.6 * 0.9);
  const Sk = S * Math.min((0.9 * boxW) / (2 * Rmax || 1), (0.8 * boxH) / (y1 - y0 || 1)), ym = (y0 + y1) / 2, px1 = 1 / Sk;
  const rot = rotor(yaw, pitch);
  const V = (p) => rot([p[0] - mx, p[1], p[2] - mz]);                    // modell → kamera (kring fotavtryckets mitt)
  const proj = (v) => [cx + v[0] * Sk, cy - (v[1] - ym) * Sk];
  const mask = new Uint16Array(P.w * P.h);
  let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
  const put = (x, y, c, m) => {
    const xx = x - P.ox, yy = y - P.oy;
    if (xx < 0 || yy < 0 || xx >= P.w || yy >= P.h) return;
    P.px(x, y, c); mask[yy * P.w + xx] = m;
    if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y;
  };
  const platta = (d, ord) => {
    const M = d.M || ID, Lm = (p) => V(lagg(M(p), d.pos)), N = (n) => rot(M(n));
    const R = ramp(d.farg, d.yta), dd = d.d, per = perimeterHorn(d.w, d.h, d.horn || [d.r, d.r, d.r, d.r]);
    const sidaZ = (z, sgn, fn) => {
      const uv = affin(proj(Lm([0, 0, z])), proj(Lm([1, 0, z])), proj(Lm([0, 1, z]))), b = band(shadeN(N([0, 0, sgn])), 0, 0, false);
      fillPoly(per.map((p) => proj(Lm([p[0], p[1], z]))), (x, y) => { const [u, v] = uv(x, y); put(x, y, (fn && fn(sgn > 0 ? u : -u, v, b, R, x, y, px1)) ?? R[b], ord * 4 + 1); });
    };
    const nz = N([0, 0, 1])[2];
    if (nz > 0) sidaZ(dd / 2, 1, d.fram); else if (nz < 0) sidaZ(-dd / 2, -1, d.bak);
    for (let i = 0, n = per.length; i < n; i++) {
      const a = per[i], b = per[(i + 1) % n], ex = b[0] - a[0], ey = b[1] - a[1], len = Math.hypot(ex, ey);
      if (len < 1e-6) continue;
      const nrm = N([ey / len, -ex / len, 0]); if (nrm[2] <= 0) continue;
      const v = shadeN(nrm), A1 = proj(Lm([a[0], a[1], dd / 2])), B1 = proj(Lm([b[0], b[1], dd / 2])), A2 = proj(Lm([a[0], a[1], -dd / 2]));
      const uv = d.sida ? affin(A1, B1, A2) : null;
      fillPoly([A1, B1, proj(Lm([b[0], b[1], -dd / 2])), A2], (x, y) => {
        const bb = band(v, x, y, true);
        let c = R[bb];
        if (uv) { const [t, s] = uv(x, y); c = d.sida(a[0] + ex * t, a[1] + ey * t, s, bb, R, px1) ?? c; }
        put(x, y, c, ord * 4 + 2);
      });
    }
  };
  const kula = (d, ord) => {
    const c = proj(V(d.pos)), r = d.r * Sk, R = ramp(d.farg, d.yta);
    for (let y = Math.floor(c[1] - r); y <= Math.ceil(c[1] + r); y++) for (let x = Math.floor(c[0] - r); x <= Math.ceil(c[0] + r); x++) {
      const dx = (x + 0.5 - c[0]) / r, dy = (y + 0.5 - c[1]) / r, q = dx * dx + dy * dy;
      if (q <= 1) put(x, y, R[band(shadeN([dx, -dy, Math.sqrt(1 - q)]), x, y, true)], ord * 4 + 1);
    }
  };
  // målarens algoritm: längst bort först (kameran tittar längs −z)
  const grupp = [0];   // delar i samma grupp (armbandets bitar) får ingen kontur mot varandra
  delar.map((d) => ({ d, z: V(d.pos)[2] })).sort((a, b) => a.z - b.z).forEach(({ d }, i) => { grupp[i + 1] = d.grupp ?? 'd' + i; (d.typ === 'kula' ? kula : platta)(d, i + 1); });

  // kontur: ytterkant (sel-out), kant mot en del längre bak, kant mellan yta och sida
  if (bx0 === Infinity) return null;
  const Wb = P.w, Mk = (x, y) => { const xx = x - P.ox, yy = y - P.oy; return xx < 0 || yy < 0 || xx >= Wb || yy >= P.h ? 0 : mask[yy * Wb + xx]; };
  const ut = [];
  for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
    const m = Mk(x, y); if (!m) continue;
    const gr = [Mk(x - 1, y), Mk(x + 1, y), Mk(x, y - 1), Mk(x, y + 1)];
    if (gr.some((g) => !g)) ut.push([x, y, 0]);
    else if (gr.some((g) => g >> 2 < m >> 2 && grupp[g >> 2] !== grupp[m >> 2])) ut.push([x, y, 2]);
    else if ((m & 3) === 2 && gr.some((g) => g >> 2 === m >> 2 && (g & 3) === 1)) ut.push([x, y, 1]);
  }
  for (const [x, y, k] of ut) { const c = P.get(x, y); P.px(x, y, k === 1 ? mul(c, 0.72) : k === 2 ? mix(mul(c, 0.55), SHADOW, 0.3) : mix(mul(c, 0.42), SHADOW, 0.45)); }
  return { x0: bx0 - 1, y0: by0 - 1, x1: bx1 + 1, y1: by1 + 1 };
}

// skärmarnas bakgrund: blå → lila → rosa diagonalt, i tre band med dither emellan (som 3D-skärmarnas toning)
function toning(t, x, y) { const g = t + (bayer(x, y) - 0.5) * 0.14; return g < 0.36 ? 0x2d7cf0 : g < 0.7 ? 0x6a4bd8 : 0xe05aa8; }
// ruta i ett rutnät: [kolumn, rad, fu, fv] där fu/fv är läget i rutan 0..1
const ruta = (a, cell) => { const i = Math.floor(a / cell); return [i, a / cell - i]; };

// laptop: bottenplatta med tangentbord och styrplatta, locket öppet 0,22 rad bakåt (som telefon-gl.js byggLaptop)
function laptopDelar(T) {
  const w = T.bredd, dj = T.hojd * 0.62, t = 0.05, kropp = hex(T.kropp, 0xebebee), M = rx(-0.22);
  const lc = lagg([0, t + 0.004, -dj / 2 + 0.02], M([0, dj / 2, -0.015])), tangent = mix(kropp, 0x1a1b22, 0.85);
  return [
    { typ: 'platta', w, h: dj, d: t, r: 0.06, pos: [0, t / 2, 0], M: rx(-Math.PI / 2), farg: kropp, yta: T.yta,
      // ovansidan: v växer bakåt mot gångjärnet
      fram: (u, v, b, R, x, y, px1) => {
        if (Math.abs(u) < w * 0.43 && v > -dj * 0.1 && v < dj * 0.34) {
          const cu = (w * 0.86) / 14, cv = (dj * 0.44) / 5;
          if (cu < px1 * 2.5) return tangent;                       // för litet för enskilda tangenter
          const fu = ((u + w * 0.43) / cu) % 1, fv = ((v + dj * 0.1) / cv) % 1;
          return fu * cu < px1 * 0.9 || fv * cv < px1 * 0.9 ? mul(R[b], 0.86) : tangent;
        }
        if (Math.abs(u) < w * 0.15 && v > -dj * 0.42 && v < -dj * 0.18) return Math.abs(u) > w * 0.15 - px1 || v < -dj * 0.42 + px1 || v > -dj * 0.18 - px1 ? R[Math.min(3, b + 1)] : mul(R[b], 0.93);
        return null;
      },
      bak: (u, v, b, R) => R[Math.min(3, b + 1)] },
    { typ: 'platta', w, h: dj, d: 0.03, r: 0.06, pos: lc, M, farg: kropp, yta: T.yta,
      // insidan: svart glasram, skrivbordet med två fönster och en docka, webbkameran
      fram: (u, v, b, R, x, y, px1) => {
        if (Math.abs(u) > w * 0.48 || Math.abs(v) > dj * 0.47) return null;
        const fu = (u / (w * 0.45) + 1) / 2, fv = (1 - (v - dj * 0.02) / (dj * 0.42)) / 2;
        if (fu < 0 || fu > 1 || fv < 0 || fv > 1) return Math.hypot(u, v - dj * 0.455) < Math.max(0.012, px1 * 0.5) ? 0x1a2a50 : 0x0a0c14;
        return skrivbord(fu, fv, x, y);
      },
      bak: (u, v, b, R) => marke(R[b], T, kropp, u, v, 0.045, lum(kropp) < 0.45) },
  ];
}
function skrivbord(fu, fv, x, y) {
  const bg = toning(fu * 0.6 + fv * 0.4, x, y);
  const fonster = (u0, v0, u1, v1, titel) => {
    if (fu < u0 || fu > u1 || fv < v0 || fv > v1) return null;
    if (fv < v0 + 0.09) return titel;
    const rad = Math.floor((fv - v0 - 0.09) / 0.1), ri = (fv - v0 - 0.09) / 0.1 - rad;
    return ri > 0.35 && ri < 0.75 && fu < u0 + 0.05 + (u1 - u0) * (0.35 + ((rad * 37) % 50) / 100) && fu > u0 + 0.05 ? 0xc8ccd8 : 0xf4f4f8;
  };
  const f2 = fonster(0.45, 0.3, 0.9, 0.74, 0x45b964); if (f2) return f2;
  const f1 = fonster(0.08, 0.13, 0.5, 0.62, 0x3a7bd5); if (f1) return f1;
  if (fv > 0.84 && fv < 0.96 && fu > 0.22 && fu < 0.78) { const [i, f] = ruta(fu - 0.24, 0.075); return i >= 0 && i < 7 && f > 0.2 && f < 0.8 && fv > 0.86 && fv < 0.94 ? IKONER[i % IKONER.length] : mix(bg, 0xffffff, 0.3); }
  return fv < 0.05 ? mix(bg, 0xffffff, 0.22) : bg;
}

// smartklocka: boetten med ringarna på skärmen och ett armband som går runt bakåt (som byggKlocka)
function klockDelar(T) {
  const w = T.bredd, h = T.hojd, d = T.djup, kropp = hex(T.kropp, 0xebebee), rad = Math.min(T.radie + 0.05, w / 2 - 0.01);
  const STAL = 0xd8dce4, bandF = mix(kropp, 0x1a1b22, 0.45), sw = w - 0.06, sh = h - 0.06;
  const delar = [
    { typ: 'platta', w, h, d, r: rad, pos: [0, 0, 0], farg: kropp, yta: T.yta,
      fram: (u, v, b, R, x, y, px1) => {
        const sd = sdRect(u, v, sw / 2, sh / 2, Math.max(0.02, rad - 0.03));
        if (sd >= 0) return null;
        const rr = Math.hypot(u, v) / (Math.min(sw, sh) / 2), vinkel = (Math.atan2(u, v) / (2 * Math.PI) + 1) % 1;   // 0 = uppe, medsols
        for (const [r0, f, andel] of [[0.8, 0xff4060, 0.78], [0.6, 0x7ee03a, 0.6], [0.4, 0x4ff0ff, 0.45]]) if (Math.abs(rr - r0) < Math.max(0.08, px1 * 0.55 / (sw / 2))) return vinkel < andel ? f : 0x2a2c36;
        return 0x05060c;
      },
      bak: (u, v, b, R, x, y, px1) => { const s = Math.hypot(u, v); return s < w * 0.3 ? (s > w * 0.3 - px1 ? 0x2a2c36 : 0x15161c) : null; } },
    { typ: 'platta', w: 0.06, h: 0.06, d: 0.04, r: 0.02, pos: [w / 2 + 0.02, 0.07, 0], M: ry(Math.PI / 2), farg: STAL, yta: 'klassisk' },
  ];
  // armbandet: korta raka bitar längs samma kurva som i 3D (ut ur boettens över- och underkant och runt bakåt)
  const Rv = h / 2 + 0.1, B = 0.32, zc = -d / 2 - 0.2, bw = w * 0.8, bt = 0.034;
  const pts = [[h / 2 - 0.05, -d * 0.05], [h / 2 + 0.03, -d * 0.35]];
  for (const g of [75, 105, 135, 180, 225, 255, 285]) { const a = (g * Math.PI) / 180; pts.push([Rv * Math.sin(a), zc + B * Math.cos(a)]); }
  pts.push([-h / 2 - 0.03, -d * 0.35], [-h / 2 + 0.05, -d * 0.05]);
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ya, za] = pts[i], [yb, zb] = pts[i + 1], len = Math.hypot(yb - ya, zb - za);
    delar.push({ typ: 'platta', w: bw, h: len + bt * 0.8, d: bt, r: 0.012, pos: [0, (ya + yb) / 2, (za + zb) / 2], M: rx(Math.atan2(zb - za, yb - ya)), farg: bandF, yta: 'matt', grupp: 'band' });
  }
  delar.push({ typ: 'platta', w: bw * 1.12, h: 0.07, d: 0.022, r: 0.012, pos: [0, 0, zc - B - 0.02], farg: STAL, yta: 'klassisk' });
  return delar;
}

// trådlösa hörlurar: fodralet (lockets skarv och lampan fram) och två lurar bredvid (som byggHorlurar)
function horlurDelar(T) {
  const w = T.bredd, h = T.hojd * 0.68, d = T.djup, kropp = hex(T.kropp, 0xebebee), hb = h * 0.68;
  const skarv = (lv, px1) => Math.abs(lv + h / 2 - hb) < px1 * 0.6;
  const delar = [{ typ: 'platta', w, h, d, r: Math.min(0.12, h * 0.28), pos: [0, h / 2, 0], farg: kropp, yta: T.yta,
    fram: (u, v, b, R, x, y, px1) => (skarv(v, px1) ? R[3] : Math.hypot(u, v + h / 2 - hb * 0.55) < Math.max(0.014, px1 * 0.6) ? 0x45f080 : null),
    bak: (u, v, b, R, x, y, px1) => (skarv(v, px1) ? R[3] : null),
    sida: (lu, lv, s, b, R, px1) => (skarv(lv, px1) ? R[3] : null) }];
  const tips = mix(kropp, 0x9aa0b0, 0.35);
  for (const sx of [-1, 1]) {
    const M = ry(sx * 0.5), at = (p) => lagg(M(p), [sx * (w / 2 + 0.17), 0, d * 0.4]);
    delar.push({ typ: 'platta', w: 0.052, h: 0.202, d: 0.052, r: 0.026, pos: at([0, 0.101, 0]), M, farg: kropp, yta: T.yta });
    delar.push({ typ: 'kula', pos: at([sx * 0.02, 0.24, 0]), r: 0.078, farg: kropp, yta: T.yta });
    delar.push({ typ: 'kula', pos: at([-sx * 0.066, 0.25, 0.018]), r: 0.048, farg: tips, yta: 'matt' });
  }
  return delar;
}

// vikbar telefon, nästan helt uppvikt som en bok på högkant: innerskärmen över båda halvorna, täckskärmen
// på vänstra halvans baksida, kamerorna och märket på den högra (som byggVikbar)
function vikDelar(T) {
  const w = T.bredd, h = T.hojd, pd = T.djup / 2, g0 = 0.004, r = Math.min(T.radie, w / 2, h / 2);
  const kropp = hex(T.kropp, 0xebebee), glas = hex(T.glas, 0x1d2a44), kam = hex(T.kamera, 0x3a6bc2), mork = lum(kropp) < 0.45;
  const a = (Math.PI - 0.84 * Math.PI) / 2, ri = Math.max(0.012, Math.min(T.ram, 0.03)), cr = 0.035;
  const halva = (sida) => {
    const M = ry(-sida * a);
    return { typ: 'platta', w, h, d: pd, horn: sida < 0 ? [0, r, r, 0] : [r, 0, 0, r], pos: M([sida * w / 2, 0, -g0 - pd / 2]), M, farg: kropp, yta: T.yta,
      fram: (u, v, b, R, x, y, px1) => {
        const gu = u + sida * w / 2;                                 // över hela innerskärmen: −w … w
        if (Math.abs(gu) > w - ri || Math.abs(v) > h / 2 - ri) return null;
        if (Math.abs(gu) > w - ri - px1 || Math.abs(v) > h / 2 - ri - px1) return 0x05070f;
        const c = vikSkarm((gu + w) / (2 * w), (h / 2 - v) / h, (2 * w) / h, x, y);
        return Math.abs(gu) < px1 * 0.8 ? mix(c, 0x0a0c1e, 0.35) : c;   // vecket
      },
      bak: sida < 0
        ? (u, v, b, R, x, y, px1) => {
          // täckskärmen: mörkt glas med appikoner och frontkameran
          const cTop = h / 2 - cr - 0.07, cBot = -h / 2 + 2 * cr, sd = sdRect(u, v - (cTop + cBot) / 2, w / 2 - cr, (cTop - cBot) / 2, Math.max(0.01, r - cr));
          if (Math.hypot(u, v - (h / 2 - cr - 0.035)) < Math.max(0.014, px1 * 0.5)) return mul(glas, 0.5);
          if (sd >= 0) return null;
          if (sd > -px1) return mul(glas, 0.45);
          const cell = (w - 2 * cr) / 4, [i, fu] = ruta(u + w / 2 - cr, cell), [j, fv] = ruta(cTop - 0.06 - v, cell);
          return j >= 0 && j < 5 && fu > 0.18 && fu < 0.82 && fv > 0.18 && fv < 0.82 ? IKONER[(i + j * 3) % IKONER.length] : glas;
        }
        : (u, v, b, R, x, y, px1) => bakDekal(R[b], T, kropp, kam, u, v, w / 2, h / 2, px1, b, mork) };
  };
  return [halva(-1), halva(1), { typ: 'platta', w: 0.05, h: h * 0.97, d: 0.05, r: 0.024, pos: [0, 0, -(g0 + pd) / 2], farg: 0x2a2c34, yta: 'klassisk' }];
}
// innerskärmen (fu, fv 0..1, asp = bredd/höjd): statusrad, klockwidget, sex kolumner appar och en docka
function vikSkarm(fu, fv, asp, x, y) {
  const bg = toning(fu * 0.6 + fv * 0.4, x, y), cellU = 1 / 6, cellV = cellU * asp;
  if (fv < 0.035) return mix(bg, 0xffffff, 0.22);
  if (fv > 0.86 && fv < 0.97 && fu > 0.1 && fu < 0.9) { const [i, f] = ruta(fu - 0.1, 0.8 / 6); return f > 0.22 && f < 0.78 && fv > 0.88 && fv < 0.95 ? IKONER[(i + 3) % IKONER.length] : mix(bg, 0xffffff, 0.25); }
  const [i, f] = ruta(fu, cellU), [j, g] = ruta(fv - 0.05, cellV);
  if (j < 0 || fv > 0.84) return bg;
  if (i < 3 && j < 2) { const wu = fu / (3 * cellU), wv = (fv - 0.05) / (2 * cellV); return wu > 0.06 && wu < 0.94 && wv > 0.06 && wv < 0.94 ? (wu > 0.15 && wu < 0.6 && wv > 0.25 && wv < 0.55 ? 0xffffff : mix(bg, 0xffffff, 0.22)) : bg; }
  return f > 0.2 && f < 0.8 && g > 0.2 && g < 0.8 ? IKONER[(i + j * 5) % IKONER.length] : bg;
}
const DELAR = { laptop: laptopDelar, klocka: klockDelar, horlurar: horlurDelar, vikbar: vikDelar };

// slagskugga på vridbordet
export function ritaSkugga(P, cx, cy, rx, ry, a = 0.5) { P.ell(cx, cy, rx, ry, SHADOW, a, 3); }
