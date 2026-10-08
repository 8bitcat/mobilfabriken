// Det som dyker upp ovanpå scenerna: toasts (små rutor), banner (rad under HUD:en), stora kort
// (bygget klart, nytt kontor, nödlån, nyårsrapport, mål klart) och konfetti.
import { U, F, rect, ram, text, textB, panel, papper, knapp, stycke, morkna, ikon, tw, radbryt, ljusa, W, H, BIG } from './ui.js';
import { kr, dec } from '../sim/bas.js';

const N = { toasts: [], banner: null, stora: [], konfetti: [], mal: [] };
const FARG = { gron: F.gron, rod: F.rod, bla: F.bla, lila: F.lila, guld: F.guld2, orange: F.orange };

export function ta(h, A) {
  switch (h.typ) {
    case 'toast': N.toasts.push({ text: h.text, farg: FARG[h.farg] ?? F.bla, t: 0 }); if (N.toasts.length > 4) N.toasts.shift(); break;
    case 'banner': N.banner = { text: h.text, farg: FARG[h.farg] ?? F.bla, t: 0 }; break;
    case 'stor': N.stora.push({ ...h }); break;
    case 'mal': N.mal.push({ nr: h.nr, text: h.text, belopp: h.belopp, t: 0 }); break;
    case 'nyar': N.stora.push({ typ: 'nyar', ar: h.ar }); break;
    default: return false;
  }
  if (h.konfetti) konfetti();
  return true;
}
export function konfetti(n = 70) {
  const c = [F.guld, F.rod2, F.bla2, F.gron2, F.lila2, F.cyan, 0xffffff];
  for (let i = 0; i < n; i++) N.konfetti.push({ x: Math.random() * W, y: -Math.random() * 60, vx: (Math.random() - 0.5) * 30, vy: 20 + Math.random() * 40, c: c[i % c.length], t: 0 });
}
export const storOppen = () => N.stora.length > 0;
export const toastLista = () => N.toasts;

export function rita(A, dt) {
  // konfetti
  for (const k of N.konfetti) { k.t += dt; k.x += k.vx * dt; k.y += k.vy * dt; k.vx *= 0.99; rect(Math.round(k.x), Math.round(k.y), 2, 1 + (Math.floor(k.t * 8) % 2), k.c); }
  N.konfetti = N.konfetti.filter((k) => k.y < H + 4 && k.t < 6);
  // banner under HUD:en
  if (N.banner) {
    const b = N.banner; b.t += dt;
    const y = 15 + (b.t < 0.2 ? Math.round((b.t / 0.2 - 1) * 12) : 0);
    rect(0, y, W, 11, b.farg); rect(0, y, W, 1, ljusa(b.farg, 0.35)); rect(0, y + 11, W, 1, F.skugga);
    text(b.text, W / 2, y + 3, F.text, { just: 'c' });
    if (b.t > 4.5) N.banner = null;
  }
  // toasts uppe till höger
  let ty = 28;
  for (const t of N.toasts) {
    t.t += dt;
    const w = Math.min(200, tw(t.text) + 12), x = W - w - 4 + (t.t < 0.15 ? Math.round((1 - t.t / 0.15) * 30) : 0);
    panel(x, ty, w, 11, { fyll: F.panel2, block: false }); rect(x, ty, 2, 11, t.farg);
    text(t.text, x + 6, ty + 3, F.text);
    ty += 13;
  }
  N.toasts = N.toasts.filter((t) => t.t < 3.2);
  // mål klart: en papperslapp som glider in uppe i mitten och försvinner av sig själv
  const m = N.mal[0];
  if (m) {
    m.t += dt;
    const w = 210, x = (W - w) / 2, y = 168 + (m.t < 0.25 ? Math.round((1 - m.t / 0.25) * 40) : m.t > 3.2 ? Math.round((m.t - 3.2) / 0.3 * 40) : 0);
    rect(x + 2, y + 2, w, 26, F.skugga); rect(x, y, w, 26, F.papper); ram(x, y, w, 26, 0xb9ad94); rect(x, y, 4, 26, F.guld2);
    text(`MÅL ${m.nr} AV 28 KLART!`, x + 9, y + 4, 0x9e1b22); text('+' + kr(m.belopp), x + w - 6, y + 4, 0x2f8f46, { just: 'h' });
    textB(m.text, x + 9, y + 13, F.blak);
    if (m.t > 3.5) N.mal.shift();
  }
  // stora kort (ett i taget, tiden står still medan de visas)
  const s = N.stora[0]; if (!s) return;
  morkna(0, 0, W, H, 0.55);
  hitBlock();
  if (s.typ === 'nyar') return nyarsKort(A, s);
  if (s.typ === 'mal') return malKort(A, s);
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
function stang(A) { N.stora.shift(); A.ljud('klick'); }
function malKort(A, s) {
  const w = 190, h = 74, x = (W - w) / 2, y = (H - h) / 2 - 6;
  papper(x, y, w, h);
  text(s.rubrik, W / 2, y + 7, 0x9e1b22, { just: 'c' });
  stycke(s.text, x + 12, y + 18, w - 24, F.blak, { F: BIG, just: undefined });
  text('BELÖNING', x + 12, y + 46, 0x7a7470); textB(kr(s.belopp), x + 12, y + 53, 0x2f8f46);
  knapp(x + w - 62, y + h - 18, 52, 12, 'HURRA!', { stil: 'gron', klick: () => stang(A) });
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
  rad('ÅRETS TELEFON', r.basta ? `${r.basta.namn} (${dec(r.basta.betyg)})` : '-', F.guld, y + 88);
  text(`KRITIKERNA HÖJER KRAVEN: SNITTET ÄR ${dec(r.snitt || 6.2)}`, W / 2, y + 98, F.bla2, { just: 'c' });
  knapp(x + w / 2 - 34, y + h - 14, 68, 11, 'NYTT ÅR!', { stil: 'guld', klick: () => stang(A), namn: 'stor-ok' });
}
export function rensa() { N.toasts = []; N.banner = null; N.stora = []; N.konfetti = []; N.mal = []; }
