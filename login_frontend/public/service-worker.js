self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('pwa-cache').then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/pwa-192x192.png',
          '/pwa-512x512.png'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/api/')) {
      return;
    }

    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
  
