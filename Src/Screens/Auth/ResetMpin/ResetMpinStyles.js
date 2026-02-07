// ResetMpinStyles.js
import { StyleSheet, Dimensions, Platform } from "react-native";
import theme from "../../../Utills/AppTheme";

const { COLORS, SIZES, FONTS, SHADOWS, moderateScale,COMMON_STYLES } = theme;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const getResponsiveValue = (value) => moderateScale(value);
const getSpacing = (base) => moderateScale(base);
const getFontSize = (size) => moderateScale(size);

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.backgroundBlue,
  },
  
  contentContainer: {
    flex: 1,
    paddingHorizontal: SIZES.padding.container,
    paddingTop: getSpacing(16),
    backgroundColor: COLORS.backgroundBlue,
  },

  // ============================================
  // 🎯 HEADER
  // ============================================
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: getSpacing(24),
    paddingHorizontal: getSpacing(4),
  },
  
  backButton: {
    width: getResponsiveValue(44),
    height: getResponsiveValue(44),
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  headerTitle: {
    ...FONTS.h4,
    fontSize: getFontSize(20),
    color: COLORS.textBlueDark,
    textAlign: "center",
  },
  
  headerPlaceholder: {
    width: getResponsiveValue(44),
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
    marginBottom: getSpacing(16),
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
  // 🎯 INSTRUCTIONS
  // ============================================
  instructionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.infoLight + "20",
    paddingHorizontal: getSpacing(12),
    paddingVertical: getSpacing(10),
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.info,
    marginBottom: getSpacing(20),
  },
  
  instructionsText: {
    ...FONTS.bodySmall,
    fontSize: getFontSize(13),
    color: COLORS.infoDark,
    marginLeft: getSpacing(8),
    flex: 1,
  },

  // ============================================
  // 🎯 SECTION
  // ============================================
  section: {
    marginBottom: getSpacing(20),
  },
  
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: getSpacing(4),
  },
  
  sectionTitle: {
    ...FONTS.h6,
    fontSize: getFontSize(16),
    color: COLORS.textBlueDark,
  },
  
  activeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: getSpacing(4),
  },
  
  activeText: {
    ...FONTS.caption,
    fontSize: getFontSize(12),
    color: COLORS.primary,
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
    right: getResponsiveValue(-10),
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
  // 🎯 MPIN STRENGTH VALIDATION
  // ============================================
  strengthContainer: {
    backgroundColor: COLORS.blueOpacity10,
    borderRadius: SIZES.radius.md,
    padding: getSpacing(16),
    marginBottom: getSpacing(20),
    borderWidth: 1,
    borderColor: COLORS.blueOpacity30,
  },
  
  strengthTitle: {
    ...FONTS.label,
    fontSize: getFontSize(14),
    color: COLORS.textBlueDark,
    marginBottom: getSpacing(12),
  },
  
  validationList: {
    gap: getSpacing(8),
  },
  
  validationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: getSpacing(8),
  },
  
  validationText: {
    ...FONTS.caption,
    fontSize: getFontSize(12),
    color: COLORS.textTertiary,
  },
  
  validationTextSuccess: {
    color: COLORS.successDark,
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
  
  resetButton: {
    ...COMMON_STYLES.button.outline,
    paddingVertical: getSpacing(8),
    paddingHorizontal: getSpacing(12),
    borderWidth: 1.5,
  },
  
  resetButtonText: {
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