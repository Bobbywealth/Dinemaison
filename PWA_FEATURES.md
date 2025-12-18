# Progressive Web App (PWA) Features

## Overview

Dine Maison has been enhanced with comprehensive PWA capabilities, providing a native app-like experience on mobile and desktop devices.

## ✨ Key Features

### 1. App Installation
- **Add to Home Screen** - Users can install the app on their device
- **Custom Install Prompt** - Branded install prompt with dismissal tracking
- **Platform Support** - Works on iOS (Safari), Android (Chrome), and Desktop
- **Standalone Mode** - App runs in its own window without browser UI

### 2. Offline Support
- **Smart Caching** - Intelligent caching of assets and API responses
- **Offline Page** - Custom offline experience when network unavailable
- **Background Sync** - Queue actions when offline, sync when online
- **Cache Management** - Automatic cleanup of outdated caches

### 3. Push Notifications
- **Booking Updates** - Notifications for booking status changes
- **Chef Messages** - Alerts for new messages from chefs
- **Reminders** - 24-hour booking reminders
- **Permission Management** - Easy opt-in/opt-out in settings
- **Multi-device Support** - Works across all user devices

### 4. Native Mobile Features
- **Web Share API** - Share chef profiles and bookings
- **Geolocation** - Find nearby chefs based on location
- **Camera Access** - Upload photos using device camera
- **Network Status** - Real-time online/offline detection
- **Clipboard API** - Copy links and text easily

### 5. Performance Optimizations
- **Service Worker** - Background processing for better performance
- **Asset Precaching** - Critical assets cached on install
- **Runtime Caching** - Dynamic content cached as needed
- **Update Management** - Seamless app updates

## 🎯 User Experience

### For Customers

#### Discovery
- Beautiful install prompt appears after 3 seconds on first visit
- Clear benefits: offline access, notifications, faster loading
- "Not Now" option with 7-day cooldown

#### Installation
- One-tap install on mobile devices
- Custom app icon on home screen
- Splash screen with branding
- Standalone app experience

#### Offline Usage
- Browse previously loaded chefs
- View cached bookings
- Review saved menus
- Graceful offline fallback page

#### Notifications
- Opt-in notification settings in dashboard
- Rich notifications with action buttons
- Booking confirmations and updates
- Chef messages and reminders

### For Chefs

#### Mobile-First
- Optimized for mobile chef management
- Quick access from home screen
- Fast loading even on slow networks
- Share profile with potential clients

#### Engagement
- Push notifications for new bookings
- Message alerts from customers
- Booking reminders
- Rating notifications

## 🔧 Technical Implementation

### Architecture

```
┌─────────────────────────────────────────────┐
│           PWA Application Layer             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────┐  ┌──────────────────────┐│
│  │ Service     │  │  Native Features     ││
│  │ Worker      │  │  - Share API         ││
│  │             │  │  - Geolocation       ││
│  │ - Caching   │  │  - Camera            ││
│  │ - Precache  │  │  - Network Status    ││
│  │ - Runtime   │  └──────────────────────┘│
│  │ - Updates   │                          │
│  └─────────────┘                          │
│                                             │
│  ┌─────────────┐  ┌──────────────────────┐│
│  │ Manifest    │  │  Push Notifications  ││
│  │             │  │                      ││
│  │ - Icons     │  │  - VAPID Keys        ││
│  │ - Colors    │  │  - Subscriptions     ││
│  │ - Display   │  │  - Backend Service   ││
│  │ - Metadata  │  └──────────────────────┘│
│  └─────────────┘                          │
│                                             │
└─────────────────────────────────────────────┘
```

### Components

#### Frontend
- `/client/src/components/pwa/` - PWA UI components
  - `install-prompt.tsx` - Installation prompt UI
  - `update-prompt.tsx` - Update notification
  - `notification-settings.tsx` - Push notification controls
  - `share-button.tsx` - Share functionality
  - `network-status.tsx` - Online/offline indicator

- `/client/src/lib/` - Core PWA logic
  - `push-notifications.ts` - Push notification utilities
  - `native-features.ts` - Native API wrappers

- `/client/src/hooks/` - React hooks
  - `use-share.ts` - Share API hook
  - `use-geolocation.ts` - Location hook
  - `use-network-status.ts` - Network monitoring

