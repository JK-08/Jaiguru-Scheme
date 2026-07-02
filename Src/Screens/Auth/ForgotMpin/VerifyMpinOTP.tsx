import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getHash, useOtpVerify, removeListener } from 'react-native-otp-verify';
import { useMpin } from '../../../api/hooks/Mpin/useMpin';
import CommonHeader from '../../../Components/CommonHeader/CommonHeader';
import theme from '../../../Utills/AppTheme';
import { ToastTypes, ToastPositions, ToastAnimationTypes, useToast } from '../../../Components/Toast/Toast';
import { getUserData } from '../../../Utills/AsynchStorageHelper';
import { AppOTPInput, AppOTPInputRef, AppPinInput, AppPinInputRef, AppButton } from '../../../Components/ui/appcomponents';

const { COLORS, SIZES, FONTS, SHADOWS } = theme;
const { width } = Dimensions.get('window');

type Step = 'otp' | 'mpin';

const VerifyForgotMpinScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { verifyForgotOtp, sendForgotOtp, loading } = useMpin();
  const { showToast, Toast } = useToast();

  const { mobileNumber: routeMobile } = route.params || {};

  const [otp, setOtp] = useState('');
  const [newMpin, setNewMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [timer, setTimer] = useState(60);
  const [userMobile, setUserMobile] = useState('');
  const [step, setStep] = useState<Step>('otp');

  const [waitingForOtp, setWaitingForOtp] = useState(Platform.OS === 'android');
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(Platform.OS === 'android');
  const [autoVerifyTimer, setAutoVerifyTimer] = useState(30);
  const [smsListenerReady, setSmsListenerReady] = useState(false);

  const toastShownRef = useRef<Record<string, number | boolean>>({ waiting: false, timeout: false, autoDetect: false, manual: false });

  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const otpRef = useRef<AppOTPInputRef>(null);
  const newMpinRef = useRef<AppPinInputRef>(null);
  const confirmMpinRef = useRef<AppPinInputRef>(null);

  const { message, timeoutError, startListener, stopListener } = useOtpVerify({ numberOfDigits: 6 });

  useEffect(() => {
    loadUserMobile();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const loadUserMobile = async () => {
    try {
      const userData: any = await getUserData();
      if (userData) {
        const mobile = userData.contactNumber || userData.mobileNumber || userData.phone || userData.mobile;
        setUserMobile(mobile || routeMobile || '');
      }
    } catch (error) {
      console.error('Error loading user mobile:', error);
    }
  };

  const formatMobileNumber = (number: string) => {
    if (!number) return 'your registered number';
    const strNumber = String(number);
    if (strNumber.length >= 10) return `•••• •••• ${strNumber.slice(-4)}`;
    if (strNumber.length >= 4) return `••••${strNumber.slice(-4)}`;
    return 'your registered number';
  };

  const safeShowToast = (params: any) => {
    const toastKey = params.message.substring(0, 20);
    const now = Date.now();

    if (toastShownRef.current[toastKey] && now - (toastShownRef.current[toastKey] as number) < 3000) {
      return;
    }

    toastShownRef.current[toastKey] = now;
    showToast(params);
  };

  const detectOtpFromMessage = (smsMessage: string | null) => {
    if (!smsMessage) return null;
    const patterns = [
      /your\s+otp\s+(?:for\s+\w+\s+)?is\s*[:\-]?\s*(\d{6})/i,
      /otp.*?is\s*[:\-]?\s*(\d{6})/i,
      /otp[:\s]+(\d{6})/i,
      /verification\s+code.*?(\d{6})/i,
      /\b(\d{6})\b/,
    ];
    for (const pattern of patterns) {
      const match = smsMessage.match(pattern);
      if (match) return match[1] || match[0];
    }
    return null;
  };

  useEffect(() => {
    if (message && smsListenerReady && step === 'otp') {
      const detectedOtp = detectOtpFromMessage(message);

      if (detectedOtp && detectedOtp.length === 6) {
        setOtp(detectedOtp);
        setWaitingForOtp(false);
        setShowFullScreenLoader(false);

        if (!toastShownRef.current.autoDetect) {
          toastShownRef.current.autoDetect = true;
          safeShowToast({ message: '✨ OTP detected automatically!', type: ToastTypes.SUCCESS, duration: 2000, position: ToastPositions.TOP });
          setTimeout(() => {
            toastShownRef.current.autoDetect = false;
          }, 3000);
        }

        setTimeout(() => {
          handleVerifyOtp(detectedOtp);
        }, 800);
      }
    }
  }, [message, smsListenerReady, step]);

  useEffect(() => {
    if (smsListenerReady && Platform.OS === 'android' && waitingForOtp && step === 'otp') {
      const t = setTimeout(() => {
        setWaitingForOtp(false);
        setShowFullScreenLoader(false);

        if (!toastShownRef.current.timeout) {
          toastShownRef.current.timeout = true;
          safeShowToast({ message: '⌨️ Please enter OTP manually', type: ToastTypes.INFO, duration: 3000, position: ToastPositions.TOP });
          setTimeout(() => {
            toastShownRef.current.timeout = false;
          }, 4000);
        }

        setTimeout(() => otpRef.current?.focus(), 300);
      }, 30000);

      return () => clearTimeout(t);
    }
  }, [smsListenerReady, waitingForOtp, step]);

  useEffect(() => {
    if (timeoutError) {
      if (!toastShownRef.current.timeout) {
        toastShownRef.current.timeout = true;
        safeShowToast({ message: '⏱️ Auto-detection timeout. Enter OTP manually.', type: ToastTypes.WARNING, duration: 3000, position: ToastPositions.TOP });
        setTimeout(() => {
          toastShownRef.current.timeout = false;
        }, 4000);
      }

      setWaitingForOtp(false);
      setShowFullScreenLoader(false);
      setTimeout(() => otpRef.current?.focus(), 300);
    }
  }, [timeoutError]);

  useEffect(() => {
    if (waitingForOtp && smsListenerReady && Platform.OS === 'android' && step === 'otp') {
      setAutoVerifyTimer(30);
      const interval = setInterval(() => {
        setAutoVerifyTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setWaitingForOtp(false);
            setShowFullScreenLoader(false);
            setTimeout(() => otpRef.current?.focus(), 300);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [waitingForOtp, smsListenerReady, step]);

  useEffect(() => {
    const initializeSMSListener = async () => {
      if (Platform.OS === 'android' && step === 'otp') {
        try {
          await getHash();

          if (startListener) {
            startListener();
            setSmsListenerReady(true);
            setWaitingForOtp(true);
            setShowFullScreenLoader(true);
          }
        } catch (error) {
          console.error('❌ Error initializing SMS listener:', error);

          if (!toastShownRef.current.error) {
            toastShownRef.current.error = true;
            safeShowToast({ message: '⚠️ Auto-detection unavailable. Enter OTP manually.', type: ToastTypes.WARNING, duration: 4000, position: ToastPositions.TOP });
            setTimeout(() => {
              toastShownRef.current.error = false;
            }, 5000);
          }

          setWaitingForOtp(false);
          setSmsListenerReady(false);
          setShowFullScreenLoader(false);
          setTimeout(() => otpRef.current?.focus(), 300);
        }
      } else {
        setWaitingForOtp(false);
        setSmsListenerReady(false);
        setShowFullScreenLoader(false);
        setTimeout(() => otpRef.current?.focus(), 300);
      }
    };

    initializeSMSListener();

    return () => {
      try {
        removeListener();
        stopListener && stopListener();
        toastShownRef.current = { waiting: false, timeout: false, autoDetect: false, manual: false };
      } catch (error) {
        console.error('Cleanup SMS listener error:', error);
      }
    };
  }, [step]);

  const shakeInputs = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleOtpChange = (value: string) => {
    if (value && waitingForOtp) {
      setWaitingForOtp(false);
      setShowFullScreenLoader(false);
    }
    setOtp(value);
  };

  const clearOtp = () => {
    setOtp('');
    otpRef.current?.clear();
    safeShowToast({ message: '🗑️ OTP cleared', type: ToastTypes.INFO, duration: 1500, position: ToastPositions.BOTTOM });
  };

  const handleVerifyOtp = async (customOtp: string | null = null) => {
    const otpValue = customOtp || otp;

    if (otpValue.length !== 6) {
      shakeInputs();
      safeShowToast({ message: '⚠️ Please enter 6-digit OTP', type: ToastTypes.WARNING, duration: 2000, position: ToastPositions.TOP });
      return;
    }

    // Note: the backend only exposes a combined "verify OTP + reset MPIN"
    // endpoint (verifyForgotOtp), so the OTP itself is actually checked
    // when the user submits their new MPIN in handleResetMpin below.
    safeShowToast({ message: 'Enter your new MPIN to continue', type: ToastTypes.INFO, duration: 1500, position: ToastPositions.TOP });

    setTimeout(() => {
      setStep('mpin');
      setTimeout(() => newMpinRef.current?.focus(), 300);
    }, 500);
  };

  const handleResetMpin = async () => {
    if (newMpin.length !== 4) {
      shakeInputs();
      safeShowToast({ message: '⚠️ Please enter 4-digit MPIN', type: ToastTypes.WARNING, duration: 2000, position: ToastPositions.TOP });
      return;
    }

    if (confirmMpin.length !== 4) {
      shakeInputs();
      safeShowToast({ message: '⚠️ Please confirm your MPIN', type: ToastTypes.WARNING, duration: 2000, position: ToastPositions.TOP });
      return;
    }

    if (newMpin !== confirmMpin) {
      shakeInputs();
      safeShowToast({ message: '❌ MPINs do not match', type: ToastTypes.ERROR, duration: 3000, position: ToastPositions.TOP });
      return;
    }

    try {
      await verifyForgotOtp(otp, newMpin);

      safeShowToast({
        message: '🎉 MPIN reset successfully!',
        type: ToastTypes.PREMIUM,
        duration: 2000,
        position: ToastPositions.TOP,
        animationType: ToastAnimationTypes.BOUNCE,
      });

      setTimeout(() => {
        navigation.replace('Login');
      }, 1500);
    } catch (err: any) {
      safeShowToast({ message: `❌ ${err.message}`, type: ToastTypes.ERROR, duration: 3000, position: ToastPositions.TOP });
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0 || loading) return;

    try {
      await sendForgotOtp();
      setTimer(60);

      safeShowToast({ message: '📨 OTP resent successfully!', type: ToastTypes.SUCCESS, duration: 2000, position: ToastPositions.TOP });

      setOtp('');
      otpRef.current?.clear();

      if (Platform.OS === 'android') {
        setWaitingForOtp(true);
        setShowFullScreenLoader(true);
        setAutoVerifyTimer(30);
        startListener && startListener();
      }
    } catch (err: any) {
      safeShowToast({ message: `❌ ${err.message}`, type: ToastTypes.ERROR, duration: 3000, position: ToastPositions.TOP });
    }
  };

  const skipAutoVerify = () => {
    setWaitingForOtp(false);
    setShowFullScreenLoader(false);
    stopListener && stopListener();
    setTimeout(() => otpRef.current?.focus(), 300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}>
      <CommonHeader title={step === 'otp' ? 'Verify OTP' : 'Reset MPIN'} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.headerInfo}>
            <View style={styles.iconCircle}>
              <Icon name={step === 'otp' ? 'message-lock' : 'lock-reset'} size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.headerTitle}>{step === 'otp' ? 'Enter Verification Code' : 'Create New MPIN'}</Text>
            <Text style={styles.headerSubtitle}>
              {step === 'otp' ? `We've sent a 6-digit code to ${formatMobileNumber(userMobile)}` : "Choose a 4-digit MPIN you'll remember"}
            </Text>
          </View>

          {step === 'otp' && (
            <>
              {Platform.OS === 'android' && smsListenerReady && waitingForOtp && (
                <View style={styles.autoVerifyCard}>
                  <View style={styles.autoVerifyIconContainer}>
                    <Icon name="email-fast-outline" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.autoVerifyContent}>
                    <Text style={styles.autoVerifyTitle}>Auto-detecting OTP</Text>
                    <Text style={styles.autoVerifyTimer}>{autoVerifyTimer}s remaining</Text>
                  </View>
                  <TouchableOpacity style={styles.skipButton} onPress={skipAutoVerify}>
                    <Text style={styles.skipButtonText}>Skip</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Verification Code</Text>

                <Animated.View style={{ transform: [{ translateX: shakeAnimation }], alignItems: 'center' }}>
                  <AppOTPInput ref={otpRef} length={6} value={otp} onChangeText={handleOtpChange} disabled={waitingForOtp} autoFocus={!waitingForOtp} />
                </Animated.View>

                {otp.length > 0 && (
                  <TouchableOpacity style={styles.clearButton} onPress={clearOtp} disabled={waitingForOtp}>
                    <Icon name="close-circle" size={18} color={COLORS.textTertiary} />
                    <Text style={styles.clearButtonText}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.timerSection}>
                {timer > 0 ? (
                  <View style={styles.timerCard}>
                    <Icon name="timer-sand" size={20} color={COLORS.goldPrimary} />
                    <Text style={styles.timerText}>
                      Resend in <Text style={styles.timerValue}>{formatTime(timer)}</Text>
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity onPress={handleResendOtp} style={styles.resendButton} disabled={waitingForOtp}>
                    <Icon name="refresh" size={20} color={COLORS.goldPrimary} />
                    <Text style={styles.resendButtonText}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>

              <AppButton
                label="Verify & Continue"
                onPress={() => handleVerifyOtp()}
                disabled={otp.length !== 6 || waitingForOtp}
                variant="primary"
                size="lg"
                leftIcon="shield-checkmark-outline"
                style={styles.verifyButton}
              />
            </>
          )}

          {step === 'mpin' && (
            <>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>New MPIN (4 digits)</Text>
                <Animated.View style={{ transform: [{ translateX: shakeAnimation }], alignItems: 'center' }}>
                  <AppPinInput ref={newMpinRef} variant="boxes" length={4} onChangeText={setNewMpin} autoFocus />
                </Animated.View>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Confirm MPIN</Text>
                <Animated.View style={{ transform: [{ translateX: shakeAnimation }], alignItems: 'center' }}>
                  <AppPinInput ref={confirmMpinRef} variant="boxes" length={4} onChangeText={setConfirmMpin} />
                </Animated.View>
              </View>

              <AppButton
                label="Reset MPIN"
                onPress={handleResetMpin}
                disabled={loading || newMpin.length !== 4 || confirmMpin.length !== 4}
                loading={loading}
                variant="primary"
                size="lg"
                leftIcon="lock-open-outline"
                style={styles.verifyButton}
              />

              <TouchableOpacity style={styles.backButton} onPress={() => setStep('otp')}>
                <Icon name="arrow-left" size={18} color={COLORS.textSecondary} />
                <Text style={styles.backButtonText}>Back to OTP verification</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.securityNote}>
            <Icon name="shield-lock-outline" size={16} color={COLORS.textTertiary} />
            <Text style={styles.securityText}>Your data is secure and encrypted</Text>
          </View>
        </Animated.View>
      </ScrollView>

      <Toast />

      {showFullScreenLoader && waitingForOtp && step === 'otp' && (
        <View style={styles.fullScreenLoader}>
          <View style={styles.loaderOverlay} />
          <View style={styles.loaderCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loaderTitle}>Waiting for OTP</Text>
            <Text style={styles.loaderSubtitle}>Auto-detecting from SMS...</Text>
            <View style={styles.loaderTimerContainer}>
              <Icon name="timer-outline" size={18} color={COLORS.goldPrimary} />
              <Text style={styles.loaderTimer}>{autoVerifyTimer}s</Text>
            </View>
            <TouchableOpacity style={styles.loaderSkipButton} onPress={skipAutoVerify}>
              <Text style={styles.loaderSkipText}>Enter Manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContainer: { flexGrow: 1 },
  contentContainer: { flex: 1, paddingHorizontal: SIZES.padding.container, paddingTop: SIZES.padding.xl, paddingBottom: SIZES.padding.xxl },
  headerInfo: { alignItems: 'center', marginBottom: SIZES.margin.xl },
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
  headerTitle: { ...FONTS.h3, color: COLORS.primary, textAlign: 'center', marginBottom: SIZES.margin.xs },
  headerSubtitle: { ...FONTS.bodySmall, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: SIZES.padding.lg },
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
  autoVerifyContent: { flex: 1 },
  autoVerifyTitle: { ...FONTS.label, color: COLORS.primary, marginBottom: 2 },
  autoVerifyTimer: { ...FONTS.bodyBold, color: COLORS.primary, fontSize: SIZES.font.lg },
  skipButton: { paddingHorizontal: SIZES.padding.md, paddingVertical: SIZES.padding.xs },
  skipButtonText: { ...FONTS.bodySmall, color: COLORS.primary, fontWeight: '600' },
  inputSection: { marginBottom: SIZES.margin.xl, alignItems: 'center' },
  inputLabel: { ...FONTS.label, color: COLORS.textSecondary, marginBottom: SIZES.margin.sm, alignSelf: 'flex-start' },
  clearButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: SIZES.margin.sm, padding: SIZES.padding.xs },
  clearButtonText: { ...FONTS.caption, color: COLORS.textTertiary, marginLeft: 4 },
  timerSection: { alignItems: 'center', marginBottom: SIZES.margin.xl },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.goldOpacity10,
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.radius.full,
  },
  timerText: { ...FONTS.bodySmall, color: COLORS.textSecondary, marginLeft: SIZES.margin.xs },
  timerValue: { ...FONTS.bodyBold, color: COLORS.goldDark },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.goldOpacity10,
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.radius.full,
  },
  resendButtonText: { ...FONTS.bodySmall, color: COLORS.goldDark, fontWeight: '600', marginLeft: SIZES.margin.xs },
  verifyButton: { marginBottom: SIZES.margin.lg },
  backButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: SIZES.padding.md },
  backButtonText: { ...FONTS.bodySmall, color: COLORS.textSecondary, marginLeft: SIZES.margin.xs },
  securityNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: SIZES.margin.xl },
  securityText: { ...FONTS.caption, color: COLORS.textTertiary, marginLeft: SIZES.margin.xs },
  fullScreenLoader: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  loaderOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.overlayDark },
  loaderCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radius.xl, padding: SIZES.padding.xl, alignItems: 'center', width: width * 0.8, ...SHADOWS.xl },
  loaderTitle: { ...FONTS.h4, color: COLORS.primary, marginTop: SIZES.margin.lg, marginBottom: SIZES.margin.xs },
  loaderSubtitle: { ...FONTS.bodySmall, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SIZES.margin.md },
  loaderTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.goldOpacity10,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.xs,
    borderRadius: SIZES.radius.full,
    marginBottom: SIZES.margin.lg,
  },
  loaderTimer: { ...FONTS.bodyBold, color: COLORS.goldDark, marginLeft: SIZES.margin.xs },
  loaderSkipButton: { paddingVertical: SIZES.padding.sm },
  loaderSkipText: { ...FONTS.bodySmall, color: COLORS.primary, textDecorationLine: 'underline' },
});

export default VerifyForgotMpinScreen;
