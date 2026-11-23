// Konsoler i 3D, grupp E: X-LÅDA ETT (Xbox One), META KVEST (Quest 2) och X-LÅDA SERIE X (Xbox Series X).
// Samma format som KONSOLFORMER i ../konsol-gl.js. Verktygen finns i ../gl-verktyg.js. Modellenhet 1 = 10 cm.
import * as V from '../gl-verktyg.js';
const { TH, mat, glans, lyser, skugg, platta, staende, kloss, rund, styrkors, glimtSkarm, glimtEtikett, kropp, kroppMaterial, roundedRect, klamp01 } = V;

// matt kropp: "klassisk" betyder konsolens egen yta (matt svart); väljer spelaren en annan yta gäller den
const mattKropp = (tel, standard) => kroppMaterial({ kropp: tel.kropp || standard, yta: !tel.yta || tel.yta === 'klassisk' ? 'matt' : tel.yta });

// ---------- texturer ----------
// X-lådans märke: vitt klot där ett X med svängda armar skär igenom (lyser när konsolen är på)
function xLogo() {
  const T = TH(), c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#ffffff'; x.beginPath(); x.arc(64, 64, 60, 0, Math.PI * 2); x.fill();
  x.globalCompositeOperation = 'destination-out';
  // X:et: smalt i mitten och lite bredare ut mot kanten, armarna svagt svängda
  for (let k = 0; k < 4; k++) {
    const v = Math.PI / 4 + (k * Math.PI) / 2, p = (a, r) => [64 + Math.cos(a) * r, 64 + Math.sin(a) * r];
    x.beginPath(); x.moveTo(...p(v - 0.5, 8)); x.quadraticCurveTo(...p(v - 0.12, 40), ...p(v - 0.17, 70));
    x.lineTo(...p(v + 0.17, 70)); x.quadraticCurveTo(...p(v + 0.12, 40), ...p(v + 0.5, 8)); x.fill();
  }
  x.beginPath(); x.arc(64, 64, 9, 0, Math.PI * 2); x.fill();
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
}
const logoMat = (styrka = 1.1) => { const tx = xLogo(); return new (TH().MeshStandardMaterial)({ map: tx, emissive: 0xffffff, emissiveMap: tx, emissiveIntensity: styrka, transparent: true, roughness: 0.3 }); };
// märket som en platta: normal = riktningen den vetter åt ('fram', 'upp')
function marke(g, s, x, y, z, vetter = 'fram', styrka = 1.1) {
  const T = TH(), me = new T.Mesh(new T.PlaneGeometry(s, s), logoMat(styrka));
  if (vetter === 'upp') me.rotation.x = -Math.PI / 2;
  me.position.set(x, y, z); g.add(me); return me;
}
// rund skivetikett: mitten av spelglimten och ett grönt band överst som på X-lådans skivor
function skivEtikett(id) {
  const T = TH(), src = glimtEtikett(id).image, c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  const s = Math.min(src.width, src.height); x.drawImage(src, (src.width - s) / 2, (src.height - s) / 2, s, s, 0, 0, 256, 256);
  x.fillStyle = '#107c10'; x.fillRect(0, 0, 256, 62);
  x.fillStyle = '#ffffff'; x.font = 'bold 30px system-ui, sans-serif'; x.textAlign = 'center'; x.fillText('X-LÅDA', 128, 46);
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.magFilter = T.NearestFilter; return t;
}
// skivan: regnbågsglänsande undersida, etikett uppåt, nav och hål i mitten
function skiva(id) {
  const T = TH(), s = new T.Group();
  const skivM = new T.MeshPhysicalMaterial({ color: 0xd8dce4, metalness: 0.9, roughness: 0.12, iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [200, 600] });
  rund(s, 0.6, 0.012, skivM, 0, 0, 0, 48);
  const et = new T.Mesh(new T.CircleGeometry(0.585, 48), new T.MeshStandardMaterial({ map: skivEtikett(id), roughness: 0.45 }));
  et.rotation.x = -Math.PI / 2; et.position.y = 0.0065; s.add(et);
  rund(s, 0.08, 0.016, mat(0xc8ccd4), 0, 0, 0, 24);
  rund(s, 0.036, 0.018, mat(0x0a0a0c), 0, 0, 0, 16);
  return s;
}
// Metas oändlighetsmärke (∞) på bygelns sida
function metaTextur(farg) {
  const T = TH(), c = document.createElement('canvas'); c.width = 128; c.height = 64; const x = c.getContext('2d');
  x.strokeStyle = farg; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath();
  for (let i = 0; i <= 80; i++) { const a = (i / 80) * Math.PI * 2, d = 1 + Math.sin(a) ** 2, px = 64 + (46 * Math.cos(a)) / d, py = 32 + (40 * Math.sin(a) * Math.cos(a)) / d; i ? x.lineTo(px, py) : x.moveTo(px, py); }
  x.stroke();
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
}

