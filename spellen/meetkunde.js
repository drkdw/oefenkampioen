import { keuzes, vulAan, vulRondom, positief, andere } from '../gereedschap.js';

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

  // een hoek als twee stralen vanuit een punt; de ene straal ligt altijd horizontaal
  // drie getallen op een rij, voor lengte, breedte en hoogte van een blok
  function blokTekening(l, b, h) {
    return '<div style="display:flex;gap:10px;justify-content:center;align-items:center;font-family:Fredoka,sans-serif">' +
      [l, b, h].map(function (n, i) {
        return (i ? '<span style="font-size:22px;color:var(--ink-soft)">×</span>' : '') +
          '<div style="width:64px;height:64px;border-radius:16px;background:var(--card-2);' +
          'display:flex;align-items:center;justify-content:center;font-size:26px;color:var(--ink)">' + n + '</div>';
      }).join('') + '</div>';
  }
  // een rechthoekige driehoek: de basis onderaan, de hoogte als stippellijn opzij
  function driehoekTekening(basis, hoogte) {
    var schaal = 100 / Math.max(basis, hoogte, 6), b = basis * schaal, h = hoogte * schaal, marge = 26;
    return '<svg viewBox="0 0 ' + (b + marge * 2) + ' ' + (h + marge * 2) + '" width="100%" style="max-width:200px" ' +
      'role="img" aria-label="Een driehoek met basis ' + basis + ' en hoogte ' + hoogte + '">' +
      '<polygon points="' + marge + ',' + (marge + h) + ' ' + (marge + b) + ',' + (marge + h) + ' ' + marge + ',' + marge +
      '" fill="var(--card-2)" stroke="var(--accent)" stroke-width="3"/>' +
      '<line x1="' + marge + '" y1="' + marge + '" x2="' + marge + '" y2="' + (marge + h) +
      '" stroke="var(--ink-soft)" stroke-width="2" stroke-dasharray="4 4"/>' +
      '<text x="' + (marge + b / 2) + '" y="' + (marge + h + 18) + '" text-anchor="middle" font-family="Fredoka, sans-serif" ' +
      'font-size="15" fill="var(--ink)">' + basis + '</text>' +
      '<text x="' + (marge - 12) + '" y="' + (marge + h / 2) + '" text-anchor="middle" dominant-baseline="central" ' +
      'font-family="Fredoka, sans-serif" font-size="15" fill="var(--ink)">' + hoogte + '</text></svg>';
  }

  var HOEKSOORT = ['scherp', 'recht', 'stomp', 'gestrekt'];
  function classificeer(graden) {
    if (graden === 90) return 'recht';
    if (graden === 180) return 'gestrekt';
    return graden < 90 ? 'scherp' : 'stomp';
  }
  function hoekTekening(graden) {
    var cx = 20, cy = 100, lengte = 85, rad = graden * Math.PI / 180;
    var x2 = cx + lengte * Math.cos(rad), y2 = cy - lengte * Math.sin(rad);
    return '<svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Een hoek van ' + graden + ' graden">' +
      '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + lengte) + '" y2="' + cy +
      '" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/>' +
      '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) +
      '" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="var(--ink)"/></svg>';
  }

