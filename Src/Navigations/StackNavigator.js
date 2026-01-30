import * as React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import OnboardingScreen from '../Screens/Onboard/OnboardingScreen';
import HomeScreen from '../Screens/Home/HomeScreen';
import RegisterScreen from '../Screens/Auth/Register/Register';
import LoginScreen from '../Screens/Auth/Login/Login';
import MpinVerifyScreen from '../Screens/Auth/VerifyMpin/VerifyMpin';
import MpinCreateScreen from '../Screens/Auth/CreateMpin/CreateMpin';
import ForgotMpin from '../Screens/Auth/ResetMpin/ResetMpin';
import VerifyOTPScreen from '../Screens/Auth/VerifyOTP/VerifyOTP';
import GoogleContactVerificationScreen from '../Screens/Auth/GoogleVerifyOTP/GoogleEnterMobile';
import MemberCreation from '../Screens/MemberCreation/MemberCreation';
import SideBar from '../Components/Sidebar/Sidebar';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  const [initialRoute, setInitialRoute] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const init = async () => {
      try {
        // Only for debugging
// await AsyncStorage.clear();

        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        const token = await AsyncStorage.getItem('authToken');
        const userDataStr = await AsyncStorage.getItem('userData');
        const hasMpin = await AsyncStorage.getItem('hasMpin');

        console.log('Navigation State:', {
          hasSeenOnboarding,
          
          token,
          hasMpin,
        });

        let isLoggedIn = false;

        if (token && userDataStr) {
          const userData = JSON.parse(userDataStr);
          isLoggedIn = !!userData?.id;
        }

        // 🔀 FINAL FLOW
        if (!hasSeenOnboarding) {
          setInitialRoute('Onboarding');
        } else if (!isLoggedIn) {
          setInitialRoute('Login');
        } else {
          setInitialRoute('MpinVerify');
        }

      } catch (error) {
        console.log('Navigation error:', error);
        setInitialRoute('Onboarding');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading || !initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
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
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
        <Stack.Screen name="GoogleContactVerification" component={GoogleContactVerificationScreen} />
        <Stack.Screen name="MpinCreate" component={MpinCreateScreen} />
        <Stack.Screen name="MpinVerify" component={MpinVerifyScreen} />
        <Stack.Screen name="ForgotMpin" component={ForgotMpin} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="MemberCreation" component={MemberCreation} />
        <Stack.Screen name="Sidebar" component={SideBar} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
