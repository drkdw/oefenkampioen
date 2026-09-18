import { shuffle, pad2, keuzes, vulAan, positief, vulRondom, andere } from '../gereedschap.js';

  // alles rekent in centen: met kommagetallen gaat 0,1 + 0,2 mis in elke browser
  var MUNTEN = [1, 2, 5, 10, 20, 50, 100, 200];
  function geld(c) { return '€ ' + Math.floor(c / 100) + ',' + pad2(c % 100); }
  function muntnaam(c) { return c < 100 ? c + ' cent' : '€ ' + (c / 100); }
  var WAREN = [
    { ico: '🍎', naam: 'een appel', max: 150 }, { ico: '🍞', naam: 'een brood', max: 400 },
    { ico: '🧃', naam: 'een fles sap', max: 250 }, { ico: '🍫', naam: 'een reep chocolade', max: 250 },
    { ico: '✏️', naam: 'een potlood', max: 150 }, { ico: '📓', naam: 'een schrift', max: 300 },
    { ico: '🧦', naam: 'een paar sokken', max: 800 }, { ico: '🍦', naam: 'een ijsje', max: 250 },
    { ico: '⚽', naam: 'een bal', max: 1500 }, { ico: '📚', naam: 'een strip', max: 900 }
  ];

  /* munten en biljetten tekenen */
  function munt(c) {
    var koper = c <= 5, goud = c >= 10 && c < 100;
    var r = c < 100 ? 30 : 34;
    var buiten = koper ? '#C87137' : goud ? '#D6A419' : (c === 100 ? '#D6A419' : '#B9C2CE');
    var binnen = c === 100 ? '#D8DEE6' : c === 200 ? '#D6A419' : buiten;
    var tekst = c < 100 ? String(c) : String(c / 100);
    var onder = c < 100 ? 'cent' : 'euro';
    return '<svg viewBox="0 0 80 80" width="' + (r * 2.1) + '" height="' + (r * 2.1) +
      '" role="img" aria-label="' + muntnaam(c) + '">' +
      '<circle cx="40" cy="40" r="' + r + '" fill="' + buiten + '" stroke="rgba(0,0,0,.18)" stroke-width="2"/>' +
      '<circle cx="40" cy="40" r="' + (r - 9) + '" fill="' + binnen + '"/>' +
      '<text x="40" y="37" text-anchor="middle" dominant-baseline="central" font-family="Fredoka, sans-serif" font-size="22" font-weight="700" fill="#2B2B2B">' + tekst + '</text>' +
      '<text x="40" y="54" text-anchor="middle" dominant-baseline="central" font-family="Fredoka, sans-serif" font-size="10" font-weight="600" fill="#2B2B2B">' + onder + '</text>' +
      '</svg>';
  }
  var BILJETKLEUR = { 500: '#9AA4B2', 1000: '#E0685F', 2000: '#5B8FD6', 5000: '#E9964B' };
  function biljet(c) {
    return '<svg viewBox="0 0 140 76" width="112" height="61" role="img" aria-label="biljet van ' + (c / 100) + ' euro">' +
      '<rect x="3" y="3" width="134" height="70" rx="9" fill="' + BILJETKLEUR[c] + '" stroke="rgba(0,0,0,.2)" stroke-width="2"/>' +
      '<rect x="13" y="13" width="114" height="50" rx="5" fill="rgba(255,255,255,.28)"/>' +
      '<text x="70" y="40" text-anchor="middle" dominant-baseline="central" font-family="Fredoka, sans-serif" font-size="30" font-weight="700" fill="#1F2A44">€' + (c / 100) + '</text>' +
      '</svg>';
  }
  function stuk(c) { return c >= 500 ? biljet(c) : munt(c); }
  function toonbank(lijst) {
    return '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center">' +
      lijst.map(stuk).join('') + '</div>';
  }
  function prijskaartje(waar, bedrag) {
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;font-family:Fredoka,sans-serif">' +
      '<span style="font-size:60px">' + waar.ico + '</span>' +
      '<span style="font-size:22px;color:var(--accent)">' + geld(bedrag) + '</span></div>';
  }

  function totaal(lijst) {
    return lijst.reduce(function (a, b) { return a + b; }, 0);
  }
  // een handvol munten die samen een bedrag vormen, zoals je ze echt in je zak hebt
  function greep(bron, hoeveel) {
    var uit = [];
    for (var i = 0; i < hoeveel; i++) uit.push(bron[Math.floor(Math.random() * bron.length)]);
    return uit.sort(function (a, b) { return b - a; });
  }
  // bouw een voorraad verschillende greepjes, want binnen een toets mag niets terugkeren
  function greepjes(bron, min, max, hoeveel) {
    var uit = [], gezien = {}, pogingen = 0;
    while (uit.length < hoeveel && pogingen < hoeveel * 40) {
      pogingen++;
      var n = min + Math.floor(Math.random() * (max - min + 1));
      var g = greep(bron, n), sl = g.join('-');
      if (gezien[sl]) continue;
      gezien[sl] = 1;
      uit.push(g);
    }
    return uit;
  }
  // de fouten die kinderen bij geld echt maken
  function afleidersBedrag(juist, stukken) {
    var lijst = [], kern = [];
    if (stukken && stukken.length) {
      kern.push(juist - stukken[0]);                    // een muntstuk vergeten te tellen
      kern.push(juist + stukken[stukken.length - 1]);   // een muntstuk dubbel geteld
    }
    var centen = juist % 100;
    if (centen) kern.push(juist - centen);              // de centen laten vallen
    kern.push(juist + 100);
    kern.push(juist - 100);
    kern.push(juist + 10);
    kern.push(juist - 10);
    vulAan(lijst, juist, kern, positief);
    vulRondom(lijst, juist, 5);
    return lijst.map(geld);
  }
  function afleidersWissel(betaald, prijs) {
    var juist = betaald - prijs, lijst = [], kern = [];
    var centen = prijs % 100;
    if (centen) {
      // de klassieker: de euro's aftrekken en de centen gewoon overschrijven
      kern.push(betaald - Math.floor(prijs / 100) * 100 + centen);
      // wel een euro geleend, maar de centen toch overgeschreven
      kern.push(betaald - Math.ceil(prijs / 100) * 100 + centen);
    }
    kern.push(prijs);                                    // de prijs teruggeven in plaats van het verschil
    kern.push(juist + 100);
    kern.push(juist - 100);
    vulAan(lijst, juist, kern, function (k) { return k > 0 && k < betaald; });
    vulRondom(lijst, juist, 5, function (k) { return k > 0 && k < betaald; });
    return lijst.map(geld);
  }

