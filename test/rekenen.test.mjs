// Recomputes every question of "Bruggen bouwen" from what the child sees (the sum on screen, the
// question text and the drawing), independently of spellen/rekenen.js: the answer marked right
// has to be the only right answer, and the explanation must not contradict it.
import BRUG from '../spellen/rekenen.js';

var KEER = 8; // maak shuffles and picks at random, so every seed is built several times
var ORD = ['eerste', 'tweede', 'derde', 'vierde', 'vijfde', 'zesde', 'zevende', 'achtste'];

// Belgian notation -> number: real minus sign, space between thousands, decimal comma
function getal(t) {
  t = String(t).trim();
  if (!/^−?\d{1,3}( \d{3})*(,\d+)?$|^−?\d+(,\d+)?$/.test(t)) return NaN;
  return Number(t.replace('−', '-').replace(/ /g, '').replace(',', '.'));
}
// number -> Belgian notation, as a child's book would print it
function schrijf(n) {
  var s = String(Math.abs(n));
  if (s.length > 4) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (n < 0 ? '−' : '') + s;
}
function som(t) {
  var m = /^(\d+) ([+−]) (\d+)$/.exec(t || '');
  return m && { a: +m[1], plus: m[2] === '+', b: +m[3] };
}
// the bridge explanation: "Spring eerst naar T (+e), dan nog +t tot U."
function brugUitleg(t) {
  var m = /^Spring eerst naar (\d+) \(([+−])(\d+)\), dan nog ([+−])(\d+) tot (\d+)\.$/.exec(t);
  return m && { tussen: +m[1], teken: m[2], eerste: +m[3], teken2: m[4], tweede: +m[5], uit: +m[6] };
}
function tegel(html) { var m = /padding:0 18px;[^>]*>([^<]+)<\/div>/.exec(html); return m && m[1]; }
function kolom(html) {
  var m = /<div>([^<]*)<\/div><div>(\S+) ([^<]*)<\/div>/.exec(html);
  return m && { a: +m[1], teken: m[2], b: +m[3] };
}

// the number line with the bridge: read the tick labels, then turn the arc ends back into numbers
function leesLijn(svg) {
  var ticks = [...svg.matchAll(/<text x="([\d.]+)" y="84"[^>]*>(\d+)<\/text>/g)].map(m => [+m[1], +m[2]]);
  if (ticks.length < 2) return null;
  var p = ticks[0], q = ticks[ticks.length - 1];
  var naar = x => Math.round(p[1] + (x - p[0]) * (q[1] - p[1]) / (q[0] - p[0]));
  var bogen = [...svg.matchAll(/<path d="M([\d.]+) 60 Q[\d.]+ \d+ ([\d.]+) 60"/g)].map(m => [naar(+m[1]), naar(+m[2])]);
  var labels = [...svg.matchAll(/y="(?:28|14)"[^>]*>([+−]\d+)<\/text>/g)].map(m => m[1]);
  var start = /<circle cx="([\d.]+)" cy="60"/.exec(svg);
  return { bogen: bogen, labels: labels, start: start && naar(+start[1]) };
}
// the straight line up to 10 or 20: the child counts ticks, so find the tick under each arc end
function leesRecht(svg) {
  var ticks = [...svg.matchAll(/<line x1="([\d.]+)" y1="44"/g)].map(m => +m[1]);
  var eind = [...svg.matchAll(/<text x="[\d.]+" y="72"[^>]*>(\d+)<\/text>/g)].map(m => +m[1]);
  var boog = /<path d="M([\d.]+) 48 Q[\d.]+ 20 ([\d.]+) 48"/.exec(svg);
  var tick = x => ticks.reduce((best, t, i) => Math.abs(t - x) < Math.abs(ticks[best] - x) ? i : best, 0);
  return boog && { van: tick(+boog[1]), naar: tick(+boog[2]), aantal: ticks.length, eind: eind };
}

