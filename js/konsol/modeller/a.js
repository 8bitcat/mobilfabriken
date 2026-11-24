// Konsoler i 3D, grupp A. Samma format som KONSOLFORMER i ../konsol-gl.js. Verktygen finns i ../gl-verktyg.js.
import { $t } from '../../core/i18n.js';
import * as V from '../gl-verktyg.js';
import { KONSOL } from '../konsoller.js';

const { TH, mat, glans, skugg, platta, staende, kloss, rund, kabel, styrkors, glimtEtikett, kropp, klamp01 } = V;
const metall = (c = 0xd4d4da, o = {}) => mat(c, { metalness: 1, roughness: 0.28, clearcoat: 0.4, ...o });
// canvas → textur (text, träådring, etiketter)
function duk(w, h, rita) {
  const T = TH(), c = document.createElement('canvas'); c.width = w; c.height = h; rita(c.getContext('2d'), w, h);
  const tx = new T.CanvasTexture(c); tx.colorSpace = T.SRGBColorSpace; tx.anisotropy = 4; return tx;
}
// dekal: platt bild på en yta. Liggande (uppåt, läses framifrån) eller stående (mot +z).
function dekal(g, tex, w, h, x, y, z, liggande = true, o = {}) {
  const T = TH(), me = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.5, metalness: 0, ...o }));
  if (liggande) me.rotation.x = -Math.PI / 2; me.position.set(x, y, z); g.add(me); return me;
}
// text på genomskinlig botten
const textDuk = (w, h, rader) => duk(w, h, (x) => { for (const [s, px, py, font, farg, just = 'left'] of rader) { x.font = font; x.fillStyle = farg; x.textAlign = just; x.textBaseline = 'middle'; x.fillText(s, px, py); } });
// sidoprofil (y uppåt, s.x = framåt) som dras ut i bredd W längs x – som brödlådan i ../konsol-gl.js
function profil(punkter, W, m, bev = 0.03) {
  const T = TH(), s = new T.Shape(); s.moveTo(...punkter[0]); for (const p of punkter.slice(1)) s.lineTo(...p); s.closePath();
  const geo = new T.ExtrudeGeometry(s, { depth: W - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelOffset: -bev, bevelSegments: 3, curveSegments: 8 });   // fasen inåt: ytterkanten = profilen
  geo.translate(0, 0, -(W - 2 * bev) / 2); geo.computeVertexNormals();
  const me = skugg(new T.Mesh(geo, m)); me.rotation.y = -Math.PI / 2; return me;
}
// spelkassett: stående låda med etikett mot +z (glimtens bild)
function kassett(g, w, h, d, farg, glimt, etikettH, ram = null) {
  const T = TH(), k = new T.Group(); g.add(k);
  staende(k, w, h, d, mat(farg, { roughness: 0.6 }), 0, 0, 0, 0.03, 0.01);
  const ew = w * 0.84, eh = etikettH;
  if (ram) dekal(k, ram, ew + 0.04, eh + 0.04, 0, h - eh / 2 - 0.08, d / 2 + 0.002, false);
  const e = new T.Mesh(new T.PlaneGeometry(ew, eh * (ram ? 0.62 : 1)), new T.MeshStandardMaterial({ map: glimtEtikett(glimt), roughness: 0.5 }));
  e.position.set(0, h - eh / 2 - 0.08 - (ram ? eh * 0.12 : 0), d / 2 + 0.004); k.add(e);
  return k;
}
// en pixelbild som etikett med vit ram och svart rutnät överst (Master System-stilen)
function rutnatEtikett(titel) {
  return duk(256, 200, (x) => {
    x.fillStyle = '#f4f4f0'; x.fillRect(0, 0, 256, 200);
    x.strokeStyle = '#1a1a1a'; x.lineWidth = 2; for (let i = 0; i < 256; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 40); x.stroke(); }
    for (let j = 0; j <= 40; j += 13) { x.beginPath(); x.moveTo(0, j); x.lineTo(256, j); x.stroke(); }
    x.fillStyle = '#d01818'; x.fillRect(0, 186, 256, 14);
    x.font = 'bold 20px sans-serif'; x.fillStyle = '#1a1a1a'; x.textAlign = 'center'; x.fillText(titel, 128, 178);
  });
}
// DE-9-handkontrollsport: trapets i silverram
function port(g, x, y, z, framat = true) {
  const s = framat ? 1 : -1;
  kloss(g, 0.3, 0.14, 0.03, mat(0x0c0c0e), x, y, z); kloss(g, 0.34, 0.03, 0.035, metall(), x, y + 0.085, z); kloss(g, 0.3, 0.03, 0.035, metall(), x, y - 0.085, z);
  for (let i = 0; i < 5; i++) rund(g, 0.012, 0.02, metall(0xc8a040), x - 0.1 + i * 0.05, y + 0.03, z + s * 0.012, 8).rotation.x = Math.PI / 2;
}

