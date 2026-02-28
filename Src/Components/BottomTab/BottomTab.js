import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../Utills/AppTheme";
import styles from "./styles";

function BottomTab({ activeScreen }) {
  const navigation = useNavigation();

  const tabs = [
    {
  key: "HOME",
  label: "Home",
  screen: { name: "MainDrawer", params: { screen: "Home" } },
      icon: <MaterialCommunityIcons name="home" size={SIZES.icon.md} />,
    },
    {
      key: "SCHEMES",
      label: "My Schemes",
      screen: "AllSchemes",
      icon: <MaterialIcons name="savings" size={SIZES.icon.md} />,
    },
    
   
    {
      key: "SUPPORT",
      label: "Support",
      screen: "HelpCenter",
      icon: <MaterialCommunityIcons name="headset" size={SIZES.icon.md} />,
    },
  ];

  return (
    <View style={styles.footerContainer}>
      {tabs.map((tab) => {
        const isActive = activeScreen === tab.key;

        // Special rendering for "Pay Now" button
        if (tab.isSpecial) {
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.payNowContainer}
              onPress={() => navigation.navigate(tab.screen)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.payNowIconContainer,
                isActive && styles.payNowActiveIconContainer
              ]}>
                {React.cloneElement(tab.icon, {
                  color: isActive ? COLORS.primary : COLORS.white,
                  size: SIZES.icon.lg,
                })}
              </View>
              <Text
                style={[
                  styles.payNowText,
                  isActive && styles.payNowActiveText
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        }

        // Regular rendering for other tabs
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.footerBtnContainer}
            onPress={() => navigation.navigate(tab.screen)}
            activeOpacity={0.7}
          >
            {React.cloneElement(tab.icon, {
              color: isActive ? COLORS.primary : COLORS.textSecondary,
            })}

            <Text
              style={
                isActive ? styles.activeText : styles.inactiveText
              }
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default BottomTab;