// BOLAGET – ekonomin, de 28 målen, marknaderna, kontorsflytten och (till sist) att sälja bolaget.
// Konsolspelet (G.lage 'konsol') har egna mål och utmärkelser (malLista/utmarkelseLista), egna kontorskrav
// (kontorKrav), billigare marknader och lokaler innan 2007 (regionPris/flyttPris) och visar den installerade
// basen och spelbiblioteket i ekonomin.
import { U, F, W, rect, ram, text, textB, knapp, panel, kort, ikon, hit, tw, kapa, matare, stycke, lista, stjarnor, ljusa, mixa, BIG } from '../core/ui.js';
import { hud, flikrad } from './ram.js';
import { REGIONER, KONTOR, kontorAv } from '../data/varld.js';
import { malLista, nastaMal, marknadsandel, utmarkelseLista, senasteVeckor } from '../sim/mal.js';
import { tackning, regionPris } from '../sim/marknad.js';
import { kravUppfyllt, flytta, kontorKrav, flyttPris } from '../sim/kontor.js';
import { betala, nyhet, signal, SALJ_AR, arKonsolSpel, startDag } from '../sim/spel.js';
import { installeradBas, slapptaSpel } from '../sim/konsol.js';
import { lonPerManad } from '../sim/personal.js';
import { modellVinst } from '../sim/projekt.js';
import { kr, dec, datumText, arAv, dagForAr, tal } from '../sim/bas.js';
import * as Spara from '../core/spara.js';
import { rensaRum } from '../art/kontor-art.js';
import { $t } from '../core/i18n.js';

const FLIKAR = [['ekonomi', $t('EKONOMI')], ['mal', $t('MÅL')], ['marknader', $t('MARKNADER')], ['kontor', $t('KONTOR')], ['salj', $t('SÄLJ BOLAGET')]];
const KAT = { forsaljning: $t('FÖRSÄLJNING'), mal: $t('MÅLBELÖNINGAR'), mobler: $t('MÖBLER'), loner: $t('LÖNER'), utveckling: $t('UTVECKLING'), tillverkning: $t('TILLVERKNING'), fabrik: $t('FABRIKER'), reklam: $t('REKLAM'), kontor: $t('KONTOR'), personal: $t('PERSONAL'), marknader: $t('MARKNADER'), ranta: $t('RÄNTA'), gavor: $t('GÅVOR'), lan: $t('LÅN'), spel: $t('SPEL') };

// SPELDESIGN §2.12: (kassa − lån + 10 × telefonernas vinst de senaste 52 kalenderveckorna) × rykte.
// En nedlagd telefon räknas bara för de veckor av året då den fortfarande såldes.
export const bolagsVarde = (G) => {
  const vinst = G.produkter.reduce((s, p) => s + Math.max(0, senasteVeckor(G, p, 52).reduce((a, b) => a + b, 0) * (p.pris - p.styck)), 0);
  return Math.max(0, Math.round((G.bolag.kassa - G.lan + 10 * vinst) * G.bolag.rykte));
};
// Bolaget går att sälja vid Slutgalan 1 januari 2027 (§2.12) – inte tidigare, annars går arvet att samla
// genom att starta och sälja nya bolag direkt.
export { SALJ_AR };   // (sim/spel.js – nyårsrapporten 2027 säger att säljknappen är upplåst)
export const kanSaljas = (G) => arAv(G.dag) >= SALJ_AR;
// BETALA AV: så mycket stannar kvar i kassan (tre månadslöner, minst 100 000) så att nästa lönedag
// inte tömmer kassan och ger ett nytt nödlån direkt
export const lanBuffert = (G) => Math.max(100_000, 3 * lonPerManad(G));
export const kanBetalaAv = (G) => Math.max(0, Math.min(G.lan, Math.floor(G.bolag.kassa - lanBuffert(G))));

