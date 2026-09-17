# Oefenkampioen

Zeven oefenspellen voor het derde leerjaar, in een bestand: `oefenkampioen.html`.
Geen build, geen dependencies. Dubbelklik het bestand of open het in een browser.

Opvolger van de losse spellen klok-oefenen en maaltafelmonsters. Die zijn hier mee ingebouwd,
zodat de opmaak, de puntentelling, de opslag en de zelfcheck maar op een plaats staan.

## De spellen

| spel | wat |
| --- | --- |
| Klokkijken | hele uren, kwartieren, dagdelen, digitale klok, tijdsduur |
| Maaltafelmonsters | maaltafels, delen, de ontbrekende factor |
| Het winkeltje | munten tellen, wisselgeld, welke munt ontbreekt |
| De maatmonsters | liniaal lezen, m/cm/mm, kg/g, l/dl/cl, welke maat past |
| De kalender | dagen, maanden, seizoenen, hoeveel dagen, verder tellen |
| Bruggen bouwen | optellen en aftrekken tot 1000 over het tiental |
| Spiegelmonsters | spiegelen, symmetrie, gedraaid of gespiegeld |

Elk spel heeft vijf tot zeven hoofdstukken. Een toets telt 10, 15 of 20 vragen, te kiezen op
het startscherm, en evenveel punten. Twintig is de bovengrens: langer houdt een kind van acht
niet vol. De verdeling over de vraagtypes schaalt mee met het gekozen aantal.

Op het startscherm staat ook een schakelaar **op tempo**. Staat die aan, dan loopt er per vraag
een balk leeg en telt te traag als fout. Elk spel heeft zijn eigen tijd: de tafels krijgen 8
seconden, want automatiseren betekent niet uitrekenen, en het winkeltje 30, want daar moet je
eerst munten tellen. Tempotoetsen voor de tafels lopen in Vlaanderen al vanaf het tweede
leerjaar, dus de schakelaar is niet alleen voor de grootsten. Standaard staat hij uit.

De naam van het kind en de beste score per hoofdstuk blijven bewaard in de browser. Scores
worden op verhouding vergeleken, zodat 12 op 15 beter telt dan 7 op 10.

## Hoe een spel in elkaar zit

Het chassis kent de schermen, de punten, de bolletjes, de opslag en de zelfcheck. Een spel is
een object dat zichzelf bij `SPELLEN` aanmeldt en deze dingen levert:

| veld | wat het doet |
| --- | --- |
| `hoofdstukken` | titel, moeilijkheid en een `plan`: hoeveel vragen van elk type |
| `zaadjes(soort, h)` | alle mogelijke vragen van dat type, elk maar een keer per toets |
| `maak(soort, z, h)` | van een zaadje een vraag maken, met keuzes of invulvakjes |
| `teken(v)` | de tekening op het doek: klok, munten, rooster, getallenlijn |
| `scherm(v)` | wat er op het zwarte schermpje staat, of niets |
| `vraag(v, nr)` | de vraagzin en een hulpzin eronder |
| `uitleg(v)` | wat er na het antwoord verschijnt, juist of fout |
| `kort(v)` | een regel voor de foutenlijst op het eindscherm |
| `test(check)` | de eigen controles van dat spel |

Een vraag heeft ofwel `options` (vier keuzes, precies een juiste) ofwel `typen` (invulvakjes
met per vakje het verwachte getal). Het chassis regelt de rest.

## Afleiders

De foute keuzes zijn overal de denkfouten die kinderen echt maken, niet willekeurige getallen.

- **Klok**: over en voor verwisselen, bij half het uur pakken dat al geweest is, de minuutwijzer als urenwijzer lezen
- **Maaltafels**: optellen in plaats van keer, een rij te ver in de tafel, de cijfers van het product omwisselen
- **Winkel**: de centen laten vallen, een munt dubbel tellen, en bij wisselgeld de euro's aftrekken maar de centen overschrijven
- **Maten**: een factor tien mis, of omrekenen in de verkeerde richting
- **Bruggen**: het onthouden vergeten, een tiental te veel, de verkeerde bewerking
- **Spiegelen**: een halve slag gedraaid in plaats van gespiegeld, of gewoon opzij geschoven

## Wat de tekening niet mag verklappen

Een tekening mag helpen, nooit antwoorden. De seizoenkaart staat er alleen bij de omgekeerde
vraag, het maandblaadje verdwijnt bij "hoeveel dagen heeft oktober", en de sprongen op de
getallenlijn blijven leeg bij "47 + ? = 55". De zelfcheck controleert dat alle drie.

## Zelfcheck

Open `oefenkampioen.html#test` en bekijk de console. De check rekent 705 volledige toetsen
door: elk spel, elk hoofdstuk, bij 10, 15 en 20 vragen, vijf rondes per combinatie. Per vraag
controleert hij onder meer dat er vier verschillende keuzes zijn met precies een juist
antwoord, dat een vraag niet twee keer in dezelfde toets voorkomt, dat de invulvakjes samen
het antwoord vormen, en dat er nergens `undefined` in een tekst of tekening sluipt.

Daarbovenop heeft elk spel zijn eigen controles: dat de twaalf maanden samen 365 dagen tellen,
dat quotient maal deler het deeltal geeft, dat heen en terug omrekenen weer op het beginpunt
uitkomt, dat de twee sprongen van een brug samen de hele sprong zijn, en dat twee keer
spiegelen je terugbrengt bij het begin.
