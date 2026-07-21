import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useMpin } from '../../../api/hooks/Mpin/useMpin';
import { useRegisterLoginCheckUser } from '../../../api/hooks/LoginCheck/useLoginCheck';
import { useToast, ToastTypes, ToastPositions } from '../../../Components/Toast/Toast';
import theme from '../../../Utills/AppTheme';
import { AppPinInput, AppPinInputRef } from '../../../Components/ui/appcomponents';
import MpinScaffold from '../Mpin/MpinScaffold';
import LoginButton from '../Login/components/LoginButton';

const { COLORS, SIZES, FONTS } = theme;
const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 60;

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

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
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
            { cancelable: false },
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
    [locked, loading, mpinValue, attempts, verifyMpin, navigation, showToast, register, resetMpin],
  );

  const handleMpinChange = useCallback(
    (value: string) => {
      if (locked || blockAutoSubmit) return;
      setMpinValue(value);
    },
    [locked, blockAutoSubmit],
  );

  const handleMpinComplete = useCallback(
    (value: string) => {
      if (locked || blockAutoSubmit) return;
      setTimeout(() => handleSubmit(value), 150);
    },
    [locked, blockAutoSubmit, handleSubmit],
  );

  const handleForgotMpin = useCallback(() => {
    if (locked) return;
    Alert.alert('Forgot MPIN?', 'Do you want to reset your MPIN?', [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => { resetMpin(); pinRef.current?.focus(); },
      },
      {
        text: 'Reset MPIN',
        style: 'destructive',
        onPress: () => {
          showToast({ message: 'Redirecting to MPIN reset...', type: ToastTypes.INFO, duration: 2000, position: ToastPositions.TOP });
          resetMpin();
          setAttempts(0);
          setTimeout(() => navigation.navigate('ForgotMpin'), 500);
        },
      },
    ]);
  }, [navigation, showToast, locked, resetMpin]);

  const isSubmitDisabled = loading || locked || blockAutoSubmit || mpinValue.length !== 4;

  return (
    <View style={styles.root}>
      <MpinScaffold
        headerTitle="Verify MPIN"
        icon="shield-key-outline"
        heading="Verify MPIN"
        subtitle="Enter your 4-digit security PIN to access your account"
        showBack={false}
      >
        {locked && (
          <View style={styles.lockBox}>
            <MaterialCommunityIcons name="lock-alert-outline" size={SIZES.icon.xl} color={COLORS.error} />
            <Text style={styles.lockTitle}>Account Temporarily Locked</Text>
            <Text style={styles.lockText}>Please wait {formatTime(lockTime)} before trying again</Text>
            <View style={styles.timerTrack}>
              <View style={[styles.timerFill, { width: `${(1 - lockTime / LOCK_DURATION) * 100}%` }]} />
            </View>
          </View>
        )}

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
          <Pressable style={styles.eyeBtn} onPress={() => setShowMpin(!showMpin)} hitSlop={10}>
            <MaterialCommunityIcons name={showMpin ? 'eye-off' : 'eye'} size={SIZES.icon.md} color={COLORS.accentDark} />
          </Pressable>
        </View>

        {attempts > 0 && !locked && (
          <View style={styles.attemptsRow}>
            <MaterialCommunityIcons name="alert-circle-outline" size={SIZES.icon.sm} color={COLORS.warning} />
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

        <Pressable
          onPress={handleForgotMpin}
          disabled={locked || blockAutoSubmit}
          style={[styles.forgotBtn, (locked || blockAutoSubmit) && styles.disabled]}
          hitSlop={8}
        >
          <MaterialCommunityIcons name="key-outline" size={SIZES.icon.sm} color={COLORS.accentDark} />
          <Text style={styles.forgotText}>Forgot MPIN?</Text>
        </Pressable>

        <View style={styles.footer}>
          <LoginButton
            label={locked ? 'Account Locked' : blockAutoSubmit ? 'Please Wait…' : 'Verify & Continue'}
            onPress={() => handleSubmit()}
            loading={loading}
            disabled={isSubmitDisabled}
            icon="shield-check"
          />
        </View>

        <View style={styles.secureRow}>
          <MaterialCommunityIcons name="shield-check" size={SIZES.icon.xs} color={COLORS.success} />
          <Text style={styles.secureText}>Your MPIN is stored securely on your device</Text>
        </View>
      </MpinScaffold>

      {/* Toast rendered at root level — outside ScrollView — so it always shows at top */}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  lockBox: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    marginBottom: SIZES.lg,
    borderWidth: 1,
    borderColor: `${COLORS.error}30`,
  },
  lockTitle: {
    fontFamily: FONTS.family.semiBold,
    fontSize: SIZES.font.lg,
    color: COLORS.error,
    marginTop: SIZES.sm,
  },
  lockText: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
  },
  timerTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray200,
    marginTop: SIZES.md,
    overflow: 'hidden',
  },
  timerFill: { height: '100%', borderRadius: 2, backgroundColor: COLORS.error },
  pinRow: { alignItems: 'center' },
  eyeBtn: { marginTop: SIZES.md, padding: SIZES.xs },
  attemptsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.md,
  },
  attemptsText: {
    fontFamily: FONTS.family.medium,
    fontSize: SIZES.font.sm,
    color: COLORS.warning,
    marginLeft: SIZES.xs,
    marginRight: SIZES.sm,
  },
  attemptsDots: { flexDirection: 'row' },
  attemptDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.gray300,
    marginHorizontal: 2,
  },
  attemptDotFilled: { backgroundColor: COLORS.error },
  forgotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.lg,
  },
  forgotText: {
    fontFamily: FONTS.family.semiBold,
    fontSize: SIZES.font.md,
    color: COLORS.accentDark,
    marginLeft: SIZES.xs,
  },
  disabled: { opacity: 0.5 },
  footer: { marginTop: SIZES.xl },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.lg,
  },
  secureText: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    marginLeft: SIZES.xs,
  },
});

export default MpinVerifyScreen;
