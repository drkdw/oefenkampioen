// Recomputes every fraction and decimal question from what the child sees (the bar in the
// drawing, the sum on the screen, the question text), independently of spellen/breuken.js.
// Exact rational arithmetic with integers: [numerator, denominator], never floats.
import BREUKEN from '../spellen/breuken.js';

var KEER = 8; // maak shuffles, so every seed is built several times

function ggd(a, b) { return b ? ggd(b, a % b) : Math.abs(a); }
function Q(t, n) { var g = ggd(t, n) || 1; return [t / g, n / g]; }
function som(a, b) { return Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); }
function gelijk(a, b) { return !!a && !!b && a[0] * b[1] === b[0] * a[1]; }
// "3/4", "0,25" or "12" as an exact value; null for anything else
function waarde(t) {
  var m;
  t = String(t).trim();
  if ((m = t.match(/^(\d+)\/(\d+)$/))) return Number(m[2]) ? Q(Number(m[1]), Number(m[2])) : null;
  if ((m = t.match(/^(\d+),(\d+)$/))) return Q(Number(m[1] + m[2]), Math.pow(10, m[2].length));
  if ((m = t.match(/^\d+$/))) return [Number(t), 1];
  return null;
}
// a bar as the child sees it: how many equal pieces, how many coloured
function balk(svg) {
  var stukken = [...svg.matchAll(/<rect[^>]*width="([\d.]+)"[^>]*fill="([^"]+)"/g)];
  return { totaal: stukken.length, kleur: stukken.filter(function (s) { return s[2] !== 'var(--card-2)'; }).length,
    gelijk: new Set(stukken.map(function (s) { return s[1]; })).size === 1 };
}
function balkWaarde(svg) { var b = balk(svg); return b.totaal && b.gelijk ? Q(b.kleur, b.totaal) : null; }
function tekst(q) { return q[0] + '/' + q[1]; }

export function breukenTests(check) {
  var n = 0;
  BREUKEN.hoofdstukken.forEach(function (h) {
    Object.keys(h.plan).forEach(function (soort) {
      BREUKEN.zaadjes(soort, h).forEach(function (z) {
        for (var r = 0; r < KEER; r++) { n++; een(check, soort, z, h); }
      });
    });
  });
  return n;
}

