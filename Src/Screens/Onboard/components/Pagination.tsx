// Src/Screens/Onboard/components/Pagination.tsx
// -----------------------------------------------------------------------------
// Smooth, scroll-driven page indicator. The active dot stretches into a gold
// pill and neighbouring dots fade — all interpolated from the scroll position.
// -----------------------------------------------------------------------------

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { COLORS } from '../../../Utills/AppTheme';

interface DotProps {
  index: number;
  scrollX: SharedValue<number>;
  width: number;
}

const DOT = 8;
const ACTIVE_WIDTH = 26;

const Dot: React.FC<DotProps> = ({ index, scrollX, width }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];

    const dotWidth = interpolate(
      scrollX.value,
      input,
      [DOT, ACTIVE_WIDTH, DOT],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollX.value,
      input,
      [0.35, 1, 0.35],
      Extrapolation.CLAMP,
    );

    return { width: dotWidth, opacity };
  });

  const colorStyle = useAnimatedStyle(() => {
    const active = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0, 1, 0],
      Extrapolation.CLAMP,
    );
    return { backgroundColor: active > 0.5 ? COLORS.brand : COLORS.white };
  });

  return <Animated.View style={[styles.dot, animatedStyle, colorStyle]} />;
};

export interface PaginationProps {
  count: number;
  scrollX: SharedValue<number>;
  width: number;
}

const Pagination: React.FC<PaginationProps> = ({ count, scrollX, width }) => (
  <View style={styles.container} accessibilityRole="progressbar">
    {Array.from({ length: count }).map((_, i) => (
      <Dot key={i} index={i} scrollX={scrollX} width={width} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: DOT,
    borderRadius: DOT / 2,
    marginHorizontal: 4,
  },
});

export default React.memo(Pagination);
