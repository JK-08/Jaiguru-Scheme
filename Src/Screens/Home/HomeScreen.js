// screens/HomeScreen.js
import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeHeaderRedesigned from '../../Components/MainHeader/MainHeader';
import SliderComponent from '../../Components/Slider/Slider';
import SchemeDetailsCard from '../../Components/SchemeDetailsCard/SchemeDetailsCard';
import SchemesList from '../../Components/SchemeCard/SchemeCard';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);

  const handleNotificationPress = () => {
    // Navigate to Notifications screen if it exists
    // navigation.navigate('Notifications');
    console.log('Notifications pressed');
  };

  const handleLogoPress = () => {
    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  const handleRatePress = (type) => {
    console.log(`${type} rates pressed`);
    // navigation.navigate('Rates', { rateType: type });
  };

  return (
    <SafeAreaView style={styles.container}>
      <HomeHeaderRedesigned
        onNotificationPress={handleNotificationPress}
        onLogoPress={handleLogoPress}
        // Note: We're not passing onMenuPress as HomeHeaderRedesigned 
        // now handles drawer opening internally
      />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SliderComponent />

        <SchemeDetailsCard />
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
    backgroundColor: '#f5f5f5',
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
});