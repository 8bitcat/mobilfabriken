// MENYN – inställningar, spara, starta om handledningen, tillbaka till startskärmen.
// Texterna följer spelläget: konsolspelet (G.lage 'konsol', från 1982) eller SNABBSTART 2007 (telefonerna).
import { F, W, rect, text, textB, knapp, panel, stycke, ikon } from '../core/ui.js';
import { hud, flikrad } from './ram.js';
import { sattLjud, ljudPa } from '../core/ljud.js';
import { VERSION, DATE, TITLE } from '../version.js';
// versionstitlarna som nycklar (TITLE skrivs i js/version.js och visas med $t nedan)
$n('Konsolfabriken 1982');
import { arKonsolSpel } from '../sim/spel.js';
import { $n, $t, LANG, LANGS, setLang } from '../core/i18n.js';
import { APPLAGE } from '../core/applage.js';
import { butikFinns } from '../core/kop.js';

const OM = {
  telefon: $t('STARTA ETT MOBILBOLAG I ETT GARAGE 2007. DESIGNA TELEFONER, LÅT TEAMET BYGGA DEM, LANSERA OCH SÄLJ, FORSKA FRAM NY TEKNIK ÅR FÖR ÅR OCH VÄX TILL ETT HUVUDKONTOR.'),
  konsol: APPLAGE === 'konsol' ? $t('STARTA ETT KONSOLBOLAG I ETT GARAGE 1982. DESIGNA SPELKONSOLER, LÅT STUDIOS GÖRA SPEL TILL DEM, LANSERA OCH SÄLJ OCH VÄX TILL ETT HUVUDKONTOR.') : $t('KONSOLSPELET: STARTA I ETT GARAGE 1982. DESIGNA SPELKONSOLER, LÅT STUDIOS GÖRA SPEL TILL DEM, LANSERA OCH SÄLJ, FORSKA FRAM TELEFONERNA 2007 OCH VÄX TILL ETT HUVUDKONTOR.'),
};

export function meny(A) {
  const G = A.G;
  let sparat = '';
  const konsol = arKonsolSpel(G);
  return {
    tid: false,
    rita() {
      rect(0, 14, W, 188, 0x0b0e1c);
      textB($t('MENY'), 4, 16, F.guld);
      if (butikFinns()) knapp(300, 15, 76, 11, $t('BUTIK'), { stil: 'guld', klick: () => A.go('butik'), namn: 'meny-butik' });
      panel(8, 28, 180, 168);
      text($t('INSTÄLLNINGAR'), 14, 33, F.text);
      // etiketten slutar före knappen (x 130), förklaringen ligger under knappen
      const vaxel = (y, namn, pa, klick, info) => { text(namn, 14, y + 2, F.text); knapp(130, y, 52, 10, pa ? $t('PÅ') : $t('AV'), { stil: pa ? 'gron' : 'morkt', klick }); if (info) text(info, 14, y + 12, F.dim2); };
      vaxel(44, $t('PAUSA NÄR NÅGOT HÄNDER'), G.installningar.autopaus, () => { G.installningar.autopaus = !G.installningar.autopaus; }, $t('BYGGE KLART, FORSKNING KLAR, MÅL …'));
      vaxel(64, $t('LJUD'), ljudPa(), () => { sattLjud(!ljudPa()); G.installningar.ljud = ljudPa(); });
      // samma inställning gäller konsolerna och (från 2007) telefonerna
      text(konsol ? $t('KONSOLEN RITAS SOM') : $t('TELEFONEN RITAS SOM'), 14, 86, F.text);
      knapp(14, 94, 80, 10, $t('RIKTIG 3D'), { stil: 'dim', aktiv: G.installningar.telefon !== 'pixel', klick: () => { G.installningar.telefon = '3d'; } });
      knapp(100, 94, 82, 10, $t('PIXEL'), { stil: 'dim', aktiv: G.installningar.telefon === 'pixel', klick: () => { G.installningar.telefon = 'pixel'; } });
      vaxel(112, $t('SNABBT LÄGE'), G.installningar.snabbt, () => { G.installningar.snabbt = !G.installningar.snabbt; }, $t('KONTOREN KOSTAR HALVA PRISET'));
      knapp(14, 134, 168, 12, $t('VISA HANDLEDNINGEN IGEN'), { stil: 'bla', klick: () => { G.handledning = { steg: 0, klar: false, av: false }; A.go('kontor'); } });
      knapp(14, 150, 168, 12, sparat || $t('SPARA NU'), { stil: 'morkt', klick: () => { A.spara(); sparat = $t('SPARAT!'); } });
      knapp(14, 166, 168, 12, $t('TILL STARTSKÄRMEN'), { stil: 'morkt', klick: () => { A.spara(); A.G = null; A.go('start'); } });
      knapp(14, 182, 168, 10, $t('TILLBAKA TILL SPELET'), { stil: 'gron', klick: () => A.go('kontor') });
      panel(196, 28, 180, 168);
      text($t('OM SPELET'), 202, 33, F.text);
      textB(APPLAGE === 'konsol' ? $t('KONSOLIMPERIET') : $t('MOBILFABRIKEN'), 202, 44, F.guld);
      text($t`VERSION ${VERSION} · ${DATE}`, 202, 56, F.dim);
      if (APPLAGE !== 'telefon') text($t(TITLE), 202, 63, F.dim);
      stycke(OM[konsol ? 'konsol' : 'telefon'], 202, 76, 168, F.dim);
      text($t('TANGENTER'), 202, 122, F.text);
      stycke($t('MELLANSLAG = PAUS · 1-4 = FART · ESC = TILL KONTORET · PILAR = BLÄDDRA I DESIGNERN'), 202, 130, 168, F.dim);
      stycke(konsol ? $t('BYGGT I PIXELSTADENS STIL. KONSOLERNA RITAS I RIKTIG 3D ELLER SOM PIXLAR.') : $t('BYGGT I PIXELSTADENS STIL. TELEFONEN RITAS I RIKTIG 3D ELLER SOM PIXLAR.'), 202, 160, 168, F.dim2);
      // språket: SPRÅK / LANGUAGE står på båda språken, och varje språk heter sitt eget namn. Klick sparar och laddar om.
      text('SPRÅK / LANGUAGE', 202, 184, F.text);
      LANGS.forEach((l, i) => knapp(274 + i * 50, 182, 46, 10, l.name, { stil: 'dim', aktiv: l.id === LANG, klick: () => setLang(l.id), namn: 'meny-sprak-' + l.id }));
      hud(A);
    },
  };
}
