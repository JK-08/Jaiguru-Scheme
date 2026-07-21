// Src/Screens/Auth/CreateMpin/CreateMpin.tsx
// -----------------------------------------------------------------------------
// Premium Create-MPIN screen (champagne theme). Two-step enter → confirm flow
// with strength validation and auto-submit. All logic preserved; UI reskinned
// via the shared MpinScaffold + gold PIN input + gold CTA.
// -----------------------------------------------------------------------------

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Alert, StyleSheet, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useMpin } from '../../../api/hooks/Mpin/useMpin';
import theme from '../../../Utills/AppTheme';
import { AppPinInput, AppPinInputRef } from '../../../Components/ui/appcomponents';
import MpinScaffold from '../Mpin/MpinScaffold';
import LoginButton from '../Login/components/LoginButton';

const { COLORS, SIZES, FONTS } = theme;

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

const TIPS = [
  'Avoid common patterns (1234, 1111)',
  'Never share your MPIN with anyone',
  'Choose numbers easy to remember but hard to guess',
];

const MpinCreateScreen = () => {
  const navigation = useNavigation<any>();
  const { createMpin, loading: isCreatingMpin, error: createError } = useMpin();

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

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (autoSubmitTimer.current) clearTimeout(autoSubmitTimer.current);
    };
  }, []);

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
    }, [step]),
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
    if (step === 2) goToStep1();
    else navigation.goBack();
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

  const handleStep1Complete = useCallback((value: string) => {
    const err = validateMpinValue(value);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setMpinValue(value);
    setStep(2);
    setTimeout(() => {
      if (isMounted.current) confirmRef.current?.focus();
    }, 200);
  }, []);

  const handleConfirmChange = useCallback((value: string) => {
    setConfirmValue(value);
    setError('');
  }, []);

  const handleSubmit = useCallback(
    async (mpin: string, confirm: string) => {
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
              if (isMounted.current) navigation.reset({ index: 0, routes: [{ name: 'MainDrawer' }] });
            },
          },
        ]);
      } catch (e: any) {
        if (!isMounted.current) return;
        const msg = e?.message || '';
        if (msg.toLowerCase().includes('mpin already exists') || e?.code === 'MPIN_ALREADY_EXISTS') {
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
    },
    [submitting, isCreatingMpin, createMpin, navigation],
  );

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
    <MpinScaffold
      headerTitle="Create MPIN"
      icon={step === 1 ? 'lock-plus-outline' : 'lock-check-outline'}
      heading={step === 1 ? 'Create Your MPIN' : 'Confirm Your MPIN'}
      subtitle={
        step === 1
          ? "Choose a 4-digit number you'll remember"
          : 'Re-enter your MPIN to confirm'
      }
      onBackPress={handleGoBack}
    >
      {/* Step indicator */}
      <View style={styles.stepsRow}>
        <View style={[styles.stepDot, styles.stepDotActive]}>
          <Text style={styles.stepNumActive}>1</Text>
        </View>
        <View style={[styles.connector, step === 2 && styles.connectorActive]} />
        <View style={[styles.stepDot, step === 2 ? styles.stepDotActive : styles.stepDotInactive]}>
          <Text style={step === 2 ? styles.stepNumActive : styles.stepNumInactive}>2</Text>
        </View>
      </View>

      {/* PIN inputs — both mounted, only the active one is visible */}
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
          <Pressable style={styles.eyeBtn} onPress={() => setShowMpin((v) => !v)} disabled={isCreatingMpin} hitSlop={8}>
            <MaterialCommunityIcons name={showMpin ? 'eye-off' : 'eye'} size={SIZES.icon.md} color={COLORS.accentDark} />
          </Pressable>
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
          <Pressable style={styles.eyeBtn} onPress={() => setShowConfirm((v) => !v)} disabled={isCreatingMpin} hitSlop={8}>
            <MaterialCommunityIcons name={showConfirm ? 'eye-off' : 'eye'} size={SIZES.icon.md} color={COLORS.accentDark} />
          </Pressable>
        </View>
      </View>

      {!!displayError && (
        <View style={styles.errorBox}>
          <MaterialCommunityIcons name="alert-circle" size={SIZES.icon.sm} color={COLORS.error} />
          <Text style={styles.errorText}>{displayError}</Text>
        </View>
      )}

      <View style={styles.tips}>
        {TIPS.map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <MaterialCommunityIcons name="shield-check" size={SIZES.icon.sm} color={COLORS.success} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      {step === 2 && confirmValue.length === 4 && (
        <View style={styles.footer}>
          <LoginButton
            label="Confirm & Create"
            onPress={() => handleSubmit(mpinValue, confirmValue)}
            loading={isCreatingMpin || submitting}
            disabled={!!displayError || isCreatingMpin || submitting}
            icon="lock-check"
          />
        </View>
      )}

      <Pressable onPress={handleReset} style={styles.resetLink} hitSlop={8} disabled={isCreatingMpin}>
        <MaterialCommunityIcons name="refresh" size={SIZES.icon.xs} color={COLORS.textSecondary} />
        <Text style={styles.resetText}>Start over</Text>
      </Pressable>
    </MpinScaffold>
  );
};

const styles = StyleSheet.create({
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.xl,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: COLORS.accent },
  stepDotInactive: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.borderChampagne,
  },
  stepNumActive: { fontFamily: FONTS.family.bold, fontSize: SIZES.font.sm, color: COLORS.white },
  stepNumInactive: { fontFamily: FONTS.family.bold, fontSize: SIZES.font.sm, color: COLORS.textTertiary },
  connector: {
    width: 48,
    height: 3,
    marginHorizontal: SIZES.sm,
    borderRadius: 2,
    backgroundColor: COLORS.borderChampagne,
  },
  connectorActive: { backgroundColor: COLORS.accent },
  inputSection: { alignItems: 'center' },
  pinRow: { alignItems: 'center' },
  hidden: { position: 'absolute', opacity: 0, height: 0, overflow: 'hidden' },
  eyeBtn: { marginTop: SIZES.md, padding: SIZES.xs },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.md,
    paddingHorizontal: SIZES.md,
  },
  errorText: {
    fontFamily: FONTS.family.medium,
    fontSize: SIZES.font.sm,
    color: COLORS.error,
    marginLeft: SIZES.xs,
    flexShrink: 1,
    textAlign: 'center',
  },
  tips: {
    marginTop: SIZES.xl,
    alignSelf: 'center',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  tipText: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginLeft: SIZES.sm,
  },
  footer: { marginTop: SIZES.xl },
  resetLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.lg,
  },
  resetText: {
    fontFamily: FONTS.family.medium,
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginLeft: SIZES.xs,
  },
});

export default MpinCreateScreen;
