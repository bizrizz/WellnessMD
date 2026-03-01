import React, { useEffect, useMemo, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
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
import { getSession } from './auth/authService';
import { isSupabaseConfigured, supabase } from './supabase/client';
import { fetchProfile } from './supabase/api';
import { useAppStore } from './store/appStore';

export default function App() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [splashComplete, setSplashComplete] = useState(false);
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    Lato_400Regular,
    Lato_700Bold,
  });
  const signIn = useAppStore((s) => s.signIn);
  const signOut = useAppStore((s) => s.signOut);
  const isDarkMode = useAppStore((s) => s.isDarkMode);

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
        const m = session.user.user_metadata ?? {};
        fetchProfile(session.user.id).then(({ data: profile }) => {
          if (!isMounted) return;
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

  const showSplash = !splashComplete;
  const isLoading = !fontsLoaded || !sessionChecked;

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
        <NavigationContainer theme={navTheme}>
          <StatusBar style={isDarkMode ? 'light' : 'dark'} />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
