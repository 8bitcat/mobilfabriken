# Konsolspelet – byggplan

Mål: Mobilfabriken blir ett spel som börjar 1982 med spelkonsoler. Telefonerna och prylarna (dagens spel) blir
en gren som forskas fram från 2007. Dagens Mobilfabriken finns kvar som SNABBSTART 2007.
Designunderlag: tools/konsol-design/innehall.mjs (artefakten "Konsolfabriken", utkast 2).

## Beslut (Carl sa "fortsätt" 2026-10-13 – mina förslag i designutkastet gäller)

| Fråga | Beslut |
|---|---|
| GTA VI | GRAND THEFT AUTOMOBIL VI, släpps 19 nov 2026 |
| Våldsamma spel | Med, men glimtarna visar bara lugna scener |
| Start | 1 januari 1982. PANG! (Pong) är bolagets första egna spel |
| Rivaler | Påhittade namn utan å, ä, ö (Carl 2026-11-24, inför App Store): TENKO, HOSHI NOVA, TORA, AXIOM X, ORBITEK, DATATRON, LUMA, PANORAMA VR, FORGE GO. Fältet `forebild` i datan säger vad varje sak är inspirerad av. |
| Tillverkarnas egna serier | Fristående studios med påhittade namn (SVAMPSTUDION, ORBITAL, CRITTER LAB, ASFALT, BLOCKSMITH …) |
| Spel och telefonrivaler | Samma regel: SUPER PIPO, BLOCKFALL, BILTJUVEN VI, BLOCKRIKET, BATTLE ISLAND …; telefonerna LUMEN, HOSHI, BRAMBLE, KOKOS, KVITTEN, SAMBA, NORDIA, HIKO, VEKTOR. Spelarens standardnamn PIXELFON n / PIXELBOX n. |
| Slutet | Slutgala december 2026, fri fortsättning; nästa generations teknik från hösten 2026 |
| 3D | Konsolerna i 3D; karosserna = de 30 modellerna i js/konsol/ |
| Telefoner | Noden TELEFONAVDELNINGEN 2007 (kräver fickkonsol + pekskärm + trådlöst nät) |
| Snabbstart | Dagens spel = SNABBSTART 2007, sparningar oförändrade |
| Delat | Forskningspoäng, personal och kassa delas mellan konsoler och telefoner |
| App-butik | Ja (från 2008 med telefonavdelning), 30 % av köpen |
| Namn | Spelet heter fortfarande Mobilfabriken |

## Arkitektur

**Läge och tid.** `G.lage = 'konsol' | 'telefon'` (saknas = 'telefon', alla gamla sparningar). Tiden räknas som förut i
dagar från 1 jan 2007; konsolspelet startar på `dagForAr(1982)` = −9131. Allt som jämför dagar fungerar; startvärden
som `omrullDag: -99` måste räknas från startdagen.

**Produktlinjer.** Varje design har `d.linje = 'konsol' | 'telefon'` (saknas = 'telefon'). `js/data/linjer.js` ger
linjens tabeller: `{ GRUPPER, DELAR, STANDARD_VAL, KAROSSER, ENHETER, FUNKTIONER, YTOR, steg, ... }`.
Telefonlinjen pekar på dagens js/data/delar.js oförändrad. Konsollinjen ligger i js/data/konsol.js.
sim/design.js räknar teknik, kostnad, förväntan och betyg på designens linje.

**Konsollinjens delar** (9 grupper som kritikerna mäter): PROCESSOR, GRAFIK, LJUD, MINNE, SPELMEDIA, HANDKONTROLL,
UPPKOPPLING, SPARNING, MATERIAL. Karosserna är de 30 3D-modellerna (KONSOLFORMER) med årtal och forskning.
Enheter: HEMKONSOL (1982), FICKKONSOL (1989), HYBRID (2017), VR (2019).

**Marknaden för konsoler** (sim/konsol.js):
- köpare/vecka = BAS(år) × TÄCKNING × ENHET × 2^((betyg − snitt)/2) × prisfaktor × RYKTE × BUZZ × BIBLIOTEK × HÄNDELSER
- BAS = 60 × 1,09^(år − 1982); rimligt pris = 1 990 kr × 1,03^(år − 1982) × (1 + 0,25 × (betyg − snitt))
- BIBLIOTEK = 0,5 + Σ spelens dragkraft (tak 3): utan spel säljer konsolen hälften
- installerad bas = sålda konsoler (minus 8 % om året som slutar spela)

**Spel och studios** (data i js/data/konsol-varld.js, logik i sim/konsol.js):
- `SPEL`: [{ id (glimt-id), titel, studio, ar, stjarnor 1–5, kraver: { media, kontroll, … }, genre, systemsaljare }]
- `STUDIOS`: [{ id, namn, forebild }]
- Förfrågningar: den 1:a varje månad. Studios med spel vars år kommit och vars krav konsolen uppfyller
  knackar på om konsolens betyg och installerade bas räcker för spelets stjärnor
  (★–★★ alltid, ★★★ betyg 6 + 50 000, ★★★★ 7 + 300 000, ★★★★★ 8 + 1 000 000).
- Avtal: JA (licens 12 %, devkit 40 000 kr), FÖRHANDLA (reglage), EXKLUSIVT (betala), NEJ. Relation per studio.
- Spelet byggs X månader, släpps med reklamfilm, säljer installerad bas × dragkraft × avklingning per vecka.
  Licensavgiften blir intäkt. Systemsäljare ger konsolerna en extra knuff.
