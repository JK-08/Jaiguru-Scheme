// Src/Screens/MemberCreation/PaymentModal.tsx
import React from 'react';
import { View, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText, AppCard } from '../../Components/ui/appcomponents';
import theme from '../../Utills/AppTheme';

const { COLORS, SIZES } = theme;

export type PaymentModalStep = 'creating_order' | 'verifying' | 'failed' | string;

export interface PaymentModalProps {
  visible: boolean;
  step?: PaymentModalStep;
  error?: string | null;
}

const CONTENT_BY_STEP: Record<string, { title: string; message: string; icon: string; color: string }> = {
  creating_order: {
    title: 'Creating Order',
    message: 'Please wait while we set up your payment order...',
    icon: 'receipt-outline',
    color: COLORS.primary,
  },
  verifying: {
    title: 'Verifying Payment',
    message: 'Please wait while we confirm your payment...',
    icon: 'shield-checkmark-outline',
    color: COLORS.primary,
  },
  failed: {
    title: 'Payment Failed',
    message: '',
    icon: 'close-circle-outline',
    color: COLORS.error,
  },
};

const DEFAULT_CONTENT = {
  title: 'Processing',
  message: 'Please wait...',
  icon: 'hourglass-outline',
  color: COLORS.primary,
};

const PaymentModal = ({ visible, step, error }: PaymentModalProps) => {
  const content = CONTENT_BY_STEP[step || ''] || DEFAULT_CONTENT;
  const isFailed = step === 'failed';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <AppCard variant="elevated" style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: isFailed ? COLORS.errorLight + '22' : COLORS.primaryPale }]}>
            <Icon name={content.icon} size={40} color={content.color} />
          </View>
          <AppText variant="h5" align="center" style={styles.title}>
            {content.title}
          </AppText>
          <AppText variant="bodySmall" color={COLORS.textSecondary} align="center" style={styles.message}>
            {isFailed ? error || 'Something went wrong. Please try again.' : content.message}
          </AppText>
          {!isFailed && <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />}
        </AppCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 20, 25, 0.55)',
    padding: SIZES.padding.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.md,
  },
  title: {
    marginBottom: SIZES.xs,
  },
  message: {
    marginBottom: SIZES.md,
  },
  spinner: {
    marginTop: SIZES.xs,
  },
});

export default PaymentModal;
