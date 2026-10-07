// Service Worker for caching and offline support
// This provides aggressive caching for a butter-smooth experience

const CACHE_NAME = 'cheatsheet-cache-v1';
const API_CACHE = 'cheatsheet-api-cache-v1';

// The worker file sits at the deploy root, so resolving against it works on any
// base path (e.g. "/cheatsheets/" on GitHub Pages, "/" on a custom domain).
const BASE = new URL('./', self.location).pathname;

// Assets to cache immediately
const STATIC_ASSETS = [
  BASE,
  `${BASE}index.html`,
  `${BASE}java/`,
  `${BASE}springboot/`,
  `${BASE}dsa/`,
  `${BASE}git/`,
  `${BASE}devops/`,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // github.io origins are shared by every project site, so only touch our own caches.
          const isOurs = cacheName.startsWith('cheatsheet-');
          if (isOurs && cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
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

  // API requests - Network first, cache fallback
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        try {
          const response = await fetch(request);
          // Cache successful responses
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          // Fallback to cache if network fails
          const cached = await cache.match(request);
          if (cached) {
            return cached;
          }
          throw error;
        }
      })
    );
    return;
  }

  // Static assets - Cache first, network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Return cached version and update in background
        fetch(request).then((response) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response);
          });
        }).catch(() => {
          // Ignore network errors when updating cache
        });
        return cached;
      }

      return fetch(request).then((response) => {
        // Cache successful responses for static assets
        if (response.ok && request.method === 'GET') {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response.clone());
          });
        }
        return response;
      });
    })
  );
});
