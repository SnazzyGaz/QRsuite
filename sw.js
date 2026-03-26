// QR Suite — Service Worker
const CACHE = 'qrsuite-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  clients.claim();
});

self.addEventListener('fetch', e => {
  // Cache-first for navigation and same-origin assets
  if (e.request.mode === 'navigate' || e.request.url.startsWith(self.location.origin)) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const networkFetch = fetch(e.request).then(res => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(cache => cache.put(e.request, clone));
          }
          return res;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    );
  }
});
