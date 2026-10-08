// Produktkatalogen: alla enhetstyper i samma 3D som spelets designer. Buntas av tools/bygg-produkter.mjs.
import { skapaTelefonGL, YTOR } from '../../js/telefon/telefon-gl.js';
import { ENHETER } from '../../js/data/delar.js';
import { NODER, KATEGORIER } from '../../js/data/noder.js';
// = FABRIK i js/sim/projekt.js (importeras inte: projekt.js drar med sig alla figurritningar, ~300 kB)
const FABRIK = 300_000;

// samma färger som designerns steg FÄRG (js/scener/design.js)
const FARGER = ['#ebebee', '#17151a', '#b8bcc8', '#3a7bd5', '#c9323a', '#2f8f46', '#e8b230', '#f0b4c8', '#8e5bd1', '#2aa39a', '#e07a2e', '#1d2a44'];
const FARGNAMN = ['VIT', 'SVART', 'SILVER', 'BLÅ', 'RÖD', 'GRÖN', 'GUL', 'ROSA', 'LILA', 'TURKOS', 'ORANGE', 'MARINBLÅ'];
// form per enhet: måtten är designerns (sattEnhet), ramarna en typisk modell från året den kommer
const BAS = { radie: 0.1, ram: 0.06, haka: 0.14, kameraStorlek: 0.2, kameror: 1, selfie: true, glas: '#1d2a44', kamera: '#3a6bc2', marke: 'M' };
const FORM = {
  telefon: { bredd: 0.69, hojd: 1.09, djup: 0.11 },
  platta: { bredd: 1.5, hojd: 2.0, djup: 0.08, ram: 0.09, haka: 0.16, radie: 0.12 },
  laptop: { bredd: 2.4, hojd: 1.6, djup: 0.15 },
  klocka: { bredd: 0.42, hojd: 0.5, djup: 0.11, radie: 0.08 },
  horlurar: { bredd: 0.5, hojd: 0.62, djup: 0.22 },
  vikbar: { bredd: 0.74, hojd: 1.62, djup: 0.09, ram: 0.02, haka: 0.02, radie: 0.08, kameror: 3, kameraStorlek: 0.28 },
};
const OPPNA = { laptop: ['LOCKET', 1], vikbar: ['VIK UPP', 0.84], horlurar: ['FODRALET', 0] };
const ZOOM = { klocka: 1.12, horlurar: 1.3 };
const KAT = { telefon: 'enheter', platta: 'enheter', laptop: 'laptops', klocka: 'wearables', horlurar: 'ljud', vikbar: 'kropp' };
const OM = {
  telefon: 'Bolagets första pryl. Allt annat bygger vidare på telefonens delar: skärm, chip, batteri och kamera forskas fram en gång och används sedan överallt.',
  platta: 'En telefon som vuxit. Samma delar och samma designsteg, men en stor skärm och mer plats för batteri.',
  laptop: 'Tangentbord, styrplatta och ett lock med gångjärn. Svårast att bygga bra: högst kvalitetsmål av de tidiga prylarna.',
  klocka: 'Liten och billig att sätta upp en fabrik för. Har en egen forskningsgren med klockskärmar, hälsosensorer och klockchip.',
  horlurar: 'Billigast fabrik och näst största marknaden efter telefonen. Egen forskning om ljuddrivare, brusreducering, batteri och bluetooth.',
  vikbar: 'Sista och dyraste prylen. En stor skärm som viks ihop till en telefon, med täckskärm utanpå. Gångjärnet forskas fram för sig.',
};

const kr = (n) => Math.round(n).toLocaleString('sv-SE').replace(/ /g, ' ') + ' kr';
const procent = (x) => Math.round(x * 100) + ' %';
const $ = (s) => document.querySelector(s);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

const lage = { enhet: 'klocka', farg: FARGER[0], yta: 'klassisk', vy: 'auto' };
try { const sp = JSON.parse(localStorage.getItem('mobilfabriken.katalog') || 'null'); if (sp && FORM[sp.enhet]) Object.assign(lage, sp); } catch { /* ingen lagring */ }
const spara = () => { try { localStorage.setItem('mobilfabriken.katalog', JSON.stringify({ enhet: lage.enhet, farg: lage.farg, yta: lage.yta })); } catch { /* ingen lagring */ } };
const telFor = (id) => ({ ...BAS, ...FORM[id], enhet: id, kropp: lage.farg, yta: lage.yta });

