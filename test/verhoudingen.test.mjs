// Recomputes every question of the ratio game from what the child sees (the question text, the
// scale card, the price card, the bar chart), independently of spellen/verhoudingen.js.
import VERH from '../spellen/verhoudingen.js';

var KEER = 8;
var DAGEN = { ma: 1, di: 2, wo: 3, do: 4, vr: 5, za: 6, zo: 7 };
// a number in Belgian notation: "12 500" or "2,5"; a decimal point is not accepted
function getal(t) { return /\d\.\d/.test(t) ? NaN : Number(String(t).trim().replace(/ /g, '').replace(',', '.')); }
function zelfde(a, b) { return Math.abs(a - b) < 1e-9; }
function zichtbaar(html) { return String(html || '').replace(/<[^>]*>/g, ' '); }
function num(re, t) { var m = re.exec(t); return m ? m.slice(1).map(getal) : null; }
var N = '(\\d[\\d ]*(?:,\\d+)?)';
function re(t) { return new RegExp(t.replace(/#/g, N)); }

export function verhoudingenTests(check) {
  var n = 0;
  VERH.hoofdstukken.forEach(function (h) {
    Object.keys(h.plan).forEach(function (soort) {
      VERH.zaadjes(soort, h).forEach(function (z) {
        for (var k = 0; k < KEER; k++) {
          n++;
          var waar = h.titel + ' ' + soort + ' ' + JSON.stringify(z);
          // a drawing or text we cannot read is a failure too, not a crash
          try { een(check, soort, VERH.maak(soort, z, h), waar); } catch (e) { check(false, 'onleesbaar: ' + waar + ' (' + e.message + ')'); }
        }
      });
    });
  });
  return n;
}

function een(check, soort, v, waar) {
  var html = String(VERH.teken(v) || ''), tek = zichtbaar(html), vr = VERH.vraag(v, 1), sch = VERH.scherm(v) || '';
  var uit = VERH.uitleg(v), vraag = vr.titel + ' ' + (vr.sub || '');
  var zien = [vraag, sch, uit, tek].concat(v.options.map(function (o) { return o.text; })).join(' | ');
  check(!/\d{5,}/.test(zien), 'notatie: getal van 5 cijfers zonder spatie, ' + waar);
  var ok = v.options.filter(function (o) { return o.ok; });
  check(ok.length === 1, 'precies een knop juist: ' + waar);
  var juist = null, stappen = [];

  if (soort === 'procent') {
    var p = num(re('^#% van # = \\?$'), sch), w = num(re('hoeveel is #% van #\\?'), vr.titel);
    check(p && w && p[0] === w[0] && p[1] === w[1], 'procent: scherm en vraag verschillen, ' + waar);
    juist = p[0] * p[1] / 100;
    var br = num(/(\d+)\/(\d+) van het getal/, vr.sub || '');
    check(br && zelfde(br[0] / br[1], p[0] / 100), 'procent: hulpbreuk ' + vr.sub + ' is geen ' + p[0] + '%, ' + waar);
    var u = num(re('^#% is (\\d+)/(\\d+), en dat van # is #\\.$'), uit);
    check(u && u[0] === p[0] && zelfde(u[1] / u[2], p[0] / 100) && u[3] === p[1], 'procent: uitleg klopt niet, ' + waar + ': ' + uit);
    stappen = u ? [u[4]] : [NaN];
  }

  if (soort === 'schaal') {
    var kaart = num(re('📏 # cm'), tek), schaal = num(re('1 cm op de kaart is # km in het echt'), tek);
    check(kaart && schaal && /hoeveel km/.test(vraag), 'schaal: tekening of vraag onleesbaar, ' + waar + ': ' + tek);
    juist = kaart[0] * schaal[0];
    var us = num(re('^# cm × # km = # km\\.$'), uit);
    check(us && us[0] === kaart[0] && us[1] === schaal[0], 'schaal: uitleg rekent met andere getallen, ' + waar + ': ' + uit);
    stappen = us ? [us[2]] : [NaN];
  }

  if (soort === 'toename' || soort === 'korting') {
    var bedrag = num(re('€ #'), vr.titel), perc = num(re('#%'), vraag);
    var erbij = /komt \d+% bij/.test(vraag), eraf = /% korting/.test(vraag);
    check(bedrag && perc && erbij !== eraf, 'procent erbij of eraf: vraag onduidelijk, ' + waar + ': ' + vraag);
    check(soort === 'toename' ? erbij : eraf, 'procent erbij of eraf: vraag past niet bij de soort, ' + waar + ': ' + vraag);
    var deel = bedrag[0] * perc[0] / 100;
    juist = erbij ? bedrag[0] + deel : bedrag[0] - deel;
    // the question has to ask for the amount after the change, not the change itself
    check(erbij ? /met btw|na een jaar/.test(vraag) : /nieuwe prijs/.test(vraag), 'procent erbij of eraf: vraag vraagt niet het eindbedrag, ' + waar + ': ' + vraag);
    var ut = num(re('^# [+−] #% \\(#\\) = #\\.$'), uit);
    check(ut && ut[0] === bedrag[0] && ut[1] === perc[0] && zelfde(ut[2], deel) && uit.indexOf(erbij ? ' + ' : ' − ') > -1,
      'procent erbij of eraf: uitleg klopt niet, ' + waar + ': ' + uit);
    stappen = ut ? [ut[3]] : [NaN];
  }

  if (soort === 'tabel') {
    var kaartje = re('# (.+) kosten € #').exec(tek), vt = re('hoeveel kosten # (.+)\\?').exec(vr.titel);
    check(kaartje && vt && kaartje[2] === vt[2], 'verhoudingstabel: kaartje en vraag gaan over iets anders, ' + waar);
    var stuk = getal(kaartje[3]) / getal(kaartje[1]);
    juist = stuk * getal(vt[1]);
    var ub = re('^1 (.+) kost € #, dus # kosten € #\\.$').exec(uit);
    check(ub && zelfde(getal(ub[2]), stuk) && getal(ub[3]) === getal(vt[1]), 'verhoudingstabel: uitleg klopt niet, ' + waar + ': ' + uit);
    stappen = ub ? [getal(ub[4])] : [NaN];
  }

  if (soort === 'snelheid') {
    var s = num(re('# km in # uur, hoeveel km per uur'), vr.titel);
    check(!!s, 'snelheid: vraag onleesbaar, ' + waar);
    juist = s[0] / s[1];
    var uv = num(re('^# : # = # km per uur\\.$'), uit);
    check(uv && uv[0] === s[0] && uv[1] === s[1], 'snelheid: uitleg rekent met andere getallen, ' + waar + ': ' + uit);
    stappen = uv ? [uv[2]] : [NaN];
  }

  if (soort === 'gemiddelde') {
    var g = num(re('gemiddelde van #, # en #\\?'), vr.titel);
    check(!!g, 'gemiddelde: vraag onleesbaar, ' + waar);
    var som = g[0] + g[1] + g[2];
    juist = som / 3;
    var ug = num(re('^# \\+ # \\+ # = #, gedeeld door 3 is #\\.$'), uit);
    check(ug && ug[0] === g[0] && ug[1] === g[1] && ug[2] === g[2] && ug[3] === som, 'gemiddelde: uitleg telt verkeerd op, ' + waar + ': ' + uit);
    stappen = ug ? [ug[4]] : [NaN];
  }

  if (soort === 'diagram') {
    // the scale from the numbers on the axis, each bar matched to the day written under it
    var as = [...html.matchAll(/<text x="-6" y="([-\d.]+)"[^>]*>(\d+)<\/text>/g)].map(function (m) { return [Number(m[1]), Number(m[2])]; });
    var y0 = as.find(function (a) { return a[1] === 0; })[0], top = as.reduce(function (a, b) { return b[1] > a[1] ? b : a; });
    var perEen = (y0 - top[0]) / top[1];
    var staven = [...html.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" fill="([^"]+)"/g)].map(function (m) {
      return { midden: Number(m[1]) + Number(m[3]) / 2, top: Number(m[2]), bodem: Number(m[2]) + Number(m[4]), kleur: m[5] };
    });
    var dagen = [...html.matchAll(/<text x="([\d.]+)" y="[\d.]+" text-anchor="middle"[^>]*>(\w+)<\/text>/g)].map(function (m) {
      return { midden: Number(m[1]), dag: m[2] };
    });
    var vd = /staaf van (\w+) aan/.exec(vr.titel);
    check(vd && DAGEN[vd[1]], 'diagram: vraag noemt geen dag, ' + waar);
    check(dagen.length === staven.length && dagen.every(function (d, i) { return DAGEN[d.dag] === i + 1; }), 'diagram: dagen niet in volgorde, ' + waar);
    var i = dagen.findIndex(function (d) { return d.dag === vd[1]; }), st = staven[i];
    check(st && Math.abs(st.midden - dagen[i].midden) < 1e-6 && Math.abs(st.bodem - y0) < 1e-6, 'diagram: staaf staat niet boven ' + vd[1] + ', ' + waar);
    juist = (y0 - st.top) / perEen;
    check(zelfde(juist, Math.round(juist)) && juist <= top[1], 'diagram: staaf eindigt niet op een heel getal, ' + waar);
    juist = Math.round(juist);
    // the highlighted bar has to be the one that is asked about
    var gekleurd = staven.filter(function (x) { return x.kleur === 'var(--accent)'; });
    check(gekleurd.length === 1 && gekleurd[0] === st, 'diagram: de gekleurde staaf is niet die van ' + vd[1] + ', ' + waar);
    var ud = /^De staaf van (\w+) staat op (\d+)\.$/.exec(uit);
    check(ud && ud[1] === vd[1], 'diagram: uitleg over een andere dag, ' + waar + ': ' + uit);
    stappen = ud ? [getal(ud[2])] : [NaN];
  }

  if (juist === null) { check(false, 'onbekende soort ' + soort); return; }
  var goed = v.options.filter(function (o) { return zelfde(getal(o.text), juist); });
  check(goed.length === 1 && goed[0].ok, soort + ': juist is ' + juist + ', de app zegt ' + ok.map(function (o) { return o.text; }) +
    ', knoppen ' + v.options.map(function (o) { return o.text; }).join('/') + ', ' + waar);
  check(stappen.every(function (x) { return zelfde(x, juist); }), soort + ': uitleg komt op iets anders uit dan ' + juist + ', ' + waar + ': ' + uit);
}
