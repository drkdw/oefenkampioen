import { shuffle, pad2, $, reduced, hoofdletter } from './gereedschap.js';
import { SPELLEN } from './spellen/index.js';
import { datumVan, mengDagen, dagErbij } from './beloning.js';

// an eight-year-old cannot keep going for more than twenty questions
var AANTALLEN = [10, 15, 20];
// removing a profile is only possible behind #admin: a child must not be able to make its own
// profile disappear, not even the harmless variant that keeps the scores
var adminModus = false;

/* ==================== name, count and storage ==================== */
// letters of any script, spaces, hyphens and apostrophes only, so a name is safe inside markup
function schoonNaam(t) {
  return String(t || '').slice(0, 40).replace(/[^\p{L}\p{M} '-]/gu, '').trim().slice(0, 16);
}
// every child is a profile: key = name flattened and lowercased, so "Emma" and "emma " are the
// same child. Key '' is the profile from before profiles existed: the old flat keys (below,
// without ':sleutel') automatically stay its data, no migration code needed.
function sleutelVan(t) { return schoonNaam(t).toLowerCase(); }
function postfixVoor(sleutel) { return sleutel ? ':' + sleutel : ''; }
function postfix() { return postfixVoor(actief()); }
// for the profiles panel: look up a child's school year and progress without switching to it,
// so the list shows what everyone has already done
function leerjaarVoor(sleutel) {
  var n;
  try { n = parseInt(localStorage.getItem('oefenkampioen-leerjaar' + postfixVoor(sleutel)), 10); } catch (e) { n = NaN; }
  return LEERJAREN.indexOf(n) > -1 ? n : 3;
}
function geoefendVoor(sleutel) {
  try { return Object.keys(JSON.parse(localStorage.getItem('oefenkampioen-beste' + postfixVoor(sleutel)) || '{}')).length; }
  catch (e) { return 0; }
}
function actief() {
  try { return localStorage.getItem('oefenkampioen-actief') || ''; } catch (e) { return ''; }
}
function zetActief(sleutel) {
  try { localStorage.setItem('oefenkampioen-actief', sleutel); } catch (e) { /* may fail */ }
}
function wisselProfiel(sleutel) {
  zetActief(sleutel);
  state.leerjaar = leesLeerjaar();
  state.aantal = leesAantal();
  state.tempo = leesTempo();
}
function oudeNaam() {
  try { return schoonNaam(localStorage.getItem('oefenkampioen-naam')); } catch (e) { return ''; }
}
function migreer() {
  var oud = oudeNaam();
  var lijst = oud ? [{ sleutel: '', naam: oud }] : [];
  zetProfielen(lijst);
  return lijst;
}
// rebuild every entry from scratch: a stored or imported list is never trusted as it is
function schoonProfielen(lijst) {
  var uit = [];
  (Array.isArray(lijst) ? lijst : []).forEach(function (p) {
    if (!p || typeof p.naam !== 'string' || typeof p.sleutel !== 'string') return;
    var naam = hoofdletter(schoonNaam(p.naam)), sleutel = p.sleutel === '' ? '' : sleutelVan(p.sleutel);
    if (!naam || (p.sleutel !== '' && !sleutel)) return;
    if (uit.some(function (q) { return q.sleutel === sleutel; })) return;
    uit.push({ sleutel: sleutel, naam: naam });
  });
  return uit;
}
function profielen() {
  var ruw;
  try { ruw = JSON.parse(localStorage.getItem('oefenkampioen-profielen')); } catch (e) { ruw = null; }
  return ruw === null ? migreer() : schoonProfielen(ruw);
}
function zetProfielen(lijst) {
  try { localStorage.setItem('oefenkampioen-profielen', JSON.stringify(lijst)); } catch (e) { /* may fail */ }
}
function nieuwProfiel(t) {
  var sleutel = sleutelVan(t), weergave = hoofdletter(schoonNaam(t));
  if (!sleutel) return;
  var lijst = profielen();
  var bestaand = lijst.filter(function (p) { return p.sleutel === sleutel || sleutelVan(p.naam) === sleutel; })[0];
  // the data from before profiles existed lives under key '': retyping that old name brings it
  // back, and the first child on a device without a name before inherits the nameless scores
  var erfOud = !bestaand && !lijst.some(function (p) { return p.sleutel === ''; }) &&
    (sleutelVan(oudeNaam()) === sleutel || (!lijst.length && !oudeNaam()));
  if (!bestaand) {
    bestaand = { sleutel: erfOud ? '' : sleutel, naam: weergave };
    lijst.push(bestaand);
  }
  bestaand.naam = weergave;
  zetProfielen(lijst);
  wisselProfiel(bestaand.sleutel);
}
function verwijderProfiel(sleutel) {
  // only removes the button: the data under that key stays, so if the name comes back
  // the scores are still there
  var lijst = profielen().filter(function (p) { return p.sleutel !== sleutel; });
  zetProfielen(lijst);
  if (actief() === sleutel) wisselProfiel(lijst.length ? lijst[0].sleutel : '');
}
// only behind #admin: also wipes the underlying data, irreversibly. Unlike verwijderProfiel
// above, which only takes the button out of the list
function verwijderProfielEcht(sleutel) {
  var lijst = profielen().filter(function (p) { return p.sleutel !== sleutel; });
  zetProfielen(lijst);
  ['oefenkampioen-leerjaar', 'oefenkampioen-aantal', 'oefenkampioen-tempo', 'oefenkampioen-beste', 'oefenkampioen-dagen'].forEach(function (k) {
    try { localStorage.removeItem(k + postfixVoor(sleutel)); } catch (e) { /* may fail */ }
  });
  // the old name would otherwise hand key '' back to whoever types it again
  if (sleutel === '') try { localStorage.removeItem('oefenkampioen-naam'); } catch (e) { /* may fail */ }
  if (actief() === sleutel) wisselProfiel(lijst.length ? lijst[0].sleutel : '');
}
function naam() {
  var p = profielen().filter(function (p) { return p.sleutel === actief(); })[0];
  return p ? p.naam : '';
}
// backup and restore: there is no account or cloud, so this file is the only way back after the
// browser data is wiped
function exporteerData() {
  var data = {};
  for (var i = 0; i < localStorage.length; i++) {
    var k = localStorage.key(i);
    if (k.indexOf('oefenkampioen-') === 0) data[k] = localStorage.getItem(k);
  }
  var a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.download = 'oefenkampioen-bewaard.json';
  a.click();
  // revoking right away can cancel the download in older Safari and Firefox
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 10000);
}
function leesBesteVoor(sleutel) {
  try { return JSON.parse(localStorage.getItem('oefenkampioen-beste' + postfixVoor(sleutel)) || '{}') || {}; }
  catch (e) { return {}; }
}
function vandaag() { return datumVan(new Date()); }
// always passed through mengDagen, so a damaged value reads as fewer days, never as garbage
function leesDagen(sleutel) {
  try { return mengDagen(JSON.parse(localStorage.getItem('oefenkampioen-dagen' + postfixVoor(sleutel)) || '[]'), []); }
  catch (e) { return []; }
}
function bewaarDag() {
  try { localStorage.setItem('oefenkampioen-dagen' + postfix(), JSON.stringify(dagErbij(leesDagen(actief()), vandaag()))); }
  catch (e) { /* may fail */ }
}
// keep the better of two best scores per chapter, and only well-formed entries
function mengBeste(hier, daar) {
  var uit = {};
  [hier, daar].forEach(function (bron) {
    Object.keys(bron && typeof bron === 'object' ? bron : {}).forEach(function (k) {
      var s = Number(bron[k] && bron[k].score), v = Number(bron[k] && bron[k].van), oud = uit[k];
      if (!/^[a-z]+:\d+$/.test(k) || !(v > 0) || !(s >= 0) || s > v || s % 1 || v % 1) return;
      if (!oud || s / v > oud.score / oud.van) uit[k] = { score: s, van: v };
    });
  });
  return uit;
}
// validate the whole file first and write afterwards, so a broken file never leaves half an
// import. Restoring only adds: profiles already here keep their settings, and a best score is
// only ever replaced by a better one. Returns the number of profiles in the file.
function herstelData(data) {
  if (!data || typeof data !== 'object' || typeof data['oefenkampioen-profielen'] !== 'string') throw new Error('geen bewaarbestand');
  var backup = schoonProfielen(JSON.parse(data['oefenkampioen-profielen']));
  if (!backup.length) throw new Error('geen profielen');
  var huidig = profielen(), schrijf = {};
  backup.forEach(function (p) {
    // match on the name, not the key: key '' means "the old data on this device", so on another
    // device it can belong to a different child
    var bron = postfixVoor(p.sleutel), beste = data['oefenkampioen-beste' + bron];
    var doel = huidig.filter(function (h) { return sleutelVan(h.naam) === sleutelVan(p.naam); })[0];
    var nieuw = !doel;
    if (nieuw) {
      var bezet = huidig.some(function (h) { return h.sleutel === p.sleutel; });
      doel = { sleutel: bezet ? sleutelVan(p.naam) : p.sleutel, naam: p.naam };
      if (huidig.some(function (h) { return h.sleutel === doel.sleutel; })) return;
    }
    var pf = postfixVoor(doel.sleutel);
    schrijf['oefenkampioen-beste' + pf] = JSON.stringify(mengBeste(leesBesteVoor(doel.sleutel),
      typeof beste === 'string' ? JSON.parse(beste) : {}));
    // days are merged, never replaced: restoring an old file must not erase a day
    var dagen = data['oefenkampioen-dagen' + bron];
    schrijf['oefenkampioen-dagen' + pf] = JSON.stringify(mengDagen(leesDagen(doel.sleutel),
      typeof dagen === 'string' ? JSON.parse(dagen) : []));
    if (!nieuw) return;
    ['leerjaar', 'aantal', 'tempo'].forEach(function (k) {
      if (typeof data['oefenkampioen-' + k + bron] === 'string') schrijf['oefenkampioen-' + k + pf] = data['oefenkampioen-' + k + bron];
    });
    huidig.push(doel);
  });
  Object.keys(schrijf).forEach(function (k) { localStorage.setItem(k, schrijf[k]); });
  zetProfielen(huidig);
  // on a fresh device nobody is active yet: start with the first restored child
  if (!huidig.some(function (h) { return h.sleutel === actief(); })) {
    var eerste = huidig.filter(function (h) { return sleutelVan(h.naam) === sleutelVan(backup[0].naam); })[0] || huidig[0];
    if (eerste) wisselProfiel(eerste.sleutel);
  }
  return backup.length;
}
// the % spot becomes the name with a comma, or nothing if no name was filled in
function metNaam(sjabloon) {
  var n = naam();
  return sjabloon.replace('%', n ? ', ' + n : '');
}
var LOF = ['Juist%! 🎉', 'Super%! 🌟', 'Knap gedaan%! 👏', 'Helemaal goed%! ✅'];
var MOED = ['Bijna%!', 'Dat lukt de volgende keer%!', 'Goed geprobeerd%!', 'Kijk nog eens goed%!'];
var LEERJAREN = [1, 2, 3, 4, 5, 6];
function leesLeerjaar() {
  var n;
  try { n = parseInt(localStorage.getItem('oefenkampioen-leerjaar' + postfix()), 10); } catch (e) { n = NaN; }
  // a new child starts in the third year, the grade the app was first built for
  return LEERJAREN.indexOf(n) > -1 ? n : 3;
}
function zetLeerjaar(lj) {
  state.leerjaar = lj;
  try { localStorage.setItem('oefenkampioen-leerjaar' + postfix(), String(lj)); } catch (e) { /* may fail */ }
}
function jaarNaam(lj) { return (lj === 1 ? '1ste' : lj + 'de') + ' leerjaar'; }
function jarenVan(spel) {
  var uit = [];
  spel.hoofdstukken.forEach(function (h) { if (uit.indexOf(h.leerjaar) === -1) uit.push(h.leerjaar); });
  return uit.sort(function (a, b) { return a - b; });
}
// a school year is cumulative: a child in third year must still be able to practise the quarter
// hours of the second, so everything up to and including the chosen year is included
function hoofdstukkenVoor(spel) {
  return spel.hoofdstukken.map(function (h, i) { return { h: h, i: i }; })
    .filter(function (r) { return r.h.leerjaar <= state.leerjaar; });
}
// only called for games already filtered on having something for this school year
function dekkingTekst(spel) {
  var n = hoofdstukkenVoor(spel).length;
  return n + (n === 1 ? ' hoofdstuk' : ' hoofdstukken');
}
function leesAantal() {
  var a;
  try { a = parseInt(localStorage.getItem('oefenkampioen-aantal' + postfix()), 10); } catch (e) { a = NaN; }
  return AANTALLEN.indexOf(a) > -1 ? a : AANTALLEN[0];
}
// how many seconds a question may take when tempo is on. Times tables have to come out fastest:
// automating means not calculating. The other games need reading and looking first.
var TEMPO = { maal: 8, klok: 25, winkel: 30, maten: 25, kalender: 20, brug: 25, spiegel: 35, breuken: 30, meetkunde: 30, verhoudingen: 30 };
function secondenVoor(spel) { return TEMPO[spel.id] || 25; }
function leesTempo() {
  try { return localStorage.getItem('oefenkampioen-tempo' + postfix()) === 'aan'; } catch (e) { return false; }
}
function zetTempo(aan) {
  state.tempo = aan;
  try { localStorage.setItem('oefenkampioen-tempo' + postfix(), aan ? 'aan' : 'uit'); } catch (e) { /* may fail */ }
}
function stopKlok() {
  if (state.klok) clearTimeout(state.klok);
  state.klok = null;
  $('tempobalk').hidden = true;
}
function startKlok() {
  if (!state.tempo) return;
  var sec = secondenVoor(state.spel), balk = $('tempovulling');
  $('tempobalk').hidden = false;
  // restarting the animation only works by removing it first
  balk.style.animation = 'none';
  void balk.offsetWidth;
  balk.style.animation = 'leeglopen ' + sec + 's linear forwards';
  state.klok = setTimeout(function () { antwoord(null, 'te traag', false); }, sec * 1000);
}

function zetAantal(a) {
  state.aantal = a;
  try { localStorage.setItem('oefenkampioen-aantal' + postfix(), String(a)); } catch (e) { /* may fail */ }
}
function lees() { return leesBesteVoor(actief()); }
function bewaar(sleutel, score, van) {
  try {
    var b = lees(), oud = b[sleutel];
    // compare by ratio, because a test can have 10, 15 or 20 questions
    if (!oud || !oud.van || score / van > oud.score / oud.van) {
      b[sleutel] = { score: score, van: van };
      localStorage.setItem('oefenkampioen-beste' + postfix(), JSON.stringify(b));
    }
  } catch (e) { /* without storage the app simply keeps working */ }
}

/* ==================== state ==================== */
var state = {
  spel: null, hfd: 0, leerjaar: 3, aantal: 10, q: 0, score: 0, results: [], fouten: [],
  current: null, answered: false, sound: true, tempo: false, klok: null,
  plan: [], decks: {}, jassen: {}, vorigJasje: null, vorigeSleutel: null
};
var ac = null;

/* ==================== sound and confetti ==================== */
function tone(freq, start, dur) {
  var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + start;
  o.type = 'sine';
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(ac.destination);
  o.start(t); o.stop(t + dur + 0.05);
}
function beep(ok) {
  if (!state.sound) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ok) { tone(660, 0, 0.15); tone(990, 0.12, 0.25); } else { tone(196, 0, 0.3); }
  } catch (e) { /* sound is extra, never blocking */ }
}
function party() {
  if (reduced) return;
  var box = $('party'), soorten = ['⭐', '🎉', '✨', '🌟', '🎈'];
  for (var i = 0; i < 15; i++) {
    var s = document.createElement('span');
    s.className = 'confetti';
    s.textContent = soorten[Math.floor(Math.random() * soorten.length)];
    s.style.left = (6 + Math.random() * 88) + '%';
    s.style.animationDelay = (Math.random() * 0.3).toFixed(2) + 's';
    box.appendChild(s);
    setTimeout(function (el) { return function () { el.remove(); }; }(s), 1700);
  }
}

