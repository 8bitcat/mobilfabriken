// TELEFONER – dina enheter till salu och hur de står sig mot konkurrenterna (förlagans "Your phones").
// Ändra pris, lägg ner, gå viralt, släpp uppdatering 1.1. Plus MUSEET med alla telefoner du gjort.
import { U, F, W, rect, ram, text, textB, knapp, panel, kort, ikon, hit, tw, kapa, matare, stycke, lista, reglage, stjarnor, ljusa, mixa, BIG } from '../core/ui.js';
import * as Vy3d from '../telefon/vy3d.js';
import { ritaTelefon } from '../telefon/telefon3d.js';
import { Pix } from '../art/kit.js';
import { hud, flikrad } from './ram.js';
import { telAv } from '../sim/design.js';
import { rimligtPris, veckoEfterfragan, rivalModell, buzz, veckaAv } from '../sim/marknad.js';
import { andraPris, laggNer, bliViral, kanViral, uppdatering, modellVinst, VIRAL_FP, PRICK_FP } from '../sim/projekt.js';
import { KAMPANJER, RIVALER } from '../data/varld.js';
import { kr, dec, datumText, tal } from '../sim/bas.js';

const MINI = new Map();
function mini(d) {
  const key = d.id; let c = MINI.get(key); if (c) return c;
  const P = new Pix(30, 40); ritaTelefon(P, 15, 20, 22, telAv(d), 0.5, 0.15); c = P.flush(); MINI.set(key, c); return c;
}

