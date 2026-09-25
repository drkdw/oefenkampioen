// Recomputes every mirror question from its own drawing, independently of spellen/spiegelen.js:
// the answer marked right has to be the only right answer for what the child sees.
import SPIEGEL from '../spellen/spiegelen.js';

var N = 6;
function sleutel(v) { return v.map(function (c) { return c[0] + ',' + c[1]; }).sort().join(' '); }
function gelijk(a, b) { return sleutel(a) === sleutel(b); }
function spiegel(v, as) { return v.map(function (c) { return as === 'horizontaal' ? [N - 1 - c[0], c[1]] : [c[0], N - 1 - c[1]]; }); }
function halveSlag(v) { return v.map(function (c) { return [N - 1 - c[0], N - 1 - c[1]]; }); }
function binnen(v) { return v.every(function (c) { return c[0] >= 0 && c[0] < N && c[1] >= 0 && c[1] < N; }); }
// a child compares shapes, not exact squares: two figures look the same when one is a moved copy
function vormVan(v) {
  var r = Math.min.apply(null, v.map(function (c) { return c[0]; })), k = Math.min.apply(null, v.map(function (c) { return c[1]; }));
  return sleutel(v.map(function (c) { return [c[0] - r, c[1] - k]; }));
}
function zelfde(a, b) { return vormVan(a) === vormVan(b); }

export function spiegelTests(check) {
  var n = 0;
  SPIEGEL.hoofdstukken.forEach(function (h) {
    Object.keys(h.plan).forEach(function (soort) {
      SPIEGEL.zaadjes(soort, h).forEach(function (z) {
        var v = SPIEGEL.maak(soort, z, h), waar = h.titel + ' ' + JSON.stringify(z);
        n++;
        if (v.soort === 'klopt') {
          var echt = spiegel(v.vorm, v.as), g = v.getoond;
          // what the drawing really shows, worked out from scratch
          var klopt = { 'gespiegeld': zelfde(g, echt), 'gedraaid': zelfde(g, halveSlag(v.vorm)),
            'verschoven': zelfde(g, v.vorm), 'een vakje weg': g.length === v.vorm.length - 1 };
          var juist = Object.keys(klopt).filter(function (k) { return klopt[k]; });
          check(juist.length === 1 && juist[0] === v.ans, 'klopt de spiegeling: ' + waar + ' zegt ' + v.ans + ', tekening is ' + juist.join('+'));
          check(binnen(g) && g.length === v.vorm.length, 'klopt de spiegeling: getoonde figuur heel en in het rooster, ' + waar);
          check(v.options.filter(function (o) { return o.ok; }).map(function (o) { return o.text; }).join() === v.ans, 'klopt: de juiste knop, ' + waar);
        }
        if (v.soort === 'helft') {
          var echt2 = spiegel(v.vorm, v.as);
          var goed = v.kandidaten.filter(function (k) { return gelijk(k.v, echt2); });
          check(goed.length === 1 && goed[0].ok && goed[0].text === v.ans, 'welke helft: precies een rooster is de spiegeling, ' + waar);
          check(v.kandidaten.every(function (k) { return binnen(k.v); }), 'welke helft: elk rooster binnen de rand, ' + waar);
        }
        if (v.soort === 'tellen') {
          var heel = v.vorm.concat(spiegel(v.vorm, v.as));
          check(new Set(heel.map(function (c) { return c.join(); })).size === Number(v.ans), 'hoeveel vakjes: ' + waar);
        }
        if (v.vorm) {
          check(v.vorm.every(function (c) { return v.as === 'horizontaal' ? c[0] < N / 2 : c[1] < N / 2; }), 'de helft raakt de as niet: ' + waar);
        }
      });
    });
  });
  return n;
}