/* ==================== the test ==================== */
// a chapter's plan is set for ten questions; scale it to the chosen count
function planVoor(h, n) {
  var soorten = Object.keys(h.plan), uit = {}, som = 0;
  soorten.forEach(function (soort) {
    uit[soort] = Math.max(1, Math.round(h.plan[soort] / 10 * n));
    som += uit[soort];
  });
  var grootste = soorten.slice().sort(function (a, b) { return uit[b] - uit[a]; })[0];
  uit[grootste] += n - som;
  return uit;
}
// the jasje is the presentation of a question, not the question itself: a jasje may never
// change the answer. If a game provides no jasjes, there is only one.
function jasjesVoor(soort, h) {
  var j = state.spel.jasjes ? state.spel.jasjes(soort, h) : null;
  return j && j.length ? j.slice() : ['standaard'];
}
function bouwToets() {
  var h = state.spel.hoofdstukken[state.hfd];
  var verdeling = planVoor(h, state.aantal);
  var plan = [];
  state.decks = {};
  state.jassen = {};
  state.vorigJasje = null;
  state.vorigeSleutel = null;
  Object.keys(verdeling).forEach(function (soort) {
    state.decks[soort] = shuffle(state.spel.zaadjes(soort, h));
    state.jassen[soort] = shuffle(jasjesVoor(soort, h));
    for (var i = 0; i < verdeling[soort]; i++) plan.push(soort);
  });
  state.plan = shuffle(plan);
}
function maakVraag(soort) {
  var h = state.spel.hoofdstukken[state.hfd];
  // when the supply runs out, a next round starts: reshuffled, and in other jasjes. That way two
  // appearances of the same zaadje are as far apart as possible.
  if (!state.decks[soort].length) state.decks[soort] = shuffle(state.spel.zaadjes(soort, h));
  if (!state.jassen[soort].length) state.jassen[soort] = shuffle(jasjesVoor(soort, h));
  var jasje = state.jassen[soort].pop();
  // the same jasje twice in a row makes a test monotonous
  if (jasje === state.vorigJasje && state.jassen[soort].length) {
    var ruilJ = state.jassen[soort].pop();
    state.jassen[soort].push(jasje);
    jasje = ruilJ;
  }
  var z = state.decks[soort].pop();
  var v = state.spel.maak(soort, z, h, jasje);
  // at a round boundary the same zaadje can come back right away; that feels like a bug in the game
  if (v.sleutel === state.vorigeSleutel && state.decks[soort].length) {
    var ruilZ = state.decks[soort].pop();
    state.decks[soort].push(z);
    v = state.spel.maak(soort, ruilZ, h, jasje);
  }
  state.vorigJasje = jasje;
  state.vorigeSleutel = v.sleutel;
  if (!v.jasje) v.jasje = jasje;
  return v;
}

