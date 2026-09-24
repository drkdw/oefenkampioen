// builds every question of every chapter of every game, and checks what the browser
// self-check cannot see: wrong answers, bad notation, and the findings of the September audit
import { SPELLEN } from '../spellen/index.js';

export function harnas(check) {
  var A = [];
  for (const spel of SPELLEN) {
    spel.hoofdstukken.forEach((h, hi) => {
      for (const soort of Object.keys(h.plan)) {
        const zaad = spel.zaadjes(soort, h);
        check(zaad.length > 0, `${spel.id}/${hi}/${soort}: geen zaadjes`);
        const jassen = (spel.jasjes && spel.jasjes(soort, h)) || ['standaard'];
        for (const z of zaad) for (const j of jassen) {
          const v = spel.maak(soort, z, h, j);
          const vr = spel.vraag(v, 1);
          const tekst = [vr.titel, vr.sub || '', spel.uitleg(v), spel.kort(v), String(v.ans),
            String(spel.scherm ? spel.scherm(v) : '')];
          if (v.options) {
            const t = v.options.map(o => o.text), ok = v.options.filter(o => o.ok);
            check(new Set(t).size === 4, `${spel.id}/${hi}/${soort} geen 4 verschillende: ${t}`);
            check(ok.length === 1, `${spel.id}/${hi}/${soort} ${ok.length} juist: ${t}`);
            if (ok.length === 1) check(String(v.ans) === ok[0].text, `${spel.id}/${hi}/${soort} ans ${v.ans} is niet de juiste keuze`);
            tekst.push(...t);
          }
          if (v.typen) v.typen.velden.forEach((f, i) => check(f.ant >= 0 && f.ant < Math.pow(10, f.max || 2),
            `${spel.id}/${hi}/${soort} veld ${i}: ${f.ant} past niet in ${f.max || 2} cijfers`));
          const alles = tekst.join(' | ');
          check(!/undefined|NaN|Infinity/.test(alles), `${spel.id}/${hi}/${soort} undefined of NaN: ${alles}`);
          check(!/\d\.\d/.test(alles), `${spel.id}/${hi}/${soort} punt als komma: ${alles}`);
          check(!/\d-\d|(^|[\s(|])-\d/.test(alles), `${spel.id}/${hi}/${soort} streepje als minteken: ${alles}`);
          A.push({ spel: spel.id, hi, soort, h, z, v, alles, svg: String(spel.teken(v) || '') });
        }
      }
    });
    if (spel.test) spel.test((c, m) => check(c, `${spel.id} test: ${m}`));
  }
  audit(A, check);
  return A.length;
}

// one check per finding of the audit of 24 September, so none of them can come back unnoticed
function audit(A, check) {
  const van = (spel, soort) => A.filter(x => x.spel === spel && x.soort === soort);
  const vlot10 = van('brug', 'vlot').filter(x => x.h.tot === 10);
  check(vlot10.every(x => x.v.uit <= 10), 'tot 10 blijft tot 10');
  check(vlot10.some(x => x.v.uit === 10 && x.v.plus), 'tot 10 bevat sommen die 10 uitkomen');
  check(van('brug', 'cijferPlus').every(x => x.v.a + x.v.b <= 9999), 'cijferend optellen onder 10 000');
  const brug100 = A.filter(x => x.spel === 'brug' && x.soort === 'som' && x.v.b % 10 === 0);
  check(brug100.length > 0 && brug100.every(x => /naar \d*00 /.test(x.alles)), 'hele tientallen springen via het honderdtal');
  check(van('brug', 'temp').every(x => x.v.ans.startsWith('−')), 'temperatuur onder nul met echt minteken');
  check(van('brug', 'macht').every(x => x.v.exp === 1 || x.alles.includes(Array(x.v.exp).fill('10').join(' × '))), 'machten: uitleg klopt');
  check(van('brug', 'vlot').every(x => {
    const labels = [...x.svg.matchAll(/>(\d+)</g)].map(m => Number(m[1]));
    return !labels.includes(x.v.uit) || [0, 10, 19, x.v.a].includes(x.v.uit);
  }), 'getallenlijn tot 10/20 zet het antwoord er niet bij');
  check(new Set(van('verhoudingen', 'gemiddelde').map(x => x.v.ans)).size >= 5, 'gemiddelde varieert');
  const waarde = t => { const [a, b] = t.split('/').map(Number); return a / b; };
  const breuk = A.filter(x => x.spel === 'breuken' && ['breukPlus', 'breukMin', 'breukPlusOngelijk'].includes(x.soort));
  const rang = [0, 0, 0, 0];
  for (const x of breuk) rang[x.v.options.map(o => waarde(o.text)).filter(w => w > waarde(x.v.ans)).length]++;
  check(rang.filter(n => n > breuk.length * 0.1).length >= 3, 'breuken: plaats van het antwoord varieert ' + rang.join('/'));
  check(A.filter(x => x.spel === 'breuken' && x.v.options && /\//.test(x.v.ans)).every(x =>
    x.v.options.filter(o => !o.ok && /\//.test(o.text)).every(o => Math.abs(waarde(o.text) - waarde(x.v.ans)) > 1e-9)),
  'breuken: geen afleider met dezelfde waarde als het antwoord');
  check(A.filter(x => x.spel === 'meetkunde' && (x.soort === 'hoek' || x.soort === 'graden')).every(x => {
    const [vx, , vw] = x.svg.match(/viewBox="([-\d. ]+)"/)[1].split(' ').map(Number);
    return [...x.svg.matchAll(/(?:x2|cx)="(-?[\d.]+)"/g)].every(m => Number(m[1]) >= vx && Number(m[1]) <= vx + vw);
  }), 'hoeken: alle punten binnen de tekening');
  check(van('meetkunde', 'herkennen').every(x => !(x.v.options.some(o => o.text === 'kubus') && x.v.options.some(o => o.text === 'balk'))),
    'kubus en balk nooit samen als keuze');
  check(!A.some(x => /\b1 (vlakken|ribben|hoekpunten)\b/.test(x.alles)), 'geen "1 vlakken"');
  const LEN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  check(van('kalender', 'typ').every(x => x.v.nieuw <= LEN[x.v.m]), 'kalender: nooit een datum die niet bestaat');
  check(van('kalender', 'seizoen').every(x => ![2, 5, 8, 11].includes(x.v.m) &&
    !x.v.options.some(o => ['maart', 'juni', 'september', 'december'].includes(o.text))), 'kalender: geen overgangsmaanden');
  check(van('kalender', 'lengte').filter(x => x.v.m === 1 && x.v.vorm === 'hoeveel').every(x => x.alles.includes('gewoon jaar')),
    'kalender: februari zegt welk jaar');
  check(!A.some(x => /\b\d+de (dag|maand)|\b[02-9] week\b|\b1 dagen\b/.test(x.alles)), 'geen "1de", "8de" of "2 week"');
  const maat = Object.fromEntries(van('maten', 'past').map(x => [x.v.ding.naam, x.v.ding.maat]));
  check(A.filter(x => x.spel === 'maten' && (x.soort === 'om' || x.soort === 'typ')).every(x => {
    const g = x.h.leerjaar <= 2 ? 100 : x.h.leerjaar === 3 ? 10000 : 100000; return x.v.n <= g && x.v.uit <= g;
  }), 'maten: getallen binnen het bereik van het leerjaar');
  check(!van('maten', 'past').some(x => / dm$/.test(x.v.ans)), 'maten: geen dm bij welke maat past');
  check(!A.some(x => /meer erin|minder erin|weegt of meet/.test(x.alles)), 'maten: geen "meer erin"');
  check(van('maten', 'vergelijk').every(x => x.v.options.every(o => {
    const d = maat[o.text], b = x.v.basis.maat;
    return d !== undefined && (o.ok ? (x.v.richting === 0 ? d >= 3 * b : 3 * d <= b) : (x.v.richting === 0 ? 3 * d <= b : d >= 3 * b));
  })), 'maten: vergelijken, elke keuze duidelijk anders');
  const onder = A.filter(x => x.spel === 'spiegel' && x.h.as === 'horizontaal');
  check(onder.length > 0 && onder.every(x => x.v.vorm.every(c => c[0] < 3)), 'spiegelen naar onder: vorm in de bovenste helft');
  check(van('spiegel', 'vorm').filter(x => ['vierkant', 'rechthoek'].includes(x.v.ans)).every(x =>
    !(x.v.options.some(o => o.text === 'vierkant') && x.v.options.some(o => o.text === 'rechthoek'))), 'vierkant en rechthoek nooit samen');
}
