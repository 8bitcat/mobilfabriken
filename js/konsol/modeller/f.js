// Konsoler i 3D, grupp F. Samma format som KONSOLFORMER i ../konsol-gl.js. Verktygen finns i ../gl-verktyg.js.
import * as V from '../gl-verktyg.js';

const { TH, mat, glans, lyser, skugg, platta, staende, kloss, rund, kabel, styrkors, glimtSkarm, kropp, klamp01 } = V;

// ---------- gemensamt ----------
// knapp/spak som sticker ut ur en stående framsida (cylinderns axel längs z)
function framRund(g, r, h, m, x, y, z, seg = 24) { const k = rund(g, r, h, m, x, y, z, seg); k.rotation.x = Math.PI / 2; return k; }
// styrkors på en stående framsida
function framKors(g, s, m, x, y, z) { styrkors(g, s, m, x, y, z); g.children.slice(-2).forEach((k) => (k.rotation.x = Math.PI / 2)); }
// rund knapp med tryckt tecken på toppen (ABXY). Ett material per mesh – provsidan städar så.
function teckenKnapp(g, r, tecken, farg, bak, x, y, z) {
  const T = TH(), c = document.createElement('canvas'); c.width = c.height = 64; const q = c.getContext('2d');
  q.fillStyle = bak; q.fillRect(0, 0, 64, 64); q.fillStyle = farg; q.font = 'bold 36px system-ui, sans-serif'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText(tecken, 32, 35);
  const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
  const me = framRund(g, r, 0.035, mat(new T.Color(bak).getHex(), { roughness: 0.4 }), x, y, z);
  const topp = new T.Mesh(new T.CircleGeometry(r * 0.96, 24), new T.MeshPhysicalMaterial({ map: tex, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 }));
  topp.position.set(x, y, z + 0.0185); g.add(topp); return me;
}
// spak med grop runt: ring i kroppen, skaft och en gummitopp med kant
function spak(g, x, y, z, r = 0.09, m = 0x1a1a1e) {
  framRund(g, r * 1.55, 0.012, mat(0x0e0e12, { roughness: 0.7 }), x, y, z + 0.004, 32);
  framRund(g, r * 0.45, 0.06, mat(0x18181c), x, y, z + 0.03);
  framRund(g, r, 0.035, mat(m, { roughness: 0.75 }), x, y, z + 0.07, 32);
  const kant = new (TH().Mesh)(new (TH().TorusGeometry)(r * 0.88, r * 0.12, 8, 32), mat(m, { roughness: 0.6 })); kant.position.set(x, y, z + 0.088); g.add(kant);
}
// liten textur med text (logotyper på baksidan och knappar)
function textTextur(rader, w, h, farg, storlek, bak = null) {
  const T = TH(), c = document.createElement('canvas'); c.width = w; c.height = h; const q = c.getContext('2d');
  if (bak) { q.fillStyle = bak; q.fillRect(0, 0, w, h); }
  q.fillStyle = farg; q.textAlign = 'center'; q.textBaseline = 'middle';
  rader.forEach(([s, f, y]) => { q.font = `bold ${f || storlek}px system-ui, sans-serif`; q.fillText(s, w / 2, y ?? h / 2); });
  const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; return tex;
}
const etikett = (g, tex, w, h, x, y, z, bak = false) => {
  const T = TH(), me = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.5 }));
  if (bak) me.rotation.y = Math.PI; me.position.set(x, y, z); g.add(me); return me;
};
// 2D-pixelbildernas verktyg (40×28, samma stil som ../konsoller.js)
const R = (x, X, Y, W, H, f) => { if (W <= 0 || H <= 0) return; x.fillStyle = f; x.fillRect(Math.round(X), Math.round(Y), Math.round(W), Math.round(H)); };
const P = (x, X, Y, f) => R(x, X, Y, 1, 1, f);
const skugga = (x, X, Y, w) => { R(x, X + 2, Y, w - 4, 1, 'rgba(0,0,0,0.35)'); R(x, X + 4, Y + 1, w - 8, 1, 'rgba(0,0,0,0.2)'); };

