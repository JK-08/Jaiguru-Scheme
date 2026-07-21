// Src/Components/ui/appcomponents/AppBadge.tsx
import React from 'react';
import { View, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import theme from '../../../Utills/AppTheme';

const { COLORS, SIZES, FONTS } = theme;

export type BadgeVariant = 'primary' | 'gold' | 'success' | 'error' | 'warning' | 'outline' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface AppBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function AppBadge({ label, variant = 'primary', size = 'md', style, textStyle }: AppBadgeProps) {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; border?: string }> = {
    primary: { bg: COLORS.accentDark, text: COLORS.white },
    gold: { bg: COLORS.goldPrimary, text: COLORS.accentDark },
    success: { bg: COLORS.success, text: COLORS.white },
    error: { bg: COLORS.error, text: COLORS.white },
    warning: { bg: COLORS.warning, text: COLORS.white },
    outline: { bg: COLORS.transparent, text: COLORS.accentDark, border: COLORS.accentDark },
    neutral: { bg: COLORS.gray100, text: COLORS.textSecondary },
  };
  const vc = variantStyles[variant];

  return (
    <View
      style={[
        {
          backgroundColor: vc.bg,
          borderRadius: SIZES.radius.full,
          paddingHorizontal: size === 'sm' ? SIZES.padding.sm : SIZES.padding.md,
          paddingVertical: size === 'sm' ? 2 : SIZES.padding.xs,
          alignSelf: 'flex-start',
          borderWidth: vc.border ? 1 : 0,
          borderColor: vc.border,
        },
        style,
      ]}
    >
      <Text
        style={[
          FONTS.captionBold,
          { color: vc.text, fontSize: size === 'sm' ? SIZES.font.xxs : SIZES.font.xs },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}
