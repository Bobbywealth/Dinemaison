# PWA Setup & Configuration Guide

This guide covers the setup and configuration of Progressive Web App (PWA) features for Dine Maison.

## 🚀 Features Implemented

### Core PWA Features
- ✅ **App Installation** - Add to Home Screen functionality for iOS and Android
- ✅ **Offline Support** - Service worker with intelligent caching strategies
- ✅ **Update Prompts** - Automatic app update notifications
- ✅ **Push Notifications** - Real-time notifications for bookings and messages
- ✅ **Native Features** - Share API, Geolocation, Camera access
- ✅ **Network Status** - Offline/online detection with user feedback

### Caching Strategy

The app implements a multi-layered caching strategy:

1. **CacheFirst** - Static assets (JS, CSS, images, fonts)
   - Fast loading from cache
   - 30-day cache for images
   - 1-year cache for fonts

2. **NetworkFirst** - API calls
   - Tries network first with 10s timeout
   - Falls back to cache when offline
   - 24-hour cache for API responses

3. **StaleWhileRevalidate** - Google Fonts
   - Serves cached version immediately
   - Updates in background

## 📋 Initial Setup

### 1. Generate VAPID Keys for Push Notifications

Push notifications require VAPID keys. Generate them with:

```bash
npx web-push generate-vapid-keys
```

This will output:
```
Public Key: BHx...abc
Private Key: xyz...123
```

### 2. Configure Environment Variables

Create or update your `.env` file with the VAPID keys:

```env
# Push Notifications (Web Push)
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:support@dinemaison.com
```

### 3. Run Database Migration

Apply the push subscriptions table migration:

```bash
# Using your database tool
psql -d your_database < migrations/0003_add_push_subscriptions.sql

# Or if using drizzle-kit
npm run db:push
```

### 4. Install and Start

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎨 PWA Assets

### Icons
All PWA icons have been generated in `/client/public/`:
- `pwa-64x64.png` - Small icon
- `pwa-192x192.png` - Standard icon
- `pwa-512x512.png` - Large icon
- `maskable-icon-512x512.png` - Maskable icon (with safe zone for Android)

### Screenshots
Placeholder screenshots generated:
- `screenshot-mobile.png` (390x844) - For mobile install prompts
- `screenshot-desktop.png` (1920x1080) - For desktop install prompts

**⚠️ Important:** Replace placeholder screenshots with actual app screenshots for better user experience.

## 📱 Testing PWA Features

### Test on Mobile (Recommended)

#### iOS (Safari)
1. Open the app in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. The app will install with your custom icon

#### Android (Chrome)
1. Open the app in Chrome
2. A custom install prompt will appear after 3 seconds
3. Or use browser menu → "Install app"
4. The app will install with your custom icon

### Test on Desktop

#### Chrome/Edge
1. Look for install icon in address bar
2. Click to install
3. App opens in standalone window

### Test in Development

PWA features are enabled in development mode:
```bash
npm run dev
# Open http://localhost:5173
```

The service worker will register and you can test:
- Install prompts
- Offline functionality (disable network in DevTools)
- Push notifications (after configuring VAPID keys)

## 🔔 Push Notifications

### How It Works

1. **User Opts In** - User enables notifications in settings
2. **Subscription Created** - Browser creates push subscription
3. **Stored in DB** - Subscription saved to `push_subscriptions` table
4. **Server Sends** - Backend sends notifications via Web Push API

### Notification Types

The system sends notifications for:
- **Booking Confirmation** - When user creates a booking
- **Booking Accepted** - When chef accepts the booking
- **Booking Reminder** - 24 hours before event
- **New Message** - When chef/user sends a message

### Testing Push Notifications

#### 1. Enable Notifications
```typescript
// In browser console or UI
import { requestNotificationPermission, subscribeToPushNotifications } from '@/lib/push-notifications';

await requestNotificationPermission();
await subscribeToPushNotifications();
```

#### 2. Send Test Notification
Make authenticated request:
```bash
curl -X POST http://localhost:3456/api/notifications/test \
  -H "Content-Type: application/json" \
  -b "cookies.txt"
```

Or use the NotificationSettings component in the app.

### Adding Custom Notifications

In your server code:
```typescript
import { sendPushNotification } from './pushNotificationService';

await sendPushNotification(userId, {
  title: "Custom Title",
  body: "Custom message",
  data: { customData: "value" },
  actions: [
    { action: "view", title: "View" },
    { action: "dismiss", title: "Dismiss" }
  ]
});
```

