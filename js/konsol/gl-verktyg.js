// 3D-verktyg för konsolerna (js/konsol/konsol-gl.js och js/konsol/modeller/*.js). Modellenhet 1 = 10 cm.
// Liggande delar: platta(g, bredd, djup, höjd, material, x, y(botten), z). Stående: staende(g, bredd, höjd, djup, …).
// Handkontroller: joystick, nesKontroll, grepp(g, x, z, rot, { kropp, mitt, spakar, pekyta, knappar, ljus }).
// Levande skärm: glimtSkarm(glimtId, w, h) → { me, tick }. Etikett: glimtEtikett(glimtId). Kroppens material: kropp(tel, standardfärg).
import { roundedBox, rektHorn, roundedRect, kroppMaterial, klamp01, lysande, skarmYta } from '../telefon/telefon-gl.js';
import { glimtBild } from './glimtar.js';
export { roundedBox, rektHorn, roundedRect, kroppMaterial, klamp01, lysande, skarmYta };

export const TH = () => window.THREE;
export const mat = (color, o = {}) => new (TH().MeshPhysicalMaterial)({ color, roughness: 0.45, metalness: 0.05, clearcoat: 0.3, clearcoatRoughness: 0.4, ...o });
export const glans = (color, o = {}) => mat(color, { roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.06, ...o });
export const lyser = (color, styrka = 1.4) => new (TH().MeshStandardMaterial)({ color, emissive: color, emissiveIntensity: styrka });
export const skugg = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
// liggande låda: w bred (x), djup (z), hojd (y); botten på y, mitt på (x, z). Rundade hörn sett uppifrån.
export function platta(g, w, djup, hojd, m, x, y, z, r = 0.06, bev = 0.02, horn = null) {
  const T = TH(), me = skugg(new T.Mesh(roundedBox(w, djup, hojd, r, bev, 3, horn), m));
  me.rotation.x = -Math.PI / 2; me.position.set(x, y + hojd / 2, z); g.add(me); return me;
}
// stående låda: w bred (x), hojd (y), djup (z); botten på y. Rundade hörn sett framifrån.
export function staende(g, w, hojd, djup, m, x, y, z, r = 0.06, bev = 0.02, horn = null) {
  const T = TH(), me = skugg(new T.Mesh(roundedBox(w, hojd, djup, r, bev, 3, horn), m));
  me.position.set(x, y + hojd / 2, z); g.add(me); return me;
}
export const kloss = (g, w, h, d, m, x, y, z) => { const T = TH(), me = skugg(new T.Mesh(new T.BoxGeometry(w, h, d), m)); me.position.set(x, y, z); g.add(me); return me; };
export const rund = (g, r, h, m, x, y, z, seg = 24) => { const T = TH(), me = skugg(new T.Mesh(new T.CylinderGeometry(r, r, h, seg), m)); me.position.set(x, y, z); g.add(me); return me; };
export function kabel(g, punkter, m, r = 0.025) {
  const T = TH(), k = new T.CatmullRomCurve3(punkter.map(([x, y, z]) => new T.Vector3(x, y, z)));
  const me = skugg(new T.Mesh(new T.TubeGeometry(k, 48, r, 8, false), m)); g.add(me); return me;
}
// styrkors: två korslagda klossar
export function styrkors(g, s, m, x, y, z) { kloss(g, s, 0.05, s * 0.34, m, x, y, z); kloss(g, s * 0.34, 0.05, s, m, x, y, z); }
// levande skärm med en spelglimt (förstoras med skarpa pixlar)
export function glimtSkarm(id, w, h) {
  const T = TH(), duk = glimtBild(id, 1.2), tex = new T.CanvasTexture(duk);
  tex.magFilter = T.NearestFilter; tex.minFilter = T.LinearFilter; tex.colorSpace = T.SRGBColorSpace; tex.generateMipmaps = false;
  const me = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.75, roughness: 0.3 }));
  return { me, tick: (t) => { glimtBild(id, t); tex.needsUpdate = true; } };
}
// stillbild av en glimt (etiketter på kassetter och kartonger)
export function glimtEtikett(id, t = 1.2) {
  const T = TH(), src = glimtBild(id, t), c = document.createElement('canvas'); c.width = src.width; c.height = src.height; c.getContext('2d').drawImage(src, 0, 0);
  const tex = new T.CanvasTexture(c); tex.magFilter = T.NearestFilter; tex.colorSpace = T.SRGBColorSpace; return tex;
}
export const kropp = (tel, standard) => kroppMaterial({ kropp: tel.kropp || standard, yta: tel.yta || 'klassisk' });