// ---------- 1977 ATARO 2600 (Atari 2600, "heavy sixer") ----------
function traTextur() {
  return duk(512, 96, (x, w, h) => {
    x.fillStyle = '#6a3a1a'; x.fillRect(0, 0, w, h);
    for (let j = 0; j < h; j++) { const v = Math.sin(j * 0.21) * 0.5 + Math.sin(j * 0.07 + 1) * 0.5; x.fillStyle = `rgba(${v > 0 ? '150,92,48' : '58,28,10'},${Math.abs(v) * 0.55})`; x.fillRect(0, j, w, 1); }
    for (let i = 0; i < 70; i++) { const y0 = (i * 37) % h, a = 0.15 + ((i * 7) % 5) * 0.06; x.strokeStyle = `rgba(40,18,6,${a})`; x.lineWidth = 1 + (i % 3) * 0.6; x.beginPath(); x.moveTo(0, y0); for (let px = 0; px <= w; px += 16) x.lineTo(px, y0 + Math.sin(px * 0.012 + i) * 4 + Math.sin(px * 0.05 + i * 2) * 1.2); x.stroke(); }
  });
}
function ataroSpak(g, x, z, rot) {
  // CX40: fyrkantig svart bas, gummidamask, smal spak, röd avtryckare i hörnet
  const T = TH(), k = new T.Group(); k.position.set(x, 0, z); k.rotation.y = rot; g.add(k);
  const svart = mat(0x141416, { roughness: 0.55 });
  platta(k, 0.86, 0.86, 0.24, svart, 0, 0, 0, 0.1, 0.04);
  platta(k, 0.7, 0.7, 0.03, mat(0x1c1c20, { roughness: 0.7 }), 0, 0.24, 0.02, 0.08, 0.01);
  const fot = rund(k, 0.17, 0.05, mat(0x0e0e10, { roughness: 0.85 }), 0, 0.28, 0.04, 28);
  const damask = skugg(new T.Mesh(new T.CylinderGeometry(0.06, 0.15, 0.14, 24), mat(0x0e0e10, { roughness: 0.9 }))); damask.position.set(0, 0.36, 0.04); k.add(damask);
  for (let i = 0; i < 3; i++) { const r = new T.Mesh(new T.TorusGeometry(0.135 - i * 0.03, 0.012, 6, 24), mat(0x0a0a0c, { roughness: 0.9 })); r.rotation.x = Math.PI / 2; r.position.set(0, 0.31 + i * 0.04, 0.04); k.add(r); }
  const spak = rund(k, 0.04, 0.5, glans(0x101012), 0, 0.62, 0.04, 16); spak.rotation.z = 0.08;
  rund(k, 0.075, 0.07, glans(0xd01818), -0.27, 0.27, -0.27, 24); rund(k, 0.095, 0.02, mat(0x0e0e10), -0.27, 0.245, -0.27, 24);
  dekal(k, textDuk(64, 32, [[$t('TOP'), 32, 16, 'bold 22px sans-serif', '#e88820', 'center']]), 0.14, 0.07, 0, 0.272, -0.3);
  return k;
}
function ataro(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#1c1c1e'), W = 3.43, D = 2.35, TOPP = 0.66;
  // kroppen sedd från sidan: låg fram, träpanelen lutar upp mot den räfflade ovansidan
  g.add(profil([[1.17, 0], [1.17, 0.3], [0.5, TOPP], [-1.17, TOPP], [-1.17, 0]], W, m));
  // träpanelen på framsidans lutning
  const a = Math.atan2(TOPP - 0.3, 0.67), L = Math.hypot(TOPP - 0.3, 0.67), n = [Math.sin(a), Math.cos(a)];   // n = (z, y)
  const tra = skugg(new T.Mesh(new T.BoxGeometry(W - 0.04, 0.02, L - 0.02), new T.MeshPhysicalMaterial({ map: traTextur(), roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.3 })));
  tra.rotation.x = a; tra.position.set(0, (0.3 + TOPP) / 2 + n[1] * 0.025, (1.17 + 0.5) / 2 + n[0] * 0.025 + 0.015); g.add(tra);
  // sex silverreglage i träet, tre på var sida
  const pa = (f) => [1.17 - 0.67 * f + n[0] * 0.04, 0.3 + (TOPP - 0.3) * f + n[1] * 0.04];
  for (const [i, sx] of [-1.42, -1.0, -0.58, 0.58, 1.0, 1.42].entries()) {
    const [z, y] = pa(0.52), r = new T.Group(); r.position.set(sx, y, z); r.rotation.x = a; g.add(r);
    kloss(r, 0.17, 0.012, 0.28, mat(0x0a0a0c), 0, 0, 0);
    const krom = metall(0xf4f4f8, { metalness: 0.65, roughness: 0.22 });
    const spak = kloss(r, 0.07, 0.17, 0.07, krom, 0, 0.075, 0); spak.rotation.x = i % 2 ? 0.45 : -0.35;
    kloss(r, 0.09, 0.03, 0.09, krom, 0, 0.16, i % 2 ? -0.035 : 0.03);
  }
  // reglagens text på den svarta kanten ovanför träet
  const namn = [$t('STRÖM'), $t('TV-TYP'), $t('SVÅR V'), $t('SVÅR H'), $t('VÄLJ'), $t('START')];
  dekal(g, textDuk(1024, 48, namn.map((s, i) => [s, 512 + [-1.42, -1.0, -0.58, 0.58, 1.0, 1.42][i] / (W - 0.2) * 1024, 24, 'bold 26px sans-serif', '#e8e8e8', 'center'])), W - 0.2, 0.094, 0, TOPP + 0.003, 0.36);
  // ovansidans räfflor på båda sidor om kassettfacket
  for (let i = 0; i < 7; i++) for (const s of [-1, 1]) kloss(g, 1.08, 0.035, 0.06, mat(0x141416, { roughness: 0.5 }), s * 1.12, TOPP + 0.017, 0.2 - i * 0.19);
  // upphöjt kassettfack i mitten bak
  platta(g, 1.18, 1.0, 0.12, m, 0, TOPP - 0.01, -0.45, 0.06, 0.02);
  kloss(g, 0.96, 0.02, 0.26, mat(0x060608), 0, TOPP + 0.112, -0.45);
  dekal(g, textDuk(512, 64, [[$t('ORBITEK'), 20, 32, 'bold 44px sans-serif', '#d8d8d8'], [$t('VIDEO SPELSYSTEM'), 200, 34, 'bold 26px sans-serif', '#a8a8a8']]), 1.1, 0.14, -1.0, 0.15, 1.172, false);   // på den svarta framkanten
  // baksidan: två handkontrollsportar, kanalväljare, strömuttag
  for (const px of [-1.1, 1.1]) port(g, px, 0.3, -1.19, false);
  kloss(g, 0.16, 0.08, 0.04, metall(), 0.3, 0.32, -1.19); kloss(g, 0.1, 0.1, 0.04, mat(0x0a0a0c), -0.25, 0.32, -1.19);
  // kassetten: svart med bildetikett, sticker upp ur facket
  const kass = kassett(g, 0.82, 0.98, 0.22, 0x1a1a1c, 'invaders', 0.5);
  for (let i = 0; i < 4; i++) kloss(kass, 0.86, 0.02, 0.24, mat(0x101012), 0, 0.12 + i * 0.07, 0);   // greppränder
  ataroSpak(g, 2.75, 0.55, -0.25);
  kabel(g, [[2.66, 0.12, 0.13], [2.62, 0.03, -0.5], [2.2, 0.03, -1.45], [1.4, 0.03, -1.55], [1.1, 0.3, -1.25]], mat(0x101012), 0.022);
  g.userData.satt = (o = 0) => {
    o = klamp01(o);
    // först rakt upp ur facket, sedan ställs den på golvet bredvid
    const upp = Math.min(1, o / 0.45), ner = Math.max(0, (o - 0.45) / 0.55);
    kass.position.set(-2.4 * ner, (TOPP - 0.3) + upp * 1.0 * (1 - ner) - (TOPP - 0.3) * ner, -0.45 + ner * 0.9);
    kass.rotation.y = 0.45 * ner;
  };
  return g;
}

