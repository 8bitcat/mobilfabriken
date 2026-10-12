// Kontoret: möblerna och vad de ger. Arbetsplatser (bord + dator + stol), golv- och väggplatser.
//   ARBETSFART = medel av borden · FORSKNING × = 1 + medel av datorerna · BUGGFIX × = 1 + summan av labbet
//   TRIVSEL = summan av allt · KONTOR ★ = medelstjärnan av allt som står där
import { MOBEL } from '../data/katalog.js';
import { KONTOR, kontorAv } from '../data/varld.js';
import { betala, intakt, signal, nyhet, PLATSER } from './spel.js';

const ORDNING = KONTOR.map((k) => k.id);
export const lastOk = (G, m) => !m.las || ORDNING.indexOf(G.kontor.niva) >= ORDNING.indexOf(m.las);

export function kontorsVarden(G) {
  const k = G.kontor, bord = k.bord.filter(Boolean);
  let trivsel = 0, buggfix = 0, stj = 0, n = 0;
  const lagg = (id) => { const m = MOBEL[id]; if (!m) return; trivsel += m.bonus.trivsel || 0; buggfix += m.bonus.buggfix || 0; stj += m.stj; n++; };
  let fart = 0, forsk = 0;
  for (const b of bord) { lagg(b.bord); lagg(b.dator); lagg(b.stol); fart += MOBEL[b.bord]?.bonus.arbetsfart || 0; forsk += MOBEL[b.dator]?.bonus.forskning || 0; }
  for (const id of [...k.golv, ...k.vagg]) if (id) lagg(id);
  lagg(k.golvtyp); lagg(k.vaggtyp);
  return {
    bord: bord.length, platser: k.bord.length,
    arbetsfart: bord.length ? fart / bord.length : 0,
    forskning: 1 + (bord.length ? forsk / bord.length : 0),
    buggfix: 1 + buggfix, trivsel,
    kontorStj: n ? stj / n : 0, trivselStj: Math.min(5, trivsel / 10), prodStj: Math.min(5, (bord.length ? fart / bord.length : 0) * 100 / 3),
  };
}

// ställ en möbel på en plats. plats = { typ: 'bord'|'golv'|'vagg'|'golvtyp'|'vaggtyp', i, del?: 'bord'|'dator'|'stol' }
export function placera(G, plats, mobelId) {
  const m = MOBEL[mobelId]; if (!m) return { ok: false, fel: 'FINNS INTE' };
  if (!lastOk(G, m)) return { ok: false, fel: 'KRÄVER ' + kontorAv(m.las).namn };
  const k = G.kontor;
  // finns den i förrådet är den gratis
  const iForrad = k.forrad.indexOf(mobelId);
  const pris = iForrad >= 0 ? 0 : m.pris;
  if (G.bolag.kassa < pris) return { ok: false, fel: 'FÖR LITE PENGAR' };
  let gammal = null;
  if (plats.typ === 'bord') {
    if (m.plats === 'bord') { if (k.bord[plats.i]) gammal = k.bord[plats.i].bord; k.bord[plats.i] = { bord: mobelId, dator: k.bord[plats.i]?.dator || 'crt', stol: k.bord[plats.i]?.stol || 'pall' }; }
    else if ((m.plats === 'dator' || m.plats === 'stol') && k.bord[plats.i]) { gammal = k.bord[plats.i][m.plats]; k.bord[plats.i][m.plats] = mobelId; }
    else return { ok: false, fel: 'STÄLL ETT BORD FÖRST' };
  } else if (plats.typ === 'golv' || plats.typ === 'vagg') {
    if (m.plats !== plats.typ) return { ok: false, fel: 'PASSAR INTE HÄR' };
    gammal = k[plats.typ][plats.i]; k[plats.typ][plats.i] = mobelId;
  } else if (plats.typ === 'golvtyp' || plats.typ === 'vaggtyp') {
    if (m.plats !== plats.typ) return { ok: false, fel: 'PASSAR INTE HÄR' };
    gammal = k[plats.typ]; k[plats.typ] = mobelId;
  } else return { ok: false, fel: 'OKÄND PLATS' };
  if (iForrad >= 0) k.forrad.splice(iForrad, 1); else betala(G, pris, 'mobler');
  if (gammal && MOBEL[gammal] && MOBEL[gammal].pris > 0) k.forrad.push(gammal);   // den gamla hamnar i förrådet
  G.flaggor.kopteMobel = true;
  if (pris > 0) G.flaggor.kopteNyMobel = true;   // mål 5: bara ett riktigt köp (inte gratismöbler eller förrådet)
  return { ok: true, pris };
}
// ta bort: hälften av priset tillbaka (förrådet om man vill spara den)
export function taBort(G, plats, salj = true) {
  const k = G.kontor; let id = null;
  if (plats.typ === 'bord') {
    const b = k.bord[plats.i]; if (!b) return;
    if (G.personal.some((p) => p.bord === plats.i)) return { ok: false, fel: 'NÅGON SITTER HÄR' };
    for (const del of ['bord', 'dator', 'stol']) { const m = MOBEL[b[del]]; if (m?.pris) salj ? intakt(G, m.pris / 2, 'mobler') : k.forrad.push(b[del]); }
    k.bord[plats.i] = null; return { ok: true };
  }
  id = k[plats.typ][plats.i]; if (!id) return;
  const m = MOBEL[id]; if (m?.pris) salj ? intakt(G, m.pris / 2, 'mobler') : k.forrad.push(id);
  k[plats.typ][plats.i] = null; return { ok: true };
}

