// Recomputes every multiplication question from what the child sees (the sum on the screen and the
// question text), independently of spellen/maaltafels.js: the marked answer has to be the only right one.
import MAAL from '../spellen/maaltafels.js';

var KEER = 8;

// '7 × 3', '21 : 3', '? × 3 = 21' or '7 × ? = 21': returns the operands with null for the question mark
function leesSom(t) {
  var m = /^(\d+|\?) ([×:]) (\d+|\?)(?: = (\d+))?$/.exec(t);
  if (!m) return null;
  var getal = function (s) { return s === '?' ? null : Number(s); };
  return { x: getal(m[1]), op: m[2], y: getal(m[3]), z: m[4] === undefined ? null : Number(m[4]) };
}
// the whole sum with the answer filled in, and the answer itself
function reken(s) {
  if (s.z === null) {
    if (s.op === '×') return { x: s.x, y: s.y, z: s.x * s.y, ans: s.x * s.y };
    // division in primary school only has whole answers
    return s.x % s.y === 0 ? { x: s.x, y: s.y, z: s.x / s.y, ans: s.x / s.y } : null;
  }
  // a missing factor: the other factor times what number gives the product
  var ander = s.x === null ? s.y : s.x;
  if (s.z % ander !== 0) return null;
  var ont = s.z / ander;
  return { x: s.x === null ? ont : s.x, y: s.y === null ? ont : s.y, z: s.z, ans: ont };
}
// every equation in a text has to be true
function valseSommen(t) {
  var fout = [];
  var n = t.replace(/ keer /g, ' × ').replace(/ is /g, ' = ');
  for (var m of n.matchAll(/(\d+) ([×:]) (\d+) = (\d+)/g)) {
    var a = Number(m[1]), b = Number(m[3]), c = Number(m[4]);
    if (m[2] === '×' ? a * b !== c : a !== b * c) fout.push(m[0]);
  }
  return { fout: fout, tekst: n };
}

export function maalTests(check) {
  var n = 0;
  MAAL.hoofdstukken.forEach(function (h) {
    Object.keys(h.plan).forEach(function (soort) {
      MAAL.zaadjes(soort, h).forEach(function (z) {
        for (var k = 0; k < KEER; k++) {
          var v = MAAL.maak(soort, z, h), waar = h.titel + ' ' + soort + ' ' + JSON.stringify(z);
          n++;
          var scherm = String(MAAL.scherm(v)), s = leesSom(scherm);
          check(s !== null, 'maal: onleesbare som "' + scherm + '", ' + waar);
          if (!s) continue;
          var r = reken(s);
          check(r !== null, 'maal: som heeft geen heel antwoord: ' + scherm + ', ' + waar);
          if (!r) continue;
          var vr = MAAL.vraag(v, 1), titel = vr.titel + ' ' + (vr.sub || '');
          // Flemish order: the table is the number on the right of ×, or the divisor
          var tafel = r.y;
          check(h.tafels.indexOf(tafel) > -1, 'maal: ' + scherm + ' hoort niet bij de tafels ' + h.tafels + ' van ' + waar);
          check([r.x, r.y].every(function (f) { return f >= 1 && f <= 10; }) || s.op === ':', 'maal: factor buiten 1 tot 10: ' + scherm + ', ' + waar);
          if (s.op === ':') check(r.ans >= 1 && r.ans <= 10, 'maal: deling buiten de tafels: ' + scherm + ', ' + waar);
          // the question text must ask the same sum as the screen
          if (s.z === null && s.op === '×') check(titel.indexOf('hoeveel is ' + s.x + ' keer ' + s.y + '?') > -1, 'maal: vraag en som verschillen: ' + titel + ' / ' + scherm);
          if (s.op === ':') {
            check(titel.indexOf('hoeveel is ' + s.x + ' gedeeld door ' + s.y + '?') > -1, 'maal: vraag en som verschillen: ' + titel + ' / ' + scherm);
            check(!/tafel van \d+/.test(titel) || titel.indexOf('tafel van ' + s.y + '.') > -1, 'maal: verkeerde tafel als hulp: ' + titel);
          }
          if (v.options) {
            var juist = v.options.filter(function (o) { return Number(o.text) === r.ans; });
            var ok = v.options.filter(function (o) { return o.ok; });
            check(juist.length === 1 && ok.length === 1 && juist[0] === ok[0],
              'maal: ' + scherm + ' is ' + r.ans + ', app kleurt ' + ok.map(function (o) { return o.text; }) + ' goed, keuzes ' + v.options.map(function (o) { return o.text; }) + ', ' + waar);
            check(v.options.every(function (o) { return /^\d+$/.test(o.text); }), 'maal: keuze is geen getal: ' + v.options.map(function (o) { return o.text; }));
          }
          if (v.typen) {
            var f = v.typen.velden;
            check(f.length === 1 && f[0].ant === r.ans && r.ans < Math.pow(10, f[0].max || 2),
              'maal: typvak aanvaardt ' + f.map(function (x) { return x.ant; }) + ', juist is ' + r.ans + ', ' + waar);
          }
          // the explanation: every sum in it is true, and it contains the full sum of the question
          var u = valseSommen(MAAL.uitleg(v));
          check(u.fout.length === 0, 'maal: uitleg rekent fout: ' + u.fout.join(', ') + ', ' + waar);
          var vol = s.op === ':' ? r.x + ' : ' + r.y + ' = ' + r.z : r.x + ' × ' + r.y + ' = ' + r.z;
          check(u.tekst.indexOf(vol) > -1, 'maal: uitleg noemt ' + vol + ' niet: ' + MAAL.uitleg(v) + ', ' + waar);
        }
      });
    });
  });
  return n;
}
