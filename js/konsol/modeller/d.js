// Konsoler i 3D, grupp D. Samma format som KONSOLFORMER i ../konsol-gl.js. Verktygen finns i ../gl-verktyg.js.
import * as V from '../gl-verktyg.js';
import { KONSOL } from '../konsoller.js';

const { TH, mat, glans, lyser, skugg, platta, staende, kloss, rund, glimtSkarm, glimtEtikett, kropp, grepp, kroppMaterial, klamp01 } = V;

// ---------- gemensamma hjälpare ----------
// framprofil (form i XY) som dras ut bakåt längs z, centrerad kring z0
function profilZ(g, form, djup, m, z0 = 0, bev = 0.03) {
  const T = TH(), geo = new T.ExtrudeGeometry(form, { depth: djup - 2 * bev, bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 24 });
  geo.translate(0, 0, -(djup - 2 * bev) / 2); geo.computeVertexNormals();
  const me = skugg(new T.Mesh(geo, m)); me.position.z = z0; g.add(me); return me;
}
// sidoprofil (form i ZY: formens x = framåt) som dras ut i sidled längs x, centrerad kring x0
function profilX(g, form, bredd, m, x0 = 0, bev = 0.015) {
  const T = TH(), geo = new T.ExtrudeGeometry(form, { depth: bredd - 2 * bev, bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev, bevelSegments: 2, curveSegments: 12 });
  geo.translate(0, 0, -(bredd - 2 * bev) / 2); geo.computeVertexNormals();
  const me = skugg(new T.Mesh(geo, m)); me.rotation.y = -Math.PI / 2; me.position.x = x0; g.add(me); return me;
}
// perforerat galler (grå plast med små hål) som upprepad textur; rep = rutor per modellenhet
function gallerMat(bas, hal, rep = 8, o = {}) {
  const T = TH(), c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d');
  x.fillStyle = bas; x.fillRect(0, 0, 32, 32); x.fillStyle = hal;
  for (const [cx, cy] of [[8, 8], [24, 8], [0, 24], [16, 24], [32, 24]]) { x.beginPath(); x.arc(cx, cy, 4.2, 0, Math.PI * 2); x.fill(); }
  const tex = new T.CanvasTexture(c); tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.repeat.set(rep, rep); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4;
  return mat(0xffffff, { map: tex, roughness: 0.6, clearcoat: 0.1, ...o });
}
// liten text (märken) på en genomskinlig platta, läses framifrån
function textYta(text, w, h, farg, vikt = 'bold', o = {}) {
  const T = TH(), c = document.createElement('canvas'); c.width = 512; c.height = Math.max(16, Math.round((512 * h) / w)); const x = c.getContext('2d');
  let fs = c.height * 0.8; x.font = `${vikt} ${fs}px Arial, sans-serif`;
  const bw = x.measureText(text).width; if (bw > 490) { fs *= 490 / bw; x.font = `${vikt} ${fs}px Arial, sans-serif`; }
  x.fillStyle = farg; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 256, c.height / 2 + fs * 0.05);
  const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4;
  return new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.3, metalness: 0.4, ...o }));
}
// liggande speldisk (botten skimrar, ovansidan har spelets etikett); mitt i origo
function disk(glimt, kant = null) {
  const T = TH(), d = new T.Group();
  const skiv = new T.MeshPhysicalMaterial({ color: 0xd8dce4, metalness: 0.9, roughness: 0.12, iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [200, 600] });
  rund(d, 0.6, 0.012, skiv, 0, 0, 0, 48);
  const lapp = new T.Mesh(new T.RingGeometry(0.1, 0.58, 48), new T.MeshStandardMaterial({ map: glimtEtikett(glimt), roughness: 0.45 }));
  lapp.rotation.x = -Math.PI / 2; lapp.position.y = 0.0075; d.add(lapp);
  if (kant != null) { const k = new T.Mesh(new T.RingGeometry(0.52, 0.585, 48), new T.MeshStandardMaterial({ color: kant, roughness: 0.4 })); k.rotation.x = -Math.PI / 2; k.position.y = 0.008; d.add(k); }
  rund(d, 0.1, 0.016, mat(0xb8bcc4), 0, 0, 0, 24);
  return d;
}
// rund knapp som tittar framåt (+z)
function knappZ(g, r, h, m, x, y, z) { const b = rund(g, r, h, m, x, y, z); b.rotation.x = Math.PI / 2; return b; }
// små pixelhjälpare för 40×28-bilderna
const pR = (x, X, Y, W, H, f) => { if (W <= 0 || H <= 0) return; x.fillStyle = f; x.fillRect(Math.round(X), Math.round(Y), Math.round(W), Math.round(H)); };
const pP = (x, X, Y, f) => pR(x, X, Y, 1, 1, f);
const pSkugga = (x, X, Y, w) => { pR(x, X + 2, Y, w - 4, 1, 'rgba(0,0,0,0.35)'); pR(x, X + 4, Y + 1, w - 8, 1, 'rgba(0,0,0,0.2)'); };

