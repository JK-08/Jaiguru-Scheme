import React, { useState, useMemo, useCallback, memo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
  Animated,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, FONTS, SIZES, SHADOWS } from "../../Utills/AppTheme";
import {
  getAuthSession,
  getUserData,
  clearAuthData,
  getUserField,
} from "../../Utills/AsynchStorageHelper";

// Menu items data
const MENU_ITEMS = [
  {
    key: "home",
    label: "Home",
    icon: "home",
    route: "Home",
    badge: 0,
  }, 
  {
    key: "profile",
    label: "Profile",
    icon: "person",
    route: "Profile",
    badge: 0,
  },
  {
    key: "settings",
    label: "Settings",
    icon: "settings",
    route: "Settings",
    badge: 0,
    subItems: [
      { label: "Reset MPIN", route: "ResetMPIN" },
      { label: "Notifications", route: "Notifications" },
      { label: "Privacy", route: "Privacy" },
    ],
  },
  {
    key: "support",
    label: "Help & Support",
    icon: "support-agent",
    route: "Support",
    badge: 0,
  },
];

// Memoized Badge Component
const Badge = memo(({ count }) => {
  if (count <= 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
    </View>
  );
});

Badge.displayName = "Badge";

// Memoized SubItem Component
const SubItem = memo(({ subItem, onPress }) => (
  <TouchableOpacity
    style={styles.subItem}
    onPress={() => onPress(subItem.route)}
    activeOpacity={0.7}
  >
    <View style={styles.subItemDot} />
    <Text style={styles.subItemLabel}>{subItem.label}</Text>
  </TouchableOpacity>
));

SubItem.displayName = "SubItem";

// Enhanced DrawerItem Component with performance optimizations
const DrawerItem = memo(
  ({ item, isActive, onPress, showSubItems, onToggleSubItems }) => {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 150,
        friction: 3,
      }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 3,
      }).start();
    }, [scaleAnim]);

    const hasSubItems = item.subItems && item.subItems.length > 0;

    const handlePress = useCallback(() => {
      if (hasSubItems) {
        onToggleSubItems(item.key);
      } else {
        onPress(item.route);
      }
    }, [hasSubItems, item.key, item.route, onToggleSubItems, onPress]);

    return (
      <View style={styles.itemContainer}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.item, isActive && styles.activeItem]}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Icon
                name={item.icon}
                size={SIZES.icon.md}
                color={isActive ? COLORS.white : COLORS.primary}
              />
              <Badge count={item.badge} />
            </View>

            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {item.label}
            </Text>

            {hasSubItems && (
              <Icon
                name={showSubItems ? "expand-less" : "expand-more"}
                size={SIZES.icon.md}
                color={isActive ? COLORS.white : COLORS.gray}
                style={styles.arrowIcon}
              />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Sub Items with conditional rendering */}
        {hasSubItems && showSubItems && (
          <View style={styles.subItemsContainer}>
            {item.subItems.map((subItem, index) => (
              <SubItem
                key={`${item.key}-sub-${index}`}
                subItem={subItem}
                onPress={onPress}
              />
            ))}
          </View>
        )}
      </View>
    );
  },
);

DrawerItem.displayName = "DrawerItem";

// Main SideBar Component
const SideBar = ({ navigation, activeRoute, onClose }) => {
  const { width, height } = Dimensions.get("window");
  const insets = useSafeAreaInsets();
  const isLandscape = width > height;

  const [expandedItems, setExpandedItems] = useState(new Set());
  const [user, setUser] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    role: "User",
    avatarColor: "#4A90E2",
    isLoading: true,
  });


  // Fetch user data from AsyncStorage on component mount
