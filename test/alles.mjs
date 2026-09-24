import { harnas } from './harnas.mjs';

var fouten = 0;
function check(ok, wat) {
  if (ok) return;
  fouten++;
  if (fouten <= 40) console.log('FOUT ' + wat);
}
var vragen = harnas(check);
console.log(vragen + ' vragen doorgerekend, ' + (fouten ? fouten + ' fouten' : 'geen fouten'));
process.exitCode = fouten ? 1 : 0;
