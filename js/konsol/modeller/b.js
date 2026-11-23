// Konsoler i 3D, grupp B. Samma format som KONSOLFORMER i ../konsol-gl.js. Verktygen finns i ../gl-verktyg.js.
// SUPER NINTENTO (1992), SEGO SATURNUS (1995), NINTENTO 64 (1997) och GAME BOJ COLOR (1998). Modellenhet 1 = 10 cm.
import * as V from '../gl-verktyg.js';
import { T as text, TW, BIG, SMALL, spr } from '../pix.js';
import { KONSOL as PIX } from '../konsoller.js';

const { TH, mat, glans, lyser, skugg, platta, staende, kloss, rund, kabel, styrkors, glimtSkarm, glimtEtikett, kropp, klamp01 } = V;

// ---------- egna småverktyg ----------
// en form (THREE.Shape i XY) som ligger platt: formens +y blir bakåt (−z), tjockleken går uppåt från y
function liggForm(g, form, tjock, m, x, y, z, bev = 0.03) {
  const T = TH(), geo = new T.ExtrudeGeometry(form, { depth: Math.max(0.002, tjock - 2 * bev), bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 24 });
  geo.translate(0, 0, bev); geo.computeVertexNormals();
  const me = skugg(new T.Mesh(geo, m)); me.rotation.x = -Math.PI / 2; me.position.set(x, y, z); g.add(me); return me;
}
// en form sedd framifrån (XY = bredd/höjd i världen), djupet centrerat kring z
function staForm(g, form, djup, m, x, y, z, bev = 0.03) {
  const T = TH(), geo = new T.ExtrudeGeometry(form, { depth: Math.max(0.002, djup - 2 * bev), bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 24 });
  geo.translate(0, 0, -(djup - 2 * bev) / 2); geo.computeVertexNormals();
  const me = skugg(new T.Mesh(geo, m)); me.position.set(x, y, z); g.add(me); return me;
}
// en profil sedd från sidan (formens x = djup framåt, y = höjd) som dras ut över bredden
function profil(g, form, bredd, m, bev = 0.05) {
  const T = TH(), geo = new T.ExtrudeGeometry(form, { depth: bredd - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 4, curveSegments: 20 });
  geo.translate(0, 0, -(bredd - 2 * bev) / 2); geo.computeVertexNormals();
  const me = skugg(new T.Mesh(geo, m)); me.rotation.y = -Math.PI / 2; g.add(me); return me;
}
// en liten pixelskylt (text eller sprite) som platt rektangel; ritaFn(ctx) ritar i en duk w×h pixlar
function skylt(w, h, ritaFn, hojd) {
  const T = TH(), c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); ritaFn(x);
  const tex = new T.CanvasTexture(c); tex.magFilter = T.NearestFilter; tex.minFilter = T.LinearFilter; tex.colorSpace = T.SRGBColorSpace; tex.generateMipmaps = false;
  return new T.Mesh(new T.PlaneGeometry((hojd * w) / h, hojd), new T.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.3, roughness: 0.5 }));
}
// textskylt med en färg per bokstav (färger upprepas)
function textSkylt(s, farger, hojd, F = BIG) {
  const up = F === BIG ? 2 : 1, w = TW(s, F) + 2, h = F.h + 2 + up;
  return skylt(w, h, (x) => { let cx = 1; [...s].forEach((ch, i) => { text(x, ch, cx, 1 + up, farger[i % farger.length], F); cx += TW(ch, F) + 1; }); }, hojd);
}
// liggande skylt (pekar uppåt) eller stående (pekar framåt)
const ligg = (me, g, x, y, z, rotZ = 0) => { me.rotation.x = -Math.PI / 2; me.rotation.z = rotZ; me.position.set(x, y, z); g.add(me); return me; };
const sta = (me, g, x, y, z) => { me.position.set(x, y, z); g.add(me); return me; };
// lokal punkt i en undergrupp → koordinat i föräldern (för kablar till handkontroller som är vridna)
const ut = (k, x, y, z) => { k.updateMatrix(); const v = new (TH().Vector3)(x, y, z).applyMatrix4(k.matrix); return [v.x, v.y, v.z]; };
const mjuk = (p) => p * p * (3 - 2 * p);
// pixelbildens hjälp (40×28-rutorna i tidslinjen)
const PR = (x, X, Y, W, H, f) => { if (W <= 0 || H <= 0) return; x.fillStyle = f; x.fillRect(Math.round(X), Math.round(Y), Math.round(W), Math.round(H)); };
const skuggaPix = (x, X, Y, w) => { PR(x, X + 2, Y, w - 4, 1, 'rgba(0,0,0,0.35)'); PR(x, X + 4, Y + 1, w - 8, 1, 'rgba(0,0,0,0.2)'); };

