// screens/HomeScreen.js
import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import HomeHeader from "../../Components/MainHeader/MainHeader";
import SliderComponent from '../../Components/Slider/Slider';
import SchemeDetailsCard from '../../Components/SchemeDetailsCard/SchemeDetailsCard';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = ({ navigation }) => {
  const scrollViewRef = useRef();

  const handleMenuPress = () => {
    navigation.openDrawer(); // If using drawer navigation
    // OR
    // navigation.navigate('Menu');
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  const handleLogoPress = () => {
    // Scroll to top
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleRatePress = (type) => {
    navigation.navigate('Rates', { rateType: type });
  };

  return (
    <View style={styles.container}>
      <HomeHeader
        onMenuPress={handleMenuPress}
        onNotificationPress={handleNotificationPress}
        onLogoPress={handleLogoPress}
      />
      <SliderComponent />
      <SchemeDetailsCard />
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Your main content here */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Welcome!</Text>
            <Text style={styles.sectionText}>
              Your app content goes here...
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleRatePress('gold')}
            >
              <Icon name="trending-up" size={24} color="#FFD700" />
              <Text style={styles.actionText}>Gold Rates</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleRatePress('silver')}
            >
              <Icon name="trending-up" size={24} color="#C0C0C0" />
              <Text style={styles.actionText}>Silver Rates</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Products')}
            >
              <Icon name="inventory" size={24} color="#4ECDC4" />
              <Text style={styles.actionText}>Products</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
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
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
});

export default HomeScreen;