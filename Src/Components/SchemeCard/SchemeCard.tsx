// Src/Components/SchemeCard/SchemeCard.tsx
import React from 'react';
import { View, FlatList, StyleSheet, ImageBackground, TouchableOpacity, Text, Dimensions } from 'react-native';
import { useSchemeCatalog } from '../../api/hooks/Schemes/useSchemeCatalog';
import { Scheme } from '../../types/Scheme/Scheme';
import { useNavigation } from '@react-navigation/native';
import placeholderImage from '../../Assets/Company/logo.png';
import { COLORS, SIZES, FONTS, moderateScale, ELEVATION } from '../../Utills/AppTheme';
import { IMAGE_BASE_URL } from '../../Config/BaseUrl';

export default function SchemeCardSlider() {
  const { schemes, loading } = useSchemeCatalog();
  const navigation = useNavigation<any>();

  // const filtered = schemes.filter((s) => s.SchemeId === 17);
  // if (loading || filtered.length === 0) return null;

  const screenWidth = Dimensions.get('window').width;
  const CARD_WIDTH = screenWidth * 0.85;
  const CARD_MARGIN = SIZES.space.lg;
  const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN;
  const IMAGE_HEIGHT = CARD_WIDTH * (9 / 16);

  const handleJoinScheme = (scheme: Scheme) => {
    navigation.navigate('MemberCreation', { scheme });
  };

  const handleKnowMore = (scheme: Scheme) => {
    navigation.navigate('KnowMore', { scheme });
  };

  const renderItem = ({ item }: { item: Scheme & { image_path?: string } }) => {
    const imageUri = item.image_path ? `${IMAGE_BASE_URL}${item.image_path}` : placeholderImage;

    return (
      <View style={[styles.cardContainer, { width: CARD_WIDTH, marginRight: CARD_MARGIN }]}>
        <ImageBackground
          source={typeof imageUri === 'string' ? { uri: imageUri } : imageUri}
          style={[styles.imageBackground, { height: IMAGE_HEIGHT }]}
          resizeMode="cover"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.actionButton, styles.knowMoreButton]} onPress={() => handleKnowMore(item)}>
            <Text style={styles.knowMoreButtonText}>Know More</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.joinButton]} onPress={() => handleJoinScheme(item)}>
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
        paddingHorizontal: (screenWidth - CARD_WIDTH) / 2,
        paddingVertical: SIZES.space.lg,
      }}
    />
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    ...ELEVATION.floating,
  },
  imageBackground: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SIZES.space.lg,
    backgroundColor: COLORS.surfacePage,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SIZES.space.sm,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  knowMoreButton: {
    backgroundColor: COLORS.brand,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginRight: moderateScale(8),
  },
  joinButton: {
    backgroundColor: COLORS.brand,
    marginLeft: moderateScale(8),
    padding: moderateScale(12),
  },
  knowMoreButtonText: {
    ...FONTS.bodySm,
    color: COLORS.contentOnBrand,
    fontWeight: 'bold',
  },
  joinButtonText: {
    ...FONTS.bodySm,
    color: COLORS.contentOnInverse,
    fontWeight: 'bold',
  },
});
