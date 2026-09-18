import { keuzes, andere, shuffle } from '../gereedschap.js';

  // de vijf breuken van leerjaar 3: eenvoudig genoeg om in een balkje te tekenen, en geen twee
  // ervan zijn gelijkwaardig. Gelijkwaardige breuken (zoals 2/4 naast 1/2) zijn leerjaar 4
  var BREUKEN = [
    { teller: 1, noemer: 2 }, { teller: 1, noemer: 3 }, { teller: 2, noemer: 3 },
    { teller: 1, noemer: 4 }, { teller: 3, noemer: 4 }
  ];
  function breukTekst(b) { return b.teller + '/' + b.noemer; }
  function breukWaarde(b) { return b.teller / b.noemer; }

  // een balkje van gelijke stukjes, teller ervan gekleurd. Geen taart: geen trigonometrie nodig,
  // en een reep chocolade is het gangbare beeld in Vlaamse rekenmethodes
  function breukBalk(b, kleur) {
    var breed = 180, hoog = 56, stap = breed / b.noemer;
    var p = [];
    for (var i = 0; i < b.noemer; i++) {
      p.push('<rect x="' + (i * stap + 1) + '" y="0" width="' + (stap - 2) + '" height="' + hoog +
        '" rx="4" fill="' + (i < b.teller ? kleur : 'var(--card-2)') + '" stroke="var(--line)" stroke-width="2"/>');
    }
    return '<svg viewBox="0 0 ' + breed + ' ' + hoog + '" width="100%" role="img" ' +
      'aria-label="' + b.teller + ' van de ' + b.noemer + ' stukjes zijn gekleurd">' + p.join('') + '</svg>';
  }

export default {
  id: 'breuken',
  ico: '🍕',
  naam: 'Breuken',
  tekst: 'Een deel van een geheel, en welk stuk het grootste is.',
  top: 'Jij ziet in één oogopslag welk stuk het grootste is!',
  hoofdstukken: [
    { leerjaar: 3, ico: '🟧', titel: 'Breuken herkennen', tekst: 'Welk deel van de reep is gekleurd?',
      badge: 'makkelijk', plan: { herkennen: 10 } },
    { leerjaar: 3, ico: '⚖️', titel: 'Breuken vergelijken', tekst: 'Vier repen, welke is het grootste stuk?',
      badge: 'gemiddeld', plan: { vergelijk: 10 } }
  ],
  zaadjes: function (soort) {
    if (soort === 'vergelijk') {
      // welke vier van de vijf breuken deze keer, en welke daarvan buiten valt
      return BREUKEN.map(function (b, i) { return { weg: i }; });
    }
    return BREUKEN.map(function (b) { return { teller: b.teller, noemer: b.noemer }; });
  },
  maak: function (soort, z) {
    if (soort === 'vergelijk') {
      var vier = BREUKEN.filter(function (b, i) { return i !== z.weg; });
      var letters = ['A', 'B', 'C', 'D'];
      var kandidaten = shuffle(vier.map(function (b) { return b; })).map(function (b, i) {
        return { letter: letters[i], b: b };
      });
      var goed = kandidaten.reduce(function (best, k) { return breukWaarde(k.b) > breukWaarde(best.b) ? k : best; });
      return { soort: soort, sleutel: 'vergelijk|' + z.weg, kandidaten: kandidaten, ans: goed.letter,
        options: kandidaten.map(function (k) { return { text: k.letter, ok: k.letter === goed.letter }; }) };
    }
    var b2 = { teller: z.teller, noemer: z.noemer }, juist = breukTekst(b2);
    var fout = andere(BREUKEN.map(breukTekst), juist, 3);
    return { soort: soort, sleutel: 'herkennen|' + juist, teller: z.teller, noemer: z.noemer, ans: juist,
      options: keuzes(juist, fout) };
  },
  teken: function (v) {
    if (v.soort === 'vergelijk') {
      // een raster van twee kolommen, zodat vier repen ook op een smal scherm naast elkaar
      // staan in plaats van eronder: dat scheelt de helft van de hoogte van deze tekening
      return '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;max-width:280px;margin:0 auto">' +
        v.kandidaten.map(function (k) {
          return '<div style="text-align:center;font-family:Fredoka,sans-serif">' +
            breukBalk(k.b, '#FF7A45') + '<div style="font-size:15px;margin-top:4px">' + k.letter + '</div></div>';
        }).join('') + '</div>';
    }
    return '<div style="max-width:220px;margin:0 auto">' + breukBalk({ teller: v.teller, noemer: v.noemer }, '#FF7A45') + '</div>';
  },
  scherm: function () { return null; },
  vraag: function (v, nr) {
    var kop = 'Vraag ' + nr + ': ';
    if (v.soort === 'vergelijk') return { titel: kop + 'welke reep heeft het grootste gekleurde stuk?', sub: 'Kies de letter.' };
    return { titel: kop + 'welk deel van de reep is gekleurd?', sub: 'Tel de gekleurde stukjes en het totaal.' };
  },
  uitleg: function (v) {
    if (v.soort === 'vergelijk') {
      var goed = v.kandidaten.filter(function (k) { return k.letter === v.ans; })[0];
      return 'Reep ' + goed.letter + ' is ' + breukTekst(goed.b) + ', en dat is het grootste stuk van de vier.';
    }
    return v.teller + ' van de ' + v.noemer + ' stukjes is ' + v.ans + '.';
  },
  kort: function (v) {
    if (v.soort === 'vergelijk') return 'Welke reep is het grootste stuk?';
    return 'Welk deel is ' + v.ans + '?';
  },
  test: function (check) {
    check(BREUKEN.length === 5, 'vijf breuken om uit te kiezen');
    var waarden = BREUKEN.map(breukWaarde);
    check(waarden.filter(function (x, i) { return waarden.indexOf(x) === i; }).length === 5,
      'geen twee breuken zijn gelijkwaardig, anders heeft vergelijken geen eenduidig antwoord');
    check(breukBalk(BREUKEN[0], '#000').indexOf('<svg') === 0, 'de breukbalk tekent');
  }
};
