// Src/Navigations/navigationRef.ts
//
// A navigation ref reachable from outside the React tree — needed so
// notification handlers (which fire from Firebase listeners registered at
// the module level, not inside a screen) can navigate the app when the user
// taps a push notification, whether the app was in the foreground,
// background, or fully closed. Attach via <NavigationContainer ref={navigationRef}>.
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

/**
 * Navigate to a screen by name, optionally with params. Safe to call before
 * the container has mounted — it just no-ops instead of throwing, since a
 * notification can theoretically be handled before the nav tree is ready.
 */
export function navigate(name: string, params?: Record<string, any>) {
  if (!navigationRef.isReady()) {
    console.log('[navigationRef] navigate() called before container was ready — ignoring', { name, params });
    return;
  }
  (navigationRef.navigate as any)(name, params);
}

// ─── Notification deep-link resolution ──────────────────────────────────────
// Lives here (rather than in NotificationHelper.ts) so both NotificationHelper
// and NotificationBanner can import it without creating a circular dependency
// between the two.
const SCREEN_ALIASES: Record<string, string> = {
  home: 'MainDrawer',
  schemes: 'AllSchemes',
  myschemes: 'AllSchemes',
  support: 'HelpCenter',
  help: 'HelpCenter',
  profile: 'Profile',
  notifications: 'NotificationScreen',
  paymentreceipt: 'PaymentReceipt',
  passbook: 'SchemePassbook',
};

/** Maps a notification's `data.screen` value to an actual route and navigates. */
export function handleNotificationNavigation(data?: Record<string, string> | undefined): void {
  const requested = data?.screen?.trim();
  const target = (requested && (SCREEN_ALIASES[requested.toLowerCase()] || requested)) || 'NotificationScreen';
  try {
    navigate(target);
  } catch (e) {
    console.log('[navigationRef] Failed to navigate from notification tap, falling back to NotificationScreen', e);
    navigate('NotificationScreen');
  }
}
