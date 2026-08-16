const CACHE_NAME = 'littiwale-client-pwa-v1.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/orders.html',
  '/track.html',
  '/checkout.html',
  '/menu/index.html',
  '/css/style.css',
  '/css/restaurant-status.css',
  '/css/receipt-printer.css',
  '/js/main.js',
  '/js/restaurant-timing.js',
  '/js/receipt-printer.js',
  '/images/logo.png',
  '/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Frontend SW] Cache warning:', err);
      });
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First with Cache Fallback for dynamic live catalog
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Don't cache dynamic API requests
  if (event.request.method !== 'GET' || requestUrl.pathname.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});
