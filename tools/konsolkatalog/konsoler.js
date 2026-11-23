// Konsolkatalogen: konsolformerna i samma 3D-studio som telefonerna. Buntas av tools/konsolkatalog/bygg.mjs.
import { skapaTelefonGL, YTOR } from '../../js/telefon/telefon-gl.js';
import { KONSOLFORMER } from '../../js/konsol/konsol-gl.js';
import { GLIMT, glimtBild } from '../../js/konsol/glimtar.js';

const FARGER = [null, '#ebebee', '#17151a', '#b8bcc8', '#3a7bd5', '#c9323a', '#2f8f46', '#e8b230', '#f0b4c8', '#8e5bd1', '#2aa39a', '#e07a2e', '#1d2a44'];
const FARGNAMN = ['ORIGINAL', 'VIT', 'SVART', 'SILVER', 'BLÅ', 'RÖD', 'GRÖN', 'GUL', 'ROSA', 'LILA', 'TURKOS', 'ORANGE', 'MARINBLÅ'];
const ZOOM = { 'konsol-ficka': 1.15, 'konsol-gbc': 1.2, 'konsol-ds': 1.1 };
const ERA = [['ALLA', 0, 9999], ['70- OCH 80-TALET', 0, 1989], ['90-TALET', 1990, 1999], ['2000-TALET', 2000, 2009], ['2010-TALET', 2010, 2019], ['2020-TALET', 2020, 9999]];
const $ = (s) => document.querySelector(s);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

const lage = { enhet: 'konsol-lada', farg: null, yta: 'klassisk', vy: 'auto' };
try { const sp = JSON.parse(localStorage.getItem('mobilfabriken.konsolkatalog') || 'null'); if (sp && KONSOLFORMER.some((f) => f.id === sp.enhet)) Object.assign(lage, sp); } catch { /* ingen lagring */ }
const spara = () => { try { localStorage.setItem('mobilfabriken.konsolkatalog', JSON.stringify({ enhet: lage.enhet, farg: lage.farg, yta: lage.yta })); } catch { /* ingen lagring */ } };
const telFor = (id) => ({ enhet: id, kropp: lage.farg || undefined, yta: lage.yta, bredd: 1, hojd: 1, djup: 0.3 });

