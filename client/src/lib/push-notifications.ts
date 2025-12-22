import { debug } from "@/utils/debug";

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Check if push notifications are supported in the browser
 */
export function isPushNotificationSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Get the current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!("Notification" in window)) {
    return "denied";
  }
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    debug.error("Push notifications not supported");
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    debug.log("Notification permission:", permission);
    return permission;
  } catch (error) {
    debug.error("Error requesting notification permission:", error);
    return "denied";
  }
}

/**
 * Convert a base64 string to Uint8Array for VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscriptionData | null> {
  if (!isPushNotificationSupported()) {
    debug.error("Push notifications not supported");
    return null;
  }

  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Get VAPID public key from server
      const response = await fetch("/api/notifications/vapid-public-key");
      const { publicKey } = await response.json();

      // Create new subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      debug.log("Created new push subscription");
    }

    // Convert subscription to plain object
    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
        auth: arrayBufferToBase64(subscription.getKey("auth")),
      },
    };

    // Send subscription to server
    await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscriptionData),
    });

    debug.log("Push subscription saved to server");
    return subscriptionData;
  } catch (error) {
    debug.error("Error subscribing to push notifications:", error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Unsubscribe from push service
      await subscription.unsubscribe();

      // Remove subscription from server
      await fetch("/api/notifications/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      debug.log("Unsubscribed from push notifications");
      return true;
    }

    return false;
  } catch (error) {
    debug.error("Error unsubscribing from push notifications:", error);
    return false;
  }
}

/**
 * Check if user is currently subscribed to push notifications
 */
export async function isPushSubscribed(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    debug.error("Error checking push subscription status:", error);
    return false;
  }
}

/**
 * Helper function to convert ArrayBuffer to base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Show a test notification
 */
export async function showTestNotification(): Promise<void> {
  if (!isPushNotificationSupported()) {
    debug.error("Notifications not supported");
    return;
  }

  const permission = await requestNotificationPermission();
  if (permission !== "granted") {
    debug.error("Notification permission denied");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification("Dine Maison", {
      body: "You're all set to receive booking notifications!",
      icon: "/pwa-192x192.png",
      badge: "/pwa-64x64.png",
      tag: "test-notification",
      requireInteraction: false,
    });
    debug.log("Test notification shown");
  } catch (error) {
    debug.error("Error showing test notification:", error);
  }
}



