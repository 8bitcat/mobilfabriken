// Startskärmen: titel, hjältetelefonen i 3D, FORTSÄTT / NYTT BOLAG / DINA BOLAG.
// NYTT BOLAG väljer först spel bland två stora kort: KONSOLFABRIKEN (spelkonsoler från 1 januari 1982, telefonerna
// forskas fram 2007 – rekommenderat, ligger först) eller SNABBSTART 2007 (telefonerna som förut). Sedan döps bolaget.
// Till höger snurrar det valda spelets pryl: en konsol (visaKonsol) eller hjältetelefonen.
import { U, F, W, H, rect, ram, text, textB, knapp, panel, kort, ikon, hit, inne, tw, stycke, kapa, ljusa, lista as rullLista, mixa, BIG } from '../core/ui.js';
import * as Spara from '../core/spara.js';
import * as Vy3d from '../telefon/vy3d.js';
import { visaKonsol } from '../konsol/konsol-vy.js';
import { nyttSpel, START_KASSA } from '../sim/spel.js';
import { startKandidater } from '../sim/personal.js';
import { kr, datumText } from '../sim/bas.js';
import { sattLjud } from '../core/ljud.js';
import { VERSION } from '../version.js';
import { $t } from '../core/i18n.js';

const HJALTE = { bredd: 0.74, hojd: 1.58, djup: 0.08, radie: 0.15, ram: 0.015, haka: 0.015, kameraStorlek: 0.3, kameror: 3, selfie: true, kropp: '#d8ccf4', glas: '#10142a', kamera: '#3a6bc2', marke: 'M', yta: 'klassisk' };
const FORSLAG = [$t('MIKROVÅG MOBIL'), $t('PIXELFON AB'), $t('LUREN & CO'), $t('GARAGEGENIET'), $t('TELEFONKUNGEN'), $t('SMARTBOLAGET'), $t('APPELKNAPP'), $t('SIGNALEN')];
// konsolbolagens namnförslag (de fyra första visas som knappar i namnsteget – korta, så att alla får plats)
const K_FORSLAG = [$t('PIXELBOX AB'), $t('BLIPP & BLOPP'), $t('TV-SPEL AB'), $t('JOYSTICKEN'), $t('KASSETTKUNGEN'), $t('GARAGEGENIET'), $t('SPELMASKINEN'), $t('KONTROLLKUNGEN')];
const forslagFor = (l) => (l === 'konsol' ? K_FORSLAG : FORSLAG);
const ALLA_FORSLAG = [...FORSLAG, ...K_FORSLAG];
// den första konsolen i designern har TRÄPANELEN – samma 3D-form snurrar på startskärmen
const KONSOL_3D = 'konsol-ataro';
// startvalets två kort. ar = tidslinjen i kortet (1982 → 2026, i proportion), hoppar = sträckan snabbstarten hoppar över
const SPELVAL = [
  { lage: 'konsol', titel: $t('KONSOLFABRIKEN'), under: $t('STARTA 1 JANUARI 1982'), farg: F.lila2, ikon: 'kontroll', rek: true,
    text: $t('BYGG SPELKONSOLER OCH LÅT STUDIOS GÖRA SPEL TILL DEM. TELEFONERNA KOMMER 2007.'),
    knapp: $t('STARTA 1982'), stil: 'gron', namn: 'start-konsol', ar: [[1982, 'kontroll'], [2007, 'telefon'], [2026, 'stjarna']] },
  { lage: 'telefon', titel: $t('SNABBSTART 2007'), under: $t('TELEFONERNA SOM FÖRUT'), farg: F.bla2, ikon: 'telefon',
    text: $t('HOPPA RAKT TILL 2007 OCH DESIGNA TELEFONER, PLATTOR OCH KLOCKOR.'),
    knapp: $t('STARTA 2007'), stil: 'bla', namn: 'start-snabb', ar: [[2007, 'telefon'], [2026, 'stjarna']], hoppar: true },
];
const AR0 = 1982, AR1 = 2026;

// liten pil (6×5) i det lilla typsnittets höjd – typsnittet saknar →
function pil(x, y, c) { rect(x, y + 2, 5, 1, c); rect(x + 3, y, 1, 1, c); rect(x + 4, y + 1, 1, 1, c); rect(x + 4, y + 3, 1, 1, c); rect(x + 3, y + 4, 1, 1, c); rect(x + 5, y + 2, 1, 1, c); }

