import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ActivityIndicator,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
  StatusBar,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useOnboardBanners } from "../../Hooks/useOnboardBanner";
import theme from "../../Utills/AppTheme";
import { IMAGE_BASE_URL } from "../../Config/BaseUrl";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const OnboardingScreen = ({ navigation }) => {
  const { banners, loading, error: bannerError } = useOnboardBanners();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGetStarted, setShowGetStarted] = useState(false);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const userToken = await AsyncStorage.getItem("authToken");
        const userDataStr = await AsyncStorage.getItem("userData");

        if (userToken && userDataStr) {
          const userData = JSON.parse(userDataStr);
          if (userData && userData.id) {
            // User is already logged in, skip onboarding and go to home
            navigation.replace("Home");
            return;
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };

    checkAuth();
  }, [navigation]);

  useEffect(() => {
    // Show get started button with fade animation
    Animated.timing(fadeAnim, {
      toValue: showGetStarted ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showGetStarted]);

  const completeOnboarding = async () => {
    try {
      // Mark onboarding as completed
     AsyncStorage.setItem('hasSeenOnboarding', 'true');


      // Navigate to Login screen
      navigation.replace("Login");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      // Fallback navigation
      navigation.replace("RegLoginister");
    }
  };

  const handleSkip = completeOnboarding;
  const handleGetStarted = completeOnboarding;

  const onScrollEnd = (e) => {
    const contentOffset = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setCurrentIndex(index);

    // Show get started button only on last slide
    setShowGetStarted(index === banners.length - 1);
  };

  const renderDots = () => {
    if (banners.length <= 1) return null;

    return (
      <View style={styles.dotsContainer}>
        {banners.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              flatListRef.current?.scrollToIndex({
                index,
                animated: true,
              });
              setCurrentIndex(index);
              setShowGetStarted(index === banners.length - 1);
            }}
            activeOpacity={0.7}
          >
            <View
              style={[styles.dot, currentIndex === index && styles.activeDot]}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.COLORS.goldPrimary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (bannerError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorText}>{bannerError}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => window.location.reload()}
          activeOpacity={0.8}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!banners || banners.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>No Content Available</Text>
        <Text style={styles.errorText}>Please try again later</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => window.location.reload()}
          activeOpacity={0.8}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item, index }) => (
    <View style={styles.slideContainer}>
      <Image
        source={{ uri: `${IMAGE_BASE_URL}${item.image_path}` }}
        style={styles.image}
        resizeMode="cover"
        onError={(error) => {
          console.log("Image loading error:", error.nativeEvent.error);
        }}
      />

      {/* Gradient overlay */}
      <LinearGradient
        colors={["rgba(0,0,0,0.7)", "transparent", "rgba(0,0,0,0.7)"]}
        style={styles.gradientOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Content container */}
      <View style={styles.contentContainer}>
        {/* Top skip button */}
        {index !== banners.length - 1 && (
          <View style={styles.topContainer}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>SKIP</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom content */}
        <View style={styles.bottomContainer}>

          {/* Get Started Button with fade animation */}
          <Animated.View
            style={[styles.getStartedContainer, { opacity: fadeAnim }]}
          >
            {showGetStarted && (
              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={handleGetStarted}
                activeOpacity={0.8}
              >
                <Text style={styles.getStartedText}>GET STARTED</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
           {/* Navigation dots */}
          {renderDots()}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <FlatList
        ref={flatListRef}
        data={banners}
        keyExtractor={(item) =>
          item.BannerId?.toString() || `banner-${Math.random()}`
        }
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        onMomentumScrollEnd={onScrollEnd}
        onScrollBeginDrag={() => setShowGetStarted(false)}
        scrollEventThrottle={16}
        initialNumToRender={1}
        maxToRenderPerBatch={3}
        windowSize={3}
        decelerationRate="fast"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.backgroundDark,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: theme.COLORS.backgroundDark,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...theme.FONTS.body,
    color: theme.COLORS.white,
    marginTop: theme.SIZES.md,
    opacity: 0.8,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: theme.COLORS.backgroundDark,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.SIZES.padding.xl,
  },
  errorTitle: {
    ...theme.FONTS.h2,
    color: theme.COLORS.white,
    textAlign: "center",
    marginBottom: theme.SIZES.sm,
  },
  errorText: {
    ...theme.FONTS.body,
    color: theme.COLORS.gray400,
    textAlign: "center",
    marginBottom: theme.SIZES.xl,
    lineHeight: theme.SIZES.font.md * 1.6,
  },
  retryButton: {
    backgroundColor: theme.COLORS.goldPrimary,
    paddingHorizontal: theme.SIZES.padding.xxl,
    paddingVertical: theme.SIZES.padding.lg,
    borderRadius: theme.SIZES.radius.lg,
    ...theme.SHADOWS.md,
  },
  retryText: {
    ...theme.FONTS.button,
    color: theme.COLORS.primary,
    fontWeight: "600",
  },
  slideContainer: {
    width: width,
    height: height,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    ...StyleSheet.absoluteFillObject,

    paddingTop: Platform.OS === "ios" ? theme.SIZES.xxxl : theme.SIZES.xxl,
  },
  topContainer: {
    paddingHorizontal: theme.SIZES.padding.lg,
    alignItems: "flex-end",
  },
  skipButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: theme.SIZES.padding.xl,
    paddingVertical: theme.SIZES.padding.sm,
    borderRadius: theme.SIZES.radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  skipText: {
    ...theme.FONTS.labelUppercase,
    color: theme.COLORS.white,
    fontSize: theme.SIZES.font.sm,
    letterSpacing: 1.5,
  },
  bottomContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 60 : 40,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: theme.SIZES.padding.lg,
    marginBottom: theme.SIZES.lg,
  },

  getStartedContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: theme.SIZES.lg,
  },
  getStartedButton: {
    backgroundColor: theme.COLORS.goldPrimary,
    paddingHorizontal: theme.SIZES.padding.xxl,
    paddingVertical: theme.SIZES.padding.lg,
    borderRadius: theme.SIZES.radius.xl,
    minWidth: 200,
    ...theme.SHADOWS.goldStrong,
  },
  getStartedText: {
    ...theme.FONTS.buttonLarge,
    color: theme.COLORS.primary,
    letterSpacing: 1,
    textAlign: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: theme.SIZES.padding.md,
    paddingVertical: theme.SIZES.padding.xs,
    borderRadius: theme.SIZES.radius.lg,
    marginBottom: theme.SIZES.xxl,
  },
  dot: {
    width: theme.SIZES.sm,
    height: theme.SIZES.sm,
    borderRadius: theme.SIZES.sm / 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: theme.SIZES.xs,
  },
  activeDot: {
    width: theme.SIZES.lg,
    backgroundColor: theme.COLORS.goldPrimary,
    ...theme.SHADOWS.gold,
  },
});

export default OnboardingScreen;
