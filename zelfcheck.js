// de eigen controles: open index.html#test en bekijk de console
import { pad2 } from './gereedschap.js';
import {
  SPELLEN, AANTALLEN, LEERJAREN, TEMPO, LOF, MOED, state, schoonNaam, naam, metNaam,
  leesTempo, secondenVoor, jarenVan, planVoor, bouwToets, maakVraag, toonStart
} from './chassis.js';

var fouten = 0;
var check = function (ok, wat) { if (!ok) { fouten++; console.error('FOUT: ' + wat); } };

check(schoonNaam('  Sam  ') === 'Sam', 'naam wordt opgekuist');
check(schoonNaam('<img src=x>') === 'img srcx', 'tekens die markup maken verdwijnen uit de naam');
check(schoonNaam('Jean-Luc') === 'Jean-Luc', 'koppeltekens blijven');
check(schoonNaam('abcdefghijklmnopqrstuvwxyz').length === 16, 'de naam wordt afgekapt');
check(metNaam('Bijna%!') === 'Bijna!' || naam() !== '', 'zonder naam blijft het bericht kloppen');
LOF.concat(MOED).forEach(function (t) {
  check(t.indexOf('%') > -1, 'elk bericht heeft een plaats voor de naam: ' + t);
  check(t.replace('%', '').indexOf('  ') === -1, 'geen dubbele spatie zonder naam: ' + t);
});
check(AANTALLEN[0] === 10 && AANTALLEN[AANTALLEN.length - 1] === 20, 'van tien tot twintig vragen');
check(SPELLEN.length > 0, 'er staat minstens een spel in');
check(leesTempo() === false || leesTempo() === true, 'de tempo-schakelaar leest een ja of een nee');
var ids = SPELLEN.map(function (s) { return s.id; });
check(ids.filter(function (x, i) { return ids.indexOf(x) === i; }).length === ids.length, 'elk spel heeft een eigen id');

var toetsen = 0;
var bewaardAantal = state.aantal, bewaardSpel = state.spel, bewaardHfd = state.hfd;
SPELLEN.forEach(function (spel) {
  state.spel = spel;
  ['ico', 'naam', 'tekst', 'zaadjes', 'maak', 'teken', 'vraag', 'uitleg', 'kort'].forEach(function (k) {
    check(spel[k] !== undefined, spel.id + ' heeft ' + k);
  });
  // een icoon is een teken of twee; staat er meer, dan is een escape blijven staan als tekst
  check(spel.ico.length <= 4, spel.id + ': het spelicoon is geen echt teken (' + spel.ico + ')');
  var sec = secondenVoor(spel);
  check(sec >= 5 && sec <= 60, spel.id + ': de tempotijd is bruikbaar (' + sec + 's)');
  check(TEMPO[spel.id], spel.id + ': heeft een eigen tempotijd, niet de standaard');
  spel.hoofdstukken.forEach(function (h, i) {
    check(h.ico.length <= 4, spel.id + ' hoofdstuk ' + (i + 1) + ': het icoon is geen echt teken (' + h.ico + ')');
    check(LEERJAREN.indexOf(h.leerjaar) > -1,
      spel.id + ' hoofdstuk ' + (i + 1) + ': leerjaar is een getal van 1 tot 6 (nu ' + h.leerjaar + ')');
  });
  check(jarenVan(spel).length >= 1, spel.id + ': dekt minstens een leerjaar');
  if (spel.test) spel.test(check);

  AANTALLEN.forEach(function (aantal) {
    state.aantal = aantal;
    spel.hoofdstukken.forEach(function (h, i) {
      var verdeling = planVoor(h, aantal), som = 0;
      Object.keys(verdeling).forEach(function (k) {
        som += verdeling[k];
        check(verdeling[k] >= 1, spel.id + ' hoofdstuk ' + (i + 1) + ': elk vraagtype komt voor bij ' + aantal);
        check(spel.zaadjes(k, h).length >= verdeling[k],
          spel.id + ' hoofdstuk ' + (i + 1) + ': genoeg verschillende vragen voor ' + k + ' bij ' + aantal);
      });
      check(som === aantal, spel.id + ' hoofdstuk ' + (i + 1) + ' telt ' + aantal + ' vragen (nu ' + som + ')');

      for (var ronde = 0; ronde < 5; ronde++) {
        state.hfd = i;
        bouwToets();
        var gezien = {}, vorige = null;
        for (var q = 0; q < state.aantal; q++) {
          var v = maakVraag(state.plan[q]);
          var sl = v.sleutel;
          check(!!sl, spel.id + ': elke vraag heeft een sleutel om dubbels te herkennen');
          check(!gezien[sl], spel.id + ' hoofdstuk ' + (i + 1) + ': dezelfde vraag twee keer (' + sl + ')');
          check(sl !== vorige, spel.id + ' hoofdstuk ' + (i + 1) + ': twee keer na elkaar dezelfde vraag');
          gezien[sl] = 1;
          vorige = sl;
          check(typeof v.ans === 'string' && v.ans.length > 0, spel.id + ': elk antwoord is ingevuld');
          check(typeof spel.teken(v) === 'string', spel.id + ': elke vraag heeft een tekening');
          check(spel.teken(v).indexOf('undefined') === -1, spel.id + ': geen undefined in de tekening');
          var t = spel.vraag(v, q + 1);
          check(t && t.titel && t.titel.indexOf('undefined') === -1, spel.id + ': elke vraag heeft een tekst');
          check(spel.uitleg(v).indexOf('undefined') === -1, spel.id + ': elke uitleg is volledig');
          check(spel.kort(v).indexOf('undefined') === -1, spel.id + ': elke korte tekst is volledig');

          if (v.options) {
            check(v.options.length === 4, spel.id + ': vier keuzes');
            check(v.options.filter(function (o) { return o.ok; }).length === 1, spel.id + ': precies een juist antwoord');
            var tt = v.options.map(function (o) { return o.text; });
            check(tt.filter(function (x, k) { return tt.indexOf(x) === k; }).length === 4, spel.id + ': vier verschillende keuzes');
            check(tt.indexOf(v.ans) > -1, spel.id + ': het juiste antwoord staat erbij');
          } else {
            check(!!v.typen, spel.id + ': een vraag zonder keuzes laat typen');
            check(v.typen.velden.length >= 1, spel.id + ': minstens een invulvakje');
            var getypt = v.typen.velden.map(function (f) {
              check(typeof f.ant === 'number' && f.ant >= 0, spel.id + ': elk vakje heeft een antwoord');
              return f.pad ? pad2(f.ant) : String(f.ant);
            }).join(v.typen.scheider);
            check(getypt === v.ans, spel.id + ': de vakjes samen geven het antwoord (' + getypt + ' vs ' + v.ans + ')');
          }
        }
        toetsen++;
      }
    });
  });
});
state.aantal = bewaardAantal;
state.spel = bewaardSpel;
state.hfd = bewaardHfd;

toonStart();
var perJaar = {};
SPELLEN.forEach(function (s2) {
  s2.hoofdstukken.forEach(function (h) { perJaar[h.leerjaar] = (perJaar[h.leerjaar] || 0) + 1; });
});
console.log('Hoofdstukken per leerjaar: ' + LEERJAREN.map(function (lj) {
  return lj + ': ' + (perJaar[lj] || 0);
}).join(',  '));
console.log(fouten === 0
  ? 'Zelfcheck klaar: ' + SPELLEN.length + ' spellen, ' + toetsen + ' toetsen doorgerekend, geen fouten.'
  : 'Zelfcheck klaar: ' + fouten + ' fouten gevonden.');
