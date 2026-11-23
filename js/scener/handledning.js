// HANDLEDNINGEN – förlagans 13 steg i fem kapitel (BYGG → TEAM → DESIGN → LANSERA → VÄX).
// Mio pratar i en ruta, en gul pil pekar på rätt knapp och stegen bockas av när man gjort det.
// Steg 0 är välkomstrutan "Ett tomt garage och en stor idé" (tiden står still medan den visas).
// Konsolspelet (G.lage 'konsol') har en egen serie, K_STEG: 17 steg i sex kapitel (BYGG → TEAM → DESIGN → LANSERA →
// STUDIOS → VÄX). Lykke är spelutvecklare och gör PANG!, bygget går i två faser (hårdvaran, sedan spelet i lådan) och
// kapitlet STUDIOS lär barnet säga JA när en studio knackar på. Telefonspelets STEG är orörda.
import { U, F, W, H, rect, ram, text, textB, knapp, panel, ikon, hit, inne, stycke, radbryt, kapa, morkna, mixa, ljusa, BIG } from '../core/ui.js';
import { personSprite } from '../core/people.js';
import * as Vy3d from '../telefon/vy3d.js';
import { LICENS } from '../sim/konsol.js';
import { datumText, forstaIManaden } from '../sim/bas.js';

const MIO = { skin: '#c68a5c', hair: '#8e5bd1', style: 'long', top: 'tee', shirt: '#e07a2e', accent: '#f4f1ea', bottom: 'jeans', pants: '#2d3a5c', shoes: '#c23b3b', build: 5, glasses: false };
const KAP = { BYGG: F.orange, TEAM: F.rosa, DESIGN: F.gron, LANSERA: F.guld2, STUDIOS: F.lila2, 'VÄX': F.bla2 };
export const STEG = [
  null,
  { kap: 'BYGG', rubrik: 'MÖBLERA GARAGET', text: 'KLICKA PÅ BYGG.', mal: 'flik-bygg', klar: (A) => A.scenNamn === 'bygg' },
  { kap: 'BYGG', rubrik: 'STÄLL UT 2 SKRIVBORD', text: 'FÄLLBORDET ÄR GRATIS. VÄLJ DET OCH TRYCK PÅ DE GRÖNA PLATSERNA.', mal: (A) => (U.mark['mobel-fallbord'] && !A.G.flaggor.valtFallbord ? 'mobel-fallbord' : U.mark['plats-bord-0'] && !A.G.kontor.bord[0] ? 'plats-bord-0' : 'plats-bord-1'), klar: (A) => A.G.kontor.bord.filter(Boolean).length >= 2 },
  { kap: 'BYGG', rubrik: 'KLART!', text: 'TRYCK KLAR FÖR ATT GÅ TILLBAKA TILL KONTORET.', mal: 'bygg-klar', klar: (A) => A.scenNamn === 'kontor' },
  { kap: 'TEAM', rubrik: 'ANSTÄLL DITT TEAM', text: 'KLICKA PÅ PERSONAL.', mal: 'flik-personal', klar: (A) => A.scenNamn === 'personal' || A.G.personal.length >= 2 },
  { kap: 'TEAM', rubrik: 'ANSTÄLL 2 PERSONER', text: 'VERA ÄR FORSKARE – HON GÖR TELEFONERNA BÄTTRE. LYKKE ÄR BUGGFIXARE. ANSTÄLL BÅDA.', mal: 'anstall-0', klar: (A) => A.G.personal.length >= 2 },
  { kap: 'DESIGN', rubrik: 'DAGS ATT RITA', text: 'KLICKA PÅ DESIGN.', mal: 'flik-design', klar: (A) => A.scenNamn === 'design' || A.G.projekt.length > 0 },
  { kap: 'DESIGN', rubrik: 'GÖR DEN TILL DIN', text: 'BLÄDDRA GENOM STEGEN MED FORTSÄTT – ELLER HOPPA TILL GRANSKNINGEN – OCH TRYCK STARTA UTVECKLING.', mal: () => (U.mark['design-starta'] ? 'design-starta' : 'design-hoppa'), klar: (A) => A.G.projekt.length > 0 || A.G.produkter.length > 0 },
  { kap: 'LANSERA', rubrik: 'SPOLA FRAM TIDEN', text: 'TEAMET BYGGER NU. TRYCK 4× FÖR ATT GÅ FORTARE.', mal: 'fart-4', klar: (A) => (A.G.fart >= 4 && A.G.projekt.length > 0) || A.G.projekt.some((p) => p.status === 'klar') || A.G.produkter.length > 0 },
  { kap: 'LANSERA', rubrik: 'LANSERA!', text: 'NÄR TELEFONEN ÄR KLAR: TRYCK LANSERA, VÄLJ REKLAM OCH LANSERA.', texter: { lansering: 'VÄLJ REKLAM OCH TRYCK PÅ LANSERA!' }, mal: () => (U.mark['lansera'] ? 'lansera' : 'kontor-lansera'), klar: (A) => A.G.produkter.length > 0 },
  { kap: 'LANSERA', rubrik: 'SHOWEN', text: 'NU AVSLÖJAS BETYGET! TEKNIK, DESIGN OCH PUTS AVGÖR.', mal: 'show-klar', baraPil: true, klar: (A) => A.scenNamn !== 'show' && A.G.produkter.length > 0 },
  { kap: 'LANSERA', rubrik: 'FÖRSTA VECKAN', text: 'TELEFONEN SÄLJER VARJE DAG. TITTA I TELEFONER EFTER EN VECKA.', texter: { telefoner: 'HÄR SER DU VAD TELEFONEN SÄLJER. LÅT TIDEN GÅ EN VECKA.' }, mal: (A) => (A.scenNamn === 'telefoner' ? null : 'flik-telefoner'), klar: (A) => A.G.produkter.some((p) => p.veckor.length > 0) && A.scenNamn === 'telefoner' },
  { kap: 'VÄX', rubrik: 'UPPFINN NY TEKNIK', text: 'FORSKAREN TJÄNAR FORSKNINGSPOÄNG (FP). KLICKA PÅ FORSKNING.', mal: 'flik-forskning', klar: (A) => A.scenNamn === 'forskning' },
  { kap: 'VÄX', rubrik: 'STARTA FORSKNING', text: 'KLICKA PÅ GPS OCH STARTA DEN. DÅ FÅR NÄSTA TELEFON EN NY FUNKTION.', mal: () => (U.mark['starta-forskning'] ? 'starta-forskning' : 'redo-funk-gps'), klar: (A) => A.G.forskning.pagar.length > 0 || A.G.forskning.klara.length > 0 },
];

