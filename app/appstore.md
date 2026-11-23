# Mobilfabriken i App Store – allt att fylla i

Allt nedan klistras in i **App Store Connect → Mobilfabriken**. Längderna är kontrollerade mot Apples gränser.
Upplägget är samma som Pixelcity (snabbfilen/app/appstore.md): Capacitor-app, Codemagic bygger, TestFlight → App Store.

## Vad som är Carls klick och vad som är automatiskt

Apple har inget API för att skapa själva appen, och Codemagic har inget API för signeringsfiler. Allt annat
gör `node app/tools/asc-app.mjs` (texterna nedan läses därifrån) och Codemagic-bygget.

1. **Carl – App Store Connect → My Apps → ＋ → New App.** Platforms iOS · Name `Mobilfabriken` · Primary Language Swedish ·
   Bundle ID `io.eightbitcat.mobilfabriken` (ligger redan i listan – registrerat via API 2026-11-23) · SKU `mobilfabriken` ·
   User Access Full Access. Säg sedan till Claude (Apple ID hämtas via API:t och skrivs in i codemagic.yaml).
2. **Carl – Codemagic → Teams → Personal account → Code signing identities → iOS provisioning profiles → Fetch profiles**
   och välj `Mobilfabriken App Store` (profilen finns redan hos Apple, skapad via API 2026-11-23, utgår 2027-10-03).
   Certifikatet är samma Apple Distribution som Pixelcity. Reserv om hämtningen inte hittar den:
   `app/out/Mobilfabriken_App_Store.mobileprovision` (gitignorerad) laddas upp för hand.
3. **Automatiskt:** `node app/tools/asc-app.mjs allt` fyller App Information (kategorier, rättigheter, åldersgräns 4+,
   namn, undertitel, integritets-URL), iOS 1.0 (copyright, manuell release, beskrivning, nyckelord, promo, support- och
   marknads-URL), skärmbilderna, App Review-kontakt och Notes samt pris (gratis, alla länder).
4. **Automatiskt:** bygget startas med `node D:\GamesProjects\snabbfilen\app\tools\codemagic.mjs start 6b04bf75fad19c99bc218537 ios-testflight main`,
   hamnar i TestFlight efter ~15 minuter och kopplas till 1.0 med `asc-app.mjs bygge`.
5. **Carl – TestFlight:** installera TestFlight-appen på iPhonen och provspela (listan längst ner).
6. **Carl – App Privacy:** App Store Connect → Mobilfabriken → App Privacy → *No, we do not collect data* → Publish
   (finns inte i API:t).
7. **Carl säger "skicka in"** → `node app/tools/asc-app.mjs skicka` (Add for Review). Skriptet skickar aldrig på eget initiativ.

## App Information

- **Name:** `Mobilfabriken` (högst 30 tecken)
- **Subtitle** (högst 30): `Konsoler, mobiler, imperium` (27 tecken)
- **Primary Category:** Games → **Simulation** · **Secondary:** Games → **Strategy**
- **Content Rights:** innehåller inte tredjepartsinnehåll (kryssa *No*).
- **Age Rating:** svara *None/No* på allt (inget våld visas, inga köp, ingen chatt, inga konton) → **4+**.
  Spelglimtarna är lugna scener även för de spel som i verkligheten är våldsamma (beslut i docs/KONSOLPLAN.md).
- **Privacy Policy URL:** `https://8bitcat.github.io/mobilfabriken/integritet.html`

## Pricing and Availability

Gratis, alla länder. (Inga köp i appen i 1.0.)

## App Privacy

**Data Collection:** *No, we do not collect data from this app.* Spelet har inga konton, ingen analys, ingen reklam och
ingen nätverkstrafik alls i appen (three.js ligger lokalt, sparningen i appens egen lagring).

## Distribution → iOS 1.0 (App Store-sidan, svenska)

**Promotional Text** (högst 170 tecken)
```
Börja i garaget 1982 med en spelkonsol, lansera telefoner 2007 och bygg ett imperium fram till i dag – designa i 3D, forska, anställ och lansera på scen.
```

