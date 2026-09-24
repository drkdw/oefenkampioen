import { shuffle, keuzes, vulAan, positief, andere, hoofdletter } from '../gereedschap.js';

  var DAGEN = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
  var MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni',
                 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  // februari staat op 28: schrikkeljaren komen apart aan bod
  var LENGTE = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  // Flemish schools teach the astronomical seasons (spring starts around 21 March), so March,
  // June, September and December each belong to two seasons. Those four months are never asked
  // and never offered as a wrong choice: only the months that sit fully inside one season.
  var SEIZOENEN = [
    { naam: 'winter', ico: '\u2744\uFE0F', maanden: [11, 0, 1], van: '21 december', tot: '21 maart' },
    { naam: 'lente', ico: '\uD83C\uDF37', maanden: [2, 3, 4], van: '21 maart', tot: '21 juni' },
    { naam: 'zomer', ico: '\u2600\uFE0F', maanden: [5, 6, 7], van: '21 juni', tot: '23 september' },
    { naam: 'herfst', ico: '\uD83C\uDF42', maanden: [8, 9, 10], van: '23 september', tot: '21 december' }
  ];
  var OVERGANG = [2, 5, 8, 11];
  function heelInSeizoen(m) { return OVERGANG.indexOf(m) === -1; }
  var RANG = ['eerste', 'tweede', 'derde', 'vierde', 'vijfde', 'zesde', 'zevende', 'achtste', 'negende',
    'tiende', 'elfde', 'twaalfde'];
  function seizoenVan(maand) {
    for (var i = 0; i < SEIZOENEN.length; i++) {
      if (SEIZOENEN[i].maanden.indexOf(maand) > -1) return SEIZOENEN[i];
    }
  }

  /* een maandblaadje met een dag omcirkeld */
  function blaadje(maand, dag, eersteDag) {
    var cellen = [], i;
    for (i = 0; i < eersteDag; i++) cellen.push('<div></div>');
    for (i = 1; i <= LENGTE[maand]; i++) {
      var nu = i === dag;
      cellen.push('<div style="width:26px;height:24px;display:flex;align-items:center;justify-content:center;' +
        'border-radius:8px;font-size:13px;' +
        (nu ? 'background:var(--accent);color:#fff' : 'color:var(--ink-soft)') + '">' + i + '</div>');
    }
    return '<div style="font-family:Fredoka,sans-serif;text-align:center">' +
      '<div style="font-size:18px;margin-bottom:6px">' + hoofdletter(MAANDEN[maand]) + '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(7,26px);gap:3px;justify-content:center">' +
      DAGEN.map(function (d) {
        return '<div style="font-size:11px;color:var(--ink-soft)">' + d.slice(0, 2) + '</div>';
      }).join('') + cellen.join('') + '</div></div>';
  }
  function seizoenkaart(s2) {
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;font-family:Fredoka,sans-serif">' +
      '<span style="font-size:64px">' + s2.ico + '</span></div>';
  }

  function tekenVraag(v) {
    // bij "in welk seizoen valt maart" mag het seizoen er niet bij staan: dat is het antwoord.
    // bij de omgekeerde vraag mag het net wel, daar is de maand gevraagd
    if (v.soort === 'seizoen') return v.vorm === 'omgekeerd' ? seizoenkaart(v.s) : blaadje(v.m, 0, 0);
    // bij de typvraag is het blaadje steun om verder te tellen, daar mag het
    if (v.soort === 'typ') return blaadje(v.m, v.dag, 0);
    // bij "hoeveel dagen heeft oktober" niet: dan tel je het gewoon af van het blaadje
    return '';
  }

