import React, { useState } from "react";
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

const GoogleContactMobileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const { requestGoogleOtp, loading, error } = useAuth();

  const [mobile, setMobile] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSendOtp = async () => {
    if (!mobile || mobile.length < 10) {
      Alert.alert("Invalid Number", "Please enter a valid 10-digit mobile number");
      return;
    }

    const result = await requestGoogleOtp({
      userId,
      newContactNumber: mobile,
    });

    if (!result?.error) {
      Alert.alert(
        "OTP Sent", 
        `Verification code has been sent to ${mobile}`,
        [{ text: "OK" }]
      );
      navigation.navigate("GoogleContactVerify", {
        userId,
        mobile,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CommonHeader title="Update Contact" />
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
                <Text style={styles.iconText}>📱</Text>
              </View>
            </View>

            {/* Header Text */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Enter Mobile Number</Text>
              <Text style={styles.subtitle}>
                Please provide your mobile number to verify and update your contact information
              </Text>
            </View>

            {/* Input Field */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={[
                styles.inputContainer,
                isFocused && styles.inputContainerFocused,
                error && styles.inputContainerError
              ]}>
                <Text style={styles.countryCode}>+91</Text>
                <View style={styles.inputDivider} />
                <TextInput
                  style={styles.input}
                  placeholder="98765 43210"
                  placeholderTextColor={COLORS.inputPlaceholder}
                  keyboardType="number-pad"
                  value={mobile}
                  onChangeText={setMobile}
                  maxLength={10}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </View>
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                We'll send a 6-digit verification code to this number
              </Text>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={[
                styles.button,
                (!mobile || mobile.length < 10) && styles.buttonDisabled
              ]}
              onPress={handleSendOtp}
              activeOpacity={0.8}
              disabled={loading || !mobile || mobile.length < 10}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Send Verification Code</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <Text style={styles.securityIcon}>🔒</Text>
              <Text style={styles.securityText}>
                Your information is secure and encrypted
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default GoogleContactMobileScreen;

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
    backgroundColor: COLORS.primaryPale,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.blue,
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
    paddingHorizontal: SIZES.lg,
  },
  inputWrapper: {
    marginBottom: SIZES.lg,
    zIndex: 1,
  },
  inputLabel: {
    ...FONTS.label,
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
    marginLeft: SIZES.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SIZES.md,
    height: SIZES.input.height + 4,
    ...SHADOWS.xs,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    ...SHADOWS.blue,
  },
  inputContainerError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight + '10',
  },
  countryCode: {
    ...FONTS.bodyBold,
    color: COLORS.primary,
    paddingHorizontal: SIZES.xs,
  },
  inputDivider: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.border,
    marginHorizontal: SIZES.sm,
  },
  input: {
    flex: 1,
    ...FONTS.body,
    color: COLORS.textPrimary,
    padding: 0,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.xs,
    marginLeft: SIZES.xs,
  },
  errorIcon: {
    fontSize: SIZES.font.sm,
    marginRight: SIZES.xxs,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    flex: 1,
  },
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
  infoIcon: {
    fontSize: SIZES.font.lg,
    marginRight: SIZES.sm,
  },
  infoText: {
    ...FONTS.bodySmall,
    color: COLORS.primary,
    flex: 1,
  },
  button: {
    ...COMMON_STYLES.button.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: SIZES.button.height.lg,
    marginBottom: SIZES.xl,
    zIndex: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
    ...SHADOWS.none,
  },
  buttonText: {
    ...FONTS.buttonLarge,
    marginRight: SIZES.sm,
  },
  buttonIcon: {
    ...FONTS.buttonLarge,
    fontSize: SIZES.font.xl,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  securityIcon: {
    fontSize: SIZES.font.sm,
    marginRight: SIZES.xxs,
  },
  securityText: {
    ...FONTS.caption,
    color: COLORS.textTertiary,
  },
});