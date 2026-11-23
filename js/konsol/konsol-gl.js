// Spelkonsolerna i riktig 3D – samma studio, ljus och kamera som telefonerna (js/telefon/telefon-gl.js).
// Nio former från 1982 till nästa generation, var och en med sin handkontroll bredvid. Registreras i BYGGARE så att
// skapaTelefonGL/byggEnhet visar dem med tel.enhet = 'konsol-…'. Modellenhet 1 = 10 cm.
//   tel.kropp (färg, valfri – annars formens originalfärg), tel.yta (klassisk|matt|kolfiber|borstad)
//   satt(o): luckor och delar som öppnas (kassettluckan, skivluckan, sidokontrollerna)
//   tick(t): levande skärmar visar spelglimtar (fickkonsolen och hybriden)
import { BYGGARE } from '../telefon/telefon-gl.js';
import { TH, mat, glans, lyser, skugg, platta, staende, kloss, rund, kabel, styrkors, glimtSkarm, glimtEtikett, kropp, joystick, nesKontroll, grepp, roundedBox, rektHorn, klamp01 } from './gl-verktyg.js';
import { KONSOLER as M_A } from './modeller/a.js';
import { KONSOLER as M_B } from './modeller/b.js';
import { KONSOLER as M_C } from './modeller/c.js';
import { KONSOLER as M_D } from './modeller/d.js';
import { KONSOLER as M_E } from './modeller/e.js';
import { KONSOLER as M_F } from './modeller/f.js';

// ---------- 1982 HEMDATOR (brödlådan) ----------
function hemdator(tel) {
  const T = TH(), g = new T.Group(), W = 4.0, m = kropp(tel, '#c8b48a');
  const s = new T.Shape();
  s.moveTo(-1.1, 0); s.lineTo(1.1, 0); s.lineTo(1.1, 0.24); s.quadraticCurveTo(1.1, 0.31, 1.0, 0.32);
  s.lineTo(-0.55, 0.7); s.quadraticCurveTo(-0.66, 0.73, -0.78, 0.73); s.lineTo(-1.04, 0.73); s.quadraticCurveTo(-1.1, 0.73, -1.1, 0.67); s.closePath();
  const geo = new T.ExtrudeGeometry(s, { depth: W - 0.06, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 12 });
  geo.translate(0, 0, -(W - 0.06) / 2); geo.computeVertexNormals();
  const lada = skugg(new T.Mesh(geo, m)); lada.rotation.y = -Math.PI / 2; lada.position.y = 0.03; g.add(lada);
  // tangenterna längs lutningen
  const A = [1.0, 0.35], B = [-0.55, 0.73], L = Math.hypot(B[0] - A[0], B[1] - A[1]), alfa = Math.atan2(B[1] - A[1], A[0] - B[0]);
  const pa = (f) => [A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f + 0.035];
  const tm = mat(0x4b3b30, { roughness: 0.55, clearcoat: 0.1 }), fm = mat(0xc89040, { roughness: 0.5 });
  const tangent = (x, f, w, mm) => { const [z, y] = pa(f), k = kloss(g, w, 0.07, 0.15, mm, x, y, z); k.rotation.x = alfa; };
  for (let r = 0; r < 4; r++) { const f = 0.26 + r * (0.17 / L) * 1.25; for (let i = 0; i < 15; i++) tangent(-1.62 + i * 0.2 + (r % 2) * 0.06, f, 0.16, tm); tangent(1.62, f, 0.24, fm); }
  tangent(-0.3, 0.12, 1.3, tm);
  // märkesskylt och strömlampa
  kloss(g, 0.7, 0.02, 0.16, mat(0x2a2420), 1.3, 0.8, -0.88); kloss(g, 0.5, 0.025, 0.025, lyser(0xd83030, 0.4), 1.3, 0.815, -0.9); kloss(g, 0.5, 0.025, 0.025, lyser(0x3060d8, 0.4), 1.3, 0.815, -0.85);
  kloss(g, 0.08, 0.03, 0.04, lyser(0xff3020, 2), 1.55, 0.4, 0.8);
  joystick(g, 2.75, 0.55);
  kabel(g, [[2.75, 0.05, 0.25], [2.6, 0.03, -0.4], [2.2, 0.03, -1.0], [1.95, 0.3, -1.12]], mat(0x101012), 0.022);
  return g;
}

