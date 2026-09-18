import { keuzes, vulAan, positief, reduced } from '../gereedschap.js';

  // de maaltafels van het lager onderwijs lopen van 1 tot 10
  var MAX = 10;
  var ALLE_TAFELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  // de tafels van het tweede leerjaar; de rest komt in het derde
  var KLEINE_TAFELS = [1, 2, 3, 4, 5, 10];
  function omgekeerd(p) { return Number(String(p).split('').reverse().join('')); }
  function som(v) {
    if (v.soort === 'delen') return v.p + ' : ' + v.a;
    if (v.soort === 'ontbreekt') return v.links ? '? × ' + v.b + ' = ' + v.p : v.a + ' × ? = ' + v.p;
    return v.a + ' × ' + v.b;
  }
  function verderWeg(juist) {
    var uit = [];
    for (var d = 1; d <= 14; d++) { uit.push(juist + d); uit.push(juist - d); }
    return uit;
  }
  // de fouten die kinderen van 8 en 9 echt maken, niet zomaar willekeurige getallen
  function afleidersKeer(a, b) {
    var p = a * b, lijst = [], kern = [];
    if (p <= 20) kern.push(a + b);   // optellen in plaats van vermenigvuldigen
    kern.push(a * (b + 1));          // een rij te ver in de tafel
    kern.push(a * (b - 1));          // een rij te kort
    kern.push(omgekeerd(p));         // de twee cijfers van het product omgewisseld
    kern.push((a + 1) * b);          // de buurtafel genomen
    kern.push((a - 1) * b);
    vulAan(lijst, p, kern, positief);
    vulAan(lijst, p, verderWeg(p), positief);
    return lijst.slice(0, 3);
  }
  function afleidersFactor(juist, ander) {
    // het gezochte getal is een factor, dus de afleiders blijven kleine getallen
    var lijst = [];
    vulAan(lijst, juist, [juist + 1, juist - 1, ander, juist + 2], positief);
    vulAan(lijst, juist, verderWeg(juist).filter(function (k) { return k <= MAX + 2; }), positief);
    return lijst.slice(0, 3);
  }

  var KLEUREN = ['#FF7A45', '#7C5CFF', '#12A06B', '#FFC43D', '#FF5D8F', '#35B8E0', '#9B5DE5', '#00BBA7'];
  function monster(seed) {
    var kleur = KLEUREN[seed % KLEUREN.length];
    var ogen = 1 + (seed % 3);
    var p = [];
    if (seed % 2 === 0) {
      p.push('<path d="M62 56 L50 18 L88 44 Z" fill="' + kleur + '"/>');
      p.push('<path d="M138 56 L150 18 L112 44 Z" fill="' + kleur + '"/>');
    } else {
      p.push('<line x1="100" y1="44" x2="100" y2="16" stroke="' + kleur + '" stroke-width="7" stroke-linecap="round"/>');
      p.push('<circle cx="100" cy="14" r="10" fill="' + kleur + '"/>');
    }
    p.push('<path d="M100 26 C154 26 176 64 176 114 C176 160 144 184 100 184 C56 184 24 160 24 114 C24 64 46 26 100 26 Z" fill="' + kleur + '"/>');
    for (var i = 0; i < ogen; i++) {
      var cx = 100 + (i - (ogen - 1) / 2) * 44;
      p.push('<circle cx="' + cx + '" cy="96" r="19" fill="#FFFFFF"/>');
      p.push('<circle cx="' + cx + '" cy="99" r="8" fill="#16203A"/>');
    }
    p.push('<path d="M70 138 Q100 166 130 138 Z" fill="#16203A"/>');
    p.push('<path d="M84 145 L90 138 L96 145 Z" fill="#FFFFFF"/><path d="M104 145 L110 138 L116 145 Z" fill="#FFFFFF"/>');
    p.push('<ellipse cx="62" cy="188" rx="17" ry="10" fill="' + kleur + '"/>');
    p.push('<ellipse cx="138" cy="188" rx="17" ry="10" fill="' + kleur + '"/>');
    return '<svg class="monster" id="monster" viewBox="0 0 200 200" role="img" aria-label="Een monster met ' +
      ogen + (ogen === 1 ? ' oog' : ' ogen') + '">' + p.join('') + '</svg>';
  }

