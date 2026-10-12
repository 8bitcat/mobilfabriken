// Startskärmen: titel, hjältetelefonen i 3D, FORTSÄTT / NYTT BOLAG / DINA BOLAG.
import { U, F, W, H, rect, ram, text, textB, knapp, panel, ikon, hit, tw, stycke, kapa, ljusa, lista as rullLista, mixa, BIG } from '../core/ui.js';
import * as Spara from '../core/spara.js';
import * as Vy3d from '../telefon/vy3d.js';
import { nyttSpel, START_KASSA } from '../sim/spel.js';
import { startKandidater } from '../sim/personal.js';
import { kr, datumText } from '../sim/bas.js';
import { sattLjud } from '../core/ljud.js';
import { VERSION } from '../version.js';

const HJALTE = { bredd: 0.74, hojd: 1.58, djup: 0.08, radie: 0.15, ram: 0.015, haka: 0.015, kameraStorlek: 0.3, kameror: 3, selfie: true, kropp: '#d8ccf4', glas: '#10142a', kamera: '#3a6bc2', marke: 'M', yta: 'klassisk' };
const FORSLAG = ['MIKROVÅG MOBIL', 'PIXELFON AB', 'LUREN & CO', 'GARAGEGENIET', 'TELEFONKUNGEN', 'SMARTBOLAGET', 'APPELKNAPP', 'SIGNALEN'];

