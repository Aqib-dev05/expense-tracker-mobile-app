
/**
 * Expo config.
 * Dynamic configuration so cleartext HTTP is enabled only
 * when EXPO_PUBLIC_API_URL points to a plain HTTP server.
 * Production HTTPS builds keep Android cleartext traffic disabled.
 */

const apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
const usesCleartextTraffic =
  apiUrl === '' || apiUrl.startsWith('http://');

module.exports = {
  expo: {
    name: 'Ledgerly',
    slug: 'ledgerly-mobile',
    scheme: 'ledgerly',
    version: '1.0.0',

    icon: './assets/icon.png',

    // Allow the in-app Light/Dark toggle to override the system theme.
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
          dark: {
            image: './assets/splash-icon.png',
            backgroundColor: '#0a0f1e',
          },
        },
      ],

      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#2f45dc',
          defaultChannel: 'default',
        },
      ],

      [
        'expo-image-picker',
        {
          photosPermission:
            'Ledgerly uses your photos so you can choose a profile picture.',
        },
      ],

      [
        'expo-build-properties',
        {
          android: {
            // Android 7.0 (API 24) minimum.
            minSdkVersion: 24,
            usesCleartextTraffic,

            // APK size: build only the ABIs real phones use (drops x86/x86_64,
            // which are emulator-only) and shrink unused code/resources.
            buildArchs: ['arm64-v8a', 'armeabi-v7a'],
            enableMinifyInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
          },
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      eas: {
        projectId: 'b2942002-e27c-445b-9fd6-c460e4c3612e',
      },
    },
  },
};
