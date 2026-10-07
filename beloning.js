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

// own school year first: improve a played chapter without 3 stars, else something never played;
// only when that year has nothing left, the same search one year lower
// niveaus given: when every chapter up to the school year has 3 stars, a sticker that is not gold
// yet is the next goal, own school year first
export function voorstelVoor(spellen, beste, leerjaar, dag, niveaus) {
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
    var v = zoek(jaar, function (score) { return score && sterrenVoor(score) < 3; });
    if (v) return { reden: 'verbeter', spel: v.spel, index: v.index, beste: v.beste };
    v = zoek(jaar, function (score) { return !score; });
    if (v) return { reden: 'nieuw', spel: v.spel, index: v.index };
  }
  if (niveaus) {
    for (jaar = leerjaar; jaar >= 1; jaar--) {
      v = zoekMetSleutel(jaar);
      if (v) return { reden: 'goud', spel: v.spel, index: v.index, rand: v.rand };
    }
  }
  return { reden: 'alles' };
  function zoekMetSleutel(jaar) {
    for (var a = 0; a < volgorde.length; a++) {
      for (var b = 0; b < volgorde[a].lijst.length; b++) {
        var r = volgorde[a].lijst[b], k = volgorde[a].s.id + ':' + r.i, rand = randVoor(niveauVan(niveaus, beste, k));
        if (r.h.leerjaar === jaar && rand !== 'goud') return { spel: volgorde[a].s, index: r.i, rand: rand };
      }
    }
    return null;
  }
}

// for the parent overview: every played chapter without 3 stars, weakest first. The stored score
// is the best try, so a best under 70% means every try so far stayed under 2 stars
export function werkpunten(spellen, beste, gespeeld) {
  var uit = [];
  spellen.forEach(function (s) {
    s.hoofdstukken.forEach(function (h, i) {
      var k = s.id + ':' + i, b = beste[k];
      if (Number(b && b.van) > 0 && sterrenVoor(b) < 3) {
        uit.push({ spel: s, index: i, beste: b, deel: b.score / b.van, keer: (gespeeld && gespeeld[k]) || 0 });
      }
    });
  });
  return uit.sort(function (x, y) { return x.deel - y.deel; });
}

// how often each chapter was played as a full test, and (with the same merge) the longest test
// done with 3 stars. Merging keeps the higher number, so restoring the same file twice never
// counts a test twice; anything malformed is dropped
export function mengGespeeld(a, b) {
  var uit = {};
  [a, b].forEach(function (bron) {
    Object.keys(bron && typeof bron === 'object' ? bron : {}).forEach(function (k) {
      var n = Number(bron[k]);
      if (/^[a-z]+:\d+$/.test(k) && n > 0 && n % 1 === 0 && !(uit[k] >= n)) uit[k] = n;
    });
  });
  return uit;
}

// a sticker earned on a longer test looks better: 15 questions silver, 20 gold. The level is the
// longest test with 3 stars; a best score that is already 3 stars counts too, so 20 out of 20
// from before this existed is gold right away
export var GOUD = 20, ZILVER = 15;
export function niveauVan(niveaus, beste, k) {
  var b = beste && beste[k], uitBeste = sterrenVoor(b) === 3 ? Number(b.van) : 0;
  return Math.max(Number(niveaus && niveaus[k]) || 0, uitBeste);
}
export function randVoor(niveau) {
  return niveau >= GOUD ? 'goud' : niveau >= ZILVER ? 'zilver' : niveau > 0 ? 'gewoon' : '';
}

// for the reminder in the parent panel: how long ago the last backup file was made. After a
// month, or never, the line is meant to stand out
export var BEWAAR_HERINNERING = 30;
export function bewaardRegel(laatst, vandaag) {
  if (!DATUM.test(laatst || '')) return { tekst: 'Laatst bewaard: nog nooit', oud: true };
  var dagen = dagNummer(vandaag) - dagNummer(laatst);
  return {
    tekst: 'Laatst bewaard: ' + (dagen <= 0 ? 'vandaag' : dagen === 1 ? 'gisteren' : dagen + ' dagen geleden'),
    oud: dagen >= BEWAAR_HERINNERING
  };
}

// keep the better of two best scores per chapter, and only well-formed entries. At an equal ratio
// the longer test wins, the same rule as saving a score
export function mengBeste(hier, daar) {
  var uit = {};
  [hier, daar].forEach(function (bron) {
    Object.keys(bron && typeof bron === 'object' ? bron : {}).forEach(function (k) {
      var s = Number(bron[k] && bron[k].score), v = Number(bron[k] && bron[k].van), oud = uit[k];
      if (!/^[a-z]+:\d+$/.test(k) || !(v > 0) || !(s >= 0) || s > v || s % 1 || v % 1) return;
      if (!oud || s / v > oud.score / oud.van || (s / v === oud.score / oud.van && v > oud.van)) uit[k] = { score: s, van: v };
    });
  });
  return uit;
}
