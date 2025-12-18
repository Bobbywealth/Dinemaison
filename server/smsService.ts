import { logger } from "./lib/logger";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Twilio client (optional - only if installed and configured)
let twilioClient: any = null;
const TWILIO_ENABLED = process.env.NOTIFICATIONS_SMS_ENABLED === "true";
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio if configured
if (TWILIO_ENABLED && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
  try {
    const twilio = require("twilio");
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    logger.info("Twilio SMS service initialized");
  } catch (error) {
    logger.warn("Twilio not installed. SMS notifications will not work. Install with: npm install twilio");
  }
} else {
  logger.info("SMS notifications disabled (set NOTIFICATIONS_SMS_ENABLED=true to enable)");
}

/**
 * Send SMS to a phone number
 */
export async function sendSMSToPhone(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  if (!TWILIO_ENABLED) {
    logger.debug("SMS sending skipped: SMS notifications disabled");
    return false;
  }

  if (!twilioClient) {
    logger.warn("Cannot send SMS: Twilio not configured");
    return false;
  }

  // Validate phone number format (basic check)
  if (!phoneNumber || phoneNumber.length < 10) {
    logger.warn("Invalid phone number format:", phoneNumber);
    return false;
  }

  // Ensure phone number starts with +
  const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+1${phoneNumber}`;

  try {
    // Truncate message to 160 characters for SMS
    const truncatedMessage = message.length > 160 
      ? `${message.substring(0, 157)}...` 
      : message;

    const result = await twilioClient.messages.create({
      body: truncatedMessage,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    logger.info(`SMS sent successfully to ${formattedPhone}. SID: ${result.sid}`);
    return true;
  } catch (error: any) {
    logger.error("Error sending SMS:", {
      error: error.message,
      code: error.code,
      phone: formattedPhone,
    });
    return false;
  }
}

/**
 * Send SMS to a user by userId (looks up phone number)
 */
export async function sendSMS(
  userId: string,
  title: string,
  body: string
): Promise<boolean> {
  try {
    // Get user's phone number
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.phoneNumber) {
      logger.debug(`No phone number found for user ${userId}`);
      return false;
    }

    if (!user.phoneVerified) {
      logger.debug(`Phone number not verified for user ${userId}`);
      return false;
    }

    // Format message: "Title: Body"
    const message = `${title}: ${body}`;

    return await sendSMSToPhone(user.phoneNumber, message);
  } catch (error) {
    logger.error("Error in sendSMS:", error);
    return false;
  }
}

/**
 * Send SMS notification with Dine Maison branding
 */
export async function sendBrandedSMS(
  userId: string,
  message: string
): Promise<boolean> {
  const brandedMessage = `Dine Maison: ${message}`;
  
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.phoneNumber || !user.phoneVerified) {
      return false;
    }

    return await sendSMSToPhone(user.phoneNumber, brandedMessage);
  } catch (error) {
    logger.error("Error in sendBrandedSMS:", error);
    return false;
  }
}

/**
 * Verify SMS is configured and working
 */
export function isSMSConfigured(): boolean {
  return TWILIO_ENABLED && twilioClient !== null;
}

/**
 * Send test SMS
 */
export async function sendTestSMS(phoneNumber: string): Promise<boolean> {
  return await sendSMSToPhone(
    phoneNumber,
    "Test message from Dine Maison notification system"
  );
}

/**
 * Format booking SMS notification
 */
export function formatBookingSMS(
  type: "requested" | "confirmed" | "cancelled" | "reminder",
  chefName: string,
  date: string
): string {
  const messages = {
    requested: `Your booking request with ${chefName} has been sent.`,
    confirmed: `Booking confirmed! ${chefName} on ${date}. Check your email for details.`,
    cancelled: `Your booking with ${chefName} on ${date} has been cancelled.`,
    reminder: `Reminder: Your booking with ${chefName} is tomorrow at ${date}!`,
  };

  return messages[type] || `Booking update with ${chefName}`;
}

