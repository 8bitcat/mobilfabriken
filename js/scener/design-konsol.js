// KONSOLDESIGNERN – konsolspelets sexton steg i designstudion (docs/KONSOLPLAN.md):
//   ENHET → FORM → PROCESSOR … MATERIAL (de nio delgrupperna) → FUNKTIONER → FÄRG & YTA → SPELET I LÅDAN →
//   PRIS & NAMN → GRANSKNING.
// Ramen (rubrikraden, 3D-hallen, stegraden, koncepthyllan, TILLBAKA/FORTSÄTT/STARTA) ritas av scenen i design.js;
// här finns stegens innehåll i högerpanelen (x 280–380) och det som bara gäller konsoler (spelet i lådan).
import { U, F, rect, ram, text, textB, knapp, kort, reglage, ikon, hit, tw, kapa, radbryt, lista, ljusa, mixa } from '../core/ui.js';
import { K_GRUPPER, K_DELAR, K_KAROSSER, K_ENHETER, K_FUNKTIONER, kDelAv, kNivaAv, kEnhetAv } from '../data/konsol.js';
import { YTOR, LEGENDARISKA } from '../data/delar.js';
import { SPEL, egetSpelAv } from '../data/konsol-varld.js';
import { NOD } from '../data/noder.js';
import { GLIMT, glimtBild } from '../konsol/glimtar.js';
import { harDel, harKaross, harFunktion, harEnhet, forvantan, fraschhet, prisNu, styckkostnad, teknik, betyg, kvalitetsMal, packinLediga } from '../sim/design.js';
import { rimligtPris, veckoEfterfragan, snitt } from '../sim/marknad.js';
import { byggdagar, fabriksPris, nastaNamn } from '../sim/projekt.js';
import { klararKrav, packinDagar } from '../sim/konsol.js';
import { status as nodStatus } from '../sim/forskning.js';
import { kr, dec, proc } from '../sim/bas.js';
import { $t } from '../core/i18n.js';

const L = 'konsol';
const RX = 280, RW = 100, RAD = 12;
const GRUPPNAMN = Object.fromEntries(K_GRUPPER.map((g) => [g.id, g.namn]));
// hjälptexten under rubriken: högst tre rader (100 px)
const HJALP = {
  cpu: $t('HJÄRNAN I LÅDAN. EN SNABBARE PROCESSOR KLARAR STÖRRE SPEL.'),
  grafik: $t('HUR SPELEN SER UT PÅ TV:N. BLÅ KANT = VAD KRITIKERNA VÄNTAR SIG I ÅR.'),
  ljud: $t('FRÅN PIP TILL MELODIER, CD-LJUD OCH SURROUND.'),
  minne: $t('MER MINNE GER STÖRRE SPELVÄRLDAR.'),
  media: $t('SPELEN SÄLJS PÅ MODUL, DISKETT ELLER SKIVA.'),
  kontroll: $t('DET SPELARNA HÅLLER I. MÅNGA SPEL KRÄVER RÄTT KONTROLL.'),
  nat: $t('SPELA MED KOMPISAR – FÖRST MED SLADD, SEDAN ÖVER NÄTET.'),
  spar: $t('HUR SPELARNA SPARAR. UTAN SPARNING BLIR DET LÖSENORD.'),
  material: $t('LÅDANS MATERIAL. FINARE MATERIAL GER BÄTTRE DESIGNBETYG.'),
};
export const K_STEG = [
  { id: 'enhet', rubrik: $t('ENHET'), hjalp: $t('VILKEN SORTS KONSOL BYGGER NI?') },
  { id: 'form', rubrik: $t('FORM'), hjalp: $t('KRITIKERNA ÄLSKAR NYA FORMER. FRÄSCHHETEN SJUNKER 12 % PER ÅR.') },
  ...K_GRUPPER.map((g) => ({ id: g.id, rubrik: g.namn, hjalp: HJALP[g.id] })),
  { id: 'funk', rubrik: $t('FUNKTIONER'), hjalp: $t('EXTRA FINESSER SOM KRITIKERNA GILLAR.') },
  { id: 'farg', rubrik: $t('FÄRG & YTA'), hjalp: $t('VÄLJ FÄRG OCH YTA. YTAN GER DESIGNPOÄNG.') },
  { id: 'packin', rubrik: $t('SPELET I LÅDAN'), hjalp: $t('SPELUTVECKLARNA GÖR DET EFTER HÅRDVARAN – OCH KONSOLEN SÄLJER MER.') },
  { id: 'pris', rubrik: $t('PRIS & NAMN'), hjalp: $t('RIMLIGT PRIS FÖLJER BETYGET. DÖP KONSOLEN!') },
  { id: 'granska', rubrik: $t('GRANSKNING'), hjalp: $t('SER ALLT BRA UT? STARTA UTVECKLINGEN.') },
];

