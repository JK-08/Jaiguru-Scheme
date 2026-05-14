// screens/HomeScreen.js
import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, SafeAreaView, ActivityIndicator,
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


const QUICK_ACTIONS = [
  { icon: 'trending-up', color: COLORS.secondary,    label: 'Gold Rates',     route: 'Rates', params: { rateType: 'gold' } },
  { icon: 'trending-up', color: COLORS.textSecondary, label: 'Silver Rates',  route: 'Rates', params: { rateType: 'silver' } },
  { icon: 'person-add',  color: COLORS.primary,       label: 'Join Scheme',   route: 'MemberCreation', params: {} },
];

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

        {/* Scheme Summary Cards */}
        <SchemeDetailsCard layout="horizontal" />

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.route, action.params)}
              activeOpacity={0.75}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: action.color + '1A' }]}>
                <Icon name={action.icon} size={SIZES.icon.lg} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

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

        <View style={{ height: moderateScale(24) }} />
      </ScrollView>

      <BottomTab activeScreen="HOME" />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  scrollContent: {
    paddingBottom: SIZES.tabBar.height + SIZES.padding.lg,
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

  // ── Quick Actions ──
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding.container,
    gap: SIZES.margin.sm,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.card,
    paddingVertical: SIZES.padding.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  actionIconWrap: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.margin.xs,
  },
  actionLabel: {
    ...FONTS.caption,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontFamily: FONTS.family.medium,
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
