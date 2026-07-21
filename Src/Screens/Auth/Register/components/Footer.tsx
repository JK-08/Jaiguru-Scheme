// Src/Screens/Auth/Register/components/Footer.tsx
// -----------------------------------------------------------------------------
// Bottom section: "Already have an account? Login".
// -----------------------------------------------------------------------------

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import theme from '../../../../Utills/AppTheme';

const { COLORS, SIZES, FONTS, COMMON_STYLES } = theme;

export interface FooterProps {
  onLogin: () => void;
  disabled?: boolean;
}

const Footer: React.FC<FooterProps> = ({ onLogin, disabled }) => (
  <View style={[COMMON_STYLES.rowCenter, styles.wrap]}>
    <Text style={styles.text}>Already have an account? </Text>
    <Pressable onPress={onLogin} disabled={disabled} hitSlop={6} accessibilityRole="button">
      <Text style={styles.link}>Login</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    marginTop: SIZES.lg,
  },
  text: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  link: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.font.md,
    color: COLORS.accentDark,
  },
});

export default React.memo(Footer);
