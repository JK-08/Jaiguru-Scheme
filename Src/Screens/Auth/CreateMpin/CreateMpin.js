import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMpin } from "../../../Hooks/useMpin";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "./CreateMpinStyles";
import { COLORS, FONTS, COMMON_STYLES } from "../../../Utills/AppTheme";

const MpinCreateScreen = () => {
  const navigation = useNavigation();
  const { createMpin, loading, error, message } = useMpin();

  const [mpin, setMpin] = useState(["", "", "", ""]);
  const [confirmMpin, setConfirmMpin] = useState(["", "", "", ""]);
  const [activeInput, setActiveInput] = useState(null);
  const [showMpin, setShowMpin] = useState(false);
  const [showConfirmMpin, setShowConfirmMpin] = useState(false);
  const [validationError, setValidationError] = useState("");

  const mpinRefs = useRef([]);
  const confirmMpinRefs = useRef([]);

  // Check if all inputs are filled
  const isMpinComplete = mpin.every((digit) => digit !== "");
  const isConfirmMpinComplete = confirmMpin.every((digit) => digit !== "");

  // Check if both MPINs match
  const mpinString = mpin.join("");
  const confirmMpinString = confirmMpin.join("");
  const doMpinsMatch =
    mpinString === confirmMpinString && mpinString.length === 4;

  // Enable submit button only when conditions are met
  const isSubmitEnabled =
    isMpinComplete && isConfirmMpinComplete && !validationError;

  // Check for weak MPIN patterns
  const checkWeakMpin = (mpin) => {
    const weakPatterns = [
      "1234",
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
      "4321",
      "1004",
      "2000",
      "1212",
      "2001",
      "1010",
    ];

    // Check sequential
    const isSequential =
      parseInt(mpin) === 1234 ||
      parseInt(mpin) === 4321 ||
      parseInt(mpin) === 9876 ||
      parseInt(mpin) === 6789;

    // Check repeated digits
    const isRepeated = /^(\d)\1{3}$/.test(mpin);

    if (weakPatterns.includes(mpin)) {
      return "This MPIN is too common and easy to guess. Please choose a more secure combination.";
    }

    if (isSequential) {
      return "Sequential numbers (1234, 9876, etc.) are not secure. Please choose a random combination.";
    }

    if (isRepeated) {
      return "Repeating digits (1111, 2222, etc.) are not secure. Please choose a random combination.";
    }

    return "";
  };

  const handleMpinChange = (text, index) => {
    // Allow only numbers and limit to 1 digit
    const numericText = text.replace(/[^0-9]/g, "").slice(0, 1);

    const newMpin = [...mpin];
    newMpin[index] = numericText;
    setMpin(newMpin);

    // Clear validation error when user starts typing
    setValidationError("");

    if (numericText && index < 3) {
      mpinRefs.current[index + 1]?.focus();
    }

    // Validate MPIN when all digits are filled
    const updatedMpinString = newMpin.join("");
    if (updatedMpinString.length === 4) {
      const errorMessage = checkWeakMpin(updatedMpinString);
      if (errorMessage) {
        setValidationError(errorMessage);
      }
    }
  };

  const handleConfirmMpinChange = (text, index) => {
    // Allow only numbers and limit to 1 digit
    const numericText = text.replace(/[^0-9]/g, "").slice(0, 1);

    const newConfirmMpin = [...confirmMpin];
    newConfirmMpin[index] = numericText;
    setConfirmMpin(newConfirmMpin);

    if (numericText && index < 3) {
      confirmMpinRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index, isConfirm = false) => {
    if (e.nativeEvent.key === "Backspace") {
      if (isConfirm ? !confirmMpin[index] : !mpin[index]) {
        if (index > 0) {
          if (isConfirm) {
            confirmMpinRefs.current[index - 1]?.focus();
          } else {
            mpinRefs.current[index - 1]?.focus();
          }
        }
      }
    }
  };

  useEffect(() => {
    AsyncStorage.getItem("hasMpin").then((v) => {
      if (v === "true") {
        navigation.replace("MpinVerify");
      }
    });
  }, [navigation]);

  const handleSubmit = async () => {
    if (!isSubmitEnabled) return;

    const mpinString = mpin.join("");
    const confirmMpinString = confirmMpin.join("");

    // Final validation
    const errorMessage = checkWeakMpin(mpinString);
    if (errorMessage) {
      setValidationError(errorMessage);
      Alert.alert("Weak MPIN", errorMessage);
      return;
    }

    if (mpinString.length !== 4) {
      Alert.alert("Invalid MPIN", "Please enter a 4-digit MPIN");
      return;
    }

    if (confirmMpinString.length !== 4) {
      Alert.alert("Invalid Confirmation", "Please confirm your 4-digit MPIN");
      return;
    }

    if (mpinString !== confirmMpinString) {
      Alert.alert("MPIN Mismatch", "MPIN and confirmation do not match");
      return;
    }

    try {
      await createMpin(mpinString);
      await AsyncStorage.setItem("hasMpin", "true");

      Alert.alert("Success", "MPIN created successfully!", [
        {
          text: "OK",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            });
          },
        },
      ]);
    } catch (err) {
      console.log("Error creating MPIN:", err);
      const errorMessage = err?.message || "Something went wrong";

      if (errorMessage.includes("MPIN already exists")) {
        await AsyncStorage.setItem("hasMpin", "true");

        Alert.alert(
          "MPIN Already Set",
          "You already have an MPIN. Please verify to continue.",
          [
            {
              text: "Verify MPIN",
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "MpinVerify" }],
                });
              },
            },
          ],
        );
        return;
      }

      Alert.alert("Error", errorMessage);
    }
  };

  const renderMpinInputs = (isConfirm = false) => {
    const values = isConfirm ? confirmMpin : mpin;
    const refs = isConfirm ? confirmMpinRefs : mpinRefs;
    const showValue = isConfirm ? showConfirmMpin : showMpin;
    const baseIndex = isConfirm ? 4 : 0;

    return (
      <View style={styles.mpinContainer}>
        {[0, 1, 2, 3].map((index) => {
          const isFocused = activeInput === baseIndex + index;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => refs.current[index]?.focus()}
              activeOpacity={1}
              style={[
                styles.mpinDigitContainer,
                isFocused && styles.mpinDigitContainerFocused,
                values[index] && styles.mpinDigitContainerFilled,
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
                caretHidden={false}
                selectTextOnFocus
                contextMenuHidden={true}
              />
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={styles.visibilityButton}
          onPress={() =>
            isConfirm
              ? setShowConfirmMpin(!showConfirmMpin)
              : setShowMpin(!showMpin)
          }
        >
          <Icon
            name={showValue ? "eye-off" : "eye"}
            size={24}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={COMMON_STYLES.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Create MPIN</Text>
              <Text style={styles.headerSubtitle}>Secure Your Account</Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          {/* Premium Card - Reduced Height */}
          <View style={styles.premiumCard}>
              <Text style={styles.mainTitle}>Create Secure MPIN</Text>
              <Text style={styles.subtitle}>
                Set up a 4-digit MPIN for enhanced account protection
              </Text>
          </View>

          {/* MPIN Input Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon
                name="numeric-1-circle"
                size={20}
                color={COLORS.primary}
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionTitle}>Enter MPIN</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Choose a 4-digit number you'll remember easily
            </Text>
            {renderMpinInputs()}
          </View>

          {/* Confirm MPIN Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon
                name="numeric-2-circle"
                size={20}
                color={COLORS.primary}
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionTitle}>Confirm MPIN</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Re-enter your MPIN to ensure accuracy
            </Text>
            {renderMpinInputs(true)}
          </View>

          {/* Validation Error */}
          {validationError && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color={COLORS.error} />
              <Text style={styles.errorText}>{validationError}</Text>
            </View>
          )}

          {/* API Error Messages */}
          {error && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {message && (
            <View style={styles.successContainer}>
              <Icon name="check-circle" size={20} color={COLORS.success} />
              <Text style={styles.successText}>{message}</Text>
            </View>
          )}
          {isConfirmMpinComplete && mpinString !== confirmMpinString && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color={COLORS.error} />
              <Text style={styles.errorText}>
                MPIN and Confirm MPIN do not match
              </Text>
            </View>
          )}

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Icon
              name="shield-alert"
              size={20}
              color={COLORS.primary}
              style={styles.infoIcon}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Security Guidelines</Text>
              <View style={styles.infoList}>
                <View style={styles.infoListItem}>
                  <Icon name="check-circle" size={14} color={COLORS.success} />
                  <Text style={styles.infoText}>Must be exactly 4 digits</Text>
                </View>
                <View style={styles.infoListItem}>
                  <Icon name="check-circle" size={14} color={COLORS.success} />
                  <Text style={styles.infoText}>
                    Avoid common patterns (1234, 1111, etc.)
                  </Text>
                </View>
                <View style={styles.infoListItem}>
                  <Icon name="check-circle" size={14} color={COLORS.success} />
                  <Text style={styles.infoText}>Do not share with anyone</Text>
                </View>
                <View style={styles.infoListItem}>
                  <Icon name="check-circle" size={14} color={COLORS.success} />
                  <Text style={styles.infoText}>Can be reset if forgotten</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                styles.buttonGold,
                !isSubmitEnabled && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isSubmitEnabled || loading}
              activeOpacity={isSubmitEnabled ? 0.7 : 1}
            >
              {loading ? (
                <View style={styles.buttonLoading}>
                  <Icon
                    name="loading"
                    size={20}
                    color={COLORS.white}
                    style={styles.loadingIcon}
                  />
                  <Text style={FONTS.button}>Creating...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Icon name="lock-check" size={20} color={COLORS.white} />
                  <Text style={FONTS.button}>
                    {isSubmitEnabled ? "Create MPIN" : "Complete MPIN Fields"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.navigate("MpinVerify")}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MpinCreateScreen;