// ---------- 1992 SUPER NINTENTO (Super Famicom / europeisk SNES) ----------
// "hundbenet": två runda ändar med smal mitt
function hundben(r = 0.31, dx = 0.41) {
  const T = TH(), s = new T.Shape(), a = Math.PI / 3, jx = dx - r * Math.cos(a), jy = r * Math.sin(a);
  s.moveTo(-jx, jy); s.quadraticCurveTo(0, jy - 0.05, jx, jy);
  s.absarc(dx, 0, r, Math.PI - a, -(Math.PI - a), true);
  s.quadraticCurveTo(0, -jy + 0.05, -jx, -jy);
  s.absarc(-dx, 0, r, -a, a, true);
  return s;
}
function snesKontroll(g, x, z, rot) {
  const T = TH(), k = new T.Group(); k.position.set(x, 0, z); k.rotation.y = rot; g.add(k);
  const kr = mat(0xc6c6ca, { roughness: 0.5 }), mork = mat(0x9c9ca2, { roughness: 0.5 }), H = 0.22;
  liggForm(k, hundben(), H, kr, 0, 0, 0, 0.06);
  // axelknapparna L och R längs bakkanten
  for (const s of [-1, 1]) { const b = staende(k, 0.4, 0.1, 0.1, mork, s * 0.42, 0.08, -0.27, 0.05, 0.02); b.rotation.y = s * 0.32; }
  // styrkorset i en grund skål
  rund(k, 0.17, 0.02, mat(0xb4b4b8), -0.41, H, 0, 32);
  styrkors(k, 0.27, mat(0x2a2a2e), -0.41, H + 0.03, 0);
  // knappytan till höger: mörkare grå platta snett och fyra färgade knappar (X blå, A röd, B gul, Y grön)
  const yta = liggForm(k, (() => { const s = new T.Shape(); s.absellipse(0, 0, 0.27, 0.17, 0, Math.PI * 2); return s; })(), 0.02, mat(0x8a8a92), 0.41, H - 0.005, 0, 0.005);
  yta.rotation.z = 0.55;
  for (const [bx, bz, f] of [[0.41, -0.13, 0x3a50c8], [0.55, 0, 0xd82828], [0.41, 0.13, 0xe8b818], [0.27, 0, 0x28a048]]) rund(k, 0.062, 0.07, glans(f), bx, H + 0.02, bz, 24);
  // SELECT och START: sneda gummipiller i mitten
  for (const sx of [-0.07, 0.08]) { const p = platta(k, 0.13, 0.045, 0.03, mat(0x55555c), sx, H - 0.005, 0.05, 0.022, 0.008); p.rotation.z = 0.6; }
  // fyrfärgsloggan ovanför
  for (const [i, f] of [0xd82828, 0xe8b818, 0x28a048, 0x3a50c8].entries()) rund(k, 0.016, 0.01, lyser(f, 0.25), -0.045 + i * 0.03, H + 0.002, -0.1, 12);
  return k;
}
// SNES/SFC-kassetten: grå med rundade övre hörn och etiketten fram
function snesKassett(g) {
  const T = TH(), k = new T.Group(); g.add(k);
  const gra = mat(0x8e8e94, { roughness: 0.6 }), W = 1.36, H = 1.2;
  staende(k, W, H, 0.2, gra, 0, 0, 0, 0.05, 0.015, [0.03, 0.03, 0.26, 0.26]);
  staende(k, 1.1, 0.86, 0.02, mat(0x76767c), 0, 0.2, 0.1, 0.04, 0.008);      // fördjupningen för etiketten
  const lapp = new T.Mesh(new T.PlaneGeometry(0.96, 0.72), new T.MeshStandardMaterial({ map: glimtEtikett('marcokart', 2.2), roughness: 0.45 }));
  lapp.position.set(0, 0.64, 0.112); k.add(lapp);
  for (let i = 0; i < 6; i++) kloss(k, 0.9, 0.025, 0.03, mat(0x76767c), 0, 1.08 - i * 0.0, -0.1 - 0.0).position.set(0, 1.12 - i * 0.0, -0.1);   // greppränder bak (en rad räcker)
  for (let i = 0; i < 5; i++) kloss(k, 0.035, 0.22, 0.02, mat(0x76767c), -0.3 + i * 0.15, 0.98, -0.105);
  return k;
}
function snes(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#cacac6'), W = 2.0, D = 2.42;
  const mork = mat(0x6a6a70, { roughness: 0.5 }), svart = mat(0x141416);
  // underdelen och den upphöjda översidan med mjuka kanter
  platta(g, W, D, 0.46, m, 0, 0, 0, 0.3, 0.1);
  platta(g, W - 0.12, D - 0.5, 0.26, m, 0, 0.4, -0.2, 0.28, 0.12);
  // kassettfacket mitt bak: mörkare grå ram, svart springa och fjäderluckor
  const SZ = -0.5, TOP = 0.66;
  platta(g, 1.5, 0.42, 0.06, mork, 0, TOP - 0.02, SZ, 0.1, 0.03);
  kloss(g, 1.4, 0.03, 0.22, svart, 0, TOP + 0.03, SZ);
  for (const dz of [-0.065, 0.065]) kloss(g, 1.36, 0.012, 0.09, mat(0x3a3a3e), 0, TOP + 0.045, SZ + dz);
  // POWER till vänster och RESET till höger framför facket, utmatningsknappen i mitten
  for (const s of [-1, 1]) {
    platta(g, 0.34, 0.24, 0.03, mork, s * 0.55, TOP - 0.01, 0.0, 0.05, 0.01);
    kloss(g, 0.12, 0.08, 0.12, mat(0x3c3c42), s * 0.55, TOP + 0.06, s < 0 ? -0.04 : 0.04);
  }
  platta(g, 0.3, 0.16, 0.06, mork, 0, TOP - 0.01, -0.12, 0.06, 0.02);
  for (const [nx, ord] of [[-0.55, 'POWER'], [0.55, 'RESET']]) ligg(textSkylt(ord, ['#4a4a50'], 0.05, SMALL), g, nx, TOP + 0.025, 0.17);
  // fyrfärgsloggan och namnet framme till vänster
  for (const [i, f] of [0xd82828, 0xe8b818, 0x28a048, 0x3a50c8].entries()) rund(g, 0.04, 0.012, lyser(f, 0.3), -0.8 + i * 0.1, TOP + 0.005, 0.56, 16);
  ligg(textSkylt('SUPER TENKO', ['#55555c'], 0.065), g, -0.2, TOP + 0.005, 0.7);
  // framsidan: två handkontrollsportar och strömlampan
  for (const px of [-0.42, 0.0]) { staende(g, 0.3, 0.16, 0.04, mork, px, 0.1, D / 2 - 0.005, 0.04, 0.01); kloss(g, 0.2, 0.06, 0.02, svart, px, 0.18, D / 2 + 0.012); }
  kloss(g, 0.05, 0.03, 0.02, lyser(0xff2020, 2), 0.7, 0.3, D / 2 - 0.005);
  // handkontrollen med sladd in i port 1
  const k = snesKontroll(g, 1.75, 1.75, -0.35);
  kabel(g, [ut(k, 0, 0.12, -0.3), ut(k, -0.1, 0.03, -0.6), [0.4, 0.03, 1.55], [-0.42, 0.03, 1.4], [-0.42, 0.18, D / 2 + 0.02]], mat(0x8a8a90), 0.02);
  // kassetten: står bredvid → lyfts upp och sänks ner i facket
  const kass = snesKassett(g);
  g.userData.satt = (o = 0) => {
    o = klamp01(o);
    const a = mjuk(Math.min(1, o / 0.6)), b = mjuk(Math.max(0, (o - 0.6) / 0.4));
    kass.position.set(-2.05 + a * 2.05, a * 1.0 - b * 0.62, 0.35 + a * (SZ - 0.35)); kass.rotation.y = 0.45 * (1 - a);
  };
  return g;
}

