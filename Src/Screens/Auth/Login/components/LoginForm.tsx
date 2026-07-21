// Src/Screens/Auth/Login/components/LoginForm.tsx
// -----------------------------------------------------------------------------
// Glassmorphism login card: mobile + password inputs, show/hide, remember-me,
// forgot password, and the primary "Login Securely" button.
// Purely presentational — all state comes from the useLogin hook. Uses AppTheme.
// -----------------------------------------------------------------------------

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import theme from '../../../../Utills/AppTheme';
import type { LoginErrors, LoginValues } from '../validation/loginSchema';
import { LOGIN_CONSTRAINTS } from '../validation/loginSchema';
import LuxuryInput from './LuxuryInput';
import LoginButton from './LoginButton';

const { COLORS, SIZES, FONTS, SHADOWS, COMMON_STYLES } = theme;

export interface LoginFormProps {
  mobile: string;
  password: string;
  showPassword: boolean;
  remember: boolean;
  errors: LoginErrors;
  loading: boolean;
  isBusy: boolean;
  onChangeMobile: (v: string) => void;
  onChangePassword: (v: string) => void;
  onBlurField: (field: keyof LoginValues) => void;
  toggleShowPassword: () => void;
  toggleRemember: () => void;
  onForgotPassword: () => void;
  onSubmit: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  mobile,
  password,
  showPassword,
  remember,
  errors,
  loading,
  isBusy,
  onChangeMobile,
  onChangePassword,
  onBlurField,
  toggleShowPassword,
  toggleRemember,
  onForgotPassword,
  onSubmit,
}) => {
  return (
    <View style={styles.cardShadow}>
      <BlurView intensity={30} tint="light" style={styles.card}>
        <LuxuryInput
          icon="cellphone"
          value={mobile}
          onChangeText={onChangeMobile}
          onBlur={() => onBlurField('mobile')}
          placeholder="Mobile Number"
          keyboardType="number-pad"
          textContentType="telephoneNumber"
          maxLength={LOGIN_CONSTRAINTS.mobileLength}
          editable={!isBusy}
          error={errors.mobile}
          accessibilityLabel="Mobile number"
          returnKeyType="next"
        />

        <LuxuryInput
          icon="lock-outline"
          value={password}
          onChangeText={onChangePassword}
          onBlur={() => onBlurField('password')}
          placeholder="Password"
          secureTextEntry={!showPassword}
          textContentType="password"
          editable={!isBusy}
          error={errors.password}
          accessibilityLabel="Password"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          trailingIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
          onTrailingPress={toggleShowPassword}
          trailingAccessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
        />

        <View style={[COMMON_STYLES.rowBetween, styles.optionsRow]}>
          <Pressable
            onPress={toggleRemember}
            hitSlop={8}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: remember }}
            accessibilityLabel="Remember me"
            style={COMMON_STYLES.row}
          >
            <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
              {remember && <MaterialCommunityIcons name="check" size={SIZES.icon.xs} color={COLORS.white} />}
            </View>
            <Text style={styles.rememberText}>Remember Me</Text>
          </Pressable>

          <Pressable onPress={onForgotPassword} hitSlop={8} disabled={isBusy} accessibilityRole="button">
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </Pressable>
        </View>

        <View style={styles.buttonWrap}>
          <LoginButton
            label="Login Securely"
            onPress={onSubmit}
            loading={loading}
            disabled={isBusy}
            icon="shield-check"
            accessibilityHint="Signs you in to your Digital Gold account"
          />
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    borderRadius: SIZES.radius.xxl,
    ...SHADOWS.lg,
    shadowColor: COLORS.accentDark,
  },
  card: {
    borderRadius: SIZES.radius.xxl,
    overflow: 'hidden',
    padding: SIZES.padding.xxl,
    backgroundColor: COLORS.whiteOpacity70,
    borderWidth: 1,
    borderColor: COLORS.accentOpacity30,
  },
  optionsRow: {
    marginTop: SIZES.xs,
    marginBottom: SIZES.sm,
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
    backgroundColor: COLORS.white,
  },
  checkboxChecked: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  rememberText: {
    fontFamily: FONTS.family.medium,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
  },
  forgotText: {
    fontFamily: FONTS.family.semiBold,
    fontSize: SIZES.font.md,
    color: COLORS.accentDark,
  },
  buttonWrap: {
    marginTop: SIZES.md,
  },
});

export default React.memo(LoginForm);
