// LoginStyles.js
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

// You can customize these colors to match your theme
const COLORS = {
  primary: '#1E40AF',       // Blue
  primaryDark: '#1E3A8A',
  goldPrimary: '#F59E0B',   // Gold/Amber
  goldLight: '#FBBF24',
  background: '#F8FAFC',    // Light gray background
  white: '#FFFFFF',
  black: '#000000',
  textPrimary: '#1F2937',   // Dark gray
  textSecondary: '#4B5563', // Medium gray
  textTertiary: '#9CA3AF',  // Light gray
  error: '#DC2626',
  errorLight: '#FEE2E2',
  success: '#10B981',
  border: '#E5E7EB',
  borderGold: '#FCD34D',
  googleRed: '#DB4437',
  googleRedDark: '#C1351D',
};

const SIZES = {
  // Font sizes
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  
  // Spacing
  padding: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    container: 20,
  },
  
  // Border radius
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    button: 25,
    card: 16,
  },
  
  // Icons
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
  },
};

const FONTS = {
  light: 'System',
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
  
  h1: {
    fontSize: SIZES.xxxl,
    fontFamily: 'bold',
    color: COLORS.textPrimary,
  },
  h2: {
    fontSize: SIZES.xxl,
    fontFamily: 'bold',
    color: COLORS.textPrimary,
  },
  h3: {
    fontSize: SIZES.xl,
    fontFamily: 'semiBold',
    color: COLORS.textPrimary,
  },
  bodyLarge: {
    fontSize: SIZES.lg,
    fontFamily: 'regular',
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  body: {
    fontSize: SIZES.md,
    fontFamily: 'regular',
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: SIZES.sm,
    fontFamily: 'regular',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  caption: {
    fontSize: SIZES.xs,
    fontFamily: 'regular',
    color: COLORS.textTertiary,
    lineHeight: 18,
  },
  label: {
    fontSize: SIZES.sm,
    fontFamily: 'medium',
    color: COLORS.textPrimary,
    marginBottom: SIZES.padding.xs,
  },
  button: {
    fontSize: SIZES.md,
    fontFamily: 'semiBold',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  link: {
    fontSize: SIZES.sm,
    fontFamily: 'medium',
    color: COLORS.primary,
  },
};

const SHADOWS = {
  sm: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

const styles = StyleSheet.create({
  // ============ CONTAINER & LAYOUT ============
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SIZES.padding.container,
    paddingTop: isSmallDevice ? SIZES.padding.lg : SIZES.padding.xl,
    paddingBottom: SIZES.padding.xl,
    justifyContent: 'center',
  },

  // ============ HEADER SECTION ============
  headerContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.padding.lg,
    ...SHADOWS.md,
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.goldPrimary,
  },
  title: {
    ...FONTS.h1,
    fontSize: isSmallDevice ? SIZES.xxl : SIZES.xxxl,
    textAlign: 'center',
    marginBottom: SIZES.padding.sm,
  },
  subtitle: {
    ...FONTS.bodySmall,
    textAlign: 'center',
    color: COLORS.textSecondary,
    maxWidth: '80%',
  },

  // ============ FORM SECTION ============
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.card,
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.padding.xl,
    marginBottom: SIZES.padding.xl,
    ...SHADOWS.sm,
  },
  
  // ============ FORM FIELDS ============
  fieldContainer: {
    marginBottom: SIZES.padding.lg,
  },
  label: {
    ...FONTS.label,
    marginBottom: SIZES.padding.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    ...SHADOWS.sm,
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  inputIcon: {
    paddingHorizontal: SIZES.padding.md,
  },
  input: {
    flex: 1,
    paddingVertical: SIZES.padding.md,
    paddingHorizontal: SIZES.padding.sm,
    ...FONTS.body,
    color: COLORS.textPrimary,
    minHeight: 50,
  },
  inputError: {
    color: COLORS.error,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    marginTop: SIZES.padding.xs,
    marginLeft: SIZES.padding.xs,
  },
  
  // ============ FORGOT PASSWORD ============
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: SIZES.padding.sm,
  },
  forgotPasswordText: {
    ...FONTS.link,
    fontSize: SIZES.sm,
    color: COLORS.primary,
  },
  
  // ============ LOGIN BUTTON ============
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.button,
    paddingVertical: SIZES.padding.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.padding.md,
    ...SHADOWS.sm,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.textTertiary,
    opacity: 0.7,
  },
  loginButtonText: {
    ...FONTS.button,
    color: COLORS.white,
    fontSize: SIZES.lg,
    fontFamily: FONTS.semiBold,
  },
  
  // ============ DIVIDER ============
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.padding.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    ...FONTS.bodySmall,
    color: COLORS.textTertiary,
    marginHorizontal: SIZES.padding.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  // ============ GOOGLE BUTTON ============
  googleButton: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.button,
    paddingVertical: SIZES.padding.md,
    paddingHorizontal: SIZES.padding.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  googleButtonDisabled: {
    backgroundColor: COLORS.white,
    opacity: 0.7,
  },
  googleIconContainer: {
    marginRight: SIZES.padding.sm,
  },
  googleButtonText: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    fontFamily: FONTS.medium,
    fontSize: SIZES.md,
  },
  
  // ============ REGISTER LINK ============
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.padding.xxl,
    paddingVertical: SIZES.padding.md,
  },
  registerText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  registerLink: {
    ...FONTS.link,
    fontSize: SIZES.md,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
    marginLeft: SIZES.padding.xs,
  },
  
  // ============ ERROR MESSAGE ============
  errorContainer: {
    backgroundColor: COLORS.errorLight,
    padding: SIZES.padding.md,
    borderRadius: SIZES.radius.sm,
    marginBottom: SIZES.padding.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorIcon: {
    marginRight: SIZES.padding.sm,
  },
  errorMessage: {
    flex: 1,
    ...FONTS.bodySmall,
    color: COLORS.error,
  },
  errorClose: {
    padding: SIZES.padding.xs,
  },
  
  // ============ LOADING STATES ============
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SIZES.padding.md,
  },
  
  // ============ FINGERPRINT/BIOMETRIC ============
  biometricContainer: {
    alignItems: 'center',
    marginTop: SIZES.padding.xl,
  },
  biometricButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  biometricText: {
    ...FONTS.caption,
    color: COLORS.textTertiary,
    marginTop: SIZES.padding.sm,
  },
  
  // ============ SOCIAL LOGIN ============
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.padding.xl,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SIZES.padding.sm,
    ...SHADOWS.sm,
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  appleButton: {
    backgroundColor: COLORS.black,
  },
  
  // ============ REMEMBER ME ============
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.padding.sm,
  },
  rememberCheckbox: {
    width: 20,
    height: 20,
    borderRadius: SIZES.radius.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SIZES.padding.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rememberCheckboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
  },
  
  // ============ VERSION INFO ============
  versionContainer: {
    position: 'absolute',
    bottom: SIZES.padding.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  versionText: {
    ...FONTS.caption,
    color: COLORS.textTertiary,
  },
});

