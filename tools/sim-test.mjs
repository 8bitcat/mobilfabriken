// Provkör simuleringen i Node utan webbläsare: första telefonen enligt handledningen, kalibrerad mot förlagan.
//   node tools/sim-test.mjs          → skriver siffrorna och slutar med ✓/✗-rad
import { nyttSpel } from '../js/sim/spel.js';
import { placera } from '../js/sim/kontor.js';
import { startKandidater, anstall } from '../js/sim/personal.js';
import { nyDesign, styckkostnad } from '../js/sim/design.js';
import { startaUtveckling, lansera, lanseringsKalkyl, modellVinst } from '../js/sim/projekt.js';
import { starta } from '../js/sim/forskning.js';
import { dagTick } from '../js/sim/tick.js';
import { kr, dec, datumText } from '../js/sim/bas.js';

const fel = [];
const ok = (villkor, text) => { console.log((villkor ? '  ✓ ' : '  ✗ ') + text); if (!villkor) fel.push(text); };
const resultat = [];
for (let seed = 1; seed <= 30; seed++) {
  const G = nyttSpel({ namn: 'Mikrovåg Mobil', seed });
  startKandidater(G);
  placera(G, { typ: 'bord', i: 0 }, 'fallbord'); placera(G, { typ: 'bord', i: 1 }, 'fallbord');
  anstall(G, G.kandidater[0].id); anstall(G, G.kandidater[0].id);
  const d = nyDesign(G); d.namn = 'Pixel Phone 1';
  const styck = styckkostnad(G, d);
  startaUtveckling(G, d);
  const pr = G.projekt[0], dagar = pr.dagar;
  let gpsDag = null;
  while (G.projekt[0].status !== 'klar') { dagTick(G); if (gpsDag == null && G.bolag.fp >= 27 && starta(G, 'funk-gps').ok) gpsDag = G.dag; }
  const k = lanseringsKalkyl(G, pr.id, 'ingen');
  const lan = lansera(G, pr.id, 'ingen');
  const p = lan.produkt, lansDag = G.dag;
  for (let i = 0; i < 7 * 13; i++) dagTick(G);
  resultat.push({ seed, styck, dagar, betyg: p.betyg, buggar: p.buggar, kval: p.kvalitet, forsta: k.forstaVeckan, salda13: p.salda, vinst: modellVinst(p), kassa: G.bolag.kassa, rykte: G.bolag.rykte, fp: G.bolag.fp, gps: G.forskning.klara.includes('funk-gps'), lansDag, mal: G.mal.klara.length, v1: p.veckor[0], v13: p.veckor[12], k, G });
}
const r0 = resultat[0];
const medel = (f) => resultat.reduce((s, r) => s + f(r), 0) / resultat.length;
console.log('Första telefonen (30 slumpfrön):');
console.log(`  styckkostnad ${r0.styck} kr · byggtid ${r0.dagar} dagar · lansering ${datumText(r0.lansDag)} · fabrik + parti ${kr(r0.k.fabrik + r0.k.parti)}`);
console.log(`  betyg medel ${dec(medel((r) => r.betyg), 2)} (min ${Math.min(...resultat.map((r) => r.betyg))}, max ${Math.max(...resultat.map((r) => r.betyg))}) · prickar ${dec(medel((r) => r.kval))} · buggar ${dec(medel((r) => r.buggar))}`);
console.log(`  prognos vecka 1 ${dec(medel((r) => r.forsta))} köpare · sålda vecka 1 ${dec(medel((r) => r.v1))} · vecka 13 ${dec(medel((r) => r.v13))} · 13 veckor ${dec(medel((r) => r.salda13), 0)}`);
console.log(`  modellvinst efter 13 v ${kr(medel((r) => r.vinst))} · kassa ${kr(medel((r) => r.kassa))} · rykte ${dec(medel((r) => r.rykte), 2)} · FP ${dec(medel((r) => r.fp), 0)} · mål klara ${dec(medel((r) => r.mal), 1)}`);
ok(r0.styck === 660, 'styckkostnad 660 kr (förlagans $66)');
ok(r0.dagar === 23, 'byggtid 23 dagar med två ★-anställda');
ok(Math.abs(medel((r) => r.betyg) - 6.2) < 0.35, 'betyget runt 6,2');
ok(Math.abs(medel((r) => r.forsta) - 22) < 5, 'första veckan ~22 köpare');
ok(medel((r) => r.salda13) > 180 && medel((r) => r.salda13) < 330, 'ungefär 250 sålda på 13 veckor');
ok(resultat.every((r) => r.gps), 'GPS hinner forskas före/under lanseringen');
ok(Math.abs(r0.k.fabrik + r0.k.parti - 366_000) < 1000, 'lanseringen kostar ~366 000 kr (fabrik + 100 st)');
ok(medel((r) => r.kassa) > 1_500_000, 'kassan håller efter tre månader');
ok(resultat.every((r) => r.rykte > 0.95 && r.rykte < 1.05), 'ryktet ~0,99 efter första telefonen');
console.log(fel.length ? `✗ sim-test: ${fel.length} fel` : '✓ sim-test: första telefonen stämmer med förlagan');
process.exit(fel.length ? 1 : 0);
