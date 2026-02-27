import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import useAuth from "../../../Hooks/useRegister";
import CommonHeader from "../../../Components/CommonHeader/CommonHeader";
import theme from "../../../Utills/AppTheme";

const { COLORS, SIZES, FONTS, SHADOWS, COMMON_STYLES } = theme;

const ForgotVerifyOTPScreen = ({ route, navigation }) => {
  const { contactNumber } = route.params;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);
  const { updatePassword, loading, sendForgotPassword } = useAuth();

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text.replace(/[^0-9]/g, "");
    setOtp(newOtp);
    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    const res = await sendForgotPassword({ contactNumber });
    if (!res?.error) {
      Alert.alert("Success", "OTP resent successfully");
      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } else {
      Alert.alert("Error", res.error);
    }
  };

  const handleResetPassword = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }
    if (!newPassword) {
      Alert.alert("Error", "Please enter a new password");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    const res = await updatePassword({ contactNumber, otp: otpString, newPassword });
    if (!res?.error) {
      Alert.alert(
        "Success",
        "Password updated successfully! Please login with your new password.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    } else {
      Alert.alert("Error", res.error);
    }
  };

  const isFormValid = () => {
    return (
      otp.join("").length === 6 &&
      newPassword.length >= 6 &&
      newPassword === confirmPassword
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <CommonHeader title="Verify OTP" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Decorative Elements */}
        <View style={styles.blueAccent} />
        <View style={styles.goldAccent} />

        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.iconWrapper}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>✓</Text>
              </View>
            </View>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit OTP sent to{" "}
              <Text style={styles.phoneNumber}>{contactNumber}</Text>
            </Text>
          </View>

          {/* OTP Input Section */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  focusedField === index && styles.otpInputFocused,
                  digit && styles.otpInputFilled,
                ]}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => setFocusedField(index)}
                onBlur={() => setFocusedField(null)}
                keyboardType="number-pad"
                maxLength={1}
                selectionColor={COLORS.primary}
              />
            ))}
          </View>

          {/* Timer & Resend Section */}
          <View style={styles.timerContainer}>
            {timer > 0 ? (
              <Text style={styles.timerText}>
                Resend OTP in{" "}
                <Text style={styles.timerBold}>{timer}s</Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOtp} disabled={!canResend}>
                <Text
                  style={[
                    styles.resendText,
                    !canResend && styles.resendDisabled,
                  ]}
                >
                  Resend OTP
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Create New Password</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Password Fields Section */}
          <View style={styles.passwordSection}>
            {/* New Password Field */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>New Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === "password" && styles.inputContainerFocused,
                ]}
              >
                <TextInput
                  placeholder="Enter new password"
                  placeholderTextColor={COLORS.inputPlaceholder}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.eyeIconText}>
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </Text>
                </TouchableOpacity>
              </View>
              {newPassword.length > 0 && newPassword.length < 6 && (
                <Text style={styles.validationText}>
                  Password must be at least 6 characters
                </Text>
              )}
            </View>

            {/* Confirm Password Field */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Confirm Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === "confirmPassword" &&
                    styles.inputContainerFocused,
                  confirmPassword &&
                    newPassword !== confirmPassword &&
                    styles.inputContainerError,
                ]}
              >
                <TextInput
                  placeholder="Confirm new password"
                  placeholderTextColor={COLORS.inputPlaceholder}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  style={styles.input}
                  onFocus={() => setFocusedField("confirmPassword")}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.eyeIconText}>
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Strength & Match Indicator */}
            {newPassword.length > 0 && confirmPassword.length > 0 && (
              <View style={styles.passwordIndicator}>
                <View style={styles.indicatorRow}>
                  <Text
                    style={[
                      styles.indicatorDot,
                      newPassword.length >= 6
                        ? styles.validIcon
                        : styles.invalidIcon,
                    ]}
                  >
                    {newPassword.length >= 6 ? "✓" : "○"}
                  </Text>
                  <Text
                    style={[
                      styles.indicatorText,
                      newPassword.length >= 6 && styles.validText,
                    ]}
                  >
                    Minimum 6 characters
                  </Text>
                </View>

                <View style={[styles.indicatorRow, { marginBottom: 0 }]}>
                  <Text
                    style={[
                      styles.indicatorDot,
                      newPassword === confirmPassword && confirmPassword
                        ? styles.validIcon
                        : styles.invalidIcon,
                    ]}
                  >
                    {newPassword === confirmPassword && confirmPassword
                      ? "✓"
                      : "○"}
                  </Text>
                  <Text
                    style={[
                      styles.indicatorText,
                      newPassword === confirmPassword &&
                        confirmPassword &&
                        styles.validText,
                    ]}
                  >
                    Passwords match
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={[
              styles.button,
              (!isFormValid() || loading) && styles.buttonDisabled,
            ]}
            onPress={handleResetPassword}
            disabled={loading || !isFormValid()}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.buttonText}>Update Password</Text>
            )}
          </TouchableOpacity>

          {/* Back to Login Link */}
          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── OTP box size: equal width & height, 6 evenly spaced ───
