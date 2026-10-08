// HANDLEDNINGEN – förlagans 13 steg i fem kapitel (BYGG → TEAM → DESIGN → LANSERA → VÄX).
// Mio pratar i en ruta, en gul pil pekar på rätt knapp och stegen bockas av när man gjort det.
// Steg 0 är välkomstrutan "Ett tomt garage och en stor idé" (tiden står still medan den visas).
import { U, F, W, H, rect, ram, text, textB, knapp, panel, ikon, hit, stycke, radbryt, morkna, mixa, ljusa, BIG } from '../core/ui.js';
import { personSprite } from '../core/people.js';

const MIO = { skin: '#c68a5c', hair: '#8e5bd1', style: 'long', top: 'tee', shirt: '#e07a2e', accent: '#f4f1ea', bottom: 'jeans', pants: '#2d3a5c', shoes: '#c23b3b', build: 5, glasses: false };
const KAP = { BYGG: F.orange, TEAM: F.rosa, DESIGN: F.gron, LANSERA: F.guld2, 'VÄX': F.bla2 };
export const STEG = [
  null,
  { kap: 'BYGG', rubrik: 'MÖBLERA GARAGET', text: 'KLICKA PÅ BYGG.', mal: 'flik-bygg', klar: (A) => A.scenNamn === 'bygg' },
  { kap: 'BYGG', rubrik: 'STÄLL UT 2 SKRIVBORD', text: 'FÄLLBORDET ÄR GRATIS. VÄLJ DET OCH TRYCK PÅ DE GRÖNA PLATSERNA.', mal: (A) => (U.mark['mobel-fallbord'] && !A.G.flaggor.valtFallbord ? 'mobel-fallbord' : U.mark['plats-bord-0'] && !A.G.kontor.bord[0] ? 'plats-bord-0' : 'plats-bord-1'), klar: (A) => A.G.kontor.bord.filter(Boolean).length >= 2 },
  { kap: 'BYGG', rubrik: 'KLART!', text: 'TRYCK KLAR FÖR ATT GÅ TILLBAKA TILL KONTORET.', mal: 'bygg-klar', klar: (A) => A.scenNamn === 'kontor' },
  { kap: 'TEAM', rubrik: 'ANSTÄLL DITT TEAM', text: 'KLICKA PÅ PERSONAL.', mal: 'flik-personal', klar: (A) => A.scenNamn === 'personal' || A.G.personal.length >= 2 },
  { kap: 'TEAM', rubrik: 'ANSTÄLL 2 PERSONER', text: 'VERA ÄR FORSKARE – HON GÖR TELEFONERNA BÄTTRE. LYKKE ÄR BUGGFIXARE. ANSTÄLL BÅDA.', mal: 'anstall-0', klar: (A) => A.G.personal.length >= 2 },
  { kap: 'DESIGN', rubrik: 'DAGS ATT RITA', text: 'KLICKA PÅ DESIGN.', mal: 'flik-design', klar: (A) => A.scenNamn === 'design' || A.G.projekt.length > 0 },
  { kap: 'DESIGN', rubrik: 'GÖR DEN TILL DIN', text: 'BLÄDDRA GENOM STEGEN MED FORTSÄTT – ELLER HOPPA TILL GRANSKNINGEN – OCH TRYCK STARTA UTVECKLING.', mal: () => (U.mark['design-starta'] ? 'design-starta' : 'design-hoppa'), klar: (A) => A.G.projekt.length > 0 || A.G.produkter.length > 0 },
  { kap: 'LANSERA', rubrik: 'SPOLA FRAM TIDEN', text: 'TEAMET BYGGER NU. TRYCK 4× FÖR ATT GÅ FORTARE.', mal: 'fart-4', klar: (A) => A.G.fart >= 4 || A.G.projekt.some((p) => p.status === 'klar') || A.G.produkter.length > 0 },
  { kap: 'LANSERA', rubrik: 'LANSERA!', text: 'NÄR TELEFONEN ÄR KLAR: TRYCK LANSERA, VÄLJ REKLAM OCH LANSERA.', mal: () => (U.mark['lansera'] ? 'lansera' : 'kontor-lansera'), klar: (A) => A.G.produkter.length > 0 },
  { kap: 'LANSERA', rubrik: 'SHOWEN', text: 'NU AVSLÖJAS BETYGET! TEKNIK, DESIGN OCH PUTS AVGÖR.', mal: 'show-klar', baraPil: true, klar: (A) => A.scenNamn !== 'show' && A.G.produkter.length > 0 },
  { kap: 'LANSERA', rubrik: 'FÖRSTA VECKAN', text: 'TELEFONEN SÄLJER VARJE DAG. TITTA I TELEFONER EFTER EN VECKA.', mal: 'flik-telefoner', klar: (A) => A.G.produkter.some((p) => p.veckor.length > 0) && A.scenNamn === 'telefoner' },
  { kap: 'VÄX', rubrik: 'UPPFINN NY TEKNIK', text: 'FORSKAREN TJÄNAR FORSKNINGSPOÄNG (FP). KLICKA PÅ FORSKNING.', mal: 'flik-forskning', klar: (A) => A.scenNamn === 'forskning' },
  { kap: 'VÄX', rubrik: 'STARTA FORSKNING', text: 'KLICKA PÅ GPS OCH STARTA DEN. DÅ FÅR NÄSTA TELEFON EN NY FUNKTION.', mal: () => (U.mark['starta-forskning'] ? 'starta-forskning' : 'redo-funk-gps'), klar: (A) => A.G.forskning.pagar.length > 0 || A.G.forskning.klara.length > 0 },
];

export function handledningAktiv(A) { const h = A.G?.handledning; return !!(h && !h.klar && !h.av && h.steg === 0 && A.scenNamn !== 'start'); }

