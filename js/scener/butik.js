// BUTIKEN – köp i appen (js/core/kop.js). Öppnas bara från MENY och bara i App Store-appen. Priserna kommer från
// Apple i spelarens valuta; beloppen (pengar, FP) räknas för bolaget som är öppet och visas före köpet.
import { F, W, rect, text, textB, knapp, panel, ikon, stycke, kapa } from '../core/ui.js';
import { hud } from './ram.js';
import { kr } from '../sim/bas.js';
import { $t } from '../core/i18n.js';
import { PRODUKTER, ager, prisFor, hamtaPriser, kopa, aterstall, pengarFor, fpFor, senasteTack, arSupporter } from '../core/kop.js';

export function butik(A) {
  const G = A.G;
  let upptagen = null, besked = '', beskedFarg = F.gron2, prisFel = false;
  const visa = (t, ok = true) => { besked = t || ''; beskedFarg = ok ? F.gron2 : F.rod2; };
  hamtaPriser().catch(() => { prisFel = true; });
  const effekt = (p) => (p.typ === 'pengar' ? $t`+${kr(pengarFor(G, p), true)} I KASSAN` : p.typ === 'fp' ? $t`+${fpFor(G)} FP` : '');
  return {
    tid: false,
    rita() {
      rect(0, 14, W, 188, 0x0b0e1c);
      textB($t('BUTIK'), 4, 16, F.guld);
      text($t('KÖPEN BETALAS MED RIKTIGA PENGAR VIA APPLE'), 380, 18, F.dim2, { just: 'h' });
      const t = senasteTack(); if (t) visa(t);
      panel(8, 28, 368, 140);
      PRODUKTER.forEach((p, i) => {
        const y = 32 + i * 27, din = ager(p), pris = prisFor(p);
        rect(12, y, 360, 25, i % 2 ? 0x121730 : 0x151b36);
        ikon(p.ikon, 16, y + 9, p.typ === 'guld' ? F.guld : p.typ === 'fp' ? F.bla2 : p.typ === 'supporter' ? F.rod2 : F.gron);
        textB(p.namn, 28, y + 3, F.text);
        text(kapa(p.text, 200), 28, y + 15, F.dim);
        const e = effekt(p); if (e) text(e, 290, y + 9, F.gron2, { just: 'h' });
        if (din) { ikon('bock', 318, y + 9, F.gron2); text($t('DIN'), 330, y + 10, F.gron2); }
        else knapp(296, y + 5, 72, 15, upptagen === p.id ? $t('KÖPER …') : pris || (prisFel ? '–' : '…'), {
          stil: 'gron', av: !pris || !!upptagen, namn: 'butik-kop-' + p.id,
          klick: async () => { upptagen = p.id; visa(''); const r = await kopa(A, p); upptagen = null; visa(r.text, r.ok); if (r.ok) A.ljud?.('mynt'); },
        });
      });
      if (prisFel) text($t('PRISERNA GICK INTE ATT HÄMTA. KOLLA INTERNET OCH ÖPPNA BUTIKEN IGEN.'), 12, 172, F.rod2);
      else if (besked) text(kapa(besked, 360), 12, 172, beskedFarg);
      else stycke($t('ENGÅNGSKÖPEN FÖLJER DITT APPLE-KONTO. PENGAR OCH FORSKNING GÄLLER BOLAGET SOM ÄR ÖPPET.'), 12, 172, 360, F.dim2);
      if (arSupporter()) text($t('TACK FÖR ATT DU STÖDJER SPELET!'), 380, 196, F.guld, { just: 'h' });
      knapp(8, 186, 90, 12, $t('ÅTERSTÄLL KÖP'), { stil: 'morkt', av: !!upptagen, namn: 'butik-aterstall', klick: async () => { upptagen = 'aterstall'; const r = await aterstall(A); upptagen = null; visa(r.text, r.n > 0); } });
      knapp(104, 186, 90, 12, $t('TILLBAKA'), { stil: 'gron', namn: 'butik-tillbaka', klick: () => A.go('meny') });
      hud(A);
    },
    tangent(e) { if (e.key === 'Escape') { A.go('meny'); return true; } return false; },
  };
}
