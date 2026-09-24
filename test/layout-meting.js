// Run in the browser at a given viewport:
//   (await import('/test/layout-meting.js')).meet()
// Plays one question of a clock, a mirror and a typing chapter, and checks that the question, the
// choices and (after answering) the next button are fully on screen without scrolling.
export async function meet() {
  var fouten = [], $ = function (id) { return document.getElementById(id); };
  var wacht = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function inBeeld(id, wat) {
    var el = $(id);
    if (!el || el.hidden || !el.offsetParent) return;
    var r = el.getBoundingClientRect();
    if (r.top < 0 || r.bottom > innerHeight + 1 || r.left < 0 || r.right > innerWidth + 1) {
      fouten.push(innerWidth + '×' + innerHeight + ' ' + wat + ': ' + id + ' valt buiten beeld (' + Math.round(r.top) + '-' + Math.round(r.bottom) + ')');
    }
  }
  function speel(spelNaam, hoofdstuk) {
    $('terugBtn').click();
    var spel = Array.prototype.find.call(document.querySelectorAll('#spellen .tegel, #spellen .hfd'), function (b) { return b.textContent.indexOf(spelNaam) > -1; });
    if (!spel) { fouten.push('spel niet gevonden: ' + spelNaam); return false; }
    spel.click();
    var hfd = Array.prototype.find.call(document.querySelectorAll('#menu .hfd'), function (b) { return b.textContent.indexOf(hoofdstuk) > -1; });
    if (!hfd) { fouten.push('hoofdstuk niet gevonden: ' + hoofdstuk); return false; }
    hfd.click();
    return true;
  }
  var lj = document.querySelector('#leerjaren [data-lj="3"]');
  if (lj) lj.click();
  if (document.documentElement.scrollWidth > innerWidth + 1) fouten.push('startscherm scrollt horizontaal');
  var spellen = [['Klokkijken', 'Kwartieren'], ['Spiegelen', 'naar rechts'], ['Meten en wegen', 'Zelf omrekenen']];
  for (var n = 0; n < spellen.length; n++) {
    var g = spellen[n];
    if (!speel(g[0], g[1])) continue;
    window.scrollTo(0, 0);
    inBeeld('question', g[0]);
    inBeeld('options', g[0]);
    inBeeld('typen', g[0]);
    if (!$('options').hidden) $('options').querySelector('.opt').click();
    else { $('in0').value = '1'; $('checkBtn').click(); }
    // the answer sheet slides up in 0.22 s; measure its end position. Finishing the animations
    // also covers a hidden browser tab, which draws no frames and so never plays them
    await wacht(50);
    document.getAnimations().forEach(function (a) { if (a.animationName === 'opschuiven' || a.animationName === 'opschuivenRechts') a.finish(); });
    inBeeld('nextBtn', g[0] + ' na antwoord');
    inBeeld('feedback', g[0] + ' na antwoord');
    $('homeBtn').click();
  }
  await wacht(50);
  return { ok: fouten.length === 0, fouten: fouten };
}
