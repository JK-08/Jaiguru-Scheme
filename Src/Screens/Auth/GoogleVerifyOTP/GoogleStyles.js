// GoogleStyles.js
import { StyleSheet, Dimensions } from 'react-native';
import theme from '../../../Utills/AppTheme';

const { width } = Dimensions.get('window');

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
    backgroundColor: `${theme.COLORS.error}15`,
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
  },
  errorMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.SIZES.xs,
  },
  errorTextSmall: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.error,
    marginLeft: theme.SIZES.xs,
  },
  hintText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textSecondary,
    marginTop: theme.SIZES.sm,
  },
  hashInfoText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.success,
    marginTop: theme.SIZES.xs,
    fontStyle: 'italic',
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
  },
  skipText: {
    ...theme.FONTS.bodyMedium,
    color: theme.COLORS.textTertiary,
    marginLeft: theme.SIZES.xs,
  },

  // Info Note
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${theme.COLORS.info}10`,
    padding: theme.SIZES.padding.md,
    borderRadius: theme.SIZES.radius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.COLORS.info,
  },
  infoText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textSecondary,
    flex: 1,
    marginLeft: theme.SIZES.sm,
    lineHeight: 20,
  },
});