// LANSERINGSDAGEN – välj reklam, se vad den ger, fabrik och första partiet, och tryck LANSERA!
// Tiden står still. Reklamens vinstprognos visas i grönt/rött så att ingen bränner 15 miljoner på en 2007-telefon.
import { U, F, W, rect, ram, text, textB, knapp, panel, kort, ikon, hit, tw, kapa, matare, stycke, ljusa, mixa, BIG } from '../core/ui.js';
import * as Vy3d from '../telefon/vy3d.js';
import { hud } from './ram.js';
import { KAMPANJER } from '../data/varld.js';
import { telAv } from '../sim/design.js';
import { lanseringsKalkyl, lansera, FORSTA_PARTI } from '../sim/projekt.js';
import { tackning } from '../sim/marknad.js';
import { kr, dec, tal } from '../sim/bas.js';
import { lana, NODLAN } from '../sim/spel.js';

export function lansering(A, o = {}) {
  const G = A.G;
  const pr = G.projekt.find((p) => p.id === o.projekt) || G.projekt.find((p) => p.status === 'klar');
  let kamp = 'ingen', spin = 0.4, fel = '', influencer = false;
  if (!pr) return { tid: false, enter() { A.go('kontor'); }, rita() {} };
  return {
    tid: false,
    rita(ctx, dt) {
      spin += dt * 0.7;
      G.flaggor.influencer = influencer;
      const k = lanseringsKalkyl(G, pr.id, kamp);
      rect(0, 14, W, H_ - 14, 0x0b0e1c);
      text('LANSERINGSDAG', 6, 17, F.bla2);
      textB(kapa(pr.design.namn, 200), 6, 25, F.text, { skugga: F.skugga });
      // telefonen
      for (let j = 0; j < 104; j++) rect(4, 38 + j, 112, 1, mixa(0x16204a, 0x0b0e1c, j / 104));
      Vy3d.visa({ x: 4, y: 38, w: 112, h: 104 }, telAv(pr.design), { vy: 'auto', spin, pitch: 0.15, pixel: G.installningar.telefon === 'pixel', ctx });
      const rad = (e, v, y, c = F.text) => { text(e, 6, y, F.dim); text(v, 114, y, c, { just: 'h' }); };
      rad('PRIS', kr(pr.design.pris), 146); rad('ATT TILLVERKA', kr(k.styck), 154); rad('BUGGAR KVAR', String(pr.buggar), 162, pr.buggar >= 5 ? F.rod2 : F.text); rad('UTVECKLING', kr(pr.kostnad), 170);
      // 1. kampanj
      const RX = 124;
      text('1. REKLAMKAMPANJ', RX, 17, F.text);
      KAMPANJER.forEach((c, i) => {
        const x = RX + i * 64, y = 25, vald = kamp === c.id, last = c.tackningMin && tackning(G) < c.tackningMin;
        kort(x, y, 61, 36, { vald, av: last, kant: vald ? c.farg : null, klick: last ? null : () => { kamp = c.id; }, namn: 'kampanj-' + c.id });
        rect(x + 3, y + 3, 9, 9, mixa(c.farg, F.panel, 0.4)); ikon(['kryss', 'graf', 'tidning', 'stjarna'][i], x + 4, y + 4, c.farg);
        text(kapa(c.namn, 44), x + 15, y + 5, F.text);
        textB(c.pris ? kr(c.pris, true) : 'GRATIS', x + 3, y + 15, c.pris ? F.guld : F.gron2);
        if (last) { ikon('las', x + 3, y + 24, F.orange2); text('3 MARKNADER', x + 12, y + 25, F.orange2); }   // kortet rymmer 55 px
        else text(c.hype ? '+' + Math.round(c.hype * 100) + ' % TIDIGT' : 'GRUNDNIVÅ', x + 3, y + 25, c.farg);
        matare(x + 3, y + 31, 55, 2, c.hype / 1.8, c.farg);
      });
      // 2. vad kampanjen ger
      text('2. VAD KAMPANJEN GER', RX, 66, F.text);
      panel(RX, 74, 254, 34, { fyll: F.panel2, kant: F.hi });
      text('EFTERFRÅGAN FÖRSTA VECKAN', RX + 5, 78, F.bla2);   // kort rubrik: reklamens rad står till höger på samma rad
      textB(`${Math.round(k.forstaVeckan)} KÖPARE`, RX + 5, 86, F.text);
      text(`SÄLJS I ${Math.round(tackning(G) * 100)} % AV VÄRLDEN. BETYG, PRIS OCH LAGER AVGÖR RESTEN.`, RX + 5, 98, F.dim2);
      if (kamp !== 'ingen') { const v = k.reklamVinst; text(kapa(`REKLAMEN: +${Math.round(k.extraSalda)} SÅLDA, CA ${v >= 0 ? '+' : ''}${kr(v, true)}`, 138), RX + 249, 78, v >= 0 ? F.gron2 : F.rod2, { just: 'h' }); }
      else text('INGEN REKLAM', RX + 249, 78, F.dim, { just: 'h' });
      if (G.inventarie.influencer) { knapp(RX + 160, 86, 89, 9, influencer ? 'INFLUENCER: PÅ' : 'ANVÄND INFLUENCER', { stil: influencer ? 'rosa' : 'dim', klick: () => { influencer = !influencer; } }); }
      // 3. produktion
      text('3. PRODUKTION', RX, 113, F.text);
      text(`FÖRSTA PARTIET: ${FORSTA_PARTI} ST · ${kr(k.parti)}`, RX, 121, F.text);   // ST: enheten kan vara en laptop eller hörlurar
      text('NYA PARTIER BESTÄLLS AUTOMATISKT NÄR LAGRET TAR SLUT.', RX, 129, F.dim);
      // summa
      text(`FABRIK ${kr(k.fabrik, true)}  +  REKLAM ${kr(k.kamp.pris, true)}  +  FÖRSTA PARTIET ${kr(k.parti, true)}`, RX, 141, F.dim);
      textB('LANSERING TOTALT: ' + kr(k.total), RX, 150, F.text);
      text(`DU HAR ${kr(G.bolag.kassa)} · ${kr(k.kvar)} KVAR EFTER LANSERINGEN`, RX, 162, k.kvar < 0 ? F.rod2 : F.dim);
      // räcker inte pengarna ens utan reklam kommer inget nödlån (kassan går aldrig under noll) – banken
      // erbjuder lånet här i stället, lika mycket som behövs (hela 500 000), 10 % ränta som nödlånet
      const k0 = kamp === 'ingen' ? k : k.kvar < 0 ? lanseringsKalkyl(G, pr.id, 'ingen') : null;
      if (k0 && k0.kvar < 0) {
        const behov = k0.lanBehov || Math.ceil(-k0.kvar / NODLAN) * NODLAN;
        knapp(RX, 169, 82, 9, 'LÅNA ' + kr(behov), { stil: 'orange', namn: 'lansering-lana', klick: () => {
          const r = lana(G, behov, `BANKEN LÅNAR ${G.bolag.namn} ${kr(behov)} TILL LANSERINGEN AV ${pr.design.namn}. RÄNTAN ÄR 10 % OM ÅRET.`);
          if (r?.ok) { fel = ''; A.ljud('mynt'); }
        } });
        text('AV BANKEN · 10 % RÄNTA OM ÅRET', RX + 86, 171, F.dim);
      } else if (k.kvar < 0) text('FÖR DYR REKLAM – VÄLJ EN BILLIGARE', RX, 172, F.orange2);
      else if (fel) text(fel, RX, 172, F.rod2);
      knapp(RX, 180, 90, 18, 'INTE ÄN', { stil: 'morkt', klick: () => A.go('kontor') });
      knapp(RX + 96, 180, 158, 18, 'LANSERA!', { stil: 'gron', F: BIG, av: k.kvar < 0, klick: () => {
        const r = lansera(G, pr.id, kamp); if (!r.ok) { fel = r.fel; A.ljud('fel'); return; }
        if (influencer) G.inventarie.influencer--;
        A.go('show', { produkt: r.produkt.id });
      }, namn: 'lansera' });
      hud(A);
    },
  };
}
const H_ = 202;
