import { db } from "./db";
import {
  notifications,
  notificationDeliveryLog,
  type InsertNotification,
  type InsertNotificationDeliveryLog,
} from "@shared/schema";
import {
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  NotificationChannel,
  NotificationDeliveryStatus,
  type NotificationPayload,
  type NotificationData,
  type SendNotificationOptions,
} from "@shared/notificationTypes";
import { logger } from "./lib/logger";
import { getNotificationPreferences, isChannelEnabled } from "./notificationPreferences";
import { sendPushNotification } from "./pushNotificationService";
import { sendNotificationEmail } from "./emailService";
import { sendSMS } from "./smsService";
import { broadcastToUser } from "./websocket";

/**
 * Core notification service - central dispatcher for all notifications
 */

// Notification templates with default values
const notificationTemplates: Record<
  NotificationType,
  { category: NotificationCategory; priority: NotificationPriority; emailEnabled: boolean; smsEnabled: boolean }
> = {
  [NotificationType.BOOKING_REQUESTED]: {
    category: NotificationCategory.BOOKING,
    priority: NotificationPriority.NORMAL,
    emailEnabled: true,
    smsEnabled: false,
  },
  [NotificationType.BOOKING_CONFIRMED]: {
    category: NotificationCategory.BOOKING,
    priority: NotificationPriority.HIGH,
    emailEnabled: true,
    smsEnabled: true,
  },
  [NotificationType.BOOKING_CANCELLED]: {
    category: NotificationCategory.BOOKING,
    priority: NotificationPriority.HIGH,
    emailEnabled: true,
    smsEnabled: true,
  },
  [NotificationType.BOOKING_COMPLETED]: {
    category: NotificationCategory.BOOKING,
    priority: NotificationPriority.NORMAL,
    emailEnabled: true,
    smsEnabled: false,
  },
  [NotificationType.BOOKING_REMINDER]: {
    category: NotificationCategory.BOOKING,
    priority: NotificationPriority.HIGH,
    emailEnabled: true,
    smsEnabled: true,
  },
  [NotificationType.BOOKING_REJECTED]: {
    category: NotificationCategory.BOOKING,
    priority: NotificationPriority.NORMAL,
    emailEnabled: true,
    smsEnabled: false,
  },
  [NotificationType.PAYMENT_PENDING]: {
    category: NotificationCategory.PAYMENT,
    priority: NotificationPriority.NORMAL,
    emailEnabled: true,
    smsEnabled: false,
  },
  [NotificationType.PAYMENT_SUCCESS]: {
    category: NotificationCategory.PAYMENT,
    priority: NotificationPriority.HIGH,
    emailEnabled: true,
    smsEnabled: false,
  },
  [NotificationType.PAYMENT_FAILED]: {
    category: NotificationCategory.PAYMENT,
    priority: NotificationPriority.URGENT,
    emailEnabled: true,
    smsEnabled: true,
  },
  [NotificationType.PAYMENT_REFUNDED]: {
    category: NotificationCategory.PAYMENT,
    priority: NotificationPriority.NORMAL,
    emailEnabled: true,
    smsEnabled: false,
  },
  [NotificationType.MESSAGE_RECEIVED]: {
    category: NotificationCategory.MESSAGE,
    priority: NotificationPriority.NORMAL,
    emailEnabled: false,
    smsEnabled: false,
  },
  [NotificationType.REVIEW_RECEIVED]: {
    category: NotificationCategory.REVIEW,
    priority: NotificationPriority.NORMAL,
    emailEnabled: true,
    smsEnabled: false,
  },
  [NotificationType.REVIEW_RESPONSE]: {
    category: NotificationCategory.REVIEW,
    priority: NotificationPriority.NORMAL,
    emailEnabled: true,
    smsEnabled: false,
  },
  [NotificationType.CHEF_APPLICATION_APPROVED]: {
    category: NotificationCategory.SYSTEM,
    priority: NotificationPriority.HIGH,
    emailEnabled: true,
    smsEnabled: false,
  },
  [NotificationType.CHEF_APPLICATION_REJECTED]: {
    category: NotificationCategory.SYSTEM,
    priority: NotificationPriority.NORMAL,
    emailEnabled: true,
    smsEnabled: false,
  },
  [NotificationType.SYSTEM_ANNOUNCEMENT]: {
    category: NotificationCategory.SYSTEM,
    priority: NotificationPriority.LOW,
    emailEnabled: true,
    smsEnabled: false,
  },
  [NotificationType.ACCOUNT_UPDATE]: {
    category: NotificationCategory.SYSTEM,
    priority: NotificationPriority.NORMAL,
    emailEnabled: true,
    smsEnabled: false,
  },
};

/**
 * Get notification template for a type
 */
export function getNotificationTemplate(type: NotificationType) {
  return notificationTemplates[type];
}

/**
 * Main function to send a notification across all enabled channels
 */
