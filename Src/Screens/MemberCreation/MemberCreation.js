import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import UserRegistrationForm from "./UserRegistrationForm";
import SchemeJoiningForm from "./SchemeJoiningForm";
import { useCreateMember } from "../../Hooks/useMemberCreate";
import { useRazorpayPayment } from "../../Hooks/useRazorPay";
import PaymentModal from "./PaymentModal"; // Extract to separate component

// Constants
const STEPS = {
  REGISTRATION: 1,
  SCHEME_JOINING: 2
};

const MemberCreation = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { scheme } = route.params || {};

  // State
  const [currentStep, setCurrentStep] = useState(STEPS.REGISTRATION);
  const [userRegistrationData, setUserRegistrationData] = useState({});
  const [schemeJoiningData, setSchemeJoiningData] = useState(null);

  // Refs
  const registrationFormRef = useRef();
  const schemeFormRef = useRef();

  // Hooks
  const { create, loading: createLoading } = useCreateMember();
  const { 
    loading: paymentLoading, 
    startPayment,
    paymentStep,
    error: paymentError,
    resetState: resetPayment,
    PAYMENT_STEPS
  } = useRazorpayPayment();

  // Reset state on screen focus
  useFocusEffect(
    useCallback(() => {
      resetForm();
    }, [])
  );

  const resetForm = () => {
    setCurrentStep(STEPS.REGISTRATION);
    setUserRegistrationData({});
    setSchemeJoiningData(null);
    resetPayment();
  };

  const handleRegistrationSubmit = useCallback((formData) => {
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
      const isValid = registrationFormRef.current.validateAndSubmit();
      if (isValid) {
        setCurrentStep(STEPS.SCHEME_JOINING);
      }
    }
  }, [currentStep]);

  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split("-");
    return day && month && year ? `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}` : "";
  }, []);

  const createMemberPayload = useCallback((formData, paymentId, orderId) => {
    const user = userRegistrationData;
    const aadhaar = user.aadharNumber?.replace(/\s/g, "") || "";
    const maskedAadhaar = aadhaar.length >= 4 ? `XXXX-XXXX-${aadhaar.slice(-4)}` : "";
    const nowDateTime = new Date().toISOString().slice(0, 10) + " 00:00:00";

    return {
      newMember: {
        title: user.title || "Mr",
        initial: (user.userName?.[0] || "K").toUpperCase(),
        pName: user.userName || "NA",
        sName: user.lastName || "NA",
        doorNo: user.doorNo || "",
        address1: user.street || "",
        address2: "",
        area: user.area || "",
        city: user.city || "",
        state: (user.state || "Tamil Nadu").replace(/\s+/g, " "),
        country: "India",
        pinCode: user.pincode || "",
        mobile: user.mobileNumber || "",
        mobile2: user.nomineeMobile || "",
        nomeni: user.nomineeName || "",
        nomineeMobile: user.nomineeMobile || "",
        nomineeRelationship: "Spouse",
        nomAddr1: user.street || "",
        nomAddr2: "",
        nomCity: user.city || "",
        nomState: (user.state || "Tamil Nadu").replace(/\s+/g, " "),
        nomPincode: user.pincode || "",
        nomCountry: "India",
        idProof: "Aadhaar",
        idProofNo: aadhaar,
        aadhaarMasked: maskedAadhaar,
        panNumber: user.panNumber || "",
        dob: formatDate(user.dob),
        email: user.emailAddress || "",
        mobileVerified: true,
        aadhaarVerified: true,
        nomineeMobileVerified: true,
        nomineeAadhaarVerified: false,
        upDateTime: nowDateTime,
        userId: "999",
        appVer: "WEB",
        anniversaryDate: formatDate(user.anniversaryDate),
      },
      createSchemeSummary: {
        schemeId: formData.schemeId || 0,
        groupCode: formData.selectedScheme || "",
        regNo: 1,
        joinDate: nowDateTime,
        upDateTime2: nowDateTime,
        openingDate: nowDateTime,
        userId2: "999",
      },
      schemeCollectInsert: {
        amount: formData.amount || 0,
        modePay: (formData.paymentType?.[0] || "O").toUpperCase(),
        accCode: "00001",
        chqBankCode: "1",
        chqCardNo: paymentId || "",
        chqBranch: "Razorpay",
        chkBank: "Razorpay",
        chqRtnReason: orderId || "",
      },
      referralCode: "KIRUB001",
    };
  }, [userRegistrationData, formatDate]);

  const handleMemberCreation = useCallback(async (formData, paymentId, orderId) => {
    try {
      const payload = createMemberPayload(formData, paymentId, orderId);
      console.log('Creating member with payload:', payload);

      const response = await create(payload);
      
      Alert.alert(
        "Success",
        `Member created successfully!\n\nPersonal ID: ${response.message?.personalId || ""}\nScheme: ${formData.schemeName || ""}\nAmount: ₹${formData.amount || 0}`,
        [{ text: "OK", onPress: () => navigation.navigate("Home") }]
      );
    } catch (error) {
      console.error('Member creation error:', error);
      Alert.alert("Error", error.message || "Failed to create member");
    }
  }, [create, createMemberPayload, navigation]);

  const handleSubmit = useCallback(async () => {
    if (currentStep !== STEPS.SCHEME_JOINING || !schemeFormRef.current) return;

    const isValid = schemeFormRef.current.validateAndSubmit();
    if (!isValid) return;

    const formData = schemeFormRef.current.getFormData();
    
    // Get values with fallbacks
    const regNo = formData.regNo || "3";
    const groupCode = formData.selectedScheme || formData.groupCode || "MAN";

    const result = await startPayment(
      formData.amount,
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
    } else {
      Alert.alert("Payment Failed", result.message);
    }
  }, [currentStep, userRegistrationData, startPayment, handleMemberCreation]);

  const isLoading = createLoading || paymentLoading;

  return (
    <View style={styles.container}>
      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {currentStep === STEPS.REGISTRATION ? (
          <UserRegistrationForm
            ref={registrationFormRef}
            onSubmit={handleRegistrationSubmit}
            initialData={userRegistrationData}
          />
        ) : (
          <SchemeJoiningForm
            ref={schemeFormRef}
            scheme={scheme}
            initialData={schemeJoiningData}
          />
        )}
      </ScrollView>

      {/* Payment Status Modal */}
      <PaymentModal 
        visible={paymentStep === PAYMENT_STEPS.CREATING_ORDER || 
                 paymentStep === PAYMENT_STEPS.VERIFYING}
        step={paymentStep}
        error={paymentError}
      />

      {/* Loading Overlay */}
      {isLoading && paymentStep === PAYMENT_STEPS.IDLE && (
        <LoadingOverlay message={createLoading ? "Creating Member..." : "Processing..."} />
      )}

      {/* Navigation Buttons */}
      <NavigationButtons
        currentStep={currentStep}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </View>
  );
};

