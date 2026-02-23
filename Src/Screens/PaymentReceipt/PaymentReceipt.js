import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../Utills/AppTheme";
import CommonHeader from "../../Components/CommonHeader/CommonHeader";
import PaymentReceiptPDF from "../../Utills/PaymentReceiptPDF";
import { useCompany } from "../../Hooks/useCompany";
import { API_BASE_URL } from "../../Config/BaseUrl";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function PaymentReceiptPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { paymentData, schemeData, customerData } = route.params || {};
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Get company data from hook
  const { company: companyData, loading: companyLoading } = useCompany();

  // If no data is passed, show error or go back
  if (!paymentData || !schemeData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No receipt data available</Text>
          <TouchableOpacity 
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString || dateString === "1900-01-01 00:00:00.0") return "N/A";
    if (dateString.includes("T")) {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
    if (dateString.includes(" ")) {
      return dateString.split(" ")[0];
    }
    return dateString;
  };

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return `₹${numAmount.toFixed(2)}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString || dateString === "1900-01-01 00:00:00.0") return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Generate and download receipt
  const handleGenerateReceipt = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Prepare data for PDF generation
      const responseData = {
        schemeData: schemeData,
        payment: {
          amount: paymentData.amount,
          weight: paymentData.weight || "0.0",
          receiptNo: paymentData.receiptNo,
          updateTime: paymentData.updateTime,
          chqBank: paymentData.chqBank,
          chqBranch: paymentData.chqBranch,
          chq_CardNo: paymentData.chq_CardNo,
          installment: paymentData.installment,
        },
        customerInfo: {
          customerName: customerData?.pName || schemeData?.pName || "N/A",
          mobile: customerData?.mobile || schemeData?.personalInfo?.mobile || "N/A",
          address1: customerData?.address1 || 
                    `${schemeData?.personalInfo?.doorNo || ""}, ${schemeData?.personalInfo?.address1 || ""}`.replace(/^,\s*|,\s*$/g, '') || "N/A",
          address2: customerData?.address2 || 
                    `${schemeData?.personalInfo?.city || ""}, ${schemeData?.personalInfo?.state || ""} ${schemeData?.personalInfo?.pinCode || ""}`.replace(/^,\s*|,\s*$/g, '') || "N/A",
        },
        schemeInfo: {
          schemeName: schemeData?.schemeSummary?.schemeName || "BMG Scheme",
          hsnCode: "",
        }
      };

      // Add company data if available
      if (companyData) {
        responseData.companyData = {
          cname: companyData.COMPANYNAME,
          cAddress1: companyData.ADDRESS1,
          cAddress2: companyData.ADDRESS2,
          cAddress3: companyData.ADDRESS3,
          cAddress4: companyData.ADDRESS4,
          cPincode: companyData.AREACODE,
          cPhone: companyData.PHONE,
          cEmail: companyData.EMAIL,
          gstNo: companyData.GSTNO,
          companyLogo: companyData.CompanyLogoUrl,
        };
      }

      const result = await PaymentReceiptPDF.generatePDF(responseData);
      
      if (result.success) {
        Alert.alert(
          "Success", 
          "Receipt generated and saved successfully!",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error("Error generating receipt:", error);
      Alert.alert("Error", "Failed to generate receipt. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Share receipt
  const handleShareReceipt = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const responseData = {
        schemeData: schemeData,
        payment: {
          amount: paymentData.amount,
          weight: paymentData.weight || "0.0",
          receiptNo: paymentData.receiptNo,
          updateTime: paymentData.updateTime,
          chqBank: paymentData.chqBank,
          chqBranch: paymentData.chqBranch,
          chq_CardNo: paymentData.chq_CardNo,
          installment: paymentData.installment,
        },
        customerInfo: {
          customerName: customerData?.pName || schemeData?.pName || "N/A",
          mobile: customerData?.mobile || schemeData?.personalInfo?.mobile || "N/A",
        },
        schemeInfo: {
          schemeName: schemeData?.schemeSummary?.schemeName || "BMG Scheme",
          hsnCode: "",
        }
      };

      const result = await PaymentReceiptPDF.sharePDF(responseData);
      
      if (result.success) {
        Alert.alert("Success", "Receipt ready to share!");
      }
    } catch (error) {
      console.error("Error sharing receipt:", error);
      Alert.alert("Error", "Failed to share receipt. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <CommonHeader 
        title="Payment Receipt"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          {/* Header with Logo */}
          <View style={styles.receiptHeader}>
            {companyData?.CompanyLogoUrl ? (
              <Image 
                source={{ uri: companyData.CompanyLogoUrl }}
                style={styles.companyLogo}
                resizeMode="Cover"
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderText}>Jaiguru Jewellers</Text>
              </View>
            )}
            {/* <Text style={styles.receiptTitle}>PAYMENT RECEIPT</Text> */}
          </View>

          {/* Receipt Number and Date */}
          <View style={styles.receiptInfoBar}>
            <View style={styles.receiptInfoItem}>
              <Text style={styles.receiptInfoLabel}>Receipt No:</Text>
              <Text style={styles.receiptInfoValue}>{paymentData.receiptNo || 'N/A'}</Text>
            </View>
            <View style={styles.receiptInfoItem}>
              <Text style={styles.receiptInfoLabel}>Date:</Text>
              <Text style={styles.receiptInfoValue}>{formatDateTime(paymentData.updateTime)}</Text>
            </View>
          </View>

          {/* Company Details */}
          {companyData && (
            <View style={styles.companySection}>
              <Text style={styles.sectionTitle}>Company Details</Text>
              <View style={styles.companyDetails}>
                <Text style={styles.companyName}>{companyData.COMPANYNAME}</Text>
                <Text style={styles.companyAddress}>
                  {[companyData.ADDRESS1, companyData.ADDRESS2, companyData.ADDRESS3]
                    .filter(Boolean)
                    .join(', ')}
                </Text>
                <Text style={styles.companyAddress}>
                  {companyData.AREACODE}
                </Text>
                <View style={styles.contactRow}>
                  <Text style={styles.contactText}>📞 {companyData.PHONE}</Text>
                  <Text style={styles.contactText}>✉️ {companyData.EMAIL}</Text>
                </View>
                {companyData.GSTNO && (
                  <Text style={styles.gstText}>GSTIN: {companyData.GSTNO}</Text>
                )}
              </View>
            </View>
          )}

          {/* Customer Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>
                  {customerData?.pName || schemeData?.pName || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mobile:</Text>
                <Text style={styles.detailValue}>
                  {customerData?.mobile || schemeData?.personalInfo?.mobile || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Scheme:</Text>
                <Text style={styles.detailValue}>
                  {schemeData?.schemeSummary?.schemeName || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reg No:</Text>
                <Text style={styles.detailValue}>
                  {schemeData?.regNo || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            <View style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <Text style={styles.paymentHeaderText}>Installment #{paymentData.installment || 'N/A'}</Text>
              </View>
              
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Amount:</Text>
                <Text style={styles.paymentAmount}>{formatCurrency(paymentData.amount)}</Text>
              </View>

              {paymentData.weight && paymentData.weight !== "0.0" && (
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Weight:</Text>
                  <Text style={styles.paymentValue}>{paymentData.weight} kg</Text>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Payment Mode:</Text>
                <Text style={styles.paymentValue}>{paymentData.chqBank || 'N/A'}</Text>
              </View>

              {paymentData.chqBranch && paymentData.chqBranch !== "N/A" && (
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Branch:</Text>
                  <Text style={styles.paymentValue}>{paymentData.chqBranch}</Text>
                </View>
              )}

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Transaction ID:</Text>
                <Text style={styles.paymentValueTransaction}>{paymentData.chq_CardNo || 'N/A'}</Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>{formatCurrency(paymentData.amount)}</Text>
              </View>
            </View>
          </View>

          {/* Amount in Words */}
          <View style={styles.amountWordsSection}>
            <Text style={styles.amountWordsLabel}>Amount in words:</Text>
            <Text style={styles.amountWordsValue}>
              {PaymentReceiptPDF.numberToWords(Number(paymentData.amount))}
            </Text>
          </View>

          {/* Footer Note */}
          <View style={styles.footerNote}>
            <Text style={styles.footerNoteText}>
              * This is a computer generated receipt and does not require a physical signature *
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShareReceipt}
            disabled={isGeneratingPDF || companyLoading}
          >
            {isGeneratingPDF ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.shareButtonText}>Share</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.downloadButton]}
            onPress={handleGenerateReceipt}
            disabled={isGeneratingPDF || companyLoading}
          >
            {isGeneratingPDF ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.downloadButtonText}>Download PDF</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding.container,
  },
  errorText: {
    ...FONTS.h3,
    color: COLORS.error,
    marginBottom: SIZES.margin.lg,
  },
  goBackButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding.xl,
    paddingVertical: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
  },
  goBackButtonText: {
    ...FONTS.bodyBold,
    color: COLORS.white,
  },
  scrollContent: {
    padding: SIZES.padding.lg,
  },
  receiptCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.card,
    padding: SIZES.padding.lg,
    marginBottom: SIZES.margin.sm,
    ...SHADOWS.md,
  },
  receiptHeader: {
    alignItems: 'center',
    // marginBottom: SIZES.margin.lg,
    // borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: SIZES.padding.sm,
  },
  companyLogo: {
    width: 120,
    height: 120,
    marginBottom: SIZES.margin.sm,
    borderRadius: 30,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.margin.sm,
        borderRadius: 30,
  },
  logoPlaceholderText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
  receiptTitle: {
    ...FONTS.h2,
    color: COLORS.primary,
    letterSpacing: 2,
  },
  receiptInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.margin.lg,
  },
  receiptInfoItem: {
    flex: 1,
  },
  receiptInfoLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },
  receiptInfoValue: {
    ...FONTS.bodyBold,
    color: COLORS.textPrimary,
  },
  companySection: {
    marginBottom: SIZES.margin.lg,
    padding: SIZES.padding.md,
    backgroundColor: COLORS.primary + '05',
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  companyDetails: {
    marginTop: SIZES.margin.xs,
  },
  companyName: {
    ...FONTS.bodyBold,
    color: COLORS.primary,
    fontSize: SIZES.font.lg,
    marginBottom: SIZES.margin.xs,
  },
  companyAddress: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.margin.xs,
  },
  contactText: {
    ...FONTS.caption,
    color: COLORS.textPrimary,
  },
  gstText: {
    ...FONTS.captionBold,
    color: COLORS.primary,
    marginTop: SIZES.margin.xs,
  },
  section: {
    marginBottom: SIZES.margin.lg,
  },
  sectionTitle: {
    ...FONTS.bodyBold,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingBottom: SIZES.padding.xs,
  },
  detailsGrid: {
    gap: SIZES.margin.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    width: 80,
  },
  detailValue: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    flex: 1,
  },
  paymentCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
  },
  paymentHeader: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding.sm,
    borderRadius: SIZES.radius.sm,
    marginBottom: SIZES.margin.md,
    alignItems: 'center',
  },
  paymentHeaderText: {
    ...FONTS.bodyBold,
    color: COLORS.white,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding.xs,
  },
  paymentLabel: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  paymentValue: {
    ...FONTS.body,
    color: COLORS.textPrimary,
  },
  paymentValueTransaction: {
    ...FONTS.caption,
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  paymentAmount: {
    ...FONTS.h4,
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SIZES.margin.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.margin.sm,
    paddingTop: SIZES.padding.sm,
    borderTopWidth: 2,
    borderTopColor: COLORS.divider,
  },
  totalLabel: {
    ...FONTS.bodyBold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    ...FONTS.h3,
    color: COLORS.primary,
  },
  amountWordsSection: {
    marginVertical: SIZES.margin.lg,
    padding: SIZES.padding.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radius.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  amountWordsLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.xs,
  },
  amountWordsValue: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  footerNote: {
    marginTop: SIZES.margin.md,
    paddingTop: SIZES.padding.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  footerNoteText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SIZES.margin.md,
    marginBottom: SIZES.margin.xl,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    ...SHADOWS.xs,
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.divider,
  },
  cancelButtonText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  shareButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  shareButtonText: {
    ...FONTS.bodyBold,
    color: COLORS.primary,
  },
  downloadButton: {
    backgroundColor: COLORS.primary,
  },
  downloadButtonText: {
    ...FONTS.bodyBold,
    color: COLORS.white,
  },
});