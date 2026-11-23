// Bygger designdokumentet för konsolläget som en fil för en claude.ai-artefakt:
//   node tools/konsol-design/bygg.mjs [utfil]   (standard: tools/out/konsol-design/konsolfabriken.html)
// Text i innehall.mjs, levande bilder i sida.js (buntas med esbuild från QISY-frontendens node_modules).
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { md } from './md.mjs';
import { D } from './innehall.mjs';

const har = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(har, '..', '..');
const fil = path.resolve(process.argv[2] || path.join(root, 'tools', 'out', 'konsol-design', 'konsolfabriken.html'));
fs.mkdirSync(path.dirname(fil), { recursive: true });
const esbuild = createRequire('D:/Qisy/QISYFrontend/QISYFrontend-1/package.json')('esbuild');
const js = esbuild.buildSync({ entryPoints: [path.join(har, 'sida.js')], bundle: true, format: 'iife', minify: true, charset: 'utf8', write: false, target: 'es2020', legalComments: 'none' }).outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fontFet = 'data:font/otf;base64,' + fs.readFileSync(path.join(root, 'fonts', 'pixelstad-fet.otf')).toString('base64');

const BILD = {
  bygget: '<figure class="bild ram"><div class="rull"><canvas id="bild-bygget" aria-label="Garaget 1982 med ingenjören och spelutvecklaren"></canvas></div><figcaption>Garaget 1982. Siv har byggt konsolen, och nu skriver Nils PANG! på hemdatorn. Ritat med spelets egna figurer och gränssnitt.</figcaption></figure>',
  pitch: '<figure class="bild ram"><div class="rull"><canvas id="bild-pitch" aria-label="Studiokortet: Svampstudion vill göra Super Marco Bros."></canvas></div><figcaption>Studiokortet i spelets eget gränssnitt. Det markerade valet växlar så att man ser vad varje knapp gör.</figcaption></figure>',
  reklam: '<figure class="bild ram"><div class="rull"><canvas id="bild-reklam" aria-label="Reklamfilmen 1986 och 2026"></canvas></div><figcaption>Reklamfilmen: samma upplägg 1986 och 2026, men vardagsrummet, TV:n och konsolen följer eran.</figcaption></figure>',
  tidslinje: '<div class="tidslinje ram"><canvas id="bild-tidslinje" aria-label="Rivalkonsolerna 1977–2027"></canvas></div><p class="liten">Dra i raden för att se hela tidslinjen.</p>',
  glimtar: '<div id="bild-glimtar" class="glimtar"></div>',
  forskning: '<figure class="bild ram"><div class="rull"><canvas id="bild-forskning" aria-label="Forskningen: telefonavdelningen låses upp 2007"></canvas></div><figcaption>Forskningen 2007 i spelets eget gränssnitt. Först krävs tre konsoltekniker, sedan forskas telefonavdelningen fram, och då öppnas fliken MOBIL med telefonen och prylarna.</figcaption></figure>',
  appar: '<div id="bild-appar" class="apparrad"></div>',
};
const sektion = (s) => `<section class="sek" id="${s.id}"><h2>${esc(s.rubrik)}</h2>${md(s.md).replace(/<p>\[\[bild:(\w+)\]\]<\/p>/g, (_, id) => BILD[id] || '')}</section>`;
const toc = D.sektioner.map((s) => `<li><a href="#${s.id}">${esc(s.rubrik)}</a></li>`).join('');
const fragor = D.fragor.map((f, i) => `<div class="fraga ram" data-id="${esc(f.id)}"><div class="fnr">${i + 1}</div><div class="ftext"><p class="f">${esc(f.fraga)}</p><p class="rek"><b>Mitt förslag:</b> ${esc(f.rek)}</p><div class="svarsrad"><button class="knapp liten ja" data-svar="ja">Ja, så</button><button class="knapp liten nej" data-svar="annat">Annat …</button></div><textarea placeholder="Ditt svar eller ändring" rows="2"></textarea></div></div>`).join('');
const namn = D.namn.map((n) => `<label class="namnval ram"><input type="radio" name="namn" value="${esc(n.namn)}"><span class="pix">${esc(n.namn)}</span><small>${esc(n.motiv)}</small></label>`).join('');

