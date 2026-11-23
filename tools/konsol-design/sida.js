// Designdokumentet för konsolläget: levande bilder ritade med spelets egna verktyg (pixelgränssnittet,
// figurerna, spelglimtarna och rivalkonsolerna). Buntas av tools/konsol-design/bygg.mjs.
import * as UI from '../../js/core/ui.js';
import { drawPerson, makeLook } from '../../js/core/people.js';
import { GLIMTAR, GLIMT, glimtBild } from '../../js/konsol/glimtar.js';
import { KONSOLLER as PIXELKONSOLLER } from '../../js/konsol/konsoller.js';
import { KONSOLFORMER } from '../../js/konsol/konsol-gl.js';
// tidslinjen: de ritade rivalerna plus de 3D-konsoler som har en egen pixelbild
const KONSOLLER = [...PIXELKONSOLLER, ...KONSOLFORMER.filter((f) => f.pixel && !PIXELKONSOLLER.some((k) => k.namn === f.namn)).map((f) => ({ namn: f.namn, ar: f.ar, rita: f.pixel }))].sort((a, b) => a.ar - b.ar);

const { W, H, F, css, rect, ram, text, textB, panel, knapp, chip, matare, stjarnor, stycke } = UI;
const rng = (s) => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
const barn = (s, o = {}) => ({ ...makeLook(rng(s)), kid: true, ...o });
const vuxen = (s, o = {}) => ({ ...makeLook(rng(s)), ...o });

// en 384×216-yta som förstoras 3× till sin canvas
function yta(id, rita) {
  const el = document.getElementById(id); if (!el) return null;
  el.width = W * 3; el.height = H * 3;
  const off = document.createElement('canvas'); off.width = W; off.height = H;
  const x = off.getContext('2d'); x.imageSmoothingEnabled = false;
  const ut = el.getContext('2d'); ut.imageSmoothingEnabled = false;
  return { el, steg(t) { UI.borja(x, t); rita(x, t); ut.drawImage(off, 0, 0, W * 3, H * 3); } };
}
const glimt = (x, id, t, X, Y, w, h) => { const c = glimtBild(id, t); x.drawImage(c, X, Y, w, h); };

