import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  PressableProps,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme';

interface ButtonProps extends PressableProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'outline';
  style?: ViewStyle;
}

export function Button({ title, loading, variant = 'primary', style, disabled, ...rest }: ButtonProps) {
  const isOutline = variant === 'outline';
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        isOutline ? styles.outline : styles.primary,
        (pressed || disabled || loading) && styles.pressed,
        style,
      ]}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? theme.colors.accent : theme.colors.textOnAccent} />
      ) : (
        <Text style={[styles.text, isOutline && styles.textOutline]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: theme.radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  primary: {
    backgroundColor: theme.colors.buttonPrimary,
  },
  outline: {
    backgroundColor: 'rgba(15, 32, 64, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(91, 163, 217, 0.3)',
  },
  pressed: {
    opacity: 0.65,
  },
  text: {
    color: theme.colors.textOnAccent,
    fontSize: 16,
    fontWeight: '600',
  },
  textOutline: {
    color: theme.colors.accent,
  },
});
