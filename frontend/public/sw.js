const CACHE_NAME = 'agri-v1';
const STATIC_ASSETS = [
    '/logo.png',
    '/sw.js'
];

// Install Event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate Event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch Event - network first, then cache
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Don't cache API calls or hot-reload scripts
    if (event.request.url.includes('/api/') || event.request.url.includes('hot-update')) {
        event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const clonedResponse = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, clonedResponse);
                });
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