// ---------- 1995 SEGO SATURNUS (Sega Saturn, svart europeisk) ----------
function saturnusKontroll(g, x, z, rot) {
  const T = TH(), k = new T.Group(); k.position.set(x, 0, z); k.rotation.y = rot; g.add(k);
  const kr = mat(0x1e1e22, { roughness: 0.72, clearcoat: 0 }), gra = mat(0x8a8a94, { roughness: 0.45 }), H = 0.22;
  // njurformen: bred rundad ovankant, två runda handtag nertill
  const s = new T.Shape();
  s.moveTo(-0.5, 0.3); s.quadraticCurveTo(0, 0.42, 0.5, 0.3);
  s.absarc(0.46, -0.02, 0.32, Math.PI / 2 - 0.1, -Math.PI * 0.72, true);
  s.quadraticCurveTo(0, -0.18, -0.2, -0.28);
  s.absarc(-0.46, -0.02, 0.32, -Math.PI * 0.28, Math.PI / 2 + 0.1, true);
  liggForm(k, s, H, kr, 0, 0, 0, 0.06);
  // axelknappar L och R
  for (const sd of [-1, 1]) { const b = staende(k, 0.34, 0.1, 0.1, gra, sd * 0.5, 0.09, -0.3, 0.05, 0.02); b.rotation.y = sd * 0.25; }
  // runt styrkors: grå skiva med ett kors
  rund(k, 0.17, 0.05, gra, -0.46, H, 0.02, 32);
  styrkors(k, 0.24, mat(0x5a5a62), -0.46, H + 0.035, 0.02);
  // sex knappar i två bågar: X Y Z små upptill, A B C stora nertill
  for (let i = 0; i < 3; i++) {
    rund(k, 0.068, 0.07, glans(0x9a9aa4), 0.28 + i * 0.16, H + 0.01, 0.12 - i * 0.07, 24);
    rund(k, 0.045, 0.06, glans(0x9a9aa4), 0.32 + i * 0.13, H + 0.01, -0.07 - i * 0.06, 20);
  }
  for (let i = 0; i < 3; i++) ligg(textSkylt('ABC'[i], ['#b0b0b8'], 0.05, SMALL), k, 0.2 + i * 0.16, H + 0.005, 0.22 - i * 0.07);
  // START i mitten nertill och märket ovanför
  platta(k, 0.11, 0.07, 0.03, gra, 0, H - 0.005, 0.12, 0.03, 0.01);
  ligg(textSkylt('ORBIT', ['#6a8ad0'], 0.04, SMALL), k, 0, H + 0.003, -0.1);
  return k;
}
function saturnus(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#2e2e34'), W = 2.6, D = 2.3, H = 0.83;
  const gra = mat(0x9a9aa4, { roughness: 0.4 }), kant = mat(0x5a5a64, { roughness: 0.5 }), svart = mat(0x101012);
  // sidoprofilen: rak baksida, platt topp och en mjukt rundad framkant ner mot portarna
  // (avfasningen växer utåt med b, så profilen ritas b innanför de riktiga måtten)
  const s = new T.Shape(), b = 0.08, F = D / 2 - b, B = -D / 2 + b, Hb = H - b;
  s.moveTo(B, b); s.lineTo(F, b); s.lineTo(F, 0.36);
  s.bezierCurveTo(F, 0.62, F - 0.1, Hb, F - 0.36, Hb);
  s.lineTo(B, Hb); s.closePath();
  profil(g, s, W, m, b);
  // skivluckan: oval, gångjärn bak, med en ring och skivan under
  const LX = -0.38, LZ = -0.08, RX = 0.7, RZ = 0.62;
  const oval = (rx, rz) => { const f = new T.Shape(); f.absellipse(0, 0, rx, rz, 0, Math.PI * 2); return f; };
  liggForm(g, oval(RX + 0.07, RZ + 0.07), 0.025, kant, LX, H - 0.005, LZ, 0.008);              // ljusare kant runt luckan
  rund(g, 0.6, 0.02, mat(0x1a1a1e), LX, H - 0.03, LZ, 48);                                       // facket
  const skivM = new T.MeshPhysicalMaterial({ color: 0xd8dce4, metalness: 0.9, roughness: 0.12, iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [200, 600] });
  rund(g, 0.55, 0.012, skivM, LX, H - 0.005, LZ, 48); rund(g, 0.09, 0.016, mat(0x9a9aa4), LX, H - 0.002, LZ, 24);
  const lucka = new T.Group(); lucka.position.set(LX, H + 0.005, LZ - RZ); g.add(lucka);
  liggForm(lucka, oval(RX, RZ), 0.06, m, 0, 0, RZ, 0.025);
  // luckans topp: en upphöjd rund platta med en ljus ring och skivsymbolen
  for (const [r, tj] of [[0.5, 0.025], [0.38, 0.015]]) { const ring = new T.Mesh(new T.TorusGeometry(r, tj, 10, 64), r > 0.4 ? kant : mat(0x45454e)); ring.rotation.x = -Math.PI / 2; ring.scale.set(1, (RZ / RX) * (r > 0.4 ? 1 : 1.05), 1); ring.position.set(0, 0.07, RZ); lucka.add(ring); }
  ligg(textSkylt('COMPACT DISC', ['#9a9aa6'], 0.05, SMALL), lucka, 0, 0.064, RZ + 0.22);
  ligg(textSkylt('TORA', ['#9ab0e8'], 0.07), lucka, 0, 0.064, RZ - 0.05);
  // knapparna till höger: OPEN (oval), RESET och POWER, två lampor
  const knapp = (rx, rz, f, x, z) => liggForm(g, oval(rx, rz), 0.06, f, x, H - 0.01, z, 0.02);
  knapp(0.16, 0.11, gra, 0.78, -0.35); knapp(0.07, 0.07, gra, 0.66, 0.32); knapp(0.11, 0.11, gra, 0.98, 0.32);
  ligg(textSkylt('OPEN', ['#8a8a92'], 0.045, SMALL), g, 0.78, H + 0.003, -0.15);
  ligg(textSkylt('RESET', ['#8a8a92'], 0.04, SMALL), g, 0.66, H + 0.003, 0.46); ligg(textSkylt('POWER', ['#8a8a92'], 0.04, SMALL), g, 0.98, H + 0.003, 0.48);
  kloss(g, 0.07, 0.025, 0.05, lyser(0x40ff60, 3), 0.62, H + 0.005, -0.72); kloss(g, 0.07, 0.025, 0.05, lyser(0xff9a20, 2), 0.76, H + 0.005, -0.72);
  // kassettfacket bak (för minneskort) och namnet framme
  kloss(g, 1.3, 0.02, 0.14, svart, 0.0, H + 0.005, -D / 2 + 0.16); kloss(g, 1.36, 0.012, 0.03, gra, 0.0, H + 0.008, -D / 2 + 0.24);
  ligg(textSkylt('TORA ORBIT', ['#9ab0e8'], 0.085), g, -0.38, H + 0.003, 0.65);
  // planeten med ring bredvid namnet
  const pl = new T.Mesh(new T.SphereGeometry(0.05, 16, 12), lyser(0x6a8ad0, 0.4)); pl.position.set(0.25, H + 0.01, 0.72); g.add(pl);
  const pr = new T.Mesh(new T.TorusGeometry(0.08, 0.008, 6, 32), lyser(0x8aa4e0, 0.4)); pr.rotation.x = -Math.PI / 2 + 0.25; pr.position.copy(pl.position); g.add(pr);
  // framsidan: två handkontrollsportar
  for (const px of [-0.9, -0.5]) { staende(g, 0.34, 0.16, 0.04, mat(0x18181c), px, 0.12, D / 2 - 0.005, 0.04, 0.01); for (let i = 0; i < 5; i++) kloss(g, 0.03, 0.06, 0.02, gra, px - 0.1 + i * 0.05, 0.2, D / 2 + 0.012); }
  const k = saturnusKontroll(g, 1.95, 1.75, -0.3);
  kabel(g, [ut(k, 0, 0.12, -0.32), ut(k, -0.1, 0.03, -0.62), [0.2, 0.03, 1.6], [-0.9, 0.03, 1.45], [-0.9, 0.2, D / 2 + 0.02]], mat(0x18181c), 0.02);
  g.userData.satt = (o = 0) => { lucka.rotation.x = -klamp01(o) * 1.25; };
  return g;
}