// ---------- X-lådans handkontroll ----------
// Sedd uppifrån: bred kudde med två grepp. Vänster spak högt upp och styrkorset under, höger spak under
// de färgade knapparna A (grön, nere) B (röd) X (blå) Y (gul). Lysande märke överst i mitten.
// o.serie: Serie X-kontrollens runda styrkors och delningsknapp mellan meny- och vyknappen.
const XK_KURVOR = [   // höger halva medurs från mitten upptill: [k1x, k1y, k2x, k2y, slutx, sluty], y = bort från spelaren
  [0.25, 0.33, 0.5, 0.38, 0.62, 0.25], [0.71, 0.14, 0.71, -0.04, 0.68, -0.18], [0.64, -0.38, 0.6, -0.55, 0.48, -0.57],
  [0.37, -0.59, 0.31, -0.5, 0.28, -0.39], [0.24, -0.27, 0.14, -0.22, 0, -0.22],
];
function xboxKontroll(g, x, z, rot, o = {}) {
  const T = TH(), k = new T.Group(); k.position.set(x, 0, z); k.rotation.y = rot; g.add(k);
  const bm = mat(o.kropp ?? 0x1e1e22, { roughness: 0.62, clearcoat: 0.08 }), mork = mat(0x0e0e10, { roughness: 0.5 }), gummi = mat(0x17171a, { roughness: 0.9, clearcoat: 0 });
  // konturen: höger halva, sedan samma kurvor spegelvända baklänges
  const s = new T.Shape(); s.moveTo(0, 0.31);
  for (const [a, b, c, d, e, f] of XK_KURVOR) s.bezierCurveTo(a, b, c, d, e, f);
  for (let i = XK_KURVOR.length - 1; i >= 0; i--) {
    const [a, b, c, d] = XK_KURVOR[i], [e, f] = i ? XK_KURVOR[i - 1].slice(4) : [0, 0.31];
    s.bezierCurveTo(-c, d, -a, b, -e, f);
  }
  const geo = new T.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelSegments: 5, curveSegments: 24 });
  const kr = skugg(new T.Mesh(geo, bm)); kr.rotation.x = -Math.PI / 2; kr.position.y = 0.08; k.add(kr);
  const Y = 0.3;   // ovansidan
  // axelknappar och avtryckare längs bakkanten
  for (const sx of [-1, 1]) {
    const b = platta(k, 0.44, 0.12, 0.1, mork, sx * 0.4, 0.15, -0.4, 0.05, 0.02); b.rotation.z = sx * 0.12;
    platta(k, 0.24, 0.18, 0.17, mork, sx * 0.46, 0.02, -0.43, 0.06, 0.03);
  }
  // spakarna: fot, gummitopp och räfflad kant
  const spak = (sx, sz) => {
    rund(k, 0.075, 0.07, mork, sx, Y + 0.02, sz, 20);
    rund(k, 0.1, 0.035, gummi, sx, Y + 0.07, sz, 24);
    const ring = skugg(new T.Mesh(new T.TorusGeometry(0.088, 0.016, 8, 28), gummi)); ring.rotation.x = Math.PI / 2; ring.position.set(sx, Y + 0.09, sz); k.add(ring);
  };
  spak(-0.42, -0.1); spak(0.22, 0.1);
  // styrkorset
  if (o.serie) { rund(k, 0.105, 0.03, mork, -0.22, Y + 0.01, 0.1, 32); styrkors(k, 0.17, mat(0x2c2c30, { roughness: 0.35 }), -0.22, Y + 0.035, 0.1); }
  else { rund(k, 0.12, 0.01, mat(0x141416), -0.22, Y + 0.002, 0.1, 32); styrkors(k, 0.2, mork, -0.22, Y + 0.025, 0.1); }
  // A B X Y
  for (const [dx, dz, c] of [[0, 0.1, 0x4cc23a], [0.1, 0, 0xe0382c], [-0.1, 0, 0x2a7ae6], [0, -0.1, 0xf2c41c]]) {
    rund(k, 0.048, 0.05, mork, 0.42 + dx, Y + 0.02, -0.1 + dz, 20);
    rund(k, 0.038, 0.012, lyser(c, 0.4), 0.42 + dx, Y + 0.05, -0.1 + dz, 18);
  }
  // mittknappen med märket, vy- och menyknapp (och delning på Serie X)
  rund(k, 0.075, 0.02, glans(0x26262a), 0, Y + 0.005, -0.21, 28);
  marke(k, 0.13, 0, Y + 0.017, -0.21, 'upp', 1.2);
  for (const sx of [-0.12, 0.12]) rund(k, 0.028, 0.02, mork, sx, Y + 0.005, -0.06, 16);
  if (o.serie) kloss(k, 0.06, 0.02, 0.035, mork, 0, Y + 0.005, 0.0);
  return k;
}

