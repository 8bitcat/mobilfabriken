// Telefonen på skärmen: riktig 3D (three.js) i ett eget canvas ovanpå spelet, eller pixel-3D direkt i
// spelbilden. Scenerna anropar visa() varje bildruta; det som inte visades döljs i slutBild().
import { skapaTelefonGL } from './telefon-gl.js';
import { ritaTelefon, ritaSkugga } from './telefon3d.js';
import { Pix } from '../core/floor-pix.js';

let el = null, gl = null, glFel = false, visadNu = null, stage = null;
export function init(canvasEl, stageEl) { el = canvasEl; stage = stageEl; }
export const harGL = () => { if (gl) return true; if (glFel || !window.THREE) return false; try { gl = skapaTelefonGL(el, { kompakt: true, genomskinlig: true }); return true; } catch (e) { console.warn('WebGL saknas – pixeltelefon', e); glFel = true; return false; } };

// rect i spelpixlar; o: { vy:'auto'|'fram'|'bak'|'sida'|'under'|'manuell', yaw, pitch, spin, pixel, ctx }
export function visa(rect, tel, o = {}) {
  const vill3d = !o.pixel && harGL();
  if (vill3d) {
    visadNu = { rect, tel, o };
    gl.tel = tel; gl.vy = o.vy || 'manuell'; gl.yaw = o.yaw ?? 0.6; gl.pitch = o.pitch ?? 0.2; gl._spin = o.spin ?? gl._spin;
    return '3d';
  }
  // pixelvarianten ritas rakt in i spelbilden
  const P = new Pix(rect.w, rect.h, rect.x, rect.y);
  const S = Math.round(Math.min(rect.w / (tel.bredd * 1.6), rect.h / (tel.hojd * 1.35)));
  const vinkel = o.vy && VY[o.vy] ? VY[o.vy] : [o.vy === 'auto' ? o.spin ?? 0.6 : o.yaw ?? 0.6, o.pitch ?? 0.2];
  if (o.skugga !== false) ritaSkugga(P, rect.x + rect.w / 2, rect.y + rect.h / 2 + tel.hojd * S * 0.5 + 4, tel.bredd * S * 0.7, 4, 0.45);
  ritaTelefon(P, rect.x + rect.w / 2, rect.y + rect.h / 2 - 2, S, tel, vinkel[0], vinkel[1]);
  o.ctx.drawImage(P.flush(), rect.x, rect.y);
  return 'pixel';
}
const VY = { fram: [0, 0.22], bak: [Math.PI, 0.22], sida: [Math.PI / 2, 0.22], under: [0.3, -1.1] };
// efter att scenen ritat: placera och rendera 3D-fönstret, eller göm det
export function slutBild(skala, dpr) {
  if (!el) return;
  if (!visadNu) { if (el.style.display !== 'none') el.style.display = 'none'; return; }
  const r = visadNu.rect, k = skala / dpr;
  el.style.display = 'block';
  el.style.left = Math.round(r.x * k) + 'px'; el.style.top = Math.round(r.y * k) + 'px';
  el.style.width = Math.round(r.w * k) + 'px'; el.style.height = Math.round(r.h * k) + 'px';
  try { gl.rita(); } catch (e) { console.warn(e); glFel = true; gl = null; el.style.display = 'none'; }
  visadNu = null;
}
export const ms = () => gl?.ms || 0;
// något ligger ovanpå (stort kort, handledningens ruta): göm 3D-fönstret den här bildrutan
export function blockera() { visadNu = null; }
