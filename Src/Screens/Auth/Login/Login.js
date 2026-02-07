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
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { LinearGradient } from "expo-linear-gradient"; // Add this import

import useAuth from "../../../Hooks/useRegister";
import { useCompany } from "../../../Hooks/useCompany";
import theme from "../../../Utills/AppTheme";
import defaultLogo from "../../../Assets/Company/logo.png";
import { useToast } from "../../../Components/Toast/Toast";

// Import AsyncStorage Helper
import AsyncStorageHelper, {
  saveAuthData,
  getAuthSession,
  getMpinStatus,
  debugAsyncStorage,
} from "../../../Utills/AsynchStorageHelper";

// ✅ Configure Google Sign-In
GoogleSignin.configure({
  webClientId:
    '792128292012-161kjb3ap6f2msun0h56d4k8m0kfqs5l.apps.googleusercontent.com',
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
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({
    contactOrEmailOrUsername: false,
    password: false,
  });
  const [errors, setErrors] = useState({
    contactOrEmailOrUsername: "",
    password: "",
  });

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

  // Debug AsyncStorage on mount
  useEffect(() => {
    console.log("=== LOGIN SCREEN MOUNTED ===");
    debugAsyncStorage();
  }, []);

  // ✅ Validation functions similar to first code
  const isValidEmailOrPhone = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    return emailRegex.test(value) || phoneRegex.test(value.replace(/\D/g, ""));
  };

  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case "contactOrEmailOrUsername":
        if (!value.trim()) {
          newErrors.contactOrEmailOrUsername = "Please enter email or phone number";
        } else if (!isValidEmailOrPhone(value)) {
          newErrors.contactOrEmailOrUsername =
            "Please enter a valid email or phone number";
        } else {
          newErrors.contactOrEmailOrUsername = "";
        }
        break;

      case "password":
        if (!value.trim()) {
          newErrors.password = "Please enter password";
        } else if (value.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        } else {
          newErrors.password = "";
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (touched[fieldName]) validateField(fieldName, value);
  };

  const handleFieldBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, formData[fieldName]);
  };

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
    // Set all fields as touched
    setTouched({
      contactOrEmailOrUsername: true,
      password: true,
    });

    // Validate all fields
    validateField("contactOrEmailOrUsername", formData.contactOrEmailOrUsername);
    validateField("password", formData.password);

    // Check for errors
    const hasErrors =
      Object.values(errors).some((error) => error !== "") ||
      !formData.contactOrEmailOrUsername ||
      !formData.password;

    if (hasErrors) {
      showToast({
        message: "Please fix all errors before submitting",
        type: "warning",
        duration: 3000,
      });
      return false;
    }

    return true;
  };

  const navigateAfterLogin = async () => {
    try {
      console.log("=== NAVIGATE AFTER LOGIN STARTED ===");

      // Check auth session using helper
      const authSession = await getAuthSession();
      console.log("Auth session check:", {
        isAuthenticated: authSession.isAuthenticated,
        userId: authSession.user?.userId || authSession.user?.userid,
        username: authSession.user?.username,
        loginType: authSession.user?.loginType,
      });

      if (!authSession.isAuthenticated) {
        console.log("User not authenticated, redirecting to login");
        showToast({
          message: "Session expired. Please login again.",
          type: "error",
          title: "Session Error",
          duration: 3000,
        });
        return;
      }

      // Check MPIN status
      const hasMpin = await getMpinStatus();
      console.log("MPIN status:", hasMpin);

      if (hasMpin) {
        console.log("Navigating to MpinVerify");
        navigation.replace("MpinVerify");
      } else {
        console.log("Navigating to MpinCreate");
        navigation.replace("MpinCreate");
      }
    } catch (error) {
      console.log("Navigation error:", error);
      console.log("Error details:", error.message);
      showToast({
        message: "Error checking login status",
        type: "error",
        title: "Error",
        duration: 3000,
      });
      navigation.replace("MpinCreate");
    }
  };

  // ✅ UPDATED COMMON LOGIN SUCCESS HANDLER (similar to first code)
  const handleLoginSuccess = async (result, loginType = "normal") => {
    console.log(`=== ${loginType.toUpperCase()} LOGIN SUCCESS ===`);
    console.log("Raw API Response:", JSON.stringify(result, null, 2));

    // Normalize the response data
    const normalizedData = {
      ...result,
      loginType: loginType === "google" ? "GOOGLE" : "NORMAL",
      contactNumber: result.contactNumber || result.contact || "",
    };

    // Save auth data using helper
    const saveResult = await saveAuthData(normalizedData);

    if (!saveResult.success) {
      throw new Error(saveResult.error || "Failed to save auth data");
    }

    // Show success toast
    showToast({
      message: "Login successful! Redirecting...",
      type: "success",
      title: `Welcome${loginType === "google" ? " via Google" : ""}!`,
      duration: 2000,
      animationType: "bounce",
    });

    // Navigate after delay
    setTimeout(() => {
      navigateAfterLogin();
    }, 1500);
  };

  // ✅ UPDATED GOOGLE LOGIN HANDLER (similar to first code)