**Description** (högst 4 000 tecken)
```
Starta ett spelkonsolbolag i ett garage den 1 januari 1982 – och bygg det till ett teknikimperium fram till i dag.

KONSOLFABRIKEN 1982
Designa din första konsol i sexton steg: processor, grafik, ljud, minne, kassett eller skiva, handkontroll och kaross. Konsolen byggs av ditt team och visas i riktig 3D som du kan snurra på. Lägg ditt eget spel i lådan – PANG! är först – och lansera på en show där kritikerna sätter betyg.

STUDIOS KNACKAR PÅ
Ju bättre konsol och ju fler sålda, desto större spelstudios vill göra spel till just din konsol. Säg ja, förhandla om licensen, betala för exklusivitet eller tacka nej. Varje spel visas som en liten animerad glimt i sin tids upplösning och får en reklamfilm vid släppet.

TELEFONAVDELNINGEN 2007
Forska fram pekskärm, trådlöst nät och fickkonsol så öppnar telefonavdelningen. Designa mobiler i tretton steg – skärm, kameror, chip, batteri, material, färg och märke – följt av surfplattor, laptops, klockor, hörlurar och vikbara telefoner. Allt i 3D.

FORSKA, ANSTÄLL, VÄX
Ett teknikträd från 1982 till 2026 med över 230 tekniker. Anställ forskare, buggfixare och spelutvecklare, håll moralen uppe och flytta från garaget till litet kontor, kontorsvåning, studio och huvudkontor. Möblera med sextio möbler.

MARKNADEN LEVER
Konkurrenterna släpper nya modeller år för år, julhandeln, finanskrisen och chipbristen slår till, och tidningarna skriver om dig. Sälj vecka för vecka, sänk priset, bli viral, och se ditt museum fyllas.

SNABBSTART 2007
Vill du bara bygga mobiler? Börja direkt 2007 med två miljoner kronor och ett garage.

Pixelgrafik, guiden Mio som visar vägen, 28 mål, gåvor varje dag – och inga konton, ingen reklam och inga köp. Spelet sparas på din enhet och fungerar utan internet. Allt är på svenska.
```

**Keywords** (högst 100 tecken, kommatecken utan mellanslag)
```
tycoon,spelkonsol,mobiltelefon,simulering,pixel,strategi,design,forskning,retro,80-tal,imperium
```

**Support URL**
```
https://8bitcat.github.io/mobilfabriken/support.html
```

**Marketing URL** (frivillig)
```
https://8bitcat.github.io/mobilfabriken/
```

**Skärmbilder** (`node app/tools/skarmbilder.mjs`, hamnar i `app/store/skarmbilder/`):
- iPhone 6,3" (2622 × 1206) – den enda iPhone-storleken App Store Connect kräver ("iPhone with Dynamic Island, medium display")
- iPad 13" (2752 × 2064)

**Game Center:** kryssa **inte** i.

**Copyright**
```
2026 8bitcat Productions
```

**Version Release:** *Manually release this version* (så att du väljer dagen själv).

## App Review Information (engelska – för Apples granskare)

**Sign-In required:** nej.

**Contact:** Carl Palsson · ditt mobilnummer · hello@8bitcat.io

**Notes**
```
Mobilfabriken ("The Phone Factory") is a single-player pixel-art tycoon game in Swedish. You found a games console company in a garage in 1982, design consoles (shown in real-time 3D), publish games, and from 2007 design mobile phones, tablets, laptops and watches, growing from a garage to a headquarters until 2026.

How to play: tap NYTT SPEL (New game), choose KONSOLFABRIKEN 1982 (the full game) or SNABBSTART 2007 (phones only), type a company name and follow the in-game guide Mio (13 steps). Landscape only.

The app has no accounts, no login, no in-app purchases, no ads, no analytics and no network access: the game saves to local storage on the device and runs fully offline (three.js is bundled). All rival companies, consoles, games and studios in the game are fictional parody names invented for the game; no real logos or artwork are used.

Contact: hello@8bitcat.io
```

## Till TestFlight-testet (Carl, efter bygge 1)

- Starta kallt tre gånger: spelet ska komma till startmenyn varje gång (Capacitor 8.6.2 har rättningen för iOS 27-hängningen).
- Konsoldesignern: snurra konsolen i 3D, byt till PIXEL i MENY och tillbaka.
- Spela igenom Mios handledning 1982, stäng appen, öppna igen: sparningen ska ligga kvar.
- iPad: spelet ska ligga centrerat med svarta band över och under (4:3).
- Inget tips om "Lägg till på hemskärmen" ska synas (det är Safaris tips).
