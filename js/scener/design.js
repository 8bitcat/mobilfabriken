// DESIGNSTUDION – tretton steg runt telefonen (riktig 3D eller pixel). Tiden står still här.
// Varje val ändrar modellen och tillverkningskostnaden direkt; låsta delar visar vad som krävs.
import { U, F, W, rect, ram, text, textB, knapp, panel, kort, chip, reglage, matare, ikon, hit, tw, kapa, stycke, radbryt, lista, ljusa, mixa, BIG } from '../core/ui.js';
import * as Vy3d from '../telefon/vy3d.js';
import { hud } from './ram.js';
import { GRUPPER, DELAR, KAROSSER, YTOR, FUNKTIONER, ENHETER, LEGENDARISKA, delAv } from '../data/delar.js';
import { NOD } from '../data/noder.js';
import { nyDesign, telAv, tum, styckkostnad, prisNu, harDel, harKaross, harFunktion, harEnhet, antalLinserTillatna, minRam, minDjup, forvantan, fraschhet, teknik } from '../sim/design.js';
import { aktivaEffekter, rimligtPris, prognos, snitt } from '../sim/marknad.js';
import { kanStarta, startaUtveckling, byggdagar, fabriksPris } from '../sim/projekt.js';
import { status as nodStatus } from '../sim/forskning.js';
import { kr, dec, arAv, klamp } from '../sim/bas.js';

const HAL = { x: 100, y: 26, w: 176, h: 174 };
const RX = 280, RW = 100;
const FARGER = ['#17151a', '#ebebee', '#b8bcc8', '#3a7bd5', '#c9323a', '#2f8f46', '#e8b230', '#f0b4c8', '#8e5bd1', '#2aa39a', '#e07a2e', '#1d2a44'];

const STEG = [
  { id: 'enhet', rubrik: 'ENHET', hjalp: 'VILKEN SORTS PRYL BYGGER NI?' },
  { id: 'kaross', rubrik: 'KAROSS', hjalp: 'KRITIKERNA ÄLSKAR NYA KAROSSER. FRÄSCHHETEN SJUNKER 16 % PER ÅR.' },
  { id: 'storlek', rubrik: 'STORLEK & FORM', hjalp: 'FORMEN ÄR DIN. STORLEKEN ÄNDRAR INTE BETYGET.' },
  { id: 'skarm', rubrik: 'SKÄRMTYP', hjalp: 'KRITIKERNAS MÅTTSTOCK. BLÅ KANT = VAD DE VÄNTAR SIG I ÅR.' },
  { id: 'selfie', rubrik: 'SELFIEKAMERA', hjalp: 'EN LITEN PRICK OVANFÖR SKÄRMEN.' },
  { id: 'bak', rubrik: 'BAKKAMEROR', hjalp: 'FLER LINSER KOMMER MED FORSKNING I KAMERAGRUPPEN.' },
  { id: 'chip', rubrik: 'CHIP', hjalp: 'PROCESSORN STYR HUR SNABB TELEFONEN KÄNNS.' },
  { id: 'minne', rubrik: 'MINNE', hjalp: 'ARBETSMINNE FÖR FART, LAGRING FÖR BILDER OCH MUSIK.' },
  { id: 'batteri', rubrik: 'BATTERI', hjalp: 'STÖRRE BATTERI GÖR TELEFONEN TJOCKARE.' },
  { id: 'natos', rubrik: 'NÄT & MJUKVARA', hjalp: 'SNABBARE NÄT OCH ETT BÄTTRE OPERATIVSYSTEM.' },
  { id: 'kropp', rubrik: 'KROPP & PORTAR', hjalp: 'MATERIAL, HEMKNAPP, LADDPORT OCH FUNKTIONER.' },
  { id: 'farg', rubrik: 'FÄRG & MÄRKE', hjalp: 'VÄLJ FÄRG, YTA OCH SÄTT DITT MÄRKE PÅ BAKSIDAN.' },
  { id: 'granska', rubrik: 'GRANSKNING', hjalp: 'SÄTT PRIS, DÖP TELEFONEN OCH STARTA UTVECKLINGEN.' },
];
export const DESIGNSTEG = STEG;
const GRUPPNAMN = Object.fromEntries(GRUPPER.map((g) => [g.id, g.namn]));

