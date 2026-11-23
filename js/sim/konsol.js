// Konsolspelet (docs/KONSOLPLAN.md): rivalkonsolerna, studiorna som vill göra spel till dina konsoler, avtalen,
// spelen (studiornas och dina egna) och den installerade basen. Allt ligger i G.k; telefonspelet rör aldrig detta.
//
//   FÖRFRÅGNINGAR den 1:a varje månad (högst 2): en studio knackar på om spelets år har kommit, konsolen klarar
//     spelets krav och konsolens betyg och installerade bas räcker för spelets stjärnor:
//       ★–★★ alltid · ★★★ betyg 6,0 + 200 × v · ★★★★ 6,8 + 1 500 × v · ★★★★★ 7,5 + 5 000 × v   (v = 1,09^(år − 1982))
//     God relation (+1 eller mer) sänker kraven 30 %. En studio med relation −2 eller sämre hör inte av sig.
//   AVTAL: JA = studion köper ett utvecklingskit (intäkt) och betalar 12 % av spelets försäljning.
//     FÖRHANDLA = högre andel (upp till 25 %) – ju girigare desto större risk att studion går till en rival.
//     EXKLUSIVT = du betalar studion, spelet drar 50 % mer och relationen blir bättre. NEJ = spelet går till en rival.
//   SPELET byggs (2 + stjärnor) månader och släpps med en reklamfilm. Varje vecka köper 5 % av de som ännu inte har
//     det (installerad bas × andel som vill ha spelet). Skräpspel (★–★★) sänker ryktet när biblioteket redan är stort.
//   EGNA SPEL görs av spelutvecklarna och ger hela intäkten (minus 30 % för tillverkningen).
//   RIVALSPEL: ett spel som ingen har tagit när året efter dess år är slut går till en rivalkonsol.
import { SPEL, STUDIOS, K_RIVALER, EGNA_SPEL, studioAv, spelAv, egetSpelAv } from '../data/konsol-varld.js';
import { kNivaAv, kEnhetAv } from '../data/konsol.js';
import { arAv, dagForAr, slump, slumpInt, slumpRund, klamp, kr, dec } from './bas.js';
import { betala, intakt, signal, nyhet, telefonRivaler, KONSOL_START } from './spel.js';
import { kSnitt, kMarknadspris, aktivaEffekter } from './marknad.js';
import { kontorsVarden } from './kontor.js';
import { moralFaktor } from './personal.js';

export const LICENS = 0.12;
export const LICENS_MAX = 0.25;
const ATTACH = [0, 0.1, 0.15, 0.25, 0.35, 0.5];        // andel av ägarna som till slut köper spelet
const KRAV = { 3: [6.0, 200], 4: [6.8, 1500], 5: [7.5, 5000] };
export const vaxt = (G) => Math.pow(1.09, Math.max(0, arAv(G.dag) - KONSOL_START));
export const spelPris = (G) => Math.round(299 * Math.pow(1.025, Math.max(0, arAv(G.dag) - KONSOL_START)) / 10) * 10;
export const devkitPris = (G) => Math.round(40_000 * Math.pow(1.05, Math.max(0, arAv(G.dag) - KONSOL_START)) / 1000) * 1000;
export const exklusivPris = (G, stj) => Math.round(stj * stj * 20_000 * vaxt(G) / 10_000) * 10_000;
export const utvecklingsdagar = (stj) => 30 * (2 + stj);

// ---------- konsolerna ----------
export const egnaKonsoler = (G) => G.produkter.filter((p) => p.design.linje === 'konsol');
export const konsolProjekt = (G) => G.projekt.filter((p) => p.design.linje === 'konsol' && p.typ !== 'spel');
export const installeradBas = (G) => egnaKonsoler(G).reduce((s, p) => s + (p.installerade || 0), 0);
export const spelPa = (G, konsolId) => (G.k?.spel || []).filter((s) => s.konsol === konsolId);
export const slapptaSpel = (G) => (G.k?.spel || []).filter((s) => s.status === 'ute' || s.status === 'slut');

