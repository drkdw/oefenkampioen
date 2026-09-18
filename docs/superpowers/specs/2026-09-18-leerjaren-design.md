# Oefenkampioen voor het hele lager onderwijs

Ontwerp, 18 september 2026.

## 1. Doel

Oefenkampioen dekt vandaag het derde leerjaar. Dit ontwerp brengt het naar het volledige
lager onderwijs, leerjaar 1 tot en met 6, volgens de doelen van het Vlaamse leerplan wiskunde.

**Bron en haar grens.** De overheid legt de minimumdoelen wiskunde vast op
[onderwijsdoelen.be](https://onderwijsdoelen.be), geldig vanaf 1 september 2025. Die doelen zijn
alleen vastgelegd op twee ijkpunten voor het lager onderwijs: einde vierde leerjaar en einde
zesde leerjaar. Er is geen officiële bron die zegt wat er precies in leerjaar 1, 2, 3 of 5 moet
staan; dat is de sequenering die schoolmethodes zelf kiezen. Waar deze spec een doel aan een
specifiek leerjaar hangt, is dat dus de gangbare volgorde in Vlaamse methodes, niet een letterlijk
overheidsdoel voor dat jaar, behalve waar een doelcode zoals `2.2.17` expliciet genoemd wordt.
Twijfel je aan een leerjaar, controleer dan op onderwijsdoelen.be of het doel bij het vierde of
zesde leerjaar hoort, en leid daaruit af of onze plaatsing te vroeg of te laat is.

Het is niet gemaakt voor één bepaald kind. Een ouder of leerkracht moet in één blik kunnen zien
wat er voor een leerjaar in zit, en een kind moet zonder hulp bij zijn eigen niveau komen.

Twee dingen blijven onaangeroerd: de zeven bestaande spellen behouden hun inhoud, en het derde
leerjaar dat er vandaag staat verandert niet.

## 2. Beslissingen en waarom

| beslissing | keuze | reden |
| --- | --- | --- |
| bereik | leerjaar 1 tot 6 | volledig lager onderwijs |
| bestandsvorm | losse ES-modules, geen bouwstap | één bestand van 9000 regels wordt onwerkbaar; publiceren gaat via GitHub Pages, dus de dubbelklik is niet nodig |
| niveaukeuze | alles open, per leerjaar ingeklapt | niets afgesloten: een kind dat het aankan mag vooruit kijken, een kind dat het moeilijk heeft mag een jaar terug zonder dat het als straf voelt |
| te kleine vragenvoorraad | herhaling toegestaan als vangnet | herhaling is oefenen; voorstellingswissels maken ze grotendeels onzichtbaar |
| bouwvolgorde | leerjaar 1 eerst, dan naar boven | niet voor één bepaald kind, dus de instapdrempel in leerjaar 1 weegt zwaarst |

## 3. Bestandsindeling

```
oefenkampioen/
  index.html            schermen en opmaak, laadt chassis.js als module
  chassis.js            schermen, punten, toets, opslag, knoppen
  gereedschap.js        shuffle, pad2, keuzes, vulAan, vulRondom, andere, hoofdletter
  doelen.js             de leerplandoelen per leerjaar, als data
  spellen/
    index.js            importeert de spellen in vaste volgorde
    klok.js
    maaltafels.js
    winkel.js
    maten.js
    kalender.js
    rekenen.js          was bruggen.js, krijgt cijferend rekenen erbij
    spiegelen.js
    breuken.js          nieuw
    meetkunde.js        nieuw
    verhoudingen.js     nieuw
  zelfcheck.js
```

Tien spellen, niet elf. Cijferend rekenen hoort in hetzelfde domein als Bruggen bouwen, dus dat
spel wordt `rekenen.js`. Naam en icoon van het spel blijven in het spelobject staan, zodat het
voor een kind niets verandert.

Registratie verandert van `SPELLEN.push({...})` naar `export default {...}`, met een
`spellen/index.js` die de spellen in een expliciete volgorde importeert. Vandaag bepaalt de
volgorde van de `<script>`-blokken de volgorde van de spellen; een expliciete lijst maakt dat
een keuze en maakt de zelfcheck reproduceerbaar.

Statische imports, geen dynamische. Faalt één spelmodule, dan faalt het geheel, en dat is
gewenst: de zelfcheck betrapt een kapotte module voor publicatie, en een half startscherm is
verwarrender voor een kind dan een duidelijke fout voor de ontwikkelaar.

Publiceren via GitHub Pages op `main`, map `/`. Geen bouwstap, geen dependencies. Geen
`.nojekyll` nodig zolang geen map met een underscore begint.

**Gebouwd tijdens stap 3.** GitHub Pages voor een privé-repo vraagt een betaald plan; de repo
stond privé en Pages faalde daardoor stil met een 404 tot iemand het navroeg. Nu publiek (de
volledige geschiedenis is nagekeken, er staat niets gevoeligs in), Pages actief op
[drkdw.github.io/oefenkampioen](https://drkdw.github.io/oefenkampioen/), MIT-licentie, en de
repo-metadata (beschrijving, homepage-link, topics) ingevuld.

## 4. De leerjaardimensie

Eén veld per hoofdstuk, één geheel getal van 1 tot 6: het leerjaar waarin het doel wordt
aangebracht.

```js
{ leerjaar: 3, doelen: ['tijdsduur'], ico: '⏳', titel: 'Tijd berekenen', tekst: '...', plan: {...} }
```

Geen bereik zoals `leerjaar: [2, 3]`. Eén getal volstaat, want het leerjaar is **cumulatief**:
kies je het derde, dan zie je alles met `leerjaar <= 3`. Wie in het derde zit moet de kwartieren
van het tweede nog kunnen oefenen, en de hele uren van het eerste ook. Een leerjaar is dus een
niveau, geen vakje.

Het leerjaar staat op het hoofdstuk, niet op het spel: een spel loopt over meerdere leerjaren.

### Op het scherm

- Op het startscherm komt een rij **Welk leerjaar?** met de knoppen 1 tot 6, dezelfde
  knoppenrij als "Hoeveel vragen?". Het is een voorkeur, geen slot: alle zes blijven altijd
  bereikbaar. De keuze wordt bewaard onder `oefenkampioen-leerjaar`, standaard 3 zolang de
  andere jaren nog leeg zijn.
- **Een spel zonder hoofdstukken voor het gekozen jaar staat niet op het startscherm.** Eerst
  wel tonen en dan pas, na een klik, laten weten dat het leeg is, kost een kind een handeling
  voor niets. Wat overblijft komt in de vaste spelvolgorde te staan, niet gesorteerd op dekking.
- Op elke kaart die overblijft komt één regel bij die zegt hoeveel hoofdstukken er voor dit
  leerjaar klaarstaan, bijvoorbeeld *7 hoofdstukken*.
- Binnen een spel staat één vlakke lijst met alle hoofdstukken tot en met het gekozen leerjaar.
  **Geen tweede leerjaarkeuze in het spel**: het niveau is al gekozen op het startscherm.
- Loopt die lijst over meer dan één leerjaar, dan komt er een kopje tussen elke overgang: een
  gewone `<p>` met "1ste leerjaar" tot "6de leerjaar", zonder klikgedrag. Bij precies één
  leerjaar in de lijst blijft het kopje weg, want dan zegt het niets dat de spelkaart niet al
  zegt. Zonder dat kopje leest een lijst van tien hoofdstukken als één willekeurige stapel in
  plaats van twee duidelijke stappen; met tien tot twintig hoofdstukken in de hoogste leerjaren
  is dat geen kosmetisch detail maar de grens tussen leesbaar en rommelig.
- De hoofdstukken worden genummerd vanaf 1, doorlopend over de kopjes heen. De opslagsleutel
  blijft de index in `hoofdstukken`, dus bestaande beste scores blijven geldig.
- De opslag gaat, zoals alle opslag in dit project, door een `try`/`catch`: zonder localStorage
  werkt het spel gewoon verder, dan staat het derde leerjaar gekozen.

### Het grote examen

Het grote examen van een spel mengt de vraagtypes van dat spel en staat vandaag op leerjaar 3.
Daardoor heeft leerjaar 1 en 2 nog geen examen, en dat klopt ook: het huidige examen mengt
materie die een kind van zes nog niet gezien heeft.

Vanaf stap 1 krijgt elk leerjaar zijn eigen examen in een spel, zodra dat leerjaar daar drie of
meer hoofdstukken heeft. Het is een gewoon hoofdstuk met een eigen `plan` over de vraagtypes van
dat niveau, dus het vraagt geen nieuwe machinerie. Onder de drie hoofdstukken is een examen
zinloos, want dan is het hetzelfde als het hoofdstuk zelf.

### Naamgeving: een vaardigheid die groeit blijft herkenbaar

Sommige vaardigheden komen in twee leerjaren terug in een grotere versie, zoals de tafels: klein
in leerjaar 2, alle tafels in leerjaar 3. Beide hoofdstukken krijgen dan **hetzelfde icoon en een
titel van dezelfde vorm** (*Het gat in de kleine tafels* / *Het gat in alle tafels*, niet *Het gat
in de kleine tafels* / *Het gat in het monster*). Zonder die regel leest een flinke lijst als
toevallige, losse namen in plaats van twee stappen van dezelfde vaardigheid, en dat is precies
wat er misging bij de eerste versie van de nieuwe maaltafelhoofdstukken in dit ontwerp.

## 5. Jasjes: dezelfde vraag, andere voorstelling

### De regel

**Een jasje mag de moeilijkheid niet veranderen, alleen de voorstelling.**

Verandert een variant de moeilijkheid, dan is het geen jasje maar een eigen doel of een eigen
zaadje, met een eigen hoofdstuk en een eigen vraagzin.

| wissel | voorbeeld bij de splitsing 8 en 2 | oordeel |
| --- | --- | --- |
| voorstelling | tien vakjes waarvan acht gekleurd, een getallenlijn, munten of blokjes; de vraag blijft `8 + ? = 10` | jasje |
| ander deel verstopt | `2 + ? = 10` in plaats van `8 + ? = 10` | eigen zaadje: het antwoord verandert |
| omgekeerde gelijkheid | `10 = 8 + ?` | eigen doel, leerjaar 2: kinderen lezen `=` eerst als "hier komt het antwoord" |
| eerste term verstopt | `? + 8 = 10` | eigen zaadje: moeilijker dan een ontbrekende tweede term |
| zelf typen in plaats van kiezen | | jasje, en het staat al als apart hoofdstuk per spel |

### De mechaniek

Drie lagen, waarvan de eerste twee samen de vraag bepalen:

1. **zaadje**: het feit, inclusief wat verstopt is. `{ a: 8, b: 2, heel: 10, weg: 'b' }`
2. **jasje**: de voorstelling. `'som'`, `'vakjes'`, `'getallenlijn'`
3. **sleutel**: `'8+2=10:b'`, zonder het jasje

Een spel levert naast `zaadjes(soort, h)` nu ook de jasjes per soort:

```js
jasjes: (soort, h) => ['som', 'vakjes', 'getallenlijn']
```

Laat een spel `jasjes` weg, dan werkt het zoals vandaag: één jasje, `'standaard'`.

### Wijzigingen in het chassis

`bouwToets` en `maakVraag` staan vandaag op regel 2320 en 2331 van `oefenkampioen.html`.

- `bouwToets` schudt per soort een dek van zaadjes. Dat blijft. Er komt per soort een geschud dek
  van jasjes bij.
- `maakVraag` doet vandaag `state.decks[soort].pop()`. Is het dek leeg, dan geeft `pop()`
  `undefined`. Nieuw: is het dek leeg, dan wordt het opnieuw geschud en begint een volgende ronde,
  met de jasjes ook opnieuw geschud. Zo liggen twee verschijningen van hetzelfde zaadje zo ver
  mogelijk uit elkaar, en ziet een kind bij de tweede keer een andere voorstelling.
- Twee keer na elkaar hetzelfde jasje wordt vermeden, zodat een toets afwisselt.
- `maak(soort, z, h)` krijgt het jasje als vierde argument: `maak(soort, z, h, jasje)`.

### Voorraad, eerlijk gerekend

Splitsingen van 10 zonder nul zijn er vijf. Dat geeft negen verschillende vragen, want 5 + 5
levert er maar één. Met drie voorstellingen zijn dat zevenentwintig verschijningen: genoeg voor
een toets van 20 zonder dat een kind twee keer dezelfde zin ziet. Twee keer hetzelfde antwoord
ziet het wel, en dat is precies wat oefenen is.

De marge is klein, dus het vangnet in `maakVraag` doet echt werk en moet correct zijn.

## 6. Doelen als data

**Uitgesteld, zie sectie 10.** `doelen.js` is niet gebouwd; stap 1 gebruikte de doelenlijsten in
sectie 9 zelf als checklist. Dit blijft staan als het ontwerp voor wanneer een geautomatiseerde
dekkingscheck de moeite wordt.

`doelen.js` bevat de leerplandoelen per leerjaar, als korte handvatten:

```js
export const DOELEN = {
  1: ['getalbegrip tot 20', 'doortellen en terugtellen', 'splitsen tot 10', ...],
  2: [...], 3: [...], 4: [...], 5: [...], 6: [...]
};
```

Elk hoofdstuk noemt in `doelen: [...]` welke doelen het dekt. De zelfcheck controleert twee
richtingen:

- elk doel dat een hoofdstuk noemt, bestaat in `DOELEN` bij dat leerjaar
- elk doel in `DOELEN` wordt door minstens één hoofdstuk gedekt

De tweede is de belangrijke: die maakt het onmogelijk dat een leerjaar stil half gevuld blijft.
Ontbreekt er iets, dan meldt de zelfcheck per leerjaar welke doelen nog geen hoofdstuk hebben.
Zolang een leerjaar nog niet gebouwd is, is dat een verwachte melding, geen fout: de check meldt
ontbrekende dekking apart van de fouten, zodat de teller op nul kan blijven.

## 7. Zelfcheck

Blijft op `#test`. Bij stap 1 gebouwd, op vier van de vijf oorspronkelijk geplande controles na
`doelen` (uitgesteld, zie sectie 6):

1. `leerjaar` is een geheel getal van 1 tot 6
2. elke soort heeft minstens één jasje, en jasjes zijn onderling verschillend
3. een jasje verandert het antwoord van een zaadje niet: voor elk zaadje wordt elke jasje
   gemaakt en `v.ans` vergeleken
4. de voorraad zaadjes is nooit nul

Daarbovenop, gevonden tijdens het bouwen van leerjaar 1, niet in het oorspronkelijke ontwerp: ook
`scherm(v)` wordt op `undefined` gecontroleerd. Die stond niet in de lijst van acht verplichte
velden en werd nergens getest, tot een vergeten geval de tekst "undefined undefined = ?
undefined" toonde. Zie sectie 12 voor de rest van wat er onderweg misging.

Controle 4 is het mechanische slot op de regel uit sectie 5. Daarmee kan die fout niet stil
terugkomen.

De bestaande controle `zaadjes(k, h).length >= verdeling[k]` verdwijnt, want herhaling is nu
toegestaan. In de plaats komt: `zaadjes(k, h).length >= 1`.

De dubbelcheck blijft op `v.sleutel` en negeert dus het jasje. Binnen één ronde mag een sleutel
niet twee keer voorkomen; over rondes heen mag dat wel.

## 8. De 47 bestaande hoofdstukken, met hun leerjaar

Dit is de volledige tagging voor stap 0. Geen enkel hoofdstuk verandert van inhoud.

| spel | hoofdstuk | leerjaar |
| --- | --- | --- |
| Klokkijken | Hele en halve uren | 1 |
| | Kwartieren | 2 |
| | Van vijf tot vijf | 2 |
| | Dag en nacht | 2 |
| | Digitale klok | 3 |
| | Tijd berekenen | 3 |
| | Het grote examen | 3 |
| Maaltafels | Tafels van 2, 5 en 10 | 2 |
| | Tafels van 3 en 4 | 2 |
| | Het gat in de kleine tafels | 2 |
| | Delen door de kleine tafels | 2 |
| | Het kleine monsterexamen | 2 |
| | Tafels van 6, 7, 8 en 9 | 3 |
| | Het gat in alle tafels | 3 |
| | Delen door alle tafels | 3 |
| | Monsterjacht | 3 |
| | Het grote monsterexamen | 3 |
| Het winkeltje | Centen tellen | 1 |
| | Euro's en biljetten | 2 |
| | Alles door elkaar | 2 |
| | Welke munt ontbreekt | 2 |
| | Wisselgeld | 3 |
| | Aan de kassa | 3 |
| | Het grote winkelexamen | 3 |
| Meten en wegen | Lezen op de liniaal | 2 |
| | Meter en centimeter | 2 |
| | Welke maat past? | 2 |
| | Kilo en gram | 3 |
| | Liter en deciliter | 3 |
| | Zelf omrekenen | 3 |
| | Het grote meetexamen | 3 |
| De kalender | De dagen van de week | 1 |
| | De maanden van het jaar | 2 |
| | De vier seizoenen | 2 |
| | Hoeveel dagen? | 3 |
| | Verder tellen | 3 |
| | Zelf de datum typen | 3 |
| | Het grote kalenderexamen | 3 |
| Bruggen bouwen | Tot 100 erbij | 2 |
| | Tot 100 eraf | 2 |
| | Tot 1000 erbij | 3 |
| | Tot 1000 eraf | 3 |
| | Wat ontbreekt er? | 3 |
| | Zelf uitrekenen | 3 |
| | Het grote rekenexamen | 3 |
| Spiegelen | Spiegelen naar rechts | 2 |
| | Spiegelen naar onder | 2 |
| | Hoeveel vakjes? | 2 |
| | Klopt de spiegeling? | 3 |
| | Het grote spiegelexamen | 3 |

Leerjaar 1 heeft na stap 0a drie hoofdstukken, leerjaar 2 eenentwintig, leerjaar 3 zesentwintig.
(Maaltafels liep hierop al vooruit: de drie hoofdstukken voor de kleine tafels in leerjaar 2 zijn
al gebouwd, zie sectie 9.)
Dat leerjaar 1 zo dun is, is precies waarom het als eerste wordt aangevuld.

## 9. Inhoud per leerjaar

Nieuwe hoofdstukken per leerjaar, met het spel waar ze in komen.

### Leerjaar 1 — gebouwd (stap 1)

| doel | spel |
| --- | --- |
| **gebouwd:** splitsen tot 10, met een tienraam | rekenen |
| **gebouwd:** erbij en eraf tot 10, en tot 20 zonder brug | rekenen |
| **gebouwd:** erbij en eraf tot 20, met de brug over het tiental | rekenen |
| **gebouwd:** doortellen, terugtellen en rangtelwoorden | rekenen |
| **gebouwd:** een munt of biljet herkennen | winkel |
| **gebouwd:** vergelijken zonder eenheden: langer, korter, zwaarder, lichter, meer, minder | maten |
| **gebouwd:** vlakke vormen herkennen | spiegelen |
| **gebouwd:** links, rechts, boven, onder | spiegelen |
| **gebouwd:** voorbereidend sprongen tellen van 2, 5 en 10, nog geen tafel | maaltafels |

De brug tot 20 bleek bij nader nazicht vaste leerstof van het eerste leerjaar in Vlaanderen, niet
een opwarmertje voor het tweede zoals eerst aangenomen: dat is verwerkt door de bestaande
brugmachine (`sprong`/`lijn`, al gebruikt voor Tot 100 en Tot 1000) ook voor `h.tot = 20` te laten
werken, in plaats van er een tweede mechanisme naast te zetten. Maaltafels blijft zonder enige
tafel: het officiële leerplan houdt het eerste leerjaar bij optellen en aftrekken tot 20, de
tafels starten pas in het tweede.

### Leerjaar 2 — gebouwd (stap 2), op één punt na

| doel | spel |
| --- | --- |
| **gebouwd:** getalbegrip tot 100, tientallen en eenheden | rekenen |
| **gebouwd:** verdubbelen en halveren | rekenen |
| **gebouwd:** even en oneven | rekenen |
| **gebouwd:** het gelijkheidsteken in beide richtingen | rekenen |
| **gebouwd:** tafels 1, 2, 3, 4, 5, 10 met de ontbrekende factor en delen | maaltafels |
| **liter, nog niet gebouwd** | maten |

Vijf spellen hadden na deze doelen drie of meer hoofdstukken op leerjaar 2 staan zonder een
eigen examen: Klokkijken, Het winkeltje, Meten en wegen, Bruggen bouwen en Spiegelen. Elk kreeg
er een, mixend wat er al stond; Maaltafels had dat examen al uit stap 1.

**Liter blijft open.** De bestaande `DINGEN`-lijst in `maten.js` leent zich niet goed voor een
leerjaar-2 "hoeveel liter, ruwweg" vraag: de inhoudsvoorwerpen zijn milliliters (een lepel
siroop, een glas melk) of duizenden liters (een zwembad), niets in het bereik van 1 tot 10 liter
waar een kind van zeven een gevoel bij kan vormen. Dat vraagt een eigen, kleine set voorwerpen,
niet een uitbreiding van de bestaande. Op te nemen bij een volgende stap, niet stilzwijgend
weggelaten.

### Leerjaar 3 — gebouwd (stap 3), inclusief de liter uit stap 2

| doel | spel |
| --- | --- |
| **gebouwd:** tafels 6, 7, 8, 9 met de ontbrekende factor en delen; alle tafels 1 tot 10 door elkaar | maaltafels |
| **gebouwd:** breuken als deel van een geheel: 1/2, 1/3, 2/3, 1/4, 3/4 | breuken (nieuw spel) |
| **gebouwd:** breuken vergelijken met een tekening | breuken |
| **gebouwd:** omtrek van vierkant en rechthoek | meetkunde (nieuw spel) |
| **gebouwd, ingehaald uit stap 2:** liter aflezen op een maatbeker | maten |

Breuken en Meetkunde zijn nieuwe spelmodules, precies zoals sectie 3 voorzag. Beide hebben nu
twee respectievelijk één hoofdstuk, allebei onder de drempel van drie voor een eigen examen; dat
komt vanzelf zodra leerjaar 4 en 5 er hoofdstukken aan toevoegen.

Doel `2.2.17` (minimumdoelen, ijkpunt einde vierde leerjaar): *de leerlingen kennen paraat de
vermenigvuldigings- en deeltafels van 1, 2, ..., 10.* Geen tafels van 11 of 12: die staan bij
sommige methodes als extra, maar horen niet bij het minimumdoel, en Oefenkampioen bouwt ze dus
niet. Met de tafels klaar tegen het einde van leerjaar 3 haalt het spel dit doel een jaar
vroeger dan het ijkpunt vraagt, wat toegelaten is: een minimumdoel is een "ten laatste", geen
"ten vroegste".

### Leerjaar 4

| doel | spel |
| --- | --- |
| getalbegrip tot 10 000 | rekenen |
| cijferend optellen en aftrekken | rekenen |
| cijferend vermenigvuldigen met één cijfer | rekenen |
| cijferend delen door één cijfer | rekenen |
| gelijkwaardige breuken | breuken |
| breuken optellen en aftrekken met gelijke noemer | breuken |
| breuk van een getal | breuken |
| kommagetallen: tienden en honderdsten | breuken |
| afronden | breuken |
| oppervlakte van vierkant en rechthoek, cm² en m² | meetkunde |
| hoeken herkennen: recht, scherp, stomp | meetkunde |
| seconden, tijdsduur over het uur, 24-uurnotatie | klok |

### Leerjaar 5

| doel | spel |
| --- | --- |
| getalbegrip tot een miljoen | rekenen |
| cijferend delen door twee cijfers | rekenen |
| breuken optellen en aftrekken met ongelijke noemer | breuken |
| breuk maal getal | breuken |
| breuk naar kommagetal | breuken |
| procent: 10, 25, 50 en procent van een getal | verhoudingen |
| verhoudingen en schaal | verhoudingen |
| volume en inhoud, m³ en omzettingen | meetkunde |
| oppervlakte van een driehoek | meetkunde |
| negatieve getallen bij temperatuur | rekenen |

### Leerjaar 6

| doel | spel |
| --- | --- |
| btw, korting en intrest | verhoudingen |
| verhoudingstabel | verhoudingen |
| snelheid in km per uur | verhoudingen |
| gemiddelde | verhoudingen |
| staafdiagram en lijndiagram lezen | verhoudingen |
| ruimtefiguren en hun eigenschappen | meetkunde |
| hoeken meten | meetkunde |
| alle omzettingen van maten door elkaar | maten |
| grote getallen en machten van tien | rekenen |

Samen ongeveer vijftig nieuwe hoofdstukken bovenop de zevenenveertig die er staan.

## 10. Bouwvolgorde en acceptatie per stap

| stap | wat | status |
| --- | --- | --- |
| 0a | `leerjaar` op de 47 bestaande hoofdstukken, de keuzerij op het startscherm, cumulatief filteren, sortering van de spelkaarten. Nog in het ene bestand. | **gebouwd** |
| 0b | opsplitsen in modules, jasjes in het chassis | **gebouwd** |
| 1 | leerjaar 1 volledig | **gebouwd**: 15 hoofdstukken, 930 toetsen, nul fouten |
| 2 | leerjaar 2, op de liter na (zie sectie 9) | **gebouwd**: 30 hoofdstukken, 1065 toetsen, nul fouten |
| 3 | leerjaar 3, plus de liter uit stap 2 | **gebouwd**: 77 hoofdstukken, 1155 toetsen, nul fouten |
| 4 | leerjaar 4 | nog te doen |
| 5 | leerjaar 5 | nog te doen |
| 6 | leerjaar 6 | nog te doen |

`doelen.js` en het `doelen`-veld per hoofdstuk, oorspronkelijk bij 0b gepland, zijn niet gebouwd.
De vervanging: de doelenlijsten uit sectie 9 van dit document zelf zijn de checklist geweest voor
stap 1, hoofdstuk per hoofdstuk afgevinkt. Dat werkt zolang één persoon bouwt en leest; een
geautomatiseerde dekkingscheck wordt pas de moeite waard als er meerdere mensen tegelijk aan
leerjaren werken, of als het uit het oog verliezen van een doel al eens gebeurd is. Tot dan is
het bewust weggelaten, niet vergeten.

Stap 0a en 0b zijn de enige stappen die bestaande code aanraken, en ze veranderen bewust geen
enkel hoofdstuk van inhoud.

Elke stap krijgt zijn eigen commits en wordt afzonderlijk getest.

Wat stap 1 werkelijk kostte: twee curriculumcorrecties onderweg (de brug tot 20 is vaste leerstof
van het eerste leerjaar, geen tafels in het eerste leerjaar) en drie echte fouten die de zelfcheck
ving of had moeten vangen: een vergeten `andere`-import, een `scherm()` die letterlijk
"undefined" toonde (zie sectie 7, de check die dat nu vangt), en een eerdere fix die verloren ging
omdat een bewerkingsscript halverwege faalde voor het kon schrijven. Reken voor stap 2 tot 6 op
een halve tot hele dag per leerjaar, met dezelfde soort correcties onderweg als vaste kost, niet
als uitzondering.

Stap 2 kostte minder correctiewerk: één echte fout (het is-gelijk-teken achterstevoren had geen
vangnet voor kleine getallen zoals 1 + 1, waar te weinig foute keuzes overbleven na het
weghalen van dubbels), gevangen door precies de "vier keuzes"-controle die al bestond. Geen
curriculumcorrecties deze keer, wel één bewuste omissie: de liter (zie sectie 9).

Stap 3 bouwde de liter alsnog en twee nieuwe spelmodules (Breuken, Meetkunde). Twee fouten
kwamen weer terug in dezelfde vorm als eerder: een script dat halverwege faalde en een eerder
geslaagde stap meesleurde in het verlies (twee keer, telkens een vergeten hoofdstuk-regel), en
een `scherm()` zonder `null`-branch voor een nieuwe soort, gevangen door de controle uit stap 1.
Daarnaast één echte curriculumfout die niets met code te maken had: het bestaande hoofdstuk
"Centen tellen" in leerjaar 1 kon 50 + 50 + 50 + 50 optellen, ver boven de bevestigde grens van
optellen tot 20. Vervangen door twee hoofdstukken die wél bij het echte leerplan passen: samen
betalen met hele euro's, en gepast betalen zonder wisselgeld. Die fout was er al sinds stap 0a en
is nooit opgemerkt tot de gebruiker er zelf naar vroeg: een teken dat de leerjaartoekenning van
de 47 oorspronkelijke hoofdstukken in sectie 8 een aanname blijft, niet een bevestigd feit, tot
iemand ze een voor een naleest.

## 11. Buiten scope

- **Geen profielen per kind.** Eén naam, één set beste scores, zoals vandaag.
- **Geen voortgangsrapport voor ouders.** De dekkingsmelding in de console volstaat voorlopig.
- **Geen vraagstukken.** Er staat vandaag geen enkel vraagstukje in Oefenkampioen, terwijl
  "problemen oplossen" in het leerplan door alle zes leerjaren loopt. Dat is een echte leemte en
  een eigen blok waard, maar het verandert de omvang van dit ontwerp en valt er dus buiten. Op te
  nemen als aparte beslissing na stap 1.
- **Geen aanpassing van het huidige derde leerjaar.** Dat wordt enkel gelabeld.

## 12. Risico's

| risico | omvang | wat we eraan doen |
| --- | --- | --- |
| de dubbelklik verdwijnt door ES-modules | een ouder kan het bestand niet meer lokaal openen | publiceren via GitHub Pages, dan is het een link die overal werkt |
| stap 0a of 0b verschuift stil iets in een bestaand spel | het derde leerjaar gaat achteruit | de zelfcheck moet op exact 705 toetsen en nul fouten blijven |
| een jasje blijkt toch moeilijker dan het doel | een kind krijgt een vraag boven zijn niveau | controle 4 van de zelfcheck vergelijkt het antwoord over alle jasjes |
| te weinig zaadjes in de kleinste hoofdstukken | herhaling wordt zichtbaar | rondes met opnieuw geschudde jasjes; de voorraad per hoofdstuk staat in het plan van elke stap |
| de zelfcheck wordt te traag om nog te draaien | de controle wordt overgeslagen | bij 705 toetsen is hij vrijwel instant; blijkt 2500 te traag, dan krijgt hij een filter per leerjaar (`#test=3`) |
| tijdens lokaal testen blijft de browser een oud bestand cachen | een fix lijkt niet aan te slaan, tijdverlies bij het uitsluiten van echte bugs | de dev-server op poort 8766 stuurt `Cache-Control: no-store`; gebruik die in plaats van 8765 |
| een bewerkingsscript faalt halverwege, na een eerdere geslaagde stap in dat script | die eerdere stap gaat mee verloren, want er wordt pas op het einde geschreven | elke wijziging in één stap per schrijfactie, of controleer met `git diff` voor het volgende script start |
