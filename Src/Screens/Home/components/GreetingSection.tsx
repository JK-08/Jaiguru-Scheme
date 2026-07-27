// Src/Screens/Home/components/GreetingSection.tsx
// -----------------------------------------------------------------------------
// Greeting + customer name + member ID. Fades / slides in on mount.
// -----------------------------------------------------------------------------

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import theme from '../../../Utills/AppTheme';

const { COLORS, SIZES, FONTS } = theme;

export interface GreetingSectionProps {
  greeting: string;
  name: string;
  // memberId: string;
}

const GreetingSection: React.FC<GreetingSectionProps> = ({ greeting, name,  }) => {
  const enter = useSharedValue(0);
  useEffect(() => {
    enter.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [enter]);

  const style = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateX: interpolate(enter.value, [0, 1], [-16, 0]) }],
  }));

  return (
    <Animated.View style={style}>
      <Text style={styles.greeting}>{greeting} 👋</Text>
      <Text style={styles.welcome}>Welcome back,</Text>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      {/* <View style={styles.memberRow}>
        <MaterialCommunityIcons name="shield-check" size={SIZES.icon.xs} color={COLORS.contentOnAccent} />
        <Text style={styles.memberId}>Member ID : {memberId}</Text>
      </View> */}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  greeting: {
    fontFamily: FONTS.family.medium,
    fontSize: SIZES.text.sm,
    color: COLORS.contentOnAccent,
    opacity: 0.9,
  },
  welcome: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.text.xxs,
    color: COLORS.contentOnAccent,
    opacity: 0.8,
    marginTop: SIZES.space.xs,
  },
  name: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.text.xxl,
    color: COLORS.contentOnAccent,
    marginTop: 2,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.space.xs,
  },
  memberId: {
    fontFamily: FONTS.family.medium,
    fontSize: SIZES.text.xxs,
    color: COLORS.contentOnAccent,
    opacity: 0.85,
    marginLeft: SIZES.space.xs,
    letterSpacing: 0.3,
  },
});

export default React.memo(GreetingSection);
