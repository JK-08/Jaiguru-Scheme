import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  FlatList,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import theme from '../../Utills/AppTheme';
import CommonHeader from '../../Components/CommonHeader/CommonHeader';
import { AppButton } from '../../Components/ui/appcomponents';
import { Account, PaymentHistoryItem } from '../../types/Account/Account';

const { COLORS } = theme;

interface AnimatedProgressBarProps {
  percentage: number;
  color?: string;
}

const AnimatedProgressBar = ({ percentage, color = COLORS.contentBrand }: AnimatedProgressBarProps) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: percentage, duration: 900, useNativeDriver: false }).start();
  }, [percentage]);

  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={pbStyles.track}>
      <Animated.View style={[pbStyles.fill, { width, backgroundColor: color }]} />
    </View>
  );
};

const pbStyles = StyleSheet.create({
  track: { height: 8, backgroundColor: COLORS.surfaceMuted, borderRadius: 99, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 99 },
});

interface StatPillProps {
  label: string;
  value: string;
  valueColor?: string;
  bgColor?: string;
}

const StatPill = ({ label, value, valueColor, bgColor }: StatPillProps) => (
  <View style={[pillStyles.pill, bgColor ? { backgroundColor: bgColor } : undefined]}>
    <Text style={pillStyles.label}>{label}</Text>
    <Text style={[pillStyles.value, valueColor ? { color: valueColor } : undefined]}>{value}</Text>
  </View>
);

const pillStyles = StyleSheet.create({
  pill: { flex: 1, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderRadius: 14, backgroundColor: COLORS.surfaceMuted, marginHorizontal: 4 },
  label: { fontSize: 10, color: COLORS.contentSecondary, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 16, fontWeight: '700', color: COLORS.contentPrimary },
});

interface TagChipProps {
  icon?: string;
  label: string;
  value: string;
  danger?: boolean;
}

const TagChip = ({ icon, label, value, danger }: TagChipProps) => (
  <View style={[tagStyles.chip, danger && tagStyles.chipDanger]}>
    {icon ? <Text style={tagStyles.icon}>{icon}</Text> : null}
    <Text style={tagStyles.label}>{label} </Text>
    <Text style={[tagStyles.value, danger && tagStyles.valueDanger]}>{value}</Text>
  </View>
);

const tagStyles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceMuted, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5, marginRight: 6, marginBottom: 6 },
  chipDanger: { backgroundColor: '#FFF1F1' },
  icon: { fontSize: 12, marginRight: 3 },
  label: { fontSize: 11, color: COLORS.contentSecondary },
  value: { fontSize: 11, fontWeight: '700', color: COLORS.contentPrimary },
  valueDanger: { color: '#D32F2F' },
});

interface SectionTitleProps {
  icon: string;
  title: string;
  badge?: number;
}

const SectionTitle = ({ icon, title, badge }: SectionTitleProps) => (
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
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  icon: { fontSize: 16, marginRight: 6 },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.contentPrimary, flex: 1 },
  badge: { backgroundColor: COLORS.brand, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 11, color: '#fff', fontWeight: '700' },
});

const formatDate = (ds?: string) => {
  if (!ds || ds === '1900-01-01 00:00:00.0') return 'N/A';
  if (ds.includes('T')) return ds.split('T')[0];
  if (ds.includes(' ')) return ds.split(' ')[0];
  return ds;
};

