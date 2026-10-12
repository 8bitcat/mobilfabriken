// DESIGNSTUDION – tretton steg runt telefonen (riktig 3D eller pixel). Tiden står still här.
// Varje val ändrar modellen och tillverkningskostnaden direkt; låsta delar visar vad som krävs.
import { U, F, W, rect, ram, text, textB, knapp, panel, kort, chip, reglage, matare, ikon, hit, tw, kapa, stycke, radbryt, lista, ljusa, mixa, BIG } from '../core/ui.js';
import * as Vy3d from '../telefon/vy3d.js';
import { hud } from './ram.js';
import { GRUPPER, DELAR, KAROSSER, YTOR, FUNKTIONER, ENHETER, LEGENDARISKA, delAv } from '../data/delar.js';
import { NOD } from '../data/noder.js';
import { nyDesign, telAv, tum, styckkostnad, prisNu, harDel, harKaross, harFunktion, harEnhet, antalLinserTillatna, minRam, minDjup, forvantan, fraschhet, teknik, betyg } from '../sim/design.js';
import { aktivaEffekter, rimligtPris, prognos, snitt } from '../sim/marknad.js';
import { kanStarta, startaUtveckling, byggdagar, fabriksPris } from '../sim/projekt.js';
import { status as nodStatus } from '../sim/forskning.js';
import { kr, dec, arAv, klamp } from '../sim/bas.js';

const HAL = { x: 100, y: 26, w: 176, h: 174 };
const RX = 280, RW = 100;
const RAD = 12;           // radhöjden i vallistorna
const KONCEPT_TAK = 8;    // samma tak som KONCEPT_MAX i sim/projekt.js (avbrutna byggen)
const FARGER = ['#17151a', '#ebebee', '#b8bcc8', '#3a7bd5', '#c9323a', '#2f8f46', '#e8b230', '#f0b4c8', '#8e5bd1', '#2aa39a', '#e07a2e', '#1d2a44'];
const FARGNAMN = ['SVART', 'VIT', 'SILVER', 'BLÅ', 'RÖD', 'GRÖN', 'GUL', 'ROSA', 'LILA', 'TURKOS', 'ORANGE', 'MÖRKBLÅ'];
// färgens namn i infopanelen: en legendarisk yta heter som ytan, annars paletten (eller den legendariska färgen)
const fargNamn = (d) => {
  if (d.yta && d.yta.startsWith('leg-')) { const l = LEGENDARISKA.find((x) => 'leg-' + x.id === d.yta); if (l) return l.namn; }
  const f = String(d.farg || '').toLowerCase(), i = FARGER.indexOf(f);
  return i >= 0 ? FARGNAMN[i] : LEGENDARISKA.find((l) => l.farg === f)?.namn || 'EGEN FÄRG';
};
// funktionsbonusen så som kritikerna räknar den (sim/design.js betyg), och dess tak: med alla funktioner påslagna
// blir bonusen precis taket. Linser och tunna ramar räknas också som funktioner.
const funkBonus = (G, d) => betyg(G, d, arAv(G.dag), 1, 1, 0).funk;
const funkTak = (G, d) => betyg(G, { ...d, funktioner: FUNKTIONER.map((f) => f.id) }, arAv(G.dag), 1, 1, 0).funk;

const STEG = [
  { id: 'enhet', rubrik: 'ENHET', hjalp: 'VILKEN SORTS PRYL BYGGER NI?' },
  { id: 'kaross', rubrik: 'KAROSS', hjalp: 'KRITIKERNA ÄLSKAR NYA KAROSSER. FRÄSCHHETEN SJUNKER 16 % PER ÅR.' },
  { id: 'storlek', rubrik: 'STORLEK & FORM', hjalp: 'FORMEN ÄR DIN. STORLEKEN ÄNDRAR INTE BETYGET.' },
  { id: 'skarm', rubrik: 'SKÄRMTYP', hjalp: 'KRITIKERNAS MÅTTSTOCK. BLÅ KANT = VAD DE VÄNTAR SIG I ÅR.' },
  { id: 'selfie', rubrik: 'SELFIEKAMERA', hjalp: 'EN LITEN PRICK OVANFÖR SKÄRMEN.' },
  { id: 'bak', rubrik: 'BAKKAMEROR', hjalp: 'FLER LINSER KOMMER MED FORSKNING I KAMERAGRUPPEN.' },
  { id: 'chip', rubrik: 'CHIP', hjalp: 'PROCESSORN STYR HUR SNABB TELEFONEN KÄNNS.' },
  { id: 'minne', rubrik: 'MINNE', hjalp: 'ARBETSMINNE FÖR FART, LAGRING FÖR BILDER OCH MUSIK.' },
  { id: 'batteri', rubrik: 'BATTERI', hjalp: 'STÖRRE BATTERI GÖR TELEFONEN TJOCKARE.' },
  { id: 'natos', rubrik: 'NÄT & MJUKVARA', hjalp: 'SNABBARE NÄT OCH ETT BÄTTRE OPERATIVSYSTEM.' },
  { id: 'kropp', rubrik: 'KROPP & PORTAR', hjalp: 'MATERIAL, HEMKNAPP, LADDPORT OCH FUNKTIONER.' },
  { id: 'farg', rubrik: 'FÄRG & MÄRKE', hjalp: 'VÄLJ FÄRG, YTA OCH SÄTT DITT MÄRKE PÅ BAKSIDAN.' },
  { id: 'granska', rubrik: 'GRANSKNING', hjalp: 'SÄTT PRIS, DÖP TELEFONEN OCH STARTA UTVECKLINGEN.' },
];
export const DESIGNSTEG = STEG;
const GRUPPNAMN = Object.fromEntries(GRUPPER.map((g) => [g.id, g.namn]));

