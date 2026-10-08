// Mobilfabriken – start. En canvas i spelpixlar (384×216) som förstoras i hela steg, en rAF-loop som
// driver speltiden (1 speldag = 2 s vid 1×), scener som ritar sig själva varje bildruta och ett 3D-fönster
// för telefonen ovanpå. Allt spelläge ligger i A.G (js/sim) och sparas i localStorage.
import * as UI from './core/ui.js';
import * as Notiser from './core/notiser.js';
import * as Ljud from './core/ljud.js';
import * as Spara from './core/spara.js';
import * as Vy3d from './telefon/vy3d.js';
import { dagTick } from './sim/tick.js';
import { SCENER } from './scener/index.js';
import { ritaHandledning, handledningAktiv } from './scener/handledning.js';

export const DAG_SEK = 2;
const $ = (s) => document.querySelector(s);
const stage = $('#spel'), cv = $('#c'), ctx = cv.getContext('2d'), falt = $('#falt');
const buf = document.createElement('canvas'); buf.width = UI.W; buf.height = UI.H;
const b = buf.getContext('2d'); b.imageSmoothingEnabled = false;
Vy3d.init($('#gl'), stage);

let skala = 3, dpr = 1, ack = 0, senast = performance.now(), sparadDag = -1;

export const A = {
  G: null, scen: null, scenNamn: '', t: 0, test: new URLSearchParams(location.search).has('test'),
  go(namn, o = {}) {
    if (!SCENER[namn]) namn = 'kontor';
    A.scen?.exit?.();
    A.dolj();
    A.scenNamn = namn; A.scen = SCENER[namn](A, o); A.scen.enter?.();
    if (A.G) A.spara();
  },
  spara() { if (A.G && !A.test) Spara.spara(A.G); },
  ljud: (n) => Ljud.spela(n),
  pausa() { if (A.G && A.G.fart > 0) { A.G.fartFore = A.G.fart; A.G.fart = 0; } },
  spelaTid() { if (A.G && !A.G.fart) A.G.fart = A.G.fartFore || 1; },
  sattFart(f) { if (A.G) { A.G.fart = f; if (f) A.G.fartFore = f; } },
  tidGar: () => !!(A.G && A.scen && A.scen.tid !== false && A.G.fart > 0 && !Notiser.storOppen() && !handledningAktiv(A)),
  // textfält ovanpå spelet (bolagsnamn, telefonens namn)
  textfalt(rect, varde, klar, max = 22) {
    const k = skala / dpr;
    falt.style.display = 'block'; falt.maxLength = max;
    falt.style.left = Math.round(rect.x * k) + 'px'; falt.style.top = Math.round(rect.y * k) + 'px';
    falt.style.width = Math.round(rect.w * k) + 'px'; falt.style.height = Math.round(rect.h * k) + 'px';
    falt.style.fontSize = Math.max(16, Math.round(rect.h * k * 0.62)) + 'px';   // under 16 px zoomar iPhone in
    falt.value = varde || ''; falt.focus(); falt.select();
    A._falt = (v, slut) => klar(v.toUpperCase().replace(/[^A-ZÅÄÖÉ0-9 &.!?\-+]/g, ''), slut);
  },
  dolj() { falt.style.display = 'none'; if (A._falt) { const f = A._falt; A._falt = null; f(falt.value, true); } falt.blur(); },
  handelser: [],
};
falt.addEventListener('input', () => { if (A._falt) A._falt(falt.value, false); });
falt.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); A.dolj(); } e.stopPropagation(); });
falt.addEventListener('blur', () => setTimeout(() => { if (document.activeElement !== falt && falt.style.display !== 'none') A.dolj(); }, 50));

// ---------- skalning ----------
function fit() {
  dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth, h = window.innerHeight;
  const s = Math.min(w * dpr / UI.W, h * dpr / UI.H);
  // hela steg ger knivskarpa pixlar; mellan 1,5 och 2 hellre lite ojämna pixlar än en pytteliten bild
  skala = s >= 2 ? Math.floor(s) : s >= 1.5 ? s : Math.max(1, Math.floor(s)) || s;
  cv.width = Math.round(UI.W * skala); cv.height = Math.round(UI.H * skala);
  cv.style.width = cv.width / dpr + 'px'; cv.style.height = cv.height / dpr + 'px';
  ctx.imageSmoothingEnabled = false;
  const stående = matchMedia('(pointer: coarse)').matches && h > w && !A.staendeOk;
  $('#vand').classList.toggle('dold', !stående);
}
addEventListener('resize', fit);
$('#vand-anda').addEventListener('click', () => { A.staendeOk = true; fit(); });
fit();

