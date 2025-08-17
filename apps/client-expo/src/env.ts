export const ENV = {
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:8090',
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080',
  PRIVACY_URL: process.env.EXPO_PUBLIC_PRIVACY_URL || ''
};

// For demo/testing identity
export const USER_ID = process.env.EXPO_PUBLIC_USER_ID || 'demo-user-1';
