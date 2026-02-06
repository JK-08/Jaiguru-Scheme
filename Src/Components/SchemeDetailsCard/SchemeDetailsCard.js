import React from "react";
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  RefreshControl
} from "react-native";
import { useAccountDetails } from "../../Hooks/useGetAllDetails";
import {
  COLORS,
  SIZES,
  FONTS,
  SHADOWS,
} from "../../Utills/AppTheme";
import { useNavigation } from "@react-navigation/native";

export default function SchemeDetailsCard() {
  const { accounts, loading, error, refetch } = useAccountDetails();
  const [refreshing, setRefreshing] = React.useState(false);
  const navigation = useNavigation();

  // Pull-to-refresh handler
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch?.(); // Assuming your hook has a refetch function
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Button handlers
  const handleViewDetails = (account) => {
    navigation.navigate("MemberCreation", { account });
    console.log("View details pressed for:", account?.regNo);
  };

  const handlePayNow = (account) => {
    console.log("Pay now pressed for:", account?.regNo);
    // Add your payment logic here
  };

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dateString.split("T")[0];
  };

  // Calculate total amount across all accounts
  const calculateTotalAmount = () => {
    return accounts?.reduce((total, account) => {
      return total + (account.totalAmount || 0);
    }, 0);
  };

  // Render loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your schemes...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render empty state
  if (!accounts || accounts.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.noAccountText}>No schemes found</Text>
        <Text style={styles.emptySubtext}>
          You don't have any active schemes yet.
        </Text>
        <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate("CreateScheme")}>
          <Text style={styles.createButtonText}>Create New Scheme</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render individual account card
  const renderAccountCard = ({ item: account, index }) => {
    const {
      regNo,
      groupCode,
      pName,
      joinDate,
      maturityDate,
      totalAmount,
      bonusAmount,
      schemeSummary,
      nextDueDate,
    } = account;

    const insPaid = schemeSummary?.schemaSummaryTransBalance?.insPaid || "0";
    const instalment = schemeSummary?.instalment || "0";
    const schemeSName = schemeSummary?.schemeSName || "N/A";
    const schemeName = schemeSummary?.schemeName || "N/A";

    // Check if payment is due
    const isPaymentDue = nextDueDate && new Date(nextDueDate) <= new Date();

    return (
      <View style={[styles.card, index !== accounts.length - 1 && styles.cardMargin]}>
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

        {/* Divider */}
        <View style={styles.divider} />

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Name and Scheme */}
          <View style={styles.nameSection}>
            <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
              {pName}
            </Text>
            <Text style={styles.schemeText} numberOfLines={2} ellipsizeMode="tail">
              {schemeName}
            </Text>
          </View>

          {/* Amount Section */}
          <View style={styles.amountSection}>
            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>Total Paid</Text>
              <Text style={styles.amountValue}>
                ₹{totalAmount?.toFixed(0) || "0"}
              </Text>
            </View>

            <View style={[styles.amountCard, styles.bonusCard]}>
              <Text style={styles.bonusLabel}>Bonus</Text>
              <Text style={styles.bonusValue}>
                ₹{bonusAmount?.toFixed(0) || "0"}
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

          {/* Next Due Date */}
          {nextDueDate && (
            <View style={styles.dueDateSection}>
              <Text style={styles.dueDateLabel}>
                Next Due: <Text style={styles.dueDateValue}>{formatDate(nextDueDate)}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonsSection}>
          <TouchableOpacity 
            style={styles.viewButton} 
            onPress={() => handleViewDetails(account)}
            activeOpacity={0.7}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.payButton, isPaymentDue && styles.payButtonDue]} 
            onPress={() => handlePayNow(account)}
            activeOpacity={0.7}
          >
            <Text style={styles.payButtonText}>
              {isPaymentDue ? 'Pay Now' : 'Make Payment'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Decorative Bottom Border */}
        <View style={styles.bottomBorder} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Summary Header */}
      <View style={styles.summaryHeader}>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryTitle}>My Schemes</Text>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{accounts.length}</Text>
              <Text style={styles.statLabel}>Schemes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{calculateTotalAmount().toFixed(0)}</Text>
              <Text style={styles.statLabel}>Total Invested</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Scrollable list of cards */}
      <FlatList
        data={accounts}
        renderItem={renderAccountCard}
        keyExtractor={(item, index) => 
          `${item.regNo}-${item.groupCode}-${index}-${item.schemeSummary?.schemeId || '0'}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListFooterComponent={<View style={styles.footer} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  summaryHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding.lg,
    paddingTop: SIZES.padding.xl,
    paddingBottom: SIZES.padding.lg,
    borderBottomLeftRadius: SIZES.radius.lg,
    borderBottomRightRadius: SIZES.radius.lg,
    ...SHADOWS.md,
  },
  
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  summaryTitle: {
    ...FONTS.h2,
    color: COLORS.white,
  },
  
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white + '20',
    padding: SIZES.padding.sm,
    borderRadius: SIZES.radius.md,
  },
  
  statItem: {
    alignItems: 'center',
    paddingHorizontal: SIZES.padding.md,
  },
  
  statValue: {
    ...FONTS.h3,
    color: COLORS.white,
    fontSize: SIZES.font.xl,
  },
  
  statLabel: {
    ...FONTS.caption,
    color: COLORS.white + 'CC',
    fontSize: SIZES.font.xs,
  },
  
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: COLORS.white + '40',
  },
  
  listContainer: {
    padding: SIZES.padding.lg,
  },
  
  cardMargin: {
    marginBottom: SIZES.margin.lg,
  },
  
  card: {
    backgroundColor: COLORS.white,
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
    padding: SIZES.padding.md,
    backgroundColor: COLORS.backgroundBlue,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: 'wrap',
    gap: SIZES.margin.xs,
    flex: 1,
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

  cardContent: {
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

  divider: {
    height: 1,
    backgroundColor: COLORS.goldOpacity30,
  },

  amountSection: {
    flexDirection: "row",
    marginBottom: SIZES.margin.lg,
    gap: SIZES.margin.sm,
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
    alignItems: 'center',
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

  // Loading, Error & Empty States
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding.container,
  },

  loadingText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin.md,
    textAlign: "center",
  },

  errorText: {
    ...FONTS.body,
    color: COLORS.error,
    textAlign: "center",
    marginBottom: SIZES.margin.md,
  },

  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding.xl,
    paddingVertical: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
    marginTop: SIZES.margin.md,
  },

  retryButtonText: {
    ...FONTS.bodyBold,
    color: COLORS.white,
  },

  noAccountText: {
    ...FONTS.h3,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SIZES.margin.sm,
  },

  emptySubtext: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SIZES.margin.lg,
  },

  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding.xl,
    paddingVertical: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
  },

  createButtonText: {
    ...FONTS.bodyBold,
    color: COLORS.white,
  },

  footer: {
    height: SIZES.padding.lg,
  },
});