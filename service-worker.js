/* =========================================================
   BAR ESME — Service Worker
   Compatible Android 8 / Chrome 68+
   Syntaxe : uniquement .then() / .catch(), sans async/await
   ========================================================= */

var CACHE_NAME = 'bar-esme-v4';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.add('./index.html');
      })
      .then(function() {
        return self.skipWaiting();
      })
      .catch(function(err) {
        console.warn('[SW] install error:', err);
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(keys) {
        return Promise.all(
          keys.filter(function(k) { return k !== CACHE_NAME; })
              .map(function(k) { return caches.delete(k); })
        );
      })
      .then(function() {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.match(event.request)
          .then(function(cached) {
            if (cached) return cached;

            return fetch(event.request)
              .then(function(response) {
                if (response && response.status === 200 && response.type !== 'opaque') {
                  cache.put(event.request, response.clone());
                }
                return response;
              })
              .catch(function() {
                return cache.match('./index.html')
                  .then(function(fallback) {
                    if (fallback) return fallback;
                    return new Response(
                      '<h1 style="font-family:sans-serif;text-align:center;margin-top:40px">Bar ESME — Rechargement necessaire avec connexion</h1>',
                      { headers: { 'Content-Type': 'text/html' } }
                    );
                  });
              });
          });
      })
  );
});
