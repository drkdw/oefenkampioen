import { shuffle, pad2, keuzes, vulAan, vulRondom, positief, andere, reduced } from '../gereedschap.js';

  // "over" is standard across the whole Dutch language area; "na" is common in Belgium but
  // Taaladvies calls its status unclear, so for a test we pick "over".
  var WOORD = { 5: 'vijf', 10: 'tien' };
  function nextHour(h) { return h === 12 ? 1 : h + 1; }
  function prevHour(h) { return h === 1 ? 12 : h - 1; }
  function label(h, m) {
    if (m === 0) return h + ' uur';
    if (m === 15) return 'kwart over ' + h;
    if (m === 30) return 'half ' + nextHour(h);
    if (m === 45) return 'kwart voor ' + nextHour(h);
    if (m < 15) return WOORD[m] + ' over ' + h;
    if (m < 30) return WOORD[30 - m] + ' voor half ' + nextHour(h);
    if (m < 45) return WOORD[m - 30] + ' over half ' + nextHour(h);
    return WOORD[60 - m] + ' voor ' + nextHour(h);
  }
  function fmt24(h, m) { return pad2(h) + ':' + pad2(m); }
  function wijzerUur(u) { return u % 12 || 12; }

  // Six parts of the day as used in Belgium, according to Team Taaladvies. Middag stops
  // here at 14:00 so middag and namiddag do not overlap: a test cannot have two correct
  // answers. GRENZEN is the only place where the hours are defined.
  var DEELEN = ['Nacht', 'Ochtend', 'Voormiddag', 'Middag', 'Namiddag', 'Avond'];
  var GRENZEN = [0, 6, 9, 12, 14, 18];
  function deelVan(u) {
    for (var i = GRENZEN.length - 1; i >= 0; i--) if (u >= GRENZEN[i]) return DEELEN[i];
  }
  // Ochtend and voormiddag overlap in everyday speech, just like middag and namiddag.
  // They must never appear together as choices.
  var OVERLAP = { Ochtend: ['Voormiddag'], Voormiddag: ['Ochtend'], Middag: ['Namiddag'], Namiddag: ['Middag'] };
  var DUIDELIJK = {
    Nacht: [1, 2, 3, 4], Ochtend: [7, 8], Voormiddag: [10, 11],
    Middag: [12, 13], Namiddag: [15, 16, 17], Avond: [19, 20, 21]
  };
  // 's morgens covers ochtend and voormiddag, 's middags covers middag and namiddag: the marker
  // pins down the hour without giving away the part of the day being asked.
  function dagdeelTekst(u) {
    var marker = u < 6 ? '’s nachts' : u < 12 ? '’s morgens' : u < 18 ? '’s middags' : '’s avonds';
    return wijzerUur(u) + ' uur ' + marker;
  }
  function bereikTekst(deel) {
    var i = DEELEN.indexOf(deel);
    var tot = i + 1 < GRENZEN.length ? GRENZEN[i + 1] : 24;
    return deel + ' is ongeveer van ' + GRENZEN[i] + ' tot ' + tot + ' uur.';
  }

  var DUREN = [15, 30, 45, 60, 90, 120, 150, 180];
  var DUURTEKST = {
    15: 'een kwartier', 30: 'een half uur', 45: 'drie kwartier', 60: '1 uur',
    90: 'anderhalf uur', 120: '2 uur', 150: 'twee en een half uur', 180: '3 uur'
  };
  var ALLE_MIN = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  function minTekst(n) { return n + (n === 1 ? ' minuut' : ' minuten'); }
  function afleidersTijd(h, m, minuten) {
    var juist = label(h, m);
    // the mistakes 7 and 8 year olds really make
    var lijst = [];
    if (m > 0) lijst.push(label(h, 60 - m));                 // "over" and "voor" swapped
    lijst.push(m >= 20 ? label(prevHour(h), m)               // with "half", taking the hour that has already passed
                       : label(nextHour(h), m));             // with "kwart over", counting one hour too far
    lijst.push(label(m / 5 || 12, 0));                       // reading the minute hand as the hour hand
    lijst = lijst.filter(function (t, i, a) { return t !== juist && a.indexOf(t) === i; }).slice(0, 3);

    var cMin = (h % 12) * 60 + m, buren = [];
    for (var hh = 1; hh <= 12; hh++) {
      minuten.forEach(function (mm) {
        var L = label(hh, mm);
        if (L === juist) return;
        var d = Math.abs((hh % 12) * 60 + mm - cMin);
        buren.push({ L: L, d: Math.min(d, 720 - d) });
      });
    }
    buren.sort(function (a, b) { return a.d - b.d; });
    vulAan(lijst, juist, shuffle(buren.slice(0, 8)).map(function (b) { return b.L; }));
    for (var h2 = 1; lijst.length < 3 && h2 <= 12; h2++) vulAan(lijst, juist, [label(h2, m)]);
    return lijst.slice(0, 3);
  }

  /* the clock face */
  function gezicht() {
    var p = ['<circle cx="100" cy="100" r="96" fill="var(--card-2)" stroke="var(--line)" stroke-width="6"/>'];
    for (var i = 0; i < 60; i++) {
      var a = (i * 6 - 90) * Math.PI / 180, big = i % 5 === 0;
      var r1 = big ? 78 : 83, r2 = 88;
      p.push('<line x1="' + (100 + Math.cos(a) * r1).toFixed(1) + '" y1="' + (100 + Math.sin(a) * r1).toFixed(1) +
        '" x2="' + (100 + Math.cos(a) * r2).toFixed(1) + '" y2="' + (100 + Math.sin(a) * r2).toFixed(1) +
        '" stroke="' + (big ? 'var(--hand-hour)' : 'var(--line)') + '" stroke-width="' + (big ? 3.5 : 1.8) + '" stroke-linecap="round"/>');
    }
    for (var n = 1; n <= 12; n++) {
      var ang = (n * 30 - 90) * Math.PI / 180;
      p.push('<text x="' + (100 + Math.cos(ang) * 64).toFixed(1) + '" y="' + (100 + Math.sin(ang) * 64).toFixed(1) +
        '" text-anchor="middle" dominant-baseline="central" font-family="Fredoka, sans-serif" font-size="17" font-weight="600" fill="var(--ink)">' + n + '</text>');
    }
    return p.join('');
  }
  function spil() {
    return '<circle cx="100" cy="100" r="7" fill="var(--hand-hour)"/><circle cx="100" cy="100" r="3" fill="var(--card)"/>';
  }
  function statischeKlok(h, m) {
    var hd = (h % 12) * 30 + m * 0.5, md = m * 6;
    return '<svg class="clock klein" viewBox="0 0 200 200" role="img" aria-label="Klok op ' + label(h, m) + '">' +
      gezicht() +
      '<line x1="100" y1="100" x2="100" y2="58" stroke="var(--hand-hour)" stroke-width="9" stroke-linecap="round" transform="rotate(' + hd + ' 100 100)"/>' +
      '<line x1="100" y1="100" x2="100" y2="32" stroke="var(--hand-min)" stroke-width="6" stroke-linecap="round" transform="rotate(' + md + ' 100 100)"/>' +
      spil() + '</svg>';
  }
  // the hands spin one extra full turn, so you can see them move
  var hourDeg = 0, minDeg = 0;
  function setHands(h, m) {
    var targetH = (h % 12) * 30 + m * 0.5, targetM = m * 6;
    hourDeg += ((targetH - hourDeg) % 360 + 360) % 360 + (reduced ? 0 : 360);
    minDeg += ((targetM - minDeg) % 360 + 360) % 360 + (reduced ? 0 : 720);
    var hh = document.getElementById('handHour'), mm = document.getElementById('handMin');
    if (!hh || !mm) return;
    hh.style.transform = 'rotate(' + hourDeg + 'deg)';
    mm.style.transform = 'rotate(' + minDeg + 'deg)';
  }

