// Från ritning till försäljning: utvecklingen (bygget), lanseringen och telefonerna till salu.
//   BYGGDAGAR = ⌈(10 + delar + 1 per del över förväntan) / ((Σ kraft / 2) × (1 + arbetsfart))⌉   (2 st ★ → 23 dagar)
//   KOSTNAD   = 700 kr per anställd och dag under bygget
//   Varje dag: forskare lägger en blå prick (p 0,22 × kraft × moral × forskning×), buggar uppstår
//   (p (0,15 + 0,05 × delar över förväntan) / buggfix×), buggfixare lagar (p 0,10 × kraft × moral × buggfix×).
//   +30 FP köper en prick (max halva målet), 30 FP lagar en bugg.
import { GRUPPER, ENHETER } from '../data/delar.js';
import { KAMPANJER, kontorAv } from '../data/varld.js';
import { arAv, slump, slumpRund, klamp, kr, dec, datumText } from './bas.js';
import { betala, intakt, signal, nyhet } from './spel.js';
import { styckkostnad, betyg as betygAv, kvalitetsMal, delarOver, minDjup } from './design.js';
import { kontorsVarden } from './kontor.js';
import { moralFaktor } from './personal.js';
import { veckoEfterfragan, aktivaEffekter, snitt, rimligtPris } from './marknad.js';

export const FABRIK = 300_000;
export const DAGKOSTNAD = 700;
export const PRICK_FP = 30;
const FIX_P = 0.1;   // buggfixarens chans per dag att laga en bugg (× kraft × moral × buggfix)

export function byggdagar(G, d) {
  const v = kontorsVarden(G), kraft = G.personal.reduce((s, p) => s + p.kraft, 0);
  if (!kraft) return Infinity;
  const delar = GRUPPER.length + delarOver(d, arAv(G.dag));
  return Math.max(4, Math.ceil((10 + delar) / ((kraft / 2) * (1 + v.arbetsfart))));
}
export const byggkostnadPerDag = (G) => DAGKOSTNAD * G.personal.length;
export const labbspar = (G) => kontorAv(G.kontor.niva).labb;
export const pagaendeBygg = (G) => G.projekt.filter((p) => p.status === 'bygger');

// kan designen startas? (granskningsknappen)
export function kanStarta(G, d) {
  if (!G.personal.length) return { ok: false, fel: 'ANSTÄLL NÅGON FÖRST' };
  if (pagaendeBygg(G).length >= labbspar(G)) return { ok: false, fel: labbspar(G) > 1 ? 'ALLA LABBSPÅR BYGGER REDAN' : 'TEAMET BYGGER REDAN EN TELEFON' };
  if (!ENHETER.find((e) => e.id === d.enhet)) return { ok: false, fel: 'OKÄND ENHET' };
  return { ok: true };
}
export function startaUtveckling(G, design) {
  const k = kanStarta(G, design); if (!k.ok) return k;
  const d = JSON.parse(JSON.stringify(design));
  d.namn = (d.namn || '').trim().toUpperCase() || nastaNamn(G);
  d.form.djup = Math.max(d.form.djup, minDjup(d));
  const dagar = byggdagar(G, d);
  G.projekt.push({ id: 'pr' + G.dag + '-' + G.projekt.length, design: d, startDag: G.dag, dagar, dagNu: 0, kvalitet: 0, kvalMal: kvalitetsMal(d, arAv(G.dag)), buggar: 0,
    koptaPrickar: 0, kostnad: 0, status: 'bygger', ar: arAv(G.dag) });
  G.koncept = G.koncept.filter((c) => c.id !== design.id);
  nyhet(G, 'DU', `TEAMET BÖRJAR BYGGA ${d.namn}. BERÄKNAD TID: ${dagar} DAGAR.`);
  G.flaggor.startatBygge = true;
  return { ok: true };
}
export function nastaNamn(G) {
  const n = G.produkter.length + G.projekt.length + 1;
  return `PIXEL PHONE ${n}`;
}

