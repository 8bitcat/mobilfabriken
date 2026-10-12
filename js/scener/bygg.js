// BYGG – möblera kontoret. Välj en möbel i paletten, tryck på en grön plats. Tryck på en möbel som står
// för att ta bort den (hälften av priset tillbaka) eller lägga den i förrådet. Tiden står still.
import { U, F, W, rect, ram, text, textB, knapp, panel, kort, chip, ikon, hit, tw, kapa, stjarnor, stycke, ljusa, mixa, BIG } from '../core/ui.js';
import { Pix } from '../art/kit.js';
import { ritaKontor } from '../art/kontor-vy.js';
import { rum } from '../art/kontor-art.js';
import { ritaBord, ritaDator, ritaStol, mobelSprite } from '../art/mobler.js';
import { hud, flikrad } from './ram.js';
import { KATEGORIER, KATALOG, MOBEL } from '../data/katalog.js';
import { kontorAv } from '../data/varld.js';
import { kontorsVarden, placera, taBort, lastOk } from '../sim/kontor.js';
import { kr, dec } from '../sim/bas.js';

const TUMMAR = new Map();
function tumnagel(m) {
  let c = TUMMAR.get(m.id); if (c) return c;
  const P = new Pix(44, 22);
  if (m.plats === 'bord') ritaBord(P, m.id, 22 - Math.round((m.id === 'fallbord' ? 50 : 58) / 2), 4);
  else if (m.plats === 'dator') ritaDator(P, m.id, 22, 19);
  else if (m.plats === 'stol') { if (m.id === 'pall') { P.rect(16, 12, 12, 3, 0x6a6e7a); P.hl(16, 12, 12, 0x9a9eaa); P.rect(18, 15, 2, 6, 0x4a4e5a); P.rect(24, 15, 2, 6, 0x4a4e5a); } else ritaStol(P, m.id, 22, 3); }
  c = P.flush();
  if (m.plats === 'golv' || m.plats === 'vagg') {
    const s = mobelSprite(m.id), cv = document.createElement('canvas'); cv.width = 44; cv.height = 22; const x = cv.getContext('2d');
    const golv = m.plats === 'golv';
    x.drawImage(s.c, Math.round(22 - s.ax), golv ? Math.round(21 - s.ay) : Math.round(1 - s.ay) + 0);
    c = cv;
  }
  if (m.plats === 'golvtyp' || m.plats === 'vaggtyp') {
    const r = rum({ niva: 'garage', golvtyp: m.plats === 'golvtyp' ? m.id : 'betong', vaggtyp: m.plats === 'vaggtyp' ? m.id : 'tegel' }).bild;
    const cv = document.createElement('canvas'); cv.width = 44; cv.height = 22; cv.getContext('2d').drawImage(r, 120, m.plats === 'golvtyp' ? 110 : 40, 44, 22, 0, 0, 44, 22); c = cv;
  }
  TUMMAR.set(m.id, c); return c;
}
const slotTyp = (m) => (m.plats === 'dator' || m.plats === 'stol' ? 'bord' : m.plats);
const bonusText = (m) => m.bonus.arbetsfart != null ? `FART +${Math.round(m.bonus.arbetsfart * 100)} %` : m.bonus.forskning != null ? `FORSKNING +${Math.round(m.bonus.forskning * 100)} %` : m.bonus.buggfix ? `BUGGFIX +${Math.round(m.bonus.buggfix * 100)} %` : m.bonus.trivsel ? `TRIVSEL +${m.bonus.trivsel}` : m.plats === 'golvtyp' ? 'GOLV' : m.plats === 'vaggtyp' ? 'VÄGG' : 'DEKOR';