const OTP_BOX_SIZE = Math.floor((SIZES.screen.width - SIZES.padding.xl * 2 - 20) / 6);

const styles = StyleSheet.create({
  // ── Layout ──────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SIZES.padding.xxxl,
  },

  // ── Decorative accents ──────────────────────────────────
  blueAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SIZES.screen.width * 0.28,
    height: SIZES.screen.width * 0.28,
    backgroundColor: COLORS.blueOpacity10,
    borderBottomRightRadius: SIZES.radius.xxxl,
  },
  goldAccent: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: SIZES.screen.width * 0.35,
    height: SIZES.screen.width * 0.35,
    backgroundColor: COLORS.goldOpacity10,
    borderTopLeftRadius: SIZES.radius.xxxl,
  },

  // ── Main content wrapper ─────────────────────────────────
  content: {
    paddingHorizontal: SIZES.padding.xl,
    paddingTop: SIZES.padding.xl,
  },

  // ── Header section ───────────────────────────────────────
  headerSection: {
    alignItems: "center",
    marginBottom: SIZES.margin.xl,
  },
  iconWrapper: {
    marginBottom: SIZES.margin.md,
  },
  iconCircle: {
    width: SIZES.icon.xxxl,
    height: SIZES.icon.xxxl,
    borderRadius: SIZES.icon.xxxl / 2,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.blue,
  },
  iconText: {
    fontSize: SIZES.font.xxl,
    color: COLORS.white,
    fontWeight: "bold",
    lineHeight: SIZES.font.xxl * 1.2,   // prevent vertical clip
  },
  title: {
    ...FONTS.h2,
    color: COLORS.primary,
    marginBottom: SIZES.margin.xs,
    textAlign: "center",
  },
  subtitle: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingHorizontal: SIZES.padding.lg,
    lineHeight: SIZES.font.sm * 1.6,
  },
  phoneNumber: {
    ...FONTS.bodyBold,
    color: COLORS.primary,
  },

  // ── OTP boxes ────────────────────────────────────────────
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.margin.md,
    // no extra horizontal padding – container padding handles it
  },
  otpInput: {
    width: OTP_BOX_SIZE,
    height: OTP_BOX_SIZE,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: SIZES.radius.md,
    textAlign: "center",
    fontSize: SIZES.font.xl,
    fontFamily: FONTS.family.semiBold,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.inputBackground,
    // Explicit padding reset so text stays centred on Android
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  otpInputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryPale,
  },

  // ── Timer / Resend ───────────────────────────────────────
  timerContainer: {
    alignItems: "center",
    marginBottom: SIZES.margin.lg,
    minHeight: 24,                        // keeps layout stable when toggling
  },
  timerText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
  },
  timerBold: {
    ...FONTS.bodyBold,
    color: COLORS.primary,
  },
  resendText: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
  resendDisabled: {
    color: COLORS.gray400,
    textDecorationLine: "none",
  },

  // ── Divider ──────────────────────────────────────────────
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SIZES.margin.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray300,
  },
  dividerText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginHorizontal: SIZES.margin.sm,
  },

  // ── Password section ─────────────────────────────────────
  passwordSection: {
    marginBottom: SIZES.margin.xl,
  },
  inputWrapper: {
    marginBottom: SIZES.margin.lg,
  },
  label: {
    ...FONTS.label,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: SIZES.input.height,           // fixed height aligns eye icon vertically
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: SIZES.radius.input,
    backgroundColor: COLORS.inputBackground,
    overflow: "hidden",
    ...SHADOWS.xs,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    ...FONTS.body,
    paddingHorizontal: SIZES.padding.md,
    color: COLORS.textPrimary,
    height: "100%",
  },
  eyeIcon: {
    width: 44,                            // fixed tap area, prevents shifting
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  eyeIconText: {
    fontSize: SIZES.font.lg,
  },
  validationText: {
    ...FONTS.caption,
    color: COLORS.warning,
    marginTop: SIZES.margin.xs,
  },

  // ── Password indicator ───────────────────────────────────
  passwordIndicator: {
    backgroundColor: COLORS.gray100,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.sm,
    marginTop: SIZES.margin.xs,
  },
  indicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.margin.xs,
  },
  indicatorDot: {
    fontSize: SIZES.font.md,
    width: 20,                            // fixed width keeps text column aligned
    textAlign: "center",
  },
  validIcon: {
    color: COLORS.success,
  },
  invalidIcon: {
    color: COLORS.gray400,
  },
  indicatorText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    flex: 1,
  },
  validText: {
    color: COLORS.success,
  },

  // ── Update button ────────────────────────────────────────
  button: {
    height: SIZES.button.height.lg,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.button,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.blue,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray400,
    ...SHADOWS.none,
  },
  buttonText: {
    ...FONTS.buttonLarge,
    color: COLORS.white,
    textAlign: "center",
  },

  // ── Back to login ────────────────────────────────────────
  backToLogin: {
    marginTop: SIZES.margin.md,
    alignSelf: "center",
    paddingVertical: SIZES.padding.sm,
    paddingHorizontal: SIZES.padding.lg,
  },
  backToLoginText: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
});

export default ForgotVerifyOTPScreen;