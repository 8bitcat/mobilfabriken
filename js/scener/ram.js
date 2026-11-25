// Ramen runt spelet: HUD:en överst (bolag, kassa, FP, team, rykte, hastighet) och flikraden nederst.
import { U, F, W, rect, ram, text, textB, knapp, ikon, hit, inne, tw, kapa, ljusa, mixa, BIG } from '../core/ui.js';
import { kr, dec, datumText, arsdel, arAv } from '../sim/bas.js';
import { ljudPa, sattLjud } from '../core/ljud.js';
import { kontorsVarden } from '../sim/kontor.js';
import { gavaKlar } from './gavor.js';
import { $t } from '../core/i18n.js';
import { arSupporter } from '../core/kop.js';

export const INNEHALL = { y: 14, h: 188 };   // ytan mellan HUD och flikrad
export const FLIKAR = [
  { id: 'kontor', namn: $t('KONTOR'), ikon: 'hus' },
  { id: 'telefoner', namn: $t('TELEFONER'), ikon: 'telefon' },
  { id: 'bolaget', namn: $t('BOLAGET'), ikon: 'graf' },
  { id: 'personal', namn: $t('PERSONAL'), ikon: 'team' },
  { id: 'bygg', namn: $t('BYGG'), ikon: 'hammare', farg: F.orange },
  { id: 'design', namn: $t('DESIGN'), ikon: 'penna', farg: F.gron },
  { id: 'forskning', namn: $t('FORSKNING'), ikon: 'kolv' },
  { id: 'nyheter', namn: $t('NYHETER'), ikon: 'tidning' },
];

export function hud(A) {
  const G = A.G, b = G.bolag;
  rect(0, 0, W, 14, 0x0a0d1a); rect(0, 13, W, 1, F.hi);
  // bolagsbricka
  rect(1, 1, 11, 11, F.bla); rect(1, 1, 11, 1, ljusa(F.bla, 0.3)); textB(b.initial, 7, 3, F.text, { just: 'c' });
  // namnet kapas i pixlar så att det slutar före KASSA (x 96); datumet är högst 43 px brett (slutar x 58),
  // så årslinjen börjar på x 61 och täcker aldrig årtalets sista siffra
  text(kapa(b.namn, 78), 15, 2, F.text);
  text(datumText(G.dag), 15, 8, F.dim);
  const del = arsdel(G.dag) - arAv(G.dag); rect(61, 9, 31, 3, F.lo); rect(61, 9, Math.round(31 * del), 3, F.bla);
  hit(0, 0, 94, 13, { klick: () => A.go('bolaget'), namn: 'hud-bolag' });
  const cell = (x, ik, ikc, etikett, varde, vc, namn, klick) => {
    ikon(ik, x, 3, ikc); text(etikett, x + 9, 2, F.dim2); text(varde, x + 9, 8, vc);
    if (klick) hit(x - 1, 0, 50, 13, { klick, namn });
  };
  cell(96, 'pengar', F.gron, $t('KASSA'), kr(b.kassa, b.kassa >= 1e7), b.kassa < 0 ? F.rod2 : F.text, 'hud-kassa', () => A.go('bolaget'));
  cell(158, 'fp', F.bla2, $t('FP'), String(Math.floor(b.fp)), F.text, 'hud-fp', () => A.go('forskning'));
  const v = kontorsVarden(G);
  cell(196, 'team', F.lila2, $t('TEAM'), `${G.personal.length}/${v.bord}`, F.text, 'hud-team', () => A.go('personal'));
  cell(232, 'stjarna', F.guld, $t('RYKTE'), dec(b.rykte, 2), F.text, 'hud-rykte', () => A.go('bolaget'));
  // hastighet
  // SUPPORTER (köp i appen, js/core/kop.js): 8× en gång till ger 16×
  const sup = arSupporter();
  const fart = [[0, 'paus'], [1, '1×'], [2, '2×'], [4, '4×'], [sup && G.fart === 16 ? 16 : 8, sup && G.fart === 16 ? '16' : '8×']];
  let x = 270;
  for (const [f, t] of fart) {
    const aktiv = G.fart === f, w = 13;
    const c = aktiv ? F.bla : inne(x, 1, w, 11) ? F.panel3 : F.panel2;
    rect(x, 1, w, 11, c); rect(x, 1, w, 1, ljusa(c, 0.25));
    if (t === 'paus') ikon('paus', x + 3, 3, aktiv ? F.text : F.dim); else text(t, x + 7, 4, aktiv ? F.text : F.dim, { just: 'c' });
    hit(x, 1, w, 11, { klick: () => A.sattFart(sup && f >= 8 && G.fart === f ? (f === 8 ? 16 : 8) : f), namn: 'fart-' + (f === 16 ? 8 : f) });
    x += w + 1;
  }
  // gåva, ljud, meny
  const gava = gavaKlar(G);   // gåvoserien räknas per bolag (fynd 36)
  ikon('gava', 343, 3, gava ? F.guld : F.dim); if (gava && Math.floor(A.t * 2) % 2) rect(349, 2, 2, 2, F.rod2);
  hit(341, 0, 11, 13, { klick: () => A.go('gavor'), namn: 'hud-gava' });
  ikon(ljudPa() ? 'ljud' : 'tyst', 355, 3, F.dim); hit(353, 0, 11, 13, { klick: () => { sattLjud(!ljudPa()); A.G.installningar.ljud = ljudPa(); } });
  ikon('meny', 368, 3, F.dim); hit(365, 0, 14, 13, { klick: () => A.go('meny'), namn: 'hud-meny' });
}

