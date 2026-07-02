// Src/Screens/WebView/WebViewScreen.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, RouteProp } from '@react-navigation/native';
import CommonHeader from '../../Components/CommonHeader/CommonHeader';
import theme from '../../Utills/AppTheme';

const { COLORS } = theme;

export interface WebViewScreenRouteParams {
  url?: string;
  title?: string;
}

const WebViewScreen = () => {
  const { params } = useRoute<RouteProp<Record<string, WebViewScreenRouteParams>, string>>();
  const { url, title } = params || {};

  return (
    <View style={styles.container}>
      <CommonHeader title={title || 'Info'} />
      <WebView
        source={{ uri: url }}
        startInLoadingState
        renderLoading={() => <ActivityIndicator style={StyleSheet.absoluteFill} size="large" color={COLORS.primary} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default WebViewScreen;