export function bolaget(A, o = {}) {
  const G = A.G;
  let flik = o.flik || 'ekonomi', fel = '', bekr = false;
  const skM = { v: 0 }, skU = { v: 0 };
  const gjort = (r) => { if (!r.ok) { fel = r.fel || $t('GICK INTE'); A.ljud('fel'); } else { fel = ''; A.ljud('mynt'); } };
  return {
    tid: true,
    rita(ctx) {
      rect(0, 14, W, 11, 0x0a0d1a);
      textB($t('BOLAGET'), 4, 16, F.guld); text($t`${G.bolag.namn} · GRUNDAT ${datumText(startDag(G))}`, 50, 18, F.dim);
      let fx = 4;
      for (const [id, n] of FLIKAR) fx += knapp(fx, 27, tw(n) + 10, 10, n, { stil: 'dim', aktiv: flik === id, klick: () => { flik = id; bekr = false; fel = ''; }, namn: 'bolag-flik-' + id }) + 3;
      panel(2, 40, 378, 160);
      ({ ekonomi, mal: malVy, marknader, kontor: kontorVy, salj })[flik](ctx);
      if (fel) { rect(2, 190, 378, 10, F.rod); text(fel, 191, 192, F.text, { just: 'c' }); }
      hud(A); flikrad(A, 'bolaget');
    },
  };
  function ekonomi() {
    const a = arAv(G.dag), s = G.stat.ar[a] || { intakt: 0, kostnad: 0, per: {} }, f = G.stat.ar[a - 1], konsol = arKonsolSpel(G);
    // kassagraf (i konsolspelet lite lägre: en rad till med installerad bas och spelbiblioteket ska få plats)
    text($t('KASSAN VECKA FÖR VECKA'), 8, 44, F.text);
    const gx = 8, gy = 52, gw = 220, gh = konsol ? 54 : 70, pts = G.stat.kassa.slice(-110);
    rect(gx, gy, gw, gh, F.lo);
    if (pts.length > 1) {
      const max = Math.max(...pts.map((p) => p[1]), 1), min = Math.min(0, ...pts.map((p) => p[1]));
      const ny = (v) => gy + gh - 2 - Math.round((v - min) / (max - min || 1) * (gh - 4));
      if (min < 0) rect(gx, ny(0), gw, 1, F.rod);
      pts.forEach((p, i) => { const x = gx + Math.round(i * (gw - 2) / Math.max(1, pts.length - 1)) + 1, y = ny(p[1]); rect(x, y, 2, gy + gh - y - 1, mixa(F.gron, F.lo, 0.6)); rect(x, y, 2, 1, F.gron2); });
      text(kr(max, true), gx + 2, gy + 2, F.dim);
    }
    // nyckeltalen i rader om 20 px under grafen (telefonerna: y 128, 148, 168)
    const ry = gy + gh + 6;
    text($t('KASSA'), 8, ry, F.dim); textB(kr(G.bolag.kassa), 8, ry + 7, G.bolag.kassa >= 0 ? F.text : F.rod2);
    text($t('SÅLDA TOTALT'), 120, ry, F.dim); textB(tal(G.bolag.totaltSalda), 120, ry + 7, F.bla2);
    text($t('RYKTE'), 8, ry + 20, F.dim); textB(dec(G.bolag.rykte, 2), 8, ry + 27, F.guld);
    text($t('BÄSTA BETYG'), 120, ry + 20, F.dim); textB(dec(G.bolag.bastaBetyg, 1), 120, ry + 27, F.guld);
    let ly = ry + 40;
    if (konsol) {
      // konsolerna som står i folks hem (studiorna tittar på den) och spelen som finns till dem
      const ute = slapptaSpel(G).length, paGang = (G.k?.spel || []).filter((x) => x.status === 'utvecklas' || x.status === 'vantar').length;
      text($t('INSTALLERAD BAS'), 8, ly, F.dim); textB(tal(Math.round(installeradBas(G))), 8, ly + 7, F.lila2);
      text($t('SPEL I BIBLIOTEKET'), 120, ly, F.dim);
      const sw = textB(String(ute), 120, ly + 7, F.lila2);
      if (paGang) text(kapa($t`+${paGang} PÅ GÅNG`, 104 - sw), 124 + sw, ly + 9, F.dim);
      ly += 20;
    }
    text($t('LÅN'), 8, ly, F.dim); textB(kr(G.lan), 8, ly + 7, G.lan ? F.rod2 : F.dim);
    if (G.lan) {
      // återbetalningen är ingen kostnad (lånet var ingen intäkt) – bara räntan räknas i årets resultat
      const b = kanBetalaAv(G);
      knapp(80, ly + 4, 100, 10, b > 0 ? $t`BETALA AV ${kr(b, true)}` : $t('BETALA AV'), { stil: 'rod', av: b <= 0, namn: 'bolag-betala', klick: () => {
        const n = kanBetalaAv(G); if (n <= 0) return;
        G.bolag.kassa -= n; G.lan -= n; A.ljud('mynt');
        nyhet(G, 'DU', G.lan ? $t`${G.bolag.namn} BETALADE TILLBAKA ${kr(n)} TILL BANKEN. KVAR ATT BETALA: ${kr(G.lan)}.` : $t`${G.bolag.namn} BETALADE TILLBAKA ${kr(n)} TILL BANKEN. LÅNET ÄR BETALT!`);
      } });
      text($t`${kr(lanBuffert(G), true)} STANNAR I KASSAN TILL LÖNERNA`, 8, ly + 17, F.dim2);
    }
    // årets resultat per kategori
    text($t`ÅR ${a} HITTILLS`, 236, 44, F.text);
    let y = 53;
    const rader = Object.entries(s.per).sort((x, y2) => Math.abs(y2[1]) - Math.abs(x[1])).slice(0, 11);
    for (const [k, v] of rader) { text(KAT[k] || k.toUpperCase(), 236, y, F.dim); text(kr(v, true), 374, y, v >= 0 ? F.gron2 : F.rod2, { just: 'h' }); y += 8; }
    rect(236, y, 138, 1, F.hi); y += 3;
    text($t('RESULTAT'), 236, y, F.text); text(kr(s.intakt - s.kostnad, true), 374, y, s.intakt - s.kostnad >= 0 ? F.gron2 : F.rod2, { just: 'h' }); y += 10;
    if (f) { text($t`FÖRRA ÅRET (${a - 1})`, 236, y, F.dim); text(kr(f.intakt - f.kostnad, true), 374, y, f.intakt - f.kostnad >= 0 ? F.gron2 : F.rod2, { just: 'h' }); }
  }
  function malVy() {
    // telefonspelets 28 mål eller konsolspelets (K_MAL i sim/mal.js)
    const n = nastaMal(G), ML = malLista(G), UL = utmarkelseLista(G);
    text($t`MÅL KLARA: ${G.mal.klara.length} AV ${ML.length}`, 8, 44, F.text); matare(100, 45, 120, 4, G.mal.klara.length / ML.length, F.guld2);
    lista(4, 52, 226, 146, ML.length, 12, (i, y) => {
      const m = ML[i], klar = G.mal.klara.includes(m.nr), nu = n && n.nr === m.nr, belopp = kr(m.belopp, true);
      rect(6, y, 222, 11, nu ? mixa(F.guld2, F.panel, 0.7) : F.panel2);
      text(String(m.nr), 16, y + 3, klar ? F.gron2 : nu ? F.guld : F.dim2, { just: 'h' });
      if (klar) ikon('bock', 19, y + 2, F.gron2);
      text(kapa(m.text, 190 - tw(belopp)), 28, y + 3, klar ? F.dim : nu ? F.text : F.dim2);
      text(belopp, 224, y + 3, klar ? F.gron2 : F.guld, { just: 'h' });
    }, skM);
    // utmärkelserna: telefonernas nio ryms, konsolspelets elva rullar
    text($t('UTMÄRKELSER'), 238, 44, F.text);
    lista(236, 54, 142, 145, UL.length, 15, (i, y) => {
      const u = UL[i], har = G.mal.utmarkelser.includes(u.id);
      rect(238, y, 138, 13, har ? mixa(F.guld2, F.panel, 0.6) : F.panel2); ikon('stjarna', 241, y + 3, har ? F.guld : F.dim2);
      text(u.namn, 251, y + 2, har ? F.text : F.dim2); text(kapa(u.text, 120), 251, y + 8, F.dim);
    }, skU);
  }
  function marknader() {
    text($t('MARKNADER'), 8, 44, F.text);
    text($t`DU SÄLJER I ${Math.round(tackning(G) * 100)} % AV VÄRLDEN · MARKNADSANDEL ${Math.round(marknadsandel(G) * 1000) / 10} %`, 8, 52, F.dim);
    REGIONER.forEach((r, i) => {
      // priset följer prisnivån (konsolspelet: billigare innan 2007), samma i texten och vid köpet
      const har = G.marknad.regioner.includes(r.id), y = 62 + i * 30, kanRykte = G.bolag.rykte >= (r.rykteMin || 0), pris = regionPris(G, r);
      kort(8, y, 366, 26, { vald: har });
      ikon('globe', 13, y + 4, har ? F.gron2 : F.dim);
      const rNamn = r.namn;
      textB(rNamn, 24, y + 4, har ? F.text : F.dim);
      text($t`${Math.round(r.andel * 100)} % AV VÄRLDENS KÖPARE`, 24, y + 15, F.dim);
      if (har) text($t('DU SÄLJER HÄR'), 368, y + 9, F.gron2, { just: 'h' });
      else {
        if (!kanRykte) text($t`KRÄVER RYKTE ${dec(r.rykteMin, 2)}`, 260, y + 9, F.orange2, { just: 'h' });
        knapp(266, y + 7, 102, 12, $t`ÖPPNA · ${kr(pris, true)}`, { stil: 'gron', av: !kanRykte || G.bolag.kassa < pris, namn: 'bolag-marknad-' + r.id, klick: () => {
          if (G.marknad.regioner.includes(r.id) || G.bolag.kassa < pris) return;
          betala(G, pris, 'marknader'); G.marknad.regioner.push(r.id); nyhet(G, 'DU', $t`${G.bolag.namn} BÖRJAR SÄLJA I ${rNamn}!`); signal(G, 'toast', { text: $t`NY MARKNAD: ${rNamn}`, farg: 'gron' }); A.ljud('mal');
        } });
      }
    });
  }
  function kontorVy() {
    text($t('KONTORET'), 8, 44, F.text);
    const i0 = KONTOR.findIndex((k) => k.id === G.kontor.niva);
    KONTOR.forEach((k, i) => {
      // kraven och priset följer läget (konsolspelet: egna krav, billigare lokaler innan 2007; SNABBT LÄGE halva priset)
      const y = 52 + i * 28, nu = i === i0, klar = i < i0, nasta = i === i0 + 1, krav = kravUppfyllt(G, k.id), pris = flyttPris(G, k.id), kt = kontorKrav(G, k.id).kravText;
      kort(8, y, 366, 25, { vald: nu });
      textB(k.namn, 14, y + 4, nu ? F.guld : klar ? F.dim : F.text);
      text($t`${k.bord} BORD · ${k.labb} LABBSPÅR · KANDIDATER UPP TILL ${'★'.repeat(k.tak)}`, 14, y + 15, F.dim);
      if (nu) text($t('NI SITTER HÄR'), 368, y + 9, F.guld, { just: 'h' });
      else if (klar) text($t('AVKLARAT'), 368, y + 9, F.dim, { just: 'h' });
      else {
        text(kt ? $t`KRAV: ${kt}` : '', 262, y + 4, krav ? F.gron2 : F.orange2, { just: 'h' });
        if (nasta) knapp(266, y + 8, 102, 12, $t`FLYTTA · ${kr(pris, true)}`, { stil: 'gron', av: !krav || G.bolag.kassa < pris, namn: 'bolag-flytta', klick: () => { const r = flytta(G, k.id); gjort(r); if (r.ok) { rensaRum(); A.go('kontor'); } } });
        else text(kr(pris, true), 368, y + 14, F.dim, { just: 'h' });
      }
    });
  }
  function salj() {
    const varde = bolagsVarde(G), arv = Spara.arv() || { saldaBolag: 0, ytor: [], gamlaBolag: [] }, kan = kanSaljas(G), konsol = arKonsolSpel(G);
    textB($t('SÄLJ BOLAGET'), 8, 46, F.guld);
    // efter försäljningen väljer man spel igen på startskärmen: konsolerna 1982 eller snabbstarten 2007
    const slut = konsol ? $t('SPELET BÖRJAR OM I GARAGET – 1982 ELLER 2007.') : $t('SPELET BÖRJAR OM I GARAGET 2007.');
    stycke($t`VID SLUTGALAN 1 JANUARI 2027 KAN DU SÄLJA BOLAGET. DÅ FÅR NÄSTA BOLAG ETT ARV: +10 % STARTKASSA OCH +10 % FORSKNING PER SÅLT BOLAG (MAX 5) OCH DINA LEGENDARISKA YTOR, OCH DITT GAMLA BOLAG BLIR EN RIVAL. ${slut}`, 8, 58, 360, F.dim);
    text(kan ? $t('BOLAGETS VÄRDE') : $t('BOLAGETS VÄRDE IDAG'), 8, 86, F.dim); textB(kr(varde), 8, 94, F.gron2, { k: 2 });
    const prylar = !konsol ? $t('TELEFONERNA') : G.flaggor.mobil ? $t('KONSOLERNA OCH TELEFONERNA') : $t('KONSOLERNA');
    text($t`(KASSA - LÅN + 10 × ÅRSVINSTEN PÅ ${prylar}) × RYKTE`, 8, 112, F.dim2);
    text($t`TIDIGARE SÅLDA BOLAG: ${arv.saldaBolag}`, 8, 124, F.text);
    if (!kan) {
      knapp(8, 140, 160, 16, $t('KAN SÄLJAS 1 JAN 2027'), { stil: 'rod', F: BIG, av: true, namn: 'bolag-salj' });
      const dagar = dagForAr(SALJ_AR) - G.dag, ar = Math.floor(dagar / 365);
      text(ar >= 1 ? $t`${ar} ÅR KVAR TILL SLUTGALAN` : $t`${dagar} DAGAR KVAR TILL SLUTGALAN`, 176, 146, F.dim);
      return;
    }
    knapp(8, 140, 160, 16, bekr ? $t('ÄR DU SÄKER? TRYCK IGEN') : $t('SÄLJ BOLAGET'), { stil: 'rod', F: BIG, namn: 'bolag-salj', klick: () => {
      if (!bekr) { bekr = true; return; }
      if (!kanSaljas(G) || G.salt) return;
      const nytt = { saldaBolag: Math.min(5, arv.saldaBolag + 1), ytor: [...new Set([...(arv.ytor || []), ...G.legendariska])], gamlaBolag: [...(arv.gamlaBolag || []), { namn: G.bolag.namn, initial: G.bolag.initial, betyg: G.bolag.bastaBetyg, varde }].slice(-5) };
      // det sålda bolaget raderas: arvet har redan namn, betyg och värde, och sparningen får aldrig öppnas igen
      Spara.sparaArv(nytt); G.salt = { dag: G.dag, varde }; Spara.radera(G.id); A.G = null; A.ljud('mal');
      A.go('start', { salt: { namn: G.bolag.namn, varde } });
    } });
    if (bekr) text($t('BOLAGET FÖRSVINNER UR DINA BOLAG'), 176, 146, F.rod2);
  }
}
