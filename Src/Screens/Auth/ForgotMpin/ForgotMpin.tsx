import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMpin } from '../../../api/hooks/Mpin/useMpin';
import CommonHeader from '../../../Components/CommonHeader/CommonHeader';
import theme from '../../../Utills/AppTheme';
import { getUserData } from '../../../Utills/AsynchStorageHelper';
import { AppButton } from '../../../Components/ui/appcomponents';

const { COLORS, SIZES, FONTS, SHADOWS } = theme;

const ForgotMpinScreen = () => {
  const navigation = useNavigation<any>();
  const { sendForgotOtp, loading } = useMpin();

  const [userMobile, setUserMobile] = useState('');
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    loadUserMobile();
  }, []);

  const loadUserMobile = async () => {
    try {
      setIsLoadingUser(true);
      const userData: any = await getUserData();

      if (userData) {
        const mobile = userData.contactNumber || userData.mobileNumber || userData.phone || userData.mobile;
        setUserMobile(mobile || '');
      }
    } catch (error) {
      console.error('Error loading user mobile:', error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const formatMobileNumber = (number: string) => {
    if (!number) return '';
    const strNumber = String(number);
    if (strNumber.length >= 10) {
      const last4 = strNumber.slice(-4);
      return `•••• •••• ${last4}`;
    } else if (strNumber.length >= 4) {
      const last4 = strNumber.slice(-4);
      return `••••${last4}`;
    }
    return 'registered number';
  };

  const handleSendOtp = async () => {
    try {
      const res: any = await sendForgotOtp();
      Alert.alert('Success', res.message);
      navigation.navigate('VerifyForgotMpin');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <CommonHeader title="Forgot MPIN" />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.iconWrapper}>
              <Text style={styles.iconText}>🔐</Text>
            </View>
          </View>

          <Text style={styles.title}>Forgot MPIN?</Text>
          <Text style={styles.subtitle}>
            Don't worry! We'll send a verification code to your registered mobile number to reset your MPIN.
          </Text>

          {isLoadingUser ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading your details...</Text>
            </View>
          ) : userMobile ? (
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Text style={styles.infoIcon}>📱</Text>
                <Text style={styles.infoTitle}>Registered Mobile Number</Text>
              </View>

              <View style={styles.mobileContainer}>
                <Text style={styles.mobileLabel}>Mobile:</Text>
                <Text style={styles.mobileNumber}>{formatMobileNumber(userMobile)}</Text>
              </View>

              <View style={styles.infoDivider} />

              <Text style={styles.infoText}>
                We'll send a 6-digit verification code to this number. The code will expire in 10 minutes.
              </Text>
            </View>
          ) : (
            <View style={styles.warningCard}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningTitle}>Mobile Number Not Found</Text>
              <Text style={styles.warningText}>
                We couldn't find your registered mobile number. Please contact support for assistance.
              </Text>
            </View>
          )}

          <AppButton
            label={userMobile ? 'Send OTP' : 'Contact Support'}
            onPress={handleSendOtp}
            disabled={loading || !userMobile}
            loading={loading}
            variant="primary"
            size="lg"
            style={styles.button}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>By continuing, you agree to receive an OTP via SMS. Standard message and data rates may apply.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotMpinScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, paddingHorizontal: SIZES.padding.container, paddingTop: SIZES.padding.xl },
  iconContainer: { alignItems: 'center', marginBottom: SIZES.margin.xl },
  iconWrapper: {
    width: SIZES.icon.xxxl,
    height: SIZES.icon.xxxl,
    borderRadius: SIZES.radius.xxxl,
    backgroundColor: COLORS.blueOpacity10,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  iconText: { fontSize: SIZES.icon.xxl },
  title: { ...FONTS.h2, color: COLORS.primary, textAlign: 'center', marginBottom: SIZES.margin.sm },
  subtitle: { ...FONTS.body, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SIZES.margin.xl, paddingHorizontal: SIZES.padding.md },
  loadingCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    marginBottom: SIZES.margin.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.xs,
  },
  loadingText: { ...FONTS.bodySmall, color: COLORS.textSecondary, marginTop: SIZES.margin.sm },
  infoCard: {
    backgroundColor: COLORS.primaryPale,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    marginBottom: SIZES.margin.xl,
    borderWidth: 1,
    borderColor: COLORS.primaryLighter,
    ...SHADOWS.xs,
  },
  infoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.margin.md },
  infoIcon: { fontSize: SIZES.font.lg, marginRight: SIZES.margin.xs },
  infoTitle: { ...FONTS.label, color: COLORS.primary },
  mobileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.margin.md,
  },
  mobileLabel: { ...FONTS.bodySmall, color: COLORS.textSecondary, marginRight: SIZES.margin.xs },
  mobileNumber: { ...FONTS.bodyBold, color: COLORS.primary, fontSize: SIZES.font.lg },
  infoDivider: { height: 1, backgroundColor: COLORS.primaryLighter, marginVertical: SIZES.margin.md },
  infoText: { ...FONTS.bodySmall, color: COLORS.textSecondary, lineHeight: SIZES.font.lg * 1.5 },
  warningCard: {
    backgroundColor: `${COLORS.warningLight}20`,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    marginBottom: SIZES.margin.xl,
    borderWidth: 1,
    borderColor: COLORS.warning,
    alignItems: 'center',
    ...SHADOWS.xs,
  },
  warningIcon: { fontSize: SIZES.icon.lg, marginBottom: SIZES.margin.sm },
  warningTitle: { ...FONTS.label, color: COLORS.warningDark, marginBottom: SIZES.margin.xs },
  warningText: { ...FONTS.bodySmall, color: COLORS.textSecondary, textAlign: 'center' },
  button: { marginBottom: SIZES.margin.md },
  footer: { padding: SIZES.padding.lg, alignItems: 'center' },
  footerText: { ...FONTS.caption, color: COLORS.textTertiary, textAlign: 'center' },
});
