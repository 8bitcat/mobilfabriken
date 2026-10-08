// Ramen runt spelet: HUD:en överst (bolag, kassa, FP, team, rykte, hastighet) och flikraden nederst.
import { U, F, W, rect, ram, text, textB, knapp, ikon, hit, inne, tw, ljusa, mixa, BIG } from '../core/ui.js';
import { kr, dec, datumText, arsdel, arAv } from '../sim/bas.js';
import { ljudPa, sattLjud } from '../core/ljud.js';
import { kontorsVarden } from '../sim/kontor.js';
import { gavaKlar } from './gavor.js';

export const INNEHALL = { y: 14, h: 188 };   // ytan mellan HUD och flikrad
export const FLIKAR = [
  { id: 'kontor', namn: 'KONTOR', ikon: 'hus' },
  { id: 'telefoner', namn: 'TELEFONER', ikon: 'telefon' },
  { id: 'bolaget', namn: 'BOLAGET', ikon: 'graf' },
  { id: 'personal', namn: 'PERSONAL', ikon: 'team' },
  { id: 'bygg', namn: 'BYGG', ikon: 'hammare', farg: F.orange },
  { id: 'design', namn: 'DESIGN', ikon: 'penna', farg: F.gron },
  { id: 'forskning', namn: 'FORSKNING', ikon: 'kolv' },
  { id: 'nyheter', namn: 'NYHETER', ikon: 'tidning' },
];

export function hud(A) {
  const G = A.G, b = G.bolag;
  rect(0, 0, W, 14, 0x0a0d1a); rect(0, 13, W, 1, F.hi);
  // bolagsbricka
  rect(1, 1, 11, 11, F.bla); rect(1, 1, 11, 1, ljusa(F.bla, 0.3)); textB(b.initial, 7, 3, F.text, { just: 'c' });
  text(b.namn.length > 18 ? b.namn.slice(0, 17) + '…' : b.namn, 15, 2, F.text);
  text(datumText(G.dag), 15, 8, F.dim);
  const del = arsdel(G.dag) - arAv(G.dag); rect(56, 9, 36, 3, F.lo); rect(56, 9, Math.round(36 * del), 3, F.bla);
  hit(0, 0, 94, 13, { klick: () => A.go('bolaget'), namn: 'hud-bolag' });
  const cell = (x, ik, ikc, etikett, varde, vc, namn, klick) => {
    ikon(ik, x, 3, ikc); text(etikett, x + 9, 2, F.dim2); text(varde, x + 9, 8, vc);
    if (klick) hit(x - 1, 0, 50, 13, { klick, namn });
  };
  cell(96, 'pengar', F.gron, 'KASSA', kr(b.kassa, b.kassa >= 1e7), b.kassa < 0 ? F.rod2 : F.text, 'hud-kassa', () => A.go('bolaget'));
  cell(158, 'fp', F.bla2, 'FP', String(Math.floor(b.fp)), F.text, 'hud-fp', () => A.go('forskning'));
  const v = kontorsVarden(G);
  cell(196, 'team', F.lila2, 'TEAM', `${G.personal.length}/${v.bord}`, F.text, 'hud-team', () => A.go('personal'));
  cell(232, 'stjarna', F.guld, 'RYKTE', dec(b.rykte, 2), F.text, 'hud-rykte', () => A.go('bolaget'));
  // hastighet
  const fart = [[0, 'paus'], [1, '1×'], [2, '2×'], [4, '4×'], [8, '8×']];
  let x = 270;
  for (const [f, t] of fart) {
    const aktiv = G.fart === f, w = 13;
    const c = aktiv ? F.bla : inne(x, 1, w, 11) ? F.panel3 : F.panel2;
    rect(x, 1, w, 11, c); rect(x, 1, w, 1, ljusa(c, 0.25));
    if (t === 'paus') ikon('paus', x + 3, 3, aktiv ? F.text : F.dim); else text(t, x + 7, 4, aktiv ? F.text : F.dim, { just: 'c' });
    hit(x, 1, w, 11, { klick: () => A.sattFart(f), namn: 'fart-' + f });
    x += w + 1;
  }
  // gåva, ljud, meny
  const gava = gavaKlar();
  ikon('gava', 343, 3, gava ? F.guld : F.dim); if (gava && Math.floor(A.t * 2) % 2) rect(349, 2, 2, 2, F.rod2);
  hit(341, 0, 11, 13, { klick: () => A.go('gavor'), namn: 'hud-gava' });
  ikon(ljudPa() ? 'ljud' : 'tyst', 355, 3, F.dim); hit(353, 0, 11, 13, { klick: () => { sattLjud(!ljudPa()); A.G.installningar.ljud = ljudPa(); } });
  ikon('meny', 368, 3, F.dim); hit(365, 0, 14, 13, { klick: () => A.go('meny'), namn: 'hud-meny' });
}

export function flikrad(A, aktiv) {
  const y = 202, w = 48;
  rect(0, y, W, 14, 0x0a0d1a); rect(0, y, W, 1, F.hi);
  FLIKAR.forEach((f, i) => {
    const x = i * w, valt = f.id === aktiv, hov = inne(x, y, w, 14);
    const bas = valt ? (f.farg ? mixa(f.farg, F.panel, 0.55) : F.panel3) : hov ? F.panel2 : 0x0a0d1a;
    rect(x + 1, y + 2, w - 2, 12, bas);
    if (f.farg) { rect(x + 1, y + 2, w - 2, 1, f.farg); }
    if (valt) rect(x + 1, y + 13, w - 2, 1, f.farg || F.bla2);
    const tc = valt ? F.text : F.dim;
    ikon(f.ikon, x + 3, y + 5, valt ? (f.farg || F.bla2) : F.dim2);
    text(f.namn, x + 12, y + 6, tc);
    hit(x, y, w, 14, { klick: () => A.go(f.id), namn: 'flik-' + f.id });
  });
}
// rubrikrad överst i innehållet: rubrik + underrad (+ "tiden står still")
export function rubrik(text1, rad2, o = {}) {
  textB(text1, 6, 18, F.text);
  const x = 6 + tw(text1, BIG) + 6;
  if (rad2) text(rad2, x, 20, F.dim);
}
