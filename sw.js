# ShoreSquad - Service Worker
# Enables offline support and asset caching

const CACHE_NAME = 'shoresquad-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap'
];

# Install event - cache files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('ShoreSquad: Cache opened');
                return cache.addAll(urlsToCache).catch(err => {
                    console.log('Some assets could not be cached:', err);
                });
            })
    );
    self.skipWaiting();
});

# Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('ShoreSquad: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

# Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    # Serve from cache
                    # Try to update cache in background
                    fetch(event.request)
                        .then(freshResponse => {
                            if (freshResponse && freshResponse.status === 200) {
                                caches.open(CACHE_NAME)
                                    .then(cache => cache.put(event.request, freshResponse));
                            }
                        })
                        .catch(() => {}); # Silently fail if offline
                    return response;
                }

                # Not in cache, try network
                return fetch(event.request)
                    .then(response => {
                        # Cache successful responses
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(event.request, responseToCache));

                        return response;
                    })
                    .catch(() => {
                        # Return offline page or cached response
                        return caches.match('/index.html');
                    });
            })
    );
});
