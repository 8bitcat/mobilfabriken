// telefon-gl.js — telefonen i riktig realtids-3D (three.js, global THREE från cdnjs) som efterliknar
// förlagans blanka produktbild: mjuk studioljussättning, clearcoat-glans, lysande skärm, blå podiumskiva,
// cyan/magenta-neon som speglar sig i kroppen. Samma parametrar som pixelversionen (STANDARD, YTOR, VYER).
import { IKONER, ritaIkon } from './ikoner.js';
export const YTOR = [['klassisk', 'KLASSISK'], ['matt', 'MJUK MATT'], ['kolfiber', 'KOLFIBER'], ['borstad', 'BORSTAD METALL']];
export const VYER = { fram: [0, 0.22], bak: [Math.PI, 0.22], sida: [Math.PI / 2, 0.22], under: [0.3, -1.1] };
export const STANDARD = {
  bredd: 0.72, hojd: 1.5, djup: 0.11, radie: 0.12, ram: 0.06, haka: 0.16,
  kameraStorlek: 0.2, kameror: 1, kropp: '#ebebee', glas: '#1d2a44', kamera: '#3a6bc2', marke: 'M', yta: 'klassisk',
};
const lum = (hex) => { const c = parseInt(hex.slice(1), 16); return (((c >> 16) & 255) * 0.3 + ((c >> 8) & 255) * 0.59 + (c & 255) * 0.11) / 255; };
const klamp01 = (v) => Math.max(0, Math.min(1, v));