export function start(A, o = {}) {
  let lage = 'meny', spelLage = 'konsol', namn = FORSLAG[Math.floor(Math.random() * FORSLAG.length)], egetNamn = false, spin = 0.5, fel = '', radera = null;
  // kvittot efter SÄLJ BOLAGET (bolaget.js skickar namn och värde)
  const kvitto = o.salt ? $t`${o.salt.namn} ÄR SÅLT FÖR ${kr(o.salt.varde)}. ARVET VÄNTAR I NÄSTA BOLAG.` : '';
  const skL = { v: 0 };
  Spara.stada();   // sålda bolag bort, tappade bolag tillbaka i listan (sparningar från 0.1.0)
  const lista = () => Spara.bolagsLista();
  const fortsatt = () => { const id = Spara.senaste() || lista()[0]?.id; if (!id) return; oppna(id); };
  const fullt = () => lista().length >= Spara.MAX_BOLAG;
  const FULLT = $t`HÖGST ${Spara.MAX_BOLAG} BOLAG. RADERA ETT FÖRST.`;
  function oppna(id) {
    const G = Spara.ladda(id); if (!G) { fel = $t('SPARNINGEN GICK INTE ATT LÄSA'); return; }
    if (G.salt) { Spara.radera(id); fel = $t('BOLAGET ÄR SÅLT OCH FINNS I ARVET'); return; }   // ett sålt bolag öppnas aldrig igen
    A.G = G; sattLjud(G.installningar.ljud !== false); A.go('kontor');
  }
  // startvalet: läget bestämmer namnförslagen (ett namn barnet skrivit själv behålls)
  function valj(l) {
    spelLage = l; fel = '';
    if (!egetNamn) { const f = forslagFor(l); namn = f[Math.floor(Math.random() * f.length)]; }
    lage = 'nytt';
  }
  function skapa() {
    const n = namn.trim(); if (n.length < 2) { fel = $t('SKRIV ETT NAMN PÅ BOLAGET'); return; }
    if (fullt()) { lage = 'lista'; fel = FULLT; return; }
    const G = nyttSpel({ namn: n, arv: Spara.arv(), lage: spelLage }); startKandidater(G);
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
      const titel = $t('MOBILFABRIKEN');
      textB(titel, tx + 1, 30 + 1, 0x8a2a6a, { k: 3 });
      textB(titel, tx, 30, F.guld, { k: 3 });
      text($t('EN MOBILTYCOON I PIXELSTAD · FRÅN GARAGE TILL HUVUDKONTOR'), tx, 58, F.dim);
      // KONSOLER 1982 → MOBILER 2007. BYGG ETT IMPERIUM.
      let ux = tx + text($t('KONSOLER 1982'), tx, 66, F.cyan) + 3; pil(ux, 66, F.cyan); ux += 9;
      text($t('MOBILER 2007. BYGG ETT IMPERIUM.'), ux, 66, F.cyan);
      // prylen till höger: startvalets kort (det man pekar på, annars det valda) eller hjältetelefonen
      const hov = lage === 'val' ? SPELVAL.find((v, i) => inne(kortX(i), KY, KW, KH)) : null;
      const visas = lage === 'val' ? (hov ? hov.lage : spelLage) : lage === 'nytt' ? spelLage : 'telefon';
      if (visas === 'konsol') visaKonsol({ x: 258, y: 44, w: 126, h: 112 }, KONSOL_3D, { vy: 'auto', spin, pitch: 0.32, ctx });
      else Vy3d.visa({ x: 262, y: 20, w: 120, h: 180 }, HJALTE, { vy: 'auto', spin, pitch: 0.12, ctx });
      // bildtext under prylen (konsolen står högre upp än telefonen)
      if (lage === 'val' || lage === 'nytt') text(visas === 'konsol' ? $t('DIN FÖRSTA KONSOL · 1982') : $t('DIN FÖRSTA TELEFON · 2007'), 322, visas === 'konsol' ? 154 : 196, F.dim2, { just: 'c' });
      const L = lista();
      if (lage === 'meny') {
        let y = 86;
        if (L.length) {
          const s = L.find((b) => b.id === Spara.senaste()) || L[0];
          knapp(tx, y, 150, 16, $t('FORTSÄTT'), { stil: 'vit', F: BIG, klick: fortsatt, namn: 'start-fortsatt' });
          let sx = tx + 156;
          if (Spara.lageAv(s) === 'konsol') { ikon('kontroll', sx, y + 5, F.lila2); sx += 10; }
          text(`${kapa(s.namn, 100)} · ${datumText(s.dag)}`, sx, y + 6, F.dim);
          y += 22;
        }
        knapp(tx, y, 150, 14, $t('NYTT BOLAG'), { stil: L.length ? 'morkt' : 'gron', klick: () => { if (fullt()) { lage = 'lista'; fel = FULLT; } else { lage = 'val'; fel = ''; } }, namn: 'start-nytt' }); y += 18;
        if (L.length) { knapp(tx, y, 150, 14, $t`DINA BOLAG (${L.length})`, { stil: 'morkt', klick: () => { lage = 'lista'; fel = ''; radera = null; }, namn: 'start-lista' }); y += 18; }
        const n = arvAntal();
        y += 6;   // under horisontlinjen (y 148) när alla tre knapparna syns
        if (kvitto) { text(kapa(kvitto, 240), tx, y, F.gron2); y += 10; }
        if (n) { text(n === 1 ? $t`ARV: ${n} SÅLT BOLAG · +${n * 10} % STARTKASSA OCH FORSKNING` : $t`ARV: ${n} SÅLDA BOLAG · +${n * 10} % STARTKASSA OCH FORSKNING`, tx, y, F.guld); y += 10; }
        if (fel) text(fel, tx, y, F.rod2);
      } else if (lage === 'val') {
        SPELVAL.forEach((v, i) => spelkort(ctx, v, kortX(i)));
        knapp(tx, 192, 60, 12, $t('TILLBAKA'), { stil: 'morkt', klick: () => { lage = 'meny'; fel = ''; }, namn: 'start-val-tillbaka' });
        text($t('VÄLJ SPEL'), tx + 66, 196, F.dim2);
      } else if (lage === 'nytt') {
        const konsol = spelLage === 'konsol';
        panel(tx - 6, 80, 216, 96);
        text($t('DÖP DITT BOLAG'), tx, 86, F.guld);
        // vilket spel som startar (uppe till höger i rutan)
        const etikett = konsol ? $t('KONSOLFABRIKEN') : $t('SNABBSTART');
        text(etikett, tx + 204, 86, konsol ? F.lila2 : F.bla2, { just: 'h' });
        ikon(konsol ? 'kontroll' : 'telefon', tx + 204 - tw(etikett) - 10, 85, konsol ? F.lila2 : F.bla2);
        const n = arvAntal(), kassa = Math.round(START_KASSA * (1 + 0.1 * n));
        text($t`DU STARTAR I ETT GARAGE 1 JANUARI ${konsol ? 1982 : 2007}.`, tx, 94, F.dim);
        const sw = text($t`STARTKASSA ${kr(kassa)}`, tx, 101, F.dim);
        if (n) text($t` · ARV +${n * 10} %`, tx + sw, 101, F.guld);
        const falt = { x: tx, y: 109, w: 200, h: 16 };
        rect(falt.x, falt.y, falt.w, falt.h, F.lo); ram(falt.x, falt.y, falt.w, falt.h, F.bla2);
        if (!A._falt) textB(namn || ' ', falt.x + 5, falt.y + 5, F.text);
        if (!A._falt && Math.floor(A.t * 2) % 2) rect(falt.x + 6 + tw(namn, BIG), falt.y + 4, 1, 9, F.text);
        hit(falt.x, falt.y, falt.w, falt.h, { klick: () => A.textfalt(falt, namn, (v) => { namn = v; egetNamn = !ALLA_FORSLAG.includes(v.trim()); }), namn: 'start-namnfalt' });
        let fx = tx;
        for (const f of forslagFor(spelLage).slice(0, 4)) { const w = tw(f) + 6; if (fx + w > tx + 204) break; knapp(fx, 129, w, 9, f, { stil: 'dim', klick: () => { namn = f; egetNamn = false; } }); fx += w + 3; }
        if (fel) text(fel, tx, 142, F.rod2);
        knapp(tx, 154, 60, 14, $t('TILLBAKA'), { stil: 'morkt', klick: () => { lage = 'val'; fel = ''; }, namn: 'start-nytt-tillbaka' });
        knapp(tx + 66, 154, 134, 14, $t('STARTA I GARAGET'), { stil: 'gron', klick: skapa, namn: 'start-skapa' });
      } else if (lage === 'lista') {
        // alla bolag (högst MAX_BOLAG) i en rullbar lista; X raderar efter en fråga i raden.
        // Ett konsolbolag (startade 1982) har en handkontroll framför namnet.
        panel(tx - 6, 80, 216, 116);
        text($t('DINA BOLAG'), tx, 86, F.guld); text($t`${L.length} AV ${Spara.MAX_BOLAG}`, tx + 204, 86, F.dim2, { just: 'h' });
        rullLista(tx - 2, 94, 210, 88, L.length, 11, (i, y) => {
          const b = L[i], konsol = Spara.lageAv(b) === 'konsol';
          if (radera === b.id) {
            rect(tx - 2, y, 206, 10, mixa(F.rod, F.panel, 0.7));
            text(kapa($t`RADERA ${b.namn}?`, 120), tx, y + 3, F.text);
            knapp(tx + 126, y, 36, 9, $t('JA'), { stil: 'rod', namn: 'start-radera-ja', klick: () => { Spara.radera(b.id); radera = null; fel = ''; if (!lista().length) lage = 'meny'; } });
            knapp(tx + 166, y, 36, 9, $t('NEJ'), { stil: 'morkt', namn: 'start-radera-nej', klick: () => { radera = null; } });
            return;
          }
          knapp(tx, y, 136, 9, kapa(b.namn, konsol ? 118 : 128), { stil: 'morkt', ikon: konsol ? 'kontroll' : null, klick: () => oppna(b.id), namn: 'start-bolag-' + i });
          text(datumText(b.dag), tx + 140, y + 2, F.dim);
          knapp(tx + 190, y, 12, 9, 'X', { stil: 'dim', klick: () => { radera = b.id; }, namn: 'start-radera-' + i });
        }, skL);
        knapp(tx, 184, 60, 9, $t('TILLBAKA'), { stil: 'morkt', klick: () => { lage = 'meny'; fel = ''; radera = null; } });
        if (fel) text(kapa(fel, 138), tx + 66, 186, F.rod2);
        else if (L.some((b) => Spara.lageAv(b) === 'konsol')) { ikon('kontroll', tx + 66, 185, F.dim); text($t('= KONSOLBOLAG FRÅN 1982'), tx + 76, 186, F.dim2); }
      }
      text('V' + VERSION, W - 4, H - 8, F.dim2, { just: 'h' });
    },
    tangent(e) {
      if (e.key !== 'Enter') return false;
      if (lage === 'nytt') { skapa(); return true; }
      if (lage === 'val') { valj(spelLage); return true; }
      return false;
    },
  };

  // ett av startvalets kort: ikon, titel, tidslinje 1982 → 2026 och knappen som går vidare till namnet.
  // Ett tryck på kortet väljer det (prylen till höger byter); knappen startar.
  function spelkort(ctx, v, x) {
    const y = KY, w = KW, h = KH, vald = spelLage === v.lage;
    kort(x, y, w, h, { vald, kant: vald ? v.farg : null, klick: () => { spelLage = v.lage; }, namn: 'start-kort-' + v.lage });
    // ikonen dubbel storlek i en ruta
    rect(x + 5, y + 5, 18, 18, F.lo); ram(x + 5, y + 5, 18, 18, vald ? v.farg : F.hi);
    ikon(v.ikon, x + 7, y + 7, v.farg, 2);
    if (v.rek) {
      const rek = $t('REKOMMENDERAT'), bw = tw(rek) + 6;
      rect(x + w - 5 - bw, y + 6, bw, 9, F.guld2); rect(x + w - 5 - bw, y + 6, bw, 1, ljusa(F.guld2, 0.4));
      text(rek, x + w - 5 - bw + 3, y + 8, F.blak);
    }
    textB(v.titel, x + 6, y + 28, vald ? F.text : ljusa(F.dim, 0.3));
    text(v.under, x + 6, y + 38, v.rek ? F.guld : F.dim);
    stycke(v.text, x + 6, y + 47, w - 12, F.dim, { rad: 7 });
    // tidslinjen: hela spelet 1982–2026; snabbstarten hoppar över konsolåren (prickad)
    const lx = (ar) => Math.round(x + 10 + (ar - AR0) / (AR1 - AR0) * (w - 20)), ly = y + 80;
    if (v.hoppar) { for (let px = lx(AR0); px < lx(2007); px += 2) rect(px, ly, 1, 1, F.dim2); rect(lx(2007), ly, lx(AR1) - lx(2007) + 1, 1, v.farg); text('1982', lx(AR0), ly + 3, F.dim2, { just: 'c' }); }
    else rect(lx(AR0), ly, lx(AR1) - lx(AR0) + 1, 1, v.farg);
    for (const [ar, ik] of v.ar) {
      const px = lx(ar);
      rect(px - 1, ly - 1, 3, 3, v.farg);
      ikon(ik, px - 3, ly - 10, ar === AR1 ? F.guld : v.farg);
      text(String(ar), px, ly + 3, F.dim, { just: 'c' });
    }
    knapp(x + 6, y + h - 19, w - 12, 14, v.knapp, { stil: v.stil, klick: () => valj(v.lage), namn: v.namn });
  }
}
// startvalets kort: två bredvid varandra till vänster om prylen
const KY = 76, KW = 118, KH = 112;
const kortX = (i) => 12 + i * (KW + 6);
