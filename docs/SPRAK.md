# Språken – så översätts Mobilfabriken / Smartphone Empire

Carl 2026-11-24: "vi ska ha engelska". App Store-namnet på engelska är **Smartphone Empire**, i Sverige
fortfarande **Mobilfabriken**. Samma upplägg som Snabbfilen (D:\GamesProjects\snabbfilen\docs\SPRAK.md).

## Hur det fungerar

- **Svenskan är källan.** All text skrivs på svenska i koden och slås upp i ordlistan `js/i18n/en.js`
  (svensk text → engelsk text). Saknas en översättning visas svenskan, så inget går sönder.
- **Språket väljs** i ordningen `?lang=xx` → sparat val (`mobilfabriken.lang`) → telefonens språk → engelska.
  Norska och danska telefoner får svenska. Testrobotarna (`navigator.webdriver`) spelar på svenska om inte
  `?lang=en` står i adressen. I Node (simuleringen, testerna) är språket alltid svenska.
- **Pengar, tal och datum** sköts av `js/sim/bas.js`: `kr(n)` visar `6 600 KR` på svenska och `$660` på
  engelska (kronor / 10 – förlagan räknar i dollar), `tal`, `dec`, `proc`, `datumText`, `manadText`.
- **Byta språk:** MENY → SPRÅK / LANGUAGE. `setLang(id)` sparar och laddar om sidan.
- **Ordlistan laddas med top-level await** i `js/core/i18n.js`, så tabeller på modulnivå kan översättas direkt.

## Märk texten så här (`import { $t, $tf, $n } from '../core/i18n.js'` – relativ sökväg från filen)

| Fall | Skriv | Nyckel i ordlistan |
|---|---|---|
| Vanlig text | `text($t('NYTT SPEL'), …)` | `NYTT SPEL` |
| Mall med värden | `` $t`TEAMET BÖRJAR BYGGA ${d.namn}` `` | `TEAMET BÖRJAR BYGGA {0}` |
| Hopslagen text | `'ÅR ' + ar + ' · ' + x` → `` $t`ÅR ${ar} · ${x}` `` | `ÅR {0} · {1}` |
| Tabell med text som bara visas | `{ info: $t('STOPPAR BUGGAR') }` | `STOPPAR BUGGAR` |
| Text som också är id i logiken | definiera `$n('GARAGE')`, visa `$t(niva.namn)` | `GARAGE` |
| Mall i en tabell | `{ text: $n('KÖPTE {0} ST') }` och vid visning `$tf(x.text, n)` | `KÖPTE {0} ST` |
| Skylt i pixelbild / 3D-etikett | `T(x, $t('POÄNG'), …)`, `textSkylt($t('STRÖM'), …)` | `POÄNG` |

**Regler**
- Svenskan ska se **exakt** ut som förut. `$t` på svenska returnerar samma sträng, så resultatet ändras inte.
- **Märk inte:** id:n (`id: 'garage'`), `namn:` på knappar/markeringar (`namn: 'start-nytt'` är ett id),
  ljudnamn, färger, CSS, `localStorage`-nycklar, sparfältens namn, regex, kommentarer, `console`-utskrifter.
- **Text som jämförs i logiken** (`if (x.namn === 'GARAGE')`, `includes('KONSOL')`, en text som nyckel i ett
  objekt, en text som sparas i G och läses tillbaka) får INTE översättas där den definieras – använd `$n` där och
  `$t` där den ritas. Kolla varje tabellfält med grep innan du väljer.
- **Text som sparas i spelet** (nyheter, kort, notiser i `G`) kan översättas när den skapas – den visas sedan
  på det språket den skapades på. Det är godtaget.
- **Egennamn** (TENKO, HOSHI NOVA, ORBITEK, PIXELBOX, RYMDANFALL, BILTJUVEN, SVAMPSTUDION …) märks också,
  så att de som består av svenska ord får engelska namn. Namn utan svenska ord översätts till sig själva.
- **Pengar:** skriv aldrig `' KR'` själv – använd `kr(n)`. Står ett belopp i löptext ("TVÅ MILJONER KRONOR")
  märks hela meningen; översättaren räknar om till dollar (÷10).
- **Datum:** använd `datumText`/`manadText`. Månadsnamnen i `MANADER`/`MANADER_LANG` slås upp i bas.js.
- Behåll versalerna. Spelets typsnitt är versalt.
- Kör `node --check <fil>` på varje ändrad fil och `node tools/i18n-nycklar.mjs --fil <fil>` för att se nycklarna.

## Översättningen

- `node tools/i18n-nycklar.mjs` → `tools/out/i18n-nycklar.json` (alla nycklar per fil) och täckningen.
- Översättarna skriver `tools/i18n/ut/en-<del>.json` (`{ "svensk nyckel": "ENGLISH" }`).
- `node tools/i18n-bygg.mjs` bygger `js/i18n/en.js` och kontrollerar `{0}`-platserna.
- `node tools/i18n-bredd.mjs` listar engelska texter som blir bredare än svenskan i pixeltypsnittet.
- Stil på engelska: amerikansk engelska, VERSALER som svenskan, kort och rak spelton. Samma eller kortare
  bredd än svenskan där det går (rutorna är ritade efter de svenska orden).
