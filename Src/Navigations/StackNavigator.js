import * as React from 'react';
import { View,ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import OnboardingScreen from '../Screens/Onboard/OnboardingScreen';
import HomeScreen from '../Screens/Home/HomeScreen';
import RegisterScreen from '../Screens/Auth/Register/Register';
import LoginScreen from '../Screens/Auth/Login/Login';
import VerifyOTPScreen from '../Screens/Auth/VerifyOTP/VerifyOTP';
import GoogleContactVerificationScreen from '../Screens/Auth/GoogleVerifyOTP/GoogleEnterMobile';
import AsynchStorageHelper from '../Utills/AsynchStorageHelper';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  const [initialRoute, setInitialRoute] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const init = async () => {
    
      try {

        AsyncStorage.clear(); // For testing purposes only, remove in production
        // Check if onboarding was completed
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        
        // Check if user is logged in
        const userToken = await AsyncStorage.getItem('authToken');
        const userDataStr = await AsyncStorage.getItem('userData');
        let isLoggedIn = false;
        
        if (userToken && userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            // Additional validation if needed
            isLoggedIn = !!userToken && !!userData.id;
          } catch (e) {
            console.log('Error parsing user data:', e);
            isLoggedIn = false;
          }
        }

        console.log('Navigation initialization:', {
          hasSeenOnboarding,
          hasToken: !!userToken,
          isLoggedIn
        });

        // Determine initial route based on app state
        if (!hasSeenOnboarding) {
          // First time user - show onboarding
          setInitialRoute('Onboarding');
        } else if (isLoggedIn) {
          // User is already logged in - go directly to home
          setInitialRoute('Home');
        } else {
          // Returning user but not logged in - go to login
          setInitialRoute('Login');
        }
      } catch (e) {
        console.error('Error initializing navigation:', e);
        // Fallback to onboarding on error
        setInitialRoute('Onboarding');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Show loading screen while determining initial route
  if (isLoading || !initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
        <Stack.Screen
          name="GoogleContactVerification"
          component={GoogleContactVerificationScreen}
        />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}