// ---------- 1982 KOLEKO VISION (ColecoVision) ----------
function kolekoKontroll(g, x, y, z, rot) {
  // lång svart dosa: kort spak med rund knopp upptill, orange sidoknappar, sifferknappar 1–9 * 0 #
  const T = TH(), k = new T.Group(); k.position.set(x, y, z); k.rotation.y = rot; g.add(k);
  const svart = mat(0x18181a, { roughness: 0.5 });
  platta(k, 0.66, 1.5, 0.24, svart, 0, 0, 0, 0.12, 0.04);
  platta(k, 0.54, 0.84, 0.02, mat(0x0e0e10), 0, 0.24, 0.24, 0.03, 0.006);                          // överlägget runt knapparna
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) platta(k, 0.13, 0.13, 0.04, mat(0x9a9aa0, { roughness: 0.35 }), (c - 1) * 0.16, 0.25, -0.0 + r * 0.17, 0.025, 0.01);
  dekal(k, textDuk(192, 256, ['123', '456', '789', '*0#'].flatMap((rad, r) => [...rad].map((ch, c) => [ch, 32 + c * 64, 34 + r * 64, 'bold 40px sans-serif', '#1a1a1a', 'center']))), 0.48, 0.66, 0, 0.292, 0.255);
  rund(k, 0.05, 0.12, mat(0x101012), 0, 0.3, -0.48, 16);
  const knopp = rund(k, 0.14, 0.05, glans(0x141416), 0, 0.37, -0.48, 32); rund(k, 0.1, 0.012, mat(0x2a2a2e, { roughness: 0.8 }), 0, 0.4, -0.48, 32);
  for (const s of [-1, 1]) kloss(k, 0.05, 0.12, 0.2, glans(0xf07818), s * 0.34, 0.13, -0.42);
  return k;
}
function koleko(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#1a1a1c'), W = 3.56, D = 2.03, H = 0.62, BOTTEN = 0.4;
  // lådan med en nedsänkt brunn till vänster där handkontrollerna ligger
  platta(g, W, D, BOTTEN, m, 0, 0, 0, 0.06, 0.02);
  const BX0 = -W / 2 + 0.12, BX1 = 0.42, BZ0 = -D / 2 + 0.16, BZ1 = D / 2 - 0.34;
  platta(g, W / 2 - BX1, D, H - BOTTEN, m, (BX1 + W / 2) / 2, BOTTEN - 0.01, 0, 0.06, 0.02);           // högra däcket
  platta(g, BX1 - BX0 + 0.12, D / 2 - BZ1, H - BOTTEN, m, (BX0 + BX1) / 2 - 0.06, BOTTEN - 0.01, (BZ1 + D / 2) / 2, 0.04, 0.015);   // framkanten
  platta(g, BX1 - BX0 + 0.12, BZ0 + D / 2, H - BOTTEN, m, (BX0 + BX1) / 2 - 0.06, BOTTEN - 0.01, (BZ0 - D / 2) / 2, 0.04, 0.015);   // bakkanten
  platta(g, 0.12, D, H - BOTTEN, m, -W / 2 + 0.06, BOTTEN - 0.01, 0, 0.04, 0.015);                     // vänsterkanten
  const matt = new (TH().MeshStandardMaterial)({ color: 0x0c0c0e, roughness: 0.95 });   // brunnen är matt inuti
  platta(g, BX1 - BX0, BZ1 - BZ0, 0.01, matt, (BX0 + BX1) / 2, BOTTEN, (BZ0 + BZ1) / 2, 0.03, 0.004);
  const vh = H - BOTTEN - 0.01, vy = BOTTEN + vh / 2 + 0.005;
  kloss(g, BX1 - BX0, vh, 0.01, matt, (BX0 + BX1) / 2, vy, BZ0 + 0.006); kloss(g, BX1 - BX0, vh, 0.01, matt, (BX0 + BX1) / 2, vy, BZ1 - 0.006);
  kloss(g, 0.01, vh, BZ1 - BZ0, matt, BX0 + 0.006, vy, (BZ0 + BZ1) / 2); kloss(g, 0.01, vh, BZ1 - BZ0, matt, BX1 - 0.006, vy, (BZ0 + BZ1) / 2);
  // framsidan: aluminiumränder och namnet
  for (let i = 0; i < 4; i++) kloss(g, W - 1.3, 0.035, 0.012, metall(0xc8ccd4, { roughness: 0.35 }), -0.6, 0.14 + i * 0.09, D / 2 + 0.004);
  dekal(g, textDuk(512, 96, [[$t('LUMA'), 10, 48, 'bold italic 56px sans-serif', '#f0f0f0'], [$t('VISION'), 250, 50, 'italic 50px sans-serif', '#d84040']]), 1.0, 0.19, 1.15, 0.33, D / 2 + 0.004, false);
  // högra däcket: strömbrytare, RESET, kassettfacket
  kloss(g, 0.3, 0.02, 0.1, mat(0x08080a), 1.1, H + 0.005, 0.6); kloss(g, 0.1, 0.06, 0.08, metall(), 1.02, H + 0.03, 0.6);
  rund(g, 0.07, 0.04, glans(0x2a2a2e), 1.5, H + 0.02, 0.6, 20);
  dekal(g, textDuk(256, 48, [[$t('STRÖM'), 70, 24, 'bold 26px sans-serif', '#cccccc', 'center'], [$t('RESET'), 200, 24, 'bold 26px sans-serif', '#cccccc', 'center']]), 0.72, 0.13, 1.25, H + 0.003, 0.78);
  platta(g, 1.12, 0.36, 0.06, mat(0x222226), 1.08, H - 0.01, -0.3, 0.04, 0.01);
  kloss(g, 0.98, 0.02, 0.12, mat(0x050506), 1.08, H + 0.05, -0.3);
  for (let i = 0; i < 6; i++) kloss(g, 0.02, 0.012, 0.6, mat(0x101012), 0.62 + i * 0.2, H + 0.006, -0.82 + 0.0);   // räfflor bakom facket
  const kass = kassett(g, 0.92, 0.9, 0.2, 0x1c1c1e, 'donkey', 0.56); kass.position.set(1.08, H - 0.28, -0.3);
  // baksidan: två handkontrollsportar, strömintag och antennkontakt
  for (const px of [-1.2, -0.7]) port(g, px, 0.22, -D / 2 - 0.01, false);
  kloss(g, 0.22, 0.12, 0.04, mat(0x0a0a0c), 0.6, 0.22, -D / 2 - 0.01); rund(g, 0.05, 0.05, metall(), 1.2, 0.22, -D / 2 - 0.02, 16).rotation.x = Math.PI / 2;
  // handkontrollerna: en i brunnen, en som tas upp och läggs bredvid
  kolekoKontroll(g, -1.2, BOTTEN + 0.01, -0.12, Math.PI);
  const losa = kolekoKontroll(g, 0, 0, 0, 0);
  kabel(g, [[-1.2, BOTTEN + 0.15, -0.88], [-1.0, BOTTEN + 0.06, -0.92], [-0.6, BOTTEN + 0.04, -0.9], [-0.3, BOTTEN + 0.04, -0.75]], mat(0x101012), 0.02);
  let sladd = null;
  g.userData.satt = (o = 1) => {
    o = klamp01(o);
    const p = o * o * (3 - 2 * o);
    losa.position.set(-0.45 + p * 3.0, BOTTEN + 0.01 - p * (BOTTEN + 0.01) + Math.sin(o * Math.PI) * 0.6, -0.12 + p * 0.55); losa.rotation.y = Math.PI - p * (Math.PI - 0.35);
    // sladden från kontrollens övre ände ner i brunnen
    if (sladd) { g.remove(sladd); sladd.geometry.dispose(); }
    const top = new T.Vector3(0, 0.14, -0.72).applyEuler(losa.rotation).add(losa.position);
    sladd = kabel(g, [[top.x, top.y, top.z], [top.x - 0.25, 0.03 + p * 0.0, top.z - 0.1 * p], [0.7 * p - 0.2, Math.max(0.03, BOTTEN * (1 - p)) + 0.04 * p, -0.95], [-0.35, BOTTEN + 0.05, -0.9]], mat(0x101012), 0.02);
  };
  return g;
}

