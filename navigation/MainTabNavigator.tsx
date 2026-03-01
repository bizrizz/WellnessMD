import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WellnessDashboardScreen from '../screens/WellnessDashboardScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import PeerSupportScreen from '../screens/PeerSupportScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { MainTabParamList } from './types';
import { useColors } from '../components/theme/useColors';

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabItem = { name: keyof MainTabParamList; icon: string; label: string };

const TABS: TabItem[] = [
  { name: 'Dashboard', icon: 'grid', label: 'Home' },
  { name: 'Resources', icon: 'book', label: 'Resources' },
  { name: 'Community', icon: 'people', label: 'Community' },
  { name: 'Profile', icon: 'person', label: 'Profile' },
];

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const c = useColors();

  const renderTab = (tab: TabItem) => {
    const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
    const isFocused = state.index === routeIndex;
    const iconName = (isFocused ? tab.icon : `${tab.icon}-outline`) as keyof typeof Ionicons.glyphMap;

    return (
      <TouchableOpacity
        key={tab.name}
        style={{ flex: 1, alignItems: 'center', gap: 4 }}
        onPress={() => navigation.navigate(tab.name)}
      >
        <Ionicons name={iconName} size={22} color={isFocused ? c.accent : c.textMuted} />
        <Text style={{ fontSize: 10, fontWeight: '500', color: isFocused ? c.accent : c.textMuted }}>{tab.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        paddingHorizontal: 8,
        paddingBottom: insets.bottom || 28,
        backgroundColor: c.backgroundSecondary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
      }}
    >
      {TABS.map(renderTab)}
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={WellnessDashboardScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
      <Tab.Screen name="Community" component={PeerSupportScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
