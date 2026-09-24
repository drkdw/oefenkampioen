import { keuzes, vulAan, vulRondom, positief, andere, shuffle } from '../gereedschap.js';

  // the five fractions of year 3: simple enough to draw in a bar, and no two of them
  // are equivalent. Equivalent fractions (like 2/4 next to 1/2) are year 4
  var BREUKEN = [
    { teller: 1, noemer: 2 }, { teller: 1, noemer: 3 }, { teller: 2, noemer: 3 },
    { teller: 1, noemer: 4 }, { teller: 3, noemer: 4 }
  ];
  function breukTekst(b) { return b.teller + '/' + b.noemer; }
  function breukWaarde(b) { return b.teller / b.noemer; }

  // a bar of equal pieces, the numerator of them coloured. No pie: no trigonometry needed,
  // and a chocolate bar is the usual picture in Flemish maths textbooks
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
  function balkMet(b) { return '<div style="max-width:220px;margin:0 auto">' + breukBalk(b, '#FF7A45') + '</div>'; }

  /* --------- year 4 --------- */

  // each base fraction with a few equivalent forms; the first is always the chosen question
  var GELIJKWAARDIG = {
    '1/2': ['2/4', '3/6', '4/8'], '1/3': ['2/6', '3/9'], '2/3': ['4/6', '6/9'],
    '1/4': ['2/8', '3/12'], '3/4': ['6/8', '9/12']
  };
  var ALLE_GELIJK = Object.keys(GELIJKWAARDIG).reduce(function (a, k) { return a.concat(GELIJKWAARDIG[k]); }, []);

  /* --------- year 5 --------- */

  // a handful of fractions with a neat, non-repeating decimal form
  var NAAR_KOMMA = [
    { teller: 1, noemer: 2, komma: '0,5' }, { teller: 1, noemer: 4, komma: '0,25' },
    { teller: 3, noemer: 4, komma: '0,75' }, { teller: 1, noemer: 5, komma: '0,2' },
    { teller: 2, noemer: 5, komma: '0,4' }, { teller: 3, noemer: 5, komma: '0,6' },
    { teller: 4, noemer: 5, komma: '0,8' }, { teller: 1, noemer: 10, komma: '0,1' },
    { teller: 3, noemer: 10, komma: '0,3' }, { teller: 7, noemer: 10, komma: '0,7' }
  ];

