// Service Worker for Map Tile Caching
const CACHE_NAME = 'fibertrace-map-v1';
const TILE_CACHE = 'fibertrace-tiles-v1';
const RUNTIME_CACHE = 'fibertrace-runtime';

// Install event - set up caches
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache opened');
      return cache.addAll([
        '/',
        '/index.html',
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== CACHE_NAME && name !== TILE_CACHE && name !== RUNTIME_CACHE;
          })
          .map((name) => {
            console.log('Deleting cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle tile requests specially
  if (url.pathname.includes('cartocdn') || url.pathname.includes('tile')) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          console.log('Serving tile from cache:', url.pathname);
          return response;
        }

        return fetch(request).then((response) => {
          // Clone the response
          const responseClone = response.clone();

          // Cache tile responses
          if (request.method === 'GET' && response.status === 200) {
            caches.open(TILE_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return response;
        }).catch(() => {
          // Offline fallback
          console.log('Tile fetch failed, offline:', url.pathname);
          return caches.match(request);
        });
      })
    );
  } else {
    // For non-tile requests, use network-first strategy
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
  }
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_TILE_CACHE') {
    caches.delete(TILE_CACHE).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }

  if (event.data && event.data.type === 'CACHE_TILES') {
    const { tiles } = event.data;
    caches.open(TILE_CACHE).then((cache) => {
      Promise.all(tiles.map(url => cache.add(url))).then(() => {
        event.ports[0].postMessage({ success: true, count: tiles.length });
      }).catch(err => {
        event.ports[0].postMessage({ success: false, error: err.message });
      });
    });
  }
});
