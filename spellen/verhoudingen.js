import { keuzes, vulAan, vulRondom, positief, andere, shuffle } from '../gereedschap.js';

  // vier procenten die netjes als breuk te schrijven zijn, zodat "getal" altijd deelbaar is
  var PROCENT = { 10: { teller: 1, noemer: 10 }, 25: { teller: 1, noemer: 4 },
    50: { teller: 1, noemer: 2 }, 75: { teller: 3, noemer: 4 } };

  function schaalTekening(kaart, schaal) {
    return '<div style="text-align:center;font-family:Fredoka,sans-serif">' +
      '<div style="font-size:36px">📏 ' + kaart + ' cm</div>' +
      '<div style="font-size:15px;color:var(--ink-soft);margin-top:6px">1 cm op de kaart is ' + schaal + ' km in het echt</div>' +
      '</div>';
  }

  /* --------- leerjaar 6 --------- */

  // btw and interest are the same operation (add a percentage), only the story differs. The
  // percentages are the real Belgian ones: btw 21% or 6%, a savings rate of a few percent, and
  // the usual sale discounts. Each comes with a step for the base amount so the part is whole.
  var TOENAME_STIJL = [
    { ctx: 'btw', ding: 'een fiets', dingen: { 6: 'een kar boodschappen' }, vraag: 'zonder btw', uitleg: 'de prijs met btw', percs: { 21: 100, 6: 50 } },
    { ctx: 'intrest', ding: 'je spaargeld', vraag: 'op de bank', uitleg: 'wat je na een jaar hebt', percs: { 2: 50, 3: 100, 5: 20 } }
  ];
  var KORTING = { 10: 10, 20: 5, 25: 4, 50: 2 };
  var WAREN_TABEL = [
    { ico: '✏️', naam: 'potloden', enkel: 'potlood', prijs: 1 }, { ico: '🍎', naam: 'appels', enkel: 'appel', prijs: 2 },
    { ico: '🧃', naam: 'pakjes sap', enkel: 'pakje sap', prijs: 3 }
  ];
  var DAGEN5 = ['ma', 'di', 'wo', 'do', 'vr'];

  function balkjeTekening(waarden, vraagIndex) {
    var max = 10, breed = 220, hoog = 110, stapY = hoog / max, breedteBalk = breed / waarden.length;
    var p = [];
    for (var g = 0; g <= max; g += 2) {
      var y = hoog - g * stapY;
      p.push('<line x1="0" y1="' + y + '" x2="' + breed + '" y2="' + y + '" stroke="var(--line)" stroke-width="1"/>');
      p.push('<text x="-6" y="' + y + '" text-anchor="end" dominant-baseline="central" font-family="Fredoka, sans-serif" font-size="9" fill="var(--ink-soft)">' + g + '</text>');
    }
    waarden.forEach(function (w, i) {
      var x = i * breedteBalk + 4, kleur = i === vraagIndex ? 'var(--accent)' : 'var(--card-2)';
      p.push('<rect x="' + x + '" y="' + (hoog - w * stapY) + '" width="' + (breedteBalk - 8) + '" height="' + (w * stapY) +
        '" fill="' + kleur + '" stroke="var(--line)" stroke-width="1"/>');
      p.push('<text x="' + (x + (breedteBalk - 8) / 2) + '" y="' + (hoog + 14) + '" text-anchor="middle" ' +
        'font-family="Fredoka, sans-serif" font-size="11" fill="var(--ink-soft)">' + DAGEN5[i] + '</text>');
    });
    return '<svg viewBox="-24 -6 ' + (breed + 28) + ' ' + (hoog + 26) + '" width="100%" style="max-width:260px" ' +
      'role="img" aria-label="Een staafdiagram met de waarden van vijf dagen">' + p.join('') + '</svg>';
  }

