// Src/Screens/Onboard/data.ts
// -----------------------------------------------------------------------------
// Onboarding content + strong types for the Jaiguru Jewellers premium flow.
// Illustrations are rendered as animated vectors (no image assets required).
// -----------------------------------------------------------------------------

import type { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../Utills/AppTheme';

/** Any valid MaterialCommunityIcons glyph name. */
export type MCIconName = keyof typeof MaterialCommunityIcons.glyphMap;

/** Which animated illustration to render for a given slide. */
export type IllustrationKey = 'welcome' | 'collections' | 'features' | 'join';

/** A small feature row shown on the "Smart Features" slide. */
export interface OnboardingFeature {
  readonly icon: MCIconName;
  readonly label: string;
}

/** A single floating jewellery ornament rendered around an illustration. */
export interface FloatingOrnament {
  readonly icon: MCIconName;
  /** Horizontal position as a 0–1 fraction of the illustration width. */
  readonly x: number;
  /** Vertical position as a 0–1 fraction of the illustration height. */
  readonly y: number;
  readonly size: number;
  /** Animation start delay (ms) so ornaments float out of sync. */
  readonly delay: number;
  /** Vertical travel distance for the float loop (px). */
  readonly amplitude: number;
  readonly color: string;
}

/** A pill/chip label rendered inside the collections illustration. */
export interface CollectionTag {
  readonly icon: MCIconName;
  readonly label: string;
}

/** Full definition of one onboarding slide. */
export interface OnboardingSlide {
  readonly id: string;
  readonly illustration: IllustrationKey;
  readonly eyebrow: string;
  readonly title: string;
  readonly highlight?: string; // portion of the title rendered in gold
  readonly subtitle: string;
  /** Primary CTA label for this slide. */
  readonly primaryLabel: string;
  /** Optional secondary text button (only the last slide uses this). */
  readonly secondaryLabel?: string;
  /** Central hero icon for the illustration medallion. */
  readonly heroIcon: MCIconName;
  /** Gradient used behind the hero medallion. */
  readonly heroGradient: readonly [string, string, ...string[]];
  /** Ornaments floating around the hero. */
  readonly ornaments: readonly FloatingOrnament[];
  /** Feature rows (features slide only). */
  readonly features?: readonly OnboardingFeature[];
  /** Category chips (collections slide only). */
  readonly collections?: readonly CollectionTag[];
}

// Amber accent ramp — sourced entirely from the global AppTheme so the
// onboarding shares one design system with the rest of the app.
export const GOLD = COLORS.accent;
export const GOLD_LIGHT = COLORS.accentSoft;
export const GOLD_DEEP = COLORS.accentStrong;
export const CHAMPAGNE = COLORS.accentSubtle;
export const INK = COLORS.contentPrimary;
export const INK_SOFT = COLORS.contentSecondary;

export const ONBOARDING_DATA: readonly OnboardingSlide[] = [
  {
    id: 'welcome',
    illustration: 'welcome',
    eyebrow: 'Jaiguru Digi Gold',
    title: 'Save Gold, Secure Your Future',
    highlight: 'Secure Your Future',
    subtitle:
      'Start your digital gold savings journey with trusted monthly schemes and build wealth effortlessly.',
    primaryLabel: 'Get Started',
    heroIcon: 'gold',
    heroGradient: [GOLD_LIGHT, GOLD, GOLD_DEEP],
    ornaments: [
      { icon: 'star-four-points', x: 0.12, y: 0.18, size: 22, delay: 0, amplitude: 14, color: GOLD },
      { icon: 'cash', x: 0.82, y: 0.12, size: 18, delay: 350, amplitude: 12, color: GOLD_DEEP },
      { icon: 'diamond-outline', x: 0.86, y: 0.66, size: 20, delay: 700, amplitude: 16, color: GOLD },
      { icon: 'wallet-outline', x: 0.10, y: 0.70, size: 18, delay: 500, amplitude: 10, color: GOLD_LIGHT },
      { icon: 'star-four-points-outline', x: 0.50, y: 0.03, size: 14, delay: 900, amplitude: 9, color: GOLD_DEEP },
    ],
  },

  {
    id: 'schemes',
    illustration: 'collections',
    eyebrow: 'Flexible Savings',
    title: 'Choose Your Gold Scheme',
    highlight: 'Gold Scheme',
    subtitle:
      'Select monthly savings plans that match your budget and redeem jewellery at maturity.',
    primaryLabel: 'Continue',
    heroIcon: 'wallet-plus',
    heroGradient: [GOLD_LIGHT, GOLD, GOLD_DEEP],
    ornaments: [
      { icon: 'cash-multiple', x: 0.06, y: 0.10, size: 18, delay: 200, amplitude: 12, color: GOLD },
      { icon: 'gold', x: 0.90, y: 0.08, size: 20, delay: 600, amplitude: 14, color: GOLD_DEEP },
    ],
    collections: [
      { icon: 'calendar-month', label: 'Monthly Plans' },
      { icon: 'wallet-outline', label: 'Easy Payments' },
      { icon: 'gold', label: 'Gold Savings' },
      { icon: 'gift-outline', label: 'Bonus Benefits' },
      { icon: 'diamond-stone', label: 'Redeem Jewellery' },
      { icon: 'shield-check-outline', label: 'Trusted Plans' },
    ],
  },

  {
    id: 'features',
    illustration: 'features',
    eyebrow: 'Everything in One App',
    title: 'Manage Your Savings Easily',
    highlight: 'Savings Easily',
    subtitle:
      'Track payments, monitor schemes, and redeem your jewellery—all from one secure app.',
    primaryLabel: 'Continue',
    heroIcon: 'cellphone',
    heroGradient: [GOLD_LIGHT, GOLD, GOLD_DEEP],
    ornaments: [
      { icon: 'star-four-points', x: 0.08, y: 0.06, size: 15, delay: 250, amplitude: 11, color: GOLD },
      { icon: 'gold', x: 0.90, y: 0.72, size: 18, delay: 650, amplitude: 13, color: GOLD_DEEP },
    ],
    features: [
      { icon: 'chart-line', label: 'Live Gold Rate' },
      { icon: 'calendar-check-outline', label: 'Pay Monthly Installments' },
      { icon: 'wallet-outline', label: 'Track Scheme Balance' },
      { icon: 'bell-outline', label: 'Payment Reminders' },
      { icon: 'gift-outline', label: 'Exclusive Scheme Benefits' },
      { icon: 'shield-check-outline', label: '100% Secure Payments' },
    ],
  },

  {
    id: 'join',
    illustration: 'join',
    eyebrow: 'Join Jaiguru Digi Gold',
    title: 'Begin Your Gold Savings Today',
    highlight: 'Gold Savings',
    subtitle:
      'Open your savings scheme in minutes, pay securely every month, and redeem your dream jewellery with confidence.',
    primaryLabel: 'Join Now',
    secondaryLabel: 'Login',
    heroIcon: 'gift',
    heroGradient: [GOLD_LIGHT, GOLD, GOLD_DEEP],
    ornaments: [
      { icon: 'star-four-points', x: 0.10, y: 0.12, size: 20, delay: 0, amplitude: 14, color: GOLD },
      { icon: 'gold', x: 0.84, y: 0.10, size: 20, delay: 300, amplitude: 15, color: GOLD_DEEP },
      { icon: 'wallet-plus', x: 0.86, y: 0.62, size: 18, delay: 600, amplitude: 12, color: GOLD },
      { icon: 'diamond-outline', x: 0.12, y: 0.66, size: 16, delay: 850, amplitude: 11, color: GOLD_DEEP },
    ],
  },
] as const;

export type OnboardingData = typeof ONBOARDING_DATA;