export function ritaHandledning(A, dt) {
  const G = A.G, h = G.handledning;
  if (!h || h.klar || h.av) return;
  if (h.steg === 0) return valkomst(A);
  const s = STEG[h.steg];
  if (!s) { h.klar = true; return; }
  if (s.klar(A)) { h.steg++; A.ljud('klick'); if (h.steg >= STEG.length) { h.klar = true; G.flaggor.handledningKlar = true; } return; }
  if (A.scenNamn === 'bygg' && U.mark['mobel-fallbord'] && U.mus.ned) G.flaggor.valtFallbord = true;
  let malNamn = typeof s.mal === 'function' ? s.mal(A) : s.mal, mal = U.mark[malNamn], stegText = s.text;
  // flikraden syns inte i designern: peka på KONTORET-knappen först
  if (!mal && malNamn.startsWith('flik-') && U.mark['design-kontoret']) { malNamn = 'design-kontoret'; mal = U.mark[malNamn]; stegText = 'TRYCK PÅ KONTORET FÖRST. ' + s.text; }
  // ruta (inte under showen – där räcker pilen)
  if (s.baraPil && A.scenNamn === 'show') return pil(A, mal);
  const c = KAP[s.kap], w = 168, rader = radbryt(stegText, w - 36), hh = 35 + rader.length * 7;
  const uppe = mal && mal.y > 100;
  const x = mal && mal.x < 180 && mal.y > 60 && mal.y < 150 ? W - w - 4 : 4, y = uppe ? 28 : Math.min(H - hh - 16, 150);
  rect(x + 2, y + 2, w, hh, F.skugga); rect(x, y, w, hh, 0x141828); ram(x, y, w, hh, c);
  U.ctx.drawImage(personSprite(MIO, 'down', 0), 0, 0, 24, 22, x + 4, y + 4, 24, 22);
  text(s.kap, x + 32, y + 4, c); text(`${h.steg} / 13`, x + w - 5, y + 4, F.dim, { just: 'h' });
  rect(x + 32, y + 10, w - 37, 2, F.lo); rect(x + 32, y + 10, Math.round((w - 37) * h.steg / 13), 2, c);
  text(s.rubrik, x + 32, y + 15, c);
  rader.forEach((r, i) => text(r, x + 32, y + 23 + i * 7, F.text));
  knapp(x + w - 54, y + hh - 9, 50, 7, 'HOPPA ÖVER', { stil: 'dim', klick: () => { h.av = true; } });
  pil(A, mal);
}
function pil(A, mal) {
  // pilen och ramen runt målet
  if (mal) {
    const studs = Math.round(Math.sin(A.t * 6) * 2);
    ram(mal.x - 2, mal.y - 2, mal.w + 4, mal.h + 4, F.guld);
    if (Math.floor(A.t * 3) % 2) ram(mal.x - 3, mal.y - 3, mal.w + 6, mal.h + 6, mixa(F.guld, 0x000000, 0.4));
    const ax = Math.round(mal.x + mal.w / 2 - 3), ovan = mal.y > 30;
    if (ovan) { ikon('pil_ned', ax, mal.y - 11 + studs, F.guld); }
    else { U.ctx.save(); U.ctx.translate(ax + 7, mal.y + mal.h + 11 - studs); U.ctx.scale(1, -1); ikon('pil_ned', -7, 0, F.guld); U.ctx.restore(); }
  }
}

function valkomst(A) {
  const G = A.G, h = G.handledning;
  morkna(0, 0, W, H, 0.6);
  hit(0, 0, W, H, { block: true });
  const w = 300, hh = 150, x = (W - w) / 2, y = (H - hh) / 2;
  panel(x, y, w, hh, { fyll: 0x141828, kant: F.bla2 });
  U.ctx.drawImage(personSprite(MIO, 'down', 0), 0, 0, 24, 30, x + 8, y + 8, 24, 30);
  text('MIO, DIN GUIDE', x + 36, y + 9, F.lila2);
  textB('ETT TOMT GARAGE OCH EN STOR IDÉ', x + 36, y + 17, F.text);
  stycke(`DU HAR STARTAT ${G.bolag.namn} MED TVÅ MILJONER KRONOR. HÄR ÄR VAD DU SKA GÖRA – DET TAR UNGEFÄR TIO MINUTER:`, x + 36, y + 29, w - 44, F.dim);
  const kap = [['BYGG', 'STÄLL UT SKRIVBORD', 'hammare'], ['TEAM', 'ANSTÄLL FOLK', 'team'], ['DESIGN', 'RITA EN TELEFON', 'penna'], ['LANSERA', 'SLÄPP DEN', 'mega'], ['VÄX', 'FORSKA OCH VÄX', 'kolv']];
  kap.forEach(([k, t, ik], i) => {
    const kx = x + 8 + i * 57, ky = y + 52, c = KAP[k];
    rect(kx, ky, 53, 56, mixa(c, 0x141828, 0.8)); ram(kx, ky, 53, 56, c);
    rect(kx + 15, ky + 5, 22, 22, mixa(c, 0x141828, 0.5)); ikon(ik, kx + 19, ky + 9, c, 2);
    text(k, kx + 26, ky + 32, c, { just: 'c' }); stycke(t, kx + 3, ky + 40, 47, F.dim, { rad: 6 });
  });
  knapp(x + 8, y + hh - 20, 90, 13, 'HOPPA ÖVER', { stil: 'morkt', klick: () => { h.av = true; } });
  knapp(x + w - 128, y + hh - 20, 120, 13, 'NU KÖR VI!', { stil: 'gron', F: BIG, klick: () => { h.steg = 1; A.ljud('klar'); }, namn: 'handledning-start' });
}
