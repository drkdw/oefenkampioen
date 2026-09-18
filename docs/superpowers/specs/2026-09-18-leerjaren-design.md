# Oefenkampioen voor het hele lager onderwijs

Ontwerp, 18 september 2026.

## 1. Doel

Oefenkampioen dekt vandaag het derde leerjaar. Dit ontwerp brengt het naar het volledige
lager onderwijs, leerjaar 1 tot en met 6, volgens de doelen van het Vlaamse leerplan wiskunde.

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
- De spelkaarten met hoofdstukken voor het gekozen jaar komen bovenaan; de rest zakt eronder,
  blijft aantikbaar, en krijgt de regel *nog niets voor het 1ste leerjaar, wel leerjaar 2 tot 3*.
- Op elke kaart komt één regel bij die zegt welke leerjaren dat spel dekt, bijvoorbeeld
  *leerjaar 1 tot 4*, afgeleid uit de hoofdstukken.
- Binnen een spel worden de hoofdstukken gegroepeerd in een `<details>` per leerjaar, met
  `<summary>` "1ste leerjaar" tot "6de leerjaar". Native HTML: open en toe zonder JavaScript,
  werkt met het toetsenbord en met een schermlezer, en er is geen toestand die stuk kan gaan.
- Leerjaren zonder hoofdstukken voor dat spel worden niet getoond.
- Binnen een spel staat één vlakke lijst met alle hoofdstukken tot en met het gekozen leerjaar.
  **Geen tweede leerjaarkeuze in het spel**: het niveau is al gekozen op het startscherm.
- De hoofdstukken worden genummerd vanaf 1. De opslagsleutel blijft de index in `hoofdstukken`,
  dus bestaande beste scores blijven geldig.
- Heeft een spel niets voor het gekozen jaar, dan staat er één regel in de plaats: kies bovenaan
  een ander leerjaar, of een ander spel.
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

Blijft op `#test`, en groeit van 705 naar ongeveer 2500 toetsen. Vijf controles komen erbij:

1. `leerjaar` is een geheel getal van 1 tot 6
2. elk doel dat een hoofdstuk noemt, bestaat in `DOELEN`
3. elke soort heeft minstens één jasje, en jasjes zijn onderling verschillend
4. een jasje verandert het antwoord van een zaadje niet: voor elk zaadje wordt elke jasje
   gemaakt en `v.ans` vergeleken
5. de voorraad zaadjes is nooit nul

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
| | Tafels van 6, 7, 8 en 9 | 3 |
| | Het gat in het monster | 3 |
| | Delen | 3 |
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

Leerjaar 1 heeft na stap 0a dus drie hoofdstukken, leerjaar 2 achttien, leerjaar 3 zesentwintig.
Dat leerjaar 1 zo dun is, is precies waarom het als eerste wordt aangevuld.

## 9. Inhoud per leerjaar

Nieuwe hoofdstukken per leerjaar, met het spel waar ze in komen.

### Leerjaar 1

| doel | spel |
| --- | --- |
| getalbegrip tot 20, doortellen en terugtellen | rekenen |
| splitsen tot 10 | rekenen |
| erbij en eraf tot 10 | rekenen |
| erbij en eraf tot 20 zonder brug | rekenen |
| rangtelwoorden | rekenen |
| munten en biljetten herkennen | winkel (bestaat deels) |
| vergelijken zonder eenheden: langer, korter, zwaarder, lichter | maten |
| vlakke vormen herkennen | spiegelen |
| links, rechts, boven, onder | spiegelen |

### Leerjaar 2

| doel | spel |
| --- | --- |
| getalbegrip tot 100 | rekenen |
| verdubbelen en halveren | rekenen |
| even en oneven | rekenen |
| het gelijkheidsteken in beide richtingen | rekenen |
| tafels van 2 en 5 los van elkaar | maaltafels |
| delen als omgekeerde van keer | maaltafels |
| liter | maten |

### Leerjaar 3

| doel | spel |
| --- | --- |
| breuken als deel van een geheel: 1/2, 1/3, 1/4 | breuken |
| breuken vergelijken met een tekening | breuken |
| omtrek van vierkant en rechthoek | meetkunde |

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

| stap | wat | acceptatiecriterium |
| --- | --- | --- |
| 0a | `leerjaar` op de 47 bestaande hoofdstukken, de keuzerij op het startscherm, cumulatief filteren, sortering van de spelkaarten. Nog in het ene bestand. | de zelfcheck rekent exact 705 toetsen door met nul fouten, en logt de verdeling 3 / 18 / 26 |
| 0b | opsplitsen in modules, jasjes in het chassis, `doelen` op elk hoofdstuk, `doelen.js` met alle zes leerjaren | nul fouten, en de zelfcheck meldt de ontbrekende dekking per leerjaar |
| 1 | leerjaar 1 volledig, met een eigen examen per spel dat er drie of meer hoofdstukken heeft | nul fouten, en geen ontbrekende doelen meer voor leerjaar 1 |
| 2 | leerjaar 2 volledig | nul fouten, geen ontbrekende doelen voor leerjaar 2 |
| 3 | leerjaar 3 afwerken | nul fouten, geen ontbrekende doelen voor leerjaar 3 |
| 4 | leerjaar 4 | nul fouten, geen ontbrekende doelen voor leerjaar 4 |
| 5 | leerjaar 5 | nul fouten, geen ontbrekende doelen voor leerjaar 5 |
| 6 | leerjaar 6 | nul fouten, geen ontbrekende doelen voor leerjaar 6 |

Stap 0a en 0b zijn de enige stappen die bestaande code aanraken, en ze veranderen bewust geen
enkel hoofdstuk van inhoud. Dat de zelfcheck daarna nog exact 705 toetsen doorrekent, en niet 704
of 706, is het bewijs dat er geen hoofdstuk verschoven, verdwenen of bijgekomen is.

0a gaat voor 0b omdat 0a het enige zichtbare deel is: je kan er meteen in klikken en zien of de
indeling klopt, voordat er onzichtbaar werk in gaat.

Elke stap krijgt zijn eigen implementatieplan, wordt afzonderlijk getest en afzonderlijk gecommit.

Inschatting: stap 0a, 0b en 1 samen ongeveer een dag. Stap 2 tot 6 elk een halve tot hele dag,
afhankelijk van het tekenwerk. Oppervlakte, volume en diagrammen zijn het meeste werk.

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
