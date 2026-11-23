// Konsolerna i spelet: 3D-modellen i Vy3d-fönstret (samma studio som telefonerna) eller, utan WebGL, en
// förstorad pixelbild (40×28) av närmaste rivalkonsol i js/konsol/konsoller.js. Används av designern,
// lanseringen, showen, konsollistan, studios och startskärmen.
//   visaKonsol(rect, d | modellId, { vy, spin, yaw, pitch, ctx, oppning })
//   ritaKonsol2D(ctx, x, y, modellId, k = 1)   – pixelbilden, k gånger förstorad
import './konsol-gl.js';   // registrerar de 30 formerna i BYGGARE (js/telefon/telefon-gl.js)
import * as Vy3d from '../telefon/vy3d.js';
import { KONSOL } from './konsoller.js';
import { konsolTel } from '../sim/design.js';

// 3D-formen → närmaste pixelbild (rivalkonsolernas modell-id i K_RIVALER använder samma tabell)
export const SPRITE = {
  'konsol-hemdator': 'kommodor', 'konsol-ataro': 'ataro', 'konsol-koleko': 'ataro', 'konsol-lada': 'nes', 'konsol-mastersystem': 'nes',
  'konsol-megadrive': 'megadrive', 'konsol-ficka': 'gameboj', 'konsol-snes': 'snes', 'konsol-skiva': 'playstatio', 'konsol-saturnus': 'playstatio',
  'konsol-n64': 'n64', 'konsol-gbc': 'gameboj', 'konsol-dromcast': 'dromcast', 'konsol-torn00': 'ps2', 'konsol-xlada': 'xlada',
  'konsol-gamekub': 'n64', 'konsol-ds': 'gameboj', 'konsol-x360': 'xlada', 'konsol-smal': 'vi', 'konsol-ps3': 'ps3', 'konsol-viu': 'vi',
  'konsol-ps4': 'ps4', 'konsol-xladaett': 'ps4', 'konsol-hybrid': 'svitsch', 'konsol-kvest': 'svitsch', 'konsol-torn20': 'ps5',
  'konsol-seriex': 'ps5', 'konsol-angdack': 'svitsch', 'konsol-svitsch2': 'svitsch2', 'konsol-nasta': 'ps6',
};
const cache = new Map();
function bild(modell) {
  if (cache.has(modell)) return cache.get(modell);
  const k = KONSOL[SPRITE[modell]] || KONSOL.ataro;
  const c = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  if (!c) return null;
  c.width = 40; c.height = 28; k.rita(c.getContext('2d'), 0, 0);
  cache.set(modell, c); return c;
}
export function ritaKonsol2D(ctx, x, y, modell, k = 1) {
  const b = bild(modell); if (!b || !ctx) return;
  const s = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
  ctx.drawImage(b, Math.round(x), Math.round(y), 40 * k, 28 * k);
  ctx.imageSmoothingEnabled = s;
}
// d = en konsoldesign (d.linje 'konsol') eller ett modell-id ('konsol-ataro')
export function visaKonsol(rect, d, o = {}) {
  const tel = typeof d === 'string' ? { enhet: d, kropp: null, yta: 'klassisk' } : konsolTel(d);
  if (!o.pixel && Vy3d.harGL()) { Vy3d.visa(rect, tel, { vy: o.vy || 'auto', spin: o.spin, yaw: o.yaw, pitch: o.pitch ?? 0.32, ctx: o.ctx }); return '3d'; }
  const k = Math.max(1, Math.floor(Math.min(rect.w / 40, rect.h / 28)));
  ritaKonsol2D(o.ctx, rect.x + (rect.w - 40 * k) / 2, rect.y + (rect.h - 28 * k) / 2, tel.enhet, k);
  return 'pixel';
}
