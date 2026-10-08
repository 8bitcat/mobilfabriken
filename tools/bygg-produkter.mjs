// Bygger produktkatalogen (alla enhetstyper i 3D) som en fil för en claude.ai-artefakt:
//   node tools/bygg-produkter.mjs [utfil]   (standard: tools/out/produkter/produkter.html)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const esbuild = createRequire('D:/Qisy/QISYFrontend/QISYFrontend-1/package.json')('esbuild');
const fil = path.resolve(process.argv[2] || path.join(root, 'tools', 'out', 'produkter', 'produkter.html'));
fs.mkdirSync(path.dirname(fil), { recursive: true });
const r = esbuild.buildSync({ entryPoints: [path.join(root, 'tools', 'produkter', 'produkter.js')], bundle: true, format: 'iife', minify: true, charset: 'utf8', write: false, target: 'es2020', legalComments: 'none' });
const js = r.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const font = (f) => 'data:font/otf;base64,' + fs.readFileSync(path.join(root, 'fonts', f)).toString('base64');
const { VERSION } = await import('../js/version.js');

const html = `<title>Mobilfabrikens produkter</title>
<style>
@font-face { font-family: 'Pixelstad'; src: url(${font('pixelstad.otf')}) format('opentype'); font-display: swap; }
@font-face { font-family: 'Pixelstad Fet'; src: url(${font('pixelstad-fet.otf')}) format('opentype'); font-display: swap; }
:root {
  --bg: #070912; --panel: #10142a; --panel2: #1b2340; --linje: #2f3a62; --fg: #f1ebe0; --dim: #9aa3c7; --dim2: #6b7399;
  --guld: #ffd23f; --bla: #6aa6ff; --kat: #e8e8f0; color-scheme: dark;
  --pix: 'Pixelstad', ui-monospace, 'Cascadia Mono', Consolas, monospace; --pixf: 'Pixelstad Fet', 'Pixelstad', ui-monospace, Consolas, monospace;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 15px/1.55 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
.sida { max-width: 1200px; margin: 0 auto; padding: 28px 16px 48px; display: grid; gap: 20px; }
header { display: grid; gap: 6px; }
.over { font: 16px/1 var(--pix); color: var(--dim); letter-spacing: 1px; text-transform: uppercase; }
h1 { font: 32px/1.1 var(--pixf); color: var(--guld); margin: 0; text-wrap: balance; text-transform: uppercase; letter-spacing: 1px; }
.lede { margin: 0; max-width: 64ch; color: var(--dim); }
button { font: inherit; color: inherit; }

/* korten */
#val { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px; }
.kort { display: grid; gap: 4px; padding: 6px 6px 10px; background: var(--panel); border: 2px solid var(--linje); border-radius: 0; cursor: pointer; text-align: left; position: relative; }
.kort::before { content: ''; position: absolute; left: -2px; right: -2px; top: -2px; height: 4px; background: var(--kat); opacity: 0.85; }
.kort:hover { border-color: var(--dim2); }
.kort[aria-pressed="true"] { border-color: var(--guld); background: var(--panel2); }
.tumme { aspect-ratio: 4 / 3; background: radial-gradient(ellipse at 50% 55%, #1c2350, #0b0e1c 75%); display: grid; place-items: center; overflow: hidden; }
.tumme img { width: 100%; height: 100%; object-fit: cover; display: block; }
.namn { font: 16px/1.1 var(--pix); text-transform: uppercase; letter-spacing: 0.5px; padding: 0 2px; }
.ar { font-size: 12px; color: var(--dim); padding: 0 2px; letter-spacing: 0.5px; font-variant-numeric: tabular-nums; }

/* scenen */
.scen { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 16px; align-items: start; }
.stage { position: sticky; top: calc(env(safe-area-inset-top, 0px) + 12px); border: 2px solid var(--linje); background: #0b0e1c; aspect-ratio: 16 / 10; max-width: 100%; }
#duk { width: 100%; height: 100%; display: block; touch-action: none; cursor: grab; }
#duk.drar { cursor: grabbing; }
.verktyg { position: absolute; left: 10px; right: 10px; bottom: 10px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: space-between; align-items: flex-end; pointer-events: none; }
.verktyg > * { pointer-events: auto; }
.vyer { display: flex; gap: 4px; }
.vyer button, .chip { font: 16px/1 var(--pix); text-transform: uppercase; padding: 7px 10px 6px; background: rgba(16, 20, 42, 0.86); border: 2px solid var(--linje); cursor: pointer; }
.vyer button[aria-pressed="true"], .chip[aria-pressed="true"] { border-color: var(--guld); color: var(--guld); }
#oppnaRad { display: flex; align-items: center; gap: 8px; background: rgba(16, 20, 42, 0.86); border: 2px solid var(--linje); padding: 5px 10px; }
#oppnaRad span { font: 16px/1 var(--pix); text-transform: uppercase; color: var(--dim); }
#oppna { width: 140px; accent-color: var(--guld); }
.tips { position: absolute; top: 10px; left: 12px; font: 16px/1 var(--pix); color: var(--dim2); text-transform: uppercase; pointer-events: none; }
#fel { position: absolute; inset: 0; display: grid; place-items: center; padding: 24px; text-align: center; color: var(--dim); }

/* infopanelen */
#info { background: var(--panel); border: 2px solid var(--linje); border-top: 4px solid var(--kat); padding: 16px; display: grid; gap: 14px; min-width: 0; }
#iNamn { font: 24px/1.1 var(--pixf); text-transform: uppercase; margin: 0; color: var(--fg); letter-spacing: 0.5px; }
#iRad { font: 16px/1 var(--pix); color: var(--kat); text-transform: uppercase; margin: -6px 0 0; }
#iOm { margin: 0; color: var(--fg); }
dl { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; font-variant-numeric: tabular-nums; }
dt { font: 16px/1.3 var(--pix); color: var(--dim); text-transform: uppercase; }
dd { margin: 0; font-weight: 600; }
dd small { font-weight: 400; color: var(--dim); }
h3 { font: 16px/1 var(--pix); color: var(--dim); text-transform: uppercase; margin: 0 0 6px; letter-spacing: 0.5px; }
#iForskning { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
#iForskning li { display: grid; gap: 4px; }
#iForskning b { font: 16px/1 var(--pix); color: var(--kat); text-transform: uppercase; font-weight: 400; }
#iForskning .tom { color: var(--dim); }
.steg { display: flex; flex-wrap: wrap; gap: 4px; }
.nod { font-size: 12px; background: var(--panel2); border: 1px solid var(--linje); padding: 2px 6px; white-space: nowrap; }
.nod i { font-style: normal; color: var(--guld); font-variant-numeric: tabular-nums; }
#farger { display: grid; grid-template-columns: repeat(6, 28px); gap: 6px; }
.farg { width: 28px; height: 22px; background: var(--f); border: 2px solid #05060f; box-shadow: inset 0 2px 0 rgba(255,255,255,0.25); cursor: pointer; padding: 0; }
.farg[aria-pressed="true"] { outline: 2px solid var(--guld); outline-offset: 2px; }
#ytor { display: flex; flex-wrap: wrap; gap: 6px; }
#ytor .chip { background: var(--panel2); }
footer { color: var(--dim2); font-size: 12px; }

@media (max-width: 960px) { .scen { grid-template-columns: minmax(0, 1fr); } .stage { position: relative; top: 0; } #val { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 480px) { h1 { font-size: 24px; } #val { grid-template-columns: repeat(2, minmax(0, 1fr)); } .stage { aspect-ratio: 4 / 5; } #oppna { width: 110px; } .vyer button { padding: 6px 7px 5px; } }
</style>
<div class="sida">
  <header>
    <span class="over">Mobilfabriken · produktkatalog</span>
    <h1>Allt ni kan tillverka</h1>
    <p class="lede">Telefonen är bara början. Under spelets gång forskar bolaget fram fem nya sorters prylar, och alla byggs i samma designer. Välj en pryl, dra i bilden för att snurra den och prova färger och ytor.</p>
  </header>
  <nav id="val" aria-label="Prylar"></nav>
  <section class="scen">
    <div class="stage">
      <canvas id="duk" aria-label="3D-modell av vald pryl"></canvas>
      <span class="tips">Dra för att snurra</span>
      <div id="fel">Laddar 3D …</div>
      <div class="verktyg">
        <div class="vyer" role="group" aria-label="Vy">
          <button type="button" data-vy="auto" aria-pressed="true">Snurra</button>
          <button type="button" data-vy="fram" aria-pressed="false">Fram</button>
          <button type="button" data-vy="bak" aria-pressed="false">Bak</button>
          <button type="button" data-vy="sida" aria-pressed="false">Sida</button>
        </div>
        <label id="oppnaRad" hidden><span id="oppnaNamn">Öppna</span><input id="oppna" type="range" min="0" max="100" value="100"></label>
      </div>
    </div>
    <aside id="info">
      <div><h2 id="iNamn"></h2></div>
      <p id="iRad"></p>
      <p id="iOm"></p>
      <dl id="iFakta"></dl>
      <div><h3 id="iForskRubrik">Egen forskning</h3><ul id="iForskning"></ul></div>
      <div><h3>Färg</h3><div id="farger"></div></div>
      <div><h3>Yta</h3><div id="ytor"></div></div>
    </aside>
  </section>
  <footer>Samma 3D-modeller som i spelets designer · Mobilfabriken ${VERSION} · siffrorna kommer från spelets egna tabeller</footer>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js"></script>
<script>${js}</script>
`;
fs.writeFileSync(fil, html);
console.log(fil, (Buffer.byteLength(html) / 1024).toFixed(0) + ' kB');