// ---------- vardagsrummen (reklamfilmen) ----------
function vardagsrum80(x, t, glimtId) {
  rect(0, 0, W, H, 0x6a4a3a); for (let i = 0; i < W; i += 12) rect(i, 0, 6, 150, 0x74523f);   // tapet
  rect(0, 150, W, 66, 0x8a5a30); for (let i = 0; i < W; i += 24) rect(i, 150, 1, 66, 0x6a4020);  // parkett
  rect(0, 148, W, 3, 0x4a2a18);
  // fönster med kvällshimmel
  rect(24, 30, 70, 60, 0x2a1a10); rect(27, 33, 64, 54, 0x3a4a8a); rect(27, 60, 64, 27, 0x6a5a9a); rect(58, 33, 2, 54, 0x2a1a10); rect(27, 59, 64, 2, 0x2a1a10);
  // tjock-TV:n på en träbänk
  rect(232, 112, 120, 40, 0x5a3418); rect(232, 112, 120, 3, 0x7a4a24);
  rect(244, 52, 96, 62, 0x3a3a3a); rect(246, 54, 92, 58, 0x2a2a2a); rect(250, 58, 72, 52, 0x101010);
  glimt(x, glimtId, t, 252, 60, 68, 48);
  x.fillStyle = 'rgba(255,255,255,0.06)'; for (let y = 60; y < 108; y += 2) x.fillRect(252, y, 68, 1);   // bildrör
  rect(326, 62, 8, 3, 0x8a8a8a); rect(326, 70, 8, 3, 0x8a8a8a); rect(328, 92, 4, 4, 0xc0c0c0);
  // konsolen under TV:n med sladd
  rect(262, 126, 40, 10, 0xb8b8b4); rect(262, 126, 40, 2, 0xd8d8d4); rect(262, 134, 40, 2, 0x3a3a3c); rect(292, 129, 4, 2, 0xd82020);
  // soffan och barnen som spelar
  rect(40, 120, 120, 34, 0x7a2a2a); rect(36, 112, 128, 14, 0x8a3434); rect(36, 112, 128, 2, 0xa04a4a); rect(36, 140, 8, 20, 0x6a2020); rect(156, 140, 8, 20, 0x6a2020);
  const hopp = Math.sin(t * 6) > 0.6 ? -2 : 0;
  drawPerson(x, 80, 150 + hopp, barn(11, { shirt: '#3a7bd5' }), 'right', 5);
  drawPerson(x, 118, 150, barn(29, { shirt: '#e0a02a' }), 'right', 5);
  rect(90, 128 + hopp, 6, 3, 0x2a2a2a); rect(128, 128, 6, 3, 0x2a2a2a);
}
function vardagsrum26(x, t, glimtId) {
  rect(0, 0, W, H, 0xd8dce4); rect(0, 0, W, 4, 0xc0c4d0);
  rect(0, 156, W, 60, 0xb8a080); for (let i = 0; i < W; i += 30) rect(i, 156, 1, 60, 0xa08868); rect(0, 154, W, 3, 0x8a7458);
  // stort fönster med stad i solnedgång
  rect(20, 24, 120, 96, 0x30304a); rect(23, 27, 114, 90, 0xf08a60); rect(23, 27, 114, 40, 0xc8508a);
  for (let i = 0; i < 9; i++) { const h = 20 + ((i * 37) % 40); rect(23 + i * 13, 117 - h, 11, h, 0x2a1a40); }
  // platt-TV på väggen med LED-list
  rect(196, 40, 176, 100, 0x101014); glimt(x, glimtId, t, 199, 43, 170, 94);
  x.fillStyle = 'rgba(140,90,255,0.25)'; x.fillRect(190, 140, 188, 3);
  rect(214, 140, 140, 16, 0xf0f0f2); rect(214, 140, 140, 2, 0xffffff);
  // nya konsolen (vit med svart mitt) bredvid
  rect(326, 112, 10, 28, 0xf4f4f6); rect(336, 112, 6, 28, 0x141418); rect(336, 112, 1, 28, 0x4a8af0); rect(342, 112, 10, 28, 0xf4f4f6);
  // soffa och barn
  rect(30, 130, 140, 30, 0x5a6a8a); rect(26, 122, 148, 14, 0x6a7a9a); rect(26, 122, 148, 2, 0x8a9aba);
  const hopp = Math.sin(t * 5) > 0.5 ? -2 : 0;
  drawPerson(x, 76, 156, barn(41, { shirt: '#46a35a' }), 'right', 5);
  drawPerson(x, 116, 156 + hopp, barn(73, { shirt: '#c9323a' }), 'right', 5);
  rect(126, 134 + hopp, 7, 3, 0x1a1a1e);
}
function packshot(x, t, era) {
  rect(0, 0, W, H, era === 26 ? 0x10101a : 0x0b0e1c);
  for (let i = 0; i < 30; i++) { const a = (i / 30) * Math.PI * 2 + t * 0.3; x.fillStyle = 'rgba(255,210,63,0.06)'; x.beginPath(); x.moveTo(192, 96); x.lineTo(192 + Math.cos(a) * 300, 96 + Math.sin(a) * 300); x.lineTo(192 + Math.cos(a + 0.08) * 300, 96 + Math.sin(a + 0.08) * 300); x.fill(); }
  const namn = era === 26 ? 'PIXLA 9' : 'PIXLA 8';
  if (era === 26) { rect(150, 52, 22, 80, 0xf4f4f6); rect(172, 52, 14, 80, 0x141418); rect(172, 52, 2, 80, 0x4a8af0); rect(184, 52, 2, 80, 0x4a8af0); rect(186, 52, 22, 80, 0xf4f4f6); }
  else { rect(132, 92, 96, 34, 0xb8b8b4); rect(132, 92, 96, 6, 0xd8d8d4); rect(132, 110, 96, 6, 0x58585a); rect(132, 116, 96, 10, 0x3a3a3c); rect(206, 119, 10, 3, 0xd82020); rect(140, 98, 50, 10, 0x9a9a96); }
  // spelkartongen bredvid
  const gid = era === 26 ? 'gta6' : 'marco', g = GLIMT[gid];
  rect(244, 60, 64, 86, 0x101010); glimt(x, gid, t, 246, 74, 60, 50); rect(246, 62, 60, 10, era === 26 ? 0xff4fa0 : 0xd82800);
  text(era === 26 ? 'GTA VI' : 'SUPER MARCO', 276, 65, F.text, { just: 'c' }); text(namn, 276, 132, F.dim, { just: 'c' });
  textB(era === 26 ? 'NU PÅ ' + namn + '!' : 'NU KAN DU SPELA HEMMA!', 192, 168, F.guld, { just: 'c', skugga: 0x000000 });
  text(g.titel + ' · BARA PÅ ' + namn, 192, 184, F.text, { just: 'c' });
}
const REKLAM = [
  { s: 3.2, rita: (x, t) => vardagsrum80(x, t, 'marco'), rubrik: '1986 · VARDAGSRUMMET' },
  { s: 2.6, rita: (x, t) => { rect(0, 0, W, H, 0x101010); glimt(x, 'marco', t, 64, 12, 256, 192); }, rubrik: 'SPELET PÅ DIN KONSOL' },
  { s: 2.8, rita: (x, t) => packshot(x, t, 86), rubrik: 'LOGGAN OCH SLOGAN' },
  { s: 3.2, rita: (x, t) => vardagsrum26(x, t, 'gta6'), rubrik: '2026 · SAMMA FILM, NY ERA' },
  { s: 2.6, rita: (x, t) => { rect(0, 0, W, H, 0x000000); glimt(x, 'gta6', t, 0, 0, W, H); }, rubrik: 'SPELET PÅ DIN KONSOL' },
  { s: 2.8, rita: (x, t) => packshot(x, t, 26), rubrik: 'LOGGAN OCH SLOGAN' },
];
const REKLAM_TOT = REKLAM.reduce((s, r) => s + r.s, 0);
function reklam(x, t) {
  let tt = t % REKLAM_TOT, i = 0; while (tt > REKLAM[i].s) { tt -= REKLAM[i].s; i++; }
  REKLAM[i].rita(x, t);
  // filmremsa: svarta band och ett REKLAM-märke
  rect(0, 0, W, 10, 0x000000); rect(0, H - 10, W, 10, 0x000000);
  text('REKLAMFILM · ' + REKLAM[i].rubrik, 6, 3, F.dim);
  REKLAM.forEach((_, k) => rect(W - 8 - (REKLAM.length - k) * 8, H - 7, 6, 3, k === i ? F.guld : 0x3a3a3a));
  if (tt < 0.25) { x.fillStyle = `rgba(0,0,0,${1 - tt / 0.25})`; x.fillRect(0, 0, W, H); }
}