// ---------- 1987 SEGO MASTER SYSTEM (Sega Master System) ----------
function segoKontroll(g, x, z, rot, glimt = null) {
  const T = TH(), k = new T.Group(); k.position.set(x, 0, z); k.rotation.y = rot; g.add(k);
  platta(k, 1.38, 0.62, 0.2, mat(0x141416, { roughness: 0.45 }), 0, 0, 0, 0.06, 0.03);
  platta(k, 0.42, 0.42, 0.01, mat(0x3a3a40, { roughness: 0.4 }), -0.4, 0.2, 0.02, 0.05, 0.004);
  const kors = new T.Group(); kors.position.set(-0.4, 0.21, 0.02); k.add(kors); styrkors(kors, 0.32, mat(0x0c0c0e, { roughness: 0.4 }), 0, 0.03, 0);
  rund(kors, 0.03, 0.04, mat(0x2a2a30), 0, 0.06, 0, 12);
  for (const [i, bx] of [0.27, 0.48].entries()) { rund(k, 0.085, 0.06, glans(0x101012), bx, 0.23, 0.08, 24); rund(k, 0.1, 0.012, mat(0x3a3a40), bx, 0.205, 0.08, 24); }
  dekal(k, textDuk(256, 64, [['1', 64, 30, 'bold 34px sans-serif', '#e8e8e8', 'center'], ['2', 188, 30, 'bold 34px sans-serif', '#e8e8e8', 'center']]), 0.42, 0.105, 0.375, 0.205, 0.22);
  dekal(k, textDuk(256, 64, [[$t('TORA'), 128, 32, 'bold italic 44px sans-serif', '#e8e8f0', 'center']]), 0.32, 0.08, 0.06, 0.205, -0.19);
  return k;
}
function mastersystem(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#151517'), W = 3.65, D = 1.7;
  // kilformad profil: låg sned framsida, däck, och ett upphöjt bakparti runt kassettfacket
  g.add(profil([[0.85, 0], [0.85, 0.12], [0.6, 0.4], [0.22, 0.42], [0.12, 0.6], [-0.85, 0.64], [-0.85, 0]], W, m));
  const a = Math.atan2(0.28, 0.25);   // framsidans lutning
  // röd linje längs framsidans överkant och längs däcket
  kloss(g, W - 0.08, 0.025, 0.03, glans(0xd81818), 0, 0.405, 0.6);
  kloss(g, W - 0.08, 0.02, 0.025, glans(0xd81818), 0, 0.62, 0.11);
  // framsidan: namnet, kortplatsen och kontrollportarna
  const fram = new T.Group(); fram.position.set(0, 0.26, 0.73 + 0.012); fram.rotation.x = -(Math.PI / 2 - a); g.add(fram);
  dekal(fram, textDuk(512, 64, [[$t('SYSTEM 8'), 8, 32, 'bold 46px sans-serif', '#f0f0f0']]), 1.3, 0.16, -1.05, 0, 0, false);
  kloss(fram, 0.9, 0.05, 0.03, mat(0x050506), 0.55, 0.02, 0); kloss(fram, 0.96, 0.012, 0.035, mat(0x2a2a30), 0.55, 0.06, 0);
  dekal(fram, textDuk(256, 32, [[$t('TORA KORT'), 128, 16, 'bold 22px sans-serif', '#b0b0b8', 'center']]), 0.5, 0.06, 0.55, -0.09, 0.005, false);
  for (const px of [1.25, 1.6]) { kloss(fram, 0.26, 0.12, 0.03, mat(0x0a0a0c), px, 0, 0); kloss(fram, 0.3, 0.02, 0.035, metall(), px, 0.07, 0); }
  // däcket: röd PAUS-knapp och RESET
  platta(g, 0.3, 0.12, 0.05, glans(0xd81818), 1.15, 0.41, 0.4, 0.03, 0.01);
  platta(g, 0.3, 0.12, 0.04, mat(0x2a2a2e), 0.7, 0.41, 0.4, 0.03, 0.01);
  dekal(g, textDuk(256, 32, [[$t('RESET'), 64, 16, 'bold 22px sans-serif', '#c8c8c8', 'center'], [$t('PAUS'), 192, 16, 'bold 22px sans-serif', '#ff4040', 'center']]), 0.9, 0.11, 0.93, 0.425, 0.28);
  // bakpartiet: kassettfacket med lucka i mitten, sneda räfflor till höger, röd STRÖM-brytare
  platta(g, 1.25, 0.5, 0.04, mat(0x101012), -0.35, 0.6, -0.38, 0.04, 0.01);
  kloss(g, 1.0, 0.02, 0.14, mat(0x040405), -0.35, 0.645, -0.38);
  for (let i = 0; i < 9; i++) { const r = kloss(g, 0.03, 0.025, 0.7, mat(0x0c0c0e, { roughness: 0.6 }), 0.55 + i * 0.13, 0.64, -0.38); r.rotation.y = 0.55; }
  for (let i = 0; i < 5; i++) { const r = kloss(g, 0.03, 0.025, 0.7, mat(0x0c0c0e, { roughness: 0.6 }), -1.6 + i * 0.13, 0.62, -0.38); r.rotation.y = -0.55; }
  kloss(g, 0.34, 0.02, 0.12, mat(0x050506), 1.45, 0.645, 0.0); kloss(g, 0.12, 0.06, 0.1, glans(0xd81818), 1.38, 0.67, 0.0);
  dekal(g, textDuk(128, 32, [[$t('STRÖM'), 64, 16, 'bold 24px sans-serif', '#ff4040', 'center']]), 0.3, 0.075, 1.45, 0.647, -0.13);
  dekal(g, textDuk(256, 64, [[$t('TORA'), 128, 32, 'bold italic 56px sans-serif', '#3a7ae8', 'center']]), 0.5, 0.125, -1.35, 0.65, -0.5);
  // baksidan: strömintag, AV-uttag och antennkontakt
  kloss(g, 0.2, 0.12, 0.04, mat(0x0a0a0c), 1.2, 0.3, -0.86); kloss(g, 0.3, 0.12, 0.04, mat(0x0a0a0c), 0.5, 0.3, -0.86);
  for (let i = 0; i < 4; i++) rund(g, 0.012, 0.02, metall(0xc8a040), 0.4 + i * 0.065, 0.3, -0.875, 8).rotation.x = Math.PI / 2;
  rund(g, 0.05, 0.05, metall(), -0.2, 0.3, -0.87, 16).rotation.x = Math.PI / 2;
  // kassetten med den vita rutnätsetiketten
  const kass = kassett(g, 0.9, 0.86, 0.2, 0x141416, 'alexkidz', 0.58, rutnatEtikett($t('KID KOSMO')));
  segoKontroll(g, 0.95, 1.55, -0.18);
  kabel(g, [[0.98, 0.1, 1.24], [1.1, 0.03, 1.05], [1.35, 0.03, 0.98], [1.4, 0.2, 0.86]], mat(0x101012), 0.02);
  g.userData.satt = (o = 0) => {
    o = klamp01(o);
    const upp = Math.min(1, o / 0.45), ner = Math.max(0, (o - 0.45) / 0.55);
    kass.position.set(-0.35 - 1.95 * ner, 0.3 + upp * 0.95 * (1 - ner) - 0.3 * ner, -0.38 + ner * 0.85);
    kass.rotation.y = 0.4 * ner;
  };
  return g;
}

