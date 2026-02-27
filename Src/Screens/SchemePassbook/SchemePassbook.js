import React, { useMemo, useState, useRef } from "react";
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
  Animated,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../Utills/AppTheme";
import CommonHeader from "../../Components/CommonHeader/CommonHeader";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Animated Progress Bar ────────────────────────────────────────────────────
const AnimatedProgressBar = ({ percentage, color = COLORS.primary }) => {
  const anim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: percentage,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={pbStyles.track}>
      <Animated.View style={[pbStyles.fill, { width, backgroundColor: color }]} />
    </View>
  );
};

const pbStyles = StyleSheet.create({
  track: {
    height: 8,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 99,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 99,
  },
});

// ─── Stat Pill ────────────────────────────────────────────────────────────────
const StatPill = ({ label, value, valueColor, bgColor }) => (
  <View style={[pillStyles.pill, bgColor && { backgroundColor: bgColor }]}>
    <Text style={pillStyles.label}>{label}</Text>
    <Text style={[pillStyles.value, valueColor && { color: valueColor }]}>{value}</Text>
  </View>
);

const pillStyles = StyleSheet.create({
  pill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: COLORS.backgroundSecondary,
    marginHorizontal: 4,
  },
  label: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
});

// ─── Tag Chip ─────────────────────────────────────────────────────────────────
const TagChip = ({ icon, label, value, danger }) => (
  <View style={[tagStyles.chip, danger && tagStyles.chipDanger]}>
    {icon ? <Text style={tagStyles.icon}>{icon}</Text> : null}
    <Text style={tagStyles.label}>{label} </Text>
    <Text style={[tagStyles.value, danger && tagStyles.valueDanger]}>{value}</Text>
  </View>
);

const tagStyles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 6,
  },
  chipDanger: {
    backgroundColor: "#FFF1F1",
  },
  icon: { fontSize: 12, marginRight: 3 },
  label: { fontSize: 11, color: COLORS.textSecondary },
  value: { fontSize: 11, fontWeight: "700", color: COLORS.textPrimary },
  valueDanger: { color: "#D32F2F" },
});

// ─── Section Title ────────────────────────────────────────────────────────────
const SectionTitle = ({ icon, title, badge }) => (
  <View style={secStyles.row}>
    <Text style={secStyles.icon}>{icon}</Text>
    <Text style={secStyles.title}>{title}</Text>
    {badge != null && (
      <View style={secStyles.badge}>
        <Text style={secStyles.badgeText}>{badge}</Text>
      </View>
    )}
  </View>
);

const secStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: { fontSize: 16, marginRight: 6 },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    flex: 1,
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 11, color: "#fff", fontWeight: "700" },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (ds) => {
  if (!ds || ds === "1900-01-01 00:00:00.0") return "N/A";
  if (ds.includes("T")) return ds.split("T")[0];
  if (ds.includes(" ")) return ds.split(" ")[0];
  return ds;
};

