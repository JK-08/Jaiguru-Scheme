import { StyleSheet, Dimensions, Platform } from "react-native";
import theme from "../../../Utills/AppTheme";

const {
  COLORS,
  SIZES,
  FONTS,
  COMMON_STYLES,
  SHADOWS,
  moderateScale,
  verticalScale,
  scale,
  BREAKPOINTS,
} = theme;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Responsive breakpoints
const isSmallScreen = SCREEN_WIDTH < 375;
const isMediumScreen = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 768;
const isLargeScreen = SCREEN_WIDTH >= 768;
const isTablet = SCREEN_WIDTH >= 768;

// Responsive calculations
const getResponsiveValue = (value, multiplier = 1) => {
  const base = moderateScale(value);
  if (isTablet) return base * 1.2 * multiplier;
  if (isSmallScreen) return base * 0.9 * multiplier;
  return base * multiplier;
};

const getPaddingHorizontal = () => {
  if (isTablet) return SIZES.padding.xxl;
  if (isSmallScreen) return SIZES.padding.md;
  return SIZES.padding.lg;
};

const getSpacing = (base) => {
  if (isTablet) return verticalScale(base * 1.5);
  if (isSmallScreen) return verticalScale(base * 0.8);
  return verticalScale(base);
};

const styles = StyleSheet.create({
  // ============================================
  // 🎯 CONTAINER & LAYOUT
  // ============================================
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.backgroundBlue,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingBottom: getSpacing(40),
    backgroundColor: COLORS.backgroundBlue,
    minHeight: SCREEN_HEIGHT,
  },

  responsiveContainer: {
    flex: 1,
    maxWidth: isTablet ? 600 : "100%",
    alignSelf: "center",
    width: "100%",
  },

  // ============================================
  // 🎯 HEADER
  // ============================================
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: getPaddingHorizontal(),
    paddingVertical: getSpacing(16),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  
  backButton: {
    width: getResponsiveValue(40),
    height: getResponsiveValue(40),
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.xs,
  },
  
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    marginLeft: isSmallScreen ? -SIZES.margin.sm : -SIZES.margin.md,
  },
  
  headerTitle: {
    fontSize: getResponsiveValue(18),
    fontFamily: FONTS.family.semiBold,
    color: COLORS.textBlueDark,
    textAlign: "center",
    lineHeight: getResponsiveValue(22),
  },
  
  headerSubtitle: {
    fontSize: getResponsiveValue(12),
    fontFamily: FONTS.family.regular,
    color: COLORS.textTertiary,
    marginTop: getSpacing(4),
    textAlign: "center",
  },
  
  headerRight: {
    width: getResponsiveValue(40),
  },

  // ============================================
  // 🎯 PREMIUM CARD (REDUCED HEIGHT)
  // ============================================
