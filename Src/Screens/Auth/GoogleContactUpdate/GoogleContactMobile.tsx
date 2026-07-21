// Src/Screens/Auth/GoogleContactUpdate/GoogleContactMobile.tsx
// -----------------------------------------------------------------------------
// Collects a mobile number for Google-signup users, then sends an OTP.
// Premium champagne-gold design matching the Login screen. All auth logic
// (requestGoogleOtp + navigation) is preserved.
// -----------------------------------------------------------------------------

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import useAuth from '../../../api/hooks/Auth/useAuth';
import theme from '../../../Utills/AppTheme';
import CommonHeader from '../../../Components/CommonHeader/CommonHeader';
import LuxuryInput from '../Login/components/LuxuryInput';
import LoginButton from '../Login/components/LoginButton';
import GoldParticles from '../Login/components/GoldParticles';

const { COLORS, SIZES, FONTS, SHADOWS } = theme;
const { width, height } = Dimensions.get('window');

const BG_GRADIENT = COLORS.gradient.champagneSurface as [string, string, string];
const MEDALLION_GRADIENT = COLORS.gradient.champagneGold as [string, string, string];
const MEDALLION = SIZES.icon.xxxxl + SIZES.md;

interface Props {
  route: { params: { userId?: string; googleData?: any } };
  navigation: any;
}

const GoogleContactMobileScreen = ({ route, navigation }: Props) => {
  const { userId, googleData } = route.params;
  const resolvedUserId = userId ?? googleData?.userId;
  const { requestGoogleOtp, loading, error } = useAuth();

  const [mobile, setMobile] = useState('');
  const [touched, setTouched] = useState(false);

  const localError = touched && mobile.length !== 10 ? 'Enter a valid 10-digit mobile number' : undefined;

  const enter = useSharedValue(0);
  useEffect(() => {
    enter.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) });
  }, [enter]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: interpolate(enter.value, [0, 1], [28, 0]) }],
  }));

  const handleSendOtp = async () => {
    setTouched(true);
    if (!mobile || mobile.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
      return;
    }

    const result: any = await requestGoogleOtp({ userId: resolvedUserId, newContactNumber: mobile });

    if (!result?.error) {
      Alert.alert('OTP Sent', `Verification code has been sent to ${mobile}`, [{ text: 'OK' }]);
      console.log('Navigating to GoogleContactVerify with userId:',result);
      navigation.navigate('GoogleContactVerify', { userId: resolvedUserId, mobile });
    }
  };

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient colors={BG_GRADIENT} style={StyleSheet.absoluteFill} />
        <GoldParticles width={width} height={height} />
      </View>

      <CommonHeader title="Update Contact" transparent borderBottom={false} shadow={false} />

      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <Animated.View style={contentStyle}>
              <View style={styles.medallionWrap}>
                <LinearGradient colors={MEDALLION_GRADIENT} style={styles.medallion} start={{ x: 0.1, y: 0.1 }} end={{ x: 0.9, y: 0.9 }}>
                  <View style={styles.medallionInner}>
                    <MaterialCommunityIcons name="cellphone-check" size={SIZES.icon.xxl} color={COLORS.accentDark} />
                  </View>
                </LinearGradient>
              </View>

              <Text style={styles.title}>Enter Mobile Number</Text>
              <Text style={styles.subtitle}>
                Add your mobile number to secure your account and receive scheme updates.
              </Text>

              <View style={styles.form}>
                <LuxuryInput
                  icon="cellphone"
                  value={mobile}
                  onChangeText={(v) => setMobile(v.replace(/\D/g, '').slice(0, 10))}
                  onBlur={() => setTouched(true)}
                  placeholder="Mobile Number"
                  keyboardType="number-pad"
                  textContentType="telephoneNumber"
                  maxLength={10}
                  editable={!loading}
                  error={localError || error || undefined}
                  accessibilityLabel="Mobile number"
                  returnKeyType="done"
                  onSubmitEditing={handleSendOtp}
                />

                <View style={styles.infoBox}>
                  <MaterialCommunityIcons name="information-outline" size={SIZES.icon.sm} color={COLORS.accentDark} />
                  <Text style={styles.infoText}>We&apos;ll send a 6-digit verification code to this number.</Text>
                </View>

                <LoginButton
                  label="Send Verification Code"
                  onPress={handleSendOtp}
                  loading={loading}
                  disabled={loading || mobile.length < 10}
                  icon="send"
                />

                <View style={styles.securityNote}>
                  <MaterialCommunityIcons name="shield-lock" size={SIZES.icon.xs} color={COLORS.accentDark} />
                  <Text style={styles.securityText}>Your information is secure and encrypted.</Text>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default GoogleContactMobileScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SIZES.padding.container,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.xl,
  },
  medallionWrap: {
    alignSelf: 'center',
    borderRadius: MEDALLION / 2,
    ...SHADOWS.goldStrong,
    shadowColor: COLORS.accent,
    marginBottom: SIZES.lg,
  },
  medallion: {
    width: MEDALLION,
    height: MEDALLION,
    borderRadius: MEDALLION / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medallionInner: {
    width: MEDALLION - SIZES.md,
    height: MEDALLION - SIZES.md,
    borderRadius: (MEDALLION - SIZES.md) / 2,
    backgroundColor: COLORS.whiteOpacity80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.heading.h3,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.md,
    lineHeight: SIZES.font.md * 1.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.sm,
    marginBottom: SIZES.xl,
    paddingHorizontal: SIZES.md,
  },
  form: {
    marginTop: SIZES.xs,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentOpacity20,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.md,
    marginBottom: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.accentOpacity30,
  },
  infoText: {
    fontFamily: FONTS.family.medium,
    fontSize: SIZES.font.sm,
    color: COLORS.textPrimary,
    flex: 1,
    marginLeft: SIZES.sm,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.lg,
  },
  securityText: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    marginLeft: SIZES.xs,
  },
});