export default {
  id: 'maal',
  ico: '✖️',
  naam: 'Maaltafels',
  tekst: 'Vang monsters met de maaltafels, delen en de ontbrekende factor.',
  top: 'Jij bent een echte monstervanger!',
  hoofdstukken: [
    { leerjaar: 2, ico: '🐣', titel: 'Tafels van 2, 5 en 10', tekst: 'Verdubbelen en tellen met vijf.',
      badge: 'makkelijk', tafels: [2, 5, 10], plan: { keer: 10 } },
    { leerjaar: 2, ico: '🐥', titel: 'Tafels van 3 en 4', tekst: 'Drie en vier erbij.',
      badge: 'makkelijk', tafels: [3, 4], plan: { keer: 10 } },
    { leerjaar: 2, ico: '🐰', titel: 'Het gat in de kleine tafels', tekst: '4 × ? = 20. Welk getal ontbreekt?',
      badge: 'gemiddeld', tafels: KLEINE_TAFELS, plan: { ontbreekt: 10 } },
    { leerjaar: 2, ico: '🍪', titel: 'Delen door 2, 3, 4, 5 en 10', tekst: '20 : 4. De kleine tafels achterstevoren.',
      badge: 'gemiddeld', tafels: KLEINE_TAFELS, plan: { delen: 10 } },
    { leerjaar: 2, ico: '🥇', titel: 'Het kleine monsterexamen', tekst: 'De kleine tafels door elkaar.',
      badge: 'gemiddeld', tafels: KLEINE_TAFELS, plan: { keer: 5, ontbreekt: 3, delen: 2 } },
    { leerjaar: 3, ico: '🦊', titel: 'Tafels van 6, 7, 8 en 9', tekst: 'De lastigste monsters van allemaal.',
      badge: 'gemiddeld', tafels: [6, 7, 8, 9], plan: { keer: 10 } },
    { leerjaar: 3, ico: '🔁', titel: 'Het gat in het monster', tekst: '6 × ? = 42. Welk getal ontbreekt?',
      badge: 'gemiddeld', tafels: ALLE_TAFELS, plan: { ontbreekt: 10 } },
    { leerjaar: 3, ico: '➗', titel: 'Delen', tekst: '42 : 6. De tafel achterstevoren.',
      badge: 'gemiddeld', tafels: ALLE_TAFELS, plan: { delen: 10 } },
    { leerjaar: 3, ico: '👾', titel: 'Monsterjacht', tekst: 'Geen keuzes. Typ zelf het antwoord in.',
      badge: 'gemiddeld', tafels: ALLE_TAFELS, plan: { typ: 10 } },
    { leerjaar: 3, ico: '🏆', titel: 'Het grote monsterexamen', tekst: 'Alles door elkaar. Durf je het aan?',
      badge: 'moeilijk', tafels: ALLE_TAFELS, plan: { keer: 4, ontbreekt: 2, delen: 2, typ: 2 } }
  ],
  zaadjes: function (soort, h) {
    var out = [];
    h.tafels.forEach(function (a) {
      for (var b = 1; b <= MAX; b++) out.push({ a: a, b: b });
    });
    return out;
  },
  maak: function (soort, z) {
    var a = z.a, b = z.b, p = a * b, sl = soort + '|' + a + 'x' + b;
    if (soort === 'keer') {
      return { soort: soort, sleutel: sl, a: a, b: b, p: p, ans: String(p),
        options: keuzes(p, afleidersKeer(a, b)) };
    }
    if (soort === 'typ') {
      return { soort: soort, sleutel: sl, a: a, b: b, p: p, ans: String(p),
        typen: { scheider: '', hulp: 'Typ een getal in het vakje.',
          velden: [{ ph: '0', aria: 'Jouw antwoord', ant: p, max: 3 }] } };
    }
    if (soort === 'ontbreekt') {
      // soms ontbreekt het linkse getal, soms het rechtse
      var links = Math.random() < 0.5;
      var juist = links ? a : b, ander = links ? b : a;
      return { soort: soort, sleutel: sl, a: a, b: b, p: p, links: links, ans: String(juist),
        options: keuzes(juist, afleidersFactor(juist, ander)) };
    }
    return { soort: 'delen', sleutel: sl, a: a, b: b, p: p, ans: String(b),
      options: keuzes(b, afleidersFactor(b, a)) };
  },
  teken: function (v) { return monster(v.a * 7 + v.b); },
  reactie: function (v, ok) {
    var m = document.getElementById('monster');
    if (!m) return;
    m.classList.add(ok ? 'gevangen' : 'mis');
    // het monster verdwijnt in de kooi; laat niet zomaar een leeg vak achter
    if (ok) setTimeout(function () {
      if (m.isConnected) m.parentNode.innerHTML = '<span class="stempel">👾 in de kooi!</span>';
    }, reduced ? 0 : 650);
  },
  scherm: function (v) { return som(v); },
  vraag: function (v, nr) {
    var kop = 'Monster ' + nr + ': ';
    if (v.soort === 'ontbreekt') return { titel: kop + 'welk getal ontbreekt?', sub: 'Zoek het getal dat het vraagteken vervangt.' };
    if (v.soort === 'delen') return { titel: kop + 'hoeveel is ' + v.p + ' gedeeld door ' + v.a + '?', sub: 'Denk aan de tafel van ' + v.a + '.' };
    if (v.soort === 'typ') return { titel: kop + 'hoeveel is ' + v.a + ' keer ' + v.b + '?', sub: 'Typ zelf het antwoord in.' };
    return { titel: kop + 'hoeveel is ' + v.a + ' keer ' + v.b + '?' };
  },
  uitleg: function (v) {
    if (v.soort === 'delen') return v.p + ' : ' + v.a + ' = ' + v.b + ', want ' + v.a + ' × ' + v.b + ' = ' + v.p + '.';
    if (v.soort === 'ontbreekt') return v.a + ' × ' + v.b + ' = ' + v.p + '.';
    return v.a + ' keer ' + v.b + ' is ' + v.p + '. En ' + v.b + ' × ' + v.a + ' geeft evenveel.';
  },
  kort: function (v) { return som(v); },
  test: function (check) {
    check(omgekeerd(42) === 24 && omgekeerd(40) === 4, 'cijfers omwisselen');
    var proef = function (a, b, moet) {
      check(afleidersKeer(a, b).indexOf(moet) > -1, 'afleider ' + moet + ' ontbreekt bij ' + a + ' x ' + b);
    };
    proef(6, 7, 48);   // een rij te ver
    proef(6, 7, 36);   // een rij te kort
    proef(6, 7, 24);   // 42 met de cijfers omgewisseld
    proef(2, 3, 5);    // opgeteld in plaats van vermenigvuldigd
    proef(9, 8, 81);   // de buurtafel
    // bij grote producten is optellen geen geloofwaardige fout meer
    check(afleidersKeer(8, 9).indexOf(17) === -1, 'bij 72 staat optellen er niet bij');
    ALLE_TAFELS.concat([1]).forEach(function (a) {
      for (var b = 1; b <= MAX; b++) {
        var af = afleidersKeer(a, b), fa = afleidersFactor(b, a);
        check(af.length === 3 && af.indexOf(a * b) === -1, 'drie bruikbare afleiders bij ' + a + ' x ' + b);
        check(af.every(positief), 'geen nul of negatief getal als afleider bij ' + a + ' x ' + b);
        check(fa.length === 3 && fa.indexOf(b) === -1, 'drie bruikbare factorafleiders bij ' + a + ' x ' + b);
        check(fa.every(function (x) { return x > 0 && x <= MAX + 2; }), 'factorafleiders blijven kleine getallen');
      }
    });
    check(som({ soort: 'keer', a: 6, b: 7 }) === '6 × 7', 'som van een keervraag');
    check(som({ soort: 'delen', a: 6, b: 7, p: 42 }) === '42 : 6', 'som van een deelvraag');
    check(som({ soort: 'ontbreekt', a: 6, b: 7, p: 42, links: true }) === '? × 7 = 42', 'gat links');
    for (var mk = 0; mk < 24; mk++) {
      check(monster(mk).indexOf('<svg') === 0 && monster(mk).indexOf('aria-label') > -1, 'monster ' + mk + ' is een geldige tekening');
    }
  }
};