export default {
  id: 'meetkunde',
  ico: '📐',
  naam: 'Meetkunde',
  tekst: 'De omtrek en oppervlakte van een rechthoek, en hoeken herkennen.',
  top: 'Jij telt elke zijde mee!',
  hoofdstukken: [
    { leerjaar: 3, ico: '📏', titel: 'Omtrek berekenen', tekst: 'Alle zijden van de figuur samen.',
      badge: 'gemiddeld', plan: { omtrek: 10 } },
    { leerjaar: 4, ico: '🟦', titel: 'Oppervlakte berekenen', tekst: 'Breedte keer hoogte, in vakjes.',
      badge: 'gemiddeld', plan: { oppervlakte: 10 } },
    { leerjaar: 4, ico: '📐', titel: 'Hoeken herkennen', tekst: 'Scherp, recht, stomp of gestrekt?',
      badge: 'gemiddeld', plan: { hoek: 10 } },
    { leerjaar: 5, ico: '📦', titel: 'Volume van een blok', tekst: 'Lengte keer breedte keer hoogte.',
      badge: 'moeilijk', plan: { volume: 10 } },
    { leerjaar: 5, ico: '🔺', titel: 'Oppervlakte van een driehoek', tekst: 'Basis keer hoogte, gedeeld door twee.',
      badge: 'moeilijk', plan: { driehoek: 10 } }
  ],
  zaadjes: function (soort) {
    if (soort === 'hoek') {
      var uit2 = [];
      for (var graden = 10; graden <= 180; graden += 10) uit2.push({ graden: graden });
      return uit2;
    }
    if (soort === 'volume') {
      var uit3 = [];
      for (var ll = 2; ll <= 8; ll++) {
        for (var bb = ll; bb <= 8; bb++) {
          for (var hh = bb; hh <= 8; hh++) uit3.push({ l: ll, b: bb, h: hh });
        }
      }
      return uit3;
    }
    if (soort === 'driehoek') {
      var uit4 = [];
      for (var basis2 = 2; basis2 <= 14; basis2++) {
        for (var hoogte2 = 2; hoogte2 <= 14; hoogte2++) {
          if ((basis2 * hoogte2) % 2 === 0) uit4.push({ basis: basis2, hoogte: hoogte2 });
        }
      }
      return uit4;
    }
    var uit = [];
    for (var breedte = 2; breedte <= 12; breedte++) {
      for (var hoogte = breedte; hoogte <= 12; hoogte++) uit.push({ breedte: breedte, hoogte: hoogte });
    }
    return uit;
  },
  maak: function (soort, z) {
    if (soort === 'hoek') {
      var ans2 = classificeer(z.graden);
      return { soort: soort, sleutel: 'hoek|' + z.graden, graden: z.graden, ans: ans2,
        options: keuzes(ans2, andere(HOEKSOORT, ans2, 3)) };
    }
    if (soort === 'volume') {
      var vol = z.l * z.b * z.h, foutV = [];
      // veelgemaakte fout: enkel twee zijden, of ze optellen in plaats van vermenigvuldigen
      vulAan(foutV, vol, [z.l * z.b, z.b * z.h, z.l + z.b + z.h, vol + z.l], positief);
      vulRondom(foutV, vol, 1, positief);
      return { soort: soort, sleutel: 'volume|' + z.l + ':' + z.b + ':' + z.h, l: z.l, b: z.b, h: z.h,
        ans: String(vol), options: keuzes(vol, foutV.slice(0, 3)) };
    }
    if (soort === 'driehoek') {
      var oppD = z.basis * z.hoogte / 2, foutD = [];
      // veelgemaakte fout: vergeten te delen door twee, zoals bij een rechthoek. Enkel gehele
      // getallen als afleider: basis / 2 geeft bij een oneven basis een kommagetal met een punt
      vulAan(foutD, oppD, [z.basis * z.hoogte, oppD + 1, oppD - 1, z.basis + z.hoogte], positief);
      vulRondom(foutD, oppD, 1, positief);
      return { soort: soort, sleutel: 'driehoek|' + z.basis + ':' + z.hoogte, basis: z.basis, hoogte: z.hoogte,
        ans: String(oppD), options: keuzes(oppD, foutD.slice(0, 3)) };
    }
    var vierkant = z.breedte === z.hoogte;
    if (soort === 'oppervlakte') {
      var opp = z.breedte * z.hoogte, fout2 = [];
      // veelgemaakte fout: de omtrek nemen, of maar een keer de breedte
      vulAan(fout2, opp, [2 * (z.breedte + z.hoogte), z.breedte, z.hoogte, opp + z.breedte], positief);
      vulRondom(fout2, opp, 1, positief);
      return { soort: soort, sleutel: 'oppervlakte|' + z.breedte + 'x' + z.hoogte, breedte: z.breedte, hoogte: z.hoogte,
        vierkant: vierkant, ans: String(opp), options: keuzes(opp, fout2.slice(0, 3)) };
    }
    var omtrek = 2 * (z.breedte + z.hoogte);
    var fout = [];
    // veelgemaakte fout: enkel twee zijden optellen, of oppervlakte in plaats van omtrek
    vulAan(fout, omtrek, [z.breedte + z.hoogte, z.breedte * z.hoogte, omtrek + 2, omtrek - 2], positief);
    vulRondom(fout, omtrek, 1, positief);
    return { soort: soort, sleutel: 'omtrek|' + z.breedte + 'x' + z.hoogte, breedte: z.breedte, hoogte: z.hoogte,
      vierkant: vierkant, ans: String(omtrek), options: keuzes(omtrek, fout.slice(0, 3)) };
  },
  teken: function (v) {
    if (v.soort === 'hoek') return hoekTekening(v.graden);
    if (v.soort === 'volume') return blokTekening(v.l, v.b, v.h);
    if (v.soort === 'driehoek') return driehoekTekening(v.basis, v.hoogte);
    return rechthoekTekening(v.breedte, v.hoogte);
  },
  scherm: function () { return null; },
  vraag: function (v, nr) {
    var kop = 'Vraag ' + nr + ': ';
    if (v.soort === 'hoek') return { titel: kop + 'wat voor hoek is dit?', sub: 'Scherp, recht, stomp of gestrekt?' };
    var vorm = v.vierkant ? 'het vierkant' : 'de rechthoek';
    if (v.soort === 'oppervlakte') return { titel: kop + 'wat is de oppervlakte van ' + vorm + '?', sub: 'Breedte keer hoogte.' };
    if (v.soort === 'volume') return { titel: kop + 'wat is het volume van dit blok?', sub: 'Lengte keer breedte keer hoogte.' };
    if (v.soort === 'driehoek') return { titel: kop + 'wat is de oppervlakte van de driehoek?', sub: 'Basis keer hoogte, gedeeld door twee.' };
    return { titel: kop + 'wat is de omtrek van ' + vorm + '?', sub: 'Tel alle zijden samen.' };
  },
  uitleg: function (v) {
    if (v.soort === 'hoek') {
      return v.ans === 'recht' ? 'Een rechte hoek is precies 90 graden.'
        : v.ans === 'gestrekt' ? 'Een gestrekte hoek is een rechte lijn: 180 graden.'
        : v.ans === 'scherp' ? 'Een scherpe hoek is kleiner dan 90 graden.'
        : 'Een stompe hoek is groter dan 90 graden, maar minder dan 180.';
    }
    if (v.soort === 'oppervlakte') return v.breedte + ' × ' + v.hoogte + ' = ' + (v.breedte * v.hoogte) + '.';
    if (v.soort === 'volume') return v.l + ' × ' + v.b + ' × ' + v.h + ' = ' + (v.l * v.b * v.h) + '.';
    if (v.soort === 'driehoek') return v.basis + ' × ' + v.hoogte + ' : 2 = ' + v.ans + '.';
    return v.vierkant
      ? v.breedte + ' + ' + v.breedte + ' + ' + v.breedte + ' + ' + v.breedte + ' = ' + (v.breedte * 4) + '.'
      : v.breedte + ' + ' + v.hoogte + ' + ' + v.breedte + ' + ' + v.hoogte + ' = ' + (2 * (v.breedte + v.hoogte)) + '.';
  },
  kort: function (v) {
    if (v.soort === 'hoek') return 'Een hoek van ' + v.graden + ' graden';
    if (v.soort === 'oppervlakte') return 'Oppervlakte van ' + v.breedte + ' × ' + v.hoogte;
    if (v.soort === 'volume') return 'Volume van ' + v.l + ' × ' + v.b + ' × ' + v.h;
    if (v.soort === 'driehoek') return 'Driehoek ' + v.basis + ' × ' + v.hoogte;
    return 'Omtrek van ' + v.breedte + ' × ' + v.hoogte;
  },
  test: function (check) {
    check(2 * (4 + 4) === 16, 'de omtrek van een vierkant van 4 is 16');
    check(rechthoekTekening(5, 3).indexOf('<svg') === 0, 'de rechthoek tekent');
    check(rechthoekTekening(5, 3).indexOf('NaN') === -1, 'de rechthoek tekent zonder NaN, ook bij ongelijke zijden');
    check(classificeer(45) === 'scherp' && classificeer(90) === 'recht' &&
      classificeer(120) === 'stomp' && classificeer(180) === 'gestrekt', 'de vier hoeksoorten kloppen');
    check(hoekTekening(90).indexOf('NaN') === -1, 'de hoek tekent zonder NaN');
  }
};