const formatDateShort = (ds) => {
  const d = formatDate(ds);
  if (d === "N/A") return d;
  const [y, m, day] = d.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${parseInt(day)} ${months[parseInt(m) - 1]}`;
};

const formatCurrency = (val) => {
  const n = parseFloat(val) || 0;
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SchemeDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { schemeData } = route.params || {};
  const [expandAddress, setExpandAddress] = useState(false);

  if (!schemeData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📭</Text>
          <Text style={styles.errorText}>No scheme data available</Text>
          <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
            <Text style={styles.goBackButtonText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const data = Array.isArray(schemeData) ? schemeData[0] : schemeData;

  const {
    regNo, groupCode, amount, pName, joinDate, maturityDate,
    totalAmount = 0, schemeSummary, personalInfo, nextDueDate,
    paymentHistoryList = [], remainingDueDates = [],
    schemeClosedSummary, lastPaidDate, remainingDays = 0,
  } = data;

  const { schemeId, schemeName, schemeSName, instalment = "0", schemaSummaryTransBalance = {} } = schemeSummary || {};
  const { totalAmount: transTotalAmount = "0.0", insPaid = "0" } = schemaSummaryTransBalance;
  const { personalId, doorNo, address1, address2, area, city, state, pinCode, mobile } = personalInfo || {};

  const isClosed = schemeClosedSummary?.doClose && schemeClosedSummary.doClose !== "1900-01-01 00:00:00.0";
  const isPaymentDue = !isClosed && nextDueDate && new Date(nextDueDate) <= new Date();

  const progressPercentage = useMemo(() => {
    const paid = parseInt(insPaid) || 0;
    const total = parseInt(instalment) || 1;
    return Math.min((paid / total) * 100, 100);
  }, [insPaid, instalment]);

  const statusConfig = isClosed
    ? { bg: "#E8F5E9", text: "#2E7D32", label: "✓ Scheme Closed", sub: `Closed: ${formatDateShort(schemeClosedSummary.closeDate)}` }
    : isPaymentDue
      ? { bg: "#FFEBEE", text: "#C62828", label: "⚠ Payment Overdue", sub: `Due: ${formatDateShort(nextDueDate)}` }
      : { bg: "#E3F2FD", text: COLORS.primary, label: "● Active", sub: `${remainingDays > 0 ? `${remainingDays} days remaining` : "On track"}` };

  const handleViewReceipt = (payment) => {
    navigation.navigate("PaymentReceipt", {
      paymentData: payment,
      schemeData: data,
      customerData: {
        pName,
        mobile,
        address: [doorNo, address1, city, state, pinCode].filter(Boolean).join(", "),
      },
    });
  };

  // ─── Payment Row ─────────────────────────────────────────────────────────
  const renderPaymentItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.paymentRow}
      onPress={() => handleViewReceipt(item)}
      activeOpacity={0.75}
    >
      {/* Left: index */}
      <View style={styles.paymentIndex}>
        <Text style={styles.paymentIndexText}>{index + 1}</Text>
      </View>

      {/* Middle: date + installment */}
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.paymentDate}>{formatDateShort(item.updateTime)}</Text>
        <Text style={styles.paymentInstall}>Installment #{item.installment || "—"}</Text>
      </View>

      {/* Right: amount + badge */}
      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.paymentAmount}>{formatCurrency(item.amount)}</Text>
        <View style={styles.paidBadge}>
          <Text style={styles.paidBadgeText}>Paid</Text>
        </View>
      </View>

      {/* Receipt icon */}
      <View style={styles.receiptButton}>
        <Text style={{ fontSize: 14 }}>👁</Text>
      </View>
    </TouchableOpacity>
  );

  // ─── List Header ──────────────────────────────────────────────────────────
  const renderHeader = () => (
    <>
      {/* ── Status Banner ── */}
      <View style={[styles.statusBanner, { backgroundColor: statusConfig.bg }]}>
        <View>
          <Text style={[styles.statusLabel, { color: statusConfig.text }]}>{statusConfig.label}</Text>
          <Text style={[styles.statusSub, { color: statusConfig.text + "CC" }]}>{statusConfig.sub}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: statusConfig.text }]} />
      </View>

      {/* ── Scheme Card ── */}
      <View style={styles.card}>
        {/* Header strip */}
        <View style={[styles.cardStrip, { backgroundColor: COLORS.primary }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.schemeNameLg} numberOfLines={1}>{schemeName}</Text>
            <Text style={styles.schemeIdSm}>{schemeId} - {schemeSName || groupCode}</Text>
          </View>
          <View style={styles.regPill}>
            <Text style={styles.regPillText}>{regNo}</Text>
          </View>
        </View>

        <View style={{ padding: 16 }}>
          {/* Progress */}
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Instalments</Text>
            <Text style={styles.progressCount}>
              <Text style={{ color: COLORS.primary, fontWeight: "700" }}>{insPaid}</Text>
              {" / "}{instalment}
            </Text>
          </View>
          <AnimatedProgressBar
            percentage={progressPercentage}
            color={isClosed ? "#43A047" : isPaymentDue ? "#E53935" : COLORS.primary}
          />
          <Text style={styles.progressPct}>{Math.round(progressPercentage)}% complete</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatPill label="Scheme Amt" value={formatCurrency(amount)} valueColor={COLORS.primary} />
            <StatPill label="Total Paid" value={formatCurrency(totalAmount)} valueColor="#2E7D32" bgColor="#E8F5E9" />
            {/* <StatPill
              label="Remaining"
              value={formatCurrency(parseFloat(amount || 0) - parseFloat(totalAmount || 0))}
              valueColor="#E65100"
              bgColor="#FFF3E0"
            /> */}
          </View>

          {/* Date chips */}
          <View style={styles.dateRow}>
            <View style={styles.dateChip}>
              <Text style={styles.dateChipIcon}>🗓</Text>
              <View>
                <Text style={styles.dateChipLabel}>Join Date</Text>
                <Text style={styles.dateChipValue}>{formatDateShort(joinDate)}</Text>
              </View>
            </View>

            <View style={[styles.dateChip, { backgroundColor: "#F3E5F5" }]}>
              <Text style={styles.dateChipIcon}>🎯</Text>
              <View>
                <Text style={styles.dateChipLabel}>Maturity</Text>
                <Text style={[styles.dateChipValue, { color: "#6A1B9A" }]}>{formatDateShort(maturityDate)}</Text>
              </View>
            </View>
          </View>

          {/* Tag row */}
          <View style={styles.tagRow}>
            {lastPaidDate && <TagChip icon="✅" label="Last paid" value={formatDateShort(lastPaidDate)} />}
            {nextDueDate && <TagChip icon="🔔" label="Next due" value={formatDateShort(nextDueDate)} danger={isPaymentDue} />}
            {remainingDays > 0 && <TagChip label="" value={`${remainingDays}d left`} />}
          </View>
        </View>
      </View>

      {/* ── Member Card ── */}
      <View style={styles.card}>
        <View style={{ padding: 16 }}>
          <SectionTitle icon="👤" title="Member Details" />

          <View style={styles.memberRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{pName?.charAt(0)?.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.memberName}>{pName}</Text>
              <Text style={styles.memberId}>ID: {personalId || regNo}</Text>
            </View>
            {mobile && (
              <View style={styles.phonePill}>
                <Text style={{ fontSize: 12 }}>📞</Text>
                <Text style={styles.phoneText}>{mobile}</Text>
              </View>
            )}
          </View>

          {(address1 || city) && (
            <TouchableOpacity
              style={styles.addressBox}
              onPress={() => setExpandAddress((p) => !p)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 13 }}>📍</Text>
              <Text
                style={styles.addressText}
                numberOfLines={expandAddress ? undefined : 1}
              >
                {[doorNo, address1, address2, area, city, state, pinCode].filter(Boolean).join(", ")}
              </Text>
              <Text style={styles.expandIcon}>{expandAddress ? "▲" : "▼"}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Payment History Header ── */}
      {paymentHistoryList.length > 0 && (
        <View style={styles.sectionHeader}>
          <SectionTitle icon="💳" title="Payment History" badge={paymentHistoryList.length} />
        </View>
      )}
    </>
  );

  // ─── List Footer ──────────────────────────────────────────────────────────
  const renderFooter = () => (
    <>
      {/* Upcoming Due Dates */}
      {remainingDueDates.length > 0 && (
        <View style={styles.card}>
          <View style={{ padding: 16 }}>
            <SectionTitle icon="📅" title="Upcoming Dues" badge={remainingDueDates.length} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {remainingDueDates.map((date, i) => (
                <View
                  key={i}
                  style={[
                    styles.dueChip,
                    i === 0 && styles.dueChipNext,
                  ]}
                >
                  <Text style={[styles.dueChipText, i === 0 && styles.dueChipTextNext]}>
                    {formatDateShort(date)}
                  </Text>
                  {i === 0 && <Text style={styles.nextLabel}> Next</Text>}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* CTA */}
      {/* {!isClosed && (
        <TouchableOpacity
          style={[styles.ctaButton, isPaymentDue && styles.ctaButtonDue]}
          onPress={() => console.log("Make Payment")}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaIcon}>{isPaymentDue ? "🚨" : "+"}</Text>
          <Text style={styles.ctaText}>{isPaymentDue ? "Pay Now — Overdue" : "Add Payment"}</Text>
        </TouchableOpacity>
      )} */}

      <View style={{ height: 24 }} />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <CommonHeader title="Scheme Details" />

      <FlatList
        data={paymentHistoryList}
        keyExtractor={(_, i) => `pmt-${i}`}
        renderItem={renderPaymentItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>💸</Text>
            <Text style={styles.emptyText}>No payments recorded yet</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6FA" },
  listContent: { padding: 16, paddingBottom: 32 },

  // Error
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  errorText: { fontSize: 16, color: COLORS.error, marginBottom: 20, textAlign: "center" },
  goBackButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  goBackButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  // Status Banner
  statusBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
  },
  statusLabel: { fontSize: 15, fontWeight: "700" },
  statusSub: { fontSize: 12, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 14,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
    overflow: "hidden",
  },
  cardStrip: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 14,
  },
  schemeNameLg: { fontSize: 16, fontWeight: "800", color: "#fff", marginBottom: 2 },
  schemeIdSm: { fontSize: 11, color: "rgba(255,255,255,0.75)" },
  regPill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 10,
  },
  regPillText: { fontSize: 11, color: "#fff", fontWeight: "700" },

  // Progress
  progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  progressLabel: { fontSize: 12, color: COLORS.textSecondary },
  progressCount: { fontSize: 13, color: COLORS.textSecondary },
  progressPct: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4, marginBottom: 14, textAlign: "right" },

  // Stats
  statsRow: { flexDirection: "row", marginBottom: 14, marginHorizontal: -4 },

  // Date chips
  dateRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  dateChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF5FF",
    borderRadius: 14,
    padding: 10,
    gap: 8,
  },
  dateChipIcon: { fontSize: 18 },
  dateChipLabel: { fontSize: 10, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.4 },
  dateChipValue: { fontSize: 14, fontWeight: "700", color: COLORS.primary, marginTop: 1 },

  // Tag row
  tagRow: { flexDirection: "row", flexWrap: "wrap" },

  // Member
  sectionHeader: { marginBottom: 2 },
  memberRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "800", color: "#fff" },
  memberName: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
  memberId: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  phonePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },
  phoneText: { fontSize: 12, fontWeight: "600", color: "#2E7D32" },
  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addressText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  expandIcon: { fontSize: 10, color: COLORS.textSecondary },

  // Payment row
  paymentRow: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  paymentIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  paymentIndexText: { fontSize: 12, fontWeight: "700", color: COLORS.primary },
  paymentDate: { fontSize: 13, fontWeight: "600", color: COLORS.textPrimary },
  paymentInstall: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  paymentAmount: { fontSize: 15, fontWeight: "800", color: COLORS.textPrimary },
  paidBadge: {
    backgroundColor: "#E8F5E9",
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  paidBadgeText: { fontSize: 10, fontWeight: "700", color: "#2E7D32" },
  receiptButton: {
    marginLeft: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  // Empty
  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginTop: 8,
  },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },

  // Upcoming
  dueChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  dueChipNext: { backgroundColor: "#FFF8E1", borderWidth: 1, borderColor: "#FFB300" },
  dueChipText: { fontSize: 13, fontWeight: "600", color: COLORS.textPrimary },
  dueChipTextNext: { color: "#E65100" },
  nextLabel: { fontSize: 10, fontWeight: "700", color: "#E65100" },

  // CTA
  ctaButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 4,
    ...Platform.select({
      ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  ctaButtonDue: { backgroundColor: "#C62828" },
  ctaIcon: { fontSize: 18 },
  ctaText: { fontSize: 16, fontWeight: "800", color: "#fff" },
});