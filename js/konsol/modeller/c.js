// Konsoler i 3D, grupp C. Samma format som KONSOLFORMER i ../konsol-gl.js. Verktygen finns i ../gl-verktyg.js.
// SEGO DRÖMCAST (1999), MIKROMJUK X-LÅDA (2002), NINTENTO GAMEKUB (2002) och NINTENTO DS (2005). Modellenhet 1 = 10 cm.
import * as V from '../gl-verktyg.js';
import { glimtBild } from '../glimtar.js';
import { T as PT, SMALL } from '../pix.js';

const { TH, mat, glans, lyser, skugg, platta, staende, kloss, rund, kabel, styrkors, glimtSkarm, kropp, klamp01 } = V;

// ---------- egna hjälpare ----------
// liggande form sedd ovanifrån (formens +y = bakåt), extruderad uppåt till höjden hojd med rundade kanter
function ligg(g, form, hojd, m, x, y, z, bev = 0.03) {
  const T = TH(), b = Math.min(bev, hojd / 2 - 0.002);
  const geo = new T.ExtrudeGeometry(form, { depth: Math.max(0.002, hojd - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 4, curveSegments: 28 });
  geo.computeVertexNormals();
  const me = skugg(new T.Mesh(geo, m)); me.rotation.x = -Math.PI / 2; me.position.set(x, y + b, z); g.add(me); return me;
}
// rundad rektangel som väg (för hål i former), mitt i (cx, cy)
function rektVag(vag, cx, cy, w, h, r) {
  const x0 = cx - w / 2, y0 = cy - h / 2; r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001);
  vag.moveTo(x0 + r, y0); vag.lineTo(x0 + w - r, y0); vag.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
  vag.lineTo(x0 + w, y0 + h - r); vag.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
  vag.lineTo(x0 + r, y0 + h); vag.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r); vag.lineTo(x0, y0 + r); vag.quadraticCurveTo(x0, y0, x0 + r, y0);
  return vag;
}
// rita på en duk och gör en textur av den (skarp = pixlar utan utsmetning)
function duk(w, h, rita, skarp = false) {
  const T = TH(), c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; rita(x, w, h);
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; if (skarp) { t.magFilter = T.NearestFilter; t.minFilter = T.LinearFilter; t.generateMipmaps = false; }
  t.userData = { duk: c, x }; return t;
}
// platt dekal: 'upp' (ligger, bildens överkant bakåt), 'fram', 'bak', 'vanster', 'hoger'
function dekal(g, tex, w, h, x, y, z, riktning = 'upp', o = {}) {
  const T = TH(), me = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.45, metalness: 0.05, ...o }));
  if (riktning === 'upp') me.rotation.x = -Math.PI / 2; else if (riktning === 'bak') me.rotation.y = Math.PI; else if (riktning === 'vanster') me.rotation.y = -Math.PI / 2; else if (riktning === 'hoger') me.rotation.y = Math.PI / 2;
  me.position.set(x, y, z); g.add(me); return me;
}
// låg kupol (sfärkalott) med textur projicerad uppifrån
function kupol(g, r, h, m, x, y, z) {
  const T = TH(), R = (r * r + h * h) / (2 * h), th = Math.asin(Math.min(1, r / R));
  const geo = new T.SphereGeometry(R, 48, 12, 0, Math.PI * 2, 0, th), pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / (2 * r) + 0.5, -pos.getZ(i) / (2 * r) + 0.5);
  uv.needsUpdate = true;
  const me = skugg(new T.Mesh(geo, m)); me.position.set(x, y + h - R, z); g.add(me); return me;
}
// cylinder som pekar framåt (knappar och portar på framsidor)
const framRund = (g, r, d, m, x, y, z, seg = 24) => { const me = rund(g, r, d, m, x, y, z, seg); me.rotation.x = Math.PI / 2; return me; };
// lokal punkt i en vriden handkontroll → världskoordinat (för sladdarna)
const varld = (kx, kz, rot, lx, ly, lz) => [kx + lx * Math.cos(rot) + lz * Math.sin(rot), ly, kz - lx * Math.sin(rot) + lz * Math.cos(rot)];
// spelskivans etikett: glimtens stillbild i en cirkel med titelband och hål i mitten
function skivEtikett(id, titel, band = '#1a1a24') {
  return duk(256, 256, (x) => {
    x.save(); x.beginPath(); x.arc(128, 128, 127, 0, Math.PI * 2); x.clip();
    const src = glimtBild(id, 1.2);
    if (src) { const k = 256 / src.height, w = src.width * k; x.imageSmoothingEnabled = false; x.drawImage(src, 128 - w / 2, 0, w, 256); }
    x.fillStyle = band; x.fillRect(0, 186, 256, 70);
    x.fillStyle = '#ffffff'; x.font = 'bold 26px system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(titel, 128, 210);
    x.restore();
    x.fillStyle = 'rgba(210,214,224,1)'; x.beginPath(); x.arc(128, 128, 40, 0, Math.PI * 2); x.fill();
    x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(128, 128, 15, 0, Math.PI * 2); x.fill();
  });
}
function spelskiva(g, r, id, titel, x, y, z, band) {
  const T = TH(), skivM = new T.MeshPhysicalMaterial({ color: 0xd8dce4, metalness: 0.9, roughness: 0.12, iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [200, 600] });
  rund(g, r, 0.012, skivM, x, y + 0.006, z, 48);
  dekal(g, skivEtikett(id, titel, band), r * 1.94, r * 1.94, x, y + 0.0125, z, 'upp', { roughness: 0.5, metalness: 0 });
}
// text i systemets typsnitt på genomskinlig botten (märken och logotyper)
const textTextur = (s, farg, w = 512, h = 96, typsnitt = 'bold 64px system-ui, sans-serif') => duk(w, h, (x) => { x.fillStyle = farg; x.font = typsnitt; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, w / 2, h / 2 + 2); });

