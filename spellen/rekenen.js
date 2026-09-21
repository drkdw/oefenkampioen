import { keuzes, vulAan, positief, vulRondom, andere } from '../gereedschap.js';

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
          (plus ? '+' : '−') + (i ? s2.tweede : s2.eerste) + '</text>');
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

  /* --------- leerjaar 1: nog geen brug, nog geen honderdtal --------- */

  // een rij van tien vakjes: de gekende kant gekleurd, de andere kant een vraagteken.
  // vakjes voorbij het totaal blijven leeg, zo blijft "splitsen tot 6" ook echt zes vakjes tonen
  function tienFrame(totaal, deel1) {
    var p = '';
    for (var i = 0; i < 10; i++) {
      var actief = i < totaal, gekend = i < deel1;
      var kleur = !actief ? 'transparent' : gekend ? 'var(--accent)' : 'var(--card-2)';
      var rand = actief ? 'var(--line)' : 'transparent';
      p += '<div style="width:28px;height:28px;border-radius:8px;background:' + kleur + ';border:2px solid ' + rand +
        ';display:flex;align-items:center;justify-content:center;font-family:Fredoka,sans-serif;font-size:15px;color:var(--ink-soft)">' +
        (actief && !gekend ? '?' : '') + '</div>';
    }
    return '<div style="display:grid;grid-template-columns:repeat(5,28px);gap:6px;justify-content:center" ' +
      'role="img" aria-label="' + deel1 + ' van de ' + totaal + ' vakjes zijn gekleurd">' + p + '</div>';
  }

  // fouten die kinderen bij een splitsing echt maken: het andere deel nemen, of ernaast tellen
  function afleidersSplits(deel1, totaal) {
    var deel2 = totaal - deel1, lijst = [];
    vulAan(lijst, deel2, [deel1, deel2 + 1, deel2 - 1, totaal], positief);
    vulRondom(lijst, deel2, 1, positief);
    return lijst.slice(0, 3);
  }

  // een rechte getallenlijn met één sprong: voor tot 10 en tot 20 is er geen brug om te tekenen
  function lijnRecht(a, b, plus, tot) {
    var breed = 260, hoogte = 78;
    var x = function (n) { return (n / tot * (breed - 20) + 10).toFixed(1); };
    var uit = plus ? a + b : a - b;
    var p = ['<line x1="6" y1="50" x2="' + (breed - 6) + '" y2="50" stroke="var(--line)" stroke-width="4" stroke-linecap="round"/>'];
    var stap = tot <= 10 ? 1 : 2;
    for (var n = 0; n <= tot; n += stap) {
      p.push('<line x1="' + x(n) + '" y1="44" x2="' + x(n) + '" y2="56" stroke="var(--ink-soft)" stroke-width="2"/>');
      p.push('<text x="' + x(n) + '" y="72" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="11" fill="var(--ink-soft)">' + n + '</text>');
    }
    var x1 = Number(x(a)), x2 = Number(x(uit));
    p.push('<path d="M' + x1 + ' 48 Q' + ((x1 + x2) / 2) + ' 20 ' + x2 + ' 48" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>');
    p.push('<circle cx="' + x1 + '" cy="48" r="5" fill="var(--hand-hour)"/>');
    p.push('<text x="' + x1 + '" y="36" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="13" fill="var(--ink)">' + a + '</text>');
    return '<svg viewBox="0 0 ' + breed + ' ' + hoogte + '" width="100%" style="max-width:260px" role="img" ' +
      'aria-label="Een getallenlijn van 0 tot ' + tot + ' met een sprong vanaf ' + a + '">' + p.join('') + '</svg>';
  }

  // geen brug nodig, dus geen "tiental vergeten"; wel de verkeerde bewerking, of net verkeerd.
  // vanaf de tientallen komt er een derde fout bij: het tiental van 12 + 5 = 17 gewoon vergeten
  function afleidersVlot(a, b, plus, tot) {
    var juist = plus ? a + b : a - b, lijst = [], kern = [plus ? a - b : a + b, juist + 1, juist - 1];
    if (a >= 10) kern.push(plus ? juist - 10 : juist + 10);
    vulAan(lijst, juist, kern, function (k) { return k >= 0 && k <= tot; });
    vulRondom(lijst, juist, 1, function (k) { return k >= 0 && k <= tot; });
    return lijst.slice(0, 3);
  }

  // twee getallen op een rij, voor tientallen/eenheden en verdubbelen/halveren
  function getalDuo(a, b) {
    return '<div style="display:flex;gap:14px;justify-content:center;align-items:center">' +
      [a, b].map(function (n) {
        return '<div style="display:flex;align-items:center;justify-content:center;font-family:Fredoka,sans-serif;' +
          'font-size:48px;color:var(--ink);background:var(--card-2);border-radius:18px;width:96px;height:96px">' +
          n + '</div>';
      }).join('<span style="font-size:28px;color:var(--ink-soft);align-self:center">→</span>') + '</div>';
  }
  /* --------- leerjaar 4: cijferend rekenen tot 10 000 --------- */

  // twee getallen in kolomvorm, rechts uitgelijnd zoals op papier. Geen tussenstapjes: die
  // rekent het kind zelf uit, dit toont enkel de opstelling zoals in het schrift
  function kolom(a, b, teken) {
    return '<div style="font-family:\'Courier New\',monospace;font-size:26px;color:var(--ink);' +
      'background:var(--card-2);border-radius:14px;padding:14px 22px;display:inline-block;text-align:right">' +
      '<div>' + a + '</div><div>' + teken + ' ' + b + '</div>' +
      '<div style="border-top:3px solid var(--ink-soft);margin-top:6px;padding-top:6px">&nbsp;</div></div>';
  }
  function afleidersCijfer(juist, kern) {
    var lijst = [];
    vulAan(lijst, juist, kern, positief);
    vulRondom(lijst, juist, Math.max(1, Math.round(juist / 50)), positief);
    return lijst.slice(0, 3);
  }

  function getalTegel(n) {
    return '<div style="display:flex;align-items:center;justify-content:center;font-family:Fredoka,sans-serif;' +
      'font-size:56px;color:var(--ink);background:var(--card-2);border-radius:20px;width:112px;height:112px;margin:0 auto">' +
      n + '</div>';
  }

  var ORDINALEN = ['eerste', 'tweede', 'derde', 'vierde', 'vijfde', 'zesde'];
  var DIERTJES = ['🐶', '🐱', '🐰', '🐻', '🐸', '🦁'];
  function rijTekening(lengte, plek) {
    var p = '';
    for (var i = 0; i < lengte; i++) {
      var groot = i === plek;
      p += '<span style="font-size:' + (groot ? '46px' : '30px') + ';' +
        (groot ? 'border:3px solid var(--accent);border-radius:14px;padding:4px;line-height:1' : 'padding:4px') +
        '">' + DIERTJES[i] + '</span>';
    }
    return '<div style="display:flex;gap:6px;justify-content:center;align-items:center" role="img" ' +
      'aria-label="Een rij van ' + lengte + ' dieren, het dier op de ' + ORDINALEN[plek] + ' plaats heeft een randje">' + p + '</div>';
  }

