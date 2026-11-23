// STUDIOS (konsolspelet) – spelstudiorna som vill göra spel till dina konsoler (docs/KONSOLPLAN.md). Fem flikar:
//   FÖRFRÅGNINGAR  ett kort per förfrågan: spelet på en liten tv, studion, avtalet och JA / FÖRHANDLA / EXKLUSIVT / NEJ
//   BIBLIOTEK      spelen per konsol: på väg, ute (sålda, licensintäkt, reklamfilmen) och slutsålda
//   EGNA SPEL      spelutvecklarnas nästa spel och det som görs nu (gröna prickar)
//   LÅNA           en studio lånar ut en utvecklare till konsolbygget
//   RIVALER        rivalkonsolerna på marknaden och spelen som gick till dem
// Logiken ligger i js/sim/konsol.js; tv-rutan (glimten eller titelkortet) i reklam.js. Tiden går som vanligt.
import { F, W, rect, text, textB, knapp, panel, kort, ikon, inne, tw, kapa, radbryt, matare, stycke, lista, reglage, stjarnor, chip, mixa, ljusa, BIG } from '../core/ui.js';
import { hud, flikrad } from './ram.js';
import { tvTyp, tvKant, tvSkarm, tvMedGlimt } from './reklam.js';
import { visaKonsol, ritaKonsol2D } from '../konsol/konsol-vy.js';
import {
  svara, jaChans, exklusivPris, studioKrav, utvecklingsdagar, LICENS, LICENS_MAX, egnaKonsoler, konsolProjekt, installeradBas, spelPa, spelKvar,
  egnaSpelLediga, egetPagar, spelutvecklare, spelDagar, egnaStjarnor, startaEgetSpel, klararKrav, lanePris, lanbaraStudios, lanaUtvecklare,
  aktivaRivalKonsoler, studioAv, spelAv, EGNA_SPEL,
} from '../sim/konsol.js';
import { konsolTel } from '../sim/design.js';
import { bibliotek, aktivaEffekter } from '../sim/marknad.js';
import { kDelAv, kEnhetAv } from '../data/konsol.js';
import { kr, dec, tal, datumText, arAv, forstaIManaden } from '../sim/bas.js';

const FLIKAR = [['forfragningar', 'FÖRFRÅGNINGAR'], ['bibliotek', 'BIBLIOTEK'], ['egna', 'EGNA SPEL'], ['lana', 'LÅNA UTVECKLARE'], ['rivaler', 'RIVALER']];
// relationen med en studio (−3 … +3)
const RELATION = (r) => (r >= 3 ? ['BÄSTA VÄNNER', F.guld] : r >= 2 ? ['BÄSTA VÄNNER', F.gron2] : r >= 1 ? ['GODA VÄNNER', F.gron2] : r >= 0 ? ['NEUTRALA', F.dim] : r >= -1 ? ['LITE SURA', F.orange2] : ['ARGA', F.rod2]);
// antal så kort som ryms: 9 876 · 12 T · 1,5 M
const kortTal = (n) => { n = Math.max(0, Math.round(n || 0)); return n >= 999_500 ? dec(n / 1e6, 1) + ' M' : n >= 10_000 ? Math.round(n / 1e3) + ' T' : tal(n); };
const STATUSFARG = { utvecklas: F.bla, vantar: F.guld2, ute: F.gron, slut: F.dim2 };
// tiden kvar att svara (sista dagen står det 0 dagar kvar – då säger kortet det rakt ut)
export const svaraInom = (d) => (d <= 0 ? 'SISTA DAGEN ATT SVARA!' : d === 1 ? 'SVARA INOM 1 DAG' : `SVARA INOM ${d} DAGAR`);

