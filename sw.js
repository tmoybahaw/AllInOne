const CACHE_NAME = 'maruya-player-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // You will need to add the paths to your icon files here
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});