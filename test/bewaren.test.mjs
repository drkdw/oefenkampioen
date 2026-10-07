import { maakKindBestand, leesBestand, samenvatting, voegKindSamen, KIND_VERSIE } from '../bewaren.js';
import { INDELING } from '../beloning.js';

export function bewaarTests(check) {
  var lotte = {
    naam: 'Lotte', instellingen: { leerjaar: 2, aantal: 20, tempo: false, voorlezen: true },
    beste: { 'klok:5': { score: 15, van: 15 }, 'maal:5': { score: 20, van: 20 } },
    gespeeld: { 'klok:5': 2, 'maal:5': 1 }, niveau: { 'klok:5': 15, 'maal:5': 20 }, dagen: ['2026-10-07', '2026-10-08']
  };
  // round trip through text, as a file would
  var bestand = JSON.parse(JSON.stringify(maakKindBestand(lotte, '2026-10-08')));
  check(bestand.versie === KIND_VERSIE && bestand.indeling === INDELING && bestand.soort === 'kind', 'kindbestand: kop');
  var terug = leesBestand(bestand);
  check(terug.soort === 'kind' && terug.kinderen.length === 1, 'kindbestand: een kind');
  var k = terug.kinderen[0];
  check(k.naam === 'Lotte' && JSON.stringify(k.instellingen) === JSON.stringify(lotte.instellingen) &&
    JSON.stringify(k.beste) === JSON.stringify(lotte.beste) && JSON.stringify(k.niveau) === JSON.stringify(lotte.niveau) &&
    JSON.stringify(k.gespeeld) === JSON.stringify(lotte.gespeeld) && JSON.stringify(k.dagen) === JSON.stringify(lotte.dagen),
    'kindbestand: alles komt identiek terug: ' + JSON.stringify(k));
  var sv = samenvatting(k);
  check(sv.hoofdstukken === 2 && sv.toetsen === 3 && sv.goud === 1 && sv.dagen === 2, 'samenvatting: ' + JSON.stringify(sv));

  // a file is never trusted: rubbish is dropped piece by piece, the rest still comes in
  var rommel = leesBestand({ app: 'oefenkampioen', soort: 'kind', versie: 1, indeling: INDELING, naam: 'Mats',
    instellingen: { leerjaar: 9, aantal: 12, tempo: 'ja', voorlezen: true },
    beste: { 'klok:1': { score: 11, van: 10 }, 'klok:2': { score: 7, van: 10 }, '<b>': { score: 1, van: 1 } },
    gespeeld: { 'klok:2': -3, 'klok:3': 'x', 'klok:4': 2 }, niveau: [1, 2], dagen: ['2026-13-99x', '2026-10-01', 5] }).kinderen[0];
  check(JSON.stringify(rommel.instellingen) === '{"voorlezen":true}', 'rommel: enkel geldige instellingen: ' + JSON.stringify(rommel.instellingen));
  check(JSON.stringify(rommel.beste) === '{"klok:2":{"score":7,"van":10}}', 'rommel: enkel geldige scores');
  check(JSON.stringify(rommel.gespeeld) === '{"klok:4":2}' && JSON.stringify(rommel.niveau) === '{}' &&
    JSON.stringify(rommel.dagen) === '["2026-10-01"]', 'rommel: tellingen, niveaus en dagen opgekuist');

  // what is not a backup, or comes from a newer app, is refused as a whole
  function weigert(x, reden) { try { leesBestand(x); return false; } catch (e) { return e.message === reden; } }
  check(weigert(null, 'geen bewaarbestand') && weigert([1], 'geen bewaarbestand') && weigert({ foo: 1 }, 'geen bewaarbestand') &&
    weigert({ app: 'oefenkampioen', soort: 'kind' }, 'geen bewaarbestand'), 'geen bewaarbestand wordt geweigerd');
  check(weigert({ app: 'oefenkampioen', soort: 'kind', versie: KIND_VERSIE + 1 }, 'nieuwere versie'), 'nieuwere versie wordt geweigerd');

  // a file from before layout 2 gets the chapter numbers of today, in every part
  var oud = leesBestand({ app: 'oefenkampioen', soort: 'kind', versie: 1, indeling: 1, naam: 'Oud',
    beste: { 'maal:0': { score: 9, van: 10 } }, gespeeld: { 'maal:0': 4 }, niveau: { 'maal:0': 10 }, dagen: [] }).kinderen[0];
  check(oud.beste['brug:4'] && oud.gespeeld['brug:4'] === 4 && oud.niveau['brug:4'] === 10 && !oud.beste['maal:0'], 'oud bestand: indeling 2');

  // the full backup: a copy of storage with several children
  var alles = {
    'oefenkampioen-profielen': JSON.stringify([{ sleutel: '', naam: 'Lotte' }, { sleutel: 'mats', naam: 'Mats' }, { naam: 5 }]),
    'oefenkampioen-indeling': String(INDELING),
    'oefenkampioen-beste': JSON.stringify(lotte.beste), 'oefenkampioen-niveau': JSON.stringify(lotte.niveau),
    'oefenkampioen-leerjaar': '2', 'oefenkampioen-voorlezen': 'aan',
    'oefenkampioen-beste:mats': '{kapot', 'oefenkampioen-dagen:mats': '["2026-10-08"]', 'oefenkampioen-tempo:mats': 'aan'
  };
  var a = leesBestand(alles);
  check(a.soort === 'alles' && a.kinderen.length === 2 && a.kinderen[0].naam === 'Lotte' && a.kinderen[1].naam === 'Mats', 'volledig: twee kinderen');
  check(JSON.stringify(a.kinderen[0].beste) === JSON.stringify(lotte.beste) && a.kinderen[0].instellingen.leerjaar === 2 &&
    a.kinderen[0].instellingen.voorlezen === true && a.kinderen[0].instellingen.tempo === undefined, 'volledig: Lotte klopt');
  check(JSON.stringify(a.kinderen[1].beste) === '{}' && a.kinderen[1].dagen[0] === '2026-10-08' && a.kinderen[1].instellingen.tempo === true,
    'volledig: een kapot deel van Mats kost enkel dat deel');

  // merging never lowers anything, whichever side is older
  var hier = { beste: { 'klok:5': { score: 20, van: 20 }, 'klok:6': { score: 6, van: 10 } }, gespeeld: { 'klok:5': 5 }, niveau: { 'klok:5': 20 }, dagen: ['2026-10-08'] };
  var daar = { beste: { 'klok:5': { score: 8, van: 10 }, 'klok:6': { score: 9, van: 10 }, 'klok:7': { score: 1, van: 10 } }, gespeeld: { 'klok:5': 2, 'klok:7': 1 }, niveau: { 'klok:5': 10 }, dagen: ['2026-09-01'] };
  var m = voegKindSamen(hier, daar);
  check(m.beste['klok:5'].van === 20 && m.beste['klok:6'].score === 9 && m.beste['klok:7'].score === 1, 'samenvoegen: telkens de betere score');
  check(m.gespeeld['klok:5'] === 5 && m.gespeeld['klok:7'] === 1 && m.niveau['klok:5'] === 20, 'samenvoegen: tellingen en niveaus dalen nooit');
  check(m.dagen.join() === '2026-09-01,2026-10-08', 'samenvoegen: dagen van beide');
  check(JSON.stringify(voegKindSamen(daar, hier)) === JSON.stringify(m), 'samenvoegen: de volgorde maakt niet uit');
}