export function studios(A, o = {}) {
  const G = A.G;
  if (!G?.k) return { tid: true, rita() { rect(0, 14, W, 11, 0x0a0d1a); textB('STUDIOS', 4, 16, F.guld); text('FINNS BARA I KONSOLSPELET', 6, 40, F.dim); hud(A); flikrad(A, 'studios'); } };
  let flik = o.flik || 'forfragningar', fel = '', medd = null, bekrNej = null, spin = 0.4;
  let valdKonsol = o.konsol || null, valtEget = null, egenKonsol = null, valtBygge = null;
  const bud = {};   // förhandlingsreglaget per förfrågan (licensandel)
  const skF = { v: 0 }, skK = { v: 0 }, skB = { v: 0 }, skE = { v: 0 }, skL = { v: 0 }, skR = { v: 0 }, skT = { v: 0 };
  const meddela = (s, farg = F.gron) => { medd = { text: s, farg, t: A.t }; fel = ''; };
  const gjort = (r, ok) => { if (!r.ok) { fel = r.fel || 'GICK INTE'; medd = null; A.ljud('fel'); } else { fel = ''; if (ok) ok(r); } };
  return {
    tid: true,
    rita(ctx, dt) {
      spin += dt * 0.6;
      rect(0, 14, W, 11, 0x0a0d1a);
      textB('STUDIOS', 4, 16, F.guld); text('SPELSTUDIORNA VILL GÖRA SPEL TILL DINA KONSOLER', 52, 18, F.dim);
      text(`${kortTal(installeradBas(G))} HAR DINA KONSOLER HEMMA`, W - 4, 18, F.bla2, { just: 'h' });
      let fx = 4;
      for (const [id, n] of FLIKAR) {
        const antal = id === 'forfragningar' ? G.k.forfragningar.length : id === 'bibliotek' ? G.k.spel.length : 0, e = antal ? `${n} (${antal})` : n;
        const w = knapp(fx, 27, tw(e) + 10, 10, e, { stil: 'dim', aktiv: flik === id, klick: () => { flik = id; fel = ''; medd = null; bekrNej = null; }, namn: 'studios-flik-' + id });
        // en blinkande prick när studios väntar på svar
        if (id === 'forfragningar' && antal && flik !== id && Math.floor(A.t * 2) % 2) rect(fx + w - 3, 26, 3, 3, F.rod2);
        fx += w + 3;
      }
      panel(2, 40, 378, 160);
      ({ forfragningar, bibliotek: bibl, egna, lana, rivaler })[flik](ctx);
      if (fel) { rect(2, 190, 378, 10, F.rod); text(kapa(fel, 370), 191, 192, F.text, { just: 'c' }); }
      else if (medd && A.t - medd.t < 4) { rect(2, 190, 378, 10, medd.farg); text(kapa(medd.text, 370), 191, 192, F.text, { just: 'c' }); }
      hud(A); flikrad(A, 'studios');
    },
  };

  // konsolens namn ur produkten eller bygget
  function konsolNamn(id) { return G.produkter.find((p) => p.id === id)?.namn || G.projekt.find((p) => p.id === id)?.design.namn || 'DIN KONSOL'; }
  // en liten tv (rutan bw × bh, tv:n följer eran) med spelets glimt eller titelkort – eller utan signal (brus)
  function tvRuta(x, y, bw, bh, id, titel, studio, brus = false) {
    const typ = tvTyp(arAv(G.dag)), k = tvKant(typ), s = tvSkarm(typ, typ === 'platt' ? 72 : 64);
    const sx = x + Math.floor((bw - (s.w + k.l + k.r)) / 2) + k.l, sy = y + Math.floor((bh - (s.h + k.t + k.b + k.fot)) / 2) + k.t;
    tvMedGlimt(typ, sx, sy, s.w, s.h, id, titel, studio, A.t);
    // myrornas krig: ingen sändning
    if (brus) for (let j = 0; j < s.h; j += 2) for (let i = 0; i < s.w; i += 2) { const v = Math.random(); rect(sx + i, sy + j, 2, 2, v < 0.4 ? 0x1a1a1e : v < 0.75 ? 0x5a5a62 : 0xb8b8c0); }
  }

  // ---------- FÖRFRÅGNINGAR ----------
  function forfragningar(ctx) {
    const L = G.k.forfragningar;
    if (!L.length) return tomt(ctx);
    const kh = 76, h = Math.min(156, L.length * kh);
    lista(4, 42, 374, h, L.length, kh, (i, y) => forfragan(L[i], i, y + 1), skF);
    // ett enda kort: förklaringen av kraven får plats under det
    if (L.length === 1) { rect(6, 122, 370, 1, F.hi); kravTabell(8, 128, 'NÄR KNACKAR NÄSTA STUDIO PÅ?'); }
  }
  function forfragan(f, i, y) {
    const s = spelAv(f.spel), st = studioAv(f.studio), x = 6;
    if (!s) return;
    const licens = bud[f.id] ?? 0.15, chans = jaChans(G, f, licens), ex = exklusivPris(G, s.stj), dagar = Math.max(0, f.slutDag - G.dag);
    kort(x, y, 370, 74, { kant: dagar <= 10 ? F.orange : null });
    tvRuta(x + 4, y + 4, 84, 66, f.spel, s.titel, st.namn);
    // spelet och avtalet
    const ix = x + 94, iw = 142;
    if (tw(s.titel, BIG) <= iw) textB(s.titel, ix, y + 5, F.text); else text(kapa(s.titel, iw), ix, y + 6, F.text);
    stjarnor(ix, y + 15, s.stj); text(kapa(st.namn, iw - 40), ix + 40, y + 16, F.lila2);
    text(kapa(f.lanseringsspel ? `LANSERINGSSPEL TILL ${konsolNamn(f.konsol)}` : `TILL ${konsolNamn(f.konsol)}`, iw), ix, y + 26, f.lanseringsspel ? F.guld : F.text);
    text('UTVECKLINGSKIT', ix, y + 35, F.dim); text('+' + kr(f.devkit), ix + iw, y + 35, F.gron2, { just: 'h' });
    // knapparnas förklaring när pekaren står på en av dem, annars tiden och relationen
    const ax = x + 244, tips = [
      [ax, y + 5, 60, 12, `STANDARDAVTAL: ${Math.round(LICENS * 100)} % AV VARJE SÅLT SPEL TILL DIG.`],
      [ax + 64, y + 5, 58, 12, 'SPELET GÅR TILL EN RIVAL.' + (s.stj >= 3 ? ' STUDION BLIR SUR.' : '')],
      [ax, y + 19, 122, 32, 'STÖRRE ANDEL – MEN ÄR DU FÖR GIRIG GÅR STUDION TILL EN RIVAL.'],
      [ax, y + 55, 122, 12, 'DU BETALAR. SPELET KOMMER BARA TILL DIG OCH DRAR 50 % MER.'],
    ].find(([tx, ty, tw_, th]) => inne(tx, ty, tw_, th));
    if (tips) radbryt(tips[4], iw).slice(0, 2).forEach((r, k) => text(r, ix, y + 44 + k * 8, F.guld));   // högst två rader
    else {
      text(`TAR CA ${Math.round(utvecklingsdagar(s.stj) / 30)} MÅNADER ATT GÖRA`, ix, y + 44, F.dim);
      const [rt, rc] = RELATION(G.k.relation[f.studio] || 0);
      if (s.ss) text('SYSTEMSÄLJARE! SÄLJER KONSOLER', ix, y + 52, F.guld2); else { text('RELATION', ix, y + 52, F.dim); text(rt, ix + 38, y + 52, rc); }
    }
    ikon('klocka', ix, y + 61, dagar <= 10 ? F.orange2 : F.dim2);
    text(svaraInom(dagar), ix + 10, y + 62, dagar <= 10 ? F.orange2 : F.dim);
    // svaren
    rect(x + 240, y + 3, 128, 68, F.panel);
    knapp(ax, y + 5, 60, 12, `JA · ${Math.round(LICENS * 100)} %`, { stil: 'gron', namn: 'studios-ja-' + i, klick: () => gjort(svara(G, f.id, 'ja'), () => { A.ljud('mynt'); meddela(`AVTAL! ${s.titel} KOMMER OM CA ${Math.round(utvecklingsdagar(s.stj) / 30)} MÅNADER.`); }) });
    // NEJ frågar en gång till (spelet går till en rival); bekräftelsen gäller i tre sekunder
    const saker = () => !!bekrNej && bekrNej.id === f.id && A.t - bekrNej.t < 3;
    knapp(ax + 64, y + 5, 58, 12, saker() ? 'SÄKER?' : 'NEJ', { stil: saker() ? 'rod' : 'dim', namn: 'studios-nej-' + i, klick: () => {
      if (!saker()) { bekrNej = { id: f.id, t: A.t }; return; }
      bekrNej = null; gjort(svara(G, f.id, 'nej'), () => meddela(`${s.titel} GÅR TILL EN RIVAL.`, F.orange));
    } });
    text('LICENS', ax, y + 23, F.dim);
    reglage(ax + 27, y + 23, 66, licens, LICENS, LICENS_MAX, (v) => { bud[f.id] = Math.round(v * 100) / 100; }, { namn: 'studios-licens-' + i, farg: F.bla2 });
    text(`${Math.round(licens * 100)} %`, ax + 122, y + 23, F.guld, { just: 'h' });
    text(`${Math.round(chans * 100)} % CHANS ATT DE SÄGER JA`, ax, y + 32, chans >= 0.75 ? F.gron2 : chans >= 0.45 ? F.guld : F.rod2);
    knapp(ax, y + 40, 122, 11, `FÖRHANDLA · ${Math.round(licens * 100)} %`, { stil: 'bla', namn: 'studios-forhandla-' + i, klick: () => gjort(svara(G, f.id, 'forhandla', { licens }), (r) => {
      if (r.nej) { A.ljud('fel'); meddela(`${st.namn} SA NEJ – ${s.titel} GÅR TILL EN RIVAL.`, F.rod); }
      else { A.ljud('mynt'); meddela(`AVTAL PÅ ${Math.round(licens * 100)} %! ${s.titel} KOMMER OM CA ${Math.round(utvecklingsdagar(s.stj) / 30)} MÅNADER.`); }
    }) });
    knapp(ax, y + 55, 122, 12, `EXKLUSIVT · ${kr(ex, true)}`, { stil: 'lila', av: G.bolag.kassa < ex, namn: 'studios-exklusivt-' + i, klick: () => gjort(svara(G, f.id, 'exklusivt'), () => { A.ljud('mynt'); meddela(`EXKLUSIVT! ${s.titel} KOMMER BARA TILL DINA KONSOLER.`); }) });
  }
  // inga förfrågningar: vad studiorna kräver och när de hör av sig
  function tomt() {
    tvRuta(8, 46, 90, 70, null, '', '', true);   // tv:n utan signal
    textB('INGA FÖRFRÅGNINGAR JUST NU', 104, 48, F.text);
    stycke('STUDIOS HÖR AV SIG DEN 1:A VARJE MÅNAD NÄR DIN KONSOL ÄR BRA NOG. ÄVEN ETT KONSOLBYGGE LOCKAR – DÅ BLIR SPELET ETT LANSERINGSSPEL. SÄGER DU NEJ ELLER SVARAR FÖR SENT GÅR SPELET TILL EN RIVAL.', 104, 60, 268, F.dim);
    kravTabell(104, 96, 'DE STORA SPELEN KRÄVER');
  }
  // ★★★–★★★★★: betyg och antal hemma som studiorna kräver, och om någon av dina konsoler (eller ett bygge) klarar det
  function kravTabell(x, y, rubrik) {
    const halva = installeradBas(G) / 2, mal = [];
    for (const p of egnaKonsoler(G)) if (p.aktiv) mal.push({ namn: p.namn, betyg: p.betyg, bas: Math.max(p.installerade || 0, halva) });
    for (const pr of konsolProjekt(G)) mal.push({ namn: pr.design.namn, betyg: pr.prognosBetyg ?? 6, bas: halva, bygge: true });
    text(rubrik, x, y, F.guld);
    text('BETYG', x + 120, y, F.dim2); text('HEMMA', x + 170, y, F.dim2);
    text('★–★★', x, y + 9, F.guld); text('ALLTID', x + 120, y + 9, F.gron2);
    [3, 4, 5].forEach((stj, i) => {
      const kk = studioKrav(G, stj), yy = y + 17 + i * 8, ok = mal.some((m) => m.betyg >= kk.betyg && m.bas >= kk.bas);
      text('★'.repeat(stj), x, yy, F.guld);
      text(dec(kk.betyg), x + 120, yy, F.text); text(tal(kk.bas), x + 170, yy, F.text);
      if (mal.length) ikon(ok ? 'bock' : 'kryss', x + 220, yy - 1, ok ? F.gron2 : F.orange2);
    });
    const basta = [...mal].sort((a, b) => b.betyg - a.betyg)[0];
    let ny = G.dag + 1; while (!forstaIManaden(ny) && ny < G.dag + 40) ny++;
    const yy = y + 44;
    if (basta) text(kapa(`DIN BÄSTA: ${basta.namn} · BETYG ${dec(basta.betyg)}${basta.bygge ? ' (GISSNING)' : ''} · ${tal(basta.bas)} HEMMA`, 268), x, yy, F.bla2);
    else text('INGEN KONSOL ÄN – BÖRJA BYGGA EN I DESIGN', x, yy, F.orange2);
    text(`NÄSTA KNACK: ${datumText(ny)}`, x, yy + 8, F.dim);
    if (aktivaEffekter(G).studios < 1) text('SPELKRASCHEN: STUDIORNA ÄR FÖRSIKTIGA', x + 120, yy + 8, F.orange2);
  }

  // ---------- BIBLIOTEK ----------
  function konsoler() {
    const ut = [];
    for (const pr of konsolProjekt(G)) if (spelPa(G, pr.id).length) ut.push({ id: pr.id, namn: pr.design.namn, modell: konsolTel(pr.design).enhet, bas: 0, bygge: true });
    for (const p of [...egnaKonsoler(G)].reverse()) ut.push({ id: p.id, namn: p.namn, modell: konsolTel(p.design).enhet, bas: p.installerade || 0, aktiv: p.aktiv, p });
    return ut;
  }
  function bibl(ctx) {
    const K = konsoler();
    if (!K.length) {
      textB('INGA SPEL ÄN', 8, 48, F.text);
      stycke('LANSERA DIN FÖRSTA KONSOL – SPELET I LÅDAN HAMNAR HÄR, OCH SEDAN BÖRJAR STUDIORNA KNACKA PÅ MED SINA SPEL.', 8, 60, 300, F.dim);
      knapp(8, 82, 90, 12, 'DESIGNA KONSOL', { stil: 'gron', klick: () => A.go('design'), namn: 'studios-design' });
      return;
    }
    let v = K.find((k) => k.id === valdKonsol);
    if (!v) { v = K.find((k) => spelPa(G, k.id).length) || K[0]; valdKonsol = v.id; }
    // vänster: konsolerna
    lista(4, 42, 112, 156, K.length, 36, (i, y) => {
      const k = K[i], n = spelPa(G, k.id).length;
      kort(6, y + 1, 106, 34, { vald: k.id === valdKonsol, klick: () => { valdKonsol = k.id; skB.v = 0; }, namn: 'studios-konsol-' + i });
      ritaKonsol2D(ctx, 7, y + 4, k.modell, 1);
      text(kapa(k.namn, 60), 49, y + 5, k.bygge || k.aktiv ? F.text : F.dim);
      text(`${n} SPEL`, 49, y + 13, F.dim);
      text(k.bygge ? 'BYGGS NU' : k.aktiv ? `${kortTal(k.bas)} HEMMA` : 'UTGÅNGEN', 49, y + 21, k.bygge ? F.orange2 : k.aktiv ? F.bla2 : F.dim2);
    }, skK);
    // höger: spelen till den valda
    const ordning = { utvecklas: 0, vantar: 1, ute: 2, slut: 3 };
    const S = spelPa(G, v.id).sort((a, b) => ordning[a.status] - ordning[b.status] || (b.slappDag ?? b.startDag) - (a.slappDag ?? a.startDag));
    text(kapa(v.namn, 110), 122, 45, F.guld);
    text(v.bygge ? 'LANSERINGSSPELEN SLÄPPS SAMMA DAG SOM KONSOLEN' : `${S.length} SPEL · BIBLIOTEKET LOCKAR ×${dec(bibliotek(G, v.p), 1)} KÖPARE`, 374, 45, F.dim, { just: 'h' });
    if (!S.length) { stycke('INGA SPEL TILL DEN HÄR KONSOLEN ÄN. SÄG JA NÄR EN STUDIO KNACKAR PÅ, ELLER GÖR ETT EGET SPEL.', 122, 58, 250, F.dim); return; }
    lista(120, 53, 258, 145, S.length, 30, (i, y) => spelRad(S[i], i, y), skB);
  }
  function spelRad(s, i, y) {
    const x = 122, studio = s.egen ? G.bolag.namn : studioAv(s.studio).namn;
    rect(x, y, 252, 28, F.panel2); rect(x, y, 2, 28, STATUSFARG[s.status] || F.dim2);
    tvMedGlimt('platt', x + 7, y + 4, 34, 20, s.glimt, s.titel, studio, A.t, { fot: false, skugga: false });
    text(kapa(s.titel, 112), x + 46, y + 3, F.text);
    text(kapa(s.packin ? 'SPELET I LÅDAN' : s.egen ? 'DITT EGET SPEL' : studio, 112), x + 46, y + 11, s.egen ? F.gron2 : F.lila2);
    const stj = s.egen && s.status === 'utvecklas' ? egnaStjarnor(G, s.kval, s.mal) : s.stj;
    stjarnor(x + 46, y + 19, stj);
    const tag = s.exklusiv ? ['EXKLUSIVT', F.lila2] : s.ss ? ['SYSTEMSÄLJARE', F.guld2] : s.lanseringsspel ? ['LANSERING', F.guld2] : null;
    if (tag) text(tag[0], x + 84, y + 20, tag[1]);
    const rx = x + 160;
    if (s.status === 'utvecklas') {
      const kvar = s.egen ? Math.max(0, s.dagar - s.dagNu) : spelKvar(G, s), tot = s.egen ? s.dagar : Math.max(1, s.klarDag - s.startDag);
      text(`KOMMER OM ${kvar} DAGAR`, rx, y + 4, F.guld);
      matare(rx, y + 13, 88, 3, 1 - kvar / Math.max(1, tot), s.egen ? F.gron : F.bla);
      text(s.egen ? 'SPELUTVECKLARNA GÖR DET' : 'STUDION GÖR SPELET', rx, y + 19, F.dim2);
    } else if (s.status === 'vantar') {
      text('KLART!', rx, y + 4, F.gron2); text('SLÄPPS SAMMA DAG', rx, y + 12, F.dim); text('SOM KONSOLEN', rx, y + 19, F.dim);
    } else {
      // spelet i lådan säljs inte för sig – det drar köpare till konsolen
      if (s.packin) { text('FÖLJER MED', rx, y + 3, F.gron2); text('VARJE KONSOL', rx, y + 10, F.dim); }
      else { text(`${kortTal(s.salda)} SÅLDA`, rx, y + 3, F.bla2); text(`${s.egen ? 'INTÄKT' : 'LICENS'} +${kr(s.intakt, true)}`, rx, y + 10, F.gron2); }
      knapp(rx, y + 17, 88, 9, s.status === 'slut' ? 'REKLAMFILM (GAMMAL)' : 'REKLAMFILM', { stil: 'lila', namn: 'studios-reklam-' + i,
        klick: () => A.go('reklam', { spel: s.id, tillbaka: 'studios', tillbakaOpts: { flik: 'bibliotek', konsol: valdKonsol } }) });
    }
  }

  // ---------- EGNA SPEL ----------
  function egna(ctx) {
    const s = egetPagar(G), utv = spelutvecklare(G);
    // vänster: spelutvecklarna och spelet de gör
    rect(190, 42, 1, 156, F.hi);   // skiljelinjen mellan vänster och höger
    text('SPELUTVECKLARNA', 9, 46, F.guld);
    if (s) {
      tvRuta(8, 54, 84, 64, s.glimt, s.titel, G.bolag.namn);
      text(kapa(s.titel, 90), 96, 58, F.text);
      text(kapa('TILL ' + konsolNamn(s.konsol), 90), 96, 66, F.dim);
      text(`DAG ${s.dagNu} AV ${s.dagar}`, 96, 78, F.text);
      text('BLIR CA', 96, 90, F.dim); stjarnor(96, 98, egnaStjarnor(G, s.kval, s.mal));
      matare(9, 122, 174, 5, s.dagNu / Math.max(1, s.dagar), F.gron, { segment: 10 });
      text(`PUTS ${s.kval} AV ${s.mal}`, 9, 132, F.gron2);
      // en grön prick per kvalitetssteg (spelutvecklarna lägger dem vid borden)
      for (let i = 0; i < s.mal; i++) { const px = 9 + (i % 29) * 6, py = 141 + Math.floor(i / 29) * 6; rect(px, py, 4, 4, i < s.kval ? F.gron2 : F.lo); if (i < s.kval) rect(px, py, 4, 1, ljusa(F.gron2, 0.4)); }
      text(`${utv.length} SPELUTVECKLARE · ${kr(500 * utv.length)}/DAG`, 9, 160, F.dim);
      stycke('HELA INTÄKTEN ÄR DIN, MINUS 30 % TILL TILLVERKNINGEN.', 9, 172, 174, F.dim2);
    } else if (!utv.length) {
      tvRuta(8, 54, 84, 64, null, '', '', true);
      stycke('INGEN SPELUTVECKLARE ÄN. ANSTÄLL EN I PERSONAL – DE GÖR EGNA SPEL SOM GER HELA INTÄKTEN, OCH SPELET I LÅDAN TILL NÄSTA KONSOL.', 9, 122, 174, F.dim);
      knapp(9, 160, 80, 12, 'PERSONAL', { stil: 'rosa', klick: () => A.go('personal'), namn: 'studios-personal' });
    } else {
      tvRuta(8, 54, 84, 64, null, '', '', true);
      textB('LEDIGA', 96, 60, F.gron2);
      stycke('VÄLJ ETT SPEL TILL HÖGER OCH TRYCK STARTA.', 96, 72, 88, F.dim);
      utv.slice(0, 4).forEach((p, i) => { text(kapa(p.namn, 100), 9, 124 + i * 9, F.text); stjarnor(130, 123 + i * 9, p.stjarnor, 5); });
      if (utv.length > 4) text(`+${utv.length - 4} TILL`, 9, 160, F.dim);
    }
    // höger: nästa egna spel
    const reserverade = new Set(G.projekt.map((pr) => pr.design?.packin?.id).filter(Boolean));
    const L = egnaSpelLediga(G).filter((e) => !reserverade.has(e.id));
    text('NÄSTA EGNA SPEL', 196, 46, F.guld);
    if (!L.length) {
      const nasta = EGNA_SPEL.find((e) => e.ar > arAv(G.dag));
      stycke('ALLA EGNA SPEL SOM GÅR ATT GÖRA ÄN ÄR GJORDA (ELLER LIGGER I LÅDAN TILL ETT BYGGE).' + (nasta ? ` NÄSTA IDÉ: ${nasta.titel} (${nasta.ar}).` : ''), 196, 56, 178, F.dim);
      return;
    }
    let E = L.find((e) => e.id === valtEget); if (!E) { E = L[0]; valtEget = E.id; }
    const aktiva = egnaKonsoler(G).filter((p) => p.aktiv);
    let p = aktiva.find((x) => x.id === egenKonsol); if (!p && aktiva.length) { p = aktiva[aktiva.length - 1]; egenKonsol = p.id; }
    lista(194, 52, 184, 72, L.length, 14, (i, y) => {
      const e = L[i], ok = !p || klararKrav(p.design, e.kraver);
      kort(196, y, 176, 13, { vald: e.id === E.id, klick: () => { valtEget = e.id; }, namn: 'studios-eget-' + i });
      text(kapa(e.titel, 110), 200, y + 4, ok ? F.text : F.dim);
      text(String(e.ar), 368, y + 4, F.dim2, { just: 'h' });
      if (e.kraver && Object.keys(e.kraver).length) ikon(ok ? 'bock' : 'kryss', 342, y + 3, ok ? F.gron2 : F.rod2);
    }, skE);
    text('TILL KONSOL', 196, 128, F.dim);
    if (!aktiva.length) text('INGEN KONSOL SÄLJS – LANSERA EN FÖRST', 196, 137, F.orange2);
    let cx = 196;
    for (const q of aktiva.slice(-4)) { const w = Math.min(86, tw(q.namn) + 8); if (cx + w > 376) break; cx += chip(cx, 135, kapa(q.namn, w - 8), { aktiv: q.id === egenKonsol, klick: () => { egenKonsol = q.id; }, w }) + 3; }
    const klarar = p && klararKrav(p.design, E.kraver);
    if (p && !klarar) {
      const saknar = Object.entries(E.kraver || {}).filter(([g, id]) => !klararKrav(p.design, { [g]: id })).map(([g, id]) => kDelAv(g, id)?.namn || id.toUpperCase());
      text(kapa('KONSOLEN SAKNAR: ' + saknar.join(', '), 178), 196, 149, F.rod2);
    } else if (E.kraver && Object.keys(E.kraver).length) text(kapa('KRÄVER: ' + Object.entries(E.kraver).map(([g, id]) => kDelAv(g, id)?.namn || id).join(', '), 178), 196, 149, F.gron2);
    else text('KRÄVER INGET SÄRSKILT', 196, 149, F.dim);
    const dagar = spelDagar(G);
    text(utv.length ? `TID CA ${dagar} DAGAR · ${kr(500 * utv.length)}/DAG` : 'ANSTÄLL EN SPELUTVECKLARE FÖRST', 196, 158, utv.length ? F.dim : F.orange2);
    const hinder = s ? 'TEAMET GÖR REDAN ETT SPEL' : !utv.length ? 'INGEN SPELUTVECKLARE' : !p ? 'INGEN KONSOL SÄLJS' : !klarar ? 'KONSOLEN KLARAR INTE SPELET' : null;
    knapp(196, 172, 178, 16, hinder || kapa('STARTA ' + E.titel, 170, BIG), { stil: 'gron', F: hinder ? undefined : BIG, av: !!hinder, namn: 'studios-eget-starta',
      klick: () => gjort(startaEgetSpel(G, E.id, p.id), () => { A.ljud('mynt'); meddela(`SPELUTVECKLARNA BÖRJAR GÖRA ${E.titel}!`); }) });
  }

  // ---------- LÅNA ----------
  function lana(ctx) {
    const B = konsolProjekt(G).filter((pr) => pr.status === 'bygger');
    let pr = B.find((x) => x.id === valtBygge); if (!pr && B.length) { pr = B[0]; valtBygge = pr.id; }
    rect(190, 42, 1, 156, F.hi);   // skiljelinjen mellan vänster och höger
    text('KONSOLBYGGET', 9, 46, F.guld);
    if (!pr) {
      stycke('INGET KONSOLBYGGE PÅGÅR. DESIGNA EN NY KONSOL – UNDER BYGGET KAN EN STUDIO LÅNA UT EN UTVECKLARE SÅ ATT DET GÅR FORTARE.', 9, 58, 174, F.dim);
      knapp(9, 92, 90, 12, 'DESIGNA KONSOL', { stil: 'gron', klick: () => A.go('design'), namn: 'studios-design' });
    } else {
      let cx = 9;
      if (B.length > 1) for (const b of B) cx += chip(cx, 53, kapa(b.design.namn, 70), { aktiv: b.id === pr.id, klick: () => { valtBygge = b.id; } }) + 3;
      const y0 = B.length > 1 ? 66 : 56;
      for (let j = 0; j < 62; j++) rect(8, y0 + j, 82, 1, mixa(0x1c2050, 0x0e1230, j / 62));
      visaKonsol({ x: 8, y: y0, w: 82, h: 62 }, pr.design, { vy: 'auto', spin, pitch: 0.32, ctx });
      const mjuk = pr.fas === 'mjukvara', nu = mjuk ? pr.spelDagNu : pr.dagNu, tot = Math.max(1, mjuk ? pr.spelDagar : pr.dagar);
      text(kapa(pr.design.namn, 88), 95, y0 + 2, F.text);
      text(mjuk ? 'MJUKVARA' : 'HÅRDVARA', 95, y0 + 12, mjuk ? F.gron2 : F.bla2);
      if (mjuk && pr.design.packin) text(kapa(pr.design.packin.titel, 88), 95, y0 + 20, F.dim);
      text(`DAG ${nu} AV ${tot}`, 95, y0 + 30, F.text);
      matare(95, y0 + 39, 86, 4, nu / tot, mjuk ? F.gron : F.orange);
      const ly = y0 + 68;
      if (pr.lanad) { ikon('team', 9, ly, F.guld); text(kapa(`LÅNAD FRÅN ${pr.lanad.namn}`, 160), 19, ly + 1, F.guld); stycke('BYGGET GÅR 25 % FORTARE OCH DEN LÅNADE LÄGGER EGNA PRICKAR.', 9, ly + 11, 174, F.dim); }
      else stycke('INGEN LÅNAD UTVECKLARE ÄN. VÄLJ EN STUDIO TILL HÖGER.', 9, ly, 174, F.dim);
    }
    // höger: studiorna som kan låna ut
    const S = lanbaraStudios(G), pris = lanePris(G);
    text('STUDIOS SOM KAN LÅNA UT', 196, 46, F.guld);
    stycke(`EN STUDIO SOM GÖR SPEL TILL DIG LÅNAR UT EN ★★★-UTVECKLARE TILL BYGGET FÖR ${kr(pris)}.`, 196, 55, 178, F.dim);
    if (!S.length) { stycke('INGEN STUDIO KÄNNER ER ÄN. SÄG JA TILL EN FÖRFRÅGAN – SEDAN KAN DE LÅNA UT FOLK.', 196, 78, 178, F.orange2); return; }
    lista(194, 72, 184, 126, S.length, 26, (i, y) => {
      const st = S[i], [rt, rc] = RELATION(G.k.relation[st.id] || 0), spel = G.k.spel.filter((s) => s.studio === st.id).map((s) => s.titel);
      rect(196, y, 176, 24, F.panel2);
      text(kapa(st.namn, 100), 200, y + 3, F.text); text(rt, 200, y + 10, rc);
      text(kapa(spel.join(', '), 100), 200, y + 17, F.dim2);
      const av = !pr || !!pr.lanad || G.bolag.kassa < pris;
      knapp(304, y + 6, 64, 12, pr?.lanad?.studio === st.id ? 'LÅNAD' : 'LÅNA · ' + kr(pris, true), { stil: 'orange', av, namn: 'studios-lana-' + i,
        klick: () => gjort(lanaUtvecklare(G, pr.id, st.id), () => { A.ljud('mynt'); meddela(`${st.namn} LÅNAR UT EN UTVECKLARE TILL ${pr.design.namn}!`); }) });
    }, skL);
  }

  // ---------- RIVALER ----------
  function rivaler(ctx) {
    const R = aktivaRivalKonsoler(G).sort((a, b) => b.lanseradDag - a.lanseradDag);
    const egen = egnaKonsoler(G).filter((p) => p.aktiv).sort((a, b) => b.betyg - a.betyg)[0];
    text('RIVALKONSOLERNA PÅ MARKNADEN', 8, 46, F.guld);
    if (egen) text(kapa(`DIN BÄSTA: ${egen.namn} · ${dec(egen.betyg)}`, 120), 250, 46, F.bla2, { just: 'h' });
    if (!R.length) stycke('INGA RIVALER SÄLJER JUST NU.', 8, 58, 240, F.dim);
    lista(4, 54, 250, 144, R.length, 34, (i, y) => {
      const r = R[i], c = !egen ? F.guld : r.betyg > egen.betyg ? F.rod2 : r.betyg < egen.betyg ? F.gron2 : F.guld;
      rect(6, y, 244, 32, F.panel2);
      ritaKonsol2D(ctx, 8, y + 2, r.modell, 1);
      text(kapa(r.namn, 140), 52, y + 4, F.text);
      text(kapa(`${r.bolag} · ${arAv(r.lanseradDag)} · ${kEnhetAv(r.enhet).namn}`, 150), 52, y + 12, F.dim);
      text(`${kr(r.pris)} · SÄLJS TILL ${arAv(r.slutDag)}`, 52, y + 20, F.dim2);
      textB(dec(r.betyg), 244, y + 6, c, { just: 'h' });
      text('BETYG', 244, y + 17, F.dim2, { just: 'h' });
    }, skR);
    // spelen som gick till rivalerna
    const T = [...G.k.tagna].reverse().map(spelAv).filter(Boolean);
    rect(258, 42, 1, 156, F.hi);
    text(`SPEL HOS RIVALERNA (${T.length})`, 263, 46, F.guld);
    if (!T.length) { stycke('INGA ÄN. SPEL SOM DU SÄGER NEJ TILL, INTE HINNER SVARA PÅ ELLER SOM INGEN TAR GÅR TILL EN RIVAL.', 263, 56, 112, F.dim); return; }
    lista(260, 54, 118, 144, T.length, 18, (i, y) => {
      const s = T[i];
      rect(262, y, 112, 16, F.panel2);
      text(kapa(s.titel, 104), 265, y + 2, F.text);
      // studion börjar ett mellanrum efter stjärnorna (stjärntecknet är lika brett som avståndet till nästa)
      const sx = 265 + tw('★'.repeat(s.stj)) + 4;
      text('★'.repeat(s.stj), 265, y + 9, F.guld); text(kapa(studioAv(s.studio).namn, 374 - sx), sx, y + 9, F.dim);
    }, skT);
  }
}