// ---------- 1985 LÅDAN (kassettkonsolen) ----------
function lada(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#c8c8c4'), mork = mat(0x2a2a2c), band = mat(0x58585a);
  const W = 2.55, D = 2.0;
  platta(g, W, D, 0.62, m, 0, 0, 0, 0.05, 0.015);
  kloss(g, W - 0.02, 0.2, 0.02, band, 0, 0.5, D / 2);              // mörkt band upptill på framsidan
  kloss(g, W - 0.02, 0.3, 0.02, mork, 0, 0.16, D / 2);             // svart nederdel
  for (const kx of [-0.75, -0.35]) kloss(g, 0.3, 0.14, 0.04, mat(0xb8b8b4), kx, 0.17, D / 2 + 0.01);   // handkontrollsportar
  kloss(g, 0.22, 0.08, 0.04, mat(0x9a9a96), 0.55, 0.42, D / 2 + 0.005); kloss(g, 0.22, 0.08, 0.04, mat(0x9a9a96), 0.85, 0.42, D / 2 + 0.005);
  kloss(g, 0.06, 0.04, 0.03, lyser(0xff2020, 2), 0.35, 0.42, D / 2 + 0.01);
  kloss(g, 0.18, 0.02, 0.08, mat(0xd82020), 1.0, 0.2, D / 2 + 0.01);  // märket
  // luckan uppe fram (gångjärn bak på luckan) och kassetten
  const lucka = new T.Group(); lucka.position.set(0, 0.62, D / 2 - 0.82); g.add(lucka);
  platta(lucka, 1.6, 0.8, 0.05, mat(0xb4b4b0), 0, 0, 0.4, 0.03, 0.01);
  for (let i = 0; i < 6; i++) kloss(lucka, 1.5, 0.012, 0.02, mat(0x9a9a96), 0, 0.055, 0.12 + i * 0.1);
  const kass = new T.Group(); g.add(kass);
  staende(kass, 1.2, 1.32, 0.16, mat(0x8a8a8c, { roughness: 0.6 }), 0, 0, 0, 0.04, 0.012);
  for (let i = 0; i < 5; i++) kloss(kass, 1.1, 0.03, 0.03, mat(0x6a6a6c), 0, 0.08 + i * 0.07, 0.085);
  const etikett = new T.Mesh(new T.PlaneGeometry(0.96, 0.72), new T.MeshStandardMaterial({ map: glimtEtikett('marco'), roughness: 0.5 })); etikett.position.set(0, 0.84, 0.081); kass.add(etikett);
  nesKontroll(g, 1.85, 1.75, -0.35);
  kabel(g, [[1.6, 0.07, 1.6], [1.2, 0.03, 1.4], [-0.3, 0.03, 1.25], [-0.75, 0.17, 1.02]], mat(0x2a2a2c), 0.02);
  g.userData.satt = (o = 0) => {
    o = klamp01(o);
    lucka.rotation.x = -o * 1.4;
    // kassetten: står på golvet bredvid → glider ner i facket framför den uppfällda luckan
    const p = Math.max(0, (o - 0.35) / 0.65);
    kass.position.set(-1.9 + p * 1.9, p * 0.1, 0.6 + p * 0.02); kass.rotation.y = 0.5 * (1 - p);
  };
  return g;
}

