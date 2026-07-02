// Src/Components/ui/appcomponents/ScreenWrapper.tsx
import React from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, StyleProp, ViewStyle, StatusBar } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import theme from '../../../Utills/AppTheme';

const { COLORS, SIZES } = theme;

export interface ScreenWrapperProps {
  children: React.ReactNode;
  scroll?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  backgroundColor?: string;
  paddingHorizontal?: number;
  paddingTop?: number;
  paddingBottom?: number;
  statusBarStyle?: 'light-content' | 'dark-content';
  statusBarBg?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export default function ScreenWrapper({
  children,
  scroll = false,
  onRefresh,
  refreshing = false,
  backgroundColor,
  paddingHorizontal,
  paddingTop = 0,
  paddingBottom = 24,
  statusBarStyle = 'dark-content',
  statusBarBg,
  edges = ['top', 'bottom'],
  header,
  footer,
  style,
  contentStyle,
}: ScreenWrapperProps) {
  const bg = backgroundColor ?? COLORS.background;
  const ph = paddingHorizontal ?? SIZES.padding.container;

  return (
    <SafeAreaView edges={edges} style={[styles.safe, { backgroundColor: bg }, style]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={statusBarBg ?? bg} />

      {header}

      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[{ paddingHorizontal: ph, paddingTop, paddingBottom }, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flat, { paddingHorizontal: ph, paddingTop, paddingBottom }, contentStyle]}>{children}</View>
      )}

      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flat: { flex: 1 },
});
