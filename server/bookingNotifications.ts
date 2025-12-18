/**
 * Booking Notification Integration
 * Sends notifications for booking-related events
 */

import { sendNotification } from "./notificationService";
import { NotificationType } from "@shared/notificationTypes";
import { logger } from "./lib/logger";
import { format } from "date-fns";

/**
 * Send notification when a booking is requested
 */
export async function notifyBookingRequested(
  customerId: string,
  chefId: string,
  bookingData: {
    bookingId: string;
    chefName: string;
    eventDate: Date;
    eventTime: string;
    guestCount: number;
  }
) {
  try {
    // Notify customer
    await sendNotification(customerId, NotificationType.BOOKING_REQUESTED, {
      title: "Booking Request Sent",
      body: `Your booking request with ${bookingData.chefName} for ${format(bookingData.eventDate, "MMMM d, yyyy")} has been sent.`,
      data: {
        bookingId: bookingData.bookingId,
        chefName: bookingData.chefName,
        url: "/dashboard?tab=bookings",
      },
    });

    // Notify chef (you can create a CHEF_BOOKING_RECEIVED type if needed)
    await sendNotification(chefId, NotificationType.BOOKING_REQUESTED, {
      title: "New Booking Request!",
      body: `New booking request for ${format(bookingData.eventDate, "MMMM d, yyyy")} at ${bookingData.eventTime} for ${bookingData.guestCount} guests.`,
      data: {
        bookingId: bookingData.bookingId,
        url: "/dashboard?tab=bookings",
      },
    });

    logger.info(`Booking requested notifications sent for booking ${bookingData.bookingId}`);
  } catch (error) {
    logger.error("Error sending booking requested notifications:", error);
  }
}

/**
 * Send notification when a booking is confirmed
 */
export async function notifyBookingConfirmed(
  customerId: string,
  chefId: string,
  bookingData: {
    bookingId: string;
    chefName: string;
    eventDate: Date;
    eventTime: string;
  }
) {
  try {
    await sendNotification(customerId, NotificationType.BOOKING_CONFIRMED, {
      title: "Booking Confirmed! 🎉",
      body: `${bookingData.chefName} has confirmed your booking for ${format(bookingData.eventDate, "MMMM d, yyyy")} at ${bookingData.eventTime}.`,
      data: {
        bookingId: bookingData.bookingId,
        chefName: bookingData.chefName,
        eventDate: bookingData.eventDate.toISOString(),
        url: "/dashboard?tab=bookings",
      },
    });

    logger.info(`Booking confirmed notification sent for booking ${bookingData.bookingId}`);
  } catch (error) {
    logger.error("Error sending booking confirmed notification:", error);
  }
}

/**
 * Send notification when a booking is cancelled
 */
export async function notifyBookingCancelled(
  userId: string,
  bookingData: {
    bookingId: string;
    chefName: string;
    eventDate: Date;
    cancelledBy: "customer" | "chef";
  }
) {
  try {
    const message =
      bookingData.cancelledBy === "customer"
        ? `Your booking with ${bookingData.chefName} for ${format(bookingData.eventDate, "MMMM d, yyyy")} has been cancelled.`
        : `${bookingData.chefName} has cancelled your booking for ${format(bookingData.eventDate, "MMMM d, yyyy")}.`;

    await sendNotification(userId, NotificationType.BOOKING_CANCELLED, {
      title: "Booking Cancelled",
      body: message,
      data: {
        bookingId: bookingData.bookingId,
        url: "/dashboard?tab=bookings",
      },
    });

    logger.info(`Booking cancelled notification sent for booking ${bookingData.bookingId}`);
  } catch (error) {
    logger.error("Error sending booking cancelled notification:", error);
  }
}

/**
 * Send notification when a booking is rejected
 */
export async function notifyBookingRejected(
  customerId: string,
  bookingData: {
    bookingId: string;
    chefName: string;
    eventDate: Date;
  }
) {
  try {
    await sendNotification(customerId, NotificationType.BOOKING_REJECTED, {
      title: "Booking Request Declined",
      body: `Unfortunately, ${bookingData.chefName} is unable to accommodate your booking request for ${format(bookingData.eventDate, "MMMM d, yyyy")}.`,
      data: {
        bookingId: bookingData.bookingId,
        url: "/dashboard?tab=bookings",
      },
    });

    logger.info(`Booking rejected notification sent for booking ${bookingData.bookingId}`);
  } catch (error) {
    logger.error("Error sending booking rejected notification:", error);
  }
}