// ---------- 1989 FICKKONSOLEN ----------
function ficka(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#c8c8c0'), w = 0.9, h = 1.48, d = 0.32;
  staende(g, w, h, d, m, 0, 0, 0, 0.05, 0.03, [0.05, 0.22, 0.05, 0.05]);   // runt nedre högra hörnet
  const fram = d / 2 + 0.001;
  staende(g, 0.78, 0.66, 0.02, mat(0x5a5a6a, { roughness: 0.35 }), 0, 0.72, fram, 0.03, 0.006, [0.03, 0.12, 0.03, 0.03]);
  const sk = glimtSkarm('tetrix', 0.47, 0.42); sk.me.position.set(0.04, 1.05, fram + 0.012); g.add(sk.me);
  kloss(g, 0.03, 0.03, 0.02, lyser(0xff2030, 2), -0.31, 1.12, fram + 0.012);
  styrkors(g, 0.24, mat(0x18181c), -0.22, 0.48, fram + 0.03); g.children.slice(-2).forEach((k) => (k.rotation.x = Math.PI / 2));
  for (const [bx, by] of [[0.16, 0.44], [0.32, 0.52]]) { const b = rund(g, 0.065, 0.05, glans(0xa0205a), bx, by, fram + 0.02); b.rotation.x = Math.PI / 2; }
  for (const sx of [-0.1, 0.06]) { const p = kloss(g, 0.12, 0.03, 0.02, mat(0x8a8a8a), sx, 0.24, fram + 0.012); p.rotation.z = 0.45; }
  for (let i = 0; i < 6; i++) { const r = kloss(g, 0.02, 0.2, 0.012, mat(0x7a7a72), 0.18 + i * 0.045, 0.14, fram + 0.004); r.rotation.z = 0.5; }
  // baksidan: spelkassetten sticker upp i facket, batterilucka nertill
  staende(g, 0.6, 0.62, 0.08, mat(0x8a8a8c, { roughness: 0.6 }), 0, 1.0, -d / 2 + 0.02, 0.03, 0.01);
  const lapp = new T.Mesh(new T.PlaneGeometry(0.5, 0.36), new T.MeshStandardMaterial({ map: glimtEtikett('tetrix'), roughness: 0.5 }));
  lapp.rotation.y = Math.PI; lapp.position.set(0, 1.3, -d / 2 - 0.021); g.add(lapp);
  staende(g, 0.56, 0.4, 0.02, mat(0xb4b4ac), 0, 0.18, -d / 2 - 0.004, 0.03, 0.006);
  g.userData.tick = sk.tick;
  return g;
}

// ---------- 1995 SKIVKONSOLEN ----------
function skiva(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#c4c4cc'), W = 2.7, D = 1.9, H = 0.5;
  platta(g, W, D, H, m, 0, 0, 0, 0.12, 0.03);
  rund(g, 0.67, 0.03, mat(0xb0b0ba), -0.4, H + 0.015, -0.05, 48);   // fördjupningen runt luckan
  const lucka = new T.Group(); lucka.position.set(-0.4, H + 0.03, -0.69); g.add(lucka);
  rund(lucka, 0.62, 0.05, m, 0, 0.025, 0.64, 48); rund(lucka, 0.5, 0.012, mat(0xb8b8c2), 0, 0.055, 0.64, 48);
  // skivan i facket (glänser i regnbågens färger)
  const skivM = new T.MeshPhysicalMaterial({ color: 0xd8dce4, metalness: 0.9, roughness: 0.12, iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [200, 600] });
  rund(g, 0.55, 0.012, skivM, -0.4, H - 0.02, -0.05, 48); rund(g, 0.09, 0.016, mat(0x9a9aa4), -0.4, H - 0.018, -0.05, 24);
  for (const [bx, f] of [[0.75, 0x8a8a94], [1.0, 0x8a8a94], [1.0, 0x8a8a94]].slice(0, 2)) rund(g, 0.09, 0.05, mat(f), bx, H + 0.02, -0.5);
  rund(g, 0.12, 0.05, mat(0x9a9aa6), 0.85, H + 0.02, 0.3);
  kloss(g, 0.08, 0.04, 0.02, lyser(0x40ff60, 1.5), 1.15, H + 0.02, 0.3);
  for (const kx of [-0.9, 0.3]) kloss(g, 0.5, 0.12, 0.03, mat(0x7a7a84), kx, 0.24, D / 2 + 0.005);
  for (const [i, c] of [0xe02020, 0xf0c000, 0x2060d0, 0x20a040].entries()) kloss(g, 0.06, 0.06, 0.01, lyser(c, 0.5), 0.95 + (i % 2) * 0.08, 0.25 + Math.floor(i / 2) * 0.08, D / 2 + 0.01);
  grepp(g, 1.95, 1.55, -0.4, {});
  kabel(g, [[1.6, 0.12, 1.32], [1.1, 0.03, 1.2], [0.5, 0.03, 1.05], [0.3, 0.24, 0.96]], mat(0x9a9aa4), 0.022);
  g.userData.satt = (o = 0) => { lucka.rotation.x = -klamp01(o) * 1.3; };
  return g;
}

