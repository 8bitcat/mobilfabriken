// KONTORET – spelets nav. Teamet sitter vid borden, prickarna flyger, panelen nertill visar bygget
// (eller nästa mål och vad labbet gör). Klick på en tom bordsplats → BYGG, på en person → PERSONAL.
import { U, F, W, rect, ram, text, textB, knapp, panel, ikon, hit, tw, kapa, matare, ljusa, mixa } from '../core/ui.js';
import { ritaKontor } from '../art/kontor-vy.js';
import { hud, flikrad } from './ram.js';
import { kr, dec, datumText } from '../sim/bas.js';
import { byggkostnadPerDag, kopPrick, lagaBugg, avbryt, PRICK_FP } from '../sim/projekt.js';
import { nastaMal } from '../sim/mal.js';
import { NOD } from '../data/noder.js';
import { onskemal } from '../sim/personal.js';

export function kontor(A) {
  const pr = []; // flygande prickar
  let ticker = { text: '', x: W }, kamera = 0, kameraY = 0, dragX = null;
  const tick = () => { const n = A.G.nyheter.find((x) => x.typ !== 'DU') || A.G.nyheter[0]; return n ? `${datumText(n.dag)}  ·  ${n.text}` : ''; };
  return {
    tid: true,
    enter() { ticker.text = tick(); },
    ner(x, y) { if (y > 24 && y < 160) dragX = { x, y, k: kamera, ky: kameraY }; },
    flytta(x, y) { if (dragX && U.mus.ned) { kamera = dragX.k - (x - dragX.x); kameraY = dragX.ky - (y - dragX.y); } },
    upp() { dragX = null; },
    rita(ctx, dt) {
      const G = A.G;
      const { L, kx, ky } = ritaKontor(ctx, A, { kamera, kameraY });
      kamera = Math.max(0, Math.min(L.bredd - W, kamera)); kameraY = Math.max(0, Math.min(L.hojd - 202, kameraY));
      if (L.hojd > 202 || L.bredd > W) hit(0, 25, W, 136, { hjul: (dy) => { kameraY += dy; }, block: false });
      if (L.hojd > 202 && kameraY < L.hojd - 206) { const b = Math.round(Math.sin(A.t * 4)); rect(W - 70, 150, 66, 10, 0x0a0d1a); ikon('pil_ned', W - 68, 151 + b, F.guld); text('DRA FÖR MER', W - 58, 152, F.guld); }
      if (L.bredd > W && kamera < L.bredd - W - 4) { rect(W - 70, 139, 66, 10, 0x0a0d1a); ikon('hoger', W - 68, 140, F.guld); text('DRA ÅT SIDAN', W - 58, 141, F.guld); }
      ctx.save(); ctx.translate(-kx, -ky);
      // sur personal säger vad som hjälper
      const onske = onskemal(G);
      if (onske && G.personal.length) {
        const p = G.personal[Math.floor(A.t / 6) % G.personal.length], plats = L.bord[p.bord];
        if (plats && Math.floor(A.t / 3) % 2 === 0) {
          const bw = tw(onske) + 8, bx = plats.x + 18 - bw / 2, by = plats.fy - 54;
          rect(bx, by, bw, 10, 0xffffff); ram(bx, by, bw, 10, 0x2a1f3a); rect(bx + bw / 2 - 1, by + 10, 3, 2, 0xffffff); text(onske, bx + 4, by + 3, F.blak);
        }
      }
      ctx.restore();
      // prickarna
      for (const h of A.handelser.splice(0)) {
        if (h.typ === 'prick') {
          const plats = h.bord != null ? L.bord[h.bord] : L.bord[Math.floor(Math.random() * L.bord.length)];
          if (plats) pr.push({ x: plats.x + 46 - kx, y: plats.fy - 30 - ky, farg: h.farg, t: 0, mal: h.farg === 'bla' ? [300, 178] : [336, 178] });
          if (h.farg === 'bla' || h.farg === 'rod') A.ljud(h.farg === 'bla' ? 'prick' : 'bugg');
        } else if (h.typ === 'ticker') { ticker = { text: h.text, x: W }; }
      }
      for (const p of pr) {
        p.t += dt;
        const f = Math.min(1, p.t / 1.4), x = p.x + (p.mal[0] - p.x) * f * f, y = p.y - 14 * Math.sin(f * Math.PI) + (p.mal[1] - p.y) * f * f;
        const c = p.farg === 'bla' ? F.bla2 : p.farg === 'rod' ? F.rod2 : F.gron2;
        if (p.farg === 'lagad') { ikon('bock', Math.round(p.x - 3), Math.round(p.y - 10 - p.t * 8), F.gron2); }
        else { rect(Math.round(x) - 1, Math.round(y) - 1, 3, 3, c); rect(Math.round(x), Math.round(y) - 1, 1, 1, ljusa(c, 0.5)); }
      }
      for (let i = pr.length - 1; i >= 0; i--) if (pr[i].t > 1.4) pr.splice(i, 1);
      // nyhetsticker
      if (ticker.text) {
        rect(0, 15, W, 9, 0x0a0d1a); rect(0, 24, W, 1, F.hi);
        ticker.x -= dt * 30; const tw_ = tw(ticker.text);
        if (ticker.x < -tw_) { ticker.text = tick(); ticker.x = W; }
        rect(0, 15, 34, 9, F.rod); text('NYTT', 5, 17, F.text);
        ctx.save(); ctx.beginPath(); ctx.rect(36, 15, W - 36, 9); ctx.clip(); text(ticker.text, Math.round(ticker.x), 17, F.text); ctx.restore();
      }
      panelen(A);
      hud(A); flikrad(A, 'kontor');
    },
  };
}