// ---------- handkontroll: X-lådans trådlösa (asymmetriska spakar) ----------
function xladaKontroll(g, x, z, rot) {
  const T = TH(), k = new T.Group(); k.position.set(x, 0, z); k.rotation.y = rot; g.add(k);
  const vit = mat(0xf2f2f0, { roughness: 0.35 }), gra = mat(0xb4b8c0, { roughness: 0.3, metalness: 0.35 }), mork = mat(0x34363c, { roughness: 0.7 });
  platta(k, 1.32, 0.6, 0.2, vit, 0, 0, -0.04, 0.24, 0.07);
  for (const s of [-1, 1]) {
    const gr = skugg(new T.Mesh(new T.CapsuleGeometry(0.19, 0.3, 6, 16), vit));
    gr.rotation.x = Math.PI / 2 - 0.2; gr.rotation.z = s * 0.5; gr.position.set(s * 0.43, 0.15, 0.24); gr.scale.set(1, 1, 0.8); k.add(gr);
  }
  // axelknappar (grå) längs överkanten
  for (const s of [-1, 1]) { const b = platta(k, 0.4, 0.1, 0.09, gra, s * 0.4, 0.09, -0.33, 0.04, 0.02); b.rotation.z = s * 0.06; }
  // spakar: vänster uppe, höger nere
  const spak = (sx, sz) => { rund(k, 0.1, 0.05, mat(0x202226), sx, 0.2, sz); rund(k, 0.035, 0.08, mork, sx, 0.25, sz, 12); rund(k, 0.085, 0.035, mork, sx, 0.3, sz); rund(k, 0.06, 0.01, mat(0x3c3e44, { roughness: 0.9 }), sx, 0.32, sz); };
  spak(-0.38, -0.1); spak(0.2, 0.13);
  // styrkorset: grå skiva med kors
  rund(k, 0.1, 0.03, gra, -0.2, 0.2, 0.13); V.styrkors(k, 0.17, mat(0x9a9ea6, { metalness: 0.3 }), -0.2, 0.225, 0.13);
  // A B X Y – blanka färgade knappar
  [[0, -0.22, 0xf0c020], [0.11, -0.11, 0xd82828], [0, 0.0, 0x3cb043], [-0.11, -0.11, 0x2a62d8]].forEach(([dx, dz, c]) => rund(k, 0.048, 0.05, glans(c, { emissive: c, emissiveIntensity: 0.25 }), 0.42 + dx, 0.22, dz));
  // guideknappen med ljusringen, back och start
  rund(k, 0.065, 0.03, gra, 0, 0.21, -0.17); rund(k, 0.045, 0.012, lyser(0x50e050, 0.6), 0, 0.23, -0.17);
  for (let i = 0; i < 4; i++) { const b = new T.Mesh(new T.TorusGeometry(0.082, 0.009, 6, 12, Math.PI / 2 - 0.25), lyser(0x50ff50, i === 1 ? 2 : 0.7)); b.rotation.x = -Math.PI / 2; b.rotation.z = i * (Math.PI / 2) + 0.125; b.position.set(0, 0.215, -0.17); k.add(b); }
  for (const s of [-1, 1]) { const b = rund(k, 0.028, 0.02, gra, s * 0.13, 0.21, -0.05); b.scale.set(1.4, 1, 0.8); }
  return k;
}