export function design(A, o = {}) {
  const G = A.G;
  const nytt = o.ny || !G.utkast;
  if (nytt) G.utkast = o.fran ? nyDesign(G, o.fran) : nyDesign(G, senasteDesign(G));
  const d = G.utkast;
  // Ny forskning följer med till nästa telefon (Mios löfte om GPS) – också till ett utkast eller koncept som
  // gjordes medan forskningen pågick. d.kandaFunk = funktionerna som var forskade när designen senast öppnades;
  // ett gammalt utkast utan listan får inga tillägg (vi vet inte vad barnet själv stängt av).
  nyaFunktioner(G, d, Array.isArray(d.kandaFunk) ? d.kandaFunk : nytt ? [] : forskadeFunk(G));
  let steg = o.steg ?? (G.designSteg || 0), vy = 'auto', yaw = 0.6, pitch = 0.2, spin = 0.6, drag = null, fel = '', skroll = { v: 0 }, skroll2 = { v: 0 }, lage = 'design';
  const hyllSkroll = { v: 0 };
  const ar = arAv(G.dag), eff = aktivaEffekter(G);
  const sattSteg = (s) => { steg = Math.max(0, Math.min(12, s)); G.designSteg = steg; skroll = { v: 0 }; skroll2 = { v: 0 }; fel = ''; };
  const tal = (n) => (n < 0 ? '-' : '') + Math.abs(n) + ' KR';

  // ---------- hjälp ----------
  const delStatus = (g, del) => {
    if (harDel(G, g, del.id)) return 'ok';
    const n = NOD[`del-${g}-${del.id}`]; if (!n) return 'ok';
    const s = nodStatus(G, n); return s === 'uppfinns' ? 'ar' : s === 'pagar' ? 'pagar' : 'forska';
  };
  // ---------- vallistor ----------
  // Varje steg ritar EN rullbar lista (ui.lista) med rader på 12 px: rubriker, delar, funktioner och egna rader.
  // Delarna visas nyast överst, så ny forskning syns direkt; äldre delar nås genom att rulla (hjul eller dra i kanten).
  function delRader(g) {
    const alla = DELAR[g], e = forvantan(g, ar);
    const forstaLast = alla.findIndex((x) => delStatus(g, x) !== 'ok');
    const visa = alla.filter((del, i) => delStatus(g, del) === 'ok' || i === e || i === forstaLast).reverse();
    if (g === 'selfie') visa.push({ id: 'ingen', namn: 'INGEN', kostnad: 0 });
    return [{ rubrik: GRUPPNAMN[g] }, ...visa.map((del) => ({ g, del }))];
  }
  // högerjusterad text i en rad; returnerar bredden så att namnet kan kapas till det som blir kvar
  const hoger = (s, x, y, c) => text(s, x, y, c, { just: 'h' });
  function delRad(g, del, y, kw) {
    const alla = DELAR[g], vald = d.val[g], valdDel = delAv(g, vald), e = forvantan(g, ar), i = alla.indexOf(del);
    const ingen = del.id === 'ingen', st = ingen ? 'ok' : delStatus(g, del);
    const arVald = ingen ? !d.selfie : (vald === del.id && (g !== 'selfie' || d.selfie));
    const pn = (x) => (x && x.ar ? prisNu(x, ar) : x?.kostnad || 0);
    const diff = pn(del) - (g === 'selfie' && !d.selfie ? 0 : pn(valdDel));
    kort(RX, y, kw, 11, { vald: arVald, av: st !== 'ok', namn: 'del-' + g + '-' + del.id, klick: st === 'ok' ? () => { if (ingen) d.selfie = false; else { d.val[g] = del.id; if (g === 'selfie') d.selfie = true; } if (g === 'batteri') d.form.djup = Math.max(d.form.djup, minDjup(d)); } : null });
    if (i === e) rect(RX + kw - 3, y + 1, 2, 9, F.bla2);
    let hw;
    if (st === 'ok') { if (!arVald) hw = hoger((diff >= 0 ? '+' : '') + tal(diff), RX + kw - 6, y + 3, diff <= 0 ? F.gron2 : F.guld); else { ikon('bock', RX + kw - 13, y + 2, F.bla2); hw = 7; } }
    else hw = hoger(st === 'ar' ? 'ÅR ' + del.ar : st === 'pagar' ? 'FORSKAS NU' : 'FORSKA', RX + kw - 6, y + 3, F.orange2);
    text(kapa(del.namn, kw - 14 - hw), RX + 4, y + 3, st === 'ok' ? F.text : F.dim2);
  }
  function funkRad(f, y, kw, fullt) {
    const pa = d.funktioner.includes(f.id);
    kort(RX, y, kw, 11, { vald: pa, namn: 'funk-' + f.id, klick: () => { d.funktioner = pa ? d.funktioner.filter((x) => x !== f.id) : [...d.funktioner, f.id]; } });
    let hw;
    if (pa) { ikon('bock', RX + kw - 13, y + 2, F.bla2); hw = 7; } else hw = hoger('+' + tal(prisNu(f, ar)), RX + kw - 6, y + 3, fullt ? F.dim2 : F.guld);
    text(kapa(f.namn, kw - 14 - hw), RX + 4, y + 3, F.text);
  }
  function ritaRad(r, y, kw) {
    if (r.rubrik) { text(r.rubrik, RX, y + 5, F.dim); if (r.hoger) hoger(r.hoger, RX + kw, y + 5, r.hogerFarg ?? F.dim); }
    else if (r.text) text(kapa(r.text, kw), RX, y + 3, r.farg ?? F.dim2);
    else if (r.rita) r.rita(y, kw);
    else if (r.funk) funkRad(r.funk, y, kw, r.fullt);
    else delRad(r.g, r.del, y, kw);
  }
  // listan fyller y..maxY; ryms allt blir den precis så hög som raderna. Måste den rulla blir den ett helt
  // antal rader hög (ingen halv rad längst ner när man kommer in i steget). Returnerar y under listan.
  function radLista(y, rader, maxY, sk = skroll) {
    const plats = Math.max(RAD, maxY - y), rull = rader.length * RAD > plats;
    const h = rull ? Math.max(RAD, Math.floor(plats / RAD) * RAD) : Math.max(RAD, rader.length * RAD), kw = rull ? RW - 5 : RW;
    lista(RX, y, RW, h, rader.length, RAD, (i, yy) => ritaRad(rader[i], yy, kw), sk);
    return y + h + 3;
  }

  // ---------- stegens innehåll ----------
  const STEGUI = {
    enhet(y) {
      for (const e of ENHETER) {
        if (y > 156) break;
        const ok = harEnhet(G, e.id), vald = d.enhet === e.id;
        kort(RX, y, RW, 16, { vald, av: !ok, klick: ok ? () => sattEnhet(d, e.id) : null });
        text(e.namn, RX + 4, y + 3, ok ? F.text : F.dim2); text(ok ? kapa(e.info, 92) : (ar < e.ar ? 'KOMMER ' + e.ar : 'KRÄVER FORSKNING'), RX + 4, y + 9, ok ? F.dim : F.orange2);
        if (!ok) ikon('las', RX + RW - 10, y + 4, F.orange); y += 18;
      }
    },
    kaross(y) {
      const forstaLast = KAROSSER.findIndex((x) => !harKaross(G, x.id));
      const visa = KAROSSER.filter((k, i) => harKaross(G, k.id) || i === forstaLast);
      lista(RX, y, RW, 170 - y, visa.length, 22, (i, yy) => {
        const k = visa[i], ok = harKaross(G, k.id), vald = d.kaross === k.id, fr = Math.round(fraschhet({ kaross: k.id }, ar) * 100);
        kort(RX, yy, RW - 3, 20, { vald, av: !ok, klick: ok ? () => { d.kaross = k.id; d.form.radie = k.radie; } : null });
        text(k.namn, RX + 4, yy + 3, ok ? F.text : F.dim2);
        text(ok ? kapa(k.info, 90) : (ar < k.ar ? 'KOMMER ' + k.ar : 'KRÄVER FORSKNING'), RX + 4, yy + 9, ok ? F.dim : F.orange2);
        if (ok) { text('FRÄSCH ' + fr + ' %', RX + 4, yy + 15, fr > 60 ? F.gron2 : fr > 30 ? F.guld : F.rod2); text(prisNu(k, ar) + ' KR', RX + RW - 8, yy + 15, F.dim, { just: 'h' }); }
      }, skroll);
    },
    storlek(y) {
      const tt = dec(tum(d), 1) + '"', fg = formAv(d.enhet);
      textB(tt, RX, y, F.text); text('SKÄRM', RX + tw(tt, BIG) + 4, y + 2, F.dim); y += 11;
      let cx = RX; ['LITEN', 'LAGOM', 'STOR'].forEach((t, i) => { const [b, h] = storlekar(fg)[i]; cx += chip(cx, y, t, { aktiv: Math.abs(d.form.bredd - b) < 0.005 && Math.abs(d.form.hojd - h) < 0.005, klick: () => { d.form.bredd = b; d.form.hojd = h; } }) + 3; });
      y += 14;
      const sl = (namn, nyckel, min, max, fmt, steg_) => { text(namn, RX, y, F.dim); text(fmt(d.form[nyckel]), RX + RW, y, F.text, { just: 'h' }); reglage(RX, y + 7, RW, d.form[nyckel], min, max, (v) => { d.form[nyckel] = Math.round(v / steg_) * steg_; if (nyckel === 'djup') d.form.djup = Math.max(d.form.djup, minDjup(d)); if (nyckel === 'ram') d.form.ram = Math.max(minRam(G), d.form.ram); }); y += 17; };
      const cm = (v) => dec(v * 10, 1) + ' CM';
      // gränserna följer enheten (en laptop kan inte bli 7 cm bred); ett stort batteri får höja taket för tjockleken
      const dMin = Math.max(fg.d[0], minDjup(d));
      sl('BREDD', 'bredd', fg.b[0], fg.b[1], cm, 0.01); sl('HÖJD', 'hojd', fg.h[0], fg.h[1], cm, 0.01); sl('TJOCKLEK', 'djup', dMin, Math.max(fg.d[1], dMin + 0.01), cm, 0.005);
      sl('HÖRN', 'radie', 0, 0.3, (v) => (v < 0.05 ? 'SKARPA' : v < 0.12 ? 'MJUKA' : v < 0.2 ? 'RUNDA' : 'KAPSEL'), 0.005);
      sl('SKÄRMRAM', 'ram', minRam(G), 0.14, cm, 0.005);
    },
    skarm(y) { radLista(y, [...delRader('upplosning'), ...delRader('frekvens'), ...delRader('skarmteknik')], 170); },
    selfie(y) { radLista(y, delRader('selfie'), 170); },
    bak(y) {
      y = radLista(y, delRader('bakkamera'), 134);
      text('LINSER PÅ BAKSIDAN', RX, y, F.dim); y += 7;
      const max = antalLinserTillatna(G); let cx = RX;
      for (let n = 1; n <= 4; n++) cx += chip(cx, y, String(n), { w: 16, aktiv: d.linser === n, av: n > max, klick: n <= max ? () => { d.linser = n; } : null }) + 3;
      y += 13; text('KAMERAÖ', RX, y, F.dim); reglage(RX, y + 7, RW, d.form.kameraStorlek, 0.12, 0.34, (v) => { d.form.kameraStorlek = Math.round(v / 0.005) * 0.005; });
    },
    chip(y) { radLista(y, delRader('chip'), 170); },
    minne(y) { radLista(y, [...delRader('ram'), ...delRader('lagring')], 170); },
    batteri(y) { y = radLista(y, delRader('batteri'), 156); text('MINSTA TJOCKLEK: ' + dec(minDjup(d) * 10, 1) + ' CM', RX, y, F.dim2); },
    natos(y) { radLista(y, [...delRader('nat'), ...delRader('os')], 170); },
    kropp(y) {
      const hemknapp = { rita: (yy) => {
        text('HEMKNAPP', RX, yy + 4, F.dim); let cx = RX + 40;
        cx += chip(cx, yy + 1, 'JA', { aktiv: d.hemknapp, klick: () => { d.hemknapp = true; d.form.haka = Math.max(d.form.haka, 0.12); } }) + 3;
        chip(cx, yy + 1, 'NEJ', { aktiv: !d.hemknapp, klick: () => { d.hemknapp = false; } });
      } };
      const delar = [...delRader('material'), hemknapp, ...delRader('port')];
      // funktioner: +0,1 var i betyget men bara upp till taket (sim/design.js betyg) – visa var man står.
      // Nyast forskade överst, som delarna.
      const funk = forskadeFunk(G).map((id) => FUNKTIONER.find((f) => f.id === id)), nu = funkBonus(G, d), tak = funkTak(G, d), fullt = nu >= tak - 1e-9;
      const funkRader = [{ rubrik: 'FUNKTIONER', hoger: '+' + dec(nu, 1) + ' AV +' + dec(tak, 1), hogerFarg: fullt ? F.guld : F.dim }];
      if (funk.length) {
        funkRader.push(fullt ? { text: 'MAX NÅTT: FLER GER INGET', farg: F.orange2 } : { text: '+0,1 VAR, HÖGST +' + dec(tak, 1) });
        for (const f of funk) funkRader.push({ funk: f, fullt });
      } else for (const r of radbryt('FORSKA FRAM GPS FÖR DIN FÖRSTA FUNKTION.', RW - 5)) funkRader.push({ text: r });
      // funktionerna får en egen lista längst ner (minst rubrik, förklaring och två funktioner) så att de syns
      // utan att man rullar; material och portar rullar i listan ovanför när allt inte ryms
      const plats = Math.floor((170 - y - 3) / RAD), nF = Math.min(funkRader.length, Math.max(4, plats - delar.length));
      y = radLista(y, delar, y + Math.max(1, plats - nF) * RAD);
      radLista(y, funkRader, 170, skroll2);
    },
    farg(y) {
      text('FÄRG', RX, y, F.dim); y += 7;
      FARGER.forEach((c, i) => { const x = RX + (i % 6) * 17, yy = y + Math.floor(i / 6) * 13, vald = d.farg.toLowerCase() === c, cc = parseInt(c.slice(1), 16); rect(x + 1, yy + 1, 14, 10, 0x05060f); rect(x, yy, 14, 10, cc); rect(x, yy, 14, 1, ljusa(cc, 0.3)); if (vald) ram(x - 1, yy - 1, 16, 12, F.guld); hit(x, yy, 14, 10, { klick: () => { d.farg = c; } }); });
      y += 28; text('YTA', RX, y, F.dim); y += 7;
      const ytor = [...YTOR, ...LEGENDARISKA.filter((l) => G.legendariska.includes(l.id)).map((l) => ({ id: 'leg-' + l.id, namn: l.namn, kostnad: 0, farg: l.farg }))];
      // de fyra vanliga ytorna ryms (y 106–154); de legendariska (gåvorna) hamnar sist och nås genom att rulla
      y = radLista(y, ytor.map((yt) => ({ rita: (yy, kw) => {
        kort(RX, yy, kw, 11, { vald: d.yta === yt.id, namn: 'yta-' + yt.id, klick: () => { d.yta = yt.id; if (yt.farg) d.farg = yt.farg; } });
        const hw = yt.kostnad ? hoger('+' + yt.kostnad + ' KR', RX + kw - 6, yy + 3, F.guld) : 0;
        text(kapa(yt.namn, kw - 14 - hw), RX + 4, yy + 3, yt.farg ? F.guld : F.text);
      } })), y + YTOR.length * RAD);
      text('MÄRKE', RX, y + 3, F.dim);
      knapp(RX + 34, y + 1, 12, 10, '-', { klick: () => { d.marke = String.fromCharCode(((d.marke.charCodeAt(0) - 65 + 25) % 26) + 65); } });
      rect(RX + 49, y, 14, 12, F.lo); textB(d.marke, RX + 56, y + 3, F.guld, { just: 'c' });
      knapp(RX + 66, y + 1, 12, 10, '+', { klick: () => { d.marke = String.fromCharCode(((d.marke.charCodeAt(0) - 65 + 1) % 26) + 65); } });
    },
    granska(y) {
      const styck = styckkostnad(G, d, eff), rim = Math.round(rimligtPris(G.dag, snitt(G.dag) + 0.3, d.enhet) / 10) * 10, marg = Math.round((1 - styck / d.pris) * 100);
      // etiketten får plats bredvid värdet: första alternativet som ryms, annars kapas det sista
      const rad = (e, v, c = F.text) => { const plats = RW - hoger(v, RX + RW, y, c) - 4, alt = [].concat(e); text(alt.find((s) => tw(s) <= plats) ?? kapa(alt[alt.length - 1], plats), RX, y, F.dim); y += 8; };
      rad('ATT TILLVERKA', kr(styck)); rad(['FABRIK (ENGÅNG)', 'FABRIK'], kr(fabriksPris(G, d))); rad('KASSA', kr(G.bolag.kassa), F.gron2);
      text('PRIS', RX, y + 1, F.dim); textB(kr(d.pris), RX + RW, y, F.text, { just: 'h' }); y += 9;
      const pmin = Math.max(100, Math.round(styck * 1.05 / 10) * 10), pmax = Math.max(pmin + 100, Math.round(rim * 2.4 / 10) * 10);
      reglage(RX, y + 1, RW, d.pris, pmin, pmax, (v) => { d.pris = Math.round(v / 10) * 10; }, { namn: 'design-pris' }); y += 10;
      rad('MARGINAL', marg + ' %', marg < 30 ? F.rod2 : marg < 55 ? F.guld : F.gron2);
      rad('RIMLIGT PRIS', '~' + kr(rim), F.dim);
      const tk = teknik(d, ar, eff), inom = tk.per.filter((p) => p.poang >= 1).length;
      rad('KRAV', `${inom} AV 13 DELAR I NIVÅ`, inom >= 12 ? F.gron2 : inom >= 8 ? F.guld : F.rod2);
      rad('KÖPARE/VECKA', '~' + Math.round(prognos(G, d, 6.2 + (inom - 7) * 0.25, d.pris)), F.text);
      const dagar = byggdagar(G, d); rad('BYGGTID', isFinite(dagar) ? dagar + ' DAGAR' : '-', F.text);
      text('NAMN', RX, y + 1, F.dim); y += 8;
      const falt = { x: RX, y, w: RW, h: 12 };
      rect(falt.x, falt.y, falt.w, falt.h, F.lo); ram(falt.x, falt.y, falt.w, falt.h, F.hi);
      if (!A._falt) text(kapa(d.namn || 'TRYCK OCH SKRIV ETT NAMN', RW - 6), RX + 3, y + 4, d.namn ? F.text : F.dim2);
      hit(falt.x, falt.y, falt.w, falt.h, { klick: () => A.textfalt(falt, d.namn, (v) => { d.namn = v; }, 18), namn: 'design-namn' });
    },
  };

  function vinkel() { return vy === 'auto' ? [spin, 0.2] : vy === 'manuell' ? [yaw, pitch] : { fram: [0, 0.22], bak: [Math.PI, 0.22], sida: [Math.PI / 2, 0.22], under: [0.3, -1.1] }[vy]; }
  function studio(ctx) {
    const { x, y, w, h } = HAL, golv = y + 120;
    for (let j = 0; j < h; j++) rect(x, y + j, w, 1, j < 120 ? mixa(0x1c2050, 0x0e1230, j / 120) : mixa(0x23234e, 0x15153a, (j - 120) / 54));
    rect(x, golv, w, 1, 0x3a3a70);
    // golvsken under telefonen: ellips rad för rad, tre ljusnivåer
    for (let j = -9; j <= 9; j++) { const hw = Math.round(64 * Math.sqrt(1 - (j / 9) ** 2)); for (const [f, a] of [[1, 0.07], [0.7, 0.08], [0.4, 0.1]]) { ctx.fillStyle = `rgba(80,120,255,${a})`; ctx.fillRect(x + w / 2 - Math.round(hw * f), golv + 26 + j, Math.round(hw * f) * 2, 1); } }
    ctx.fillStyle = 'rgba(79,240,255,.06)'; ctx.fillRect(x, y, 24, h); ctx.fillStyle = 'rgba(255,64,200,.06)'; ctx.fillRect(x + w - 24, y, 24, h);
  }
  function konceptHylla() {
    text('KONCEPTHYLLAN', RX, 30, F.guld);
    const n = G.koncept.length;
    if (!n) stycke('HÄR SPARAS DESIGNER SOM INTE STARTATS. TRYCK SPARA I GRANSKNINGEN.', RX, 42, RW, F.dim);
    // 8 kort ryms (y 39–183, TILLBAKA på 188); fler rullar. Konceptet laddas med sitt id, så det lämnar hyllan när det startas.
    const kw = n * 18 > 144 ? RW - 5 : RW;
    if (n) lista(RX, 39, RW, Math.min(144, n * 18), n, 18, (i, y) => {
      const c = G.koncept[i];
      kort(RX, y, kw, 17, { namn: 'koncept-' + i, klick: () => { G.utkast = JSON.parse(JSON.stringify(c)); A.go('design', { steg: 12 }); } });
      text(kapa(c.namn || 'NAMNLÖS', kw - 8), RX + 4, y + 3, F.text); text(kapa(kr(c.pris) + ' · ' + dec(tum(c), 1) + '"', kw - 8), RX + 4, y + 10, F.dim);
    }, hyllSkroll);
    knapp(RX, 188, RW, 10, 'TILLBAKA', { stil: 'morkt', klick: () => { lage = 'design'; } });
  }

  return {
    tid: false,
    // ingen exit(): d är alltid samma objekt som G.utkast, så ändringar sparas ändå. En exit som skrev
    // tillbaka d ångrade avsiktliga byten (koncepthyllan, BÖRJA OM och nollningen vid STARTA UTVECKLING).
    ner(x, y) { if (x >= HAL.x && x < HAL.x + HAL.w && y >= HAL.y && y < HAL.y + HAL.h) { const a = vinkel(); drag = { x, y, yaw: a[0], pitch: a[1] }; } },
    flytta(x, y) { if (drag && U.mus.ned) { vy = 'manuell'; yaw = drag.yaw + (x - drag.x) * 0.035; pitch = klamp(drag.pitch + (y - drag.y) * 0.03, -1.3, 1.3); } },
    upp() { drag = null; },
    tangent(e) { if (e.key === 'ArrowRight') { sattSteg(steg + 1); return true; } if (e.key === 'ArrowLeft') { sattSteg(steg - 1); return true; } return false; },
    rita(ctx, dt) {
      if (vy === 'auto') spin += dt * 0.9;
      const styck = styckkostnad(G, d, eff), st = STEG[steg];
      rect(0, 14, W, 11, 0x0a0d1a);
      // rubrikraden slutar före KONCEPT-knappen (x W − 146) även med långa bolagsnamn
      const svans = ' · TIDEN STÅR STILL', fore = ar + ' · ';
      text(fore + kapa(G.bolag.namn, W - 146 - 4 - 58 - tw(fore) - tw(svans)) + svans, 58, 17, F.dim);
      text('DESIGNSTUDIO', 4, 17, F.guld);
      knapp(W - 76, 15, 72, 9, 'TILL KONTORET', { stil: 'orange', klick: () => A.go('kontor'), namn: 'design-kontoret' });
      knapp(W - 146, 15, 66, 9, 'KONCEPT (' + G.koncept.length + ')', { stil: 'morkt', klick: () => { lage = lage === 'koncept' ? 'design' : 'koncept'; } });
      panel(2, 26, 96, 58);
      text('ATT TILLVERKA', 6, 30, F.dim); textB(kr(styck), 6, 37, F.guld);
      text(kapa(d.namn || 'NAMNLÖS TELEFON', 88), 6, 48, F.text);
      text(kapa(`${dec(tum(d), 1)}" SKÄRM · ${fargNamn(d)}`, 88), 6, 56, F.dim);
      text(`${dec(d.form.bredd * 10, 1)} × ${dec(d.form.hojd * 10, 1)} × ${dec(d.form.djup * 10, 1)} CM`, 6, 64, F.dim);
      text((KAROSSER.find((k) => k.id === d.kaross) || KAROSSER[0]).namn, 6, 72, F.dim2);
      text('VY', 4, 89, F.dim);
      [['auto', 'AUTO'], ['manuell', 'FRI'], ['fram', 'FRAM'], ['bak', 'BAK'], ['sida', 'SIDA'], ['under', 'UNDER']].forEach(([id, t], i) => knapp(4 + (i % 2) * 48, 96 + Math.floor(i / 2) * 13, 44, 10, t, { stil: 'dim', aktiv: vy === id, klick: () => { vy = id; } }));
      text('TELEFONEN RITAS SOM', 4, 140, F.dim);
      const lage3d = G.installningar.telefon !== 'pixel';
      knapp(4, 148, 44, 10, 'RIKTIG 3D', { stil: 'dim', aktiv: lage3d, klick: () => { G.installningar.telefon = '3d'; } });
      knapp(52, 148, 44, 10, 'PIXEL', { stil: 'dim', aktiv: !lage3d, klick: () => { G.installningar.telefon = 'pixel'; } });
      text('DRA I TELEFONEN', 4, 166, F.dim2); text('FÖR ATT VRIDA DEN', 4, 173, F.dim2);
      knapp(4, 186, 92, 11, 'BÖRJA OM', { stil: 'dim', klick: () => { G.utkast = null; A.go('design', { ny: true, steg: 0 }); } });
      studio(ctx);
      const a = vinkel();
      Vy3d.visa(HAL, telAv(d), { vy, spin, yaw: a[0], pitch: a[1], pixel: !lage3d, ctx });
      ram(HAL.x - 1, HAL.y - 1, HAL.w + 2, HAL.h + 2, F.hi);
      panel(RX - 2, 26, RW + 4, 174);
      if (lage === 'koncept') { konceptHylla(); } else {
        text(`STEG ${steg + 1} AV 13`, RX, 30, F.bla2);
        textB(st.rubrik, RX, 38, F.guld);
        let y = 48; for (const r of radbryt(st.hjalp, RW)) { text(r, RX, y, F.dim); y += 7; }
        STEGUI[st.id](y + 2);
        if (fel) text(kapa(fel, RW), RX, 168, F.rod2);
        if (steg > 0) knapp(RX, 176, 46, 10, 'TILLBAKA', { stil: 'morkt', klick: () => sattSteg(steg - 1) });
        if (steg < 12) { knapp(RX + (steg > 0 ? 52 : 0), 176, steg > 0 ? 48 : RW, 10, 'FORTSÄTT', { stil: 'bla', klick: () => sattSteg(steg + 1), namn: 'design-fortsatt' }); knapp(RX, 188, RW, 10, 'HOPPA TILL GRANSKNING', { stil: 'dim', klick: () => sattSteg(12), namn: 'design-hoppa' }); }
        else {
          const k = kanStarta(G, d);
          knapp(RX + 52, 176, 48, 10, 'SPARA', { stil: 'morkt', klick: () => {
            const alla = [JSON.parse(JSON.stringify(d)), ...G.koncept.filter((c) => c.id !== d.id)];
            G.koncept = alla.slice(0, KONCEPT_TAK);
            fel = alla.length > KONCEPT_TAK ? 'SPARAD, ÄLDSTA FÖLL BORT' : 'SPARAD PÅ KONCEPTHYLLAN';
          } });
          knapp(RX, 188, RW, 10, k.ok ? 'STARTA UTVECKLING' : kapa(k.fel, RW - 6), { stil: 'gron', av: !k.ok, namn: 'design-starta', klick: () => {
            const r = startaUtveckling(G, d); if (!r.ok) { fel = r.fel; A.ljud('fel'); return; }
            G.utkast = null; G.designSteg = 0; A.ljud('klar'); A.spelaTid(); A.go('kontor');
          } });
        }
      }
      STEG.forEach((s, i) => { const px = 4 + i * 29, valt = i === steg, klar = i < steg; rect(px + 1, 205, 27, 9, 0x05060f); rect(px, 204, 27, 9, valt ? F.bla : klar ? mixa(F.gron, F.panel, 0.3) : F.panel2); text(String(i + 1), px + 13, 206, valt || klar ? F.text : F.dim2, { just: 'c' }); hit(px, 204, 27, 9, { klick: () => sattSteg(i), namn: 'design-steg-' + (i + 1) }); });
      hud(A);
    },
  };
}
// Nästa design utgår från den senast startade (bygget som pågår, annars den senast lanserade). Nya funktioner
// läggs till av nyaFunktioner() när designern öppnas. Delarna byter man själv; granskningens KRAV visar vad som släpar.
function senasteDesign(G) {
  const p = G.projekt[G.projekt.length - 1] || G.produkter[G.produkter.length - 1]; if (!p) return null;
  const d = JSON.parse(JSON.stringify(p.design)); d.namn = '';
  return d;
}
// forskade funktioner, nyast forskad först
const forskadeFunk = (G) => FUNKTIONER.filter((f) => harFunktion(G, f.id)).map((f) => f.id)
  .sort((a, b) => G.forskning.klara.lastIndexOf('funk-' + b) - G.forskning.klara.lastIndexOf('funk-' + a));
