// Src/Components/ui/appcomponents/AppCard.tsx
import React from 'react';
import { View, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import theme from '../../../Utills/AppTheme';

const { COLORS, SIZES, ELEVATION } = theme;

export type CardVariant = 'default' | 'elevated' | 'premium' | 'blue' | 'blueLight' | 'blueBorder' | 'flat';

export interface AppCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}

export default function AppCard({ children, variant = 'default', onPress, style, padded = true }: AppCardProps) {
  const variantStyles: Record<CardVariant, ViewStyle> = {
    default: { backgroundColor: COLORS.surface, ...ELEVATION.raised },
    elevated: { backgroundColor: COLORS.surface, ...ELEVATION.floating },
    premium: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderBrand, ...ELEVATION.brandGlow },
    blue: { backgroundColor: COLORS.brand, ...ELEVATION.brandGlow },
    blueLight: { backgroundColor: COLORS.accentSoft, ...ELEVATION.raised },
    blueBorder: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderAccent, ...ELEVATION.raised },
    flat: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  };

  const cardStyle: StyleProp<ViewStyle> = [
    {
      borderRadius: SIZES.radius.card,
      padding: padded ? SIZES.space.lg : 0,
      ...variantStyles[variant],
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}
