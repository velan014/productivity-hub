const CACHE_NAME = 'productivity-hub-shell-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
];

// Install Event: pre-cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        STATIC_ASSETS.map((asset) =>
          fetch(asset, { cache: 'no-cache' })
            .then((res) => {
              if (res.ok) {
                return cache.put(asset, res);
              }
            })
            .catch((err) => {
              console.warn('[SW] Pre-cache item skipped:', asset, err);
            })
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate Event: cleanup older caches and immediately claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: handle navigation and static assets offline
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CRITICAL SECURITY RULE: Do NOT intercept or cache private API calls
  if (url.pathname.startsWith('/api')) {
    return;
  }

  // Pass through non-GET requests immediately
  if (event.request.method !== 'GET') {
    return;
  }

  // Pass through WebSockets
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }

  // 1. SPA Navigation Requests (Opening or refreshing pages like /app/dashboard)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              // Cache under the specific route AND under /index.html and /
              cache.put(event.request, clone.clone());
              cache.put('/index.html', clone.clone());
              cache.put('/', clone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline navigation fallback: Try matching exact route, then /index.html, then /
          const cachedRoute = await caches.match(event.request);
          if (cachedRoute) return cachedRoute;

          const cachedIndex = await caches.match('/index.html');
          if (cachedIndex) return cachedIndex;

          const cachedRoot = await caches.match('/');
          if (cachedRoot) return cachedRoot;

          return new Response('Offline: Page not cached yet.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' },
          });
        })
    );
    return;
  }

  // 2. Static Assets (JS bundles, CSS, fonts, images, Vite chunks)
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache all valid assets (including opaque responses for cross-origin fonts/icons)
        if (
          networkResponse &&
          (networkResponse.ok || networkResponse.type === 'opaque')
        ) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Offline asset retrieval: Try exact match, then match ignoring search params, then pathname
        const cachedExact = await caches.match(event.request);
        if (cachedExact) return cachedExact;

        const cachedIgnoreSearch = await caches.match(event.request, { ignoreSearch: true });
        if (cachedIgnoreSearch) return cachedIgnoreSearch;

        const cachedPathname = await caches.match(url.pathname);
        if (cachedPathname) return cachedPathname;

        const cachedPathnameIgnore = await caches.match(url.pathname, { ignoreSearch: true });
        if (cachedPathnameIgnore) return cachedPathnameIgnore;

        return undefined;
      })
  );
});
