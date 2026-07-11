// Expo app config. Env comes from EXPO_PUBLIC_* vars (inlined by Metro at build
// time and readable via process.env in the app) AND is mirrored into `extra` so
// it is reachable via expo-constants as a fallback. In EAS builds these are
// supplied as EAS "environment variables"/secrets of the same names.
//
// Required at build/run time:
//   EXPO_PUBLIC_API_URL            → the Railway server base (e.g. https://kristy-api.up.railway.app)
//   EXPO_PUBLIC_SUPABASE_URL       → same Supabase project as web
//   EXPO_PUBLIC_SUPABASE_ANON_KEY  → same anon key as web
//   EXPO_PUBLIC_REVENUECAT_IOS_KEY → RevenueCat public "Apple App Store" API key
// Optional:
//   EAS_PROJECT_ID                 → fills expo.extra.eas.projectId (also set by `eas init`)

const BUNDLE_ID = 'com.kristyapproved.app';

module.exports = () => ({
  expo: {
    name: 'Kristy',
    slug: 'kristy',
    scheme: 'kristy',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    backgroundColor: '#0B1F0F',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#0B1F0F',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: false,
      bundleIdentifier: BUNDLE_ID,
      buildNumber: '1',
      // Honest privacy strings — shown verbatim in the iOS permission prompts.
      infoPlist: {
        NSCameraUsageDescription:
          'Kristy uses the camera to scan food barcodes and photograph meals so it can estimate their macros.',
        NSPhotoLibraryUsageDescription:
          'Kristy lets you attach a photo of a meal from your library so it can estimate the macros.',
        // We send no data that requires an export-compliance filing.
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: BUNDLE_ID,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0B1F0F',
      },
    },
    notification: {
      icon: './assets/notification-icon.png',
      color: '#C9A84C',
    },
    plugins: [
      'expo-router',
      'expo-font',
      [
        'expo-camera',
        {
          cameraPermission:
            'Kristy uses the camera to scan food barcodes and photograph meals.',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'Kristy lets you attach a meal photo so it can estimate the macros.',
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#C9A84C',
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/splash.png',
          resizeMode: 'contain',
          backgroundColor: '#0B1F0F',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || '',
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      revenueCatIosKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '',
      eas: {
        projectId: process.env.EAS_PROJECT_ID || undefined,
      },
    },
  },
});