// ---------- 2000 TORNET (svart, stående) ----------
function torn00(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#22222a'), W = 0.78, H = 3.0, D = 1.8;
  platta(g, 1.0, 1.0, 0.06, mat(0x18181c), 0, 0, 0, 0.1, 0.02);
  staende(g, W, H, D, m, 0, 0.06, 0, 0.04, 0.015);
  for (let i = 0; i < 14; i++) kloss(g, W + 0.02, 0.05, D * 0.62, mat(0x16161c), 0, 0.3 + i * 0.12, -D * 0.19);   // ränderna
  kloss(g, 0.02, H * 0.86, 0.05, mat(0x3a3a46), W / 2 + 0.01, 0.06 + H / 2, D / 2 - 0.1);   // skivluckans spår
  kloss(g, 0.03, 0.14, 0.14, lyser(0x2060ff, 1.2), W / 2 + 0.01, 2.65, 0.55);
  kloss(g, 0.03, 0.05, 0.05, lyser(0x40ff60, 2), W / 2 + 0.01, 0.4, 0.75);
  grepp(g, 1.55, 1.1, -0.3, { kropp: 0x1c1c22, spakar: true, knappar: [0x40c080, 0xe04050, 0x5070e0, 0xe070c0] });
  kabel(g, [[1.3, 0.12, 0.88], [0.9, 0.03, 0.9], [0.5, 0.03, 0.95], [0.4, 0.3, 0.9]], mat(0x18181c), 0.022);
  return g;
}

// ---------- 2006 DEN SMALA (vit med rörelsekontroll) ----------
function smal(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#f2f2f4'), W = 0.44, H = 1.6, D = 2.1;
  platta(g, 0.9, 1.0, 0.05, mat(0xe0e0e4), 0, 0, 0, 0.3, 0.02);
  staende(g, W, H, D, m, 0, 0.05, 0, 0.05, 0.03);
  kloss(g, 0.05, H * 0.82, 0.02, mat(0x1a1a20), 0, 0.05 + H / 2, D / 2 + 0.002);
  kloss(g, 0.02, H * 0.8, 0.02, lyser(0x60b0ff, 1.6), 0, 0.05 + H / 2, D / 2 + 0.012);
  kloss(g, 0.12, 0.06, 0.02, mat(0xd0d0d4), 0, 0.16, D / 2 + 0.008);
  // rörelsekontrollen ligger framför
  const k = new T.Group(); k.position.set(1.0, 0, 0.9); k.rotation.y = 0.35; g.add(k);
  platta(k, 0.36, 1.45, 0.3, m, 0, 0, 0, 0.12, 0.05);
  styrkors(k, 0.13, mat(0x8a8a90), 0, 0.31, -0.48);
  rund(k, 0.075, 0.03, glans(0xf8f8fa), 0, 0.31, -0.24);
  for (const dz of [0.02, 0.12]) rund(k, 0.03, 0.02, mat(0xc0c0c4), 0, 0.31, dz);
  for (let i = 0; i < 4; i++) kloss(k, 0.035, 0.012, 0.02, lyser(i === 0 ? 0x3080ff : 0x1a2a50, i === 0 ? 2 : 0.2), -0.09 + i * 0.06, 0.31, 0.6);
  kloss(k, 0.24, 0.12, 0.02, mat(0x101014), 0, 0.15, -0.73);
  return g;
}