// ---------- 2005 X-LÅDA 360 (vit, konkav, liggande) ----------
function x360(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#efefed');
  const W = 3.03, H = 0.8, D = 2.52, c = 0.06, r = 0.1, hw = W / 2, a = hw - r;
  // framprofilen: ovan- och undersidan svänger in mot mitten (konsolen "andas in")
  const s = new T.Shape();
  s.moveTo(-a, 0); s.quadraticCurveTo(0, 2 * c, a, 0); s.quadraticCurveTo(hw, 0, hw, r); s.lineTo(hw, H - r); s.quadraticCurveTo(hw, H, a, H);
  s.quadraticCurveTo(0, H - 2 * c, -a, H); s.quadraticCurveTo(-hw, H, -hw, H - r); s.lineTo(-hw, r); s.quadraticCurveTo(-hw, 0, -a, 0);
  profilZ(g, s, D, m, 0, 0.03);
  const yTopp = (x) => H + 0.03 - c * (1 - Math.min(1, (x / a) ** 2));
  const fram = D / 2 + 0.004;
  // tunn hud som följer den svängda ovansidan (galler, hårddisk)
  const hud = (x0, x1, z0, djup, tjock, mm, lyft = 0, bev = 0.004) => {
    const f = new T.Shape(), n = 28;
    for (let i = 0; i <= n; i++) { const xx = x0 + ((x1 - x0) * i) / n; i ? f.lineTo(xx, yTopp(xx) + lyft + tjock) : f.moveTo(xx, yTopp(xx) + lyft + tjock); }
    for (let i = n; i >= 0; i--) { const xx = x0 + ((x1 - x0) * i) / n; f.lineTo(xx, yTopp(xx) + lyft - 0.02); }
    return profilZ(g, f, djup, mm, z0, bev);
  };
  const galler = gallerMat('#b4b8bf', '#4a4d54', 9);
  hud(0.06, 1.36, -0.08, 2.05, 0.008, galler);                          // grått galler till höger
  hud(-1.38, -0.1, 0.02, 1.62, 0.09, mat(0xe4e4e6, { roughness: 0.35 }), 0, 0.03);   // hårddisken
  hud(-1.24, -0.24, 0.02, 1.32, 0.012, gallerMat('#c4c8ce', '#5a5d64', 9), 0.115);    // hårddiskens galler
  // skivlådan (glider ut) i en mörk springa
  kloss(g, 1.98, 0.19, 0.02, mat(0x26262a), -0.46, 0.57, fram - 0.006);
  const krom = mat(0xdadde2, { metalness: 0.35, roughness: 0.25 });
  const lada = new T.Group(); lada.position.set(-0.46, 0.53, fram); g.add(lada);
  kloss(lada, 1.92, 0.14, 0.05, krom, 0, 0.04, 0.0);
  platta(lada, 1.78, 1.5, 0.05, mat(0x2e2e32, { roughness: 0.6 }), 0, -0.01, -0.77, 0.04, 0.01);
  rund(lada, 0.64, 0.01, mat(0x1c1c20), 0, 0.035, -0.8, 48);
  const skivan = disk('gruvkraft', 0x58b030); skivan.position.set(0, 0.05, -0.8); lada.add(skivan);
  knappZ(g, 0.045, 0.03, krom, 0.68, 0.57, fram + 0.008);                 // utmatning
  // ljusringen: blank strömknapp med fyra gröna kvartsbågar
  const rx = 1.1, ry = 0.42;
  knappZ(g, 0.2, 0.02, mat(0xc8ccd2, { metalness: 0.5, roughness: 0.25 }), rx, ry, fram + 0.004);
  const kupa = skugg(new T.Mesh(new T.SphereGeometry(0.105, 28, 14), mat(0xe2e6ea, { metalness: 0.55, roughness: 0.18 }))); kupa.scale.z = 0.4; kupa.position.set(rx, ry, fram + 0.02); g.add(kupa);
  for (let i = 0; i < 4; i++) { const b = new T.Mesh(new T.TorusGeometry(0.15, 0.017, 8, 16, Math.PI / 2 - 0.2), lyser(0x46ff46, i === 1 ? 2.6 : 1.2)); b.rotation.z = i * (Math.PI / 2) + 0.1; b.position.set(rx, ry, fram + 0.018); g.add(b); }
  // minneskortsluckan nere till vänster och märket
  kloss(g, 1.25, 0.012, 0.012, mat(0xb8b8bc), -0.72, 0.36, fram + 0.002); kloss(g, 0.012, 0.2, 0.012, mat(0xb8b8bc), -0.1, 0.26, fram + 0.002);
  const mark = textYta('AXIOM X2', 0.62, 0.09, '#8a8c92'); mark.position.set(-1.0, 0.24, fram + 0.006); g.add(mark);
  for (const sx of [-0.58, -0.4]) kloss(g, 0.12, 0.05, 0.012, mat(0xd0d0d4), sx, 0.24, fram + 0.004);
  // baksidan: två stora fläktgaller och portar
  for (const sx of [-0.85, 0.15]) staende(g, 0.85, 0.5, 0.02, gallerMat('#a8acb2', '#30323a', 9), sx, 0.15, -D / 2 - 0.003, 0.08, 0.006);
  kloss(g, 0.3, 0.16, 0.02, mat(0x202024), 0.95, 0.35, -D / 2 - 0.006); kloss(g, 0.16, 0.12, 0.02, mat(0x202024), 1.25, 0.35, -D / 2 - 0.006);
  for (const [fx, fz] of [[-1.25, 0.95], [1.25, 0.95], [-1.25, -0.95], [1.25, -0.95]]) rund(g, 0.09, 0.05, mat(0xb4b4b8), fx, -0.05, fz);
  xladaKontroll(g, 1.6, 1.95, -0.28);
  g.userData.satt = (o = 0) => { lada.position.z = fram - 0.01 + klamp01(o) * 1.55; };
  return g;
}

