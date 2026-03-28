import React, { useState, useLayoutEffect, useMemo } from 'react';
import {
  View,
  Text,
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
import { TextInput } from '../../components/ui/TextInput';
import { theme } from '../../theme';

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

        <TextInput
          label="Workout Name *"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Push Day, Leg Day, Upper Body"
          autoFocus={!isEditing}
        />

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Optional notes about this workout"
          multiline
          numberOfLines={3}
          style={styles.multiline}
        />

        <Pressable
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={theme.colors.textOnAccent} />
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
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.xl },
  error: { color: theme.colors.error, marginBottom: 12, fontSize: 14 },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  saveBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: theme.colors.textOnAccent, fontSize: 16, fontWeight: '600' },
});
