import { StyleSheet } from "react-native";
import theme from "../../../Utills/AppTheme";

export const styles = StyleSheet.create({
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
    position: "relative",
    width: 100,
    height: 100,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
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
    marginTop: theme.SIZES.md,
    ...theme.FONTS.h3,
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
    padding: theme.SIZES.padding.xs,
    marginBottom: theme.SIZES.xl,
    ...theme.SHADOWS.md,
  },

  // Form Fields
  fieldContainer: {
    marginBottom: theme.SIZES.xs,
    width: "90%",
    alignContent: "center",
    alignSelf: "center",
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
    width: "90%",
    alignContent: "center",
    alignSelf: "center",
  },
  referralToggleText: {
    ...theme.FONTS.body,
    color: theme.COLORS.textSecondary,
  },
  referralInputContainer: {
    marginTop: theme.SIZES.xs,
    width: "90%",
    alignContent: "center",
    alignSelf: "center",
  },

  // Terms
  termsContainer: {
    marginTop: theme.SIZES.sm,
    width: "90%",
    alignContent: "center",
    alignSelf: "center",
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
