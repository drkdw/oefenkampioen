import { keuzes, vulAan, vulRondom, positief } from '../gereedschap.js';

  // een rechthoek met de zijden erop, breedte boven, hoogte links
  function rechthoekTekening(breedte, hoogte) {
    var maxZijde = 120, schaal = maxZijde / Math.max(breedte, hoogte, 6);
    var b = breedte * schaal, h = hoogte * schaal, marge = 30;
    return '<svg viewBox="0 0 ' + (b + marge * 2) + ' ' + (h + marge * 2) + '" width="100%" style="max-width:220px" ' +
      'role="img" aria-label="Een rechthoek van ' + breedte + ' bij ' + hoogte + '">' +
      '<rect x="' + marge + '" y="' + marge + '" width="' + b + '" height="' + h +
      '" fill="var(--card-2)" stroke="var(--accent)" stroke-width="3" rx="4"/>' +
      '<text x="' + (marge + b / 2) + '" y="' + (marge - 10) + '" text-anchor="middle" font-family="Fredoka, sans-serif" ' +
      'font-size="16" fill="var(--ink)">' + breedte + '</text>' +
      '<text x="' + (marge - 12) + '" y="' + (marge + h / 2) + '" text-anchor="middle" dominant-baseline="central" ' +
      'font-family="Fredoka, sans-serif" font-size="16" fill="var(--ink)">' + hoogte + '</text>' +
      '</svg>';
  }

export default {
  id: 'meetkunde',
  ico: '📐',
  naam: 'Meetkunde',
  tekst: 'De omtrek van een vierkant en een rechthoek.',
  top: 'Jij telt elke zijde mee!',
  hoofdstukken: [
    { leerjaar: 3, ico: '📏', titel: 'Omtrek berekenen', tekst: 'Alle zijden van de figuur samen.',
      badge: 'gemiddeld', plan: { omtrek: 10 } }
  ],
  zaadjes: function () {
    var uit = [];
    for (var breedte = 2; breedte <= 12; breedte++) {
      for (var hoogte = breedte; hoogte <= 12; hoogte++) uit.push({ breedte: breedte, hoogte: hoogte });
    }
    return uit;
  },
  maak: function (soort, z) {
    var omtrek = 2 * (z.breedte + z.hoogte), vierkant = z.breedte === z.hoogte;
    var fout = [];
    // veelgemaakte fout: enkel twee zijden optellen, of oppervlakte in plaats van omtrek
    vulAan(fout, omtrek, [z.breedte + z.hoogte, z.breedte * z.hoogte, omtrek + 2, omtrek - 2], positief);
    vulRondom(fout, omtrek, 1, positief);
    return { soort: soort, sleutel: 'omtrek|' + z.breedte + 'x' + z.hoogte, breedte: z.breedte, hoogte: z.hoogte,
      vierkant: vierkant, ans: String(omtrek), options: keuzes(omtrek, fout.slice(0, 3)) };
  },
  teken: function (v) { return rechthoekTekening(v.breedte, v.hoogte); },
  scherm: function () { return null; },
  vraag: function (v, nr) {
    var kop = 'Vraag ' + nr + ': ';
    var vorm = v.vierkant ? 'het vierkant' : 'de rechthoek';
    return { titel: kop + 'wat is de omtrek van ' + vorm + '?', sub: 'Tel alle zijden samen.' };
  },
  uitleg: function (v) {
    return v.vierkant
      ? v.breedte + ' + ' + v.breedte + ' + ' + v.breedte + ' + ' + v.breedte + ' = ' + (v.breedte * 4) + '.'
      : v.breedte + ' + ' + v.hoogte + ' + ' + v.breedte + ' + ' + v.hoogte + ' = ' + (2 * (v.breedte + v.hoogte)) + '.';
  },
  kort: function (v) { return 'Omtrek van ' + v.breedte + ' × ' + v.hoogte; },
  test: function (check) {
    check(2 * (4 + 4) === 16, 'de omtrek van een vierkant van 4 is 16');
    check(rechthoekTekening(5, 3).indexOf('<svg') === 0, 'de rechthoek tekent');
    check(rechthoekTekening(5, 3).indexOf('NaN') === -1, 'de rechthoek tekent zonder NaN, ook bij ongelijke zijden');
  }
};