// klarar konsolen (en design) spelets krav?
export function klararKrav(d, krav = {}, enhet = null, funk = null) {
  if (enhet && d.enhet !== enhet) return false;
  if (funk && !(d.funktioner || []).includes(funk)) return false;
  for (const [g, id] of Object.entries(krav)) if (kNivaAv(g, d.val[g]) < kNivaAv(g, id)) return false;
  return true;
}
export function saknas(d, s) {
  const ut = [];
  if (s.enhet && d.enhet !== s.enhet) ut.push(kEnhetAv(s.enhet).namn);
  if (s.funk && !(d.funktioner || []).includes(s.funk)) ut.push(s.funk.toUpperCase());
  for (const [g, id] of Object.entries(s.kraver || {})) if (kNivaAv(g, d.val[g]) < kNivaAv(g, id)) ut.push(id.toUpperCase());
  return ut;
}

// ---------- studiorna ----------
const relation = (G, studio) => G.k.relation[studio] || 0;
export function andraRelation(G, studio, steg) { G.k.relation[studio] = klamp(relation(G, studio) + steg, -3, 3); }
// vad studion kräver för ett spel med stj stjärnor (betyg, installerad bas) – null = inga krav
export function studioKrav(G, stj, studio) {
  const k = KRAV[stj]; if (!k) return null;
  const f = relation(G, studio) >= 1 ? 0.7 : 1;
  return { betyg: Math.round((k[0] - (f < 1 ? 0.3 : 0)) * 10) / 10, bas: Math.round(k[1] * vaxt(G) * f / 100) * 100 };
}
// spelen som går att få just nu (året har kommit, ingen har tagit dem)
export function ledigaSpel(G) {
  const a = arAv(G.dag), upptagna = new Set([...G.k.spel.map((s) => s.id), ...G.k.tagna, ...G.k.forfragningar.map((f) => f.spel)]);
  return SPEL.filter((s) => s.ar <= a && !upptagna.has(s.id));
}
// Konsolerna en studio kan tänkas göra spel till: dina konsoler till salu och dina konsolbyggen (blir lanseringsspel).
// betyg = lanseringsbetyget, eller för ett bygge kritikernas gissning just nu; bas = egen bas, men minst halva bolagets.
function mal(G) {
  const halva = installeradBas(G) / 2, ut = [];
  for (const p of egnaKonsoler(G)) if (p.aktiv) ut.push({ id: p.id, d: p.design, betyg: p.betyg, bas: Math.max(p.installerade || 0, halva), namn: p.namn });
  for (const pr of konsolProjekt(G)) ut.push({ id: pr.id, d: pr.design, betyg: pr.prognosBetyg ?? 6, bas: halva, namn: pr.design.namn, bygge: true });
  return ut;
}
export function kanFa(G, s, m) {
  if (!klararKrav(m.d, s.kraver, s.enhet, s.funk)) return false;
  const k = studioKrav(G, s.stj, s.studio);
  return !k || (m.betyg >= k.betyg && m.bas >= k.bas);
}
// chansen att en ★★★★–★★★★★-studio väljer din konsol: 30 % (★★★★ 45 %) + 20 % per betygssteg över rivalernas
// bästa konsol av samma sort + 10 % per relationssteg, mellan 10 och 80 %
export function valChans(G, s, m) {
  const rivaler = aktivaRivalKonsoler(G).filter((r) => r.enhet === m.d.enhet);
  const bast = rivaler.length ? Math.max(...rivaler.map((r) => r.betyg)) : kSnitt(G.dag);
  return klamp((s.stj === 4 ? 0.45 : 0.3) + 0.2 * (m.betyg - bast) + 0.1 * relation(G, s.studio), 0.1, 0.8);
}
export function manadsForfragningar(G) {
  const eff = aktivaEffekter(G), malen = mal(G);
  if (!malen.length) return;
  // gamla förfrågningar som ingen svarade på: spelet går till en rival
  for (const f of [...G.k.forfragningar]) if (G.dag >= f.slutDag) { G.k.forfragningar = G.k.forfragningar.filter((x) => x !== f); tillRival(G, spelAv(f.spel), 'SVARADE ALDRIG'); andraRelation(G, f.studio, -1); }
  const kandidater = ledigaSpel(G).filter((s) => relation(G, s.studio) > -2).sort((a, b) => b.ar - a.ar || b.stj - a.stj);
  let n = 0;
  for (const s of kandidater) {
    if (n >= 2 || G.k.forfragningar.length >= 4) break;
    // bästa konsolen för spelet: den med högst betyg som studion godtar
    const m = malen.filter((x) => kanFa(G, s, x)).sort((a, b) => b.betyg - a.betyg || (b.bygge ? 1 : 0) - (a.bygge ? 1 : 0))[0];
    if (!m) continue;
    if (slump(G) > eff.studios) continue;   // SPELKRASCHEN: studiorna vågar mindre
    // de stora spelen (★★★★–★★★★★) väljer en gång mellan din konsol och rivalernas bästa: bättre betyg och god
    // relation ger större chans. Säger studion nej går spelet till rivalen direkt.
    if (s.stj >= 4) {
      const chans = valChans(G, s, m);
      if (slump(G) > chans) { tillRival(G, s, 'VALDE RIVALEN'); signal(G, 'toast', { text: `${studioAv(s.studio).namn} VALDE ${rivalNamn(G, s)} FÖR ${s.titel}`, farg: 'rod' }); continue; }
    }
    const f = { id: 'f' + (++G.k.lopnr), spel: s.id, studio: s.studio, konsol: m.id, dag: G.dag, slutDag: G.dag + 45, devkit: devkitPris(G), licens: LICENS, lanseringsspel: !!m.bygge };
    G.k.forfragningar.push(f); n++;
    nyhet(G, 'STUDIO', `${studioAv(s.studio).namn} VILL GÖRA ${s.titel} TILL ${m.namn || 'DIN NYA KONSOL'}!`);
    signal(G, 'studio', { forfragan: f.id, rubrik: `${studioAv(s.studio).namn} KNACKAR PÅ!`, text: `DE VILL GÖRA ${s.titel} (${'★'.repeat(s.stj)}) TILL ${m.namn || 'DIN NYA KONSOL'}.`, paus: true, ljud: 'mal' });
  }
}
// FÖRHANDLA: chansen att studion säger ja till en högre andel (12 % → säkert, 25 % → 30 %), bättre med god relation
export const jaChans = (G, f, licens) => klamp(1 - (licens - LICENS) / (LICENS_MAX - LICENS) * 0.7 + 0.1 * relation(G, f.studio), 0.05, 1);
// svar: 'ja' | 'forhandla' | 'exklusivt' | 'nej'
export function svara(G, fId, svar, { licens = LICENS } = {}) {
  const f = G.k.forfragningar.find((x) => x.id === fId); if (!f) return { ok: false, fel: 'FINNS INTE' };
  const s = spelAv(f.spel), st = studioAv(f.studio);
  const kvar = () => { G.k.forfragningar = G.k.forfragningar.filter((x) => x !== f); };
  if (svar === 'nej') {
    kvar(); tillRival(G, s, 'SA NEJ');
    if (s.stj >= 3) andraRelation(G, f.studio, -1);
    return { ok: true };
  }
  let exklusiv = false;
  if (svar === 'forhandla') {
    licens = klamp(Math.round(licens * 100) / 100, LICENS, LICENS_MAX);
    if (slump(G) > jaChans(G, f, licens)) {
      kvar(); andraRelation(G, f.studio, -1); tillRival(G, s, 'GICK TILL EN RIVAL');
      signal(G, 'toast', { text: `${st.namn} TYCKTE ATT DU VAR FÖR GIRIG!`, farg: 'rod' });
      return { ok: true, nej: true };
    }
  } else licens = LICENS;
  if (svar === 'exklusivt') {
    const pris = exklusivPris(G, s.stj);
    if (G.bolag.kassa < pris) return { ok: false, fel: 'FÖR LITE PENGAR' };
    betala(G, pris, 'spel'); exklusiv = true; andraRelation(G, f.studio, 1);
  }
  kvar();
  intakt(G, f.devkit, 'spel');
  G.k.spel.push({
    id: s.id, titel: s.titel, studio: s.studio, stj: s.stj, ss: !!s.ss, konsol: f.konsol, status: 'utvecklas',
    startDag: G.dag, klarDag: G.dag + utvecklingsdagar(s.stj) + slumpInt(G, -10, 20), licens, exklusiv, lanseringsspel: f.lanseringsspel,
    fickaBonus: s.ficka && konsolDesign(G, f.konsol)?.enhet === 'ficka' ? s.ficka : 1,
    salda: 0, intakt: 0, veckaNu: 0, veckor: [], glimt: s.id, final: !!s.final,
  });
  G.flaggor.avtal = (G.flaggor.avtal || 0) + 1;
  nyhet(G, 'STUDIO', `AVTAL! ${st.namn} BÖRJAR GÖRA ${s.titel}${exklusiv ? ' – BARA TILL DINA KONSOLER' : ''}. DE KÖPER ETT UTVECKLINGSKIT FÖR ${kr(f.devkit)}.`);
  return { ok: true };
}
const konsolDesign = (G, id) => (G.produkter.find((p) => p.id === id) || G.projekt.find((p) => p.id === id))?.design || null;
const rivalNamn = (G, s) => {
  const ar = arAv(G.dag);
  const akt = G.k.rivaler.filter((r) => !r.slut && (!s?.enhet || K_RIVALER.find((x) => x.id === r.id)?.enhet === s.enhet)).sort((a, b) => b.lanseradDag - a.lanseradDag)[0];
  return akt ? K_RIVALER.find((x) => x.id === akt.id).namn : (K_RIVALER.filter((r) => r.ar <= ar).pop() || K_RIVALER[0]).namn;
};
function tillRival(G, s, varfor = '') {
  if (!s || G.k.tagna.includes(s.id)) return;
  G.k.tagna.push(s.id);
  nyhet(G, 'RIVAL', `${studioAv(s.studio).namn} SLÄPPER ${s.titel} TILL ${rivalNamn(G, s)}.`);
}
// nyår: spel som ingen tagit när året efter deras år är slut går till rivalerna
function spelTillRivaler(G) {
  const a = arAv(G.dag);
  for (const s of SPEL) if (s.ar <= a - 2 && !G.k.spel.some((x) => x.id === s.id) && !G.k.tagna.includes(s.id) && !G.k.forfragningar.some((f) => f.spel === s.id)) tillRival(G, s);
}

