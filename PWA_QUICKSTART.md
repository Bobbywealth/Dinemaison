# PWA Quick Start Guide

Get your PWA up and running in 5 minutes!

## 🚀 Setup (One-Time)

### Step 1: Generate PWA Assets
```bash
npm run pwa:setup
```

This will:
- ✅ Generate all PWA icons (64x64, 192x192, 512x512, maskable)
- ✅ Create screenshot placeholders
- ✅ Generate VAPID keys for push notifications
- ✅ Create/update .env file

### Step 2: Run Database Migration
```bash
# Connect to your database and run:
psql -d dinemaison < migrations/0003_add_push_subscriptions.sql

# Or using your preferred method
```

### Step 3: Verify Environment Variables
Check your `.env` file has:
```env
VAPID_PUBLIC_KEY=BHx...
VAPID_PRIVATE_KEY=xyz...
VAPID_SUBJECT=mailto:support@dinemaison.com
```

## ✅ You're Done!

Start the app:
```bash
npm run dev
```

Visit: http://localhost:5173

## 🎯 Test PWA Features

### 1. Install Prompt
- Wait 3 seconds after page load
- Custom install prompt will appear
- Click "Install App"

### 2. Offline Mode
- Open DevTools → Network tab
- Check "Offline"
- Refresh page
- See custom offline page

### 3. Push Notifications
- Go to Dashboard → Settings (when implemented)
- Or use NotificationSettings component
- Click "Enable Notifications"
- Send test notification from backend

### 4. Share Feature
- Use ShareButton component anywhere
- Click to share via native dialog
- Falls back to clipboard if unsupported

### 5. Network Status
- Go offline/online
- See automatic status indicators

## 📱 Test on Mobile

### iOS
1. Open in Safari
2. Tap Share button (square with arrow)
3. Scroll and tap "Add to Home Screen"
4. App icon appears on home screen
5. Tap icon to open in standalone mode

### Android
1. Open in Chrome
2. Wait for install prompt (or tap "..." menu → "Install app")
3. Tap "Install"
4. App icon appears on home screen
5. Tap icon to open

## 📚 Full Documentation

- [PWA_SETUP.md](./PWA_SETUP.md) - Detailed setup guide
- [PWA_FEATURES.md](./PWA_FEATURES.md) - All features explained
- [PWA_IMPLEMENTATION_SUMMARY.md](./PWA_IMPLEMENTATION_SUMMARY.md) - Implementation details

## 🎉 That's It!

Your PWA is ready with:
- ✅ App installation on all platforms
- ✅ Offline support with smart caching
- ✅ Push notifications (when VAPID keys configured)
- ✅ Native mobile features (share, location, camera)
- ✅ Network status monitoring
- ✅ Automatic updates

Enjoy your Progressive Web App! 🚀

