# Comprehensive Notification System - Setup Guide

This guide will help you set up and configure the complete notification system for Dine Maison.

## Overview

The notification system supports:
- ✅ Web Push Notifications (VAPID)
- ✅ Mobile Push Notifications (FCM/APNS)
- ✅ Email Notifications
- ✅ SMS Notifications (Twilio)
- ✅ Real-time WebSocket Notifications
- ✅ In-App Notifications
- ✅ User Notification Preferences

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- SMTP server (for email)
- Twilio account (for SMS - optional)
- Firebase project (for mobile push - optional)

## Step 1: Install Dependencies

```bash
npm install firebase-admin twilio
```

The following packages are already installed:
- `web-push` - Web push notifications
- `nodemailer` - Email notifications
- `ws` - WebSocket support

## Step 2: Database Migration

Run the notification system migration:

```bash
# Apply the migration
psql -U your_user -d your_database -f migrations/0004_add_notifications.sql

# Or if using Drizzle
npm run db:push
```

This will create the following tables:
- `notifications` - In-app notification records
- `notification_preferences` - User preferences
- `device_tokens` - Mobile device tokens
- `notification_delivery_log` - Delivery tracking

## Step 3: Environment Variables

Add these to your `.env` file:

```bash
# ============== EXISTING (already configured) ==============
# VAPID Keys for Web Push (already generated)
VAPID_PUBLIC_KEY=your-existing-key
VAPID_PRIVATE_KEY=your-existing-key
VAPID_SUBJECT=mailto:support@dinemaison.com

# SMTP Configuration (already configured)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@dinemaison.com

# ============== NEW (add these) ==============
# Firebase Admin SDK (for mobile push notifications)
# Get from Firebase Console > Project Settings > Service Accounts
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'

# Twilio (for SMS notifications)
# Get from Twilio Console
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Feature Flags
NOTIFICATIONS_SMS_ENABLED=false  # Set to true when ready
NOTIFICATIONS_PUSH_ENABLED=true
NOTIFICATIONS_EMAIL_ENABLED=true
```

## Step 4: Firebase Setup (Mobile Push)

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project or use existing
3. Add iOS app (bundle ID: `com.dinemaison.app`)
4. Add Android app (package: `com.dinemaison.app`)

### Get Service Account Key

1. Go to Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Download JSON file
4. Minify JSON and add to `.env` as `FIREBASE_SERVICE_ACCOUNT_JSON`

```bash
# Minify JSON (remove newlines and spaces)
cat service-account.json | jq -c . > service-account-minified.json
```

### Upload APNs Certificate (iOS)

1. Generate APNs certificate in Apple Developer Portal
2. Upload to Firebase Console > Project Settings > Cloud Messaging > APNs Certificates

## Step 5: Twilio Setup (SMS - Optional)

### Create Twilio Account

