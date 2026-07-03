import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from 'react-native';
import useAuth from '../../../api/hooks/Auth/useAuth';
import CommonHeader from '../../../Components/CommonHeader/CommonHeader';
import theme from '../../../Utills/AppTheme';
import { AppInput, AppButton } from '../../../Components/ui/appcomponents';

const { COLORS, SIZES, FONTS, SHADOWS } = theme;

interface Props {
  route: { params: { userId?: string; googleData?: any } };
  navigation: any;
}

const GoogleContactMobileScreen = ({ route, navigation }: Props) => {
  const { userId, googleData } = route.params;
  const resolvedUserId = userId ?? googleData?.userId;
  const { requestGoogleOtp, loading, error } = useAuth();

  const [mobile, setMobile] = useState('');

  const handleSendOtp = async () => {
    if (!mobile || mobile.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
      return;
    }

    const result: any = await requestGoogleOtp({ userId: resolvedUserId, newContactNumber: mobile });

    if (!result?.error) {
      Alert.alert('OTP Sent', `Verification code has been sent to ${mobile}`, [{ text: 'OK' }]);
      navigation.navigate('GoogleContactVerify', { userId: resolvedUserId, mobile });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CommonHeader title="Update Contact" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.container}>
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />

            <View style={styles.iconContainer}>
              <View style={styles.iconWrapper}>
                <Text style={styles.iconText}>📱</Text>
              </View>
            </View>

            <View style={styles.headerContainer}>
              <Text style={styles.title}>Enter Mobile Number</Text>
              <Text style={styles.subtitle}>Please provide your mobile number to verify and update your contact information</Text>
            </View>

            <AppInput
              label="Mobile Number"
              value={mobile}
              onChangeText={setMobile}
              placeholder="98765 43210"
              keyboardType="number-pad"
              maxLength={10}
              error={error || undefined}
              leftIcon="call-outline"
              containerStyle={styles.inputWrapper}
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>We'll send a 6-digit verification code to this number</Text>
            </View>

            <AppButton
              label="Send Verification Code"
              onPress={handleSendOtp}
              disabled={loading || !mobile || mobile.length < 10}
              loading={loading}
              variant="primary"
              size="lg"
              style={styles.button}
            />

            <View style={styles.securityNote}>
              <Text style={styles.securityIcon}>🔒</Text>
              <Text style={styles.securityText}>Your information is secure and encrypted</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default GoogleContactMobileScreen;

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
    backgroundColor: COLORS.primaryPale,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.blue,
  },
  iconText: { fontSize: SIZES.heading.h1 },
  headerContainer: { marginBottom: SIZES.xl, zIndex: 1 },
  title: { ...FONTS.h1, color: COLORS.primary, textAlign: 'center', marginBottom: SIZES.sm },
  subtitle: { ...FONTS.bodySmall, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: SIZES.lg },
  inputWrapper: { marginBottom: SIZES.lg, zIndex: 1 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blueOpacity10,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.md,
    marginBottom: SIZES.xl,
    borderWidth: 1,
    borderColor: COLORS.blueOpacity20,
    zIndex: 1,
  },
  infoIcon: { fontSize: SIZES.font.lg, marginRight: SIZES.sm },
  infoText: { ...FONTS.bodySmall, color: COLORS.primary, flex: 1 },
  button: { marginBottom: SIZES.xl, zIndex: 1 },
  securityNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  securityIcon: { fontSize: SIZES.font.sm, marginRight: SIZES.font.xxs },
  securityText: { ...FONTS.caption, color: COLORS.textTertiary },
});
