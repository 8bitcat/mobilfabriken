// Provkör konsolspelet i Node (docs/KONSOLPLAN.md): första konsolen 1982 med PANG! i lådan, studiornas första
// förfrågningar, ett avtal, ett eget spel och telefonavdelningen 2007.
//   node tools/konsol-sim-test.mjs   → skriver siffrorna och slutar med ✓/✗-rad
import { nyttSpel } from '../js/sim/spel.js';
import { placera } from '../js/sim/kontor.js';
import { startKandidater, anstall } from '../js/sim/personal.js';
import { nyDesign, styckkostnad, betyg as betygAv, kvalitetsMal } from '../js/sim/design.js';
import { startaUtveckling, lansera, lanseringsKalkyl, modellVinst, kampanjer, fabriksPris } from '../js/sim/projekt.js';
import { starta, status, synligaNoder } from '../js/sim/forskning.js';
import { dagTick } from '../js/sim/tick.js';
import { kSnitt, rimligtPris, bibliotek, kVeckoEfterfragan } from '../js/sim/marknad.js';
import { svara, startaEgetSpel, egnaSpelLediga, installeradBas, studioKrav, ledigaSpel, egetPagar } from '../js/sim/konsol.js';
import { NOD } from '../js/data/noder.js';
import { kr, dec, datumText, dagForAr, arAv } from '../js/sim/bas.js';

const fel = [];
const ok = (villkor, text) => { console.log((villkor ? '  ✓ ' : '  ✗ ') + text); if (!villkor) fel.push(text); };
const medel = (lista, f) => lista.reduce((s, r) => s + f(r), 0) / lista.length;

// ---------- första konsolen (30 slumpfrön) ----------
const res = [];
for (let seed = 1; seed <= 30; seed++) {
  const G = nyttSpel({ namn: 'Pixelbox AB', seed, lage: 'konsol' });
  startKandidater(G);
  const roller = G.kandidater.slice(0, 2).map((k) => k.roll).join('+');
  placera(G, { typ: 'bord', i: 0 }, 'fallbord'); placera(G, { typ: 'bord', i: 1 }, 'fallbord');
  anstall(G, G.kandidater[0].id); anstall(G, G.kandidater[0].id);
  const d = nyDesign(G, null, 'konsol'); d.namn = 'Pixelbox 1';
  const styck = styckkostnad(G, d);
  const st = startaUtveckling(G, d);
  const pr = G.projekt[0], hwDagar = pr.dagar;
  let ljudDag = null, swDagar = null;
  while (G.projekt[0].status !== 'klar') {
    dagTick(G);
    if (ljudDag == null && starta(G, 'kdel-ljud-3kan').ok) ljudDag = G.dag;
    if (swDagar == null && pr.fas === 'mjukvara') swDagar = pr.spelDagar;
    if (G.dag > G.startDag + 200) break;
  }
  const k = lanseringsKalkyl(G, pr.id, 'ingen');
  const lan = lansera(G, pr.id, 'ingen');
  const p = lan.produkt, lansDag = G.dag;
  // 26 veckor: svara JA på varje förfrågan
  let forfr = 0, avtal = 0;
  for (let i = 0; i < 7 * 26; i++) {
    dagTick(G);
    for (const f of [...G.k.forfragningar]) { forfr++; if (svara(G, f.id, 'ja').ok) avtal++; }
  }
  res.push({ seed, roller, st, styck, hwDagar, swDagar, betyg: p.betyg, packin: p.packin?.stj, buggar: p.buggar, forsta: k.forstaVeckan, fabrik: k.fabrik, parti: k.parti,
    salda26: p.salda, inst: p.installerade, vinst: modellVinst(p), kassa: G.bolag.kassa, forfr, avtal, spel: G.k.spel.length, ute: G.k.spel.filter((s) => s.status === 'ute').length,
    bib: bibliotek(G, p), lansDag, ljud: G.forskning.klara.includes('kdel-ljud-3kan'), mal: G.mal.klara.length, v1: p.veckor[0], v26: p.veckor[25], G, p });
}
const r0 = res[0];
console.log('Första konsolen 1982 (30 slumpfrön):');
console.log(`  roller ${r0.roller} · styckkostnad ${r0.styck} kr · hårdvara ${r0.hwDagar} dagar + PANG! ${r0.swDagar} dagar · lansering ${datumText(r0.lansDag)}`);
console.log(`  fabrik + parti ${kr(r0.fabrik + r0.parti)} · snitt 1982 ${dec(kSnitt(r0.lansDag), 2)} · rimligt pris ${kr(rimligtPris(r0.lansDag, r0.betyg, 'hem'))}`);
console.log(`  betyg medel ${dec(medel(res, (r) => r.betyg), 2)} (min ${Math.min(...res.map((r) => r.betyg))}, max ${Math.max(...res.map((r) => r.betyg))}) · PANG! ${dec(medel(res, (r) => r.packin), 1)} ★ · buggar ${dec(medel(res, (r) => r.buggar))}`);
console.log(`  prognos vecka 1 ${dec(medel(res, (r) => r.forsta))} · sålda vecka 1 ${dec(medel(res, (r) => r.v1 || 0))} · vecka 26 ${dec(medel(res, (r) => r.v26 || 0))} · 26 veckor ${dec(medel(res, (r) => r.salda26), 0)} · ägare ${dec(medel(res, (r) => r.inst), 0)}`);
console.log(`  förfrågningar ${dec(medel(res, (r) => r.forfr), 1)} · avtal ${dec(medel(res, (r) => r.avtal), 1)} · spel ute ${dec(medel(res, (r) => r.ute), 1)} · bibliotek ×${dec(medel(res, (r) => r.bib), 2)}`);
console.log(`  modellvinst ${kr(medel(res, (r) => r.vinst))} · kassa ${kr(medel(res, (r) => r.kassa))} · mål klara ${dec(medel(res, (r) => r.mal), 1)}`);
ok(r0.roller === 'forskare+spelutvecklare', 'Vera (forskare) och Lykke (spelutvecklare) söker jobb 1982');
ok(res.every((r) => r.st.ok), 'konsolbygget startar');
ok(r0.styck > 450 && r0.styck < 750, `styckkostnad ${r0.styck} kr (≈ telefonens 660)`);
ok(res.every((r) => r.swDagar > 0 && r.packin >= 1), 'PANG! görs efter hårdvaran och följer med i lådan');
ok(Math.abs(medel(res, (r) => r.betyg) - kSnitt(r0.lansDag) - 0.4) < 0.6, 'första konsolen hamnar strax över 1982 års snitt');
ok(medel(res, (r) => r.forsta) > 8 && medel(res, (r) => r.forsta) < 40, 'första veckan 8–40 köpare');
ok(medel(res, (r) => r.forfr) >= 1, 'studios hör av sig första halvåret');
ok(medel(res, (r) => r.ute) >= 1.3, 'minst ett studiospel hinner släppas (utöver PANG!)');
ok(medel(res, (r) => r.kassa) > 1_500_000, 'kassan håller ett halvår efter lanseringen');
ok(res.every((r) => r.ljud), 'TRE KANALER hinner forskas');
ok(res.every((r) => Number.isFinite(r.p.salda) && Number.isFinite(r.G.bolag.kassa)), 'inga NaN');

