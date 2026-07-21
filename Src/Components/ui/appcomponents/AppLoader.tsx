// Src/Components/ui/appcomponents/AppLoader.tsx
import React from 'react';
import { View, Text, ActivityIndicator, Modal, StyleProp, ViewStyle } from 'react-native';
import theme from '../../../Utills/AppTheme';

const { COLORS, SIZES, FONTS } = theme;

export interface AppLoaderProps {
  visible?: boolean;
  fullScreen?: boolean;
  overlay?: boolean;
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export default function AppLoader({
  visible = true,
  fullScreen = false,
  overlay = false,
  message,
  size = 'large',
  color = COLORS.accentDark,
  style,
}: AppLoaderProps) {
  if (!visible) return null;

  const content = (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={[FONTS.bodySmall, { marginTop: SIZES.margin.sm, color: COLORS.textSecondary }]}>{message}</Text>}
    </View>
  );

  if (overlay) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        <View style={{ flex: 1, backgroundColor: COLORS.overlayDark, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: SIZES.radius.lg,
              padding: SIZES.padding.xl,
              alignItems: 'center',
              minWidth: 120,
            }}
          >
            <ActivityIndicator size={size} color={color} />
            {message && (
              <Text style={[FONTS.bodySmall, { marginTop: SIZES.margin.sm, color: COLORS.textSecondary, textAlign: 'center' }]}>
                {message}
              </Text>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  if (fullScreen) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>{content}</View>;
  }

  return content;
}
