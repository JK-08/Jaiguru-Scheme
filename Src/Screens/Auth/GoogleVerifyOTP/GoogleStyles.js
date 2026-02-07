// GoogleStyles.js
import { StyleSheet, Dimensions } from 'react-native';
import theme from '../../../Utills/AppTheme';

const { width } = Dimensions.get('window');

// Helper function for rgba colors
const hexToRgba = (hex, alpha = 1) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: theme.SIZES.padding.container,
    paddingTop: theme.SIZES.padding.md,
    paddingBottom: theme.SIZES.padding.xl,
  },

  // Error Message
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: hexToRgba(theme.COLORS.error, 0.08),
    padding: theme.SIZES.padding.md,
    borderRadius: theme.SIZES.radius.md,
    marginBottom: theme.SIZES.xl,
    borderLeftWidth: 4,
    borderLeftColor: theme.COLORS.error,
  },
  errorText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.error,
    flex: 1,
    marginHorizontal: theme.SIZES.sm,
  },
  closeButton: {
    padding: theme.SIZES.xs,
  },

  // Form Container
  formContainer: {
    marginTop: theme.SIZES.md,
  },

  // User Info
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.card,
    padding: theme.SIZES.padding.lg,
    borderRadius: theme.SIZES.radius.lg,
    marginBottom: theme.SIZES.xxl,
    ...theme.SHADOWS.small,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.COLORS.border,
    marginRight: theme.SIZES.md,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textSecondary,
    marginBottom: 2,
  },
  userName: {
    ...theme.FONTS.h3,
    color: theme.COLORS.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textTertiary,
  },

  // Input Field
  fieldContainer: {
    marginBottom: theme.SIZES.xxl,
  },
  label: {
    ...theme.FONTS.bodyBold,
    color: theme.COLORS.textPrimary,
    marginBottom: theme.SIZES.sm,
  },
  requiredStar: {
    color: theme.COLORS.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.COLORS.border,
    borderRadius: theme.SIZES.radius.md,
    backgroundColor: theme.COLORS.background,
    overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: theme.SIZES.padding.md,
    paddingVertical: theme.SIZES.padding.md,
    backgroundColor: theme.COLORS.card,
    borderRightWidth: 1,
    borderRightColor: theme.COLORS.border,
  },
  countryCodeText: {
    ...theme.FONTS.bodyMedium,
    color: theme.COLORS.textPrimary,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    paddingHorizontal: theme.SIZES.padding.md,
    paddingVertical: theme.SIZES.padding.md,
    ...theme.FONTS.bodyMedium,
    color: theme.COLORS.textPrimary,
    height: 48,
  },
  inputError: {
    borderColor: theme.COLORS.error,
    backgroundColor: hexToRgba(theme.COLORS.error, 0.03),
  },
  inputErrorExists: {
    borderColor: theme.COLORS.warning,
    backgroundColor: hexToRgba(theme.COLORS.warning, 0.05),
    borderWidth: 1.5,
  },
  errorMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.SIZES.xs,
    paddingHorizontal: theme.SIZES.xs,
  },
  errorExistsContainer: {
    backgroundColor: hexToRgba(theme.COLORS.warning, 0.1),
    padding: theme.SIZES.sm,
    borderRadius: theme.SIZES.radius.sm,
    marginTop: theme.SIZES.sm,
    borderWidth: 1,
    borderColor: hexToRgba(theme.COLORS.warning, 0.3),
  },
  errorTextSmall: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.error,
    marginLeft: theme.SIZES.xs,
    flex: 1,
  },
  errorExistsText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.warning,
    marginLeft: theme.SIZES.xs,
    flex: 1,
    fontWeight: '600',
  },
  hintText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textSecondary,
    marginTop: theme.SIZES.sm,
    lineHeight: 18,
  },
  hashInfoText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.success,
    marginTop: theme.SIZES.xs,
    fontStyle: 'italic',
  },

  // Hash Status
  hashStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: hexToRgba(theme.COLORS.info, 0.1),
    padding: theme.SIZES.sm,
    borderRadius: theme.SIZES.radius.sm,
    marginBottom: theme.SIZES.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: hexToRgba(theme.COLORS.info, 0.2),
  },
  hashStatusText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.info,
    marginLeft: theme.SIZES.xs,
    fontSize: 12,
    fontWeight: '500',
  },

  // Actions Container
  actionsContainer: {
    marginBottom: theme.SIZES.xl,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.COLORS.primary,
    borderRadius: theme.SIZES.radius.md,
    padding: theme.SIZES.padding.md,
    height: 56,
    marginBottom: theme.SIZES.md,
    ...theme.SHADOWS.medium,
  },
  submitButtonDisabled: {
    opacity: 0.6,
    backgroundColor: theme.COLORS.disabled,
  },
  submitButtonText: {
    ...theme.FONTS.buttonLarge,
    color: theme.COLORS.white,
    marginLeft: theme.SIZES.sm,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.SIZES.sm,
    opacity: 1,
  },
  skipButtonDisabled: {
    opacity: 0.5,
  },
  skipButtonText: {
    ...theme.FONTS.bodyMedium,
    color: theme.COLORS.textTertiary,
    marginLeft: theme.SIZES.xs,
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: hexToRgba(theme.COLORS.info, 0.08),
    padding: theme.SIZES.padding.md,
    borderRadius: theme.SIZES.radius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.COLORS.info,
    marginTop: theme.SIZES.xl,
  },
  infoIcon: {
    marginRight: theme.SIZES.sm,
    marginTop: 2,
  },
  infoTitle: {
    ...theme.FONTS.bodyBold,
    color: theme.COLORS.textPrimary,
    marginBottom: theme.SIZES.xs,
  },
  infoText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textSecondary,
    lineHeight: 20,
  },

  // Success/Error State Styles
  successContainer: {
    backgroundColor: hexToRgba(theme.COLORS.success, 0.1),
    borderColor: theme.COLORS.success,
  },
  warningContainer: {
    backgroundColor: hexToRgba(theme.COLORS.warning, 0.1),
    borderColor: theme.COLORS.warning,
  },

  // Retry Button
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hexToRgba(theme.COLORS.warning, 0.1),
    borderRadius: theme.SIZES.radius.sm,
    paddingHorizontal: theme.SIZES.md,
    paddingVertical: theme.SIZES.sm,
    marginTop: theme.SIZES.sm,
    borderWidth: 1,
    borderColor: hexToRgba(theme.COLORS.warning, 0.3),
  },
  retryButtonText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.warning,
    marginLeft: theme.SIZES.xs,
  },

  // Loading State
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.SIZES.md,
  },
  loadingText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textSecondary,
    marginLeft: theme.SIZES.sm,
  },
});