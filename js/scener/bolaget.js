// BOLAGET – ekonomin, de 28 målen, marknaderna, kontorsflytten och (till sist) att sälja bolaget.
import { U, F, W, rect, ram, text, textB, knapp, panel, kort, ikon, hit, tw, kapa, matare, stycke, lista, stjarnor, ljusa, mixa, BIG } from '../core/ui.js';
import { hud, flikrad } from './ram.js';
import { REGIONER, KONTOR, kontorAv } from '../data/varld.js';
import { MAL, nastaMal, marknadsandel, UTMARKELSER } from '../sim/mal.js';
import { tackning } from '../sim/marknad.js';
import { kravUppfyllt, flytta } from '../sim/kontor.js';
import { betala, nyhet, signal } from '../sim/spel.js';
import { modellVinst } from '../sim/projekt.js';
import { kr, dec, datumText, arAv, tal } from '../sim/bas.js';
import * as Spara from '../core/spara.js';
import { rensaRum } from '../art/kontor-art.js';

const FLIKAR = [['ekonomi', 'EKONOMI'], ['mal', 'MÅL'], ['marknader', 'MARKNADER'], ['kontor', 'KONTOR'], ['salj', 'SÄLJ BOLAGET']];
const KAT = { forsaljning: 'FÖRSÄLJNING', mal: 'MÅLBELÖNINGAR', mobler: 'MÖBLER', loner: 'LÖNER', utveckling: 'UTVECKLING', tillverkning: 'TILLVERKNING', fabrik: 'FABRIKER', reklam: 'REKLAM', kontor: 'KONTOR', personal: 'PERSONAL', marknader: 'MARKNADER', ranta: 'RÄNTA', gavor: 'GÅVOR', lan: 'LÅN' };

export const bolagsVarde = (G) => {
  const vinst = G.produkter.reduce((s, p) => s + Math.max(0, p.veckor.slice(-52).reduce((a, b) => a + b, 0) * (p.pris - p.styck)), 0);
  return Math.max(0, Math.round((G.bolag.kassa - G.lan + 10 * vinst) * G.bolag.rykte));
};

