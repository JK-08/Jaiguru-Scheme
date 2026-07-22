// Src/Screens/Auth/Register/Register.tsx
// -----------------------------------------------------------------------------
// Jaiguru Digi Gold — premium luxury Create Account screen.
// Full-bleed champagne background + floating gold particles, shimmering logo,
// glassmorphism form (React Hook Form + Zod), live password strength, terms
// acceptance, gold-gradient CTA with success animation. Uses the global AppTheme.
//
//   components/  RegisterHeader · RegisterForm · PasswordStrength ·
//                TermsSection · RegisterButton · Footer
//   hooks/       useRegister
//   validation/  registerSchema
// -----------------------------------------------------------------------------

import React, { useEffect } from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Controller } from 'react-hook-form';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import theme from '../../../Utills/AppTheme';
import { useCompany } from '../../../api/hooks/Company/useCompany';
import { useRegister } from './hooks/useRegister';
import RegisterHeader from './components/RegisterHeader';
import RegisterForm from './components/RegisterForm';
import TermsSection from './components/TermsSection';
import RegisterButton from './components/RegisterButton';
import GoldParticles from '../Login/components/GoldParticles';
import SocialActions from '../Login/components/SocialActions';

const { COLORS, SIZES } = theme;
const { width, height } = Dimensions.get('window');

const BG_GRADIENT = COLORS.gradient.champagneSurface as [string, string, string];
const GLOW_GRADIENT = [COLORS.champagne, COLORS.whiteOpacity10] as [string, string];

const RegisterScreen: React.FC = () => {
  const { company } = useCompany();
  const reg = useRegister();
  const { control, formState } = reg.form;
  const { errors } = formState;

  // Card slide-up + fade entrance.
  const enter = useSharedValue(0);
  useEffect(() => {
    enter.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [enter]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: interpolate(enter.value, [0, 1], [34, 0]) }],
  }));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Full-bleed luxury background + floating particles */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient colors={BG_GRADIENT} style={StyleSheet.absoluteFill} />
        <View style={[styles.glow, styles.glowTop]}>
          <LinearGradient
            colors={GLOW_GRADIENT}
            style={styles.glowFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>
        <GoldParticles width={width} height={height} />
      </View>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView
              contentContainerStyle={styles.scroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              <RegisterHeader logoUrl={company?.CompanyLogoUrl ?? null} />

              <Animated.View style={[styles.body, contentStyle]}>
                <RegisterForm
                  control={control}
                  errors={errors}
                  showPassword={reg.showPassword}
                  showConfirm={reg.showConfirm}
                  toggleShowPassword={reg.toggleShowPassword}
                  toggleShowConfirm={reg.toggleShowConfirm}
                  disabled={reg.loading || reg.success}
                />

                <Controller
                  control={control}
                  name="terms"
                  render={({ field: { value, onChange } }) => (
                    <TermsSection
                      value={!!value}
                      onToggle={onChange}
                      onTerms={reg.goToTerms}
                      onPrivacy={reg.goToPrivacy}
                      error={errors.terms?.message}
                      disabled={reg.loading || reg.success}
                    />
                  )}
                />

                <View style={styles.buttonWrap}>
                  <RegisterButton
                    label="Create Account"
                    onPress={reg.submit}
                    loading={reg.loading}
                    success={reg.success}
                  />
                </View>

                <SocialActions
                  onCreateAccount={reg.goToLogin}
                  onGoogle={reg.signInWithGoogle}
                  onGuest={() => {}}
                  googleLoading={reg.googleLoading}
                  disabled={reg.loading || reg.success}
                  accountLabel="Already have an account? "
                  accountLinkLabel="Login"
                />
              </Animated.View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <reg.Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  safe: { flex: 1 },
  glow: {
    position: 'absolute',
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    overflow: 'hidden',
  },
  glowTop: { top: -width * 0.55, alignSelf: 'center' },
  glowFill: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SIZES.padding.container,
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.xl,
  },
  body: { marginTop: SIZES.sm },
  buttonWrap: { marginTop: SIZES.md },
});

export default RegisterScreen;
