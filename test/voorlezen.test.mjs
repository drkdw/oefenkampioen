import { voorleestekst } from '../gereedschap.js';

export function voorleesTests(check) {
  var t = [
    ['Vraag 3: hoeveel kosten ze samen?', '', ['€ 1', '€ 2,50'], 'hoeveel kosten ze samen? Kies uit: 1 euro of 2,50 euro.'],
    ['het is 0 °C, en het koelt 4 graden af.', 'Wat is de nieuwe temperatuur?', ['−4', '4'], 'het is 0 graden, en het koelt 4 graden af. Wat is de nieuwe temperatuur? Kies uit: min 4 of 4.'],
    ['welk deel?', '', ['1/2', '3/4', '3/2', '2/7', '1/11'], 'welk deel? Kies uit: een half, 3 vierde, 3 halve, 2 zevende of 1 gedeeld door 11.'],
    ['wat is het dubbele van 1?', '1 + 1 = ?', null, 'wat is het dubbele van 1? 1 plus 1 is hoeveel'],
    ['hoeveel is 10% van 10?', '6 × 7 en 8 x 2', [], 'hoeveel is 10 procent van 10? 6 maal 7 en 8 maal 2'],
    ['Monster 2: hoeveel is 9 keer 7?', '', null, 'hoeveel is 9 keer 7?'],
    ['vijf-tot-vijf', '', ['kwart over 3'], 'vijf-tot-vijf Kies uit: kwart over 3.']
  ];
  t.forEach(function (r) {
    var uit = voorleestekst(r[0], r[1], r[2]);
    check(uit === r[3], 'voorlezen: ' + JSON.stringify(uit));
  });
}
