// Personalen: kandidater, anställa, sparka, teamfest och moral.
//   FORSKARE ger blå kvalitetsprickar under bygget och 0,6 FP per dag (× kraft × moral × datorer)
//   BUGGFIXARE stoppar buggar och lagar röda buggprickar
// Moral = 50 + 3 × trivsel − 5 × (anställda över 2) + fest. Moralfaktor = 0,75 + moral/200 (50 → 1,0).
// Låg moral gör folk långsammare – ingen säger upp sig (familjespel).
import { makeLook } from '../core/people.js';
import { LON, KRAFT, ROLLER, FORNAMN, kontorAv } from '../data/varld.js';
import { slump, slumpInt, valj, klamp } from './bas.js';
import { betala, signal, nyhet } from './spel.js';
import { kontorsVarden } from './kontor.js';

// Vera och Lykke från stilprovet ligger överst första gången
const VERA = { skin: '#f6d7bf', hair: '#b7392b', style: 'bun', top: 'sweater', shirt: '#3a7bd5', accent: '#e8e3d6', bottom: 'pants', pants: '#7a2e3e', shoes: '#1c1c1c', glasses: 'round', build: 5, blush: true };
const LYKKE = { skin: '#eec3a0', hair: '#ecd489', style: 'ponytail', top: 'hoodie', shirt: '#f0b4c8', accent: '#f4f1ea', bottom: 'skirt', pants: '#e8e3d6', shoes: '#f2f2f2', phones: true, phoneColor: '#e8e8e8', build: 4, blush: true };