/* ==================== screens ==================== */
function lead() {
  var n = naam();
  return (n ? 'Hoi ' + n + '! ' : '') + 'Kies een spel. Elke toets telt ' +
    state.aantal + ' vragen en ' + state.aantal + ' punten.' +
    (state.tempo ? ' De klok loopt mee: te traag telt als fout.' : '');
}
function kaart(ico, nr, titel, tekst, beste, badge) {
  var b = beste && Number(beste.van) > 0 ? '<span class="beste">beste ' + Number(beste.score) + '/' + Number(beste.van) + '</span>' : '';
  return '<span class="ico">' + ico + '</span>' +
    '<span class="tekst"><h2>' + (nr ? nr + '. ' : '') + titel + '</h2><p>' + tekst + '</p></span>' +
    b + (badge ? '<span class="badge ' + badge + '">' + badge + '</span>' : '');
}
function toonStart() {
  // a running tempo timer would otherwise fire a fail beep on the start screen
  stopKlok();
  var beste = lees();
  // a game with nothing for the chosen school year is not listed: a child should not have to
  // open a game first to find out it is empty there
  var rijen = SPELLEN.map(function (s, i) { return { s: s, i: i }; })
    .filter(function (r) { return hoofdstukkenVoor(r.s).length > 0; });
  $('spellen').innerHTML = rijen.map(function (r) {
    // the game card shows the best chapter result of that game
    var top = null;
    r.s.hoofdstukken.forEach(function (h, k) {
      var b = beste[r.s.id + ':' + k];
      if (b && b.van && (!top || b.score / b.van > top.score / top.van)) top = b;
    });
    var tekst = r.s.tekst + '<span class="dekking">' + dekkingTekst(r.s) + '</span>';
    return '<button class="hfd" data-i="' + r.i + '">' + kaart(r.s.ico, 0, r.s.naam, tekst, top, '') + '</button>';
  }).join('');
  Array.prototype.forEach.call($('spellen').children, function (b) {
    b.onclick = function () { toonMenu(SPELLEN[Number(b.dataset.i)]); };
  });
  $('profielBtn').innerHTML = (naam() || 'Wie speelt er?') + ' <span class="chev">&#9662;</span>';
  $('leerjaren').innerHTML = LEERJAREN.map(function (lj) {
    return '<button class="aantal" data-lj="' + lj + '" aria-pressed="' + (lj === state.leerjaar) +
      '" aria-label="' + jaarNaam(lj) + '">' + lj + '</button>';
  }).join('');
  Array.prototype.forEach.call($('leerjaren').children, function (b) {
    b.onclick = function () { zetLeerjaar(Number(b.dataset.lj)); toonStart(); };
  });
  $('aantallen').innerHTML = AANTALLEN.map(function (a) {
    return '<button class="aantal" data-a="' + a + '" aria-pressed="' + (a === state.aantal) + '">' + a + '</button>';
  }).join('');
  Array.prototype.forEach.call($('aantallen').children, function (b) {
    b.onclick = function () { zetAantal(Number(b.dataset.a)); toonStart(); };
  });
  $('tempoKnop').innerHTML = [false, true].map(function (aan) {
    return '<button class="aantal" data-t="' + aan + '" aria-pressed="' + (aan === state.tempo) + '">' +
      (aan ? 'ja, met klok' : 'nee, rustig') + '</button>';
  }).join('');
  Array.prototype.forEach.call($('tempoKnop').children, function (b) {
    b.onclick = function () { zetTempo(b.dataset.t === 'true'); toonStart(); };
  });
  $('lead').textContent = lead();
  $('kop').innerHTML = 'Oefen<span class="tick">kampioen</span>';
  $('startScherm').hidden = false;
  $('menuScherm').hidden = true;
  $('game').hidden = true;
  $('result').hidden = true;
}
/* ==================== profiles panel ==================== */
function toonProfielPaneel() {
  var actiefSleutel = actief();
  $('profielLijst').innerHTML = profielen().map(function (p) {
    var n = geoefendVoor(p.sleutel);
    return '<div class="profielrij' + (p.sleutel === actiefSleutel ? ' actief' : '') + '">' +
      '<button class="profielkies" data-sleutel="' + p.sleutel + '">' +
      '<span class="avatar" aria-hidden="true">' + p.naam.charAt(0).toUpperCase() + '</span>' +
      '<span class="profielinfo"><span>' + p.naam + '</span>' +
      '<span class="profielvoortgang">' + jaarNaam(leerjaarVoor(p.sleutel)) + ' · ' + n +
      (n === 1 ? ' hoofdstuk' : ' hoofdstukken') + ' geoefend</span></span></button>' +
      (adminModus ? '<button class="profielx" data-sleutel="' + p.sleutel + '" data-naam="' + p.naam +
        '" aria-label="' + p.naam + ' verwijderen">×</button>' : '') + '</div>';
  }).join('') || '<p class="lead">Nog geen profiel. Typ hieronder een naam.</p>';
  Array.prototype.forEach.call($('profielLijst').querySelectorAll('.profielkies'), function (b) {
    b.onclick = function () { wisselProfiel(b.dataset.sleutel); sluitProfielPaneel(); toonStart(); };
  });
  // removing is only possible behind #admin, not in the normal view a child also uses.
  // window.confirm() is suppressed by some browsers (test browsers among them) and then always
  // returns "no" without anything showing: so the question is built here by hand
  Array.prototype.forEach.call($('profielLijst').querySelectorAll('.profielx'), function (b) {
    b.onclick = function (e) {
      e.stopPropagation();
      var rij = b.closest('.profielrij'), sleutel = b.dataset.sleutel, naam = b.dataset.naam;
      rij.className = 'profielrij bevestig';
      rij.innerHTML = '<span class="profielvraag">' + naam + ' verwijderen?</span>' +
        '<button class="profiellijst">Uit de lijst, scores blijven</button>' +
        '<button class="profielja">Écht wissen, voorgoed weg</button>' +
        '<button class="profielnee">Nee</button>';
      rij.querySelector('.profiellijst').onclick = function (e) {
        e.stopPropagation();
        verwijderProfiel(sleutel);
        toonStart();
        toonProfielPaneel();
        focusPaneel();
      };
      rij.querySelector('.profielja').onclick = function (e) {
        e.stopPropagation();
        verwijderProfielEcht(sleutel);
        toonStart();
        toonProfielPaneel();
        focusPaneel();
      };
      rij.querySelector('.profielnee').onclick = function (e) {
        e.stopPropagation();
        toonProfielPaneel();
        focusPaneel();
      };
      // the button that had focus is gone now; the safe answer takes it over
      rij.querySelector('.profielnee').focus();
    };
  });
}
function focusPaneel() {
  ($('profielLijst').querySelector('.profielkies') || $('naam')).focus();
}
function toonMelding(tekst) {
  $('paneelmelding').textContent = tekst;
  $('paneelmelding').hidden = !tekst;
}
function opentProfielPaneel() {
  // checked here, not only at startup: adding #admin to the address bar later does not reload
  // the page, so a check at startup alone would never pick it up
  adminModus = location.hash === '#admin';
  $('paneelacties').hidden = !adminModus;
  toonMelding('');
  toonProfielPaneel();
  $('profielPaneel').hidden = false;
  $('profielBackdrop').hidden = false;
  $('profielBtn').setAttribute('aria-expanded', 'true');
  focusPaneel();
}
function sluitProfielPaneel() {
  var wasOpen = !$('profielPaneel').hidden;
  $('profielPaneel').hidden = true;
  $('profielBackdrop').hidden = true;
  $('profielBtn').setAttribute('aria-expanded', 'false');
  if (wasOpen) $('profielBtn').focus();
}
function toonMenu(spel) {
  stopKlok();
  state.spel = spel;
  var beste = lees();
  // a flat list: the school year is already chosen on the start screen, so not once more here.
  // but if it holds chapters from several school years, a heading goes in between: with ten
  // chapters in a row an eight-year-old otherwise loses track of which ones belong together
  var lijst = hoofdstukkenVoor(spel);
  var html = '', huidigJaar = null, nr = 0;
  lijst.forEach(function (r) {
    if (r.h.leerjaar !== huidigJaar) {
      huidigJaar = r.h.leerjaar;
      if (jarenVan(spel).length > 1) html += '<p class="jaarkop">' + jaarNaam(huidigJaar) + '</p>';
    }
    nr++;
    html += '<button class="hfd" data-i="' + r.i + '">' +
      kaart(r.h.ico, nr, r.h.titel, r.h.tekst, beste[spel.id + ':' + r.i], r.h.badge) + '</button>';
  });
  $('menu').innerHTML = html;
  Array.prototype.forEach.call($('menu').querySelectorAll('.hfd'), function (b) {
    b.onclick = function () { startHoofdstuk(Number(b.dataset.i)); };
  });
  $('kop').innerHTML = spel.ico + ' ' + spel.naam;
  $('spelTitel').textContent = spel.naam;
  $('spelLead').textContent = lijst.length
    ? 'Kies een hoofdstuk. Elke toets telt ' + state.aantal + ' vragen.'
    : 'Hier staat nog niets voor het ' + jaarNaam(state.leerjaar) +
      '. Kies bovenaan een ander leerjaar, of een ander spel.';
  $('startScherm').hidden = true;
  $('menuScherm').hidden = false;
  $('game').hidden = true;
  $('result').hidden = true;
}
function startHoofdstuk(i) {
  stopKlok();
  state.hfd = i;
  state.q = 0;
  state.score = 0;
  state.results = [];
  state.fouten = [];
  bouwToets();
  $('hfdTitel').textContent = state.spel.hoofdstukken[i].titel;
  $('menuScherm').hidden = true;
  $('result').hidden = true;
  $('game').hidden = false;
  volgendeVraag();
}

