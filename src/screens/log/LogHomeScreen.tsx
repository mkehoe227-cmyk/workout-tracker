import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../hooks/useAuth';
import { useSplits } from '../../hooks/useSplits';
import { useWorkouts } from '../../hooks/useWorkouts';
import type { LogStackParamList } from '../../navigation/types';
import type { Split, Workout } from '../../types';
import { theme } from '../../theme';

type Nav = NativeStackNavigationProp<LogStackParamList>;

function WorkoutList({
  uid,
  splitId,
  onStart,
}: {
  uid: string;
  splitId: string;
  onStart: (workout: Workout) => void;
}) {
  const { workouts, loading } = useWorkouts(uid, splitId);

  if (loading) {
    return (
      <View style={styles.workoutLoading}>
        <ActivityIndicator size="small" color={theme.colors.accent} />
      </View>
    );
  }

  if (workouts.length === 0) {
    return (
      <Text style={styles.emptyWorkouts}>No workouts in this split</Text>
    );
  }

  return (
    <>
      {workouts.map(workout => (
        <Pressable
          key={workout.id}
          style={styles.workoutRow}
          onPress={() => onStart(workout)}
        >
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutName}>{workout.name}</Text>
            <Text style={styles.workoutMeta}>
              {workout.exercises.length} {workout.exercises.length === 1 ? 'exercise' : 'exercises'}
            </Text>
          </View>
          <Text style={styles.startText}>Start</Text>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      ))}
    </>
  );
}

function SplitSection({
  split,
  uid,
  expanded,
  onToggle,
  onStartWorkout,
}: {
  split: Split;
  uid: string;
  expanded: boolean;
  onToggle: () => void;
  onStartWorkout: (workout: Workout) => void;
}) {
  return (
    <View style={styles.splitSection}>
      <Pressable style={styles.splitHeader} onPress={onToggle}>
        <Text style={styles.splitName}>{split.name}</Text>
        <Text style={styles.chevron}>{expanded ? '∨' : '›'}</Text>
      </Pressable>
      {expanded && (
        <View style={styles.workoutList}>
          <WorkoutList uid={uid} splitId={split.id} onStart={onStartWorkout} />
        </View>
      )}
    </View>
  );
}

export function LogHomeScreen() {
  const { user } = useAuth();
  const nav = useNavigation<Nav>();
  const { splits, loading } = useSplits(user?.uid ?? '');
  const [expandedSplitId, setExpandedSplitId] = useState<string | null>(null);

  function handleToggle(splitId: string) {
    setExpandedSplitId(prev => (prev === splitId ? null : splitId));
  }

  function handleStartWorkout(splitId: string, workout: Workout) {
    nav.navigate('ActiveSession', {
      splitId,
      workoutId: workout.id,
      workoutName: workout.name,
    });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.accent} />
      </View>
    );
  }

  if (splits.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No splits yet</Text>
        <Text style={styles.emptySub}>Create a split in the Plans tab first</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {splits.map(split => (
        <SplitSection
          key={split.id}
          split={split}
          uid={user!.uid}
          expanded={expandedSplitId === split.id}
          onToggle={() => handleToggle(split.id)}
          onStartWorkout={workout => handleStartWorkout(split.id, workout)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.screenPad, paddingBottom: 40 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 32,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    marginBottom: 8,
  },
  emptySub: { color: theme.colors.textSecondary, fontSize: theme.typography.sizes.body },
  splitSection: {
    marginBottom: 12,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  splitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  splitName: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  chevron: {
    color: theme.colors.textTertiary,
    fontSize: 20,
  },
  workoutList: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.separator,
  },
  workoutLoading: {
    padding: 16,
    alignItems: 'center',
  },
  emptyWorkouts: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.base,
    padding: 16,
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.separator,
  },
  workoutInfo: { flex: 1 },
  workoutName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
  },
  workoutMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    marginTop: 2,
  },
  startText: {
    color: theme.colors.accent,
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    marginRight: 6,
  },
  arrow: { color: theme.colors.textTertiary, fontSize: 22 },
});
