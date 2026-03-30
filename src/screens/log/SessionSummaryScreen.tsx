import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LogStackParamList, SessionSummaryScreenProps } from '../../navigation/types';
import { theme } from '../../theme';

type Nav = NativeStackNavigationProp<LogStackParamList>;

export function SessionSummaryScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<SessionSummaryScreenProps['route']>();
  const { exercises, workoutName } = route.params;

  const totalSets = useMemo(
    () => exercises.reduce((sum, e) => sum + e.sets.length, 0),
    [exercises]
  );

  const totalVolumeTons = useMemo(() => {
    const totalLbs = exercises.reduce(
      (sum, e) => sum + e.sets.reduce((s, set) => s + set.weight * set.reps, 0),
      0
    );
    return Math.round(totalLbs / 200) / 10; // round to tenths
  }, [exercises]);

  const progressedExercises = useMemo(
    () => exercises.filter(e => e.progressed),
    [exercises]
  );

  function getProgressDescription(e: typeof exercises[0]) {
    const { name, progressedSetTypes } = e;
    if (!progressedSetTypes || progressedSetTypes.length === 0) return name;
    return `${name} (${progressedSetTypes.join(' & ')})`;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.successIcon}>
          <Text style={styles.successEmoji}>✓</Text>
        </View>
        <Text style={styles.title}>Workout Complete</Text>
        <Text style={styles.workoutName}>{workoutName}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalSets}</Text>
            <Text style={styles.statLabel}>{totalSets === 1 ? 'Set' : 'Sets'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalVolumeTons}</Text>
            <Text style={styles.statLabel}>Tons Lifted</Text>
          </View>
        </View>

        {/* Progression highlights */}
        {progressedExercises.length > 0 && (
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Weight Increased</Text>
            {progressedExercises.map(e => (
              <View key={e.exerciseId} style={styles.progressRow}>
                <Text style={styles.progressBullet}>↑</Text>
                <Text style={styles.progressText}>
                  {getProgressDescription(e)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Exercise list */}
        <View style={styles.exerciseSection}>
          <Text style={styles.sectionTitle}>Exercises Logged</Text>
          {exercises.map(e => (
            <View key={e.exerciseId} style={styles.exerciseRow}>
              <Text style={styles.exerciseName}>{e.name}</Text>
              <Text style={styles.exerciseSets}>
                {e.sets.map(s => `${s.reps}`).join(' / ')} reps
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.doneBtn} onPress={() => nav.popToTop()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    padding: theme.spacing.screenPad,
    paddingBottom: 40,
    alignItems: 'center',
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.accentMuted,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  successEmoji: {
    color: theme.colors.accent,
    fontSize: 32,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    marginBottom: 6,
  },
  workoutName: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.lg,
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
    marginBottom: 24,
    overflow: 'hidden',
  },
  statBox: {
    flex: 1,
    paddingVertical: 20,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.display,
    fontWeight: theme.typography.weights.bold,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.base,
    marginTop: 4,
  },
  progressSection: {
    width: '100%',
    backgroundColor: theme.colors.accentMuted,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.successBorder,
    padding: 16,
    marginBottom: 24,
  },
  progressTitle: {
    color: theme.colors.accent,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  progressBullet: {
    color: theme.colors.accent,
    fontSize: theme.typography.sizes.body,
    marginRight: 8,
    lineHeight: 20,
  },
  progressText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.body,
    flex: 1,
  },
  exerciseSection: {
    width: '100%',
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.body,
    flex: 1,
  },
  exerciseSets: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.base,
  },
  footer: {
    padding: theme.spacing.screenPad,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  doneBtn: {
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
});
