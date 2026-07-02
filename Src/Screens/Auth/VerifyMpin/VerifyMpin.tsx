import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useMpin } from '../../../api/hooks/Mpin/useMpin';
import { useRegisterLoginCheckUser } from '../../../api/hooks/LoginCheck/useLoginCheck';
import { useToast, ToastTypes, ToastPositions } from '../../../Components/Toast/Toast';
import theme from '../../../Utills/AppTheme';
import { AppPinInput, AppPinInputRef, AppButton } from '../../../Components/ui/appcomponents';

const { COLORS, SIZES, FONTS, SHADOWS, COMMON_STYLES } = theme;

const MpinVerifyScreen = () => {
  const navigation = useNavigation<any>();
  const { verifyMpin, loading } = useMpin();
  const { register } = useRegisterLoginCheckUser();
  const { showToast, Toast } = useToast();

  const [mpinValue, setMpinValue] = useState('');
  const [showMpin, setShowMpin] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  const [blockAutoSubmit, setBlockAutoSubmit] = useState(false);

  const pinRef = useRef<AppPinInputRef>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION = 60;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const resetMpin = useCallback(() => {
    setMpinValue('');
    pinRef.current?.clear();
  }, []);

  useEffect(() => {
    if (locked && lockTime > 0) {
      timerRef.current = setInterval(() => {
        setLockTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setLocked(false);
            setAttempts(0);
            resetMpin();
            pinRef.current?.focus();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [locked, lockTime, resetMpin]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, []);

  const handleSubmit = useCallback(
    async (mpinArg: string | null = null) => {
      if (locked || loading) return;

      const mpinString = mpinArg || mpinValue;
      if (mpinString.length !== 4) return;

      try {
        await verifyMpin(mpinString);

        resetMpin();
        setAttempts(0);
        setBlockAutoSubmit(false);

        showToast({
          message: 'MPIN verified successfully!',
          type: ToastTypes.SUCCESS,
          duration: 2000,
          position: ToastPositions.TOP,
        });

        setTimeout(async () => {
          try {
            const today = new Date().toISOString().split('T')[0];
            const lastDate = await AsyncStorage.getItem('dailyRegisterDate');
            if (lastDate !== today) {
              const userData = await AsyncStorage.getItem('userData');
              if (userData) {
                const user = JSON.parse(userData);
                const mobileNumber = user.contactNumber || user.mobileNumber || user.phone;
                const username = user.username || user.name;
                if (mobileNumber && username) {
                  await register(username, mobileNumber);
                  await AsyncStorage.setItem('dailyRegisterDate', today);
                }
              }
            }
          } catch (e) {
            console.log('Daily register error:', e);
          }
          navigation.reset({ index: 0, routes: [{ name: 'MainDrawer' }] });
        }, 300);
      } catch (err: any) {
        if (err?.code === 'MPIN_NOT_FOUND' || err?.status === 404) {
          resetMpin();
          setAttempts(0);
          setBlockAutoSubmit(false);

          Alert.alert(
            'MPIN Not Created',
            "You don't have an MPIN for this account. Please create one to continue.",
            [{ text: 'Create MPIN', onPress: () => navigation.navigate('MpinCreate') }],
            { cancelable: false }
          );

          return;
        }

        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          setLocked(true);
          setLockTime(LOCK_DURATION);
          showToast({
            message: `Too many attempts! Account locked for ${LOCK_DURATION} seconds`,
            type: ToastTypes.ERROR,
            duration: 3000,
            position: ToastPositions.TOP,
          });
        } else {
          showToast({
            message: `Invalid MPIN! ${MAX_ATTEMPTS - newAttempts} attempts remaining`,
            type: ToastTypes.ERROR,
            duration: 2000,
            position: ToastPositions.TOP,
          });
        }

        resetMpin();
        pinRef.current?.focus();
      }
    },
    [locked, loading, mpinValue, attempts, verifyMpin, navigation, showToast, register, resetMpin]
  );

  const handleMpinChange = useCallback(
    (value: string) => {
      if (locked || blockAutoSubmit) return;
      setMpinValue(value);
    },
    [locked, blockAutoSubmit]
  );

  const handleMpinComplete = useCallback(
    (value: string) => {
      if (locked || blockAutoSubmit) return;
      setTimeout(() => handleSubmit(value), 150);
    },
    [locked, blockAutoSubmit, handleSubmit]
  );

  const handleForgotMpin = useCallback(() => {
    if (locked) return;

    Alert.alert('Forgot MPIN?', 'Do you want to reset your MPIN?', [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => {
          resetMpin();
          pinRef.current?.focus();
        },
      },
      {
        text: 'Reset MPIN',
        style: 'destructive',
        onPress: () => {
          showToast({
            message: 'Redirecting to MPIN reset...',
            type: ToastTypes.INFO,
            duration: 2000,
            position: ToastPositions.TOP,
          });

          resetMpin();
          setAttempts(0);

          setTimeout(() => {
            navigation.navigate('ForgotMpin');
          }, 500);
        },
      },
    ]);
  }, [navigation, showToast, locked, resetMpin]);

  const isSubmitDisabled = loading || locked || blockAutoSubmit || mpinValue.length !== 4;

  return (
    <SafeAreaView style={COMMON_STYLES.containerBlue}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <Toast />

        <View style={styles.contentContainer}>
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Icon name="shield-check-outline" size={SIZES.icon.xxxl} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Verify MPIN</Text>
            <Text style={styles.subtitle}>Enter your 4-digit security PIN to access your account</Text>
          </View>

          {locked && (
            <View style={styles.lockContainer}>
              <Icon name="lock-alert-outline" size={SIZES.icon.xl} color={COLORS.error} />
              <Text style={styles.lockTitle}>Account Temporarily Locked</Text>
              <Text style={styles.lockText}>Please wait {formatTime(lockTime)} before trying again</Text>
              <View style={styles.timerContainer}>
                <View
                  style={[
                    styles.timerProgress,
                    { width: `${(1 - lockTime / LOCK_DURATION) * 100}%` as any, backgroundColor: COLORS.error },
                  ]}
                />
              </View>
            </View>
          )}

          <View style={styles.securityStatus}>
            <View style={styles.statusItem}>
              <Icon name="shield-check" size={SIZES.icon.sm} color={COLORS.success} />
              <Text style={styles.statusText}>Secure Connection</Text>
            </View>
            <View style={styles.statusItem}>
              <Icon name="lock-outline" size={SIZES.icon.sm} color={COLORS.info} />
              <Text style={styles.statusText}>End-to-End Encrypted</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Enter 4-digit MPIN</Text>
            <Text style={styles.sectionSubtitle}>
              {locked ? 'Please wait for the timer to complete' : blockAutoSubmit ? 'Please select an option from the alert' : 'Enter the MPIN you created earlier'}
            </Text>

            <View style={styles.pinRow}>
              <AppPinInput
                ref={pinRef}
                variant="boxes"
                length={4}
                secureTextEntry={!showMpin}
                onChangeText={handleMpinChange}
                onComplete={handleMpinComplete}
                disabled={locked || blockAutoSubmit}
                autoFocus
              />
              <TouchableOpacity
                style={styles.visibilityButton}
                onPress={() => setShowMpin(!showMpin)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name={showMpin ? 'eye-off' : 'eye'} size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {attempts > 0 && !locked && (
            <View style={styles.attemptsContainer}>
              <Icon name="alert-circle-outline" size={SIZES.icon.md} color={COLORS.warning} />
              <Text style={styles.attemptsText}>
                {attempts} failed attempt{attempts !== 1 ? 's' : ''}
              </Text>
              <View style={styles.attemptsDots}>
                {[1, 2, 3, 4, 5].map((dot) => (
                  <View key={dot} style={[styles.attemptDot, dot <= attempts && styles.attemptDotFilled]} />
                ))}
              </View>
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.forgotButton, (locked || blockAutoSubmit) && styles.buttonDisabled]}
              onPress={handleForgotMpin}
              disabled={locked || blockAutoSubmit}
              activeOpacity={0.7}
            >
              <Icon name="key-outline" size={SIZES.icon.sm} color={COLORS.primary} />
              <Text style={styles.forgotButtonText}>Forgot MPIN?</Text>
            </TouchableOpacity>
          </View>

          <AppButton
            label={locked ? 'Account Locked' : blockAutoSubmit ? 'Please Wait...' : 'Verify & Continue'}
            onPress={() => handleSubmit()}
            disabled={isSubmitDisabled}
            loading={loading}
            variant="primary"
            size="lg"
            rightIcon={!locked && !loading && !blockAutoSubmit ? 'arrow-forward' : undefined}
            style={styles.submitButton}
          />

          <View style={styles.securityContainer}>
            <Icon name="shield-check" size={SIZES.icon.sm} color={COLORS.success} />
            <Text style={styles.securityText}>Your MPIN is stored securely on your device</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: COLORS.backgroundBlue },
  contentContainer: { flex: 1, paddingHorizontal: SIZES.padding.container, paddingTop: 20, backgroundColor: COLORS.backgroundBlue },
  headerSection: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.lg,
    borderWidth: 3,
    borderColor: COLORS.blueOpacity20,
  },
  title: { ...FONTS.h4, fontSize: 24, color: COLORS.textBlueDark, textAlign: 'center', marginBottom: 4 },
  subtitle: { ...FONTS.bodySmall, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 18, maxWidth: '90%' },
  lockContainer: {
    ...COMMON_STYLES.card.blueBorder,
    alignItems: 'center',
    marginBottom: 20,
    borderColor: COLORS.error,
    backgroundColor: `${COLORS.errorLight}10`,
    paddingVertical: 16,
  },
  lockTitle: { ...FONTS.h6, fontSize: 16, color: COLORS.error, marginTop: 8, marginBottom: 2, textAlign: 'center' },
  lockText: { ...FONTS.caption, color: COLORS.errorDark, textAlign: 'center', marginBottom: 12 },
  timerContainer: { ...COMMON_STYLES.progressBar.container, width: '70%', height: 6 },
  timerProgress: { ...COMMON_STYLES.progressBar.fill, backgroundColor: COLORS.error },
  securityStatus: { ...COMMON_STYLES.rowCenter, gap: 12, marginBottom: 20 },
  statusItem: { ...COMMON_STYLES.chip.blue, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { ...FONTS.caption, color: COLORS.infoDark, marginLeft: 4 },
  section: { alignItems: 'center', marginBottom: 20 },
  sectionTitle: { ...FONTS.h6, color: COLORS.textBlueDark, marginBottom: 4 },
  sectionSubtitle: { ...FONTS.caption, color: COLORS.textTertiary, marginBottom: 16, textAlign: 'center' },
  pinRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  visibilityButton: {
    marginLeft: 16,
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.sm,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  attemptsContainer: { alignItems: 'center', marginBottom: 16 },
  attemptsText: { ...FONTS.captionBold, color: COLORS.warning, marginTop: 6, marginBottom: 8 },
  attemptsDots: { ...COMMON_STYLES.rowCenter, gap: 6 },
  attemptDot: { width: 6, height: 6, borderRadius: SIZES.radius.full, backgroundColor: COLORS.gray300 },
  attemptDotFilled: { backgroundColor: COLORS.warning, transform: [{ scale: 1.2 }] },
  actionButtons: { ...COMMON_STYLES.rowCenter, marginBottom: 20 },
  forgotButton: { ...COMMON_STYLES.button.outline, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1.5 },
  forgotButtonText: { ...FONTS.label, color: COLORS.primary, marginLeft: 4 },
  buttonDisabled: { opacity: 0.5 },
  submitButton: { marginBottom: 16 },
  securityContainer: {
    ...COMMON_STYLES.rowCenter,
    backgroundColor: `${COLORS.successLight}20`,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.success,
    marginTop: 4,
  },
  securityText: { ...FONTS.caption, color: COLORS.successDark, marginLeft: 6 },
});

export default MpinVerifyScreen;