/**
 * Send reminder notification 24 hours before booking
 */
export async function notifyBookingReminder(
  customerId: string,
  bookingData: {
    bookingId: string;
    chefName: string;
    eventDate: Date;
    eventTime: string;
    eventAddress: string;
  }
) {
  try {
    await sendNotification(customerId, NotificationType.BOOKING_REMINDER, {
      title: "Booking Reminder ⏰",
      body: `Your experience with ${bookingData.chefName} is tomorrow at ${bookingData.eventTime}. Location: ${bookingData.eventAddress}`,
      data: {
        bookingId: bookingData.bookingId,
        url: "/dashboard?tab=bookings",
      },
    });

    logger.info(`Booking reminder sent for booking ${bookingData.bookingId}`);
  } catch (error) {
    logger.error("Error sending booking reminder:", error);
  }
}

/**
 * Send notification when a booking is completed
 */
export async function notifyBookingCompleted(
  customerId: string,
  chefId: string,
  bookingData: {
    bookingId: string;
    chefName: string;
  }
) {
  try {
    // Notify customer to leave a review
    await sendNotification(customerId, NotificationType.BOOKING_COMPLETED, {
      title: "How was your experience?",
      body: `We hope you enjoyed your experience with ${bookingData.chefName}! Please take a moment to leave a review.`,
      data: {
        bookingId: bookingData.bookingId,
        url: `/dashboard?tab=bookings&review=${bookingData.bookingId}`,
      },
    });

    logger.info(`Booking completed notification sent for booking ${bookingData.bookingId}`);
  } catch (error) {
    logger.error("Error sending booking completed notification:", error);
  }
}

/**
 * Send notification for payment success
 */
export async function notifyPaymentSuccess(
  userId: string,
  paymentData: {
    bookingId: string;
    amount: number;
    chefName: string;
  }
) {
  try {
    await sendNotification(userId, NotificationType.PAYMENT_SUCCESS, {
      title: "Payment Successful ✓",
      body: `Your payment of $${paymentData.amount.toFixed(2)} for your booking with ${paymentData.chefName} was successful.`,
      data: {
        bookingId: paymentData.bookingId,
        amount: paymentData.amount,
        url: "/dashboard?tab=bookings",
      },
    });

    logger.info(`Payment success notification sent for booking ${paymentData.bookingId}`);
  } catch (error) {
    logger.error("Error sending payment success notification:", error);
  }
}

/**
 * Send notification for payment failure
 */
export async function notifyPaymentFailed(
  userId: string,
  paymentData: {
    bookingId: string;
    amount: number;
    reason?: string;
  }
) {
  try {
    await sendNotification(userId, NotificationType.PAYMENT_FAILED, {
      title: "Payment Failed",
      body: `Your payment of $${paymentData.amount.toFixed(2)} could not be processed. ${paymentData.reason || "Please update your payment method."}`,
      data: {
        bookingId: paymentData.bookingId,
        url: `/dashboard?tab=bookings&payment=${paymentData.bookingId}`,
      },
    });

    logger.info(`Payment failed notification sent for booking ${paymentData.bookingId}`);
  } catch (error) {
    logger.error("Error sending payment failed notification:", error);
  }
}

/**
 * Send notification when a review is received
 */
export async function notifyReviewReceived(
  chefId: string,
  reviewData: {
    reviewId: string;
    customerName: string;
    rating: number;
  }
) {
  try {
    await sendNotification(chefId, NotificationType.REVIEW_RECEIVED, {
      title: "New Review Received",
      body: `${reviewData.customerName} left you a ${reviewData.rating}-star review!`,
      data: {
        reviewId: reviewData.reviewId,
        rating: reviewData.rating,
        url: "/dashboard?tab=reviews",
      },
    });

    logger.info(`Review notification sent for review ${reviewData.reviewId}`);
  } catch (error) {
    logger.error("Error sending review notification:", error);
  }
}