export function start(A, o = {}) {
  let lage = 'meny', namn = FORSLAG[Math.floor(Math.random() * FORSLAG.length)], spin = 0.5, fel = '', radera = null;
  // kvittot efter SÄLJ BOLAGET (bolaget.js skickar namn och värde)
  const kvitto = o.salt ? `${o.salt.namn} ÄR SÅLT FÖR ${kr(o.salt.varde)}. ARVET VÄNTAR I NÄSTA BOLAG.` : '';
  const skL = { v: 0 };
  Spara.stada();   // sålda bolag bort, tappade bolag tillbaka i listan (sparningar från 0.1.0)
  const lista = () => Spara.bolagsLista();
  const fortsatt = () => { const id = Spara.senaste() || lista()[0]?.id; if (!id) return; oppna(id); };
  const fullt = () => lista().length >= Spara.MAX_BOLAG;
  const FULLT = `HÖGST ${Spara.MAX_BOLAG} BOLAG. RADERA ETT FÖRST.`;
  function oppna(id) {
    const G = Spara.ladda(id); if (!G) { fel = 'SPARNINGEN GICK INTE ATT LÄSA'; return; }
    if (G.salt) { Spara.radera(id); fel = 'BOLAGET ÄR SÅLT OCH FINNS I ARVET'; return; }   // ett sålt bolag öppnas aldrig igen
    A.G = G; sattLjud(G.installningar.ljud !== false); A.go('kontor');
  }
  function skapa() {
    const n = namn.trim(); if (n.length < 2) { fel = 'SKRIV ETT NAMN PÅ BOLAGET'; return; }
    if (fullt()) { lage = 'lista'; fel = FULLT; return; }
    const G = nyttSpel({ namn: n, arv: Spara.arv() }); startKandidater(G);
    G.gavor = { senast: null, kort: 0 };   // gåvoserien är bolagets egen (gavor.js)
    A.G = G; A.spara(); A.go('kontor');
  }
  // arvet från sålda bolag: +10 % startkassa per bolag, högst 5 (samma regel som nyttSpel)
  const arvAntal = () => Math.max(0, Math.min(5, Math.floor(+Spara.arv()?.saldaBolag || 0)));
  return {
    tid: false,
    rita(ctx, dt) {
      spin += dt * 0.6;
      // bakgrund: natt med neonsken
      for (let y = 0; y < H; y += 2) rect(0, y, W, 2, y < 120 ? 0x0b0e1c : 0x0d1124);
      for (let i = 0; i < 40; i++) {
        const x = (i * 97) % W, y = (i * 53) % 120, b = (Math.sin(A.t * 2 + i) + 1) / 2;
        if (x >= 10 && x < 260 && y >= 26) continue;   // inga stjärnor bakom titeln och texterna (en lysande prick gjorde K till R)
        if (b > 0.3) rect(x, y, 1, 1, b > 0.8 ? 0xffffff : 0x6a7aa8);
      }
      rect(0, 148, W, 1, 0x2a3a6a); rect(0, 149, W, 67, 0x0a0d1e);
      // titel
      const tx = 18;
      textB('MOBILFABRIKEN', tx + 1, 30 + 1, 0x8a2a6a, { k: 3 });
      textB('MOBILFABRIKEN', tx, 30, F.guld, { k: 3 });
      text('EN MOBILTYCOON I PIXELSTAD · FRÅN GARAGE TILL HUVUDKONTOR', tx, 58, F.dim);
      text('DESIGNA TELEFONER. SLÅ RIVALERNA. BYGG ETT IMPERIUM.', tx, 66, F.cyan);
      // hjältetelefonen
      Vy3d.visa({ x: 262, y: 20, w: 120, h: 180 }, HJALTE, { vy: 'auto', spin, pitch: 0.12, ctx });
      const L = lista();
      if (lage === 'meny') {
        let y = 86;
        if (L.length) {
          const s = L.find((b) => b.id === Spara.senaste()) || L[0];
          knapp(tx, y, 150, 16, 'FORTSÄTT', { stil: 'vit', F: BIG, klick: fortsatt, namn: 'start-fortsatt' });
          text(`${kapa(s.namn, 100)} · ${datumText(s.dag)}`, tx + 156, y + 6, F.dim);
          y += 22;
        }
        knapp(tx, y, 150, 14, 'NYTT BOLAG', { stil: L.length ? 'morkt' : 'gron', klick: () => { if (fullt()) { lage = 'lista'; fel = FULLT; } else { lage = 'nytt'; fel = ''; } }, namn: 'start-nytt' }); y += 18;
        if (L.length) { knapp(tx, y, 150, 14, 'DINA BOLAG (' + L.length + ')', { stil: 'morkt', klick: () => { lage = 'lista'; fel = ''; radera = null; }, namn: 'start-lista' }); y += 18; }
        const n = arvAntal();
        y += 6;   // under horisontlinjen (y 148) när alla tre knapparna syns
        if (kvitto) { text(kapa(kvitto, 240), tx, y, F.gron2); y += 10; }
        if (n) { text(`ARV: ${n} ${n === 1 ? 'SÅLT' : 'SÅLDA'} BOLAG · +${n * 10} % STARTKASSA OCH FORSKNING`, tx, y, F.guld); y += 10; }
        if (fel) text(fel, tx, y, F.rod2);
      } else if (lage === 'nytt') {
        panel(tx - 6, 80, 216, 96);
        text('DÖP DITT BOLAG', tx, 86, F.guld);
        const n = arvAntal(), kassa = Math.round(START_KASSA * (1 + 0.1 * n));
        text('DU STARTAR I ETT GARAGE 1 JANUARI 2007.', tx, 94, F.dim);
        const sw = text('STARTKASSA ' + kr(kassa), tx, 101, F.dim);
        if (n) text(` · ARV +${n * 10} %`, tx + sw, 101, F.guld);
        const falt = { x: tx, y: 109, w: 200, h: 16 };
        rect(falt.x, falt.y, falt.w, falt.h, F.lo); ram(falt.x, falt.y, falt.w, falt.h, F.bla2);
        if (!A._falt) textB(namn || ' ', falt.x + 5, falt.y + 5, F.text);
        if (!A._falt && Math.floor(A.t * 2) % 2) rect(falt.x + 6 + tw(namn, BIG), falt.y + 4, 1, 9, F.text);
        hit(falt.x, falt.y, falt.w, falt.h, { klick: () => A.textfalt(falt, namn, (v) => { namn = v; }), namn: 'start-namnfalt' });
        let fx = tx;
        for (const f of FORSLAG.slice(0, 4)) { const w = tw(f) + 6; if (fx + w > tx + 204) break; knapp(fx, 129, w, 9, f, { stil: 'dim', klick: () => { namn = f; } }); fx += w + 3; }
        if (fel) text(fel, tx, 142, F.rod2);
        knapp(tx, 154, 60, 14, 'TILLBAKA', { stil: 'morkt', klick: () => { lage = 'meny'; fel = ''; } });
        knapp(tx + 66, 154, 134, 14, 'STARTA I GARAGET', { stil: 'gron', klick: skapa, namn: 'start-skapa' });
      } else if (lage === 'lista') {
        // alla bolag (högst MAX_BOLAG) i en rullbar lista; X raderar efter en fråga i raden
        panel(tx - 6, 80, 216, 116);
        text('DINA BOLAG', tx, 86, F.guld); text(`${L.length} AV ${Spara.MAX_BOLAG}`, tx + 204, 86, F.dim2, { just: 'h' });
        rullLista(tx - 2, 94, 210, 88, L.length, 11, (i, y) => {
          const b = L[i];
          if (radera === b.id) {
            rect(tx - 2, y, 206, 10, mixa(F.rod, F.panel, 0.7));
            text(kapa('RADERA ' + b.namn + '?', 120), tx, y + 3, F.text);
            knapp(tx + 126, y, 36, 9, 'JA', { stil: 'rod', namn: 'start-radera-ja', klick: () => { Spara.radera(b.id); radera = null; fel = ''; if (!lista().length) lage = 'meny'; } });
            knapp(tx + 166, y, 36, 9, 'NEJ', { stil: 'morkt', namn: 'start-radera-nej', klick: () => { radera = null; } });
            return;
          }
          knapp(tx, y, 136, 9, kapa(b.namn, 128), { stil: 'morkt', klick: () => oppna(b.id), namn: 'start-bolag-' + i });
          text(datumText(b.dag), tx + 140, y + 2, F.dim);
          knapp(tx + 190, y, 12, 9, 'X', { stil: 'dim', klick: () => { radera = b.id; }, namn: 'start-radera-' + i });
        }, skL);
        knapp(tx, 184, 60, 9, 'TILLBAKA', { stil: 'morkt', klick: () => { lage = 'meny'; fel = ''; radera = null; } });
        if (fel) text(kapa(fel, 138), tx + 66, 186, F.rod2);
      }
      text('V' + VERSION, W - 4, H - 8, F.dim2, { just: 'h' });
    },
    tangent(e) { if (e.key === 'Enter' && lage === 'nytt') { skapa(); return true; } return false; },
  };
}
