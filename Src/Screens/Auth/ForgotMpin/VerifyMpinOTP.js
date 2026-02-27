import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Keyboard,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { getHash, useOtpVerify, removeListener } from "react-native-otp-verify";
import { useMpin } from "../../../Hooks/useMpin";
import CommonHeader from '../../../Components/CommonHeader/CommonHeader';
import { COLORS, SIZES, FONTS, SHADOWS, COMMON_STYLES } from '../../../Utills/AppTheme';
import { 
  ToastTypes, 
  ToastPositions,
  ToastAnimationTypes,
  useToast 
} from "../../../Components/Toast/Toast";
import { getUserData } from '../../../Utills/AsynchStorageHelper';

const { width } = Dimensions.get("window");

const VerifyForgotMpinScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { verifyForgotOtp, sendForgotOtp, loading } = useMpin();
  const { showToast, Toast, hideToast } = useToast();

  // Get mobile number from route params or storage
  const { mobileNumber: routeMobile } = route.params || {};
  
  // State
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newMpin, setNewMpin] = useState(["", "", "", ""]);
  const [confirmMpin, setConfirmMpin] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [userMobile, setUserMobile] = useState('');
  const [step, setStep] = useState('otp'); // 'otp' or 'mpin'
  
  // Auto-verify State
  const [waitingForOtp, setWaitingForOtp] = useState(Platform.OS === "android");
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(Platform.OS === "android");
  const [autoVerifyTimer, setAutoVerifyTimer] = useState(30);
  const [smsListenerReady, setSmsListenerReady] = useState(false);
  
  // Refs to prevent multiple toasts
  const toastShownRef = useRef({
    waiting: false,
    timeout: false,
    autoDetect: false,
    manual: false
  });
  
  // Animations
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Refs
  const otpInputRefs = useRef([]);
  const mpinInputRefs = useRef([]);
  const confirmMpinRefs = useRef([]);
  
  const { message, timeoutError, startListener, stopListener } = useOtpVerify({
    numberOfDigits: 6,
  });

  // Load user mobile number
  useEffect(() => {
    loadUserMobile();
  }, []);

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
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Load user mobile
  const loadUserMobile = async () => {
    try {
      const userData = await getUserData();
      if (userData) {
        const mobile = userData.contactNumber || 
                      userData.mobileNumber || 
                      userData.phone || 
                      userData.mobile;
        setUserMobile(mobile || routeMobile || '');
      }
    } catch (error) {
      console.error('Error loading user mobile:', error);
    }
  };

  // Format mobile number
  const formatMobileNumber = (number) => {
    if (!number) return 'your registered number';
    const strNumber = String(number);
    if (strNumber.length >= 10) {
      const last4 = strNumber.slice(-4);
      return `•••• •••• ${last4}`;
    } else if (strNumber.length >= 4) {
      const last4 = strNumber.slice(-4);
      return `••••${last4}`;
    }
    return 'your registered number';
  };

  // Safe toast function to prevent duplicates
  const safeShowToast = (params) => {
    // Check if similar toast was shown recently
    const toastKey = params.message.substring(0, 20); // Use first 20 chars as key
    const now = Date.now();
    
    if (toastShownRef.current[toastKey] && 
        now - toastShownRef.current[toastKey] < 3000) {
      return; // Prevent duplicate toast within 3 seconds
    }
    
    toastShownRef.current[toastKey] = now;
    showToast(params);
  };

  // Detect OTP from SMS
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
        return match[1] || match[0];
      }
    }
    return null;
  };

  // Handle SMS message
  useEffect(() => {
    if (message && smsListenerReady && step === 'otp') {
      console.log("📨 SMS received:", message);
      const detectedOtp = detectOtpFromMessage(message);

      if (detectedOtp && detectedOtp.length === 6) {
        setOtp(detectedOtp.split(""));
        setWaitingForOtp(false);
        setShowFullScreenLoader(false);
        
        // Only show toast if not already shown
        if (!toastShownRef.current.autoDetect) {
          toastShownRef.current.autoDetect = true;
          safeShowToast({
            message: "✨ OTP detected automatically!",
            type: ToastTypes.SUCCESS,
            duration: 2000,
            position: ToastPositions.TOP,
          });

          // Reset after duration
          setTimeout(() => {
            toastShownRef.current.autoDetect = false;
          }, 3000);
        }

        // Auto-verify after detection
        setTimeout(() => {
          handleVerifyOtp(detectedOtp);
        }, 800);
      }
    }
  }, [message, smsListenerReady, step]);

  // Auto-verify timeout
  useEffect(() => {
    if (smsListenerReady && Platform.OS === "android" && waitingForOtp && step === 'otp') {
      const timer = setTimeout(() => {
        setWaitingForOtp(false);
        setShowFullScreenLoader(false);
        
        // Only show toast if not already shown
        if (!toastShownRef.current.timeout) {
          toastShownRef.current.timeout = true;
          safeShowToast({
            message: "⌨️ Please enter OTP manually",
            type: ToastTypes.INFO,
            duration: 3000,
            position: ToastPositions.TOP
          });
          
          setTimeout(() => {
            toastShownRef.current.timeout = false;
          }, 4000);
        }
        
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 300);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [smsListenerReady, waitingForOtp, step]);

  // Handle timeout error
  useEffect(() => {
    if (timeoutError) {
      // Only show toast if not already shown
      if (!toastShownRef.current.timeout) {
        toastShownRef.current.timeout = true;
        safeShowToast({
          message: "⏱️ Auto-detection timeout. Enter OTP manually.",
          type: ToastTypes.WARNING,
          duration: 3000,
          position: ToastPositions.TOP
        });
        
        setTimeout(() => {
          toastShownRef.current.timeout = false;
        }, 4000);
      }
      
      setWaitingForOtp(false);
      setShowFullScreenLoader(false);
      
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 300);
    }
  }, [timeoutError]);

  // Auto-verify countdown
  useEffect(() => {
    if (waitingForOtp && smsListenerReady && Platform.OS === "android" && step === 'otp') {
      setAutoVerifyTimer(30);
      const interval = setInterval(() => {
        setAutoVerifyTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setWaitingForOtp(false);
            setShowFullScreenLoader(false);
            setTimeout(() => {
              otpInputRefs.current[0]?.focus();
            }, 300);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [waitingForOtp, smsListenerReady, step]);

  // Initialize SMS listener
  useEffect(() => {
    const initializeSMSListener = async () => {
      if (Platform.OS === "android" && step === 'otp') {
        try {
          console.log("🔄 Initializing SMS listener...");
          const hashCodes = await getHash();
          console.log("📲 App Hash:", hashCodes);

          if (startListener) {
            startListener();
            setSmsListenerReady(true);
            setWaitingForOtp(true);
            setShowFullScreenLoader(true);
            
            // Only show toast if not already shown
            if (!toastShownRef.current.waiting) {
              toastShownRef.current.waiting = true;
              
              
              setTimeout(() => {
                toastShownRef.current.waiting = false;
              }, 4000);
            }
          }
        } catch (error) {
          console.error("❌ Error initializing SMS listener:", error);
          
          // Only show toast if not already shown
          if (!toastShownRef.current.error) {
            toastShownRef.current.error = true;
            safeShowToast({
              message: "⚠️ Auto-detection unavailable. Enter OTP manually.",
              type: ToastTypes.WARNING,
              duration: 4000,
              position: ToastPositions.TOP
            });
            
            setTimeout(() => {
              toastShownRef.current.error = false;
            }, 5000);
          }
          
          setWaitingForOtp(false);
          setSmsListenerReady(false);
          setShowFullScreenLoader(false);
          
          setTimeout(() => {
            otpInputRefs.current[0]?.focus();
          }, 300);
        }
      } else {
        setWaitingForOtp(false);
        setSmsListenerReady(false);
        setShowFullScreenLoader(false);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 300);
      }
    };

    initializeSMSListener();

    return () => {
      try {
        removeListener();
        stopListener && stopListener();
        // Clear all toast states
        toastShownRef.current = {
          waiting: false,
          timeout: false,
          autoDetect: false,
          manual: false
        };
      } catch (error) {
        console.error("Cleanup SMS listener error:", error);
      }
    };
  }, [step]);

  // Shake animation
  const shakeInputs = (type = 'otp') => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // Handle OTP input
  const handleOtpChange = (val, idx) => {
    if (val && waitingForOtp) {
      setWaitingForOtp(false);
      setShowFullScreenLoader(false);
      
      // Only show toast if not already shown
      if (!toastShownRef.current.manual) {
        toastShownRef.current.manual = true;
        
        
        setTimeout(() => {
          toastShownRef.current.manual = false;
        }, 2000);
      }
    }

    const updated = [...otp];
    
    if (val.length > 1) {
      const pastedOtp = val.slice(0, 6).split("");
      pastedOtp.forEach((digit, i) => {
        if (idx + i < 6) {
          updated[idx + i] = digit;
        }
      });
      setOtp(updated);
      
      const lastFilledIndex = Math.min(idx + pastedOtp.length - 1, 5);
      otpInputRefs.current[lastFilledIndex]?.focus();
      return;
    }

    updated[idx] = val;
    setOtp(updated);

    if (val && idx < otp.length - 1) {
      otpInputRefs.current[idx + 1]?.focus();
    } else if (!val && idx > 0) {
      otpInputRefs.current[idx - 1]?.focus();
    }
  };

  // Handle MPIN input
  const handleMpinChange = (val, idx, type = 'new') => {
    const refs = type === 'new' ? mpinInputRefs : confirmMpinRefs;
    const setter = type === 'new' ? setNewMpin : setConfirmMpin;
    const current = type === 'new' ? newMpin : confirmMpin;

    const updated = [...current];
    
    if (val.length > 1) {
      const pastedMpin = val.slice(0, 4).split("");
      pastedMpin.forEach((digit, i) => {
        if (idx + i < 4) {
          updated[idx + i] = digit;
        }
      });
      setter(updated);
      
      const lastFilledIndex = Math.min(idx + pastedMpin.length - 1, 3);
      refs.current[lastFilledIndex]?.focus();
      return;
    }

    updated[idx] = val;
    setter(updated);

    if (val && idx < 3) {
      refs.current[idx + 1]?.focus();
    } else if (!val && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  // Handle key press
  const handleKeyPress = (e, idx, type = 'otp') => {
    if (e.nativeEvent.key === 'Backspace') {
      if (type === 'otp' && !otp[idx] && idx > 0) {
        otpInputRefs.current[idx - 1]?.focus();
      } else if (type === 'new' && !newMpin[idx] && idx > 0) {
        mpinInputRefs.current[idx - 1]?.focus();
      } else if (type === 'confirm' && !confirmMpin[idx] && idx > 0) {
        confirmMpinRefs.current[idx - 1]?.focus();
      }
    }
  };

  // Clear OTP
  const clearOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    otpInputRefs.current[0]?.focus();
    
    safeShowToast({
      message: "🗑️ OTP cleared",
      type: ToastTypes.INFO,
      duration: 1500,
      position: ToastPositions.BOTTOM
    });
  };

  // Verify OTP
  const handleVerifyOtp = async (customOtp = null) => {
    const otpValue = customOtp || otp.join("");
    
    if (otpValue.length !== 6) {
      shakeInputs('otp');
      safeShowToast({
        message: "⚠️ Please enter 6-digit OTP",
        type: ToastTypes.WARNING,
        duration: 2000,
        position: ToastPositions.TOP
      });
      return;
    }

    try {
      // Here you would verify the OTP
      // const res = await verifyForgotOtp(otpValue);
      
      safeShowToast({
        message: "✅ OTP verified successfully!",
        type: ToastTypes.SUCCESS,
        duration: 1500,
        position: ToastPositions.TOP
      });

      // Move to MPIN step
      setTimeout(() => {
        setStep('mpin');
        setTimeout(() => {
          mpinInputRefs.current[0]?.focus();
        }, 300);
      }, 500);

    } catch (err) {
      shakeInputs('otp');
      safeShowToast({
        message: `❌ ${err.message || "Invalid OTP"}`,
        type: ToastTypes.ERROR,
        duration: 3000,
        position: ToastPositions.TOP
      });
    }
  };

  // Reset MPIN
  const handleResetMpin = async () => {
    const newMpinValue = newMpin.join("");
    const confirmMpinValue = confirmMpin.join("");

    if (newMpinValue.length !== 4) {
      shakeInputs('new');
      safeShowToast({
        message: "⚠️ Please enter 4-digit MPIN",
        type: ToastTypes.WARNING,
        duration: 2000,
        position: ToastPositions.TOP
      });
      return;
    }

    if (confirmMpinValue.length !== 4) {
      shakeInputs('confirm');
      safeShowToast({
        message: "⚠️ Please confirm your MPIN",
        type: ToastTypes.WARNING,
        duration: 2000,
        position: ToastPositions.TOP
      });
      return;
    }

    if (newMpinValue !== confirmMpinValue) {
      shakeInputs('new');
      shakeInputs('confirm');
      safeShowToast({
        message: "❌ MPINs do not match",
        type: ToastTypes.ERROR,
        duration: 3000,
        position: ToastPositions.TOP
      });
      return;
    }

    try {
      const res = await verifyForgotOtp(otp.join(""), newMpinValue);
      
      safeShowToast({
        message: "🎉 MPIN reset successfully!",
        type: ToastTypes.PREMIUM,
        duration: 2000,
        position: ToastPositions.TOP,
        animationType: ToastAnimationTypes.BOUNCE
      });

      setTimeout(() => {
        navigation.replace("Login");
      }, 1500);

    } catch (err) {
      safeShowToast({
        message: `❌ ${err.message}`,
        type: ToastTypes.ERROR,
        duration: 3000,
        position: ToastPositions.TOP
      });
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (timer > 0 || loading) return;

    try {
      await sendForgotOtp();
      setTimer(60);
      
      safeShowToast({
        message: "📨 OTP resent successfully!",
        type: ToastTypes.SUCCESS,
        duration: 2000,
        position: ToastPositions.TOP
      });
      
      // Reset OTP inputs
      setOtp(["", "", "", "", "", ""]);
      
      // Restart auto-detection
      if (Platform.OS === "android") {
        setWaitingForOtp(true);
        setShowFullScreenLoader(true);
        setAutoVerifyTimer(30);
        startListener && startListener();
      }

    } catch (err) {
      safeShowToast({
        message: `❌ ${err.message}`,
        type: ToastTypes.ERROR,
        duration: 3000,
        position: ToastPositions.TOP
      });
    }
  };

  // Skip auto-verify
  const skipAutoVerify = () => {
    setWaitingForOtp(false);
    setShowFullScreenLoader(false);
    stopListener && stopListener();
    
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 300);
    
    // Only show toast if not already shown
    if (!toastShownRef.current.manual) {
      toastShownRef.current.manual = true;
     
      
      setTimeout(() => {
        toastShownRef.current.manual = false;
      }, 3000);
    }
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
      <CommonHeader 
        title={step === 'otp' ? "Verify OTP" : "Reset MPIN"} 
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
          {/* Header Info */}
          <View style={styles.headerInfo}>
            <View style={styles.iconCircle}>
              <Icon 
                name={step === 'otp' ? "message-lock" : "lock-reset"} 
                size={32} 
                color={COLORS.primary} 
              />
            </View>
            <Text style={styles.headerTitle}>
              {step === 'otp' ? "Enter Verification Code" : "Create New MPIN"}
            </Text>
            <Text style={styles.headerSubtitle}>
              {step === 'otp' 
                ? `We've sent a 6-digit code to ${formatMobileNumber(userMobile)}`
                : "Choose a 4-digit MPIN you'll remember"
              }
            </Text>
          </View>

          {/* OTP Step */}
          {step === 'otp' && (
            <>
              {/* Auto-Verify Card */}
              {Platform.OS === "android" && smsListenerReady && waitingForOtp && (
                <View style={styles.autoVerifyCard}>
                  <View style={styles.autoVerifyIconContainer}>
                    <Icon name="email-fast-outline" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.autoVerifyContent}>
                    <Text style={styles.autoVerifyTitle}>Auto-detecting OTP</Text>
                    <Text style={styles.autoVerifyTimer}>
                      {autoVerifyTimer}s remaining
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={skipAutoVerify}
                  >
                    <Text style={styles.skipButtonText}>Skip</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* OTP Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Verification Code</Text>
                
                <Animated.View
                  style={[
                    styles.otpContainer,
                    { transform: [{ translateX: shakeAnimation }] },
                  ]}
                >
                  {otp.map((digit, index) => (
                    <View key={`otp-${index}`} style={styles.otpInputWrapper}>
                      <TextInput
                        ref={(ref) => (otpInputRefs.current[index] = ref)}
                        style={[
                          styles.otpInput,
                          digit && styles.otpInputFilled,
                          (waitingForOtp) && styles.otpInputDisabled,
                        ]}
                        keyboardType="number-pad"
                        maxLength={6}
                        value={digit}
                        onChangeText={(val) => handleOtpChange(val, index)}
                        onKeyPress={(e) => handleKeyPress(e, index, 'otp')}
                        textAlign="center"
                        selectionColor={COLORS.primary}
                        editable={!waitingForOtp}
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

                {/* Clear OTP */}
                {otp.some(d => d) && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearOtp}
                    disabled={waitingForOtp}
                  >
                    <Icon name="close-circle" size={18} color={COLORS.textTertiary} />
                    <Text style={styles.clearButtonText}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Timer & Resend */}
              <View style={styles.timerSection}>
                {timer > 0 ? (
                  <View style={styles.timerCard}>
                    <Icon name="timer-sand" size={20} color={COLORS.goldPrimary} />
                    <Text style={styles.timerText}>
                      Resend in <Text style={styles.timerValue}>{formatTime(timer)}</Text>
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    style={styles.resendButton}
                    disabled={waitingForOtp}
                  >
                    <Icon name="refresh" size={20} color={COLORS.goldPrimary} />
                    <Text style={styles.resendButtonText}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                onPress={() => handleVerifyOtp()}
                disabled={otp.join("").length !== 6 || waitingForOtp}
                style={[
                  styles.verifyButton,
                  (otp.join("").length !== 6 || waitingForOtp) && styles.verifyButtonDisabled,
                ]}
              >
                <Icon name="shield-check" size={22} color={COLORS.white} />
                <Text style={styles.verifyButtonText}>Verify & Continue</Text>
              </TouchableOpacity>
            </>
          )}

          {/* MPIN Step */}
          {step === 'mpin' && (
            <>
              {/* New MPIN Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>New MPIN (4 digits)</Text>
                
                <Animated.View
                  style={[
                    styles.mpinContainer,
                    { transform: [{ translateX: shakeAnimation }] },
                  ]}
                >
                  {newMpin.map((digit, index) => (
                    <View key={`new-${index}`} style={styles.mpinInputWrapper}>
                      <TextInput
                        ref={(ref) => (mpinInputRefs.current[index] = ref)}
                        style={[
                          styles.mpinInput,
                          digit && styles.mpinInputFilled,
                        ]}
                        keyboardType="number-pad"
                        maxLength={4}
                        value={digit}
                        onChangeText={(val) => handleMpinChange(val, index, 'new')}
                        onKeyPress={(e) => handleKeyPress(e, index, 'new')}
                        secureTextEntry
                        textAlign="center"
                        selectionColor={COLORS.primary}
                        autoFocus={index === 0}
                      />
                      <View
                        style={[
                          styles.mpinInputUnderline,
                          digit && styles.mpinInputUnderlineActive,
                        ]}
                      />
                    </View>
                  ))}
                </Animated.View>
              </View>

              {/* Confirm MPIN Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Confirm MPIN</Text>
                
                <Animated.View
                  style={[
                    styles.mpinContainer,
                    { transform: [{ translateX: shakeAnimation }] },
                  ]}
                >
                  {confirmMpin.map((digit, index) => (
                    <View key={`confirm-${index}`} style={styles.mpinInputWrapper}>
                      <TextInput
                        ref={(ref) => (confirmMpinRefs.current[index] = ref)}
                        style={[
                          styles.mpinInput,
                          digit && styles.mpinInputFilled,
                        ]}
                        keyboardType="number-pad"
                        maxLength={4}
                        value={digit}
                        onChangeText={(val) => handleMpinChange(val, index, 'confirm')}
                        onKeyPress={(e) => handleKeyPress(e, index, 'confirm')}
                        secureTextEntry
                        textAlign="center"
                        selectionColor={COLORS.primary}
                      />
                      <View
                        style={[
                          styles.mpinInputUnderline,
                          digit && styles.mpinInputUnderlineActive,
                        ]}
                      />
                    </View>
                  ))}
                </Animated.View>
              </View>

              {/* Reset Button */}
              <TouchableOpacity
                onPress={handleResetMpin}
                disabled={loading || newMpin.join("").length !== 4 || confirmMpin.join("").length !== 4}
                style={[
                  styles.verifyButton,
                  (newMpin.join("").length !== 4 || confirmMpin.join("").length !== 4) && styles.verifyButtonDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <>
                    <Icon name="lock-reset" size={22} color={COLORS.white} />
                    <Text style={styles.verifyButtonText}>Reset MPIN</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Back to OTP */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep('otp')}
              >
                <Icon name="arrow-left" size={18} color={COLORS.textSecondary} />
                <Text style={styles.backButtonText}>Back to OTP verification</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Security Note */}
          <View style={styles.securityNote}>
            <Icon name="shield-lock-outline" size={16} color={COLORS.textTertiary} />
            <Text style={styles.securityText}>
              Your data is secure and encrypted
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      <Toast />

      {/* Full Screen Loader */}
      {showFullScreenLoader && waitingForOtp && step === 'otp' && (
        <View style={styles.fullScreenLoader}>
          <View style={styles.loaderOverlay} />
          <View style={styles.loaderCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loaderTitle}>Waiting for OTP</Text>
            <Text style={styles.loaderSubtitle}>
              Auto-detecting from SMS...
            </Text>
            <View style={styles.loaderTimerContainer}>
              <Icon name="timer-outline" size={18} color={COLORS.goldPrimary} />
              <Text style={styles.loaderTimer}>{autoVerifyTimer}s</Text>
            </View>
            <TouchableOpacity
              style={styles.loaderSkipButton}
              onPress={skipAutoVerify}
            >
              <Text style={styles.loaderSkipText}>Enter Manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: SIZES.padding.container,
    paddingTop: SIZES.padding.xl,
    paddingBottom: SIZES.padding.xxl,
  },
  headerInfo: {
    alignItems: 'center',
    marginBottom: SIZES.margin.xl,
  },
  iconCircle: {
    width: SIZES.icon.xxxl,
    height: SIZES.icon.xxxl,
    borderRadius: SIZES.radius.xxxl,
    backgroundColor: COLORS.blueOpacity10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.margin.md,
    ...SHADOWS.sm,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SIZES.margin.xs,
  },
  headerSubtitle: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SIZES.padding.lg,
  },
  autoVerifyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryPale,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.md,
    marginBottom: SIZES.margin.xl,
    borderWidth: 1,
    borderColor: COLORS.primaryLighter,
    ...SHADOWS.xs,
  },
  autoVerifyIconContainer: {
    width: SIZES.icon.xl,
    height: SIZES.icon.xl,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.margin.md,
  },
  autoVerifyContent: {
    flex: 1,
  },
  autoVerifyTitle: {
    ...FONTS.label,
    color: COLORS.primary,
    marginBottom: 2,
  },
  autoVerifyTimer: {
    ...FONTS.bodyBold,
    color: COLORS.primary,
    fontSize: SIZES.font.lg,
  },
  skipButton: {
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.xs,
  },
  skipButtonText: {
    ...FONTS.bodySmall,
    color: COLORS.primary,
    fontWeight: '600',
  },
  inputSection: {
    marginBottom: SIZES.margin.xl,
  },
  inputLabel: {
    ...FONTS.label,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.sm,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.margin.xs,
  },
  otpInputWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  otpInput: {
    width: '100%',
    height: SIZES.input.height,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    fontSize: SIZES.font.xl,
    fontFamily: FONTS.family.bold,
    color: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingVertical: 0,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    ...SHADOWS.xs,
  },
  otpInputDisabled: {
    backgroundColor: COLORS.gray100,
    opacity: 0.5,
  },
  otpInputUnderline: {
    position: 'absolute',
    bottom: -4,
    width: '50%',
    height: 2,
    backgroundColor: COLORS.inputBorder,
    borderRadius: SIZES.radius.full,
  },
  otpInputUnderlineActive: {
    backgroundColor: COLORS.primary,
  },
  mpinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.margin.sm,
  },
  mpinInputWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  mpinInput: {
    width: '100%',
    height: SIZES.input.height,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius.md,
    fontSize: SIZES.font.xl,
    fontFamily: FONTS.family.bold,
    color: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingVertical: 0,
  },
  mpinInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    ...SHADOWS.xs,
  },
  mpinInputUnderline: {
    position: 'absolute',
    bottom: -4,
    width: '50%',
    height: 2,
    backgroundColor: COLORS.inputBorder,
    borderRadius: SIZES.radius.full,
  },
  mpinInputUnderlineActive: {
    backgroundColor: COLORS.primary,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: SIZES.margin.sm,
    padding: SIZES.padding.xs,
  },
  clearButtonText: {
    ...FONTS.caption,
    color: COLORS.textTertiary,
    marginLeft: 4,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: SIZES.margin.xl,
  },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.goldOpacity10,
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.radius.full,
  },
  timerText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: SIZES.margin.xs,
  },
  timerValue: {
    ...FONTS.bodyBold,
    color: COLORS.goldDark,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.goldOpacity10,
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.radius.full,
  },
  resendButtonText: {
    ...FONTS.bodySmall,
    color: COLORS.goldDark,
    fontWeight: '600',
    marginLeft: SIZES.margin.xs,
  },
  verifyButton: {
    ...COMMON_STYLES.button.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.margin.sm,
    marginBottom: SIZES.margin.lg,
    ...SHADOWS.blue,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.gray400,
  },
  verifyButtonText: {
    ...FONTS.buttonLarge,
    color: COLORS.white,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding.md,
  },
  backButtonText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: SIZES.margin.xs,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.margin.xl,
  },
  securityText: {
    ...FONTS.caption,
    color: COLORS.textTertiary,
    marginLeft: SIZES.margin.xs,
  },
  fullScreenLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlayDark,
  },
  loaderCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.xl,
    padding: SIZES.padding.xl,
    alignItems: 'center',
    width: width * 0.8,
    ...SHADOWS.xl,
  },
  loaderTitle: {
    ...FONTS.h4,
    color: COLORS.primary,
    marginTop: SIZES.margin.lg,
    marginBottom: SIZES.margin.xs,
  },
  loaderSubtitle: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.margin.md,
  },
  loaderTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.goldOpacity10,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.xs,
    borderRadius: SIZES.radius.full,
    marginBottom: SIZES.margin.lg,
  },
  loaderTimer: {
    ...FONTS.bodyBold,
    color: COLORS.goldDark,
    marginLeft: SIZES.margin.xs,
  },
  loaderSkipButton: {
    paddingVertical: SIZES.padding.sm,
  },
  loaderSkipText: {
    ...FONTS.bodySmall,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});

export default VerifyForgotMpinScreen;