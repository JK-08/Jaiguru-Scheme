// components/SliderComponentSimple.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Image,
  ActivityIndicator,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useSchemeSliders } from "../../Hooks/useSlider";
import { IMAGE_BASE_URL } from "../../Config/BaseUrl";
import { COLORS, SIZES, FONTS, SHADOWS, moderateScale } from "../../Utills/AppTheme";

const { width } = Dimensions.get("window");

const SliderComponentSimple = () => {
  const { sliders, loading, error } = useSchemeSliders();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  // Auto-scroll every 4 seconds
  useEffect(() => {
    if (!sliders || sliders.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % sliders.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, sliders]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleDotPress = (index) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load sliders</Text>
      </View>
    );
  }

  if (!sliders || sliders.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={sliders}
        keyExtractor={(item) => item.SliderId.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image
              source={{ uri: `${IMAGE_BASE_URL}${item.image_path}` }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}
      />

      {/* Pagination Dots */}
      {sliders.length > 1 && (
        <View style={styles.pagination}>
          {sliders.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleDotPress(index)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View
                style={[
                  styles.dot,
                  index === currentIndex && styles.activeDot,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: SIZES.margin.md,
     marginTop: SIZES.margin.md,
  },
  slide: {
    width: width,
    paddingHorizontal: SIZES.padding.container,
  },
  image: {
    width: "100%",
    height: moderateScale(200),
    borderRadius: SIZES.radius.lg,
    backgroundColor: COLORS.backgroundSecondary,
    ...SHADOWS.md,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SIZES.margin.md,
  },
  dot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.gray300,
    marginHorizontal: SIZES.margin.xs / 2,
  },
  activeDot: {
    width: moderateScale(24),
    backgroundColor: COLORS.primary,
  },
  loadingContainer: {
    width: "100%",
    height: moderateScale(180),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundSecondary,
    marginHorizontal: SIZES.padding.container,
    borderRadius: SIZES.radius.lg,
    marginBottom: SIZES.margin.md,
  },
  errorContainer: {
    width: "100%",
    height: moderateScale(100),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.errorLight,
    marginHorizontal: SIZES.padding.container,
    borderRadius: SIZES.radius.lg,
    marginBottom: SIZES.margin.md,
  },
  errorText: {
    ...FONTS.bodySmall,
    color: COLORS.white,
  },
});

export default SliderComponentSimple;