function roundedRect(w, h, r) {
  const T = window.THREE, s = new T.Shape(), hw = w / 2, hh = h / 2; r = Math.max(0.001, Math.min(r, hw - 0.001, hh - 0.001));
  s.moveTo(hw - r, -hh);
  s.absarc(hw - r, -hh + r, r, -Math.PI / 2, 0, false);
  s.absarc(hw - r, hh - r, r, 0, Math.PI / 2, false);
  s.absarc(-hw + r, hh - r, r, Math.PI / 2, Math.PI, false);
  s.absarc(-hw + r, -hh + r, r, Math.PI, Math.PI * 1.5, false);
  s.closePath();
  return s;
}
// rektangel med egen radie per hörn: [nere vänster, nere höger, uppe höger, uppe vänster]; 0 = skarpt hörn
function rektHorn(w, h, rr) {
  const T = window.THREE, s = new T.Shape(), hw = w / 2, hh = h / 2, m = Math.min(hw, hh) - 0.001;
  const [a, b, c, e] = rr.map((r) => Math.max(0, Math.min(r, m)));
  s.moveTo(-hw + a, -hh); s.lineTo(hw - b, -hh);
  if (b > 0.0005) s.absarc(hw - b, -hh + b, b, -Math.PI / 2, 0, false);
  s.lineTo(hw, hh - c);
  if (c > 0.0005) s.absarc(hw - c, hh - c, c, 0, Math.PI / 2, false);
  s.lineTo(-hw + e, hh);
  if (e > 0.0005) s.absarc(-hw + e, hh - e, e, Math.PI / 2, Math.PI, false);
  s.lineTo(-hw, -hh + a);
  if (a > 0.0005) s.absarc(-hw + a, -hh + a, a, Math.PI, Math.PI * 1.5, false);
  s.closePath();
  return s;
}
// rundad låda med fasade kanter, centrerad, total tjocklek d. horn = egna hörnradier (se rektHorn)
function roundedBox(w, h, d, r, bev, segs = 5, horn = null) {
  const T = window.THREE;
  bev = Math.min(bev, d / 2 - 0.001, r - 0.001 > 0 ? r - 0.001 : bev);
  const form = horn ? rektHorn(w - 2 * bev, h - 2 * bev, horn.map((x) => (x > 0 ? Math.max(0.001, x - bev) : 0))) : roundedRect(w - 2 * bev, h - 2 * bev, Math.max(0.001, r - bev));
  const g = new T.ExtrudeGeometry(form, { depth: d - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: segs, curveSegments: 20 });
  g.translate(0, 0, -(d - 2 * bev) / 2);
  g.computeVertexNormals();
  return g;
}
// platt skärmyta vars UV går 0..1 över hela formen (ShapeGeometry ger annars UV i modellenheter)
function skarmYta(form, w, h, u0 = 0, du = 1) {
  const T = window.THREE, geo = new T.ShapeGeometry(form, 12), uv = geo.attributes.uv, pos = geo.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + du * (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
  uv.needsUpdate = true;
  return geo;
}
const lysande = (map, styrka = 0.55) => { const m = new window.THREE.MeshPhysicalMaterial({ map, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: styrka, roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03 }); return m; };

// ---------- texturer (canvas) ----------
function skarmTextur(tel) {
  const T = window.THREE, W = 512, H = Math.round(512 * ((tel.hojd - 2 * tel.ram - 0.07 - tel.haka) / (tel.bredd - 2 * tel.ram)));
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  x.fillStyle = '#05070f'; x.fillRect(0, 0, W, H);                      // svart ram runt bildytan
  const m = Math.round(W * 0.045), rr = Math.round(W * 0.06);
  const g = x.createLinearGradient(0, m, W, H - m); g.addColorStop(0, '#2d7cf0'); g.addColorStop(0.5, '#6a4bd8'); g.addColorStop(1, '#e05aa8');
  x.save(); x.beginPath(); x.roundRect(m, m, W - 2 * m, H - 2 * m, rr); x.clip(); x.fillStyle = g; x.fillRect(0, 0, W, H);
  // mjuk ljusfläck
  const rg = x.createRadialGradient(W * 0.3, H * 0.2, 10, W * 0.3, H * 0.2, W * 0.9); rg.addColorStop(0, 'rgba(255,255,255,0.35)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = rg; x.fillRect(0, 0, W, H);
  // statusrad
  x.fillStyle = 'rgba(255,255,255,0.92)'; x.font = `bold ${W * 0.06}px system-ui, sans-serif`; x.textBaseline = 'middle';
  x.fillText('9:41', m + W * 0.05, m + W * 0.07);
  x.textAlign = 'right'; x.fillText('24°', W - m - W * 0.05, m + W * 0.07); x.textAlign = 'left';
  // appikoner 4 kolumner
  const cols = 4, cell = (W - 2 * m) / cols, ik = cell * 0.68, y0 = m + W * 0.18;
  const rows = Math.max(1, Math.floor((H - y0 - m - cell * 0.9) / cell));
  // appikoner: egna tolkningar av kända appar (harness/ikoner.js); dockan längst ner får de fyra viktigaste
  const docka = ['telefon', 'meddelanden', 'webb', 'musik'], ovriga = IKONER.map((k) => k.id).filter((id) => !docka.includes(id));
  for (let j = 0; j < Math.min(rows, Math.ceil(ovriga.length / cols)); j++) for (let i = 0; i < cols; i++) {
    const px = m + i * cell + (cell - ik) / 2, py = y0 + j * cell;
    ritaIkon(x, ovriga[(i + j * cols) % ovriga.length], px, py, ik, { skugga: true, kalenderdag: '23' });
  }
  // docka
  const dy = H - m - cell * 0.95; x.fillStyle = 'rgba(255,255,255,0.18)'; x.beginPath(); x.roundRect(m + cell * 0.1, dy, W - 2 * m - cell * 0.2, cell * 0.85, cell * 0.2); x.fill();
  for (let i = 0; i < 4; i++) { const px = m + i * cell + (cell - ik) / 2, py = dy + (cell * 0.85 - ik) / 2; ritaIkon(x, docka[i], px, py, ik, { skugga: true }); }
  x.restore();
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
// den vikbara telefonens stora innerskärm: bred, med klockwidget, sex kolumner och ett svagt veck i mitten
function vikSkarmTextur(asp) {
  const T = window.THREE, W = 1024, H = Math.max(256, Math.round(W / asp));
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  x.fillStyle = '#05070f'; x.fillRect(0, 0, W, H);
  const m = Math.round(W * 0.02), rr = Math.round(W * 0.03);
  const g = x.createLinearGradient(0, m, W, H - m); g.addColorStop(0, '#2d7cf0'); g.addColorStop(0.5, '#6a4bd8'); g.addColorStop(1, '#e05aa8');
  x.save(); x.beginPath(); x.roundRect(m, m, W - 2 * m, H - 2 * m, rr); x.clip(); x.fillStyle = g; x.fillRect(0, 0, W, H);
  const rg = x.createRadialGradient(W * 0.25, H * 0.15, 10, W * 0.25, H * 0.15, W * 0.75); rg.addColorStop(0, 'rgba(255,255,255,0.32)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = rg; x.fillRect(0, 0, W, H);
  const fs = W * 0.03; x.fillStyle = 'rgba(255,255,255,0.92)'; x.font = `bold ${fs}px system-ui, sans-serif`; x.textBaseline = 'middle';
  x.fillText('9:41', m + W * 0.03, m + fs * 1.2); x.textAlign = 'right'; x.fillText('24°', W - m - W * 0.03, m + fs * 1.2); x.textAlign = 'left';
  const cols = 6, cell = (W - 2 * m) / cols, ik = cell * 0.6, y0 = m + fs * 2.6;
  const rows = Math.max(2, Math.floor((H - y0 - m - cell * 0.95) / cell));
  // widget uppe till vänster (3 × 2 rutor): stor klocka och datum
  x.fillStyle = 'rgba(255,255,255,0.2)'; x.beginPath(); x.roundRect(m + cell * 0.12, y0 + cell * 0.05, cell * 2.76, cell * 1.8, cell * 0.2); x.fill();
  x.fillStyle = '#ffffff'; x.font = `bold ${cell * 0.62}px system-ui, sans-serif`; x.fillText('9:41', m + cell * 0.4, y0 + cell * 0.72);
  x.fillStyle = 'rgba(255,255,255,0.85)'; x.font = `bold ${cell * 0.2}px system-ui, sans-serif`; x.fillText('TORSDAG 23 OKTOBER', m + cell * 0.44, y0 + cell * 1.38);
  const docka = ['telefon', 'meddelanden', 'webb', 'musik'], ovriga = IKONER.map((k) => k.id).filter((id) => !docka.includes(id));
  let n = 0;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    if (i < 3 && j < 2) continue;
    ritaIkon(x, ovriga[n++ % ovriga.length], m + i * cell + (cell - ik) / 2, y0 + j * cell + (cell - ik) / 2, ik, { skugga: true, kalenderdag: '23' });
  }
  const dy = H - m - cell * 0.95; x.fillStyle = 'rgba(255,255,255,0.18)'; x.beginPath(); x.roundRect(m + cell * 0.6, dy, W - 2 * m - cell * 1.2, cell * 0.85, cell * 0.2); x.fill();
  const dock6 = [...docka, ovriga[3], ovriga[7]];
  for (let i = 0; i < 6; i++) ritaIkon(x, dock6[i], m + cell * 0.6 + i * (cell * 0.8) + (cell * 0.8 - ik * 0.85) / 2 + cell * 0.0, dy + (cell * 0.85 - ik * 0.85) / 2, ik * 0.85, { skugga: true });
  x.restore();
  const kg = x.createLinearGradient(W / 2 - 16, 0, W / 2 + 16, 0); kg.addColorStop(0, 'rgba(0,0,0,0)'); kg.addColorStop(0.5, 'rgba(10,12,30,0.3)'); kg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = kg; x.fillRect(W / 2 - 16, 0, 32, H);
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function logoTextur(tel) {
  const T = window.THREE, c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  const mork = lum(tel.kropp) < 0.45, col = mork ? 'rgba(255,255,255,0.75)' : 'rgba(40,40,52,0.8)';
  x.strokeStyle = col; x.lineWidth = 10; x.beginPath(); x.arc(128, 128, 100, 0, Math.PI * 2); x.stroke();
  x.fillStyle = col; x.font = 'bold 150px system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText((tel.marke || 'M')[0].toUpperCase(), 128, 136);
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
}
function vavTextur() {
  const T = window.THREE, c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
    const blockH = ((i >> 1) + (j >> 1)) & 1, strand = blockH ? j & 1 : i & 1;
    x.fillStyle = strand ? '#3a3c48' : '#8a8ea6'; x.fillRect(i * 8, j * 8, 8, 8);
    x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(i * 8, j * 8, 8, 1);
  }
  // ExtrudeGeometry har UV i modellenheter: 8 celler per 0,16 enhet ⇒ ~2 mm per cell
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(6.25, 6.25); t.colorSpace = T.SRGBColorSpace; return t;
}
function borstadTextur() {
  const T = window.THREE, c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#808080'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1200; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? 255 : 0},${Math.random() < 0.5 ? 255 : 0},${Math.random() < 0.5 ? 255 : 0},0.12)`; x.fillRect(Math.random() * 256, Math.random() * 256, Math.random() * 60 + 10, 1); }
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(2, 4); return t;
}

function kroppMaterial(tel) {
  const T = window.THREE, color = new T.Color(tel.kropp);
  switch (tel.yta) {
    case 'matt': return new T.MeshPhysicalMaterial({ color, roughness: 0.75, metalness: 0, clearcoat: 0.15, clearcoatRoughness: 0.6 });
    case 'kolfiber': return new T.MeshPhysicalMaterial({ color: color.clone().lerp(new T.Color(0xffffff), 0.35), map: vavTextur(), roughness: 0.3, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.1 });
    case 'borstad': return new T.MeshPhysicalMaterial({ color, roughness: 0.32, metalness: 0.95, roughnessMap: borstadTextur() });
    default: return new T.MeshPhysicalMaterial({ color, roughness: 0.22, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.06 });
  }
}
const morkMetall = () => new window.THREE.MeshPhysicalMaterial({ color: 0x3a3c48, metalness: 0.9, roughness: 0.25 });

// kameraön, blixten och märket på baksidan. Modellens mitt i origo, baksidan vid z = −d/2.
function bakSida(g, tel, w, h, d) {
  const T = window.THREE;
  // kameraö (sedd bakifrån: uppe till vänster ⇒ modell +x)
  const ks = tel.kameraStorlek, n = tel.kameror <= 0 ? 0 : Math.max(1, Math.min(3, Math.round(tel.kameror))), pad = 0.07;
  const mw = ks, mh = ks + (Math.max(1, n) - 1) * ks * 0.78, mcx = w / 2 - pad - mw / 2, mcy = h / 2 - pad - mh / 2;
  if (n > 0) {
    const o = new T.Mesh(roundedBox(mw, mh, 0.02, ks * 0.25, 0.006, 3), new T.MeshPhysicalMaterial({ color: 0x1b1c24, roughness: 0.35, metalness: 0.4, clearcoat: 1, clearcoatRoughness: 0.1 }));
    o.position.set(mcx, mcy, -d / 2 - 0.008); o.castShadow = true; g.add(o);
  }
  const lr = ks * 0.32;
  for (let k = 0; k < n; k++) {
    const ly = mcy + mh / 2 - ks * 0.5 - k * ks * 0.78;
    const ring = new T.Mesh(new T.CylinderGeometry(lr, lr, 0.012, 40), new T.MeshPhysicalMaterial({ color: 0x3a3c48, roughness: 0.25, metalness: 0.9 })); ring.rotation.x = Math.PI / 2; ring.position.set(mcx, ly, -d / 2 - 0.022); g.add(ring);
    const lins = new T.Mesh(new T.CylinderGeometry(lr * 0.72, lr * 0.72, 0.006, 40), new T.MeshPhysicalMaterial({ color: new T.Color(tel.kamera).multiplyScalar(0.5), roughness: 0.03, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0 })); lins.rotation.x = Math.PI / 2; lins.position.set(mcx, ly, -d / 2 - 0.027); g.add(lins);
    const pupill = new T.Mesh(new T.CylinderGeometry(lr * 0.3, lr * 0.3, 0.002, 24), new T.MeshPhysicalMaterial({ color: 0x05060a, roughness: 0.05, clearcoat: 1 })); pupill.rotation.x = Math.PI / 2; pupill.position.set(mcx, ly, -d / 2 - 0.0305); g.add(pupill);
  }
  if (n > 0) {
    const blixt = new T.Mesh(new T.CylinderGeometry(ks * 0.08, ks * 0.08, 0.004, 20), new T.MeshStandardMaterial({ color: 0xfff1c0, emissive: 0xffe9a0, emissiveIntensity: 0.6 })); blixt.rotation.x = Math.PI / 2;
    blixt.position.set(n === 1 ? mcx - mw * 0.3 : mcx, n === 1 ? mcy + mh / 2 - ks * 0.5 : mcy - mh / 2 + ks * 0.18, -d / 2 - 0.0195); g.add(blixt);
  }
  // märke
  const logo = new T.Mesh(new T.PlaneGeometry(0.22, 0.22), new T.MeshStandardMaterial({ map: logoTextur(tel), transparent: true, roughness: 0.4, metalness: 0.3 }));
  logo.rotation.y = Math.PI; logo.position.set(0, -0.08, -d / 2 - 0.0015); g.add(logo);
}

export function byggTelefon(tel) {
  const T = window.THREE, g = new T.Group();
  const w = tel.bredd, h = tel.hojd, d = tel.djup, r = Math.min(tel.radie, w / 2, h / 2), platta = tel.enhet === 'platta';
  const kropp = kroppMaterial(tel);
  const body = new T.Mesh(roundedBox(w, h, d, r, Math.min(0.03, d * 0.4)), kropp); body.castShadow = true; body.receiveShadow = true; g.add(body);
  // skärm (glas + lysande bild)
  const sTop = h / 2 - tel.ram - 0.07, sBot = -h / 2 + tel.ram + tel.haka, sW = w - 2 * tel.ram, sH = sTop - sBot;
  const skarm = new T.Mesh(skarmYta(roundedRect(sW, sH, Math.max(0.01, r - tel.ram)), sW, sH), lysande(skarmTextur(tel)));
  skarm.position.set(0, (sTop + sBot) / 2, d / 2 + 0.0015); g.add(skarm);
  // hörlur + frontkamera (plattan har ingen hörlur och kameran mitt i ramen)
  const mork = new T.MeshPhysicalMaterial({ color: 0x15161c, roughness: 0.5, metalness: 0.2 });
  if (!platta) { const horlur = new T.Mesh(new T.BoxGeometry(0.16, 0.014, 0.006), mork); horlur.position.set(0, h / 2 - tel.ram - 0.035, d / 2 + 0.001); g.add(horlur); }
  if (tel.selfie !== false) { const fkam = new T.Mesh(new T.CylinderGeometry(0.014, 0.014, 0.006, 24), new T.MeshPhysicalMaterial({ color: 0x0a1a3a, roughness: 0.05, clearcoat: 1 })); fkam.rotation.x = Math.PI / 2; fkam.position.set(platta ? 0 : 0.17, h / 2 - tel.ram - 0.035, d / 2 + 0.002); g.add(fkam); }
  // hemknapp
  if (tel.haka > 0.1) {
    const rr = tel.haka * 0.3;
    const ring = new T.Mesh(new T.CylinderGeometry(rr, rr, 0.004, 40), new T.MeshPhysicalMaterial({ color: new T.Color(tel.kropp).multiplyScalar(0.8), roughness: 0.3, metalness: 0.3, clearcoat: 1 })); ring.rotation.x = Math.PI / 2; ring.position.set(0, -h / 2 + tel.ram + tel.haka / 2, d / 2 + 0.001); g.add(ring);
    const inre = new T.Mesh(new T.CylinderGeometry(rr * 0.8, rr * 0.8, 0.004, 40), new T.MeshPhysicalMaterial({ color: new T.Color(tel.kropp).multiplyScalar(0.95), roughness: 0.4, clearcoat: 0.5 })); inre.rotation.x = Math.PI / 2; inre.position.set(0, -h / 2 + tel.ram + tel.haka / 2, d / 2 + 0.003); g.add(inre);
  }
  bakSida(g, tel, w, h, d);
  // knappar på sidorna
  const knapp = (x, y, len) => { const m = new T.Mesh(new T.BoxGeometry(0.012, len, d * 0.45), kropp); m.position.set(x, y, 0); m.castShadow = true; g.add(m); };
  knapp(w / 2 + 0.004, 0.4, 0.2); knapp(-w / 2 - 0.004, 0.17, 0.14); knapp(-w / 2 - 0.004, 0.37, 0.14);
  // laddport i botten
  const port = new T.Mesh(new T.BoxGeometry(0.12, 0.012, d * 0.4), mork); port.position.set(0, -h / 2 - 0.001, 0); g.add(port);
  return g;
}

// ---------- alla enhetstyper ----------
// paketera: lägger modellen i en yttre grupp med golvavtrycket centrerat kring origo och botten på y = 0.
// userData på den yttre gruppen: hojd, bredd, fot [x, z] (för kamera och kontaktskugga) och satt(o) som
// öppnar/stänger det som går att öppna (laptopens lock, den vikbara, hörlursfodralet). o = 0..1, undefined = standard.
function paketera(inre) {
  const T = window.THREE, yttre = new T.Group(); yttre.add(inre);
  const box = new T.Box3(), tmp = new T.Box3(), inv = new T.Matrix4(), mm = new T.Matrix4(), c = new T.Vector3(), s = new T.Vector3();
  const passa = () => {
    inre.position.set(0, 0, 0); inre.updateMatrixWorld(true); inv.copy(inre.matrixWorld).invert(); box.makeEmpty();
    inre.traverse((m) => { if (!m.isMesh) return; if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); tmp.copy(m.geometry.boundingBox).applyMatrix4(mm.multiplyMatrices(inv, m.matrixWorld)); box.union(tmp); });
    box.getCenter(c); box.getSize(s);
    inre.position.set(-c.x, -box.min.y, -c.z);
    Object.assign(yttre.userData, { hojd: s.y, bredd: s.x, fot: [s.x, s.z] });
  };
  let sist = {};
  yttre.userData.satt = (o) => { if (o === sist) return; sist = o; if (inre.userData.satt) inre.userData.satt(o); passa(); };
  yttre.userData.satt(undefined);
  return yttre;
}
export function byggEnhet(tel) {
  const bygg = { laptop: byggLaptop, klocka: byggKlocka, horlurar: byggHorlurar, vikbar: byggVikbar }[tel.enhet] || byggTelefon;
  return paketera(bygg(tel));
}
function skrivbordTextur() {
  const T = window.THREE, c = document.createElement('canvas'); c.width = 512; c.height = 320; const x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 512, 320); gr.addColorStop(0, '#2d7cf0'); gr.addColorStop(0.55, '#6a4bd8'); gr.addColorStop(1, '#e05aa8'); x.fillStyle = gr; x.fillRect(0, 0, 512, 320);
  x.fillStyle = 'rgba(255,255,255,0.18)'; x.fillRect(0, 0, 512, 16);
  const fonster = (fx, fy, fw, fh, c1) => { x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(fx + 6, fy + 8, fw, fh); x.fillStyle = '#f4f4f8'; x.beginPath(); x.roundRect(fx, fy, fw, fh, 8); x.fill(); x.fillStyle = c1; x.beginPath(); x.roundRect(fx, fy, fw, 20, [8, 8, 0, 0]); x.fill(); x.fillStyle = '#c8ccd8'; for (let i = 0; i < 5; i++) x.fillRect(fx + 14, fy + 34 + i * 16, fw * (0.4 + ((i * 37) % 50) / 100), 8); };
  fonster(40, 40, 220, 150, '#3a7bd5'); fonster(230, 90, 230, 140, '#45b964');
  x.fillStyle = 'rgba(255,255,255,0.25)'; x.beginPath(); x.roundRect(120, 270, 272, 38, 12); x.fill();
  for (let i = 0; i < 7; i++) ritaIkon(x, IKONER[i % IKONER.length].id, 132 + i * 37, 276, 28, {});
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
}
function tangentTextur(farg) {
  const T = window.THREE, c = document.createElement('canvas'); c.width = 512; c.height = 200; const x = c.getContext('2d');
  x.fillStyle = farg; x.fillRect(0, 0, 512, 200);
  x.fillStyle = '#1a1b22';
  for (let r = 0; r < 5; r++) for (let k = 0; k < 14; k++) { const w = r === 4 && k > 3 && k < 10 ? 0 : 30; if (!w) continue; x.beginPath(); x.roundRect(10 + k * 35.5, 12 + r * 37, w, 30, 5); x.fill(); }
  x.beginPath(); x.roundRect(10 + 4 * 35.5, 12 + 4 * 37, 6 * 35.5 - 5, 30, 5); x.fill();
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
}
function byggLaptop(tel) {
  const T = window.THREE, g = new T.Group(), w = tel.bredd, dj = tel.hojd * 0.62, t = 0.05, mat = kroppMaterial(tel);
  const bas = new T.Mesh(roundedBox(w, dj, t, 0.06, 0.014), mat); bas.rotation.x = -Math.PI / 2; bas.position.y = t / 2; bas.castShadow = true; bas.receiveShadow = true; g.add(bas);
  const kb = new T.Mesh(new T.PlaneGeometry(w * 0.86, dj * 0.44), new T.MeshStandardMaterial({ map: tangentTextur('#' + new T.Color(tel.kropp).getHexString()), roughness: 0.6 })); kb.rotation.x = -Math.PI / 2; kb.position.set(0, t + 0.002, -dj * 0.12); g.add(kb);
  const tp = new T.Mesh(new T.PlaneGeometry(w * 0.3, dj * 0.24), new T.MeshPhysicalMaterial({ color: new T.Color(tel.kropp).multiplyScalar(0.9), roughness: 0.25, clearcoat: 0.6 })); tp.rotation.x = -Math.PI / 2; tp.position.set(0, t + 0.002, dj * 0.3); g.add(tp);
  const gangjarn = new T.Mesh(new T.CylinderGeometry(0.024, 0.024, w * 0.72, 20), morkMetall()); gangjarn.rotation.z = Math.PI / 2; gangjarn.position.set(0, t + 0.004, -dj / 2 + 0.02); g.add(gangjarn);
  // locket: gångjärn i bakkant. Stängt ligger det på tangentbordet, öppet lutar det 0,22 rad bakåt.
  const led = new T.Group(); led.position.set(0, t + 0.004, -dj / 2 + 0.02); g.add(led);
  const lock = new T.Mesh(roundedBox(w, dj, 0.03, 0.06, 0.01), mat); lock.position.set(0, dj / 2, -0.015); lock.castShadow = true; led.add(lock);
  const ram = new T.Mesh(new T.PlaneGeometry(w * 0.96, dj * 0.94), new T.MeshPhysicalMaterial({ color: 0x0a0c14, roughness: 0.2, clearcoat: 1 })); ram.position.set(0, dj / 2, 0.0015); led.add(ram);
  const skarm = new T.Mesh(new T.PlaneGeometry(w * 0.9, dj * 0.84), lysande(skrivbordTextur(), 0.5)); skarm.position.set(0, dj / 2 + dj * 0.02, 0.003); led.add(skarm);
  const webbkam = new T.Mesh(new T.CircleGeometry(0.012, 16), new T.MeshBasicMaterial({ color: 0x1a2a50 })); webbkam.position.set(0, dj * 0.955, 0.003); led.add(webbkam);
  const logo = new T.Mesh(new T.PlaneGeometry(0.3, 0.3), new T.MeshStandardMaterial({ map: logoTextur(tel), transparent: true, roughness: 0.4, metalness: 0.3 })); logo.rotation.y = Math.PI; logo.position.set(0, dj / 2, -0.032); led.add(logo);
  g.userData.satt = (o = 1) => { led.rotation.x = Math.PI / 2 - klamp01(o) * (Math.PI / 2 + 0.22); };
  return g;
}
function klockTextur() {
  const T = window.THREE, c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#05060c'; x.fillRect(0, 0, 256, 256);
  const ring = (r, f, andel) => { x.strokeStyle = 'rgba(255,255,255,0.12)'; x.lineWidth = 16; x.beginPath(); x.arc(128, 128, r, 0, Math.PI * 2); x.stroke(); x.strokeStyle = f; x.lineCap = 'round'; x.beginPath(); x.arc(128, 128, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * andel); x.stroke(); };
  ring(100, '#ff4060', 0.78); ring(80, '#7ee03a', 0.6); ring(60, '#4ff0ff', 0.45);
  x.fillStyle = '#ffffff'; x.font = 'bold 44px system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('9:41', 128, 124);
  x.fillStyle = '#ff7088'; x.font = 'bold 16px system-ui, sans-serif'; x.fillText('♥ 72', 128, 156);
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
}
// smartklockan: boetten framför en armbandsögla, som om den satt på en osynlig handled; spänne längst bak
function byggKlocka(tel) {
  const T = window.THREE, g = new T.Group(), w = tel.bredd, h = tel.hojd, d = tel.djup, mat = kroppMaterial(tel);
  const rad = Math.min(tel.radie + 0.05, w / 2 - 0.01);
  const body = new T.Mesh(roundedBox(w, h, d, rad, Math.min(0.035, d * 0.42)), mat); body.castShadow = true; g.add(body);
  const sw = w - 0.06, sh = h - 0.06;
  const s = new T.Mesh(skarmYta(roundedRect(sw, sh, Math.max(0.02, rad - 0.03)), sw, sh), lysande(klockTextur(), 0.6)); s.position.z = d / 2 + 0.002; g.add(s);
  const stal = new T.MeshPhysicalMaterial({ color: 0xd8dce4, metalness: 0.9, roughness: 0.2 });
  const krona = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 0.04, 24), stal); krona.rotation.z = Math.PI / 2; krona.position.set(w / 2 + 0.02, 0.07, 0); g.add(krona);
  const sidoknapp = new T.Mesh(roundedBox(0.014, 0.11, 0.03, 0.006, 0.004, 2), stal); sidoknapp.position.set(w / 2 + 0.006, -0.07, 0); g.add(sidoknapp);
  const sensor = new T.Mesh(new T.CylinderGeometry(w * 0.3, w * 0.34, 0.02, 40), new T.MeshPhysicalMaterial({ color: 0x15161c, roughness: 0.08, clearcoat: 1 })); sensor.rotation.x = Math.PI / 2; sensor.position.z = -d / 2 - 0.004; g.add(sensor);
  // armbandet: en kurva som går ut ur boettens över- och underkant och runt bakåt
  const bandM = new T.MeshPhysicalMaterial({ color: new T.Color(tel.kropp).lerp(new T.Color(0x1a1b22), 0.45), roughness: 0.62, clearcoat: 0.25, clearcoatRoughness: 0.5 });
  const Rv = h / 2 + 0.1, B = 0.32, zc = -d / 2 - 0.2, bw = w * 0.8, bt = 0.034, P = (y, z) => new T.Vector3(0, y, z);
  const pts = [P(h / 2 - 0.05, -d * 0.05), P(h / 2 + 0.03, -d * 0.35)];
  for (const u of [75, 105, 135, 180, 225, 255, 285]) { const v = (u * Math.PI) / 180; pts.push(P(Rv * Math.sin(v), zc + B * Math.cos(v))); }
  pts.push(P(-h / 2 - 0.03, -d * 0.35), P(-h / 2 + 0.05, -d * 0.05));
  const band = new T.Mesh(new T.ExtrudeGeometry(roundedRect(bw, bt, bt * 0.45), { steps: 96, bevelEnabled: false, extrudePath: new T.CatmullRomCurve3(pts, false, 'centripetal') }), bandM);
  band.castShadow = true; g.add(band);
  const spanne = new T.Mesh(roundedBox(bw * 1.12, 0.07, 0.022, 0.012, 0.006, 3), stal); spanne.position.set(0, 0, zc - B - 0.008); g.add(spanne);
  return g;
}
// trådlösa hörlurar: ett runt fodral med lock (gångjärn bak) och två lurar som står bredvid
function byggHorlurar(tel) {
  const T = window.THREE, g = new T.Group(), w = tel.bredd, h = tel.hojd * 0.68, d = tel.djup, mat = kroppMaterial(tel);
  const R = Math.min(0.12, h * 0.28), bev = Math.min(0.048, d * 0.22), hb = h * 0.68, hl = h - hb;
  const nedre = new T.Mesh(roundedBox(w, hb, d, R, bev, 6, [R, R, 0, 0]), mat); nedre.position.y = hb / 2; nedre.castShadow = true; nedre.receiveShadow = true; g.add(nedre);
  // insidan syns när locket är öppet: mörk botten med två hål för lurarna
  const inuti = new T.Mesh(new T.ShapeGeometry(roundedRect(w - 2 * bev - 0.01, d - 2 * bev + 0.02, 0.05), 8), new T.MeshPhysicalMaterial({ color: 0x1a1b22, roughness: 0.7 })); inuti.rotation.x = -Math.PI / 2; inuti.position.y = hb + 0.001; g.add(inuti);
  for (const sx of [-1, 1]) { const hal = new T.Mesh(new T.CircleGeometry(0.045, 20), new T.MeshBasicMaterial({ color: 0x050608 })); hal.rotation.x = -Math.PI / 2; hal.position.set(sx * w * 0.22, hb + 0.002, 0); g.add(hal); }
  const led = new T.Mesh(new T.CylinderGeometry(0.012, 0.012, 0.004, 12), new T.MeshBasicMaterial({ color: 0x45f080 })); led.rotation.x = Math.PI / 2; led.position.set(0, hb * 0.55, d / 2 + 0.002); g.add(led);
  const gangjarn = new T.Mesh(new T.CylinderGeometry(0.014, 0.014, w * 0.28, 16), morkMetall()); gangjarn.rotation.z = Math.PI / 2; gangjarn.position.set(0, hb, -d / 2 - 0.002); g.add(gangjarn);
  const pivot = new T.Group(); pivot.position.set(0, hb + 0.002, -d / 2); g.add(pivot);
  const lock = new T.Mesh(roundedBox(w, hl, d, R, bev, 6, [0, 0, R, R]), mat); lock.position.set(0, hl / 2, d / 2); lock.castShadow = true; pivot.add(lock);
  const tips = new T.MeshPhysicalMaterial({ color: new T.Color(tel.kropp).lerp(new T.Color(0x9aa0b0), 0.35), roughness: 0.85 });
  const galler = new T.MeshPhysicalMaterial({ color: 0x1a1b22, roughness: 0.6 });
  for (const sx of [-1, 1]) {
    const lur = new T.Group(); lur.position.set(sx * (w / 2 + 0.17), 0, d * 0.4); lur.rotation.set(0, sx * 0.5, -sx * 0.1); g.add(lur);
    const skaft = new T.Mesh(new T.CapsuleGeometry(0.026, 0.15, 6, 16), mat); skaft.position.y = 0.026 + 0.075; skaft.castShadow = true; lur.add(skaft);
    const huvud = new T.Mesh(new T.SphereGeometry(0.078, 28, 18), mat); huvud.scale.set(1, 0.92, 0.88); huvud.position.set(sx * 0.02, 0.24, 0); huvud.castShadow = true; lur.add(huvud);
    const topp = new T.Mesh(new T.SphereGeometry(0.048, 20, 14), tips); topp.position.set(-sx * 0.066, 0.25, 0.018); lur.add(topp);
    const mik = new T.Mesh(new T.CircleGeometry(0.02, 16), galler); mik.position.set(sx * 0.022, 0.25, 0.069); lur.add(mik);
    const spets = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.006, 16), morkMetall()); spets.position.y = 0.002; lur.add(spets);
  }
  g.userData.satt = (o = 0) => { pivot.rotation.x = -klamp01(o) * 1.75; };
  return g;
}
// vikbar telefon: två halvor runt ett gångjärn. Stängd = en vanlig telefon med täckskärm fram och kameror bak;
// öppen = en liten surfplatta med en skärm över båda halvorna. Standard: nästan helt uppvikt, som en bok på högkant.
function byggVikbar(tel) {
  const T = window.THREE, g = new T.Group(), w = tel.bredd, h = tel.hojd, d = tel.djup, r = Math.min(tel.radie, w / 2, h / 2), mat = kroppMaterial(tel);
  const pd = d / 2, g0 = 0.004, bev = Math.min(0.018, pd * 0.4);
  const ri = Math.max(0.012, Math.min(tel.ram, 0.03)), sW = w - ri - g0, sH = h - 2 * ri, rs = Math.max(0.01, r - ri);
  const innerTex = vikSkarmTextur((2 * sW + 2 * g0) / sH), innerMat = lysande(innerTex, 0.55);
  const vik = new T.Group(); g.add(vik);
  const halva = (sida) => {   // sida −1 = vänster halva (täckskärmen bak), +1 = höger (kamerorna bak)
    const p = new T.Group(); vik.add(p);
    const horn = sida < 0 ? [r, 0, 0, r] : [0, r, r, 0];
    const body = new T.Mesh(roundedBox(w, h, pd, r, bev, 5, horn), mat); body.position.set(sida * w / 2, 0, -g0 - pd / 2); body.castShadow = true; p.add(body);
    const skarm = new T.Mesh(skarmYta(rektHorn(sW, sH, sida < 0 ? [rs, 0, 0, rs] : [0, rs, rs, 0]), sW, sH, sida < 0 ? 0 : 0.5, 0.5), innerMat);
    skarm.position.set(sida * (g0 + sW / 2), 0, -g0 + 0.0015); p.add(skarm);
    return p;
  };
  const pL = halva(-1), pR = halva(1);
  // täckskärm på vänstra halvans baksida (vänd utåt)
  const cr = 0.035, tTel = { ...tel, bredd: w, hojd: h, ram: cr, haka: cr }, cw = w - 2 * cr, cTop = h / 2 - cr - 0.07, cBot = -h / 2 + 2 * cr, ch = cTop - cBot;
  const tack = new T.Mesh(skarmYta(roundedRect(cw, ch, Math.max(0.01, r - cr)), cw, ch), lysande(skarmTextur(tTel), 0.5)); tack.rotation.y = Math.PI; tack.position.set(-w / 2, (cTop + cBot) / 2, -g0 - pd - 0.0015); pL.add(tack);
  const hal = new T.Mesh(new T.CylinderGeometry(0.014, 0.014, 0.004, 20), new T.MeshPhysicalMaterial({ color: 0x0a1a3a, roughness: 0.05, clearcoat: 1 })); hal.rotation.x = Math.PI / 2; hal.position.set(-w / 2, h / 2 - cr - 0.035, -g0 - pd - 0.003); pL.add(hal);
  // kameror och märke på högra halvans baksida
  const bak = new T.Group(); bak.position.set(w / 2, 0, -g0 - pd / 2); pR.add(bak); bakSida(bak, tel, w, h, pd);
  const knapp = (y, len) => { const m = new T.Mesh(new T.BoxGeometry(0.012, len, pd * 0.6), mat); m.position.set(w + 0.004, y, -g0 - pd / 2); m.castShadow = true; pR.add(m); };
  knapp(0.38, 0.16); knapp(0.15, 0.1);
  // gångjärnsryggen
  const rygg = new T.Mesh(new T.CylinderGeometry((g0 + pd) / 2 - 0.001, (g0 + pd) / 2 - 0.001, h * 0.97, 24), new T.MeshPhysicalMaterial({ color: 0x2a2c34, metalness: 0.85, roughness: 0.3 })); rygg.position.set(0, 0, -(g0 + pd) / 2); vik.add(rygg);
  g.userData.satt = (o = 0.84) => {
    const a = (Math.PI - klamp01(o) * Math.PI) / 2;   // varje halvas vridning från helt uppvikt läge
    pL.rotation.y = a; pR.rotation.y = -a;
    vik.rotation.y = (2 * a * a) / Math.PI;          // stängd: täckskärmen vänds mot kameran
  };
  return g;
}

