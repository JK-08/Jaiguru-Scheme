// styles.js
import { StyleSheet } from "react-native";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../Utills/AppTheme";

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    height: SIZES.tabBar.height,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: SIZES.padding.xs,
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

  // Optional: Add a small indicator for active tab
  activeIndicator: {
    position: "absolute",
    top: 0,
    width: SIZES.radius.sm * 2,
    height: SIZES.radius.sm * 0.5,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: SIZES.radius.xs,
    borderBottomRightRadius: SIZES.radius.xs,
  },

  // Optional: Special style for the "Pay Now" button to make it stand out
  payNowContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SIZES.padding.xs,
    marginTop: -SIZES.margin.md,
  },

  payNowIconContainer: {
    width: SIZES.icon.xl * 1.2,
    height: SIZES.icon.xl * 1.2,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.blue,
  },

  payNowActiveIconContainer: {
    backgroundColor: COLORS.secondary,
    ...SHADOWS.gold,
  },

  payNowText: {
    fontSize: SIZES.font.xs,
    fontFamily: FONTS.family.medium,
    color: COLORS.primary,
    marginTop: SIZES.margin.xs,
  },

  payNowActiveText: {
    color: COLORS.secondary,
  },
});

export default styles;