// ---------- 2017 HYBRIDEN (skärm med lösa sidokontroller) ----------
function hybrid(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#2a2a2e');
  const rig = new T.Group(); rig.position.set(0, 0.04, 0); rig.rotation.x = -0.26; g.add(rig);   // lutar på stödet
  const W = 1.73, H = 1.02, d = 0.14;
  staende(rig, W, H, d, m, 0, 0, 0, 0.06, 0.02);
  const sk = glimtSkarm('fortnajt', 1.5, 0.844); sk.me.position.set(0, H / 2, d / 2 + 0.002); rig.add(sk.me);
  kloss(g, 0.5, 0.04, 0.3, mat(0x1a1a1e), 0, 0.02, -0.1);
  const sida = (s, farg) => {
    const k = new T.Group(); rig.add(k);
    const jm = glans(farg, { roughness: 0.3 });
    staende(k, 0.36, H, d, jm, 0, 0, 0, 0.17, 0.02, s < 0 ? [0.17, 0.02, 0.02, 0.17] : [0.02, 0.17, 0.17, 0.02]);
    const spak = rund(k, 0.075, 0.08, mat(0x202024), 0, s < 0 ? 0.72 : 0.38, d / 2 + 0.04); spak.rotation.x = Math.PI / 2;
    const yta = rund(k, 0.065, 0.02, mat(0x2a2a30, { roughness: 0.8 }), 0, s < 0 ? 0.72 : 0.38, d / 2 + 0.085); yta.rotation.x = Math.PI / 2;
    for (const [bx, by] of [[0, 0.11], [0.11, 0], [0, -0.11], [-0.11, 0]]) { const b = rund(k, 0.04, 0.03, mat(0x202024), bx, (s < 0 ? 0.38 : 0.72) + by, d / 2 + 0.02); b.rotation.x = Math.PI / 2; }
    kloss(k, 0.07, 0.02, 0.02, mat(0x202024), s * -0.06, 0.92, d / 2 + 0.01);
    return k;
  };
  const vs = sida(-1, 0x00b4e6), hs = sida(1, 0xff3c3c);
  g.userData.tick = sk.tick;
  g.userData.satt = (o = 0) => { o = klamp01(o); vs.position.set(-W / 2 - 0.18 - o * 0.45, o * 0.08, 0); hs.position.set(W / 2 + 0.18 + o * 0.45, o * 0.08, 0); vs.rotation.z = o * 0.15; hs.rotation.z = -o * 0.15; };
  return g;
}

// ---------- 2020 TORNET (vita vingar runt svart kärna) ----------
function torn20(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#f4f4f6'), H = 3.9, D = 2.6;
  platta(g, 1.4, 1.2, 0.05, mat(0x141418), 0, 0, 0, 0.5, 0.02);
  staende(g, 0.56, H - 0.2, D - 0.3, mat(0x141418, { roughness: 0.35, clearcoat: 1 }), 0, 0.15, 0, 0.05, 0.02);
  // vingarna: svängd profil sedd från sidan, något utåtböjda
  const s = new T.Shape(); s.moveTo(-D / 2, 0); s.lineTo(D / 2 - 0.1, 0); s.quadraticCurveTo(D / 2 + 0.12, H * 0.5, D / 2 + 0.05, H); s.lineTo(-D / 2 + 0.25, H); s.quadraticCurveTo(-D / 2 - 0.08, H * 0.5, -D / 2, 0);
  for (const sx of [-1, 1]) {
    const geo = new T.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 3, curveSegments: 20 }); geo.computeVertexNormals();
    const v = skugg(new T.Mesh(geo, m)); v.rotation.y = -Math.PI / 2; v.position.set(sx * 0.3 + (sx > 0 ? 0.1 : 0), 0.1, 0); v.rotation.z = sx * 0.03; g.add(v);
    kloss(g, 0.02, H * 0.9, 0.02, lyser(0x4a8af0, 2.2), sx * 0.29, 0.1 + H * 0.47, D / 2 - 0.2);
  }
  grepp(g, 2.0, 1.4, -0.35, { kropp: 0xf4f4f6, mitt: 0x18181c, spakar: true, pekyta: 0x18181c, knappar: [0xb0b0b8, 0xb0b0b8, 0xb0b0b8, 0xb0b0b8], ljus: 0x4a8af0 });
  return g;
}

