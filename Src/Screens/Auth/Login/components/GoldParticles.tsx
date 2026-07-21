// Src/Screens/Auth/Login/components/GoldParticles.tsx
// -----------------------------------------------------------------------------
// Softly floating gold particles / sparkles for the luxury background.
// Reuses the onboarding FloatingElement primitive (DRY) and AppTheme colors.
// -----------------------------------------------------------------------------

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import theme from '../../../../Utills/AppTheme';
import FloatingElement from '../../../Onboard/components/FloatingElement';
import type { MCIconName } from '../../../Onboard/data';

const { COLORS } = theme;

interface Particle {
  icon: MCIconName;
  x: number; // 0–1 fraction of width
  y: number; // 0–1 fraction of height
  size: number;
  delay: number;
  amplitude: number;
  color: string;
}

const PARTICLES: readonly Particle[] = [
  { icon: 'star-four-points', x: 0.1, y: 0.08, size: 16, delay: 0, amplitude: 14, color: COLORS.accent },
  { icon: 'circle', x: 0.86, y: 0.06, size: 8, delay: 300, amplitude: 10, color: COLORS.accentLight },
  { icon: 'diamond-outline', x: 0.9, y: 0.22, size: 14, delay: 600, amplitude: 16, color: COLORS.accentDark },
  { icon: 'star-four-points-outline', x: 0.06, y: 0.26, size: 12, delay: 450, amplitude: 12, color: COLORS.accentDark },
  { icon: 'circle', x: 0.22, y: 0.02, size: 6, delay: 800, amplitude: 9, color: COLORS.accent },
  { icon: 'star-four-points', x: 0.72, y: 0.28, size: 10, delay: 950, amplitude: 11, color: COLORS.accentLight },
];

export interface GoldParticlesProps {
  width: number;
  height: number;
}

const GoldParticles: React.FC<GoldParticlesProps> = ({ width, height }) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    {PARTICLES.map((p, i) => (
      <FloatingElement
        key={i}
        amplitude={p.amplitude}
        delay={p.delay}
        duration={3200 + i * 300}
        style={[styles.particle, { left: p.x * width, top: p.y * height }]}
      >
        <MaterialCommunityIcons name={p.icon} size={p.size} color={p.color} />
      </FloatingElement>
    ))}
  </View>
);

const styles = StyleSheet.create({
  particle: { position: 'absolute', opacity: 0.7 },
});

export default React.memo(GoldParticles);
