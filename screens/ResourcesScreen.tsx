import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import AppCard from '../components/AppCard';
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
      <View style={[st.chip, { backgroundColor: isSelected ? c.cardDark : c.cardBackground }]}>
        <Text style={[st.chipText, { color: isSelected ? c.cardDarkText : c.textSecondary }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
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

  const icon = cat.family === 'mci' ? (
    <MaterialCommunityIcons name={cat.name as any} size={20} color={cat.color} />
  ) : (
    <Ionicons name={cat.name as any} size={20} color={cat.color} />
  );

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
      <AppCard style={st.resourceCard}>
        <View style={st.resourceRow}>
          <View style={[st.iconWrap, { backgroundColor: `${cat.color}18` }]}>
            {icon}
          </View>
          <View style={st.resourceContent}>
            <Text style={st.resourceTitle}>{resource.title}</Text>
            <Text style={st.resourceDesc} numberOfLines={2}>{resource.description}</Text>
            {(resource.contactInfo || resource.link) && (
              <View style={st.resourceMeta}>
                <Ionicons
                  name={resource.link ? 'link-outline' : 'call-outline'}
                  size={12}
                  color={c.accent}
                />
                <Text style={st.resourceMetaText} numberOfLines={1}>
                  {resource.contactInfo ?? resource.link}
                </Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
        </View>
      </AppCard>
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
      {/* Header */}
      <View style={st.header}>
        <Text style={st.headerTitle}>Resources</Text>
        <Text style={st.headerSubtitle}>Support when you need it</Text>
      </View>

      {/* Category pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.chipScroll} contentContainerStyle={st.chipContainer}>
        {categories.map((cat) => (
          <CategoryChip key={cat} label={cat} isSelected={selectedCategory === cat} onPress={() => setSelectedCategory(cat)} />
        ))}
      </ScrollView>

      {/* Resources list */}
      <ScrollView contentContainerStyle={st.listContainer} showsVerticalScrollIndicator={false}>
        {RESOURCE_CATEGORIES.filter((cat) => selectedCategory === 'All' || selectedCategory === cat).map((cat) => {
          const catResources = filtered.filter((r) => r.category === cat);
          if (catResources.length === 0) return null;
          return (
            <View key={cat} style={st.categorySection}>
              <View style={st.categoryHeader}>
                {CATEGORY_ICONS[cat].family === 'mci' ? (
                  <MaterialCommunityIcons name={CATEGORY_ICONS[cat].name as any} size={16} color={CATEGORY_ICONS[cat].color} />
                ) : (
                  <Ionicons name={CATEGORY_ICONS[cat].name as any} size={16} color={CATEGORY_ICONS[cat].color} />
                )}
                <Text style={st.categoryTitle}>{cat}</Text>
              </View>
              {catResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </View>
          );
        })}

        {/* Emergency footer */}
        <View style={st.emergencyCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color={c.cardDarkText} />
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

    header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 4 },
    headerTitle: { ...Typography.title, color: c.textPrimary },
    headerSubtitle: { ...Typography.body, color: c.textSecondary, marginTop: 2 },

    chipScroll: { marginTop: 12, minHeight: 44, maxHeight: 44 },
    chipContainer: { paddingHorizontal: 24, paddingVertical: 4, gap: 8, alignItems: 'center' as const },
    chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    chipText: { ...Typography.caption },

    listContainer: { paddingHorizontal: 24, paddingTop: 16 },

    categorySection: { marginBottom: 24, gap: 10 },
    categoryHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    categoryTitle: { ...Typography.caption, color: c.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' },

    resourceCard: { padding: 16 },
    resourceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    resourceContent: { flex: 1, gap: 3 },
    resourceTitle: { ...Typography.subheadline, color: c.textPrimary },
    resourceDesc: { ...Typography.small, color: c.textSecondary, lineHeight: 18 },
    resourceMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    resourceMetaText: { ...Typography.small, color: c.accent, flex: 1 },

    emergencyCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      padding: 16,
      backgroundColor: c.cardDark,
      borderRadius: 16,
      marginTop: 8,
    },
    emergencyText: { ...Typography.small, color: c.cardDarkText, flex: 1, lineHeight: 18 },
  });
}
