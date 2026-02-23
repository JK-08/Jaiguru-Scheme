import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../Utills/AppTheme";
import CommonHeader from "../../Components/CommonHeader/CommonHeader";
import PaymentReceiptPDF from "../../Utills/PaymentReceiptPDF";
import { useCompany } from "../../Hooks/useCompany";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function SchemeDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { schemeData, fromScreen } = route.params || {};
  const [expandedSection, setExpandedSection] = useState(null);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Get company data from hook
  const { company: companyData, loading: companyLoading } = useCompany();

  // If no data is passed, show error or go back
  if (!schemeData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No scheme data available</Text>
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

  // Since schemeData is an array with one object, take the first item
  const data = Array.isArray(schemeData) ? schemeData[0] : schemeData;

  const {
    regNo,
    groupCode,
    pName,
    joinDate,
    maturityDate,
    totalAmount = 0,
    bonusAmount = 0,
    schemeSummary,
    personalInfo,
    nextDueDate,
    paymentHistoryList = [],
    remainingDueDates = [],
    schemeClosedSummary,
    lastPaidDate,
    totalAmountWithBonus = 0,
    bonusPercent,
    remainingDays = 0,
  } = data;

  // Extract scheme summary data
  const {
    schemeId,
    schemeName,
    schemeSName,
    instalment = "0",
    amount,
    schemaSummaryTransBalance = {},
    fixedIns = "Y",
    weightLedger = "N",
    totalWeight = "0",
    lastWeight = "0.0",
  } = schemeSummary || {};

  const {
    amtrecd = "0.0",
    bonusAmount: transBonusAmount = "0.0",
    totalAmount: transTotalAmount = "0.0",
    insPaid = "0",
  } = schemaSummaryTransBalance;

  // Extract personal info
  const {
    personalId,
    doorNo,
    address1,
    address2,
    area,
    city,
    state,
    country,
    pinCode,
    mobile,
    mobile2,
    costId,
  } = personalInfo || {};

  const formatDate = (dateString) => {
    if (!dateString || dateString === "1900-01-01 00:00:00.0") return "N/A";
    // Handle different date formats
    if (dateString.includes("T")) {
      return dateString.split("T")[0];
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

  const isPaymentDue = nextDueDate && new Date(nextDueDate) <= new Date();

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    const paid = parseInt(insPaid) || 0;
    const total = parseInt(instalment) || 1;
    return Math.min((paid / total) * 100, 100);
  }, [insPaid, instalment]);

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Handle view receipt
// In SchemeDetails.js, update the handleViewReceipt function:

const handleViewReceipt = (payment) => {
  navigation.navigate('PaymentReceipt', {
    paymentData: payment,
    schemeData: data,
    customerData: {
      pName: pName,
      mobile: mobile,
      address1: `${doorNo || ''}, ${address1 || ''}`,
      address2: `${city || ''}, ${state || ''} ${pinCode || ''}`,
    }
  });
};

  // Generate and download receipt
  const handleGenerateReceipt = async () => {
    if (!selectedPayment) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Prepare data for PDF generation
      const responseData = {
        schemeData: data,
        payment: {
          amount: selectedPayment.amount,
          weight: selectedPayment.weight || "0.0",
          receiptNo: selectedPayment.receiptNo,
          updateTime: selectedPayment.updateTime,
          chqBank: selectedPayment.chqBank,
          chqBranch: selectedPayment.chqBranch,
          chq_CardNo: selectedPayment.chq_CardNo,
          installment: selectedPayment.installment,
        },
        customerInfo: {
          customerName: pName,
          mobile: mobile,
        },
        schemeInfo: {
          schemeName: schemeName,
          hsnCode: "",
        }
      };

      // If company data is available from hook, update the PaymentReceiptPDF's company data
      if (companyData) {
        // You might need to modify PaymentReceiptPDF to accept company data directly
        // For now, we'll just pass it through the responseData
        responseData.companyData = companyData;
      }

      const result = await PaymentReceiptPDF.generatePDF(responseData);
      
      if (result.success) {
        Alert.alert("Success", "Receipt generated successfully!");
        setReceiptModalVisible(false);
      }
    } catch (error) {
      console.error("Error generating receipt:", error);
      Alert.alert("Error", "Failed to generate receipt. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Render Payment History Item with eye icon
  const renderPaymentItem = ({ item, index }) => (
    <View style={styles.paymentHistoryItem}>
      <View style={styles.paymentSerial}>
        <Text style={styles.paymentSerialText}>{index + 1}</Text>
      </View>
      <View style={styles.paymentDetails}>
        <Text style={styles.paymentDate}>
          {item.updateTime ? formatDate(item.updateTime) : "N/A"}
        </Text>
        <Text style={styles.paymentAmount}>{formatCurrency(item.amount)}</Text>
        {item.installment && (
          <Text style={styles.paymentInstallment}>
            Installment: {item.installment}
          </Text>
        )}
        <Text style={styles.paymentReceiptNo}>
          Receipt: {item.receiptNo || 'N/A'}
        </Text>
      </View>
      <View style={styles.paymentActions}>
        <View style={[
          styles.paymentStatus,
          { backgroundColor: COLORS.success + "20" }
        ]}>
          <Text style={[styles.paymentStatusText, { color: COLORS.success }]}>
            Paid
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.receiptButton}
          onPress={() => handleViewReceipt(item)}
        >
          <Text style={styles.receiptIcon}>👁️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Empty Payment History
  const renderEmptyPayments = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No payment history available</Text>
    </View>
  );

  // Receipt Modal
  const ReceiptModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={receiptModalVisible}
      onRequestClose={() => setReceiptModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Payment Receipt</Text>
            <TouchableOpacity 
              onPress={() => setReceiptModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {selectedPayment && (
            <ScrollView style={styles.modalBody}>
              {/* Receipt Number */}
              <View style={styles.receiptSection}>
                <Text style={styles.receiptSectionTitle}>Receipt Details</Text>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Receipt No:</Text>
                  <Text style={styles.receiptValue}>{selectedPayment.receiptNo || 'N/A'}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Date:</Text>
                  <Text style={styles.receiptValue}>{formatDate(selectedPayment.updateTime)}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Installment:</Text>
                  <Text style={styles.receiptValue}>{selectedPayment.installment || 'N/A'}</Text>
                </View>
              </View>

              {/* Amount Details */}
              <View style={styles.receiptSection}>
                <Text style={styles.receiptSectionTitle}>Amount Details</Text>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Amount:</Text>
                  <Text style={styles.receiptValueAmount}>{formatCurrency(selectedPayment.amount)}</Text>
                </View>
                {selectedPayment.weight && selectedPayment.weight !== "0.0" && (
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Weight:</Text>
                    <Text style={styles.receiptValue}>{selectedPayment.weight} kg</Text>
                  </View>
                )}
              </View>

              {/* Payment Mode */}
              <View style={styles.receiptSection}>
                <Text style={styles.receiptSectionTitle}>Payment Mode</Text>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Mode:</Text>
                  <Text style={styles.receiptValue}>{selectedPayment.chqBank || 'N/A'}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Branch:</Text>
                  <Text style={styles.receiptValue}>{selectedPayment.chqBranch || 'N/A'}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Transaction ID:</Text>
                  <Text style={styles.receiptValue}>{selectedPayment.chq_CardNo || 'N/A'}</Text>
                </View>
              </View>

              {/* Customer Details */}
              <View style={styles.receiptSection}>
                <Text style={styles.receiptSectionTitle}>Customer Details</Text>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Name:</Text>
                  <Text style={styles.receiptValue}>{pName}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Mobile:</Text>
                  <Text style={styles.receiptValue}>{mobile || 'N/A'}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Scheme:</Text>
                  <Text style={styles.receiptValue}>{schemeName}</Text>
                </View>
              </View>

              {/* Company Details from hook */}
              {companyData && (
                <View style={styles.receiptSection}>
                  <Text style={styles.receiptSectionTitle}>Company Details</Text>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Name:</Text>
                    <Text style={styles.receiptValue}>{companyData.COMPANYNAME}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>GSTIN:</Text>
                    <Text style={styles.receiptValue}>{companyData.GSTNO || 'N/A'}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Phone:</Text>
                    <Text style={styles.receiptValue}>{companyData.PHONE}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Email:</Text>
                    <Text style={styles.receiptValue}>{companyData.EMAIL}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Address:</Text>
                    <Text style={styles.receiptValueAddress}>
                      {[companyData.ADDRESS1, companyData.ADDRESS2, companyData.ADDRESS3, companyData.AREACODE]
                        .filter(Boolean)
                        .join(', ')}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          )}

          {/* Action Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setReceiptModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.downloadButton]}
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
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <CommonHeader 
        title="Scheme Details"
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* SECTION 1: SCHEME DATA */}
        <View style={styles.sectionCard}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('scheme')}
          >
            <Text style={styles.sectionTitle}>📋 Scheme Information</Text>
            <Text style={styles.expandIcon}>
              {expandedSection === 'scheme' ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {(expandedSection === 'scheme' || expandedSection === null) && (
            <View style={styles.sectionContent}>
              {/* Scheme Basic Info */}
              <View style={styles.schemeHeader}>
                <View style={styles.schemeBadge}>
                  <Text style={styles.schemeBadgeText}>{schemeSName || groupCode}</Text>
                </View>
                <Text style={styles.schemeFullName}>{schemeName}</Text>
                <Text style={styles.schemeId}>Scheme ID: {schemeId}</Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Installment Progress</Text>
                  <Text style={styles.progressValue}>
                    {insPaid}/{instalment} paid
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${progressPercentage}%` }
                    ]} 
                  />
                </View>
              </View>

              {/* Financial Details - All in one row */}
              <View style={styles.financialRow}>
                <View style={[styles.financialItem, styles.financialItemSmall]}>
                  <Text style={styles.financialLabel}>Total Paid</Text>
                  <Text style={styles.financialValuePrimary}>
                    {formatCurrency(transTotalAmount || totalAmount)}
                  </Text>
                </View>
                
                <View style={styles.financialDivider} />
                
                <View style={[styles.financialItem, styles.financialItemSmall]}>
                  <Text style={styles.financialLabel}>Bonus Amount</Text>
                  <Text style={styles.financialValueBonus}>
                    {formatCurrency(transBonusAmount || bonusAmount)}
                  </Text>
                </View>

                <View style={styles.financialDivider} />

                <View style={[styles.financialItem, styles.financialItemSmall]}>
                  <Text style={styles.financialLabel}>Total with Bonus</Text>
                  <Text style={styles.financialValue}>
                    {formatCurrency(totalAmountWithBonus || transTotalAmount)}
                  </Text>
                </View>
              </View>

              {/* Dates Information - Join and Maturity in one row */}
              <View style={styles.datesRow}>
                <View style={styles.dateItem}>
                  <Text style={styles.dateIcon}>📅</Text>
                  <View style={styles.dateContent}>
                    <Text style={styles.dateLabel}>Join Date</Text>
                    <Text style={styles.dateValue}>{formatDate(joinDate)}</Text>
                  </View>
                </View>

                <View style={styles.dateItem}>
                  <Text style={styles.dateIcon}>🎯</Text>
                  <View style={styles.dateContent}>
                    <Text style={styles.dateLabel}>Maturity Date</Text>
                    <Text style={styles.dateValue}>{formatDate(maturityDate)}</Text>
                  </View>
                </View>
              </View>

              {/* Additional Date Information */}
              <View style={styles.additionalDates}>
                {lastPaidDate && (
                  <View style={styles.additionalDateItem}>
                    <Text style={styles.additionalDateLabel}>Last Paid:</Text>
                    <Text style={styles.additionalDateValue}>{formatDate(lastPaidDate)}</Text>
                  </View>
                )}

                {nextDueDate && (
                  <View style={[styles.additionalDateItem, styles.nextDueItem]}>
                    <Text style={styles.additionalDateLabel}>Next Due:</Text>
                    <Text style={[styles.additionalDateValue, styles.nextDueValue]}>
                      {formatDate(nextDueDate)}
                    </Text>
                  </View>
                )}

                {remainingDays > 0 && (
                  <View style={styles.additionalDateItem}>
                    <Text style={styles.additionalDateLabel}>Remaining Days:</Text>
                    <Text style={styles.additionalDateValue}>{remainingDays} days</Text>
                  </View>
                )}
              </View>

              {/* Weight Information (if applicable) */}
              {weightLedger === "Y" && (
                <>
                  <Text style={styles.subSectionTitle}>Weight Details</Text>
                  <View style={styles.weightRow}>
                    <View style={styles.weightItem}>
                      <Text style={styles.weightLabel}>Total Weight</Text>
                      <Text style={styles.weightValue}>{totalWeight} kg</Text>
                    </View>
                    <View style={styles.weightDivider} />
                    <View style={styles.weightItem}>
                      <Text style={styles.weightLabel}>Last Weight</Text>
                      <Text style={styles.weightValue}>
                        {lastWeight !== "null" ? `${lastWeight} kg` : "N/A"}
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {/* Scheme Closed Information */}
              {schemeClosedSummary?.doClose !== "1900-01-01 00:00:00.0" && (
                <View style={styles.closedInfo}>
                  <Text style={styles.closedTitle}>Scheme Closed</Text>
                  <Text style={styles.closedText}>Closed on: {formatDate(schemeClosedSummary.closeDate)}</Text>
                  <Text style={styles.closedText}>Closed by: {schemeClosedSummary.empName}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* SECTION 2: USER DATA */}
        <View style={styles.sectionCard}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('user')}
          >
            <Text style={styles.sectionTitle}>👤 Member Information</Text>
            <Text style={styles.expandIcon}>
              {expandedSection === 'user' ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {(expandedSection === 'user' || expandedSection === null) && (
            <View style={styles.sectionContent}>
              {/* Basic Info */}
              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Member ID:</Text>
                  <Text style={styles.infoValue}>{personalId || regNo}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValue}>{pName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Group Code:</Text>
                  <Text style={styles.infoValue}>{groupCode}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Registration No:</Text>
                  <Text style={styles.infoValue}>{regNo}</Text>
                </View>
                {costId && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Cost ID:</Text>
                    <Text style={styles.infoValue}>{costId}</Text>
                  </View>
                )}
              </View>

              {/* Contact Information */}
              <Text style={styles.subSectionTitle}>Contact Details</Text>
              <View style={styles.infoGrid}>
                {mobile && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Mobile 1:</Text>
                    <Text style={styles.infoValue}>{mobile}</Text>
                  </View>
                )}
                {mobile2 && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Mobile 2:</Text>
                    <Text style={styles.infoValue}>{mobile2}</Text>
                  </View>
                )}
              </View>

              {/* Address Information */}
              {(address1 || address2 || city || state) && (
                <>
                  <Text style={styles.subSectionTitle}>Address</Text>
                  <View style={styles.addressContainer}>
                    <Text style={styles.addressText}>
                      {[doorNo, address1, address2, area].filter(Boolean).join(', ')}
                    </Text>
                    <Text style={styles.addressText}>
                      {[city, state, country, pinCode].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                </>
              )}
            </View>
          )}
        </View>

        {/* SECTION 3: PAYMENT HISTORY */}
        <View style={styles.sectionCard}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('payment')}
          >
            <View style={styles.paymentHeaderLeft}>
              <Text style={styles.sectionTitle}>💰 Payment History</Text>
              {paymentHistoryList.length > 0 && (
                <View style={styles.paymentCountBadge}>
                  <Text style={styles.paymentCountText}>{paymentHistoryList.length}</Text>
                </View>
              )}
            </View>
            <Text style={styles.expandIcon}>
              {expandedSection === 'payment' ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {(expandedSection === 'payment' || expandedSection === null) && (
            <View style={styles.sectionContent}>
              {/* Payment Summary */}
              <View style={styles.paymentSummary}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Installments Paid</Text>
                  <Text style={styles.summaryValue}>{insPaid}/{instalment}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Amount</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(transTotalAmount || totalAmount)}
                  </Text>
                </View>
              </View>

              {/* Payment List */}
              <Text style={styles.listTitle}>Payment Transactions</Text>
              <FlatList
                data={paymentHistoryList}
                renderItem={renderPaymentItem}
                keyExtractor={(item, index) => `payment-${index}`}
                scrollEnabled={false}
                ListEmptyComponent={renderEmptyPayments}
                contentContainerStyle={styles.paymentList}
              />

              {/* Upcoming Dues */}
              {remainingDueDates && remainingDueDates.length > 0 && (
                <>
                  <Text style={styles.listTitle}>Upcoming Due Dates</Text>
                  <View style={styles.upcomingDates}>
                    {remainingDueDates.slice(0, 5).map((date, index) => (
                      <View key={index} style={styles.upcomingDateItem}>
                        <Text style={styles.upcomingDateText}>
                          {formatDate(date)}
                        </Text>
                        {index === 0 && (
                          <View style={styles.nextBadge}>
                            <Text style={styles.nextBadgeText}>Next</Text>
                          </View>
                        )}
                      </View>
                    ))}
                    {remainingDueDates.length > 5 && (
                      <Text style={styles.moreText}>
                        +{remainingDueDates.length - 5} more
                      </Text>
                    )}
                  </View>
                </>
              )}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.paymentHistoryButton]}
            onPress={() => toggleSection('payment')}
          >
            <Text style={styles.paymentHistoryButtonText}>View Full History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.makePaymentButton, isPaymentDue && styles.makePaymentButtonDue]}
            onPress={() => console.log("Make Payment")}
          >
            <Text style={styles.makePaymentButtonText}>
              {isPaymentDue ? "Pay Now" : "Make Payment"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Receipt Modal */}
      <ReceiptModal />
    </SafeAreaView>
  );
}

// Add these new styles for the modal
const modalStyles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: '80%',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.card,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding.lg,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalTitle: {
    ...FONTS.h4,
    color: COLORS.white,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    ...FONTS.bodyBold,
    color: COLORS.white,
    fontSize: SIZES.font.md,
  },
  modalBody: {
    padding: SIZES.padding.lg,
    maxHeight: '60%',
  },
  receiptSection: {
    marginBottom: SIZES.margin.lg,
    padding: SIZES.padding.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radius.md,
  },
  receiptSectionTitle: {
    ...FONTS.bodyBold,
    color: COLORS.primary,
    marginBottom: SIZES.margin.sm,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SIZES.padding.xs,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.divider,
  },
  receiptLabel: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    flex: 0.4,
  },
  receiptValue: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    flex: 0.6,
    textAlign: 'right',
  },
  receiptValueAmount: {
    ...FONTS.bodyBold,
    color: COLORS.primary,
    flex: 0.6,
    textAlign: 'right',
  },
  receiptValueAddress: {
    ...FONTS.caption,
    color: COLORS.textPrimary,
    flex: 0.6,
    textAlign: 'right',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SIZES.padding.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    gap: SIZES.margin.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  cancelButtonText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
  },
  downloadButton: {
    backgroundColor: COLORS.primary,
  },
  downloadButtonText: {
    ...FONTS.bodyBold,
    color: COLORS.white,
  },
};

// Merge with existing styles
const styles = StyleSheet.create({
  ...StyleSheet.create({
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
    statusBanner: {
      backgroundColor: COLORS.success,
      padding: SIZES.padding.md,
      borderRadius: SIZES.radius.md,
      marginBottom: SIZES.margin.lg,
      ...SHADOWS.xs,
    },
    statusBannerDue: {
      backgroundColor: COLORS.error,
    },
    statusBannerText: {
      ...FONTS.bodyBold,
      color: COLORS.white,
      textAlign: "center",
    },
    dueDateText: {
      ...FONTS.caption,
      color: COLORS.white,
      textAlign: "center",
      marginTop: SIZES.margin.xs,
    },
    sectionCard: {
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius.card,
      marginBottom: SIZES.margin.lg,
      ...SHADOWS.xs,
      overflow: "hidden",
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: SIZES.padding.lg,
      backgroundColor: COLORS.backgroundSecondary,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.divider,
    },
    sectionTitle: {
      ...FONTS.h4,
      color: COLORS.primary,
    },
    expandIcon: {
      ...FONTS.h4,
      color: COLORS.textSecondary,
    },
    sectionContent: {
      padding: SIZES.padding.lg,
    },
    subSectionTitle: {
      ...FONTS.bodyBold,
      color: COLORS.textPrimary,
      marginTop: SIZES.margin.md,
      marginBottom: SIZES.margin.sm,
    },
    infoGrid: {
      gap: SIZES.margin.sm,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    infoLabel: {
      ...FONTS.body,
      color: COLORS.textSecondary,
      width: 100,
    },
    infoValue: {
      ...FONTS.body,
      color: COLORS.textPrimary,
      flex: 1,
    },
    addressContainer: {
      backgroundColor: COLORS.backgroundSecondary,
      padding: SIZES.padding.md,
      borderRadius: SIZES.radius.md,
    },
    addressText: {
      ...FONTS.body,
      color: COLORS.textPrimary,
      lineHeight: 20,
    },
    schemeHeader: {
      alignItems: "center",
      marginBottom: SIZES.margin.lg,
    },
    schemeBadge: {
      backgroundColor: COLORS.goldPrimary,
      paddingHorizontal: SIZES.padding.md,
      paddingVertical: SIZES.padding.xs,
      borderRadius: SIZES.radius.sm,
      marginBottom: SIZES.margin.sm,
    },
    schemeBadgeText: {
      ...FONTS.captionBold,
      color: COLORS.white,
    },
    schemeFullName: {
      ...FONTS.body,
      color: COLORS.textPrimary,
      textAlign: "center",
      marginBottom: SIZES.margin.xs,
    },
    schemeId: {
      ...FONTS.caption,
      color: COLORS.textSecondary,
    },
    progressSection: {
      marginBottom: SIZES.margin.lg,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SIZES.margin.sm,
    },
    progressLabel: {
      ...FONTS.caption,
      color: COLORS.textSecondary,
    },
    progressValue: {
      ...FONTS.bodyBold,
      color: COLORS.primary,
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: COLORS.backgroundSecondary,
      borderRadius: SIZES.radius.round,
      overflow: "hidden",
    },
    progressBar: {
      height: "100%",
      backgroundColor: COLORS.primary,
      borderRadius: SIZES.radius.round,
    },
    financialRow: {
      flexDirection: "row",
      backgroundColor: COLORS.backgroundSecondary,
      borderRadius: SIZES.radius.md,
      padding: SIZES.padding.sm,
      marginBottom: SIZES.margin.lg,
      alignItems: "center",
      justifyContent: "space-between",
    },
    financialItem: {
      flex: 1,
      alignItems: "center",
    },
    financialItemSmall: {
      paddingVertical: SIZES.padding.xs,
    },
    financialDivider: {
      width: 1,
      height: 30,
      backgroundColor: COLORS.divider,
    },
    financialLabel: {
      ...FONTS.caption,
      color: COLORS.textSecondary,
      marginBottom: 2,
      fontSize: SIZES.font.xs,
    },
    financialValue: {
      ...FONTS.body,
      color: COLORS.textPrimary,
    },
    financialValuePrimary: {
      ...FONTS.bodyBold,
      color: COLORS.primary,
    },
    financialValueBonus: {
      ...FONTS.bodyBold,
      color: COLORS.goldDark,
    },
    datesRow: {
      flexDirection: "row",
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius.md,
      borderWidth: 1,
      borderColor: COLORS.blueOpacity10,
      marginBottom: SIZES.margin.md,
      overflow: "hidden",
    },
    dateItem: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      padding: SIZES.padding.md,
    },
    dateIcon: {
      fontSize: SIZES.font.xl,
      marginRight: SIZES.margin.sm,
    },
    dateContent: {
      flex: 1,
    },
    dateLabel: {
      ...FONTS.caption,
      color: COLORS.textSecondary,
      marginBottom: 2,
    },
    dateValue: {
      ...FONTS.body,
      color: COLORS.textPrimary,
    },
    additionalDates: {
      backgroundColor: COLORS.backgroundSecondary,
      borderRadius: SIZES.radius.md,
      padding: SIZES.padding.md,
      marginBottom: SIZES.margin.lg,
    },
    additionalDateItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: SIZES.padding.xs,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.divider,
    },
    nextDueItem: {
      borderBottomWidth: 0,
      marginTop: SIZES.margin.xs,
    },
    additionalDateLabel: {
      ...FONTS.body,
      color: COLORS.textSecondary,
    },
    additionalDateValue: {
      ...FONTS.body,
      color: COLORS.textPrimary,
    },
    nextDueValue: {
      color: COLORS.error,
      fontWeight: "bold",
    },
    weightRow: {
      flexDirection: "row",
      backgroundColor: COLORS.backgroundSecondary,
      borderRadius: SIZES.radius.md,
      padding: SIZES.padding.md,
      alignItems: "center",
      justifyContent: "space-between",
    },
    weightItem: {
      flex: 1,
      alignItems: "center",
    },
    weightDivider: {
      width: 1,
      height: 30,
      backgroundColor: COLORS.divider,
    },
    weightLabel: {
      ...FONTS.caption,
      color: COLORS.textSecondary,
      marginBottom: SIZES.margin.xs,
    },
    weightValue: {
      ...FONTS.bodyBold,
      color: COLORS.primary,
    },
    closedInfo: {
      marginTop: SIZES.margin.md,
      padding: SIZES.padding.md,
      backgroundColor: COLORS.warning + "10",
      borderRadius: SIZES.radius.md,
      borderWidth: 1,
      borderColor: COLORS.warning,
    },
    closedTitle: {
      ...FONTS.bodyBold,
      color: COLORS.warning,
      marginBottom: SIZES.margin.xs,
    },
    closedText: {
      ...FONTS.body,
      color: COLORS.textSecondary,
    },
    paymentHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: SIZES.margin.sm,
    },
    paymentCountBadge: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: SIZES.padding.sm,
      paddingVertical: 2,
      borderRadius: SIZES.radius.round,
    },
    paymentCountText: {
      ...FONTS.captionBold,
      color: COLORS.white,
      fontSize: SIZES.font.xs,
    },
    paymentSummary: {
      flexDirection: "row",
      backgroundColor: COLORS.backgroundSecondary,
      borderRadius: SIZES.radius.md,
      padding: SIZES.padding.md,
      marginBottom: SIZES.margin.lg,
    },
    summaryItem: {
      flex: 1,
      alignItems: "center",
    },
    summaryDivider: {
      width: 1,
      backgroundColor: COLORS.divider,
    },
    summaryLabel: {
      ...FONTS.caption,
      color: COLORS.textSecondary,
      marginBottom: SIZES.margin.xs,
    },
    summaryValue: {
      ...FONTS.h4,
      color: COLORS.primary,
    },
    listTitle: {
      ...FONTS.bodyBold,
      color: COLORS.textPrimary,
      marginBottom: SIZES.margin.sm,
    },
    paymentList: {
      gap: SIZES.margin.sm,
    },
    paymentHistoryItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.backgroundSecondary,
      padding: SIZES.padding.sm,
      borderRadius: SIZES.radius.sm,
    },
    paymentSerial: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: COLORS.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SIZES.margin.sm,
    },
    paymentSerialText: {
      ...FONTS.captionBold,
      color: COLORS.white,
    },
    paymentDetails: {
      flex: 1,
    },
    paymentDate: {
      ...FONTS.caption,
      color: COLORS.textSecondary,
    },
    paymentAmount: {
      ...FONTS.bodyBold,
      color: COLORS.textPrimary,
    },
    paymentInstallment: {
      ...FONTS.caption,
      color: COLORS.textSecondary,
      fontSize: SIZES.font.xs,
    },
    paymentReceiptNo: {
      ...FONTS.caption,
      color: COLORS.primary,
      fontSize: SIZES.font.xs,
      marginTop: 2,
    },
    paymentActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: SIZES.margin.sm,
    },
    paymentStatus: {
      paddingHorizontal: SIZES.padding.sm,
      paddingVertical: 4,
      borderRadius: SIZES.radius.sm,
    },
    paymentStatusText: {
      ...FONTS.captionBold,
      fontSize: SIZES.font.xs,
    },
    receiptButton: {
      padding: SIZES.padding.xs,
      backgroundColor: COLORS.primary + "10",
      borderRadius: SIZES.radius.sm,
    },
    receiptIcon: {
      fontSize: SIZES.font.lg,
    },
    emptyContainer: {
      padding: SIZES.padding.lg,
      alignItems: "center",
    },
    emptyText: {
      ...FONTS.body,
      color: COLORS.textSecondary,
    },
    upcomingDates: {
      gap: SIZES.margin.xs,
    },
    upcomingDateItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: SIZES.padding.xs,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.divider,
    },
    upcomingDateText: {
      ...FONTS.body,
      color: COLORS.textPrimary,
    },
    nextBadge: {
      backgroundColor: COLORS.warning,
      paddingHorizontal: SIZES.padding.sm,
      paddingVertical: 2,
      borderRadius: SIZES.radius.sm,
    },
    nextBadgeText: {
      ...FONTS.captionBold,
      color: COLORS.white,
      fontSize: SIZES.font.xs,
    },
    moreText: {
      ...FONTS.caption,
      color: COLORS.textSecondary,
      textAlign: "center",
      marginTop: SIZES.margin.xs,
    },
    actionButtons: {
      flexDirection: "row",
      gap: SIZES.margin.md,
      marginBottom: SIZES.margin.xl,
    },
    actionButton: {
      flex: 1,
      paddingVertical: SIZES.padding.md,
      borderRadius: SIZES.radius.md,
      alignItems: "center",
      ...SHADOWS.xs,
    },
    paymentHistoryButton: {
      backgroundColor: COLORS.white,
      borderWidth: 1.5,
      borderColor: COLORS.primary,
    },
    paymentHistoryButtonText: {
      ...FONTS.bodyBold,
      color: COLORS.primary,
    },
    makePaymentButton: {
      backgroundColor: COLORS.primary,
    },
    makePaymentButtonDue: {
      backgroundColor: COLORS.error,
    },
    makePaymentButtonText: {
      ...FONTS.bodyBold,
      color: COLORS.white,
    },
  }),
  ...modalStyles,
});