export default {
  id: 'brug',
  ico: '🌉',
  naam: 'Bruggen bouwen',
  tekst: 'Splitsen, tellen, en optellen en aftrekken tot 1000, over het tiental heen.',
  top: 'Jij springt over elk tiental!',
  hoofdstukken: [
    { leerjaar: 1, ico: '🧩', titel: 'Splitsen tot 10', tekst: '3 en ? samen zijn 8. Welk stukje ontbreekt?',
      badge: 'makkelijk', plan: { splits: 10 } },
    { leerjaar: 1, ico: '🔢', titel: 'Tot 10 erbij en eraf', tekst: '3 + 4, of 9 − 5. Geen brug nodig.',
      badge: 'makkelijk', tot: 10, plan: { vlot: 10 } },
    { leerjaar: 1, ico: '🔢', titel: 'Tot 20, zonder brug', tekst: '12 + 5, of 18 − 6. Blijft binnen hetzelfde tiental.',
      badge: 'gemiddeld', tot: 20, plan: { vlot: 10 } },
    { leerjaar: 1, ico: '🔁', titel: 'Tellen en rangtelwoorden', tekst: 'Wat komt er na 14? En wie staat op de derde plaats?',
      badge: 'makkelijk', plan: { volgend: 6, rang: 4 } },
    { leerjaar: 1, ico: '🧱', titel: 'Tot 20 erbij, met brug', tekst: '8 + 7. Eerst naar 10, dan verder.',
      badge: 'gemiddeld', tot: 20, plus: true, stap: [2, 9], plan: { som: 10 } },
    { leerjaar: 1, ico: '🧱', titel: 'Tot 20 eraf, met brug', tekst: '15 − 7. Eerst naar 10, dan verder.',
      badge: 'gemiddeld', tot: 20, plus: false, stap: [2, 9], plan: { som: 10 } },
    { leerjaar: 1, ico: '🏆', titel: 'Het eerste rekenexamen', tekst: 'Splitsen, tellen, erbij en eraf, en de brug tot 20.',
      badge: 'gemiddeld', tot: 20, plus: true, stap: [2, 9], plan: { splits: 2, vlot: 2, som: 2, volgend: 2, rang: 2 } },
    { leerjaar: 2, ico: '💯', titel: 'Getallen tot 100', tekst: '47 is 4 tientallen en 7 eenheden.',
      badge: 'makkelijk', plan: { tientallen: 5, eenheden: 5 } },
    { leerjaar: 2, ico: '👯', titel: 'Verdubbelen en halveren', tekst: 'Het dubbele van 6, of de helft van 16.',
      badge: 'makkelijk', plan: { dubbel: 5, helft: 5 } },
    { leerjaar: 2, ico: '🎲', titel: 'Even of oneven?', tekst: 'Welk van deze vier getallen is even?',
      badge: 'makkelijk', plan: { paar: 10 } },
    { leerjaar: 2, ico: '🔄', titel: 'Het is-gelijk-teken achterstevoren', tekst: '10 = 8 + ?. Het teken werkt ook omgekeerd.',
      badge: 'gemiddeld', plan: { omgekeerd: 10 } },
    { leerjaar: 2, ico: '🧱', titel: 'Tot 100 erbij', tekst: '47 + 8. Eerst naar 50, dan verder.',
      badge: 'makkelijk', tot: 100, plus: true, stap: [3, 9], plan: { som: 10 } },
    { leerjaar: 2, ico: '🧱', titel: 'Tot 100 eraf', tekst: '52 − 7. Eerst naar 50, dan verder.',
      badge: 'makkelijk', tot: 100, plus: false, stap: [3, 9], plan: { som: 10 } },
    { leerjaar: 2, ico: '🏆', titel: 'Het tweede rekenexamen', tekst: 'Tientallen, verdubbelen, even of oneven, en de brug tot 100.',
      badge: 'gemiddeld', tot: 100, plus: true, stap: [3, 9], plan: { tientallen: 2, dubbel: 2, paar: 2, omgekeerd: 2, som: 2 } },
    { leerjaar: 3, ico: '🌉', titel: 'Tot 1000 erbij', tekst: '346 + 8, en 346 + 40.',
      badge: 'gemiddeld', tot: 1000, plus: true, stap: [3, 9], tientallen: true, plan: { som: 10 } },
    { leerjaar: 3, ico: '🌉', titel: 'Tot 1000 eraf', tekst: '412 − 7, en 412 − 30.',
      badge: 'gemiddeld', tot: 1000, plus: false, stap: [3, 9], tientallen: true, plan: { som: 10 } },
    { leerjaar: 3, ico: '🔍', titel: 'Wat ontbreekt er?', tekst: '47 + ? = 55.',
      badge: 'moeilijk', tot: 100, plus: true, stap: [3, 9], plan: { gat: 10 } },
    { leerjaar: 3, ico: '⌨️', titel: 'Zelf uitrekenen', tekst: 'Geen keuzes. Typ het antwoord zelf in.',
      badge: 'moeilijk', tot: 1000, plus: true, stap: [3, 9], tientallen: true, plan: { typ: 10 } },
    { leerjaar: 3, ico: '🏆', titel: 'Het grote rekenexamen', tekst: 'Erbij, eraf en het gat door elkaar.',
      badge: 'moeilijk', tot: 1000, plus: true, stap: [3, 9], tientallen: true, plan: { som: 5, gat: 3, typ: 2 } },
    { leerjaar: 4, ico: '🔟', titel: 'Getallen tot 10 000', tekst: '4725 is 4 duizendtallen en 7 honderdtallen.',
      badge: 'gemiddeld', plan: { duizendtal: 5, honderdtal: 5 } },
    { leerjaar: 4, ico: '➕', titel: 'Cijferend optellen', tekst: 'Twee getallen onder elkaar zetten en optellen.',
      badge: 'gemiddeld', plan: { cijferPlus: 10 } },
    { leerjaar: 4, ico: '➖', titel: 'Cijferend aftrekken', tekst: 'Twee getallen onder elkaar zetten en aftrekken.',
      badge: 'gemiddeld', plan: { cijferMin: 10 } },
    { leerjaar: 4, ico: '✖️', titel: 'Cijferend vermenigvuldigen', tekst: 'Een getal keer een cijfer, onder elkaar.',
      badge: 'moeilijk', plan: { cijferKeer: 10 } },
    { leerjaar: 4, ico: '➗', titel: 'Cijferend delen', tekst: 'Een getal delen door een cijfer, zonder rest.',
      badge: 'moeilijk', plan: { cijferDelen: 10 } },
    { leerjaar: 4, ico: '🏆', titel: 'Het derde rekenexamen', tekst: 'Duizendtallen en cijferend rekenen door elkaar.',
      badge: 'moeilijk', plan: { duizendtal: 2, cijferPlus: 2, cijferMin: 2, cijferKeer: 2, cijferDelen: 2 } },
    { leerjaar: 5, ico: '💯', titel: 'Getallen tot een miljoen', tekst: '45 000 is 45 duizendtallen.',
      badge: 'gemiddeld', plan: { grootgetal: 10 } },
    { leerjaar: 5, ico: '➗', titel: 'Delen door twee cijfers', tekst: '840 gedeeld door 20.',
      badge: 'moeilijk', plan: { cijferDelen2: 10 } },
    { leerjaar: 5, ico: '🌡️', titel: 'Negatieve getallen', tekst: 'Het was 3 graden, en het koelt 8 graden af.',
      badge: 'gemiddeld', plan: { temp: 10 } },
    { leerjaar: 5, ico: '🏆', titel: 'Het vierde rekenexamen', tekst: 'Grote getallen, delen door twee cijfers, en temperaturen.',
      badge: 'moeilijk', plan: { grootgetal: 3, cijferDelen2: 4, temp: 3 } }
  ],
  zaadjes: function (soort, h) {
    var uit = [], a, b;
    if (soort === 'splits') {
      for (var totaal = 3; totaal <= 10; totaal++) {
        for (var deel1 = 1; deel1 < totaal; deel1++) uit.push({ totaal: totaal, deel1: deel1 });
      }
      return uit;
    }
    if (soort === 'vlot') {
      // tot 10: alle kleine getallen; tot 20: enkel tientallen, en dan zonder het tiental te breken
      var vanaf = h.tot === 10 ? 0 : 10, totMet = h.tot === 10 ? h.tot : 19;
      for (a = vanaf; a <= totMet; a++) {
        for (b = 1; b <= 9; b++) {
          var eenheid = a % 10;
          if (eenheid + b <= 9) uit.push({ a: a, b: b, plus: true });
          if (eenheid - b >= 0) uit.push({ a: a, b: b, plus: false });
        }
      }
      return uit;
    }
    if (soort === 'volgend') {
      for (var n = 1; n <= 20; n++) {
        if (n < 20) uit.push({ n: n, richting: 'na' });
        if (n > 1) uit.push({ n: n, richting: 'voor' });
      }
      return uit;
    }
    if (soort === 'rang') {
      for (var lengte = 3; lengte <= DIERTJES.length; lengte++) {
        for (var plek = 0; plek < lengte; plek++) uit.push({ lengte: lengte, plek: plek });
      }
      return uit;
    }
    if (soort === 'tientallen' || soort === 'eenheden') {
      for (var honderd = 10; honderd <= 99; honderd++) uit.push({ n: honderd });
      return uit;
    }
    if (soort === 'dubbel') {
      for (var d = 1; d <= 50; d++) uit.push({ n: d });
      return uit;
    }
    if (soort === 'helft') {
      for (var hd = 1; hd <= 50; hd++) uit.push({ n: hd * 2 });
      return uit;
    }
    if (soort === 'paar') {
      [true, false].forEach(function (isEven) {
        for (var groep = 1; groep <= 90; groep += 10) uit.push({ even: isEven, groep: groep });
      });
      return uit;
    }
    if (soort === 'duizendtal' || soort === 'honderdtal') {
      var uit5 = [];
      for (var duizend = 1000; duizend <= 9999; duizend += 3) uit5.push({ n: duizend });
      return uit5;
    }
    if (soort === 'cijferPlus') {
      var uit6 = [];
      for (var pa = 1000; pa <= 9800; pa += 37) uit6.push({ a: pa, b: 100 + (pa % 800) });
      return uit6;
    }
    if (soort === 'cijferMin') {
      var uit7 = [];
      for (var ma = 1200; ma <= 9900; ma += 37) uit7.push({ a: ma, b: 100 + (ma % 900) });
      return uit7;
    }
    if (soort === 'cijferKeer') {
      var uit8 = [];
      for (var ka = 12; ka <= 900; ka += 7) {
        for (var kb = 2; kb <= 9; kb++) uit8.push({ a: ka, b: kb });
      }
      return uit8;
    }
    if (soort === 'cijferDelen') {
      var uit9 = [];
      for (var quot = 12; quot <= 900; quot += 7) {
        for (var deler = 2; deler <= 9; deler++) uit9.push({ quot: quot, deler: deler });
      }
      return uit9;
    }
    if (soort === 'grootgetal') {
      var uit10 = [];
      for (var groot = 12000; groot <= 990000; groot += 3701) uit10.push({ n: groot });
      return uit10;
    }
    if (soort === 'cijferDelen2') {
      var uit11 = [];
      for (var quot2 = 11; quot2 <= 90; quot2++) {
        for (var deler2 = 10; deler2 <= 90; deler2 += 10) uit11.push({ quot: quot2, deler: deler2 });
      }
      return uit11;
    }
    if (soort === 'temp') {
      var uit12 = [];
      for (var start = 0; start <= 10; start++) {
        for (var val = 4; val <= 15; val += 2) uit12.push({ start: start, val: val });
      }
      return uit12;
    }
    if (soort === 'omgekeerd') {
      for (var oa = 1; oa <= 9; oa++) {
        for (var ob = 1; ob <= 9; ob++) {
          uit.push({ a: oa, b: ob, vraagTotaal: true });
          uit.push({ a: oa, b: ob, vraagTotaal: false });
        }
      }
      return uit;
    }
    var ondergrens = h.tot === 20 ? 1 : h.tot === 100 ? 11 : 101;
    for (a = ondergrens; a < h.tot; a += h.tot === 1000 ? 7 : 1) {
      var e = a % 10;
      if (e === 0) continue;                       // zonder eenheden valt er geen brug te bouwen
      for (b = h.stap[0]; b <= h.stap[1]; b++) {
        var plus = h.plus;
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
    if (soort === 'splits') {
      var deel2 = z.totaal - z.deel1, sl2 = 'splits|' + z.totaal + ':' + z.deel1;
      return { soort: soort, sleutel: sl2, totaal: z.totaal, deel1: z.deel1, ans: String(deel2),
        options: keuzes(deel2, afleidersSplits(z.deel1, z.totaal)) };
    }
    if (soort === 'volgend') {
      var ans2 = z.richting === 'na' ? z.n + 1 : z.n - 1, sl3 = 'volgend|' + z.n + z.richting;
      var fout2 = [];
      vulAan(fout2, ans2, [z.n, ans2 + 1, ans2 - 1, z.richting === 'na' ? z.n - 1 : z.n + 1],
        function (k) { return k >= 1 && k <= 20; });
      vulRondom(fout2, ans2, 1, function (k) { return k >= 1 && k <= 20; });
      return { soort: soort, sleutel: sl3, n: z.n, richting: z.richting, ans: String(ans2),
        options: keuzes(ans2, fout2.slice(0, 3)) };
    }
    if (soort === 'rang') {
      var ans3 = ORDINALEN[z.plek], sl4 = 'rang|' + z.lengte + ':' + z.plek;
      return { soort: soort, sleutel: sl4, lengte: z.lengte, plek: z.plek, ans: ans3,
        options: keuzes(ans3, andere(ORDINALEN.slice(0, Math.max(z.lengte, 4)), ans3, 3)) };
    }
    if (soort === 'duizendtal' || soort === 'honderdtal') {
      var duiz = Math.floor(z.n / 1000), hond = Math.floor((z.n % 1000) / 100);
      var juist4 = soort === 'duizendtal' ? duiz : hond;
      var kern4 = [juist4 + 1, juist4 - 1, juist4 + 2, soort === 'duizendtal' ? hond : duiz];
      var fout10 = [];
      vulAan(fout10, juist4, kern4, function (k) { return k >= 0 && k <= 9; });
      vulRondom(fout10, juist4, 1, function (k) { return k >= 0 && k <= 9; });
      return { soort: soort, sleutel: soort + '|' + z.n, n: z.n, duiz: duiz, hond: hond, ans: String(juist4),
        options: keuzes(juist4, fout10.slice(0, 3)) };
    }
    if (soort === 'cijferPlus' || soort === 'cijferMin') {
      var uitk = soort === 'cijferPlus' ? z.a + z.b : z.a - z.b;
      var kern5 = soort === 'cijferPlus'
        ? [z.a - z.b, uitk + 10, uitk - 10, uitk + 100]
        : [z.a + z.b, uitk + 10, uitk - 10, uitk + 100];
      return { soort: soort, sleutel: soort + '|' + z.a + ':' + z.b, a: z.a, b: z.b, ans: String(uitk),
        options: keuzes(uitk, afleidersCijfer(uitk, kern5)) };
    }
    if (soort === 'cijferKeer') {
      var prod = z.a * z.b, kern6 = [z.a + z.b, prod + z.a, prod - z.a, prod + z.b];
      return { soort: soort, sleutel: 'cijferKeer|' + z.a + ':' + z.b, a: z.a, b: z.b, ans: String(prod),
        options: keuzes(prod, afleidersCijfer(prod, kern6)) };
    }
    if (soort === 'cijferDelen') {
      var deeltal = z.quot * z.deler;
      var kern7 = [z.quot + 1, z.quot - 1, z.quot + z.deler, z.deler];
      return { soort: soort, sleutel: 'cijferDelen|' + deeltal + ':' + z.deler, deeltal: deeltal, deler: z.deler,
        ans: String(z.quot), options: keuzes(z.quot, afleidersCijfer(z.quot, kern7)) };
    }
    if (soort === 'grootgetal') {
      var duizTal = Math.floor(z.n / 1000);
      var kern9 = [duizTal + 1, duizTal - 1, duizTal + 10, duizTal - 10];
      return { soort: soort, sleutel: 'grootgetal|' + z.n, n: z.n, ans: String(duizTal),
        options: keuzes(duizTal, afleidersCijfer(duizTal, kern9)) };
    }
    if (soort === 'cijferDelen2') {
      var deeltal2 = z.quot * z.deler;
      var kern10 = [z.quot + 1, z.quot - 1, z.quot + 10, z.quot - 10];
      return { soort: soort, sleutel: 'cijferDelen2|' + deeltal2 + ':' + z.deler, deeltal: deeltal2, deler: z.deler,
        ans: String(z.quot), options: keuzes(z.quot, afleidersCijfer(z.quot, kern10)) };
    }
    if (soort === 'temp') {
      var uitkomst2 = z.start - z.val;
      var kern11 = [uitkomst2 + 1, uitkomst2 - 1, z.start + z.val, uitkomst2 + 10];
      var fout12 = [];
      vulAan(fout12, uitkomst2, kern11);
      vulRondom(fout12, uitkomst2, 1);
      return { soort: soort, sleutel: 'temp|' + z.start + ':' + z.val, start: z.start, val: z.val,
        ans: String(uitkomst2), options: keuzes(uitkomst2, fout12.slice(0, 3)) };
    }
    if (soort === 'tientallen' || soort === 'eenheden') {
      var tal = Math.floor(z.n / 10), eenh = z.n % 10, juist2 = soort === 'tientallen' ? tal : eenh;
      var kern2 = [juist2 + 1, juist2 - 1, juist2 + 2, soort === 'tientallen' ? eenh : tal];
      var fout6 = [];
      vulAan(fout6, juist2, kern2, function (k) { return k >= 0 && k <= 9; });
      vulRondom(fout6, juist2, 1, function (k) { return k >= 0 && k <= 9; });
      return { soort: soort, sleutel: soort + '|' + z.n, n: z.n, tal: tal, eenh: eenh, ans: String(juist2),
        options: keuzes(juist2, fout6.slice(0, 3)) };
    }
    if (soort === 'dubbel' || soort === 'helft') {
      var juist3 = soort === 'dubbel' ? z.n * 2 : z.n / 2;
      var kern3 = [z.n, juist3 + 1, juist3 - 1, juist3 + 2, juist3 - 2];
      var fout7 = [];
      vulAan(fout7, juist3, kern3, positief);
      vulRondom(fout7, juist3, 1, positief);
      return { soort: soort, sleutel: soort + '|' + z.n, n: z.n, ans: String(juist3),
        options: keuzes(juist3, fout7.slice(0, 3)) };
    }
    if (soort === 'paar') {
      var poel = [];
      for (var i = z.groep; i < z.groep + 10; i++) poel.push(i);
      var juistePoel = poel.filter(function (x) { return (x % 2 === 0) === z.even; });
      var foutePoel = poel.filter(function (x) { return (x % 2 === 0) !== z.even; });
      var goedGetal = juistePoel[Math.floor(Math.random() * juistePoel.length)];
      var foutGetal = [];
      vulAan(foutGetal, goedGetal, foutePoel, positief);
      return { soort: soort, sleutel: 'paar|' + z.even + z.groep, even: z.even, ans: String(goedGetal),
        options: keuzes(goedGetal, foutGetal.slice(0, 3)) };
    }
    if (soort === 'omgekeerd') {
      var totaal3 = z.a + z.b;
      if (z.vraagTotaal) {
        var fout8 = [];
        vulAan(fout8, totaal3, [totaal3 + 1, totaal3 - 1, z.a, z.b], positief);
        vulRondom(fout8, totaal3, 1, positief);
        return { soort: soort, sleutel: 'omgekeerd|totaal:' + z.a + '+' + z.b, a: z.a, b: z.b,
          vraagTotaal: true, uit: totaal3, ans: String(totaal3), options: keuzes(totaal3, fout8.slice(0, 3)) };
      }
      var fout9 = [];
      vulAan(fout9, z.b, [z.b + 1, z.b - 1, z.a, totaal3], positief);
      vulRondom(fout9, z.b, 1, positief);
      return { soort: soort, sleutel: 'omgekeerd|deel:' + z.a + '+' + z.b, a: z.a, b: z.b,
        vraagTotaal: false, uit: totaal3, ans: String(z.b), options: keuzes(z.b, fout9.slice(0, 3)) };
    }
    var uitkomst = z.plus ? z.a + z.b : z.a - z.b;
    var sl = soort + '|' + z.a + (z.plus ? '+' : '-') + z.b;
    if (soort === 'vlot') {
      return { soort: soort, sleutel: sl, a: z.a, b: z.b, plus: z.plus, uit: uitkomst, ans: String(uitkomst),
        options: keuzes(uitkomst, afleidersVlot(z.a, z.b, z.plus, z.a >= 10 ? 19 : 10)) };
    }
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
  teken: function (v) {
    if (v.soort === 'splits') return tienFrame(v.totaal, v.deel1);
    if (v.soort === 'vlot') return lijnRecht(v.a, v.b, v.plus, v.a >= 10 ? 19 : 10);
    if (v.soort === 'volgend' || v.soort === 'tientallen' || v.soort === 'eenheden' || v.soort === 'dubbel' ||
        v.soort === 'helft') return getalTegel(v.n);
    if (v.soort === 'rang') return rijTekening(v.lengte, v.plek);
    if (v.soort === 'duizendtal' || v.soort === 'honderdtal') return getalTegel(v.n);
    if (v.soort === 'cijferPlus') return kolom(v.a, v.b, '+');
    if (v.soort === 'cijferMin') return kolom(v.a, v.b, '−');
    if (v.soort === 'cijferKeer') return kolom(v.a, v.b, '×');
    if (v.soort === 'cijferDelen') return kolom(v.deeltal, v.deler, ':');
    if (v.soort === 'grootgetal') return getalTegel(v.n);
    if (v.soort === 'cijferDelen2') return kolom(v.deeltal, v.deler, ':');
    if (v.soort === 'temp') return '';
    if (v.soort === 'paar' || v.soort === 'omgekeerd') return '';
    return lijn(v.a, v.b, v.plus, v.soort !== 'gat');
  },
  scherm: function (v) {
    if (v.soort === 'splits') return v.deel1 + ' + ? = ' + v.totaal;
    if (v.soort === 'omgekeerd') {
      return v.vraagTotaal ? '? = ' + v.a + ' + ' + v.b : v.uit + ' = ' + v.a + ' + ?';
    }
    if (v.soort === 'volgend' || v.soort === 'rang' || v.soort === 'tientallen' ||
        v.soort === 'eenheden' || v.soort === 'dubbel' || v.soort === 'helft' || v.soort === 'paar' ||
        v.soort === 'duizendtal' || v.soort === 'honderdtal' || v.soort === 'cijferPlus' ||
        v.soort === 'cijferMin' || v.soort === 'cijferKeer' || v.soort === 'cijferDelen' ||
        v.soort === 'grootgetal' || v.soort === 'cijferDelen2' || v.soort === 'temp') return null;
    var teken = v.plus ? ' + ' : ' − ';
    if (v.soort === 'gat') return v.a + teken + '? = ' + v.uit;
    return v.a + teken + v.b;
  },
  vraag: function (v, nr) {
    var kop = 'Vraag ' + nr + ': ';
    if (v.soort === 'splits') return { titel: kop + 'welk getal ontbreekt?', sub: 'Tel de vraagtekens.' };
    if (v.soort === 'volgend') {
      return { titel: kop + 'welk getal komt ' + v.richting + ' ' + v.n + '?',
        sub: v.richting === 'na' ? 'Eén getal verder tellen.' : 'Eén getal terug tellen.' };
    }
    if (v.soort === 'rang') return { titel: kop + 'op welke plaats staat het dier met het randje?', sub: 'Tel van links naar rechts.' };
    if (v.soort === 'tientallen') return { titel: kop + 'hoeveel tientallen zitten er in ' + v.n + '?', sub: v.n + ' = ? tientallen en ' + v.eenh + ' eenheden.' };
    if (v.soort === 'eenheden') return { titel: kop + 'hoeveel eenheden zitten er in ' + v.n + '?', sub: v.n + ' = ' + v.tal + ' tientallen en ? eenheden.' };
    if (v.soort === 'dubbel') return { titel: kop + 'wat is het dubbele van ' + v.n + '?', sub: v.n + ' + ' + v.n + ' = ?' };
    if (v.soort === 'helft') return { titel: kop + 'wat is de helft van ' + v.n + '?', sub: 'Verdeel in twee gelijke stukken.' };
    if (v.soort === 'paar') return { titel: kop + 'welk van deze vier getallen is ' + (v.even ? 'even' : 'oneven') + '?', sub: 'Even kan je door twee delen, zonder rest.' };
    if (v.soort === 'omgekeerd') return { titel: kop + 'welk getal ontbreekt?', sub: 'Het is-gelijk-teken werkt ook van rechts naar links.' };
    if (v.soort === 'duizendtal') return { titel: kop + 'hoeveel duizendtallen zitten er in ' + v.n + '?', sub: v.n + ' = ? duizendtallen, ' + v.hond + ' honderdtallen, ...' };
    if (v.soort === 'honderdtal') return { titel: kop + 'hoeveel honderdtallen zitten er in ' + v.n + '?', sub: v.n + ' = ' + v.duiz + ' duizendtallen, ? honderdtallen, ...' };
    if (v.soort === 'cijferPlus') return { titel: kop + 'hoeveel is ' + v.a + ' plus ' + v.b + '?', sub: 'Zet ze onder elkaar.' };
    if (v.soort === 'cijferMin') return { titel: kop + 'hoeveel is ' + v.a + ' min ' + v.b + '?', sub: 'Zet ze onder elkaar.' };
    if (v.soort === 'cijferKeer') return { titel: kop + 'hoeveel is ' + v.a + ' keer ' + v.b + '?', sub: 'Vermenigvuldig cijfer per cijfer.' };
    if (v.soort === 'cijferDelen') return { titel: kop + 'hoeveel is ' + v.deeltal + ' gedeeld door ' + v.deler + '?', sub: 'Zonder rest.' };
    if (v.soort === 'grootgetal') return { titel: kop + 'hoeveel duizendtallen zitten er in ' + v.n + '?', sub: 'Deel door 1000.' };
    if (v.soort === 'cijferDelen2') return { titel: kop + 'hoeveel is ' + v.deeltal + ' gedeeld door ' + v.deler + '?', sub: 'De deler heeft nu twee cijfers.' };
    if (v.soort === 'temp') {
      return { titel: kop + 'het is ' + v.start + ' °C, en het koelt ' + v.val + ' graden af.',
        sub: 'Wat is de nieuwe temperatuur?' };
    }
    if (v.soort === 'gat') return { titel: kop + 'welk getal ontbreekt?', sub: 'Hoe groot is de sprong?' };
    if (v.soort === 'typ') return { titel: kop + 'hoeveel is ' + v.a + (v.plus ? ' plus ' : ' min ') + v.b + '?', sub: 'Typ alleen het getal.' };
    return { titel: kop + 'hoeveel is ' + v.a + (v.plus ? ' plus ' : ' min ') + v.b + '?' };
  },
  uitleg: function (v) {
    if (v.soort === 'splits') return v.deel1 + ' en ' + (v.totaal - v.deel1) + ' samen zijn ' + v.totaal + '.';
    if (v.soort === 'volgend') {
      return v.richting === 'na' ? 'Na ' + v.n + ' komt ' + (v.n + 1) + '.' : 'Voor ' + v.n + ' komt ' + (v.n - 1) + '.';
    }
    if (v.soort === 'rang') return 'Het dier met het randje staat op de ' + v.ans + ' plaats.';
    if (v.soort === 'duizendtal' || v.soort === 'honderdtal') return v.n + ' bestaat uit ' + v.duiz + ' duizendtallen, ' + v.hond + ' honderdtallen en de rest.';
    if (v.soort === 'cijferPlus') return v.a + ' + ' + v.b + ' = ' + (v.a + v.b) + '.';
    if (v.soort === 'cijferMin') return v.a + ' − ' + v.b + ' = ' + (v.a - v.b) + '.';
    if (v.soort === 'cijferKeer') return v.a + ' × ' + v.b + ' = ' + (v.a * v.b) + '.';
    if (v.soort === 'cijferDelen') return v.deeltal + ' : ' + v.deler + ' = ' + v.ans + ', want ' + v.ans + ' × ' + v.deler + ' = ' + v.deeltal + '.';
    if (v.soort === 'grootgetal') return v.n + ' : 1000 = ' + v.ans + '.';
    if (v.soort === 'cijferDelen2') return v.deeltal + ' : ' + v.deler + ' = ' + v.ans + ', want ' + v.ans + ' × ' + v.deler + ' = ' + v.deeltal + '.';
    if (v.soort === 'temp') return v.start + ' − ' + v.val + ' = ' + v.ans + ' °C. Onder nul tel je verder in het negatieve.';
    if (v.soort === 'tientallen') return v.n + ' bestaat uit ' + v.tal + ' tientallen en ' + v.eenh + ' eenheden.';
    if (v.soort === 'eenheden') return v.n + ' bestaat uit ' + v.tal + ' tientallen en ' + v.eenh + ' eenheden.';
    if (v.soort === 'dubbel') return 'Het dubbele van ' + v.n + ' is ' + (v.n * 2) + ': ' + v.n + ' + ' + v.n + '.';
    if (v.soort === 'helft') return 'De helft van ' + v.n + ' is ' + (v.n / 2) + ': verdeeld in twee gelijke stukken.';
    if (v.soort === 'paar') return v.ans + ' is ' + (v.even ? 'even' : 'oneven') + ': je kan het' + (v.even ? '' : ' niet') + ' door twee delen zonder rest.';
    if (v.soort === 'omgekeerd') {
      return v.vraagTotaal
        ? v.a + ' + ' + v.b + ' is ' + v.uit + ', dus ? = ' + v.uit + '.'
        : v.uit + ' = ' + v.a + ' + ' + v.b + ', dus ? = ' + v.b + '.';
    }
    if (v.soort === 'vlot') {
      var teken2 = v.plus ? '+' : '−';
      return v.a + ' ' + teken2 + ' ' + v.b + ' = ' + v.ans + '. Geen brug nodig, het blijft binnen hetzelfde tiental.';
    }
    var s3 = sprong(v.a, v.b, v.plus);
    var teken = v.plus ? '+' : '−';
    return 'Spring eerst naar ' + s3.tussen + ' (' + teken + s3.eerste + '), dan nog ' + teken + s3.tweede +
      ' tot ' + v.uit + '.';
  },
  kort: function (v) {
    if (v.soort === 'splits') return v.deel1 + ' + ? = ' + v.totaal;
    if (v.soort === 'volgend') return 'Wat komt ' + v.richting + ' ' + v.n + '?';
    if (v.soort === 'rang') return 'Welke plaats heeft het gemarkeerde dier?';
    if (v.soort === 'duizendtal') return 'Duizendtallen in ' + v.n;
    if (v.soort === 'honderdtal') return 'Honderdtallen in ' + v.n;
    if (v.soort === 'cijferPlus') return v.a + ' + ' + v.b;
    if (v.soort === 'cijferMin') return v.a + ' − ' + v.b;
    if (v.soort === 'cijferKeer') return v.a + ' × ' + v.b;
    if (v.soort === 'cijferDelen') return v.deeltal + ' : ' + v.deler;
    if (v.soort === 'grootgetal') return 'Duizendtallen in ' + v.n;
    if (v.soort === 'cijferDelen2') return v.deeltal + ' : ' + v.deler + ' (twee cijfers)';
    if (v.soort === 'temp') return v.start + ' °C, ' + v.val + ' graden erbij of eraf';
    if (v.soort === 'tientallen') return 'Tientallen in ' + v.n;
    if (v.soort === 'eenheden') return 'Eenheden in ' + v.n;
    if (v.soort === 'dubbel') return 'Het dubbele van ' + v.n;
    if (v.soort === 'helft') return 'De helft van ' + v.n;
    if (v.soort === 'paar') return 'Welk getal is ' + (v.even ? 'even' : 'oneven') + '?';
    if (v.soort === 'omgekeerd') return v.vraagTotaal ? '? = ' + v.a + ' + ' + v.b : v.uit + ' = ' + v.a + ' + ?';
    var teken = v.plus ? ' + ' : ' − ';
    return v.soort === 'gat' ? v.a + teken + '? = ' + v.uit : v.a + teken + v.b;
  },
  test: function (check) {
    // een splitsing telt weer op tot het totaal, en het gekende deel is nooit het hele totaal
    for (var totaal = 3; totaal <= 10; totaal++) {
      for (var deel1 = 1; deel1 < totaal; deel1++) {
        check(deel1 + (totaal - deel1) === totaal, 'splitsing ' + deel1 + '+? klopt bij totaal ' + totaal);
      }
    }
    // "zonder brug" mag het tiental nooit breken
    for (var a = 0; a <= 19; a++) {
      for (var b = 1; b <= 9; b++) {
        [true, false].forEach(function (plus) {
          var e = a % 10;
          var geldig = plus ? e + b <= 9 : e - b >= 0;
          if (!geldig) return;
          var uit = plus ? a + b : a - b;
          check(Math.floor(uit / 10) === Math.floor(a / 10), 'geen brug bij ' + a + (plus ? '+' : '-') + b);
        });
      }
    }
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
          check(lijn(a2, b2, plus, false).indexOf('>' + (plus ? '+' : '−') + s6.eerste + '<') === -1,
            'zonder labels staat de sprong er niet bij, bij ' + a2);
        });
      }
    }
  }
};