export default {
  id: 'winkel',
  ico: '🛒',
  naam: 'Het winkeltje',
  tekst: 'Munten tellen, betalen en wisselgeld teruggeven.',
  top: 'Jij mag achter de kassa staan!',
  hoofdstukken: [
    { leerjaar: 1, ico: '🪙', titel: 'Centen tellen', tekst: 'Van 1 cent tot 50 cent.',
      badge: 'makkelijk', bron: [1, 2, 5, 10, 20, 50], min: 2, max: 4, plan: { tellen: 10 } },
    { leerjaar: 2, ico: '💶', titel: 'Euro’s en biljetten', tekst: 'Munten van 1 en 2 euro, briefjes van 5 en 10.',
      badge: 'makkelijk', bron: [100, 200, 500, 1000], min: 2, max: 3, plan: { tellen: 10 } },
    { leerjaar: 2, ico: '👛', titel: 'Alles door elkaar', tekst: 'Centen, euro’s en briefjes samen.',
      badge: 'gemiddeld', bron: [5, 10, 20, 50, 100, 200], min: 3, max: 5, plan: { tellen: 10 } },
    { leerjaar: 3, ico: '🧾', titel: 'Wisselgeld', tekst: 'Je betaalt met een briefje. Hoeveel krijg je terug?',
      badge: 'moeilijk', bron: [5, 10, 20, 50, 100, 200], min: 2, max: 4, plan: { wissel: 10 } },
    { leerjaar: 2, ico: '❓', titel: 'Welke munt ontbreekt', tekst: 'Er is nog een muntje nodig. Welk?',
      badge: 'gemiddeld', bron: [5, 10, 20, 50, 100, 200], min: 2, max: 3, plan: { ontbreekt: 10 } },
    { leerjaar: 3, ico: '⌨️', titel: 'Aan de kassa', tekst: 'Typ zelf het bedrag in: euro’s en centen.',
      badge: 'gemiddeld', bron: [5, 10, 20, 50, 100, 200], min: 3, max: 5, plan: { typ: 10 } },
    { leerjaar: 3, ico: '🏆', titel: 'Het grote winkelexamen', tekst: 'Tellen, wisselen en typen door elkaar.',
      badge: 'moeilijk', bron: [5, 10, 20, 50, 100, 200], min: 3, max: 5, plan: { tellen: 4, wissel: 2, ontbreekt: 2, typ: 2 } }
  ],
  zaadjes: function (soort, h) {
    if (soort === 'wissel') {
      // de prijs hoort bij het voorwerp, en je betaalt met het eerste briefje dat groot genoeg is
      // elke prijs komt maar een keer voor: hetzelfde bedrag met een ander plaatje is dezelfde som.
      // de volgorde wisselt, zodat niet altijd hetzelfde voorwerp de goedkope prijzen krijgt
      var uit = [], gezien = {};
      shuffle(WAREN.slice()).forEach(function (w) {
        for (var c = 50; c <= w.max; c += 5) {
          var bil = c < 500 ? 500 : c < 1000 ? 1000 : 2000;
          if (gezien[bil + '/' + c]) continue;
          gezien[bil + '/' + c] = 1;
          uit.push({ betaald: bil, prijs: c, waar: w });
        }
      });
      return uit;
    }
    if (soort === 'ontbreekt') {
      return greepjes(h.bron, h.min, h.max, 60).map(function (g) {
        var mist = h.bron[Math.floor(Math.random() * h.bron.length)];
        return { stukken: g, mist: mist };
      });
    }
    return greepjes(h.bron, h.min, h.max, 60).map(function (g) { return { stukken: g }; });
  },
  maak: function (soort, z) {
    if (soort === 'wissel') {
      var terug = z.betaald - z.prijs;
      return { soort: soort, sleutel: 'wissel|' + z.betaald + '/' + z.prijs, betaald: z.betaald,
        prijs: z.prijs, waar: z.waar, terug: terug, ans: geld(terug),
        options: keuzes(geld(terug), afleidersWissel(z.betaald, z.prijs)) };
    }
    var som = totaal(z.stukken), sl = soort + '|' + z.stukken.join('-');
    if (soort === 'ontbreekt') {
      var doel = som + z.mist;
      var rest = andere(MUNTEN, z.mist, 3).map(muntnaam);
      return { soort: soort, sleutel: sl + '+' + z.mist, stukken: z.stukken, mist: z.mist, som: som,
        doel: doel, ans: muntnaam(z.mist), options: keuzes(muntnaam(z.mist), rest) };
    }
    if (soort === 'typ') {
      return { soort: soort, sleutel: sl, stukken: z.stukken, som: som, ans: Math.floor(som / 100) + ',' + pad2(som % 100),
        typen: { scheider: ',', hulp: 'Vul twee vakjes in: eerst de euro’s, dan de centen.',
          velden: [{ ph: '0', aria: 'Euro', ant: Math.floor(som / 100), max: 3 },
                   { ph: '00', aria: 'Cent', ant: som % 100, pad: true }] } };
    }
    return { soort: 'tellen', sleutel: sl, stukken: z.stukken, som: som, ans: geld(som),
      options: keuzes(geld(som), afleidersBedrag(som, z.stukken)) };
  },
  teken: function (v) {
    if (v.soort === 'wissel') {
      return prijskaartje(v.waar, v.prijs) + '<span class="pijl">➡️</span>' + stuk(v.betaald);
    }
    return toonbank(v.stukken);
  },
  scherm: function (v) {
    if (v.soort === 'ontbreekt') return geld(v.doel);
    return null;
  },
  vraag: function (v, nr) {
    var kop = 'Vraag ' + nr + ': ';
    if (v.soort === 'wissel') {
      return { titel: kop + 'je koopt ' + v.waar.naam + ' van ' + geld(v.prijs) + '.',
        sub: 'Je betaalt met ' + geld(v.betaald) + '. Hoeveel krijg je terug?' };
    }
    if (v.soort === 'ontbreekt') {
      return { titel: kop + 'je moet ' + geld(v.doel) + ' betalen.',
        sub: 'Je hebt al ' + geld(v.som) + ' in je hand. Welk muntstuk heb je nog nodig?' };
    }
    if (v.soort === 'typ') {
      return { titel: kop + 'hoeveel geld ligt hier?', sub: 'Typ het bedrag in: eerst de euro’s, dan de centen.' };
    }
    return { titel: kop + 'hoeveel geld ligt hier?' };
  },
  uitleg: function (v) {
    if (v.soort === 'wissel') {
      return geld(v.betaald) + ' min ' + geld(v.prijs) + ' is ' + geld(v.terug) +
        '. Tel maar verder van ' + geld(v.prijs) + ' tot ' + geld(v.betaald) + '.';
    }
    if (v.soort === 'ontbreekt') {
      return geld(v.som) + ' plus ' + muntnaam(v.mist) + ' is ' + geld(v.doel) + '.';
    }
    return v.stukken.map(muntnaam).join(' + ') + ' = ' + geld(v.som) + '.';
  },
  kort: function (v) {
    if (v.soort === 'wissel') return geld(v.prijs) + ' betaald met ' + geld(v.betaald);
    if (v.soort === 'ontbreekt') return geld(v.som) + ' in de hand, ' + geld(v.doel) + ' nodig';
    return v.stukken.map(muntnaam).join(' + ');
  },
  test: function (check) {
    check(geld(305) === '€ 3,05', 'drie euro vijf cent');
    check(geld(5) === '€ 0,05', 'vijf cent');
    check(geld(1250) === '€ 12,50', 'twaalf euro vijftig');
    check(muntnaam(50) === '50 cent' && muntnaam(200) === '€ 2', 'namen van de stukken');
    check(totaal([200, 50, 20]) === 270, 'optellen in centen');
    // het klassieke wisselgeldmisverstand moet als afleider aangeboden worden
    var af = afleidersWissel(500, 340);
    check(af.indexOf('€ 2,40') > -1, 'de euro-min-euro fout staat erbij (nu ' + af.join(', ') + ')');
    check(af.indexOf('€ 1,60') === -1, 'het juiste antwoord staat niet tussen de afleiders');
    MUNTEN.concat([500, 1000, 2000]).forEach(function (c) {
      check(stuk(c).indexOf('<svg') === 0, 'elk stuk wordt getekend: ' + c);
      check(stuk(c).indexOf('aria-label') > -1, 'elk stuk heeft een beschrijving: ' + c);
    });
    // elk bedrag van 5 cent tot 50 euro moet drie bruikbare afleiders opleveren
    for (var b = 5; b <= 5000; b += 5) {
      var lijst = afleidersBedrag(b, [5, 10]);
      check(lijst.length === 3, 'drie afleiders bij ' + geld(b));
      check(lijst.indexOf(geld(b)) === -1, 'het juiste bedrag staat er niet bij: ' + geld(b));
      check(lijst.filter(function (x, i) { return lijst.indexOf(x) === i; }).length === 3, 'drie verschillende afleiders bij ' + geld(b));
    }
    [500, 1000, 2000].forEach(function (bil) {
      for (var c = 50; c < bil; c += 5) {
        var w = afleidersWissel(bil, c);
        check(w.length === 3, 'drie wisselafleiders bij ' + geld(c) + ' van ' + geld(bil));
        check(w.indexOf(geld(bil - c)) === -1, 'het juiste wisselgeld staat er niet bij');
        check(w.filter(function (x, i) { return w.indexOf(x) === i; }).length === 3, 'drie verschillende wisselafleiders');
      }
    });
  }
};
