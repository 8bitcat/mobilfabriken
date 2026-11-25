// BUTIKEN – köp i appen (Carl 2026-11-25: "kan vi redan från första början skapa in game purchases"; valde alla
// fyra förslagen och "Nej, Apples köpruta räcker"). Bara i App Store-appen (Capacitor + @capgo/native-purchases =
// StoreKit 2). På webben finns ingen butik (butikFinns() = false). Samma upplägg som Pixelcity (snabbfilen/js/core/kop.js).
//   • INVESTERARE (liten/stor) – förbrukningsvara: pengar rakt i kassan i bolaget som är öppet. Beloppet följer året
//     (prisnivån), så köpet känns lika mycket 1982 som 2026.
//   • FORSKNINGSPAKET – förbrukningsvara: forskningspoäng (FP/RP) i bolaget som är öppet, växer med åren.
//   • GULDPAKETET – engångsköp: alla sex legendariska ytor (GULD, HOLO, NEON, GALAX, LAVA, KROM) i alla bolag, för alltid.
//   • SUPPORTER – engångsköp: 16× fart (tryck på 8× en gång till) och en tack-rad i menyn.
// Engångsköpen följer Apple-kontot (Återställ köp, och tyst vid varje start). Läget ligger i localStorage
// mobilfabriken.kop, utanför sparningarna: { v, tx, guld, supporter, vantar, logg }. Varje transaktion bokförs EN
// gång (transactionId), så "Be om att få köpa" (transactionUpdated) och Återställ köp aldrig ger dubbelt.
// Inga köpuppmaningar: butiken öppnas bara från MENY, inga rutor dyker upp, ingen figur säger "köp".
// Ett köp som kommer in utan öppet bolag (godkänt senare av en förälder) väntar i `vantar` till nästa bolag öppnas.
import { $t } from './i18n.js';
import { LEGENDARISKA } from '../data/delar.js';
import { arAv } from '../sim/bas.js';
import { prisniva, arKonsolSpel } from '../sim/spel.js';

const SKU = 'io.eightbitcat.mobilfabriken.';
export const PRODUKTER = [
  { id: 'investerare-liten', sku: SKU + 'investerare.liten', typ: 'pengar', bas: 3_000_000, ikon: 'pengar', namn: $t('INVESTERARE'), text: $t('PENGAR RAKT I KASSAN') },
  { id: 'investerare-stor', sku: SKU + 'investerare.stor', typ: 'pengar', bas: 20_000_000, ikon: 'pengar', namn: $t('STOR INVESTERARE'), text: $t('MYCKET PENGAR RAKT I KASSAN') },
  { id: 'forskning', sku: SKU + 'forskning.paket', typ: 'fp', ikon: 'fp', namn: $t('FORSKNINGSPAKET'), text: $t('FORSKNINGSPOÄNG ATT FORSKA FÖR') },
  { id: 'guld', sku: SKU + 'guld', typ: 'guld', ikon: 'stjarna', namn: $t('GULDPAKETET'), text: $t('ALLA SEX LEGENDARISKA YTOR I ALLA BOLAG') },
  { id: 'supporter', sku: SKU + 'supporter', typ: 'supporter', ikon: 'gava', namn: $t('SUPPORTER'), text: $t('16× FART (TRYCK 8× IGEN) OCH ETT STORT TACK') },
];
export const arForbruk = (p) => p.typ === 'pengar' || p.typ === 'fp';

// belopp i bolaget som är öppet (visas i butiken före köpet och ges vid köpet)
const arsfaktor = (G) => prisniva(G) * Math.pow(1.08, Math.max(0, arAv(G.dag) - 2007));
export const pengarFor = (G, p) => Math.round((p.bas * arsfaktor(G)) / 100_000) * 100_000;
export const fpFor = (G) => {
  const ar = arAv(G.dag);
  return Math.round((150 * (arKonsolSpel(G) ? 1 + (ar - 1982) / 8 : 1 + (ar - 2007) / 4)) / 10) * 10;
};

