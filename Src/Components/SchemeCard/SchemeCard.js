import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import { useSchemes } from "../../Hooks/useScheme";
import { useNavigation } from "@react-navigation/native";
import placeholderImage from "../../Assets/Company/logo.png";
import {
  COLORS,
  SIZES,
  FONTS,
  moderateScale,
  SHADOWS,
} from "../../Utills/AppTheme";
import { IMAGE_BASE_URL } from "../../Config/BaseUrl";

export default function SchemeCardSlider() {
  const { schemes, loading, error } = useSchemes();
  const navigation = useNavigation();

  if (!schemes || schemes.length === 0) return null;

  const screenWidth = Dimensions.get("window").width;
  const CARD_WIDTH = screenWidth * 0.85; // 85% width
  const CARD_MARGIN = SIZES.md; // Fixed margin between cards
  const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN; // Include margin for snapping

  // Find index of SchemeId 17 to scroll to it
  const initialIndex = schemes.findIndex(scheme => scheme.SchemeId === 17);

  const handleJoinScheme = (scheme) => {
    // Navigate and pass entire scheme object
    navigation.navigate("MemberCreation", { scheme });
  };

  const handleKnowMore = (scheme) => {
    navigation.navigate("KnowMore", { scheme });
  };

  const renderItem = ({ item }) => {
    const imageUri = item.image_path
      ? `${IMAGE_BASE_URL}${item.image_path}`
      : placeholderImage;

    return (
      <View
        style={[
          styles.cardContainer,
          { width: CARD_WIDTH, marginRight: CARD_MARGIN },
        ]}
      >
        <ImageBackground
          source={typeof imageUri === "string" ? { uri: imageUri } : imageUri}
          style={styles.imageBackground}
          resizeMode="cover"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.knowMoreButton]}
            onPress={() => handleKnowMore(item)}
          >
            <Text style={styles.knowMoreButtonText}>Know More</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.joinButton]}
            onPress={() => handleJoinScheme(item)}
          >
            <Text style={styles.joinButtonText}>Join Scheme</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={schemes}
      keyExtractor={(item) => item.SchemeId.toString()}
      renderItem={renderItem}
      horizontal
      pagingEnabled
      snapToInterval={SNAP_INTERVAL}
      snapToAlignment="center"
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: (screenWidth - CARD_WIDTH) / 7,
        paddingVertical: SIZES.md,
      }}
      // Scroll to SchemeId 17 initially
      initialScrollIndex={initialIndex >= 0 ? initialIndex : 0}
      getItemLayout={(data, index) => ({
        length: SNAP_INTERVAL,
        offset: SNAP_INTERVAL * index,
        index,
      })}
    />
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: SIZES.radius.lg,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
    ...SHADOWS.medium,
  },
  imageBackground: {
    width: "100%",
    height: moderateScale(180),
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: SIZES.md,
    backgroundColor: COLORS.background,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  knowMoreButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginRight: moderateScale(8),
  },
  joinButton: {
    backgroundColor: COLORS.secondary,
    marginLeft: moderateScale(8),
  },
  knowMoreButtonText: {
    ...FONTS.bodySmall,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  joinButtonText: {
    ...FONTS.bodySmall,
    color: COLORS.textInverse,
    fontWeight: "600",
  },
});
