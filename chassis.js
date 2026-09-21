import { shuffle, pad2, $, reduced, hoofdletter } from './gereedschap.js';
import { SPELLEN } from './spellen/index.js';

// meer dan twintig vragen houdt een kind van acht niet vol
var AANTALLEN = [10, 15, 20];

/* ==================== naam, aantal en opslag ==================== */
// alleen letters, spaties, koppeltekens en apostrofs, zodat de naam veilig in een bericht past
function schoonNaam(t) {
  var uit = '';
  String(t || '').slice(0, 40).split('').forEach(function (c) {
    var isLetter = c.toLowerCase() !== c.toUpperCase();
    if (isLetter || c === ' ' || c === "'" || c === '-') uit += c;
  });
  return uit.trim().slice(0, 16);
}
// elk kind is een profiel: sleutel = naam plat en klein, zodat "Emma" en "emma " hetzelfde
// kind zijn. Sleutel '' is het profiel van vóór profielen bestonden: de oude vlakke sleutels
// (hieronder, zonder ':sleutel') blijven zo automatisch zijn data, geen migratiecode nodig.
function sleutelVan(t) { return schoonNaam(t).toLowerCase(); }
function postfix() { var a = actief(); return a ? ':' + a : ''; }
function actief() {
  try { return localStorage.getItem('oefenkampioen-actief') || ''; } catch (e) { return ''; }
}
function zetActief(sleutel) {
  try { localStorage.setItem('oefenkampioen-actief', sleutel); } catch (e) { /* mag mislukken */ }
}
function wisselProfiel(sleutel) {
  zetActief(sleutel);
  state.leerjaar = leesLeerjaar();
  state.aantal = leesAantal();
  state.tempo = leesTempo();
}
function migreer() {
  var oud = schoonNaam(localStorage.getItem('oefenkampioen-naam'));
  var lijst = oud ? [{ sleutel: '', naam: oud }] : [];
  zetProfielen(lijst);
  return lijst;
}
function profielen() {
  try { return JSON.parse(localStorage.getItem('oefenkampioen-profielen')) || migreer(); }
  catch (e) { return migreer(); }
}
function zetProfielen(lijst) {
  try { localStorage.setItem('oefenkampioen-profielen', JSON.stringify(lijst)); } catch (e) { /* mag mislukken */ }
}
function nieuwProfiel(t) {
  var sleutel = sleutelVan(t);
  if (!sleutel) return;
  var lijst = profielen(), bestaand = lijst.filter(function (p) { return p.sleutel === sleutel; })[0];
  if (bestaand) bestaand.naam = hoofdletter(schoonNaam(t)); else lijst.push({ sleutel: sleutel, naam: hoofdletter(schoonNaam(t)) });
  zetProfielen(lijst);
  wisselProfiel(sleutel);
}
function verwijderProfiel(sleutel) {
  // haalt enkel het knopje weg: de data onder die sleutel blijft staan, dus komt de naam terug
  // dan staan de scores er nog
  var lijst = profielen().filter(function (p) { return p.sleutel !== sleutel; });
  zetProfielen(lijst);
  if (actief() === sleutel) wisselProfiel(lijst.length ? lijst[0].sleutel : '');
}
function naam() {
  var p = profielen().filter(function (p) { return p.sleutel === actief(); })[0];
  return p ? p.naam : '';
}
// de %-plaats wordt de naam met komma, of niets als er geen naam ingevuld is
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
  // zolang de andere leerjaren nog leeg zijn begint het spel bij het derde: daar staat alles
  return LEERJAREN.indexOf(n) > -1 ? n : 3;
}
function zetLeerjaar(lj) {
  state.leerjaar = lj;
  try { localStorage.setItem('oefenkampioen-leerjaar' + postfix(), String(lj)); } catch (e) { /* mag mislukken */ }
}
function jaarNaam(lj) { return (lj === 1 ? '1ste' : lj + 'de') + ' leerjaar'; }
function jarenVan(spel) {
  var uit = [];
  spel.hoofdstukken.forEach(function (h) { if (uit.indexOf(h.leerjaar) === -1) uit.push(h.leerjaar); });
  return uit.sort(function (a, b) { return a - b; });
}
// een leerjaar is cumulatief: wie in het derde zit moet de kwartieren van het tweede nog kunnen
// oefenen, dus alles tot en met het gekozen jaar hoort erbij
function hoofdstukkenVoor(spel) {
  return spel.hoofdstukken.map(function (h, i) { return { h: h, i: i }; })
    .filter(function (r) { return r.h.leerjaar <= state.leerjaar; });
}
// alleen aangeroepen voor spellen die al gefilterd zijn op iets hebben voor dit leerjaar
function dekkingTekst(spel) {
  var n = hoofdstukkenVoor(spel).length;
  return n + (n === 1 ? ' hoofdstuk' : ' hoofdstukken');
}
function leesAantal() {
  var a;
  try { a = parseInt(localStorage.getItem('oefenkampioen-aantal' + postfix()), 10); } catch (e) { a = NaN; }
  return AANTALLEN.indexOf(a) > -1 ? a : AANTALLEN[0];
}
// hoeveel seconden een vraag mag duren als het op tempo staat. Tafels moeten er het snelst
// uit: automatiseren betekent niet uitrekenen. De andere spellen vragen eerst lezen en kijken.
var TEMPO = { maal: 8, klok: 25, winkel: 30, maten: 25, kalender: 20, brug: 25, spiegel: 35, breuken: 30, meetkunde: 30, verhoudingen: 30 };
function secondenVoor(spel) { return TEMPO[spel.id] || 25; }
function leesTempo() {
  try { return localStorage.getItem('oefenkampioen-tempo' + postfix()) === 'aan'; } catch (e) { return false; }
}
function zetTempo(aan) {
  state.tempo = aan;
  try { localStorage.setItem('oefenkampioen-tempo' + postfix(), aan ? 'aan' : 'uit'); } catch (e) { /* mag mislukken */ }
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
  // de animatie opnieuw laten beginnen lukt alleen door ze eerst weg te halen
  balk.style.animation = 'none';
  void balk.offsetWidth;
  balk.style.animation = 'leeglopen ' + sec + 's linear forwards';
  state.klok = setTimeout(function () { antwoord(null, 'te traag', false); }, sec * 1000);
}

