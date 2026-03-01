import React, { useMemo, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Modal,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import { ColorPalette } from '../components/theme/colors';
import { useColors } from '../components/theme/useColors';
import { Typography } from '../components/theme/typography';
import { WellnessActivity, ActivityCategoryColors } from '../store/types';
import { sampleActivities } from '../store/mockData';
import { useAppStore } from '../store/appStore';
import { signOut as signOutSupabase } from '../auth/authService';
import AppCard from '../components/AppCard';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { isSupabaseConfigured } from '../supabase/client';
import { fetchActivityLogs, fetchMoodLogs, fetchTodaysMood, logMood } from '../supabase/api';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Dashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const RESOURCE_HIGHLIGHTS = [
  { label: 'Mental Health', icon: 'heart-outline' as const },
  { label: 'Nutrition', icon: 'nutrition' as const },
  { label: 'Support', icon: 'business-outline' as const },
];

const MOODS: { label: string; icon: 'happy' | 'calm' | 'relax' | 'focus' }[] = [
  { label: 'Happy', icon: 'happy' },
  { label: 'Calm', icon: 'calm' },
  { label: 'Relax', icon: 'relax' },
  { label: 'Focus', icon: 'focus' },
];

function HamburgerIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 24, height: 18, justifyContent: 'space-between' }}>
      <View style={{ height: 2, borderRadius: 1, backgroundColor: color, width: 18 }} />
      <View style={{ height: 2, borderRadius: 1, backgroundColor: color, width: 24 }} />
      <View style={{ height: 2, borderRadius: 1, backgroundColor: color, width: 18 }} />
    </View>
  );
}

function MoodIcon({
  name,
  isSelected,
  colors,
}: {
  name: 'happy' | 'calm' | 'relax' | 'focus';
  isSelected: boolean;
  colors: ColorPalette;
}) {
  const iconColor = isSelected ? colors.cardDark : '#FFFFFF';
  const size = 42;
  switch (name) {
    case 'happy':
      return <Ionicons name="happy-outline" size={size} color={iconColor} />;
    case 'calm':
      return <MaterialCommunityIcons name="yin-yang" size={size} color={iconColor} />;
    case 'relax':
      return <MaterialCommunityIcons name="waves" size={size} color={iconColor} />;
    case 'focus':
      return <MaterialCommunityIcons name="meditation" size={size} color={iconColor} />;
  }
}

