import React from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';

interface LabeledInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function TextInput({ label, error, style, ...rest }: LabeledInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <RNTextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor="#555"
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#AAA',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#1C1C1E',
    color: '#FFF',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  inputError: {
    borderColor: '#FF453A',
  },
  error: {
    color: '#FF453A',
    fontSize: 12,
    marginTop: 4,
  },
});
