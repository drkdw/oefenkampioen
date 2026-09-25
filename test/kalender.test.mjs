// Recomputes every calendar question from the question text, the screen and the month sheet,
// independently of spellen/kalender.js: real month lengths, the week from Monday, the seasons.
import KAL from '../spellen/kalender.js';

var KEER = 8;
var WEEK = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
var JAAR = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
var RANGWOORD = ['eerste', 'tweede', 'derde', 'vierde', 'vijfde', 'zesde', 'zevende', 'achtste', 'negende', 'tiende', 'elfde', 'twaalfde'];
// days in a month of a given year, from the Gregorian leap year rule
function dagenIn(m, jaar) { return new Date(Date.UTC(jaar, m + 1, 0)).getUTCDate(); }
var GEWOON = 2025, SCHRIKKEL = 2024;
// astronomical seasons as Flemish schools teach them: first and last day as [month, day]
var SEIZOEN = {
  winter: { van: [11, 21], tot: [2, 20], ico: '❄️' }, lente: { van: [2, 21], tot: [5, 20], ico: '🌷' },
  zomer: { van: [5, 21], tot: [8, 22], ico: '☀️' }, herfst: { van: [8, 23], tot: [11, 20], ico: '🍂' }
};
// day of the year for [month, day] in a common year
function doy(md) { var t = 0; for (var i = 0; i < md[0]; i++) t += dagenIn(i, GEWOON); return t + md[1]; }
function inSeizoen(naam, dag) {
  var s = SEIZOEN[naam], a = doy(s.van), b = doy(s.tot);
  return a <= b ? dag >= a && dag <= b : dag >= a || dag <= b;
}
function maandDagen(m) { var r = []; for (var d = 1; d <= dagenIn(m, GEWOON); d++) r.push(doy([m, d])); return r; }
function heleMaandIn(naam, m) { return maandDagen(m).every(function (d) { return inSeizoen(naam, d); }); }
function raaktSeizoen(naam, m) { return maandDagen(m).some(function (d) { return inSeizoen(naam, d); }); }
function groot(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

export function kalenderTests(check) {
  var n = 0;
  KAL.hoofdstukken.forEach(function (h) {
    Object.keys(h.plan).forEach(function (soort) {
      KAL.zaadjes(soort, h).forEach(function (z) {
        for (var k = 0; k < KEER; k++) { n++; een(check, soort, z, h); }
      });
    });
  });
  return n;
}

function juisteKeuzes(check, v, goed, waar) {
  var juist = v.options.filter(function (o) { return goed(o.text); });
  var ok = v.options.filter(function (o) { return o.ok; });
  check(juist.length === 1, waar + ': ' + juist.length + ' keuzes zijn juist (' + v.options.map(function (o) { return o.text; }).join(', ') + ')');
  check(ok.length === 1 && goed(ok[0].text), waar + ': de knop die de app goed rekent (' + ok.map(function (o) { return o.text; }) + ') is fout');
}

function een(check, soort, z, h) {
  var v = KAL.maak(soort, z, h), waar = h.titel + ' ' + soort + ' ' + JSON.stringify(z);
  var t = KAL.vraag(v, 1).titel, sub = KAL.vraag(v, 1).sub || '', uitleg = KAL.uitleg(v);
  var scherm = KAL.scherm(v), svg = String(KAL.teken(v) || ''), r;

  if ((r = /welke dag is de (\w+) dag van de week\?$/.exec(t))) {
    var nr = RANGWOORD.indexOf(r[1]) + 1, dag = WEEK[nr - 1];
    check(nr >= 1 && nr <= 7 && /maandag/.test(sub), waar + ': "' + t + '" geen weekdag of zegt niet waar de week begint');
    check(scherm === 'dag ' + nr, waar + ': schermpje "' + scherm + '" past niet bij de ' + r[1] + ' dag');
    juisteKeuzes(check, v, function (x) { return x === dag; }, waar);
    check(uitleg.indexOf('dag ' + nr + ' is ' + dag) > -1, waar + ': uitleg "' + uitleg + '" klopt niet');
  } else if ((r = /welke dag komt (na|voor) (\w+)\?$/.exec(t))) {
    var i = WEEK.indexOf(r[2]), buur = WEEK[(i + (r[1] === 'na' ? 1 : 6)) % 7];
    check(i > -1 && scherm === groot(r[2]), waar + ': schermpje "' + scherm + '" past niet bij ' + r[2]);
    juisteKeuzes(check, v, function (x) { return x === buur; }, waar);
    check(uitleg.indexOf(WEEK.join(', ')) > -1, waar + ': uitleg "' + uitleg + '" zet de week niet juist');
  } else if ((r = /welke maand is de (\w+) maand van het jaar\?$/.exec(t))) {
    var mn = RANGWOORD.indexOf(r[1]);
    check(mn > -1 && scherm === 'maand ' + (mn + 1), waar + ': schermpje "' + scherm + '" past niet bij de ' + r[1] + ' maand');
    juisteKeuzes(check, v, function (x) { return x === JAAR[mn]; }, waar);
    check(uitleg === 'Maand ' + (mn + 1) + ' van het jaar is ' + JAAR[mn] + '.', waar + ': uitleg "' + uitleg + '" klopt niet');
  } else if ((r = /welke maand komt na (\w+)\?$/.exec(t))) {
    var volgende = JAAR[(JAAR.indexOf(r[1]) + 1) % 12];
    check(JAAR.indexOf(r[1]) > -1 && scherm === groot(r[1]), waar + ': schermpje "' + scherm + '" past niet bij ' + r[1]);
    juisteKeuzes(check, v, function (x) { return x === volgende; }, waar);
    check(uitleg === 'Na ' + r[1] + ' komt ' + volgende + '.', waar + ': uitleg "' + uitleg + '" klopt niet');
  } else if ((r = /in welk seizoen valt (\w+)\?$/.exec(t))) {
    var m = JAAR.indexOf(r[1]);
    // a season is a right choice as soon as the month has days in it: then a month split over two seasons fails
    juisteKeuzes(check, v, function (x) { return SEIZOEN[x] && raaktSeizoen(x, m); }, waar);
    Object.keys(SEIZOEN).forEach(function (x) { check(svg.indexOf(SEIZOEN[x].ico) === -1, waar + ': de tekening verklapt het seizoen'); });
    seizoenUitleg(check, uitleg, m, waar);
  } else if ((r = /welke maand valt in de (\w+)\?$/.exec(t))) {
    var s = r[1];
    check(SEIZOEN[s] && svg.indexOf(SEIZOEN[s].ico) > -1, waar + ': het plaatje past niet bij de ' + s);
    juisteKeuzes(check, v, function (x) { return JAAR.indexOf(x) > -1 && raaktSeizoen(s, JAAR.indexOf(x)); }, waar);
    var okm = v.options.filter(function (o) { return o.ok; })[0];
    if (okm) check(heleMaandIn(s, JAAR.indexOf(okm.text)), waar + ': ' + okm.text + ' valt niet helemaal in de ' + s);
    if (okm) seizoenUitleg(check, uitleg, JAAR.indexOf(okm.text), waar);
  } else if ((r = /hoeveel dagen heeft (\w+)( in een gewoon jaar)?\?$/.exec(t))) {
    var ml = JAAR.indexOf(r[1]);
    // February without the year stated has two right answers
    check(ml !== 1 || r[2], waar + ': februari zonder te zeggen welk jaar');
    var lang = dagenIn(ml, GEWOON);
    check(ml === 1 || dagenIn(ml, SCHRIKKEL) === lang, waar + ': lengte hangt af van het jaar');
    juisteKeuzes(check, v, function (x) { return Number(x) === lang; }, waar);
    lengteUitleg(check, uitleg, ml, waar);
  } else if ((r = /welke maand heeft (\d+) dagen\?$/.exec(t))) {
    var nd = Number(r[1]);
    // February counts as 28 in a common and 29 in a leap year
    juisteKeuzes(check, v, function (x) { var k = JAAR.indexOf(x); return k > -1 && (dagenIn(k, GEWOON) === nd || dagenIn(k, SCHRIKKEL) === nd); }, waar);
    var okl = v.options.filter(function (o) { return o.ok; })[0];
    if (okl) lengteUitleg(check, uitleg, JAAR.indexOf(okl.text), waar);
  } else if ((r = /het is (\w+)\. Welke dag is het over (\d+) dagen\?$/.exec(t))) {
    var start = WEEK.indexOf(r[1]), stap = Number(r[2]), eind = WEEK[(start + stap) % 7];
    check(start > -1 && scherm === groot(r[1]) + ' + ' + stap, waar + ': schermpje "' + scherm + '" past niet');
    juisteKeuzes(check, v, function (x) { return x === eind; }, waar);
    var w = Math.floor(stap / 7), rest = stap % 7, u;
    if ((u = /is precies (\d+) (?:week|weken), dus het is weer (\w+)\./.exec(uitleg))) check(Number(u[1]) * 7 === stap && u[2] === eind, waar + ': uitleg "' + uitleg + '" klopt niet');
    else if ((u = /is (\d+) (?:week|weken) en (\d+) (?:dag|dagen), dus je telt er nog (\d+) bij\./.exec(uitleg))) check(Number(u[1]) * 7 + Number(u[2]) === stap && u[3] === u[2] && Number(u[2]) < 7, waar + ': uitleg "' + uitleg + '" klopt niet');
    else check(w === 0 && uitleg === 'Tel ' + stap + ' dagen verder vanaf ' + r[1] + '.', waar + ': uitleg "' + uitleg + '" klopt niet (' + w + ' weken, ' + rest + ' dagen)');
  } else if ((r = /het is (\d+) (\w+)\. Welke dag van de maand is het over (\d+) dagen\?$/.exec(t))) {
    var d0 = Number(r[1]), mt = JAAR.indexOf(r[2]), st = Number(r[3]), nieuw = d0 + st;
    // no year is given, so the new date has to exist in every year and stay in the month
    check(mt > -1 && d0 >= 1 && nieuw <= Math.min(dagenIn(mt, GEWOON), dagenIn(mt, SCHRIKKEL)), waar + ': ' + d0 + ' ' + r[2] + ' + ' + st + ' gaat over de maand heen');
    var vel = v.typen.velden;
    check(vel.length === 1 && vel[0].ant === nieuw, waar + ': app wil ' + vel.map(function (f) { return f.ant; }) + ', juist is ' + nieuw);
    check(nieuw < Math.pow(10, vel[0].max || 2), waar + ': het antwoord past niet in het vakje');
    // the month sheet: heading, number of days and the circled day
    var cellen = [...svg.matchAll(/">(\d+)<\/div>/g)].map(function (x) { return Number(x[1]); });
    var rond = /background:var\(--accent\);color:#fff">(\d+)</.exec(svg);
    check(svg.indexOf('>' + groot(r[2]) + '<') > -1, waar + ': het blaadje toont een andere maand');
    check(cellen.length === dagenIn(mt, GEWOON) && cellen.every(function (x, j) { return x === j + 1; }), waar + ': het blaadje telt ' + cellen.length + ' dagen');
    check(rond && Number(rond[1]) === d0, waar + ': op het blaadje is een andere dag omcirkeld');
    var ul = /^(\d+) \+ (\d+) = (\d+)\. (\w+) heeft (\d+) dagen, dus het is nog altijd (\w+)\.$/.exec(uitleg);
    check(ul && Number(ul[1]) === d0 && Number(ul[2]) === st && Number(ul[3]) === nieuw && Number(ul[5]) === dagenIn(mt, GEWOON) && ul[6] === r[2],
      waar + ': uitleg "' + uitleg + '" klopt niet');
  } else {
    check(false, waar + ': onbekende vraag "' + t + '"');
  }
}

function seizoenUitleg(check, uitleg, m, waar) {
  var r = /^De (\w+) begint rond (\d+) (\w+) en duurt tot rond (\d+) (\w+)\. (\w+) valt er helemaal in\.$/.exec(uitleg);
  var s = r && SEIZOEN[r[1]];
  check(s && heleMaandIn(r[1], m) && r[6] === groot(JAAR[m]), waar + ': uitleg "' + uitleg + '" past niet bij ' + JAAR[m]);
  if (!s) return;
  // the start of the next season, within a day or two of the equinox or solstice
  var van = [JAAR.indexOf(r[3]), Number(r[2])], tot = [JAAR.indexOf(r[5]), Number(r[4])];
  check(van[0] === s.van[0] && Math.abs(van[1] - s.van[1]) <= 2, waar + ': de ' + r[1] + ' begint niet rond ' + r[2] + ' ' + r[3]);
  check(tot[0] === s.tot[0] && Math.abs(tot[1] - s.tot[1] - 1) <= 2, waar + ': de ' + r[1] + ' duurt niet tot rond ' + r[4] + ' ' + r[5]);
}
function lengteUitleg(check, uitleg, m, waar) {
  var r = /^(\w+) heeft (\d+) dagen\. Alleen februari heeft er 28, of 29 in een schrikkeljaar\.$/.exec(uitleg);
  check(r && r[1] === groot(JAAR[m]) && Number(r[2]) === dagenIn(m, GEWOON), waar + ': uitleg "' + uitleg + '" klopt niet');
}