// 2D-pixelbilderna (40×28) för tidslinjen
const R2 = (x, X, Y, W, H, f) => { if (W <= 0 || H <= 0) return; x.fillStyle = f; x.fillRect(Math.round(X), Math.round(Y), Math.round(W), Math.round(H)); };
const P2 = (x, X, Y, f) => R2(x, X, Y, 1, 1, f);
const skugga2 = (x, X, Y, w) => { R2(x, X + 2, Y, w - 4, 1, 'rgba(0,0,0,0.35)'); R2(x, X + 4, Y + 1, w - 8, 1, 'rgba(0,0,0,0.2)'); };
function lada2(x, X, Y, w, topp, fram, cTopp, cFram, cKant = '#101018') {
  R2(x, X + 2, Y, w - 2, topp, cTopp); R2(x, X, Y + topp, w, fram, cFram);
  for (let i = 0; i < topp; i++) P2(x, X + 2 - Math.round((i / topp) * 2), Y + i, cTopp);
  R2(x, X, Y + topp + fram - 1, w, 1, cKant); R2(x, X + 2, Y, w - 2, 1, 'rgba(255,255,255,0.35)');
}

// ---------- 1999 SEGO DRÖMCAST ----------
// orange virvel på luckan
const virvel = () => duk(256, 256, (x) => {
  x.fillStyle = '#f2661a';
  for (let i = 0; i <= 600; i++) { const s = i / 600, v = -0.4 - s * Math.PI * 2.55, r = 112 * (1 - s * 0.86), w = 24 * (1 - s * 0.78); x.beginPath(); x.arc(128 + Math.cos(v) * r, 128 + Math.sin(v) * r, w / 2, 0, Math.PI * 2); x.fill(); }
});
// minneskortets lilla skärm (48×32, svartvit LCD) – en taxi som studsar och en nedräkning
function vmuSkarm() {
  const T = TH(), tex = duk(48, 32, () => {}, true), x = tex.userData.x, LCD = '#9cb4a2', PX = '#1c2a36';
  const rita = (t) => {
    x.fillStyle = LCD; x.fillRect(0, 0, 48, 32);
    const f = (X, Y, W, H) => { x.fillStyle = PX; x.fillRect(Math.round(X), Math.round(Y), W, H); };
    PT(x, String(45 - Math.floor(t % 8)).padStart(2, '0'), 3, 3, PX, SMALL);
    f(2, 24, 44, 1);
    const tx = 6 + ((t * 10) % 40), ty = 16 - Math.round(Math.abs(Math.sin(t * 5)) * 2);
    f(tx, ty, 12, 4); f(tx + 3, ty - 3, 6, 3); f(tx + 1, ty + 4, 3, 2); f(tx + 8, ty + 4, 3, 2); f(tx + 5, ty - 5, 2, 2);
    for (const [i, r] of ['..#..', '.####', '#.#..', '.###.', '..#.#', '####.', '..#..'].entries()) for (let k = 0; k < 5; k++) if (r[k] === '#') f(34 + k, 3 + i, 1, 1);
    tex.needsUpdate = true;
  };
  rita(0);
  const me = new T.Mesh(new T.PlaneGeometry(0.24, 0.16), new T.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.35, roughness: 0.35 }));
  return { me, tick: rita };
}
function dromcast(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#f2f1ec'), W = 1.9, D = 1.96, TOPP = 0.73;
  const gra = mat(0xc4c4c0), mork = mat(0x2a2a2e, { roughness: 0.6 });
  for (const [fx, fz] of [[-0.7, -0.75], [0.7, -0.75], [-0.7, 0.75], [0.7, 0.75]]) rund(g, 0.08, 0.04, mork, fx, 0.02, fz, 16);
  // underdel och den rundade överdelen med en skarv emellan
  platta(g, W, D, 0.36, m, 0, 0.04, 0, 0.16, 0.03);
  platta(g, W - 0.05, D - 0.05, 0.03, gra, 0, 0.39, 0, 0.15, 0.008);
  platta(g, W - 0.02, D - 0.02, 0.32, m, 0, 0.41, 0, 0.2, 0.1);
  // skivfacket under luckan med GD-skivan och spindeln
  rund(g, 0.7, 0.008, mat(0x3a3a3e, { roughness: 0.7 }), 0, TOPP + 0.004, 0.04, 64);
  spelskiva(g, 0.6, 'galentaxi', 'GALEN TAXI', 0, TOPP + 0.008, 0.04, '#e8a010');
  rund(g, 0.07, 0.03, mat(0x9a9aa0), 0, TOPP + 0.03, 0.04);
  // luckan: gångjärn bak, lätt välvd, med virveln
  const lucka = new T.Group(); lucka.position.set(0, TOPP + 0.012, 0.04 - 0.66); g.add(lucka);
  rund(lucka, 0.66, 0.035, m, 0, 0.0175, 0.66, 64);
  kupol(lucka, 0.62, 0.035, m, 0, 0.035, 0.66);
  dekal(lucka, virvel(), 0.46, 0.46, 0, 0.073, 0.66, 'upp', { roughness: 0.3 });
  // strömknapp (vänster) med orange lampa, öppningsknapp (höger)
  for (const sx of [-1, 1]) { rund(g, 0.105, 0.012, gra, sx * 0.68, TOPP + 0.003, 0.72, 32); rund(g, 0.085, 0.04, mat(0xeeeeea, { clearcoat: 0.8 }), sx * 0.68, TOPP + 0.012, 0.72, 32); }
  kloss(g, 0.05, 0.012, 0.03, lyser(0xff8a20, 2.4), -0.46, TOPP + 0.004, 0.84);
  dekal(g, textTextur('POWER', '#8a8a86', 256, 64, 'bold 40px system-ui, sans-serif'), 0.2, 0.05, -0.68, TOPP + 0.003, 0.86);
  dekal(g, textTextur('OPEN', '#8a8a86', 256, 64, 'bold 40px system-ui, sans-serif'), 0.2, 0.05, 0.68, TOPP + 0.003, 0.86);
  // framsidan: fyra handkontrollsportar A–D
  const fram = D / 2;
  for (const [i, px] of [-0.6, -0.2, 0.2, 0.6].entries()) {
    staende(g, 0.3, 0.14, 0.03, mat(0x2c2c30), px, 0.13, fram - 0.005, 0.04, 0.01);
    kloss(g, 0.18, 0.04, 0.02, mat(0x8a8a8e), px, 0.2, fram + 0.004);
    dekal(g, textTextur('ABCD'[i], '#a8a8a4', 64, 64, 'bold 48px system-ui, sans-serif'), 0.06, 0.06, px, 0.32, fram + 0.002, 'fram');
  }
  // fläktgallret på vänstra sidan
  kloss(g, 0.01, 0.22, 0.86, mork, -W / 2 - 0.002, 0.22, -0.32);
  for (let i = 0; i < 7; i++) kloss(g, 0.016, 0.014, 0.82, m, -W / 2 - 0.004, 0.13 + i * 0.03, -0.32);
  // baksidan: modemet (löstagbart) och uttagen
  staende(g, 0.72, 0.26, 0.04, mat(0xdcdcd8), -0.45, 0.1, -fram, 0.03, 0.01);
  for (let i = 0; i < 5; i++) kloss(g, 0.5, 0.012, 0.01, gra, -0.45, 0.15 + i * 0.035, -fram - 0.022);
  kloss(g, 0.1, 0.07, 0.02, mork, -0.68, 0.2, -fram - 0.022);
  kloss(g, 0.24, 0.08, 0.02, mork, 0.35, 0.22, -fram - 0.002); kloss(g, 0.12, 0.08, 0.02, mork, 0.7, 0.22, -fram - 0.002);
  // handkontrollen: vit, två grepp, minneskortet med skärm överst, sladden ut nertill (mot spelaren)
  const KX = 2.1, KZ = 0.75, KR = -0.42, k = new T.Group(); k.position.set(KX, 0, KZ); k.rotation.y = KR; g.add(k);
  const s = 0.92, f = new T.Shape();
  f.moveTo(-0.62 * s, 0.42 * s); f.quadraticCurveTo(0, 0.52 * s, 0.62 * s, 0.42 * s); f.quadraticCurveTo(0.8 * s, 0.38 * s, 0.8 * s, 0.12 * s);
  f.bezierCurveTo(0.8 * s, -0.2 * s, 0.78 * s, -0.55 * s, 0.62 * s, -0.66 * s); f.quadraticCurveTo(0.48 * s, -0.75 * s, 0.36 * s, -0.6 * s);
  f.quadraticCurveTo(0.2 * s, -0.36 * s, 0, -0.34 * s); f.quadraticCurveTo(-0.2 * s, -0.36 * s, -0.36 * s, -0.6 * s);
  f.quadraticCurveTo(-0.48 * s, -0.75 * s, -0.62 * s, -0.66 * s); f.bezierCurveTo(-0.78 * s, -0.55 * s, -0.8 * s, -0.2 * s, -0.8 * s, 0.12 * s);
  f.quadraticCurveTo(-0.8 * s, 0.38 * s, -0.62 * s, 0.42 * s);
  ligg(k, f, 0.3, m, 0, 0, 0, 0.09);
  const Y = 0.3;
  // minneskortet i facket: grå ram, LCD-fönster
  platta(k, 0.44, 0.32, 0.012, mat(0x3a3a3e), 0, Y - 0.004, -0.2, 0.04, 0.004);
  platta(k, 0.38, 0.26, 0.012, mat(0xd8d8d6), 0, Y + 0.006, -0.2, 0.035, 0.004);
  const vmu = vmuSkarm(); vmu.me.rotation.x = -Math.PI / 2; vmu.me.position.set(0, Y + 0.02, -0.2); k.add(vmu.me);
  // analogspaken uppe till vänster, styrkorset nere till vänster
  rund(k, 0.13, 0.02, mat(0xdcdcd8), -0.46, Y + 0.0, -0.04); rund(k, 0.03, 0.06, mat(0xb8b8b4), -0.46, Y + 0.04, -0.04);
  rund(k, 0.095, 0.035, mat(0xeeeeea), -0.46, Y + 0.08, -0.04); rund(k, 0.07, 0.006, mat(0xd0d0cc), -0.46, Y + 0.1, -0.04);
  rund(k, 0.13, 0.012, mat(0xd8d8d4), -0.46, Y, 0.27); styrkors(k, 0.21, mat(0x3a3a40), -0.46, Y + 0.025, 0.27);
  // A röd, B blå, X gul, Y grön
  for (const [bx, bz, c] of [[0.46, 0.25, 0xd83030], [0.6, 0.11, 0x2a5ad8], [0.32, 0.11, 0xf0c020], [0.46, -0.03, 0x30b050]]) { rund(k, 0.068, 0.012, mat(0xd8d8d4), bx, Y, bz); rund(k, 0.055, 0.045, glans(c), bx, Y + 0.02, bz); }
  const start = rund(k, 0.055, 0.03, mat(0xb8b8b4), 0, Y + 0.005, 0.12, 3); start.rotation.y = Math.PI;
  for (const sx of [-1, 1]) kloss(k, 0.3, 0.12, 0.1, mat(0xd8d8d4), sx * 0.45, 0.16, -0.44);
  g.userData.tick = vmu.tick;
  // sladden: ut mellan greppen mot spelaren, sedan runt till port A
  const p1 = varld(KX, KZ, KR, 0, 0.12, 0.3), p2 = varld(KX, KZ, KR, 0, 0.03, 0.75), p3 = varld(KX, KZ, KR, -0.6, 0.03, 0.95);
  kabel(g, [p1, p2, p3, [0.2, 0.03, 1.55], [-0.5, 0.03, 1.35], [-0.6, 0.2, fram + 0.02]], mat(0xe0e0dc), 0.022);
  g.userData.satt = (o = 0) => { lucka.rotation.x = -klamp01(o) * 1.35; };
  return g;
}

