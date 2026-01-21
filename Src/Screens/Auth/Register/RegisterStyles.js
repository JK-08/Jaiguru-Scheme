import { StyleSheet } from 'react-native';
import theme from '../../../Utills/AppTheme';

const styles = StyleSheet.create({
  // Container & Layout
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.backgroundGold,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: theme.SIZES.padding.container,
    justifyContent: 'center',
  },
  
  // Header
  headerContainer: {
    alignItems: 'center',
    marginBottom: theme.SIZES.xxl,
  },
  title: {
    ...theme.FONTS.h1,
    color: theme.COLORS.primary,
  },
  subtitle: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textSecondary,
    textAlign: 'center',
    marginTop: theme.SIZES.sm,
  },
  
  // Messages
  errorContainer: {
    backgroundColor: theme.COLORS.errorLight,
    padding: theme.SIZES.padding.md,
    borderRadius: theme.SIZES.radius.sm,
    marginBottom: theme.SIZES.lg,
  },
  errorText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.error,
  },
  successContainer: {
    backgroundColor: theme.COLORS.successLight + '20',
    padding: theme.SIZES.padding.lg,
    borderRadius: theme.SIZES.radius.md,
    marginBottom: theme.SIZES.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.COLORS.success,
  },
  successTitle: {
    ...theme.FONTS.bodyMedium,
    color: theme.COLORS.success,
    marginBottom: theme.SIZES.sm,
  },
  successMessage: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textPrimary,
    marginBottom: theme.SIZES.md,
  },
  whatsappButton: {
    backgroundColor: theme.COLORS.success,
    paddingVertical: theme.SIZES.padding.sm,
    paddingHorizontal: theme.SIZES.padding.md,
    borderRadius: theme.SIZES.radius.sm,
    alignSelf: 'flex-start',
  },
  whatsappButtonText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.white,
  },
  
  // Form Container
  formContainer: {
    ...theme.COMMON_STYLES.card.premium,
    marginBottom: theme.SIZES.xl,
  },
  
  // Form Fields
  fieldContainer: {
    marginBottom: theme.SIZES.lg,
  },
  label: {
    ...theme.FONTS.label,
    marginBottom: theme.SIZES.xs,
  },
  input: {
    ...theme.COMMON_STYLES.input.default,
    borderColor: theme.COLORS.borderGold,
  },
  inputError: {
    ...theme.COMMON_STYLES.input.error,
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
  
  // Referral Section
  referralSection: {
    marginTop: theme.SIZES.sm,
    marginBottom: theme.SIZES.lg,
  },
  referralToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.SIZES.sm,
  },
  referralToggleText: {
    ...theme.FONTS.body,
    color: theme.COLORS.textSecondary,
  },
  referralInputContainer: {
    marginTop: theme.SIZES.md,
  },
  
  // Terms
  termsText: {
    ...theme.FONTS.caption,
    color: theme.COLORS.textSecondary,
    textAlign: 'center',
  },
  termsLink: {
    color: theme.COLORS.goldPrimary,
  },
  
  // Buttons
  submitButton: {
    ...theme.COMMON_STYLES.button.gold,
    marginBottom: theme.SIZES.lg,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    ...theme.FONTS.button,
  },
  
  // Google Sign In Button
  googleButton: {
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.SIZES.radius.button,
    paddingVertical: theme.SIZES.padding.md,
    paddingHorizontal: theme.SIZES.padding.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: theme.COLORS.border,
    marginBottom: theme.SIZES.lg,
    ...theme.SHADOWS.sm,
  },
  googleButtonText: {
    ...theme.FONTS.body,
    color: theme.COLORS.textPrimary,
    marginLeft: theme.SIZES.sm,
  },
  
  // Login Link
  loginContainer: {
    ...theme.COMMON_STYLES.rowCenter,
    marginTop: theme.SIZES.lg,
  },
  loginText: {
    ...theme.FONTS.body,
    color: theme.COLORS.textSecondary,
  },
  loginLink: {
    ...theme.FONTS.bodyBold,
    color: theme.COLORS.goldPrimary,
  },
  
  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.SIZES.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.COLORS.border,
  },
  dividerText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textSecondary,
    marginHorizontal: theme.SIZES.md,
  },
  
  // Hidden Input
  hiddenInput: {
    display: 'none',
  },
  // Add these to your RegisterStyles.js
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.SIZES.lg,
},
modalContainer: {
  backgroundColor: theme.COLORS.white,
  borderRadius: theme.SIZES.md,
  padding: theme.SIZES.xl,
  width: '100%',
  maxWidth: 400,
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.SIZES.lg,
},
modalTitle: {
  fontSize: theme.SIZES.xl,
  fontFamily: theme.FONTS.bold,
  color: theme.COLORS.textPrimary,
},
modalSubtitle: {
  fontSize: theme.SIZES.md,
  fontFamily: theme.FONTS.regular,
  color: theme.COLORS.textSecondary,
  marginBottom: theme.SIZES.xl,
  textAlign: 'center',
},
otpContainer: {
  alignItems: 'center',
  marginBottom: theme.SIZES.xl,
},
otpInput: {
  borderWidth: 1,
  borderBottomWidth: 2,
  borderRadius: theme.SIZES.sm,
  width: 40,
  height: 50,
  fontSize: theme.SIZES.xl,
  textAlign: 'center',
},
timerContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.SIZES.xl,
},
timerText: {
  fontSize: theme.SIZES.md,
  fontFamily: theme.FONTS.regular,
  color: theme.COLORS.textSecondary,
},
resendText: {
  fontSize: theme.SIZES.md,
  fontFamily: theme.FONTS.semiBold,
  color: theme.COLORS.goldPrimary,
},
verifyButton: {
  backgroundColor: theme.COLORS.goldPrimary,
  borderRadius: theme.SIZES.sm,
  paddingVertical: theme.SIZES.md,
  alignItems: 'center',
},
verifyButtonDisabled: {
  backgroundColor: theme.COLORS.gray300,
},
verifyButtonText: {
  fontSize: theme.SIZES.lg,
  fontFamily: theme.FONTS.semiBold,
  color: theme.COLORS.white,
},
whatsappButton: {
  flexDirection: 'row',
  backgroundColor: '#25D366',
  borderRadius: theme.SIZES.sm,
  paddingVertical: theme.SIZES.md,
  paddingHorizontal: theme.SIZES.lg,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.SIZES.xl,
  gap: theme.SIZES.sm,
},
whatsappButtonText: {
  fontSize: theme.SIZES.md,
  fontFamily: theme.FONTS.semiBold,
  color: theme.COLORS.white,
},
});

export default styles;