function drawDots() {
  var html = '';
  for (var i = 0; i < state.aantal; i++) {
    var cls = 'dot';
    if (state.results[i] === true) cls += ' good';
    else if (state.results[i] === false) cls += ' bad';
    else if (i === state.q) cls += ' now';
    var stand = state.results[i] === true ? 'juist' : state.results[i] === false ? 'fout' : i === state.q ? 'bezig' : 'nog te doen';
    html += '<span role="listitem" class="' + cls + '" title="Vraag ' + (i + 1) + ': ' + stand +
      '" aria-label="Vraag ' + (i + 1) + ': ' + stand + '">' + (i + 1) + '</span>';
  }
  // up to ten questions in one row, above that two rows of equal length
  var kolommen = state.aantal <= 10 ? state.aantal : Math.ceil(state.aantal / 2);
  $('dots').style.gridTemplateColumns = 'repeat(' + kolommen + ', 1fr)';
  $('dots').innerHTML = html;
  $('scoreBadge').textContent = state.score + ' / ' + state.aantal;
}

function volgendeVraag() {
  var spel = state.spel;
  var v = state.current = maakVraag(state.plan[state.q]);
  state.answered = false;

  $('doek').innerHTML = spel.teken(v) || '';
  $('doekCard').hidden = !$('doek').innerHTML;
  var sch = spel.scherm ? spel.scherm(v) : null;
  $('scherm').textContent = sch || '';
  $('schermCard').hidden = !sch;

  var tekst = spel.vraag(v, state.q + 1);
  $('question').textContent = tekst.titel;
  $('subq').textContent = tekst.sub || '';
  $('subq').hidden = !tekst.sub;

  $('options').hidden = !v.options;
  $('typen').hidden = !v.typen;
  if (v.options) {
    $('options').innerHTML = '';
    v.options.forEach(function (o, i) {
      var b = document.createElement('button');
      b.className = 'opt';
      b.id = 'opt' + i;
      b.textContent = o.text;
      b.onclick = function () { antwoord(b, o.text, o.ok); };
      $('options').appendChild(b);
    });
  }
  if (v.typen) {
    $('veld').innerHTML = v.typen.velden.map(function (f, i) {
      return (i ? '<span>' + v.typen.scheider + '</span>' : '') +
        '<input id="in' + i + '" type="text" inputmode="numeric" maxlength="' + (f.max || 2) +
        '" style="width:' + ((f.max || 2) + 0.6) + 'ch" placeholder="' + f.ph + '" aria-label="' + f.aria + '">';
    }).join('');
    v.typen.velden.forEach(function (f, i) {
      var el = $('in' + i);
      el.onkeydown = function (e) { if (e.key === 'Enter') controleer(); };
      el.oninput = function () {
        if (el.value.length === (f.max || 2) && $('in' + (i + 1))) $('in' + (i + 1)).focus();
      };
    });
    $('checkBtn').disabled = false;
  }
  if (spel.na) spel.na(v);
  startKlok();

  $('feedback').textContent = '';
  $('feedback').className = 'feedback';
  $('nextBtn').disabled = true;
  $('nextBtn').textContent = v.typen ? 'Typ eerst een antwoord' : 'Kies eerst een antwoord';
  drawDots();
  // the previous focus was the now disabled next button; land on the new question instead
  (v.typen ? $('in0') : $('question')).focus();
}

