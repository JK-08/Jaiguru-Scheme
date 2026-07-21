// Src/Screens/Home/components/homeHeaderData.ts

import type { MaterialCommunityIcons } from '@expo/vector-icons';

export type MCIcon = keyof typeof MaterialCommunityIcons.glyphMap;

export interface CustomerProfile {
  name: string;
  memberId: string;
  avatarUrl?: string | null;
}

export interface SchemeSummary {
  name: string;
  monthlyAmount: number;
  paidInstallments: number;
  totalInstallments: number;
  maturityDate: string;
}

export interface WalletStat {
  icon: MCIcon;
  label: string;
  value: string;
}

export function getGreeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function getInitials(name: string): string {
  const cleaned = name.replace(/^(mr|mrs|ms|dr)\.?\s+/i, '').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
