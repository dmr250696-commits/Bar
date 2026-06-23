/* =========================================================
   BAR ESME — Service Worker (version simplifiée et robuste)
   Stratégie : cache d'abord, réseau en secours.
   L'installation ne met en cache qu'index.html (le minimum
   vital). Tout le reste est mis en cache à la volée lors
   de la première navigation avec connexion.
   ========================================================= */

const CACHE_NAME = 'bar-esme-v3';

/* ---------- Installation : on met en cache uniquement index.html ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.add('./index.html'))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[SW] Échec mise en cache index.html :', err);
        // On appelle quand même skipWaiting pour que le SW s'active
        return self.skipWaiting();
      })
  );
});

/* ---------- Activation : suppression des anciens caches ---------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ---------- Fetch : cache d'abord, réseau en secours ---------- */
self.addEventListener('fetch', (event) => {
  // On ne gère que les requêtes GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Chercher dans le cache
      const cached = await cache.match(event.request);
      if (cached) return cached;

      // 2. Pas en cache → aller sur le réseau
      try {
        const response = await fetch(event.request);
        // Mettre en cache si la réponse est valide
        if (response && response.status === 200 && response.type !== 'opaque') {
          cache.put(event.request, response.clone());
        }
        return response;
      } catch (err) {
        // Hors-ligne et pas en cache → fallback sur index.html
        const fallback = await cache.match('./index.html');
        if (fallback) return fallback;
        // En dernier recours : page d'erreur minimale
        return new Response(
          '<h1 style="font-family:sans-serif;text-align:center;margin-top:40px">Bar ESME — Rechargement nécessaire avec connexion</h1>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      }
    })
  );
});
