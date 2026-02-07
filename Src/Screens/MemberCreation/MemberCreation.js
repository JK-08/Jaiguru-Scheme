import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import UserRegistrationForm from "./UserRegistrationForm";
import SchemeJoiningForm from "./SchemeJoiningForm";
import { useCreateMember } from "../../Hooks/useMemberCreate";

const MemberCreation = () => {
  const route = useRoute();
  const { scheme } = route.params || {};
  const [currentStep, setCurrentStep] = useState(1);
  const [userRegistrationData, setUserRegistrationData] = useState({});
  const [schemeJoiningData, setSchemeJoiningData] = useState(null);
  const nowDateTime = new Date().toISOString().slice(0, 10) + " 00:00:00";
  const navigation = useNavigation();
  const { create, loading } = useCreateMember();
  useFocusEffect(
  useCallback(() => {
    setCurrentStep(1);
    setUserRegistrationData({});
    setSchemeJoiningData(null);
  }, [])
);


  const registrationFormRef = useRef();
  const schemeFormRef = useRef();

  const handleRegistrationSubmit = (formData) => {
    setUserRegistrationData(formData);
    setCurrentStep(2);
  };

  const handleSchemeSubmit = async (formData) => {
    setSchemeJoiningData(formData);
    
    // Prepare payload
    const user = userRegistrationData || {};
    
    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      const [day, month, year] = dateStr.split("-");
      if (!day || !month || !year) return "";
      return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    };

    const aadhaar = user.aadharNumber?.replace(/\s/g, "") || "";
    const maskedAadhaar =
      aadhaar.length >= 4 ? "XXXX-XXXX-" + aadhaar.slice(-4) : "";

    const dob = formatDate(user.dob);
    const anniversary = formatDate(user.anniversaryDate);

    const payload = {
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
        dob: dob,
        email: user.emailAddress || "",
        mobileVerified: true,
        aadhaarVerified: true,
        nomineeMobileVerified: true,
        nomineeAadhaarVerified: false,
        upDateTime: nowDateTime,
        userId: "999",
        appVer: "WEB",
        anniversaryDate: anniversary,
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
        chqCardNo: "7700201931983",
        chqBranch: "Phi Com Test",
        chkBank: "NB",
        chqRtnReason: "ORDER-2C63D28B94",
      },
      referralCode: "RANJI40191",
    };

    console.log("Payload to be sent:", JSON.stringify(payload));

    try {
      const res = await create(payload);
      console.log("API Response:", res);
      Alert.alert(
        "Success",
        `Member created successfully!\n\nPersonal ID: ${res.message?.personalId || ""}\nScheme: ${formData.schemeName || ""}\nAmount: ₹${formData.amount || 0}\nPayment Type: ${formData.paymentType || ""}`,
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Home"),
          },
        ]
      );
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to create member");
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (registrationFormRef.current) {
        const isValid = registrationFormRef.current.validateAndSubmit();
        if (isValid) {
          setCurrentStep(2);
        }
      }
    }
  };

  const handleSubmit = () => {
    if (currentStep === 2 && schemeFormRef.current) {
      schemeFormRef.current.validateAndSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <View style={styles.stepRow}>
          <View style={[styles.stepCircle, currentStep >= 1 && styles.activeStep]}>
            <Text style={[styles.stepNumber, currentStep >= 1 && styles.activeStepText]}>1</Text>
          </View>
          <View style={[styles.stepLine, currentStep >= 2 && styles.activeStepLine]} />
          <View style={[styles.stepCircle, currentStep >= 2 && styles.activeStep]}>
            <Text style={[styles.stepNumber, currentStep >= 2 && styles.activeStepText]}>2</Text>
          </View>
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {currentStep === 1 ? (
          <UserRegistrationForm 
            ref={registrationFormRef}
            onSubmit={handleRegistrationSubmit} 
            initialData={userRegistrationData}
          />
        ) : (
          <SchemeJoiningForm 
            ref={schemeFormRef}
            scheme={scheme} 
            onSubmit={handleSchemeSubmit}
            initialData={schemeJoiningData}
          />
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={[styles.navButton, styles.backButton]}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Text>
        </TouchableOpacity>
        
        {currentStep === 1 ? (
          <TouchableOpacity 
            style={[styles.navButton, styles.nextButton]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.navButton, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default MemberCreation;

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
});