export default function WellnessDashboardScreen() {
  const c = useColors();
  const s = useMemo(() => makeStyles(c), [c]);
  const navigation = useNavigation<Nav>();
  const currentUser = useAppStore((s) => s.currentUser);
  const hydrateActivityLogs = useAppStore((s) => s.hydrateActivityLogs);
  const hydrateMoodLogs = useAppStore((s) => s.hydrateMoodLogs);
  const logMoodStore = useAppStore((s) => s.logMood);
  const moodLogs = useAppStore((s) => s.moodLogs);
  const signOutStore = useAppStore((s) => s.signOut);
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const [menuVisible, setMenuVisible] = useState(false);
  const userName = currentUser?.name ?? 'there';

  const handleSignOut = async () => {
    setMenuVisible(false);
    await signOutSupabase();
    signOutStore();
  };

  const menuItems: { screen: keyof MainTabParamList; icon: string; label: string }[] = [
    { screen: 'Dashboard', icon: 'home', label: 'Home' },
    { screen: 'Resources', icon: 'book', label: 'Resources' },
    { screen: 'Community', icon: 'people', label: 'Community' },
    { screen: 'Profile', icon: 'person', label: 'Profile' },
  ];

  const isMoodLoggedToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return moodLogs.some((log) => {
      const d = new Date(log.loggedAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
  };

  useEffect(() => {
    const uid = currentUser?.id;
    if (!isSupabaseConfigured || !uid || uid.startsWith('local-')) return;
    fetchActivityLogs(uid).then(({ data }) => {
      if (data && data.length > 0) {
        hydrateActivityLogs(
          data.map((row: any) => ({
            id: row.id,
            activityId: row.intervention_id ?? '',
            activityTitle: '',
            category: 'MINDFULNESS' as const,
            durationMinutes: row.duration_minutes,
            completedAt: new Date(row.completed_at),
          })),
        );
      }
    });
    fetchMoodLogs(uid).then(({ data }) => {
      if (data && data.length > 0) {
        hydrateMoodLogs(
          data.map((row: any) => ({
            id: row.id,
            mood: row.mood,
            loggedAt: new Date(row.logged_at),
          })),
        );
      }
    });
  }, [currentUser?.id]);

  const [selectedMood, setSelectedMood] = React.useState<string | null>(null);
  const [showMoodSection, setShowMoodSection] = React.useState(true);
  const moodFadeAnim = useRef(new Animated.Value(1)).current;
  const moodScaleAnim = useRef(new Animated.Value(1)).current;
  const isAnimatingOut = useRef(false);

  useEffect(() => {
    const uid = currentUser?.id;
    if (!uid || uid.startsWith('local-')) return;
    if (isSupabaseConfigured) {
      fetchTodaysMood(uid).then(({ mood }) => {
        if (mood) {
          setSelectedMood(mood);
          setShowMoodSection(false);
        }
      });
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (!isAnimatingOut.current && isMoodLoggedToday()) setShowMoodSection(false);
  }, [moodLogs]);

  useEffect(() => {
    if (showMoodSection) {
      moodFadeAnim.setValue(1);
      moodScaleAnim.setValue(1);
    }
  }, [showMoodSection]);

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    logMoodStore(mood as 'Happy' | 'Calm' | 'Relax' | 'Focus');
    const uid = currentUser?.id;
    if (isSupabaseConfigured && uid && !uid.startsWith('local-')) {
      logMood(uid, mood as 'Happy' | 'Calm' | 'Relax' | 'Focus');
    }
    isAnimatingOut.current = true;
    Animated.parallel([
      Animated.timing(moodFadeAnim, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(moodScaleAnim, {
        toValue: 0.94,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      isAnimatingOut.current = false;
      setShowMoodSection(false);
    });
  };

  const firstName = userName.split(' ')[0];

  const hour = new Date().getHours();
  const timeGreeting = hour >= 5 && hour < 12 ? 'Good morning' : hour >= 12 && hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetingSubtext = hour >= 5 && hour < 12
    ? 'Ready for a mindful start?'
    : hour >= 12 && hour < 17
      ? "Here's today's focus"
      : 'Wind down with a short practice';

  const handleActivityPress = (activity: WellnessActivity) => {
    navigation.navigate('ActivityGuide', { activityId: activity.id });
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header — hamburger left, small profile pic right, greeting below */}
        <View style={s.header}>
          <View style={s.headerTopRow}>
            <TouchableOpacity onPress={() => setMenuVisible(true)} style={s.menuBtn} activeOpacity={0.7}>
              <HamburgerIcon color={c.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} activeOpacity={0.8}>
              <View style={s.avatarCircle}>
                <Text style={s.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
                {currentUser?.avatarUrl ? (
                  <Image source={{ uri: currentUser.avatarUrl }} style={s.avatarImage} contentFit="cover" transition={200} />
                ) : null}
              </View>
            </TouchableOpacity>
          </View>
          <Modal visible={menuVisible} transparent animationType="fade">
            <Pressable style={s.menuOverlay} onPress={() => setMenuVisible(false)}>
              <Pressable style={s.menuPanel} onPress={(e) => e.stopPropagation()}>
                {menuItems.map((item) => (
                  <TouchableOpacity
                    key={item.screen}
                    style={s.menuItem}
                    onPress={() => { setMenuVisible(false); navigation.navigate(item.screen); }}
                  >
                    <Ionicons name={item.icon as any} size={22} color={c.textPrimary} />
                    <Text style={s.menuItemText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
                <View style={s.menuDivider} />
                <TouchableOpacity style={s.menuItem} onPress={() => { toggleDarkMode(); setMenuVisible(false); }}>
                  <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={22} color={c.textPrimary} />
                  <Text style={s.menuItemText}>{isDarkMode ? 'Light mode' : 'Dark mode'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.menuItem} onPress={handleSignOut}>
                  <Ionicons name="log-out-outline" size={22} color={c.textPrimary} />
                  <Text style={s.menuItemText}>Sign out</Text>
                </TouchableOpacity>
              </Pressable>
            </Pressable>
          </Modal>
          <View style={s.headerGreetingBlock}>
            <Text style={s.greeting}>{timeGreeting}, <Text style={s.greetingBold}>{firstName}!</Text></Text>
            {!showMoodSection && <Text style={s.greetingSub}>{greetingSubtext}</Text>}
          </View>
        </View>

        {/* Mood row — once per day, fades out after selection */}
        {showMoodSection && (
          <Animated.View
            style={[
              s.moodSection,
              {
                opacity: moodFadeAnim,
                transform: [{ scale: moodScaleAnim }],
              },
            ]}
          >
            <Text style={s.subGreeting}>How are you feeling today?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.moodRow}>
              {MOODS.map((m) => {
                const isSelected = selectedMood === m.label;
                return (
                  <TouchableOpacity
                    key={m.label}
                    style={[s.moodItem, isSelected && s.moodItemSelected]}
                    activeOpacity={0.7}
                    onPress={() => handleMoodSelect(m.label)}
                  >
                    <View style={[s.moodCircle, isSelected && s.moodCircleSelected]}>
                      <MoodIcon name={m.icon} isSelected={isSelected} colors={c} />
                    </View>
                    <Text style={[s.moodLabel, isSelected && s.moodLabelSelected]}>{m.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}

        {/* Today's Task / Interventions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Today's Task</Text>

          {sampleActivities.map((activity, idx) => {
            const isDark = idx % 2 === 0;
            return (
              <TouchableOpacity
                key={activity.id}
                activeOpacity={0.7}
                onPress={() => handleActivityPress(activity)}
              >
                <View style={[s.interventionCard, { backgroundColor: isDark ? c.cardDark : c.cardPeach }]}>
                  <View style={s.interventionRow}>
                    <View style={s.interventionText}>
                      <Text style={[s.interventionTitle, { color: isDark ? c.cardDarkText : c.textPrimary }]}>{activity.title}</Text>
                      <Text style={[s.interventionMeta, { color: isDark ? 'rgba(255,255,255,0.6)' : c.textSecondary }]}>
                        {activity.duration} min · {activity.category.toLowerCase()}
                      </Text>
                      <Text style={[s.interventionCta, { color: isDark ? c.cardDarkText : c.accent }]}>
                        Start now →
                      </Text>
                    </View>
                    <View style={[s.interventionIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(107,142,107,0.12)' }]}>
                      <MaterialCommunityIcons
                        name={
                          activity.category === 'FOCUS' ? 'brain' :
                          activity.category === 'PHYSICAL' ? 'run' :
                          activity.category === 'MINDFULNESS' ? 'meditation' : 'weather-night'
                        }
                        size={48}
                        color={isDark ? c.cardDarkText : c.accent}
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Resources shortcut — boxes like Today's Task */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionTitle}>Resources</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Resources')}>
              <Text style={s.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {RESOURCE_HIGHLIGHTS.map((r, idx) => {
            const isDark = idx % 2 === 0;
            return (
              <TouchableOpacity key={r.label} activeOpacity={0.7} onPress={() => navigation.navigate('Resources')}>
                <View style={[s.resourceCard, { backgroundColor: isDark ? c.cardDark : c.cardPeach }]}>
                  <View style={s.resourceCardRow}>
                    <View style={s.resourceCardText}>
                      <Text style={[s.resourceCardTitle, { color: isDark ? c.cardDarkText : c.textPrimary }]}>{r.label}</Text>
                      <Text style={[s.resourceCardCta, { color: isDark ? c.cardDarkText : c.accent }]}>Browse →</Text>
                    </View>
                    <View style={[s.resourceCardIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(107,142,107,0.12)' }]}>
                      <Ionicons name={r.icon as any} size={32} color={isDark ? c.cardDarkText : c.accent} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(c: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scroll: { paddingHorizontal: 24, paddingTop: 20 },

    header: { marginBottom: 28 },
    headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    menuBtn: { padding: 6 },
    avatarCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: c.cardDark,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden' as const,
    },
    avatarText: { ...Typography.caption, color: c.cardDarkText, fontWeight: '600', fontFamily: 'Lato' },
    avatarImage: { position: 'absolute', width: 38, height: 38, borderRadius: 19 },
    menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-start', paddingTop: 60, paddingLeft: 16 },
    menuPanel: { backgroundColor: c.background, borderRadius: 16, paddingVertical: 8, paddingHorizontal: 4, maxWidth: 280 },
    menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 12 },
    menuItemText: { ...Typography.body, color: c.textPrimary, fontFamily: 'Lato' },
    menuDivider: { height: 1, backgroundColor: c.cardBorder, marginVertical: 4 },
    headerGreetingBlock: { gap: 8 },
    greeting: { fontSize: 32, lineHeight: 40, color: c.textPrimary, fontWeight: '400', fontFamily: 'Playfair Display' },
    greetingBold: { fontWeight: '700' },
    greetingSub: { ...Typography.body, fontSize: 15, color: c.textSecondary, marginTop: 4, fontFamily: 'Lato', lineHeight: 22 },
    subGreeting: { ...Typography.body, fontSize: 16, color: c.textSecondary, marginBottom: 16, fontFamily: 'Lato' },

    moodSection: { marginTop: 8, marginBottom: 28 },
    moodRow: { gap: 16, paddingVertical: 4 },
    moodItem: { alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingVertical: 6 },
    moodItemSelected: {},
    moodCircle: {
      width: 84,
      height: 84,
      borderRadius: 21,
      backgroundColor: c.cardDark,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    moodCircleSelected: {
      backgroundColor: '#F5F0E8',
      borderWidth: 1.5,
      borderColor: '#C8BFA8',
      shadowOpacity: 0.12,
      shadowRadius: 6,
    },
    moodLabel: { ...Typography.small, color: c.textPrimary, fontFamily: 'Lato', fontSize: 14 },
    moodLabelSelected: { color: c.textPrimary },

    section: { marginBottom: 28, gap: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: c.textPrimary, fontFamily: 'Lato', letterSpacing: -0.2 },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    seeAll: { ...Typography.caption, color: c.accent, fontFamily: 'Lato' },

    interventionCard: { padding: 22, borderRadius: 20 },
    interventionRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    interventionIcon: {
      width: 80,
      height: 80,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    interventionText: { flex: 1, gap: 4 },
    interventionTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Lato', letterSpacing: -0.2 },
    interventionMeta: { ...Typography.small, fontFamily: 'Lato' },
    interventionCta: { ...Typography.caption, fontWeight: '600', marginTop: 4, fontFamily: 'Lato' },

    resourceCard: { padding: 20, borderRadius: 20 },
    resourceCardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    resourceCardText: { flex: 1, gap: 6 },
    resourceCardTitle: { fontSize: 17, fontWeight: '600', fontFamily: 'Lato' },
    resourceCardCta: { ...Typography.caption, fontWeight: '600', fontFamily: 'Lato' },
    resourceCardIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