useEffect(() => {
  const fetchUserData = async () => {
    try {
      const session = await getAuthSession();

      if (session?.isAuthenticated && session?.userData) {
        const { username, email, contactNumber } = session.userData;

        setUser({
          name: username || "User",
          email: email || "",
          mobileNumber: contactNumber || "",
          role: "User",
          avatarColor: "#4A90E2",
          isLoading: false,
        });
      } else {
        setUser({
          name: "Kirubakaran",
          email: "kirubakarantestuser08@gmail.com",
          mobileNumber: "9790429938",
          role: "User",
          avatarColor: "#4A90E2",
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error loading user session:", error);
      setUser({
        name: "Error",
        email: "",
        mobileNumber: "",
        role: "Error",
        avatarColor: "#4A90E2",
        isLoading: false,
      });
    }
  };

  fetchUserData();
}, []);

  // Calculate sidebar width (memoized for performance)
  const sidebarWidth = useMemo(() => {
    if (isLandscape) {
      return Math.min(width * 0.4, 350);
    }
    return Math.min(width * 0.85, 400);
  }, [width, isLandscape]);

  // Optimized toggle function
  const toggleSubItems = useCallback((key) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  // Optimized navigation handler
  const handleNavigate = useCallback(
    (route) => {
      navigation.navigate(route);
      // Close drawer on navigation (optional)
      if (onClose) {
        onClose();
      }
    },
    [navigation, onClose],
  );

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await clearAuthData();

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });

      console.log("Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [navigation]);

  // Handle edit profile
  const handleEditProfile = useCallback(() => {
    navigation.navigate("EditProfile");
    if (onClose) {
      onClose();
    }
  }, [navigation, onClose]);

  // Handle back/close
  const handleBack = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      navigation.goBack();
    }
  }, [navigation, onClose]);

  // Function to generate avatar color based on name
  const getAvatarColor = useCallback((name) => {
    const colors = [
      "#4A90E2", // Blue
      "#50C878", // Green
      "#FF6B6B", // Red
      "#FFA500", // Orange
      "#9B59B6", // Purple
      "#1ABC9C", // Teal
      "#E74C3C", // Alizarin
      "#3498DB", // Peter River
      "#2ECC71", // Emerald
    ];

    if (!name) return colors[0];

    const hash = name.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  }, []);

  // Update avatar color when name changes
  useEffect(() => {
    if (user.name && !user.isLoading) {
      setUser((prev) => ({
        ...prev,
        avatarColor: getAvatarColor(prev.name),
      }));
    }
  }, [user.name, user.isLoading, getAvatarColor]);

  return (
    <View
      style={[
        styles.container,
        {
          width: "100%",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <StatusBar
        backgroundColor={COLORS.primary}
        barStyle="light-content"
        translucent={Platform.OS === "android"}
      />

      {/* Header with Back and Edit Icons */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleEditProfile}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="edit" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.profileGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {user.isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.white} />
              <Text style={styles.loadingText}>Loading user data...</Text>
            </View>
          ) : (
            <View style={styles.profileContent}>
              <View
                style={[styles.avatar, { backgroundColor: user.avatarColor }]}
              >
                <Text style={styles.avatarText}>
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {user.name}
                </Text>
                <Text style={styles.profileEmail} numberOfLines={1}>
                  {user.email}
                </Text>
                {user.mobileNumber ? (
                  <Text style={styles.profileMobile} numberOfLines={1}>
                    <Icon
                      name="phone"
                      size={12}
                      color="rgba(255, 255, 255, 0.8)"
                    />{" "}
                    {user.mobileNumber}
                  </Text>
                ) : null}
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{user.role}</Text>
                </View>
              </View>
            </View>
          )}
        </LinearGradient>
      </View>

      {/* Scrollable Menu Items */}
      <ScrollView
        style={styles.menuContainer}
        contentContainerStyle={styles.menuContentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        overScrollMode="never"
      >
        {MENU_ITEMS.map((item) => (
          <DrawerItem
            key={item.key}
            item={item}
            isActive={activeRoute === item.route}
            onPress={handleNavigate}
            showSubItems={expandedItems.has(item.key)}
            onToggleSubItems={toggleSubItems}
          />
        ))}
      </ScrollView>

      {/* Footer Section */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Icon name="logout" size={SIZES.icon.md} color={COLORS.error} />
          <Text style={styles.footerButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>v1.2.0</Text>
          <View style={styles.statusDot} />
          <Text style={styles.versionText}>Online</Text>
        </View>
      </View>
    </View>
  );
};

export default memo(SideBar);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    ...SHADOWS.large,
    zIndex: 1000,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.padding.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    fontWeight: "600",
  },
  profileSection: {
    marginHorizontal: SIZES.margin.lg,
    marginVertical: SIZES.margin.lg,
    borderRadius: SIZES.radius.lg,
    overflow: "hidden",
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 140,
  },
  profileGradient: {
    padding: SIZES.padding.lg,
    flex: 1,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...FONTS.body,
    color: COLORS.white,
    marginTop: SIZES.margin.sm,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.margin.lg,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  avatarText: {
    ...FONTS.h2,
    color: COLORS.white,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...FONTS.h3,
    color: COLORS.white,
    marginBottom: 4,
    fontWeight: "600",
  },
  profileEmail: {
    ...FONTS.body,
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
    marginBottom: 4,
  },
  profileMobile: {
    ...FONTS.body,
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  roleBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radius.sm,
    alignSelf: "flex-start",
  },
  roleText: {
    ...FONTS.caption,
    color: COLORS.white,
    fontWeight: "600",
  },
  menuContainer: {
    flex: 1,
  },
  menuContentContainer: {
    paddingVertical: SIZES.padding.sm,
  },
  itemContainer: {
    marginBottom: 2,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.padding.md,
    paddingHorizontal: SIZES.padding.lg,
    marginHorizontal: SIZES.margin.md,
    borderRadius: SIZES.radius.md,
    backgroundColor: "transparent",
    minHeight: 48,
  },
  activeItem: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.small,
  },
  iconContainer: {
    position: "relative",
    marginRight: SIZES.margin.lg,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: {
    ...FONTS.captionBold,
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "bold",
  },
  label: {
    ...FONTS.body,
    color: COLORS.text,
    flex: 1,
    fontSize: 15,
  },
  activeLabel: {
    ...FONTS.bodyBold,
    color: COLORS.white,
    fontWeight: "600",
  },
  arrowIcon: {
    marginLeft: "auto",
  },
  subItemsContainer: {
    marginLeft: SIZES.margin.xl * 2,
    marginTop: SIZES.margin.xs,
    marginBottom: SIZES.margin.sm,
    paddingLeft: SIZES.padding.sm,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.border,
  },
  subItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.padding.sm,
    paddingHorizontal: SIZES.padding.md,
    minHeight: 40,
  },
  subItemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gray,
    marginRight: SIZES.margin.md,
  },
  subItemLabel: {
    ...FONTS.body,
    color: COLORS.gray,
    fontSize: 14,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.padding.md,
    backgroundColor: COLORS.white,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.padding.md,
    paddingHorizontal: SIZES.padding.sm,
    marginBottom: SIZES.margin.md,
    borderRadius: SIZES.radius.md,
    backgroundColor: "rgba(255, 0, 0, 0.05)",
  },
  footerButtonText: {
    ...FONTS.body,
    marginLeft: SIZES.margin.md,
    color: COLORS.error,
    fontWeight: "600",
  },
  versionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SIZES.padding.xs,
  },
  versionText: {
    ...FONTS.caption,
    color: COLORS.gray,
    fontSize: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginHorizontal: SIZES.margin.sm,
  },
});
