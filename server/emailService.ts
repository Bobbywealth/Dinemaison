import nodemailer from 'nodemailer';
import { config } from './config';
import { logger } from './lib/logger';

// Email configuration - uses environment variables
// For production: Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// For development: Uses console logging (no actual emails sent)

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface BookingEmailData {
  customerName: string;
  chefName: string;
  date: string;
  time: string;
  guests: number;
  location: string;
  totalAmount: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort || '587'),
        secure: smtpPort === '465',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.isConfigured = true;
      logger.info('Email service configured successfully');
    } else {
      logger.warn('Email service not configured - emails will be logged to console');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    const fromEmail = process.env.SMTP_FROM || 'noreply@dinemaison.com';

    if (!this.isConfigured || !this.transporter) {
      // Development mode - log email to console
      logger.info('📧 Email (not sent - no SMTP configured):', {
        to: options.to,
        subject: options.subject,
        preview: options.text?.substring(0, 100) || 'HTML email',
      });
      return true;
    }

    try {
      await this.transporter.sendMail({
        from: `"Dine Maison" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      logger.info('Email sent successfully', { to: options.to, subject: options.subject });
      return true;
    } catch (error) {
      logger.error('Failed to send email', error, { to: options.to, subject: options.subject });
      return false;
    }
  }

  // Pre-built email templates
  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Welcome to Dine Maison! 🍽️',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B5CF6;">Welcome to Dine Maison, ${firstName}!</h1>
          <p>Thank you for joining our exclusive private chef booking platform.</p>
          <p>You can now:</p>
          <ul>
            <li>Browse our curated selection of private chefs</li>
            <li>Book personalized dining experiences</li>
            <li>Enjoy restaurant-quality meals in your home</li>
          </ul>
          <p><a href="https://dinemaison.com/chefs" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Explore Chefs</a></p>
          <p style="color: #666; font-size: 14px;">Best regards,<br>The Dine Maison Team</p>
        </div>
      `,
      text: `Welcome to Dine Maison, ${firstName}! Thank you for joining our exclusive private chef booking platform.`,
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${config.server.isProduction ? 'https://dinemaison.com' : 'http://localhost:5000'}/reset-password?token=${resetToken}`;
    
    return this.sendEmail({
      to: email,
      subject: 'Reset Your Dine Maison Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B5CF6;">Password Reset Request</h1>
          <p>You requested to reset your password. Click the button below to create a new password:</p>
          <p><a href="${resetUrl}" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
      text: `Reset your password by visiting: ${resetUrl}`,
    });
  }

  async sendBookingConfirmation(email: string, data: BookingEmailData): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Booking Confirmed with ${data.chefName}! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B5CF6;">Booking Confirmed!</h1>
          <p>Hi ${data.customerName},</p>
          <p>Your private dining experience has been confirmed!</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Booking Details</h3>
            <p><strong>Chef:</strong> ${data.chefName}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Guests:</strong> ${data.guests}</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Total:</strong> ${data.totalAmount}</p>
          </div>

          <p>Your chef will reach out to discuss menu preferences and any special requests.</p>
          <p><a href="https://dinemaison.com/dashboard" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Your Booking</a></p>
          <p style="color: #666; font-size: 14px;">Best regards,<br>The Dine Maison Team</p>
        </div>
      `,
      text: `Your booking with ${data.chefName} on ${data.date} at ${data.time} has been confirmed. Total: ${data.totalAmount}`,
    });
  }

  async sendChefNotification(email: string, data: BookingEmailData): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `New Booking Request from ${data.customerName}! 📅`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B5CF6;">New Booking Request!</h1>
          <p>Hi ${data.chefName},</p>
          <p>You have a new booking request!</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Booking Details</h3>
            <p><strong>Customer:</strong> ${data.customerName}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Guests:</strong> ${data.guests}</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Total:</strong> ${data.totalAmount}</p>
          </div>

          <p><a href="https://dinemaison.com/dashboard" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View & Accept Booking</a></p>
          <p style="color: #666; font-size: 14px;">Best regards,<br>The Dine Maison Team</p>
        </div>
      `,
      text: `New booking from ${data.customerName} on ${data.date} at ${data.time}. ${data.guests} guests. Total: ${data.totalAmount}`,
    });
  }

  async sendBookingStatusUpdate(email: string, customerName: string, status: string, chefName: string): Promise<boolean> {
    const statusMessages: Record<string, { title: string; message: string; color: string }> = {
      accepted: {
        title: 'Booking Accepted! ✅',
        message: `Great news! ${chefName} has accepted your booking request.`,
        color: '#10B981',
      },
      declined: {
        title: 'Booking Update',
        message: `Unfortunately, ${chefName} is unable to accommodate your booking. Please browse other available chefs.`,
        color: '#EF4444',
      },
      completed: {
        title: 'Thank You for Dining! 🌟',
        message: `We hope you enjoyed your experience with ${chefName}. Please take a moment to leave a review!`,
        color: '#8B5CF6',
      },
      cancelled: {
        title: 'Booking Cancelled',
        message: 'Your booking has been cancelled. If you have any questions, please contact support.',
        color: '#6B7280',
      },
    };

    const statusInfo = statusMessages[status] || {
      title: 'Booking Update',
      message: `Your booking status has been updated to: ${status}`,
      color: '#8B5CF6',
    };

    return this.sendEmail({
      to: email,
      subject: statusInfo.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: ${statusInfo.color};">${statusInfo.title}</h1>
          <p>Hi ${customerName},</p>
          <p>${statusInfo.message}</p>
          <p><a href="https://dinemaison.com/dashboard" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Details</a></p>
          <p style="color: #666; font-size: 14px;">Best regards,<br>The Dine Maison Team</p>
        </div>
      `,
      text: `${statusInfo.title} - ${statusInfo.message}`,
    });
  }

  // Notification email templates
  async sendNotificationEmail(
    email: string,
    title: string,
    body: string,
    actionUrl?: string,
    actionText?: string
  ): Promise<boolean> {
    const baseUrl = config.server.isProduction ? 'https://dinemaison.com' : 'http://localhost:5000';
    const fullActionUrl = actionUrl ? `${baseUrl}${actionUrl}` : `${baseUrl}/dashboard`;
    
    return this.sendEmail({
      to: email,
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Dine Maison</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1F2937; margin-top: 0;">${title}</h2>
            <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">${body}</p>
            
            ${actionText ? `
              <div style="margin: 30px 0;">
                <a href="${fullActionUrl}" style="background: #8B5CF6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">${actionText}</a>
              </div>
            ` : ''}
            
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
            
            <p style="color: #9CA3AF; font-size: 14px; line-height: 1.5;">
              Best regards,<br>
              The Dine Maison Team
            </p>
            
            <p style="color: #9CA3AF; font-size: 12px; margin-top: 20px;">
              You're receiving this because you have notifications enabled for your Dine Maison account.
              <a href="${baseUrl}/notification-settings" style="color: #8B5CF6; text-decoration: none;">Manage preferences</a>
            </p>
          </div>
        </div>
      `,
      text: `${title}\n\n${body}\n\n${actionText ? `${actionText}: ${fullActionUrl}\n\n` : ''}Best regards,\nThe Dine Maison Team`,
    });
  }
}

export const emailService = new EmailService();

// Helper function to send notification email with user lookup
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { NotificationType, type NotificationPayload } from '@shared/notificationTypes';

export async function sendNotificationEmail(
  userId: string,
  notificationType: NotificationType,
  payload: Omit<NotificationPayload, 'type'>
): Promise<boolean> {
  try {
    // Get user email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.email) {
      logger.warn(`No email found for user ${userId}`);
      return false;
    }

    // Extract action URL from payload data
    const actionUrl = payload.data?.url || payload.data?.actionUrl;
    const actionText = getActionTextForNotificationType(notificationType);

    return await emailService.sendNotificationEmail(
      user.email,
      payload.title,
      payload.body,
      actionUrl,
      actionText
    );
  } catch (error) {
    logger.error('Error sending notification email:', error);
    return false;
  }
}

function getActionTextForNotificationType(type: NotificationType): string {
  const actionTexts: Partial<Record<NotificationType, string>> = {
    [NotificationType.BOOKING_REQUESTED]: 'View Booking',
    [NotificationType.BOOKING_CONFIRMED]: 'View Booking Details',
    [NotificationType.BOOKING_CANCELLED]: 'View Cancellation',
    [NotificationType.BOOKING_REMINDER]: 'View Booking',
    [NotificationType.PAYMENT_SUCCESS]: 'View Receipt',
    [NotificationType.PAYMENT_FAILED]: 'Update Payment',
    [NotificationType.MESSAGE_RECEIVED]: 'View Message',
    [NotificationType.REVIEW_RECEIVED]: 'View Review',
  };

  return actionTexts[type] || 'View Details';
}



