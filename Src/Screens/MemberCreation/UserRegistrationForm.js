import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../Utills/AppTheme";
import CommonHeader from "../../Components/CommonHeader/CommonHeader";

// Storage key for saving form data
const FORM_STORAGE_KEY = "@user_registration_form_data";

export default function UserRegistrationForm() {
  const [formData, setFormData] = useState({
    // Document Details
    aadharNumber: "",
    panNumber: "",
    
    // Personal Details
    userName: "",
    dob: "",
    maritalStatus: "",
    mobileNumber: "",
    emailAddress: "",
    
    // Address Details
    doorNo: "",
    street: "",
    area: "",
    pincode: "",
    city: "",
    state: "",
    
    // Nominee Details
    nomineeName: "",
    nomineeMobile: "",
  });

  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [aadharVerificationStatus, setAadharVerificationStatus] = useState(null);
  const [hasPreviousData, setHasPreviousData] = useState(false);

  const maritalStatusOptions = ["Single", "Married"];

  // Load saved form data on component mount
  useEffect(() => {
    loadSavedFormData();
  }, []);

  // Save form data to AsyncStorage whenever formData changes
  useEffect(() => {
    saveFormData();
  }, [formData]);

  // Load saved form data from AsyncStorage
  const loadSavedFormData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(FORM_STORAGE_KEY);
      if (savedData !== null) {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
        setHasPreviousData(true);
        
        // Check if Aadhar was previously verified
        if (parsedData.aadharNumber) {
          // You might want to store verification status separately
          // For now, we'll reset it and user needs to verify again
          setAadharVerificationStatus(null);
        }
        
        console.log("Loaded saved form data:", parsedData);
      }
    } catch (error) {
      console.error("Error loading saved form data:", error);
    }
  };

  // Save form data to AsyncStorage
  const saveFormData = async () => {
    try {
      const jsonValue = JSON.stringify(formData);
      await AsyncStorage.setItem(FORM_STORAGE_KEY, jsonValue);
      console.log("Form data saved");
    } catch (error) {
      console.error("Error saving form data:", error);
    }
  };

  // Clear all form data from state and AsyncStorage
  const clearFormData = async () => {
    Alert.alert(
      "Clear Form",
      "Are you sure you want to clear all form data? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear AsyncStorage
              await AsyncStorage.removeItem(FORM_STORAGE_KEY);
              
              // Reset form state
              setFormData({
                aadharNumber: "",
                panNumber: "",
                userName: "",
                dob: "",
                maritalStatus: "",
                mobileNumber: "",
                emailAddress: "",
                doorNo: "",
                street: "",
                area: "",
                pincode: "",
                city: "",
                state: "",
                nomineeName: "",
                nomineeMobile: "",
              });
              
              // Reset errors and verification status
              setErrors({});
              setAadharVerificationStatus(null);
              setHasPreviousData(false);
              
              console.log("Form data cleared");
            } catch (error) {
              console.error("Error clearing form data:", error);
              Alert.alert("Error", "Failed to clear form data. Please try again.");
            }
          },
        },
      ]
    );
  };

  // Clear specific field
  const clearField = (field) => {
    setFormData((prev) => ({ ...prev, [field]: "" }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
    if (field === "aadharNumber") {
      setAadharVerificationStatus(null);
    }
  };

  // Clear all errors
  const clearAllErrors = () => {
    setErrors({});
  };

  // Verhoeff Algorithm for Aadhaar Validation
  const verhoeffCheck = (num) => {
    const cleanedNum = num.replace(/\D/g, '');
    
    if (cleanedNum.length !== 12) return false;
    
    const d = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
      [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
      [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
      [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
      [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
      [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
      [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
      [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
      [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    ];
    
    const p = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
      [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
      [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
      [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
      [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
      [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
      [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
    ];
    
    const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];
    
    let c = 0;
    const reversedArray = cleanedNum.split('').reverse();
    
    for (let i = 0; i < reversedArray.length; i++) {
      c = d[c][p[i % 8][parseInt(reversedArray[i])]];
    }
    
    return inv[c] === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
    if (field === "aadharNumber") {
      setAadharVerificationStatus(null);
    }
  };

  const validateAadharNumber = () => {
    const cleanedAadhar = formData.aadharNumber.replace(/\s/g, "");
    
    if (!/^\d{12}$/.test(cleanedAadhar)) {
      setErrors((prev) => ({
        ...prev,
        aadharNumber: "Please enter a valid 12-digit Aadhar number",
      }));
      setAadharVerificationStatus("invalid");
      return;
    }

    const isValid = verhoeffCheck(formData.aadharNumber);
    
    if (isValid) {
      setAadharVerificationStatus("verified");
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.aadharNumber;
        return newErrors;
      });
    } else {
      setAadharVerificationStatus("invalid");
      setErrors((prev) => ({
        ...prev,
        aadharNumber: "Invalid Aadhar number. Please check and try again.",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Aadhar validation
    if (!formData.aadharNumber) {
      newErrors.aadharNumber = "Aadhar number is required";
    } else if (!/^\d{12}$/.test(formData.aadharNumber.replace(/\s/g, ""))) {
      newErrors.aadharNumber = "Aadhar must be 12 digits";
    } else if (aadharVerificationStatus !== "verified") {
      newErrors.aadharNumber = "Please verify your Aadhar number";
    }

    // PAN validation
    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      newErrors.panNumber = "Invalid PAN format (e.g., ABCDE1234F)";
    }

    // User details validation
    if (!formData.userName) newErrors.userName = "Name is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.maritalStatus) newErrors.maritalStatus = "Marital status is required";
    
    // Mobile validation
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Mobile must be 10 digits";
    }

    // Email validation
    if (!formData.emailAddress) {
      newErrors.emailAddress = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
      newErrors.emailAddress = "Invalid email format";
    }

    // Address validation
    if (!formData.doorNo) newErrors.doorNo = "Door number is required";
    if (!formData.street) newErrors.street = "Street is required";
    if (!formData.area) newErrors.area = "Area is required";
    if (!formData.pincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";

    // Nominee validation
    if (!formData.nomineeName) newErrors.nomineeName = "Nominee name is required";
    if (!formData.nomineeMobile) {
      newErrors.nomineeMobile = "Nominee mobile is required";
    } else if (!/^\d{10}$/.test(formData.nomineeMobile)) {
      newErrors.nomineeMobile = "Nominee mobile must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log("Form submitted:", formData);
      // Handle form submission
      Alert.alert(
        "Success",
        "Registration form submitted successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              // Optionally clear form after successful submission
              // clearFormData();
            },
          },
        ]
      );
    }
  };

  const formatAadhar = (text) => {
    const cleaned = text.replace(/\s/g, "");
    const match = cleaned.match(/^(\d{0,4})(\d{0,4})(\d{0,4})$/);
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join(" ");
    }
    return text;
  };

  const renderInput = (
    label,
    field,
    placeholder,
    options = {}
  ) => {
    const {
      mandatory = false,
      keyboardType = "default",
      autoCapitalize = "words",
      maxLength,
    } = options;

    const isFocused = focusedField === field;
    const hasError = !!errors[field];
    const hasValue = !!formData[field];

    return (
      <View style={styles.inputContainer}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            {label}
            {mandatory && <Text style={styles.mandatory}> *</Text>}
          </Text>
          {hasValue && (
            <TouchableOpacity
              onPress={() => clearField(field)}
              style={styles.clearFieldButton}
            >
              <Text style={styles.clearFieldText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        <TextInput
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            hasError && styles.inputError,
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.inputPlaceholder}
          value={formData[field]}
          onChangeText={(text) => {
            if (field === "aadharNumber") {
              const formatted = formatAadhar(text);
              handleInputChange(field, formatted);
            } else if (field === "panNumber") {
              handleInputChange(field, text.toUpperCase());
            } else {
              handleInputChange(field, text);
            }
          }}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
        />
        {hasError && (
          <Text style={styles.errorText}>{errors[field]}</Text>
        )}
      </View>
    );
  };

  const renderMaritalStatusPicker = () => {
    return (
      <View style={styles.inputContainer}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            Marital Status<Text style={styles.mandatory}> *</Text>
          </Text>
          {formData.maritalStatus && (
            <TouchableOpacity
              onPress={() => clearField("maritalStatus")}
              style={styles.clearFieldButton}
            >
              <Text style={styles.clearFieldText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.maritalStatusContainer}>
          {maritalStatusOptions.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.maritalStatusButton,
                formData.maritalStatus === status &&
                  styles.maritalStatusButtonActive,
              ]}
              onPress={() => handleInputChange("maritalStatus", status)}
            >
              <Text
                style={[
                  styles.maritalStatusText,
                  formData.maritalStatus === status &&
                    styles.maritalStatusTextActive,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.maritalStatus && (
          <Text style={styles.errorText}>{errors.maritalStatus}</Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Custom Header with Clear Button */}
      <View style={styles.customHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>User Registration</Text>
          <Text style={styles.headerSubtitle}>
            Please fill in your details
          </Text>
        </View>
        {hasPreviousData && (
          <TouchableOpacity
            style={styles.clearFormButton}
            onPress={clearFormData}
          >
            <Text style={styles.clearFormButtonText}>Clear Form</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Document Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Text style={styles.sectionIcon}>📄</Text>
            </View>
            <Text style={styles.sectionTitle}>Document Details</Text>
          </View>

          {renderInput("Aadhar Number", "aadharNumber", "XXXX XXXX XXXX", {
            mandatory: true,
            keyboardType: "numeric",
            maxLength: 14,
          })}

          {/* Aadhar Verification Button and Status */}
          <View style={styles.verificationContainer}>
            {aadharVerificationStatus === null && formData.aadharNumber.length >= 12 && (
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={validateAadharNumber}
                activeOpacity={0.8}
              >
                <Text style={styles.verifyButtonText}>Verify Aadhar</Text>
              </TouchableOpacity>
            )}

            {aadharVerificationStatus === "verified" && (
              <View style={styles.statusContainerSuccess}>
                <View style={styles.statusIconSuccessContainer}>
                  <Text style={styles.statusIconSuccess}>✓</Text>
                </View>
                <Text style={styles.statusTextSuccess}>Aadhar Verified Successfully</Text>
              </View>
            )}

            {aadharVerificationStatus === "invalid" && (
              <View style={styles.statusContainerError}>
                <View style={styles.statusIconErrorContainer}>
                  <Text style={styles.statusIconError}>✗</Text>
                </View>
                <View style={styles.statusErrorContent}>
                  <Text style={styles.statusTextError}>Invalid Aadhar Number</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={validateAadharNumber}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {renderInput("PAN Number", "panNumber", "ABCDE1234F", {
            mandatory: false,
            autoCapitalize: "characters",
            maxLength: 10,
          })}
        </View>

        {/* Personal Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Text style={styles.sectionIcon}>👤</Text>
            </View>
            <Text style={styles.sectionTitle}>Personal Details</Text>
          </View>

          {renderInput("Full Name", "userName", "Enter your full name", {
            mandatory: true,
          })}

          {renderInput("Date of Birth", "dob", "DD/MM/YYYY", {
            mandatory: true,
            keyboardType: "numeric",
          })}

          {renderMaritalStatusPicker()}

          {renderInput("Mobile Number", "mobileNumber", "10 digit mobile", {
            mandatory: true,
            keyboardType: "phone-pad",
            maxLength: 10,
          })}

          {renderInput("Email Address", "emailAddress", "example@email.com", {
            mandatory: true,
            keyboardType: "email-address",
            autoCapitalize: "none",
          })}
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Text style={styles.sectionIcon}>🏠</Text>
            </View>
            <Text style={styles.sectionTitle}>Address Details</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              {renderInput("Door No", "doorNo", "Door No.", {
                mandatory: true,
              })}
            </View>
            <View style={styles.halfWidth}>
              {renderInput("Street", "street", "Street name", {
                mandatory: true,
              })}
            </View>
          </View>

          {renderInput("Area", "area", "Area/Locality", {
            mandatory: true,
          })}

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              {renderInput("Pincode", "pincode", "6 digits", {
                mandatory: true,
                keyboardType: "numeric",
                maxLength: 6,
              })}
            </View>
            <View style={styles.halfWidth}>
              {renderInput("City", "city", "City", {
                mandatory: true,
              })}
            </View>
          </View>

          {renderInput("State", "state", "State", {
            mandatory: true,
          })}
        </View>

        {/* Nominee Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Text style={styles.sectionIcon}>👥</Text>
            </View>
            <Text style={styles.sectionTitle}>Nominee Details</Text>
          </View>

          {renderInput("Nominee Name", "nomineeName", "Nominee full name", {
            mandatory: true,
          })}

          {renderInput(
            "Nominee Mobile",
            "nomineeMobile",
            "10 digit mobile",
            {
              mandatory: true,
              keyboardType: "phone-pad",
              maxLength: 10,
            }
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={clearAllErrors}
          >
            <Text style={styles.clearAllButtonText}>Clear Errors</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Submit Registration</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* ---------- Header ---------- */
  customHeader: {
    paddingHorizontal: SIZES.padding.container,
    paddingVertical: SIZES.padding.lg,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.primary,
    marginBottom: 2,
  },
  headerSubtitle: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
  },
  clearFormButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.radius.sm,
    ...SHADOWS.xs,
  },
  clearFormButtonText: {
    color: COLORS.white,
    ...FONTS.bodySmall,
    fontWeight: "600",
  },

  /* ---------- Scroll ---------- */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding.container,
    paddingBottom: SIZES.padding.xxl,
  },

  /* ---------- Sections ---------- */
  section: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.card,
    padding: SIZES.padding.lg,
    marginBottom: SIZES.padding.lg,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.padding.lg,
  },
  sectionIconContainer: {
    width: SIZES.icon.lg,
    height: SIZES.icon.lg,
    borderRadius: SIZES.radius.sm,
    backgroundColor: COLORS.blueOpacity10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.padding.sm,
  },
  sectionIcon: {
    fontSize: SIZES.font.md,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.primary,
  },

  /* ---------- Inputs ---------- */
  inputContainer: {
    marginBottom: SIZES.padding.md,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.padding.xs,
  },
  label: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
  },
  mandatory: {
    color: COLORS.error,
  },
  clearFieldButton: {
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: SIZES.padding.xs,
  },
  clearFieldText: {
    ...FONTS.captionBold,
    color: COLORS.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: SIZES.radius.input,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: Platform.OS === "ios" ? SIZES.padding.sm : SIZES.padding.xs,
    ...FONTS.body,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.inputBackground,
    minHeight: SIZES.input.height,
  },
  inputFocused: {
    borderColor: COLORS.inputFocused,
    borderWidth: 2,
    backgroundColor: COLORS.white,
    ...SHADOWS.xs,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    marginTop: SIZES.padding.xs,
    color: COLORS.error,
    ...FONTS.caption,
  },

  /* ---------- Marital Status ---------- */
  maritalStatusContainer: {
    flexDirection: "row",
    marginTop: SIZES.padding.xs,
    gap: SIZES.padding.sm,
  },
  maritalStatusButton: {
    flex: 1,
    paddingVertical: SIZES.padding.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.input,
    alignItems: "center",
    justifyContent: "center",
  },
  maritalStatusButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  maritalStatusText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  maritalStatusTextActive: {
    color: COLORS.white,
    ...FONTS.bodyMedium,
  },

  /* ---------- Aadhaar Verification ---------- */
  verificationContainer: {
    marginBottom: SIZES.padding.md,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.radius.input,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.xs,
  },
  verifyButtonText: {
    color: COLORS.white,
    ...FONTS.bodyMedium,
  },

  statusContainerSuccess: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.successLight,
    padding: SIZES.padding.sm,
    borderRadius: SIZES.radius.input,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  statusIconSuccessContainer: {
    width: SIZES.icon.sm,
    height: SIZES.icon.sm,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.padding.sm,
  },
  statusIconSuccess: {
    color: COLORS.white,
    fontSize: SIZES.font.xs,
    fontWeight: "bold",
  },
  statusTextSuccess: {
    color: COLORS.successDark,
    ...FONTS.bodySmall,
    flex: 1,
  },

  statusContainerError: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.errorLight,
    padding: SIZES.padding.sm,
    borderRadius: SIZES.radius.input,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  statusIconErrorContainer: {
    width: SIZES.icon.sm,
    height: SIZES.icon.sm,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.error,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.padding.sm,
  },
  statusIconError: {
    color: COLORS.white,
    fontSize: SIZES.font.xs,
    fontWeight: "bold",
  },
  statusErrorContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusTextError: {
    color: COLORS.errorDark,
    ...FONTS.bodySmall,
  },
  retryButton: {
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.xs,
    backgroundColor: COLORS.error,
    borderRadius: SIZES.radius.xs,
    marginLeft: SIZES.padding.sm,
  },
  retryButtonText: {
    color: COLORS.white,
    ...FONTS.caption,
  },

  /* ---------- Layout ---------- */
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SIZES.padding.md,
  },
  halfWidth: {
    flex: 1,
  },

  /* ---------- Actions ---------- */
  actionButtonsContainer: {
    marginTop: SIZES.padding.lg,
    gap: SIZES.padding.sm,
  },
  clearAllButton: {
    alignItems: "center",
    paddingVertical: SIZES.padding.sm,
    marginBottom: SIZES.padding.xs,
  },
  clearAllButtonText: {
    color: COLORS.textTertiary,
    ...FONTS.bodySmall,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding.md,
    borderRadius: SIZES.radius.button,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
  },
  submitButtonText: {
    color: COLORS.white,
    ...FONTS.button,
  },

  bottomSpacing: {
    height: SIZES.padding.xxxl,
  },
});