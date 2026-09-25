// Recomputes every clock question from what the child sees, independently of spellen/klok.js:
// the hands as the page really turns them, the text on the screen and the question sentence.
import KLOK from '../spellen/klok.js';

var KEER = 8;
var GETAL = { vijf: 5, tien: 10, kwart: 15 };

// Flemish clock phrase to minutes on a 12 hour dial (0..719), or null if it is no valid phrase
function leesTijd(t) {
  var r = /^(?:(vijf|tien|kwart) (over|voor) )?(half )?(\d{1,2})( uur)?$/.exec(t);
  if (!r) return null;
  var x = Number(r[4]);
  if (x < 1 || x > 12) return null;
  if (r[5] && (r[1] || r[3])) return null;          // "kwart over 3 uur" is not how you say it
  if (!r[5] && !r[1] && !r[3]) return null;          // a bare number is no time
  if (r[1] === 'kwart' && r[3]) return null;         // "kwart over half" is not used
  var basis = r[3] ? (x - 1) * 60 + 30 : x * 60;     // "half 8" is 7:30
  var uit = r[1] ? GETAL[r[1]] * (r[2] === 'over' ? 1 : -1) : 0;
  return ((basis + uit) % 720 + 720) % 720;
}
function dial(h, m) { return (h % 12) * 60 + m; }
// reads a clock from the angles of its hands, and checks the hour hand fits the minute hand
function leesWijzers(uurGr, minGr) {
  var u = ((uurGr % 360) + 360) % 360, mi = ((minGr % 360) + 360) % 360;
  var m = Math.round(mi / 6) % 60, h = Math.floor(u / 30 + 1e-9);
  return { t: h * 60 + m, heel: Math.abs(u - (h * 30 + m * 0.5)) < 1e-6 && Math.abs(mi - m * 6) < 1e-6 };
}
var DUUR = { 'een kwartier': 15, 'een half uur': 30, 'drie kwartier': 45, '1 uur': 60, 'een uur': 60,
  'anderhalf uur': 90, '2 uur': 120, 'twee uur': 120, 'twee en een half uur': 150, 'tweeënhalf uur': 150,
  '3 uur': 180, 'drie uur': 180 };
// day parts as Team Taaladvies gives them for Belgium, and the wider everyday meaning of each
var STRIKT = { Nacht: [[0, 6]], Ochtend: [[6, 9]], Voormiddag: [[9, 12]], Middag: [[12, 14]], Namiddag: [[14, 18]], Avond: [[18, 24]] };
var RUIM = { Nacht: [[0, 6], [22, 24]], Ochtend: [[6, 12]], Voormiddag: [[6, 12]], Middag: [[12, 18]], Namiddag: [[12, 18]], Avond: [[18, 24]] };
function valtIn(deel, u, tabel) { return (tabel[deel] || []).some(function (r) { return u >= r[0] && u < r[1]; }); }
function uurVanDag(h12, marker) {
  if (marker === '’s nachts') return h12 % 12;
  if (marker === '’s morgens') return h12 % 12;
  if (marker === '’s middags') return h12 === 12 ? 12 : h12 + 12;
  if (marker === '’s avonds') return h12 % 12 + 12;
  return null;
}

// the page turns the hands in na(); catch the transforms it sets
function wijzersNa(v) {
  var el = {};
  var oud = globalThis.document.getElementById;
  globalThis.document.getElementById = function (id) {
    return el[id] || (el[id] = { style: {}, setAttribute: function (k, w) { this[k] = w; } });
  };
  try { KLOK.na(v); } finally {
    if (oud) globalThis.document.getElementById = oud; else delete globalThis.document.getElementById;
  }
  var gr = function (id) { var r = /rotate\((-?[\d.]+)deg\)/.exec((el[id] && el[id].style.transform) || ''); return r ? Number(r[1]) : NaN; };
  return leesWijzers(gr('handHour'), gr('handMin'));
}
function klokkenInSvg(svg) {
  var uren = [...svg.matchAll(/stroke-width="9"[^>]*rotate\((-?[\d.]+) 100 100\)/g)].map(function (r) { return Number(r[1]); });
  var min = [...svg.matchAll(/stroke-width="6"[^>]*rotate\((-?[\d.]+) 100 100\)/g)].map(function (r) { return Number(r[1]); });
  return uren.map(function (u, i) { return leesWijzers(u, min[i]); });
}

