// Src/Screens/MemberCreation/MemberCreation.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, useNavigation, useFocusEffect, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UserRegistrationForm, { UserRegistrationFormData, UserRegistrationFormRef } from './UserRegistrationForm';
import SchemeJoiningForm, { SchemeJoiningFormRef } from './SchemeJoiningForm';
import { useRazorpayPayment } from '../../api/hooks/Razorpay/useRazorpay';
import PaymentModal from './PaymentModal';
import RazorpayWebView from '../../Components/RazorpayWebView';
import CommonHeader from '../../Components/CommonHeader/CommonHeader';
import PremiumBackground from '../../Components/PremiumBackground/PremiumBackground';
import { getUserId, getUserField } from '../../Utills/AsynchStorageHelper';
import { Scheme } from '../../types/Scheme/Scheme';
import { CreateMemberPayload } from '../../types/Member/Member';
import { AppButton, AppText } from '../../Components/ui/appcomponents';
import theme from '../../Utills/AppTheme';

const { COLORS, SIZES, FONTS, ELEVATION } = theme;

// Constants
const STEPS = {
  REGISTRATION: 1,
  SCHEME_JOINING: 2,
} as const;

type Step = (typeof STEPS)[keyof typeof STEPS];

type MemberCreationRouteParams = { scheme?: Scheme } | undefined;