// Common styles for reusable components
const COMMON_STYLES = {
  // Card styles
  card: {
    default: {
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius.card,
      padding: SIZES.padding.lg,
      ...SHADOWS.sm,
    },
    elevated: {
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius.card,
      padding: SIZES.padding.lg,
      ...SHADOWS.md,
    },
  },
  
  // Button styles
  button: {
    primary: {
      backgroundColor: COLORS.primary,
      borderRadius: SIZES.radius.button,
      paddingVertical: SIZES.padding.md,
      paddingHorizontal: SIZES.padding.xl,
      alignItems: 'center',
      justifyContent: 'center',
      ...SHADOWS.sm,
    },
    secondary: {
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius.button,
      paddingVertical: SIZES.padding.md,
      paddingHorizontal: SIZES.padding.xl,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: COLORS.border,
      ...SHADOWS.sm,
    },
    gold: {
      backgroundColor: COLORS.goldPrimary,
      borderRadius: SIZES.radius.button,
      paddingVertical: SIZES.padding.md,
      paddingHorizontal: SIZES.padding.xl,
      alignItems: 'center',
      justifyContent: 'center',
      ...SHADOWS.sm,
    },
  },
  
  // Input styles
  input: {
    default: {
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: SIZES.radius.md,
      paddingVertical: SIZES.padding.md,
      paddingHorizontal: SIZES.padding.lg,
      ...FONTS.body,
      color: COLORS.textPrimary,
    },
    focused: {
      borderColor: COLORS.primary,
      borderWidth: 1.5,
      ...SHADOWS.sm,
    },
    error: {
      borderColor: COLORS.error,
      borderWidth: 1.5,
    },
  },
  
  // Row center
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Row space between
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Absolute center
  absoluteCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
};

// Export all style objects
export default {
  ...styles,
  COLORS,
  SIZES,
  FONTS,
  SHADOWS,
  COMMON_STYLES,
  isSmallDevice,
  width,
  height,
};