// ---------- 2007 PLAY STATIO 3 (blanksvart, välvd ovansida, skivspringa) ----------
function ps3(tel) {
  const T = TH(), g = new T.Group(), skal = kropp(tel, '#141418'), matt = mat(0x0c0c0e, { roughness: 0.75, clearcoat: 0.05 });
  const silver = mat(0xc8ccd4, { metalness: 0.75, roughness: 0.22 }), W = 3.25, D = 2.74, hw = W / 2 - 0.05, b = hw - 0.3;
  // nederdelen (matt, lite indragen) med silverlisten framtill
  platta(g, W - 0.18, D - 0.2, 0.5, matt, 0, 0, -0.04, 0.12, 0.03);
  const nf = D / 2 - 0.14;
  kloss(g, W - 0.4, 0.17, 0.03, silver, 0, 0.3, nf + 0.01);
  for (let i = 0; i < 4; i++) kloss(g, 0.11, 0.045, 0.02, mat(0x18181c), -1.2 + i * 0.16, 0.3, nf + 0.022);
  kloss(g, 0.7, 0.008, 0.02, mat(0x8a8e96), 0.75, 0.36, nf + 0.022);   // luckan till minneskorten
  // överskalet: välvt från sida till sida
  const s = new T.Shape(), y0 = 0.46;
  s.moveTo(-hw, y0); s.lineTo(hw, y0); s.lineTo(hw, 0.7); s.quadraticCurveTo(hw, 0.86, b, 0.9); s.quadraticCurveTo(0, 1.06, -b, 0.9); s.quadraticCurveTo(-hw, 0.86, -hw, 0.7); s.closePath();
  profilZ(g, s, D - 0.1, skal, 0, 0.05);
  const fram = (D - 0.1) / 2 + 0.004, yTopp = (x) => 0.95 + 0.08 * (1 - Math.min(1, (x / b) ** 2));
  // skivspringan, ström och utmatning
  kloss(g, 1.36, 0.03, 0.01, mat(0x020203), -0.08, 0.68, fram);
  kloss(g, 1.42, 0.008, 0.01, mat(0x3a3a42, { metalness: 0.5 }), -0.08, 0.655, fram);
  for (const bx of [1.12, 1.34]) { knappZ(g, 0.04, 0.012, silver, bx, 0.68, fram); }
  kloss(g, 0.03, 0.015, 0.01, lyser(0x40ff60, 1.6), 1.12, 0.6, fram);
  // märket på ovansidan till vänster (följer välvningen)
  const mx = -0.85, lutning = Math.atan(0.16 * -mx / (b * b)), mark = textYta('HOSHI NOVA 3', 1.2, 0.14, '#d8dce4', 'normal', { metalness: 0.2, roughness: 0.3, emissive: 0x30323a });
  mark.rotation.order = 'ZYX'; mark.rotation.set(-Math.PI / 2, 0, lutning); mark.position.set(mx, yTopp(mx) + 0.008, 0.55); g.add(mark);
  // ventiler på sidorna och baksidan
  for (const sx of [-1, 1]) for (let i = 0; i < 9; i++) kloss(g, 0.02, 0.025, 1.6, mat(0x26262c), sx * ((W - 0.18) / 2 + 0.004), 0.12 + i * 0.035, -0.1);
  for (let i = 0; i < 10; i++) kloss(g, 1.4, 0.022, 0.02, mat(0x26262c), -0.6, 0.1 + i * 0.034, -D / 2 + 0.05);
  kloss(g, 0.5, 0.2, 0.02, mat(0x1a1a1e), 0.9, 0.25, -D / 2 + 0.05);
  // skivan glider ut ur springan
  const skivan = disk('lillastora'); g.add(skivan);
  // handkontrollen (svart med PS-knapp, start/select och fyra lampor)
  const k = grepp(g, 2.3, 1.6, -0.35, { kropp: 0x111114, spakar: true, knappar: [0x40c080, 0xe04050, 0x5070e0, 0xe070c0] });
  rund(k, 0.05, 0.03, mat(0x1c1c22), 0, 0.21, 0.04); rund(k, 0.035, 0.01, silver, 0, 0.23, 0.04);
  for (const sx of [-0.13, 0.13]) kloss(k, 0.07, 0.02, 0.03, mat(0x2a2a30), sx, 0.21, -0.08);
  for (let i = 0; i < 4; i++) kloss(k, 0.025, 0.015, 0.015, i ? mat(0x3a1414) : lyser(0xff2020, 2.2), -0.09 + i * 0.06, 0.2, -0.29);
  for (const sx of [-1, 1]) platta(k, 0.3, 0.1, 0.07, mat(0x16161a), sx * 0.44, 0.08, -0.3, 0.04, 0.015);
  g.userData.satt = (o = 0) => { o = klamp01(o); skivan.position.set(-0.08, 0.68, fram - 0.7 + o * 1.0); skivan.visible = o > 0.02; };
  return g;
}