// ---------- bygget: först konsolen, sedan mjukvaran ----------
function bygget(x, t) {
  rect(0, 0, W, H, 0x3a3440); for (let i = 0; i < W; i += 16) rect(i, 0, 1, 140, 0x443c4a);  // garagevägg
  rect(0, 140, W, 76, 0x4a4650); rect(0, 140, W, 2, 0x2a2630);
  rect(150, 20, 84, 50, 0x5a5462); for (let j = 0; j < 50; j += 6) rect(150, 20 + j, 84, 1, 0x4a4452);   // garageporten
  text('1982 · GARAGET', 8, 8, F.dim);
  const bord = (bx, namn, roll, L, sak) => {
    rect(bx, 108, 70, 6, 0x8a6a40); rect(bx, 108, 70, 1, 0xa88a58); rect(bx + 4, 114, 3, 22, 0x6a4a28); rect(bx + 63, 114, 3, 22, 0x6a4a28);
    sak(bx);
    drawPerson(x, bx + 35, 138, L, 'up', 5);
    text(namn, bx + 35, 146, F.text, { just: 'c' }); text(roll, bx + 35, 154, F.dim, { just: 'c' });
  };
  bord(40, 'SIV', 'INGENJÖR', vuxen(5, { shirt: '#8e5bd1' }), (bx) => { rect(bx + 20, 92, 30, 16, 0x2a2a2a); for (let i = 0; i < 5; i++) rect(bx + 22 + i * 5, 96 + (i % 2) * 4, 3, 3, [0xd04040, 0x40b040, 0xd0a020][i % 3]); rect(bx + 26, 104, 18, 2, 0xc0a060); });
  bord(250, 'NILS', 'SPELUTVECKLARE', vuxen(17, { shirt: '#2aa39a' }), (bx) => { rect(bx + 18, 78, 34, 30, 0xc8b890); rect(bx + 21, 81, 28, 22, 0x101010); glimt(x, 'pang', t, bx + 22, 82, 26, 20); rect(bx + 14, 104, 42, 4, 0xa89870); });
  // byggpanelen längst ner
  panel(8, 168, W - 16, 42, { block: false });
  const hw = 1, mjuk = Math.min(1, (t % 7) / 6);
  text('HÅRDVARA: PANG-LÅDAN', 16, 175, F.text); matare(140, 175, 150, 5, hw, F.gron, { segment: 10 }); text('KLAR', 298, 175, F.gron2);
  text('MJUKVARA: PANG!', 16, 188, F.text); matare(140, 188, 150, 5, mjuk, F.bla2, { segment: 10 }); text(Math.round(mjuk * 100) + ' %', 298, 188, F.bla2);
  text(mjuk < 1 ? 'NILS SKRIVER SPELET – SEDAN LANSERAS BÅDA PÅ SHOWEN' : 'BÅDA KLARA! DAGS FÖR LANSERING', 16, 200, mjuk < 1 ? F.dim : F.guld);
}

