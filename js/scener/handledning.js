// HANDLEDNINGEN – förlagans 13 steg i fem kapitel (BYGG → TEAM → DESIGN → LANSERA → VÄX).
// Mio pratar i en ruta, en gul pil pekar på rätt knapp och stegen bockas av när man gjort det.
// Steg 0 är välkomstrutan "Ett tomt garage och en stor idé" (tiden står still medan den visas).
import { U, F, W, H, rect, ram, text, textB, knapp, panel, ikon, hit, stycke, radbryt, morkna, mixa, ljusa, BIG } from '../core/ui.js';
import { personSprite } from '../core/people.js';
import * as Vy3d from '../telefon/vy3d.js';

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
  { kap: 'LANSERA', rubrik: 'SPOLA FRAM TIDEN', text: 'TEAMET BYGGER NU. TRYCK 4× FÖR ATT GÅ FORTARE.', mal: 'fart-4', klar: (A) => (A.G.fart >= 4 && A.G.projekt.length > 0) || A.G.projekt.some((p) => p.status === 'klar') || A.G.produkter.length > 0 },
  { kap: 'LANSERA', rubrik: 'LANSERA!', text: 'NÄR TELEFONEN ÄR KLAR: TRYCK LANSERA, VÄLJ REKLAM OCH LANSERA.', texter: { lansering: 'VÄLJ REKLAM OCH TRYCK PÅ LANSERA!' }, mal: () => (U.mark['lansera'] ? 'lansera' : 'kontor-lansera'), klar: (A) => A.G.produkter.length > 0 },
  { kap: 'LANSERA', rubrik: 'SHOWEN', text: 'NU AVSLÖJAS BETYGET! TEKNIK, DESIGN OCH PUTS AVGÖR.', mal: 'show-klar', baraPil: true, klar: (A) => A.scenNamn !== 'show' && A.G.produkter.length > 0 },
  { kap: 'LANSERA', rubrik: 'FÖRSTA VECKAN', text: 'TELEFONEN SÄLJER VARJE DAG. TITTA I TELEFONER EFTER EN VECKA.', texter: { telefoner: 'HÄR SER DU VAD TELEFONEN SÄLJER. LÅT TIDEN GÅ EN VECKA.' }, mal: (A) => (A.scenNamn === 'telefoner' ? null : 'flik-telefoner'), klar: (A) => A.G.produkter.some((p) => p.veckor.length > 0) && A.scenNamn === 'telefoner' },
  { kap: 'VÄX', rubrik: 'UPPFINN NY TEKNIK', text: 'FORSKAREN TJÄNAR FORSKNINGSPOÄNG (FP). KLICKA PÅ FORSKNING.', mal: 'flik-forskning', klar: (A) => A.scenNamn === 'forskning' },
  { kap: 'VÄX', rubrik: 'STARTA FORSKNING', text: 'KLICKA PÅ GPS OCH STARTA DEN. DÅ FÅR NÄSTA TELEFON EN NY FUNKTION.', mal: () => (U.mark['starta-forskning'] ? 'starta-forskning' : 'redo-funk-gps'), klar: (A) => A.G.forskning.pagar.length > 0 || A.G.forskning.klara.length > 0 },
];

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
const TIDEN_STAR = 'TIDEN STÅR STILL. TRYCK PÅ 1× SÅ ATT DAGARNA GÅR.';

export function ritaHandledning(A, dt) {
  const G = A.G, h = G.handledning;
  if (!h || h.klar || h.av) return;
  if (h.steg === 0) return valkomst(A);
  // bygget avbröts (eller designern stängdes) innan någon telefon fanns: tillbaka till DAGS ATT RITA
  if (h.steg >= 7 && h.steg <= 9 && !G.projekt.length && !G.produkter.length && !(h.steg === 7 && A.scenNamn === 'design')) h.steg = 6;
  const s = STEG[h.steg];
  if (!s) { h.klar = true; return; }
  if (s.klar(A)) { h.steg++; A.ljud('klick'); if (h.steg >= STEG.length) { h.klar = true; G.flaggor.handledningKlar = true; } return; }
  if (A.scenNamn === 'bygg' && U.mark['mobel-fallbord'] && U.mus.ned) G.flaggor.valtFallbord = true;
  let malNamn = typeof s.mal === 'function' ? s.mal(A) : s.mal, mal = U.mark[malNamn], stegText = s.texter?.[A.scenNamn] || s.text;
  // flikraden syns inte i designern: peka på KONTORET-knappen först
  if (!mal && malNamn?.startsWith('flik-') && U.mark['design-kontoret']) { malNamn = 'design-kontoret'; mal = U.mark[malNamn]; stegText = 'TRYCK PÅ KONTORET FÖRST. ' + s.text; }
  // steget väntar på att dagarna går men tiden står på paus: peka på 1×
  const vantarPaTid = (h.steg === 9 && G.projekt.length && !G.projekt.some((p) => p.status === 'klar')) || (h.steg === 11 && !G.produkter.some((p) => p.veckor.length > 0));
  if (vantarPaTid && !G.fart && A.scen?.tid !== false && U.mark['fart-1']) { malNamn = 'fart-1'; mal = U.mark[malNamn]; stegText = TIDEN_STAR; }
  // ruta (inte under showen – där räcker pilen)
  if (s.baraPil && A.scenNamn === 'show') return pil(A, mal, []);
  const plats = PLATS[A.scenNamn];
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
  text(s.kap, x + 32, y + 4, c); text(`${h.steg} / 13`, x + w - 5, y + 4, F.dim, { just: 'h' });
  rect(x + 32, y + 10, w - 37, 2, F.lo); rect(x + 32, y + 10, Math.round((w - 37) * h.steg / 13), 2, c);
  text(s.rubrik, x + 32, y + 15, c);
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
