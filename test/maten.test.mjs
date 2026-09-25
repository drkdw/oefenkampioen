// Recomputes every question of the measuring game from what the child sees (the ruler, the
// measuring jug, the unit ladder, the question text), independently of spellen/maten.js.
import MATEN from '../spellen/maten.js';

var KEER = 8;
// our own unit table, everything in mm, g or ml
var EH = { mm: ['lengte', 1], cm: ['lengte', 10], dm: ['lengte', 100], m: ['lengte', 1000], km: ['lengte', 1000000],
  g: ['gewicht', 1], kg: ['gewicht', 1000], ml: ['inhoud', 1], cl: ['inhoud', 10], dl: ['inhoud', 100], l: ['inhoud', 1000] };
// what these things really measure, as a range [least, most] in mm, g or ml
var ECHT = {
  'een potlood': ['lengte', 80, 200], 'een boek': ['lengte', 150, 350], 'een deur': ['lengte', 1900, 2400],
  'een auto': ['lengte', 3000, 5500], 'een mier': ['lengte', 1, 15], 'een fiets': ['lengte', 1200, 2000],
  'een paperclip': ['lengte', 20, 50], 'de speelplaats': ['lengte', 15000, 100000],
  'een kind van acht': ['lengte', 1150, 1450], 'een bed': ['lengte', 1800, 2200],
  'een appel': ['gewicht', 80, 300], 'een valies': ['gewicht', 5000, 25000], 'een veer': ['gewicht', 0.01, 2],
  'een hond': ['gewicht', 2000, 60000], 'een pak suiker': ['gewicht', 500, 1000], 'een brief': ['gewicht', 5, 50],
  'een olifant': ['gewicht', 2000000, 7000000],
  'een glas melk': ['inhoud', 150, 300], 'een bad': ['inhoud', 100000, 300000], 'een lepel siroop': ['inhoud', 5, 15],
  'een flesje voor een baby': ['inhoud', 120, 330], 'een emmer': ['inhoud', 5000, 15000],
  'een tas koffie': ['inhoud', 100, 250], 'een aquarium': ['inhoud', 20000, 400000]
};

// a number in Belgian notation: "12 500" or "2,5"
function getal(t) { return Number(String(t).trim().replace(/ /g, '').replace(',', '.')); }
function hoeveelheid(t) {
  var m = /^(\d[\d ]*(?:,\d+)?) (\w+)$/.exec(String(t).trim());
  if (!m || !EH[m[2]]) return null;
  return { st: EH[m[2]][0], basis: getal(m[1]) * EH[m[2]][1], eh: m[2], n: getal(m[1]) };
}
function zelfde(a, b) { return Math.abs(a - b) < 1e-9; }
function zichtbaar(html) { return String(html || '').replace(/<[^>]*>/g, ' '); }
function num(re, t) { var m = re.exec(t); return m ? m.slice(1).map(getal) : null; }

export function matenTests(check) {
  var n = 0;
  MATEN.hoofdstukken.forEach(function (h) {
    Object.keys(h.plan).forEach(function (soort) {
      MATEN.zaadjes(soort, h).forEach(function (z) {
        for (var k = 0; k < KEER; k++) {
          n++;
          var waar = h.titel + ' ' + soort + ' ' + JSON.stringify(z);
          // a drawing or text we cannot read is a failure too, not a crash
          try { een(check, soort, MATEN.maak(soort, z, h), waar); } catch (e) { check(false, 'onleesbaar: ' + waar + ' (' + e.message + ')'); }
        }
      });
    });
  });
  return n;
}