- Egna spel: rollen SPELUTVECKLARE bygger dem (PANG! först). Hela intäkten.

**Bygget** för en konsol: hårdvara (som telefonerna) och sedan mjukvara om konsolen har ett eget pack-in-spel.

**Forskning.** NODER = telefonnoderna + konsolnoderna (`n.linje`). Konsolspelet visar flikarna KONSOL och MOBIL;
telefonnoderna är låsta tills `k-mobil` (TELEFONAVDELNINGEN) är forskad. Snabbstart visar bara telefonnoderna.

## Status

**Etapp 1 klar (2026-10-13).** Simuleringen kör 1982–2026 i Node: `node tools/konsol-sim-test.mjs` (första konsolen,
studiorna, eget spel, telefonavdelningen, snabbstarten oförändrad) och `node tools/konsol-ai.mjs 3` (balansrobot).
Båda ligger i tools/verify.mjs. Siffror från roboten (stark spelare): litet kontor 1983–84, våning ~1992, studio ~1999,
huvudkontor ~2010, telefonavdelningen 2007, 9–14 av ~20 ★★★★★-spel; den snåla roboten (ingen reklam, inga möbler) klarar
sig utan lån. Detaljer som lades till under bygget:
- **De stora spelen väljer.** En ★★★★–★★★★★-studio väljer en gång mellan din konsol och rivalernas bästa (`valChans`:
  30 %/45 % + 20 % per betygssteg över rivalen + 10 % per relationssteg, 10–80 %). Nej = spelet går till rivalen.
- **Utvecklingskitet säljs till studion** (intäkt), licensen 12 % av spelets försäljning är din. Skräpspel (★–★★) sänker
  ryktet lite när biblioteket redan har tre spel – en anledning att ibland säga NEJ.
- **Egna spel:** EGNA_SPEL (PANG!, RYMDSKYTTEN 1982 … FABRIKEN – SPELET 2024) görs av rollen SPELUTVECKLARE
  (Lykke 1982). Spelet i lådan görs i byggets andra fas (`pr.fas` 'hardvara' → 'mjukvara').
- **Låna en utvecklare** av en studio som gör spel till dig: bygget går 25 % fortare och får egna prickar.
- **Prisnivå:** marknader, kontor och reklam kostar 40 % 1982 och når 2007 års priser 2007 (`prisniva`).
- **Kontorskrav i konsolspelet:** 2 000 sålda · 50 000 + 5 spel · 250 000 + 12 spel · mål 26 + 2 miljoner.

**Etapp 2 klar (2026-10-14, workflow wf_4d15cb36-c78).** Startval KONSOLFABRIKEN 1982 / SNABBSTART 2007, konsoldesignern
(16 steg, SPELET I LÅDAN), kontorets två byggfaser + LÅNA UTVECKLARE, lansering/show med konsolernas tidningar och
SE REKLAMFILMEN, nya scenerna STUDIOS (förfrågningar, bibliotek, egna spel, låna, rivaler) och REKLAM, korten 'studio'
och 'spelslapp', KONSOLER-listan, forskningen 1982–2026 med flikarna KONSOL/MOBIL, BOLAGET/NYHETER/PERSONAL i båda
lägena, Mio-handledningen 1982 (tools/konsol-spela-test.mjs). verify.mjs har 39 steg (telefonens 17 + 22 konsolsteg).
Kända småsaker kvar: 3D-formerna bär förlagans märkestext (ATARO …) även på din egen konsol – borde visa ditt märke
(tel.marke); KONSOLER-rutan "I LAGER" kapas vid stora partier; bolagsvärdet räknar inte licensintäkter.

**0.2.0 committad 2026-11-23 (Carl: "göra det till en app i App Store").** Etapp 1–3 ihop, verify.mjs grön i
arbetsmappen innan commit. Samtidigt appen: `app/` (Capacitor 8.6.2, SPM), `codemagic.yaml`, App ID
io.eightbitcat.mobilfabriken och profilen "Mobilfabriken App Store" registrerade hos Apple via API, repot i Codemagic
(6b04bf75fad19c99bc218537). Kvar för Carl: appen i App Store Connect, Apple ID i codemagic.yaml, hämta profilen i
Codemagic, bygg, TestFlight, App Store-sidan (`app/appstore.md`). Etapp 5 (0.3.0) står kvar.

## Etapper

1. **Data och simulering** (huvudsessionen): linjer, konsoldata, konsolnoder, rivalkonsoler, studios och spel,
   sim/konsol.js, nyttSpel({ lage: 'konsol' }). Test: tools/konsol-sim-test.mjs + balansrobot tools/konsol-ai.mjs.
   Telefonspelet ska vara oförändrat (verify.mjs grön).
2. **Skärmar** (workflow, en agent per filområde): startval, konsoldesignern, kontoret (bygge, studiokort),
   STUDIOS/SPELBIBLIOTEK, lansering + show + reklamfilm, KONSOLER-listan, forskningens flikar, handledning 1982, mål.
3. **Ihopkoppling och balans**: klickrobot genom handledningen 1982, balansrobot 1982–2026, verify.
4. **Släpp 0.2.0**: konsolspelet spelbart 1982–2006 (spel med glimtar, övriga som titelkort).
5. **0.3.0**: telefonavdelningen 2007, app-butiken, GTA VI och slutgalan.
