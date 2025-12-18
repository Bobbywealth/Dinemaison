// Shared notification types and interfaces for web and mobile

export enum NotificationType {
  // Booking notifications
  BOOKING_REQUESTED = "booking_requested",
  BOOKING_CONFIRMED = "booking_confirmed",
  BOOKING_CANCELLED = "booking_cancelled",
  BOOKING_COMPLETED = "booking_completed",
  BOOKING_REMINDER = "booking_reminder",
  BOOKING_REJECTED = "booking_rejected",
  
  // Payment notifications
  PAYMENT_PENDING = "payment_pending",
  PAYMENT_SUCCESS = "payment_success",
  PAYMENT_FAILED = "payment_failed",
  PAYMENT_REFUNDED = "payment_refunded",
  
  // Message notifications
  MESSAGE_RECEIVED = "message_received",
  
  // Review notifications
  REVIEW_RECEIVED = "review_received",
  REVIEW_RESPONSE = "review_response",
  
  // Chef notifications
  CHEF_APPLICATION_APPROVED = "chef_application_approved",
  CHEF_APPLICATION_REJECTED = "chef_application_rejected",
  
  // System notifications
  SYSTEM_ANNOUNCEMENT = "system_announcement",
  ACCOUNT_UPDATE = "account_update",
}

export enum NotificationCategory {
  BOOKING = "booking",
  PAYMENT = "payment",
  MESSAGE = "message",
  REVIEW = "review",
  SYSTEM = "system",
}

export enum NotificationPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

export enum NotificationChannel {
  PUSH = "push",
  EMAIL = "email",
  SMS = "sms",
  WEBSOCKET = "websocket",
  IN_APP = "in_app",
}

export enum NotificationDeliveryStatus {
  PENDING = "pending",
  SENT = "sent",
  DELIVERED = "delivered",
  FAILED = "failed",
}

export interface NotificationData {
  [key: string]: any;
  bookingId?: string;
  chefId?: string;
  customerId?: string;
  url?: string;
  actionUrl?: string;
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface ChannelPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  inApp: boolean;
}

export interface SendNotificationOptions {
  channels?: NotificationChannel[];
  skipPreferences?: boolean;
  scheduledFor?: Date;
}

