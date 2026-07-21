// Src/Screens/Home/components/GoldRateCard.tsx
// -----------------------------------------------------------------------------
// Floating premium "Today's Rate" card driven by the real /account/todayrate
// data (GOLD + SILVER per gram). LIVE badge, loading/error states and an
// animated refresh button.
// -----------------------------------------------------------------------------

import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import theme from '../../../Utills/AppTheme';

const { COLORS, SIZES, FONTS, SHADOWS } = theme;

export interface GoldRateCardProps {
  gold?: number | null;
  silver?: number | null;
  loading?: boolean;
  error?: string | null;
  lastUpdated?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const formatINR = (n: number) => `₹ ${n.toLocaleString('en-IN')}`;

const GoldRateCard: React.FC<GoldRateCardProps> = ({
  gold,
  silver,
  loading = false,
  error = null,
  lastUpdated,
  onRefresh,
  refreshing = false,
}) => {
  const spin = useSharedValue(0);
  const livePulse = useSharedValue(0);
  const isLive = !loading && !error && gold != null;

  useEffect(() => {
    livePulse.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [livePulse]);

  useEffect(() => {
    if (refreshing || loading) {
      spin.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.linear }), -1, false);
    } else {
      spin.value = withTiming(0, { duration: 200 });
    }
  }, [refreshing, loading, spin]);

  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));
  const liveDotStyle = useAnimatedStyle(() => ({ opacity: 0.4 + 0.6 * livePulse.value }));

  const renderValue = (v: number | null | undefined) => {
    if (loading) return <ActivityIndicator size="small" color={COLORS.accentDark} />;
    if (error || v == null) return <Text style={styles.na}>N/A</Text>;
    return <Text style={styles.rate}>{formatINR(v)}</Text>;
  };

  return (
    <View style={styles.shadow}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleWrap}>
            <MaterialCommunityIcons name="gold" size={SIZES.icon.md} color={COLORS.accentDark} />
            <Text style={styles.title}>Today's Rate</Text>
          </View>

          <View style={styles.headerRight}>
            {isLive && (
              <View style={styles.liveBadge}>
                <Animated.View style={[styles.liveDot, liveDotStyle]} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
            <Pressable onPress={onRefresh} hitSlop={8} accessibilityRole="button" accessibilityLabel="Refresh rates">
              <Animated.View style={spinStyle}>
                <MaterialCommunityIcons name="refresh" size={SIZES.icon.sm} color={COLORS.accentDark} />
              </Animated.View>
            </Pressable>
          </View>
        </View>

        <View style={styles.ratesRow}>
          <View style={styles.rateCol}>
            <View style={styles.metalWrap}>
              <MaterialCommunityIcons name="circle" size={SIZES.icon.xs} color={COLORS.accent} />
              <Text style={styles.metal}>GOLD</Text>
            </View>
            {renderValue(gold)}
            <Text style={styles.unit}>per gram</Text>
          </View>

          <View style={styles.vDivider} />

          <View style={styles.rateCol}>
            <View style={styles.metalWrap}>
              <MaterialCommunityIcons name="circle" size={SIZES.icon.xs} color={COLORS.gray400} />
              <Text style={styles.metal}>SILVER</Text>
            </View>
            {renderValue(silver)}
            <Text style={styles.unit}>per gram</Text>
          </View>
        </View>

        {!!lastUpdated && !error && (
          <View style={styles.footer}>
            <MaterialCommunityIcons name="clock-outline" size={SIZES.icon.xs} color={COLORS.textTertiary} />
            <Text style={styles.updated}>Updated {lastUpdated}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    borderRadius: SIZES.radius.xxl,
    ...SHADOWS.lg,
    shadowColor: COLORS.accentDark,
  },
  card: {
    borderRadius: SIZES.radius.xxl,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.accentOpacity20,
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.padding.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrap: { flexDirection: 'row', alignItems: 'center' },
  title: {
    fontFamily: FONTS.family.semiBold,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    marginLeft: SIZES.sm,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.success}1A`,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 3,
    borderRadius: SIZES.radius.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 4,
  },
  liveText: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.font.xxs,
    color: COLORS.success,
    letterSpacing: 0.5,
  },
  ratesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.sm,
  },
  rateCol: { flex: 1, alignItems: 'center' },
  metalWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  metal: {
    fontFamily: FONTS.family.medium,
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginLeft: SIZES.xs,
  },
  rate: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.font.lg,
    color: COLORS.accentDark,
    marginTop: 1,
  },
  na: {
    fontFamily: FONTS.family.semiBold,
    fontSize: SIZES.font.lg,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  unit: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.xxs,
    color: COLORS.textTertiary,
    marginTop: 1,
  },
  vDivider: {
    width: 1,
    height: SIZES.icon.xxxl,
    backgroundColor: COLORS.borderChampagne,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.sm,
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderChampagne,
  },
  updated: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.xs,
    color: COLORS.textTertiary,
    marginLeft: SIZES.xs,
  },
});

export default React.memo(GoldRateCard);