// ---------- spelen ----------
// när en konsol lanseras får dess lanseringsspel och väntande spel konsolens produkt-id (anropas från lansera)
export function konsolLanserad(G, prId, prod) {
  if (!G.k) return;
  for (const s of G.k.spel) if (s.konsol === prId) s.konsol = prod.id;
  for (const f of G.k.forfragningar) if (f.konsol === prId) { f.konsol = prod.id; f.lanseringsspel = false; }
  // spelet i lådan släpps samma dag (räknas som bolagets eget spel)
  if (prod.packin) {
    const E = egetSpelAv(prod.packin.id) || { id: prod.packin.id, titel: prod.packin.titel };
    G.k.spel.push({ id: 'egen-' + (++G.k.lopnr), egetId: E.id, titel: prod.packin.titel, studio: 'egen', egen: true, packin: true, stj: prod.packin.stj, konsol: prod.id,
      status: 'ute', startDag: G.dag, slappDag: G.dag, licens: 0, salda: 0, intakt: 0, veckaNu: 0, veckor: [], glimt: prod.packin.glimt || null });
  }
  for (const s of G.k.spel) if (s.konsol === prod.id && s.status === 'vantar') slapp(G, s, true);
}
function slapp(G, s, medKonsolen = false) {
  s.status = 'ute'; s.slappDag = G.dag;
  const p = G.produkter.find((x) => x.id === s.konsol);
  // skräpspel: när biblioteket redan har tre spel sänker ett ★–★★-spel ryktet lite (SPELKRASCHEN-lärdomen)
  if (s.stj <= 2 && !s.egen && spelPa(G, s.konsol).filter((x) => x.status === 'ute').length > 3) G.bolag.rykte = Math.round(klamp(G.bolag.rykte - 0.02, 0.25, 3) * 100) / 100;
  if (s.stj >= 4 && !s.egen) andraRelation(G, s.studio, 1);   // en hit gör studion glad
  const vem = s.egen ? 'DU' : 'STUDIO';
  nyhet(G, vem, `${s.titel} SLÄPPS TILL ${p ? p.namn : 'DIN KONSOL'}${medKonsolen ? ' SAMMA DAG SOM KONSOLEN' : ''}!`);
  signal(G, 'spelslapp', { spel: s.id, glimt: s.glimt, titel: s.titel, konsol: p?.id, rubrik: `${s.titel} ÄR UTE!`, paus: true, ljud: 'klar' });
}
export function dagligaSpel(G) {
  const eff = aktivaEffekter(G), pris = spelPris(G);
  for (const s of G.k.spel) {
    if (s.status === 'utvecklas' && !s.egen && G.dag >= s.klarDag) {
      const p = G.produkter.find((x) => x.id === s.konsol);
      if (p) slapp(G, s); else s.status = 'vantar';   // konsolen är inte lanserad än: spelet kommer med den
    }
    if (s.status !== 'ute') continue;
    const p = G.produkter.find((x) => x.id === s.konsol);
    if (!p) continue;
    // Varje vecka köper 5 % av ägarna som ännu inte har spelet; nya ägare vill också ha det
    const vill = (p.installerade || 0) * ATTACH[s.stj] * (s.packin ? 0 : 1) * (s.ss ? 1.2 : 1) * (s.exklusiv ? 1.2 : 1);
    const vecka = Math.max(0, vill - s.salda) * 0.05 * eff.spelsalj;
    const salda = slumpRund(G, vecka / 7);
    if (salda > 0) {
      s.salda += salda; s.veckaNu += salda;
      const andel = s.egen ? 0.7 : s.licens, in_ = salda * pris * andel;
      intakt(G, in_, 'spel'); s.intakt += in_;
    }
    if ((G.dag - s.slappDag) % 7 === 6) { s.veckor.push(s.veckaNu); if (s.veckor.length > 104) s.veckor.shift(); s.veckaNu = 0; }
    // efter fem år säljer det inte längre (biblioteket räknar det ändå, med 35 % dragkraft)
    if (G.dag - s.slappDag > 5 * 365) s.status = 'slut';
  }
}
// spelets status för gränssnittet: 'utvecklas' | 'vantar' | 'ute' | 'slut'
export const spelKvar = (G, s) => Math.max(0, (s.klarDag ?? G.dag) - G.dag);