// ---------- 1997 NINTENTO 64 ----------
// N-kuben: fyra färgade block i form av ett N (pixelbild 16×14)
const NKUB = ['BBB.......RRR', 'BBBB......RRR', 'BBBGG.....RRR', 'BBB.GG....RRR', 'BBB..GG...RRR', 'BBB...GG..RRR', 'BBB....GG.RRR', 'BBB.....GGRRR', 'BBB......GRRR', 'BBB.......RRR', 'YYYYYYYYYYYYY', '.YYYYYYYYYYYY'];
const NKUB_PAL = { B: '#2a5ad8', G: '#20a848', R: '#e02828', Y: '#f0c018' };
function n64Logga(hojd, medText = true) {
  const w = medText ? 15 + TW('TENKO 64', SMALL) + 2 : 15, h = 14;
  return skylt(w, h, (x) => { spr(x, NKUB, 1, 1, NKUB_PAL); if (medText) text(x, 'TENKO 64', 16, 5, '#c8c8d0', SMALL); }, hojd);
}
function n64Kontroll(g, x, z, rot) {
  const T = TH(), k = new T.Group(); k.position.set(x, 0, z); k.rotation.y = rot; g.add(k);
  const kr = mat(0x9c9ca4, { roughness: 0.5 }), mork = mat(0x5a5a62), H = 0.22;
  // tre handtag: vänster (styrkorset), mitten (spaken), höger (knapparna)
  const s = new T.Shape();
  s.moveTo(-0.78, 0.16); s.quadraticCurveTo(0, 0.5, 0.78, 0.16);
  s.quadraticCurveTo(0.84, 0.0, 0.78, -0.2); s.lineTo(0.77, -0.6);
  s.absarc(0.62, -0.6, 0.15, 0, -Math.PI, true);
  s.quadraticCurveTo(0.45, -0.24, 0.3, -0.2); s.quadraticCurveTo(0.16, -0.2, 0.15, -0.36); s.lineTo(0.15, -0.66);
  s.absarc(0, -0.66, 0.15, 0, -Math.PI, true);
  s.lineTo(-0.15, -0.36); s.quadraticCurveTo(-0.16, -0.2, -0.3, -0.2); s.quadraticCurveTo(-0.45, -0.24, -0.47, -0.6);
  s.absarc(-0.62, -0.6, 0.15, 0, -Math.PI, true);
  s.lineTo(-0.78, -0.2); s.quadraticCurveTo(-0.84, 0.0, -0.78, 0.16);
  liggForm(k, s, H, kr, 0, 0, 0, 0.06);
  // axelknappar L och R
  for (const sd of [-1, 1]) { const b = staende(k, 0.3, 0.1, 0.1, mork, sd * 0.6, 0.08, -0.26, 0.05, 0.02); b.rotation.y = sd * 0.42; }
  // styrkorset till vänster
  rund(k, 0.16, 0.02, mat(0x8a8a92), -0.6, H, 0.06, 32); styrkors(k, 0.24, mat(0x3a3a40), -0.6, H + 0.03, 0.06);
  // analogspaken på mittenhandtaget
  rund(k, 0.12, 0.02, mat(0x7a7a82), 0, H, 0.34, 32); rund(k, 0.03, 0.1, mat(0x5a5a62), 0, H + 0.05, 0.34, 12);
  const knopp = rund(k, 0.085, 0.04, mat(0x8a8a92, { roughness: 0.7 }), 0, H + 0.11, 0.34, 32);
  // START (röd) i mitten
  rund(k, 0.055, 0.05, glans(0xd02020), 0, H + 0.005, -0.1, 24);
  // A (blå) och B (grön) och fyra gula C-knappar
  rund(k, 0.075, 0.06, glans(0x2a4ad0), 0.5, H + 0.01, 0.13, 24);
  rund(k, 0.07, 0.06, glans(0x20a040), 0.38, H + 0.01, -0.03, 24);
  for (const [dx, dz] of [[0, -0.1], [0.1, 0], [0, 0.1], [-0.1, 0]]) rund(k, 0.042, 0.06, glans(0xf0c018), 0.66 + dx, H + 0.01, -0.05 + dz, 20);
  ligg(n64Logga(0.06, false), k, 0, H + 0.003, -0.25);
  return k;
}
// N64-kassetten: grå, bred, med räfflad rundad överkant och stor etikett
function n64Kassett(g) {
  const T = TH(), k = new T.Group(); g.add(k);
  const gra = mat(0x8a8a92, { roughness: 0.6 }), W = 1.16, H = 0.75;
  staende(k, W, H, 0.18, gra, 0, 0, 0, 0.05, 0.015, [0.02, 0.02, 0.14, 0.14]);
  const lapp = new T.Mesh(new T.PlaneGeometry(0.72, 0.54), new T.MeshStandardMaterial({ map: glimtEtikett('marco64', 1.6), roughness: 0.45 }));
  lapp.position.set(0, 0.4, 0.092); k.add(lapp);
  for (let i = 0; i < 7; i++) kloss(k, 0.04, 0.1, 0.02, mat(0x74747c), -0.42 + i * 0.14, 0.66, -0.095);
  return k;
}
function n64(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#34343a'), W = 2.6, D = 1.9;
  const mork = mat(0x1c1c20), svart = mat(0x0c0c0e), gra = mat(0x4a4a52, { roughness: 0.5 });
  // låg bred underdel, den runda kullen i mitten och två lägre vingar
  platta(g, W, D, 0.42, m, 0, 0, 0, 0.34, 0.12);
  platta(g, 1.42, 1.34, 0.26, m, 0, 0.34, -0.18, 0.5, 0.13);
  for (const s of [-1, 1]) platta(g, 0.6, 1.3, 0.1, m, s * 0.95, 0.38, -0.12, 0.24, 0.05);
  // kassettfacket på kullen med fjäderluckor
  const SZ = -0.34, TOP = 0.6;
  platta(g, 0.9, 0.34, 0.08, mork, 0, TOP - 0.02, SZ, 0.08, 0.025);
  kloss(g, 0.8, 0.03, 0.18, svart, 0, TOP + 0.05, SZ);
  for (const dz of [-0.05, 0.05]) kloss(g, 0.76, 0.012, 0.07, mat(0x26262a), 0, TOP + 0.065, SZ + dz);
  // POWER till vänster och RESET till höger på vingarna
  for (const sd of [-1, 1]) { platta(g, 0.22, 0.32, 0.03, mork, sd * 0.95, 0.47, -0.05, 0.05, 0.01); kloss(g, 0.14, 0.07, 0.1, gra, sd * 0.95, 0.53, sd < 0 ? -0.1 : -0.02); }
  ligg(textSkylt('POWER', ['#6a6a72'], 0.05, SMALL), g, -0.95, 0.485, 0.18); ligg(textSkylt('RESET', ['#6a6a72'], 0.05, SMALL), g, 0.95, 0.485, 0.18);
  // minneslocket fram med N-kuben och namnet
  platta(g, 1.2, 0.36, 0.03, mat(0x2c2c32), 0, 0.41, 0.55, 0.06, 0.012);
  ligg(n64Logga(0.12), g, 0, 0.445, 0.55);
  kloss(g, 0.05, 0.02, 0.05, lyser(0xff2020, 2), -0.95, 0.43, 0.6);
  // fyra handkontrollsportar i framkanten
  for (let i = 0; i < 4; i++) { const px = -0.66 + i * 0.44; staende(g, 0.28, 0.18, 0.04, mork, px, 0.1, D / 2 - 0.01, 0.06, 0.012, [0.09, 0.09, 0.03, 0.03]); kloss(g, 0.16, 0.05, 0.02, svart, px, 0.2, D / 2 + 0.008); }
  // handkontrollen med sladd in i port 1
  const k = n64Kontroll(g, 2.1, 1.7, -0.35);
  kabel(g, [ut(k, 0, 0.12, -0.34), ut(k, -0.15, 0.03, -0.7), [0.2, 0.03, 1.6], [-0.66, 0.03, 1.4], [-0.66, 0.2, D / 2 + 0.02]], mat(0x2a2a2e), 0.02);
  // kassetten: står bredvid → lyfts och trycks ner i facket
  const kass = n64Kassett(g);
  g.userData.satt = (o = 0) => {
    o = klamp01(o);
    const a = mjuk(Math.min(1, o / 0.6)), b = mjuk(Math.max(0, (o - 0.6) / 0.4));
    kass.position.set(-2.1 + a * 2.1, a * 0.95 - b * 0.55, 0.3 + a * (SZ - 0.3)); kass.rotation.y = 0.45 * (1 - a);
  };
  return g;
}

