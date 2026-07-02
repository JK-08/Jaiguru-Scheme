// Src/Components/ui/appcomponents/AppText.tsx
import React from 'react';
import { Text, StyleProp, TextStyle } from 'react-native';
import theme from '../../../Utills/AppTheme';

const { FONTS, COLORS } = theme;

export type TextVariant =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'bodyLarge' | 'body' | 'bodyMedium' | 'bodySmall' | 'bodyBold'
  | 'caption' | 'captionBold' | 'label' | 'labelUppercase'
  | 'button' | 'buttonLarge' | 'buttonSmall'
  | 'goldText' | 'blueText';

export interface AppTextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
}

export default function AppText({
  children,
  variant = 'body',
  color,
  align = 'left',
  numberOfLines,
  style,
}: AppTextProps) {
  const variantStyle: TextStyle = (FONTS as any)[variant] ?? FONTS.body;

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        variantStyle,
        { textAlign: align, color: color ?? (variantStyle as any).color ?? COLORS.textPrimary },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