// ---------- 2002 MIKROMJUK X-LÅDA ----------
// juvelens logga: grönt glas med ett svart X
const xJuvel = () => duk(256, 256, (x) => {
  const gr = x.createRadialGradient(96, 84, 6, 128, 128, 132); gr.addColorStop(0, '#d0ffb0'); gr.addColorStop(0.35, '#52e24a'); gr.addColorStop(0.8, '#1a8a1e'); gr.addColorStop(1, '#0a4a10');
  x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
  x.fillStyle = '#0c100c';
  for (let k = 0; k < 4; k++) { x.save(); x.translate(128, 128); x.rotate(Math.PI / 4 + (k * Math.PI) / 2); x.beginPath(); x.moveTo(0, -12); x.quadraticCurveTo(64, -10, 132, -46); x.lineTo(132, 46); x.quadraticCurveTo(64, 10, 0, 12); x.closePath(); x.fill(); x.restore(); }
});
function xlada(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#1e1e22'), W = 3.2, D = 2.6, TOPP = 0.89;
  const mork = mat(0x0c0c0e, { roughness: 0.6 }), blank = glans(0x141416), gron = (s = 1.8) => lyser(0x3cff3c, s);
  for (const [fx, fz] of [[-1.3, -1.0], [1.3, -1.0], [-1.3, 1.0], [1.3, 1.0]]) rund(g, 0.14, 0.05, mork, fx, 0.025, fz, 16);
  platta(g, W, D, 0.84, m, 0, 0.05, 0, 0.34, 0.07);
  // det stora X:et ovanpå: två upphöjda ryggar från hörn till hörn
  const vinkel = Math.atan2(D, W);
  for (const sx of [-1, 1]) { const xg = new T.Group(); xg.rotation.y = sx * vinkel; g.add(xg); platta(xg, 3.55, 0.56, 0.05, m, 0, TOPP - 0.01, 0, 0.26, 0.025); }
  // juvelen i mitten: svart sockel, grön kupol med X
  rund(g, 0.56, 0.07, blank, 0, TOPP + 0.04 + 0.035, 0, 64);
  rund(g, 0.44, 0.02, mat(0x0a0a0a), 0, TOPP + 0.11 + 0.01, 0, 64);
  kupol(g, 0.42, 0.16, new T.MeshPhysicalMaterial({ map: xJuvel(), emissive: 0x2aa02a, emissiveIntensity: 0.35, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.04, metalness: 0.05 }), 0, TOPP + 0.12, 0);
  // framsidan: skivlådan med grön ljuslist, strömknapp och utmatning med gröna ringar, fyra portar
  const fram = D / 2;
  kloss(g, 1.62, 0.22, 0.02, mork, -0.3, 0.55, fram - 0.004);
  const lada = new T.Group(); lada.position.set(-0.3, 0.46, 0); g.add(lada);
  platta(lada, 1.42, 1.3, 0.04, mat(0x1a1a1c), 0, 0.02, fram - 0.67, 0.03, 0.01);
  rund(lada, 0.63, 0.006, mat(0x0e0e10), 0, 0.06, fram - 0.68, 64);
  spelskiva(lada, 0.6, 'haloo', 'HALOO', 0, 0.064, fram - 0.68, '#3a5a1e');
  staende(lada, 1.52, 0.17, 0.06, blank, 0, 0, fram + 0.01, 0.03, 0.012);
  kloss(lada, 1.36, 0.014, 0.01, gron(2.2), 0, 0.015, fram + 0.042);
  for (const [by, r, ljus] of [[0.62, 0.1, 2.4], [0.38, 0.075, 1.2]]) {
    framRund(g, r + 0.03, 0.02, mork, 1.12, by, fram + 0.005, 32); framRund(g, r, 0.05, blank, 1.12, by, fram + 0.02, 32);
    const ring = new T.Mesh(new T.TorusGeometry(r + 0.012, 0.011, 8, 40), gron(ljus)); ring.position.set(1.12, by, fram + 0.03); g.add(ring);
  }
  for (const px of [-1.2, -0.4, 0.4, 1.2]) { staende(g, 0.42, 0.15, 0.03, mat(0x080809), px, 0.12, fram, 0.04, 0.01); kloss(g, 0.3, 0.05, 0.02, mat(0x3a3a3e), px, 0.2, fram + 0.01); }
  kloss(g, W - 0.7, 0.012, 0.01, mork, 0, 0.32, fram + 0.002);
  dekal(g, textTextur('X-LÅDA', '#52e24a', 512, 128, 'bold 92px system-ui, sans-serif'), 0.46, 0.115, 0.72, 0.6, fram + 0.002, 'fram', { emissive: 0x2aa02a, emissiveIntensity: 0.5 });
  // baksidan: fläktgaller och uttag
  for (const fx of [-0.9, 0.55]) { framRund(g, 0.3, 0.02, mork, fx, 0.45, -fram - 0.005, 40); for (let i = -4; i <= 4; i++) kloss(g, Math.sqrt(Math.max(0, 0.26 * 0.26 - (i * 0.055) ** 2)) * 2, 0.018, 0.02, m, fx, 0.45 + i * 0.055, -fram - 0.018); }
  kloss(g, 0.3, 0.1, 0.03, mork, 1.15, 0.45, -fram - 0.005); kloss(g, 0.14, 0.12, 0.03, mork, 1.15, 0.25, -fram - 0.005);
  // handkontrollen (den stora): svart med juvel i mitten, två spakar, sex färgknappar, sladd bakåt
  const KX = 2.75, KZ = 1.85, KR = -0.32, k = new T.Group(); k.position.set(KX, 0, KZ); k.rotation.y = KR; g.add(k);
  const f = new T.Shape();
  f.moveTo(-0.85, 0.55); f.quadraticCurveTo(0, 0.7, 0.85, 0.55); f.bezierCurveTo(1.15, 0.5, 1.22, 0.1, 1.14, -0.35);
  f.bezierCurveTo(1.08, -0.72, 0.94, -0.98, 0.74, -0.94); f.quadraticCurveTo(0.56, -0.9, 0.48, -0.56); f.quadraticCurveTo(0, -0.3, -0.48, -0.56);
  f.quadraticCurveTo(-0.56, -0.9, -0.74, -0.94); f.bezierCurveTo(-0.94, -0.98, -1.08, -0.72, -1.14, -0.35); f.bezierCurveTo(-1.22, 0.1, -1.15, 0.5, -0.85, 0.55);
  ligg(k, f, 0.4, mat(0x1c1c20, { roughness: 0.55 }), 0, 0, 0, 0.12);
  const Y = 0.4, svart = mat(0x121214), spakM = mat(0x2a2a2e, { roughness: 0.8 });
  rund(k, 0.28, 0.04, blank, 0, Y, -0.12, 48);
  kupol(k, 0.21, 0.08, new T.MeshPhysicalMaterial({ map: xJuvel(), emissive: 0x2aa02a, emissiveIntensity: 0.4, roughness: 0.12, clearcoat: 1 }), 0, Y + 0.02, -0.12);
  for (const [sx, sz] of [[-0.66, -0.2], [0.42, 0.3]]) { rund(k, 0.16, 0.02, svart, sx, Y, sz); rund(k, 0.04, 0.08, svart, sx, Y + 0.04, sz); rund(k, 0.12, 0.045, spakM, sx, Y + 0.09, sz); rund(k, 0.085, 0.008, mat(0x3a3a40), sx, Y + 0.115, sz); }
  rund(k, 0.16, 0.02, svart, -0.42, Y, 0.3); styrkors(k, 0.24, mat(0x3a3a40), -0.42, Y + 0.025, 0.3);
  for (const [bx, bz, c] of [[0.56, -0.12, 0x20b040], [0.78, -0.2, 0xd82828], [0.5, -0.34, 0x2850d8], [0.72, -0.42, 0xf0c020], [0.62, 0.08, 0xf4f4f4], [0.84, 0.0, 0x1a1a1a]]) { rund(k, 0.085, 0.012, svart, bx, Y, bz); rund(k, 0.07, 0.05, glans(c, { emissive: c, emissiveIntensity: 0.12 }), bx, Y + 0.02, bz); }
  for (const [bx, bz] of [[-0.68, 0.1], [-0.8, 0.22]]) rund(k, 0.035, 0.03, mat(0x3a3a40), bx, Y + 0.005, bz);
  for (const sx of [-1, 1]) { kloss(k, 0.32, 0.012, 0.09, mat(0x050505), sx * 0.32, Y + 0.003, -0.5); kloss(k, 0.36, 0.14, 0.12, mat(0x26262a), sx * 0.62, 0.2, -0.56); }
  // sladden med det grå lossnande mellanstycket
  const p1 = varld(KX, KZ, KR, 0, 0.2, -0.62), p2 = varld(KX, KZ, KR, -0.1, 0.03, -1.0);
  kabel(g, [p1, p2, [1.95, 0.03, 1.55], [1.4, 0.03, 1.55], [1.2, 0.2, fram + 0.02]], mat(0x111113), 0.026);
  const mellan = rund(g, 0.05, 0.22, mat(0x8a8a90), (p2[0] + 1.95) / 2, 0.05, (p2[2] + 1.55) / 2, 16); mellan.rotation.z = Math.PI / 2; mellan.rotation.y = Math.atan2(p2[2] - 1.55, 1.95 - p2[0]);
  g.userData.satt = (o = 0) => { lada.position.z = klamp01(o) * 1.25; };
  return g;
}

