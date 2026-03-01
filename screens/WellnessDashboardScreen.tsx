import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
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
import AppCard from '../components/AppCard';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { isSupabaseConfigured } from '../supabase/client';
import { fetchActivityLogs } from '../supabase/api';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Dashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MAX_BAR_HEIGHT = 56;

const RESOURCE_HIGHLIGHTS = [
  { label: 'Mental Health', icon: 'heart-outline' as const, color: '#A855F7' },
  { label: 'Nutrition', icon: 'nutrition' as const, color: '#22C55E' },
  { label: 'Support', icon: 'business-outline' as const, color: '#3B82F6' },
];

export default function WellnessDashboardScreen() {
  const c = useColors();
  const s = useMemo(() => makeStyles(c), [c]);
  const navigation = useNavigation<Nav>();
  const currentUser = useAppStore((s) => s.currentUser);
  const activityLogs = useAppStore((s) => s.activityLogs);
  const hydrateActivityLogs = useAppStore((s) => s.hydrateActivityLogs);
  const userName = currentUser?.name ?? 'there';

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
  }, [currentUser?.id]);
  const firstName = userName.split(' ')[0];
  const streak = currentUser?.streak ?? 0;
  const sessionsCompleted = currentUser?.sessionsCompleted ?? 0;

  const weeklyData = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const log of activityLogs) {
      const d = new Date(log.completedAt);
      d.setHours(0, 0, 0, 0);
      const diff = Math.floor((d.getTime() - monday.getTime()) / 86400000);
      if (diff >= 0 && diff < 7) counts[diff] += 1;
    }

    const max = Math.max(...counts, 1);
    return counts.map((c) => c / max);
  }, [activityLogs]);

  const todayIndex = useMemo(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  }, []);

  const handleActivityPress = (activity: WellnessActivity) => {
    navigation.navigate('ActivityGuide', { activityId: activity.id });
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.greeting}>Hey {firstName}</Text>
            <Text style={s.subGreeting}>How are you feeling today?</Text>
          </View>
          <View style={s.avatarCircle}>
            <Text style={s.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          <AppCard style={s.statCard}>
            <Ionicons name="flame-outline" size={18} color={c.warm} />
            <Text style={s.statValue}>{streak}</Text>
            <Text style={s.statLabel}>day streak</Text>
          </AppCard>
          <AppCard style={s.statCard}>
            <Ionicons name="checkmark-done-outline" size={18} color={c.accent} />
            <Text style={s.statValue}>{sessionsCompleted}</Text>
            <Text style={s.statLabel}>sessions</Text>
          </AppCard>
          <AppCard style={s.statCard}>
            <Ionicons name="time-outline" size={18} color={c.sosBlue} />
            <Text style={s.statValue}>{activityLogs.reduce((sum, l) => sum + l.durationMinutes, 0)}</Text>
            <Text style={s.statLabel}>min total</Text>
          </AppCard>
        </View>

        {/* Micro-interventions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Quick interventions</Text>

          {sampleActivities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              activeOpacity={0.7}
              onPress={() => handleActivityPress(activity)}
            >
              <AppCard style={s.interventionCard}>
                <View style={s.interventionRow}>
                  <View style={[s.interventionIcon, { backgroundColor: ActivityCategoryColors[activity.category] + '20' }]}>
                    <MaterialCommunityIcons
                      name={
                        activity.category === 'FOCUS' ? 'brain' :
                        activity.category === 'PHYSICAL' ? 'run' :
                        activity.category === 'MINDFULNESS' ? 'meditation' : 'weather-night'
                      }
                      size={20}
                      color={ActivityCategoryColors[activity.category]}
                    />
                  </View>
                  <View style={s.interventionText}>
                    <Text style={s.interventionTitle}>{activity.title}</Text>
                    <Text style={s.interventionMeta}>{activity.duration} min · {activity.category.toLowerCase()}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
                </View>
              </AppCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weekly Snapshot */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>This week</Text>
          <AppCard style={s.weeklyCard}>
            <View style={s.weeklyHeaderRow}>
              <Text style={s.weeklyLabel}>Sessions completed</Text>
              <Text style={s.weeklyTrend}>{activityLogs.length > 0 ? `${activityLogs.length} total` : 'No data yet'}</Text>
            </View>
            <View style={s.chartContainer}>
              {DAY_LABELS.map((label, index) => {
                const isToday = index === todayIndex;
                const value = weeklyData[index];
                return (
                  <View key={index} style={s.barColumn}>
                    <View
                      style={[
                        s.bar,
                        {
                          height: Math.max(value * MAX_BAR_HEIGHT, value > 0 ? 6 : 2),
                          backgroundColor: isToday ? c.accent : value > 0 ? c.accentGlow : c.cardBorder,
                          borderRadius: 4,
                        },
                      ]}
                    />
                    <Text style={[s.barLabel, isToday && { color: c.accent }]}>{label}</Text>
                  </View>
                );
              })}
            </View>
          </AppCard>
        </View>

        {/* Resources shortcut */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionTitle}>Resources</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Resources')}>
              <Text style={s.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={s.resourceChips}>
            {RESOURCE_HIGHLIGHTS.map((r) => (
              <TouchableOpacity key={r.label} activeOpacity={0.7} onPress={() => navigation.navigate('Resources')} style={s.resourceChip}>
                <Ionicons name={r.icon as any} size={16} color={r.color} />
                <Text style={s.resourceChipText}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(c: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scroll: { paddingHorizontal: 24, paddingTop: 16 },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    headerLeft: { gap: 2 },
    greeting: { ...Typography.title, color: c.textPrimary },
    subGreeting: { ...Typography.body, color: c.textSecondary },
    avatarCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { ...Typography.subheadline, color: c.background, fontWeight: '600' },

    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4 },
    statValue: { ...Typography.headline, color: c.textPrimary },
    statLabel: { ...Typography.small, color: c.textMuted },

    section: { marginBottom: 28, gap: 12 },
    sectionTitle: { ...Typography.caption, color: c.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    seeAll: { ...Typography.caption, color: c.accent },

    interventionCard: { padding: 14 },
    interventionRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    interventionIcon: {
      width: 42,
      height: 42,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    interventionText: { flex: 1, gap: 2 },
    interventionTitle: { ...Typography.subheadline, color: c.textPrimary },
    interventionMeta: { ...Typography.small, color: c.textMuted },

    weeklyCard: { padding: 18 },
    weeklyHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
    weeklyLabel: { ...Typography.caption, color: c.textSecondary },
    weeklyTrend: { ...Typography.caption, color: c.accent },
    chartContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 72, gap: 10 },
    barColumn: { flex: 1, alignItems: 'center', gap: 6 },
    bar: { width: 20 },
    barLabel: { ...Typography.small, color: c.textMuted },

    resourceChips: { flexDirection: 'row', gap: 10 },
    resourceChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      backgroundColor: c.cardBackground,
      borderRadius: 10,
    },
    resourceChipText: { ...Typography.small, color: c.textSecondary },
  });
}
