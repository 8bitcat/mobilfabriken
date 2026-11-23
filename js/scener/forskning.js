// FORSKNING – tidslinjen 2007–2026 med alla 144 tekniker. Dra för att panorera, tryck på en nod för
// att se vad den låser upp och starta den. Tiden står still här (som i förlagan).
// Konsolspelet (docs/KONSOLPLAN.md): flikarna KONSOL (konsolernas träd 1982–2026) och MOBIL (telefonernas träd,
// låst med KRÄVER TELEFONAVDELNINGEN tills noden TELEFONAVDELNINGEN under KONSOL är forskad). Den noden kostar
// också kronor (en ny avdelning) och är bredare och rosa så att den syns.
import { U, F, W, rect, ram, text, textB, knapp, panel, kort, ikon, hit, tw, kapa, matare, stycke, lista, radbryt, ljusa, mixa, morka, BIG } from '../core/ui.js';
import { hud, flikrad } from './ram.js';
import { NODER, K_NODER, NOD, RADER, K_RADER, KATEGORIER, katAv } from '../data/noder.js';
import { K_KAROSSER, K_ENHETER } from '../data/konsol.js';
import { status, fpPris, krPris, dagar, starta, redo, labbspar, vadLasesUpp, leddTill, synligaNoder } from '../sim/forskning.js';
import { fpPerDag } from '../sim/personal.js';
import { arKonsolSpel } from '../sim/spel.js';
import { ritaKonsol2D } from '../konsol/konsol-vy.js';
import { arsdel, arAv, dec, kr } from '../sim/bas.js';

const AR1 = 2026, KOLW = 50, RADH = 17, VX = 188, VY = 38, VW = W - VX - 2, VH = 202 - VY - 2;
const KX = 122;   // kategorikolumnen
const MOBIL = 'k-mobil', MOBIL_W = 92;   // TELEFONAVDELNINGEN: en bred nod (namnet + FP och kronor)
const bredd = (n) => (n.id === MOBIL ? MOBIL_W : 44);

// nodernas platser: x efter år, krockar skjuts åt höger i samma rad
function platser(noder, rader, ar0) {
  const ut = {}, perRad = new Map();
  rader.forEach((r, ri) => perRad.set(r.kat + r.rad, ri));
  const sist = new Map();
  for (const n of [...noder].sort((a, b) => a.ar - b.ar)) {
    const ri = perRad.get(n.kat + n.rad); let x = (n.ar - ar0) * KOLW + 3;
    const s = sist.get(ri); if (s != null && x < s + 2) x = s + 2;
    sist.set(ri, x + bredd(n) + 2); ut[n.id] = { x, y: ri * RADH + 2, ri };
  }
  return ut;
}
// träden: telefonernas (snabbstarten och konsolspelets MOBIL-flik) och konsolernas (KONSOL-fliken)
const TRAD = {
  telefon: { noder: NODER, rader: RADER, ar0: 2007 },
  konsol: { noder: K_NODER, rader: K_RADER, ar0: 1982 },
};
for (const t of Object.values(TRAD)) t.plats = platser(t.noder, t.rader, t.ar0);