// ---------- 2002 NINTENTO GAMEKUB ----------
const kubLogga = () => duk(256, 256, (x) => {
  // en kub i kuben: yttre kubens kontur och en mindre, fylld kub inuti
  const kub = (cx, cy, r, fyll, kant, lw) => {
    const p = [0, 1, 2, 3, 4, 5].map((i) => [cx + Math.cos(-Math.PI / 2 + (i * Math.PI) / 3) * r, cy + Math.sin(-Math.PI / 2 + (i * Math.PI) / 3) * r]);
    x.beginPath(); p.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath();
    if (fyll) { x.fillStyle = fyll; x.fill(); }
    if (kant) { x.strokeStyle = kant; x.lineWidth = lw; x.lineJoin = 'round'; x.stroke(); x.beginPath(); x.moveTo(cx, cy); x.lineTo(p[1][0], p[1][1]); x.moveTo(cx, cy); x.lineTo(p[5][0], p[5][1]); x.moveTo(cx, cy); x.lineTo(p[3][0], p[3][1]); x.stroke(); }
  };
  kub(128, 128, 96, null, '#bfb6ee', 16);
  kub(128, 138, 42, '#d8d2fa', '#d8d2fa', 4);
});
function gamekub(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#4a3f90'), W = 1.5, D = 1.61, TOPP = 1.09;
  const mork = mat(0x1c1a30, { roughness: 0.6 }), ljus = mat(0x6a5cb4);
  for (const [fx, fz] of [[-0.55, -0.6], [0.55, -0.6], [-0.55, 0.6], [0.55, 0.6]]) rund(g, 0.08, 0.04, mork, fx, 0.02, fz, 16);
  platta(g, W, D, 1.05, m, 0, 0.04, 0, 0.13, 0.08);
  // skivfacket med en liten skiva och luckan (gångjärn bak) med kubloggan
  rund(g, 0.6, 0.008, mork, 0, TOPP + 0.004, -0.06, 64);
  spelskiva(g, 0.4, 'marcosolsken', 'MARCO SOLSKEN', 0, TOPP + 0.008, -0.06, '#d83818');
  rund(g, 0.05, 0.03, mat(0x9a9aa0), 0, TOPP + 0.03, -0.06);
  const lucka = new T.Group(); lucka.position.set(0, TOPP + 0.012, -0.06 - 0.58); g.add(lucka);
  rund(lucka, 0.58, 0.04, m, 0, 0.02, 0.58, 64);
  kupol(lucka, 0.54, 0.03, m, 0, 0.04, 0.58);
  dekal(lucka, kubLogga(), 0.3, 0.3, 0, 0.0715, 0.58, 'upp', { roughness: 0.35 });
  // knapparna fram på ovansidan: ström (vänster), återställning (mitten), öppna (höger)
  for (const [bx, r] of [[-0.5, 0.085], [0, 0.05], [0.5, 0.085]]) { rund(g, r + 0.02, 0.012, mork, bx, TOPP + 0.003, 0.6, 32); rund(g, r, 0.04, ljus, bx, TOPP + 0.012, 0.6, 32); }
  kloss(g, 0.04, 0.01, 0.04, lyser(0x40ff60, 2.4), -0.33, TOPP + 0.004, 0.66);
  // framsidan: luckan för minneskorten och fyra handkontrollsportar
  const fram = D / 2;
  staende(g, 1.18, 0.4, 0.03, mat(0x40367e), 0, 0.5, fram - 0.008, 0.04, 0.01);
  kloss(g, 1.12, 0.012, 0.01, mork, 0, 0.84, fram + 0.008);
  for (const px of [-0.3, 0.3]) kloss(g, 0.34, 0.03, 0.01, mork, px, 0.62, fram + 0.008);
  for (const px of [-0.5, -0.17, 0.17, 0.5]) { staende(g, 0.24, 0.17, 0.03, mork, px, 0.12, fram - 0.004, 0.06, 0.01); kloss(g, 0.12, 0.05, 0.02, mat(0x8a88a0), px, 0.2, fram + 0.008); }
  // fläktgallret på vänstra sidan
  kloss(g, 0.01, 0.5, 0.7, mork, -W / 2 - 0.002, 0.55, -0.15);
  for (let i = 0; i < 9; i++) kloss(g, 0.016, 0.022, 0.66, m, -W / 2 - 0.004, 0.36 + i * 0.048, -0.15);
  // handtaget där bak: en platt ögla som sticker ut bakom kuben
  const hf = new T.Shape(); rektVag(hf, 0, 0.18, 1.36, 0.76, 0.2);
  const hal = new T.Path(); rektVag(hal, 0, 0.33, 1.0, 0.24, 0.1); hf.holes.push(hal);
  const handtag = new T.Group(); handtag.position.set(0, 0.88, -0.56); handtag.rotation.x = -0.1; g.add(handtag);
  ligg(handtag, hf, 0.18, m, 0, 0, 0, 0.05);
  // baksidans uttag under handtaget
  kloss(g, 0.3, 0.1, 0.02, mork, -0.35, 0.35, -fram - 0.002); kloss(g, 0.3, 0.1, 0.02, mork, 0.1, 0.35, -fram - 0.002); kloss(g, 0.16, 0.12, 0.02, mork, 0.45, 0.35, -fram - 0.002);
  // handkontrollen: lila, stor grön A, liten röd B, gul C-spak, grå spak i åttkantig ram, sladd uppåt till port 1
  const KX = 1.6, KZ = 0.95, KR = -0.45, k = new T.Group(); k.position.set(KX, 0, KZ); k.rotation.y = KR; g.add(k);
  const f = new T.Shape();
  f.moveTo(-0.55, 0.38); f.quadraticCurveTo(0, 0.46, 0.55, 0.38); f.bezierCurveTo(0.8, 0.34, 0.86, 0.1, 0.8, -0.15);
  f.bezierCurveTo(0.76, -0.45, 0.62, -0.64, 0.46, -0.58); f.quadraticCurveTo(0.34, -0.52, 0.3, -0.3); f.quadraticCurveTo(0, -0.12, -0.3, -0.3);
  f.quadraticCurveTo(-0.34, -0.52, -0.46, -0.58); f.bezierCurveTo(-0.62, -0.64, -0.76, -0.45, -0.8, -0.15); f.bezierCurveTo(-0.86, 0.1, -0.8, 0.34, -0.55, 0.38);
  ligg(k, f, 0.3, m, 0, 0, 0, 0.1);
  const Y = 0.3, gra = mat(0xb4b4c0), lila = mat(0x2e2660);
  const gate = rund(k, 0.15, 0.02, lila, -0.45, Y - 0.002, -0.12, 8); gate.rotation.y = Math.PI / 8;
  rund(k, 0.035, 0.07, mat(0x8a8a94), -0.45, Y + 0.04, -0.12); rund(k, 0.1, 0.035, gra, -0.45, Y + 0.085, -0.12); rund(k, 0.07, 0.006, mat(0xa0a0ac), -0.45, Y + 0.105, -0.12);
  rund(k, 0.1, 0.012, lila, -0.3, Y, 0.2); styrkors(k, 0.15, gra, -0.3, Y + 0.02, 0.2);
  rund(k, 0.12, 0.012, lila, 0.4, Y, -0.04); rund(k, 0.1, 0.05, glans(0x30b050), 0.4, Y + 0.02, -0.04);
  rund(k, 0.06, 0.012, lila, 0.22, Y, 0.1); rund(k, 0.05, 0.045, glans(0xd83a3a), 0.22, Y + 0.02, 0.1);
  const xk = rund(k, 0.045, 0.045, gra, 0.58, Y + 0.02, -0.1); xk.scale.set(1, 1, 1.9); xk.rotation.y = 0.35;
  const yk = rund(k, 0.045, 0.045, gra, 0.38, Y + 0.02, -0.24); yk.scale.set(1.9, 1, 1); yk.rotation.y = -0.25;
  const cgate = rund(k, 0.1, 0.02, lila, 0.26, Y - 0.002, 0.24, 8); cgate.rotation.y = Math.PI / 8;
  rund(k, 0.025, 0.06, mat(0xb09010), 0.26, Y + 0.03, 0.24); rund(k, 0.065, 0.03, glans(0xf0c020), 0.26, Y + 0.07, 0.24);
  rund(k, 0.04, 0.03, gra, 0, Y + 0.005, 0.02);
  kloss(k, 0.22, 0.05, 0.08, glans(0x6a5ae0), 0.42, Y - 0.02, -0.43);
  for (const sx of [-1, 1]) kloss(k, 0.3, 0.1, 0.1, gra, sx * 0.45, 0.17, -0.42);
  const p1 = varld(KX, KZ, KR, 0, 0.15, -0.42), p2 = varld(KX, KZ, KR, 0.05, 0.03, -0.8);
  kabel(g, [p1, p2, [1.0, 0.03, 0.95], [-0.2, 0.03, 1.15], [-0.5, 0.2, fram + 0.02]], mat(0x2a2450), 0.02);
  g.userData.satt = (o = 0) => { lucka.rotation.x = -klamp01(o) * 1.5; };
  return g;
}

