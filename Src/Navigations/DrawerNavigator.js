// Src/Navigations/DrawerNavigator.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import HomeScreen from '../Screens/Home/HomeScreen';
import ResetMPINScreen from '../Screens/Auth/ResetMpin/ResetMpin';
import MemberCreation from '../Screens/MemberCreation/MemberCreation';
import SideBar from '../Components/Sidebar/Sidebar';

const Drawer = createDrawerNavigator();

export default function MainDrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <SideBar {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerPosition: 'right',   // 🔥 THIS IS THE KEY
        drawerStyle: { width: '85%' },
        overlayColor: 'rgba(0,0,0,0.5)',
        swipeEnabled: true,
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="ResetMPIN" component={ResetMPINScreen} />
      <Drawer.Screen name="MemberCreation" component={MemberCreation} />
      
    </Drawer.Navigator>
  );
}

