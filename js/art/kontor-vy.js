// Ritar kontoret med möbler och personal – används av KONTORET (navet) och BYGG (byggläget).
// o.platser: visa platserna (byggläget) med o.platsKlick(plats) och o.passar(plats) → bool
import { U, F, W, rect, ram, text, hit, tw, ljusa } from '../core/ui.js';
import { drawPerson } from '../core/people.js';
import { Pix } from './kit.js';
import { rum } from './kontor-art.js';
import { ritaBord, ritaDator, ritaStol, ritaMobel } from './mobler.js';
import { ROLLER } from '../data/varld.js';

const BORDSPRITES = new Map();
function bordSprite(b) {
  const key = b.bord + '|' + b.dator;
  let s = BORDSPRITES.get(key);
  if (!s) {
    const P = new Pix(80, 50);
    ritaDator(P, b.dator, 46, 24);
    ritaBord(P, b.bord, 8, 22);
    const kx = 20, ky = 26; P.rect(kx, ky, 12, 3, 0xd8d4c8); P.hl(kx, ky, 12, 0xf0ece0); for (let i = 1; i < 11; i += 2) P.px(kx + i, ky + 1, 0x8a8478); P.box(kx - 1, ky - 1, 14, 5, 0x6a6460);
    s = { c: P.flush(), ox: 8, oy: 34 };
    BORDSPRITES.set(key, s);
  }
  return s;
}
const STOLAR = new Map();
function stolSprite(id) { let s = STOLAR.get(id); if (!s) { const P = new Pix(22, 20); ritaStol(P, id, 11, 2); s = P.flush(); STOLAR.set(id, s); } return s; }

export function ritaKontor(ctx, A, o = {}) {
  const G = A.G, k = G.kontor, { bild, L } = rum(k);
  const kx = Math.round(Math.max(0, Math.min(L.bredd - W, o.kamera || 0)));
  const ky = Math.round(Math.max(0, Math.min(L.hojd - 202, o.kameraY || 0)));
  ctx.drawImage(bild, kx, ky, W, 202, 0, 0, W, 202);
  ctx.save(); ctx.translate(-kx, -ky);
  const trangt = G.personal.length > 6;
  let hover = null;
  const plats = (typ, i, x, y, w, h) => {
    if (!o.platser) return;
    const p = { typ, i }, passar = o.passar ? o.passar(p) : true, vald = o.vald && o.vald.typ === typ && o.vald.i === i;
    const puls = Math.floor(A.t * 3) % 2;
    if (passar || vald) {
      ctx.fillStyle = vald ? 'rgba(255,210,63,.35)' : `rgba(69,185,100,${puls ? 0.32 : 0.22})`; ctx.fillRect(x, y, w, h);
      ram(x, y, w, h, vald ? F.guld : F.gron2);
    }
    hit(x - kx, y - ky, w, h, { klick: () => o.platsKlick?.(p), namn: `plats-${typ}-${i}` });
  };
  // väggsaker
  k.vagg.forEach((id, i) => { const p = L.vagg[i]; if (!p) return; if (id) ritaMobel(ctx, id, p.x, p.y); plats('vagg', i, p.x - 18, p.y - 2, 36, 26); });
  // golv: möbler och arbetsplatser sorterade på djup
  const saker = [];
  k.golv.forEach((id, i) => { const p = L.golv[i]; if (!p) return; saker.push({ fy: p.fy, rita: () => { if (id) ritaMobel(ctx, id, p.x, p.fy); plats('golv', i, p.x - 14, p.fy - 26, 28, 28); } }); });
  k.bord.forEach((b, i) => {
    const p = L.bord[i]; if (!p) return;
    const person = G.personal.find((x) => x.bord === i);
    saker.push({ fy: p.fy, rita: () => {
      if (!b) {
        if (!o.platser) {
          const x = p.x + 6, y = p.fy - 8, w = 44, h = 12, puls = Math.floor(A.t * 2) % 2;
          ctx.fillStyle = puls ? 'rgba(69,185,100,.55)' : 'rgba(69,185,100,.38)'; ctx.fillRect(x, y, w, h); ram(x, y, w, h, F.gron2);
          text('BORD HÄR', x + w / 2, y + 4, F.text, { just: 'c' });
          hit(x - kx, y - ky, w, h, { klick: () => A.go('bygg', { kategori: 'bord', plats: { typ: 'bord', i } }), namn: 'bordsplats-' + i });
        }
        plats('bord', i, p.x + 2, p.fy - 30, 56, 34);
        return;
      }
      if (b.stol) ctx.drawImage(stolSprite(b.stol), p.x + 18 - 11, p.fy - 35);
      if (person) {
        const blink = Math.floor(A.t * 0.7 + i * 1.7) % 9 === 0;
        drawPerson(ctx, p.x + 18, p.fy, person.look, 'down', blink ? 4 : 5);
        if (!o.platser) hit(p.x + 8 - kx, p.fy - 40 - ky, 22, 30, { klick: () => A.go('personal'), namn: 'person-' + i });
      }
      const sp = bordSprite(b); ctx.drawImage(sp.c, p.x - sp.ox, p.fy - sp.oy);
      if (person && G.projekt.some((x) => x.status === 'bygger')) { ctx.fillStyle = 'rgba(191,224,255,.10)'; ctx.fillRect(p.x + 11, p.fy - 33, 14, 10); }
      if (person && !o.platser) {
        const roll = ROLLER[person.roll];
        if (trangt) { if (U.mus.x + kx >= p.x + 6 && U.mus.x + kx < p.x + 54 && U.mus.y + ky >= p.fy - 40 && U.mus.y + ky < p.fy + 6) hover = { person, roll, x: p.x + 18, y: p.fy - 44 }; }
        else { const nw = Math.max(tw(person.namn), tw(roll.namn)) + 6, nx = p.x + 4, ny = p.fy + 6; rect(nx + 1, ny + 1, nw, 14, 0x05060f); rect(nx, ny, nw, 14, F.papper); ram(nx, ny, nw, 14, 0xb9ad94); text(person.namn, nx + 3, ny + 2, F.blak); text(roll.namn, nx + 3, ny + 8, roll.farg); }
      }
      plats('bord', i, p.x + 2, p.fy - 30, 56, 34);
    } });
  });
  saker.sort((a, b) => a.fy - b.fy).forEach((s) => s.rita());
  // trångt kontor: namnet visas när man pekar på någon
  if (hover) { const t = hover.person.namn + ' · ' + hover.roll.namn, nw = tw(t) + 8, nx = Math.round(hover.x - nw / 2); rect(nx + 1, hover.y + 1, nw, 10, 0x05060f); rect(nx, hover.y, nw, 10, F.papper); rect(nx, hover.y + 9, nw, 1, hover.roll.farg); text(t, nx + 4, hover.y + 3, F.blak); }
  ctx.restore();
  return { L, kx, ky };
}