function ring(cx, cy, r, c, tjock = 2) {
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) { const d = Math.hypot(x, y); if (d <= r && d > r - tjock) rect(cx + x, cy + y, 1, 1, c); }
}
function panelen(A) {
  const G = A.G, y = 162, pr = G.projekt.find((p) => p.status === 'bygger') || G.projekt.find((p) => p.status === 'klar');
  panel(2, y, 380, 39, { fyll: F.panel });
  if (pr) {
    const klar = pr.status === 'klar', proc = Math.min(1, pr.dagNu / pr.dagar);
    rect(8, y + 4, 14, 14, mixa(F.orange, F.panel, 0.5)); ikon('telefon', 11, y + 7, F.orange2);
    textB((klar ? '' : 'BYGGER ') + kapa(pr.design.namn, 150), 27, y + 4, F.text);
    text(klar ? `KLAR ${datumText(pr.klarDag)} · BUGGFIXARNA PUTSAR VIDARE` : `DAG ${pr.dagNu} AV ${pr.dagar} · ${Math.round(proc * 100)} % KLART · ${kr(byggkostnadPerDag(G))}/DAG`, 27, y + 14, F.dim);
    matare(8, y + 21, 266, 4, proc, klar ? F.gron : F.orange);
    text('BLÅ PRICK = KVALITET · RÖD = BUGG', 8, y + 30, F.dim2);
    knapp(150, y + 27, 124, 11, klar ? 'LANSERA!' : 'LANSERA NÄR KLAR', { stil: 'gron', av: !klar, klick: () => A.go('lansering', { projekt: pr.id }), namn: 'kontor-lansera' });
    // ringarna med köpknappar under
    ring(298, y + 12, 9, F.bla); textB(String(pr.kvalitet), 298, y + 9, F.text, { just: 'c' }); text('KVALITET', 298, y + 23, F.bla2, { just: 'c' });
    ring(338, y + 12, 9, F.rod); textB(String(pr.buggar), 338, y + 9, F.text, { just: 'c' }); text('BUGGAR', 338, y + 23, F.rod2, { just: 'c' });
    knapp(281, y + 30, 34, 8, '+' + PRICK_FP + ' FP', { stil: 'bla', klick: () => { if (!kopPrick(G, pr.id).ok) A.ljud('fel'); }, av: klar || G.bolag.fp < PRICK_FP });
    knapp(321, y + 30, 34, 8, 'LAGA ' + PRICK_FP, { stil: 'rod', klick: () => { if (!lagaBugg(G, pr.id).ok) A.ljud('fel'); }, av: G.bolag.fp < PRICK_FP || !pr.buggar });
    if (!klar) knapp(362, y + 4, 16, 11, 'X', { stil: 'rod', klick: () => { if (A.bekrafta === pr.id) { avbryt(G, pr.id); A.bekrafta = null; } else { A.bekrafta = pr.id; setTimeout(() => { A.bekrafta = null; }, 2500); } } });
    if (A.bekrafta === pr.id) text('TRYCK X IGEN FÖR ATT AVBRYTA', 358, y - 7, F.rod2, { just: 'h' });
    return;
  }
  // inget bygge: nästa mål, labbet och stora knappen
  const m = nastaMal(G);
  if (m) {
    text(`MÅL ${m.nr} AV 28`, 8, y + 5, F.guld);
    textB(kapa(m.text, 160), 8, y + 13, F.text);
    text('BELÖNING ' + kr(m.belopp), 8, y + 25, F.gron2);
    matare(8, y + 32, 120, 3, G.mal.klara.length / 28, F.guld2);
  }
  // labbet
  const lx = 176;
  const pagar = G.forskning.pagar[0];
  text('LABBET', lx, y + 5, F.bla2);
  if (pagar) { const n = NOD[pagar.nod]; text(kapa(n.namn, 100), lx, y + 13, F.text); text(`${pagar.dagarKvar} DAGAR KVAR`, lx, y + 21, F.dim); matare(lx, y + 29, 90, 3, 1 - pagar.dagarKvar / pagar.totalt, F.bla); }
  else { text('LEDIGT – VÄLJ NY TEKNIK', lx, y + 13, F.orange2); knapp(lx, y + 23, 70, 10, 'FORSKNING', { stil: 'bla', klick: () => A.go('forskning') }); }
  const harBord = G.kontor.bord.some(Boolean);
  const stor = !harBord ? ['STÄLL UT BORD', 'orange', () => A.go('bygg')] : !G.personal.length ? ['ANSTÄLL ETT TEAM', 'rosa', () => A.go('personal')] : ['DESIGNA TELEFON', 'gron', () => A.go('design')];
  knapp(282, y + 8, 94, 22, stor[0], { stil: stor[1], klick: stor[2], namn: 'kontor-stor' });
}
