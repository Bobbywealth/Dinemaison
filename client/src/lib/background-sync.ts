/**
 * Background Sync for Dine Maison
 * Queues requests when offline and retries when connection is restored
 */

export interface SyncRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
}

const SYNC_QUEUE_KEY = 'dinemaison-sync-queue';
const SYNC_TAG = 'dinemaison-sync';

/**
 * Check if Background Sync is supported
 */
export function isBackgroundSyncSupported(): boolean {
  return 'serviceWorker' in navigator && 'SyncManager' in window;
}

/**
 * Queue a request for background sync
 */
export async function queueForSync(
  url: string,
  method: string = 'POST',
  body?: any,
  headers?: Record<string, string>
): Promise<void> {
  const request: SyncRequest = {
    id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    url,
    method,
    headers: headers || { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    timestamp: Date.now(),
  };

  // Store in IndexedDB or localStorage
  const queue = await getSyncQueue();
  queue.push(request);
  await saveSyncQueue(queue);

  // Register background sync if supported
  if (isBackgroundSyncSupported()) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(SYNC_TAG);
      console.log('Background sync registered:', SYNC_TAG);
    } catch (error) {
      console.error('Failed to register background sync:', error);
      // Fallback: try to sync immediately
      await trySyncNow();
    }
  } else {
    // Fallback: try to sync immediately
    await trySyncNow();
  }
}

/**
 * Get sync queue from storage
 */
async function getSyncQueue(): Promise<SyncRequest[]> {
  try {
    const queueJson = localStorage.getItem(SYNC_QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Failed to get sync queue:', error);
    return [];
  }
}

/**
 * Save sync queue to storage
 */
async function saveSyncQueue(queue: SyncRequest[]): Promise<void> {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to save sync queue:', error);
  }
}

/**
 * Try to sync queued requests immediately
 */
export async function trySyncNow(): Promise<void> {
  if (!navigator.onLine) {
    console.log('Offline - sync will retry when online');
    return;
  }

  const queue = await getSyncQueue();
  if (queue.length === 0) {
    return;
  }

  console.log(`Syncing ${queue.length} queued requests...`);

  const failedRequests: SyncRequest[] = [];

  for (const request of queue) {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        credentials: 'include',
      });

      if (response.ok) {
        console.log('Synced request:', request.url);
        
        // Show success notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Sync Complete', {
            body: 'Your action has been synced successfully',
            icon: '/pwa-192x192.png',
            badge: '/pwa-64x64.png',
          });
        }
      } else {
        console.error('Sync failed:', response.status, request.url);
        failedRequests.push(request);
      }
    } catch (error) {
      console.error('Sync error:', error, request.url);
      failedRequests.push(request);
    }
  }

  // Save failed requests back to queue
  await saveSyncQueue(failedRequests);

  if (failedRequests.length === 0) {
    console.log('All requests synced successfully');
  } else {
    console.log(`${failedRequests.length} requests failed, will retry later`);
  }
}

/**
 * Clear sync queue
 */
export async function clearSyncQueue(): Promise<void> {
  localStorage.removeItem(SYNC_QUEUE_KEY);
}

/**
 * Get number of pending sync requests
 */
export async function getPendingSyncCount(): Promise<number> {
  const queue = await getSyncQueue();
  return queue.length;
}

/**
 * Hook to use background sync in React components
 */
export function useBackgroundSync() {
  const queueRequest = async (
    url: string,
    method: string = 'POST',
    body?: any,
    headers?: Record<string, string>
  ) => {
    await queueForSync(url, method, body, headers);
  };

  const syncNow = async () => {
    await trySyncNow();
  };

  const getPendingCount = async () => {
    return await getPendingSyncCount();
  };

  return {
    queueRequest,
    syncNow,
    getPendingCount,
    isSupported: isBackgroundSyncSupported(),
  };
}

/**
 * Initialize background sync
 * Call this on app startup
 */
export function initBackgroundSync(): void {
  // Try to sync on startup
  trySyncNow();

  // Listen for online event
  window.addEventListener('online', () => {
    console.log('Network restored, attempting sync...');
    trySyncNow();
  });

  // Listen for visibility change (app comes to foreground)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && navigator.onLine) {
      trySyncNow();
    }
  });
}
