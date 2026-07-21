// Src/Screens/PayNow/PayNow.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useRazorpayPayment } from '../../api/hooks/Razorpay/useRazorpay';
import RazorpayWebView from '../../Components/RazorpayWebView';
import CommonHeader from '../../Components/CommonHeader/CommonHeader';
import PremiumBackground from '../../Components/PremiumBackground/PremiumBackground';
import { AppCard, AppText, AppButton, AppBadge, AppDivider, ScreenWrapper } from '../../Components/ui/appcomponents';
import theme from '../../Utills/AppTheme';

const { COLORS, SIZES } = theme;

const STATUS = { IDLE: 'idle', SUCCESS: 'success', FAILED: 'failed' } as const;
type Status = (typeof STATUS)[keyof typeof STATUS];

export interface PayNowRouteParams {
  accountData?: any;
  regNo?: string | number;
  groupCode?: string;
  memberName?: string;
  schemeName?: string;
  schemeShortName?: string;
  amount?: number | string;
  totalAmount?: number | string;
  installmentsPaid?: number | string;
  totalInstallments?: number | string;
  joinDate?: string;
  maturityDate?: string;
  nextDueDate?: string;
  schemeId?: number | string;
}

const PayNow = () => {
  const route = useRoute<RouteProp<Record<string, PayNowRouteParams>, string>>();
  const navigation = useNavigation<any>();
  const {
    accountData,
    regNo,
    groupCode,
    memberName,
    schemeName,
    schemeShortName,
    amount,
    totalAmount,
    installmentsPaid,
    totalInstallments,
    joinDate,
    maturityDate,
    nextDueDate,
    schemeId,
  } = route.params || {};

  const [status, setStatus] = useState<Status>(STATUS.IDLE);
  const [statusMsg, setStatusMsg] = useState('');
  const [paymentId, setPaymentId] = useState('');

  const {
    loading: paymentLoading,
    startPayment,
    resetState: resetPayment,
    webViewVisible,
    razorpayOptions,
    handlePaymentSuccess,
    handlePaymentDismiss,
  } = useRazorpayPayment();

  const formatCurrency = useCallback((value: unknown) => {
    const n = parseFloat(String(value)) || 0;
    return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }, []);

  const formatDate = useCallback((d?: string) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, []);

  const paymentAmount = useMemo(() => parseFloat(String(amount)) || 0, [amount]);
  const nextInstallment = useMemo(() => (parseInt(String(installmentsPaid), 10) || 0) + 1, [installmentsPaid]);
  const progress = useMemo(() => {
    const paid = parseInt(String(installmentsPaid), 10) || 0;
    const total = parseInt(String(totalInstallments), 10) || 1;
    return (paid / total) * 100;
  }, [installmentsPaid, totalInstallments]);

  const formatApiDate = (date: Date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d} 00:00:00`;
  };

  const handlePayment = useCallback(async () => {
    if (paymentLoading) return;
    setStatus(STATUS.IDLE);
    setStatusMsg('');
    resetPayment();

    // Built up front — the backend parks this against the Razorpay order
    // the moment create-order is called, and only inserts it as a real
    // installment once payment is confirmed (verify-payment or webhook).
    // Note: the Razorpay payment/order id isn't known yet at this point
    // (the order doesn't exist until create-order returns), so chqCardNo /
    // chqRtnReason can't carry that reference the way the old pre-payment
    // flow did.
    const today = formatApiDate();
    const installmentPayload = {
      groupCode: groupCode || '',
      regNo: parseInt(String(regNo), 10) || 0,
      rDate: today,
      amount: paymentAmount,
      modePay: 4,
      accCode: '00001',
      updateTime: today,
      installment: nextInstallment,
      weight:
        accountData?.schemeSummary?.weightLedger === 'Y' ? parseFloat(accountData?.schemeSummary?.totalWeight || 0) : 0,
      sWeight:
        accountData?.schemeSummary?.weightLedger === 'Y' ? parseFloat(accountData?.schemeSummary?.lastWeight || 0) : 0,
      userID: 999,
      schemeId: parseInt(String(schemeId), 10) || 0,
      chqBankCode: 4,
      chqCardNo: '',
      chqBranch: 'Online',
      chkBank: 'Razorpay',
      chqRtnReason: '',
    };

    const result = await startPayment(
      paymentAmount,
      {
        name: memberName || 'Customer',
        phone: accountData?.personalInfo?.mobile || '9999999999',
        email: accountData?.personalInfo?.email || 'customer@example.com',
      },
      regNo?.toString() || '1',
      groupCode || 'MAN',
      { newJoin: false, schemeDetails: installmentPayload }
    );

    if (result.success) {
      setPaymentId(result.paymentId || '');
      setStatus(STATUS.SUCCESS);
      resetPayment();
    } else if (result.message !== 'Payment cancelled by user') {
      setStatusMsg(result.message || 'Payment failed. Please try again.');
      setStatus(STATUS.FAILED);
      resetPayment();
    }
  }, [paymentLoading, paymentAmount, memberName, accountData, regNo, groupCode, startPayment, nextInstallment, schemeId, resetPayment]);

  const isLoading = paymentLoading;

  if (status === STATUS.SUCCESS) {
    return (
      <ScreenWrapper header={<CommonHeader title="Payment" />}>
        <View style={styles.statusContainer}>
          <AppText style={styles.statusIcon}>✅</AppText>
          <AppText variant="h2" align="center" style={styles.statusSpacing}>
            Payment Successful!
          </AppText>
          <AppText variant="body" color={COLORS.textSecondary} align="center" style={styles.statusSpacing}>
            {formatCurrency(paymentAmount)} paid successfully
          </AppText>
          <AppText variant="bodyBold" color={COLORS.accentDark} style={styles.statusDetail}>
            Installment {nextInstallment}/{totalInstallments}
          </AppText>
          {paymentId ? (
            <AppText variant="caption" style={styles.paymentIdText}>
              ID: {paymentId}
            </AppText>
          ) : null}
          <AppButton
            label="View Scheme"
            size="lg"
            style={styles.actionBtn}
            onPress={() => navigation.navigate('AllSchemes', { schemeData: accountData, fromScreen: 'PayNow' })}
          />
          <AppButton label="Go Back" variant="outline" size="lg" onPress={() => navigation.goBack()} />
        </View>
      </ScreenWrapper>
    );
  }

  if (status === STATUS.FAILED) {
    return (
      <ScreenWrapper header={<CommonHeader title="Payment" />}>
        <View style={styles.statusContainer}>
          <AppText style={styles.statusIcon}>❌</AppText>
          <AppText variant="h2" align="center" style={styles.statusSpacing}>
            Payment Failed
          </AppText>
          <AppText variant="body" color={COLORS.textSecondary} align="center" style={styles.statusSpacing}>
            {statusMsg || 'Something went wrong. Please try again.'}
          </AppText>
          <AppButton label="Try Again" size="lg" style={styles.actionBtn} onPress={() => setStatus(STATUS.IDLE)} />
          <AppButton label="Go Back" variant="outline" size="lg" onPress={() => navigation.goBack()} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <View style={styles.container}>
      <PremiumBackground />
      <CommonHeader title="Pay Now" transparent borderBottom={false} shadow={false} />

      <ScreenWrapper scroll backgroundColor="transparent" contentStyle={styles.scrollContent}>
        {/* Scheme Card */}
        <AppCard style={styles.card}>
          <View style={styles.badgeRow}>
            <AppBadge label={schemeShortName || 'SCHEME'} variant="primary" />
            <AppBadge label={`REG: ${regNo}`} variant="neutral" />
          </View>
          <AppText variant="h3" style={styles.memberName}>
            {memberName}
          </AppText>
          <AppText variant="body" color={COLORS.textSecondary} numberOfLines={2} style={styles.schemeName}>
            {schemeName}
          </AppText>

          <AppDivider />

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <AppText variant="bodySmall" color={COLORS.textSecondary} style={styles.progressText}>
            {installmentsPaid}/{totalInstallments} Installments Paid
          </AppText>

          <View style={styles.nextBadge}>
            <AppText variant="bodyMedium" color={COLORS.accentDark}>
              Next Installment: #{nextInstallment}
            </AppText>
          </View>

          <View style={styles.dateRow}>
            <View>
              <AppText variant="caption">Join Date</AppText>
              <AppText variant="bodyBold">{formatDate(joinDate)}</AppText>
            </View>
            <View>
              <AppText variant="caption">Maturity Date</AppText>
              <AppText variant="bodyBold">{formatDate(maturityDate)}</AppText>
            </View>
          </View>

          {nextDueDate && (
            <View style={styles.dueBadge}>
              <AppText variant="bodyMedium" color={COLORS.accentDark}>
                Next Due: {formatDate(nextDueDate)}
              </AppText>
            </View>
          )}
        </AppCard>

        {/* Summary Card */}
        <AppCard style={styles.card}>
          <AppText variant="h5" style={styles.sectionTitle}>
            Payment Summary
          </AppText>
          <View style={styles.row}>
            <AppText color={COLORS.textSecondary}>Installment Amount</AppText>
            <AppText variant="bodyBold">{formatCurrency(amount)}</AppText>
          </View>
          <View style={styles.row}>
            <AppText color={COLORS.textSecondary}>Total Paid Till Date</AppText>
            <AppText variant="bodyBold">{formatCurrency(totalAmount)}</AppText>
          </View>
          <AppDivider />
          <View style={styles.row}>
            <AppText variant="h6">Due Amount</AppText>
            <AppText variant="h4" color={COLORS.accentDark}>
              {formatCurrency(paymentAmount)}
            </AppText>
          </View>
        </AppCard>

        {/* Payment Method Card */}
        <AppCard style={styles.card}>
          <AppText variant="h5" style={styles.sectionTitle}>
            Payment Method
          </AppText>
          <View style={styles.methodRow}>
            <AppText style={styles.methodIcon}>💰</AppText>
            <View style={styles.methodInfo}>
              <AppText variant="h6">Razorpay</AppText>
              <AppText variant="bodySmall" color={COLORS.textSecondary}>
                UPI, Card, NetBanking, Wallet
              </AppText>
            </View>
            <AppBadge label="Selected" variant="primary" />
          </View>
          <View style={styles.secureRow}>
            <AppText>🔒 </AppText>
            <AppText variant="bodySmall" color={COLORS.textSecondary} style={styles.secureText}>
              Secure payment powered by Razorpay
            </AppText>
          </View>
        </AppCard>

        <View style={{ height: 100 }} />
      </ScreenWrapper>

      <RazorpayWebView visible={webViewVisible} options={razorpayOptions} onSuccess={handlePaymentSuccess} onDismiss={handlePaymentDismiss} />

      <View style={styles.bottomBar}>
        <AppButton
          label={`${formatCurrency(paymentAmount)}  ·  Pay Now`}
          size="lg"
          loading={isLoading}
          onPress={handlePayment}
        />
        <AppText variant="caption" align="center" style={styles.payNote}>
          You'll be redirected to Razorpay secure checkout
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundSecondary },
  scrollContent: { paddingBottom: 0 },

  badgeRow: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginBottom: SIZES.margin.sm,
  },
  card: {
    marginBottom: SIZES.margin.md,
  },
  memberName: {
    marginBottom: SIZES.xs,
    textTransform: 'uppercase',
  },
  schemeName: {
    marginBottom: SIZES.md,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: SIZES.radius.full,
    overflow: 'hidden',
    marginBottom: SIZES.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accentDark,
    borderRadius: SIZES.radius.full,
  },
  progressText: {
    marginBottom: SIZES.sm,
  },
  nextBadge: {
    backgroundColor: COLORS.accentLight,
    padding: SIZES.padding.sm,
    borderRadius: SIZES.radius.sm,
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
  },
  dueBadge: {
    backgroundColor: COLORS.secondaryLighter,
    padding: SIZES.padding.sm,
    borderRadius: SIZES.radius.sm,
    alignItems: 'center',
  },

  sectionTitle: {
    marginBottom: SIZES.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },

  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    padding: SIZES.padding.lg,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.sm,
  },
  methodIcon: { fontSize: SIZES.icon.lg, marginRight: SIZES.sm },
  methodInfo: { flex: 1 },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    padding: SIZES.padding.md,
    borderRadius: SIZES.radius.sm,
  },
  secureText: { flex: 1 },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SIZES.padding.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : SIZES.padding.lg,
  },
  payNote: {
    marginTop: SIZES.sm,
  },

  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding.xxxl,
  },
  statusIcon: { fontSize: 64, marginBottom: SIZES.md },
  statusSpacing: { marginBottom: SIZES.sm },
  statusDetail: { marginBottom: SIZES.xs },
  paymentIdText: { marginBottom: SIZES.xl },
  actionBtn: { marginBottom: SIZES.sm },
});

export default PayNow;
