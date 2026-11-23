// TELEFONER – dina enheter till salu och hur de står sig mot konkurrenterna (förlagans "Your phones").
// Ändra pris, lägg ner, gå viralt, släpp uppdatering 1.1. Plus MUSEET med alla telefoner du gjort.
// Konsolspelet (docs/KONSOLPLAN.md): fliken heter KONSOLER. Listan visar konsolerna med pixelbilden av formen,
// hur många som har dem hemma (installerad bas) och spelbiblioteket, rivalerna är rivalkonsolerna. När
// telefonavdelningen är öppen växlar KONSOLER/TELEFONER mellan linjerna – telefonsidan är då snabbstartens.
import { U, F, W, rect, ram, text, textB, knapp, panel, kort, ikon, hit, inne, tw, kapa, matare, stycke, lista, radbryt, reglage, stjarnor, ljusa, mixa, BIG } from '../core/ui.js';
import { ENHETER } from '../data/delar.js';
import { kEnhetAv } from '../data/konsol.js';
import * as Vy3d from '../telefon/vy3d.js';
import { ritaTelefon } from '../telefon/telefon3d.js';
import { visaKonsol, ritaKonsol2D } from '../konsol/konsol-vy.js';
import { Pix } from '../art/kit.js';
import { hud, flikrad } from './ram.js';
import { telAv, konsolTel } from '../sim/design.js';
import { rimligtPris, veckoEfterfragan, rivalModell, buzz, veckaAv, bibliotek } from '../sim/marknad.js';
import { andraPris, laggNer, bliViral, kanViral, uppdatering, modellVinst, VIRAL_FP, PRICK_FP } from '../sim/projekt.js';
import { aktivaRivalKonsoler, spelPa, konsolProjekt } from '../sim/konsol.js';
import { arKonsolSpel } from '../sim/spel.js';
import { KAMPANJER, RIVALER } from '../data/varld.js';
import { K_KAMPANJER } from '../data/konsol-varld.js';
import { kr, dec, datumText, tal, arAv } from '../sim/bas.js';

// museets miniatyr (37×35): skalan följer enheten (samma ram som vy3d: bredd × 1,6 och höjd × 1,35),
// så att en laptop eller surfplatta ryms lika väl som en telefon
const MINI = new Map(), MW = 37, MH = 35;
function mini(d) {
  const key = d.id; let c = MINI.get(key); if (c) return c;
  const t = telAv(d), S = Math.min(MW / (t.bredd * 1.6), MH / (t.hojd * 1.35));
  const P = new Pix(MW, MH); ritaTelefon(P, MW / 2, MH / 2, S, t, 0.5, 0.15); c = P.flush(); MINI.set(key, c); return c;
}
const enhetsNamn = (id) => ENHETER.find((e) => e.id === id)?.namn || 'TELEFON';
// antal (inte kronor) så exakt som ryms i max px: 988 654 → 989 T, 1 500 000 → 1,5 MILJ. → 1,5 M → 1,5M
// (tvinga = false: null om inget ryms, annars den kortaste formen)
function antal(n, max, tvinga = true) {
  n = Math.max(0, Math.round(n || 0));
  const alt = [tal(n)];
  if (n >= 999_500) { const mm = n / 1e6, m = mm >= 9.95 ? String(Math.round(mm)) : dec(mm, 1); alt.push(m + ' MILJ.', m + ' M', m + 'M', Math.round(mm) + 'M'); }
  else if (n >= 1e4) { const t = String(Math.round(n / 1e3)); alt.push(t + ' T', t + 'T'); }
  for (const s of alt) if (tw(s) <= max) return s;
  return tvinga ? alt[alt.length - 1] : null;
}
// konsolernas pixelbilder (40×28) står i en liten "studio" med samma toning som 3D-fönstret
function studio(x, y, w, h) { for (let j = 0; j < h; j++) rect(x, y, w, 1, mixa(0x1c2050, 0x0e1230, j / h)); }
const linjeAv = (p) => (p.design?.linje === 'konsol' ? 'konsol' : 'telefon');

