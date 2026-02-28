import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import useAuth from "../../../Hooks/useRegister";
import CommonHeader from "../../../Components/CommonHeader/CommonHeader";
import theme, { COLORS, SIZES, FONTS, SHADOWS, COMMON_STYLES } from "../../../Utills/AppTheme";
import { saveAuthData } from "../../../Utills/AsynchStorageHelper";


const GoogleContactOtpScreen = ({ route, navigation }) => {
  const { userId, mobile } = route.params;
  const { verifyGoogleOtp, loading, error } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isFocused, setIsFocused] = useState(0);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace to focus previous input
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

 const handleVerifyOtp = async () => {
  const otpString = otp.join("");

  if (otpString.length < 6) {
    Alert.alert("Invalid OTP", "Please enter the complete 6-digit OTP");
    return;
  }

  const result = await verifyGoogleOtp({
    newContactNumber: mobile,
    otp: otpString,
    userId,
  });

  console.log("OTP Verify Result:", result);

  if (result && !result.error) {
    // ✅ SAVE AUTH DATA HERE
    const saveResult = await saveAuthData(result);

    if (saveResult.success) {
      Alert.alert(
        "Success",
        "Mobile number verified successfully!",
        [
          {
            text: "Continue",
            onPress: () => navigation.replace("MpinVerify"),
          },
        ]
      );
    } else {
      Alert.alert("Storage Error", saveResult.error);
    }
  }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <CommonHeader title="Verify OTP" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.container}>
            {/* Decorative Elements */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            
            {/* Icon Container */}
            <View style={styles.iconContainer}>
              <View style={styles.iconWrapper}>
                <Text style={styles.iconText}>🔐</Text>
              </View>
            </View>

            {/* Header Text */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Enter Verification Code</Text>
              <Text style={styles.subtitle}>
                We've sent a 6-digit verification code to
              </Text>
              <View style={styles.phoneContainer}>
                <Text style={styles.phoneIcon}>📱</Text>
                <Text style={styles.phoneNumber}>{mobile}</Text>
              </View>
            </View>

            {/* OTP Input Fields */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <View key={index} style={[
                  styles.otpInputWrapper,
                  isFocused === index && styles.otpInputWrapperFocused,
                  error && styles.otpInputWrapperError
                ]}>
                  <TextInput
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={styles.otpInput}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => setIsFocused(index)}
                    onBlur={() => setIsFocused(-1)}
                    selectTextOnFocus
                  />
                </View>
              ))}
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}


            {/* Action Button */}
            <TouchableOpacity
              style={[
                styles.button,
                (otp.join("").length < 6) && styles.buttonDisabled
              ]}
              onPress={handleVerifyOtp}
              activeOpacity={0.8}
              disabled={loading || otp.join("").length < 6}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Verify & Continue</Text>
                  <Text style={styles.buttonIcon}>✓</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default GoogleContactOtpScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: SIZES.padding.xl,
    position: 'relative',
  },
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
  iconContainer: {
    alignItems: 'center',
    marginTop: SIZES.xl,
    marginBottom: SIZES.lg,
    zIndex: 1,
  },
  iconWrapper: {
    width: SIZES.xxxl * 1.2,
    height: SIZES.xxxl * 1.2,
    borderRadius: SIZES.radius.xxxl,
    backgroundColor: COLORS.goldOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.gold,
  },
  iconText: {
    fontSize: SIZES.heading.h1,
  },
  headerContainer: {
    marginBottom: SIZES.xl,
    zIndex: 1,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  subtitle: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
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
  phoneIcon: {
    fontSize: SIZES.font.md,
    marginRight: SIZES.xxs,
  },
  phoneNumber: {
    ...FONTS.bodyBold,
    color: COLORS.primary,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.lg,
    zIndex: 1,
  },
  otpInputWrapper: {
    width: SIZES.xxxl * 0.9,
    height: SIZES.xxxl * 0.9,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.lg,
    backgroundColor: COLORS.inputBackground,
    ...SHADOWS.xs,
  },
  otpInputWrapperFocused: {
    borderColor: COLORS.goldPrimary,
    backgroundColor: COLORS.white,
    ...SHADOWS.gold,
  },
  otpInputWrapperError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight + '10',
  },
  otpInput: {
    flex: 1,
    textAlign: 'center',
    ...FONTS.h2,
    color: COLORS.primary,
    padding: 0,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.md,
    zIndex: 1,
  },
  errorIcon: {
    fontSize: SIZES.font.sm,
    marginRight: SIZES.xxs,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
    zIndex: 1,
  },
  timerText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  timerHighlight: {
    ...FONTS.bodyBold,
    color: COLORS.primary,
  },
  resendText: {
    ...FONTS.bodyBold,
    color: COLORS.goldPrimary,
    textDecorationLine: 'underline',
  },
  button: {
    ...COMMON_STYLES.button.gold,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: SIZES.button.height.lg,
    marginBottom: SIZES.lg,
    zIndex: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
    ...SHADOWS.none,
  },
  buttonText: {
    ...FONTS.buttonLarge,
    color: COLORS.primaryDark,
    marginRight: SIZES.sm,
  },
  buttonIcon: {
    ...FONTS.buttonLarge,
    fontSize: SIZES.font.xl,
    color: COLORS.primaryDark,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  helpIcon: {
    fontSize: SIZES.font.sm,
    marginRight: SIZES.xxs,
  },
  helpText: {
    ...FONTS.caption,
    color: COLORS.textTertiary,
    textDecorationLine: 'underline',
  },
});