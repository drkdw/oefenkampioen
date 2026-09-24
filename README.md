# Oefenkampioen

Oefenspellen voor de lagere school in Vlaanderen, van het eerste tot het zesde leerjaar. Geen
build, geen dependencies, geen framework.

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

De tests draaien zonder installatie, enkel met Node:

```sh
node --import ./test/pre.mjs test/alles.mjs
```

Dat bouwt elke vraag van elk spel en controleert de beloningslogica. In de browser meet
`(await import('/test/layout-meting.js')).meet()` of vraag, keuzes en de volgende-knop op het
huidige scherm passen zonder te scrollen.

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

Alle zes leerjaren van het lager onderwijs zitten erin: 114 hoofdstukken, 17 in het eerste
leerjaar tot 10 nieuwe in het zesde. Een kind in het zesde heeft er dus 114 te oefenen, een kind
in het eerste 17. Elk hoofdstuk hoort bij het leerjaar waarin het in de klas aan bod komt.

## Het startscherm en de beloningen

Bovenaan staat **Voor jou vandaag**: een hoofdstuk met 1 of 2 sterren om te verbeteren, anders een
hoofdstuk dat je nog nooit speelde, en elke dag begint het zoeken bij een ander spel. Daaronder
één regel met leerjaar, aantal vragen en tempo, die openklapt, en dan de spellen als tegels.

Elk hoofdstuk heeft 0 tot 3 sterren volgens je beste score: 1 vanaf 50%, 2 vanaf 70%, 3 vanaf
90%. Drie sterren geeft een sticker in **Mijn stickers**, een vast figuurtje per hoofdstuk. De
teller telt de hoofdstukken tot je eigen leerjaar, plus elke sticker die je hoger al haalde. Per kind telt de app op hoeveel dagen er deze maand
geoefend is; er is geen reeks die breekt als je een dag overslaat.

Tijdens een toets past alles op het scherm, ook op een kleine gsm en liggend. Na een juist
antwoord gaat het na 3,5 seconden vanzelf verder; na een fout blijft de uitleg staan.

## De spellen

| spel | wat |
| --- | --- |
| Klokkijken | hele uren, kwartieren, dagdelen, digitale klok, tijdsduur, seconden |
| Maaltafels | sprongen tellen, maaltafels, delen, de ontbrekende factor |
| Het winkeltje | samen en gepast betalen, munten tellen, wisselgeld |
| Meten en wegen | vergelijken zonder meten, liniaal lezen, liter aflezen, alle omzettingen door elkaar |
| De kalender | dagen, maanden, seizoenen, hoeveel dagen, verder tellen |
| Bruggen bouwen | splitsen, brug tot 20 en tot 1000, cijferend rekenen, negatieve getallen, machten van tien |
| Spiegelen | vormen, richtingen, spiegelen, symmetrie, gedraaid of gespiegeld |
| Breuken | deel van een geheel, gelijkwaardig, optellen, breuk maal getal, kommagetallen |
| Meetkunde | omtrek, oppervlakte, hoeken, volume, driehoek, ruimtefiguren, hoeken meten |
| Verhoudingen | procent, schaal, btw en korting, verhoudingstabel, snelheid, gemiddelde, diagrammen |

Elk spel heeft zeven tot dertig hoofdstukken, afhankelijk van hoeveel leerjaren het dekt.
Een toets telt 10, 15 of 20 vragen, te kiezen op
het startscherm, en evenveel punten. Twintig is de bovengrens: langer houdt een kind van acht
niet vol. De verdeling over de vraagtypes schaalt mee met het gekozen aantal.

Op het startscherm staat ook een schakelaar **op tempo**. Staat die aan, dan loopt er per vraag
een balk leeg en telt te traag als fout. Elk spel heeft zijn eigen tijd: de tafels krijgen 8
seconden, want automatiseren betekent niet uitrekenen, en het winkeltje 30, want daar moet je
eerst munten tellen. Tempotoetsen voor de tafels lopen in Vlaanderen al vanaf het tweede
leerjaar, dus de schakelaar is niet alleen voor de grootsten. Standaard staat hij uit.