// ---------- 2012 NINTENTO VI U (vit låda + handkontroll med egen skärm) ----------
function viu(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#f4f4f4'), W = 1.72, H = 0.46, D = 2.68;
  platta(g, W, D, H, m, 0, 0, 0, 0.16, 0.08);
  const fram = D / 2 + 0.003, mork = mat(0x1a1a1e);
  // skivspringan, strömknappen med blå lampa, utmatning, luckan och märket
  kloss(g, 1.3, 0.028, 0.01, mat(0x050506), -0.1, 0.31, fram);
  knappZ(g, 0.055, 0.02, mat(0xe8e8ec, { roughness: 0.3 }), 0.66, 0.3, fram); kloss(g, 0.04, 0.012, 0.01, lyser(0x3a9aff, 2), 0.66, 0.2, fram);
  kloss(g, 0.1, 0.03, 0.012, mat(0xd8d8dc), 0.66, 0.12, fram);
  kloss(g, 1.22, 0.008, 0.01, mat(0xc8c8cc), -0.14, 0.215, fram); kloss(g, 0.008, 0.13, 0.01, mat(0xc8c8cc), 0.47, 0.15, fram);
  const mark = textYta('VI U', 0.24, 0.07, '#9a9aa2'); mark.position.set(-0.6, 0.14, fram + 0.002); g.add(mark);
  // ventiler på vänster sida och baksidan
  for (let i = 0; i < 6; i++) kloss(g, 0.01, 0.02, 1.4, mork, -W / 2 - 0.002, 0.13 + i * 0.04, -0.3);
  for (let i = 0; i < 6; i++) kloss(g, 0.9, 0.02, 0.01, mork, -0.3, 0.13 + i * 0.04, -D / 2 - 0.002);
  kloss(g, 0.3, 0.12, 0.01, mork, 0.5, 0.23, -D / 2 - 0.004);
  // handkontrollen med skärm, lutad mot sitt stöd
  const stod = new T.Group(); stod.position.set(2.0, 0, 0.95); stod.rotation.y = -0.38; g.add(stod);
  platta(stod, 1.3, 0.62, 0.05, mat(0x1c1c20, { roughness: 0.6 }), 0, 0, -0.08, 0.06, 0.015);
  kloss(stod, 1.1, 0.5, 0.04, mat(0x1c1c20, { roughness: 0.6 }), 0, 0.3, -0.3).rotation.x = -0.5;
  const pad = new T.Group(); pad.position.set(0, 0.05, 0.08); pad.rotation.x = -0.5; stod.add(pad);
  const PW = 2.55, PH = 1.33, PD = 0.22, vit = mat(0xf4f4f6, { roughness: 0.28, clearcoat: 0.8 }), pf = PD / 2;
  staende(pad, PW, PH, PD, vit, 0, 0, 0, 0.34, 0.07);
  for (const sx of [-1, 1]) { const gr = skugg(new T.Mesh(new T.CapsuleGeometry(0.13, 0.62, 6, 14), vit)); gr.rotation.z = Math.PI / 2; gr.position.set(sx * 0.72, 0.42, -pf - 0.06); gr.scale.set(1, 1, 0.8); pad.add(gr); }
  staende(pad, 1.66, 1.02, 0.012, glans(0x0a0a0e), 0, 0.2, pf + 0.002, 0.05, 0.004);
  const sk = glimtSkarm('blackklatt', 1.44, 0.81); sk.me.position.set(0, 0.71, pf + 0.012); pad.add(sk.me);
  const spak = (sx, sy) => { knappZ(pad, 0.14, 0.03, mat(0x2a2a30), sx, sy, pf + 0.015); knappZ(pad, 0.04, 0.08, mat(0x2a2a30), sx, sy, pf + 0.05); knappZ(pad, 0.115, 0.035, mat(0x3a3a42, { roughness: 0.85 }), sx, sy, pf + 0.1); };
  spak(-1.0, 0.95); spak(1.0, 0.95);
  V.styrkors(pad, 0.24, mat(0x34343a), -1.0, 0.52, pf + 0.02); pad.children.slice(-2).forEach((b) => (b.rotation.x = Math.PI / 2));
  for (const [dx, dy] of [[0, 0.12], [0.12, 0], [0, -0.12], [-0.12, 0]]) knappZ(pad, 0.055, 0.04, mat(0xdedee2, { roughness: 0.3 }), 1.0 + dx, 0.52 + dy, pf + 0.02);
  for (const [bx, by, br] of [[0.62, 0.12, 0.04], [0.84, 0.17, 0.03], [0.96, 0.1, 0.03], [1.12, 0.17, 0.035], [-1.05, 0.15, 0.035]]) knappZ(pad, br, 0.03, mat(0xd0d0d4), bx, by, pf + 0.012);
  knappZ(pad, 0.025, 0.01, mat(0x101014), 0, 1.25, pf + 0.008); kloss(pad, 0.2, 0.04, 0.01, mat(0x101014), 0.32, 1.25, pf + 0.006);
  for (const sx of [-1, 1]) kloss(pad, 0.36, 0.06, 0.12, mat(0xd8d8dc), sx * 0.95, PH - 0.01, -0.02);
  g.userData.tick = sk.tick;
  return g;
}

