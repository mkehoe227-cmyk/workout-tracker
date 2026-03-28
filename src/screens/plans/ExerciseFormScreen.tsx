import React, { useState, useLayoutEffect, useMemo, useEffect, useRef } from 'react';
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
import { saveExercises, uploadExerciseImage, syncSharedExercise } from '../../services/splitsService';
import { ImagePickerButton } from '../../components/plans/ImagePickerButton';
import type { PlansStackParamList, ExerciseFormScreenProps } from '../../navigation/types';
import type { Exercise } from '../../types';
import { theme } from '../../theme';

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

type Nav = NativeStackNavigationProp<PlansStackParamList>;

const CDN = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';
const INCREMENT_PRESETS = [2.5, 5, 10];

export function ExerciseFormScreen() {
  const { user } = useAuth();
  const nav = useNavigation<Nav>();
  const route = useRoute<ExerciseFormScreenProps['route']>();
  const { splitId, workoutId, exerciseId, template } = route.params;
  const { workouts } = useWorkouts(user?.uid ?? '', splitId);
  const isEditing = !!exerciseId;

  const workout = useMemo(() => workouts.find(w => w.id === workoutId), [workouts, workoutId]);
  const existing = useMemo(
    () => (exerciseId ? workout?.exercises.find(e => e.id === exerciseId) : null),
    [workout, exerciseId]
  );

  const defaultImage = template?.hasImage ? `${CDN}/${template.id}/0.jpg` : null;

  const [name, setName] = useState(existing?.name ?? template?.name ?? '');
  const [mainWeight, setMainWeight] = useState(String(existing?.mainWeight ?? 0));
  const [mainRepTarget, setMainRepTarget] = useState(String(existing?.mainRepTarget ?? 5));
  const [backoffWeight, setBackoffWeight] = useState(String(existing?.backoffWeight ?? 0));
  const [backoffRepTarget, setBackoffRepTarget] = useState(String(existing?.backoffRepTarget ?? 5));
  const [weightIncrement, setWeightIncrement] = useState(existing?.weightIncrement ?? 5);
  const [customIncrement, setCustomIncrement] = useState(
    INCREMENT_PRESETS.includes(existing?.weightIncrement ?? 5)
      ? ''
      : String(existing?.weightIncrement ?? '')
  );
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>(existing?.weightUnit ?? 'lbs');
  const [shared, setShared] = useState<boolean>(existing ? (existing.shared ?? false) : true);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(existing?.imageUrl ?? defaultImage ?? '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    nav.setOptions({ title: isEditing ? 'Edit Exercise' : 'Add Exercise' });
  }, [isEditing]);

  // Populate form fields once exercise data loads from Firestore
  const initialized = useRef(false);
  useEffect(() => {
    if (!existing || initialized.current) return;
    initialized.current = true;
    setName(existing.name);
    setMainWeight(String(existing.mainWeight));
    setMainRepTarget(String(existing.mainRepTarget));
    setBackoffWeight(String(existing.backoffWeight));
    setBackoffRepTarget(String(existing.backoffRepTarget));
    setWeightIncrement(existing.weightIncrement);
    setCustomIncrement(INCREMENT_PRESETS.includes(existing.weightIncrement) ? '' : String(existing.weightIncrement));
    setWeightUnit(existing.weightUnit);
    setShared(existing.shared ?? false);
    setNotes(existing.notes);
    setImageUrl(existing.imageUrl);
  }, [existing]);

  const isCustomIncrement = !INCREMENT_PRESETS.includes(weightIncrement);

  function handleIncrementPreset(val: number) {
    setWeightIncrement(val);
    setCustomIncrement('');
  }

  function handleCustomIncrement(text: string) {
    setCustomIncrement(text);
    const parsed = parseFloat(text);
    if (!isNaN(parsed) && parsed > 0) setWeightIncrement(parsed);
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Exercise name is required');
      return;
    }
    if (!workout) return;
    setSaving(true);
    setError(null);

    try {
      // 1. Resolve ID — auto-link by name if creating a new shared exercise
      let resolvedId = exerciseId ?? generateId();
      const freshId = resolvedId;

      if (!isEditing && shared) {
        const nameLower = name.trim().toLowerCase();
        for (const w of workouts) {
          if (w.id === workoutId) continue;
          const match = w.exercises.find(e => e.shared && e.name.toLowerCase() === nameLower);
          if (match) { resolvedId = match.id; break; }
        }
      }

      // 2. Upload image (uses resolvedId for storage path)
      let finalImageUrl = imageUrl;
      if (localImageUri) {
        setUploading(true);
        finalImageUrl = await uploadExerciseImage(user!.uid, resolvedId, localImageUri);
        setUploading(false);
      } else if (resolvedId !== freshId) {
        // Auto-linked — inherit existing shared image if we don't have one
        const matched = workouts.flatMap(w => w.exercises).find(e => e.id === resolvedId);
        finalImageUrl = matched?.imageUrl ?? imageUrl;
      }

      // 3. Build exercise data
      const exerciseData: Exercise = {
        id: resolvedId,
        shared,
        name: name.trim(),
        mainWeight: parseFloat(mainWeight) || 0,
        mainRepTarget: parseInt(mainRepTarget, 10) || 0,
        backoffWeight: parseFloat(backoffWeight) || 0,
        backoffRepTarget: parseInt(backoffRepTarget, 10) || 0,
        weightIncrement,
        readyToProgress: existing?.readyToProgress ?? false,
        weightUnit,
        notes: notes.trim(),
        imageUrl: finalImageUrl,
      };

      // 4. Save
      if (isEditing && exerciseId) {
        if (shared) {
          await syncSharedExercise(user!.uid, splitId, exerciseId, exerciseData, workouts);
        } else {
          const updated = workout.exercises.map(e => e.id === exerciseId ? exerciseData : e);
          await saveExercises(user!.uid, splitId, workoutId, updated);
        }
      } else {
        await saveExercises(user!.uid, splitId, workoutId, [...workout.exercises, exerciseData]);
      }

      nav.goBack();
    } catch (e: any) {
      setError(e.message ?? 'Failed to save exercise');
      setUploading(false);
      setSaving(false);
    }
  }

  const displayImage = localImageUri || imageUrl || null;

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

        <ImagePickerButton
          imageUri={displayImage}
          uploading={uploading}
          onPicked={uri => setLocalImageUri(uri)}
          label={template ? 'Upload your own photo' : 'Add photo'}
        />

        <Text style={styles.label}>Exercise Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Barbell Bench Press"
          placeholderTextColor={theme.colors.textTertiary}
          color={theme.colors.textPrimary}
        />

        <Text style={styles.label}>Sync Across Workouts</Text>
        <View style={styles.unitRow}>
          <Pressable
            style={[styles.unitBtn, shared && styles.unitBtnActive]}
            onPress={() => setShared(true)}
          >
            <Text style={[styles.unitBtnText, shared && styles.unitBtnTextActive]}>Shared</Text>
          </Pressable>
          <Pressable
            style={[styles.unitBtn, !shared && styles.unitBtnActive]}
            onPress={() => setShared(false)}
          >
            <Text style={[styles.unitBtnText, !shared && styles.unitBtnTextActive]}>Independent</Text>
          </Pressable>
        </View>

        {/* Main Set */}
        <Text style={styles.sectionHeader}>Main Set</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Weight</Text>
            <TextInput
              style={styles.input}
              value={mainWeight}
              onChangeText={setMainWeight}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={theme.colors.textTertiary}
              color={theme.colors.textPrimary}
              selectTextOnFocus
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Rep Goal</Text>
            <TextInput
              style={styles.input}
              value={mainRepTarget}
              onChangeText={setMainRepTarget}
              keyboardType="number-pad"
              placeholder="5"
              placeholderTextColor={theme.colors.textTertiary}
              color={theme.colors.textPrimary}
              selectTextOnFocus
            />
          </View>
        </View>

        {/* Backoff Set */}
        <Text style={styles.sectionHeader}>Backoff Set</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Weight</Text>
            <TextInput
              style={styles.input}
              value={backoffWeight}
              onChangeText={setBackoffWeight}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={theme.colors.textTertiary}
              color={theme.colors.textPrimary}
              selectTextOnFocus
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Rep Goal</Text>
            <TextInput
              style={styles.input}
              value={backoffRepTarget}
              onChangeText={setBackoffRepTarget}
              keyboardType="number-pad"
              placeholder="5"
              placeholderTextColor={theme.colors.textTertiary}
              color={theme.colors.textPrimary}
              selectTextOnFocus
            />
          </View>
        </View>

        {/* Unit */}
        <Text style={styles.label}>Unit</Text>
        <View style={styles.unitRow}>
          <Pressable
            style={[styles.unitBtn, weightUnit === 'lbs' && styles.unitBtnActive]}
            onPress={() => setWeightUnit('lbs')}
          >
            <Text style={[styles.unitBtnText, weightUnit === 'lbs' && styles.unitBtnTextActive]}>lbs</Text>
          </Pressable>
          <Pressable
            style={[styles.unitBtn, weightUnit === 'kg' && styles.unitBtnActive]}
            onPress={() => setWeightUnit('kg')}
          >
            <Text style={[styles.unitBtnText, weightUnit === 'kg' && styles.unitBtnTextActive]}>kg</Text>
          </Pressable>
        </View>

        {/* Progression */}
        <Text style={styles.sectionHeader}>Progression</Text>
        <Text style={styles.label}>Weight Increment ({weightUnit})</Text>
        <View style={styles.incrementRow}>
          {INCREMENT_PRESETS.map(val => (
            <Pressable
              key={val}
              style={[styles.incrementBtn, weightIncrement === val && !isCustomIncrement && styles.incrementBtnActive]}
              onPress={() => handleIncrementPreset(val)}
            >
              <Text style={[styles.incrementBtnText, weightIncrement === val && !isCustomIncrement && styles.incrementBtnTextActive]}>
                +{val}
              </Text>
            </Pressable>
          ))}
          <TextInput
            style={[styles.incrementInput, isCustomIncrement && styles.incrementInputActive]}
            value={customIncrement}
            onChangeText={handleCustomIncrement}
            keyboardType="decimal-pad"
            placeholder="Custom"
            placeholderTextColor={theme.colors.textTertiary}
            color={theme.colors.textPrimary}
          />
        </View>

        {/* Notes */}
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional notes (e.g. grip width, cues)"
          placeholderTextColor={theme.colors.textTertiary}
          color={theme.colors.textPrimary}
          multiline
          numberOfLines={3}
        />

        <Pressable
          style={[styles.saveBtn, (saving || uploading) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving || uploading}
        >
          {saving || uploading ? (
            <ActivityIndicator color={theme.colors.textOnAccent} />
          ) : (
            <Text style={styles.saveBtnText}>{isEditing ? 'Save Changes' : 'Add Exercise'}</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.xl, paddingBottom: 40 },
  error: { color: theme.colors.error, marginBottom: 12, fontSize: 14 },
  sectionHeader: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: theme.spacing.xxxl,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  unitRow: { flexDirection: 'row', gap: 8 },
  unitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  unitBtnActive: { borderColor: theme.colors.accent, backgroundColor: theme.colors.accentMuted },
  unitBtnText: { color: theme.colors.textSecondary, fontSize: 15, fontWeight: '500' },
  unitBtnTextActive: { color: theme.colors.accent },
  incrementRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  incrementBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  incrementBtnActive: { borderColor: theme.colors.accent, backgroundColor: theme.colors.accentMuted },
  incrementBtnText: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: '500' },
  incrementBtnTextActive: { color: theme.colors.accent },
  incrementInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    textAlign: 'center',
  },
  incrementInputActive: { borderColor: theme.colors.accent },
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
