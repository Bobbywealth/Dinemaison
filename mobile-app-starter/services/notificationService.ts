// Mobile Push Notification Service for React Native
// Works with both Expo and React Native CLI

import * as Notifications from 'expo-notifications'; // For Expo
// import messaging from '@react-native-firebase/messaging'; // For React Native CLI
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private token: string | null = null;
  private deviceId: string | null = null;

  /**
   * Initialize notification service
   */
  async initialize() {
    try {
      // Request permissions
      const granted = await this.requestPermissions();
      
      if (!granted) {
        console.log('Notification permissions denied');
        return false;
      }

      // Get device token
      await this.getDeviceToken();

      // Set up notification listeners
      this.setupListeners();

      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        return finalStatus === 'granted';
      } else {
        // Android 13+ requires explicit permission
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Get device push token
   */
  async getDeviceToken(): Promise<string | null> {
    try {
      // For Expo
      const token = await Notifications.getExpoPushTokenAsync();
      this.token = token.data;

      // For React Native CLI with Firebase:
      // const token = await messaging().getToken();
      // this.token = token;

      console.log('Device token:', this.token);

      // Register token with backend
      await this.registerToken();

      return this.token;
    } catch (error) {
      console.error('Error getting device token:', error);
      return null;
    }
  }

  /**
   * Register device token with backend
   */
  async registerToken() {
    if (!this.token) return;

    try {
      // Get or generate device ID
      this.deviceId = await AsyncStorage.getItem('device_id');
      if (!this.deviceId) {
        this.deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('device_id', this.deviceId);
      }

      const platform = Platform.OS;

      const response = await fetch(`${API_URL}/api/notifications/devices/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          platform,
          token: this.token,
          deviceId: this.deviceId,
        }),
      });

      if (response.ok) {
        console.log('Device token registered with backend');
        await AsyncStorage.setItem('notification_token', this.token);
      } else {
        console.error('Failed to register device token');
      }
    } catch (error) {
      console.error('Error registering token:', error);
    }
  }

  /**
   * Unregister device from receiving notifications
   */
  async unregisterDevice() {
    try {
      if (!this.deviceId) return;

      await fetch(`${API_URL}/api/notifications/devices/${this.deviceId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      await AsyncStorage.removeItem('notification_token');
      await AsyncStorage.removeItem('device_id');
      
      console.log('Device unregistered');
    } catch (error) {
      console.error('Error unregistering device:', error);
    }
  }

  /**
   * Set up notification listeners
   */
  setupListeners() {
    // Notification received while app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      // You can show a custom in-app banner here
    });

    // Notification tapped/clicked
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      const data = response.notification.request.content.data;
      
      // Handle navigation based on notification data
      if (data?.url) {
        // Navigate to specific screen
        // navigation.navigate(data.url);
      }
    });

    // For React Native CLI with Firebase:
    // messaging().onMessage(async remoteMessage => {
    //   console.log('Notification received:', remoteMessage);
    // });
    //
    // messaging().onNotificationOpenedApp(remoteMessage => {
    //   console.log('Notification opened app:', remoteMessage);
    // });
    //
    // messaging().getInitialNotification().then(remoteMessage => {
    //   if (remoteMessage) {
    //     console.log('Notification opened app from quit state:', remoteMessage);
    //   }
    // });
  }

  /**
   * Schedule a local notification (for testing)
   */
  async scheduleLocalNotification(title: string, body: string, seconds: number = 1) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: {
          seconds,
        },
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Clear badge
   */
  async clearBadge() {
    await Notifications.setBadgeCountAsync(0);
  }
}

export const notificationService = new NotificationService();

