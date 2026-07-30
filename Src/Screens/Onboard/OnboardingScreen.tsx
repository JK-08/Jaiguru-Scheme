// Src/Screens/Onboard/OnboardingScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { IMAGE_BASE_URL } from '../../Config/BaseUrl';
import { useOnboardBanners } from '../../api/hooks/Onboard/useOnboardingBanners';
import NextButton from './components/NextButton';
import Pagination from './components/Pagination';
import { useSharedValue } from 'react-native-reanimated';
import { COLORS, FONTS } from '../../Utills/AppTheme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { banners, loading } = useOnboardBanners();
  const listRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const [index, setIndex] = useState(0);

  const isLast = index === (banners.length || 1) - 1;

  // Skip if already authenticated
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userDataStr = await AsyncStorage.getItem('userData');
        if (token && userDataStr) {
          const userData = JSON.parse(userDataStr);
          if (userData?.id) navigation.replace('MainDrawer');
        }
      } catch (_) { }
    })();
  }, [navigation]);

  const finish = useCallback(
    async (route: 'Login' | 'Register') => {
      try {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      } catch (_) { }
      navigation.replace(route);
    },
    [navigation],
  );

  const goNext = useCallback(() => {
    if (isLast) {
      finish('Register');
      return;
    }
    listRef.current?.scrollToOffset({ offset: (index + 1) * SCREEN_WIDTH, animated: true });
  }, [finish, index, isLast]);

  const onMomentumEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setIndex(newIndex);
    scrollX.value = e.nativeEvent.contentOffset.x;
  }, [scrollX]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.value = e.nativeEvent.contentOffset.x;
  }, [scrollX]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.brand} />
      </View>
    );
  }

  if (!banners.length) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.brand} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <FlatList
        style={styles.list}
        ref={listRef}
        data={banners}
        keyExtractor={(item) => String(item.BannerId)}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumEnd}
        decelerationRate="fast"
        renderItem={({ item }) => (
          <Image
            source={{ uri: `${IMAGE_BASE_URL}${item.image_path}` }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        )}
      />

      {/* Bottom overlay */}
      <LinearGradient
        colors={[COLORS.transparent, COLORS.scrimHeavy]}
        style={[styles.overlay, { paddingBottom: insets.bottom + 24 }]}
        pointerEvents="box-none"
      >
        <Pagination count={banners.length} scrollX={scrollX} width={SCREEN_WIDTH} />

        <View style={styles.ctaWrap}>




          {isLast && (
            <Pressable
              onPress={() => finish('Login')}
              hitSlop={12}
              style={({ pressed }) => [styles.loginBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.loginBtnText}> Sign In</Text>
            </Pressable>
          )}

          {!isLast && (
            <Pressable
              onPress={() => finish('Login')}
              hitSlop={12}
              style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          )}
          <NextButton
            label={isLast ? 'Sign Up' : 'Next'}
            onPress={goNext}
            showArrow={!isLast}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.black },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white },
  list: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  bannerImage: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 40,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  ctaWrap: { marginTop: 10, width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12 },
  skipBtn: {
    flex: 1,
    height: 50,
    borderRadius: 26,
    backgroundColor: COLORS.brandStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 16,
    color: COLORS.contentOnBrand,
    fontFamily: FONTS.family.semiBold,
  },
  loginBtn: {
    flex: 1,
    height: 50,
    borderRadius: 26,
    backgroundColor: COLORS.brandStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    fontSize: 16,
    color: COLORS.contentOnBrand,
    fontFamily: FONTS.family.semiBold,
  },
});

export default OnboardingScreen;