// ---------- konsolspelet 1982 ----------
// Stegens extra fält (bara här): text kan vara en funktion (A) => text; vantar = steget väntar på att dagarna går
// (pil på 1× om tiden står still); bygge = steget kräver ett bygge (avbröts det går Mio tillbaka till DAGS ATT RITA,
// 'design' = utom i designern); kontor = steget händer i kontoret (i andra scener pekar Mio på KONTOR först – där syns
// prickarna, och i de flesta andra scener står tiden still).
const kBygge = (G) => G.projekt.find((p) => p.status === 'bygger') || G.projekt[0] || null;
const byggerKonsol = (G) => !!kBygge(G) && kBygge(G).status === 'bygger';
const forfragan = (G) => (G.k?.forfragningar.length || 0) > 0;
const avtal = (G) => (G.flaggor.avtal || 0) > 0 || !!G.k?.spel.some((s) => !s.egen);
// den som gör spelet i lådan: första spelutvecklaren (Lykke), annars hela teamet
const utvecklare = (G) => G.personal.find((p) => p.roll === 'spelutvecklare')?.namn || 'TEAMET';
const nastaKnack = (G) => { let d = G.dag + 1; while (!forstaIManaden(d) && d < G.dag + 40) d++; return datumText(d); };
const licens = () => Math.round(LICENS * 100);
// en speltitel mitt i en mening: PANG! har redan sitt utropstecken, RYMDSKYTTEN får en punkt
const mening = (t) => (/[.!?]$/.test(t) ? t : t + '.');
// Vera (forskaren) först, sedan Lykke (spelutvecklaren) – pilen följer dem i kandidatlistan
function anstallMal(A) {
  const G = A.G, har = (r) => G.personal.some((p) => p.roll === r);
  const roll = !har('forskare') ? 'forskare' : !har('spelutvecklare') ? 'spelutvecklare' : null;
  return 'anstall-' + Math.max(0, roll ? G.kandidater.findIndex((k) => k.roll === roll) : 0);
}
export const K_STEG = [
  null,
  STEG[1], STEG[2], STEG[3], STEG[4],
  { kap: 'TEAM', rubrik: 'ANSTÄLL 2 PERSONER', text: 'VERA ÄR FORSKARE – HON GÖR KONSOLERNA BÄTTRE. LYKKE ÄR SPELUTVECKLARE – HON GÖR SPELET PANG! ANSTÄLL BÅDA.', mal: anstallMal, klar: (A) => A.G.personal.length >= 2 },
  { kap: 'DESIGN', rubrik: 'DAGS ATT RITA', text: 'KLICKA PÅ DESIGN.', mal: 'flik-design', klar: (A) => A.scenNamn === 'design' || A.G.projekt.length > 0 },
  { kap: 'DESIGN', rubrik: 'DIN FÖRSTA KONSOL', text: 'BLÄDDRA MED FORTSÄTT ELLER HOPPA TILL GRANSKNINGEN, OCH TRYCK STARTA UTVECKLING. PANG! FÖLJER MED I LÅDAN.', mal: () => (U.mark['design-starta'] ? 'design-starta' : 'design-hoppa'), bygge: 'design', klar: (A) => A.G.projekt.length > 0 || A.G.produkter.length > 0 },
  { kap: 'LANSERA', rubrik: 'SPOLA FRAM TIDEN', text: (A) => (kBygge(A.G)?.design.packin ? `FÖRST BYGGS HÅRDVARAN, SEDAN GÖR ${utvecklare(A.G)} SPELET ${mening(kBygge(A.G).design.packin.titel)} TRYCK 4× FÖR ATT GÅ FORTARE.` : 'TEAMET BYGGER NU KONSOLEN. TRYCK 4× FÖR ATT GÅ FORTARE.'),
    mal: 'fart-4', bygge: true, klar: (A) => (A.G.fart >= 4 && A.G.projekt.length > 0) || A.G.projekt.some((p) => p.status === 'klar') || A.G.produkter.length > 0 },
  { kap: 'LANSERA', rubrik: 'FÖRST HÅRDVARAN', text: (A) => (kBygge(A.G)?.design.packin ? 'BLÅ PRICK = KVALITET, RÖD = BUGG. NÄR HÅRDVARAN ÄR KLAR BÖRJAR SPELET I LÅDAN.' : 'BLÅ PRICK = KVALITET, RÖD = BUGG. INGET SPEL I LÅDAN DEN HÄR GÅNGEN.'),
    mal: null, kontor: true, bygge: true, vantar: (A) => byggerKonsol(A.G), klar: (A) => { const p = kBygge(A.G); return !p || p.fas === 'mjukvara' || p.status === 'klar' || A.G.produkter.length > 0; } },
  { kap: 'LANSERA', rubrik: (A) => kapa('SEDAN ' + (kBygge(A.G)?.design.packin?.titel || 'SPELET'), 128), text: (A) => { const p = kBygge(A.G); return `HÅRDVARAN ÄR KLAR! NU GÖR ${utvecklare(A.G)} ${mening(p?.design.packin?.titel || 'SPELET')} GRÖN PRICK = SPELETS KVALITET. MÅLET ÄR ${p?.spelMal || 6}.`; },
    mal: null, kontor: true, bygge: true, vantar: (A) => byggerKonsol(A.G), klar: (A) => { const p = kBygge(A.G); return !p || p.status === 'klar' || A.G.produkter.length > 0; } },
  { kap: 'LANSERA', rubrik: 'LANSERA!', text: 'NÄR KONSOLEN ÄR KLAR: TRYCK LANSERA, VÄLJ REKLAM OCH LANSERA.', texter: { lansering: 'VÄLJ REKLAM OCH TRYCK PÅ LANSERA!' }, mal: () => (U.mark['lansera'] ? 'lansera' : 'kontor-lansera'),
    kontor: true, bygge: true, vantar: (A) => byggerKonsol(A.G), klar: (A) => A.G.produkter.length > 0 },
  { kap: 'LANSERA', rubrik: 'SHOWEN', text: 'NU AVSLÖJAS BETYGET! TEKNIK, DESIGN OCH SPELET I LÅDAN AVGÖR.', mal: 'show-klar', baraPil: true, klar: (A) => A.scenNamn !== 'show' && A.G.produkter.length > 0 },
  { kap: 'LANSERA', rubrik: 'FÖRSTA VECKAN', text: 'KONSOLEN SÄLJER VARJE DAG. TITTA I KONSOLER EFTER EN VECKA.', texter: { telefoner: 'HÄR SER DU VAD KONSOLEN SÄLJER OCH HUR MÅNGA SOM HAR DEN HEMMA. LÅT TIDEN GÅ EN VECKA.' },
    mal: (A) => (A.scenNamn === 'telefoner' ? null : 'flik-telefoner'), vantar: (A) => !A.G.produkter.some((p) => p.veckor.length > 0), klar: (A) => A.G.produkter.some((p) => p.veckor.length > 0) && A.scenNamn === 'telefoner' },
  { kap: 'STUDIOS', rubrik: 'EN STUDIO KNACKAR PÅ', text: (A) => (forfragan(A.G) ? 'EN SPELSTUDIO VILL GÖRA ETT SPEL TILL DIN KONSOL! KLICKA PÅ STUDIOS.' : `STUDIOS HÖR AV SIG DEN 1:A VARJE MÅNAD NÄR KONSOLEN ÄR BRA NOG. LÅT TIDEN GÅ TILL ${nastaKnack(A.G)}.`),
    mal: (A) => (!forfragan(A.G) ? null : U.mark['kontor-studios'] ? 'kontor-studios' : 'flik-studios'), vantar: (A) => !forfragan(A.G), klar: (A) => A.scenNamn === 'studios' || avtal(A.G) },
  { kap: 'STUDIOS', rubrik: 'SÄG JA!', text: (A) => (forfragan(A.G) ? `STUDION KÖPER ETT UTVECKLINGSKIT AV DIG, OCH DU FÅR ${licens()} % AV VARJE SÅLT SPEL. TRYCK JA!` : `INGEN FÖRFRÅGAN JUST NU. NÄSTA KNACK KOMMER ${nastaKnack(A.G)} – LÅT TIDEN GÅ.`),
    mal: (A) => (!forfragan(A.G) ? null : U.mark['studios-ja-0'] ? 'studios-ja-0' : U.mark['studios-flik-forfragningar'] ? 'studios-flik-forfragningar' : U.mark['kontor-studios'] ? 'kontor-studios' : 'flik-studios'),
    vantar: (A) => !forfragan(A.G), klar: (A) => avtal(A.G) },
  { kap: 'VÄX', rubrik: 'UPPFINN NY TEKNIK', text: 'FORSKAREN TJÄNAR FORSKNINGSPOÄNG (FP). KLICKA PÅ FORSKNING.', mal: 'flik-forskning', klar: (A) => A.scenNamn === 'forskning' },
  { kap: 'VÄX', rubrik: 'STARTA FORSKNING', text: 'KLICKA PÅ TRE KANALER OCH STARTA DEN. DÅ FÅR NÄSTA KONSOL BÄTTRE LJUD.', mal: () => (U.mark['starta-forskning'] ? 'starta-forskning' : 'redo-kdel-ljud-3kan'), klar: (A) => A.G.forskning.pagar.length > 0 || A.G.forskning.klara.length > 0 },
];
const K_RITA = K_STEG.findIndex((s) => s?.rubrik === 'DAGS ATT RITA');
const K_STUDIOS = K_STEG.findIndex((s) => s?.kap === 'STUDIOS');
// En studio knackade på redan under bygget och barnet tryckte SE FÖRFRÅGAN: i STUDIOS hjälper Mio till med svaret fast
// kapitlet STUDIOS inte har börjat (steget står kvar). Finns inget att svara på pekar hon tillbaka till kontoret.
const SIDO_JA = { kap: 'STUDIOS', rubrik: 'EN STUDIO KNACKAR PÅ!', text: () => `TRYCK JA – STUDION KÖPER ETT UTVECKLINGSKIT AV DIG, OCH DU FÅR ${licens()} % AV VARJE SÅLT SPEL.`,
  mal: () => (U.mark['studios-ja-0'] ? 'studios-ja-0' : 'studios-flik-forfragningar') };
