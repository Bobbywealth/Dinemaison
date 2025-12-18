// Configuration for mobile app
// Update these values for your environment

export const API_URL = __DEV__ 
  ? 'http://localhost:5000'  // Development
  : 'https://api.dinemaison.com';  // Production

export const WS_URL = __DEV__
  ? 'ws://localhost:5000/ws'  // Development
  : 'wss://api.dinemaison.com/ws';  // Production

export const APP_NAME = 'Dine Maison';
export const APP_VERSION = '1.0.0';

// Feature flags
export const FEATURES = {
  PUSH_NOTIFICATIONS: true,
  WEBSOCKET_ENABLED: true,
  ANALYTICS_ENABLED: !__DEV__,
};
