// Rewards, all derived from the best scores that are already stored: stars, stickers, a daily
// suggestion, and a count of days practised. No DOM and no storage here, so it is testable alone.

// one sticker per chapter, in chapter order; a new chapter needs a new sticker at the end of its
// game, the self-check fails otherwise
export var STICKERS = {
  klok: ['🦢', '🐨', '🦉', '🐢', '🐇', '🦔', '🐿️', '🦌', '🐝'],
  maal: ['🐼', '🐸', '🐙', '🦖', '🐉', '🦄', '🐲', '🦕', '🐊', '🦈', '🐳'],
  winkel: ['🍎', '🍌', '🍓', '🍇', '🍉', '🍒', '🍍', '🥝', '🍑', '🍋', '🥕'],
  maten: ['🐘', '🦒', '🦓', '🦏', '🐪', '🦘', '🐃', '🐄', '🐖', '🐑', '🐐'],
  kalender: ['🌼', '🌻', '🍂', '⛄', '🌈', '❄️', '☀️'],
  brug: ['🚂', '🚀', '🚁', '⛵', '🚲', '🛴', '🚕', '🚌', '🚜', '🚒', '🚑', '🚓', '🛸', '🎈', '🪁',
    '⚓', '🗼', '🏰', '🎡', '🎢', '🏝️', '🌋', '🗻', '🏕️', '🚢', '🚤', '🛶', '🚠', '🚃', '🛵'],
  spiegel: ['🦎', '🐞', '🐠', '🦜', '🦚', '🦩', '🐬', '🐧'],
  breuken: ['🥧', '🍰', '🧁', '🍩', '🍬', '🍫', '🍭', '🍦', '🥐', '🥨', '🧇', '🥞'],
  meetkunde: ['🧊', '💎', '🔮', '🎁', '🪐', '⭐', '🌀'],
  verhoudingen: ['🎻', '🎷', '🎖️', '👑', '🎹', '🎸', '🎺', '🥁']
};

// integer math: 9 out of 10 must be exactly three stars, without trusting 0.9 in floating point
export function sterrenVoor(beste) {
  var s = Number(beste && beste.score), v = Number(beste && beste.van);
  if (!(v > 0) || !(s >= 0)) return 0;
  return s * 10 >= v * 9 ? 3 : s * 10 >= v * 7 ? 2 : s * 10 >= v * 5 ? 1 : 0;
}

export function stickerVoor(spelId, index) {
  return (STICKERS[spelId] || [])[index] || '';
}

function twee(n) { return (n < 10 ? '0' : '') + n; }
// the chapters in the sticker book: those up to the school year, plus every sticker already earned
// higher up, so switching back to a lower year never hides a sticker
export function boekVoor(spel, beste, leerjaar) {
  return spel.hoofdstukken.map(function (h, i) { return { h: h, i: i }; }).filter(function (r) {
    return r.h.leerjaar <= leerjaar || sterrenVoor(beste[spel.id + ':' + r.i]) === 3;
  });
}

export function datumVan(d) {
  return d.getFullYear() + '-' + twee(d.getMonth() + 1) + '-' + twee(d.getDate());
}

var DATUM = /^\d{4}-\d{2}-\d{2}$/, BEWAAR = 60;
export function mengDagen(a, b) {
  var uit = [];
  (Array.isArray(a) ? a : []).concat(Array.isArray(b) ? b : []).forEach(function (d) {
    if (typeof d === 'string' && DATUM.test(d) && uit.indexOf(d) === -1) uit.push(d);
  });
  return uit.sort().slice(-BEWAAR);
}
export function dagErbij(lijst, datum) { return mengDagen(lijst, [datum]); }
export function dagenDezeMaand(lijst, datum) {
  var maand = datum.slice(0, 7);
  return mengDagen(lijst, []).filter(function (d) { return d.slice(0, 7) === maand; }).length;
}
export function dagNummer(datum) {
  var p = datum.split('-').map(Number);
  return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5);
}

// first a chapter with 1 or 2 stars, else one never played, else "all three stars". The search
// starts at a different game every day so the tile does not suggest the same thing all week;
// within a game the lowest school year wins, then the order of the list.
export function voorstelVoor(spellen, beste, leerjaar, dag) {
  var rijen = spellen.map(function (s) {
    return { s: s, lijst: s.hoofdstukken.map(function (h, i) { return { h: h, i: i }; })
      .filter(function (r) { return r.h.leerjaar <= leerjaar; })
      .sort(function (x, y) { return x.h.leerjaar - y.h.leerjaar || x.i - y.i; }) };
  }).filter(function (r) { return r.lijst.length; });
  if (!rijen.length) return { reden: 'alles' };
  var start = ((dag % rijen.length) + rijen.length) % rijen.length;
  var volgorde = rijen.slice(start).concat(rijen.slice(0, start));
  function zoek(past) {
    for (var a = 0; a < volgorde.length; a++) {
      for (var b = 0; b < volgorde[a].lijst.length; b++) {
        var r = volgorde[a].lijst[b], score = beste[volgorde[a].s.id + ':' + r.i];
        if (past(score)) return { spel: volgorde[a].s, index: r.i, beste: score };
      }
    }
    return null;
  }
  var v = zoek(function (score) { var n = sterrenVoor(score); return n === 1 || n === 2; });
  if (v) return { reden: 'verbeter', spel: v.spel, index: v.index, beste: v.beste };
  v = zoek(function (score) { return !score; });
  if (v) return { reden: 'nieuw', spel: v.spel, index: v.index };
  return { reden: 'alles' };
}
