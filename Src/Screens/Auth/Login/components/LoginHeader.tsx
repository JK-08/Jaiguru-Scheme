// Src/Screens/Auth/Login/components/LoginHeader.tsx
// -----------------------------------------------------------------------------
// Premium header: gold medallion logo with a looping shine sweep, brand name
// and trust subtitle. Fades + scales in on mount. Uses the global AppTheme.
// -----------------------------------------------------------------------------

import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import theme from '../../../../Utills/AppTheme';

const { COLORS, SIZES, FONTS, SHADOWS } = theme;
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);
const MEDALLION = SIZES.icon.xxxxl + SIZES.xl; // ~96 from theme scale

const MEDALLION_GRADIENT = COLORS.gradient.champagneGold as [string, string, string];
const SHINE_GRADIENT = COLORS.gradient.shine as [string, string, string];

export interface LoginHeaderProps {
  brand?: string;
  subtitle?: string;
  logoUrl?: string | null;
}

const LoginHeader: React.FC<LoginHeaderProps> = ({
  brand = 'Jaiguru Jewellers',
  subtitle = 'Trusted Digital Gold Savings',
  logoUrl,
}) => {
  const enter = useSharedValue(0);
  const shine = useSharedValue(0);

  useEffect(() => {
    enter.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) });
    shine.value = withDelay(
      500,
      withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }), -1, false),
    );
  }, [enter, shine]);

  const medallionStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { scale: interpolate(enter.value, [0, 1], [0.7, 1]) },
      { translateY: interpolate(enter.value, [0, 1], [12, 0]) },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: interpolate(enter.value, [0, 1], [16, 0]) }],
  }));

  const shineStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(shine.value, [0, 1], [-MEDALLION, MEDALLION]) },
      { rotateZ: '18deg' },
    ],
    opacity: interpolate(shine.value, [0, 0.5, 1], [0, 0.9, 0]),
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.medallionShadow, medallionStyle]}>
        <LinearGradient
          colors={MEDALLION_GRADIENT}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.9, y: 0.9 }}
          style={styles.medallion}
        >
          <View style={styles.logoInner}>
            {logoUrl ? (
              <Image source={{ uri: logoUrl }} style={styles.logoImg} resizeMode="contain" />
            ) : (
              <MaterialCommunityIcons name="gold" size={SIZES.icon.xxxl} color={COLORS.accentDark} />
            )}
          </View>

          {/* looping shine sweep */}
          <View style={styles.shineClip} pointerEvents="none">
            <AnimatedGradient
              colors={SHINE_GRADIENT}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.shine, shineStyle]}
            />
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.textBlock, textStyle]}>
        <Text style={styles.brand} accessibilityRole="header">
          {brand}
        </Text>
        {/* <View style={styles.subtitleRow}>
          <MaterialCommunityIcons name="shield-check" size={SIZES.icon.xs} color={COLORS.accentDark} />
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View> */}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap:10
  },
  medallionShadow: {
    borderRadius: MEDALLION / 2,
    ...SHADOWS.goldStrong,
    shadowColor: COLORS.accent,
  },
  medallion: {
    width: MEDALLION,
    height: MEDALLION,
    borderRadius: MEDALLION / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoInner: {
    width: MEDALLION - SIZES.md,
    height: MEDALLION - SIZES.md,
    borderRadius: (MEDALLION - SIZES.md) / 2,
    backgroundColor: COLORS.whiteOpacity80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.whiteOpacity90,
  },
  logoImg: {
    width: MEDALLION - SIZES.xl,
    height: MEDALLION - SIZES.xl,
    borderRadius: (MEDALLION - SIZES.xl) / 2,
  },
  shineClip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: MEDALLION / 2,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: -SIZES.lg,
    bottom: -SIZES.lg,
    width: SIZES.xl,
  },
  textBlock: {
    alignItems: 'center',
    marginTop: SIZES.md,
  },
  brand: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.font.xxxl,
    letterSpacing: 0.3,
    color: COLORS.textPrimary,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.xs,
  },
  subtitle: {
    fontFamily: FONTS.family.medium,
    fontSize: SIZES.font.sm,
    letterSpacing: 0.4,
    color: COLORS.textSecondary,
    marginLeft: SIZES.xs,
  },
});

export default React.memo(LoginHeader);
