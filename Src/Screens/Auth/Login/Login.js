import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { LinearGradient } from "expo-linear-gradient";

import useAuth from "../../../Hooks/useRegister";
import { useCompany } from "../../../Hooks/useCompany";
import theme from "../../../Utills/AppTheme";
import defaultLogo from "../../../Assets/Company/logo.png";
import { useToast } from "../../../Components/Toast/Toast";
import { saveAuthData, getMpinStatus, debugAsyncStorage } from "../../../Utills/AsynchStorageHelper";

const LoginScreen = () => {
  const navigation = useNavigation();
  const { company, loading: companyLoading } = useCompany();
  const { login, loginWithGoogle, loading, error, clearError } = useAuth();
  const { showToast, Toast } = useToast();

  const [logoError, setLogoError] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);
  const companyLogoUrl = company?.CompanyLogoUrl ?? null;

  const [contactOrEmailOrUsername, setContactOrEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [touched, setTouched] = useState({
    contactOrEmailOrUsername: false,
    password: false,
  });
  const [errors, setErrors] = useState({
    contactOrEmailOrUsername: "",
    password: "",
  });

  // ✅ Google Sign-In Config - FIXED: Proper configuration
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '764581659241-09cqj59ppmrcegcsm4a9i594p0uop00p.apps.googleusercontent.com',
      // Add your iOS client ID if needed
      scopes: ["profile", "email"],
      offlineAccess: true,
    });
  }, []);

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
      showToast(error, "error");
    }
  }, [error]);

  // Debug AsyncStorage on mount
  useEffect(() => {
    console.log("=== LOGIN SCREEN MOUNTED ===");
    debugAsyncStorage();
  }, []);

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
          newErrors.contactOrEmailOrUsername = "Please enter a valid email or phone number";
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
    switch (fieldName) {
      case "contactOrEmailOrUsername":
        setContactOrEmailOrUsername(value);
        break;
      case "password":
        setPassword(value);
        break;
    }
    if (touched[fieldName]) validateField(fieldName, value);
  };

  const handleFieldBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    validateField(
      fieldName,
      fieldName === "contactOrEmailOrUsername" ? contactOrEmailOrUsername : password
    );
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

  // ✅ FIXED: Google Sign-In handler following first code pattern
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      clearError();

      console.log("=== GOOGLE SIGN-IN STARTED ===");

      showToast("Connecting to Google...", "info");

      // Check Play Services
      const hasPlayServices = await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      
      if (!hasPlayServices) {
        throw new Error("Google Play Services unavailable");
      }

      // Sign out first to ensure clean state
      await GoogleSignin.signOut().catch(() => {}); // Ignore signOut errors

      // Sign in
      const userInfo = await GoogleSignin.signIn();
      console.log("✅ Google User Info:", userInfo);

      // Get tokens - FIXED: Proper token retrieval
      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens?.idToken || userInfo?.idToken;

      if (!idToken) {
        throw new Error("No ID token from Google");
      }

      console.log("✅ Google ID Token received");

      showToast("Authenticating with server...", "info");

      // Call backend with proper payload format
      const payload = { idToken, userInfo: userInfo.user };
      const result = await loginWithGoogle(payload);

      console.log("=== GOOGLE LOGIN API RESPONSE ===", result);

      if (result.success !== false) { // Check if not explicitly false
        const { id, email, username, contactNumber, token } = result;

        // Normalize the response data
        const normalizedData = {
          ...result,
          id: id || result.userId,
          userId: id || result.userId,
          email: email || result.email,
          username: username || result.username,
          contactNumber: contactNumber || result.contactNumber || result.contact || "",
          token: token || result.token,
          loginType: "GOOGLE",
        };

        // Save auth data
        await saveAuthData(normalizedData);

        showToast("Login successful with Google!", "success");

        // Navigate based on contact number presence
        if (!normalizedData.contactNumber || normalizedData.contactNumber.trim() === "") {
          navigation.navigate("GoogleContactVerification", {
            userId: id,
            email,
            username,
            token,
            picture: userInfo?.user?.photo,
            isLogin: true,
          });
        } else {
          // Check MPIN status
          const hasMpin = await getMpinStatus();
          if (hasMpin) {
            navigation.replace("MpinVerify");
          } else {
            navigation.replace("MpinCreate");
          }
        }
      } else {
        showToast(result.error || "Google authentication failed", "error");
      }
    } catch (error) {
      console.log("=== GOOGLE SIGN-IN ERROR ===");
      console.log("Error Code:", error.code);
      console.log("Error Message:", error.message);

      handleGoogleSignInError(error);
    } finally {
      setGoogleLoading(false);
    }
  };

  // ✅ FIXED: Error handler following first code pattern
  const handleGoogleSignInError = (error) => {
    let errorMessage = "Google sign-in failed";
    
    switch (error.code) {
      case statusCodes.SIGN_IN_CANCELLED:
        errorMessage = "Google sign-in cancelled";
        break;
      case statusCodes.IN_PROGRESS:
        errorMessage = "Google sign-in already in progress";
        break;
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        errorMessage = "Google Play Services unavailable";
        break;
      case "12500":
      case statusCodes.SIGN_IN_REQUIRED:
        errorMessage = "Google sign-in failed. Please check your configuration.";
        console.log("🔧 FIX: Make sure you have:");
        console.log("1. Added SHA-1 fingerprint to Firebase console");
        console.log("2. Enabled Google Sign-In in Firebase Authentication");
        console.log("3. Correct webClientId in configuration");
        break;
      default:
        errorMessage = `Google sign-in failed: ${error.message || "Try again"}`;
    }

    showToast(errorMessage, "error");
  };

  // ✅ Regular Login
  const handleLogin = async () => {
    const allTouched = { contactOrEmailOrUsername: true, password: true };
    setTouched(allTouched);

    validateField("contactOrEmailOrUsername", contactOrEmailOrUsername);
    validateField("password", password);

    const hasErrors =
      Object.values(errors).some((error) => error !== "") ||
      !contactOrEmailOrUsername ||
      !password;

    if (hasErrors) {
      showToast("Please fix all errors before submitting", "warning");
      return;
    }

    try {
      clearError();
      showToast("Logging in...", "info");

      const result = await login({
        contactOrEmailOrUsername,
        password,
      });

      console.log("=== NORMAL LOGIN API RESPONSE ===", result);

      if (result.success !== false && result.token) {
        const normalizedData = {
          ...result,
          contactNumber: result.contactNumber || result.contact || "",
          loginType: "NORMAL",
        };

        await saveAuthData(normalizedData);

        showToast("Login successful!", "success");

        // Check MPIN status
        const hasMpin = await getMpinStatus();
        setTimeout(() => {
          if (hasMpin) {
            navigation.replace("MpinVerify");
          } else {
            navigation.replace("MpinCreate");
          }
        }, 1500);
      } else {
        const serverMessage = result?.message || result?.error || "Invalid credentials";
        showToast(serverMessage, "error");
        setErrors((prev) => ({
          ...prev,
          password: "Invalid email/phone or password",
        }));
      }
    } catch (err) {
      console.log("Login error:", err);
      showToast(err.message || "Network error. Please try again.", "error");
      setErrors((prev) => ({
        ...prev,
        password: "Network error. Please try again.",
      }));
    }
  };

  const navigateToForgotPassword = () => {
    navigation.navigate("EnterNumber", { mode: "forgot" });
  };

  const navigateToRegister = () => {
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
                    <ActivityIndicator size="small" color={theme.COLORS.primary} />
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
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            {/* Email/Phone Field */}
            <View style={styles.fieldContainer}>
              <RequiredLabel>Email or Phone</RequiredLabel>
              <TextInput
                style={[styles.input, errors.contactOrEmailOrUsername && styles.inputError]}
                value={contactOrEmailOrUsername}
                onChangeText={(value) => handleFieldChange("contactOrEmailOrUsername", value)}
                onBlur={() => handleFieldBlur("contactOrEmailOrUsername")}
                placeholder="Enter email or phone"
                placeholderTextColor={theme.COLORS.textTertiary}
                autoCapitalize="none"
                editable={!isLoading}
              />
              {errors.contactOrEmailOrUsername ? (
                <Text style={styles.errorText}>{errors.contactOrEmailOrUsername}</Text>
              ) : null}
            </View>

            {/* Password Field */}
            <View style={styles.fieldContainer}>
              <RequiredLabel>Password</RequiredLabel>
              <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={(value) => handleFieldChange("password", value)}
                  onBlur={() => handleFieldBlur("password")}
                  placeholder="Enter password"
                  placeholderTextColor={theme.COLORS.textTertiary}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIconContainer}
                  disabled={isLoading}
                >
                  <Image
                    source={
                      showPassword
                        ? require("../../../Assets/Icons/eyeopen.png")
                        : require("../../../Assets/Icons/eyeclose.png")
                    }
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={navigateToForgotPassword}
                style={styles.forgotPasswordContainer}
                disabled={isLoading}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.loginButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.COLORS.gradient.brand || ["#FFD700", "#FFC400"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color={theme.COLORS.white} size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.divider} />
            </View>

            {/* Google Button */}
            {/* <TouchableOpacity
              style={[styles.googleButton, googleLoading && styles.buttonDisabled]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {googleLoading ? (
                <ActivityIndicator color={theme.COLORS.primary} size="small" />
              ) : (
                <View style={styles.googleButtonContent}>
                  <Image
                    source={require("../../../Assets/Icons/google.png")}
                    style={styles.googleIcon}
                  />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </View>
              )}
            </TouchableOpacity> */}

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={navigateToRegister} disabled={isLoading}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Loading Overlay */}
        {(loading || googleLoading) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.COLORS.primary} />
            <Text style={styles.loadingText}>
              {googleLoading ? "Signing in with Google..." : "Processing..."}
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
    borderWidth: 1,
    borderColor: theme.COLORS.gray300,
    borderRadius: theme.SIZES.radius.sm,
    height: theme.SIZES.input.height,
    paddingHorizontal: theme.SIZES.sm,
    fontSize: theme.SIZES.font.md,
    fontFamily: theme.FONTS.family.regular,
    color: theme.COLORS.textPrimary,
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
  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: theme.COLORS.textSecondary,
  },
  errorText: {
    ...theme.FONTS.caption,
    color: theme.COLORS.error,
    marginTop: theme.SIZES.xs,
  },
  forgotPasswordContainer: {
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
    overflow: "hidden",
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
    color: theme.COLORS.white,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.SIZES.md,
  },
  divider: {
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
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: theme.SIZES.sm,
  },
  googleButtonText: {
    ...theme.FONTS.bodyMedium,
    color: theme.COLORS.textPrimary,
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