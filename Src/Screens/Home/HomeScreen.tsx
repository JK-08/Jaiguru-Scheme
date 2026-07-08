// screens/HomeScreen.tsx
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import theme from '../../Utills/AppTheme';
import HomeHeaderRedesigned from '../../Components/MainHeader/MainHeader';
import SliderComponent from '../../Components/Slider/Slider';
import SchemeDetailsCard from '../../Components/SchemeDetailsCard/SchemeDetailsCard';
import SchemesList from '../../Components/SchemeCard/SchemeCard';
import { deviceService } from '../../api/services/deviceService';
import { getFCMToken } from '../../Helpers/NotificationHelper';
import BottomTab from '../../Components/BottomTab/BottomTab';
import MainPageWithYouTube from '../../Components/Youtube/Youtube';
import { AppText, AppCard, ScreenWrapper } from '../../Components/ui/appcomponents';

const { COLORS, FONTS, SIZES, moderateScale } = theme;

const CONTACT_PHONE = '9600972227';
const CONTACT_EMAIL = 'sandiyafoundationchennaillp@gmail.com';

interface Highlight {
  icon: string;
  color: string;
  label: string;
  value: string;
}

const HIGHLIGHTS: Highlight[] = [
  { icon: 'verified', color: '#C9A227', label: 'BIS Hallmark', value: '916 Gold' },
  { icon: 'date-range', color: '#7B6FA0', label: 'Flexible Plans', value: '6–24 Months' },
  { icon: 'account-balance-wallet', color: '#2A9D8F', label: 'Easy EMI', value: 'From ₹500/mo' },
];

const WelcomeSection = () => (
  <AppCard variant="default" style={styles.welcomeCard}>
    <AppText variant="captionBold" color={COLORS.primary} style={styles.welcomeEyebrow}>
      WELCOME TO
    </AppText>
    <AppText variant="h4" style={styles.welcomeHeading}>
      {'The Digital Home of\nJai Guru Jewellers'}
    </AppText>
    <AppText variant="body" color={COLORS.textSecondary} style={styles.welcomeBody}>
      Trusted by families across Chennai for over a decade. We bring you transparent, flexible gold &amp; silver saving
      schemes — right in your pocket.
    </AppText>

    <View style={styles.divider} />

    <View style={styles.highlightsRow}>
      {HIGHLIGHTS.map((h, i) => (
        <View key={i} style={styles.highlightItem}>
          <View style={[styles.highlightIconWrap, { backgroundColor: `${h.color}1F` }]}>
            <Icon name={h.icon} size={moderateScale(22)} color={h.color} />
          </View>
          <AppText variant="caption" align="center">
            {h.label}
          </AppText>
          <AppText variant="captionBold" align="center">
            {h.value}
          </AppText>
        </View>
      ))}
    </View>
  </AppCard>
);