// ---------- utkastet ----------
const packinAv = (e) => ({ id: e.id, titel: e.titel, glimt: e.glimt || null });
const nyasteKaross = (G, enhet) => [...K_KAROSSER].reverse().find((k) => k.enhet === enhet && harKaross(G, k.id, L)) || null;
// Rättar ett konsolutkast när designern öppnas: karossen hör till enheten, och ett spel i lådan som redan gjorts
// (en tidigare konsol, ett bygge som pågår eller spelutvecklarnas eget spel) byts mot nästa lediga som konsolen
// klarar. Valde barnet INGET SPEL står det kvar.
export function forberedKonsol(G, d) {
  d.funktioner ||= [];
  const k = K_KAROSSER.find((x) => x.id === d.kaross);
  if (!k || k.enhet !== d.enhet) { const ny = nyasteKaross(G, d.enhet); if (ny) d.kaross = ny.id; }
  if (d.packin) {
    const lediga = packinLediga(G);
    if (!lediga.some((e) => e.id === d.packin.id)) { const e = lediga.find((x) => klararKrav(d, x.kraver)); d.packin = e ? packinAv(e) : null; }
  }
}
// delarna konsolen saknar för ett spels krav, som delarnas namn ('STYRKORS')
export const saknadeDelar = (d, krav = {}) => Object.entries(krav).filter(([g, id]) => kNivaAv(g, d.val[g]) < kNivaAv(g, id)).map(([g, id]) => kDelAv(g, id)?.namn || id.toUpperCase());
export const fargNamnKonsol = (d, fargNamn) => (d.farg ? fargNamn(d) : $t('ORIGINALFÄRGER'));
const kravFor = (id) => egetSpelAv(id)?.kraver || {};
// Granskningsknappen: ett spel i lådan som konsolen inte längre klarar (delar bytta efteråt) stoppar starten
export function konsolKontroll(d) {
  const brist = d.packin ? saknadeDelar(d, kravFor(d.packin.id)) : [];
  return brist.length ? { ok: false, fel: $t`SPELET KRÄVER ${brist[0]}` } : { ok: true };
}

