// MENYN – inställningar, spara, starta om handledningen, tillbaka till startskärmen.
import { F, W, rect, text, textB, knapp, panel, stycke, ikon } from '../core/ui.js';
import { hud, flikrad } from './ram.js';
import { sattLjud, ljudPa } from '../core/ljud.js';
import { VERSION, DATE, TITLE } from '../version.js';

export function meny(A) {
  const G = A.G;
  let sparat = '';
  return {
    tid: false,
    rita() {
      rect(0, 14, W, 188, 0x0b0e1c);
      textB('MENY', 4, 16, F.guld);
      panel(8, 28, 180, 168);
      text('INSTÄLLNINGAR', 14, 33, F.text);
      const vaxel = (y, namn, pa, klick, info) => { text(namn, 14, y + 2, F.text); knapp(130, y, 52, 10, pa ? 'PÅ' : 'AV', { stil: pa ? 'gron' : 'morkt', klick }); if (info) text(info, 14, y + 9, F.dim2); };
      vaxel(44, 'STANNA TIDEN NÄR NÅGOT HÄNDER', G.installningar.autopaus, () => { G.installningar.autopaus = !G.installningar.autopaus; }, 'BYGGE KLART, FORSKNING KLAR, MÅL …');
      vaxel(64, 'LJUD', ljudPa(), () => { sattLjud(!ljudPa()); G.installningar.ljud = ljudPa(); });
      text('TELEFONEN RITAS SOM', 14, 86, F.text);
      knapp(14, 94, 80, 10, 'RIKTIG 3D', { stil: 'dim', aktiv: G.installningar.telefon !== 'pixel', klick: () => { G.installningar.telefon = '3d'; } });
      knapp(100, 94, 82, 10, 'PIXEL', { stil: 'dim', aktiv: G.installningar.telefon === 'pixel', klick: () => { G.installningar.telefon = 'pixel'; } });
      vaxel(112, 'SNABBT LÄGE', G.installningar.snabbt, () => { G.installningar.snabbt = !G.installningar.snabbt; }, 'KONTOREN KOSTAR HALVA PRISET');
      knapp(14, 134, 168, 12, 'VISA HANDLEDNINGEN IGEN', { stil: 'bla', klick: () => { G.handledning = { steg: 0, klar: false, av: false }; A.go('kontor'); } });
      knapp(14, 150, 168, 12, sparat || 'SPARA NU', { stil: 'morkt', klick: () => { A.spara(); sparat = 'SPARAT!'; } });
      knapp(14, 166, 168, 12, 'TILL STARTSKÄRMEN', { stil: 'morkt', klick: () => { A.spara(); A.G = null; A.go('start'); } });
      knapp(14, 182, 168, 10, 'TILLBAKA TILL SPELET', { stil: 'gron', klick: () => A.go('kontor') });
      panel(196, 28, 180, 168);
      text('OM SPELET', 202, 33, F.text);
      textB('MOBILFABRIKEN', 202, 44, F.guld);
      text(`VERSION ${VERSION} · ${DATE}`, 202, 56, F.dim);
      text(TITLE, 202, 63, F.dim);
      stycke('STARTA ETT MOBILBOLAG I ETT GARAGE 2007. DESIGNA TELEFONER, LÅT TEAMET BYGGA DEM, LANSERA OCH SÄLJ, FORSKA FRAM NY TEKNIK ÅR FÖR ÅR OCH VÄX TILL ETT HUVUDKONTOR.', 202, 76, 168, F.dim);
      text('TANGENTER', 202, 122, F.text);
      stycke('MELLANSLAG = PAUS · 1-4 = FART · ESC = TILL KONTORET · PILAR = BLÄDDRA I DESIGNERN', 202, 130, 168, F.dim);
      stycke('BYGGT I PIXELSTADENS STIL. TELEFONEN RITAS I RIKTIG 3D ELLER SOM PIXLAR.', 202, 160, 168, F.dim2);
      hud(A);
    },
  };
}
