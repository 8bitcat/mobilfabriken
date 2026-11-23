// Det som dyker upp ovanpå scenerna: toasts (små rutor), banner (rad under HUD:en), stora kort
// (bygget klart, nytt kontor, nödlån, nyårsrapport, mål klart) och konfetti.
// Konsolspelet: en studio knackar på ('studio') och ett spel släpps ('spelslapp') – stora kort med spelet på en tv.
import { U, F, rect, ram, text, textB, panel, papper, knapp, stycke, morkna, ikon, tw, kapa, radbryt, ljusa, markera, stjarnor, W, H, BIG } from './ui.js';
import { kr, dec, arAv } from '../sim/bas.js';
import * as Vy3d from '../telefon/vy3d.js';
import { tvTyp, tvKant, tvSkarm, tvMedGlimt } from '../scener/reklam.js';
import { spelAv, studioAv } from '../data/konsol-varld.js';

const N = { toasts: [], banner: null, stora: [], konfetti: [], mal: [] };
const FARG = { gron: F.gron, rod: F.rod, bla: F.bla, lila: F.lila, guld: F.guld2, orange: F.orange };
const TOAST_W = 200;

export function ta(h, A) {
  switch (h.typ) {
    case 'toast': N.toasts.push({ text: h.text, farg: FARG[h.farg] ?? F.bla, t: 0 }); if (N.toasts.length > 4) N.toasts.shift(); break;
    case 'banner': N.banner = { text: h.text, farg: FARG[h.farg] ?? F.bla, t: 0 }; break;
    case 'stor': N.stora.push({ ...h }); break;
    case 'mal': N.mal.push({ nr: h.nr, text: h.text, belopp: h.belopp, t: 0 }); break;
    case 'nyar': N.stora.push({ typ: 'nyar', ar: h.ar }); break;
    // konsolspelet: studions förfrågan och ett spelsläpp (ett ★★★★–★★★★★-spel får konfetti)
    case 'studio': N.stora.push({ ...h }); break;
    case 'spelslapp': N.stora.push({ ...h }); if ((A?.G?.k?.spel.find((s) => s.id === h.spel)?.stj || 0) >= 4) konfetti(); break;
    default: return false;
  }
  senastA = A || senastA;
  if (h.konfetti) konfetti();
  return true;
}
// Under reklamfilmen (och konsolspelets lanseringsshow) väntar de stora korten: de ligger kvar i kön men ritas
// inte och stoppar varken tiden eller 3D-fönstret förrän filmen är slut.
let senastA = null;
const vilar = () => !!senastA && (senastA.scenNamn === 'reklam' || (senastA.G?.lage === 'konsol' && senastA.scenNamn === 'show'));
export function konfetti(n = 70) {
  const c = [F.guld, F.rod2, F.bla2, F.gron2, F.lila2, F.cyan, 0xffffff];
  for (let i = 0; i < n; i++) N.konfetti.push({ x: Math.random() * W, y: -Math.random() * 60, vx: (Math.random() - 0.5) * 30, vy: 20 + Math.random() * 40, c: c[i % c.length], t: 0 });
}
export const storOppen = () => N.stora.length > 0 && !vilar();
export const toastLista = () => N.toasts;