Elk kind heeft een eigen profiel: naam, gekozen leerjaar, instellingen en beste score per
hoofdstuk. Tik op de naam naast het geluidsicoon om te wisselen of een nieuw profiel toe te
voegen. In dat paneel zie je per kind ook het leerjaar en hoeveel hoofdstukken al geoefend zijn.
Verwijderen kan enkel achter `index.html#admin`, niet in de gewone weergave: een kind mag zijn
eigen profiel niet kunnen laten verdwijnen, ook niet de onschuldige variant. Achter `#admin` komt
er per profiel een kruisje bij dat de keuze geeft tussen **uit de lijst** (de scores blijven
staan, typ de naam later opnieuw en ze staan er terug) en **écht wissen** (naam, leerjaar en
scores voorgoed weg, met een expliciete bevestiging ertussen).

Die gegevens staan in `localStorage` van de browser: enkel op dit toestel, in deze ene browser,
niet in een account en niet in de cloud. Wis je de browsergegevens, gebruik je een andere browser
of een ander toestel, dan zijn ze weg, en niets waarschuwt daar vooraf voor. `#admin` geeft ook
twee bewaarknoppen, om diezelfde reden voor een ouder bedoeld, net als de zelfcheck achter
`#test`: **Bewaar als bestand** downloadt een klein bestandje met alle profielen en scores,
**Herstel van bestand** zet dat later terug. Herstellen voegt enkel toe: profielen worden op naam
herkend, een profiel dat er al staat houdt zijn instellingen, en een beste score wordt alleen
vervangen door een betere. Het bestand wordt eerst helemaal gecontroleerd; een kapot of vreemd
bestand verandert niets en geeft een melding in het paneel. Scores worden op verhouding
vergeleken, zodat 12 op 15 beter telt dan 7 op 10.

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
| `beloning.js` | sterren, stickers, het voorstel van de dag en de dagen geoefend, zonder scherm of opslag |
| `test/` | de Node-tests en de layoutmeting |

Het chassis kent de schermen, de punten, de bolletjes, de opslag en de zelfcheck. Een spel is
een module met `export default` op een object dat deze dingen levert:

| veld | wat het doet |
| --- | --- |
| `id`, `ico`, `naam`, `tekst` | hoe het spel heet en op het startscherm staat |
| `hoofdstukken` | `leerjaar`, titel, moeilijkheid en een `plan`: hoeveel vragen van elk type |
| `zaadjes(soort, h)` | alle mogelijke vragen van dat type, elk maar een keer per toets |
| `maak(soort, z, h)` | van een zaadje een vraag maken, met keuzes of invulvakjes |
| `teken(v)` | de tekening op het doek: klok, munten, rooster, getallenlijn |
| `scherm(v)` | wat er op het zwarte schermpje staat, of niets |
| `vraag(v, nr)` | de vraagzin en een hulpzin eronder |
| `uitleg(v)` | wat er na het antwoord verschijnt, juist of fout |
| `kort(v)` | een regel voor de foutenlijst op het eindscherm |
| `test(check)` | de eigen controles van dat spel |

Optioneel: `top` (de lof bij een bijna foutloze toets), `jasjes(soort, h)` (verschillende
voorstellingen van dezelfde vraag), `na(v)` (iets doen nadat de vraag op het scherm staat, zoals
de klok laten draaien) en `reactie(v, ok)` (iets tonen na het antwoord, zoals het monster).

Een vraag heeft ofwel `options` (vier keuzes, precies een juiste) ofwel `typen` (invulvakjes
met per vakje het verwachte getal). Het chassis regelt de rest.

## Afleiders

De foute keuzes zijn bijna overal de denkfouten die kinderen echt maken, niet willekeurige getallen.

