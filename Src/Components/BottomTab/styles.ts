// styles.ts
import { StyleSheet } from "react-native";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../Utills/AppTheme";

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    minHeight: SIZES.tabBar.height,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderChampagne,
    paddingTop: SIZES.padding.xs,
    ...SHADOWS.md,
  },

  footerBtnContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SIZES.padding.xs,
  },

  activeText: {
    fontSize: SIZES.font.xs,
    fontFamily: FONTS.family.medium,
    color: COLORS.accentDark,
    marginTop: SIZES.margin.xs,
    textAlign: "center",
    includeFontPadding: false,
  },

  inactiveText: {
    fontSize: SIZES.font.xs,
    fontFamily: FONTS.family.regular,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin.xs,
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
    backgroundColor: COLORS.error,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  tabBadgeText: {
    fontSize: 9,
    fontFamily: FONTS.family.bold,
    color: COLORS.white,
    includeFontPadding: false,
  },

  // Small dot under the icon of the active (non-center) tab.
  activeDot: {
    position: "absolute",
    top: 0,
    width: SIZES.radius.sm * 0.7,
    height: SIZES.radius.sm * 0.7,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.accentDark,
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
    borderRadius: SIZES.radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.gold,
  },
  centerIconActive: {
    backgroundColor: COLORS.accentDark,
  },
  centerIconInactive: {
    backgroundColor: COLORS.textSecondary,
  },
  centerActiveText: {
    fontSize: SIZES.font.xs,
    fontFamily: FONTS.family.bold,
    color: COLORS.accentDark,
    marginTop: SIZES.margin.xs,
    textAlign: "center",
    includeFontPadding: false,
  },
  centerInactiveText: {
    fontSize: SIZES.font.xs,
    fontFamily: FONTS.family.medium,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin.xs,
    textAlign: "center",
    includeFontPadding: false,
  },
});

export default styles;
