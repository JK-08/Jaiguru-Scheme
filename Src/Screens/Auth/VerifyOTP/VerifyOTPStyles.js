import { StyleSheet, Dimensions, Platform } from "react-native";
import theme from "../../../Utills/AppTheme";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.backgroundGold,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.SIZES.padding.container || 20,
    paddingTop: Platform.OS === "ios" ? theme.SIZES.md || 16 : theme.SIZES.sm || 12,
    paddingBottom: theme.SIZES.xl || 24,
  },
  contentContainer: {
    marginTop: theme.SIZES.md || 16,
  },

  // Error Banner
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${theme.COLORS.error}15`,
    padding: theme.SIZES.padding.md || 12,
    borderRadius: theme.SIZES.radius.md || 12,
    marginBottom: theme.SIZES.xl || 24,
    borderLeftWidth: 4,
    borderLeftColor: theme.COLORS.error,
  },
  errorText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.error,
    flex: 1,
    marginHorizontal: theme.SIZES.sm || 8,
  },
  closeButton: {
    padding: theme.SIZES.xs || 4,
  },

  // Auto-Verify Card
  autoVerifyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.COLORS.white,
    padding: theme.SIZES.padding.lg || 16,
    borderRadius: theme.SIZES.radius.lg || 16,
    marginBottom: theme.SIZES.xl || 24,
    shadowColor: theme.COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: `${theme.COLORS.primary}20`,
  },
  autoVerifyIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${theme.COLORS.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.SIZES.md || 12,
  },
  autoVerifyContent: {
    flex: 1,
  },
  autoVerifyTitle: {
    ...theme.FONTS.h4,
    color: theme.COLORS.primary,
    marginBottom: 4,
  },
  autoVerifySubtitle: {
    ...theme.FONTS.caption,
    color: theme.COLORS.textSecondary,
    marginBottom: 6,
  },
  autoVerifyTimer: {
    ...theme.FONTS.bodySmallBold,
    color: theme.COLORS.goldPrimary,
  },
  skipButton: {
    paddingHorizontal: theme.SIZES.md || 12,
    paddingVertical: theme.SIZES.sm || 8,
    borderRadius: theme.SIZES.radius.sm || 8,
    backgroundColor: `${theme.COLORS.textTertiary}10`,
  },
  skipButtonText: {
    ...theme.FONTS.bodySmallBold,
    color: theme.COLORS.textTertiary,
  },

  // OTP Input Section
  otpSection: {
    marginBottom: theme.SIZES.xxl || 32,
  },
  otpLabel: {
    ...theme.FONTS.h4,
    color: theme.COLORS.textPrimary,
    marginBottom: theme.SIZES.lg || 16,
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.SIZES.sm || 8,
    marginBottom: theme.SIZES.md || 12,
  },
  otpInputWrapper: {
    alignItems: "center",
    width: (width - 80) / 6,
  },
  otpInput: {
    width: "100%",
    height: 56,
    fontSize: 24,
    fontFamily: theme.FONTS.family?.bold || "System",
    color: theme.COLORS.textPrimary,
    textAlign: "center",
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.SIZES.radius.md || 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  otpInputFilled: {
    color: theme.COLORS.primary,
    backgroundColor: `${theme.COLORS.primary}08`,
    borderWidth: 2,
    borderColor: theme.COLORS.primary,
  },
  otpInputDisabled: {
    opacity: 0.5,
    backgroundColor: theme.COLORS.gray100,
  },
  otpInputUnderline: {
    width: "80%",
    height: 3,
    backgroundColor: theme.COLORS.gray300,
    marginTop: 6,
    borderRadius: 2,
  },
  otpInputUnderlineActive: {
    backgroundColor: theme.COLORS.primary,
    height: 4,
  },

  // Clear Button
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    paddingVertical: theme.SIZES.sm || 8,
    paddingHorizontal: theme.SIZES.md || 12,
    marginTop: theme.SIZES.sm || 8,
  },
  clearButtonText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textTertiary,
    marginLeft: 6,
  },

  // Timer Section
  timerSection: {
    alignItems: "center",
    marginBottom: theme.SIZES.xxl || 32,
  },
  timerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.COLORS.white,
    paddingHorizontal: theme.SIZES.padding.lg || 16,
    paddingVertical: theme.SIZES.padding.md || 12,
    borderRadius: theme.SIZES.radius.xl || 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  timerText: {
    ...theme.FONTS.body,
    color: theme.COLORS.textSecondary,
    marginLeft: theme.SIZES.sm || 8,
  },
  timerValue: {
    ...theme.FONTS.bodyBold,
    color: theme.COLORS.goldPrimary,
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.COLORS.white,
    paddingVertical: theme.SIZES.padding.md || 12,
    paddingHorizontal: theme.SIZES.padding.lg || 16,
    borderRadius: theme.SIZES.radius.lg || 16,
    borderWidth: 2,
    borderColor: theme.COLORS.goldPrimary,
    shadowColor: theme.COLORS.goldPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  resendButtonText: {
    ...theme.FONTS.buttonMedium,
    color: theme.COLORS.goldPrimary,
    marginLeft: theme.SIZES.sm || 8,
  },

  // Verify Button
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.COLORS.goldPrimary,
    borderRadius: theme.SIZES.radius.md || 12,
    paddingVertical: theme.SIZES.padding.md || 16,
    height: theme.SIZES.button?.height?.lg || 56,
    marginBottom: theme.SIZES.xl || 24,
    shadowColor: theme.COLORS.goldPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  verifyButtonText: {
    ...theme.FONTS.buttonLarge,
    color: theme.COLORS.white,
    marginLeft: theme.SIZES.sm || 8,
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingTop: theme.SIZES.lg || 16,
    borderTopWidth: 1,
    borderTopColor: `${theme.COLORS.gray300}30`,
  },
  editNumberText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textTertiary,
    marginBottom: theme.SIZES.md || 12,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${theme.COLORS.primary}08`,
    paddingVertical: theme.SIZES.sm || 8,
    paddingHorizontal: theme.SIZES.md || 12,
    borderRadius: theme.SIZES.radius.md || 12,
    marginTop: theme.SIZES.sm || 8,
  },
  securityText: {
    ...theme.FONTS.caption,
    color: theme.COLORS.textTertiary,
    marginLeft: 6,
  },

  // Full Screen Loader (Auto-Verify)
  fullScreenLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  loaderCard: {
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.SIZES.radius.xl || 20,
    padding: theme.SIZES.padding.xl || 24,
    alignItems: "center",
    maxWidth: width * 0.85,
    minWidth: width * 0.75,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  loaderIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: `${theme.COLORS.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.SIZES.lg || 16,
  },
  loaderTitle: {
    ...theme.FONTS.h3,
    color: theme.COLORS.primary,
    marginBottom: theme.SIZES.sm || 8,
    textAlign: "center",
  },
  loaderSubtitle: {
    ...theme.FONTS.body,
    color: theme.COLORS.textSecondary,
    textAlign: "center",
    marginBottom: theme.SIZES.lg || 16,
    lineHeight: 22,
  },
  loaderTimerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${theme.COLORS.goldPrimary}15`,
    paddingVertical: theme.SIZES.sm || 8,
    paddingHorizontal: theme.SIZES.md || 12,
    borderRadius: theme.SIZES.radius.md || 12,
    marginBottom: theme.SIZES.lg || 16,
  },
  loaderTimer: {
    ...theme.FONTS.bodyBold,
    color: theme.COLORS.goldPrimary,
    marginLeft: 6,
  },
  loaderSkipButton: {
    paddingVertical: theme.SIZES.sm || 8,
    paddingHorizontal: theme.SIZES.lg || 16,
    borderRadius: theme.SIZES.radius.md || 12,
    borderWidth: 1,
    borderColor: theme.COLORS.gray300,
    marginTop: theme.SIZES.sm || 8,
  },
  loaderSkipText: {
    ...theme.FONTS.bodySmallBold,
    color: theme.COLORS.textSecondary,
  },
});