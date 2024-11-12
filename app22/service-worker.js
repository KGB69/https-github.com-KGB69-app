self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('expense-tracker-cache').then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/app.js',
          '/styles.css', // If you have a CSS file
          '/icons/icon-192x192.png',
          '/icons/icon-512x512.png'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  });
  