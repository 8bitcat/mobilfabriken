# Mobilfabriken i App Store – allt att fylla i

Allt nedan klistras in i **App Store Connect → Mobilfabriken**. Längderna är kontrollerade mot Apples gränser.
Upplägget är samma som Pixelcity (snabbfilen/app/appstore.md): Capacitor-app, Codemagic bygger, TestFlight → App Store.

## Vad som är Carls klick och vad som är automatiskt

Apple har inget API för att skapa själva appen, och Codemagic har inget API för signeringsfiler. Allt annat
gör `node app/tools/asc-app.mjs` (texterna nedan läses därifrån) och Codemagic-bygget.

Den engelska sidan (huvudspråk, namnet **Smartphone Empire**, Carl 2026-11-24) står i `app/appstore-en.md`.
Den här filen är den svenska sidan (namnet **Mobilfabriken**). Verktyget fyller i båda.

1. **Carl – App Store Connect → My Apps → ＋ → New App.** Platforms iOS · Name `Smartphone Empire` · Primary Language **English (U.S.)** ·
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

- **Name** (svenska): `Mobilfabriken` (högst 30 tecken) · engelska: `Smartphone Empire`
- **Subtitle** (högst 30): `Bygg ett mobilimperium` (22 tecken)
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
Starta ett mobilbolag i ett garage 2007, designa telefoner i riktig 3D, lansera dem på scen och väx från garage till huvudkontor.
```

**Description** (högst 4 000 tecken)
```
Starta ett mobilbolag i ett garage den 1 januari 2007 – med två miljoner kronor och två anställda – och bygg ett teknikimperium.

DESIGNA DINA TELEFONER
Tretton steg: skärm, kameror, chip, minne, batteri, nät, mjukvara, material, färg, yta och märke. Telefonen visas i riktig 3D, ändras medan du väljer och går att snurra med fingret.

BYGG OCH LANSERA
Teamet bygger telefonen – blå prickar är kvalitet, röda buggar ska lagas. Välj reklamkampanj, beställ första partiet och lansera på en show där kritikerna sätter betyg.

SÄLJ VECKA FÖR VECKA
Följ försäljningen, sänk priset, bli viral, släpp uppdatering 1.1 – och håll koll på konkurrenterna som släpper nya modeller varje år. Julhandeln, finanskrisen och chipbristen slår till.

FORSKA 2007–2026
Ett teknikträd med 144 uppfinningar, år för år: pekskärm, appar, selfiekamera, 5G och vikbara telefoner. Och nya prylar – surfplattor, laptops, smarta klockor och hörlurar.

VÄX MED BOLAGET
Anställ forskare och buggfixare, håll moralen uppe och möblera kontoret med sextio möbler. Flytta från garaget till litet kontor, kontorsvåning, studio och huvudkontor. Erövra Europa, Amerika och Asien.

Pixelgrafik, guiden Mio som visar vägen, 28 mål, gåvor varje dag och ett museum med alla dina telefoner. Inga konton och ingen reklam. Spelet sparas på din enhet och fungerar utan internet. Frivilliga köp i butiken: investerare, forskningspaket, Guldpaketet och Supporter.
```

**Keywords** (högst 100 tecken, kommatecken utan mellanslag)
```
tycoon,mobiltelefon,smartphone,bolag,simulering,pixel,strategi,design,forskning,uppfinnare,företag
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
Smartphone Empire (Mobilfabriken in Swedish) is a single-player pixel-art tycoon game in English and Swedish. See the English notes (primary language).
```

## Till TestFlight-testet (Carl, efter bygge 1)

- Starta kallt tre gånger: spelet ska komma till startmenyn varje gång (Capacitor 8.6.2 har rättningen för iOS 27-hängningen).
- Konsoldesignern: snurra konsolen i 3D, byt till PIXEL i MENY och tillbaka.
- Spela igenom Mios handledning 1982, stäng appen, öppna igen: sparningen ska ligga kvar.
- iPad: spelet ska ligga centrerat med svarta band över och under (4:3).
- Inget tips om "Lägg till på hemskärmen" ska synas (det är Safaris tips).