// ---------- egna spel ----------
// Spelutvecklarna gör ett eget spel i taget. Tid = ⌈(12 + 2 × kvalitetsmål/6) / ((Σ kraft / 2) × (1 + arbetsfart))⌉.
// Stjärnor = 1 + 2 × puts + (bästa utvecklarens stjärnor − 1) / 2, avrundat (1–5).
export const spelutvecklare = (G) => G.personal.filter((p) => p.roll === 'spelutvecklare');
export const spelMal = (G) => 6 + Math.floor(Math.max(0, arAv(G.dag) - KONSOL_START) / 3);
export const egnaSpelLediga = (G) => { const a = arAv(G.dag), gjorda = new Set(G.k.spel.filter((s) => s.egen).map((s) => s.egetId)); return EGNA_SPEL.filter((e) => e.ar <= a && !gjorda.has(e.id)); };
export const egetPagar = (G) => G.k.spel.find((s) => s.egen && s.status === 'utvecklas') || null;
export function spelDagar(G) {
  const v = kontorsVarden(G), kraft = spelutvecklare(G).reduce((s, p) => s + p.kraft, 0);
  if (!kraft) return Infinity;
  return Math.max(6, Math.ceil((12 + spelMal(G) / 3) / ((kraft / 2) * (1 + v.arbetsfart))));
}
export function startaEgetSpel(G, egetId, konsolId) {
  const E = egetSpelAv(egetId); if (!E) return { ok: false, fel: 'FINNS INTE' };
  if (!spelutvecklare(G).length) return { ok: false, fel: 'ANSTÄLL EN SPELUTVECKLARE FÖRST' };
  if (egetPagar(G)) return { ok: false, fel: 'TEAMET GÖR REDAN ETT SPEL' };
  const p = G.produkter.find((x) => x.id === konsolId && x.aktiv && x.design.linje === 'konsol');
  if (!p) return { ok: false, fel: 'VÄLJ EN KONSOL SOM SÄLJS' };
  if (!klararKrav(p.design, E.kraver)) return { ok: false, fel: 'KONSOLEN KLARAR INTE SPELET' };
  const dagar = spelDagar(G);
  G.k.spel.push({ id: 'egen-' + (++G.k.lopnr), egetId: E.id, titel: E.titel, studio: 'egen', egen: true, stj: 1, konsol: p.id, status: 'utvecklas',
    startDag: G.dag, dagar, dagNu: 0, kval: 0, mal: spelMal(G), licens: 0, salda: 0, intakt: 0, veckaNu: 0, veckor: [], glimt: E.glimt || null });
  nyhet(G, 'DU', `SPELUTVECKLARNA BÖRJAR GÖRA ${E.titel}. BERÄKNAD TID: ${dagar} DAGAR.`);
  return { ok: true };
}
export const egnaStjarnor = (G, kval, mal_) => {
  const basta = Math.max(1, ...spelutvecklare(G).map((p) => p.stjarnor));
  return klamp(Math.round(1 + 2 * klamp(kval / Math.max(1, mal_), 0, 1) + (basta - 1) / 2), 1, 5);
};
export const UTV_P = 0.25;   // spelutvecklarens chans per dag att lägga en grön prick (× kraft × moral × forskning×)
export function dagligtEgetSpel(G) {
  const s = egetPagar(G); if (!s) return;
  const v = kontorsVarden(G), mf = moralFaktor(G);
  s.dagNu++;
  for (const p of spelutvecklare(G)) if (s.kval < s.mal && slump(G) < UTV_P * p.kraft * mf * v.forskning) { s.kval++; signal(G, 'prick', { farg: 'gron', bord: p.bord }); }
  betala(G, 500 * spelutvecklare(G).length, 'spel');
  if (s.dagNu >= s.dagar) {
    s.stj = egnaStjarnor(G, s.kval, s.mal);
    G.flaggor.egetSpel = (G.flaggor.egetSpel || 0) + 1;
    slapp(G, s);
  }
}
// mjukvarufasen i ett konsolbygge: spelet som följer med i lådan (sim/projekt.js anropar)
export function packinDagar(G) {
  const v = kontorsVarden(G), utv = spelutvecklare(G);
  // utan spelutvecklare gör resten av teamet spelet, med halva kraften
  const kraft = utv.length ? utv.reduce((s, p) => s + p.kraft, 0) : G.personal.reduce((s, p) => s + p.kraft, 0) / 2;
  if (!kraft) return Infinity;
  return Math.max(4, Math.ceil((8 + spelMal(G) / 3) / ((kraft / 2) * (1 + v.arbetsfart))));
}
export function dagligPackin(G, pr) {
  const v = kontorsVarden(G), mf = moralFaktor(G), utv = spelutvecklare(G);
  pr.spelDagNu++;
  const folk = utv.length ? utv : G.personal.map((p) => ({ ...p, kraft: p.kraft / 2 }));
  for (const p of folk) if (pr.spelKval < pr.spelMal && slump(G) < UTV_P * p.kraft * mf * v.forskning) { pr.spelKval++; signal(G, 'prick', { farg: 'gron', bord: p.bord }); }
  if (pr.lanad && pr.spelKval < pr.spelMal && slump(G) < UTV_P * pr.lanad.kraft * v.forskning) { pr.spelKval++; signal(G, 'prick', { farg: 'gron', lanad: true }); }
  return pr.spelDagNu >= pr.spelDagar;
}