function start() {
  if (!window.THREE) { $('#fel').hidden = false; $('#fel').textContent = 'Kunde inte ladda 3D-biblioteket (three.js). Ladda om sidan.'; return; }
  const duk = $('#duk');
  let s;
  try { s = skapaTelefonGL(duk, { tel: telFor(lage.enhet), vy: 'auto', yaw: 0.5, pitch: 0.28 }); } catch { $('#fel').hidden = false; $('#fel').textContent = 'Din webbläsare kan inte visa 3D (WebGL saknas).'; return; }
  s.fart = 0.45; s.pitch = 0.28;

  // ---- årtiondena (filter) ----
  const eraRad = $('#eror');
  ERA.forEach(([namn, fran, till], i) => {
    const b = el('button', 'chip', namn); b.type = 'button'; b.setAttribute('aria-pressed', String(i === 0));
    b.addEventListener('click', () => {
      for (const x of eraRad.children) x.setAttribute('aria-pressed', String(x === b));
      for (const f of KONSOLFORMER) kort[f.id].b.hidden = f.ar < fran || f.ar > till;
      lista.scrollTo({ left: 0, behavior: 'smooth' });
    });
    eraRad.append(b);
  });
  $('#antal').textContent = String(KONSOLFORMER.length);

  // ---- korten med tumnaglar ----
  const lista = $('#val'), kort = {};
  for (const f of KONSOLFORMER) {
    const b = el('button', 'kort'); b.type = 'button'; b.dataset.id = f.id;
    const bild = el('div', 'tumme'), img = el('img'); img.alt = ''; img.hidden = true; bild.append(img);
    b.append(bild, el('span', 'namn', f.namn), el('span', 'ar', `${f.ar} · SOM ${f.forebild.toUpperCase()}`));
    b.addEventListener('click', () => valj(f.id));
    lista.append(b); kort[f.id] = { b, img };
  }
  const tumDuk = document.createElement('canvas'); tumDuk.style.cssText = 'position:absolute;left:-9999px;width:400px;height:300px'; document.body.append(tumDuk);
  let tum = null, tumKo = [], tumTimer = 0;
  const ritaTummar = () => { clearTimeout(tumTimer); tumTimer = setTimeout(() => { tumKo = KONSOLFORMER.map((f) => f.id); nastaTumme(); }, 250); };
  const nastaTumme = () => {
    const id = tumKo.shift(); if (!id) return;
    try {
      if (!tum) tum = skapaTelefonGL(tumDuk, { tel: telFor(id), vy: 'manuell', yaw: 0.55, pitch: 0.3 });
      tum.tel = telFor(id); tum.vy = 'manuell'; tum.yaw = 0.55; tum.pitch = 0.3; tum.zoom = (ZOOM[id] || 1) * 1.12; tum.oppning = undefined;
      tum.rita();
      kort[id].img.src = tumDuk.toDataURL('image/png'); kort[id].img.hidden = false;
    } catch { /* tumnageln får vara tom */ }
    requestAnimationFrame(() => setTimeout(nastaTumme, 0));
  };

  // ---- färg och yta ----
  const fargRad = $('#farger');
  FARGER.forEach((f, i) => {
    const b = el('button', 'farg' + (f ? '' : ' original')); b.type = 'button'; if (f) b.style.setProperty('--f', f); b.title = FARGNAMN[i]; b.setAttribute('aria-label', FARGNAMN[i]); b.dataset.i = i;
    b.addEventListener('click', () => { lage.farg = f; uppdatera(); ritaTummar(); });
    fargRad.append(b);
  });
  const ytRad = $('#ytor');
  for (const [id, namn] of YTOR) { const b = el('button', 'chip', namn); b.type = 'button'; b.dataset.id = id; b.addEventListener('click', () => { lage.yta = id; uppdatera(); ritaTummar(); }); ytRad.append(b); }

  // ---- vyer och dra för att snurra ----
  const VINK = { fram: 0, bak: Math.PI, sida: Math.PI / 2 };
  const markera = (vy) => { for (const b of document.querySelectorAll('[data-vy]')) b.setAttribute('aria-pressed', String(b.dataset.vy === vy)); };
  const satVy = (vy) => {
    if (vy === 'auto') s._spin = s.vy === 'auto' ? s._spin : s.vy === 'manuell' ? s.yaw : (VINK[s.vy] ?? 0.5);
    lage.vy = vy; s.vy = vy; if (vy === 'auto') s.pitch = 0.28; markera(vy);
  };
  for (const b of document.querySelectorAll('[data-vy]')) b.addEventListener('click', () => satVy(b.dataset.vy));
  let drag = null, aterTimer = 0;
  duk.addEventListener('pointerdown', (ev) => {
    const a = s.vy === 'auto' ? s._spin : s.vy === 'manuell' ? s.yaw : (VINK[s.vy] ?? 0);
    drag = { x: ev.clientX, y: ev.clientY, yaw: a, pitch: s.pitch, forra: lage.vy };
    s.yaw = a; s.vy = 'manuell'; clearTimeout(aterTimer); duk.setPointerCapture(ev.pointerId); duk.classList.add('drar');
  });
  duk.addEventListener('pointermove', (ev) => { if (!drag) return; s.yaw = drag.yaw + (ev.clientX - drag.x) * 0.012; s.pitch = Math.max(-0.2, Math.min(1.1, drag.pitch + (ev.clientY - drag.y) * 0.006)); });
  const slapp = () => {
    if (!drag) return; const forra = drag.forra; drag = null; duk.classList.remove('drar'); markera(null);
    if (forra === 'auto') aterTimer = setTimeout(() => { if (s.vy === 'manuell') { s._spin = s.yaw; s.vy = 'auto'; lage.vy = 'auto'; markera('auto'); } }, 1600);
    else lage.vy = 'manuell';
  };
  duk.addEventListener('pointerup', slapp); duk.addEventListener('pointercancel', slapp);

  // ---- öppna ----
  const reglage = $('#oppna'), reglageRad = $('#oppnaRad'), reglageNamn = $('#oppnaNamn');
  reglage.addEventListener('input', () => { s.oppning = reglage.value / 100; });

  // ---- glimten från eran ----
  const gd = $('#glimt'), gx = gd.getContext('2d'); gx.imageSmoothingEnabled = false;
  let glimtId = null;
  const ritaGlimt = (t) => { if (!glimtId) return; const g = GLIMT[glimtId], k = Math.floor(Math.min(gd.width / g.w, gd.height / g.h)); gx.fillStyle = '#000'; gx.fillRect(0, 0, gd.width, gd.height); gx.drawImage(glimtBild(glimtId, t), Math.round((gd.width - g.w * k) / 2), Math.round((gd.height - g.h * k) / 2), g.w * k, g.h * k); };
  s.onFrame = () => ritaGlimt(performance.now() / 1000);

  function valj(id) { lage.enhet = id; uppdatera(); kort[id].b.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }); }
  function uppdatera() {
    const f = KONSOLFORMER.find((x) => x.id === lage.enhet);
    s.tel = telFor(f.id); s.zoom = ZOOM[f.id] || 1;
    reglageRad.hidden = !f.oppna;
    if (f.oppna) { reglageNamn.textContent = f.oppna[0]; reglage.value = Math.round(f.oppna[1] * 100); s.oppning = f.oppna[1]; } else s.oppning = undefined;
    for (const [id, k] of Object.entries(kort)) k.b.setAttribute('aria-pressed', String(id === f.id));
    for (const b of fargRad.children) b.setAttribute('aria-pressed', String(FARGER[+b.dataset.i] === lage.farg));
    for (const b of ytRad.children) b.setAttribute('aria-pressed', String(b.dataset.id === lage.yta));
    $('#iNamn').textContent = f.namn; $('#iRad').textContent = `${f.ar} · SOM ${f.forebild.toUpperCase()}`; $('#iOm').textContent = f.info;
    glimtId = f.glimt && GLIMT[f.glimt] ? f.glimt : null;
    $('#glimtRuta').hidden = !glimtId; $('#ingenGlimt').hidden = !!glimtId;
    if (glimtId) { const g = GLIMT[glimtId]; $('#glimtText').textContent = `${g.titel} (${g.ar}) – ${g.forebild}`; }
    spara();
  }

  uppdatera(); satVy(lage.vy === 'manuell' ? 'auto' : lage.vy);
  s.start(); ritaTummar();
  $('#fel').hidden = true;
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
