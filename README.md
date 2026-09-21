# Oefenkampioen

Oefenspellen voor de lagere school. Geen build, geen dependencies, geen framework.

## Spelen

**[drkdw.github.io/oefenkampioen](https://drkdw.github.io/oefenkampioen/)**. Die link werkt
gewoon, in elke browser, op elke computer of tablet. Niets te installeren.

## Aan de code werken

De spellen zijn ES-modules, en een browser weigert die van `file://` te laden: dat is een
browserbeveiliging, geen keuze van dit project, en ze geldt in Chrome, Firefox en Safari
allemaal even hard. Dubbelklikken op `index.html` werkt daardoor niet. Open in de plaats een
kleine lokale server in deze map:

```sh
python3 -m http.server 8000
```

en ga naar `http://localhost:8000`. Alleen nodig om te testen voor je pusht; wie het spel
gewoon speelt, heeft dit nooit nodig en gebruikt de link hierboven.

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

Vandaag zitten er 104 hoofdstukken in: 17 in het eerste leerjaar, 31 in het tweede, 29 in het
derde, 15 in het vierde, 12 in het vijfde. Een kind in het vijfde heeft er dus 104 te oefenen,
een kind in het eerste 17. Het zesde leerjaar voegt nog niets toe.

## De spellen

| spel | wat |
| --- | --- |
| Klokkijken | hele uren, kwartieren, dagdelen, digitale klok, tijdsduur, seconden |
| Maaltafels | sprongen tellen, maaltafels, delen, de ontbrekende factor |
| Het winkeltje | samen en gepast betalen, munten tellen, wisselgeld |
| Meten en wegen | vergelijken zonder meten, liniaal lezen, liter aflezen, m/cm/mm, kg/g, l/dl/cl |
| De kalender | dagen, maanden, seizoenen, hoeveel dagen, verder tellen |
| Bruggen bouwen | splitsen, brug tot 20 en tot 1000, cijferend rekenen, negatieve getallen |
| Spiegelen | vormen, richtingen, spiegelen, symmetrie, gedraaid of gespiegeld |
| Breuken | deel van een geheel, gelijkwaardig, optellen, breuk maal getal, kommagetallen |
| Meetkunde | omtrek, oppervlakte, hoeken, volume van een blok, driehoek |
| Verhoudingen | procent van een getal, en rekenen met een schaal |

Elk spel heeft één tot vijftien hoofdstukken, afhankelijk van hoeveel leerjaren het al dekt.
Een toets telt 10, 15 of 20 vragen, te kiezen op
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
| `spellen/index.js` | de spellen, in de volgorde van het startscherm |
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
- **Bruggen**: het onthouden vergeten, een tiental te veel, de verkeerde bewerking, en bij de brug tot 20 het tiental gewoon vergeten (12 + 5 = 7 in plaats van 17)
- **Spiegelen**: een halve slag gedraaid in plaats van gespiegeld, of gewoon opzij geschoven
- **Breuken**: het aantal stukjes en het aantal gekleurde stukjes verwisselen, de noemer vergeten mee te nemen
- **Meetkunde**: enkel twee zijden optellen in plaats van vier, oppervlakte in plaats van omtrek, vergeten door twee te delen bij een driehoek
- **Verhoudingen**: het verschil nemen in plaats van het deel, of de schaal vergeten toe te passen

## Wat de tekening niet mag verklappen

Een tekening mag helpen, nooit antwoorden. De seizoenkaart staat er alleen bij de omgekeerde
vraag, het maandblaadje verdwijnt bij "hoeveel dagen heeft oktober", en de sprongen op de
getallenlijn blijven leeg bij "47 + ? = 55". De zelfcheck controleert dat alle drie.

## Zelfcheck

Open `index.html#test` en bekijk de console. De check rekent alle volledige toetsen door: elk
spel, elk hoofdstuk, bij 10, 15 en 20 vragen, vijf rondes per combinatie; dat zijn er vandaag
1560. Per vraag controleert hij onder meer dat er vier verschillende keuzes zijn met precies een
juist antwoord, dat een vraag niet vaker voorkomt dan de voorraad toelaat en nooit twee keer na
elkaar, dat de invulvakjes samen het antwoord vormen, en dat er nergens `undefined` in een
tekst, tekening of het schermpje sluipt.

Draai je lokaal `#test` en zie je een ander getal dan hierboven: dat is het bewijs dat je een
gecachete versie van een bestand bekijkt, niet dat de zelfcheck faalt. Open een nieuwe tab,
gebruik geen bestaande, en zorg dat je server geen `Cache-Control` meestuurt die hergebruik
toelaat.

Daarbovenop heeft elk spel zijn eigen controles: dat de twaalf maanden samen 365 dagen tellen,
dat quotient maal deler het deeltal geeft, dat heen en terug omrekenen weer op het beginpunt
uitkomt, dat de twee sprongen van een brug samen de hele sprong zijn, dat twee keer spiegelen
je terugbrengt bij het begin, dat geen twee breuken in het vergelijkspel gelijkwaardig zijn, en
dat elke gelijkwaardige breuk in sectie 9 ook echt dezelfde waarde heeft als zijn basisbreuk.

## Licentie

MIT, zie [LICENSE](LICENSE). Vrij te gebruiken, aan te passen en te delen.
