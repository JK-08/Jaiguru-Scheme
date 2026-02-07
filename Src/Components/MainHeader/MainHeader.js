import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useCompany } from "../../Hooks/useCompany";
import { useTodayRate } from "../../Hooks/useTodayRate";
import {
  COLORS,
  SIZES,
  FONTS,
  SHADOWS,
  moderateScale,
} from "../../Utills/AppTheme";
import { useNavigation, DrawerActions } from "@react-navigation/native";

const HomeHeaderRedesigned = ({
  onMenuPress,
  onNotificationPress,
  onLogoPress,
}) => {
  const {
    company,
    loading: companyLoading,
    error: companyError,
  } = useCompany();
  const { rates, loading: ratesLoading, error: ratesError } = useTodayRate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigation = useNavigation();

  const handleMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Format time to 12-hour format
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* Top Row: Menu Icon, Logo & Company Name, Notification */}
      <View style={styles.topRow}>
        {/* Right: Notification Icon */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Icon
            name="notifications-none"
            size={SIZES.icon.lg}
            color={COLORS.white}
          />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
        {/* Center: Logo and Company Name */}
        <TouchableOpacity
          style={styles.centerContainer}
          onPress={onLogoPress}
          activeOpacity={0.7}
          disabled={companyLoading}
        >
          {companyLoading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : company ? (
            <View style={styles.logoWrapper}>
              {company.CompanyLogoUrl ? (
                <Image
                  source={{ uri: company.CompanyLogoUrl }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.logo, styles.defaultLogo]}>
                  <Icon
                    name="business"
                    size={SIZES.icon.lg}
                    color={COLORS.goldPrimary}
                  />
                </View>
              )}
              <View style={styles.companyTextContainer}>
                <Text style={styles.companyName} numberOfLines={1}>
                  {company.COMPANY1NAME ||
                    company.COMPA1NYID ||
                    "Jaiguru Jewellers"}
                </Text>
              </View>
            </View>
          ) : companyError ? (
            <View style={styles.errorContainer}>
              <Icon
                name="error-outline"
                size={SIZES.icon.md}
                color={COLORS.errorLight}
              />
              <Text style={styles.errorText}>Failed to load</Text>
            </View>
          ) : null}
        </TouchableOpacity>
        {/* Left: Menu Icon */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleMenuPress} // Fixed: Using drawer open method
          activeOpacity={0.7}
        >
          <Icon name="menu" size={SIZES.icon.lg} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Bottom Row: Gold & Silver Rates with Updated Time */}
      <View style={styles.ratesContainer}>
        {/* Gold Rate Card */}
        <View style={styles.rateCard}>
          <View style={styles.rateHeader}>
            <Icon
              name="trending-up"
              size={SIZES.icon.md}
              color={COLORS.goldPrimary}
            />
            <Text style={styles.rateLabel}>GOLD</Text>
          </View>
          {ratesLoading ? (
            <ActivityIndicator size="small" color={COLORS.goldPrimary} />
          ) : ratesError ? (
            <Text style={styles.rateError}>N/A</Text>
          ) : (
            <Text style={styles.rateValue}>
              ₹{rates?.GOLDRATE?.toLocaleString("en-IN") || "--"}
            </Text>
          )}
          <Text style={styles.rateUnit}>per gram</Text>
        </View>

        {/* Vertical Divider */}
        <View style={styles.divider} />

        {/* Silver Rate Card */}
        <View style={styles.rateCard}>
          <View style={styles.rateHeader}>
            <Icon
              name="trending-up"
              size={SIZES.icon.md}
              color={COLORS.gray300}
            />
            <Text style={styles.rateLabel}>SILVER</Text>
          </View>
          {ratesLoading ? (
            <ActivityIndicator size="small" color={COLORS.gray300} />
          ) : ratesError ? (
            <Text style={styles.rateError}>N/A</Text>
          ) : (
            <Text style={[styles.rateValue, styles.silverValue]}>
              ₹{rates?.SILVERRATE?.toLocaleString("en-IN") || "--"}
            </Text>
          )}
          <Text style={styles.rateUnit}>per gram</Text>
        </View>
      </View>

      {/* Last Updated Time */}
      {rates && !ratesLoading && (
        <View style={styles.updateTimeContainer}>
          <Icon
            name="schedule"
            size={moderateScale(12)}
            color={COLORS.whiteOpacity70}
          />
          <Text style={styles.updateTimeText}>
            Updated: Today {formatTime(currentTime)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingTop: StatusBar.currentHeight || SIZES.padding.md,
    paddingBottom: SIZES.padding.lg,
    borderBottomLeftRadius: SIZES.radius.xl,
    borderBottomRightRadius: SIZES.radius.xl,
    ...SHADOWS.blueStrong,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding.lg,
    marginBottom: SIZES.margin.xs,
  },
  iconButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: 22,
    backgroundColor: COLORS.whiteOpacity20,
    alignItems: "center",
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    marginHorizontal: SIZES.margin.md,
    alignItems: "center",
  },
  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.whiteOpacity20,
    borderWidth: 2,
    borderColor: COLORS.goldOpacity30,
  },
  defaultLogo: {
    alignItems: "center",
    justifyContent: "center",
  },
  companyTextContainer: {
    marginLeft: SIZES.margin.sm,
    flex: 1,
    alignItems: "flex-start",
  },
  companyName: {
    ...FONTS.h5,
    color: COLORS.white,
    marginBottom: moderateScale(2),
  },
  companyAddress: {
    ...FONTS.caption,
    color: COLORS.whiteOpacity70,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    ...FONTS.bodySmall,
    color: COLORS.errorLight,
    marginLeft: SIZES.margin.xs,
  },
  notificationBadge: {
    position: "absolute",
    top: moderateScale(-4),
    right: moderateScale(-4),
    backgroundColor: COLORS.error,
    borderRadius: SIZES.radius.full,
    width: moderateScale(18),
    height: moderateScale(18),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  badgeText: {
    ...FONTS.caption,
    fontSize: SIZES.font.xxs,
    color: COLORS.white,
    fontWeight: FONTS.weight.bold,
  },
  ratesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: SIZES.margin.lg,
    backgroundColor: COLORS.blueOpacity30,
    borderRadius: SIZES.radius.lg,
    paddingVertical: SIZES.padding.md,
    paddingHorizontal: SIZES.padding.lg,
  },
  rateCard: {
    flex: 1,
    alignItems: "center",
  },
  rateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.margin.xs,
  },
  rateLabel: {
    ...FONTS.caption,
    color: COLORS.whiteOpacity80,
    fontWeight: FONTS.weight.semiBold,
    marginLeft: SIZES.margin.xs,
    letterSpacing: 1,
  },
  rateValue: {
    ...FONTS.h4,
    color: COLORS.goldPrimary,
    fontWeight: FONTS.weight.bold,
    marginTop: moderateScale(2),
  },
  silverValue: {
    color: COLORS.gray300,
  },
  rateUnit: {
    ...FONTS.caption,
    fontSize: SIZES.font.xxs,
    color: COLORS.whiteOpacity50,
    marginTop: moderateScale(2),
  },
  rateError: {
    ...FONTS.bodySmall,
    color: COLORS.errorLight,
    fontStyle: "italic",
  },
  divider: {
    width: 1,
    height: moderateScale(50),
    backgroundColor: COLORS.whiteOpacity30,
    marginHorizontal: SIZES.margin.md,
  },
  updateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SIZES.margin.xs,
    paddingHorizontal: SIZES.padding.lg,
  },
  updateTimeText: {
    ...FONTS.caption,
    fontSize: SIZES.font.xxs,
    color: COLORS.whiteOpacity70,
    marginLeft: SIZES.margin.xs,
  },
});

export default HomeHeaderRedesigned;