// flytta till nästa kontorsnivå: platserna växer, möblerna följer med (fler platser blir tomma)
export function kravUppfyllt(G, niva) {
  const k = kontorAv(niva); if (!k.krav) return true;
  const c = k.krav;
  if (c.lanserade && G.bolag.lanseringar < c.lanserade) return false;
  if (c.salda && !(G.bolag.totaltSalda >= c.salda)) return false;   // NaN får aldrig släppa igenom kravet
  if (c.enhetstyper && G.bolag.enhetstyper.length < c.enhetstyper) return false;
  if (c.mal && !G.mal.klara.includes(c.mal)) return false;
  return true;
}
export function flytta(G, niva) {
  const k = kontorAv(niva), i = ORDNING.indexOf(niva);
  if (i !== ORDNING.indexOf(G.kontor.niva) + 1) return { ok: false, fel: 'FLYTTA ETT STEG I TAGET' };
  if (!kravUppfyllt(G, niva)) return { ok: false, fel: 'KRAV: ' + k.kravText };
  const pris = Math.round(k.pris * (G.installningar.snabbt ? 0.5 : 1));
  if (G.bolag.kassa < pris) return { ok: false, fel: 'FÖR LITE PENGAR' };
  betala(G, pris, 'kontor');
  const ko = G.kontor, p = PLATSER[niva];
  const fyll = (lista, n) => { const ut = lista.slice(0, n); while (ut.length < n) ut.push(null); for (const x of lista.slice(n)) if (x) ko.forrad.push(typeof x === 'string' ? x : x.bord); return ut; };
  ko.niva = niva; ko.bord = fyll(ko.bord, k.bord); ko.golv = fyll(ko.golv, p.golv); ko.vagg = fyll(ko.vagg, p.vagg);
  nyhet(G, 'DU', `${G.bolag.namn} FLYTTAR IN I ${k.namn === 'HUVUDKONTOR' ? 'ETT EGET HUVUDKONTOR' : 'ETT ' + k.namn}!`);
  signal(G, 'stor', { rubrik: 'NYTT KONTOR!', text: `VÄLKOMMEN TILL ${k.namn}. ${k.bord} ARBETSPLATSER OCH ${k.labb} LABBSPÅR.`, paus: true, konfetti: true });
  return { ok: true };
}
