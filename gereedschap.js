// tools shared by the games and the chassis

export var $ = function (id) { return document.getElementById(id); };
export var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


export function shuffle(a) {
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
export function pad2(n) { return n < 10 ? '0' + n : String(n); }
// turns a correct answer and three distractors into four choices in random order
export function keuzes(juist, fout) {
  return shuffle(fout.concat([juist])).map(function (t) {
    return { text: String(t), ok: String(t) === String(juist) };
  });
}
// tops up a list of distractors to three, without duplicates and without the correct answer
export function vulAan(lijst, juist, kandidaten, geldig) {
  kandidaten.forEach(function (k) {
    if (lijst.length < 3 && String(k) !== String(juist) && lijst.indexOf(k) === -1 &&
        (!geldig || geldig(k))) lijst.push(k);
  });
  return lijst;
}

export function positief(k) { return k > 0; }
// tops up with the neighbours of the correct answer until there are three distractors
export function vulRondom(lijst, juist, stap, geldig) {
  for (var d = stap; lijst.length < 3 && d < stap * 200; d += stap) {
    vulAan(lijst, juist, [juist + d, juist - d], geldig || positief);
  }
  return lijst;
}
// n others from a list, not counting the correct answer
export function andere(lijst, juist, n) {
  return shuffle(lijst.filter(function (x) { return x !== juist; })).slice(0, n);
}
// a capital that is more than one letter (ß becomes SS) would change the name, and with it the key
export function hoofdletter(t) {
  var eerste = Array.from(t)[0] || '', groot = eerste.toUpperCase();
  return (Array.from(groot).length === 1 ? groot : eerste) + t.slice(eerste.length);
}


// what a voice reads aloud: symbols a child sees as maths, written out as words, because a
// speech engine reads "1/4" or "−4" as a date or skips the sign
var DELEN = { 2: 'half', 3: 'derde', 4: 'vierde', 5: 'vijfde', 6: 'zesde', 7: 'zevende', 8: 'achtste',
  9: 'negende', 10: 'tiende', 12: 'twaalfde', 100: 'honderdste', 1000: 'duizendste' };
function uitgeschreven(t) {
  return String(t)
    .replace(/^[A-Z][a-z]+ \d+:\s*/, '')  // 'Vraag 3:', 'Monster 3:': the number is on the dots
    .replace(/(\d+)\s*\/\s*(\d+)/g, function (m, a, b) {
      if (!DELEN[b]) return a + ' gedeeld door ' + b;
      return (a === '1' ? 'een' : a) + ' ' + (b === '2' && a !== '1' ? 'halve' : DELEN[b]);
    })
    .replace(/€\s?(\d[\d.,]*)/g, '$1 euro')
    .replace(/\s?°C/g, ' graden')
    .replace(/−\s?(?=\d)/g, 'min ')
    .replace(/(\d)\s*[×x]\s*(?=\d)/g, '$1 maal ')
    .replace(/(\d)\s*÷\s*(?=\d)/g, '$1 gedeeld door ')
    .replace(/\s?%/g, ' procent')
    .replace(/\s\+\s/g, ' plus ')
    .replace(/\s[−-]\s/g, ' min ')
    .replace(/\s=\s/g, ' is ')
    .replace(/(^|\s)\?(?=\s|$)/g, '$1hoeveel');
}
export function voorleestekst(titel, sub, opties) {
  var delen = [uitgeschreven(titel)];
  if (sub) delen.push(uitgeschreven(sub));
  if (opties && opties.length) {
    var w = opties.map(uitgeschreven);
    delen.push('Kies uit: ' + (w.length > 1 ? w.slice(0, -1).join(', ') + ' of ' + w[w.length - 1] : w[0]) + '.');
  }
  return delen.join(' ');
}
