import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { WorkoutSession, Split } from '../types';

export async function saveSession(
  uid: string,
  splitId: string,
  session: Omit<WorkoutSession, 'id'>
): Promise<string> {
  const ref = await addDoc(
    collection(db, 'users', uid, 'splits', splitId, 'sessions'),
    {
      workoutId: session.workoutId,
      workoutName: session.workoutName,
      date: session.date,
      exercises: session.exercises,
      completedAt: serverTimestamp(),
    }
  );
  return ref.id;
}

export async function getActiveSplitId(
  uid: string,
  splits: Split[]
): Promise<string | null> {
  if (splits.length === 0) return null;

  let latestSplitId: string | null = null;
  let latestTime = 0;

  await Promise.all(
    splits.map(async split => {
      const q = query(
        collection(db, 'users', uid, 'splits', split.id, 'sessions'),
        orderBy('completedAt', 'desc'),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const completedAt = (snap.docs[0].data().completedAt as Timestamp)?.toMillis() ?? 0;
        if (completedAt > latestTime) {
          latestTime = completedAt;
          latestSplitId = split.id;
        }
      }
    })
  );

  return latestSplitId ?? splits[0].id;
}