export async function sendNotification(
  userId: string,
  type: NotificationType,
  payload: Omit<NotificationPayload, "type">,
  options: SendNotificationOptions = {}
): Promise<string | null> {
  try {
    const template = getNotificationTemplate(type);
    
    // Create notification record in database (for in-app display)
    const notificationData: InsertNotification = {
      userId,
      type,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      category: payload.category || template.category,
      priority: payload.priority || template.priority,
      isRead: false,
    };

    const [notification] = await db.insert(notifications).values(notificationData).returning();
    
    if (!notification) {
      logger.error(`Failed to create notification for user ${userId}`);
      return null;
    }

    logger.info(`Created notification ${notification.id} for user ${userId} of type ${type}`);

    // Determine which channels to use
    let channels: NotificationChannel[];
    
    if (options.channels) {
      channels = options.channels;
    } else if (options.skipPreferences) {
      // Send to all channels
      channels = [
        NotificationChannel.PUSH,
        NotificationChannel.EMAIL,
        NotificationChannel.SMS,
        NotificationChannel.WEBSOCKET,
        NotificationChannel.IN_APP,
      ];
    } else {
      // Check user preferences
      channels = await getEnabledChannels(userId, type);
    }

    // Dispatch to each channel
    await dispatchToChannels(notification.id, userId, type, payload, channels);

    return notification.id;
  } catch (error) {
    logger.error("Error in sendNotification:", error);
    return null;
  }
}

/**
 * Get enabled channels for a user and notification type
 */
async function getEnabledChannels(
  userId: string,
  type: NotificationType
): Promise<NotificationChannel[]> {
  const channels: NotificationChannel[] = [];
  const template = getNotificationTemplate(type);

  // Always include in-app
  if (await isChannelEnabled(userId, type, NotificationChannel.IN_APP)) {
    channels.push(NotificationChannel.IN_APP);
  }

  // Check push
  if (await isChannelEnabled(userId, type, NotificationChannel.PUSH)) {
    channels.push(NotificationChannel.PUSH);
  }

  // Check email
  if (template.emailEnabled && await isChannelEnabled(userId, type, NotificationChannel.EMAIL)) {
    channels.push(NotificationChannel.EMAIL);
  }

  // Check SMS
  if (template.smsEnabled && await isChannelEnabled(userId, type, NotificationChannel.SMS)) {
    channels.push(NotificationChannel.SMS);
  }

  // Always try WebSocket for real-time
  channels.push(NotificationChannel.WEBSOCKET);

  return channels;
}

/**
 * Dispatch notification to multiple channels
 */
async function dispatchToChannels(
  notificationId: string,
  userId: string,
  type: NotificationType,
  payload: Omit<NotificationPayload, "type">,
  channels: NotificationChannel[]
): Promise<void> {
  const dispatchPromises = channels.map((channel) =>
    dispatchToChannel(notificationId, userId, type, payload, channel)
  );

  await Promise.allSettled(dispatchPromises);
}

/**
 * Dispatch notification to a specific channel
 */
async function dispatchToChannel(
  notificationId: string,
  userId: string,
  type: NotificationType,
  payload: Omit<NotificationPayload, "type">,
  channel: NotificationChannel
): Promise<void> {
  const logData: InsertNotificationDeliveryLog = {
    notificationId,
    channel,
    status: NotificationDeliveryStatus.PENDING,
  };

  try {
    switch (channel) {
      case NotificationChannel.PUSH:
        await sendPushNotification(userId, {
          title: payload.title,
          body: payload.body,
          data: payload.data,
          tag: `${type}-${notificationId}`,
          requireInteraction: payload.requireInteraction,
          actions: payload.actions,
        });
        logData.status = NotificationDeliveryStatus.SENT;
        logger.info(`Push notification sent for ${notificationId}`);
        break;

      case NotificationChannel.EMAIL:
        await sendNotificationEmail(userId, type, payload);
        logData.status = NotificationDeliveryStatus.SENT;
        logger.info(`Email notification sent for ${notificationId}`);
        break;

      case NotificationChannel.SMS:
        await sendSMS(userId, payload.title, payload.body);
        logData.status = NotificationDeliveryStatus.SENT;
        logger.info(`SMS notification sent for ${notificationId}`);
        break;

      case NotificationChannel.WEBSOCKET:
        broadcastToUser(userId, "notification:new", {
          id: notificationId,
          type,
          title: payload.title,
          body: payload.body,
          data: payload.data,
          category: payload.category,
          priority: payload.priority,
        });
        logData.status = NotificationDeliveryStatus.DELIVERED;
        logger.info(`WebSocket notification sent for ${notificationId}`);
        break;

      case NotificationChannel.IN_APP:
        // In-app is handled by the database record itself
        logData.status = NotificationDeliveryStatus.DELIVERED;
        break;

      default:
        logData.status = NotificationDeliveryStatus.FAILED;
        logData.errorMessage = `Unknown channel: ${channel}`;
    }
  } catch (error: any) {
    logData.status = NotificationDeliveryStatus.FAILED;
    logData.errorMessage = error.message || String(error);
    logger.error(`Failed to send notification via ${channel}:`, error);
  }

  // Log delivery attempt
  await db.insert(notificationDeliveryLog).values(logData);
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
    return true;
  } catch (error) {
    logger.error("Error marking notification as read:", error);
    return false;
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    
    return result[0]?.count || 0;
  } catch (error) {
    logger.error("Error getting unread count:", error);
    return 0;
  }
}

// Import necessary functions
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * Get notifications for a user (paginated)
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 20,
  offset: number = 0
) {
  try {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
  } catch (error) {
    logger.error("Error getting user notifications:", error);
    return [];
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    await db.delete(notifications).where(eq(notifications.id, notificationId));
    return true;
  } catch (error) {
    logger.error("Error deleting notification:", error);
    return false;
  }
}

