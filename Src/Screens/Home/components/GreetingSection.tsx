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
        <MaterialCommunityIcons name="shield-check" size={SIZES.icon.xs} color={COLORS.textOnGold} />
        <Text style={styles.memberId}>Member ID : {memberId}</Text>
      </View> */}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  greeting: {
    fontFamily: FONTS.family.medium,
    fontSize: SIZES.font.sm,
    color: COLORS.textOnGold,
    opacity: 0.9,
  },
  welcome: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.xs,
    color: COLORS.textOnGold,
    opacity: 0.8,
    marginTop: SIZES.xs,
  },
  name: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.heading.h4,
    color: COLORS.textOnGold,
    marginTop: 2,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.xs,
  },
  memberId: {
    fontFamily: FONTS.family.medium,
    fontSize: SIZES.font.xs,
    color: COLORS.textOnGold,
    opacity: 0.85,
    marginLeft: SIZES.xs,
    letterSpacing: 0.3,
  },
});

export default React.memo(GreetingSection);
