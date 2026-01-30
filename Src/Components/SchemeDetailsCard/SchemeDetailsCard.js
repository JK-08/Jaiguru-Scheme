import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { useAccountDetails } from "../../Hooks/useGetAllDetails";
import {
  COLORS,
  SIZES,
  FONTS,
  SHADOWS,
  COMMON_STYLES,
} from "../../Utills/AppTheme";
import { useNavigation } from "@react-navigation/native";

export default function SchemeDetailsCard() {
  const { primaryAccount, loading, error } = useAccountDetails();
  const navigation = useNavigation();

  // Button handlers
  const handleViewDetails = () => {
    navigation.navigate("MemberCreation");
    console.log("View details pressed for:", primaryAccount?.regNo);
    // Add your navigation or modal logic here
  };

  const handlePayNow = () => {
    console.log("Pay now pressed for:", primaryAccount?.regNo);
    // Add your payment logic here
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!primaryAccount) {
    return (
      <View style={styles.center}>
        <Text style={styles.noAccountText}>No account found</Text>
      </View>
    );
  }

  const {
    regNo,
    groupCode,
    pName,
    joinDate,
    maturityDate,
    totalAmount,
    bonusAmount,
    schemeSummary,
  } = primaryAccount;

  const insPaid = schemeSummary?.schemaSummaryTransBalance?.insPaid || "0";
  const instalment = schemeSummary?.instalment || "0";

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dateString.split("T")[0];
  };

  return (
    <View style={styles.card}>
      {/* Header with Gradient Border */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.regBadge}>
            <Text style={styles.regBadgeText}>
              {regNo} - {groupCode}
            </Text>
          </View>
        </View>
        <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
          {pName}
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Amount Section */}
      <View style={styles.amountSection}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Paid</Text>
          <Text style={styles.amountValue}>
            ₹{totalAmount?.toFixed(0) || "0.00"}
          </Text>
        </View>

        <View style={[styles.amountCard, styles.bonusCard]}>
          <Text style={styles.bonusLabel}>Bonus</Text>
          <Text style={styles.bonusValue}>
            ₹{bonusAmount?.toFixed(0) || "0.00"}
          </Text>
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

      {/* Date Section */}
      <View style={styles.dateSection}>
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

      {/* Buttons Section */}
      <View style={styles.buttonsSection}>
        <TouchableOpacity 
          style={styles.viewButton} 
          onPress={handleViewDetails}
          activeOpacity={0.7}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.payButton} 
          onPress={handlePayNow}
          activeOpacity={0.7}
        >
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
      </View>

      {/* Decorative Bottom Border */}
      <View style={styles.bottomBorder} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding.container,
  },

  errorText: {
    ...FONTS.body,
    color: COLORS.error,
    textAlign: "center",
  },

  noAccountText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  card: {
    backgroundColor: COLORS.white,
    margin: SIZES.margin.lg,
    borderRadius: SIZES.radius.card,
    ...SHADOWS.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.blueOpacity10,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZES.padding.lg,
    backgroundColor: COLORS.backgroundBlue,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.margin.sm,
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
    fontSize: SIZES.font.md,
  },

  nameText: {
    ...FONTS.h4,
    color: COLORS.primary,
  },

  divider: {
    height: 2,
    backgroundColor: COLORS.goldPrimary,
  },

  amountSection: {
    flexDirection: "row",
    padding: SIZES.padding.lg,
    justifyContent: "space-between",
    gap: SIZES.margin.sm,
  },

  amountCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.backgroundSecondary,
    padding: SIZES.padding.md,
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
  },

  bonusValue: {
    ...FONTS.h4,
    color: COLORS.goldDark,
  },

  installmentRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: SIZES.margin.xs,
  },

  installmentPaid: {
    ...FONTS.h4,
    color: COLORS.primary,
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
    paddingHorizontal: SIZES.padding.lg,
    paddingBottom: SIZES.padding.lg,
    gap: SIZES.margin.md,
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

  // New Styles for Buttons Section
  buttonsSection: {
    flexDirection: "row",
    paddingHorizontal: SIZES.padding.lg,
    paddingBottom: SIZES.padding.lg,
    gap: SIZES.margin.md,
  },

  viewButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
    alignItems: "center",
    justifyContent: "center",
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
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    ...SHADOWS.xs,
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