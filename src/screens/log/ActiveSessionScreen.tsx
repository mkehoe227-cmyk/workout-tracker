import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../hooks/useAuth';
import { useWorkouts } from '../../hooks/useWorkouts';
import { progressMainWeight, progressBackoffWeight } from '../../services/splitsService';
import { saveSession } from '../../services/sessionsService';
import type { LogStackParamList, ActiveSessionScreenProps } from '../../navigation/types';
import type { Exercise, SessionExercise, SessionSet } from '../../types';
import { theme } from '../../theme';

type Nav = NativeStackNavigationProp<LogStackParamList>;

export function ActiveSessionScreen() {
  const { user } = useAuth();
  const nav = useNavigation<Nav>();
  const route = useRoute<ActiveSessionScreenProps['route']>();
  const { splitId, workoutId, workoutName } = route.params;

  const { workouts, loading } = useWorkouts(user?.uid ?? '', splitId);
  const workout = useMemo(() => workouts.find(w => w.id === workoutId), [workouts, workoutId]);

  const [initialized, setInitialized] = useState(false);
  const [queue, setQueue] = useState<Exercise[]>([]);
  const [completedExercises, setCompletedExercises] = useState<SessionExercise[]>([]);
  // pendingSets holds the main set logged for the current exercise, until backoff is also done
  const [pendingSets, setPendingSets] = useState<SessionSet[]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState<0 | 1>(0); // 0=main, 1=backoff
  const [repsInput, setRepsInput] = useState('');
  const [progressedSetMap, setProgressedSetMap] = useState<Map<string, ('main' | 'backoff')[]>>(new Map());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialized && workout && workout.exercises.length > 0) {
      setQueue([...workout.exercises]);
      setRepsInput(String(Math.max(0, workout.exercises[0].mainRepTarget - 1)));
      setInitialized(true);
    }
  }, [workout, initialized]);

  const currentExercise = queue[0] ?? null;
  const isMainSet = currentSetIndex === 0;
  const currentWeight = currentExercise
    ? isMainSet ? currentExercise.mainWeight : currentExercise.backoffWeight
    : 0;
  const currentTarget = currentExercise
    ? isMainSet ? currentExercise.mainRepTarget : currentExercise.backoffRepTarget
    : 0;

  function handleBack() {
    Alert.alert(
      'End Workout',
      'End this workout? Progress will not be saved.',
      [
        { text: 'Keep Going', style: 'cancel' },
        { text: 'End Workout', style: 'destructive', onPress: () => nav.goBack() },
      ]
    );
  }

  function adjustReps(delta: number) {
    const current = parseInt(repsInput, 10) || 0;
    setRepsInput(String(Math.max(0, current + delta)));
  }

  async function finishSession(exercises: SessionExercise[]) {
    setSaving(true);
    const now = new Date();
    await saveSession(user!.uid, splitId, {
      workoutId,
      workoutName,
      date: now,
      completedAt: now,
      exercises,
    }).catch(() => {});
    setSaving(false);
    nav.replace('SessionSummary', { splitId, exercises, workoutName });
  }

  async function handleDone() {
    if (!currentExercise) return;
    const reps = parseInt(repsInput, 10) || 0;
    const set: SessionSet = {
      setType: isMainSet ? 'main' : 'backoff',
      weight: currentWeight,
      reps,
    };

    // Track progression locally to avoid stale closure after async Alert
    let didProgressThisSet = false;
    let progressedThisSetType: 'main' | 'backoff' | null = null;

    // Progression check
    if (reps >= currentTarget) {
      await new Promise<void>(resolve => {
        Alert.alert(
          'Hit Your Reps!',
          `Increase ${isMainSet ? 'main' : 'backoff'} weight by ${currentExercise.weightIncrement}${currentExercise.weightUnit}?`,
          [
            { text: 'Not Yet', style: 'cancel', onPress: () => resolve() },
            {
              text: 'Yes, Increase',
              onPress: async () => {
                if (isMainSet) {
                  await progressMainWeight(user!.uid, splitId, workoutId, currentExercise.id, workout!.exercises, workouts).catch(() => {});
                } else {
                  await progressBackoffWeight(user!.uid, splitId, workoutId, currentExercise.id, workout!.exercises, workouts).catch(() => {});
                }
                didProgressThisSet = true;
                progressedThisSetType = isMainSet ? 'main' : 'backoff';
                setProgressedSetMap(prev => {
                  const n = new Map(prev);
                  const setType: 'main' | 'backoff' = isMainSet ? 'main' : 'backoff';
                  n.set(currentExercise.id, [...(n.get(currentExercise.id) ?? []), setType]);
                  return n;
                });
                resolve();
              },
            },
          ]
        );
      });
    }

    if (isMainSet) {
      // Store main set and advance to backoff
      setPendingSets([set]);
      setCurrentSetIndex(1);
      setRepsInput(String(Math.max(0, currentExercise.backoffRepTarget - 1)));
    } else {
      // Both sets done — complete this exercise
      const allSets = [...pendingSets, set];
      const fromState = progressedSetMap.get(currentExercise.id) ?? [];
      const progressedSetTypes: ('main' | 'backoff')[] =
        didProgressThisSet && progressedThisSetType && !fromState.includes(progressedThisSetType)
          ? [...fromState, progressedThisSetType]
          : fromState;

      const sessionExercise: SessionExercise = {
        exerciseId: currentExercise.id,
        name: currentExercise.name,
        sets: allSets,
        progressed: progressedSetTypes.length > 0,
        progressedSetTypes,
      };

      const newCompleted = [...completedExercises, sessionExercise];
      const newQueue = queue.slice(1);

      setCompletedExercises(newCompleted);
      setPendingSets([]);

      if (newQueue.length === 0) {
        await finishSession(newCompleted);
      } else {
        setQueue(newQueue);
        setCurrentSetIndex(0);
        setRepsInput(String(Math.max(0, newQueue[0].mainRepTarget - 1)));
      }
    }
  }

  function handlePushBack() {
    if (queue.length <= 1) return;
    // Swap current exercise with next in queue; reset set state
    setQueue([queue[1], queue[0], ...queue.slice(2)]);
    setCurrentSetIndex(0);
    setPendingSets([]);
    setRepsInput(String(Math.max(0, queue[1].mainRepTarget - 1)));
  }

  function handleSkip() {
    Alert.alert(
      'Skip Exercise',
      `Skip ${currentExercise?.name}? It won't be logged for this session.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: async () => {
            const newQueue = queue.slice(1);
            setPendingSets([]);
            if (newQueue.length === 0) {
              await finishSession(completedExercises);
            } else {
              setQueue(newQueue);
              setCurrentSetIndex(0);
              setRepsInput(String(Math.max(0, newQueue[0].mainRepTarget - 1)));
            }
          },
        },
      ]
    );
  }

  if (loading || !initialized || saving) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color={theme.colors.accent} size="large" />
        {saving && <Text style={styles.savingText}>Saving session…</Text>}
      </SafeAreaView>
    );
  }

  if (!currentExercise) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={8}>
          <Text style={styles.headerBack}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{workoutName}</Text>
        <Text style={styles.headerCount}>
          {completedExercises.length + 1}/{completedExercises.length + queue.length}
        </Text>
      </View>

      {/* Exercise card */}
      <View style={styles.card}>
        {/* Exercise info row: 80×80 thumbnail + details */}
        <View style={styles.exerciseRow}>
          {currentExercise.imageUrl ? (
            <Image source={{ uri: currentExercise.imageUrl }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
              <Text style={styles.thumbnailLetter}>
                {currentExercise.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{currentExercise.name}</Text>
            <Text style={styles.setLabel}>
              {isMainSet ? 'Main Set' : 'Backoff Set'}
            </Text>
            <Text style={styles.weight}>
              {currentWeight} {currentExercise.weightUnit}
            </Text>
            <Text style={styles.target}>Target: {currentTarget} reps</Text>
          </View>
        </View>

        {/* Reps stepper */}
        <View style={styles.stepper}>
          <Pressable style={styles.stepBtn} onPress={() => adjustReps(-1)}>
            <Text style={styles.stepBtnText}>–</Text>
          </Pressable>
          <TextInput
            style={styles.repsInput}
            value={repsInput}
            onChangeText={setRepsInput}
            keyboardType="number-pad"
            selectTextOnFocus
          />
          <Pressable style={styles.stepBtn} onPress={() => adjustReps(1)}>
            <Text style={styles.stepBtnText}>+</Text>
          </Pressable>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <Pressable style={styles.doneBtn} onPress={handleDone}>
            <Text style={styles.doneBtnText}>✓ Done</Text>
          </Pressable>
          <Pressable
            style={[styles.pushBtn, queue.length <= 1 && styles.pushBtnDisabled]}
            onPress={handlePushBack}
            disabled={queue.length <= 1}
          >
            <Text style={[styles.pushBtnText, queue.length <= 1 && styles.pushBtnTextDisabled]}>
              Push Back ▼
            </Text>
          </Pressable>
        </View>

        <Pressable onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip Exercise</Text>
        </Pressable>
      </View>

      {/* Queue strip */}
      <View style={styles.queueStrip}>
        {queue.length > 1 ? (
          <>
            <Text style={styles.queueLabel}>Up next: </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={styles.queueItems}>
                {queue.slice(1).map(e => e.name).join('  ·  ')}
              </Text>
            </ScrollView>
          </>
        ) : (
          <Text style={styles.queueLabel}>Last exercise</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  savingText: {
    color: theme.colors.textSecondary,
    marginTop: 12,
    fontSize: theme.typography.sizes.body,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.screenPad,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerBack: {
    color: theme.colors.textSecondary,
    fontSize: 18,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
  },
  headerCount: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.base,
  },
  card: {
    flex: 1,
    padding: theme.spacing.screenPad,
    justifyContent: 'center',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 36,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: theme.radii.md,
    marginRight: 16,
    backgroundColor: theme.colors.surface,
  },
  thumbnailPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  thumbnailLetter: {
    color: theme.colors.accent,
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
  },
  exerciseInfo: { flex: 1 },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    marginBottom: 4,
  },
  setLabel: {
    color: theme.colors.accent,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    marginBottom: 4,
  },
  weight: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: 2,
  },
  target: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.base,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    gap: 20,
  },
  stepBtn: {
    width: 52,
    height: 52,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 26,
    lineHeight: 30,
  },
  repsInput: {
    width: 90,
    textAlign: 'center',
    color: theme.colors.textPrimary,
    fontSize: 48,
    fontWeight: theme.typography.weights.bold,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  doneBtn: {
    flex: 1,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneBtnText: {
    color: theme.colors.textOnAccent,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
  },
  pushBtn: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pushBtnDisabled: { opacity: 0.4 },
  pushBtnText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
  },
  pushBtnTextDisabled: { color: theme.colors.textTertiary },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipText: {
    color: theme.colors.textTertiary,
    fontSize: theme.typography.sizes.base,
  },
  queueStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.screenPad,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceDim,
  },
  queueLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.base,
    flexShrink: 0,
  },
  queueItems: {
    color: theme.colors.textTertiary,
    fontSize: theme.typography.sizes.base,
  },
});
