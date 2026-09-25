import { harnas } from './harnas.mjs';
import { beloningTests } from './beloning.test.mjs';
import { spiegelTests } from './spiegelen.test.mjs';

var fouten = 0;
function check(ok, wat) {
  if (ok) return;
  fouten++;
  if (fouten <= 40) console.log('FOUT ' + wat);
}
var vragen = harnas(check);
beloningTests(check);
spiegelTests(check);
console.log(vragen + ' vragen doorgerekend, ' + (fouten ? fouten + ' fouten' : 'geen fouten'));
process.exitCode = fouten ? 1 : 0;