// ---------- 1990 SEGO MEGA DRIVE (Sega Mega Drive) ----------
function skivTopp() {
  // den runda skivans ovansida: koncentriska ringar, röd kant och 16-BIT i guld längs bågen
  return duk(512, 512, (x) => {
    const c = 256;
    x.fillStyle = '#1a1a1e'; x.fillRect(0, 0, 512, 512);
    for (let r = 250; r > 120; r -= 12) { x.strokeStyle = r % 24 ? '#26262c' : '#141418'; x.lineWidth = 5; x.beginPath(); x.arc(c, c, r, 0, Math.PI * 2); x.stroke(); }
    x.strokeStyle = '#c01818'; x.lineWidth = 7; x.beginPath(); x.arc(c, c, 246, 0, Math.PI * 2); x.stroke();
    // 16-BIT på den främre bågen (dukens nederkant = konsolens framsida), bokstäverna lutar in mot mitten
    x.font = 'bold italic 76px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    const s = $t('16-BIT'), bag = 1.15;
    [...s].forEach((ch, i) => {
      const v = Math.PI / 2 + bag / 2 - (i / (s.length - 1)) * bag;
      x.save(); x.translate(c + Math.cos(v) * 196, c + Math.sin(v) * 196); x.rotate(v - Math.PI / 2);
      const gr = x.createLinearGradient(0, -34, 0, 34); gr.addColorStop(0, '#fff2a8'); gr.addColorStop(0.5, '#e0a820'); gr.addColorStop(1, '#a06810');
      x.fillStyle = gr; x.fillText(ch, 0, 0); x.restore();
    });
    x.font = 'bold 20px sans-serif'; x.fillStyle = '#8a8a90'; x.fillText($t('HIGH GRADE MULTI PURPOSE USE'), c, c - 200);
  });
}
function megaKontroll(g, x, z, rot) {
  // halvmåneformad treknappskontroll: styrkors till vänster, START i mitten, A B C på en sned rad
  const T = TH(), k = new T.Group(); k.position.set(x, 0, z); k.rotation.y = rot; g.add(k);
  const s = new T.Shape();
  s.moveTo(0, 0.36);
  s.bezierCurveTo(0.35, 0.39, 0.62, 0.4, 0.78, 0.26); s.bezierCurveTo(0.92, 0.12, 0.92, -0.22, 0.78, -0.38); s.bezierCurveTo(0.66, -0.5, 0.42, -0.48, 0.32, -0.3);
  s.bezierCurveTo(0.22, -0.16, 0.1, -0.15, 0, -0.15);
  s.bezierCurveTo(-0.1, -0.15, -0.22, -0.16, -0.32, -0.3); s.bezierCurveTo(-0.42, -0.48, -0.66, -0.5, -0.78, -0.38); s.bezierCurveTo(-0.92, -0.22, -0.92, 0.12, -0.78, 0.26);
  s.bezierCurveTo(-0.62, 0.4, -0.35, 0.39, 0, 0.36);
  const geo = new T.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 5, curveSegments: 24 }); geo.computeVertexNormals();
  const kr = skugg(new T.Mesh(geo, mat(0x161618, { roughness: 0.4, clearcoat: 0.5 }))); kr.rotation.x = -Math.PI / 2; kr.position.y = 0.05; k.add(kr);
  const Y = 0.24;
  rund(k, 0.2, 0.02, mat(0x0c0c0e, { roughness: 0.5 }), -0.5, Y, 0.0, 32);
  const kors = new T.Group(); kors.position.set(-0.5, Y + 0.01, 0); k.add(kors); styrkors(kors, 0.3, glans(0x1a1a1e), 0, 0.02, 0);
  rund(kors, 0.04, 0.05, mat(0x2a2a2e), 0, 0.03, 0, 16);
  platta(k, 0.15, 0.06, 0.025, mat(0x2a2a30), 0, Y - 0.01, -0.05, 0.03, 0.008);
  const ABC = [[0.3, 0.12], [0.5, 0.03], [0.7, -0.08]];
  for (const [bx, bz] of ABC) { rund(k, 0.085, 0.055, glans(0x101012), bx, Y + 0.02, bz, 24); rund(k, 0.1, 0.012, mat(0x0a0a0c), bx, Y - 0.005, bz, 24); }
  dekal(k, textDuk(512, 128, [
    [$t('START'), 256, 104, 'bold 22px sans-serif', '#b0b0b8', 'center'],
    ...ABC.map(([bx, bz], i) => ['ABC'[i], 256 + bx * 512 / 1.8, 64 + (bz + 0.17) * 512 / 1.8, 'bold 30px sans-serif', '#e02828', 'center']),
    [$t('TORA'), 256, 26, 'bold italic 34px sans-serif', '#e8e8f0', 'center']]), 1.8, 0.45, 0, Y + 0.0025, -0.05);
  return k;
}
function megadrive(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#141416'), W = 2.8, D = 2.12, H = 0.5;
  g.add(profil([[1.06, 0], [1.06, 0.28], [0.86, H - 0.02], [-1.06, H], [-1.06, 0]], W, m));
  // den runda upphöjda skivan med 16-BIT
  const SX = 0, SZ = -0.08, SR = 0.78;
  rund(g, SR + 0.03, 0.05, mat(0x0c0c0e), SX, H + 0.02, SZ, 64);
  rund(g, SR, 0.1, m, SX, H + 0.05, SZ, 64);
  dekal(g, skivTopp(), SR * 2, SR * 2, SX, H + 0.101, SZ, true, { roughness: 0.35, metalness: 0.2 });
  // kassettfacket tvärs över skivan, med fjäderluckor
  platta(g, 1.12, 0.3, 0.04, mat(0x1e1e22), SX, H + 0.09, SZ, 0.04, 0.01);
  kloss(g, 0.98, 0.02, 0.13, mat(0x030304), SX, H + 0.135, SZ);
  // strömbrytaren (skjutreglage) till vänster och RESET till höger
  kloss(g, 0.34, 0.02, 0.09, mat(0x050506), -1.05, H + 0.005, -0.2); kloss(g, 0.1, 0.06, 0.07, mat(0x3a3a40), -1.14, H + 0.03, -0.2);
  rund(g, 0.08, 0.05, mat(0x3a3a40), 1.05, H + 0.02, -0.2, 24);
  dekal(g, textDuk(128, 32, [[$t('STRÖM'), 64, 16, 'bold 24px sans-serif', '#b8b8c0', 'center']]), 0.32, 0.08, -1.05, H + 0.003, -0.06);
  dekal(g, textDuk(128, 32, [[$t('RESET'), 64, 16, 'bold 24px sans-serif', '#b8b8c0', 'center']]), 0.32, 0.08, 1.05, H + 0.003, -0.06);
  // räfflor bak
  for (let i = 0; i < 5; i++) for (const s of [-1, 1]) kloss(g, 0.42, 0.02, 0.03, mat(0x0c0c0e), s * 1.05, H + 0.008, -0.45 - i * 0.12);
  // namnet fram till vänster, volymreglaget och hörlursuttaget till höger, två portar fram
  dekal(g, textDuk(512, 96, [[$t('MEGA 16'), 8, 50, 'bold italic 64px sans-serif', '#e8e8e8']]), 1.0, 0.19, -0.8, H + 0.003, 0.68);
  kloss(g, 0.5, 0.05, 0.03, mat(0x050506), 0.85, 0.16, D / 2 + 0.003); kloss(g, 0.08, 0.09, 0.05, mat(0x3a3a40), 0.95, 0.16, D / 2 + 0.01);
  const jack = rund(g, 0.045, 0.03, metall(), 1.22, 0.16, D / 2 + 0.005, 16); jack.rotation.x = Math.PI / 2;
  dekal(g, textDuk(256, 32, [[$t('VOLYM'), 128, 16, 'bold 22px sans-serif', '#a0a0a8', 'center']]), 0.4, 0.05, 0.85, 0.235, D / 2 + 0.004, false);
  for (const px of [-0.95, -0.45]) port(g, px, 0.15, D / 2 + 0.01);
  // baksidan: strömintag, antennkontakt och AV-uttaget
  kloss(g, 0.2, 0.12, 0.04, mat(0x0a0a0c), -0.9, 0.25, -D / 2 - 0.01); rund(g, 0.05, 0.05, metall(), -0.4, 0.25, -D / 2 - 0.02, 16).rotation.x = Math.PI / 2;
  const av = rund(g, 0.09, 0.05, mat(0x0a0a0c), 0.2, 0.25, -D / 2 - 0.02, 20); av.rotation.x = Math.PI / 2;
  for (let i = 0; i < 6; i++) rund(g, 0.012, 0.02, metall(0xc8a040), 0.2 + Math.cos(i) * 0.05, 0.25 + Math.sin(i) * 0.05, -D / 2 - 0.045, 8).rotation.x = Math.PI / 2;
  const kass = kassett(g, 0.92, 1.0, 0.2, 0x141416, 'sonny', 0.6);
  megaKontroll(g, 2.15, 1.25, -0.35);
  kabel(g, [[1.95, 0.1, 0.92], [1.4, 0.03, 1.35], [0.2, 0.03, 1.5], [-0.45, 0.03, 1.4], [-0.45, 0.15, 1.08]], mat(0x101012), 0.022);
  g.userData.satt = (o = 0) => {
    o = klamp01(o);
    const upp = Math.min(1, o / 0.45), ner = Math.max(0, (o - 0.45) / 0.55);
    kass.position.set(SX - 2.0 * ner, H - 0.25 + upp * 1.0 * (1 - ner) - (H - 0.25) * ner, SZ + ner * 0.9);
    kass.rotation.y = 0.4 * ner;
  };
  return g;
}

