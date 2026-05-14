import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Modal, View, StyleSheet, ActivityIndicator,
  TouchableOpacity, Text, Linking, AppState, StatusBar, Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { COLORS, SIZES, FONTS } from "../Utills/AppTheme";

// ─── Constants ────────────────────────────────────────────────────────────────
const UPI_SCHEMES = [
  "gpay://", "phonepe://", "paytmmp://", "upi://",
  "bhim://", "tez://", "credpay://", "mobikwik://",
];

const THEME = {
  bg:      COLORS.backgroundSecondary,
  surface: COLORS.white,
  border:  COLORS.border,
  accent:  COLORS.primary,
  text:    COLORS.textPrimary,
  textSec: COLORS.textSecondary,
  error:   COLORS.error,
  white:   COLORS.white,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isUpiDeepLink = (url) =>
  UPI_SCHEMES.some((scheme) => url?.startsWith(scheme));

const buildHtml = (options) => {
  const o = options;
  const safeStr = (s) => String(s || "").replace(/"/g, "&quot;").replace(/`/g, "\\`");

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0F0F1A; font-family: -apple-system, sans-serif; }
  </style>
</head>
<body>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
(function () {
  var paymentDone = false;

  function post(obj) {
    window.ReactNativeWebView.postMessage(JSON.stringify(obj));
  }

  // Intercept new-window navigation (3DS, NetBanking)
  window.open = function (url) {
    post({ type: 'newwindow', url: url });
    return window;
  };

  var rzp = new Razorpay({
    key:         "${safeStr(o.key)}",
    amount:      ${parseInt(o.amount) || 0},
    currency:    "${safeStr(o.currency || "INR")}",
    order_id:    "${safeStr(o.order_id)}",
    name:        "${safeStr(o.name)}",
    description: "${safeStr(o.description)}",
    prefill: {
      name:    "${safeStr(o.prefill?.name)}",
      email:   "${safeStr(o.prefill?.email)}",
      contact: "${safeStr(o.prefill?.contact)}"
    },
    theme: { color: "${safeStr(o.theme?.color || COLORS.primary)}" },
    handler: function (response) {
      paymentDone = true;
      post({ type: 'success', data: response });
    },
    modal: {
      escape:        false,
      backdropclose: false,
      ondismiss: function () {
        post({ type: 'dismiss', paymentDone: paymentDone });
      }
    }
  });

  rzp.on('payment.failed', function (response) {
    paymentDone = true;
    post({ type: 'failed', data: response.error });
  });

  // Expose status-check hook for UPI return
  window.rzpCheckStatus = function () {
    rzp.open();
  };

  rzp.open();
})();
</script>
</body>
</html>`;
};

// ─── Header Component ─────────────────────────────────────────────────────────
const WebViewHeader = ({ title, onBack }) => (
  <View style={headerStyles.container}>
    <TouchableOpacity style={headerStyles.backBtn} onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Text style={headerStyles.backIcon}>‹</Text>
    </TouchableOpacity>
    <Text style={headerStyles.title} numberOfLines={1}>{title}</Text>
    <View style={headerStyles.spacer} />
  </View>
);

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row", alignItems: "center", height: 52,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    paddingHorizontal: SIZES.padding.sm,
  },
  backBtn:  { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 32, color: COLORS.textPrimary, lineHeight: 36 },
  title:    { flex: 1, fontSize: SIZES.font.lg, fontFamily: FONTS.family.semiBold, color: COLORS.textPrimary, textAlign: "center" },
  spacer:   { width: 44 },
});

// ─── Loading Overlay ──────────────────────────────────────────────────────────
const LoadingOverlay = () => (
  <View style={overlayStyles.container}>
    <ActivityIndicator size="large" color={THEME.accent} />
    <Text style={overlayStyles.text}>Loading secure checkout…</Text>
  </View>
);

const overlayStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: "center", justifyContent: "center",
  },
  text: { color: COLORS.textSecondary, fontSize: SIZES.font.sm, fontFamily: FONTS.family.regular, marginTop: SIZES.sm },
});

