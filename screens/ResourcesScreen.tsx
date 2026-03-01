import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../components/theme/useColors';
import { ColorPalette } from '../components/theme/colors';
import { Typography } from '../components/theme/typography';
import { sampleResources } from '../store/mockData';
import { isSupabaseConfigured } from '../supabase/client';
import { fetchResources as apiFetchResources } from '../supabase/api';
import {
  Resource,
  ResourceCategory,
  RESOURCE_CATEGORIES,
} from '../store/types';

const CATEGORY_ICONS: Record<ResourceCategory, { name: string; family: 'ion' | 'mci'; color: string }> = {
  'Mental Health': { name: 'heart-outline', family: 'ion', color: '#A855F7' },
  'Nutrition': { name: 'nutrition', family: 'mci', color: '#22C55E' },
  'Spiritual Support': { name: 'leaf-outline', family: 'ion', color: '#F59E0B' },
  'Institutional Support': { name: 'business-outline', family: 'ion', color: '#3B82F6' },
};

function CategoryChip({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const c = useColors();
  const st = React.useMemo(() => makeStyles(c), [c]);
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <View style={[st.chip, st.chipBase, isSelected && st.chipSelected]}>
        <Text style={[st.chipText, isSelected ? st.chipTextSelected : st.chipTextBase]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

function ResourceCard({ resource, isDark }: { resource: Resource; isDark: boolean }) {
  const c = useColors();
  const st = React.useMemo(() => makeStyles(c), [c]);
  const cat = CATEGORY_ICONS[resource.category];

  const handlePress = () => {
    if (resource.link) {
      Linking.openURL(resource.link).catch(() =>
        Alert.alert('Cannot open link', resource.link),
      );
    } else if (resource.contactInfo) {
      Alert.alert(resource.title, resource.contactInfo);
    }
  };

  const IconComp = cat.family === 'mci' ? MaterialCommunityIcons : Ionicons;
  const iconColor = isDark ? c.cardDarkText : c.accent;

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
      <View style={[st.resourceBox, { backgroundColor: isDark ? c.cardDark : c.cardPeach }]}>
        <View style={st.resourceBoxRow}>
          <View style={st.resourceBoxText}>
            <Text style={[st.resourceBoxTitle, { color: isDark ? c.cardDarkText : c.textPrimary }]}>{resource.title}</Text>
            <Text style={[st.resourceBoxDesc, { color: isDark ? 'rgba(255,255,255,0.7)' : c.textSecondary }]} numberOfLines={2}>
              {resource.description}
            </Text>
            <Text style={[st.resourceBoxCta, { color: isDark ? c.cardDarkText : c.accent }]}>Learn more →</Text>
          </View>
          <View style={[st.resourceBoxIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(107,142,107,0.12)' }]}>
            <IconComp name={cat.name as any} size={36} color={iconColor} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ResourcesScreen() {
  const c = useColors();
  const st = React.useMemo(() => makeStyles(c), [c]);
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'All'>('All');
  const [resources, setResources] = useState<Resource[]>(sampleResources);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    apiFetchResources().then(({ data }) => {
      if (data && data.length > 0) {
        setResources(
          data.map((r: any) => ({
            id: r.id,
            title: r.title,
            category: r.category as ResourceCategory,
            description: r.description,
            contactInfo: r.contact_info ?? undefined,
            link: r.link ?? undefined,
          })),
        );
      }
    });
  }, []);

  const filtered = useMemo(() => {
    if (selectedCategory === 'All') return resources;
    return resources.filter((r) => r.category === selectedCategory);
  }, [selectedCategory, resources]);

  const categories: (ResourceCategory | 'All')[] = ['All', ...RESOURCE_CATEGORIES];

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        {/* Header — same feel as home */}
        <View style={st.header}>
          <Text style={st.headerTitle}>Resources</Text>
          <Text style={st.headerSubtitle}>Support when you need it</Text>
        </View>

        {/* Category filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.chipScroll} contentContainerStyle={st.chipContainer}>
          {categories.map((cat) => (
            <CategoryChip key={cat} label={cat} isSelected={selectedCategory === cat} onPress={() => setSelectedCategory(cat)} />
          ))}
        </ScrollView>

        {/* Resource cards — home-style boxes */}
        <View style={st.resourceSection}>
          {filtered.map((resource, idx) => (
            <ResourceCard key={resource.id} resource={resource} isDark={idx % 2 === 0} />
          ))}
        </View>

        {/* Emergency footer */}
        <View style={st.emergencyCard}>
          <Ionicons name="shield-checkmark-outline" size={22} color={c.cardDarkText} />
          <Text style={st.emergencyText}>
            If you or someone you know is in immediate danger, call 911 or your local emergency number.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(c: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scroll: { paddingBottom: 24 },

    header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 },
    headerTitle: { fontSize: 32, fontWeight: '400', fontFamily: 'Playfair Display', color: c.textPrimary },
    headerSubtitle: { ...Typography.body, color: c.textSecondary, marginTop: 8, fontFamily: 'Lato', lineHeight: 22 },

    chipScroll: { marginTop: 8 },
    chipContainer: { paddingHorizontal: 24, paddingVertical: 12, paddingRight: 48, gap: 10, alignItems: 'center' as const },
    chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    chipBase: { backgroundColor: c.cardBackground, borderWidth: 1, borderColor: c.cardBorder },
    chipSelected: { backgroundColor: c.accent, borderColor: c.accent },
    chipText: { ...Typography.caption, fontFamily: 'Lato' },
    chipTextBase: { color: c.textSecondary },
    chipTextSelected: { color: c.cardDarkText },

    resourceSection: { paddingHorizontal: 24, paddingTop: 20, gap: 12 },
    resourceBox: { padding: 22, borderRadius: 20 },
    resourceBoxRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    resourceBoxText: { flex: 1, gap: 6 },
    resourceBoxTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Lato', letterSpacing: -0.2 },
    resourceBoxDesc: { ...Typography.small, fontFamily: 'Lato', lineHeight: 20 },
    resourceBoxCta: { ...Typography.caption, fontWeight: '600', marginTop: 4, fontFamily: 'Lato' },
    resourceBoxIcon: {
      width: 72,
      height: 72,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },

    emergencyCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      padding: 20,
      backgroundColor: c.cardDark,
      borderRadius: 20,
      marginTop: 24,
      marginHorizontal: 24,
    },
    emergencyText: { ...Typography.body, color: c.cardDarkText, flex: 1, lineHeight: 22, fontFamily: 'Lato' },
  });
}