const SIDO_KONTOR = { kap: 'STUDIOS', rubrik: 'TILLBAKA TILL KONTORET', text: (A) => (avtal(A.G) ? 'BRA! STUDION GÖR NU SPELET TILL DIN KONSOL. GÅ TILLBAKA TILL KONTORET.' : 'HÄR HAMNAR STUDIORNAS FÖRFRÅGNINGAR. GÅ TILLBAKA TILL KONTORET SÅ LÄNGE.'), mal: 'flik-kontor' };

export const stegFor = (G) => (G?.lage === 'konsol' ? K_STEG : STEG);
export function handledningAktiv(A) { const h = A.G?.handledning; return !!(h && !h.klar && !h.av && h.steg === 0 && A.scenNamn !== 'start'); }

// Var Mios ruta står i scenerna där det barnet ska titta på annars hamnar under den (spelpixlar).
// nere = rutans underkant. Övriga scener räknar ut platsen från målet.
const PLATS = {
  kontor: { x: 4, y: 28 },                  // över tegelväggen – BYGGER-raden och målpanelen syns
  bygg: { x: 4, y: 28 },                    // över tegelväggen – möbelkorten, kategorierna och KLAR går att trycka på
  design: { x: 2, nere: 200, w: 160 },      // över VY-knapparna – ATT TILLVERKA och telefonen syns
  lansering: { x: 2, y: 160, nere: 214, w: 114 },   // under telefonen – namnet, reklamkorten och PRIS syns
  telefoner: { x: 4, nere: 200, w: 136 },   // över rivallistan – din telefon och SÅLDA syns
  forskning: { x: 232, y: 28, w: 150 },     // över kommande års teknik – FP, listan och i år syns
};
// konsolspelets skärmar ser annorlunda ut (en post här ersätter PLATS, null = räkna från målet)
const K_PLATS = {
  studios: { x: 4, nere: 189 },             // över kravtabellen – förfrågan, JA och svarsraden (y 190) syns
  lansering: { x: 2, y: 36, w: 114 },       // över konsolen i 3D – I LÅDAN och STUDIOSPEL under den syns
};
const TIDEN_STAR = 'TIDEN STÅR STILL. TRYCK PÅ 1× SÅ ATT DAGARNA GÅR.';
// Ett tryck byter ut U.mus mot ett nytt objekt (pekareNer i ui.js). Ett nytt objekt sedan förra bildrutan betyder alltså
// ett tryck – även ett så snabbt att U.mus.ned aldrig hann synas i en bildruta.
let forraMus = null;