// works out the answer from the screen alone; returns { ans (number or word), fouten: [...] }
function reken(v, h) {
  var sc = BRUG.scherm(v), vr = BRUG.vraag(v, 1), tk = String(BRUG.teken(v) || ''), ul = BRUG.uitleg(v);
  var titel = vr.titel.replace(/^Vraag 1: /, ''), sub = vr.sub || '', f = [], m, s, ans;
  var eis = function (ok, wat) { if (!ok) f.push(wat); };

  switch (v.soort) {
    case 'splits': {
      m = /^(\d+) \+ \? = (\d+)$/.exec(sc);
      var vakjes = [...tk.matchAll(/background:([^;]+);border:2px solid ([^;]+);[^>]*>(\??)<\/div>/g)];
      var actief = vakjes.filter(x => x[2] !== 'transparent'), kleur = actief.filter(x => x[1] === 'var(--accent)');
      ans = +m[2] - +m[1];
      eis(actief.length === +m[2] && kleur.length === +m[1], 'tienkader toont ' + kleur.length + ' van ' + actief.length);
      eis(actief.filter(x => x[3] === '?').length === ans, 'aantal vraagtekens is niet ' + ans);
      eis(ul === m[1] + ' en ' + ans + ' samen zijn ' + m[2] + '.', 'uitleg: ' + ul);
      break;
    }
    case 'vlot': {
      s = som(sc); ans = s.plus ? s.a + s.b : s.a - s.b;
      var r = leesRecht(tk), tot = r.eind[r.eind.length - 1];
      eis(r.eind[0] === 0 && r.aantal === tot + 1, 'getallenlijn: streepjes kloppen niet');
      eis(r.van === s.a && r.naar === ans, 'getallenlijn: boog van ' + r.van + ' naar ' + r.naar);
      eis(ans >= 0 && ans <= h.tot, 'uitkomst ' + ans + ' buiten tot ' + h.tot);
      if (h.tot === 20) eis(Math.floor(ans / 10) === Math.floor(s.a / 10), 'zonder brug, maar ' + sc + ' gaat over het tiental');
      eis(ul.startsWith(s.a + (s.plus ? ' + ' : ' − ') + s.b + ' = ' + ans + '.'), 'uitleg: ' + ul);
      break;
    }
    case 'som': case 'gat': case 'typ': {
      if (v.soort === 'gat') {
        m = /^(\d+) ([+−]) \? = (\d+)$/.exec(sc);
        s = { a: +m[1], plus: m[2] === '+', uit: +m[3] };
        ans = s.plus ? s.uit - s.a : s.a - s.uit; s.b = ans;
      } else {
        m = /^hoeveel is (\d+) (plus|min) (\d+)\?$/.exec(titel);
        s = { a: +m[1], plus: m[2] === 'plus', b: +m[3] };
        if (v.soort === 'som') {
          var s2 = som(sc);
          eis(s2 && s2.a === s.a && s2.b === s.b && s2.plus === s.plus, 'scherm ' + sc + ' en vraag verschillen');
        }
        ans = s.plus ? s.a + s.b : s.a - s.b; s.uit = ans;
      }
      eis(s.uit > 0 && s.uit < h.tot, 'uitkomst ' + s.uit + ' buiten tot ' + h.tot);
      // a real bridge: crosses a ten, and a jump of whole tens crosses a hundred
      var rond = s.b % 10 === 0 ? 100 : 10;
      eis(Math.floor(s.a / rond) !== Math.floor(s.uit / rond) && s.a % 10 !== 0, 'geen echte brug: ' + s.a + ' naar ' + s.uit);
      var u = brugUitleg(ul), t = s.plus ? '+' : '−';
      if (!u) { eis(false, 'uitleg onleesbaar: ' + ul); break; }
      var tussenIn = s.plus ? s.a < u.tussen && u.tussen < s.uit : s.uit < u.tussen && u.tussen < s.a;
      eis(u.teken === t && u.teken2 === t && u.uit === s.uit && u.eerste + u.tweede === s.b && u.eerste > 0 && u.tweede > 0 &&
        (s.plus ? s.a + u.eerste : s.a - u.eerste) === u.tussen && u.tussen % rond === 0 && tussenIn, 'uitleg klopt niet: ' + ul);
      if (v.soort !== 'typ') {
        var l = leesLijn(tk);
        eis(l && l.start === s.a, 'getallenlijn begint niet bij ' + s.a);
        eis(l && l.bogen.length === 2 && l.bogen[0][0] === s.a && l.bogen[0][1] === u.tussen &&
          l.bogen[1][0] === u.tussen && l.bogen[1][1] === s.uit, 'getallenlijn: bogen ' + JSON.stringify(l && l.bogen));
        var verwacht = v.soort === 'gat' ? [] : [t + u.eerste, t + u.tweede];
        eis(l && l.labels.join() === verwacht.join(), 'getallenlijn: labels ' + (l && l.labels));
      }
      break;
    }
    case 'volgend':
      m = /^welk getal komt (na|voor) (\d+)\?$/.exec(titel);
      ans = m[1] === 'na' ? +m[2] + 1 : +m[2] - 1;
      eis(getal(tegel(tk)) === +m[2], 'tegel toont niet ' + m[2]);
      eis(ul === (m[1] === 'na' ? 'Na ' : 'Voor ') + m[2] + ' komt ' + ans + '.', 'uitleg: ' + ul);
      break;
    case 'rang': {
      var dieren = [...tk.matchAll(/<span style="font-size:(\d+)px/g)].map(x => +x[1]);
      var plek = dieren.indexOf(46);
      eis(dieren.filter(x => x === 46).length === 1, 'niet precies een dier met een randje');
      ans = ORD[plek];
      eis(ul === 'Het dier met het randje staat op de ' + ans + ' plaats.', 'uitleg: ' + ul);
      break;
    }
    case 'sprongen': {
      var rij = [...tk.matchAll(/>([^<]+)<\/div>/g)].map(x => x[1]);
      var stap = +/^Je telt in sprongen van (\d+)\.$/.exec(sub)[1];
      eis(rij.pop() === '?', 'de rij eindigt niet op een vraagteken');
      rij = rij.map(Number);
      eis(rij.every((x, i) => !i || x - rij[i - 1] === stap), 'rij ' + rij + ' springt niet per ' + stap);
      ans = rij[rij.length - 1] + stap;
      eis(ul === 'Je telt in sprongen van ' + stap + ': na ' + rij[rij.length - 1] + ' komt ' + ans + '.', 'uitleg: ' + ul);
      break;
    }
    case 'tientallen': case 'eenheden': {
      m = /^hoeveel (tientallen|eenheden) zitten er in (\d+)\?$/.exec(titel);
      var n = +m[2], T = Math.floor(n / 10), E = n % 10;
      ans = m[1] === 'tientallen' ? T : E;
      eis(getal(tegel(tk)) === n, 'tegel toont niet ' + n);
      eis(sub === (m[1] === 'tientallen' ? n + ' = ? tientallen en ' + E + ' eenheden.' : n + ' = ' + T + ' tientallen en ? eenheden.'), 'hulpzin: ' + sub);
      eis(ul === n + ' bestaat uit ' + T + ' tientallen en ' + E + ' eenheden.', 'uitleg: ' + ul);
      break;
    }
    case 'dubbel': case 'helft': {
      m = /^wat is (het dubbele|de helft) van (\d+)\?$/.exec(titel);
      var d = +m[2];
      ans = m[1] === 'het dubbele' ? 2 * d : d / 2;
      eis(Number.isInteger(ans), 'de helft van een oneven getal');
      eis(getal(tegel(tk)) === d, 'tegel toont niet ' + d);
      eis(ul.startsWith((m[1] === 'het dubbele' ? 'Het dubbele van ' : 'De helft van ') + d + ' is ' + ans + ':'), 'uitleg: ' + ul);
      break;
    }
    case 'paar': {
      var even = /is even\?$/.test(titel);
      var goed = v.options.filter(o => (getal(o.text) % 2 === 0) === even);
      eis(goed.length === 1, goed.length + ' keuzes zijn ' + (even ? 'even' : 'oneven'));
      ans = goed.length ? getal(goed[0].text) : NaN;
      eis(ul === ans + ' is ' + (even ? 'even: je kan het' : 'oneven: je kan het niet') + ' door twee delen zonder rest.', 'uitleg: ' + ul);
      break;
    }
    case 'omgekeerd':
      if ((m = /^\? = (\d+) \+ (\d+)$/.exec(sc))) ans = +m[1] + +m[2];
      else { m = /^(\d+) = (\d+) \+ \?$/.exec(sc); ans = +m[1] - +m[2]; }
      eis(ans > 0, 'ontbrekend getal ' + ans + ' is niet positief');
      eis(ul.endsWith('dus ? = ' + ans + '.'), 'uitleg: ' + ul);
      break;
    case 'duizendtal': case 'honderdtal': {
      m = /^welk cijfer staat bij de (duizendtallen|honderdtallen) in (\d+)\?$/.exec(titel);
      var g = +m[2], D = Math.floor(g / 1000), H = Math.floor(g / 100) % 10;
      // the helper sentence fixes the meaning: the digit in that place, not all hundreds together
      ans = m[1] === 'duizendtallen' ? D : H;
      eis(getal(tegel(tk)) === g, 'tegel toont niet ' + g);
      eis(sub === (m[1] === 'duizendtallen' ? g + ' = ? duizendtallen, ' + H + ' honderdtallen, ...' : g + ' = ' + D + ' duizendtallen, ? honderdtallen, ...'), 'hulpzin: ' + sub);
      eis(ul === g + ' bestaat uit ' + D + ' duizendtallen, ' + H + ' honderdtallen en de rest.', 'uitleg: ' + ul);
      break;
    }
    case 'cijferPlus': case 'cijferMin': case 'cijferKeer': case 'cijferDelen': case 'cijferDelen2': {
      m = /^hoeveel is (\d+) (plus|min|keer|gedeeld door) (\d+)\?$/.exec(titel);
      var x = +m[1], y = +m[3], k = kolom(tk), op = { plus: '+', min: '−', keer: '×', 'gedeeld door': ':' }[m[2]];
      eis(k && k.a === x && k.b === y && k.teken === op, 'kolom toont iets anders dan ' + titel);
      ans = op === '+' ? x + y : op === '−' ? x - y : op === '×' ? x * y : x / y;
      eis(Number.isInteger(ans) && ans >= 0, x + ' ' + op + ' ' + y + ' is geen geheel getal');
      if (v.soort === 'cijferPlus') eis(ans < 10000, 'optellen boven 10 000');
      if (v.soort === 'cijferDelen2') eis(y >= 10 && y <= 99, 'deler ' + y + ' heeft geen twee cijfers');
      var vgl = x + ' ' + op + ' ' + y + ' = ' + ans + (op === ':' ? ', want ' + ans + ' × ' + y + ' = ' + x + '.' : '.');
      eis(ul === vgl, 'uitleg: ' + ul);
      break;
    }
    case 'grootgetal': {
      m = /^hoeveel duizendtallen zitten er in ([\d ]+)\?$/.exec(titel);
      var gg = getal(m[1]);
      eis(m[1] === schrijf(gg), 'notatie ' + m[1]);
      eis(getal(tegel(tk)) === gg, 'tegel toont niet ' + m[1]);
      ans = Math.floor(gg / 1000);
      // the explanation splits the number: thousands plus the rest, and that has to add up
      var ud = /^([\d ]+) = (\d+) duizendtallen en (\d+)\.$/.exec(ul);
      eis(ud && getal(ud[1]) === gg && +ud[2] * 1000 + +ud[3] === gg && +ud[3] < 1000, 'uitleg klopt niet: "' + ul + '"');
      eis(!/deel door/i.test(sub), 'hulpzin laat delen, dat geeft een kommagetal: "' + sub + '"');
      break;
    }
    case 'temp': {
      m = /^het is (\d+) °C, en het koelt (\d+) graden af\.$/.exec(titel);
      var st = +m[1], val = +m[2];
      ans = st - val;
      eis(ans < 0, 'eindigt niet onder nul');
      var ut = /^(\d+) − (\d+) = (\S+) °C\. Tot 0 zakt het (\d+) graden, daarna nog (\d+) onder nul\.$/.exec(ul);
      eis(ut && +ut[1] === st && +ut[2] === val && getal(ut[3]) === ans && +ut[4] === st && +ut[5] === -ans, 'uitleg: ' + ul);
      break;
    }
    case 'macht': {
      var e = +/10<sup[^>]*>(\d+)<\/sup>/.exec(tk)[1];
      eis(titel === 'hoeveel is 10 tot de macht ' + e + '?', 'vraag en tekening verschillen: ' + titel);
      ans = Math.pow(10, e);
      var um = e === 1 ? /^10 tot de macht 1 is gewoon (10)\.$/.exec(ul) : /^([\d × ]+) = ([\d ]+)\.$/.exec(ul);
      eis(um && (e === 1 || (um[1].split(' × ').length === e && um[1].split(' × ').every(z => z === '10') && getal(um[2]) === ans)),
        'uitleg: ' + ul);
      break;
    }
    default:
      eis(false, 'onbekend soort ' + v.soort);
  }
  return { ans: ans, fouten: f };
}

export function brugTests(check) {
  var n = 0;
  BRUG.hoofdstukken.forEach(function (h) {
    Object.keys(h.plan).forEach(function (soort) {
      BRUG.zaadjes(soort, h).forEach(function (z) {
        for (var keer = 0; keer < KEER; keer++) {
          var v = BRUG.maak(soort, z, h), waar = h.titel + ' ' + JSON.stringify(z) + ': ';
          n++;
          var r;
          try { r = reken(v, h); } catch (e) { check(false, waar + 'kan de vraag niet lezen (' + e.message + ')'); continue; }
          r.fouten.forEach(function (w) { check(false, waar + w); });
          var juist = typeof r.ans === 'number' ? schrijf(r.ans) : r.ans;
          var zelfde = function (t) { return typeof r.ans === 'number' ? getal(t) === r.ans : t === r.ans; };
          if (v.options) {
            var ok = v.options.filter(function (o) { return o.ok; });
            check(ok.length === 1 && ok[0].text === juist, waar + 'de app keurt ' + ok.map(o => o.text) + ' goed, juist is ' + juist);
            var dubbel = v.options.filter(function (o) { return !o.ok && zelfde(o.text); });
            check(!dubbel.length, waar + 'ook ' + dubbel.map(o => o.text) + ' is juist');
            check(v.options.every(function (o) { return typeof r.ans !== 'number' || o.text === schrijf(getal(o.text)); }),
              waar + 'keuze in verkeerde notatie: ' + v.options.map(o => o.text));
          }
          if (v.typen) {
            // the same rule as controleer in chassis.js: a whole number that fits, equal to ant
            var f = v.typen.velden[0], neemt = function (t) {
              var g = parseInt(t, 10); return !isNaN(g) && g >= 0 && g < Math.pow(10, f.max || 2) && g === f.ant;
            };
            check(v.typen.velden.length === 1 && neemt(String(r.ans)) && !neemt(String(r.ans + 1)) && !neemt(String(r.ans - 1)),
              waar + 'typen aanvaardt ' + r.ans + ' niet als enige, ant is ' + f.ant);
          }
        }
      });
    });
  });
  return n;
}