// ---------- handkontroller (liggande, botten på y = 0) ----------
export function joystick(g, x, z) {
  const svart = mat(0x18181c, { roughness: 0.6 });
  platta(g, 0.62, 0.62, 0.2, svart, x, 0, z, 0.08, 0.03);
  rund(g, 0.07, 0.06, glans(0xd02020), x - 0.19, 0.23, z - 0.19);
  const T = TH(), bal = skugg(new T.Mesh(new T.ConeGeometry(0.1, 0.12, 20), mat(0x101012, { roughness: 0.8 }))); bal.position.set(x, 0.26, z); g.add(bal);
  rund(g, 0.035, 0.42, mat(0x101012), x, 0.45, z, 12);
  const knopp = skugg(new T.Mesh(new T.SphereGeometry(0.065, 16, 12), glans(0x18181c))); knopp.position.set(x, 0.67, z); g.add(knopp);
}
export function nesKontroll(g, x, z, rot = 0) {
  const T = TH(), k = new T.Group(); k.position.set(x, 0, z); k.rotation.y = rot; g.add(k);
  platta(k, 1.2, 0.5, 0.14, mat(0xc8c8c4), 0, 0, 0, 0.04, 0.015);
  platta(k, 1.02, 0.36, 0.02, mat(0x202022), 0, 0.14, 0, 0.02, 0.005);
  styrkors(k, 0.2, mat(0x101010), -0.34, 0.18, 0.02);
  rund(k, 0.055, 0.04, glans(0xd02020), 0.3, 0.18, 0.04); rund(k, 0.055, 0.04, glans(0xd02020), 0.44, 0.18, 0.04);
  kloss(k, 0.09, 0.02, 0.035, mat(0x101010), -0.04, 0.17, 0.06); kloss(k, 0.09, 0.02, 0.035, mat(0x101010), 0.08, 0.17, 0.06);
  return k;
}
// PS-liknande handkontroll med grepp; typ: { kropp, knappar, spakar, pekyta, mitt }
export function grepp(g, x, z, rot, o = {}) {
  const T = TH(), k = new T.Group(); k.position.set(x, 0, z); k.rotation.y = rot; g.add(k);
  const bm = mat(o.kropp ?? 0xb8b8c0, { roughness: 0.5 }), mm = o.mitt != null ? mat(o.mitt) : bm;
  platta(k, 1.36, 0.56, 0.2, mm, 0, 0, -0.02, 0.18, 0.06);
  for (const s of [-1, 1]) {
    const gr = skugg(new T.Mesh(new T.CapsuleGeometry(0.16, 0.36, 6, 16), bm));
    gr.rotation.x = Math.PI / 2 - 0.15; gr.rotation.z = s * 0.38; gr.position.set(s * 0.5, 0.15, 0.28); gr.scale.set(1, 1, 0.75); k.add(gr);
  }
  styrkors(k, 0.24, mat(0x2a2a30), -0.42, 0.22, -0.04);
  const symb = o.knappar || [0x40c080, 0xe04050, 0x5070e0, 0xe070c0];
  [[0, -0.12], [0.11, -0.01], [0, 0.1], [-0.11, -0.01]].forEach(([dx, dz], i) => { rund(k, 0.05, 0.05, mat(0x2a2a30), 0.42 + dx, 0.21, -0.03 + dz); rund(k, 0.028, 0.012, lyser(symb[i], 0.3), 0.42 + dx, 0.24, -0.03 + dz, 12); });
  if (o.spakar) for (const s of [-1, 1]) { rund(k, 0.07, 0.06, mat(0x18181c), s * 0.2, 0.22, 0.14); rund(k, 0.085, 0.03, mat(0x26262c, { roughness: 0.8 }), s * 0.2, 0.27, 0.14); }
  if (o.pekyta) platta(k, 0.42, 0.24, 0.02, glans(o.pekyta), 0, 0.2, -0.1, 0.05, 0.008);
  if (o.ljus) kloss(k, 0.4, 0.012, 0.02, lyser(o.ljus, 2), 0, 0.21, -0.29);
  return k;
}

