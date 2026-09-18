# Oefenkampioen

Zeven oefenspellen voor de lagere school. Geen build, geen dependencies, geen framework.

De spellen zijn ES-modules, en een browser weigert die van `file://` te laden. Dus niet
dubbelklikken, maar via een servertje openen:

```sh
python3 -m http.server 8000
```

Daarna `http://localhost:8000` in de browser. Wie het spel gewoon wil spelen, gebruikt de
GitHub Pages-link van deze repo.

Opvolger van de losse spellen klok-oefenen en maaltafelmonsters. Die zijn hier mee ingebouwd,
zodat de opmaak, de puntentelling, de opslag en de zelfcheck maar op een plaats staan.

## Leerjaren

Elk hoofdstuk hoort bij het leerjaar waarin het wordt aangebracht. Op het startscherm kies je
met de rij **Welk leerjaar?** je niveau, en die keuze blijft bewaard.

Een leerjaar is cumulatief. Kies je het derde, dan zie je alles tot en met het derde: de hele
uren van het eerste, de kwartieren van het tweede en de tijdsduur van het derde. Wie in het derde
zit moet de kwartieren immers nog kunnen oefenen.

- binnen een spel is het één vlakke lijst, met een kopje tussen de leerjaren als de lijst er meer
  dan één bevat; je hoeft het leerjaar niet nog eens te kiezen
- een spel zonder iets voor het gekozen niveau staat niet op het startscherm
- een kind dat vooruit wil, zet het leerjaar een stapje hoger

Vandaag zitten er 71 hoofdstukken in: 15 in het eerste leerjaar, 30 in het tweede, 26 in het
derde. Een kind in het derde heeft er dus 71 te oefenen, een kind in het eerste 15. Het
vierde tot zesde leerjaar voegen nog niets toe.

## De spellen

| spel | wat |
| --- | --- |
| Klokkijken | hele uren, kwartieren, dagdelen, digitale klok, tijdsduur |
| Maaltafels | maaltafels, delen, de ontbrekende factor |
| Het winkeltje | munten tellen, wisselgeld, welke munt ontbreekt |
| Meten en wegen | liniaal lezen, m/cm/mm, kg/g, l/dl/cl, welke maat past |
| De kalender | dagen, maanden, seizoenen, hoeveel dagen, verder tellen |
| Bruggen bouwen | optellen en aftrekken tot 1000 over het tiental |
| Spiegelen | spiegelen, symmetrie, gedraaid of gespiegeld |

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

De bestanden:

| bestand | wat erin staat |
| --- | --- |
| `index.html` | de schermen en de hele opmaak |
| `chassis.js` | schermen, punten, bolletjes, opslag, de toets, de knoppen |
| `gereedschap.js` | `shuffle`, `keuzes`, `vulAan` en de rest die spellen delen |
| `spellen/index.js` | de zeven spellen, in de volgorde van het startscherm |
| `spellen/*.js` | een spel per bestand |
| `zelfcheck.js` | de controles, alleen binnengehaald bij `#test` |

Het chassis kent de schermen, de punten, de bolletjes, de opslag en de zelfcheck. Een spel is
een module met `export default` op een object dat deze dingen levert:

| veld | wat het doet |
| --- | --- |
| `hoofdstukken` | `leerjaar`, titel, moeilijkheid en een `plan`: hoeveel vragen van elk type |
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

Open `index.html#test` en bekijk de console. De check rekent 705 volledige toetsen
door: elk spel, elk hoofdstuk, bij 10, 15 en 20 vragen, vijf rondes per combinatie. Per vraag
controleert hij onder meer dat er vier verschillende keuzes zijn met precies een juist
antwoord, dat een vraag niet twee keer in dezelfde toets voorkomt, dat de invulvakjes samen
het antwoord vormen, en dat er nergens `undefined` in een tekst of tekening sluipt.

Daarbovenop heeft elk spel zijn eigen controles: dat de twaalf maanden samen 365 dagen tellen,
dat quotient maal deler het deeltal geeft, dat heen en terug omrekenen weer op het beginpunt
uitkomt, dat de twee sprongen van een brug samen de hele sprong zijn, en dat twee keer
spiegelen je terugbrengt bij het begin.
