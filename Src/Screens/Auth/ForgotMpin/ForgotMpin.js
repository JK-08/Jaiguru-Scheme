import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMpin } from "../../../Hooks/useMpin";
import CommonHeader from '../../../Components/CommonHeader/CommonHeader';
import { COLORS, SIZES, FONTS, SHADOWS, COMMON_STYLES } from '../../..//Utills/AppTheme';
import { getUserData } from '../../../Utills/AsynchStorageHelper'; // Adjust path as needed

const ForgotMpinScreen = () => {
  const navigation = useNavigation();
  const { sendForgotOtp, loading } = useMpin();
  
  const [userMobile, setUserMobile] = useState('');
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    loadUserMobile();
  }, []);

  const loadUserMobile = async () => {
    try {
      setIsLoadingUser(true);
      const userData = await getUserData();
      
      if (userData) {
        // Try different possible field names for mobile number
        const mobile = userData.contactNumber || 
                      userData.mobileNumber || 
                      userData.phone || 
                      userData.mobile;
        
        setUserMobile(mobile || '');
      }
    } catch (error) {
      console.error('Error loading user mobile:', error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const formatMobileNumber = (number) => {
    if (!number) return '';
    // Format: •••• •••• 1234 or ••••1234 based on length
    const strNumber = String(number);
    if (strNumber.length >= 10) {
      const last4 = strNumber.slice(-4);
      return `•••• •••• ${last4}`;
    } else if (strNumber.length >= 4) {
      const last4 = strNumber.slice(-4);
      return `••••${last4}`;
    }
    return 'registered number';
  };

  const handleSendOtp = async () => {
    try {
      const res = await sendForgotOtp();
      Alert.alert("Success", res.message);
      navigation.navigate("VerifyForgotMpin");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };



  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <CommonHeader title="Forgot MPIN" />
        
        <View style={styles.content}>
          {/* Icon/Illustration Container */}
          <View style={styles.iconContainer}>
            <View style={styles.iconWrapper}>
              <Text style={styles.iconText}>🔐</Text>
            </View>
          </View>

          {/* Title Section */}
          <Text style={styles.title}>Forgot MPIN?</Text>
          <Text style={styles.subtitle}>
            Don't worry! We'll send a verification code to your registered mobile number to reset your MPIN.
          </Text>

          {/* User Mobile Info Card */}
          {isLoadingUser ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading your details...</Text>
            </View>
          ) : userMobile ? (
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Text style={styles.infoIcon}>📱</Text>
                <Text style={styles.infoTitle}>Registered Mobile Number</Text>
              </View>
              
              <View style={styles.mobileContainer}>
                <Text style={styles.mobileLabel}>Mobile:</Text>
                <Text style={styles.mobileNumber}>{formatMobileNumber(userMobile)}</Text>
              </View>
              
              <View style={styles.infoDivider} />
              
              <Text style={styles.infoText}>
                We'll send a 6-digit verification code to this number. The code will expire in 10 minutes.
              </Text>
            </View>
          ) : (
            <View style={styles.warningCard}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningTitle}>Mobile Number Not Found</Text>
              <Text style={styles.warningText}>
                We couldn't find your registered mobile number. Please contact support for assistance.
              </Text>
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.button, 
              (loading || !userMobile) && styles.buttonDisabled
            ]}
            onPress={handleSendOtp}
            disabled={loading || !userMobile}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {userMobile ? 'Send OTP' : 'Contact Support'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to receive an OTP via SMS. Standard message and data rates may apply.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotMpinScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding.container,
    paddingTop: SIZES.padding.xl,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: SIZES.margin.xl,
  },
  iconWrapper: {
    width: SIZES.icon.xxxl,
    height: SIZES.icon.xxxl,
    borderRadius: SIZES.radius.xxxl,
    backgroundColor: COLORS.blueOpacity10,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  iconText: {
    fontSize: SIZES.icon.xxl,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SIZES.margin.sm,
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SIZES.margin.xl,
    paddingHorizontal: SIZES.padding.md,
  },
  loadingCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    marginBottom: SIZES.margin.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.xs,
  },
  loadingText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin.sm,
  },
  infoCard: {
    backgroundColor: COLORS.primaryPale,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    marginBottom: SIZES.margin.xl,
    borderWidth: 1,
    borderColor: COLORS.primaryLighter,
    ...SHADOWS.xs,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.margin.md,
  },
  infoIcon: {
    fontSize: SIZES.font.lg,
    marginRight: SIZES.margin.xs,
  },
  infoTitle: {
    ...FONTS.label,
    color: COLORS.primary,
  },
  mobileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.margin.md,
  },
  mobileLabel: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginRight: SIZES.margin.xs,
  },
  mobileNumber: {
    ...FONTS.bodyBold,
    color: COLORS.primary,
    fontSize: SIZES.font.lg,
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.primaryLighter,
    marginVertical: SIZES.margin.md,
  },
  infoText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: SIZES.font.lg * 1.5,
  },
  warningCard: {
    backgroundColor: COLORS.warningLight + '20', // 20% opacity
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    marginBottom: SIZES.margin.xl,
    borderWidth: 1,
    borderColor: COLORS.warning,
    alignItems: "center",
    ...SHADOWS.xs,
  },
  warningIcon: {
    fontSize: SIZES.icon.lg,
    marginBottom: SIZES.margin.sm,
  },
  warningTitle: {
    ...FONTS.label,
    color: COLORS.warningDark,
    marginBottom: SIZES.margin.xs,
  },
  warningText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  button: {
    ...COMMON_STYLES.button.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding.xl,
    marginBottom: SIZES.margin.md,
    ...SHADOWS.blue,
  },
  buttonDisabled: {
    opacity: 0.7,
    backgroundColor: COLORS.gray400,
  },
  buttonText: {
    ...FONTS.buttonLarge,
    color: COLORS.white,
    flex: 1,
    textAlign: "center",
  },
  buttonIcon: {
    fontSize:20,
    color: COLORS.white,
    marginLeft: SIZES.margin.sm,
  },
  helpContainer: {
    alignItems: "center",
    marginTop: SIZES.margin.sm,
  },
  helpLink: {
    padding: SIZES.padding.md,
  },
  helpText: {
    ...FONTS.bodySmall,
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
  helpTextSecondary: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
  },
  footer: {
    padding: SIZES.padding.lg,
    alignItems: "center",
  },
  footerText: {
    ...FONTS.caption,
    color: COLORS.textTertiary,
    textAlign: "center",
  },
});