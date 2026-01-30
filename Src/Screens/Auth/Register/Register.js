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
  Switch,
  StyleSheet,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getHash } from "react-native-otp-verify";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import Toast components
import { useToast, ToastTypes, ToastPositions, ToastAnimationTypes } from '../../../Components/Toast/Toast'; // Adjust path as needed

import useAuth from "../../../Hooks/useRegister";
import { useCompany } from "../../../Hooks/useCompany";
import theme from "../../../Utills/AppTheme";

import defaultLogo from '../../../Assets/Company/logo.png';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: "792128292012-161kjb3ap6f2msun0h56d4k8m0kfqs5l.apps.googleusercontent.com",
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { company, loading: companyLoading } = useCompany();
  
  // Initialize toast hook
  const { showToast, hideToast, Toast } = useToast();
  
  // Log company details for debugging
  useEffect(() => {
    if (company) {
      console.log("Company details in RegisterScreen:", {
        companyName: company.COMPANYNAME,
        logoUrl: company.CompanyLogoUrl,
        baseUrl: company.BASEURL,
        logoField: company.LOGO
      });
    }
  }, [company]);

  const [logoError, setLogoError] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);
  const companyLogoUrl = company?.CompanyLogoUrl ?? null;

  const { signUp, loginWithGoogle, loading, error, clearError } = useAuth();

  const [showReferral, setShowReferral] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appSignature, setAppSignature] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    contactNumber: "",
    email: "",
    referralCode: "",
    hashKey: "d4riq2SwBaq",
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Get app hash key
  useEffect(() => {
    getAppHash();
  }, []);

  const getAppHash = async () => {
    try {
      const hash = await getHash();
      if (hash && hash.length > 0) {
        setAppSignature(hash[0]);
        setFormData((prev) => ({
          ...prev,
          hashKey: hash[0] || "d4riq2SwBaq",
        }));
      }
    } catch (err) {
      console.log("Error getting app hash:", err);
    }
  };

  // Reset logo loading state when company changes
  useEffect(() => {
    if (company) {
      console.log("Company changed, resetting logo state. Logo URL:", company.CompanyLogoUrl);
      setLogoError(false);
      setLogoLoading(true);
    }
  }, [company]);

  const handleImageError = () => {
    console.log("Failed to load company logo from URL:", companyLogoUrl);
    console.log("Falling back to default logo");
    setLogoError(true);
    setLogoLoading(false);
  };

  const handleImageLoad = () => {
    console.log("Company logo loaded successfully:", companyLogoUrl);
    setLogoLoading(false);
    setLogoError(false);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.contactNumber.trim()) {
      errors.contactNumber = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contactNumber)) {
      errors.contactNumber = "Please enter a valid 10-digit contact number";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

const handleNormalRegister = async () => {
  if (!validateForm()) {
    showToast({
      message: "Please fix the highlighted errors before continuing",
      title: "Invalid Form",
      type: ToastTypes.ERROR,
      duration: 4000,
      position: ToastPositions.TOP,
      animationType: ToastAnimationTypes.SLIDE
    });
    return;
  }

  try {
    clearError();

    const payload = {
      username: formData.username.trim(),
      password: formData.password,
      contactNumber: formData.contactNumber.trim(),
      email: formData.email.trim().toLowerCase(),
      hashKey: formData.hashKey || appSignature || "d4riq2SwBaq",
      ...(showReferral &&
        formData.referralCode.trim() && {
          referralCode: formData.referralCode.trim(),
        }),
    };

    console.log("Registration payload:", payload);

    const result = await signUp(payload);

    console.log("Registration response:", result);
    console.log("Registration result:", result);

    // Check if OTP was sent successfully (success conditions)
    if (
      result?.message?.includes("OTP sent") ||
      result?.errorMessage?.includes("OTP sent") ||
      result?.otp ||
      result?.whatsappLink
    ) {
      // Show success toast
      showToast({
        message: "OTP sent successfully to your mobile number",
        title: "Registration Successful",
        type: ToastTypes.SUCCESS,
        duration: 3000,
        position: ToastPositions.TOP,
        animationType: ToastAnimationTypes.SLIDE
      });

      // Navigate to OTP verification screen with mobile number
      setTimeout(() => {
        navigation.navigate("VerifyOTP", {
          mobileNumber: formData.contactNumber.trim(),
          email: formData.email.trim().toLowerCase(),
          username: formData.username.trim(),
          registrationData: payload,
          otpType: "normal",
        });

        // Clear form
        resetForm();
      }, 1500);
    } else {
      // Handle different error messages with specific user-friendly messages
      let errorTitle = "Registration Failed";
      let errorMessage = "Something went wrong. Please try again.";
      
      // Extract error message from response
      const serverMessage = result?.message || result?.errorMessage || "";
      
      // Check for specific error conditions
      if (serverMessage.toLowerCase().includes("email already exists") || 
          serverMessage.toLowerCase().includes("email exists")) {
        errorTitle = "Email Already Registered";
        errorMessage = "This email address is already registered. Please use a different email or try logging in.";
      } else if (serverMessage.toLowerCase().includes("username exists") || 
                 serverMessage.toLowerCase().includes("username already")) {
        errorTitle = "Username Taken";
        errorMessage = "This username is already taken. Please choose a different username.";
      } else if (serverMessage.toLowerCase().includes("mobile number") || 
                 serverMessage.toLowerCase().includes("contact") || 
                 serverMessage.toLowerCase().includes("phone")) {
        errorTitle = "Mobile Number Exists";
        errorMessage = "This mobile number is already registered. Please use a different number or try logging in.";
      } else if (serverMessage.toLowerCase().includes("invalid") || 
                 serverMessage.toLowerCase().includes("invalid data")) {
        errorTitle = "Invalid Data";
        errorMessage = "Please check your information and try again.";
      } else if (serverMessage) {
        // Use the server message if it exists
        errorMessage = serverMessage;
      }

      showToast({
        message: errorMessage,
        title: errorTitle,
        type: ToastTypes.ERROR,
        duration: 4000,
        position: ToastPositions.TOP,
        animationType: ToastAnimationTypes.SLIDE
      });
    }
  } catch (err) {
    console.log("Registration error:", err.message);
    
    let errorTitle = "Registration Failed";
    let errorMessage = err.message || "Something went wrong. Please try again.";
    
    // Also check error message in catch block
    if (errorMessage.toLowerCase().includes("email already exists") || 
        errorMessage.toLowerCase().includes("email exists")) {
      errorTitle = "Email Already Registered";
      errorMessage = "This email address is already registered. Please use a different email or try logging in.";
    } else if (errorMessage.toLowerCase().includes("username exists") || 
               errorMessage.toLowerCase().includes("username already")) {
      errorTitle = "Username Taken";
      errorMessage = "This username is already taken. Please choose a different username.";
    } else if (errorMessage.toLowerCase().includes("mobile number") || 
               errorMessage.toLowerCase().includes("contact") || 
               errorMessage.toLowerCase().includes("phone")) {
      errorTitle = "Mobile Number Exists";
      errorMessage = "This mobile number is already registered. Please use a different number or try logging in.";
    }

    showToast({
      message: errorMessage,
      title: errorTitle,
      type: ToastTypes.ERROR,
      duration: 4000,
      position: ToastPositions.TOP,
      animationType: ToastAnimationTypes.SLIDE
    });
  }
};

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      clearError();

      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();

      console.log("Google User Info:", userInfo);

      const idToken = userInfo.data?.idToken || userInfo.idToken;
      console.log("Google ID Token:", idToken ? "Token received" : "No token");

      if (!idToken) {
        showToast({
          message: "Failed to get authentication token. Please try again.",
          title: "Error",
          type: ToastTypes.ERROR,
          duration: 4000,
          position: ToastPositions.TOP,
          animationType: ToastAnimationTypes.SLIDE
        });
        return;
      }

      // Show loading toast for Google sign in
      showToast({
        message: "Signing in with Google...",
        title: "Please wait",
        type: ToastTypes.INFO,
        duration: 0, // Show until manually hidden
        position: ToastPositions.TOP,
        animationType: ToastAnimationTypes.SLIDE,
        showProgress: true,
        progress: 0
      });

      // Call your API with the token
      console.log("Calling loginWithGoogle API...");
      const result = await loginWithGoogle({ idToken });
      console.log("Google Login Response:", result);

      // Hide the loading toast
      hideToast();

      // Check if contactNumber is null or empty
      if (!result.contactNumber || result.contactNumber === null) {
        // Show toast for contact verification
        showToast({
          message: "Please verify your contact number to continue",
          title: "Contact Verification Required",
          type: ToastTypes.INFO,
          duration: 3000,
          position: ToastPositions.TOP,
          animationType: ToastAnimationTypes.SLIDE
        });

        // User doesn't have contact number, navigate to contact verification
        console.log("Navigating to GoogleContactVerification");
        setTimeout(() => {
          navigation.navigate("GoogleContactVerification", {
            googleData: {
              userId: result.id,
              email: result.email,
              name: result.username,
              picture: result.picture,
              referralCode: result.referralCode,
              token: result.token,
              socialMedia: result.socialMedia,
            },
          });
        }, 1000);
      } else {
        // User already has contact number, login successful
        await AsyncStorage.setItem("authToken", result.token);
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify({
            id: result.id,
            username: result.username,
            email: result.email,
            contactNumber: result.contactNumber,
            picture: result.picture,
            referralCode: result.referralCode,
            socialMedia: result.socialMedia,
          }),
        );

        // Show success toast
        showToast({
          message: "Welcome back! Redirecting to MPIN verification...",
          title: "Login Successful",
          type: ToastTypes.SUCCESS,
          duration: 2000,
          position: ToastPositions.TOP,
          animationType: ToastAnimationTypes.BOUNCE
        });

        console.log("Google login successful, navigating to Mpin verification");
        // Navigate to MpinVerify after a short delay
        setTimeout(() => {
          navigation.replace("MpinVerify");
        }, 1500);
      }
    } catch (error) {
      console.log("Full Google Sign-In Error:", error);
      console.log("Error code:", error.code);
      console.log("Error message:", error.message);

      let errorMessage = "Google Sign-In failed. Please try again.";

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = "Sign in cancelled by user";
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = "Sign in already in progress";
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = "Google Play Services not available or outdated";
      } else if (error.message?.includes("JSON Parse error")) {
        errorMessage =
          "Server error. Please check your internet connection or try again later.";
      } else if (error.message?.includes("Unexpected character")) {
        errorMessage =
          "Server returned an unexpected response. Please contact support.";
      }

      // Hide any loading toast
      hideToast();
      
      // Show error toast
      showToast({
        message: errorMessage,
        title: "Error",
        type: ToastTypes.ERROR,
        duration: 4000,
        position: ToastPositions.TOP,
        animationType: ToastAnimationTypes.SLIDE
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      contactNumber: "",
      email: "",
      referralCode: "",
      hashKey: appSignature || "d4riq2SwBaq",
    });
    setValidationErrors({});
    setShowReferral(false);
    setShowPassword(false);
    clearError();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
        bounces={false}
      >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          {companyLoading ? (
            <ActivityIndicator size="small" color={theme.COLORS.primary} />
          ) : (
            <>
              {/* Image Container */}
              <View style={styles.imageContainer}>
                {logoLoading && !logoError && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.COLORS.primary} />
                  </View>
                )}
                
                {/* Show API image if available and no error */}
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
                  /* Show local image when API fails or no logo URL */
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
            </>
          )}
        </View>

        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join our premium community and get exclusive benefits
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={20} color={theme.COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Icon name="close" size={20} color={theme.COLORS.error} />
            </TouchableOpacity>
          </View>
        )}

        {/* Registration Form */}
        <View style={styles.formContainer}>
          {/* Username */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.username && styles.inputError,
              ]}
              value={formData.username}
              onChangeText={(value) => handleInputChange("username", value)}
              placeholder="Enter your username"
              placeholderTextColor={theme.COLORS.textTertiary}
              autoCapitalize="words"
              editable={!loading && !googleLoading}
            />
            {validationErrors.username && (
              <Text style={styles.errorTextSmall}>
                {validationErrors.username}
              </Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.email && styles.inputError,
              ]}
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              placeholder="Enter your email"
              placeholderTextColor={theme.COLORS.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading && !googleLoading}
            />
            {validationErrors.email && (
              <Text style={styles.errorTextSmall}>
                {validationErrors.email}
              </Text>
            )}
          </View>

          {/* Contact Number */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Contact Number *</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.contactNumber && styles.inputError,
              ]}
              value={formData.contactNumber}
              onChangeText={(value) =>
                handleInputChange("contactNumber", value)
              }
              placeholder="Enter 10-digit contact number"
              placeholderTextColor={theme.COLORS.textTertiary}
              keyboardType="phone-pad"
              maxLength={10}
              editable={!loading && !googleLoading}
            />
            {validationErrors.contactNumber && (
              <Text style={styles.errorTextSmall}>
                {validationErrors.contactNumber}
              </Text>
            )}
          </View>

          {/* Password with Eye Toggle */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  validationErrors.password && styles.inputError,
                ]}
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                placeholder="Create a strong password"
                placeholderTextColor={theme.COLORS.textTertiary}
                secureTextEntry={!showPassword}
                editable={!loading && !googleLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={togglePasswordVisibility}
                disabled={loading || googleLoading}
              >
                <Icon
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={theme.COLORS.textTertiary}
                />
              </TouchableOpacity>
            </View>
            {validationErrors.password && (
              <Text style={styles.errorTextSmall}>
                {validationErrors.password}
              </Text>
            )}
            <Text style={styles.hintText}>Must be at least 6 characters</Text>
          </View>

          {/* Referral Code */}
          <View style={styles.referralSection}>
            <TouchableOpacity
              style={styles.referralToggle}
              onPress={() => setShowReferral(!showReferral)}
              disabled={loading || googleLoading}
            >
              <Text
                style={[
                  styles.referralToggleText,
                  (loading || googleLoading) && { opacity: 0.5 },
                ]}
              >
                Have a referral code?
              </Text>
              <Switch
                value={showReferral}
                onValueChange={setShowReferral}
                trackColor={{
                  false: theme.COLORS.gray300,
                  true: theme.COLORS.warning,
                }}
                thumbColor={theme.COLORS.white}
                disabled={loading || googleLoading}
              />
            </TouchableOpacity>

            {showReferral && (
              <View style={styles.referralInputContainer}>
                <Text style={styles.label}>Referral Code</Text>
                <TextInput
                  style={styles.input}
                  value={formData.referralCode}
                  onChangeText={(value) =>
                    handleInputChange("referralCode", value)
                  }
                  placeholder="Enter referral code (optional)"
                  placeholderTextColor={theme.COLORS.textTertiary}
                  editable={!loading && !googleLoading}
                />
              </View>
            )}
          </View>

          {/* Terms */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By registering, you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleNormalRegister}
          disabled={loading || googleLoading}
          style={[
            styles.submitButton,
            (loading || googleLoading) && styles.submitButtonDisabled,
          ]}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={theme.COLORS.white} size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Create Account</Text>
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
          onPress={handleGoogleSignIn}
          disabled={googleLoading || loading}
          style={[
            styles.googleButton,
            (googleLoading || loading) && styles.submitButtonDisabled,
          ]}
          activeOpacity={0.8}
        >
          {googleLoading ? (
            <ActivityIndicator color={theme.COLORS.textPrimary} size="small" />
          ) : (
            <>
              <Icon name="google" size={20} color="#DB4437" />
              <Text style={styles.googleButtonText}>Sign up with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            disabled={loading || googleLoading}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.loginLink,
                (loading || googleLoading) && { opacity: 0.5 },
              ]}
            >
              Sign In
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
  // Container & Layout
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
    position: 'relative',
    width: 120,
    height: 120,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 20,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.backgroundLight,
    borderRadius: 10,
    zIndex: 1,
  },
  companyName: {
    marginTop: theme.SIZES.md,
    ...theme.FONTS.h3,
    color: theme.COLORS.primary,
    textAlign: 'center',
    fontWeight: 'bold',
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
    paddingHorizontal: theme.SIZES.lg,
  },

  // Error Message
  errorContainer: {
    ...theme.COMMON_STYLES.row,
    backgroundColor: `${theme.COLORS.error}15`,
    padding: theme.SIZES.padding.md,
    borderRadius: theme.SIZES.radius.sm,
    marginBottom: theme.SIZES.lg,
    borderWidth: 1,
    borderColor: `${theme.COLORS.error}30`,
  },
  errorText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.error,
    flex: 1,
    marginLeft: theme.SIZES.sm,
    marginRight: theme.SIZES.sm,
  },

  // Form Container
  formContainer: {
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.SIZES.radius.lg,
    padding: theme.SIZES.padding.md,
    marginBottom: theme.SIZES.xl,
    ...theme.SHADOWS.md,
  },

  // Form Fields
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
  inputError: {
    borderColor: theme.COLORS.error,
    backgroundColor: `${theme.COLORS.error}10`,
  },
  errorTextSmall: {
    ...theme.FONTS.caption,
    color: theme.COLORS.error,
    marginTop: theme.SIZES.xs,
  },
  hintText: {
    ...theme.FONTS.caption,
    color: theme.COLORS.textTertiary,
    marginTop: theme.SIZES.xs,
  },

  // Password Field with Eye
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    ...theme.COMMON_STYLES.input.default,
    borderColor: theme.COLORS.gray300,
    fontSize: theme.SIZES.font.md,
    fontFamily: theme.FONTS.family.regular,
    color: theme.COLORS.textPrimary,
    height: theme.SIZES.input.height,
    paddingRight: theme.SIZES.xl * 2,
  },
  eyeButton: {
    position: "absolute",
    right: theme.SIZES.sm,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: theme.SIZES.xl,
    zIndex: 1,
  },

  // Referral Section
  referralSection: {
    marginTop: theme.SIZES.xs,
    marginBottom: theme.SIZES.xs,
  },
  referralToggle: {
    ...theme.COMMON_STYLES.rowBetween,
    paddingVertical: theme.SIZES.xs,
  },
  referralToggleText: {
    ...theme.FONTS.body,
    color: theme.COLORS.textSecondary,
  },
  referralInputContainer: {
    marginTop: theme.SIZES.md,
  },

  // Terms
  termsContainer: {
    marginTop: theme.SIZES.sm,
  },
  termsText: {
    ...theme.FONTS.caption,
    color: theme.COLORS.textSecondary,
    textAlign: "center",
    lineHeight: theme.SIZES.font.sm * 1.6,
  },
  termsLink: {
    ...theme.FONTS.captionBold,
    color: theme.COLORS.goldPrimary,
  },

  // Buttons
  submitButton: {
    ...theme.COMMON_STYLES.button.gold,
    height: theme.SIZES.button.height.md,
    width: "90%",
    alignSelf: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...theme.FONTS.buttonLarge,
    color: theme.COLORS.primary,
  },

  // Google Button
  googleButton: {
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.SIZES.radius.button,
    height: theme.SIZES.button.height.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: theme.COLORS.gray300,
    marginBottom: theme.SIZES.xs,
    ...theme.SHADOWS.sm,
  },
  googleButtonText: {
    ...theme.FONTS.bodyMedium,
    color: theme.COLORS.textPrimary,
    marginLeft: theme.SIZES.sm,
  },

  // Divider
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

  // Login Link
  loginContainer: {
    ...theme.COMMON_STYLES.rowCenter,
    marginTop: theme.SIZES.sm,
    marginBottom: theme.SIZES.lg,
  },
  loginText: {
    ...theme.FONTS.body,
    color: theme.COLORS.textSecondary,
  },
  loginLink: {
    ...theme.FONTS.bodyBold,
    color: theme.COLORS.goldPrimary,
  },
});

export default RegisterScreen;