// ---------- låna en utvecklare av en studio ----------
// En studio som gör (eller har gjort) ett spel till dig lånar ut en ★★★-utvecklare till ett konsolbygge.
// Bygget går 25 % fortare och den lånade lägger egna blå (och gröna) prickar. Kostar en månadslön per påbörjad månad.
export const lanePris = (G) => Math.round(42_000 * Math.pow(1.03, Math.max(0, arAv(G.dag) - KONSOL_START)) / 1000) * 1000;
export const kanLana = (G, studio) => relation(G, studio) >= 0 && G.k.spel.some((s) => s.studio === studio);
export const lanbaraStudios = (G) => STUDIOS.filter((s) => kanLana(G, s.id));
export function lanaUtvecklare(G, prId, studio) {
  const pr = G.projekt.find((p) => p.id === prId && p.design.linje === 'konsol' && p.status === 'bygger');
  if (!pr) return { ok: false, fel: 'INGET KONSOLBYGGE' };
  if (pr.lanad) return { ok: false, fel: 'BYGGET HAR REDAN EN LÅNAD' };
  if (!kanLana(G, studio)) return { ok: false, fel: 'STUDION KÄNNER INTE ER ÄN' };
  const pris = lanePris(G); if (G.bolag.kassa < pris) return { ok: false, fel: 'FÖR LITE PENGAR' };
  betala(G, pris, 'personal');
  pr.lanad = { studio, kraft: 2.4, namn: studioAv(studio).namn };
  if (pr.fas !== 'mjukvara') pr.dagar = pr.dagNu + Math.ceil((pr.dagar - pr.dagNu) * 0.75);
  else pr.spelDagar = pr.spelDagNu + Math.ceil((pr.spelDagar - pr.spelDagNu) * 0.75);
  nyhet(G, 'STUDIO', `${studioAv(studio).namn} LÅNAR UT EN UTVECKLARE TILL ${pr.design.namn}.`);
  return { ok: true };
}