## 🌍 Native Mobile Features

### Share API

Share content from the app:

```typescript
import { ShareButton } from '@/components/pwa/share-button';

// In your component
<ShareButton 
  title="Check out this chef"
  text="Amazing private chef!"
  url="/chefs/123"
/>
```

Or programmatically:
```typescript
import { shareChefProfile } from '@/lib/native-features';

await shareChefProfile("Chef Name", "chef-id");
```

### Geolocation

Find nearby chefs:

```typescript
import { useGeolocation } from '@/hooks/use-geolocation';

function MyComponent() {
  const { location, loading, getLocation } = useGeolocation();
  
  return (
    <button onClick={getLocation}>
      Find Nearby Chefs
    </button>
  );
}
```

### Camera/Image Upload

```typescript
import { pickImage } from '@/lib/native-features';

// Pick from gallery or camera
const file = await pickImage("image/*");
if (file) {
  // Upload the file
}
```

### Network Status

Automatically shows when user goes offline/online:
```typescript
import { NetworkStatus } from '@/components/pwa/network-status';

// Already added to App.tsx, no action needed
```

## 🔧 Configuration Options

### Manifest (vite.config.ts)

Customize the PWA manifest:
```typescript
manifest: {
  name: "Your App Name",
  short_name: "Short Name",
  theme_color: "#your-color",
  background_color: "#your-bg-color",
  display: "standalone", // or "fullscreen", "minimal-ui"
  orientation: "portrait", // or "any", "landscape"
  // ... other options
}
```

### Service Worker (vite.config.ts)

Adjust caching strategies:
```typescript
workbox: {
  runtimeCaching: [
    {
      urlPattern: /your-api-pattern/,
      handler: "NetworkFirst", // or "CacheFirst", "StaleWhileRevalidate"
      options: {
        cacheName: "your-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        }
      }
    }
  ]
}
```

## 📊 Monitoring & Analytics

### Check Service Worker Status

In browser DevTools:
1. Application → Service Workers
2. Check registration status
3. View cache storage
4. Test offline functionality

### Check Push Subscription

```typescript
import { isPushSubscribed } from '@/lib/push-notifications';

const subscribed = await isPushSubscribed();
console.log('Push subscribed:', subscribed);
```

### Storage Usage

```typescript
import { getStorageEstimate } from '@/lib/native-features';

const estimate = await getStorageEstimate();
console.log('Storage used:', estimate.usage);
console.log('Storage quota:', estimate.quota);
```

## 🐛 Troubleshooting

### Service Worker Not Registering

1. Check HTTPS (required for PWA)
2. Check browser console for errors
3. Verify `vite.config.ts` configuration
4. Clear browser cache and hard reload

### Push Notifications Not Working

1. Verify VAPID keys are set in `.env`
2. Check notification permissions in browser
3. Verify subscription in database
4. Check server logs for errors
5. Test with the `/api/notifications/test` endpoint

### Install Prompt Not Showing

1. PWA criteria must be met (manifest, service worker, HTTPS)
2. User may have dismissed it (wait 7 days for retry)
3. Clear browser cache
4. Check manifest is valid (DevTools → Application → Manifest)

### Offline Mode Not Working

1. Service worker must be registered
2. Check cache storage in DevTools
3. Verify caching strategies in `vite.config.ts`
4. Test with DevTools offline mode

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] VAPID keys configured in production environment
- [ ] Database migration applied
- [ ] Real app screenshots uploaded
- [ ] Manifest colors match brand
- [ ] Icons look good on all platforms
- [ ] HTTPS enabled (required for PWA)
- [ ] Service worker caching tested
- [ ] Push notifications tested

### Environment Variables

Ensure these are set in production:
```env
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:support@dinemaison.com
DATABASE_URL=...
NODE_ENV=production
```

### Build Command

```bash
npm run build
```

This will:
1. Build the frontend with Vite
2. Generate service worker
3. Create optimized bundles
4. Output to `dist/public`

## 📚 Additional Resources

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev: PWA](https://web.dev/progressive-web-apps/)
- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

## 🎉 Success!

Your PWA is now configured with:
- ✅ Installable on mobile and desktop
- ✅ Works offline with smart caching
- ✅ Push notifications for user engagement
- ✅ Native-like mobile features
- ✅ Automatic updates

Users can now install Dine Maison and use it like a native app!