function antwoord(btn, tekst, ok) {
  if (state.answered) return;
  state.answered = true;
  stopKlok();
  var v = state.current, fb = $('feedback');

  if (v.options) {
    Array.prototype.forEach.call($('options').children, function (b, i) {
      b.disabled = true;
      if (v.options[i].ok && b !== btn) b.classList.add('reveal');
    });
    if (btn) btn.classList.add(ok ? 'pick-good' : 'pick-bad');
  }
  if (state.spel.reactie) state.spel.reactie(v, ok);

  var uitleg = state.spel.uitleg(v);
  if (ok) {
    state.score++;
    state.results[state.q] = true;
    fb.className = 'feedback good';
    fb.innerHTML = metNaam(LOF[Math.floor(Math.random() * LOF.length)]) + '<small>' + uitleg + '</small>';
    party();
    beep(true);
  } else {
    state.results[state.q] = false;
    state.fouten.push({ vraag: state.spel.kort(v), jouw: tekst, juist: v.ans });
    fb.className = 'feedback bad';
    fb.innerHTML = metNaam(MOED[Math.floor(Math.random() * MOED.length)]) +
      ' Het juiste antwoord is ' + v.ans + '.<small>' + uitleg + '</small>';
    beep(false);
  }

  state.q++;
  drawDots();
  $('nextBtn').disabled = false;
  $('nextBtn').textContent = state.q >= state.aantal ? '🏁 Bekijk je punten' : 'Volgende vraag';
  $('nextBtn').focus();
}

