// Grundverktyg för simuleringen: speltid, format för pengar/tal och en sparbar slumpgenerator.
// Ingen DOM här – hela js/sim går att köra i Node (tools/sim-test.mjs).

// ---------- tid: dag 0 = 1 januari 2007 ----------
export const DAG0 = Date.UTC(2007, 0, 1);
const MS = 864e5;
export const datumAv = (dag) => new Date(DAG0 + Math.floor(dag) * MS);
export const arAv = (dag) => datumAv(dag).getUTCFullYear();
export const dagForAr = (ar) => Math.round((Date.UTC(ar, 0, 1) - DAG0) / MS);
export const arsdel = (dag) => { const a = arAv(dag), d0 = dagForAr(a), d1 = dagForAr(a + 1); return a + (dag - d0) / (d1 - d0); };
export const MANADER = ['JAN', 'FEB', 'MAR', 'APR', 'MAJ', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEC'];
export const MANADER_LANG = ['JANUARI', 'FEBRUARI', 'MARS', 'APRIL', 'MAJ', 'JUNI', 'JULI', 'AUGUSTI', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DECEMBER'];
export const datumText = (dag) => { const d = datumAv(dag); return `${d.getUTCDate()} ${MANADER[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
export const manadText = (dag) => { const d = datumAv(dag); return `${MANADER_LANG[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
export const forstaIManaden = (dag) => datumAv(dag).getUTCDate() === 1;
export const nyarsdag = (dag) => { const d = datumAv(dag); return d.getUTCMonth() === 0 && d.getUTCDate() === 1; };
export const dagIAret = (dag) => dag - dagForAr(arAv(dag));

// ---------- format ----------
const grupp = (n) => String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
export const tal = (n) => (n < 0 ? '-' : '') + grupp(n);
export const dec = (x, d = 1) => (x < 0 ? '-' : '') + Math.abs(x).toFixed(d).replace('.', ',');
export function kr(n, kort = false) {
  const a = Math.abs(n), s = n < 0 ? '-' : '';
  if (a >= 1e9) return s + dec(a / 1e9) + ' MDR' + (kort ? '' : ' KR');
  if (a >= 1e7 || (kort && a >= 1e6)) return s + dec(a / 1e6) + ' MKR';
  if (kort && a >= 1e4) return s + Math.round(a / 1e3) + ' TKR';
  return s + grupp(a) + ' KR';
}
export const proc = (x) => Math.round(x * 100) + ' %';
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