export function dagligtBygge(G) {
  const v = kontorsVarden(G), mf = moralFaktor(G);
  for (const pr of G.projekt) {
    if (pr.status === 'bygger') {
      const kost = byggkostnadPerDag(G); betala(G, kost, 'utveckling'); pr.kostnad += kost;
      pr.dagNu++;
      const over = delarOver(pr.design, pr.ar);
      for (const p of G.personal) {
        if (p.roll === 'forskare' && pr.kvalitet < pr.kvalMal && slump(G) < 0.22 * p.kraft * mf * v.forskning) { pr.kvalitet++; signal(G, 'prick', { farg: 'bla', bord: p.bord }); }
      }
      if (slump(G) < (0.15 + 0.05 * over) / v.buggfix) { pr.buggar++; signal(G, 'prick', { farg: 'rod' }); }
      for (const p of G.personal) {
        if (p.roll === 'buggfixare' && pr.buggar > 0 && slump(G) < FIX_P * p.kraft * mf * v.buggfix) { pr.buggar--; signal(G, 'prick', { farg: 'lagad', bord: p.bord }); }
      }
      if (pr.dagNu >= pr.dagar) {
        pr.status = 'klar'; pr.klarDag = G.dag;
        nyhet(G, 'DU', `${pr.design.namn} ÄR KLAR ATT LANSERA!`);
        signal(G, 'stor', { rubrik: `${pr.design.namn} ÄR KLAR!`, text: 'LANSERA NU ELLER LÅT BUGGFIXARNA PUTSA VIDARE.', paus: true, knapp: 'lansera', projekt: pr.id, ljud: 'klar' });
      }
    } else if (pr.status === 'klar') {
      // buggfixarna putsar vidare: ungefär en bugg var tredje dag
      for (const p of G.personal) if (p.roll === 'buggfixare' && pr.buggar > 0 && slump(G) < FIX_P / 3 * p.kraft * mf * v.buggfix) pr.buggar--;
    }
  }
}
export function kopPrick(G, prId) {
  const pr = G.projekt.find((p) => p.id === prId); if (!pr || pr.status !== 'bygger') return { ok: false };
  if (pr.koptaPrickar >= Math.floor(pr.kvalMal / 2) || pr.kvalitet >= pr.kvalMal) return { ok: false, fel: 'MAX KÖPTA PRICKAR' };
  if (G.bolag.fp < PRICK_FP) return { ok: false, fel: 'FÖR LITE FORSKNINGSPOÄNG' };
  G.bolag.fp -= PRICK_FP; pr.kvalitet++; pr.koptaPrickar++; return { ok: true };
}
export function lagaBugg(G, prId) {
  const pr = G.projekt.find((p) => p.id === prId); if (!pr || !pr.buggar) return { ok: false, fel: 'INGA BUGGAR' };
  if (G.bolag.fp < PRICK_FP) return { ok: false, fel: 'FÖR LITE FORSKNINGSPOÄNG' };
  G.bolag.fp -= PRICK_FP; pr.buggar--; return { ok: true };
}
export function avbryt(G, prId) {
  const pr = G.projekt.find((p) => p.id === prId); if (!pr) return { ok: false };
  G.projekt = G.projekt.filter((p) => p !== pr);
  G.koncept.unshift(pr.design);
  nyhet(G, 'DU', `${pr.design.namn} LADES PÅ HYLLAN.`);
  return { ok: true };
}
export function direktbygg(G, prId) {
  const pr = G.projekt.find((p) => p.id === prId); if (!pr || pr.status !== 'bygger' || !G.inventarie.direktbygge) return { ok: false };
  G.inventarie.direktbygge--; pr.dagNu = pr.dagar - 1; return { ok: true };
}