function start() {
  if (!window.THREE) { $('#fel').hidden = false; $('#fel').textContent = 'Kunde inte ladda 3D-biblioteket (three.js). Ladda om sidan.'; return; }
  const duk = $('#duk');
  let s;
  try { s = skapaTelefonGL(duk, { tel: telFor(lage.enhet), vy: 'auto', yaw: 0.5, pitch: 0.2 }); } catch (e) { $('#fel').hidden = false; $('#fel').textContent = 'Din webbläsare kan inte visa 3D (WebGL saknas).'; return; }
  s.fart = 0.55;

  // ---- kort med tumnaglar ----
  const lista = $('#val');
  const kort = {};
  for (const e of ENHETER) {
    const b = el('button', 'kort'); b.type = 'button'; b.dataset.id = e.id;
    b.style.setProperty('--kat', '#' + KATEGORIER.find((k) => k.id === KAT[e.id]).farg.toString(16).padStart(6, '0'));
    const bild = el('div', 'tumme'); const img = el('img'); img.alt = ''; img.hidden = true; bild.append(img);
    b.append(bild, el('span', 'namn', e.namn), el('span', 'ar', e.id === 'telefon' ? 'FRÅN START · 2007' : `FRÅN ${e.ar} · ${e.fp} FP`));
    b.addEventListener('click', () => valj(e.id));
    lista.append(b); kort[e.id] = { b, img };
  }
  // tumnaglarna ritas en i taget i en egen liten 3D-vy (samma färg och yta som den stora)
  const tumDuk = document.createElement('canvas'); tumDuk.width = 400; tumDuk.height = 300; tumDuk.style.cssText = 'position:absolute;left:-9999px;width:400px;height:300px';
  document.body.append(tumDuk);
  let tum = null, tumKo = [], tumTimer = 0;
  const ritaTummar = () => {
    clearTimeout(tumTimer);
    tumTimer = setTimeout(() => { tumKo = ENHETER.map((e) => e.id); nastaTumme(); }, 250);
  };
  const nastaTumme = () => {
    const id = tumKo.shift(); if (!id) return;
    try {
      if (!tum) tum = skapaTelefonGL(tumDuk, { tel: telFor(id), vy: 'manuell', yaw: 0.55, pitch: 0.24 });
      tum.tel = telFor(id); tum.vy = 'manuell'; tum.yaw = 0.55; tum.pitch = 0.24; tum.zoom = (ZOOM[id] || 1) * 1.08; tum.oppning = undefined;
      tum.rita();
      kort[id].img.src = tumDuk.toDataURL('image/png'); kort[id].img.hidden = false;
    } catch { /* tumnageln får vara tom */ }
    requestAnimationFrame(() => setTimeout(nastaTumme, 0));
  };

  // ---- färg och yta ----
  const fargRad = $('#farger');
  FARGER.forEach((f, i) => {
    const b = el('button', 'farg'); b.type = 'button'; b.style.setProperty('--f', f); b.title = FARGNAMN[i]; b.setAttribute('aria-label', FARGNAMN[i]);
    b.addEventListener('click', () => { lage.farg = f; uppdatera(); ritaTummar(); });
    fargRad.append(b);
  });
  const ytRad = $('#ytor');
  for (const [id, namn] of YTOR) {
    const b = el('button', 'chip', namn); b.type = 'button'; b.dataset.id = id;
    b.addEventListener('click', () => { lage.yta = id; uppdatera(); ritaTummar(); });
    ytRad.append(b);
  }
  // ---- vyer ----
  for (const b of document.querySelectorAll('[data-vy]')) b.addEventListener('click', () => { satVy(b.dataset.vy); });
  const satVy = (vy) => {
    if (vy === 'auto') s._spin = s.vy === 'auto' ? s._spin : s.vy === 'manuell' ? s.yaw : ({ fram: 0, bak: Math.PI, sida: Math.PI / 2 }[s.vy] ?? 0.5);
    lage.vy = vy; s.vy = vy; if (vy === 'auto') s.pitch = 0.2;
    for (const b of document.querySelectorAll('[data-vy]')) b.setAttribute('aria-pressed', String(b.dataset.vy === vy));
  };
  // dra för att snurra (släpp: fortsätter snurra efter en stund om SNURRA är valt)
  let drag = null, aterTimer = 0;
  duk.addEventListener('pointerdown', (ev) => {
    const a = s.vy === 'auto' ? s._spin : s.vy === 'manuell' ? s.yaw : ({ fram: 0, bak: Math.PI, sida: Math.PI / 2 }[s.vy] ?? 0);
    drag = { x: ev.clientX, y: ev.clientY, yaw: a, pitch: s.pitch, forra: lage.vy };
    s.yaw = a; s.vy = 'manuell'; clearTimeout(aterTimer); duk.setPointerCapture(ev.pointerId); duk.classList.add('drar');
  });
  duk.addEventListener('pointermove', (ev) => {
    if (!drag) return;
    s.yaw = drag.yaw + (ev.clientX - drag.x) * 0.012;
    s.pitch = Math.max(-0.35, Math.min(0.95, drag.pitch + (ev.clientY - drag.y) * 0.006));
  });
  const slapp = () => {
    if (!drag) return; const forra = drag.forra; drag = null; duk.classList.remove('drar');
    for (const b of document.querySelectorAll('[data-vy]')) b.setAttribute('aria-pressed', 'false');
    if (forra === 'auto') aterTimer = setTimeout(() => { if (s.vy === 'manuell') { s._spin = s.yaw; s.vy = 'auto'; lage.vy = 'auto'; for (const b of document.querySelectorAll('[data-vy]')) b.setAttribute('aria-pressed', String(b.dataset.vy === 'auto')); } }, 1600);
    else lage.vy = 'manuell';
  };
  duk.addEventListener('pointerup', slapp); duk.addEventListener('pointercancel', slapp);

  // ---- öppna/vik ----
  const reglage = $('#oppna'), reglageRad = $('#oppnaRad'), reglageNamn = $('#oppnaNamn');
  reglage.addEventListener('input', () => { s.oppning = reglage.value / 100; });

  function valj(id) { lage.enhet = id; uppdatera(); }
  function uppdatera() {
    const e = ENHETER.find((x) => x.id === lage.enhet);
    s.tel = telFor(e.id); s.zoom = ZOOM[e.id] || 1;
    const o = OPPNA[e.id];
    reglageRad.hidden = !o;
    if (o) { reglageNamn.textContent = o[0]; reglage.value = Math.round(o[1] * 100); s.oppning = o[1]; } else s.oppning = undefined;
    for (const [id, k] of Object.entries(kort)) k.b.setAttribute('aria-pressed', String(id === e.id));
    for (const b of fargRad.children) b.setAttribute('aria-pressed', String(b.style.getPropertyValue('--f') === lage.farg));
    for (const b of ytRad.children) b.setAttribute('aria-pressed', String(b.dataset.id === lage.yta));
    visaInfo(e); spara();
  }
  function visaInfo(e) {
    const ar = e.ar, kat = KATEGORIER.find((k) => k.id === KAT[e.id]);
    $('#info').style.setProperty('--kat', '#' + kat.farg.toString(16).padStart(6, '0'));
    $('#iNamn').textContent = e.namn;
    $('#iRad').textContent = e.info;
    $('#iOm').textContent = OM[e.id];
    const fakta = $('#iFakta'); fakta.replaceChildren();
    const rad = (k, v, not) => { const dt = el('dt', null, k), dd = el('dd', null, v); if (not) dd.append(el('small', null, not)); fakta.append(dt, dd); };
    rad('UPPLÅSES', e.id === 'telefon' ? 'Från start, 2007' : `${ar}`, e.fp ? ` · ${e.fp} forskningspoäng` : '');
    rad('MARKNAD', e.bas === 1 ? 'Hela telefonmarknaden' : `${procent(e.bas)} av telefonens`);
    rad('FABRIK', kr(FABRIK * e.fabrik * (1 + 0.1 * (ar - 2007))), ` · år ${ar}, ×${String(e.fabrik).replace('.', ',')} mot telefonen`);
    rad('KVALITETSMÅL', `${e.kvalMal + Math.max(0, ar - 2007)} prickar`, ` · ${e.kvalMal} + ett per år sedan 2007`);
    const egen = NODER.filter((n) => n.lasUpp.typ === 'enhetsteknik' && n.lasUpp.enhet === e.id);
    const fl = $('#iForskning'); fl.replaceChildren();
    $('#iForskRubrik').textContent = egen.length ? 'EGEN FORSKNING' : 'FORSKNING';
    if (!egen.length) fl.append(el('li', 'tom', 'Ingen egen gren: använder telefonens delar och funktioner.'));
    const rader = [...new Set(egen.map((n) => n.rad))];
    for (const r of rader) {
      const li = el('li'); li.append(el('b', null, r));
      const steg = el('span', 'steg'); for (const n of egen.filter((x) => x.rad === r)) { const st = el('span', 'nod'); st.append(el('i', null, String(n.ar)), document.createTextNode(' ' + n.namn)); steg.append(st); }
      li.append(steg); fl.append(li);
    }
  }

  uppdatera(); satVy(lage.vy === 'manuell' ? 'auto' : lage.vy);
  s.start();
  ritaTummar();
  $('#fel').hidden = true;
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
