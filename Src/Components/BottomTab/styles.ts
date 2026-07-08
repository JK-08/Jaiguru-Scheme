// styles.ts
import { StyleSheet, Platform } from "react-native";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../Utills/AppTheme";

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.white,
    height: SIZES.tabBar.height,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === "ios" ? SIZES.padding.md : SIZES.padding.xs,
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
    color: COLORS.primary,
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

  // Small dot under the icon of the active (non-center) tab.
  activeDot: {
    position: "absolute",
    top: 0,
    width: SIZES.radius.sm * 0.7,
    height: SIZES.radius.sm * 0.7,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.primary,
  },

  // Center "Home" tab — elevated pill/FAB style so it visually anchors the
  // middle of the bar as requested.
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -SIZES.margin.xl,
  },
  centerIconWrap: {
    width: SIZES.icon.xl * 1.3,
    height: SIZES.icon.xl * 1.3,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.blue,
  },
  centerActiveText: {
    fontSize: SIZES.font.xs,
    fontFamily: FONTS.family.bold,
    color: COLORS.primary,
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
