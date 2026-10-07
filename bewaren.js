// the backup files, without any screen code so the format can be tested on its own.
// Two kinds of file: one child (made by "Deel"), or everyone (a copy of everything in storage).
// Reading a file never trusts it: every part is rebuilt through the same merge functions the
// app uses, so a broken or strange file can only add less, never something wrong.
import { mengBeste, mengGespeeld, mengDagen, naarIndeling2, INDELING, niveauVan, GOUD } from './beloning.js';

// raised only when the format changes in a way an older app cannot read; a newer app keeps
// reading every older version
export var KIND_VERSIE = 1;
var LEERJAREN = [1, 2, 3, 4, 5, 6], AANTALLEN = [10, 15, 20], DATUM = /^\d{4}-\d{2}-\d{2}$/;
// the day the file was made, shown before restoring so a parent can tell an old file from a new one
function datumOfNiets(d) { return typeof d === 'string' && DATUM.test(d) ? d : null; }

function geldigeInstellingen(i) {
  var uit = {};
  if (LEERJAREN.indexOf(Number(i.leerjaar)) > -1) uit.leerjaar = Number(i.leerjaar);
  if (AANTALLEN.indexOf(Number(i.aantal)) > -1) uit.aantal = Number(i.aantal);
  if (typeof i.tempo === 'boolean') uit.tempo = i.tempo;
  if (typeof i.voorlezen === 'boolean') uit.voorlezen = i.voorlezen;
  return uit;
}
// chapter numbers from before layout 2 are moved, for every per-chapter part alike
function schoonKind(ruw, indeling) {
  var oud = indeling !== INDELING;
  function hoofdstukken(x) { var o = x && typeof x === 'object' && !Array.isArray(x) ? x : {}; return oud ? naarIndeling2(o) : o; }
  return {
    naam: typeof ruw.naam === 'string' ? ruw.naam : '',
    instellingen: geldigeInstellingen(ruw.instellingen && typeof ruw.instellingen === 'object' ? ruw.instellingen : {}),
    beste: mengBeste(hoofdstukken(ruw.beste), {}),
    gespeeld: mengGespeeld(hoofdstukken(ruw.gespeeld), {}),
    niveau: mengGespeeld(hoofdstukken(ruw.niveau), {}),
    dagen: mengDagen(ruw.dagen, [])
  };
}

export function maakKindBestand(kind, vandaag) {
  return {
    app: 'oefenkampioen', soort: 'kind', versie: KIND_VERSIE, indeling: INDELING, gemaakt: vandaag,
    naam: kind.naam, instellingen: kind.instellingen,
    beste: kind.beste, gespeeld: kind.gespeeld, niveau: kind.niveau, dagen: kind.dagen
  };
}

// the full backup is a plain copy of storage: one entry per key, the value a string as stored
function uitVolledig(data) {
  var lijst;
  try { lijst = JSON.parse(data['oefenkampioen-profielen']); } catch (e) { lijst = null; }
  if (!Array.isArray(lijst)) throw new Error('geen bewaarbestand');
  var indeling = Number(data['oefenkampioen-indeling']) || 1;
  function lees(k, leeg) { try { return typeof data[k] === 'string' ? JSON.parse(data[k]) : leeg; } catch (e) { return leeg; } }
  return lijst.filter(function (p) { return p && typeof p.naam === 'string' && typeof p.sleutel === 'string'; }).map(function (p) {
    var pf = p.sleutel ? ':' + p.sleutel : '';
    return schoonKind({
      naam: p.naam,
      instellingen: {
        leerjaar: data['oefenkampioen-leerjaar' + pf], aantal: data['oefenkampioen-aantal' + pf],
        tempo: data['oefenkampioen-tempo' + pf] === undefined ? undefined : data['oefenkampioen-tempo' + pf] === 'aan',
        voorlezen: data['oefenkampioen-voorlezen' + pf] === undefined ? undefined : data['oefenkampioen-voorlezen' + pf] === 'aan'
      },
      beste: lees('oefenkampioen-beste' + pf, {}), gespeeld: lees('oefenkampioen-gespeeld' + pf, {}),
      niveau: lees('oefenkampioen-niveau' + pf, {}), dagen: lees('oefenkampioen-dagen' + pf, [])
    }, indeling);
  });
}

// the full backup gets the day it was made as one extra key; a file from before that has none
export function maakVolledigBestand(data, vandaag) {
  var uit = {};
  Object.keys(data).forEach(function (k) { uit[k] = data[k]; });
  uit['oefenkampioen-gemaakt'] = vandaag;
  return uit;
}

// returns the children in the file, cleaned, and the day it was made (or null);
// throws 'geen bewaarbestand' or 'nieuwere versie'
export function leesBestand(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('geen bewaarbestand');
  if (data.app === 'oefenkampioen' && data.soort === 'kind') {
    if (!(Number(data.versie) >= 1)) throw new Error('geen bewaarbestand');
    if (Number(data.versie) > KIND_VERSIE) throw new Error('nieuwere versie');
    return { soort: 'kind', gemaakt: datumOfNiets(data.gemaakt), kinderen: [schoonKind(data, Number(data.indeling) || 1)] };
  }
  if (typeof data['oefenkampioen-profielen'] === 'string') {
    return { soort: 'alles', gemaakt: datumOfNiets(data['oefenkampioen-gemaakt']), kinderen: uitVolledig(data) };
  }
  throw new Error('geen bewaarbestand');
}

// what a parent sees before saying yes
export function samenvatting(kind) {
  var toetsen = 0, goud = 0;
  Object.keys(kind.gespeeld).forEach(function (k) { toetsen += kind.gespeeld[k]; });
  Object.keys(kind.beste).forEach(function (k) { if (niveauVan(kind.niveau, kind.beste, k) >= GOUD) goud++; });
  return { hoofdstukken: Object.keys(kind.beste).length, toetsen: toetsen, goud: goud, dagen: kind.dagen.length };
}

// the merge itself, also pure: never lower anything that is already here
export function voegKindSamen(hier, daar) {
  return {
    beste: mengBeste(hier.beste, daar.beste),
    gespeeld: mengGespeeld(hier.gespeeld, daar.gespeeld),
    niveau: mengGespeeld(hier.niveau, daar.niveau),
    dagen: mengDagen(hier.dagen, daar.dagen)
  };
}