function een(check, soort, z, h) {
  var v = BREUKEN.maak(soort, z, h), waar = h.titel + ' ' + JSON.stringify(z);
  var svg = String(BREUKEN.teken(v) || ''), scherm = String(BREUKEN.scherm(v) || '');
  var titel = BREUKEN.vraag(v, 1).titel, uitleg = BREUKEN.uitleg(v), m;
  var juist = null; // the right value, worked out from scratch
  check(!v.typen, 'breuken: onverwacht typveld, niet nagerekend, ' + waar);

  if (soort === 'vergelijk') {
    // four bars with a letter under each: the biggest coloured part wins
    var repen = [...svg.matchAll(/(<svg[\s\S]*?<\/svg>)<div[^>]*>([A-D])<\/div>/g)].map(function (x) {
      return { letter: x[2], w: balkWaarde(x[1]) };
    });
    check(repen.length === 4 && repen.every(function (x) { return x.w; }), 'vergelijken: vier repen met gelijke stukjes, ' + waar);
    var max = repen.reduce(function (a, b) { return b.w[0] * a.w[1] > a.w[0] * b.w[1] ? b : a; });
    var grootste = repen.filter(function (x) { return gelijk(x.w, max.w); });
    check(grootste.length === 1, 'vergelijken: meer dan een reep is het grootst, ' + waar);
    var ok = v.options.filter(function (o) { return o.ok; });
    check(ok.length === 1 && ok[0].text === max.letter, 'vergelijken: juist is ' + max.letter + ', app zegt ' + v.ans + ', ' + waar);
    m = uitleg.match(/^Reep ([A-D]) is (\d+\/\d+),/);
    check(m && m[1] === max.letter && gelijk(waarde(m[2]), max.w), 'vergelijken: uitleg klopt niet: ' + uitleg + ', ' + waar);
    return;
  }

  if (soort === 'herkennen') {
    juist = balkWaarde(svg);
    m = uitleg.match(/^(\d+) van de (\d+) stukjes is (\S+)\.$/);
    check(m && gelijk(Q(+m[1], +m[2]), juist) && gelijk(waarde(m[3]), juist), 'herkennen: uitleg klopt niet: ' + uitleg + ', ' + waar);
  }
  if (soort === 'gelijk') {
    juist = balkWaarde(svg);
    m = titel.match(/hetzelfde als (\d+\/\d+)\?/);
    check(m && gelijk(waarde(m[1]), juist), 'gelijkwaardig: vraag en reep tonen niet dezelfde breuk, ' + waar);
    check(v.options.every(function (o) { return !m || o.text !== m[1]; }), 'gelijkwaardig: de gevraagde breuk zelf is een keuze, ' + waar);
    m = uitleg.match(/^(\d+\/\d+) en (\d+\/\d+) zijn evenveel/);
    check(m && gelijk(waarde(m[1]), juist) && gelijk(waarde(m[2]), juist), 'gelijkwaardig: uitleg klopt niet: ' + uitleg + ', ' + waar);
  }
  if (soort === 'breukPlus' || soort === 'breukMin' || soort === 'breukPlusOngelijk') {
    m = scherm.match(/^(\d+)\/(\d+) ([+−]) (\d+)\/(\d+) = \?$/);
    check(!!m, 'breuksom: scherm onleesbaar: ' + scherm + ', ' + waar);
    if (!m) return;
    var a = Q(+m[1], +m[2]), b = Q(+m[4], +m[5]);
    juist = m[3] === '+' ? som(a, b) : som(a, [-b[0], b[1]]);
    check(soort !== 'breukPlusOngelijk' ? m[2] === m[5] : m[2] !== m[5], 'breuksom: noemers passen niet bij het hoofdstuk, ' + waar);
    if (soort === 'breukPlusOngelijk') {
      m = uitleg.match(/^(\d+)\/(\d+) is hetzelfde als (\d+)\/(\d+), en dat plus (\d+)\/(\d+) is (\d+\/\d+)\.$/);
      check(m && gelijk(Q(+m[1], +m[2]), a) && gelijk(Q(+m[3], +m[4]), a) && m[4] === m[6] &&
        gelijk(Q(+m[5], +m[6]), b) && gelijk(waarde(m[7]), juist), 'ongelijke noemer: uitleg klopt niet: ' + uitleg + ', ' + waar);
    } else {
      m = uitleg.match(/= (\d+\/\d+): de noemer blijft/);
      check(m && gelijk(waarde(m[1]), juist), 'breuksom: uitleg klopt niet: ' + uitleg + ', ' + waar);
    }
  }
  if (soort === 'breukMaal') {
    m = scherm.match(/^(\d+)\/(\d+) × (\d+) = \?$/);
    check(!!m, 'breuk maal getal: scherm onleesbaar: ' + scherm + ', ' + waar);
    if (!m) return;
    juist = Q(+m[1] * +m[3], +m[2]);
    var u = uitleg.match(/= (\d+\/\d+): de teller keer het getal/);
    check(u && gelijk(waarde(u[1]), juist), 'breuk maal getal: uitleg klopt niet: ' + uitleg + ', ' + waar);
  }
  if (soort === 'vanGetal') {
    m = titel.match(/hoeveel is (\d+)\/(\d+) van (\d+)\?/);
    check(!!m, 'breuk van een getal: vraag onleesbaar: ' + titel + ', ' + waar);
    if (!m) return;
    juist = Q(+m[1] * +m[3], +m[2]);
    check(juist[1] === 1, 'breuk van een getal: geen geheel antwoord, ' + waar);
    var u2 = uitleg.match(/^(\d+) : (\d+) = (\d+), en (\d+) keer dat is (\d+)\.$/);
    check(u2 && +u2[1] === +m[3] && +u2[2] === +m[2] && +u2[3] * +u2[2] === +u2[1] && +u2[4] === +m[1] &&
      +u2[4] * +u2[3] === +u2[5] && gelijk(waarde(u2[5]), juist), 'breuk van een getal: uitleg klopt niet: ' + uitleg + ', ' + waar);
  }
  if (soort === 'naarKomma') {
    juist = balkWaarde(svg);
    m = titel.match(/welk kommagetal is (\d+\/\d+)\?/);
    check(m && gelijk(waarde(m[1]), juist), 'naar kommagetal: vraag en reep tonen niet dezelfde breuk, ' + waar);
    check(v.options.every(function (o) { return /^\d+,\d+$/.test(o.text); }), 'naar kommagetal: elke keuze is een kommagetal, ' + waar);
    m = uitleg.match(/^(\d+\/\d+) is hetzelfde als (\S+)\.$/);
    check(m && gelijk(waarde(m[1]), juist) && gelijk(waarde(m[2]), juist), 'naar kommagetal: uitleg klopt niet: ' + uitleg + ', ' + waar);
  }
  if (soort === 'tiende') {
    var bt = balk(svg);
    check(bt.totaal === 10 && bt.gelijk, 'tienden: de reep heeft geen 10 gelijke stukjes, ' + waar);
    juist = Q(bt.kleur, 10);
    m = uitleg.match(/^(\d+) van de 10 stukjes is (\S+)\.$/);
    check(m && +m[1] === bt.kleur && gelijk(waarde(m[2]), juist), 'tienden: uitleg klopt niet: ' + uitleg + ', ' + waar);
  }
  if (soort === 'honderdste') {
    m = titel.match(/: (\d+) honderdsten,/);
    juist = m ? Q(+m[1], 100) : null;
    check(v.options.every(function (o) { return /^0,\d\d$/.test(o.text); }), 'honderdsten: elke keuze met twee cijfers na de komma, ' + waar);
    m = uitleg.match(/^(\d+) honderdsten schrijf je als (\S+)\.$/);
    check(m && gelijk(Q(+m[1], 100), juist) && gelijk(waarde(m[2]), juist), 'honderdsten: uitleg klopt niet: ' + uitleg + ', ' + waar);
  }
  if (soort === 'rondTiental' || soort === 'rondHonderdtal') {
    var stap = soort === 'rondTiental' ? 10 : 100;
    m = titel.match(/: (\d+) afgerond op het (tiental|honderdtal)\?/);
    check(m && (m[2] === 'tiental') === (stap === 10), 'afronden: vraag onleesbaar: ' + titel + ', ' + waar);
    if (!m) return;
    var getal = +m[1], rest = getal % stap, onder = getal - rest;
    // Flemish rule: from 5 (or 50) upwards you round up
    juist = [2 * rest >= stap ? onder + stap : onder, 1];
    // exactly halfway the rule decides, anywhere else the distance does
    m = 2 * rest === stap
      ? uitleg.match(/^(\d+) ligt precies in het midden: dan rond je naar boven af, dus (\d+)\.$/)
      : uitleg.match(/^(\d+) ligt het dichtst bij (\d+)\.$/);
    check(m && +m[1] === getal && +m[2] === juist[0], 'afronden: uitleg klopt niet: ' + uitleg + ', ' + waar);
  }

  check(!!juist, 'breuken: niets om na te rekenen voor ' + soort + ', ' + waar);
  if (!juist) return;
  var goed = v.options.filter(function (o) { return gelijk(waarde(o.text), juist); });
  var ok = v.options.filter(function (o) { return o.ok; });
  check(goed.length === 1, 'breuken: ' + goed.length + ' keuzes zijn ' + tekst(juist) + ' waard: ' +
    v.options.map(function (o) { return o.text; }).join(' ') + ', ' + waar);
  check(ok.length === 1 && gelijk(waarde(ok[0].text), juist), 'breuken: juist is ' + tekst(juist) + ', app zegt ' + v.ans + ', ' + waar);
  check(v.options.every(function (o) { return waarde(o.text); }), 'breuken: onleesbare keuze: ' +
    v.options.map(function (o) { return o.text; }).join(' ') + ', ' + waar);
}
