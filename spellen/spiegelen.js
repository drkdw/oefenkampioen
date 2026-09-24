import { shuffle, keuzes, vulAan, positief, andere } from '../gereedschap.js';

  var N = 6;            // the grid is six by six
  var CEL = 26;

  /* a shape is a list of [row, column] */
  function sleutelVan(vorm) {
    return vorm.map(function (c) { return c[0] + ',' + c[1]; }).sort().join(' ');
  }
  function spiegelH(vorm) {   // across a vertical axis: left and right swap
    return vorm.map(function (c) { return [c[0], N - 1 - c[1]]; });
  }
  function spiegelV(vorm) {   // across a horizontal axis: top and bottom swap
    return vorm.map(function (c) { return [N - 1 - c[0], c[1]]; });
  }
  function draai(vorm) {      // a half turn: the classic mix-up with mirroring
    return vorm.map(function (c) { return [N - 1 - c[0], N - 1 - c[1]]; });
  }
  function schuif(vorm) {     // simply shifted sideways, not mirrored
    return vorm.map(function (c) { return [c[0], (c[1] + 1) % N]; });
  }
  function gelijk(a, b) { return sleutelVan(a) === sleutelVan(b); }
  // for a flat axis the half has to lie in the top rows, so the shape is turned on its side:
  // row becomes column, and it no longer crosses the dashed line
  function naarBoven(vorm) { return vorm.map(function (c) { return [c[1], c[0]]; }); }
  // a half that is already symmetric in itself looks the same turned or mirrored, so it cannot
  // show the difference the "klopt" question asks about
  function zelfSymmetrisch(vorm) {
    var kol = vorm.map(function (c) { return c[1]; }), som = Math.min.apply(null, kol) + Math.max.apply(null, kol);
    return gelijk(vorm, vorm.map(function (c) { return [c[0], som - c[1]]; }));
  }

  /* the shapes: each one is half a figure in the left half of the grid */
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

  /* --------- year 1: shapes and directions, separate from the mirror grid --------- */

  var VORMNAMEN = ['cirkel', 'vierkant', 'driehoek', 'rechthoek', 'ovaal'];
  // a square is also a rectangle, so those two never stand together as choices
  function vormKeuzes(naam) {
    return VORMNAMEN.filter(function (n) { return !(naam === 'vierkant' && n === 'rechthoek') && !(naam === 'rechthoek' && n === 'vierkant'); });
  }
  function vormTekening(naam, kleur) {
    var svg = {
      cirkel: '<circle cx="60" cy="60" r="48" fill="' + kleur + '"/>',
      ovaal: '<ellipse cx="60" cy="60" rx="56" ry="34" fill="' + kleur + '"/>',
      vierkant: '<rect x="16" y="16" width="88" height="88" rx="8" fill="' + kleur + '"/>',
      rechthoek: '<rect x="4" y="30" width="112" height="60" rx="8" fill="' + kleur + '"/>',
      driehoek: '<polygon points="60,8 112,106 8,106" fill="' + kleur + '"/>'
    }[naam];
    return '<svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="een ' + naam + '">' + svg + '</svg>';
  }

  var POSITIES = ['links', 'rechts', 'boven', 'onder'];
  var DIERTJES2 = [{ ico: '⚽', naam: 'bal' }, { ico: '🐈', naam: 'kat' }, { ico: '🌟', naam: 'ster' },
    { ico: '🚗', naam: 'auto' }, { ico: '🎈', naam: 'ballon' }, { ico: '🐟', naam: 'vis' }];
  // a little house in the middle, the animal on one of the four sides next to it
  function positieTekening(ico, positie) {
    var cel = { boven: 1, links: 3, rechts: 5, onder: 7 }[positie];
    var p = '';
    for (var i = 0; i < 9; i++) {
      var inhoud = i === 4 ? '🏠' : (i === cel ? ico : '');
      p += '<div style="display:flex;align-items:center;justify-content:center;font-size:28px;' +
        'background:var(--card-2);border-radius:8px">' + inhoud + '</div>';
    }
    return '<div style="display:grid;grid-template-columns:repeat(3,44px);grid-template-rows:repeat(3,44px);gap:4px" ' +
      'role="img" aria-label="Een huisje met een diertje ' + positie + ' ervan">' + p + '</div>';
  }

  /* draw a grid, with or without a mirror axis */
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
    { leerjaar: 1, ico: '\uD83D\uDD37', titel: 'Vormen herkennen', tekst: 'Cirkel, vierkant, driehoek of rechthoek?',
      badge: 'makkelijk', plan: { vorm: 10 } },
    { leerjaar: 1, ico: '\uD83E\uDDED', titel: 'Links, rechts, boven, onder', tekst: 'Waar staat het diertje naast het huisje?',
      badge: 'makkelijk', plan: { positie: 10 } },
    { leerjaar: 2, ico: '\uD83E\uDE9E', titel: 'Spiegelen naar rechts', tekst: 'Welke helft hoort er aan de andere kant?',
      badge: 'gemiddeld', as: 'verticaal', plan: { helft: 10 } },
    { leerjaar: 2, ico: '\u2195\uFE0F', titel: 'Spiegelen naar onder', tekst: 'Dezelfde vraag, maar de as ligt plat.',
      badge: 'gemiddeld', as: 'horizontaal', plan: { helft: 10 } },
    { leerjaar: 3, ico: '\u2705', titel: 'Klopt de spiegeling?', tekst: 'Is dit echt gespiegeld, of gedraaid?',
      badge: 'moeilijk', as: 'verticaal', plan: { klopt: 10 } },
    { leerjaar: 2, ico: '\uD83D\uDD22', titel: 'Hoeveel vakjes?', tekst: 'Hoeveel vakjes kleur je in de hele figuur?',
      badge: 'makkelijk', as: 'verticaal', plan: { tellen: 10 } },
    { leerjaar: 2, ico: '\uD83C\uDFC6', titel: 'Het eerste spiegelexamen', tekst: 'Spiegelen en tellen door elkaar.',
      badge: 'gemiddeld', as: 'verticaal', plan: { helft: 6, tellen: 4 } },
    { leerjaar: 3, ico: '\uD83C\uDFC6', titel: 'Het grote spiegelexamen', tekst: 'Alles door elkaar.',
      badge: 'moeilijk', as: 'verticaal', plan: { helft: 5, klopt: 3, tellen: 2 } }
  ],
  zaadjes: function (soort, h) {
    var uit = [];
    if (soort === 'vorm') {
      VORMNAMEN.forEach(function (naam) { KLEUREN.forEach(function (kleur) { uit.push({ naam: naam, kleur: kleur }); }); });
      return uit;
    }
    if (soort === 'positie') {
      DIERTJES2.forEach(function (d) { POSITIES.forEach(function (p) { uit.push({ dier: d, positie: p }); }); });
      return uit;
    }
    VORMEN.forEach(function (vorm, i) {
      if (soort === 'klopt' && zelfSymmetrisch(vorm)) return;
      if (soort === 'klopt') {
        // here the real and the fake mirror image are each a question of their own
        uit.push({ i: i, as: h.as, echt: true });
        uit.push({ i: i, as: h.as, echt: false });
      } else {
        uit.push({ i: i, as: h.as, echt: true });
      }
    });
    return uit;
  },
  maak: function (soort, z, h) {
    if (soort === 'vorm') {
      return { soort: soort, sleutel: 'vorm|' + z.naam + z.kleur, naam: z.naam, kleur: z.kleur, ans: z.naam,
        options: keuzes(z.naam, andere(vormKeuzes(z.naam), z.naam, 3)) };
    }
    if (soort === 'positie') {
      return { soort: soort, sleutel: 'positie|' + z.dier.naam + z.positie, dier: z.dier, positie: z.positie,
        ans: z.positie, options: keuzes(z.positie, andere(POSITIES, z.positie, 3)) };
    }
    var as = h.as, vorm = as === 'horizontaal' ? naarBoven(VORMEN[z.i]) : VORMEN[z.i];
    var kleur = KLEUREN[z.i % KLEUREN.length];
    var juist = as === 'horizontaal' ? spiegelV(vorm) : spiegelH(vorm);
    var sl = soort + '|' + z.i + as + (z.echt ? 'e' : 'n');

    if (soort === 'tellen') {
      // the whole figure is the half plus its mirror image: always double
      var totaal = vorm.length * 2;
      var fout = [];
      vulAan(fout, totaal, [vorm.length, totaal + 1, totaal - 1, totaal + 2], positief);
      return { soort: soort, sleutel: 'tellen|' + z.i, vorm: vorm, kleur: kleur, as: as, half: vorm.length,
        ans: String(totaal), options: keuzes(totaal, fout) };
    }
    if (soort === 'klopt') {
      // a half turn looks like mirroring, but it is not
      var gedraaid = !gelijk(draai(vorm), juist);
      var getoond = z.echt ? juist : (gedraaid ? draai(vorm) : schuif(vorm));
      // one exact answer per case: mirrored, turned, or shifted
      var juisteTekst = z.echt ? 'ja, gespiegeld' : gedraaid ? 'nee, gedraaid' : 'nee, verschoven';
      return { soort: soort, sleutel: sl, vorm: vorm, getoond: getoond, kleur: kleur, as: as, ans: juisteTekst,
        options: shuffle(['ja, gespiegeld', 'nee, gedraaid', 'nee, verschoven', 'ja, maar de as ligt verkeerd']
          .map(function (t) { return { text: t, ok: t === juisteTekst }; })) };
    }
    // half: four grids as choices, but those do not fit in a button, so the choice is by letter
    var kandidaten = [{ v: juist, ok: true, waarom: 'de echte spiegeling' },
      { v: draai(vorm), ok: false, waarom: 'een halve slag gedraaid' },
      { v: schuif(vorm), ok: false, waarom: 'gewoon opzij geschoven' },
      { v: as === 'horizontaal' ? spiegelH(vorm) : spiegelV(vorm), ok: false, waarom: 'over de verkeerde as gespiegeld' }];
    // drop duplicates: with a symmetric shape a turned one sometimes matches the mirror image
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
    if (v.soort === 'vorm') return vormTekening(v.naam, v.kleur);
    if (v.soort === 'positie') return positieTekening(v.dier.ico, v.positie);
    if (v.soort === 'tellen') return rooster(v.vorm, v.kleur, v.as, 156);
    if (v.soort === 'klopt') {
      return rooster(v.vorm, v.kleur, null, 130) + '<span class="pijl">\u27A1\uFE0F</span>' +
        rooster(v.getoond, v.kleur, null, 130);
    }
    // the four candidates with their letter below
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
    if (v.soort === 'vorm') return { titel: kop + 'welke vorm zie je?', sub: 'Kies de juiste naam.' };
    if (v.soort === 'positie') {
      return { titel: kop + 'waar staat de ' + v.dier.naam + '?', sub: 'Kijk naast het huisje.' };
    }
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
    if (v.soort === 'vorm') return 'Dit is een ' + v.ans + '.';
    if (v.soort === 'positie') return 'De ' + v.dier.naam + ' staat ' + v.positie + ' van het huisje.';
    if (v.soort === 'tellen') {
      return 'De helft heeft ' + v.half + ' vakjes, en de spiegeling nog eens ' + v.half + ': samen ' + (v.half * 2) + '.';
    }
    if (v.soort === 'klopt') {
      if (v.ans === 'ja, gespiegeld') return 'Elk vakje staat even ver van de as, maar aan de andere kant.';
      return v.ans === 'nee, gedraaid'
        ? 'Bij spiegelen blijft boven ook boven. Hier staat de figuur op zijn kop: dat is draaien.'
        : 'De figuur is gewoon opgeschoven, niet omgekeerd. Dat is geen spiegeling.';
    }
    var goed = v.kandidaten.filter(function (k) { return k.ok; })[0];
    return 'Rooster ' + goed.text + ' is ' + goed.waarom + ': elk vakje staat even ver van de stippellijn.';
  },
  kort: function (v) {
    if (v.soort === 'vorm') return 'Welke vorm is dit?';
    if (v.soort === 'positie') return 'Waar staat de ' + v.dier.naam + '?';
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
      // mirroring twice brings you back to the start
      check(gelijk(spiegelH(spiegelH(vorm)), vorm), 'twee keer horizontaal spiegelen bij vorm ' + i);
      check(gelijk(spiegelV(spiegelV(vorm)), vorm), 'twee keer verticaal spiegelen bij vorm ' + i);
      check(gelijk(draai(draai(vorm)), vorm), 'twee halve slagen bij vorm ' + i);
      // mirroring is not the same as turning or shifting
      check(!gelijk(spiegelH(vorm), draai(vorm)), 'spiegelen verschilt van draaien bij vorm ' + i);
      check(!gelijk(spiegelH(vorm), schuif(vorm)), 'spiegelen verschilt van schuiven bij vorm ' + i);
      check(!gelijk(spiegelH(vorm), vorm), 'de spiegeling is niet de vorm zelf bij vorm ' + i);
      // after mirroring, every square is just as far from the axis
      spiegelH(vorm).forEach(function (c, k) {
        check(c[0] === vorm[k][0], 'spiegelen over een verticale as laat de rij staan');
        check(c[1] + vorm[k][1] === N - 1, 'elk vakje staat even ver van de as');
      });
      check(rooster(vorm, '#000', 'verticaal', 140).indexOf('<svg') === 0, 'het rooster tekent bij vorm ' + i);
      naarBoven(vorm).forEach(function (c) {
        check(c[0] < N / 2, 'vorm ' + i + ' blijft op zijn kant in de bovenste helft, anders overlapt de spiegeling');
      });
    });
    check(rooster(VORMEN[0], '#000', 'verticaal', 140).indexOf('stroke-dasharray') > -1, 'de spiegelas staat er als stippellijn');
    check(rooster(VORMEN[0], '#000', null, 140).indexOf('stroke-dasharray') === -1, 'zonder as geen stippellijn');
  }
};
