// Src/Components/ui/appcomponents/AppChip.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import theme from '../../../Utills/AppTheme';

const { COLORS, SIZES, FONTS } = theme;

export type ChipVariant = 'default' | 'blue' | 'gold' | 'outline';

export interface AppChipProps {
  label: string;
  variant?: ChipVariant;
  icon?: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function AppChip({ label, variant = 'default', icon, selected = false, onPress, onRemove, style }: AppChipProps) {
  const variantStyles: Record<ChipVariant, { bg: string; text: string; border?: string }> = {
    default: { bg: COLORS.gray100, text: COLORS.textSecondary },
    blue: { bg: COLORS.accentOpacity20, text: COLORS.accentDark },
    gold: { bg: COLORS.goldOpacity10, text: COLORS.goldDark },
    outline: { bg: COLORS.transparent, text: COLORS.textSecondary, border: COLORS.border },
  };
  const vc = selected ? { bg: COLORS.accentDark, text: COLORS.white } : variantStyles[variant];

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: vc.bg,
          borderRadius: SIZES.radius.full,
          paddingHorizontal: SIZES.padding.md,
          paddingVertical: SIZES.padding.xs,
          borderWidth: vc.border ? 1 : 0,
          borderColor: vc.border,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={14} color={vc.text} style={{ marginRight: 6 }} /> : null}
      <Text style={[FONTS.captionBold, { color: vc.text }]} numberOfLines={1}>
        {label}
      </Text>
      {onRemove ? (
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} style={{ marginLeft: 6 }}>
          <Icon name="close" size={14} color={vc.text} />
        </TouchableOpacity>
      ) : null}
    </Wrapper>
  );
}
