// Src/Components/ui/appcomponents/AppCard.tsx
import React from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import theme from '../../../Utills/AppTheme';

const { COLORS, SIZES, SHADOWS } = theme;

export type CardVariant = 'default' | 'elevated' | 'premium' | 'blue' | 'blueLight' | 'blueBorder' | 'flat';

export interface AppCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  padded?: boolean;
}

export default function AppCard({ children, variant = 'default', onPress, style, padded = true }: AppCardProps) {
  const variantStyles: Record<CardVariant, ViewStyle> = {
    default: { backgroundColor: COLORS.white, ...SHADOWS.sm },
    elevated: { backgroundColor: COLORS.white, ...SHADOWS.md },
    premium: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.goldPrimary, ...SHADOWS.gold },
    blue: { backgroundColor: COLORS.primary, ...SHADOWS.blue },
    blueLight: { backgroundColor: COLORS.primaryPale, ...SHADOWS.sm },
    blueBorder: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.primary, ...SHADOWS.sm },
    flat: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  };

  const cardStyle: ViewStyle = {
    borderRadius: SIZES.radius.card,
    padding: padded ? SIZES.card.padding : 0,
    ...variantStyles[variant],
    ...style,
  };

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}
