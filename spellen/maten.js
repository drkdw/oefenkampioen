import { shuffle, keuzes, vulAan, positief, vulRondom, hoofdletter, andere } from '../gereedschap.js';

  // alles rekent in de kleinste eenheid: mm, g en ml. Zo blijft het hele getallen.
  var STELSELS = {
    lengte: { ico: '📏', eenheden: [
      { naam: 'mm', in: 1 }, { naam: 'cm', in: 10 }, { naam: 'dm', in: 100 }, { naam: 'm', in: 1000 }] },
    gewicht: { ico: '⚖️', eenheden: [
      { naam: 'g', in: 1 }, { naam: 'kg', in: 1000 }] },
    inhoud: { ico: '🥤', eenheden: [
      { naam: 'ml', in: 1 }, { naam: 'cl', in: 10 }, { naam: 'dl', in: 100 }, { naam: 'l', in: 1000 }] }
  };
  function eenheid(stelsel, naam) {
    var lijst = STELSELS[stelsel].eenheden;
    for (var i = 0; i < lijst.length; i++) if (lijst[i].naam === naam) return lijst[i];
  }
  function toon(getal, naam) { return getal + ' ' + naam; }

  /* de dingen die je in de klas meet, met hun maat in de kleinste eenheid */
  var DINGEN = [
    { ico: '✏️', naam: 'een potlood', stelsel: 'lengte', maat: 170 },
    { ico: '📕', naam: 'een boek', stelsel: 'lengte', maat: 240 },
    { ico: '🚪', naam: 'een deur', stelsel: 'lengte', maat: 2000 },
    { ico: '🚗', naam: 'een auto', stelsel: 'lengte', maat: 4000 },
    { ico: '🐜', naam: 'een mier', stelsel: 'lengte', maat: 5 },
    { ico: '🚲', naam: 'een fiets', stelsel: 'lengte', maat: 1800 },
    { ico: '📎', naam: 'een paperclip', stelsel: 'lengte', maat: 30 },
    { ico: '🏫', naam: 'de speelplaats', stelsel: 'lengte', maat: 30000 },
    { ico: '🧍', naam: 'een kind van acht', stelsel: 'lengte', maat: 1300 },
    { ico: '🛏️', naam: 'een bed', stelsel: 'lengte', maat: 2000 },
    { ico: '🍎', naam: 'een appel', stelsel: 'gewicht', maat: 150 },
    { ico: '🧳', naam: 'een valies', stelsel: 'gewicht', maat: 12000 },
    { ico: '🪶', naam: 'een veer', stelsel: 'gewicht', maat: 1 },
    { ico: '🐕', naam: 'een hond', stelsel: 'gewicht', maat: 20000 },
    { ico: '📦', naam: 'een pak suiker', stelsel: 'gewicht', maat: 1000 },
    { ico: '✉️', naam: 'een brief', stelsel: 'gewicht', maat: 20 },
    { ico: '🐘', naam: 'een olifant', stelsel: 'gewicht', maat: 4000000 },
    { ico: '🥛', naam: 'een glas melk', stelsel: 'inhoud', maat: 200 },
    { ico: '🛁', naam: 'een bad', stelsel: 'inhoud', maat: 150000 },
    { ico: '🥄', naam: 'een lepel siroop', stelsel: 'inhoud', maat: 15 },
    { ico: '🍼', naam: 'een flesje voor een baby', stelsel: 'inhoud', maat: 250 },
    { ico: '🪣', naam: 'een emmer', stelsel: 'inhoud', maat: 10000 },
    { ico: '☕', naam: 'een tas koffie', stelsel: 'inhoud', maat: 150 },
    { ico: '🐠', naam: 'een aquarium', stelsel: 'inhoud', maat: 60000 }
  ];
  // alle eenheden samen: een appel van 150 l is ook een geloofwaardige verkeerde keuze
  var ALLE_EENHEDEN = [];
  ['lengte', 'gewicht', 'inhoud'].forEach(function (st) {
    STELSELS[st].eenheden.forEach(function (e) { ALLE_EENHEDEN.push(e.naam); });
  });

  /* een liniaal die een lengte in cm toont */
  function liniaal(mm) {
    // de liniaal is altijd twintig centimeter lang, anders eindigt de streep altijd op het einde
    var cm = Math.round(mm / 10), breed = 320, hoog = 88, MAXCM = 20;
    var schaal = breed / MAXCM;
    var p = ['<rect x="0" y="30" width="' + breed + '" height="40" rx="6" fill="#F3D9A4" stroke="#C9A75F" stroke-width="2"/>'];
    for (var i = 0; i <= MAXCM; i++) {
      var x = (i * schaal).toFixed(1), lang = i % 5 === 0;
      p.push('<line x1="' + x + '" y1="30" x2="' + x + '" y2="' + (lang ? 52 : 43) + '" stroke="#6B5324" stroke-width="' + (lang ? 2 : 1) + '"/>');
      if (lang) p.push('<text x="' + x + '" y="64" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="10" fill="#6B5324">' + i + '</text>');
    }
    p.push('<rect x="0" y="8" width="' + (cm * schaal).toFixed(1) + '" height="16" rx="8" fill="var(--accent)"/>');
    return '<svg viewBox="0 0 ' + breed + ' ' + hoog + '" width="100%" style="max-width:320px" role="img" aria-label="Een liniaal die ' +
      cm + ' centimeter aanduidt">' + p.join('') + '</svg>';
  }
  // direction 0 is bigger/longer/heavier, direction 1 is smaller/shorter/lighter
  var VERGELIJK = { lengte: ['langer', 'korter'], gewicht: ['zwaarder', 'lichter'], inhoud: ['meer', 'minder'] };
  // a six-year-old compares without measuring, so only things that differ at least three times
  // over count: a glass of milk and a baby bottle are too close to call
  var DUIDELIJK = 3;
  function vergelijkPoel(basis, richting) {
    return DINGEN.filter(function (x) {
      return x.stelsel === basis.stelsel && x !== basis &&
        (richting === 0 ? x.maat >= basis.maat * DUIDELIJK : x.maat * DUIDELIJK <= basis.maat);
    });
  }
  function vergelijkFout(basis, richting) { return vergelijkPoel(basis, 1 - richting); }
  function vergelijkZin(basis, richting) {
    return basis.stelsel === 'inhoud'
      ? 'waar kan ' + VERGELIJK.inhoud[richting] + ' in dan in ' + basis.naam + '?'
      : 'wat is ' + VERGELIJK[basis.stelsel][richting] + ' dan ' + basis.naam + '?';
  }
  // een maatbeker, gevuld tot een van tien liter-strepen: dezelfde manier van aflezen als de
  // liniaal, maar dan voor inhoud, en zonder de omrekening naar deciliter die leerjaar 3 doet
  function maatbeker(liter) {
    var MAX = 10, breed = 90, hoog = 150, vulHoogte = (hoog - 20) * (liter / MAX);
    var p = ['<rect x="10" y="10" width="' + (breed - 20) + '" height="' + (hoog - 20) +
      '" rx="6" fill="none" stroke="var(--line)" stroke-width="3"/>',
      '<rect x="10" y="' + (hoog - 10 - vulHoogte) + '" width="' + (breed - 20) + '" height="' + vulHoogte +
      '" fill="var(--accent)"/>'];
    for (var i = 1; i <= MAX; i++) {
      var y = hoog - 10 - (hoog - 20) * (i / MAX);
      p.push('<line x1="' + (breed - 20) + '" y1="' + y + '" x2="' + breed + '" y2="' + y +
        '" stroke="var(--ink-soft)" stroke-width="2"/>');
      if (i % 2 === 0) {
        p.push('<text x="' + (breed + 6) + '" y="' + y + '" dominant-baseline="central" ' +
          'font-family="Fredoka, sans-serif" font-size="11" fill="var(--ink-soft)">' + i + '</text>');
      }
    }
    return '<svg viewBox="0 0 ' + (breed + 24) + ' ' + hoog + '" width="' + (breed + 24) + '" height="' + hoog +
      '" role="img" aria-label="Een maatbeker gevuld tot ' + liter + ' liter">' + p.join('') + '</svg>';
  }
  /* een weegschaal of maatbeker in het groot */
  function ding(d) {
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;font-family:Fredoka,sans-serif">' +
      '<span style="font-size:64px">' + d.ico + '</span>' +
      '<span style="font-size:17px;color:var(--ink-soft)">' + d.naam + '</span></div>';
  }
  function trap(stelsel) {
    // de eenheden op een rij, met de stapjes van tien ertussen
    var lijst = STELSELS[stelsel].eenheden;
    return '<div style="display:flex;align-items:flex-end;gap:2px;font-family:Fredoka,sans-serif">' +
      lijst.slice().reverse().map(function (e, i, rij) {
        // the real step to the next unit: ×10 between cm and mm, but ×1000 between kg and g
        var volgende = rij[i + 1];
        return '<span style="background:var(--card-2);border:2px solid var(--line);border-radius:10px;padding:6px 10px;font-size:16px">' +
          e.naam + '</span>' + (volgende ? '<span style="color:var(--ink-soft);font-size:13px">×' + (e.in / volgende.in) + '</span>' : '');
      }).join('') + '</div>';
  }

  // omrekenen gaat mis op twee manieren: de verkeerde kant op, of een stap te ver
  function afleidersOm(juist, van, naar, waarde) {
    var lijst = [], omgekeerd = Math.round(waarde * van.in * van.in / naar.in / naar.in);
    vulAan(lijst, juist, [juist * 10, Math.round(juist / 10), omgekeerd, juist * 100, juist + 1], function (k) {
      return k > 0 && k === Math.round(k);
    });
    vulRondom(lijst, juist, 1);
    return lijst.slice(0, 3);
  }