// ---------- 2013 PLAY STATIO 4 (parallellogram: blank och matt halva, blå ljuslist) ----------
function ps4(tel) {
  const T = TH(), g = new T.Group(), blank = kropp(tel, '#16161a'), matt = kroppMaterial({ kropp: tel.kropp || '#16161a', yta: 'matt' }), svart = mat(0x060608, { roughness: 0.9, clearcoat: 0 });
  const W = 2.75, H = 0.53, D = 3.05, s = 0.17;
  // sidoprofilen lutar: ovansidan sticker ut framåt, undersidan bakåt
  const zF = (y) => D / 2 - s * (1 - y / H), zB = (y) => -D / 2 + s * (y / H);
  const skiva = (y0, y1, x0, x1, mm, inne = 0) => {
    const f = new T.Shape(); f.moveTo(zB(y0) + inne, y0); f.lineTo(zF(y0) - inne, y0); f.lineTo(zF(y1) - inne, y1); f.lineTo(zB(y1) + inne, y1); f.closePath();
    return profilX(g, f, x1 - x0, mm, (x0 + x1) / 2, 0.012);
  };
  const delning = -W / 2 + W * 0.36;
  skiva(0, 0.16, -W / 2, W / 2, matt);                       // nedre skivan
  skiva(0.15, 0.24, -W / 2 + 0.06, W / 2 - 0.06, svart, 0.07); // springan med portarna
  skiva(0.23, H, -W / 2, delning - 0.03, blank);             // blanka delen (hårddisklocket)
  skiva(0.23, H, delning + 0.03, W / 2, matt);               // matta delen
  skiva(0.23, H - 0.03, delning - 0.03, delning + 0.03, svart, 0.02);   // skåran mellan dem
  // ljuslisten i skåran på ovansidan (lite upphöjd så att den syns uppifrån)
  kloss(g, 0.026, 0.04, D - s - 0.1, lyser(0x2a6cff, 1.8), delning, H - 0.004, s / 2);
  // framsidan: skivspringa, knappar vid skåran, USB i springan (fasningen gör ytan 0,012 större)
  const vinkel = Math.atan2(s, H), paFram = (o, x, y) => { o.rotation.x = vinkel; o.position.set(x, y, zF(y) + 0.018); g.add(o); return o; };
  paFram(new T.Mesh(new T.BoxGeometry(1.36, 0.03, 0.01), mat(0x020203)), delning + 0.86, 0.4);
  paFram(new T.Mesh(new T.BoxGeometry(1.4, 0.008, 0.01), mat(0x34343c, { metalness: 0.5 })), delning + 0.86, 0.375);
  paFram(new T.Mesh(new T.BoxGeometry(0.03, 0.08, 0.01), mat(0x3a3a42)), delning - 0.1, 0.38);
  paFram(new T.Mesh(new T.BoxGeometry(0.03, 0.08, 0.01), mat(0x3a3a42)), delning + 0.1, 0.38);
  paFram(new T.Mesh(new T.BoxGeometry(0.03, 0.18, 0.01), lyser(0x2a6cff, 1.5)), delning, 0.42);
  for (const ux of [-0.55, -0.32]) { const p = new T.Mesh(new T.BoxGeometry(0.14, 0.05, 0.01), mat(0x2a2a32)); p.position.set(ux, 0.195, zF(0.195) - 0.05); g.add(p); }
  // märket på den blanka delen
  const mark = textYta('PS4', 0.32, 0.11, '#9a9ca4', 'bold'); mark.rotation.x = -Math.PI / 2; mark.position.set(-W / 2 + 0.32, H + 0.016, D / 2 - 0.35); g.add(mark);
  // ventiler och portar bak i springan
  for (let i = 0; i < 12; i++) { const v = new T.Mesh(new T.BoxGeometry(0.1, 0.05, 0.01), mat(0x22222a)); v.position.set(-1.0 + i * 0.12, 0.195, zB(0.195) + 0.055); g.add(v); }
  const skivan = disk('spindel'); g.add(skivan);
  // handkontrollen: pekyta och blå ljuslist
  const k = grepp(g, 2.05, 1.85, -0.35, { kropp: 0x1c1c22, mitt: 0x18181d, spakar: true, pekyta: 0x232328, knappar: [0x40c080, 0xe04050, 0x5070e0, 0xe070c0], ljus: 0x3a7aff });
  rund(k, 0.045, 0.03, mat(0x2a2a30), 0, 0.21, 0.1); for (const sx of [-0.27, 0.27]) kloss(k, 0.04, 0.02, 0.07, mat(0x2a2a30), sx, 0.21, -0.15);
  for (const sx of [-1, 1]) platta(k, 0.3, 0.1, 0.07, mat(0x1c1c22), sx * 0.44, 0.08, -0.3, 0.04, 0.015);
  g.userData.satt = (o = 0) => { o = klamp01(o); skivan.position.set(delning + 0.86, 0.4, zF(0.4) - 0.72 + o * 1.0); skivan.visible = o > 0.02; };
  return g;
}

