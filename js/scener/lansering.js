// LANSERINGSDAGEN – välj reklam, se vad den ger, fabrik och första partiet, och tryck LANSERA!
// Tiden står still. Reklamens vinstprognos visas i grönt/rött så att ingen bränner 15 miljoner på en 2007-telefon.
// En konsol (konsolspelet) visas i 3D med visaKonsol och får konsolernas kampanjer (kampanjer(G, d)): annonser i
// speltidningar från 1982, nätannonser från 1998, priserna i årets prisnivå. Med fem kort blir korten smalare.
import { U, F, W, rect, ram, text, textB, knapp, panel, kort, ikon, hit, tw, kapa, matare, stycke, ljusa, mixa, BIG } from '../core/ui.js';
import * as Vy3d from '../telefon/vy3d.js';
import { visaKonsol } from '../konsol/konsol-vy.js';
import { hud } from './ram.js';
import { telAv } from '../sim/design.js';
import { lanseringsKalkyl, lansera, kampanjer, FORSTA_PARTI } from '../sim/projekt.js';
import { tackning } from '../sim/marknad.js';
import { kr, dec, tal, proc } from '../sim/bas.js';
import { lana, NODLAN } from '../sim/spel.js';
import { $t } from '../core/i18n.js';

// konsolkampanjernas namn på korten: det längsta som ryms (korten är 61 px, eller 42/51 px när de är fem)
const K_KORTNAMN = { ingen: [$t('INGEN REKLAM'), $t('INGEN')], tidning: [$t('SPELTIDNINGAR'), $t('TIDNINGAR'), $t('TIDNING')], natet: [$t('NÄTANNONSER'), $t('NÄTET')], tv: [$t('TV-REKLAM'), $t('TV')], global: [$t('GLOBAL LANSERING'), $t('GLOBAL')] };
const K_IKON = { ingen: 'kryss', tidning: 'tidning', natet: 'globe', tv: 'mega', global: 'stjarna' };
const kortNamn = (c, maxW) => { const alt = K_KORTNAMN[c.id] || [c.namn]; return alt.find((s) => tw(s) <= maxW) || kapa(alt[alt.length - 1], maxW); };

