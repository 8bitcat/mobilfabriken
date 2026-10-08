// GÅVOR – sju kort, ett per riktig kalenderdag du spelar. Ingen streak som nollställs (familjespel):
// missar du en dag fortsätter du där du var. Pengagåvorna växer med bolaget.
import { F, W, rect, ram, text, textB, knapp, panel, kort, ikon, hit, stycke, mixa, ljusa, BIG } from '../core/ui.js';
import { hud, flikrad } from './ram.js';
import { konfetti } from '../core/notiser.js';
import { intakt, nyhet } from '../sim/spel.js';
import { LEGENDARISKA } from '../data/delar.js';
import { kr } from '../sim/bas.js';
import * as Spara from '../core/spara.js';

const idag = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
export const KORT = [
  { dag: 1, namn: 'PENGAR', typ: 'pengar', bas: 150_000, farg: F.gron, ikon: 'pengar' },
  { dag: 2, namn: 'FORSKNING', typ: 'fp', bas: 60, farg: F.bla, ikon: 'fp' },
  { dag: 3, namn: 'PENGAR', typ: 'pengar', bas: 300_000, farg: F.gron, ikon: 'pengar' },
  { dag: 4, namn: 'FORSKNING', typ: 'fp', bas: 90, farg: F.bla, ikon: 'fp' },
  { dag: 5, namn: 'MYSTERIELÅDA', typ: 'lada', farg: F.lila, ikon: 'gava', info: 'EN LEGENDARISK YTA' },
  { dag: 6, namn: 'INFLUENCER', typ: 'influencer', farg: F.rod, ikon: 'mega', info: '+60 % HYPE VID LANSERING' },
  { dag: 7, namn: '24K GULD', typ: 'guld', farg: F.guld2, ikon: 'stjarna', info: 'DIREKTBYGGE + GULDYTA' },
];
export function gavaKlar() { const g = Spara.gavoLage(); return g.senast !== idag(); }

export function gavor(A) {
  const G = A.G;
  let lage = Spara.gavoLage(), oppnat = null;
  const nasta = lage.senast === idag() ? null : (lage.kort % 7);
  const belopp = (k) => k.typ === 'pengar' ? Math.max(k.bas, Math.round(0.1 * veckoOmsattning(G) / 1000) * 1000) : k.bas;
  function oppna() {
    if (nasta == null) return;
    const k = KORT[nasta];
    if (k.typ === 'pengar') intakt(G, belopp(k), 'gavor');
    else if (k.typ === 'fp') G.bolag.fp += k.bas;
    else if (k.typ === 'lada') { const ny = LEGENDARISKA.filter((l) => !G.legendariska.includes(l.id) && l.id !== 'guld'); const l = ny[Math.floor(Math.random() * ny.length)] || LEGENDARISKA[0]; if (!G.legendariska.includes(l.id)) G.legendariska.push(l.id); oppnat = l.namn; }
    else if (k.typ === 'influencer') G.inventarie.influencer++;
    else if (k.typ === 'guld') { G.inventarie.direktbygge++; if (!G.legendariska.includes('guld')) G.legendariska.push('guld'); }
    if (nasta === 4) G.flaggor.saljBonus = true;   // dag 5-bonusen: +10 % på varje försäljning, för alltid
    lage = { senast: idag(), kort: lage.kort + 1 }; Spara.sparaGavoLage(lage);
    nyhet(G, 'DU', `${G.bolag.namn} ÖPPNADE DAGENS GÅVA: ${k.namn}.`);
    konfetti(60); A.ljud('mal'); A.spara();
  }
  return {
    tid: false,
    rita() {
      rect(0, 14, W, 188, 0x0b0e1c);
      textB('GÅVOR', 4, 16, F.guld); text('EN GÅVA VARJE DAG DU SPELAR – MISSAR DU EN DAG FORTSÄTTER DU DÄR DU VAR', 44, 18, F.dim);
      KORT.forEach((k, i) => {
        const x = 4 + i * 54, y = 30, klar = i < (lage.kort % 7) || (lage.senast === idag() && i === (lage.kort - 1) % 7), nu = i === nasta;
        kort(x, y, 51, 80, { vald: nu, kant: nu ? F.guld : k.farg });
        rect(x + 3, y + 3, 22, 8, mixa(k.farg, F.panel, 0.4)); text('DAG ' + k.dag, x + 5, y + 5, F.text);
        rect(x + 8, y + 15, 35, 30, mixa(k.farg, F.panel2, 0.7)); ikon(k.ikon, x + 19, y + 24, k.farg, 2);
        text(k.namn, x + 26, y + 50, F.text, { just: 'c' });
        text(k.typ === 'pengar' ? kr(belopp(k), true) : k.typ === 'fp' ? '+' + k.bas + ' FP' : '', x + 26, y + 58, k.farg, { just: 'c' });
        if (k.info) stycke(k.info, x + 3, y + 57, 45, F.dim, { rad: 6 });
        if (klar) { rect(x + 3, y + 68, 45, 9, F.panel3); ikon('bock', x + 22, y + 69, F.gron2); }
        else if (nu) knapp(x + 3, y + 67, 45, 11, 'ÖPPNA!', { stil: 'gron', klick: oppna, namn: 'gava-oppna' });
        else { rect(x + 3, y + 68, 45, 9, F.panel2); ikon('las', x + 15, y + 69, F.dim2); text('DAG ' + k.dag, x + 25, y + 70, F.dim2); }
      });
      panel(4, 116, 186, 82, { fyll: mixa(F.orange, F.panel, 0.75) });
      text('DAG 5-BONUS', 10, 121, F.orange2);
      textB('+10 % PÅ VARJE FÖRSÄLJNING', 10, 130, F.text);
      stycke('ÖPPNA FEM GÅVOR SÅ TJÄNAR VARJE SÅLD TELEFON 10 % MER. FÖR ALLTID.', 10, 142, 176, F.dim);
      text(G.flaggor.saljBonus ? 'AKTIV!' : `${Math.min(5, lage.kort)} AV 5`, 10, 160, G.flaggor.saljBonus ? F.gron2 : F.guld);
      panel(194, 116, 186, 82, { fyll: mixa(F.guld2, F.panel, 0.8) });
      text('LEGENDARISKA YTOR', 200, 121, F.guld);
      textB(`${G.legendariska.length} AV 6 SAMLADE`, 200, 130, F.text);
      LEGENDARISKA.forEach((l, i) => { const x = 200 + i * 29, har = G.legendariska.includes(l.id); rect(x, 144, 26, 14, har ? parseInt(l.farg.slice(1), 16) : F.panel2); ram(x, 144, 26, 14, har ? F.guld : F.dim2); if (!har) ikon('las', x + 10, 147, F.dim2); text(l.namn, x + 13, 161, har ? F.text : F.dim2, { just: 'c' }); });
      text(oppnat ? 'NY YTA: ' + oppnat + '! VÄLJ DEN I DESIGNERN.' : 'ANVÄNDS I DESIGNERN (FÄRG & MÄRKE).', 200, 172, oppnat ? F.guld : F.dim);
      hud(A); flikrad(A, 'kontor');
    },
  };
}
function veckoOmsattning(G) { return G.produkter.reduce((s, p) => s + (p.veckor[p.veckor.length - 1] || 0) * p.pris, 0); }