const formatDateShort = (ds?: string) => {
  const d = formatDate(ds);
  if (d === 'N/A') return d;
  const [, m, day] = d.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${parseInt(day)} ${months[parseInt(m) - 1]}`;
};

const formatCurrency = (val: string | number | undefined) => {
  const n = parseFloat(String(val)) || 0;
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

interface RouteParams {
  schemeData: Account | Account[];
  fromScreen?: string;
}

export default function SchemeDetails() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { schemeData, fromScreen } = (route.params as RouteParams) || {};
  const [expandAddress, setExpandAddress] = useState(false);

  if (!schemeData) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📭</Text>
          <Text style={styles.errorText}>No scheme data available</Text>
          <AppButton label="← Go Back" onPress={() => navigation.goBack()} variant="gold" size="md" style={styles.goBackButton} />
        </View>
      </View>
    );
  }

  const data: Account = Array.isArray(schemeData) ? schemeData[0] : schemeData;

  const {
    regNo,
    groupCode,
    amount,
    pName,
    joinDate,
    maturityDate,
    totalAmount = 0,
    schemeSummary,
    personalInfo,
    nextDueDate,
    paymentHistoryList = [],
    remainingDueDates = [],
    schemeClosedSummary,
    lastPaidDate,
    remainingDays = 0,
  } = data;

  const { schemeId, schemeName, schemeSName, instalment = '0', schemaSummaryTransBalance = {}, totalWeight = '0', lastWeight = '0' } = schemeSummary || {};
  const { amtrecd = '0.0', insPaid = '0' } = schemaSummaryTransBalance;
  const { personalId, doorNo, address1, address2, area, city, state, pinCode, mobile, mobile2 } = personalInfo || {};

  const isInstalmentsComplete = parseInt(insPaid) >= parseInt(instalment);

  const isClosed = !!schemeClosedSummary?.doClose && schemeClosedSummary.doClose !== '1900-01-01 00:00:00.0';
  const isPaymentDue = !isClosed && !!nextDueDate && new Date(nextDueDate) <= new Date();

  const progressPercentage = useMemo(() => {
    const paid = parseInt(insPaid) || 0;
    const total = parseInt(instalment) || 1;
    return Math.min((paid / total) * 100, 100);
  }, [insPaid, instalment]);

  const statusConfig = isClosed
    ? { bg: COLORS.successSurface, text: COLORS.success, label: '✓ Scheme Closed', sub: `Closed: ${formatDateShort(schemeClosedSummary?.closeDate)}` }
    : isPaymentDue
      ? { bg: COLORS.dangerSurface, text: COLORS.danger, label: '⚠ Payment Overdue', sub: `Due: ${formatDateShort(nextDueDate)}` }
      : { bg: COLORS.brandSubtle, text: COLORS.contentBrand, label: '● Active', sub: `${remainingDays > 0 ? `${remainingDays} days remaining` : 'On track'}` };

  const handleViewReceipt = (payment: PaymentHistoryItem) => {
    navigation.navigate('PaymentReceipt', {
      paymentData: payment,
      schemeData: data,
      customerData: { pName, mobile, address: [doorNo, address1, city, state, pinCode].filter(Boolean).join(', ') },
    });
  };

  const handleMakePayment = () => {
    navigation.navigate('Paynow', {
      accountData: data,
      fromScreen: 'SchemePassbook',
      regNo,
      groupCode,
      memberName: pName,
      schemeName,
      schemeShortName: schemeSName,
      schemeId,
      totalAmount: totalAmount || 0,
      amount: amount || 0,
      nextDueDate,
      installmentsPaid: insPaid || '0',
      totalInstallments: instalment || '0',
      joinDate,
      maturityDate,
    });
  };

  const renderPaymentItem = ({ item, index }: { item: PaymentHistoryItem; index: number }) => (
    <TouchableOpacity style={styles.paymentRow} onPress={() => handleViewReceipt(item)} activeOpacity={0.75}>
      <View style={styles.paymentIndex}>
        <Text style={styles.paymentIndexText}>{index + 1}</Text>
      </View>

      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.paymentDate}>{formatDate(item.updateTime)}</Text>
        <Text style={styles.paymentInstall}>Installment #{item.installment || '—'}</Text>
        {item.chqBank && item.chqBank !== 'N/A' && <Text style={styles.paymentMode}>via {item.chqBank}</Text>}
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.paymentAmount}>{formatCurrency(item.amount)}</Text>
        {item.weight && parseFloat(item.weight) > 0 && <Text style={styles.paymentWeight}>{parseFloat(item.weight).toFixed(3)}g</Text>}
        <View style={styles.paidBadge}>
          <Text style={styles.paidBadgeText}>Paid</Text>
        </View>
      </View>

      <View style={styles.receiptButton}>
        <Text style={{ fontSize: 14 }}>👁</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      <View style={[styles.statusBanner, { backgroundColor: statusConfig.bg }]}>
        <View>
          <Text style={[styles.statusLabel, { color: statusConfig.text }]}>{statusConfig.label}</Text>
          <Text style={[styles.statusSub, { color: `${statusConfig.text}CC` }]}>{statusConfig.sub}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: statusConfig.text }]} />
      </View>

      <View style={styles.card}>
        <View style={[styles.cardStrip, { backgroundColor: COLORS.brand }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.schemeNameLg} numberOfLines={1}>
              {schemeName}
            </Text>
            <Text style={styles.schemeIdSm}>
              {schemeSName} • {groupCode}-{regNo}
            </Text>
          </View>
          <View style={styles.regPill}>
            <Text style={styles.regPillText}>#{regNo}</Text>
          </View>
        </View>

        <View style={{ padding: 16 }}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Instalments</Text>
            <Text style={styles.progressCount}>
              <Text style={{ color: COLORS.contentBrand, fontWeight: '700' }}>{insPaid}</Text>
              {' / '}
              {instalment}
            </Text>
          </View>
          <AnimatedProgressBar percentage={progressPercentage} color={isClosed ? COLORS.success : isPaymentDue ? COLORS.danger : COLORS.brand} />
          <Text style={styles.progressPct}>{Math.round(progressPercentage)}% complete</Text>

          <View style={styles.statsRow}>
            <StatPill label="Monthly Amt" value={formatCurrency(amount)} valueColor={COLORS.contentBrand} />
            <StatPill label="Paid Amount" value={formatCurrency(amtrecd)} valueColor="#2E7D32" bgColor="#E8F5E9" />
            <StatPill label="Total Weight" value={`${parseFloat(totalWeight).toFixed(3)}g`} valueColor={COLORS.warning} bgColor={COLORS.warningSurface} />
          </View>

          <View style={styles.lastWeightRow}>
            <Text style={styles.lastWeightLabel}>⚖️ Last Installment Weight</Text>
            <Text style={styles.lastWeightValue}>{parseFloat(lastWeight).toFixed(3)} g</Text>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateChip}>
              <Text style={styles.dateChipIcon}>🗓</Text>
              <View>
                <Text style={styles.dateChipLabel}>Join Date</Text>
                <Text style={styles.dateChipValue}>{formatDate(joinDate)}</Text>
              </View>
            </View>

            <View style={[styles.dateChip, { backgroundColor: COLORS.accentSoft }]}>
              <Text style={styles.dateChipIcon}>🎯</Text>
              <View>
                <Text style={styles.dateChipLabel}>Maturity</Text>
                <Text style={[styles.dateChipValue, { color: COLORS.contentBrand }]}>{formatDate(maturityDate)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.tagRow}>
            {lastPaidDate && <TagChip icon="✅" label="Last paid" value={formatDateShort(lastPaidDate)} />}
            {nextDueDate && <TagChip icon="🔔" label="Next due" value={formatDateShort(nextDueDate)} danger={isPaymentDue} />}
            {remainingDays > 0 && <TagChip label="" value={`${remainingDays}d left`} />}
          </View>
        </View>
      </View>

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
          </View>

          <View style={styles.contactRow}>
            {mobile && (
              <View style={styles.phonePill}>
                <Text style={{ fontSize: 12 }}>📞</Text>
                <Text style={styles.phoneText}>{mobile}</Text>
              </View>
            )}
            {mobile2 && mobile2 !== mobile && (
              <View style={[styles.phonePill, { backgroundColor: COLORS.accentTint }]}>
                <Text style={{ fontSize: 12 }}>📱</Text>
                <Text style={[styles.phoneText, { color: COLORS.contentBrand }]}>{mobile2}</Text>
              </View>
            )}
          </View>

          {(address1 || city) && (
            <TouchableOpacity style={styles.addressBox} onPress={() => setExpandAddress((p) => !p)} activeOpacity={0.8}>
              <Text style={{ fontSize: 13 }}>📍</Text>
              <Text style={styles.addressText} numberOfLines={expandAddress ? undefined : 1}>
                {[doorNo, address1, address2, area, city, state, pinCode].filter(Boolean).join(', ')}
              </Text>
              <Text style={styles.expandIcon}>{expandAddress ? '▲' : '▼'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {paymentHistoryList.length > 0 && (
        <View style={styles.sectionHeader}>
          <SectionTitle icon="💳" title="Payment History" badge={paymentHistoryList.length} />
        </View>
      )}
    </>
  );

  const renderFooter = () => (
    <>
      {remainingDueDates.length > 0 && (
        <View style={styles.card}>
          <View style={{ padding: 16 }}>
            <SectionTitle icon="📅" title="Upcoming Dues" badge={remainingDueDates.length} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {remainingDueDates.map((date, i) => (
                <View key={i} style={[styles.dueChip, i === 0 && styles.dueChipNext]}>
                  <Text style={[styles.dueChipText, i === 0 && styles.dueChipTextNext]}>{formatDateShort(date)}</Text>
                  {i === 0 && <Text style={styles.nextLabel}> Next</Text>}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {!isClosed && !isInstalmentsComplete && (
        <AppButton
          label={isPaymentDue ? '🚨 Pay Now — Overdue' : '+ Add Payment'}
          onPress={handleMakePayment}
          variant="gold"
          size="lg"
          style={[styles.ctaButton, isPaymentDue && styles.ctaButtonDue]}
        />
      )}

      <View style={{ height: 24 }} />
    </>
  );

  return (
    <View style={styles.container}>
      <CommonHeader
        title="Scheme Details"
        subtitle={`${schemeSName} • ${groupCode}-${regNo}`}
        onBackPress={() =>
          fromScreen === 'payment'
            ? navigation.navigate('AllSchemes')
            : navigation.goBack()
        }
      />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.accentTint },
  listContent: { padding: 16, paddingBottom: 32 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { fontSize: 16, color: COLORS.danger, marginBottom: 20, textAlign: 'center' },
  goBackButton: { paddingHorizontal: 28 },
  statusBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 14 },
  statusLabel: { fontSize: 15, fontWeight: '700' },
  statusSub: { fontSize: 12, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
    overflow: 'hidden',
  },
  cardStrip: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 14 },
  schemeNameLg: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 2 },
  schemeIdSm: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  regPill: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 10 },
  regPillText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  progressLabel: { fontSize: 12, color: COLORS.contentSecondary },
  progressCount: { fontSize: 13, color: COLORS.contentSecondary },
  progressPct: { fontSize: 11, color: COLORS.contentSecondary, marginTop: 4, marginBottom: 14, textAlign: 'right' },
  statsRow: { flexDirection: 'row', marginBottom: 10, marginHorizontal: -4 },
  lastWeightRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.warningSurface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  lastWeightLabel: { fontSize: 12, color: COLORS.contentSecondary },
  lastWeightValue: { fontSize: 13, fontWeight: '700', color: COLORS.warningText },
  dateRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  dateChip: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accentTint, borderRadius: 14, padding: 10, gap: 8 },
  dateChipIcon: { fontSize: 18 },
  dateChipLabel: { fontSize: 10, color: COLORS.contentSecondary, textTransform: 'uppercase', letterSpacing: 0.4 },
  dateChipValue: { fontSize: 14, fontWeight: '700', color: COLORS.contentBrand, marginTop: 1 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  sectionHeader: { marginBottom: 2 },
  memberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  contactRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.brand, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  memberName: { fontSize: 16, fontWeight: '700', color: COLORS.contentPrimary },
  memberId: { fontSize: 12, color: COLORS.contentSecondary, marginTop: 1 },
  phonePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6, gap: 5 },
  phoneText: { fontSize: 12, fontWeight: '600', color: '#2E7D32' },
  addressBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 10, gap: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  addressText: { flex: 1, fontSize: 12, color: COLORS.contentSecondary, lineHeight: 18 },
  expandIcon: { fontSize: 10, color: COLORS.contentSecondary },
  paymentRow: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  paymentIndex: { width: 28, height: 28, borderRadius: 14, backgroundColor: `${COLORS.accent}15`, justifyContent: 'center', alignItems: 'center' },
  paymentIndexText: { fontSize: 12, fontWeight: '700', color: COLORS.contentBrand },
  paymentDate: { fontSize: 13, fontWeight: '600', color: COLORS.contentPrimary },
  paymentInstall: { fontSize: 11, color: COLORS.contentSecondary, marginTop: 2 },
  paymentMode: { fontSize: 10, color: COLORS.contentSecondary, marginTop: 1 },
  paymentWeight: { fontSize: 11, color: COLORS.warningText, fontWeight: '600', marginBottom: 2 },
  paymentAmount: { fontSize: 15, fontWeight: '800', color: COLORS.contentPrimary },
  paidBadge: { backgroundColor: '#E8F5E9', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4, alignSelf: 'flex-end' },
  paidBadgeText: { fontSize: 10, fontWeight: '700', color: '#2E7D32' },
  receiptButton: { marginLeft: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  emptyBox: { backgroundColor: '#fff', borderRadius: 20, padding: 32, alignItems: 'center', marginTop: 8 },
  emptyText: { fontSize: 14, color: COLORS.contentSecondary },
  dueChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  dueChipNext: { backgroundColor: COLORS.warningSurface, borderWidth: 1, borderColor: COLORS.warning },
  dueChipText: { fontSize: 13, fontWeight: '600', color: COLORS.contentPrimary },
  dueChipTextNext: { color: COLORS.warningText },
  nextLabel: { fontSize: 10, fontWeight: '700', color: COLORS.warningText },
  ctaButton: { marginTop: 4 },
  ctaButtonDue: { backgroundColor: '#C62828' },
});
