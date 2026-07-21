// Src/Screens/Onboard/components/FloatingElement.tsx
// -----------------------------------------------------------------------------
// Wraps children in a gentle, looping float (up/down + subtle rotation).
// Used for the floating diamonds / ornaments around each illustration.
// -----------------------------------------------------------------------------

import React, { useEffect } from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export interface FloatingElementProps {
  children: React.ReactNode;
  /** Vertical travel distance in px. */
  amplitude?: number;
  /** One full up+down cycle duration in ms. */
  duration?: number;
  /** Start delay in ms (stagger multiple ornaments). */
  delay?: number;
  /** Max rotation in degrees for the subtle sway. */
  rotate?: number;
  style?: StyleProp<ViewStyle>;
}

const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  amplitude = 12,
  duration = 3000,
  delay = 0,
  rotate = 6,
  style,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: duration / 2, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, duration, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = -amplitude * progress.value;
    const rotateZ = `${rotate * (progress.value - 0.5)}deg`;
    return {
      transform: [{ translateY }, { rotateZ }],
      opacity: 0.65 + 0.35 * progress.value,
    };
  });

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
};

export default React.memo(FloatingElement);
