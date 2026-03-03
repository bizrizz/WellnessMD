import React, { useEffect, useMemo, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, DefaultTheme, createNavigationContainerRef } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import RootNavigator from './navigation/RootNavigator';
import { SplashScreen } from './components/SplashScreen';
import { DarkColors, LightColors } from './components/theme/colors';
import * as Notifications from 'expo-notifications';
import { getSession } from './auth/authService';
import { isSupabaseConfigured, supabase } from './supabase/client';
import { fetchProfile, savePushToken } from './supabase/api';
import { useAppStore, THEME_STORAGE_KEY } from './store/appStore';
import { registerForPushNotificationsAsync } from './utils/pushNotifications';
import type { RootStackParamList } from './navigation/types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function App() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [splashComplete, setSplashComplete] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    Lato_400Regular,
    Lato_700Bold,
  });
  const signIn = useAppStore((s) => s.signIn);
  const signOut = useAppStore((s) => s.signOut);
  const setDarkMode = useAppStore((s) => s.setDarkMode);
  const isDarkMode = useAppStore((s) => s.isDarkMode);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((val) => {
        if (val !== null) {
          try {
            const dark = JSON.parse(val);
            if (typeof dark === 'boolean') setDarkMode(dark);
          } catch (_) {}
        }
      })
      .finally(() => setThemeReady(true));
  }, [setDarkMode]);

  const palette = isDarkMode ? DarkColors : LightColors;

  const navTheme = useMemo(
    () => ({
      ...DefaultTheme,
      dark: isDarkMode,
      colors: {
        ...DefaultTheme.colors,
        background: palette.background,
        card: palette.backgroundSecondary,
        text: palette.textPrimary,
        border: palette.cardBorder,
        primary: palette.accent,
      },
    }),
    [isDarkMode, palette],
  );

  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      if (!isSupabaseConfigured) {
        setSessionChecked(true);
        return;
      }
      try {
        const { session } = await getSession();
        if (!isMounted) return;
        if (session?.user) {
          const m = session.user.user_metadata ?? {};
          let avatarUrl: string | null = null;
          const { data: profile } = await fetchProfile(session.user.id);
          if (profile?.avatar_url) avatarUrl = profile.avatar_url;
          if (profile?.smart_alerts_enabled !== false) {
            const token = await registerForPushNotificationsAsync();
            if (token && isSupabaseConfigured) {
              await savePushToken(session.user.id, token);
            }
          }
          signIn({
            id: session.user.id,
            name: typeof m.full_name === 'string' ? m.full_name : (profile?.full_name ?? 'Wellness User'),
            email: session.user.email ?? 'unknown@gmail.com',
            avatarUrl,
            pgyYear: m.pgy_year ?? profile?.pgy_year ?? 'PGY-1',
            specialty: m.specialty ?? profile?.specialty ?? 'Internal Medicine',
            institution: null,
          });
        }
      } finally {
        if (isMounted) setSessionChecked(true);
      }
    };
    checkSession();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_OUT') {
        signOut();
      }
      if (event === 'SIGNED_IN' && session?.user) {
        if (useAppStore.getState().oauthFlowInProgress) return;
        const m = session.user.user_metadata ?? {};
        fetchProfile(session.user.id).then(async ({ data: profile }) => {
          if (!isMounted) return;
          if (profile?.smart_alerts_enabled !== false) {
            const token = await registerForPushNotificationsAsync();
            if (token && isSupabaseConfigured) {
              await savePushToken(session.user!.id, token);
            }
          }
          signIn({
            id: session.user!.id,
            name: typeof m.full_name === 'string' ? m.full_name : (profile?.full_name ?? 'Wellness User'),
            email: session.user!.email ?? 'unknown@gmail.com',
            avatarUrl: profile?.avatar_url ?? null,
            pgyYear: m.pgy_year ?? profile?.pgy_year ?? 'PGY-1',
            specialty: m.specialty ?? profile?.specialty ?? 'Internal Medicine',
            institution: null,
          });
        });
      }
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [signIn, signOut]);

  useEffect(() => {
    const handleResponse = (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as { activityId?: string };
      const activityId = data?.activityId;
      if (!activityId) return;
      const tryNavigate = () => {
        if (navigationRef.isReady()) {
          navigationRef.navigate('ActivityGuide', { activityId });
          return true;
        }
        return false;
      };
      if (!tryNavigate()) {
        const id = setInterval(() => {
          if (tryNavigate()) clearInterval(id);
        }, 100);
        setTimeout(() => clearInterval(id), 3000);
      }
    };
    const sub = Notifications.addNotificationResponseReceivedListener(handleResponse);
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) handleResponse(response);
    });
    return () => sub.remove();
  }, []);

  const showSplash = !splashComplete;
  const isLoading = !fontsLoaded || !sessionChecked;

  // Wait for theme to load so splash uses saved light/dark preference
  if (!themeReady) {
    const initPalette = isDarkMode ? DarkColors : LightColors;
    return (
      <View style={{ flex: 1, backgroundColor: initPalette.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={initPalette.accent} />
      </View>
    );
  }

  // Only show splash once fonts are loaded so Playfair Display + Lato render correctly
  if (showSplash && fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.background }}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <SplashScreen onComplete={() => setSplashComplete(true)} />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.background }}>
        <ActivityIndicator size="large" color={palette.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef} theme={navTheme}>
          <StatusBar style={isDarkMode ? 'light' : 'dark'} />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
