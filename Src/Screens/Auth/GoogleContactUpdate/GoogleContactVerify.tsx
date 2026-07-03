import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from 'react-native';
import useAuth from '../../../api/hooks/Auth/useAuth';
import CommonHeader from '../../../Components/CommonHeader/CommonHeader';
import theme from '../../../Utills/AppTheme';
import { saveAuthData } from '../../../Utills/AsynchStorageHelper';
import { AppOTPInput, AppButton } from '../../../Components/ui/appcomponents';

const { COLORS, SIZES, FONTS, SHADOWS } = theme;

interface Props {
  route: { params: { userId?: string; mobile: string } };
  navigation: any;
}

const GoogleContactOtpScreen = ({ route, navigation }: Props) => {
  const { userId, mobile } = route.params;
  const { verifyGoogleOtp, loading, error } = useAuth();

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setCanResend(true);
            if (interval) clearInterval(interval);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, canResend]);

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit OTP');
      return;
    }

    const result: any = await verifyGoogleOtp({ newContactNumber: mobile, otp, userId });

    console.log('OTP Verify Result:', result);

    if (result && !result.error) {
      const saveResult = await saveAuthData(result);

      if (saveResult.success) {
        Alert.alert('Success', 'Mobile number verified successfully!', [
          { text: 'Continue', onPress: () => navigation.replace('MpinVerify') },
        ]);
      } else {
        Alert.alert('Storage Error', saveResult.error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CommonHeader title="Verify OTP" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.container}>
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />

            <View style={styles.iconContainer}>
              <View style={styles.iconWrapper}>
                <Text style={styles.iconText}>🔐</Text>
              </View>
            </View>

            <View style={styles.headerContainer}>
              <Text style={styles.title}>Enter Verification Code</Text>
              <Text style={styles.subtitle}>We've sent a 6-digit verification code to</Text>
              <View style={styles.phoneContainer}>
                <Text style={styles.phoneIcon}>📱</Text>
                <Text style={styles.phoneNumber}>{mobile}</Text>
              </View>
            </View>

            <View style={styles.otpContainer}>
              <AppOTPInput length={6} onChangeText={setOtp} error={!!error} errorMessage={error || undefined} autoFocus />
            </View>

            <AppButton
              label="Verify & Continue"
              onPress={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              loading={loading}
              variant="gold"
              size="lg"
              rightIcon="checkmark"
              style={styles.button}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default GoogleContactOtpScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scrollContainer: { flexGrow: 1 },
  container: { flex: 1, padding: SIZES.padding.xl, position: 'relative' },
  decorativeCircle1: {
    position: 'absolute',
    top: -SIZES.xxxl,
    right: -SIZES.xxl,
    width: SIZES.xxxl * 2,
    height: SIZES.xxxl * 2,
    borderRadius: SIZES.radius.xxxl,
    backgroundColor: COLORS.blueOpacity10,
    zIndex: 0,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -SIZES.xxl,
    left: -SIZES.xxl,
    width: SIZES.xxxl * 1.5,
    height: SIZES.xxxl * 1.5,
    borderRadius: SIZES.radius.xxxl,
    backgroundColor: COLORS.goldOpacity10,
    zIndex: 0,
  },
  iconContainer: { alignItems: 'center', marginTop: SIZES.xl, marginBottom: SIZES.lg, zIndex: 1 },
  iconWrapper: {
    width: SIZES.xxxl * 1.2,
    height: SIZES.xxxl * 1.2,
    borderRadius: SIZES.radius.xxxl,
    backgroundColor: COLORS.goldOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.gold,
  },
  iconText: { fontSize: SIZES.heading.h1 },
  headerContainer: { marginBottom: SIZES.xl, zIndex: 1 },
  title: { ...FONTS.h1, color: COLORS.primary, textAlign: 'center', marginBottom: SIZES.sm },
  subtitle: { ...FONTS.bodySmall, color: COLORS.textSecondary, textAlign: 'center' },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.xs,
    backgroundColor: COLORS.blueOpacity10,
    paddingVertical: SIZES.xs,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radius.full,
    alignSelf: 'center',
  },
  phoneIcon: { fontSize: SIZES.font.md, marginRight: SIZES.font.xxs },
  phoneNumber: { ...FONTS.bodyBold, color: COLORS.primary },
  otpContainer: { alignItems: 'center', marginBottom: SIZES.lg, zIndex: 1 },
  button: { marginBottom: SIZES.lg, zIndex: 1 },
});
