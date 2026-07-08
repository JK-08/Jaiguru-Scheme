// Src/Components/ui/appcomponents/AppToast.tsx
//
// App-wide toast/snackbar system. Wrap the app root with <AppToastProvider>
// once (done in App.tsx), then call useToast().show(...) from anywhere —
// no prop drilling or per-screen toast state needed.
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import theme from '../../../Utills/AppTheme';

const { COLORS, SIZES, FONTS } = theme;

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

interface ToastState {
  visible: boolean;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_CONFIG: Record<ToastVariant, { bg: string; icon: string }> = {
  default: { bg: COLORS.gray900, icon: 'information-circle' },
  success: { bg: COLORS.success, icon: 'checkmark-circle' },
  error: { bg: COLORS.error, icon: 'close-circle' },
  warning: { bg: COLORS.warning, icon: 'warning' },
  info: { bg: COLORS.info, icon: 'information-circle' },
};

export const AppToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', variant: 'default' });
  const translateY = useRef(new Animated.Value(100)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.timing(translateY, { toValue: 100, duration: 200, useNativeDriver: true }).start(() => {
      setToast((t) => ({ ...t, visible: false }));
    });
  }, [translateY]);

  const show = useCallback(
    (message: string, variant: ToastVariant = 'default', durationMs = 2800) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToast({ visible: true, message, variant });
      translateY.setValue(100);
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 20 }).start();
      hideTimer.current = setTimeout(hide, durationMs);
    },
    [hide, translateY]
  );

  const config = VARIANT_CONFIG[toast.variant];

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast.visible ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.container, { backgroundColor: config.bg, transform: [{ translateY }] }]}
        >
          <Icon name={config.icon} size={20} color={COLORS.white} style={{ marginRight: SIZES.sm }} />
          <Text style={[FONTS.bodyMedium, styles.text]} numberOfLines={2}>
            {toast.message}
          </Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
};

/** Call from anywhere below <AppToastProvider>: const toast = useToast(); toast.show('Saved!', 'success'); */
export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fail soft instead of crashing screens that render before the provider
    // mounts, or in isolated tests — matches this app's general no-boundary
    // risk profile, so this one component avoids adding another crash point.
    return { show: () => {} };
  }
  return ctx;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: SIZES.padding.lg,
    right: SIZES.padding.lg,
    bottom: SIZES.padding.xxl,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  text: {
    color: COLORS.white,
    flex: 1,
  },
});

export default AppToastProvider;
