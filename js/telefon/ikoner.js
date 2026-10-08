// Ikonsvit till telefonens hemskärm – vektor i canvas 2D (inga bilder, inga beroenden).
// Känslan: en modern smartphone (rundade plattor, mjuka gradienter, vita symboler) men varje
// symbol är en egen tolkning – man känner igen vad appen gör utan att det är någon känd ikon.
//
//   ritaIkon(ctx, 'musik', x, y, s, { skugga: true })   – övre vänstra hörnet i (x, y), sidan s px
//   ritaIkonark(canvas, 6, 96)                           – alla ikoner i ett rutnät (kontroll)
//
// Allt ritas i ett enhetsrum 0..1 (ctx skalas med s) så samma kod fungerar i 28 px och 96 px.
// Marginal ~18 % av s: symbolerna håller sig inom 0.18..0.82.

export const IKONER = [
  { id: 'meddelanden',  namn: 'Meddelanden',  farg: '#38c45e' },
  { id: 'telefon',      namn: 'Telefon',      farg: '#19b38a' },
  { id: 'mejl',         namn: 'Mejl',         farg: '#4f8cff' },
  { id: 'webb',         namn: 'Webb',         farg: '#22b8d8' },
  { id: 'kartor',       namn: 'Kartor',       farg: '#e6dcbd' },
  { id: 'bilder',       namn: 'Bilder',       farg: '#f3f4f8' },
  { id: 'kamera',       namn: 'Kamera',       farg: '#4b5058' },
  { id: 'musik',        namn: 'Musik',        farg: '#f3456f' },
  { id: 'kalender',     namn: 'Kalender',     farg: '#f6f6f9' },
  { id: 'vader',        namn: 'Väder',        farg: '#4ba3ff' },
  { id: 'klocka',       namn: 'Klocka',       farg: '#2d323c' },
  { id: 'kalkylator',   namn: 'Kalkylator',   farg: '#353a44' },
  { id: 'installningar', namn: 'Inställningar', farg: '#8a919e' },
  { id: 'anteckningar', namn: 'Anteckningar', farg: '#ffcf3f' },
  { id: 'appbutik',     namn: 'Appbutik',     farg: '#1f6fe0' },
  { id: 'spel',         namn: 'Spel',         farg: '#8a4df0' },
  { id: 'planbok',      namn: 'Plånbok',      farg: '#2a2d36' },
  { id: 'halsa',        namn: 'Hälsa',        farg: '#f7f7fa' },
  { id: 'klipp',        namn: 'Klipp',        farg: '#3a2d6e' },
  { id: 'podd',         namn: 'Podd',         farg: '#a04ce8' },
  { id: 'kompass',      namn: 'Kompass',      farg: '#1f6d7c' },
  { id: 'rostmemo',     namn: 'Röstmemo',     farg: '#ee3f4d' },
  { id: 'vackarklocka', namn: 'Väckarklocka', farg: '#ff9630' },
  { id: 'filer',        namn: 'Filer',        farg: '#2fa0f5' },
];

const BY_ID = Object.fromEntries(IKONER.map((ik) => [ik.id, ik]));
const VIT = '#ffffff';
const TAU = Math.PI * 2;

// ---- små hjälpare (enhetsrum) -------------------------------------------------------------

