// LANSERINGSSHOWEN – spelets belöningsögonblick (8 sekunder, går att hoppa över).
// Ridån går upp, telefonen står i strålkastarna, staplarna TEKNIK/DESIGN/PUTS fylls, betyget rullar upp
// och tre tidningar säger sitt. Betyget visas aldrig innan ridån gått upp.
import { U, F, W, H, rect, ram, text, textB, knapp, panel, papper, ikon, hit, tw, kapa, matare, stycke, ljusa, mixa, BIG } from '../core/ui.js';
import { Pix, mix, mul, hash, bayer, glod, disc, ramp, kant, VARM, DJUP } from '../art/kit.js';
import * as Vy3d from '../telefon/vy3d.js';
import { konfetti } from '../core/notiser.js';
import { telAv } from '../sim/design.js';
import { rimligtPris } from '../sim/marknad.js';
import { kr, dec, tal } from '../sim/bas.js';

let SCEN = null;
const SX = 116;   // scenens mitt (betygskortet står till höger)
function scenBild() {
  if (SCEN) return SCEN;
  const P = new Pix(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) P.px(x, y, mix(0x0a0818, 0x1a1238, y / H + (bayer(x, y) - 0.5) * 0.08));
  // strålkastarkäglor (ditherade)
  const kon = (x0, y0, x1, w1, c) => { for (let y = y0; y < 150; y++) { const t = (y - y0) / (150 - y0), cx = x0 + (x1 - x0) * t, hw = 2 + w1 * t; for (let x = Math.floor(cx - hw); x <= cx + hw; x++) if (bayer(x, y) < 0.35 * (1 - t * 0.5)) P.px(x, y, c, 0.5); } };
  kon(10, 0, SX - 34, 30, 0xffe8a0); kon(226, 0, SX + 34, 30, 0xffe8a0); kon(SX, 0, SX, 24, 0xf4e4ff);
  // podium i tre steg
  const steg = (x, y, w, h, c) => { const R = ramp(c); P.rect(x, y, w, h, R.base); P.hl(x, y, w, R.hi); P.hl(x, y + 1, w, mix(R.hi, R.base, 0.5)); P.hl(x, y + h - 1, w, R.lo); P.box(x - 1, y - 1, w + 2, h + 2, kant(c)); for (let i = 0; i < w; i += 6) P.px(x + i, y + 3, 0xffd23f); };
  steg(SX - 72, 150, 144, 10, 0x3a2a6a); steg(SX - 54, 141, 108, 10, 0x4a3a8a); steg(SX - 36, 133, 72, 9, 0x5a4aa8);
  glod(P, SX, 133, 46, 8, 0xc48bff, 0.3, 3);
  // neonbågar
  for (let a = 0; a < 70; a++) { const v = Math.PI * (1.05 + a / 70 * 0.9); P.px(Math.round(SX + Math.cos(v) * 104), Math.round(150 + Math.sin(v) * 110), 0xff40c8); P.px(Math.round(SX + Math.cos(v) * 110), Math.round(150 + Math.sin(v) * 116), 0x4ff0ff); }
  // publiken
  for (let r = 0; r < 3; r++) for (let i = 0; i < 26; i++) {
    const x = i * 15 + (r % 2) * 7 - 4, y = 170 + r * 14, c = mix(0x1a1430, 0x2a2048, r / 2), s = hash(i, r, 3);
    disc(P, x + 6, y, 5, 5, (px, py) => P.px(px, py, c)); P.rect(x, y + 4, 12, 14, c);
    P.hl(x + 2, y - 5, 8, mix(c, 0xc48bff, 0.4));
    if (s > 0.6) { P.rect(x + 9, y - 8, 2, 3, 0xbfe8ff); glod(P, x + 10, y - 7, 3, 3, 0xbfe8ff, 0.4, 2); }
    if (s < 0.25) { P.line(x + 1, y + 4, x - 2, y - 6, c); P.line(x + 11, y + 4, x + 14, y - 6, c); }
  }
  SCEN = P.flush(); return SCEN;
}
function ridå(ctx, oppen) {
  // röd sammet, går isär. 3D-telefonen ligger i ett eget lager ovanpå – ridåhalvorna klipper bort den
  const bredd = Math.round((W / 2) * (1 - oppen));
  Vy3d.skymma({ x: 0, y: 14, w: bredd, h: H - 14 }); Vy3d.skymma({ x: W - bredd, y: 14, w: bredd, h: H - 14 });
  for (let x = 0; x < bredd; x++) {
    const v = (x % 16) / 16, c = mix(0x8a1020, 0xd03040, Math.sin(v * Math.PI) * 0.8);
    ctx.fillStyle = '#' + c.toString(16).padStart(6, '0');
    ctx.fillRect(x, 14, 1, H - 14); ctx.fillRect(W - 1 - x, 14, 1, H - 14);
  }
  if (bredd > 2) { ctx.fillStyle = '#e8b230'; ctx.fillRect(0, 14, W, 4); }
}
function citat(p) {
  const T = p.staplar.teknik, D = p.staplar.design, P = p.staplar.puts;
  return [
    ['MOBILTIDNINGEN', T >= 1 ? 'TOPPMODERN TEKNIK RAKT IGENOM.' : T >= 0.85 ? 'GEDIGEN TEKNIK, INGA ÖVERRASKNINGAR.' : T >= 0.65 ? 'HALKAR EFTER PÅ NÅGRA DELAR.' : 'TEKNIKEN ÄR FRÅN I FJOL.'],
    ['SKÄRM & SIGNAL', D >= 0.8 ? 'ÅRETS VACKRASTE TELEFON.' : D >= 0.6 ? 'SNYGG OCH GENOMTÄNKT.' : D >= 0.45 ? 'DEN NYA KROPPEN VÄNDER HUVUDEN.' : 'SER UT SOM EN TEGELSTEN.'],
    ['BYTESIZE', p.buggar >= 5 ? 'BUGGIGARE ÄN ETT MYRBO. AJ.' : P < 0.45 ? 'STRESSAT OCH OPUTSAT. MER FORSKNING!' : P < 0.75 ? 'OKEJ, MEN KÄNNS LITE OFÄRDIG.' : 'KNAPPT EN BUGG I SIKTE. GEDIGET.'],
  ];
}
const omdome = (b) => (b < 4 ? 'USEL' : b < 5 ? 'SVAG' : b < 6 ? 'OKEJ' : b < 7 ? 'BRA' : b < 8 ? 'MYCKET BRA' : b < 9 ? 'FANTASTISK' : 'MÄSTERVERK');