// ---------- 2005 NINTENTO DS ----------
// undre skärmen: pekmeny för valpen (knappar, hjärtan och en penna som trycker)
function dsPekskarm() {
  const T = TH(), tex = duk(128, 96, () => {}, true), x = tex.userData.x;
  const r = (X, Y, W, H, f) => { x.fillStyle = f; x.fillRect(Math.round(X), Math.round(Y), Math.round(W), Math.round(H)); };
  const cirkel = (cx, cy, rr, f) => { for (let j = -rr; j <= rr; j++) { const w = Math.round(Math.sqrt(rr * rr - j * j)); r(cx - w, cy + j, w * 2 + 1, 1, f); } };
  const rita = (t) => {
    r(0, 0, 128, 96, '#fff3e2');
    for (let i = -96; i < 128; i += 12) for (let j = 0; j < 96; j++) r(i + j, j, 5, 1, '#ffe7cc');
    r(0, 0, 128, 15, '#ff8a9e'); r(0, 15, 128, 1, '#d8607a'); PT(x, 'VALPARNA', 64 - 15, 5, '#ffffff', SMALL);
    const tryck = Math.floor(t / 1.5) % 3, puls = (t % 1.5) < 0.35;
    [['BOLL', '#d8f040'], ['MAT', '#e8783a'], ['GÅ UT', '#5ab0f0']].forEach(([s, c], i) => {
      const cx = 22 + i * 42, cy = 46, rr = tryck === i && puls ? 14 : 16;
      cirkel(cx, cy + 2, rr, '#d8b49a'); cirkel(cx, cy, rr, tryck === i && puls ? '#ffe070' : '#ffffff'); cirkel(cx, cy, rr - 6, c);
      if (i === 0) { r(cx - 4, cy - 1, 2, 2, '#ffffff'); r(cx + 2, cy, 2, 2, '#ffffff'); }
      if (i === 1) r(cx - 6, cy + 2, 13, 3, '#a8502a');
      if (i === 2) { r(cx - 1, cy - 6, 2, 12, '#2a5a9a'); r(cx - 4, cy - 6, 8, 2, '#2a5a9a'); }
      PT(x, s, cx - Math.round((s.length * 4 - 1) / 2), cy + 20, '#8a5a4a', SMALL);
    });
    // hjärtmätaren nertill
    r(0, 82, 128, 14, '#ffd8de');
    for (let i = 0; i < 5; i++) { const hx = 30 + i * 14, f = i < 3 + Math.floor((t * 0.5) % 2) ? '#ff4070' : '#e8b4c0'; r(hx, 86, 2, 2, f); r(hx + 3, 86, 2, 2, f); r(hx, 88, 5, 2, f); r(hx + 1, 90, 3, 1, f); r(hx + 2, 91, 1, 1, f); }
    // pennans spets
    const px = 22 + tryck * 42 + Math.sin(t * 3) * 3, py = 40 + (puls ? 2 : -4);
    r(px, py, 2, 2, '#3a3a40'); r(px + 2, py - 2, 2, 2, '#9a9aa0'); r(px + 4, py - 4, 2, 2, '#9a9aa0'); r(px + 6, py - 6, 2, 2, '#c8c8d0');
    tex.needsUpdate = true;
  };
  rita(0);
  const me = new T.Mesh(new T.PlaneGeometry(0.61, 0.46), new T.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.75, roughness: 0.3 }));
  return { me, tick: rita };
}
function ds(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#f4f4f2'), W = 1.33, D = 0.739, HB = 0.11, HT = 0.1;
  const mork = mat(0x16161a, { roughness: 0.3, clearcoat: 1 }), gra = mat(0xc8c8cc), knapp = mat(0x2a2a2e);
  // undre halvan: pekskärm i mitten, styrkors till vänster, ABXY till höger
  platta(g, W, D, HB, m, 0, 0, 0, 0.12, 0.03);
  platta(g, 0.69, 0.54, 0.006, mork, 0, HB - 0.002, 0.0, 0.02, 0.002);
  const pek = dsPekskarm(); pek.me.rotation.x = -Math.PI / 2; pek.me.position.set(0, HB + 0.0055, 0.0); g.add(pek.me);
  rund(g, 0.1, 0.006, mat(0xe0e0e0), -0.5, HB, -0.03); styrkors(g, 0.15, knapp, -0.5, HB + 0.01, -0.03);
  for (const [bx, bz] of [[0.5, -0.11], [0.58, -0.03], [0.5, 0.05], [0.42, -0.03]]) rund(g, 0.034, 0.025, mat(0x3a3a40, { clearcoat: 0.8 }), bx, HB + 0.008, bz);
  for (const bz of [0.17, 0.25]) rund(g, 0.02, 0.012, gra, 0.48, HB + 0.004, bz);
  kloss(g, 0.08, 0.025, 0.02, gra, 0.48, 0.055, D / 2 + 0.006);
  for (const sx of [-1, 1]) kloss(g, 0.24, 0.05, 0.05, gra, sx * 0.53, 0.07, -D / 2 + 0.01);
  // gångjärnet med lampor
  const gang = rund(g, 0.055, 1.04, m, 0, HB + 0.01, -D / 2 + 0.05, 24); gang.rotation.z = Math.PI / 2;
  kloss(g, 0.03, 0.02, 0.02, lyser(0x40ff60, 2.4), 0.44, HB + 0.04, -D / 2 + 0.005);
  kloss(g, 0.03, 0.02, 0.02, lyser(0xff9a30, 1.2), 0.48, HB + 0.04, -D / 2 + 0.005);
  // övre halvan: fälls upp kring gångjärnet. Insidan (skärm, högtalare) är vänd neråt när den är stängd
  const vik = new T.Group(); vik.position.set(0, HB + 0.008, -D / 2 + 0.05); g.add(vik);
  const zc = D / 2 - 0.05;
  platta(vik, W, D, HT, m, 0, 0, zc, 0.12, 0.03);
  platta(vik, 0.69, 0.54, 0.006, mork, 0, -0.004, zc, 0.02, 0.002);
  const sk = glimtSkarm('valparna', 0.61, 0.46); sk.me.rotation.x = Math.PI / 2; sk.me.position.set(0, -0.0055, zc); vik.add(sk.me);
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) rund(vik, 0.009, 0.006, mork, sx * 0.53 + (i - 1) * 0.04, -0.002, zc - 0.05 + (j - 1) * 0.04, 8);
  dekal(vik, textTextur('NINTENTO DS', '#b4b4bc', 512, 96, 'bold 58px system-ui, sans-serif'), 0.5, 0.094, 0, HT + 0.002, zc, 'upp', { metalness: 0.6, roughness: 0.3 });
  // pennan ligger framför
  const penna = new T.Group(); penna.position.set(0.12, 0.022, D / 2 + 0.2); penna.rotation.y = 0.12; g.add(penna);
  const skaft = rund(penna, 0.02, 0.8, gra, 0, 0, 0, 16); skaft.rotation.z = Math.PI / 2;
  const spets = skugg(new T.Mesh(new T.ConeGeometry(0.02, 0.07, 16), mat(0x8a8a90))); spets.rotation.z = Math.PI / 2; spets.position.set(-0.435, 0, 0); penna.add(spets);
  const lock = rund(penna, 0.024, 0.08, mat(0xa8a8b0), 0.4, 0, 0, 16); lock.rotation.z = Math.PI / 2;
  g.userData.tick = (t) => { sk.tick(t); pek.tick(t); };
  g.userData.satt = (o = 1) => { vik.rotation.x = -klamp01(o) * 2.05; };
  return g;
}

