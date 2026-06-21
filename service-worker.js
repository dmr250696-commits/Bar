/* =========================================================
   BAR ESME — Service Worker
   Met en cache l'application entière au premier chargement
   pour permettre un fonctionnement 100% hors-ligne ensuite.
   ========================================================= */

const CACHE_NAME = 'bar-esme-v1';

// Fichiers de l'application elle-même (toujours disponibles, sur le même domaine)
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png'
];

// Ressources externes nécessaires au fonctionnement (polices + génération PDF)
// Mises en cache séparément : si l'une échoue (pas de réseau au tout premier
// lancement), l'app continue quand même à s'installer.
const EXTERNAL_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap'
];

/* ---------- Installation : mise en cache initiale ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // App shell : critique, doit réussir
      await cache.addAll(APP_SHELL);

      // Ressources externes : best-effort, ne bloque pas l'installation
      await Promise.all(
        EXTERNAL_ASSETS.map((url) =>
          fetch(url, { mode: 'cors' })
            .then((res) => { if (res.ok) cache.put(url, res); })
            .catch(() => { /* pas grave si hors-ligne au premier lancement */ })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

/* ---------- Activation : nettoyage des anciens caches ---------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* ---------- Fetch : cache d'abord, réseau en secours ---------- */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore les requêtes non-GET (ex: si un jour il y a des POST)
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // Met en cache toute nouvelle ressource récupérée avec succès
          // (utile si l'app évolue ou si une police n'avait pas pu être
          // mise en cache à l'installation).
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Hors-ligne et rien en cache : pour une navigation HTML,
          // on retombe sur la page principale plutôt qu'une erreur.
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
