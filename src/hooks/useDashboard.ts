import { useState, useEffect, useMemo } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import { useSplits } from './useSplits';
import { useWorkouts } from './useWorkouts';
import { useSessions } from './useSessions';
import { getActiveSplitId } from '../services/sessionsService';
import { isInCurrentWeek } from '../utils/weekHelpers';
import type { Split, WorkoutSession } from '../types';

export function useDashboard() {
  const { user } = useAuth();
  const uid = user?.uid ?? '';
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
      return;
    }
    if (!uid) return;
    getDoc(doc(db, 'users', uid)).then(snap => {
      const name = snap.data()?.displayName;
      if (name) setDisplayName(name);
    });
  }, [uid, user?.displayName]);

  const { splits, loading: splitsLoading } = useSplits(uid);
  const [activeSplitId, setActiveSplitId] = useState('');
  const [activeSplitResolved, setActiveSplitResolved] = useState(false);

  // Determine active split once splits are loaded
  useEffect(() => {
    if (splitsLoading || splits.length === 0) return;
    getActiveSplitId(uid, splits).then(id => {
      setActiveSplitId(id ?? '');
      setActiveSplitResolved(true);
    });
  }, [uid, splitsLoading, splits.map(s => s.id).join(',')]);

  const activeSplit: Split | null = splits.find(s => s.id === activeSplitId) ?? null;

  const { sessions, loading: sessionsLoading } = useSessions(uid, activeSplitId);
  const { workouts, loading: workoutsLoading } = useWorkouts(uid, activeSplitId);

  const loading = splitsLoading || !activeSplitResolved || sessionsLoading || workoutsLoading;

  const isEmpty = !loading && sessions.length === 0;

  const sessionsThisWeek = useMemo(
    () => sessions.filter(s => isInCurrentWeek(s.completedAt)).length,
    [sessions]
  );

  const progressionsThisWeek = useMemo(
    () =>
      sessions
        .filter(s => isInCurrentWeek(s.completedAt))
        .reduce((sum, s) => sum + s.exercises.filter(e => e.progressed).length, 0),
    [sessions]
  );

  const nextWorkout = useMemo(() => {
    if (workouts.length === 0) return null;
    if (sessions.length === 0) {
      const w = workouts[0];
      return { splitId: activeSplitId, workoutId: w.id, workoutName: w.name };
    }
    const lastWorkoutId = sessions[0].workoutId;
    const idx = workouts.findIndex(w => w.id === lastWorkoutId);
    const next = workouts[(idx + 1) % workouts.length];
    return { splitId: activeSplitId, workoutId: next.id, workoutName: next.name };
  }, [sessions, workouts, activeSplitId]);

  const recentSessions: WorkoutSession[] = sessions.slice(0, 5);

  return {
    displayName,
    activeSplit,
    sessionsThisWeek,
    progressionsThisWeek,
    nextWorkout,
    recentSessions,
    loading,
    isEmpty,
  };
}