// ---------- 2022 ÅNGDÄCKET (Steam Deck) i sin docka ----------
function angdack(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#26262b'), W = 2.98, H = 1.17, d = 0.2;
  const svart = mat(0x16161a, { roughness: 0.65, clearcoat: 0.1 }), knappM = mat(0x1c1c20, { roughness: 0.5 });
  // dockan: låg svart kloss med portar bak och en vit lampa fram
  const dm = mat(0x1a1a1e, { roughness: 0.7, clearcoat: 0.15 });
  platta(g, 1.35, 0.78, 0.2, dm, 0, 0, -0.14, 0.08, 0.025);
  kloss(g, 1.2, 0.02, 0.05, mat(0x26262c), 0, 0.2, 0.2);
  kloss(g, 0.05, 0.02, 0.012, lyser(0xffffff, 1.4), 0.5, 0.1, 0.25);
  for (const [px, pw] of [[-0.42, 0.13], [-0.2, 0.15], [0.02, 0.1], [0.2, 0.1], [0.4, 0.14]]) kloss(g, pw, 0.06, 0.02, mat(0x050506), px, 0.1, -0.535);
  kabel(g, [[0.4, 0.1, -0.54], [0.45, 0.05, -0.75], [0.6, 0.025, -0.95], [0.95, 0.025, -1.05]], mat(0x101012), 0.022);
  // själva handdatorn lutar bakåt i dockan
  const rig = new T.Group(); rig.position.set(0, 0.15, 0.06); rig.rotation.x = -0.34; g.add(rig);
  staende(rig, W, H, d, m, 0, 0, 0, 0.2, 0.035, [0.32, 0.32, 0.16, 0.16]);
  // handtagen på baksidan: stora rundade bulor
  // (lite mattare än fronten, som på riktigt, men i samma färg och yta som kroppen)
  const gm = m.clone(); gm.roughness = Math.max(gm.roughness, 0.5); gm.clearcoat = Math.min(gm.clearcoat ?? 0, 0.35); gm.clearcoatRoughness = 0.5;
  // en platt bakre platta binder ihop handtagen så att de växer ur kroppen i stället för att sitta som ägg
  staende(rig, W - 0.5, H - 0.25, 0.1, gm, 0, 0.12, -d / 2 - 0.03, 0.2, 0.04);
  for (const s of [-1, 1]) {
    const gr = skugg(new T.Mesh(new T.CapsuleGeometry(0.28, 0.5, 8, 24), gm));
    gr.position.set(s * 1.15, 0.5, -0.15); gr.rotation.z = s * 0.24; gr.scale.set(1.15, 1, 0.82); rig.add(gr);
    // bakknapparna (två per sida) längs handtagens insida
    for (const by of [0.78, 0.44]) { const b = staende(rig, 0.06, 0.22, 0.06, svart, s * 0.9, by - 0.11, -0.36, 0.025, 0.01); b.rotation.y = s * 0.55; }
    // axelknappar och avtryckare på ovansidan
    staende(rig, 0.52, 0.06, 0.12, svart, s * 1.16, H - 0.02, -0.01, 0.03, 0.01);
    const avt = staende(rig, 0.42, 0.1, 0.16, svart, s * 1.16, H - 0.01, -0.17, 0.04, 0.012); avt.rotation.x = -0.25;
  }
  // ovansidan: ström, volym, USB-C, hörlursuttag och fläktgaller
  kloss(rig, 0.1, 0.03, 0.06, mat(0x3a3a40), 0.62, H + 0.01, 0); kloss(rig, 0.16, 0.03, 0.06, mat(0x3a3a40), 0.82, H + 0.01, 0);
  kloss(rig, 0.1, 0.02, 0.04, mat(0x050506), 0.3, H + 0.002, 0); rund(rig, 0.022, 0.02, mat(0x050506), -0.42, H + 0.002, 0, 12);
  for (let i = 0; i < 9; i++) kloss(rig, 0.06, 0.025, 0.012, mat(0x0a0a0c), -0.24 + i * 0.07, H - 0.02, -d / 2 - 0.004);
  // fläktgallret på baksidan
  const bak = -d / 2 - 0.08;
  staende(rig, 0.8, 0.16, 0.012, mat(0x101012), 0, 0.84, bak - 0.004, 0.03, 0.004);
  for (let i = 0; i < 12; i++) kloss(rig, 0.025, 0.12, 0.014, mat(0x2a2a30), -0.33 + i * 0.06, 0.92, bak - 0.006);
  // framsidan: glaset runt skärmen och skärmen som visar spelet live
  const fram = d / 2;
  staende(rig, 1.8, 1.07, 0.012, glans(0x0a0a0d, { roughness: 0.08 }), 0, 0.05, fram + 0.004, 0.05, 0.004);
  const sk = glimtSkarm('blandoss', 1.52, 0.855); sk.me.position.set(0, 0.585, fram + 0.012); rig.add(sk.me);
  // vänster sida: styrkors, spak, vy-knapp, styrplatta och ÅNGA-knappen
  framKors(rig, 0.27, svart, -1.33, 0.86, fram + 0.03);
  spak(rig, -1.04, 0.85, fram);
  // höger sida: ABXY, spak, meny-knapp, styrplatta och snabbknappen
  [['Y', 0, 0.09], ['X', -0.09, 0], ['B', 0.09, 0], ['A', 0, -0.09]].forEach(([b, dx, dy]) => teckenKnapp(rig, 0.043, b, '#c8c8cc', '#1c1c20', 1.33 + dx, 0.86 + dy, fram + 0.018));
  spak(rig, 1.04, 0.85, fram);
  for (const s of [-1, 1]) {
    // styrplattorna: fyrkantiga, lite nedsänkta, med fin kant
    staende(rig, 0.37, 0.37, 0.012, mat(0x0c0c0f, { roughness: 0.9 }), s * 1.17, 0.145, fram + 0.002, 0.075, 0.004);
    staende(rig, 0.33, 0.33, 0.01, mat(0x3a3a42, { roughness: 0.9, clearcoat: 0 }), s * 1.17, 0.165, fram + 0.007, 0.06, 0.003);
    // små knappar ovanför spakarna
    staende(rig, 0.08, 0.05, 0.02, knappM, s * 1.06, 1.05, fram + 0.004, 0.015, 0.005);
  }
  // ÅNGA-knappen och tre-punkts-knappen under plattorna
  staende(rig, 0.17, 0.07, 0.025, knappM, -0.98, 0.045, fram + 0.004, 0.02, 0.006);
  etikett(rig, textTextur([['ÅNGA', 22]], 64, 28, '#9a9aa4'), 0.13, 0.055, -0.98, 0.08, fram + 0.019);
  staende(rig, 0.1, 0.07, 0.025, knappM, 0.98, 0.045, fram + 0.004, 0.02, 0.006);
  for (let i = -1; i <= 1; i++) framRund(rig, 0.006, 0.004, mat(0x9a9aa4), 0.98 + i * 0.022, 0.08, fram + 0.018, 8);
  // högtalargaller längs underkanten av glaset
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) framRund(rig, 0.009, 0.006, mat(0x050506), s * (0.58 + i * 0.04), 0.03, fram + 0.002, 8);
  g.userData.tick = sk.tick;
  return g;
}

