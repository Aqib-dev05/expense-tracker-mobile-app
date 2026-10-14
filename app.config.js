/**
 * Expo config. Dynamic (instead of app.json) so that cleartext HTTP is only enabled
 * when EXPO_PUBLIC_API_URL points at a plain http:// server (local development).
 * Production builds against an https:// API keep Android's default (cleartext blocked).
 */
const apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
const usesCleartextTraffic = apiUrl === '' || apiUrl.startsWith('http://');

module.exports = {
  expo: {
    name: 'Ledgerly',
    slug: 'ledgerly-mobile',
    scheme: 'ledgerly',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    // 'automatic' lets the in-app Light/Dark toggle (NativeWind) override the system theme.
    userInterfaceStyle: 'automatic',
    backgroundColor: '#f8fafc',
    android: {
      package: 'dev.aqib.ledgerly',
      versionCode: 1,
      adaptiveIcon: {
        backgroundImage: './assets/android-icon-background.png',
        foregroundImage: './assets/android-icon-foreground.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      permissions: ['POST_NOTIFICATIONS'],
      predictiveBackGestureEnabled: false,
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
      'expo-font',
      [
        'expo-splash-screen',
        {
          image: './assets/splash-icon.png',
          imageWidth: 168,
          resizeMode: 'contain',
          backgroundColor: '#f8fafc',
          dark: { image: './assets/splash-icon.png', backgroundColor: '#0a0f1e' },
        },
      ],
      [
        'expo-notifications',
        { icon: './assets/notification-icon.png', color: '#2f45dc', defaultChannel: 'default' },
      ],
      [
        'expo-image-picker',
        { photosPermission: 'Ledgerly uses your photos so you can choose a profile picture.' },
      ],
      [
        'expo-build-properties',
        {
          android: {
            // Android 7.0 (API 24) is the minimum supported by React Native 0.86 / Expo SDK 57.
            minSdkVersion: 24,
            usesCleartextTraffic,
          },
        },
      ],
    ],
    experiments: { typedRoutes: true },
  },
};
