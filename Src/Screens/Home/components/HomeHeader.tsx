// Src/Screens/Home/components/HomeHeader.tsx
// -----------------------------------------------------------------------------
// Premium Home header: curved gold gradient with floating particles + shimmer,
// greeting + avatar + notifications + quick actions, and floating summary cards
// (gold rate · scheme · wallet). Dummy-data by default; every prop is typed so
// it can be wired to the backend later.
// -----------------------------------------------------------------------------

import React, { useEffect } from 'react';
import { Dimensions, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import theme from '../../../Utills/AppTheme';
import GoldParticles from '../../Auth/Login/components/GoldParticles';
import GreetingSection from './GreetingSection';
import ProfileAvatar from './ProfileAvatar';
// import NotificationButton from './NotificationButton';
import GoldRateCard from './GoldRateCard';

import {
  getGreeting,
  type CustomerProfile,
  type SchemeSummary,
  type WalletStat,
} from './homeHeaderData';

const { COLORS, SIZES } = theme;
const { width } = Dimensions.get('window');

const HEADER_GRADIENT = COLORS.gradient.champagneGold as [string, string, string];
const SHINE_GRADIENT = COLORS.gradient.shine as [string, string, string];
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export interface HomeHeaderProps {
  profile: CustomerProfile;
  goldValue?: number | null;
  silverValue?: number | null;
  ratesLoading?: boolean;
  ratesError?: string | null;
  ratesUpdatedAt?: string;
  scheme?: SchemeSummary;
  wallet?: readonly WalletStat[];
  unreadCount?: number;
  refreshingRate?: boolean;
  onProfilePress?: () => void;
  onNotificationsPress?: () => void;
  onScanPress?: () => void;
  onSupportPress?: () => void;
  onSettingsPress?: () => void;
  onRefreshRate?: () => void | Promise<void>;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  profile,
  goldValue = null,
  silverValue = null,
  ratesLoading = false,
  ratesError = null,
  ratesUpdatedAt,
  unreadCount = 3,
  refreshingRate = false,
  onProfilePress,
  onNotificationsPress,
  onRefreshRate,
}) => {
  const insets = useSafeAreaInsets();

  // Slow shimmer sweep across the curved header.
  const shine = useSharedValue(0);
  useEffect(() => {
    shine.value = withRepeat(withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.quad) }), -1, false);
  }, [shine]);

  const shineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shine.value, [0, 1], [-width, width]) }, { rotateZ: '18deg' }],
    opacity: interpolate(shine.value, [0, 0.5, 1], [0, 0.5, 0]),
  }));

  return (
    <View style={styles.wrap}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Curved gold header */}
      <LinearGradient
        colors={HEADER_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.curve, { paddingTop: insets.top + SIZES.md }]}
      >
        {/* particles + shimmer */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <GoldParticles width={width} height={width * 0.7} />
          <View style={styles.shineClip} pointerEvents="none">
            <AnimatedGradient
              colors={SHINE_GRADIENT}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.shine, shineStyle]}
            />
          </View>
        </View>

        {/* Top row: greeting + avatar/notification */}
        <View style={styles.topRow}>
          <View style={styles.greetingWrap}>
            <GreetingSection greeting={getGreeting()} name={profile.name} />
          </View>

          <View style={styles.actionsCol}>
            <View style={styles.avatarRow}>
              {/* <NotificationButton count={unreadCount} onPress={onNotificationsPress} /> */}
              <ProfileAvatar name={profile.name} imageUrl={profile.avatarUrl} onPress={onProfilePress} />
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Floating cards overlapping the curve */}
      <View style={styles.cards}>
        <GoldRateCard
          gold={goldValue}
          silver={silverValue}
          loading={ratesLoading}
          error={ratesError}
          lastUpdated={ratesUpdatedAt}
          onRefresh={onRefreshRate}
          refreshing={refreshingRate}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  curve: {
    borderBottomLeftRadius: SIZES.radius.xxxl,
    borderBottomRightRadius: SIZES.radius.xxxl,
    paddingHorizontal: SIZES.padding.container,
    paddingBottom: SIZES.xxl + SIZES.lg,
    overflow: 'hidden',
  },
  shineClip: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: -SIZES.xxl,
    bottom: -SIZES.xxl,
    width: SIZES.xxl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingWrap: { flex: 1, paddingRight: SIZES.md },
  actionsCol: { alignItems: 'flex-end' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  quickWrap: { marginTop: SIZES.md },
  cards: {
    marginTop: -SIZES.xxl,
    paddingHorizontal: SIZES.padding.container,
  },
  cardGap: { marginTop: SIZES.md },
});

export default React.memo(HomeHeader);
