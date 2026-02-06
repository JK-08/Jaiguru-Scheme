// ResetMpinScreen.js - Optimized Version
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useMpin } from "../../../Hooks/useMpin";
import { useToast, ToastTypes, ToastPositions } from "../../../Components/Toast/Toast";
import { COLORS, FONTS, COMMON_STYLES, SIZES } from "../../../Utills/AppTheme";
import styles from "./ResetMpinStyles";

const ForgotMpin = () => {
  const navigation = useNavigation();
  const { resetMpinDirect, loading } = useMpin();
  const { showToast, Toast } = useToast();

  const [newMpin, setNewMpin] = useState(["", "", "", ""]);
  const [confirmMpin, setConfirmMpin] = useState(["", "", "", ""]);
  const [showNewMpin, setShowNewMpin] = useState(false);
  const [showConfirmMpin, setShowConfirmMpin] = useState(false);
  const [activeSection, setActiveSection] = useState("new");
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [mpinValidations, setMpinValidations] = useState({
    length: false,
    consecutive: false,
    repeated: false,
    sequence: false,
  });

  const newMpinRefs = useRef([]);
  const confirmMpinRefs = useRef([]);
  const MAX_ATTEMPTS = 3;
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  const LOCK_DURATION = 120;
  const timerRef = useRef(null);

  // Lock timer effect
  useEffect(() => {
    if (isLocked && lockTime > 0) {
      timerRef.current = setInterval(() => {
        setLockTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsLocked(false);
            setAttempts(0);
            resetAllMpin();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isLocked, lockTime]);

  // Validate MPIN strength
  const validateMpin = useCallback((mpinString) => {
    const validations = {
      length: mpinString.length === 4,
      consecutive: !/(012|123|234|345|456|567|678|789|890)/.test(mpinString),
      repeated: !/(\d)\1{2,}/.test(mpinString),
      sequence: !/^(0123|1234|2345|3456|4567|5678|6789|7890)$/.test(mpinString),
    };
    setMpinValidations(validations);
    return Object.values(validations).every(v => v);
  }, []);

  const resetAllMpin = () => {
    setNewMpin(["", "", "", ""]);
    setConfirmMpin(["", "", "", ""]);
    setFocusedIndex(null);
    setActiveSection("new");
    setMpinValidations({
      length: false,
      consecutive: false,
      repeated: false,
      sequence: false,
    });
    setTimeout(() => newMpinRefs.current[0]?.focus(), 100);
  };

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

const handleMpinChange = useCallback((text, index, type) => {
  if (isLocked) return;

  const numericText = text.replace(/[^0-9]/g, "").slice(0, 1);

  if (type === "new") {
    const updatedNewMpin = [...newMpin];
    updatedNewMpin[index] = numericText;
    setNewMpin(updatedNewMpin);

    if (numericText && index < 3) {
      setTimeout(() => {
        newMpinRefs.current[index + 1]?.focus();
      }, 50);
    }

    if (numericText && index === 3) {
      const mpinString = updatedNewMpin.join("");
      validateMpin(mpinString);
      setTimeout(() => {
        setActiveSection("confirm");
        confirmMpinRefs.current[0]?.focus();
      }, 100);
    }
  } else {
    const updatedConfirmMpin = [...confirmMpin];
    updatedConfirmMpin[index] = numericText;
    setConfirmMpin(updatedConfirmMpin);

    // <-- Debugging log for Confirm MPIN entry
    console.log("Confirm MPIN Entered:", updatedConfirmMpin.join(""));

    if (numericText && index < 3) {
      setTimeout(() => {
        confirmMpinRefs.current[index + 1]?.focus();
      }, 50);
    }

    if (numericText && index === 3) {
      const newMpinString = newMpin.join("");
      const confirmMpinString = updatedConfirmMpin.join("");
      if (newMpinString === confirmMpinString) {
        setTimeout(() => handleSubmit(), 100);
      }
    }
  }
}, [newMpin, confirmMpin, isLocked, validateMpin]);


  const handleKeyPress = useCallback((e, index, type) => {
    if (e.nativeEvent.key === "Backspace") {
      const refs = type === "new" ? newMpinRefs : confirmMpinRefs;
      const mpinArray = type === "new" ? newMpin : confirmMpin;
      
      if (!mpinArray[index] && index > 0) {
        refs.current[index - 1]?.focus();
      }
    }
  }, [newMpin, confirmMpin]);

const handleSubmit = useCallback(async () => {
  if (isLocked) return;

  const newMpinString = newMpin.join("");
  const confirmMpinString = confirmMpin.join("");

  console.log('=== Reset MPIN Debug Info ===');
  console.log('New MPIN:', newMpinString);
  console.log('Confirm MPIN:', confirmMpinString);
  console.log('MPIN Validation:', mpinValidations);
  console.log('Loading State:', loading);
  console.log('Locked State:', isLocked);

  if (newMpinString.length !== 4 || confirmMpinString.length !== 4) {
    console.log('Validation Failed: Incomplete MPIN');
    showToast({
      message: "Please enter complete 4-digit MPINs",
      type: ToastTypes.WARNING,
      duration: 3000,
      position: ToastPositions.TOP,
    });
    return;
  }

  if (newMpinString !== confirmMpinString) {
    console.log('Validation Failed: MPINs do not match');
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= MAX_ATTEMPTS) {
      setIsLocked(true);
      setLockTime(LOCK_DURATION);
      Keyboard.dismiss();

      showToast({
        title: "Account Locked",
        message: "Too many incorrect attempts. Please wait 2 minutes.",
        type: ToastTypes.ERROR,
        duration: 5000,
        position: ToastPositions.TOP,
      });
    } else {
      showToast({
        title: "MPINs Don't Match",
        message: `Please enter matching MPINs. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts > 1 ? "s" : ""} remaining.`,
        type: ToastTypes.WARNING,
        duration: 4000,
        position: ToastPositions.TOP,
      });

      setConfirmMpin(["", "", "", ""]);
      setActiveSection("confirm");
      setTimeout(() => confirmMpinRefs.current[0]?.focus(), 100);
    }
    return;
  }

  if (!validateMpin(newMpinString)) {
    console.log('Validation Failed: Weak MPIN');
    showToast({
      title: "Weak MPIN",
      message: "Please choose a stronger MPIN",
      type: ToastTypes.WARNING,
      duration: 4000,
      position: ToastPositions.TOP,
    });
    return;
  }

  console.log('=== Calling API ===');
  console.log('MPIN to reset:', newMpinString);
  
  try {
    console.log('API call started...');
    const result = await resetMpinDirect(newMpinString);
    console.log('API call successful:', result);
    
    resetAllMpin();
    setAttempts(0);

    showToast({
      message: "MPIN reset successfully!",
      type: ToastTypes.SUCCESS,
      duration: 3000,
      position: ToastPositions.TOP,
    });

    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: "VerifyMpin" }],
      });
    }, 1000);
  } catch (err) {
    console.error('API call failed:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    showToast({
      title: "Reset Failed",
      message: err.message || "Failed to reset MPIN. Please try again.",
      type: ToastTypes.ERROR,
      duration: 4000,
      position: ToastPositions.TOP,
    });
  }
}, [newMpin, confirmMpin, attempts, isLocked, resetMpinDirect, showToast, navigation, validateMpin]);
  const handleToggleVisibility = (type) => {
    if (isLocked) return;
    
    if (type === "new") {
      setShowNewMpin(!showNewMpin);
    } else {
      setShowConfirmMpin(!showConfirmMpin);
    }
  };

  const handleBack = useCallback(() => {
    if (isLocked) return;
    Keyboard.dismiss();
    navigation.goBack();
  }, [navigation, isLocked]);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const renderMpinInputs = (type, mpinArray, showMpin) => {
    const refs = type === "new" ? newMpinRefs : confirmMpinRefs;
    const isActive = activeSection === type;
    const isDisabled = isLocked || loading;

    return (
      <View style={styles.mpinContainer}>
        {[0, 1, 2, 3].map((index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.mpinDigitContainer,
              focusedIndex === index && isActive && styles.mpinDigitContainerFocused,
              mpinArray[index] && styles.mpinDigitContainerFilled,
              isDisabled && styles.mpinDigitContainerDisabled,
            ]}
            onPress={() => !isDisabled && refs.current[index]?.focus()}
            activeOpacity={0.7}
            disabled={isDisabled}
          >
            <TextInput
              ref={(ref) => (refs.current[index] = ref)}
              style={[
                styles.mpinDigitInput,
                mpinArray[index] && styles.mpinDigitInputFilled,
              ]}
              value={mpinArray[index]}
              onChangeText={(text) => handleMpinChange(text, index, type)}
              onKeyPress={(e) => handleKeyPress(e, index, type)}
              onFocus={() => {
                setFocusedIndex(index);
                setActiveSection(type);
              }}
              onBlur={() => setFocusedIndex(null)}
              keyboardType="number-pad"
              maxLength={1}
              secureTextEntry={!showMpin}
              textAlign="center"
              caretHidden={true}
              editable={!isDisabled}
              selectTextOnFocus={false}
              contextMenuHidden={true}
              autoComplete="off"
              importantForAutofill="no"
              pointerEvents={isDisabled ? "none" : "auto"}
            />
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={[styles.visibilityButton, isDisabled && styles.buttonDisabled]}
          onPress={() => handleToggleVisibility(type)}
          activeOpacity={0.7}
          disabled={isDisabled}
        >
          <Icon
            name={showMpin ? "eye-off-outline" : "eye-outline"}
            size={SIZES.icon.md}
            color={isDisabled ? COLORS.disabled : COLORS.primary}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const isSubmitDisabled = loading || isLocked || 
    newMpin.some(digit => digit === "") || 
    confirmMpin.some(digit => digit === "");

  return (
    <SafeAreaView style={COMMON_STYLES.containerBlue}>
      <Toast />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.contentContainer}>
            
            {/* Header with Back Button */}
            <View style={styles.header}>
              <TouchableOpacity
                style={[styles.backButton, isLocked && styles.buttonDisabled]}
                onPress={handleBack}
                disabled={isLocked || loading}
                activeOpacity={0.7}
              >
                <Icon name="arrow-left" size={SIZES.icon.lg} color={isLocked ? COLORS.disabled : COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Reset MPIN</Text>
              <View style={styles.headerPlaceholder} />
            </View>

            {/* Lock Message */}
            {isLocked && (
              <View style={styles.lockContainer}>
                <Icon
                  name="lock-alert-outline"
                  size={SIZES.icon.xl}
                  color={COLORS.error}
                />
                <Text style={styles.lockTitle}>Account Temporarily Locked</Text>
                <Text style={styles.lockText}>
                  Please wait {formatTime(lockTime)} before trying again
                </Text>
                <View style={styles.timerContainer}>
                  <View 
                    style={[
                      styles.timerProgress,
                      { 
                        width: `${(1 - lockTime / LOCK_DURATION) * 100}%`,
                        backgroundColor: COLORS.error 
                      }
                    ]} 
                  />
                </View>
              </View>
            )}

            {/* Security Status */}
            <View style={styles.securityStatus}>
              <View style={styles.statusItem}>
                <Icon name="shield-check" size={SIZES.icon.sm} color={COLORS.success} />
                <Text style={styles.statusText}>Secure Reset</Text>
              </View>
              <View style={styles.statusItem}>
                <Icon name="key-change" size={SIZES.icon.sm} color={COLORS.info} />
                <Text style={styles.statusText}>Direct Reset</Text>
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Icon name="information-outline" size={SIZES.icon.md} color={COLORS.info} />
              <Text style={styles.instructionsText}>
                Set a new 4-digit MPIN for your account
              </Text>
            </View>

            {/* New MPIN Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>New MPIN</Text>
                {activeSection === "new" && (
                  <View style={styles.activeIndicator}>
                    <Icon name="circle" size={SIZES.icon.xs} color={COLORS.primary} />
                    <Text style={styles.activeText}>Entering</Text>
                  </View>
                )}
              </View>
              <Text style={styles.sectionSubtitle}>
                Create a new 4-digit security PIN
              </Text>
              {renderMpinInputs("new", newMpin, showNewMpin)}
            </View>

            {/* MPIN Strength Indicator */}
            {newMpin.join("").length === 4 && (
              <View style={styles.strengthContainer}>
                <Text style={styles.strengthTitle}>MPIN Strength:</Text>
                <View style={styles.validationList}>
                  <View style={styles.validationItem}>
                    <Icon 
                      name={mpinValidations.length ? "check-circle" : "alert-circle"} 
                      size={SIZES.icon.sm} 
                      color={mpinValidations.length ? COLORS.success : COLORS.warning} 
                    />
                    <Text style={[styles.validationText, mpinValidations.length && styles.validationTextSuccess]}>
                      4 digits exactly
                    </Text>
                  </View>
                  <View style={styles.validationItem}>
                    <Icon 
                      name={mpinValidations.consecutive ? "check-circle" : "alert-circle"} 
                      size={SIZES.icon.sm} 
                      color={mpinValidations.consecutive ? COLORS.success : COLORS.warning} 
                    />
                    <Text style={[styles.validationText, mpinValidations.consecutive && styles.validationTextSuccess]}>
                      No consecutive numbers
                    </Text>
                  </View>
                  <View style={styles.validationItem}>
                    <Icon 
                      name={mpinValidations.repeated ? "check-circle" : "alert-circle"} 
                      size={SIZES.icon.sm} 
                      color={mpinValidations.repeated ? COLORS.success : COLORS.warning} 
                    />
                    <Text style={[styles.validationText, mpinValidations.repeated && styles.validationTextSuccess]}>
                      No repeated digits
                    </Text>
                  </View>
                  <View style={styles.validationItem}>
                    <Icon 
                      name={mpinValidations.sequence ? "check-circle" : "alert-circle"} 
                      size={SIZES.icon.sm} 
                      color={mpinValidations.sequence ? COLORS.success : COLORS.warning} 
                    />
                    <Text style={[styles.validationText, mpinValidations.sequence && styles.validationTextSuccess]}>
                      No simple sequences
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Confirm MPIN Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Confirm MPIN</Text>
                {activeSection === "confirm" && (
                  <View style={styles.activeIndicator}>
                    <Icon name="circle" size={SIZES.icon.xs} color={COLORS.primary} />
                    <Text style={styles.activeText}>Entering</Text>
                  </View>
                )}
              </View>
              <Text style={styles.sectionSubtitle}>
                Re-enter your new MPIN to confirm
              </Text>
              {renderMpinInputs("confirm", confirmMpin, showConfirmMpin)}
            </View>

            {/* Attempts Counter */}
            {attempts > 0 && !isLocked && (
              <View style={styles.attemptsContainer}>
                <Icon
                  name="alert-circle-outline"
                  size={SIZES.icon.md}
                  color={COLORS.warning}
                />
                <Text style={styles.attemptsText}>
                  {attempts} mismatch attempt{attempts !== 1 ? "s" : ""}
                </Text>
                <View style={styles.attemptsDots}>
                  {[1, 2, 3].map((dot) => (
                    <View
                      key={dot}
                      style={[
                        styles.attemptDot,
                        dot <= attempts && styles.attemptDotFilled,
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.resetButton, isLocked && styles.buttonDisabled]}
                onPress={resetAllMpin}
                disabled={isLocked || loading}
                activeOpacity={0.7}
              >
                <Icon name="refresh" size={SIZES.icon.sm} color={isLocked ? COLORS.disabled : COLORS.primary} />
                <Text style={[styles.resetButtonText, isLocked && { color: COLORS.disabled }]}>
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitDisabled && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitDisabled}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                {loading ? (
                  <>
                    <Icon name="loading" size={SIZES.icon.md} color={COLORS.white} />
                    <Text style={styles.buttonText}>Resetting...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.buttonText}>
                      {isLocked ? "Account Locked" : "Reset MPIN"}
                    </Text>
                    {!isLocked && !loading && (
                      <Icon
                        name="check-circle"
                        size={SIZES.icon.md}
                        color={COLORS.white}
                        style={styles.buttonIcon}
                      />
                    )}
                  </>
                )}
              </View>
            </TouchableOpacity>

            {/* Security Info */}
            <View style={styles.securityContainer}>
              <Icon name="shield-lock" size={SIZES.icon.sm} color={COLORS.success} />
              <Text style={styles.securityText}>
                Your new MPIN will be encrypted and stored securely
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotMpin;