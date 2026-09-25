// Every name a module imports from another module of the app has to be exported there. The
// browser refuses the whole app over one missing export, and chassis.js cannot load in Node.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

var wortel = resolve(dirname(fileURLToPath(import.meta.url)), '..');
var bestanden = readdirSync(wortel).filter(function (f) { return f.endsWith('.js'); })
  .concat(readdirSync(join(wortel, 'spellen')).map(function (f) { return 'spellen/' + f; }));

function exportsVan(pad) {
  var t = readFileSync(pad, 'utf8'), uit = new Set();
  t.replace(/export\s+(?:function|var|let|const)\s+([\w$]+)/g, function (m, n) { uit.add(n); });
  t.replace(/export\s*\{([^}]*)\}/g, function (m, lijst) {
    lijst.split(',').forEach(function (d) { var n = d.trim().split(/\s+as\s+/).pop(); if (n) uit.add(n); });
  });
  return uit;
}

export function koppelingTests(check) {
  bestanden.forEach(function (f) {
    var pad = join(wortel, f), t = readFileSync(pad, 'utf8');
    t.replace(/import\s*\{([^}]*)\}\s*from\s*'(\.[^']+)'/g, function (m, lijst, bron) {
      var doel = resolve(dirname(pad), bron), er = exportsVan(doel);
      lijst.split(',').forEach(function (d) {
        var n = d.trim().split(/\s+as\s+/)[0];
        if (n) check(er.has(n), f + ' importeert ' + n + ' uit ' + bron + ', maar dat bestaat daar niet');
      });
    });
  });
}