// ---------- studiokortet ----------
function pitch(x, t) {
  bygget(x, t * 0.4);
  UI.morkna(0, 0, W, H, 0.6);
  panel(34, 14, 316, 190, { kant: F.guld2 });
  textB('EN STUDIO KNACKAR PÅ!', 192, 24, F.guld, { just: 'c' });
  text('SVAMPSTUDION VILL GÖRA ETT SPEL TILL PIXLA 8', 192, 36, F.dim, { just: 'c' });
  // kartongen med spelet som rör sig
  rect(46, 48, 92, 92, 0x101010); rect(48, 50, 88, 12, 0xd82800); text('SUPER MARCO', 92, 53, F.text, { just: 'c' }); glimt(x, 'marco', t, 48, 64, 88, 66); text('PIXLA 8', 92, 132, F.dim, { just: 'c' });
  const X = 150;
  textB('SUPER MARCO BROS.', X, 52, F.text); stjarnor(X, 62, 4); text('PLATTFORMSSPEL · 1985', X + 40, 63, F.dim);
  text('KRÄVER', X, 76, F.dim); chip(X + 32, 73, 'STYRKORS', { stil: 'gron' }); chip(X + 80, 73, 'SCROLLNING', { stil: 'gron' }); chip(X + 136, 73, '8 BIT', { stil: 'gron' });
  text('UTVECKLING', X, 90, F.dim); text('9 MÅNADER', X + 70, 90, F.text);
  text('VILL HA', X, 100, F.dim); text('DEVKIT 40 000 KR · 300 000 KR REKLAM', X + 70, 100, F.text);
  text('LICENS', X, 110, F.dim); text('12 % AV VARJE SÅLT SPEL TILL ER', X + 70, 110, F.text);
  text('PROGNOS', X, 120, F.dim); text('400 000 SÅLDA SPEL · KONSOLEN +60 %', X + 70, 120, F.gron2);
  text('SYSTEMSÄLJARE – FOLK KÖPER KONSOLEN FÖR SPELET', X, 132, F.guld2);
  const val = Math.floor(t / 1.2) % 4;
  knapp(46, 150, 64, 14, 'JA', { stil: 'gron', klick: () => {}, aktiv: val === 0 });
  knapp(114, 150, 80, 14, 'FÖRHANDLA', { stil: 'bla', klick: () => {}, aktiv: val === 1 });
  knapp(198, 150, 96, 14, 'EXKLUSIVT 2 MKR', { stil: 'lila', klick: () => {}, aktiv: val === 2 });
  knapp(298, 150, 40, 14, 'NEJ', { stil: 'dim', klick: () => {}, aktiv: val === 3 });
  stycke(['STANDARDAVTAL: SPELET KOMMER OCKSÅ TILL RIVALERNA OM DE FRÅGAR.', 'DRA I LICENSEN OCH REKLAMBIDRAGET – FÖR GIRIGT SÅ GÅR STUDION.', 'BARA PÅ PIXLA 8. RIVALERNA FÅR INTE SPELET – STUDION VILL HA BETALT.', 'STUDION GÅR TILL RIVALEN. NYHETERNA SKRIVER OM DET.'][val], 46, 172, 292, F.dim);
}

