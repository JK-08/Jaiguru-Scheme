import React, { useState } from "react";
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
import CommonHeader from "./../../../Components/CommonHeader/CommonHeader";
import theme from "../../../Utills/AppTheme"; // Adjust path as needed

const { COLORS, SIZES, FONTS, SHADOWS, COMMON_STYLES } = theme;

const ForgotPasswordScreen = ({ navigation }) => {
  const [contactNumber, setContactNumber] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { sendForgotPassword, loading } = useAuth();

  const handleSendOtp = async () => {
    if (!contactNumber) {
      Alert.alert("Error", "Please enter your contact number");
      return;
    }

    if (contactNumber.length < 10) {
      Alert.alert("Error", "Please enter a valid 10-digit contact number");
      return;
    }

    const res = await sendForgotPassword({ contactNumber });

    if (!res?.error) {
      Alert.alert("Success", "OTP sent successfully to your mobile number");
      navigation.navigate("ForgotVerifyOTP", { contactNumber });
    } else {
      Alert.alert("Error", res.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <CommonHeader title="Forgot Password" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Decorative Gold Accent */}
        <View style={styles.goldAccent} />
        
        {/* Icon/Illustration Area */}
        <View style={styles.iconContainer}>
          <View style={styles.iconWrapper}>
            <Text style={styles.iconText}>🔐</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Title Section */}
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Don't worry! Enter your registered mobile number and we'll send you an OTP to reset your password.
          </Text>

          {/* Input Section */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={[
              styles.inputContainer,
              isFocused && styles.inputContainerFocused
            ]}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                placeholder="Enter 10-digit number"
                placeholderTextColor={COLORS.inputPlaceholder}
                value={contactNumber}
                onChangeText={(text) => setContactNumber(text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={10}
                style={styles.input}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </View>
            {contactNumber.length > 0 && contactNumber.length < 10 && (
              <Text style={styles.errorText}>
                Please enter a valid 10-digit number
              </Text>
            )}
          </View>

          {/* Button Section */}
          <TouchableOpacity
            style={[
              styles.button,
              (!contactNumber || contactNumber.length < 10) && styles.buttonDisabled
            ]}
            onPress={handleSendOtp}
            disabled={loading || !contactNumber || contactNumber.length < 10}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Text style={styles.buttonText}>Send OTP</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Back to Login Link */}
          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.backToLoginText}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  goldAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: SIZES.screen.width * 0.4,
    height: SIZES.screen.width * 0.4,
    backgroundColor: COLORS.goldOpacity10,
    borderBottomLeftRadius: SIZES.radius.xxxl,
    zIndex: 0,
  },
  iconContainer: {
    alignItems: "center",
    marginTop: SIZES.padding.xxxl,
    marginBottom: SIZES.padding.lg,
    zIndex: 1,
  },
  iconWrapper: {
    width: SIZES.icon.xxxxl,
    height: SIZES.icon.xxxxl,
    borderRadius: SIZES.radius.xxxl,
    backgroundColor: COLORS.primaryPale,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.blue,
  },
  iconText: {
    fontSize: SIZES.icon.xxxl,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding.xl,
    paddingTop: SIZES.padding.md,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.primary,
    marginBottom: SIZES.margin.sm,
    textAlign: "center",
  },
  subtitle: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SIZES.margin.xl,
    paddingHorizontal: SIZES.padding.md,
  },
  inputWrapper: {
    marginBottom: SIZES.margin.xl,
  },
  label: {
    ...FONTS.label,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.xs,
    marginLeft: SIZES.margin.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: SIZES.radius.input,
    backgroundColor: COLORS.inputBackground,
    ...SHADOWS.xs,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  countryCode: {
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.sm,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    backgroundColor: COLORS.primaryPale,
    borderTopLeftRadius: SIZES.radius.input - 1.5,
    borderBottomLeftRadius: SIZES.radius.input - 1.5,
  },
  countryCodeText: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    fontSize: SIZES.font.md,
  },
  input: {
    flex: 1,
    ...FONTS.body,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.sm,
    color: COLORS.textPrimary,
    height: SIZES.input.height,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: SIZES.margin.xs,
    marginLeft: SIZES.margin.xs,
  },
  button: {
    ...COMMON_STYLES.button.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SIZES.margin.sm,
    height: SIZES.button.height.lg,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.button,
    ...SHADOWS.md,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray400,
    ...SHADOWS.none,
  },
  buttonText: {
    ...FONTS.buttonLarge,
    color: COLORS.white,
    marginRight: SIZES.margin.xs,
  },
  buttonIcon: {
    fontSize: SIZES.font.xl,
    color: COLORS.white,
    fontWeight: "bold",
  },
  backToLogin: {
    marginTop: SIZES.margin.xl,
    alignItems: "center",
    padding: SIZES.padding.md,
  },
  backToLoginText: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
});

export default ForgotPasswordScreen;