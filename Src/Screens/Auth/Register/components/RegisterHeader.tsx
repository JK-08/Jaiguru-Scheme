// Src/Screens/Auth/Register/components/RegisterHeader.tsx
// -----------------------------------------------------------------------------
// Premium header: reuses the shimmering gold medallion from the Login screen,
// then adds the "Create Account" title + subtitle (fade / slide-down).
// -----------------------------------------------------------------------------

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import theme from '../../../../Utills/AppTheme';
import LoginHeader from '../../Login/components/LoginHeader';

const { COLORS, SIZES, FONTS } = theme;

export interface RegisterHeaderProps {
  logoUrl?: string | null;
  title?: string;
  subtitle?: string;
}

const RegisterHeader: React.FC<RegisterHeaderProps> = ({
  logoUrl,
  title = 'Create Account',
  subtitle = 'Start your digital gold savings journey today.',
}) => {
  const enter = useSharedValue(0);
  useEffect(() => {
    enter.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) });
  }, [enter]);

  const textStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: interpolate(enter.value, [0, 1], [-14, 0]) }],
  }));

  return (
    <View style={styles.wrap}>
      <LoginHeader logoUrl={logoUrl} />
      <Animated.View style={[styles.textBlock, textStyle]}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  textBlock: {
    alignItems: 'center',
    marginTop: SIZES.xs,
  },
  title: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.heading.h3,
    letterSpacing: -0.3,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.md,
    lineHeight: SIZES.font.md * 1.5,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
    maxWidth: 300,
  },
});

export default React.memo(RegisterHeader);