// ---------- 40×28-bilder för tidslinjen ----------
function pixelX360(x, X, Y) {
  pSkugga(x, X, Y + 25, 40);
  // ovansidan (svängd) med grått galler och hårddisken
  for (let i = 0; i < 38; i++) { const d = Math.round(((i - 19) / 19) ** 2 * 1.5); pR(x, X + 1 + i, Y + 11 - d, 1, 7 + d, '#e4e4e2'); }
  pR(x, X + 21, Y + 11, 15, 5, '#a8acb2'); for (let i = 0; i < 15; i += 2) for (let j = 0; j < 5; j += 2) pP(x, X + 21 + i + (j % 4 ? 1 : 0), Y + 11 + j, '#6a6e76');
  pR(x, X + 4, Y + 9, 15, 7, '#d4d4d6'); pR(x, X + 5, Y + 10, 13, 4, '#b8bcc2'); pR(x, X + 4, Y + 9, 15, 1, '#f4f4f4');
  // framsidan: skivlåda, ljusringen
  pR(x, X + 1, Y + 18, 38, 7, '#d8d8d6'); pR(x, X + 1, Y + 24, 38, 1, '#8a8a8c');
  pR(x, X + 3, Y + 19, 21, 2, '#2a2a2e'); pR(x, X + 3, Y + 19, 21, 1, '#c8ccd2');
  for (const [dx, dy] of [[0, -2], [2, 0], [0, 2], [-2, 0], [1, -1], [1, 1], [-1, 1], [-1, -1]]) pP(x, X + 32 + dx, Y + 21 + dy, '#50ff50');
  pP(x, X + 32, Y + 21, '#e8ecf0'); pR(x, X + 5, Y + 22, 10, 1, '#b8b8bc');
}
function pixelViu(x, X, Y) {
  pSkugga(x, X, Y + 25, 40);
  // lådan (smal, vit) bakom och till vänster
  pR(x, X + 2, Y + 10, 14, 4, '#e8e8ec'); pR(x, X + 1, Y + 14, 15, 5, '#d8d8dc'); pR(x, X + 2, Y + 15, 11, 1, '#202024'); pP(x, X + 14, Y + 16, '#3a9aff'); pR(x, X + 1, Y + 18, 15, 1, '#9a9aa0');
  // handkontrollen med skärm
  pR(x, X + 13, Y + 8, 26, 16, '#f4f4f6'); pR(x, X + 14, Y + 7, 24, 1, '#f4f4f6'); pR(x, X + 13, Y + 23, 26, 1, '#a8a8ae');
  pR(x, X + 19, Y + 9, 14, 11, '#101014'); pR(x, X + 20, Y + 10, 12, 9, '#7a40e0'); pR(x, X + 20, Y + 15, 7, 4, '#ff8a10'); pR(x, X + 27, Y + 12, 4, 3, '#ff8a10'); pP(x, X + 23, Y + 12, '#ffffff');
  pR(x, X + 15, Y + 10, 2, 2, '#3a3a42'); pR(x, X + 35, Y + 10, 2, 2, '#3a3a42'); pR(x, X + 15, Y + 15, 3, 1, '#3a3a42'); pR(x, X + 16, Y + 14, 1, 3, '#3a3a42');
  pP(x, X + 35, Y + 14, '#bcbcc2'); pP(x, X + 36, Y + 15, '#bcbcc2'); pP(x, X + 34, Y + 15, '#bcbcc2'); pP(x, X + 35, Y + 16, '#bcbcc2');
}