// ---------- 1998 GAME BOJ COLOR (genomskinligt lila) ----------
function gbc(tel) {
  const T = TH(), g = new T.Group(), w = 0.75, h = 1.33, d = 0.27, fram = d / 2;
  // standard: genomskinlig lila plast ("Atomic Purple") med kretskortet som skymtar inuti
  const m = tel.kropp ? kropp(tel, '#7a4ac0') : new T.MeshPhysicalMaterial({ color: 0x8a5ad8, transmission: 0.55, thickness: 0.3, roughness: 0.22, ior: 1.45, clearcoat: 1, clearcoatRoughness: 0.08, attenuationColor: new T.Color(0x5a2aa0), attenuationDistance: 0.6 });
  const s = new T.Shape();
  s.moveTo(0, 0); s.bezierCurveTo(0.2, 0, w / 2, 0.06, w / 2, 0.22); s.lineTo(w / 2, h - 0.06); s.quadraticCurveTo(w / 2, h, w / 2 - 0.06, h);
  s.lineTo(-w / 2 + 0.06, h); s.quadraticCurveTo(-w / 2, h, -w / 2, h - 0.06); s.lineTo(-w / 2, 0.22); s.bezierCurveTo(-w / 2, 0.06, -0.2, 0, 0, 0);
  staForm(g, s, d, m, 0, 0, 0, 0.03);
  if (!tel.kropp) { kloss(g, w - 0.14, h - 0.3, 0.03, mat(0x1e4a32, { roughness: 0.6 }), 0, 0.68, -0.02); for (const [cx, cy] of [[-0.12, 0.5], [0.1, 0.3], [0.05, 0.75]]) kloss(g, 0.12, 0.1, 0.04, mat(0x101012), cx, cy, -0.04); }
  // skärmramen: mörk, med skärmen upptill och loggan under
  staende(g, 0.64, 0.56, 0.02, mat(0x2a2a34, { roughness: 0.3 }), 0, 0.7, fram + 0.002, 0.05, 0.006, [0.05, 0.05, 0.05, 0.05]);
  const sk = glimtSkarm('fickmonster', 0.46, 0.414); sk.me.position.set(0.02, 1.03, fram + 0.014); g.add(sk.me);
  kloss(g, 0.025, 0.025, 0.01, lyser(0xff3030, 2), -0.27, 1.1, fram + 0.014);
  const logga = textSkylt('TENKO POCKET COLOR', ['#e8e8f0', '#e8e8f0', '#e8e8f0', '#e8e8f0', '#e8e8f0', '#e8e8f0', '#e8e8f0', '#e8e8f0', '#e8e8f0', '#ff4040', '#ffd020', '#40d060', '#40a0ff', '#c060ff'], 0.04, SMALL);
  sta(logga, g, 0.02, 0.77, fram + 0.014);
  sta(textSkylt('TENKO', ['#4a2a80'], 0.045, SMALL), g, 0, 0.6, fram + 0.004);
  // styrkors, A och B, SELECT och START
  styrkors(g, 0.22, mat(0x18181c), -0.2, 0.4, fram + 0.03); g.children.slice(-2).forEach((k) => (k.rotation.x = Math.PI / 2));
  for (const [bx, by] of [[0.12, 0.36], [0.27, 0.44]]) { const b = rund(g, 0.06, 0.05, glans(0x7a7a8a), bx, by, fram + 0.02); b.rotation.x = Math.PI / 2; }
  for (const sx of [-0.08, 0.08]) staende(g, 0.11, 0.03, 0.03, mat(0x6a6a7a), sx, 0.17, fram + 0.005, 0.015, 0.008);
  // högtalarhålen nere till höger
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const p = rund(g, 0.011, 0.01, mat(0x18101e), 0.18 + i * 0.035 + j * 0.018, 0.12 + j * 0.035 - i * 0.008, fram + 0.0); p.rotation.x = Math.PI / 2; }
  // strömbrytaren på ovansidan
  kloss(g, 0.1, 0.03, 0.05, mat(0x3a3a44), -0.2, h + 0.01, 0);
  // baksidan: den gula fickmonsterkassetten sticker upp, batterilucka nertill
  staende(g, 0.57, 0.62, 0.08, mat(0xf0c818, { roughness: 0.5 }), 0, 0.92, -d / 2 - 0.02, 0.03, 0.01);
  const lapp = new T.Mesh(new T.PlaneGeometry(0.46, 0.414), new T.MeshStandardMaterial({ map: glimtEtikett('fickmonster', 1.0), roughness: 0.5 }));
  lapp.rotation.y = Math.PI; lapp.position.set(0, 1.24, -d / 2 - 0.061); g.add(lapp);
  staende(g, 0.5, 0.36, 0.02, tel.kropp ? kropp(tel, '#7a4ac0') : mat(0x6a3ab0, { roughness: 0.4 }), 0, 0.14, -d / 2 - 0.004, 0.03, 0.006);
  g.userData.tick = sk.tick;
  return g;
}

