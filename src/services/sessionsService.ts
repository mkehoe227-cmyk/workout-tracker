import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { WorkoutSession } from '../types';

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
