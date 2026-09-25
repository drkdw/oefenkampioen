// Recomputes every shop question from what the child sees (the coins, notes and price tags in the
// drawing, the amounts in the question), independently of spellen/winkel.js. All sums are in cents.
import WINKEL from '../spellen/winkel.js';

var KEER = 8, ZAAIEN = 3;
// euro coins and notes that really exist, in cents
var MUNT = [1, 2, 5, 10, 20, 50, 100, 200];
var BILJET = [500, 1000, 2000, 5000, 10000, 20000];
// what a coin looks like: copper, gold, or two metals (1 euro gold ring, 2 euro silver ring)
var KOPER = '#C87137', GOUD = '#D6A419';

function isKoper(c) { return c <= 5; }
// '€ 3,05', '€ 2', '50 cent' to cents; NaN when it is not a Belgian amount
function bedrag(t) {
  var m = /^€ (\d+)(?:,(\d\d))?$/.exec(t);
  if (m) return Number(m[1]) * 100 + (m[2] ? Number(m[2]) : 0);
  m = /^(\d+) cent$/.exec(t);
  return m ? Number(m[1]) : NaN;
}
// every amount written as € x,yy in a text
function bedragen(t) { return [...t.matchAll(/€ \d+,\d\d/g)].map(function (m) { return bedrag(m[0]); }); }
// the coins and notes in a drawing, read from what is printed on them
function stukken(html) {
  return [...html.matchAll(/<svg[^>]*aria-label="([^"]*)"[^>]*>([\s\S]*?)<\/svg>/g)].map(function (m) {
    var tekst = [...m[2].matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(function (t) { return t[1]; });
    var fills = [...m[2].matchAll(/<circle[^>]*fill="([^"]+)"/g)].map(function (f) { return f[1]; });
    var s = { label: m[1], rond: /<circle/.test(m[2]), fills: fills };
    if (tekst.length === 2) s.c = tekst[1] === 'cent' ? Number(tekst[0]) : tekst[1] === 'euro' ? Number(tekst[0]) * 100 : NaN;
    else if (tekst.length === 1 && /^€\d+$/.test(tekst[0])) s.c = Number(tekst[0].slice(1)) * 100;
    else s.c = NaN;
    return s;
  });
}
function echtStuk(s) {
  if (MUNT.indexOf(s.c) > -1) {
    if (!s.rond || s.label !== (s.c < 100 ? s.c + ' cent' : '€ ' + s.c / 100)) return false;
    var buiten = s.fills[0], binnen = s.fills[1];
    if (isKoper(s.c)) return buiten === KOPER && binnen === KOPER;
    if (s.c < 100) return buiten === GOUD && binnen === GOUD;
    return s.c === 100 ? buiten === GOUD && binnen !== GOUD : buiten !== GOUD && binnen === GOUD;
  }
  return BILJET.indexOf(s.c) > -1 && !s.rond && s.label === 'biljet van ' + s.c / 100 + ' euro';
}
function som(l) { return l.reduce(function (a, s) { return a + s.c; }, 0); }

export function winkelTests(check) {
  var n = 0;
  WINKEL.hoofdstukken.forEach(function (h) {
    Object.keys(h.plan).forEach(function (soort) {
      for (var zi = 0; zi < ZAAIEN; zi++) WINKEL.zaadjes(soort, h).forEach(function (z) {
        for (var k = 0; k < KEER; k++) {
          var v = WINKEL.maak(soort, z, h);
          n++;
          een(check, v, h.titel + ' ' + soort + ' ' + JSON.stringify(z, function (key, x) { return key === 'waar' || key === 'a' || key === 'b' ? (x.naam || x) : x; }));
        }
      });
    });
  });
  return n;
}

