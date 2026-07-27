// Src/Screens/Auth/Login/components/SocialActions.tsx
// -----------------------------------------------------------------------------
// Secondary actions: Create Account link, an OR divider, Google sign-in and a
// "Continue as Guest" option. Uses the global AppTheme.
// -----------------------------------------------------------------------------

import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import theme from '../../../../Utills/AppTheme';

const { COLORS, SIZES, FONTS, ELEVATION, STYLES } = theme;

export interface SocialActionsProps {
  onCreateAccount: () => void;
  onGoogle: () => void;
  onGuest: () => void;
  googleLoading: boolean;
  disabled: boolean;
  accountLabel?: string;
  accountLinkLabel?: string;
}

const SocialActions: React.FC<SocialActionsProps> = ({
  onCreateAccount,
  onGoogle,
  onGuest,
  googleLoading,
  disabled,
  accountLabel = "Don't have an account? ",
  accountLinkLabel = 'Create Account',
}) => (
  <View style={styles.wrap}>
    <View style={STYLES.rowCenter}>
      <Text style={styles.muted}>{accountLabel}</Text>
      <Pressable onPress={onCreateAccount} disabled={disabled} hitSlop={6} accessibilityRole="button">
        <Text style={styles.link}>{accountLinkLabel}</Text>
      </Pressable>
    </View>

    <View style={styles.dividerRow}>
      <View style={styles.divider} />
      <Text style={styles.or}>OR</Text>
      <View style={styles.divider} />
    </View>

    <Pressable
      onPress={onGoogle}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      style={({ pressed }) => [styles.googleBtn, pressed && styles.pressed, disabled && styles.btnDisabled]}
    >
      {googleLoading ? (
        <ActivityIndicator size="small" color={COLORS.contentPrimary} />
      ) : (
        <>
          <MaterialCommunityIcons name="google" size={SIZES.icon.md} color={COLORS.danger} />
          <Text style={styles.googleText}>Continue with Google</Text>
        </>
      )}
    </Pressable>

    {/* <Pressable
      onPress={onGuest}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Continue as guest"
      style={({ pressed }) => [styles.guestBtn, pressed && styles.pressed]}
    >
      <MaterialCommunityIcons name="account-outline" size={SIZES.icon.sm} color={COLORS.contentSecondary} />
      <Text style={styles.guestText}>Continue as Guest</Text>
    </Pressable> */}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    marginTop: SIZES.space.xxl,
  },
  muted: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.text.md,
    color: COLORS.contentSecondary,
  },
  link: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.text.md,
    color: COLORS.contentBrand,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.space.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.accentSubtle,
  },
  or: {
    fontFamily: FONTS.family.semiBold,
    fontSize: SIZES.text.sm,
    color: COLORS.contentSecondary,
    marginHorizontal: SIZES.space.lg,
    letterSpacing: 1,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: SIZES.control.heightMd,
    borderRadius: SIZES.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.accentSubtle,
    backgroundColor: COLORS.surface,
    ...ELEVATION.raised,
  },
  googleText: {
    fontFamily: FONTS.family.semiBold,
    fontSize: SIZES.text.lg,
    color: COLORS.contentPrimary,
    marginLeft: SIZES.space.sm,
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: SIZES.control.heightMd,
    marginTop: SIZES.space.lg,
  },
  guestText: {
    fontFamily: FONTS.family.medium,
    fontSize: SIZES.text.md,
    color: COLORS.contentSecondary,
    marginLeft: SIZES.space.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});

export default React.memo(SocialActions);