// ---------- lansering ----------
export const fabriksPris = (G, d) => Math.round(FABRIK * (ENHETER.find((e) => e.id === d.enhet)?.fabrik || 1) * (1 + 0.1 * (arAv(G.dag) - 2007)));
export const FORSTA_PARTI = 100;
export function lanseringsKalkyl(G, prId, kampanjId) {
  const pr = G.projekt.find((p) => p.id === prId); const kamp = KAMPANJER.find((k) => k.id === kampanjId) || KAMPANJER[0];
  const eff = aktivaEffekter(G), styck = styckkostnad(G, pr.design, eff);
  const fabrik = fabriksPris(G, pr.design), parti = FORSTA_PARTI * styck;
  const b = betygAv(G, pr.design, pr.ar, pr.kvalitet, pr.kvalMal, pr.buggar, eff);
  const hype = kamp.hype + (G.flaggor.influencer ? 0.6 : 0);
  const p = { design: pr.design, betyg: b.betyg, pris: pr.design.pris, hype, lanseradDag: G.dag, aktiv: true };
  const ord = G.produkter; G.produkter = [...ord, p];
  const forsta = veckoEfterfragan(G, p);
  // reklamens vinst: extra sålda de första 12 veckorna × marginal − kampanjpris
  let extra = 0; for (let v = 0; v < 12; v++) extra += veckoEfterfragan(G, p, G.dag + v * 7) - veckoEfterfragan(G, { ...p, hype: 0 }, G.dag + v * 7);
  G.produkter = ord;
  const reklamVinst = extra * (pr.design.pris - styck) - kamp.pris;
  const total = fabrik + parti + kamp.pris;
  return { pr, kamp, styck, fabrik, parti, total, kvar: G.bolag.kassa - total, forstaVeckan: forsta, betyg: b, extraSalda: extra, reklamVinst };
}
export function lansera(G, prId, kampanjId) {
  const k = lanseringsKalkyl(G, prId, kampanjId), pr = k.pr;
  if (pr.status !== 'klar') return { ok: false, fel: 'INTE KLAR ÄN' };
  if (k.kamp.tackningMin && G.marknad.regioner.length < 3) return { ok: false, fel: 'GLOBAL LANSERING KRÄVER FLER MARKNADER' };
  if (k.kvar < 0) return { ok: false, fel: 'FÖR LITE PENGAR' };
  betala(G, k.fabrik, 'fabrik'); betala(G, k.parti, 'tillverkning'); if (k.kamp.pris) betala(G, k.kamp.pris, 'reklam');
  const d = pr.design;
  const prod = {
    id: 't' + G.dag + '-' + G.produkter.length, design: d, namn: d.namn, lanseradDag: G.dag, ar: pr.ar,
    betyg: k.betyg.betyg, staplar: { teknik: Math.min(1, k.betyg.teknik), design: k.betyg.design, puts: k.betyg.puts }, buggar: pr.buggar, kvalitet: pr.kvalitet,
    pris: d.pris, styck: k.styck, kampanj: k.kamp.id, hype: k.kamp.hype + (G.flaggor.influencer ? 0.6 : 0),
    lager: FORSTA_PARTI, tillverkade: FORSTA_PARTI, bestallning: null, salda: 0, missade: 0, intakt: 0,
    kostnader: { fabrik: k.fabrik, utveckling: pr.kostnad, reklam: k.kamp.pris, tillverkning: k.parti },
    veckor: [], veckaNu: 0, forraVeckan: 0, aktiv: true, viralDag: null, prisDag: null, rimligt: Math.round(rimligtPris(G.dag, k.betyg.betyg)),
    skandal: pr.buggar >= 5, uppdaterad: false,
  };
  G.flaggor.influencer = false;
  G.produkter.push(prod);
  G.projekt = G.projekt.filter((p) => p !== pr);
  // rykte: 80 % gammalt, 20 % hur bra lanseringen var mot snittet
  const s = snitt(G.dag);
  G.bolag.rykte = Math.round(klamp(0.8 * G.bolag.rykte + 0.2 * (prod.betyg - 0.1 * pr.buggar) / s, 0.25, 3) * 100) / 100;
  G.bolag.lanseringar++;
  G.bolag.bastaBetyg = Math.max(G.bolag.bastaBetyg, prod.betyg);
  if (!G.bolag.enhetstyper.includes(d.enhet)) G.bolag.enhetstyper.push(d.enhet);
  nyhet(G, 'DU', `${G.bolag.namn} LANSERAR ${d.namn}! KRITIKERNA: ${dec(prod.betyg)}/10.`);
  if (prod.betyg < 5) nyhet(G, 'DU', `FLOPP! ${d.namn} SÅGAS AV KRITIKERNA. FÖRSÄLJNINGEN HALVERAS DE FÖRSTA VECKORNA.`);
  if (prod.skandal) nyhet(G, 'DU', `BUGGSKANDAL! ${d.namn} KOM UT MED ${pr.buggar} BUGGAR. SLÄPP UPPDATERING 1.1 I TELEFONER.`);
  return { ok: true, produkt: prod };
}