let nr = 0;
function kandidat(G, roll, stj, namn = null, look = null) {
  const [a, b] = LON[stj];
  return {
    id: 'p' + G.dag + '-' + (++nr) + '-' + Math.floor(slump(G) * 1e6).toString(36), namn: namn || valj(G, FORNAMN), roll, stjarnor: stj, kraft: KRAFT[stj],
    lon: Math.round((a + slump(G) * (b - a)) / 50) * 50, alder: slumpInt(G, 18, 58), look: look || makeLook(() => slump(G)),
  };
}
export function startKandidater(G) {
  G.kandidater = [kandidat(G, 'forskare', 1, 'VERA', VERA), kandidat(G, 'buggfixare', 1, 'LYKKE', LYKKE)];
  G.kandidater[0].lon = 15_000; G.kandidater[1].lon = 16_500; G.kandidater[0].alder = 29; G.kandidater[1].alder = 24;
  for (let i = 0; i < 4; i++) G.kandidater.push(nyKandidat(G));
}
export function maxStjarnor(G) { const v = kontorsVarden(G); return Math.max(1, Math.min(kontorAv(G.kontor.niva).tak, Math.floor(v.kontorStj) + 2)); }
export function nyKandidat(G) {
  const max = maxStjarnor(G);
  let stj = 1; while (stj < max && slump(G) < 0.45) stj++;
  return kandidat(G, slump(G) < 0.5 ? 'forskare' : 'buggfixare', stj);
}
// den 1:a varje månad: 3 nya, max 6 synliga
export function manadsKandidater(G) {
  for (let i = 0; i < 3; i++) G.kandidater.unshift(nyKandidat(G));
  G.kandidater.length = Math.min(G.kandidater.length, 6);
}
export const omrullPris = (G) => (G.dag - G.omrullDag >= 30 ? 0 : 10_000);
export function omrull(G) {
  const pris = omrullPris(G); if (G.bolag.kassa < pris) return { ok: false, fel: 'FÖR LITE PENGAR' };
  if (pris) betala(G, pris, 'personal'); else G.omrullDag = G.dag;
  G.kandidater = []; for (let i = 0; i < 6; i++) G.kandidater.push(nyKandidat(G));
  return { ok: true };
}
export const ledigaBord = (G) => G.kontor.bord.map((b, i) => (b && !G.personal.some((p) => p.bord === i) ? i : -1)).filter((i) => i >= 0);
export function anstall(G, id) {
  const k = G.kandidater.find((x) => x.id === id); if (!k) return { ok: false, fel: 'FINNS INTE' };
  const lediga = ledigaBord(G);
  if (!lediga.length) return { ok: false, fel: G.kontor.bord.some(Boolean) ? 'ALLA BORD ÄR UPPTAGNA – STÄLL UT FLER I BYGG' : 'STÄLL UT ETT BORD FÖRST (BYGG)' };
  G.kandidater = G.kandidater.filter((x) => x !== k);
  G.personal.push({ ...k, bord: lediga[0], anstalldDag: G.dag, erfarenhet: 0 });
  nyhet(G, 'DU', `${k.namn} BÖRJAR SOM ${ROLLER[k.roll].namn} HOS ${G.bolag.namn}.`);
  return { ok: true };
}
export function sparka(G, id) {
  const i = G.personal.findIndex((p) => p.id === id); if (i < 0) return { ok: false };
  const p = G.personal.splice(i, 1)[0]; G.kandidater.unshift({ ...p, bord: undefined });
  G.kandidater.length = Math.min(G.kandidater.length, 6);
  return { ok: true };
}
export const festPris = (G) => 5_000 * G.personal.length;
export function teamfest(G) {
  const pris = festPris(G); if (!G.personal.length) return { ok: false, fel: 'INGEN ATT FIRA MED' };
  if (G.bolag.kassa < pris) return { ok: false, fel: 'FÖR LITE PENGAR' };
  betala(G, pris, 'personal'); G.fest = 25; G.flaggor.fest = G.dag;
  signal(G, 'toast', { text: 'TEAMFEST! MORALEN STIGER.', farg: 'lila' });
  return { ok: true };
}
// nivå upp efter ett år i en lokal som tillåter nästa stjärna: kostar en månadslön
export function kanTrana(G, p) { return p.stjarnor < kontorAv(G.kontor.niva).tak && G.dag - (p.tranadDag ?? p.anstalldDag) >= 365; }
export function trana(G, id) {
  const p = G.personal.find((x) => x.id === id); if (!p || !kanTrana(G, p)) return { ok: false, fel: 'INTE ÄN' };
  if (G.bolag.kassa < p.lon) return { ok: false, fel: 'FÖR LITE PENGAR' };
  betala(G, p.lon, 'personal'); p.stjarnor++; p.kraft = KRAFT[p.stjarnor]; p.lon = Math.round(LON[p.stjarnor][0] / 50) * 50; p.tranadDag = G.dag;
  signal(G, 'toast', { text: `${p.namn} ÄR NU ${'★'.repeat(p.stjarnor)}!`, farg: 'guld' });
  return { ok: true };
}

export function moralMal(G) {
  const v = kontorsVarden(G);
  return klamp(50 + 3 * v.trivsel - 5 * Math.max(0, G.personal.length - 2) + G.fest, 0, 100);
}
export const moralFaktor = (G) => 0.75 + G.moral / 200;
export function dagligMoral(G) {
  const mal = moralMal(G);
  G.moral += klamp(mal - G.moral, -5, 5);
  if (G.fest > 0) G.fest = Math.max(0, G.fest - 1);
}
export const lonPerManad = (G) => G.personal.reduce((s, p) => s + p.lon, 0);
export function fpPerDag(G) {
  const v = kontorsVarden(G), mf = moralFaktor(G);
  return G.personal.filter((p) => p.roll === 'forskare').reduce((s, p) => s + 0.6 * p.kraft * mf * v.forskning, 0) * (G.arv ? 1 + 0.1 * G.arv.saldaBolag : 1);
}
// vad en sur figur ber om (pratbubbla i kontoret)
export function onskemal(G) {
  if (G.moral >= 45) return null;
  const v = kontorsVarden(G);
  if (v.trivsel < 3) return 'KAN VI FÅ EN SOFFA?';
  if (!G.flaggor.fest || G.dag - G.flaggor.fest > 120) return 'NÄR HAR VI FEST NÄST?';
  return 'DET ÄR TRÅNGT HÄR...';
}
