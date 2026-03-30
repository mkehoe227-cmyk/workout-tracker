import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { AppTabParamList } from '../../navigation/types';
import { useDashboard } from '../../hooks/useDashboard';
import { theme } from '../../theme';
import type { WorkoutSession } from '../../types';

type Nav = BottomTabNavigationProp<AppTabParamList>;

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function SessionRow({ session }: { session: WorkoutSession }) {
  const progressionCount = session.exercises.filter(e => e.progressed).length;
  return (
    <View style={styles.sessionRow}>
      <View style={styles.sessionLeft}>
        <Text style={styles.sessionName}>{session.workoutName}</Text>
        {progressionCount > 0 && (
          <Text style={styles.sessionProgressions}>
            ↑ {progressionCount} {progressionCount === 1 ? 'increase' : 'increases'}
          </Text>
        )}
      </View>
      <Text style={styles.sessionDate}>{formatDate(session.completedAt)}</Text>
    </View>
  );
}

export function DashboardScreen() {
  const nav = useNavigation<Nav>();
  const {
    displayName,
    activeSplit,
    sessionsThisWeek,
    progressionsThisWeek,
    nextWorkout,
    recentSessions,
    loading,
    isEmpty,
  } = useDashboard();

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color={theme.colors.accent} size="large" />
      </SafeAreaView>
    );
  }

  if (isEmpty) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Welcome to Workout Tracker</Text>
        <Text style={styles.emptySub}>Log your first workout to see stats here.</Text>
        <Pressable style={styles.emptyBtn} onPress={() => nav.navigate('Log')}>
          <Text style={styles.emptyBtnText}>Start a Workout</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Welcome header */}
        <View style={styles.headerSection}>
          <Text style={styles.welcomeText}>Welcome back, {displayName}</Text>
          {activeSplit && (
            <Text style={styles.splitName}>{activeSplit.name}</Text>
          )}
        </View>

        {/* Weekly stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{sessionsThisWeek}</Text>
            <Text style={styles.statLabel}>Sessions{'\n'}this week</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{progressionsThisWeek}</Text>
            <Text style={styles.statLabel}>Progressions{'\n'}this week</Text>
          </View>
        </View>

        {/* Quick-start */}
        {nextWorkout && (
          <Pressable
            style={styles.quickStartBtn}
            onPress={() =>
              nav.navigate('Log', {
                screen: 'ActiveSession',
                params: {
                  splitId: nextWorkout.splitId,
                  workoutId: nextWorkout.workoutId,
                  workoutName: nextWorkout.workoutName,
                },
              } as any)
            }
          >
            <Text style={styles.quickStartText}>▶  Start {nextWorkout.workoutName}</Text>
          </Pressable>
        )}

        {/* Recent sessions */}
        {recentSessions.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            <View style={styles.sessionCard}>
              {recentSessions.map((s, i) => (
                <View key={s.id}>
                  {i > 0 && <View style={styles.separator} />}
                  <SessionRow session={s} />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.screenPad,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySub: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.body,
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  emptyBtnText: {
    color: theme.colors.textOnAccent,
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
  },
  content: {
    padding: theme.spacing.screenPad,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.sm,
  },
  welcomeText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    marginBottom: 4,
  },
  splitName: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.body,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
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
    color: theme.colors.accent,
    fontSize: theme.typography.sizes.display,
    fontWeight: theme.typography.weights.bold,
    marginBottom: 4,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 17,
  },
  quickStartBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  quickStartText: {
    color: theme.colors.textOnAccent,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
  },
  recentSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.md,
  },
  sessionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.lg,
  },
  sessionLeft: { flex: 1, marginRight: 12 },
  sessionName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    marginBottom: 3,
  },
  sessionProgressions: {
    color: theme.colors.accent,
    fontSize: theme.typography.sizes.sm,
  },
  sessionDate: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.base,
    flexShrink: 0,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.separator,
    marginHorizontal: theme.spacing.lg,
  },
});
