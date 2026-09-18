import { shuffle, keuzes, vulAan, positief } from '../gereedschap.js';

  var N = 6;            // het rooster is zes bij zes
  var CEL = 26;

  /* een vorm is een lijst van [rij, kolom] */
  function sleutelVan(vorm) {
    return vorm.map(function (c) { return c[0] + ',' + c[1]; }).sort().join(' ');
  }
  function spiegelH(vorm) {   // over een verticale as: links en rechts wisselen
    return vorm.map(function (c) { return [c[0], N - 1 - c[1]]; });
  }
  function spiegelV(vorm) {   // over een horizontale as: boven en onder wisselen
    return vorm.map(function (c) { return [N - 1 - c[0], c[1]]; });
  }
  function draai(vorm) {      // een halve slag: de klassieke verwarring met spiegelen
    return vorm.map(function (c) { return [N - 1 - c[0], N - 1 - c[1]]; });
  }
  function schuif(vorm) {     // gewoon opzij geschoven, niet gespiegeld
    return vorm.map(function (c) { return [c[0], (c[1] + 1) % N]; });
  }
  function gelijk(a, b) { return sleutelVan(a) === sleutelVan(b); }

  /* de vormen: telkens een halve figuur in de linkerhelft van het rooster */
  var VORMEN = [
    [[0, 1], [1, 1], [1, 2], [2, 0], [2, 1], [3, 1], [4, 0], [4, 2]],
    [[0, 0], [1, 1], [2, 1], [2, 2], [3, 0], [3, 1], [4, 1]],
    [[1, 2], [2, 1], [2, 2], [3, 0], [3, 2], [4, 1], [5, 1]],
    [[0, 2], [1, 1], [1, 2], [2, 0], [2, 2], [3, 1], [4, 2], [5, 0]],
    [[0, 0], [0, 2], [1, 1], [2, 0], [2, 1], [2, 2], [3, 1], [4, 0]],
    [[1, 0], [1, 1], [2, 2], [3, 1], [3, 2], [4, 0], [4, 1]],
    [[0, 1], [1, 0], [1, 2], [2, 1], [3, 0], [3, 1], [4, 2], [5, 1]],
    [[0, 2], [1, 2], [2, 0], [2, 1], [2, 2], [3, 2], [4, 1], [5, 2]],
    [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [3, 2], [4, 2]],
    [[1, 1], [2, 0], [2, 1], [2, 2], [3, 1], [4, 0], [4, 2], [5, 1]],
    [[0, 1], [0, 2], [1, 0], [2, 1], [3, 2], [4, 1], [4, 2]],
    [[0, 0], [1, 2], [2, 0], [2, 2], [3, 1], [3, 2], [4, 0], [5, 1]],
    [[1, 0], [1, 2], [2, 1], [3, 0], [4, 1], [4, 2], [5, 2]],
    [[0, 2], [1, 0], [1, 1], [2, 2], [3, 0], [4, 1], [5, 0], [5, 2]],
    [[0, 1], [1, 1], [2, 0], [2, 2], [3, 1], [3, 2], [4, 0]],
    [[0, 0], [0, 1], [1, 2], [2, 0], [3, 1], [3, 2], [4, 2], [5, 0]],
    [[1, 1], [1, 2], [2, 0], [3, 2], [4, 0], [4, 1], [5, 1]],
    [[0, 2], [1, 1], [2, 0], [2, 2], [3, 0], [4, 2], [5, 1], [5, 2]],
    [[0, 0], [1, 1], [1, 2], [2, 2], [3, 0], [3, 1], [4, 2], [5, 0]],
    [[0, 1], [1, 0], [2, 0], [2, 1], [3, 2], [4, 0], [4, 1], [5, 2]]
  ];
  var KLEUREN = ['#FF7A45', '#7C5CFF', '#12A06B', '#FF5D8F', '#35B8E0', '#9B5DE5'];

  /* een rooster tekenen, met of zonder spiegelas */
  function rooster(vakjes, kleur, as, breed) {
    var maat = breed || N * CEL;
    var schaal = maat / (N * CEL);
    var p = [];
    for (var r = 0; r < N; r++) {
      for (var k = 0; k < N; k++) {
        p.push('<rect x="' + (k * CEL) + '" y="' + (r * CEL) + '" width="' + CEL + '" height="' + CEL +
          '" fill="var(--card-2)" stroke="var(--line)" stroke-width="1"/>');
      }
    }
    vakjes.forEach(function (c) {
      p.push('<rect x="' + (c[1] * CEL + 2) + '" y="' + (c[0] * CEL + 2) + '" width="' + (CEL - 4) +
        '" height="' + (CEL - 4) + '" rx="5" fill="' + kleur + '"/>');
    });
    if (as === 'verticaal') {
      p.push('<line x1="' + (N / 2 * CEL) + '" y1="0" x2="' + (N / 2 * CEL) + '" y2="' + (N * CEL) +
        '" stroke="var(--accent)" stroke-width="3" stroke-dasharray="6 5"/>');
    }
    if (as === 'horizontaal') {
      p.push('<line x1="0" y1="' + (N / 2 * CEL) + '" x2="' + (N * CEL) + '" y2="' + (N / 2 * CEL) +
        '" stroke="var(--accent)" stroke-width="3" stroke-dasharray="6 5"/>');
    }
    return '<svg viewBox="0 0 ' + (N * CEL) + ' ' + (N * CEL) + '" width="' + maat + '" height="' + maat +
      '" role="img" aria-label="Een rooster van zes bij zes met ' + vakjes.length + ' gekleurde vakjes">' +
      p.join('') + '</svg>';
  }