// ---------- pekare ----------
const lokal = (e) => { const r = cv.getBoundingClientRect(); return [Math.floor((e.clientX - r.left) / r.width * UI.W), Math.floor((e.clientY - r.top) / r.height * UI.H)]; };
cv.addEventListener('pointerdown', (e) => {
  Ljud.lasUpp(); if (A._falt) A.dolj();
  cv.setPointerCapture(e.pointerId);
  const [x, y] = lokal(e);
  if (UI.pekareNer(x, y)) Ljud.spela('klick');
  else A.scen?.ner?.(x, y);
  e.preventDefault();
});
cv.addEventListener('pointermove', (e) => { const [x, y] = lokal(e); UI.pekareFlytta(x, y); A.scen?.flytta?.(x, y); });
cv.addEventListener('pointerup', (e) => { const [x, y] = lokal(e); UI.pekareUpp(x, y); A.scen?.upp?.(x, y); });
cv.addEventListener('pointercancel', (e) => { const [x, y] = lokal(e); UI.pekareUpp(x, y); });
cv.addEventListener('pointerleave', () => { if (!UI.U.drag) { UI.U.mus.x = -1; UI.U.mus.y = -1; } });
cv.addEventListener('wheel', (e) => { const [x, y] = lokal(e); if (UI.hjul(x, y, Math.sign(e.deltaY) * 18)) e.preventDefault(); }, { passive: false });
addEventListener('keydown', (e) => {
  if (A._falt) return;
  if (A.scen?.tangent?.(e)) { e.preventDefault(); return; }
  if (!A.G || A.scenNamn === 'start') return;
  if (e.key === ' ') { A.G.fart ? A.pausa() : A.spelaTid(); e.preventDefault(); }
  else if (['1', '2', '3', '4'].includes(e.key)) A.sattFart([1, 2, 4, 8][+e.key - 1]);
  else if (e.key === 'Escape' && A.scenNamn !== 'kontor') A.go('kontor');
});
addEventListener('pagehide', () => A.spara());
document.addEventListener('visibilitychange', () => { if (document.hidden) A.spara(); });
addEventListener('pointerdown', () => Ljud.lasUpp(), { once: true, capture: true });

// ---------- loopen ----------
function loop(nu) {
  const dt = Math.min(0.1, (nu - senast) / 1000); senast = nu; A.t += dt;
  const G = A.G;
  if (G && A.tidGar()) {
    ack += dt * G.fart / DAG_SEK;
    let n = 0;
    while (ack >= 1 && n < 8) {
      dagTick(G); ack -= 1; n++;
      if (G.flaggor.autopaus) { G.flaggor.autopaus = false; A.pausa(); ack = 0; break; }
    }
    if (G.dag - sparadDag >= 7) { sparadDag = G.dag; A.spara(); }
  } else ack = Math.min(ack, 0.99);
  if (G) {
    let i = 0;
    while (G.ko.length && i++ < 20) {
      const h = G.ko.shift();
      if (h.ljud) Ljud.spela(h.ljud);
      if (!Notiser.ta(h, A)) A.handelser.push(h);
    }
    if (A.handelser.length > 60) A.handelser.splice(0, A.handelser.length - 60);
  }
  UI.borja(b, A.t);
  b.fillStyle = '#0b0e1c'; b.fillRect(0, 0, UI.W, UI.H);
  try { A.scen?.rita(b, dt); } catch (e) { console.error(e); b.fillStyle = '#c9323a'; b.fillRect(0, 0, UI.W, 10); UI.text('FEL: ' + String(e.message).toUpperCase().slice(0, 80), 4, 2, 0xffffff); }
  if (G && A.scenNamn !== 'start') ritaHandledning(A, dt);
  Notiser.rita(A, dt);
  ctx.drawImage(buf, 0, 0, cv.width, cv.height);
  if (Notiser.storOppen() || handledningAktiv(A)) Vy3d.blockera();
  Vy3d.slutBild(skala, dpr);
  cv.style.cursor = UI.U.cursor;
  requestAnimationFrame(loop);
}

// ---------- start ----------
A.go('start');
requestAnimationFrame(loop);
window.__A = A;   // testrobotarna (tools/*.mjs) styr spelet härifrån
window.__U = UI.U;
