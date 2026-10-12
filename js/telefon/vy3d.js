// Telefonen på skärmen: riktig 3D (three.js) i ett eget canvas ovanpå spelet, eller pixel-3D direkt i
// spelbilden. Scenerna anropar visa() varje bildruta; det som inte visades döljs i slutBild().
// 3D-fönstret ligger ovanpå hela spelbilden, så det som ritas ovanpå telefonen (ridån i showen, Mios ruta,
// toasts) anmäler sin ruta med skymma() – den delen av 3D-fönstret klipps bort den bildrutan.
import { skapaTelefonGL } from './telefon-gl.js';
import { ritaTelefon, ritaSkugga } from './telefon3d.js';
import { Pix } from '../core/floor-pix.js';

let el = null, gl = null, glFel = false, visadNu = null, stage = null, skymt = [], klipp = '';
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
// något ritas ovanpå 3D-fönstret den här bildrutan: { x, y, w, h } i spelpixlar
export function skymma(r) { if (r && r.w > 0 && r.h > 0) skymt.push({ x: r.x, y: r.y, w: r.w, h: r.h }); }
// efter att scenen ritat: placera och rendera 3D-fönstret, eller göm det
export function slutBild(skala, dpr) {
  const lock = skymt; skymt = [];
  if (!el) return;
  if (!visadNu) { if (el.style.display !== 'none') el.style.display = 'none'; return; }
  const r = visadNu.rect, k = skala / dpr;
  visadNu = null;
  // hålen i 3D-fönstret (relativt fönstret, spelpixlar); överlappande hål slås ihop till en ruta
  let hal = [];
  for (const s of lock) {
    const x0 = Math.max(s.x, r.x) - r.x, y0 = Math.max(s.y, r.y) - r.y, x1 = Math.min(s.x + s.w, r.x + r.w) - r.x, y1 = Math.min(s.y + s.h, r.y + r.h) - r.y;
    if (x1 > x0 && y1 > y0) hal.push([x0, y0, x1, y1]);
  }
  for (let slogs = true; slogs;) {
    slogs = false;
    for (let i = 0; i < hal.length && !slogs; i++) for (let j = i + 1; j < hal.length; j++) {
      const a = hal[i], b = hal[j];
      if (a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]) { hal[i] = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]; hal.splice(j, 1); slogs = true; break; }
    }
  }
  // helt skymd: göm fönstret
  if (hal.some(([x0, y0, x1, y1]) => x0 <= 0 && y0 <= 0 && x1 >= r.w && y1 >= r.h)) { if (el.style.display !== 'none') el.style.display = 'none'; return; }
  const px = (v) => Math.round(v * k) + 'px';
  const nyttKlipp = hal.length ? `polygon(evenodd, 0px 0px, ${px(r.w)} 0px, ${px(r.w)} ${px(r.h)}, 0px ${px(r.h)}, 0px 0px, ${hal.map(([x0, y0, x1, y1]) => `${px(x0)} ${px(y0)}, ${px(x1)} ${px(y0)}, ${px(x1)} ${px(y1)}, ${px(x0)} ${px(y1)}, ${px(x0)} ${px(y0)}, 0px 0px`).join(', ')})` : '';
  if (nyttKlipp !== klipp) { klipp = nyttKlipp; el.style.clipPath = klipp; el.style.webkitClipPath = klipp; }
  el.style.display = 'block';
  el.style.left = Math.round(r.x * k) + 'px'; el.style.top = Math.round(r.y * k) + 'px';
  el.style.width = Math.round(r.w * k) + 'px'; el.style.height = Math.round(r.h * k) + 'px';
  try { gl.rita(); } catch (e) { console.warn(e); glFel = true; gl = null; el.style.display = 'none'; }
}
export const ms = () => gl?.ms || 0;
// något ligger ovanpå hela bilden (stort kort, välkomstrutan): göm 3D-fönstret den här bildrutan
export function blockera() { visadNu = null; }