- **Klok**: over en voor verwisselen, bij half het uur pakken dat al geweest is, de minuutwijzer als urenwijzer lezen
- **Maaltafels**: optellen in plaats van keer, een rij te ver in de tafel, de cijfers van het product omwisselen
- **Winkel**: de centen laten vallen, een munt dubbel tellen, en bij wisselgeld de euro's aftrekken maar de centen overschrijven
- **Maten**: een factor tien mis, of omrekenen in de verkeerde richting
- **Bruggen**: het onthouden vergeten, een tiental te veel, de verkeerde bewerking, en bij tot 20 zonder brug het tiental gewoon vergeten (12 + 5 = 7 in plaats van 17)
- **Spiegelen**: een halve slag gedraaid in plaats van gespiegeld, of gewoon opzij geschoven
- **Breuken**: bij optellen ook de noemers optellen (1/4 + 2/4 = 3/8), bij ongelijke noemers vergeten om eerst gelijknamig te maken, en tellers net naast het juiste antwoord
- **Kalender**: hier zijn de foute keuzes gewoon andere dagen of maanden; bij de seizoenen nooit een maand die in twee seizoenen valt
- **Meetkunde**: enkel twee zijden optellen in plaats van vier, oppervlakte in plaats van omtrek, vergeten door twee te delen bij een driehoek
- **Verhoudingen**: het verschil nemen in plaats van het deel, de schaal vergeten toe te passen, of de eenheidsprijs verwarren met het gevraagde aantal

## Wat de tekening niet mag verklappen

Een tekening mag helpen, nooit antwoorden. De seizoenkaart staat er alleen bij de omgekeerde
vraag, het maandblaadje verdwijnt bij "hoeveel dagen heeft oktober", en de sprongen op de
getallenlijn blijven leeg bij "47 + ? = 55". De zelfcheck controleert dat alle drie. Op de
getallenlijn tot 10 en tot 20 staan enkel 0 en het einde met een getal: het kind telt de
streepjes, de boog landt niet op een gedrukt antwoord.

## Zelfcheck

Open `index.html#test` en bekijk de console. De check rekent alle volledige toetsen door: elk
spel, elk hoofdstuk, bij 10, 15 en 20 vragen, vijf rondes per combinatie; dat zijn er vandaag
1710. Per vraag controleert hij onder meer dat er vier verschillende keuzes zijn met precies een
juist antwoord, dat een vraag niet vaker voorkomt dan de voorraad toelaat en nooit twee keer na
elkaar, dat de invulvakjes samen het antwoord vormen en dat het antwoord in het vakje past, dat
een kommagetal nooit met een punt verschijnt, en dat er nergens `undefined` in een tekst, tekening
of het schermpje sluipt. Ook het bewaarbestand wordt getest: namen met markup, kapotte scores en
dubbele profielen raken er niet door.

Draai je lokaal `#test` en zie je een ander getal dan hierboven: dat is het bewijs dat je een
gecachete versie van een bestand bekijkt, niet dat de zelfcheck faalt. Open een nieuwe tab,
gebruik geen bestaande, en zorg dat je server geen `Cache-Control` meestuurt die hergebruik
toelaat.

Daarbovenop heeft elk spel zijn eigen controles: dat de twaalf maanden samen 365 dagen tellen,
dat heen en terug omrekenen weer op het beginpunt uitkomt, dat tussen kg en g ×1000 staat, dat de
twee sprongen van een brug samen de hele sprong zijn, dat twee keer spiegelen je terugbrengt bij
het begin, dat een vorm voor de platte spiegelas in de bovenste helft blijft, dat geen twee
breuken in het vergelijkspel gelijkwaardig zijn, en dat elke breuk in de tabel `GELIJKWAARDIG`
ook echt dezelfde waarde heeft als zijn basisbreuk.

## Licentie

MIT, zie [LICENSE](LICENSE). Vrij te gebruiken, aan te passen en te delen.