export const KONSOLER = [
  {
    id: 'konsol-dromcast', namn: 'SEGO DRÖMCAST', forebild: 'Sega Dreamcast', ar: 1999, glimt: 'galentaxi', oppna: ['SKIVLUCKAN', 0], bygg: dromcast,
    info: 'Vit och fyrkantig med en orange virvel på den runda luckan. Minneskortet med egen liten skärm sitter i handkontrollen.',
    pixel(x, X, Y) {
      skugga2(x, X + 5, Y + 25, 30); lada2(x, X + 5, Y + 11, 30, 7, 7, '#f2f2ee', '#d8d8d2');
      for (let j = -3; j <= 3; j++) { const w = Math.round(Math.sqrt(9 - j * j) * 3.4); R2(x, X + 20 - w, Y + 14 + j * 0.7, w * 2, 1, '#fafaf6'); }
      for (let a = 0; a < 16; a++) { const v = -0.4 - (a / 16) * Math.PI * 2, r = 3.5 - a / 6; P2(x, X + 20 + Math.cos(v) * r, Y + 14 + Math.sin(v) * r * 0.6, '#f06a1a'); }
      for (let i = 0; i < 4; i++) R2(x, X + 9 + i * 6, Y + 21, 4, 2, '#3a3a3e');
      P2(x, X + 10, Y + 17, '#ff8a20'); R2(x, X + 30, Y + 16, 2, 1, '#c8c8c4');
    },
  },
  {
    id: 'konsol-xlada', namn: 'MIKROMJUK X-LÅDA', forebild: 'Microsoft Xbox', ar: 2002, glimt: 'haloo', oppna: ['SKIVLÅDAN', 0], bygg: xlada,
    info: 'Stor och svart med en grön X-juvel ovanpå. Skivlådan glider ut framtill, och den första handkontrollen var jättestor.',
    pixel(x, X, Y) {
      skugga2(x, X, Y + 25, 40); lada2(x, X, Y + 9, 40, 7, 10, '#2a2a2e', '#1a1a1c');
      for (let i = 0; i < 16; i++) { P2(x, X + 4 + i * 2, Y + 9 + Math.round(i * 0.4), '#3c3c42'); P2(x, X + 36 - i * 2, Y + 9 + Math.round(i * 0.4), '#3c3c42'); }
      R2(x, X + 16, Y + 10, 9, 4, '#101010'); R2(x, X + 17, Y + 10, 7, 3, '#3cd23c'); R2(x, X + 18, Y + 10, 2, 1, '#b0ffa0');
      P2(x, X + 18, Y + 11, '#0a0a0a'); P2(x, X + 22, Y + 11, '#0a0a0a'); P2(x, X + 20, Y + 12, '#0a0a0a'); P2(x, X + 19, Y + 11, '#0a0a0a'); P2(x, X + 21, Y + 11, '#0a0a0a');
      R2(x, X + 8, Y + 18, 16, 2, '#0a0a0a'); R2(x, X + 9, Y + 19, 14, 1, '#40ff40');
      P2(x, X + 33, Y + 18, '#40ff40'); P2(x, X + 33, Y + 21, '#30c030');
      for (let i = 0; i < 4; i++) R2(x, X + 5 + i * 8, Y + 23, 5, 1, '#3a3a3e');
    },
  },
  {
    id: 'konsol-gamekub', namn: 'NINTENTO GAMEKUB', forebild: 'Nintendo GameCube', ar: 2002, glimt: 'marcosolsken', oppna: ['SKIVLUCKAN', 0], bygg: gamekub,
    info: 'En lila kub med handtag där bak. Små skivor under den runda luckan och en handkontroll med en stor grön A-knapp.',
    pixel(x, X, Y) {
      skugga2(x, X + 8, Y + 26, 26);
      R2(x, X + 12, Y + 3, 18, 1, '#4a3f8a'); R2(x, X + 11, Y + 4, 1, 3, '#4a3f8a'); R2(x, X + 30, Y + 4, 1, 3, '#4a3f8a');
      lada2(x, X + 9, Y + 6, 24, 6, 15, '#6a5cb0', '#4a3f8a', '#1c1830');
      for (let j = -2; j <= 2; j++) { const w = Math.round(Math.sqrt(5 - j * j) * 3.6); R2(x, X + 22 - w, Y + 9 + j * 0.8, w * 2, 1, '#5a4ea0'); }
      R2(x, X + 21, Y + 8, 2, 2, '#c8c0f0');
      R2(x, X + 12, Y + 14, 18, 4, '#40367e'); for (let i = 0; i < 4; i++) R2(x, X + 11 + i * 5, Y + 19, 3, 2, '#1c1a30');
      P2(x, X + 12, Y + 11, '#40ff60');
    },
  },
  {
    id: 'konsol-ds', namn: 'NINTENTO DS', forebild: 'Nintendo DS Lite', ar: 2005, glimt: 'valparna', oppna: ['LOCKET', 1], bygg: ds,
    info: 'Två skärmar i ett skal som fälls upp. Den undre är en pekskärm, och pennan ligger bredvid. Valpen syns live på den övre.',
    pixel(x, X, Y) {
      skugga2(x, X + 7, Y + 26, 26);
      R2(x, X + 10, Y + 1, 20, 13, '#f0f0ee'); R2(x, X + 10, Y + 1, 20, 1, '#ffffff'); R2(x, X + 13, Y + 3, 14, 10, '#1a1a1e'); R2(x, X + 14, Y + 4, 12, 8, '#f4e0c2');
      R2(x, X + 17, Y + 7, 6, 5, '#f2c88e'); P2(x, X + 18, Y + 8, '#2a1a14'); P2(x, X + 21, Y + 8, '#2a1a14'); R2(x, X + 19, Y + 10, 2, 1, '#2a1a14');
      R2(x, X + 9, Y + 14, 22, 2, '#d8d8d4');
      R2(x, X + 8, Y + 16, 24, 9, '#e8e8e4'); R2(x, X + 8, Y + 24, 24, 1, '#b8b8b4'); R2(x, X + 14, Y + 17, 12, 7, '#1a1a1e'); R2(x, X + 15, Y + 18, 10, 5, '#ffd0d8');
      R2(x, X + 10, Y + 19, 3, 1, '#2a2a2e'); R2(x, X + 11, Y + 18, 1, 3, '#2a2a2e');
      for (const [bx, by] of [[28, 18], [29, 19], [28, 20], [27, 19]]) P2(x, X + bx, Y + by, '#3a3a40');
    },
  },
];
