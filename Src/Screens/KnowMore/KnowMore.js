import React from 'react';
import { View, ScrollView, StyleSheet, Text, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CommonHeader from '../../Components/CommonHeader/CommonHeader';
import { COLORS, SIZES, FONTS, SHADOWS, moderateScale, verticalScale } from '../../Utills/AppTheme';

const STEPS_JOIN = [
  { icon: 'account-plus',        text: 'Click "Join Now" on the Gold Scheme' },
  { icon: 'currency-inr',        text: 'Enter the amount you wish to start with' },
  { icon: 'credit-card-outline', text: 'Make payment using any mode' },
  { icon: 'target',              text: 'Set saving target (optional)' },
  { icon: 'check-circle-outline',text: 'Continue your savings' },
];

const STEPS_REDEEM = [
  { icon: 'store-outline',   text: 'Visit Jaiguru Jewellery' },
  { icon: 'form-select',     text: 'Submit redemption request form' },
  { icon: 'diamond-outline', text: 'Choose your jewel' },
];

function KnowMore() {
  const route = useRoute();
  const navigation = useNavigation();
  const { } = route.params || {};

  const StepItem = ({ icon, text }) => (
    <View style={styles.stepRow}>
      <View style={styles.stepIconWrap}>
        <Icon name={icon} size={moderateScale(22)} color={COLORS.primary} />
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );

  const SectionTitle = ({ label }) => (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleBar} />
      <Text style={styles.sectionTitle}>{label}</Text>
    </View>
  );

  const SubHeading = ({ label }) => (
    <Text style={styles.subHeading}>{label}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CommonHeader title="Know More" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroIconWrap}>
            <Icon name="gold" size={moderateScale(40)} color={COLORS.secondary} />
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
            <Icon name="alert-circle-outline" size={SIZES.icon.md} color={COLORS.error} />
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
    backgroundColor: COLORS.backgroundSecondary,
  },
  content: {
    padding: SIZES.padding.lg,
    paddingBottom: verticalScale(40),
  },

  // Hero
  heroBanner: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.lg,
    paddingVertical: SIZES.padding.xl,
    marginBottom: SIZES.margin.md,
    ...SHADOWS.blue,
  },
  heroIconWrap: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.whiteOpacity20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.margin.sm,
  },
  heroTitle: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.font.xxl,
    color: COLORS.secondary,
    letterSpacing: 2,
  },
  heroSubtitle: {
    fontFamily: FONTS.family.medium,
    fontSize: SIZES.font.md,
    color: COLORS.whiteOpacity70,
    marginTop: SIZES.xs,
  },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.lg,
    marginBottom: SIZES.margin.md,
    ...SHADOWS.sm,
  },
  cardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },

  // Section Title
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin.sm,
  },
  sectionTitleBar: {
    width: moderateScale(4),
    height: moderateScale(18),
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.full,
    marginRight: SIZES.sm,
  },
  sectionTitle: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.font.lg,
    color: COLORS.primary,
  },

  // Sub Heading
  subHeading: {
    fontFamily: FONTS.family.semiBold,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    marginTop: SIZES.sm,
    marginBottom: SIZES.xs,
  },

  // Description
  description: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    lineHeight: SIZES.font.md * 1.6,
    marginBottom: SIZES.sm,
  },

  // Step
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radius.sm,
    padding: SIZES.padding.md,
    marginBottom: SIZES.sm,
    gap: SIZES.sm,
  },
  stepIconWrap: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: SIZES.radius.full,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    backgroundColor: COLORS.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontFamily: FONTS.family.medium,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    flex: 1,
  },

  // Warning
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  warningTitle: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.font.lg,
    color: COLORS.error,
  },


});

export default KnowMore;
