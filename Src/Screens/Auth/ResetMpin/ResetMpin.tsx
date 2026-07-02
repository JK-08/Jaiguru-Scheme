import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useMpin } from '../../../api/hooks/Mpin/useMpin';
import { useToast, ToastTypes, ToastPositions } from '../../../Components/Toast/Toast';
import theme from '../../../Utills/AppTheme';
import { AppPinInput, AppPinInputRef, AppButton } from '../../../Components/ui/appcomponents';

const { COLORS, SIZES, FONTS, SHADOWS, COMMON_STYLES } = theme;

type Section = 'old' | 'new' | 'confirm';

interface MpinValidations {
  length: boolean;
  consecutive: boolean;
  repeated: boolean;
  sequence: boolean;
}

const ResetMpinScreen = () => {
  const navigation = useNavigation<any>();
  const { resetMpinDirect, loading } = useMpin();
  const { showToast, Toast } = useToast();

  const [oldMpin, setOldMpin] = useState('');
  const [newMpin, setNewMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [showOldMpin, setShowOldMpin] = useState(false);
  const [showNewMpin, setShowNewMpin] = useState(false);
  const [showConfirmMpin, setShowConfirmMpin] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('old');
  const [mpinValidations, setMpinValidations] = useState<MpinValidations>({
    length: false,
    consecutive: false,
    repeated: false,
    sequence: false,
  });

  const oldRef = useRef<AppPinInputRef>(null);
  const newRef = useRef<AppPinInputRef>(null);
  const confirmRef = useRef<AppPinInputRef>(null);
  const MAX_ATTEMPTS = 3;
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  const LOCK_DURATION = 120;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetAllMpin = useCallback(() => {
    setOldMpin('');
    setNewMpin('');
    setConfirmMpin('');
    oldRef.current?.clear();
    newRef.current?.clear();
    confirmRef.current?.clear();
    setActiveSection('old');
    setMpinValidations({ length: false, consecutive: false, repeated: false, sequence: false });
    setTimeout(() => oldRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (isLocked && lockTime > 0) {
      timerRef.current = setInterval(() => {
        setLockTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsLocked(false);
            setAttempts(0);
            resetAllMpin();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLocked, lockTime, resetAllMpin]);

  const validateMpin = useCallback((mpinString: string) => {
    const validations: MpinValidations = {
      length: mpinString.length === 4,
      consecutive: !/(012|123|234|345|456|567|678|789|890)/.test(mpinString),
      repeated: !/(\d)\1{2,}/.test(mpinString),
      sequence: !/^(0123|1234|2345|3456|4567|5678|6789|7890)$/.test(mpinString),
    };
    setMpinValidations(validations);
    return Object.values(validations).every((v) => v);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleSubmit = useCallback(
    async (confirmArg: string | null = null) => {
      if (isLocked) return;

      const oldMpinString = oldMpin;
      const newMpinString = newMpin;
      const confirmMpinString = confirmArg ?? confirmMpin;

      if (oldMpinString.length !== 4 || newMpinString.length !== 4 || confirmMpinString.length !== 4) {
        showToast({ message: 'Please enter all 4-digit MPINs', type: ToastTypes.WARNING, duration: 3000, position: ToastPositions.TOP });
        return;
      }

      if (newMpinString !== confirmMpinString) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          setIsLocked(true);
          setLockTime(LOCK_DURATION);
          Keyboard.dismiss();

          showToast({
            title: 'Account Locked',
            message: 'Too many incorrect attempts. Please wait 2 minutes.',
            type: ToastTypes.ERROR,
            duration: 5000,
            position: ToastPositions.TOP,
          });
        } else {
          showToast({
            title: "MPINs Don't Match",
            message: `Please enter matching MPINs. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts > 1 ? 's' : ''} remaining.`,
            type: ToastTypes.WARNING,
            duration: 4000,
            position: ToastPositions.TOP,
          });

          setConfirmMpin('');
          confirmRef.current?.clear();
          setActiveSection('confirm');
          setTimeout(() => confirmRef.current?.focus(), 100);
        }
        return;
      }

      if (!validateMpin(newMpinString)) {
        showToast({
          title: 'Weak MPIN',
          message: 'Please choose a stronger MPIN',
          type: ToastTypes.WARNING,
          duration: 4000,
          position: ToastPositions.TOP,
        });
        return;
      }

      try {
        const result = await resetMpinDirect(oldMpinString, newMpinString);
        console.log('API call successful:', result);

        resetAllMpin();
        setAttempts(0);

        showToast({ message: 'MPIN reset successfully!', type: ToastTypes.SUCCESS, duration: 3000, position: ToastPositions.TOP });

        setTimeout(() => {
          navigation.reset({ index: 0, routes: [{ name: 'MpinVerify' }] });
        }, 1000);
      } catch (err: any) {
        console.error('API call failed:', err);

        showToast({
          title: 'Reset Failed',
          message: err.message || 'Failed to reset MPIN. Please try again.',
          type: ToastTypes.ERROR,
          duration: 4000,
          position: ToastPositions.TOP,
        });
      }
    },
    [oldMpin, newMpin, confirmMpin, attempts, isLocked, resetMpinDirect, showToast, navigation, validateMpin, resetAllMpin]
  );

  const handleOldComplete = useCallback((value: string) => {
    setOldMpin(value);
    setActiveSection('new');
    setTimeout(() => newRef.current?.focus(), 100);
  }, []);

  const handleNewComplete = useCallback(
    (value: string) => {
      setNewMpin(value);
      validateMpin(value);
      setActiveSection('confirm');
      setTimeout(() => confirmRef.current?.focus(), 100);
    },
    [validateMpin]
  );

  const handleConfirmComplete = useCallback(
    (value: string) => {
      setConfirmMpin(value);
      if (newMpin === value) {
        setTimeout(() => handleSubmit(value), 100);
      }
    },
    [newMpin, handleSubmit]
  );

  const handleToggleVisibility = (type: Section) => {
    if (isLocked) return;
    if (type === 'old') setShowOldMpin((v) => !v);
    else if (type === 'new') setShowNewMpin((v) => !v);
    else setShowConfirmMpin((v) => !v);
  };

  const handleBack = useCallback(() => {
    if (isLocked) return;
    Keyboard.dismiss();
    navigation.goBack();
  }, [navigation, isLocked]);

  const dismissKeyboard = () => Keyboard.dismiss();

  const isSubmitDisabled = loading || isLocked || oldMpin.length !== 4 || newMpin.length !== 4 || confirmMpin.length !== 4;

  const renderPinSection = (
    type: Section,
    ref: React.RefObject<AppPinInputRef>,
    value: string,
    onChangeText: (v: string) => void,
    onComplete: (v: string) => void,
    showValue: boolean
  ) => (
    <View style={styles.pinRow}>
      <AppPinInput
        ref={ref}
        variant="boxes"
        length={4}
        dotSize={52}
        secureTextEntry={!showValue}
        onChangeText={onChangeText}
        onComplete={onComplete}
        disabled={isLocked || loading}
      />
      <TouchableOpacity
        style={[styles.visibilityButton, (isLocked || loading) && styles.buttonDisabled]}
        onPress={() => handleToggleVisibility(type)}
        activeOpacity={0.7}
        disabled={isLocked || loading}
      >
        <Icon
          name={showValue ? 'eye-off-outline' : 'eye-outline'}
          size={SIZES.icon.md}
          color={isLocked || loading ? COLORS.disabled : COLORS.primary}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={COMMON_STYLES.containerBlue}>
      <Toast />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: SIZES.padding.container, paddingTop: 8 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={[styles.backButton, isLocked && styles.buttonDisabled]}
                onPress={handleBack}
                disabled={isLocked || loading}
                activeOpacity={0.7}
              >
                <Icon name="arrow-left" size={SIZES.icon.lg} color={isLocked ? COLORS.disabled : COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Reset MPIN</Text>
              <View style={styles.headerPlaceholder} />
            </View>

            {isLocked && (
              <View style={styles.lockContainer}>
                <Icon name="lock-alert-outline" size={SIZES.icon.xl} color={COLORS.error} />
                <Text style={styles.lockTitle}>Account Temporarily Locked</Text>
                <Text style={styles.lockText}>Please wait {formatTime(lockTime)} before trying again</Text>
                <View style={styles.timerContainer}>
                  <View style={[styles.timerProgress, { width: `${(1 - lockTime / LOCK_DURATION) * 100}%` as any, backgroundColor: COLORS.error }]} />
                </View>
              </View>
            )}

            <View style={styles.securityStatus}>
              <View style={styles.statusItem}>
                <Icon name="shield-check" size={SIZES.icon.sm} color={COLORS.success} />
                <Text style={styles.statusText}>Secure Reset</Text>
              </View>
              <View style={styles.statusItem}>
                <Icon name="key-change" size={SIZES.icon.sm} color={COLORS.info} />
                <Text style={styles.statusText}>Direct Reset</Text>
              </View>
            </View>

            <View style={styles.instructionsContainer}>
              <Icon name="information-outline" size={SIZES.icon.md} color={COLORS.info} />
              <Text style={styles.instructionsText}>Set a new 4-digit MPIN for your account</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Current MPIN</Text>
                {activeSection === 'old' && (
                  <View style={styles.activeIndicator}>
                    <Icon name="circle" size={SIZES.icon.xs} color={COLORS.primary} />
                    <Text style={styles.activeText}>Entering</Text>
                  </View>
                )}
              </View>
              <Text style={styles.sectionSubtitle}>Enter your current 4-digit MPIN</Text>
              {renderPinSection('old', oldRef, oldMpin, setOldMpin, handleOldComplete, showOldMpin)}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>New MPIN</Text>
                {activeSection === 'new' && (
                  <View style={styles.activeIndicator}>
                    <Icon name="circle" size={SIZES.icon.xs} color={COLORS.primary} />
                    <Text style={styles.activeText}>Entering</Text>
                  </View>
                )}
              </View>
              <Text style={styles.sectionSubtitle}>Create a new 4-digit security PIN</Text>
              {renderPinSection('new', newRef, newMpin, setNewMpin, handleNewComplete, showNewMpin)}
            </View>

            {newMpin.length === 4 && (
              <View style={styles.strengthContainer}>
                <Text style={styles.strengthTitle}>MPIN Strength:</Text>
                <View style={styles.validationList}>
                  {(
                    [
                      ['length', '4 digits exactly'],
                      ['consecutive', 'No consecutive numbers'],
                      ['repeated', 'No repeated digits'],
                      ['sequence', 'No simple sequences'],
                    ] as [keyof MpinValidations, string][]
                  ).map(([key, label]) => (
                    <View style={styles.validationItem} key={key}>
                      <Icon
                        name={mpinValidations[key] ? 'check-circle' : 'alert-circle'}
                        size={SIZES.icon.sm}
                        color={mpinValidations[key] ? COLORS.success : COLORS.warning}
                      />
                      <Text style={[styles.validationText, mpinValidations[key] && styles.validationTextSuccess]}>{label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Confirm MPIN</Text>
                {activeSection === 'confirm' && (
                  <View style={styles.activeIndicator}>
                    <Icon name="circle" size={SIZES.icon.xs} color={COLORS.primary} />
                    <Text style={styles.activeText}>Entering</Text>
                  </View>
                )}
              </View>
              <Text style={styles.sectionSubtitle}>Re-enter your new MPIN to confirm</Text>
              {renderPinSection('confirm', confirmRef, confirmMpin, setConfirmMpin, handleConfirmComplete, showConfirmMpin)}
            </View>

            {attempts > 0 && !isLocked && (
              <View style={styles.attemptsContainer}>
                <Icon name="alert-circle-outline" size={SIZES.icon.md} color={COLORS.warning} />
                <Text style={styles.attemptsText}>
                  {attempts} mismatch attempt{attempts !== 1 ? 's' : ''}
                </Text>
                <View style={styles.attemptsDots}>
                  {[1, 2, 3].map((dot) => (
                    <View key={dot} style={[styles.attemptDot, dot <= attempts && styles.attemptDotFilled]} />
                  ))}
                </View>
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.resetButton, isLocked && styles.buttonDisabled]}
                onPress={resetAllMpin}
                disabled={isLocked || loading}
                activeOpacity={0.7}
              >
                <Icon name="refresh" size={SIZES.icon.sm} color={isLocked ? COLORS.disabled : COLORS.primary} />
                <Text style={[styles.resetButtonText, isLocked && { color: COLORS.disabled }]}>Clear All</Text>
              </TouchableOpacity>
            </View>

            <AppButton
              label={isLocked ? 'Account Locked' : 'Reset MPIN'}
              onPress={() => handleSubmit()}
              disabled={isSubmitDisabled}
              loading={loading}
              variant="primary"
              size="lg"
              rightIcon={!isLocked && !loading ? 'checkmark-circle-outline' : undefined}
              style={styles.submitButton}
            />

            <View style={styles.securityContainer}>
              <Icon name="shield-lock" size={SIZES.icon.sm} color={COLORS.success} />
              <Text style={styles.securityText}>Your new MPIN will be encrypted and stored securely</Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: COLORS.backgroundBlue },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 4 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: { ...FONTS.h4, fontSize: 20, color: COLORS.textBlueDark, textAlign: 'center' },
  headerPlaceholder: { width: 44 },
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
  securityStatus: { ...COMMON_STYLES.rowCenter, gap: 12, marginBottom: 8 },
  statusItem: { ...COMMON_STYLES.chip.blue, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { ...FONTS.caption, color: COLORS.infoDark, marginLeft: 4 },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.infoLight}20`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.info,
    marginBottom: 10,
  },
  instructionsText: { ...FONTS.bodySmall, fontSize: 13, color: COLORS.infoDark, marginLeft: 8, flex: 1 },
  section: { marginBottom: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sectionTitle: { ...FONTS.h6, color: COLORS.textBlueDark },
  activeIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  activeText: { ...FONTS.caption, color: COLORS.primary },
  sectionSubtitle: { ...FONTS.caption, fontSize: 11, color: COLORS.textTertiary, marginBottom: 8 },
  pinRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  visibilityButton: {
    marginLeft: 12,
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
  strengthContainer: {
    backgroundColor: COLORS.blueOpacity10,
    borderRadius: SIZES.radius.md,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.blueOpacity30,
  },
  strengthTitle: { ...FONTS.label, fontSize: 14, color: COLORS.textBlueDark, marginBottom: 12 },
  validationList: { gap: 8 },
  validationItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  validationText: { ...FONTS.caption, color: COLORS.textTertiary },
  validationTextSuccess: { color: COLORS.successDark },
  attemptsContainer: { alignItems: 'center', marginBottom: 16 },
  attemptsText: { ...FONTS.captionBold, color: COLORS.warning, marginTop: 6, marginBottom: 8 },
  attemptsDots: { ...COMMON_STYLES.rowCenter, gap: 6 },
  attemptDot: { width: 6, height: 6, borderRadius: SIZES.radius.full, backgroundColor: COLORS.gray300 },
  attemptDotFilled: { backgroundColor: COLORS.warning, transform: [{ scale: 1.2 }] },
  actionButtons: { ...COMMON_STYLES.rowCenter, marginBottom: 10 },
  resetButton: { ...COMMON_STYLES.button.outline, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1.5 },
  resetButtonText: { ...FONTS.label, color: COLORS.primary, marginLeft: 4 },
  buttonDisabled: { opacity: 0.5 },
  submitButton: { marginBottom: 12 },
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

export default ResetMpinScreen;
