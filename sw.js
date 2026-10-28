// Network first, cache as fallback: online always gets the newest version (no stale mix of old
// and new modules after a deploy), offline still plays everything that was opened once before.
var CACHE = 'oefenkampioen';

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(function (antwoord) {
    // opaque answers (the Google font files) are cached too, so the letters also work offline
    if (antwoord.ok || antwoord.type === 'opaque') {
      var kopie = antwoord.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, kopie); });
    }
    return antwoord;
  }).catch(function () {
    return caches.match(e.request, { ignoreSearch: true });
  }));
});