export function show(A, o = {}) {
  const G = A.G, p = G.produkter.find((x) => x.id === o.produkt) || G.produkter[G.produkter.length - 1];
  let t = o.t || 0, spin = 0, ljudSteg = o.t ? 9 : 0;
  if (!p) return { tid: false, enter() { A.go('kontor'); }, rita() {} };
  const C = citat(p), stj = Math.max(1, Math.round(p.betyg / 2)), rim = Math.round(rimligtPris(p.lanseradDag, p.betyg, p.design.enhet) / 10) * 10;
  const hoppa = () => { if (t < 8.5) { t = 8.5; ljudSteg = 9; } };
  return {
    tid: false,
    tangent(e) { if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') { hoppa(); return true; } return false; },
    rita(ctx, dt) {
      t += dt; spin += dt * (t < 3 ? 2.5 : 0.8);
      if (ljudSteg === 0) { A.ljud('trumvirvel'); ljudSteg = 1; }
      if (ljudSteg === 1 && t > 1.6) { A.ljud('fanfar'); ljudSteg = 2; }
      if (ljudSteg === 2 && t > 5.6) { if (p.betyg >= 7) { konfetti(120); A.ljud('mal'); } else if (p.betyg < 5) A.ljud('tomat'); else A.ljud('kaching'); ljudSteg = 3; }
      ctx.drawImage(scenBild(), 0, 0);
      // titeln
      text('PRESENTERAR', SX, 20, F.lila2, { just: 'c' });
      textB(kapa(p.namn, 112), SX, 28, F.guld, { just: 'c', k: 2, skugga: 0x8a2a6a });
      // telefonen på podiet
      Vy3d.visa({ x: SX - 40, y: 56, w: 80, h: 94 }, telAv(p.design), { vy: 'auto', spin, pitch: 0.1, pixel: G.installningar.telefon === 'pixel', ctx, skugga: false });
      // betygskortet (efter ridån)
      if (t > 2.8) {
        const x = 236, y = 18, w = 144, h = 182;
        papper(x, y, w, h);
        text('KRITIKERBETYG', x + 6, y + 5, 0x9e1b22);
        const f = Math.min(1, Math.max(0, (t - 4.6) / 1.2)), visat = Math.round(p.betyg * f * 10) / 10;
        textB(dec(visat, 1), x + 6, y + 13, F.blak, { k: 2 }); text('/10', x + 6 + tw(dec(visat, 1), BIG, 2) + 2, y + 20, 0x7a7470);
        if (t > 5.8) { for (let i = 0; i < 5; i++) ikon('stjarna', x + 70 + i * 8, y + 13, i < stj ? 0xe8b230 : 0xb9ad94); rect(x + 70, y + 22, 50, 9, p.betyg >= 6 ? 0x2f8f46 : p.betyg >= 5 ? 0xe8b230 : 0x9e1b22); text(omdome(p.betyg), x + 95, y + 24, 0xffffff, { just: 'c' }); }
        // staplarna fylls en i taget
        const stapel = (namn, v, c, yy, start) => { const ff = Math.min(1, Math.max(0, (t - start) / 0.6)); text(namn, x + 6, yy, 0x3a3440); matare(x + 6, yy + 7, w - 12, 5, Math.min(1, v) * ff, c, { bak: 0xd8cfbe, segment: 10 }); };
        stapel('TEKNIK MOT MARKNADEN', p.staplar.teknik, 0x3a7bd5, y + 36, 3.0);
        stapel('DESIGN', p.staplar.design, 0x8e5bd1, y + 52, 3.5);
        stapel('PUTS', p.staplar.puts, 0x45b964, y + 68, 4.0);
        if (t > 6.0) {
          C.forEach(([tid, rad], i) => {
            const ff = Math.min(1, Math.max(0, (t - 6.0 - i * 0.5) / 0.6)); if (ff <= 0) return;
            const s = '"' + rad.slice(0, Math.round(rad.length * ff)) + (ff >= 1 ? '"' : '');
            const yy = y + 86 + i * 20; stycke(s, x + 6, yy, w - 12, F.blak); text('- ' + tid, x + w - 6, yy + 13, 0x6a4ad0, { just: 'h' });
          });
        }
        if (t > 8.2) {
          // resultatrutor
          const ry = y + 148; const ruta = (e, v, xx, c = F.blak) => { text(e, xx, ry, 0x7a7470); text(v, xx, ry + 7, c); };
          ruta('RÄTT PRIS', kr(rim), x + 6); ruta('DITT PRIS', kr(p.pris), x + 52, p.pris > rim * 1.25 ? 0x9e1b22 : F.blak); ruta('BUGGAR', String(p.buggar), x + 104, p.buggar >= 5 ? 0x9e1b22 : F.blak);
          text(`LANSERINGEN KOSTADE ${kr(p.kostnader.fabrik + p.kostnader.reklam + p.kostnader.tillverkning)}`, x + 6, ry + 17, 0x9e1b22);
        }
      }
      ridå(ctx, Math.min(1, Math.max(0, (t - 1.4) / 1.2)));
      if (t < 1.6) { textB(G.bolag.namn, W / 2, 90, F.guld, { just: 'c', skugga: 0x3a0810 }); text('PRESENTERAR STOLT …', W / 2, 104, F.text, { just: 'c' }); }
      if (t < 8.5) knapp(W - 64, H - 14, 60, 10, 'HOPPA ÖVER', { stil: 'morkt', klick: hoppa });
      else {
        knapp(8, H - 16, 100, 12, 'TILL KONTORET', { stil: 'gron', klick: () => { A.spelaTid(); A.go('kontor'); }, namn: 'show-klar' });
        knapp(112, H - 16, 100, 12, 'SE TELEFONEN', { stil: 'morkt', klick: () => { A.spelaTid(); A.go('telefoner', { produkt: p.id }); } });
      }
      rect(0, 0, W, 14, 0x0a0d1a);
      text('LANSERINGEN · ' + G.bolag.namn, 4, 4, F.dim);
    },
  };
}
