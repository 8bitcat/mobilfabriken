// KONTORET – spelets nav. Teamet sitter vid borden, prickarna flyger, panelen nertill visar bygget
// (eller nästa mål och vad labbet gör). Klick på en tom bordsplats → BYGG, på en person → PERSONAL.
// Konsolspelet: ett konsolbygge med spel i lådan går i två faser – HÅRDVARA (blå prickar, som telefonen) och
// SPELET I LÅDAN (gröna prickar till en tredje, grön ring). En lånad utvecklare från en studio syns i panelen,
// och studiornas obesvarade förfrågningar blinkar ovanför den (→ STUDIOS).
import { U, F, W, rect, ram, text, textB, knapp, panel, ikon, hit, inne, tw, kapa, matare, stjarnor, ljusa, mixa } from '../core/ui.js';
import { ritaKontor } from '../art/kontor-vy.js';
import { hud, flikrad, flikarFor } from './ram.js';
import { kr, dec, datumText } from '../sim/bas.js';
import { byggkostnadPerDag, kopPrick, lagaBugg, avbryt, direktbygg, lanseringsKalkyl, PRICK_FP } from '../sim/projekt.js';
import { nastaMal, malLista } from '../sim/mal.js';
import { arKonsolSpel } from '../sim/spel.js';
import { packinDagar, lanbaraStudios, lanaUtvecklare, lanePris } from '../sim/konsol.js';
import { NOD } from '../data/noder.js';
import { onskemal } from '../sim/personal.js';
import { $t } from '../core/i18n.js';

export function kontor(A) {
  const pr = []; // flygande prickar
  let ticker = { text: '', x: W }, kamera = 0, kameraY = 0, dragX = null;
  // (typsnittet saknar minustecknet − som världshändelserna skriver, "−40 %": det ritas som -, som i NYHETER)
  const tick = () => { const n = A.G.nyheter.find((x) => x.typ !== 'DU') || A.G.nyheter[0]; return n ? `${datumText(n.dag)}  ·  ${n.text}`.replace(/−/g, '-') : ''; };
  return {
    tid: true,
    enter() { ticker.text = tick(); },
    ner(x, y) { if (y > 24 && y < 160) dragX = { x, y, k: kamera, ky: kameraY }; },
    flytta(x, y) { if (dragX && U.mus.ned) { kamera = dragX.k - (x - dragX.x); kameraY = dragX.ky - (y - dragX.y); } },
    upp() { dragX = null; },
    rita(ctx, dt) {
      const G = A.G;
      const { L, kx, ky } = ritaKontor(ctx, A, { kamera, kameraY });
      kamera = Math.max(0, Math.min(L.bredd - W, kamera)); kameraY = Math.max(0, Math.min(L.hojd - 202, kameraY));
      if (L.hojd > 202 || L.bredd > W) hit(0, 25, W, 136, { hjul: (dy) => { kameraY += dy; }, block: false });
      if (L.hojd > 202 && kameraY < L.hojd - 206) { const b = Math.round(Math.sin(A.t * 4)); rect(W - 70, 150, 66, 10, 0x0a0d1a); ikon('pil_ned', W - 68, 151 + b, F.guld); text($t('DRA FÖR MER'), W - 58, 152, F.guld); }
      if (L.bredd > W && kamera < L.bredd - W - 4) { rect(W - 70, 139, 66, 10, 0x0a0d1a); ikon('hoger', W - 68, 140, F.guld); text($t('DRA ÅT SIDAN'), W - 58, 141, F.guld); }
      ctx.save(); ctx.translate(-kx, -ky);
      // sur personal säger vad som hjälper
      const onske = onskemal(G);
      if (onske && G.personal.length) {
        const p = G.personal[Math.floor(A.t / 6) % G.personal.length], plats = L.bord[p.bord];
        if (plats && Math.floor(A.t / 3) % 2 === 0) {
          const bw = tw(onske) + 8, bx = plats.x + 18 - bw / 2, by = plats.fy - 54;
          rect(bx, by, bw, 10, 0xffffff); ram(bx, by, bw, 10, 0x2a1f3a); rect(bx + bw / 2 - 1, by + 10, 3, 2, 0xffffff); text(onske, bx + 4, by + 3, F.blak);
        }
      }
      ctx.restore();
      // prickarna. De flesta dyker in under panelens kant; den lånade utvecklarens prickar (som stiger från hens
      // rad i panelen) och de gröna som flyger till fliken STUDIOS ritas ovanpå panelen (over).
      for (const h of A.handelser.splice(0)) {
        if (h.typ === 'prick') {
          const plats = h.bord != null ? L.bord[h.bord] : L.bord[Math.floor(Math.random() * L.bord.length)], mal = prickMal(G, h.farg);
          if (h.lanad) pr.push({ x: 14, y: 192, farg: h.farg, t: 0, mal, over: true });
          else if (plats) pr.push({ x: plats.x + 46 - kx, y: plats.fy - 30 - ky, farg: h.farg, t: 0, mal, over: mal[1] > 200 });
          if (h.farg === 'bla' || h.farg === 'rod') A.ljud(h.farg === 'bla' ? 'prick' : 'bugg');
        } else if (h.typ === 'ticker') { ticker = { text: String(h.text).replace(/−/g, '-'), x: W }; }
      }
      for (const p of pr) p.t += dt;
      ritaPrickar(pr, false);
      // nyhetsticker
      if (ticker.text) {
        rect(0, 15, W, 9, 0x0a0d1a); rect(0, 24, W, 1, F.hi);
        ticker.x -= dt * 30; const tw_ = tw(ticker.text);
        if (ticker.x < -tw_) { ticker.text = tick(); ticker.x = W; }
        rect(0, 15, 34, 9, F.rod); text($t('NYTT'), 5, 17, F.text);
        ctx.save(); ctx.beginPath(); ctx.rect(36, 15, W - 36, 9); ctx.clip(); text(ticker.text, Math.round(ticker.x), 17, F.text); ctx.restore();
      }
      panelen(A);
      hud(A); flikrad(A, 'kontor');
      ritaPrickar(pr, true);
      for (let i = pr.length - 1; i >= 0; i--) if (pr[i].t > 1.4) pr.splice(i, 1);
    },
  };
}