const handleGoogleSignIn = async () => {
  try {
    setGoogleLoading(true);
    clearError();

    console.log("=== GOOGLE SIGN-IN STARTED ===");

    showToast({
      message: "Connecting to Google...",
      type: "progress",
      title: "Google Sign In",
      showProgress: true,
      progress: 30,
    });

    // 1️⃣ Ensure Play Services
  await GoogleSignin.hasPlayServices({
  showPlayServicesUpdateDialog: true,
});

try {
  await GoogleSignin.signOut();
} catch (e) {
  // ignore
}

const userInfo = await GoogleSignin.signIn();
console.log("Google User Info:", userInfo);

const { idToken } = await GoogleSignin.getTokens();


    if (!idToken) {
      throw new Error("ID token missing from Google");
    }

    console.log("Google ID Token received");

    showToast({
      message: "Authenticating with server...",
      type: "progress",
      title: "Google Sign In",
      showProgress: true,
      progress: 70,
    });

    // 5️⃣ Call backend
    const result = await loginWithGoogle({ idToken });

    console.log("=== GOOGLE LOGIN API RESPONSE ===");
    console.log(result);

    hideToast();

    if (!result.contactNumber) {
      navigation.navigate("GoogleContactVerification", {
        googleData: {
          userId: result.id,
          email: result.email,
          username: result.username,
          picture: result.picture,
          token: result.token,
          isLogin: true,
        },
      });
    } else {
      await handleLoginSuccess(result, "google");
    }
  } catch (error) {
    console.log("=== GOOGLE SIGN-IN ERROR ===");
    console.log("Error Code:", error.code);
    console.log("Error Message:", error.message);
    console.log("Full Error:", JSON.stringify(error, null, 2));

    hideToast();

    let errorMessage = "Google Sign-In failed";

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      errorMessage = "Google sign-in cancelled";
    } else if (error.code === statusCodes.IN_PROGRESS) {
      errorMessage = "Sign-in already in progress";
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      errorMessage = "Google Play Services unavailable";
    } else if (error.code === "12500") {
      errorMessage = "Google configuration error (SHA-1 / OAuth)";
    }

    showToast({
      message: errorMessage,
      type: "error",
      title: "Google Sign In Failed",
      duration: 5000,
    });
  } finally {
    setGoogleLoading(false);
  }
};


  // ✅ NORMAL LOGIN HANDLER
  const handleLogin = async () => {
    if (!validateInput()) return;

    try {
      clearError();

      console.log("=== NORMAL LOGIN STARTED ===");
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

      console.log("=== NORMAL LOGIN API RESPONSE ===");
      console.log("Response keys:", Object.keys(result));
      console.log("Has token:", !!result.token);
      console.log("Has ID:", !!result.id);

      // Hide loading toast
      hideToast();

      // Check for success
      if (result.token) {
        await handleLoginSuccess(result, "normal");
      } else {
        // Handle specific error messages
        const serverMessage =
          result?.message ||
          result?.errorMessage ||
          "Login failed. Please try again.";

        // Special handling for Google account detected
        if (
          serverMessage.toLowerCase().includes("google account detected") ||
          serverMessage.toLowerCase().includes("login via google") ||
          serverMessage.toLowerCase().includes("registered with google")
        ) {
          Alert.alert(
            "Google Account Detected",
            "You have previously registered with Google. Please choose an option:",
            [
              {
                text: "Login with Google",
                onPress: handleGoogleSignIn,
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
            { cancelable: true }
          );
        } else {
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
      console.log("=== NORMAL LOGIN ERROR ===");
      console.log("Error:", err);

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

  const isLoading = loading || googleLoading;

  const RequiredLabel = ({ children }) => (
    <Text style={styles.label}>
      {children}
      <Text style={styles.requiredStar}> *</Text>
    </Text>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            {/* Email/Phone Field */}
            <View style={styles.fieldContainer}>
              <RequiredLabel>Contact, Email or Username</RequiredLabel>
              <TextInput
                style={[
                  styles.input,
                  errors.contactOrEmailOrUsername && styles.inputError,
                ]}
                value={formData.contactOrEmailOrUsername}
                onChangeText={(value) =>
                  handleFieldChange("contactOrEmailOrUsername", value)
                }
                onBlur={() => handleFieldBlur("contactOrEmailOrUsername")}
                placeholder="Enter contact number, email or username"
                placeholderTextColor={theme.COLORS.textTertiary}
                autoCapitalize="none"
                editable={!isLoading}
              />
              {errors.contactOrEmailOrUsername ? (
                <Text style={styles.errorText}>
                  {errors.contactOrEmailOrUsername}
                </Text>
              ) : (
                <Text style={styles.hintText}>
                  Enter your 10-digit contact number, email address, or username
                </Text>
              )}
            </View>

            {/* Password Field */}
            <View style={styles.fieldContainer}>
              <RequiredLabel>Password</RequiredLabel>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    errors.password && styles.inputError,
                  ]}
                  value={formData.password}
                  onChangeText={(value) => handleFieldChange("password", value)}
                  onBlur={() => handleFieldBlur("password")}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.COLORS.textTertiary}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIconContainer}
                  disabled={isLoading}
                >
                  <Icon
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={theme.COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : (
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
              )}
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={[styles.loginButton, isLoading && styles.buttonDisabled]}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#FFD700", "#FFC400"]} // Gold gradient
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color={theme.COLORS.white} size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In Button */}
            <TouchableOpacity
              onPress={handleGoogleSignIn}
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
                <View style={styles.googleButtonContent}>
                  <Icon name="google" size={20} color="#DB4437" />
                  <Text style={styles.googleButtonText}>
                    Sign in with Google
                  </Text>
                </View>
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
              <Text
                style={[styles.registerLink, isLoading && { opacity: 0.5 }]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Loading Overlay */}
        {(loading || googleLoading) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.COLORS.primary} />
            <Text style={styles.loadingText}>
              {googleLoading
                ? "Signing in with Google..."
                : "Processing login..."}
            </Text>
          </View>
        )}

        {/* Toast Component */}
        <Toast />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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
  requiredStar: {
    color: theme.COLORS.error,
  },
  input: {
    ...theme.COMMON_STYLES.input.default,
    borderColor: theme.COLORS.gray300,
    fontSize: theme.SIZES.font.md,
    fontFamily: theme.FONTS.family.regular,
    color: theme.COLORS.textPrimary,
    height: theme.SIZES.input.height,
  },
  inputError: {
    borderColor: theme.COLORS.error,
    borderWidth: 1,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.COLORS.gray300,
    borderRadius: theme.SIZES.radius.sm,
    height: theme.SIZES.input.height,
    paddingHorizontal: theme.SIZES.sm,
  },
  passwordInput: {
    flex: 1,
    fontSize: theme.SIZES.font.md,
    fontFamily: theme.FONTS.family.regular,
    color: theme.COLORS.textPrimary,
    paddingVertical: 0,
    height: "100%",
  },
  eyeIconContainer: {
    padding: theme.SIZES.xs,
  },
  errorText: {
    ...theme.FONTS.caption,
    color: theme.COLORS.error,
    marginTop: theme.SIZES.xs,
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
    borderRadius: theme.SIZES.radius.button,
    height: theme.SIZES.button.height.lg,
    marginTop: theme.SIZES.md,
    overflow: "hidden", // Important for gradient
  },
  buttonGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    ...theme.FONTS.buttonLarge,
    color: theme.COLORS.primary,
    fontWeight: "bold",
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
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleButtonText: {
    ...theme.FONTS.bodyMedium,
    color: theme.COLORS.textPrimary,
    marginLeft: theme.SIZES.sm,
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
    ...theme.FONTS.body,
    color: theme.COLORS.white,
    marginTop: theme.SIZES.sm,
  },
});

export default LoginScreen;