export function ritaHandledning(A, dt) {
  const G = A.G, h = G.handledning;
  A.mioMal = null;   // knappen Mio pekar på den här bildrutan (testrobotarna följer henne)
  const tryckt = U.mus !== forraMus; forraMus = U.mus;
  if (!h || h.klar || h.av) return;
  if (h.steg === 0) return valkomst(A);
  // reklamfilmen täcks aldrig, och stegen står still medan den går
  if (A.scenNamn === 'reklam') return;
  const konsol = G.lage === 'konsol', lista = stegFor(G), sista = lista.length - 1;
  // bygget avbröts (eller designern stängdes) innan någon telefon fanns: tillbaka till DAGS ATT RITA
  if (!konsol && h.steg >= 7 && h.steg <= 9 && !G.projekt.length && !G.produkter.length && !(h.steg === 7 && A.scenNamn === 'design')) h.steg = 6;
  const kb = konsol && lista[h.steg]?.bygge;
  if (kb && !G.projekt.length && !G.produkter.length && !(kb === 'design' && A.scenNamn === 'design')) h.steg = K_RITA;
  let s = lista[h.steg];
  if (!s) { h.klar = true; return; }
  if (s.klar(A)) { h.steg++; A.ljud('klick'); if (h.steg >= lista.length) { h.klar = true; G.flaggor.handledningKlar = true; } return; }
  if (A.scenNamn === 'bygg' && U.mark['mobel-fallbord'] && U.mus.ned) G.flaggor.valtFallbord = true;
  // konsolspelet: också ett snabbt tryck på FÄLLBORD räknas (annars pekar pilen kvar på fällbordet)
  if (konsol && A.scenNamn === 'bygg' && tryckt) { const m = U.mark['mobel-fallbord']; if (m && inne(m.x, m.y, m.w, m.h)) G.flaggor.valtFallbord = true; }
  const varde = (v) => (typeof v === 'function' ? v(A) : v);
  const steg = h.steg;
  // konsolspelet i STUDIOS före kapitlet STUDIOS (när det finns en konsol eller ett bygge): svara på förfrågan,
  // eller tillbaka till kontoret om stegets knapp inte finns här
  if (konsol && A.scenNamn === 'studios' && steg < K_STUDIOS && (G.projekt.length || G.produkter.length)) {
    if (forfragan(G)) s = SIDO_JA;
    else { const m = varde(s.mal); if (!m || !U.mark[m]) s = SIDO_KONTOR; }
  }
  let malNamn = varde(s.mal), mal = U.mark[malNamn], stegText = varde(s.texter?.[A.scenNamn] || s.text);
  // flikraden syns inte i designern: peka på KONTORET-knappen först
  if (!mal && malNamn?.startsWith('flik-') && U.mark['design-kontoret']) { malNamn = 'design-kontoret'; mal = U.mark[malNamn]; stegText = 'TRYCK PÅ KONTORET FÖRST. ' + varde(s.text); }
  // konsolspelet: målet finns bara i kontoret – från en annan scen pekar Mio på vägen dit
  else if (!mal && s.kontor && A.scenNamn !== 'kontor' && (U.mark['design-kontoret'] || U.mark['flik-kontor'])) { malNamn = U.mark['design-kontoret'] ? 'design-kontoret' : 'flik-kontor'; mal = U.mark[malNamn]; stegText = 'TRYCK PÅ KONTORET FÖRST. ' + varde(s.text); }
  // steget väntar på att dagarna går men tiden står på paus: peka på 1×
  const vantarPaTid = konsol ? !!s.vantar?.(A) : (h.steg === 9 && G.projekt.length && !G.projekt.some((p) => p.status === 'klar')) || (h.steg === 11 && !G.produkter.some((p) => p.veckor.length > 0));
  if (vantarPaTid && !G.fart && A.scen?.tid !== false && U.mark['fart-1']) { malNamn = 'fart-1'; mal = U.mark[malNamn]; stegText = TIDEN_STAR; }
  A.mioMal = mal ? malNamn : null;
  // ruta (inte under showen – där räcker pilen)
  if (s.baraPil && A.scenNamn === 'show') return pil(A, mal, []);
  const plats = konsol && A.scenNamn in K_PLATS ? K_PLATS[A.scenNamn] : PLATS[A.scenNamn];
  const c = KAP[s.kap], w = plats?.w || 168, rader = radbryt(stegText, w - 36), hh = 35 + rader.length * 7;
  let x, y;
  if (plats) {
    // överkanten y om rutan ryms ovanför nere, annars räknas den upp från nere
    x = plats.x; y = plats.y != null && (plats.nere == null || plats.y + hh <= plats.nere) ? plats.y : plats.nere - hh;
  }
  else { const uppe = mal && mal.y > 100; x = mal && mal.x < 180 && mal.y > 60 && mal.y < 150 ? W - w - 4 : 4; y = uppe ? 28 : Math.min(H - hh - 16, 150); }
  // rutan får aldrig ligga över målet eller pilen: spegla den åt andra sidan, annars upp/ner
  const krock = (xx, yy) => mal && xx < mal.x + mal.w + 14 && mal.x - 14 < xx + w && yy < mal.y + mal.h + 14 && mal.y - 14 < yy + hh;
  if (krock(x, y)) {
    const yAnnan = y < 100 ? H - hh - 16 : 28;
    if (!krock(W - w - x, y)) x = W - w - x; else if (!krock(x, yAnnan)) y = yAnnan; else if (!krock(W - w - x, yAnnan)) { x = W - w - x; y = yAnnan; }
  }
  rect(x + 2, y + 2, w, hh, F.skugga); rect(x, y, w, hh, 0x141828); ram(x, y, w, hh, c);
  hit(x, y, w + 2, hh + 2, { block: true });   // klick på rutan går inte igenom till det som ligger under
  A.mioRuta = { x, y, w: w + 2, h: hh + 2 };   // mål-lappen (notiser.js) lägger sig bredvid rutan
  Vy3d.skymma(A.mioRuta);   // 3D-telefonen ritas inte ovanpå rutan
  U.ctx.drawImage(personSprite(MIO, 'down', 0), 0, 0, 24, 22, x + 4, y + 4, 24, 22);
  // sidosteget i STUDIOS räknas inte som ett eget steg: räknaren visar steget barnet står på
  text(s.kap, x + 32, y + 4, c); text(`${steg} / ${sista}`, x + w - 5, y + 4, F.dim, { just: 'h' });
  rect(x + 32, y + 10, w - 37, 2, F.lo); rect(x + 32, y + 10, Math.round((w - 37) * steg / sista), 2, c);
  text(varde(s.rubrik), x + 32, y + 15, c);
  rader.forEach((r, i) => text(r, x + 32, y + 23 + i * 7, F.text));
  knapp(x + w - 54, y + hh - 9, 50, 7, 'HOPPA ÖVER', { stil: 'dim', klick: () => { h.av = true; } });
  pil(A, mal, [{ x, y, w: w + 2, h: hh + 2 }]);
}
const ror = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const inuti = (a, b) => b.x <= a.x && b.y <= a.y && b.x + b.w >= a.x + a.w && b.y + b.h >= a.y + a.h;
function pil(A, mal, hinder) {
  // ramen runt målet, och pilen på den sida där den inte hamnar på en annan knapp (eller på Mios ruta)
  if (!mal) return;
  const studs = Math.round(Math.sin(A.t * 6) * 2);
  ram(mal.x - 2, mal.y - 2, mal.w + 4, mal.h + 4, F.guld);
  if (Math.floor(A.t * 3) % 2) ram(mal.x - 3, mal.y - 3, mal.w + 6, mal.h + 6, mixa(F.guld, 0x000000, 0.4));
  const ax = Math.round(mal.x + mal.w / 2 - 3), ay = Math.round(mal.y + mal.h / 2 - 3);
  const ovan = { x: ax, y: mal.y - 13, w: 7, h: 11, rita: () => ikon('pil_ned', ax, mal.y - 11 + studs, F.guld) };
  const under = { x: ax, y: mal.y + mal.h + 3, w: 7, h: 11, rita: () => { U.ctx.save(); U.ctx.translate(ax + 7, mal.y + mal.h + 11 - studs); U.ctx.scale(1, -1); ikon('pil_ned', -7, 0, F.guld); U.ctx.restore(); } };
  const vanster = { x: mal.x - 13, y: ay, w: 11, h: 7, rita: () => ikon('hoger', mal.x - 11 + studs, ay, F.guld) };
  const hoger = { x: mal.x + mal.w + 2, y: ay, w: 11, h: 7, rita: () => ikon('vanster', mal.x + mal.w + 4 - studs, ay, F.guld) };
  // knappar och kort i bilden (inte målet självt och inte det som målet ligger i)
  const knappar = U.hits.filter((t) => (t.klick || 'av' in t) && !(t.x === mal.x && t.y === mal.y && t.w === mal.w && t.h === mal.h) && !inuti(mal, t));
  const fri = (r) => r.x >= 0 && r.y >= 0 && r.x + r.w <= W && r.y + r.h <= H && !hinder.some((b) => ror(r, b)) && !knappar.some((b) => ror(r, b));
  const val = (mal.y > 30 ? [ovan, under] : [under, ovan]).concat([vanster, hoger]).find(fri);
  if (val) val.rita();
  // ingen fri plats (t.ex. en flik med knappar ovanför): bara ramen, men tydligare
  else if (Math.floor(A.t * 3) % 2) ram(mal.x - 1, mal.y - 1, mal.w + 2, mal.h + 2, F.guld);
}

// välkomstrutans kapitel: telefonspelets fem och konsolspelets sex (med STUDIOS)
const KAPITEL = [['BYGG', 'STÄLL UT SKRIVBORD', 'hammare'], ['TEAM', 'ANSTÄLL FOLK', 'team'], ['DESIGN', 'RITA EN TELEFON', 'penna'], ['LANSERA', 'SLÄPP DEN', 'mega'], ['VÄX', 'FORSKA OCH VÄX', 'kolv']];
const K_KAPITEL = [['BYGG', 'STÄLL UT SKRIVBORD', 'hammare'], ['TEAM', 'ANSTÄLL FOLK', 'team'], ['DESIGN', 'RITA EN KONSOL', 'penna'], ['LANSERA', 'SLÄPP DEN', 'mega'], ['STUDIOS', 'SPEL TILL KONSOLEN', 'kassett'], ['VÄX', 'FORSKA OCH VÄX', 'kolv']];
function valkomst(A) {
  const G = A.G, h = G.handledning, konsol = G.lage === 'konsol';
  morkna(0, 0, W, H, 0.6);
  hit(0, 0, W, H, { block: true });
  // konsolspelets ruta är bredare: sex kapitel i samma kortbredd (53 px)
  const kap = konsol ? K_KAPITEL : KAPITEL, w = konsol ? 354 : 300, hh = 150, x = Math.round((W - w) / 2), y = (H - hh) / 2;
  panel(x, y, w, hh, { fyll: 0x141828, kant: konsol ? F.lila2 : F.bla2 });
  U.ctx.drawImage(personSprite(MIO, 'down', 0), 0, 0, 24, 30, x + 8, y + 8, 24, 30);
  text('MIO, DIN GUIDE', x + 36, y + 9, F.lila2);
  textB(konsol ? 'ETT TOMT GARAGE 1982 OCH EN STOR IDÉ' : 'ETT TOMT GARAGE OCH EN STOR IDÉ', x + 36, y + 17, F.text);
  stycke(konsol ? `DU HAR STARTAT ${G.bolag.namn} MED TVÅ MILJONER KRONOR. NU BYGGER VI DIN FÖRSTA SPELKONSOL – DET TAR UNGEFÄR TIO MINUTER:`
    : `DU HAR STARTAT ${G.bolag.namn} MED TVÅ MILJONER KRONOR. HÄR ÄR VAD DU SKA GÖRA – DET TAR UNGEFÄR TIO MINUTER:`, x + 36, y + 29, w - 44, F.dim);
  kap.forEach(([k, t, ik], i) => {
    const kx = x + 8 + i * 57, ky = y + 52, c = KAP[k];
    rect(kx, ky, 53, 56, mixa(c, 0x141828, 0.8)); ram(kx, ky, 53, 56, c);
    rect(kx + 15, ky + 5, 22, 22, mixa(c, 0x141828, 0.5)); ikon(ik, kx + 19, ky + 9, c, 2);
    text(k, kx + 26, ky + 32, c, { just: 'c' }); stycke(t, kx + 3, ky + 40, 47, F.dim, { rad: 6 });
  });
  knapp(x + 8, y + hh - 20, 90, 13, 'HOPPA ÖVER', { stil: 'morkt', klick: () => { h.av = true; } });
  knapp(x + w - 128, y + hh - 20, 120, 13, 'NU KÖR VI!', { stil: 'gron', F: BIG, klick: () => { h.steg = 1; A.ljud('klar'); }, namn: 'handledning-start' });
}