function een(check, soort, v, waar) {
  var svg = String(MATEN.teken(v) || ''), vr = MATEN.vraag(v, 1), sch = MATEN.scherm(v) || '', uit = MATEN.uitleg(v);
  var vraag = vr.titel + ' ' + (vr.sub || '');
  var zien = [vraag, sch, uit, zichtbaar(svg)].concat((v.options || []).map(function (o) { return o.text; })).join(' | ');
  check(!/\d{5,}/.test(zien), 'notatie: getal van 5 cijfers zonder spatie, ' + waar + ': ' + zien.match(/\d{5,}/));
  var ok = (v.options || []).filter(function (o) { return o.ok; });
  if (v.options) check(ok.length === 1, 'precies een knop juist: ' + waar);

  // for choice questions: is exactly the marked option right, given a test for "right"
  function enig(juist, wat) {
    var goed = v.options.filter(function (o) { return juist(o.text); });
    check(goed.length === 1 && goed[0].ok, wat + ': ' + waar + ' juist volgens de app ' + ok.map(function (o) { return o.text; }) +
      ', echt juist ' + goed.map(function (o) { return o.text; }).join(' + '));
  }

  if (soort === 'liniaal') {
    // scale from the numbers printed on the ruler, length from the coloured bar
    var labels = [...svg.matchAll(/<text x="([\d.]+)"[^>]*>(\d+)<\/text>/g)].map(function (m) { return [Number(m[1]), Number(m[2])]; });
    var nul = labels.find(function (l) { return l[1] === 0; }), vijf = labels.find(function (l) { return l[1] === 5; });
    var per = (vijf[0] - nul[0]) / 5, balk = num(/<rect x="0" y="8" width="([\d.]+)"/, svg);
    var cm = (balk[0] - nul[0]) / per;
    check(Math.abs(cm - Math.round(cm)) < 0.02 && cm >= 1 && cm <= 20, 'liniaal: streep eindigt niet op een hele cm, ' + waar);
    cm = Math.round(cm);
    enig(function (t) { var q = hoeveelheid(t); return q && q.st === 'lengte' && zelfde(q.basis, cm * 10); }, 'liniaal');
    check(ok[0] && ok[0].text === cm + ' cm', 'liniaal: juiste knop moet ' + cm + ' cm zijn, ' + waar);
    var u = num(/tot (\d+), dus (\d+) cm\. Dat is (\d+) mm/, uit);
    check(u && u[0] === cm && u[1] === cm && u[2] === cm * 10, 'liniaal: uitleg klopt niet, ' + waar + ': ' + uit);
  }

  if (soort === 'liter') {
    // count the marks from the bottom of the jug up to where the water stands
    var beker = num(/<rect x="10" y="([\d.]+)" width="[\d.]+" height="([\d.]+)" rx/, svg), bodem = beker[0] + beker[1];
    var water = num(/<rect x="10" y="([-\d.]+)" width="[\d.]+" height="[\d.]+" fill="var\(--accent\)"/, svg)[0];
    var streepjes = [...svg.matchAll(/<line [^>]*y1="([\d.]+)"/g)].map(function (m) { return Number(m[1]); })
      .filter(function (y) { return y < bodem; }).sort(function (a, b) { return b - a; });
    var liter = streepjes.findIndex(function (y) { return Math.abs(y - water) < 1e-6; }) + 1;
    check(liter >= 1, 'liter: water staat niet op een streepje, ' + waar);
    // the printed numbers must agree with counting marks
    [...svg.matchAll(/<text x="[\d.]+" y="([\d.]+)"[^>]*>(\d+)<\/text>/g)].forEach(function (m) {
      check(Math.abs(streepjes[Number(m[2]) - 1] - Number(m[1])) < 1e-6, 'liter: getal ' + m[2] + ' staat niet bij het ' + m[2] + 'de streepje, ' + waar);
    });
    check(/hoeveel liter/.test(vraag), 'liter: vraag vraagt geen liters, ' + waar);
    enig(function (t) { return getal(t) === liter; }, 'liter');
    check(uit.indexOf('gevuld tot ' + liter + ' liter') > -1, 'liter: uitleg zegt iets anders dan ' + liter + ', ' + waar + ': ' + uit);
  }

  if (soort === 'om' || soort === 'typ') {
    var s = /^(\d[\d ]*(?:,\d+)?) (\w+) = \? (\w+)$/.exec(sch);
    check(!!s, 'omrekenen: scherm onleesbaar, ' + waar + ': ' + sch);
    if (!s) return;
    var van = s[2], naar = s[3], x = getal(s[1]);
    check(EH[van] && EH[naar] && EH[van][0] === EH[naar][0], 'omrekenen: ' + van + ' en ' + naar + ' horen niet samen, ' + waar);
    var r = x * EH[van][1] / EH[naar][1];
    check(r === Math.round(r), 'omrekenen: uitkomst geen heel getal, ' + waar);
    check(vraag.indexOf('hoeveel ' + naar + ' is ' + s[1] + ' ' + van) > -1, 'omrekenen: vraag en scherm verschillen, ' + waar + ': ' + vraag);
    // the unit ladder the child reads the steps from: every step must be the real one
    var trap = [...svg.matchAll(/>(\w+)<\/span>(?:<span[^>]*>×(\d+)<\/span>)?/g)].map(function (m) { return [m[1], Number(m[2] || 0)]; });
    trap.forEach(function (t, i) {
      check(EH[t[0]] && EH[t[0]][0] === EH[van][0], 'maattrap: ' + t[0] + ' hoort er niet bij, ' + waar);
      if (trap[i + 1]) check(EH[t[0]][1] / EH[trap[i + 1][0]][1] === t[1], 'maattrap: tussen ' + t[0] + ' en ' + trap[i + 1][0] + ' staat ×' + t[1] + ', ' + waar);
    });
    check(trap.some(function (t) { return t[0] === van; }) && trap.some(function (t) { return t[0] === naar; }), 'maattrap mist ' + van + ' of ' + naar + ', ' + waar);
    if (v.options) {
      enig(function (t) { var q = hoeveelheid(t); return q && q.st === EH[van][0] && zelfde(q.basis, x * EH[van][1]); }, 'omrekenen');
      check(v.options.every(function (o) { var q = hoeveelheid(o.text); return q && q.eh === naar; }), 'omrekenen: keuze in een andere maat, ' + waar);
    }
    if (v.typen) {
      var f = v.typen.velden;
      // the chassis reads the field with parseInt and compares with ant; maxlength is max
      var neemt = function (tekst) { return tekst.length <= (f[0].max || 2) && parseInt(tekst, 10) === f[0].ant; };
      check(f.length === 1 && neemt(String(r)) && !neemt(String(r + 1)) && !neemt(String(r - 1)) && !neemt(String(r * 10)),
        'typen: veld aanvaardt niet precies ' + r + ', ' + waar);
    }
    var groter = EH[van][1] > EH[naar][1], stap = groter ? EH[van][1] / EH[naar][1] : EH[naar][1] / EH[van][1];
    var e = /(\d[\d ]*) ([×:]) (\d[\d ]*) = (\d[\d ]*)\./.exec(uit);
    check(e && getal(e[1]) === x && e[2] === (groter ? '×' : ':') && getal(e[3]) === stap && getal(e[4]) === r &&
      uit.indexOf(groter ? 'kleinere maat' : 'grotere maat') > -1 && uit.indexOf(stap + ' keer ' + (groter ? 'groter' : 'kleiner')) > -1,
    'omrekenen: uitleg klopt niet, ' + waar + ': ' + uit);
  }

  if (soort === 'past') {
    var naam = /<span style="font-size:17px[^>]*>([^<]+)<\/span>/.exec(svg)[1], d = ECHT[naam];
    check(!!d, 'welke maat past: onbekend ding ' + naam);
    if (!d) return;
    var ww = { lengte: 'hoe lang is ', gewicht: 'hoeveel weegt ', inhoud: 'hoeveel kan er in ' }[d[0]];
    check(vraag.indexOf(ww + naam) > -1, 'welke maat past: vraag past niet bij ' + naam + ', ' + waar);
    // right means: the same kind of measure, and a believable size for the real thing
    enig(function (t) { var q = hoeveelheid(t); return q && q.st === d[0] && q.basis >= d[1] && q.basis <= d[2]; }, 'welke maat past');
    var q = ok[0] && hoeveelheid(ok[0].text);
    check(q && uit.indexOf(q.n + ' ' + q.eh) > -1, 'welke maat past: uitleg zegt iets anders, ' + waar + ': ' + uit);
  }

  if (soort === 'vergelijk') {
    var basis = /<span style="font-size:17px[^>]*>([^<]+)<\/span>/.exec(svg)[1], b = ECHT[basis];
    var w = /(langer|korter|zwaarder|lichter|meer|minder) (?:in )?dan (?:in )?(.+)\?/.exec(vr.titel);
    check(!!w && w[2] === basis, 'vergelijken: vraag gaat niet over de tekening, ' + waar + ': ' + vr.titel);
    if (!w || !b) return;
    var soortWoord = { langer: 'lengte', korter: 'lengte', zwaarder: 'gewicht', lichter: 'gewicht', meer: 'inhoud', minder: 'inhoud' };
    check(soortWoord[w[1]] === b[0], 'vergelijken: ' + w[1] + ' past niet bij ' + basis);
    var meer = ['langer', 'zwaarder', 'meer'].indexOf(w[1]) > -1;
    // right only when it holds for any real-life version of both things
    var zeker = function (o) { return meer ? o[1] > b[2] : o[2] < b[1]; };
    var zekerNiet = function (o) { return meer ? o[2] < b[1] : o[1] > b[2]; };
    v.options.forEach(function (o) {
      var e2 = ECHT[o.text];
      check(e2 && e2[0] === b[0], 'vergelijken: keuze ' + o.text + ' is geen ' + b[0] + ', ' + waar);
      if (e2) check(o.ok ? zeker(e2) : zekerNiet(e2), 'vergelijken: ' + o.text + (o.ok ? ' is niet zeker ' + w[1] : ' kan ook ' + w[1] + ' zijn') + ' dan ' + basis + ', ' + waar);
    });
    check(ok[0] && uit.toLowerCase().indexOf(ok[0].text) > -1 && uit.indexOf(w[1]) > -1, 'vergelijken: uitleg klopt niet, ' + waar + ': ' + uit);
  }
}
