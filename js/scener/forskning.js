// FORSKNING – tidslinjen 2007–2026 med alla 144 tekniker. Dra för att panorera, tryck på en nod för
// att se vad den låser upp och starta den. Tiden står still här (som i förlagan).
import { U, F, W, rect, ram, text, textB, knapp, panel, kort, ikon, hit, tw, kapa, matare, stycke, lista, radbryt, ljusa, mixa, morka, BIG } from '../core/ui.js';
import { hud, flikrad } from './ram.js';
import { NODER, NOD, RADER, KATEGORIER, katAv } from '../data/noder.js';
import { status, fpPris, dagar, starta, redo, labbspar, vadLasesUpp, leddTill } from '../sim/forskning.js';
import { fpPerDag } from '../sim/personal.js';
import { arsdel, arAv, dec, kr } from '../sim/bas.js';

const AR0 = 2007, AR1 = 2026, KOLW = 50, RADH = 17, VX = 188, VY = 38, VW = W - VX - 2, VH = 202 - VY - 2;
const KX = 122;   // kategorikolumnen

// nodernas platser: x efter år, krockar skjuts åt höger i samma rad
const PLATS = (() => {
  const ut = {}, perRad = new Map();
  RADER.forEach((r, ri) => perRad.set(r.kat + r.rad, ri));
  const sist = new Map();
  for (const n of [...NODER].sort((a, b) => a.ar - b.ar)) {
    const ri = perRad.get(n.kat + n.rad); let x = (n.ar - AR0) * KOLW + 3;
    const s = sist.get(ri); if (s != null && x < s + 2) x = s + 2;
    sist.set(ri, x + 46); ut[n.id] = { x, y: ri * RADH + 2, ri };
  }
  return ut;
})();