export default {
  id: 'maten',
  ico: '📏',
  naam: 'Meten en wegen',
  tekst: 'Meter en centimeter, kilo en gram, liter en deciliter.',
  top: 'Jij meet alles tot op de millimeter!',
  hoofdstukken: [
    { leerjaar: 1, ico: '⚖️', titel: 'Vergelijken zonder meten', tekst: 'Wat is langer dan een potlood? Zonder centimeters te tellen.',
      badge: 'makkelijk', plan: { vergelijk: 10 } },
    { leerjaar: 2, ico: '📏', titel: 'Lezen op de liniaal', tekst: 'Hoeveel centimeter is dat?',
      badge: 'makkelijk', stelsel: 'lengte', plan: { liniaal: 10 } },
    { leerjaar: 2, ico: '📐', titel: 'Meter en centimeter', tekst: 'Van m naar cm en terug.',
      badge: 'gemiddeld', stelsel: 'lengte', paren: [['m', 'cm'], ['cm', 'mm'], ['m', 'dm'], ['dm', 'cm']], plan: { om: 10 } },
    { leerjaar: 2, ico: '🧃', titel: 'Liter aflezen', tekst: 'Hoeveel liter staat er in de beker?',
      badge: 'makkelijk', plan: { liter: 10 } },
    { leerjaar: 3, ico: '⚖️', titel: 'Kilo en gram', tekst: 'Van kg naar g en terug.',
      badge: 'gemiddeld', stelsel: 'gewicht', paren: [['kg', 'g']], plan: { om: 10 } },
    { leerjaar: 3, ico: '🥤', titel: 'Liter en deciliter', tekst: 'Van l naar dl, cl en ml.',
      badge: 'gemiddeld', stelsel: 'inhoud', paren: [['l', 'dl'], ['l', 'cl'], ['l', 'ml'], ['dl', 'cl']], plan: { om: 10 } },
    { leerjaar: 2, ico: '🤔', titel: 'Welke maat past?', tekst: 'Weegt een appel 150 g of 150 kg?',
      badge: 'makkelijk', plan: { past: 10 } },
    { leerjaar: 2, ico: '🏆', titel: 'Het eerste meetexamen', tekst: 'De liniaal, meter en centimeter, en welke maat past.',
      badge: 'gemiddeld', stelsel: 'lengte', paren: [['m', 'cm'], ['cm', 'mm']], plan: { liniaal: 4, om: 3, past: 3 } },
    { leerjaar: 3, ico: '⌨️', titel: 'Zelf omrekenen', tekst: 'Geen keuzes. Typ het getal zelf in.',
      badge: 'moeilijk', stelsel: 'lengte', paren: [['m', 'cm'], ['cm', 'mm'], ['kg', 'g'], ['l', 'ml']], plan: { typ: 10 } },
    { leerjaar: 3, ico: '🏆', titel: 'Het grote meetexamen', tekst: 'Alles door elkaar.',
      badge: 'moeilijk', stelsel: 'lengte', paren: [['m', 'cm'], ['cm', 'mm'], ['kg', 'g'], ['l', 'dl']], plan: { om: 4, past: 3, liniaal: 2, typ: 1 } },
    { leerjaar: 6, ico: '🔀', titel: 'Alle omzettingen door elkaar', tekst: 'Lengte, gewicht en inhoud, alle eenheden samen.',
      badge: 'moeilijk', stelsel: 'lengte',
      paren: [['m', 'mm'], ['m', 'dm'], ['dm', 'mm'], ['kg', 'g'], ['l', 'ml'], ['l', 'cl'], ['dl', 'ml']],
      plan: { om: 10 } }
  ],
  zaadjes: function (soort, h) {
    var uit = [];
    if (soort === 'liter') {
      var uit3 = [];
      for (var l = 1; l <= 10; l++) uit3.push({ liter: l });
      return uit3;
    }
    if (soort === 'vergelijk') {
      var uit2 = [];
      DINGEN.forEach(function (basis) {
        [0, 1].forEach(function (richting) {
          // een zinvolle vraag heeft minstens een juist antwoord en minstens drie foute
          var poel = vergelijkPoel(basis, richting);
          if (poel.length >= 1 && vergelijkFout(basis, richting).length >= 3) uit2.push({ basis: basis, richting: richting });
        });
      });
      return uit2;
    }
    if (soort === 'liniaal') {
      // hele centimeters tot 20, dat is wat er op een schoolliniaal past
      for (var cm = 1; cm <= 20; cm++) uit.push({ mm: cm * 10 });
      return uit;
    }
    if (soort === 'past') {
      DINGEN.forEach(function (d) { uit.push({ ding: d }); });
      return uit;
    }
    // omrekenen: elk paar met een handvol ronde getallen, in beide richtingen.
    // van klein naar groot vertrekken we van het veelvoud, anders is 30 g geen heel aantal kg
    var GETALLEN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 50];
    // keep both numbers inside the number range of the year: up to 100 in the second, up to
    // 10 000 in the third (the third year counts to 1000, but then kilo and gram would only
    // ever be 1 kg = 1000 g)
    var grens = h.leerjaar <= 2 ? 100 : h.leerjaar === 3 ? 10000 : 100000;
    (h.paren || [['m', 'cm']]).forEach(function (paar) {
      var stelsel = eenheid('lengte', paar[0]) ? 'lengte' : eenheid('gewicht', paar[0]) ? 'gewicht' : 'inhoud';
      var a = eenheid(stelsel, paar[0]), b = eenheid(stelsel, paar[1]);
      var groot = a.in > b.in ? a : b, klein = a.in > b.in ? b : a;
      var stap = groot.in / klein.in;
      GETALLEN.forEach(function (n) {
        if (n * stap > grens) return;
        uit.push({ stelsel: stelsel, van: groot.naam, naar: klein.naam, n: n });
        uit.push({ stelsel: stelsel, van: klein.naam, naar: groot.naam, n: n * stap });
      });
    });
    return uit;
  },
  maak: function (soort, z) {
    if (soort === 'liter') {
      var fout5 = [];
      vulAan(fout5, z.liter, [z.liter + 1, z.liter - 1, z.liter + 2, z.liter - 2], positief);
      vulRondom(fout5, z.liter, 1, function (k) { return k >= 1 && k <= 10; });
      return { soort: soort, sleutel: 'liter|' + z.liter, liter: z.liter, ans: String(z.liter),
        options: keuzes(z.liter, fout5.slice(0, 3)) };
    }
    if (soort === 'vergelijk') {
      var poel2 = vergelijkPoel(z.basis, z.richting), goed = poel2[Math.floor(Math.random() * poel2.length)];
      var buiten = vergelijkFout(z.basis, z.richting).map(function (x) { return x.naam; });
      return { soort: soort, sleutel: 'vergelijk|' + z.basis.naam + z.richting, basis: z.basis, richting: z.richting,
        ans: goed.naam, options: keuzes(goed.naam, andere(buiten, null, 3)) };
    }
    if (soort === 'liniaal') {
      var cm = z.mm / 10;
      var fout = [];
      vulAan(fout, cm, [z.mm, cm + 1, cm - 1, cm * 10], positief);
      vulRondom(fout, cm, 1);
      return { soort: soort, sleutel: 'liniaal|' + z.mm, mm: z.mm, cm: cm, ans: toon(cm, 'cm'),
        options: keuzes(toon(cm, 'cm'), fout.map(function (k) { return toon(k, 'cm'); })) };
    }
    if (soort === 'past') {
      var d = z.ding, lijst = STELSELS[d.stelsel].eenheden;
      // zoek de eenheid waarin het ding een mooi getal geeft
      var beste = lijst[0], getal = d.maat;
      // nobody says a child is 13 dm: in everyday speech lengths go in mm, cm or m
      lijst.forEach(function (e) {
        var g = d.maat / e.in;
        if (e.naam !== 'dm' && g === Math.round(g) && g >= 1 && g < getal) { beste = e; getal = g; }
      });
      var juist = toon(getal, beste.naam), fout = [];
      // eerst de buren uit hetzelfde stelsel, dan de rest: gewicht heeft er maar twee
      vulAan(fout, juist, shuffle(lijst.filter(function (e) { return e.naam !== beste.naam; }))
        .map(function (e) { return toon(getal, e.naam); }));
      vulAan(fout, juist, shuffle(ALLE_EENHEDEN.slice()).map(function (nm) { return toon(getal, nm); }));
      return { soort: soort, sleutel: 'past|' + d.naam, ding: d, getal: getal, eh: beste.naam, ans: juist,
        options: keuzes(juist, fout.slice(0, 3)) };
    }
    var van = eenheid(z.stelsel, z.van), naar = eenheid(z.stelsel, z.naar);
    var uitkomst = z.n * van.in / naar.in;
    var sl = soort + '|' + z.n + z.van + '>' + z.naar;
    if (soort === 'typ') {
      return { soort: soort, sleutel: sl, stelsel: z.stelsel, n: z.n, van: z.van, naar: z.naar,
        uit: uitkomst, ans: String(uitkomst),
        typen: { scheider: '', hulp: 'Typ een getal in het vakje.',
          velden: [{ ph: '0', aria: 'Jouw antwoord', ant: uitkomst, max: 5 }] } };
    }
    return { soort: 'om', sleutel: sl, stelsel: z.stelsel, n: z.n, van: z.van, naar: z.naar,
      uit: uitkomst, ans: toon(uitkomst, z.naar),
      options: keuzes(toon(uitkomst, z.naar), afleidersOm(uitkomst, van, naar, z.n).map(function (k) {
        return toon(k, z.naar);
      })) };
  },
  teken: function (v) {
    if (v.soort === 'liter') return maatbeker(v.liter);
    if (v.soort === 'vergelijk') return ding(v.basis);
    if (v.soort === 'liniaal') return liniaal(v.mm);
    if (v.soort === 'past') return ding(v.ding);
    return trap(v.stelsel);
  },
  scherm: function (v) {
    if (v.soort === 'liniaal') return null;
    if (v.soort === 'past') return null;
    if (v.soort === 'vergelijk') return null;
    if (v.soort === 'liter') return null;
    return v.n + ' ' + v.van + ' = ? ' + v.naar;
  },
  vraag: function (v, nr) {
    var kop = 'Vraag ' + nr + ': ';
    if (v.soort === 'liter') return { titel: kop + 'hoeveel liter staat er in de beker?', sub: 'Lees de streep af.' };
    if (v.soort === 'vergelijk') {
      return { titel: kop + vergelijkZin(v.basis, v.richting),
        sub: 'Denk aan hoe groot het echt is, je moet niets meten.' };
    }
    if (v.soort === 'liniaal') return { titel: kop + 'hoe lang is de streep?', sub: 'Lees af op de liniaal.' };
    if (v.soort === 'past') {
      var werkwoord = { lengte: 'hoe lang is ', gewicht: 'hoeveel weegt ', inhoud: 'hoeveel kan er in ' }[v.ding.stelsel];
      return { titel: kop + werkwoord + v.ding.naam + '?', sub: 'Kies het getal met de juiste maat erbij.' };
    }
    if (v.soort === 'typ') return { titel: kop + 'hoeveel ' + v.naar + ' is ' + v.n + ' ' + v.van + '?', sub: 'Typ alleen het getal.' };
    return { titel: kop + 'hoeveel ' + v.naar + ' is ' + v.n + ' ' + v.van + '?' };
  },
  uitleg: function (v) {
    if (v.soort === 'liter') return 'De beker is gevuld tot ' + v.liter + ' liter.';
    if (v.soort === 'vergelijk') return v.basis.stelsel === 'inhoud'
      ? 'In ' + v.ans + ' kan ' + VERGELIJK.inhoud[v.richting] + ' dan in ' + v.basis.naam + '.'
      : hoofdletter(v.ans) + ' is ' + VERGELIJK[v.basis.stelsel][v.richting] + ' dan ' + v.basis.naam + '.';
    if (v.soort === 'liniaal') return 'De streep loopt tot ' + v.cm + ', dus ' + v.cm + ' cm. Dat is ' + v.mm + ' mm.';
    if (v.soort === 'past') return hoofdletter(v.ding.naam) + ' is ongeveer ' + v.getal + ' ' + v.eh + '.';
    var van = eenheid(v.stelsel, v.van), naar = eenheid(v.stelsel, v.naar);
    var stap = van.in > naar.in ? van.in / naar.in : naar.in / van.in;
    return van.in > naar.in
      ? 'Naar een kleinere maat maak je het getal ' + stap + ' keer groter: ' + v.n + ' × ' + stap + ' = ' + v.uit + '.'
      : 'Naar een grotere maat maak je het getal ' + stap + ' keer kleiner: ' + v.n + ' : ' + stap + ' = ' + v.uit + '.';
  },
  kort: function (v) {
    if (v.soort === 'liter') return 'Hoeveel liter is dit?';
    if (v.soort === 'vergelijk') return hoofdletter(vergelijkZin(v.basis, v.richting));
    if (v.soort === 'liniaal') return 'De streep op de liniaal';
    if (v.soort === 'past') return 'Hoeveel is ' + v.ding.naam + '?';
    return v.n + ' ' + v.van + ' in ' + v.naar;
  },
  test: function (check) {
    check(eenheid('lengte', 'cm').in === 10, 'een centimeter is tien millimeter');
    check(eenheid('inhoud', 'l').in === 1000, 'een liter is duizend milliliter');
    check(eenheid('gewicht', 'kg').in === 1000, 'een kilo is duizend gram');
    // elke omrekening moet in beide richtingen kloppen
    ['lengte', 'gewicht', 'inhoud'].forEach(function (st) {
      STELSELS[st].eenheden.forEach(function (a) {
        STELSELS[st].eenheden.forEach(function (b) {
          var heen = 100 * a.in / b.in, terug = heen * b.in / a.in;
          check(Math.round(terug) === 100, 'heen en terug tussen ' + a.naam + ' en ' + b.naam);
        });
      });
    });
    DINGEN.forEach(function (d) {
      check(d.maat > 0 && STELSELS[d.stelsel], d.naam + ' heeft een maat en een stelsel');
      check(liniaal(d.stelsel === 'lengte' ? d.maat : 100).indexOf('<svg') === 0, 'de liniaal tekent');
    });
    check(liniaal(150).indexOf('aria-label') > -1, 'de liniaal heeft een beschrijving');
    check(trap('lengte').indexOf('mm') > -1 && trap('lengte').indexOf('×10<') > -1, 'de maattrap toont de stapjes van tien');
    check(trap('gewicht').indexOf('×1000<') > -1 && trap('gewicht').indexOf('×10<') === -1, 'tussen kg en g staat ×1000');
    // de afleiders moeten de twee echte fouten bevatten: tien keer mis, of de verkeerde kant op
    var af = afleidersOm(300, eenheid('lengte', 'm'), eenheid('lengte', 'cm'), 3);
    check(af.indexOf(30) > -1 || af.indexOf(3000) > -1, 'een factor tien mis staat erbij (nu ' + af.join(', ') + ')');
    for (var n = 1; n <= 50; n++) {
      var lijst = afleidersOm(n, eenheid('lengte', 'm'), eenheid('lengte', 'cm'), n);
      check(lijst.length === 3, 'drie afleiders bij ' + n);
      check(lijst.indexOf(n) === -1, 'het juiste getal staat niet tussen de afleiders bij ' + n);
      check(lijst.every(function (k) { return k > 0 && k === Math.round(k); }), 'elke afleider is een heel positief getal bij ' + n);
    }
  }
};
