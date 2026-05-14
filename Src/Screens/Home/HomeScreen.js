// screens/HomeScreen.js
import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, SafeAreaView, ActivityIndicator, Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import { COLORS, FONTS, SIZES, SHADOWS, moderateScale } from '../../Utills/AppTheme';
import HomeHeaderRedesigned from '../../Components/MainHeader/MainHeader';
import SliderComponent from '../../Components/Slider/Slider';
import SchemeDetailsCard from '../../Components/SchemeDetailsCard/SchemeDetailsCard';
import SchemesList from '../../Components/SchemeCard/SchemeCard';
import PushNotificationService from '../../Services/PushNotificationService';
import {
  registerForPushNotificationsAsync,
  wasTokenSent,
  markTokenAsSent,
  getStoredPushToken,
} from '../../Helpers/NotificationHelper';
import BottomTab from '../../Components/BottomTab/BottomTab';
import MainPageWithYouTube from '../../Components/Youtube/Youtube';

// ─── Contact constants ───────────────────────────────────────────────────────
const CONTACT_PHONE = '9600972227';
const CONTACT_EMAIL = 'sandiyafoundationchennaillp@gmail.com';

// ─── Welcome highlights ───────────────────────────────────────────────────────
const HIGHLIGHTS = [
  { icon: 'verified',       color: '#C9A227', label: 'BIS Hallmark',    value: '916 Gold'     },
  { icon: 'date-range',     color: '#7B6FA0', label: 'Flexible Plans',  value: '6–24 Months'  },
  { icon: 'account-balance-wallet', color: '#2A9D8F', label: 'Easy EMI', value: 'From ₹500/mo' },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

const WelcomeSection = () => (
  <View style={styles.welcomeCard}>
    <Text style={styles.welcomeEyebrow}>Welcome to</Text>
    <Text style={styles.welcomeHeading}>The Digital Home of{'\n'}Jai Guru Jewellers</Text>
    <Text style={styles.welcomeBody}>
      Trusted by families across Chennai for over a decade. We bring you
      transparent, flexible gold &amp; silver saving schemes — right in your pocket.
    </Text>

    <View style={styles.divider} />

    <View style={styles.highlightsRow}>
      {HIGHLIGHTS.map((h, i) => (
        <View key={i} style={styles.highlightItem}>
          <View style={[styles.highlightIconWrap, { backgroundColor: h.color + '1F' }]}>
            <Icon name={h.icon} size={moderateScale(22)} color={h.color} />
          </View>
          <Text style={styles.highlightLabel}>{h.label}</Text>
          <Text style={styles.highlightValue}>{h.value}</Text>
        </View>
      ))}
    </View>
  </View>
);

const NeedHelpCard = () => {
  const callPhone = () => Linking.openURL(`tel:${CONTACT_PHONE}`);
  const openEmail = () => Linking.openURL(`mailto:${CONTACT_EMAIL}`);

  return (
    <View style={styles.helpCard}>
      <View style={styles.helpHeader}>
        <View style={styles.helpIconWrap}>
          <Icon
            name="support-agent"
            size={moderateScale(22)}
            color={COLORS.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.helpTitle}>Need Help?</Text>

          <Text style={styles.helpSubtitle}>
            We're here to help anytime. Reach us at{' '}
            <Text onPress={callPhone} style={{ color: COLORS.primary }}>
              {CONTACT_PHONE}
            </Text>{' '}
            or{' '}
            <Text onPress={openEmail} style={{ color: COLORS.primary }}>
              {CONTACT_EMAIL}
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

const HomeScreen = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);

  const [notificationStatus, setNotificationStatus] = useState('checking');
  const [userId, setUserId] = useState(null);

  useEffect(() => { getUserData(); }, []);
  useEffect(() => { if (userId) handlePushNotificationRegistration(); }, [userId]);

  const getUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.id || user.userId);
      } else {
        setNotificationStatus('skipped');
      }
    } catch {
      setNotificationStatus('failed');
    }
  };

  const handlePushNotificationRegistration = async () => {
    try {
      setNotificationStatus('registering');
      const existingToken = await getStoredPushToken();
      if (existingToken) {
        const tokenSent = await wasTokenSent();
        if (!tokenSent) await sendTokenToServer(existingToken);
        else setNotificationStatus('registered');
      } else {
        const token = await registerForPushNotificationsAsync(userId);
        if (token) await sendTokenToServer(token);
        else setNotificationStatus('failed');
      }
    } catch {
      setNotificationStatus('failed');
    }
  };

  const sendTokenToServer = async (token) => {
    try {
      const success = await PushNotificationService.sendPushTokenToServer(token, userId);
      if (success) { await markTokenAsSent(); setNotificationStatus('registered'); }
      else setNotificationStatus('failed');
    } catch {
      setNotificationStatus('failed');
    }
  };

  const renderNotificationBanner = () => {
    if (notificationStatus === 'registered' || notificationStatus === 'skipped') return null;
    const isLoading = notificationStatus === 'checking' || notificationStatus === 'registering';
    const isFailed  = notificationStatus === 'failed';
    return (
      <TouchableOpacity
        style={[styles.banner, isFailed ? styles.bannerError : styles.bannerLoading]}
        onPress={isFailed ? handlePushNotificationRegistration : null}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <>
            <ActivityIndicator size="small" color={COLORS.white} />
            <Text style={styles.bannerText}>Setting up notifications…</Text>
          </>
        ) : (
          <>
            <Icon name="notifications-off" size={SIZES.icon.md} color={COLORS.white} />
            <Text style={styles.bannerText}>Enable notifications to receive updates</Text>
            <Text style={styles.bannerAction}>Tap to retry</Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <HomeHeaderRedesigned
        onNotificationPress={() => navigation.navigate('NotificationScreen')}
        onLogoPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
      />

      {renderNotificationBanner()}

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Slider */}
        <SliderComponent />

        {/* ── Welcome Section (new) ── */}
        <WelcomeSection />

        {/* Scheme Summary Cards */}
        <SchemeDetailsCard layout="horizontal" />

        {/* Scheme List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Our Schemes</Text>
        </View>
        <SchemesList />

        {/* YouTube Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Promotions & Updates</Text>
        </View>
        <View style={styles.youtubeWrapper}>
          <MainPageWithYouTube />
        </View>

        {/* ── Need Help Card (new) ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
        </View>
        <NeedHelpCard />

        <View style={{ height: moderateScale(8) }} />
      </ScrollView>

      <BottomTab activeScreen="HOME" />
    </SafeAreaView>
  );
};

export default HomeScreen;

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  scrollContent: {
    paddingBottom: SIZES.tabBar.height,
    paddingTop: SIZES.padding.sm,
  },

  // ── Notification Banner ──
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SIZES.padding.container,
    marginTop: SIZES.margin.sm,
    marginBottom: SIZES.margin.xs,
    paddingVertical: SIZES.padding.sm,
    paddingHorizontal: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
    gap: SIZES.sm,
  },
  bannerLoading: { backgroundColor: COLORS.warning },
  bannerError:   { backgroundColor: COLORS.error },
  bannerText: {
    ...FONTS.bodySmall,
    color: COLORS.white,
    flex: 1,
  },
  bannerAction: {
    ...FONTS.caption,
    color: COLORS.white,
    textDecorationLine: 'underline',
    fontFamily: FONTS.family.semiBold,
  },

  // ── Section Header ──
  sectionHeader: {
    paddingHorizontal: SIZES.padding.container,
    marginTop: SIZES.margin.lg,
    marginBottom: SIZES.margin.sm,
  },
  sectionTitle: {
    ...FONTS.h5,
    color: COLORS.textPrimary,
  },

  // ── Welcome Card ──
  welcomeCard: {
    marginHorizontal: SIZES.padding.container,
    marginTop: SIZES.margin.md,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.card,
    padding: SIZES.padding.lg,
    ...SHADOWS.sm,
    marginBottom: SIZES.margin.lg,
  },
  welcomeEyebrow: {
    ...FONTS.caption,
    color: COLORS.primary,
    fontFamily: FONTS.family.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: moderateScale(4),
  },
  welcomeHeading: {
    ...FONTS.h4,
    color: COLORS.textPrimary,
    lineHeight: moderateScale(26),
    marginBottom: SIZES.margin.sm,
  },
  welcomeBody: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: moderateScale(20),
  },
  divider: {
    height: 0.5,
    backgroundColor: COLORS.border || '#E8E0D0',
    marginVertical: SIZES.margin.md,
  },
  highlightsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.margin.sm,
  },
  highlightItem: {
    flex: 1,
    alignItems: 'center',
    gap: moderateScale(4),
  },
  highlightIconWrap: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(4),
  },
  highlightLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  highlightValue: {
    ...FONTS.captionBold || FONTS.caption,
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.semiBold,
    textAlign: 'center',
  },

  // ── Need Help Card ──
  helpCard: {
    marginHorizontal: SIZES.padding.container,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.card,
    padding: SIZES.padding.lg,
    ...SHADOWS.sm,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin.sm,
    marginBottom: SIZES.margin.sm,
  },
  helpIconWrap: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.primary + '1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTitle: {
    ...FONTS.h6 || FONTS.h5,
    color: COLORS.textPrimary,
  },
  helpSubtitle: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: moderateScale(2),
  },
  helpDivider: {
    height: 0.5,
    backgroundColor: COLORS.border || '#E8E0D0',
    marginBottom: SIZES.margin.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin.sm,
    paddingVertical: SIZES.padding.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border || '#F0E8D0',
  },
  contactIconWrap: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: SIZES.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },
  contactValue: {
    ...FONTS.bodySmall,
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.semiBold,
  },

  // ── YouTube ──
  youtubeWrapper: {
    marginHorizontal: SIZES.padding.container,
    borderRadius: SIZES.radius.card,
    overflow: 'hidden',
    backgroundColor: COLORS.black,
    ...SHADOWS.md,
  },
});