export function rita(A, dt) {
  senastA = A;
  // konfetti
  for (const k of N.konfetti) { k.t += dt; k.x += k.vx * dt; k.y += k.vy * dt; k.vx *= 0.99; rect(Math.round(k.x), Math.round(k.y), 2, 1 + (Math.floor(k.t * 8) % 2), k.c); }
  N.konfetti = N.konfetti.filter((k) => k.y < H + 4 && k.t < 6);
  // banner under HUD:en
  if (N.banner) {
    const b = N.banner; b.t += dt;
    const y = 15 + (b.t < 0.2 ? Math.round((b.t / 0.2 - 1) * 12) : 0);
    rect(0, y, W, 11, b.farg); rect(0, y, W, 1, ljusa(b.farg, 0.35)); rect(0, y + 11, W, 1, F.skugga);
    Vy3d.skymma({ x: 0, y, w: W, h: 12 });
    text(kapa(b.text, W - 8), W / 2, y + 3, F.text, { just: 'c' });
    if (b.t > 4.5) N.banner = null;
  }
  // toasts uppe till höger (långa texter bryts på två rader i stället för att rinna ut ur rutan),
  // under Mios ruta om den står uppe till höger (forskningen)
  const mio = A.mioRuta;
  let ty = mio && mio.x + mio.w > W - TOAST_W - 4 && mio.y < 80 ? Math.max(28, mio.y + mio.h + 2) : 28;
  for (const t of N.toasts) {
    t.t += dt;
    const delar = tw(t.text) + 12 > TOAST_W ? radbryt(t.text, TOAST_W - 12) : [t.text];
    const rader = delar.length > 1 ? [kapa(delar[0], TOAST_W - 12), kapa(delar.slice(1).join(' '), TOAST_W - 12)] : [kapa(delar[0], TOAST_W - 12)];
    const w = Math.min(TOAST_W, Math.max(...rader.map((r) => tw(r))) + 12), h = 4 + rader.length * 7;
    const x = W - w - 4 + (t.t < 0.15 ? Math.round((1 - t.t / 0.15) * 30) : 0);
    panel(x, ty, w, h, { fyll: F.panel2, block: false }); rect(x, ty, 2, h, t.farg);
    Vy3d.skymma({ x, y: ty, w: w + 2, h: h + 2 });
    rader.forEach((r, i) => text(r, x + 6, ty + 3 + i * 7, F.text));
    ty += h + 2;
  }
  N.toasts = N.toasts.filter((t) => t.t < 3.2);
  // mål klart: en papperslapp som glider in nere i mitten och försvinner av sig själv. Står Mios ruta där
  // (handledningen, A.mioRuta) lägger sig lappen bredvid den i stället för över hennes text.
  const m = N.mal[0];
  if (m) {
    m.t += dt;
    let w = 210, x = (W - w) / 2;
    const r = A.mioRuta, ly = 168;
    if (r && x < r.x + r.w && r.x < x + w + 2 && ly < r.y + r.h && r.y < ly + 28) {
      if (r.x + r.w / 2 < W / 2) { x = r.x + r.w + 2; w = Math.min(w, W - 2 - x); } else { w = Math.min(w, r.x - 4); x = r.x - w - 2; }
    }
    const y = ly + (m.t < 0.25 ? Math.round((1 - m.t / 0.25) * 40) : m.t > 3.2 ? Math.round((m.t - 3.2) / 0.3 * 40) : 0);
    rect(x + 2, y + 2, w, 26, F.skugga); rect(x, y, w, 26, F.papper); ram(x, y, w, 26, 0xb9ad94); rect(x, y, 4, 26, F.guld2);
    Vy3d.skymma({ x, y, w: w + 2, h: 28 });
    text(`MÅL ${m.nr} AV 28 KLART!`, x + 9, y + 4, 0x9e1b22); text('+' + kr(m.belopp), x + w - 6, y + 4, 0x2f8f46, { just: 'h' });
    textB(m.text, x + 9, y + 13, F.blak);
    if (m.t > 3.5) N.mal.shift();
  }
  // stora kort (ett i taget, tiden står still medan de visas)
  const s = N.stora[0]; if (!s || vilar()) return;
  morkna(0, 0, W, H, 0.55);
  hitBlock();
  if (s.typ === 'nyar') return nyarsKort(A, s);
  if (s.typ === 'mal') return malKort(A, s);
  if (s.typ === 'studio') return studioKort(A, s);
  if (s.typ === 'spelslapp') return slappKort(A, s);
  const w = 220, rader = radbryt(s.text || '', w - 20), h = 44 + rader.length * 7;
  const x = (W - w) / 2, y = (H - h) / 2;
  panel(x, y, w, h, { fyll: F.panel });
  textB(s.rubrik || '', W / 2, y + 8, F.guld, { just: 'c' });
  rader.forEach((r, i) => text(r, W / 2, y + 20 + i * 7, F.dim, { just: 'c' }));
  const by = y + h - 16;
  if (s.knapp === 'lansera') {
    knapp(x + 10, by, 96, 11, 'SENARE', { stil: 'morkt', klick: () => stang(A), namn: 'stor-senare' });
    knapp(x + w - 106, by, 96, 11, 'TILL LANSERINGEN', { stil: 'gron', klick: () => { stang(A); A.go('lansering', { projekt: s.projekt }); }, namn: 'stor-lansera' });
  } else knapp(x + w / 2 - 40, by, 80, 11, 'OK', { stil: 'bla', klick: () => stang(A), namn: 'stor-ok' });
}
function hitBlock() { U.hits.push({ x: 0, y: 0, w: W, h: H, block: true }); }
// kortet stängs. Pausade loopen spelet för att något hände (autopaus, A.autopausad i main.js) går tiden
// igen när sista kortet är läst – annars står spelet tyst stilla efter OK och barnet förstår inte varför.
// Har barnet själv pausat eller bytt fart sedan dess rörs tiden inte.
function stang(A) {
  N.stora.shift(); A.ljud('klick');
  if (!N.stora.length && A.autopausad) { A.autopausad = false; A.spelaTid(); }
}
function malKort(A, s) {
  const w = 190, h = 74, x = (W - w) / 2, y = (H - h) / 2 - 6;
  papper(x, y, w, h);
  text(s.rubrik, W / 2, y + 7, 0x9e1b22, { just: 'c' });
  stycke(s.text, x + 12, y + 18, w - 24, F.blak, { F: BIG, just: undefined });
  text('BELÖNING', x + 12, y + 46, 0x7a7470); textB(kr(s.belopp), x + 12, y + 53, 0x2f8f46);
  knapp(x + w - 62, y + h - 18, 52, 12, 'HURRA!', { stil: 'gron', klick: () => stang(A) });
}
// ---------- konsolspelet ----------
const konsolNamn = (G, id) => G.produkter.find((p) => p.id === id)?.namn || G.projekt.find((p) => p.id === id)?.design.namn || 'DIN KONSOL';
// spelet på en liten tv (tv:n följer eran) i rutan (x, y, 86 × 66)
function kortTv(A, x, y, id, titel, studio) {
  const typ = tvTyp(arAv(A.G.dag)), k = tvKant(typ), s = tvSkarm(typ, typ === 'platt' ? 72 : 64);
  const sx = x + Math.floor((86 - (s.w + k.l + k.r)) / 2) + k.l, sy = y + Math.floor((66 - (s.h + k.t + k.b + k.fot)) / 2) + k.t;
  tvMedGlimt(typ, sx, sy, s.w, s.h, id, titel, studio, U.t);
}
// titeln stort om den ryms, annars i det lilla typsnittet
const titelRad = (s, x, y, w, c = F.text) => { if (tw(s, BIG) <= w) textB(s, x, y, c); else text(kapa(s, w), x, y + 1, c); };
// alla kort av en sort stängs på en gång (SE FÖRFRÅGAN visar alla förfrågningar i STUDIOS)
function stangTyp(A, typ) {
  N.stora = N.stora.filter((x) => x.typ !== typ); A.ljud('klick');
  if (!N.stora.length && A.autopausad) { A.autopausad = false; A.spelaTid(); }
}
// En studio knackar på: spelet på tv:n, studion, konsolen och utvecklingskitet. SE FÖRFRÅGAN → STUDIOS.
// SENARE stänger kortet (det heter också stor-ok: robotarna stänger alla kort med den).
function studioKort(A, s) {
  const G = A.G, f = G.k?.forfragningar.find((x) => x.id === s.forfragan), sp = f && spelAv(f.spel);
  const w = 272, h = sp ? 112 : 44 + radbryt(s.text || '', w - 20).length * 7, x = (W - w) / 2, y = Math.round((H - h) / 2);
  panel(x, y, w, h, { fyll: F.panel, kant: F.lila2 });
  textB(kapa(s.rubrik || 'EN STUDIO KNACKAR PÅ!', w - 16, BIG), W / 2, y + 7, F.guld, { just: 'c' });
  if (sp) {
    const st = studioAv(sp.studio), ix = x + 100, iw = w - 108, dagar = Math.max(0, f.slutDag - G.dag);
    kortTv(A, x + 8, y + 20, sp.id, sp.titel, st.namn);
    titelRad(sp.titel, ix, y + 22, iw);
    stjarnor(ix, y + 32, sp.stj); text(kapa(st.namn, iw - 40), ix + 40, y + 33, F.lila2);
    text(f.lanseringsspel ? 'VILL GÖRA ETT LANSERINGSSPEL TILL' : 'VILL GÖRA SPELET TILL', ix, y + 43, F.dim);
    text(kapa(konsolNamn(G, f.konsol), iw), ix, y + 51, F.text);
    text('UTVECKLINGSKIT', ix, y + 62, F.dim); text('+' + kr(f.devkit), ix + iw, y + 62, F.gron2, { just: 'h' });
    text(dagar <= 0 ? 'SISTA DAGEN ATT SVARA!' : dagar === 1 ? 'SVARA INOM 1 DAG' : `SVARA INOM ${dagar} DAGAR`, ix, y + 71, dagar <= 1 ? F.orange2 : F.dim);
    text('SVARAR DU INTE GÅR SPELET TILL EN RIVAL.', W / 2, y + 89, F.dim2, { just: 'c' });
  } else radbryt(s.text || '', w - 20).forEach((r, i) => text(r, W / 2, y + 20 + i * 7, F.dim, { just: 'c' }));
  const by = y + h - 16;
  knapp(x + 10, by, 96, 11, 'SENARE', { stil: 'morkt', klick: () => stang(A), namn: 'stor-senare' });
  markera('stor-ok', x + 10, by, 96, 11);
  knapp(x + w - 106, by, 96, 11, 'SE FÖRFRÅGAN', { stil: 'gron', klick: () => { stangTyp(A, 'studio'); A.go('studios', { flik: 'forfragningar' }); }, namn: 'stor-forfragan' });
}
// Ett spel är ute: spelet på tv:n, stjärnorna, konsolen och vad det ger. SE REKLAMFILMEN spelar filmen och
// går sedan tillbaka till scenen man var på.
function slappKort(A, s) {
  const G = A.G, sp = G.k?.spel.find((x) => x.id === s.spel), w = 264, h = 108, x = (W - w) / 2, y = Math.round((H - h) / 2);
  const titel = sp?.titel || s.titel || '', stj = sp?.stj || 0, studio = sp ? (sp.egen ? G.bolag.namn : studioAv(sp.studio).namn) : '';
  panel(x, y, w, h, { fyll: F.panel, kant: F.guld2 });
  textB(kapa(s.rubrik || `${titel} ÄR UTE!`, w - 16, BIG), W / 2, y + 7, F.guld, { just: 'c' });
  kortTv(A, x + 8, y + 20, s.glimt, titel, studio);
  const ix = x + 100, iw = w - 108;
  titelRad(titel, ix, y + 22, iw);
  stjarnor(ix, y + 32, stj); text(kapa(sp?.egen ? 'DITT EGET SPEL' : studio, iw - 40), ix + 40, y + 33, sp?.egen ? F.gron2 : F.lila2);
  text('NU TILL', ix, y + 43, F.dim); text(kapa(konsolNamn(G, s.konsol ?? sp?.konsol), iw - 32), ix + 32, y + 43, F.text);
  if (sp?.egen) stycke('HELA INTÄKTEN ÄR DIN, MINUS TILLVERKNINGEN.', ix, y + 53, iw, F.gron2);
  else if (sp) stycke(`DU FÅR ${Math.round((sp.licens || 0) * 100)} % AV VARJE SÅLT SPEL.${sp.exklusiv ? ' BARA HOS DIG!' : ''}`, ix, y + 53, iw, F.gron2);
  text('FLER KÖPER KONSOLEN NÄR', ix, y + 70, F.dim); text('BIBLIOTEKET VÄXER.', ix, y + 77, F.dim);
  const by = y + h - 16, tillbaka = ['show', 'lansering', 'reklam', 'start'].includes(A.scenNamn) ? 'kontor' : A.scenNamn;
  knapp(x + 10, by, 80, 11, 'OK', { stil: 'bla', klick: () => stang(A), namn: 'stor-ok' });
  knapp(x + w - 118, by, 108, 11, 'SE REKLAMFILMEN', { stil: 'lila', namn: 'stor-reklam', klick: () => {
    stang(A); A.go('reklam', { spel: s.spel, glimt: s.glimt, titel: s.titel, konsol: s.konsol, tillbaka });
  } });
}
function nyarsKort(A, s) {
  const r = A.G.flaggor.nyarsrapport || {};
  const w = 250, h = 118, x = (W - w) / 2, y = (H - h) / 2;
  panel(x, y, w, h, { fyll: 0x10142a, kant: F.guld2 });
  // fyrverkeri
  const t = U.t;
  for (let i = 0; i < 5; i++) {
    const cx = x + 30 + i * 48, cy = y + 18 + (i % 2) * 6, fas = (t * 0.8 + i * 0.37) % 1, rad = fas * 14;
    const c = [F.guld, F.rod2, F.bla2, F.gron2, F.lila2][i];
    for (let a = 0; a < 8; a++) { const v = a * Math.PI / 4; rect(Math.round(cx + Math.cos(v) * rad), Math.round(cy + Math.sin(v) * rad * 0.8), 1, 1, fas < 0.85 ? c : F.dim2); }
  }
  textB(`GOTT NYTT ${s.ar}!`, W / 2, y + 36, F.guld, { just: 'c', skugga: F.skugga });
  text(`ÅRSRAPPORT ${r.ar ?? s.ar - 1}`, W / 2, y + 48, F.dim, { just: 'c' });
  const rad = (e, v, c, yy) => { text(e, x + 30, yy, F.dim); text(v, x + w - 30, yy, c, { just: 'h' }); };
  rad('INTÄKTER', kr(r.intakt || 0), F.text, y + 60);
  rad('KOSTNADER', kr(-(r.kostnad || 0)), F.text, y + 68);
  rad('ÅRETS RESULTAT', kr(r.vinst || 0), (r.vinst || 0) >= 0 ? F.gron2 : F.rod2, y + 78);
  // konsolspelet: årets bästa lansering är en konsol (eller, med telefonavdelningen, en konsol eller en telefon)
  const basta = A.G.lage !== 'konsol' ? 'ÅRETS TELEFON' : A.G.flaggor.mobil ? 'ÅRETS BÄSTA PRYL' : 'ÅRETS KONSOL';
  rad(basta, r.basta ? `${r.basta.namn} (${dec(r.basta.betyg)})` : '-', F.guld, y + 88);
  // 2027: säljknappen har låsts upp (BOLAGET > SÄLJ BOLAGET) – det viktigare beskedet tar kritikerraden
  if (r.salj) text('NU KAN DU SÄLJA BOLAGET (BOLAGET > SÄLJ BOLAGET)', W / 2, y + 98, F.guld, { just: 'c' });
  else text(`KRITIKERNA HÖJER KRAVEN: SNITTET ÄR ${dec(r.snitt || 6.2)}`, W / 2, y + 98, F.bla2, { just: 'c' });
  knapp(x + w / 2 - 34, y + h - 14, 68, 11, 'NYTT ÅR!', { stil: 'guld', klick: () => stang(A), namn: 'stor-ok' });
}
export function rensa() { N.toasts = []; N.banner = null; N.stora = []; N.konfetti = []; N.mal = []; }
