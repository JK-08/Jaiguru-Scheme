// SchemeCard.js - Reusable component
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../Utills/AppTheme";

const SchemeCard = React.memo(({ 
  account, 
  layout = 'horizontal', // 'horizontal' or 'vertical'
  onViewDetails,
  onPayNow 
}) => {
  const isHorizontal = layout === 'horizontal';
  
  const {
    regNo,
    groupCode,
    pName,
    joinDate,
    maturityDate,
    totalAmount = 0,
    bonusAmount = 0,
    schemeSummary,
    nextDueDate,
  } = account;

  const insPaid = schemeSummary?.schemaSummaryTransBalance?.insPaid || "0";
  const instalment = schemeSummary?.instalment || "0";
  const schemeSName = schemeSummary?.schemeSName || "N/A";
  const schemeName = schemeSummary?.schemeName || "N/A";
  const isPaymentDue = nextDueDate && new Date(nextDueDate) <= new Date();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dateString.split("T")[0];
  };

  return (
    <View style={[styles.card, isHorizontal ? styles.cardHorizontal : styles.cardVertical]}>
      {/* Header with Badges */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.regBadge}>
            <Text style={styles.regBadgeText}>
              {regNo} - {groupCode}
            </Text>
          </View>
          <View style={styles.schemeBadge}>
            <Text style={styles.schemeBadgeText}>{schemeSName}</Text>
          </View>
          {isPaymentDue && (
            <View style={styles.dueBadge}>
              <Text style={styles.dueBadgeText}>Due</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Content */}
      <View style={[styles.cardContent, isHorizontal ? styles.contentHorizontal : styles.contentVertical]}>
        <View style={styles.nameSection}>
          <Text style={styles.nameText}>{pName}</Text>
          <Text style={styles.schemeText} numberOfLines={2}>
            {schemeName}
          </Text>
        </View>

        <View style={[styles.amountSection, isHorizontal && styles.amountSectionHorizontal]}>
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Total Paid</Text>
            <Text style={styles.amountValue}>₹{totalAmount.toFixed(0)}</Text>
          </View>
          <View style={[styles.amountCard, styles.bonusCard]}>
            <Text style={styles.bonusLabel}>Bonus</Text>
            <Text style={styles.bonusValue}>₹{bonusAmount.toFixed(0)}</Text>
          </View>
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Installment</Text>
            <View style={styles.installmentRow}>
              <Text style={styles.installmentPaid}>{insPaid}</Text>
              <Text style={styles.installmentDivider}>/</Text>
              <Text style={styles.installmentTotal}>{instalment}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.dateSection, isHorizontal && styles.dateSectionHorizontal]}>
          <View style={styles.dateCard}>
            <Text style={styles.dateLabel}>Join Date</Text>
            <Text style={styles.dateValue}>{formatDate(joinDate)}</Text>
          </View>
          <View style={styles.dateDivider} />
          <View style={styles.dateCard}>
            <Text style={styles.dateLabel}>Maturity Date</Text>
            <Text style={styles.dateValue}>{formatDate(maturityDate)}</Text>
          </View>
        </View>

        {nextDueDate && (
          <View style={styles.dueDateSection}>
            <Text style={styles.dueDateLabel}>Next Due:</Text>
            <Text style={styles.dueDateValue}>{formatDate(nextDueDate)}</Text>
          </View>
        )}

        <View style={[styles.buttonsSection, isHorizontal && styles.buttonsSectionHorizontal]}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => onViewDetails(account)}
            activeOpacity={0.7}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.payButton, isPaymentDue && styles.payButtonDue]}
            onPress={() => onPayNow(account)}
            activeOpacity={0.7}
          >
            <Text style={styles.payButtonText}>
              {isPaymentDue ? "Pay Now" : "Make Payment"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomBorder} />
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.card,
    ...SHADOWS.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.blueOpacity10,
  },
  cardHorizontal: {
    width: 350,
    marginHorizontal: SIZES.padding.sm,
  },
  cardVertical: {
    width: '100%',
    marginVertical: SIZES.padding.sm,
  },
  cardHeader: {
    padding: SIZES.padding.md,
    backgroundColor: COLORS.backgroundBlue,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: SIZES.margin.xs,
  },
  regBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.xs,
    borderRadius: SIZES.radius.sm,
  },
  regBadgeText: {
    ...FONTS.captionBold,
    color: COLORS.white,
    fontSize: SIZES.font.sm,
  },
  schemeBadge: {
    backgroundColor: COLORS.goldPrimary,
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: SIZES.padding.xs,
    borderRadius: SIZES.radius.sm,
  },
  schemeBadgeText: {
    ...FONTS.caption,
    color: COLORS.white,
    fontSize: SIZES.font.xs,
  },
  dueBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: SIZES.padding.xs,
    borderRadius: SIZES.radius.sm,
  },
  dueBadgeText: {
    ...FONTS.captionBold,
    color: COLORS.white,
    fontSize: SIZES.font.xs,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.goldOpacity30,
  },
  cardContent: {
    padding: SIZES.padding.lg,
  },
  contentHorizontal: {
    padding: SIZES.padding.md,
  },
  contentVertical: {
    padding: SIZES.padding.lg,
  },
  nameSection: {
    marginBottom: SIZES.margin.lg,
  },
  nameText: {
    ...FONTS.h3,
    color: COLORS.primary,
    marginBottom: SIZES.margin.xs,
  },
  schemeText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    fontSize: SIZES.font.sm,
  },
  amountSection: {
    flexDirection: "row",
    marginBottom: SIZES.margin.lg,
    gap: SIZES.margin.sm,
  },
  amountSectionHorizontal: {
    marginBottom: SIZES.margin.md,
  },
  amountCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.backgroundSecondary,
    padding: SIZES.padding.sm,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.blueOpacity10,
  },
  bonusCard: {
    backgroundColor: COLORS.goldLight,
    borderColor: COLORS.goldOpacity30,
  },
  amountLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.xs,
    fontSize: SIZES.font.xs,
  },
  bonusLabel: {
    ...FONTS.caption,
    color: COLORS.textGoldDark,
    marginBottom: SIZES.margin.xs,
    fontSize: SIZES.font.xs,
  },
  amountValue: {
    ...FONTS.h4,
    color: COLORS.primary,
    fontSize: SIZES.font.lg,
  },
  bonusValue: {
    ...FONTS.h4,
    color: COLORS.goldDark,
    fontSize: SIZES.font.lg,
  },
  installmentRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: SIZES.margin.xs,
  },
  installmentPaid: {
    ...FONTS.h4,
    color: COLORS.primary,
    fontSize: SIZES.font.lg,
  },
  installmentDivider: {
    ...FONTS.body,
    color: COLORS.textTertiary,
  },
  installmentTotal: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
    fontSize: SIZES.font.lg,
  },
  dateSection: {
    flexDirection: "row",
    marginBottom: SIZES.margin.md,
    gap: SIZES.margin.md,
  },
  dateSectionHorizontal: {
    marginBottom: SIZES.margin.sm,
  },
  dateCard: {
    flex: 1,
    alignItems: "center",
  },
  dateDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
  },
  dateLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.xs,
  },
  dateValue: {
    ...FONTS.bodyMedium,
    color: COLORS.textPrimary,
  },
  dueDateSection: {
    alignItems: "center",
    marginBottom: SIZES.margin.lg,
  },
  dueDateLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },
  dueDateValue: {
    ...FONTS.captionBold,
    color: COLORS.primary,
  },
  buttonsSection: {
    flexDirection: "row",
    gap: SIZES.margin.md,
  },
  buttonsSectionHorizontal: {
    gap: SIZES.margin.sm,
  },
  viewButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    ...SHADOWS.xs,
  },
  viewButtonText: {
    ...FONTS.bodyBold,
    color: COLORS.primary,
    fontSize: SIZES.font.md,
  },
  payButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    ...SHADOWS.xs,
  },
  payButtonDue: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  payButtonText: {
    ...FONTS.bodyBold,
    color: COLORS.white,
    fontSize: SIZES.font.md,
  },
  bottomBorder: {
    height: 3,
    backgroundColor: COLORS.primary,
  },
});

export default SchemeCard;