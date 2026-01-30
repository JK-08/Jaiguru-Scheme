import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useAuth from "../../../Hooks/useRegister";
import { useCompany } from "../../../Hooks/useCompany";
import theme from "../../../Utills/AppTheme";
import defaultLogo from "../../../Assets/Company/logo.png";
import { useToast } from "../../../Components/Toast/Toast";

GoogleSignin.configure({
  webClientId:
    "792128292012-161kjb3ap6f2msun0h56d4k8m0kfqs5l.apps.googleusercontent.com",
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

const LoginScreen = () => {
  const navigation = useNavigation();
  const { company, loading: companyLoading } = useCompany();
  const { login, loginWithGoogle, loading, error, clearError } = useAuth();

  const { showToast, hideToast, Toast } = useToast();

  const [logoError, setLogoError] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);
  const companyLogoUrl = company?.CompanyLogoUrl ?? null;

  const [formData, setFormData] = useState({
    contactOrEmailOrUsername: "",
    password: "",
  });
  const [googleLoading, setGoogleLoading] = useState(false);

  // Reset logo loading state when company changes
  useEffect(() => {
    if (company) {
      setLogoError(false);
      setLogoLoading(true);
    }
  }, [company]);

  // Show toast when error changes
  useEffect(() => {
    if (error) {
      showToast({
        message: error,
        type: "error",
        title: "Login Error",
        duration: 4000,
        position: "bottom",
        animationType: "slide",
      });
    }
  }, [error]);

  // Debug: Log company data when it loads
  useEffect(() => {
    if (company) {
      console.log("=== COMPANY DATA LOADED ===");
      console.log("Company Name:", company.CompanyName);
      console.log("Company Logo URL:", company.CompanyLogoUrl);
      console.log("Full Company Data:", JSON.stringify(company, null, 2));
    }
  }, [company]);

  const handleImageError = () => {
    console.log("Failed to load company logo from URL:", companyLogoUrl);
    setLogoError(true);
    setLogoLoading(false);
  };

  const handleImageLoad = () => {
    setLogoLoading(false);
    setLogoError(false);
  };

  const validateInput = () => {
    const { contactOrEmailOrUsername, password } = formData;

    if (!contactOrEmailOrUsername || !password) {
      showToast({
        message: "Please fill in all fields",
        type: "warning",
        title: "Validation Error",
        duration: 3000,
        position: "top",
      });
      return false;
    }

    // Check if input is a contact number (10 digits)
    if (/^\d+$/.test(contactOrEmailOrUsername)) {
      if (!/^\d{10}$/.test(contactOrEmailOrUsername)) {
        showToast({
          message: "Please enter a valid 10-digit contact number",
          type: "warning",
          title: "Invalid Contact",
          duration: 3000,
        });
        return false;
      }
    } else if (contactOrEmailOrUsername.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactOrEmailOrUsername)) {
        showToast({
          message: "Please enter a valid email address",
          type: "warning",
          title: "Invalid Email",
          duration: 3000,
        });
        return false;
      }
    }

    return true;
  };

  const navigateAfterLogin = async () => {
    try {
      console.log("=== NAVIGATE AFTER LOGIN STARTED ===");
      
      // Read and log all AsyncStorage data
      const allKeys = await AsyncStorage.getAllKeys();
      console.log("All AsyncStorage keys:", allKeys);
      
      const multiData = await AsyncStorage.multiGet(allKeys);
      console.log("=== ASYNC STORAGE CONTENTS ===");
      multiData.forEach(([key, value]) => {
        console.log(`${key}:`, value);
      });
      
      const hasMpin = await AsyncStorage.getItem("hasMpin");
      console.log("hasMpin value:", hasMpin);
      
      const authToken = await AsyncStorage.getItem("authToken");
      console.log("authToken exists:", !!authToken);
      
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        console.log("User Data from AsyncStorage:", userData);
        console.log("User ID:", userData.id || userData._id);
        console.log("User Email:", userData.email);
        console.log("User Contact:", userData.contactNumber || userData.phone);
        console.log("Username:", userData.username || userData.name);
      }

      if (hasMpin === "true") {
        console.log("Navigating to MpinVerify");
        navigation.replace("MpinVerify");
      } else {
        console.log("Navigating to MpinCreate");
        navigation.replace("MpinCreate");
      }
    } catch (error) {
      console.log("MPIN check failed:", error);
      console.log("Error details:", error.message);
      console.log("Error stack:", error.stack);
      navigation.replace("MpinCreate");
    }
  };

  const handleLogin = async () => {
    if (!validateInput()) return;

    try {
      clearError();

      console.log("=== LOGIN ATTEMPT STARTED ===");
      console.log("Form Data:", formData);

      // Show loading toast
      showToast({
        message: "Logging in...",
        type: "progress",
        title: "Please wait",
        showProgress: true,
        progress: 50,
        duration: 0,
      });

      const result = await login(formData);

      console.log("=== LOGIN API RESPONSE ===");
      console.log("Full Response:", JSON.stringify(result, null, 2));
      console.log("Result type:", typeof result);
      console.log("Has token:", !!result.token);
      console.log("Success flag:", result.success);
      console.log("Status:", result.status);
      console.log("Message:", result.message);
      console.log("User data present:", !!result.user);

      // Hide loading toast
      hideToast();

      // Check for success - based on your response structure
      if (
        result.token ||
        result.success === true ||
        result.status === "success"
      ) {
        // Show success toast
        showToast({
          message: "Login successful! Redirecting...",
          type: "success",
          title: "Welcome back!",
          duration: 2000,
          animationType: "bounce",
        });

        // Store auth token
        if (result.token) {
          await AsyncStorage.setItem("authToken", result.token);
          console.log("Auth token stored:", result.token.substring(0, 20) + "...");
        } else {
          console.warn("No token received in response");
        }

        // Store user data
        const userData = result.user || result;
        console.log("User data to store:", userData);
        
        // Log specific user fields
        console.log("User ID:", userData.id || userData._id);
        console.log("User Email:", userData.email);
        console.log("Username:", userData.username || userData.name);
        console.log("Contact:", userData.contactNumber || userData.phone);
        
        await AsyncStorage.setItem("userData", JSON.stringify(userData));
        console.log("User data stored in AsyncStorage");

        // Verify storage
        const storedUserData = await AsyncStorage.getItem("userData");
        console.log("Verification - Retrieved user data:", storedUserData ? JSON.parse(storedUserData) : "No data");

        // Navigate after a short delay for toast visibility
        setTimeout(() => {
          navigateAfterLogin();
        }, 1500);
      } else {
        // Show the server message directly without modification
        const serverMessage =
          result?.message ||
          result?.errorMessage ||
          "Login failed. Please try again.";

        console.log("Login failed. Server message:", serverMessage);

        // Special handling for Google account detected message
        if (
          serverMessage.toLowerCase().includes("google account detected") ||
          serverMessage.toLowerCase().includes("login via google") ||
          serverMessage.toLowerCase().includes("registered with google")
        ) {
          // Show an alert instead of toast for this specific case
          Alert.alert(
            "Google Account Detected",
            "You have previously registered with Google. You don't have a password set for this account.\n\nPlease choose an option:",
            [
              {
                text: "Login with Google",
                onPress: handleGoogleLogin,
                style: "default",
              },
              {
                text: "Set Password",
                onPress: navigateToForgotPassword,
                style: "destructive",
              },
              {
                text: "Cancel",
                style: "cancel",
              },
            ],
            { cancelable: true },
          );
        } else {
          // For all other error messages, show normal toast
          showToast({
            message: serverMessage,
            type: "error",
            title: "Login Failed",
            duration: 4000,
            animationType: "slide",
          });
        }
      }
    } catch (err) {
      console.log("=== LOGIN ERROR CATCH BLOCK ===");
      console.log("Error:", err);
      console.log("Error message:", err.message);
      console.log("Error stack:", err.stack);
      
      hideToast();

      const errorMessage = err.message || "Login failed. Please try again.";

      showToast({
        message: errorMessage,
        type: "error",
        title: "Error",
        duration: 4000,
        position: "bottom",
        animationType: "slide",
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      clearError();

      console.log("=== GOOGLE LOGIN STARTED ===");

      // Show loading toast for Google login
      showToast({
        message: "Connecting to Google...",
        type: "progress",
        title: "Google Sign In",
        showProgress: true,
        progress: 30,
      });

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const userInfo = await GoogleSignin.signIn();
      console.log("Google Sign-In User Info:", userInfo);
      console.log("Google ID Token:", userInfo.data?.idToken ? "Present" : "Missing");

      const idToken = userInfo.data?.idToken || userInfo.idToken;

      if (!idToken) {
        hideToast();
        console.error("No ID token received from Google");
        showToast({
          message: "Failed to get authentication token. Please try again.",
          type: "error",
          title: "Google Error",
          duration: 4000,
        });
        return;
      }

      // Update toast progress
      showToast({
        message: "Authenticating with server...",
        type: "progress",
        title: "Google Sign In",
        showProgress: true,
        progress: 70,
      });

      console.log("Calling loginWithGoogle API with ID token...");
      const result = await loginWithGoogle({ idToken });

      console.log("=== GOOGLE LOGIN API RESPONSE ===");
      console.log("Full Response:", JSON.stringify(result, null, 2));
      console.log("Token:", result.token ? "Present" : "Missing");
      console.log("Contact Number:", result.contactNumber);
      console.log("Requires Contact Verification:", result.requiresContactVerification);

      hideToast();

      // Check if contact verification is needed
      if (
        !result.contactNumber ||
        result.contactNumber === null ||
        result.contactNumber === "" ||
        result.requiresContactVerification
      ) {
        console.log("Contact verification needed, navigating to verification screen");
        
        showToast({
          message: "Please verify your contact number to continue",
          type: "info",
          title: "Contact Verification",
          duration: 3000,
        });

        navigation.navigate("GoogleContactVerification", {
          googleData: {
            userId: result.id,
            email: result.email,
            name: result.username,
            picture: result.picture,
            referralCode: result.referralCode,
            token: result.token,
            socialMedia: result.socialMedia,
            isLogin: true,
            existingUser: result.existingUser || false,
          },
        });
      } else {
        showToast({
          message: "Google login successful!",
          type: "success",
          title: "Welcome!",
          duration: 2000,
          animationType: "scale",
        });

        // Store data in AsyncStorage
        console.log("=== STORING GOOGLE LOGIN DATA ===");
        
        if (result.token) {
          await AsyncStorage.setItem("authToken", result.token);
          console.log("Google auth token stored");
        }

        const userDataToStore = {
          id: result.id,
          username: result.username,
          email: result.email,
          contactNumber: result.contactNumber,
          picture: result.picture,
          referralCode: result.referralCode,
          socialMedia: result.socialMedia,
          ...(result.userData || {}),
        };

        console.log("User data to store:", userDataToStore);
        await AsyncStorage.setItem("userData", JSON.stringify(userDataToStore));
        console.log("User data stored successfully");

        // Verify storage
        const storedToken = await AsyncStorage.getItem("authToken");
        const storedUserData = await AsyncStorage.getItem("userData");
        console.log("Verification - Token stored:", !!storedToken);
        console.log("Verification - User data stored:", !!storedUserData);

        setTimeout(() => {
          navigateAfterLogin();
        }, 1500);
      }
    } catch (error) {
      console.log("=== GOOGLE SIGN-IN ERROR ===");
      console.log("Error Code:", error.code);
      console.log("Error Message:", error.message);
      console.log("Full Error:", error);

      hideToast();

      let errorMessage = "Google Sign-In failed. Please try again.";

      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          errorMessage = "Sign in cancelled by user";
          break;
        case statusCodes.IN_PROGRESS:
          errorMessage = "Sign in already in progress";
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          errorMessage = "Google Play Services not available or outdated";
          break;
        default:
          if (error.message?.includes("JSON Parse error")) {
            errorMessage =
              "Server error. Please check your internet connection or try again later.";
          } else if (error.message?.includes("User not found")) {
            errorMessage =
              "No account found with this Google account. Please register first.";
          }
          break;
      }

      showToast({
        message: errorMessage,
        type: "error",
        title: "Google Sign In Failed",
        duration: 5000,
        position: "bottom",
        showCloseButton: true,
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const navigateToForgotPassword = () => {
    console.log("Navigating to ForgotPassword");
    showToast({
      message: "Redirecting to password recovery...",
      type: "info",
      title: "Setting New Password",
      duration: 2000,
    });
    navigation.navigate("ForgotPassword");
  };

  const navigateToRegister = () => {
    console.log("Navigating to Register");
    showToast({
      message: "Redirecting to registration...",
      type: "info",
      title: "Sign Up",
      duration: 2000,
    });
    navigation.navigate("Register");
  };

  // Debug function to check AsyncStorage
  const debugAsyncStorage = async () => {
    try {
      console.log("=== DEBUG: ASYNC STORAGE CHECK ===");
      const keys = await AsyncStorage.getAllKeys();
      console.log("Total keys:", keys.length);
      
      const items = await AsyncStorage.multiGet(keys);
      items.forEach(([key, value]) => {
        console.log(`Key: ${key}`);
        console.log(`Value: ${value}`);
        console.log(`Length: ${value ? value.length : 0}`);
        console.log('---');
      });
    } catch (error) {
      console.log("Debug AsyncStorage error:", error);
    }
  };

  // Call debug on component mount
  useEffect(() => {
    console.log("=== LOGIN SCREEN MOUNTED ===");
    debugAsyncStorage();
  }, []);

  const isLoading = loading || googleLoading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Company Logo Section */}
        <View style={styles.logoContainer}>
          {companyLoading ? (
            <ActivityIndicator size="small" color={theme.COLORS.primary} />
          ) : (
            <View style={styles.imageContainer}>
              {logoLoading && !logoError && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="small"
                    color={theme.COLORS.primary}
                  />
                </View>
              )}

              {!logoError && companyLogoUrl ? (
                <Image
                  source={{ uri: companyLogoUrl }}
                  style={styles.logo}
                  resizeMode="contain"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  defaultSource={defaultLogo}
                />
              ) : (
                <Image
                  source={defaultLogo}
                  style={styles.logo}
                  resizeMode="contain"
                  onLoad={() => {
                    setLogoLoading(false);
                    setLogoError(false);
                  }}
                />
              )}
            </View>
          )}
        </View>

        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Contact, Email or Username *</Text>
            <TextInput
              style={styles.input}
              value={formData.contactOrEmailOrUsername}
              onChangeText={(value) =>
                handleInputChange("contactOrEmailOrUsername", value)
              }
              placeholder="Enter contact number, email or username"
              placeholderTextColor={theme.COLORS.textTertiary}
              autoCapitalize="none"
              editable={!isLoading}
            />
            <Text style={styles.hintText}>
              Enter your 10-digit contact number, email address, or username
            </Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(value) => handleInputChange("password", value)}
              placeholder="Enter your password"
              placeholderTextColor={theme.COLORS.textTertiary}
              secureTextEntry
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={navigateToForgotPassword}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.forgotPasswordText,
                  isLoading && { opacity: 0.5 },
                ]}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={theme.COLORS.white} size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
            disabled={isLoading}
            style={[styles.googleButton, isLoading && styles.buttonDisabled]}
            activeOpacity={0.8}
          >
            {googleLoading ? (
              <ActivityIndicator
                color={theme.COLORS.textPrimary}
                size="small"
              />
            ) : (
              <>
                <Icon name="google" size={20} color="#DB4437" />
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={navigateToRegister}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={[styles.registerLink, isLoading && { opacity: 0.5 }]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Toast Component */}
      <Toast />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.SIZES.padding.container,
    paddingTop: theme.SIZES.sm,
    paddingBottom: theme.SIZES.xl,
  },
  // Logo Section
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: theme.SIZES.md,
    marginTop: theme.SIZES.xs,
  },
  imageContainer: {
    position: "relative",
    width: 100,
    height: 100,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 15,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.COLORS.backgroundLight,
    borderRadius: 10,
    zIndex: 1,
  },
  companyName: {
    marginTop: theme.SIZES.sm,
    ...theme.FONTS.h4,
    color: theme.COLORS.primary,
    textAlign: "center",
    fontWeight: "bold",
  },
  // Header
  headerContainer: {
    alignItems: "center",
    marginBottom: theme.SIZES.lg,
  },
  title: {
    ...theme.FONTS.h1,
    color: theme.COLORS.primary,
    textAlign: "center",
  },
  subtitle: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textSecondary,
    textAlign: "center",
    marginTop: theme.SIZES.sm,
  },
  formContainer: {
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.SIZES.radius.lg,
    padding: theme.SIZES.padding.md,
    marginBottom: theme.SIZES.xl,
    ...theme.SHADOWS.md,
  },
  fieldContainer: {
    marginBottom: theme.SIZES.md,
  },
  label: {
    ...theme.FONTS.label,
    color: theme.COLORS.textPrimary,
    marginBottom: theme.SIZES.xs,
  },
  input: {
    ...theme.COMMON_STYLES.input.default,
    borderColor: theme.COLORS.gray300,
    fontSize: theme.SIZES.font.md,
    fontFamily: theme.FONTS.family.regular,
    color: theme.COLORS.textPrimary,
    height: theme.SIZES.input.height,
  },
  hintText: {
    ...theme.FONTS.caption,
    color: theme.COLORS.textTertiary,
    marginTop: theme.SIZES.xs,
    fontStyle: "italic",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: theme.SIZES.xs,
  },
  forgotPasswordText: {
    ...theme.FONTS.caption,
    color: theme.COLORS.goldPrimary,
  },
  loginButton: {
    backgroundColor: theme.COLORS.goldPrimary,
    borderRadius: theme.SIZES.radius.button,
    height: theme.SIZES.button.height.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.SIZES.md,
    ...theme.SHADOWS.gold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    ...theme.FONTS.buttonLarge,
    color: theme.COLORS.primary,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.SIZES.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.COLORS.gray300,
  },
  dividerText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textSecondary,
    marginHorizontal: theme.SIZES.md,
  },
  googleButton: {
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.SIZES.radius.button,
    height: theme.SIZES.button.height.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: theme.COLORS.gray300,
    ...theme.SHADOWS.sm,
  },
  googleButtonText: {
    ...theme.FONTS.bodyMedium,
    color: theme.COLORS.textPrimary,
    marginLeft: theme.SIZES.sm,
  },
  // Debug button styles (only in development)
  debugButton: {
    backgroundColor: '#666',
    borderRadius: theme.SIZES.radius.button,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.SIZES.md,
  },
  debugButtonText: {
    color: theme.COLORS.white,
    fontSize: 12,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.SIZES.sm,
  },
  registerText: {
    ...theme.FONTS.body,
    color: theme.COLORS.textSecondary,
  },
  registerLink: {
    ...theme.FONTS.bodyBold,
    color: theme.COLORS.goldPrimary,
  },
});

export default LoginScreen;