const MemberCreation = () => {
  const route = useRoute<RouteProp<Record<string, MemberCreationRouteParams>, string>>();
  const navigation = useNavigation<any>();
  const { scheme } = route.params || {};

  // State
  const [currentStep, setCurrentStep] = useState<Step>(STEPS.REGISTRATION);
  const [userRegistrationData, setUserRegistrationData] = useState<Partial<UserRegistrationFormData>>({});
  const [schemeJoiningData] = useState(null);
  const [currentUserId, setCurrentUserId] = useState<string | number | null>(null);
  const [currentReferralCode, setCurrentReferralCode] = useState('');

  // Refs
  const registrationFormRef = useRef<UserRegistrationFormRef>(null);
  const schemeFormRef = useRef<SchemeJoiningFormRef>(null);

  // Hooks
  const {
    loading: paymentLoading,
    startPayment,
    paymentStep,
    error: paymentError,
    resetState: resetPayment,
    PAYMENT_STEPS,
    webViewVisible,
    razorpayOptions,
    handlePaymentSuccess,
    handlePaymentDismiss,
  } = useRazorpayPayment();

  // Reset state on screen focus — but ONLY when not mid-payment.
  // If the user switches to a UPI app and comes back, useFocusEffect fires
  // again and was resetting the entire payment state while the WebView was
  // still open, killing the in-flight payment.
  useFocusEffect(
    useCallback(() => {
      if (!webViewVisible && paymentStep === PAYMENT_STEPS.IDLE) {
        resetForm();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [webViewVisible, paymentStep])
  );

  // Load the logged-in user's id / referral code once for the payload
  useEffect(() => {
    (async () => {
      try {
        const [uid, refCode] = await Promise.all([getUserId(), getUserField('referralCode')]);
        if (uid) setCurrentUserId(uid);
        if (refCode) setCurrentReferralCode(refCode);
      } catch (e) {
        console.log('Failed to load user id/referral code', e);
      }
    })();
  }, []);

  const resetForm = () => {
    setCurrentStep(STEPS.REGISTRATION);
    setUserRegistrationData({});
    resetPayment();
  };

  const handleRegistrationSubmit = useCallback((formData: UserRegistrationFormData) => {
    console.log('[SCHEME JOIN] STEP 1 — User registration form submitted', { name: formData.userName, mobile: formData.mobileNumber });
    setUserRegistrationData(formData);
    setCurrentStep(STEPS.SCHEME_JOINING);
  }, []);

  const handleBack = useCallback(() => {
    if (currentStep === STEPS.SCHEME_JOINING) {
      setCurrentStep(STEPS.REGISTRATION);
    } else {
      navigation.goBack();
    }
  }, [currentStep, navigation]);

  const handleNext = useCallback(() => {
    if (currentStep === STEPS.REGISTRATION && registrationFormRef.current) {
      registrationFormRef.current.validateAndSubmit();
    }
  }, [currentStep]);

  const formatDate = useCallback((dateStr?: string | null): string | null => {
    if (!dateStr) return null;

    // If already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    // If in DD-MM-YYYY format
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('-');
      return `${year}-${month}-${day}`;
    }

    // Fallback (handles Date objects or other formats)
    const date = new Date(dateStr);
    if (!isNaN(date as any)) {
      return date.toISOString().split('T')[0];
    }

    return null;
  }, []);

  const createMemberPayload = useCallback(
    (formData: any): CreateMemberPayload => {
      const user = userRegistrationData;
      const aadhaar = user.aadharNumber?.replace(/\s/g, '') || '';
      const maskedAadhaar = aadhaar.length >= 4 ? `XXXX-XXXX-${aadhaar.slice(-4)}` : '';
      const nowDateTime = new Date().toISOString().slice(0, 10) + ' 00:00:00';

      return {
        newMember: {
          title: 'Mr',
          initial: (user.userName?.[0] || 'K').toUpperCase(),
          pName: user.userName || 'NA',
          sName: user.lastName || 'NA',
          doorNo: user.doorNo || '',
          address1: user.street || '',
          address2: '',
          area: user.area || '',
          city: user.city || '',
          state: (user.state || 'Tamil Nadu').replace(/\s+/g, ' '),
          country: 'India',
          pinCode: user.pincode || '',
          mobile: user.mobileNumber || '',
          mobile2: user.nomineeMobile || '',
          nomeni: user.nomineeName || '',
          nomineeMobile: user.nomineeMobile || '',
          nomineeRelationship: user.nomineeRelationship || '',
          nomAddr1: user.street || '',
          nomAddr2: '',
          nomCity: user.city || '',
          nomState: (user.state || 'Tamil Nadu').replace(/\s+/g, ' '),
          nomPincode: user.pincode || '',
          nomCountry: 'India',
          idProof: 'Aadhaar',
          idProofNo: aadhaar,
          aadhaarMasked: maskedAadhaar,
          // Backend NewMember model calls this field "panno", not "panNumber" —
          // sending the wrong key throws a Jackson UnrecognizedPropertyException
          // and silently kills the entire member creation (caught only inside
          // processPendingPayment's error handling on the backend).
          panno: user.panNumber || '',
          dob: formatDate(user.dob),
          email: user.emailAddress || '',
          // mobileVerified/aadhaarVerified deliberately omitted — the backend's
          // NewMember model has no such fields for the primary member (only
          // nomineeMobileVerified/nomineeAadhaarVerified exist), so sending them
          // causes the same unrecognized-field failure as panNumber did.
          nomineeMobileVerified: true,
          nomineeAadhaarVerified: false,
          upDateTime: nowDateTime,
          userId: currentUserId || '0',
          appVer: 'WEB',
          anniversaryDate: formatDate(user.anniversaryDate),
        },
        createSchemeSummary: {
          schemeId: formData.schemeId || 0,
          groupCode: formData.selectedScheme || '',
          regNo: 1,
          joinDate: nowDateTime,
          // Backend CreateSchemeSummary model calls these "updateTime"/"userId",
          // not "upDateTime2"/"userId2" — same unrecognized-field failure mode.
          updateTime: nowDateTime,
          openingDate: nowDateTime,
          userId: currentUserId || '0',
        },
        schemeCollectInsert: {
          amount: formData.amount || 0,
          modePay: 4,
          accCode: '00001',
          chqBankCode: 4,
          // Payment/order id aren't known yet — this payload is built and
          // parked server-side BEFORE the Razorpay order (and therefore the
          // payment id) exists.
          chqCardNo: '',
          chqBranch: 'Online',
          chkBank: 'Razorpay',
          chqRtnReason: '',
        },
        ...(currentReferralCode ? { referralCode: currentReferralCode } : {}),
      };
    },
    [userRegistrationData, formatDate, currentUserId, currentReferralCode]
  );

  // The backend returns the parked-payload outcome as a stringified map,
  // e.g. "PROCESSED: {status=Success, personalId=123, regNo=45, ...}" once
  // the member has actually been created (either via this /verify-payment
  // call, or — if the webhook beat it to it — already done by the time we
  // ask). Parse that instead of calling member/create ourselves.
  const showMemberCreatedAlert = useCallback(
    (formData: any, processResult?: string) => {
      const msgStr = (processResult || '').replace(/^PROCESSED:\s*/, '');

      // processResult can still come back empty in rare cases where the backend's
      // brief poll (for a webhook that beat us to processing) times out before the
      // member insert finishes. The payment itself is confirmed either way — don't
      // show fabricated dashes as if we have real member details when we don't.
      if (!msgStr) {
        Alert.alert(
          '✅ Payment Successful',
          `Your payment for ${formData.schemeName || 'the scheme'} was received. We're finishing up your member record — check "My Schemes" in a moment if the details don't appear immediately.`,
          [{ text: 'OK', onPress: () => navigation.navigate('MainDrawer') }]
        );
        return;
      }

      const parsed: Record<string, string> = {};
      msgStr
        .replace(/[{}]/g, '')
        .split(', ')
        .forEach((pair: string) => {
          const [key, ...rest] = pair.split('=');
          if (key) parsed[key.trim()] = rest.join('=').trim();
        });

      Alert.alert(
        '✅ Member Created Successfully',
        `Personal ID: ${parsed.personalId || '-'}\nReg No: ${parsed.regNo || '-'}\nGroup Code: ${parsed.groupCode || '-'}\nScheme: ${formData.schemeName || '-'}\nAmount: ₹${parsed.amount || formData.amount || 0}\nReceipt No: ${parsed.sno || '-'}`,
        [{ text: 'OK', onPress: () => navigation.navigate('MainDrawer') }]
      );
    },
    [navigation]
  );

  const handleSubmit = useCallback(async () => {
    // Guard: prevent double-tap / re-entry while payment is already in flight
    if (paymentLoading) return;
    if (currentStep !== STEPS.SCHEME_JOINING || !schemeFormRef.current) return;

    const isValid = schemeFormRef.current.validateAndSubmit();
    if (!isValid) return;

    const formData = schemeFormRef.current.getFormData();
    const regNo = 3;
    const groupCode = formData.selectedScheme || 'MAN';

    console.log('[SCHEME JOIN] STEP 2 — Scheme joining form submitted', { scheme: formData.schemeName, groupCode, amount: formData.amount });

    // Built up front and sent as NMDATA on create-order (NEWJOIN=true) —
    // the backend parks it and creates the member automatically once
    // payment is confirmed. There's no more separate member/create call.
    const nmData = createMemberPayload(formData);
    console.log('[SCHEME JOIN] STEP 2 — Member payload built (NMDATA)', { pName: nmData.newMember.pName, schemeId: nmData.createSchemeSummary.schemeId });

    const result = await startPayment(
      formData.amount || 0,
      {
        name: userRegistrationData.userName,
        phone: userRegistrationData.mobileNumber,
        email: userRegistrationData.emailAddress,
      },
      regNo,
      groupCode,
      { newJoin: true, nmData }
    );

    if (result.success) {
      console.log('[SCHEME JOIN] STEP 8 — Flow complete. Showing success alert.', { processResult: result.processResult });
      showMemberCreatedAlert(formData, result.processResult);
    } else if (result.message !== 'Payment cancelled by user') {
      console.log('[SCHEME JOIN] FLOW FAILED —', result.message);
      Alert.alert('Payment Failed', result.message || 'Payment failed');
    }
  }, [currentStep, userRegistrationData, startPayment, createMemberPayload, showMemberCreatedAlert]);

  const isLoading = paymentLoading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <PremiumBackground />
      <CommonHeader title="Member Creation" showBack onBackPress={handleBack} transparent borderBottom={false} shadow={false} />

      {/* Step Indicator */}
      {/* <StepIndicator currentStep={currentStep} /> */}

        <View style={styles.scrollView}>
        {currentStep === STEPS.REGISTRATION ? (
          <UserRegistrationForm ref={registrationFormRef} onSubmit={handleRegistrationSubmit} initialData={userRegistrationData} />
        ) : (
          <SchemeJoiningForm
            ref={schemeFormRef}
            scheme={scheme}
            initialData={schemeJoiningData}
            userData={userRegistrationData}
          />
        )}
      </View>

      {/* Razorpay Checkout WebView */}
      <RazorpayWebView visible={webViewVisible} options={razorpayOptions} onSuccess={handlePaymentSuccess} onDismiss={handlePaymentDismiss} />

      {/* Payment Status Modal */}
      <PaymentModal
        visible={paymentStep === PAYMENT_STEPS.CREATING_ORDER || paymentStep === PAYMENT_STEPS.VERIFYING}
        step={paymentStep}
        error={paymentError}
      />

      {/* Loading Overlay */}
      {isLoading && paymentStep === PAYMENT_STEPS.IDLE && (
        <LoadingOverlay message="Processing..." />
      )}

      {/* Navigation Buttons */}
      <NavigationButtons currentStep={currentStep} onBack={handleBack} onNext={handleNext} onSubmit={handleSubmit} isLoading={isLoading} />
    </KeyboardAvoidingView>
  );
};