// ---------- 2013 X-LÅDA ETT (Xbox One) ----------
// Lång svart låda: matt vänsterdel med ventilgaller ovanpå, blank högerdel, skivspringa och lysande märke fram.
function xladaett(tel) {
  const T = TH(), g = new T.Group(), W = 3.43, D = 2.63, H = 0.8, xs = 0.55;
  const blank = kropp(tel, '#141417'), matt = mattKropp(tel, '#1b1b1e'), mork = mat(0x08080a, { roughness: 0.7 }), slits = mat(0x050506, { roughness: 0.9, clearcoat: 0 });
  platta(g, W - 0.5, D - 0.5, 0.06, mork, 0, 0, 0, 0.1, 0.02);   // indragen fot: lådan ser ut att sväva
  const r = 0.07, bev = 0.025, Hk = H - 0.05, bv = W / 2 + xs, bh = W / 2 - xs;
  platta(g, bv, D, Hk, matt, -W / 2 + bv / 2, 0.05, 0, r, bev, [r, 0, 0, r]);    // matta delen (vänster)
  platta(g, bh, D, Hk, blank, xs + bh / 2, 0.05, 0, r, bev, [0, r, r, 0]);      // blanka delen (höger)
  // ventilgallret ovanpå den matta delen: tätt med springor framifrån och bakåt
  for (let x = -W / 2 + 0.16; x < xs - 0.1; x += 0.048) kloss(g, 0.018, 0.006, D - 0.34, slits, x, H, 0);
  // vänster sida: ventiler, USB och parkopplingsknapp
  for (let z = -D / 2 + 0.25; z < D / 2 - 0.5; z += 0.06) kloss(g, 0.006, 0.42, 0.022, slits, -W / 2, 0.42, z);
  kloss(g, 0.01, 0.06, 0.16, mork, -W / 2 - 0.004, 0.42, D / 2 - 0.3);
  // framsidan: skivspringa till vänster, utmatningsknapp, märket som strömknapp på den blanka delen
  const fz = D / 2 + 0.003;
  kloss(g, 1.4, 0.032, 0.012, slits, -0.72, 0.47, fz);
  kloss(g, 0.05, 0.01, 0.01, mat(0x5a5a60), 0.18, 0.43, fz); for (let i = 0; i < 3; i++) kloss(g, 0.05 - i * 0.017, 0.008, 0.01, mat(0x5a5a60), 0.18, 0.455 + i * 0.009, fz);
  marke(g, 0.2, W / 2 - 0.36, 0.45, fz + 0.002, 'fram', 1.5);
  // baksidan: ventiler till vänster och en rad uttag till höger
  const bz = -D / 2 - 0.003;
  for (let x = -W / 2 + 0.2; x < -0.2; x += 0.055) kloss(g, 0.022, 0.42, 0.01, slits, x, 0.45, bz);
  for (const [px, w, h] of [[0.15, 0.16, 0.12], [0.42, 0.18, 0.08], [0.66, 0.18, 0.08], [0.88, 0.1, 0.07], [1.02, 0.1, 0.07], [1.2, 0.14, 0.12], [1.42, 0.16, 0.12]]) kloss(g, w, h, 0.012, mork, px, 0.42, bz);
  // skivan som matas ut genom springan
  const sk = skiva('tjuvarnashav'); g.add(sk);
  xboxKontroll(g, -1.9, 1.95, -0.3);   // snett framför till vänster: då får hela lådan plats i bild
  g.userData.satt = (o = 0) => { o = klamp01(o); sk.position.set(-0.72, 0.47, D / 2 - 0.64 + o * 0.86); };
  return g;
}

// ---------- 2020 X-LÅDA SERIE X (Xbox Series X) ----------
// Matt svart pelare 15 × 15 × 30 cm på en rund fot. Ovansidan är en grund skål med hålgaller där insidan lyser grönt.
function seriex(tel) {
  const T = TH(), g = new T.Group(), W = 1.51, D = 1.51, H = 3.01, m = mattKropp(tel, '#19191c'), mork = mat(0x08080a, { roughness: 0.7 }), slits = mat(0x040405, { roughness: 0.9, clearcoat: 0 });
  rund(g, 0.52, 0.04, mork, 0, 0.02, 0, 48);   // foten
  // skalet: rundad fyrkant med öppning uppåt
  const ram = 0.075, bev = 0.02, Hk = H - 0.04;
  const form = roundedRect(W - 2 * bev, D - 2 * bev, 0.07 - bev);
  form.holes.push(roundedRect(W - 2 * ram + 2 * bev, D - 2 * ram + 2 * bev, 0.03));
  const geo = new T.ExtrudeGeometry(form, { depth: Hk - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 16 });
  const skal = skugg(new T.Mesh(geo, m)); skal.rotation.x = -Math.PI / 2; skal.position.y = 0.04 + bev; g.add(skal);
  platta(g, W - 0.1, D - 0.1, 0.05, mork, 0, 0.06, 0, 0.04, 0.01);   // botten inuti skalet
  // gröna insidan som lyser genom hålen
  platta(g, W - 2 * ram + 0.02, D - 2 * ram + 0.02, 0.02, lyser(0x34d058, 1.3), 0, H - 0.3, 0, 0.03, 0.005);
  // gallret: hål i rutnät, böjt till en grund skål. Hålens väggar är gröna (andra materialet = sidorna).
  const gw = W - 2 * ram + 0.004, N = 12, steg = gw / (N + 0.5), gs = roundedRect(gw, gw, 0.03);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const px = (i - (N - 1) / 2) * steg, py = (j - (N - 1) / 2) * steg, hol = new T.Path();
    hol.absarc(px, py, steg * 0.43, 0, Math.PI * 2, true); gs.holes.push(hol);
  }
  const ggeo = new T.ExtrudeGeometry(gs, { depth: 0.05, bevelEnabled: false, curveSegments: 10 }), pos = ggeo.attributes.position, R2 = (gw / 2) ** 2 * 2;
  for (let i = 0; i < pos.count; i++) { const px = pos.getX(i), py = pos.getY(i); pos.setZ(i, pos.getZ(i) - 0.2 * (1 - (px * px + py * py) / R2)); }
  ggeo.computeVertexNormals();
  // två nät på samma form: locken (svarta) och sidorna (gröna). Grupp 0 = locken, grupp 1 = sidorna.
  [[ggeo, mat(0x1c1c1f, { roughness: 0.65, clearcoat: 0.1 })], [ggeo.clone(), lyser(0x30d058, 1.5)]].forEach(([geo2, mm], i) => {
    const gr = geo2.groups[i]; geo2.clearGroups(); geo2.setDrawRange(gr.start, gr.count);
    const galler = skugg(new T.Mesh(geo2, mm)); galler.rotation.x = -Math.PI / 2; galler.position.y = H - 0.045; g.add(galler);
  });
  // framsidan: märket uppe till vänster, lodrät skivspringa, utmatning, USB och parkoppling nere
  const fz = D / 2 + 0.002, kx = -W / 2 + 0.2;
  marke(g, 0.13, kx, H - 0.2, fz, 'fram', 1.6);
  kloss(g, 0.03, 1.7, 0.012, slits, kx, 1.62, fz);
  for (const [y, r] of [[0.66, 0.03], [0.22, 0.022]]) { const b = rund(g, r, 0.012, mat(0x2a2a2e), kx, y, fz, 16); b.rotation.x = Math.PI / 2; }
  kloss(g, 0.11, 0.045, 0.012, mork, kx, 0.42, fz);
  // baksidan: ventilhål upptill, uttag nertill
  const bz = -D / 2 - 0.002;
  for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) { const h = rund(g, 0.032, 0.01, slits, -0.56 + i * 0.14, 1.75 + j * 0.13, bz, 12); h.rotation.x = Math.PI / 2; }
  for (const [px, py, w, h] of [[-0.45, 0.62, 0.17, 0.07], [-0.2, 0.62, 0.13, 0.05], [0.0, 0.62, 0.13, 0.05], [0.25, 0.62, 0.16, 0.12], [-0.3, 0.35, 0.5, 0.06], [0.42, 0.3, 0.16, 0.12]]) kloss(g, w, h, 0.012, mork, px, py, bz);
  // skivan matas ut lodrätt ur springan, etiketten åt vänster
  const sk = skiva('forsa'); sk.rotation.z = Math.PI / 2; g.add(sk);
  xboxKontroll(g, 1.45, 1.1, -0.35, { serie: true });
  g.userData.satt = (o = 0) => { o = klamp01(o); sk.position.set(kx - 0.002, 1.62, D / 2 - 0.64 + o * 0.86); };
  return g;
}

