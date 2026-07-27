// Src/Screens/Auth/Register/components/RegisterForm.tsx
// -----------------------------------------------------------------------------
// Glassmorphism registration card. React Hook Form Controllers drive each
// LuxuryInput; the live PasswordStrength meter sits under the password field.
// -----------------------------------------------------------------------------

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';

import theme from '../../../../Utills/AppTheme';
import LuxuryInput from '../../Login/components/LuxuryInput';
import type { RegisterFormValues } from '../validation/registerSchema';

const { COLORS, SIZES, ELEVATION } = theme;

export interface RegisterFormProps {
  control: Control<RegisterFormValues>;
  errors: FieldErrors<RegisterFormValues>;
  showPassword: boolean;
  showConfirm: boolean;
  toggleShowPassword: () => void;
  toggleShowConfirm: () => void;
  disabled?: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  control,
  errors,
  showPassword,
  showConfirm,
  toggleShowPassword,
  toggleShowConfirm,
  disabled,
}) => {
  return (
    <View style={styles.cardShadow}>
      <BlurView intensity={30} tint="light" style={styles.card}>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur } }) => (
            <LuxuryInput
              icon="account-outline"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Customer Name"
              autoCapitalize="words"
              editable={!disabled}
              error={errors.name?.message}
              accessibilityLabel="Customer name"
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="mobile"
          render={({ field: { value, onChange, onBlur } }) => (
            <LuxuryInput
              icon="cellphone"
              value={value}
              onChangeText={(v) => onChange(v.replace(/\D/g, '').slice(0, 10))}
              onBlur={onBlur}
              placeholder="Mobile Number"
              keyboardType="number-pad"
              maxLength={10}
              editable={!disabled}
              error={errors.mobile?.message}
              accessibilityLabel="Mobile number"
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <LuxuryInput
              icon="email-outline"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!disabled}
              error={errors.email?.message}
              accessibilityLabel="Email address, optional"
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <LuxuryInput
              icon="lock-outline"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Create Password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!disabled}
              error={errors.password?.message}
              accessibilityLabel="Create password"
              returnKeyType="next"
              trailingIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onTrailingPress={toggleShowPassword}
              trailingAccessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { value, onChange, onBlur } }) => (
            <LuxuryInput
              icon="lock-check-outline"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Confirm Password"
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              editable={!disabled}
              error={errors.confirmPassword?.message}
              accessibilityLabel="Confirm password"
              returnKeyType="next"
              trailingIcon={showConfirm ? 'eye-off-outline' : 'eye-outline'}
              onTrailingPress={toggleShowConfirm}
              trailingAccessibilityLabel={showConfirm ? 'Hide password' : 'Show password'}
            />
          )}
        />

        {/* <Controller
          control={control}
          name="referralCode"
          render={({ field: { value, onChange, onBlur } }) => (
            <LuxuryInput
              icon="gift-outline"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Referral Code (Optional)"
              autoCapitalize="characters"
              editable={!disabled}
              error={errors.referralCode?.message}
              accessibilityLabel="Referral code, optional"
              returnKeyType="done"
            />
          )}
        /> */}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    borderRadius: SIZES.radius.xxl,
    ...ELEVATION.floating,
    shadowColor: COLORS.shadowAccent,
  },
  card: {
    borderRadius: SIZES.radius.xxl,
    overflow: 'hidden',
    padding: SIZES.space.xxl,
    backgroundColor: COLORS.whiteAlpha70,
    borderWidth: 1,
    borderColor: COLORS.brandAlpha32,
  },
});

export default React.memo(RegisterForm);
