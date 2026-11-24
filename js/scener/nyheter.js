// NYHETER – världshändelser, rubriker (DU / RIVAL / VÄRLD / STUDIO) och vad kritikerna väntar sig i år.
// Konsolspelet (G.lage 'konsol'): STUDIO-rubrikerna (förfrågningar, avtal, spelsläpp) är lila med en kassett och
// rubrikerna går att filtrera. Kritikernas förväntan gäller konsolernas nio delgrupper – med en flik för telefonerna
// när telefonavdelningen är öppen – och under dem står rivalkonsolerna som säljs just nu.
import { U, F, W, rect, ram, text, textB, knapp, panel, ikon, hit, tw, kapa, stycke, lista, radbryt, ljusa, mixa, BIG } from '../core/ui.js';
import { hud, flikrad } from './ram.js';
import { linjeAv } from '../data/linjer.js';
import { forvantan, harDel } from '../sim/design.js';
import { aktivaHandelser, snitt } from '../sim/marknad.js';
import { arKonsolSpel } from '../sim/spel.js';
import { aktivaRivalKonsoler } from '../sim/konsol.js';
import { datumText, arAv, dec } from '../sim/bas.js';
import { $t } from '../core/i18n.js';

// typ → [färg, etikett, ikon]
const TAGG = { DU: [F.gron, $t('DU')], RIVAL: [F.orange, $t('RIVAL')], 'VÄRLD': [F.bla, $t('VÄRLD')], STUDIO: [F.lila, $t('STUDIO'), 'kassett'] };
// konsolspelets filter över rubrikerna
const FILTER = [['alla', $t('ALLA')], ['STUDIO', $t('STUDIO')], ['RIVAL', $t('RIVAL')], ['DU', $t('DU')]];
// typsnittet saknar minustecknet (−40 % i händelsetexterna): ritas som ett vanligt bindestreck
const ren = (s) => String(s).replace(/−/g, '-');