// Slår på funktioner som är forskade men inte fanns i 'kanda' – nyast först och bara så länge de höjer betyget
// (bonusen har ett tak). En funktion som redan var känd och är avstängd har barnet valt bort, den rörs inte.
function nyaFunktioner(G, d, kanda) {
  d.funktioner ||= [];
  for (const id of forskadeFunk(G)) {
    if (kanda.includes(id) || d.funktioner.includes(id)) continue;
    if (funkBonus(G, d) >= funkTak(G, d) - 1e-9) break;
    d.funktioner.push(id);
  }
  d.kandaFunk = forskadeFunk(G);
}
// Formens gränser per enhet (modellenhet 1 = 10 cm): f = förvalet (bredd, höjd, tjocklek), b/h/d = reglagens
// [min, max]. LITEN/LAGOM/STOR = förvalet × 0,87 / 1 / 1,13 (telefonen behåller sina egna tre storlekar).
const FORM = {
  telefon: { f: [0.69, 1.09, 0.11], b: [0.5, 1.0], h: [0.9, 1.9], d: [0.06, 0.2], storlekar: [[0.6, 1.0], [0.69, 1.09], [0.78, 1.4]] },
  platta: { f: [1.5, 2.0, 0.08], b: [1.2, 2.2], h: [1.6, 2.8], d: [0.05, 0.15] },
  laptop: { f: [2.4, 1.6, 0.15], b: [1.8, 3.6], h: [1.2, 2.4], d: [0.1, 0.25] },
  klocka: { f: [0.42, 0.5, 0.11], b: [0.3, 0.6], h: [0.35, 0.7], d: [0.06, 0.2] },
  horlurar: { f: [0.5, 0.62, 0.22], b: [0.35, 0.7], h: [0.45, 0.85], d: [0.12, 0.3] },
  vikbar: { f: [0.74, 1.62, 0.09], b: [0.6, 0.9], h: [1.3, 1.9], d: [0.06, 0.2] },
};
const formAv = (enhet) => FORM[enhet] || FORM.telefon;
const storlekar = (fg) => fg.storlekar || [0.87, 1, 1.13].map((k) => [Math.round(fg.f[0] * k * 100) / 100, Math.round(fg.f[1] * k * 100) / 100]);
function sattEnhet(d, id) {
  d.enhet = id;
  const f = formAv(id).f;
  // batteriet bestämmer minsta tjocklek (som reglaget och startaUtveckling): en platta blir aldrig tunnare än batteriet
  d.form.bredd = f[0]; d.form.hojd = f[1]; d.form.djup = Math.max(f[2], minDjup(d));
}
