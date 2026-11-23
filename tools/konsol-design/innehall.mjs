// Innehållet i designdokumentet för konsolläget. Bilderna (canvas-id) ritas av sida.js.
export const D = {
  titel: 'Konsolfabriken',
  version: '2',
  datum: '2026-10-12',
  undertitel: 'Hela spelet i ett: du bygger spelkonsoler från Commodore 64-tiden 1982 till i dag, studios knackar på och vill göra kända spel till dem, och från 2007 kan bolaget forska fram en telefonavdelning – då blir hela Mobilfabriken, med telefonerna och prylarna, en del av samma spel. Sist av alla kommer GRAND THEFT AUTOMOBIL VI.',
  loop: `Du startar i garaget **1 januari 1982** med en ingenjör och en spelutvecklare. Först bygger ni **konsolen**, sedan skriver utvecklaren **mjukvaran** – ert eget första spel PANG! – och båda lanseras på showen, med en **reklamfilm** där man ser spelet spelas på er konsol. Varje såld konsol hamnar hemma hos någon, och ju fler som har den, desto mer lockar den. Då börjar **studios knacka på**: de vill göra spel till er konsol, och ni förhandlar om licensavgift, utvecklingskit och exklusivitet. Ju bättre konsolen är och ju fler som har den, desto kändare spel erbjuds ni – från PAC-MUNCH 1982 till SUPER MARCO, FICKMONSTER, GRUVKRAFT och FORTNAJT. När ett studiospel blir klart släpps det med en egen reklamfilm, fler köper konsolen och ni tjänar en slant på **varje sålt spel**. Ungefär vart sjätte år kommer ny teknik och det är dags för nästa konsol. Man kan också bygga konsolen **tillsammans med en studio**: de lånar ut utvecklare till bygget och konsolen släpps med deras spel i kartongen. Från **2007** kan ni forska fram en **telefonavdelning**: då öppnas Mobilfabrikens telefoner, och sedan surfplattan, laptopen, klockan, hörlurarna och den vikbara telefonen år för år – samma bolag, samma forskare, samma kassa. Sist släpps GRAND THEFT AUTOMOBIL VI i november 2026 – får ni det till er konsol?`,
  diagram: `flowchart LR
  A[Designa konsolen] --> B[Bygg hårdvaran]
  B --> C[Mjukvaran: eget spel eller studions]
  C --> D[Lansering: show + reklamfilm]
  D --> E[Konsoler säljs – fler hem har den]
  E --> F[Studios knackar på]
  F --> G[Spelet byggs]
  G --> H[Spelsläpp: reklamfilm med spelet på er konsol]
  H --> E
  E --> I[Ny generation teknik]
  I --> A
  F -.-> J[Bygg nästa konsol tillsammans med en studio]
  J --> B
  I -.-> K[2007: forska fram telefonavdelningen]
  K --> L[Designa telefoner och prylar]
  L --> D`,
  sektioner: [
    { id: 'start', rubrik: 'Så startar läget', md: `Startskärmen får två val. **HELA SPELET** börjar 1982 med konsoler, och telefonerna kommer senare som en gren man forskar fram. **SNABBSTART 2007** är dagens Mobilfabriken med bara telefoner, för den som vill det. Sparningarna från i dag fungerar som förut.

Ni börjar i samma garage, men året är **1982**: rutiga tapeter, tjock-TV och en hemdator på bänken. I stället för två forskare har ni två roller från start:

- **Ingenjören** bygger hårdvaran: kretskort, chip, låda och handkontroll.
- **Spelutvecklaren** skriver mjukvaran: de spel som följer med eller som ni själva ger ut.

Mio guidar som vanligt, men stegen byts: möblera garaget → designa konsolen → bygg den → "nu behöver den ett spel" → utvecklaren gör PANG! → lansera båda → titta på reklamfilmen → första studion knackar på.` },
    { id: 'forst', rubrik: 'Först konsolen, sedan mjukvaran', md: `Ett bygge har två delar i rad. Först **HÅRDVARAN**, där ingenjörerna jobbar och blå prickar (kvalitet) och röda buggar flyger som förut. Sedan **MJUKVARAN**, där spelutvecklarna skriver spelet till konsolen. Under tiden ser man spelet växa fram på utvecklarens skärm.

[[bild:bygget]]

Ert första spel är **PANG!** – två streck och en boll, precis som Pong. Det är så det började. Senare kan ni göra fler egna spel (PANG! 2, ett eget plattformsspel …) eller låta studios göra spelen. Egna spel ger hela intäkten men tar era egna utvecklare; studiospel ger licensavgift och kostar ingenting att bygga.` },
    { id: 'designern', rubrik: 'Konsoldesignern', md: `Designern från telefonerna återanvänds med nya steg. Allt låses upp år för år i forskningsträdet, precis som skärmar och kameror gör nu:

| Steg | Från början (1982) | Kommer sedan |
|---|---|---|
| FORM | Hemdator med tangentbord · Låda | Fickkonsol (1989) · Torn (2000) · Hybrid (2017) |
| PROCESSOR | 8 bit, 1 MHz | 16 bit (1988) · 32 bit (1994) · 64 bit (1996) · flerkärnig (2005) · 8 kärnor (2013) · nästa generation (2026) |
| GRAFIK | 16 färger, sprites | Scrollning (1985) · rotation och zoom (1990) · 3D-polygoner (1994) · shaders (2001) · HD (2005) · 4K (2016) · strålspårning (2020) |
| LJUD | Pip | Tre kanaler (1982) · FM-synt (1988) · CD-ljud (1994) · surround (2001) · 3D-ljud (2020) |
| MINNE | 64 kB | Upp till 16 GB (2020) |
| SPELMEDIA | Modul | Disk (1984) · CD (1994) · DVD (2000) · Blu-ray (2006) · nedladdning (2008) · SSD (2020) |
| HANDKONTROLL | Joystick | Styrkors (1985) · sex knappar (1990) · analog spak (1996) · vibration (1997) · rörelse (2006) · pekplatta (2013) · haptik (2020) |
| UPPKOPPLING | Ingen | Länkkabel (1989) · modem (1999) · bredband (2002) · onlinebutik (2008) · moln (2020) |
| SPARNING | Lösenord | Batteri i modulen (1986) · minneskort (1995) · hårddisk (2001) |
| BAKÅTKOMPATIBEL | – | Gamla spel fungerar: dyrare, men biblioteket lever vidare |
| FÄRG, YTA, NAMN | Som telefonen | |
| PRIS OCH PACK-IN | Pris + vilket spel som följer med i kartongen | |

Konsolerna visas i **3D** som telefonen: 30 stycken från ATARO 2600 till PLAY STATIO 6, var och en med sin handkontroll och sitt eget spel. Se och snurra dem här: [Konsolerna i 3D](https://claude.ai/artifact/NZiz4AtUxePoGrFMKqPb1R). Spelens **teknikkrav** gör valen viktiga: FINAL FANTASIA VII kräver CD, SUPER MARCO 64 kräver analog spak och VI SPORT kräver rörelsekontroll. Saknas tekniken frågar studion inte ens.` },
    { id: 'tidslinje', rubrik: 'Tidslinjen 1982–2026', md: `Rivalerna släpper sina konsoler på riktiga årtal, med parodinamn som alla känner igen:

[[bild:tidslinje]]

| Era | År | Ny teknik | Rivalerna | Kända spel som kan komma |
|---|---|---|---|---|
| Hemdatorerna | 1982–84 | 8 bit, moduler, joystick | ATARO 2600, KOMMODOR 64, KOLEKO VISION | PANG!, SPACE INVADÖRS, PAC-MUNCH, DONKEY KONGO, PITFELL, TETRIX |
| 8-bitarnas guldålder | 1985–88 | Styrkors, scrollning, batterisparning | NINTENTO NES, SEGO MASTER SYSTEM | SUPER MARCO BROS., ALEX KIDZ, LEGENDEN OM ZELLA, MEGA MANN |
| 16 bit och fickan | 1989–93 | Fickkonsol, 16 bit, rotation | GAME BOJ, SEGO MEGA DRIVE, SUPER NINTENTO | TETRIX (fickan), SONNY THE HEDGEHOG, STREET FAJTER II, SUPER MARCO KART, DOOMSDAG |
| 3D och CD | 1994–99 | CD, 3D, analog spak, minneskort | PLAY STATIO, SEGO SATURNUS, NINTENTO 64, GAME BOJ COLOR, SEGO DRÖMCAST | SUPER MARCO 64, SEGO RALLY, FICKMONSTER GUL, CRASH BANDIKUT, GALEN TAXI, TOMB RAJDER, FINAL FANTASIA VII |
| DVD och nätet | 2000–04 | DVD, hårddisk, online | PLAY STATIO 2, MIKROMJUK X-LÅDA, NINTENTO GAMEKUB | HALOO, SUPER MARCO SOLSKEN, GRAND THEFT AUTOMOBIL III, GTA: SAN ANDREAS |
| HD och rörelse | 2005–11 | HD, Blu-ray, rörelse, onlinebutik | NINTENTO DS, X-LÅDA 360, PLAY STATIO 3, NINTENTO VI | VALPARNA, VI SPORT, LILLA STORA PLANETEN, GRAND THEFT AUTOMOBIL IV, GRUVKRAFT |
| Delningsknappen | 2012–16 | 1080p, strömning, VR | VI U, PLAY STATIO 4, X-LÅDA ETT | BLÄCKKLATT, GRAND THEFT AUTOMOBIL V, FIFFA 15 |
| Hybriden och VR | 2017–19 | Hybrid, 4K, VR utan sladd | NINTENTO SVITSCH, META KVEST | FORTNAJT, SPINDELMANNEN, TJUVARNAS HAV, BLAND OSS, TAKTSABEL, RÖD DÖD REDEMPTION 2 |
| SSD och strålar | 2020–26 | SSD, strålspårning, haptik, moln | PLAY STATIO 5, X-LÅDA SERIE X, ÅNGDÄCKET, SVITSCH 2 | FORSA HORISONT 5, ELDEN KING, ASTROBOTTEN, MARCO KART VÄRLD, **GRAND THEFT AUTOMOBIL VI** |

Hösten 2026 ryktas det om PLAY STATIO 6. Tekniken för "nästa generation" går att forska fram då, så den som vill kan släppa sin egen PS6-konsol som sista konsol.` },
    { id: 'studios', rubrik: 'Studios som knackar på', md: `När konsolen har sålt en del dyker det upp ett kort i kontoret: **en studio knackar på**. Kortet visar spelet (med en levande glimt på kartongen), hur bra det är, vad det kräver, hur lång tid det tar och vad studion vill ha.

[[bild:pitch]]

**Vilka spel ni erbjuds** beror på fem saker:

- **Konsolens betyg** från kritikerna – samma show och betygsformel som telefonerna.
- **Installerad bas** – hur många som har konsolen hemma. Det är den studios bryr sig mest om.
- **Licensavgiften** – er del av varje sålt spel. Hög avgift ger mer pengar per spel men färre studios.
- **Utvecklingskitet** – billigt och bra kit lockar, dyrt kit ger intäkter men skrämmer de små.
- **Relationen** – en studio som fick en hit på er konsol kommer tillbaka med nästa del. Avbryter ni avtal eller blir giriga går de till rivalen, och nyheterna skriver om det.

Stjärnorna styr: ★–★★ kommer från start, ★★★ kräver betyg 6 och 50 000 konsoler, ★★★★ betyg 7 och 300 000, ★★★★★ betyg 8 och en miljon. Spelen kommer också i sin tid – SUPER MARCO BROS. finns inte före 1985 och GRUVKRAFT inte före 2011.

**Valen på kortet:** JA (standardavtal – spelet kan komma till rivalerna också) · FÖRHANDLA (dra i licens och reklambidrag) · EXKLUSIVT (betala studion, spelet kommer bara till er konsol) · NEJ.

**Systemsäljare** är spel som får folk att köpa konsolen bara för att spela dem: SUPER MARCO, FICKMONSTER, VI SPORT, HALOO, GRUVKRAFT och GTA. De ger en stor knuff i konsolförsäljningen när de släpps.

Kända serier följer sina studios genom åren, så den som håller sams med ROCKSTJÄRNA kan få hela GTA-serien: III (2001), SAN ANDREAS (2004), IV (2008), V (2013) och VI (2026).

| Studio | Parodi på | Kända spel i läget |
|---|---|---|
| NAMKO | Namco | PAC-MUNCH |
| ACTIVIZION | Activision | PITFELL, CALL OF DUTTY |
| ELORGA | Elorg | TETRIX |
| SVAMPSTUDION | Nintendos egna team | SUPER MARCO, ZELLA, MARCO KART, VI SPORT, DJURBYN |
| KAPKOM | Capcom | MEGA MANN, STREET FAJTER II |
| SONNY TEAM | Sonic Team | SONNY THE HEDGEHOG |
| ID MJUKVARA | id Software | DOOMSDAG |
| SPELFREAK | Game Freak | FICKMONSTER |
| STYGGA HUNDEN | Naughty Dog | CRASH BANDIKUT |
| KÄRNDESIGN | Core Design | TOMB RAJDER |
| SQUARE ÄNDE | Square Enix | FINAL FANTASIA VII |
| BUNGO | Bungie | HALOO |
| ROCKSTJÄRNA | Rockstar | GRAND THEFT AUTOMOBIL, RÖD DÖD REDEMPTION 2 |
| UBISOFFT | Ubisoft | ASSASSINS KRED |
| MOJÄNG | Mojang (svenskt!) | GRUVKRAFT |
| BETHESTA | Bethesda | SKYRIMM |
| ELEKTRONISKA KONSTER | Electronic Arts | FIFFA |
| EPISKA SPEL | Epic Games | FORTNAJT |
| FROMSPEL | FromSoftware | ELDEN KING |
| INSOMNIAK | Insomniac | SPINDELMANNEN 2 |` },
    { id: 'tillsammans', rubrik: 'Bygga konsolen tillsammans med en studio', md: `När ni designar en ny konsol kan ni välja en **partnerstudio**, om relationen är god nog. Då händer tre saker:

- Studion **lånar ut 1–3 utvecklare** som sitter vid era bord under bygget, i studions färg på tröjan. Bygget går fortare och mjukvaran görs parallellt med hårdvaran.
- Konsolen **släpps med deras spel i kartongen** – som när SUPER MARCO kom med NES, TETRIX med Game Boy och VI SPORT med Wii. Det ger en jättestart.
- Studion vill ha betalt: deras löner under bygget och en del av varje såld konsol, till exempel 5 %.

Ett bra drag när en ny generation börjar: allierar man sig med rätt studio vid starten är man säker på en stark lansering. Det är också sättet att få en riktig systemsäljare exklusivt.` },
    { id: 'telefoner', rubrik: 'Telefonerna och prylarna – en gren man forskar fram', md: `Hela Mobilfabriken blir en del av spelet, men den kommer senare. Fram till 2007 bygger ni bara konsoler. Sedan går det att forska fram **TELEFONAVDELNINGEN**.

[[bild:forskning]]

- **Upplåsningen:** noden finns från 1 januari 2007. Den kräver tre konsoltekniker: FICKKONSOL (1989), PEKSKÄRM (2004) och TRÅDLÖST NÄT (2005). Den kostar 300 forskningspoäng och 2 miljoner kronor för den nya avdelningen. Den som har hoppat över fickkonsoler eller pekskärm får vänta, så konsolvalen spelar roll.
- **Det som låses upp:** enheten TELEFON i designern, med Mobilfabrikens 13 steg och 3D-telefonen. Forskningen får en ny flik, MOBIL, med telefonernas 144 tekniker. Därefter kommer prylarna år för år, med samma krav som i Mobilfabriken: SURFPLATTA 2010, LAPTOP 2012, SMARTKLOCKA 2014, TRÅDLÖSA HÖRLURAR 2016 och VIKBAR TELEFON 2019.
- **Samma bolag:** forskningspoängen, personalen och kassan delas. Man väljer själv om forskarna ska jobba med nästa konsol eller nästa telefon. I garaget och det lilla kontoret bygger teamet ett projekt i taget, och från kontorsvåningen kan två team bygga samtidigt.
- **Två marknader:** konsolernas rivaler (SONNI, NINTENTO, MIKROMJUK) och telefonernas rivaler från Mobilfabriken (PEAR, SAMSONG, NOKIO). SONNI finns på båda, precis som i verkligheten.
- **Mobilspelen:** från 2008 tar mobilspel en del av fickkonsolernas marknad, ungefär 10 % om året. Har ni egna telefoner tjänar ni på det i stället, för då vill studios göra spel till er app-butik.

| Konsolteknik | Ger telefonerna |
|---|---|
| PEKSKÄRM (2004) | Krävs för telefonavdelningen |
| RÖRELSESENSOR (2006) | Funktionen ROTERA SKÄRMEN utan kostnad |
| ONLINEBUTIK (2008) | App-butiken på telefonerna |
| HAPTIK (2020) | Bättre vibration och högre designbetyg |

| Telefonteknik | Ger konsolerna |
|---|---|
| Snabba mobilchip | Billigare fickkonsoler och hybrider (2017) |
| Kamera och AR (2016) | AR-spel som FICKMONSTER GÅ |
| 5G (2019) | Molnspel på konsolerna (2020) |

**App-butiken** fungerar som studiokorten för konsolerna, fast för mobilspel. Studios knackar på med ARGA FÅGLAR (2009), GODISKROSS (2012), TUNNELBANESURFARNA (2012) och senare FICKMONSTER GÅ (2016). Ni får 30 % av allt som köps i spelen. Spelen syns på telefonens skärm i reklamfilmen, precis som konsolspelen på TV:n.

[[bild:appar]]` },
    { id: 'reklam', rubrik: 'Reklamfilmen', md: `Vid varje konsollansering och varje stort spelsläpp spelas en kort **reklamfilm**, cirka åtta sekunder. Först syns vardagsrummet med barnen i soffan, sedan spelet i fullskärm på er konsol och sist loggan med en slogan. Vardagsrummet följer eran: brun soffa och tjock-TV på 80-talet, platt-TV och LED-list i dag.

[[bild:reklam]]

Kampanjvalet från telefonerna återanvänds: en större kampanj ger en längre film och mer efterfrågan första veckan. Filmen går att hoppa över.` },
    { id: 'glimtar', rubrik: 'Spelglimtarna', md: `Varje känt spel har en egen kort **glimt**, alltså ett animerat klipp som visas i reklamfilmen, på TV:n hemma hos folk och i ert spelbibliotek. Glimtarna ritas i sin tids upplösning: PANG! 1982 i grova pixlar, GTA VI 2026 i fina. Man ser alltså tekniken gå framåt. Alla är ritade från grunden i spelets pixelstil, med parodinamn, men ska kännas igen direkt.

[[bild:glimtar]]

De här nio är byggda redan nu och ligger i spelets kod (js/konsol/glimtar.js). Resten av spelen i tidslinjen får sina glimtar under bygget, era för era.` },
    { id: 'ekonomi', rubrik: 'Ekonomin: konsoler för pengarna i spelen', md: `Konsoler säljs ofta **med förlust** – pengarna kommer från spelen. Det är rakhyvelsmodellen: billigt skaft, dyra blad. Läget lär ut den på riktigt.

**Intäkter:** konsoler (pris minus tillverkning), licensavgift på varje sålt studiospel, egna spel (hela priset), utvecklingskit till studios – och från 2007 telefoner och prylar (som i Mobilfabriken) plus 30 % av köpen i app-butiken.
**Kostnader:** utveckling, fabrik per konsolmodell, tillverkning, reklam, löner, exklusivitet och partnerstudions andel.

| | 1986 | 2013 |
|---|---|---|
| Konsolens pris | 1 500 kr | 4 000 kr |
| Kostar att tillverka | 1 300 kr | 4 400 kr (förlust) |
| Spelpris | 450 kr | 700 kr |
| Licens 15 % per spel | 68 kr | 105 kr |
| Spel per konsol under livet | 6 | 8 |
| Licensintäkt per såld konsol | ≈ 400 kr | ≈ 840 kr |

**Efterfrågan** följer telefonernas formel, plus ett **bibliotek**: konsolköpare per vecka = marknad(år) × 2^((betyg − årets snitt)/2) × prisfaktor × bibliotek × buzz. Biblioteket är 0,5 + summan av spelens dragkraft (systemsäljare väger tyngst) och har ett tak på 3. En konsol utan spel säljer alltså bara hälften.

**Spelen säljer** = installerad bas × spelets dragkraft × avklingning. Det blir en dubbel kurva: fler konsoler ger fler sålda spel, och fler bra spel ger fler sålda konsoler.

**Generationsskiften:** varje ny era höjer kritikernas krav, gamla konsoler säljer allt mindre och studios flyttar till nya. Bakåtkompatibilitet låter det gamla biblioteket sälja vidare.

**Världshändelser:** SPELKRASCHEN 1983 (efterfrågan halveras ett år och studios blir försiktiga), JULRUSCHEN varje december, PIRATKOPIERINGEN under CD-eran, PANDEMIBOOMEN 2020 och CHIPBRISTEN 2021 (dyrare tillverkning och färre konsoler).` },
    { id: 'mal', rubrik: 'Mål och slutet', md: `Målen följer samma mönster som telefonernas, 28 stycken i ordning. Några exempel:

1. Bygg er första konsol.
2. Släpp PANG!
3. Sälj 1 000 konsoler.
4. Första studiospelet.
5. Första systemsäljaren.
6. Bygg en fickkonsol.
7. Första exklusiva spelet.
8. En miljon konsoler.
9. Lansera en konsol med partnerstudio.
10. Bli störst i en generation.
11. Öppna telefonavdelningen.
12. Sälj en miljon telefoner.
13. Första spelet i app-butiken.

Det sista målet: **GRAND THEFT AUTOMOBIL VI till er konsol.**

**Slutgalan i december 2026:** GRAND THEFT AUTOMOBIL VI släpps 19 november 2026. ROCKSTJÄRNA väljer vilka konsoler som får spelet: det krävs en konsol i den senaste generationen, högt betyg och stor installerad bas. För att få det **exklusivt** krävs toppbetyg, den största basen och bästa relationen med studion, plus en rejäl check. Galan visar hela er historia: konsolerna, de största spelen, reklamfilmerna och, om ni har gjort telefoner, årets telefon. Efter galan kan man spela vidare fritt, som i Mobilfabriken.` },
    { id: 'ateranvand', rubrik: 'Det här återanvänds', md: `| Del | Hur |
|---|---|
| Pixelgränssnittet, notiser, ljud, sparning, figurerna | Som de är |
| Kontoret, BYGG, möblerna, kontorsnivåerna | Som de är, plus 80- och 90-talsmöbler (tjock-TV, hemdator, affischer) |
| PERSONAL | Ny roll: spelutvecklare. Lånade utvecklare från partnerstudion syns vid borden |
| DESIGN (13 steg) | Samma designer med konsolsteg och nya 3D-modeller |
| Bygget och kvalitetsprickarna | Två delar i rad: hårdvara, sedan mjukvara |
| LANSERING och showen | Som de är, plus reklamfilmen |
| TELEFONER | Blir KONSOLER med en ny flik SPELBIBLIOTEK |
| FORSKNING | Samma tidslinje, nytt träd 1982–2026 |
| NYHETER, BOLAGET, MÅL, GÅVOR | Som de är, med nya texter och mål |
| Marknaden och rivalerna | Samma formler, plus biblioteket och studiernas förfrågningar |
| Hela Mobilfabriken | Blir grenen MOBIL: designern, 3D-telefonen och prylarna, telefonernas forskningsträd, rivalerna och marknaden |
| Nytt | STUDIOS (korten, avtal, relationer), APP-BUTIKEN, REKLAMFILMEN, spelglimtarna, rivalkonsolernas bilder, telefonavdelningen |` },
    { id: 'bygg', rubrik: 'Byggordning', md: `Jag släpper läget i fyra steg, så att man kan spela tidigt och resten fylls på era för era:

1. **0.2 – Läget och 1982–1988:** startvalet, garaget 1982, konsoldesignern, hårdvara och mjukvara, PANG!, reklamfilmen, studiokorten och de första spelen (PAC-MUNCH, PITFELL, TETRIX, SUPER MARCO BROS., ZELLA, MEGA MANN). Spelkraschen 1983.
2. **0.3 – 1989–1999:** fickkonsolen, 16 bit, CD och 3D, partnerstudior, FICKMONSTER, SUPER MARCO 64, FINAL FANTASIA VII och de andra.
3. **0.4 – 2000–2016:** DVD, online, HD, rörelse, HALOO, GTA III–V, VI SPORT och GRUVKRAFT. Telefonavdelningen 2007, där Mobilfabrikens telefoner flyttar in som grenen MOBIL, och app-butiken.
4. **0.5 – 2017–2026:** hybriden, SSD, FORTNAJT, ELDEN KING, GTA VI och slutgalan.

Varje steg testas som telefonerna: en balansrobot som spelar hela eran och en klickrobot genom handledningen.` },
  ],
  fragor: [
    { id: 'gta', fraga: 'Vad ska GTA VI heta i spelet?', rek: 'GRAND THEFT AUTOMOBIL VI – bara ett ord byts, alla fattar direkt. Alternativ: STORA BILSTÖLDEN VI eller GRAND HEIST AUTO VI.' },
    { id: 'vald', fraga: 'Våldsamma spel (MORTAL KOMBO, DOOMSDAG, CALL OF DUTTY, GTA) – ska de vara med?', rek: 'Ja, men glimtarna visar bara lugna scener: bilkörning i solnedgången, korridorer, landskap. Inga vapen och inget blod.' },
    { id: 'start', fraga: 'Ska läget börja 1 januari 1982, Commodore 64-tiden?', rek: 'Ja. PANG! (Pong) blir ert första egna spel, och ATARO 2600 finns redan på marknaden som rival.' },
    { id: 'rivaler', fraga: 'Ska rivalerna heta NINTENTO, SONNI PLAY STATIO, SEGO och MIKROMJUK X-LÅDA?', rek: 'Ja, samma stil som telefonernas rivaler. Namnen syns i nyheterna och på tidslinjen.' },
    { id: 'egna', fraga: 'Ska spel som i verkligheten bara finns på en tillverkares konsol (Mario, Zelda, Halo, Pokémon) kunna komma till er konsol?', rek: 'Ja. I spelet är de fristående studios (SVAMPSTUDION, BUNGO, SPELFREAK), annars blir det för få stora spel att jaga.' },
    { id: 'slut', fraga: 'Ska spelet sluta med GTA VI i november 2026, eller fortsätta in i PS6-tiden?', rek: 'Slutgala i december 2026, och efter den kan man spela vidare fritt. Tekniken för nästa generation finns från hösten 2026, så man kan släppa sin egen PS6 som sista konsol.' },
    { id: 'telefonar', fraga: 'När ska telefonerna kunna låsas upp?', rek: '2007, med de första pekskärmstelefonerna, och det kräver fickkonsol, pekskärm och trådlöst nät. Alternativet är tidigare, med knapptelefoner från 1996 och spelet ORMEN, men då behövs en ny sorts telefon i designern.' },
    { id: 'snabbstart', fraga: 'Ska dagens Mobilfabriken finnas kvar som SNABBSTART 2007 med bara telefoner?', rek: 'Ja. Barnens sparningar fungerar som förut, och den som bara vill göra telefoner slipper 25 år av konsoler först.' },
    { id: 'delat', fraga: 'Ska konsoler och telefoner dela forskningspoäng, personal och kassa?', rek: 'Ja. Då blir det ett riktigt val vad forskarna ska jobba med, och att öppna telefonavdelningen blir ett stort beslut.' },
    { id: 'appar', fraga: 'Ska det finnas en app-butik där studios gör mobilspel till era telefoner?', rek: 'Ja, med ARGA FÅGLAR, GODISKROSS, TUNNELBANESURFARNA och FICKMONSTER GÅ. Ni får 30 % av köpen.' },
    { id: '3d', fraga: 'Ska konsolerna visas i 3D som telefonen?', rek: 'Ja. Hemdatorn, lådan, fickkonsolen, tornet och hybriden blir egna 3D-modeller med handkontrollen bredvid. Rivalerna och spelen förblir pixel.' },
    { id: 'ordning', fraga: 'Är byggordningen bra: först 1982–1988 som en spelbar version, sedan en era i taget?', rek: 'Ja. Då kan ni spela 80-talet om några dagar och se läget växa.' },
  ],
  namn: [
    { namn: 'MOBILFABRIKEN', motiv: 'Behåll namnet – appen och adressen heter redan så, och telefonerna är målet man jobbar mot.' },
    { namn: 'KONSOLFABRIKEN', motiv: 'Spelet börjar med konsoler och de är det mesta av resan.' },
    { namn: 'TEKNIKFABRIKEN', motiv: 'Rymmer både konsoler, telefoner och prylar.' },
    { namn: 'PRYLFABRIKEN', motiv: 'Kort och lätt för barn – allt man bygger är prylar.' },
  ],
};
