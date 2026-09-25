// Recomputes every geometry question from what the child sees (the labels and shape in the
// drawing, the solid shown, the question text), independently of spellen/meetkunde.js.
import MEETKUNDE from '../spellen/meetkunde.js';

var KEER = 8; // maak shuffles, so every seed is built several times

// faces, edges and vertices as taught in Flemish primary school: a curved surface counts as
// a face, the tip of a cone as a vertex and the rim of a cylinder or cone as an edge
var FIGUUR = {
  kubus: { vlakken: 6, ribben: 12, hoekpunten: 8 },
  balk: { vlakken: 6, ribben: 12, hoekpunten: 8 },
  cilinder: { vlakken: 3, ribben: 2, hoekpunten: 0 },
  bol: { vlakken: 1, ribben: 0, hoekpunten: 0 },
  kegel: { vlakken: 2, ribben: 1, hoekpunten: 1 },
  piramide: { vlakken: 5, ribben: 8, hoekpunten: 5 } // square base
};
var ENKEL = { vlakken: 'vlak', ribben: 'rib', hoekpunten: 'hoekpunt' };
var EMOJI = { '🎲': 'kubus', '📦': 'balk', '🥫': 'cilinder', '⚽': 'bol', '🍦': 'kegel' };

function getallen(svg) { return [...svg.matchAll(/<text[^>]*>(\d+)<\/text>/g)].map(function (m) { return +m[1]; }); }
function attr(s, naam) { var m = s.match(new RegExp(' ' + naam + '="(-?[\\d.]+)"')); return m ? +m[1] : NaN; }
// the angle between the horizontal ray and the other ray, measured from the drawn lines
function gemetenHoek(svg) {
  var lijnen = [...svg.matchAll(/<line [^>]*\/>/g)].map(function (m) { return m[0]; });
  if (lijnen.length !== 2) return NaN;
  var cx = attr(lijnen[1], 'x1'), cy = attr(lijnen[1], 'y1');
  var vlak = attr(lijnen[0], 'y2') === cy && attr(lijnen[0], 'x2') > cx && attr(lijnen[0], 'x1') === cx;
  if (!vlak) return NaN;
  return Math.round(Math.atan2(cy - attr(lijnen[1], 'y2'), attr(lijnen[1], 'x2') - cx) * 180 / Math.PI);
}
// which solid the drawing shows: an emoji, or a drawn square pyramid (4 lines from one apex)
function figuurIn(svg) {
  var e = Object.keys(EMOJI).filter(function (k) { return svg.includes(k); });
  if (e.length === 1 && !svg.includes('<svg')) return EMOJI[e[0]];
  var top = [...svg.matchAll(/<line x1="(\d+)" y1="(\d+)"/g)].map(function (m) { return m[1] + ',' + m[2]; });
  var grond = svg.match(/<polygon points="([^"]+)"/);
  if (e.length === 0 && top.length === 4 && new Set(top).size === 1 && grond && grond[1].trim().split(' ').length === 4) return 'piramide';
  return null;
}

export function meetkundeTests(check) {
  var n = 0;
  MEETKUNDE.hoofdstukken.forEach(function (h) {
    Object.keys(h.plan).forEach(function (soort) {
      MEETKUNDE.zaadjes(soort, h).forEach(function (z) {
        for (var r = 0; r < KEER; r++) { n++; een(check, soort, z, h); }
      });
    });
  });
  return n;
}