export function klokTests(check) {
  var n = 0;
  KLOK.hoofdstukken.forEach(function (h) {
    Object.keys(h.plan).forEach(function (soort) {
      KLOK.zaadjes(soort, h).forEach(function (z) {
        for (var k = 0; k < KEER; k++) { n++; een(check, soort, z, h); }
      });
    });
  });
  return n;
}

// the options that are right, given a test that says whether one option text is right
function juisteKeuzes(check, v, goed, waar) {
  var juist = v.options.filter(function (o) { return goed(o.text); });
  var ok = v.options.filter(function (o) { return o.ok; });
  check(juist.length === 1, waar + ': ' + juist.length + ' keuzes zijn juist (' + v.options.map(function (o) { return o.text; }).join(', ') + ')');
  check(ok.length === 1 && goed(ok[0].text), waar + ': de knop die de app goed rekent (' + ok.map(function (o) { return o.text; }) + ') is fout');
}

function een(check, soort, z, h) {
  var v = KLOK.maak(soort, z, h), waar = h.titel + ' ' + soort + ' ' + JSON.stringify(z);
  var vr = KLOK.vraag(v, 1), uitleg = KLOK.uitleg(v), svg = String(KLOK.teken(v) || '');

  if (v.soort === 'tijd' || v.soort === 'digitaal' || v.soort === 'dagdeel') {
    var w = wijzersNa(v);
    check(w.heel, waar + ': de kleine wijzer past niet bij de grote');
    if (v.soort === 'tijd') {
      juisteKeuzes(check, v, function (t) { return leesTijd(t) === w.t; }, waar);
      v.options.forEach(function (o) { check(leesTijd(o.text) !== null, waar + ': keuze "' + o.text + '" is geen Vlaamse klokzin'); });
      // on the hour the small hand is on its number, past it on the way to the next one
      var klein = Math.floor(w.t / 60) || 12, groot = (w.t % 60) / 5 || 12;
      var verwacht = 'De kleine wijzer staat ' + (w.t % 60 ? 'tussen ' + klein + ' en ' + (klein % 12 + 1) : 'op ' + klein) +
        ', de grote op ' + groot + '.';
      check(uitleg === verwacht, waar + ': uitleg "' + uitleg + '" klopt niet met de klok, verwacht "' + verwacht + '"');
    }
    if (v.soort === 'digitaal') {
      var d = /^Vraag 1: de klok staat op (.+)\.$/.exec(vr.titel), deel = /^Het is (\w+)\./.exec(vr.sub || '');
      var t12 = d ? leesTijd(d[1]) : null;
      check(t12 === w.t, waar + ': de vraag "' + vr.titel + '" noemt een andere tijd dan de wijzers');
      var kand = [t12, t12 + 720].filter(function (t) { return deel && valtIn(deel[1][0].toUpperCase() + deel[1].slice(1), Math.floor(t / 60), RUIM); });
      check(kand.length === 1, waar + ': "' + (vr.sub || '') + '" maakt niet duidelijk welk uur (' + kand.length + ' mogelijk)');
      var vel = v.typen.velden, uu = kand.length ? Math.floor(kand[0] / 60) : -1, mm = kand.length ? kand[0] % 60 : -1;
      check(vel.length === 2 && vel[0].ant === uu && vel[1].ant === mm, waar + ': app wil ' + vel.map(function (f) { return f.ant; }).join(':') + ', juist is ' + uu + ':' + mm);
      // the page accepts a typed number only when it equals ant
      check(vel.every(function (f) { return f.ant >= 0 && f.ant < Math.pow(10, f.max || 2); }), waar + ': het juiste antwoord past niet in de vakjes');
      var ju = /tel je 12 bij het uur: (\d+) \+ 12 = (\d+)\./.exec(uitleg);
      if (uu > 12) check(ju && Number(ju[1]) + 12 === uu && Number(ju[2]) === uu, waar + ': uitleg "' + uitleg + '" klopt niet');
      else if (uu === 0) check(/00:00/.test(uitleg), waar + ': uitleg "' + uitleg + '" zegt niet 00:00');
      else check(!/12 bij/.test(uitleg), waar + ': uitleg "' + uitleg + '" telt 12 bij voor de middag');
    }
    if (v.soort === 'dagdeel') {
      var q = /valt (\d+) uur (’s \w+)\?$/.exec(vr.titel);
      var uur = q ? uurVanDag(Number(q[1]), q[2]) : null;
      check(uur !== null && (uur % 12) * 60 === w.t, waar + ': de klok toont niet het uur uit de vraag "' + vr.titel + '"');
      juisteKeuzes(check, v, function (t) { return valtIn(t, uur, RUIM); }, waar);
      var ok = v.options.filter(function (o) { return o.ok; })[0];
      check(ok && valtIn(ok.text, uur, STRIKT), waar + ': ' + uur + ' uur hoort volgens Taaladvies niet bij ' + (ok && ok.text));
      var b = /^(\w+) is ongeveer van (\d+) tot (\d+) uur\.$/.exec(uitleg);
      check(b && ok && b[1] === ok.text && uur >= Number(b[2]) && uur < Number(b[3]), waar + ': uitleg "' + uitleg + '" past niet bij ' + uur + ' uur');
    }
  }

  if (v.soort === 'lezen') {
    var s = /^(\d\d):(\d\d)$/.exec(String(KLOK.scherm(v)));
    check(s, waar + ': het schermpje toont geen digitale tijd');
    var tl = s ? dial(Number(s[1]), Number(s[2])) : -1;
    juisteKeuzes(check, v, function (t) { return leesTijd(t) === tl; }, waar);
    var okL = v.options.filter(function (o) { return o.ok; })[0];
    check(okL && uitleg === s[0] + ' lees je als ' + okL.text + '.', waar + ': uitleg "' + uitleg + '" past niet');
  }

  if (v.soort === 'seconden') {
    var a = /hoeveel seconden zijn er in (\d+) minu(?:ut|ten)\?/.exec(vr.titel), b2 = /hoeveel minuten zijn (\d+) seconden\?/.exec(vr.titel);
    var juist = a ? Number(a[1]) * 60 : b2 ? Number(b2[1]) / 60 : NaN;
    check(!a || /\b1 minuut|\b([02-9]|\d\d+) minuten/.test(vr.titel), waar + ': "' + vr.titel + '" minuut/minuten fout');
    juisteKeuzes(check, v, function (t) { return Number(t) === juist; }, waar);
    var getallen = (uitleg.match(/\d+/g) || []).map(Number);
    check(a ? getallen[0] * 60 === getallen[2] && getallen[2] === juist : getallen[0] / 60 === getallen[2] && getallen[2] === juist,
      waar + ': uitleg "' + uitleg + '" klopt niet');
  }

  if (v.soort === 'duur') {
    var kl = klokkenInSvg(svg);
    check(kl.length === 2 && kl.every(function (c) { return c.heel; }), waar + ': er staan geen twee kloppende klokken');
    var dv = /van (.+) tot (.+)\?$/.exec(vr.titel);
    check(dv && leesTijd(dv[1]) === kl[0].t && leesTijd(dv[2]) === kl[1].t, waar + ': de vraag "' + vr.titel + '" past niet bij de klokken');
    var duur = ((kl[1].t - kl[0].t) % 720 + 720) % 720;
    juisteKeuzes(check, v, function (t) { return DUUR[t] === duur; }, waar);
    v.options.forEach(function (o) { check(DUUR[o.text] !== undefined, waar + ': duur "' + o.text + '" onbekend'); });
    var u2 = /^Tel verder vanaf (.+) tot je bij (.+) bent\.$/.exec(uitleg);
    check(u2 && leesTijd(u2[1]) === kl[0].t && leesTijd(u2[2]) === kl[1].t, waar + ': uitleg "' + uitleg + '" past niet bij de klokken');
  }
}
