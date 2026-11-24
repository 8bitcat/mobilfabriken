// SPRÅKEN – Carl 2026-11-24: "vi ska ha engelska" (App Store-namnet Smartphone Empire).
//
// Svenskan är källan. Varje text som spelaren ser skrivs på svenska i koden och slås upp i det valda
// språkets ordlista (js/i18n/<id>.js, en tabell svensk text → översättning). Saknas en översättning visas
// svenskan – inget går sönder medan översättningen pågår. Samma upplägg som Snabbfilen (docs/SPRAK.md där).
//
//   $t`TEAMET BÖRJAR BYGGA ${namn}`   mall: nyckeln blir "TEAMET BÖRJAR BYGGA {0}"
//   $t('NYTT SPEL')                    vanlig text
//   $tf('KÖPTE {0} ST', n)             färdig mall (t.ex. i en tabell)
//   $n('GARAGE')                       text som också är id i logiken: lämnas orörd, översätts vid visning med $t(x)
//   LANG, LANGS, setLang(id)           valt språk, alla språk, byt (sparas och laddar om sidan)
//
// Pengar, tal och datum: js/sim/bas.js (kr, tal, dec, proc, datumText) läser LANG. Engelska visar dollar =
// kronor / 10 (förlagan Build a Phone Empire räknar i dollar, spelet i kronor × 10).
//
// Språket väljs: ?lang=xx → sparat val (mobilfabriken.lang) → enhetens språk → engelska. Testrobotarna
// (navigator.webdriver) spelar på svenska om inte ?lang= står i adressen. I Node (simuleringen, verktygen)
// alltid svenska. Ordlistan laddas med top-level await, så varje modul som importerar $t har den redan.
export const LANGS = [
  { id: 'sv', name: 'SVENSKA', locale: 'sv-SE' },
  { id: 'en', name: 'ENGLISH', locale: 'en-US' },
];
const KEY = 'mobilfabriken.lang';
const known = (id) => LANGS.some((l) => l.id === id);
function pick() {
  if (typeof window === 'undefined') return 'sv';
  try { const q = new URLSearchParams(location.search).get('lang'); if (known(q)) return q; } catch { /* ok */ }
  try { const s = localStorage.getItem(KEY); if (known(s)) return s; } catch { /* privat läge */ }
  if (typeof navigator !== 'undefined' && navigator.webdriver) return 'sv';
  for (const l of (typeof navigator !== 'undefined' && (navigator.languages?.length ? navigator.languages : [navigator.language])) || []) {
    const id = String(l || '').slice(0, 2).toLowerCase();
    if (known(id)) return id;
    if (['nb', 'nn', 'no', 'da'].includes(id)) return 'sv';   // grannspråken läser svenska bättre än engelska
  }
  return 'en';
}
export const LANG = pick();
export const LANG_INFO = LANGS.find((l) => l.id === LANG);
export const EN = LANG === 'en';
if (typeof document !== 'undefined') document.documentElement.lang = LANG;

let DICT = {};
if (LANG !== 'sv') {
  try { const m = await import(`../i18n/${LANG}.js`); DICT = m.default || {}; } catch (e) { console.warn(`språket ${LANG} kunde inte laddas:`, e); }
}
// texter som saknar översättning (verktygen läser window.__i18nMiss)
const MISS = new Set();
if (typeof window !== 'undefined') window.__i18nMiss = MISS;
function look(key) {
  const v = DICT[key];
  if (typeof v === 'string') return v;
  if (LANG !== 'sv') MISS.add(key);
  return key;
}
const fill = (s, vals) => s.replace(/\{(\d+)\}/g, (_, i) => { const v = vals[+i]; return v === undefined || v === null ? '' : String(v); });
const keyOf = (parts) => parts.reduce((a, p, i) => a + (i ? `{${i - 1}}` : '') + p, '');
// mallarna anropas i ritlooparna varje bildruta: översättningen per anropsställe slås upp en gång
const TPL = new WeakMap();
function compiled(parts) {
  let c = TPL.get(parts);
  if (c) return c;
  const key = keyOf(parts), tr = look(key), segs = [];
  let last = 0;
  tr.replace(/\{(\d+)\}/g, (m, i, at) => { segs.push(tr.slice(last, at), +i); last = at + m.length; return m; });
  segs.push(tr.slice(last));
  c = { segs };
  if (typeof DICT[key] === 'string') TPL.set(parts, c);
  return c;
}
export function $t(s, ...vals) {
  if (Array.isArray(s) && s.raw) {
    if (LANG === 'sv') { let out = s[0]; for (let i = 1; i < s.length; i++) out += vals[i - 1] + s[i]; return out; }
    const { segs } = compiled(s);
    let out = '';
    for (const x of segs) { if (typeof x === 'string') out += x; else { const v = vals[x]; out += v === undefined || v === null ? '' : String(v); } }
    return out;
  }
  if (s === undefined || s === null) return '';
  return LANG === 'sv' ? String(s) : look(String(s));
}
export const $tf = (key, ...vals) => fill($t(key), vals);
export const $n = (s) => s;
export function setLang(id) {
  if (!known(id) || id === LANG) return;
  try { localStorage.setItem(KEY, id); } catch { /* ok */ }
  try { window.dispatchEvent(new Event('mf:fore-omladdning')); } catch { /* ok */ }
  const u = new URL(location.href); u.searchParams.delete('lang');
  location.replace(u.toString());
}