// ---------- tidslinjen ----------
function tidslinje(el) {
  const k = 3, steg = 64, w = KONSOLLER.length * steg + 20, h = 66;
  const off = document.createElement('canvas'); off.width = w; off.height = h; const x = off.getContext('2d'); x.imageSmoothingEnabled = false;
  UI.borja(x, 0);
  rect(0, 0, w, h, F.bg2); rect(0, 44, w, 1, F.hi);
  KONSOLLER.forEach((ko, i) => {
    const X = 10 + i * steg;
    rect(X + 26, 42, 3, 5, F.guld);
    ko.rita(x, X + 8, 8);
    text(String(ko.ar), X + 28, 50, F.guld, { just: 'c' });
    text(ko.namn.replace('NINTENTO ', '').replace('MIKROMJUK ', '').replace('SEGO ', ''), X + 28, 58, F.dim, { just: 'c' });
  });
  el.width = w * k; el.height = h * k; el.style.width = w * k / 1.5 + 'px';
  const y = el.getContext('2d'); y.imageSmoothingEnabled = false; y.drawImage(off, 0, 0, w * k, h * k);
}

// ---------- galleriet ----------
function galleri(el) {
  const ut = [];
  for (const g of GLIMTAR) {
    const fig = document.createElement('figure'); fig.className = 'glimt ram';
    const c = document.createElement('canvas'), k = Math.max(1, Math.floor(384 / g.w));
    c.width = g.w * k; c.height = g.h * k;
    const cap = document.createElement('figcaption');
    cap.innerHTML = `<b>${g.titel}</b><span>${g.forebild} · ${g.ar} · ${g.studio}</span>`;
    fig.append(c, cap); el.append(fig);
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    ut.push({ el: c, steg(t) { x.drawImage(glimtBild(g.id, t), 0, 0, c.width, c.height); } });
  }
  return ut;
}

