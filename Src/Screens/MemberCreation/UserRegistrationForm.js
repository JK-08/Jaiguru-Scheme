import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../Utills/AppTheme";
import authStorage from "../../Utills/AsynchStorageHelper";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// Storage key for saving form data
const FORM_STORAGE_KEY = "@user_registration_form_data";

// Months for date picker
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const UserRegistrationForm = forwardRef(({ onSubmit, initialData = {} }, ref) => {
  const scrollViewRef = useRef(null);
  
  const [formData, setFormData] = useState({
    // Document Details
    aadharNumber: "",
    panNumber: "",
    
    // Personal Details
    userName: "",
    lastName: "",
    dob: "",
    maritalStatus: "",
    anniversaryDate: "",
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
  const [hasPreviousData, setHasPreviousData] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  
  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(null);
  const [selectedDate, setSelectedDate] = useState({
    day: "01",
    month: "01",
    year: "1990",
  });

  const maritalStatusOptions = ["Single", "Married"];

  // Generate days, months, years for date picker
  const currentYear = new Date().getFullYear();
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());

  // Load user data from AuthStorage on mount
  useEffect(() => {
    loadUserDataFromAuth();
  }, []);

  // Initialize with initialData if provided
  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData(initialData);
      setHasPreviousData(true);
      
      if (initialData.dob) {
        const [year, month, day] = initialData.dob.split("-");
        setSelectedDate({ day, month, year });
      }
    }
  }, [initialData]);

  // Save form data to AsyncStorage whenever formData changes
  useEffect(() => {
    saveFormData();
  }, [formData]);

  // Auto-fetch city and state from pincode
  useEffect(() => {
    if (formData.pincode && formData.pincode.length === 6) {
      fetchLocationFromPincode();
    }
  }, [formData.pincode]);

  // Expose validateAndSubmit method to parent
  useImperativeHandle(ref, () => ({
    validateAndSubmit: () => {
      if (validateForm()) {
        onSubmit(formData);
        return true;
      }
      return false;
    },
    clearForm: clearFormData
  }));

  // Load user data from AuthStorage
  const loadUserDataFromAuth = async () => {
    try {
      // First try to load saved form data
      const savedFormData = await AsyncStorage.getItem(FORM_STORAGE_KEY);
      
      if (savedFormData !== null) {
        const parsedData = JSON.parse(savedFormData);
        setFormData(parsedData);
        setHasPreviousData(true);
        
        if (parsedData.dob) {
          const [year, month, day] = parsedData.dob.split("-");
          setSelectedDate({ day, month, year });
        }
        return;
      }

      // If no saved form data, load from auth storage
      const authSession = await authStorage.getAuthSession();
      
      if (authSession.isAuthenticated && authSession.user) {
        const user = authSession.user;
        
        // Map auth user data to form fields
        const userFields = {
          userName: user.username || user.name || "",
          mobileNumber: user.contactNumber || user.mobileNumber || user.phone || "",
          emailAddress: user.email || "",
        };

        setFormData(prev => ({
          ...prev,
          ...userFields
        }));

        // Also try to load from USER_DATA key directly if needed
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          setFormData(prev => ({
            ...prev,
            userName: prev.userName || parsedUserData.username || parsedUserData.name || "",
            mobileNumber: prev.mobileNumber || parsedUserData.contactNumber || parsedUserData.mobileNumber || "",
            emailAddress: prev.emailAddress || parsedUserData.email || "",
          }));
        }
      }
    } catch (error) {
      console.error("Error loading user data from auth:", error);
    }
  };

  // Fetch location from pincode
  const fetchLocationFromPincode = async (pincode = formData.pincode) => {
    if (!pincode || pincode.length !== 6) return;

    setIsFetchingLocation(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();

      if (data[0]?.Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        const district = postOffice.District || "";
        const state = postOffice.State || "";

        setFormData(prev => ({
          ...prev,
          city: district,
          state: state,
        }));

        // Clear any city/state errors if they existed
        setErrors(prev => ({
          ...prev,
          city: null,
          state: null,
          pincode: null
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          pincode: "Invalid pincode. Please check and try again."
        }));
      }
    } catch (error) {
      console.error("Error fetching pincode data:", error);
      setErrors(prev => ({
        ...prev,
        pincode: "Failed to fetch location data. Please enter manually."
      }));
    } finally {
      setIsFetchingLocation(false);
    }
  };

  // Save form data to AsyncStorage
  const saveFormData = async () => {
    try {
      const jsonValue = JSON.stringify(formData);
      await AsyncStorage.setItem(FORM_STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error("Error saving form data:", error);
    }
  };

  // Clear all form data
  const clearFormData = async () => {
    Alert.alert(
      "Clear Form",
      "Are you sure you want to clear all form data? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(FORM_STORAGE_KEY);
              
              setFormData({
                aadharNumber: "",
                panNumber: "",
                userName: "",
                lastName: "",
                dob: "",
                maritalStatus: "",
                anniversaryDate: "",
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
              
              setErrors({});
              setHasPreviousData(false);
              
              // Reload user data from auth
              loadUserDataFromAuth();
            } catch (error) {
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

  // Validate Aadhar number automatically
  const validateAadharNumber = (aadharNumber) => {
    const cleanedAadhar = aadharNumber.replace(/\s/g, "");
    
    if (cleanedAadhar === "") {
      setErrors((prev) => ({ ...prev, aadharNumber: null }));
      return;
    }
    
    if (!/^\d{12}$/.test(cleanedAadhar)) {
      setErrors((prev) => ({
        ...prev,
        aadharNumber: "Aadhar must be 12 digits",
      }));
      return;
    }

    const isValid = verhoeffCheck(aadharNumber);
    
    if (isValid) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.aadharNumber;
        return newErrors;
      });
    } else {
      setErrors((prev) => ({
        ...prev,
        aadharNumber: "Invalid Aadhar number. Please check and try again.",
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
    
    // Automatically validate Aadhar as user types
    if (field === "aadharNumber") {
      if (value.replace(/\s/g, "").length === 12) {
        validateAadharNumber(value);
      }
    }
    
    // Validate PAN format automatically
    if (field === "panNumber" && value !== "") {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
        setErrors((prev) => ({ ...prev, panNumber: "Invalid PAN format (e.g., ABCDE1234F)" }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.panNumber;
          return newErrors;
        });
      }
    }
    
    // Validate mobile numbers automatically
    if ((field === "mobileNumber" || field === "nomineeMobile") && value !== "") {
      if (!/^\d{10}$/.test(value)) {
        setErrors((prev) => ({ ...prev, [field]: `${field === 'mobileNumber' ? 'Mobile' : 'Nominee mobile'} must be 10 digits` }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
    
    // Validate email automatically
    if (field === "emailAddress" && value !== "") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors((prev) => ({ ...prev, emailAddress: "Invalid email format" }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.emailAddress;
          return newErrors;
        });
      }
    }
    
    // Validate pincode automatically
    if (field === "pincode" && value !== "") {
      if (!/^\d{6}$/.test(value)) {
        setErrors((prev) => ({ ...prev, pincode: "Pincode must be 6 digits" }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Aadhar validation
    if (!formData.aadharNumber) {
      newErrors.aadharNumber = "Aadhar number is required";
    } else if (!/^\d{12}$/.test(formData.aadharNumber.replace(/\s/g, ""))) {
      newErrors.aadharNumber = "Aadhar must be 12 digits";
    } else if (!verhoeffCheck(formData.aadharNumber)) {
      newErrors.aadharNumber = "Invalid Aadhar number";
    }

    // PAN validation - only if provided
    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      newErrors.panNumber = "Invalid PAN format (e.g., ABCDE1234F)";
    }

    // User details validation
    if (!formData.userName) newErrors.userName = "Name is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.maritalStatus) newErrors.maritalStatus = "Marital status is required";
    
    // Anniversary validation (if married)
    if (formData.maritalStatus === "Married" && !formData.anniversaryDate) {
      newErrors.anniversaryDate = "Anniversary date is required for married individuals";
    }
    
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

  const formatAadhar = (text) => {
    const cleaned = text.replace(/\s/g, "");
    const match = cleaned.match(/^(\d{0,4})(\d{0,4})(\d{0,4})$/);
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join(" ");
    }
    return text;
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const openDatePicker = (type) => {
    if (type === "dob" && formData.dob) {
      const [year, month, day] = formData.dob.split("-");
      setSelectedDate({ day, month, year });
    } else if (type === "anniversary" && formData.anniversaryDate) {
      const [year, month, day] = formData.anniversaryDate.split("-");
      setSelectedDate({ day, month, year });
    } else {
      setSelectedDate({ day: "01", month: "01", year: "1990" });
    }
    setShowDatePicker(type);
  };

  const handleDateConfirm = () => {
    if (!selectedDate.day || !selectedDate.month || !selectedDate.year) {
      Alert.alert("Error", "Please select a valid date");
      return;
    }

    const formattedDate = `${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`;

    if (showDatePicker === "dob") {
      handleInputChange("dob", formattedDate);
    } else if (showDatePicker === "anniversary") {
      handleInputChange("anniversaryDate", formattedDate);
    }

    setShowDatePicker(null);
  };

  const renderDatePicker = () => (
    <Modal visible={!!showDatePicker} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {showDatePicker === "dob" ? "Select Date of Birth" : "Select Anniversary Date"}
            </Text>
            <TouchableOpacity onPress={() => setShowDatePicker(null)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.selectedDatePreview}>
            Selected: {selectedDate.day}/{selectedDate.month}/{selectedDate.year}
          </Text>

          <View style={styles.pickerContainer}>
            {/* Day Picker */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Day</Text>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.pickerItem,
                      selectedDate.day === day && styles.pickerItemSelected,
                    ]}
                    onPress={() => setSelectedDate(prev => ({ ...prev, day }))}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      selectedDate.day === day && styles.pickerItemTextSelected,
                    ]}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Month Picker */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Month</Text>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.pickerItem,
                      selectedDate.month === month && styles.pickerItemSelected,
                    ]}
                    onPress={() => setSelectedDate(prev => ({ ...prev, month }))}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      selectedDate.month === month && styles.pickerItemTextSelected,
                    ]}>{MONTHS[index]}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Year Picker */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Year</Text>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.pickerItem,
                      selectedDate.year === year && styles.pickerItemSelected,
                    ]}
                    onPress={() => setSelectedDate(prev => ({ ...prev, year }))}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      selectedDate.year === year && styles.pickerItemTextSelected,
                    ]}>{year}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowDatePicker(null)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleDateConfirm}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
      editable = true,
    } = options;

    const hasError = !!errors[field];
    const hasValue = !!formData[field];

    return (
      <View style={styles.inputContainer}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            {label}
            {mandatory && <Text style={styles.mandatory}> *</Text>}
          </Text>
          {hasValue && editable && (
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
            hasError && styles.inputError,
            !editable && styles.inputDisabled,
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
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          editable={editable}
        />
        {hasError && (
          <Text style={styles.errorText}>{errors[field]}</Text>
        )}
      </View>
    );
  };

  const renderDateInput = (label, field, mandatory = true) => {
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
        <TouchableOpacity
          style={[
            styles.input,
            styles.dateInput,
            hasError && styles.inputError,
          ]}
          onPress={() => openDatePicker(field)}
        >
          <Text style={hasValue ? styles.dateText : styles.placeholderText}>
            {hasValue ? formatDateDisplay(formData[field]) : `Select ${label}`}
          </Text>
          <Text style={styles.dateIcon}>📅</Text>
        </TouchableOpacity>
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
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>User Registration</Text>
          <Text style={styles.headerSubtitle}>
            Step 1: Fill in your personal details
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

      <KeyboardAwareScrollView
        ref={scrollViewRef}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
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

          {renderInput("Last Name", "lastName", "Enter last name", {
            mandatory: false,
          })}

          {renderDateInput("Date of Birth", "dob", true)}

          {renderMaritalStatusPicker()}

          {formData.maritalStatus === "Married" && renderDateInput("Anniversary Date", "anniversaryDate", true)}

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
              <View style={styles.pincodeContainer}>
                {renderInput("Pincode", "pincode", "6 digits", {
                  mandatory: true,
                  keyboardType: "numeric",
                  maxLength: 6,
                })}
                {isFetchingLocation && (
                  <ActivityIndicator size="small" color={COLORS.primary} style={styles.pincodeLoader} />
                )}
              </View>
            </View>
            <View style={styles.halfWidth}>
              {renderInput("City", "city", "City", {
                mandatory: true,
                editable: false,
              })}
            </View>
          </View>

          {renderInput("State", "state", "State", {
            mandatory: true,
            editable: false,
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
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </KeyboardAwareScrollView>

      {/* Date Picker Modal */}
      {renderDatePicker()}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
  scrollContent: {
    padding: SIZES.padding.container,
  },
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
  inputError: {
    borderColor: COLORS.error,
  },
  inputDisabled: {
    backgroundColor: COLORS.disabled,
    color: COLORS.textTertiary,
  },
  errorText: {
    marginTop: SIZES.padding.xs,
    color: COLORS.error,
    ...FONTS.caption,
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    ...FONTS.body,
    color: COLORS.textPrimary,
  },
  placeholderText: {
    ...FONTS.body,
    color: COLORS.inputPlaceholder,
  },
  dateIcon: {
    fontSize: SIZES.font.md,
  },
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SIZES.padding.md,
  },
  halfWidth: {
    flex: 1,
  },
  pincodeContainer: {
    position: "relative",
  },
  pincodeLoader: {
    position: "absolute",
    right: 10,
    top: Platform.OS === "ios" ? 35 : 40,
  },
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
  bottomSpacing: {
    height: SIZES.padding.xxxl,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.card,
    padding: SIZES.padding.lg,
    width: "90%",
    maxHeight: "80%",
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.padding.md,
  },
  modalTitle: {
    ...FONTS.h4,
    color: COLORS.primary,
  },
  closeButton: {
    fontSize: SIZES.font.xl,
    color: COLORS.textSecondary,
    padding: SIZES.padding.xs,
  },
  selectedDatePreview: {
    ...FONTS.body,
    color: COLORS.primary,
    marginBottom: SIZES.padding.md,
    textAlign: "center",
    fontWeight: "600",
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.padding.lg,
  },
  pickerColumn: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: SIZES.padding.xs,
  },
  pickerLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.padding.xs,
  },
  pickerScrollView: {
    height: 200,
    width: "100%",
  },
  pickerItem: {
    paddingVertical: SIZES.padding.sm,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: SIZES.radius.sm,
  },
  pickerItemSelected: {
    backgroundColor: COLORS.primary + "20",
  },
  pickerItemText: {
    ...FONTS.body,
    color: COLORS.textPrimary,
  },
  pickerItemTextSelected: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SIZES.padding.md,
    marginTop: SIZES.padding.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.radius.input,
    backgroundColor: COLORS.border,
    alignItems: "center",
  },
  cancelButtonText: {
    ...FONTS.body,
    color: COLORS.textPrimary,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.radius.input,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  confirmButtonText: {
    ...FONTS.body,
    color: COLORS.white,
    fontWeight: "600",
  },
});

export default UserRegistrationForm;