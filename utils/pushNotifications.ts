import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** Configure notification handling: show as banner, play sound, badge. */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Request permissions and return Expo push token, or null if not available. */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Must use a physical device for push; simulator/emulator return null
  if (!Device.isDevice) {
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    if (finalStatus !== 'granted') {
      return null;
    }
  }

  // Android needs a channel for notifications to display
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('wellness-reminders', {
      name: 'Wellness reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const projectId =
    (Constants.expoConfig?.extra as { eas?: { projectId?: string } })?.eas?.projectId ||
    (process?.env?.EXPO_PUBLIC_EAS_PROJECT_ID as string | undefined);
  if (!projectId) {
    throw new Error(
      'No EAS project ID found. Run "npx eas init" to link your project, or add EXPO_PUBLIC_EAS_PROJECT_ID to .env.',
    );
  }
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  return token;
}
