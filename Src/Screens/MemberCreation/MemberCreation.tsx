// Src/Screens/MemberCreation/MemberCreation.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, useFocusEffect, RouteProp } from '@react-navigation/native';
import UserRegistrationForm, { UserRegistrationFormData, UserRegistrationFormRef } from './UserRegistrationForm';
import SchemeJoiningForm, { SchemeJoiningFormRef } from './SchemeJoiningForm';
import { useMemberActions } from '../../api/hooks/Member/useMemberCreate';
import { useRazorpayPayment } from '../../api/hooks/Razorpay/useRazorpay';
import PaymentModal from './PaymentModal';
import RazorpayWebView from '../../Components/RazorpayWebView';
import CommonHeader from '../../Components/CommonHeader/CommonHeader';
import { getUserId, getUserField } from '../../Utills/AsynchStorageHelper';
import { Scheme } from '../../types/Scheme/Scheme';
import { CreateMemberPayload } from '../../types/Member/Member';

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
  const { handleCreateMember: create, loading: createLoading } = useMemberActions();
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

  // Reset state on screen focus
  useFocusEffect(
    useCallback(() => {
      resetForm();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
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
    (formData: any, paymentId?: string, orderId?: string): CreateMemberPayload => {
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
          panNumber: user.panNumber || '',
          dob: formatDate(user.dob),
          email: user.emailAddress || '',
          mobileVerified: true,
          aadhaarVerified: true,
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
          upDateTime2: nowDateTime,
          openingDate: nowDateTime,
          userId2: currentUserId || '0',
        },
        schemeCollectInsert: {
          amount: formData.amount || 0,
          modePay: 4,
          accCode: '00001',
          chqBankCode: 4,
          chqCardNo: paymentId || '',
          chqBranch: 'Online',
          chkBank: 'Razorpay',
          chqRtnReason: orderId || '',
        },
        ...(currentReferralCode ? { referralCode: currentReferralCode } : {}),
      };
    },
    [userRegistrationData, formatDate, currentUserId, currentReferralCode]
  );

  const handleMemberCreation = useCallback(
    async (formData: any, paymentId?: string, orderId?: string) => {
      try {
        const payload = createMemberPayload(formData, paymentId, orderId);
        console.log('Creating member with payload:', payload);

        const response: any = await create(payload);

        // Parse the message string into an object
        const msgStr = response?.message || '';
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
      } catch (error: any) {
        console.error('Member creation error:', error);
        Alert.alert('Error', error?.message || 'Failed to create member');
      }
    },
    [create, createMemberPayload, navigation]
  );

  const handleSubmit = useCallback(async () => {
    if (currentStep !== STEPS.SCHEME_JOINING || !schemeFormRef.current) return;

    const isValid = schemeFormRef.current.validateAndSubmit();
    if (!isValid) return;

    const formData = schemeFormRef.current.getFormData();
    const regNo = 3;
    const groupCode = formData.selectedScheme || 'MAN';

    const result = await startPayment(
      formData.amount || 0,
      {
        name: userRegistrationData.userName,
        phone: userRegistrationData.mobileNumber,
        email: userRegistrationData.emailAddress,
      },
      regNo,
      groupCode
    );

    if (result.success) {
      await handleMemberCreation(formData, result.paymentId, result.orderId);
    } else if (result.message !== 'Payment cancelled by user') {
      Alert.alert('Payment Failed', result.message || 'Payment failed');
    }
  }, [currentStep, userRegistrationData, startPayment, handleMemberCreation]);

  const isLoading = createLoading || paymentLoading;

  return (
    <View style={styles.container}>
      <CommonHeader title="Member Creation" showBack onBackPress={handleBack} />

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {currentStep === STEPS.REGISTRATION ? (
          <UserRegistrationForm ref={registrationFormRef} onSubmit={handleRegistrationSubmit} initialData={userRegistrationData} />
        ) : (
          <SchemeJoiningForm ref={schemeFormRef} scheme={scheme} initialData={schemeJoiningData} />
        )}
      </ScrollView>

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
        <LoadingOverlay message={createLoading ? 'Creating Member...' : 'Processing...'} />
      )}

      {/* Navigation Buttons */}
      <NavigationButtons currentStep={currentStep} onBack={handleBack} onNext={handleNext} onSubmit={handleSubmit} isLoading={isLoading} />
    </View>
  );
};

// Sub-components for better organization
const StepIndicator = ({ currentStep }: { currentStep: Step }) => (
  <View style={styles.stepIndicator}>
    <View style={styles.stepRow}>
      {[1, 2].map((step) => (
        <React.Fragment key={step}>
          <View style={[styles.stepCircle, currentStep >= step && styles.activeStep]}>
            <Text style={[styles.stepNumber, currentStep >= step && styles.activeStepText]}>{step}</Text>
          </View>
          {step === 1 && <View style={[styles.stepLine, currentStep >= 2 && styles.activeStepLine]} />}
        </React.Fragment>
      ))}
    </View>
    <View style={styles.stepLabels}>
      <Text style={[styles.stepLabel, currentStep >= 1 && styles.activeStepLabel]}>Registration</Text>
      <Text style={[styles.stepLabel, currentStep >= 2 && styles.activeStepLabel]}>Scheme Joining</Text>
    </View>
  </View>
);

const LoadingOverlay = ({ message }: { message: string }) => (
  <View style={styles.loadingOverlay}>
    <ActivityIndicator size="large" color="#4CAF50" />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

interface NavigationButtonsProps {
  currentStep: Step;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const NavigationButtons = ({ currentStep, onBack, onNext, onSubmit, isLoading }: NavigationButtonsProps) => (
  <View style={styles.navigationContainer}>
    <TouchableOpacity style={[styles.navButton, styles.backButton]} onPress={onBack} disabled={isLoading}>
      <Text style={styles.backButtonText}>{currentStep === 1 ? 'Cancel' : 'Back'}</Text>
    </TouchableOpacity>

    {currentStep === 1 ? (
      <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={onNext} disabled={isLoading}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity style={[styles.navButton, styles.submitButton]} onPress={onSubmit} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitButtonText}>Pay & Continue</Text>}
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  stepIndicator: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: '#4CAF50',
  },
  stepNumber: {
    color: '#757575',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeStepText: {
    color: '#FFFFFF',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
  },
  activeStepLine: {
    backgroundColor: '#4CAF50',
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  stepLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
    flex: 1,
  },
  activeStepLabel: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  navigationContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  backButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  backButtonText: {
    color: '#757575',
    fontWeight: '600',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#2196F3',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MemberCreation;
