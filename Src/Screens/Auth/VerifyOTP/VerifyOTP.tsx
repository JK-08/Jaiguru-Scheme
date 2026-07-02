import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
  Keyboard,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getHash, useOtpVerify, removeListener } from 'react-native-otp-verify';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '../../../Components/CommonHeader/CommonHeader';
import useAuth from '../../../api/hooks/Auth/useAuth';
import theme from '../../../Utills/AppTheme';
import { saveAuthData } from '../../../Utills/AsynchStorageHelper';
import { ToastTypes, ToastPositions, ToastAnimationTypes, useToast } from '../../../Components/Toast/Toast';
import { AppOTPInput, AppOTPInputRef } from '../../../Components/ui/appcomponents';

const { width } = Dimensions.get('window');

const VerifyOTPScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { verifyNormalOtp, verifyGoogleOtp, loading, error, clearError } = useAuth();

  const { mobileNumber, email, username, otpType = 'normal', googleData, registrationData } = route.params || {};

  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [otpLoading, setOtpLoading] = useState(false);

  const [waitingForOtp, setWaitingForOtp] = useState(true);
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false);
  const [autoVerifyTimer, setAutoVerifyTimer] = useState(30);
  const [smsListenerReady, setSmsListenerReady] = useState(false);

  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const otpRef = useRef<AppOTPInputRef>(null);
  const { message, timeoutError, startListener, stopListener } = useOtpVerify({ numberOfDigits: 6 });

  const { showToast, Toast } = useToast();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const detectOtpFromMessage = (smsMessage: string | null) => {
    if (!smsMessage) return null;
    console.log('📩 Analyzing SMS for OTP:', smsMessage);

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
        console.log('✅ OTP Detected:', detected);
        return detected;
      }
    }

    console.log('❌ No OTP detected in message');
    return null;
  };

  useEffect(() => {
    if (message && smsListenerReady) {
      console.log('📨 SMS message received:', message);
      const detectedOtp = detectOtpFromMessage(message);

      if (detectedOtp && detectedOtp.length === 6) {
        setOtp(detectedOtp);
        setWaitingForOtp(false);
        setShowFullScreenLoader(false);

        showToast({
          message: '✨ OTP detected automatically!',
          type: ToastTypes.SUCCESS,
          duration: 2000,
          position: ToastPositions.TOP,
          animationType: ToastAnimationTypes.SCALE,
        });

        setTimeout(() => {
          handleOTPVerification(detectedOtp);
        }, 800);
      }
    }
  }, [message, smsListenerReady]);

  useEffect(() => {
    if (smsListenerReady && Platform.OS === 'android' && waitingForOtp) {
      setShowFullScreenLoader(true);

      const timer = setTimeout(() => {
        setWaitingForOtp(false);
        setShowFullScreenLoader(false);

        showToast({
          message: '⌨️ Please enter OTP manually',
          type: ToastTypes.INFO,
          duration: 3000,
          position: ToastPositions.TOP,
        });

        setTimeout(() => otpRef.current?.focus(), 300);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [smsListenerReady, waitingForOtp]);

  useEffect(() => {
    if (timeoutError) {
      showToast({
        message: '⏱️ Auto-detection timeout. Enter OTP manually.',
        type: ToastTypes.WARNING,
        duration: 3000,
        position: ToastPositions.TOP,
      });
      setWaitingForOtp(false);
      setShowFullScreenLoader(false);

      setTimeout(() => otpRef.current?.focus(), 300);
    }
  }, [timeoutError]);

  useEffect(() => {
    if (waitingForOtp && smsListenerReady && Platform.OS === 'android') {
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
  }, [waitingForOtp, smsListenerReady]);

  useEffect(() => {
    const initializeSMSListener = async () => {
      if (Platform.OS === 'android') {
        try {
          console.log('🔄 Initializing SMS listener...');
          await getHash();

          if (startListener) {
            startListener();
            setSmsListenerReady(true);
            setWaitingForOtp(true);
            setShowFullScreenLoader(true);
            console.log('✅ SMS listener started successfully');

            showToast({
              message: '📱 Waiting for OTP SMS...',
              type: ToastTypes.INFO,
              duration: 3000,
              position: ToastPositions.TOP,
            });
          }
        } catch (err) {
          console.error('❌ Error initializing SMS listener:', err);

          showToast({
            message: '⚠️ Auto-detection unavailable. Enter OTP manually.',
            type: ToastTypes.WARNING,
            duration: 4000,
            position: ToastPositions.TOP,
          });

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
        setSmsListenerReady(false);
        setShowFullScreenLoader(false);
      } catch (err) {
        console.error('Cleanup SMS listener error:', err);
      }
    };
  }, []);

  const shakeInputs = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // AppOTPInput owns the box-level backspace/paste handling internally
  // (see its own header comment) — this screen just tracks the resulting
  // string value.
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

    showToast({
      message: '🗑️ OTP cleared',
      type: ToastTypes.INFO,
      duration: 1500,
      position: ToastPositions.BOTTOM,
    });
  };

  const navigateAfterOtp = async () => {
    try {
      const hasMpin = await AsyncStorage.getItem('hasMpin');

      if (hasMpin === 'true') navigation.replace('MpinVerify');
      else navigation.replace('MpinCreate');
    } catch (err) {
      console.log('MPIN check error:', err);
      navigation.replace('MpinCreate');
    }
  };

  const handleOTPVerification = async (customOtp: string | null = null) => {
    const otpValue = customOtp || otp;

    if (otpValue.length !== 6) {
      shakeInputs();
      showToast({
        message: '⚠️ Please enter 6-digit OTP',
        type: ToastTypes.WARNING,
        duration: 2000,
        position: ToastPositions.TOP,
      });
      return;
    }

    console.log('✅ Verifying OTP:', otpValue);
    setOtpLoading(true);
    setShowFullScreenLoader(true);
    clearError();
    Keyboard.dismiss();

    try {
      let result: any;

      if (otpType === 'normal') {
        const verificationData = {
          username: username || registrationData?.username,
          email: email || registrationData?.email,
          contactNumber: mobileNumber || registrationData?.contactNumber,
          otp: otpValue.trim(),
        };

        console.log('📱 Normal OTP verification data:', verificationData);
        result = await verifyNormalOtp(verificationData);
        console.log('✅ Normal OTP verification result:', result);
      } else if (otpType === 'google') {
        const verificationData = {
          newContactNumber: mobileNumber || googleData?.contactNumber,
          otp: otpValue.trim(),
        };

        console.log('📱 Google OTP verification data:', verificationData);
        result = await verifyGoogleOtp(verificationData);
        console.log('✅ Google OTP verification result:', result);

        if (googleData && result) {
          result = { ...googleData, ...result, contactNumber: mobileNumber || googleData?.contactNumber };
        }
      }

      if (!result || (!result.token && !result.id)) {
        const errorMsg = result?.errorMessage || 'Verification failed. Please try again.';
        throw new Error(errorMsg);
      }

      if (result.used_referral_code) {
        console.log('🎯 Found referral code:', { userId: result.id, referralCode: result.used_referral_code });
      }

      const saveResult = await saveAuthData(result);
      console.log('💾 Save auth data result:', saveResult);

      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save authentication data');
      }

      showToast({
        message: '🎉 OTP verified successfully!',
        type: ToastTypes.PREMIUM,
        duration: 2000,
        position: ToastPositions.TOP,
        animationType: ToastAnimationTypes.BOUNCE,
      });

      stopListener && stopListener();
      setShowFullScreenLoader(false);

      setTimeout(() => {
        navigateAfterOtp();
      }, 600);
    } catch (err: any) {
      console.log('❌ Verification error:', err);

      shakeInputs();

      showToast({
        message: `❌ ${err.message || 'Invalid OTP. Please check and try again.'}`,
        type: ToastTypes.ERROR,
        duration: 3000,
        position: ToastPositions.TOP,
      });

      clearOtp();
      setShowFullScreenLoader(false);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || showFullScreenLoader) return;

    try {
      showToast({
        message: '📨 OTP resent successfully!',
        type: ToastTypes.SUCCESS,
        duration: 2000,
        position: ToastPositions.TOP,
      });

      setResendTimer(30);
      clearOtp();

      if (Platform.OS === 'android') {
        setWaitingForOtp(true);
        setShowFullScreenLoader(true);
        setAutoVerifyTimer(30);
        startListener && startListener();
      }
    } catch (err) {
      console.error('Resend OTP error:', err);

      showToast({
        message: '❌ Failed to resend OTP. Try again.',
        type: ToastTypes.ERROR,
        duration: 3000,
        position: ToastPositions.TOP,
      });
    }
  };

  const skipAutoVerify = () => {
    setWaitingForOtp(false);
    setShowFullScreenLoader(false);
    stopListener && stopListener();

    setTimeout(() => otpRef.current?.focus(), 300);

    showToast({
      message: '⌨️ Enter OTP manually',
      type: ToastTypes.INFO,
      duration: 2000,
      position: ToastPositions.BOTTOM,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
    >
      <Header title="Verify OTP" subtitle={`Enter the 6-digit code sent to ${mobileNumber ? `+91 ${mobileNumber}` : email}`} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          {error && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color={theme.COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError} style={styles.closeButton}>
                <Icon name="close" size={20} color={theme.COLORS.gray500} />
              </TouchableOpacity>
            </View>
          )}

          {Platform.OS === 'android' && smsListenerReady && waitingForOtp && (
            <View style={styles.autoVerifyCard}>
              <View style={styles.autoVerifyIconContainer}>
                <Icon name="email-fast-outline" size={28} color={theme.COLORS.primary} />
              </View>
              <View style={styles.autoVerifyContent}>
                <Text style={styles.autoVerifyTitle}>Auto-detecting OTP</Text>
                <Text style={styles.autoVerifySubtitle}>We'll fill it automatically when SMS arrives</Text>
                <Text style={styles.autoVerifyTimer}>{autoVerifyTimer}s remaining</Text>
              </View>
              <TouchableOpacity style={styles.skipButton} onPress={skipAutoVerify} activeOpacity={0.7}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.otpSection}>
            <Text style={styles.otpLabel}>Enter OTP Code</Text>

            <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
              <AppOTPInput
                ref={otpRef}
                length={6}
                value={otp}
                onChangeText={handleOtpChange}
                disabled={showFullScreenLoader && waitingForOtp}
                autoFocus={!waitingForOtp}
                boxSize={(width - 80) / 6 - 8}
              />
            </Animated.View>

            {otp.length > 0 && (
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

          <View style={styles.timerSection}>
            {resendTimer > 0 ? (
              <View style={styles.timerCard}>
                <Icon name="timer-sand" size={20} color={theme.COLORS.goldPrimary} />
                <Text style={styles.timerText}>
                  Resend OTP in <Text style={styles.timerValue}>{formatTime(resendTimer)}</Text>
                </Text>
              </View>
            ) : (
              <TouchableOpacity onPress={handleResendOtp} style={styles.resendButton} activeOpacity={0.7} disabled={showFullScreenLoader}>
                <Icon name="refresh" size={20} color={theme.COLORS.goldPrimary} />
                <Text style={styles.resendButtonText}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => handleOTPVerification()}
            disabled={otp.length !== 6 || (showFullScreenLoader && waitingForOtp)}
            style={[styles.verifyButton, (otp.length !== 6 || (showFullScreenLoader && waitingForOtp)) && styles.verifyButtonDisabled]}
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

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} disabled={showFullScreenLoader}>
              <Text style={styles.editNumberText}>
                <Icon name="pencil" size={14} color={theme.COLORS.textTertiary} /> Wrong number? Change it
              </Text>
            </TouchableOpacity>

            <View style={styles.securityNote}>
              <Icon name="shield-lock-outline" size={16} color={theme.COLORS.textTertiary} />
              <Text style={styles.securityText}>Your data is secure and encrypted</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <Toast />

      {showFullScreenLoader && waitingForOtp && (
        <View style={styles.fullScreenLoader}>
          <View style={styles.loaderOverlay} />
          <View style={styles.loaderCard}>
            <View style={styles.loaderIconContainer}>
              <ActivityIndicator size="large" color={theme.COLORS.primary} />
            </View>

            <Text style={styles.loaderTitle}>Waiting for OTP</Text>
            <Text style={styles.loaderSubtitle}>We're automatically detecting the OTP from your SMS</Text>

            <View style={styles.loaderTimerContainer}>
              <Icon name="timer-outline" size={18} color={theme.COLORS.goldPrimary} />
              <Text style={styles.loaderTimer}>{autoVerifyTimer}s remaining</Text>
            </View>

            <TouchableOpacity style={styles.loaderSkipButton} onPress={skipAutoVerify} activeOpacity={0.7}>
              <Text style={styles.loaderSkipText}>Enter Manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showFullScreenLoader && !waitingForOtp && otpLoading && (
        <View style={styles.fullScreenLoader}>
          <View style={styles.loaderOverlay} />
          <View style={styles.loaderCard}>
            <View style={styles.loaderIconContainer}>
              <ActivityIndicator size="large" color={theme.COLORS.primary} />
            </View>

            <Text style={styles.loaderTitle}>Verifying OTP</Text>
            <Text style={styles.loaderSubtitle}>Please wait while we verify your code</Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.COLORS.backgroundGold },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.SIZES.padding.container,
    paddingTop: Platform.OS === 'ios' ? theme.SIZES.md : theme.SIZES.sm,
    paddingBottom: theme.SIZES.xl,
  },
  contentContainer: { marginTop: theme.SIZES.md },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.COLORS.error}15`,
    padding: theme.SIZES.padding.md,
    borderRadius: theme.SIZES.radius.md,
    marginBottom: theme.SIZES.xl,
    borderLeftWidth: 4,
    borderLeftColor: theme.COLORS.error,
  },
  errorText: { ...theme.FONTS.bodySmall, color: theme.COLORS.error, flex: 1, marginHorizontal: theme.SIZES.sm },
  closeButton: { padding: theme.SIZES.xs },
  autoVerifyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.white,
    padding: theme.SIZES.padding.lg,
    borderRadius: theme.SIZES.radius.lg,
    marginBottom: theme.SIZES.xl,
    ...theme.SHADOWS.md,
    borderWidth: 2,
    borderColor: `${theme.COLORS.primary}20`,
  },
  autoVerifyIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${theme.COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.SIZES.md,
  },
  autoVerifyContent: { flex: 1 },
  autoVerifyTitle: { ...theme.FONTS.h4, color: theme.COLORS.primary, marginBottom: 4 },
  autoVerifySubtitle: { ...theme.FONTS.caption, color: theme.COLORS.textSecondary, marginBottom: 6 },
  autoVerifyTimer: { ...theme.FONTS.captionBold, color: theme.COLORS.goldPrimary },
  skipButton: {
    paddingHorizontal: theme.SIZES.md,
    paddingVertical: theme.SIZES.sm,
    borderRadius: theme.SIZES.radius.sm,
    backgroundColor: `${theme.COLORS.textTertiary}10`,
  },
  skipButtonText: { ...theme.FONTS.captionBold, color: theme.COLORS.textTertiary },
  otpSection: { marginBottom: theme.SIZES.xxl, alignItems: 'center' },
  otpLabel: { ...theme.FONTS.h4, color: theme.COLORS.textPrimary, marginBottom: theme.SIZES.lg, textAlign: 'center' },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingVertical: theme.SIZES.sm,
    paddingHorizontal: theme.SIZES.md,
    marginTop: theme.SIZES.sm,
  },
  clearButtonText: { ...theme.FONTS.bodySmall, color: theme.COLORS.textTertiary, marginLeft: 6 },
  timerSection: { alignItems: 'center', marginBottom: theme.SIZES.xxl },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.white,
    paddingHorizontal: theme.SIZES.padding.lg,
    paddingVertical: theme.SIZES.padding.md,
    borderRadius: theme.SIZES.radius.xl,
    ...theme.SHADOWS.sm,
  },
  timerText: { ...theme.FONTS.body, color: theme.COLORS.textSecondary, marginLeft: theme.SIZES.sm },
  timerValue: { ...theme.FONTS.bodyBold, color: theme.COLORS.goldPrimary },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.COLORS.white,
    paddingVertical: theme.SIZES.padding.md,
    paddingHorizontal: theme.SIZES.padding.lg,
    borderRadius: theme.SIZES.radius.lg,
    borderWidth: 2,
    borderColor: theme.COLORS.goldPrimary,
    ...theme.SHADOWS.gold,
  },
  resendButtonText: { ...theme.FONTS.buttonSmall, color: theme.COLORS.goldPrimary, marginLeft: theme.SIZES.sm },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.COLORS.goldPrimary,
    borderRadius: theme.SIZES.radius.md,
    paddingVertical: theme.SIZES.padding.md,
    height: theme.SIZES.button.height.lg,
    marginBottom: theme.SIZES.xl,
    ...theme.SHADOWS.gold,
  },
  verifyButtonDisabled: { opacity: 0.5, shadowOpacity: 0.1, elevation: 2 },
  verifyButtonText: { ...theme.FONTS.buttonLarge, color: theme.COLORS.white, marginLeft: theme.SIZES.sm },
  footer: {
    alignItems: 'center',
    paddingTop: theme.SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: `${theme.COLORS.gray300}30`,
  },
  editNumberText: { ...theme.FONTS.bodySmall, color: theme.COLORS.textTertiary, marginBottom: theme.SIZES.md },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.COLORS.primary}08`,
    paddingVertical: theme.SIZES.sm,
    paddingHorizontal: theme.SIZES.md,
    borderRadius: theme.SIZES.radius.md,
    marginTop: theme.SIZES.sm,
  },
  securityText: { ...theme.FONTS.caption, color: theme.COLORS.textTertiary, marginLeft: 6 },
  fullScreenLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loaderCard: {
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.SIZES.radius.xl,
    padding: theme.SIZES.padding.xl,
    alignItems: 'center',
    maxWidth: width * 0.85,
    minWidth: width * 0.75,
    ...theme.SHADOWS.xl,
  },
  loaderIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: `${theme.COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.SIZES.lg,
  },
  loaderTitle: { ...theme.FONTS.h3, color: theme.COLORS.primary, marginBottom: theme.SIZES.sm, textAlign: 'center' },
  loaderSubtitle: { ...theme.FONTS.body, color: theme.COLORS.textSecondary, textAlign: 'center', marginBottom: theme.SIZES.lg, lineHeight: 22 },
  loaderTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.COLORS.goldPrimary}15`,
    paddingVertical: theme.SIZES.sm,
    paddingHorizontal: theme.SIZES.md,
    borderRadius: theme.SIZES.radius.md,
    marginBottom: theme.SIZES.lg,
  },
  loaderTimer: { ...theme.FONTS.bodyBold, color: theme.COLORS.goldPrimary, marginLeft: 6 },
  loaderSkipButton: {
    paddingVertical: theme.SIZES.sm,
    paddingHorizontal: theme.SIZES.lg,
    borderRadius: theme.SIZES.radius.md,
    borderWidth: 1,
    borderColor: theme.COLORS.gray300,
    marginTop: theme.SIZES.sm,
  },
  loaderSkipText: { ...theme.FONTS.captionBold, color: theme.COLORS.textSecondary },
});

export default VerifyOTPScreen;
