// Header.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import theme from '../../Utills/AppTheme';

const { COLORS, FONTS, SIZES, moderateScale, verticalScale, SHADOWS } = theme;

const Header = ({
  /* ───────────── Basic ───────────── */
  title,
  subtitle = null,

  /* ───────────── Left ───────────── */
  showBack = true,
  leftIconName = 'arrow-back',
  leftIconSize = moderateScale(24),
  leftIconColor = COLORS.white,
  onBackPress = null,

  /* ───────────── Right ───────────── */
  rightIconName = null,
  rightIconSize = moderateScale(24),
  rightIconColor = COLORS.white,
  onRightPress = null,

  /* ───────────── UI ───────────── */
  backgroundColor = COLORS.background,
  borderBottom = true,
  shadow = true,
  transparent = false,
  animated = true,
  centerTitle = true,

  /* ───────────── Custom Slots ───────────── */
  leftComponent = null,
  rightComponent = null,
  centerComponent = null,

  /* ───────────── Icons ───────────── */
  IconComponent = Ionicons, // ✅ DEFAULT ICON SET
}) => {
  const navigation = useNavigation();

  const slideAnim = useRef(new Animated.Value(animated ? -40 : 0)).current;
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated]);

  const handleBackPress = () => {
    if (onBackPress) onBackPress();
    else if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={transparent ? 'transparent' : backgroundColor}
        translucent={transparent}
      />

      <SafeAreaView
        edges={['top']}
        style={{ backgroundColor: transparent ? 'transparent' : backgroundColor }}
      >
        <Animated.View
          style={[
            styles.container,
            transparent && styles.transparent,
            borderBottom && styles.borderBottom,
            shadow && styles.shadow,
            {
              backgroundColor: transparent ? 'transparent' : backgroundColor,
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* ───────────── Left ───────────── */}
          <View style={styles.side}>
            {leftComponent ? (
              leftComponent
            ) : showBack ? (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleBackPress}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={styles.iconContainer}>
                  <IconComponent
                    name={leftIconName}
                    size={leftIconSize}
                    color={leftIconColor}
                  />
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholder} />
            )}
          </View>

          {/* ───────────── Center ───────────── */}
          <View
            style={[
              styles.center,
              !centerTitle && { alignItems: 'flex-start' },
            ]}
          >
            {centerComponent ? (
              centerComponent
            ) : (
              <>
                {!!title && (
                  <Text numberOfLines={1} style={styles.title}>
                    {title}
                  </Text>
                )}
                {!!subtitle && (
                  <Text numberOfLines={1} style={styles.subtitle}>
                    {subtitle}
                  </Text>
                )}
              </>
            )}
          </View>

          {/* ───────────── Right ───────────── */}
          <View style={styles.side}>
            {rightComponent ? (
              rightComponent
            ) : rightIconName ? (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onRightPress}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <IconComponent
                    name={rightIconName}
                    size={rightIconSize}
                    color={rightIconColor}
                  />
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholder} />
            )}
          </View>
        </Animated.View>
      </SafeAreaView>
    </>
  );
};

export default Header;

/* ───────────────── Styles ───────────────── */

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: verticalScale(60),
    paddingHorizontal: SIZES.padding.lg,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  shadow: {
    ...SHADOWS.sm,
  },
  side: {
    width: moderateScale(52),
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.sm,
  },
  title: {
    ...FONTS.h4,
    color: COLORS.textPrimary,
    fontSize: SIZES.font.xl,
    textAlign: 'center',
  },
  subtitle: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginTop: verticalScale(2),
  },
  iconButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: SIZES.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: moderateScale(44),
  },
});

/* Web cursor fix */
if (Platform.OS === 'web') {
  styles.iconButton = { ...styles.iconButton, cursor: 'pointer' };
}
