# Notification System - Quick Start Guide

Get the notification system up and running in 5 steps!

## Step 1: Run Database Migration (2 minutes)

```bash
# Apply the migration
psql -U your_username -d dinemaison -f migrations/0004_add_notifications.sql

# Or if using Drizzle
npm run db:push
```

**Verify:**
```sql
\dt  # Should show notifications, notification_preferences, device_tokens, notification_delivery_log
```

## Step 2: Configure Environment Variables (3 minutes)

Add to your `.env` file:

```bash
# Optional but recommended for full functionality
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project",...}'
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Feature flags (set to true when ready)
NOTIFICATIONS_SMS_ENABLED=false
NOTIFICATIONS_PUSH_ENABLED=true
NOTIFICATIONS_EMAIL_ENABLED=true
```

**Note:** Web push and email already work with your existing VAPID and SMTP config!

## Step 3: Add to Web UI (5 minutes)

### A. Add Notification Center to Header

Edit `client/src/components/layout/header.tsx`:

```tsx
import { NotificationCenter } from "@/components/notifications/notification-center";

// Add inside your header component
<NotificationCenter />
```

### B. Add Toast Listener to App

Edit `client/src/App.tsx`:

```tsx
import { NotificationToastListener } from "@/components/notifications/notification-toast";

export default function App() {
  return (
    <>
      <NotificationToastListener />
      {/* rest of your app */}
    </>
  );
}
```

### C. Add Settings Route

In your router configuration:

```tsx
import NotificationSettingsPage from "@/pages/notification-settings";

// Add route
<Route path="/notification-settings" element={<NotificationSettingsPage />} />
```

## Step 4: Test It! (2 minutes)

Start your server and visit your app:

```bash
npm run dev
```

### Test Web Push:

1. Visit the app in your browser
2. Allow notifications when prompted
3. Open a new terminal and test:

```bash
# Get your session cookie from browser dev tools (Application > Cookies)
curl -X POST http://localhost:5000/api/notifications/test/push \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE_HERE"
```

You should see a browser notification!

### Test In-App:

Click the bell icon in the header - you should see your test notification.

### Test Email:

```bash
curl -X POST http://localhost:5000/api/notifications/test/email \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE_HERE"
```

Check your email inbox!

## Step 5: Integrate with Bookings (5 minutes)

In your booking creation route (e.g., `server/routes.ts`):

```typescript
// At the top of the file
import { notifyBookingRequested } from "./bookingNotifications";

// After creating a booking
await notifyBookingRequested(customerId, chefId, {
  bookingId: newBooking.id,
  chefName: chef.displayName,
  eventDate: newBooking.eventDate,
  eventTime: newBooking.eventTime,
  guestCount: newBooking.guestCount,
});
```

**Test:** Create a test booking and verify you receive notifications!

## Done! 🎉

You now have a working notification system with:
- ✅ In-app notifications with bell icon
- ✅ Web push notifications
- ✅ Email notifications
- ✅ Real-time WebSocket updates
- ✅ User preference settings
- ✅ Booking integration ready

## What's Next?

### Immediate:
1. Add more booking event notifications (confirmed, cancelled, etc.)
2. Customize notification templates in `server/bookingNotifications.ts`
3. Test notification settings page at `/notification-settings`

### When Ready:
1. Set up Firebase for mobile push (see `MOBILE_APP_SETUP.md`)
2. Enable SMS notifications with Twilio
3. Create mobile app with `mobile-app-starter/` files

## Troubleshooting

### "No notifications showing"
- Check: Did migration run successfully?
- Check: Is user authenticated?
- Check: Browser console for errors

### "Push notifications not working"
- Check: Did you allow notifications in browser?
- Check: VAPID keys in .env are correct
- Check: Service worker is registered (check in browser dev tools)

### "Email not sending"
- Check: SMTP credentials in .env
- Check: Check server logs for errors
- Check: Email might be in spam folder

## API Endpoints Reference

```bash
# Get preferences
GET /api/notifications/preferences

# Update preferences
PUT /api/notifications/preferences
Body: { "booking_confirmed": { "push": true, "email": true, "sms": false, "inApp": true } }

# Get notifications
GET /api/notifications/in-app?limit=20

# Get unread count
GET /api/notifications/in-app/unread-count

# Mark as read
PATCH /api/notifications/in-app/:id/read

# Delete notification
DELETE /api/notifications/in-app/:id

# Test push
POST /api/notifications/test/push

# Test email
POST /api/notifications/test/email

# Test SMS (if configured)
POST /api/notifications/test/sms
```

## Quick Code Snippets

### Send Custom Notification

```typescript
import { sendNotification } from "./notificationService";
import { NotificationType } from "@shared/notificationTypes";

await sendNotification(userId, NotificationType.SYSTEM_ANNOUNCEMENT, {
  title: "New Feature Available!",
  body: "Check out our new menu customization feature.",
  data: { url: "/features/menu-customization" }
});
```

### Send to Multiple Users

```typescript
const userIds = ["user1", "user2", "user3"];

await Promise.all(
  userIds.map(userId =>
    sendNotification(userId, NotificationType.BOOKING_REMINDER, {
      title: "Reminder",
      body: "Your booking is tomorrow!"
    })
  )
);
```

### Check if User Has Notifications Enabled

```typescript
import { getPreferencesForType, isChannelEnabled } from "./notificationPreferences";
import { NotificationType, NotificationChannel } from "@shared/notificationTypes";

const enabled = await isChannelEnabled(
  userId,
  NotificationType.BOOKING_CONFIRMED,
  NotificationChannel.PUSH
);
```

## Support

For detailed documentation:
- **Setup Guide**: `NOTIFICATION_SYSTEM_SETUP.md`
- **Complete Reference**: `NOTIFICATION_SYSTEM_COMPLETE.md`
- **Mobile Setup**: `MOBILE_APP_SETUP.md`

Need help? Check the troubleshooting sections in the full documentation!