export function telefoner(A, o = {}) {
  const G = A.G;
  let valdId = o.produkt || [...G.produkter].reverse().find((p) => p.aktiv)?.id || G.produkter[G.produkter.length - 1]?.id;
  let nyttPris = null, spin = 0.3, lage = 'salu', bekr = false, fel = '';
  const skP = { v: 0 }, skR = { v: 0 }, skM = { v: 0 };
  const gjort = (r) => { if (!r.ok) { fel = r.fel || 'GICK INTE'; A.ljud('fel'); } else { fel = ''; A.ljud('mynt'); } };
  return {
    tid: true,
    rita(ctx, dt) {
      spin += dt * 0.6;
      rect(0, 14, W, 11, 0x0a0d1a);
      textB('TELEFONER', 4, 16, F.guld); text('DINA ENHETER TILL SALU OCH HUR DE STÅR SIG', 66, 18, F.dim);
      knapp(W - 128, 15, 60, 9, 'TILL SALU', { stil: 'dim', aktiv: lage === 'salu', klick: () => { lage = 'salu'; } });
      knapp(W - 64, 15, 60, 9, 'MUSEET (' + G.produkter.length + ')', { stil: 'dim', aktiv: lage === 'museum', klick: () => { lage = 'museum'; } });
      if (lage === 'museum') { museum(ctx); hud(A); flikrad(A, 'telefoner'); return; }
      // vänster: dina enheter + konkurrenterna
      panel(2, 27, 140, 173);
      text('DINA ENHETER', 6, 31, F.text);
      const egna = [...G.produkter].reverse().sort((a, b) => b.aktiv - a.aktiv);
      if (!egna.length) stycke('INGA TELEFONER TILL SALU ÄN. DESIGNA DIN FÖRSTA OCH LANSERA DEN!', 6, 40, 130, F.dim);
      const hEgna = Math.min(64, Math.max(20, egna.length * 21));
      lista(4, 38, 136, hEgna, egna.length, 21, (i, y) => {
        const p = egna[i], vald = p.id === valdId;
        kort(6, y, 130, 19, { vald, klick: () => { valdId = p.id; nyttPris = null; bekr = false; } });
        rect(9, y + 3, 9, 13, F.lo); ikon('telefon', 10, y + 6, p.aktiv ? F.bla2 : F.dim2);
        text(kapa(p.namn, 80), 21, y + 4, p.aktiv ? F.text : F.dim);
        text(p.aktiv ? `${p.lager} I LAGER · ${tal(p.salda)} SÅLDA` : `UTGÅNGEN · ${tal(p.salda)} SÅLDA`, 21, y + 11, p.aktiv ? F.gron2 : F.dim2);
        textB(dec(p.betyg, 1), 132, y + 6, F.guld, { just: 'h' });
      }, skP);
      const ry = 40 + hEgna + 4;
      text('KONKURRENTER PÅ MARKNADEN', 6, ry, F.text);
      const riv = G.marknad.rivaler.map(rivalModell).sort((a, b) => b.lanseradDag - a.lanseradDag);
      lista(4, ry + 7, 136, 198 - ry - 7, riv.length, 19, (i, y) => {
        const r = riv[i];
        rect(6, y, 130, 17, F.panel2);
        rect(8, y + 2, 13, 13, r.farg); rect(8, y + 2, 13, 1, ljusa(r.farg, 0.4)); text(r.bolag.slice(0, 2), 14, y + 6, 0xffffff, { just: 'c' });
        text(kapa(r.namn, 76), 24, y + 3, F.text); text(`${kapa(r.bolag, 46)} · ${kr(r.pris, true)}`, 24, y + 10, F.dim);
        textB(dec(r.betyg, 1), 133, y + 5, r.betyg >= 7 ? F.gron2 : r.betyg >= 6 ? F.guld : F.orange2, { just: 'h' });
      }, skR);
      // höger: vald telefon
      const p = G.produkter.find((x) => x.id === valdId);
      if (!p) { panel(146, 27, 234, 173); textB('INGEN TELEFON ÄN', 263, 90, F.dim, { just: 'c' }); knapp(213, 104, 100, 14, 'DESIGNA EN TELEFON', { stil: 'gron', klick: () => A.go('design') }); hud(A); flikrad(A, 'telefoner'); return; }
      panel(146, 27, 234, 173);
      for (let j = 0; j < 84; j++) rect(148, 29 + j, 80, 1, mixa(0x1c2050, 0x0e1230, j / 84));
      Vy3d.visa({ x: 148, y: 29, w: 80, h: 84 }, telAv(p.design), { vy: 'auto', spin, pitch: 0.15, pixel: G.installningar.telefon === 'pixel', ctx });
      textB(kapa(p.namn, 148), 232, 30, F.text);
      const kamp = KAMPANJER.find((k) => k.id === p.kampanj);
      text(`${p.design.enhet === 'telefon' ? 'TELEFON' : p.design.enhet.toUpperCase()} · ${datumText(p.lanseradDag)} · ${kamp?.namn || ''}`, 232, 40, F.dim);
      const vinst = modellVinst(p), vecka = Math.round(veckoEfterfragan(G, p));
      const korten = [
        ['BETYG', dec(p.betyg, 1) + ' / 10', F.guld], ['PRIS', kr(p.pris), F.text], ['KOSTAR', kr(p.styck), F.text],
        ['SÅLDA', tal(p.salda), F.bla2], ['INTÄKT', kr(p.intakt, true), F.text], ['VINST', kr(vinst, true), vinst >= 0 ? F.gron2 : F.rod2],
        ['I LAGER', String(p.lager) + (p.bestallning ? ' (+' + p.bestallning.antal + ')' : ''), F.text], ['FÖRRA V.', String(p.forraVeckan), F.text], ['MISSADE', String(p.missade), p.missade ? F.orange2 : F.text],
      ];
      korten.forEach(([e, v, c], i) => { const x = 232 + (i % 3) * 49, y = 48 + Math.floor(i / 3) * 19; rect(x, y, 47, 17, F.panel2); text(e, x + 3, y + 3, F.dim); text(kapa(v, 43), x + 3, y + 10, c); });
      // priset
      const rim = Math.round(rimligtPris(G.dag, p.betyg) / 10) * 10;
      if (p.aktiv) {
        const np = nyttPris ?? p.pris;
        text('NYTT PRIS', 150, 116, F.dim); text(kr(np), 226, 116, np !== p.pris ? F.guld : F.text, { just: 'h' });
        reglage(150, 125, 76, np, Math.round(p.styck * 0.6 / 10) * 10, Math.round(rim * 2.2 / 10) * 10, (v) => { nyttPris = Math.round(v / 10) * 10; });
        knapp(232, 116, 70, 12, 'UPPDATERA PRIS', { stil: 'bla', av: np === p.pris, klick: () => { gjort(andraPris(G, p.id, np)); nyttPris = null; } });
        knapp(306, 116, 70, 12, bekr ? 'SÄKER? REA 50 %' : 'LÄGG NER', { stil: 'rod', klick: () => { if (bekr) { gjort(laggNer(G, p.id)); bekr = false; } else bekr = true; } });
        rect(150, 134, 226, 12, mixa(F.gron, F.panel, 0.7)); ram(150, 134, 226, 12, F.gron);
        text('AUTOMATISK PRODUKTION ÄR PÅ', 154, 138, F.gron2);
        knapp(296, 135, 79, 10, 'BLI VIRAL · ' + VIRAL_FP + ' FP', { stil: 'rosa', av: !kanViral(G, p) || G.bolag.fp < VIRAL_FP, klick: () => gjort(bliViral(G, p.id)) });
        if (p.buggar) knapp(150, 148, 120, 9, `UPPDATERING 1.1 (${p.buggar * PRICK_FP} FP)`, { stil: 'orange', av: G.bolag.fp < p.buggar * PRICK_FP, klick: () => gjort(uppdatering(G, p.id)) });
        stycke(`KÖPARE TYCKER ATT EN ${dec(p.betyg, 1)}/10-TELEFON ÄR VÄRD UNGEFÄR ${kr(rim)} IDAG. NU ~${vecka} KÖPARE/VECKA · BUZZ ${Math.round(buzz(p, G.dag) * 100)} %.`, 150, p.buggar ? 159 : 149, 226, F.dim, { rad: 6 });
      } else text(`UTGÅNGEN ${datumText(p.nedlagdDag)} · SÅLDES I ${p.veckor.length} VECKOR`, 150, 120, F.dim);
      // staplar per vecka
      const gy = 179, gh = 19, v = p.veckor.slice(-46), max = Math.max(10, ...v);
      text('SÅLDA PER VECKA', 150, gy - 1, F.text);
      rect(150, gy + 6, 226, gh, F.lo);
      v.forEach((n, i) => { const h = Math.round((n / max) * (gh - 2)), x = 152 + i * 4.9; rect(Math.round(x), gy + 6 + gh - 1 - h, 4, h, F.bla); rect(Math.round(x), gy + 6 + gh - 1 - h, 4, 1, F.bla2); });
      if (fel) { rect(146, 15, 120, 9, F.rod); text(fel, 148, 17, F.text); }
      hud(A); flikrad(A, 'telefoner');
    },
  };
  function museum(ctx) {
    panel(2, 27, 378, 173);
    text('MUSEET – ALLA TELEFONER DU HAR GJORT', 6, 31, F.guld);
    const alla = [...G.produkter];
    if (!alla.length) { stycke('HÄR SAMLAS VARJE TELEFON DU LANSERAR, MED BETYG OCH HUR MÅNGA SOM SÅLDES.', 6, 42, 300, F.dim); return; }
    const per = 9, rader = Math.ceil(alla.length / per);
    lista(4, 39, 374, 160, rader, 56, (r, y) => {
      for (let k = 0; k < per; k++) {
        const p = alla[r * per + k]; if (!p) break;
        const x = 6 + k * 41;
        rect(x, y, 39, 54, F.panel2); ctx.drawImage(mini(p.design), x + 4, y + 1);
        text(kapa(p.namn, 37), x + 2, y + 41, F.text); text(dec(p.betyg, 1) + ' · ' + kr(p.salda, true).replace(' KR', ''), x + 2, y + 47, F.guld);
        hit(x, y, 39, 54, { klick: () => { valdId = p.id; } });
      }
    }, skM);
  }
}
