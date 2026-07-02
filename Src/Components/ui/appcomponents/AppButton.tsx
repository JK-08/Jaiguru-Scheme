// Src/Components/ui/appcomponents/AppButton.tsx
import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import theme from '../../../Utills/AppTheme';

const { COLORS, FONTS, SIZES, SHADOWS, moderateScale } = theme;

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  iconSize?: number;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  iconSize,
  fullWidth = true,
  style,
  textStyle,
}: AppButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const onIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 24 }).start();

  const isDisabled = disabled || loading;

  const heights: Record<ButtonSize, number> = {
    sm: moderateScale(38),
    md: moderateScale(48),
    lg: moderateScale(56),
  };
  const fontSizes: Record<ButtonSize, number> = { sm: SIZES.font.sm, md: SIZES.font.md, lg: SIZES.font.lg };
  const iconSizes: Record<ButtonSize, number> = { sm: 16, md: 20, lg: 22 };

  type VariantColors = { bg: string; border: string; text: string; loaderColor: string };
  const variants: Record<ButtonVariant, VariantColors> = {
    primary: { bg: COLORS.primary, border: COLORS.primary, text: COLORS.white, loaderColor: COLORS.white },
    secondary: { bg: COLORS.gray100, border: COLORS.gray100, text: COLORS.textPrimary, loaderColor: COLORS.primary },
    outline: { bg: 'transparent', border: COLORS.primary, text: COLORS.primary, loaderColor: COLORS.primary },
    ghost: { bg: 'transparent', border: 'transparent', text: COLORS.textSecondary, loaderColor: COLORS.primary },
    danger: { bg: COLORS.error, border: COLORS.error, text: COLORS.white, loaderColor: COLORS.white },
    gold: { bg: COLORS.goldPrimary, border: COLORS.goldPrimary, text: COLORS.primary, loaderColor: COLORS.primary },
  };
  const vc = variants[variant];
  const iSize = iconSize ?? iconSizes[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onIn}
      onPressOut={onOut}
      activeOpacity={1}
      disabled={isDisabled}
      style={fullWidth ? { width: '100%' } : undefined}
    >
      <Animated.View
        style={[
          styles.btn,
          {
            height: heights[size],
            backgroundColor: isDisabled ? COLORS.gray200 : vc.bg,
            borderColor: isDisabled ? COLORS.gray200 : vc.border,
            borderWidth: variant === 'outline' ? 1.5 : 0,
            transform: [{ scale }],
            ...(variant === 'primary' || variant === 'danger' ? SHADOWS.md : {}),
            ...(variant === 'gold' ? SHADOWS.gold : {}),
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={vc.loaderColor} size="small" />
        ) : (
          <>
            {leftIcon && (
              <Icon
                name={leftIcon}
                size={iSize}
                color={isDisabled ? COLORS.textDisabled : vc.text}
                style={{ marginRight: 6 }}
              />
            )}
            <Text
              style={[
                styles.label,
                { fontSize: fontSizes[size], color: isDisabled ? COLORS.textDisabled : vc.text, fontFamily: FONTS.family.semiBold },
                textStyle,
              ]}
            >
              {label}
            </Text>
            {rightIcon && (
              <Icon
                name={rightIcon}
                size={iSize}
                color={isDisabled ? COLORS.textDisabled : vc.text}
                style={{ marginLeft: 6 }}
              />
            )}
          </>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radius.button,
    paddingHorizontal: SIZES.padding.xl,
  },
  label: {
    letterSpacing: 0.3,
  },
});
