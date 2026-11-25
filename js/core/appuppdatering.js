// Självuppdatering i App Store-appen (Capacitor + @capgo/capacitor-updater i manuellt läge) – samma väg som
// Pixelcity (snabbfilen/js/core/version-ui.js), men tyst: appen hämtar en ny spelversion i bakgrunden och
// byter till den vid NÄSTA start. Sparningen (localStorage) ligger kvar, den hör till appen och inte paketet.
//
//   1. version.json på webben (https://8bitcat.github.io/mobilfabriken/version.json) säger vilken version som gäller.
//   2. Är den nyare än den som körs hämtas kontrollsumman (sha256) från GitHub-releasen v<V> – Capgo kräver den –
//      och paketet mobilfabriken-<V>.zip laddas ner (app/paket.mjs bygger och laddar upp det vid varje släpp).
//   3. next({ id }) väljer paketet vid nästa start. Appen går aldrig bakåt.
// Ett nytt paket måste svara med notifyAppReady inom 15 s (capacitor.config.json appReadyTimeout), annars
// rullar Capgo tillbaka till det förra. Det görs när spelets första scen har ritats.
// På webben och i testerna gör modulen ingenting.
import { VERSION } from '../version.js';
import { APPLAGE } from './applage.js';

const UPD = (() => { try { return window.Capacitor?.isNativePlatform?.() ? window.Capacitor.Plugins?.CapacitorUpdater || null : null; } catch { return null; } })();
const WEBB = 'https://8bitcat.github.io/mobilfabriken/version.json';
// ett paket per app: Smartphone Empire mobilfabriken-<V>.zip (så heter det i 1.0), Console Empire mobilfabriken-<V>-konsol.zip
const ZIPNAMN = (v) => (APPLAGE === 'konsol' ? `mobilfabriken-${v}-konsol.zip` : `mobilfabriken-${v}.zip`);
const PAKET = (v) => `https://github.com/8bitcat/mobilfabriken/releases/download/v${v}/${ZIPNAMN(v)}`;
const nyare = (a, b) => { const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; };

async function kontrollsumma(v) {
  const r = await fetch(`https://api.github.com/repos/8bitcat/mobilfabriken/releases/tags/v${v}`, { cache: 'no-store' });
  if (!r.ok) return null;
  const a = (await r.json()).assets?.find((x) => x.name === ZIPNAMN(v));
  const m = /^sha256:([0-9a-f]{64})$/.exec(a?.digest || '');
  return m ? m[1] : null;
}

async function leta() {
  try {
    const r = await fetch(WEBB + '?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) return;
    const v = (await r.json()).version;
    if (!v || !nyare(v, VERSION)) return;
    const lista = (await UPD.list())?.bundles || [];
    let paket = lista.find((b) => b.version === v && b.status !== 'error');
    if (!paket) {
      const checksum = await kontrollsumma(v);
      if (!checksum) return;   // releasen eller paketet finns inte än – försök vid nästa start
      paket = await UPD.download({ url: PAKET(v), version: v, checksum });
    }
    if (paket?.id) await UPD.next({ id: paket.id });
  } catch (e) { console.warn('appuppdatering:', e?.message || e); }
}

// startas från main.js; A.scen finns när första scenen är satt
export function startaAppuppdatering(A) {
  if (!UPD) return;
  const t0 = performance.now();
  const iv = setInterval(() => {
    if (A.scen) { clearInterval(iv); try { UPD.notifyAppReady(); } catch { /* ok */ } setTimeout(leta, 3000); }
    else if (performance.now() - t0 > 14000) clearInterval(iv);
  }, 200);
}