export function bolaget(A, o = {}) {
  const G = A.G;
  let flik = o.flik || 'ekonomi', fel = '', bekr = false;
  const skM = { v: 0 };
  const gjort = (r) => { if (!r.ok) { fel = r.fel || 'GICK INTE'; A.ljud('fel'); } else { fel = ''; A.ljud('mynt'); } };
  return {
    tid: true,
    rita(ctx) {
      rect(0, 14, W, 11, 0x0a0d1a);
      textB('BOLAGET', 4, 16, F.guld); text(G.bolag.namn + ' · GRUNDAT 1 JAN 2007', 50, 18, F.dim);
      let fx = 4;
      for (const [id, n] of FLIKAR) fx += knapp(fx, 27, tw(n) + 10, 10, n, { stil: 'dim', aktiv: flik === id, klick: () => { flik = id; bekr = false; fel = ''; } }) + 3;
      panel(2, 40, 378, 160);
      ({ ekonomi, mal: malVy, marknader, kontor: kontorVy, salj })[flik](ctx);
      if (fel) { rect(2, 190, 378, 10, F.rod); text(fel, 191, 192, F.text, { just: 'c' }); }
      hud(A); flikrad(A, 'bolaget');
    },
  };
  function ekonomi() {
    const a = arAv(G.dag), s = G.stat.ar[a] || { intakt: 0, kostnad: 0, per: {} }, f = G.stat.ar[a - 1];
    // kassagraf
    text('KASSAN VECKA FÖR VECKA', 8, 44, F.text);
    const gx = 8, gy = 52, gw = 220, gh = 70, pts = G.stat.kassa.slice(-110);
    rect(gx, gy, gw, gh, F.lo);
    if (pts.length > 1) {
      const max = Math.max(...pts.map((p) => p[1]), 1), min = Math.min(0, ...pts.map((p) => p[1]));
      const ny = (v) => gy + gh - 2 - Math.round((v - min) / (max - min || 1) * (gh - 4));
      if (min < 0) rect(gx, ny(0), gw, 1, F.rod);
      pts.forEach((p, i) => { const x = gx + Math.round(i * (gw - 2) / Math.max(1, pts.length - 1)) + 1, y = ny(p[1]); rect(x, y, 2, gy + gh - y - 1, mixa(F.gron, F.lo, 0.6)); rect(x, y, 2, 1, F.gron2); });
      text(kr(max, true), gx + 2, gy + 2, F.dim);
    }
    text('KASSA', 8, 128, F.dim); textB(kr(G.bolag.kassa), 8, 135, G.bolag.kassa >= 0 ? F.text : F.rod2);
    text('SÅLDA TOTALT', 120, 128, F.dim); textB(tal(G.bolag.totaltSalda), 120, 135, F.bla2);
    text('RYKTE', 8, 148, F.dim); textB(dec(G.bolag.rykte, 2), 8, 155, F.guld);
    text('BÄSTA BETYG', 120, 148, F.dim); textB(dec(G.bolag.bastaBetyg, 1), 120, 155, F.guld);
    text('LÅN', 8, 168, F.dim); textB(kr(G.lan), 8, 175, G.lan ? F.rod2 : F.dim);
    if (G.lan) knapp(80, 172, 100, 10, 'BETALA AV ' + kr(Math.min(G.lan, Math.max(0, G.bolag.kassa)), true), { stil: 'rod', av: G.bolag.kassa <= 0, klick: () => { const b = Math.min(G.lan, G.bolag.kassa); betala(G, b, 'lan'); G.lan -= b; } });
    // årets resultat per kategori
    text(`ÅR ${a} HITTILLS`, 236, 44, F.text);
    let y = 53;
    const rader = Object.entries(s.per).sort((x, y2) => Math.abs(y2[1]) - Math.abs(x[1])).slice(0, 11);
    for (const [k, v] of rader) { text(KAT[k] || k.toUpperCase(), 236, y, F.dim); text(kr(v, true), 374, y, v >= 0 ? F.gron2 : F.rod2, { just: 'h' }); y += 8; }
    rect(236, y, 138, 1, F.hi); y += 3;
    text('RESULTAT', 236, y, F.text); text(kr(s.intakt - s.kostnad, true), 374, y, s.intakt - s.kostnad >= 0 ? F.gron2 : F.rod2, { just: 'h' }); y += 10;
    if (f) { text(`FÖRRA ÅRET (${a - 1})`, 236, y, F.dim); text(kr(f.intakt - f.kostnad, true), 374, y, f.intakt - f.kostnad >= 0 ? F.gron2 : F.rod2, { just: 'h' }); }
  }
  function malVy() {
    const n = nastaMal(G);
    text(`MÅL KLARA: ${G.mal.klara.length} AV 28`, 8, 44, F.text); matare(100, 45, 120, 4, G.mal.klara.length / 28, F.guld2);
    lista(4, 52, 226, 146, MAL.length, 12, (i, y) => {
      const m = MAL[i], klar = G.mal.klara.includes(m.nr), nu = n && n.nr === m.nr;
      rect(6, y, 222, 11, nu ? mixa(F.guld2, F.panel, 0.7) : F.panel2);
      text(String(m.nr), 16, y + 3, klar ? F.gron2 : nu ? F.guld : F.dim2, { just: 'h' });
      if (klar) ikon('bock', 19, y + 2, F.gron2);
      text(m.text, 28, y + 3, klar ? F.dim : nu ? F.text : F.dim2);
      text(kr(m.belopp, true), 224, y + 3, klar ? F.gron2 : F.guld, { just: 'h' });
    }, skM);
    text('UTMÄRKELSER', 238, 44, F.text);
    UTMARKELSER.forEach((u, i) => { const har = G.mal.utmarkelser.includes(u.id), y = 54 + i * 15; rect(238, y, 138, 13, har ? mixa(F.guld2, F.panel, 0.6) : F.panel2); ikon('stjarna', 241, y + 3, har ? F.guld : F.dim2); text(u.namn, 251, y + 2, har ? F.text : F.dim2); text(kapa(u.text, 120), 251, y + 8, F.dim); });
  }
  function marknader() {
    text('MARKNADER', 8, 44, F.text);
    text(`DU SÄLJER I ${Math.round(tackning(G) * 100)} % AV VÄRLDEN · MARKNADSANDEL ${Math.round(marknadsandel(G) * 1000) / 10} %`, 8, 52, F.dim);
    REGIONER.forEach((r, i) => {
      const har = G.marknad.regioner.includes(r.id), y = 62 + i * 30, kanRykte = G.bolag.rykte >= (r.rykteMin || 0);
      kort(8, y, 366, 26, { vald: har });
      ikon('globe', 13, y + 4, har ? F.gron2 : F.dim);
      textB(r.namn, 24, y + 4, har ? F.text : F.dim);
      text(`${Math.round(r.andel * 100)} % AV VÄRLDENS KÖPARE`, 24, y + 15, F.dim);
      if (har) text('DU SÄLJER HÄR', 368, y + 9, F.gron2, { just: 'h' });
      else {
        if (!kanRykte) text(`KRÄVER RYKTE ${dec(r.rykteMin, 2)}`, 260, y + 9, F.orange2, { just: 'h' });
        knapp(266, y + 7, 102, 12, 'ÖPPNA · ' + kr(r.pris, true), { stil: 'gron', av: !kanRykte || G.bolag.kassa < r.pris, klick: () => {
          betala(G, r.pris, 'marknader'); G.marknad.regioner.push(r.id); nyhet(G, 'DU', `${G.bolag.namn} BÖRJAR SÄLJA I ${r.namn}!`); signal(G, 'toast', { text: 'NY MARKNAD: ' + r.namn, farg: 'gron' }); A.ljud('mal');
        } });
      }
    });
  }
  function kontorVy() {
    text('KONTORET', 8, 44, F.text);
    const i0 = KONTOR.findIndex((k) => k.id === G.kontor.niva);
    KONTOR.forEach((k, i) => {
      const y = 52 + i * 28, nu = i === i0, klar = i < i0, nasta = i === i0 + 1, krav = kravUppfyllt(G, k.id), pris = Math.round(k.pris * (G.installningar.snabbt ? 0.5 : 1));
      kort(8, y, 366, 25, { vald: nu });
      textB(k.namn, 14, y + 4, nu ? F.guld : klar ? F.dim : F.text);
      text(`${k.bord} BORD · ${k.labb} LABBSPÅR · KANDIDATER UPP TILL ${'★'.repeat(k.tak)}`, 14, y + 15, F.dim);
      if (nu) text('NI SITTER HÄR', 368, y + 9, F.guld, { just: 'h' });
      else if (klar) text('AVKLARAT', 368, y + 9, F.dim, { just: 'h' });
      else {
        text(k.kravText ? 'KRAV: ' + k.kravText : '', 262, y + 4, krav ? F.gron2 : F.orange2, { just: 'h' });
        if (nasta) knapp(266, y + 8, 102, 12, 'FLYTTA · ' + kr(pris, true), { stil: 'gron', av: !krav || G.bolag.kassa < pris, klick: () => { const r = flytta(G, k.id); gjort(r); if (r.ok) { rensaRum(); A.go('kontor'); } } });
        else text(kr(pris, true), 368, y + 14, F.dim, { just: 'h' });
      }
    });
  }
  function salj() {
    const varde = bolagsVarde(G), arv = Spara.arv() || { saldaBolag: 0, ytor: [], gamlaBolag: [] };
    textB('SÄLJ BOLAGET', 8, 46, F.guld);
    stycke('NÄR DU SÄLJER FÅR DU ETT ARV TILL NÄSTA BOLAG: +10 % STARTKASSA OCH +10 % FORSKNING PER SÅLT BOLAG (MAX 5), OCH DITT GAMLA BOLAG BLIR EN RIVAL. SPELET BÖRJAR OM I GARAGET 2007.', 8, 58, 360, F.dim);
    text('BOLAGETS VÄRDE', 8, 86, F.dim); textB(kr(varde), 8, 94, F.gron2, { k: 2 });
    text('(KASSA - LÅN + 10 × ÅRSVINSTEN PÅ TELEFONERNA) × RYKTE', 8, 112, F.dim2);
    text(`TIDIGARE SÅLDA BOLAG: ${arv.saldaBolag}`, 8, 124, F.text);
    knapp(8, 140, 160, 16, bekr ? 'ÄR DU SÄKER? TRYCK IGEN' : 'SÄLJ BOLAGET', { stil: 'rod', F: BIG, klick: () => {
      if (!bekr) { bekr = true; return; }
      const nytt = { saldaBolag: Math.min(5, arv.saldaBolag + 1), ytor: [...new Set([...(arv.ytor || []), ...G.legendariska])], gamlaBolag: [...(arv.gamlaBolag || []), { namn: G.bolag.namn, initial: G.bolag.initial, betyg: G.bolag.bastaBetyg, varde }].slice(-5) };
      Spara.sparaArv(nytt); G.salt = { dag: G.dag, varde }; A.spara(); A.G = null; A.go('start');
    } });
  }
}
