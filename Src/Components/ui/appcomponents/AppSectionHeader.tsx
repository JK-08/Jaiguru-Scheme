// Src/Components/ui/appcomponents/AppSectionHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import theme from '../../../Utills/AppTheme';

const { COLORS, FONTS, SIZES } = theme;

export interface AppSectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function AppSectionHeader({ title, actionLabel, onActionPress, style }: AppSectionHeaderProps) {
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SIZES.margin.md },
        style,
      ]}
    >
      <Text style={FONTS.h5}>{title}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onActionPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[FONTS.bodyMedium, { color: COLORS.primary }]}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
