// the app's own checks: open index.html#test and look at the console
import { pad2 } from './gereedschap.js';
import {
  SPELLEN, AANTALLEN, LEERJAREN, TEMPO, LOF, MOED, state, schoonNaam, schoonProfielen, mengBeste, naam, metNaam,
  leesTempo, secondenVoor, jarenVan, jasjesVoor, planVoor, bouwToets, maakVraag, toonStart
} from './chassis.js';
import { STICKERS, sterrenVoor, voorstelVoor } from './beloning.js';

var fouten = 0;
var check = function (ok, wat) { if (!ok) { fouten++; console.error('FOUT: ' + wat); } };

check(schoonNaam('  Sam  ') === 'Sam', 'naam wordt opgekuist');
check(schoonNaam('<img src=x>') === 'img srcx', 'tekens die markup maken verdwijnen uit de naam');
check(schoonNaam('Jean-Luc') === 'Jean-Luc', 'koppeltekens blijven');
check(schoonNaam('abcdefghijklmnopqrstuvwxyz').length === 16, 'de naam wordt afgekapt');
check(schoonNaam('Zoë') === 'Zoë' && schoonNaam('李明') === '李明', 'namen in elk schrift blijven heel');
// an imported file is untrusted: every profile is rebuilt, markup and junk never get through
var schoon = schoonProfielen([{ sleutel: 'k"><img src=z onerror=alert(1)>', naam: '<b>Lars</b>' }, null, { naam: 5 },
  { sleutel: 'emma', naam: 'emma' }, { sleutel: 'emma', naam: 'Emma dubbel' }, { sleutel: '', naam: '' }]);
check(schoon.length === 2, 'een importlijst houdt enkel geldige, unieke profielen over (nu ' + schoon.length + ')');
check(JSON.stringify(schoon).indexOf('<') === -1 && JSON.stringify(schoon).indexOf('"k"') === -1, 'geen markup in een geïmporteerd profiel');
check(!schoonProfielen({ sleutel: 'x', naam: 'X' }).length && !schoonProfielen('onzin').length, 'geen lijst betekent geen profielen');
var beste = mengBeste({ 'klok:0': { score: 9, van: 10 } }, { 'klok:0': { score: 3, van: 10 }, 'klok:1': { score: 15, van: 20 },
  'x"><img': { score: 1, van: 2 }, 'maal:2': { score: '<img>', van: 10 }, 'maal:3': { score: 12, van: 10 } });
check(beste['klok:0'].score === 9, 'herstellen overschrijft een betere score niet');
check(beste['klok:1'] && beste['klok:1'].score === 15, 'herstellen voegt een nieuwe score toe');
check(Object.keys(beste).length === 2, 'kapotte of verzonnen scores gaan niet mee (nu ' + Object.keys(beste).join(', ') + ')');
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