export function telefoner(A, o = {}) {
  const G = A.G, konsolSpel = arKonsolSpel(G);
  // linjen som visas: snabbstarten har bara telefoner, konsolspelet börjar på konsolerna (eller på produktens linje)
  const fran = G.produkter.find((p) => p.id === o.produkt);
  let linje = !konsolSpel ? 'telefon' : fran ? linjeAv(fran) : 'konsol';
  const mina = () => (konsolSpel ? G.produkter.filter((p) => linjeAv(p) === linje) : G.produkter);
  const senaste = () => { const e = mina(); return [...e].reverse().find((p) => p.aktiv)?.id || e[e.length - 1]?.id; };
  let valdId = o.produkt || senaste();
  let nyttPris = null, spin = 0.3, lage = 'salu', bekr = false, fel = '';
  const skP = { v: 0 }, skR = { v: 0 }, skM = { v: 0 };
  const gjort = (r) => { if (!r.ok) { fel = r.fel || 'GICK INTE'; A.ljud('fel'); } else { fel = ''; A.ljud('mynt'); } };
  // växeln syns när telefonavdelningen är öppen (eller en telefon redan finns)
  const harTelefoner = () => konsolSpel && (G.flaggor.mobil || G.produkter.some((p) => linjeAv(p) === 'telefon'));
  const byt = (l) => { if (l === linje) return; linje = l; valdId = senaste(); nyttPris = null; bekr = false; fel = ''; skP.v = 0; skR.v = 0; skM.v = 0; };
  return {
    tid: true,
    rita(ctx, dt) {
      spin += dt * 0.6;
      rect(0, 14, W, 11, 0x0a0d1a);
      if (!konsolSpel) { textB('TELEFONER', 4, 16, F.guld); text('DINA ENHETER TILL SALU OCH HUR DE STÅR SIG', 66, 18, F.dim); }
      else {
        textB(linje === 'konsol' ? 'KONSOLER' : 'TELEFONER', 4, 16, F.guld);
        if (harTelefoner()) {
          knapp(66, 15, 54, 9, 'KONSOLER', { stil: 'dim', ikon: 'kontroll', aktiv: linje === 'konsol', klick: () => byt('konsol'), namn: 'linje-konsol' });
          knapp(122, 15, 58, 9, 'TELEFONER', { stil: 'dim', ikon: 'telefon', aktiv: linje === 'telefon', klick: () => byt('telefon'), namn: 'linje-telefon' });
        } else text('DINA KONSOLER TILL SALU OCH HUR DE STÅR SIG', 66, 18, F.dim);
      }
      knapp(W - 128, 15, 60, 9, 'TILL SALU', { stil: 'dim', aktiv: lage === 'salu', klick: () => { lage = 'salu'; }, namn: 'telefoner-salu' });
      knapp(W - 64, 15, 60, 9, 'MUSEET (' + mina().length + ')', { stil: 'dim', aktiv: lage === 'museum', klick: () => { lage = 'museum'; }, namn: 'telefoner-museet' });
      if (lage === 'museum') { if (linje === 'konsol') museumK(ctx); else museum(ctx); hud(A); flikrad(A, 'telefoner'); return; }
      if (linje === 'konsol') { konsoler(ctx); felruta(); hud(A); flikrad(A, 'telefoner'); return; }
      // vänster: dina enheter + konkurrenterna
      panel(2, 27, 140, 173);
      text('DINA ENHETER', 6, 31, F.text);
      const egna = [...mina()].reverse().sort((a, b) => b.aktiv - a.aktiv);
      if (!egna.length) stycke(konsolSpel ? 'DESIGNA DIN FÖRSTA TELEFON OCH LANSERA DEN!' : 'INGA TELEFONER TILL SALU ÄN. DESIGNA DIN FÖRSTA OCH LANSERA DEN!', 6, 40, 130, F.dim);
      const hEgna = Math.min(64, Math.max(20, egna.length * 21));
      lista(4, 38, 136, hEgna, egna.length, 21, (i, y) => {
        const p = egna[i], vald = p.id === valdId;
        kort(6, y, 130, 19, { vald, klick: () => { valdId = p.id; nyttPris = null; bekr = false; } });
        rect(9, y + 3, 9, 13, F.lo); ikon('telefon', 10, y + 6, p.aktiv ? F.bla2 : F.dim2);
        text(kapa(p.namn, 80), 21, y + 4, p.aktiv ? F.text : F.dim);
        // andra raden slutar före betyget: sålda kortas (1,5 MILJ. / 988 T), lagret släpps sist (det står i rutan till höger)
        const max = 132 - tw(dec(p.betyg, 1), BIG) - 4 - 21, fore = p.aktiv ? `${p.lager} I LAGER · ` : 'UTGÅNGEN · ', s = antal(p.salda, max - tw(fore + ' SÅLDA'), false);
        text(s ? fore + s + ' SÅLDA' : antal(p.salda, max - tw(' SÅLDA')) + ' SÅLDA', 21, y + 11, p.aktiv ? F.gron2 : F.dim2);
        textB(dec(p.betyg, 1), 132, y + 6, F.guld, { just: 'h' });
      }, skP);
      const ry = 40 + hEgna + 4;
      text('KONKURRENTER PÅ MARKNADEN', 6, ry, F.text);
      const riv = G.marknad.rivaler.map(rivalModell).sort((a, b) => b.lanseradDag - a.lanseradDag);
      lista(4, ry + 7, 136, 198 - ry - 7, riv.length, 19, (i, y) => {
        const r = riv[i];
        rect(6, y, 130, 17, F.panel2);
        rect(8, y + 2, 13, 13, r.farg); rect(8, y + 2, 13, 1, ljusa(r.farg, 0.4)); text(r.bolag.slice(0, 2), 14, y + 6, 0xffffff, { just: 'c' });
        text(kapa(r.namn, 76), 24, y + 3, F.text); text(`${kapa(r.bolag, 46)} · ${kr(r.pris, true)}`, 24, y + 10, F.dim);
        textB(dec(r.betyg, 1), 133, y + 5, r.betyg >= 7 ? F.gron2 : r.betyg >= 6 ? F.guld : F.orange2, { just: 'h' });
      }, skR);
      // höger: vald telefon
      const p = mina().find((x) => x.id === valdId);
      if (!p) { panel(146, 27, 234, 173); textB('INGEN TELEFON ÄN', 263, 90, F.dim, { just: 'c' }); knapp(213, 104, 100, 14, 'DESIGNA EN TELEFON', { stil: 'gron', klick: () => A.go('design', konsolSpel ? { linje: 'telefon' } : undefined) }); hud(A); flikrad(A, 'telefoner'); return; }
      panel(146, 27, 234, 173);
      for (let j = 0; j < 84; j++) rect(148, 29 + j, 80, 1, mixa(0x1c2050, 0x0e1230, j / 84));
      Vy3d.visa({ x: 148, y: 29, w: 80, h: 84 }, telAv(p.design), { vy: 'auto', spin, pitch: 0.15, pixel: G.installningar.telefon === 'pixel', ctx });
      textB(kapa(p.namn, 148), 232, 30, F.text);
      const kamp = KAMPANJER.find((k) => k.id === p.kampanj);
      text(kapa(`${enhetsNamn(p.design.enhet)} · ${datumText(p.lanseradDag)}${kamp ? ' · ' + kamp.namn : ''}`, 146), 232, 40, F.dim);
      const vinst = modellVinst(p), vecka = Math.round(veckoEfterfragan(G, p));
      const korten = [
        ['BETYG', dec(p.betyg, 1) + ' / 10', F.guld], ['PRIS', kr(p.pris), F.text], ['KOSTAR', kr(p.styck), F.text],
        ['SÅLDA', tal(p.salda), F.bla2], ['INTÄKT', kr(p.intakt, true), F.text], ['VINST', kr(vinst, true), vinst >= 0 ? F.gron2 : F.rod2],
        ['I LAGER', String(p.lager) + (p.bestallning ? ' (+' + p.bestallning.antal + ')' : ''), F.text], ['FÖRRA V.', String(p.forraVeckan), F.text], ['MISSADE', String(p.missade), p.missade ? F.orange2 : F.text],
      ];
      korten.forEach(([e, v, c], i) => { const x = 232 + (i % 3) * 49, y = 48 + Math.floor(i / 3) * 19; rect(x, y, 47, 17, F.panel2); text(e, x + 3, y + 3, F.dim); text(kapa(v, 43), x + 3, y + 10, c); });
      // priset
      const rim = Math.round(rimligtPris(G.dag, p.betyg, p.design.enhet) / 10) * 10;   // per enhet (en laptop är värd mer)
      if (p.aktiv) {
        const np = nyttPris ?? p.pris;
        text('NYTT PRIS', 150, 116, F.dim); text(kr(np), 226, 116, np !== p.pris ? F.guld : F.text, { just: 'h' });
        reglage(150, 125, 76, np, Math.round(p.styck * 0.6 / 10) * 10, Math.round(rim * 2.2 / 10) * 10, (v) => { nyttPris = Math.round(v / 10) * 10; });
        knapp(232, 116, 70, 12, 'UPPDATERA PRIS', { stil: 'bla', av: np === p.pris, klick: () => { gjort(andraPris(G, p.id, np)); nyttPris = null; } });
        knapp(306, 116, 70, 12, bekr ? 'SÄKER? REA 50 %' : 'LÄGG NER', { stil: 'rod', klick: () => { if (bekr) { gjort(laggNer(G, p.id)); bekr = false; } else bekr = true; } });
        rect(150, 134, 226, 12, mixa(F.gron, F.panel, 0.7)); ram(150, 134, 226, 12, F.gron);
        text('AUTOMATISK PRODUKTION ÄR PÅ', 154, 138, F.gron2);
        knapp(296, 135, 79, 10, 'BLI VIRAL · ' + VIRAL_FP + ' FP', { stil: 'rosa', av: !kanViral(G, p) || G.bolag.fp < VIRAL_FP, klick: () => gjort(bliViral(G, p.id)) });
        if (p.buggar) knapp(150, 148, 120, 9, `UPPDATERING 1.1 (${p.buggar * PRICK_FP} FP)`, { stil: 'orange', av: G.bolag.fp < p.buggar * PRICK_FP, klick: () => gjort(uppdatering(G, p.id)) });
        // två fasta rader (priset bryts aldrig mitt i talet); rimligt pris följer enheten
        stycke(`MED BETYG ${dec(p.betyg, 1)} ÄR DEN VÄRD UNGEFÄR ${kr(rim)} IDAG.\nNU ~${vecka} KÖPARE/VECKA · BUZZ ${Math.round(buzz(p, G.dag) * 100)} %.`, 150, p.buggar ? 159 : 149, 226, F.dim, { rad: 6 });
      } else text(`UTGÅNGEN ${datumText(p.nedlagdDag)} · SÅLDES I ${p.veckor.length} VECKOR`, 150, 120, F.dim);
      // staplar per vecka
      staplar(p);
      if (konsolSpel) felruta(); else if (fel) { rect(146, 15, 120, 9, F.rod); text(fel, 148, 17, F.text); }
      hud(A); flikrad(A, 'telefoner');
    },
  };
  // konsolspelet: felet står ovanför prisraden (rubrikraden har växeln KONSOLER/TELEFONER)
  function felruta() { if (fel && lage === 'salu') { rect(232, 105, 144, 9, F.rod); text(kapa(fel, 140), 234, 107, F.text); } }
  function staplar(p) {
    const gy = 179, gh = 19, v = p.veckor.slice(-46), max = Math.max(10, ...v);
    text('SÅLDA PER VECKA', 150, gy - 1, F.text);
    rect(150, gy + 6, 226, gh, F.lo);
    v.forEach((n, i) => { const h = Math.round((n / max) * (gh - 2)), x = 152 + i * 4.9; rect(Math.round(x), gy + 6 + gh - 1 - h, 4, h, F.bla); rect(Math.round(x), gy + 6 + gh - 1 - h, 4, 1, F.bla2); });
  }

  // ---------- konsolerna (konsolspelet) ----------
  // Raderna är 30 px höga så att pixelbilden (40×28) får plats: namn och betyg, pris och sålda,
  // och på tredje raden hur många som har den hemma, antal spel och vad biblioteket ger.
  function konsoler(ctx) {
    panel(2, 27, 140, 173);
    text('DINA KONSOLER', 6, 31, F.text);
    const egna = [...mina()].reverse().sort((a, b) => b.aktiv - a.aktiv);
    if (!egna.length) {
      const bygge = konsolProjekt(G)[0];
      stycke(bygge ? `${bygge.design.namn} BYGGS PÅ KONTORET. LANSERA DEN SÅ HAMNAR DEN HÄR!` : 'DESIGNA DIN FÖRSTA KONSOL OCH LANSERA DEN!', 6, 40, 130, F.dim);
    }
    const hEgna = Math.min(64, Math.max(20, egna.length * 32));
    lista(4, 38, 136, hEgna, egna.length, 32, (i, y) => {
      const p = egna[i], vald = p.id === valdId;
      kort(6, y, 130, 30, { vald, klick: () => { valdId = p.id; nyttPris = null; bekr = false; fel = ''; }, namn: 'konsol-' + p.id });
      studio(7, y + 1, 42, 28);
      if (!p.aktiv) ctx.globalAlpha = 0.45;
      ritaKonsol2D(ctx, 8, y + 1, konsolTel(p.design).enhet);
      ctx.globalAlpha = 1;
      const b = dec(p.betyg, 1), max = 132 - 52;
      textB(b, 132, y + 4, p.aktiv ? F.guld : F.guld2, { just: 'h' });
      text(kapa(p.namn, max - tw(b, BIG) - 4), 52, y + 4, p.aktiv ? F.text : F.dim);
      // pris och sålda (en utgången konsol: UTGÅNGEN); sålda kortas till 12 T / 1,5 MILJ. när raden är full
      const fore = p.aktiv ? kr(p.pris) + ' · ' : 'UTGÅNGEN · ', s = antal(p.salda, max - tw(fore + ' SÅLDA'), false);
      text(s ? fore + s + ' SÅLDA' : antal(p.salda, max - tw(' SÅLDA')) + ' SÅLDA', 52, y + 13, p.aktiv ? F.gron2 : F.dim2);
      // installerad bas och spelen; bibliotekets faktor sist om den ryms
      const n = spelPa(G, p.id).filter((x) => x.status === 'ute' || x.status === 'slut').length;
      const spel = ` · ${n} SPEL`, bib = ' ×' + dec(bibliotek(G, p), 1);
      const hem = antal(p.installerade, max - tw(' HEMMA' + spel)) + ' HEMMA', w0 = tw(hem);
      text(hem, 52, y + 21, p.aktiv ? F.bla2 : F.dim2);
      text(spel, 52 + w0, y + 21, p.aktiv ? F.lila2 : F.dim2);
      if (w0 + tw(spel + bib) <= max) text(bib, 52 + w0 + tw(spel), y + 21, F.dim);
    }, skP);
    const ry = 40 + hEgna + 4;
    text('RIVALKONSOLER PÅ MARKNADEN', 6, ry, F.text);
    const riv = aktivaRivalKonsoler(G).sort((a, b) => b.lanseradDag - a.lanseradDag);
    if (!riv.length) text('INGA RIVALER JUST NU', 6, ry + 10, F.dim2);
    lista(4, ry + 7, 136, 198 - ry - 7, riv.length, 32, (i, y) => {
      const r = riv[i], b = dec(r.betyg, 1);
      rect(6, y, 130, 30, F.panel2); rect(6, y, 130, 1, F.hi);
      studio(7, y + 1, 42, 28); ritaKonsol2D(ctx, 8, y + 1, r.modell);
      textB(b, 133, y + 4, r.betyg >= 7 ? F.gron2 : r.betyg >= 6 ? F.guld : F.orange2, { just: 'h' });
      text(kapa(r.namn, 81 - tw(b, BIG) - 4), 52, y + 4, F.text);
      text(kapa(`${r.bolag} · ${kEnhetAv(r.enhet).namn}`, 81), 52, y + 13, F.dim);
      text(kapa(`${kr(r.pris)} · SEDAN ${arAv(r.lanseradDag)}`, 81), 52, y + 21, F.dim);
    }, skR);
    // höger: vald konsol
    const p = mina().find((x) => x.id === valdId);
    if (!p) {
      panel(146, 27, 234, 173);
      textB('INGEN KONSOL ÄN', 263, 90, F.dim, { just: 'c' });
      // byggs den första redan: till kontoret (där LANSERA finns), annars till designern
      if (konsolProjekt(G).length) knapp(213, 104, 100, 14, 'TILL KONTORET', { stil: 'orange', klick: () => A.go('kontor'), namn: 'konsoler-kontor' });
      else knapp(213, 104, 100, 14, 'DESIGNA EN KONSOL', { stil: 'gron', klick: () => A.go('design', { linje: 'konsol' }), namn: 'konsoler-designa' });
      return;
    }
    panel(146, 27, 234, 173);
    studio(148, 29, 80, 84);
    visaKonsol({ x: 148, y: 29, w: 80, h: 84 }, p.design, { vy: 'auto', spin, pixel: G.installningar.telefon === 'pixel', ctx });
    textB(kapa(p.namn, 148), 232, 30, F.text);
    const kamp = K_KAMPANJER.find((k) => k.id === p.kampanj);
    text(kapa(`${kEnhetAv(p.design.enhet).namn} · ${datumText(p.lanseradDag)}${kamp ? ' · ' + kamp.namn : ''}`, 146), 232, 40, F.dim);
    const vinst = modellVinst(p), vecka = Math.round(veckoEfterfragan(G, p)), bib = bibliotek(G, p);
    const spel = spelPa(G, p.id), ute = spel.filter((s) => s.status === 'ute' || s.status === 'slut').length, kommer = spel.length - ute;
    // BIBLIOTEK = 0,5 + spelens dragkraft: under 1 säljer konsolen sämre än den skulle med ett par bra spel
    const korten = [
      ['BETYG', dec(p.betyg, 1) + ' / 10', F.guld], ['PRIS', kr(p.pris), F.text], ['KOSTAR', kr(p.styck), F.text],
      ['SÅLDA', tal(p.salda), F.bla2], ['I HEMMEN', tal(Math.round(p.installerade || 0)), F.bla2], ['VINST', kr(vinst, true), vinst >= 0 ? F.gron2 : F.rod2],
      ['BIBLIOTEK', '×' + dec(bib, 1), bib < 1 ? F.orange2 : bib >= 1.5 ? F.gron2 : F.text], ['SPEL', String(ute) + (kommer ? ` (+${kommer})` : ''), F.lila2],
      ['I LAGER', String(p.lager) + (p.bestallning ? ' (+' + p.bestallning.antal + ')' : ''), F.text],
    ];
    korten.forEach(([e, v, c], i) => { const x = 232 + (i % 3) * 49, y = 48 + Math.floor(i / 3) * 19; rect(x, y, 47, 17, F.panel2); text(e, x + 3, y + 3, F.dim); text(kapa(v, e === 'SPEL' ? 33 : 43), x + 3, y + 10, c); });
    // SPEL-rutan leder till spelbiblioteket under STUDIOS
    const sx = 232 + 49, sy = 48 + 38;
    ikon('kassett', sx + 37, sy + 5, inne(sx, sy, 47, 17) ? F.lila2 : mixa(F.lila2, F.panel2, 0.4));
    hit(sx, sy, 47, 17, { klick: () => A.go('studios', { konsol: p.id }), namn: 'konsol-spel' });
    // priset (samma som telefonerna)
    const rim = Math.round(rimligtPris(G.dag, p.betyg, p.design.enhet) / 10) * 10;
    if (p.aktiv) {
      const np = nyttPris ?? p.pris;
      text('NYTT PRIS', 150, 116, F.dim); text(kr(np), 226, 116, np !== p.pris ? F.guld : F.text, { just: 'h' });
      reglage(150, 125, 76, np, Math.round(p.styck * 0.6 / 10) * 10, Math.round(rim * 2.2 / 10) * 10, (v) => { nyttPris = Math.round(v / 10) * 10; }, { namn: 'konsol-prisreglage' });
      knapp(232, 116, 70, 12, 'UPPDATERA PRIS', { stil: 'bla', av: np === p.pris, klick: () => { gjort(andraPris(G, p.id, np)); nyttPris = null; }, namn: 'konsol-pris' });
      knapp(306, 116, 70, 12, bekr ? 'SÄKER? REA 50 %' : 'LÄGG NER', { stil: 'rod', klick: () => { if (bekr) { gjort(laggNer(G, p.id)); bekr = false; } else bekr = true; }, namn: 'konsol-laggner' });
      rect(150, 134, 226, 12, mixa(F.gron, F.panel, 0.7)); ram(150, 134, 226, 12, F.gron);
      text('AUTOMATISK PRODUKTION ÄR PÅ', 154, 138, F.gron2);
      knapp(296, 135, 79, 10, 'BLI VIRAL · ' + VIRAL_FP + ' FP', { stil: 'rosa', av: !kanViral(G, p) || G.bolag.fp < VIRAL_FP, klick: () => gjort(bliViral(G, p.id)), namn: 'konsol-viral' });
      if (p.buggar) knapp(150, 148, 120, 9, `UPPDATERING 1.1 (${p.buggar * PRICK_FP} FP)`, { stil: 'orange', av: G.bolag.fp < p.buggar * PRICK_FP, klick: () => gjort(uppdatering(G, p.id)), namn: 'konsol-uppdatering' });
      // tre fasta rader: värdet, köparna och vad spelbiblioteket ger
      const rad3 = bib < 1 ? `FÅ SPEL: BIBLIOTEKET GER BARA ×${dec(bib, 1)} KÖPARE.` : `SPELBIBLIOTEKET GER ×${dec(bib, 1)} SÅ MÅNGA KÖPARE.`;
      stycke(`MED BETYG ${dec(p.betyg, 1)} ÄR DEN VÄRD UNGEFÄR ${kr(rim)} IDAG.\nNU ~${vecka} KÖPARE/VECKA · FÖRRA V. ${p.forraVeckan} · BUZZ ${Math.round(buzz(p, G.dag) * 100)} %.\n${rad3}`, 150, p.buggar ? 159 : 149, 226, F.dim, { rad: 6 });
    } else {
      text(`UTGÅNGEN ${datumText(p.nedlagdDag)} · SÅLDES I ${p.veckor.length} VECKOR`, 150, 120, F.dim);
      // spelen säljer vidare till dem som har konsolen hemma
      stycke(`${tal(Math.round(p.installerade || 0))} HAR DEN HEMMA – SPELEN TILL DEN SÄLJER VIDARE.`, 150, 130, 226, F.dim2, { rad: 6 });
    }
    staplar(p);
  }
  // konsolmuseet: korten 44×52 med pixelbilden av formen, namnet på två rader, betyget och antal sålda
  function museumK(ctx) {
    panel(2, 27, 378, 173);
    text('MUSEET – ALLA KONSOLER DU HAR GJORT', 6, 31, F.guld);
    const alla = mina();
    if (!alla.length) { stycke('HÄR SAMLAS VARJE KONSOL DU LANSERAR, MED BETYG OCH HUR MÅNGA SOM SÅLDES.', 6, 42, 300, F.dim); return; }
    const per = 8, rader = Math.ceil(alla.length / per);
    lista(4, 39, 374, 160, rader, 54, (r, y) => {
      for (let k = 0; k < per; k++) {
        const p = alla[r * per + k]; if (!p) break;
        const x = 6 + k * 46;
        rect(x, y, 44, 52, F.panel2); studio(x + 1, y + 1, 42, 28); ritaKonsol2D(ctx, x + 2, y + 1, konsolTel(p.design).enhet);
        const rader2 = radbryt(p.namn, 40);
        text(kapa(rader2[0], 40), x + 2, y + 32, F.text);
        if (rader2.length > 1) text(kapa(rader2.slice(1).join(' '), 40), x + 2, y + 39, F.text);
        const b = dec(p.betyg, 1); text(b, x + 2, y + 46, F.guld); text(antal(p.salda, 38 - tw(b) - 3), x + 42, y + 46, F.bla2, { just: 'h' });
        hit(x, y, 44, 52, { klick: () => { valdId = p.id; nyttPris = null; bekr = false; lage = 'salu'; }, namn: 'museum-' + p.id });
      }
    }, skM);
  }
  function museum(ctx) {
    panel(2, 27, 378, 173);
    text('MUSEET – ALLA TELEFONER DU HAR GJORT', 6, 31, F.guld);
    const alla = [...mina()];
    if (!alla.length) { stycke('HÄR SAMLAS VARJE TELEFON DU LANSERAR, MED BETYG OCH HUR MÅNGA SOM SÅLDES.', 6, 42, 300, F.dim); return; }
    // kortet 39×56: miniatyren, namnet på två rader (PIXEL / PHONE 12), betyget och antal sålda
    const per = 9, rader = Math.ceil(alla.length / per);
    lista(4, 39, 374, 160, rader, 58, (r, y) => {
      for (let k = 0; k < per; k++) {
        const p = alla[r * per + k]; if (!p) break;
        const x = 6 + k * 41;
        rect(x, y, 39, 56, F.panel2); ctx.drawImage(mini(p.design), x + 1, y + 1);
        const rader2 = radbryt(p.namn, 35);
        text(kapa(rader2[0], 35), x + 2, y + 38, F.text);
        if (rader2.length > 1) text(kapa(rader2.slice(1).join(' '), 35), x + 2, y + 45, F.text);
        const b = dec(p.betyg, 1); text(b, x + 2, y + 51, F.guld); text(antal(p.salda, 33 - tw(b) - 3), x + 37, y + 51, F.bla2, { just: 'h' });
        // ett tryck visar telefonen (pris, sålda, veckorna) under TILL SALU
        hit(x, y, 39, 56, { klick: () => { valdId = p.id; nyttPris = null; bekr = false; lage = 'salu'; }, namn: 'museum-' + p.id });
      }
    }, skM);
  }
}