// en flygande prick: kastbana från bordet till målet på 1,4 sekunder (en lagad bugg blir en bock som stiger)
function ritaPrickar(lista, over) {
  for (const p of lista) {
    if (!!p.over !== over) continue;
    const f = Math.min(1, p.t / 1.4), x = p.x + (p.mal[0] - p.x) * f * f, y = p.y - 14 * Math.sin(f * Math.PI) + (p.mal[1] - p.y) * f * f;
    const c = p.farg === 'bla' ? F.bla2 : p.farg === 'rod' ? F.rod2 : F.gron2;
    if (p.farg === 'lagad') { ikon('bock', Math.round(p.x - 3), Math.round(p.y - 10 - p.t * 8), F.gron2); }
    else { rect(Math.round(x) - 1, Math.round(y) - 1, 3, 3, c); rect(Math.round(x), Math.round(y) - 1, 1, 1, ljusa(c, 0.5)); }
  }
}
// lanseringskalkylen (utan reklam) räknas om bara när dagen, kassan eller projektet ändras – inte varje bildruta
let kalkyl = { nyckel: '', fattig: false };
function forLitePengar(G, pr) {
  const nyckel = pr.id + '|' + G.dag + '|' + Math.round(G.bolag.kassa) + '|' + pr.kvalitet + '|' + pr.buggar;
  if (kalkyl.nyckel !== nyckel) kalkyl = { nyckel, fattig: lanseringsKalkyl(G, pr.id, 'ingen').kvar < 0 };
  return kalkyl.fattig;
}
function ring(cx, cy, r, c, tjock = 2) {
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) { const d = Math.hypot(x, y); if (d <= r && d > r - tjock) rect(cx + x, cy + y, 1, 1, c); }
}
// bygget som panelen visar: det som byggs, annars det som är klart att lansera
const visatBygge = (G) => G.projekt.find((p) => p.status === 'bygger') || G.projekt.find((p) => p.status === 'klar');
// Panelens upplägg för ett bygge. Telefonen (och en konsol utan spel i lådan) har ringarna KVALITET och BUGGAR;
// en konsol med spel i lådan får en tredje, grön ring för spelet, och mätaren och knapparna till vänster smalnar.
//   bla/rod/gron = ringarnas mitt, kant = där vänsterdelen slutar, lansX = LANSERA-knappens vänsterkant,
//   radB = bredden på raden under mätaren (DIREKTBYGGE, LÅNA), knappB = köpknapparna under ringarna
const TELEFON = { bla: 298, rod: 338, gron: null, kant: 274, lansX: 150, radB: 136, knappB: 34 };
const MED_SPEL = { bla: 266, rod: 302, gron: 338, kant: 246, lansX: 136, radB: 124, knappB: 32 };
const upplagg = (pr) => (pr?.design.linje === 'konsol' && pr.design.packin ? MED_SPEL : TELEFON);
// vart en prick flyger: blå till KVALITET, röd till BUGGAR. Gröna prickar (spelutvecklarna) går till den gröna
// ringen när spelet i lådan görs – annars är det ett eget spel, och de flyger till fliken STUDIOS.
function prickMal(G, farg) {
  const pr = visatBygge(G), u = upplagg(pr);
  if (farg === 'bla') return [u.bla + 2, 178];
  if (farg === 'gron' && arKonsolSpel(G)) {
    if (u.gron && pr.fas === 'mjukvara' && pr.status === 'bygger') return [u.gron - 2, 178];
    const lista = flikarFor(G), i = lista.findIndex((f) => f.id === 'studios'), w = Math.floor(W / lista.length);
    if (i >= 0) return [Math.floor((W - w * lista.length) / 2) + i * w + Math.floor(w / 2), 208];
  }
  return [u.rod - 2, 178];
}
// studiornas obesvarade förfrågningar: en blinkande knapp ovanför panelen som leder till STUDIOS
function studioKnapp(A, y) {
  const n = A.G.k?.forfragningar?.length || 0; if (!n) return;
  const s = n === 1 ? $t`${n} STUDIO VILL GÖRA SPEL` : $t`${n} STUDIOS VILL GÖRA SPEL`, st = $t('STUDIOS'), w = 10 + tw(s) + 13 + tw(st) + 6, x = 8;
  const blink = Math.floor(A.t * 2) % 2 === 0, ned = inne(x, y, w, 11) && U.mus.ned, d = ned ? 1 : 0;
  knapp(x, y, w, 11, '', { stil: 'lila', klick: () => A.go('studios'), namn: 'kontor-studios' });
  if (blink) ram(x - 1 + d, y - 1 + d, w + 2, 13, F.guld);
  ikon('kassett', x + 3 + d, y + 2 + d, blink ? F.guld : F.text);
  const tx = x + 13 + d + text(s, x + 13 + d, y + 3 + d, F.text);
  ikon('hoger', tx + 3, y + 2 + d, F.guld); text(st, tx + 12, y + 3 + d, F.guld);
}
// låna en utvecklare av den studio som tycker bäst om bolaget (bara studios som gör eller gjort spel till dig)
function lanaKnapp(A, pr, x, y, w) {
  const G = A.G, studio = lanbaraStudios(G).sort((a, b) => (G.k.relation[b.id] || 0) - (G.k.relation[a.id] || 0))[0];
  knapp(x, y, w, 11, $t`LÅNA UTVECKLARE · ${kr(lanePris(G), true)}`, { stil: 'lila', av: G.bolag.kassa < lanePris(G), namn: 'kontor-lana', klick: () => {
    if (lanaUtvecklare(G, pr.id, studio.id).ok) A.ljud('mynt'); else A.ljud('fel');
  } });
}
// fasens färgade lapp framför dagraden (HÅRDVARA eller SPELET I LÅDAN: PANG!); returnerar bredden
function fasLapp(s, x, y, c) { const w = tw(s) + 5; rect(x, y, w, 7, mixa(c, F.panel, 0.62)); rect(x, y, w, 1, mixa(c, F.panel, 0.4)); text(s, x + 3, y + 1, ljusa(c, 0.55)); return w; }
function panelen(A) {
  const G = A.G, y = 162, pr = visatBygge(G);
  panel(2, y, 380, 39, { fyll: F.panel });
  if (arKonsolSpel(G)) studioKnapp(A, y - 13);
  if (pr) {
    const klar = pr.status === 'klar', proc = Math.min(1, pr.dagNu / pr.dagar), u = upplagg(pr);
    const konsol = pr.design.linje === 'konsol', mjuk = pr.fas === 'mjukvara', spel = u.gron != null;
    const ikf = konsol && mjuk && !klar ? F.gron : F.orange;
    rect(8, y + 4, 14, 14, mixa(ikf, F.panel, 0.5)); ikon(konsol ? 'kontroll' : 'telefon', 11, y + 7, konsol && mjuk && !klar ? F.gron2 : F.orange2);
    textB(klar ? kapa(pr.design.namn, 150) : $t`BYGGER ${kapa(pr.design.namn, 150)}`, 27, y + 4, F.text);
    // (bara buggfixare putsar ett klart bygge – konsolspelet börjar utan dem)
    const putsas = !arKonsolSpel(G) || G.personal.some((p) => p.roll === 'buggfixare');
    if (klar || !spel) text(klar ? $t`KLAR ${datumText(pr.klarDag)} · ${putsas ? $t('BUGGFIXARNA PUTSAR VIDARE') : $t('LANSERA NÄR DU VILL')}` : $t`DAG ${pr.dagNu} AV ${pr.dagar} · ${Math.round(proc * 100)} % KLART · ${kr(byggkostnadPerDag(G))}/DAG`, 27, y + 14, F.dim);
    else {
      // fasen: HÅRDVARA och sedan SPELET I LÅDAN, med fasens egen dagräkning
      // (spelDagar blir oändligt om hela teamet sades upp när hårdvaran blev klar)
      const rest = ' ' + (mjuk ? $t`DAG ${pr.spelDagNu} AV ${Number.isFinite(pr.spelDagar) ? pr.spelDagar : '?'} · ${kr(byggkostnadPerDag(G))}/DAG` : $t`DAG ${pr.dagNu} AV ${pr.dagar} · ${Math.round(proc * 100)} % KLART · ${kr(byggkostnadPerDag(G))}/DAG`);
      const plats = u.kant - 27 - tw(rest) - 5;
      const etikett = $t('SPELET I LÅDAN:') + ' ';
      const lapp = mjuk ? etikett + kapa($t(pr.design.packin.titel), plats - tw(etikett)) : $t('HÅRDVARA');
      const lw = fasLapp(lapp, 27, y + 13, mjuk ? F.gron : F.orange);
      text(rest, 27 + lw, y + 14, F.dim);
    }
    if (!spel) matare(8, y + 21, u.kant - 8, 4, proc, klar ? F.gron : F.orange);
    else {
      // mätaren i två delar: hårdvaran (orange) och spelet i lådan (grönt). Spelets längd är en uppskattning
      // tills hårdvaran är klar (packinDagar); delarna får mellan 40 och 75 % av bredden.
      const bredd = u.kant - 8, sd = mjuk ? pr.spelDagar : packinDagar(G), hd = pr.dagar;
      const hw = Math.round(Math.max(bredd * 0.4, Math.min(bredd * 0.75, bredd * hd / (hd + (Number.isFinite(sd) && sd > 0 ? sd : hd)))));
      matare(8, y + 21, hw, 4, mjuk || klar ? 1 : proc, klar ? F.gron : F.orange);
      matare(8 + hw + 2, y + 21, bredd - hw - 2, 4, klar ? 1 : mjuk ? pr.spelDagNu / Math.max(1, pr.spelDagar) : 0, F.gron);
    }
    // raden under mätaren: bekräftelsen för AVBRYT, gåvan DIREKTBYGGE (bara hårdvaran), LÅNA UTVECKLARE
    // eller den lånade, eller förklaringen av prickarna
    const lanbar = konsol && !klar && !pr.lanad && lanbaraStudios(G).length > 0;
    if (!klar && A.bekrafta === pr.id) text($t('TRYCK X IGEN FÖR ATT AVBRYTA'), 8, y + 30, F.rod2);
    else if (!klar && !mjuk && G.inventarie.direktbygge > 0) knapp(8, y + 27, u.radB, 11, $t`DIREKTBYGGE (${G.inventarie.direktbygge} KVAR)`, { stil: 'guld', namn: 'kontor-direktbygge', klick: () => { if (direktbygg(G, pr.id).ok) A.ljud('klar'); else A.ljud('fel'); } });
    else if (lanbar) lanaKnapp(A, pr, 8, y + 27, u.radB);
    else if (konsol && !klar && pr.lanad) { ikon('team', 8, y + 29, F.lila2); text(kapa($t`LÅNAD FRÅN ${$t(pr.lanad.namn)}`, u.radB - 12), 18, y + 30, F.lila2); }
    else text(mjuk && !klar ? $t('GRÖN PRICK = SPELETS KVALITET') : $t('BLÅ PRICK = KVALITET · RÖD = BUGG'), 8, y + 30, F.dim2);
    // räcker inte kassan till lanseringen säger knappen det (lånet erbjuds på lanseringsskärmen)
    const fattig = klar && forLitePengar(G, pr);
    knapp(u.lansX, y + 27, u.kant - u.lansX, 11, !klar ? $t('LANSERA NÄR KLAR') : fattig ? $t('LANSERA (FÖR LITE PENGAR)') : $t('LANSERA!'), { stil: fattig ? 'orange' : 'gron', av: !klar, klick: () => A.go('lansering', { projekt: pr.id }), namn: 'kontor-lansera' });
    // ringarna med köpknappar under
    ring(u.bla, y + 12, 9, F.bla); textB(String(pr.kvalitet), u.bla, y + 9, F.text, { just: 'c' }); text($t('KVALITET'), u.bla, y + 23, F.bla2, { just: 'c' });
    ring(u.rod, y + 12, 9, F.rod); textB(String(pr.buggar), u.rod, y + 9, F.text, { just: 'c' }); text($t('BUGGAR'), u.rod, y + 23, F.rod2, { just: 'c' });
    knapp(u.bla - u.knappB / 2, y + 30, u.knappB, 8, $t`+${PRICK_FP} FP`, { stil: 'bla', klick: () => { if (!kopPrick(G, pr.id).ok) A.ljud('fel'); }, av: klar || G.bolag.fp < PRICK_FP });
    knapp(u.rod - u.knappB / 2, y + 30, u.knappB, 8, $t`LAGA ${PRICK_FP}`, { stil: 'rod', klick: () => { if (!lagaBugg(G, pr.id).ok) A.ljud('fel'); }, av: G.bolag.fp < PRICK_FP || !pr.buggar });
    if (spel) {
      // spelet i lådan: tänds när hårdvaran är klar; när konsolen är klar visas spelets stjärnor under ringen
      const pa = mjuk || klar, c = pa ? F.gron : mixa(F.gron, F.panel, 0.6);
      ring(u.gron, y + 12, 9, c); textB(String(pr.spelKval || 0), u.gron, y + 9, pa ? F.text : F.dim2, { just: 'c' }); text($t('SPELET'), u.gron, y + 23, pa ? F.gron2 : F.dim2, { just: 'c' });
      if (klar && pr.packinStj) stjarnor(u.gron - 17, y + 30, pr.packinStj);
      else text($t`MÅL ${pr.spelMal}`, u.gron, y + 31, pa ? F.dim : F.dim2, { just: 'c' });
    }
    if (!klar) knapp(362, y + 4, 16, 11, 'X', { stil: 'rod', klick: () => { if (A.bekrafta === pr.id) { avbryt(G, pr.id); A.bekrafta = null; } else { A.bekrafta = pr.id; setTimeout(() => { A.bekrafta = null; }, 2500); } } });
    return;
  }
  // inget bygge: nästa mål, labbet och stora knappen
  const m = nastaMal(G), antal = malLista(G).length;
  if (m) {
    text($t`MÅL ${m.nr} AV ${antal}`, 8, y + 5, F.guld);
    textB(kapa($t(m.text), 160), 8, y + 13, F.text);
    text($t`BELÖNING ${kr(m.belopp)}`, 8, y + 25, F.gron2);
    matare(8, y + 32, 120, 3, G.mal.klara.length / antal, F.guld2);
  }
  // labbet
  const lx = 176;
  const pagar = G.forskning.pagar[0];
  text($t('LABBET'), lx, y + 5, F.bla2);
  if (pagar) { const n = NOD[pagar.nod]; text(kapa($t(n.namn), 100), lx, y + 13, F.text); text($t`${pagar.dagarKvar} DAGAR KVAR`, lx, y + 21, F.dim); matare(lx, y + 29, 90, 3, 1 - pagar.dagarKvar / pagar.totalt, F.bla); }
  else {
    // ledigt labb blinkar (Carl 2026-11-25: "när man inte forskar gör så att den rutan blinkar så man går dit")
    const blink = Math.floor(A.t * 2.5) % 2 === 0;
    if (blink) ram(lx - 3, y + 2, 98, 34, F.orange2);
    text($t('LEDIGT – VÄLJ NY TEKNIK'), lx, y + 13, blink ? F.orange2 : F.guld);
    knapp(lx, y + 23, 70, 10, $t('FORSKNING'), { stil: blink ? 'orange' : 'bla', klick: () => A.go('forskning'), namn: 'kontor-forskning' });
  }
  const harBord = G.kontor.bord.some(Boolean);
  // konsolspelet: DESIGNA KONSOL (med telefonavdelningen kan designern göra båda)
  const designa = !arKonsolSpel(G) ? $t('DESIGNA TELEFON') : G.flaggor.mobil ? $t('NY DESIGN') : $t('DESIGNA KONSOL');
  const stor = !harBord ? [$t('STÄLL UT BORD'), 'orange', () => A.go('bygg')] : !G.personal.length ? [$t('ANSTÄLL ETT TEAM'), 'rosa', () => A.go('personal')] : [designa, 'gron', () => A.go('design')];
  knapp(282, y + 8, 94, 22, stor[0], { stil: stor[1], klick: stor[2], namn: 'kontor-stor' });
}
