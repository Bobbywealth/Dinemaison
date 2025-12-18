import { debug } from "@/utils/debug";

/**
 * Check if the Web Share API is supported
 */
export function isShareSupported(): boolean {
  return "share" in navigator;
}

/**
 * Share content using the Web Share API
 */
export async function shareContent(data: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<boolean> {
  if (!isShareSupported()) {
    debug.warn("Web Share API not supported");
    return false;
  }

  try {
    await navigator.share(data);
    debug.log("Content shared successfully");
    return true;
  } catch (error: any) {
    // User cancelled the share or sharing failed
    if (error.name !== "AbortError") {
      debug.error("Error sharing content:", error);
    }
    return false;
  }
}

/**
 * Share a chef profile
 */
export async function shareChefProfile(chefName: string, chefId: string): Promise<boolean> {
  const url = `${window.location.origin}/chefs/${chefId}`;
  return shareContent({
    title: `Check out ${chefName} on Dine Maison`,
    text: `I found this amazing private chef on Dine Maison. ${chefName} offers unique culinary experiences!`,
    url,
  });
}

/**
 * Share a booking confirmation
 */
export async function shareBooking(chefName: string, eventDate: string): Promise<boolean> {
  return shareContent({
    title: "My Dine Maison Booking",
    text: `I've booked a private dining experience with ${chefName} on ${eventDate} through Dine Maison!`,
    url: window.location.origin,
  });
}

/**
 * Check if Geolocation API is supported
 */
export function isGeolocationSupported(): boolean {
  return "geolocation" in navigator;
}

/**
 * Get user's current location
 */
export async function getCurrentLocation(): Promise<GeolocationPosition | null> {
  if (!isGeolocationSupported()) {
    debug.warn("Geolocation not supported");
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        debug.log("Location obtained:", {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        resolve(position);
      },
      (error) => {
        debug.error("Error getting location:", error);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

/**
 * Calculate distance between two coordinates (in km)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Find nearby chefs based on user's location
 */
export async function findNearbyChefs(
  userLat: number,
  userLon: number,
  chefs: Array<{ id: string; latitude?: number; longitude?: number }>
): Promise<Array<{ id: string; distance: number }>> {
  return chefs
    .filter((chef) => chef.latitude && chef.longitude)
    .map((chef) => ({
      id: chef.id,
      distance: calculateDistance(userLat, userLon, chef.latitude!, chef.longitude!),
    }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Check if camera/media access is supported
 */
export function isCameraSupported(): boolean {
  return "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices;
}

/**
 * Request camera access and capture photo
 */
export async function capturePhoto(): Promise<Blob | null> {
  if (!isCameraSupported()) {
    debug.warn("Camera not supported");
    return null;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }, // Use back camera on mobile
      audio: false,
    });

    // Create video element to capture frame
    const video = document.createElement("video");
    video.srcObject = stream;
    video.play();

    // Wait for video to be ready
    await new Promise((resolve) => {
      video.onloadedmetadata = resolve;
    });

    // Create canvas to capture frame
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);

    // Stop the stream
    stream.getTracks().forEach((track) => track.stop());

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8);
    });
  } catch (error) {
    debug.error("Error accessing camera:", error);
    return null;
  }
}

/**
 * Pick an image from device using file input
 * (More reliable than camera API)
 */
export async function pickImage(accept: string = "image/*"): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.capture = "environment"; // Suggest camera on mobile

    input.onchange = () => {
      const file = input.files?.[0];
      resolve(file || null);
    };

    input.oncancel = () => {
      resolve(null);
    };

    input.click();
  });
}

/**
 * Check if device is in standalone mode (PWA installed)
 */
export function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes("android-app://")
  );
}

/**
 * Check if device is iOS
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

/**
 * Check if device is Android
 */
export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

/**
 * Get device type
 */
export function getDeviceType(): "ios" | "android" | "desktop" {
  if (isIOS()) return "ios";
  if (isAndroid()) return "android";
  return "desktop";
}

/**
 * Vibrate device (if supported)
 */
export function vibrate(pattern: number | number[]): boolean {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
    return true;
  }
  return false;
}

/**
 * Add to home screen prompt (for supported browsers)
 */
export function canAddToHomeScreen(): boolean {
  // This is handled by the InstallPrompt component
  return "beforeinstallprompt" in window;
}

/**
 * Request persistent storage (for PWA)
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if ("storage" in navigator && "persist" in navigator.storage) {
    try {
      const isPersisted = await navigator.storage.persist();
      debug.log("Persistent storage:", isPersisted);
      return isPersisted;
    } catch (error) {
      debug.error("Error requesting persistent storage:", error);
      return false;
    }
  }
  return false;
}

/**
 * Get storage estimate
 */
export async function getStorageEstimate(): Promise<StorageEstimate | null> {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    try {
      return await navigator.storage.estimate();
    } catch (error) {
      debug.error("Error getting storage estimate:", error);
      return null;
    }
  }
  return null;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if ("clipboard" in navigator) {
    try {
      await navigator.clipboard.writeText(text);
      debug.log("Text copied to clipboard");
      return true;
    } catch (error) {
      debug.error("Error copying to clipboard:", error);
      return false;
    }
  }
  return false;
}

/**
 * Check network connection status
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Get network information (if available)
 */
export function getNetworkInfo(): {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
} | null {
  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  if (connection) {
    return {
      type: connection.type,
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    };
  }

  return null;
}

/**
 * Listen to online/offline events
 */
export function addNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);

  return () => {
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
  };
}