export default {
  id: 'kalender',
  ico: '\uD83D\uDCC5',
  naam: 'De kalender',
  tekst: 'Dagen, maanden, seizoenen en tellen met de kalender.',
  top: 'Jij kent de kalender uit je hoofd!',
  hoofdstukken: [
    { leerjaar: 1, ico: '\uD83D\uDCC6', titel: 'De dagen van de week', tekst: 'Welke dag komt na woensdag?',
      badge: 'makkelijk', plan: { dag: 10 } },
    { leerjaar: 2, ico: '\uD83D\uDDD3\uFE0F', titel: 'De maanden van het jaar', tekst: 'Welke maand is de vijfde?',
      badge: 'makkelijk', plan: { maand: 10 } },
    { leerjaar: 2, ico: '\uD83C\uDF37', titel: 'De vier seizoenen', tekst: 'In welk seizoen valt oktober?',
      badge: 'makkelijk', plan: { seizoen: 10 } },
    { leerjaar: 3, ico: '\uD83D\uDD22', titel: 'Hoeveel dagen?', tekst: 'Hoeveel dagen heeft november?',
      badge: 'gemiddeld', plan: { lengte: 10 } },
    { leerjaar: 3, ico: '\u23E9', titel: 'Verder tellen', tekst: 'Het is dinsdag. Welke dag is het over tien dagen?',
      badge: 'moeilijk', plan: { verder: 10 } },
    { leerjaar: 3, ico: '\u2328\uFE0F', titel: 'Zelf de datum typen', tekst: 'Welke dag van de maand is het?',
      badge: 'gemiddeld', plan: { typ: 10 } },
    { leerjaar: 3, ico: '\uD83C\uDFC6', titel: 'Het grote kalenderexamen', tekst: 'Alles door elkaar.',
      badge: 'moeilijk', plan: { dag: 2, maand: 2, seizoen: 2, lengte: 2, verder: 2 } }
  ],
  zaadjes: function (soort) {
    var uit = [], i, j;
    if (soort === 'dag') {
      for (i = 0; i < 7; i++) { uit.push({ d: i, na: true }); uit.push({ d: i, na: false }); }
      for (i = 0; i < 7; i++) uit.push({ d: i, nummer: true });
    } else if (soort === 'maand') {
      for (i = 0; i < 12; i++) { uit.push({ m: i, nummer: true }); uit.push({ m: i, na: true }); }
    } else if (soort === 'seizoen') {
      for (i = 0; i < 12; i++) if (heelInSeizoen(i)) uit.push({ m: i });
      // every month twice, otherwise there are too few different questions
      for (i = 0; i < 12; i++) if (heelInSeizoen(i)) uit.push({ m: i, omgekeerd: true });
    } else if (soort === 'lengte') {
      for (i = 0; i < 12; i++) uit.push({ m: i });
      for (i = 0; i < 12; i++) uit.push({ m: i, kort: true });
    } else if (soort === 'verder') {
      for (i = 0; i < 7; i++) {
        for (j = 2; j <= 14; j++) uit.push({ d: i, stap: j });
      }
    } else {
      for (i = 0; i < 12; i++) {
        // the new date stays inside the month: 25 januari plus 8 is not "33 januari"
        for (j = 1; j <= 28; j += 3) if (j + 1 + (j % 9) <= LENGTE[i]) uit.push({ m: i, dag: j, stap: 1 + (j % 9) });
      }
    }
    return uit;
  },
  maak: function (soort, z) {
    var i;
    if (soort === 'dag') {
      if (z.nummer) {
        var nr = z.d + 1, jn = DAGEN[z.d];
        var fn = andere(DAGEN, jn, 3);
        return { soort: soort, sleutel: 'dagnr|' + z.d, vorm: 'nummer', d: z.d, nr: nr, ans: jn,
          options: keuzes(jn, fn) };
      }
      var buur = z.na ? (z.d + 1) % 7 : (z.d + 6) % 7;
      var j = DAGEN[buur];
      var f = andere(DAGEN, j, 3);
      return { soort: soort, sleutel: 'dag|' + z.d + (z.na ? 'n' : 'v'), vorm: z.na ? 'na' : 'voor',
        d: z.d, ans: j, options: keuzes(j, f) };
    }
    if (soort === 'maand') {
      if (z.nummer) {
        var jm = MAANDEN[z.m];
        var fm = andere(MAANDEN, jm, 3);
        return { soort: soort, sleutel: 'maandnr|' + z.m, vorm: 'nummer', m: z.m, ans: jm,
          options: keuzes(jm, fm) };
      }
      var vm = MAANDEN[(z.m + 1) % 12];
      var fv = andere(MAANDEN, vm, 3);
      return { soort: soort, sleutel: 'maandna|' + z.m, vorm: 'na', m: z.m, ans: vm, options: keuzes(vm, fv) };
    }
    if (soort === 'seizoen') {
      var s3 = seizoenVan(z.m);
      if (z.omgekeerd) {
        // welke maand hoort bij dit seizoen: de afleiders komen uit de andere seizoenen
        var jmn = MAANDEN[z.m];
        var fmn = shuffle(MAANDEN.filter(function (m, k) { return heelInSeizoen(k) && seizoenVan(k).naam !== s3.naam; })).slice(0, 3);
        return { soort: soort, sleutel: 'seizoenom|' + z.m, vorm: 'omgekeerd', m: z.m, s: s3, ans: jmn,
          options: keuzes(jmn, fmn) };
      }
      var fs = shuffle(SEIZOENEN.filter(function (x) { return x.naam !== s3.naam; }))
        .slice(0, 3).map(function (x) { return x.naam; });
      return { soort: soort, sleutel: 'seizoen|' + z.m, vorm: 'gewoon', m: z.m, s: s3, ans: s3.naam,
        options: keuzes(s3.naam, fs) };
    }
    if (soort === 'lengte') {
      if (z.kort) {
        // welke maand heeft er 30 dagen: kies er een uit vier
        var doel = LENGTE[z.m];
        var juiste = MAANDEN[z.m];
        var rest = shuffle(MAANDEN.filter(function (m, k) { return LENGTE[k] !== doel; })).slice(0, 3);
        return { soort: soort, sleutel: 'lengtem|' + z.m, vorm: 'welke', m: z.m, dagen: doel, ans: juiste,
          options: keuzes(juiste, rest) };
      }
      var dagen = LENGTE[z.m], fl = [];
      vulAan(fl, dagen, [28, 30, 31, 29], positief);
      return { soort: soort, sleutel: 'lengte|' + z.m, vorm: 'hoeveel', m: z.m, dagen: dagen,
        ans: String(dagen), options: keuzes(dagen, fl) };
    }
    if (soort === 'verder') {
      var uitkomst = (z.d + z.stap) % 7, ju = DAGEN[uitkomst];
      var fu = andere(DAGEN, ju, 3);
      return { soort: soort, sleutel: 'verder|' + z.d + '+' + z.stap, d: z.d, stap: z.stap, ans: ju,
        options: keuzes(ju, fu) };
    }
    // typ: de datum een aantal dagen later, binnen dezelfde maand
    var nieuw = z.dag + z.stap;
    return { soort: 'typ', sleutel: 'typ|' + z.m + '/' + z.dag + '+' + z.stap, m: z.m, dag: z.dag,
      stap: z.stap, nieuw: nieuw, ans: String(nieuw),
      typen: { scheider: '', hulp: 'Typ de dag van de maand in het vakje.',
        velden: [{ ph: '0', aria: 'Dag van de maand', ant: nieuw, max: 2 }] } };
  },
  teken: tekenVraag,
  scherm: function (v) {
    if (v.soort === 'dag') return v.vorm === 'nummer' ? 'dag ' + v.nr : hoofdletter(DAGEN[v.d]);
    if (v.soort === 'maand') return v.vorm === 'nummer' ? 'maand ' + (v.m + 1) : hoofdletter(MAANDEN[v.m]);
    if (v.soort === 'verder') return hoofdletter(DAGEN[v.d]) + ' + ' + v.stap;
    return null;
  },
  vraag: function (v, nr) {
    var kop = 'Vraag ' + nr + ': ';
    if (v.soort === 'dag') {
      if (v.vorm === 'nummer') return { titel: kop + 'welke dag is de ' + RANG[v.nr - 1] + ' dag van de week?', sub: 'De week begint op maandag.' };
      return { titel: kop + 'welke dag komt ' + (v.vorm === 'na' ? 'na' : 'voor') + ' ' + DAGEN[v.d] + '?' };
    }
    if (v.soort === 'maand') {
      if (v.vorm === 'nummer') return { titel: kop + 'welke maand is de ' + RANG[v.m] + ' maand van het jaar?' };
      return { titel: kop + 'welke maand komt na ' + MAANDEN[v.m] + '?' };
    }
    if (v.soort === 'seizoen') {
      if (v.vorm === 'omgekeerd') return { titel: kop + 'welke maand valt in de ' + v.s.naam + '?', sub: 'Er is er maar een die past.' };
      return { titel: kop + 'in welk seizoen valt ' + MAANDEN[v.m] + '?' };
    }
    if (v.soort === 'lengte') {
      if (v.vorm === 'welke') return { titel: kop + 'welke maand heeft ' + v.dagen + ' dagen?' };
      // 29 stays a wrong choice for February, so the question says which year it means
      if (v.m === 1) return { titel: kop + 'hoeveel dagen heeft februari in een gewoon jaar?', sub: 'Geen schrikkeljaar.' };
      return { titel: kop + 'hoeveel dagen heeft ' + MAANDEN[v.m] + '?' };
    }
    if (v.soort === 'verder') {
      return { titel: kop + 'het is ' + DAGEN[v.d] + '. Welke dag is het over ' + v.stap + ' dagen?',
        sub: 'Tel verder, en begin opnieuw na zondag.' };
    }
    return { titel: kop + 'het is ' + v.dag + ' ' + MAANDEN[v.m] + '. Welke dag van de maand is het over ' + v.stap + ' dagen?',
      sub: 'Typ alleen het getal.' };
  },
  uitleg: function (v) {
    if (v.soort === 'dag') {
      if (v.vorm === 'nummer') return 'De week begint op maandag, dus dag ' + v.nr + ' is ' + v.ans + '.';
      return 'De week loopt van maandag tot zondag: ' + DAGEN.join(', ') + '.';
    }
    if (v.soort === 'maand') {
      if (v.vorm === 'nummer') return 'Maand ' + (v.m + 1) + ' van het jaar is ' + v.ans + '.';
      return 'Na ' + MAANDEN[v.m] + ' komt ' + v.ans + '.';
    }
    if (v.soort === 'seizoen') {
      var s4 = v.s;
      return 'De ' + s4.naam + ' begint rond ' + s4.van + ' en duurt tot rond ' + s4.tot + '. ' +
        hoofdletter(MAANDEN[v.m]) + ' valt er helemaal in.';
    }
    if (v.soort === 'lengte') {
      return hoofdletter(MAANDEN[v.m]) + ' heeft ' + v.dagen + ' dagen. Alleen februari heeft er 28, of 29 in een schrikkeljaar.';
    }
    if (v.soort === 'verder') {
      var weken = Math.floor(v.stap / 7), rest = v.stap % 7;
      var wk = weken + (weken === 1 ? ' week' : ' weken');
      if (weken && !rest) return v.stap + ' dagen is precies ' + wk + ', dus het is weer ' + DAGEN[v.d] + '.';
      return weken
        ? v.stap + ' dagen is ' + wk + ' en ' + rest + (rest === 1 ? ' dag' : ' dagen') + ', dus je telt er nog ' + rest + ' bij.'
        : 'Tel ' + v.stap + ' dagen verder vanaf ' + DAGEN[v.d] + '.';
    }
    return v.dag + ' + ' + v.stap + ' = ' + v.nieuw + '. ' + hoofdletter(MAANDEN[v.m]) + ' heeft ' + LENGTE[v.m] +
      ' dagen, dus het is nog altijd ' + MAANDEN[v.m] + '.';
  },
  kort: function (v) {
    if (v.soort === 'dag') return v.vorm === 'nummer' ? 'De ' + RANG[v.nr - 1] + ' dag van de week' : (v.vorm === 'na' ? 'Na ' : 'Voor ') + DAGEN[v.d];
    if (v.soort === 'maand') return v.vorm === 'nummer' ? 'De ' + RANG[v.m] + ' maand' : 'Na ' + MAANDEN[v.m];
    if (v.soort === 'seizoen') return v.vorm === 'omgekeerd' ? 'Een maand in de ' + v.s.naam : 'Het seizoen van ' + MAANDEN[v.m];
    if (v.soort === 'lengte') return v.vorm === 'welke' ? 'Welke maand heeft ' + v.dagen + ' dagen' : 'Het aantal dagen van ' + MAANDEN[v.m];
    if (v.soort === 'verder') return DAGEN[v.d] + ' plus ' + v.stap + ' dagen';
    return v.dag + ' ' + MAANDEN[v.m] + ' plus ' + v.stap + ' dagen';
  },
  test: function (check) {
    check(DAGEN.length === 7 && MAANDEN.length === 12, 'zeven dagen en twaalf maanden');
    check(DAGEN[0] === 'maandag' && DAGEN[6] === 'zondag', 'de week begint op maandag');
    check(LENGTE.reduce(function (a, b) { return a + b; }, 0) === 365, 'de twaalf maanden tellen samen 365 dagen');
    check(LENGTE[1] === 28, 'februari staat op 28 dagen');
    var gezien = {};
    for (var m = 0; m < 12; m++) {
      var s5 = seizoenVan(m);
      check(s5 && s5.naam, MAANDEN[m] + ' hoort bij een seizoen');
      gezien[s5.naam] = (gezien[s5.naam] || 0) + 1;
    }
    SEIZOENEN.forEach(function (x) { check(gezien[x.naam] === 3, x.naam + ' telt drie maanden'); });
    check(seizoenVan(0).naam === 'winter' && seizoenVan(6).naam === 'zomer', 'januari is winter, juli is zomer');
    check(blaadje(1, 14, 0).indexOf('Februari') > -1, 'het maandblaadje toont de maand');
    var vg = { soort: 'seizoen', vorm: 'gewoon', m: 2, s: seizoenVan(2) };
    check(tekenVraag(vg).indexOf(seizoenVan(2).ico) === -1, 'de tekening verklapt het seizoen niet');
    check(tekenVraag({ soort: 'seizoen', vorm: 'omgekeerd', m: 2, s: seizoenVan(2) }).indexOf(seizoenVan(2).ico) > -1,
      'bij de omgekeerde vraag staat het seizoen er wel bij');
    // een maandblaadje verklapt zowel de naam als het aantal dagen
    check(tekenVraag({ soort: 'lengte', vorm: 'hoeveel', m: 9, dagen: 31 }) === '', 'geen blaadje bij het aantal dagen');
    check(tekenVraag({ soort: 'lengte', vorm: 'welke', m: 9, dagen: 31 }) === '', 'geen blaadje bij welke maand');
    check(tekenVraag({ soort: 'typ', m: 9, dag: 4 }).indexOf('Oktober') > -1, 'bij de typvraag helpt het blaadje wel');
    for (var mm = 0; mm < 12; mm++) {
      var b = blaadje(mm, 1, 2);
      check(b.indexOf(String(LENGTE[mm])) > -1, 'het blaadje van ' + MAANDEN[mm] + ' loopt tot ' + LENGTE[mm]);
    }
  }
};
