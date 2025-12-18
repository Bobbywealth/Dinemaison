/**
 * Background Sync Service Worker Extension
 * Handles background sync events for queued requests
 */

const SYNC_QUEUE_KEY = 'dinemaison-sync-queue';
const SYNC_TAG = 'dinemaison-sync';

// Listen for background sync events
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === SYNC_TAG) {
    event.waitUntil(syncQueuedRequests());
  }
});

/**
 * Process queued requests
 */
async function syncQueuedRequests() {
  console.log('Processing queued requests...');
  
  try {
    // Get queue from client-side storage
    // Note: Service worker can't directly access localStorage
    // We'll communicate with clients to get the queue
    const clients = await self.clients.matchAll();
    
    if (clients.length === 0) {
      console.log('No clients available for sync');
      return;
    }
    
    // Ask the first client to process the sync queue
    clients[0].postMessage({
      type: 'PROCESS_SYNC_QUEUE'
    });
    
    console.log('Sync queue processing initiated');
    
    // Show notification if sync was successful
    if (self.registration.showNotification) {
      await self.registration.showNotification('Sync Complete', {
        body: 'Your queued actions have been synced',
        icon: '/pwa-192x192.png',
        badge: '/pwa-64x64.png',
        tag: 'sync-complete',
        requireInteraction: false,
      });
    }
  } catch (error) {
    console.error('Sync error:', error);
    throw error; // Will retry the sync
  }
}

/**
 * Listen for messages from clients
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'SYNC_STATUS') {
    console.log('Sync status:', event.data.status);
  }
});

console.log('Background sync service worker extension loaded');
