/* ═══════════════════════════════════════════════════════════════
   KhetBook Service Worker — Full Offline Support
   
   Caching Strategy:
   ┌──────────────────────┬──────────────────────────────────────┐
   │ App shell (HTML/JS)  │ Cache-first + background refresh     │
   │ Static assets (img)  │ Cache-first + background refresh     │
   │ API GET calls        │ Network-first, fallback to SW cache  │
   │ API mutations        │ Pass-through (IndexedDB handles them)│
   │ Google Fonts/GSI     │ Cache-first after first load         │
   └──────────────────────┴──────────────────────────────────────┘
   ═══════════════════════════════════════════════════════════════ */

const SHELL_CACHE = 'khetbook-shell-v3';
const API_CACHE = 'khetbook-api-v3';
const FONT_CACHE = 'khetbook-fonts-v3';
const ALL_CACHES = [SHELL_CACHE, API_CACHE, FONT_CACHE];

// App shell — pre-cached on install
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/logo.png',
];

// ── Install ────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(SHELL_CACHE)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

// ── Activate ───────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((k) => !ALL_CACHES.includes(k))
                    .map((k) => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

// ── Fetch ──────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Only intercept GET
    if (request.method !== 'GET') return;

    // Only intercept http(s)
    if (!request.url.startsWith('http')) return;

    // Skip Vite dev server hot-reload
    if (request.url.includes('hot-update') || request.url.includes('@vite') || request.url.includes('__vite')) return;

    const url = new URL(request.url);

    // ── Google Fonts & GSI SDK — cache after first load ───────
    if (
        url.hostname === 'fonts.googleapis.com' ||
        url.hostname === 'fonts.gstatic.com' ||
        url.hostname === 'accounts.google.com'
    ) {
        event.respondWith(cacheFirst(request, FONT_CACHE));
        return;
    }

    // ── API calls — network-first, serve stale on failure ────
    if (url.pathname.startsWith('/api/') || (url.hostname !== self.location.hostname && url.hostname !== 'fonts.googleapis.com' && url.hostname !== 'fonts.gstatic.com' && url.hostname !== 'accounts.google.com')) {
        // Only cache the local API
        if (url.hostname !== self.location.hostname) return;
        event.respondWith(networkFirst(request, API_CACHE));
        return;
    }

    // ── App shell & static assets — stale-while-revalidate ───
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
});

/* ── Strategies ─────────────────────────────────────────────── */

/** Cache-first: serve from cache, only go to network on miss */
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
    } catch {
        return new Response('', { status: 503 });
    }
}

/** Network-first: try network, fall back to cache */
async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    try {
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
    } catch {
        const cached = await cache.match(request);
        if (cached) return cached;
        // For navigate requests, return app shell
        if (request.mode === 'navigate') {
            const shell = await caches.match('/index.html', { cacheName: SHELL_CACHE });
            return shell || new Response('Offline', { status: 503 });
        }
        return new Response('Offline', { status: 503 });
    }
}

/** Stale-while-revalidate: serve cached immediately, update cache in background */
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    // Always fetch from network in background to update cache
    const networkPromise = fetch(request)
        .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
        })
        .catch(() => null);

    // Return cached version immediately if available, otherwise wait for network
    if (cached) {
        // Fire-and-forget background refresh
        networkPromise.catch(() => { });
        return cached;
    }

    const networkResponse = await networkPromise;
    if (networkResponse) return networkResponse;

    // Last resort: return index.html for navigate requests (HashRouter handles routing)
    if (request.mode === 'navigate') {
        const shell = await cache.match('/index.html');
        if (shell) return shell;
    }

    return new Response('Offline', { status: 503 });
}