// ---------- forskningen: telefonavdelningen låses upp ----------
// små pixelprylar (18×22) för MOBIL-fliken
function pryl(typ, X, Y, last) {
  const ram0 = last ? 0x3a3f58 : 0x16161c, sk = last ? 0x2a2f48 : 0x5a6af0, sk2 = last ? 0x2a2f48 : 0xc060c8, kr = last ? 0x4a4f68 : 0xe8e8ee;
  const skarm = (x0, y0, w, h) => { rect(x0, y0, w, h, sk); rect(x0, y0 + Math.floor(h / 2), w, Math.ceil(h / 2), sk2); };
  if (typ === 'telefon') { rect(X + 4, Y + 1, 10, 19, kr); rect(X + 5, Y + 3, 8, 13, ram0); skarm(X + 5, Y + 3, 8, 13); rect(X + 8, Y + 17, 2, 2, ram0); }
  if (typ === 'platta') { rect(X + 1, Y + 1, 16, 20, kr); skarm(X + 3, Y + 3, 12, 15); }
  if (typ === 'laptop') { rect(X + 1, Y + 4, 16, 11, kr); skarm(X + 2, Y + 5, 14, 9); rect(X - 1, Y + 15, 20, 3, kr); rect(X + 6, Y + 15, 6, 1, ram0); }
  if (typ === 'klocka') { rect(X + 6, Y, 6, 22, last ? 0x3a3f58 : 0xc85a8a); rect(X + 3, Y + 6, 12, 11, kr); rect(X + 4, Y + 7, 10, 9, 0x08080c); ram(X + 6, Y + 9, 6, 5, last ? 0x4a4f68 : 0xff4060); }
  if (typ === 'horlurar') { rect(X + 3, Y + 9, 12, 10, kr); rect(X + 3, Y + 12, 12, 1, 0x9a9aa4); rect(X + 1, Y + 3, 3, 3, kr); rect(X + 2, Y + 6, 1, 5, kr); rect(X + 14, Y + 3, 3, 3, kr); rect(X + 15, Y + 6, 1, 5, kr); }
  if (typ === 'vikbar') { rect(X, Y + 1, 18, 19, kr); skarm(X + 1, Y + 2, 16, 17); rect(X + 9, Y + 2, 1, 17, ram0); }
  if (last) UI.ikon('las', X + 6, Y + 8, F.dim);
}
const PRYLAR = [['telefon', 'TELEFON', 2007, 'TELEFON'], ['platta', 'SURFPLATTA', 2010, 'PLATTA'], ['laptop', 'LAPTOP', 2012, 'LAPTOP'], ['klocka', 'KLOCKA', 2014, 'KLOCKA'], ['horlurar', 'HÖRLURAR', 2016, 'LURAR'], ['vikbar', 'VIKBAR', 2019, 'VIKBAR']];
function forskning(x, t) {
  const fas = t % 10, klar = fas > 6;
  rect(0, 0, W, H, F.bg);
  rect(0, 0, W, 16, F.bg2); rect(0, 16, W, 1, F.hi);
  textB('FORSKNING', 8, 5, F.guld); text('2007 · 412 FP · 6 FORSKARE', 96, 6, F.dim);
  // flikarna: KONSOL och MOBIL (låst tills avdelningen är forskad)
  knapp(250, 3, 58, 11, 'KONSOL', { stil: klar ? 'morkt' : 'guld', klick: () => {} });
  knapp(312, 3, 64, 11, klar ? 'MOBIL' : 'MOBIL', { stil: klar ? 'guld' : 'dim', ikon: klar ? 'telefon' : 'las', klick: () => {} });
  if (!klar) {
    // konsolteknikerna som krävs, till vänster
    text('KONSOLTEKNIK', 10, 24, F.dim);
    [['FICKKONSOL', 1989], ['PEKSKÄRM', 2004], ['TRÅDLÖST NÄT', 2005], ['RÖRELSESENSOR', 2006], ['ONLINEBUTIK', 2008]].forEach(([n, ar], i) => {
      const y = 32 + i * 22, harDen = ar < 2007;
      panel(8, y, 108, 18, { fyll: harDen ? F.panel2 : F.panel, block: false });
      text(n, 14, y + 4, harDen ? F.text : F.dim); text(String(ar), 14, y + 11, harDen ? F.gron2 : F.dim2);
      UI.ikon(harDen ? 'bock' : 'las', 104, y + 6, harDen ? F.gron : F.dim2);
      if (i < 3) rect(116, y + 9, 12, 1, F.guld2);
    });
    // stora noden
    panel(128, 24, 248, 184, { kant: F.guld2, block: false });
    textB('TELEFONAVDELNINGEN', 138, 32, F.guld); text('FRÅN 1 JAN 2007 · 300 FP + 2 000 000 KR', 138, 44, F.text);
    text('KRÄVER', 138, 56, F.dim);
    [['FICKKONSOL', 1], ['PEKSKÄRM', 1], ['TRÅDLÖST NÄT', 1]].forEach(([n], i) => { UI.ikon('bock', 138 + i * 76, 64, F.gron); text(n, 148 + i * 76, 65, F.gron2); });
    text('LÅSER UPP', 138, 80, F.dim);
    stycke('TELEFONER I DESIGNERN · FLIKEN MOBIL MED 144 TEKNIKER · SEDAN PRYLARNA ÅR FÖR ÅR', 138, 88, 230, F.text);
    PRYLAR.forEach(([typ, namn, ar, kort], i) => { const X = 140 + i * 38; pryl(typ, X, 104, false); text(kort, X + 9, 130, F.dim, { just: 'c' }); text(String(ar), X + 9, 137, F.guld2, { just: 'c' }); });
    const p = Math.max(0, Math.min(1, (fas - 1.5) / 4));
    if (fas < 1.5) knapp(138, 180, 120, 16, 'STARTA FORSKNING', { stil: 'gron', klick: () => {}, aktiv: fas > 0.9 });
    else { text('FORSKAS · ' + Math.round(p * 100) + ' %', 138, 176, F.text); matare(138, 184, 228, 6, p, F.bla2, { segment: 12 }); text('FORSKARNA KAN VÄLJA: NÄSTA KONSOL ELLER TELEFONERNA', 138, 196, F.dim); }
  } else {
    // MOBIL-fliken är öppen: telefonen nu, prylarna låses upp år för år
    textB('UPPLÅST! NU KAN NI GÖRA TELEFONER', 192, 28, F.guld, { just: 'c' });
    text('ENHETEN TELEFON FINNS I DESIGNERN, OCH MOBILFORSKNINGEN HAR ÖPPNAT', 192, 42, F.dim, { just: 'c' });
    PRYLAR.forEach(([typ, namn, ar], i) => {
      const X = 18 + i * 60, last = i > 0;
      panel(X, 56, 52, 84, { fyll: last ? F.panel : F.panel2, kant: last ? null : F.guld2, block: false });
      pryl(typ, X + 17, 66, last); text(namn, X + 26, 96, last ? F.dim : F.text, { just: 'c' }); text(String(ar), X + 26, 105, last ? F.dim2 : F.guld2, { just: 'c' });
      text(last ? 'FORSKA' : 'KLAR', X + 26, 124, last ? F.dim2 : F.gron2, { just: 'c' });
    });
    panel(18, 150, 348, 54, { block: false });
    text('TEKNIK SOM HJÄLPER BÅDA', 26, 157, F.guld2);
    text('PEKSKÄRM GER TELEFONER · ONLINEBUTIK GER APP-BUTIKEN · MOBILCHIP GER', 26, 169, F.text);
    text('BILLIGARE FICKKONSOLER · AR GER FICKMONSTER GÅ · 5G GER MOLNSPEL', 26, 181, F.text);
    text('SAMMA FORSKARE, SAMMA KASSA – NI VÄLJER VAD SOM FORSKAS FÖRST', 26, 194, F.dim);
    for (let i = 0; i < 26; i++) { const a = i * 0.9, r = ((fas - 6) * 60 + i * 7) % 120; rect(192 + Math.cos(a) * r, 30 + Math.sin(a) * r * 0.5, 2, 2, [F.guld, F.rosa, F.cyan, F.gron2][i % 4]); }
  }
}