const NeedHelpCard = () => {
  const callPhone = () => Linking.openURL(`tel:${CONTACT_PHONE}`);
  const openEmail = () => Linking.openURL(`mailto:${CONTACT_EMAIL}`);

  return (
    <AppCard variant="default" style={styles.helpCard}>
      <View style={styles.helpHeader}>
        <View style={styles.helpIconWrap}>
          <Icon name="support-agent" size={moderateScale(22)} color={COLORS.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <AppText variant="h6">Need Help?</AppText>

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
    </AppCard>
  );
};

type NotificationStatus = 'checking' | 'registering' | 'registered' | 'skipped' | 'failed';

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const scrollViewRef = useRef<ScrollView>(null);

  const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>('checking');
  const [userId, setUserId] = useState<string | number | null>(null);

  useEffect(() => {
    getUserData();
  }, []);
  useEffect(() => {
    if (userId) handlePushNotificationRegistration();
  }, [userId]);

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
      // Clear old Expo token if present
      await AsyncStorage.multiRemove(['pushToken', 'tokenSentToServer']);
      const token = await getFCMToken();
      if (token) await sendTokenToServer(token);
      else setNotificationStatus('failed');
    } catch {
      setNotificationStatus('failed');
    }
  };

  const sendTokenToServer = async (token: string) => {
    try {
      const success = await deviceService.registerDevice(token, userId ?? '');
      if (success) setNotificationStatus('registered');
      else setNotificationStatus('failed');
    } catch {
      setNotificationStatus('failed');
    }
  };

  const renderNotificationBanner = () => {
    if (notificationStatus === 'registered' || notificationStatus === 'skipped') return null;
    const isLoading = notificationStatus === 'checking' || notificationStatus === 'registering';
    const isFailed = notificationStatus === 'failed';
    return (
      <TouchableOpacity
        style={[styles.banner, isFailed ? styles.bannerError : styles.bannerLoading]}
        onPress={isFailed ? handlePushNotificationRegistration : undefined}
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
    <ScreenWrapper
      scroll
      backgroundColor={COLORS.backgroundSecondary}
      paddingHorizontal={0}
      paddingTop={SIZES.padding.sm}
      paddingBottom={SIZES.tabBar.height}
      header={
        <>
          <HomeHeaderRedesigned
            onNotificationPress={() => navigation.navigate('NotificationScreen')}
            onLogoPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
          />
          {renderNotificationBanner()}
        </>
      }
      footer={<BottomTab activeScreen="HOME" />}
    >
      <SliderComponent />

      <WelcomeSection />

      <SchemeDetailsCard layout="horizontal" />

      <View style={styles.sectionHeader}>
        <AppText variant="h5">Our Schemes</AppText>
      </View>
      <SchemesList />

      <View style={styles.sectionHeader}>
        <AppText variant="h5">Promotions &amp; Updates</AppText>
      </View>
      <View style={styles.youtubeWrapper}>
        <MainPageWithYouTube />
      </View>

      <View style={styles.sectionHeader}>
        <AppText variant="h5">Need Help?</AppText>
      </View>
      <NeedHelpCard />

      <View style={{ height: moderateScale(8) }} />
    </ScreenWrapper>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
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
  bannerError: { backgroundColor: COLORS.error },
  bannerText: { ...FONTS.bodySmall, color: COLORS.white, flex: 1 },
  bannerAction: { ...FONTS.caption, color: COLORS.white, textDecorationLine: 'underline', fontFamily: FONTS.family.semiBold },
  sectionHeader: { paddingHorizontal: SIZES.padding.container, marginTop: SIZES.margin.lg, marginBottom: SIZES.margin.sm },
  welcomeCard: { marginHorizontal: SIZES.padding.container, marginTop: SIZES.margin.md, marginBottom: SIZES.margin.lg },
  welcomeEyebrow: { textTransform: 'uppercase', letterSpacing: 1, marginBottom: moderateScale(4) },
  welcomeHeading: { lineHeight: moderateScale(26), marginBottom: SIZES.margin.sm },
  welcomeBody: { lineHeight: moderateScale(20) },
  divider: { height: 0.5, backgroundColor: COLORS.border || '#E8E0D0', marginVertical: SIZES.margin.md },
  highlightsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: SIZES.margin.sm },
  highlightItem: { flex: 1, alignItems: 'center', gap: moderateScale(4) },
  highlightIconWrap: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(4),
  },
  helpCard: { marginHorizontal: SIZES.padding.container },
  helpHeader: { flexDirection: 'row', alignItems: 'center', gap: SIZES.margin.sm, marginBottom: SIZES.margin.sm },
  helpIconWrap: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: SIZES.radius.md,
    backgroundColor: `${COLORS.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpSubtitle: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: moderateScale(2) },
  youtubeWrapper: {
    marginHorizontal: SIZES.padding.container,
    borderRadius: SIZES.radius.card,
    overflow: 'hidden',
    backgroundColor: COLORS.black,
    ...theme.SHADOWS.md,
  },
});
