// Src/Screens/Auth/Register/components/TermsSection.tsx
// -----------------------------------------------------------------------------
// Terms & Privacy acceptance: an animated gold checkbox + clickable links.
// -----------------------------------------------------------------------------

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import theme from '../../../../Utills/AppTheme';

const { COLORS, SIZES, FONTS } = theme;

export interface TermsSectionProps {
  value: boolean;
  onToggle: (next: boolean) => void;
  onTerms?: () => void;
  onPrivacy?: () => void;
  error?: string;
  disabled?: boolean;
}

const TermsSection: React.FC<TermsSectionProps> = ({
  value,
  onToggle,
  onTerms,
  onPrivacy,
  error,
  disabled,
}) => (
  <View style={styles.wrap}>
    <View style={styles.row}>
      <Pressable
        onPress={() => onToggle(!value)}
        disabled={disabled}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: value }}
        accessibilityLabel="Accept Terms and Conditions and Privacy Policy"
        style={[styles.checkbox, value && styles.checkboxChecked, !!error && styles.checkboxError]}
      >
        {value && <MaterialCommunityIcons name="check" size={SIZES.icon.xs} color={COLORS.white} />}
      </Pressable>

      <Text style={styles.text}>
        I agree to the{' '}
        <Text style={styles.link} onPress={onTerms}>
          Terms &amp; Conditions
        </Text>{' '}
        and{' '}
        <Text style={styles.link} onPress={onPrivacy}>
          Privacy Policy
        </Text>
        .
      </Text>
    </View>

    {!!error && <Text style={styles.error}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    marginTop: SIZES.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: SIZES.icon.md,
    height: SIZES.icon.md,
    borderRadius: SIZES.radius.xs,
    borderWidth: 1.5,
    borderColor: COLORS.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.sm,
    marginTop: 2,
    backgroundColor: COLORS.white,
  },
  checkboxChecked: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  checkboxError: {
    borderColor: COLORS.error,
  },
  text: {
    flex: 1,
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.sm,
    lineHeight: SIZES.font.sm * 1.5,
    color: COLORS.textSecondary,
  },
  link: {
    fontFamily: FONTS.family.semiBold,
    color: COLORS.accentDark,
  },
  error: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.xs,
    color: COLORS.error,
    marginTop: SIZES.xs,
    marginLeft: SIZES.icon.md + SIZES.sm,
  },
});

export default React.memo(TermsSection);
