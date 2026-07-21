// Src/Screens/Auth/Mpin/MpinScaffold.tsx
// -----------------------------------------------------------------------------
// Shared premium shell for every MPIN screen (Create / Verify / Forgot / OTP /
// Reset). Champagne background + floating gold particles + transparent header +
// shimmering gold medallion + heading/subtitle, then renders the screen's own
// content (PIN inputs, buttons, etc.) inside a keyboard-avoiding scroll.
// -----------------------------------------------------------------------------

import React, { useEffect } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import theme from '../../../Utills/AppTheme';
import CommonHeader from '../../../Components/CommonHeader/CommonHeader';
import GoldParticles from '../Login/components/GoldParticles';

const { COLORS, SIZES, FONTS, SHADOWS } = theme;
const { width, height } = Dimensions.get('window');

const BG_GRADIENT = COLORS.gradient.champagneSurface as [string, string, string];
const MEDALLION_GRADIENT = COLORS.gradient.champagneGold as [string, string, string];
const MEDALLION = SIZES.icon.xxxxl + SIZES.md;

type MCName = keyof typeof MaterialCommunityIcons.glyphMap;

export interface MpinScaffoldProps {
  headerTitle: string;
  icon: MCName;
  heading: string;
  subtitle?: string;
  children: React.ReactNode;
  showBack?: boolean;
  onBackPress?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
}

const MpinScaffold: React.FC<MpinScaffoldProps> = ({
  headerTitle,
  icon,
  heading,
  subtitle,
  children,
  showBack = true,
  onBackPress,
  contentStyle,
}) => {
  const enter = useSharedValue(0);
  const insets = useSafeAreaInsets();
  // Header height: status bar + common header (~56dp)
  const headerOffset = insets.top + 56;
  useEffect(() => {
    enter.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) });
  }, [enter]);

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: interpolate(enter.value, [0, 1], [30, 0]) }],
  }));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient colors={BG_GRADIENT} style={StyleSheet.absoluteFill} />
        <GoldParticles width={width} height={height} />
      </View>

      <CommonHeader
        title={headerTitle}
        transparent
        borderBottom={false}
        shadow={false}
        showBack={showBack}
        onBackPress={onBackPress ?? null}
      />

      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={headerOffset}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <Animated.View style={bodyStyle}>
              <View style={styles.medallionWrap}>
                <LinearGradient
                  colors={MEDALLION_GRADIENT}
                  style={styles.medallion}
                  start={{ x: 0.1, y: 0.1 }}
                  end={{ x: 0.9, y: 0.9 }}
                >
                  <View style={styles.medallionInner}>
                    <MaterialCommunityIcons name={icon} size={SIZES.icon.xxl} color={COLORS.accentDark} />
                  </View>
                </LinearGradient>
              </View>

              <Text style={styles.heading} accessibilityRole="header">
                {heading}
              </Text>
              {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

              <View style={[styles.content, contentStyle]}>{children}</View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SIZES.padding.container,
    paddingTop: SIZES.md,
    paddingBottom: SIZES.xl,
  },
  medallionWrap: {
    alignSelf: 'center',
    borderRadius: MEDALLION / 2,
    ...SHADOWS.goldStrong,
    shadowColor: COLORS.accent,
    marginBottom: SIZES.lg,
  },
  medallion: {
    width: MEDALLION,
    height: MEDALLION,
    borderRadius: MEDALLION / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medallionInner: {
    width: MEDALLION - SIZES.md,
    height: MEDALLION - SIZES.md,
    borderRadius: (MEDALLION - SIZES.md) / 2,
    backgroundColor: COLORS.whiteOpacity80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.heading.h3,
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.md,
    lineHeight: SIZES.font.md * 1.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.sm,
    paddingHorizontal: SIZES.md,
  },
  content: {
    marginTop: SIZES.xl,
  },
});

export default React.memo(MpinScaffold);
