import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import useAuth from '../../../api/hooks/Auth/useAuth';
import CommonHeader from '../../../Components/CommonHeader/CommonHeader';
import PremiumBackground from '../../../Components/PremiumBackground/PremiumBackground';
import theme from '../../../Utills/AppTheme';
import { AppInput, AppButton } from '../../../Components/ui/appcomponents';

const { COLORS, SIZES, FONTS, SHADOWS } = theme;

interface Props {
  navigation: any;
}

const ForgotPasswordScreen = ({ navigation }: Props) => {
  const [contactNumber, setContactNumber] = useState('');
  const { sendForgotPassword, loading } = useAuth();

  const handleSendOtp = async () => {
    if (!contactNumber) {
      Alert.alert('Error', 'Please enter your contact number');
      return;
    }

    if (contactNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit contact number');
      return;
    }

    const res: any = await sendForgotPassword({ contactNumber });

    if (!res?.error) {
      Alert.alert('Success', 'OTP sent successfully to your mobile number');
      navigation.navigate('ForgotVerifyOTP', { contactNumber });
    } else {
      Alert.alert('Error', res.error);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <PremiumBackground />
      <CommonHeader title="Forgot Password" transparent borderBottom={false} shadow={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.goldAccent} />

        <View style={styles.iconContainer}>
          <View style={styles.iconWrapper}>
            <Text style={styles.iconText}>🔐</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Don't worry! Enter your registered mobile number and we'll send you an OTP to reset your password.
          </Text>

          <AppInput
            label="Mobile Number"
            value={contactNumber}
            onChangeText={(text) => setContactNumber(text.replace(/[^0-9]/g, ''))}
            placeholder="Enter 10-digit number"
            keyboardType="number-pad"
            maxLength={10}
            leftIcon="call-outline"
            error={contactNumber.length > 0 && contactNumber.length < 10 ? 'Please enter a valid 10-digit number' : undefined}
            containerStyle={styles.inputWrapper}
          />

          <AppButton
            label="Send OTP"
            onPress={handleSendOtp}
            disabled={loading || !contactNumber || contactNumber.length < 10}
            loading={loading}
            variant="primary"
            size="lg"
            style={styles.button}
          />

          <TouchableOpacity style={styles.backToLogin} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1 },
  goldAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: SIZES.screen.width * 0.4,
    height: SIZES.screen.width * 0.4,
    backgroundColor: COLORS.goldOpacity10,
    borderBottomLeftRadius: SIZES.radius.xxxl,
    zIndex: 0,
  },
  iconContainer: { alignItems: 'center', marginTop: SIZES.padding.xxxl, marginBottom: SIZES.padding.lg, zIndex: 1 },
  iconWrapper: {
    width: SIZES.icon.xxxxl,
    height: SIZES.icon.xxxxl,
    borderRadius: SIZES.radius.xxxl,
    backgroundColor: COLORS.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.blue,
  },
  iconText: { fontSize: SIZES.icon.xxxl },
  content: { flex: 1, paddingHorizontal: SIZES.padding.xl, paddingTop: SIZES.padding.md },
  title: { ...FONTS.h2, color: COLORS.accentDark, marginBottom: SIZES.margin.sm, textAlign: 'center' },
  subtitle: { ...FONTS.bodySmall, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SIZES.margin.xl, paddingHorizontal: SIZES.padding.md },
  inputWrapper: { marginBottom: SIZES.margin.xl },
  button: { marginTop: SIZES.margin.sm },
  backToLogin: { marginTop: SIZES.margin.xl, alignItems: 'center', padding: SIZES.padding.md },
  backToLoginText: { ...FONTS.bodyMedium, color: COLORS.accentDark, textDecorationLine: 'underline' },
});

export default ForgotPasswordScreen;
