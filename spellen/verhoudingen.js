import { keuzes, vulAan, vulRondom, positief } from '../gereedschap.js';

  // vier procenten die netjes als breuk te schrijven zijn, zodat "getal" altijd deelbaar is
  var PROCENT = { 10: { teller: 1, noemer: 10 }, 25: { teller: 1, noemer: 4 },
    50: { teller: 1, noemer: 2 }, 75: { teller: 3, noemer: 4 } };

  function schaalTekening(kaart, schaal) {
    return '<div style="text-align:center;font-family:Fredoka,sans-serif">' +
      '<div style="font-size:36px">📏 ' + kaart + ' cm</div>' +
      '<div style="font-size:15px;color:var(--ink-soft);margin-top:6px">1 cm op de kaart is ' + schaal + ' km in het echt</div>' +
      '</div>';
  }

export default {
  id: 'verhoudingen',
  ico: '📊',
  naam: 'Verhoudingen',
  tekst: 'Procent van een getal, en rekenen met een schaal.',
  top: 'Jij ziet meteen hoeveel procent dat is!',
  hoofdstukken: [
    { leerjaar: 5, ico: '💯', titel: 'Procent van een getal', tekst: '25% van 40 is 10.',
      badge: 'gemiddeld', plan: { procent: 10 } },
    { leerjaar: 5, ico: '🗺️', titel: 'Verhoudingen en schaal', tekst: '1 cm op de kaart is 5 km in het echt.',
      badge: 'moeilijk', plan: { schaal: 10 } }
  ],
  zaadjes: function (soort) {
    if (soort === 'schaal') {
      var uit2 = [];
      [2, 5, 10, 20, 50].forEach(function (s) {
        for (var kaart = 1; kaart <= 9; kaart++) uit2.push({ kaart: kaart, schaal: s });
      });
      return uit2;
    }
    var uit = [];
    Object.keys(PROCENT).forEach(function (perc) {
      var noemer = PROCENT[perc].noemer;
      for (var k = 1; k <= 12; k++) uit.push({ perc: Number(perc), getal: noemer * k });
    });
    return uit;
  },
  maak: function (soort, z) {
    if (soort === 'schaal') {
      var echt = z.kaart * z.schaal, fout2 = [];
      vulAan(fout2, echt, [z.kaart, echt + z.schaal, echt - z.schaal, z.kaart * (z.schaal + 10)], positief);
      vulRondom(fout2, echt, z.schaal, positief);
      return { soort: soort, sleutel: 'schaal|' + z.kaart + ':' + z.schaal, kaart: z.kaart, schaal: z.schaal,
        ans: String(echt), options: keuzes(echt, fout2.slice(0, 3)) };
    }
    var deel = z.getal / PROCENT[z.perc].noemer * PROCENT[z.perc].teller, fout = [];
    // veelgemaakte fout: de rest nemen in plaats van het deel, of het dubbele. Enkel gehele
    // getallen: getal / 4 geeft niet altijd een rond getal, en dan komt er een punt in plaats
    // van een komma te staan
    vulAan(fout, deel, [z.getal - deel, deel * 2, z.getal - deel * 2, deel + 1, deel - 1], positief);
    vulRondom(fout, deel, 1, positief);
    return { soort: soort, sleutel: 'procent|' + z.perc + ':' + z.getal, perc: z.perc, getal: z.getal,
      ans: String(deel), options: keuzes(deel, fout.slice(0, 3)) };
  },
  teken: function (v) {
    if (v.soort === 'schaal') return schaalTekening(v.kaart, v.schaal);
    return '';
  },
  scherm: function (v) { return v.soort === 'procent' ? v.perc + '% van ' + v.getal + ' = ?' : null; },
  vraag: function (v, nr) {
    var kop = 'Vraag ' + nr + ': ';
    if (v.soort === 'schaal') return { titel: kop + 'hoeveel km is dat in het echt?', sub: 'Vermenigvuldig met de schaal.' };
    return { titel: kop + 'hoeveel is ' + v.perc + '% van ' + v.getal + '?', sub: PROCENT[v.perc].teller + '/' + PROCENT[v.perc].noemer + ' van het getal.' };
  },
  uitleg: function (v) {
    if (v.soort === 'schaal') return v.kaart + ' cm × ' + v.schaal + ' km = ' + v.ans + ' km.';
    return v.perc + '% is ' + PROCENT[v.perc].teller + '/' + PROCENT[v.perc].noemer + ', en dat van ' + v.getal + ' is ' + v.ans + '.';
  },
  kort: function (v) {
    if (v.soort === 'schaal') return v.kaart + ' cm op schaal 1:' + v.schaal;
    return v.perc + '% van ' + v.getal;
  },
  test: function (check) {
    Object.keys(PROCENT).forEach(function (perc) {
      var p = PROCENT[perc];
      check(Math.abs(p.teller / p.noemer - Number(perc) / 100) < 1e-9, perc + '% klopt als breuk');
    });
  }
};