// ---------- stegen ----------
// api: { G, d, A, ar, eff, radLista, hoger, tal, skroll(), FARGER, fargNamn, forskadeFunk, funkBonus, funkTak, sattEnhet }
export function konsolSteg(api) {
  const { G, d, ar, eff, radLista, hoger, tal, FARGER } = api;
  const enhetF = () => kEnhetAv(d.enhet).kostnad;   // hemkonsolen 1, fickkonsolen 0,6 … (styckkostnad räknar så)
  const delStatus = (g, del) => {
    if (harDel(G, g, del.id, L)) return 'ok';
    const n = NOD[`kdel-${g}-${del.id}`]; if (!n) return 'ok';
    const s = nodStatus(G, n); return s === 'uppfinns' ? 'ar' : s === 'pagar' ? 'pagar' : 'forska';
  };
  const nodText = (nodId, nodAr) => { const n = NOD[nodId], s = n ? nodStatus(G, n) : 'redo'; return s === 'uppfinns' ? $t`ÅR ${nodAr}` : s === 'pagar' ? $t('FORSKAS NU') : $t('FORSKA'); };
  // kritikernas gissning: designens teknik och form som de är, halvputsat och tre buggar (som ett första bygge med
  // en forskare: PIXELBOX 1 gissas till 6,8 och landar på 6,3–7,5)
  const gissning = () => { const m = kvalitetsMal(d, ar); return betyg(G, d, ar, Math.round(m / 2), m, 3, eff); };
  // köpare per vecka för utkastet; bibliotek() räknar spelet i lådan som släppt (p.prognos)
  const kopare = (b, pris, packin = d.packin) => {
    const p = { id: '?utkast', prognos: '?utkast', design: packin === d.packin ? d : { ...d, packin }, betyg: b, pris, hype: 0, lanseradDag: G.dag, aktiv: true };
    const ord = G.produkter; G.produkter = [...ord, p];
    try { const v = veckoEfterfragan(G, p, G.dag, pris); return Number.isFinite(v) ? v : 0; } finally { G.produkter = ord; }
  };
  const rimligt = (b) => Math.round(rimligtPris(G.dag, b, d.enhet) / 10) * 10;
  // rad med etikett till vänster och värde till höger; etiketten kapas till det som blir kvar
  const radV = (y, e, v, c = F.text) => { const plats = RW - hoger(v, RX + RW, y, c) - 4, alt = [].concat(e); text(alt.find((s) => tw(s) <= plats) ?? kapa(alt[alt.length - 1], plats), RX, y, F.dim); return y + 8; };

  // ---------- delgrupperna ----------
  // Som telefonens delsteg: nyast överst, årets förväntan (blå kant) och första låsta delen syns alltid.
  function delRader(g) {
    const alla = K_DELAR[g], e = forvantan(g, ar, L);
    const forstaLast = alla.findIndex((x) => delStatus(g, x) !== 'ok');
    const visa = alla.filter((del, i) => delStatus(g, del) === 'ok' || i === e || i === forstaLast).reverse();
    return [{ rubrik: GRUPPNAMN[g] }, ...visa.map((del) => ({ rita: (y, kw) => delRad(g, del, y, kw) }))];
  }
  function delRad(g, del, y, kw) {
    const vald = d.val[g], e = forvantan(g, ar, L), i = K_DELAR[g].indexOf(del), st = delStatus(g, del), arVald = vald === del.id;
    const diff = Math.round((prisNu(del, ar) - prisNu(kDelAv(g, vald) || del, ar)) * enhetF());
    kort(RX, y, kw, 11, { vald: arVald, av: st !== 'ok', namn: 'kdel-' + g + '-' + del.id, klick: st === 'ok' ? () => { d.val[g] = del.id; } : null });
    if (i === e) rect(RX + kw - 3, y + 1, 2, 9, F.bla2);
    let hw;
    if (st === 'ok') { if (!arVald) hw = hoger((diff >= 0 ? '+' : '') + tal(diff), RX + kw - 6, y + 3, diff <= 0 ? F.gron2 : F.guld); else { ikon('bock', RX + kw - 13, y + 2, F.bla2); hw = 7; } }
    else hw = hoger(st === 'ar' ? $t`ÅR ${del.ar}` : st === 'pagar' ? $t('FORSKAS NU') : $t('FORSKA'), RX + kw - 6, y + 3, F.orange2);
    text(kapa(del.namn, kw - 14 - hw), RX + 4, y + 3, st === 'ok' ? F.text : F.dim2);
  }
  // Studiornas spel (i fjol till två år fram, ingen har tagit dem) som kräver mer i gruppen än konsolen har – de
  // knackar bara på om konsolen klarar spelets krav. Visar nästa del de vill ha och högst två spel, de största först.
  function spelRader(g) {
    if (!G.k) return [];
    const upptagna = new Set([...G.k.tagna, ...G.k.spel.map((s) => s.id), ...G.k.forfragningar.map((f) => f.spel)]);
    const vill = SPEL.filter((s) => s.kraver[g] && s.ar >= ar - 1 && s.ar <= ar + 2 && !upptagna.has(s.id) && kNivaAv(g, d.val[g]) < kNivaAv(g, s.kraver[g]));
    if (!vill.length) return [];
    const niva = Math.min(...vill.map((s) => kNivaAv(g, s.kraver[g]))), del = K_DELAR[g][niva];
    const spel = vill.filter((s) => kNivaAv(g, s.kraver[g]) === niva).sort((a, b) => b.stj - a.stj || a.ar - b.ar).slice(0, 2);
    return [{ rubrik: $t('SPELEN VILL HA') }, { text: del.namn, farg: F.lila2 }, ...spel.map((s) => ({ rita: (y, kw) => {
      ikon('kassett', RX, y + 2, F.lila);
      text(kapa(s.titel, kw - 10), RX + 10, y + 3, F.dim);
    } }))];
  }

  const UI = {
    enhet(y) {
      for (const e of K_ENHETER) {
        const ok = harEnhet(G, e.id, L), vald = d.enhet === e.id;
        kort(RX, y, RW, 16, { vald, av: !ok, namn: 'kenhet-' + e.id, klick: ok ? () => api.sattEnhet(e.id) : null });
        text(e.namn, RX + 4, y + 3, ok ? F.text : F.dim2);
        text(ok ? kapa(e.info, 92) : (ar < e.ar ? $t`KOMMER ${e.ar}` : nodText('kenhet-' + e.id, e.ar) === $t('FORSKAS NU') ? $t('FORSKAS NU') : $t('KRÄVER FORSKNING')), RX + 4, y + 9, ok ? F.dim : F.orange2);
        if (!ok) ikon('las', RX + RW - 10, y + 4, F.orange); y += 18;
      }
    },
    // Formerna för den valda enheten, nyast överst (första låsta syns). Raden: namn, utseende, fräschhet och pris.
    form(y) {
      const alla = K_KAROSSER.filter((k) => k.enhet === d.enhet);
      const forstaLast = alla.findIndex((x) => !harKaross(G, x.id, L));
      const visa = alla.filter((k, i) => harKaross(G, k.id, L) || i === forstaLast).reverse();
      const plats = Math.floor((170 - y) / 22), rull = visa.length > plats, kw = rull ? RW - 5 : RW;
      lista(RX, y, RW, Math.max(1, Math.min(visa.length, plats)) * 22, visa.length, 22, (i, yy) => {
        const k = visa[i], ok = harKaross(G, k.id, L), vald = d.kaross === k.id, fr = Math.round(fraschhet({ linje: L, kaross: k.id }, ar) * 100);
        kort(RX, yy, kw, 20, { vald, av: !ok, namn: 'kkaross-' + k.id, klick: ok ? () => { d.kaross = k.id; } : null });
        text(kapa(k.namn, kw - 8), RX + 4, yy + 3, ok ? F.text : F.dim2);
        text(ok ? kapa(k.info, kw - 8) : (ar < k.ar ? $t`KOMMER ${k.ar}` : nodText('kkaross-' + k.id, k.ar) === $t('FORSKAS NU') ? $t('FORSKAS NU') : $t('KRÄVER FORSKNING')), RX + 4, yy + 9, ok ? F.dim : F.orange2);
        if (ok) { text($t`FRÄSCH ${fr} %`, RX + 4, yy + 15, fr > 60 ? F.gron2 : fr > 30 ? F.guld : F.rod2); text(kr(Math.round(prisNu(k, ar) * enhetF())), RX + kw - 5, yy + 15, F.dim, { just: 'h' }); }
        else ikon('las', RX + kw - 10, yy + 3, F.orange);
      }, api.skroll());
    },
    funk(y) {
      // forskade funktioner (nyast först) och den första som inte är forskad, låst – så att man ser vad som kommer
      const funk = api.forskadeFunk(G, L).map((id) => K_FUNKTIONER.find((f) => f.id === id)), nu = api.funkBonus(G, d), tak = api.funkTak(G, d), fullt = nu >= tak - 1e-9;
      const nasta = K_FUNKTIONER.filter((f) => !harFunktion(G, f.id, L)).sort((a, b) => a.ar - b.ar)[0];
      const rader = [{ rubrik: $t('FUNKTIONER'), hoger: $t`+${dec(nu, 1)} AV +${dec(tak, 1)}`, hogerFarg: fullt && funk.length ? F.guld : F.dim }];
      if (funk.length) rader.push({ text: $t('+0,1 VAR I BETYGET') });
      else for (const r of radbryt($t('FUNKTIONERNA KOMMER MED FORSKNINGEN.'), RW - 5)) rader.push({ text: r });
      for (const f of funk) rader.push({ rita: (yy, kw) => {
        const pa = d.funktioner.includes(f.id);
        kort(RX, yy, kw, 11, { vald: pa, namn: 'kfunk-' + f.id, klick: () => { d.funktioner = pa ? d.funktioner.filter((x) => x !== f.id) : [...d.funktioner, f.id]; } });
        let hw; if (pa) { ikon('bock', RX + kw - 13, yy + 2, F.bla2); hw = 7; } else hw = hoger('+' + tal(Math.round(prisNu(f, ar) * enhetF())), RX + kw - 6, yy + 3, F.guld);
        text(kapa(f.namn, kw - 14 - hw), RX + 4, yy + 3, F.text);
      } });
      if (nasta) rader.push({ rita: (yy, kw) => {
        kort(RX, yy, kw, 11, { av: true, namn: 'kfunk-' + nasta.id });
        const hw = hoger(nodText('kfunk-' + nasta.id, nasta.ar), RX + kw - 6, yy + 3, F.orange2);
        text(kapa(nasta.namn, kw - 14 - hw), RX + 4, yy + 3, F.dim2);
      } });
      radLista(y, rader, 170);
    },
    // FÄRG: formens originalfärger (farg null) eller en av tolv; YTA som telefonerna (de legendariska sist)
    farg(y) {
      text($t('FÄRG'), RX, y + 2, F.dim);
      knapp(RX + 22, y, RW - 22, 10, $t('ORIGINALFÄRGER'), { stil: 'dim', aktiv: !d.farg, namn: 'kfarg-original', klick: () => { d.farg = null; } });
      y += 13;
      FARGER.forEach((c, i) => {
        const x = RX + (i % 6) * 17, yy = y + Math.floor(i / 6) * 13, vald = !!d.farg && d.farg.toLowerCase() === c, cc = parseInt(c.slice(1), 16);
        rect(x + 1, yy + 1, 14, 10, 0x05060f); rect(x, yy, 14, 10, cc); rect(x, yy, 14, 1, ljusa(cc, 0.3));
        if (vald) ram(x - 1, yy - 1, 16, 12, F.guld);
        hit(x, yy, 14, 10, { klick: () => { d.farg = c; }, namn: 'kfarg-' + i });
      });
      y += 28; text($t('YTA'), RX, y, F.dim); y += 7;
      const ytor = [...YTOR, ...LEGENDARISKA.filter((l) => G.legendariska.includes(l.id)).map((l) => ({ id: 'leg-' + l.id, namn: l.namn, kostnad: 0, farg: l.farg }))];
      radLista(y, ytor.map((yt) => ({ rita: (yy, kw) => {
        kort(RX, yy, kw, 11, { vald: d.yta === yt.id, namn: 'yta-' + yt.id, klick: () => { d.yta = yt.id; if (yt.farg) d.farg = yt.farg; } });
        const kost = Math.round(yt.kostnad * enhetF()), hw = kost ? hoger('+' + kr(kost), RX + kw - 6, yy + 3, F.guld) : 0;
        text(kapa(yt.namn, kw - 14 - hw), RX + 4, yy + 3, yt.farg ? F.guld : F.text);
      } })), Math.max(y + RAD, 170));
    },
    // SPELET I LÅDAN: en tv visar spelet (glimten, annars ett titelkort), listan har INGET SPEL och bolagets
    // lediga egna spel. Ett spel konsolen inte klarar är låst och visar delen som saknas.
    packin(y) {
      tv(RX + 8, y, d.packin, api.A.t || 0);
      y += 58;
      const lediga = packinLediga(G);
      const rader = [{ rita: (yy, kw) => {
        const vald = !d.packin;
        kort(RX, yy, kw, 11, { vald, namn: 'packin-inget', klick: () => { d.packin = null; } });
        if (vald) ikon('bock', RX + kw - 13, yy + 2, F.bla2);
        text($t('INGET SPEL'), RX + 4, yy + 3, F.text);
      } }, ...lediga.map((e) => ({ rita: (yy, kw) => {
        const brist = saknadeDelar(d, e.kraver), ok = !brist.length, vald = d.packin?.id === e.id;
        kort(RX, yy, kw, 11, { vald, av: !ok && !vald, kant: vald && !ok ? F.rod2 : null, namn: 'packin-' + e.id, klick: ok ? () => { d.packin = packinAv(e); } : null });
        let hw = 0;
        if (vald && ok) { ikon('bock', RX + kw - 13, yy + 2, F.bla2); hw = 7; } else if (!ok) hw = hoger(kapa(brist[0], 44), RX + kw - 6, yy + 3, F.orange2);
        text(kapa(e.titel, kw - 14 - hw), RX + 4, yy + 3, ok ? F.text : F.dim2);
      } }))];
      const yy = radLista(y, rader, 166);   // INGET SPEL + två spel syns, fler rullar
      // vad spelet gör för försäljningen: köpare per vecka med och utan spelet (utan valt spel: med det första lediga)
      const b = gissning().betyg, utan = Math.round(kopare(b, d.pris, null));
      const ex = d.packin || lediga.filter((e) => klararKrav(d, e.kraver)).map(packinAv)[0], med = ex ? Math.round(kopare(b, d.pris, ex)) : null;
      text(kapa(med == null ? $t`KÖPARE/V ~${utan}` : d.packin ? $t`KÖPARE/V ~${med} (UTAN ~${utan})` : $t`KÖPARE/V ~${utan} (MED SPEL ~${med})`, RW), RX, Math.min(yy, 168), F.dim2);
    },
    pris(y) {
      const styck = styckkostnad(G, d, eff), b = gissning().betyg, rim = rimligt(b), marg = Math.round((1 - styck / d.pris) * 100);
      y = radV(y, $t('ATT TILLVERKA'), kr(styck));
      y = radV(y, [$t('VÄNTAT BETYG'), $t('BETYG')], '~' + dec(b, 1), betygFarg(b));
      y = radV(y, $t('RIMLIGT PRIS'), '~' + kr(rim), F.dim);
      text($t('PRIS'), RX, y + 1, F.dim); textB(kr(d.pris), RX + RW, y, F.text, { just: 'h' }); y += 9;
      const pmin = Math.max(100, Math.round(styck * 1.05 / 10) * 10), pmax = Math.max(pmin + 100, Math.round(rim * 2.4 / 10) * 10);
      reglage(RX, y + 1, RW, d.pris, pmin, pmax, (v) => { d.pris = Math.round(v / 10) * 10; }, { namn: 'design-pris' }); y += 10;
      y = radV(y, $t('MARGINAL'), proc(marg / 100), marg < 30 ? F.rod2 : marg < 55 ? F.guld : F.gron2);
      y = radV(y, $t('KÖPARE/VECKA'), '~' + Math.round(kopare(b, d.pris)), F.text);
      y += 2; text($t('NAMN'), RX, y + 1, F.dim); y += 8;
      namnFalt(y); y += 15;
      const forslag = nastaNamn(G, d);
      knapp(RX, y, RW, 10, kapa($t`FÖRSLAG: ${forslag}`, RW - 6), { stil: 'dim', aktiv: d.namn === forslag, namn: 'design-namnforslag', klick: () => { d.namn = forslag; } });
    },
    granska(y) {
      const styck = styckkostnad(G, d, eff), gb = gissning(), b = gb.betyg, marg = Math.round((1 - styck / d.pris) * 100);
      const tk = teknik(d, ar, eff), inom = tk.per.filter((p) => p.poang >= 1).length, n = K_GRUPPER.length;
      y = radV(y, [$t('KRITIKERNAS GISSNING'), $t('VÄNTAT BETYG'), $t('BETYG')], '~' + dec(b, 1) + '/10', betygFarg(b));
      y = radV(y, $t('KRAV'), $t`${inom} AV ${n} DELAR I NIVÅ`, inom >= n - 1 ? F.gron2 : inom >= n - 3 ? F.guld : F.rod2);
      y = radV(y, $t('ATT TILLVERKA'), kr(styck));
      y = radV(y, [$t('FABRIK (ENGÅNG)'), $t('FABRIK')], kr(fabriksPris(G, d)));
      y = radV(y, $t('KASSA'), kr(G.bolag.kassa), G.bolag.kassa >= 0 ? F.gron2 : F.rod2);
      y = radV(y, $t('PRIS'), kr(d.pris));
      y = radV(y, $t('MARGINAL'), proc(marg / 100), marg < 30 ? F.rod2 : marg < 55 ? F.guld : F.gron2);
      y = radV(y, $t('KÖPARE/VECKA'), '~' + Math.round(kopare(b, d.pris)));
      const hw = byggdagar(G, d), sp = d.packin ? packinDagar(G) : 0;
      y = radV(y, $t('BYGGTID'), !isFinite(hw) ? '-' : d.packin && isFinite(sp) ? $t`${hw} + ${sp} DAGAR` : $t`${hw} DAGAR`);
      const brist = d.packin ? saknadeDelar(d, kravFor(d.packin.id)) : [];
      y = radV(y, [$t('I LÅDAN'), $t('SPEL')], kapa(d.packin ? d.packin.titel : $t('INGET SPEL'), 62), brist.length ? F.rod2 : d.packin ? F.guld : F.dim);
      radV(y, $t('NAMN'), kapa(d.namn || nastaNamn(G, d), 70), d.namn ? F.text : F.dim2);
    },
  };
  // de nio delgrupperna: listan och (i konsolspelet) studiornas spel som vill ha mer
  for (const g of K_GRUPPER) UI[g.id] = (y) => radLista(y, [...delRader(g.id), ...spelRader(g.id)], 170);

  const betygFarg = (b) => { const s = snitt(G.dag, L); return b >= s + 0.3 ? F.gron2 : b >= s - 0.3 ? F.guld : F.rod2; };
  function namnFalt(y) {
    const falt = { x: RX, y, w: RW, h: 12 };
    rect(falt.x, falt.y, falt.w, falt.h, F.lo); ram(falt.x, falt.y, falt.w, falt.h, F.hi);
    if (!api.A._falt) text(kapa(d.namn || $t('TRYCK OCH SKRIV ETT NAMN'), RW - 6), RX + 3, y + 4, d.namn ? F.text : F.dim2);
    hit(falt.x, falt.y, falt.w, falt.h, { klick: () => api.A.textfalt(falt, d.namn, (v) => { d.namn = v; }, 18), namn: 'design-namn' });
  }
  return UI;
}