export function bygg(A, o = {}) {
  const G = A.G;
  let kat = o.kategori || 'bord', vald = null, valdPlats = o.plats || null, sk = 0, fel = '', kamera = 0, kameraY = 0, drag = null;
  if (o.plats && o.plats.typ === 'bord') kat = 'bord';
  const gjort = (r) => { if (!r || !r.ok) { fel = r?.fel || 'GICK INTE'; A.ljud('fel'); return false; } fel = ''; A.ljud('mynt'); return true; };
  function platsKlick(p) {
    if (vald) {
      const m = MOBEL[vald];
      if (slotTyp(m) !== p.typ) { fel = 'PASSAR INTE HÄR'; A.ljud('fel'); return; }
      if (gjort(placera(G, p, vald)) && !G.kontor.forrad.includes(vald) && m.plats !== 'bord') { /* behåll valet för fler */ }
      return;
    }
    valdPlats = valdPlats && valdPlats.typ === p.typ && valdPlats.i === p.i ? null : p;
  }
  const passar = (p) => {
    if (!vald) return false;
    const m = MOBEL[vald], t = slotTyp(m);
    if (t !== p.typ) return false;
    if ((m.plats === 'dator' || m.plats === 'stol') && !G.kontor.bord[p.i]) return false;
    return true;
  };
  return {
    tid: false,
    ner(x, y) { if (y > 24 && y < 136) drag = { x, y, k: kamera, ky: kameraY }; },
    flytta(x, y) { if (drag && U.mus.ned) { kamera = drag.k - (x - drag.x); kameraY = drag.ky - (y - drag.y); } },
    upp() { drag = null; },
    rita(ctx) {
      const v = kontorsVarden(G);
      const { L } = ritaKontor(ctx, A, { kamera, kameraY, platser: true, passar, platsKlick, vald: valdPlats });
      kamera = Math.max(0, Math.min(L.bredd - W, kamera)); kameraY = Math.max(0, Math.min(L.hojd - 202 + 54, kameraY));
      if (L.hojd > 202 || L.bredd > W) hit(0, 25, W, 110, { hjul: (dy) => { kameraY += dy; }, block: false });
      // statusrad
      rect(0, 14, W, 11, 0x0a0d1a);
      const st = [['KONTOR', v.kontorStj], ['TRIVSEL', v.trivselStj], ['PRODUKTIVITET', v.prodStj]];
      let x = 4;
      for (const [n, s] of st) { text(n, x, 17, F.dim); x += tw(n) + 3; ikon('stjarna', x, 16, F.guld); x += 8; text(dec(s, 1), x, 17, F.text); x += 18; }
      text(`BORD ${G.kontor.bord.filter(Boolean).length}/${G.kontor.bord.length}`, x, 17, F.text); x += 46;
      text(`FORSKNING ×${dec(v.forskning, 2)}`, x, 17, F.bla2); x += 70;
      text(`BUGGFIX ×${dec(v.buggfix, 2)}`, x, 17, F.rod2);
      // vald plats: ta bort
      if (valdPlats && !vald) {
        const k = G.kontor, id = valdPlats.typ === 'bord' ? k.bord[valdPlats.i]?.bord : k[valdPlats.typ][valdPlats.i];
        if (id) {
          const m = MOBEL[id], pris = valdPlats.typ === 'bord' ? ['bord', 'dator', 'stol'].reduce((s, d) => s + (MOBEL[k.bord[valdPlats.i][d]]?.pris || 0), 0) : m.pris;
          panel(120, 28, 144, 34);
          text(valdPlats.typ === 'bord' ? 'ARBETSPLATS' : m.namn, 126, 32, F.guld);
          knapp(126, 40, 64, 9, 'SÄLJ +' + kr(pris / 2, true), { stil: 'rod', klick: () => { if (gjort(taBort(G, valdPlats, true))) valdPlats = null; } });
          knapp(194, 40, 64, 9, 'TILL FÖRRÅDET', { stil: 'morkt', klick: () => { if (gjort(taBort(G, valdPlats, false))) valdPlats = null; } });
          text('ELLER VÄLJ EN NY MÖBEL NEDAN', 126, 52, F.dim);
        }
      }
      // paletten
      const py = 148;
      rect(0, py, W, 54, 0x0a0d1a); rect(0, py, W, 1, F.orange);
      // förrådet har en egen knapp längst till vänster (i kategoriraden fick den aldrig plats)
      knapp(1, py + 2, 49, 9, 'FÖRRÅD ' + G.kontor.forrad.length, { stil: 'orange', aktiv: kat === 'forrad', klick: () => { kat = 'forrad'; sk = 0; vald = null; }, namn: 'bygg-forrad' });
      let cx = 54;
      for (const c of KATEGORIER) { const w = tw(c.namn) + 6; if (cx + w > W - 30) break; knapp(cx, py + 2, w, 9, c.namn, { stil: 'dim', aktiv: kat === c.id, klick: () => { kat = c.id; sk = 0; vald = null; }, namn: 'bygg-kat-' + c.id }); cx += w + 2; }
      knapp(W - 28, py + 2, 26, 9, 'KLAR', { stil: 'gron', klick: () => A.go('kontor'), namn: 'bygg-klar' });
      const varor = kat === 'forrad' ? [...new Set(G.kontor.forrad)].map((id) => MOBEL[id]).filter(Boolean) : KATALOG.filter((m) => m.kat === kat);
      const kw = 48, maxSk = Math.max(0, varor.length * kw - (W - 8));
      sk = Math.max(0, Math.min(maxSk, sk));
      ctx.save(); ctx.beginPath(); ctx.rect(4, py + 13, W - 8, 40); ctx.clip();
      varor.forEach((m, i) => {
        const x = 4 + i * kw - sk, y = py + 13;
        if (x > W || x + kw < 0) return;
        const las = !lastOk(G, m), iForrad = G.kontor.forrad.includes(m.id), rad = iForrad || G.bolag.kassa >= m.pris;
        const aktiv = (G.kontor.golvtyp === m.id || G.kontor.vaggtyp === m.id);
        kort(x, y, kw - 3, 39, { vald: vald === m.id || aktiv, av: las, kant: m.exklusiv ? F.guld2 : null, klick: las ? null : () => {
          if (m.plats === 'golvtyp' || m.plats === 'vaggtyp') { gjort(placera(G, { typ: m.plats }, m.id)); return; }
          if (valdPlats && slotTyp(m) === valdPlats.typ) { if (gjort(placera(G, valdPlats, m.id))) valdPlats = null; return; }
          vald = vald === m.id ? null : m.id; valdPlats = null;
        }, namn: 'mobel-' + m.id });
        ctx.save(); ctx.beginPath(); ctx.rect(x + 1, y + 1, kw - 5, 18); ctx.clip(); ctx.drawImage(tumnagel(m), x + 1, y - 3); ctx.restore();
        if (m.stj) stjarnor(x + 2, y + 1, m.stj, m.stj, F.guld);
        text(kapa(m.namn, kw - 6), x + 2, y + 20, las ? F.dim2 : F.text);
        text(kapa(bonusText(m), kw - 6), x + 2, y + 27, F.gron2);
        if (las) { ikon('las', x + 2, y + 32, F.orange); text(kapa(kontorAv(m.las).namn, kw - 14), x + 11, y + 34, F.orange2); }
        else text(iForrad ? 'I FÖRRÅDET' : m.pris ? kr(m.pris, true) : 'GRATIS', x + 2, y + 34, iForrad ? F.bla2 : !m.pris ? F.gron2 : rad ? F.text : F.rod2);
      });
      ctx.restore();
      if (kat === 'forrad' && !varor.length) stycke('FÖRRÅDET ÄR TOMT. HIT HAMNAR MÖBLER SOM DU LÄGGER UNDAN ELLER SOM INTE FÅR PLATS VID EN FLYTT.', 8, py + 22, W - 16, F.dim);
      if (maxSk > 0) hit(4, py + 13, W - 8, 40, { hjul: (dy) => { sk += dy * 2; }, block: false });
      if (maxSk > 0) { knapp(0, py + 22, 6, 18, '<', { klick: () => { sk -= kw * 3; } }); knapp(W - 6, py + 22, 6, 18, '>', { klick: () => { sk += kw * 3; } }); }
      if (vald) { const m = MOBEL[vald]; const t = { bord: 'TRYCK PÅ EN GRÖN ARBETSPLATS', dator: 'TRYCK PÅ ETT BORD FÖR NY DATOR', stol: 'TRYCK PÅ ETT BORD FÖR NY STOL', golv: 'TRYCK PÅ EN GRÖN GOLVPLATS', vagg: 'TRYCK PÅ EN GRÖN PLATS PÅ VÄGGEN' }[m.plats]; rect(0, 136, W, 10, F.gron); text(t + ' · ' + m.namn + ' · ' + (m.pris ? kr(m.pris) : 'GRATIS'), W / 2, 138, F.text, { just: 'c' }); }
      if (fel) { rect(0, 126, W, 10, F.rod); text(fel, W / 2, 128, F.text, { just: 'c' }); }
      hud(A); flikrad(A, 'bygg');
    },
  };
}
