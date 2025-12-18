# Mobile App Starter Files

These files provide a starting point for the Dine Maison mobile app with push notification support.

## Files Included

### Services
- `services/notificationService.ts` - Push notification management and device registration

### Contexts
- `contexts/NotificationContext.tsx` - Global notification state management

### Configuration
- `config.ts` - App configuration (API URLs, feature flags)

## Integration Steps

### 1. Copy Files

Copy these files to your React Native project:

```bash
# If you're in the Dinemaison directory
cp -r mobile-app-starter/* ../dine-maison-mobile/src/
```

### 2. Install Dependencies

```bash
# For Expo
npx expo install expo-notifications expo-device expo-constants
npx expo install @react-native-async-storage/async-storage

# For React Native CLI
npm install @react-native-firebase/app @react-native-firebase/messaging
npm install @notifee/react-native
npm install @react-native-async-storage/async-storage
```

### 3. Wrap App with NotificationProvider

In your `App.tsx`:

```tsx
import { NotificationProvider } from './src/contexts/NotificationContext';

export default function App() {
  return (
    <NotificationProvider>
      {/* Your app content */}
    </NotificationProvider>
  );
}
```

### 4. Use Notifications in Components

```tsx
import { useNotificationContext } from '../contexts/NotificationContext';

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotificationContext();
  
  return (
    <View>
      <Text>Unread: {unreadCount}</Text>
      {notifications.map(notif => (
        <TouchableOpacity key={notif.id} onPress={() => markAsRead(notif.id)}>
          <Text>{notif.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

### 5. Configure Firebase

Follow the instructions in `MOBILE_APP_SETUP.md` to configure Firebase for your iOS and Android apps.

### 6. Update Configuration

Edit `config.ts` with your production API URL.

## Testing

### Request Permissions

The notification service automatically requests permissions on initialization. To manually request:

```tsx
import { notificationService } from './services/notificationService';

await notificationService.requestPermissions();
```

### Send Test Notification

Use the backend API to send a test notification to your device:

```bash
curl -X POST http://localhost:5000/api/notifications/test/push \
  -H "Cookie: your-session-cookie"
```

### Local Notification (Testing)

```tsx
import { notificationService } from './services/notificationService';

await notificationService.scheduleLocalNotification(
  'Test Title',
  'Test Body',
  5  // seconds
);
```

## Architecture

```
Mobile App
    │
    ├─ App.tsx (wrapped with NotificationProvider)
    │
    ├─ NotificationContext
    │   └─ Manages notification state
    │
    ├─ NotificationService
    │   ├─ Requests permissions
    │   ├─ Gets device token
    │   ├─ Registers with backend
    │   └─ Handles notification events
    │
    └─ Backend API
        ├─ POST /api/notifications/devices/register
        ├─ GET /api/notifications/in-app
        └─ PATCH /api/notifications/in-app/:id/read
```

## Troubleshooting

### Notifications Not Received

1. Check permissions are granted in device settings
2. Verify device token is registered with backend
3. Check Firebase configuration
4. Test with local notification first

### Token Registration Fails

1. Verify API_URL is correct in config.ts
2. Check network connectivity
3. Ensure user is authenticated
4. Check backend logs

### iOS Specific Issues

- Notifications only work on physical devices (not simulator)
- Ensure APNs certificate is configured in Firebase
- Check notification permissions in Settings app

### Android Specific Issues

- Ensure notification permission is requested (Android 13+)
- Check battery optimization settings
- Verify google-services.json is in place

## Next Steps

1. Implement notification settings screen
2. Add deep linking for notification actions
3. Customize notification appearance
4. Add notification categories
5. Implement notification actions (reply, dismiss, etc.)
6. Add analytics tracking
7. Handle notification channels (Android)
8. Implement quiet hours feature

## Resources

- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Native Firebase](https://rnfirebase.io/)
- [Notifee](https://notifee.app/)
- [Backend API Documentation](../API_DOCUMENTATION.md)

