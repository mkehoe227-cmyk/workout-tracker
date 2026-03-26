import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import type { RegisterScreenProps } from '../../navigation/types';

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use': return 'An account with this email already exists.';
    case 'auth/invalid-email': return 'Invalid email address.';
    case 'auth/weak-password': return 'Password must be at least 6 characters.';
    default: return 'Something went wrong. Please try again.';
  }
}

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError('');
    if (!displayName.trim()) {
      setError('Please enter your name.');
      return;
    }
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim(),
        email: user.email,
        preferredUnit: 'lbs',
        createdAt: serverTimestamp(),
      });
    } catch (e: any) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start tracking your progress</Text>

        <View style={styles.form}>
          <TextInput
            label="Name"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            autoComplete="name"
            placeholder="Your name"
          />
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="you@example.com"
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            placeholder="At least 6 characters"
            error={error}
          />

          <Button title="Create Account" onPress={handleRegister} loading={loading} style={styles.button} />
          <Button
            title="Already have an account"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0F0F0F' },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: '#888',
    fontSize: 16,
    marginBottom: 40,
  },
  form: {
    gap: 4,
  },
  button: {
    marginTop: 8,
  },
});