// ---------- rivalkonsolerna ----------
export function rivalStart(G) {
  for (const R of K_RIVALER) if (dagForAr(R.ar) + R.dag <= G.dag) rivalLanserar(G, R, true);
}
function rivalLanserar(G, R, tyst = false) {
  if (G.k.rivaler.some((r) => r.id === R.id)) return;
  const dag = Math.min(G.dag, dagForAr(R.ar) + R.dag);
  const betyg = Math.round(klamp(kSnitt(dag) + R.offset + (tyst ? 0 : (slump(G) - 0.5) * 0.6), 1, 9.8) * 10) / 10;
  const pris = Math.round(kMarknadspris(dag) * Math.max(0.15, 1 + 0.25 * (betyg - kSnitt(dag))) * kEnhetAv(R.enhet).pris * R.prisF / 10) * 10;
  G.k.rivaler.push({ id: R.id, lanseradDag: dag, betyg, pris, slutDag: dag + R.liv * 365, slut: false });
  if (!tyst) {
    nyhet(G, 'RIVAL', `${R.bolag} SLÄPPER ${R.namn}. KRITIKERNA GER DEN ${dec(betyg)}/10.`);
    signal(G, 'ticker', { text: `${R.namn} – ${dec(betyg)}/10` });
  }
}
function rivalKonsolerDag(G) {
  for (const R of K_RIVALER) if (G.dag === dagForAr(R.ar) + R.dag) rivalLanserar(G, R);
  for (const r of G.k.rivaler) if (!r.slut && G.dag >= r.slutDag) r.slut = true;
}
export const rivalKonsol = (r) => ({ ...K_RIVALER.find((x) => x.id === r.id), ...r });
export const aktivaRivalKonsoler = (G) => (G.k?.rivaler || []).filter((r) => !r.slut).map(rivalKonsol);