// ---------- 2025 NINTENTO SVITSCH 2 (Nintendo Switch 2) ----------
function svitsch2(tel) {
  const T = TH(), g = new T.Group(), m = kropp(tel, '#2a2a2f');
  const rig = new T.Group(); rig.position.set(0, 0.04, 0); rig.rotation.x = -0.26; g.add(rig);   // lutar på stödet
  const W = 2.0, H = 1.16, d = 0.139, jw = 0.36;
  staende(rig, W, H, d, m, 0, 0, 0, 0.05, 0.02);
  // skärmen: 7,9 tum under svart glas med smal ram
  staende(rig, W - 0.06, H - 0.06, 0.01, glans(0x0a0a0d, { roughness: 0.08 }), 0, 0.03, d / 2 + 0.002, 0.035, 0.004);
  const sk = glimtSkarm('marcokartvarld', 1.76, 0.99); sk.me.position.set(0, H / 2, d / 2 + 0.009); rig.add(sk.me);
  // ovansidan: ström- och volymknappar, kortplatsen, USB-C och ventilation
  kloss(rig, 0.1, 0.025, 0.05, mat(0x3a3a40), -0.72, H + 0.008, 0); kloss(rig, 0.18, 0.025, 0.05, mat(0x3a3a40), -0.52, H + 0.008, 0);
  kloss(rig, 0.34, 0.012, 0.06, mat(0x0a0a0c), 0.55, H + 0.001, 0); kloss(rig, 0.1, 0.015, 0.04, mat(0x050506), 0.1, H + 0.001, 0);
  for (let i = 0; i < 10; i++) kloss(rig, 0.05, 0.01, 0.03, mat(0x0a0a0c), -0.2 - i * 0.0 + (i - 4.5) * 0.065 - 0.05, H + 0.001, -0.03);
  // baksidan: stort ventilationsgaller och logotypen
  for (let i = 0; i < 22; i++) kloss(rig, 0.03, 0.1, 0.006, mat(0x18181c), -0.7 + i * 0.066, H - 0.12, -d / 2 - 0.002);
  etikett(rig, textTextur([['NINTENTO SVITSCH 2', 30]], 512, 64, '#7a7a84'), 0.9, 0.11, 0, 0.6, -d / 2 - 0.003, true);
  // det breda U-formade stödet bak, utfällt mot bordet
  rig.updateMatrixWorld(true);
  const led = rig.localToWorld(new T.Vector3(0, 0.84, -d / 2 - 0.005)), ut = 0.34, L = Math.hypot(led.y, ut);
  const stod = new T.Group(); stod.position.copy(led); stod.rotation.x = Math.atan2(ut, led.y); g.add(stod);
  const sm = mat(0x222226, { roughness: 0.55 });
  for (const s of [-1, 1]) kloss(stod, 0.07, L, 0.022, sm, s * 0.66, -L / 2, -0.011);
  kloss(stod, 1.39, 0.07, 0.022, sm, 0, -L + 0.035, -0.011);
  for (const s of [-1, 1]) rund(stod, 0.03, 0.12, sm, s * 0.66, 0, -0.01, 12).rotation.z = Math.PI / 2;   // gångjärnen
  // sidokontrollerna: mattsvarta med blå (vänster) och röd (höger) färgrand mot skärmen
  const jm = mat(0x26262b, { roughness: 0.62, clearcoat: 0.15 }), knapp = mat(0x16161a, { roughness: 0.45 });
  const sida = (s, farg) => {
    const k = new T.Group(); rig.add(k);
    const Rr = 0.17, inre = -s * jw / 2;   // inre kanten (mot skärmen)
    staende(k, jw, H, d, jm, 0, 0, 0, Rr, 0.02, s < 0 ? [Rr, 0.02, 0.02, Rr] : [0.02, Rr, Rr, 0.02]);
    const fm = glans(farg, { roughness: 0.25 });
    kloss(k, 0.026, H - 0.14, 0.012, fm, inre + s * 0.016, H / 2, d / 2 - 0.002);   // färgranden som syns framifrån
    kloss(k, 0.008, H - 0.06, d - 0.02, fm, inre - s * 0.002, H / 2, 0);             // hela innersidan i färg (syns när den tas loss)
    for (const by of [0.78, 0.38]) staende(k, 0.012, 0.16, 0.05, knapp, inre - s * 0.008, by - 0.08, 0, 0.006, 0.003);   // SL och SR
    // axelknappar på ovansidan
    staende(k, 0.24, 0.05, 0.1, knapp, s * 0.04, H - 0.025, -0.01, 0.03, 0.01);
    if (s < 0) {
      kloss(k, 0.07, 0.018, 0.02, knapp, 0.08, 1.06, d / 2 + 0.008);                       // minus
      spak(k, 0, 0.77, d / 2, 0.088);
      for (const [bx, by] of [[0, 0.11], [0.11, 0], [0, -0.11], [-0.11, 0]]) framRund(k, 0.042, 0.03, knapp, bx, 0.4 + by, d / 2 + 0.012);
      staende(k, 0.06, 0.06, 0.02, knapp, 0.07, 0.15, d / 2 + 0.004, 0.012, 0.004);         // skärmdumpsknappen
    } else {
      kloss(k, 0.07, 0.018, 0.02, knapp, -0.08, 1.06, d / 2 + 0.008); kloss(k, 0.018, 0.07, 0.02, knapp, -0.08, 1.06, d / 2 + 0.008);   // plus
      [['X', 0, 0.11], ['Y', -0.11, 0], ['A', 0.11, 0], ['B', 0, -0.11]].forEach(([b, bx, by]) => teckenKnapp(k, 0.043, b, '#b8b8c0', '#16161a', bx, 0.77 + by, d / 2 + 0.016));
      spak(k, 0, 0.4, d / 2, 0.088);
      framRund(k, 0.05, 0.02, mat(0x5a5a62), -0.07, 0.16, d / 2 + 0.006, 24); framRund(k, 0.036, 0.024, knapp, -0.07, 0.16, d / 2 + 0.01, 24);   // hemknappen
      framRund(k, 0.032, 0.022, knapp, 0.07, 0.2, d / 2 + 0.008, 20);                       // C-knappen (chatten)
      etikett(k, textTextur([['C', 44]], 64, 64, '#9a9aa4'), 0.04, 0.04, 0.07, 0.2, d / 2 + 0.0195);
    }
    return k;
  };
  const vs = sida(-1, 0x1aa8f0), hs = sida(1, 0xf0283c);
  g.userData.tick = sk.tick;
  // magneterna släpper: sidokontrollerna glider ut åt sidorna
  g.userData.satt = (o = 0) => {
    o = klamp01(o);
    vs.position.set(-W / 2 - jw / 2 - o * 0.5, o * 0.08, o * 0.05); hs.position.set(W / 2 + jw / 2 + o * 0.5, o * 0.08, o * 0.05);
    vs.rotation.z = o * 0.12; hs.rotation.z = -o * 0.12; vs.rotation.y = o * 0.35; hs.rotation.y = -o * 0.35;
  };
  return g;
}

