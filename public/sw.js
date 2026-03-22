const CACHE_NAME = 'bobo-cache-v1';
const ASSETS = [
    '/',
    '/bakers-os',
    '/manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    // Strategy: Network First, Fallback to Cache
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});