export default {
  id: 'klok',
  ico: '🕓',
  naam: 'Klokkijken',
  tekst: 'Hele uren, kwartieren, dagdelen en tijdsduur.',
  top: 'Jij bent een echte klokkenkampioen!',
  hoofdstukken: [
    { leerjaar: 1, ico: '🐣', titel: 'Hele en halve uren', tekst: 'Vier uur, half vijf. Zo begint het.',
      badge: 'makkelijk', minuten: [0, 30], plan: { tijd: 10 } },
    { leerjaar: 2, ico: '🐥', titel: 'Kwartieren', tekst: 'Kwart over en kwart voor erbij.',
      badge: 'makkelijk', minuten: [0, 15, 30, 45], plan: { tijd: 10 } },
    { leerjaar: 2, ico: '🦊', titel: 'Van vijf tot vijf', tekst: 'Tien over half, vijf voor vier.',
      badge: 'gemiddeld', minuten: ALLE_MIN, plan: { tijd: 10 } },
    { leerjaar: 2, ico: '🌙', titel: 'Dag en nacht', tekst: 'Ochtend, voormiddag, middag, namiddag, avond, nacht.',
      badge: 'makkelijk', minuten: [0, 30], plan: { dagdeel: 7, tijd: 3 } },
    { leerjaar: 2, ico: '🏆', titel: 'Het eerste klokexamen', tekst: 'Kwartieren, vijf-tot-vijf en dagdelen door elkaar.',
      badge: 'gemiddeld', minuten: ALLE_MIN, plan: { tijd: 7, dagdeel: 3 } },
    { leerjaar: 3, ico: '📱', titel: 'Digitale klok', tekst: 'Lees de gsm, en typ zelf de tijd in.',
      badge: 'gemiddeld', minuten: [0, 15, 30, 45], plan: { lezen: 5, digitaal: 5 } },
    { leerjaar: 3, ico: '⏳', titel: 'Tijd berekenen', tekst: 'Hoe lang duurt het van de ene klok tot de andere?',
      badge: 'gemiddeld', minuten: [0, 30], plan: { duur: 10 } },
    { leerjaar: 3, ico: '🏆', titel: 'Het grote examen', tekst: 'Alles door elkaar. Durf je het aan?',
      badge: 'moeilijk', minuten: ALLE_MIN, plan: { tijd: 2, lezen: 2, digitaal: 2, dagdeel: 2, duur: 2 } },
    { leerjaar: 4, ico: '⏱️', titel: 'Seconden', tekst: 'Een minuut is 60 seconden.',
      badge: 'gemiddeld', minuten: [0, 30], plan: { seconden: 10 } }
  ],
  zaadjes: function (soort, h) {
    var out = [], u, m;
    if (soort === 'tijd') {
      // an analogue clock shows 1 to 12: 3:00 and 15:00 are the same question
      for (var hh = 1; hh <= 12; hh++) {
        for (m = 0; m < h.minuten.length; m++) out.push({ h: hh, m: h.minuten[m] });
      }
    } else if (soort === 'lezen' || soort === 'digitaal') {
      for (u = 0; u < 24; u++) {
        for (m = 0; m < h.minuten.length; m++) out.push({ u: u, m: h.minuten[m] });
      }
    } else if (soort === 'seconden') {
      for (var min = 1; min <= 10; min++) {
        out.push({ richting: 'naarSec', min: min });
        out.push({ richting: 'naarMin', min: min });
      }
    } else if (soort === 'dagdeel') {
      DEELEN.forEach(function (deel) {
        DUIDELIJK[deel].forEach(function (uu) { out.push({ d: deel, u: uu }); });
      });
    } else {
      for (u = 8; u <= 17; u++) {
        [0, 30].forEach(function (mm) {
          DUREN.forEach(function (duur) {
            if (u * 60 + mm + duur <= 21 * 60) out.push({ u: u, m: mm, duur: duur });
          });
        });
      }
    }
    return out;
  },
  maak: function (soort, z, h) {
    if (soort === 'tijd') {
      var j = label(z.h, z.m);
      return { soort: soort, sleutel: 'tijd|' + z.h + ':' + z.m, h: z.h, m: z.m, ans: j,
        options: keuzes(j, afleidersTijd(z.h, z.m, h.minuten)) };
    }
    if (soort === 'lezen') {
      var lh = wijzerUur(z.u), lj = label(lh, z.m);
      return { soort: soort, sleutel: 'lezen|' + z.u + ':' + z.m, u: z.u, h: lh, m: z.m, ans: lj,
        options: keuzes(lj, afleidersTijd(lh, z.m, h.minuten)) };
    }
    if (soort === 'digitaal') {
      return { soort: soort, sleutel: 'digitaal|' + z.u + ':' + z.m, u: z.u, h: wijzerUur(z.u), m: z.m,
        d: deelVan(z.u), ans: fmt24(z.u, z.m),
        typen: { scheider: ':', hulp: 'Vul twee vakjes in: de uren van 0 tot 23, de minuten van 0 tot 59.',
          velden: [{ ph: '00', aria: 'Uren', ant: z.u, pad: true }, { ph: '00', aria: 'Minuten', ant: z.m, pad: true }] } };
    }
    if (soort === 'dagdeel') {
      var verboden = OVERLAP[z.d] || [];
      var rest = andere(DEELEN.filter(function (d) { return verboden.indexOf(d) === -1; }), z.d, 3);
      return { soort: soort, sleutel: 'dagdeel|' + z.d + z.u, d: z.d, u: z.u, h: wijzerUur(z.u), m: 0,
        ans: z.d, tijd: dagdeelTekst(z.u), options: keuzes(z.d, rest) };
    }
    if (soort === 'seconden') {
      var naarSec = z.richting === 'naarSec', ans5 = naarSec ? z.min * 60 : z.min;
      var basis = naarSec ? z.min * 60 : z.min;
      // seconds to minutes gives small numbers, so the neighbours are whole minutes, not ±60
      var kern8 = naarSec ? [basis + 60, basis - 60, basis + 30, basis - 30, z.min * 100, z.min * 10]
        : [basis + 1, basis - 1, basis * 60, basis + 2, basis * 10];
      var fout11 = [];
      vulAan(fout11, ans5, kern8, positief);
      vulRondom(fout11, ans5, naarSec ? 5 : 1, positief);
      return { soort: soort, sleutel: 'seconden|' + z.richting + z.min, richting: z.richting, min: z.min,
        ans: String(ans5), options: keuzes(ans5, fout11.slice(0, 3)) };
    }
    var eind = z.u * 60 + z.m + z.duur;
    var jd = DUURTEKST[z.duur];
    var fout = andere(DUREN, z.duur, 3).map(function (d) { return DUURTEKST[d]; });
    return { soort: 'duur', sleutel: 'duur|' + z.u + ':' + z.m + '+' + z.duur, u: z.u, m: z.m, duur: z.duur,
      eu: Math.floor(eind / 60), em: eind % 60, ans: jd, options: keuzes(jd, fout) };
  },
  teken: function (v) {
    if (v.soort === 'lezen' || v.soort === 'seconden') return '';
    if (v.soort === 'duur') {
      return statischeKlok(wijzerUur(v.u), v.m) + '<span class="pijl">➡️</span>' +
        statischeKlok(wijzerUur(v.eu), v.em);
    }
    return '<svg class="clock" viewBox="0 0 200 200" role="img" aria-label="Analoge klok" id="clock">' +
      gezicht() +
      '<line id="handHour" class="hand" x1="100" y1="100" x2="100" y2="58" stroke="var(--hand-hour)" stroke-width="9" stroke-linecap="round"/>' +
      '<line id="handMin" class="hand" x1="100" y1="100" x2="100" y2="32" stroke="var(--hand-min)" stroke-width="6" stroke-linecap="round"/>' +
      spil() + '</svg>';
  },
  na: function (v) {
    if (v.soort === 'lezen' || v.soort === 'duur' || v.soort === 'seconden') return;
    setHands(v.h, v.m);
    var c = document.getElementById('clock');
    if (c) c.setAttribute('aria-label', 'Klok met de wijzers op ' + label(v.h, v.m));
  },
  scherm: function (v) { return v.soort === 'lezen' ? fmt24(v.u, v.m) : null; },
  // seconden has no clock and no small screen, only the question sentence itself
  vraag: function (v, nr) {
    var kop = 'Vraag ' + nr + ': ';
    if (v.soort === 'tijd') return { titel: kop + 'hoe laat is het?' };
    if (v.soort === 'lezen') return { titel: kop + 'hoe zeg je deze tijd?', sub: 'Dit is wat je op een gsm of tablet ziet.' };
    if (v.soort === 'digitaal') {
      return { titel: kop + 'de klok staat op ' + label(v.h, v.m) + '.',
        sub: 'Het is ' + v.d.toLowerCase() + '. Welke digitale tijd zie je op een gsm of tablet?' };
    }
    if (v.soort === 'dagdeel') return { titel: kop + 'in welk deel van de dag valt ' + v.tijd + '?', sub: 'Kies het juiste dagdeel.' };
    if (v.soort === 'seconden') {
      return v.richting === 'naarSec'
        ? { titel: kop + 'hoeveel seconden zijn er in ' + minTekst(v.min) + '?', sub: 'Een minuut is 60 seconden.' }
        : { titel: kop + 'hoeveel minuten zijn ' + (v.min * 60) + ' seconden?', sub: 'Deel door 60.' };
    }
    return { titel: kop + 'hoe lang duurt het van ' + label(wijzerUur(v.u), v.m) + ' tot ' + label(wijzerUur(v.eu), v.em) + '?' };
  },
  uitleg: function (v) {
    if (v.soort === 'tijd') {
      // past the hour the small hand is already on its way to the next number
      var klein = v.m ? 'tussen ' + v.h + ' en ' + (v.h % 12 + 1) : 'op ' + v.h;
      return 'De kleine wijzer staat ' + klein + ', de grote op ' + (v.m / 5 || 12) + '.';
    }
    if (v.soort === 'lezen') return fmt24(v.u, v.m) + ' lees je als ' + v.ans + '.';
    if (v.soort === 'digitaal') {
      return v.u > 12 ? 'Na de middag tel je 12 bij het uur: ' + v.h + ' + 12 = ' + v.u + '.'
        : v.u === 12 ? 'Om 12 uur ’s middags begin je niet opnieuw te tellen, het uur blijft 12.'
        : v.u === 0 ? '12 uur ’s nachts is 00:00, het begin van de dag.'
        : v.u < 10 ? 'Voor de middag blijft het uur hetzelfde, je zet er alleen een nul voor.'
        : 'Voor de middag blijft het uur gewoon hetzelfde.';
    }
    if (v.soort === 'dagdeel') return bereikTekst(v.d);
    if (v.soort === 'seconden') {
      return v.richting === 'naarSec' ? v.min + ' × 60 = ' + (v.min * 60) + ' seconden.'
        : (v.min * 60) + ' : 60 = ' + minTekst(v.min) + '.';
    }
    return 'Tel verder vanaf ' + label(wijzerUur(v.u), v.m) + ' tot je bij ' + label(wijzerUur(v.eu), v.em) + ' bent.';
  },
  kort: function (v) {
    if (v.soort === 'tijd') return 'De klok stond op ' + fmt24(v.h, v.m).replace(/^0/, '');
    if (v.soort === 'lezen') return 'Op de gsm stond ' + fmt24(v.u, v.m);
    if (v.soort === 'digitaal') return label(v.h, v.m) + ' in de ' + v.d.toLowerCase();
    if (v.soort === 'dagdeel') return 'In welk deel van de dag valt ' + v.tijd + '?';
    if (v.soort === 'seconden') return v.richting === 'naarSec' ? minTekst(v.min) + ' in seconden' : (v.min * 60) + ' seconden in minuten';
    return 'Van ' + label(wijzerUur(v.u), v.m) + ' tot ' + label(wijzerUur(v.eu), v.em);
  },
  test: function (check) {
    check(label(3, 0) === '3 uur', 'heel uur');
    check(label(3, 5) === 'vijf over 3', 'vijf over');
    check(label(3, 15) === 'kwart over 3', 'kwart over');
    check(label(3, 20) === 'tien voor half 4', 'tien voor half');
    check(label(3, 30) === 'half 4', 'half');
    check(label(3, 40) === 'tien over half 4', 'tien over half');
    check(label(3, 45) === 'kwart voor 4', 'kwart voor');
    check(label(3, 55) === 'vijf voor 4', 'vijf voor');
    check(label(12, 30) === 'half 1', 'overgang van 12 naar 1');
    check(label(11, 55) === 'vijf voor 12', 'vijf voor 12');
    for (var th = 1; th <= 12; th++) {
      ALLE_MIN.forEach(function (tm) {
        var L = label(th, tm);
        check(L.indexOf('undefined') === -1, 'benaming van ' + th + ':' + tm);
        check(L.indexOf(' na ') === -1, 'geen "na" meer in ' + L);
      });
    }
    check(deelVan(0) === 'Nacht' && deelVan(5) === 'Nacht', 'nacht is 0 tot 6');
    check(deelVan(6) === 'Ochtend' && deelVan(8) === 'Ochtend', 'ochtend is 6 tot 9');
    check(deelVan(9) === 'Voormiddag' && deelVan(11) === 'Voormiddag', 'voormiddag is 9 tot 12');
    check(deelVan(12) === 'Middag' && deelVan(13) === 'Middag', 'middag is 12 tot 14');
    check(deelVan(14) === 'Namiddag' && deelVan(17) === 'Namiddag', 'namiddag is 14 tot 18');
    check(deelVan(18) === 'Avond' && deelVan(23) === 'Avond', 'avond is 18 tot 24');
    var totaal = 0;
    DEELEN.forEach(function (nm) {
      var uren = [];
      for (var cu = 0; cu < 24; cu++) if (deelVan(cu) === nm) uren.push(cu);
      totaal += uren.length;
      var standen = uren.map(wijzerUur);
      check(standen.filter(function (x, i) { return standen.indexOf(x) === i; }).length === standen.length,
        'geen dubbele wijzerstand binnen ' + nm);
      DUIDELIJK[nm].forEach(function (u) { check(deelVan(u) === nm, u + ' uur hoort niet bij ' + nm); });
    });
    check(totaal === 24, 'de zes dagdelen dekken samen 24 uur');
    var echt = DEELEN.filter(function (nm) {
      return DUIDELIJK[nm].every(function (u) { return dagdeelTekst(u).indexOf(nm.toLowerCase()) === -1; });
    });
    check(echt.length >= 3, 'minstens drie dagdelen vragen echt denkwerk (nu ' + echt.join(', ') + ')');
    check(fmt24(15, 30) === '15:30' && fmt24(3, 5) === '03:05', '24-uursnotatie');
    check(wijzerUur(19) === 7 && wijzerUur(12) === 12 && wijzerUur(0) === 12, 'wijzerstand bij een uur van de dag');
    DUREN.forEach(function (d) { check(DUURTEKST[d], 'elke duur heeft een tekst: ' + d); });
    var proef = function (h, m, moet) {
      var lijst = afleidersTijd(h, m, ALLE_MIN);
      check(lijst.indexOf(moet) > -1, 'afleider "' + moet + '" ontbreekt bij ' + h + ':' + m);
    };
    proef(3, 45, 'kwart over 3');
    proef(3, 15, 'kwart voor 4');
    proef(3, 30, 'half 3');
    proef(3, 0, '12 uur');
  }
};
