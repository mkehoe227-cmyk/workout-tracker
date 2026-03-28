import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Workout } from '../types';

export function useWorkouts(uid: string, splitId: string) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !splitId) return;
    const q = query(
      collection(db, 'users', uid, 'splits', splitId, 'workouts'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        setWorkouts(
          snapshot.docs.map(d => {
            const data = d.data();
            return {
              id: d.id,
              name: data.name ?? '',
              description: data.description ?? '',
              exercises: data.exercises ?? [],
              createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
              updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
            } as Workout;
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

  return { workouts, loading, error };
}