// studiomiljö för speglingar: mjuk vit softbox uppe till vänster, cyan och magenta-strimmor
function miljo(renderer) {
  const T = window.THREE, sc = new T.Scene();
  const lampa = (w, h, c, i, pos, rot) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(c).multiplyScalar(i), side: T.DoubleSide })); m.position.set(...pos); m.rotation.set(...rot); sc.add(m); };
  sc.add(new T.Mesh(new T.SphereGeometry(20, 16, 16), new T.MeshBasicMaterial({ color: 0x0b0e1c, side: T.BackSide })));
  lampa(6, 3, 0xfff4e0, 6, [-4, 5, 4], [-0.9, -0.5, 0]);          // nyckelljus, softbox
  lampa(3, 2, 0xffffff, 2, [4, 3, 3], [-0.6, 0.6, 0]);            // fyllnad
  lampa(0.4, 8, 0x4ff0ff, 8, [-6, 0, -3], [0, 0.6, 0]);           // cyan neon
  lampa(0.4, 8, 0xff40c8, 8, [6, 0, -3], [0, -0.6, 0]);           // magenta neon
  lampa(8, 8, 0x2a4bd0, 1.2, [0, -3, 0], [Math.PI / 2, 0, 0]);    // blått sken från skivan
  const pm = new T.PMREMGenerator(renderer); const t = pm.fromScene(sc, 0.04).texture; pm.dispose(); return t;
}

