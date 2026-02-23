import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useAccountDetails } from "../../Hooks/useGetAllDetails";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../Utills/AppTheme";
import { useNavigation } from "@react-navigation/native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.90;
const CARD_SPACING = SIZES.padding.lg;

export default function SchemeDetailsCard({ layout = "horizontal" }) {
  const { accounts, loading, error, refetch } = useAccountDetails();
  const [refreshing, setRefreshing] = React.useState(false);
  const navigation = useNavigation();

  // Memoized values - must be called unconditionally
  const totalAmount = useMemo(() => {
    return accounts?.reduce((total, account) => total + (account.totalAmount || 0), 0) || 0;
  }, [accounts]);

  const accountCount = useMemo(() => accounts?.length || 0, [accounts]);

  // Memoize list props unconditionally
  const listProps = useMemo(() => {
    if (layout === "vertical") {
      return {
        numColumns: 1,
        horizontal: false,
        contentContainerStyle: styles.listContainerVertical,
        showsVerticalScrollIndicator: true,
        showsHorizontalScrollIndicator: false,
        keyExtractor: (item, index) => `${item.regNo}-${item.groupCode}-${index}`,
      };
    } else {
      return {
        numColumns: undefined,
        horizontal: true,
        contentContainerStyle: styles.listContainer,
        showsHorizontalScrollIndicator: false,
        showsVerticalScrollIndicator: false,
        snapToInterval: CARD_WIDTH + CARD_SPACING,
        decelerationRate: "fast",
        snapToAlignment: "center",
        keyExtractor: (item) => `${item.regNo}-${item.groupCode}-${item.schemeSummary?.schemeId || "0"}`,
      };
    }
  }, [layout]);

  // Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch?.();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleViewAll = useCallback(() => {
    navigation.navigate("AllSchemes");
  }, [navigation]);

  const handleViewDetails = useCallback((account) => {
    // Navigate to SchemeDetails page with the account data
    navigation.navigate("SchemePassbook", { 
      schemeData: account,
      fromScreen: "SchemeDetailsCard"
    });
  }, [navigation]);

  const handlePayNow = useCallback((account) => {
    console.log("Pay now pressed for:", account?.regNo);
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    return dateString.split("T")[0];
  }, []);

  // Render individual account card
  const renderAccountCard = useCallback(({ item: account }) => {
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

    return (
      <View style={[
        styles.cardWrapper,
        layout === "vertical" && styles.cardWrapperVertical
      ]}>
        <View style={[
          styles.card,
          layout === "vertical" && styles.cardVertical
        ]}>
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
          <View style={[
            styles.cardContent,
            layout === "vertical" && styles.cardContentVertical
          ]}>
            <View style={styles.nameSection}>
              <Text style={styles.nameText}>{pName}</Text>
              <Text style={styles.schemeText} numberOfLines={2}>
                {schemeName}
              </Text>
            </View>

            <View style={[
              styles.amountSection,
              layout === "vertical" && styles.amountSectionVertical
            ]}>
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

            <View style={[
              styles.dateSection,
              layout === "vertical" && styles.dateSectionVertical
            ]}>
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

            <View style={[
              styles.buttonsSection,
              layout === "vertical" && styles.buttonsSectionVertical
            ]}>
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
                  {isPaymentDue ? "Pay Now" : "Make Payment"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomBorder} />
        </View>
      </View>
    );
  }, [formatDate, handleViewDetails, handlePayNow, layout]);


  // Header Component
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeftSection}>
        <Text style={styles.headerTitle}>My Schemes</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{accountCount}</Text>
        </View>
      </View>
      {accounts && accounts.length > 0 && (
        <TouchableOpacity onPress={handleViewAll} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Loading State
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your schemes...</Text>
        </View>
      </View>
    );
  }

  // Error State
  if (error) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.center}>
          <Text style={styles.errorText}>Failed to load schemes</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Empty State
  if (!accounts || accounts.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.center}>
          <Text style={styles.noAccountText}>No schemes found</Text>
          <Text style={styles.emptySubtext}>
            You don't have any active schemes yet.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      layout === "vertical" && styles.containerVertical
    ]}>
       {layout === "horizontal" && (renderHeader())}

      {/* Scrollable list */}
      <FlatList
        data={accounts}
        renderItem={renderAccountCard}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListFooterComponent={layout === "horizontal" ? <View style={styles.footer} /> : null}
        initialNumToRender={layout === "vertical" ? 5 : 2}
        maxToRenderPerBatch={layout === "vertical" ? 10 : 3}
        windowSize={layout === "vertical" ? 10 : 5}
        removeClippedSubviews={true}
        {...listProps}
      />
    </View>
  );
}

// Keep the styles object exactly as it was in your original code
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerVertical: {
    paddingBottom: SIZES.padding.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.padding.lg,
    paddingTop: SIZES.padding.xl,
    paddingBottom: SIZES.padding.md,
  },
  headerLeftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.margin.sm,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.primary,
  },
  countBadge: {
    backgroundColor: COLORS.primary + "20",
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: 2,
    borderRadius: SIZES.radius.sm,
    borderWidth: 1,
    borderColor: COLORS.primary + "40",
  },
  countText: {
    ...FONTS.captionBold,
    color: COLORS.primary,
    fontSize: SIZES.font.sm,
  },
  viewAllButton: {
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.xs,
  },
  viewAllText: {
    ...FONTS.h5,
    color: COLORS.primary,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding.lg,
    marginBottom: SIZES.margin.lg,
    padding: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
    ...SHADOWS.xs,
    borderWidth: 1,
    borderColor: COLORS.blueOpacity10,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SIZES.padding.xs,
  },
  statValue: {
    ...FONTS.h3,
    color: COLORS.primary,
    fontSize: SIZES.font.xl,
    marginBottom: 2,
  },
  statLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    fontSize: SIZES.font.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.divider,
  },
  listContainer: {
    paddingHorizontal: SIZES.padding.lg,
    paddingBottom: SIZES.padding.lg,
  },
  listContainerVertical: {
    paddingHorizontal: SIZES.padding.lg,
    paddingBottom: SIZES.padding.xl,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
  },
  cardWrapperVertical: {
    width: "100%",
    marginRight: 0,
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
  cardVertical: {
    marginHorizontal: 0,
  },
  cardContent: {
    padding: SIZES.padding.lg,
  },
  cardContentVertical: {
    padding: SIZES.padding.md,
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
  amountSectionVertical: {
    flexDirection: "row",
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
  dateSectionVertical: {
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
  buttonsSection: {
    flexDirection: "row",
    gap: SIZES.margin.md,
  },
  buttonsSectionVertical: {
    marginTop: SIZES.margin.md,
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
  },
  errorText: {
    ...FONTS.body,
    color: COLORS.error,
    marginBottom: SIZES.margin.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding.xl,
    paddingVertical: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
  },
  retryButtonText: {
    ...FONTS.bodyBold,
    color: COLORS.white,
  },
  noAccountText: {
    ...FONTS.h3,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.sm,
  },
  emptySubtext: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.lg,
    textAlign: "center",
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
    width: SIZES.padding.lg,
  },
});