#### Backend
- `/server/pushNotificationService.ts` - Push notification backend
- `POST /api/notifications/subscribe` - Save subscription
- `POST /api/notifications/unsubscribe` - Remove subscription
- `GET /api/notifications/vapid-public-key` - Get public key
- `POST /api/notifications/test` - Test notification

#### Database
- `push_subscriptions` table - Stores user subscriptions
  - Indexes on user_id and endpoint
  - Unique constraint per user/endpoint pair

### Configuration

#### vite.config.ts
```typescript
VitePWA({
  registerType: "prompt",
  workbox: {
    // Caching strategies
    runtimeCaching: [...]
  },
  manifest: {
    // App metadata
  }
})
```

#### Environment Variables
```env
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:support@...
```

## 📱 Platform-Specific Features

### iOS
- Apple Touch Icon (180x180)
- Status bar styling
- Splash screen
- Safe area support
- Add to Home Screen instructions

### Android
- Maskable icon with safe zone
- Theme color in address bar
- Web App Manifest
- Install banner
- Chrome custom tabs support

### Desktop
- Window mode controls
- Keyboard shortcuts
- System notifications
- Taskbar/dock integration

## 🚀 Getting Started

### Quick Start
```bash
# Generate all PWA assets and keys
npm run pwa:setup

# Or individually:
npm run pwa:icons        # Generate icons
npm run pwa:screenshots  # Generate screenshots
npm run pwa:vapid       # Generate VAPID keys
```

### Detailed Setup
See [PWA_SETUP.md](./PWA_SETUP.md) for complete setup instructions.

## 📊 Metrics & Analytics

### Key Metrics to Track
- Install rate (users who install vs visitors)
- Offline usage (service worker cache hits)
- Push notification engagement (CTR)
- Update acceptance rate
- Share API usage

### Browser DevTools
- **Application Tab** - View manifest, service worker, caches
- **Network Tab** - Check offline functionality
- **Console** - Debug service worker lifecycle

## 🎨 Customization

### Branding
- Update icons in `/client/public/`
- Modify theme colors in manifest
- Replace screenshot placeholders
- Customize splash screen

### Notifications
- Add custom notification types in `pushNotificationService.ts`
- Customize notification templates
- Add notification actions
- Configure notification timing

### Caching
- Adjust cache expiration times
- Add/remove cached routes
- Configure cache sizes
- Choose caching strategies

## 🔐 Security

### Best Practices
- ✅ HTTPS required for service workers
- ✅ VAPID keys stored as environment variables
- ✅ Push subscriptions associated with authenticated users
- ✅ Endpoint validation on subscription
- ✅ Automatic cleanup of invalid subscriptions

### Privacy
- Notifications require explicit user consent
- Location access requires permission
- Camera access requires permission
- Users can unsubscribe anytime
- No tracking without consent

## 🐛 Common Issues

### Service Worker Not Updating
```bash
# Force update in browser
Shift + Reload

# Or clear service worker
DevTools → Application → Service Workers → Unregister
```

### Push Notifications Not Received
1. Check VAPID keys in environment
2. Verify subscription in database
3. Test with `/api/notifications/test`
4. Check browser notification permissions

### Install Prompt Not Showing
1. Must use HTTPS (or localhost)
2. Must have valid manifest
3. Must have service worker
4. User may have dismissed (7-day cooldown)

## 📈 Future Enhancements

Potential additions:
- Background sync for offline actions
- Periodic background sync for updates
- Web Bluetooth for kitchen devices
- Web NFC for payment/check-in
- Advanced caching strategies
- Offline form submissions
- Media caching for recipes
- P2P sync between devices

## 📚 Resources

- [PWA Setup Guide](./PWA_SETUP.md) - Detailed setup instructions
- [MDN PWA Docs](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

## ✅ Checklist

Production PWA Checklist:
- [ ] Icons generated and optimized
- [ ] Real app screenshots uploaded
- [ ] VAPID keys configured
- [ ] Database migration applied
- [ ] HTTPS enabled
- [ ] Manifest validated
- [ ] Service worker tested
- [ ] Push notifications tested
- [ ] Offline functionality verified
- [ ] Install prompt working
- [ ] Update prompt working
- [ ] Share functionality tested
- [ ] Performance audited with Lighthouse

## 🎉 Success!

Your app now provides a world-class Progressive Web App experience with:
- Native app-like installation
- Reliable offline functionality  
- Engaging push notifications
- Native mobile features
- Superior performance

Users can enjoy Dine Maison anywhere, anytime, on any device!
