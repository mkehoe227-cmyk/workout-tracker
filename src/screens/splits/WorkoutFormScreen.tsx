import React, { useState, useLayoutEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../hooks/useAuth';
import { useWorkouts } from '../../hooks/useWorkouts';
import { createWorkout, updateWorkout } from '../../services/splitsService';
import type { PlansStackParamList, WorkoutFormScreenProps } from '../../navigation/types';

type Nav = NativeStackNavigationProp<PlansStackParamList>;

export function WorkoutFormScreen() {
  const { user } = useAuth();
  const nav = useNavigation<Nav>();
  const route = useRoute<WorkoutFormScreenProps['route']>();
  const { splitId, workoutId } = route.params;
  const { workouts } = useWorkouts(user?.uid ?? '', splitId);
  const isEditing = !!workoutId;

  const existing = useMemo(
    () => (workoutId ? workouts.find(w => w.id === workoutId) : null),
    [workouts, workoutId]
  );

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    nav.setOptions({ title: isEditing ? 'Edit Workout' : 'New Workout' });
  }, [isEditing]);

  async function handleSave() {
    if (!name.trim()) {
      setError('Workout name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isEditing && workoutId) {
        await updateWorkout(user!.uid, splitId, workoutId, {
          name: name.trim(),
          description: description.trim(),
        });
        nav.goBack();
      } else {
        const newId = await createWorkout(user!.uid, splitId, {
          name: name.trim(),
          description: description.trim(),
        });
        nav.replace('WorkoutDetail', { splitId, workoutId: newId });
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to save workout');
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Workout Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Push Day, Leg Day, Upper Body"
          placeholderTextColor="#555"
          autoFocus={!isEditing}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Optional notes about this workout"
          placeholderTextColor="#555"
          multiline
          numberOfLines={3}
        />

        <Pressable
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveBtnText}>{isEditing ? 'Save Changes' : 'Create Workout'}</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  content: { padding: 20 },
  error: { color: '#FF453A', marginBottom: 12, fontSize: 14 },
  label: { color: '#AAA', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: '#1C1C1E',
    color: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  saveBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