export function lansering(A, o = {}) {
  const G = A.G;
  const pr = G.projekt.find((p) => p.id === o.projekt) || G.projekt.find((p) => p.status === 'klar');
  let kamp = 'ingen', spin = 0.4, fel = '', influencer = false;
  if (!pr) return { tid: false, enter() { A.go('kontor'); }, rita() {} };
  const konsol = pr.design.linje === 'konsol';
  return {
    tid: false,
    rita(ctx, dt) {
      spin += dt * 0.7;
      G.flaggor.influencer = influencer;
      const k = lanseringsKalkyl(G, pr.id, kamp), K = kampanjer(G, pr.design);
      rect(0, 14, W, H_ - 14, 0x0b0e1c);
      text($t('LANSERINGSDAG'), 6, 17, F.bla2);
      textB(kapa(pr.design.namn, 200), 6, 25, F.text, { skugga: F.skugga });
      // telefonen (eller konsolen)
      for (let j = 0; j < 104; j++) rect(4, 38 + j, 112, 1, mixa(0x16204a, 0x0b0e1c, j / 104));
      if (konsol) visaKonsol({ x: 4, y: 38, w: 112, h: 104 }, pr.design, { vy: 'auto', spin, pitch: 0.3, pixel: G.installningar.telefon === 'pixel', ctx });
      else Vy3d.visa({ x: 4, y: 38, w: 112, h: 104 }, telAv(pr.design), { vy: 'auto', spin, pitch: 0.15, pixel: G.installningar.telefon === 'pixel', ctx });
      const rad = (e, v, y, c = F.text) => { text(e, 6, y, F.dim); text(v, 114, y, c, { just: 'h' }); };
      rad($t('PRIS'), kr(pr.design.pris), 146); rad($t('ATT TILLVERKA'), kr(k.styck), 154); rad($t('BUGGAR KVAR'), String(pr.buggar), 162, pr.buggar >= 5 ? F.rod2 : F.text); rad($t('UTVECKLING'), kr(pr.kostnad), 170);
      if (konsol) {
        // spelet i lådan (med stjärnorna det fick) och studiornas spel till konsolen (de klara släpps med den)
        const pk = pr.design.packin, stj = pk ? '★'.repeat(pr.packinStj || 1) : '', sw = stj ? tw(stj) + 3 : 0;
        text($t('I LÅDAN'), 6, 178, F.dim);
        if (pk) { text(stj, 114, 178, F.guld, { just: 'h' }); text(kapa(pk.titel, 108 - 40 - sw), 114 - sw, 178, F.gron2, { just: 'h' }); }
        else text($t('INGET SPEL'), 114, 178, F.dim2, { just: 'h' });
        const med = (G.k?.spel || []).filter((s) => s.konsol === pr.id).length;
        rad($t('STUDIOSPEL'), med ? $t`${med} PÅ GÅNG` : $t('INGA ÄN'), 186, med ? F.lila2 : F.dim2);
      }
      // 1. kampanj. Telefonens fyra kort är 61 px; konsolspelets fem (från 1998) är 42 (INGEN) och 51 px.
      const RX = 124, fem = K.length > 4;
      text($t('1. REKLAMKAMPANJ'), RX, 17, F.text);
      let kx = RX;
      K.forEach((c, i) => {
        const w = !fem ? 61 : c.id === 'ingen' ? 42 : 51, x = fem ? kx : RX + i * 64, y = 25, vald = kamp === c.id, last = c.tackningMin && tackning(G) < c.tackningMin;
        kx += w + 2;
        kort(x, y, w, 36, { vald, av: last, kant: vald ? c.farg : null, klick: last ? null : () => { kamp = c.id; }, namn: 'kampanj-' + c.id });
        rect(x + 3, y + 3, 9, 9, mixa(c.farg, F.panel, 0.4)); ikon(konsol ? (last && fem ? 'las' : K_IKON[c.id] || 'tidning') : ['kryss', 'graf', 'tidning', 'stjarna'][i], x + 4, y + 4, last && fem ? F.orange2 : c.farg);
        text(konsol ? kortNamn(c, w - 18) : kapa(c.namn, 44), x + 15, y + 5, F.text);
        textB(c.pris ? kr(c.pris, true) : $t('GRATIS'), x + 3, y + 15, c.pris ? F.guld : F.gron2);
        // smala kort: låset står i ikonrutan och procenten utan "TIDIGT"
        if (last && fem) text($t('3 MARKNADER'), x + 3, y + 25, F.orange2);
        else if (last) { ikon('las', x + 3, y + 24, F.orange2); text($t('3 MARKNADER'), x + 12, y + 25, F.orange2); }   // kortet rymmer 55 px
        else if (fem) text('+' + proc(c.hype), x + 3, y + 25, c.farg);
        else text(c.hype ? $t`+${Math.round(c.hype * 100)} % TIDIGT` : $t('GRUNDNIVÅ'), x + 3, y + 25, c.farg);
        matare(x + 3, y + 31, w - 6, 2, c.hype / 1.8, c.farg);
      });
      // 2. vad kampanjen ger
      text($t('2. VAD KAMPANJEN GER'), RX, 66, F.text);
      panel(RX, 74, 254, 34, { fyll: F.panel2, kant: F.hi });
      text($t('EFTERFRÅGAN FÖRSTA VECKAN'), RX + 5, 78, F.bla2);   // kort rubrik: reklamens rad står till höger på samma rad
      textB(Math.round(k.forstaVeckan) === 1 ? $t('1 KÖPARE') : $t`${Math.round(k.forstaVeckan)} KÖPARE`, RX + 5, 86, F.text);
      text(konsol ? $t`SÄLJS I ${Math.round(tackning(G) * 100)} % AV VÄRLDEN. BETYG, PRIS OCH SPELEN AVGÖR RESTEN.` : $t`SÄLJS I ${Math.round(tackning(G) * 100)} % AV VÄRLDEN. BETYG, PRIS OCH LAGER AVGÖR RESTEN.`, RX + 5, 98, F.dim2);
      if (kamp !== 'ingen') { const v = k.reklamVinst; text(kapa($t`REKLAMEN: +${Math.round(k.extraSalda)} SÅLDA, CA ${(v >= 0 ? '+' : '') + kr(v, true)}`, 138), RX + 249, 78, v >= 0 ? F.gron2 : F.rod2, { just: 'h' }); }
      else text($t('INGEN REKLAM'), RX + 249, 78, F.dim, { just: 'h' });
      if (G.inventarie.influencer) { knapp(RX + 160, 86, 89, 9, influencer ? $t('INFLUENCER: PÅ') : $t('ANVÄND INFLUENCER'), { stil: influencer ? 'rosa' : 'dim', klick: () => { influencer = !influencer; } }); }
      // 3. produktion
      text($t('3. PRODUKTION'), RX, 113, F.text);
      text(konsol ? $t`FÖRSTA PARTIET: ${FORSTA_PARTI} KONSOLER · ${kr(k.parti)}` : $t`FÖRSTA PARTIET: ${FORSTA_PARTI} ST · ${kr(k.parti)}`, RX, 121, F.text);   // ST: enheten kan vara en laptop eller hörlurar
      text($t('NYA PARTIER BESTÄLLS AUTOMATISKT NÄR LAGRET TAR SLUT.'), RX, 129, F.dim);
      // summa
      text($t`FABRIK ${kr(k.fabrik, true)}  +  REKLAM ${kr(k.kamp.pris, true)}  +  FÖRSTA PARTIET ${kr(k.parti, true)}`, RX, 141, F.dim);
      textB($t`LANSERING TOTALT: ${kr(k.total)}`, RX, 150, F.text);
      text($t`DU HAR ${kr(G.bolag.kassa)} · ${kr(k.kvar)} KVAR EFTER LANSERINGEN`, RX, 162, k.kvar < 0 ? F.rod2 : F.dim);
      // räcker inte pengarna ens utan reklam kommer inget nödlån (kassan går aldrig under noll) – banken
      // erbjuder lånet här i stället, lika mycket som behövs (hela 500 000), 10 % ränta som nödlånet
      const k0 = kamp === 'ingen' ? k : k.kvar < 0 ? lanseringsKalkyl(G, pr.id, 'ingen') : null;
      if (k0 && k0.kvar < 0) {
        const behov = k0.lanBehov || Math.ceil(-k0.kvar / NODLAN) * NODLAN;
        knapp(RX, 169, 82, 9, $t`LÅNA ${kr(behov)}`, { stil: 'orange', namn: 'lansering-lana', klick: () => {
          const r = lana(G, behov, $t`BANKEN LÅNAR ${G.bolag.namn} ${kr(behov)} TILL LANSERINGEN AV ${pr.design.namn}. RÄNTAN ÄR 10 % OM ÅRET.`);
          if (r?.ok) { fel = ''; A.ljud('mynt'); }
        } });
        text($t('AV BANKEN · 10 % RÄNTA OM ÅRET'), RX + 86, 171, F.dim);
      } else if (k.kvar < 0) text($t('FÖR DYR REKLAM – VÄLJ EN BILLIGARE'), RX, 172, F.orange2);
      else if (fel) text(fel, RX, 172, F.rod2);
      knapp(RX, 180, 90, 18, $t('INTE ÄN'), { stil: 'morkt', klick: () => A.go('kontor') });
      knapp(RX + 96, 180, 158, 18, $t('LANSERA!'), { stil: 'gron', F: BIG, av: k.kvar < 0, klick: () => {
        const r = lansera(G, pr.id, kamp); if (!r.ok) { fel = r.fel; A.ljud('fel'); return; }
        if (influencer) G.inventarie.influencer--;
        A.go('show', { produkt: r.produkt.id });
      }, namn: 'lansera' });
      hud(A);
    },
  };
}
const H_ = 202;
