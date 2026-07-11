// Push notification registration. On sign-in the app registers for an Expo push
// token and stores it per-user on the server (POST /api/push/register). The
// server sends a push when a proactive insight fires and when the Sunday weekly
// summary generates — turning existing features into real notifications.

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { apiBase } from './config';
import { authToken } from './supabase';

// Show notifications while the app is foregrounded, too.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // shouldShowAlert is the pre-SDK-52 field; banner/list are the newer split.
    // Include all so the handler types-check across expo-notifications versions.
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function projectId(): string | undefined {
  return (
    (Constants.expoConfig?.extra as any)?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId
  );
}

/**
 * Ask for permission (if needed) and return an Expo push token, or null when
 * push isn't available (simulator, denied permission, missing projectId).
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null; // push needs a physical device

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Kristy',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#C9A84C',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') return null;

  try {
    const pid = projectId();
    const token = await Notifications.getExpoPushTokenAsync(
      pid ? { projectId: pid } : undefined
    );
    return token.data;
  } catch (e) {
    console.warn('[kristy] getExpoPushTokenAsync failed:', (e as Error)?.message);
    return null;
  }
}

/**
 * Register the device's push token with the server for the signed-in user.
 * Best-effort — a failure here never blocks the app. Returns the token (or null).
 */
export async function registerPushToken(): Promise<string | null> {
  try {
    const token = await getExpoPushToken();
    if (!token) return null;

    await fetch(`${apiBase}/api/push/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await authToken()}`,
      },
      body: JSON.stringify({ token, platform: Platform.OS }),
    }).catch(() => {});

    return token;
  } catch (e) {
    console.warn('[kristy] registerPushToken failed:', (e as Error)?.message);
    return null;
  }
}
