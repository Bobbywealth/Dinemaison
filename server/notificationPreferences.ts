import { db } from "./db";
import {
  notificationPreferences,
  type InsertNotificationPreference,
  type NotificationPreference,
} from "@shared/schema";
import { NotificationType, NotificationChannel, type ChannelPreferences } from "@shared/notificationTypes";
import { eq, and } from "drizzle-orm";
import { logger } from "./lib/logger";

/**
 * Default preferences for all notification types
 * These are used when a user hasn't set specific preferences
 */
const defaultPreferences: Record<NotificationType, ChannelPreferences> = {
  [NotificationType.BOOKING_REQUESTED]: {
    push: true,
    email: true,
    sms: false,
    inApp: true,
  },
  [NotificationType.BOOKING_CONFIRMED]: {
    push: true,
    email: true,
    sms: true,
    inApp: true,
  },
  [NotificationType.BOOKING_CANCELLED]: {
    push: true,
    email: true,
    sms: true,
    inApp: true,
  },
  [NotificationType.BOOKING_COMPLETED]: {
    push: true,
    email: true,
    sms: false,
    inApp: true,
  },
  [NotificationType.BOOKING_REMINDER]: {
    push: true,
    email: false,
    sms: true,
    inApp: true,
  },
  [NotificationType.BOOKING_REJECTED]: {
    push: true,
    email: true,
    sms: false,
    inApp: true,
  },
  [NotificationType.PAYMENT_PENDING]: {
    push: true,
    email: true,
    sms: false,
    inApp: true,
  },
  [NotificationType.PAYMENT_SUCCESS]: {
    push: true,
    email: true,
    sms: false,
    inApp: true,
  },
  [NotificationType.PAYMENT_FAILED]: {
    push: true,
    email: true,
    sms: true,
    inApp: true,
  },
  [NotificationType.PAYMENT_REFUNDED]: {
    push: true,
    email: true,
    sms: false,
    inApp: true,
  },
  [NotificationType.MESSAGE_RECEIVED]: {
    push: true,
    email: false,
    sms: false,
    inApp: true,
  },
  [NotificationType.REVIEW_RECEIVED]: {
    push: true,
    email: true,
    sms: false,
    inApp: true,
  },
  [NotificationType.REVIEW_RESPONSE]: {
    push: true,
    email: true,
    sms: false,
    inApp: true,
  },
  [NotificationType.CHEF_APPLICATION_APPROVED]: {
    push: true,
    email: true,
    sms: false,
    inApp: true,
  },
  [NotificationType.CHEF_APPLICATION_REJECTED]: {
    push: true,
    email: true,
    sms: false,
    inApp: true,
  },
  [NotificationType.SYSTEM_ANNOUNCEMENT]: {
    push: false,
    email: true,
    sms: false,
    inApp: true,
  },
  [NotificationType.ACCOUNT_UPDATE]: {
    push: true,
    email: true,
    sms: false,
    inApp: true,
  },
};

/**
 * Get default preferences
 */
export function getDefaultPreferences(): Record<NotificationType, ChannelPreferences> {
  return defaultPreferences;
}

/**
 * Get all preferences for a user
 * Returns default preferences for types not yet set by user
 */
export async function getNotificationPreferences(
  userId: string
): Promise<Record<NotificationType, ChannelPreferences>> {
  try {
    const userPreferences = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));

    // Start with defaults
    const preferences: Record<NotificationType, ChannelPreferences> = { ...defaultPreferences };

    // Override with user's custom preferences
    userPreferences.forEach((pref) => {
      const type = pref.notificationType as NotificationType;
      if (type in preferences) {
        preferences[type] = {
          push: pref.channelPush,
          email: pref.channelEmail,
          sms: pref.channelSms,
          inApp: pref.channelInApp,
        };
      }
    });

    return preferences;
  } catch (error) {
    logger.error("Error getting notification preferences:", error);
    return defaultPreferences;
  }
}

/**
 * Get preferences for a specific notification type
 */
export async function getPreferencesForType(
  userId: string,
  type: NotificationType
): Promise<ChannelPreferences> {
  try {
    const [pref] = await db
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.notificationType, type)
        )
      )
      .limit(1);

    if (pref) {
      return {
        push: pref.channelPush,
        email: pref.channelEmail,
        sms: pref.channelSms,
        inApp: pref.channelInApp,
      };
    }

    // Return default if not set
    return defaultPreferences[type] || {
      push: true,
      email: true,
      sms: false,
      inApp: true,
    };
  } catch (error) {
    logger.error("Error getting preferences for type:", error);
    return defaultPreferences[type];
  }
}

