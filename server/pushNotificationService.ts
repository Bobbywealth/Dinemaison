import webpush from "web-push";
import { db } from "./db";
import { pushSubscriptions, deviceTokens } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "./lib/logger";

// Firebase Admin SDK (optional - for mobile push)
let firebaseAdmin: any = null;
try {
  // Only import if firebase-admin is installed
  firebaseAdmin = require("firebase-admin");
  
  // Initialize Firebase if credentials are provided
  const firebaseConfig = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (firebaseConfig && !firebaseAdmin.apps.length) {
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(JSON.parse(firebaseConfig)),
    });
    logger.info("Firebase Admin SDK initialized for mobile push notifications");
  }
} catch (error) {
  logger.warn("Firebase Admin SDK not available. Mobile push notifications will not work. Install with: npm install firebase-admin");
}

// VAPID keys for web push
// In production, these should be environment variables
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:support@dinemaison.com";

// Initialize web push with VAPID details
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  logger.info("Web Push initialized with VAPID keys");
} else {
  logger.warn("VAPID keys not configured. Push notifications will not work. Generate keys with: npx web-push generate-vapid-keys");
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * Get VAPID public key for client-side subscription
 */
export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}

/**
 * Save a push subscription for a user
 */
export async function savePushSubscription(
  userId: string,
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }
): Promise<void> {
  try {
    // Check if subscription already exists
    const existing = await db
      .select()
      .from(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, userId),
          eq(pushSubscriptions.endpoint, subscription.endpoint)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      // Insert new subscription
      await db.insert(pushSubscriptions).values({
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      });
      logger.info(`Saved push subscription for user ${userId}`);
    } else {
      logger.info(`Push subscription already exists for user ${userId}`);
    }
  } catch (error) {
    logger.error("Error saving push subscription:", error);
    throw error;
  }
}

/**
 * Remove a push subscription
 */
export async function removePushSubscription(
  userId: string,
  endpoint: string
): Promise<void> {
  try {
    await db
      .delete(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, userId),
          eq(pushSubscriptions.endpoint, endpoint)
        )
      );
    logger.info(`Removed push subscription for user ${userId}`);
  } catch (error) {
    logger.error("Error removing push subscription:", error);
    throw error;
  }
}

/**
 * Get all subscriptions for a user
 */
export async function getUserSubscriptions(userId: string) {
  try {
    return await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));
  } catch (error) {
    logger.error("Error getting user subscriptions:", error);
    return [];
  }
}

/**
 * Send a push notification to a specific user (web and mobile)
 */
export async function sendPushNotification(
  userId: string,
  payload: PushNotificationPayload
): Promise<void> {
  try {
    // Send to web subscriptions (VAPID)
    await sendWebPushNotification(userId, payload);
    
    // Send to mobile devices (FCM)
    await sendMobilePushNotification(userId, payload);
  } catch (error) {
    logger.error("Error in sendPushNotification:", error);
    throw error;
  }
}

/**
 * Send web push notification via VAPID
 */
async function sendWebPushNotification(
  userId: string,
  payload: PushNotificationPayload
): Promise<void> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    logger.warn("Cannot send web push notification: VAPID keys not configured");
    return;
  }

  try {
    const subscriptions = await getUserSubscriptions(userId);

    if (subscriptions.length === 0) {
      logger.debug(`No web push subscriptions found for user ${userId}`);
      return;
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/pwa-192x192.png",
      badge: payload.badge || "/pwa-64x64.png",
      data: payload.data || {},
      tag: payload.tag,
      requireInteraction: payload.requireInteraction || false,
      actions: payload.actions || [],
    });

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          notificationPayload
        );
        logger.info(`Web push notification sent to user ${userId}`);
      } catch (error: any) {
        // If subscription is invalid or expired, remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
          logger.info(`Removing invalid web push subscription for user ${userId}`);
          await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.endpoint, sub.endpoint));
        } else {
          logger.error("Error sending web push notification:", error);
        }
      }
    });

    await Promise.all(sendPromises);
  } catch (error) {
    logger.error("Error in sendWebPushNotification:", error);
  }
}

/**
 * Send mobile push notification via FCM
 */
async function sendMobilePushNotification(
  userId: string,
  payload: PushNotificationPayload
): Promise<void> {
  if (!firebaseAdmin) {
    logger.debug("Firebase Admin SDK not initialized. Skipping mobile push.");
    return;
  }

  try {
    // Get user's mobile device tokens
    const tokens = await db
      .select()
      .from(deviceTokens)
      .where(
        and(
          eq(deviceTokens.userId, userId),
          eq(deviceTokens.isActive, true)
        )
      );

    if (tokens.length === 0) {
      logger.debug(`No mobile device tokens found for user ${userId}`);
      return;
    }

    const messaging = firebaseAdmin.messaging();
    
    const fcmPayload = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        ...(payload.data || {}),
        tag: payload.tag || "",
        requireInteraction: String(payload.requireInteraction || false),
      },
      android: {
        notification: {
          icon: "notification_icon",
          color: "#FF6B35",
          tag: payload.tag,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    };

    const sendPromises = tokens.map(async (deviceToken) => {
      try {
        await messaging.send({
          ...fcmPayload,
          token: deviceToken.token,
        });
        
        // Update last used timestamp
        await db
          .update(deviceTokens)
          .set({ lastUsedAt: new Date() })
          .where(eq(deviceTokens.id, deviceToken.id));
        
        logger.info(`Mobile push notification sent to user ${userId} on ${deviceToken.platform}`);
      } catch (error: any) {
        // Handle invalid or expired tokens
        if (
          error.code === "messaging/invalid-registration-token" ||
          error.code === "messaging/registration-token-not-registered"
        ) {
          logger.info(`Removing invalid device token for user ${userId}`);
          await db
            .update(deviceTokens)
            .set({ isActive: false })
            .where(eq(deviceTokens.id, deviceToken.id));
        } else {
          logger.error("Error sending mobile push notification:", error);
        }
      }
    });

    await Promise.all(sendPromises);
  } catch (error) {
    logger.error("Error in sendMobilePushNotification:", error);
  }
}

