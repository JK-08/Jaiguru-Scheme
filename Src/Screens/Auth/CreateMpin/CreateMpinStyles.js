import { StyleSheet, Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

// Responsive sizing helpers
const scaleSize = (size) => (width / 375) * size;
const moderateScale = (size, factor = 0.5) => size + (scaleSize(size) - size) * factor;

// Colors from your theme (with fallbacks)
const COLORS = {
  backgroundBlue: "#F8F9FA",
  white: "#FFFFFF",
  primary: "#007AFF",
  error: "#FF3B30",
  success: "#34C759",
  textBlueDark: "#1F2937",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  borderLight: "#E5E7EB",
  inputBackground: "#FFFFFF",
  inputBorder: "#E5E7EB",
  goldPrimary: "#FFD700",
};

const SIZES = {
  padding: {
    container: moderateScale(20),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(24),
  },
  margin: {
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(24),
  },
  radius: {
    md: moderateScale(10),
    lg: moderateScale(12),
    button: moderateScale(12),
  },
};

const FONTS = {
  family: {
    regular: "System",
    medium: "System",
    semiBold: "System",
    bold: "System",
  },
};

const styles = StyleSheet.create({
  // ============================================
  // 🎯 CONTAINER & LAYOUT
  // ============================================
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundBlue,
  },

  keyboardView: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: "space-between",
  },

  // ============================================
  // 🎯 HEADER
  // ============================================
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding.container,
    paddingTop: Platform.OS === "ios" ? SIZES.padding.md : SIZES.padding.lg,
    paddingBottom: SIZES.padding.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderLight,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SIZES.margin.md,
  },

  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.gray100,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: moderateScale(18),
    fontFamily: FONTS.family.semiBold,
    color: COLORS.textBlueDark,
    fontWeight: "600",
  },

  headerSpacer: {
    width: moderateScale(40),
  },

  // Progress Bar
  progressContainer: {
    alignItems: "center",
  },

  progressBar: {
    width: "100%",
    height: moderateScale(6),
    backgroundColor: COLORS.gray200,
    borderRadius: moderateScale(3),
    overflow: "hidden",
    marginBottom: moderateScale(8),
  },

  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(3),
  },

  progressText: {
    fontSize: moderateScale(12),
    fontFamily: FONTS.family.medium,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },

  // ============================================
  // 🎯 MAIN CONTENT
  // ============================================
  mainContent: {
    flex: 1,
    paddingHorizontal: SIZES.padding.container,
    paddingTop: SIZES.padding.xl,
    justifyContent: "flex-start",
  },

  iconContainer: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: SIZES.margin.lg,
  },

  title: {
    fontSize: moderateScale(24),
    fontFamily: FONTS.family.bold,
    color: COLORS.textBlueDark,
    textAlign: "center",
    marginBottom: moderateScale(8),
    fontWeight: "700",
  },

  subtitle: {
    fontSize: moderateScale(14),
    fontFamily: FONTS.family.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SIZES.margin.xl,
    paddingHorizontal: moderateScale(20),
    lineHeight: moderateScale(20),
  },

  // ============================================
  // 🎯 MPIN INPUTS
  // ============================================
  inputSection: {
    marginBottom: SIZES.margin.xl,
  },

  mpinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  mpinDigitWrapper: {
    width: moderateScale(60),
    height: moderateScale(70),
    marginHorizontal: moderateScale(6),
    borderRadius: SIZES.radius.lg,
    backgroundColor: COLORS.inputBackground,
    borderWidth: moderateScale(2),
    borderColor: COLORS.inputBorder,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  mpinDigitWrapperFocused: {
    borderColor: COLORS.primary,
    borderWidth: moderateScale(3),
    backgroundColor: COLORS.white,
    transform: [{ scale: 1.05 }],
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  mpinDigitWrapperFilled: {
    backgroundColor: `${COLORS.primary}10`,
    borderColor: COLORS.primary,
  },

  mpinDigitInput: {
    width: "100%",
    height: "100%",
    fontSize: moderateScale(28),
    fontFamily: FONTS.family.bold,
    color: COLORS.textBlueDark,
    textAlign: "center",
    padding: 0,
    fontWeight: "700",
  },

  dotIndicator: {
    position: "absolute",
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    backgroundColor: COLORS.primary,
  },

  visibilityButton: {
    position: "absolute",
    right: 0,
    padding: moderateScale(10),
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: SIZES.radius.md,
    width: moderateScale(44),
    height: moderateScale(44),
    justifyContent: "center",
    alignItems: "center",
  },

  // ============================================
  // 🎯 ERROR & MESSAGES
  // ============================================
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.error}10`,
    padding: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.margin.md,
    borderLeftWidth: moderateScale(4),
    borderLeftColor: COLORS.error,
  },

  errorText: {
    fontSize: moderateScale(12),
    fontFamily: FONTS.family.medium,
    color: COLORS.error,
    marginLeft: moderateScale(8),
    flex: 1,
    lineHeight: moderateScale(16),
    fontWeight: "500",
  },

  // ============================================
  // 🎯 SECURITY TIPS
  // ============================================
  tipsContainer: {
    backgroundColor: `${COLORS.primary}08`,
    padding: SIZES.padding.lg,
    borderRadius: SIZES.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${COLORS.primary}20`,
  },

  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: moderateScale(8),
  },

  tipText: {
    fontSize: moderateScale(12),
    fontFamily: FONTS.family.regular,
    color: COLORS.textSecondary,
    marginLeft: moderateScale(8),
    flex: 1,
    lineHeight: moderateScale(16),
  },

  // ============================================
  // 🎯 FOOTER ACTIONS
  // ============================================
  footer: {
    paddingHorizontal: SIZES.padding.container,
    paddingBottom: Platform.select({
      ios: moderateScale(10),
      android: SIZES.padding.lg,
    }),
    backgroundColor: COLORS.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.borderLight,
  },

  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SIZES.padding.md,
  },

  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(16),
    borderRadius: SIZES.radius.md,
    backgroundColor: `${COLORS.primary}10`,
  },

  secondaryButtonText: {
    fontSize: moderateScale(14),
    fontFamily: FONTS.family.semiBold,
    color: COLORS.primary,
    marginLeft: moderateScale(6),
    fontWeight: "600",
  },

  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(16),
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.gray100,
  },

  clearButtonText: {
    fontSize: moderateScale(14),
    fontFamily: FONTS.family.medium,
    color: COLORS.textTertiary,
    marginLeft: moderateScale(6),
    fontWeight: "500",
  },

  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.goldPrimary || COLORS.primary,
    paddingVertical: moderateScale(16),
    borderRadius: SIZES.radius.button,
    marginTop: SIZES.margin.sm,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.goldPrimary || COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  submitButtonDisabled: {
    opacity: 0.6,
  },

  submitButtonText: {
    fontSize: moderateScale(16),
    fontFamily: FONTS.family.bold,
    color: COLORS.white,
    marginLeft: moderateScale(8),
    fontWeight: "700",
  },
   mpinDigitWrapperError: {
    borderColor: COLORS.error,
    backgroundColor: `${COLORS.error}10`,
  },

  loadingContainer: {
    marginTop: SIZES.margin.lg,
    padding: SIZES.padding.md,
    backgroundColor: COLORS.gray100,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
  },

  loadingText: {
    fontSize: moderateScale(14),
    fontFamily: FONTS.family.medium,
    color: COLORS.primary,
  },

});

// Responsive adjustments
const responsiveStyles = StyleSheet.create({
  // Small screens
  smallScreen: {
    mpinDigitWrapper: {
      width: moderateScale(50),
      height: moderateScale(60),
      marginHorizontal: moderateScale(4),
    },
    mpinDigitInput: {
      fontSize: moderateScale(24),
    },
    title: {
      fontSize: moderateScale(20),
    },
    iconContainer: {
      width: moderateScale(70),
      height: moderateScale(70),
    },
  },
  
  // Tablet/Large screens
  largeScreen: {
    content: {
      maxWidth: moderateScale(600),
      alignSelf: "center",
      width: "100%",
    },
    mpinDigitWrapper: {
      width: moderateScale(70),
      height: moderateScale(80),
      marginHorizontal: moderateScale(8),
    },
    mpinDigitInput: {
      fontSize: moderateScale(32),
    },
    iconContainer: {
      width: moderateScale(100),
      height: moderateScale(100),
    },
    errorText: {
      fontSize: moderateScale(11),
    },
  },
});

// Export both for conditional usage
export { responsiveStyles };
export default styles;