// ---------- pixelbilder 40×28 (tidslinjen) ----------
function saturnusPixel(x, X, Y) {
  skuggaPix(x, X + 1, Y + 25, 38);
  PR(x, X + 3, Y + 11, 34, 7, '#2e2e34'); PR(x, X + 1, Y + 18, 38, 7, '#1c1c20'); PR(x, X + 1, Y + 17, 38, 1, '#3a3a42'); PR(x, X + 1, Y + 24, 38, 1, '#0a0a0c');
  for (let j = -3; j <= 3; j++) { const w = Math.round(Math.sqrt(9.5 - j * j) * 3.4); PR(x, X + 15 - w, Y + 14 + j * 0.9, w * 2, 1, j < 0 ? '#3c3c44' : '#34343a'); }
  PR(x, X + 9, Y + 14, 12, 1, '#4a4a54');
  PR(x, X + 29, Y + 12, 5, 2, '#6a6a72'); PR(x, X + 29, Y + 15, 2, 2, '#6a6a72'); PR(x, X + 33, Y + 15, 2, 2, '#6a6a72'); PR(x, X + 32, Y + 12, 1, 1, '#40ff60');
  PR(x, X + 6, Y + 19, 18, 1, '#8aa4e0'); PR(x, X + 5, Y + 21, 5, 2, '#0e0e10'); PR(x, X + 12, Y + 21, 5, 2, '#0e0e10');
}
function gbcPixel(x, X, Y) {
  skuggaPix(x, X + 13, Y + 26, 16);
  PR(x, X + 14, Y + 1, 13, 23, '#8a5ad8'); PR(x, X + 15, Y + 24, 11, 1, '#8a5ad8'); PR(x, X + 14, Y + 1, 13, 1, '#b48af0'); PR(x, X + 26, Y + 2, 1, 22, '#6a3ab0');
  PR(x, X + 15, Y + 3, 11, 10, '#2a2a34'); PR(x, X + 16, Y + 4, 9, 7, '#98d870'); PR(x, X + 18, Y + 6, 2, 2, '#f0d020'); PR(x, X + 21, Y + 7, 2, 2, '#e04040');
  PR(x, X + 17, Y + 12, 1, 1, '#ff4040'); PR(x, X + 19, Y + 12, 1, 1, '#ffd020'); PR(x, X + 21, Y + 12, 1, 1, '#40d060'); PR(x, X + 23, Y + 12, 1, 1, '#40a0ff');
  PR(x, X + 15, Y + 17, 3, 1, '#18181c'); PR(x, X + 16, Y + 16, 1, 3, '#18181c'); PR(x, X + 21, Y + 17, 2, 2, '#7a7a8a'); PR(x, X + 24, Y + 16, 2, 2, '#7a7a8a');
  PR(x, X + 18, Y + 21, 2, 1, '#5a3a90'); PR(x, X + 21, Y + 21, 2, 1, '#5a3a90'); PR(x, X + 16, Y, 9, 1, '#f0c818');
}

