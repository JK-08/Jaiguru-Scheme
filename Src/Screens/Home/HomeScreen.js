// screens/HomeScreen.js
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeHeaderRedesigned from '../../Components/MainHeader/MainHeader';
import SliderComponent from '../../Components/Slider/Slider';
import SchemeDetailsCard from '../../Components/SchemeDetailsCard/SchemeDetailsCard';
import SchemesList from '../../Components/SchemeCard/SchemeCard';
import { useNavigation } from '@react-navigation/native';
import PushNotificationService from '../../Services/PushNotificationService';
import { 
  registerForPushNotificationsAsync, 
  wasTokenSent, 
  markTokenAsSent,
  getStoredPushToken
} from '../../Helpers/NotificationHelper';

const HomeScreen = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  
  // Notification states
  const [notificationStatus, setNotificationStatus] = useState('checking'); // checking, registering, registered, failed
  const [userId, setUserId] = useState(null);
  const [pushToken, setPushToken] = useState(null);

  // Get user ID from storage on component mount
  useEffect(() => {
    getUserData();
  }, []);

  // Register for push notifications when userId is available
  useEffect(() => {
    if (userId) {
      handlePushNotificationRegistration();
    }
  }, [userId]);

  const getUserData = async () => {
    try {
      // Get user data from your auth storage method
      // Adjust this based on how you store user data after login
      const userData = await AsyncStorage.getItem('userData');
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.id || user.userId);
      } else {
        // If no user data, you might want to skip notification registration
        setNotificationStatus('skipped');
        console.log('No user logged in - skipping notification registration');
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      setNotificationStatus('failed');
    }
  };

  const handlePushNotificationRegistration = async () => {
    try {
      setNotificationStatus('registering');
      
      // First check if we already have a token
      const existingToken = await getStoredPushToken();
      
      if (existingToken) {
        setPushToken(existingToken);
        
        // Check if token was already sent to server
        const tokenSent = await wasTokenSent();
        
        if (!tokenSent) {
          // Token exists but wasn't sent to server, send it now
          await sendTokenToServer(existingToken);
        } else {
          setNotificationStatus('registered');
          console.log('📱 Push notifications already registered');
        }
      } else {
        // Generate new token
        const token = await registerForPushNotificationsAsync(userId);
        
        if (token) {
          setPushToken(token);
          await sendTokenToServer(token);
        } else {
          setNotificationStatus('failed');
        }
      }
    } catch (error) {
      console.error('Error in push notification registration:', error);
      setNotificationStatus('failed');
    }
  };

  const sendTokenToServer = async (token) => {
    try {
      const success = await PushNotificationService.sendPushTokenToServer(token, userId);
      
      if (success) {
        await markTokenAsSent();
        setNotificationStatus('registered');
        
        // Optional: Show success message once
        // Alert.alert('Success', 'Notifications enabled successfully');
      } else {
        setNotificationStatus('failed');
      }
    } catch (error) {
      console.error('Error sending token to server:', error);
      setNotificationStatus('failed');
    }
  };

  const handleRetryNotificationRegistration = () => {
    if (userId) {
      handlePushNotificationRegistration();
    } else {
      getUserData();
    }
  };

  const handleNotificationPress = () => {
    console.log('Notifications pressed');
    navigation.navigate('Notifications');
  };

  const handleLogoPress = () => {
    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  const handleRatePress = (type) => {
    console.log(`${type} rates pressed`);
    navigation.navigate('Rates', { rateType: type });
  };

  // Render notification status banner
  const renderNotificationStatus = () => {
    if (notificationStatus === 'registered' || notificationStatus === 'skipped') {
      return null; // Don't show banner if registered or skipped
    }

    return (
      <TouchableOpacity 
        style={[
          styles.notificationBanner,
          notificationStatus === 'failed' && styles.notificationBannerError,
          notificationStatus === 'registering' && styles.notificationBannerLoading
        ]}
        onPress={notificationStatus === 'failed' ? handleRetryNotificationRegistration : null}
        disabled={notificationStatus === 'registering'}
      >
        {notificationStatus === 'registering' ? (
          <>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.notificationBannerText}>
              Setting up notifications...
            </Text>
          </>
        ) : notificationStatus === 'failed' ? (
          <>
            <Icon name="notifications-off" size={20} color="#fff" />
            <Text style={styles.notificationBannerText}>
              Enable notifications to receive updates
            </Text>
            <Text style={styles.notificationBannerAction}>Tap to retry</Text>
          </>
        ) : notificationStatus === 'checking' ? (
          <>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.notificationBannerText}>
              Checking notification status...
            </Text>
          </>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <HomeHeaderRedesigned
        onNotificationPress={handleNotificationPress}
        onLogoPress={handleLogoPress}
      />

      {/* Notification Status Banner */}
      {renderNotificationStatus()}

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SliderComponent />
        
        {/* Horizontal Scheme Cards */}
        <SchemeDetailsCard layout="horizontal" />
        
        <SchemesList />

        {/* Welcome Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Welcome!</Text>
          <Text style={styles.sectionText}>
            Your app content goes here. Explore rates, products, and more.
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleRatePress('gold')}
          >
            <Icon name="trending-up" size={26} color="#FFD700" />
            <Text style={styles.actionText}>Gold Rates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleRatePress('silver')}
          >
            <Icon name="trending-up" size={26} color="#C0C0C0" />
            <Text style={styles.actionText}>Silver Rates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('MemberCreation')}
          >
            <Icon name="person-add" size={26} color="#4ECDC4" />
            <Text style={styles.actionText}>Create Member</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  scrollContent: {
    paddingBottom: 30,
    paddingTop: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginHorizontal: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  // Notification banner styles
  notificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    gap: 8,
  },
  notificationBannerError: {
    backgroundColor: '#F44336',
  },
  notificationBannerLoading: {
    backgroundColor: '#FFA000',
  },
  notificationBannerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  notificationBannerAction: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Test button (development only)
  testButton: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
});