function zetAantal(a) {
  state.aantal = a;
  try { localStorage.setItem('oefenkampioen-aantal' + postfix(), String(a)); } catch (e) { /* mag mislukken */ }
}
function lees() {
  try { return JSON.parse(localStorage.getItem('oefenkampioen-beste' + postfix()) || '{}'); } catch (e) { return {}; }
}
function bewaar(sleutel, score, van) {
  try {
    var b = lees(), oud = b[sleutel];
    // vergelijken op verhouding, want een toets kan 10, 15 of 20 vragen tellen
    if (!oud || !oud.van || score / van > oud.score / oud.van) {
      b[sleutel] = { score: score, van: van };
      localStorage.setItem('oefenkampioen-beste' + postfix(), JSON.stringify(b));
    }
  } catch (e) { /* zonder opslag werkt de app gewoon verder */ }
}

/* ==================== toestand ==================== */
var state = {
  spel: null, hfd: 0, leerjaar: 3, aantal: 10, q: 0, score: 0, results: [], fouten: [],
  current: null, answered: false, sound: true, tempo: false, klok: null,
  plan: [], decks: {}, jassen: {}, vorigJasje: null, vorigeSleutel: null
};
var ac = null;

/* ==================== geluid en confetti ==================== */
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
  } catch (e) { /* geluid is extra, nooit blokkerend */ }
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

/* ==================== de toets ==================== */
// het plan van een hoofdstuk staat op tien vragen; schaal het naar het gekozen aantal
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
// het jasje is de voorstelling van een vraag, niet de vraag zelf: een jasje mag het antwoord
// nooit veranderen. Levert een spel geen jasjes, dan is er maar een.
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
  // is de voorraad op, dan begint een volgende ronde: opnieuw geschud, en in andere jasjes. Zo
  // liggen twee verschijningen van hetzelfde zaadje zo ver mogelijk uit elkaar.
  if (!state.decks[soort].length) state.decks[soort] = shuffle(state.spel.zaadjes(soort, h));
  if (!state.jassen[soort].length) state.jassen[soort] = shuffle(jasjesVoor(soort, h));
  var jasje = state.jassen[soort].pop();
  // twee keer na elkaar hetzelfde jasje maakt een toets eentonig
  if (jasje === state.vorigJasje && state.jassen[soort].length) {
    var ruilJ = state.jassen[soort].pop();
    state.jassen[soort].push(jasje);
    jasje = ruilJ;
  }
  var z = state.decks[soort].pop();
  var v = state.spel.maak(soort, z, h, jasje);
  // op een rondegrens kan hetzelfde zaadje meteen terugkomen; dat voelt als een fout in het spel
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