export const KONSOLER = [
  { id: 'konsol-snes', namn: 'SUPER TENKO', forebild: 'Super Nintendo (Super Famicom)', ar: 1992, glimt: 'marcokart', bygg: snes, oppna: ['KASSETTEN', 0],
    info: 'Ljusgrå och rundad med fyrfärgsloggan. Kassetten trycks ner i facket och handkontrollen har fyra färgade knappar och axelknappar.',
    pixel: (x, X, Y) => PIX.snes.rita(x, X, Y) },
  { id: 'konsol-saturnus', namn: 'TORA ORBIT', forebild: 'Sega Saturn', ar: 1995, glimt: 'segorally', bygg: saturnus, oppna: ['SKIVLUCKAN', 0],
    info: 'Svart låda med en oval skivlucka ovanpå. Handkontrollen har sex knappar i två bågar.',
    pixel: saturnusPixel },
  { id: 'konsol-n64', namn: 'TENKO 64', forebild: 'Nintendo 64', ar: 1997, glimt: 'marco64', bygg: n64, oppna: ['KASSETTEN', 0],
    info: 'Mörkgrå med kassettfack i mitten och fyra portar fram. Handkontrollen har tre handtag och en analog spak i mitten.',
    pixel: (x, X, Y) => PIX.n64.rita(x, X, Y) },
  { id: 'konsol-gbc', namn: 'TENKO POCKET COLOR', forebild: 'Game Boy Color', ar: 1998, glimt: 'fickmonster', bygg: gbc, oppna: null,
    info: 'Mindre än Game Boj och i genomskinlig lila plast. Nu med färgskärm, där spelet syns live.',
    pixel: gbcPixel },
];