export default {
  id: 'breuken',
  ico: '🍕',
  naam: 'Breuken',
  tekst: 'Een deel van een geheel, vergelijken, en breuken optellen en aftrekken.',
  top: 'Jij ziet in één oogopslag welk stuk het grootste is!',
  hoofdstukken: [
    { leerjaar: 3, ico: '🟧', titel: 'Breuken herkennen', tekst: 'Welk deel van de reep is gekleurd?',
      badge: 'makkelijk', plan: { herkennen: 10 } },
    { leerjaar: 3, ico: '⚖️', titel: 'Breuken vergelijken', tekst: 'Vier repen, welke is het grootste stuk?',
      badge: 'gemiddeld', plan: { vergelijk: 10 } },
    { leerjaar: 4, ico: '🔗', titel: 'Gelijkwaardige breuken', tekst: '1/2 is hetzelfde als 2/4.',
      badge: 'gemiddeld', plan: { gelijk: 10 } },
    { leerjaar: 4, ico: '🧮', titel: 'Breuken optellen en aftrekken', tekst: '1/4 + 2/4, met dezelfde noemer.',
      badge: 'gemiddeld', plan: { breukPlus: 5, breukMin: 5 } },
    { leerjaar: 4, ico: '🔢', titel: 'Breuk van een getal', tekst: '1/4 van 12 is 3.',
      badge: 'gemiddeld', plan: { vanGetal: 10 } },
    { leerjaar: 4, ico: '🔟', titel: 'Kommagetallen', tekst: '3 tienden is 0,3. 37 honderdsten is 0,37.',
      badge: 'gemiddeld', plan: { tiende: 5, honderdste: 5 } },
    { leerjaar: 4, ico: '🎯', titel: 'Afronden', tekst: '47 afgerond op het tiental is 50.',
      badge: 'gemiddeld', plan: { rondTiental: 5, rondHonderdtal: 5 } },
    { leerjaar: 4, ico: '🏆', titel: 'Het eerste breukenexamen', tekst: 'Gelijkwaardig, optellen, en breuk van een getal.',
      badge: 'moeilijk', plan: { gelijk: 3, breukPlus: 2, breukMin: 2, vanGetal: 3 } },
    { leerjaar: 5, ico: '🧩', titel: 'Optellen met ongelijke noemer', tekst: '1/2 + 1/4. Maak eerst de noemers gelijk.',
      badge: 'moeilijk', plan: { breukPlusOngelijk: 10 } },
    { leerjaar: 5, ico: '✳️', titel: 'Breuk maal getal', tekst: '2/3 × 4. De teller keer het getal.',
      badge: 'gemiddeld', plan: { breukMaal: 10 } },
    { leerjaar: 5, ico: '🔟', titel: 'Breuk naar kommagetal', tekst: '3/4 is hetzelfde als 0,75.',
      badge: 'gemiddeld', plan: { naarKomma: 10 } },
    { leerjaar: 5, ico: '🏆', titel: 'Het tweede breukenexamen', tekst: 'Ongelijke noemer, breuk maal getal, en kommagetallen.',
      badge: 'moeilijk', plan: { breukPlusOngelijk: 4, breukMaal: 3, naarKomma: 3 } }
  ],
  zaadjes: function (soort) {
    if (soort === 'vergelijk') {
      // which four of the five fractions this time, and which of them is left out
      return BREUKEN.map(function (b, i) { return { weg: i }; });
    }
    if (soort === 'gelijk') return Object.keys(GELIJKWAARDIG).map(function (k) { return { basis: k }; });
    if (soort === 'breukPlus' || soort === 'breukMin') {
      var uit2 = [];
      [3, 4, 5, 6, 8].forEach(function (noemer) {
        for (var t1 = 1; t1 < noemer; t1++) {
          for (var t2 = 1; t2 < noemer; t2++) {
            if (soort === 'breukPlus' && t1 + t2 < noemer) uit2.push({ noemer: noemer, t1: t1, t2: t2 });
            if (soort === 'breukMin' && t1 > t2) uit2.push({ noemer: noemer, t1: t1, t2: t2 });
          }
        }
      });
      return uit2;
    }
    if (soort === 'vanGetal') {
      var uit3 = [];
      [2, 3, 4, 5, 6].forEach(function (noemer) {
        for (var teller = 1; teller < noemer; teller++) {
          for (var k = 1; k <= 8; k++) uit3.push({ noemer: noemer, teller: teller, getal: noemer * k });
        }
      });
      return uit3;
    }
    if (soort === 'breukPlusOngelijk') {
      var uit6 = [];
      [[2, 4], [2, 6], [2, 8], [3, 6], [3, 9], [4, 8]].forEach(function (paar) {
        var klein = paar[0], groot = paar[1], factor = groot / klein;
        for (var tk = 1; tk < klein; tk++) {
          for (var tg = 1; tg < groot; tg++) {
            if (tk * factor + tg < groot) uit6.push({ klein: klein, groot: groot, tk: tk, tg: tg });
          }
        }
      });
      return uit6;
    }
    if (soort === 'breukMaal') {
      var uit7 = [];
      [2, 3, 4, 5].forEach(function (noemer) {
        for (var teller = 1; teller < noemer; teller++) {
          for (var getal = 2; getal <= 9; getal++) uit7.push({ noemer: noemer, teller: teller, getal: getal });
        }
      });
      return uit7;
    }
    if (soort === 'naarKomma') return NAAR_KOMMA.map(function (b, i) { return { i: i }; });
    if (soort === 'tiende') return [1, 2, 3, 4, 6, 7, 8, 9].map(function (t) { return { t: t }; });
    if (soort === 'honderdste') {
      var uit4 = [];
      for (var h = 1; h <= 99; h += 3) if (h % 10 !== 0) uit4.push({ h: h });
      return uit4;
    }
    if (soort === 'rondTiental' || soort === 'rondHonderdtal') {
      var stap = soort === 'rondTiental' ? 10 : 100, max = soort === 'rondTiental' ? 199 : 1990;
      var uit5 = [];
      for (var n = stap + 1; n <= max; n += Math.round(stap / 3)) {
        if (n % stap !== 0) uit5.push({ n: n });
      }
      return uit5;
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
    if (soort === 'gelijk') {
      var opties = GELIJKWAARDIG[z.basis], juist2 = opties[Math.floor(Math.random() * opties.length)];
      var poel = andere(ALLE_GELIJK.filter(function (x) { return opties.indexOf(x) === -1; }), null, 3);
      return { soort: soort, sleutel: 'gelijk|' + z.basis, basis: z.basis, ans: juist2, options: keuzes(juist2, poel) };
    }
    if (soort === 'breukPlus' || soort === 'breukMin') {
      var uitTeller = soort === 'breukPlus' ? z.t1 + z.t2 : z.t1 - z.t2;
      var juist3 = uitTeller + '/' + z.noemer;
      // the real mistake first (adding the denominators too, or the wrong operation), then
      // numerators right around the answer, so the answer is not always the largest choice.
      // Only as a last resort the same numerator over another denominator.
      var kern2 = [soort === 'breukPlus' ? uitTeller + '/' + (z.noemer * 2) : (z.t1 + z.t2) + '/' + z.noemer];
      shuffle([1, -1, 2, -2]).concat([3, -3]).forEach(function (d) {
        var tt = uitTeller + d;
        if (tt >= 1 && tt <= z.noemer) kern2.push(tt + '/' + z.noemer);
      });
      [3, 4, 5, 6, 8].forEach(function (nm) {
        if (nm !== z.noemer && uitTeller > 0 && uitTeller < nm) kern2.push(uitTeller + '/' + nm);
      });
      // kern2 already holds only valid fraction text, no extra check needed: and positief() on
      // "1/3" always gives NaN, so it would have kept the whole list empty
      var fout3 = [];
      vulAan(fout3, juist3, kern2);
      return { soort: soort, sleutel: soort + '|' + z.noemer + ':' + z.t1 + ':' + z.t2, noemer: z.noemer,
        t1: z.t1, t2: z.t2, ans: juist3, options: keuzes(juist3, fout3.slice(0, 3)) };
    }
    if (soort === 'vanGetal') {
      var deel = z.getal / z.noemer * z.teller, fout4 = [];
      vulAan(fout4, deel, [z.getal / z.noemer, deel + z.noemer, deel - z.noemer, z.getal - deel], positief);
      vulRondom(fout4, deel, 1, positief);
      return { soort: soort, sleutel: 'vanGetal|' + z.noemer + ':' + z.teller + ':' + z.getal, noemer: z.noemer,
        teller: z.teller, getal: z.getal, ans: String(deel), options: keuzes(deel, fout4.slice(0, 3)) };
    }
    if (soort === 'breukPlusOngelijk') {
      var factor2 = z.groot / z.klein, uitTeller2 = z.tk * factor2 + z.tg, juist4 = uitTeller2 + '/' + z.groot;
      // forgetting to convert the small denominator first is the typical mistake
      var kern3 = [(z.tk + z.tg) + '/' + z.groot];
      shuffle([1, -1, 2, -2]).concat([3, -3]).forEach(function (d) {
        var tt2 = uitTeller2 + d;
        if (tt2 >= 1 && tt2 <= z.groot) kern3.push(tt2 + '/' + z.groot);
      });
      kern3.push(z.tk + '/' + z.klein);
      var fout8 = [];
      vulAan(fout8, juist4, kern3);
      return { soort: soort, sleutel: 'breukPlusOngelijk|' + z.klein + ':' + z.tk + ':' + z.groot + ':' + z.tg,
        klein: z.klein, groot: z.groot, tk: z.tk, tg: z.tg, ans: juist4, options: keuzes(juist4, fout8.slice(0, 3)) };
    }
    if (soort === 'breukMaal') {
      var prod2 = z.teller * z.getal, juist5 = prod2 + '/' + z.noemer;
      var kern4 = [(prod2 + 1) + '/' + z.noemer, (prod2 - 1) + '/' + z.noemer, (prod2 + 2) + '/' + z.noemer,
        z.getal + '/' + z.noemer, z.teller + '/' + z.noemer, (z.teller + z.getal) + '/' + z.noemer];
      var fout9 = [];
      vulAan(fout9, juist5, kern4);
      return { soort: soort, sleutel: 'breukMaal|' + z.noemer + ':' + z.teller + ':' + z.getal,
        noemer: z.noemer, teller: z.teller, getal: z.getal, ans: juist5, options: keuzes(juist5, fout9.slice(0, 3)) };
    }
    if (soort === 'naarKomma') {
      var basis2 = NAAR_KOMMA[z.i];
      var fout10 = andere(NAAR_KOMMA.map(function (b) { return b.komma; }), basis2.komma, 3);
      return { soort: soort, sleutel: 'naarKomma|' + z.i, teller: basis2.teller, noemer: basis2.noemer,
        ans: basis2.komma, options: keuzes(basis2.komma, fout10) };
    }
    if (soort === 'tiende') {
      var komma = '0,' + z.t, fout5 = andere([1, 2, 3, 4, 6, 7, 8, 9].map(function (x) { return '0,' + x; }), komma, 3);
      return { soort: soort, sleutel: 'tiende|' + z.t, t: z.t, ans: komma, options: keuzes(komma, fout5) };
    }
    if (soort === 'honderdste') {
      var naarKomma = function (x) { return '0,' + (x < 10 ? '0' + x : x); };
      var komma2 = naarKomma(z.h);
      // pick the wrong numbers first, convert to decimal text only at the end: vulAan would
      // never see "0,02" as positive, the comma stops it from being a number
      var foutGetallen = [];
      vulAan(foutGetallen, z.h, [z.h + 1, z.h - 1, z.h + 10, z.h - 10], function (x) { return x >= 1 && x <= 99; });
      vulRondom(foutGetallen, z.h, 1, function (x) { return x >= 1 && x <= 99; });
      var fout6 = foutGetallen.slice(0, 3).map(naarKomma);
      return { soort: soort, sleutel: 'honderdste|' + z.h, h: z.h, ans: komma2, options: keuzes(komma2, fout6) };
    }
    if (soort === 'rondTiental' || soort === 'rondHonderdtal') {
      var stap2 = soort === 'rondTiental' ? 10 : 100, afgerond = Math.round(z.n / stap2) * stap2;
      var fout7 = [];
      vulAan(fout7, afgerond, [afgerond + stap2, afgerond - stap2, Math.floor(z.n / stap2) * stap2, Math.ceil(z.n / stap2) * stap2], positief);
      vulRondom(fout7, afgerond, stap2, positief);
      return { soort: soort, sleutel: soort + '|' + z.n, n: z.n, stap: stap2, ans: String(afgerond),
        options: keuzes(afgerond, fout7.slice(0, 3)) };
    }
    var b2 = { teller: z.teller, noemer: z.noemer }, juist = breukTekst(b2);
    var fout = andere(BREUKEN.map(breukTekst), juist, 3);
    return { soort: soort, sleutel: 'herkennen|' + juist, teller: z.teller, noemer: z.noemer, ans: juist,
      options: keuzes(juist, fout) };
  },
  teken: function (v) {
    if (v.soort === 'vergelijk') {
      // a two-column grid, so four bars sit side by side even on a narrow screen
      // instead of stacked: that saves half the height of this drawing
      return '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;max-width:280px;margin:0 auto">' +
        v.kandidaten.map(function (k) {
          return '<div style="text-align:center;font-family:Fredoka,sans-serif">' +
            breukBalk(k.b, '#FF7A45') + '<div style="font-size:15px;margin-top:4px">' + k.letter + '</div></div>';
        }).join('') + '</div>';
    }
    if (v.soort === 'gelijk') {
      var delen = v.basis.split('/');
      return balkMet({ teller: Number(delen[0]), noemer: Number(delen[1]) });
    }
    if (v.soort === 'tiende') return balkMet({ teller: v.t, noemer: 10 });
    if (v.soort === 'naarKomma') return balkMet({ teller: v.teller, noemer: v.noemer });
    if (v.soort === 'herkennen') return balkMet({ teller: v.teller, noemer: v.noemer });
    return '';
  },
  scherm: function (v) {
    if (v.soort === 'breukPlus') return v.t1 + '/' + v.noemer + ' + ' + v.t2 + '/' + v.noemer + ' = ?';
    if (v.soort === 'breukMin') return v.t1 + '/' + v.noemer + ' − ' + v.t2 + '/' + v.noemer + ' = ?';
    if (v.soort === 'breukPlusOngelijk') return v.tk + '/' + v.klein + ' + ' + v.tg + '/' + v.groot + ' = ?';
    if (v.soort === 'breukMaal') return v.teller + '/' + v.noemer + ' × ' + v.getal + ' = ?';
    return null;
  },
  vraag: function (v, nr) {
    var kop = 'Vraag ' + nr + ': ';
    if (v.soort === 'vergelijk') return { titel: kop + 'welke reep heeft het grootste gekleurde stuk?', sub: 'Kies de letter.' };
    if (v.soort === 'gelijk') return { titel: kop + 'welke breuk is hetzelfde als ' + v.basis + '?', sub: 'Kijk naar de gekleurde reep.' };
    if (v.soort === 'breukPlus' || v.soort === 'breukMin') return { titel: kop + 'wat is het antwoord?', sub: 'De noemer blijft gelijk.' };
    if (v.soort === 'breukPlusOngelijk') return { titel: kop + 'wat is het antwoord?', sub: 'Maak eerst de noemers gelijk.' };
    if (v.soort === 'breukMaal') return { titel: kop + 'wat is het antwoord?', sub: 'Vermenigvuldig enkel de teller.' };
    if (v.soort === 'naarKomma') return { titel: kop + 'welk kommagetal is ' + v.teller + '/' + v.noemer + '?', sub: 'Kijk naar de gekleurde reep.' };
    if (v.soort === 'vanGetal') return { titel: kop + 'hoeveel is ' + v.teller + '/' + v.noemer + ' van ' + v.getal + '?', sub: 'Deel eerst door de noemer.' };
    if (v.soort === 'tiende') return { titel: kop + 'welk kommagetal is dit?', sub: 'Tel de gekleurde stukjes: dat zijn tienden.' };
    if (v.soort === 'honderdste') return { titel: kop + v.h + ' honderdsten, welk kommagetal is dat?', sub: 'Honderdsten schrijf je met twee cijfers na de komma.' };
    if (v.soort === 'rondTiental') return { titel: kop + v.n + ' afgerond op het tiental?', sub: 'Kijk naar het cijfer van de eenheden.' };
    if (v.soort === 'rondHonderdtal') return { titel: kop + v.n + ' afgerond op het honderdtal?', sub: 'Kijk naar het tiental.' };
    return { titel: kop + 'welk deel van de reep is gekleurd?', sub: 'Tel de gekleurde stukjes en het totaal.' };
  },
  uitleg: function (v) {
    if (v.soort === 'vergelijk') {
      var goed = v.kandidaten.filter(function (k) { return k.letter === v.ans; })[0];
      return 'Reep ' + goed.letter + ' is ' + breukTekst(goed.b) + ', en dat is het grootste stuk van de vier.';
    }
    if (v.soort === 'gelijk') return v.basis + ' en ' + v.ans + ' zijn evenveel: dezelfde grootte, andere stukjes.';
    if (v.soort === 'breukPlus') return v.t1 + '/' + v.noemer + ' + ' + v.t2 + '/' + v.noemer + ' = ' + v.ans + ': de noemer blijft, de tellers samen.';
    if (v.soort === 'breukPlusOngelijk') {
      return v.tk + '/' + v.klein + ' is hetzelfde als ' + (v.tk * v.groot / v.klein) + '/' + v.groot +
        ', en dat plus ' + v.tg + '/' + v.groot + ' is ' + v.ans + '.';
    }
    if (v.soort === 'breukMaal') return v.teller + '/' + v.noemer + ' × ' + v.getal + ' = ' + (v.teller * v.getal) + '/' + v.noemer + ': de teller keer het getal, de noemer blijft.';
    if (v.soort === 'naarKomma') return v.teller + '/' + v.noemer + ' is hetzelfde als ' + v.ans + '.';
    if (v.soort === 'breukMin') return v.t1 + '/' + v.noemer + ' − ' + v.t2 + '/' + v.noemer + ' = ' + v.ans + ': de noemer blijft, de tellers aftrekken.';
    if (v.soort === 'vanGetal') return v.getal + ' : ' + v.noemer + ' = ' + (v.getal / v.noemer) + ', en ' + v.teller + ' keer dat is ' + v.ans + '.';
    if (v.soort === 'tiende') return v.t + ' van de 10 stukjes is ' + v.ans + '.';
    if (v.soort === 'honderdste') return v.h + ' honderdsten schrijf je als ' + v.ans + '.';
    if (v.soort === 'rondTiental' || v.soort === 'rondHonderdtal') return v.n + ' ligt het dichtst bij ' + v.ans + '.';
    return v.teller + ' van de ' + v.noemer + ' stukjes is ' + v.ans + '.';
  },
  kort: function (v) {
    if (v.soort === 'vergelijk') return 'Welke reep is het grootste stuk?';
    if (v.soort === 'gelijk') return 'Gelijkwaardig aan ' + v.basis;
    if (v.soort === 'breukPlus' || v.soort === 'breukMin') return v.t1 + '/' + v.noemer + ' en ' + v.t2 + '/' + v.noemer;
    if (v.soort === 'breukPlusOngelijk') return v.tk + '/' + v.klein + ' en ' + v.tg + '/' + v.groot;
    if (v.soort === 'breukMaal') return v.teller + '/' + v.noemer + ' × ' + v.getal;
    if (v.soort === 'naarKomma') return v.teller + '/' + v.noemer + ' naar komma';
    if (v.soort === 'vanGetal') return v.teller + '/' + v.noemer + ' van ' + v.getal;
    if (v.soort === 'tiende') return v.t + ' tienden';
    if (v.soort === 'honderdste') return v.h + ' honderdsten';
    if (v.soort === 'rondTiental' || v.soort === 'rondHonderdtal') return v.n + ' afronden';
    return 'Welk deel is ' + v.ans + '?';
  },
  test: function (check) {
    check(BREUKEN.length === 5, 'vijf breuken om uit te kiezen');
    var waarden = BREUKEN.map(breukWaarde);
    check(waarden.filter(function (x, i) { return waarden.indexOf(x) === i; }).length === 5,
      'geen twee breuken zijn gelijkwaardig, anders heeft vergelijken geen eenduidig antwoord');
    check(breukBalk(BREUKEN[0], '#000').indexOf('<svg') === 0, 'de breukbalk tekent');
    Object.keys(GELIJKWAARDIG).forEach(function (basis) {
      var delen = basis.split('/'), waarde = Number(delen[0]) / Number(delen[1]);
      GELIJKWAARDIG[basis].forEach(function (vorm) {
        var d2 = vorm.split('/');
        check(Math.abs(Number(d2[0]) / Number(d2[1]) - waarde) < 1e-9, vorm + ' is echt gelijkwaardig aan ' + basis);
      });
    });
  }
};