// Sub-components for better organization
// const StepIndicator = ({ currentStep }: { currentStep: Step }) => (
//   <View style={styles.stepIndicator}>
//     <View style={styles.stepRow}>
//       {[1, 2].map((step) => (
//         <React.Fragment key={step}>
//           <View style={[styles.stepCircle, currentStep >= step && styles.activeStep]}>
//             <AppText variant="bodyBold" color={currentStep >= step ? COLORS.surface : COLORS.contentSecondary}>
//               {step}
//             </AppText>
//           </View>
//           {step === 1 && <View style={[styles.stepLine, currentStep >= 2 && styles.activeStepLine]} />}
//         </React.Fragment>
//       ))}
//     </View>
//     <View style={styles.stepLabels}>
//       <AppText variant="caption" color={currentStep >= 1 ? COLORS.accent : COLORS.contentSecondary} align="center" style={styles.stepLabelFlex}>
//         Registration
//       </AppText>
//       <AppText variant="caption" color={currentStep >= 2 ? COLORS.accent : COLORS.contentSecondary} align="center" style={styles.stepLabelFlex}>
//         Scheme Joining
//       </AppText>
//     </View>
//   </View>
// );

const LoadingOverlay = ({ message }: { message: string }) => (
  <View style={styles.loadingOverlay}>
    <ActivityIndicator size="large" color={COLORS.contentOnInverse} />
    <AppText variant="bodyBold" color={COLORS.contentOnBrand} style={{ marginTop: SIZES.space.sm }}>
      {message}
    </AppText>
  </View>
);

