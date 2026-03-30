import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { WorkoutSession } from '../types';

export function useSessions(uid: string, splitId: string) {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !splitId) {
      setSessions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db, 'users', uid, 'splits', splitId, 'sessions'),
      orderBy('completedAt', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        setSessions(
          snapshot.docs.map(d => {
            const data = d.data();
            return {
              id: d.id,
              workoutId: data.workoutId ?? '',
              workoutName: data.workoutName ?? '',
              date: (data.date as Timestamp)?.toDate() ?? new Date(),
              completedAt: (data.completedAt as Timestamp)?.toDate() ?? new Date(),
              exercises: data.exercises ?? [],
            } as WorkoutSession;
          })
        );
        setLoading(false);
      },
      err => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [uid, splitId]);

  return { sessions, loading, error };
}
