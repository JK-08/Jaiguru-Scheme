// MpinVerifyScreen.js
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useMpin } from "../../../Hooks/useMpin";
import { useToast, ToastTypes, ToastPositions } from "../../../Components/Toast/Toast";
import { COLORS, FONTS, COMMON_STYLES, SIZES } from "../../../Utills/AppTheme";
import styles from "./VerifyMpinStyles";

const MpinVerifyScreen = () => {
  const navigation = useNavigation();
  const { verifyMpin, loading } = useMpin();
  const { showToast, Toast } = useToast();

  const [mpin, setMpin] = useState(["", "", "", ""]);
  const [showMpin, setShowMpin] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(null);

  const mpinRefs = useRef([]);
  const timerRef = useRef(null);
  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION = 60; // 1 minute in seconds

  // Handle lock timer
  useEffect(() => {
    if (locked && lockTime > 0) {
      timerRef.current = setInterval(() => {
        setLockTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setLocked(false);
            setAttempts(0);
            resetMpin();
            mpinRefs.current[0]?.focus();
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
  }, [locked, lockTime]);

  const resetMpin = () => {
    setMpin(["", "", "", ""]);
    setFocusedIndex(null);
  };

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, []);

  const handleMpinChange = useCallback((text, index) => {
    if (locked) return;

    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, "").slice(0, 1);
    
    const newMpin = [...mpin];
    newMpin[index] = numericText;
    setMpin(newMpin);

    if (numericText && index < 3) {
      setTimeout(() => {
        mpinRefs.current[index + 1]?.focus();
      }, 50);
    }

    if (numericText && index === 3) {
      const mpinString = newMpin.join("");
      setTimeout(() => handleSubmit(mpinString), 100);
    }
  }, [locked, mpin]);

  const handleKeyPress = useCallback((e, index) => {
    if (e.nativeEvent.key === "Backspace" && !mpin[index] && index > 0) {
      mpinRefs.current[index - 1]?.focus();
    }
  }, [mpin]);

  const handleSubmit = useCallback(async (mpinValue = null) => {
    if (locked) return;

    const mpinString = mpinValue || mpin.join("");

    if (mpinString.length !== 4) {
      showToast({
        message: "Please enter a 4-digit MPIN",
        type: ToastTypes.WARNING,
        duration: 3000,
        position: ToastPositions.TOP,
      });
      return;
    }

    try {
      await verifyMpin(mpinString);
      
      // Success
      resetMpin();
      setAttempts(0);

      showToast({
        message: "MPIN verified successfully!",
        type: ToastTypes.SUCCESS,
        duration: 2000,
        position: ToastPositions.TOP,
      });

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      }, 500);
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setLocked(true);
        setLockTime(LOCK_DURATION);

        showToast({
          title: "Account Locked",
          message: `Too many failed attempts. Please wait ${LOCK_DURATION / 60} minute${LOCK_DURATION > 60 ? 's' : ''}.`,
          type: ToastTypes.ERROR,
          duration: 5000,
          position: ToastPositions.TOP,
        });
      } else {
        resetMpin();
        setTimeout(() => mpinRefs.current[0]?.focus(), 100);

        showToast({
          title: "Invalid MPIN",
          message: `Incorrect MPIN. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts > 1 ? "s" : ""} remaining.`,
          type: ToastTypes.WARNING,
          duration: 4000,
          position: ToastPositions.TOP,
        });
      }
    }
  }, [locked, mpin, attempts, verifyMpin, showToast, navigation]);

  const handleForgotMpin = useCallback(() => {
    if (locked) return;

    Alert.alert(
      "Forgot MPIN?",
      "Do you want to reset your MPIN?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset MPIN",
          style: "destructive",
          onPress: () => {
            showToast({
              message: "Redirecting to MPIN reset...",
              type: ToastTypes.INFO,
              duration: 2000,
              position: ToastPositions.TOP,
            });
            
            setTimeout(() => {
              navigation.navigate("ForgotMpin");
            }, 500);
          },
        },
      ]
    );
  }, [navigation, showToast, locked]);

  const handleToggleVisibility = useCallback(() => {
    setShowMpin(!showMpin);
  }, [showMpin]);

  const renderMpinInputs = useCallback(() => {
    return (
      <View style={styles.mpinContainer}>
        {[0, 1, 2, 3].map((index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.mpinDigitContainer,
              focusedIndex === index && styles.mpinDigitContainerFocused,
              mpin[index] && styles.mpinDigitContainerFilled,
              locked && styles.mpinDigitContainerDisabled,
            ]}
            onPress={() => !locked && mpinRefs.current[index]?.focus()}
            activeOpacity={0.7}
            disabled={locked}
          >
            <TextInput
              ref={(ref) => (mpinRefs.current[index] = ref)}
              style={[
                styles.mpinDigitInput,
                mpin[index] && styles.mpinDigitInputFilled,
              ]}
              value={mpin[index]}
              onChangeText={(text) => handleMpinChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              keyboardType="number-pad"
              maxLength={1}
              secureTextEntry={!showMpin}
              textAlign="center"
              caretHidden={false}
              editable={!locked}
              selectTextOnFocus={!locked}
              contextMenuHidden={true}
              autoComplete="off"
              importantForAutofill="no"
              pointerEvents={locked ? "none" : "auto"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [mpin, showMpin, locked, focusedIndex, handleMpinChange, handleKeyPress, handleToggleVisibility]);

  const isSubmitDisabled = loading || locked || mpin.some(digit => digit === "");

  return (
    <SafeAreaView style={COMMON_STYLES.containerBlue}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        {/* Toast Component at TOP */}
        <Toast />

        {/* Main Content Container */}
        <View style={styles.contentContainer}>
          
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Icon
                name="shield-check-outline"
                size={SIZES.icon.xxxl}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.title}>Verify MPIN</Text>
            <Text style={styles.subtitle}>
              Enter your 4-digit security PIN to access your account
            </Text>
          </View>

          {/* Lock Message */}
          {locked && (
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
              <Text style={styles.statusText}>Secure Connection</Text>
            </View>
            <View style={styles.statusItem}>
              <Icon name="lock-outline" size={SIZES.icon.sm} color={COLORS.info} />
              <Text style={styles.statusText}>End-to-End Encrypted</Text>
            </View>
          </View>

          {/* MPIN Input Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Enter 4-digit MPIN</Text>
            <Text style={styles.sectionSubtitle}>
              {locked 
                ? "Please wait for the timer to complete"
                : "Enter the MPIN you created earlier"}
            </Text>
            {renderMpinInputs()}
          </View>

          {/* Attempts Counter */}
          {attempts > 0 && !locked && (
            <View style={styles.attemptsContainer}>
              <Icon
                name="alert-circle-outline"
                size={SIZES.icon.md}
                color={COLORS.warning}
              />
              <Text style={styles.attemptsText}>
                {attempts} failed attempt{attempts !== 1 ? "s" : ""}
              </Text>
              <View style={styles.attemptsDots}>
                {[1, 2, 3, 4, 5].map((dot) => (
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
              style={[styles.forgotButton, locked && styles.buttonDisabled]}
              onPress={handleForgotMpin}
              disabled={locked}
              activeOpacity={0.7}
            >
              <Icon name="key-outline" size={SIZES.icon.sm} color={COLORS.primary} />
              <Text style={styles.forgotButtonText}>Forgot MPIN?</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitDisabled && styles.submitButtonDisabled,
            ]}
            onPress={() => handleSubmit()}
            disabled={isSubmitDisabled}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              {loading ? (
                <>
                  <Icon name="loading" size={SIZES.icon.md} color={COLORS.white} />
                  <Text style={styles.buttonText}>Verifying...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.buttonText}>
                    {locked ? "Account Locked" : "Verify & Continue"}
                  </Text>
                  {!locked && !loading && (
                    <Icon
                      name="arrow-right"
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
            <Icon name="shield-check" size={SIZES.icon.sm} color={COLORS.success} />
            <Text style={styles.securityText}>
              Your MPIN is stored securely on your device
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MpinVerifyScreen;