// ---------- 2019 META KVEST (Meta Quest 2) ----------
// Vita VR-glasögon med fyra kameraprickar i framkanten, svart ansiktsdyna, grå bygel och två ringkontroller.
// Inuti: två linser där spelet syns live. Reglaget vänder glasögonen så man ser in i dem.
function rakta(me, nx, ny, nz) { const T = TH(); me.lookAt(me.position.clone().add(new T.Vector3(nx, ny, nz))); return me; }
function touch(g, x, z, rot, s) {
  const T = TH(), k = new T.Group(); k.position.set(x, 0, z); k.rotation.y = rot; g.add(k);
  const vit = mat(0xf0f0f2, { roughness: 0.45, clearcoat: 0.2 }), mork = mat(0x1a1a1e, { roughness: 0.6 }), gra = mat(0xd6d6da, { roughness: 0.5 });
  platta(k, 0.36, 0.36, 0.04, vit, 0, 0, 0.08, 0.17, 0.02);   // handtagets fot
  const grip = skugg(new T.Mesh(new T.CapsuleGeometry(0.16, 0.48, 8, 20), vit)); grip.position.set(0, 0.4, 0.04); grip.rotation.x = -0.28; k.add(grip);
  // avtryckaren fram under ovansidan
  const avt = skugg(new T.Mesh(new T.CapsuleGeometry(0.06, 0.14, 6, 12), gra)); avt.position.set(0, 0.62, -0.16); avt.rotation.x = 0.6; k.add(avt);
  // ovansidan: rund platta med spak och två knappar
  const topp = new T.Group(); topp.position.set(0, 0.78, -0.02); topp.rotation.x = 0.32; k.add(topp);
  rund(topp, 0.22, 0.12, vit, 0, 0, 0, 32);
  rund(topp, 0.2, 0.012, gra, 0, 0.062, 0, 32);
  rund(topp, 0.055, 0.06, mork, -s * 0.07, 0.08, 0.02, 16); rund(topp, 0.075, 0.03, mork, -s * 0.07, 0.115, 0.02, 20);
  for (const [bx, bz] of [[0.09, 0.08], [0.12, -0.04]]) rund(topp, 0.04, 0.03, mat(0xe4e4e8), s * bx, 0.075, bz, 16);
  rund(topp, 0.02, 0.02, mork, s * -0.05, 0.07, 0.14, 12);
  // spårningsringen: bågar över ovansidan, lutad framåt och ut åt sidan
  const ring = skugg(new T.Mesh(new T.TorusGeometry(0.34, 0.055, 12, 48), vit));
  ring.position.set(s * 0.12, 1.08, 0.02); ring.rotation.set(0.5, s * 0.25, s * 0.55); k.add(ring);
  return k;
}
function kvest(tel) {
  const T = TH(), g = new T.Group(), vit = kropp(tel, '#ededef'), svart = mat(0x16161a, { roughness: 0.92, clearcoat: 0 }), gra = mat(0x5c5e66, { roughness: 0.75, clearcoat: 0.05 });
  const W = 1.92, H = 1.02, D = 0.92;
  const huv = new T.Group(); g.add(huv);
  // frontskalet (mjukt rundat) och den smalare kroppen bakom, båda vita
  const yc = 0.02;
  staende(huv, W, H, 0.5, vit, 0, yc, D / 2 - 0.25, 0.32, 0.13);
  staende(huv, W - 0.16, H - 0.12, 0.5, vit, 0, yc + 0.06, -D / 2 + 0.25, 0.28, 0.1);
  kloss(huv, W - 0.3, 0.012, 0.012, mat(0xb8b8bc), 0, yc + H - 0.004, D / 2 - 0.5);   // skarven mellan skal och kropp
  // fyra kameror i frontens hörn, riktade snett utåt
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    const cam = skugg(new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.03, 20), glans(0x08080c))); cam.geometry.rotateX(Math.PI / 2);
    cam.position.set(sx * (W / 2 - 0.2), yc + H / 2 + sy * (H / 2 - 0.19), D / 2 - 0.005); huv.add(rakta(cam, sx * 0.35, sy * 0.35, 1));
  }
  // ansiktsdynan: svart ram bakom med näsurtag nertill
  const hw = 0.8, hh = 0.38, r = 0.26, ns = new T.Shape();
  ns.moveTo(-hw + r, -hh); ns.lineTo(-0.2, -hh); ns.quadraticCurveTo(-0.15, -hh + 0.2, 0, -hh + 0.21); ns.quadraticCurveTo(0.15, -hh + 0.2, 0.2, -hh);
  ns.lineTo(hw - r, -hh); ns.quadraticCurveTo(hw, -hh, hw, -hh + r); ns.lineTo(hw, hh - r); ns.quadraticCurveTo(hw, hh, hw - r, hh);
  ns.lineTo(-hw + r, hh); ns.quadraticCurveTo(-hw, hh, -hw, hh - r); ns.lineTo(-hw, -hh + r); ns.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  // öppningen för ansiktet: rundad rektangel ovanför näsurtaget
  const hal = new T.Path(), a = 0.66, b = 0.21, cy = 0.08, rr = 0.18;
  hal.moveTo(-a + rr, cy - b); hal.lineTo(a - rr, cy - b); hal.quadraticCurveTo(a, cy - b, a, cy - b + rr); hal.lineTo(a, cy + b - rr); hal.quadraticCurveTo(a, cy + b, a - rr, cy + b);
  hal.lineTo(-a + rr, cy + b); hal.quadraticCurveTo(-a, cy + b, -a, cy + b - rr); hal.lineTo(-a, cy - b + rr); hal.quadraticCurveTo(-a, cy - b, -a + rr, cy - b);
  ns.holes.push(hal);
  const dgeo = new T.ExtrudeGeometry(ns, { depth: 0.24, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 3, curveSegments: 12 });
  const dyna = skugg(new T.Mesh(dgeo, svart)); dyna.position.set(0, yc + H / 2, -D / 2 - 0.27); huv.add(dyna);
  // insidan: svart platta, två linser med spelet live
  staende(huv, 1.5, 0.62, 0.02, mat(0x0c0c10, { roughness: 0.6 }), 0, yc + H / 2 - 0.24, -D / 2 - 0.005, 0.18, 0.005);
  const sk = glimtSkarm('taktsabel', 1, 1), kvot = 108 / 192;
  for (const sx of [-1, 1]) {
    const lg = new T.CircleGeometry(0.19, 40), uv = lg.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setX(i, 0.5 + (uv.getX(i) - 0.5) * kvot);   // mitten av bilden, rätt proportioner
    const lins = new T.Mesh(lg, sk.me.material); lins.rotation.y = Math.PI; lins.position.set(sx * 0.33, yc + H / 2 + 0.08, -D / 2 - 0.02); huv.add(lins);
    const kant = skugg(new T.Mesh(new T.TorusGeometry(0.2, 0.025, 10, 40), mat(0x2a2a30, { roughness: 0.4 }))); kant.position.set(sx * 0.33, yc + H / 2 + 0.08, -D / 2 - 0.03); huv.add(kant);
  }
  // bygeln: grå armar från sidorna och ett mjukt band runt bakhuvudet som vilar på bordet
  const metaM = new T.MeshStandardMaterial({ map: metaTextur('#2a2b30'), transparent: true, roughness: 0.6 });
  for (const sx of [-1, 1]) {
    const arm = new T.Group(); arm.position.set(sx * (W / 2 - 0.06), yc + H / 2 + 0.02, -D / 2 + 0.1); arm.rotation.set(-0.3, sx * -0.06, 0); huv.add(arm);
    staende(arm, 0.08, 0.24, 1.15, gra, 0, -0.12, -0.5, 0.06, 0.03);
    const ml = new T.Mesh(new T.PlaneGeometry(0.22, 0.11), metaM); ml.rotation.y = sx * Math.PI / 2; ml.position.set(sx * 0.042, 0, -0.45); arm.add(ml);
  }
  const band = new T.Group(); band.position.set(0, yc + H / 2 - 0.3, -D / 2 - 0.95); band.rotation.x = -0.3; huv.add(band);
  const bgeo = new T.TorusGeometry(W / 2 - 0.02, 0.05, 10, 40, Math.PI), bm = skugg(new T.Mesh(bgeo, gra));
  bm.rotation.x = -Math.PI / 2; bm.scale.set(1, 0.95, 2.6); band.add(bm);
  // strömknapp och lampa på höger sida
  kloss(huv, 0.02, 0.05, 0.14, mat(0xc8c8cc), W / 2 - 0.005, yc + H / 2 - 0.1, 0.1);
  kloss(huv, 0.012, 0.025, 0.025, lyser(0xf0f0ff, 1.5), W / 2 - 0.004, yc + H / 2 + 0.06, 0.25);
  // kontrollerna står bredvid
  touch(g, -1.45, 0.35, 0.5, -1); touch(g, 1.4, -0.1, -0.2, 1);
  g.userData.tick = sk.tick;
  // reglaget: glasögonen lyfts och vänds mot kameran så att man ser in i linserna
  g.userData.satt = (o = 0) => { o = klamp01(o); huv.rotation.y = o * (Math.PI - 0.55); huv.position.set(0, Math.sin(o * Math.PI) * 0.25, o * 0.25); };
  return g;
}