export function design(A, o = {}) {
  const G = A.G;
  if (o.ny || !G.utkast) G.utkast = o.fran ? nyDesign(G, o.fran) : nyDesign(G, senasteDesign(G));
  const d = G.utkast;
  let steg = o.steg ?? (G.designSteg || 0), vy = 'auto', yaw = 0.6, pitch = 0.2, spin = 0.6, drag = null, fel = '', skroll = { v: 0 }, lage = 'design';
  const ar = arAv(G.dag), eff = aktivaEffekter(G);
  const sattSteg = (s) => { steg = Math.max(0, Math.min(12, s)); G.designSteg = steg; skroll = { v: 0 }; fel = ''; };
  const tal = (n) => (n < 0 ? '-' : '') + Math.abs(n) + ' KR';

  // ---------- hjälp ----------
  const delStatus = (g, del) => {
    if (harDel(G, g, del.id)) return 'ok';
    const n = NOD[`del-${g}-${del.id}`]; if (!n) return 'ok';
    const s = nodStatus(G, n); return s === 'uppfinns' ? 'ar' : s === 'pagar' ? 'pagar' : 'forska';
  };
  function valLista(y, g, maxY) {
    const alla = DELAR[g], vald = d.val[g], valdDel = delAv(g, vald), e = forvantan(g, ar);
    const forstaLast = alla.findIndex((x) => delStatus(g, x) !== 'ok');
    const visa = alla.filter((del, i) => delStatus(g, del) === 'ok' || i === e || i === forstaLast);
    if (g === 'selfie') visa.unshift({ id: 'ingen', namn: 'INGEN', kostnad: 0 });
    text(GRUPPNAMN[g], RX, y, F.dim); y += 7;
    for (const del of visa) {
      if (y + 12 > maxY) break;
      const st = del.id === 'ingen' ? 'ok' : delStatus(g, del), arVald = del.id === 'ingen' ? !d.selfie : (vald === del.id && (g !== 'selfie' || d.selfie));
      const pn = (x) => (x && x.ar ? prisNu(x, ar) : x?.kostnad || 0);
      const diff = pn(del) - (g === 'selfie' && !d.selfie ? 0 : pn(valdDel));
      const i = alla.indexOf(del);
      kort(RX, y, RW, 11, { vald: arVald, av: st !== 'ok', namn: 'del-' + g + '-' + del.id, klick: st === 'ok' ? () => { if (del.id === 'ingen') d.selfie = false; else { d.val[g] = del.id; if (g === 'selfie') d.selfie = true; } if (g === 'batteri') d.form.djup = Math.max(d.form.djup, minDjup(d)); } : null });
      text(kapa(del.namn, 56), RX + 4, y + 3, st === 'ok' ? F.text : F.dim2);
      if (i === e) rect(RX + RW - 3, y + 1, 2, 9, F.bla2);
      if (st === 'ok') { if (!arVald) text((diff >= 0 ? '+' : '') + tal(diff), RX + RW - 6, y + 3, diff <= 0 ? F.gron2 : F.guld, { just: 'h' }); else ikon('bock', RX + RW - 13, y + 2, F.bla2); }
      else text(st === 'ar' ? 'ÅR ' + del.ar : st === 'pagar' ? 'FORSKAS NU' : 'FORSKA', RX + RW - 6, y + 3, F.orange2, { just: 'h' });
      y += 12;
    }
    return y + 3;
  }

  // ---------- stegens innehåll ----------
  const STEGUI = {
    enhet(y) {
      for (const e of ENHETER) {
        if (y > 156) break;
        const ok = harEnhet(G, e.id), vald = d.enhet === e.id;
        kort(RX, y, RW, 16, { vald, av: !ok, klick: ok ? () => sattEnhet(d, e.id) : null });
        text(e.namn, RX + 4, y + 3, ok ? F.text : F.dim2); text(ok ? kapa(e.info, 92) : (ar < e.ar ? 'KOMMER ' + e.ar : 'KRÄVER FORSKNING'), RX + 4, y + 9, ok ? F.dim : F.orange2);
        if (!ok) ikon('las', RX + RW - 10, y + 4, F.orange); y += 18;
      }
    },
    kaross(y) {
      const forstaLast = KAROSSER.findIndex((x) => !harKaross(G, x.id));
      const visa = KAROSSER.filter((k, i) => harKaross(G, k.id) || i === forstaLast);
      lista(RX, y, RW, 170 - y, visa.length, 22, (i, yy) => {
        const k = visa[i], ok = harKaross(G, k.id), vald = d.kaross === k.id, fr = Math.round(fraschhet({ kaross: k.id }, ar) * 100);
        kort(RX, yy, RW - 3, 20, { vald, av: !ok, klick: ok ? () => { d.kaross = k.id; d.form.radie = k.radie; } : null });
        text(k.namn, RX + 4, yy + 3, ok ? F.text : F.dim2);
        text(ok ? kapa(k.info, 90) : (ar < k.ar ? 'KOMMER ' + k.ar : 'KRÄVER FORSKNING'), RX + 4, yy + 9, ok ? F.dim : F.orange2);
        if (ok) { text('FRÄSCH ' + fr + ' %', RX + 4, yy + 15, fr > 60 ? F.gron2 : fr > 30 ? F.guld : F.rod2); text(prisNu(k, ar) + ' KR', RX + RW - 8, yy + 15, F.dim, { just: 'h' }); }
      }, skroll);
    },
    storlek(y) {
      const tt = dec(tum(d), 1) + '"';
      textB(tt, RX, y, F.text); text('SKÄRM', RX + tw(tt, BIG) + 4, y + 2, F.dim); y += 11;
      let cx = RX; for (const [t, b, h] of [['LITEN', 0.6, 1.0], ['LAGOM', 0.69, 1.09], ['STOR', 0.78, 1.4]]) cx += chip(cx, y, t, { aktiv: Math.abs(d.form.bredd - b) < 0.005 && Math.abs(d.form.hojd - h) < 0.005, klick: () => { d.form.bredd = b; d.form.hojd = h; } }) + 3;
      y += 14;
      const sl = (namn, nyckel, min, max, fmt, steg_) => { text(namn, RX, y, F.dim); text(fmt(d.form[nyckel]), RX + RW, y, F.text, { just: 'h' }); reglage(RX, y + 7, RW, d.form[nyckel], min, max, (v) => { d.form[nyckel] = Math.round(v / steg_) * steg_; if (nyckel === 'djup') d.form.djup = Math.max(d.form.djup, minDjup(d)); if (nyckel === 'ram') d.form.ram = Math.max(minRam(G), d.form.ram); }); y += 17; };
      const cm = (v) => dec(v * 10, 1) + ' CM';
      sl('BREDD', 'bredd', 0.5, 1.0, cm, 0.01); sl('HÖJD', 'hojd', 0.9, 1.9, cm, 0.01); sl('TJOCKLEK', 'djup', Math.max(0.06, minDjup(d)), 0.2, cm, 0.005);
      sl('HÖRN', 'radie', 0, 0.3, (v) => (v < 0.05 ? 'SKARPA' : v < 0.12 ? 'MJUKA' : v < 0.2 ? 'RUNDA' : 'KAPSEL'), 0.005);
      sl('SKÄRMRAM', 'ram', minRam(G), 0.14, cm, 0.005);
    },
    skarm(y) { for (const g of ['upplosning', 'frekvens', 'skarmteknik']) y = valLista(y, g, 170); },
    selfie(y) { valLista(y, 'selfie', 170); },
    bak(y) {
      y = valLista(y, 'bakkamera', 134);
      text('LINSER PÅ BAKSIDAN', RX, y, F.dim); y += 7;
      const max = antalLinserTillatna(G); let cx = RX;
      for (let n = 1; n <= 4; n++) cx += chip(cx, y, String(n), { w: 16, aktiv: d.linser === n, av: n > max, klick: n <= max ? () => { d.linser = n; } : null }) + 3;
      y += 13; text('KAMERAÖ', RX, y, F.dim); reglage(RX, y + 7, RW, d.form.kameraStorlek, 0.12, 0.34, (v) => { d.form.kameraStorlek = Math.round(v / 0.005) * 0.005; });
    },
    chip(y) { valLista(y, 'chip', 170); },
    minne(y) { y = valLista(y, 'ram', 122); valLista(y, 'lagring', 170); },
    batteri(y) { y = valLista(y, 'batteri', 156); text('MINSTA TJOCKLEK: ' + dec(minDjup(d) * 10, 1) + ' CM', RX, y, F.dim2); },
    natos(y) { y = valLista(y, 'nat', 114); valLista(y, 'os', 170); },
    kropp(y) {
      y = valLista(y, 'material', 106);
      text('HEMKNAPP', RX, y + 1, F.dim); let cx = RX + 40; cx += chip(cx, y - 1, 'JA', { aktiv: d.hemknapp, klick: () => { d.hemknapp = true; d.form.haka = Math.max(d.form.haka, 0.12); } }) + 3; chip(cx, y - 1, 'NEJ', { aktiv: !d.hemknapp, klick: () => { d.hemknapp = false; } }); y += 12;
      y = valLista(y, 'port', 150);
      const funk = FUNKTIONER.filter((f) => harFunktion(G, f.id));
      if (funk.length) { text('FUNKTIONER (+0,1 VAR)', RX, y, F.dim); y += 7; let fx = RX; for (const f of funk) { const w = tw(f.namn) + 8; if (fx + w > RX + RW) { fx = RX; y += 11; } if (y > 162) break; const pa = d.funktioner.includes(f.id); fx += chip(fx, y, f.namn, { aktiv: pa, klick: () => { d.funktioner = pa ? d.funktioner.filter((x) => x !== f.id) : [...d.funktioner, f.id]; } }) + 2; } }
      else stycke('FORSKA FRAM GPS FÖR DIN FÖRSTA FUNKTION.', RX, y, RW, F.dim2);
    },
    farg(y) {
      text('FÄRG', RX, y, F.dim); y += 7;
      FARGER.forEach((c, i) => { const x = RX + (i % 6) * 17, yy = y + Math.floor(i / 6) * 13, vald = d.farg.toLowerCase() === c, cc = parseInt(c.slice(1), 16); rect(x + 1, yy + 1, 14, 10, 0x05060f); rect(x, yy, 14, 10, cc); rect(x, yy, 14, 1, ljusa(cc, 0.3)); if (vald) ram(x - 1, yy - 1, 16, 12, F.guld); hit(x, yy, 14, 10, { klick: () => { d.farg = c; } }); });
      y += 28; text('YTA', RX, y, F.dim); y += 7;
      const ytor = [...YTOR, ...LEGENDARISKA.filter((l) => G.legendariska.includes(l.id)).map((l) => ({ id: 'leg-' + l.id, namn: l.namn, kostnad: 0, farg: l.farg }))];
      for (const yt of ytor) { if (y > 146) break; kort(RX, y, RW, 11, { vald: d.yta === yt.id, klick: () => { d.yta = yt.id; if (yt.farg) d.farg = yt.farg; } }); text(yt.namn, RX + 4, y + 3, yt.farg ? F.guld : F.text); text(yt.kostnad ? '+' + yt.kostnad + ' KR' : '', RX + RW - 6, y + 3, F.guld, { just: 'h' }); y += 12; }
      y += 2; text('MÄRKE', RX, y + 3, F.dim);
      knapp(RX + 34, y + 1, 12, 10, '-', { klick: () => { d.marke = String.fromCharCode(((d.marke.charCodeAt(0) - 65 + 25) % 26) + 65); } });
      rect(RX + 49, y, 14, 12, F.lo); textB(d.marke, RX + 56, y + 3, F.guld, { just: 'c' });
      knapp(RX + 66, y + 1, 12, 10, '+', { klick: () => { d.marke = String.fromCharCode(((d.marke.charCodeAt(0) - 65 + 1) % 26) + 65); } });
    },
    granska(y) {
      const styck = styckkostnad(G, d, eff), rim = Math.round(rimligtPris(G.dag, snitt(G.dag) + 0.3) / 10) * 10, marg = Math.round((1 - styck / d.pris) * 100);
      const rad = (e, v, c = F.text) => { text(e, RX, y, F.dim); text(v, RX + RW, y, c, { just: 'h' }); y += 8; };
      rad('ATT TILLVERKA', kr(styck)); rad('FABRIK (ENGÅNG)', kr(fabriksPris(G, d))); rad('KASSA', kr(G.bolag.kassa), F.gron2);
      text('PRIS', RX, y + 1, F.dim); textB(kr(d.pris), RX + RW, y, F.text, { just: 'h' }); y += 9;
      const pmax = Math.round(rim * 2.4 / 10) * 10, pmin = Math.max(100, Math.round(styck * 1.05 / 10) * 10);
      reglage(RX, y + 1, RW, d.pris, pmin, pmax, (v) => { d.pris = Math.round(v / 10) * 10; }, { namn: 'design-pris' }); y += 10;
      rad('MARGINAL', marg + ' %', marg < 30 ? F.rod2 : marg < 55 ? F.guld : F.gron2);
      rad('RIMLIGT PRIS', '~' + kr(rim), F.dim);
      const tk = teknik(d, ar, eff), inom = tk.per.filter((p) => p.poang >= 1).length;
      rad('KRAV', `${inom} AV 13 DELAR I NIVÅ`, inom >= 12 ? F.gron2 : inom >= 8 ? F.guld : F.rod2);
      rad('KÖPARE/VECKA', '~' + Math.round(prognos(G, d, 6.2 + (inom - 7) * 0.25, d.pris)), F.text);
      const dagar = byggdagar(G, d); rad('BYGGTID', isFinite(dagar) ? dagar + ' DAGAR' : '-', F.text);
      text('NAMN', RX, y + 1, F.dim); y += 8;
      const falt = { x: RX, y, w: RW, h: 12 };
      rect(falt.x, falt.y, falt.w, falt.h, F.lo); ram(falt.x, falt.y, falt.w, falt.h, F.hi);
      if (!A._falt) text(kapa(d.namn || 'TRYCK OCH SKRIV ETT NAMN', RW - 6), RX + 3, y + 4, d.namn ? F.text : F.dim2);
      hit(falt.x, falt.y, falt.w, falt.h, { klick: () => A.textfalt(falt, d.namn, (v) => { d.namn = v; }, 18), namn: 'design-namn' });
    },
  };

  function vinkel() { return vy === 'auto' ? [spin, 0.2] : vy === 'manuell' ? [yaw, pitch] : { fram: [0, 0.22], bak: [Math.PI, 0.22], sida: [Math.PI / 2, 0.22], under: [0.3, -1.1] }[vy]; }
  function studio(ctx) {
    const { x, y, w, h } = HAL, golv = y + 120;
    for (let j = 0; j < h; j++) rect(x, y + j, w, 1, j < 120 ? mixa(0x1c2050, 0x0e1230, j / 120) : mixa(0x23234e, 0x15153a, (j - 120) / 54));
    rect(x, golv, w, 1, 0x3a3a70);
    // golvsken under telefonen: ellips rad för rad, tre ljusnivåer
    for (let j = -9; j <= 9; j++) { const hw = Math.round(64 * Math.sqrt(1 - (j / 9) ** 2)); for (const [f, a] of [[1, 0.07], [0.7, 0.08], [0.4, 0.1]]) { ctx.fillStyle = `rgba(80,120,255,${a})`; ctx.fillRect(x + w / 2 - Math.round(hw * f), golv + 26 + j, Math.round(hw * f) * 2, 1); } }
    ctx.fillStyle = 'rgba(79,240,255,.06)'; ctx.fillRect(x, y, 24, h); ctx.fillStyle = 'rgba(255,64,200,.06)'; ctx.fillRect(x + w - 24, y, 24, h);
  }
  function konceptHylla() {
    text('KONCEPTHYLLAN', RX, 30, F.guld);
    if (!G.koncept.length) stycke('HÄR SPARAS DESIGNER SOM INTE STARTATS. TRYCK SPARA I GRANSKNINGEN.', RX, 42, RW, F.dim);
    G.koncept.slice(0, 7).forEach((c, i) => {
      const y = 40 + i * 19;
      kort(RX, y, RW, 17, { klick: () => { G.utkast = nyDesign(G, c); G.utkast.namn = c.namn; A.go('design', { steg: 12 }); } });
      text(kapa(c.namn || 'NAMNLÖS', 90), RX + 4, y + 3, F.text); text(kr(c.pris) + ' · ' + dec(tum(c), 1) + '"', RX + 4, y + 10, F.dim);
    });
    knapp(RX, 188, RW, 10, 'TILLBAKA', { stil: 'morkt', klick: () => { lage = 'design'; } });
  }

  return {
    tid: false,
    exit() { G.utkast = d; },
    ner(x, y) { if (x >= HAL.x && x < HAL.x + HAL.w && y >= HAL.y && y < HAL.y + HAL.h) { const a = vinkel(); drag = { x, y, yaw: a[0], pitch: a[1] }; } },
    flytta(x, y) { if (drag && U.mus.ned) { vy = 'manuell'; yaw = drag.yaw + (x - drag.x) * 0.035; pitch = klamp(drag.pitch + (y - drag.y) * 0.03, -1.3, 1.3); } },
    upp() { drag = null; },
    tangent(e) { if (e.key === 'ArrowRight') { sattSteg(steg + 1); return true; } if (e.key === 'ArrowLeft') { sattSteg(steg - 1); return true; } return false; },
    rita(ctx, dt) {
      if (vy === 'auto') spin += dt * 0.9;
      const styck = styckkostnad(G, d, eff), st = STEG[steg];
      rect(0, 14, W, 11, 0x0a0d1a);
      text('DESIGNSTUDIO', 4, 17, F.guld); text(`${ar} · ${kapa(G.bolag.namn, 90)} · TIDEN STÅR STILL`, 58, 17, F.dim);
      knapp(W - 76, 15, 72, 9, 'TILL KONTORET', { stil: 'orange', klick: () => A.go('kontor'), namn: 'design-kontoret' });
      knapp(W - 146, 15, 66, 9, 'KONCEPT (' + G.koncept.length + ')', { stil: 'morkt', klick: () => { lage = lage === 'koncept' ? 'design' : 'koncept'; } });
      panel(2, 26, 96, 58);
      text('ATT TILLVERKA', 6, 30, F.dim); textB(kr(styck), 6, 37, F.guld);
      text(kapa(d.namn || 'NAMNLÖS TELEFON', 88), 6, 48, F.text);
      text(`${dec(tum(d), 1)}" SKÄRM · ${d.farg.toUpperCase()}`, 6, 56, F.dim);
      text(`${dec(d.form.bredd * 10, 1)} × ${dec(d.form.hojd * 10, 1)} × ${dec(d.form.djup * 10, 1)} CM`, 6, 64, F.dim);
      text((KAROSSER.find((k) => k.id === d.kaross) || KAROSSER[0]).namn, 6, 72, F.dim2);
      text('VY', 4, 89, F.dim);
      [['auto', 'AUTO'], ['manuell', 'FRI'], ['fram', 'FRAM'], ['bak', 'BAK'], ['sida', 'SIDA'], ['under', 'UNDER']].forEach(([id, t], i) => knapp(4 + (i % 2) * 48, 96 + Math.floor(i / 2) * 13, 44, 10, t, { stil: 'dim', aktiv: vy === id, klick: () => { vy = id; } }));
      text('TELEFONEN RITAS SOM', 4, 140, F.dim);
      const lage3d = G.installningar.telefon !== 'pixel';
      knapp(4, 148, 44, 10, 'RIKTIG 3D', { stil: 'dim', aktiv: lage3d, klick: () => { G.installningar.telefon = '3d'; } });
      knapp(52, 148, 44, 10, 'PIXEL', { stil: 'dim', aktiv: !lage3d, klick: () => { G.installningar.telefon = 'pixel'; } });
      text('DRA I TELEFONEN', 4, 166, F.dim2); text('FÖR ATT VRIDA DEN', 4, 173, F.dim2);
      knapp(4, 186, 92, 11, 'BÖRJA OM', { stil: 'dim', klick: () => { G.utkast = null; A.go('design', { ny: true, steg: 0 }); } });
      studio(ctx);
      const a = vinkel();
      Vy3d.visa(HAL, telAv(d), { vy, spin, yaw: a[0], pitch: a[1], pixel: !lage3d, ctx });
      ram(HAL.x - 1, HAL.y - 1, HAL.w + 2, HAL.h + 2, F.hi);
      panel(RX - 2, 26, RW + 4, 174);
      if (lage === 'koncept') { konceptHylla(); } else {
        text(`STEG ${steg + 1} AV 13`, RX, 30, F.bla2);
        textB(st.rubrik, RX, 38, F.guld);
        let y = 48; for (const r of radbryt(st.hjalp, RW)) { text(r, RX, y, F.dim); y += 7; }
        STEGUI[st.id](y + 2);
        if (fel) text(kapa(fel, RW), RX, 168, F.rod2);
        if (steg > 0) knapp(RX, 176, 46, 10, 'TILLBAKA', { stil: 'morkt', klick: () => sattSteg(steg - 1) });
        if (steg < 12) { knapp(RX + (steg > 0 ? 52 : 0), 176, steg > 0 ? 48 : RW, 10, 'FORTSÄTT', { stil: 'bla', klick: () => sattSteg(steg + 1), namn: 'design-fortsatt' }); knapp(RX, 188, RW, 10, 'HOPPA TILL GRANSKNING', { stil: 'dim', klick: () => sattSteg(12), namn: 'design-hoppa' }); }
        else {
          const k = kanStarta(G, d);
          knapp(RX + 52, 176, 48, 10, 'SPARA', { stil: 'morkt', klick: () => { G.koncept = [JSON.parse(JSON.stringify(d)), ...G.koncept.filter((c) => c.id !== d.id)].slice(0, 8); fel = 'SPARAD PÅ KONCEPTHYLLAN'; } });
          knapp(RX, 188, RW, 10, k.ok ? 'STARTA UTVECKLING' : kapa(k.fel, RW - 6), { stil: 'gron', av: !k.ok, namn: 'design-starta', klick: () => {
            const r = startaUtveckling(G, d); if (!r.ok) { fel = r.fel; A.ljud('fel'); return; }
            G.utkast = null; G.designSteg = 0; A.ljud('klar'); A.spelaTid(); A.go('kontor');
          } });
        }
      }
      STEG.forEach((s, i) => { const px = 4 + i * 29, valt = i === steg, klar = i < steg; rect(px + 1, 205, 27, 9, 0x05060f); rect(px, 204, 27, 9, valt ? F.bla : klar ? mixa(F.gron, F.panel, 0.3) : F.panel2); text(String(i + 1), px + 13, 206, valt || klar ? F.text : F.dim2, { just: 'c' }); hit(px, 204, 27, 9, { klick: () => sattSteg(i), namn: 'design-steg-' + (i + 1) }); });
      hud(A);
    },
  };
}
function senasteDesign(G) { const p = [...G.produkter].reverse()[0]; if (!p) return null; const d = JSON.parse(JSON.stringify(p.design)); d.namn = ''; return d; }
function sattEnhet(d, id) {
  d.enhet = id;
  const f = { telefon: [0.69, 1.09, 0.11], platta: [1.5, 2.0, 0.08], laptop: [2.4, 1.6, 0.15], klocka: [0.42, 0.5, 0.11], horlurar: [0.5, 0.62, 0.22], vikbar: [0.74, 1.62, 0.09] }[id];
  d.form.bredd = f[0]; d.form.hojd = f[1]; d.form.djup = f[2];
}
