// Sparning i localStorage. 8bitcat.github.io delar lagring mellan alla spel – därför har ALLA nycklar
// prefixet 'mobilfabriken.' (Snabbfilens nycklar läses aldrig skrivande).
//   mobilfabriken.bolag      = lista över sparade bolag [{ id, namn, initial, dag, kassa, sparad }]
//   mobilfabriken.spel.<id>  = hela spelet (JSON)
//   mobilfabriken.senaste    = id för senast spelade bolag
//   mobilfabriken.arv        = arvet från sålda bolag
const P = 'mobilfabriken.';
const las = (k, def = null) => { try { const v = localStorage.getItem(P + k); return v == null ? def : JSON.parse(v); } catch { return def; } };
const skriv = (k, v) => { try { localStorage.setItem(P + k, JSON.stringify(v)); return true; } catch { return false; } };

export const bolagsLista = () => las('bolag', []);
export const senaste = () => las('senaste', null);
export function spara(G) {
  if (!G) return false;
  const ok = skriv('spel.' + G.id, G);
  const lista = bolagsLista().filter((b) => b.id !== G.id);
  lista.unshift({ id: G.id, namn: G.bolag.namn, initial: G.bolag.initial, dag: G.dag, kassa: Math.round(G.bolag.kassa), sparad: Date.now() });
  skriv('bolag', lista.slice(0, 12)); skriv('senaste', G.id);
  return ok;
}
export function ladda(id) {
  const G = las('spel.' + id);
  if (!G || !G.bolag) return null;
  G.ko = []; G.flaggor ||= {}; G.flaggor.autopaus = false;
  return G;
}
export function radera(id) {
  try { localStorage.removeItem(P + 'spel.' + id); } catch { /* ok */ }
  skriv('bolag', bolagsLista().filter((b) => b.id !== id));
  if (senaste() === id) skriv('senaste', null);
}
export const arv = () => las('arv', null);
export const sparaArv = (a) => skriv('arv', a);
export const installning = (k, def) => las('inst.' + k, def);
export const sparaInstallning = (k, v) => skriv('inst.' + k, v);
// gåvorna räknas på riktiga kalenderdagar (inte speldagar)
export const gavoLage = () => las('gavor', { senast: null, kort: 0 });
export const sparaGavoLage = (v) => skriv('gavor', v);