export const KONSOLER = [
  { id: 'konsol-x360', namn: 'AXIOM X2', forebild: 'Xbox 360', ar: 2005, glimt: 'gruvkraft', oppna: ['SKIVLÅDAN', 0], bygg: x360, pixel: pixelX360,
    info: 'Vit och lätt insvängd, som om den andas in. Ljusringen lyser grön runt strömknappen och skivlådan glider ut.' },
  { id: 'konsol-ps3', namn: 'HOSHI NOVA 3', forebild: 'PlayStation 3', ar: 2007, glimt: 'lillastora', oppna: ['SKIVAN', 0], bygg: ps3, pixel: (x, X, Y) => KONSOL.ps3.rita(x, X, Y),
    info: 'Blanksvart med välvt lock och silverlist. Blu-ray-skivan sugs in genom en springa, och handkontrollen känner när man lutar den.' },
  { id: 'konsol-viu', namn: 'TENKO VIVA U', forebild: 'Wii U', ar: 2012, glimt: 'blackklatt', oppna: null, bygg: viu, pixel: pixelViu,
    info: 'En smal vit låda och en handkontroll med egen pekskärm. Man kan spela på skärmen i handen medan någon annan tittar på TV:n.' },
  { id: 'konsol-ps4', namn: 'HOSHI NOVA 4', forebild: 'PlayStation 4', ar: 2013, glimt: 'spindel', oppna: ['SKIVAN', 0], bygg: ps4, pixel: (x, X, Y) => KONSOL.ps4.rita(x, X, Y),
    info: 'Ett lutande parallellogram med en blank och en matt halva och en blå ljuslist. Handkontrollen har pekyta och lyser.' },
];
