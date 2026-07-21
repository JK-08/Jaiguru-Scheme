// Src/Screens/Auth/Login/components/SocialActions.tsx
// -----------------------------------------------------------------------------
// Secondary actions: Create Account link, an OR divider, Google sign-in and a
// "Continue as Guest" option. Uses the global AppTheme.
// -----------------------------------------------------------------------------

import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import theme from '../../../../Utills/AppTheme';

const { COLORS, SIZES, FONTS, SHADOWS, COMMON_STYLES } = theme;

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
    <View style={COMMON_STYLES.rowCenter}>
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
        <ActivityIndicator size="small" color={COLORS.textPrimary} />
      ) : (
        <>
          <MaterialCommunityIcons name="google" size={SIZES.icon.md} color={COLORS.error} />
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
      <MaterialCommunityIcons name="account-outline" size={SIZES.icon.sm} color={COLORS.textSecondary} />
      <Text style={styles.guestText}>Continue as Guest</Text>
    </Pressable> */}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    marginTop: SIZES.padding.xxl,
  },
  muted: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  link: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.font.md,
    color: COLORS.accentDark,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderChampagne,
  },
  or: {
    fontFamily: FONTS.family.semiBold,
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginHorizontal: SIZES.md,
    letterSpacing: 1,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: SIZES.button.height.md,
    borderRadius: SIZES.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.borderChampagne,
    backgroundColor: COLORS.white,
    ...SHADOWS.xs,
  },
  googleText: {
    fontFamily: FONTS.family.semiBold,
    fontSize: SIZES.font.lg,
    color: COLORS.textPrimary,
    marginLeft: SIZES.sm,
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: SIZES.button.height.md,
    marginTop: SIZES.md,
  },
  guestText: {
    fontFamily: FONTS.family.medium,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    marginLeft: SIZES.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});

export default React.memo(SocialActions);