// ---------- pixelbilder 40×28 för tidslinjen (samma stil som ../konsoller.js) ----------
const R = (x, X, Y, W, H, f) => { if (W <= 0 || H <= 0) return; x.fillStyle = f; x.fillRect(Math.round(X), Math.round(Y), Math.round(W), Math.round(H)); };
const P = (x, X, Y, f) => R(x, X, Y, 1, 1, f);
const skugga = (x, X, Y, w) => { R(x, X + 2, Y, w - 4, 1, 'rgba(0,0,0,0.35)'); R(x, X + 4, Y + 1, w - 8, 1, 'rgba(0,0,0,0.2)'); };
function lada(x, X, Y, w, topp, fram, cTopp, cFram, cKant = '#101018') {
  R(x, X + 2, Y, w - 2, topp, cTopp); R(x, X, Y + topp, w, fram, cFram);
  for (let i = 0; i < topp; i++) P(x, X + 2 - Math.round((i / topp) * 2), Y + i, cTopp);
  R(x, X, Y + topp + fram - 1, w, 1, cKant); R(x, X + 2, Y, w - 2, 1, 'rgba(255,255,255,0.35)');
}
function pixelXladaett(x, X, Y) {
  skugga(x, X, Y + 25, 40); lada(x, X, Y + 11, 40, 6, 8, '#2c2c30', '#141417');
  for (let i = 4; i < 22; i += 2) R(x, X + i, Y + 12, 1, 4, '#16161a');
  R(x, X + 24, Y + 11, 1, 6, '#0a0a0c'); R(x, X + 26, Y + 12, 12, 1, 'rgba(255,255,255,0.22)');
  R(x, X + 3, Y + 20, 15, 1, '#050506'); R(x, X + 33, Y + 19, 3, 3, '#e8e8e8'); P(x, X + 34, Y + 20, '#5a5a5a');
}
function pixelKvest(x, X, Y) {
  skugga(x, X + 4, Y + 25, 32);
  R(x, X + 9, Y + 15, 3, 5, '#5c5e66'); R(x, X + 28, Y + 15, 3, 5, '#5c5e66'); R(x, X + 11, Y + 21, 18, 2, '#4a4c54');
  R(x, X + 9, Y + 7, 22, 13, '#ededef'); R(x, X + 8, Y + 9, 24, 9, '#ededef'); R(x, X + 9, Y + 7, 22, 1, '#ffffff'); R(x, X + 9, Y + 19, 22, 1, '#c4c4ca'); R(x, X + 8, Y + 17, 1, 1, '#c4c4ca'); R(x, X + 31, Y + 17, 1, 1, '#c4c4ca');
  for (const [cx, cy] of [[10, 9], [29, 9], [10, 17], [29, 17]]) P(x, X + cx, Y + cy, '#101014');
  for (const cx of [2, 35]) { R(x, X + cx + 1, Y + 17, 2, 7, '#e8e8ea'); for (let a = 0; a < 12; a++) { const v = (a / 12) * Math.PI * 2; P(x, X + cx + 2 + Math.cos(v) * 2.5, Y + 14 + Math.sin(v) * 2.5, '#f4f4f6'); } }
}
function pixelSeriex(x, X, Y) {
  skugga(x, X + 10, Y + 26, 22);
  R(x, X + 14, Y + 6, 11, 20, '#1b1b1e'); R(x, X + 25, Y + 5, 4, 20, '#0e0e10');
  for (let i = 0; i < 4; i++) R(x, X + 14 + i, Y + 4 - Math.floor(i / 2), 11, 1, '#26262a');
  R(x, X + 15, Y + 2, 13, 4, '#26262a');
  for (let j = 0; j < 2; j++) for (let i = 0; i < 6; i++) P(x, X + 16 + i * 2 + j, Y + 3 + j * 2, '#3ad85c');
  P(x, X + 16, Y + 8, '#ffffff'); R(x, X + 16, Y + 10, 1, 9, '#050506'); R(x, X + 13, Y + 25, 13, 1, '#08080a');
}

export const KONSOLER = [
  { id: 'konsol-xladaett', namn: 'X-LÅDA ETT', forebild: 'Xbox One', ar: 2013, glimt: 'tjuvarnashav', bygg: xladaett, oppna: ['SKIVAN', 0], pixel: pixelXladaett,
    info: 'Lång svart låda: halva ovansidan är ventilgaller, andra halvan blank. Skivan matas in i springan fram och märket lyser vitt.' },
  { id: 'konsol-kvest', namn: 'META KVEST', forebild: 'Meta Quest 2', ar: 2019, glimt: 'taktsabel', bygg: kvest, oppna: ['VÄND GLASÖGONEN', 0], pixel: pixelKvest,
    info: 'VR-glasögon utan sladd: fyra kameror ser rummet och två ringkontroller följer händerna. Spelet syns live i linserna.' },
  { id: 'konsol-seriex', namn: 'X-LÅDA SERIE X', forebild: 'Xbox Series X', ar: 2020, glimt: 'forsa', bygg: seriex, oppna: ['SKIVAN', 0], pixel: pixelSeriex,
    info: 'Matt svart pelare med gröna ventilhål ovanpå. Snabb SSD som laddar spel på några sekunder.' },
];
