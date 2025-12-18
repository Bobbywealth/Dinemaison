# Mobile App Setup Guide - React Native

This guide will help you set up the Dine Maison mobile app for iOS and Android with push notifications.

## Prerequisites

- Node.js 18+ installed
- For iOS: macOS with Xcode installed
- For Android: Android Studio installed
- Firebase account for push notifications

## Option 1: Expo (Recommended for Quick Start)

### 1. Create Expo App

```bash
npx create-expo-app@latest dine-maison-mobile
cd dine-maison-mobile
```

### 2. Install Dependencies

```bash
npx expo install expo-notifications expo-device expo-constants
npx expo install @react-navigation/native @react-navigation/native-stack
npx expo install expo-secure-store axios
```

### 3. Configure Firebase

#### iOS Setup:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Add iOS app with bundle ID (e.g., `com.dinemaison.app`)
4. Download `GoogleService-Info.plist`
5. Place in iOS project root

#### Android Setup:
1. In same Firebase project, add Android app
2. Package name (e.g., `com.dinemaison.app`)
3. Download `google-services.json`
4. Place in `android/app/` directory

### 4. Add Notification Service Files

Copy the files from `/mobile-app-starter/` to your project:
- `services/notificationService.ts`
- `contexts/NotificationContext.tsx`
- `hooks/useNotifications.ts`
- `components/NotificationBanner.tsx`
- `screens/NotificationSettings.tsx`

### 5. Configure app.json

```json
{
  "expo": {
    "name": "Dine Maison",
    "slug": "dine-maison",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#8B5CF6",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "ios": {
      "bundleIdentifier": "com.dinemaison.app",
      "supportsTablet": true,
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "package": "com.dinemaison.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "googleServicesFile": "./google-services.json",
      "permissions": [
        "NOTIFICATIONS"
      ]
    },
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#8B5CF6"
    }
  }
}
```

### 6. Run the App

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android

# Development mode
npx expo start
```

## Option 2: React Native CLI (More Control)

### 1. Create React Native App

```bash
npx react-native@latest init DineMaisonMobile
cd DineMaisonMobile
```

### 2. Install Dependencies

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
npm install @notifee/react-native
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install axios @react-native-async-storage/async-storage
```

### 3. Configure Firebase

#### iOS Setup:
1. Open `ios/DineMaisonMobile.xcworkspace` in Xcode
2. Add `GoogleService-Info.plist` to project
3. Edit `AppDelegate.mm`:

```objc
#import <Firebase.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];
  // ... rest of code
}
```

#### Android Setup:
1. Edit `android/build.gradle`:

```gradle
buildscript {
  dependencies {
    classpath('com.google.gms:google-services:4.4.0')
  }
}
```

2. Edit `android/app/build.gradle`:

```gradle
apply plugin: 'com.google.gms.google-services'
```

3. Place `google-services.json` in `android/app/`

### 4. Configure iOS Capabilities

In Xcode:
1. Select project target
2. Go to "Signing & Capabilities"
3. Add "Push Notifications" capability
4. Add "Background Modes" capability
   - Check "Remote notifications"

### 5. Request Permissions

Add to `Info.plist` (iOS):

```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

Add to `AndroidManifest.xml` (Android):

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

## Mobile App Architecture

```
mobile-app/
├── src/
│   ├── services/
│   │   ├── notificationService.ts   # Push notification management
│   │   ├── apiService.ts             # API client
│   │   └── authService.ts            # Authentication
│   ├── contexts/
│   │   ├── NotificationContext.tsx   # Notification state
│   │   └── AuthContext.tsx           # Auth state
│   ├── hooks/
│   │   ├── useNotifications.ts       # Notification hooks
│   │   └── useAuth.ts                # Auth hooks
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── NotificationSettings.tsx
│   │   └── NotificationsScreen.tsx
│   ├── components/
│   │   ├── NotificationBanner.tsx    # In-app notification
│   │   └── NotificationItem.tsx
│   └── navigation/
│       └── AppNavigator.tsx          # Navigation setup
└── App.tsx
```

## Testing Notifications

### 1. Test on Physical Device

Push notifications don't work on simulators/emulators. You must test on:
- Real iPhone (iOS)
- Real Android device

### 2. Get Device Token

When app launches, it will request notification permissions and get a token.
The token is automatically registered with your backend.

### 3. Send Test Notification

Use the backend API:

```bash
curl -X POST http://localhost:5000/api/notifications/test/push \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "userId": "your-user-id"
  }'
```

## Troubleshooting

### iOS Issues

**Problem**: No notifications received
- Check: Settings > [App Name] > Notifications are enabled
- Check: Xcode > Capabilities > Push Notifications is added
- Check: Apple Developer account has push notification certificate
- Check: Device is not in Do Not Disturb mode

**Problem**: Token registration fails
- Check: `GoogleService-Info.plist` is in project
- Check: Bundle ID matches Firebase project
- Check: APNs key is uploaded to Firebase Console

### Android Issues

**Problem**: No notifications received
- Check: `google-services.json` is in `android/app/`
- Check: Package name matches Firebase project
- Check: Google Play Services is updated on device
- Check: Notification permissions granted

**Problem**: Build fails
- Run: `cd android && ./gradlew clean`
- Check: Google Services plugin is applied
- Check: Firebase dependencies versions are compatible

## Production Checklist

- [ ] Firebase project configured for production
- [ ] APNs production certificate uploaded (iOS)
- [ ] App signed with production certificate
- [ ] Notification icons optimized
- [ ] Deep linking configured
- [ ] Analytics tracking added
- [ ] Error reporting (Sentry/Bugsnag) integrated
- [ ] Backend API pointing to production URL
- [ ] Rate limiting implemented
- [ ] Background notification handling tested
- [ ] Battery optimization handling (Android)
- [ ] App Store/Play Store metadata ready

## Environment Variables

Create `.env` file:

```bash
API_URL=https://api.dinemaison.com
WS_URL=wss://api.dinemaison.com/ws
FIREBASE_API_KEY=your-api-key
```

## Next Steps

1. Build authentication flow
2. Implement booking features
3. Add chef browsing
4. Integrate payment (Stripe SDK)
5. Add messaging system
6. Implement offline support
7. Submit to app stores

## Resources

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Native Firebase Docs](https://rnfirebase.io/)
- [Notifee Docs](https://notifee.app/)
- [React Navigation Docs](https://reactnavigation.org/)

