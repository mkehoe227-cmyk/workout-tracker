import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  /** Border thickness in px. Default: 1.5 */
  borderWidth?: number;
}

/**
 * Wraps content with an animated-look gradient border that separates cards
 * from the background gradient, similar to the HoverBorderGradient web component.
 *
 * Technique: LinearGradient fills the outer container (the "border"),
 * and an inner View sits on top with a 1.5px inset providing the glass interior.
 */
export function GlowCard({ children, style, innerStyle, borderWidth = 1.5 }: Props) {
  return (
    <LinearGradient
      colors={['rgba(91, 163, 217, 0.55)', 'rgba(70, 130, 180, 0.15)', 'rgba(255,255,255,0.04)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, style]}
    >
      <View style={[styles.inner, { margin: borderWidth }, innerStyle]}>
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: theme.radii.lg,
  },
  inner: {
    borderRadius: theme.radii.lg - 1,
    backgroundColor: 'rgba(10, 22, 44, 0.72)',
    overflow: 'hidden',
  },
});
