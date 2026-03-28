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
import { useSplits } from '../../hooks/useSplits';
import { useWorkouts } from '../../hooks/useWorkouts';
import { deleteSplit, deleteWorkout } from '../../services/splitsService';
import type { PlansStackParamList, SplitDetailScreenProps } from '../../navigation/types';
import type { Workout } from '../../types';

type Nav = NativeStackNavigationProp<PlansStackParamList>;

export function SplitDetailScreen() {
  const { user } = useAuth();
  const nav = useNavigation<Nav>();
  const route = useRoute<SplitDetailScreenProps['route']>();
  const { splitId } = route.params;

  const { splits } = useSplits(user?.uid ?? '');
  const { workouts, loading } = useWorkouts(user?.uid ?? '', splitId);

  const split = useMemo(() => splits.find(s => s.id === splitId), [splits, splitId]);

  useLayoutEffect(() => {
    if (split) {
      nav.setOptions({
        title: split.name,
        headerRight: () => (
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Pressable
              hitSlop={8}
              onPress={() => nav.navigate('SplitForm', { splitId: split.id })}
            >
              <Text style={styles.headerBtn}>Edit</Text>
            </Pressable>
            <Pressable hitSlop={8} onPress={handleDeleteSplit}>
              <Text style={[styles.headerBtn, { color: '#FF453A' }]}>Delete</Text>
            </Pressable>
          </View>
        ),
      });
    }
  }, [split]);

  function handleDeleteSplit() {
    if (!split) return;
    Alert.alert(
      'Delete Split',
      `Delete "${split.name}" and all its workouts? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSplit(user!.uid, split).catch(() => {});
            nav.goBack();
          },
        },
      ]
    );
  }

  function handleDeleteWorkout(workout: Workout) {
    Alert.alert('Delete Workout', `Delete "${workout.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteWorkout(user!.uid, splitId, workout.id, workout.exercises).catch(() => {}),
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#6C63FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {split?.description ? (
        <Text style={styles.desc}>{split.description}</Text>
      ) : null}

      {workouts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No workouts yet</Text>
          <Text style={styles.emptySub}>Tap + to add your first workout</Text>
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <WorkoutCard
              workout={item}
              onPress={() => nav.navigate('WorkoutDetail', { splitId, workoutId: item.id })}
              onDelete={() => handleDeleteWorkout(item)}
            />
          )}
        />
      )}

      <Pressable
        style={styles.fab}
        onPress={() => nav.navigate('WorkoutForm', { splitId })}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

function WorkoutCard({
  workout,
  onPress,
  onDelete,
}: {
  workout: Workout;
  onPress: () => void;
  onDelete: () => void;
}) {
  const count = workout.exercises.length;
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardMain}>
        <Text style={styles.cardName}>{workout.name}</Text>
        <Text style={styles.cardMeta}>
          {count} {count === 1 ? 'exercise' : 'exercises'}
        </Text>
      </View>
      <Pressable onPress={onDelete} hitSlop={8} style={styles.deleteBtn}>
        <Text style={styles.deleteText}>✕</Text>
      </Pressable>
      <Text style={styles.cardArrow}>›</Text>
    </Pressable>
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardMain: { flex: 1 },
  cardName: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  cardMeta: { color: '#888', fontSize: 13, marginTop: 3 },
  deleteBtn: { padding: 4, marginRight: 8 },
  deleteText: { color: '#FF453A', fontSize: 15 },
  cardArrow: { color: '#555', fontSize: 22 },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { color: '#FFF', fontSize: 28, lineHeight: 32 },
});