// ---------- telefonavdelningen ----------
// Noden TELEFONAVDELNINGEN (k-mobil) öppnar telefonerna: rivalerna, händelserna och telefonnoderna i forskningen.
export function oppnaMobil(G) {
  if (!G.k || G.flaggor.mobil) return;
  G.flaggor.mobil = true; G.flaggor.mobilDag = G.dag;
  if (!G.marknad.rivaler.length) telefonRivaler(G);
  nyhet(G, 'DU', `${G.bolag.namn} ÖPPNAR EN TELEFONAVDELNING! NU KAN NI DESIGNA TELEFONER OCH ANDRA PRYLAR.`);
  signal(G, 'stor', { rubrik: 'TELEFONAVDELNINGEN!', text: 'NU FINNS TELEFONERNA I FORSKNINGEN OCH I DESIGNERN. KONSOLERNA SÄLJER VIDARE SOM VANLIGT.', paus: true, konfetti: true });
}

// ---------- varje dag ----------
// installerad bas: 8 % av ägarna slutar spela varje år
const BORT = 1 - 0.08 / 365;
export function konsolDag(G, forsta, nyar) {
  if (!G.k) return;
  rivalKonsolerDag(G);
  for (const p of egnaKonsoler(G)) p.installerade = (p.installerade || 0) * BORT;
  dagligaSpel(G);
  dagligtEgetSpel(G);
  if (nyar) spelTillRivaler(G);
  if (forsta) manadsForfragningar(G);
}
export { studioAv, spelAv, egetSpelAv, SPEL, STUDIOS, EGNA_SPEL };
