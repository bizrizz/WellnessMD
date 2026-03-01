import React, { useEffect, useMemo } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigation/RootNavigator';
import { DarkColors, LightColors } from './components/theme/colors';
import { getSession } from './auth/authService';
import { isSupabaseConfigured, supabase } from './supabase/client';
import { useAppStore } from './store/appStore';

export default function App() {
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
    if (!isSupabaseConfigured) return;
    let isMounted = true;

    const hydrateFromSession = async () => {
      const { session } = await getSession();
      if (!isMounted || !session?.user) return;
      const m = session.user.user_metadata ?? {};
      signIn({
        name: typeof m.full_name === 'string' ? m.full_name : 'Wellness User',
        email: session.user.email ?? 'unknown@gmail.com',
        pgyYear: m.pgy_year ?? 'PGY-1',
        specialty: m.specialty ?? 'Internal Medicine',
        institution: null,
      });
    };

    hydrateFromSession();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_OUT') {
        signOut();
      }
      if (event === 'SIGNED_IN' && session?.user) {
        const m = session.user.user_metadata ?? {};
        signIn({
          name: typeof m.full_name === 'string' ? m.full_name : 'Wellness User',
          email: session.user.email ?? 'unknown@gmail.com',
          pgyYear: m.pgy_year ?? 'PGY-1',
          specialty: m.specialty ?? 'Internal Medicine',
          institution: null,
        });
      }
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [signIn, signOut]);

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