// ---------- telefoner till salu ----------
export function andraPris(G, prodId, pris) {
  const p = G.produkter.find((x) => x.id === prodId); if (!p || !p.aktiv) return { ok: false };
  pris = Math.round(klamp(pris, p.styck * 0.5, p.rimligt * 3) / 10) * 10;
  if (pris <= p.pris * 0.9 && (p.prisDag == null || G.dag - p.prisDag >= 28)) { p.prisDag = G.dag; nyhet(G, 'DU', `${p.namn} SÄNKER PRISET TILL ${kr(pris)}!`); }
  p.pris = pris; return { ok: true };
}
export const VIRAL_FP = 39;
export const kanViral = (G, p) => p.aktiv && (p.viralDag == null || G.dag - p.viralDag >= 28);
export function bliViral(G, prodId) {
  const p = G.produkter.find((x) => x.id === prodId); if (!p || !kanViral(G, p)) return { ok: false, fel: 'VÄNTA NÅGRA VECKOR' };
  if (G.bolag.fp < VIRAL_FP) return { ok: false, fel: 'FÖR LITE FORSKNINGSPOÄNG' };
  G.bolag.fp -= VIRAL_FP; p.viralDag = G.dag;
  nyhet(G, 'DU', `${p.namn} GÅR VIRALT! ALLA PRATAR OM DEN.`);
  return { ok: true };
}
export function uppdatering(G, prodId) {
  const p = G.produkter.find((x) => x.id === prodId); if (!p || !p.buggar) return { ok: false };
  const pris = p.buggar * PRICK_FP; if (G.bolag.fp < pris) return { ok: false, fel: 'FÖR LITE FORSKNINGSPOÄNG' };
  G.bolag.fp -= pris; p.buggar = 0; p.uppdaterad = true;
  nyhet(G, 'DU', `UPPDATERING 1.1 TILL ${p.namn} LAGAR ALLA BUGGAR.`);
  return { ok: true };
}
export function laggNer(G, prodId) {
  const p = G.produkter.find((x) => x.id === prodId); if (!p || !p.aktiv) return { ok: false };
  const rea = Math.round(p.lager * p.pris * 0.5);
  intakt(G, rea, 'forsaljning'); p.intakt += rea; p.salda += p.lager; G.bolag.totaltSalda += p.lager; p.lager = 0;
  p.aktiv = false; p.nedlagdDag = G.dag; p.bestallning = null;
  nyhet(G, 'DU', `${p.namn} SLUTAR SÄLJAS. LAGRET REAS UT FÖR ${kr(rea)}.`);
  return { ok: true };
}
export const modellVinst = (p) => p.intakt - p.kostnader.fabrik - p.kostnader.utveckling - p.kostnader.reklam - p.kostnader.tillverkning;

// varje dag: leveranser, nya partier och försäljning
export function dagligForsaljning(G) {
  for (const p of G.produkter) {
    if (!p.aktiv) continue;
    // leverans
    if (p.bestallning && G.dag >= p.bestallning.levDag) { p.lager += p.bestallning.antal; p.tillverkade += p.bestallning.antal; p.bestallning = null; }
    const vecka = veckoEfterfragan(G, p);
    // nytt parti när lagret räcker mindre än två veckor
    const tak = Math.max(p.forraVeckan, vecka);
    if (!p.bestallning && p.lager < 2 * tak) {
      let antal = Math.max(100, Math.round((4 * tak) / 100) * 100);
      const styck = Math.round(p.styck * aktivaEffekter(G).styck);
      while (antal > 10 && antal * styck > G.bolag.kassa) antal = antal >= 200 ? antal - 100 : Math.floor(antal / 2);
      if (antal * styck <= G.bolag.kassa && antal >= 10) {
        betala(G, antal * styck, 'tillverkning'); p.kostnader.tillverkning += antal * styck;
        p.bestallning = { antal, levDag: G.dag + 3 };
      }
    }
    // försäljning
    const kopare = slumpRund(G, vecka / 7), salda = Math.min(kopare, p.lager);
    p.lager -= salda; p.salda += salda; p.missade += kopare - salda; p.veckaNu += salda;
    const bonus = G.flaggor.saljBonus ? 1.1 : 1;
    const in_ = salda * p.pris * bonus; intakt(G, in_, 'forsaljning'); p.intakt += in_;
    G.bolag.totaltSalda += salda;
    if (salda && !G.flaggor.forstaForsaljning) { G.flaggor.forstaForsaljning = true; signal(G, 'toast', { text: 'KA-CHING! FÖRSTA TELEFONEN SÅLD!', farg: 'gron', ljud: 'kaching' }); }
    // veckoslut för produkten
    if ((G.dag - p.lanseradDag) % 7 === 6) {
      p.veckor.push(p.veckaNu); if (p.veckor.length > 104) p.veckor.shift();
      p.forraVeckan = p.veckaNu;
      if (p.veckor.length <= 1 || p.veckor.length % 4 === 0) signal(G, 'toast', { text: `${p.namn}: ${p.veckaNu} SÅLDA DENNA VECKA`, farg: 'gron' });
      p.veckaNu = 0;
    }
  }
}
export { datumText };
