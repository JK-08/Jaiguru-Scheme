// Src/Navigations/StackNavigator.js
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import OnboardingScreen from '../Screens/Onboard/OnboardingScreen';
import LoginScreen from '../Screens/Auth/Login/Login';
import RegisterScreen from '../Screens/Auth/Register/Register';
import VerifyOTPScreen from '../Screens/Auth/VerifyOTP/VerifyOTP';
import MpinCreateScreen from '../Screens/Auth/CreateMpin/CreateMpin';
import MpinVerifyScreen from '../Screens/Auth/VerifyMpin/VerifyMpin';
import AllSchemesScreen from '../Screens/SchemeDetails/SchemeDetailScreen';
import PrivacyPolicy from '../Screens/Policies/PrivacyPolicy';
import TermsAndConditions from '../Screens/Policies/TermsAndConditions';
import DeleteAccount from '../Screens/AccountDelete/AccountDelete';
import SchemePassbook from '../Screens/SchemePassbook/SchemePassbook';
import PaymentReceiptPage from '../Screens/PaymentReceipt/PaymentReceipt';
import MainDrawerNavigator from './DrawerNavigator';
import NotificationScreen from '../Screens/Notification/NotificationScreen';
import VerifyForgotMpinScreen from '../Screens/Auth/ForgotMpin/VerifyMpinOTP';
import ForgotMpinScreen from '../Screens/Auth/ForgotMpin/ForgotMpin';
import ForgotPasswordScreen from '../Screens/Auth/ForgotPassword/ForgotPassword';
import ForgotVerifyOtpScreen from '../Screens/Auth/ForgotPassword/ForgotVerifyOTP';
import ResetPasswordScreen from '../Screens/Auth/ResetPassword/ResetPassword';
import PayNow from '../Screens/PayNow/PayNow';
import GoogleContactMobileScreen from '../Screens/Auth/GoogleContactUpdate/GoogleContactMobile';
import GoogleContactOtpScreen from '../Screens/Auth/GoogleContactUpdate/GoogleContactVerify';
import HelpCentre from '../Screens/HelpCenter/HelpCenter';
import HomeScreen from '../Screens/Home/HomeScreen';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // AsyncStorage.clear();
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        const token = await AsyncStorage.getItem('authToken');
        const hasMpin = await AsyncStorage.getItem('hasMpin');

        /**
         * 🔀 FINAL FLOW
         */

        // 1️⃣ First time only → Onboarding
        if (!hasSeenOnboarding) {
          setInitialRoute('Onboarding');
        }

        // 2️⃣ Onboarding done, NOT logged in → Login
        else if (!token) {
          setInitialRoute('Login');
        }

        // 3️⃣ Logged in, MPIN not created → Create MPIN
        else if (hasMpin !== 'true') {
          setInitialRoute('MpinCreate');
        }

        // 4️⃣ Logged in + MPIN exists → ALWAYS Verify MPIN
        else {
          setInitialRoute('MpinVerify');
        }
      } catch (e) {
        console.log('Navigation init error', e);
        setInitialRoute('Onboarding');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading || !initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
        <Stack.Screen name="MpinCreate" component={MpinCreateScreen} />
        <Stack.Screen name="MpinVerify" component={MpinVerifyScreen} />
        <Stack.Screen name="AllSchemes" component={AllSchemesScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
        <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
        <Stack.Screen name="DeleteAccount" component={DeleteAccount} />
        <Stack.Screen name="SchemePassbook" component={SchemePassbook} />
        <Stack.Screen name="PaymentReceipt" component={PaymentReceiptPage} />
        <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
        <Stack.Screen name="ForgotMpin" component={ForgotMpinScreen} />
        <Stack.Screen name="VerifyForgotMpin" component={VerifyForgotMpinScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ForgotVerifyOTP" component={ForgotVerifyOtpScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} /> 
        <Stack.Screen name="Paynow" component={PayNow} />    
        <Stack.Screen name="GoogleContactVerification" component={GoogleContactMobileScreen} />
        <Stack.Screen name="GoogleContactVerify" component={GoogleContactOtpScreen} />
        <Stack.Screen name="HelpCenter" component={HelpCentre} />

        {/* Drawer after MPIN success */}
        <Stack.Screen name="MainDrawer" component={MainDrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
