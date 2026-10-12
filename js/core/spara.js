// Sparning i localStorage. 8bitcat.github.io delar lagring mellan alla spel – därför har ALLA nycklar
// prefixet 'mobilfabriken.' (Snabbfilens nycklar läses aldrig skrivande).
//   mobilfabriken.bolag      = lista över sparade bolag [{ id, namn, initial, dag, kassa, sparad }]
//   mobilfabriken.spel.<id>  = hela spelet (JSON)
//   mobilfabriken.senaste    = id för senast spelade bolag
//   mobilfabriken.arv        = arvet från sålda bolag
import { lagaSpel } from '../sim/tick.js';

const P = 'mobilfabriken.';
const las = (k, def = null) => { try { const v = localStorage.getItem(P + k); return v == null ? def : JSON.parse(v); } catch { return def; } };
const skriv = (k, v) => { try { localStorage.setItem(P + k, JSON.stringify(v)); return true; } catch { return false; } };
const taBort = (k) => { try { localStorage.removeItem(P + k); } catch { /* ok */ } };

// DINA BOLAG: högst så här många bolag per enhet (lagringen delas med de andra spelen). Taket gäller när
// ett bolag skapas – startskärmen släpper inte fram NYTT BOLAG när listan är full, man raderar ett bolag
// först. Listan själv kapas aldrig, så inget bolag knuffas ut och ingen sparfil blir kvar som inte går att nå.
export const MAX_BOLAG = 12;
const post = (G, sparad = Date.now()) => ({ id: G.id, namn: G.bolag.namn, initial: G.bolag.initial, dag: G.dag, kassa: Math.round(G.bolag.kassa), sparad });
export const bolagsLista = () => { const L = las('bolag', []); return Array.isArray(L) ? L.filter((b) => b && b.id) : []; };
export const senaste = () => las('senaste', null);
export function spara(G) {
  if (!G || G.salt) return false;   // ett sålt bolag sparas aldrig igen
  const ok = skriv('spel.' + G.id, G);
  const lista = bolagsLista().filter((b) => b.id !== G.id);
  lista.unshift(post(G));
  skriv('bolag', lista); skriv('senaste', G.id);
  return ok;
}
// Version 0.1.1 sparade ett sålt bolag med G.salt, och FORTSÄTT öppnade det igen. Har barnet spelat vidare
// efter försäljningen (dag > salt.dag) är bolaget barnets igen: märket tas bort och bolaget behålls (arvet är
// redan räknat och får stå kvar). Bara ett bolag som inte spelats en enda dag efter försäljningen räknas som sålt.
const spelatVidare = (G) => { if (G && G.salt && G.dag > (+G.salt.dag || 0)) delete G.salt; return G; };
export function ladda(id) {
  const G = spelatVidare(las('spel.' + id));
  if (!G || !G.bolag) return null;
  G.ko = []; G.flaggor ||= {}; G.flaggor.autopaus = false;
  // lagar 0.1.0-sparningar (NaN → null i lager/veckor) direkt, så att en pausad sparning visar rätt siffror
  // redan innan första dagen går (tick.js gör det annars vid första dagTick)
  return lagaSpel(G);
}
export function radera(id) {
  taBort('spel.' + id);
  skriv('bolag', bolagsLista().filter((b) => b.id !== id));
  if (senaste() === id) skriv('senaste', null);
}
// Städning när startskärmen öppnas (rättar sparningar från 0.1.0/0.1.1): sålda bolag som inte spelats vidare
// och sparfiler som inte går att läsa tas bort, poster utan sparfil stryks ur listan, och sparfiler som fallit
// ur listan (i 0.1.0 knuffade det 13:e bolaget ut det äldsta) kommer tillbaka i DINA BOLAG – nyast först.
// Rör bara nycklar med prefixet 'mobilfabriken.spel.' och listorna 'bolag'/'senaste'.
export function stada() {
  try {
    const PS = P + 'spel.', ids = new Set(), lista = [], hittade = [];
    // las() ger null både för saknad och trasig fil – en trasig eller såld sparfil går aldrig att öppna.
    // Ett bolag som spelats vidare efter en försäljning i 0.1.1 behålls (spelatVidare) och sparas utan märket.
    const giltig = (id) => {
      const G = las('spel.' + id);
      if (G && G.bolag) {
        const salt = !!G.salt; spelatVidare(G);
        if (!G.salt) { if (salt) skriv('spel.' + id, G); return G; }
      }
      taBort('spel.' + id); return null;
    };
    for (const b of bolagsLista()) if (!ids.has(b.id) && giltig(b.id)) { ids.add(b.id); lista.push(b); }
    const filer = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(PS)) filer.push(k.slice(PS.length)); }
    for (const id of filer) {
      if (ids.has(id)) continue;
      const G = giltig(id); if (G) { ids.add(id); hittade.push({ ...post(G, G.skapad || 0), id }); }
    }
    hittade.sort((a, b) => b.sparad - a.sparad);
    skriv('bolag', [...lista, ...hittade]);
    if (senaste() && !ids.has(senaste())) skriv('senaste', null);
  } catch { /* lagringen går inte att läsa: rör ingenting */ }
}
export const arv = () => las('arv', null);
export const sparaArv = (a) => skriv('arv', a);
export const installning = (k, def) => las('inst.' + k, def);
export const sparaInstallning = (k, v) => skriv('inst.' + k, v);
// Gåvorna räknas per bolag (G.gavor, SPELDESIGN §4). Version 0.1.0 räknade dem per enhet i 'mobilfabriken.gavor';
// den nyckeln läses bara när ett gammalt bolag öppnar gåvorna första gången (se gavor.js).
export const gamlaGavoLaget = () => las('gavor', null);