function een(check, soort, z, h) {
  var v = MEETKUNDE.maak(soort, z, h), waar = h.titel + ' ' + JSON.stringify(z);
  var svg = String(MEETKUNDE.teken(v) || ''), titel = MEETKUNDE.vraag(v, 1).titel, uitleg = MEETKUNDE.uitleg(v), m;
  var juist = null; // the right answer text, worked out from scratch
  check(!v.typen, 'meetkunde: onverwacht typveld, niet nagerekend, ' + waar);

  if (soort === 'omtrek' || soort === 'oppervlakte') {
    var zij = getallen(svg), b = zij[0], hg = zij[1];
    var rect = svg.match(/<rect [^>]*\/>/);
    var w = rect ? attr(rect[0], 'width') : NaN, hh = rect ? attr(rect[0], 'height') : NaN;
    check(zij.length === 2 && Math.abs(w * hg - hh * b) < 1e-6, 'rechthoek: de tekening heeft niet de verhouding van ' + b + ' bij ' + hg + ', ' + waar);
    var vierkant = b === hg;
    check(titel.includes(vierkant ? 'het vierkant' : 'de rechthoek'), 'rechthoek: vraag noemt de vorm verkeerd: ' + titel + ', ' + waar);
    if (soort === 'omtrek') {
      juist = String(2 * (b + hg));
      m = uitleg.match(/^(\d+) \+ (\d+) \+ (\d+) \+ (\d+) = (\d+)\.$/);
      var zijden = m ? [+m[1], +m[2], +m[3], +m[4]].sort(function (x, y) { return x - y; }).join() : '';
      check(m && zijden === [b, b, hg, hg].sort(function (x, y) { return x - y; }).join() && m[5] === juist,
        'omtrek: uitleg klopt niet: ' + uitleg + ', ' + waar);
    } else {
      juist = String(b * hg);
      m = uitleg.match(/^(\d+) × (\d+) = (\d+)\.$/);
      check(m && +m[1] === b && +m[2] === hg && m[3] === juist, 'oppervlakte: uitleg klopt niet: ' + uitleg + ', ' + waar);
    }
  }
  if (soort === 'volume') {
    var ribben = [...svg.matchAll(/font-size:26px[^>]*>(\d+)<\/div>/g)].map(function (x) { return +x[1]; });
    check(ribben.length === 3, 'volume: geen drie maten te zien, ' + waar);
    juist = String(ribben[0] * ribben[1] * ribben[2]);
    m = uitleg.match(/^(\d+) × (\d+) × (\d+) = (\d+)\.$/);
    check(m && [+m[1], +m[2], +m[3]].join() === ribben.join() && m[4] === juist, 'volume: uitleg klopt niet: ' + uitleg + ', ' + waar);
  }
  if (soort === 'driehoek') {
    var maat = getallen(svg), basis = maat[0], hoogte = maat[1];
    var p = (svg.match(/<polygon points="([^"]+)"/) || [, ''])[1].trim().split(' ').map(function (x) { return x.split(',').map(Number); });
    // right angle bottom left: the base runs to the right, the height straight up
    var rechts = p.length === 3 && p[0][1] === p[1][1] && p[0][0] === p[2][0];
    var bl = p[1][0] - p[0][0], hl = p[0][1] - p[2][1];
    check(maat.length === 2 && rechts && Math.abs(bl * hoogte - hl * basis) < 1e-6,
      'driehoek: de tekening past niet bij basis ' + basis + ' en hoogte ' + hoogte + ', ' + waar);
    check((basis * hoogte) % 2 === 0, 'driehoek: oppervlakte is geen geheel getal, ' + waar);
    juist = String(basis * hoogte / 2);
    m = uitleg.match(/^(\d+) × (\d+) : 2 = (\d+)\.$/);
    check(m && +m[1] === basis && +m[2] === hoogte && m[3] === juist, 'driehoek: uitleg klopt niet: ' + uitleg + ', ' + waar);
  }
  if (soort === 'hoek' || soort === 'graden') {
    var graden = gemetenHoek(svg);
    check(graden > 0 && graden <= 180, 'hoek: geen hoek te meten in de tekening, ' + waar);
    if (soort === 'hoek') {
      juist = graden === 90 ? 'recht' : graden === 180 ? 'gestrekt' : graden < 90 ? 'scherp' : 'stomp';
      var klopt = { recht: graden === 90, gestrekt: graden === 180, scherp: graden < 90, stomp: graden > 90 && graden < 180 };
      var zegt = /^Een rechte hoek is precies 90/.test(uitleg) ? 'recht' : /^Een gestrekte hoek is een rechte lijn: 180/.test(uitleg) ? 'gestrekt'
        : /^Een scherpe hoek is kleiner dan 90/.test(uitleg) ? 'scherp' : /^Een stompe hoek is groter dan 90 graden, maar minder dan 180/.test(uitleg) ? 'stomp' : null;
      check(zegt && klopt[zegt], 'hoek: uitleg past niet bij een hoek van ' + graden + ' graden: ' + uitleg + ', ' + waar);
    } else {
      juist = String(graden);
      // the ticks the question text promises: a small one every 10 degrees, a big one every 30
      var cx = 20, cy = 100, hoek = function (x) { return Math.round(Math.atan2(cy - +x[2], +x[1] - cx) * 180 / Math.PI); };
      var klein = [...svg.matchAll(/<circle cx="(-?[\d.]+)" cy="(-?[\d.]+)" r="1.5"/g)].map(hoek);
      var groot = [...svg.matchAll(/<circle cx="(-?[\d.]+)" cy="(-?[\d.]+)" r="3"/g)].map(hoek);
      check(groot.join() === '0,30,60,90,120,150,180', 'graden: grote stippen niet om de dertig graden: ' + groot + ', ' + waar);
      check(klein.length === 12 && klein.every(function (g) { return g % 10 === 0 && g % 30 !== 0; }), 'graden: kleine stippen niet om de tien graden: ' + klein + ', ' + waar);
      check(!/aria-label="[^"]*\d/.test(svg), 'graden: het label verklapt het antwoord, ' + waar);
      m = uitleg.match(/^Deze hoek is (\d+) graden\.$/);
      check(m && m[1] === juist, 'graden: uitleg klopt niet: ' + uitleg + ', ' + waar);
    }
  }
  if (soort === 'herkennen') {
    juist = figuurIn(svg);
    check(!!juist, 'ruimtefiguur: tekening niet herkend, ' + waar);
    check(!(v.options.some(function (o) { return o.text === 'kubus'; }) && v.options.some(function (o) { return o.text === 'balk'; })),
      'ruimtefiguur: kubus en balk samen als keuze, ' + waar);
    check(uitleg === 'Dit is een ' + juist + '.', 'ruimtefiguur: uitleg klopt niet: ' + uitleg + ', ' + waar);
  }
  if (soort === 'eigenschap') {
    m = titel.match(/hoeveel (vlakken|ribben|hoekpunten) heeft een (\w+)\?/);
    var naam = m && m[2], prop = m && m[1];
    check(m && FIGUUR[naam], 'eigenschap: vraag onleesbaar: ' + titel + ', ' + waar);
    if (!m || !FIGUUR[naam]) return;
    check(figuurIn(svg) === naam, 'eigenschap: tekening toont geen ' + naam + ', ' + waar);
    var aantal = FIGUUR[naam][prop];
    juist = String(aantal);
    check(uitleg === 'Een ' + naam + ' heeft ' + aantal + ' ' + (aantal === 1 ? ENKEL[prop] : prop) + '.',
      'eigenschap: uitleg klopt niet: ' + uitleg + ', ' + waar);
  }

  check(!!juist, 'meetkunde: niets om na te rekenen voor ' + soort + ', ' + waar);
  if (!juist) return;
  var t = v.options.map(function (o) { return o.text; });
  var goed = v.options.filter(function (o) { return o.text === juist; }), ok = v.options.filter(function (o) { return o.ok; });
  check(goed.length === 1, 'meetkunde: ' + goed.length + ' keuzes zijn ' + juist + ': ' + t.join(' ') + ', ' + waar);
  check(ok.length === 1 && ok[0].text === juist, 'meetkunde: juist is ' + juist + ', app zegt ' + v.ans + ', ' + waar);
  if (/^\d+$/.test(juist)) check(t.every(function (x) { return /^\d+$/.test(x); }), 'meetkunde: keuze is geen geheel getal: ' + t.join(' ') + ', ' + waar);
}