// ---------- app-butiken: mobilspelen i telefonramar ----------
function appar(el) {
  const ut = [];
  for (const id of ['godiskross', 'tunnelbana', 'argafaglar']) {
    const g = GLIMT[id]; if (!g) continue;
    const fig = document.createElement('figure'), stad = g.w < g.h;
    fig.className = 'app ' + (stad ? 'stad' : 'ligg');
    const c = document.createElement('canvas'), k = stad ? 2 : 2; c.width = g.w * k; c.height = g.h * k;
    const cap = document.createElement('figcaption'); cap.innerHTML = `<b>${g.titel}</b><span>${g.forebild} · ${g.ar} · ${g.studio}</span>`;
    const telefon = document.createElement('div'); telefon.className = 'telram'; telefon.append(c);
    fig.append(telefon, cap); el.append(fig);
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    ut.push({ el: c, steg(t) { x.drawImage(glimtBild(id, t), 0, 0, c.width, c.height); } });
  }
  return ut;
}

// ---------- start: rita bara det som syns ----------
const levande = [];
for (const [id, f] of [['bild-bygget', bygget], ['bild-pitch', pitch], ['bild-reklam', reklam], ['bild-forskning', forskning]]) { const y = yta(id, f); if (y) levande.push(y); }
const gal = document.getElementById('bild-glimtar'); if (gal) levande.push(...galleri(gal));
const app = document.getElementById('bild-appar'); if (app) levande.push(...appar(app));
const tl = document.getElementById('bild-tidslinje'); if (tl) tidslinje(tl);
const synlig = new Set();
const io = 'IntersectionObserver' in window ? new IntersectionObserver((e) => e.forEach((v) => (v.isIntersecting ? synlig.add(v.target) : synlig.delete(v.target))), { rootMargin: '100px' }) : null;
levande.forEach((l) => (io ? io.observe(l.el) : synlig.add(l.el)));
const t0 = performance.now();
levande.forEach((l) => l.steg(1.2));   // första bilden direkt, även för skärmbilder
(function loop() {
  const t = (performance.now() - t0) / 1000 + 1.2;
  for (const l of levande) if (synlig.has(l.el)) l.steg(t);
  requestAnimationFrame(loop);
})();
window.__klar = true;