function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
// k > 0: mot vitt, k < 0: mot svart
function ton(h, k) {
  const f = (c) => Math.round(k >= 0 ? c + (255 - c) * k : c * (1 + k));
  const [r, g, b] = hexRgb(h);
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function cirkel(ctx, cx, cy, r) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); }
function fyll(ctx, farg) { ctx.fillStyle = farg; ctx.fill(); }
function linje(ctx, pts, farg, w) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = farg; ctx.lineWidth = w; ctx.stroke();
}
function pratbubbla(ctx, x, y, w, h, r, svans) {
  // svans: 'hv' = höger nere, 'vn' = vänster nere
  rr(ctx, x, y, w, h, r); ctx.fill();
  if (!svans) return;
  ctx.beginPath();
  if (svans === 'hv') { ctx.moveTo(x + w * 0.60, y + h - 0.01); ctx.lineTo(x + w * 0.80, y + h + 0.13); ctx.lineTo(x + w * 0.86, y + h - 0.01); }
  else { ctx.moveTo(x + w * 0.14, y + h - 0.01); ctx.lineTo(x + w * 0.02, y + h + 0.12); ctx.lineTo(x + w * 0.36, y + h - 0.01); }
  ctx.closePath(); ctx.fill();
}
function kugghjul(ctx, cx, cy, R, r, n) {
  const w = TAU / n, topp = w * 0.40, rot = w * 0.52;
  const p = (a, rad) => [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = i * w - Math.PI / 2;
    const [x1, y1] = p(a - rot / 2, r), [x2, y2] = p(a - topp / 2, R), [x3, y3] = p(a + topp / 2, R), [x4, y4] = p(a + rot / 2, r);
    if (i === 0) ctx.moveTo(x1, y1); else ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.lineTo(x4, y4);
    ctx.arc(cx, cy, r, a + rot / 2, a + w - rot / 2);
  }
  ctx.closePath();
}
function hjarta(ctx, cx, cy, k) {
  // k = bredd ungefär; hjärtat sitter med spetsen nedåt
  const x = (u) => cx + (u - 0.5) * k, y = (u) => cy + (u - 0.5) * k;
  ctx.beginPath();
  ctx.moveTo(x(0.5), y(0.86));
  ctx.bezierCurveTo(x(0.5), y(0.86), x(0.06), y(0.58), x(0.06), y(0.34));
  ctx.bezierCurveTo(x(0.06), y(0.18), x(0.18), y(0.08), x(0.31), y(0.08));
  ctx.bezierCurveTo(x(0.41), y(0.08), x(0.5), y(0.18), x(0.5), y(0.25));
  ctx.bezierCurveTo(x(0.5), y(0.18), x(0.59), y(0.08), x(0.69), y(0.08));
  ctx.bezierCurveTo(x(0.82), y(0.08), x(0.94), y(0.18), x(0.94), y(0.34));
  ctx.bezierCurveTo(x(0.94), y(0.58), x(0.5), y(0.86), x(0.5), y(0.86));
  ctx.closePath();
}

// ---- symbolerna ----------------------------------------------------------------------------
// Varje ritare får (ctx, g, ik, alternativ, s) där g är plattans gradient (för "urskärningar").

