import React from 'react';
import { View, ScrollView, StyleSheet, Text, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CommonHeader from '../../Components/CommonHeader/CommonHeader';
import PremiumBackground from '../../Components/PremiumBackground/PremiumBackground';
import { COLORS, SIZES, FONTS, ELEVATION, moderateScale, verticalScale } from '../../Utills/AppTheme';

interface Step {
  icon: string;
  text: string;
}

const STEPS_JOIN: Step[] = [
  { icon: 'account-plus',        text: 'Click "Join Now" on the Gold Scheme' },
  { icon: 'currency-inr',        text: 'Enter the amount you wish to start with' },
  { icon: 'credit-card-outline', text: 'Make payment using any mode' },
  { icon: 'target',              text: 'Set saving target (optional)' },
  { icon: 'check-circle-outline',text: 'Continue your savings' },
];

const STEPS_REDEEM: Step[] = [
  { icon: 'store-outline',   text: 'Visit Jaiguru Jewellery' },
  { icon: 'form-select',     text: 'Submit redemption request form' },
  { icon: 'diamond-outline', text: 'Choose your jewel' },
];

function KnowMore() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const {} = (route.params as any) || {};

  const StepItem = ({ icon, text }: Step) => (
    <View style={styles.stepRow}>
      <View style={styles.stepIconWrap}>
        <Icon name={icon} size={moderateScale(22)} color={COLORS.contentBrand} />
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );

  const SectionTitle = ({ label }: { label: string }) => (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleBar} />
      <Text style={styles.sectionTitle}>{label}</Text>
    </View>
  );

  const SubHeading = ({ label }: { label: string }) => (
    <Text style={styles.subHeading}>{label}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <PremiumBackground />
      <CommonHeader title="Know More" onBackPress={() => navigation.goBack()} transparent borderBottom={false} shadow={false} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroIconWrap}>
            <Icon name="gold" size={moderateScale(40)} color={COLORS.contentOnBrand} />
          </View>
          <Text style={styles.heroTitle}>GOLD SCHEME</Text>
          <Text style={styles.heroSubtitle}>Jaiguru Jewellers</Text>
        </View>

        {/* Overview */}
        <View style={styles.card}>
          <Text style={styles.description}>
            Choose our Gold Scheme for a convenient and flexible way to save in gold through the app.
            Earn additional gold weight on your savings and redeem for attractive gold jewellery at
            Jaiguru Jewellers stores across Tamil Nadu.
          </Text>
        </View>

        {/* Process to Join */}
        <View style={styles.card}>
          <SectionTitle label="Process to Join" />
          {STEPS_JOIN.map((s, i) => <StepItem key={i} icon={s.icon} text={s.text} />)}
        </View>

        {/* Process to Redeem */}
        <View style={styles.card}>
          <SectionTitle label="Process to Redeem" />
          {STEPS_REDEEM.map((s, i) => <StepItem key={i} icon={s.icon} text={s.text} />)}
        </View>

        {/* Features & Benefits */}
        <View style={styles.card}>
          <SectionTitle label="Features & Benefits" />

          <SubHeading label="Minimum Amount" />
          <Text style={styles.description}>
            The minimum amount that can be saved is ₹100. Users can save any amount above ₹100
            at any time during the first 330 days from the date of the first payment.
          </Text>

          <SubHeading label="Scheme Period" />
          <Text style={styles.description}>
            The scheme period of 330 days begins on the date of the first payment. Users can save
            any number of times during this period. The scheme matures on the 330th day.
          </Text>


        </View>

        {/* Redemption */}
        <View style={styles.card}>
          <SectionTitle label="Redemption" />
          <Text style={styles.description}>
            Saved gold weight can be redeemed as gold jewellery at any Jaiguru store across Tamil Nadu
            or online at digigoldsupport@jaiguru.com. GST and applicable charges (wastage, marking,
            stone, hallmark) are payable by the user.
          </Text>
          <Text style={styles.description}>
            Minimum lock-in period is 30 days. Only the registered person can redeem with original
            ID proof (Aadhaar, PAN, Driving License, or Voter ID). Redemption must be done within
            35 days from the date of maturity.
          </Text>
        </View>

        {/* Refunds */}
        <View style={[styles.card, styles.cardWarning]}>
          <View style={styles.warningRow}>
            <Icon name="alert-circle-outline" size={SIZES.icon.md} color={COLORS.danger} />
            <Text style={styles.warningTitle}>No Refund Policy</Text>
          </View>
          <Text style={styles.description}>
            The paid amount will not be refunded under any circumstances. If the customer decides
            not to redeem the gold after enrolling, no refund of the amount paid will be provided.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceMuted,
  },
  content: {
    padding: SIZES.space.lg,
    paddingBottom: verticalScale(40),
  },

  // Hero
  heroBanner: {
    alignItems: 'center',
    backgroundColor: COLORS.brand,
    borderRadius: SIZES.radius.lg,
    paddingVertical: SIZES.space.xl,
    marginBottom: SIZES.space.md,
    ...ELEVATION.brandGlow,
  },
  heroIconWrap: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: SIZES.radius.pill,
    backgroundColor: COLORS.whiteAlpha20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.space.sm,
  },
  heroTitle: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.text.xxl,
    color: COLORS.contentOnBrand,
    letterSpacing: 2,
  },
  heroSubtitle: {
    fontFamily: FONTS.family.medium,
    fontSize: SIZES.text.md,
    color: COLORS.whiteAlpha90,
    marginTop: SIZES.space.xs,
  },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SIZES.space.lg,
    marginBottom: SIZES.space.md,
    ...ELEVATION.raised,
  },
  cardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },

  // Section Title
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.space.sm,
  },
  sectionTitleBar: {
    width: moderateScale(4),
    height: moderateScale(18),
    backgroundColor: COLORS.brand,
    borderRadius: SIZES.radius.pill,
    marginRight: SIZES.space.sm,
  },
  sectionTitle: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.text.lg,
    color: COLORS.contentBrand,
  },

  // Sub Heading
  subHeading: {
    fontFamily: FONTS.family.semiBold,
    fontSize: SIZES.text.md,
    color: COLORS.contentPrimary,
    marginTop: SIZES.space.sm,
    marginBottom: SIZES.space.xs,
  },

  // Description
  description: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.text.md,
    color: COLORS.contentSecondary,
    lineHeight: SIZES.text.md * 1.6,
    marginBottom: SIZES.space.sm,
  },

  // Step
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: SIZES.radius.sm,
    padding: SIZES.space.md,
    marginBottom: SIZES.space.sm,
    gap: SIZES.space.sm,
  },
  stepIconWrap: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: SIZES.radius.pill,
    borderWidth: 1.5,
    borderColor: COLORS.borderAccent,
    borderStyle: 'dashed',
    backgroundColor: COLORS.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontFamily: FONTS.family.medium,
    fontSize: SIZES.text.md,
    color: COLORS.contentPrimary,
    flex: 1,
  },

  // Warning
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.space.sm,
    marginBottom: SIZES.space.sm,
  },
  warningTitle: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.text.lg,
    color: COLORS.danger,
  },


});

export default KnowMore;
