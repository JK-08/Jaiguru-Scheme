// Src/Components/ui/appcomponents/AppEmptyState.tsx
import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import theme from '../../../Utills/AppTheme';
import AppButton from './AppButton';

const { COLORS, SIZES, FONTS } = theme;

export interface AppEmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
}

export default function AppEmptyState({
  icon = 'file-tray-outline',
  title,
  message,
  actionLabel,
  onAction,
  style,
  iconSize = 56,
}: AppEmptyStateProps) {
  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center', padding: SIZES.padding.xxl }, style]}>
      <View
        style={{
          width: iconSize + 32,
          height: iconSize + 32,
          borderRadius: (iconSize + 32) / 2,
          backgroundColor: COLORS.primaryPale,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: SIZES.margin.lg,
        }}
      >
        <Icon name={icon} size={iconSize} color={COLORS.primary} />
      </View>

      <Text style={[FONTS.h5, { textAlign: 'center', marginBottom: message ? 6 : 0 }]}>{title}</Text>

      {message && (
        <Text style={[FONTS.bodySmall, { textAlign: 'center', color: COLORS.textSecondary, marginBottom: actionLabel ? SIZES.margin.lg : 0 }]}>
          {message}
        </Text>
      )}

      {actionLabel && onAction && (
        <View style={{ width: '70%', marginTop: SIZES.margin.sm }}>
          <AppButton label={actionLabel} onPress={onAction} variant="primary" size="md" />
        </View>
      )}
    </View>
  );
}
