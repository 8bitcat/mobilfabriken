# Mobilfabriken

En mobiltelefons-tycoon i Pixelstadens stil. Starta ett mobilbolag i ett garage 1 januari 2007 med två
miljoner kronor, möblera, anställ, designa telefoner i tretton steg, låt teamet bygga dem, lansera på en
show där kritikerna sätter betyg, sälj vecka för vecka, forska fram 144 tekniker år för år fram till 2026
och växa från garage till huvudkontor. Förlaga: Roblox-spelet *Build a Phone Empire*.

Allt är pixelgrafik i 384×216 (heltalsskalning, Snabbfilens figurer och pixelpenna) – utom telefonen själv,
som ritas i riktig 3D med three.js i designern, showen och TELEFONER (kan växlas till pixel i menyn).

**Spela:** https://8bitcat.github.io/mobilfabriken/

## Starta lokalt

Statiska filer, inget byggsteg. Servera mappen och öppna `index.html`:

```
npx http-server -p 8805      # eller valfri statisk server
```

three.js laddas från cdnjs (`index.html`). Sparning i `localStorage` under prefixet `mobilfabriken.`
(8bitcat.github.io delar lagring mellan alla spel).

## Mappar

| Mapp | Innehåll |
|---|---|
| `js/sim/` | hela simuleringen utan DOM: dag-ticken, design och betyg, marknad, forskning, personal, kontor, mål |
| `js/data/` | alla siffror: delar (13 kritikergrupper), karosser, funktioner, enheter, forskningsträdet (144 noder), möbelkatalogen, rivaler, kontorsnivåer |
| `js/scener/` | skärmarna: start, kontor, bygg, personal, design, lansering, show, telefoner, forskning, nyheter, bolaget, gåvor, meny, handledning |
| `js/core/` | pixelgränssnittet (`ui.js`), notiser, ljud, sparning, Snabbfilens pixelpenna och figurer |
| `js/art/` | kontorets pixelgrafik: rummen, möblerna, planlösningarna |
| `js/telefon/` | telefonen: riktig 3D (`telefon-gl.js`), pixel-3D (`telefon3d.js`), appikonerna |
| `docs/` | `SPELDESIGN.md` (reglerna och siffrorna) |
| `tools/` | tester och skärmbilder |

## Tester

```
node tools/verify.mjs        # allt nedan i ett svep – sista raden ✓/✗
node tools/sim-test.mjs      # första telefonen mot förlagans siffror (660 kr, 23 dagar, ~6,2, ~22 köpare)
node tools/sim-ai.mjs 5      # balansrobot som spelar 2007–2026 (kontorsflyttar, betyg, ekonomi)
node tools/spela-test.mjs    # robot som klickar sig igenom hela handledningen och laddar om sparningen
node tools/snap.mjs namn "nyttTestspel(); A.go('kontor')"   # skärmbild av en scen
node tools/kontor-snap.mjs   # fullmöblerade kontor på varje nivå
```

Playwright lånas från `D:\Qisy\QISYFrontend\QISYFrontend-1\node_modules`.

## Kalibrering mot förlagan

Pixel Phone 1 med standarddelar kostar 660 kr att tillverka, byggs på 23 dagar av två ★-anställda, får
~6,2 i betyg, ~22 köpare första veckan, 71 % buzz vecka 15 och ryktet 0,99. GPS kostar 27 FP och tar 18 dagar,
RoboOS 62 FP och 24 dagar. 7 tekniker är redo år 2007, 144 totalt.