/* ==================== schermen ==================== */
function lead() {
  var n = naam();
  return (n ? 'Hoi ' + n + '! ' : '') + 'Kies een spel. Elke toets telt ' +
    state.aantal + ' vragen en ' + state.aantal + ' punten.' +
    (state.tempo ? ' De klok loopt mee: te traag telt als fout.' : '');
}
function kaart(ico, nr, titel, tekst, beste, badge) {
  var b = beste && beste.van ? '<span class="beste">beste ' + beste.score + '/' + beste.van + '</span>' : '';
  return '<span class="ico">' + ico + '</span>' +
    '<span class="tekst"><h2>' + (nr ? nr + '. ' : '') + titel + '</h2><p>' + tekst + '</p></span>' +
    b + (badge ? '<span class="badge ' + badge + '">' + badge + '</span>' : '');
}
function toonStart() {
  var beste = lees();
  // een spel zonder iets voor het gekozen leerjaar staat hier niet: een kind moet niet eerst
  // een spel openklikken om te ontdekken dat het daar leeg is
  var rijen = SPELLEN.map(function (s, i) { return { s: s, i: i }; })
    .filter(function (r) { return hoofdstukkenVoor(r.s).length > 0; });
  $('spellen').innerHTML = rijen.map(function (r) {
    // op de spelkaart staat het beste hoofdstukresultaat van dat spel
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
  var actiefSleutel = actief();
  $('profielen').innerHTML = profielen().map(function (p) {
    return '<span class="profielwrap"><button class="aantal profielknop" data-sleutel="' + p.sleutel +
      '" aria-pressed="' + (p.sleutel === actiefSleutel) + '"><span class="avatar">' +
      p.naam.charAt(0).toUpperCase() + '</span>' + p.naam + '</button>' +
      '<button class="profielx" data-sleutel="' + p.sleutel + '" aria-label="' + p.naam + ' verwijderen">×</button></span>';
  }).join('') + '<button class="aantal" id="profielPlus">+ nieuw</button>';
  Array.prototype.forEach.call($('profielen').querySelectorAll('.profielknop'), function (b) {
    b.onclick = function () { wisselProfiel(b.dataset.sleutel); toonStart(); };
  });
  Array.prototype.forEach.call($('profielen').querySelectorAll('.profielx'), function (b) {
    b.onclick = function (e) { e.stopPropagation(); verwijderProfiel(b.dataset.sleutel); toonStart(); };
  });
  $('profielPlus').onclick = function () {
    $('nieuwProfielKaart').hidden = false;
    $('naam').value = '';
    $('naam').focus();
  };
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
function toonMenu(spel) {
  stopKlok();
  state.spel = spel;
  var beste = lees();
  // een vlakke lijst: het leerjaar is al gekozen op het startscherm, dus niet nog een keer hier.
  // maar staan er hoofdstukken van meerdere leerjaren in, dan komt er een kopje tussen: bij tien
  // hoofdstukken op een rij verliest een kind van acht anders het overzicht welke bij elkaar horen
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
    html += '<span class="' + cls + '" title="Vraag ' + (i + 1) + ': ' + stand + '">' + (i + 1) + '</span>';
  }
  // tot tien vragen op een rij, daarboven twee even lange rijen
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
        '" placeholder="' + f.ph + '" aria-label="' + f.aria + '">';
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
}

function controleer() {
  if (state.answered) return;
  var v = state.current, waarden = [], goed = true;
  for (var i = 0; i < v.typen.velden.length; i++) {
    var n = parseInt($('in' + i).value, 10);
    if (isNaN(n) || n < 0 || n > 9999) {
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

/* ==================== resultaat ==================== */
function toonResultaat() {
  var s = state.score;
  bewaar(state.spel.id + ':' + state.hfd, s, state.aantal);
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

/* ==================== knoppen ==================== */
$('nextBtn').onclick = function () {
  if (state.q >= state.aantal) toonResultaat(); else volgendeVraag();
};
$('checkBtn').onclick = controleer;
$('againBtn').onclick = function () { startHoofdstuk(state.hfd); };
$('menuBtn').onclick = function () { toonMenu(state.spel); };
$('homeBtn').onclick = function () { toonMenu(state.spel); };
$('terugBtn').onclick = toonStart;
function bevestigNieuwProfiel() {
  if ($('naam').value.trim()) nieuwProfiel($('naam').value);
  $('nieuwProfielKaart').hidden = true;
  toonStart();
}
$('naam').onblur = bevestigNieuwProfiel;
$('naam').addEventListener('keydown', function (e) { if (e.key === 'Enter') bevestigNieuwProfiel(); });
$('soundBtn').onclick = function () {
  state.sound = !state.sound;
  $('soundBtn').textContent = state.sound ? '🔊' : '🔇';
};

state.leerjaar = leesLeerjaar();
state.aantal = leesAantal();
state.tempo = leesTempo();
toonStart();

// de zelfcheck is er voor de ontwikkelaar, dus hij komt pas binnen bij #test
if (location.hash === '#test') import('./zelfcheck.js');

export { SPELLEN, AANTALLEN, jasjesVoor, LEERJAREN, TEMPO, LOF, MOED, state, schoonNaam, naam, metNaam, leesTempo, secondenVoor, jarenVan, planVoor, bouwToets, maakVraag, toonStart };
