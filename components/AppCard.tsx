import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useColors } from './theme/useColors';

interface AppCardProps {
  filled?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function AppCard({ filled = true, children, style }: AppCardProps) {
  const c = useColors();
  return (
    <View
      style={[
        { borderRadius: 14, overflow: 'hidden' as const },
        filled
          ? { backgroundColor: c.cardBackground }
          : { backgroundColor: 'transparent', borderWidth: 1, borderColor: c.cardBorder },
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface SelectionCardProps {
  isSelected: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function SelectionCard({ isSelected, children, style }: SelectionCardProps) {
  const c = useColors();
  return (
    <View
      style={[
        { borderRadius: 14, overflow: 'hidden' as const, backgroundColor: c.cardBackground },
        { borderWidth: isSelected ? 1.5 : 1, borderColor: isSelected ? c.accent : c.cardBorder },
        style,
      ]}
    >
      {children}
    </View>
  );
}