function controleer() {
  if (state.answered) return;
  var v = state.current, waarden = [], goed = true;
  for (var i = 0; i < v.typen.velden.length; i++) {
    var n = parseInt($('in' + i).value, 10);
    if (isNaN(n) || n < 0 || n >= Math.pow(10, v.typen.velden[i].max || 2)) {
      $('feedback').className = 'feedback bad';
      $('feedback').textContent = v.typen.hulp || 'Vul elk vakje in met een getal.';
      return;
    }
    waarden.push(n);
    if (n !== v.typen.velden[i].ant) goed = false;
  }
  v.typen.velden.forEach(function (f, i) { $('in' + i).disabled = true; });
  $('checkBtn').disabled = true;
  var getypt = waarden.map(function (n, i) {
    var f = v.typen.velden[i];
    return f.pad ? pad2(n) : String(n);
  }).join(v.typen.scheider);
  antwoord(null, getypt, goed);
}

/* ==================== result ==================== */
function toonResultaat() {
  var s = state.score;
  bewaar(state.spel.id + ':' + state.hfd, s, state.aantal);
  bewaarDag();
  var deel = s / state.aantal;
  $('stars').textContent = deel >= 0.9 ? '⭐⭐⭐' : deel >= 0.7 ? '⭐⭐' : deel >= 0.5 ? '⭐' : '💪';
  $('resultTitle').textContent = metNaam(deel >= 0.7 ? 'Goed gedaan%!' : 'Volgende keer beter%!');
  $('resultScore').textContent = s + ' / ' + state.aantal;
  $('resultMsg').textContent = deel >= 0.9 ? (state.spel.top || 'Jij bent een echte kampioen!')
    : deel >= 0.7 ? 'Mooi werk. Nog een keer en je haalt alles juist.'
    : deel >= 0.5 ? 'Goed bezig. Blijf oefenen, je bent er bijna.'
    : 'Oefenen maakt sterk. Probeer eerst een makkelijker hoofdstuk.';
  if (state.fouten.length) {
    $('review').innerHTML = '<h3>Deze mag je nog eens bekijken</h3>' + state.fouten.map(function (f) {
      return '<div class="rv"><b>' + f.vraag + '</b><em><span class="jouw">' + f.jouw +
        '</span> wordt <span class="juist">' + f.juist + '</span></em></div>';
    }).join('');
    $('review').hidden = false;
  } else {
    $('review').hidden = true;
  }
  $('game').hidden = true;
  $('result').hidden = false;
}