export const KONSOLER = [
  { id: 'konsol-angdack', namn: 'ÅNGDÄCKET', forebild: 'Steam Deck', ar: 2022, glimt: 'blandoss', bygg: angdack, oppna: null,
    info: 'En hel speldator i handen: stor skärm, två spakar och två fyrkantiga styrplattor. I dockan blir den en vanlig konsol vid TV:n.',
    pixel(x, X, Y) {
      skugga(x, X + 1, Y + 25, 38);
      R(x, X + 2, Y + 8, 36, 1, '#3a3a42'); R(x, X + 1, Y + 9, 38, 13, '#26262b'); R(x, X + 2, Y + 22, 36, 1, '#1a1a1e');
      R(x, X + 2, Y + 22, 10, 2, '#1e1e22'); R(x, X + 28, Y + 22, 10, 2, '#1e1e22'); R(x, X + 3, Y + 24, 7, 1, '#1a1a1e'); R(x, X + 30, Y + 24, 7, 1, '#1a1a1e');
      // skärmen med besättningen i kafeterian
      R(x, X + 11, Y + 9, 18, 13, '#0a0a0e'); R(x, X + 12, Y + 11, 16, 9, '#9ba8ba'); R(x, X + 12, Y + 11, 16, 2, '#6c7892');
      R(x, X + 15, Y + 15, 2, 3, '#c51111'); P(x, X + 16, Y + 15, '#95cadc'); R(x, X + 22, Y + 14, 2, 3, '#38fedc'); P(x, X + 22, Y + 14, '#95cadc'); R(x, X + 19, Y + 17, 3, 1, '#e01818');
      // vänster: styrkors, spak och styrplatta
      R(x, X + 3, Y + 12, 3, 1, '#0e0e12'); R(x, X + 4, Y + 11, 1, 3, '#0e0e12');
      R(x, X + 7, Y + 11, 3, 3, '#0e0e12'); P(x, X + 8, Y + 12, '#4a4a54');
      R(x, X + 4, Y + 16, 5, 5, '#34343c'); R(x, X + 4, Y + 16, 5, 1, '#4a4a52');
      // höger: ABXY, spak och styrplatta
      for (const [dx, dy] of [[1, 0], [0, 1], [2, 1], [1, 2]]) P(x, X + 34 + dx, Y + 11 + dy, '#8a8a94');
      R(x, X + 30, Y + 11, 3, 3, '#0e0e12'); P(x, X + 31, Y + 12, '#4a4a54');
      R(x, X + 31, Y + 16, 5, 5, '#34343c'); R(x, X + 31, Y + 16, 5, 1, '#4a4a52');
    } },
  { id: 'konsol-svitsch2', namn: 'NINTENTO SVITSCH 2', forebild: 'Nintendo Switch 2', ar: 2025, glimt: 'marcokartvarld', bygg: svitsch2, oppna: ['SIDOKONTROLLERNA', 0],
    info: 'Större skärm och mattsvarta sidokontroller som sitter fast med magneter, med en blå och en röd rand mot skärmen. Brett stöd bak.',
    pixel(x, X, Y) {
      skugga(x, X + 1, Y + 25, 38);
      R(x, X + 8, Y + 7, 24, 16, '#1e1e22'); R(x, X + 9, Y + 8, 22, 14, '#4a96f4'); R(x, X + 9, Y + 15, 22, 7, '#5cc83e'); R(x, X + 16, Y + 15, 8, 7, '#686e7a');
      R(x, X + 19, Y + 18, 2, 3, '#e02020'); R(x, X + 23, Y + 9, 4, 2, '#ffffff');
      R(x, X + 2, Y + 7, 6, 16, '#26262c'); R(x, X + 32, Y + 7, 6, 16, '#26262c'); R(x, X + 2, Y + 7, 6, 1, '#3a3a42'); R(x, X + 32, Y + 7, 6, 1, '#3a3a42');
      R(x, X + 7, Y + 8, 1, 14, '#1aa8f0'); R(x, X + 32, Y + 8, 1, 14, '#f0283c');
      R(x, X + 4, Y + 10, 2, 2, '#0e0e12'); R(x, X + 34, Y + 16, 2, 2, '#0e0e12');
      for (const [dx, dy] of [[1, 0], [0, 1], [2, 1], [1, 2]]) { P(x, X + 3 + dx, Y + 15 + dy, '#0e0e12'); P(x, X + 33 + dx, Y + 10 + dy, '#8a8a94'); }
    } },
];
