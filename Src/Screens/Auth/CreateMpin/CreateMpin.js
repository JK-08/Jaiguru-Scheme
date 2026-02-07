import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Keyboard,
  BackHandler,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useMpin } from "../../../Hooks/useMpin";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "./CreateMpinStyles";

// Constants - moved outside component for better performance
const WEAK_MPIN_PATTERNS = new Set([
  "1234",
  "4321",
  "1111",
  "0000",
  "2222",
  "3333",
  "4444",
  "5555",
  "6666",
  "7777",
  "8888",
  "9999",
  "9876",
  "6789",
  "1004",
  "2000",
  "1212",
  "2001",
  "1010",
  "1122",
  "2020",
]);

const SEQUENTIAL_PATTERNS = new Set([
  "0123",
  "1234",
  "2345",
  "3456",
  "4567",
  "5678",
  "6789",
  "9876",
  "8765",
  "7654",
  "6543",
  "5432",
  "4321",
  "3210",
]);

// Validation functions
const VALIDATION_RULES = {
  weakPattern: (mpin) => WEAK_MPIN_PATTERNS.has(mpin),
  sequential: (mpin) => SEQUENTIAL_PATTERNS.has(mpin),
  repeating: (mpin) => /^(\d)\1{3}$/.test(mpin),
  mismatch: (mpin, confirmMpin) => mpin !== confirmMpin,
};

const ERROR_MESSAGES = {
  weak: "This MPIN is too common. Choose a more secure combination.",
  sequential: "Sequential numbers are not secure. Choose a random combination.",
  repeating: "Repeating digits are not secure. Choose a random combination.",
  mismatch: "MPINs do not match. Please try again.",
  incomplete: "Please complete all fields.",
};

