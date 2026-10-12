// PERSONAL – anställ, träna och håll teamet glatt. Tiden står still här (som i förlagan).
import { U, F, W, rect, ram, text, textB, knapp, panel, kort, ikon, hit, tw, kapa, matare, stjarnor, lista, stycke, ljusa, mixa, BIG } from '../core/ui.js';
import { personSprite } from '../core/people.js';
import { hud, flikrad } from './ram.js';
import { ROLLER } from '../data/varld.js';
import { kr, dec } from '../sim/bas.js';
import { anstall, sparka, teamfest, festPris, omrull, omrullPris, kanTrana, trana, ledigaBord, lonPerManad, fpPerDag, moralFaktor, maxStjarnor } from '../sim/personal.js';
import { kontorsVarden } from '../sim/kontor.js';

// bysten ur personens sprite (24×22)
function byst(ctx, look, x, y) { ctx.drawImage(personSprite(look, 'down', 0), 0, 0, 24, 22, x, y, 24, 22); }

export function personal(A) {
  const G = A.G;
  const skT = { v: 0 }, skK = { v: 0 };
  let fel = '', bekrafta = null;
  const gjort = (r) => { if (!r.ok) { fel = r.fel || 'GICK INTE'; A.ljud('fel'); } else fel = ''; };
  return {
    tid: false,
    rita(ctx) {
      const v = kontorsVarden(G);
      rect(0, 14, W, 11, 0x0a0d1a);
      textB('PERSONAL', 4, 16, F.guld); text('ANSTÄLL, TRÄNA OCH HÅLL TEAMET GLATT · TIDEN STÅR STILL', 54, 18, F.dim);
      // statistikkort
      const bugg = G.personal.filter((p) => p.roll === 'buggfixare').reduce((s, p) => s + 0.1 * p.kraft * moralFaktor(G) * v.buggfix, 0);
      // BORD: anställda / utställda bord, och hur många bord lokalen rymmer (kontorsnamnet fick inte plats)
      const kort6 = [['BORD (MAX ' + v.platser + ')', `${G.personal.length}/${v.bord}`, F.text], ['LÖNER/MÅN', kr(lonPerManad(G)), F.text], ['FORSKNING/DAG', dec(fpPerDag(G), 1) + ' FP', F.bla2], ['BUGGFIX/DAG', dec(bugg, 2), F.rod2], ['MORAL', Math.round(G.moral) + ' %', G.moral >= 50 ? F.gron2 : F.orange2]];
      // texten håller sig inom kortet (54 px): stora värden ritas i det lilla typsnittet
      kort6.forEach(([e, val, c], i) => { const x = 4 + i * 64; panel(x, 27, 60, 21, { fyll: F.panel2 }); text(kapa(e, 54), x + 4, 31, F.dim); if (tw(val, BIG) <= 54) textB(val, x + 4, 38, c); else text(kapa(val, 54), x + 4, 40, c); });
      panel(324, 27, 56, 21, { fyll: mixa(F.lila, F.panel, 0.6) });
      text('TEAMFEST', 328, 31, F.lila2); knapp(328, 38, 48, 8, kr(festPris(G)), { stil: 'lila', klick: () => gjort(teamfest(G)), av: !G.personal.length });
      // vänster: ditt team
      panel(4, 51, 186, 149);
      text(`DITT TEAM (${G.personal.length})`, 9, 55, F.guld);
      if (!G.personal.length) stycke('INGEN JOBBAR HÄR ÄN. ANSTÄLL NÅGON TILL HÖGER! EN FORSKARE GÖR TELEFONERNA BÄTTRE, EN BUGGFIXARE TAR BORT FELEN.', 9, 66, 176, F.dim);
      lista(6, 63, 182, 135, G.personal.length, 26, (i, y) => {
        const p = G.personal[i], roll = ROLLER[p.roll];
        rect(8, y, 176, 24, F.panel2); rect(8, y, 2, 24, roll.farg);
        byst(ctx, p.look, 12, y + 1);
        text(p.namn, 39, y + 3, F.text); text(`${roll.namn} · ${p.alder} ÅR · ×${dec(p.kraft, 1)}`, 39, y + 10, roll.farg);
        stjarnor(39, y + 16, p.stjarnor, 5);
        text(kr(p.lon) + '/MÅN', 182, y + 3, F.dim, { just: 'h' });
        if (kanTrana(G, p)) knapp(132, y + 13, 24, 9, 'TRÄNA', { stil: 'guld', klick: () => gjort(trana(G, p.id)) });
        knapp(158, y + 13, 24, 9, bekrafta === p.id ? 'SÄKER?' : 'SPARKA', { stil: 'rod', klick: () => { if (bekrafta === p.id) { gjort(sparka(G, p.id)); bekrafta = null; } else bekrafta = p.id; } });
      }, skT);
      // höger: kandidater
      panel(194, 51, 186, 149);
      text('KANDIDATER', 199, 55, F.guld);
      const pris = omrullPris(G);
      knapp(282, 53, 94, 9, pris ? 'NYA KANDIDATER ' + kr(pris) : 'NYA KANDIDATER (GRATIS)', { stil: 'morkt', klick: () => gjort(omrull(G)) });
      const lediga = ledigaBord(G).length;
      let y0 = 64;
      if (G.kontor.niva === 'garage') { stycke('BARA ★-NYBÖRJARE VILL JOBBA I ETT GARAGE, OCH INGEN BLIR BÄTTRE HÄR. FLYTTA TILL ETT KONTOR FÖR ATT ANSTÄLLA PROFFS.', 199, y0, 176, F.orange2); y0 += 22; }
      else { text(`UPP TILL ${'★'.repeat(maxStjarnor(G))} (KONTORETS STJÄRNOR + 2)`, 199, y0, F.dim); y0 += 9; }
      // inga lediga bord: ställ ut ett första bord, ställ ut fler – eller, om lokalen är full, flytta.
      // Texten slutar före knappen (x 344).
      if (!lediga) {
        const fullt = v.bord >= v.platser, sista = G.kontor.niva === 'hk';
        if (!v.bord) { text('STÄLL UT ETT BORD I BYGG FÖRST', 199, y0, F.rod2); knapp(344, y0 - 2, 32, 9, 'BYGG', { stil: 'orange', klick: () => A.go('bygg', { kategori: 'bord' }), namn: 'personal-bygg' }); }
        else if (!fullt) { text('ALLA BORD UPPTAGNA – STÄLL UT FLER', 199, y0, F.rod2); knapp(344, y0 - 2, 32, 9, 'BYGG', { stil: 'orange', klick: () => A.go('bygg', { kategori: 'bord' }), namn: 'personal-bygg' }); }
        else if (!sista) { text('LOKALEN ÄR FULL – FLYTTA FÖR FLER', 199, y0, F.rod2); knapp(344, y0 - 2, 32, 9, 'FLYTTA', { stil: 'orange', klick: () => A.go('bolaget', { flik: 'kontor' }), namn: 'personal-flytta' }); }
        else text(`ALLA ${v.platser} BORD I HUVUDKONTORET ÄR UPPTAGNA`, 199, y0, F.rod2);
        y0 += 10;
      }
      lista(196, y0, 182, 198 - y0, G.kandidater.length, 26, (i, y) => {
        const p = G.kandidater[i], roll = ROLLER[p.roll];
        rect(198, y, 176, 24, F.panel2); rect(198, y, 2, 24, roll.farg);
        byst(ctx, p.look, 202, y + 1);
        text(p.namn, 229, y + 3, F.text); text(`${roll.namn} · ${p.alder} ÅR · ×${dec(p.kraft, 1)}`, 229, y + 10, roll.farg);
        stjarnor(229, y + 16, p.stjarnor, 5);
        text(kr(p.lon) + '/MÅN', 372, y + 3, F.dim, { just: 'h' });
        knapp(330, y + 13, 42, 9, 'ANSTÄLL', { stil: 'gron', klick: () => gjort(anstall(G, p.id)), av: !lediga, namn: 'anstall-' + i });
      }, skK);
      if (fel) { rect(0, 192, W, 9, F.rod); text(fel, W / 2, 194, F.text, { just: 'c' }); }
      hud(A); flikrad(A, 'personal');
    },
  };
}
