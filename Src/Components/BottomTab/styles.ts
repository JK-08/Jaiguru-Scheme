// styles.ts
import { StyleSheet } from "react-native";
import { COLORS, SIZES, FONTS, ELEVATION } from "../../Utills/AppTheme";

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    minHeight: SIZES.tabBarHeight,
    borderTopWidth: 1,
    borderTopColor: COLORS.accentSubtle,
    paddingTop: SIZES.space.xs,
    ...ELEVATION.floating,
  },

  footerBtnContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SIZES.space.xs,
  },

  activeText: {
    fontSize: SIZES.text.xxs,
    fontFamily: FONTS.family.medium,
    color: COLORS.contentBrand,
    marginTop: SIZES.space.xs,
    textAlign: "center",
    includeFontPadding: false,
  },

  inactiveText: {
    fontSize: SIZES.text.xxs,
    fontFamily: FONTS.family.regular,
    color: COLORS.contentSecondary,
    marginTop: SIZES.space.xs,
    textAlign: "center",
    includeFontPadding: false,
  },

  // Unread-count badge on the Alerts tab icon.
  tabBadge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  tabBadgeText: {
    fontSize: 9,
    fontFamily: FONTS.family.bold,
    color: COLORS.contentOnBrand,
    includeFontPadding: false,
  },

  // Small dot under the icon of the active (non-center) tab.
  activeDot: {
    position: "absolute",
    top: -5,
    width: SIZES.radius.sm * 0.7,
    height: SIZES.radius.sm * 0.7,
    borderRadius: SIZES.radius.pill,
    backgroundColor: COLORS.brand,
  },

  // Center "Home" tab — elevated pill/FAB style so it visually anchors the
  // middle of the bar as requested.
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerIconWrap: {
    width: SIZES.icon.xl * 1.3,
    height: SIZES.icon.xl * 1.3,
    borderRadius: SIZES.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.surface,
    ...ELEVATION.brandGlow,
  },
  centerIconActive: {
    backgroundColor: COLORS.brand,
  },
  centerIconInactive: {
    backgroundColor: COLORS.contentSecondary,
  },
  centerActiveText: {
    fontSize: SIZES.text.xxs,
    fontFamily: FONTS.family.bold,
    color: COLORS.contentBrand,
    marginTop: SIZES.space.xs,
    textAlign: "center",
    includeFontPadding: false,
  },
  centerInactiveText: {
    fontSize: SIZES.text.xxs,
    fontFamily: FONTS.family.medium,
    color: COLORS.contentSecondary,
    marginTop: SIZES.space.xs,
    textAlign: "center",
    includeFontPadding: false,
  },
});

export default styles;