// ---------- pixelbilder 40×28 för tidslinjen (ATARO och MEGA DRIVE finns redan i ../konsoller.js) ----------
const pR = (x, X, Y, W, H, f) => { if (W <= 0 || H <= 0) return; x.fillStyle = f; x.fillRect(Math.round(X), Math.round(Y), Math.round(W), Math.round(H)); };
const pP = (x, X, Y, f) => pR(x, X, Y, 1, 1, f);
function pLada(x, X, Y, w, topp, fram, cTopp, cFram) {
  pR(x, X + 2, Y, w - 2, topp, cTopp); pR(x, X, Y + topp, w, fram, cFram);
  for (let i = 0; i < topp; i++) pP(x, X + 2 - Math.round((i / topp) * 2), Y + i, cTopp);
  pR(x, X, Y + topp + fram - 1, w, 1, '#101018'); pR(x, X + 2, Y, w - 2, 1, 'rgba(255,255,255,0.35)');
}
const pSkugga = (x, X, Y, w) => { pR(x, X + 2, Y, w - 4, 1, 'rgba(0,0,0,0.35)'); pR(x, X + 4, Y + 1, w - 8, 1, 'rgba(0,0,0,0.2)'); };
function kolekoPixel(x, X, Y) {
  pSkugga(x, X, Y + 25, 40); pLada(x, X, Y + 11, 40, 7, 8, '#262628', '#18181a');
  pR(x, X + 3, Y + 12, 21, 5, '#0c0c0e'); pR(x, X + 5, Y + 12, 7, 4, '#202024'); pR(x, X + 14, Y + 12, 7, 4, '#202024');
  pR(x, X + 6, Y + 13, 2, 1, '#9a9aa0'); pR(x, X + 15, Y + 13, 2, 1, '#9a9aa0');
  pR(x, X + 27, Y + 6, 10, 8, '#1c1c1e'); pR(x, X + 28, Y + 7, 8, 4, '#d83030'); pR(x, X + 29, Y + 8, 2, 2, '#f0d040');
  for (let i = 0; i < 3; i++) pR(x, X + 2, Y + 20 + i * 2, 24, 1, '#b8bcc4');
  pR(x, X + 29, Y + 21, 8, 1, '#f0f0f0'); pR(x, X + 33, Y + 21, 4, 1, '#d84040');
}
function mastersystemPixel(x, X, Y) {
  pSkugga(x, X, Y + 25, 40); pLada(x, X, Y + 10, 40, 8, 8, '#1e1e22', '#121214');
  pR(x, X + 6, Y + 7, 18, 5, '#18181c'); pR(x, X + 8, Y + 8, 14, 2, '#040406'); pR(x, X + 9, Y + 4, 12, 4, '#141416'); pR(x, X + 10, Y + 5, 10, 2, '#f0f0f0');
  for (let i = 0; i < 5; i++) pP(x, X + 27 + i * 2, Y + 12 + (i % 2), '#2a2a30');
  pR(x, X, Y + 18, 40, 1, '#d81818'); pR(x, X + 32, Y + 16, 3, 1, '#d81818');
  pR(x, X + 3, Y + 21, 12, 1, '#f0f0f0'); pR(x, X + 22, Y + 21, 9, 1, '#040406');
}

