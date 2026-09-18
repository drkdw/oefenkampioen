import { keuzes, vulAan, positief, vulRondom } from '../gereedschap.js';

  // de brug: van 47 spring je eerst naar 50, dan pas verder
  function sprong(a, b, plus) {
    var tussen = plus ? Math.ceil((a + 1) / 10) * 10 : Math.floor((a - 1) / 10) * 10;
    return { tussen: tussen, eerste: Math.abs(tussen - a), tweede: Math.abs((plus ? a + b : a - b) - tussen) };
  }

  /* een getallenlijn met de twee sprongen erop */
  function lijn(a, b, plus, labels) {
    var uit = plus ? a + b : a - b;
    var laag = Math.min(a, uit), hoog = Math.max(a, uit);
    // de lijn begint en eindigt op een rond getal, anders staan er streepjes op 59 en 74
    // net genoeg lucht rond de sprong, anders wordt het boogje een speldenprik op de lijn
    var marge = Math.max(5, b);
    var van = Math.max(0, Math.floor((laag - marge) / 10) * 10);
    var tot = Math.ceil((hoog + marge) / 10) * 10;
    var span = tot - van;
    var stap = 100;
    [5, 10, 20, 50].forEach(function (k) { if (stap === 100 && span / k <= 6) stap = k; });
    var breed = 330, hoogte = 96;
    var x = function (n) { return ((n - van) / (tot - van) * (breed - 20) + 10).toFixed(1); };
    var s2 = sprong(a, b, plus);
    var p = ['<line x1="6" y1="62" x2="' + (breed - 6) + '" y2="62" stroke="var(--line)" stroke-width="4" stroke-linecap="round"/>'];
    var streepjes = [];
    for (var n2 = van; n2 <= tot; n2 += stap) streepjes.push(n2);
    streepjes.forEach(function (n) {
      p.push('<line x1="' + x(n) + '" y1="56" x2="' + x(n) + '" y2="68" stroke="var(--ink-soft)" stroke-width="2"/>');
      p.push('<text x="' + x(n) + '" y="84" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="11" fill="var(--ink-soft)">' + n + '</text>');
    });
    // de twee boogjes van de brug
    [[a, s2.tussen], [s2.tussen, uit]].forEach(function (paar, i) {
      var x1 = Number(x(paar[0])), x2 = Number(x(paar[1]));
      if (x1 === x2) return;
      p.push('<path d="M' + x1 + ' 60 Q' + ((x1 + x2) / 2) + ' ' + (i ? 16 : 30) + ' ' + x2 + ' 60" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>');
      if (labels) {
        p.push('<text x="' + ((x1 + x2) / 2) + '" y="' + (i ? 14 : 28) + '" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="12" fill="var(--accent)">' +
          (plus ? '+' : '\u2212') + (i ? s2.tweede : s2.eerste) + '</text>');
      }
    });
    p.push('<circle cx="' + x(a) + '" cy="60" r="5" fill="var(--hand-hour)"/>');
    p.push('<text x="' + x(a) + '" y="50" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="13" fill="var(--ink)">' + a + '</text>');
    return '<svg viewBox="0 0 ' + breed + ' ' + hoogte + '" width="100%" style="max-width:330px" role="img" aria-label="Een getallenlijn met een sprong vanaf ' + a + '">' +
      p.join('') + '</svg>';
  }

  // de fouten die kinderen bij bruggetjes echt maken
  function afleiders(a, b, plus) {
    var juist = plus ? a + b : a - b, lijst = [], kern = [];
    kern.push(plus ? juist - 10 : juist + 10);   // het onthouden vergeten
    kern.push(plus ? juist + 10 : juist - 10);   // een tiental te veel
    kern.push(plus ? a - b : a + b);             // de verkeerde bewerking
    kern.push(juist - 1);
    kern.push(juist + 1);
    kern.push(plus ? juist - 100 : juist + 100); // het honderdtal vergeten
    vulAan(lijst, juist, kern, function (k) { return k > 0 && k < 1000; });
    vulRondom(lijst, juist, 1, function (k) { return k > 0 && k < 1000; });
    return lijst.slice(0, 3);
  }

