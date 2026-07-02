import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Animated, StyleSheet, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useMpin } from '../../../api/hooks/Mpin/useMpin';
import theme from '../../../Utills/AppTheme';
import { AppPinInput, AppPinInputRef, AppButton } from '../../../Components/ui/appcomponents';

const WEAK_MPIN_PATTERNS = new Set([
  '1234', '4321', '1111', '0000', '2222', '3333', '4444', '5555', '6666', '7777',
  '8888', '9999', '9876', '6789', '1004', '2000', '1212', '2001', '1010', '1122', '2020',
]);

const SEQUENTIAL_PATTERNS = new Set([
  '0123', '1234', '2345', '3456', '4567', '5678', '6789',
  '9876', '8765', '7654', '6543', '5432', '4321', '3210',
]);

const validateMpinValue = (mpin: string, confirm = ''): string => {
  if (mpin.length !== 4) return 'Please enter a 4-digit MPIN.';
  if (WEAK_MPIN_PATTERNS.has(mpin)) return 'This MPIN is too common. Choose a more secure combination.';
  if (SEQUENTIAL_PATTERNS.has(mpin)) return 'Sequential numbers are not secure. Choose a random combination.';
  if (/^(\d)\1{3}$/.test(mpin)) return 'Repeating digits are not secure. Choose a random combination.';
  if (confirm.length === 4 && mpin !== confirm) return 'MPINs do not match. Please try again.';
  return '';
};

