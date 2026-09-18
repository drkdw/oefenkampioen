// gereedschap dat de spellen en het chassis delen

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
// maakt van een juist antwoord en drie afleiders vier keuzes in willekeurige volgorde
export function keuzes(juist, fout) {
  return shuffle(fout.concat([juist])).map(function (t) {
    return { text: String(t), ok: String(t) === String(juist) };
  });
}
// vult een lijst afleiders aan tot er drie zijn, zonder dubbels en zonder het juiste antwoord
export function vulAan(lijst, juist, kandidaten, geldig) {
  kandidaten.forEach(function (k) {
    if (lijst.length < 3 && String(k) !== String(juist) && lijst.indexOf(k) === -1 &&
        (!geldig || geldig(k))) lijst.push(k);
  });
  return lijst;
}

export function positief(k) { return k > 0; }
// vult aan met de buren van het juiste antwoord tot er drie afleiders staan
export function vulRondom(lijst, juist, stap, geldig) {
  for (var d = stap; lijst.length < 3 && d < stap * 200; d += stap) {
    vulAan(lijst, juist, [juist + d, juist - d], geldig || positief);
  }
  return lijst;
}
// n andere uit een lijst, het juiste antwoord niet meegerekend
export function andere(lijst, juist, n) {
  return shuffle(lijst.filter(function (x) { return x !== juist; })).slice(0, n);
}
export function hoofdletter(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