export const KONSOLER = [
  { id: 'konsol-ataro', namn: $t('ORBITEK 2800'), forebild: 'Atari 2600', ar: 1977, glimt: 'invaders', bygg: ataro, oppna: [$t('KASSETTEN'), 0],
    info: 'Svart med träpanel fram och sex silverreglage. Spelen kommer på kassett och joysticken har en röd knapp.', pixel: (x, X, Y) => KONSOL.ataro?.rita(x, X, Y) },
  { id: 'konsol-koleko', namn: $t('LUMA VISION'), forebild: 'ColecoVision', ar: 1982, glimt: 'donkey', bygg: koleko, oppna: [$t('HANDKONTROLLEN'), 1],
    info: 'Svart låda med aluminiumränder. Handkontrollerna har sifferknappar och vilar i en brunn ovanpå konsolen.', pixel: kolekoPixel },
  { id: 'konsol-mastersystem', namn: $t('TORA SYSTEM 8'), forebild: 'Sega Master System', ar: 1987, glimt: 'alexkidz', bygg: mastersystem, oppna: [$t('KASSETTEN'), 0],
    info: 'Kantig och svart med röda detaljer. Fyrkantig handkontroll med knapparna 1 och 2.', pixel: mastersystemPixel },
  { id: 'konsol-megadrive', namn: $t('TORA MEGA 16'), forebild: 'Sega Mega Drive', ar: 1990, glimt: 'sonny', bygg: megadrive, oppna: [$t('KASSETTEN'), 0],
    info: 'Svart med en rund upphöjd skiva och 16-BIT i guld. Halvmåneformad handkontroll med knapparna A, B och C.', pixel: (x, X, Y) => KONSOL.megadrive?.rita(x, X, Y) },
];
