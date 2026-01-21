import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Dimensions,
  TextInput,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { getHash, useOtpVerify, removeListener } from "react-native-otp-verify";
import Header from "../../../Components/CommonHeader/CommonHeader";
import useAuth from "../../../Hooks/useRegister";
import theme from "../../../Utills/AppTheme";
import { saveAuthData } from "../../../Utills/AsynchStorageHelper";
import { showToast } from "../../../Components/Toast/Toast"; // Assuming you have this utility

const { width, height } = Dimensions.get("window");

const VerifyOTPScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { verifyNormalOtp, verifyGoogleOtp, loading, error, clearError } =
    useAuth();

  const {
    mobileNumber,
    email,
    username,
    otpType = "normal",
    googleData,
  } = route.params || {};

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(20);
  const [otpLoading, setOtpLoading] = useState(false);
  const [autoCompleteOtp, setAutoCompleteOtp] = useState("");
  const [waitingForOtp, setWaitingForOtp] = useState(true);
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false);
  const [autoVerifyTimer, setAutoVerifyTimer] = useState(20);
  const [smsListenerReady, setSmsListenerReady] = useState(false);
  const [appHash, setAppHash] = useState([]);

  const inputRefs = useRef([]);
  const { message, timeoutError, startListener, stopListener } = useOtpVerify({
    numberOfDigits: 6,
  });

  // -------------------- TIMER --------------------
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  // -------------------- DETECT OTP FROM MESSAGE --------------------
  const detectOtpFromMessage = (smsMessage) => {
    if (!smsMessage) return null;
    console.log("📩 Analyzing SMS for OTP:", smsMessage);

    const patterns = [
      /your\s+otp\s+(?:for\s+\w+\s+)?is\s*(\d{6})/i,
      /otp.*?is\s*[:\-]?\s*(\d{6})/i,
      /otp[:\s]+(\d{6})/i,
      /\b(\d{6})\b/,
    ];

    for (const pattern of patterns) {
      const match = smsMessage.match(pattern);
      if (match) {
        const detected = match[1] || match[0];
        console.log("✅ OTP Detected:", detected);
        return detected;
      }
    }

    console.log("❌ No OTP detected");
    return null;
  };

  // -------------------- HANDLE INCOMING SMS --------------------
  useEffect(() => {
    if (message && smsListenerReady) {
      console.log("📨 SMS message received:", message);
      const detectedOtp = detectOtpFromMessage(message);

      if (detectedOtp && detectedOtp.length === 6) {
        setAutoCompleteOtp(detectedOtp);
        setOtp(detectedOtp.split(""));
        setWaitingForOtp(false);
        setShowFullScreenLoader(false);
        showToast("OTP detected automatically!");

        setTimeout(() => {
          handleOTPVerification();
        }, 800);
      }
    }
  }, [message, smsListenerReady]);

  // -------------------- WAITING LOADER (20 seconds) --------------------
  useEffect(() => {
    if (smsListenerReady && Platform.OS === "android") {
      setShowFullScreenLoader(true);

      const timer = setTimeout(() => {
        setWaitingForOtp(false);
        setShowFullScreenLoader(false);
        showToast("You can enter OTP manually");
      }, 20000);

      return () => clearTimeout(timer);
    }
  }, [smsListenerReady]);

  // -------------------- HANDLE TIMEOUT --------------------
  useEffect(() => {
    if (timeoutError) {
      showToast("OTP detection timeout. Please enter it manually.");
      setWaitingForOtp(false);
      setShowFullScreenLoader(false);
    }
  }, [timeoutError]);

  // -------------------- AUTO VERIFY TIMER (20 seconds) --------------------
  useEffect(() => {
    if (waitingForOtp && smsListenerReady && Platform.OS === "android") {
      setAutoVerifyTimer(20);
      const interval = setInterval(() => {
        setAutoVerifyTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setWaitingForOtp(false);
            setShowFullScreenLoader(false);
            showToast("You can enter OTP manually");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [waitingForOtp, smsListenerReady]);

  // -------------------- INITIALIZE LISTENER --------------------
  useEffect(() => {
    const initializeSMSListener = async () => {
      if (Platform.OS === "android") {
        try {
          console.log("🔄 Initializing SMS listener...");
          const hashCodes = await getHash();
          setAppHash(hashCodes);
          console.log("📲 App Hash:", hashCodes);

          if (startListener) {
            startListener();
            setSmsListenerReady(true);
            console.log("✅ SMS listener started successfully");
          }
        } catch (error) {
          console.error("❌ Error initializing SMS listener:", error);
          setWaitingForOtp(false);
          setSmsListenerReady(false);
          setShowFullScreenLoader(false);
        }
      } else {
        setWaitingForOtp(false);
        setSmsListenerReady(false);
        setShowFullScreenLoader(false);
      }
    };

    initializeSMSListener();

    return () => {
      try {
        removeListener();
        stopListener && stopListener();
        setSmsListenerReady(false);
        setShowFullScreenLoader(false);
      } catch (error) {
        console.error("Cleanup SMS listener error:", error);
      }
    };
  }, []);

  // -------------------- AUTO VERIFY WHEN ALL DIGITS ENTERED --------------------
  useEffect(() => {
    const otpValue = otp.join("");
    if (otpValue.length === 6 && !otpLoading && !waitingForOtp) {
      console.log("🔍 Auto-verifying:", otpValue);
      handleOTPVerification();
    }
  }, [otp]);

  // -------------------- OTP HANDLERS --------------------
  const handleOtpChange = (val, idx) => {
    if (val && waitingForOtp) {
      setWaitingForOtp(false);
      setShowFullScreenLoader(false);
    }

    const updated = [...otp];
    updated[idx] = val;
    setOtp(updated);

    if (val && idx < otp.length - 1) {
      inputRefs.current[idx + 1]?.focus();
    } else if (!val && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const clearOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    setAutoCompleteOtp("");
    inputRefs.current[0]?.focus();
  };

  const handleOTPVerification = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      showToast("Please enter 6-digit OTP");
      return;
    }

    console.log("✅ Verifying OTP:", otpValue);
    setOtpLoading(true);
    setShowFullScreenLoader(true);
    clearError();

    try {
      let result;

      if (otpType === "normal") {
        const verificationData = {
          username: username,
          email: email,
          contactNumber: mobileNumber,
          otp: otpValue.trim(),
        };

        console.log("📱 Normal OTP verification data:", verificationData);
        result = await verifyNormalOtp(verificationData);
        console.log("✅ Normal OTP verification result:", result);
      } else if (otpType === "google") {
        const verificationData = {
          newContactNumber: mobileNumber || googleData?.contactNumber,
          otp: otpValue.trim(),
        };

        console.log("📱 Google OTP verification data:", verificationData);
        result = await verifyGoogleOtp(verificationData);
        console.log("✅ Google OTP verification result:", result);

        // Merge with Google data
        if (googleData && result) {
          result = {
            ...googleData,
            ...result,
            contactNumber: mobileNumber || googleData?.contactNumber,
          };
        }
      }

      // Check if verification was successful
      if (!result || (!result.token && !result.id)) {
        const errorMsg =
          result?.errorMessage || "Verification failed. Please try again.";
        throw new Error(errorMsg);
      }

      // Check for referral code
      if (result.used_referral_code) {
        console.log("🎯 Found referral code to verify:", {
          userId: result.id,
          referralCode: result.used_referral_code,
        });

        try {
          // You might want to add referral verification logic here
          // const referralCheckResponse = await userService.checkReferralCode(
          //   result.id,
          //   result.used_referral_code
          // );
          // console.log("📨 Referral API Response:", referralCheckResponse);
        } catch (referralError) {
          console.error("❌ Referral API error:", referralError);
        }
      }

      // Save auth data
      const saveResult = await saveAuthData(result);
      console.log("💾 Save auth data result:", saveResult);

      if (!saveResult.success) {
        throw new Error(
          saveResult.error || "Failed to save authentication data",
        );
      }

      showToast("OTP verified successfully!");
      stopListener && stopListener();
      setShowFullScreenLoader(false);

      // Navigate to Home
      setTimeout(() => {
        navigation.replace("Home");
      }, 500);
    } catch (err) {
      console.log("❌ Verification error:", err);
      showToast(err.message || "Invalid OTP. Please check and try again.");
      clearOtp();
      setShowFullScreenLoader(false);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || showFullScreenLoader) return;

    try {
      showToast("OTP resent successfully!");
      setResendTimer(20);
      clearOtp();

      if (Platform.OS === "android") {
        setWaitingForOtp(true);
        setShowFullScreenLoader(true);
        startListener && startListener();
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      showToast("Failed to resend OTP. Try again.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
    >
      <Header
        title="Verify OTP"
        subtitle={`Enter the 6-digit OTP sent to +91 ${mobileNumber}`}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.contentContainer}>
          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color={theme.COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError} style={styles.closeButton}>
                <Icon name="close" size={20} color={theme.COLORS.gray500} />
              </TouchableOpacity>
            </View>
          )}

          {/* OTP Input - Underline Style */}
          <View style={styles.otpWrapper}>
            <View style={styles.otpContainerUnderline}>
              {otp.map((digit, index) => (
                <View key={index} style={styles.otpDigitContainer}>
                  <TextInput
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                      styles.otpInputUnderline,
                      digit && styles.otpInputFilled,
                      showFullScreenLoader && styles.disabledInput,
                    ]}
                    keyboardType="numeric"
                    maxLength={1}
                    value={digit}
                    onChangeText={(val) => handleOtpChange(val, index)}
                    textAlign="center"
                    selectionColor={theme.COLORS.primary}
                    editable={!showFullScreenLoader}
                  />
                  <View
                    style={[styles.underline, digit && styles.underlineActive]}
                  />
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.clearOtpButton}
              onPress={clearOtp}
              disabled={showFullScreenLoader}
            >
              <Text
                style={[
                  styles.clearOtpText,
                  showFullScreenLoader && styles.disabledText,
                ]}
              >
                Clear OTP
              </Text>
            </TouchableOpacity>
          </View>

          {/* Timer & Resend */}
          <View style={styles.timerWrapper}>
            <View style={styles.timerCard}>
              <Icon
                name="timer-outline"
                size={20}
                color={theme.COLORS.textSecondary}
              />
              <Text style={styles.timerText}>
                Resend OTP in {formatTime(resendTimer)}
              </Text>
            </View>

            {resendTimer <= 0 && (
              <TouchableOpacity
                onPress={handleResendOtp}
                style={styles.resendButton}
                activeOpacity={0.7}
                disabled={showFullScreenLoader}
              >
                <Icon
                  name="reload"
                  size={18}
                  color={theme.COLORS.goldPrimary}
                />
                <Text
                  style={[
                    styles.resendText,
                    showFullScreenLoader && styles.disabledText,
                  ]}
                >
                  Resend OTP
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            onPress={handleOTPVerification}
            disabled={otp.join("").length !== 6 || showFullScreenLoader}
            style={[
              styles.verifyButton,
              (otp.join("").length !== 6 || showFullScreenLoader) &&
                styles.verifyButtonDisabled,
            ]}
            activeOpacity={0.8}
          >
            {otpLoading ? (
              <ActivityIndicator color={theme.COLORS.white} size="small" />
            ) : (
              <>
                <Icon
                  name="check-circle"
                  size={20}
                  color={theme.COLORS.white}
                />
                <Text style={styles.verifyButtonText}>Verify OTP</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              disabled={showFullScreenLoader}
            >
              <Text
                style={[
                  styles.editNumberText,
                  showFullScreenLoader && styles.disabledText,
                ]}
              >
                <Icon
                  name="pencil"
                  size={14}
                  color={theme.COLORS.textTertiary}
                />{" "}
                Wrong number? Edit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* FULL SCREEN LOADER */}
      {showFullScreenLoader && (
        <View style={styles.fullScreenLoader}>
          <View style={styles.loaderBackground} />
          <View style={styles.loaderContent}>
            <ActivityIndicator size="large" color={theme.COLORS.primary} />
            <Text style={styles.loadingText}>
              {waitingForOtp && !otpLoading
                ? "Waiting for OTP..."
                : "Verifying OTP..."}
            </Text>
            <Text style={styles.loadingSubtext}>
              {waitingForOtp && !otpLoading
                ? "We're automatically detecting OTP from SMS..."
                : "Please wait while we verify your OTP"}
            </Text>
            {waitingForOtp && !otpLoading && (
              <Text style={styles.loadingTimer}>
                Auto-detecting OTP… {autoVerifyTimer}s remaining
              </Text>
            )}
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.backgroundGold,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.SIZES.padding.container,
    paddingTop: Platform.OS === "ios" ? theme.SIZES.md : theme.SIZES.sm,
    paddingBottom: theme.SIZES.xl,
  },
  contentContainer: {
    marginTop: theme.SIZES.md,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${theme.COLORS.error}15`,
    padding: theme.SIZES.padding.md,
    borderRadius: theme.SIZES.radius.md,
    marginBottom: theme.SIZES.xl,
    borderLeftWidth: 4,
    borderLeftColor: theme.COLORS.error,
  },
  errorText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.error,
    flex: 1,
    marginHorizontal: theme.SIZES.sm,
  },
  closeButton: {
    padding: theme.SIZES.xs,
  },
  otpWrapper: {
    alignItems: "center",
    marginBottom: theme.SIZES.xxl,
  },
  otpContainerUnderline: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: theme.SIZES.lg,
  },
  otpDigitContainer: {
    alignItems: "center",
    width: width * 0.12,
  },
  otpInputUnderline: {
    width: "100%",
    height: theme.SIZES.icon.xl,
    fontSize: theme.SIZES.font.xxl,
    fontFamily: theme.FONTS.family?.bold || "System",
    color: theme.COLORS.textPrimary,
    textAlign: "center",
    backgroundColor: theme.COLORS.transparent,
  },
  otpInputFilled: {
    color: theme.COLORS.primary,
  },
  underline: {
    width: "100%",
    height: 2,
    backgroundColor: theme.COLORS.gray300,
    marginTop: theme.SIZES.xs,
  },
  underlineActive: {
    backgroundColor: theme.COLORS.primary,
    height: 3,
  },
  clearOtpButton: {
    marginTop: theme.SIZES.md,
    padding: theme.SIZES.sm,
  },
  clearOtpText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textTertiary,
  },
  disabledInput: {
    opacity: 0.5,
  },
  disabledText: {
    color: theme.COLORS.textDisabled,
  },
  timerWrapper: {
    marginBottom: theme.SIZES.xxl,
    alignItems: "center",
  },
  timerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.COLORS.white,
    paddingHorizontal: theme.SIZES.padding.lg,
    paddingVertical: theme.SIZES.padding.md,
    borderRadius: theme.SIZES.radius.lg,
    marginBottom: theme.SIZES.md,
  },
  timerText: {
    ...theme.FONTS.bodyMedium,
    color: theme.COLORS.textSecondary,
    marginLeft: theme.SIZES.sm,
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.SIZES.sm,
  },
  resendText: {
    ...theme.FONTS.bodyBold,
    color: theme.COLORS.goldPrimary,
    marginLeft: theme.SIZES.xs,
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.COLORS.goldPrimary,
    borderRadius: theme.SIZES.radius.md,
    padding: theme.SIZES.padding.md,
    height: theme.SIZES.button?.height?.lg || 56,
    marginBottom: theme.SIZES.xl,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    ...theme.FONTS.buttonLarge,
    color: theme.COLORS.primary,
    marginLeft: theme.SIZES.sm,
  },
  footer: {
    alignItems: "center",
    paddingTop: theme.SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: `${theme.COLORS.gray300}30`,
  },
  editNumberText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textTertiary,
  },
  fullScreenLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loaderBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.COLORS.overlayDark,
  },
  loaderContent: {
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.SIZES.radius.xl,
    padding: theme.SIZES.padding.xl,
    alignItems: "center",
    maxWidth: width * 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingText: {
    ...theme.FONTS.h4,
    color: theme.COLORS.primary,
    marginTop: theme.SIZES.lg,
    textAlign: "center",
  },
  loadingSubtext: {
    ...theme.FONTS.body,
    color: theme.COLORS.textSecondary,
    marginTop: theme.SIZES.sm,
    textAlign: "center",
  },
  loadingTimer: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.goldPrimary,
    marginTop: theme.SIZES.sm,
    textAlign: "center",
  },
});

export default VerifyOTPScreen;