function een(check, v, waar) {
  var svg = String(WINKEL.teken(v) || ''), vr = WINKEL.vraag(v, 1), titel = vr.titel + ' ' + (vr.sub || '');
  var uitleg = WINKEL.uitleg(v), getoond = stukken(svg), juist, fout = [];
  getoond.forEach(function (s) { if (!echtStuk(s)) fout.push(s.label + '=' + s.c); });
  check(fout.length === 0, 'winkel: munt of biljet bestaat niet of ziet er verkeerd uit: ' + fout + ', ' + waar);

  if (v.soort === 'samen') {
    // two price tags with whole euros
    var prijzen = [...svg.matchAll(/€ (\d+)<\/span>/g)].map(function (m) { return Number(m[1]); });
    check(prijzen.length === 2, 'winkel samen: twee prijskaartjes verwacht, ' + waar);
    juist = prijzen[0] + prijzen[1];
    var um = /\(€ (\d+)\) en .* \(€ (\d+)\) samen is € (\d+)\.$/.exec(uitleg);
    check(um && Number(um[1]) === prijzen[0] && Number(um[2]) === prijzen[1] && Number(um[3]) === juist, 'winkel samen: uitleg klopt niet: ' + uitleg + ', ' + waar);
    // an amount, so every choice carries the euro sign
    return keuze(check, v, juist, function (t) { var m = /^€ (\d+)$/.exec(t); return m ? Number(m[1]) : NaN; }, waar);
  }
  if (v.soort === 'gepast') {
    check(getoond.length === 1, 'winkel gepast: een stuk verwacht, ' + waar);
    check(/muntjes van 1 euro/.test(titel), 'winkel gepast: vraag gaat niet over munten van 1 euro, ' + waar);
    juist = getoond[0].c / 100;
    check(uitleg === '€ ' + juist + ',00 is evenveel als ' + juist + (juist === 1 ? ' muntje' : ' muntjes') + ' van 1 euro.', 'winkel gepast: uitleg klopt niet: ' + uitleg + ', ' + waar);
    return keuze(check, v, juist, Number, waar);
  }
  if (v.soort === 'herkennen') {
    check(getoond.length === 1, 'winkel herkennen: een stuk verwacht, ' + waar);
    juist = getoond[0].c;
    check(bedrag(uitleg.replace(/^Dit is (.*)\.$/, '$1')) === juist, 'winkel herkennen: uitleg noemt een ander stuk: ' + uitleg + ', ' + waar);
    return keuze(check, v, juist, bedrag, waar);
  }
  if (v.soort === 'wissel') {
    var pm = /(€ \d+,\d\d)<\/span>/.exec(svg), prijs = pm ? bedrag(pm[1]) : NaN;
    check(getoond.length === 1 && BILJET.indexOf(getoond[0].c) > -1, 'winkel wissel: je betaalt niet met een briefje, ' + waar);
    var betaald = getoond.length ? getoond[0].c : NaN;
    check(bedragen(titel).join() === [prijs, betaald].join(), 'winkel wissel: vraag noemt andere bedragen dan de tekening: ' + titel + ', ' + waar);
    juist = betaald - prijs;
    check(juist > 0, 'winkel wissel: briefje is niet groter dan de prijs, ' + waar);
    // you pay with the smallest note that is enough, otherwise a smaller note would also do
    check(BILJET.filter(function (b) { return b > prijs && b < betaald; }).length === 0, 'winkel wissel: een kleiner briefje was genoeg, ' + waar);
    var ub = bedragen(uitleg);
    check(ub[0] === betaald && ub[1] === prijs && ub[2] === juist, 'winkel wissel: uitleg rekent anders: ' + uitleg + ', ' + waar);
    return keuze(check, v, juist, bedrag, waar, true);
  }
  // tellen, ontbreekt and typ show the coins on the counter
  var hand = som(getoond);
  check(getoond.length > 0, 'winkel: geen munten getekend, ' + waar);
  if (v.soort === 'ontbreekt') {
    var doel = bedrag(String(WINKEL.scherm(v)));
    var tb = bedragen(titel);
    check(tb[0] === doel && tb[1] === hand, 'winkel ontbreekt: vraag zegt ' + titel + ', tekening toont ' + hand + ' cent, scherm ' + doel + ', ' + waar);
    juist = doel - hand;
    check(MUNT.indexOf(juist) > -1, 'winkel ontbreekt: het verschil ' + juist + ' is geen muntstuk, ' + waar);
    var uo = /^(€ \d+,\d\d) plus (.+) is (€ \d+,\d\d)\.$/.exec(uitleg);
    check(uo && bedrag(uo[1]) === hand && bedrag(uo[2]) === juist && bedrag(uo[3]) === doel, 'winkel ontbreekt: uitleg klopt niet: ' + uitleg + ', ' + waar);
    return keuze(check, v, juist, bedrag, waar);
  }
  juist = hand;
  // the explanation lists exactly the coins in the drawing and their total
  var ut = /^(.+) = (€ \d+,\d\d)\.$/.exec(uitleg);
  var genoemd = ut ? ut[1].split(' + ').map(bedrag) : [];
  check(ut && genoemd.slice().sort().join() === getoond.map(function (s) { return s.c; }).sort().join() && bedrag(ut[2]) === juist,
    'winkel ' + v.soort + ': uitleg klopt niet met de tekening: ' + uitleg + ', ' + waar);
  if (v.soort === 'typ') {
    var f = v.typen.velden, euro = Math.floor(juist / 100), cent = juist % 100;
    check(f.length === 2 && v.typen.scheider === ',' && f[0].ant === euro && f[1].ant === cent && f[1].pad &&
      euro < Math.pow(10, f[0].max || 2) && cent < Math.pow(10, f[1].max || 2),
    'winkel typ: vakjes aanvaarden ' + f.map(function (x) { return x.ant; }).join(',') + ', juist is ' + euro + ',' + cent + ', ' + waar);
    return;
  }
  return keuze(check, v, juist, bedrag, waar, true);
}

// exactly one option has the right value, and it is the one marked right
function keuze(check, v, juist, lees, waar, notatie) {
  var t = v.options.map(function (o) { return o.text; });
  var goed = v.options.filter(function (o) { return lees(o.text) === juist; }), ok = v.options.filter(function (o) { return o.ok; });
  check(goed.length === 1 && ok.length === 1 && goed[0] === ok[0], 'winkel: juist is ' + juist + ', app kleurt ' + ok.map(function (o) { return o.text; }) + ' goed, keuzes ' + t + ', ' + waar);
  check(t.every(function (x) { return !isNaN(lees(x)); }), 'winkel: onleesbare keuze in ' + t + ', ' + waar);
  if (notatie) check(t.every(function (x) { return /^€ \d+,\d\d$/.test(x); }), 'winkel: bedrag niet als € 0,00: ' + t + ', ' + waar);
}
