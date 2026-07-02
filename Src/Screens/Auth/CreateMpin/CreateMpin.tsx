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
  '0123', '1234', '2345', '3456', '4567', '5678', '6789', '9876', '8765', '7654', '6543', '5432', '4321', '3210',
]);

const VALIDATION_RULES = {
  weakPattern: (mpin: string) => WEAK_MPIN_PATTERNS.has(mpin),
  sequential: (mpin: string) => SEQUENTIAL_PATTERNS.has(mpin),
  repeating: (mpin: string) => /^(\d)\1{3}$/.test(mpin),
  mismatch: (mpin: string, confirmMpin: string) => mpin !== confirmMpin,
};

const ERROR_MESSAGES = {
  weak: 'This MPIN is too common. Choose a more secure combination.',
  sequential: 'Sequential numbers are not secure. Choose a random combination.',
  repeating: 'Repeating digits are not secure. Choose a random combination.',
  mismatch: 'MPINs do not match. Please try again.',
  incomplete: 'Please complete all fields.',
};

const MpinCreateScreen = () => {
  const navigation = useNavigation<any>();
  const { createMpin, loading: isCreatingMpin, error: createError } = useMpin();

  const [mpinValue, setMpinValue] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [showMpin, setShowMpin] = useState(false);
  const [showConfirmMpin, setShowConfirmMpin] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const mpinRef = useRef<AppPinInputRef>(null);
  const confirmRef = useRef<AppPinInputRef>(null);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const isMounted = useRef(true);
  const backHandlerRef = useRef<{ remove: () => void } | null>(null);
  const autoSubmitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetState = useCallback(() => {
    if (!isMounted.current) return;
    setMpinValue('');
    setConfirmValue('');
    mpinRef.current?.clear();
    confirmRef.current?.clear();
    setValidationError('');
    setCurrentStep(1);
    setShowMpin(false);
    setShowConfirmMpin(false);
    setHasSubmitted(false);
  }, []);

  const handleGoBack = useCallback(() => {
    if (currentStep === 2) {
      setConfirmValue('');
      confirmRef.current?.clear();
      setCurrentStep(1);
      setValidationError('');
      setTimeout(() => mpinRef.current?.focus(), 100);
    } else {
      navigation.goBack();
    }
  }, [currentStep, navigation]);

  const handleBackPress = useCallback(() => {
    if (currentStep === 2) {
      handleGoBack();
      return true;
    }
    return false;
  }, [currentStep, handleGoBack]);

  useFocusEffect(
    useCallback(() => {
      if (!isInitialized) {
        resetState();
        setIsInitialized(true);
        setTimeout(() => {
          if (isMounted.current) mpinRef.current?.focus();
        }, 300);
      }

      if (Platform.OS === 'android') {
        backHandlerRef.current = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      }

      return () => {
        if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
        if (backHandlerRef.current && Platform.OS === 'android') backHandlerRef.current.remove();
      };
    }, [isInitialized, handleBackPress, resetState])
  );

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
    };
  }, []);

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: currentStep === 1 ? 0.5 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const validateMpin = useCallback((mpinVal: string, confirmMpinVal = '') => {
    if (mpinVal.length !== 4 || (confirmMpinVal.length > 0 && confirmMpinVal.length !== 4)) {
      return ERROR_MESSAGES.incomplete;
    }
    if (VALIDATION_RULES.weakPattern(mpinVal)) return ERROR_MESSAGES.weak;
    if (VALIDATION_RULES.sequential(mpinVal)) return ERROR_MESSAGES.sequential;
    if (VALIDATION_RULES.repeating(mpinVal)) return ERROR_MESSAGES.repeating;
    if (confirmMpinVal && VALIDATION_RULES.mismatch(mpinVal, confirmMpinVal)) return ERROR_MESSAGES.mismatch;
    return '';
  }, []);

  const handleSubmit = useCallback(async () => {
    if (hasSubmitted || isCreatingMpin || !isMounted.current) return;

    setHasSubmitted(true);
    setValidationError('');

    const errorMessage = validateMpin(mpinValue, confirmValue);
    if (errorMessage) {
      setValidationError(errorMessage);
      setHasSubmitted(false);
      return;
    }

    try {
      await createMpin(mpinValue);
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

      const errorMsg = err?.message || '';

      if (errorMsg.includes('MPIN already exists') || err?.code === 'MPIN_ALREADY_EXISTS') {
        await AsyncStorage.setItem('hasMpin', 'true');

        Alert.alert('MPIN Already Set', 'You already have an MPIN. Please verify to continue.', [
          {
            text: 'Verify MPIN',
            onPress: () => {
              if (isMounted.current) {
                navigation.reset({ index: 0, routes: [{ name: 'MpinVerify' }] });
              }
            },
          },
        ]);
        return;
      }

      setValidationError(errorMsg || 'Failed to create MPIN. Please try again.');
      setHasSubmitted(false);
    }
  }, [mpinValue, confirmValue, validateMpin, createMpin, navigation, hasSubmitted, isCreatingMpin]);

  // Auto-submit once confirm PIN is complete and matches
  useEffect(() => {
    if (currentStep === 2 && confirmValue.length === 4 && !validationError && !hasSubmitted && !isCreatingMpin && isMounted.current) {
      if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);

      autoSubmitTimerRef.current = setTimeout(() => {
        const errorMsg = validateMpin(mpinValue, confirmValue);
        if (!errorMsg && isMounted.current) {
          handleSubmit();
        } else if (errorMsg && isMounted.current) {
          setValidationError(errorMsg);
        }
      }, 300);
    }

    return () => {
      if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
    };
  }, [confirmValue, currentStep, mpinValue, handleSubmit, hasSubmitted, isCreatingMpin, validateMpin]);

  const handleMpinComplete = useCallback(
    (value: string) => {
      const errorMessage = validateMpin(value);
      if (errorMessage) {
        setValidationError(errorMessage);
      } else {
        setValidationError('');
        setCurrentStep(2);
        setTimeout(() => confirmRef.current?.focus(), 100);
      }
    },
    [validateMpin]
  );

  const handleClearAll = useCallback(() => {
    resetState();
    setTimeout(() => mpinRef.current?.focus(), 100);
  }, [resetState]);

  const displayError = useMemo(() => validationError || createError, [validationError, createError]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity
                onPress={handleGoBack}
                style={styles.backButton}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={isCreatingMpin}
              >
                <Icon name="arrow-left" size={24} color={theme.COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Create MPIN</Text>
              <TouchableOpacity
                onPress={handleClearAll}
                style={styles.backButton}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={isCreatingMpin}
              >
                <Icon name="refresh" size={22} color={theme.COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { width: progressAnimation.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>Step {currentStep} of 2</Text>
            </View>
          </View>

          <View style={styles.mainContent}>
            <View style={styles.iconContainer}>
              <Icon name={currentStep === 1 ? 'lock-outline' : 'lock-check'} size={48} color={theme.COLORS.primary} />
            </View>

            <Text style={styles.title}>{currentStep === 1 ? 'Create Your MPIN' : 'Confirm Your MPIN'}</Text>
            <Text style={styles.subtitle}>
              {currentStep === 1 ? "Choose a 4-digit number you'll remember" : 'Re-enter your MPIN to confirm'}
            </Text>

            <View style={styles.inputSection}>
              {currentStep === 1 ? (
                <View style={styles.pinRow}>
                  <AppPinInput
                    ref={mpinRef}
                    variant="boxes"
                    length={4}
                    secureTextEntry={!showMpin}
                    onChangeText={setMpinValue}
                    onComplete={handleMpinComplete}
                    error={!!displayError}
                    disabled={isCreatingMpin}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.visibilityButton}
                    onPress={() => setShowMpin(!showMpin)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    disabled={isCreatingMpin}
                  >
                    <Icon name={showMpin ? 'eye-off' : 'eye'} size={22} color={theme.COLORS.primary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.pinRow}>
                  <AppPinInput
                    ref={confirmRef}
                    variant="boxes"
                    length={4}
                    secureTextEntry={!showConfirmMpin}
                    onChangeText={setConfirmValue}
                    error={!!displayError}
                    disabled={isCreatingMpin}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.visibilityButton}
                    onPress={() => setShowConfirmMpin(!showConfirmMpin)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    disabled={isCreatingMpin}
                  >
                    <Icon name={showConfirmMpin ? 'eye-off' : 'eye'} size={22} color={theme.COLORS.primary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {displayError ? (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={18} color={theme.COLORS.error} />
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            ) : null}

            <View style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <Icon name="shield-check" size={16} color={theme.COLORS.success} />
                <Text style={styles.tipText}>Avoid common patterns (1234, 1111)</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="shield-check" size={16} color={theme.COLORS.success} />
                <Text style={styles.tipText}>Never share your MPIN with anyone</Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="shield-check" size={16} color={theme.COLORS.success} />
                <Text style={styles.tipText}>Choose numbers that are easy to remember but hard to guess</Text>
              </View>
            </View>

            {isCreatingMpin ? (
              <View style={styles.loadingContainer}>
                <Icon name="loading" size={24} color={theme.COLORS.primary} />
                <Text style={styles.loadingText}>Creating MPIN...</Text>
              </View>
            ) : null}
          </View>

          {currentStep === 2 && confirmValue.length === 4 && (
            <View style={styles.footer}>
              <AppButton
                label="Confirm & Create"
                onPress={handleSubmit}
                disabled={!!displayError || isCreatingMpin}
                loading={isCreatingMpin}
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
  container: { flex: 1, backgroundColor: theme.COLORS.backgroundBlue },
  keyboardView: { flex: 1 },
  content: { flex: 1, justifyContent: 'space-between' },
  header: {
    backgroundColor: theme.COLORS.white,
    paddingHorizontal: theme.SIZES.padding.container,
    paddingTop: Platform.OS === 'ios' ? theme.SIZES.padding.md : theme.SIZES.padding.lg,
    paddingBottom: theme.SIZES.padding.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.COLORS.borderLight,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.SIZES.margin.md },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.SIZES.radius.md,
    backgroundColor: theme.COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { ...theme.FONTS.h6, color: theme.COLORS.textBlueDark },
  progressContainer: { alignItems: 'center' },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: theme.COLORS.gray200,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: { height: '100%', backgroundColor: theme.COLORS.primary, borderRadius: 3 },
  progressText: { ...theme.FONTS.caption, color: theme.COLORS.textSecondary },
  mainContent: { flex: 1, paddingHorizontal: theme.SIZES.padding.container, paddingTop: theme.SIZES.padding.xl },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${theme.COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
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
  visibilityButton: {
    marginLeft: theme.SIZES.margin.md,
    padding: 10,
    backgroundColor: `${theme.COLORS.primary}10`,
    borderRadius: theme.SIZES.radius.md,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.COLORS.error}10`,
    padding: theme.SIZES.padding.md,
    borderRadius: theme.SIZES.radius.md,
    marginBottom: theme.SIZES.margin.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.COLORS.error,
  },
  errorText: { ...theme.FONTS.caption, color: theme.COLORS.error, marginLeft: 8, flex: 1 },
  tipsContainer: {
    backgroundColor: `${theme.COLORS.primary}08`,
    padding: theme.SIZES.padding.lg,
    borderRadius: theme.SIZES.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${theme.COLORS.primary}20`,
  },
  tipItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tipText: { ...theme.FONTS.caption, color: theme.COLORS.textSecondary, marginLeft: 8, flex: 1 },
  footer: {
    paddingHorizontal: theme.SIZES.padding.container,
    paddingTop: theme.SIZES.padding.md,
    paddingBottom: Platform.OS === 'ios' ? 10 : theme.SIZES.padding.lg,
    backgroundColor: theme.COLORS.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.COLORS.borderLight,
  },
  loadingContainer: {
    marginTop: theme.SIZES.margin.lg,
    padding: theme.SIZES.padding.md,
    backgroundColor: theme.COLORS.gray100,
    borderRadius: theme.SIZES.radius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingText: { ...theme.FONTS.bodySmall, color: theme.COLORS.primary, marginLeft: 8 },
});

export default memo(MpinCreateScreen);