// skiva/ror: visa den blå podiumskivan respektive neonrören som synliga föremål. Carl (2026-10-08): bort med dem,
// men ljuset de ger (cyan/magenta-kantljus, blått golvsken) ska vara kvar – lamporna finns alltid.
export function skapaTelefonGL(canvas, { tel = {}, vy = 'auto', yaw = 0.6, pitch = 0.22, kompakt = false, skiva = false, ror = false, genomskinlig = false } = {}) {
  const T = window.THREE;
  // kompakt = smalt fönster (designerns hål): neonrören och skivan närmare, lite vidare lins
  const K = kompakt ? { ror: 0.95, rorZ: -0.9, skiva: 0.72, fov: 30, dist: 4.3 } : { ror: 1.7, rorZ: -1.2, skiva: 1.05, fov: 26, dist: 4.6 };
  // genomskinlig: telefonen svävar över spelets pixelbild (ingen egen bakgrund)
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: genomskinlig, premultipliedAlpha: true, powerPreference: 'high-performance' });
  if (genomskinlig) renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.VSMShadowMap;   // VSM ger mjuk kant via shadow.radius
  const scene = new T.Scene(); if (!genomskinlig) scene.background = new T.Color(0x0b0e1c);
  scene.environment = miljo(renderer);
  const camera = new T.PerspectiveCamera(K.fov, 16 / 9, 0.1, 50);
  // bakgrund: mjuk glöd bakom telefonen
  const bgC = document.createElement('canvas'); bgC.width = 512; bgC.height = 288; const bx = bgC.getContext('2d');
  const gr = bx.createRadialGradient(256, 150, 10, 256, 150, 330); gr.addColorStop(0, '#2a2f6a'); gr.addColorStop(0.5, '#141a3c'); gr.addColorStop(1, '#070912'); bx.fillStyle = gr; bx.fillRect(0, 0, 512, 288);
  const bgT = new T.CanvasTexture(bgC); bgT.colorSpace = T.SRGBColorSpace;
  const bak = new T.Mesh(new T.PlaneGeometry(16, 9), new T.MeshBasicMaterial({ map: bgT })); bak.position.set(0, 0.3, -4); if (!genomskinlig) scene.add(bak);
  // golv + blå podiumskiva
  const golv = new T.Mesh(new T.PlaneGeometry(12, 12), new T.ShadowMaterial({ opacity: 0.55 })); golv.rotation.x = -Math.PI / 2; golv.receiveShadow = true; scene.add(golv);
  const skivaC = document.createElement('canvas'); skivaC.width = skivaC.height = 256; const sx = skivaC.getContext('2d');
  const sg = sx.createRadialGradient(128, 128, 10, 128, 128, 128); sg.addColorStop(0, '#2b4fd8'); sg.addColorStop(0.8, '#1a2d8a'); sg.addColorStop(0.95, '#5ad0ff'); sg.addColorStop(1, '#0b0e1c'); sx.fillStyle = sg; sx.fillRect(0, 0, 256, 256);
  const skivaT = new T.CanvasTexture(skivaC); skivaT.colorSpace = T.SRGBColorSpace;
  if (skiva) {
    const skivaM = new T.Mesh(new T.CircleGeometry(K.skiva, 64), new T.MeshStandardMaterial({ map: skivaT, emissive: 0x2a4bd0, emissiveMap: skivaT, emissiveIntensity: 0.9, roughness: 0.4 })); skivaM.rotation.x = -Math.PI / 2; skivaM.position.y = 0.002; skivaM.receiveShadow = true; scene.add(skivaM);
    const ring = new T.Mesh(new T.RingGeometry(K.skiva * 0.97, K.skiva * 1.03, 64), new T.MeshBasicMaterial({ color: 0x7ae0ff })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.004; scene.add(ring);
  } else {
    // utan skiva: ett mjukt blått golvsken så att ljuset finns kvar men inget föremål
    const glC = document.createElement('canvas'); glC.width = glC.height = 256; const gx = glC.getContext('2d');
    const gg = gx.createRadialGradient(128, 128, 0, 128, 128, 128); gg.addColorStop(0, genomskinlig ? 'rgba(60,90,230,0.32)' : 'rgba(60,90,230,0.55)'); gg.addColorStop(0.6, genomskinlig ? 'rgba(40,60,180,0.08)' : 'rgba(40,60,180,0.18)'); gg.addColorStop(1, 'rgba(20,30,100,0)'); gx.fillStyle = gg; gx.fillRect(0, 0, 256, 256);
    const sken = new T.Mesh(new T.PlaneGeometry(K.skiva * (genomskinlig ? 2.2 : 3.2), K.skiva * (genomskinlig ? 2.2 : 3.2)), new T.MeshBasicMaterial({ map: new T.CanvasTexture(glC), transparent: true, depthWrite: false })); sken.rotation.x = -Math.PI / 2; sken.position.y = 0.003; scene.add(sken);
    const golvLjus = new T.PointLight(0x3a5bff, 2.5, 4, 2); golvLjus.position.set(0, 0.15, 0.3); scene.add(golvLjus);
  }
  // mjuk kontaktskugga under prylen (radiell toning), följer det vridna golvavtrycket
  const ksC = document.createElement('canvas'); ksC.width = ksC.height = 256; const kx = ksC.getContext('2d');
  const kg = kx.createRadialGradient(128, 128, 0, 128, 128, 128); kg.addColorStop(0, 'rgba(5,6,20,0.85)'); kg.addColorStop(0.45, 'rgba(5,6,20,0.45)'); kg.addColorStop(1, 'rgba(5,6,20,0)'); kx.fillStyle = kg; kx.fillRect(0, 0, 256, 256);
  const kontakt = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: new T.CanvasTexture(ksC), transparent: true, depthWrite: false })); kontakt.rotation.x = -Math.PI / 2; kontakt.position.y = 0.006; scene.add(kontakt);
  // neonrör
  // neonlamporna ger bara en kantton – för starka färgar de hela den vita kroppen rosa/cyan
  const neon = (x, c) => { if (ror) { const m = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, 2.8, 16), new T.MeshBasicMaterial({ color: c })); m.position.set(x, 1.3, K.rorZ); scene.add(m); } const l = new T.PointLight(c, ror ? 4 : genomskinlig ? 2.2 : 5, 8, 2); l.position.set(x * 0.9, 1.2, K.rorZ * 0.75); scene.add(l); };
  neon(-K.ror, 0x4ff0ff); neon(K.ror, 0xff40c8);
  // ljus
  scene.add(new T.HemisphereLight(0x8a93d8, 0x1a1026, 0.9));
  const key = new T.DirectionalLight(0xfff1e0, 2.6); key.position.set(-2.5, 4, 3.5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 10; key.shadow.blurSamples = 16; key.shadow.bias = -0.0002;
  Object.assign(key.shadow.camera, { left: -1.5, right: 1.5, top: 2, bottom: -1, near: 0.5, far: 12 }); scene.add(key);
  const fyll = new T.DirectionalLight(0xdfe6ff, 0.6); fyll.position.set(3, 2, 2); scene.add(fyll);

  // oppning: 0..1 för laptopens lock, den vikbara och hörlursfodralet (undefined = modellens standardläge)
  const s = { tel: { ...STANDARD, ...tel }, vy, yaw, pitch, oppning: undefined, ms: 0, fart: 0.9, onFrame: null, _raf: 0, _spin: yaw, _nyckel: '' };
  const grupp = new T.Group(); scene.add(grupp);
  let telefon = null;
  s.uppdatera = () => {
    const nyckel = JSON.stringify(s.tel); if (nyckel === s._nyckel) return; s._nyckel = nyckel;
    if (telefon) { grupp.remove(telefon); telefon.traverse((m) => { if (m.geometry) m.geometry.dispose(); if (m.material) { if (m.material.map) m.material.map.dispose(); m.material.dispose(); } }); }
    telefon = byggEnhet(s.tel); telefon.position.y = 0.03; grupp.add(telefon);
  };
  const passa = () => { const w = canvas.clientWidth || 768, h = canvas.clientHeight || Math.round(w * 9 / 16); if (canvas.width !== Math.round(w * renderer.getPixelRatio()) || canvas.height !== Math.round(h * renderer.getPixelRatio())) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); } };
  s.rita = () => {
    passa(); s.uppdatera();
    const ud = telefon.userData; ud.satt(s.oppning);
    const a = s.vy === 'auto' ? [s._spin, s.pitch] : VYER[s.vy] || [s.yaw, s.pitch];
    grupp.rotation.y = a[0];
    const [fx, fz] = ud.fot, ca = Math.abs(Math.cos(a[0])), sa = Math.abs(Math.sin(a[0]));
    kontakt.scale.set((fx * ca + fz * sa) * 1.45 + 0.5, (fx * sa + fz * ca) * 1.45 + 0.6, 1);
    const H = ud.hojd, storlek = Math.max(H, ud.bredd * 0.85);
    const dist = (K.dist * (0.6 + storlek / 3.4)) / (s.zoom || 1), cy = H / 2 + 0.03;   // större pryl ⇒ kameran backar lite
    camera.position.set(0, cy + Math.sin(a[1]) * dist, Math.cos(a[1]) * dist); camera.lookAt(0, cy, 0);
    const t1 = performance.now(); renderer.render(scene, camera); s.ms = performance.now() - t1;
  };
  const loop = (now) => { const dt = Math.min(0.1, (now - (s._sist || now)) / 1000); s._sist = now; if (s.vy === 'auto') s._spin += dt * s.fart; s.rita(); if (s.onFrame) s.onFrame(s); s._raf = requestAnimationFrame(loop); };
  s.start = () => { if (!s._raf) { s._sist = 0; s._raf = requestAnimationFrame(loop); } };
  s.stop = () => { cancelAnimationFrame(s._raf); s._raf = 0; };
  s.rita();
  return s;
}
