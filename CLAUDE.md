# Oefenkampioen

Gratis oefenspellen wiskunde voor de lagere school in Vlaanderen (leerjaar 1 tot 6), als webapp en PWA. Geen build, geen dependencies, geen framework.

> Basisregels: `~/Documents/GitHub/CLAUDE.md`. Hieronder alleen wat specifiek is voor dit project.

## Eerst dit, elke sessie

1. `git pull` (werk- en thuiscomputer)
2. README.md lezen: daar staat hoe elk scherm werkt en waarom.

## Draaien, testen, bouwen

- Starten: `python3 -m http.server 8000` in deze map (of preview `oefenkampioen` uit `.claude/launch.json`), dan `http://localhost:8000`.
- Testen in Node: `node --import ./test/pre.mjs test/alles.mjs` (rekent elke vraag van elk spel na).

## Testflow (na elke wijziging aan schermen, knoppen of opslag)

1. Node-tests: `node --import ./test/pre.mjs test/alles.mjs`, moet eindigen op "geen fouten".
2. Lokale server starten, pagina herladen zonder cache (anders draait de oude versie).
3. Zelfcheck: open `/#test`, console moet "Zelfcheck klaar: ... geen fouten" tonen.
4. UI-test, op 320×568, 375×812, 768×1024 en laptopbreedte:
   `(await import('/test/ui-test.js')).alles()`
   - duurt ongeveer een minuut; niet klikken in de pagina terwijl hij loopt
   - hidden browserpane = trage timers: start hem zonder `await` en lees daarna `localStorage.getItem('uitest-uitslag')`
   - zet eerst alle data opzij en daarna terug; stopte hij halverwege, dan staat de data nog in `uitest-backup` en zet de volgende run ze terug
   - `fouten` moet leeg zijn; `opmerkingen` (raakvlak < 40px, contrast) nakijken en melden
   - in de ingebouwde browser van Claude: een emulatie groter dan het venster (768×1024, laptop) wordt teruggezet en herlaadt de pagina midden in de test. Draai die formaten in een iframe van exact die maat:
     ```js
     const f = document.createElement('iframe');
     f.style.cssText = 'position:fixed;left:0;top:0;width:768px;height:1024px;border:0;z-index:99';
     f.src = '/?tablet=' + Date.now(); document.body.appendChild(f);
     await new Promise(r => f.onload = r);
     f.contentWindow.eval("import('/test/ui-test.js').then(m => m.alles())");
     ```
5. Layoutmeting: `(await import('/test/layout-meting.js')).meet()` op 375×812 en 320×568, `ok: true`.
6. Zelf kijken: elk gewijzigd scherm in light en dark, screenshot als bewijs.
7. Pas daarna committen.

Vindt een test een fout: eerst nagaan of het de app of de test is (bv. namen bevatten enkel letters, het eerste kind krijgt de naamloze sleutel `''`). Een testfout in de test zelf herstellen, nooit de check afzwakken.

## Structuur

- `index.html`: alle markup en CSS (tokens bovenaan in `:root`, dark onder `prefers-color-scheme`).
- `chassis.js`: schermen, profielen, opslag, spelverloop.
- `spellen/`: één bestand per spel; `beloning.js`, `bewaren.js`, `gereedschap.js`: gedeelde logica.
- `sw.js` + `manifest.webmanifest`: PWA (network first, cache als offline-reserve).
- `test/`: Node-tests (`*.test.mjs`) en browsertests (`ui-test.js`, `layout-meting.js`).

## Conventies

- UI-teksten in Vlaams Nederlands, code-comments in het Engels.
- Spacing op een 8px-raster (4px voor fijne stappen); knoppen en invoervelden minstens 40px hoog.
- Knoppen: `.big-btn` (grote kind-actie), `.knop` (secundair, omlijnd), `.knop.primair` (gevuld oranje, max één per groep), `.knop.gevaar` / `.gevaar.vol` (verwijderen). `.aantal` is een keuzepil (aria-pressed), geen actie.
- Geen emoji op nieuwe knoppen of labels tenzij het iets toevoegt; spel-iconen en stickers wel.
- Geen vette tekst.
- Elk scherm in light én dark.

## Git en release

- Rechtstreeks op `main`, GitHub Pages publiceert automatisch. Nooit pushen zonder vraag.

## Niet aankomen, niet voorstellen

- "Vragen voorlezen" staat standaard uit, ook in het 1ste leerjaar (beslist 28-10-2026).
- Geen pincode of wachtwoord op profielen: kinderen, niets te beveiligen (28-10-2026).
- "Voor ouders" niet in het naammenu van het kind; het staat onderaan Instellingen en in de footer (28-10-2026).

## Valkuilen

- Een naam bevat enkel letters, spaties, `-` en `'`: cijfers verdwijnen ("Kind 1" wordt "Kind").
- Het eerste kind op een leeg toestel erft de naamloze sleutel `''` (oude data van voor profielen).
- Terugknop: `history.back()` landt pas later; `terugBezig` in `chassis.js` vangt een dubbele back op. Niet weghalen.
- iPad/iPhone: de app op het beginscherm heeft een eigen opslag, los van Safari.
