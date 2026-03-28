import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Split } from '../types';

export function useSplits(uid: string) {
  const [splits, setSplits] = useState<Split[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, 'users', uid, 'splits'),
      orderBy('updatedAt', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        setSplits(
          snapshot.docs.map(d => {
            const data = d.data();
            return {
              id: d.id,
              name: data.name ?? '',
              description: data.description ?? '',
              createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
              updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
            } as Split;
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
  }, [uid]);

  return { splits, loading, error };
}