// Sub-components for better organization
const StepIndicator = ({ currentStep }) => (
  <View style={styles.stepIndicator}>
    <View style={styles.stepRow}>
      {[1, 2].map((step) => (
        <React.Fragment key={step}>
          <View style={[styles.stepCircle, currentStep >= step && styles.activeStep]}>
            <Text style={[styles.stepNumber, currentStep >= step && styles.activeStepText]}>
              {step}
            </Text>
          </View>
          {step === 1 && (
            <View style={[styles.stepLine, currentStep >= 2 && styles.activeStepLine]} />
          )}
        </React.Fragment>
      ))}
    </View>
    <View style={styles.stepLabels}>
      <Text style={[styles.stepLabel, currentStep >= 1 && styles.activeStepLabel]}>
        Registration
      </Text>
      <Text style={[styles.stepLabel, currentStep >= 2 && styles.activeStepLabel]}>
        Scheme Joining
      </Text>
    </View>
  </View>
);

const LoadingOverlay = ({ message }) => (
  <View style={styles.loadingOverlay}>
    <ActivityIndicator size="large" color="#4CAF50" />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

const NavigationButtons = ({ currentStep, onBack, onNext, onSubmit, isLoading }) => (
  <View style={styles.navigationContainer}>
    <TouchableOpacity
      style={[styles.navButton, styles.backButton]}
      onPress={onBack}
      disabled={isLoading}
    >
      <Text style={styles.backButtonText}>
        {currentStep === 1 ? "Cancel" : "Back"}
      </Text>
    </TouchableOpacity>

    {currentStep === 1 ? (
      <TouchableOpacity
        style={[styles.navButton, styles.nextButton]}
        onPress={onNext}
        disabled={isLoading}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        style={[styles.navButton, styles.submitButton]}
        onPress={onSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Pay & Continue</Text>
        )}
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  stepIndicator: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  activeStep: {
    backgroundColor: "#4CAF50",
  },
  stepNumber: {
    color: "#757575",
    fontWeight: "bold",
    fontSize: 14,
  },
  activeStepText: {
    color: "#FFFFFF",
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 10,
  },
  activeStepLine: {
    backgroundColor: "#4CAF50",
  },
  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  stepLabel: {
    fontSize: 12,
    color: "#9E9E9E",
    textAlign: "center",
    flex: 1,
  },
  activeStepLabel: {
    color: "#4CAF50",
    fontWeight: "500",
  },
  navigationContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  backButton: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  backButtonText: {
    color: "#757575",
    fontWeight: "600",
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: "#2196F3",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default MemberCreation;