export default {
  id: 'brug',
  ico: '\uD83C\uDF09',
  naam: 'Bruggen bouwen',
  tekst: 'Optellen en aftrekken tot 1000, over het tiental heen.',
  top: 'Jij springt over elk tiental!',
  hoofdstukken: [
    { leerjaar: 2, ico: '\uD83E\uDDF1', titel: 'Tot 100 erbij', tekst: '47 + 8. Eerst naar 50, dan verder.',
      badge: 'makkelijk', tot: 100, plus: true, stap: [3, 9], plan: { som: 10 } },
    { leerjaar: 2, ico: '\uD83E\uDDF1', titel: 'Tot 100 eraf', tekst: '52 \u2212 7. Eerst naar 50, dan verder.',
      badge: 'makkelijk', tot: 100, plus: false, stap: [3, 9], plan: { som: 10 } },
    { leerjaar: 3, ico: '\uD83C\uDF09', titel: 'Tot 1000 erbij', tekst: '346 + 8, en 346 + 40.',
      badge: 'gemiddeld', tot: 1000, plus: true, stap: [3, 9], tientallen: true, plan: { som: 10 } },
    { leerjaar: 3, ico: '\uD83C\uDF09', titel: 'Tot 1000 eraf', tekst: '412 \u2212 7, en 412 \u2212 30.',
      badge: 'gemiddeld', tot: 1000, plus: false, stap: [3, 9], tientallen: true, plan: { som: 10 } },
    { leerjaar: 3, ico: '\uD83D\uDD0D', titel: 'Wat ontbreekt er?', tekst: '47 + ? = 55.',
      badge: 'moeilijk', tot: 100, plus: true, stap: [3, 9], plan: { gat: 10 } },
    { leerjaar: 3, ico: '\u2328\uFE0F', titel: 'Zelf uitrekenen', tekst: 'Geen keuzes. Typ het antwoord zelf in.',
      badge: 'moeilijk', tot: 1000, plus: true, stap: [3, 9], tientallen: true, plan: { typ: 10 } },
    { leerjaar: 3, ico: '\uD83C\uDFC6', titel: 'Het grote rekenexamen', tekst: 'Erbij, eraf en het gat door elkaar.',
      badge: 'moeilijk', tot: 1000, plus: true, stap: [3, 9], tientallen: true, plan: { som: 5, gat: 3, typ: 2 } }
  ],
  zaadjes: function (soort, h) {
    var uit = [], a, b;
    var ondergrens = h.tot === 100 ? 11 : 101;
    for (a = ondergrens; a < h.tot; a += h.tot === 100 ? 1 : 7) {
      var e = a % 10;
      if (e === 0) continue;                       // zonder eenheden valt er geen brug te bouwen
      for (b = h.stap[0]; b <= h.stap[1]; b++) {
        var plus = soort === 'som' || soort === 'gat' || soort === 'typ' ? h.plus : h.plus;
        // alleen echte bruggen: het antwoord moet over het tiental heen
        if (plus && e + b <= 10) continue;
        if (!plus && e - b >= 0) continue;
        var uitkomst = plus ? a + b : a - b;
        if (uitkomst <= 0 || uitkomst >= h.tot) continue;
        uit.push({ a: a, b: b, plus: plus });
        if (h.tientallen && b * 10 < 100) {
          var t = b * 10, tu = plus ? a + t : a - t;
          var tien = Math.floor(a / 10) % 10;
          // ook over het honderdtal springen, met hele tientallen
          if (tu > 0 && tu < h.tot && (plus ? tien + b >= 10 : tien - b < 0)) {
            uit.push({ a: a, b: t, plus: plus });
          }
        }
      }
    }
    return uit;
  },
  maak: function (soort, z) {
    var uitkomst = z.plus ? z.a + z.b : z.a - z.b;
    var sl = soort + '|' + z.a + (z.plus ? '+' : '-') + z.b;
    if (soort === 'gat') {
      // het ontbrekende getal is de sprong zelf
      var fout = [];
      vulAan(fout, z.b, [z.b + 1, z.b - 1, z.b + 10, z.b - 10, z.b + 2], positief);
      return { soort: soort, sleutel: sl, a: z.a, b: z.b, plus: z.plus, uit: uitkomst, ans: String(z.b),
        options: keuzes(z.b, fout) };
    }
    if (soort === 'typ') {
      return { soort: soort, sleutel: sl, a: z.a, b: z.b, plus: z.plus, uit: uitkomst, ans: String(uitkomst),
        typen: { scheider: '', hulp: 'Typ een getal in het vakje.',
          velden: [{ ph: '0', aria: 'Jouw antwoord', ant: uitkomst, max: 4 }] } };
    }
    return { soort: 'som', sleutel: sl, a: z.a, b: z.b, plus: z.plus, uit: uitkomst, ans: String(uitkomst),
      options: keuzes(uitkomst, afleiders(z.a, z.b, z.plus)) };
  },
  // bij "47 + ? = 55" zijn de twee sprongen samen het antwoord, dus die blijven leeg
  teken: function (v) { return lijn(v.a, v.b, v.plus, v.soort !== 'gat'); },
  scherm: function (v) {
    var teken = v.plus ? ' + ' : ' \u2212 ';
    if (v.soort === 'gat') return v.a + teken + '? = ' + v.uit;
    return v.a + teken + v.b;
  },
  vraag: function (v, nr) {
    var kop = 'Vraag ' + nr + ': ';
    if (v.soort === 'gat') return { titel: kop + 'welk getal ontbreekt?', sub: 'Hoe groot is de sprong?' };
    if (v.soort === 'typ') return { titel: kop + 'hoeveel is ' + v.a + (v.plus ? ' plus ' : ' min ') + v.b + '?', sub: 'Typ alleen het getal.' };
    return { titel: kop + 'hoeveel is ' + v.a + (v.plus ? ' plus ' : ' min ') + v.b + '?' };
  },
  uitleg: function (v) {
    var s3 = sprong(v.a, v.b, v.plus);
    var teken = v.plus ? '+' : '\u2212';
    return 'Spring eerst naar ' + s3.tussen + ' (' + teken + s3.eerste + '), dan nog ' + teken + s3.tweede +
      ' tot ' + v.uit + '.';
  },
  kort: function (v) {
    var teken = v.plus ? ' + ' : ' \u2212 ';
    return v.soort === 'gat' ? v.a + teken + '? = ' + v.uit : v.a + teken + v.b;
  },
  test: function (check) {
    // de brug moet altijd op een tiental uitkomen en samen de hele sprong zijn
    [[47, 8, true], [52, 7, false], [346, 8, true], [412, 7, false], [95, 6, true], [103, 5, false]].forEach(function (g) {
      var a = g[0], b = g[1], plus = g[2], s4 = sprong(a, b, plus);
      check(s4.tussen % 10 === 0, 'de tussenstap is een tiental bij ' + a + (plus ? '+' : '-') + b);
      check(s4.eerste + s4.tweede === b, 'de twee sprongen samen zijn ' + b + ' bij ' + a);
      check(s4.eerste > 0, 'de eerste sprong is niet leeg bij ' + a);
      check(plus ? s4.tussen > a : s4.tussen < a, 'de tussenstap ligt de goede kant op bij ' + a);
    });
    check(sprong(47, 8, true).tussen === 50, '47 + 8 gaat via 50');
    check(lijn(69, 9, true, true).indexOf('>59<') === -1, 'de getallenlijn zet geen streepje op een los getal');
    check(lijn(69, 9, true, true).indexOf('>60<') > -1, 'de getallenlijn zet streepjes op ronde getallen');
    check(sprong(52, 7, false).tussen === 50, '52 - 7 gaat via 50');
    for (var a2 = 11; a2 < 990; a2 += 7) {
      if (a2 % 10 === 0) continue;
      for (var b2 = 3; b2 <= 9; b2++) {
        [true, false].forEach(function (plus) {
          var e = a2 % 10;
          if (plus ? e + b2 <= 10 : e - b2 >= 0) return;
          var uitkomst = plus ? a2 + b2 : a2 - b2;
          if (uitkomst <= 0 || uitkomst >= 1000) return;
          var s5 = sprong(a2, b2, plus);
          check(s5.eerste + s5.tweede === b2, 'de brug klopt bij ' + a2 + (plus ? '+' : '-') + b2);
          check(s5.tweede > 0, 'de tweede sprong is niet leeg bij ' + a2 + (plus ? '+' : '-') + b2);
          var af = afleiders(a2, b2, plus);
          check(af.length === 3, 'drie afleiders bij ' + a2 + (plus ? '+' : '-') + b2);
          check(af.indexOf(uitkomst) === -1, 'het juiste antwoord staat er niet tussen bij ' + a2);
          check(af.every(function (k) { return k > 0 && k < 1000; }), 'elke afleider blijft tussen 0 en 1000 bij ' + a2);
          check(lijn(a2, b2, plus, true).indexOf('NaN') === -1, 'de getallenlijn tekent bij ' + a2);
          var s6 = sprong(a2, b2, plus);
          check(lijn(a2, b2, plus, false).indexOf('>' + (plus ? '+' : '\u2212') + s6.eerste + '<') === -1,
            'zonder labels staat de sprong er niet bij, bij ' + a2);
        });
      }
    }
  }
};
