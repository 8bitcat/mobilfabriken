// Ritar appikonen (32×32 pixlar, spelets pixeltelefon) och sparar den i icons/: node tools/ikon.mjs
// 512 och 192 är hela förstoringar (×16, ×6). 180 (iPhone) är ×5 med kant runt om.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = createRequire('D:/Qisy/QISYFrontend/QISYFrontend-1/package.json')('playwright');
const b = await chromium.launch();
const p = await b.newPage();
const ut = await p.evaluate(() => {
  const N = 32, c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d');
  const px = (X, Y, f) => { x.fillStyle = f; x.fillRect(X, Y, 1, 1); };
  const rekt = (X, Y, W, H, f) => { x.fillStyle = f; x.fillRect(X, Y, W, H); };
  // bakgrund: mörk studio med en ljusare kärna i tre band (som spelets 3D-scen)
  rekt(0, 0, N, N, '#070912');
  for (let y = 0; y < N; y++) for (let X = 0; X < N; X++) {
    const d = Math.hypot((X - 15.5) / 1.1, y - 14);
    if (d < 9) px(X, y, '#1c2350'); else if (d < 13) px(X, y, '#141a3c'); else if (d < 17) px(X, y, '#0d1128');
    else if (d < 19 && (X + y) % 2) px(X, y, '#0d1128');
  }
  // blått golvsken under telefonen
  rekt(8, 28, 16, 1, '#2a4bd0'); rekt(11, 29, 10, 1, '#1a2d8a'); rekt(7, 28, 2, 1, '#1a2d8a'); rekt(23, 28, 2, 1, '#1a2d8a');
  rekt(12, 28, 8, 1, '#3a5bff');
  // telefonens kropp med kontur, ljus vänsterkant och skuggad högerkant
  const X0 = 8, Y0 = 4, W = 16, H = 24;
  rekt(X0, Y0, W, H, '#05060f');
  rekt(X0 + 1, Y0 + 1, W - 2, H - 2, '#ebebee');
  rekt(X0 + 1, Y0 + 2, 1, H - 4, '#ffffff');
  rekt(X0 + W - 2, Y0 + 2, 1, H - 4, '#b8bcc8');
  rekt(X0 + 2, Y0 + H - 2, W - 4, 1, '#c9ccd6');
  px(X0, Y0, '#070912'); px(X0 + W - 1, Y0, '#070912'); px(X0, Y0 + H - 1, '#070912'); px(X0 + W - 1, Y0 + H - 1, '#070912');
  px(X0 + 1, Y0 + 1, '#05060f'); px(X0 + W - 2, Y0 + 1, '#05060f'); px(X0 + 1, Y0 + H - 2, '#05060f'); px(X0 + W - 2, Y0 + H - 2, '#05060f');
  // hörlur och kamera
  rekt(14, 5, 4, 1, '#3a3c48'); px(19, 5, '#1d2a44');
  // skärmen: blått → lila → rosa i band med ditherade övergångar
  const SX = 12, SY = 7, SW = 8, SH = 16;
  rekt(SX - 1, SY - 1, SW + 2, SH + 2, '#05070f');
  const band = ['#2d7cf0', '#3f6ce8', '#5a56dc', '#6a4bd8', '#8c4ec8', '#b453b6', '#e05aa8'];
  for (let y = 0; y < SH; y++) {
    const t = y / (SH - 1) * (band.length - 1), i = Math.floor(t), f = t - i;
    for (let X = 0; X < SW; X++) px(SX + X, SY + y, f > 0.5 && (X + y) % 2 ? band[Math.min(band.length - 1, i + 1)] : band[i]);
  }
  rekt(SX, SY, 2, 1, '#9cc4ff'); px(SX, SY + 1, '#9cc4ff');   // glans uppe till vänster
  // appikoner 2×2 i tre rader och dockan längst ner
  const ik = [['#38c45e', '#4f8cff', '#ffcf3f'], ['#ff6a3d', '#ffffff', '#4ff0ff'], ['#ff4060', '#45b964', '#8e5bd1']];
  ik.forEach((rad, r) => rad.forEach((f, k) => rekt(SX + k * 3, SY + 3 + r * 3, 2, 2, f)));
  rekt(SX + 1, SY + SH - 3, SW - 2, 2, 'rgba(255,255,255,0.35)');
  rekt(SX + 2, SY + SH - 3, 1, 1, '#19b38a'); rekt(SX + 4, SY + SH - 3, 1, 1, '#38c45e'); rekt(SX + 6, SY + SH - 3, 1, 1, '#ff4060');
  // hemknapp
  rekt(15, 25, 2, 1, '#9aa0b0');
  // gnistor: guld uppe till höger, cyan nere till vänster
  rekt(25, 5, 1, 3, '#ffd23f'); rekt(24, 6, 3, 1, '#ffd23f'); px(25, 6, '#fff4c0');
  px(6, 17, '#4ff0ff'); px(5, 18, '#2ac8c8'); px(7, 18, '#2ac8c8'); px(6, 19, '#4ff0ff'); px(6, 18, '#d8ffff');
  px(27, 20, '#ff40c8');
  const skala = (k, total) => { const d = document.createElement('canvas'); d.width = d.height = total; const y = d.getContext('2d'); y.imageSmoothingEnabled = false; y.fillStyle = '#070912'; y.fillRect(0, 0, total, total); const o = Math.round((total - N * k) / 2); y.drawImage(c, o, o, N * k, N * k); return d.toDataURL('image/png'); };
  return { 512: skala(16, 512), 192: skala(6, 192), 180: skala(5, 180), 32: skala(1, 32) };
});
fs.mkdirSync(path.join(root, 'icons'), { recursive: true });
for (const [s, d] of Object.entries(ut)) fs.writeFileSync(path.join(root, 'icons', `ikon-${s}.png`), Buffer.from(d.split(',')[1], 'base64'));
console.log('icons/ikon-{32,180,192,512}.png');
await b.close();
