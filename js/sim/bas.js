// Grundverktyg för simuleringen: speltid, format för pengar/tal och en sparbar slumpgenerator.
// Ingen DOM här – hela js/sim går att köra i Node (tools/sim-test.mjs).
// Formaten följer språket (js/core/i18n.js): engelska visar dollar = kronor / 10, punkt som decimaltecken
// och komma mellan tusental. I Node är språket alltid svenska.
import { LANG, $t, $n } from '../core/i18n.js';
const EN = LANG === 'en';

// ---------- tid: dag 0 = 1 januari 2007 ----------
export const DAG0 = Date.UTC(2007, 0, 1);
const MS = 864e5;
export const datumAv = (dag) => new Date(DAG0 + Math.floor(dag) * MS);
export const arAv = (dag) => datumAv(dag).getUTCFullYear();
export const dagForAr = (ar) => Math.round((Date.UTC(ar, 0, 1) - DAG0) / MS);
export const arsdel = (dag) => { const a = arAv(dag), d0 = dagForAr(a), d1 = dagForAr(a + 1); return a + (dag - d0) / (d1 - d0); };
// $n: nycklar för översättningen (tools/i18n-nycklar.mjs) – texten slås upp med $t där den visas
export const MANADER = [$n('JAN'), $n('FEB'), $n('MAR'), $n('APR'), $n('MAJ'), $n('JUN'), $n('JUL'), $n('AUG'), $n('SEP'), $n('OKT'), $n('NOV'), $n('DEC')];
export const MANADER_LANG = [$n('JANUARI'), $n('FEBRUARI'), $n('MARS'), $n('APRIL'), $n('MAJ'), $n('JUNI'), $n('JULI'), $n('AUGUSTI'), $n('SEPTEMBER'), $n('OKTOBER'), $n('NOVEMBER'), $n('DECEMBER')];
export const datumText = (dag) => { const d = datumAv(dag), m = $t(MANADER[d.getUTCMonth()]); return EN ? `${m} ${d.getUTCDate()} ${d.getUTCFullYear()}` : `${d.getUTCDate()} ${m} ${d.getUTCFullYear()}`; };
export const manadText = (dag) => { const d = datumAv(dag); return `${$t(MANADER_LANG[d.getUTCMonth()])} ${d.getUTCFullYear()}`; };
export const forstaIManaden = (dag) => datumAv(dag).getUTCDate() === 1;
export const nyarsdag = (dag) => { const d = datumAv(dag); return d.getUTCMonth() === 0 && d.getUTCDate() === 1; };
export const dagIAret = (dag) => dag - dagForAr(arAv(dag));

// ---------- format ----------
const grupp = (n) => String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, EN ? ',' : ' ');
export const tal = (n) => (n < 0 ? '-' : '') + grupp(n);
export const dec = (x, d = 1) => (x < 0 ? '-' : '') + (EN ? Math.abs(x).toFixed(d) : Math.abs(x).toFixed(d).replace('.', ','));
// engelska: $66, $40K, $1.2M, $1.5B (kort = förkortat redan från tusental)
function dollar(n, kort) {
  const a = Math.abs(n), s = n < 0 ? '-' : '';
  if (a >= 1e8) return s + '$' + dec(a / 1e9, a >= 1e10 ? 0 : 1) + 'B';
  if (a >= 1e6 || (kort && a >= 1e5)) return s + '$' + dec(a / 1e6) + 'M';
  if (kort && a >= 1e3) return s + '$' + Math.round(a / 1e3) + 'K';
  return s + '$' + grupp(a);
}
export function kr(n, kort = false) {
  if (EN) return dollar(n / 10, kort);
  const a = Math.abs(n), s = n < 0 ? '-' : '';
  if (a >= 1e9) return s + dec(a / 1e9) + ' MDR' + (kort ? '' : ' KR');
  if (a >= 1e7 || (kort && a >= 1e6)) return s + dec(a / 1e6) + ' MKR';
  if (kort && a >= 1e4) return s + Math.round(a / 1e3) + ' TKR';
  return s + grupp(a) + ' KR';
}
export const proc = (x) => Math.round(x * 100) + (EN ? '%' : ' %');
export const betygText = (b) => dec(b, 1);

// ---------- slump (mulberry32, tillståndet sparas i spelet) ----------
export function slump(G) {
  let t = (G.rng = (G.rng + 0x6d2b79f5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export const slumpInt = (G, a, b) => a + Math.floor(slump(G) * (b - a + 1));
export const valj = (G, lista) => lista[Math.floor(slump(G) * lista.length)];
// avrunda slumpvis så att 2,3 blir 2 i 70 % och 3 i 30 % av fallen
export const slumpRund = (G, x) => { const f = Math.floor(x); return f + (slump(G) < x - f ? 1 : 0); };
export const klamp = (v, a, b) => Math.max(a, Math.min(b, v));
