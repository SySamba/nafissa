/**
 * Service worker Nafissa.
 * - Installation PWA
 * - Cache-first pour les assets statiques
 * - Network-first pour les navigations, avec repli offline
 */
const CACHE_NAME = 'nafissa-v2';
const ASSETS_TO_CACHE = ['/', '/index.html', '/manifest.webmanifest', '/offline.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Jamais de cache pour les appels API ni les requêtes externes.
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  // Navigations : réseau d'abord, repli cache puis page hors-ligne.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request)
            .then((cached) => cached || caches.match('/index.html'))
            .then((cached) => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  // Assets : cache d'abord, réseau en secours (et mise en cache).
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      });
    })
  );
});
