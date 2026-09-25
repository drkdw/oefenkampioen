// Rewards, all derived from the best scores that are already stored: stars, stickers, a daily
// suggestion, and a count of days practised. No DOM and no storage here, so it is testable alone.

// one sticker per chapter, in chapter order; a new chapter needs a new sticker at the end of its
// game, the self-check fails otherwise
export var STICKERS = {
  klok: ['🦢', '🐨', '🦉', '🐢', '🐇', '🦔', '🐿️', '🦌', '🐝'],
  maal: ['🐸', '🐙', '🦖', '🐉', '🦄', '🐲', '🦕', '🐊', '🦈', '🐳'],
  winkel: ['🍎', '🍌', '🍓', '🍇', '🍉', '🍒', '🍍', '🥝', '🍑', '🍋', '🥕'],
  maten: ['🐘', '🦒', '🦓', '🦏', '🐪', '🦘', '🐃', '🐄', '🐖', '🐑', '🐐'],
  kalender: ['🌼', '🌻', '🍂', '⛄', '🌈', '❄️', '☀️'],
  brug: ['🚂', '🚀', '🚁', '⛵', '🐼', '🚲', '🛴', '🚕', '🚌', '🚜', '🚒', '🚑', '🚓', '🛸', '🎈', '🪁',
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

// scores are stored per chapter number. Layout 2 moved Sprongen tellen from the tables (maal:0)
// to Bruggen bouwen, right after Tellen en rangtelwoorden (brug:4), so both lists shift.
// ponytail: one step per layout change; a layout 3 adds its own step after this one
export var INDELING = 2;
export function naarIndeling2(beste) {
  var uit = {};
  Object.keys(beste && typeof beste === 'object' ? beste : {}).forEach(function (k) {
    var m = /^([a-z]+):(\d+)$/.exec(k), nieuw = k;
    if (m && m[1] === 'maal') nieuw = m[2] === '0' ? 'brug:4' : 'maal:' + (Number(m[2]) - 1);
    if (m && m[1] === 'brug' && Number(m[2]) >= 4) nieuw = 'brug:' + (Number(m[2]) + 1);
    uit[nieuw] = beste[k];
  });
  return uit;
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
// the chapters a child sees: its own school year first, then the earlier years as revision,
// from the most recent one down; within a year the order of the list
export function opVolgorde(spel, leerjaar) {
  return spel.hoofdstukken.map(function (h, i) { return { h: h, i: i }; })
    .filter(function (r) { return r.h.leerjaar <= leerjaar; })
    .sort(function (x, y) { return y.h.leerjaar - x.h.leerjaar || x.i - y.i; });
}

// own school year first: improve a chapter with 1 or 2 stars, else something never played;
// only when that year has nothing left, the same search one year lower
export function voorstelVoor(spellen, beste, leerjaar, dag) {
  var rijen = spellen.map(function (s) { return { s: s, lijst: opVolgorde(s, leerjaar) }; })
    .filter(function (r) { return r.lijst.length; });
  if (!rijen.length) return { reden: 'alles' };
  var start = ((dag % rijen.length) + rijen.length) % rijen.length;
  var volgorde = rijen.slice(start).concat(rijen.slice(0, start));
  function zoek(jaar, past) {
    for (var a = 0; a < volgorde.length; a++) {
      for (var b = 0; b < volgorde[a].lijst.length; b++) {
        var r = volgorde[a].lijst[b], score = beste[volgorde[a].s.id + ':' + r.i];
        if (r.h.leerjaar === jaar && past(score)) return { spel: volgorde[a].s, index: r.i, beste: score };
      }
    }
    return null;
  }
  for (var jaar = leerjaar; jaar >= 1; jaar--) {
    var v = zoek(jaar, function (score) { var n = sterrenVoor(score); return n === 1 || n === 2; });
    if (v) return { reden: 'verbeter', spel: v.spel, index: v.index, beste: v.beste };
    v = zoek(jaar, function (score) { return !score; });
    if (v) return { reden: 'nieuw', spel: v.spel, index: v.index };
  }
  return { reden: 'alles' };
}
