/**
 * Service Worker for brand-ops
 * Handles offline detection and basic service worker lifecycle
 *
 * This is a simple Service Worker that:
 * - Registers install and activate handlers
 * - Passes through fetch requests (no caching yet)
 * - Logs lifecycle events for debugging
 */

// Service Worker install event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  // Skip waiting to activate immediately
  self.skipWaiting();
  console.log('[Service Worker] Install complete');
});

// Service Worker activate event
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    // Claim all clients to ensure this SW controls all pages
    self.clients.claim().then(() => {
      console.log('[Service Worker] Activated and claimed all clients');
    })
  );
});

// Service Worker fetch event - simple passthrough (no caching yet)
self.addEventListener('fetch', (event) => {
  // For now, just pass through all requests
  // Future: implement cache-first strategy
  console.log('[Service Worker] Fetch:', event.request.url);
});

// Service Worker error handling
self.addEventListener('error', (event) => {
  console.error('[Service Worker] Error:', event);
});

// Message handler for testing
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