// ---------- 2026 NÄSTA GENERATION ----------
function nasta(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#2a2838'), W = 2.9, D = 2.1;
  const s = new T.Shape(); s.moveTo(-D / 2, 0); s.lineTo(D / 2, 0); s.lineTo(D / 2 - 0.12, 0.42); s.lineTo(-D / 2 + 0.5, 0.62); s.lineTo(-D / 2, 0.62); s.closePath();
  const geo = new T.ExtrudeGeometry(s, { depth: W, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 }); geo.translate(0, 0, -W / 2); geo.computeVertexNormals();
  const k = skugg(new T.Mesh(geo, m)); k.rotation.y = -Math.PI / 2; k.position.y = 0.03; g.add(k);
  kloss(g, W - 0.2, 0.025, 0.025, lyser(0x8a6aff, 2.5), 0, 0.3, D / 2 - 0.04);
  for (let i = 0; i < 9; i++) kloss(g, 0.02, 0.012, 0.9, mat(0x1c1a28), -1.2 + i * 0.3, 0.69, -0.45);
  const ring = new T.Mesh(new T.TorusGeometry(0.14, 0.02, 10, 40), lyser(0xb48cff, 1.6)); ring.rotation.x = -Math.PI / 2 + 0.3; ring.position.set(1.1, 0.56, 0.1); g.add(ring);
  grepp(g, 2.15, 1.45, -0.35, { kropp: 0x2a2838, mitt: 0x1a1824, spakar: true, pekyta: 0x14121c, knappar: [0x8a6aff, 0x8a6aff, 0x8a6aff, 0x8a6aff], ljus: 0x8a6aff });
  return g;
}

// Alla konsoler i årsordning. Varje post: { id, namn (parodi), forebild, ar, glimt (spelet som hör till),
// oppna: [reglagets namn, standardläge] | null, info, bygg(tel) → THREE.Group, pixel?(ctx, X, Y) 40×28 för tidslinjen }
const BAS = [
  { id: 'konsol-hemdator', namn: 'KOMMODOR 64', ar: 1982, forebild: 'Commodore 64', glimt: 'pac', bygg: hemdator, oppna: null, info: 'Brödlådan: tangentbordet sitter i lådan och joysticken står bredvid. Spelen kommer på modul eller disk.' },
  { id: 'konsol-lada', namn: 'NINTENTO NES', ar: 1986, forebild: 'Nintendo Entertainment System', glimt: 'marco', bygg: lada, oppna: ['KASSETTEN', 0], info: 'Luckan fram fälls upp och kassetten trycks ner. Handkontroll med styrkors och två röda knappar.' },
  { id: 'konsol-ficka', namn: 'GAME BOJ', ar: 1989, forebild: 'Game Boy', glimt: 'tetrix', bygg: ficka, oppna: null, info: 'Grön skärm, styrkors och två knappar. Spelet syns live på skärmen och kassetten sticker upp där bak.' },
  { id: 'konsol-skiva', namn: 'PLAY STATIO', ar: 1995, forebild: 'PlayStation', glimt: 'crash', bygg: skiva, oppna: ['SKIVLUCKAN', 0], info: 'Spelen på CD under den runda luckan. Handkontroll med grepp och fyra symbolknappar.' },
  { id: 'konsol-torn00', namn: 'PLAY STATIO 2', ar: 2000, forebild: 'PlayStation 2', glimt: 'gtasa', bygg: torn00, oppna: null, info: 'Svart och stående med ränder. DVD, och två analoga spakar på handkontrollen.' },
  { id: 'konsol-smal', namn: 'NINTENTO VI', ar: 2006, forebild: 'Wii', glimt: 'visport', bygg: smal, oppna: null, info: 'Vit och smal med blått sken i skivfacket. Rörelsekontroll man svingar.' },
  { id: 'konsol-hybrid', namn: 'NINTENTO SVITSCH', ar: 2017, forebild: 'Nintendo Switch', glimt: 'fortnajt', bygg: hybrid, oppna: ['SIDOKONTROLLERNA', 0], info: 'Skärm med lösa sidokontroller. Spelet syns live på skärmen.' },
  { id: 'konsol-torn20', namn: 'PLAY STATIO 5', ar: 2020, forebild: 'PlayStation 5', glimt: 'astrobotten', bygg: torn20, oppna: null, info: 'Vita vingar runt en svart kärna och blått ljus. SSD och strålspårning.' },
  { id: 'konsol-nasta', namn: 'PLAY STATIO 6', ar: 2026, forebild: 'PlayStation 6 (ryktas)', glimt: 'gta6', bygg: nasta, oppna: null, info: 'Låg kil med lila ljuslist. En gissning på hur nästa generation ser ut.' },
];
export const KONSOLFORMER = [...BAS, ...M_A, ...M_B, ...M_C, ...M_D, ...M_E, ...M_F].sort((a, b) => a.ar - b.ar || a.namn.localeCompare(b.namn));
for (const f of KONSOLFORMER) BYGGARE[f.id] = f.bygg;
