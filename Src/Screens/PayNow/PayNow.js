import React, { useState, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, StatusBar,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useRazorpayPayment } from "../../Hooks/useRazorPay";
import { useMemberActions } from "../../Hooks/useMemberCreate";
import RazorpayWebView from "../../Components/RazorpayWebView";
import CommonHeader from "../../Components/CommonHeader/CommonHeader";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../Utills/AppTheme";

const STATUS = { IDLE: 'idle', SUCCESS: 'success', FAILED: 'failed' };

const PayNow = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {
    accountData, regNo, groupCode, memberName, schemeName, schemeShortName,
    amount, totalAmount, installmentsPaid, totalInstallments,
    joinDate, maturityDate, nextDueDate, schemeId,
  } = route.params || {};

  const [status, setStatus] = useState(STATUS.IDLE);
  const [statusMsg, setStatusMsg] = useState('');
  const [paymentId, setPaymentId] = useState('');

  const {
    loading: paymentLoading, startPayment, resetState: resetPayment,
    PAYMENT_STEPS, webViewVisible, razorpayOptions,
    handlePaymentSuccess, handlePaymentDismiss,
  } = useRazorpayPayment();

  const { handleInsertInstallment, loading: insertLoading } = useMemberActions();

  const formatCurrency = useCallback((value) => {
    const n = parseFloat(value) || 0;
    return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }, []);

  const formatDate = useCallback((d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }, []);

  const paymentAmount = useMemo(() => parseFloat(amount) || 0, [amount]);
  const nextInstallment = useMemo(() => (parseInt(installmentsPaid) || 0) + 1, [installmentsPaid]);
  const progress = useMemo(() => {
    const paid = parseInt(installmentsPaid) || 0;
    const total = parseInt(totalInstallments) || 1;
    return (paid / total) * 100;
  }, [installmentsPaid, totalInstallments]);

  const formatApiDate = (date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d} 00:00:00`;
  };

  const handlePayment = useCallback(async () => {
    setStatus(STATUS.IDLE);
    setStatusMsg('');

    const result = await startPayment(
      paymentAmount,
      {
        name: memberName || "Customer",
        phone: accountData?.personalInfo?.mobile || "9999999999",
        email: accountData?.personalInfo?.email || "customer@example.com",
      },
      regNo?.toString() || "1",
      groupCode || "MAN"
    );

    if (result.success) {
      try {
        const today = formatApiDate();
        await handleInsertInstallment({
          groupCode: groupCode || "",
          regNo: parseInt(regNo) || 0,
          rDate: today,
          amount: paymentAmount,
          modePay: 4,
          accCode: "00001",
          updateTime: today,
          installment: nextInstallment,
          weight: accountData?.schemeSummary?.weightLedger === "Y"
            ? parseFloat(accountData?.schemeSummary?.totalWeight || 0) : 0,
          sWeight: accountData?.schemeSummary?.weightLedger === "Y"
            ? parseFloat(accountData?.schemeSummary?.lastWeight || 0) : 0,
          userID: 999,
          schemeId: parseInt(schemeId) || 0,
          chqBankCode: 4,
          chqCardNo: result.paymentId || "",
          chqBranch: "Online",
          chkBank: "Razorpay",
          chqRtnReason: result.orderId || "",
        });
        setPaymentId(result.paymentId);
        setStatus(STATUS.SUCCESS);
        resetPayment();
      } catch (e) {
        setStatusMsg(`Payment successful but record update failed.\nPayment ID: ${result.paymentId}\nPlease contact support.`);
        setStatus(STATUS.FAILED);
        resetPayment();
      }
    } else if (result.message !== 'Payment cancelled by user') {
      setStatusMsg(result.message || 'Payment failed. Please try again.');
      setStatus(STATUS.FAILED);
      resetPayment();
    }
  }, [paymentAmount, memberName, accountData, regNo, groupCode, startPayment,
      handleInsertInstallment, nextInstallment, schemeId, resetPayment]);

  const isLoading = paymentLoading || insertLoading;

  if (status === STATUS.SUCCESS) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <CommonHeader title="Payment" />
        <View style={styles.statusContainer}>
          <Text style={styles.statusIcon}>✅</Text>
          <Text style={styles.statusTitle}>Payment Successful!</Text>
          <Text style={styles.statusSub}>{formatCurrency(paymentAmount)} paid successfully</Text>
          <Text style={styles.statusDetail}>Installment {nextInstallment}/{totalInstallments}</Text>
          {paymentId ? <Text style={styles.paymentIdText}>ID: {paymentId}</Text> : null}
          <TouchableOpacity style={styles.primaryBtn} onPress={() =>
            navigation.navigate("SchemePassbook", { schemeData: accountData, fromScreen: "PayNow" })
          }>
            <Text style={styles.primaryBtnText}>View Scheme</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (status === STATUS.FAILED) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <CommonHeader title="Payment" />
        <View style={styles.statusContainer}>
          <Text style={styles.statusIcon}>❌</Text>
          <Text style={styles.statusTitle}>Payment Failed</Text>
          <Text style={styles.statusSub}>{statusMsg || 'Something went wrong. Please try again.'}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStatus(STATUS.IDLE)}>
            <Text style={styles.primaryBtnText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <CommonHeader title="Pay Now" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Scheme Card */}
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.schemeBadge}><Text style={styles.schemeBadgeText}>{schemeShortName || "SCHEME"}</Text></View>
            <View style={styles.regBadge}><Text style={styles.regBadgeText}>REG: {regNo}</Text></View>
          </View>
          <Text style={styles.memberName}>{memberName}</Text>
          <Text style={styles.schemeName} numberOfLines={2}>{schemeName}</Text>

          <View style={styles.divider} />

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{installmentsPaid}/{totalInstallments} Installments Paid</Text>

          <View style={styles.nextBadge}>
            <Text style={styles.nextBadgeText}>Next Installment: #{nextInstallment}</Text>
          </View>

          <View style={styles.dateRow}>
            <View>
              <Text style={styles.dateLabel}>Join Date</Text>
              <Text style={styles.dateValue}>{formatDate(joinDate)}</Text>
            </View>
            <View>
              <Text style={styles.dateLabel}>Maturity Date</Text>
              <Text style={styles.dateValue}>{formatDate(maturityDate)}</Text>
            </View>
          </View>

          {nextDueDate && (
            <View style={styles.dueBadge}>
              <Text style={styles.dueText}>Next Due: {formatDate(nextDueDate)}</Text>
            </View>
          )}
        </View>

        {/* Summary Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Installment Amount</Text>
            <Text style={styles.rowValue}>{formatCurrency(amount)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total Paid Till Date</Text>
            <Text style={styles.rowValue}>{formatCurrency(totalAmount)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Due Amount</Text>
            <Text style={styles.totalValue}>{formatCurrency(paymentAmount)}</Text>
          </View>
        </View>

        {/* Payment Method Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.methodRow}>
            <Text style={styles.methodIcon}>💰</Text>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Razorpay</Text>
              <Text style={styles.methodDesc}>UPI, Card, NetBanking, Wallet</Text>
            </View>
            <View style={styles.selectedBadge}><Text style={styles.selectedText}>Selected</Text></View>
          </View>
          <View style={styles.secureRow}>
            <Text>🔒 </Text>
            <Text style={styles.secureText}>Secure payment powered by Razorpay</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <RazorpayWebView
        visible={webViewVisible}
        options={razorpayOptions}
        onSuccess={handlePaymentSuccess}
        onDismiss={handlePaymentDismiss}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.payBtn, isLoading && styles.payBtnDisabled]}
          onPress={handlePayment}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading
            ? <ActivityIndicator color={COLORS.white} size="small" />
            : <View style={styles.payBtnContent}>
                <Text style={styles.payBtnAmount}>{formatCurrency(paymentAmount)}</Text>
                <Text style={styles.payBtnText}>Pay Now</Text>
              </View>
          }
        </TouchableOpacity>
        <Text style={styles.payNote}>You'll be redirected to Razorpay secure checkout</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundSecondary },
  scrollView: { flex: 1 },
  scrollContent: { padding: SIZES.padding.lg },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.card,
    padding: SIZES.card.paddingLg,
    marginBottom: SIZES.margin.md,
    ...SHADOWS.sm,
  },

  // Scheme card
  badgeRow: { flexDirection: "row", gap: SIZES.sm, marginBottom: SIZES.margin.sm },
  schemeBadge: { backgroundColor: COLORS.primary, paddingHorizontal: SIZES.padding.sm, paddingVertical: SIZES.padding.xs, borderRadius: SIZES.radius.full },
  schemeBadgeText: { color: COLORS.white, fontSize: SIZES.font.sm, fontFamily: FONTS.family.semiBold },
  regBadge: { backgroundColor: COLORS.gray100, paddingHorizontal: SIZES.padding.sm, paddingVertical: SIZES.padding.xs, borderRadius: SIZES.radius.full },
  regBadgeText: { color: COLORS.gray500, fontSize: SIZES.font.sm, fontFamily: FONTS.family.medium },
  memberName: { fontSize: SIZES.font.xxl, fontFamily: FONTS.family.bold, color: COLORS.gray800, marginBottom: SIZES.xs },
  schemeName: { fontSize: SIZES.font.md, color: COLORS.gray500, marginBottom: SIZES.md, lineHeight: SIZES.font.md * 1.5 },
  divider: { height: 1, backgroundColor: COLORS.divider, marginVertical: SIZES.md },
  progressBarContainer: { height: 8, backgroundColor: COLORS.gray200, borderRadius: SIZES.radius.full, overflow: "hidden", marginBottom: SIZES.sm },
  progressFill: { height: "100%", backgroundColor: COLORS.primary, borderRadius: SIZES.radius.full },
  progressText: { fontSize: SIZES.font.sm, color: COLORS.gray500, marginBottom: SIZES.sm },
  nextBadge: { backgroundColor: COLORS.primaryPale, padding: SIZES.padding.sm, borderRadius: SIZES.radius.sm, alignItems: "center", marginBottom: SIZES.sm },
  nextBadgeText: { color: COLORS.primaryDark, fontSize: SIZES.font.md, fontFamily: FONTS.family.semiBold },
  dateRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: SIZES.sm },
  dateLabel: { fontSize: SIZES.font.sm, color: COLORS.gray400, marginBottom: SIZES.xs },
  dateValue: { fontSize: SIZES.font.md, fontFamily: FONTS.family.semiBold, color: COLORS.gray800 },
  dueBadge: { backgroundColor: COLORS.secondaryLighter, padding: SIZES.padding.sm, borderRadius: SIZES.radius.sm, alignItems: "center" },
  dueText: { color: COLORS.accentDark, fontSize: SIZES.font.sm, fontFamily: FONTS.family.semiBold },

  // Summary card
  sectionTitle: { fontSize: SIZES.font.lg, fontFamily: FONTS.family.semiBold, color: COLORS.gray800, marginBottom: SIZES.md },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: SIZES.sm },
  rowLabel: { fontSize: SIZES.font.md, color: COLORS.gray500, fontFamily: FONTS.family.regular },
  rowValue: { fontSize: SIZES.font.md, fontFamily: FONTS.family.semiBold, color: COLORS.gray800 },
  totalLabel: { fontSize: SIZES.font.lg, fontFamily: FONTS.family.semiBold, color: COLORS.gray800 },
  totalValue: { fontSize: SIZES.font.xxl, fontFamily: FONTS.family.bold, color: COLORS.primary },

  // Payment method card
  methodRow: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.gray100, padding: SIZES.padding.lg, borderRadius: SIZES.radius.md, marginBottom: SIZES.sm },
  methodIcon: { fontSize: SIZES.icon.lg, marginRight: SIZES.sm },
  methodInfo: { flex: 1 },
  methodTitle: { fontSize: SIZES.font.lg, fontFamily: FONTS.family.semiBold, color: COLORS.gray800 },
  methodDesc: { fontSize: SIZES.font.sm, color: COLORS.gray500, fontFamily: FONTS.family.regular },
  selectedBadge: { backgroundColor: COLORS.primary, paddingHorizontal: SIZES.padding.sm, paddingVertical: SIZES.padding.xs, borderRadius: SIZES.radius.full },
  selectedText: { color: COLORS.white, fontSize: SIZES.font.xs, fontFamily: FONTS.family.semiBold },
  secureRow: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.gray50, padding: SIZES.padding.md, borderRadius: SIZES.radius.sm },
  secureText: { fontSize: SIZES.font.sm, color: COLORS.gray500, flex: 1, fontFamily: FONTS.family.regular },

  // Bottom bar
  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    padding: SIZES.padding.lg,
    paddingBottom: Platform.OS === "ios" ? 34 : SIZES.padding.lg,
  },
  payBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.button,
    paddingVertical: SIZES.padding.lg,
    alignItems: "center",
    ...SHADOWS.blue,
  },
  payBtnDisabled: { backgroundColor: COLORS.gray400, ...SHADOWS.none },
  payBtnContent: { flexDirection: "row", alignItems: "center" },
  payBtnAmount: { color: COLORS.white, fontSize: SIZES.font.xl, fontFamily: FONTS.family.bold, marginRight: SIZES.sm },
  payBtnText: { color: COLORS.white, fontSize: SIZES.font.lg, fontFamily: FONTS.family.semiBold },
  payNote: { textAlign: "center", fontSize: SIZES.font.xs, color: COLORS.gray400, marginTop: SIZES.sm, fontFamily: FONTS.family.regular },

  // Status screens
  statusContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: SIZES.padding.xxxl },
  statusIcon: { fontSize: 64, marginBottom: SIZES.md },
  statusTitle: { fontSize: SIZES.font.xxxl, fontFamily: FONTS.family.bold, color: COLORS.gray800, marginBottom: SIZES.sm },
  statusSub: { fontSize: SIZES.font.md, color: COLORS.gray500, textAlign: "center", marginBottom: SIZES.sm, lineHeight: SIZES.font.md * 1.6, fontFamily: FONTS.family.regular },
  statusDetail: { fontSize: SIZES.font.md, color: COLORS.primary, fontFamily: FONTS.family.semiBold, marginBottom: SIZES.xs },
  paymentIdText: { fontSize: SIZES.font.sm, color: COLORS.gray400, marginBottom: SIZES.xl, fontFamily: FONTS.family.regular },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.button,
    paddingVertical: SIZES.padding.lg,
    paddingHorizontal: SIZES.padding.xxxl,
    marginBottom: SIZES.sm,
    width: "100%",
    alignItems: "center",
    ...SHADOWS.blue,
  },
  primaryBtnText: { color: COLORS.white, fontSize: SIZES.font.lg, fontFamily: FONTS.family.semiBold },
  secondaryBtn: {
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: SIZES.radius.button,
    paddingVertical: SIZES.padding.lg,
    paddingHorizontal: SIZES.padding.xxxl,
    width: "100%", alignItems: "center",
  },
  secondaryBtnText: { color: COLORS.gray500, fontSize: SIZES.font.lg, fontFamily: FONTS.family.medium },
});

export default PayNow;
