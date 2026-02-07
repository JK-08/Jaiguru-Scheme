import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  TextInput,
  Animated,
  Keyboard,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { getHash, useOtpVerify, removeListener } from "react-native-otp-verify";
import Header from "../../../Components/CommonHeader/CommonHeader";
import useAuth from "../../../Hooks/useRegister";
import theme from "../../../Utills/AppTheme";
import { saveAuthData } from "../../../Utills/AsynchStorageHelper";
import { 
  ToastTypes, 
  ToastPositions,
  ToastAnimationTypes,
  useToast 
} from "../../../Components/Toast/Toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "./VerifyOTPStyles";

const { width, height } = Dimensions.get("window");

const VerifyOTPScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { verifyNormalOtp, verifyGoogleOtp, loading, error, clearError } = useAuth();

  const {
    mobileNumber,
    email,
    username,
    otpType = "normal",
    googleData,
    registrationData,
  } = route.params || {};

  // console.log("🚀 VerifyOTPScreen params:", route.params);

  // OTP State
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(30);
  const [otpLoading, setOtpLoading] = useState(false);
  const [autoCompleteOtp, setAutoCompleteOtp] = useState("");
  
  // Auto-verify State
  const [waitingForOtp, setWaitingForOtp] = useState(true);
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false);
  const [autoVerifyTimer, setAutoVerifyTimer] = useState(30);
  const [smsListenerReady, setSmsListenerReady] = useState(false);
  const [appHash, setAppHash] = useState([]);
  
  // Animation
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const inputRefs = useRef([]);
  const { message, timeoutError, startListener, stopListener } = useOtpVerify({
    numberOfDigits: 6,
  });

  const { showToast, Toast } = useToast();

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  // OTP Detection from SMS
  const detectOtpFromMessage = (smsMessage) => {
    if (!smsMessage) return null;
    console.log("📩 Analyzing SMS for OTP:", smsMessage);

    const patterns = [
      /your\s+otp\s+(?:for\s+\w+\s+)?is\s*[:\-]?\s*(\d{6})/i,
      /otp.*?is\s*[:\-]?\s*(\d{6})/i,
      /otp[:\s]+(\d{6})/i,
      /verification\s+code.*?(\d{6})/i,
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

    console.log("❌ No OTP detected in message");
    return null;
  };

  // Handle SMS message received
  useEffect(() => {
    if (message && smsListenerReady) {
      console.log("📨 SMS message received:", message);
      const detectedOtp = detectOtpFromMessage(message);

      if (detectedOtp && detectedOtp.length === 6) {
        setAutoCompleteOtp(detectedOtp);
        setOtp(detectedOtp.split(""));
        setWaitingForOtp(false);
        setShowFullScreenLoader(false);
        
        showToast({
          message: "✨ OTP detected automatically!",
          type: ToastTypes.SUCCESS,
          duration: 2000,
          position: ToastPositions.TOP,
          animationType: ToastAnimationTypes.SCALE
        });

        // Auto-verify after detection
        setTimeout(() => {
          handleOTPVerification(detectedOtp);
        }, 800);
      }
    }
  }, [message, smsListenerReady]);

  // Auto-verify timeout
  useEffect(() => {
    if (smsListenerReady && Platform.OS === "android" && waitingForOtp) {
      setShowFullScreenLoader(true);

      const timer = setTimeout(() => {
        setWaitingForOtp(false);
        setShowFullScreenLoader(false);
        
        showToast({
          message: "⌨️ Please enter OTP manually",
          type: ToastTypes.INFO,
          duration: 3000,
          position: ToastPositions.TOP
        });
        
        // Focus first input
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 300);
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    }
  }, [smsListenerReady, waitingForOtp]);

  // Handle timeout error
  useEffect(() => {
    if (timeoutError) {
      showToast({
        message: "⏱️ Auto-detection timeout. Enter OTP manually.",
        type: ToastTypes.WARNING,
        duration: 3000,
        position: ToastPositions.TOP
      });
      setWaitingForOtp(false);
      setShowFullScreenLoader(false);
      
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 300);
    }
  }, [timeoutError]);

  // Auto-verify countdown timer
  useEffect(() => {
    if (waitingForOtp && smsListenerReady && Platform.OS === "android") {
      setAutoVerifyTimer(30);
      const interval = setInterval(() => {
        setAutoVerifyTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setWaitingForOtp(false);
            setShowFullScreenLoader(false);
            
            setTimeout(() => {
              inputRefs.current[0]?.focus();
            }, 300);
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [waitingForOtp, smsListenerReady]);

  // Initialize SMS listener
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
            setWaitingForOtp(true);
            setShowFullScreenLoader(true);
            console.log("✅ SMS listener started successfully");
            
            showToast({
              message: "📱 Waiting for OTP SMS...",
              type: ToastTypes.INFO,
              duration: 3000,
              position: ToastPositions.TOP
            });
          }
        } catch (error) {
          console.error("❌ Error initializing SMS listener:", error);
          
          showToast({
            message: "⚠️ Auto-detection unavailable. Enter OTP manually.",
            type: ToastTypes.WARNING,
            duration: 4000,
            position: ToastPositions.TOP
          });
          
          setWaitingForOtp(false);
          setSmsListenerReady(false);
          setShowFullScreenLoader(false);
          
          setTimeout(() => {
            inputRefs.current[0]?.focus();
          }, 300);
        }
      } else {
        // iOS - no auto-detection
        setWaitingForOtp(false);
        setSmsListenerReady(false);
        setShowFullScreenLoader(false);
        
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 300);
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

  // Shake animation for errors
  const shakeInputs = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // Handle OTP input change
  const handleOtpChange = (val, idx) => {
    // Dismiss auto-verify loader if user starts typing
    if (val && waitingForOtp) {
      setWaitingForOtp(false);
      setShowFullScreenLoader(false);
    }

    const updated = [...otp];
    
    // Handle paste
    if (val.length > 1) {
      const pastedOtp = val.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (idx + i < 6) {
          newOtp[idx + i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus last filled input or last input
      const lastFilledIndex = Math.min(idx + pastedOtp.length - 1, 5);
      inputRefs.current[lastFilledIndex]?.focus();
      return;
    }

    updated[idx] = val;
    setOtp(updated);

    // Auto-focus next/previous input
    if (val && idx < otp.length - 1) {
      inputRefs.current[idx + 1]?.focus();
    } else if (!val && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  // Handle backspace/delete
  const handleKeyPress = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  // Clear OTP
  const clearOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    setAutoCompleteOtp("");
    inputRefs.current[0]?.focus();
    
    showToast({
      message: "🗑️ OTP cleared",
      type: ToastTypes.INFO,
      duration: 1500,
      position: ToastPositions.BOTTOM
    });
  };

  // Navigate after successful OTP
  const navigateAfterOtp = async () => {
    try {
      const hasMpin = await AsyncStorage.getItem("hasMpin");

      if (hasMpin === "true") {
        navigation.replace("MpinVerify");
      } else {
        navigation.replace("MpinCreate");
      }
    } catch (error) {
      console.log("MPIN check error:", error);
      navigation.replace("MpinCreate");
    }
  };

  // Handle OTP Verification
  const handleOTPVerification = async (customOtp = null) => {
    const otpValue = customOtp || otp.join("");
    
    if (otpValue.length !== 6) {
      shakeInputs();
      showToast({
        message: "⚠️ Please enter 6-digit OTP",
        type: ToastTypes.WARNING,
        duration: 2000,
        position: ToastPositions.TOP
      });
      return;
    }

    console.log("✅ Verifying OTP:", otpValue);
    setOtpLoading(true);
    setShowFullScreenLoader(true);
    clearError();
    Keyboard.dismiss();

    try {
      let result;

      if (otpType === "normal") {
        const verificationData = {
          username: username || registrationData?.username,
          email: email || registrationData?.email,
          contactNumber: mobileNumber || registrationData?.contactNumber,
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

        if (googleData && result) {
          result = {
            ...googleData,
            ...result,
            contactNumber: mobileNumber || googleData?.contactNumber,
          };
        }
      }

      if (!result || (!result.token && !result.id)) {
        const errorMsg = result?.errorMessage || "Verification failed. Please try again.";
        throw new Error(errorMsg);
      }

      // Handle referral code if present
      if (result.used_referral_code) {
        console.log("🎯 Found referral code:", {
          userId: result.id,
          referralCode: result.used_referral_code,
        });
      }

      // Save auth data
      const saveResult = await saveAuthData(result);
      console.log("💾 Save auth data result:", saveResult);

      if (!saveResult.success) {
        throw new Error(saveResult.error || "Failed to save authentication data");
      }

      // Success
      showToast({
        message: "🎉 OTP verified successfully!",
        type: ToastTypes.PREMIUM,
        duration: 2000,
        position: ToastPositions.TOP,
        animationType: ToastAnimationTypes.BOUNCE
      });
      
      stopListener && stopListener();
      setShowFullScreenLoader(false);

      setTimeout(() => {
        navigateAfterOtp();
      }, 600);

    } catch (err) {
      console.log("❌ Verification error:", err);
      
      shakeInputs();
      
      showToast({
        message: `❌ ${err.message || "Invalid OTP. Please check and try again."}`,
        type: ToastTypes.ERROR,
        duration: 3000,
        position: ToastPositions.TOP
      });
      
      clearOtp();
      setShowFullScreenLoader(false);
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || showFullScreenLoader) return;

    try {
      showToast({
        message: "📨 OTP resent successfully!",
        type: ToastTypes.SUCCESS,
        duration: 2000,
        position: ToastPositions.TOP
      });
      
      setResendTimer(30);
      clearOtp();

      // Restart auto-detection on Android
      if (Platform.OS === "android") {
        setWaitingForOtp(true);
        setShowFullScreenLoader(true);
        setAutoVerifyTimer(30);
        startListener && startListener();
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      
      showToast({
        message: "❌ Failed to resend OTP. Try again.",
        type: ToastTypes.ERROR,
        duration: 3000,
        position: ToastPositions.TOP
      });
    }
  };

  // Skip auto-verify and enter manually
  const skipAutoVerify = () => {
    setWaitingForOtp(false);
    setShowFullScreenLoader(false);
    stopListener && stopListener();
    
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 300);
    
    showToast({
      message: "⌨️ Enter OTP manually",
      type: ToastTypes.INFO,
      duration: 2000,
      position: ToastPositions.BOTTOM
    });
  };

  // Format time
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
        subtitle={`Enter the 6-digit code sent to ${
          mobileNumber ? `+91 ${mobileNumber}` : email
        }`}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Error Banner */}
          {error && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color={theme.COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError} style={styles.closeButton}>
                <Icon name="close" size={20} color={theme.COLORS.gray500} />
              </TouchableOpacity>
            </View>
          )}

          {/* Auto-Verify Status Card */}
          {Platform.OS === "android" && smsListenerReady && waitingForOtp && (
            <View style={styles.autoVerifyCard}>
              <View style={styles.autoVerifyIconContainer}>
                <Icon name="email-fast-outline" size={28} color={theme.COLORS.primary} />
              </View>
              <View style={styles.autoVerifyContent}>
                <Text style={styles.autoVerifyTitle}>Auto-detecting OTP</Text>
                <Text style={styles.autoVerifySubtitle}>
                  We'll fill it automatically when SMS arrives
                </Text>
                <Text style={styles.autoVerifyTimer}>
                  {autoVerifyTimer}s remaining
                </Text>
              </View>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={skipAutoVerify}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* OTP Input Section */}
          <View style={styles.otpSection}>
            <Text style={styles.otpLabel}>Enter OTP Code</Text>
            
            <Animated.View
              style={[
                styles.otpContainer,
                {
                  transform: [{ translateX: shakeAnimation }],
                },
              ]}
            >
              {otp.map((digit, index) => (
                <View key={index} style={styles.otpInputWrapper}>
                  <TextInput
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                      styles.otpInput,
                      digit && styles.otpInputFilled,
                      (showFullScreenLoader && waitingForOtp) && styles.otpInputDisabled,
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(val) => handleOtpChange(val, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    textAlign="center"
                    selectionColor={theme.COLORS.primary}
                    editable={!(showFullScreenLoader && waitingForOtp)}
                    autoFocus={index === 0 && !waitingForOtp}
                  />
                  <View
                    style={[
                      styles.otpInputUnderline,
                      digit && styles.otpInputUnderlineActive,
                    ]}
                  />
                </View>
              ))}
            </Animated.View>

            {/* Clear OTP Button */}
            {otp.some(d => d) && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearOtp}
                disabled={showFullScreenLoader && waitingForOtp}
                activeOpacity={0.7}
              >
                <Icon name="close-circle" size={18} color={theme.COLORS.textTertiary} />
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Timer & Resend Section */}
          <View style={styles.timerSection}>
            {resendTimer > 0 ? (
              <View style={styles.timerCard}>
                <Icon name="timer-sand" size={20} color={theme.COLORS.goldPrimary} />
                <Text style={styles.timerText}>
                  Resend OTP in <Text style={styles.timerValue}>{formatTime(resendTimer)}</Text>
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleResendOtp}
                style={styles.resendButton}
                activeOpacity={0.7}
                disabled={showFullScreenLoader}
              >
                <Icon name="refresh" size={20} color={theme.COLORS.goldPrimary} />
                <Text style={styles.resendButtonText}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            onPress={() => handleOTPVerification()}
            disabled={otp.join("").length !== 6 || (showFullScreenLoader && waitingForOtp)}
            style={[
              styles.verifyButton,
              (otp.join("").length !== 6 || (showFullScreenLoader && waitingForOtp)) &&
                styles.verifyButtonDisabled,
            ]}
            activeOpacity={0.8}
          >
            {otpLoading && !waitingForOtp ? (
              <ActivityIndicator color={theme.COLORS.white} size="small" />
            ) : (
              <>
                <Icon name="shield-check" size={22} color={theme.COLORS.white} />
                <Text style={styles.verifyButtonText}>Verify & Continue</Text>
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
              <Text style={styles.editNumberText}>
                <Icon name="pencil" size={14} color={theme.COLORS.textTertiary} />{" "}
                Wrong number? Change it
              </Text>
            </TouchableOpacity>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <Icon name="shield-lock-outline" size={16} color={theme.COLORS.textTertiary} />
              <Text style={styles.securityText}>
                Your data is secure and encrypted
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <Toast />

      {/* Full Screen Auto-Verify Loader */}
      {showFullScreenLoader && waitingForOtp && (
        <View style={styles.fullScreenLoader}>
          <View style={styles.loaderOverlay} />
          <View style={styles.loaderCard}>
            <View style={styles.loaderIconContainer}>
              <ActivityIndicator size="large" color={theme.COLORS.primary} />
            </View>
            
            <Text style={styles.loaderTitle}>Waiting for OTP</Text>
            <Text style={styles.loaderSubtitle}>
              We're automatically detecting the OTP from your SMS
            </Text>
            
            <View style={styles.loaderTimerContainer}>
              <Icon name="timer-outline" size={18} color={theme.COLORS.goldPrimary} />
              <Text style={styles.loaderTimer}>
                {autoVerifyTimer}s remaining
              </Text>
            </View>

            <TouchableOpacity
              style={styles.loaderSkipButton}
              onPress={skipAutoVerify}
              activeOpacity={0.7}
            >
              <Text style={styles.loaderSkipText}>Enter Manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Verification Loading Overlay */}
      {showFullScreenLoader && !waitingForOtp && otpLoading && (
        <View style={styles.fullScreenLoader}>
          <View style={styles.loaderOverlay} />
          <View style={styles.loaderCard}>
            <View style={styles.loaderIconContainer}>
              <ActivityIndicator size="large" color={theme.COLORS.primary} />
            </View>
            
            <Text style={styles.loaderTitle}>Verifying OTP</Text>
            <Text style={styles.loaderSubtitle}>
              Please wait while we verify your code
            </Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default VerifyOTPScreen;