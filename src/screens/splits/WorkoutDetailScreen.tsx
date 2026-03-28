import React, { useLayoutEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../hooks/useAuth';
import { useWorkouts } from '../../hooks/useWorkouts';
import { saveExercises, removeExercise, progressMainWeight, progressBackoffWeight } from '../../services/splitsService';
import { ExerciseRow } from '../../components/plans/ExerciseRow';
import type { PlansStackParamList, WorkoutDetailScreenProps } from '../../navigation/types';
import type { Exercise } from '../../types';

type Nav = NativeStackNavigationProp<PlansStackParamList>;

export function WorkoutDetailScreen() {
  const { user } = useAuth();
  const nav = useNavigation<Nav>();
  const route = useRoute<WorkoutDetailScreenProps['route']>();
  const { splitId, workoutId } = route.params;

  const { workouts, loading } = useWorkouts(user?.uid ?? '', splitId);
  const workout = useMemo(() => workouts.find(w => w.id === workoutId), [workouts, workoutId]);

  useLayoutEffect(() => {
    if (workout) {
      nav.setOptions({
        title: workout.name,
        headerRight: () => (
          <Pressable
            hitSlop={8}
            onPress={() => nav.navigate('WorkoutForm', { splitId, workoutId: workout.id })}
          >
            <Text style={styles.headerBtn}>Edit</Text>
          </Pressable>
        ),
      });
    }
  }, [workout]);

  function handleDeleteExercise(exercise: Exercise) {
    if (!workout) return;
    Alert.alert('Remove Exercise', `Remove "${exercise.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          removeExercise(user!.uid, splitId, workoutId, exercise, workout.exercises).catch(() => {}),
      },
    ]);
  }

  function moveExercise(index: number, direction: 'up' | 'down') {
    if (!workout) return;
    const exercises = [...workout.exercises];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= exercises.length) return;
    [exercises[index], exercises[newIndex]] = [exercises[newIndex], exercises[index]];
    saveExercises(user!.uid, splitId, workoutId, exercises).catch(() => {});
  }

  if (loading || !workout) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#6C63FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {workout.description ? (
        <Text style={styles.desc}>{workout.description}</Text>
      ) : null}

      {workout.exercises.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No exercises yet</Text>
          <Text style={styles.emptySub}>Tap "Add Exercise" to get started</Text>
        </View>
      ) : (
        <FlatList
          data={workout.exercises}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <ExerciseRow
              exercise={item}
              onPress={() =>
                nav.navigate('ExerciseForm', { splitId, workoutId, exerciseId: item.id })
              }
              onMoveUp={index > 0 ? () => moveExercise(index, 'up') : undefined}
              onMoveDown={
                index < workout.exercises.length - 1 ? () => moveExercise(index, 'down') : undefined
              }
              onDelete={() => handleDeleteExercise(item)}
              onProgressMain={() =>
                progressMainWeight(user!.uid, splitId, workoutId, item.id, workout.exercises, workouts).catch(() => {})
              }
              onProgressBackoff={() =>
                progressBackoffWeight(user!.uid, splitId, workoutId, item.id, workout.exercises, workouts).catch(() => {})
              }
            />
          )}
        />
      )}

      <Pressable
        style={styles.addBtn}
        onPress={() => nav.navigate('ExercisePicker', { splitId, workoutId })}
      >
        <Text style={styles.addBtnText}>+ Add Exercise</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F0F' },
  headerBtn: { color: '#6C63FF', fontSize: 15, fontWeight: '500' },
  desc: { color: '#AAA', fontSize: 15, margin: 16, marginBottom: 8 },
  list: { padding: 16, paddingBottom: 100 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { color: '#FFF', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySub: { color: '#666', fontSize: 15 },
  addBtn: {
    position: 'absolute',
    bottom: 28,
    left: 24,
    right: 24,
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