const MpinCreateScreen = () => {
  const navigation = useNavigation<any>();
  const { createMpin, loading: isCreatingMpin, error: createError } = useMpin();

  // step 1 = enter mpin, step 2 = confirm mpin
  const [step, setStep] = useState<1 | 2>(1);
  const [mpinValue, setMpinValue] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [showMpin, setShowMpin] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const mpinRef = useRef<AppPinInputRef>(null);
  const confirmRef = useRef<AppPinInputRef>(null);
  const isMounted = useRef(true);
  const autoSubmitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // animate progress bar when step changes
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: step === 1 ? 0 : 1,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [step]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (autoSubmitTimer.current) clearTimeout(autoSubmitTimer.current);
    };
  }, []);

  // back handler
  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        if (step === 2) {
          goToStep1();
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [step])
  );

  const goToStep1 = () => {
    if (autoSubmitTimer.current) clearTimeout(autoSubmitTimer.current);
    setConfirmValue('');
    confirmRef.current?.clear();
    setError('');
    setSubmitting(false);
    setStep(1);
    setTimeout(() => mpinRef.current?.focus(), 150);
  };

  const handleGoBack = () => {
    if (step === 2) {
      goToStep1();
    } else {
      navigation.goBack();
    }
  };

  const handleReset = () => {
    if (autoSubmitTimer.current) clearTimeout(autoSubmitTimer.current);
    setMpinValue('');
    setConfirmValue('');
    mpinRef.current?.clear();
    confirmRef.current?.clear();
    setError('');
    setSubmitting(false);
    setShowMpin(false);
    setShowConfirm(false);
    setStep(1);
    setTimeout(() => mpinRef.current?.focus(), 150);
  };

  // called when step 1 pin is fully entered (4 digits)
  const handleStep1Complete = useCallback((value: string) => {
    const err = validateMpinValue(value);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setMpinValue(value);
    setStep(2);
    // focus confirm input after step transition
    setTimeout(() => {
      if (isMounted.current) confirmRef.current?.focus();
    }, 200);
  }, []);

  // called when confirm pin changes
  const handleConfirmChange = useCallback((value: string) => {
    setConfirmValue(value);
    setError('');
  }, []);

  const handleSubmit = useCallback(async (mpin: string, confirm: string) => {
    if (submitting || isCreatingMpin || !isMounted.current) return;

    const err = validateMpinValue(mpin, confirm);
    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await createMpin(mpin);
      await AsyncStorage.setItem('hasMpin', 'true');

      Alert.alert('Success', 'MPIN created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            if (isMounted.current) {
              navigation.reset({ index: 0, routes: [{ name: 'MainDrawer' }] });
            }
          },
        },
      ]);
    } catch (err: any) {
      if (!isMounted.current) return;
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('mpin already exists') || err?.code === 'MPIN_ALREADY_EXISTS') {
        await AsyncStorage.setItem('hasMpin', 'true');
        Alert.alert('MPIN Already Set', 'You already have an MPIN. Please verify to continue.', [
          {
            text: 'Verify MPIN',
            onPress: () => {
              if (isMounted.current) navigation.reset({ index: 0, routes: [{ name: 'MpinVerify' }] });
            },
          },
        ]);
        return;
      }
      setError(msg || 'Failed to create MPIN. Please try again.');
      setSubmitting(false);
    }
  }, [submitting, isCreatingMpin, createMpin, navigation]);

  // auto-submit when confirm is complete
  useEffect(() => {
    if (autoSubmitTimer.current) clearTimeout(autoSubmitTimer.current);

    if (step === 2 && confirmValue.length === 4 && !submitting && !isCreatingMpin) {
      autoSubmitTimer.current = setTimeout(() => {
        if (isMounted.current) handleSubmit(mpinValue, confirmValue);
      }, 300);
    }

    return () => {
      if (autoSubmitTimer.current) clearTimeout(autoSubmitTimer.current);
    };
  }, [confirmValue, step, mpinValue, submitting, isCreatingMpin, handleSubmit]);

  const displayError = error || createError || '';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.flex}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity
                onPress={handleGoBack}
                style={styles.iconBtn}
                activeOpacity={0.7}
                disabled={isCreatingMpin}
              >
                <Icon name="arrow-left" size={24} color={theme.COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Create MPIN</Text>
              <TouchableOpacity
                onPress={handleReset}
                style={styles.iconBtn}
                activeOpacity={0.7}
                disabled={isCreatingMpin}
              >
                <Icon name="refresh" size={22} color={theme.COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Step indicators */}
            <View style={styles.stepsRow}>
              {/* Step 1 */}
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, styles.stepCircleActive]}>
                  <Text style={styles.stepNumActive}>1</Text>
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelActive]}>Enter MPIN</Text>
              </View>

              {/* Connector */}
              <View style={styles.connectorTrack}>
                <Animated.View
                  style={[
                    styles.connectorFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>

              {/* Step 2 */}
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, step === 2 ? styles.stepCircleActive : styles.stepCircleInactive]}>
                  <Text style={step === 2 ? styles.stepNumActive : styles.stepNumInactive}>2</Text>
                </View>
                <Text style={[styles.stepLabel, step === 2 ? styles.stepLabelActive : styles.stepLabelInactive]}>
                  Confirm MPIN
                </Text>
              </View>
            </View>
          </View>

          {/* Main content */}
          <View style={styles.body}>
            <View style={styles.iconContainer}>
              <Icon
                name={step === 1 ? 'lock-outline' : 'lock-check'}
                size={48}
                color={theme.COLORS.primary}
              />
            </View>

            <Text style={styles.title}>
              {step === 1 ? 'Create Your MPIN' : 'Confirm Your MPIN'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1 ? "Choose a 4-digit number you'll remember" : 'Re-enter your MPIN to confirm'}
            </Text>

            {/* PIN inputs — both always mounted, only one visible */}
            <View style={styles.inputSection}>
              <View style={[styles.pinRow, step !== 1 && styles.hidden]}>
                <AppPinInput
                  ref={mpinRef}
                  variant="boxes"
                  length={4}
                  secureTextEntry={!showMpin}
                  onChangeText={(v) => { if (step === 1) setMpinValue(v); }}
                  onComplete={handleStep1Complete}
                  error={step === 1 && !!displayError}
                  disabled={isCreatingMpin || step !== 1}
                  autoFocus
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowMpin(v => !v)}
                  activeOpacity={0.7}
                  disabled={isCreatingMpin}
                >
                  <Icon name={showMpin ? 'eye-off' : 'eye'} size={22} color={theme.COLORS.primary} />
                </TouchableOpacity>
              </View>

              <View style={[styles.pinRow, step !== 2 && styles.hidden]}>
                <AppPinInput
                  ref={confirmRef}
                  variant="boxes"
                  length={4}
                  secureTextEntry={!showConfirm}
                  onChangeText={handleConfirmChange}
                  error={step === 2 && !!displayError}
                  disabled={isCreatingMpin || step !== 2}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowConfirm(v => !v)}
                  activeOpacity={0.7}
                  disabled={isCreatingMpin}
                >
                  <Icon name={showConfirm ? 'eye-off' : 'eye'} size={22} color={theme.COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {!!displayError && (
              <View style={styles.errorBox}>
                <Icon name="alert-circle" size={18} color={theme.COLORS.error} />
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            )}

            <View style={styles.tips}>
              {[
                'Avoid common patterns (1234, 1111)',
                'Never share your MPIN with anyone',
                'Choose numbers easy to remember but hard to guess',
              ].map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <Icon name="shield-check" size={16} color={theme.COLORS.success} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Footer button — show on step 2 when 4 digits entered */}
          {step === 2 && confirmValue.length === 4 && (
            <View style={styles.footer}>
              <AppButton
                label="Confirm & Create"
                onPress={() => handleSubmit(mpinValue, confirmValue)}
                disabled={!!displayError || isCreatingMpin || submitting}
                loading={isCreatingMpin || submitting}
                variant="gold"
                size="lg"
                leftIcon="lock-closed-outline"
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: theme.COLORS.backgroundBlue },
  header: {
    backgroundColor: theme.COLORS.white,
    paddingHorizontal: theme.SIZES.padding.container,
    paddingTop: Platform.OS === 'ios' ? theme.SIZES.padding.md : theme.SIZES.padding.lg,
    paddingBottom: theme.SIZES.padding.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.COLORS.borderLight,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.SIZES.margin.lg,
  },
  iconBtn: {
    width: 40, height: 40,
    borderRadius: theme.SIZES.radius.md,
    backgroundColor: theme.COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { ...theme.FONTS.h6, color: theme.COLORS.textBlueDark },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.SIZES.padding.md,
  },
  stepItem: { alignItems: 'center', width: 90 },
  stepCircle: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 6,
  },
  stepCircleActive: { backgroundColor: theme.COLORS.primary },
  stepCircleInactive: {
    backgroundColor: theme.COLORS.gray100,
    borderWidth: 1.5,
    borderColor: theme.COLORS.gray300,
  },
  stepNumActive: { ...theme.FONTS.bodyMedium, color: theme.COLORS.white, fontSize: 14 },
  stepNumInactive: { ...theme.FONTS.bodyMedium, color: theme.COLORS.gray400, fontSize: 14 },
  stepLabel: { ...theme.FONTS.caption, textAlign: 'center' },
  stepLabelActive: { color: theme.COLORS.primary },
  stepLabelInactive: { color: theme.COLORS.gray400 },
  connectorTrack: {
    flex: 1, height: 4,
    backgroundColor: theme.COLORS.gray200,
    borderRadius: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  connectorFill: {
    height: '100%',
    backgroundColor: theme.COLORS.primary,
    borderRadius: 2,
  },
  body: {
    flex: 1,
    paddingHorizontal: theme.SIZES.padding.container,
    paddingTop: theme.SIZES.padding.xl,
  },
  iconContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: `${theme.COLORS.primary}15`,
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center',
    marginBottom: theme.SIZES.margin.lg,
  },
  title: { ...theme.FONTS.h3, color: theme.COLORS.textBlueDark, textAlign: 'center', marginBottom: 8 },
  subtitle: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: theme.SIZES.margin.xl,
    paddingHorizontal: 20,
  },
  inputSection: { marginBottom: theme.SIZES.margin.xl, alignItems: 'center' },
  pinRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  hidden: { position: 'absolute', opacity: 0, pointerEvents: 'none' } as any,
  eyeBtn: {
    marginLeft: theme.SIZES.margin.md,
    width: 44, height: 44,
    backgroundColor: `${theme.COLORS.primary}10`,
    borderRadius: theme.SIZES.radius.md,
    justifyContent: 'center', alignItems: 'center',
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: `${theme.COLORS.error}10`,
    padding: theme.SIZES.padding.md,
    borderRadius: theme.SIZES.radius.md,
    marginBottom: theme.SIZES.margin.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.COLORS.error,
  },
  errorText: { ...theme.FONTS.caption, color: theme.COLORS.error, marginLeft: 8, flex: 1 },
  tips: {
    backgroundColor: `${theme.COLORS.primary}08`,
    padding: theme.SIZES.padding.lg,
    borderRadius: theme.SIZES.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${theme.COLORS.primary}20`,
  },
  tipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tipText: { ...theme.FONTS.caption, color: theme.COLORS.textSecondary, marginLeft: 8, flex: 1 },
  footer: {
    paddingHorizontal: theme.SIZES.padding.container,
    paddingTop: theme.SIZES.padding.md,
    paddingBottom: Platform.OS === 'ios' ? 10 : theme.SIZES.padding.lg,
    backgroundColor: theme.COLORS.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.COLORS.borderLight,
  },
});

export default memo(MpinCreateScreen);