export default {
  id: 'verhoudingen',
  ico: '📊',
  naam: 'Verhoudingen',
  tekst: 'Procent, verhoudingstabel, snelheid, gemiddelde en diagrammen.',
  top: 'Jij ziet meteen hoeveel procent dat is!',
  hoofdstukken: [
    { leerjaar: 5, ico: '💯', titel: 'Procent van een getal', tekst: '25% van 40 is 10.',
      badge: 'gemiddeld', plan: { procent: 10 } },
    { leerjaar: 5, ico: '🗺️', titel: 'Verhoudingen en schaal', tekst: '1 cm op de kaart is 5 km in het echt.',
      badge: 'moeilijk', plan: { schaal: 10 } },
    { leerjaar: 6, ico: '🧾', titel: 'Btw, korting en intrest', tekst: '21% btw erbij, 20% korting eraf.',
      badge: 'moeilijk', plan: { toename: 5, korting: 5 } },
    { leerjaar: 6, ico: '📋', titel: 'Verhoudingstabel', tekst: '3 appels kosten 6 euro. Hoeveel kosten 5 appels?',
      badge: 'gemiddeld', plan: { tabel: 10 } },
    { leerjaar: 6, ico: '🚗', titel: 'Snelheid', tekst: '120 km in 2 uur is 60 km per uur.',
      badge: 'moeilijk', plan: { snelheid: 10 } },
    { leerjaar: 6, ico: '⚖️', titel: 'Gemiddelde', tekst: 'Drie getallen samen, gedeeld door drie.',
      badge: 'gemiddeld', plan: { gemiddelde: 10 } },
    { leerjaar: 6, ico: '📈', titel: 'Diagrammen lezen', tekst: 'Hoeveel geeft de staaf van woensdag aan?',
      badge: 'gemiddeld', plan: { diagram: 10 } },
    { leerjaar: 6, ico: '🏆', titel: 'Het eerste verhoudingenexamen', tekst: 'Btw, verhoudingstabel, snelheid en gemiddelde.',
      badge: 'moeilijk', plan: { toename: 2, korting: 2, tabel: 2, snelheid: 2, gemiddelde: 2 } }
  ],
  zaadjes: function (soort) {
    if (soort === 'schaal') {
      var uit2 = [];
      [2, 5, 10, 20, 50].forEach(function (s) {
        for (var kaart = 1; kaart <= 9; kaart++) uit2.push({ kaart: kaart, schaal: s });
      });
      return uit2;
    }
    if (soort === 'toename') {
      var uit3 = [];
      TOENAME_STIJL.forEach(function (st, stijl) {
        Object.keys(st.percs).forEach(function (perc) {
          for (var k = 1; k <= 8; k++) uit3.push({ perc: Number(perc), basis: st.percs[perc] * k, stijl: stijl });
        });
      });
      return uit3;
    }
    if (soort === 'korting') {
      var uitK = [];
      Object.keys(KORTING).forEach(function (perc) {
        for (var k = 2; k <= 12; k++) uitK.push({ perc: Number(perc), basis: KORTING[perc] * k, stijl: 0 });
      });
      return uitK;
    }
    if (soort === 'tabel') {
      var uit4 = [];
      WAREN_TABEL.forEach(function (w) {
        for (var aantal1 = 2; aantal1 <= 4; aantal1++) {
          for (var aantal2 = 3; aantal2 <= 8; aantal2++) {
            if (aantal2 !== aantal1) uit4.push({ waar: w, aantal1: aantal1, aantal2: aantal2 });
          }
        }
      });
      return uit4;
    }
    if (soort === 'snelheid') {
      var uit5 = [];
      for (var tijd = 1; tijd <= 6; tijd++) {
        for (var snelh = 20; snelh <= 120; snelh += 10) uit5.push({ tijd: tijd, snelheid: snelh });
      }
      return uit5;
    }
    if (soort === 'gemiddelde') {
      var uit6 = [];
      // many different averages, three different numbers, none above 20
      for (var g = 4; g <= 15; g++) {
        for (var a = 2; a < g; a++) {
          for (var b = a + 1; b <= 20; b++) {
            var c = 3 * g - a - b;
            if (c > b && c <= 20) uit6.push({ a: a, b: b, c: c });
          }
        }
      }
      return uit6;
    }
    if (soort === 'diagram') {
      var uit7 = [];
      for (var i = 0; i < 12; i++) uit7.push({ seed: i });
      return uit7;
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
    if (soort === 'toename' || soort === 'korting') {
      var deelT = z.basis * z.perc / 100;
      var uitkT = soort === 'toename' ? z.basis + deelT : z.basis - deelT;
      var stijlObj = TOENAME_STIJL[z.stijl];
      var foutT = [];
      vulAan(foutT, uitkT, [z.basis, uitkT + deelT, uitkT - deelT, uitkT + deelT * 2, uitkT - deelT * 2], positief);
      vulRondom(foutT, uitkT, 1, positief);
      return { soort: soort, sleutel: soort + '|' + z.perc + ':' + z.basis, perc: z.perc, basis: z.basis,
        stijl: stijlObj, ans: String(uitkT), options: keuzes(uitkT, foutT.slice(0, 3)) };
    }
    if (soort === 'tabel') {
      var eenheidsprijs = z.waar.prijs, prijs1 = eenheidsprijs * z.aantal1, ansTab = eenheidsprijs * z.aantal2;
      var foutTab = [];
      vulAan(foutTab, ansTab, [prijs1, eenheidsprijs, ansTab + eenheidsprijs, ansTab - eenheidsprijs], positief);
      vulRondom(foutTab, ansTab, 1, positief);
      return { soort: soort, sleutel: 'tabel|' + z.waar.naam + ':' + z.aantal1 + ':' + z.aantal2, waar: z.waar,
        aantal1: z.aantal1, prijs1: prijs1, aantal2: z.aantal2, ans: String(ansTab), options: keuzes(ansTab, foutTab.slice(0, 3)) };
    }
    if (soort === 'snelheid') {
      var afstand = z.tijd * z.snelheid, foutS = [];
      vulAan(foutS, z.snelheid, [afstand, Math.round(afstand / (z.tijd + 1)), z.snelheid + 10, z.snelheid - 10], positief);
      vulRondom(foutS, z.snelheid, 10, positief);
      return { soort: soort, sleutel: 'snelheid|' + z.tijd + ':' + z.snelheid, tijd: z.tijd, afstand: afstand,
        ans: String(z.snelheid), options: keuzes(z.snelheid, foutS.slice(0, 3)) };
    }
    if (soort === 'gemiddelde') {
      var gem = (z.a + z.b + z.c) / 3, foutG = [];
      vulAan(foutG, gem, [z.a, z.b, z.c, gem + 1, gem - 1], positief);
      vulRondom(foutG, gem, 1, positief);
      return { soort: soort, sleutel: 'gemiddelde|' + z.a + ':' + z.b + ':' + z.c, a: z.a, b: z.b, c: z.c,
        ans: String(gem), options: keuzes(gem, foutG.slice(0, 3)) };
    }
    if (soort === 'diagram') {
      // vaste, deterministische waarden per zaadje: geen twee zaadjes leveren dezelfde reeks
      var waarden = DAGEN5.map(function (d, i) { return 2 + (z.seed * 3 + i * 5) % 9; });
      var vraagIndex = z.seed % DAGEN5.length, juistD = waarden[vraagIndex];
      var restD = waarden.filter(function (w, i) { return i !== vraagIndex; });
      return { soort: soort, sleutel: 'diagram|' + z.seed, waarden: waarden, vraagIndex: vraagIndex, dag: DAGEN5[vraagIndex],
        ans: String(juistD), options: keuzes(juistD, andere(restD, juistD, 3).length === 3 ? andere(restD, juistD, 3)
          : restD.slice(0, 3)) };
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
    if (v.soort === 'tabel') {
      return '<div style="text-align:center;font-family:Fredoka,sans-serif">' +
        '<div style="font-size:44px">' + v.waar.ico + '</div>' +
        '<div style="font-size:16px;color:var(--ink-soft)">' + v.aantal1 + ' ' + v.waar.naam + ' kosten € ' + v.prijs1 + '</div></div>';
    }
    if (v.soort === 'diagram') return balkjeTekening(v.waarden, v.vraagIndex);
    return '';
  },
  scherm: function (v) {
    if (v.soort === 'procent') return v.perc + '% van ' + v.getal + ' = ?';
    return null;
  },
  vraag: function (v, nr) {
    var kop = 'Vraag ' + nr + ': ';
    if (v.soort === 'schaal') return { titel: kop + 'hoeveel km is dat in het echt?', sub: 'Vermenigvuldig met de schaal.' };
    if (v.soort === 'toename') {
      var ding = (v.stijl.dingen && v.stijl.dingen[v.perc]) || v.stijl.ding;
      return { titel: kop + ding.charAt(0).toUpperCase() + ding.slice(1) + ' is € ' + v.basis + ' ' + v.stijl.vraag + '.',
        sub: 'Er komt ' + v.perc + '% bij. Wat is ' + v.stijl.uitleg + '?' };
    }
    if (v.soort === 'korting') return { titel: kop + 'iets kost € ' + v.basis + ', met ' + v.perc + '% korting.', sub: 'Wat is de nieuwe prijs?' };
    if (v.soort === 'tabel') return { titel: kop + 'hoeveel kosten ' + v.aantal2 + ' ' + v.waar.naam + '?', sub: 'Zoek eerst de prijs van één stuk.' };
    if (v.soort === 'snelheid') return { titel: kop + v.afstand + ' km in ' + v.tijd + ' uur, hoeveel km per uur is dat?', sub: 'Deel de afstand door de tijd.' };
    if (v.soort === 'gemiddelde') return { titel: kop + 'wat is het gemiddelde van ' + v.a + ', ' + v.b + ' en ' + v.c + '?', sub: 'Tel op en deel door drie.' };
    if (v.soort === 'diagram') return { titel: kop + 'hoeveel geeft de staaf van ' + v.dag + ' aan?', sub: 'Lees af op de zijkant.' };
    return { titel: kop + 'hoeveel is ' + v.perc + '% van ' + v.getal + '?', sub: PROCENT[v.perc].teller + '/' + PROCENT[v.perc].noemer + ' van het getal.' };
  },
  uitleg: function (v) {
    if (v.soort === 'schaal') return v.kaart + ' cm × ' + v.schaal + ' km = ' + v.ans + ' km.';
    if (v.soort === 'toename') return v.basis + ' + ' + v.perc + '% (' + (v.ans - v.basis) + ') = ' + v.ans + '.';
    if (v.soort === 'korting') return v.basis + ' − ' + v.perc + '% (' + (v.basis - v.ans) + ') = ' + v.ans + '.';
    if (v.soort === 'tabel') return '1 ' + v.waar.enkel + ' kost € ' + (v.prijs1 / v.aantal1) + ', dus ' + v.aantal2 + ' kosten € ' + v.ans + '.';
    if (v.soort === 'snelheid') return v.afstand + ' : ' + v.tijd + ' = ' + v.ans + ' km per uur.';
    if (v.soort === 'gemiddelde') return v.a + ' + ' + v.b + ' + ' + v.c + ' = ' + (v.a + v.b + v.c) + ', gedeeld door 3 is ' + v.ans + '.';
    if (v.soort === 'diagram') return 'De staaf van ' + v.dag + ' staat op ' + v.ans + '.';
    return v.perc + '% is ' + PROCENT[v.perc].teller + '/' + PROCENT[v.perc].noemer + ', en dat van ' + v.getal + ' is ' + v.ans + '.';
  },
  kort: function (v) {
    if (v.soort === 'schaal') return v.kaart + ' cm, 1 cm = ' + v.schaal + ' km';
    if (v.soort === 'toename' || v.soort === 'korting') return v.perc + '% van € ' + v.basis;
    if (v.soort === 'tabel') return v.aantal2 + ' ' + v.waar.naam;
    if (v.soort === 'snelheid') return v.afstand + ' km in ' + v.tijd + ' uur';
    if (v.soort === 'gemiddelde') return 'Gemiddelde van ' + v.a + ', ' + v.b + ', ' + v.c;
    if (v.soort === 'diagram') return 'Staaf van ' + v.dag;
    return v.perc + '% van ' + v.getal;
  },
  test: function (check) {
    Object.keys(PROCENT).forEach(function (perc) {
      var p = PROCENT[perc];
      check(Math.abs(p.teller / p.noemer - Number(perc) / 100) < 1e-9, perc + '% klopt als breuk');
    });
    check(balkjeTekening([2, 4, 6, 8, 10], 2).indexOf('<svg') === 0, 'het staafdiagram tekent');
    TOENAME_STIJL.forEach(function (st) {
      Object.keys(st.percs).forEach(function (perc) {
        check((st.percs[perc] * Number(perc)) % 100 === 0, perc + '% van de basisstap is een heel bedrag');
      });
    });
  }
};