// ─── Main Component ───────────────────────────────────────────────────────────
const RazorpayWebView = ({ visible, options, onSuccess, onDismiss }) => {
  const mainWebViewRef = useRef(null);
  const bankWebViewRef = useRef(null);

  // Refs (no re-render needed)
  const paymentDone  = useRef(false);
  const upiLaunched  = useRef(false);
  const dismissed    = useRef(false);

  const [bankUrl,       setBankUrl]       = useState(null);
  const [bankTitle,     setBankTitle]     = useState("Bank Authentication");
  const [mainLoading,   setMainLoading]   = useState(true);

  // Reset all state when modal opens
  useEffect(() => {
    if (visible) {
      paymentDone.current = false;
      upiLaunched.current = false;
      dismissed.current   = false;
      setBankUrl(null);
      setMainLoading(true);
    }
  }, [visible]);

  // UPI app return — trigger Razorpay status check
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && upiLaunched.current && !paymentDone.current) {
        upiLaunched.current = false;
        mainWebViewRef.current?.injectJavaScript(
          "if (window.rzpCheckStatus) window.rzpCheckStatus(); true;"
        );
      }
    });
    return () => sub.remove();
  }, []);

  // ── Message handler ──
  const handleMessage = useCallback((event) => {
    let msg;
    try { msg = JSON.parse(event.nativeEvent.data); }
    catch { return; }

    switch (msg.type) {
      case "success": {
        paymentDone.current = true;
        setBankUrl(null);
        onSuccess(msg.data);
        break;
      }
      case "failed": {
        paymentDone.current = true;
        setBankUrl(null);
        onSuccess({ failed: true, error: msg.data });
        break;
      }
      case "dismiss": {
        if (!paymentDone.current && !msg.paymentDone && !dismissed.current) {
          dismissed.current = true;
          setBankUrl(null);
          // Let parent decide: treat dismissed as user cancellation
          onDismiss?.();
          onSuccess({ failed: true, error: "Payment cancelled by user" });
        }
        break;
      }
      case "newwindow": {
        if (msg.url) setBankUrl(msg.url);
        break;
      }
      default:
        break;
    }
  }, [onSuccess, onDismiss]);

  // ── UPI deep-link guard ──
  const shouldStartLoad = useCallback((req) => {
    if (isUpiDeepLink(req.url)) {
      upiLaunched.current = true;
      Linking.openURL(req.url).catch(() => {});
      return false;
    }
    return true;
  }, []);

  // ── Bank WebView navigation ──
  const handleBankNav = useCallback((navState) => {
    if (navState.title) setBankTitle(navState.title);
  }, []);

  const closeBankView = useCallback(() => setBankUrl(null), []);

  // ── Guard: no options ──
  if (!options) return null;

  const htmlContent = buildHtml(options);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        // Android back: only dismiss if no payment in progress
        if (!paymentDone.current) {
          dismissed.current = true;
          onDismiss?.();
          onSuccess({ failed: true, error: "Payment cancelled by user" });
        }
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />
      <View style={styles.container}>

        {/* Bank WebView (3DS / NetBanking) */}
        {bankUrl ? (
          <View style={StyleSheet.absoluteFill}>
            <WebViewHeader title={bankTitle} onBack={closeBankView} />
            <WebView
              ref={bankWebViewRef}
              source={{ uri: bankUrl }}
              onNavigationStateChange={handleBankNav}
              startInLoadingState
              renderLoading={() => <LoadingOverlay />}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={["*"]}
              mixedContentMode="always"
              style={styles.flex}
            />
          </View>
        ) : (
          /* Main Razorpay WebView */
          <View style={styles.flex}>
            <WebView
              ref={mainWebViewRef}
              source={{ html: htmlContent }}
              onMessage={handleMessage}
              onShouldStartLoadWithRequest={shouldStartLoad}
              onLoadStart={() => setMainLoading(true)}
              onLoadEnd={()   => setMainLoading(false)}
              startInLoadingState={false}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={["*"]}
              mixedContentMode="always"
              setSupportMultipleWindows={false}
              style={styles.flex}
            />
            {mainLoading && <LoadingOverlay />}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    paddingTop: Platform.OS === "ios" ? 0 : StatusBar.currentHeight || 0,
  },
  flex: { flex: 1 },
});

export default RazorpayWebView;