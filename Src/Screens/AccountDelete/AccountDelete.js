import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, Alert, View, TouchableOpacity,
  ActivityIndicator, Text, ScrollView, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommonHeader from '../../Components/CommonHeader/CommonHeader';
import { COLORS, SIZES, FONTS, SHADOWS, verticalScale, moderateScale } from '../../Utills/AppTheme';
import { API_BASE_URL } from '../../Config/BaseUrl';
import { getUserId } from '../../Utills/AsynchStorageHelper';

const CONSEQUENCES = [
  'Your profile will be permanently removed',
  'All personal information will be deleted from our servers',
  'You will lose access to all your saved data and schemes',
  'Any ongoing transactions will be cancelled',
  'Account recovery will not be possible',
];

const CONSIDERATIONS = [
  'Complete any pending scheme payments before deletion',
  'Download any important information beforehand',
  'Clear any outstanding balances',
  'Contact support if you have any doubts',
];

function DeleteAccount() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    getUserId().then(setUserId);
  }, []);

  const confirmDelete = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This will permanently delete your account and all associated data. This action CANNOT be undone.\n\nAre you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Delete',
          style: 'destructive',
          onPress: handleDeleteAccount,
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAccount = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user/delete/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (response.ok) {
        await AsyncStorage.clear();
        Alert.alert(
          'Account Deleted',
          result.message || 'Your account has been permanently deleted.',
          [{
            text: 'OK',
            onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
          }]
        );
      } else {
        Alert.alert('Deletion Failed', result.message || 'Failed to delete account. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete account. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CommonHeader title="Delete Account" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <View style={styles.warningIconWrap}>
            <Icon name="warning" size={moderateScale(36)} color={COLORS.error} />
          </View>
          <Text style={styles.warningTitle}>Delete Your Account</Text>
          <Text style={styles.warningSubtitle}>
            This action is permanent and cannot be undone
          </Text>
        </View>

        {/* What Happens */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="info-outline" size={SIZES.icon.md} color={COLORS.error} />
            <Text style={styles.cardTitle}>What happens when you delete?</Text>
          </View>
          {CONSEQUENCES.map((item, i) => (
            <View key={i} style={styles.listRow}>
              <Icon name="remove-circle-outline" size={SIZES.icon.sm} color={COLORS.error} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Important Considerations */}
        <View style={[styles.card, styles.cardWarning]}>
          <View style={styles.cardHeader}>
            <Icon name="priority-high" size={SIZES.icon.md} color={COLORS.warning} />
            <Text style={styles.cardTitle}>Before you delete</Text>
          </View>
          {CONSIDERATIONS.map((item, i) => (
            <View key={i} style={styles.listRow}>
              <Icon name="check-circle-outline" size={SIZES.icon.sm} color={COLORS.warning} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Final Warning */}
        <View style={styles.finalWarning}>
          <Icon name="error-outline" size={SIZES.icon.lg} color={COLORS.error} />
          <Text style={styles.finalWarningText}>
            Once deleted, your account and all data cannot be recovered.
          </Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={[styles.deleteBtn, loading && styles.btnDisabled]}
          onPress={confirmDelete}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <>
              <Icon name="delete-forever" size={SIZES.icon.md} color={COLORS.white} />
              <Text style={styles.deleteBtnText}>Delete My Account</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
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

  // Warning Banner
  warningBanner: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    marginBottom: SIZES.margin.md,
    borderWidth: 1.5,
    borderColor: COLORS.error + '40',
    ...SHADOWS.sm,
  },
  warningIconWrap: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.error + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.margin.sm,
  },
  warningTitle: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.font.xxl,
    color: COLORS.error,
    marginBottom: SIZES.xs,
  },
  warningSubtitle: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.lg,
    marginBottom: SIZES.margin.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    ...SHADOWS.sm,
  },
  cardWarning: {
    borderLeftColor: COLORS.warning,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin.sm,
    gap: SIZES.sm,
  },
  cardTitle: {
    fontFamily: FONTS.family.semiBold,
    fontSize: SIZES.font.lg,
    color: COLORS.textPrimary,
    flex: 1,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.sm,
    gap: SIZES.sm,
  },
  listText: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: SIZES.font.md * 1.5,
  },

  // Final Warning
  finalWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '10',
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.lg,
    marginBottom: SIZES.margin.lg,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
    gap: SIZES.sm,
  },
  finalWarningText: {
    fontFamily: FONTS.family.semiBold,
    fontSize: SIZES.font.md,
    color: COLORS.error,
    flex: 1,
    lineHeight: SIZES.font.md * 1.5,
  },

  // Buttons
  deleteBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    borderRadius: SIZES.radius.button,
    paddingVertical: SIZES.padding.lg,
    marginBottom: SIZES.margin.sm,
    gap: SIZES.sm,
    ...SHADOWS.md,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  deleteBtnText: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.font.lg,
    color: COLORS.white,
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radius.button,
    paddingVertical: SIZES.padding.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  cancelBtnText: {
    fontFamily: FONTS.family.semiBold,
    fontSize: SIZES.font.lg,
    color: COLORS.textSecondary,
  },
});

export default DeleteAccount;