/* ==================== buttons ==================== */
$('nextBtn').onclick = function () {
  if (state.q >= state.aantal) toonResultaat(); else volgendeVraag();
};
$('checkBtn').onclick = controleer;
$('againBtn').onclick = function () { startHoofdstuk(state.hfd); };
$('menuBtn').onclick = function () { toonMenu(state.spel); };
$('homeBtn').onclick = function () { toonMenu(state.spel); };
$('terugBtn').onclick = toonStart;
// no blur handler on purpose: blur rebuilt the list between mousedown and click, which swallowed
// a tap on another profile and could end a running test
function bevestigNieuwProfiel() {
  if (!sleutelVan($('naam').value)) return;
  nieuwProfiel($('naam').value);
  $('naam').value = '';
  toonStart();
  toonProfielPaneel();
  focusPaneel();
}
$('naam').addEventListener('keydown', function (e) { if (e.key === 'Enter') bevestigNieuwProfiel(); });
$('naamOk').onclick = bevestigNieuwProfiel;
$('profielBtn').onclick = function () {
  if ($('profielPaneel').hidden) opentProfielPaneel(); else sluitProfielPaneel();
};
$('profielBackdrop').onclick = sluitProfielPaneel;
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !$('profielPaneel').hidden) sluitProfielPaneel();
});
// asked only here, from the admin buttons: some browsers show a permission prompt, and that
// should not pop up in front of a child on page load
function vraagBlijvendeOpslag() {
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
}
$('bewaarBtn').onclick = function () {
  vraagBlijvendeOpslag();
  exporteerData();
  // the browser saves the file silently, without its own notice: without this text it looks
  // as if nothing happens
  $('bewaarBtn').textContent = 'Bewaard ✓';
  clearTimeout($('bewaarBtn').timer);
  $('bewaarBtn').timer = setTimeout(function () { $('bewaarBtn').textContent = 'Bewaar als bestand'; }, 2500);
};
$('herstelBtn').onclick = function () { $('herstelInput').click(); };
$('herstelInput').onchange = function () {
  var bestand = $('herstelInput').files[0];
  if (!bestand) return;
  $('herstelInput').value = '';
  vraagBlijvendeOpslag();
  bestand.text().then(function (tekst) {
    var n;
    // alert() is suppressed in the same browsers that suppress confirm(), so the message stays in the panel
    try { n = herstelData(JSON.parse(tekst)); } catch (e) {
      toonMelding('Dat bestand kon niet gelezen worden. Kies een bestand dat met "Bewaar als bestand" gemaakt is.');
      return;
    }
    toonStart();
    toonProfielPaneel();
    toonMelding('Teruggezet: ' + n + (n === 1 ? ' profiel.' : ' profielen.'));
  });
};
$('soundBtn').onclick = function () {
  state.sound = !state.sound;
  $('soundBtn').textContent = state.sound ? '🔊' : '🔇';
};

state.leerjaar = leesLeerjaar();
state.aantal = leesAantal();
state.tempo = leesTempo();
toonStart();

// the self-check is for the developer, so it is only loaded with #test
if (location.hash === '#test') import('./zelfcheck.js');

export { leesDagen, SPELLEN, AANTALLEN, jasjesVoor, LEERJAREN, TEMPO, LOF, MOED, state, schoonNaam, schoonProfielen, mengBeste, naam, metNaam, leesTempo, secondenVoor, jarenVan, planVoor, bouwToets, maakVraag, toonStart };