const RITARE = {
  // Två bubblor i samtal: den främre är en rundad ruta med svansen nere till HÖGER (inte en
  // ellips med svansen till vänster), den bakre skymtar genomskinlig uppe till vänster.
  meddelanden(ctx, g) {
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    pratbubbla(ctx, 0.17, 0.18, 0.44, 0.30, 0.10, null);
    ctx.fillStyle = VIT;
    pratbubbla(ctx, 0.31, 0.37, 0.52, 0.34, 0.11, 'hv');
    linje(ctx, [[0.40, 0.48], [0.74, 0.48]], g, 0.05);
    linje(ctx, [[0.40, 0.59], [0.62, 0.59]], g, 0.05);
  },

  // Bordstelefon från sidan: luren (∩ med öron-/munstycke) vilar ovanpå en liten fot –
  // inte den diagonala luren. Foten är det som gör att formen läses som telefon även i 28 px.
  telefon(ctx) {
    ctx.strokeStyle = VIT; ctx.lineWidth = 0.11; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0.5, 0.60, 0.27, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke();
    const platta = (cx, cy, rot) => { ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); rr(ctx, -0.13, -0.075, 0.26, 0.15, 0.07); fyll(ctx, VIT); ctx.restore(); };
    platta(0.235, 0.525, -0.38);
    platta(0.765, 0.525, 0.38);
    ctx.beginPath();
    ctx.moveTo(0.33, 0.64); ctx.lineTo(0.67, 0.64);
    ctx.arcTo(0.86, 0.84, 0.17, 0.84, 0.05); ctx.lineTo(0.22, 0.84);
    ctx.arcTo(0.14, 0.84, 0.33, 0.64, 0.05); ctx.closePath();
    fyll(ctx, VIT);
  },

  // Kuvert med låg flik och ett litet sigill i spetsen.
  mejl(ctx, g) {
    rr(ctx, 0.17, 0.27, 0.66, 0.48, 0.07); fyll(ctx, VIT);
    ctx.strokeStyle = g; ctx.lineWidth = 0.06; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(0.19, 0.31); ctx.lineTo(0.5, 0.56); ctx.lineTo(0.81, 0.31); ctx.stroke();
    cirkel(ctx, 0.5, 0.57, 0.065); fyll(ctx, '#ffcf3f');
  },

  // Jordglob: vit skiva med meridian och breddgrader urskurna.
  webb(ctx, g) {
    cirkel(ctx, 0.5, 0.5, 0.31); fyll(ctx, VIT);
    ctx.strokeStyle = g; ctx.lineWidth = 0.055;
    ctx.beginPath(); ctx.ellipse(0.5, 0.5, 0.135, 0.31, 0, 0, TAU); ctx.stroke();
    linje(ctx, [[0.19, 0.5], [0.81, 0.5]], g, 0.055);
    linje(ctx, [[0.245, 0.34], [0.755, 0.34]], g, 0.045);
    linje(ctx, [[0.245, 0.66], [0.755, 0.66]], g, 0.045);
  },

  // Karta: beige mark, grön park, blått vatten, en vit S-väg med gul mittlinje.
  kartor(ctx) {
    cirkel(ctx, 0.16, 0.18, 0.34); fyll(ctx, '#86cf7c');
    cirkel(ctx, 0.98, 0.92, 0.32); fyll(ctx, '#74c3f2');
    ctx.strokeStyle = VIT; ctx.lineWidth = 0.15; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0.06, 0.80); ctx.bezierCurveTo(0.50, 0.80, 0.50, 0.22, 0.94, 0.22); ctx.stroke();
    ctx.strokeStyle = '#f2b531'; ctx.lineWidth = 0.035; ctx.setLineDash([0.07, 0.06]);
    ctx.beginPath(); ctx.moveTo(0.06, 0.80); ctx.bezierCurveTo(0.50, 0.80, 0.50, 0.22, 0.94, 0.22); ctx.stroke();
    ctx.setLineDash([]);
  },

  // Blomma av sex överlappande runda kronblad i regnbågens färger (multiply) – ingen pinwheel.
  bilder(ctx) {
    const farger = ['#ff4d5a', '#ff9a1f', '#ffd400', '#3fcf6e', '#2f7dff', '#b24bff'];
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + i * TAU / 6;
      cirkel(ctx, 0.5 + Math.cos(a) * 0.165, 0.5 + Math.sin(a) * 0.165, 0.165); fyll(ctx, farger[i]);
    }
    ctx.restore();
    cirkel(ctx, 0.5, 0.5, 0.075); fyll(ctx, VIT);
  },

  // Kamerahus med sökarpuckel till vänster och koncentrisk lins.
  kamera(ctx, g) {
    rr(ctx, 0.28, 0.24, 0.22, 0.14, 0.05); fyll(ctx, VIT);
    rr(ctx, 0.17, 0.32, 0.66, 0.46, 0.09); fyll(ctx, VIT);
    cirkel(ctx, 0.56, 0.55, 0.165); fyll(ctx, g);
    cirkel(ctx, 0.56, 0.55, 0.105); fyll(ctx, VIT);
    cirkel(ctx, 0.56, 0.55, 0.055); fyll(ctx, g);
    cirkel(ctx, 0.75, 0.41, 0.035); fyll(ctx, g);
  },

  // En enkel åttondelsnot med rund flagga (ingen dubbelbalk).
  musik(ctx) {
    ctx.save(); ctx.translate(0.41, 0.69); ctx.rotate(-0.35);
    ctx.beginPath(); ctx.ellipse(0, 0, 0.135, 0.095, 0, 0, TAU); fyll(ctx, VIT); ctx.restore();
    linje(ctx, [[0.515, 0.66], [0.515, 0.23]], VIT, 0.07);
    ctx.beginPath();
    ctx.moveTo(0.515, 0.21);
    ctx.bezierCurveTo(0.66, 0.26, 0.82, 0.38, 0.68, 0.60);
    ctx.bezierCurveTo(0.74, 0.42, 0.62, 0.38, 0.515, 0.37);
    ctx.closePath(); fyll(ctx, VIT);
  },

  // Blockkalender: röd topp med två ringar, dagens datum stort.
  kalender(ctx, g, ik, alternativ, s) {
    ctx.fillStyle = '#ef4a3c'; ctx.fillRect(0, 0, 1, 0.30);
    ctx.fillStyle = '#ff7a6b'; ctx.fillRect(0, 0, 1, 0.05);
    cirkel(ctx, 0.31, 0.15, 0.05); fyll(ctx, VIT);
    cirkel(ctx, 0.69, 0.15, 0.05); fyll(ctx, VIT);
    const dag = alternativ.kalenderdag ?? String(new Date().getDate());
    ctx.save(); ctx.scale(1 / s, 1 / s);
    ctx.fillStyle = '#1e2130'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `bold ${s * 0.46}px -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
    ctx.fillText(dag, s * 0.5, s * 0.665);
    ctx.restore();
  },

  // Sol med korta strålar bakom ett moln.
  vader(ctx) {
    ctx.strokeStyle = '#ffd33d'; ctx.lineWidth = 0.065; ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8 + Math.PI / 8;
      linje(ctx, [[0.37 + Math.cos(a) * 0.215, 0.40 + Math.sin(a) * 0.215], [0.37 + Math.cos(a) * 0.29, 0.40 + Math.sin(a) * 0.29]], '#ffd33d', 0.065);
    }
    cirkel(ctx, 0.37, 0.40, 0.165); fyll(ctx, '#ffd33d');
    rr(ctx, 0.38, 0.60, 0.50, 0.20, 0.10); fyll(ctx, VIT);
    cirkel(ctx, 0.53, 0.60, 0.14); fyll(ctx, VIT);
    cirkel(ctx, 0.68, 0.55, 0.17); fyll(ctx, VIT);
  },

  // Vit urtavla på mörk platta, fyra markeringar, visare på "tio i ett", röd mittpunkt.
  klocka(ctx, g) {
    cirkel(ctx, 0.5, 0.5, 0.31); fyll(ctx, VIT);
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2;
      linje(ctx, [[0.5 + Math.cos(a) * 0.235, 0.5 + Math.sin(a) * 0.235], [0.5 + Math.cos(a) * 0.275, 0.5 + Math.sin(a) * 0.275]], '#2d323c', 0.045);
    }
    linje(ctx, [[0.5, 0.5], [0.5 + 0.5 * 0.17, 0.5 - 0.866 * 0.17]], '#2d323c', 0.07);   // timvisare mot 1
    linje(ctx, [[0.5, 0.5], [0.5 - 0.25, 0.5]], '#2d323c', 0.06);                        // minutvisare mot 9
    cirkel(ctx, 0.5, 0.5, 0.05); fyll(ctx, '#ef4a3c');
  },

  // Räknare: vit display, tre kolumner knappar där högerkolumnen är en hög orange tangent.
  kalkylator(ctx) {
    rr(ctx, 0.20, 0.19, 0.60, 0.15, 0.045); fyll(ctx, VIT);
    const k = (x, y, w, h, farg) => { rr(ctx, x, y, w, h, 0.045); fyll(ctx, farg); };
    k(0.20, 0.41, 0.17, 0.17, 'rgba(255,255,255,0.88)'); k(0.415, 0.41, 0.17, 0.17, 'rgba(255,255,255,0.88)');
    k(0.20, 0.63, 0.17, 0.17, 'rgba(255,255,255,0.88)'); k(0.415, 0.63, 0.17, 0.17, 'rgba(255,255,255,0.88)');
    k(0.63, 0.41, 0.17, 0.39, '#ff9a2e');
  },

  // Sju rejäla kuggar och ett urskuret nav.
  installningar(ctx, g) {
    kugghjul(ctx, 0.5, 0.5, 0.34, 0.25, 7); fyll(ctx, VIT);
    cirkel(ctx, 0.5, 0.5, 0.105); fyll(ctx, g);
  },

  // Ett vitt blad med vikt hörn och tre gula rader.
  anteckningar(ctx) {
    const x = 0.22, y = 0.17, w = 0.56, h = 0.66, v = 0.16, r = 0.05;
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.lineTo(x + w, y + h - v); ctx.lineTo(x + w - v, y + h);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    fyll(ctx, VIT);
    ctx.beginPath(); ctx.moveTo(x + w, y + h - v); ctx.lineTo(x + w - v, y + h); ctx.lineTo(x + w - v, y + h - v); ctx.closePath();
    fyll(ctx, '#f2c23d');
    ctx.lineCap = 'round';
    linje(ctx, [[0.32, 0.36], [0.68, 0.36]], '#f2b531', 0.05);
    linje(ctx, [[0.32, 0.48], [0.68, 0.48]], '#f2b531', 0.05);
    linje(ctx, [[0.32, 0.60], [0.56, 0.60]], '#f2b531', 0.05);
  },

  // Shoppingkasse med fyra app-rutor på.
  appbutik(ctx, g) {
    ctx.strokeStyle = VIT; ctx.lineWidth = 0.065; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0.5, 0.41, 0.15, Math.PI, TAU); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0.26, 0.38); ctx.lineTo(0.74, 0.38); ctx.lineTo(0.79, 0.76);
    ctx.arcTo(0.79, 0.83, 0.72, 0.83, 0.07); ctx.lineTo(0.28, 0.83);
    ctx.arcTo(0.21, 0.83, 0.21, 0.76, 0.07); ctx.closePath();
    fyll(ctx, VIT);
    for (const [x, y] of [[0.345, 0.46], [0.525, 0.46], [0.345, 0.64], [0.525, 0.64]]) { rr(ctx, x, y, 0.13, 0.13, 0.03); fyll(ctx, g); }
  },

  // Handkontroll: bred kropp med två grepp, styrkors till vänster, två knappar till höger.
  spel(ctx, g) {
    rr(ctx, 0.14, 0.34, 0.72, 0.32, 0.16); fyll(ctx, VIT);
    cirkel(ctx, 0.28, 0.64, 0.14); fyll(ctx, VIT);
    cirkel(ctx, 0.72, 0.64, 0.14); fyll(ctx, VIT);
    rr(ctx, 0.22, 0.47, 0.16, 0.06, 0.02); fyll(ctx, g);
    rr(ctx, 0.27, 0.42, 0.06, 0.16, 0.02); fyll(ctx, g);
    cirkel(ctx, 0.66, 0.46, 0.045); fyll(ctx, g);
    cirkel(ctx, 0.74, 0.54, 0.045); fyll(ctx, g);
  },

  // Ljus plånbok med mörk tryckknapp och två kort som sticker upp.
  planbok(ctx, g) {
    rr(ctx, 0.22, 0.18, 0.46, 0.30, 0.05); fyll(ctx, '#ffb13b');
    rr(ctx, 0.32, 0.26, 0.46, 0.30, 0.05); fyll(ctx, '#3dd6c8');
    rr(ctx, 0.17, 0.42, 0.66, 0.40, 0.08); fyll(ctx, '#d3d8e3');
    rr(ctx, 0.17, 0.42, 0.66, 0.16, 0.06); fyll(ctx, VIT);
    ctx.fillStyle = VIT; ctx.fillRect(0.17, 0.50, 0.66, 0.08);
    rr(ctx, 0.60, 0.59, 0.23, 0.14, 0.05); fyll(ctx, '#aab2c2');
    cirkel(ctx, 0.715, 0.66, 0.05); fyll(ctx, g);
  },

  // Hjärta med en vit pulslinje tvärs igenom.
  halsa(ctx) {
    const hg = ctx.createLinearGradient(0, 0.2, 0, 0.85); hg.addColorStop(0, '#ff6f7a'); hg.addColorStop(1, '#e8203f');
    hjarta(ctx, 0.5, 0.5, 0.72); fyll(ctx, hg);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    linje(ctx, [[0.25, 0.50], [0.40, 0.50], [0.45, 0.40], [0.52, 0.62], [0.57, 0.50], [0.75, 0.50]], VIT, 0.055);
  },

  // Klappa: vit tavla, lutad klaff med mörka ränder.
  klipp(ctx, g) {
    rr(ctx, 0.17, 0.46, 0.66, 0.34, 0.05); fyll(ctx, VIT);
    ctx.save(); ctx.translate(0.17, 0.46); ctx.rotate(-0.24);
    rr(ctx, 0, -0.15, 0.66, 0.15, 0.04); fyll(ctx, VIT);
    ctx.fillStyle = g;
    for (let i = 0; i < 3; i++) ctx.fillRect(0.10 + i * 0.19, -0.15, 0.08, 0.15);
    ctx.restore();
    cirkel(ctx, 0.26, 0.63, 0.04); fyll(ctx, g);
  },

  // Studiomikrofon i bygel med stativ.
  podd(ctx) {
    rr(ctx, 0.40, 0.18, 0.20, 0.36, 0.10); fyll(ctx, VIT);
    ctx.strokeStyle = VIT; ctx.lineWidth = 0.06; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0.5, 0.45, 0.17, 0, Math.PI); ctx.stroke();
    linje(ctx, [[0.5, 0.62], [0.5, 0.76]], VIT, 0.06);
    linje(ctx, [[0.38, 0.79], [0.62, 0.79]], VIT, 0.06);
  },

  // Kompassros: vit ring, nålen pekar nord-nordväst, fyra små punkter för väderstrecken.
  kompass(ctx, g) {
    ctx.strokeStyle = VIT; ctx.lineWidth = 0.06;
    cirkel(ctx, 0.5, 0.5, 0.30); ctx.stroke();
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; cirkel(ctx, 0.5 + Math.cos(a) * 0.30, 0.5 + Math.sin(a) * 0.30, 0.045); fyll(ctx, VIT); }
    ctx.save(); ctx.translate(0.5, 0.5); ctx.rotate(-0.42);
    ctx.beginPath(); ctx.moveTo(0, -0.24); ctx.lineTo(0.085, 0); ctx.lineTo(-0.085, 0); ctx.closePath(); fyll(ctx, '#ff4b4b');
    ctx.beginPath(); ctx.moveTo(0, 0.24); ctx.lineTo(0.085, 0); ctx.lineTo(-0.085, 0); ctx.closePath(); fyll(ctx, VIT);
    cirkel(ctx, 0, 0, 0.035); fyll(ctx, g);
    ctx.restore();
  },

  // Fem vita vågstaplar på röd platta (inte rött på svart).
  rostmemo(ctx) {
    ctx.lineCap = 'round';
    const h = [0.22, 0.44, 0.62, 0.36, 0.20];
    for (let i = 0; i < 5; i++) { const x = 0.20 + i * 0.15; linje(ctx, [[x, 0.5 - h[i] / 2], [x, 0.5 + h[i] / 2]], VIT, 0.08); }
  },

  // Ringklocka: tavla, två klockor uppe, fötter, visare på sju.
  vackarklocka(ctx, g) {
    ctx.lineCap = 'round';
    linje(ctx, [[0.35, 0.76], [0.27, 0.86]], VIT, 0.065);
    linje(ctx, [[0.65, 0.76], [0.73, 0.86]], VIT, 0.065);
    cirkel(ctx, 0.28, 0.28, 0.095); fyll(ctx, VIT);
    cirkel(ctx, 0.72, 0.28, 0.095); fyll(ctx, VIT);
    cirkel(ctx, 0.5, 0.54, 0.275); fyll(ctx, g);
    cirkel(ctx, 0.5, 0.54, 0.235); fyll(ctx, VIT);
    linje(ctx, [[0.5, 0.54], [0.5, 0.34]], g, 0.075);
    linje(ctx, [[0.5, 0.54], [0.5 - 0.5 * 0.15, 0.54 + 0.866 * 0.15]], g, 0.075);
    cirkel(ctx, 0.5, 0.54, 0.045); fyll(ctx, g);
  },

  // Gul mapp med en vit sida som sticker upp.
  filer(ctx) {
    rr(ctx, 0.17, 0.25, 0.28, 0.14, 0.04); fyll(ctx, '#ffd55a');
    rr(ctx, 0.42, 0.21, 0.34, 0.24, 0.03); fyll(ctx, VIT);
    rr(ctx, 0.17, 0.33, 0.66, 0.46, 0.06); fyll(ctx, '#ffcf3f');
    rr(ctx, 0.17, 0.45, 0.66, 0.34, 0.06); fyll(ctx, '#ffe07a');
  },
};

// ---- API -----------------------------------------------------------------------------------

export function ritaIkon(ctx, id, x, y, s, alternativ = {}) {
  const ik = BY_ID[id];
  if (!ik) throw new Error('okänd ikon: ' + id);
  const R = 0.22;
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  const g = ctx.createLinearGradient(0, 0, 0, 1);
  g.addColorStop(0, ton(ik.farg, 0.22));
  g.addColorStop(1, ton(ik.farg, -0.12));
  if (alternativ.skugga) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.38)'; ctx.shadowBlur = 0.10 * s; ctx.shadowOffsetY = 0.05 * s;
    rr(ctx, 0, 0, 1, 1, R); fyll(ctx, ik.farg);
    ctx.restore();
  }
  rr(ctx, 0, 0, 1, 1, R); fyll(ctx, g);
  ctx.save();
  rr(ctx, 0, 0, 1, 1, R); ctx.clip();
  RITARE[id](ctx, g, ik, alternativ, s);
  // tunn glans längs överkanten
  ctx.beginPath(); ctx.rect(0, 0, 1, 0.5); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 0.035;
  rr(ctx, 0.0175, 0.0175, 0.965, 0.965, R - 0.0175); ctx.stroke();
  ctx.restore();
  ctx.restore();
}

export function ritaIkonark(canvas, kolumner = 6, s = 96, bakgrund = '#0b0e1c') {
  const gap = Math.round(s * 0.35), etikett = s >= 48 ? Math.round(s * 0.28) : 0;
  const rader = Math.ceil(IKONER.length / kolumner);
  canvas.width = gap + kolumner * (s + gap);
  canvas.height = gap + rader * (s + gap + etikett);
  const ctx = canvas.getContext('2d');
  if (bakgrund) { ctx.fillStyle = bakgrund; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  else ctx.clearRect(0, 0, canvas.width, canvas.height);
  IKONER.forEach((ik, i) => {
    const x = gap + (i % kolumner) * (s + gap), y = gap + Math.floor(i / kolumner) * (s + gap + etikett);
    ritaIkon(ctx, ik.id, x, y, s, { skugga: true });
    if (etikett) {
      ctx.fillStyle = '#9aa3b8'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.font = `${Math.round(s * 0.13)}px system-ui, sans-serif`;
      ctx.fillText(ik.namn, x + s / 2, y + s + Math.round(s * 0.08));
    }
  });
  return ctx;
}