const html = `<title>${esc(D.titel)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap">
<style>
@font-face { font-family: 'Pixelstad Fet'; src: url(${fontFet}) format('opentype'); font-display: block; }
:root { --bg: #0b0e1c; --bg2: #10142a; --panel: #151b2e; --panel2: #1b2340; --line: #2f3a62; --line2: #45507a; --fg: #f1ebe0; --muted: #c9c4d6; --dim: #8c93b4; --gold: #e8b230; --gold2: #ffd23f; --green: #45b964; --shadow: #05060f; --paper: #f1ebe0; --ink: #17151a; color-scheme: dark; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.55 'IBM Plex Sans', system-ui, sans-serif; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 16px 56px; }
h1, h2, .pix { font-family: 'Pixelstad Fet', 'IBM Plex Mono', monospace; font-weight: 400; text-wrap: balance; text-transform: uppercase; }
h1 { font-size: 40px; line-height: 1.1; margin: 0; color: var(--gold2); text-shadow: 3px 3px 0 var(--shadow); }
h2 { font-size: 24px; margin: 0 0 12px; color: var(--gold2); text-shadow: 2px 2px 0 var(--shadow); }
h3, h4 { font: 600 17px/1.3 'IBM Plex Sans', sans-serif; margin: 18px 0 6px; }
p { margin: 0 0 10px; max-width: 72ch; }
.liten { font-size: 13px; color: var(--dim); }
code { font: 500 14px 'IBM Plex Mono', monospace; background: var(--bg2); padding: 1px 5px; border: 1px solid var(--line); }
ul, ol { padding-left: 22px; margin: 0 0 12px; max-width: 76ch; } li { margin: 0 0 4px; }
strong { font-weight: 600; color: #fff; }
.tabell { overflow-x: auto; margin: 0 0 14px; }
table { border-collapse: collapse; font-size: 14px; min-width: 100%; }
th, td { border: 1px solid var(--line); padding: 6px 9px; text-align: left; vertical-align: top; }
th { background: var(--panel2); font-weight: 600; } td { color: var(--muted); font-variant-numeric: tabular-nums; }
tr:nth-child(even) td { background: rgba(255,255,255,0.025); }
pre.mermaid { background: var(--paper); color: var(--ink); padding: 12px; overflow-x: auto; }
header { padding-block: 28px 18px; border-bottom: 2px solid var(--line); margin-bottom: 22px; }
header p { color: var(--muted); margin: 10px 0 0; }
.tagg { display: inline-block; font: 500 12px/1 'IBM Plex Mono', monospace; letter-spacing: .08em; text-transform: uppercase; color: var(--ink); background: var(--gold); padding: 5px 7px 4px; margin-bottom: 10px; box-shadow: 2px 2px 0 var(--shadow); }
.ram { background: var(--panel); border: 2px solid var(--line2); box-shadow: 4px 4px 0 var(--shadow); }
.loop { padding: 16px 20px; background: var(--paper); color: var(--ink); border-color: #b9ad94; margin-bottom: 22px; }
.loop h2 { color: var(--ink); text-shadow: none; } .loop p { color: var(--ink); font-size: 17px; max-width: none; } .loop strong { color: var(--ink); }
.layout { display: grid; grid-template-columns: minmax(0, 1fr); gap: 24px; }
@media (min-width: 1000px) { .layout { grid-template-columns: 210px minmax(0, 1fr); align-items: start; } .toc { position: sticky; top: calc(env(safe-area-inset-top, 0px) + 8px); } }
.toc { padding: 12px 14px; font-size: 14px; } .toc ol { padding-left: 18px; margin: 0; } .toc a { color: var(--muted); text-decoration: none; } .toc a:hover { color: var(--gold2); }
.toc .etikett { font: 500 11px/1 'IBM Plex Mono', monospace; letter-spacing: .08em; text-transform: uppercase; color: var(--dim); margin-bottom: 8px; display: block; }
.sek { margin-bottom: 36px; min-width: 0; } .layout > div { min-width: 0; }
.bild { margin: 8px 0 16px; padding: 6px; } .bild .rull { overflow-x: auto; } .bild canvas { display: block; width: 100%; height: auto; image-rendering: pixelated; aspect-ratio: 16 / 9; }
@media (max-width: 640px) { .bild canvas { width: 576px; max-width: none; } .bild figcaption::before { content: "Dra i bilden för att se hela. "; color: var(--dim); } }
.bild figcaption, .glimt figcaption { font-size: 13px; color: var(--muted); margin-top: 6px; }
.tidslinje { overflow-x: auto; padding: 6px; margin: 8px 0 4px; } .tidslinje canvas { display: block; image-rendering: pixelated; height: auto; max-width: none; }
.glimtar { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); gap: 12px; margin: 8px 0 14px; }
.apparrad { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; margin: 8px 0 14px; }
.app { margin: 0; min-width: 0; } .telram { background: #101014; border: 3px solid #34343e; border-radius: 18px; padding: 16px 8px; box-shadow: 4px 4px 0 var(--shadow); }
.app.ligg .telram { padding: 8px 16px; } .telram canvas { display: block; image-rendering: pixelated; border-radius: 3px; height: auto; max-width: 100%; }
.app.stad canvas { width: 180px; } .app.ligg canvas { width: 384px; }
.app figcaption { font-size: 13px; color: var(--muted); margin-top: 8px; } .app figcaption b { display: block; font: 400 16px 'Pixelstad Fet', monospace; color: var(--gold2); text-transform: uppercase; } .app figcaption span { color: var(--dim); }
.glimt { margin: 0; padding: 6px; } .glimt canvas { display: block; width: 100%; height: auto; image-rendering: pixelated; background: #000; }
.glimt figcaption b { display: block; font: 400 16px 'Pixelstad Fet', monospace; color: var(--gold2); text-transform: uppercase; }
.glimt figcaption span { color: var(--dim); }
.fraga { display: grid; grid-template-columns: 32px minmax(0, 1fr); gap: 12px; padding: 12px 14px; margin-bottom: 14px; }
.fraga .fnr { font: 400 20px 'Pixelstad Fet', monospace; color: var(--gold2); } .fraga .f { font-weight: 600; max-width: none; } .fraga .rek { color: var(--muted); font-size: 15px; max-width: none; }
.svarsrad { display: flex; flex-wrap: wrap; gap: 8px; margin: 6px 0; }
.knapp { font: 500 14px/1 'IBM Plex Sans', sans-serif; color: var(--fg); background: var(--panel2); border: 2px solid var(--line2); box-shadow: 3px 3px 0 var(--shadow); padding: 9px 12px; cursor: pointer; }
.knapp.liten { font-size: 13px; padding: 6px 9px; } .knapp.ja.aktiv { background: var(--green); color: var(--ink); } .knapp.nej.aktiv { background: var(--gold); color: var(--ink); }
.fraga textarea { width: 100%; font: 15px 'IBM Plex Sans', sans-serif; background: var(--bg2); color: var(--fg); border: 2px solid var(--line2); padding: 6px 8px; display: none; }
.fraga.annat textarea { display: block; }
.namnlista { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 12px; }
.namnval { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 4px 10px; align-items: center; padding: 10px 12px; cursor: pointer; }
.namnval .pix { font-size: 22px; color: var(--gold2); } .namnval small { grid-column: 2; color: var(--muted); } .namnval input { accent-color: var(--gold); }
.svar { margin-top: 14px; padding: 12px 14px; background: var(--bg2); border: 1px dashed var(--line2); font: 500 13px/1.5 'IBM Plex Mono', monospace; color: var(--muted); white-space: pre-wrap; }
footer { margin-top: 40px; color: var(--dim); font-size: 13px; border-top: 1px solid var(--line); padding-top: 12px; }
@media (max-width: 480px) { h1 { font-size: 30px; } }
</style>
<div class="wrap">
  <header>
    <span class="tagg">Nytt spelläge · utkast ${esc(D.version)} · ${esc(D.datum)}</span>
    <h1>${esc(D.titel)}</h1>
    <p>${esc(D.undertitel)}</p>
  </header>
  <div class="ram loop"><h2>Spelloopen i ett stycke</h2>${md(D.loop)}</div>
  <section class="sek" id="diagram"><h2>Loopen som diagram</h2><pre class="mermaid">${esc(D.diagram)}</pre></section>
  <div class="layout">
    <nav class="toc ram"><span class="etikett">Innehåll</span><ol>${toc}<li><a href="#fragor">Frågor till Carl</a></li><li><a href="#namn">Lägets namn</a></li></ol></nav>
    <div>
      ${D.sektioner.map(sektion).join('\n')}
      <section class="sek" id="fragor"><h2>Frågor till Carl</h2><p>Svara direkt här. "Ja, så" tar mitt förslag, och "Annat" öppnar ett fält. Längst ner kopierar du alla svar och klistrar in dem i chatten.</p>${fragor}</section>
      <section class="sek" id="namn"><h2>Lägets namn</h2><p>Markera ett namn. Det följer med när du kopierar svaren.</p><div class="namnlista">${namn}</div>
        <p style="margin-top:16px"><button class="knapp" id="kopiera">Kopiera mina svar</button></p><div class="svar" id="svarstext" hidden></div></section>
    </div>
  </div>
  <footer>Alla bilder ritas live med Mobilfabrikens egen kod: pixelgränssnittet, Pixelcitys figurer, de nya spelglimtarna och rivalkonsolerna. Spel- och konsolnamnen är parodier. Siffrorna är förslag som stäms av med balansroboten under bygget.</footer>
</div>
<script>
(function () {
  var svar = {}; try { Object.assign(svar, JSON.parse(localStorage.getItem('konsolfabriken.svar') || '{}')); } catch (e) {}
  var spara = function () { try { localStorage.setItem('konsolfabriken.svar', JSON.stringify(svar)); } catch (e) {} };
  document.querySelectorAll('.fraga').forEach(function (el) {
    var id = el.dataset.id, ta = el.querySelector('textarea'), kn = el.querySelectorAll('button');
    var visa = function () { var s = svar[id] || {}; kn.forEach(function (b) { b.classList.toggle('aktiv', b.dataset.svar === s.typ); }); el.classList.toggle('annat', s.typ === 'annat'); ta.value = s.text || ''; };
    kn.forEach(function (b) { b.addEventListener('click', function () { svar[id] = { typ: b.dataset.svar, text: (svar[id] || {}).text || '' }; spara(); visa(); if (b.dataset.svar === 'annat') ta.focus(); }); });
    ta.addEventListener('input', function () { svar[id] = { typ: 'annat', text: ta.value }; spara(); });
    visa();
  });
  document.querySelectorAll('input[name=namn]').forEach(function (r) { if (svar.__namn === r.value) r.checked = true; r.addEventListener('change', function () { svar.__namn = r.value; spara(); }); });
  var kop = document.getElementById('kopiera');
  kop.addEventListener('click', function () {
    var rader = Array.prototype.map.call(document.querySelectorAll('.fraga'), function (el, i) { var s = svar[el.dataset.id] || {}; return (i + 1) + '. ' + (s.typ === 'ja' ? 'JA (ditt förslag)' : s.typ === 'annat' ? 'ANNAT: ' + (s.text || '(tomt)') : '(inget svar)'); });
    if (svar.__namn) rader.push('Namn: ' + svar.__namn);
    var text = 'Mina svar på Konsolfabriken:\\n' + rader.join('\\n');
    var ut = document.getElementById('svarstext'); ut.hidden = false; ut.textContent = text;
    try { navigator.clipboard.writeText(text).then(function () { kop.textContent = 'Kopierat!'; setTimeout(function () { kop.textContent = 'Kopiera mina svar'; }, 1500); }).catch(function () {}); } catch (e) {}
  });
})();
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js"></script>
<script>${js}</script>
`;
fs.writeFileSync(fil, html);
console.log(fil, (Buffer.byteLength(html) / 1024).toFixed(0) + ' kB');
