const CACHE_NAME = 'expense-tracker-cache-v1';
const urlsToCache = [
    '/', // Root - Adjust path if needed (e.g., '/app/' for GitHub Pages)
    '/index.html', // Adjust path if it's not at the root
    '/src/app.js',
    '/src/manifest.json',
    '/src/assets/', // Cache assets folder if applicable
    '/src/service-worker.js', // Ensure service worker itself is cached
    'https://cdn.jsdelivr.net/npm/chart.js' // External libraries
];

// Install event - Cache all necessary resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - Serve resources from cache if available
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached resource or fetch from network if not cached
                return response || fetch(event.request);
            })
    );
});

// Activate event - Cleanup old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