export function nyheter(A) {
  const G = A.G, sk = { v: 0 }, konsol = arKonsolSpel(G);
  let filter = 'alla', hoger = 'konsol';   // hoger: kritikernas lista i konsolspelet ('konsol' | 'telefon')
  return {
    tid: true,
    rita() {
      rect(0, 14, W, 11, 0x0a0d1a);
      textB($t('NYHETER'), 4, 16, F.guld); text($t('VÄRLDSHÄNDELSER, RIVALERNAS LANSERINGAR OCH TRENDER'), 52, 18, F.dim);
      // vänster
      panel(2, 27, 236, 173);
      text($t('PÅGÅENDE VÄRLDSHÄNDELSER'), 7, 31, F.text); rect(4, 31, 2, 6, F.bla);
      const h = aktivaHandelser(G);
      let y = 39;
      if (!h.length) { text($t('INGET SÄRSKILT HÄNDER JUST NU.'), 7, y, F.dim); y += 9; }
      for (const e of h.slice(0, 2)) { text($t`${e.namn} · TILL ${datumText(e.slutDag)}`, 7, y, F.lila2); y += 7; y += stycke(ren(e.text), 7, y, 226, F.dim, { rad: 6 }) + 2; }
      text($t('RUBRIKER'), 7, y + 2, F.text); rect(4, y + 2, 2, 6, F.bla);
      // konsolspelet: filterknapparna till höger på rubrikraden (studiornas rubriker blir många)
      if (konsol) {
        let fx = 232;
        for (const [id, namn] of [...FILTER].reverse()) {
          const w = tw(namn) + 8; fx -= w;
          knapp(fx, y, w, 9, namn, { stil: 'dim', aktiv: filter === id, klick: () => { filter = id; sk.v = 0; }, namn: 'nyheter-filter-' + id.toLowerCase() });
          fx -= 3;
        }
      }
      y += 10;
      const rubriker = filter === 'alla' ? G.nyheter : G.nyheter.filter((n) => n.typ === filter);
      if (!rubriker.length) text($t('INGA SÅDANA RUBRIKER ÄN.'), 7, y + 2, F.dim);
      // fast radhöjd: etikett + datum, sedan upp till två textrader
      lista(4, y, 232, 198 - y, rubriker.length, 25, (i, yy) => {
        const n = rubriker[i], [c, t, ik] = TAGG[n.typ] || TAGG['VÄRLD'], iw = ik ? 9 : 0;
        // studiornas rubriker har en svag lila ton och kassetten i etiketten
        rect(6, yy, 226, 23, ik ? mixa(F.lila, F.panel2, 0.86) : F.panel2); rect(6, yy, 2, 23, c);
        rect(11, yy + 2, tw(t) + 6 + iw, 7, mixa(c, F.panel2, 0.4));
        if (ik) ikon(ik, 13, yy + 2, ljusa(F.lila2, 0.5));
        text(t, 14 + iw, yy + 3, F.text);
        text(datumText(n.dag), 11 + tw(t) + iw + 10, yy + 3, F.dim);
        const rad = radbryt(ren(n.text), 216);
        text(rad[0], 11, yy + 10, F.text);
        if (rad[1]) text(kapa(rad.slice(1).join(' '), 216), 11, yy + 16, F.text);
      }, sk);
      // höger: kritikernas förväntningar (konsolerna eller telefonerna)
      const ar = arAv(G.dag), linje = konsol && !(G.flaggor.mobil && hoger === 'telefon') ? 'konsol' : 'telefon', Li = linjeAv(linje);
      panel(242, 27, 138, 173);
      text($t`KRITIKERNA VÄNTAR SIG ${ar}`, 247, 31, F.text); rect(244, 31, 2, 6, F.bla);
      if (konsol && G.flaggor.mobil) {
        // telefonavdelningen är öppen: välj vilken linje listan gäller
        knapp(247, 37, 62, 8, $t('KONSOLER'), { stil: 'dim', aktiv: linje === 'konsol', klick: () => { hoger = 'konsol'; }, namn: 'nyheter-krit-konsol' });
        knapp(312, 37, 62, 8, $t('TELEFONER'), { stil: 'dim', aktiv: linje === 'telefon', klick: () => { hoger = 'telefon'; }, namn: 'nyheter-krit-telefon' });
      } else text(linje === 'konsol' ? $t('KAROSS, FÄRG OCH YTA ÄR DITT VAL.') : $t('FORM, STORLEK OCH FÄRG ÄR DITT VAL.'), 247, 39, F.gron2);
      text($t`SNITTET I ÅR: ${dec(snitt(G.dag, linje), 1)}/10`, 247, 46, F.guld);
      if (konsol) { text($t('BÄSTA TEKNIK NU'), 247, 55, F.dim); ikon('kolv', 334, 54, F.orange2); text($t('FORSKA'), 343, 55, F.orange2); }
      else text($t('BÄSTA TEKNIK SOM FINNS NU'), 247, 55, F.dim);
      Li.GRUPPER.forEach((g, i) => {
        const e = forvantan(g.id, ar, linje), del = Li.DELAR[g.id][e], har = harDel(G, g.id, del.id, linje), y2 = 63 + i * 10;
        text(kapa(g.namn, 52), 247, y2 + 2, F.text);
        const w = 70, x = 306;
        rect(x, y2, w, 9, har ? mixa(F.gron, F.panel, 0.55) : mixa(F.orange, F.panel, 0.6));
        if (konsol) {
          // konsolspelet: namnet ryms alltid i rutan – en bock (finns) eller en kolv (forska fram) till höger
          text(kapa(del.namn, w - 14), x + (w - 10) / 2, y2 + 2, har ? F.gron2 : F.orange2, { just: 'c' });
          ikon(har ? 'bock' : 'kolv', x + w - 9, y2 + 1, har ? F.gron2 : F.orange2);
        } else {
          const dn = kapa(del.namn, 50);
          text(har ? dn : $t`${dn} (FORSKA)`, x + w / 2, y2 + 2, har ? F.gron2 : F.orange2, { just: 'c' });
          if (har) ikon('bock', x + w - 9, y2 + 1, F.gron2);
        }
      });
      // konsollistan är kortare (nio grupper): de bästa rivalkonsolerna i butikerna just nu
      if (linje === 'konsol') rivaler(63 + Li.GRUPPER.length * 10 + 3);
      hud(A); flikrad(A, 'nyheter');
    },
  };
  function rivaler(y) {
    text($t('RIVALKONSOLER I BUTIKERNA'), 247, y, F.text); rect(244, y, 2, 6, F.orange);
    const R = aktivaRivalKonsoler(G).sort((a, b) => b.betyg - a.betyg), plats = Math.max(0, Math.floor((198 - (y + 8)) / 8));
    if (!R.length) { text($t('INGA ÄN.'), 247, y + 9, F.dim); return; }
    R.slice(0, plats).forEach((r, i) => {
      const yy = y + 9 + i * 8, b = dec(r.betyg, 1);
      text(kapa(r.namn, 120 - tw(b) - 4), 247, yy, F.dim);
      text(b, 375, yy, r.betyg >= 7 ? F.gron2 : r.betyg >= 6 ? F.guld : F.orange2, { just: 'h' });
    });
  }
}
