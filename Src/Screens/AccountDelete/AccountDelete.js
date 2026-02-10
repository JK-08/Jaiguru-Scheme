import React, { useState ,useEffect} from 'react';
import {
  SafeAreaView,
  Alert,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MainTheme from '../../Utills/AppTheme';
import CommonHeader from '../../Components/CommonHeader/CommonHeader';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_BASE_URL } from '../../Config/BaseUrl';
import { getUserId  } from '../../Utills/AsynchStorageHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { COLORS, SIZES, FONTS, verticalScale, moderateScale } = MainTheme;

function DeleteAccount() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId();
      setUserId(id);
    };
    fetchUserId();
  }, []);

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Confirm Account Deletion',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
             
              if (!userId) {
                throw new Error('User ID not found');
              }

              // Using your specific API endpoint
              const response = await fetch(`${API_BASE_URL}/user/delete/${userId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  // Add authorization header if needed
                  // 'Authorization': `Bearer ${userData.token}`,
                },
              });

              const result = await response.json();

              if (response.ok) {
                // Clear user data from AsyncStorage
               AsyncStorage.clear();

                Alert.alert(
                  'Account Deleted Successfully',
                  result.message || 'Your account has been permanently deleted.',
                  [{ 
                    text: 'OK', 
                    onPress: () => navigation.reset({
                      index: 0,
                      routes: [{ name: 'Login' }]
                    })
                  }]
                );
              } else {
                Alert.alert(
                  'Deletion Failed', 
                  result.message || 'Failed to delete account. Please try again.'
                );
              }
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert(
                'Error', 
                'Failed to delete account. Please check your connection and try again.'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ImageBackground
          source={require('../../Assets/Company/logo.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.error} />
            <Text style={styles.loadingText}>Securely removing your data...</Text>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../Assets/Company/logo.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <CommonHeader 
          title="Delete Account" 
          onBack={() => navigation.goBack()}
        />
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Warning Header */}
          <View style={styles.warningHeader}>
            <Icon name="warning" size={moderateScale(40)} color={COLORS.error} />
            <Text style={styles.warningTitle}>Delete Account</Text>
            <Text style={styles.warningSubtitle}>This action is permanent and cannot be undone</Text>
          </View>

          {/* What Happens Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Icon name="info" size={moderateScale(24)} color={COLORS.error} />
              <Text style={styles.sectionTitle}>What happens when you delete your account?</Text>
            </View>
            
            <View style={styles.consequencesList}>
              {[
                'Your profile will be permanently removed',
                'All personal information will be deleted from our servers',
                'You will lose access to all your saved data',
                'Any ongoing transactions or orders will be cancelled',
                'You will be logged out from all devices',
                'Account recovery will not be possible'
              ].map((item, index) => (
                <View key={index} style={styles.consequenceItem}>
                  <Icon name="remove-circle" size={moderateScale(18)} color={COLORS.error} />
                  <Text style={styles.consequenceText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Important Considerations */}
          <View style={[styles.sectionCard, { borderLeftColor: COLORS.warning }]}>
            <View style={styles.sectionHeader}>
              <Icon name="priority-high" size={moderateScale(24)} color={COLORS.warning} />
              <Text style={styles.sectionTitle}>Important Considerations</Text>
            </View>
            
            <View style={styles.considerationsList}>
              {[
                'Ensure you have completed any pending purchases',
                'Download any important information before deletion',
                'Cancel any active subscriptions or memberships',
                'Clear any outstanding balances',
                'Contact support if you have any doubts'
              ].map((item, index) => (
                <View key={index} style={styles.considerationItem}>
                  <Icon name="check-circle" size={moderateScale(18)} color={COLORS.warning} />
                  <Text style={styles.considerationText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Data Retention Notice */}
          <View style={[styles.sectionCard, { borderLeftColor: COLORS.info }]}>
            <View style={styles.sectionHeader}>
              <Icon name="security" size={moderateScale(24)} color={COLORS.info} />
              <Text style={styles.sectionTitle}>Data Retention Notice</Text>
            </View>
            
            <Text style={styles.dataRetentionText}>
              Please note that some data may be retained for legal or regulatory purposes as required by law. This includes:
            </Text>
            
            <View style={styles.retentionList}>
              {[
                'Transaction records for accounting purposes',
                'Fraud prevention data',
                'Legal compliance information',
                'Records required by government regulations'
              ].map((item, index) => (
                <View key={index} style={styles.retentionItem}>
                  <Text style={styles.retentionText}>• {item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Alternative Solutions */}
          <View style={[styles.sectionCard, { borderLeftColor: COLORS.success }]}>
            <View style={styles.sectionHeader}>
              <Icon name="help" size={moderateScale(24)} color={COLORS.success} />
              <Text style={styles.sectionTitle}>Need Help Instead?</Text>
            </View>
            
            <Text style={styles.alternativeText}>
              If you're facing issues with your account, consider these alternatives:
            </Text>
            
            <TouchableOpacity 
              style={styles.alternativeButton}
              onPress={() => navigation.navigate('Support')}
            >
              <Icon name="contact-support" size={moderateScale(20)} color={COLORS.primary} />
              <Text style={styles.alternativeButtonText}>Contact Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.alternativeButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Icon name="settings" size={moderateScale(20)} color={COLORS.primary} />
              <Text style={styles.alternativeButtonText}>Update Account Settings</Text>
            </TouchableOpacity>
          </View>

          {/* Final Warning */}
          <View style={styles.finalWarning}>
            <Icon name="error" size={moderateScale(30)} color={COLORS.error} />
            <Text style={styles.finalWarningText}>
              Once you delete your account, there is no going back. This action is irreversible.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Icon name="delete-forever" size={moderateScale(22)} color={COLORS.white} />
                  <Text style={styles.deleteButtonText}>Delete My Account</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundImage: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: SIZES.padding.lg,
    paddingBottom: verticalScale(40),
  },
  loadingContainer: {
    flex: 1,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  loadingText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    marginTop: verticalScale(16),
  },
  
  // Warning Header
  warningHeader: {
    alignItems: 'center',
    backgroundColor: COLORS.error + '10',
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    marginBottom: verticalScale(24),
    borderWidth: 2,
    borderColor: COLORS.error + '30',
  },
  warningTitle: {
    fontFamily: FONTS.family.heading,
    fontSize: SIZES.font.xxl,
    color: COLORS.error,
    marginTop: verticalScale(12),
    marginBottom: verticalScale(4),
  },
  warningSubtitle: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  
  // Section Card
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.lg,
    marginBottom: verticalScale(20),
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  sectionTitle: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.lg,
    color: COLORS.textPrimary,
    marginLeft: moderateScale(12),
    flex: 1,
  },
  
  // Consequences List
  consequencesList: {
    marginLeft: moderateScale(4),
  },
  consequenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  consequenceText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    lineHeight: verticalScale(22),
    flex: 1,
    marginLeft: moderateScale(10),
  },
  
  // Considerations List
  considerationsList: {
    marginLeft: moderateScale(4),
  },
  considerationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  considerationText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    lineHeight: verticalScale(22),
    flex: 1,
    marginLeft: moderateScale(10),
  },
  
  // Data Retention
  dataRetentionText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    lineHeight: verticalScale(22),
    marginBottom: verticalScale(12),
  },
  retentionList: {
    marginLeft: moderateScale(16),
  },
  retentionItem: {
    marginBottom: verticalScale(8),
  },
  retentionText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    lineHeight: verticalScale(22),
  },
  
  // Alternative Solutions
  alternativeText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    lineHeight: verticalScale(22),
    marginBottom: verticalScale(16),
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.sm,
    padding: SIZES.padding.md,
    marginBottom: verticalScale(10),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  alternativeButtonText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.primary,
    marginLeft: moderateScale(12),
    flex: 1,
  },
  
  // Final Warning
  finalWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '15',
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.lg,
    marginBottom: verticalScale(24),
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  finalWarningText: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.md,
    color: COLORS.error,
    marginLeft: moderateScale(16),
    flex: 1,
    lineHeight: verticalScale(22),
  },
  
  // Action Buttons
  actionButtons: {
    marginTop: verticalScale(10),
  },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    borderRadius: SIZES.radius.lg,
    padding: verticalScale(16),
    marginBottom: verticalScale(16),
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  deleteButtonText: {
    fontFamily: FONTS.family.heading,
    fontSize: SIZES.font.lg,
    color: COLORS.white,
    marginLeft: moderateScale(10),
  },
  cancelButton: {
    padding: verticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radius.lg,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    backgroundColor: COLORS.white,
  },
  cancelButtonText: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.lg,
    color: COLORS.textSecondary,
  },
});

export default DeleteAccount;