export function forskning(A, o = {}) {
  const G = A.G;
  let kx = Math.max(0, (arAv(G.dag) - AR0) * KOLW - 20), ky = 0, drag = null, vald = o.nod || null, fel = '';
  const skR = { v: 0 };
  const maxX = (AR1 - AR0 + 1) * KOLW - VW + 50, maxY = RADER.length * RADH - VH + 30;
  const klampa = () => { kx = Math.max(0, Math.min(maxX, kx)); ky = Math.max(0, Math.min(maxY, ky)); };
  return {
    tid: false,
    ner(x, y) { if (x >= KX && y >= VY && y < 202 && !(vald && y > 146 && x > KX)) drag = { x, y, kx, ky, rorde: false }; },
    flytta(x, y) { if (drag && U.mus.ned) { if (Math.abs(x - drag.x) + Math.abs(y - drag.y) > 3) drag.rorde = true; kx = drag.kx - (x - drag.x); ky = drag.ky - (y - drag.y); klampa(); } },
    upp() { setTimeout(() => { drag = null; }, 0); },
    tangent(e) { if (e.key === 'ArrowRight') { kx += KOLW; klampa(); return true; } if (e.key === 'ArrowLeft') { kx -= KOLW; klampa(); return true; } return false; },
    rita(ctx) {
      rect(0, 14, W, 11, 0x0a0d1a);
      textB('FORSKNING', 4, 16, F.guld); text('LÅS UPP NY TEKNIK, ETT ÅR I TAGET · TIDEN STÅR STILL', 66, 18, F.dim);
      // vänster panel
      panel(2, 27, 118, 173);
      text('FORSKNINGSPOÄNG', 6, 31, F.dim);
      textB(String(Math.floor(G.bolag.fp)), 6, 38, F.bla2, { k: 2 });
      text(`+${dec(fpPerDag(G), 1)} PER DAG`, 6, 54, F.text);
      text(`${G.forskning.klara.length} AV ${NODER.length} TEKNIKER`, 6, 62, F.dim);
      matare(6, 69, 110, 3, G.forskning.klara.length / NODER.length, F.bla);
      let y = 76;
      const pagar = G.forskning.pagar;
      if (!pagar.length) { rect(6, y, 110, 20, mixa(F.orange, F.panel, 0.75)); ram(6, y, 110, 20, F.orange); text('LABBET ÄR LEDIGT', 10, y + 4, F.orange2); text('VÄLJ NEDAN ELLER I TRÄDET', 10, y + 12, F.dim); y += 24; }
      else for (const p of pagar) { const n = NOD[p.nod]; rect(6, y, 110, 20, F.panel2); ram(6, y, 110, 20, F.orange); text(kapa(n.namn, 100), 10, y + 3, F.text); text(`${p.dagarKvar} DAGAR KVAR`, 10, y + 10, F.orange2); matare(10, y + 16, 102, 2, 1 - p.dagarKvar / p.totalt, F.orange); y += 22; }
      if (labbspar(G) > pagar.length && pagar.length) { text(`${labbspar(G) - pagar.length} LEDIGT LABBSPÅR`, 6, y, F.orange2); y += 8; }
      const r = redo(G).sort((a, b) => fpPris(G, a) - fpPris(G, b));
      text(`REDO ATT FORSKA · ${r.length}`, 6, y + 1, F.text); y += 8;
      lista(4, y, 114, 198 - y, r.length, 16, (i, yy) => {
        const n = r[i], kat = katAv(n.kat), pris = fpPris(G, n), har = G.bolag.fp >= pris;
        kort(6, yy, 108, 14, { vald: vald === n.id, kant: vald === n.id ? kat.farg : null, klick: () => { vald = n.id; fokus(n); }, namn: 'redo-' + n.id });
        rect(8, yy + 2, 3, 10, kat.farg);
        text(kapa(n.namn, 64), 14, yy + 2, F.text); text(kat.namn, 14, yy + 8, kat.farg);
        text(pris + ' FP', 110, yy + 5, har ? F.bla2 : F.dim2, { just: 'h' });
      }, skR);
      // tidslinjen
      rect(KX, 27, W - KX - 2, 175, 0x090b16);
      // årsrubriker
      ctx.save(); ctx.beginPath(); ctx.rect(VX, 27, VW, 175); ctx.clip();
      for (let a = AR0; a <= AR1; a++) {
        const x = VX + (a - AR0) * KOLW - kx;
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
      RADER.forEach((rad, ri) => {
        const ry = VY + ri * RADH - ky; if (ry < VY - RADH || ry > 202) return;
        const kat = katAv(rad.kat);
        rect(VX, ry, VW, RADH, ri % 2 ? 0x0b0e1c : 0x0d1122);
        rect(KX, ry, VX - KX, RADH, 0x0a0d1a);
        rect(KX + 1, ry + 3, 2, RADH - 6, kat.farg);
        if (rad.kat !== forraKat) text(kat.namn, KX + 5, ry + 2, kat.farg); forraKat = rad.kat;
        text(kapa(rad.rad, VX - KX - 8), KX + 5, ry + 9, F.dim);
      });
      ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(VX, VY, VW, VH); ctx.clip();
      // kopplingslinjer
      for (const n of NODER) for (const f of n.foreg) {
        const a = PLATS[f], b = PLATS[n.id]; if (!a || !b || a.ri !== b.ri) continue;
        const y = VY + b.y + 6 - ky, x0 = VX + a.x + 44 - kx, x1 = VX + b.x - kx;
        if (x1 < VX || x0 > W) continue;
        rect(x0, y, x1 - x0, 1, G.forskning.klara.includes(f) ? F.gron : 0x2a3050);
      }
      for (const n of NODER) {
        const p = PLATS[n.id], x = VX + p.x - kx, y = VY + p.y - ky;
        if (x > W || x + 44 < VX || y > 202 || y + 13 < VY) continue;
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
      const nx = VX + (arsdel(G.dag) - AR0) * KOLW + 23 - kx;
      rect(Math.round(nx), VY, 1, VH, F.guld2);
      ctx.restore();
      hit(KX, VY, W - KX - 2, VH, { hjul: (dy) => { ky += dy; klampa(); }, block: true });
      knapp(W - 46, 190, 42, 10, 'I DAG', { stil: 'morkt', klick: () => { kx = Math.max(0, (arAv(G.dag) - AR0) * KOLW - 20); klampa(); } });
      // vald nod
      if (vald) detalj(NOD[vald]);
      if (fel) { rect(KX, 15, 200, 9, F.rod); text(fel, KX + 3, 17, F.text); }
      hud(A); flikrad(A, 'forskning');
    },
  };
  function fokus(n) { const p = PLATS[n.id]; kx = p.x - 60; ky = p.y - 40; klampa(); }
  function detalj(n) {
    const st = status(G, n), kat = katAv(n.kat), x = KX + 4, y = 148, w = W - KX - 10, h = 50;
    panel(x, y, w, h, { fyll: F.panel, kant: kat.farg });
    text(`${kat.namn} · ${{ klar: 'FORSKAD', pagar: 'PÅGÅR', redo: 'REDO', uppfinns: 'UPPFINNS ' + n.ar, last: 'LÅST' }[st]}`, x + 5, y + 4, kat.farg);
    textB(kapa(n.namn, 150), x + 5, y + 11, F.text);
    const pris = fpPris(G, n), t = dagar(G, n);
    text(`KOSTNAD ${pris} FP · TID ${t} DAGAR · UPPFINNS ${n.ar}`, x + 5, y + 21, F.dim);
    text('LÅSER UPP: ' + vadLasesUpp(n), x + 5, y + 28, F.gron2);
    const ledd = leddTill(n);
    if (ledd.length) text('LEDER TILL: ' + kapa(ledd.map((l) => l.namn).join(', '), w - 70), x + 5, y + 35, F.dim);
    if (st === 'last') text('FORSKA FÖREGÅNGAREN FÖRST: ' + n.foreg.map((f) => NOD[f]?.namn || f).join(', '), x + 5, y + 42, F.orange2);
    else if (st === 'uppfinns') text('NY TEKNIK ÄR DYR I BÖRJAN OCH BLIR BILLIGARE VARJE ÅR.', x + 5, y + 42, F.dim2);
    knapp(x + w - 18, y + 3, 14, 9, 'X', { stil: 'morkt', klick: () => { vald = null; } });
    if (st === 'redo') knapp(x + w - 96, y + 30, 92, 16, 'STARTA · ' + pris + ' FP', { stil: 'rosa', av: G.bolag.fp < pris, namn: 'starta-forskning', klick: () => {
      const r = starta(G, n.id); if (!r.ok) { fel = r.fel; A.ljud('fel'); return; } fel = ''; A.ljud('forskning'); vald = null;
    } });
  }
}
