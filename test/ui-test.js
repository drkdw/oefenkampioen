// Clicks through the real app in the browser: screens, actions, every chapter of every game,
// stress and attacks. Run it on the local server, at each screen size you want to check:
//   (await import('/test/ui-test.js')).alles()
// Everything the app stored is put aside first and put back afterwards, also when a test throws.
// Closed the tab halfway? The next run puts the old data back before it starts.
import { state } from '../chassis.js';

var BACKUP = 'uitest-backup';
var $ = function (id) { return document.getElementById(id); };
var wacht = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
var fouten = [], opmerkingen = [], teller = 0;
// the last check is kept, so a run that is cut off (page reloaded) still says how far it got
function check(ok, wat) { teller++; if (!ok) fouten.push(wat); if (teller % 25 === 0) localStorage.setItem('uitest-stap', wat); }
function let_op(wat) { if (opmerkingen.indexOf(wat) === -1) opmerkingen.push(wat); }

/* ==================== data aside and back ==================== */
function appSleutels() {
  var k = [];
  for (var i = 0; i < localStorage.length; i++) if (localStorage.key(i).indexOf('oefenkampioen-') === 0) k.push(localStorage.key(i));
  return k;
}
function wisApp() { appSleutels().forEach(function (k) { localStorage.removeItem(k); }); }
function zetOpzij() {
  if (localStorage.getItem(BACKUP) !== null) zetTerug();
  var data = {};
  appSleutels().forEach(function (k) { data[k] = localStorage.getItem(k); });
  localStorage.setItem(BACKUP, JSON.stringify(data));
  wisApp();
}
function zetTerug() {
  var data = JSON.parse(localStorage.getItem(BACKUP) || '{}');
  wisApp();
  Object.keys(data).forEach(function (k) { localStorage.setItem(k, data[k]); });
  localStorage.removeItem(BACKUP);
}

/* ==================== helpers ==================== */
function zichtbaar(el) { return !!el && !el.closest('[hidden]') && el.getClientRects().length > 0; }
function scherm() { return document.body.dataset.scherm; }
// Android's back button; never leaves the page, even if the app forgot its history step
// a finger is never faster than the browser: let earlier history steps land first
async function terug() {
  await wacht(150);
  if (!(history.state && history.state.binnen)) { fouten.push('geen stap in de geschiedenis op ' + scherm() + ': terug zou de app verlaten'); return; }
  history.back();
  await wacht(150);
}
function profielen() { return JSON.parse(localStorage.getItem('oefenkampioen-profielen') || '[]'); }
// where a child's data lives: the first child on an empty device takes over the nameless key ''
function opslag(soort, naam) {
  var p = profielen().filter(function (q) { return q.naam === naam; })[0];
  return localStorage.getItem('oefenkampioen-' + soort + (p && p.sleutel ? ':' + p.sleutel : ''));
}
function tegelNamen() { return Array.prototype.map.call(document.querySelectorAll('.wiekies[data-sleutel] .wienaam'), function (n) { return n.textContent; }); }
// a fresh app in an iframe: the only way to test what happens when the page loads
async function laadVers() {
  var f = document.createElement('iframe');
  f.style.cssText = 'position:fixed;left:-9999px;width:375px;height:812px';
  // listen before loading, and never wait forever: a load event can go missing
  localStorage.setItem('uitest-stap', 'nieuw venster laden');
  var geladen = new Promise(function (r) { f.onload = r; });
  f.src = '/?uitest=' + Date.now();
  document.body.appendChild(f);
  await Promise.race([geladen, wacht(5000)]);
  localStorage.setItem('uitest-stap', 'nieuw venster geladen');
  for (var i = 0; i < 50 && !(f.contentDocument && f.contentDocument.body && f.contentDocument.body.dataset.scherm); i++) await wacht(100);
  check(!!f.contentDocument.body.dataset.scherm, 'de app laadt niet in een nieuw venster');
  return f;
}
function nieuwKind(naam, jaar, kleur) {
  if (scherm() !== 'wie') { $('profielBtn').click(); if (naam && $('wisselBtn')) $('wisselBtn').click(); }
  if (!zichtbaar($('naam'))) $('wieNieuw').click();
  $('naam').value = naam;
  $('naam').dispatchEvent(new Event('input'));
  if (jaar) $('wieJaren').querySelector('[data-lj="' + jaar + '"]').click();
  if (kleur !== undefined) $('wieKleuren').children[kleur].click();
  $('naamOk').click();
}
function kiesKind(naam) {
  if (scherm() !== 'wie') { $('profielBtn').click(); $('wisselBtn').click(); }
  Array.prototype.find.call(document.querySelectorAll('.wiekies[data-sleutel]'), function (b) { return b.querySelector('.wienaam').textContent === naam; }).click();
}
// parents live at the bottom of the settings screen, not in the child's name menu
function naarOuders() { $('profielBtn').click(); $('instelBtn').click(); $('instelOuderBtn').click(); }
function naarStart() { if (scherm() === 'wie') return; $('instelTerugBtn').click(); }