/**
 * Send notification for booking confirmation
 */
export async function sendBookingConfirmationNotification(
  userId: string,
  bookingId: string,
  chefName: string
): Promise<void> {
  await sendPushNotification(userId, {
    title: "Booking Request Sent",
    body: `Your booking request with ${chefName} has been sent and is awaiting confirmation.`,
    tag: `booking-${bookingId}`,
    data: {
      type: "booking",
      bookingId,
      url: `/dashboard?tab=bookings`,
    },
    actions: [
      {
        action: "view",
        title: "View Booking",
      },
    ],
  });
}

/**
 * Send notification when chef accepts booking
 */
export async function sendBookingAcceptedNotification(
  userId: string,
  bookingId: string,
  chefName: string,
  eventDate: string
): Promise<void> {
  await sendPushNotification(userId, {
    title: "Booking Confirmed!",
    body: `${chefName} has accepted your booking for ${eventDate}. Get ready for an amazing experience!`,
    tag: `booking-${bookingId}`,
    requireInteraction: true,
    data: {
      type: "booking-accepted",
      bookingId,
      url: `/dashboard?tab=bookings`,
    },
    actions: [
      {
        action: "view",
        title: "View Details",
      },
    ],
  });
}

/**
 * Send notification for booking reminder (24 hours before)
 */
export async function sendBookingReminderNotification(
  userId: string,
  bookingId: string,
  chefName: string,
  eventDate: string
): Promise<void> {
  await sendPushNotification(userId, {
    title: "Booking Reminder",
    body: `Your experience with ${chefName} is tomorrow at ${eventDate}. We hope you're excited!`,
    tag: `booking-reminder-${bookingId}`,
    requireInteraction: true,
    data: {
      type: "booking-reminder",
      bookingId,
      url: `/dashboard?tab=bookings`,
    },
  });
}

/**
 * Send notification for new message
 */
export async function sendMessageNotification(
  userId: string,
  senderName: string,
  message: string
): Promise<void> {
  await sendPushNotification(userId, {
    title: `Message from ${senderName}`,
    body: message.length > 100 ? `${message.substring(0, 100)}...` : message,
    tag: `message-${userId}`,
    data: {
      type: "message",
      url: `/dashboard?tab=messages`,
    },
    actions: [
      {
        action: "view",
        title: "View Message",
      },
    ],
  });
}

// ============== MOBILE DEVICE TOKEN MANAGEMENT ==============

/**
 * Register a mobile device token
 */
export async function registerDeviceToken(
  userId: string,
  platform: "ios" | "android" | "web",
  token: string,
  deviceId?: string
): Promise<boolean> {
  try {
    // Check if token already exists
    const [existing] = await db
      .select()
      .from(deviceTokens)
      .where(eq(deviceTokens.token, token))
      .limit(1);

    if (existing) {
      // Update existing token
      await db
        .update(deviceTokens)
        .set({
          userId,
          platform,
          deviceId: deviceId || existing.deviceId,
          isActive: true,
          lastUsedAt: new Date(),
        })
        .where(eq(deviceTokens.id, existing.id));
      
      logger.info(`Updated device token for user ${userId} on ${platform}`);
    } else {
      // Insert new token
      await db.insert(deviceTokens).values({
        userId,
        platform,
        token,
        deviceId,
        isActive: true,
      });
      
      logger.info(`Registered new device token for user ${userId} on ${platform}`);
    }
    
    return true;
  } catch (error) {
    logger.error("Error registering device token:", error);
    return false;
  }
}

/**
 * Unregister a device token
 */
export async function unregisterDeviceToken(token: string): Promise<boolean> {
  try {
    await db
      .update(deviceTokens)
      .set({ isActive: false })
      .where(eq(deviceTokens.token, token));
    
    logger.info(`Unregistered device token`);
    return true;
  } catch (error) {
    logger.error("Error unregistering device token:", error);
    return false;
  }
}

/**
 * Get all device tokens for a user
 */
export async function getUserDeviceTokens(userId: string) {
  try {
    return await db
      .select()
      .from(deviceTokens)
      .where(
        and(
          eq(deviceTokens.userId, userId),
          eq(deviceTokens.isActive, true)
        )
      );
  } catch (error) {
    logger.error("Error getting user device tokens:", error);
    return [];
  }
}

/**
 * Remove device token by ID
 */
export async function removeDeviceToken(deviceId: string): Promise<boolean> {
  try {
    await db
      .delete(deviceTokens)
      .where(eq(deviceTokens.id, deviceId));
    
    logger.info(`Removed device token ${deviceId}`);
    return true;
  } catch (error) {
    logger.error("Error removing device token:", error);
    return false;
  }
}

