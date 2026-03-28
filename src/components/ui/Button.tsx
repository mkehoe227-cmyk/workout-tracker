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
    backgroundColor: theme.colors.accent,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.accent,
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