// ---------- läget (utanför sparningarna) ----------
const KEY = 'mobilfabriken.kop';
let S = null;
const tvatta = (p) => ({
  v: 1,
  tx: Array.isArray(p?.tx) ? p.tx.filter((t) => typeof t === 'string' && t).slice(-300) : [],
  guld: !!p?.guld,
  supporter: !!p?.supporter,
  vantar: Array.isArray(p?.vantar) ? p.vantar.filter((id) => PRODUKTER.some((x) => x.id === id && arForbruk(x))).slice(0, 20) : [],
  logg: Array.isArray(p?.logg) ? p.logg.slice(-100) : [],
});
function las() {
  if (S) return S;
  let p = null;
  try { p = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { /* trasigt – börja om */ }
  S = tvatta(p);
  return S;
}
function spara() { try { localStorage.setItem(KEY, JSON.stringify(las())); } catch { /* fullt */ } }
export const agerGuld = () => las().guld;
export const arSupporter = () => las().supporter;
export const kopLage = () => JSON.parse(JSON.stringify(las()));   // (tester)
export const ager = (p) => (p.typ === 'guld' && las().guld) || (p.typ === 'supporter' && las().supporter);

// det köpta i ett bolag: guldytorna in i G.legendariska och köp som väntat på ett öppet bolag
export function kopIBolaget(G) {
  if (!G) return;
  const st = las();
  if (st.guld) for (const l of LEGENDARISKA) if (!G.legendariska.includes(l.id)) G.legendariska.push(l.id);
  if (st.vantar.length) { for (const id of st.vantar.splice(0)) ge(G, PRODUKTER.find((p) => p.id === id)); spara(); }
}
// ger en förbrukningsvara i bolaget; returnerar texten som visas
function ge(G, p) {
  if (!G || !p) return '';
  if (p.typ === 'pengar') { const b = pengarFor(G, p); G.bolag.kassa += b; G.bolag.kopt = (G.bolag.kopt || 0) + b; return b; }
  if (p.typ === 'fp') { const f = fpFor(G); G.bolag.fp += f; return f; }
  return '';
}

// ---------- Apple ----------
const plugin = () => { try { return window.Capacitor?.isNativePlatform?.() ? window.Capacitor.Plugins?.NativePurchases || null : null; } catch { return null; } };
export const butikFinns = () => !!plugin();
let priser = null;   // sku → prissträng från Apple ("29,00 kr", "$2.99")
export const prisFor = (p) => priser?.[p.sku] || '';
export async function hamtaPriser() {
  const P = plugin();
  if (!P) return null;
  if (priser) return priser;
  const r = await P.getProducts({ productIdentifiers: PRODUKTER.map((p) => p.sku), productType: 'inapp' });
  const m = {};
  for (const x of r?.products || []) if (x?.identifier) m[x.identifier] = String(x.priceString || '');
  priser = m;
  return priser;
}

// Bokför en transaktion – en gång per transactionId. Returnerar { p, varde } eller null.
export function bokfor(A, tx) {
  const p = PRODUKTER.find((x) => x.sku === tx?.productIdentifier);
  if (!p) return null;
  const st = las(), id = String(tx.transactionId || '');
  if (tx.revocationDate) {   // återbetalt: engångsköpet tas bort (förbrukat rörs inte)
    if (p.typ === 'guld') st.guld = false;
    if (p.typ === 'supporter') st.supporter = false;
    spara();
    return null;
  }
  if (id && st.tx.includes(id)) return null;
  if (id) { st.tx.push(id); if (st.tx.length > 300) st.tx.splice(0, st.tx.length - 300); }
  let varde = '';
  if (p.typ === 'guld') st.guld = true;
  else if (p.typ === 'supporter') st.supporter = true;
  else if (A?.G) varde = ge(A.G, p);
  else st.vantar.push(p.id);
  if (A?.G) { kopIBolaget(A.G); A.spara?.(); }
  st.logg.push({ t: new Date().toISOString().slice(0, 16), id: p.id });
  if (st.logg.length > 100) st.logg.shift();
  spara();
  return { p, varde };
}

// köp: resultat { ok, text } till butiken
export async function kopa(A, p) {
  const P = plugin();
  if (!P || !p) return { ok: false, text: '' };
  if (ager(p)) return { ok: false, text: $t('DEN ÄR REDAN DIN.') };
  try {
    const tx = await P.purchaseProduct({ productIdentifier: p.sku, productType: 'inapp', quantity: 1, isConsumable: arForbruk(p) });
    const r = bokfor(A, tx);
    return { ok: true, text: r ? tackText(r) : $t('TACK!') };
  } catch (e) {
    const msg = String(e?.message || e || '');
    if (/pending/i.test(msg)) return { ok: false, text: $t('KÖPET VÄNTAR PÅ GODKÄNNANDE. DET KOMMER IN NÄR DET ÄR KLART.') };
    if (/cancel/i.test(msg)) return { ok: false, text: '' };
    return { ok: false, text: $t('KÖPET GICK INTE IGENOM. FÖRSÖK IGEN OM EN STUND.') };
  }
}
export function tackText({ p, varde }) {
  if (p.typ === 'guld') return $t('GULDYTORNA FINNS NU I DESIGNERN – TACK!');
  if (p.typ === 'supporter') return $t('TACK FÖR STÖDET! TRYCK 8× IGEN FÖR 16×.');
  if (p.typ === 'fp') return varde ? $t`+${varde} FP – TACK!` : $t('TACK! FORSKNINGEN KOMMER NÄR DU ÖPPNAR ETT BOLAG.');
  return varde !== '' ? $t('PENGARNA LIGGER I KASSAN – TACK!') : $t('TACK! PENGARNA KOMMER NÄR DU ÖPPNAR ETT BOLAG.');
}

// Återställ köp: engångsköpen från Apple-kontot. tyst = vid start, utan inloggningsruta och utan besked.
export async function aterstall(A, { tyst = false } = {}) {
  const P = plugin();
  if (!P) return { n: 0, text: '' };
  try {
    if (!tyst) await P.restorePurchases();
    const r = await P.getPurchases({ productType: 'inapp', onlyCurrentEntitlements: true });
    const st = las(); let n = 0;
    for (const tx of r?.purchases || []) {
      const p = PRODUKTER.find((x) => x.sku === tx?.productIdentifier);
      if (!p || tx.revocationDate) continue;
      if (p.typ === 'guld' && !st.guld) { st.guld = true; n++; }
      if (p.typ === 'supporter' && !st.supporter) { st.supporter = true; n++; }
    }
    if (n) { spara(); if (A?.G) kopIBolaget(A.G); }
    return { n, text: n ? $t`${n} KÖP ÅTERSTÄLLDA.` : $t('ALLT DU KÖPT FINNS REDAN HÄR.') };
  } catch {
    return { n: 0, text: tyst ? '' : $t('DET GICK INTE ATT ÅTERSTÄLLA JUST NU.') };
  }
}

// Vid start i appen: köp som godkänns senare kommer som transactionUpdated; engångsköpen hämtas tyst.
let tackKo = null;   // senaste tacket från ett köp som kom in i bakgrunden (butiken visar det)
export const senasteTack = () => { const t = tackKo; tackKo = null; return t; };
export function startKop(A) {
  const P = plugin();
  if (!P) return;
  try { P.addListener?.('transactionUpdated', (tx) => { const r = bokfor(A, tx); if (r) tackKo = tackText(r); }); } catch { /* äldre */ }
  setTimeout(() => { aterstall(A, { tyst: true }).catch(() => {}); }, 4000);
}