var alleStickers = [];
SPELLEN.forEach(function (s) {
  check((STICKERS[s.id] || []).length === s.hoofdstukken.length, s.id + ': precies een sticker per hoofdstuk');
  alleStickers = alleStickers.concat(STICKERS[s.id] || []);
});
check(new Set(alleStickers).size === alleStickers.length, 'elke sticker is anders');
check(sterrenVoor({ score: 9, van: 10 }) === 3 && sterrenVoor({ score: 13, van: 20 }) === 1 && sterrenVoor() === 0, 'sterrengrenzen');
LEERJAREN.forEach(function (lj) {
  var v = voorstelVoor(SPELLEN, {}, lj, lj);
  check(v.reden === 'nieuw' && v.spel.hoofdstukken[v.index].leerjaar <= lj, 'voorstel binnen leerjaar ' + lj);
});
var toetsen = 0;
var bewaardAantal = state.aantal, bewaardSpel = state.spel, bewaardHfd = state.hfd;
SPELLEN.forEach(function (spel) {
  state.spel = spel;
  ['ico', 'naam', 'tekst', 'zaadjes', 'maak', 'teken', 'vraag', 'uitleg', 'kort'].forEach(function (k) {
    check(spel[k] !== undefined, spel.id + ' heeft ' + k);
  });
  // an icon is one or two characters; if there are more, an escape was left behind as text
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
  // a jasje changes the presentation, never the answer and never the key
  spel.hoofdstukken.forEach(function (h, i) {
    Object.keys(h.plan).forEach(function (soort) {
      var jassen = jasjesVoor(soort, h);
      if (jassen.length < 2) return;
      spel.zaadjes(soort, h).slice(0, 8).forEach(function (z) {
        var eerste = spel.maak(soort, z, h, jassen[0]);
        jassen.slice(1).forEach(function (jasje) {
          var v = spel.maak(soort, z, h, jasje);
          check(v.ans === eerste.ans, spel.id + ' hoofdstuk ' + (i + 1) + ': jasje ' + jasje +
            ' verandert het antwoord van ' + eerste.sleutel + ' (' + v.ans + ' in plaats van ' + eerste.ans + ')');
          check(v.sleutel === eerste.sleutel, spel.id + ' hoofdstuk ' + (i + 1) + ': jasje ' + jasje +
            ' zit in de sleutel (' + v.sleutel + ' in plaats van ' + eerste.sleutel + ')');
        });
      });
    });
  });

  if (spel.test) spel.test(check);

  AANTALLEN.forEach(function (aantal) {
    state.aantal = aantal;
    spel.hoofdstukken.forEach(function (h, i) {
      var verdeling = planVoor(h, aantal), som = 0, voorraad = {};
      Object.keys(verdeling).forEach(function (k) {
        som += verdeling[k];
        check(verdeling[k] >= 1, spel.id + ' hoofdstuk ' + (i + 1) + ': elk vraagtype komt voor bij ' + aantal);
        voorraad[k] = spel.zaadjes(k, h).length;
        check(voorraad[k] >= 1, spel.id + ' hoofdstuk ' + (i + 1) + ': er is minstens een vraag voor ' + k);
        var jassen = jasjesVoor(k, h);
        check(jassen.length >= 1, spel.id + ' hoofdstuk ' + (i + 1) + ': ' + k + ' heeft minstens een jasje');
        check(jassen.filter(function (x, m) { return jassen.indexOf(x) === m; }).length === jassen.length,
          spel.id + ' hoofdstuk ' + (i + 1) + ': de jasjes van ' + k + ' zijn onderling verschillend');
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
          gezien[sl] = (gezien[sl] || 0) + 1;
          // repeats are allowed, but only as often as the too-small supply requires
          var mag = Math.ceil(verdeling[state.plan[q]] / voorraad[state.plan[q]]);
          check(gezien[sl] <= mag, spel.id + ' hoofdstuk ' + (i + 1) + ': ' + sl + ' komt ' +
            gezien[sl] + ' keer voor terwijl de voorraad er ' + mag + ' toelaat');
          check(sl !== vorige, spel.id + ' hoofdstuk ' + (i + 1) + ': twee keer na elkaar dezelfde vraag');
          vorige = sl;
          check(typeof v.ans === 'string' && v.ans.length > 0, spel.id + ': elk antwoord is ingevuld');
          check(typeof spel.teken(v) === 'string', spel.id + ': elke vraag heeft een tekening');
          check(spel.teken(v).indexOf('undefined') === -1, spel.id + ': geen undefined in de tekening');
          // scherm() may be null, but if it shows something, that must not contain undefined
          var doek = spel.scherm(v);
          check(doek === null || String(doek).indexOf('undefined') === -1, spel.id + ': geen undefined in het schermpje');
          var t = spel.vraag(v, q + 1);
          check(t && t.titel && t.titel.indexOf('undefined') === -1, spel.id + ': elke vraag heeft een tekst');
          check(spel.uitleg(v).indexOf('undefined') === -1, spel.id + ': elke uitleg is volledig');
          check(spel.kort(v).indexOf('undefined') === -1, spel.id + ': elke korte tekst is volledig');
          // Flemish notation: a comma decimal, never a period or a float artefact like 0.30000000000000004
          var alleTekst = [t.titel, t.sub || '', spel.uitleg(v), spel.kort(v), v.ans].concat(
            v.options ? v.options.map(function (o) { return o.text; }) : []).join(' | ');
          check(!/\d\.\d/.test(alleTekst), spel.id + ' hoofdstuk ' + (i + 1) + ': een punt als komma in "' + alleTekst.slice(0, 80) + '"');

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
              // the check button refuses anything longer than the field, so the answer must fit
              check(f.ant < Math.pow(10, f.max || 2), spel.id + ' hoofdstuk ' + (i + 1) + ': het antwoord ' + f.ant +
                ' past niet in een vakje van ' + (f.max || 2) + ' cijfers');
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
// the jasje mechanism itself, with a fake game: two zaadjes, three jasjes, ten questions. Without
// this the round logic would only be tested once a game actually provides jasjes.
(function () {
  state.spel = {
    id: 'nep',
    hoofdstukken: [{ leerjaar: 1, ico: '?', titel: 'nep', tekst: 'nep', plan: { x: 10 } }],
    zaadjes: function () { return [1, 2]; },
    jasjes: function () { return ['a', 'b', 'c']; },
    maak: function (soort, z, h, jasje) { return { sleutel: 's' + z, ans: String(z), jasje: jasje }; }
  };
  state.hfd = 0;
  state.aantal = 10;
  bouwToets();
  var telS = {}, telJ = {}, vorigeS = null, vorigJ = null;
  for (var q = 0; q < 10; q++) {
    var v = maakVraag(state.plan[q]);
    check(v.sleutel !== vorigeS, 'jasjes: nooit twee keer na elkaar hetzelfde zaadje');
    check(v.jasje !== vorigJ, 'jasjes: nooit twee keer na elkaar hetzelfde jasje');
    telS[v.sleutel] = (telS[v.sleutel] || 0) + 1;
    telJ[v.jasje] = (telJ[v.jasje] || 0) + 1;
    vorigeS = v.sleutel;
    vorigJ = v.jasje;
  }
  check(telS.s1 === 5 && telS.s2 === 5,
    'jasjes: twee zaadjes vullen tien vragen in gelijke rondes (nu ' + JSON.stringify(telS) + ')');
  check(Object.keys(telJ).length === 3, 'jasjes: alle drie de jasjes komen aan bod');
})();

state.aantal = bewaardAantal;
state.spel = bewaardSpel;
state.hfd = bewaardHfd;

toonStart();
var perJaar = {};
SPELLEN.forEach(function (s2) {
  s2.hoofdstukken.forEach(function (h) { perJaar[h.leerjaar] = (perJaar[h.leerjaar] || 0) + 1; });
});
// new in that year, and in brackets what a child at that level has to practise in total
var opgeteld = 0;
console.log('Hoofdstukken per leerjaar (nieuw, cumulatief): ' + LEERJAREN.map(function (lj) {
  opgeteld += perJaar[lj] || 0;
  return lj + ': ' + (perJaar[lj] || 0) + ' (' + opgeteld + ')';
}).join(',  '));
console.log(fouten === 0
  ? 'Zelfcheck klaar: ' + SPELLEN.length + ' spellen, ' + toetsen + ' toetsen doorgerekend, geen fouten.'
  : 'Zelfcheck klaar: ' + fouten + ' fouten gevonden.');
