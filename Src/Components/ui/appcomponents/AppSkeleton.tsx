// Src/Components/ui/appcomponents/AppSkeleton.tsx
//
// Loading-state placeholder — replaces bare ActivityIndicator-only loading
// screens with a shimmering content-shaped placeholder (standard modern
// fintech pattern for scheme lists / passbook rows / dashboard cards).
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleProp, ViewStyle } from 'react-native';
import theme from '../../../Utills/AppTheme';

const { COLORS, SIZES } = theme;

export interface AppSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  circle?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppSkeleton({ width = '100%', height = 16, borderRadius, circle = false, style }: AppSkeletonProps) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: circle ? height / 2 : borderRadius ?? SIZES.radius.sm,
          backgroundColor: COLORS.gray200,
          opacity,
        },
        style,
      ]}
    />
  );
}

/** Common composite: a card-shaped skeleton row (icon + two lines), for list screens. */
export function AppSkeletonListItem({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', padding: SIZES.padding.md }, style]}>
      <AppSkeleton circle width={44} height={44} />
      <View style={{ marginLeft: SIZES.md, flex: 1 }}>
        <AppSkeleton width="60%" height={14} style={{ marginBottom: SIZES.xs }} />
        <AppSkeleton width="40%" height={12} />
      </View>
    </View>
  );
}

export default AppSkeleton;