export function forskning(A, o = {}) {
  const G = A.G, konsolSpel = arKonsolSpel(G);
  const flikAv = (n) => (konsolSpel && n.linje === 'konsol' ? 'konsol' : 'telefon');
  // telefonnoderna i konsolspelet innan telefonavdelningen finns
  const sparrad = (n) => konsolSpel && n.linje !== 'konsol' && !G.flaggor.mobil;
  let flik = konsolSpel ? (NOD[o.nod] ? flikAv(NOD[o.nod]) : 'konsol') : 'telefon', T = TRAD[flik];
  const iDag = () => Math.max(0, (arAv(G.dag) - T.ar0) * KOLW - 20);   // tidslinjen börjar vid innevarande år
  let kx = iDag(), ky = 0, drag = null, vald = o.nod || null, fel = '';
  const skR = { v: 0 };
  let maxX = 0, maxY = 0;
  // konsolspelet: sista raden (TELEFONAVDELNINGEN) går att dra upp ovanför detaljrutan
  const matt = () => { maxX = (AR1 - T.ar0 + 1) * KOLW - VW + 50; maxY = T.rader.length * RADH - VH + (konsolSpel ? 80 : 30); };
  const klampa = () => { kx = Math.max(0, Math.min(maxX, kx)); ky = Math.max(0, Math.min(maxY, ky)); };
  matt(); klampa();   // 2025–26 hamnar annars förbi trädets slut (nästan tom vy)
  const byt = (f) => { if (f === flik) return; flik = f; T = TRAD[f]; matt(); kx = iDag(); ky = 0; klampa(); };
  // MOBIL-fliken innan telefonavdelningen: rutan längst ner förklarar varför allt är låst
  const lastInfo = () => konsolSpel && flik === 'telefon' && !G.flaggor.mobil && !vald;
  if (konsolSpel && NOD[vald]) fokus(NOD[vald]);
  return {
    tid: false,
    ner(x, y) { if (x >= KX && y >= VY && y < 202 && !((vald || lastInfo()) && y > 146 && x > KX)) drag = { x, y, kx, ky, rorde: false }; },
    flytta(x, y) { if (drag && U.mus.ned) { if (Math.abs(x - drag.x) + Math.abs(y - drag.y) > 3) drag.rorde = true; kx = drag.kx - (x - drag.x); ky = drag.ky - (y - drag.y); klampa(); } },
    upp() { setTimeout(() => { drag = null; }, 0); },
    tangent(e) { if (e.key === 'ArrowRight') { kx += KOLW; klampa(); return true; } if (e.key === 'ArrowLeft') { kx -= KOLW; klampa(); return true; } return false; },
    rita(ctx) {
      rect(0, 14, W, 11, 0x0a0d1a);
      if (!konsolSpel) { textB('FORSKNING', 4, 16, F.guld); text('LÅS UPP NY TEKNIK, ETT ÅR I TAGET · TIDEN STÅR STILL', 66, 18, F.dim); }
      else {
        // flikarna: KONSOL och MOBIL (låset tills telefonavdelningen är forskad)
        textB('FORSKNING', 4, 16, F.guld); text('LÅS UPP NY TEKNIK · TIDEN STÅR STILL', 66, 18, F.dim);
        knapp(W - 128, 15, 60, 9, 'KONSOL', { stil: 'dim', ikon: 'kontroll', aktiv: flik === 'konsol', klick: () => byt('konsol'), namn: 'forskning-konsol' });
        knapp(W - 64, 15, 60, 9, 'MOBIL', { stil: 'dim', ikon: G.flaggor.mobil ? 'telefon' : 'las', aktiv: flik === 'telefon', klick: () => byt('telefon'), namn: 'forskning-mobil' });
      }
      // vänster panel
      panel(2, 27, 118, 173);
      text('FORSKNINGSPOÄNG', 6, 31, F.dim);
      textB(String(Math.floor(G.bolag.fp)), 6, 38, F.bla2, { k: 2 });
      text(`+${dec(fpPerDag(G), 1)} PER DAG`, 6, 54, F.text);
      const alla = synligaNoder(G).length;
      text(`${G.forskning.klara.length} AV ${alla} TEKNIKER`, 6, 62, F.dim);
      matare(6, 69, 110, 3, G.forskning.klara.length / alla, F.bla);
      let y = 76;
      const pagar = G.forskning.pagar;
      if (!pagar.length) { rect(6, y, 110, 20, mixa(F.orange, F.panel, 0.75)); ram(6, y, 110, 20, F.orange); text('LABBET ÄR LEDIGT', 10, y + 4, F.orange2); text('VÄLJ NEDAN ELLER I TRÄDET', 10, y + 12, F.dim); y += 24; }
      else for (const p of pagar) { const n = NOD[p.nod]; rect(6, y, 110, 20, F.panel2); ram(6, y, 110, 20, F.orange); text(kapa(n.namn, 100), 10, y + 3, F.text); text(`${p.dagarKvar} DAGAR KVAR`, 10, y + 10, F.orange2); matare(10, y + 16, 102, 2, 1 - p.dagarKvar / p.totalt, F.orange); y += 22; }
      if (labbspar(G) > pagar.length && pagar.length) { text(`${labbspar(G) - pagar.length} LEDIGT LABBSPÅR`, 6, y, F.orange2); y += 8; }
      const r = redo(G).sort((a, b) => fpPris(G, a) - fpPris(G, b));
      if (konsolSpel) r.sort((a, b) => (b.id === MOBIL) - (a.id === MOBIL));   // det stora beslutet står först
      text(`REDO ATT FORSKA · ${r.length}`, 6, y + 1, F.text); y += 8;
      lista(4, y, 114, 198 - y, r.length, 16, (i, yy) => {
        const n = r[i], kat = katAv(n.kat), pris = fpPris(G, n), har = G.bolag.fp >= pris, kronor = krPris(G, n);
        kort(6, yy, 108, 14, { vald: vald === n.id, kant: vald === n.id ? kat.farg : kronor ? F.rosa : null, klick: () => { vald = n.id; fokus(n); }, namn: 'redo-' + n.id });
        rect(8, yy + 2, 3, 10, kat.farg);
        text(kapa(n.namn, 64), 14, yy + 2, F.text); text(kat.namn, 14, yy + 8, kat.farg);
        if (!kronor) text(pris + ' FP', 110, yy + 5, har ? F.bla2 : F.dim2, { just: 'h' });
        else { text(pris + ' FP', 110, yy + 2, har ? F.bla2 : F.dim2, { just: 'h' }); text(kr(kronor, true), 110, yy + 8, G.bolag.kassa >= kronor ? F.gron2 : F.dim2, { just: 'h' }); }
      }, skR);
      // tidslinjen
      rect(KX, 27, W - KX - 2, 175, 0x090b16);
      // årsrubriker
      ctx.save(); ctx.beginPath(); ctx.rect(VX, 27, VW, 175); ctx.clip();
      for (let a = T.ar0; a <= AR1; a++) {
        const x = VX + (a - T.ar0) * KOLW - kx;
        if (x < VX - KOLW || x > W) continue;
        rect(x, VY, 1, VH, 0x141a30);
        const nu = a === arAv(G.dag);
        if (nu) { rect(x + 8, 28, 30, 9, F.guld2); text(String(a), x + 23, 30, F.blak, { just: 'c' }); } else text(String(a), x + 23, 30, F.dim, { just: 'c' });
      }
      ctx.restore();
      rect(KX, VY - 1, W - KX - 2, 1, F.hi);
      // rader + noder
      ctx.save(); ctx.beginPath(); ctx.rect(KX, VY, W - KX - 2, VH); ctx.clip();
      let forraKat = null;
      const KW = VX - KX - 8;
      T.rader.forEach((rad, ri) => {
        const ry = VY + ri * RADH - ky; if (ry < VY - RADH || ry > 202) return;
        const kat = katAv(rad.kat);
        rect(VX, ry, VW, RADH, ri % 2 ? 0x0b0e1c : 0x0d1122);
        rect(KX, ry, VX - KX, RADH, 0x0a0d1a);
        rect(KX + 1, ry + 3, 2, RADH - 6, kat.farg);
        if (!konsolSpel) {
          if (rad.kat !== forraKat) text(kat.namn, KX + 5, ry + 2, kat.farg); forraKat = rad.kat;
          text(kapa(rad.rad, VX - KX - 8), KX + 5, ry + 9, F.dim);
          return;
        }
        // konsolspelet: långa namn (MEDIA & SPARNING, KAROSSER FICKKONSOL) får plats – kategorin kortas till
        // första ordet och en rad utan kategorirubrik delas på två rader
        const forst = rad.kat !== forraKat; forraKat = rad.kat;
        if (forst && rad.rad === kat.namn) { text(kat.namn, KX + 5, ry + 6, kat.farg); return; }   // GRAFIK / GRAFIK: en gång räcker
        if (forst) text(tw(kat.namn) <= KW ? kat.namn : kat.namn.split(' ')[0], KX + 5, ry + 2, kat.farg);
        const delar = radbryt(rad.rad, KW);
        if (!forst && delar.length === 2) { text(kapa(delar[0], KW), KX + 5, ry + 2, F.dim); text(kapa(delar[1], KW), KX + 5, ry + 9, F.dim); }
        else text(kapa(rad.rad, KW), KX + 5, ry + 9, F.dim);
      });
      ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(VX, VY, VW, VH); ctx.clip();
      // kopplingslinjer
      for (const n of T.noder) for (const f of n.foreg) {
        const a = T.plats[f], b = T.plats[n.id]; if (!a || !b || a.ri !== b.ri) continue;
        const y = VY + b.y + 6 - ky, x0 = VX + a.x + bredd(NOD[f]) - kx, x1 = VX + b.x - kx;
        if (x1 < VX || x0 > W) continue;
        rect(x0, y, x1 - x0, 1, G.forskning.klara.includes(f) ? F.gron : 0x2a3050);
      }
      for (const n of T.noder) {
        const p = T.plats[n.id], x = VX + p.x - kx, y = VY + p.y - ky;
        if (x > W || x + bredd(n) < VX || y > 202 || y + 13 < VY) continue;
        if (n.id === MOBIL) { mobilNod(n, x, y); continue; }
        if (sparrad(n)) { lastNod(n, x, y); continue; }
        const st = status(G, n), kat = katAv(n.kat), arVald = vald === n.id;
        const fyll = st === 'klar' ? mixa(F.gron, 0x0b0e1c, 0.65) : st === 'pagar' ? mixa(F.orange, 0x0b0e1c, 0.6) : st === 'redo' ? mixa(kat.farg, 0x0b0e1c, 0.75) : 0x151a2c;
        rect(x, y, 44, 13, fyll);
        const kant = arVald ? F.guld : st === 'klar' ? F.gron : st === 'pagar' ? F.orange : st === 'redo' ? kat.farg : 0x262c44;
        ram(x, y, 44, 13, kant);
        if (st === 'redo' && Math.floor(A.t * 2) % 2) ram(x - 1, y - 1, 46, 15, morka(kat.farg, 0.4));
        text(kapa(n.namn, 40), x + 2, y + 1, st === 'last' || st === 'uppfinns' ? F.dim : F.text);
        const rad2 = st === 'klar' ? 'FORSKAD' : st === 'pagar' ? (G.forskning.pagar.find((q) => q.nod === n.id)?.dagarKvar + ' D KVAR') : st === 'redo' ? fpPris(G, n) + ' FP' : st === 'uppfinns' ? 'ÅR ' + n.ar : fpPris(G, n) + ' FP · LÅST';
        text(kapa(rad2, 40), x + 2, y + 7, st === 'klar' ? F.gron2 : st === 'pagar' ? F.orange2 : st === 'redo' ? kat.farg : F.dim2);
        hit(x, y, 44, 13, { klick: () => { if (!drag?.rorde) vald = n.id; }, namn: 'nod-' + n.id });
      }
      // nu-linjen
      const nx = VX + (arsdel(G.dag) - T.ar0) * KOLW + 23 - kx;
      rect(Math.round(nx), VY, 1, VH, F.guld2);
      ctx.restore();
      hit(KX, VY, W - KX - 2, VH, { hjul: (dy) => { ky += dy; klampa(); }, block: true });
      knapp(W - 46, 190, 42, 10, 'I DAG', { stil: 'morkt', klick: () => { kx = iDag(); klampa(); } });
      // vald nod (eller varför MOBIL är låst)
      if (vald) detalj(NOD[vald]);
      else if (lastInfo()) lastRuta();
      if (fel && konsolSpel) { rect(KX, 15, 130, 9, F.rod); text(kapa(fel, 124), KX + 3, 17, F.text); }   // flikarna står till höger
      else if (fel) { rect(KX, 15, 200, 9, F.rod); text(fel, KX + 3, 17, F.text); }
      hud(A); flikrad(A, 'forskning');
    },
  };
  function fokus(n) { byt(flikAv(n)); const p = T.plats[n.id]; if (!p) return; kx = p.x - 60; ky = p.y - 40; klampa(); }
  // TELEFONAVDELNINGEN i tidslinjen: rosa, dubbelt så bred, telefonikonen och priset i FP och kronor
  function mobilNod(n, x, y) {
    const st = status(G, n), w = MOBIL_W, klar = st === 'klar', pagar = st === 'pagar';
    rect(x, y, w, 13, klar ? mixa(F.gron, 0x0b0e1c, 0.65) : pagar ? mixa(F.orange, 0x0b0e1c, 0.6) : mixa(F.rosa, 0x0b0e1c, st === 'redo' ? 0.6 : 0.78));
    ram(x, y, w, 13, vald === n.id ? F.guld : klar ? F.gron : pagar ? F.orange : F.rosa);
    if (!klar && !pagar && Math.floor(A.t * 2) % 2) ram(x - 1, y - 1, w + 2, 15, morka(F.rosa, st === 'redo' ? 0.2 : 0.5));
    ikon('telefon', x + 2, y + 3, klar ? F.gron2 : pagar ? F.orange2 : ljusa(F.rosa, 0.3));
    text(kapa(n.namn, w - 13), x + 11, y + 1, F.text);
    const rad2 = klar ? 'FORSKAD' : pagar ? (G.forskning.pagar.find((q) => q.nod === n.id)?.dagarKvar + ' D KVAR') : `${fpPris(G, n)} FP + ${kr(krPris(G, n), true)}`;
    text(kapa(rad2, w - 13), x + 11, y + 7, klar ? F.gron2 : pagar ? F.orange2 : ljusa(F.rosa, 0.45));
    hit(x, y, w, 13, { klick: () => { if (!drag?.rorde) vald = n.id; }, namn: 'nod-' + n.id });
  }
  // MOBIL-fliken innan telefonavdelningen: noden med ett hänglås, priset den får när avdelningen finns
  function lastNod(n, x, y) {
    rect(x, y, 44, 13, 0x151a2c); ram(x, y, 44, 13, vald === n.id ? F.guld : 0x262c44);
    text(kapa(n.namn, 31), x + 2, y + 1, F.dim);
    text(kapa(fpPris(G, n) + ' FP', 31), x + 2, y + 7, F.dim2);
    ikon('las', x + 35, y + 3, vald === n.id ? F.rosa : F.dim2);
    hit(x, y, 44, 13, { klick: () => { if (!drag?.rorde) vald = n.id; }, namn: 'nod-' + n.id });
  }
  // konsolnodernas bild i detaljrutan: karossens form, eller enhetens första form (FICKKONSOL → fickformen)
  function bildAv(n) {
    const u = n.lasUpp;
    if (u.typ === 'kkaross') return K_KAROSSER.find((k) => k.id === u.id) || null;
    if (u.typ === 'kenhet') return K_KAROSSER.find((k) => k.enhet === u.id) || null;
    return null;
  }
  function detalj(n) {
    const st = status(G, n), kat = katAv(n.kat), x = KX + 4, y = 148, w = W - KX - 10, h = 50;
    const spar = sparrad(n), kronor = krPris(G, n);
    panel(x, y, w, h, { fyll: F.panel, kant: spar ? F.rosa : kat.farg });
    text(`${kat.namn} · ${spar ? 'KRÄVER TELEFONAVDELNINGEN' : { klar: 'FORSKAD', pagar: 'PÅGÅR', redo: 'REDO', uppfinns: 'UPPFINNS ' + n.ar, last: 'LÅST' }[st]}`, x + 5, y + 4, spar ? F.rosa : kat.farg);
    textB(kapa(n.namn, 150), x + 5, y + 11, F.text);
    const pris = fpPris(G, n), t = dagar(G, n), bild = konsolSpel ? bildAv(n) : null;
    // kostnaden slutar före bilden till höger (TELEFONAVDELNINGEN: utan årtalet, det står ovanför)
    const kost = `KOSTNAD ${pris} FP${kronor ? ' + ' + kr(kronor, true) : ''} · TID ${t} DAGAR`;
    text(tw(kost + ' · UPPFINNS ' + n.ar) <= (bild || kronor ? w - 70 : w - 10) ? `${kost} · UPPFINNS ${n.ar}` : kost, x + 5, y + 21, F.dim);
    text('LÅSER UPP: ' + vadLasesUpp(n), x + 5, y + 28, F.gron2);
    const ledd = leddTill(n);
    if (ledd.length) text('LEDER TILL: ' + kapa(ledd.map((l) => l.namn).join(', '), w - 70), x + 5, y + 35, F.dim);
    // konsolernas former syns i rutan (och karossens kännetecken när raden är ledig)
    if (bild) {
      for (let j = 0; j < 28; j++) rect(x + w - 64, y + 2 + j, 42, 1, mixa(0x1c2050, 0x0e1230, j / 28));
      ritaKonsol2D(U.ctx, x + w - 63, y + 2, bild.modell);
      const info = n.lasUpp.typ === 'kenhet' ? K_ENHETER.find((e) => e.id === n.lasUpp.id)?.info : bild.info;
      if (info && !ledd.length) text(kapa(info, w - 80), x + 5, y + 35, F.dim);
    } else if (n.id === MOBIL) { rect(x + w - 44, y + 3, 24, 24, mixa(F.rosa, F.panel, 0.75)); ikon('telefon', x + w - 42, y + 5, F.rosa, 3); }
    if (spar) {
      text('FORSKA FRAM DEN UNDER KONSOL FÖRST.', x + 5, y + 42, F.rosa);
      knapp(x + w - 74, y + 36, 70, 11, 'VISA DEN', { stil: 'rosa', namn: 'detalj-telefonavdelningen', klick: visaMobil });
    } else if (st === 'last') {
      // konsolspelet: bara det som saknas (TELEFONAVDELNINGEN kräver tre konsoltekniker)
      if (konsolSpel) text(kapa('FORSKA FÖRST: ' + n.foreg.filter((f) => !G.forskning.klara.includes(f)).map((f) => NOD[f]?.namn || f).join(', '), w - 10), x + 5, y + 42, F.orange2);
      else text('FORSKA FÖREGÅNGAREN FÖRST: ' + n.foreg.map((f) => NOD[f]?.namn || f).join(', '), x + 5, y + 42, F.orange2);
    } else if (st === 'uppfinns') text('NY TEKNIK ÄR DYR I BÖRJAN OCH BLIR BILLIGARE VARJE ÅR.', x + 5, y + 42, F.dim2);
    knapp(x + w - 18, y + 3, 14, 9, 'X', { stil: 'morkt', klick: () => { vald = null; } });
    // TELEFONAVDELNINGEN kostar både FP och kronor: bredare knapp
    const kw = kronor ? 112 : 92, by = kronor ? 34 : 30, bh = kronor ? 12 : 16;
    if (st === 'redo') knapp(x + w - kw - 4, y + by, kw, bh, 'STARTA · ' + pris + ' FP' + (kronor ? ' + ' + kr(kronor, true) : ''), { stil: 'rosa', av: G.bolag.fp < pris || (kronor > 0 && G.bolag.kassa < kronor), namn: 'starta-forskning', klick: () => {
      const r = starta(G, n.id); if (!r.ok) { fel = r.fel; A.ljud('fel'); return; } fel = ''; A.ljud('forskning'); vald = null;
    } });
  }
  function visaMobil() { vald = MOBIL; fokus(NOD[MOBIL]); }
  // MOBIL-fliken innan telefonavdelningen: vad som krävs och en knapp till noden
  function lastRuta() {
    const n = NOD[MOBIL], x = KX + 4, y = 148, w = W - KX - 10, h = 50, kronor = krPris(G, n);
    panel(x, y, w, h, { fyll: F.panel, kant: F.rosa });
    rect(x + w - 30, y + 4, 24, 24, mixa(F.rosa, F.panel, 0.75)); ikon('telefon', x + w - 28, y + 6, F.rosa, 3);
    text('MOBIL · LÅST', x + 5, y + 4, F.rosa);
    textB('KRÄVER TELEFONAVDELNINGEN', x + 5, y + 11, F.text);
    text(`FORSKA FRAM DEN UNDER KONSOL: ${fpPris(G, n)} FP + ${kr(kronor, true)}.`, x + 5, y + 22, F.dim);
    const saknas = n.foreg.filter((f) => !G.forskning.klara.includes(f)).map((f) => NOD[f]?.namn || f);
    if (saknas.length) text(kapa('KRÄVER ' + saknas.join(', ').replace(/, ([^,]*)$/, ' OCH $1') + '.', w - 40), x + 5, y + 29, F.orange2);
    else text(arAv(G.dag) < n.ar ? `ALLT SOM KRÄVS ÄR KLART – NODEN KOMMER ${n.ar}.` : 'ALLT SOM KRÄVS ÄR KLART – REDO ATT FORSKA!', x + 5, y + 29, F.gron2);
    text('TELEFONERNA OCH PRYLARNA KOMMER ' + n.ar + '.', x + 5, y + 40, F.dim2);
    knapp(x + w - 74, y + 36, 70, 11, 'VISA NODEN', { stil: 'rosa', namn: 'visa-telefonavdelningen', klick: visaMobil });
  }
}