const MpinCreateScreen = () => {
  const navigation = useNavigation();
  const { createMpin, loading: isCreatingMpin, error: createError } = useMpin();

  // State Management
  const [mpin, setMpin] = useState(["", "", "", ""]);
  const [confirmMpin, setConfirmMpin] = useState(["", "", "", ""]);
  const [activeInput, setActiveInput] = useState(null);
  const [showMpin, setShowMpin] = useState(false);
  const [showConfirmMpin, setShowConfirmMpin] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs
  const mpinRefs = useRef([]);
  const confirmMpinRefs = useRef([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const autoSubmitTimerRef = useRef(null);
  const isMounted = useRef(true);
  const backHandlerRef = useRef(null);

  // Memoized values
  const mpinString = useMemo(() => mpin.join(""), [mpin]);
  const confirmMpinString = useMemo(() => confirmMpin.join(""), [confirmMpin]);

  const isMpinComplete = useMemo(
    () => mpin.every((digit) => digit !== ""),
    [mpin],
  );
  const isConfirmMpinComplete = useMemo(
    () => confirmMpin.every((digit) => digit !== ""),
    [confirmMpin],
  );

  // Initialize component and handle back button
  useFocusEffect(
    useCallback(() => {
      // Reset state when screen comes into focus
      if (!isInitialized) {
        resetState();
        setIsInitialized(true);

        // Focus on first input after a short delay
        setTimeout(() => {
          if (isMounted.current) {
            mpinRefs.current[0]?.focus();
          }
        }, 300);
      }

      // Setup Android back button handler
      if (Platform.OS === "android") {
        backHandlerRef.current = BackHandler.addEventListener(
          "hardwareBackPress",
          handleBackPress,
        );
      }

      return () => {
        // Cleanup
        if (autoSubmitTimerRef.current) {
          clearTimeout(autoSubmitTimerRef.current);
        }
        if (backHandlerRef.current && Platform.OS === "android") {
          backHandlerRef.current.remove();
        }
      };
    }, [isInitialized]),
  );

  // Effects
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      if (autoSubmitTimerRef.current) {
        clearTimeout(autoSubmitTimerRef.current);
      }
    };
  }, []);

  // Progress animation
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: currentStep === 1 ? 0.5 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  // Handle back button press
  const handleBackPress = useCallback(() => {
    if (currentStep === 2) {
      // Go back to step 1
      handleGoBack();
      return true; // Prevent default back action
    }
    return false; // Allow default back action
  }, [currentStep]);

  // Reset all state
  const resetState = useCallback(() => {
    if (!isMounted.current) return;

    setMpin(["", "", "", ""]);
    setConfirmMpin(["", "", "", ""]);
    setValidationError("");
    setCurrentStep(1);
    setActiveInput(null);
    setShowMpin(false);
    setShowConfirmMpin(false);
    setHasSubmitted(false);
  }, []);

  // Validation function
  const validateMpin = useCallback((mpinValue, confirmMpinValue = "") => {
    if (
      mpinValue.length !== 4 ||
      (confirmMpinValue.length > 0 && confirmMpinValue.length !== 4)
    ) {
      return ERROR_MESSAGES.incomplete;
    }

    if (VALIDATION_RULES.weakPattern(mpinValue)) {
      return ERROR_MESSAGES.weak;
    }

    if (VALIDATION_RULES.sequential(mpinValue)) {
      return ERROR_MESSAGES.sequential;
    }

    if (VALIDATION_RULES.repeating(mpinValue)) {
      return ERROR_MESSAGES.repeating;
    }

    if (
      confirmMpinValue &&
      VALIDATION_RULES.mismatch(mpinValue, confirmMpinValue)
    ) {
      return ERROR_MESSAGES.mismatch;
    }

    return "";
  }, []);

  // Animation
  const shakeInputs = useCallback(() => {
    if (!isMounted.current) return;

    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle Submit
  const handleSubmit = useCallback(async () => {
    if (hasSubmitted || isCreatingMpin || !isMounted.current) return;

    setHasSubmitted(true);
    setValidationError("");

    const errorMessage = validateMpin(mpinString, confirmMpinString);

    if (errorMessage) {
      setValidationError(errorMessage);
      shakeInputs();
      setHasSubmitted(false);
      return;
    }

    Keyboard.dismiss();

    try {
      await createMpin(mpinString);
      await AsyncStorage.setItem("hasMpin", "true");

      Alert.alert("Success", "MPIN created successfully!", [
        {
          text: "OK",
          onPress: () => {
            if (isMounted.current) {
              navigation.reset({
                index: 0,
                routes: [{ name: "MainDrawer" }],
              });
            }
          },
        },
      ]);
    } catch (err) {
      if (!isMounted.current) return;

      const errorMsg = err?.message || "";

      if (
        errorMsg.includes("MPIN already exists") ||
        err?.code === "MPIN_ALREADY_EXISTS"
      ) {
        await AsyncStorage.setItem("hasMpin", "true");

        Alert.alert(
          "MPIN Already Set",
          "You already have an MPIN. Please verify to continue.",
          [
            {
              text: "Verify MPIN",
              onPress: () => {
                if (isMounted.current) {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "MpinVerify" }],
                  });
                }
              },
            },
          ],
        );
        return;
      }

      setValidationError(
        errorMsg || "Failed to create MPIN. Please try again.",
      );
      shakeInputs();
      setHasSubmitted(false);
    }
  }, [
    mpinString,
    confirmMpinString,
    validateMpin,
    shakeInputs,
    createMpin,
    navigation,
    hasSubmitted,
    isCreatingMpin,
  ]);

  // Auto-submit when confirm MPIN is complete and matches
  useEffect(() => {
    if (
      currentStep === 2 &&
      isConfirmMpinComplete &&
      !validationError &&
      !hasSubmitted &&
      !isCreatingMpin &&
      isMounted.current
    ) {
      if (autoSubmitTimerRef.current) {
        clearTimeout(autoSubmitTimerRef.current);
      }

      autoSubmitTimerRef.current = setTimeout(() => {
        const errorMsg = validateMpin(mpinString, confirmMpinString);
        if (!errorMsg && isMounted.current) {
          handleSubmit();
        } else if (errorMsg && isMounted.current) {
          setValidationError(errorMsg);
          shakeInputs();
        }
      }, 300);
    }

    return () => {
      if (autoSubmitTimerRef.current) {
        clearTimeout(autoSubmitTimerRef.current);
      }
    };
  }, [
    confirmMpinString,
    currentStep,
    mpinString,
    handleSubmit,
    isConfirmMpinComplete,
    hasSubmitted,
    isCreatingMpin,
    validateMpin,
    shakeInputs,
  ]);

  // MPIN Change Handler
  const handleMpinChange = useCallback(
    (text, index) => {
      const numericText = text.replace(/[^0-9]/g, "").slice(0, 1);

      setMpin((prev) => {
        const newMpin = [...prev];
        newMpin[index] = numericText;
        return newMpin;
      });

      setValidationError("");

      // Auto-focus next input
      if (numericText && index < 3) {
        setTimeout(() => mpinRefs.current[index + 1]?.focus(), 10);
      }

      // Validate and move to next step when complete
      if (index === 3 && numericText) {
        setTimeout(() => {
          if (!isMounted.current) return;

          const updatedMpin = [...mpin];
          updatedMpin[index] = numericText;
          const mpinValue = updatedMpin.join("");

          const errorMessage = validateMpin(mpinValue);
          if (errorMessage) {
            setValidationError(errorMessage);
            shakeInputs();
          } else {
            setCurrentStep(2);
            setTimeout(() => confirmMpinRefs.current[0]?.focus(), 100);
          }
        }, 50);
      }
    },
    [mpin, validateMpin, shakeInputs],
  );

  // Confirm MPIN Change Handler
  const handleConfirmMpinChange = useCallback((text, index) => {
    const numericText = text.replace(/[^0-9]/g, "").slice(0, 1);

    setConfirmMpin((prev) => {
      const newConfirmMpin = [...prev];
      newConfirmMpin[index] = numericText;
      return newConfirmMpin;
    });

    setValidationError("");

    // Auto-focus next input
    if (numericText && index < 3) {
      setTimeout(() => confirmMpinRefs.current[index + 1]?.focus(), 10);
    }
  }, []);

  // Backspace Handler
  const handleKeyPress = useCallback((e, index, isConfirm = false) => {
    if (e.nativeEvent.key === "Backspace") {
      const setter = isConfirm ? setConfirmMpin : setMpin;
      const refs = isConfirm ? confirmMpinRefs : mpinRefs;

      setter((prev) => {
        const newValues = [...prev];

        if (prev[index]) {
          // Clear current field
          newValues[index] = "";
          return newValues;
        } else if (index > 0) {
          // Move to previous field
          newValues[index - 1] = "";
          setTimeout(() => refs.current[index - 1]?.focus(), 10);
          return newValues;
        }
        return prev;
      });
    }
  }, []);

  // Component Renderers
  const renderMpinInputs = useCallback(
    (isConfirm = false) => {
      const values = isConfirm ? confirmMpin : mpin;
      const refs = isConfirm ? confirmMpinRefs : mpinRefs;
      const showValue = isConfirm ? showConfirmMpin : showMpin;
      const baseIndex = isConfirm ? 4 : 0;

      return (
        <Animated.View
          style={[
            styles.mpinContainer,
            { transform: [{ translateX: shakeAnimation }] },
          ]}
        >
          {[0, 1, 2, 3].map((index) => {
            const isFocused = activeInput === baseIndex + index;
            const hasValue = values[index] !== "";

            return (
              <View
                key={`mpin-${isConfirm ? "confirm" : "create"}-${index}`}
                style={[
                  styles.mpinDigitWrapper,
                  isFocused && styles.mpinDigitWrapperFocused,
                  hasValue && styles.mpinDigitWrapperFilled,
                  validationError && styles.mpinDigitWrapperError,
                ]}
              >
                <TextInput
                  ref={(ref) => (refs.current[index] = ref)}
                  style={styles.mpinDigitInput}
                  value={values[index]}
                  onChangeText={(text) =>
                    isConfirm
                      ? handleConfirmMpinChange(text, index)
                      : handleMpinChange(text, index)
                  }
                  onKeyPress={(e) => handleKeyPress(e, index, isConfirm)}
                  onFocus={() => setActiveInput(baseIndex + index)}
                  onBlur={() => setActiveInput(null)}
                  keyboardType="number-pad"
                  maxLength={1}
                  secureTextEntry={!showValue}
                  textAlign="center"
                  caretHidden
                  selectTextOnFocus
                  contextMenuHidden
                  autoComplete="off"
                  importantForAutofill="no"
                  editable={!isCreatingMpin}
                />
                {!showValue && hasValue && <View style={styles.dotIndicator} />}
              </View>
            );
          })}

          <TouchableOpacity
            style={styles.visibilityButton}
            onPress={() =>
              isConfirm
                ? setShowConfirmMpin(!showConfirmMpin)
                : setShowMpin(!showMpin)
            }
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={isCreatingMpin}
          >
            <Icon
              name={showValue ? "eye-off" : "eye"}
              size={22}
              color="#007AFF"
            />
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [
      mpin,
      confirmMpin,
      activeInput,
      showMpin,
      showConfirmMpin,
      shakeAnimation,
      validationError,
      handleMpinChange,
      handleConfirmMpinChange,
      handleKeyPress,
      isCreatingMpin,
    ],
  );

  // Clear All Handler
  const handleClearAll = useCallback(() => {
    resetState();
    setTimeout(() => mpinRefs.current[0]?.focus(), 100);
  }, [resetState]);

  // Go Back Handler
  const handleGoBack = useCallback(() => {
    if (currentStep === 2) {
      setConfirmMpin(["", "", "", ""]);
      setCurrentStep(1);
      setValidationError("");
      setTimeout(() => mpinRefs.current[3]?.focus(), 100);
    } else {
      navigation.goBack();
    }
  }, [currentStep, navigation]);

  // Determine error message to display
  const displayError = useMemo(() => {
    return validationError || createError;
  }, [validationError, createError]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity
                onPress={handleGoBack}
                style={styles.backButton}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={isCreatingMpin}
              >
                <Icon name="arrow-left" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Create MPIN</Text>
              <TouchableOpacity
                onPress={handleClearAll}
                style={styles.backButton}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={isCreatingMpin}
              >
                <Icon name="refresh" size={22} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>Step {currentStep} of 2</Text>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Icon
                name={currentStep === 1 ? "lock-outline" : "lock-check"}
                size={48}
                color="#007AFF"
              />
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.title}>
              {currentStep === 1 ? "Create Your MPIN" : "Confirm Your MPIN"}
            </Text>
            <Text style={styles.subtitle}>
              {currentStep === 1
                ? "Choose a 4-digit number you'll remember"
                : "Re-enter your MPIN to confirm"}
            </Text>

            {/* MPIN Input */}
            <View style={styles.inputSection}>
              {renderMpinInputs(currentStep === 2)}
            </View>

            {/* Error Messages */}
            {displayError ? (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={18} color="#FF3B30" />
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            ) : null}

            {/* Security Tips */}
            <View style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <Icon name="shield-check" size={16} color="#34C759" />
                <Text style={styles.tipText}>
                  Avoid common patterns (1234, 1111)
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="shield-check" size={16} color="#34C759" />
                <Text style={styles.tipText}>
                  Never share your MPIN with anyone
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="shield-check" size={16} color="#34C759" />
                <Text style={styles.tipText}>
                  Choose numbers that are easy to remember but hard to guess
                </Text>
              </View>
            </View>

            {/* Loading Indicator */}
            {isCreatingMpin ? (
              <View style={styles.loadingContainer}>
                <Icon
                  name="loading"
                  size={24}
                  color="#007AFF"
                  style={{ transform: [{ rotate: "0deg" }] }}
                />
                <Text style={styles.loadingText}>Creating MPIN...</Text>
              </View>
            ) : null}
          </View>

          {/* Manual Submit Button (fallback) */}
          {currentStep === 2 && isConfirmMpinComplete && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (displayError || isCreatingMpin) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!!displayError || isCreatingMpin}
                activeOpacity={0.8}
              >
                <Icon name="lock-check" size={22} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Confirm & Create</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default memo(MpinCreateScreen);