// Konsolspelet (G.lage 'konsol'): nio flikar. Scenen 'telefoner' heter KONSOLER (den visar telefonerna också när
// telefonavdelningen är öppen) och STUDIOS är spelstudiornas förfrågningar, spelbiblioteket och egna spel.
export const K_FLIKAR = [
  { id: 'kontor', namn: $t('KONTOR'), ikon: 'hus' },
  { id: 'telefoner', namn: $t('KONSOLER'), ikon: 'kontroll' },
  { id: 'studios', namn: $t('STUDIOS'), ikon: 'kassett', farg: F.lila2 },
  { id: 'bolaget', namn: $t('BOLAGET'), ikon: 'graf' },
  { id: 'personal', namn: $t('PERSONAL'), ikon: 'team' },
  { id: 'bygg', namn: $t('BYGG'), ikon: 'hammare', farg: F.orange },
  { id: 'design', namn: $t('DESIGN'), ikon: 'penna', farg: F.gron },
  { id: 'forskning', namn: $t('FORSKNING'), ikon: 'kolv' },
  { id: 'nyheter', namn: $t('NYHETER'), ikon: 'tidning' },
];
export const flikarFor = (G) => (G?.lage === 'konsol' ? K_FLIKAR : FLIKAR);
export function flikrad(A, aktiv) {
  const y = 202, lista = flikarFor(A.G), w = Math.floor(W / lista.length), smal = w < 48;
  rect(0, y, W, 14, 0x0a0d1a); rect(0, y, W, 1, F.hi);
  lista.forEach((f, i) => {
    // smala flikar (nio i konsolspelet): ikonen bara på den valda, annars namnet centrerat
    const x = i * w + (smal ? Math.floor((W - w * lista.length) / 2) : 0), valt = f.id === aktiv, hov = inne(x, y, w, 14);
    const bas = valt ? (f.farg ? mixa(f.farg, F.panel, 0.55) : F.panel3) : hov ? F.panel2 : 0x0a0d1a;
    rect(x + 1, y + 2, w - 2, 12, bas);
    if (f.farg) { rect(x + 1, y + 2, w - 2, 1, f.farg); }
    if (valt) rect(x + 1, y + 13, w - 2, 1, f.farg || F.bla2);
    const tc = valt ? F.text : F.dim;
    if (!smal) { ikon(f.ikon, x + 3, y + 5, valt ? (f.farg || F.bla2) : F.dim2); text(f.namn, x + 12, y + 6, tc); }
    else if (tw(f.namn) + 12 <= w) { ikon(f.ikon, x + 3, y + 5, valt ? (f.farg || F.bla2) : F.dim2); text(f.namn, x + 11, y + 6, tc); }
    else text(f.namn, x + Math.floor(w / 2), y + 6, tc, { just: 'c' });
    hit(x, y, w, 14, { klick: () => A.go(f.id), namn: 'flik-' + f.id });
  });
}
// rubrikrad överst i innehållet: rubrik + underrad (+ "tiden står still")
export function rubrik(text1, rad2, o = {}) {
  textB(text1, 6, 18, F.text);
  const x = 6 + tw(text1, BIG) + 6;
  if (rad2) text(rad2, x, 20, F.dim);
}