export default {
  id: 'spiegel',
  ico: '\uD83E\uDD8B',
  naam: 'Spiegelen',
  tekst: 'Spiegelen, symmetrie en de helft die ontbreekt.',
  top: 'Jij ziet elke spiegeling meteen!',
  hoofdstukken: [
    { leerjaar: 2, ico: '\uD83E\uDE9E', titel: 'Spiegelen naar rechts', tekst: 'Welke helft hoort er aan de andere kant?',
      badge: 'gemiddeld', as: 'verticaal', plan: { helft: 10 } },
    { leerjaar: 2, ico: '\u2195\uFE0F', titel: 'Spiegelen naar onder', tekst: 'Dezelfde vraag, maar de as ligt plat.',
      badge: 'gemiddeld', as: 'horizontaal', plan: { helft: 10 } },
    { leerjaar: 3, ico: '\u2705', titel: 'Klopt de spiegeling?', tekst: 'Is dit echt gespiegeld, of gedraaid?',
      badge: 'moeilijk', as: 'verticaal', plan: { klopt: 10 } },
    { leerjaar: 2, ico: '\uD83D\uDD22', titel: 'Hoeveel vakjes?', tekst: 'Hoeveel vakjes kleur je in de hele figuur?',
      badge: 'makkelijk', as: 'verticaal', plan: { tellen: 10 } },
    { leerjaar: 3, ico: '\uD83C\uDFC6', titel: 'Het grote spiegelexamen', tekst: 'Alles door elkaar.',
      badge: 'moeilijk', as: 'verticaal', plan: { helft: 5, klopt: 3, tellen: 2 } }
  ],
  zaadjes: function (soort, h) {
    var uit = [];
    VORMEN.forEach(function (vorm, i) {
      if (soort === 'klopt') {
        // hier is de echte en de valse spiegeling elk een eigen vraag
        uit.push({ i: i, as: h.as, echt: true });
        uit.push({ i: i, as: h.as, echt: false });
      } else {
        uit.push({ i: i, as: h.as, echt: true });
      }
    });
    return uit;
  },
  maak: function (soort, z, h) {
    var vorm = VORMEN[z.i], as = h.as;
    var kleur = KLEUREN[z.i % KLEUREN.length];
    var juist = as === 'horizontaal' ? spiegelV(vorm) : spiegelH(vorm);
    var sl = soort + '|' + z.i + as + (z.echt ? 'e' : 'n');

    if (soort === 'tellen') {
      // de hele figuur is de helft plus de spiegeling: altijd het dubbele
      var totaal = vorm.length * 2;
      var fout = [];
      vulAan(fout, totaal, [vorm.length, totaal + 1, totaal - 1, totaal + 2], positief);
      return { soort: soort, sleutel: 'tellen|' + z.i, vorm: vorm, kleur: kleur, as: as, half: vorm.length,
        ans: String(totaal), options: keuzes(totaal, fout) };
    }
    if (soort === 'klopt') {
      // een halve slag draaien lijkt op spiegelen, maar is het niet
      var getoond = z.echt ? juist : (gelijk(draai(vorm), juist) ? schuif(vorm) : draai(vorm));
      var klopt = gelijk(getoond, juist);
      return { soort: soort, sleutel: sl, vorm: vorm, getoond: getoond, kleur: kleur, as: as,
        ans: klopt ? 'ja, gespiegeld' : 'nee, niet gespiegeld',
        options: shuffle([{ text: 'ja, gespiegeld', ok: klopt }, { text: 'nee, niet gespiegeld', ok: !klopt },
          { text: 'ja, maar de as ligt verkeerd', ok: false }, { text: 'nee, het is verschoven', ok: false }]) };
    }
    // helft: vier roosters als keuze, maar dat past niet in een knop, dus we kiezen op letter
    var kandidaten = [{ v: juist, ok: true, waarom: 'de echte spiegeling' },
      { v: draai(vorm), ok: false, waarom: 'een halve slag gedraaid' },
      { v: schuif(vorm), ok: false, waarom: 'gewoon opzij geschoven' },
      { v: as === 'horizontaal' ? spiegelH(vorm) : spiegelV(vorm), ok: false, waarom: 'over de verkeerde as gespiegeld' }];
    // dubbels weg: bij een symmetrische vorm valt een gedraaide soms samen met de spiegeling
    var gezien = {}, uniek = [];
    kandidaten.forEach(function (k) {
      var key = sleutelVan(k.v);
      if (gezien[key] && !k.ok) return;
      gezien[key] = 1;
      uniek.push(k);
    });
    while (uniek.length < 4) {
      var extra = schuif(uniek[uniek.length - 1].v);
      if (gezien[sleutelVan(extra)]) extra = spiegelV(extra);
      gezien[sleutelVan(extra)] = 1;
      uniek.push({ v: extra, ok: false, waarom: 'nog eens verschoven' });
    }
    var letters = ['A', 'B', 'C', 'D'];
    var keuzelijst = shuffle(uniek.slice(0, 4)).map(function (k, i) {
      return { text: letters[i], ok: k.ok, v: k.v, waarom: k.waarom };
    });
    var goed = keuzelijst.filter(function (k) { return k.ok; })[0];
    return { soort: 'helft', sleutel: sl + 'h', vorm: vorm, kleur: kleur, as: as, kandidaten: keuzelijst,
      ans: goed.text, options: keuzelijst.map(function (k) { return { text: k.text, ok: k.ok }; }) };
  },
  teken: function (v) {
    if (v.soort === 'tellen') return rooster(v.vorm, v.kleur, v.as, 156);
    if (v.soort === 'klopt') {
      return rooster(v.vorm, v.kleur, null, 130) + '<span class="pijl">\u27A1\uFE0F</span>' +
        rooster(v.getoond, v.kleur, null, 130);
    }
    // de vier kandidaten met hun letter eronder
    return '<div style="display:flex;flex-direction:column;gap:10px;align-items:center;width:100%">' +
      rooster(v.vorm, v.kleur, v.as, 140) +
      '<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center">' +
      v.kandidaten.map(function (k) {
        return '<div style="text-align:center;font-family:Fredoka,sans-serif">' +
          rooster(k.v, 'var(--ink-soft)', null, 96) +
          '<div style="font-size:15px">' + k.text + '</div></div>';
      }).join('') + '</div></div>';
  },
  scherm: function () { return null; },
  vraag: function (v, nr) {
    var kop = 'Vraag ' + nr + ': ';
    if (v.soort === 'tellen') {
      return { titel: kop + 'hoeveel vakjes kleur je in de hele figuur?',
        sub: 'De helft staat er. De andere helft is de spiegeling.' };
    }
    if (v.soort === 'klopt') {
      return { titel: kop + 'is de rechtse figuur de spiegeling van de linkse?',
        sub: 'Let op: gedraaid is niet hetzelfde als gespiegeld.' };
    }
    return { titel: kop + 'welke helft hoort aan de andere kant van de stippellijn?',
      sub: 'Kies de letter van het juiste rooster.' };
  },
  uitleg: function (v) {
    if (v.soort === 'tellen') {
      return 'De helft heeft ' + v.half + ' vakjes, en de spiegeling nog eens ' + v.half + ': samen ' + (v.half * 2) + '.';
    }
    if (v.soort === 'klopt') {
      return v.ans === 'ja, gespiegeld'
        ? 'Elk vakje staat even ver van de as, maar aan de andere kant.'
        : 'Bij spiegelen blijft boven ook boven. Hier klopt dat niet.';
    }
    var goed = v.kandidaten.filter(function (k) { return k.ok; })[0];
    return 'Rooster ' + goed.text + ' is ' + goed.waarom + ': elk vakje staat even ver van de stippellijn.';
  },
  kort: function (v) {
    if (v.soort === 'tellen') return 'Een halve vorm met ' + v.half + ' vakjes';
    if (v.soort === 'klopt') return 'Gespiegeld of niet?';
    return 'De spiegeling over de ' + v.as + 'e as';
  },
  test: function (check) {
    VORMEN.forEach(function (vorm, i) {
      check(vorm.length >= 6, 'vorm ' + i + ' heeft genoeg vakjes');
      vorm.forEach(function (c) {
        check(c[0] >= 0 && c[0] < N && c[1] >= 0 && c[1] < N, 'vorm ' + i + ' past in het rooster');
        check(c[1] < N / 2, 'vorm ' + i + ' blijft in de linkerhelft, anders overlapt de spiegeling');
      });
      // twee keer spiegelen brengt je terug bij het begin
      check(gelijk(spiegelH(spiegelH(vorm)), vorm), 'twee keer horizontaal spiegelen bij vorm ' + i);
      check(gelijk(spiegelV(spiegelV(vorm)), vorm), 'twee keer verticaal spiegelen bij vorm ' + i);
      check(gelijk(draai(draai(vorm)), vorm), 'twee halve slagen bij vorm ' + i);
      // spiegelen is niet hetzelfde als draaien of schuiven
      check(!gelijk(spiegelH(vorm), draai(vorm)), 'spiegelen verschilt van draaien bij vorm ' + i);
      check(!gelijk(spiegelH(vorm), schuif(vorm)), 'spiegelen verschilt van schuiven bij vorm ' + i);
      check(!gelijk(spiegelH(vorm), vorm), 'de spiegeling is niet de vorm zelf bij vorm ' + i);
      // elk vakje staat na spiegelen even ver van de as
      spiegelH(vorm).forEach(function (c, k) {
        check(c[0] === vorm[k][0], 'spiegelen over een verticale as laat de rij staan');
        check(c[1] + vorm[k][1] === N - 1, 'elk vakje staat even ver van de as');
      });
      check(rooster(vorm, '#000', 'verticaal', 140).indexOf('<svg') === 0, 'het rooster tekent bij vorm ' + i);
    });
    check(rooster(VORMEN[0], '#000', 'verticaal', 140).indexOf('stroke-dasharray') > -1, 'de spiegelas staat er als stippellijn');
    check(rooster(VORMEN[0], '#000', null, 140).indexOf('stroke-dasharray') === -1, 'zonder as geen stippellijn');
  }
};