// ---------- tv:n i SPELET I LÅDAN ----------
// En liten 80-talstv i träimitation (84 × 56) med skärmen 64 × 48 – PANG!-glimtens egen upplösning.
const SW = 64, SH = 48;
function tv(x, y, pk, t) {
  rect(x + 2, y + 2, 84, 54, F.skugga);
  rect(x, y, 84, 54, 0x6a4428); rect(x, y, 84, 1, 0x8c5e38); rect(x, y + 53, 84, 1, 0x3a2414); rect(x + 83, y + 1, 1, 52, 0x4a2c18);
  for (const j of [7, 15, 26, 38, 47]) rect(x + 1, y + j, 82, 1, 0x5c3a22);   // ådringen
  // skärmen med svart ram och rundade hörn
  rect(x + 3, y + 3, SW + 2, SH + 2, 0x0a0a0c);
  skarm(x + 4, y + 4, pk, t);
  for (const [cx, cy] of [[0, 0], [SW - 1, 0], [0, SH - 1], [SW - 1, SH - 1]]) rect(x + 4 + cx, y + 4 + cy, 1, 1, 0x0a0a0c);
  // glasets blänk uppe till vänster, svagt så att spelet syns igenom
  U.ctx.fillStyle = 'rgba(255,255,255,0.28)'; U.ctx.fillRect(x + 6, y + 6, 7, 1); U.ctx.fillRect(x + 6, y + 7, 2, 2);
  // panelen: två rattar, en lampa och högtalargaller
  rect(x + 70, y + 3, 11, 48, 0x2c2c34); rect(x + 70, y + 3, 11, 1, 0x4a4a56);
  for (const ky of [6, 17]) { rect(x + 72, y + ky, 7, 7, 0x8a8a96); rect(x + 72, y + ky, 7, 1, 0xc8c8d2); rect(x + 72, y + ky + 6, 7, 1, 0x55555f); rect(x + 75, y + ky + 1, 1, 3, 0x2c2c34); }
  rect(x + 75, y + 27, 2, 2, pk ? 0xff4030 : 0x5a1a14);
  for (let j = 0; j < 6; j++) rect(x + 72, y + 33 + j * 3, 7, 1, 0x18181e);
  rect(x + 8, y + 54, 8, 2, 0x2a1a10); rect(x + 68, y + 54, 8, 2, 0x2a1a10);
}
function skarm(x, y, pk, t) {
  const ctx = U.ctx;
  if (!pk) { brus(ctx, x, y, t); rect(x + 12, y + 19, 40, 10, 0x05060f); text($t('INGET SPEL'), x + SW / 2, y + 21, F.text, { just: 'c' }); return; }
  const g = GLIMT[pk.glimt || pk.id];
  if (g) {
    // glimten förstoras i hela steg (mindre glimtar) eller krymps så att den ryms
    const b = glimtBild(g.id, t); let k = Math.min(SW / g.w, SH / g.h); if (k >= 1) k = Math.floor(k);
    const w = Math.round(g.w * k), h = Math.round(g.h * k);
    rect(x, y, SW, SH, 0x000000);
    const s = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
    ctx.drawImage(b, x + Math.floor((SW - w) / 2), y + Math.floor((SH - h) / 2), w, h);
    ctx.imageSmoothingEnabled = s;
    return;
  }
  titelkort(x, y, pk, t);
}
// Titelkortet för ett spel utan glimt: titelskärmen med titeln i guld, en rad i spelets färg och TRYCK START.
const KORTFARG = [0x3a7bd5, 0xc9323a, 0x2f8f46, 0x8e5bd1, 0xe07a2e, 0x2aa39a, 0xf060b0];
const hashId = (s) => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
function titelkort(x, y, pk, t) {
  const h = hashId(pk.id), c = KORTFARG[h % KORTFARG.length];
  for (let j = 0; j < SH; j++) rect(x, y + j, SW, 1, mixa(0x05061a, mixa(c, 0x05061a, 0.55), j / (SH - 1)));
  // stjärnor som blinkar
  for (let i = 0; i < 9; i++) { const sx = (h >>> (i * 3)) % SW, sy = ((h >>> (i * 2 + 5)) + i * 7) % 26; if ((Math.floor(t * 2) + i) % 4) rect(x + sx, y + sy, 1, 1, i % 3 ? 0x8c93b4 : 0xffffff); }
  // marken längst ner i spelets färg
  rect(x, y + SH - 6, SW, 6, mixa(c, 0x000000, 0.35)); rect(x, y + SH - 6, SW, 1, ljusa(c, 0.25));
  const rader = radbryt(pk.titel, SW - 4).slice(0, 2), ty = y + (rader.length > 1 ? 9 : 13);
  rader.forEach((r, i) => text(kapa(r, SW - 2), x + SW / 2, ty + i * 8, F.guld, { just: 'c', skugga: 0x000000 }));
  rect(x + 10, ty + rader.length * 8 + 1, SW - 20, 1, c);
  if (Math.floor(t * 1.6) % 2 === 0) text($t('TRYCK START'), x + SW / 2, y + 32, F.text, { just: 'c', skugga: 0x000000 });
}
// brus på skärmen utan spel: en liten duk som slumpas om tolv gånger i sekunden
let brusDuk = null, brusT = -1;
function brus(ctx, x, y, t) {
  if (typeof document === 'undefined') return;
  if (!brusDuk) { brusDuk = document.createElement('canvas'); brusDuk.width = SW; brusDuk.height = SH; }
  const n = Math.floor(t * 12);
  if (n !== brusT) {
    brusT = n;
    const bx = brusDuk.getContext('2d'), im = bx.createImageData(SW, SH);
    for (let i = 0; i < SW * SH; i++) { const v = 30 + Math.floor(Math.random() * 120); im.data[i * 4] = v; im.data[i * 4 + 1] = v; im.data[i * 4 + 2] = v + 12; im.data[i * 4 + 3] = 255; }
    bx.putImageData(im, 0, 0);
  }
  ctx.drawImage(brusDuk, x, y);
}