premiumCard: {
  backgroundColor: COLORS.white,
  borderRadius: getResponsiveValue(16),
  marginHorizontal: getPaddingHorizontal(),
  marginTop: getSpacing(14),
  marginBottom: getSpacing(8),
  paddingHorizontal: getResponsiveValue(16),
  paddingTop: getResponsiveValue(14),
  paddingBottom: getResponsiveValue(10),
  ...SHADOWS.md,
  borderWidth: 1,
  borderColor: COLORS.goldLight,
},


  mainTitle: {
    fontSize: getResponsiveValue(16), // Reduced from 20
    fontFamily: FONTS.family.semiBold,
    color: COLORS.textBlueDark,
    textAlign: "center",
    marginBottom: getSpacing(4), // Reduced margin
    lineHeight: getResponsiveValue(20),
  },
  
  subtitle: {
    fontSize: getResponsiveValue(12), // Reduced from 14
    fontFamily: FONTS.family.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: getResponsiveValue(16),
    paddingHorizontal: isSmallScreen ? 0 : getSpacing(10), // Reduced padding
  },

  // ============================================
  // 🎯 INPUT SECTIONS
  // ============================================
  section: {
    backgroundColor: COLORS.white,
    borderRadius: getResponsiveValue(12),
    marginHorizontal: getPaddingHorizontal(),
    marginBottom: getSpacing(16), // Reduced margin
    padding: getResponsiveValue(16),
    ...SHADOWS.sm,
  },
  
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getSpacing(8),
  },
  
  sectionIcon: {
    marginRight: getSpacing(8),
  },
  
  sectionTitle: {
    fontSize: getResponsiveValue(16),
    fontFamily: FONTS.family.semiBold,
    color: COLORS.textBlueDark,
    flex: 1,
  },
  
  sectionSubtitle: {
    fontSize: getResponsiveValue(12),
    fontFamily: FONTS.family.regular,
    color: COLORS.textTertiary,
    marginBottom: getSpacing(16),
    lineHeight: getResponsiveValue(16),
  },

  // ============================================
  // 🎯 MPIN INPUTS (FIXED CLICK ISSUES)
  // ============================================
  mpinContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    paddingRight: getResponsiveValue(45), // Adjusted for visibility button
  },
  
  mpinDigitContainer: {
    width: getResponsiveValue(60),
    height: getResponsiveValue(60),
    borderRadius: getResponsiveValue(12),
    backgroundColor: COLORS.inputBackground,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.xs,
    overflow: "hidden", // Ensures touch works properly
  },
  
  mpinDigitContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    ...SHADOWS.blue,
    borderWidth: 3, // Thicker border for focus
    transform: [{ scale: 1.05 }], // Slight zoom effect
  },
  
  mpinDigitContainerFilled: {
    backgroundColor: COLORS.primaryPale,
  },
  
  mpinDigitInput: {
    fontSize: getResponsiveValue(28), // Slightly larger for better visibility
    fontFamily: FONTS.family.bold,
    color: COLORS.textBlueDark,
    letterSpacing: getResponsiveValue(2),
    width: "100%",
    height: "100%",
    textAlign: "center",
    padding: 0,
    margin: 0,
  },
  
  visibilityButton: {
    position: "absolute",
    right: getResponsiveValue(0),
    padding: getResponsiveValue(8),
    backgroundColor: COLORS.primaryPale,
    borderRadius: SIZES.radius.md,
    width: getResponsiveValue(44),
    height: getResponsiveValue(44),
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.xs,
    zIndex: 10, // Ensure button is above inputs
  },

  // ============================================
  // 🎯 MESSAGES
  // ============================================
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error + "10",
    padding: getResponsiveValue(12),
    borderRadius: SIZES.radius.md,
    marginHorizontal: getPaddingHorizontal(),
    marginBottom: getSpacing(12),
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  
  errorText: {
    fontSize: getResponsiveValue(12),
    fontFamily: FONTS.family.medium,
    color: COLORS.error,
    marginLeft: getSpacing(8),
    flex: 1,
    lineHeight: getResponsiveValue(16),
  },
  
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.success + "10",
    padding: getResponsiveValue(12),
    borderRadius: SIZES.radius.md,
    marginHorizontal: getPaddingHorizontal(),
    marginBottom: getSpacing(12),
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  
  successText: {
    fontSize: getResponsiveValue(12),
    fontFamily: FONTS.family.medium,
    color: COLORS.successDark,
    marginLeft: getSpacing(8),
    flex: 1,
    lineHeight: getResponsiveValue(16),
  },

  // ============================================
  // 🎯 INFO BOX
  // ============================================
  infoBox: {
    flexDirection: "row",
    backgroundColor: COLORS.blueOpacity10,
    borderRadius: getResponsiveValue(12),
    marginHorizontal: getPaddingHorizontal(),
    marginBottom: getSpacing(20),
    padding: getResponsiveValue(14), // Reduced padding
    borderWidth: 1,
    borderColor: COLORS.primaryPale,
  },
  
  infoIcon: {
    marginTop: getSpacing(2),
  },
  
  infoContent: {
    flex: 1,
    marginLeft: getSpacing(10), // Reduced margin
  },
  
  infoTitle: {
    fontSize: getResponsiveValue(13), // Reduced size
    fontFamily: FONTS.family.semiBold,
    color: COLORS.textBlueDark,
    marginBottom: getSpacing(6), // Reduced margin
  },
  
  infoList: {
    marginTop: getSpacing(2),
  },
  
  infoListItem: {
    flexDirection: "row",
    alignItems: "flex-start", // Changed to flex-start for better alignment
    marginBottom: getSpacing(4), // Reduced margin
  },
  
  infoText: {
    fontSize: getResponsiveValue(11), // Reduced size
    fontFamily: FONTS.family.regular,
    color: COLORS.textBlueDark,
    marginLeft: getSpacing(6), // Reduced margin
    lineHeight: getResponsiveValue(14),
    flex: 1,
  },

  // ============================================
  // 🎯 ACTION BUTTONS
  // ============================================
  actionButtonsContainer: {
    paddingHorizontal: getPaddingHorizontal(),
  },
  
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.button,
    paddingVertical: getSpacing(16),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: getSpacing(12),
    ...SHADOWS.md,
  },
  
  buttonGold: {
    backgroundColor: COLORS.goldPrimary,
  },
  
  buttonDisabled: {
    backgroundColor: COLORS.gray400,
    opacity: 0.6,
  },
  
  buttonLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  
  loadingIcon: {
    marginRight: getSpacing(8),
  },
  
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  
  cancelButton: {
    backgroundColor: COLORS.transparent,
    borderRadius: SIZES.radius.button,
    paddingVertical: getSpacing(16),
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  
  cancelButtonText: {
    fontSize: getResponsiveValue(14),
    fontFamily: FONTS.family.semiBold,
    color: COLORS.textSecondary,
  },

  // ============================================
  // 🎯 RESPONSIVE ADJUSTMENTS
  // ============================================
  // Tablet specific styles
  tabletAdjustments: {
    premiumCard: {
      marginHorizontal: getPaddingHorizontal() * 1.2,
      padding: getResponsiveValue(20),
      minHeight: getResponsiveValue(180),
    },
    iconCircle: {
      width: getResponsiveValue(80),
      height: getResponsiveValue(80),
    },
    mpinDigitContainer: {
      width: getResponsiveValue(70),
      height: getResponsiveValue(70),
    },
  },

  // Small screen adjustments
  smallScreenAdjustments: {
    premiumCard: {
      marginHorizontal: getPaddingHorizontal() * 0.8,
      padding: getResponsiveValue(14),
      minHeight: getResponsiveValue(120),
    },
    iconCircle: {
      width: getResponsiveValue(50),
      height: getResponsiveValue(50),
    },
    mpinDigitContainer: {
      width: getResponsiveValue(48),
      height: getResponsiveValue(48),
    },
    visibilityButton: {
      right: getResponsiveValue(-40),
    },
  },
});

// Create responsive style variations
export const getResponsiveStyles = () => {
  const responsiveStyles = { ...styles };

  if (isTablet) {
    // Merge tablet adjustments
    Object.keys(responsiveStyles.tabletAdjustments).forEach(key => {
      if (responsiveStyles[key]) {
        responsiveStyles[key] = {
          ...responsiveStyles[key],
          ...responsiveStyles.tabletAdjustments[key]
        };
      }
    });
  } else if (isSmallScreen) {
    // Merge small screen adjustments
    Object.keys(responsiveStyles.smallScreenAdjustments).forEach(key => {
      if (responsiveStyles[key]) {
        responsiveStyles[key] = {
          ...responsiveStyles[key],
          ...responsiveStyles.smallScreenAdjustments[key]
        };
      }
    });
  }

  return responsiveStyles;
};

export default styles;