import { harnas } from './harnas.mjs';
import { beloningTests } from './beloning.test.mjs';
import { koppelingTests } from './koppelingen.test.mjs';
// every game recomputed independently, from what the child sees
import { klokTests } from './klok.test.mjs';
import { maalTests } from './maaltafels.test.mjs';
import { winkelTests } from './winkel.test.mjs';
import { matenTests } from './maten.test.mjs';
import { kalenderTests } from './kalender.test.mjs';
import { brugTests } from './rekenen.test.mjs';
import { spiegelTests } from './spiegelen.test.mjs';
import { breukenTests } from './breuken.test.mjs';
import { meetkundeTests } from './meetkunde.test.mjs';
import { verhoudingenTests } from './verhoudingen.test.mjs';

var fouten = 0;
function check(ok, wat) {
  if (ok) return;
  fouten++;
  if (fouten <= 40) console.log('FOUT ' + wat);
}
var vragen = harnas(check);
beloningTests(check);
koppelingTests(check);
var nagerekend = [klokTests, maalTests, winkelTests, matenTests, kalenderTests, brugTests, spiegelTests,
  breukenTests, meetkundeTests, verhoudingenTests].reduce(function (n, t) { return n + t(check); }, 0);
console.log(vragen + ' vragen doorgerekend, ' + nagerekend + ' nagerekend vanuit de tekening, ' +
  (fouten ? fouten + ' fouten' : 'geen fouten'));
process.exitCode = fouten ? 1 : 0;
