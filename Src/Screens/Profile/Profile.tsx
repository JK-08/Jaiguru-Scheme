// Src/Screens/Profile/Profile.tsx
//
// New "Profile" tab — pulled out of the side Sidebar drawer so it's reachable
// from the bottom tab bar directly. Shows the logged-in member's data (name,
// email, mobile, referral code) plus the account actions that used to only
// live in the drawer: Reset MPIN, Privacy Policy, Terms & Conditions, Delete
// Account, and Logout.
import React, { useCallback, useState } from 'react';
import { View, ScrollView, Image, ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CommonHeader from '../../Components/CommonHeader/CommonHeader';
import BottomTab from '../../Components/BottomTab/BottomTab';
import { AppText, AppCard, AppBadge } from '../../Components/ui/appcomponents';
import { getAuthSession, getUserData, getUserId, clearAuthData } from '../../Utills/AsynchStorageHelper';
import { clearFCMToken } from '../../Helpers/NotificationHelper';
import theme from '../../Utills/AppTheme';

const { COLORS, SIZES } = theme;

interface ProfileUser {
  id: string | number | null;
  name: string;
  email: string;
  contactNumber: string;
  picture: string;
  referralCode: string;
  loginType: string;
}

const EMPTY_USER: ProfileUser = {
  id: null,
  name: '',
  email: '',
  contactNumber: '',
  picture: '',
  referralCode: '',
  loginType: '',
};

interface MenuAction {
  key: string;
  label: string;
  icon: string;
  danger?: boolean;
  onPress: (navigation: any) => void;
}

const MENU_ACTIONS: MenuAction[] = [
  {
    key: 'resetmpin',
    label: 'Reset MPIN',
    icon: 'lock-reset',
    onPress: (navigation) => navigation.navigate('ResetMPIN'),
  },
  {
    key: 'privacy',
    label: 'Privacy Policy',
    icon: 'lock-outline',
    onPress: (navigation) => navigation.navigate('PrivacyPolicy'),
  },
  {
    key: 'terms',
    label: 'Terms & Conditions',
    icon: 'description',
    onPress: (navigation) => navigation.navigate('TermsAndConditions'),
  },
  {
    key: 'help',
    label: 'Help & Support',
    icon: 'support-agent',
    onPress: (navigation) => navigation.navigate('HelpCenter'),
  },
  {
    key: 'deleteaccount',
    label: 'Delete Account',
    icon: 'delete-outline',
    danger: true,
    onPress: (navigation) => navigation.navigate('DeleteAccount'),
  },
];

const getAvatarColor = (name: string): string => {
  const colors = ['#4A90E2', '#50C878', '#FF6B6B', '#FFA500', '#9B59B6', '#1ABC9C', '#E74C3C', '#3498DB', '#2ECC71'];
  if (!name) return colors[0];
  const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  return colors[Math.abs(hash) % colors.length];
};

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const [user, setUser] = useState<ProfileUser>(EMPTY_USER);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const [userData, session, userId] = await Promise.all([getUserData(), getAuthSession(), getUserId()]);
      const info: Record<string, any> = userData || session?.user || {};
      setUser({
        id: info.userId || info.userid || userId,
        name: info.username || info.name || 'User',
        email: info.email || '',
        contactNumber: info.contactNumber || info.mobileNumber || '',
        picture: info.picture || '',
        referralCode: info.referralCode || '',
        loginType: info.loginType || 'normal',
      });
    } catch (e) {
      console.log('Failed to load profile user data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh whenever the tab regains focus (e.g. after coming back from
  // ResetMPIN) so any changes are reflected without a full app restart.
  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await clearAuthData();
          // Local-only cleanup: the backend has no device-deactivation
          // endpoint yet, so this just stops treating the cached FCM token as
          // "already registered" — the next login will re-register it fresh.
          await clearFCMToken();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <CommonHeader title="Profile" showBack={false} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.profileGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.white} />
          ) : (
            <View style={styles.profileRow}>
              {user.picture ? (
                <Image source={{ uri: user.picture }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: getAvatarColor(user.name) }]}>
                  <AppText variant="h2" color={COLORS.white}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </AppText>
                </View>
              )}

              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <AppText variant="h4" color={COLORS.white} numberOfLines={1}>
                    {user.name}
                  </AppText>
                  {user.loginType === 'GOOGLE' && (
                    <Icon name="verified" size={16} color={COLORS.success} style={{ marginLeft: 6 }} />
                  )}
                </View>
                {!!user.email && (
                  <AppText variant="bodySmall" color={COLORS.whiteOpacity90 as any} numberOfLines={1} style={{ marginTop: 2 }}>
                    {user.email}
                  </AppText>
                )}
                {!!user.contactNumber && (
                  <AppText variant="bodySmall" color={COLORS.whiteOpacity80 as any} numberOfLines={1} style={{ marginTop: 2 }}>
                    {user.contactNumber}
                  </AppText>
                )}
                {!!user.referralCode && (
                  <View style={{ marginTop: SIZES.xs, alignSelf: 'flex-start' }}>
                    <AppBadge label={`Referral: ${user.referralCode}`} variant="gold" size="sm" />
                  </View>
                )}
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Actions */}
        <AppCard style={styles.menuCard} padded={false}>
          {MENU_ACTIONS.map((item, index) => (
            <View key={item.key}>
              <TouchableOpacity style={styles.menuRow} activeOpacity={0.7} onPress={() => item.onPress(navigation)}>
                <View
                  style={[
                    styles.menuIconWrap,
                    { backgroundColor: item.danger ? COLORS.error + '12' : COLORS.primaryPale },
                  ]}
                >
                  <Icon name={item.icon} size={20} color={item.danger ? COLORS.error : COLORS.primary} />
                </View>
                <AppText variant="body" color={item.danger ? COLORS.error : COLORS.textPrimary} style={{ flex: 1 }}>
                  {item.label}
                </AppText>
                <Icon name="chevron-right" size={20} color={COLORS.textTertiary} />
              </TouchableOpacity>
              {index < MENU_ACTIONS.length - 1 && <View style={styles.menuDivider} />}
            </View>
          ))}
        </AppCard>

        {/* Logout */}
        <AppCard style={styles.logoutCard} onPress={handleLogout}>
          <View style={styles.logoutRow}>
            <Icon name="logout" size={20} color={COLORS.error} />
            <AppText variant="bodyBold" color={COLORS.error} style={{ marginLeft: SIZES.sm }}>
              Logout
            </AppText>
          </View>
        </AppCard>

        <AppText variant="caption" color={COLORS.textTertiary} align="center" style={{ marginTop: SIZES.md }}>
          App Version 1.2.0
        </AppText>

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomTab activeScreen="PROFILE" />
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  content: {
    padding: SIZES.padding.lg,
  },
  profileGradient: {
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.lg,
    marginBottom: SIZES.margin.lg,
    minHeight: 100,
    justifyContent: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    marginRight: SIZES.md,
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    marginRight: SIZES.md,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuCard: {
    marginBottom: SIZES.margin.lg,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.padding.md,
    paddingHorizontal: SIZES.padding.lg,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginLeft: SIZES.padding.lg + 36 + SIZES.md,
  },
  logoutCard: {
    alignItems: 'center',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
