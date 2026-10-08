// NYHETER – världshändelser, rubriker (DU / RIVAL / VÄRLD) och vad kritikerna väntar sig i år.
import { U, F, W, rect, ram, text, textB, knapp, panel, ikon, hit, tw, kapa, stycke, lista, radbryt, ljusa, mixa, BIG } from '../core/ui.js';
import { hud, flikrad } from './ram.js';
import { GRUPPER, DELAR } from '../data/delar.js';
import { forvantan, harDel } from '../sim/design.js';
import { aktivaHandelser, snitt } from '../sim/marknad.js';
import { datumText, arAv, dec } from '../sim/bas.js';

const TAGG = { DU: [F.gron, 'DU'], RIVAL: [F.orange, 'RIVAL'], 'VÄRLD': [F.bla, 'VÄRLD'] };

export function nyheter(A) {
  const G = A.G, sk = { v: 0 };
  return {
    tid: true,
    rita() {
      rect(0, 14, W, 11, 0x0a0d1a);
      textB('NYHETER', 4, 16, F.guld); text('VÄRLDSHÄNDELSER, RIVALERNAS LANSERINGAR OCH TRENDER', 52, 18, F.dim);
      // vänster
      panel(2, 27, 236, 173);
      text('PÅGÅENDE VÄRLDSHÄNDELSER', 7, 31, F.text); rect(4, 31, 2, 6, F.bla);
      const h = aktivaHandelser(G);
      let y = 39;
      if (!h.length) { text('INGET SÄRSKILT HÄNDER JUST NU.', 7, y, F.dim); y += 9; }
      for (const e of h.slice(0, 2)) { text(`${e.namn} · TILL ${datumText(e.slutDag)}`, 7, y, F.lila2); y += 7; y += stycke(e.text, 7, y, 226, F.dim, { rad: 6 }) + 2; }
      text('RUBRIKER', 7, y + 2, F.text); rect(4, y + 2, 2, 6, F.bla); y += 10;
      const rubriker = G.nyheter;
      // fast radhöjd: etikett + datum, sedan upp till två textrader
      lista(4, y, 232, 198 - y, rubriker.length, 25, (i, yy) => {
        const n = rubriker[i], [c, t] = TAGG[n.typ] || TAGG['VÄRLD'];
        rect(6, yy, 226, 23, F.panel2); rect(6, yy, 2, 23, c);
        rect(11, yy + 2, tw(t) + 6, 7, mixa(c, F.panel2, 0.4)); text(t, 14, yy + 3, F.text);
        text(datumText(n.dag), 11 + tw(t) + 10, yy + 3, F.dim);
        const rad = radbryt(n.text, 216);
        text(rad[0], 11, yy + 10, F.text);
        if (rad[1]) text(kapa(rad.slice(1).join(' '), 216), 11, yy + 16, F.text);
      }, sk);
      // höger: kritikernas förväntningar
      const ar = arAv(G.dag);
      panel(242, 27, 138, 173);
      text(`KRITIKERNA VÄNTAR SIG ${ar}`, 247, 31, F.text); rect(244, 31, 2, 6, F.bla);
      text('FORM, STORLEK OCH FÄRG ÄR DITT VAL.', 247, 39, F.gron2);
      text(`SNITTET I ÅR: ${dec(snitt(G.dag), 1)}/10`, 247, 46, F.guld);
      text('BÄSTA TEKNIK SOM FINNS NU', 247, 55, F.dim);
      GRUPPER.forEach((g, i) => {
        const e = forvantan(g.id, ar), del = DELAR[g.id][e], har = harDel(G, g.id, del.id), y2 = 63 + i * 10;
        text(kapa(g.namn, 52), 247, y2 + 2, F.text);
        const w = 70, x = 306;
        rect(x, y2, w, 9, har ? mixa(F.gron, F.panel, 0.55) : mixa(F.orange, F.panel, 0.6));
        text(kapa(del.namn, 50) + (har ? '' : ' (FORSKA)'), x + w / 2, y2 + 2, har ? F.gron2 : F.orange2, { just: 'c' });
        if (har) ikon('bock', x + w - 9, y2 + 1, F.gron2);
      });
      hud(A); flikrad(A, 'nyheter');
    },
  };
}
