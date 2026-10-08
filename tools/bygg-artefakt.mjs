// Bygger en spelbar enfilsversion av spelet (för en claude.ai-artefakt): node tools/bygg-artefakt.mjs
// Buntar js/main.js med esbuild (lånas från QISY-frontend), bäddar in CSS och typsnitt som data-URI:er och
// skriver tools/out/artefakt/mobilfabriken.html. three.js laddas från cdnjs (tillåtet i artefakter).
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const esbuild = createRequire('D:/Qisy/QISYFrontend/QISYFrontend-1/package.json')('esbuild');
const ut = path.join(root, 'tools', 'out', 'artefakt'); fs.mkdirSync(ut, { recursive: true });
const r = esbuild.buildSync({ entryPoints: [path.join(root, 'js', 'main.js')], bundle: true, format: 'iife', minify: true, charset: 'utf8', write: false, target: 'es2020', legalComments: 'none' });
const js = r.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const font = (f) => 'data:font/otf;base64,' + fs.readFileSync(path.join(root, 'fonts', f)).toString('base64');
const css = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf8').replace('url(../fonts/pixelstad.otf)', `url(${font('pixelstad.otf')})`).replace('url(../fonts/pixelstad-fet.otf)', `url(${font('pixelstad-fet.otf')})`);
const { VERSION } = await import('../js/version.js');
const html = `<title>Mobilfabriken</title>
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, viewport-fit=cover">
<style>${css}
:root { color-scheme: dark; }
html, body { height: 100%; }
</style>
<div id="spel">
  <canvas id="c" width="384" height="216"></canvas>
  <canvas id="gl"></canvas>
  <input id="falt" type="text" maxlength="22" autocomplete="off" spellcheck="false">
</div>
<div id="vand" class="dold"><div><b>Vänd på mobilen!</b><p>Mobilfabriken spelas liggande.</p><button id="vand-anda">Spela stående ändå</button></div></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js"></script>
<script>${js}</script>
`;
const fil = path.join(ut, 'mobilfabriken.html');
fs.writeFileSync(fil, html);
console.log(fil, (Buffer.byteLength(html) / 1024).toFixed(0) + ' kB', 'v' + VERSION);
