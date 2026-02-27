// screens/PayNow/PayNow.js
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useRazorpayPayment } from "../../Hooks/useRazorPay";
import { useMemberActions } from "../../Hooks/useMemberCreate";
import PaymentModal from "../MemberCreation/PaymentModal";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../Utills/AppTheme";
import CommonHeader from "../../Components/CommonHeader/CommonHeader"

const PayNow = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {
    accountData,
    regNo,
    groupCode,
    memberName,
    schemeName,
    schemeShortName,
    amount,
    totalAmount,
    bonusAmount,
    installmentsPaid,
    totalInstallments,
    joinDate,
    maturityDate,
    nextDueDate,
    schemeId,
  } = route.params || {};

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Razorpay payment hook
  const {
    loading: paymentLoading,
    startPayment,
    paymentStep,
    error: paymentError,
    resetState: resetPayment,
    PAYMENT_STEPS
  } = useRazorpayPayment();

  // Member actions hook for installment insertion
  const {
    handleInsertInstallment,
    loading: insertLoading,
    error: insertError,
  } = useMemberActions();

  // Format currency
  const formatCurrency = useCallback((value) => {
    const numValue = parseFloat(value) || 0;
    return `₹${numValue.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    })}`;
  }, []);

  // Format date
  const formatDisplayDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  // Format date for API (yyyy-MM-dd 00:00:00)
  const formatApiDate = useCallback((date) => {
    const d = date || new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day} 00:00:00`;
  }, []);

  // Calculate payment amount
  const paymentAmount = useMemo(() => {
    return parseFloat(amount) || 0;
  }, [amount]);

  // Calculate next installment number
  const nextInstallmentNumber = useMemo(() => {
    return (parseInt(installmentsPaid) || 0) + 1;
  }, [installmentsPaid]);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    const paid = parseInt(installmentsPaid) || 0;
    const total = parseInt(totalInstallments) || 1;
    return (paid / total) * 100;
  }, [installmentsPaid, totalInstallments]);

  // Prepare installment payload
  const prepareInstallmentPayload = useCallback((paymentId, orderId) => {
    const now = new Date();
    const todayDate = formatApiDate(now);
    
    return {
  groupCode: groupCode || "",
  regNo: parseInt(regNo) || 0,

  rDate: todayDate,

  amount: parseFloat(paymentAmount) || 0,        // ✅ number

  modePay: 4,                                    // ✅ INT (Online = 4)

  accCode: "00001",

  updateTime: todayDate,

installment: (parseInt(installmentsPaid) || 0) + 1,

  weight: accountData?.schemeSummary?.weightLedger === "Y"
    ? parseFloat(accountData?.schemeSummary?.totalWeight || 0)
    : 0,

  sWeight: accountData?.schemeSummary?.weightLedger === "Y"
    ? parseFloat(accountData?.schemeSummary?.lastWeight || 0)
    : 0,

  userID: 999,                                   // ✅ number

  schemeId: parseInt(schemeId) || 0,              // ✅ number

  chqBankCode: 4,                                 // ❗ NOT "Razorpay"
  chqCardNo: paymentId || "",                     // string OK
  chqBranch: "Online",                            // string OK
  chkBank: "Razorpay",                            // string OK
  chqRtnReason: orderId || "",
};
  }, [groupCode, regNo, paymentAmount, nextInstallmentNumber, accountData, schemeId]);

  // Handle payment
  const handlePayment = useCallback(async () => {
    try {
      setIsProcessing(true);
      setPaymentSuccess(false);
      
      // Customer details from account data
      const customerDetails = {
        name: memberName || "Customer",
        phone: accountData?.personalInfo?.mobile || "9999999999",
        email: accountData?.personalInfo?.email || "customer@example.com",
      };

      // Start Razorpay payment
      const result = await startPayment(
        paymentAmount,
        customerDetails,
        regNo?.toString() || "1",
        groupCode || "MAN"
      );

      if (result.success) {
        // Payment successful - Now insert installment record
        try {
          const installmentPayload = prepareInstallmentPayload(
            result.paymentId,
            result.orderId
          );
          
          console.log("Inserting installment with payload:", installmentPayload);
          
          const insertResponse = await handleInsertInstallment(installmentPayload);
          
          console.log("Installment inserted successfully:", insertResponse);
          
          setPaymentSuccess(true);
          
          // Show success message with both payment and installment details
          Alert.alert(
            "🎉 Payment Successful",
            `Your installment payment of ${formatCurrency(paymentAmount)} has been processed successfully.\n\n` +
            `Installment: ${nextInstallmentNumber}/${totalInstallments}\n` +
            `Payment ID: ${result.paymentId}\n` +
            `Receipt will be sent to your registered mobile number.`,
            [
              {
                text: "View Scheme",
                onPress: () => {
                  navigation.navigate("SchemePassbook", {
                    schemeData: {
                      ...accountData,
                      // Update local data with new installment info
                      schemeSummary: {
                        ...accountData?.schemeSummary,
                        schemaSummaryTransBalance: {
                          ...accountData?.schemeSummary?.schemaSummaryTransBalance,
                          insPaid: nextInstallmentNumber.toString(),
                          amtrecd: ((parseFloat(accountData?.schemeSummary?.schemaSummaryTransBalance?.amtrecd) || 0) + paymentAmount).toString(),
                        }
                      }
                    },
                    fromScreen: "PayNow"
                  });
                },
                style: "default"
              },
              {
                text: "Close",
                onPress: () => navigation.goBack(),
                style: "cancel"
              }
            ]
          );
        } catch (insertError) {
          console.error("Failed to insert installment:", insertError);
          
          // Payment succeeded but installment insertion failed
          Alert.alert(
            "⚠️ Payment Recorded",
            `Your payment of ${formatCurrency(paymentAmount)} was successful.\n\n` +
            `Payment ID: ${result.paymentId}\n` +
            `But there was an issue updating the installment record.\n` +
            `Please contact support with your payment ID.`,
            [
              {
                text: "Contact Support",
                onPress: () => {
                  // Navigate to support or show support info
                  Alert.alert("Support", "Please call: +91 1234567890");
                },
              },
              {
                text: "Close",
                onPress: () => navigation.goBack(),
                style: "cancel"
              }
            ]
          );
        }
        
        resetPayment();
      } else {
        // Payment failed
        Alert.alert(
          "Payment Failed",
          result.message || "Something went wrong. Please try again.",
          [{ text: "Try Again", onPress: resetPayment }]
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Error", error.message || "Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  }, [
    paymentAmount, 
    memberName, 
    accountData, 
    regNo, 
    groupCode, 
    startPayment, 
    formatCurrency, 
    navigation, 
    resetPayment,
    prepareInstallmentPayload,
    handleInsertInstallment,
    nextInstallmentNumber,
    totalInstallments
  ]);

  // Info Row Component
  const InfoRow = ({ label, value, highlight = false }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.highlightValue]}>
        {value}
      </Text>
    </View>
  );

  // Progress Bar Component
  const ProgressBar = ({ percentage }) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {installmentsPaid}/{totalInstallments} Installments Paid
      </Text>
    </View>
  );

  const isLoading = paymentLoading || isProcessing || insertLoading;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <CommonHeader title={"Pay Now"} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Scheme Info Card */}
        <View style={styles.card}>
          <View style={styles.schemeHeader}>
            <View style={styles.badgeContainer}>
              <View style={styles.schemeBadge}>
                <Text style={styles.schemeBadgeText}>{schemeShortName || "SCHEME"}</Text>
              </View>
              <View style={styles.regBadge}>
                <Text style={styles.regBadgeText}>REG: {regNo}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.memberName}>{memberName}</Text>
          <Text style={styles.schemeFullName} numberOfLines={2}>
            {schemeName}
          </Text>

          <View style={styles.divider} />

          {/* Progress Bar */}
          <ProgressBar percentage={progressPercentage} />

          {/* Next Installment Info */}
          <View style={styles.nextInstallmentContainer}>
            <Text style={styles.nextInstallmentLabel}>Next Installment:</Text>
            <Text style={styles.nextInstallmentValue}>#{nextInstallmentNumber}</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Join Date</Text>
              <Text style={styles.detailValue}>{formatDisplayDate(joinDate)}</Text>
            </View>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Maturity Date</Text>
              <Text style={styles.detailValue}>{formatDisplayDate(maturityDate)}</Text>
            </View>
          </View>

          {nextDueDate && (
            <View style={styles.dueDateContainer}>
              <Text style={styles.dueDateLabel}>Next Due Date:</Text>
              <Text style={styles.dueDateValue}>{formatDisplayDate(nextDueDate)}</Text>
            </View>
          )}
        </View>

        {/* Amount Summary Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          
          <InfoRow 
            label="Installment Amount" 
            value={formatCurrency(amount)} 
          />
          
          <InfoRow 
            label="Total Paid Till Date" 
            value={formatCurrency(totalAmount)} 
          />

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Due Amount</Text>
            <Text style={styles.totalValue}>{formatCurrency(paymentAmount)}</Text>
          </View>
        </View>

        {/* Payment Details Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          
          <View style={styles.paymentMethodContainer}>
            <View style={styles.razorpayIconContainer}>
              <Text style={styles.razorpayIcon}>💰</Text>
            </View>
            <View style={styles.paymentMethodInfo}>
              <Text style={styles.paymentMethodTitle}>Razorpay</Text>
              <Text style={styles.paymentMethodDescription}>
                Pay via UPI, Credit/Debit Card, NetBanking, Wallet
              </Text>
            </View>
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>Selected</Text>
            </View>
          </View>
          
          <View style={styles.securityNote}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>
              Secure payment powered by Razorpay. Your payment information is encrypted.
            </Text>
          </View>
        </View> 

        {/* Terms Card */}
        <View style={styles.termsCard}>
          <Text style={styles.termsText}>
            By proceeding, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>

        {/* Extra bottom padding for button */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Payment Modal */}
      <PaymentModal
        visible={paymentStep === PAYMENT_STEPS.CREATING_ORDER || 
                 paymentStep === PAYMENT_STEPS.VERIFYING ||
                 paymentStep === PAYMENT_STEPS.FAILED}
        step={paymentStep}
        error={paymentError}
      />

      {/* Bottom Fixed Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.payButton, isLoading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.payButtonContent}>
              <Text style={styles.payButtonAmount}>{formatCurrency(paymentAmount)}</Text>
              <Text style={styles.payButtonText}>Pay Now</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <Text style={styles.paymentNote}>
          You'll be redirected to Razorpay secure checkout
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  backButtonText: {
    fontSize: 24,
    color: "#333333",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  schemeHeader: {
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  schemeBadge: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  schemeBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  regBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  regBadgeText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "500",
  },
  memberName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  schemeFullName: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 16,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  nextInstallmentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  nextInstallmentLabel: {
    fontSize: 12,
    color: "#1E40AF",
    marginRight: 4,
  },
  nextInstallmentValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E40AF",
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF3C7",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dueDateLabel: {
    fontSize: 12,
    color: "#92400E",
    marginRight: 4,
  },
  dueDateValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  highlightValue: {
    color: "#059669",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4F46E5",
  },
  paymentMethodContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  razorpayIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  razorpayIcon: {
    fontSize: 24,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  paymentMethodDescription: {
    fontSize: 12,
    color: "#6B7280",
  },
  selectedBadge: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  selectedBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },
  termsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  termsText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: "#4F46E5",
    fontWeight: "500",
  },
  bottomPadding: {
    height: 100,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  payButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
  },
  payButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  payButtonAmount: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  paymentNote: {
    textAlign: "center",
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 8,
  },
});

export default PayNow;