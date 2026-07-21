// Src/Components/ui/appcomponents/AppButton.tsx
import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  StyleProp,
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
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
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
    primary: { bg: COLORS.accentDark, border: COLORS.accentDark, text: COLORS.white, loaderColor: COLORS.white },
    secondary: { bg: COLORS.gray100, border: COLORS.gray100, text: COLORS.textPrimary, loaderColor: COLORS.accentDark },
    outline: { bg: 'transparent', border: COLORS.accentDark, text: COLORS.accentDark, loaderColor: COLORS.accentDark },
    ghost: { bg: 'transparent', border: 'transparent', text: COLORS.textSecondary, loaderColor: COLORS.accentDark },
    danger: { bg: COLORS.error, border: COLORS.error, text: COLORS.white, loaderColor: COLORS.white },
    gold: { bg: COLORS.goldPrimary, border: COLORS.goldPrimary, text: COLORS.accentDark, loaderColor: COLORS.accentDark },
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
      // The passed-in `style` (e.g. `{ flex: 1 }` for side-by-side buttons in
      // a row) has to land on THIS outer wrapper, since it's the actual flex
      // child laid out by the parent row. Previously `style` only reached the
      // inner Animated.View below, so with fullWidth's default `width: '100%'`
      // still on this outer view, two buttons in a row would each claim the
      // full row width and overlap/clip each other — the "Confirm/Cancel
      // buttons not showing" bug.
      style={[fullWidth && { width: '100%' }, style]}
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