/* ==================== screens: layout, touch targets, labels, contrast ==================== */
function kleurVan(css) {
  var m = css.match(/[\d.]+/g);
  return m ? { r: +m[0], g: +m[1], b: +m[2], a: m[3] === undefined ? 1 : +m[3] } : null;
}
function licht(c) {
  return [c.r, c.g, c.b].map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); })
    .reduce(function (s, v, i) { return s + v * [0.2126, 0.7152, 0.0722][i]; }, 0);
}
function contrast(a, b) { var x = licht(a), y = licht(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
// the color behind an element: the first ancestor with a solid background
function achtergrond(el) {
  for (var e = el; e; e = e.parentElement) {
    var cs = getComputedStyle(e), c = kleurVan(cs.backgroundColor);
    if (cs.backgroundImage !== 'none') return null;
    if (c && c.a === 1) return c;
  }
  return kleurVan(getComputedStyle(document.body).backgroundColor);
}
// all readable text, not only buttons: 4.5:1, or 3:1 from 24px (WCAG AA); the logo is exempt
function keurTekst(naam) {
  Array.prototype.forEach.call(document.querySelectorAll('body *:not(script):not(style):not(svg *)'), function (el) {
    var eigen = Array.prototype.some.call(el.childNodes, function (n) { return n.nodeType === 3 && /[A-Za-z0-9À-ÿ]/.test(n.textContent); });
    if (!eigen || !zichtbaar(el) || el.closest('h1, .scherm, .veld, [aria-hidden="true"], :disabled')) return;
    var cs = getComputedStyle(el), tekst = kleurVan(cs.color), bg = achtergrond(el);
    if (!tekst || !bg || tekst.a < 1 || parseFloat(cs.opacity) < 1) return;
    var groot = parseFloat(cs.fontSize) >= 24, c = contrast(tekst, bg);
    if (c < (groot ? 3 : 4.5)) let_op(naam + ' tekst "' + el.textContent.trim().slice(0, 24) + '": contrast ' + c.toFixed(1) + ' (nodig ' + (groot ? 3 : 4.5) + ')');
  });
}
function keurScherm(naam) {
  keurTekst(naam);
  var w = innerWidth;
  check(document.documentElement.scrollWidth <= w + 1, w + 'px ' + naam + ': de pagina scrollt horizontaal');
  Array.prototype.forEach.call(document.querySelectorAll('button, input, summary, a'), function (el) {
    if (!zichtbaar(el)) return;
    var r = el.getBoundingClientRect(), label = (el.getAttribute('aria-label') || el.textContent || el.placeholder || '').trim();
    var wie = naam + ' ' + (el.id ? '#' + el.id : el.className ? '.' + String(el.className).split(' ')[0] : el.tagName) + ' "' + label.slice(0, 24) + '"';
    check(label.length > 0, w + 'px ' + wie + ': geen naam voor een schermlezer');
    check(r.right <= w + 1 && r.left >= -1, w + 'px ' + wie + ': steekt buiten het scherm');
    // links in running text are exempt: they are as tall as the line they sit in
    if (el.tagName !== 'A' && Math.min(r.width, r.height) < 40) let_op(w + 'px ' + wie + ': raakvlak ' + Math.round(r.width) + '×' + Math.round(r.height) + ', kleiner dan 40px');
    if (el.tagName === 'BUTTON' && !el.disabled) {
      var cs = getComputedStyle(el), tekst = kleurVan(cs.color), bg = kleurVan(cs.backgroundColor);
      if (tekst && bg && bg.a === 1 && el.textContent.trim()) {
        var groot = parseFloat(cs.fontSize) >= 24, c = contrast(tekst, bg);
        if (c < (groot ? 3 : 4.5)) let_op(naam + ' ' + wie + ': contrast ' + c.toFixed(1) + ' (nodig ' + (groot ? 3 : 4.5) + ')');
      }
    }
  });
}
async function schermen() {
  nieuwKind('Lotte', 3);
  nieuwKind('Wout', 5);
  keurScherm('start');
  $('profielBtn').click(); keurScherm('naammenu'); $('profielBtn').click();
  $('profielBtn').click(); $('instelBtn').click(); keurScherm('instellingen');
  $('profielBtn').click(); $('wisselBtn').click(); keurScherm('wie');
  $('wieNieuw').click(); keurScherm('wie met formulier');
  kiesKind('Lotte');
  $('stickerTegel').click(); keurScherm('stickerboek'); $('stickerTerugBtn').click();
  document.querySelector('#spellen .tegel[data-i]').click(); keurScherm('hoofdstukken');
  document.querySelector('#menu .hfd').click(); keurScherm('spel');
  var o = document.querySelector('#options .opt'); if (o) { o.click(); keurScherm('spel na antwoord'); }
  $('homeBtn').click(); $('terugBtn').click();
  naarOuders(); keurScherm('voor ouders');
  document.querySelector('.wisKind').click(); keurScherm('voor ouders, verwijderen'); $('ouderTerugBtn').click();
}

/* ==================== actions ==================== */
async function acties() {
  // an empty device opens on the welcome with the form for a first child
  var f = await laadVers(), d = f.contentDocument;
  check(d.body.dataset.scherm === 'wie' && !d.getElementById('wieNieuwKaart').hidden, 'leeg toestel opent niet op de onboarding maar op ' + d.body.dataset.scherm);
  check(d.getElementById('wieKop').textContent === 'Welkom!' && !d.getElementById('wieUitleg').hidden, 'leeg toestel toont geen welkom');
  f.remove();

  // Klaar only works with a name and a school year
  nieuwKind('', null);
  check($('naamOk').disabled, 'Klaar werkt zonder naam');
  $('naam').value = 'Emma'; $('naam').dispatchEvent(new Event('input'));
  check($('naamOk').disabled, 'Klaar werkt zonder leerjaar');
  $('wieJaren').querySelector('[data-lj="1"]').click();
  check(!$('naamOk').disabled, 'Klaar blijft uit met naam en leerjaar');
  $('wieKleuren').children[4].click();
  $('naamOk').click();
  check(scherm() === 'start', 'na Klaar niet meteen bij de spellen');
  check(opslag('leerjaar', 'Emma') === '1', 'het gekozen leerjaar is niet bewaard');
  check(profielen()[0].kleur === 4, 'de gekozen kleur is niet bewaard');
  check(state.leerjaar === 1, 'de spellen tonen niet het gekozen leerjaar');
  f = await laadVers(); d = f.contentDocument;
  check(d.body.dataset.scherm === 'start', 'met één kind opent de app niet meteen op de spellen');
  f.remove();

  // a second child gets a free color, and with two the app opens on Wie speelt er?
  $('profielBtn').click(); $('wisselBtn').click(); $('wieNieuw').click();
  var standaard = Number($('wieKleuren').querySelector('[aria-pressed="true"]').dataset.k);
  check(standaard !== 4, 'het tweede kind krijgt standaard dezelfde kleur als het eerste');
  nieuwKind('Noor', 2);
  f = await laadVers(); d = f.contentDocument;
  check(d.body.dataset.scherm === 'wie', 'met twee kinderen opent de app niet op Wie speelt er?');
  check(d.querySelectorAll('.wiekies[data-sleutel]').length === 2, 'Wie speelt er? toont niet twee kinderen');
  f.remove();

  // switching keeps each child's own settings
  kiesKind('Emma');
  check(state.leerjaar === 1 && $('profielBtn').textContent.indexOf('Emma') === 0, 'wisselen naar Emma lukt niet');
  $('profielBtn').click(); $('instelBtn').click();
  $('aantallen').querySelector('[data-a="20"]').click();
  $('tempoKnop').querySelector('[data-t="true"]').click();
  $('instelKleuren').children[6].click();
  check(opslag('aantal', 'Emma') === '20', 'aantal vragen niet bewaard');
  check(opslag('tempo', 'Emma') === 'aan', 'op tempo niet bewaard');
  check(profielen().filter(function (p) { return p.naam === 'Emma'; })[0].kleur === 6, 'kleur wijzigen in Instellingen niet bewaard');
  kiesKind('Noor');
  check(state.aantal !== 20 && state.tempo === false, 'de instellingen van Emma lekken naar Noor');

  // Android's back button goes back to the games, never out of the app
  $('profielBtn').click(); $('instelBtn').click();
  await terug();
  check(scherm() === 'start', 'terug vanuit Instellingen landt niet op de spellen');
  document.querySelector('#spellen .tegel[data-i]').click();
  await terug();
  check(scherm() === 'start', 'terug vanuit de hoofdstukken landt niet op de spellen');
  document.querySelector('#spellen .tegel[data-i]').click(); $('terugBtn').click(); await wacht(150);
  check(!(history.state && history.state.binnen), 'terug via de knop laat een extra stap in de geschiedenis');

  // remove from the list keeps the scores, retyping the name brings them back; wiping removes all
  localStorage.setItem('oefenkampioen-beste:noor', JSON.stringify({ 'klok:0': { score: 9, van: 10 } }));
  naarOuders();
  var kaart = document.querySelector('.ouderkaart[data-naam="Noor"]');
  kaart.querySelector('.wisKind').click();
  check(document.activeElement.classList.contains('profielnee'), 'na Verwijderen staat de focus niet op de veilige keuze');
  kaart.querySelector('.profiellijst').click();
  check(!profielen().some(function (p) { return p.naam === 'Noor'; }), 'Uit de lijst haalt Noor niet uit de lijst');
  check(localStorage.getItem('oefenkampioen-beste:noor') !== null, 'Uit de lijst wist ook de scores');
  $('ouderTerugBtn').click();
  nieuwKind('noor', 2);
  check(JSON.parse(localStorage.getItem('oefenkampioen-beste:noor'))['klok:0'].score === 9, 'opnieuw Noor typen brengt de scores niet terug');
  naarOuders();
  document.querySelector('.ouderkaart[data-naam="Noor"] .wisKind').click();
  document.querySelector('.ouderkaart[data-naam="Noor"] .profielja').click();
  check(appSleutels().every(function (k) { return !/:noor$/.test(k); }), 'Écht wissen laat gegevens van Noor staan');
  $('ouderTerugBtn').click();

  // restore a file of one child
  await zetBestandTerug({ app: 'oefenkampioen', soort: 'kind', versie: 1, indeling: 2, gemaakt: '2026-10-01', naam: 'Fien',
    instellingen: { leerjaar: 4 }, beste: { 'klok:0': { score: 10, van: 10 } }, gespeeld: {}, niveau: {}, behaald: {}, dagen: [] });
  check(profielen().some(function (p) { return p.naam === 'Fien'; }), 'terugzetten voegt Fien niet toe');
  check(opslag('leerjaar', 'Fien') === '4', 'terugzetten neemt het leerjaar niet over');
  $('ouderTerugBtn').click();
}
async function zetBestandTerug(inhoud, bevestig) {
  if (scherm() !== 'ouders') naarOuders();
  var dt = new DataTransfer();
  dt.items.add(new File([typeof inhoud === 'string' ? inhoud : JSON.stringify(inhoud)], 'test.json', { type: 'application/json' }));
  $('herstelInput').files = dt.files;
  $('herstelInput').dispatchEvent(new Event('change'));
  await wacht(150);
  if (bevestig !== false && $('herstelJa')) $('herstelJa').click();
}

/* ==================== every chapter of every game, one full test each ==================== */
async function spellen() {
  nieuwKind('Speler', 6);
  var spellenLijst = Array.prototype.map.call(document.querySelectorAll('#spellen .tegel[data-i]'), function (b) { return b.dataset.i; });
  var gespeeld = 0;
  for (var s = 0; s < spellenLijst.length; s++) {
    document.querySelector('#spellen .tegel[data-i="' + spellenLijst[s] + '"]').click();
    while ($('vroegerKnop')) $('vroegerKnop').click();
    var hoofdstukken = Array.prototype.map.call(document.querySelectorAll('#menu .hfd'), function (b) { return b.dataset.i; });
    for (var h = 0; h < hoofdstukken.length; h++) {
      var wat = state.spel.id + ' hoofdstuk ' + hoofdstukken[h];
      document.querySelector('#menu .hfd[data-i="' + hoofdstukken[h] + '"]').click();
      check(scherm() === 'game', wat + ': start niet');
      var juist = 0;
      for (var q = 0; q < state.lengte; q++) {
        var v = state.current, goed = q % 3 !== 2;
        check(state.spel.vraag(v, q + 1).titel && $('question').textContent.length > 0, wat + ' vraag ' + (q + 1) + ': geen vraagtekst');
        if (v.options) {
          var i = v.options.findIndex(function (o) { return goed ? o.ok : !o.ok; });
          $('opt' + i).click();
        } else {
          v.typen.velden.forEach(function (f, k) { $('in' + k).value = String(goed ? f.ant : (f.ant + 1) % Math.pow(10, f.max || 2)); });
          $('checkBtn').click();
        }
        check(state.answered, wat + ' vraag ' + (q + 1) + ': antwoord niet aanvaard');
        check(!$('blad').hidden, wat + ' vraag ' + (q + 1) + ': geen uitleg na het antwoord');
        if (goed) juist++;
        $('nextBtn').click();
      }
      check(scherm() === 'result', wat + ': geen resultaatscherm na de laatste vraag');
      check($('resultScore').textContent.indexOf(juist + ' / ' + state.lengte) === 0, wat + ': score ' + $('resultScore').textContent + ', verwacht ' + juist);
      gespeeld++;
      $('menuBtn').click();
      while ($('vroegerKnop')) $('vroegerKnop').click();
    }
    $('terugBtn').click();
  }
  var beste = JSON.parse(opslag('beste', 'Speler') || '{}');
  check(Object.keys(beste).length === gespeeld, 'niet elk gespeeld hoofdstuk heeft een beste score (' + Object.keys(beste).length + ' van ' + gespeeld + ')');
  return gespeeld;
}

/* ==================== stress ==================== */
async function stress() {
  // many children, long names, names in other scripts
  var t0 = performance.now();
  // names are letters only, so the forty children are told apart by letters, not numbers
  for (var i = 0; i < 40; i++) nieuwKind('Kind ' + 'abcdefghij'[i % 10] + 'klmn'[Math.floor(i / 10)], (i % 6) + 1);
  ['Maximiliaan-Jozef', 'Zoë', '李明', 'Ахмед', "D'Hondt"].forEach(function (n) { nieuwKind(n, 3); });
  check(performance.now() - t0 < 5000, '45 kinderen toevoegen duurt langer dan 5 seconden');
  $('profielBtn').click(); $('wisselBtn').click();
  check(document.querySelectorAll('.wiekies[data-sleutel]').length >= 45, 'Wie speelt er? toont geen 45 kinderen');
  keurScherm('wie met 45 kinderen');
  var tegels = tegelNamen();
  check(tegels.indexOf('Zoë') > -1 && tegels.indexOf('李明') > -1 && tegels.indexOf('Ахмед') > -1, 'een naam in een ander schrift ging verloren');
  kiesKind('Zoë');

  // double tap on Klaar makes one child, hammering an answer counts once
  $('profielBtn').click(); $('wisselBtn').click(); $('wieNieuw').click();
  $('naam').value = 'Dubbel'; $('naam').dispatchEvent(new Event('input'));
  $('wieJaren').querySelector('[data-lj="2"]').click();
  $('naamOk').click(); $('naamOk').click();
  check(profielen().filter(function (p) { return p.naam === 'Dubbel'; }).length === 1, 'dubbel tikken op Klaar maakt twee kinderen');
  document.querySelector('#spellen .tegel[data-i]').click();
  document.querySelector('#menu .hfd').click();
  var v = state.current;
  if (v.options) {
    var juist = v.options.findIndex(function (o) { return o.ok; });
    for (i = 0; i < 25; i++) $('opt' + juist).click();
    for (i = 0; i < 4; i++) $('opt' + i).click();
    check(state.score === 1 && state.results.length === 1, 'hameren op een antwoord telt meer dan één keer (score ' + state.score + ')');
  }
  for (i = 0; i < 25; i++) $('nextBtn').click();
  $('homeBtn').click(); $('terugBtn').click();

  // opening and closing a screen faster than history.back() lands must never leave the page
  var adres = location.href;
  for (i = 0; i < 20; i++) { $('profielBtn').click(); $('instelBtn').click(); $('instelTerugBtn').click(); }
  $('profielBtn').click(); $('instelBtn').click();
  await wacht(400);
  check(location.href === adres && scherm() === 'instellingen', 'razendsnel wisselen tussen schermen verlaat de pagina of het scherm');
  await terug();
  check(scherm() === 'start', 'na razendsnel wisselen brengt terug je niet naar de spellen');
  document.querySelector('#spellen .tegel[data-i]').click();
  document.querySelector('#menu .hfd').click();
  check(state.q <= state.lengte && !(scherm() === 'game' && state.answered && $('blad').hidden), 'hameren op Volgende brengt het spel in de war');
  $('homeBtn').click(); $('terugBtn').click();

  // a full storage: the app keeps working and loses nothing that was there
  var vul = 'x'.repeat(100000), n = 0;
  try { for (; n < 2000; n++) localStorage.setItem('uitest-vol-' + n, vul); } catch (e) { /* full */ }
  var fout = null, voor = localStorage.getItem('oefenkampioen-profielen');
  window.addEventListener('error', function opvang(e) { fout = e.message; window.removeEventListener('error', opvang); });
  try { nieuwKind('Vol', 3); document.querySelector('#spellen .tegel[data-i]').click(); document.querySelector('#menu .hfd').click(); $('homeBtn').click(); $('terugBtn').click(); }
  catch (e) { fout = e.message; }
  for (var k = 0; k <= n; k++) localStorage.removeItem('uitest-vol-' + k);
  check(!fout, 'een volle opslag geeft een fout: ' + fout);
  check(JSON.parse(voor).length <= profielen().length, 'een volle opslag maakte de lijst kinderen kapot');
}

/* ==================== attacks ==================== */
var LOKAAS = '<img src=x onerror="window.__lek=1">';
function gelekt(w) { return !!(w || window).__lek || !!document.querySelector('img[src="x"], svg[onload], script[data-lek]'); }
async function aanvallen() {
  window.__lek = 0;
  // markup in a typed name
  nieuwKind(LOKAAS, 3);
  nieuwKind('<svg onload=window.__lek=1>Kat', 3);
  await wacht(100);
  check(!gelekt(), 'markup in een getypte naam wordt uitgevoerd');
  check(profielen().every(function (p) { return !/[<>="]/.test(p.naam); }), 'een getypte naam bewaart < > = of "');
  naarOuders(); await wacht(50);
  check(!gelekt(), 'markup in een naam lekt op het scherm voor ouders');
  $('ouderTerugBtn').click();

  // tampered storage: markup in keys, names and colors
  localStorage.setItem('oefenkampioen-profielen', JSON.stringify([
    { sleutel: 'x"><img src=x onerror="window.__lek=1">', naam: LOKAAS, kleur: '1;background:url(javascript:alert(1))' },
    { sleutel: '__proto__', naam: '__proto__' }, { sleutel: 'ok', naam: 'Ok', kleur: 99 }]));
  localStorage.setItem('oefenkampioen-actief', '"><img src=x onerror="window.__lek=1">');
  var f = await laadVers(), d = f.contentDocument;
  check(!f.contentWindow.__lek && !d.querySelector('img[src="x"]'), 'geknoeide opslag voert markup uit bij het laden');
  check(Array.prototype.every.call(d.querySelectorAll('.avatar'), function (a) { return !/url\(|javascript/i.test(a.getAttribute('style') || ''); }), 'een geknoeide kleur komt in de stijl terecht');
  f.remove();
  wisApp();
  location.hash = '#' + encodeURIComponent(LOKAAS); await wacht(100);
  check(!gelekt(), 'markup in het adres na # wordt uitgevoerd');
  history.replaceState(null, '', location.pathname);

  // restore files: markup, prototype pollution, a newer version, garbage
  await laadVers().then(function (f2) { f2.remove(); });
  await zetBestandTerug('{"app":"oefenkampioen","soort":"kind","versie":1,"indeling":2,"naam":"<img src=x onerror=\\"window.__lek=1\\">Mo",' +
    '"instellingen":{"leerjaar":"3<script>"},"beste":{"__proto__":{"vervuild":1},"klok:0":{"score":"<b>","van":10}},"gespeeld":{},"niveau":{},"behaald":{},"dagen":["<img>"]}');
  await wacht(50);
  check(!gelekt(), 'markup in een bewaarbestand wordt uitgevoerd');
  check(({}).vervuild === undefined, 'een bewaarbestand vervuilt Object.prototype');
  check(profielen().every(function (p) { return !/[<>]/.test(p.naam); }), 'een naam uit een bewaarbestand bewaart markup');
  await zetBestandTerug({ app: 'oefenkampioen', soort: 'kind', versie: 999, naam: 'Toekomst' }, false);
  check(!$('ouderMelding').hidden && $('ouderMelding').classList.contains('fout'), 'een bestand van een nieuwere versie geeft geen duidelijke melding');
  check(!profielen().some(function (p) { return p.naam === 'Toekomst'; }), 'een bestand van een nieuwere versie wordt toch teruggezet');
  await zetBestandTerug('dit is geen json', false);
  check($('ouderMelding').classList.contains('fout'), 'een kapot bestand geeft geen foutmelding');
  $('ouderTerugBtn').click();
}

/* ==================== run ==================== */
export async function alles() {
  fouten = []; opmerkingen = []; teller = 0;
  var geluid = state.sound, t0 = performance.now(), gespeeld = 0, gecrasht = null;
  zetOpzij();
  state.sound = false;
  var delen = [['schermen', schermen], ['acties', acties], ['spellen', spellen], ['stress', stress], ['aanvallen', aanvallen]];
  try {
    for (var i = 0; i < delen.length; i++) {
      wisApp();
      history.replaceState(null, '', location.pathname);
      var f = await laadVers(); f.remove();
      // start every part from a clean, freshly loaded state of this page
      state.leerjaar = 3; state.aantal = 10; state.tempo = false; state.voorlezen = false;
      if (scherm() !== 'start' && scherm() !== 'wie') document.querySelector('#instelTerugBtn').click();
      localStorage.setItem('uitest-stap', delen[i][0]);
      try { var r = await delen[i][1](); if (delen[i][0] === 'spellen') gespeeld = r; }
      catch (e) { fouten.push(delen[i][0] + ' stopte met een fout: ' + e.message); }
    }
  } catch (e) { gecrasht = e; }
  finally {
    zetTerug();
    state.sound = geluid;
    history.replaceState(null, '', location.pathname);
  }
  if (gecrasht) fouten.push('de test stopte: ' + gecrasht.message);
  var uitslag = {
    ok: !fouten.length, scherm: innerWidth + '×' + innerHeight, checks: teller, hoofdstukkenGespeeld: gespeeld,
    seconden: Math.round((performance.now() - t0) / 1000), fouten: fouten, opmerkingen: opmerkingen
  };
  console.log('UI-test ' + uitslag.scherm + ': ' + teller + ' checks, ' + fouten.length + ' fouten, ' + opmerkingen.length + ' opmerkingen');
  // the tests left this page in a test state: reload it with the real data, and keep the
  // result where the reloaded page (and whoever ran this) can still read it
  localStorage.setItem('uitest-uitslag', JSON.stringify(uitslag));
  localStorage.removeItem('uitest-stap');
  setTimeout(function () { location.reload(); }, 50);
  return uitslag;
}
