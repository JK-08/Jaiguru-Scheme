// theme.js
import { Dimensions, PixelRatio, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

// ============================================
// 📏 RESPONSIVE SCALING SYSTEM
// ============================================
const guidelineBaseWidth = 375; // iPhone 11 Pro base
const guidelineBaseHeight = 812;

// Scale based on device width
const scale = (size) => (width / guidelineBaseWidth) * size;

// Scale based on device height
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

// Moderate scale with configurable factor (prevents extreme scaling)
const moderateScale = (size, factor = 0.25) => {
  return size + (scale(size) - size) * factor;
};

// Font scale with pixel ratio consideration
const fontScale = (size) => {
  const scaled = moderateScale(size, 0.2);
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

// ============================================
// 🎨 COLOR PALETTE - BLUE & GOLD THEME
// ============================================
export const COLORS = {
  // ===== PRIMARY BRAND COLORS (NAVY BLUE & GOLD) =====
  primary: "#1c467cff", // Navy Blue (Your Brand Color)
  primaryLight: "#2A5A9E", // Light Navy
  primaryDark: "#152F5C", // Deep Navy
  primaryLighter: "#3D6DB8", // Lighter Navy
  primaryPale: "#E8EEF7", // Very Light Blue

  secondary: "#FFD700", // Pure Gold
  secondaryLight: "#FFE44D", // Light Gold
  secondaryDark: "#CCA900", // Dark Gold
  secondaryLighter: "#FFF4CC", // Pale Gold

  accent: "#D4AF37", // Rich Gold
  accentLight: "#F4E5B5", // Champagne Gold
  accentDark: "#B8860B", // Dark Golden Rod

  // ===== NEUTRAL COLORS =====
  white: "#FFFFFF",
  black: "#000000",
  background: "#FFFFFF",
  backgroundSecondary: "#F8F9FB",
  backgroundTertiary: "#F5F7FA",
  backgroundDark: "#0F1419",
  backgroundBlue: "#F0F4F9", // Light blue tint background
  backgroundGold: "#FFFBF0", // Light gold tint background
  surface: "#FAFBFC",
  card: "#FFFFFF",
  overlay: "rgba(28, 70, 124, 0.7)", // Navy overlay
  overlayDark: "rgba(0, 0, 0, 0.7)",
  overlayGold: "rgba(255, 215, 0, 0.1)",
  overlayBlue: "rgba(28, 70, 124, 0.1)",

  // ===== TEXT COLORS =====
  textPrimary: "#1A1D23", // Almost black
  textSecondary: "#5F6368", // Gray text
  textTertiary: "#9AA0A8", // Light gray text
  textDisabled: "#D1D5DB", // Disabled text
  textInverse: "#FFFFFF", // White text on dark
  textBlue: "#1c467cff", // Navy blue text
  textBlueDark: "#152F5C", // Dark blue text
  textGold: "#FFD700", // Gold text
  textGoldDark: "#CCA900", // Dark gold text

  // ===== GRAY SCALE =====
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",

  // ===== BLUE VARIATIONS =====
  blueLight: "#E8EEF7",
  blueMedium: "#6A92D4",
  blueDark: "#0D2847",
  blueVivid: "#2563EB",
  blueIce: "#D0E3FF",
  blueSky: "#7CA9F7",
  blueMidnight: "#1A2C4D",

  // ===== BORDER & DIVIDER =====
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  borderMedium: "#D1D5DB",
  borderDark: "#4B5563",
  borderBlue: "#1c467cff",
  borderGold: "#FFD700",
  divider: "#E5E7EB",

  // ===== INPUT COLORS =====
  inputBackground: "#F9FAFB",
  inputBorder: "#E5E7EB",
  inputPlaceholder: "rgba(107, 114, 128, 0.6)",
  inputFocused: "#1c467cff", // Navy blue for focus
  inputFocusedAlt: "#FFD700", // Gold alternative

  // ===== STATUS COLORS =====
  success: "#10B981",
  successLight: "#6EE7B7",
  successDark: "#047857",
  error: "#DC2626",
  errorLight: "#EF4444",
  errorDark: "#991B1B",
  warning: "#F59E0B",
  warningLight: "#FBBF24",
  warningDark: "#B45309",
  info: "#3B82F6",
  infoLight: "#60A5FA",
  infoDark: "#1E40AF",
  disabled: "#F3F4F6",

  // ===== GOLD VARIATIONS =====
  goldPrimary: "#FFD700", // Pure Gold
  goldSecondary: "#D4AF37", // Rich Gold
  goldTertiary: "#F4E5B5", // Champagne
  goldBronze: "#CD7F32", // Bronze
  goldRose: "#B76E79", // Rose Gold
  goldLight: "#FFF9E6", // Very light gold
  goldMedium: "#E6C200", // Medium gold
  goldDark: "#B8860B", // Dark gold

  // ===== TRANSPARENT COLORS =====
  transparent: "transparent",
  // Blue opacity
  blueOpacity10: "rgba(28, 70, 124, 0.1)",
  blueOpacity20: "rgba(28, 70, 124, 0.2)",
  blueOpacity30: "rgba(28, 70, 124, 0.3)",
  blueOpacity40: "rgba(28, 70, 124, 0.4)",
  blueOpacity50: "rgba(28, 70, 124, 0.5)",
  blueOpacity60: "rgba(28, 70, 124, 0.6)",
  blueOpacity70: "rgba(28, 70, 124, 0.7)",
  blueOpacity80: "rgba(28, 70, 124, 0.8)",
  blueOpacity90: "rgba(28, 70, 124, 0.9)",
  // Black opacity
  blackOpacity10: "rgba(0, 0, 0, 0.1)",
  blackOpacity20: "rgba(0, 0, 0, 0.2)",
  blackOpacity30: "rgba(0, 0, 0, 0.3)",
  blackOpacity40: "rgba(0, 0, 0, 0.4)",
  blackOpacity50: "rgba(0, 0, 0, 0.5)",
  blackOpacity60: "rgba(0, 0, 0, 0.6)",
  blackOpacity70: "rgba(0, 0, 0, 0.7)",
  blackOpacity80: "rgba(0, 0, 0, 0.8)",
  blackOpacity90: "rgba(0, 0, 0, 0.9)",
  // White opacity
  whiteOpacity10: "rgba(255, 255, 255, 0.1)",
  whiteOpacity20: "rgba(255, 255, 255, 0.2)",
  whiteOpacity30: "rgba(255, 255, 255, 0.3)",
  whiteOpacity50: "rgba(255, 255, 255, 0.5)",
  whiteOpacity70: "rgba(255, 255, 255, 0.7)",
  whiteOpacity80: "rgba(255, 255, 255, 0.8)",
  whiteOpacity90: "rgba(255, 255, 255, 0.9)",
  // Gold opacity
  goldOpacity10: "rgba(255, 215, 0, 0.1)",
  goldOpacity20: "rgba(255, 215, 0, 0.2)",
  goldOpacity30: "rgba(255, 215, 0, 0.3)",
  goldOpacity50: "rgba(255, 215, 0, 0.5)",

  // ===== SHADOW & EFFECTS =====
  shadow: "rgba(0, 0, 0, 0.1)",
  shadowMedium: "rgba(0, 0, 0, 0.2)",
  shadowStrong: "rgba(0, 0, 0, 0.3)",
  shadowBlue: "rgba(28, 70, 124, 0.25)",
  shadowGold: "rgba(255, 215, 0, 0.3)",

  // ===== GRADIENT COLORS =====
  gradient: {
    // Blue gradients
    bluePrimary: ["#1c467cff", "#2A5A9E"], // Navy to light navy
    blueDeep: ["#0D2847", "#1c467cff"], // Deep to navy
    blueLight: ["#3D6DB8", "#6A92D4"], // Light blue gradient
    blueSky: ["#2563EB", "#7CA9F7"], // Vivid to sky blue
    blueToWhite: ["#1c467cff", "#FFFFFF"], // Navy to white
    
    // Gold gradients
    goldLight: ["#FFD700", "#FFE44D"], // Gold gradient
    goldDark: ["#CCA900", "#FFD700"], // Dark to light gold
    luxuryGold: ["#D4AF37", "#FFD700", "#F4E5B5"], // Luxury gold
    shimmer: ["#FFD700", "#FFF4CC", "#FFD700"], // Gold shimmer
    
    // Blue & Gold combinations
    blueToGold: ["#1c467cff", "#FFD700"], // Navy to Gold
    goldToBlue: ["#FFD700", "#1c467cff"], // Gold to Navy
    elegance: ["#152F5C", "#D4AF37"], // Deep blue to rich gold
    luxury: ["#1c467cff", "#FFD700", "#2A5A9E"], // Navy-Gold-Light Navy
    premium: ["#0D2847", "#1c467cff", "#D4AF37"], // Deep navy to gold
    
    // Neutral surfaces
    surface: ["#FAFBFC", "#FFFFFF"], // Neutral surface
    surfaceBlue: ["#F0F4F9", "#FFFFFF"], // Blue tint surface
    darkSurface: ["#1A2C4D", "#0D2847"], // Dark blue surface
  },
};

// ============================================
// 📐 SIZING SYSTEM
// ============================================
export const SIZES = {
  // ===== BASE SIZE =====
  base: 16,

  // ===== SPACING SCALE =====
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
  xxl: moderateScale(48),
  xxxl: moderateScale(64),

  // ===== PADDING & MARGIN =====
  padding: {
    xs: moderateScale(4),
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(20),
    xxl: moderateScale(24),
    xxxl: moderateScale(32),
    container: moderateScale(20), // Standard container padding
  },

  margin: {
    xs: moderateScale(4),
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(20),
    xxl: moderateScale(24),
    xxxl: moderateScale(32),
  },

  // ===== BORDER RADIUS =====
  radius: {
    xs: moderateScale(4),
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(20),
    xxl: moderateScale(24),
    xxxl: moderateScale(32),
    full: 9999,
    card: moderateScale(16),
    button: moderateScale(12),
    input: moderateScale(10),
  },

  // ===== FONT SIZES =====
  font: {
    xxs: fontScale(8),
    xs: fontScale(10),
    sm: fontScale(12),
    md: fontScale(14),
    lg: fontScale(16),
    xl: fontScale(18),
    xxl: fontScale(20),
    xxxl: fontScale(24),
  },

  // ===== HEADING SIZES =====
  heading: {
    h1: fontScale(32),
    h2: fontScale(28),
    h3: fontScale(24),
    h4: fontScale(20),
    h5: fontScale(18),
    h6: fontScale(16),
  },

  // ===== ICON SIZES =====
  icon: {
    xs: moderateScale(12),
    sm: moderateScale(16),
    md: moderateScale(20),
    lg: moderateScale(24),
    xl: moderateScale(28),
    xxl: moderateScale(32),
    xxxl: moderateScale(48),
    xxxxl: moderateScale(64),
  },

  // ===== DIMENSIONS =====
  screen: {
    width,
    height,
    isSmallDevice: width < 375,
    isMediumDevice: width >= 375 && width < 414,
    isLargeDevice: width >= 414,
    isTablet: width >= 768,
  },

  // ===== COMPONENT SIZES =====
  button: {
    sm: moderateScale(36),
    md: moderateScale(44),
    lg: moderateScale(52),
    xl: moderateScale(60),
    height: {
      sm: moderateScale(36),
      md: moderateScale(48),
      lg: moderateScale(56),
    },
  },

  input: {
    sm: moderateScale(36),
    md: moderateScale(44),
    lg: moderateScale(52),
    height: moderateScale(48),
  },

  card: {
    padding: moderateScale(16),
    paddingLg: moderateScale(20),
  },

  header: {
    height: Platform.OS === "ios" ? moderateScale(88) : moderateScale(56),
  },

  tabBar: {
    height: Platform.OS === "ios" ? moderateScale(84) : moderateScale(60),
  },
};

// ============================================
// 🔤 TYPOGRAPHY SYSTEM (POPPINS)
// ============================================
export const FONTS = {
  // ===== FONT FAMILIES =====
  family: {
    thin: "Poppins-Thin",
    light: "Poppins-Light",
    regular: "Poppins-Regular",
    medium: "Poppins-Medium",
    semiBold: "Poppins-SemiBold",
    bold: "Poppins-Bold",
    extraBold: "Poppins-ExtraBold",

    // Aliases
    heading: "Poppins-Bold",
    body: "Poppins-Regular",
    bodyBold: "Poppins-SemiBold",
  },

  // ===== FONT WEIGHTS =====
  weight: {
    thin: "100",
    light: "300",
    regular: "400",
    medium: "500",
    semiBold: "600",
    bold: "700",
    extraBold: "800",
  },

  // ===== HEADING STYLES =====
  h1: {
    fontFamily: "Poppins-Bold",
    fontSize: SIZES.heading.h1,
    lineHeight: SIZES.heading.h1 * 1.2,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: "Poppins-Bold",
    fontSize: SIZES.heading.h2,
    lineHeight: SIZES.heading.h2 * 1.25,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: "Poppins-SemiBold",
    fontSize: SIZES.heading.h3,
    lineHeight: SIZES.heading.h3 * 1.3,
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  h4: {
    fontFamily: "Poppins-SemiBold",
    fontSize: SIZES.heading.h4,
    lineHeight: SIZES.heading.h4 * 1.3,
    color: COLORS.textPrimary,
  },
  h5: {
    fontFamily: "Poppins-Medium",
    fontSize: SIZES.heading.h5,
    lineHeight: SIZES.heading.h5 * 1.4,
    color: COLORS.textPrimary,
  },
  h6: {
    fontFamily: "Poppins-Medium",
    fontSize: SIZES.heading.h6,
    lineHeight: SIZES.heading.h6 * 1.4,
    color: COLORS.textPrimary,
  },

  // ===== BODY TEXT STYLES =====
  bodyLarge: {
    fontFamily: "Poppins-Regular",
    fontSize: SIZES.font.lg,
    lineHeight: SIZES.font.lg * 1.5,
    color: COLORS.textPrimary,
  },
  body: {
    fontFamily: "Poppins-Regular",
    fontSize: SIZES.font.md,
    lineHeight: SIZES.font.md * 1.5,
    color: COLORS.textPrimary,
  },
  bodyMedium: {
    fontFamily: "Poppins-Medium",
    fontSize: SIZES.font.md,
    lineHeight: SIZES.font.md * 1.5,
    color: COLORS.textPrimary,
  },
  bodySmall: {
    fontFamily: "Poppins-Regular",
    fontSize: SIZES.font.sm,
    lineHeight: SIZES.font.sm * 1.5,
    color: COLORS.textSecondary,
  },
  bodyBold: {
    fontFamily: "Poppins-Bold",
    fontSize: SIZES.font.md,
    lineHeight: SIZES.font.md * 1.5,
    color: COLORS.textPrimary,
  },

  // ===== LABEL & CAPTION =====
  label: {
    fontFamily: "Poppins-SemiBold",
    fontSize: SIZES.font.sm,
    lineHeight: SIZES.font.sm * 1.4,
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  labelUppercase: {
    fontFamily: "Poppins-SemiBold",
    fontSize: SIZES.font.sm,
    lineHeight: SIZES.font.sm * 1.4,
    color: COLORS.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  caption: {
    fontFamily: "Poppins-Regular",
    fontSize: SIZES.font.xs,
    lineHeight: SIZES.font.xs * 1.4,
    color: COLORS.textSecondary,
  },
  captionBold: {
    fontFamily: "Poppins-SemiBold",
    fontSize: SIZES.font.xs,
    lineHeight: SIZES.font.xs * 1.4,
    color: COLORS.textPrimary,
  },

  // ===== BUTTON TEXT =====
  button: {
    fontFamily: "Poppins-SemiBold",
    fontSize: SIZES.font.md,
    lineHeight: SIZES.font.md * 1.3,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  buttonLarge: {
    fontFamily: "Poppins-Bold",
    fontSize: SIZES.font.lg,
    lineHeight: SIZES.font.lg * 1.3,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  buttonSmall: {
    fontFamily: "Poppins-Medium",
    fontSize: SIZES.font.sm,
    lineHeight: SIZES.font.sm * 1.3,
    color: COLORS.white,
  },

  // ===== SPECIAL STYLES (BLUE & GOLD TEXT) =====
  blueHeading: {
    fontFamily: "Poppins-Bold",
    fontSize: SIZES.heading.h2,
    lineHeight: SIZES.heading.h2 * 1.25,
    color: COLORS.primary,
    letterSpacing: -0.3,
  },
  blueText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: SIZES.font.md,
    lineHeight: SIZES.font.md * 1.5,
    color: COLORS.primary,
  },
  goldHeading: {
    fontFamily: "Poppins-Bold",
    fontSize: SIZES.heading.h2,
    lineHeight: SIZES.heading.h2 * 1.25,
    color: COLORS.goldPrimary,
    letterSpacing: -0.3,
  },
  goldText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: SIZES.font.md,
    lineHeight: SIZES.font.md * 1.5,
    color: COLORS.goldPrimary,
  },
};

// ============================================
// 🎭 SHADOWS
// ============================================
export const SHADOWS = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  // Blue shadow for premium feel
  blue: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  blueStrong: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  // Gold shadow for accents
  gold: {
    shadowColor: COLORS.goldPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  goldStrong: {
    shadowColor: COLORS.goldPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ============================================
// 📱 DEVICE BREAKPOINTS
// ============================================
export const BREAKPOINTS = {
  small: width < 375,
  medium: width >= 375 && width < 768,
  large: width >= 768,
  tablet: width >= 768,
  isSmallDevice: width < 375,
  isMediumDevice: width >= 375 && width < 768,
  isLargeDevice: width >= 768,
  isTablet: width >= 768,
};

// ============================================
// 🎨 COMMON STYLES
// ============================================
export const COMMON_STYLES = {
  // ===== CONTAINER STYLES =====
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerCentered: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  containerPadded: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding.container,
  },
  containerBlue: {
    flex: 1,
    backgroundColor: COLORS.backgroundBlue,
  },

  // ===== BUTTON STYLES =====
  button: {
    // Primary navy blue button
    primary: {
      backgroundColor: COLORS.primary,
      borderRadius: SIZES.radius.button,
      paddingVertical: SIZES.padding.md,
      paddingHorizontal: SIZES.padding.xl,
      alignItems: "center",
      justifyContent: "center",
      ...SHADOWS.md,
    },
    // Gold button
    gold: {
      backgroundColor: COLORS.goldPrimary,
      borderRadius: SIZES.radius.button,
      paddingVertical: SIZES.padding.md,
      paddingHorizontal: SIZES.padding.xl,
      alignItems: "center",
      justifyContent: "center",
      ...SHADOWS.gold,
    },
    // Outline blue button
    outline: {
      backgroundColor: COLORS.transparent,
      borderRadius: SIZES.radius.button,
      paddingVertical: SIZES.padding.md,
      paddingHorizontal: SIZES.padding.xl,
      borderWidth: 1.5,
      borderColor: COLORS.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    // Outline gold button
    outlineGold: {
      backgroundColor: COLORS.transparent,
      borderRadius: SIZES.radius.button,
      paddingVertical: SIZES.padding.md,
      paddingHorizontal: SIZES.padding.xl,
      borderWidth: 1.5,
      borderColor: COLORS.goldPrimary,
      alignItems: "center",
      justifyContent: "center",
    },
    // Secondary white button
    secondary: {
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius.button,
      paddingVertical: SIZES.padding.md,
      paddingHorizontal: SIZES.padding.xl,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: "center",
      justifyContent: "center",
    },
    // Light blue button
    light: {
      backgroundColor: COLORS.primaryPale,
      borderRadius: SIZES.radius.button,
      paddingVertical: SIZES.padding.md,
      paddingHorizontal: SIZES.padding.xl,
      alignItems: "center",
      justifyContent: "center",
    },
  },

  // ===== INPUT STYLES =====
  input: {
    default: {
      borderWidth: 1,
      borderColor: COLORS.inputBorder,
      borderRadius: SIZES.radius.input,
      paddingHorizontal: SIZES.padding.md,
      paddingVertical: SIZES.padding.sm,
      fontSize: SIZES.font.md,
      fontFamily: FONTS.family.regular,
      color: COLORS.textPrimary,
      backgroundColor: COLORS.inputBackground,
      height: SIZES.input.height,
    },
    focused: {
      borderColor: COLORS.primary,
      backgroundColor: COLORS.white,
      ...SHADOWS.sm,
    },
    focusedGold: {
      borderColor: COLORS.goldPrimary,
      backgroundColor: COLORS.white,
      ...SHADOWS.sm,
    },
    error: {
      borderColor: COLORS.error,
    },
  },

  // ===== CARD STYLES =====
  card: {
    default: {
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius.card,
      padding: SIZES.card.padding,
      ...SHADOWS.sm,
    },
    elevated: {
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius.card,
      padding: SIZES.card.padding,
      ...SHADOWS.md,
    },
    premium: {
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius.card,
      padding: SIZES.card.paddingLg,
      borderWidth: 1,
      borderColor: COLORS.goldPrimary,
      ...SHADOWS.gold,
    },
    blue: {
      backgroundColor: COLORS.primary,
      borderRadius: SIZES.radius.card,
      padding: SIZES.card.padding,
      ...SHADOWS.blue,
    },
    blueLight: {
      backgroundColor: COLORS.primaryPale,
      borderRadius: SIZES.radius.card,
      padding: SIZES.card.padding,
      ...SHADOWS.sm,
    },
    blueBorder: {
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius.card,
      padding: SIZES.card.padding,
      borderWidth: 1,
      borderColor: COLORS.primary,
      ...SHADOWS.sm,
    },
  },

  // ===== ROW & FLEX STYLES =====
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  rowStart: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  rowEnd: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  column: {
    flexDirection: "column",
  },
  columnCenter: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  columnBetween: {
    flexDirection: "column",
    justifyContent: "space-between",
  },

  // ===== DIVIDER =====
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerThick: {
    height: 2,
    backgroundColor: COLORS.divider,
  },
  dividerBlue: {
    height: 1,
    backgroundColor: COLORS.primary,
  },
  dividerGold: {
    height: 1,
    backgroundColor: COLORS.goldPrimary,
  },
  dividerVertical: {
    width: 1,
    backgroundColor: COLORS.divider,
  },

  // ===== BADGE STYLES =====
  badge: {
    primary: {
      backgroundColor: COLORS.primary,
      borderRadius: SIZES.radius.full,
      paddingHorizontal: SIZES.padding.sm,
      paddingVertical: SIZES.padding.xs,
      alignItems: "center",
      justifyContent: "center",
    },
    gold: {
      backgroundColor: COLORS.goldPrimary,
      borderRadius: SIZES.radius.full,
      paddingHorizontal: SIZES.padding.sm,
      paddingVertical: SIZES.padding.xs,
      alignItems: "center",
      justifyContent: "center",
    },
    success: {
      backgroundColor: COLORS.success,
      borderRadius: SIZES.radius.full,
      paddingHorizontal: SIZES.padding.sm,
      paddingVertical: SIZES.padding.xs,
      alignItems: "center",
      justifyContent: "center",
    },
    error: {
      backgroundColor: COLORS.error,
      borderRadius: SIZES.radius.full,
      paddingHorizontal: SIZES.padding.sm,
      paddingVertical: SIZES.padding.xs,
      alignItems: "center",
      justifyContent: "center",
    },
    warning: {
      backgroundColor: COLORS.warning,
      borderRadius: SIZES.radius.full,
      paddingHorizontal: SIZES.padding.sm,
      paddingVertical: SIZES.padding.xs,
      alignItems: "center",
      justifyContent: "center",
    },
    outline: {
      backgroundColor: COLORS.transparent,
      borderRadius: SIZES.radius.full,
      paddingHorizontal: SIZES.padding.sm,
      paddingVertical: SIZES.padding.xs,
      borderWidth: 1,
      borderColor: COLORS.primary,
      alignItems: "center",
      justifyContent: "center",
    },
  },

  // ===== CHIP STYLES =====
  chip: {
    default: {
      backgroundColor: COLORS.gray100,
      borderRadius: SIZES.radius.full,
      paddingHorizontal: SIZES.padding.md,
      paddingVertical: SIZES.padding.xs,
      flexDirection: "row",
      alignItems: "center",
    },
    blue: {
      backgroundColor: COLORS.blueOpacity10,
      borderRadius: SIZES.radius.full,
      paddingHorizontal: SIZES.padding.md,
      paddingVertical: SIZES.padding.xs,
      flexDirection: "row",
      alignItems: "center",
    },
    gold: {
      backgroundColor: COLORS.goldOpacity10,
      borderRadius: SIZES.radius.full,
      paddingHorizontal: SIZES.padding.md,
      paddingVertical: SIZES.padding.xs,
      flexDirection: "row",
      alignItems: "center",
    },
  },

  // ===== AVATAR STYLES =====
  avatar: {
    small: {
      width: SIZES.icon.lg,
      height: SIZES.icon.lg,
      borderRadius: SIZES.radius.full,
      backgroundColor: COLORS.gray200,
      alignItems: "center",
      justifyContent: "center",
    },
    medium: {
      width: SIZES.icon.xxl,
      height: SIZES.icon.xxl,
      borderRadius: SIZES.radius.full,
      backgroundColor: COLORS.gray200,
      alignItems: "center",
      justifyContent: "center",
    },
    large: {
      width: SIZES.icon.xxxl,
      height: SIZES.icon.xxxl,
      borderRadius: SIZES.radius.full,
      backgroundColor: COLORS.gray200,
      alignItems: "center",
      justifyContent: "center",
    },
    xlarge: {
      width: SIZES.icon.xxxxl,
      height: SIZES.icon.xxxxl,
      borderRadius: SIZES.radius.full,
      backgroundColor: COLORS.gray200,
      alignItems: "center",
      justifyContent: "center",
    },
  },

  // ===== ICON CONTAINER STYLES =====
  iconContainer: {
    small: {
      width: SIZES.icon.lg,
      height: SIZES.icon.lg,
      borderRadius: SIZES.radius.sm,
      backgroundColor: COLORS.primaryPale,
      alignItems: "center",
      justifyContent: "center",
    },
    medium: {
      width: SIZES.icon.xl,
      height: SIZES.icon.xl,
      borderRadius: SIZES.radius.md,
      backgroundColor: COLORS.primaryPale,
      alignItems: "center",
      justifyContent: "center",
    },
    large: {
      width: SIZES.icon.xxl,
      height: SIZES.icon.xxl,
      borderRadius: SIZES.radius.lg,
      backgroundColor: COLORS.primaryPale,
      alignItems: "center",
      justifyContent: "center",
    },
    blue: {
      width: SIZES.icon.xl,
      height: SIZES.icon.xl,
      borderRadius: SIZES.radius.md,
      backgroundColor: COLORS.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    gold: {
      width: SIZES.icon.xl,
      height: SIZES.icon.xl,
      borderRadius: SIZES.radius.md,
      backgroundColor: COLORS.goldPrimary,
      alignItems: "center",
      justifyContent: "center",
    },
  },

  // ===== LIST ITEM STYLES =====
  listItem: {
    default: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: SIZES.padding.md,
      paddingHorizontal: SIZES.padding.lg,
      backgroundColor: COLORS.white,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.divider,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      padding: SIZES.padding.md,
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius.md,
      marginBottom: SIZES.margin.sm,
      ...SHADOWS.sm,
    },
  },

  // ===== SEPARATOR STYLES =====
  separator: {
    horizontal: {
      height: 1,
      backgroundColor: COLORS.divider,
      marginVertical: SIZES.margin.md,
    },
    vertical: {
      width: 1,
      backgroundColor: COLORS.divider,
      marginHorizontal: SIZES.margin.md,
    },
  },

  // ===== OVERLAY STYLES =====
  overlay: {
    default: {
      ...Platform.select({
        ios: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
        android: {
          flex: 1,
        },
      }),
      backgroundColor: COLORS.overlay,
    },
    dark: {
      ...Platform.select({
        ios: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
        android: {
          flex: 1,
        },
      }),
      backgroundColor: COLORS.overlayDark,
    },
    blue: {
      ...Platform.select({
        ios: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
        android: {
          flex: 1,
        },
      }),
      backgroundColor: COLORS.overlayBlue,
    },
  },

  // ===== HEADER STYLES =====
  header: {
    default: {
      height: SIZES.header.height,
      backgroundColor: COLORS.white,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SIZES.padding.lg,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      ...SHADOWS.sm,
    },
    transparent: {
      height: SIZES.header.height,
      backgroundColor: COLORS.transparent,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SIZES.padding.lg,
    },
    blue: {
      height: SIZES.header.height,
      backgroundColor: COLORS.primary,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SIZES.padding.lg,
      ...SHADOWS.md,
    },
  },

  // ===== TAB BAR STYLES =====
  tabBar: {
    default: {
      height: SIZES.tabBar.height,
      backgroundColor: COLORS.white,
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
      ...SHADOWS.md,
    },
    elevated: {
      height: SIZES.tabBar.height,
      backgroundColor: COLORS.white,
      flexDirection: "row",
      ...SHADOWS.lg,
    },
  },

  // ===== MODAL STYLES =====
  modal: {
    container: {
      flex: 1,
      backgroundColor: COLORS.overlay,
      justifyContent: "center",
      alignItems: "center",
      padding: SIZES.padding.lg,
    },
    content: {
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius.xl,
      padding: SIZES.padding.xl,
      width: "90%",
      maxWidth: 400,
      ...SHADOWS.xl,
    },
    fullScreen: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
  },

  // ===== BOTTOM SHEET STYLES =====
  bottomSheet: {
    container: {
      backgroundColor: COLORS.white,
      borderTopLeftRadius: SIZES.radius.xl,
      borderTopRightRadius: SIZES.radius.xl,
      paddingTop: SIZES.padding.sm,
      paddingHorizontal: SIZES.padding.lg,
      paddingBottom: SIZES.padding.xl,
      ...SHADOWS.xl,
    },
    handle: {
      width: moderateScale(40),
      height: moderateScale(4),
      backgroundColor: COLORS.gray300,
      borderRadius: SIZES.radius.full,
      alignSelf: "center",
      marginBottom: SIZES.margin.md,
    },
  },

  // ===== TOAST/SNACKBAR STYLES =====
  toast: {
    default: {
      backgroundColor: COLORS.black,
      borderRadius: SIZES.radius.md,
      padding: SIZES.padding.md,
      flexDirection: "row",
      alignItems: "center",
      ...SHADOWS.lg,
    },
    success: {
      backgroundColor: COLORS.success,
      borderRadius: SIZES.radius.md,
      padding: SIZES.padding.md,
      flexDirection: "row",
      alignItems: "center",
      ...SHADOWS.lg,
    },
    error: {
      backgroundColor: COLORS.error,
      borderRadius: SIZES.radius.md,
      padding: SIZES.padding.md,
      flexDirection: "row",
      alignItems: "center",
      ...SHADOWS.lg,
    },
    warning: {
      backgroundColor: COLORS.warning,
      borderRadius: SIZES.radius.md,
      padding: SIZES.padding.md,
      flexDirection: "row",
      alignItems: "center",
      ...SHADOWS.lg,
    },
    info: {
      backgroundColor: COLORS.info,
      borderRadius: SIZES.radius.md,
      padding: SIZES.padding.md,
      flexDirection: "row",
      alignItems: "center",
      ...SHADOWS.lg,
    },
  },

  // ===== SKELETON LOADER STYLES =====
  skeleton: {
    default: {
      backgroundColor: COLORS.gray200,
      borderRadius: SIZES.radius.sm,
    },
    circle: {
      backgroundColor: COLORS.gray200,
      borderRadius: SIZES.radius.full,
    },
  },

  // ===== FLOATING ACTION BUTTON =====
  fab: {
    default: {
      width: SIZES.button.lg,
      height: SIZES.button.lg,
      borderRadius: SIZES.radius.full,
      backgroundColor: COLORS.primary,
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      bottom: SIZES.padding.xl,
      right: SIZES.padding.xl,
      ...SHADOWS.lg,
    },
    gold: {
      width: SIZES.button.lg,
      height: SIZES.button.lg,
      borderRadius: SIZES.radius.full,
      backgroundColor: COLORS.goldPrimary,
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      bottom: SIZES.padding.xl,
      right: SIZES.padding.xl,
      ...SHADOWS.goldStrong,
    },
    small: {
      width: SIZES.button.md,
      height: SIZES.button.md,
      borderRadius: SIZES.radius.full,
      backgroundColor: COLORS.primary,
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      bottom: SIZES.padding.lg,
      right: SIZES.padding.lg,
      ...SHADOWS.md,
    },
  },

  // ===== PROGRESS BAR =====
  progressBar: {
    container: {
      height: moderateScale(8),
      backgroundColor: COLORS.gray200,
      borderRadius: SIZES.radius.full,
      overflow: "hidden",
    },
    fill: {
      height: "100%",
      backgroundColor: COLORS.primary,
      borderRadius: SIZES.radius.full,
    },
    fillGold: {
      height: "100%",
      backgroundColor: COLORS.goldPrimary,
      borderRadius: SIZES.radius.full,
    },
  },

  // ===== SWITCH STYLES =====
  switch: {
    track: {
      width: moderateScale(50),
      height: moderateScale(28),
      borderRadius: SIZES.radius.full,
      backgroundColor: COLORS.gray300,
    },
    trackActive: {
      backgroundColor: COLORS.primary,
    },
    thumb: {
      width: moderateScale(24),
      height: moderateScale(24),
      borderRadius: SIZES.radius.full,
      backgroundColor: COLORS.white,
      ...SHADOWS.sm,
    },
  },

  // ===== CHECKBOX & RADIO =====
  checkbox: {
    default: {
      width: moderateScale(20),
      height: moderateScale(20),
      borderRadius: SIZES.radius.xs,
      borderWidth: 2,
      borderColor: COLORS.gray400,
      alignItems: "center",
      justifyContent: "center",
    },
    checked: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
  },
  radio: {
    default: {
      width: moderateScale(20),
      height: moderateScale(20),
      borderRadius: SIZES.radius.full,
      borderWidth: 2,
      borderColor: COLORS.gray400,
      alignItems: "center",
      justifyContent: "center",
    },
    checked: {
      borderColor: COLORS.primary,
    },
    innerCircle: {
      width: moderateScale(10),
      height: moderateScale(10),
      borderRadius: SIZES.radius.full,
      backgroundColor: COLORS.primary,
    },
  },
};

// ============================================
// 🎯 EXPORT DEFAULT THEME
// ============================================
const theme = {
  COLORS,
  SIZES,
  FONTS,
  SHADOWS,
  BREAKPOINTS,
  COMMON_STYLES,
  // Utility functions
  scale,
  verticalScale,
  moderateScale,
  fontScale,
};

export default theme;

// Export individual utilities
export { scale, verticalScale, moderateScale, fontScale };