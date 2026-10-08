// Startskärmen: titel, hjältetelefonen i 3D, FORTSÄTT / NYTT BOLAG / DINA BOLAG.
import { U, F, W, H, rect, ram, text, textB, knapp, panel, ikon, hit, tw, stycke, kapa, ljusa, BIG } from '../core/ui.js';
import * as Spara from '../core/spara.js';
import * as Vy3d from '../telefon/vy3d.js';
import { nyttSpel } from '../sim/spel.js';
import { startKandidater } from '../sim/personal.js';
import { kr, datumText } from '../sim/bas.js';
import { sattLjud } from '../core/ljud.js';
import { VERSION } from '../version.js';

const HJALTE = { bredd: 0.74, hojd: 1.58, djup: 0.08, radie: 0.15, ram: 0.015, haka: 0.015, kameraStorlek: 0.3, kameror: 3, selfie: true, kropp: '#d8ccf4', glas: '#10142a', kamera: '#3a6bc2', marke: 'M', yta: 'klassisk' };
const FORSLAG = ['MIKROVÅG MOBIL', 'PIXELFON AB', 'LUREN & CO', 'GARAGEGENIET', 'TELEFONKUNGEN', 'SMARTBOLAGET', 'APPELKNAPP', 'SIGNALEN'];

export function start(A) {
  let lage = 'meny', namn = FORSLAG[Math.floor(Math.random() * FORSLAG.length)], spin = 0.5, fel = '';
  const lista = () => Spara.bolagsLista();
  const fortsatt = () => { const id = Spara.senaste() || lista()[0]?.id; if (!id) return; oppna(id); };
  function oppna(id) {
    const G = Spara.ladda(id); if (!G) { fel = 'SPARNINGEN GICK INTE ATT LÄSA'; return; }
    A.G = G; sattLjud(G.installningar.ljud !== false); A.go('kontor');
  }
  function skapa() {
    const n = namn.trim(); if (n.length < 2) { fel = 'SKRIV ETT NAMN PÅ BOLAGET'; return; }
    const G = nyttSpel({ namn: n, arv: Spara.arv() }); startKandidater(G);
    A.G = G; A.spara(); A.go('kontor');
  }
  return {
    tid: false,
    rita(ctx, dt) {
      spin += dt * 0.6;
      // bakgrund: natt med neonsken
      for (let y = 0; y < H; y += 2) rect(0, y, W, 2, y < 120 ? 0x0b0e1c : 0x0d1124);
      for (let i = 0; i < 40; i++) { const x = (i * 97) % W, y = (i * 53) % 120, b = (Math.sin(A.t * 2 + i) + 1) / 2; if (b > 0.3) rect(x, y, 1, 1, b > 0.8 ? 0xffffff : 0x6a7aa8); }
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
        knapp(tx, y, 150, 14, 'NYTT BOLAG', { stil: L.length ? 'morkt' : 'gron', klick: () => { lage = 'nytt'; fel = ''; }, namn: 'start-nytt' }); y += 18;
        if (L.length > 1) { knapp(tx, y, 150, 14, 'DINA BOLAG (' + L.length + ')', { stil: 'morkt', klick: () => { lage = 'lista'; } }); y += 18; }
        const arv = Spara.arv();
        if (arv?.saldaBolag) text(`ARV: ${arv.saldaBolag} SÅLDA BOLAG · +${arv.saldaBolag * 10} % STARTKASSA OCH FORSKNING`, tx, y + 4, F.guld);
      } else if (lage === 'nytt') {
        panel(tx - 6, 80, 216, 96);
        text('DÖP DITT BOLAG', tx, 86, F.guld);
        text('DU STARTAR I ETT GARAGE 1 JANUARI 2007 MED 2 MILJONER KRONOR.', tx, 94, F.dim);
        const falt = { x: tx, y: 104, w: 200, h: 16 };
        rect(falt.x, falt.y, falt.w, falt.h, F.lo); ram(falt.x, falt.y, falt.w, falt.h, F.bla2);
        if (!A._falt) textB(namn || ' ', falt.x + 5, falt.y + 5, F.text);
        if (!A._falt && Math.floor(A.t * 2) % 2) rect(falt.x + 6 + tw(namn, BIG), falt.y + 4, 1, 9, F.text);
        hit(falt.x, falt.y, falt.w, falt.h, { klick: () => A.textfalt(falt, namn, (v) => { namn = v; }), namn: 'start-namnfalt' });
        let fx = tx;
        for (const f of FORSLAG.slice(0, 4)) { const w = tw(f) + 6; if (fx + w > tx + 204) break; knapp(fx, 124, w, 9, f, { stil: 'dim', klick: () => { namn = f; } }); fx += w + 3; }
        if (fel) text(fel, tx, 138, F.rod2);
        knapp(tx, 150, 60, 14, 'TILLBAKA', { stil: 'morkt', klick: () => { lage = 'meny'; } });
        knapp(tx + 66, 150, 134, 14, 'STARTA I GARAGET', { stil: 'gron', klick: skapa, namn: 'start-skapa' });
      } else if (lage === 'lista') {
        panel(tx - 6, 80, 216, 116);
        text('DINA BOLAG', tx, 86, F.guld);
        L.slice(0, 8).forEach((b, i) => {
          const y = 96 + i * 11;
          knapp(tx, y, 150, 9, kapa(b.namn, 140), { stil: 'morkt', klick: () => oppna(b.id) });
          text(datumText(b.dag), tx + 156, y + 2, F.dim);
        });
        knapp(tx, 184, 60, 9, 'TILLBAKA', { stil: 'morkt', klick: () => { lage = 'meny'; } });
      }
      text('V' + VERSION, W - 4, H - 8, F.dim2, { just: 'h' });
    },
    tangent(e) { if (e.key === 'Enter' && lage === 'nytt') { skapa(); return true; } return false; },
  };
}
