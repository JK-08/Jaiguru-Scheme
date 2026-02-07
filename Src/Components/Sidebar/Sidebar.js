import React, { useState, useMemo, useCallback, memo, useEffect, useRef } from "react";
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
  Image,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  getAuthSession,
  getUserData,
  clearAuthData,
  getUserId,
  debugAsyncStorage,
} from "../../Utills/AsynchStorageHelper";
import { COLORS, FONTS, SIZES, SHADOWS } from "../../Utills/AppTheme";

// Menu items data - Add more items as needed
const MENU_ITEMS = [
  {
    key: "home",
    label: "Home",
    icon: "home",
    route: "Home",
    badge: 0,
  }, 
  {
    key: "resetmpin",
    label: "Reset MPIN",
    icon: "lock-reset",
    route: "ResetMPIN",
    badge: 0,
  },
  {
    key: "membercreation",
    label: "Create Member",
    icon: "person-add",
    route: "MemberCreation",
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

// Enhanced DrawerItem Component
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

// User Avatar Component with Fallback
const UserAvatar = memo(({ user, size = 60 }) => {
  if (user.picture && user.picture !== "") {
    return (
      <Image
        source={{ uri: user.picture }}
        style={[styles.avatarImage, { width: size, height: size }]}
        resizeMode="cover"
        defaultSource={require("../../Assets/Icons/avatar.jpg")}
      />
    );
  }

  // Fallback to colored initials
  return (
    <View
      style={[
        styles.avatarFallback,
        { 
          width: size, 
          height: size, 
          backgroundColor: user.avatarColor 
        },
      ]}
    >
      <Text style={styles.avatarText}>
        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
      </Text>
    </View>
  );
});

UserAvatar.displayName = "UserAvatar";

// Main SideBar Component with RTL animation
const SideBar = ({ navigation, activeRoute, onClose, isVisible = true }) => {
  const { width, height } = Dimensions.get("window");
  const insets = useSafeAreaInsets();
  const isLandscape = width > height;

  // Animation values for slide in from right
  const slideAnim = useRef(new Animated.Value(width)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const [expandedItems, setExpandedItems] = useState(new Set());
  const [user, setUser] = useState({
    id: null,
    name: "",
    email: "",
    contactNumber: "",
    picture: "",
    referralCode: "",
    loginType: "",
    avatarColor: "#4A90E2",
    isLoading: true,
  });

  // Calculate sidebar width
  const sidebarWidth = useMemo(() => {
    if (isLandscape) {
      return Math.min(width * 0.4, 350);
    }
    return Math.min(width * 0.85, 400);
  }, [width, isLandscape]);

  // Animate sidebar when component mounts or visibility changes
  useEffect(() => {
    if (isVisible) {
      // Slide in from right
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Slide out to right
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: sidebarWidth,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isVisible, slideAnim, opacityAnim, overlayAnim, sidebarWidth]);

  // Fetch user data from AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("=== SIDEBAR: FETCHING USER DATA ===");
        
        // Method 1: Get user data directly
        const userData = await getUserData();
        console.log("User data from getUserData():", userData);
        
        // Method 2: Get auth session
        const session = await getAuthSession();
        console.log("Auth session:", session);
        
        // Method 3: Get user ID separately
        const userId = await getUserId();
        console.log("User ID from getUserId():", userId);
        
        // Debug all AsyncStorage
        await debugAsyncStorage();

        // Use the data we have
        const userInfo = userData || session?.user || {};
        
        console.log("Extracted user info:", {
          id: userInfo.userId || userInfo.userid,
          username: userInfo.username,
          email: userInfo.email,
          contactNumber: userInfo.contactNumber,
          picture: userInfo.picture,
          loginType: userInfo.loginType,
          referralCode: userInfo.referralCode,
        });

        // Set user data with proper fallbacks
        setUser({
          id: userInfo.userId || userInfo.userid || userId,
          name: userInfo.username || userInfo.name || "User",
          email: userInfo.email || "",
          contactNumber: userInfo.contactNumber || userInfo.mobileNumber || "",
          picture: userInfo.picture || "",
          referralCode: userInfo.referralCode || "",
          loginType: userInfo.loginType || "normal",
          avatarColor: getAvatarColor(userInfo.username || userInfo.name || "User"),
          isLoading: false,
        });

      } catch (error) {
        console.error("Error loading user data:", error);
        setUser({
          id: null,
          name: "Guest User",
          email: "",
          contactNumber: "",
          picture: "",
          referralCode: "",
          loginType: "unknown",
          avatarColor: "#4A90E2",
          isLoading: false,
        });
      }
    };

    fetchUserData();
  }, []);

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
      // Close drawer first
      if (onClose) {
        onClose();
      }
      // Then navigate
      navigation.navigate(route);
    },
    [navigation, onClose],
  );

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      // Clear all auth data
      await clearAuthData();
      
      // Close drawer first
      if (onClose) {
        onClose();
      }
      
      // Navigate to Login screen
      navigation.getParent()?.navigate('Login');
      
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [navigation, onClose]);

  // Handle edit profile
  const handleEditProfile = useCallback(() => {
    // Close drawer first
    if (onClose) {
      onClose();
    }
    // Navigate to EditProfile
    navigation.navigate("EditProfile", { user });
  }, [navigation, onClose, user]);

  // Handle back/close
  const handleBack = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // Handle overlay press to close drawer
  const handleOverlayPress = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  return (
    <>
      {/* Overlay background */}
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: overlayAnim,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleOverlayPress}
        />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.container,
          {
            width: sidebarWidth,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            transform: [{ translateX: slideAnim }],
            opacity: opacityAnim,
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
                <UserAvatar user={user} size={70} />
                
                <View style={styles.profileInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.profileName} numberOfLines={1}>
                      {user.name}
                    </Text>
                    {user.loginType === "GOOGLE" && (
                      <Icon 
                        name="verified" 
                        size={16} 
                        color={COLORS.success} 
                        style={styles.verifiedIcon}
                      />
                    )}
                  </View>
                  
                  <Text style={styles.profileEmail} numberOfLines={1}>
                    {user.email}
                  </Text>
                  
                  {user.contactNumber ? (
                    <View style={styles.contactRow}>
                      <Icon
                        name="phone"
                        size={12}
                        color="rgba(255, 255, 255, 0.8)"
                      />
                      <Text style={styles.profileMobile} numberOfLines={1}>
                        {user.contactNumber}
                      </Text>
                    </View>
                  ) : null}
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
      </Animated.View>
    </>
  );
};

export default memo(SideBar);

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  overlayTouchable: {
    flex: 1,
  },
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    ...SHADOWS.large,
    zIndex: 1000,
    elevation: 5,
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
    minHeight: 160,
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
  avatarImage: {
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  avatarFallback: {
    borderRadius: 35,
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
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  profileName: {
    ...FONTS.h3,
    color: COLORS.white,
    fontWeight: "600",
    flex: 1,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  profileEmail: {
    ...FONTS.body,
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 13,
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  profileMobile: {
    ...FONTS.body,
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    marginLeft: 4,
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