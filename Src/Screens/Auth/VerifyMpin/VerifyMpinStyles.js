// VerifyMpinStyles.js
import { StyleSheet, Dimensions, Platform, StatusBar } from "react-native";
import theme from "../../../Utills/AppTheme";

const { COLORS, SIZES, FONTS, SHADOWS, moderateScale, scale, COMMON_STYLES } = theme;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Simplified responsive calculations
const getResponsiveValue = (value) => {
  return moderateScale(value);
};

const getSpacing = (base) => {
  return moderateScale(base);
};

const getFontSize = (size) => {
  return moderateScale(size);
};

const styles = StyleSheet.create({
  // ============================================
  // 🎯 CONTAINER & LAYOUT
  // ============================================
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.backgroundBlue,
  },
  
  contentContainer: {
    flex: 1,
    paddingHorizontal: SIZES.padding.container,
    paddingTop: getSpacing(20),
    backgroundColor: COLORS.backgroundBlue,
  },

  // ============================================
  // 🎯 HEADER SECTION
  // ============================================
  headerSection: {
    alignItems: "center",
    marginBottom: getSpacing(24),
    marginTop: getSpacing(8),
  },
  
  logoContainer: {
    width: getResponsiveValue(80),
    height: getResponsiveValue(80),
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: getSpacing(16),
    ...SHADOWS.lg,
    borderWidth: 3,
    borderColor: COLORS.blueOpacity20,
  },
  
  title: {
    ...FONTS.h4,
    fontSize: getFontSize(24),
    color: COLORS.textBlueDark,
    textAlign: "center",
    marginBottom: getSpacing(4),
  },
  
  subtitle: {
    ...FONTS.bodySmall,
    fontSize: getFontSize(14),
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: getFontSize(18),
    maxWidth: "90%",
  },

  // ============================================
  // 🎯 LOCK CONTAINER
  // ============================================
  lockContainer: {
    ...COMMON_STYLES.card.blueBorder,
    alignItems: "center",
    marginBottom: getSpacing(20),
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight + "10",
    paddingVertical: getSpacing(16),
  },
  
  lockTitle: {
    ...FONTS.h6,
    fontSize: getFontSize(16),
    color: COLORS.error,
    marginTop: getSpacing(8),
    marginBottom: getSpacing(2),
    textAlign: "center",
  },
  
  lockText: {
    ...FONTS.caption,
    fontSize: getFontSize(12),
    color: COLORS.errorDark,
    textAlign: "center",
    marginBottom: getSpacing(12),
  },
  
  timerContainer: {
    ...COMMON_STYLES.progressBar.container,
    width: "70%",
    height: getSpacing(6),
  },
  
  timerProgress: {
    ...COMMON_STYLES.progressBar.fill,
    backgroundColor: COLORS.error,
  },

  // ============================================
  // 🎯 SECURITY STATUS
  // ============================================
  securityStatus: {
    ...COMMON_STYLES.rowCenter,
    gap: getSpacing(12),
    marginBottom: getSpacing(20),
  },
  
  statusItem: {
    ...COMMON_STYLES.chip.blue,
    paddingHorizontal: getSpacing(10),
    paddingVertical: getSpacing(6),
  },
  
  statusText: {
    ...FONTS.caption,
    fontSize: getFontSize(12),
    color: COLORS.infoDark,
    marginLeft: getSpacing(4),
  },

  // ============================================
  // 🎯 SECTION
  // ============================================
  section: {
    alignItems: "center",
    marginBottom: getSpacing(20),
  },
  
  sectionTitle: {
    ...FONTS.h6,
    fontSize: getFontSize(16),
    color: COLORS.textBlueDark,
    marginBottom: getSpacing(4),
  },
  
  sectionSubtitle: {
    ...FONTS.caption,
    fontSize: getFontSize(12),
    color: COLORS.textTertiary,
    marginBottom: getSpacing(16),
  },

  // ============================================
  // 🎯 MPIN INPUTS
  // ============================================
  mpinContainer: {
    ...COMMON_STYLES.rowCenter,
    gap: getSpacing(12),
    position: "relative",
  },
  
  mpinDigitContainer: {
    ...COMMON_STYLES.card.default,
    width: getResponsiveValue(60),
    height: getResponsiveValue(60),
    borderRadius: SIZES.radius.md,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
  },
  
  mpinDigitContainerFocused: {
    borderColor: COLORS.primary,
    borderWidth: 3,
    backgroundColor: COLORS.blueOpacity10,
    transform: [{ scale: 1.05 }],
    ...SHADOWS.blue,
  },
  
  mpinDigitContainerFilled: {
    backgroundColor: COLORS.blueOpacity10,
    borderColor: COLORS.primary,
  },
  
  mpinDigitContainerDisabled: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.borderLight,
    opacity: 0.6,
  },
  
  mpinDigitInput: {
    ...FONTS.h1,
    fontSize: getFontSize(24),
    color: COLORS.textBlueDark,
    width: "100%",
    height: "100%",
    textAlign: "center",
    padding: 0,
    margin: 0,
  },
  
  mpinDigitInputFilled: {
    color: COLORS.primary,
  },
  
  visibilityButton: {
    position: "absolute",
    right: getResponsiveValue(-50),
    padding: getSpacing(8),
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.sm,
    width: getResponsiveValue(40),
    height: getResponsiveValue(40),
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // ============================================
  // 🎯 ATTEMPTS COUNTER
  // ============================================
  attemptsContainer: {
    alignItems: "center",
    marginBottom: getSpacing(16),
  },
  
  attemptsText: {
    ...FONTS.captionBold,
    fontSize: getFontSize(12),
    color: COLORS.warning,
    marginTop: getSpacing(6),
    marginBottom: getSpacing(8),
  },
  
  attemptsDots: {
    ...COMMON_STYLES.rowCenter,
    gap: getSpacing(6),
  },
  
  attemptDot: {
    width: getResponsiveValue(6),
    height: getResponsiveValue(6),
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.gray300,
  },
  
  attemptDotFilled: {
    backgroundColor: COLORS.warning,
    transform: [{ scale: 1.2 }],
  },

  // ============================================
  // 🎯 ACTION BUTTONS
  // ============================================
  actionButtons: {
    ...COMMON_STYLES.rowCenter,
    marginBottom: getSpacing(20),
  },
  
  forgotButton: {
    ...COMMON_STYLES.button.outline,
    paddingVertical: getSpacing(8),
    paddingHorizontal: getSpacing(12),
    borderWidth: 1.5,
  },
  
  forgotButtonText: {
    ...FONTS.label,
    fontSize: getFontSize(14),
    color: COLORS.primary,
    marginLeft: getSpacing(4),
  },
  
  buttonDisabled: {
    opacity: 0.5,
  },

  // ============================================
  // 🎯 SUBMIT BUTTON
  // ============================================
  submitButton: {
    ...COMMON_STYLES.button.primary,
    borderRadius: SIZES.radius.lg,
    paddingVertical: getSpacing(14),
    paddingHorizontal: getSpacing(24),
    marginBottom: getSpacing(16),
    width: "100%",
    borderWidth: 2,
    borderColor: COLORS.primaryDark,
  },
  
  submitButtonDisabled: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.border,
    opacity: 0.7,
  },
  
  buttonContent: {
    ...COMMON_STYLES.rowCenter,
    gap: getSpacing(8),
  },
  
  buttonText: {
    ...FONTS.button,
    fontSize: getFontSize(16),
    color: COLORS.white,
  },
  
  buttonIcon: {
    marginLeft: getSpacing(2),
  },

  // ============================================
  // 🎯 SECURITY INFO
  // ============================================
  securityContainer: {
    ...COMMON_STYLES.rowCenter,
    backgroundColor: COLORS.successLight + "20",
    paddingHorizontal: getSpacing(12),
    paddingVertical: getSpacing(10),
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.success,
    marginTop: getSpacing(4),
  },
  
  securityText: {
    ...FONTS.caption,
    fontSize: getFontSize(12),
    color: COLORS.successDark,
    marginLeft: getSpacing(6),
  },
});

export default styles;