/**
 * Check if a specific channel is enabled for a notification type
 */
export async function isChannelEnabled(
  userId: string,
  type: NotificationType,
  channel: NotificationChannel
): Promise<boolean> {
  try {
    const prefs = await getPreferencesForType(userId, type);

    switch (channel) {
      case NotificationChannel.PUSH:
        return prefs.push;
      case NotificationChannel.EMAIL:
        return prefs.email;
      case NotificationChannel.SMS:
        return prefs.sms;
      case NotificationChannel.IN_APP:
        return prefs.inApp;
      case NotificationChannel.WEBSOCKET:
        return true; // Always enabled for real-time
      default:
        return false;
    }
  } catch (error) {
    logger.error("Error checking if channel enabled:", error);
    return false;
  }
}

/**
 * Update user preferences for a specific notification type
 */
export async function updateNotificationPreference(
  userId: string,
  type: NotificationType,
  channels: Partial<ChannelPreferences>
): Promise<boolean> {
  try {
    // Check if preference exists
    const [existing] = await db
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.notificationType, type)
        )
      )
      .limit(1);

    const preferenceData: InsertNotificationPreference = {
      userId,
      notificationType: type,
      channelPush: channels.push ?? existing?.channelPush ?? defaultPreferences[type].push,
      channelEmail: channels.email ?? existing?.channelEmail ?? defaultPreferences[type].email,
      channelSms: channels.sms ?? existing?.channelSms ?? defaultPreferences[type].sms,
      channelInApp: channels.inApp ?? existing?.channelInApp ?? defaultPreferences[type].inApp,
    };

    if (existing) {
      // Update existing preference
      await db
        .update(notificationPreferences)
        .set({
          channelPush: preferenceData.channelPush,
          channelEmail: preferenceData.channelEmail,
          channelSms: preferenceData.channelSms,
          channelInApp: preferenceData.channelInApp,
          updatedAt: new Date(),
        })
        .where(eq(notificationPreferences.id, existing.id));
    } else {
      // Create new preference
      await db.insert(notificationPreferences).values(preferenceData);
    }

    logger.info(`Updated notification preferences for user ${userId}, type ${type}`);
    return true;
  } catch (error) {
    logger.error("Error updating notification preference:", error);
    return false;
  }
}

/**
 * Update multiple preferences at once
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Record<NotificationType, Partial<ChannelPreferences>>
): Promise<boolean> {
  try {
    const updatePromises = Object.entries(preferences).map(([type, channels]) =>
      updateNotificationPreference(userId, type as NotificationType, channels)
    );

    const results = await Promise.all(updatePromises);
    return results.every((result) => result === true);
  } catch (error) {
    logger.error("Error updating notification preferences:", error);
    return false;
  }
}

/**
 * Reset preferences to defaults for a user
 */
export async function resetPreferencesToDefaults(userId: string): Promise<boolean> {
  try {
    // Delete all existing preferences
    await db
      .delete(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));

    logger.info(`Reset notification preferences to defaults for user ${userId}`);
    return true;
  } catch (error) {
    logger.error("Error resetting preferences:", error);
    return false;
  }
}

/**
 * Initialize default preferences for a new user
 * This can be called when a user signs up
 */
export async function initializeUserPreferences(userId: string): Promise<boolean> {
  try {
    // Check if user already has preferences
    const existing = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      logger.info(`User ${userId} already has preferences initialized`);
      return true;
    }

    // Create preferences for each notification type with defaults
    const preferencesToInsert: InsertNotificationPreference[] = Object.entries(
      defaultPreferences
    ).map(([type, channels]) => ({
      userId,
      notificationType: type as NotificationType,
      channelPush: channels.push,
      channelEmail: channels.email,
      channelSms: channels.sms,
      channelInApp: channels.inApp,
    }));

    await db.insert(notificationPreferences).values(preferencesToInsert);

    logger.info(`Initialized notification preferences for user ${userId}`);
    return true;
  } catch (error) {
    logger.error("Error initializing user preferences:", error);
    return false;
  }
}