interface NavigationButtonsProps {
  currentStep: Step;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const NavigationButtons = ({ currentStep, onBack, onNext, onSubmit, isLoading }: NavigationButtonsProps) => {
  const insets = useSafeAreaInsets();
  return (
  <View style={[styles.navigationContainer, { paddingBottom: Math.max(insets.bottom, SIZES.space.md) }]}>
    <AppButton
      label={currentStep === 1 ? 'Cancel' : 'Back'}
      variant="outline"
      onPress={onBack}
      disabled={isLoading}
      fullWidth={false}
      style={styles.navButtonFlex}
    />

    {currentStep === 1 ? (
      <AppButton
        label="Next"
        variant="primary"
        onPress={onNext}
        disabled={isLoading}
        fullWidth={false}
        style={styles.navButtonFlex}
      />
    ) : (
      <AppButton
        label="Pay & Continue"
        variant="primary"
        onPress={onSubmit}
        loading={isLoading}
        disabled={isLoading}
        fullWidth={false}
        style={styles.navButtonFlex}
      />
    )}
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceMuted,
  },
  scrollView: {
    flex: 1,
  },
  stepIndicator: {
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.space.lg,
    paddingHorizontal: SIZES.space.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...ELEVATION.raised,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.space.sm,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: COLORS.brand,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: SIZES.space.sm,
  },
  activeStepLine: {
    backgroundColor: COLORS.brand,
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.space.sm,
  },
  stepLabelFlex: {
    flex: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingTop: SIZES.space.xl,
    paddingHorizontal: SIZES.space.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SIZES.space.sm,
  },
  navButtonFlex: {
    flex: 1,
    paddingBottom:10,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.scrimHeavy,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default MemberCreation;