// ---------- krav, egna spel och avtal ----------
{
  const G = r0.G;
  const k5 = studioKrav(G, 5, 'svamp'), k3 = studioKrav(G, 3, 'namko');
  console.log(`  studiokrav 1982: ★★★ ${dec(k3.betyg)} + ${k3.bas} ägare · ★★★★★ ${dec(k5.betyg)} + ${k5.bas} ägare · lediga spel: ${ledigaSpel(G).map((s) => s.titel).join(', ') || '–'}`);
  ok(!G.k.spel.some((s) => s.stj >= 5), 'inget ★★★★★-spel till en nystartad konsol');
  // eget spel: RYMDSKYTTEN (1982) – PANG! ligger redan i lådan
  const egna = egnaSpelLediga(G).map((e) => e.id);
  const r = startaEgetSpel(G, egna[0], r0.p.id);
  ok(r.ok, `eget spel startar (${egna[0]})`);
  let n = 0; while (egetPagar(G) && n++ < 400) dagTick(G);
  const eget = G.k.spel.find((s) => s.egen && !s.packin);
  ok(eget && eget.status === 'ute' && eget.stj >= 1, `${eget?.titel} släpps med ${eget?.stj} ★ efter ${n} dagar`);
}

// ---------- telefonerna är låsta tills TELEFONAVDELNINGEN ----------
{
  const G = nyttSpel({ seed: 3, lage: 'konsol' });
  ok(status(G, NOD['funk-gps']) === 'last' && !starta(G, 'funk-gps').ok, 'telefonnoderna är låsta 1982');
  ok(synligaNoder(G).length === 237, 'konsolspelet visar 93 konsolnoder + 144 telefonnoder');
  ok(!startaUtveckling(G, nyDesign(G)).ok, 'ingen telefon utan telefonavdelningen');
  G.dag = dagForAr(2007) + 10; G.bolag.fp = 5000; G.bolag.kassa = 50_000_000;
  G.forskning.klara.push('kenhet-ficka', 'kfunk-pekskarm', 'kfunk-wifi', 'kfunk-bakat', 'kfunk-tradlos');
  const s = starta(G, 'k-mobil');
  ok(s.ok, 'TELEFONAVDELNINGEN går att forska 2007 (' + (s.fel || 'ok') + ')');
  for (let i = 0; i < 120 && !G.flaggor.mobil; i++) dagTick(G);
  ok(G.flaggor.mobil && G.marknad.rivaler.length === 9, 'telefonavdelningen öppnar och telefonrivalerna dyker upp');
  ok(status(G, NOD['funk-gps']) === 'redo', 'GPS går att forska när avdelningen är öppen');
  const T = nyttSpel({ seed: 3 });
  ok(!T.k && !T.lage && T.dag === 0 && T.marknad.rivaler.length === 9, 'snabbstarten 2007 är som förut');
  ok(synligaNoder(T).length === 144 && status(T, NOD['kdel-cpu-8bit3']) === 'last', 'snabbstarten ser bara telefonnoderna');
}

// ---------- marknaden över tid ----------
{
  const G = nyttSpel({ seed: 5, lage: 'konsol' });
  const rader = [];
  for (const ar of [1982, 1990, 2000, 2006, 2015, 2026]) {
    G.dag = dagForAr(ar) + 100;
    const d = nyDesign(G, null, 'konsol');
    rader.push(`${ar}: snitt ${dec(kSnitt(G.dag), 2)} · rimligt ${kr(rimligtPris(G.dag, kSnitt(G.dag), 'hem'))} · fabrik ${kr(fabriksPris(G, d))} · reklam ${kampanjer(G, d).map((k) => k.id + ' ' + kr(k.pris, true)).join(', ')}`);
  }
  console.log('  ' + rader.join('\n  '));
  ok(kampanjer(G, nyDesign(G, null, 'konsol')).some((k) => k.id === 'natet'), 'nätannonser finns 2026');
}

console.log(fel.length ? `✗ konsol-sim-test: ${fel.length} fel` : '✓ konsol-sim-test: konsolspelet 1982 fungerar');
process.exit(fel.length ? 1 : 0);
