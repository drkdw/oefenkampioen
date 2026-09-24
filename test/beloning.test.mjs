import { SPELLEN } from '../spellen/index.js';
import { STICKERS, sterrenVoor, stickerVoor, datumVan, mengDagen, dagErbij, dagenDezeMaand, dagNummer, voorstelVoor, boekVoor }
  from '../beloning.js';

export function beloningTests(check) {
  var alle = [];
  SPELLEN.forEach(function (s) {
    check((STICKERS[s.id] || []).length === s.hoofdstukken.length, s.id + ': precies een sticker per hoofdstuk');
    alle = alle.concat(STICKERS[s.id] || []);
  });
  check(new Set(alle).size === alle.length, 'elke sticker is anders');
  // a sticker is something of its own to collect: never an icon that already means something
  var iconen = new Set([].concat.apply(SPELLEN.map(function (s) { return s.ico; }),
    SPELLEN.map(function (s) { return s.hoofdstukken.map(function (h) { return h.ico; }); })));
  check(alle.every(function (e) { return !iconen.has(e); }), 'geen sticker is ook een icoon: ' + alle.filter(function (e) { return iconen.has(e); }).join(' '));
  check(alle.every(function (e) { return typeof e === 'string' && e.length > 0; }), 'geen lege sticker');
  // a sticker earned in a higher school year stays in the book after switching back
  var nep = { id: 'x', hoofdstukken: [{ leerjaar: 1 }, { leerjaar: 3 }, { leerjaar: 3 }] };
  var boek = boekVoor(nep, { 'x:1': { score: 10, van: 10 }, 'x:2': { score: 8, van: 10 } }, 1);
  check(boek.map(function (r) { return r.i; }).join() === '0,1', 'stickerboek: eigen leerjaar plus verdiende extra');
  check(boekVoor(nep, {}, 3).length === 3, 'stickerboek: alles tot het leerjaar');
  check(stickerVoor('klok', 1) === STICKERS.klok[1] && stickerVoor('nietbestaand', 0) === '', 'stickerVoor');

  [[4, 10, 0], [5, 10, 1], [6, 10, 1], [7, 10, 2], [8, 10, 2], [9, 10, 3], [10, 10, 3],
    [9, 20, 0], [10, 20, 1], [13, 20, 1], [14, 20, 2], [17, 20, 2], [18, 20, 3],
    [7, 15, 0], [8, 15, 1], [10, 15, 1], [11, 15, 2], [13, 15, 2], [14, 15, 3]].forEach(function (t) {
    check(sterrenVoor({ score: t[0], van: t[1] }) === t[2], t[0] + '/' + t[1] + ' geeft ' + t[2] + ' sterren');
  });
  check(sterrenVoor(undefined) === 0 && sterrenVoor({ score: '<b>', van: 10 }) === 0 && sterrenVoor({ score: 3, van: 0 }) === 0,
    'geen of kapotte score geeft 0 sterren');

  check(datumVan(new Date(2026, 8, 4)) === '2026-09-04', 'datumVan zet nullen ervoor');
  check(JSON.stringify(mengDagen(['2026-09-02', '2026-09-01', '2026-09-02', 'x', 5], ['2026-08-31']))
    === JSON.stringify(['2026-08-31', '2026-09-01', '2026-09-02']), 'mengDagen: uniek, gesorteerd, enkel geldige datums');
  var veel = [];
  for (var d = 1; d <= 70; d++) veel.push(datumVan(new Date(2026, 0, d)));
  var bewaard = mengDagen(veel, []);
  check(bewaard.length === 60 && bewaard[59] === '2026-03-11' && bewaard[0] === '2026-01-11', 'mengDagen houdt de laatste 60');
  check(mengDagen(['2026-09-01'], ['2026-09-03']).length === 2, 'samenvoegen verliest geen dag');
  check(dagErbij(['2026-09-01'], '2026-09-01').length === 1, 'dezelfde dag telt maar een keer');
  check(dagenDezeMaand(['2026-08-30', '2026-09-01', '2026-09-20'], '2026-09-24') === 2, 'dagenDezeMaand telt enkel die maand');
  check(dagNummer('1970-01-02') === 1 && dagNummer('2026-09-25') - dagNummer('2026-09-24') === 1, 'dagNummer');

  // the suggestion: always a real chapter within the school year, and the three rules in order
  for (var lj = 1; lj <= 6; lj++) {
    for (var dag = 0; dag < 12; dag++) {
      var willekeurig = {};
      SPELLEN.forEach(function (s) {
        s.hoofdstukken.forEach(function (h, i) {
          var r = (i * 7 + dag * 3 + lj) % 5;
          if (r > 0) willekeurig[s.id + ':' + i] = { score: [0, 4, 6, 8, 10][r], van: 10 };
        });
      });
      var v = voorstelVoor(SPELLEN, willekeurig, lj, dag);
      check(v.reden === 'alles' || (v.spel.hoofdstukken[v.index] && v.spel.hoofdstukken[v.index].leerjaar <= lj),
        'voorstel binnen leerjaar ' + lj);
    }
  }
  var leeg = voorstelVoor(SPELLEN, {}, 1, 0);
  check(leeg.reden === 'nieuw' && leeg.spel.hoofdstukken[leeg.index].leerjaar === 1, 'zonder scores: iets nieuws uit het 1ste leerjaar');
  var eenSter = {};
  eenSter[SPELLEN[3].id + ':' + SPELLEN[3].hoofdstukken.findIndex(function (h) { return h.leerjaar === 1; })] = { score: 6, van: 10 };
  var v2 = voorstelVoor(SPELLEN, eenSter, 1, 0);
  check(v2.reden === 'verbeter' && v2.spel === SPELLEN[3] && v2.beste.score === 6, 'een hoofdstuk met 1 ster gaat voor op iets nieuws');
  var alles3 = {};
  SPELLEN.forEach(function (s) { s.hoofdstukken.forEach(function (h, i) { if (h.leerjaar <= 2) alles3[s.id + ':' + i] = { score: 10, van: 10 }; }); });
  check(voorstelVoor(SPELLEN, alles3, 2, 5).reden === 'alles', 'alles 3 sterren geeft reden alles');
  var a = voorstelVoor(SPELLEN, {}, 3, 0), b = voorstelVoor(SPELLEN, {}, 3, 1);
  check(a.spel !== b.spel, 'een andere dag begint bij een ander spel');
}