1. Go to [Twilio.com](https://www.twilio.com/)
2. Sign up for account
3. Get a phone number (SMS-capable)

### Get Credentials

1. Go to Console Dashboard
2. Copy Account SID and Auth Token
3. Add to `.env` file

### Configure Messaging

1. Set up opt-in compliance
2. Configure message templates
3. Test with your phone number

## Step 6: Web App Integration

### 1. Add Notification Center to Header

Edit `client/src/components/layout/header.tsx`:

```tsx
import { NotificationCenter } from "@/components/notifications/notification-center";

export function Header() {
  return (
    <header>
      {/* ... other header content ... */}
      <NotificationCenter />
    </header>
  );
}
```

### 2. Add Toast Listener to App Root

Edit `client/src/App.tsx`:

```tsx
import { NotificationToastListener } from "@/components/notifications/notification-toast";

export function App() {
  return (
    <>
      <NotificationToastListener />
      {/* ... rest of app ... */}
    </>
  );
}
```

### 3. Add Route for Settings Page

Edit your router configuration:

```tsx
import NotificationSettingsPage from "@/pages/notification-settings";

// Add route
<Route path="/notification-settings" element={<NotificationSettingsPage />} />
```

## Step 7: Integrate with Booking Flow

The notification system is already integrated via `server/bookingNotifications.ts`. 

To trigger notifications in your booking routes, import and use the notification functions:

```typescript
import { notifyBookingRequested, notifyBookingConfirmed } from "./bookingNotifications";

// When a booking is created
await notifyBookingRequested(customerId, chefId, {
  bookingId: booking.id,
  chefName: chef.displayName,
  eventDate: booking.eventDate,
  eventTime: booking.eventTime,
  guestCount: booking.guestCount,
});

// When a booking is confirmed
await notifyBookingConfirmed(customerId, chefId, {
  bookingId: booking.id,
  chefName: chef.displayName,
  eventDate: booking.eventDate,
  eventTime: booking.eventTime,
});
```

### Available Notification Functions

- `notifyBookingRequested(customerId, chefId, bookingData)`
- `notifyBookingConfirmed(customerId, chefId, bookingData)`
- `notifyBookingCancelled(userId, bookingData)`
- `notifyBookingRejected(customerId, bookingData)`
- `notifyBookingReminder(customerId, bookingData)`
- `notifyBookingCompleted(customerId, chefId, bookingData)`
- `notifyPaymentSuccess(userId, paymentData)`
- `notifyPaymentFailed(userId, paymentData)`
- `notifyReviewReceived(chefId, reviewData)`

## Step 8: Mobile App Setup

Follow the detailed guide in `MOBILE_APP_SETUP.md` to:

1. Create React Native or Expo app
2. Configure Firebase
3. Copy mobile starter files
4. Implement notification handling
5. Test on physical devices

## Step 9: Testing

### Test Web Push

1. Visit your web app
2. Grant notification permission when prompted
3. Use test endpoint:

```bash
curl -X POST http://localhost:5000/api/notifications/test/push \
  -H "Cookie: connect.sid=your-session-cookie"
```

### Test Email

```bash
curl -X POST http://localhost:5000/api/notifications/test/email \
  -H "Cookie: connect.sid=your-session-cookie"
```

### Test SMS

```bash
curl -X POST http://localhost:5000/api/notifications/test/sms \
  -H "Cookie: connect.sid=your-session-cookie"
```

### Test End-to-End Flow

1. Create a test booking
2. Verify notifications are sent via all enabled channels
3. Check notification preferences work
4. Test mark as read functionality
5. Verify WebSocket real-time updates

## Step 10: Monitoring and Logging

### Check Notification Logs

```sql
-- View recent notifications
SELECT * FROM notifications 
ORDER BY created_at DESC 
LIMIT 20;

-- Check delivery status
SELECT 
  channel, 
  status, 
  COUNT(*) as count 
FROM notification_delivery_log 
GROUP BY channel, status;

-- Find failed deliveries
SELECT * FROM notification_delivery_log 
WHERE status = 'failed' 
ORDER BY sent_at DESC;
```

### Application Logs

Check server logs for notification-related messages:

```bash
# Look for notification service logs
grep -i "notification" logs/server.log

# Check for errors
grep -i "error.*notification" logs/server.log
```

## Architecture Overview

```
┌─────────────────┐
│  Booking Event  │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Notification Service│
│  (Core Dispatcher)  │
└────────┬────────────┘
         │
         ├────► Check User Preferences
         │
         ▼
    ┌────────────────────┐
    │  Channel Router     │
    └─┬──┬──┬──┬──┬──┬───┘
      │  │  │  │  │  │
      ▼  ▼  ▼  ▼  ▼  ▼
   Push Email SMS WS In-App Log
```

## API Endpoints

### Notification Preferences
- `GET /api/notifications/preferences` - Get user preferences
- `PUT /api/notifications/preferences` - Update preferences
- `POST /api/notifications/preferences/reset` - Reset to defaults

### Device Management
- `POST /api/notifications/devices/register` - Register mobile device
- `DELETE /api/notifications/devices/:deviceId` - Unregister device
- `GET /api/notifications/devices` - List user's devices

### In-App Notifications
- `GET /api/notifications/in-app` - Get notifications (paginated)
- `GET /api/notifications/in-app/unread-count` - Get unread count
- `PATCH /api/notifications/in-app/:id/read` - Mark as read
- `DELETE /api/notifications/in-app/:id` - Delete notification

### Testing
- `POST /api/notifications/test/push` - Send test push
- `POST /api/notifications/test/email` - Send test email
- `POST /api/notifications/test/sms` - Send test SMS

## Troubleshooting

### Web Push Not Working

**Problem**: Notifications not received in browser
- Check: VAPID keys are configured
- Check: Service worker is registered
- Check: Notification permission is granted
- Check: Browser supports push notifications

**Solution**:
```bash
# Regenerate VAPID keys if needed
npm run pwa:vapid
```

### Mobile Push Not Working

**Problem**: Notifications not received on mobile
- Check: Firebase is configured correctly
- Check: Service account JSON is valid
- Check: Device token is registered
- Check: Testing on physical device (not simulator)

### Email Not Sending

**Problem**: Email notifications not delivered
- Check: SMTP credentials are correct
- Check: SMTP server is reachable
- Check: Email is not in spam folder
- Check: Server logs for errors

### SMS Not Sending

**Problem**: SMS notifications not delivered
- Check: Twilio credentials are correct
- Check: Phone number is verified
- Check: SMS feature flag is enabled
- Check: User has phone number and it's verified

### WebSocket Not Connecting

**Problem**: Real-time notifications not working
- Check: WebSocket URL is correct
- Check: WebSocket server is running
- Check: Firewall allows WebSocket connections
- Check: Browser supports WebSocket

## Performance Considerations

### Rate Limiting

Implement rate limiting per user:

```typescript
// In notificationService.ts
const RATE_LIMIT = 10; // notifications per minute per user
```

### Queue System

For high volume, consider adding a queue:

```bash
npm install bull bullmq
```

### Database Indexing

Ensure indexes exist:

```sql
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id) WHERE is_read = false;
```

## Production Checklist

- [ ] All environment variables configured
- [ ] Database migration applied
- [ ] VAPID keys generated (web push)
- [ ] Firebase project configured (mobile push)
- [ ] Twilio account configured (SMS)
- [ ] SMTP server configured (email)
- [ ] SSL/TLS enabled for production
- [ ] Rate limiting implemented
- [ ] Error monitoring (Sentry/similar) configured
- [ ] Notification templates reviewed
- [ ] User preferences tested
- [ ] Mobile apps tested on physical devices
- [ ] Performance tested under load
- [ ] Backup strategy for notification data
- [ ] GDPR compliance verified
- [ ] Privacy policy updated
- [ ] Terms of service updated

## Support

For issues or questions:
1. Check logs: `grep -i notification logs/server.log`
2. Check database: Verify tables exist and have data
3. Test individual channels separately
4. Review environment variables
5. Check Firebase/Twilio console for errors

## Next Steps

1. Set up monitoring and alerts
2. Implement notification analytics
3. Add A/B testing for notification content
4. Create notification templates for more event types
5. Implement notification scheduling
6. Add notification history export
7. Create admin dashboard for monitoring
8. Implement notification batching
