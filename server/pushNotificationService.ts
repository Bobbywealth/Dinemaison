import webpush from "web-push";
import { db } from "./db";
import { pushSubscriptions } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "./lib/logger";

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
 * Send a push notification to a specific user
 */
export async function sendPushNotification(
  userId: string,
  payload: PushNotificationPayload
): Promise<void> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    logger.warn("Cannot send push notification: VAPID keys not configured");
    return;
  }

  try {
    const subscriptions = await getUserSubscriptions(userId);

    if (subscriptions.length === 0) {
      logger.info(`No push subscriptions found for user ${userId}`);
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
        logger.info(`Push notification sent to user ${userId}`);
      } catch (error: any) {
        // If subscription is invalid or expired, remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
          logger.info(`Removing invalid subscription for user ${userId}`);
          await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.endpoint, sub.endpoint));
        } else {
          logger.error("Error sending push notification:", error);
        }
      }
    });

    await Promise.all(sendPromises);
  } catch (error) {
    logger.error("Error in sendPushNotification:", error);
    throw error;
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
